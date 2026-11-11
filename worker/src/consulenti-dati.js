/**
 * consulenti-dati.js — codici sconto, consulenti e compensi.
 *
 * Usato da tre Worker:
 *  - iscrizioni (verifica del codice, sconto, compenso al pagamento);
 *  - admin (gestione consulenti e codici, riepiloghi, pagamenti);
 *  - area-consulenti (cruscotto del singolo consulente).
 *
 * Regole:
 *  - un codice vale se è attivo e, quando appartiene a un consulente, se il
 *    consulente è "attivo" (contratto firmato);
 *  - lo sconto lo calcola sempre il server, sul prezzo del catalogo;
 *  - il compenso è una percentuale dell'incassato (dopo lo sconto) e si
 *    registra una sola volta per ordine, quando Stripe conferma il pagamento.
 */

export const STATI_CONSULENTE = ['in_attesa_contratto', 'attivo', 'sospeso'];
export const ORDINI_INCASSATI = ['pagato', 'caricato', 'completato'];
const IN_INCASSATI = ORDINI_INCASSATI.map((s) => `'${s}'`).join(',');

export const centesimi = (n) => Math.round(Number(n || 0) * 100) / 100;

/** "rossi-7k3 " → "ROSSI-7K3"; null se il formato non è ammesso. */
export function normalizzaCodice(valore) {
  const c = String(valore || '').trim().toUpperCase();
  return /^[A-Z0-9][A-Z0-9-]{2,29}$/.test(c) ? c : null;
}

/** Prezzo scontato, arrotondato al centesimo. */
export const applicaSconto = (prezzo, scontoPct) => centesimi(Number(prezzo) * (1 - Number(scontoPct || 0) / 100));

/**
 * Codice utilizzabile adesso? Restituisce { codice, scontoPct, consulenteId } oppure null.
 * Una sola lettura, per chiave primaria.
 */
export async function cercaCodice(env, valore) {
  const codice = normalizzaCodice(valore);
  if (!codice || !env.DB) return null;
  try {
    const r = await env.DB.prepare(
      `SELECT k.codice, k.sconto_pct, k.consulente_id, c.stato AS stato_consulente
         FROM codici_sconto k LEFT JOIN consulenti c ON c.id = k.consulente_id
        WHERE k.codice = ? AND k.attivo = 1`
    ).bind(codice).first();
    if (!r) return null;
    if (r.consulente_id && r.stato_consulente !== 'attivo') return null;
    return { codice: r.codice, scontoPct: Number(r.sconto_pct) || 0, consulenteId: r.consulente_id || null };
  } catch (e) {
    // tabelle non ancora create: nessun codice è valido
    console.error('codici sconto', e.message);
    return null;
  }
}

/** Click dal link del consulente: solo un contatore per codice e giorno. */
export async function registraClick(env, valore) {
  const codice = normalizzaCodice(valore);
  if (!codice) return false;
  const valido = await cercaCodice(env, codice);
  if (!valido) return false;
  const giorno = new Date().toISOString().slice(0, 10);
  await env.DB.prepare(
    `INSERT INTO codici_click (codice, giorno, click) VALUES (?, ?, 1)
     ON CONFLICT(codice, giorno) DO UPDATE SET click = click + 1`
  ).bind(codice, giorno).run();
  return true;
}

/**
 * Al pagamento: registra il compenso del consulente (uno per ordine).
 * Restituisce { consulente, compenso, pct } se ne ha registrato uno nuovo, altrimenti null.
 */
export async function registraCompenso(env, ordine) {
  if (!ordine || !ordine.consulente_id) return null;
  const consulente = await env.DB.prepare('SELECT * FROM consulenti WHERE id = ?').bind(ordine.consulente_id).first();
  if (!consulente) return null;
  const pct = Number(consulente.compenso_pct) || 0;
  const incassato = centesimi(ordine.totale);
  const compenso = centesimi((incassato * pct) / 100);
  const esito = await env.DB.prepare(
    `INSERT OR IGNORE INTO compensi (ordine_id, consulente_id, codice, incassato, compenso_pct, compenso, stato, maturato_il)
     VALUES (?, ?, ?, ?, ?, ?, 'maturato', ?)`
  ).bind(ordine.id, consulente.id, ordine.codice_sconto || '', incassato, pct, compenso, new Date().toISOString()).run();
  if (!esito.meta || !esito.meta.changes) return null;
  return { consulente, compenso, pct };
}

// ------------------------------------------------------------ creazione

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // senza 0/O e 1/I: si dettano al telefono

function casuale(n) {
  const byte = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(byte, (b) => ALFABETO[b % ALFABETO.length]).join('');
}

