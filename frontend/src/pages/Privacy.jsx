import React from 'react';
import DocumentoLegale, { Sezione, Elenco } from '../components/DocumentoLegale';

const Privacy = () => (
  <DocumentoLegale
    titolo="Informativa privacy"
    sommario="Informativa resa ai sensi degli articoli 13 e 14 del Regolamento (UE) 2016/679 sul trattamento dei dati personali raccolti tramite il sito mariobruzzese.it."
    aggiornamento="22 settembre 2026"
    seo={{
      title: 'Informativa privacy',
      description:
        'Come MB Consulting tratta i dati personali raccolti sul sito: finalità, basi giuridiche, destinatari, tempi di conservazione e diritti dell’interessato.',
      canonical: 'https://www.mariobruzzese.it/privacy',
      noIndex: false,
    }}
  >
    <Sezione numero="1" titolo="Titolare del trattamento">
      <div className="bg-gray-50 rounded-xl p-5 text-[15px]">
        <p className="font-semibold text-gray-900 mb-1">MB Consulting di Mario Bruzzese</p>
        <p>Via Aspromonte 16, 89127 Reggio Calabria (RC)</p>
        <p>Partita IVA 03504290796</p>
        <p>Email: privacy@mariobruzzese.it</p>
      </div>
      <p>
        Non è stato nominato un Responsabile della protezione dei dati, non ricorrendo i presupposti dell’art. 37 del
        Regolamento.
      </p>
    </Sezione>

    <Sezione numero="2" titolo="Quali dati trattiamo">
      <p>
        <strong>Dati di navigazione.</strong> Il sito è ospitato su GitHub Pages. I sistemi informatici registrano,
        per il solo funzionamento tecnico, dati come indirizzo IP, tipo di browser e pagine richieste. Il sito non
        utilizza cookie di profilazione né strumenti di tracciamento pubblicitario. Per sapere quante persone visitano
        le pagine usiamo Cloudflare Web Analytics, che raccoglie statistiche aggregate e anonime (pagine viste,
        provenienza della visita, tipo di dispositivo) senza installare cookie e senza identificare il singolo visitatore.
      </p>
      <p>
        <strong>Dati del modulo di contatto.</strong> Nome, indirizzo email, eventuale azienda e testo del messaggio.
      </p>
      <p>
        <strong>Dati dei messaggi WhatsApp.</strong> Se scegli di contattarci con il pulsante WhatsApp, riceviamo il tuo
        numero di telefono, il nome del profilo e il contenuto dei messaggi che ci invii. Il pulsante è un semplice
        collegamento: il sito non trasmette a WhatsApp alcun dato finché non decidi di aprire la chat e di inviare il
        messaggio.
      </p>
      <p>
        <strong>Dati del modulo di iscrizione ai corsi.</strong> In particolare:
      </p>
      <Elenco
        voci={[
          'dati di intestazione: ragione sociale o nome e cognome, partita IVA o codice fiscale, sede, provincia, codice destinatario o PEC per la fatturazione elettronica, email e telefono di riferimento;',
          'dati di ciascun partecipante: nome, cognome, codice fiscale, data e luogo di nascita, indirizzo email, telefono, qualifica ricoperta;',
          'dati relativi all’ordine: corsi selezionati, importo, metodo di pagamento, riferimento della pratica.',
        ]}
      />
      <p>
        Non vengono richiesti né devono essere comunicati dati appartenenti alle categorie particolari di cui
        all’art. 9 del Regolamento (dati sulla salute, convinzioni, appartenenza sindacale e simili).
      </p>
    </Sezione>

    <Sezione numero="3" titolo="Perché li trattiamo e in base a quale fondamento">
      <Elenco
        voci={[
          'Gestire la richiesta inviata tramite il modulo di contatto o tramite WhatsApp e rispondere — base giuridica: misure precontrattuali su richiesta dell’interessato, art. 6.1.b.',
          'Registrare l’iscrizione, incassare il corrispettivo e trasmettere i dati all’ente erogatore per l’apertura dell’account e l’abbinamento del corso — base giuridica: esecuzione del contratto, art. 6.1.b (per i partecipanti che non siano anche il cliente: legittimo interesse del datore di lavoro e del titolare all’adempimento dell’obbligo formativo, art. 6.1.f).',
          'Emettere il documento fiscale e conservare le scritture contabili — base giuridica: obbligo di legge, art. 6.1.c.',
          'Documentare l’assolvimento degli obblighi formativi previsti dal D.Lgs. 81/2008 — base giuridica: obbligo di legge, art. 6.1.c.',
          'Inviare comunicazioni su scadenze formative e nuovi corsi — base giuridica: consenso, art. 6.1.a, revocabile in qualsiasi momento.',
          'Difendere un diritto in sede giudiziaria e garantire la sicurezza dei sistemi — base giuridica: legittimo interesse, art. 6.1.f.',
        ]}
      />
      <p>
        Il conferimento dei dati contrassegnati come obbligatori è necessario: senza di essi l’iscrizione non può
        essere registrata né trasmessa all’ente erogatore. Il consenso alle comunicazioni commerciali è invece
        facoltativo e il suo rifiuto non pregiudica l’acquisto.
      </p>
    </Sezione>

    <Sezione numero="4" titolo="A chi comunichiamo i dati">
      <p>I dati sono accessibili al titolare e possono essere comunicati ai seguenti soggetti.</p>
      <Elenco
        voci={[
          'EFEI — Organismo Paritetico Salute e Sicurezza nei Luoghi di Lavoro, Unità Operativa 2403, che eroga il corso e rilascia l’attestato. Opera in qualità di titolare autonomo del trattamento per le finalità didattiche e certificative.',
          'Stripe Payments Europe Ltd., per l’esecuzione dei pagamenti con carta. I dati della carta sono trattati direttamente da Stripe e non transitano dai sistemi del titolare.',
          'Brevo (Sendinblue SAS), per l’invio delle email transazionali e delle comunicazioni commerciali, in qualità di responsabile del trattamento.',
          'Cloudflare, Inc., che ospita il servizio applicativo e il database in cui sono registrati gli ordini, in qualità di responsabile del trattamento.',
          'Formspree, Inc., che recapita i messaggi inviati tramite il modulo di contatto.',
          'WhatsApp Ireland Ltd. (gruppo Meta), se scegli di scriverci su WhatsApp. WhatsApp tratta i dati della conversazione in qualità di titolare autonomo, secondo la propria informativa (whatsapp.com/legal).',
          'GitHub, Inc., che ospita le pagine del sito.',
          'Cloudflare, Inc., per le statistiche anonime di visita (Cloudflare Web Analytics), senza cookie.',
          'Il consulente fiscale del titolare e, se richiesto, le autorità competenti.',
        ]}
      />
      <p>
        I dati non sono diffusi né ceduti a terzi per finalità proprie di questi ultimi.
      </p>
    </Sezione>

    <Sezione numero="5" titolo="Trasferimenti fuori dall’Unione Europea">
      <p>
        Alcuni dei fornitori indicati appartengono a gruppi con sede negli Stati Uniti. Gli eventuali trasferimenti
        avvengono sulla base delle clausole contrattuali tipo adottate dalla Commissione europea o della decisione di
        adeguatezza relativa al quadro UE-USA per la protezione dei dati, con le garanzie supplementari previste dai
        rispettivi accordi di trattamento.
      </p>
    </Sezione>

    <Sezione numero="6" titolo="Per quanto tempo li conserviamo">
      <Elenco
        voci={[
          'Dati contrattuali, contabili e fiscali: 10 anni dalla conclusione dell’esercizio, come previsto dall’art. 2220 del codice civile e dalla normativa tributaria.',
          'Dati relativi all’assolvimento dell’obbligo formativo: per il periodo in cui l’attestato conserva validità e comunque per la durata degli obblighi di conservazione del datore di lavoro.',
          'Messaggi ricevuti dal modulo di contatto o su WhatsApp: 24 mesi dall’ultimo scambio, salvo che diano origine a un rapporto contrattuale.',
          'Dati trattati per finalità di comunicazione commerciale: fino alla revoca del consenso e comunque non oltre 24 mesi dall’ultimo contatto.',
        ]}
      />
    </Sezione>

    <Sezione numero="7" titolo="Dati di persone diverse dal cliente">
      <p>
        Quando un’azienda o un professionista iscrive i propri lavoratori, comunica al titolare dati personali di
        terzi. In tal caso il cliente dichiara di essere legittimato a trasmetterli e si impegna a fornire a ciascun
        partecipante l’informativa prevista dall’art. 13 del Regolamento, anche rendendo disponibile la presente
        pagina.
      </p>
      <p>
        Il titolare mette a disposizione dei partecipanti questa informativa ai sensi dell’art. 14 del Regolamento nel
        momento del primo contatto, contestualmente all’invio delle credenziali di accesso.
      </p>
    </Sezione>

    <Sezione numero="8" titolo="Processi decisionali automatizzati">
      <p>
        Il titolare non adotta processi decisionali automatizzati, compresa la profilazione, che producano effetti
        giuridici o incidano in modo analogamente significativo sugli interessati.
      </p>
    </Sezione>

    <Sezione numero="9" titolo="I tuoi diritti">
      <p>
        In qualsiasi momento è possibile esercitare i diritti previsti dagli articoli da 15 a 22 del Regolamento:
        accesso ai propri dati, rettifica, cancellazione, limitazione del trattamento, portabilità, opposizione al
        trattamento fondato sul legittimo interesse e revoca del consenso, quest’ultima senza pregiudizio per la
        liceità del trattamento effettuato prima della revoca.
      </p>
      <p>
        Le richieste vanno inviate a privacy@mariobruzzese.it. Il
        titolare risponde entro un mese, prorogabile di due mesi in caso di richieste complesse.
      </p>
      <p>
        È inoltre possibile proporre reclamo al Garante per la protezione dei dati personali, Piazza Venezia 11,
        00187 Roma — garanteprivacy.it.
      </p>
    </Sezione>

    <Sezione numero="10" titolo="Cookie">
      <p>
        Il sito utilizza esclusivamente cookie tecnici necessari al proprio funzionamento, per i quali non è
        richiesto il consenso ai sensi dell’art. 122 del D.Lgs. 196/2003. Non sono presenti cookie di profilazione
        né pixel pubblicitari di terze parti. Le statistiche di visita (Cloudflare Web Analytics) non usano cookie.
        Il sito salva nel browser una sola impostazione tecnica, e solo se richiesta: chi cura il sito può escludersi
        dalle statistiche, così i conteggi riguardano i visitatori reali.
      </p>
      <p>
        I servizi esterni richiamati durante il pagamento (Stripe) possono utilizzare cookie propri, necessari alla
        prevenzione delle frodi, secondo le rispettive informative. Il pulsante WhatsApp non carica script né cookie
        sul sito: apre WhatsApp solo quando viene cliccato.
      </p>
    </Sezione>

    <Sezione numero="11" titolo="Modifiche">
      <p>
        La presente informativa può essere aggiornata per adeguarla a modifiche normative o organizzative. La versione
        vigente è sempre quella pubblicata a questo indirizzo, con la data di ultimo aggiornamento indicata in testa
        alla pagina.
      </p>
    </Sezione>
  </DocumentoLegale>
);

export default Privacy;
