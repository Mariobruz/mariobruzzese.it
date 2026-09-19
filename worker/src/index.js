/**
 * Worker iscrizioni — corsi sicurezza MB Consulting
 *
 * Fa tre cose:
 *  1. riceve l'iscrizione dal sito, la controlla e la salva;
 *  2. avvia il pagamento con Stripe, oppure registra l'attesa del bonifico;
 *  3. manda le email, con allegato il CSV già pronto per l'import in piattaforma.
 *
 * Il prezzo non viene mai preso da quello che arriva dal browser: si legge
 * dal catalogo qui dentro.
 */
import { corsoPerId } from './catalogo';
import { csvImportEfei, nomeFileCsv } from './csv';
import { creaSessionePagamento, verificaWebhook } from './stripe';
import { emailAmministratore, emailClienteBonifico, emailClienteCarta, inviaEmail } from './email';
import {
  validaCap,
  validaCodiceFiscale,
  validaDataNascita,
  validaEmail,
  validaObbligatorio,
  validaPartitaIva,
  validaTelefono,
} from './validazione';

const MAX_PARTECIPANTI = 50;

const json = (dati, stato = 200, intestazioni = {}) =>
  new Response(JSON.stringify(dati), {
    status: stato,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...intestazioni },
  });

function intestazioniCors(env, richiesta) {
  const origine = richiesta.headers.get('Origin') || '';
  const ammesse = (env.ORIGINI_AMMESSE || '').split(',').map((o) => o.trim()).filter(Boolean);
  const consentita = ammesse.includes(origine) ? origine : ammesse[0] || '';
  return {
    'Access-Control-Allow-Origin': consentita,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

/** Controlli sul contenuto: qui non ci fidiamo di niente di quello che arriva. */
function verificaIscrizione(corpo) {
  const errori = [];
  const aggiungi = (e) => { if (e) errori.push(e); };

  const corso = corsoPerId(corpo && corpo.corso && corpo.corso.id);
  if (!corso) return { errori: ['Corso non riconosciuto'], corso: null };

  const f = corpo.fatturazione || {};
  const partecipanti = Array.isArray(corpo.partecipanti) ? corpo.partecipanti : [];

  if (!partecipanti.length) aggiungi('Nessun partecipante indicato');
  if (partecipanti.length > MAX_PARTECIPANTI) aggiungi(`Massimo ${MAX_PARTECIPANTI} partecipanti per ordine`);

  if (f.tipo === 'azienda') {
    aggiungi(validaObbligatorio(f.ragioneSociale, 'La ragione sociale'));
    aggiungi(validaPartitaIva(f.partitaIva));
  } else {
    aggiungi(validaObbligatorio(f.nome, 'Il nome'));
    aggiungi(validaObbligatorio(f.cognome, 'Il cognome'));
    aggiungi(validaCodiceFiscale(f.codiceFiscale));
  }
  aggiungi(validaObbligatorio(f.indirizzo, "L'indirizzo"));
  aggiungi(validaCap(f.cap));
  aggiungi(validaObbligatorio(f.citta, 'La città'));
  aggiungi(validaObbligatorio(f.provincia, 'La provincia'));
  aggiungi(validaEmail(f.email));
  aggiungi(validaTelefono(f.telefono));

  const visti = new Set();
  partecipanti.forEach((p, i) => {
    const dove = `Partecipante ${i + 1}`;
    const e = (msg) => { if (msg) errori.push(`${dove}: ${msg}`); };
    e(validaObbligatorio(p.nome, 'il nome'));
    e(validaObbligatorio(p.cognome, 'il cognome'));
    e(validaCodiceFiscale(p.codiceFiscale));
    e(validaDataNascita(p.dataNascita));
    e(validaObbligatorio(p.comuneNascita, 'il comune di nascita'));
    e(validaObbligatorio(p.provinciaNascita, 'la provincia di nascita'));
    e(validaObbligatorio(p.qualifica, 'la qualifica'));
    e(validaEmail(p.email));
    const cf = (p.codiceFiscale || '').toUpperCase();
    if (cf && visti.has(cf)) e('codice fiscale ripetuto');
    visti.add(cf);
  });

  const consensi = corpo.consensi || {};
  if (!consensi.privacy || !consensi.condizioni || !consensi.attivazione) {
    aggiungi(
      'Mancano i consensi obbligatori (condizioni di vendita, informativa privacy e richiesta di attivazione immediata)'
    );
  }

  const metodo = corpo.metodoPagamento === 'bonifico' ? 'bonifico' : 'carta';

  return { errori, corso, fatturazione: f, partecipanti, consensi, metodo };
}

async function salvaOrdine(env, { corso, fatturazione, partecipanti, consensi, metodo, totale }) {
  const adesso = new Date().toISOString();
  const risultato = await env.DB.prepare(
    `INSERT INTO ordini (riferimento, corso_id, corso_titolo, corso_sku, corso_ore,
       prezzo_unitario, partecipanti_n, totale, metodo_pagamento, stato,
       fatturazione, consensi, creato_il)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      null, corso.id, corso.titolo, corso.sku, corso.ore,
      corso.prezzo, partecipanti.length, totale, metodo,
      metodo === 'carta' ? 'in_attesa_pagamento' : 'in_attesa_bonifico',
      JSON.stringify(fatturazione), JSON.stringify(consensi), adesso
    )
    .run();

  const id = risultato.meta.last_row_id;
  const riferimento = `MB-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`;
  await env.DB.prepare('UPDATE ordini SET riferimento = ? WHERE id = ?').bind(riferimento, id).run();

  const inserimenti = partecipanti.map((p) =>
    env.DB.prepare(
      `INSERT INTO partecipanti (ordine_id, nome, cognome, email, codice_fiscale, data_nascita,
         comune_nascita, provincia_nascita, regione_nascita, sesso, telefono, qualifica)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, p.nome, p.cognome, p.email, (p.codiceFiscale || '').toUpperCase(), p.dataNascita,
      p.comuneNascita, p.provinciaNascita, p.regioneNascita || '', p.sesso || '',
      p.telefono || '', p.qualifica
    )
  );
  if (inserimenti.length) await env.DB.batch(inserimenti);

  return { id, riferimento };
}

async function inviaNotifiche(env, { ordine, partecipanti, riferimento, totale, stato }) {
  const csv = csvImportEfei(ordine, partecipanti);
  const messaggi = [
    emailAmministratore(env, {
      ordine, partecipanti, riferimento, totale, stato,
      csv, nomeFile: nomeFileCsv(riferimento),
    }),
    stato === 'pagato'
      ? emailClienteCarta(env, { ordine, partecipanti, riferimento })
      : emailClienteBonifico(env, { ordine, partecipanti, riferimento, totale }),
  ];
  // un errore su un'email non deve far fallire l'ordine: è già salvato
  const esiti = await Promise.allSettled(messaggi.map((m) => inviaEmail(env, m)));
  esiti.forEach((e, i) => {
    if (e.status === 'rejected') console.error('email non inviata', i, e.reason && e.reason.message);
  });
}

async function gestisciIscrizione(env, richiesta) {
  let corpo;
  try {
    corpo = await richiesta.json();
  } catch (e) {
    return json({ errore: 'Richiesta non leggibile' }, 400);
  }

  const controllo = verificaIscrizione(corpo);
  if (controllo.errori.length) {
    return json({ errore: 'Dati non validi', dettagli: controllo.errori }, 422);
  }

  const { corso, fatturazione, partecipanti, consensi, metodo } = controllo;
  const totale = corso.prezzo * partecipanti.length;
  const ordine = { corso, fatturazione };

  const { id, riferimento } = await salvaOrdine(env, {
    corso, fatturazione, partecipanti, consensi, metodo, totale,
  });

  if (metodo === 'bonifico') {
    await inviaNotifiche(env, { ordine, partecipanti, riferimento, totale, stato: 'in_attesa_bonifico' });
    return json({ riferimento, stato: 'in_attesa_bonifico' });
  }

  try {
    const sessione = await creaSessionePagamento(env, { ordine, partecipanti, riferimento });
    await env.DB.prepare('UPDATE ordini SET stripe_session_id = ? WHERE id = ?')
      .bind(sessione.id, id).run();
    return json({ riferimento, checkoutUrl: sessione.url });
  } catch (e) {
    console.error('Stripe', e.message);
    await env.DB.prepare('UPDATE ordini SET stato = ? WHERE id = ?').bind('errore_pagamento', id).run();
    return json({ errore: 'Non è stato possibile avviare il pagamento' }, 502);
  }
}

async function gestisciWebhook(env, richiesta) {
  const corpoGrezzo = await richiesta.text();
  const valido = await verificaWebhook(env, corpoGrezzo, richiesta.headers.get('Stripe-Signature'));
  if (!valido) return json({ errore: 'Firma non valida' }, 400);

  const evento = JSON.parse(corpoGrezzo);
  if (evento.type !== 'checkout.session.completed') return json({ ricevuto: true });

  const sessione = evento.data.object;
  // con alcuni metodi di pagamento la sessione si chiude prima dell'incasso
  if (sessione.payment_status !== 'paid') return json({ ricevuto: true });

  const riferimento = sessione.client_reference_id;
  const ordine = await env.DB.prepare('SELECT * FROM ordini WHERE riferimento = ?')
    .bind(riferimento).first();
  if (!ordine) return json({ ricevuto: true });
  if (ordine.stato === 'pagato') return json({ ricevuto: true }); // Stripe può ripetere l'evento

  const attesi = Math.round(Number(ordine.totale) * 100);
  if (Number(sessione.amount_total) !== attesi) {
    console.error('importo incassato diverso dal previsto', riferimento, sessione.amount_total, attesi);
    await env.DB.prepare('UPDATE ordini SET stato = ? WHERE id = ?')
      .bind('importo_da_verificare', ordine.id).run();
    return json({ ricevuto: true });
  }

  await env.DB.prepare('UPDATE ordini SET stato = ?, pagato_il = ? WHERE id = ?')
    .bind('pagato', new Date().toISOString(), ordine.id).run();

  const righe = await env.DB.prepare('SELECT * FROM partecipanti WHERE ordine_id = ?')
    .bind(ordine.id).all();
  const partecipanti = (righe.results || []).map((p) => ({
    nome: p.nome, cognome: p.cognome, email: p.email, codiceFiscale: p.codice_fiscale,
    dataNascita: p.data_nascita, comuneNascita: p.comune_nascita,
    provinciaNascita: p.provincia_nascita, regioneNascita: p.regione_nascita,
    telefono: p.telefono, qualifica: p.qualifica,
  }));

  await inviaNotifiche(env, {
    ordine: {
      corso: {
        id: ordine.corso_id, titolo: ordine.corso_titolo,
        sku: ordine.corso_sku, ore: ordine.corso_ore, prezzo: ordine.prezzo_unitario,
      },
      fatturazione: JSON.parse(ordine.fatturazione),
    },
    partecipanti,
    riferimento,
    totale: ordine.totale,
    stato: 'pagato',
  });

  return json({ ricevuto: true });
}

export default {
  async fetch(richiesta, env) {
    const url = new URL(richiesta.url);
    const cors = intestazioniCors(env, richiesta);

    if (richiesta.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    if (url.pathname === '/iscrizioni' && richiesta.method === 'POST') {
      const risposta = await gestisciIscrizione(env, richiesta);
      Object.entries(cors).forEach(([k, v]) => risposta.headers.set(k, v));
      return risposta;
    }

    if (url.pathname === '/stripe/webhook' && richiesta.method === 'POST') {
      return gestisciWebhook(env, richiesta);
    }

    if (url.pathname === '/') return json({ servizio: 'iscrizioni corsi sicurezza', stato: 'attivo' });

    return json({ errore: 'Non trovato' }, 404);
  },
};