/** ROSSI-7K3, BIANCHI-Q8M... ; per i codici generici un prefisso a scelta. */
export function generaCodice(base) {
  const radice = String(base || 'MB')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) || 'MB';
  return `${radice}-${casuale(3)}`;
}

/** Inserisce un codice nuovo, riprovando se per caso esiste già. */
export async function creaCodice(env, { base, codice, scontoPct = 20, consulenteId = null, descrizione = '' }) {
  for (let i = 0; i < 5; i += 1) {
    const c = codice ? normalizzaCodice(codice) : generaCodice(base);
    if (!c) throw new Error('Formato del codice non valido: 3–30 caratteri tra lettere, numeri e trattino');
    const r = await env.DB.prepare(
      `INSERT OR IGNORE INTO codici_sconto (codice, sconto_pct, consulente_id, attivo, descrizione, creato_il)
       VALUES (?, ?, ?, 1, ?, ?)`
    ).bind(c, Number(scontoPct), consulenteId, String(descrizione || '').slice(0, 200), new Date().toISOString()).run();
    if (r.meta && r.meta.changes) return c;
    if (codice) throw new Error('Questo codice esiste già');
  }
  throw new Error('Non riesco a generare un codice univoco: riprova');
}

// ------------------------------------------------------------ riepiloghi

/** Periodo come coppia di date "AAAA-MM-GG"; default ultimi 30 giorni. */
export function periodo(da, a) {
  const valida = (s) => (/^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) ? s : null);
  const fine = valida(a) || new Date().toISOString().slice(0, 10);
  const inizio = valida(da) || new Date(Date.parse(fine) - 29 * 864e5).toISOString().slice(0, 10);
  return { da: inizio, a: fine };
}

const mappa = (righe, chiave) => Object.fromEntries((righe || []).map((r) => [r[chiave], r]));

/** Tutti i consulenti con i numeri del periodo (admin). */
export async function elencoConsulenti(env, da, a) {
  const p = periodo(da, a);
  const [consulenti, codici, click, ordini, compensi, daPagare] = await Promise.all([
    env.DB.prepare('SELECT * FROM consulenti ORDER BY cognome, nome').all(),
    env.DB.prepare('SELECT * FROM codici_sconto ORDER BY creato_il').all(),
    env.DB.prepare(
      `SELECT k.consulente_id AS id, k.codice, SUM(c.click) AS click
         FROM codici_click c JOIN codici_sconto k ON k.codice = c.codice
        WHERE c.giorno BETWEEN ? AND ? GROUP BY k.codice`
    ).bind(p.da, p.a).all(),
    env.DB.prepare(
      `SELECT consulente_id AS id, codice_sconto AS codice, COUNT(*) AS ordini, SUM(totale) AS incassato
         FROM ordini WHERE codice_sconto IS NOT NULL AND stato IN (${IN_INCASSATI})
          AND substr(creato_il, 1, 10) BETWEEN ? AND ? GROUP BY codice_sconto`
    ).bind(p.da, p.a).all(),
    env.DB.prepare(
      `SELECT consulente_id AS id, stato, SUM(compenso) AS totale
         FROM compensi WHERE substr(maturato_il, 1, 10) BETWEEN ? AND ? GROUP BY consulente_id, stato`
    ).bind(p.da, p.a).all(),
    env.DB.prepare(`SELECT consulente_id AS id, SUM(compenso) AS totale FROM compensi WHERE stato = 'maturato' GROUP BY consulente_id`).all(),
  ]);

  const clickPerCodice = mappa(click.results, 'codice');
  const ordiniPerCodice = mappa(ordini.results, 'codice');
  const daPagarePer = mappa(daPagare.results, 'id');
  const numeriCodice = (k) => ({
    click: Number((clickPerCodice[k.codice] || {}).click) || 0,
    ordini: Number((ordiniPerCodice[k.codice] || {}).ordini) || 0,
    incassato: centesimi((ordiniPerCodice[k.codice] || {}).incassato),
  });

  const righe = (consulenti.results || []).map((c) => {
    const suoi = (codici.results || []).filter((k) => k.consulente_id === c.id);
    const n = suoi.map(numeriCodice).reduce((s, x) => ({
      click: s.click + x.click, ordini: s.ordini + x.ordini, incassato: centesimi(s.incassato + x.incassato),
    }), { click: 0, ordini: 0, incassato: 0 });
    const comp = (compensi.results || []).filter((r) => r.id === c.id);
    const somma = (stato) => centesimi(comp.filter((r) => r.stato === stato).reduce((s, r) => s + Number(r.totale || 0), 0));
    return {
      ...pubblicoConsulente(c),
      codici: suoi.map((k) => ({ codice: k.codice, scontoPct: k.sconto_pct, attivo: Boolean(k.attivo) })),
      ...n,
      conversione: n.click ? centesimi((n.ordini / n.click) * 100) : null,
      compensoMaturato: centesimi(somma('maturato') + somma('pagato')),
      compensoPagato: somma('pagato'),
      daPagare: centesimi((daPagarePer[c.id] || {}).totale),
    };
  });

  const generici = (codici.results || []).filter((k) => !k.consulente_id).map((k) => ({
    codice: k.codice, scontoPct: k.sconto_pct, attivo: Boolean(k.attivo), descrizione: k.descrizione || '', ...numeriCodice(k),
  }));

  const totali = righe.reduce((t, r) => ({
    click: t.click + r.click, ordini: t.ordini + r.ordini, incassato: centesimi(t.incassato + r.incassato),
    compensoMaturato: centesimi(t.compensoMaturato + r.compensoMaturato), daPagare: centesimi(t.daPagare + r.daPagare),
  }), { click: 0, ordini: 0, incassato: 0, compensoMaturato: 0, daPagare: 0 });

  return { periodo: p, consulenti: righe, generici, totali };
}

