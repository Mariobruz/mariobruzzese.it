/**
 * pages.js — sorgente unica dei metadati SEO del sito.
 * Usato sia dal prerender (scripts/prerender.js) sia, volendo, dai componenti React.
 * Ogni voce genera in build/: <slug>.html e <slug>/index.html (HTTP 200 su GitHub Pages).
 */
const SITE = 'MB Consulting';
const BASE = 'https://www.mariobruzzese.it';
const OG_IMG = `${BASE}/og-image.png`;

const organization = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'MB Consulting — Mario Bruzzese',
  url: BASE,
  logo: `${BASE}/logo.png`,
  description:
    "Consulenza specializzata nell'accesso ai fondi interprofessionali per la formazione aziendale finanziata al 100%.",
  email: 'info@mariobruzzese.it',
  areaServed: { '@type': 'Country', name: 'Italy' },
  serviceType: 'Consulenza Fondi Interprofessionali',
  knowsAbout: [
    'Fondi Interprofessionali',
    'Formazione Finanziata',
    'Fondimpresa',
    'Fondo For.Te.',
    'Piano Formativo Aziendale',
    'Conto Formazione',
    '0.30% INPS',
  ],
  sameAs: ['https://www.linkedin.com/in/mario-bruzzese-301360181/'],
};

function breadcrumb(name, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name, item: url },
    ],
  };
}

