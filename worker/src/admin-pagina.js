/**
 * admin-pagina.js — la pagina del pannello ordini (HTML e script).
 *
 * Tutti i dati dei clienti entrano nella pagina con textContent, mai come
 * HTML: un nome scritto male non può diventare codice.
 */

export const PAGINA = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Ordini corsi — MB Consulting</title>
<style>
  :root { --nero:#111; --grigio:#6b7280; --bordo:#e5e7eb; --sfondo:#f7f7f8; --bianco:#fff;
    --ambra:#b45309; --ambra-bg:#fef3c7; --blu:#1d4ed8; --blu-bg:#dbeafe; --viola:#6d28d9; --viola-bg:#ede9fe;
    --verde:#15803d; --verde-bg:#dcfce7; --rosso:#b91c1c; --rosso-bg:#fee2e2; --neutro-bg:#f3f4f6; }
  * { box-sizing:border-box; }
  body { margin:0; font:15px/1.5 -apple-system,"Segoe UI",Roboto,sans-serif; color:var(--nero); background:var(--sfondo); }
  header { background:var(--bianco); border-bottom:1px solid var(--bordo); padding:14px 20px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; }
  header h1 { font-size:18px; margin:0; }
  header .utente { color:var(--grigio); font-size:13px; }
  main { max-width:1200px; margin:0 auto; padding:20px 16px 60px; }
  .contatori { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:12px; margin-bottom:20px; }
  .contatore { background:var(--bianco); border:1px solid var(--bordo); border-radius:12px; padding:14px 16px; cursor:pointer; text-align:left; font:inherit; color:inherit; }
  .contatore:hover { border-color:var(--nero); }
  .contatore .etichetta { font-size:13px; color:var(--grigio); }
  .contatore .valore { font-size:26px; font-weight:700; line-height:1.2; }
  .contatore .sotto { font-size:13px; color:var(--grigio); }
  .barra { display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:12px; }
  .filtro { border:1px solid var(--bordo); background:var(--bianco); border-radius:999px; padding:6px 12px; font:inherit; font-size:14px; cursor:pointer; }
  .filtro.attivo { background:var(--nero); color:var(--bianco); border-color:var(--nero); }
  .filtro .n { opacity:.7; margin-left:4px; }
  input[type=search] { flex:1; min-width:200px; border:1px solid var(--bordo); border-radius:8px; padding:8px 12px; font:inherit; background:var(--bianco); }
  .tabella { background:var(--bianco); border:1px solid var(--bordo); border-radius:12px; overflow:hidden; }
  table { width:100%; border-collapse:collapse; }
  th, td { text-align:left; padding:10px 12px; border-bottom:1px solid var(--bordo); vertical-align:top; }
  th { font-size:12px; text-transform:uppercase; letter-spacing:.04em; color:var(--grigio); font-weight:600; background:#fafafa; }
  tbody tr { cursor:pointer; }
  tbody tr:hover { background:#fafafa; }
  td.num { text-align:right; white-space:nowrap; }
  .secondario { color:var(--grigio); font-size:13px; }
  .badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:12px; font-weight:600; white-space:nowrap; }
  .b-ambra { background:var(--ambra-bg); color:var(--ambra); } .b-blu { background:var(--blu-bg); color:var(--blu); }
  .b-viola { background:var(--viola-bg); color:var(--viola); } .b-verde { background:var(--verde-bg); color:var(--verde); }
  .b-rosso { background:var(--rosso-bg); color:var(--rosso); } .b-neutro { background:var(--neutro-bg); color:var(--grigio); }
  .vuoto { padding:40px; text-align:center; color:var(--grigio); }
  .velo { position:fixed; inset:0; background:rgba(0,0,0,.35); display:none; }
  .velo.aperto { display:block; }
  .scheda { position:fixed; top:0; right:0; bottom:0; width:min(640px,100%); background:var(--bianco); box-shadow:-8px 0 30px rgba(0,0,0,.15); overflow-y:auto; transform:translateX(100%); transition:transform .2s; }
  .scheda.aperta { transform:none; }
  .scheda .testa { position:sticky; top:0; background:var(--bianco); border-bottom:1px solid var(--bordo); padding:14px 20px; display:flex; justify-content:space-between; align-items:center; gap:10px; }
  .scheda .corpo { padding:16px 20px 40px; }
  .scheda h2 { font-size:18px; margin:0; }
  .scheda h3 { font-size:13px; text-transform:uppercase; letter-spacing:.05em; color:var(--grigio); margin:22px 0 8px; }
  dl { display:grid; grid-template-columns:150px 1fr; gap:4px 12px; margin:0; font-size:14px; }
  dt { color:var(--grigio); } dd { margin:0; word-break:break-word; }
  .azioni { display:flex; flex-direction:column; gap:10px; background:var(--sfondo); border-radius:12px; padding:14px; }
  button.primario { background:var(--nero); color:var(--bianco); border:0; border-radius:8px; padding:10px 14px; font:inherit; font-weight:600; cursor:pointer; }
  button.secondario-btn { background:var(--bianco); color:var(--nero); border:1px solid var(--bordo); border-radius:8px; padding:8px 12px; font:inherit; cursor:pointer; }
  button.pericolo { background:var(--bianco); color:var(--rosso); border:1px solid var(--rosso-bg); border-radius:8px; padding:8px 12px; font:inherit; cursor:pointer; }
  button:disabled { opacity:.5; cursor:wait; }
  a.link { color:var(--nero); font-weight:600; }
  .chiudi { background:none; border:0; font-size:26px; line-height:1; cursor:pointer; color:var(--grigio); }
  .partecipante { border:1px solid var(--bordo); border-radius:10px; padding:10px 12px; margin-bottom:8px; }
  .partecipante label { display:flex; gap:8px; align-items:center; font-weight:600; cursor:pointer; }
  .avviso { background:var(--ambra-bg); color:var(--ambra); border-radius:10px; padding:10px 12px; font-size:14px; }
  .toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--nero); color:var(--bianco); padding:10px 16px; border-radius:8px; font-size:14px; display:none; }
  .tabella { overflow-x:auto; }
  @media (max-width:760px) { .solo-largo { display:none; } dl { grid-template-columns:1fr; } dt { margin-top:6px; }
    th, td { padding:8px; } .badge { white-space:normal; } main { padding:14px 10px 60px; } .contatore .valore { font-size:22px; } }
