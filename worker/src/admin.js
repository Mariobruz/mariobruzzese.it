/**
 * admin.js — pannello ordini di MB Consulting (Worker "admin-corsi").
 *
 * È un Worker separato da quello pubblico delle iscrizioni: stesso database,
 * ma un indirizzo diverso, protetto per intero da Cloudflare Access.
 * In più il codice verifica da sé il token di Access: se Access venisse
 * spento per errore, il pannello resta chiuso invece di aprirsi a tutti.
 */
import { csvImportEfei, nomeFileCsv } from './csv';
import { emailClienteCarta, inviaEmail } from './email';
import { PAGINA, SCRIPT } from './admin-pagina';

const STATI_ATTIVI = ['in_attesa_bonifico', 'pagato', 'caricato', 'importo_da_verificare'];

const SICUREZZA = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
};

const risposta = (corpo, stato = 200, tipo = 'application/json; charset=utf-8', extra = {}) =>
  new Response(typeof corpo === 'string' ? corpo : JSON.stringify(corpo), {
    status: stato,
    headers: { 'Content-Type': tipo, ...SICUREZZA, ...extra },
  });

// ------------------------------------------------------------ Cloudflare Access

const b64url = (s) => {
  const b = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b + '='.repeat((4 - (b.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};
const jsonB64 = (s) => JSON.parse(new TextDecoder().decode(b64url(s)));

let chiaviAccess = { scadenza: 0, chiavi: [] };

async function chiaviPubbliche(team) {
  if (Date.now() < chiaviAccess.scadenza) return chiaviAccess.chiavi;
  const r = await fetch(`https://${team}/cdn-cgi/access/certs`);
  if (!r.ok) throw new Error(`certificati Access non disponibili (${r.status})`);
  const { keys = [] } = await r.json();
  chiaviAccess = { scadenza: Date.now() + 60 * 60 * 1000, chiavi: keys };
  return keys;
}

/** Restituisce l'email dell'amministratore se il token di Access è valido, altrimenti null. */
export async function verificaAccesso(richiesta, env) {
  const team = (env.ACCESS_TEAM_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const aud = env.ACCESS_AUD || '';
  if (!team || !aud) return null; // non ancora configurato: tutto chiuso
  const token = richiesta.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return null;
  const parti = token.split('.');
  if (parti.length !== 3) return null;
  try {
    const intestazione = jsonB64(parti[0]);
    const dati = jsonB64(parti[1]);
    if (intestazione.alg !== 'RS256') return null;
    const jwk = (await chiaviPubbliche(team)).find((k) => k.kid === intestazione.kid);
    if (!jwk) return null;
    const chiave = await crypto.subtle.importKey(
      'jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']
    );
    const valida = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5', chiave, b64url(parti[2]), new TextEncoder().encode(`${parti[0]}.${parti[1]}`)
    );
    if (!valida) return null;
    const adesso = Math.floor(Date.now() / 1000);
    const audience = Array.isArray(dati.aud) ? dati.aud : [dati.aud];
    if (!audience.includes(aud)) return null;
    if (!dati.exp || dati.exp < adesso) return null;
    if (dati.iss !== `https://${team}`) return null;
    const ammessi = (env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    const email = String(dati.email || '').toLowerCase();
    if (!ammessi.includes(email)) return null;
    return email;
  } catch (e) {
    console.error('verifica Access', e.message);
    return null;
  }
}

// ------------------------------------------------------------ dati

const mappaPartecipante = (p) => ({
  id: p.id, nome: p.nome, cognome: p.cognome, email: p.email, codiceFiscale: p.codice_fiscale,
  dataNascita: p.data_nascita, comuneNascita: p.comune_nascita, provinciaNascita: p.provincia_nascita,
  regioneNascita: p.regione_nascita, sesso: p.sesso, telefono: p.telefono, qualifica: p.qualifica,
  confermato: Boolean(p.account_confermato),
});

function mappaOrdine(o) {
  let fatturazione = {};
  try { fatturazione = JSON.parse(o.fatturazione || '{}'); } catch (e) { /* dato vecchio */ }
  return {
    id: o.id, riferimento: o.riferimento, stato: o.stato, metodo: o.metodo_pagamento,
    corso: { id: o.corso_id, titolo: o.corso_titolo, sku: o.corso_sku, ore: o.corso_ore, prezzo: o.prezzo_unitario },
    partecipantiN: o.partecipanti_n, totale: o.totale,
    creatoIl: o.creato_il, pagatoIl: o.pagato_il, caricatoIl: o.caricato_il,
    fatturazione,
  };
}

async function elencoOrdini(env) {
  const { results: ordini = [] } = await env.DB.prepare(
    'SELECT * FROM ordini ORDER BY id DESC LIMIT 1000'
  ).all();
  const { results: conferme = [] } = await env.DB.prepare(
    'SELECT ordine_id, SUM(account_confermato) AS confermati FROM partecipanti GROUP BY ordine_id'
  ).all();
  const confermati = Object.fromEntries(conferme.map((r) => [r.ordine_id, Number(r.confermati) || 0]));
  return ordini.map((o) => ({ ...mappaOrdine(o), confermati: confermati[o.id] || 0 }));
}

async function ordineCompleto(env, id) {
  const o = await env.DB.prepare('SELECT * FROM ordini WHERE id = ?').bind(id).first();
  if (!o) return null;
  const { results = [] } = await env.DB.prepare('SELECT * FROM partecipanti WHERE ordine_id = ? ORDER BY id')
    .bind(id).all();
  const partecipanti = results.map(mappaPartecipante);
  return { ...mappaOrdine(o), partecipanti, confermati: partecipanti.filter((p) => p.confermato).length };
}

// Passaggi di stato consentiti: da quale stato si parte e dove si arriva
const AZIONI = {
  bonifico_ricevuto: { da: ['in_attesa_bonifico'], a: 'pagato', data: 'pagato_il' },
  pagamento_verificato: { da: ['importo_da_verificare'], a: 'pagato' },
  caricato: { da: ['pagato'], a: 'caricato', data: 'caricato_il' },
  completato: { da: ['caricato'], a: 'completato' },
  annulla: { da: ['in_attesa_bonifico', 'in_attesa_pagamento', 'errore_pagamento'], a: 'annullato' },
};

async function eseguiAzione(env, id, azione, opzioni = {}) {
  const regola = AZIONI[azione];
  if (!regola) return { errore: 'Azione non valida', stato: 400 };
  const ordine = await ordineCompleto(env, id);
  if (!ordine) return { errore: 'Ordine non trovato', stato: 404 };
  if (!regola.da.includes(ordine.stato)) {
    return { errore: `L'ordine è "${ordine.stato}": questa azione non si può fare adesso`, stato: 409 };
  }
  const segnaposti = regola.da.map(() => '?').join(',');
  const sql = regola.data
    ? `UPDATE ordini SET stato = ?, ${regola.data} = ? WHERE id = ? AND stato IN (${segnaposti})`
    : `UPDATE ordini SET stato = ? WHERE id = ? AND stato IN (${segnaposti})`;
  const parametri = regola.data
    ? [regola.a, new Date().toISOString(), id, ...regola.da]
    : [regola.a, id, ...regola.da];
  const esito = await env.DB.prepare(sql).bind(...parametri).run();
  if (!esito.meta || !esito.meta.changes) return { errore: 'Ordine modificato nel frattempo: ricarica', stato: 409 };

  let emailInviata = false;
  if (azione === 'bonifico_ricevuto' && opzioni.avvisaCliente !== false && env.BREVO_API_KEY) {
    try {
      await inviaEmail(env, emailClienteCarta(env, {
        ordine: { corso: ordine.corso, fatturazione: ordine.fatturazione },
        partecipanti: ordine.partecipanti,
        riferimento: ordine.riferimento,
      }));
      emailInviata = true;
    } catch (e) {
      console.error('email conferma bonifico', e.message);
    }
  }
  return { ordine: await ordineCompleto(env, id), emailInviata };
}

// ------------------------------------------------------------ router

export default {
  async fetch(richiesta, env) {
    const url = new URL(richiesta.url);
    if (url.pathname === '/favicon.ico') return new Response(null, { status: 204 });
    const email = await verificaAccesso(richiesta, env);
    if (!email) {
      return risposta(
        'Accesso non autorizzato. Il pannello si apre solo passando dal login di Cloudflare Access.',
        403, 'text/plain; charset=utf-8'
      );
    }

    const { pathname } = url;
    const metodo = richiesta.method;

    if (metodo === 'GET' && (pathname === '/' || pathname === '/index.html')) {
      return risposta(PAGINA, 200, 'text/html; charset=utf-8');
    }
    if (metodo === 'GET' && pathname === '/app.js') {
      return risposta(SCRIPT, 200, 'text/javascript; charset=utf-8');
    }

    if (pathname.startsWith('/api/')) {
      // le modifiche devono arrivare dalla pagina stessa (niente richieste da altri siti)
      if (metodo !== 'GET' && richiesta.headers.get('X-Pannello') !== '1') {
        return risposta({ errore: 'Richiesta non ammessa' }, 403);
      }

      if (metodo === 'GET' && pathname === '/api/ordini') {
        return risposta({ utente: email, ordini: await elencoOrdini(env) });
      }

      let m = pathname.match(/^\/api\/ordini\/(\d+)$/);
      if (m && metodo === 'GET') {
        const ordine = await ordineCompleto(env, Number(m[1]));
        return ordine ? risposta(ordine) : risposta({ errore: 'Ordine non trovato' }, 404);
      }

      m = pathname.match(/^\/api\/ordini\/(\d+)\/csv$/);
      if (m && metodo === 'GET') {
        const ordine = await ordineCompleto(env, Number(m[1]));
        if (!ordine) return risposta({ errore: 'Ordine non trovato' }, 404);
        const csv = csvImportEfei(ordine, ordine.partecipanti);
        return risposta(csv, 200, 'text/csv; charset=utf-8', {
          'Content-Disposition': `attachment; filename="${nomeFileCsv(ordine.riferimento)}"`,
        });
      }

      m = pathname.match(/^\/api\/ordini\/(\d+)\/azione$/);
      if (m && metodo === 'POST') {
        let corpo = {};
        try { corpo = await richiesta.json(); } catch (e) { /* vuoto */ }
        const esito = await eseguiAzione(env, Number(m[1]), String(corpo.azione || ''), {
          avvisaCliente: corpo.avvisaCliente !== false,
        });
        return esito.errore ? risposta({ errore: esito.errore }, esito.stato) : risposta(esito);
      }

      m = pathname.match(/^\/api\/partecipanti\/(\d+)$/);
      if (m && metodo === 'POST') {
        let corpo = {};
        try { corpo = await richiesta.json(); } catch (e) { /* vuoto */ }
        const esito = await env.DB.prepare('UPDATE partecipanti SET account_confermato = ? WHERE id = ?')
          .bind(corpo.confermato ? 1 : 0, Number(m[1])).run();
        if (!esito.meta || !esito.meta.changes) return risposta({ errore: 'Partecipante non trovato' }, 404);
        return risposta({ ok: true });
      }

      return risposta({ errore: 'Non trovato' }, 404);
    }

    return risposta('Non trovato', 404, 'text/plain; charset=utf-8');
  },
};

export { STATI_ATTIVI, AZIONI };
