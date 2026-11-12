/**
 * cruscotto-vista.js — disegno del cruscotto di un consulente (solo DOM, niente HTML da stringhe
 * con dati: le uniche stringhe HTML sono le icone SVG fisse qui sotto).
 * Lo stesso codice serve all'area consulenti e alla "vista consulente" del pannello admin.
 * Definisce la funzione globale disegnaCruscotto(contenitore, dati, { sito, anteprima }).
 */
export const RENDER_CRUSCOTTO = String.raw`
var CR_ICONE = {
  ordini: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  euro: '<path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/>',
  premio: '<circle cx="12" cy="8" r="6"/><path d="M15.5 12.9 17 22l-5-3-5 3 1.5-9.1"/>',
  attesa: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  click: '<path d="m9 9 5 12 1.8-5.2L21 14Z"/><path d="M7.2 2.2 8 5.1"/><path d="m5.1 8-2.9-.8"/><path d="M14 4.1 12 6"/><path d="m6 12-1.9 2"/>',
  grafico: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  ok: '<path d="M20 6 9 17l-5-5"/>',
  copia: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  posta: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  chat: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/>',
  utente: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  banca: '<path d="M3 21h18"/><path d="M5 21V10"/><path d="M19 21V10"/><path d="M9 21V10"/><path d="M15 21V10"/><path d="m2 10 10-6 10 6"/>',
  freccia: '<path d="m9 18 6-6-6-6"/>'
};
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
  function icona(nome, cls) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
    s.setAttribute('class', 'cr-ico ' + (cls || ''));
    s.innerHTML = CR_ICONE[nome] || '';
    return s;
  }
  function euro(n) { return Number(n || 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }); }
  function giorno(s) { var d = new Date(s); return isNaN(d) ? String(s || '') : d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }); }
  function copia(testo, bottone, etichetta) {
    var fatto = function () {
      bottone.classList.add('cr-fatto'); bottone.lastChild.textContent = 'Copiato!';
      setTimeout(function () { bottone.classList.remove('cr-fatto'); bottone.lastChild.textContent = etichetta; }, 1600);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(testo).then(fatto, function () {});
  }
  function bottone(ico, testo, cls) {
    var b = el('button', { type: 'button', class: 'cr-btn ' + (cls || '') });
    b.appendChild(icona(ico)); b.appendChild(el('span', null, testo));
    return b;
  }
  function linkBottone(ico, testo, href, cls) {
    var a = el('a', { href: href, target: '_blank', rel: 'noopener', class: 'cr-btn ' + (cls || '') });
    a.appendChild(icona(ico)); a.appendChild(el('span', null, testo));
    return a;
  }

  box.textContent = '';
  box.classList.add('cr');
  var c = dati.consulente || {};
  var n = dati.numeri || {};
  var attivo = c.stato === 'attivo';
  var codici = (dati.codici || []).filter(function (k) { return k.attivo; });
  var sconto = codici.length ? codici[0].scontoPct : 20;

  // ---- benvenuto
  var hero = el('section', { class: 'cr-hero' });
  var ht = el('div');
  ht.appendChild(el('p', { class: 'cr-sopra' }, opz.anteprima ? 'Anteprima dell\'area del consulente' : 'La tua area riservata'));
  ht.appendChild(el('h1', null, 'Ciao ' + (c.nome || '') + ','));
  ht.appendChild(el('p', null, attivo
    ? 'qui trovi il tuo codice, gli ordini dei tuoi clienti e i compensi maturati.'
    : 'la tua registrazione è arrivata. Ecco cosa succede adesso.'));
  hero.appendChild(ht);
  var stato = el('span', { class: 'cr-pill ' + (attivo ? 'cr-pill-ok' : c.stato === 'sospeso' ? 'cr-pill-no' : 'cr-pill-attesa') });
  stato.appendChild(icona(attivo ? 'ok' : 'attesa'));
  stato.appendChild(el('span', null, attivo ? 'Collaborazione attiva' : c.stato === 'sospeso' ? 'Sospeso' : 'In attesa di attivazione'));
  hero.appendChild(stato);
  box.appendChild(hero);

  // ---- codice sconto (sempre visibile; condivisibile solo quando attivo)
  var rc = el('section', { class: 'cr-codicebox' + (attivo ? '' : ' cr-spento') });
  var testa = el('div', { class: 'cr-testa' });
  testa.appendChild(el('h2', null, codici.length > 1 ? 'I tuoi codici sconto' : 'Il tuo codice sconto'));
  testa.appendChild(el('span', { class: 'cr-pill ' + (attivo ? 'cr-pill-ok' : 'cr-pill-attesa') }, attivo ? 'Attivo' : 'Non ancora attivo'));
  rc.appendChild(testa);
  if (!codici.length) rc.appendChild(el('p', { class: 'cr-nota' }, 'Nessun codice assegnato: ti contatteremo noi.'));
  codici.forEach(function (k) {
    var link = sito + '/corsi-sicurezza?codice=' + encodeURIComponent(k.codice);
    var riga = el('div', { class: 'cr-coupon' });
    var sx = el('div', { class: 'cr-coupon-sx' });
    sx.appendChild(el('div', { class: 'cr-codice' }, k.codice));
    sx.appendChild(el('div', { class: 'cr-coupon-sub' }, '−' + k.scontoPct + '% per i tuoi clienti su tutti i corsi'));
    riga.appendChild(sx);
    if (attivo) {
      var az = el('div', { class: 'cr-coupon-az' });
      var bc = bottone('copia', 'Copia codice', 'cr-btn-scuro');
      bc.addEventListener('click', function () { copia(k.codice, bc, 'Copia codice'); });
      var bl = bottone('link', 'Copia link');
      bl.addEventListener('click', function () { copia(link, bl, 'Copia link'); });
      var msg = 'Ciao! Con il mio codice ' + k.codice + ' hai il ' + k.scontoPct + '% di sconto sui corsi sulla sicurezza online di MB Consulting: ' + link;
      az.appendChild(bc); az.appendChild(bl);
      az.appendChild(linkBottone('chat', 'WhatsApp', 'https://wa.me/?text=' + encodeURIComponent(msg)));
      az.appendChild(linkBottone('posta', 'Email', 'mailto:?subject=' + encodeURIComponent('Sconto sui corsi sicurezza') + '&body=' + encodeURIComponent(msg)));
      riga.appendChild(az);
    }
    rc.appendChild(riga);
    if (attivo) {
      var l = el('div', { class: 'cr-linkriga' });
      l.appendChild(icona('link'));
      l.appendChild(el('input', { type: 'text', readonly: 'readonly', value: link, 'aria-label': 'Link da condividere' }));
      rc.appendChild(l);
      rc.appendChild(el('p', { class: 'cr-nota' }, 'Chi apre il link trova il codice già inserito nel modulo d\'iscrizione. Funziona anche se il cliente scrive il codice a mano.'));
    }
  });
  if (!attivo && codici.length) {
    var att = el('div', { class: 'cr-avviso' });
    att.appendChild(icona('attesa'));
    att.appendChild(el('p', null, 'Il codice è già tuo, ma i clienti potranno usarlo appena è completato l\'accordo di collaborazione. Ti avviseremo via email: da quel momento qui compariranno anche il link e i pulsanti per condividerlo.'));
    rc.appendChild(att);
  }
  box.appendChild(rc);

  // ---- come funziona
  var cf = el('section', { class: 'cr-passi' });
  [['link', 'Condividi', 'Dai il tuo codice o il link ai clienti: aziende, datori di lavoro, lavoratori.'],
   ['euro', 'Il cliente risparmia', 'Ha il ' + sconto + '% di sconto su tutti i corsi e-learning, con attestato valido.'],
   ['premio', 'Tu ricevi il ' + (c.compensoPct || 40) + '%', 'Calcolato su quanto incassato da ogni ordine pagato con il tuo codice.']].forEach(function (p, i) {
    var d = el('div', { class: 'cr-passo' });
    var num = el('div', { class: 'cr-passo-n' }); num.appendChild(icona(p[0]));
    d.appendChild(num);
    var t = el('div');
    t.appendChild(el('strong', null, (i + 1) + '. ' + p[1]));
    t.appendChild(el('p', null, p[2]));
    d.appendChild(t);
    cf.appendChild(d);
  });
  box.appendChild(cf);

  // ---- numeri
  var sez = el('section', { class: 'cr-sez' });
  var th = el('div', { class: 'cr-testa' });
  th.appendChild(el('h2', null, 'I tuoi numeri'));
  th.appendChild(el('span', { class: 'cr-nota' }, giorno(dati.periodo.da) + ' – ' + giorno(dati.periodo.a)));
  sez.appendChild(th);
  var griglia = el('div', { class: 'cr-kpi-griglia' });
  [['ordini', 'Ordini pagati', String(n.ordini || 0), ''],
   ['euro', 'Incassato dai tuoi clienti', euro(n.incassato), ''],
   ['premio', 'Compenso maturato', euro(n.compensoMaturato), 'cr-kpi-verde'],
   ['banca', 'Da ricevere', euro(n.daPagare), 'cr-kpi-scuro']].forEach(function (v) {
    var k = el('div', { class: 'cr-kpi ' + v[3] });
    var ic = el('div', { class: 'cr-kpi-ico' }); ic.appendChild(icona(v[0]));
    k.appendChild(ic);
    k.appendChild(el('div', { class: 'cr-kpi-val' }, v[2]));
    k.appendChild(el('div', { class: 'cr-kpi-lab' }, v[1]));
    griglia.appendChild(k);
  });
  sez.appendChild(griglia);
  var mini = el('div', { class: 'cr-mini' });
  [['click', 'Aperture del link', String(n.click || 0)],
   ['grafico', 'Conversione', n.conversione == null ? '—' : n.conversione + '%'],
   ['ok', 'Compenso già pagato', euro(n.compensoPagato)]].forEach(function (v) {
    var m = el('div');
    m.appendChild(icona(v[0]));
    m.appendChild(el('span', null, v[1]));
    m.appendChild(el('strong', null, v[2]));
    mini.appendChild(m);
  });
  sez.appendChild(mini);
  sez.appendChild(el('p', { class: 'cr-nota' }, '"Da ricevere" comprende tutti i compensi maturati e non ancora pagati, anche fuori dal periodo scelto.'));
  box.appendChild(sez);

  // ---- ordini
  var ord = dati.ordini || [];
  var ro = el('section', { class: 'cr-sez' });
  var to = el('div', { class: 'cr-testa' });
  to.appendChild(el('h2', null, 'Ordini dei tuoi clienti'));
  to.appendChild(el('span', { class: 'cr-conta' }, String(ord.length)));
  ro.appendChild(to);
  if (!ord.length) {
    var vu = el('div', { class: 'cr-vuoto' });
    vu.appendChild(icona('ordini'));
    vu.appendChild(el('strong', null, 'Nessun ordine nel periodo'));
    vu.appendChild(el('p', null, attivo ? 'Quando un cliente paga un corso con il tuo codice, l\'ordine compare qui e ricevi un\'email.' : 'Gli ordini compariranno qui dopo l\'attivazione del codice.'));
    ro.appendChild(vu);
  }
  ord.forEach(function (o) {
    var d = el('details', { class: 'cr-ordine' });
    var s = el('summary');
    var av = el('div', { class: 'cr-avatar' }); av.appendChild(icona('utente'));
    s.appendChild(av);
    var mid = el('div', { class: 'cr-ordine-mid' });
    mid.appendChild(el('strong', null, o.cliente.intestatario || '—'));
    mid.appendChild(el('span', null, giorno(o.data) + ' · ' + o.partecipanti.length + (o.partecipanti.length === 1 ? ' iscrizione' : ' iscrizioni') + ' · ' + o.riferimento));
    s.appendChild(mid);
    var dx = el('div', { class: 'cr-ordine-dx' });
    dx.appendChild(el('strong', null, euro(o.totale)));
    if (o.compenso != null) {
      dx.appendChild(el('span', { class: 'cr-pill ' + (o.statoCompenso === 'pagato' ? 'cr-pill-ok' : 'cr-pill-attesa') },
        'compenso ' + euro(o.compenso) + (o.statoCompenso === 'pagato' ? ' · pagato' : '')));
    }
    s.appendChild(dx);
    s.appendChild(icona('freccia', 'cr-apri'));
    d.appendChild(s);
    var cl = o.cliente;
    var info = el('div', { class: 'cr-cliente' });
    [['P.IVA', cl.partitaIva], ['Codice fiscale', cl.codiceFiscale], ['Email', cl.email], ['Telefono', cl.telefono],
     ['Città', [cl.citta, cl.provincia].filter(Boolean).join(' ')], ['Codice usato', o.codice]].forEach(function (x) {
      if (!x[1]) return;
      var i = el('div'); i.appendChild(el('span', null, x[0])); i.appendChild(el('strong', null, x[1])); info.appendChild(i);
    });
    d.appendChild(info);
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

  // ---- pagamenti
  var pg = dati.pagamenti || [];
  var rp = el('section', { class: 'cr-sez' });
  var tp = el('div', { class: 'cr-testa' });
  tp.appendChild(el('h2', null, 'Pagamenti ricevuti'));
  rp.appendChild(tp);
  if (!pg.length) rp.appendChild(el('p', { class: 'cr-nota' }, 'Nessun pagamento registrato finora.'));
  pg.forEach(function (x) {
    var r = el('div', { class: 'cr-pagamento' });
    var ic = el('div', { class: 'cr-avatar cr-avatar-verde' }); ic.appendChild(icona('banca'));
    r.appendChild(ic);
    var m = el('div', { class: 'cr-ordine-mid' });
    m.appendChild(el('strong', null, euro(x.importo)));
    m.appendChild(el('span', null, giorno(x.data) + (x.riferimento ? ' · ' + x.riferimento : '')));
    r.appendChild(m);
    rp.appendChild(r);
  });
  box.appendChild(rp);
}
`;