</style>
</head>
<body>
<header>
  <h1>Ordini corsi sicurezza</h1>
  <span class="utente" id="utente"></span>
</header>
<main>
  <section class="contatori" id="contatori" aria-label="Riepilogo"></section>
  <div class="barra" id="filtri" role="tablist"></div>
  <div class="barra"><input type="search" id="cerca" placeholder="Cerca per riferimento, cliente, email, P. IVA, corso…" aria-label="Cerca"></div>
  <div class="tabella">
    <table>
      <thead><tr>
        <th>Riferimento</th><th>Cliente</th><th class="solo-largo">Corso</th>
        <th class="num">Totale</th><th>Stato</th><th class="solo-largo">Data</th>
      </tr></thead>
      <tbody id="righe"></tbody>
    </table>
    <div class="vuoto" id="vuoto" hidden>Nessun ordine in questa vista.</div>
  </div>
</main>
<div class="velo" id="velo"></div>
<aside class="scheda" id="scheda" aria-label="Dettaglio ordine"></aside>
<div class="toast" id="toast" role="status"></div>
<script src="/app.js"></script>
</body>
</html>`;

export const SCRIPT = String.raw`
'use strict';

const STATI = {
  in_attesa_bonifico: { testo: 'Bonifico da incassare', classe: 'b-ambra' },
  importo_da_verificare: { testo: 'Importo da verificare', classe: 'b-rosso' },
  pagato: { testo: 'Da caricare in piattaforma', classe: 'b-blu' },
  caricato: { testo: 'Attesa conferma account', classe: 'b-viola' },
  completato: { testo: 'Completato', classe: 'b-verde' },
  in_attesa_pagamento: { testo: 'Pagamento non completato', classe: 'b-neutro' },
  errore_pagamento: { testo: 'Errore di pagamento', classe: 'b-neutro' },
  annullato: { testo: 'Annullato', classe: 'b-neutro' },
};

const FILTRI = [
  { id: 'dafare', testo: 'Da fare', stati: ['in_attesa_bonifico', 'importo_da_verificare', 'pagato', 'caricato'] },
  { id: 'bonifici', testo: 'Bonifici da incassare', stati: ['in_attesa_bonifico'] },
  { id: 'caricare', testo: 'Da caricare', stati: ['pagato'] },
  { id: 'conferma', testo: 'Conferma account', stati: ['caricato'] },
  { id: 'completati', testo: 'Completati', stati: ['completato'] },
  { id: 'non', testo: 'Non completati / annullati', stati: ['in_attesa_pagamento', 'errore_pagamento', 'annullato'] },
  { id: 'tutti', testo: 'Tutti', stati: null },
];