const pages = [
  {
    slug: '',
    title: 'Fondi Interprofessionali | Consulenza Formazione Finanziata — MB Consulting',
    description:
      'Accedi ai fondi interprofessionali e finanzia la formazione aziendale al 100%. MB Consulting gestisce tutto: adesione, piano formativo e rendicontazione. Contattaci.',
    priority: '1.0',
    changefreq: 'weekly',
    schema: [
      organization,
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Fondi Interprofessionali | MB Consulting',
        url: `${BASE}/`,
        description:
          'Consulenza fondi interprofessionali per la formazione aziendale finanziata al 100%.',
      },
    ],
    noscript: `
      <h1>Fondi Interprofessionali: Formazione Aziendale Finanziata al 100% — MB Consulting</h1>
      <p>MB Consulting è specializzata nella consulenza per l'accesso ai fondi interprofessionali, permettendo alle aziende italiane di finanziare completamente la formazione dei propri dipendenti senza costi aggiuntivi. Gestiamo tutto il processo: dall'adesione al fondo interprofessionale più adatto, alla progettazione del piano formativo, fino alla rendicontazione finale.</p>
      <h2>Cosa sono i Fondi Interprofessionali?</h2>
      <p>I fondi interprofessionali sono organismi paritetici che raccolgono lo 0,30% dei contributi INPS versati dalle aziende e li mettono a disposizione per finanziare piani formativi. L'adesione è gratuita e volontaria. Tra i principali fondi: Fondimpresa, Fondo For.Te., Fondirigenti, Fon.Coop, FAPI.</p>
      <h2>I nostri Servizi</h2>
      <ul>
        <li><strong>Consulenza Fondi Interprofessionali</strong> — Analisi delle opportunità e scelta del fondo più adatto alla tua azienda.</li>
        <li><strong>Analisi Fabbisogni Formativi</strong> — Individuazione delle esigenze formative aziendali, anche quelle non esplicite.</li>
        <li><strong>Progettazione Piani Formativi</strong> — Costruzione del piano formativo completo e conforme ai requisiti del fondo.</li>
        <li><strong>Coordinamento Completo</strong> — Gestione di azienda, ente formativo e docenti senza impatto organizzativo per te.</li>
        <li><strong>Erogazione Formazione</strong> — Supervisione delle attività formative con garanzia di qualità didattica.</li>
        <li><strong>Gestione Amministrativa e Rendicontazione</strong> — Documentazione completa per evitare problemi in fase di controllo e ispezione.</li>
      </ul>
      <h2>Come funzionano i Fondi Interprofessionali?</h2>
      <p>Ogni azienda versa mensilmente all'INPS lo 0,30% dei contributi per i propri dipendenti. Aderendo a un fondo interprofessionale, queste risorse vengono accantonate e rese disponibili per finanziare la formazione aziendale tramite Conto Formazione (risorse accumulate dalla singola azienda) oppure tramite Avvisi e bandi collettivi, ideali per le PMI.</p>
      <p>Approfondisci: <a href="/servizi">i servizi e come lavoriamo</a>, <a href="/professionisti">la formula per i professionisti</a>, <a href="/faq">le domande frequenti</a>.</p>
      <p>Contattaci per una consulenza gratuita: <a href="mailto:info@mariobruzzese.it">info@mariobruzzese.it</a></p>
    `,
  },
  {
    slug: 'corsi-sicurezza',
    title: `Corsi Sicurezza sul Lavoro Online – Accordo Stato-Regioni 2025 | ${SITE}`,
    description:
      "Corsi di sicurezza sul lavoro online, Accordo Stato-Regioni 2025: lavoratori, datore di lavoro, RSPP, RLS, formatori, HACCP. Attestato con QR code, da 40 €.",
    priority: '0.9',
    changefreq: 'weekly',
    // l'elenco dei corsi (ItemList) lo genera scripts/prerender.js dal catalogo
    schema: [breadcrumb('Corsi sicurezza', `${BASE}/corsi-sicurezza`)],
    noscript: `
      <h1>Corsi di sicurezza sul lavoro online — e-learning D.Lgs 81/08</h1>
      <p>MB Consulting vende corsi di sicurezza sul lavoro in modalità e-learning asincrona, in convenzione con O.P.N. Italia Lavoro (soggetto formatore: O.P.N. Italia Lavoro – CNL – EBAFoS). Si seguono da computer, tablet o telefono negli orari che preferisci; superato il test finale si riceve l'attestato, verificabile tramite QR code sul sito opnitalialavoro.it.</p>
      <p>I percorsi sono conformi al D.Lgs. 9 aprile 2008 n. 81 e all'Accordo Stato-Regioni del 17 aprile 2025 (rep. atti n. 59/CSR), pubblicato in Gazzetta Ufficiale n. 119 del 24 maggio 2025. Dal 24 maggio 2026, concluso il periodo transitorio di dodici mesi, l'Accordo disciplina in via esclusiva durata e contenuti minimi della formazione in materia di salute e sicurezza sul lavoro.</p>
      <h2>Come funziona l'iscrizione</h2>
      <p>Scegli il corso e il numero di partecipanti, inserisci i dati di fatturazione (privato o azienda) e, per ogni partecipante, nome, cognome, codice fiscale ed email; paghi online. Entro 24 ore lavorative iscriviamo i partecipanti sulla piattaforma: ciascuno riceve dalla piattaforma O.P.N. Italia Lavoro un'email con link di accesso, nome utente e password (pu\u00f2 finire nello spam). Al primo accesso completa i suoi dati e inizia il corso. Superato il test finale riceve l'attestato, verificabile tramite QR code.</p>
    `,
  },
  {
    slug: 'servizi',
    title: `Consulenza Fondi Interprofessionali per Aziende | ${SITE}`,
    description:
      'Scopri i servizi di MB Consulting per i fondi interprofessionali: scelta del fondo, progettazione del piano formativo, rendicontazione e gestione completa.',
    priority: '0.9',
    changefreq: 'monthly',
    schema: [breadcrumb('Servizi', `${BASE}/servizi`)],
    noscript: `
      <h1>Formazione finanziata, dalla verifica al piano</h1>
      <p>MB Consulting affianca la tua azienda nella scelta dei fondi interprofessionali, nella progettazione e nella gestione della formazione, dall'analisi iniziale alla rendicontazione finale.</p>
      <h2>Come possiamo aiutarti</h2>
      <ul>
        <li><strong>Fondi interprofessionali</strong> — Verifichiamo il fondo a cui aderisce la tua azienda e valutiamo gli strumenti disponibili per finanziare la formazione.</li>
        <li><strong>Analisi dei fabbisogni</strong> — Individuiamo con te le competenze da sviluppare, le persone da coinvolgere e le priorità aziendali.</li>
        <li><strong>Progettazione del piano</strong> — Definiamo obiettivi, contenuti, durata e modalità dei corsi in base alle esigenze dell'azienda e ai requisiti dello strumento scelto.</li>
        <li><strong>Organizzazione ed erogazione dei corsi</strong> — Concordiamo il calendario, coordiniamo docenti e partecipanti e seguiamo lo svolgimento delle attività formative.</li>
        <li><strong>Gestione amministrativa</strong> — Predisponiamo la documentazione richiesta e seguiamo le pratiche del piano.</li>
        <li><strong>Rendicontazione</strong> — Raccogliamo i registri e i documenti previsti e curiamo la rendicontazione finale secondo le procedure del fondo.</li>
      </ul>
      <h2>Come lavoriamo insieme</h2>
      <p>1. Verifica iniziale. 2. Piano formativo. 3. Erogazione e chiusura.</p>
      <p>Vai al <a href="/formazione-finanziata">catalogo della formazione finanziata</a>, ai <a href="/corsi-sicurezza">corsi di sicurezza</a> o alla <a href="/professionisti">formula per i professionisti</a>.</p>
    `,
  },
  {
    slug: 'perche-noi',
    title: `Perché Scegliere MB Consulting per i Fondi Interprofessionali | ${SITE}`,
    description:
      "Esperienza, risultati concreti e zero burocrazia: MB Consulting accompagna le aziende nell'accesso ai fondi interprofessionali dalla A alla Z. Scopri perché.",
    priority: '0.8',
    changefreq: 'monthly',
    schema: [breadcrumb('Perché noi', `${BASE}/perche-noi`)],
    noscript: `
      <h1>Perché Scegliere MB Consulting</h1>
      <ul>
        <li><strong>Zero Impatto Economico</strong> — La formazione è finanziata dai fondi interprofessionali: nessun costo diretto per l'azienda.</li>
        <li><strong>Gestione Chiavi in Mano</strong> — Dall'analisi alla rendicontazione ci occupiamo noi di tutto.</li>
        <li><strong>Esperienza Nazionale</strong> — Migliaia di ore di formazione erogate e centinaia di aziende servite in tutta Italia.</li>
        <li><strong>Rete Consolidata</strong> — Collaborazioni con enti di formazione accreditati e docenti qualificati.</li>
        <li><strong>Conformità Garantita</strong> — Documentazione curata per superare senza problemi controlli e ispezioni.</li>
        <li><strong>Approccio Personalizzato</strong> — Ogni progetto nasce dalle reali esigenze dell'azienda, non da modelli standard.</li>
      </ul>
    `,
  },
  {
    slug: 'professionisti',
    title: `Per i professionisti | La formula win-win della formazione finanziata | ${SITE}`,
    description:
      'Scopri come integrare la formazione finanziata nei tuoi progetti e rendere più competitivi i preventivi per ISO, sicurezza, Modello 231, siti web e altri servizi.',
    priority: '0.8',
    changefreq: 'monthly',
    schema: [breadcrumb('Per i professionisti', `${BASE}/professionisti`)],
    noscript: `
      <p>La formula win-win</p>
      <h1>Più clienti, senza regalare la formazione</h1>
      <p>Per professionisti, studi e agenzie che vendono servizi alle aziende: se il fondo copre la formazione del personale, l'azienda ottiene lo stesso servizio e spende meno per il progetto complessivo, mentre il professionista mantiene il proprio compenso. MB Consulting verifica se la formazione è finanziabile, gestisce il piano ed eroga la formazione.</p>
      <h2>ISO 9001: un esempio di preventivo</h2>
      <p>Consulenza ISO e certificazione 4.000 €; formazione del personale 2.000 €. Totale a carico dell'azienda: 6.000 € senza contributo, 4.000 € con copertura integrale della formazione. Esempio illustrativo: la copertura dipende dallo strumento disponibile, dall'ammissibilità delle attività e dall'approvazione del piano formativo.</p>
      <h2>La stessa formula, altri progetti</h2>
      <ul>
        <li>Sicurezza sul lavoro: DVR e procedure, con la formazione dei lavoratori quando ammessa dal fondo.</li>
        <li>Modello 231: protocolli e formazione dei dipendenti sulle procedure.</li>
        <li>Siti web ed e-commerce: il sito e la formazione del team che gestirà catalogo e ordini.</li>
        <li>Marketing e comunicazione: la strategia e la formazione di chi gestirà contenuti e contatti.</li>
        <li>Software gestionali e CRM: la configurazione e la formazione degli utenti.</li>
        <li>Privacy e protezione dei dati: le procedure e la formazione del personale.</li>
        <li>HACCP e sicurezza alimentare: il piano di autocontrollo e la formazione degli addetti.</li>
      </ul>
      <p>Hai già un preventivo da presentare? Scrivici a <a href="mailto:info@mariobruzzese.it">info@mariobruzzese.it</a>.</p>
    `,
  },
  {
    slug: 'faq',
    title: `Domande Frequenti sui Fondi Interprofessionali | ${SITE}`,
    description:
      'Tutte le risposte sui fondi interprofessionali: cosa sono, come funzionano, come aderire, differenza tra conto formazione e avviso. Guida completa MB Consulting.',
    priority: '0.7',
    changefreq: 'monthly',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          ['Cosa sono i fondi interprofessionali?', 'I fondi interprofessionali sono organismi paritetici che finanziano la formazione continua dei lavoratori dipendenti. Le aziende vi aderiscono volontariamente destinando lo 0,30% dei contributi INPS al fondo scelto.'],
          ['Come funzionano i fondi interprofessionali?', 'I fondi raccolgono lo 0,30% dei contributi INPS e li mettono a disposizione delle aziende aderenti per finanziare piani formativi tramite Conto Formazione o Avvisi pubblici.'],
          ["L'adesione ai fondi interprofessionali è gratuita?", "Sì, l'adesione è completamente gratuita. Le risorse provengono dallo 0,30% già versato all'INPS: l'azienda non paga nulla in più."],
          ['Qual è la differenza tra Conto Formazione e Avviso?', "Il Conto Formazione è individuale per ogni azienda. L'Avviso è collettivo tramite bandi periodici, ideale per le PMI con quote ridotte."],
          ['Quale fondo interprofessionale conviene scegliere?', 'Dipende dal settore, CCNL, dimensione aziendale e tipo di formazione. MB Consulting ti guida nella scelta del fondo più adatto.'],
          ['MB Consulting gestisce tutto il processo?', 'Sì. Dalla scelta del fondo alla progettazione del piano formativo fino alla rendicontazione finale: gestiamo tutto noi.'],
          ['In quanto tempo si ottiene la formazione finanziata?', 'In media 2-6 mesi dalla scelta del fondo all’avvio della formazione, a seconda del fondo e della modalità di accesso.'],
        ].map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
      breadcrumb('FAQ', `${BASE}/faq`),
    ],
    noscript: `
      <h1>Domande Frequenti sui Fondi Interprofessionali</h1>
      <h2>Cosa sono i fondi interprofessionali?</h2>
      <p>Sono organismi paritetici che finanziano la formazione continua dei lavoratori dipendenti. Le aziende vi aderiscono volontariamente destinando lo 0,30% dei contributi INPS al fondo scelto.</p>
      <h2>L'adesione è gratuita?</h2>
      <p>Sì, l'adesione è completamente gratuita: le risorse provengono dallo 0,30% già versato all'INPS.</p>
      <h2>Qual è la differenza tra Conto Formazione e Avviso?</h2>
      <p>Il Conto Formazione è individuale per ogni azienda. L'Avviso è collettivo, tramite bandi periodici, ed è ideale per le PMI con quote ridotte.</p>
      <h2>Quale fondo conviene scegliere?</h2>
      <p>Dipende da settore, CCNL, dimensione aziendale e tipo di formazione desiderata. MB Consulting ti guida nella scelta.</p>
      <h2>In quanto tempo si ottiene la formazione finanziata?</h2>
      <p>In media 2-6 mesi dalla scelta del fondo all'avvio della formazione.</p>
    `,
  },
  {
    slug: 'condizioni-vendita',
    title: `Condizioni generali di vendita — corsi sicurezza online | ${SITE}`,
    description:
      'Condizioni generali di vendita dei corsi di sicurezza sul lavoro online promossi da MB Consulting: prezzi, pagamento, attivazione, attestato, diritto di recesso.',
    priority: '0.3',
    changefreq: 'yearly',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Condizioni generali di vendita',
        url: `${BASE}/condizioni-vendita`,
        description:
          'Condizioni applicabili all\u2019acquisto dei corsi di sicurezza sul lavoro in e-learning promossi da MB Consulting.',
        isPartOf: { '@type': 'WebSite', name: SITE, url: BASE },
      },
      breadcrumb('Condizioni di vendita', `${BASE}/condizioni-vendita`),
    ],
    noscript: `
      <h1>Condizioni generali di vendita</h1>
      <p>Venditore: MB Consulting di Mario Bruzzese, Via Aspromonte 16, 89127 Reggio Calabria (RC), partita IVA 03504290796, REA RC-199357.</p>
      <p>Soggetto formatore: O.P.N. Italia Lavoro \u2013 CNL \u2013 EBAFoS. MB Consulting \u00e8 soggetto attuatore in convenzione con O.P.N. Italia Lavoro (Convenzione n. CFAL.1866) e cura iscrizione, incasso, tutoraggio e assistenza.</p>
      <p>I prezzi indicati sono finali, per partecipante. MB Consulting opera in regime forfettario: operazioni non soggette a IVA ai sensi dell'art. 1, commi 54-89, della Legge 190/2014.</p>
      <p>Pagamento con carta di credito o debito tramite Stripe. Entro 24 ore lavorative dal pagamento i partecipanti vengono iscritti sulla piattaforma e-learning e ricevono per email le istruzioni di accesso.</p>
      <p>L'attestato \u00e8 rilasciato al superamento del test finale, indica come soggetto formatore O.P.N. Italia Lavoro \u2013 CNL \u2013 EBAFoS ed \u00e8 verificabile tramite QR code sul sito opnitalialavoro.it.</p>
      <p>Il consumatore ha diritto di recesso entro 14 giorni, che si estingue se chiede l'attivazione immediata del corso accettando la perdita del diritto, ai sensi dell'art. 59, comma 1, lett. o) del Codice del Consumo.</p>
    `,
  },
  {
    slug: 'corsi-sicurezza-calabria',
    title: `Corsi Sicurezza sul Lavoro Online in Calabria | ${SITE}`,
    description:
      'Corsi di sicurezza sul lavoro online per aziende di Catanzaro, Cosenza, Crotone, Reggio Calabria e Vibo Valentia. Accordo Stato-Regioni 2025, attestato con QR code.',
    priority: '0.8',
    changefreq: 'weekly',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Corsi di sicurezza sul lavoro online in Calabria',
        url: `${BASE}/corsi-sicurezza-calabria`,
        areaServed: { '@type': 'State', name: 'Calabria' },
        provider: { '@type': 'Organization', name: 'MB Consulting di Mario Bruzzese', url: BASE },
      },
      breadcrumb('Corsi sicurezza in Calabria', `${BASE}/corsi-sicurezza-calabria`),
    ],
    noscript: `
      <h1>Corsi di sicurezza sul lavoro online in Calabria</h1>
      <p>Formazione obbligatoria D.Lgs. 81/08 in e-learning per aziende e lavoratori delle province di Catanzaro, Cosenza, Crotone, Reggio Calabria e Vibo Valentia, conforme all'Accordo Stato-Regioni del 17 aprile 2025. Attestato verificabile tramite QR code, soggetto formatore O.P.N. Italia Lavoro \u2013 CNL \u2013 EBAFoS.</p>
      <h2>In tutte le province calabresi</h2>
      <ul>
        <li>Provincia di Catanzaro: Catanzaro, Lamezia Terme, Soverato, Girifalco, Borgia, Sellia Marina</li>
        <li>Provincia di Cosenza: Cosenza, Rende, Corigliano-Rossano, Castrovillari, Paola, Amantea, Scalea</li>
        <li>Provincia di Crotone: Crotone, Isola di Capo Rizzuto, Cir\u00f2 Marina, Cutro, Petilia Policastro</li>
        <li>Provincia di Reggio Calabria: Reggio Calabria, Gioia Tauro, Palmi, Villa San Giovanni, Siderno, Locri, Taurianova</li>
        <li>Provincia di Vibo Valentia: Vibo Valentia, Tropea, Pizzo, Serra San Bruno, Mileto, Nicotera</li>
      </ul>
      <p>MB Consulting ha sede legale a Reggio Calabria, Via Aspromonte 16. <a href="${BASE}/corsi-sicurezza">Vedi tutti i corsi di sicurezza sul lavoro online</a>.</p>
    `,
  },
  {
    slug: 'formazione-finanziata',
    title: `Formazione finanziata per le aziende \u2013 Catalogo corsi | ${SITE}`,
    description:
      'Corsi di formazione finanziata per le aziende aderenti a Fonarcom: sicurezza, digitale, intelligenza artificiale, lingue, organizzazione. Scegli i corsi e richiedili online.',
    priority: '0.8',
    changefreq: 'monthly',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Formazione finanziata per le aziende',
        url: `${BASE}/formazione-finanziata`,
        isPartOf: { '@type': 'WebSite', name: SITE, url: BASE },
      },
      breadcrumb('Formazione finanziata', `${BASE}/formazione-finanziata`),
    ],
    noscript: `
      <h1>Formazione finanziata per la tua azienda</h1>
      <p>Corsi finanziati dal fondo interprofessionale per le aziende aderenti a Fonarcom: l'azienda non paga i corsi. Scegli i corsi dal catalogo, indica quanti partecipanti e invia la richiesta: verifichiamo l'adesione al fondo e inseriamo i corsi nel piano formativo.</p>
    `,
  },
  {
    slug: 'consulenti',
    title: `Programma consulenti \u2013 Corsi sicurezza sul lavoro | ${SITE}`,
    description:
      'Consulente del lavoro, commercialista o RSPP? Offri ai tuoi clienti i corsi di sicurezza online con il 20% di sconto e ricevi il 40% dell\u2019incassato. Registrazione gratuita.',
    priority: '0.5',
    changefreq: 'monthly',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Programma consulenti',
        url: `${BASE}/consulenti`,
        isPartOf: { '@type': 'WebSite', name: SITE, url: BASE },
      },
      breadcrumb('Programma consulenti', `${BASE}/consulenti`),
    ],
    noscript: `
      <h1>Programma consulenti</h1>
      <p>Per consulenti del lavoro, commercialisti e RSPP esterni: un codice personale che d\u00e0 ai clienti il 20% di sconto sui corsi di sicurezza sul lavoro in e-learning e al consulente il 40% dell'incassato, con un'area riservata per seguire ordini e compensi.</p>
      <p>Come funziona: registrazione gratuita, accordo di collaborazione, attivazione del codice, condivisione con i clienti.</p>
    `,
  },
  {
    slug: 'privacy',
    title: `Informativa privacy | ${SITE}`,
    description:
      'Come MB Consulting tratta i dati personali raccolti sul sito: finalit\u00e0, basi giuridiche, destinatari, tempi di conservazione e diritti dell\u2019interessato.',
    priority: '0.3',
    changefreq: 'yearly',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Informativa privacy',
        url: `${BASE}/privacy`,
        description:
          'Informativa ai sensi degli articoli 13 e 14 del Regolamento (UE) 2016/679 sul trattamento dei dati raccolti tramite mariobruzzese.it.',
        isPartOf: { '@type': 'WebSite', name: SITE, url: BASE },
      },
      breadcrumb('Privacy', `${BASE}/privacy`),
    ],
    noscript: `
      <h1>Informativa privacy</h1>
      <p>Titolare del trattamento: MB Consulting di Mario Bruzzese, Via Aspromonte 16, 89127 Reggio Calabria (RC), privacy@mariobruzzese.it.</p>
      <p>Dati trattati: dati di intestazione e fatturazione del cliente e dati dei partecipanti (nome, cognome, codice fiscale, email). Per le richieste di formazione finanziata: dati dell'azienda, del referente (nome, ruolo, email, telefono) e corsi scelti con il numero di partecipanti.</p>
      <p>Finalit\u00e0: esecuzione del contratto, obblighi fiscali e documentazione dell'obbligo formativo, invio di comunicazioni commerciali previo consenso.</p>
      <p>Destinatari: O.P.N. Italia Lavoro (responsabile del trattamento per il rilascio e la validazione degli attestati) e CNL Informatica s.r.l.s. (sub-responsabile, piattaforma e-learning), Stripe, Brevo, Cloudflare, Formspree, GitHub, WhatsApp (solo se scegli di scriverci su WhatsApp, come titolare autonomo), per le richieste di formazione finanziata confermate, l'ente di formazione accreditato che gestisce il piano e FonARCom; consulente fiscale.</p>
      <p>Registro di sicurezza: il servizio di iscrizione registra solo le richieste anomale o sospette (indirizzo IP, data e ora, paese e rete, browser, pagina richiesta), per la sicurezza dei sistemi (legittimo interesse, art. 6.1.f GDPR); gli IP con molte richieste sospette possono essere bloccati per 24 ore.</p>
      <p>Conservazione: 10 anni per i dati contabili e fiscali; 24 mesi per i messaggi di contatto e WhatsApp e per le richieste di formazione finanziata che non proseguono; fino a revoca per le comunicazioni commerciali; 90 giorni per il registro di sicurezza.</p>
      <p>Diritti: accesso, rettifica, cancellazione, limitazione, portabilit\u00e0, opposizione e revoca del consenso, scrivendo a privacy@mariobruzzese.it; reclamo al Garante per la protezione dei dati personali.</p>
      <p>Il sito usa solo cookie tecnici: nessun cookie di profilazione né tracciamento pubblicitario. Le statistiche di visita sono anonime e senza cookie (Cloudflare Web Analytics).</p>
    `,
  },
  {
    slug: 'durata-scadenza-corsi-sicurezza',
    title: `Durata e Scadenza dei Corsi di Sicurezza sul Lavoro | Accordo Stato-Regioni 2025`,
    description:
      'Quanto dura ogni corso di sicurezza sul lavoro e ogni quanto va rifatto l\u2019aggiornamento: lavoratori, preposti, dirigenti, datore di lavoro, RSPP, RLS, antincendio, primo soccorso, HACCP.',
    priority: '0.8',
    changefreq: 'monthly',
    schema: [breadcrumb('Durata e scadenza dei corsi', `${BASE}/durata-scadenza-corsi-sicurezza`)],
    // il prospetto in HTML lo genera scripts/prerender.js dai dati del sito
    noscript: `
      <h1>Durata e scadenza dei corsi di sicurezza sul lavoro</h1>
      <p>Quante ore dura ogni corso, quanto vale l\u2019attestato e ogni quanto va rifatto l\u2019aggiornamento. I dati provengono dal quadro sinottico dell\u2019Accordo Stato-Regioni del 17 aprile 2025 (rep. atti n. 59/CSR); per i percorsi che l\u2019Accordo non disciplina \u2014 antincendio, primo soccorso, ponteggi, funi, segnaletica stradale, lavori elettrici e HACCP \u2014 vale la norma indicata nella riga corrispondente.</p>
      <p>La stessa tabella indica come si pu\u00f2 seguire ciascun corso: presenza fisica, videoconferenza sincrona o e-learning, con il numero massimo di partecipanti in aula, il rapporto tra docente e allievi nella parte pratica e il tipo di verifica finale.</p>
    `,
  },
  {
    slug: 'codice-ateco-livello-di-rischio',
    title: `Codice ATECO e Livello di Rischio: Basso, Medio o Alto | Ore di Formazione`,
    description:
      'Cerca il tuo codice ATECO e scopri se l\u2019attivit\u00e0 \u00e8 a rischio basso, medio o alto e quante ore di formazione servono ai lavoratori secondo l\u2019Accordo Stato-Regioni 2025.',
    priority: '0.8',
    changefreq: 'monthly',
    schema: [breadcrumb('Codice ATECO e livello di rischio', `${BASE}/codice-ateco-livello-di-rischio`)],
    // le tabelle per livello le genera scripts/prerender.js dai dati del sito
    noscript: `
      <h1>Codice ATECO e livello di rischio: basso, medio o alto</h1>
      <p>Il settore di appartenenza dell\u2019azienda stabilisce la durata della formazione dei lavoratori: 8 ore complessive per i settori a rischio basso (4 di formazione generale e 4 di specifica), 12 ore per il rischio medio (4 + 8) e 16 ore per il rischio alto (4 + 12). L\u2019aggiornamento \u00e8 di 6 ore ogni 5 anni per tutti i livelli.</p>
      <p>La classificazione che segue \u00e8 quella dell\u2019Allegato IV dell\u2019Accordo Stato-Regioni del 17 aprile 2025 (rep. atti n. 59/CSR), con le corrispondenze ATECO 2007. Il codice ATECO indica il livello di partenza: la durata definitiva dipende dalla valutazione dei rischi dell\u2019azienda e le ore dell\u2019Accordo sono minime.</p>
    `,
  },
];

module.exports = { SITE, BASE, OG_IMG, pages };