export const STILE_CRUSCOTTO = `
.cr{--cr-nero:#0b0b0c;--cr-grigio:#6b7280;--cr-bordo:#e7e7ea;--cr-verde:#047857;--cr-verde-bg:#ecfdf5;--cr-ambra:#b45309;--cr-ambra-bg:#fffbeb;color:#111;font-feature-settings:"tnum"}
.cr *{box-sizing:border-box}
.cr h1,.cr h2{margin:0;letter-spacing:-.01em}
.cr-ico{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}
.cr-nota{color:var(--cr-grigio);font-size:13px;margin:6px 0 0}
.cr-hero{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;background:linear-gradient(135deg,#0b0b0c,#27272a);color:#fff;border-radius:18px;padding:26px 28px;margin:6px 0 18px}
.cr-hero h1{font-size:28px;margin:4px 0 6px}
.cr-hero p{margin:0;color:#d4d4d8;max-width:560px}
.cr-hero .cr-sopra{text-transform:uppercase;letter-spacing:.08em;font-size:11px;color:#a1a1aa}
.cr-pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:5px 11px;border-radius:999px;white-space:nowrap}
.cr-pill .cr-ico{width:14px;height:14px}
.cr-pill-ok{background:var(--cr-verde-bg);color:var(--cr-verde)}
.cr-pill-attesa{background:var(--cr-ambra-bg);color:var(--cr-ambra)}
.cr-pill-no{background:#fef2f2;color:#b91c1c}
.cr-codicebox,.cr-sez{background:#fff;border:1px solid var(--cr-bordo);border-radius:16px;padding:22px;margin:0 0 18px;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.cr-testa{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;flex-wrap:wrap}
.cr-testa h2{font-size:18px}
.cr-conta{background:#f4f4f5;border-radius:999px;padding:2px 10px;font-size:13px;font-weight:600}
.cr-coupon{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;border:2px dashed #111;border-radius:14px;padding:18px 20px;background:repeating-linear-gradient(135deg,#fff,#fff 12px,#fafafa 12px,#fafafa 24px)}
.cr-spento .cr-coupon{border-color:#c7c7cc;color:#71717a}
.cr-codice{font:800 30px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.06em}
.cr-coupon-sub{font-size:13px;color:var(--cr-grigio);margin-top:4px}
.cr-coupon-az{display:flex;gap:8px;flex-wrap:wrap}
.cr-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 14px;border:1px solid #d4d4d8;border-radius:10px;background:#fff;color:#111;font-family:inherit;font-weight:600;font-size:14px;line-height:1;cursor:pointer;text-decoration:none;transition:background .15s,border-color .15s}
.cr-btn:hover{background:#f4f4f5;border-color:#a1a1aa}
.cr-btn .cr-ico{width:16px;height:16px}
.cr-btn-scuro{background:#111;color:#fff;border-color:#111}
.cr-btn-scuro:hover{background:#27272a}
.cr-btn.cr-fatto{background:var(--cr-verde);border-color:var(--cr-verde);color:#fff}
.cr-linkriga{display:flex;align-items:center;gap:8px;margin-top:12px;padding:8px 12px;border:1px solid var(--cr-bordo);border-radius:10px;background:#fafafa;color:var(--cr-grigio)}
.cr-linkriga input{flex:1;min-width:0;border:0;background:transparent;font-size:13px;color:#111;outline:none}
.cr-avviso{display:flex;gap:12px;align-items:flex-start;margin-top:14px;padding:14px 16px;border-radius:12px;background:var(--cr-ambra-bg);color:#78350f}
.cr-avviso .cr-ico{margin-top:2px;color:var(--cr-ambra)}
.cr-avviso p{margin:0;font-size:14px}
.cr-passi{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:0 0 18px}
.cr-passo{display:flex;gap:12px;align-items:flex-start;background:#fff;border:1px solid var(--cr-bordo);border-radius:14px;padding:16px}
.cr-passo-n{width:38px;height:38px;border-radius:10px;background:#111;color:#fff;display:flex;align-items:center;justify-content:center;flex:none}
.cr-passo p{margin:4px 0 0;font-size:13px;color:var(--cr-grigio)}
.cr-kpi-griglia{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.cr-kpi{border:1px solid var(--cr-bordo);border-radius:14px;padding:16px;background:#fff}
.cr-kpi-ico{width:34px;height:34px;border-radius:9px;background:#f4f4f5;display:flex;align-items:center;justify-content:center;margin-bottom:12px}
.cr-kpi-val{font-size:24px;font-weight:800;letter-spacing:-.02em}
.cr-kpi-lab{font-size:13px;color:var(--cr-grigio);margin-top:2px}
.cr-kpi-verde{background:var(--cr-verde-bg);border-color:#a7f3d0}
.cr-kpi-verde .cr-kpi-ico{background:#d1fae5;color:var(--cr-verde)}
.cr-kpi-scuro{background:#111;border-color:#111;color:#fff}
.cr-kpi-scuro .cr-kpi-ico{background:#27272a}
.cr-kpi-scuro .cr-kpi-lab{color:#a1a1aa}
.cr-mini{display:flex;flex-wrap:wrap;gap:8px 24px;margin-top:14px;padding-top:14px;border-top:1px solid #f4f4f5;font-size:14px;color:var(--cr-grigio)}
.cr-mini div{display:flex;align-items:center;gap:6px}
.cr-mini strong{color:#111}
.cr-vuoto{text-align:center;padding:28px 12px;color:var(--cr-grigio)}
.cr-vuoto .cr-ico{width:34px;height:34px;color:#a1a1aa}
.cr-vuoto strong{display:block;color:#111;margin:8px 0 4px}
.cr-vuoto p{margin:0;font-size:14px}
.cr-ordine{border:1px solid var(--cr-bordo);border-radius:12px;margin-bottom:10px;overflow:hidden}
.cr-ordine summary{list-style:none;display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer}
.cr-ordine summary::-webkit-details-marker{display:none}
.cr-ordine summary:hover{background:#fafafa}
.cr-ordine[open] .cr-apri{transform:rotate(90deg)}
.cr-apri{color:#a1a1aa;transition:transform .15s}
.cr-avatar{width:38px;height:38px;border-radius:50%;background:#f4f4f5;display:flex;align-items:center;justify-content:center;flex:none}
.cr-avatar-verde{background:var(--cr-verde-bg);color:var(--cr-verde)}
.cr-ordine-mid{flex:1;min-width:0;display:flex;flex-direction:column}
.cr-ordine-mid span{font-size:13px;color:var(--cr-grigio)}
.cr-ordine-dx{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
.cr-cliente{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;padding:12px 14px;background:#fafafa;border-top:1px solid var(--cr-bordo)}
.cr-cliente span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--cr-grigio)}
.cr-cliente strong{font-size:14px;word-break:break-word}
.cr-pagamento{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #f4f4f5}
.cr-scroll{overflow-x:auto}
.cr-tab{border-collapse:collapse;font-size:13px;width:100%;min-width:560px}
.cr-tab th{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--cr-grigio);font-weight:600}
.cr-tab th,.cr-tab td{border-top:1px solid #f4f4f5;padding:8px 14px;text-align:left}
@media (max-width:600px){.cr-kpi-griglia{grid-template-columns:1fr 1fr;gap:8px}.cr-kpi{padding:12px}.cr-kpi-val{font-size:19px}.cr-tab td{white-space:nowrap}.cr-hero{padding:20px}.cr-hero h1{font-size:23px}.cr-codice{font-size:24px}.cr-codicebox,.cr-sez{padding:16px}.cr-ordine-dx .cr-pill{display:none}}
`;
