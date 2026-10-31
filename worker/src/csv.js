/**
 * csv.js — elenco partecipanti dell'ordine, allegato alla notifica.
 *
 * Per l'iscrizione alla piattaforma e-learning bastano nome, cognome,
 * codice fiscale ed email; il corso è indicato in ultima colonna.
 */

const INTESTAZIONE = ['NOME', 'COGNOME', 'CODICE FISCALE', 'EMAIL', 'CORSO'];

/** 2026-04-09 → 09/04/2026 */
export function dataItaliana(iso) {
  if (!iso) return '';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(iso);
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function cella(valore) {
  let v = valore === null || valore === undefined ? '' : String(valore);
  // Excel esegue come formula una cella che inizia con = + - @: la neutralizziamo.
  // I numeri di telefono tipo +39 333 1234567 restano come sono.
  if (/^[=+\-@\t\r]/.test(v) && !/^\+?\d[\d\s]*$/.test(v)) v = `'${v}`;
  return /[",;\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/**
 * @param {object} ordine  dati dell'ordine (corso e fatturazione)
 * @param {Array}  partecipanti
 * @returns {string} contenuto CSV
 */
export function csvPartecipanti(ordine, partecipanti) {
  const righe = partecipanti.map((p) =>
    [
      p.nome,
      p.cognome,
      (p.codiceFiscale || '').toUpperCase(),
      p.email,
      (p.corso && p.corso.titolo) || p.corsoTitolo || ordine.corso.titolo,
    ].map(cella).join(',')
  );
  // BOM: senza, Excel in italiano sbaglia gli accenti aprendo il file
  return '\ufeff' + [INTESTAZIONE.join(','), ...righe].join('\r\n') + '\r\n';
}

export function nomeFileCsv(riferimento) {
  return `import-${riferimento}.csv`;
}
