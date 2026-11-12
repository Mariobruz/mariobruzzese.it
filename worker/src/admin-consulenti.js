/**
 * admin-consulenti.js — API del pannello per consulenti, codici sconto e pagamenti.
 * Le chiama admin.js dopo aver verificato l'accesso (Cloudflare Access).
 */
import {
  STATI_CONSULENTE, centesimi, creaCodice, cruscotto, csvCruscotto, elencoConsulenti,
  normalizzaCodice, registraPagamento,
} from './consulenti-dati';
import { emailConsulenteAttivato } from './email-consulenti';
import { inviaEmail } from './email';

const testo = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
const percentuale = (v, def) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? centesimi(n) : def;
};

function datiConsulente(corpo) {
  const d = {
    nome: testo(corpo.nome, 60), cognome: testo(corpo.cognome, 60), ragioneSociale: testo(corpo.ragioneSociale, 150),
    pivaCf: testo(corpo.pivaCf, 20).toUpperCase(), pec: testo(corpo.pec, 120).toLowerCase(),
    email: testo(corpo.email, 120).toLowerCase(), telefono: testo(corpo.telefono, 25), note: testo(corpo.note, 1000),
    compensoPct: percentuale(corpo.compensoPct, 40),
    stato: STATI_CONSULENTE.includes(corpo.stato) ? corpo.stato : 'in_attesa_contratto',
  };
  const errori = [];
  if (!d.nome) errori.push('Il nome è obbligatorio');
  if (!d.cognome) errori.push('Il cognome è obbligatorio');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errori.push('Email non valida');
  if (/[<>]/.test(Object.values(d).join(''))) errori.push('Caratteri non ammessi');
  return { d, errori };
}

/** Email al consulente appena attivato, con i suoi codici. true se partita. */
async function avvisaAttivazione(env, id) {
  if (!env.BREVO_API_KEY) return false;
  const c = await env.DB.prepare('SELECT * FROM consulenti WHERE id = ?').bind(id).first();
  const k = await env.DB.prepare('SELECT codice, sconto_pct FROM codici_sconto WHERE consulente_id = ? AND attivo = 1').bind(id).all();
  const codici = (k.results || []).map((x) => ({ codice: x.codice, scontoPct: x.sconto_pct }));
  if (!c || !codici.length) return false;
  try {
    await inviaEmail(env, emailConsulenteAttivato({
      consulente: c, codici, areaUrl: env.AREA_CONSULENTI_URL || 'https://area-consulenti.mario-bruz.workers.dev',
    }));
    return true;
  } catch (e) {
    console.error('email attivazione consulente', e.message);
    return false;
  }
}

async function leggiCorpo(richiesta) {
  try { return await richiesta.json(); } catch (e) { return {}; }
}

/**
 * Gestisce le rotte /api/consulenti… e /api/codici…; restituisce null se la rotta non è sua.
 * `risposta(corpo, stato, tipo, extra)` è l'helper di admin.js (intestazioni di sicurezza comprese).
 */