let ordini = [];
let filtro = 'dafare';
let ricerca = '';

// --- utilità: si costruisce il DOM solo con textContent
function el(tag, props, ...figli) {
  const n = document.createElement(tag);
  if (props) for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const f of figli.flat()) if (f !== null && f !== undefined && f !== false) n.append(f instanceof Node ? f : document.createTextNode(String(f)));
  return n;
}
const euro = (n) => (Number(n) || 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
const data = (iso) => iso ? new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const dataBreve = (iso) => { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : (iso || '—'); };
const cliente = (o) => o.fatturazione.tipo === 'azienda' ? (o.fatturazione.ragioneSociale || '—') : ((o.fatturazione.nome || '') + ' ' + (o.fatturazione.cognome || '')).trim() || '—';
const badge = (stato) => { const s = STATI[stato] || { testo: stato, classe: 'b-neutro' }; return el('span', { class: 'badge ' + s.classe, text: s.testo }); };

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.style.display = 'block';
  clearTimeout(toast.timer); toast.timer = setTimeout(() => { t.style.display = 'none'; }, 3500);
}

async function api(percorso, opzioni = {}) {
  const r = await fetch(percorso, {
    ...opzioni,
    headers: { 'Content-Type': 'application/json', 'X-Pannello': '1', ...(opzioni.headers || {}) },
  });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(corpo.errore || ('Errore ' + r.status));
  return corpo;
}

// --- riepilogo in alto
function contatori() {
  const box = document.getElementById('contatori');
  box.replaceChildren();
  const conta = (stati) => ordini.filter((o) => stati.includes(o.stato));
  const bonifici = conta(['in_attesa_bonifico']);
  const mese = new Date().toISOString().slice(0, 7);
  const incassati = ordini.filter((o) => ['pagato', 'caricato', 'completato'].includes(o.stato) && String(o.pagatoIl || '').startsWith(mese));
  const card = (etichetta, valore, sotto, f) => el('button', { class: 'contatore', onclick: () => { if (f) { filtro = f; disegna(); } } },
    el('div', { class: 'etichetta', text: etichetta }), el('div', { class: 'valore', text: valore }), el('div', { class: 'sotto', text: sotto }));
  box.append(
    card('Bonifici da incassare', String(bonifici.length), euro(bonifici.reduce((s, o) => s + o.totale, 0)), 'bonifici'),
    card('Da caricare in piattaforma', String(conta(['pagato']).length), 'ordini pagati', 'caricare'),
    card('Attesa conferma account', String(conta(['caricato']).length), 'partecipanti da sollecitare', 'conferma'),
    card('Incassato questo mese', euro(incassati.reduce((s, o) => s + o.totale, 0)), incassati.length + ' ordini', 'tutti'),
  );
  const daVerificare = conta(['importo_da_verificare']);
  if (daVerificare.length) box.append(card('Importi da verificare', String(daVerificare.length), 'controlla su Stripe', 'dafare'));
}

// --- filtri ed elenco
function visibili() {
  const f = FILTRI.find((x) => x.id === filtro);
  const q = ricerca.trim().toLowerCase();
  return ordini.filter((o) => (!f.stati || f.stati.includes(o.stato)) && (!q || [
    o.riferimento, cliente(o), o.fatturazione.email, o.fatturazione.partitaIva, o.fatturazione.codiceFiscale, o.corso.titolo,
  ].join(' ').toLowerCase().includes(q)));
}

function disegna() {
  contatori();
  const barra = document.getElementById('filtri');
  barra.replaceChildren(...FILTRI.map((f) => {
    const n = f.stati ? ordini.filter((o) => f.stati.includes(o.stato)).length : ordini.length;
    return el('button', { class: 'filtro' + (f.id === filtro ? ' attivo' : ''), role: 'tab', 'aria-selected': String(f.id === filtro),
      onclick: () => { filtro = f.id; disegna(); } }, f.testo, el('span', { class: 'n', text: '(' + n + ')' }));
  }));
  const lista = visibili();
  document.getElementById('vuoto').hidden = lista.length > 0;
  document.getElementById('righe').replaceChildren(...lista.map((o) => el('tr', { onclick: () => apri(o.id), tabindex: '0',
      onkeydown: (e) => { if (e.key === 'Enter') apri(o.id); } },
    el('td', null, el('strong', { text: o.riferimento || '—' }), el('div', { class: 'secondario', text: o.metodo === 'bonifico' ? 'Bonifico' : 'Carta' })),
    el('td', null, cliente(o), el('div', { class: 'secondario', text: o.fatturazione.email || '' })),
    el('td', { class: 'solo-largo' }, o.corso.titolo, el('div', { class: 'secondario', text: o.partecipantiN + ' partecipant' + (o.partecipantiN === 1 ? 'e' : 'i') })),
    el('td', { class: 'num' }, euro(o.totale)),
    el('td', null, badge(o.stato), o.stato === 'caricato' ? el('div', { class: 'secondario', text: o.confermati + '/' + o.partecipantiN + ' confermati' }) : null),
    el('td', { class: 'solo-largo secondario', text: data(o.creatoIl) }),
  )));
}

