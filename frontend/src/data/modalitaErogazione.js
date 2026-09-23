/**
 * modalitaErogazione.js — prospetto dei corsi: modalità ammesse, durata e scadenze.
 *
 * Modalità: "Vademecum operativo per la richiesta e la gestione dei corsi" di
 * EFEI Aula Magna (senza la colonna dei tempi di richiesta per Regioni, che
 * riguarda la rendicontazione dell'ente).
 * Durate e aggiornamenti: quadro sinottico dell'Accordo Stato-Regioni del
 * 17 aprile 2025. Per i corsi che l'Accordo non disciplina (antincendio,
 * primo soccorso, ponteggi, funi, segnaletica stradale, lavori elettrici,
 * HACCP) vale la norma indicata riga per riga.
 */

export const colonneModalita = [
  { id: 'corso', testo: 'Corso di formazione' },
  { id: 'durata', testo: 'Durata', breve: 'Durata' },
  { id: 'validita', testo: 'Validità e aggiornamento', breve: 'Aggiornamento' },
  { id: 'presenza', testo: 'Presenza fisica', breve: 'In aula' },
  { id: 'videoconferenza', testo: 'Videoconferenza sincrona', breve: 'Videoconferenza' },
  { id: 'elearning', testo: 'E-learning', breve: 'E-learning' },
  { id: 'aula', testo: 'Max partecipanti in aula', breve: 'Max in aula' },
  { id: 'rapporto', testo: 'Rapporto docente/discente (parte pratica)', breve: 'Rapporto parte pratica' },
  { id: 'verifica', testo: 'Colloquio* o test', breve: 'Verifica finale' },
];

const r = (corso, videoconferenza, elearning, aula, rapporto, verifica, durata, validita) =>
  ({ corso, presenza: 'Consentita', videoconferenza, elearning, aula, rapporto, verifica, durata, validita });

const SI = 'Consentita';
const NO = 'Non consentita';
const TEORICO = 'Solo modulo teorico';
const NP = 'Non prevista';
const PRATICHE = 'Test* intermedio e prove pratiche';
const HACCP_DURATA = 'Stabilita dalla Regione';
const HACCP_AGG = 'Stabilita dalla Regione';

