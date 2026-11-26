/**
 * prenotazioni.js — richieste di adesione ai corsi di formazione finanziata.
 *
 * Nessun pagamento: l'azienda sceglie i corsi dal catalogo, indica quanti
 * partecipanti e lascia i dati aziendali. MB Consulting poi verifica
 * l'adesione al fondo e inserisce i corsi nel piano formativo.
 */
import { CORSI_FINANZIATI, TEMI_FINANZIATI, corsoFinanziato } from './catalogo-finanziato';
import { validaAteco, validaCap, validaEmail, validaPartitaIva, validaTelefono } from './validazione';
import { inviaEmail } from './email';
import { registraEvento } from './sicurezza';
import { province } from './province';

export const STATI_PRENOTAZIONE = ['nuova', 'contattata', 'adesione_verificata', 'nel_piano', 'non_idonea', 'annullata'];
const MAX_CORPO = 20000;
const LINK = /https?:\/\/|www\./i;

const testo = (v, max) => String(v == null ? '' : v).trim().replace(/\s+/g, ' ').slice(0, max);
const esc = (v) => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const stile = 'font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#111';
const nomeTema = (id) => (TEMI_FINANZIATI.find((t) => t.id === id) || {}).nome || '';

/** Controlli sul contenuto: non ci fidiamo di niente di quello che arriva. */
export function verificaPrenotazione(corpo) {
  const a = (corpo && corpo.azienda) || {};
  const d = {
    ragioneSociale: testo(a.ragioneSociale, 150), partitaIva: testo(a.partitaIva, 11).replace(/\s/g, ''),
    codiceFiscale: testo(a.codiceFiscale, 16).replace(/\s/g, '').toUpperCase(), matricolaInps: testo(a.matricolaInps, 10).replace(/\s/g, '').toUpperCase(),
    ateco: testo(a.ateco, 20), dipendenti: testo(a.dipendenti, 6), indirizzo: testo(a.indirizzo, 150), cap: testo(a.cap, 5),
    citta: testo(a.citta, 80), provincia: testo(a.provincia, 2).toUpperCase(), referente: testo(a.referente, 100),
    ruolo: testo(a.ruolo, 80), email: testo(a.email, 120).toLowerCase(), pec: testo(a.pec, 120).toLowerCase(),
    telefono: testo(a.telefono, 25), fonarcom: ['si', 'no', 'non_so'].includes(a.fonarcom) ? a.fonarcom : '',
    modalita: ['presenza', 'online', 'indifferente'].includes(a.modalita) ? a.modalita : 'indifferente',
    periodo: testo(a.periodo, 100), note: testo(a.note, 1000),
  };
  const errori = [];
  const aggiungi = (e) => { if (e) errori.push(e); };
  if (!d.ragioneSociale) errori.push('La ragione sociale è obbligatoria');
  aggiungi(validaPartitaIva(d.partitaIva));
  if (d.codiceFiscale && !/^([0-9]{11}|[A-Z0-9]{16})$/.test(d.codiceFiscale)) errori.push('Codice fiscale dell’azienda non valido');
  if (d.matricolaInps && !/^[0-9A-Z]{10}$/.test(d.matricolaInps)) errori.push('La matricola INPS ha 10 caratteri');
  aggiungi(validaAteco(d.ateco, { facoltativo: true }));
  if (d.dipendenti && !/^\d{1,5}$/.test(d.dipendenti)) errori.push('Numero di dipendenti non valido');
  if (!d.indirizzo) errori.push('L’indirizzo della sede è obbligatorio');
  aggiungi(validaCap(d.cap));
  if (!d.citta) errori.push('La città è obbligatoria');
  if (!province.some((p) => p.sigla === d.provincia)) errori.push('Provincia non valida');
  if (!d.referente) errori.push('Il nome del referente è obbligatorio');
  aggiungi(validaEmail(d.email));
  if (d.pec && validaEmail(d.pec)) errori.push('PEC non valida');
  aggiungi(validaTelefono(d.telefono));
  if (!d.fonarcom) errori.push('Indica se l’azienda aderisce a Fonarcom');
  if (!(corpo && corpo.privacy === true)) errori.push('Serve il consenso all’informativa privacy');
  if (LINK.test([d.ragioneSociale, d.referente, d.citta, d.indirizzo].join(' '))) errori.push('I dati non possono contenere link');
  if (/[<>]/.test(Object.values(d).join(''))) errori.push('Caratteri non ammessi');

  const visti = new Set();
  const corsi = [];
  for (const r of Array.isArray(corpo && corpo.corsi) ? corpo.corsi.slice(0, 31) : []) {
    const c = corsoFinanziato(r && r.id);
    const n = Number(r && r.partecipanti);
    if (!c) { errori.push('Corso non presente nel catalogo'); continue; }
    if (visti.has(c.id)) continue;
    visti.add(c.id);
    if (!Number.isInteger(n) || n < 1 || n > 200) { errori.push(`Numero di partecipanti non valido per «${c.titolo}»`); continue; }
    corsi.push({ id: c.id, codice: c.codice, titolo: c.titolo, ore: c.ore, tema: c.tema, partecipanti: n });
  }
  if (!corsi.length) errori.push('Scegli almeno un corso');
  if (corsi.length > 30) errori.push('Puoi scegliere al massimo 30 corsi per richiesta');
  return { errori: [...new Set(errori)], azienda: d, corsi };
}

