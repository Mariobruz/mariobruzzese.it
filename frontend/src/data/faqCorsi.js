/**
 * faqCorsi.js — domande frequenti di ogni scheda corso.
 *
 * Le risposte sono costruite dai dati che il sito già pubblica (catalogo,
 * prospetto modalità e scadenze dell'Accordo Stato-Regioni 2025, condizioni di
 * vendita): niente affermazioni nuove scritte a mano corso per corso.
 * Il file non importa nulla, così lo usano sia la pagina React sia prerender.js.
 */

// Validità dell'e-learning, dal prospetto "Modalità di erogazione" (Accordo Stato-Regioni 2025)
function rispostaOnline(c) {
  const id = c.id;
  if (c.categoria === 'rls' || id.includes('rls')) {
    return 'Sì, ma solo se il contratto collettivo (CCNL) applicato in azienda ammette la formazione RLS in e-learning: è il CCNL a stabilirlo (art. 37, comma 11, D.Lgs. 81/2008). Verificalo prima di iscriverti; se hai dubbi scrivici e controlliamo noi.';
  }
  if (id === 'coordinatore-modulo-giuridico-8h') {
    return 'Sì: il modulo giuridico è la parte del percorso per coordinatori della sicurezza (CSP/CSE) che può essere svolta in e-learning. I moduli tecnico, metodologico e pratico vanno svolti in aula o in videoconferenza sincrona.';
  }
  if (id === 'rspp-aspp-modulo-a-28h') {
    return 'Sì: per RSPP e ASPP l’Accordo Stato-Regioni 2025 consente l’e-learning per il modulo A. I moduli B e C vanno svolti in aula o in videoconferenza sincrona.';
  }
  if (id.startsWith('formazione-specifica-rischio-basso') || id.startsWith('formazione-generale-specifica-rischio-basso')) {
    return 'Sì, per i settori a rischio basso. La formazione specifica per rischio medio e alto non si può fare in e-learning: va svolta in aula o in videoconferenza sincrona.';
  }
  if (c.categoria === 'haccp') {
    return 'Sì, la formazione per gli addetti del settore alimentare può essere svolta in e-learning. Durata e rinnovo sono stabiliti dalla Regione in cui lavori: verifica le regole della tua Regione.';
  }
  if (c.categoria === 'formatori') {
    return 'Il corso è erogato in e-learning asincrono, con test finale e attestato di O.P.N. Italia Lavoro – CNL – EBAFoS. Per i requisiti per qualificarsi come formatore vale il Decreto interministeriale 6 marzo 2013.';
  }
  if (id.endsWith('-eng')) {
    return 'Sì: l’Accordo Stato-Regioni del 17 aprile 2025 consente l’e-learning per questo corso. La formazione deve essere comprensibile per chi la segue: la versione in inglese serve proprio ai lavoratori che non conoscono bene l’italiano.';
  }
  return 'Sì: l’Accordo Stato-Regioni del 17 aprile 2025 consente l’e-learning per questo corso. Il corso si chiude con un test finale e l’attestato ha lo stesso valore di quello in aula.';
}

/**
 * Domande e risposte per la scheda di un corso.
 * @param {object} c corso del catalogo (titolo, ore, prezzo, destinatari, normativa, categoria, id)
 * @param {object} [scadenza] { durata, validita } da scadenzeCorsi
 * @returns {{ d: string, r: string }[]}
 */
export function faqCorso(c, scadenza) {
  const lista = [
    {
      d: `A chi è rivolto il corso «${c.titolo}»?`,
      r: `${c.destinatari}. Riferimento normativo: ${c.normativa}.`,
    },
    {
      d: 'Il corso è valido se svolto online?',
      r: rispostaOnline(c),
    },
    {
      d: 'Quanto dura e come si svolge?',
      r: `Dura ${c.ore} ore in e-learning asincrono: lo segui quando vuoi, da computer, tablet o smartphone, anche in più sessioni. Alla fine c’è un test di verifica; superato il test, l’attestato si scarica dalla piattaforma.`,
    },
  ];
  if (scadenza && scadenza.validita) {
    lista.push({
      d: 'Quanto vale l’attestato e quando va aggiornato?',
      r: `${scadenza.validita}.`,
    });
  }
  lista.push(
    {
      d: 'Chi rilascia l’attestato?',
      r: 'Il soggetto formatore indicato sull’attestato è O.P.N. Italia Lavoro – CNL – EBAFoS; MB Consulting è soggetto attuatore in convenzione con O.P.N. Italia Lavoro (Convenzione n. CFAL.1866). L’attestato ha un QR code che permette di verificarne l’autenticità sul sito opnitalialavoro.it.',
    },
    {
      d: 'Quanto costa e come si paga?',
      r: `${c.prezzo} € a partecipante, tutto compreso: non ci sono spese di segreteria o di attivazione. Si paga online con carta di credito o debito tramite Stripe; puoi iscrivere più partecipanti nello stesso ordine e ricevi la fattura.`,
    },
    {
      d: 'Quando posso iniziare il corso?',
      r: 'Entro 24 ore lavorative dal pagamento iscriviamo i partecipanti sulla piattaforma e-learning: ciascuno riceve dalla piattaforma O.P.N. Italia Lavoro un’email con link di accesso, nome utente e password (può finire nello spam), completa i suoi dati e inizia il corso.',
    },
  );
  return lista;
}

/** Schema FAQPage per i dati strutturati della scheda. */
export function schemaFaq(faq) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((x) => ({
      '@type': 'Question',
      name: x.d,
      acceptedAnswer: { '@type': 'Answer', text: x.r },
    })),
  };
}
