/**
 * rischioAteco.js — classificazione dei settori per livello di rischio.
 *
 * Fonte: Allegato IV dell'Accordo Stato-Regioni del 17 aprile 2025
 * ("Individuazione macrocategorie di rischio e corrispondenze ATECO 2007").
 * Le ore sono quelle dell'Accordo: 4 generale + 4/8/12 di specifica.
 *
 * Il livello qui indicato è quello di partenza: la durata definitiva dipende
 * dalla valutazione dei rischi dell'azienda e le ore dell'Accordo sono minime.
 */

export const livelli = {
  basso: { nome: 'Rischio basso', generale: 4, specifica: 4, totale: 8, corso: 'formazione-generale-specifica-rischio-basso-8h' },
  medio: { nome: 'Rischio medio', generale: 4, specifica: 8, totale: 12, corso: null },
  alto: { nome: 'Rischio alto', generale: 4, specifica: 12, totale: 16, corso: null },
};

// divisione ATECO 2007 (due cifre) → [sezione, descrizione, livello]
export const divisioni = [
  ['01', 'A', 'Coltivazioni agricole e produzione di prodotti animali, caccia e servizi connessi', 'medio'],
  ['02', 'A', 'Silvicoltura ed utilizzo di aree forestali', 'medio'],
  ['03', 'A', 'Pesca e acquacoltura', 'medio'],
  ['05', 'B', 'Estrazione di carbone (escluso torba)', 'alto'],
  ['06', 'B', 'Estrazione di petrolio greggio e di gas naturale', 'alto'],
  ['07', 'B', 'Estrazione di minerali metalliferi', 'alto'],
  ['08', 'B', 'Altre attività di estrazione di minerali da cave e miniere', 'alto'],
  ['09', 'B', 'Attività dei servizi di supporto all’estrazione', 'alto'],
  ['10', 'C', 'Industrie alimentari', 'alto'],
  ['11', 'C', 'Industria delle bevande', 'alto'],
  ['12', 'C', 'Industria del tabacco', 'alto'],
  ['13', 'C', 'Industrie tessili', 'alto'],
  ['14', 'C', 'Confezione di articoli di abbigliamento, in pelle e pelliccia', 'alto'],
  ['15', 'C', 'Fabbricazione di articoli in pelle e simili', 'alto'],
  ['16', 'C', 'Industria del legno e dei prodotti in legno e sughero, esclusi i mobili', 'alto'],
  ['17', 'C', 'Fabbricazione di carta e di prodotti di carta', 'alto'],
  ['18', 'C', 'Stampa e riproduzione di supporti registrati', 'alto'],
  ['19', 'C', 'Fabbricazione di coke e prodotti derivanti dalla raffinazione del petrolio', 'alto'],
  ['20', 'C', 'Fabbricazione di prodotti chimici', 'alto'],
  ['21', 'C', 'Fabbricazione di prodotti farmaceutici di base e di preparati farmaceutici', 'alto'],
  ['22', 'C', 'Fabbricazione di articoli in gomma e materie plastiche', 'alto'],
  ['23', 'C', 'Fabbricazione di altri prodotti della lavorazione di minerali non metalliferi', 'alto'],
  ['24', 'C', 'Metallurgia', 'alto'],
  ['25', 'C', 'Fabbricazione di prodotti in metallo, esclusi macchinari e attrezzature', 'alto'],
  ['26', 'C', 'Fabbricazione di computer, prodotti di elettronica e ottica, apparecchi elettromedicali e di misurazione', 'alto'],
  ['27', 'C', 'Fabbricazione di apparecchiature elettriche e per uso domestico non elettriche', 'alto'],
  ['28', 'C', 'Fabbricazione di macchinari ed apparecchiature n.c.a.', 'alto'],
  ['29', 'C', 'Fabbricazione di autoveicoli, rimorchi e semirimorchi', 'alto'],
  ['30', 'C', 'Fabbricazione di altri mezzi di trasporto', 'alto'],
  ['31', 'C', 'Fabbricazione di mobili', 'alto'],
  ['32', 'C', 'Altre industrie manifatturiere', 'alto'],
  ['33', 'C', 'Riparazione, manutenzione ed installazione di macchine ed apparecchiature', 'alto'],
  ['35', 'D', 'Fornitura di energia elettrica, gas, vapore e aria condizionata', 'alto'],
  ['36', 'E', 'Raccolta, trattamento e fornitura di acqua', 'alto'],
  ['37', 'E', 'Gestione delle reti fognarie', 'alto'],
  ['38', 'E', 'Raccolta, trattamento e smaltimento dei rifiuti; recupero dei materiali', 'alto'],
  ['39', 'E', 'Attività di risanamento e altri servizi di gestione dei rifiuti', 'alto'],
  ['41', 'F', 'Costruzione di edifici', 'alto'],
  ['42', 'F', 'Ingegneria civile', 'alto'],
  ['43', 'F', 'Lavori di costruzione specializzati', 'alto'],
  ['45', 'G', 'Commercio all’ingrosso e al dettaglio e riparazione di autoveicoli e motocicli', 'basso'],
  ['46', 'G', 'Commercio all’ingrosso, escluso quello di autoveicoli e di motocicli', 'basso'],
  ['47', 'G', 'Commercio al dettaglio, escluso quello di autoveicoli e di motocicli', 'basso'],
  ['49', 'H', 'Trasporto terrestre e trasporto mediante condotte', 'medio'],
  ['50', 'H', 'Trasporto marittimo e per vie d’acqua', 'medio'],
  ['51', 'H', 'Trasporto aereo', 'medio'],
  ['52', 'H', 'Magazzinaggio e attività di supporto ai trasporti', 'medio'],
  ['53', 'H', 'Servizi postali e attività di corriere', 'medio'],
  ['55', 'I', 'Alloggio', 'basso'],
  ['56', 'I', 'Attività dei servizi di ristorazione', 'basso'],
  ['58', 'J', 'Attività editoriali', 'basso'],
  ['59', 'J', 'Produzione cinematografica, di video, di programmi televisivi e di registrazioni musicali', 'basso'],
  ['60', 'J', 'Attività di programmazione e trasmissione', 'basso'],
  ['61', 'J', 'Telecomunicazioni', 'basso'],
  ['62', 'J', 'Produzione di software, consulenza informatica e attività connesse', 'basso'],
  ['63', 'J', 'Attività dei servizi d’informazione e altri servizi informatici', 'basso'],
  ['64', 'K', 'Attività di servizi finanziari (escluse assicurazioni e fondi pensione)', 'basso'],
  ['65', 'K', 'Assicurazioni, riassicurazioni e fondi pensione, escluse le assicurazioni sociali obbligatorie', 'basso'],
  ['66', 'K', 'Attività ausiliarie dei servizi finanziari e delle attività assicurative', 'basso'],
  ['68', 'L', 'Attività immobiliari', 'basso'],
  ['69', 'M', 'Attività legali e contabilità', 'basso'],
  ['70', 'M', 'Attività di direzione aziendale e di consulenza gestionale', 'basso'],
  ['71', 'M', 'Studi di architettura e di ingegneria; collaudi ed analisi tecniche', 'basso'],
  ['72', 'M', 'Ricerca e sviluppo', 'basso'],
  ['73', 'M', 'Pubblicità e ricerche di mercato', 'basso'],
  ['74', 'M', 'Altre attività professionali, scientifiche e tecniche', 'basso'],
  ['75', 'M', 'Servizi veterinari', 'basso'],
  ['77', 'N', 'Attività di noleggio e leasing operativo', 'basso'],
  ['78', 'N', 'Attività di ricerca, selezione e fornitura di personale', 'basso'],
  ['79', 'N', 'Agenzie di viaggio, tour operator e servizi di prenotazione', 'basso'],
  ['80', 'N', 'Servizi di vigilanza e investigazione', 'basso'],
  ['81', 'N', 'Attività di servizi per edifici e paesaggio', 'basso'],
  ['82', 'N', 'Supporto per le funzioni d’ufficio e altri servizi di supporto alle imprese', 'basso'],
  ['84', 'O', 'Amministrazione pubblica e difesa; assicurazione sociale obbligatoria', 'medio'],
  ['85', 'P', 'Istruzione', 'medio'],
  ['86', 'Q', 'Assistenza sanitaria', 'alto'],
  ['87', 'Q', 'Servizi di assistenza sociale residenziale', 'alto'],
  ['88', 'Q', 'Assistenza sociale non residenziale', 'medio'],
  ['90', 'R', 'Attività creative, artistiche e di intrattenimento', 'basso'],
  ['91', 'R', 'Biblioteche, archivi, musei e altre attività culturali', 'basso'],
  ['92', 'R', 'Attività riguardanti lotterie, scommesse e case da gioco', 'basso'],
  ['93', 'R', 'Attività sportive, di intrattenimento e di divertimento', 'basso'],
  ['94', 'S', 'Attività di organizzazioni associative', 'basso'],
  ['95', 'S', 'Riparazione di computer e di beni per uso personale e per la casa', 'basso'],
  ['96', 'S', 'Altre attività di servizi per la persona', 'basso'],
  ['97', 'T', 'Famiglie e convivenze come datori di lavoro per personale domestico', 'basso'],
  ['98', 'T', 'Produzione di beni e servizi indifferenziati per uso proprio da parte di famiglie e convivenze', 'basso'],
  ['99', 'U', 'Organizzazioni ed organismi extraterritoriali', 'basso'],
];

