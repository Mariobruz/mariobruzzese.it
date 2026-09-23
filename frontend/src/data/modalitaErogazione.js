/**
 * modalitaErogazione.js — prospetto delle modalità di erogazione ammesse.
 *
 * Fonte: "Vademecum operativo per la richiesta e la gestione dei corsi"
 * di EFEI Aula Magna. Riportato senza la colonna dei tempi di richiesta
 * per Regioni, che riguarda solo la rendicontazione dell'ente.
 */

export const colonneModalita = [
  { id: 'corso', testo: 'Corso di formazione' },
  { id: 'presenza', testo: 'Presenza fisica', breve: 'In aula' },
  { id: 'videoconferenza', testo: 'Videoconferenza sincrona', breve: 'Videoconferenza' },
  { id: 'elearning', testo: 'E-learning', breve: 'E-learning' },
  { id: 'aula', testo: 'Max partecipanti in aula', breve: 'Max in aula' },
  { id: 'rapporto', testo: 'Rapporto docente/discente (parte pratica)', breve: 'Rapporto parte pratica' },
  { id: 'verifica', testo: 'Colloquio* o test', breve: 'Verifica finale' },
];

const r = (corso, videoconferenza, elearning, aula, rapporto, verifica) =>
  ({ corso, presenza: 'Consentita', videoconferenza, elearning, aula, rapporto, verifica });

const SI = 'Consentita';
const NO = 'Non consentita';
const TEORICO = 'Solo modulo teorico';
const NP = 'Non prevista';
const PRATICHE = 'Test* intermedio e prove pratiche';
const HACCP_AULA = 'Consentita solo nelle Regioni Lombardia, Lazio, Veneto, Basilicata e Provincia di Bolzano';

