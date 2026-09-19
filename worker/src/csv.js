/**
 * csv.js — genera il file nel formato esatto del template "Importa utenti"
 * della piattaforma EFEI, così l'ordine si carica senza ritocchi.
 *
 * Intestazione presa dal template scaricato dalla piattaforma il 19/09/2026:
 * una riga per partecipante crea l'utente, lo collega all'azienda tramite
 * partita IVA e gli abbina il corso tramite SKU.
 */

const INTESTAZIONE = [
  'NOME*',
  'COGNOME*',
  'EMAIL*',
  'DATA DI NASCITA (GG/MM/AAAA)*',
  'LUOGO DI NASCITA*',
  'AREA (come indicato su piattaforma)',
  'CODICE FISCALE*',
  'TELEFONO',
  'QUALIFICA*',
  'AZIENDA (inserire partita iva)',
  'CORSO (SKU corso)',
];

/** 2026-04-09 → 09/04/2026 */
export function dataItaliana(iso) {
  if (!iso) return '';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(iso);
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function cella(valore) {
  const v = valore === null || valore === undefined ? '' : String(valore);
  return /[",;\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/**
 * @param {object} ordine  dati dell'ordine (corso e fatturazione)
 * @param {Array}  partecipanti
 * @returns {string} contenuto CSV
 */
export function csvImportEfei(ordine, partecipanti) {
  const partitaIva = (ordine.fatturazione && ordine.fatturazione.partitaIva) || '';
  const righe = partecipanti.map((p) =>
    [
      p.nome,
      p.cognome,
      p.email,
      dataItaliana(p.dataNascita),
      p.comuneNascita,
      p.regioneNascita,
      (p.codiceFiscale || '').toUpperCase(),
      p.telefono || '',
      p.qualifica,
      partitaIva,
      ordine.corso.sku,
    ].map(cella).join(',')
  );
  // BOM: senza, Excel in italiano sbaglia gli accenti aprendo il file
  return '﻿' + [INTESTAZIONE.join(','), ...righe].join('\r\n') + '\r\n';
}

export function nomeFileCsv(riferimento) {
  return `import-${riferimento}.csv`;
}