export const righeModalita = [
  r('Lavoratori: formazione generale', SI, SI, 30, NP, 'Colloquio o test (30 domande)', '4 ore', 'Non scade: credito formativo permanente'),
  r('Formazione specifica — rischio basso, medio, alto', SI, 'Solo per rischio basso', 30, NP, 'Colloquio o test (30 domande)', '4 ore (basso), 8 (medio), 12 (alto)', 'Aggiornamento di 6 ore ogni 5 anni'),
  r('Aggiornamento formazione lavoratori — basso, medio, alto', SI, SI, 30, NP, 'Colloquio o test (10 domande)', '6 ore', 'Ogni 5 anni'),
  r('Preposti', SI, NO, 30, NP, 'Colloquio o test (30 domande)', '12 ore', 'Aggiornamento di 6 ore ogni 2 anni'),
  r('Aggiornamento preposti', SI, NO, 30, NP, 'Colloquio o test (10 domande)', '6 ore', 'Ogni 2 anni'),
  r('Dirigenti', SI, SI, 30, NP, 'Colloquio o test (30 domande)', '12 ore (+ 6 ore modulo cantieri)', 'Aggiornamento di 6 ore ogni 5 anni'),
  r('Aggiornamento dirigenti', SI, SI, 30, NP, 'Colloquio o test (10 domande)', '6 ore', 'Ogni 5 anni'),
  r('Datore di lavoro', SI, SI, 30, NP, 'Colloquio o test (30 domande)', '16 ore (+ 6 ore modulo cantieri)', 'Aggiornamento di 6 ore ogni 5 anni dalla data dell’attestato'),
  r('Aggiornamento datore di lavoro', SI, SI, 30, NP, 'Colloquio o test (10 domande)', '6 ore', 'Ogni 5 anni'),
  r('RSPP datore di lavoro', SI, NO, 30, NP, 'Colloquio o test (30 domande)', '8 ore (modulo comune) + modulo di settore: 16 agricoltura, 12 pesca, 16 costruzioni, 16 chimico', 'Aggiornamento di 8 ore ogni 5 anni'),
  r('Aggiornamento RSPP datore di lavoro', SI, SI, 30, NP, 'Colloquio o test (10 domande)', '8 ore', 'Ogni 5 anni'),
  r('RSPP / ASPP', SI, 'Consentita solo per il modulo A', 30, NP, 'Colloquio o test (30 domande)', 'Modulo A 28 ore, modulo B comune 48, moduli di settore 12–16, modulo C 24 (solo RSPP)', 'Aggiornamento di 40 ore (RSPP) o 20 ore (ASPP) ogni 5 anni'),
  r('Aggiornamento RSPP / ASPP', SI, SI, 30, NP, 'Colloquio o test (10 domande)', '40 ore (RSPP), 20 ore (ASPP)', 'Ogni 5 anni'),
  r('RLS', SI, 'Consentita solo se prevista dal CCNL', 30, NP, 'Colloquio o test*', '32 ore', 'Aggiornamento ogni anno: 4 ore fino a 50 lavoratori, 8 ore oltre (art. 37 D.Lgs. 81/08)'),
  r('Aggiornamento RLS', SI, 'Consentita solo se prevista dal CCNL', 30, NP, 'Colloquio o test*', '4 ore (fino a 50 lavoratori) o 8 ore (oltre 50)', 'Ogni anno'),
  r('Coordinatore per la sicurezza', SI, 'Consentita solo per il modulo giuridico', 30, NP, 'Test* e simulazione', '120 ore: 28 giuridico + 52 tecnico + 16 metodologico + 24 pratica', 'Aggiornamento di 40 ore ogni 5 anni'),
  r('Aggiornamento coordinatore per la sicurezza', SI, 'Consentita solo per il modulo giuridico', 30, NP, 'Test* e simulazione', '40 ore', 'Ogni 5 anni'),
  r('Ambienti sospetti di inquinamento o confinati (lavoratori, datori di lavoro e lavoratori autonomi)', NO, NO, 30, '1/6', 'Test* e prove pratiche', '12 ore: 4 giuridico + 8 pratica', 'Aggiornamento di 4 ore di pratica ogni 5 anni'),
  r('Aggiornamento ambienti sospetti di inquinamento o confinati', NO, NO, 30, '1/6', 'Test* e prove pratiche', '4 ore di pratica', 'Ogni 5 anni'),
  r('Operatori addetti alla conduzione di attrezzature (art. 73 c. 5 D.Lgs. 81/08 e ASR 2025)', NO, NO, 30, '1/6', PRATICHE, 'Da 8 a 16 ore secondo l’attrezzatura, teoria più pratica', 'Aggiornamento di 4 ore di pratica ogni 5 anni'),
  r('Aggiornamento operatori addetti alla conduzione di attrezzature (ASR 2025)', NO, NO, 30, '1/6', PRATICHE, '4 ore di pratica', 'Ogni 5 anni'),
  r('Addetti antincendio — livello 1, 2, 3 (art. 46 D.Lgs. 81/08 e D.M. 02.09.2021)', TEORICO, NO, 30, '1/10', 'Test intermedio e prove pratiche', '4 ore (livello 1), 8 (livello 2), 16 (livello 3)', 'Aggiornamento ogni 5 anni: 2, 5 o 8 ore secondo il livello (D.M. 02.09.2021)'),
  r('Aggiornamento addetti antincendio — livello 1, 2, 3', TEORICO, NO, 30, '1/10', 'Test intermedio e prove pratiche', '2 ore (livello 1), 5 (livello 2), 8 (livello 3)', 'Ogni 5 anni'),
  r('Addetti al primo soccorso — aziende gruppo A, B e C', NO, NO, 30, NP, 'Test', '16 ore (gruppo A), 12 ore (gruppi B e C)', 'Aggiornamento ogni 3 anni: 6 ore (gruppo A) o 4 ore (gruppi B e C) — D.M. 388/2003'),
  r('Aggiornamento addetti al primo soccorso — gruppo A, B e C', NO, NO, 30, NP, 'Test', '6 ore (gruppo A), 4 ore (gruppi B e C)', 'Ogni 3 anni'),
  r('Preposti al montaggio, smontaggio e trasformazione di ponteggi (art. 136 c. 8 D.Lgs. 81/08)', TEORICO, NO, 30, '1/5', 'Test intermedio e prove pratiche', '28 ore', 'Aggiornamento di 4 ore ogni 4 anni (Allegato XXI)'),
  r('Aggiornamento preposti ponteggi', TEORICO, NO, 30, '1/5', 'Test intermedio e prove pratiche', '4 ore', 'Ogni 4 anni'),
  r('Addetti ai sistemi di accesso e posizionamento mediante funi (art. 116 c. 4 D.Lgs. 81/08)', TEORICO, NO, 20, '1/4', 'Test intermedio e prove pratiche', 'Modulo base 32 ore + modulo specifico 32 ore (52 insieme); 8 ore in più per i preposti', 'Aggiornamento di 8 ore ogni 5 anni (Allegato XXI)'),
  r('Aggiornamento addetti ai sistemi di accesso mediante funi', TEORICO, NO, 20, '1/4', 'Test intermedio e prove pratiche', '8 ore', 'Ogni 5 anni'),
  r('Operatori addetti ad attrezzature non previste dall’ASR 2025 (trabattelli, transpallet, motosega, tagliaerba ecc.)', TEORICO, NO, 30, '1/10', PRATICHE, 'Stabilita dal datore di lavoro in base al manuale d’uso e alla valutazione dei rischi', 'Nessuna scadenza fissata: si ripete quando cambiano attrezzature o condizioni d’uso'),
  r('Aggiornamento operatori addetti ad attrezzature non previste dall’ASR 2025', TEORICO, NO, 30, '1/10', PRATICHE, 'Stabilita in base all’attrezzatura', 'Quando cambiano attrezzature o condizioni d’uso'),
  r('Addetti ai lavori in quota e corretto utilizzo dei DPI anticaduta', TEORICO, NO, 30, '1/6', 'Test intermedio e prove pratiche', 'Addestramento pratico in presenza, durata secondo il programma', 'Da ripetere ogni 5 anni (DPI di III categoria)'),
  r('Aggiornamento addetti ai lavori in quota e DPI anticaduta', TEORICO, NO, 30, '1/6', 'Test intermedio e prove pratiche', 'Addestramento pratico in presenza', 'Ogni 5 anni'),
  r('DPI di categoria I, II e III', TEORICO, NO, 30, '1/6', PRATICHE, 'Addestramento pratico in presenza per i DPI di III categoria', 'Da ripetere ogni 5 anni'),
  r('Aggiornamento DPI di categoria I, II e III', TEORICO, NO, 30, '1/6', PRATICHE, 'Addestramento pratico in presenza', 'Ogni 5 anni'),
  r('Addetti alla segnaletica stradale (art. 161 c. 2-bis D.Lgs. 81/08 — D.I. 22 gennaio 2019)', TEORICO, NO, 30, '1/6', PRATICHE, '8 ore (lavoratori), 12 ore (preposti)', 'Aggiornamento di 6 ore ogni 5 anni (D.I. 22 gennaio 2019)'),
  r('Aggiornamento addetti alla segnaletica stradale', TEORICO, NO, 30, '1/6', PRATICHE, '6 ore', 'Ogni 5 anni'),
  r('Lavori elettrici PAV, PES, PEI (artt. 82 e 83 D.Lgs. 81/08 — CEI 11-27, CEI 11-81, CEI EN 50110-1)', TEORICO, NO, 30, NP, 'Test*', 'Secondo la norma CEI 11-27 e il livello (PES, PAV, PEI)', 'Riaddestramento periodico previsto dalla CEI 11-27: di prassi ogni 5 anni'),
  r('Aggiornamento lavori elettrici PAV, PES, PEI', TEORICO, NO, 30, NP, 'Test*', 'Secondo la norma CEI 11-27', 'Di prassi ogni 5 anni'),
  r('Addetti al settore alimentare — HACCP', NO, SI, 30, NP, 'Test*', HACCP_DURATA, HACCP_AGG),
  r('Aggiornamento addetti al settore alimentare — HACCP', NO, SI, 30, NP, 'Test*', HACCP_DURATA, HACCP_AGG),
];

