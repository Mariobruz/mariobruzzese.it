/**
 * consulenti.js — Worker "area-consulenti": l'area riservata dei consulenti.
 *
 * Accesso senza password: il consulente scrive la sua email e riceve (Brevo)
 * un link che vale 15 minuti e si usa una volta sola. Il link apre una
 * sessione di 30 giorni in un cookie firmato (HMAC) valido solo su questo
 * indirizzo. Ogni consulente vede solo i propri ordini.
 *
 * Registrazione: /registrati (il link da mettere nelle email promozionali).
 * Il consulente nasce "in attesa di contratto" con un codice già assegnato,
 * che funziona solo quando MB Consulting lo mette "Attivo" dal pannello.
 */
import { creaCodice, cruscotto, csvCruscotto } from './consulenti-dati';
import { emailAccessoConsulente, emailNuovoConsulenteAdmin, emailRegistrazioneConsulente } from './email-consulenti';
import { inviaEmail } from './email';
import { RENDER_CRUSCOTTO, STILE_CRUSCOTTO } from './cruscotto-vista';
import { ipBloccato, registraEvento } from './sicurezza';

const DURATA_LINK = 15 * 60 * 1000;
const DURATA_SESSIONE = 30 * 24 * 3600 * 1000;
const COOKIE = '__Host-sessione';

const SICUREZZA = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
};
const risposta = (corpo, stato = 200, tipo = 'application/json; charset=utf-8', extra = {}) =>
  new Response(typeof corpo === 'string' ? corpo : JSON.stringify(corpo), {
    status: stato, headers: { 'Content-Type': tipo, ...SICUREZZA, ...extra },
  });

// ------------------------------------------------------------ crittografia

