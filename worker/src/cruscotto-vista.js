/**
 * cruscotto-vista.js — disegno del cruscotto di un consulente (solo DOM, niente HTML da stringhe).
 * Lo stesso codice serve all'area consulenti e alla "vista consulente" del pannello admin.
 * Definisce la funzione globale disegnaCruscotto(contenitore, dati, { sito }).
 */
export const RENDER_CRUSCOTTO = String.raw`
function disegnaCruscotto(box, dati, opz) {
  'use strict';
  opz = opz || {};
  var sito = opz.sito || 'https://www.mariobruzzese.it';
  function el(tag, attr, testo) {
    var e = document.createElement(tag);
    if (attr) Object.keys(attr).forEach(function (k) { e.setAttribute(k, attr[k]); });
    if (testo !== undefined && testo !== null) e.textContent = testo;
    return e;
  }
  function euro(n) { return Number(n || 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }); }
  function giorno(s) { var d = new Date(s); return isNaN(d) ? String(s || '') : d.toLocaleDateString('it-IT'); }
  function riquadro(titolo) {
    var s = el('section', { class: 'cr-box' });
    if (titolo) s.appendChild(el('h3', null, titolo));
    return s;
  }
  box.textContent = '';
  var c = dati.consulente || {};

  // codici e link da condividere
  var rc = riquadro('Il tuo codice sconto');
  // finché il consulente non è "Attivo" il codice non funziona: non lo mostriamo come da condividere
  var attivi = c.stato === 'attivo' ? (dati.codici || []).filter(function (k) { return k.attivo; }) : [];
  if (c.stato === 'in_attesa_contratto') {
    rc.appendChild(el('p', null, 'Registrazione ricevuta: il tuo codice sconto si attiva appena è completato l\'accordo di collaborazione. Ti avviseremo via email.'));
  } else if (!attivi.length) rc.appendChild(el('p', { class: 'cr-nota' }, 'Nessun codice attivo.'));
  attivi.forEach(function (k) {
    var link = sito + '/corsi-sicurezza?codice=' + encodeURIComponent(k.codice);
    var riga = el('div', { class: 'cr-codice' });
    riga.appendChild(el('strong', { class: 'cr-grande' }, k.codice));
    riga.appendChild(el('span', { class: 'cr-nota' }, 'sconto ' + k.scontoPct + '% per i tuoi clienti'));
    var l = el('div', { class: 'cr-link' });
    var inp = el('input', { type: 'text', readonly: 'readonly', value: link, 'aria-label': 'Link da condividere' });
    var b = el('button', { type: 'button' }, 'Copia link');
    b.addEventListener('click', function () {
      inp.select();
      (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(
        function () { b.textContent = 'Copiato'; setTimeout(function () { b.textContent = 'Copia link'; }, 1500); },
        function () { document.execCommand && document.execCommand('copy'); });
    });
    l.appendChild(inp); l.appendChild(b);
    riga.appendChild(l);
    rc.appendChild(riga);
  });
  box.appendChild(rc);

  // numeri del periodo
  var n = dati.numeri || {};
  var rn = riquadro('Periodo ' + giorno(dati.periodo.da) + ' – ' + giorno(dati.periodo.a));
  var griglia = el('div', { class: 'cr-griglia' });
  [['Click sul link', n.click], ['Ordini', n.ordini],
   ['Conversione', n.conversione == null ? '—' : n.conversione + '%'], ['Incassato', euro(n.incassato)],
   ['Compenso maturato', euro(n.compensoMaturato)], ['Compenso pagato', euro(n.compensoPagato)],
   ['Da ricevere (totale)', euro(n.daPagare)]].forEach(function (v) {
    var k = el('div', { class: 'cr-kpi' });
    k.appendChild(el('div', { class: 'cr-nota' }, v[0]));
    k.appendChild(el('div', { class: 'cr-grande' }, String(v[1] == null ? 0 : v[1])));
    griglia.appendChild(k);
  });
  rn.appendChild(griglia);
  rn.appendChild(el('p', { class: 'cr-nota' }, 'Click contati solo quando il link viene aperto; gli ordini contano solo se pagati.'));
  box.appendChild(rn);

  // ordini
  var ro = riquadro('Ordini con il tuo codice (' + (dati.ordini || []).length + ')');
  if (!(dati.ordini || []).length) ro.appendChild(el('p', { class: 'cr-nota' }, 'Nessun ordine pagato nel periodo.'));
  (dati.ordini || []).forEach(function (o) {
    var d = el('details', { class: 'cr-ordine' });
    var s = el('summary');
    s.appendChild(el('span', null, giorno(o.data) + ' · ' + (o.cliente.intestatario || '—') + ' · ' + o.partecipanti.length + ' iscrizioni'));
    s.appendChild(el('span', { class: 'cr-dx' }, euro(o.totale) + (o.compenso != null ? ' · compenso ' + euro(o.compenso) + (o.statoCompenso === 'pagato' ? ' (pagato)' : '') : '')));
    d.appendChild(s);
    var cl = o.cliente;
    d.appendChild(el('p', null, 'Riferimento ' + o.riferimento + ' · codice ' + (o.codice || '') +
      ' · ' + [cl.partitaIva ? 'P.IVA ' + cl.partitaIva : '', cl.codiceFiscale ? 'CF ' + cl.codiceFiscale : '', cl.email, cl.telefono,
        [cl.citta, cl.provincia].filter(Boolean).join(' ')].filter(Boolean).join(' · ')));
    var t = el('table', { class: 'cr-tab' });
    var h = el('tr');
    ['Partecipante', 'Codice fiscale', 'Email', 'Corso', 'Prezzo'].forEach(function (x) { h.appendChild(el('th', null, x)); });
    t.appendChild(h);
    o.partecipanti.forEach(function (p) {
      var r = el('tr');
      [p.nome + ' ' + p.cognome, p.codiceFiscale, p.email, (p.corso || '') + (p.ore ? ' · ' + p.ore + ' ore' : ''), euro(p.prezzo)]
        .forEach(function (x) { r.appendChild(el('td', null, x)); });
      t.appendChild(r);
    });
    var w = el('div', { class: 'cr-scroll' }); w.appendChild(t); d.appendChild(w);
    ro.appendChild(d);
  });
  box.appendChild(ro);

  // pagamenti ricevuti
  var rp = riquadro('Pagamenti ricevuti');
  if (!(dati.pagamenti || []).length) rp.appendChild(el('p', { class: 'cr-nota' }, 'Nessun pagamento registrato.'));
  (dati.pagamenti || []).forEach(function (x) {
    rp.appendChild(el('div', null, giorno(x.data) + ' · ' + euro(x.importo) + (x.riferimento ? ' · ' + x.riferimento : '')));
  });
  box.appendChild(rp);
}
`;

export const STILE_CRUSCOTTO = `
.cr-box{margin:14px 0;padding:14px 16px;border:1px solid #e5e7eb;border-radius:10px;background:#fff}
.cr-box h3{margin:0 0 10px;font-size:15px}
.cr-nota{color:#6b7280;font-size:13px;margin:4px 0}
.cr-grande{font-size:20px;font-weight:700}
.cr-codice{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;margin-bottom:10px}
.cr-link{display:flex;gap:8px;width:100%}
.cr-link input{flex:1;min-width:0;padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px}
.cr-griglia{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}
.cr-ordine{border-top:1px solid #f3f4f6;padding:8px 0}
.cr-ordine summary{cursor:pointer;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
.cr-dx{font-weight:600}
.cr-scroll{overflow-x:auto}
.cr-tab{border-collapse:collapse;font-size:13px;margin-top:6px;min-width:520px}
.cr-tab th,.cr-tab td{border-bottom:1px solid #f3f4f6;padding:4px 8px;text-align:left}
`;