// --- dettaglio
function chiudi() {
  document.getElementById('scheda').classList.remove('aperta');
  document.getElementById('velo').classList.remove('aperto');
}

function riga(etichetta, valore) {
  if (valore === undefined || valore === null || valore === '') return [];
  return [el('dt', { text: etichetta }), el('dd', { text: String(valore) })];
}

async function apri(id) {
  const scheda = document.getElementById('scheda');
  scheda.replaceChildren(el('div', { class: 'corpo', text: 'Caricamento…' }));
  scheda.classList.add('aperta');
  document.getElementById('velo').classList.add('aperto');
  try {
    mostra(await api('/api/ordini/' + id));
  } catch (e) {
    scheda.replaceChildren(el('div', { class: 'corpo', text: e.message }));
  }
}

async function azione(o, nome, conferma, extra) {
  if (conferma && !window.confirm(conferma)) return;
  try {
    const esito = await api('/api/ordini/' + o.id + '/azione', { method: 'POST', body: JSON.stringify({ azione: nome, ...(extra || {}) }) });
    toast(nome === 'bonifico_ricevuto' && esito.emailInviata ? 'Fatto. Email di conferma inviata al cliente.' : 'Fatto.');
    await carica();
    mostra(esito.ordine);
  } catch (e) { toast(e.message); }
}

