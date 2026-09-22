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
  validaAteco,
  validaCap,
  validaCodiceFiscale,
  validaDataNascita,
  validaEmail,
  validaFatturazioneElettronica,
  validaObbligatorio,
  validaPartitaIva,
  validaTelefono,
} from './validazione';
import { province } from './province';

const MAX_PARTECIPANTI = 50;
const MAX_CORPO = 100000; // caratteri: 50 partecipanti stanno ampiamente sotto

// Solo questi campi vengono accettati e salvati, con la lunghezza massima.
// Tutto il resto che arriva nella richiesta viene scartato.
const LIMITI_FATTURAZIONE = {
  tipo: 10, ragioneSociale: 150, partitaIva: 20, referente: 120, sdi: 10, pec: 120,
  nome: 60, cognome: 60, codiceFiscale: 20,
  indirizzo: 150, cap: 10, citta: 80, provincia: 4, regione: 40, nazione: 30,
  email: 120, telefono: 25, ateco: 20,
};
const LIMITI_PARTECIPANTE = {
  nome: 60, cognome: 60, codiceFiscale: 20, dataNascita: 10, sesso: 1,
  comuneNascita: 80, provinciaNascita: 4, regioneNascita: 40, nazioneNascita: 30,
  email: 120, telefono: 25, qualifica: 80,
};

// caratteri di markup e di controllo: in un'anagrafica non servono mai
const VIETATI = /[<>\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
// link nei nomi: è il modo per usare le nostre email come veicolo di phishing
const LINK = /https?:|:\/\/|www\.|\.(com|it|net|org|ru|xyz|info|io|top|link)\b/i;

function pulisci(sorgente, limiti, dove, errori) {
  const s = sorgente && typeof sorgente === 'object' ? sorgente : {};
  const pulito = {};
  for (const [campo, massimo] of Object.entries(limiti)) {
    const v = s[campo];
    if (v === undefined || v === null) { pulito[campo] = ''; continue; }
    if (typeof v !== 'string' && typeof v !== 'number') {
      errori.push(`${dove}: campo ${campo} non valido`);
      pulito[campo] = '';
      continue;
    }
    const t = String(v).trim();
    if (t.length > massimo) errori.push(`${dove}: il campo ${campo} è troppo lungo (max ${massimo} caratteri)`);
    if (VIETATI.test(t)) errori.push(`${dove}: il campo ${campo} contiene caratteri non ammessi`);
    pulito[campo] = t.slice(0, massimo);
  }
  return pulito;
}

const provinciaValida = (sigla) => province.some((p) => p.sigla === String(sigla || '').toUpperCase());

const SICUREZZA = { 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' };

const json = (dati, stato = 200, intestazioni = {}) =>
  new Response(JSON.stringify(dati), {
    status: stato,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...SICUREZZA, ...intestazioni },
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

  const f = pulisci(corpo.fatturazione, LIMITI_FATTURAZIONE, 'Intestazione', errori);
  f.tipo = f.tipo === 'azienda' ? 'azienda' : 'privato';
  const grezzi = Array.isArray(corpo.partecipanti) ? corpo.partecipanti : [];
  if (!grezzi.length) aggiungi('Nessun partecipante indicato');
  if (grezzi.length > MAX_PARTECIPANTI) {
    return { errori: [`Massimo ${MAX_PARTECIPANTI} partecipanti per ordine`], corso };
  }
  const partecipanti = grezzi.map((p, i) => pulisci(p, LIMITI_PARTECIPANTE, `Partecipante ${i + 1}`, errori));

  if (f.tipo === 'azienda') {
    aggiungi(validaObbligatorio(f.ragioneSociale, 'La ragione sociale'));
    aggiungi(validaPartitaIva(f.partitaIva));
    aggiungi(validaObbligatorio(f.referente, 'Il referente'));
    aggiungi(validaFatturazioneElettronica(f.sdi, f.pec));
  } else {
    aggiungi(validaObbligatorio(f.nome, 'Il nome'));
    aggiungi(validaObbligatorio(f.cognome, 'Il cognome'));
    aggiungi(validaCodiceFiscale(f.codiceFiscale));
    if (LINK.test(f.nome) || LINK.test(f.cognome)) aggiungi('Nome e cognome non possono contenere link');
  }
  aggiungi(validaObbligatorio(f.indirizzo, "L'indirizzo"));
  aggiungi(validaCap(f.cap));
  aggiungi(validaObbligatorio(f.citta, 'La città'));
  if (!provinciaValida(f.provincia)) aggiungi('Provincia non valida');
  aggiungi(validaEmail(f.email));
  aggiungi(validaTelefono(f.telefono));
  aggiungi(validaAteco(f.ateco));

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
    if (p.provinciaNascita && !provinciaValida(p.provinciaNascita)) e('provincia di nascita non valida');
    if (p.dataNascita && !/^\d{4}-\d{2}-\d{2}$/.test(p.dataNascita)) e('data di nascita non valida');
    if (LINK.test(p.nome) || LINK.test(p.cognome)) e('nome e cognome non possono contenere link');
    const cf = (p.codiceFiscale || '').toUpperCase();
    if (cf && visti.has(cf)) e('codice fiscale ripetuto');
    visti.add(cf);
  });

  // solo vero/falso: nel database finisce la prova di cosa è stato accettato, nient'altro
  const c = (corpo.consensi && typeof corpo.consensi === 'object') ? corpo.consensi : {};
  const consensi = {
    privacy: c.privacy === true,
    condizioni: c.condizioni === true,
    attivazione: c.attivazione === true,
    ccnl: c.ccnl === true,
    marketing: c.marketing === true,
  };
  if (!consensi.privacy || !consensi.condizioni || !consensi.attivazione) {
    aggiungi(
      'Mancano i consensi obbligatori (condizioni di vendita, informativa privacy e richiesta di attivazione immediata)'
    );
  }

  if (/(^|-)rls-/.test(corso.id) && !consensi.ccnl) {
    aggiungi('Per i corsi RLS serve la dichiarazione sul CCNL che ammette la formazione in e-learning');
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

/** Verifica anti-bot Cloudflare Turnstile. Finché il segreto non è impostato resta spenta. */
async function verificaTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token || typeof token !== 'string' || token.length > 2048) return false;
  const modulo = new FormData();
  modulo.append('secret', env.TURNSTILE_SECRET);
  modulo.append('response', token);
  if (ip) modulo.append('remoteip', ip);
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: modulo });
    const esito = await r.json();
    return esito.success === true;
  } catch (e) {
    console.error('Turnstile non raggiungibile', e.message);
    return false;
  }
}