function emailAzienda({ azienda, corsi, riferimento }) {
  const righe = corsi.map((c) => `<li>${esc(c.titolo)} (${c.ore} ore) — ${c.partecipanti} ${c.partecipanti === 1 ? 'partecipante' : 'partecipanti'}</li>`).join('');
  return {
    a: azienda.email,
    oggetto: `Richiesta ricevuta — formazione finanziata (${riferimento})`,
    html: `<div style="${stile}">
      <p>Gentile ${esc(azienda.referente)},</p>
      <p>abbiamo ricevuto la richiesta di <strong>${esc(azienda.ragioneSociale)}</strong> per questi corsi di formazione finanziata:</p>
      <ul>${righe}</ul>
      <p>Riferimento della richiesta: <strong>${esc(riferimento)}</strong>.</p>
      <p>Nei prossimi giorni ti contattiamo per verificare l’adesione al fondo interprofessionale e concordare
      modalità, calendario e partecipanti. La richiesta non è ancora un’iscrizione definitiva e non comporta alcun costo.</p>
      <p>Per qualsiasi domanda puoi rispondere a questa email.</p>
      <p>MB Consulting</p>
    </div>`,
  };
}

function emailAmministrazione(env, { azienda, corsi, riferimento, campagna }) {
  const riga = (k, v) => (v ? `<tr><td style="color:#666;padding-right:12px;vertical-align:top">${esc(k)}</td><td>${esc(v)}</td></tr>` : '');
  const fon = { si: 'sì', no: 'no', non_so: 'non lo sa' }[azienda.fonarcom];
  const tot = corsi.reduce((s, c) => s + c.partecipanti, 0);
  const righe = corsi.map((c) => `<li><strong>${esc(c.codice || '')}</strong> ${esc(c.titolo)} (${c.ore} ore) — ${c.partecipanti} part.</li>`).join('');
  const destinatari = String(env.EMAIL_NOTIFICHE || env.EMAIL_AMMINISTRATORE || '').split(',').map((x) => x.trim()).filter(Boolean);
  return {
    a: destinatari,
    oggetto: `Nuova richiesta formazione finanziata ${riferimento} — ${azienda.ragioneSociale}`,
    html: `<div style="${stile}">
      <p><strong>${esc(azienda.ragioneSociale)}</strong> ha chiesto ${corsi.length} ${corsi.length === 1 ? 'corso' : 'corsi'} per ${tot} partecipanti in tutto.</p>
      <ul>${righe}</ul>
      <table>${riga('P. IVA', azienda.partitaIva)}${riga('Codice fiscale', azienda.codiceFiscale)}${riga('Matricola INPS', azienda.matricolaInps)}
      ${riga('Aderisce a Fonarcom', fon)}${riga('ATECO', azienda.ateco)}${riga('Dipendenti', azienda.dipendenti)}
      ${riga('Sede', `${azienda.indirizzo}, ${azienda.cap} ${azienda.citta} (${azienda.provincia})`)}
      ${riga('Referente', `${azienda.referente}${azienda.ruolo ? ` — ${azienda.ruolo}` : ''}`)}${riga('Email', azienda.email)}${riga('PEC', azienda.pec)}
      ${riga('Telefono', azienda.telefono)}${riga('Modalità preferita', azienda.modalita)}${riga('Periodo', azienda.periodo)}
      ${riga('Note', azienda.note)}${riga('Campagna', campagna)}</table>
      <p>Gestiscila dal pannello, scheda «Formazione finanziata».</p>
    </div>`,
  };
}

