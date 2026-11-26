/**
 * admin-prenotazioni.js — scheda "Formazione finanziata" del pannello admin:
 * richieste di adesione ai corsi finanziati, con stato, note ed export CSV.
 */
export const SCRIPT_PRENOTAZIONI = String.raw`
(function () {
  'use strict';
  var st = document.createElement('style');
  st.textContent =
    '#vista-prenotazioni{max-width:1200px;margin:0 auto;padding:16px}' +
    '#vista-prenotazioni .pf-box{background:#fff;border:1px solid #e7e7ea;border-radius:14px;padding:16px 18px;margin:14px 0}' +
    '#vista-prenotazioni h3{margin:0 0 10px;font-size:16px}' +
    '#vista-prenotazioni button,#vista-prenotazioni select{font:inherit;font-size:13px;padding:6px 12px;border:1px solid #d4d4d8;border-radius:8px;background:#fff;cursor:pointer}' +
    '#vista-prenotazioni button.on{background:#111;color:#fff;border-color:#111}' +
    '.pf-chips{display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
    '.pf-nota{color:#6b7280;font-size:13px}' +
    '.pf-req{border:1px solid #e7e7ea;border-radius:12px;margin-bottom:10px;background:#fff}' +
    '.pf-req summary{list-style:none;cursor:pointer;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:space-between;padding:12px 14px}' +
    '.pf-req summary::-webkit-details-marker{display:none}' +
    '.pf-req .pf-corpo{padding:0 14px 14px;border-top:1px solid #f4f4f5}' +
    '.pf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px 16px;margin:12px 0}' +
    '.pf-grid span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280}' +
    '.pf-tab{border-collapse:collapse;width:100%;font-size:14px}.pf-tab th,.pf-tab td{text-align:left;padding:6px 8px;border-bottom:1px solid #f4f4f5}' +
    '.pf-stato{display:inline-block;font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;background:#f4f4f5}' +
    '.pf-stato-nuova{background:#fffbeb;color:#b45309}.pf-stato-nel_piano{background:#ecfdf5;color:#047857}' +
    '.pf-stato-adesione_verificata{background:#eff6ff;color:#1d4ed8}.pf-stato-non_idonea,.pf-stato-annullata{background:#fef2f2;color:#b91c1c}' +
    '#vista-prenotazioni textarea{width:100%;box-sizing:border-box;font:inherit;font-size:14px;padding:8px;border:1px solid #d4d4d8;border-radius:8px}';
  document.head.appendChild(st);

  var NOMI = { nuova: 'Nuova', contattata: 'Contattata', adesione_verificata: 'Adesione verificata', nel_piano: 'Inserita nel piano', non_idonea: 'Non idonea', annullata: 'Annullata' };
  var FON = { si: 'sì', no: 'no', non_so: 'non lo sa' };
  var filtro = '';
  function el(tag, attr, testo) {
    var e = document.createElement(tag);
    if (attr) Object.keys(attr).forEach(function (k) { e.setAttribute(k, attr[k]); });
    if (testo !== undefined && testo !== null) e.textContent = testo;
    return e;
  }
  function api(url, opz) {
    opz = opz || {};
    opz.headers = Object.assign({ 'Content-Type': 'application/json', 'X-Pannello': '1' }, opz.headers || {});
    return fetch(url, opz).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) throw new Error(d.errore || 'Errore ' + r.status); return d; });
    });
  }
  function badge(s) { return el('span', { class: 'pf-stato pf-stato-' + s }, NOMI[s] || s); }

  var nav = document.querySelector('nav.schede-vista');
  if (!nav) return;
  var tab = el('button', { id: 'tab-prenotazioni' }, 'Formazione finanziata');
  nav.appendChild(tab);
  var vista = el('main', { id: 'vista-prenotazioni' });
  vista.hidden = true;
  document.getElementById('vista-ordini').after(vista);
  tab.addEventListener('click', function () {
    document.querySelectorAll('body > main').forEach(function (m) { m.hidden = true; });
    nav.querySelectorAll('button').forEach(function (b) { b.classList.remove('attivo'); });
    tab.classList.add('attivo');
    vista.hidden = false;
    carica();
  });
  nav.querySelectorAll('button').forEach(function (b) {
    if (b !== tab) b.addEventListener('click', function () { vista.hidden = true; tab.classList.remove('attivo'); });
  });

  function carica() {
    vista.textContent = 'Caricamento…';
    api('/api/prenotazioni' + (filtro ? '?stato=' + filtro : '')).then(disegna)
      .catch(function (e) { vista.textContent = 'Errore: ' + e.message; });
  }

  function disegna(d) {
    vista.textContent = '';
    vista.appendChild(el('h2', null, 'Richieste di formazione finanziata'));
    vista.appendChild(el('p', { class: 'pf-nota' }, 'Arrivano dalla pagina www.mariobruzzese.it/formazione-finanziata. Nessun pagamento: sono richieste di adesione da verificare.'));

    var chips = el('div', { class: 'pf-chips' });
    var tutte = Object.keys(d.perStato).reduce(function (s, k) { return s + d.perStato[k]; }, 0);
    [['', 'Tutte (' + tutte + ')']].concat(Object.keys(NOMI).map(function (k) { return [k, NOMI[k] + ' (' + (d.perStato[k] || 0) + ')']; })).forEach(function (x) {
      var b = el('button', filtro === x[0] ? { class: 'on' } : null, x[1]);
      b.addEventListener('click', function () { filtro = x[0]; carica(); });
      chips.appendChild(b);
    });
    var csv = el('a', { href: '/api/prenotazioni.csv' + (filtro ? '?stato=' + filtro : ''), style: 'margin-left:auto;font-weight:600' }, 'Scarica CSV');
    chips.appendChild(csv);
    vista.appendChild(chips);

    if (d.corsiRichiesti.length) {
      var box = el('section', { class: 'pf-box' });
      box.appendChild(el('h3', null, 'Corsi più richiesti'));
      var t = el('table', { class: 'pf-tab' });
      var h = el('tr'); ['Codice', 'Corso', 'Richieste', 'Partecipanti'].forEach(function (x) { h.appendChild(el('th', null, x)); }); t.appendChild(h);
      d.corsiRichiesti.forEach(function (c) {
        var r = el('tr');
        [c.codice || '', c.titolo, c.richieste, c.partecipanti].forEach(function (x) { r.appendChild(el('td', null, String(x))); });
        t.appendChild(r);
      });
      box.appendChild(t);
      vista.appendChild(box);
    }

    var lista = el('section', { class: 'pf-box' });
    lista.appendChild(el('h3', null, 'Richieste (' + d.prenotazioni.length + ')'));
    if (!d.prenotazioni.length) lista.appendChild(el('p', { class: 'pf-nota' }, 'Nessuna richiesta.'));
    d.prenotazioni.forEach(function (p) {
      var a = p.azienda;
      var det = el('details', { class: 'pf-req' });
      var s = el('summary');
      var sx = el('div');
      sx.appendChild(el('strong', null, a.ragioneSociale));
      sx.appendChild(el('div', { class: 'pf-nota' }, p.riferimento + ' · ' + new Date(p.creatoIl).toLocaleDateString('it-IT') + ' · ' +
        p.corsi.length + (p.corsi.length === 1 ? ' corso · ' : ' corsi · ') + p.partecipantiTot + ' partecipanti · ' + (a.citta || '') + ' (' + (a.provincia || '') + ')'));
      s.appendChild(sx);
      s.appendChild(badge(p.stato));
      det.appendChild(s);
      var c = el('div', { class: 'pf-corpo' });
      var g = el('div', { class: 'pf-grid' });
      [['P. IVA', a.partitaIva], ['Codice fiscale', a.codiceFiscale], ['Matricola INPS', a.matricolaInps], ['Aderisce a Fonarcom', FON[a.fonarcom]],
       ['ATECO', a.ateco], ['Dipendenti', a.dipendenti], ['Sede', a.indirizzo + ', ' + a.cap + ' ' + a.citta + ' (' + a.provincia + ')'],
       ['Referente', a.referente + (a.ruolo ? ' — ' + a.ruolo : '')], ['Email', a.email], ['PEC', a.pec], ['Telefono', a.telefono],
       ['Modalità preferita', a.modalita], ['Periodo', a.periodo], ['Campagna', p.campagna], ['Note dell’azienda', a.note]].forEach(function (x) {
        if (!x[1]) return;
        var i = el('div'); i.appendChild(el('span', null, x[0])); i.appendChild(el('strong', null, x[1])); g.appendChild(i);
      });
      c.appendChild(g);
      var t2 = el('table', { class: 'pf-tab' });
      var h2 = el('tr'); ['Codice', 'Corso', 'Ore', 'Partecipanti'].forEach(function (x) { h2.appendChild(el('th', null, x)); }); t2.appendChild(h2);
      p.corsi.forEach(function (k) {
        var r = el('tr'); [k.codice || '', k.titolo, k.ore, k.partecipanti].forEach(function (x) { r.appendChild(el('td', null, String(x))); }); t2.appendChild(r);
      });
      c.appendChild(t2);
      var az = el('div', { class: 'pf-chips', style: 'margin-top:12px' });
      az.appendChild(el('span', { class: 'pf-nota' }, 'Stato:'));
      var sel = el('select');
      Object.keys(NOMI).forEach(function (k) { var o = el('option', { value: k }, NOMI[k]); if (k === p.stato) o.selected = true; sel.appendChild(o); });
      az.appendChild(sel);
      var note = el('textarea', { rows: '2', placeholder: 'Note interne (es. contatto del 12/12, matricola verificata…)' });
      note.value = p.note || '';
      var salva = el('button', { class: 'on' }, 'Salva');
      salva.addEventListener('click', function () {
        salva.disabled = true;
        api('/api/prenotazioni/' + p.id, { method: 'POST', body: JSON.stringify({ stato: sel.value, note: note.value }) })
          .then(carica).catch(function (e) { alert(e.message); salva.disabled = false; });
      });
      var mail = el('a', { href: 'mailto:' + a.email + '?subject=' + encodeURIComponent('Formazione finanziata – richiesta ' + p.riferimento) }, 'Scrivi all’azienda');
      az.appendChild(salva); az.appendChild(mail);
      var wn = el('div', { style: 'margin-top:12px' }); wn.appendChild(note); c.appendChild(wn);
      c.appendChild(az);
      det.appendChild(c);
      lista.appendChild(det);
    });
    vista.appendChild(lista);
  }
})();
`;