export const sezioni = {
  A: 'Agricoltura, silvicoltura e pesca',
  B: 'Estrazione di minerali da cave e miniere',
  C: 'Attività manifatturiere',
  D: 'Fornitura di energia elettrica, gas, vapore e aria condizionata',
  E: 'Fornitura di acqua; reti fognarie e gestione dei rifiuti',
  F: 'Costruzioni',
  G: 'Commercio all’ingrosso e al dettaglio; riparazione di autoveicoli e motocicli',
  H: 'Trasporto e magazzinaggio',
  I: 'Servizi di alloggio e di ristorazione',
  J: 'Servizi di informazione e comunicazione',
  K: 'Attività finanziarie e assicurative',
  L: 'Attività immobiliari',
  M: 'Attività professionali, scientifiche e tecniche',
  N: 'Noleggio, agenzie di viaggio, servizi di supporto alle imprese',
  O: 'Amministrazione pubblica e difesa; assicurazione sociale obbligatoria',
  P: 'Istruzione',
  Q: 'Sanità e assistenza sociale',
  R: 'Attività artistiche, sportive, di intrattenimento e divertimento',
  S: 'Altre attività di servizi',
  T: 'Attività di famiglie e convivenze come datori di lavoro',
  U: 'Organizzazioni ed organismi extraterritoriali',
};