export const pubblicoConsulente = (c) => ({
  id: c.id, nome: c.nome, cognome: c.cognome, ragioneSociale: c.ragione_sociale || '', pivaCf: c.piva_cf || '',
  pec: c.pec || '', email: c.email, telefono: c.telefono || '', compensoPct: c.compenso_pct, stato: c.stato,
  note: c.note || '', creatoIl: c.creato_il,
});

/** Cruscotto di un consulente: lo stesso per l'area consulenti e per "vedi come il consulente". */
export async function cruscotto(env, consulenteId, da, a, { conNote = false } = {}) {
  const p = periodo(da, a);
  const c = await env.DB.prepare('SELECT * FROM consulenti WHERE id = ?').bind(consulenteId).first();
  if (!c) return null;
  const [codici, click, ordini, pagamenti, daPagare] = await Promise.all([
    env.DB.prepare('SELECT codice, sconto_pct, attivo FROM codici_sconto WHERE consulente_id = ? ORDER BY creato_il').bind(c.id).all(),
    env.DB.prepare(
      `SELECT SUM(c.click) AS click FROM codici_click c JOIN codici_sconto k ON k.codice = c.codice
        WHERE k.consulente_id = ? AND c.giorno BETWEEN ? AND ?`
    ).bind(c.id, p.da, p.a).first(),
    env.DB.prepare(
      `SELECT o.*, m.compenso, m.compenso_pct, m.stato AS stato_compenso
         FROM ordini o LEFT JOIN compensi m ON m.ordine_id = o.id
        WHERE o.consulente_id = ? AND o.stato IN (${IN_INCASSATI})
          AND substr(o.creato_il, 1, 10) BETWEEN ? AND ?
        ORDER BY o.id DESC LIMIT 500`
    ).bind(c.id, p.da, p.a).all(),
    env.DB.prepare('SELECT * FROM pagamenti_consulenti WHERE consulente_id = ? ORDER BY pagato_il DESC LIMIT 100').bind(c.id).all(),
    env.DB.prepare(`SELECT SUM(compenso) AS totale FROM compensi WHERE consulente_id = ? AND stato = 'maturato'`).bind(c.id).first(),
  ]);

  const righeOrdini = ordini.results || [];
  let partecipanti = [];
  if (righeOrdini.length) {
    const ids = righeOrdini.map((o) => o.id);
    const segnaposto = ids.map(() => '?').join(',');
    partecipanti = (await env.DB.prepare(
      `SELECT ordine_id, nome, cognome, codice_fiscale, email, corso_titolo, corso_ore, prezzo
         FROM partecipanti WHERE ordine_id IN (${segnaposto}) ORDER BY id`
    ).bind(...ids).all()).results || [];
  }

  const elenco = righeOrdini.map((o) => {
    let f = {};
    try { f = JSON.parse(o.fatturazione || '{}'); } catch (e) { /* dato vecchio */ }
    return {
      riferimento: o.riferimento,
      data: o.pagato_il || o.creato_il,
      codice: o.codice_sconto,
      cliente: {
        tipo: f.tipo,
        intestatario: f.tipo === 'azienda' ? f.ragioneSociale : `${f.nome || ''} ${f.cognome || ''}`.trim(),
        partitaIva: f.partitaIva || '', codiceFiscale: f.codiceFiscale || '',
        email: f.email || '', telefono: f.telefono || '', citta: f.citta || '', provincia: f.provincia || '',
      },
      partecipanti: partecipanti.filter((x) => x.ordine_id === o.id).map((x) => ({
        nome: x.nome, cognome: x.cognome, codiceFiscale: x.codice_fiscale, email: x.email,
        corso: x.corso_titolo || o.corso_titolo, ore: x.corso_ore || o.corso_ore, prezzo: x.prezzo,
      })),
      totaleListino: o.totale_listino, totale: o.totale,
      compenso: o.compenso == null ? null : Number(o.compenso),
      statoCompenso: o.stato_compenso || null,
    };
  });

  const incassato = centesimi(elenco.reduce((s, o) => s + Number(o.totale || 0), 0));
  const maturato = centesimi(elenco.reduce((s, o) => s + Number(o.compenso || 0), 0));
  const pagato = centesimi(elenco.filter((o) => o.statoCompenso === 'pagato').reduce((s, o) => s + Number(o.compenso || 0), 0));
  const nClick = Number((click || {}).click) || 0;
  const consulente = pubblicoConsulente(c);
  if (!conNote) delete consulente.note;

  return {
    periodo: p,
    consulente,
    codici: (codici.results || []).map((k) => ({ codice: k.codice, scontoPct: k.sconto_pct, attivo: Boolean(k.attivo) })),
    numeri: {
      click: nClick, ordini: elenco.length, incassato,
      conversione: nClick ? centesimi((elenco.length / nClick) * 100) : null,
      compensoMaturato: maturato, compensoPagato: pagato,
      daPagare: centesimi((daPagare || {}).totale),
    },
    ordini: elenco,
    pagamenti: (pagamenti.results || []).map((x) => ({ data: x.pagato_il, importo: x.importo, riferimento: x.riferimento || '' })),
  };
}