function mostra(o) {
  const f = o.fatturazione;
  const azienda = f.tipo === 'azienda';
  const scheda = document.getElementById('scheda');

  const azioni = el('div', { class: 'azioni' });
  if (o.stato === 'in_attesa_bonifico') {
    const avvisa = el('input', { type: 'checkbox', id: 'avvisa', checked: true });
    azioni.append(
      el('div', { class: 'secondario', text: 'Controlla sul conto l’accredito di ' + euro(o.totale) + ' con causale ' + o.riferimento + '. La contabile da sola non basta.' }),
      el('label', { class: 'secondario' }, avvisa, ' invia al cliente l’email di conferma iscrizione'),
      el('button', { class: 'primario', onclick: () => azione(o, 'bonifico_ricevuto', 'Confermi che il bonifico di ' + euro(o.totale) + ' è accreditato sul conto?', { avvisaCliente: avvisa.checked }) }, 'Bonifico ricevuto'),
      el('button', { class: 'pericolo', onclick: () => azione(o, 'annulla', 'Annullare l’ordine ' + o.riferimento + '?') }, 'Annulla ordine (bonifico mai arrivato)'),
    );
  } else if (o.stato === 'importo_da_verificare') {
    azioni.append(
      el('div', { class: 'avviso', text: 'Stripe ha incassato un importo diverso da quello previsto. Controlla il pagamento su Stripe prima di procedere.' }),
      el('button', { class: 'primario', onclick: () => azione(o, 'pagamento_verificato', 'Hai verificato il pagamento su Stripe?') }, 'Pagamento verificato'),
    );
  } else if (o.stato === 'pagato') {
    azioni.append(
      el('div', { class: 'secondario', text: azienda ? '1. Crea l’azienda in piattaforma  2. Importa il CSV  3. Segna come caricato.' : 'Cliente privato: importa il CSV e segna come caricato.' }),
      el('a', { class: 'link', href: '/api/ordini/' + o.id + '/csv', text: 'Scarica il CSV per «Importa utenti»' }),
      el('button', { class: 'primario', onclick: () => azione(o, 'caricato', 'Hai caricato i partecipanti sulla piattaforma?') }, 'Caricato in piattaforma'),
    );
  } else if (o.stato === 'caricato') {
    azioni.append(
      el('div', { class: 'secondario', text: 'Spunta i partecipanti man mano che confermano l’account, poi abbina il corso e chiudi l’ordine.' }),
      el('button', { class: 'primario', onclick: () => azione(o, 'completato', o.confermati < o.partecipanti.length ? 'Non tutti gli account risultano confermati. Chiudere lo stesso?' : 'Chiudere l’ordine come completato?') }, 'Ordine completato'),
    );
  } else if (['in_attesa_pagamento', 'errore_pagamento'].includes(o.stato)) {
    azioni.append(
      el('div', { class: 'secondario', text: 'Il cliente ha iniziato il pagamento con carta ma non l’ha concluso. Puoi ricontattarlo o archiviare l’ordine.' }),
      el('button', { class: 'pericolo', onclick: () => azione(o, 'annulla', 'Archiviare l’ordine come annullato?') }, 'Archivia come annullato'),
    );
  } else {
    azioni.append(el('div', { class: 'secondario', text: 'Nessuna azione da fare.' }));
  }
  if (o.stato !== 'pagato') azioni.append(el('a', { class: 'link', href: '/api/ordini/' + o.id + '/csv', text: 'Scarica CSV' }));

  const partecipanti = o.partecipanti.map((p) => {
    const spunta = el('input', { type: 'checkbox', checked: p.confermato, onchange: async (e) => {
      try {
        await api('/api/partecipanti/' + p.id, { method: 'POST', body: JSON.stringify({ confermato: e.target.checked }) });
        toast(e.target.checked ? 'Account segnato come confermato' : 'Conferma tolta');
        await carica();
      } catch (err) { e.target.checked = !e.target.checked; toast(err.message); }
    } });
    return el('div', { class: 'partecipante' },
      el('label', null, spunta, (p.nome + ' ' + p.cognome), el('span', { class: 'secondario', text: ' — account confermato' })),
      el('dl', null,
        ...riga('Email', p.email), ...riga('Codice fiscale', p.codiceFiscale), ...riga('Nascita', dataBreve(p.dataNascita) + ', ' + (p.comuneNascita || '') + ' (' + (p.provinciaNascita || '') + ')'),
        ...riga('Telefono', p.telefono), ...riga('Qualifica', p.qualifica)));
  });

  scheda.replaceChildren(
    el('div', { class: 'testa' },
      el('div', null, el('h2', { text: o.riferimento || ('Ordine ' + o.id) }), badge(o.stato)),
      el('button', { class: 'chiudi', 'aria-label': 'Chiudi', onclick: chiudi }, '×')),
    el('div', { class: 'corpo' },
      azioni,
      el('h3', { text: 'Corso' }),
      el('dl', null, ...riga('Corso', o.corso.titolo + ' — ' + o.corso.ore + ' ore'), ...riga('SKU', o.corso.sku),
        ...riga('Importo', o.partecipantiN + ' × ' + euro(o.corso.prezzo) + ' = ' + euro(o.totale)),
        ...riga('Pagamento', o.metodo === 'bonifico' ? 'Bonifico' : 'Carta (Stripe)'),
        ...riga('Ordine del', data(o.creatoIl)), ...riga('Pagato il', o.pagatoIl ? data(o.pagatoIl) : ''), ...riga('Caricato il', o.caricatoIl ? data(o.caricatoIl) : '')),
      el('h3', { text: azienda ? 'Azienda (fattura)' : 'Cliente privato (fattura)' }),
      el('dl', null,
        ...riga(azienda ? 'Ragione sociale' : 'Nome', cliente(o)),
        ...riga(azienda ? 'Partita IVA' : 'Codice fiscale', azienda ? f.partitaIva : f.codiceFiscale),
        ...riga('Indirizzo', [f.indirizzo, [f.cap, f.citta, f.provincia ? '(' + f.provincia + ')' : ''].filter(Boolean).join(' ')].filter(Boolean).join(', ')),
        ...riga('Codice SDI', f.sdi), ...riga('PEC', f.pec), ...riga('Referente', f.referente),
        ...riga('Email', f.email), ...riga('Telefono', f.telefono), ...riga('ATECO', f.ateco)),
      el('h3', { text: 'Partecipanti (' + o.confermati + '/' + o.partecipanti.length + ' account confermati)' }),
      ...partecipanti,
    ),
  );
}

async function carica() {
  const dati = await api('/api/ordini');
  ordini = dati.ordini;
  document.getElementById('utente').textContent = dati.utente;
  disegna();
}

document.getElementById('velo').addEventListener('click', chiudi);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') chiudi(); });
document.getElementById('cerca').addEventListener('input', (e) => { ricerca = e.target.value; disegna(); });
carica().catch((e) => { document.getElementById('righe').replaceChildren(el('tr', null, el('td', { colspan: '6', text: 'Errore: ' + e.message }))); });
setInterval(() => { if (!document.hidden) carica().catch(() => {}); }, 120000);
`;
