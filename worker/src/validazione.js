/**
 * validazione.js — controlli sui dati anagrafici raccolti per l'iscrizione ai corsi.
 *
 * I dati vengono usati dall'ente per creare l'account sulla piattaforma e per
 * intestare l'attestato: un codice fiscale sbagliato significa un attestato da
 * rifare. Meglio bloccarlo qui che scoprirlo dopo.
 */

const MESI_CF = 'ABCDEHLMPRST';

const DISPARI = {
  0: 1, 1: 0, 2: 5, 3: 7, 4: 9, 5: 13, 6: 15, 7: 17, 8: 19, 9: 21,
  A: 1, B: 0, C: 5, D: 7, E: 9, F: 13, G: 15, H: 17, I: 19, J: 21, K: 2,
  L: 4, M: 18, N: 20, O: 11, P: 3, Q: 6, R: 8, S: 12, T: 14, U: 16, V: 10,
  W: 22, X: 25, Y: 24, Z: 23,
};

const PARI = {
  0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
  A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9, K: 10,
  L: 11, M: 12, N: 13, O: 14, P: 15, Q: 16, R: 17, S: 18, T: 19, U: 20,
  V: 21, W: 22, X: 23, Y: 24, Z: 25,
};

/** Il codice fiscale ha un carattere di controllo: qui lo ricalcoliamo. */
export function validaCodiceFiscale(valore) {
  const cf = (valore || '').toUpperCase().replace(/\s/g, '');
  if (!cf) return 'Il codice fiscale è obbligatorio';
  if (!/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(cf)) {
    return 'Formato non valido: servono 16 caratteri (es. MRTMTT25D09F205Z)';
  }
  let somma = 0;
  for (let i = 0; i < 15; i += 1) {
    const c = cf[i];
    somma += (i % 2 === 0 ? DISPARI : PARI)[c];
  }
  const atteso = String.fromCharCode('A'.charCodeAt(0) + (somma % 26));
  if (atteso !== cf[15]) return 'Codice fiscale non valido: ricontrolla, il carattere di controllo non torna';
  return null;
}

/** Ricava data e sesso dal codice fiscale, per il riscontro con quanto digitato. */
export function datiDaCodiceFiscale(valore) {
  const cf = (valore || '').toUpperCase().replace(/\s/g, '');
  if (validaCodiceFiscale(cf)) return null;
  const anno = parseInt(cf.substring(6, 8), 10);
  const mese = MESI_CF.indexOf(cf[8]);
  let giorno = parseInt(cf.substring(9, 11), 10);
  const sesso = giorno > 40 ? 'F' : 'M';
  if (giorno > 40) giorno -= 40;
  if (mese < 0 || giorno < 1 || giorno > 31) return null;
  const annoCorrente = new Date().getFullYear() % 100;
  const secolo = anno <= annoCorrente ? 2000 : 1900;
  return { annoNascita: secolo + anno, mese: mese + 1, giorno, sesso };
}

/** Partita IVA italiana: 11 cifre con controllo finale. */
export function validaPartitaIva(valore) {
  const piva = (valore || '').replace(/\s/g, '');
  if (!piva) return 'La partita IVA è obbligatoria';
  if (!/^\d{11}$/.test(piva)) return 'La partita IVA deve avere 11 cifre';
  let somma = 0;
  for (let i = 0; i < 11; i += 1) {
    let cifra = parseInt(piva[i], 10);
    if (i % 2 === 1) {
      cifra *= 2;
      if (cifra > 9) cifra -= 9;
    }
    somma += cifra;
  }
  if (somma % 10 !== 0) return 'Partita IVA non valida: ricontrolla le cifre';
  return null;
}

export function validaEmail(valore) {
  const email = (valore || '').trim();
  if (!email) return "L'indirizzo email è obbligatorio";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Indirizzo email non valido';
  return null;
}

export function validaTelefono(valore, obbligatorio = true) {
  const tel = (valore || '').replace(/[\s\-.]/g, '');
  if (!tel) return obbligatorio ? 'Il telefono è obbligatorio' : null;
  if (!/^\+?\d{8,15}$/.test(tel)) return 'Numero di telefono non valido';
  return null;
}

export function validaObbligatorio(valore, etichetta) {
  if (!valore || !String(valore).trim()) return `${etichetta} è obbligatorio`;
  return null;
}

export function validaCap(valore) {
  const cap = (valore || '').trim();
  if (!cap) return 'Il CAP è obbligatorio';
  if (!/^\d{5}$/.test(cap)) return 'Il CAP deve avere 5 cifre';
  return null;
}

/** Codice destinatario SDI (7 caratteri) oppure PEC: ne serve almeno uno. */
export function validaFatturazioneElettronica(sdi, pec) {
  const codice = (sdi || '').trim().toUpperCase();
  const posta = (pec || '').trim();
  if (!codice && !posta) return 'Indica il codice SDI oppure la PEC per la fattura elettronica';
  if (codice && !/^[A-Z0-9]{6,7}$/.test(codice)) return 'Il codice destinatario SDI ha 6 o 7 caratteri';
  if (posta && validaEmail(posta)) return 'Indirizzo PEC non valido';
  return null;
}

export function validaDataNascita(valore) {
  if (!valore) return 'La data di nascita è obbligatoria';
  const data = new Date(valore);
  if (Number.isNaN(data.getTime())) return 'Data non valida';
  const oggi = new Date();
  if (data >= oggi) return 'La data di nascita non può essere nel futuro';
  const anni = (oggi - data) / (365.25 * 24 * 3600 * 1000);
  if (anni < 15) return 'Il partecipante deve avere almeno 15 anni';
  if (anni > 100) return 'Controlla la data di nascita';
  return null;
}