/** CSV degli ordini del cruscotto: una riga per partecipante. */
export function csvCruscotto(dati) {
  const cella = (v) => {
    let s = v == null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const testa = ['riferimento', 'data', 'codice', 'cliente', 'piva', 'cf_cliente', 'email_cliente', 'telefono_cliente',
    'partecipante', 'cf_partecipante', 'email_partecipante', 'corso', 'prezzo', 'totale_ordine', 'compenso_ordine', 'stato_compenso'];
  const righe = [];
  dati.ordini.forEach((o) => {
    (o.partecipanti.length ? o.partecipanti : [{}]).forEach((p, i) => {
      righe.push([o.riferimento, String(o.data || '').slice(0, 10), o.codice, o.cliente.intestatario, o.cliente.partitaIva,
        o.cliente.codiceFiscale, o.cliente.email, o.cliente.telefono,
        `${p.nome || ''} ${p.cognome || ''}`.trim(), p.codiceFiscale, p.email, p.corso, p.prezzo,
        i === 0 ? o.totale : '', i === 0 ? o.compenso : '', i === 0 ? o.statoCompenso : ''].map(cella).join(','));
    });
  });
  return '﻿' + [testa.join(','), ...righe].join('\r\n') + '\r\n';
}

/** Segna come pagati tutti i compensi maturati del consulente e registra il pagamento. */
export async function registraPagamento(env, consulenteId, { riferimento = '', note = '', data } = {}) {
  // si pagano i compensi maturati fino a questo istante: quelli che arrivano mentre si registra restano al prossimo giro
  const adesso = new Date().toISOString();
  const r = await env.DB.prepare(`SELECT SUM(compenso) AS totale, COUNT(*) AS n FROM compensi
     WHERE consulente_id = ? AND stato = 'maturato' AND maturato_il <= ?`).bind(consulenteId, adesso).first();
  const importo = centesimi((r || {}).totale);
  if (!importo) return { errore: 'Non ci sono compensi da pagare' };
  const giorno = /^\d{4}-\d{2}-\d{2}$/.test(String(data || '')) ? data : adesso.slice(0, 10);
  const ins = await env.DB.prepare(
    'INSERT INTO pagamenti_consulenti (consulente_id, importo, pagato_il, riferimento, note, creato_il) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(consulenteId, importo, giorno, String(riferimento).slice(0, 120), String(note).slice(0, 500), adesso).run();
  const pagamentoId = ins.meta.last_row_id;
  await env.DB.prepare(`UPDATE compensi SET stato = 'pagato', pagamento_id = ?
     WHERE consulente_id = ? AND stato = 'maturato' AND maturato_il <= ?`).bind(pagamentoId, consulenteId, adesso).run();
  return { ok: true, importo, compensi: Number(r.n) || 0 };
}
