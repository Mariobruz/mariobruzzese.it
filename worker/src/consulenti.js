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
// pagina pubblica del programma consulenti sul sito (presentazione + registrazione)
const PAGINA_SITO = 'https://www.mariobruzzese.it/consulenti';
// il modulo di registrazione sul sito chiama questo Worker da qui
const ORIGINI_SITO = ['https://www.mariobruzzese.it', 'https://mariobruzzese.it'];
const cors = (richiesta) => {
  const o = richiesta.headers.get('Origin');
  return ORIGINI_SITO.includes(o) ? {
    'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Area', 'Access-Control-Max-Age': '86400', Vary: 'Origin',
  } : {};
};

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
<meta name="theme-color" content="#0b0b0c">
<title>Area consulenti — MB Consulting</title>
<style>
*{box-sizing:border-box}
button,input,select{font-family:inherit}
body{margin:0;font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,sans-serif;color:#111;background:#f5f5f6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit}
.top{position:sticky;top:0;z-index:5;background:rgba(11,11,12,.96);backdrop-filter:blur(8px);color:#fff}
.top-in{max-width:1080px;margin:0 auto;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;gap:12px}
.marchio{display:flex;align-items:center;gap:10px;text-decoration:none}
.marchio b{display:inline-flex;width:34px;height:34px;border-radius:9px;background:#fff;color:#0b0b0c;align-items:center;justify-content:center;font-family:inherit;font-weight:800;font-size:14px;line-height:1;letter-spacing:-.02em}
.marchio span{display:flex;flex-direction:column;line-height:1.15}
.marchio small{color:#a1a1aa;font-size:12px}
.utente{display:flex;align-items:center;gap:10px;font-size:14px}
.utente .iniz{width:32px;height:32px;border-radius:50%;background:#27272a;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px}
.utente button{background:transparent;color:#fff;border:1px solid #3f3f46;border-radius:8px;padding:6px 12px;cursor:pointer;font:inherit}
.utente button:hover{border-color:#fff}
main{max-width:1080px;margin:0 auto;padding:22px 20px 60px}
.barra{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 14px}
.barra .chip{border:1px solid #d4d4d8;background:#fff;border-radius:999px;padding:6px 13px;font-family:inherit;font-weight:600;font-size:13px;line-height:1;cursor:pointer}
.barra .chip.on{background:#111;color:#fff;border-color:#111}
.barra input{padding:6px 8px;border:1px solid #d4d4d8;border-radius:8px;font:inherit;font-size:13px;background:#fff}
.barra .csv{margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-weight:600;font-size:14px;text-decoration:none;border:1px solid #d4d4d8;background:#fff;border-radius:10px;padding:7px 12px}
.barra .csv:hover{background:#f4f4f5}
.schermo{display:grid;grid-template-columns:1.05fr 1fr;min-height:calc(100vh - 58px);width:100vw;margin:-22px 0 -60px calc(50% - 50vw)}
.lato{background:linear-gradient(160deg,#0b0b0c,#27272a 70%,#3f3f46);color:#fff;padding:56px 48px;display:flex;flex-direction:column;justify-content:center}
.lato .sopra{text-transform:uppercase;letter-spacing:.1em;font-size:12px;color:#a1a1aa;margin:0 0 10px}
.lato h1{font-size:36px;line-height:1.12;margin:0 0 14px;letter-spacing:-.02em}
.lato p.int{color:#d4d4d8;margin:0 0 28px;max-width:460px}
.vant{display:grid;gap:16px;margin:0;padding:0;list-style:none}
.vant li{display:flex;gap:14px;align-items:flex-start}
.vant .n{flex:none;width:56px;height:44px;border-radius:12px;background:#fff;color:#0b0b0c;display:flex;align-items:center;justify-content:center;font-family:inherit;font-weight:800;font-size:15px;line-height:1}
.vant strong{display:block}
.vant span{color:#a1a1aa;font-size:14px}
.modulo{display:flex;align-items:center;justify-content:center;padding:40px 24px}
.carta{width:100%;max-width:460px;background:#fff;border:1px solid #e7e7ea;border-radius:18px;padding:30px;box-shadow:0 10px 30px -12px rgba(0,0,0,.12)}
.carta h2{margin:0 0 6px;font-size:24px;letter-spacing:-.01em}
.carta .sub{color:#6b7280;margin:0 0 20px;font-size:14px}
.griglia2{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}
.carta label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:12px}
.carta label input{display:block;width:100%;margin-top:5px;padding:11px 12px;border:1px solid #d4d4d8;border-radius:10px;font:inherit;font-weight:400;background:#fff;transition:border-color .15s,box-shadow .15s}
.carta label input:focus{outline:none;border-color:#111;box-shadow:0 0 0 3px rgba(17,17,17,.08)}
.carta .spunta{display:flex;gap:10px;align-items:flex-start;font-weight:400;color:#4b5563;margin:6px 0 18px}
.carta .spunta input{width:18px;height:18px;margin:2px 0 0;flex:none;accent-color:#111}
.carta .primario{width:100%;padding:13px;border:0;border-radius:10px;background:#111;color:#fff;font-family:inherit;font-weight:700;font-size:15px;line-height:1;cursor:pointer}
.carta .primario:hover{background:#27272a}
.carta .primario:disabled{opacity:.6;cursor:default}
.carta .esito{font-size:14px;margin:12px 0 0;color:#b91c1c;min-height:1em}
.carta .esito.ok{color:#047857}
.carta .piede{margin:18px 0 0;padding-top:16px;border-top:1px solid #f4f4f5;font-size:14px;color:#6b7280;text-align:center}
.carta .piede a{color:#111;font-weight:600}
.esca{position:absolute;left:-5000px;width:1px;height:1px;overflow:hidden}
.grazie{text-align:center}
.grazie .tondo{width:64px;height:64px;border-radius:50%;background:#ecfdf5;color:#047857;display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
.grazie .tondo svg{width:30px;height:30px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.caricamento{padding:80px 0;text-align:center;color:#6b7280}
.wa-fisso{position:fixed;right:20px;bottom:20px;z-index:20;display:inline-flex;align-items:center;gap:8px;background:#25D366;color:#fff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:999px;box-shadow:0 10px 25px -8px rgba(0,0,0,.35)}
.wa-fisso:hover{background:#1ebe5b}
.wa-ico{width:22px;height:22px;fill:currentColor;flex:none}
.wa-riga{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;padding:11px;border:2px solid #25D366;border-radius:10px;color:#111;text-decoration:none;font-weight:600;font-size:14px}
.wa-riga:hover{background:#25D3661a}
.wa-riga .wa-ico{color:#1ebe5b;width:20px;height:20px}
.aiuto{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;background:#fff;border:1px solid #e7e7ea;border-radius:16px;padding:18px 22px;margin:0 0 18px}
.aiuto strong{display:block;font-size:16px}.aiuto span{color:#6b7280;font-size:14px}
.aiuto .wa-riga{margin:0;padding:10px 16px}
.aiuto .wa-riga span{color:#111;font-size:14px}
@media (max-width:600px){.wa-fisso span{display:none}.wa-fisso{padding:14px;right:16px;bottom:16px}}
@media (max-width:860px){.schermo{grid-template-columns:1fr}.lato{padding:36px 24px}.lato h1{font-size:28px}.modulo{padding:24px 16px 48px}}
@media (max-width:480px){.utente .nome{display:none}.griglia2{grid-template-columns:1fr}.carta{padding:22px}.marchio small{display:none}}
${STILE_CRUSCOTTO}
</style></head><body>
<header class="top"><div class="top-in"><a class="marchio" href="/"><b>MB</b><span><strong>MB Consulting</strong><small>Area consulenti</small></span></a><div class="utente" id="utente"></div></div></header>
<main id="app"><p class="caricamento">Caricamento…</p></main>
<script src="/app.js"></script></body></html>`;

const SCRIPT = RENDER_CRUSCOTTO + String.raw`
(function () {
  'use strict';
  var app = document.getElementById('app');
  var oggi = new Date().toISOString().slice(0, 10);
  var giorniFa = function (g) { return new Date(Date.now() - g * 864e5).toISOString().slice(0, 10); };
  var periodo = { da: giorniFa(89), a: oggi, preset: 89 };
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
  function campo(etichetta, attr) {
    var l = el('label', null, etichetta);
    var i = el('input', attr);
    l.appendChild(i);
    return { l: l, i: i };
  }

  // colonna scura con i vantaggi (accesso e registrazione)
  function lato(titolo, testo) {
    var s = el('section', { class: 'lato' });
    s.appendChild(el('p', { class: 'sopra' }, 'Programma consulenti'));
    s.appendChild(el('h1', null, titolo));
    s.appendChild(el('p', { class: 'int' }, testo));
    var u = el('ul', { class: 'vant' });
    [['−20%', 'Sconto per i tuoi clienti', 'Su tutti i corsi e-learning sulla sicurezza, con attestato valido.'],
     ['40%', 'Il tuo compenso', 'Calcolato sull\'incassato di ogni ordine pagato con il tuo codice.'],
     ['24/7', 'Tutto sotto controllo', 'Ordini, partecipanti e compensi in tempo reale nella tua area.']].forEach(function (v) {
      var li = el('li');
      li.appendChild(el('span', { class: 'n' }, v[0]));
      var t = el('div'); t.appendChild(el('strong', null, v[1])); t.appendChild(el('span', null, v[2]));
      li.appendChild(t); u.appendChild(li);
    });
    s.appendChild(u);
    return s;
  }
  // WhatsApp di MB Consulting (stesso numero del sito)
  var WHATSAPP = '393291747521';
  var LOGO_WA = '<path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.2 1.3 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.8 1 3.8 1.5 5.8 1.5 6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.6-8.4z"/>';
  function logoWa() {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'wa-ico'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = LOGO_WA; return s;
  }
  function linkWa(testo) { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(testo); }
  /** Pulsante verde fisso in basso a destra, con il messaggio adatto alla pagina. */
  function whatsapp(testo) {
    var a = document.getElementById('wa-fisso');
    if (!a) {
      a = el('a', { id: 'wa-fisso', class: 'wa-fisso', target: '_blank', rel: 'noopener', 'aria-label': 'Scrivici su WhatsApp' });
      a.appendChild(logoWa()); a.appendChild(el('span', null, 'Scrivici su WhatsApp'));
      document.body.appendChild(a);
    }
    a.setAttribute('href', linkWa(testo));
  }
  function rigaWa(testo, etichetta) {
    var a = el('a', { class: 'wa-riga', href: linkWa(testo), target: '_blank', rel: 'noopener' });
    a.appendChild(logoWa()); a.appendChild(el('span', null, etichetta));
    return a;
  }

  function schermo(titolo, testo, carta) {
    app.textContent = '';
    var g = el('div', { class: 'schermo' });
    g.appendChild(lato(titolo, testo));
    var m = el('section', { class: 'modulo' }); m.appendChild(carta);
    g.appendChild(m);
    app.appendChild(g);
  }
  function grazie(carta, titolo, testo) {
    carta.textContent = '';
    var g = el('div', { class: 'grazie' });
    var t = el('div', { class: 'tondo' });
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24');
    s.innerHTML = '<path d="M20 6 9 17l-5-5"/>'; t.appendChild(s);
    g.appendChild(t); g.appendChild(el('h2', null, titolo)); g.appendChild(el('p', { class: 'sub' }, testo));
    carta.appendChild(g);
  }

  function accesso(msg) {
    var c = el('div', { class: 'carta' });
    c.appendChild(el('h2', null, 'Accedi alla tua area'));
    c.appendChild(el('p', { class: 'sub' }, 'Niente password: scrivi la tua email e ti mandiamo un link per entrare, valido 15 minuti.'));
    var e = campo('Email', { type: 'email', placeholder: 'nome@studio.it', autocomplete: 'email' });
    c.appendChild(e.l);
    var bt = el('button', { class: 'primario', type: 'button' }, 'Mandami il link');
    var esito = el('p', { class: 'esito', role: 'status' }, msg || '');
    var invia = function () {
      bt.disabled = true; esito.className = 'esito'; esito.textContent = '';
      api('/api/accesso', { method: 'POST', body: JSON.stringify({ email: e.i.value }) })
        .then(function () { grazie(c, 'Controlla la tua email', 'Se l\'indirizzo è registrato, il link arriva fra pochi istanti. Guarda anche nella cartella spam o posta indesiderata.'); })
        .catch(function (x) { esito.textContent = x.message; bt.disabled = false; });
    };
    bt.addEventListener('click', invia);
    e.i.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') invia(); });
    c.appendChild(bt); c.appendChild(esito);
    var p = el('p', { class: 'piede' }, 'Non sei ancora registrato? ');
    p.appendChild(el('a', { href: 'https://www.mariobruzzese.it/consulenti' }, 'Diventa consulente'));
    c.appendChild(p);
    c.appendChild(rigaWa('Ciao, sono un consulente e ho bisogno di aiuto per accedere all\'area consulenti.', 'Problemi ad accedere? Scrivici su WhatsApp'));
    whatsapp('Ciao, sono un consulente e ho bisogno di aiuto per accedere all\'area consulenti.');
    schermo('Bentornato nella tua area consulenti', 'Il tuo codice sconto, gli ordini dei tuoi clienti e i tuoi compensi, sempre aggiornati.', c);
  }

  function registrazione() {
    var c = el('div', { class: 'carta' });
    c.appendChild(el('h2', null, 'Registrati come consulente'));
    c.appendChild(el('p', { class: 'sub' }, 'Bastano due minuti. Ricevi subito l\'accesso alla tua area; il codice sconto si attiva dopo l\'accordo di collaborazione.'));
    var campi = {};
    var riga = el('div', { class: 'griglia2' });
    [['nome', 'Nome *', 'text', 'given-name'], ['cognome', 'Cognome *', 'text', 'family-name']].forEach(function (x) {
      var f = campo(x[1], { type: x[2], autocomplete: x[3], name: x[0] }); campi[x[0]] = f.i; riga.appendChild(f.l);
    });
    c.appendChild(riga);
    [['ragioneSociale', 'Studio / ragione sociale', 'text', 'organization', 'Studio Rossi'],
     ['pivaCf', 'Partita IVA o codice fiscale *', 'text', 'off', ''],
     ['email', 'Email *', 'email', 'email', 'nome@studio.it']].forEach(function (x) {
      var f = campo(x[1], { type: x[2], autocomplete: x[3], name: x[0], placeholder: x[4] }); campi[x[0]] = f.i; c.appendChild(f.l);
    });
    var riga2 = el('div', { class: 'griglia2' });
    [['telefono', 'Telefono *', 'tel', 'tel'], ['pec', 'PEC', 'email', 'off']].forEach(function (x) {
      var f = campo(x[1], { type: x[2], autocomplete: x[3], name: x[0] }); campi[x[0]] = f.i; riga2.appendChild(f.l);
    });
    c.appendChild(riga2);
    // campo trappola per i robot: le persone non lo vedono
    var trappola = el('input', { type: 'text', name: 'sito', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' });
    var esca = el('div', { class: 'esca' }); esca.appendChild(trappola); c.appendChild(esca);
    var sp = el('label', { class: 'spunta' });
    var ok = el('input', { type: 'checkbox' });
    var testo = el('span', null, 'Ho letto l\'');
    testo.appendChild(el('a', { href: 'https://www.mariobruzzese.it/privacy', target: '_blank', rel: 'noopener' }, 'informativa privacy'));
    testo.appendChild(document.createTextNode(' e acconsento al trattamento dei miei dati per la gestione della collaborazione. *'));
    sp.appendChild(ok); sp.appendChild(testo); c.appendChild(sp);
    var bt = el('button', { class: 'primario', type: 'button' }, 'Registrati');
    var esito = el('p', { class: 'esito', role: 'status' });
    bt.addEventListener('click', function () {
      var corpo = { privacy: ok.checked, sito: trappola.value };
      Object.keys(campi).forEach(function (k) { corpo[k] = campi[k].value; });
      bt.disabled = true; esito.textContent = '';
      bt.textContent = 'Invio in corso…';
      api('/api/registrazione', { method: 'POST', body: JSON.stringify(corpo) })
        .then(function (d) { grazie(c, 'Registrazione ricevuta!', d.messaggio); window.scrollTo(0, 0); })
        .catch(function (e) { esito.textContent = e.message; bt.disabled = false; bt.textContent = 'Registrati'; });
    });
    c.appendChild(bt); c.appendChild(esito);
    var gia = el('p', { class: 'piede' }, 'Sei già registrato? ');
    gia.appendChild(el('a', { href: '/' }, 'Accedi'));
    c.appendChild(gia);
    c.appendChild(rigaWa('Ciao, vorrei informazioni sul programma consulenti di MB Consulting.', 'Hai domande? Scrivici su WhatsApp'));
    whatsapp('Ciao, vorrei informazioni sul programma consulenti di MB Consulting.');
    schermo('Offri ai tuoi clienti i corsi sulla sicurezza, a un prezzo migliore', 'Corsi e-learning D.Lgs. 81/08 e HACCP in convenzione con O.P.N. Italia Lavoro. Tu segnali, noi gestiamo iscrizioni, piattaforma e attestati.', c);
  }

  function intestazione(cons) {
    var u = document.getElementById('utente');
    u.textContent = '';
    var iniz = ((cons.nome || ' ')[0] + (cons.cognome || ' ')[0]).toUpperCase();
    u.appendChild(el('span', { class: 'iniz' }, iniz));
    u.appendChild(el('span', { class: 'nome' }, cons.nome + ' ' + cons.cognome));
    var esci = el('button', { type: 'button' }, 'Esci');
    esci.addEventListener('click', function () { api('/api/esci', { method: 'POST' }).then(function () { location.href = '/'; }); });
    u.appendChild(esci);
  }

  function barra() {
    var bar = el('div', { class: 'barra' });
    [['30 giorni', 29], ['90 giorni', 89], ['12 mesi', 364]].forEach(function (x) {
      var b = el('button', { type: 'button', class: 'chip' + (periodo.preset === x[1] ? ' on' : '') }, x[0]);
      b.addEventListener('click', function () { periodo = { da: giorniFa(x[1]), a: oggi, preset: x[1] }; carica(); });
      bar.appendChild(b);
    });
    var da = el('input', { type: 'date', value: periodo.da, 'aria-label': 'Dal' });
    var a = el('input', { type: 'date', value: periodo.a, 'aria-label': 'Al' });
    var cambia = function () { periodo = { da: da.value || periodo.da, a: a.value || periodo.a, preset: null }; carica(); };
    da.addEventListener('change', cambia); a.addEventListener('change', cambia);
    bar.appendChild(da); bar.appendChild(a);
    bar.appendChild(el('a', { class: 'csv', href: '/api/ordini.csv?da=' + periodo.da + '&a=' + periodo.a }, 'Scarica CSV'));
    return bar;
  }

  function carica() {
    api('/api/cruscotto?da=' + periodo.da + '&a=' + periodo.a).then(function (d) {
      if (d._stato === 401) return accesso();
      intestazione(d.consulente);
      app.textContent = '';
      app.appendChild(barra());
      var box = el('div'); app.appendChild(box);
      disegnaCruscotto(box, d, {});
      var cons = d.consulente;
      var cod = (d.codici || []).filter(function (k) { return k.attivo; }).map(function (k) { return k.codice; }).join(', ');
      var msg = 'Ciao, sono ' + cons.nome + ' ' + cons.cognome + (cod ? ' (codice ' + cod + ')' : '') + ' e ti scrivo dall\'area consulenti.';
      var aiuto = el('section', { class: 'aiuto' });
      var t = el('div'); t.appendChild(el('strong', null, 'Serve aiuto?')); t.appendChild(el('span', null, 'Per domande su ordini, clienti o compensi scrivici: ti rispondiamo su WhatsApp.'));
      aiuto.appendChild(t); aiuto.appendChild(rigaWa(msg, 'Scrivici su WhatsApp'));
      app.appendChild(aiuto);
      whatsapp(msg);
    }).catch(function (e) { app.textContent = ''; app.appendChild(el('p', { class: 'caricamento' }, 'Errore: ' + e.message)); });
  }

  var q = new URLSearchParams(location.search);
  if (location.pathname === '/registrati') registrazione();
  else if (q.get('errore') === 'link') { accesso('Il link è scaduto o è già stato usato: chiedine uno nuovo qui sotto.'); history.replaceState(null, '', '/'); }
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
<style>*{box-sizing:border-box}body{font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:linear-gradient(160deg,#0b0b0c,#3f3f46);display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:20px}
form{background:#fff;border-radius:18px;padding:34px 30px;text-align:center;max-width:380px;width:100%;box-shadow:0 20px 50px -20px rgba(0,0,0,.5)}
.m{display:inline-flex;width:46px;height:46px;border-radius:12px;background:#0b0b0c;color:#fff;align-items:center;justify-content:center;font-weight:800;margin-bottom:12px}
h1{font-size:21px;margin:0 0 6px}p{color:#6b7280;margin:0 0 22px;font-size:14px}
button{width:100%;background:#111;color:#fff;border:0;border-radius:10px;padding:13px 24px;font-family:inherit;font-weight:700;font-size:16px;line-height:1;cursor:pointer}button:hover{background:#27272a}</style>
</head><body><form method="post" action="/entra"><div class="m">MB</div><h1>Area consulenti</h1><p>Premi il pulsante per entrare nella tua area riservata.</p><input type="hidden" name="t" value="${token}"><button type="submit">Entra</button></form></body></html>`;
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

    // la registrazione ora sta sul sito: il vecchio indirizzo porta lì
    if (metodo === 'GET' && pathname === '/registrati') return new Response(null, { status: 301, headers: { Location: PAGINA_SITO } });
    if (metodo === 'OPTIONS' && pathname === '/api/registrazione') return new Response(null, { status: 204, headers: cors(richiesta) });
    if (metodo === 'GET' && (pathname === '/' || pathname === '/index.html')) return risposta(PAGINA, 200, 'text/html; charset=utf-8');
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
        if (metodo === 'POST' && pathname === '/api/registrazione') {
          const r = await registra(env, richiesta);
          Object.entries(cors(richiesta)).forEach(([k, v]) => r.headers.set(k, v));
          return r;
        }
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