export async function apiConsulenti(env, richiesta, url, metodo, utente, risposta) {
  const { pathname } = url;
  const q = url.searchParams;

  if (pathname === '/api/consulenti' && metodo === 'GET') {
    return risposta(await elencoConsulenti(env, q.get('da'), q.get('a')));
  }

  if (pathname === '/api/consulenti' && metodo === 'POST') {
    const corpo = await leggiCorpo(richiesta);
    const { d, errori } = datiConsulente(corpo);
    if (errori.length) return risposta({ errore: errori.join('. ') }, 400);
    const esiste = await env.DB.prepare('SELECT id FROM consulenti WHERE email = ?').bind(d.email).first();
    if (esiste) return risposta({ errore: 'Esiste già un consulente con questa email' }, 409);
    const r = await env.DB.prepare(
      `INSERT INTO consulenti (nome, cognome, ragione_sociale, piva_cf, pec, email, telefono, compenso_pct, stato, note, creato_il)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(d.nome, d.cognome, d.ragioneSociale, d.pivaCf, d.pec, d.email, d.telefono, d.compensoPct, d.stato, d.note,
      new Date().toISOString()).run();
    const id = r.meta.last_row_id;
    const codice = await creaCodice(env, { base: d.cognome, scontoPct: percentuale(corpo.scontoPct, 20), consulenteId: id });
    console.log('consulente creato', id, codice, utente);
    const emailInviata = d.stato === 'attivo' ? await avvisaAttivazione(env, id) : false;
    return risposta({ ok: true, id, codice, emailInviata });
  }

  let m = pathname.match(/^\/api\/consulenti\/(\d+)$/);
  if (m && metodo === 'GET') {
    const dati = await cruscotto(env, Number(m[1]), q.get('da'), q.get('a'), { conNote: true });
    return dati ? risposta(dati) : risposta({ errore: 'Consulente non trovato' }, 404);
  }
  if (m && metodo === 'POST') {
    const corpo = await leggiCorpo(richiesta);
    const { d, errori } = datiConsulente(corpo);
    if (errori.length) return risposta({ errore: errori.join('. ') }, 400);
    const altro = await env.DB.prepare('SELECT id FROM consulenti WHERE email = ? AND id <> ?').bind(d.email, Number(m[1])).first();
    if (altro) return risposta({ errore: 'Questa email è già di un altro consulente' }, 409);
    const prima = await env.DB.prepare('SELECT stato FROM consulenti WHERE id = ?').bind(Number(m[1])).first();
    const r = await env.DB.prepare(
      `UPDATE consulenti SET nome = ?, cognome = ?, ragione_sociale = ?, piva_cf = ?, pec = ?, email = ?, telefono = ?,
         compenso_pct = ?, stato = ?, note = ? WHERE id = ?`
    ).bind(d.nome, d.cognome, d.ragioneSociale, d.pivaCf, d.pec, d.email, d.telefono, d.compensoPct, d.stato, d.note, Number(m[1])).run();
    if (!r.meta || !r.meta.changes) return risposta({ errore: 'Consulente non trovato' }, 404);
    console.log('consulente modificato', m[1], d.stato, d.compensoPct, utente);
    // passa ad "Attivo": il consulente riceve l'email con il codice
    const emailInviata = prima && prima.stato !== 'attivo' && d.stato === 'attivo' ? await avvisaAttivazione(env, Number(m[1])) : false;
    return risposta({ ok: true, emailInviata });
  }

  // approva / sospendi / riattiva con un clic
  m = pathname.match(/^\/api\/consulenti\/(\d+)\/stato$/);
  if (m && metodo === 'POST') {
    const corpo = await leggiCorpo(richiesta);
    if (!STATI_CONSULENTE.includes(corpo.stato)) return risposta({ errore: 'Stato non valido' }, 400);
    const id = Number(m[1]);
    const prima = await env.DB.prepare('SELECT stato FROM consulenti WHERE id = ?').bind(id).first();
    if (!prima) return risposta({ errore: 'Consulente non trovato' }, 404);
    await env.DB.prepare('UPDATE consulenti SET stato = ? WHERE id = ?').bind(corpo.stato, id).run();
    console.log('stato consulente', id, prima.stato, '→', corpo.stato, utente);
    const emailInviata = prima.stato !== 'attivo' && corpo.stato === 'attivo' ? await avvisaAttivazione(env, id) : false;
    return risposta({ ok: true, emailInviata });
  }

  m = pathname.match(/^\/api\/consulenti\/(\d+)\/csv$/);
  if (m && metodo === 'GET') {
    const dati = await cruscotto(env, Number(m[1]), q.get('da'), q.get('a'));
    if (!dati) return risposta({ errore: 'Consulente non trovato' }, 404);
    return risposta(csvCruscotto(dati), 200, 'text/csv; charset=utf-8', {
      'Content-Disposition': `attachment; filename="ordini-consulente-${m[1]}-${dati.periodo.da}_${dati.periodo.a}.csv"`,
    });
  }

  m = pathname.match(/^\/api\/consulenti\/(\d+)\/pagamento$/);
  if (m && metodo === 'POST') {
    const corpo = await leggiCorpo(richiesta);
    const esito = await registraPagamento(env, Number(m[1]), corpo);
    if (esito.errore) return risposta(esito, 400);
    console.log('pagamento consulente registrato', m[1], esito.importo, utente);
    return risposta(esito);
  }

  // nuovo codice per il consulente; con "sostituisci" i suoi codici precedenti vengono disattivati
  m = pathname.match(/^\/api\/consulenti\/(\d+)\/codice$/);
  if (m && metodo === 'POST') {
    const corpo = await leggiCorpo(richiesta);
    const c = await env.DB.prepare('SELECT id, cognome FROM consulenti WHERE id = ?').bind(Number(m[1])).first();
    if (!c) return risposta({ errore: 'Consulente non trovato' }, 404);
    if (corpo.sostituisci) {
      await env.DB.prepare('UPDATE codici_sconto SET attivo = 0 WHERE consulente_id = ?').bind(c.id).run();
    }
    try {
      const codice = await creaCodice(env, {
        base: c.cognome, codice: corpo.codice || undefined, scontoPct: percentuale(corpo.scontoPct, 20), consulenteId: c.id,
      });
      console.log('codice consulente creato', c.id, codice, utente);
      return risposta({ ok: true, codice });
    } catch (e) {
      return risposta({ errore: e.message }, 400);
    }
  }

  // codice generico (solo sconto, nessun compenso)
  if (pathname === '/api/codici' && metodo === 'POST') {
    const corpo = await leggiCorpo(richiesta);
    try {
      const codice = await creaCodice(env, {
        base: corpo.prefisso || 'MB', codice: corpo.codice || undefined,
        scontoPct: percentuale(corpo.scontoPct, 20), descrizione: testo(corpo.descrizione, 200),
      });
      console.log('codice generico creato', codice, utente);
      return risposta({ ok: true, codice });
    } catch (e) {
      return risposta({ errore: e.message }, 400);
    }
  }

  m = pathname.match(/^\/api\/codici\/([A-Za-z0-9-]{3,30})$/);
  if (m && metodo === 'POST') {
    const corpo = await leggiCorpo(richiesta);
    const codice = normalizzaCodice(m[1]);
    const attuale = await env.DB.prepare('SELECT * FROM codici_sconto WHERE codice = ?').bind(codice).first();
    if (!attuale) return risposta({ errore: 'Codice non trovato' }, 404);
    const attivo = corpo.attivo === undefined ? attuale.attivo : (corpo.attivo ? 1 : 0);
    const sconto = percentuale(corpo.scontoPct, attuale.sconto_pct);
    await env.DB.prepare('UPDATE codici_sconto SET attivo = ?, sconto_pct = ? WHERE codice = ?').bind(attivo, sconto, codice).run();
    console.log('codice modificato', codice, attivo, sconto, utente);
    return risposta({ ok: true });
  }

  return null;
}