const enc = new TextEncoder();
const b64url = (byte) => btoa(String.fromCharCode(...byte)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

async function hmac(env, testo) {
  if (!env.SESSIONE_SEGRETO || env.SESSIONE_SEGRETO.length < 32) throw new Error('SESSIONE_SEGRETO mancante o troppo corto');
  const chiave = await crypto.subtle.importKey('raw', enc.encode(env.SESSIONE_SEGRETO), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', chiave, enc.encode(testo))));
}

function uguali(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i += 1) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** id del consulente se il cookie di sessione è valido e il consulente non è sospeso. */
async function sessione(env, richiesta) {
  const cookie = richiesta.headers.get('Cookie') || '';
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return null;
  const [id, scade, firma] = m[1].split('.');
  if (!id || !scade || !firma || Number(scade) < Date.now()) return null;
  if (!uguali(firma, await hmac(env, `${id}.${scade}`))) return null;
  const c = await env.DB.prepare('SELECT id, stato FROM consulenti WHERE id = ?').bind(Number(id)).first();
  return c && c.stato !== 'sospeso' ? c.id : null;
}

async function cookieSessione(env, id) {
  const scade = Date.now() + DURATA_SESSIONE;
  const valore = `${id}.${scade}.${await hmac(env, `${id}.${scade}`)}`;
  return `${COOKIE}=${valore}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${DURATA_SESSIONE / 1000}`;
}

// ------------------------------------------------------------ pagina

const PAGINA = `<!doctype html><html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Area consulenti — MB Consulting</title>
<style>
body{margin:0;font:15px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#111;background:#f9fafb}
header{background:#111;color:#fff;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;gap:12px}
header button{background:transparent;color:#fff;border:1px solid #fff;border-radius:6px;padding:4px 10px;cursor:pointer}
main{max-width:1000px;margin:0 auto;padding:16px}
button{cursor:pointer;padding:7px 12px;border:1px solid #111;border-radius:6px;background:#fff}
.barra{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0}
.barra input{padding:6px;border:1px solid #d1d5db;border-radius:6px}
.accesso{max-width:420px;margin:40px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px}
.accesso input{width:100%;box-sizing:border-box;padding:10px;border:1px solid #d1d5db;border-radius:8px;margin:8px 0 12px}
.accesso button{background:#111;color:#fff;width:100%;padding:10px}
.accesso.largo{max-width:560px}
.accesso label{display:block;font-size:13px;color:#374151;margin-top:4px}
.accesso label input{margin:4px 0 8px}
.accesso .spunta{display:flex;gap:8px;align-items:flex-start;margin:10px 0 14px}
.accesso .spunta input{width:auto;margin:3px 0 0}
.accesso .esca{position:absolute;left:-5000px;width:1px;height:1px;overflow:hidden}
.accesso a{color:#111}
${STILE_CRUSCOTTO}
</style></head><body>
<header><strong>Area consulenti · MB Consulting</strong><span id="utente"></span></header>
<main id="app"><p>Caricamento…</p></main>
<script src="/app.js"></script></body></html>`;

const SCRIPT = RENDER_CRUSCOTTO + String.raw`
(function () {
  'use strict';
  var app = document.getElementById('app');
  var oggi = new Date().toISOString().slice(0, 10);
  var periodo = { da: new Date(Date.now() - 89 * 864e5).toISOString().slice(0, 10), a: oggi };
  function el(tag, attr, testo) {
    var e = document.createElement(tag);
    if (attr) Object.keys(attr).forEach(function (k) { e.setAttribute(k, attr[k]); });
    if (testo !== undefined && testo !== null) e.textContent = testo;
    return e;
  }
  function api(url, opz) {
    opz = opz || {};
    opz.headers = Object.assign({ 'Content-Type': 'application/json', 'X-Area': '1' }, opz.headers || {});
    opz.credentials = 'same-origin';
    return fetch(url, opz).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { d._stato = r.status; if (!r.ok && r.status !== 401) throw new Error(d.errore || 'Errore ' + r.status); return d; });
    });
  }

  function accesso(msg) {
    app.textContent = '';
    var b = el('div', { class: 'accesso' });
    b.appendChild(el('h2', null, 'Accedi'));
    b.appendChild(el('p', null, 'Scrivi l\'email con cui sei registrato: ti mandiamo un link per entrare, valido 15 minuti.'));
    var i = el('input', { type: 'email', placeholder: 'nome@studio.it', autocomplete: 'email', 'aria-label': 'Email' });
    var bt = el('button', null, 'Mandami il link');
    var esito = el('p', { class: 'cr-nota' }, msg || '');
    bt.addEventListener('click', function () {
      bt.disabled = true;
      api('/api/accesso', { method: 'POST', body: JSON.stringify({ email: i.value }) })
        .then(function (d) { esito.textContent = d.messaggio || 'Se l\'email è registrata, riceverai il link fra pochi istanti. Controlla anche lo spam.'; })
        .catch(function (e) { esito.textContent = e.message; bt.disabled = false; });
    });
    b.appendChild(i); b.appendChild(bt); b.appendChild(esito);
    var reg = el('p', { class: 'cr-nota' }, 'Non sei ancora registrato? ');
    reg.appendChild(el('a', { href: '/registrati' }, 'Registrati come consulente'));
    b.appendChild(reg);
    app.appendChild(b);
  }

  function registrazione() {
    app.textContent = '';
    var b = el('div', { class: 'accesso largo' });
    b.appendChild(el('h2', null, 'Registrazione consulenti'));
    b.appendChild(el('p', null, 'Compila i tuoi dati: riceverai subito il link per entrare nella tua area riservata. ' +
      'Il tuo codice sconto per i clienti si attiva quando è completato l\'accordo di collaborazione.'));
    var campi = {};
    [['nome', 'Nome *', 'text', 'given-name'], ['cognome', 'Cognome *', 'text', 'family-name'],
     ['ragioneSociale', 'Studio / ragione sociale', 'text', 'organization'], ['pivaCf', 'Partita IVA o codice fiscale *', 'text', 'off'],
     ['email', 'Email *', 'email', 'email'], ['pec', 'PEC', 'email', 'off'], ['telefono', 'Telefono *', 'tel', 'tel']].forEach(function (x) {
      var l = el('label', null, x[1]);
      var i = el('input', { type: x[2], autocomplete: x[3], name: x[0] });
      campi[x[0]] = i; l.appendChild(i); b.appendChild(l);
    });
    // campo trappola per i robot: le persone non lo vedono
    var trappola = el('input', { type: 'text', name: 'sito', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' });
    var esca = el('div', { class: 'esca' }); esca.appendChild(trappola); b.appendChild(esca);
    var sp = el('label', { class: 'spunta' });
    var ok = el('input', { type: 'checkbox' });
    var testo = el('span', null, 'Ho letto l\'');
    testo.appendChild(el('a', { href: 'https://www.mariobruzzese.it/privacy', target: '_blank', rel: 'noopener' }, 'informativa privacy'));
    testo.appendChild(document.createTextNode(' e acconsento al trattamento dei miei dati per la gestione della collaborazione. *'));
    sp.appendChild(ok); sp.appendChild(testo); b.appendChild(sp);
    var bt = el('button', null, 'Registrati');
    var esito = el('p', { class: 'cr-nota', role: 'status' });
    bt.addEventListener('click', function () {
      var corpo = { privacy: ok.checked, sito: trappola.value };
      Object.keys(campi).forEach(function (k) { corpo[k] = campi[k].value; });
      bt.disabled = true; esito.textContent = 'Invio in corso…';
      api('/api/registrazione', { method: 'POST', body: JSON.stringify(corpo) })
        .then(function (d) {
          b.textContent = '';
          b.appendChild(el('h2', null, 'Grazie!'));
          b.appendChild(el('p', null, d.messaggio));
        })
        .catch(function (e) { esito.textContent = e.message; bt.disabled = false; });
    });
    b.appendChild(bt); b.appendChild(esito);
    var gia = el('p', { class: 'cr-nota' }, 'Sei già registrato? ');
    gia.appendChild(el('a', { href: '/' }, 'Accedi'));
    b.appendChild(gia);
    app.appendChild(b);
  }

  function carica() {
    api('/api/cruscotto?da=' + periodo.da + '&a=' + periodo.a).then(function (d) {
      if (d._stato === 401) return accesso();
      document.getElementById('utente').textContent = '';
      var esci = el('button', null, 'Esci');
      esci.addEventListener('click', function () { api('/api/esci', { method: 'POST' }).then(function () { location.reload(); }); });
      document.getElementById('utente').appendChild(el('span', { style: 'margin-right:10px' }, d.consulente.nome + ' ' + d.consulente.cognome));
      document.getElementById('utente').appendChild(esci);
      app.textContent = '';
      var bar = el('div', { class: 'barra' });
      var da = el('input', { type: 'date', value: periodo.da, 'aria-label': 'Dal' });
      var a = el('input', { type: 'date', value: periodo.a, 'aria-label': 'Al' });
      var ok = el('button', null, 'Aggiorna');
      ok.addEventListener('click', function () { periodo = { da: da.value || periodo.da, a: a.value || periodo.a }; carica(); });
      var csv = el('a', { href: '/api/ordini.csv?da=' + periodo.da + '&a=' + periodo.a, style: 'margin-left:auto' }, 'Scarica CSV');
      [el('span', null, 'Dal'), da, el('span', null, 'al'), a, ok, csv].forEach(function (x) { bar.appendChild(x); });
      app.appendChild(bar);
      var box = el('div'); app.appendChild(box);
      disegnaCruscotto(box, d, {});
    }).catch(function (e) { app.textContent = 'Errore: ' + e.message; });
  }

  var q = new URLSearchParams(location.search);
  if (location.pathname === '/registrati') registrazione();
  else if (q.get('errore') === 'link') { accesso('Il link è scaduto o è già stato usato: chiedine uno nuovo.'); history.replaceState(null, '', '/'); }
  else carica();
})();
`;

const PAGINA_ERRORE = (msg) => `<!doctype html><meta charset="utf-8"><title>Area consulenti</title><p style="font-family:sans-serif">${msg}</p>`;

// ------------------------------------------------------------ rotte

async function chiediLink(env, richiesta) {
  const ip = richiesta.headers.get('CF-Connecting-IP') || 'sconosciuto';
  if (env.LIMITE_ACCESSI) {
    const { success } = await env.LIMITE_ACCESSI.limit({ key: ip });
    if (!success) {
      await registraEvento(env, richiesta, 'troppe_richieste', 'area consulenti: troppe richieste di link');
      return risposta({ errore: 'Troppe richieste: riprova fra qualche minuto' }, 429);
    }
  }
  let corpo = {};
  try { corpo = await richiesta.json(); } catch (e) { /* vuoto */ }
  const email = String(corpo.email || '').trim().toLowerCase().slice(0, 120);
  const messaggio = 'Se l\'email è registrata, riceverai il link fra pochi istanti. Controlla anche lo spam.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return risposta({ errore: 'Email non valida' }, 400);

  const c = await env.DB.prepare('SELECT * FROM consulenti WHERE email = ?').bind(email).first();
  // stessa risposta che l'email esista o no: nessuno può scoprire chi è registrato
  if (!c || c.stato === 'sospeso') {
    await registraEvento(env, richiesta, 'accesso_consulente_negato', c ? 'consulente sospeso' : 'email non registrata');
    return risposta({ messaggio });
  }
  const link = await nuovoLink(env, richiesta, c.id);
  try {
    await inviaEmail(env, emailAccessoConsulente({ consulente: c, link }));
  } catch (e) {
    console.error('email accesso consulente', e.message);
    return risposta({ errore: 'Non è stato possibile inviare l\'email: riprova fra poco' }, 502);
  }
  return risposta({ messaggio });
}

const testo = (v, max) => String(v == null ? '' : v).trim().replace(/\s+/g, ' ').slice(0, max);

/** Crea un token di accesso (15 minuti) e restituisce il link. */
async function nuovoLink(env, richiesta, id) {
  const token = b64url(crypto.getRandomValues(new Uint8Array(32)));
  await env.DB.prepare('INSERT INTO accessi_consulenti (token_hash, consulente_id, scade_il) VALUES (?, ?, ?)')
    .bind(await sha256(token), id, new Date(Date.now() + DURATA_LINK).toISOString()).run();
  return `${new URL(richiesta.url).origin}/entra?t=${token}`;
}

/**
 * Registrazione dal modulo pubblico. La risposta è la stessa anche se l'email
 * esiste già (in quel caso parte solo un normale link di accesso), così il modulo
 * non rivela chi è registrato.
 */
async function registra(env, richiesta) {
  const ip = richiesta.headers.get('CF-Connecting-IP') || 'sconosciuto';
  if (env.LIMITE_ACCESSI) {
    const { success } = await env.LIMITE_ACCESSI.limit({ key: ip });
    if (!success) {
      await registraEvento(env, richiesta, 'troppe_richieste', 'area consulenti: troppe registrazioni');
      return risposta({ errore: 'Troppe richieste: riprova fra qualche minuto' }, 429);
    }
  }
  let corpo = {};
  try { corpo = await richiesta.json(); } catch (e) { /* vuoto */ }
  const messaggio = 'Registrazione ricevuta. Ti abbiamo mandato un\'email con il link per entrare nella tua area: controlla anche lo spam.';

  // robot: il campo trappola è pieno. Risposta normale, nessun dato salvato.
  if (corpo.sito) {
    await registraEvento(env, richiesta, 'registrazione_robot', 'campo trappola compilato');
    return risposta({ messaggio });
  }
  const d = {
    nome: testo(corpo.nome, 60), cognome: testo(corpo.cognome, 60), ragioneSociale: testo(corpo.ragioneSociale, 150),
    pivaCf: testo(corpo.pivaCf, 20).replace(/\s/g, '').toUpperCase(), pec: testo(corpo.pec, 120).toLowerCase(),
    email: testo(corpo.email, 120).toLowerCase(), telefono: testo(corpo.telefono, 25),
  };
  const errori = [];
  if (!d.nome) errori.push('Il nome è obbligatorio');
  if (!d.cognome) errori.push('Il cognome è obbligatorio');
  if (!/^([0-9]{11}|[A-Z0-9]{16})$/.test(d.pivaCf)) errori.push('Partita IVA (11 cifre) o codice fiscale (16 caratteri) non valido');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errori.push('Email non valida');
  if (d.pec && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.pec)) errori.push('PEC non valida');
  if (!/^\+?[0-9 ./-]{6,20}$/.test(d.telefono)) errori.push('Telefono non valido');
  if (corpo.privacy !== true) errori.push('Serve il consenso all\'informativa privacy');
  if (/[<>]/.test(Object.values(d).join(''))) errori.push('Caratteri non ammessi');
  if (errori.length) return risposta({ errore: errori.join('. ') }, 400);

  const esiste = await env.DB.prepare('SELECT * FROM consulenti WHERE email = ?').bind(d.email).first();
  if (esiste) {
    await registraEvento(env, richiesta, 'registrazione_doppia', 'email già registrata');
    if (esiste.stato !== 'sospeso') {
      try { await inviaEmail(env, emailAccessoConsulente({ consulente: esiste, link: await nuovoLink(env, richiesta, esiste.id) })); }
      catch (e) { console.error('email accesso (registrazione doppia)', e.message); }
    }
    return risposta({ messaggio });
  }

  const adesso = new Date();
  const nota = `Registrato dal modulo online il ${adesso.toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}; consenso privacy dato.`;
  const r = await env.DB.prepare(
    `INSERT INTO consulenti (nome, cognome, ragione_sociale, piva_cf, pec, email, telefono, compenso_pct, stato, note, creato_il)
     VALUES (?, ?, ?, ?, ?, ?, ?, 40, 'in_attesa_contratto', ?, ?)`
  ).bind(d.nome, d.cognome, d.ragioneSociale, d.pivaCf, d.pec, d.email, d.telefono, nota, adesso.toISOString()).run();
  const id = r.meta.last_row_id;
  const codice = await creaCodice(env, { base: d.cognome, scontoPct: 20, consulenteId: id });
  console.log('consulente registrato dal modulo', id, codice);

  const consulente = { ...d, id, codice };
  try { await inviaEmail(env, emailRegistrazioneConsulente({ consulente, link: await nuovoLink(env, richiesta, id) })); }
  catch (e) { console.error('email registrazione consulente', e.message); }
  if (env.EMAIL_AMMINISTRATORE) {
    try { await inviaEmail(env, emailNuovoConsulenteAdmin({ consulente, a: env.EMAIL_AMMINISTRATORE })); }
    catch (e) { console.error('email nuovo consulente admin', e.message); }
  }
  return risposta({ messaggio });
}

/**
 * Il link dell'email apre solo una pagina con il pulsante "Entra": il token si consuma con il POST.
 * Così i controlli antivirus delle caselle di posta, che aprono i link in anticipo, non lo bruciano.
 */
function paginaEntra(url) {
  const token = (url.searchParams.get('t') || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 60);
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Entra — Area consulenti</title>
<style>body{font:16px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;background:#f9fafb;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
form{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:28px;text-align:center}button{background:#111;color:#fff;border:0;border-radius:8px;padding:12px 24px;font-size:16px;cursor:pointer}</style>
</head><body><form method="post" action="/entra"><p>Area consulenti · MB Consulting</p><input type="hidden" name="t" value="${token}"><button type="submit">Entra</button></form></body></html>`;
}

async function entra(env, richiesta) {
  let token = '';
  try { token = String((await richiesta.formData()).get('t') || ''); } catch (e) { /* vuoto */ }
  const torna = (q) => new Response(null, { status: 302, headers: { Location: `/${q}`, ...SICUREZZA } });
  if (!/^[A-Za-z0-9_-]{40,50}$/.test(token)) return torna('?errore=link');
  const hash = await sha256(token);
  const adesso = new Date().toISOString();
  // uso singolo: solo un aggiornamento può riuscire
  const r = await env.DB.prepare(
    'UPDATE accessi_consulenti SET usato_il = ? WHERE token_hash = ? AND usato_il IS NULL AND scade_il > ?'
  ).bind(adesso, hash, adesso).run();
  if (!r.meta || !r.meta.changes) {
    await registraEvento(env, richiesta, 'link_accesso_non_valido', 'link scaduto, già usato o inventato');
    return torna('?errore=link');
  }
  const a = await env.DB.prepare('SELECT consulente_id FROM accessi_consulenti WHERE token_hash = ?').bind(hash).first();
  // pulizia dei link vecchi
  await env.DB.prepare('DELETE FROM accessi_consulenti WHERE scade_il < ?')
    .bind(new Date(Date.now() - 24 * 3600 * 1000).toISOString()).run();
  return new Response(null, {
    status: 302, headers: { Location: '/', 'Set-Cookie': await cookieSessione(env, a.consulente_id), ...SICUREZZA },
  });
}

export default {
  async fetch(richiesta, env) {
    const url = new URL(richiesta.url);
    const metodo = richiesta.method;
    const { pathname } = url;

    if (await ipBloccato(env, richiesta)) return risposta('Accesso temporaneamente bloccato', 403, 'text/plain; charset=utf-8');

    if (metodo === 'GET' && (pathname === '/' || pathname === '/index.html' || pathname === '/registrati')) return risposta(PAGINA, 200, 'text/html; charset=utf-8');
    if (metodo === 'GET' && pathname === '/app.js') return risposta(SCRIPT, 200, 'text/javascript; charset=utf-8');
    if (metodo === 'GET' && pathname === '/robots.txt') return risposta('User-agent: *\nDisallow: /\n', 200, 'text/plain');
    if (metodo === 'GET' && pathname === '/favicon.ico') return new Response(null, { status: 204 });
    if (metodo === 'GET' && pathname === '/entra') return risposta(paginaEntra(url), 200, 'text/html; charset=utf-8');
    if (metodo === 'POST' && pathname === '/entra') {
      try { return await entra(env, richiesta); } catch (e) {
        console.error('entra', e.message);
        return risposta(PAGINA_ERRORE('Area non ancora attiva. Riprova più tardi.'), 503, 'text/html; charset=utf-8');
      }
    }

    if (pathname.startsWith('/api/')) {
      // le chiamate arrivano solo dalla pagina stessa
      if (richiesta.headers.get('X-Area') !== '1' && !pathname.endsWith('.csv')) {
        return risposta({ errore: 'Richiesta non ammessa' }, 403);
      }
      try {
        if (metodo === 'POST' && pathname === '/api/accesso') return await chiediLink(env, richiesta);
        if (metodo === 'POST' && pathname === '/api/registrazione') return await registra(env, richiesta);
        if (metodo === 'POST' && pathname === '/api/esci') {
          return risposta({ ok: true }, 200, undefined, { 'Set-Cookie': `${COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0` });
        }
        const id = await sessione(env, richiesta);
        if (!id) return risposta({ errore: 'Accesso richiesto' }, 401);
        if (metodo === 'GET' && pathname === '/api/cruscotto') {
          return risposta(await cruscotto(env, id, url.searchParams.get('da'), url.searchParams.get('a')));
        }
        if (metodo === 'GET' && pathname === '/api/ordini.csv') {
          const dati = await cruscotto(env, id, url.searchParams.get('da'), url.searchParams.get('a'));
          return risposta(csvCruscotto(dati), 200, 'text/csv; charset=utf-8', {
            'Content-Disposition': `attachment; filename="ordini-${dati.periodo.da}_${dati.periodo.a}.csv"`,
          });
        }
      } catch (e) {
        console.error('area consulenti', e.message);
        return risposta({ errore: 'Servizio non disponibile, riprova più tardi' }, 500);
      }
      return risposta({ errore: 'Non trovato' }, 404);
    }

    await registraEvento(env, richiesta, 'percorso_inesistente', 'area consulenti');
    return risposta('Non trovato', 404, 'text/plain; charset=utf-8');
  },
};