async function gestisciIscrizione(env, richiesta) {
  const ip = richiesta.headers.get('CF-Connecting-IP') || '';

  // freno ai bot: poche iscrizioni al minuto dallo stesso indirizzo
  if (env.LIMITE_ISCRIZIONI) {
    const { success } = await env.LIMITE_ISCRIZIONI.limit({ key: ip || 'sconosciuto' });
    if (!success) return json({ errore: 'Troppe richieste: riprova fra un minuto' }, 429);
  }

  const dichiarata = Number(richiesta.headers.get('Content-Length') || 0);
  if (dichiarata > MAX_CORPO) return json({ errore: 'Richiesta troppo grande' }, 413);

  let corpo;
  try {
    const testo = await richiesta.text();
    if (testo.length > MAX_CORPO) return json({ errore: 'Richiesta troppo grande' }, 413);
    corpo = JSON.parse(testo);
  } catch (e) {
    return json({ errore: 'Richiesta non leggibile' }, 400);
  }
  if (!corpo || typeof corpo !== 'object') return json({ errore: 'Richiesta non leggibile' }, 400);

  if (!(await verificaTurnstile(env, corpo.turnstile, ip))) {
    return json({ errore: 'Verifica anti-bot non superata: ricarica la pagina e riprova' }, 403);
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

  let evento;
  try {
    evento = JSON.parse(corpoGrezzo);
  } catch (e) {
    return json({ errore: 'Evento non leggibile' }, 400);
  }
  if (evento.type !== 'checkout.session.completed') return json({ ricevuto: true });

  const sessione = evento.data.object;
  // con alcuni metodi di pagamento la sessione si chiude prima dell'incasso
  if (sessione.payment_status !== 'paid') return json({ ricevuto: true });

  const riferimento = sessione.client_reference_id;
  const ordine = await env.DB.prepare('SELECT * FROM ordini WHERE riferimento = ?')
    .bind(riferimento).first();
  if (!ordine) return json({ ricevuto: true });
  // Stripe può ripetere l'evento: si procede solo se l'ordine aspetta ancora il pagamento
  if (ordine.stato !== 'in_attesa_pagamento') return json({ ricevuto: true });

  // la sessione deve essere proprio quella creata per questo ordine
  if (ordine.stripe_session_id && ordine.stripe_session_id !== sessione.id) {
    console.error('sessione Stripe non corrispondente', riferimento, sessione.id);
    return json({ ricevuto: true });
  }

  const attesi = Math.round(Number(ordine.totale) * 100);
  if (Number(sessione.amount_total) !== attesi || String(sessione.currency).toLowerCase() !== 'eur') {
    console.error('importo incassato diverso dal previsto', riferimento, sessione.amount_total, attesi);
    await env.DB.prepare('UPDATE ordini SET stato = ? WHERE id = ?')
      .bind('importo_da_verificare', ordine.id).run();
    return json({ ricevuto: true });
  }

  // aggiornamento condizionato: se Stripe manda l'evento due volte insieme, uno solo passa
  const aggiornato = await env.DB.prepare(
    "UPDATE ordini SET stato = 'pagato', pagato_il = ? WHERE id = ? AND stato = 'in_attesa_pagamento'"
  ).bind(new Date().toISOString(), ordine.id).run();
  if (!aggiornato.meta || !aggiornato.meta.changes) return json({ ricevuto: true });

  const righe = await env.DB.prepare('SELECT * FROM partecipanti WHERE ordine_id = ?')
    .bind(ordine.id).all();
  const partecipanti = (righe.results || []).map((p) => ({
    nome: p.nome, cognome: p.cognome, email: p.email, codiceFiscale: p.codice_fiscale,
    dataNascita: p.data_nascita, comuneNascita: p.comune_nascita,
    provinciaNascita: p.provincia_nascita, regioneNascita: p.regione_nascita,
    telefono: p.telefono, qualifica: p.qualifica, sesso: p.sesso,
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

  /**
   * Ogni lunedi: una chiamata a Brevo tiene attiva la chiave API, che
   * altrimenti scade dopo 90 giorni senza utilizzo. L'esito resta nei log
   * del Worker (wrangler tail / dashboard Cloudflare).
   */
  async scheduled(_evento, env) {
    const r = await fetch('https://api.brevo.com/v3/account', {
      headers: { 'api-key': env.BREVO_API_KEY, Accept: 'application/json' },
    });
    if (!r.ok) console.error('Brevo: chiave API non valida o scaduta', r.status);
    else console.log('Brevo: chiave API attiva');
  },
};