export const noteModalita = [
  'Colloquio*: in fase di rendicontazione la verifica erogata in questa modalità va autocertificata.',
  'Test*: può essere erogato un test con un minimo di 5 domande.',
  'Durate e scadenze: quadro sinottico dell’Accordo Stato-Regioni del 17 aprile 2025. Per antincendio, primo soccorso, ponteggi, funi, segnaletica stradale, lavori elettrici e HACCP valgono le norme indicate nelle righe corrispondenti.',
];

/**
 * Durata e scadenza per i corsi che vendiamo, indicizzati per id di catalogo.
 * Stessi riferimenti del prospetto qui sopra.
 */
export const scadenzeCorsi = {
  'formazione-generale-lavoratori-4h': { durata: '4 ore', validita: 'Non scade: è un credito formativo permanente' },
  'formazione-generale-lavoratori-4h-eng': { durata: '4 ore', validita: 'Non scade: è un credito formativo permanente' },
  'formazione-specifica-rischio-basso-4h': { durata: '4 ore', validita: 'Vale 5 anni, poi aggiornamento di 6 ore' },
  'formazione-generale-specifica-rischio-basso-8h': { durata: '8 ore (4 generale + 4 specifica)', validita: 'Vale 5 anni, poi aggiornamento di 6 ore' },
  'aggiornamento-lavoratori-tutti-rischi-6h': { durata: '6 ore', validita: 'Vale 5 anni, poi va rifatto' },
  'aggiornamento-lavoratori-rischio-medio-6h': { durata: '6 ore', validita: 'Vale 5 anni, poi va rifatto' },
  'datore-di-lavoro-16h': { durata: '16 ore', validita: 'Vale 5 anni, poi aggiornamento di 6 ore' },
  'rspp-datore-lavoro-8h': { durata: '8 ore (moduli I e II)', validita: 'Vale 5 anni, poi aggiornamento di 8 ore' },
  'aggiornamento-rspp-datore-lavoro-8h': { durata: '8 ore', validita: 'Vale 5 anni, poi va rifatto' },
  'modulo-cantieri-datore-6h': { durata: '6 ore', validita: 'Modulo aggiuntivo: segue la scadenza del corso base' },
  'dirigenti-12h': { durata: '12 ore', validita: 'Vale 5 anni, poi aggiornamento di 6 ore' },
  'aggiornamento-dirigenti-6h': { durata: '6 ore', validita: 'Vale 5 anni, poi va rifatto' },
  'modulo-cantieri-dirigenti-6h': { durata: '6 ore', validita: 'Modulo aggiuntivo: segue la scadenza del corso base' },
  'rspp-aspp-modulo-a-28h': { durata: '28 ore', validita: 'Credito permanente: chi ricopre il ruolo si aggiorna ogni 5 anni (40 ore RSPP, 20 ore ASPP)' },
  'aggiornamento-rspp-40h': { durata: '40 ore', validita: 'Copre il quinquennio in corso' },
  'aggiornamento-aspp-20h': { durata: '20 ore', validita: 'Copre il quinquennio in corso' },
  'rls-32h': { durata: '32 ore', validita: 'Aggiornamento ogni anno: 4 ore fino a 50 lavoratori, 8 ore oltre' },
  'aggiornamento-rls-fino-50-4h': { durata: '4 ore', validita: 'Da rifare ogni anno' },
  'aggiornamento-rls-oltre-50-8h': { durata: '8 ore', validita: 'Da rifare ogni anno' },
  'coordinatore-modulo-giuridico-8h': { durata: '8 ore', validita: 'Modulo del percorso per coordinatori: il ruolo si aggiorna con 40 ore ogni 5 anni' },
  'aggiornamento-csp-cse-40h': { durata: '40 ore', validita: 'Copre il quinquennio in corso' },
  'formatori-40h': { durata: '40 ore', validita: 'Aggiornamento di 24 ore ogni 3 anni (D.I. 6 marzo 2013)' },
  'formatori-24h': { durata: '24 ore', validita: 'Aggiornamento di 24 ore ogni 3 anni (D.I. 6 marzo 2013)' },
  'aggiornamento-formatori-24h': { durata: '24 ore', validita: 'Copre il triennio in corso' },
  'responsabile-industria-alimentare': { durata: '12 ore', validita: 'Scadenza stabilita dalla Regione' },
  'osa-rischio-elevato-8h': { durata: '8 ore', validita: 'Scadenza stabilita dalla Regione' },
  'osa-rischio-medio-6h': { durata: '6 ore', validita: 'Scadenza stabilita dalla Regione' },
  'aggiornamento-osa-4h': { durata: '4 ore', validita: 'Scadenza stabilita dalla Regione' },
};