export const righeModalita = [
  r('Lavoratori: formazione generale', SI, SI, 30, NP, 'Colloquio o test (30 domande)'),
  r('Formazione specifica — rischio basso, medio, alto', SI, 'Solo per rischio basso', 30, NP, 'Colloquio o test (30 domande)'),
  r('Aggiornamento formazione lavoratori — basso, medio, alto', SI, SI, 30, NP, 'Colloquio o test (10 domande)'),
  r('Preposti', SI, NO, 30, NP, 'Colloquio o test (30 domande)'),
  r('Aggiornamento preposti', SI, NO, 30, NP, 'Colloquio o test (10 domande)'),
  r('Dirigenti', SI, SI, 30, NP, 'Colloquio o test (30 domande)'),
  r('Aggiornamento dirigenti', SI, SI, 30, NP, 'Colloquio o test (10 domande)'),
  r('Datore di lavoro', SI, SI, 30, NP, 'Colloquio o test (30 domande)'),
  r('Aggiornamento datore di lavoro', SI, SI, 30, NP, 'Colloquio o test (10 domande)'),
  r('RSPP datore di lavoro', SI, NO, 30, NP, 'Colloquio o test (30 domande)'),
  r('Aggiornamento RSPP datore di lavoro', SI, SI, 30, NP, 'Colloquio o test (10 domande)'),
  r('RSPP / ASPP', SI, 'Consentita solo per il modulo A', 30, NP, 'Colloquio o test (30 domande)'),
  r('Aggiornamento RSPP / ASPP', SI, SI, 30, NP, 'Colloquio o test (10 domande)'),
  r('RLS', SI, 'Consentita solo se prevista dal CCNL', 30, NP, 'Colloquio o test*'),
  r('Aggiornamento RLS', SI, 'Consentita solo se prevista dal CCNL', 30, NP, 'Colloquio o test*'),
  r('Coordinatore per la sicurezza', SI, 'Consentita solo per il modulo giuridico', 30, NP, 'Test* e simulazione'),
  r('Aggiornamento coordinatore per la sicurezza', SI, 'Consentita solo per il modulo giuridico', 30, NP, 'Test* e simulazione'),
  r('Ambienti sospetti di inquinamento o confinati (lavoratori, datori di lavoro e lavoratori autonomi)', NO, NO, 30, '1/6', 'Test* e prove pratiche'),
  r('Aggiornamento ambienti sospetti di inquinamento o confinati', NO, NO, 30, '1/6', 'Test* e prove pratiche'),
  r('Operatori addetti alla conduzione di attrezzature (art. 73 c. 5 D.Lgs. 81/08 e ASR 2025)', NO, NO, 30, '1/6', PRATICHE),
  r('Aggiornamento operatori addetti alla conduzione di attrezzature (ASR 2025)', NO, NO, 30, '1/6', PRATICHE),
  r('Addetti antincendio — livello 1, 2, 3 (art. 46 D.Lgs. 81/08 e D.M. 02.09.2021)', TEORICO, NO, 30, '1/10', 'Test intermedio e prove pratiche'),
  r('Aggiornamento addetti antincendio — livello 1, 2, 3', TEORICO, NO, 30, '1/10', 'Test intermedio e prove pratiche'),
  r('Addetti al primo soccorso — aziende gruppo A, B e C', NO, NO, 30, NP, 'Test'),
  r('Aggiornamento addetti al primo soccorso — gruppo A, B e C', NO, NO, 30, NP, 'Test'),
  r('Preposti al montaggio, smontaggio e trasformazione di ponteggi (art. 136 c. 8 D.Lgs. 81/08)', TEORICO, NO, 30, '1/5', 'Test intermedio e prove pratiche'),
  r('Aggiornamento preposti ponteggi', TEORICO, NO, 30, '1/5', 'Test intermedio e prove pratiche'),
  r('Addetti ai sistemi di accesso e posizionamento mediante funi (art. 116 c. 4 D.Lgs. 81/08)', TEORICO, NO, 20, '1/4', 'Test intermedio e prove pratiche'),
  r('Aggiornamento addetti ai sistemi di accesso mediante funi', TEORICO, NO, 20, '1/4', 'Test intermedio e prove pratiche'),
  r('Operatori addetti ad attrezzature non previste dall’ASR 2025 (trabattelli, transpallet, motosega, tagliaerba ecc.)', TEORICO, NO, 30, '1/10', PRATICHE),
  r('Aggiornamento operatori addetti ad attrezzature non previste dall’ASR 2025', TEORICO, NO, 30, '1/10', PRATICHE),
  r('Addetti ai lavori in quota e corretto utilizzo dei DPI anticaduta', TEORICO, NO, 30, '1/6', 'Test intermedio e prove pratiche'),
  r('Aggiornamento addetti ai lavori in quota e DPI anticaduta', TEORICO, NO, 30, '1/6', 'Test intermedio e prove pratiche'),
  r('DPI di categoria I, II e III', TEORICO, NO, 30, '1/6', PRATICHE),
  r('Aggiornamento DPI di categoria I, II e III', TEORICO, NO, 30, '1/6', PRATICHE),
  r('Addetti alla segnaletica stradale (art. 161 c. 2-bis D.Lgs. 81/08 — D.I. 22 gennaio 2019)', TEORICO, NO, 30, '1/6', PRATICHE),
  r('Aggiornamento addetti alla segnaletica stradale', TEORICO, NO, 30, '1/6', PRATICHE),
  r('Lavori elettrici PAV, PES, PEI (artt. 82 e 83 D.Lgs. 81/08 — CEI 11-27, CEI 11-81, CEI EN 50110-1)', TEORICO, NO, 30, NP, 'Test*'),
  r('Aggiornamento lavori elettrici PAV, PES, PEI', TEORICO, NO, 30, NP, 'Test*'),
  { ...r('Addetti al settore alimentare — HACCP', NO, SI, 30, NP, 'Test*'), presenza: HACCP_AULA },
  { ...r('Aggiornamento addetti al settore alimentare — HACCP', NO, SI, 30, NP, 'Test*'), presenza: HACCP_AULA },
];

export const noteModalita = [
  'Colloquio*: in fase di rendicontazione la verifica erogata in questa modalità va autocertificata.',
  'Test*: può essere erogato un test con un minimo di 5 domande.',
];
