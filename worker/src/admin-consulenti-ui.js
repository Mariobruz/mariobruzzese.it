/**
 * admin-consulenti-ui.js — scheda "Consulenti e codici" del pannello admin.
 * Accodata ad app.js insieme al disegno del cruscotto (cruscotto-vista.js).
 */
import { RENDER_CRUSCOTTO, STILE_CRUSCOTTO } from './cruscotto-vista';

export const SCRIPT_CONSULENTI = RENDER_CRUSCOTTO + String.raw`
(function () {
  'use strict';
  var STILE = ${JSON.stringify(STILE_CRUSCOTTO)} +
    '.co-tab{border-collapse:collapse;width:100%;font-size:14px}.co-tab th,.co-tab td{padding:6px 8px;border-bottom:1px solid #eee;text-align:left}' +
    '.co-tab td.n{text-align:right}.co-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}' +
    '.co-form label{display:flex;flex-direction:column;font-size:13px;color:#374151;gap:4px}' +
    '.co-form input,.co-form select,.co-form textarea{padding:7px;border:1px solid #d1d5db;border-radius:6px;font:inherit}' +
    '.co-azioni{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.co-badge{font-size:12px;padding:2px 8px;border-radius:999px;background:#f3f4f6}' +
    '.co-stato{display:inline-block;font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;white-space:nowrap}' +
    '.co-stato-attivo{background:#ecfdf5;color:#047857}.co-stato-in_attesa_contratto{background:#fffbeb;color:#b45309}.co-stato-sospeso{background:#fef2f2;color:#b91c1c}' +
    '.co-approva{border:2px solid #f59e0b;background:#fffbeb;border-radius:14px;padding:16px 18px;margin:12px 0}' +
    '.co-approva h3{margin:0 0 10px;font-size:16px}' +
    '.co-card{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;justify-content:space-between;background:#fff;border:1px solid #fde68a;border-radius:12px;padding:12px 14px;margin-top:8px}' +
    '.co-card .co-dati{display:flex;flex-direction:column;gap:2px;min-width:220px}.co-card .co-dati span{font-size:13px;color:#6b7280}' +
    '.co-si{background:#047857!important;color:#fff!important;border-color:#047857!important;font-weight:600}' +
    '.co-no{color:#b91c1c!important;border-color:#fca5a5!important}' +
    '.co-banner{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;border-radius:14px;padding:14px 18px;margin:12px 0}' +
    '.co-banner p{margin:0}.co-banner-in_attesa_contratto{background:#fffbeb;border:2px solid #f59e0b}' +
    '.co-banner-attivo{background:#ecfdf5;border:1px solid #a7f3d0}.co-banner-sospeso{background:#fef2f2;border:1px solid #fca5a5}' +
    '#vista-consulenti .cr-box{background:#fff;border:1px solid #e7e7ea;border-radius:14px;padding:16px 18px;margin:14px 0}' +
    '#vista-consulenti .cr-box h3{margin:0 0 10px;font-size:16px}' +
    '#vista-consulenti .cr-nota{color:#6b7280;font-size:13px}' +
    '#vista-consulenti button{font:inherit;font-size:13px;font-weight:600;padding:6px 12px;border:1px solid #d4d4d8;border-radius:8px;background:#fff;color:#111;cursor:pointer}' +
    '#vista-consulenti button:hover{background:#f4f4f5}#vista-consulenti button:disabled{opacity:.45;cursor:default}' +
    '#vista-consulenti input[type=date]{font:inherit;font-size:13px;padding:5px 8px;border:1px solid #d4d4d8;border-radius:8px}' +
    '#vista-consulenti .co-si:hover{background:#065f46!important}';
  var st = document.createElement('style'); st.textContent = STILE; document.head.appendChild(st);

  var NOMI_STATO = { in_attesa_contratto: 'In attesa di contratto', attivo: 'Attivo', sospeso: 'Sospeso' };
  var oggi = new Date().toISOString().slice(0, 10);
  var periodo = { da: new Date(Date.now() - 29 * 864e5).toISOString().slice(0, 10), a: oggi };
  var aperto = null; // id del consulente aperto

  function el(tag, attr, testo) {
    var e = document.createElement(tag);
    if (attr) Object.keys(attr).forEach(function (k) { e.setAttribute(k, attr[k]); });
    if (testo !== undefined && testo !== null) e.textContent = testo;
    return e;
  }
  function euro(n) { return Number(n || 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }); }
  function api(url, opz) {
    opz = opz || {};
    opz.headers = Object.assign({ 'Content-Type': 'application/json', 'X-Pannello': '1' }, opz.headers || {});
    return fetch(url, opz).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) throw new Error(d.errore || ('Errore ' + r.status));
        return d;
      });
    });
  }
  function badgeStato(stato) { return el('span', { class: 'co-stato co-stato-' + stato }, NOMI_STATO[stato] || stato); }
  function cambiaStato(c, stato, dopo) {
    var testi = {
      attivo: 'Attivo ' + c.nome + ' ' + c.cognome + '?\n\nIl suo codice sconto inizierà a funzionare e gli arriverà un\'email con il codice e il link da condividere.',
      sospeso: 'Sospendo ' + c.nome + ' ' + c.cognome + '?\n\nIl codice smette di funzionare e non può più entrare nella sua area.',
      in_attesa_contratto: 'Rimetto ' + c.nome + ' ' + c.cognome + ' in attesa di contratto?'
    };
    if (!confirm(testi[stato])) return;
    api('/api/consulenti/' + c.id + '/stato', { method: 'POST', body: JSON.stringify({ stato: stato }) })
      .then(function (r) {
        if (stato === 'attivo') alert(r.emailInviata ? 'Consulente attivato: gli è stata inviata l\'email con il codice.' : 'Consulente attivato. Attenzione: l\'email non è partita (controlla la chiave Brevo del pannello).');
        (dopo || carica)();
      }).catch(function (e) { alert(e.message); });
  }
  function qs() { return '?da=' + periodo.da + '&a=' + periodo.a; }

  var nav = document.querySelector('nav.schede-vista');
  var tab = el('button', { id: 'tab-consulenti' }, 'Consulenti e codici');
  nav.appendChild(tab);
  var vista = el('main', { id: 'vista-consulenti' });
  vista.hidden = true;
  document.getElementById('vista-ordini').after(vista);

  tab.addEventListener('click', function () {
    document.querySelectorAll('body > main').forEach(function (m) { m.hidden = true; });
    nav.querySelectorAll('button').forEach(function (b) { b.classList.remove('attivo'); });
    tab.classList.add('attivo');
    vista.hidden = false;
    aperto = null;
    carica();
  });
  nav.querySelectorAll('button').forEach(function (b) {
    if (b !== tab) b.addEventListener('click', function () { vista.hidden = true; tab.classList.remove('attivo'); });
  });

  function barraPeriodo() {
    var b = el('div', { class: 'barra', style: 'align-items:center;gap:8px;flex-wrap:wrap' });
    var da = el('input', { type: 'date', value: periodo.da, 'aria-label': 'Dal' });
    var a = el('input', { type: 'date', value: periodo.a, 'aria-label': 'Al' });
    var ok = el('button', null, 'Applica');
    ok.addEventListener('click', function () { periodo = { da: da.value || periodo.da, a: a.value || periodo.a }; carica(); });
    b.appendChild(el('span', null, 'Periodo dal')); b.appendChild(da); b.appendChild(el('span', null, 'al')); b.appendChild(a); b.appendChild(ok);
    [['30 giorni', 29], ['90 giorni', 89], ['12 mesi', 364]].forEach(function (x) {
      var p = el('button', null, x[0]);
      p.addEventListener('click', function () { periodo = { da: new Date(Date.now() - x[1] * 864e5).toISOString().slice(0, 10), a: oggi }; carica(); });
      b.appendChild(p);
    });
    return b;
  }

  function carica() {
    vista.textContent = '';
    vista.appendChild(el('div', { class: 'vuoto' }, 'Caricamento…'));
    var p = aperto ? api('/api/consulenti/' + aperto + qs()).then(disegnaDettaglio) : api('/api/consulenti' + qs()).then(disegnaElenco);
    p.catch(function (e) { vista.textContent = ''; vista.appendChild(el('div', { class: 'vuoto' }, 'Errore: ' + e.message)); });
  }

  // ---------------------------------------------------------------- elenco
  function disegnaElenco(d) {
    vista.textContent = '';
    vista.appendChild(barraPeriodo());
    var t = d.totali;
    vista.appendChild(el('p', null, 'Totale consulenti nel periodo: ' + t.ordini + ' ordini · ' + euro(t.incassato) + ' incassati · ' +
      t.click + ' click · compensi maturati ' + euro(t.compensoMaturato) + ' · da pagare in tutto ' + euro(t.daPagare)));

    var azioni = el('div', { class: 'co-azioni' });
    var nuovo = el('button', null, '+ Nuovo consulente');
    nuovo.addEventListener('click', function () { formConsulente(null); });
    var gen = el('button', null, '+ Nuovo codice generico');
    gen.addEventListener('click', nuovoGenerico);
    azioni.appendChild(nuovo); azioni.appendChild(gen);
    vista.appendChild(azioni);

    var attesa = d.consulenti.filter(function (c) { return c.stato === 'in_attesa_contratto'; });
    if (attesa.length) {
      var ap = el('section', { class: 'co-approva' });
      ap.appendChild(el('h3', null, 'Da approvare (' + attesa.length + ')'));
      ap.appendChild(el('p', { class: 'cr-nota', style: 'margin:0' }, 'Consulenti registrati in attesa del contratto. Approva quando il contratto è firmato: il codice si attiva e il consulente riceve un\'email.'));
      attesa.forEach(function (c) {
        var card = el('div', { class: 'co-card' });
        var dt = el('div', { class: 'co-dati' });
        dt.appendChild(el('strong', null, c.cognome + ' ' + c.nome + (c.ragioneSociale ? ' · ' + c.ragioneSociale : '')));
        dt.appendChild(el('span', null, [c.email, c.telefono, c.pivaCf].filter(Boolean).join(' · ')));
        dt.appendChild(el('span', null, 'Registrato il ' + new Date(c.creatoIl).toLocaleDateString('it-IT') + ' · codice ' +
          (c.codici.map(function (k) { return k.codice; }).join(', ') || '—')));
        card.appendChild(dt);
        var bs = el('div', { class: 'co-azioni', style: 'margin:0' });
        var si = el('button', { class: 'co-si' }, '✓ Approva e attiva');
        si.addEventListener('click', function () { cambiaStato(c, 'attivo'); });
        var apri = el('button', null, 'Apri');
        apri.addEventListener('click', function () { aperto = c.id; carica(); });
        var no = el('button', { class: 'co-no' }, 'Rifiuta');
        no.addEventListener('click', function () { cambiaStato(c, 'sospeso'); });
        bs.appendChild(si); bs.appendChild(apri); bs.appendChild(no);
        card.appendChild(bs);
        ap.appendChild(card);
      });
      vista.appendChild(ap);
    }

    var box = el('section', { class: 'cr-box' });
    box.appendChild(el('h3', null, 'Consulenti (classifica per incassato)'));
    if (!d.consulenti.length) box.appendChild(el('p', { class: 'cr-nota' }, 'Nessun consulente: creane uno con "Nuovo consulente".'));
    else {
      var w = el('div', { class: 'cr-scroll' });
      var tab = el('table', { class: 'co-tab' });
      var h = el('tr');
      ['Consulente', 'Stato', 'Codici', 'Click', 'Ordini', 'Conv.', 'Incassato', 'Compenso maturato', 'Da pagare', ''].forEach(function (x) { h.appendChild(el('th', null, x)); });
      tab.appendChild(h);
      d.consulenti.slice().sort(function (x, y) { return y.incassato - x.incassato; }).forEach(function (c) {
        var r = el('tr');
        r.appendChild(el('td', null, c.cognome + ' ' + c.nome + (c.ragioneSociale ? ' · ' + c.ragioneSociale : '')));
        var tds = el('td'); tds.appendChild(badgeStato(c.stato)); r.appendChild(tds);
        r.appendChild(el('td', null, c.codici.filter(function (k) { return k.attivo; }).map(function (k) { return k.codice; }).join(', ') || '—'));
        [c.click, c.ordini, c.conversione == null ? '—' : c.conversione + '%', euro(c.incassato), euro(c.compensoMaturato), euro(c.daPagare)]
          .forEach(function (v) { r.appendChild(el('td', { class: 'n' }, String(v))); });
        var td = el('td'); var b = el('button', null, 'Apri');
        b.addEventListener('click', function () { aperto = c.id; carica(); });
        td.appendChild(b); r.appendChild(td);
        tab.appendChild(r);
      });
      w.appendChild(tab); box.appendChild(w);
    }
    vista.appendChild(box);

    var g = el('section', { class: 'cr-box' });
    g.appendChild(el('h3', null, 'Codici generici (solo sconto, nessun compenso)'));
    if (!d.generici.length) g.appendChild(el('p', { class: 'cr-nota' }, 'Nessun codice generico.'));
    d.generici.forEach(function (k) {
      var r = el('div', { style: 'display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:4px 0' });
      r.appendChild(el('strong', null, k.codice));
      r.appendChild(el('span', { class: 'co-badge' }, k.attivo ? 'attivo' : 'disattivato'));
      r.appendChild(el('span', null, '−' + k.scontoPct + '% · ' + k.click + ' click · ' + k.ordini + ' ordini · ' + euro(k.incassato) + (k.descrizione ? ' · ' + k.descrizione : '')));
      r.appendChild(bottoneAttivo(k));
      g.appendChild(r);
    });
    vista.appendChild(g);
  }

  function bottoneAttivo(k) {
    var b = el('button', null, k.attivo ? 'Disattiva' : 'Riattiva');
    b.addEventListener('click', function () {
      api('/api/codici/' + encodeURIComponent(k.codice), { method: 'POST', body: JSON.stringify({ attivo: !k.attivo }) })
        .then(carica).catch(function (e) { alert(e.message); });
    });
    return b;
  }

  function nuovoGenerico() {
    var codice = prompt('Codice (lascia vuoto per generarlo, es. MB-7K3):', '');
    if (codice === null) return;
    var sconto = prompt('Sconto in %:', '20');
    if (sconto === null) return;
    var descr = prompt('Descrizione (facoltativa):', '') || '';
    api('/api/codici', { method: 'POST', body: JSON.stringify({ codice: codice.trim() || undefined, scontoPct: Number(sconto), descrizione: descr }) })
      .then(function (r) { alert('Creato il codice ' + r.codice); carica(); }).catch(function (e) { alert(e.message); });
  }

  // ---------------------------------------------------------------- scheda consulente
  function formConsulente(c) {
    vista.textContent = '';
    var box = el('section', { class: 'cr-box' });
    box.appendChild(el('h3', null, c ? 'Dati del consulente' : 'Nuovo consulente'));
    var f = el('div', { class: 'co-form' });
    var campi = {};
    [['nome', 'Nome *'], ['cognome', 'Cognome *'], ['ragioneSociale', 'Ragione sociale / studio'], ['pivaCf', 'P. IVA o codice fiscale'],
     ['email', 'Email (per l\'accesso) *'], ['pec', 'PEC'], ['telefono', 'Telefono'], ['compensoPct', 'Compenso % sull\'incassato']].forEach(function (x) {
      var l = el('label', null, x[1]);
      var i = el('input', { type: x[0] === 'compensoPct' ? 'number' : 'text', value: c ? (c[x[0]] == null ? '' : c[x[0]]) : (x[0] === 'compensoPct' ? '40' : '') });
      campi[x[0]] = i; l.appendChild(i); f.appendChild(l);
    });
    if (!c) {
      var ls = el('label', null, 'Sconto % del suo codice');
      var is = el('input', { type: 'number', value: '20' }); campi.scontoPct = is; ls.appendChild(is); f.appendChild(ls);
    }
    var lst = el('label', null, 'Stato');
    var sel = el('select');
    Object.keys(NOMI_STATO).forEach(function (k) { var o = el('option', { value: k }, NOMI_STATO[k]); if ((c ? c.stato : 'in_attesa_contratto') === k) o.selected = true; sel.appendChild(o); });
    campi.stato = sel; lst.appendChild(sel); f.appendChild(lst);
    var ln = el('label', { style: 'grid-column:1/-1' }, 'Note interne (non visibili al consulente)');
    var tn = el('textarea', { rows: '3' }); tn.value = c ? (c.note || '') : ''; campi.note = tn; ln.appendChild(tn); f.appendChild(ln);
    box.appendChild(f);
    box.appendChild(el('p', { class: 'cr-nota' }, 'Il codice sconto funziona solo con stato "Attivo" (contratto firmato). Quando lo metti "Attivo" il consulente riceve un\'email con il codice.'));
    var az = el('div', { class: 'co-azioni' });
    var salva = el('button', null, 'Salva');
    salva.addEventListener('click', function () {
      var corpo = {};
      Object.keys(campi).forEach(function (k) { corpo[k] = campi[k].value; });
      api(c ? '/api/consulenti/' + c.id : '/api/consulenti', { method: 'POST', body: JSON.stringify(corpo) })
        .then(function (r) {
          if (!c) { alert('Consulente creato. Codice: ' + r.codice + (r.emailInviata ? '\nGli è stata inviata l\'email con il codice.' : '')); aperto = r.id; }
          else if (r.emailInviata) alert('Consulente attivato: gli è stata inviata l\'email con il suo codice.');
          carica();
        })
        .catch(function (e) { alert(e.message); });
    });
    var annulla = el('button', null, 'Annulla');
    annulla.addEventListener('click', carica);
    az.appendChild(salva); az.appendChild(annulla);
    box.appendChild(az);
    vista.appendChild(box);
  }

  function disegnaDettaglio(d) {
    vista.textContent = '';
    var c = d.consulente;
    var torna = el('button', null, '← Tutti i consulenti');
    torna.addEventListener('click', function () { aperto = null; carica(); });
    vista.appendChild(torna);
    vista.appendChild(el('h2', null, c.cognome + ' ' + c.nome + (c.ragioneSociale ? ' · ' + c.ragioneSociale : '')));
    var ban = el('div', { class: 'co-banner co-banner-' + c.stato });
    var bt = el('div');
    bt.appendChild(badgeStato(c.stato));
    bt.appendChild(el('p', { style: 'margin-top:6px' }, c.stato === 'attivo' ? 'Il codice funziona e il consulente vede ordini e compensi.'
      : c.stato === 'sospeso' ? 'Il codice non funziona e il consulente non può entrare nella sua area.'
      : 'Registrato, in attesa del contratto: il codice non funziona ancora. Approva quando il contratto è firmato.'));
    ban.appendChild(bt);
    var ba = el('div', { class: 'co-azioni', style: 'margin:0' });
    function bott(testo, stato, cls) { var b = el('button', cls ? { class: cls } : null, testo); b.addEventListener('click', function () { cambiaStato(c, stato); }); ba.appendChild(b); }
    if (c.stato === 'in_attesa_contratto') { bott('✓ Approva e attiva', 'attivo', 'co-si'); bott('Rifiuta', 'sospeso', 'co-no'); }
    if (c.stato === 'attivo') bott('Sospendi', 'sospeso', 'co-no');
    if (c.stato === 'sospeso') { bott('Riattiva', 'attivo', 'co-si'); bott('Rimetti in attesa', 'in_attesa_contratto'); }
    ban.appendChild(ba);
    vista.appendChild(ban);
    vista.appendChild(barraPeriodo());

    // sezione solo admin
    var adm = el('section', { class: 'cr-box', style: 'border:2px solid #111' });
    adm.appendChild(el('h3', null, 'Solo per te'));
    adm.appendChild(el('p', null, (NOMI_STATO[c.stato] || c.stato) + ' · compenso ' + c.compensoPct + '% · ' + c.email +
      (c.pec ? ' · PEC ' + c.pec : '') + (c.pivaCf ? ' · ' + c.pivaCf : '') + (c.telefono ? ' · ' + c.telefono : '')));
    if (c.note) adm.appendChild(el('p', { class: 'cr-nota' }, 'Note: ' + c.note));
    var az = el('div', { class: 'co-azioni' });
    var mod = el('button', null, 'Modifica dati e %');
    mod.addEventListener('click', function () { formConsulente(c); });
    var paga = el('button', null, 'Registra pagamento (' + euro(d.numeri.daPagare) + ')');
    paga.disabled = !d.numeri.daPagare;
    paga.addEventListener('click', function () {
      var rif = prompt('Pagamento di ' + euro(d.numeri.daPagare) + ': tutti i compensi maturati verranno segnati come pagati.\nRiferimento (es. numero della fattura del consulente):', '');
      if (rif === null) return;
      api('/api/consulenti/' + c.id + '/pagamento', { method: 'POST', body: JSON.stringify({ riferimento: rif }) })
        .then(function (r) { alert('Registrato pagamento di ' + euro(r.importo)); carica(); }).catch(function (e) { alert(e.message); });
    });
    var nuovoC = el('button', null, 'Rigenera codice');
    nuovoC.addEventListener('click', function () {
      if (!confirm('Creo un nuovo codice e disattivo quelli attuali del consulente. Procedo?')) return;
      api('/api/consulenti/' + c.id + '/codice', { method: 'POST', body: JSON.stringify({ sostituisci: true }) })
        .then(function (r) { alert('Nuovo codice: ' + r.codice); carica(); }).catch(function (e) { alert(e.message); });
    });
    var csv = el('a', { class: 'link', href: '/api/consulenti/' + c.id + '/csv' + qs() }, 'Scarica CSV ordini');
    [mod, paga, nuovoC, csv].forEach(function (x) { az.appendChild(x); });
    adm.appendChild(az);
    (d.codici || []).forEach(function (k) {
      var r = el('div', { style: 'display:flex;gap:10px;align-items:center;padding:3px 0' });
      r.appendChild(el('strong', null, k.codice));
      r.appendChild(el('span', { class: 'co-badge' }, (k.attivo ? 'attivo' : 'disattivato') + ' · −' + k.scontoPct + '%'));
      r.appendChild(bottoneAttivo(k));
      adm.appendChild(r);
    });
    vista.appendChild(adm);

    vista.appendChild(el('h3', { style: 'margin-top:18px' }, 'Come lo vede il consulente'));
    var cr = el('div');
    vista.appendChild(cr);
    cr.style.cssText = 'background:#f5f5f6;border-radius:16px;padding:14px';
    disegnaCruscotto(cr, d, { anteprima: true });
  }
})();
`;
