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
      <p>Approfondisci: <a href="/come-funziona">come funzionano i fondi</a>, <a href="/servizi">i servizi</a>, <a href="/casi-studio">i casi studio</a>, <a href="/faq">le domande frequenti</a>.</p>
      <p>Contattaci per una consulenza gratuita: <a href="mailto:info@mariobruzzese.it">info@mariobruzzese.it</a></p>
    `,
  },
  {
    slug: 'corsi-sicurezza',
    title: `Corsi Sicurezza sul Lavoro Online – Accordo Stato-Regioni 2025 | ${SITE}`,
    description:
      "Corsi di sicurezza sul lavoro online, Accordo Stato-Regioni 2025: lavoratori, datore di lavoro, RSPP, RLS, formatori, HACCP. Attestato con QR code, da 25 €.",
    priority: '0.9',
    changefreq: 'weekly',
    // l'elenco dei corsi (ItemList) lo genera scripts/prerender.js dal catalogo
    schema: [breadcrumb('Corsi sicurezza', `${BASE}/corsi-sicurezza`)],
    noscript: `
      <h1>Corsi di sicurezza sul lavoro online — e-learning D.Lgs 81/08</h1>
      <p>MB Consulting promuove e vende 26 corsi di sicurezza sul lavoro in modalità e-learning asincrona, progettati, autorizzati ed erogati da EFEI — Organismo Paritetico Salute e Sicurezza nei Luoghi di Lavoro, tramite l'Unità Operativa codice 2403. Si seguono da computer, tablet o telefono negli orari che preferisci; superato il test finale, l'attestato \u2014 che riporta anche l'Ateneo delle Professioni \u2013 Universit\u00e0 AUGE, Dipartimento Salute e Sicurezza sul Lavoro \u2014 si scarica direttamente dalla piattaforma.</p>
      <p>I percorsi sono conformi al D.Lgs. 9 aprile 2008 n. 81 e all'Accordo Stato-Regioni del 17 aprile 2025 (rep. atti n. 59/CSR), pubblicato in Gazzetta Ufficiale n. 119 del 24 maggio 2025. Dal 24 maggio 2026, concluso il periodo transitorio di dodici mesi, l'Accordo disciplina in via esclusiva durata e contenuti minimi della formazione in materia di salute e sicurezza sul lavoro.</p>
      <h2>Lavoratori</h2>
      <p>Formazione obbligatoria per tutti i dipendenti</p>
      <ul>
        <li><strong>Formazione generale dei lavoratori</strong> — 4 ore, 35 € a partecipante, IVA compresa. Tutti i lavoratori dipendenti, qualunque sia il settore. Riferimento: D.Lgs. 81/2008, art. 37.</li>
        <li><strong>Formazione generale dei lavoratori — in inglese</strong> — 4 ore, 45 € a partecipante, IVA compresa. Lavoratori di lingua inglese. Riferimento: D.Lgs. 81/2008, art. 37.</li>
        <li><strong>Formazione specifica — rischio basso</strong> — 4 ore, 39 € a partecipante, IVA compresa. Lavoratori di uffici, commercio, servizi e altri settori a rischio basso. Riferimento: D.Lgs. 81/2008, art. 37.</li>
        <li><strong>Formazione generale + specifica — rischio basso</strong> — 8 ore, 59 € a partecipante, IVA compresa. Neoassunti in settori a rischio basso: assolve l’intero obbligo formativo. Riferimento: D.Lgs. 81/2008, art. 37.</li>
        <li><strong>Aggiornamento lavoratori — tutti i livelli di rischio</strong> — 6 ore, 49 € a partecipante, IVA compresa. Lavoratori già formati, in scadenza quinquennale. Riferimento: D.Lgs. 81/2008, art. 37.</li>
        <li><strong>Aggiornamento lavoratori — rischio medio</strong> — 6 ore, 49 € a partecipante, IVA compresa. Lavoratori di settori a rischio medio, in scadenza quinquennale. Riferimento: D.Lgs. 81/2008, art. 37.</li>
      </ul>
      <h2>Datore di lavoro</h2>
      <p>Obblighi formativi di chi guida l’azienda</p>
      <ul>
        <li><strong>Formazione datore di lavoro</strong> — 16 ore, 149 € a partecipante, IVA compresa. Datori di lavoro. Riferimento: D.Lgs. 81/2008.</li>
        <li><strong>Aggiornamento datore di lavoro RSPP</strong> — 8 ore, 89 € a partecipante, IVA compresa. Datori di lavoro RSPP in scadenza quinquennale. Riferimento: D.Lgs. 81/2008, art. 34.</li>
        <li><strong>Modulo aggiuntivo "Cantieri" — datore di lavoro</strong> — 6 ore, 119 € a partecipante, IVA compresa. Datori di lavoro di imprese che operano in cantiere. Riferimento: D.Lgs. 81/2008, Titolo IV.</li>
      </ul>
      <h2>Dirigenti</h2>
      <p>Chi attua le direttive del datore di lavoro</p>
      <ul>
        <li><strong>Formazione dirigenti</strong> — 12 ore, 149 € a partecipante, IVA compresa. Dirigenti con responsabilità organizzative in materia di sicurezza. Riferimento: D.Lgs. 81/2008, art. 37.</li>
        <li><strong>Aggiornamento dirigenti</strong> — 6 ore, 69 € a partecipante, IVA compresa. Dirigenti già formati, in scadenza quinquennale. Riferimento: D.Lgs. 81/2008, art. 37.</li>
        <li><strong>Modulo aggiuntivo "Cantieri" — dirigenti</strong> — 6 ore, 119 € a partecipante, IVA compresa. Dirigenti di imprese che operano in cantiere. Riferimento: D.Lgs. 81/2008, Titolo IV.</li>
      </ul>
      <h2>RSPP e ASPP</h2>
      <p>Servizio di prevenzione e protezione</p>
      <ul>
        <li><strong>RSPP e ASPP — Modulo A</strong> — 28 ore, 169 € a partecipante, IVA compresa. Aspiranti RSPP e ASPP: modulo base comune a tutti i settori. Riferimento: D.Lgs. 81/2008, art. 32.</li>
        <li><strong>Aggiornamento RSPP</strong> — 40 ore, 149 € a partecipante, IVA compresa. RSPP in carica, aggiornamento quinquennale. Riferimento: D.Lgs. 81/2008, art. 32.</li>
        <li><strong>Aggiornamento ASPP</strong> — 20 ore, 139 € a partecipante, IVA compresa. ASPP in carica, aggiornamento quinquennale. Riferimento: D.Lgs. 81/2008, art. 32.</li>
      </ul>
      <h2>RLS</h2>
      <p>Rappresentante dei lavoratori per la sicurezza</p>
      <ul>
        <li><strong>Formazione RLS</strong> — 32 ore, 149 € a partecipante, IVA compresa. Rappresentanti dei lavoratori per la sicurezza di nuova nomina. Riferimento: D.Lgs. 81/2008, art. 37 commi 10-11.</li>
        <li><strong>Aggiornamento RLS — aziende fino a 50 lavoratori</strong> — 4 ore, 59 € a partecipante, IVA compresa. RLS di imprese fino a 50 dipendenti, aggiornamento annuale. Riferimento: D.Lgs. 81/2008, art. 37 comma 11.</li>
        <li><strong>Aggiornamento RLS — aziende oltre 50 lavoratori</strong> — 8 ore, 89 € a partecipante, IVA compresa. RLS di imprese con oltre 50 dipendenti, aggiornamento annuale. Riferimento: D.Lgs. 81/2008, art. 37 comma 11.</li>
      </ul>
      <h2>Cantieri</h2>
      <p>Coordinatori e moduli aggiuntivi per il settore edile</p>
      <ul>
        <li><strong>Coordinatore sicurezza — modulo normativo/giuridico</strong> — 8 ore, 79 € a partecipante, IVA compresa. Aspiranti coordinatori per la progettazione e per l’esecuzione dei lavori. Riferimento: D.Lgs. 81/2008, art. 98 e Allegato XIV.</li>
      </ul>
      <h2>Formatori</h2>
      <p>Qualificazione del formatore in materia di sicurezza</p>
      <ul>
        <li><strong>Formazione formatori — 40 ore</strong> — 40 ore, 269 € a partecipante, IVA compresa. Chi vuole qualificarsi come formatore in materia di salute e sicurezza. Riferimento: D.I. 6 marzo 2013.</li>
        <li><strong>Formazione formatori — 24 ore</strong> — 24 ore, 189 € a partecipante, IVA compresa. Percorso ridotto per chi possiede già parte dei requisiti. Riferimento: D.I. 6 marzo 2013.</li>
        <li><strong>Aggiornamento formatori</strong> — 24 ore, 149 € a partecipante, IVA compresa. Formatori qualificati, aggiornamento triennale. Riferimento: D.I. 6 marzo 2013.</li>
      </ul>
      <h2>HACCP e alimentaristi</h2>
      <p>Igiene degli alimenti per chi lavora nel settore alimentare</p>
      <ul>
        <li><strong>Responsabile industria alimentare (HACCP OSA)</strong> — 12 ore, 39 € a partecipante, IVA compresa. Titolari e responsabili di imprese del settore alimentare. Riferimento: Reg. CE 852/2004 e normativa regionale.</li>
        <li><strong>Alimentaristi — rischio elevato (cat. A)</strong> — 8 ore, 29 € a partecipante, IVA compresa. Chi manipola alimenti in attività a rischio elevato. Riferimento: Reg. CE 852/2004 e normativa regionale.</li>
        <li><strong>Alimentaristi — rischio medio (cat. B)</strong> — 6 ore, 25 € a partecipante, IVA compresa. Chi manipola alimenti in attività a rischio medio. Riferimento: Reg. CE 852/2004 e normativa regionale.</li>
        <li><strong>Aggiornamento alimentaristi (cat. A e B)</strong> — 4 ore, 25 € a partecipante, IVA compresa. Alimentaristi già formati, in scadenza. Riferimento: Reg. CE 852/2004 e normativa regionale.</li>
      </ul>
      <h2>Come funziona l'iscrizione</h2>
      <p>Scegli il corso e il numero di partecipanti, inserisci anagrafica e dati di fatturazione, paghi online. Entro 24 ore registriamo i partecipanti sulla piattaforma: ciascuno riceve un'email per confermare il proprio account, e l'indirizzo indicato diventa il suo nome utente. Confermato l'account, abbiniamo il corso e si può iniziare. Superato il test finale, l'attestato si scarica direttamente dalla piattaforma.</p>
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
      <h1>Consulenza Fondi Interprofessionali per Aziende</h1>
      <p>MB Consulting affianca le aziende in ogni fase dell'accesso ai fondi interprofessionali, dall'analisi iniziale alla rendicontazione finale.</p>
      <h2>Servizi offerti</h2>
      <ul>
        <li><strong>Consulenza Fondi Interprofessionali</strong> — Analisi delle opportunità disponibili e scelta del fondo più adatto alla tua realtà aziendale.</li>
        <li><strong>Analisi Fabbisogni Formativi</strong> — Individuazione delle reali esigenze aziendali, anche quelle non esplicite, per una formazione mirata.</li>
        <li><strong>Progettazione Piani Formativi</strong> — Costruzione completa del progetto formativo conforme ai requisiti dei fondi interprofessionali.</li>
        <li><strong>Gestione Completa del Processo</strong> — Coordinamento tra azienda, ente di formazione e docenti.</li>
        <li><strong>Erogazione e Coordinamento Didattico</strong> — Organizzazione delle attività formative e supervisione della qualità.</li>
        <li><strong>Supporto Amministrativo</strong> — Preparazione della documentazione completa per controlli e ispezioni.</li>
      </ul>
      <p>Vedi anche: <a href="/come-funziona">come funziona</a> e <a href="/perche-noi">perché sceglierci</a>.</p>
    `,
  },
  {
    slug: 'come-funziona',
    title: `Come Funzionano i Fondi Interprofessionali | ${SITE}`,
    description:
      'Come funzionano i fondi interprofessionali? In pochi passi finanzi la formazione dei dipendenti al 100%. Scopri il metodo MB Consulting.',
    priority: '0.8',
    changefreq: 'monthly',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'Come accedere ai fondi interprofessionali',
        description:
          'Guida passo-passo per accedere ai fondi interprofessionali e ottenere formazione aziendale finanziata al 100%.',
        step: [
          { '@type': 'HowToStep', position: 1, name: 'Analisi iniziale', text: 'Analizziamo la tua azienda e identifichiamo il fondo più adatto.' },
          { '@type': 'HowToStep', position: 2, name: 'Analisi dei fabbisogni', text: 'Individuiamo le reali esigenze formative, anche quelle non esplicite.' },
          { '@type': 'HowToStep', position: 3, name: 'Progettazione del piano', text: 'Costruiamo il piano formativo conforme ai requisiti del fondo.' },
          { '@type': 'HowToStep', position: 4, name: 'Coordinamento completo', text: 'Coordiniamo azienda, ente di formazione e docenti.' },
          { '@type': 'HowToStep', position: 5, name: 'Erogazione della formazione', text: 'Organizziamo e supervisioniamo le attività formative.' },
          { '@type': 'HowToStep', position: 6, name: 'Gestione amministrativa', text: 'Prepariamo la documentazione per controlli e rendicontazione.' },
        ],
      },
      breadcrumb('Come funziona', `${BASE}/come-funziona`),
    ],
    noscript: `
      <h1>Come Funzionano i Fondi Interprofessionali</h1>
      <p>Ogni azienda versa all'INPS lo 0,30% dei contributi per i propri dipendenti. Aderendo a un fondo interprofessionale, quelle risorse tornano disponibili per finanziare la formazione aziendale.</p>
      <h2>Il processo in 6 fasi</h2>
      <ol>
        <li><strong>Analisi Iniziale</strong> — Individuiamo il fondo interprofessionale più adatto alla tua azienda.</li>
        <li><strong>Analisi Fabbisogni</strong> — Rileviamo le reali esigenze formative, anche quelle non esplicite.</li>
        <li><strong>Progettazione Piano</strong> — Costruiamo il piano formativo conforme ai requisiti del fondo.</li>
        <li><strong>Coordinamento Completo</strong> — Gestiamo azienda, ente di formazione e docenti.</li>
        <li><strong>Erogazione Formazione</strong> — Supervisioniamo qualità ed efficacia didattica.</li>
        <li><strong>Gestione Amministrativa</strong> — Curiamo documentazione e rendicontazione finale.</li>
      </ol>
      <h2>Conto Formazione o Avviso?</h2>
      <p>Il <strong>Conto Formazione</strong> raccoglie le risorse della singola azienda, utilizzabili in autonomia per piani personalizzati. Gli <strong>Avvisi</strong> sono bandi collettivi periodici, ideali per le PMI con quote accantonate ridotte.</p>
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
    slug: 'casi-studio',
    title: `Casi Studio: Aziende che hanno Ottenuto Formazione Finanziata | ${SITE}`,
    description:
      'Leggi i casi reali di aziende che hanno ottenuto formazione finanziata grazie ai fondi interprofessionali con MB Consulting. Risultati verificabili.',
    priority: '0.8',
    changefreq: 'monthly',
    schema: [breadcrumb('Casi studio', `${BASE}/casi-studio`)],
    noscript: `
      <h1>Casi Studio: Formazione Finanziata dai Fondi Interprofessionali</h1>
      <h2>Azienda Manifatturiera — Lombardia (settore metalmeccanico)</h2>
      <p>Esigenza: aggiornamento delle competenze digitali per 25 dipendenti. Soluzione: piano formativo su Industria 4.0 e digitalizzazione dei processi produttivi. Risultati: 45.000 € di formazione finanziata, 150 ore erogate, 100% di partecipazione, zero impatto sui costi aziendali.</p>
      <h2>Struttura Ricettiva — Reggio Calabria (turismo e hospitality)</h2>
      <p>Esigenza: formare lo staff su accoglienza turistica, lingue straniere e marketing digitale. Soluzione: piano formativo su hospitality management, inglese professionale e social media marketing turistico. Risultati: 35.000 € di finanziamento ottenuto, 120 ore di formazione specialistica, 18 operatori formati, nessun costo per la struttura.</p>
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
      <p>I corsi sono progettati, autorizzati ed erogati da EFEI \u2014 Organismo Paritetico Salute e Sicurezza nei Luoghi di Lavoro tramite l'Unit\u00e0 Operativa codice 2403. MB Consulting cura promozione, iscrizione, incasso e assistenza.</p>
      <p>I prezzi indicati sono finali, per partecipante. MB Consulting opera in regime forfettario: operazioni non soggette a IVA ai sensi dell'art. 1, commi 54-89, della Legge 190/2014.</p>
      <p>Pagamento con carta tramite Stripe oppure con bonifico bancario. Entro 24 ore lavorative dal pagamento i dati vengono inseriti sulla piattaforma dell'ente; il partecipante riceve un'email di conferma dell'account e solo dopo la conferma il corso pu\u00f2 essergli abbinato.</p>
      <p>L'attestato \u00e8 rilasciato da EFEI al superamento del test finale, riporta anche l'Ateneo delle Professioni \u2013 Universit\u00e0 AUGE, Dipartimento Salute e Sicurezza sul Lavoro, ed \u00e8 scaricabile direttamente dalla piattaforma.</p>
      <p>Il consumatore ha diritto di recesso entro 14 giorni, che si estingue se chiede l'attivazione immediata del corso accettando la perdita del diritto, ai sensi dell'art. 59, comma 1, lett. o) del Codice del Consumo.</p>
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
      <p>Dati trattati: dati di intestazione e fatturazione del cliente e dati anagrafici dei partecipanti (nome, cognome, codice fiscale, data e luogo di nascita, email, telefono, qualifica).</p>
      <p>Finalit\u00e0: esecuzione del contratto, obblighi fiscali e documentazione dell'obbligo formativo, invio di comunicazioni commerciali previo consenso.</p>
      <p>Destinatari: EFEI (titolare autonomo per l'erogazione del corso), Stripe, Brevo, Cloudflare, Formspree, GitHub, WhatsApp (solo se scegli di scriverci su WhatsApp, come titolare autonomo), consulente fiscale.</p>
      <p>Conservazione: 10 anni per i dati contabili e fiscali; 24 mesi per i messaggi di contatto e WhatsApp; fino a revoca per le comunicazioni commerciali.</p>
      <p>Diritti: accesso, rettifica, cancellazione, limitazione, portabilit\u00e0, opposizione e revoca del consenso, scrivendo a privacy@mariobruzzese.it; reclamo al Garante per la protezione dei dati personali.</p>
      <p>Il sito usa solo cookie tecnici: nessun cookie di profilazione, nessuno strumento di analisi o tracciamento pubblicitario.</p>
    `,
  },
];

module.exports = { SITE, BASE, OG_IMG, pages };
