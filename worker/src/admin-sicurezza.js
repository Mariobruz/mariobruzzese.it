/**
 * admin-sicurezza.js — scheda "Sicurezza" del pannello.
 *
 * Viene accodata ad app.js. Mostra gli eventi sospetti registrati dai Worker
 * (ultimi 1–90 giorni), gli IP più ricorrenti, gli IP bloccati con il pulsante
 * per sbloccarli e il link per scaricare il CSV da allegare a una segnalazione.
 */
export const SCRIPT_SICUREZZA = String.raw`
(function () {
  'use strict';
  var NOMI = {
    troppe_richieste: 'Troppe richieste',
    origine_non_ammessa: 'Invio non partito dal sito',
    corpo_troppo_grande: 'Richiesta troppo grande',
    richiesta_illeggibile: 'Richiesta illeggibile',
    antibot_fallito: 'Anti-bot non superato',
    dati_manomessi: 'Dati manomessi',
    totale_diverso: 'Totale diverso dal catalogo',
    firma_stripe_non_valida: 'Finto avviso di pagamento',
    percorso_inesistente: 'Scansione di percorsi',
    accesso_admin_negato: 'Accesso al pannello negato',
    ip_bloccato: 'IP bloccato 24 ore'
  };
  var giorni = 30;

  function el(tag, attr, testo) {
    var e = document.createElement(tag);
    if (attr) Object.keys(attr).forEach(function (k) { e.setAttribute(k, attr[k]); });
    if (testo !== undefined) e.textContent = testo;
    return e;
  }
  function quando(s) {
    var d = new Date(String(s).replace(' ', 'T') + 'Z');
    return isNaN(d) ? String(s) : d.toLocaleString('it-IT');
  }
  function richiesta(url, opzioni) {
    opzioni = opzioni || {};
    opzioni.headers = Object.assign({ 'Content-Type': 'application/json', 'X-Pannello': '1' }, opzioni.headers || {});
    return fetch(url, opzioni).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) throw new Error(d.errore || ('Errore ' + r.status));
        return d;
      });
    });
  }

  var nav = document.querySelector('nav.schede-vista');
  var visteAltre = ['vista-ordini', 'vista-visite'];
  var tab = el('button', { id: 'tab-sicurezza' }, 'Sicurezza');
  nav.appendChild(tab);
  var vista = el('main', { id: 'vista-sicurezza' });
  vista.hidden = true;
  document.getElementById('vista-ordini').after(vista);

  function mostra() {
    visteAltre.forEach(function (id) { var v = document.getElementById(id); if (v) v.hidden = true; });
    nav.querySelectorAll('button').forEach(function (b) { b.classList.remove('attivo'); });
    tab.classList.add('attivo');
    vista.hidden = false;
    carica();
  }
  tab.addEventListener('click', mostra);
  ['tab-ordini', 'tab-visite'].forEach(function (id) {
    var b = document.getElementById(id);
    if (b) b.addEventListener('click', function () { vista.hidden = true; tab.classList.remove('attivo'); });
  });

  function riquadro(titolo) {
    var s = el('section', { style: 'margin:16px 0;padding:14px 16px;border:1px solid #e5e7eb;border-radius:10px;background:#fff' });
    s.appendChild(el('h3', { style: 'margin:0 0 10px;font-size:15px' }, titolo));
    return s;
  }

  function disegna(dati, bloccati) {
    vista.textContent = '';
    var barra = el('div', { class: 'barra' });
    [1, 7, 30, 90].forEach(function (g) {
      var b = el('button', { class: g === giorni ? 'attivo' : '' }, g === 1 ? 'Oggi' : 'Ultimi ' + g + ' giorni');
      b.addEventListener('click', function () { giorni = g; carica(); });
      barra.appendChild(b);
    });
    var csv = el('a', { href: '/api/sicurezza.csv?giorni=' + giorni, class: 'link', style: 'margin-left:auto' }, 'Scarica CSV (prove)');
    barra.appendChild(csv);
    vista.appendChild(barra);

    if (!dati.configurato) {
      vista.appendChild(el('div', { class: 'vuoto' }, 'Registro non configurato: manca il token CF_API_TOKEN nel pannello.'));
      return;
    }
    var eventi = dati.eventi || [];

    // IP bloccati
    var rb = riquadro('IP bloccati adesso (' + bloccati.length + ')');
    if (!bloccati.length) rb.appendChild(el('div', { class: 'secondario' }, 'Nessuno.'));
    bloccati.forEach(function (b) {
      var riga = el('div', { style: 'display:flex;gap:12px;align-items:center;padding:4px 0' });
      riga.appendChild(el('code', null, b.ip));
      riga.appendChild(el('span', { class: 'secondario' }, 'fino al ' + new Date(b.finoA).toLocaleString('it-IT') + ' · ' + (NOMI[b.motivo] || b.motivo || '')));
      var sb = el('button', null, 'Sblocca');
      sb.addEventListener('click', function () {
        richiesta('/api/sicurezza/sblocca', { method: 'POST', body: JSON.stringify({ ip: b.ip }) })
          .then(carica).catch(function (e) { alert(e.message); });
      });
      riga.appendChild(sb);
      rb.appendChild(riga);
    });
    vista.appendChild(rb);

    // riepilogo per tipo e IP più ricorrenti
    var perTipo = {}, perIp = {};
    eventi.forEach(function (e) {
      perTipo[e.tipo] = (perTipo[e.tipo] || 0) + 1;
      var k = e.ip || '?';
      if (!perIp[k]) perIp[k] = { n: 0, paese: e.paese, rete: e.rete, asn: e.asn };
      perIp[k].n++;
    });
    var rr = riquadro(eventi.length + ' eventi negli ultimi ' + (dati.giorni || giorni) + ' giorni');
    Object.keys(perTipo).sort(function (a, b) { return perTipo[b] - perTipo[a]; }).forEach(function (t) {
      rr.appendChild(el('div', null, (NOMI[t] || t) + ': ' + perTipo[t]));
    });
    if (!eventi.length) rr.appendChild(el('div', { class: 'secondario' }, 'Nessun evento sospetto.'));
    vista.appendChild(rr);

    var ips = Object.keys(perIp).sort(function (a, b) { return perIp[b].n - perIp[a].n; }).slice(0, 10);
    if (ips.length) {
      var ri = riquadro('IP più ricorrenti');
      ips.forEach(function (ip) {
        var x = perIp[ip];
        ri.appendChild(el('div', null, ip + ' — ' + x.n + ' eventi · ' + [x.paese, x.asn, x.rete].filter(Boolean).join(' · ')));
      });
      vista.appendChild(ri);
    }

    // elenco completo
    if (eventi.length) {
      var wrap = el('div', { style: 'overflow:auto' });
      var t = el('table');
      var th = el('tr');
      ['Quando', 'Tipo', 'IP', 'Paese', 'Rete', 'Richiesta', 'Dettaglio', 'User agent'].forEach(function (h) { th.appendChild(el('th', null, h)); });
      var thead = el('thead'); thead.appendChild(th); t.appendChild(thead);
      var tb = el('tbody');
      eventi.slice(0, 500).forEach(function (e) {
        var tr = el('tr');
        [quando(e.quando), NOMI[e.tipo] || e.tipo, e.ip, [e.paese, e.citta].filter(Boolean).join(' '), [e.asn, e.rete].filter(Boolean).join(' '),
          e.richiesta, e.dettaglio, String(e.userAgent || '').slice(0, 80)].forEach(function (v) { tr.appendChild(el('td', null, v || '')); });
        tb.appendChild(tr);
      });
      t.appendChild(tb);
      wrap.appendChild(t);
      vista.appendChild(wrap);
    }
    vista.appendChild(el('p', { class: 'secondario', style: 'margin-top:12px' },
      'Orari nel fuso del browser; nel CSV sono in UTC. Cloudflare conserva gli eventi per circa 90 giorni: per una denuncia scarica il CSV e conservalo.'));
  }

  function carica() {
    vista.textContent = '';
    vista.appendChild(el('div', { class: 'vuoto' }, 'Caricamento…'));
    Promise.all([richiesta('/api/sicurezza?giorni=' + giorni), richiesta('/api/sicurezza/bloccati')])
      .then(function (r) { disegna(r[0], r[1].bloccati || []); })
      .catch(function (e) { vista.textContent = ''; vista.appendChild(el('div', { class: 'vuoto' }, 'Errore: ' + e.message)); });
  }
})();
`;