export async function gestisciPrenotazione(env, richiesta) {
  const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  const ip = richiesta.headers.get('CF-Connecting-IP') || '';
  if (env.LIMITE_ISCRIZIONI) {
    const { success } = await env.LIMITE_ISCRIZIONI.limit({ key: `pren:${ip || 'sconosciuto'}` });
    if (!success) {
      await registraEvento(env, richiesta, 'troppe_richieste', 'prenotazioni formazione finanziata');
      return json({ errore: 'Troppe richieste: riprova fra un minuto' }, 429);
    }
  }
  const origine = richiesta.headers.get('Origin') || '';
  const ammesse = (env.ORIGINI_AMMESSE || '').split(',').map((o) => o.trim()).filter(Boolean);
  if (ammesse.length && !ammesse.includes(origine)) {
    await registraEvento(env, richiesta, 'origine_non_ammessa', `prenotazioni: ${origine || 'nessuna Origin'}`);
    return json({ errore: 'Richiesta non ammessa' }, 403);
  }
  let corpo;
  try {
    const t = await richiesta.text();
    if (t.length > MAX_CORPO) return json({ errore: 'Richiesta troppo grande' }, 413);
    corpo = JSON.parse(t);
  } catch (e) {
    await registraEvento(env, richiesta, 'richiesta_illeggibile', 'prenotazioni: JSON non valido');
    return json({ errore: 'Richiesta non leggibile' }, 400);
  }
  // campo trappola: le persone non lo vedono, i robot lo compilano
  if (corpo && corpo.sito) {
    await registraEvento(env, richiesta, 'registrazione_robot', 'prenotazioni: campo trappola compilato');
    return json({ riferimento: 'PF-RICEVUTA' });
  }
  const { errori, azienda, corsi } = verificaPrenotazione(corpo);
  if (errori.length) return json({ errore: errori.join('. '), errori }, 400);
  const campagna = testo(corpo.campagna, 60).replace(/[^\w.-]/g, '');

  const adesso = new Date().toISOString();
  const r = await env.DB.prepare(
    `INSERT INTO prenotazioni_finanziate (creato_il, stato, ragione_sociale, partita_iva, email, azienda, corsi, partecipanti_tot, campagna)
     VALUES (?, 'nuova', ?, ?, ?, ?, ?, ?, ?)`
  ).bind(adesso, azienda.ragioneSociale, azienda.partitaIva, azienda.email, JSON.stringify(azienda), JSON.stringify(corsi),
    corsi.reduce((s, c) => s + c.partecipanti, 0), campagna || null).run();
  const id = r.meta.last_row_id;
  const riferimento = `PF-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`;
  await env.DB.prepare('UPDATE prenotazioni_finanziate SET riferimento = ? WHERE id = ?').bind(riferimento, id).run();

  try { await inviaEmail(env, emailAmministrazione(env, { azienda, corsi, riferimento, campagna })); } catch (e) { console.error('email prenotazione admin', e.message); }
  try { await inviaEmail(env, emailAzienda({ azienda, corsi, riferimento })); } catch (e) { console.error('email prenotazione azienda', e.message); }
  return json({ riferimento });
}

// ------------------------------------------------------------ pannello admin

const leggi = (r) => {
  let azienda = {}; let corsi = [];
  try { azienda = JSON.parse(r.azienda || '{}'); } catch (e) { /* vuoto */ }
  try { corsi = JSON.parse(r.corsi || '[]'); } catch (e) { /* vuoto */ }
  return { id: r.id, riferimento: r.riferimento, creatoIl: r.creato_il, stato: r.stato, note: r.note_admin || '',
    campagna: r.campagna || '', partecipantiTot: r.partecipanti_tot, azienda, corsi };
};