/** Cerca per codice ("43", "43.22", "43.22.01") o per parole del settore. */
export function cercaAteco(testo) {
  const q = String(testo || '').trim().toLowerCase();
  if (!q) return [];
  const cifre = q.replace(/[^\d]/g, '');
  if (cifre.length >= 2) {
    const due = cifre.slice(0, 2);
    return divisioni.filter((d) => d[0] === due);
  }
  if (/^[a-u]$/.test(q)) return divisioni.filter((d) => d[1].toLowerCase() === q);
  const parole = q.split(/\s+/).filter((p) => p.length > 2);
  if (!parole.length) return [];
  return divisioni
    .filter((d) => parole.every((p) => (d[2] + ' ' + sezioni[d[1]]).toLowerCase().includes(p)))
    .slice(0, 12);
}

export const noteAteco = [
  'La divisione 30 (fabbricazione di altri mezzi di trasporto) non compare nell’elenco dell’Allegato IV, ma rientra nelle attività manifatturiere della sezione C, classificate a rischio alto.',
  'Nella sezione Q l’Allegato IV indica a rischio medio la sola assistenza sociale non residenziale (88): il resto della sanità e dell’assistenza sociale resta a rischio alto.',
  'Il codice ATECO dà il livello di partenza. La durata definitiva dipende dalla valutazione dei rischi dell’azienda e le ore dell’Accordo sono minime: se i rischi effettivi sono maggiori, le ore aumentano.',
];
