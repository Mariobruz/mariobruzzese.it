/**
 * admin-provenienza.js — aggiunta al pannello ordini: quanto porta Google Ads.
 *
 * Viene accodato a app.js. In cima alla pagina mostra un riquadro con gli ordini
 * arrivati dagli annunci (totali, pagati, incasso, ultimi 7 giorni) e mette
 * l'etichetta "Google Ads" accanto al riferimento di quegli ordini, ovunque compaia.
 * La provenienza la salva il Worker delle iscrizioni (colonna ordini.provenienza).
 */
export const SCRIPT_PROVENIENZA = String.raw`
(function () {
  'use strict';
  var INCASSATI = ['pagato', 'caricato', 'completato'];
  var RIF = /MB-\d{4}-\d{4,}/g;
  var annunci = {};
  var box = null;
  var attesa = null;

  function euro(n) {
    return Number(n || 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
  }
  function el(tag, stile, testo) {
    var e = document.createElement(tag);
    if (stile) e.setAttribute('style', stile);
    if (testo !== undefined) e.textContent = testo;
    return e;
  }
  function voce(etichetta, valore) {
    var v = el('div', 'min-width:120px');
    v.appendChild(el('div', 'font-size:12px;opacity:.75', etichetta));
    v.appendChild(el('div', 'font-size:20px;font-weight:700', valore));
    return v;
  }

  function disegna(ordini) {
    var ads = ordini.filter(function (o) { return o.provenienza === 'google_ads'; });
    var incassati = ads.filter(function (o) { return INCASSATI.indexOf(o.stato) >= 0; });
    var incasso = incassati.reduce(function (s, o) { return s + Number(o.totale || 0); }, 0);
    var limite = Date.now() - 7 * 864e5;
    var settimana = ads.filter(function (o) { return Date.parse(o.creatoIl) >= limite; }).length;
    var tracciati = ordini.filter(function (o) { return o.provenienza; }).length;

    annunci = {};
    ads.forEach(function (o) { if (o.riferimento) annunci[o.riferimento] = true; });

    if (!box) {
      box = el('section', 'margin:12px auto;max-width:1100px;padding:12px 16px;border:1px solid #c7d2fe;' +
        'border-radius:10px;background:#eef2ff;color:#1e1b4b;font:14px system-ui,-apple-system,sans-serif');
      box.id = 'riepilogo-google-ads';
      document.body.insertBefore(box, document.body.firstChild);
    }
    box.textContent = '';
    box.appendChild(el('div', 'font-weight:700;margin-bottom:8px', 'Ordini da Google Ads'));
    var riga = el('div', 'display:flex;flex-wrap:wrap;gap:16px');
    riga.appendChild(voce('Ordini dagli annunci', String(ads.length)));
    riga.appendChild(voce('di cui incassati', String(incassati.length)));
    riga.appendChild(voce('Incasso', euro(incasso)));
    riga.appendChild(voce('Ultimi 7 giorni', String(settimana)));
    box.appendChild(riga);
    box.appendChild(el('div', 'font-size:12px;opacity:.7;margin-top:8px',
      'Conta gli ordini partiti da una visita arrivata da un annuncio (clic con gclid o utm Google cpc). ' +
      'Costi, clic e impressioni restano nella dashboard di Google Ads. Ordini con provenienza registrata: ' +
      tracciati + ' su ' + ordini.length + '.'));
    etichetta();
  }

  function etichetta() {
    if (!document.body) return;
    var giro = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var nodi = [];
    while (giro.nextNode()) nodi.push(giro.currentNode);
    nodi.forEach(function (n) {
      var padre = n.parentNode;
      if (!padre || (box && box.contains(padre))) return;
      if (padre.closest && padre.closest('.badge-google-ads, script, style, option, textarea')) return;
      var trovati = String(n.nodeValue || '').match(RIF);
      if (!trovati || !trovati.some(function (r) { return annunci[r]; })) return;
      var gia = padre.querySelector && padre.querySelector(':scope > .badge-google-ads');
      if (gia) return;
      var b = el('span', 'display:inline-block;margin-left:6px;padding:1px 6px;border-radius:999px;' +
        'background:#4f46e5;color:#fff;font-size:11px;font-weight:600;vertical-align:middle', 'Google Ads');
      b.className = 'badge-google-ads';
      padre.insertBefore(b, n.nextSibling);
    });
  }

  function aggiorna() {
    fetch('/api/ordini', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && Array.isArray(d.ordini)) disegna(d.ordini); })
      .catch(function () { /* il pannello funziona anche senza riquadro */ });
  }

  function avvia() {
    aggiorna();
    setInterval(aggiorna, 120000);
    new MutationObserver(function () {
      clearTimeout(attesa);
      attesa = setTimeout(etichetta, 150);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia);
  else avvia();
})();
`;