export async function elencoPrenotazioni(env, stato) {
  const filtro = STATI_PRENOTAZIONE.includes(stato) ? stato : null;
  const r = await env.DB.prepare(`SELECT * FROM prenotazioni_finanziate ${filtro ? 'WHERE stato = ?' : ''} ORDER BY id DESC LIMIT 1000`)
    .bind(...(filtro ? [filtro] : [])).all();
  const tutte = (await env.DB.prepare('SELECT stato, corsi FROM prenotazioni_finanziate').all()).results || [];
  const perStato = Object.fromEntries(STATI_PRENOTAZIONE.map((s) => [s, 0]));
  const perCorso = new Map();
  for (const x of tutte) {
    perStato[x.stato] = (perStato[x.stato] || 0) + 1;
    if (['annullata', 'non_idonea'].includes(x.stato)) continue;
    let corsi = []; try { corsi = JSON.parse(x.corsi || '[]'); } catch (e) { /* vuoto */ }
    for (const c of corsi) {
      const v = perCorso.get(c.id) || { id: c.id, codice: c.codice || '', titolo: c.titolo, richieste: 0, partecipanti: 0 };
      v.richieste += 1; v.partecipanti += c.partecipanti; perCorso.set(c.id, v);
    }
  }
  return {
    prenotazioni: (r.results || []).map(leggi),
    perStato,
    corsiRichiesti: [...perCorso.values()].sort((a, b) => b.partecipanti - a.partecipanti).slice(0, 15),
  };
}

export async function aggiornaPrenotazione(env, id, corpo) {
  const attuale = await env.DB.prepare('SELECT id FROM prenotazioni_finanziate WHERE id = ?').bind(id).first();
  if (!attuale) return { errore: 'Richiesta non trovata', stato: 404 };
  const sets = []; const vals = [];
  if (corpo.stato !== undefined) {
    if (!STATI_PRENOTAZIONE.includes(corpo.stato)) return { errore: 'Stato non valido', stato: 400 };
    sets.push('stato = ?'); vals.push(corpo.stato);
  }
  if (corpo.note !== undefined) { sets.push('note_admin = ?'); vals.push(String(corpo.note).slice(0, 2000)); }
  if (!sets.length) return { errore: 'Niente da aggiornare', stato: 400 };
  await env.DB.prepare(`UPDATE prenotazioni_finanziate SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, id).run();
  return { ok: true };
}

const cella = (v) => { const s = String(v == null ? '' : v); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

/** Una riga per corso richiesto: comoda da filtrare in Excel. */
export function csvPrenotazioni(elenco) {
  const intest = ['riferimento', 'data', 'stato', 'ragione_sociale', 'partita_iva', 'codice_fiscale', 'matricola_inps', 'fonarcom',
    'ateco', 'dipendenti', 'indirizzo', 'cap', 'citta', 'provincia', 'referente', 'ruolo', 'email', 'pec', 'telefono',
    'modalita', 'periodo', 'codice_corso', 'tema', 'corso', 'ore', 'partecipanti', 'campagna', 'note_azienda', 'note_interne'];
  const righe = [intest.join(',')];
  for (const p of elenco) {
    const a = p.azienda;
    for (const c of p.corsi) {
      righe.push([p.riferimento, p.creatoIl.slice(0, 10), p.stato, a.ragioneSociale, a.partitaIva, a.codiceFiscale, a.matricolaInps, a.fonarcom,
        a.ateco, a.dipendenti, a.indirizzo, a.cap, a.citta, a.provincia, a.referente, a.ruolo, a.email, a.pec, a.telefono,
        a.modalita, a.periodo, c.codice || '', nomeTema(c.tema), c.titolo, c.ore, c.partecipanti, p.campagna, a.note, p.note].map(cella).join(','));
    }
  }
  return `﻿${righe.join('\n')}\n`;
}

export const _test = { CORSI_FINANZIATI };
