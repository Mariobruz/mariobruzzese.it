import React from 'react';
import DocumentoLegale, { Sezione, Elenco } from '../components/DocumentoLegale';

const CondizioniVendita = () => (
  <DocumentoLegale
    titolo="Condizioni generali di vendita"
    sommario="Condizioni applicabili all’acquisto dei corsi di formazione sulla sicurezza sul lavoro in modalità e-learning promossi e venduti da MB Consulting di Mario Bruzzese."
    aggiornamento="19 settembre 2026"
    seo={{
      title: 'Condizioni generali di vendita',
      description:
        'Condizioni generali di vendita dei corsi di sicurezza sul lavoro online promossi da MB Consulting: prezzi, pagamento, attivazione, attestato, diritto di recesso.',
      canonical: 'https://www.mariobruzzese.it/condizioni-vendita',
      noIndex: false,
    }}
  >
    <Sezione numero="1" titolo="Chi vende">
      <p>Il venditore è:</p>
      <div className="bg-gray-50 rounded-xl p-5 text-[15px]">
        <p className="font-semibold text-gray-900 mb-1">MB Consulting di Mario Bruzzese</p>
        <p>Impresa individuale — Via Aspromonte 16, 89127 Reggio Calabria (RC)</p>
        <p>Partita IVA 03504290796 — REA RC-199357</p>
        <p>Email: corsi@mariobruzzese.it — Telefono: +39 329 1747521</p>
      </div>
      <p>
        Di seguito «MB Consulting». Il soggetto che acquista è di seguito «Cliente»; la persona fisica iscritta al
        corso è il «Partecipante» e può coincidere con il Cliente.
      </p>
    </Sezione>

    <Sezione numero="2" titolo="Chi eroga la formazione">
      <p>
        I corsi sono progettati, autorizzati ed erogati da <strong>EFEI — Organismo Paritetico Salute e Sicurezza
        nei Luoghi di Lavoro</strong>, iscritto al Repertorio Nazionale degli Organismi Paritetici del Ministero del
        Lavoro e delle Politiche Sociali, tramite la propria <strong>Unità Operativa codice 2403</strong> e la
        relativa piattaforma e-learning.
      </p>
      <p>
        MB Consulting opera in forza di un mandato commerciale conferito dall’Unità Operativa 2403 e cura
        esclusivamente la promozione, la raccolta delle iscrizioni, l’incasso e l’assistenza al Cliente. La
        progettazione didattica, l’erogazione, la gestione della piattaforma, la valutazione finale e il rilascio
        dell’attestato restano di competenza esclusiva di EFEI.
      </p>
    </Sezione>

    <Sezione numero="3" titolo="Oggetto del contratto">
      <p>
        Oggetto del contratto è l’iscrizione di uno o più Partecipanti a un corso di formazione in materia di salute
        e sicurezza sul lavoro, erogato in modalità e-learning asincrona, secondo il programma, la durata e i
        destinatari indicati nella scheda del corso al momento dell’acquisto.
      </p>
      <p>
        I contenuti dei corsi sono conformi al D.Lgs. 81/2008 e agli Accordi Stato-Regioni applicabili. Il programma
        pubblicato sul sito è quello ufficiale dell’ente erogatore.
      </p>
    </Sezione>

    <Sezione numero="4" titolo="Requisiti tecnici">
      <p>
        Per fruire dei corsi occorrono una connessione a internet stabile, un browser aggiornato e audio funzionante.
        La piattaforma è accessibile da computer, tablet e smartphone. Il Cliente è tenuto a verificare la
        disponibilità di tali requisiti prima dell’acquisto.
      </p>
    </Sezione>

    <Sezione numero="5" titolo="Prezzi">
      <p>
        I prezzi indicati sul sito sono espressi in euro, per singolo partecipante, e sono <strong>prezzi finali</strong>:
        non è dovuto alcun importo ulteriore a titolo di imposte, spese di segreteria o costi di attivazione.
      </p>
      <p>
        MB Consulting opera in regime forfettario: le operazioni non sono soggette a IVA ai sensi dell’art. 1,
        commi 54-89, della Legge 190/2014. L’indicazione «IVA compresa» presente sul sito va intesa nel senso che
        l’importo esposto è quello definitivamente dovuto dal Cliente.
      </p>
      <p>
        MB Consulting può modificare i prezzi in qualsiasi momento. Al singolo ordine si applica il prezzo esposto
        nel momento in cui l’ordine viene trasmesso.
      </p>
    </Sezione>

    <Sezione numero="6" titolo="Come si conclude il contratto">
      <p>
        Il Cliente compila il modulo di iscrizione indicando i dati di intestazione (azienda o privato) e i dati
        anagrafici di ciascun Partecipante, sceglie il metodo di pagamento e accetta le presenti condizioni.
        L’invio del modulo costituisce proposta d’ordine.
      </p>
      <p>
        Il contratto si intende concluso quando MB Consulting invia all’indirizzo email indicato dal Cliente la
        conferma dell’ordine, contenente il riepilogo dei corsi acquistati e il riferimento identificativo della
        pratica.
      </p>
      <p>
        MB Consulting si riserva di non dare seguito a ordini con dati manifestamente incompleti, errati o non
        verificabili, dandone comunicazione al Cliente e restituendo quanto eventualmente già pagato.
      </p>
    </Sezione>

    <Sezione numero="7" titolo="Pagamento">
      <p>Sono disponibili due modalità.</p>
      <Elenco
        voci={[
          'Carta di credito o debito, tramite il circuito di pagamento sicuro Stripe. MB Consulting non entra in possesso dei dati della carta, che sono trattati direttamente dal gestore del pagamento.',
          'Bonifico bancario. Gli estremi e il riferimento da indicare in causale vengono inviati via email al termine dell’ordine. Il bonifico va disposto entro 7 giorni: decorso tale termine senza accredito, l’ordine si intende decaduto.',
        ]}
      />
      <p>
        In caso di bonifico, l’iscrizione viene registrata immediatamente, ma i Partecipanti sono inseriti sulla
        piattaforma soltanto dopo l’accredito effettivo delle somme.
      </p>
      <p>
        Il documento fiscale viene emesso da MB Consulting e trasmesso tramite il Sistema di Interscambio ai dati di
        fatturazione elettronica indicati dal Cliente.
      </p>
    </Sezione>

    <Sezione numero="8" titolo="Attivazione del corso">
      <p>La procedura di attivazione si articola in tre passaggi.</p>
      <Elenco
        voci={[
          'Entro 24 ore lavorative dal pagamento (o dall’accredito del bonifico) MB Consulting inserisce i dati dei Partecipanti sulla piattaforma dell’ente erogatore.',
          'Ogni Partecipante riceve dalla piattaforma un’email di conferma dell’account all’indirizzo indicato in fase di iscrizione. L’indirizzo email del Partecipante costituisce anche il suo nome utente.',
          'Soltanto dopo che il Partecipante ha confermato il proprio account, il corso acquistato può essergli abbinato e reso disponibile.',
        ]}
      />
      <p>
        Il secondo passaggio dipende dal Partecipante: finché l’account non viene confermato, il corso non può essere
        attivato e il ritardo non è imputabile a MB Consulting. Si raccomanda di controllare anche la cartella della
        posta indesiderata.
      </p>
    </Sezione>

    <Sezione numero="9" titolo="Obblighi del Cliente">
      <Elenco
        voci={[
          'Fornire dati anagrafici esatti, completi e riferiti a persone realmente esistenti. Il codice fiscale e la data di nascita dei Partecipanti compaiono sull’attestato: un dato errato comporta un attestato errato.',
          'Indicare per ogni Partecipante un indirizzo email individuale, effettivamente accessibile e non condiviso con altri Partecipanti.',
          'Custodire le credenziali di accesso, che sono personali e non cedibili.',
          'Astenersi dal registrare, riprodurre, diffondere o rendere accessibile a terzi il materiale didattico, protetto dal diritto d’autore e concesso in uso esclusivamente per la fruizione individuale del corso.',
        ]}
      />
      <p>
        La frequenza deve essere effettuata personalmente dal Partecipante iscritto. La fruizione da parte di persona
        diversa comporta l’annullamento del percorso senza diritto a rimborso.
      </p>
    </Sezione>

    <Sezione numero="10" titolo="Attestato">
      <p>
        L’attestato è rilasciato al superamento del test finale e indica come soggetti formatori EFEI e A.U.G.E.
        Università – Ateneo delle Professioni, Dipartimento Salute e Sicurezza sul Lavoro. È verificabile tramite
        QR code ed è valido per il riconoscimento dei CFU secondo i regolamenti AUGE. È scaricabile direttamente dalla
        piattaforma, in qualsiasi momento successivo, nell’area riservata del Partecipante.
      </p>
      <p>
        MB Consulting non rilascia attestati e non interviene sulla valutazione. Il mancato superamento del test non
        dà diritto a rimborso; le eventuali ripetizioni della prova seguono le regole della piattaforma dell’ente
        erogatore.
      </p>
    </Sezione>

    <Sezione numero="11" titolo="Diritto di recesso del consumatore">
      <p>
        Le disposizioni di questo articolo si applicano esclusivamente al Cliente che sia <strong>consumatore</strong>,
        cioè persona fisica che agisce per scopi estranei alla propria attività imprenditoriale, commerciale,
        artigianale o professionale. Non si applicano agli acquisti effettuati da aziende, professionisti o enti,
        che costituiscono la generalità degli acquisti di formazione obbligatoria.
      </p>
      <p>
        Il consumatore ha diritto di recedere dal contratto entro 14 giorni dalla conclusione, senza dover fornire
        motivazione, comunicandolo a corsi@mariobruzzese.it. Il rimborso
        avviene entro 14 giorni dalla ricezione della comunicazione, con lo stesso mezzo di pagamento utilizzato.
      </p>
      <p>
        <strong>Perdita del diritto di recesso.</strong> Ai sensi dell’art. 59, comma 1, lett. o) del Codice del
        Consumo, il diritto di recesso si estingue quando l’esecuzione del servizio è iniziata con l’accordo espresso
        del consumatore e con la sua accettazione della perdita del diritto. Al momento dell’ordine il consumatore
        può chiedere l’attivazione immediata del corso: in tal caso dichiara espressamente di voler ricevere il
        servizio prima della scadenza dei 14 giorni e di perdere il diritto di recesso nel momento in cui il corso
        gli viene reso disponibile sulla piattaforma. Chi non presta tale dichiarazione vedrà il corso attivato alla
        scadenza del termine di recesso.
      </p>
    </Sezione>

    <Sezione numero="12" titolo="Reclami e assistenza">
      <p>
        Per qualsiasi problema relativo all’ordine, all’attivazione o alla fruizione del corso il Cliente può
        scrivere a corsi@mariobruzzese.it. MB Consulting risponde entro 5 giorni lavorativi e, quando la questione
        riguarda la piattaforma o la didattica, trasmette la segnalazione all’ente erogatore.
      </p>
      <p>
        Il consumatore può inoltre ricorrere alla piattaforma europea di risoluzione delle controversie online
        raggiungibile all’indirizzo ec.europa.eu/consumers/odr.
      </p>
    </Sezione>

    <Sezione numero="13" titolo="Responsabilità">
      <p>
        MB Consulting risponde della corretta trasmissione dei dati di iscrizione e dell’assistenza al Cliente. Non
        risponde dei contenuti didattici, del funzionamento della piattaforma, della validità dell’attestato e degli
        adempimenti che la legge pone a carico dell’ente erogatore.
      </p>
      <p>
        Nessuna delle parti risponde dei ritardi o degli inadempimenti dovuti a cause di forza maggiore, comprese
        interruzioni di rete, guasti dei sistemi informatici di terzi e provvedimenti dell’autorità.
      </p>
    </Sezione>

    <Sezione numero="14" titolo="Dati personali">
      <p>
        Il trattamento dei dati personali del Cliente e dei Partecipanti è descritto nell’
        <a href="/privacy" className="underline hover:text-black">informativa privacy</a>, che costituisce parte
        integrante delle presenti condizioni.
      </p>
    </Sezione>

    <Sezione numero="15" titolo="Legge applicabile e foro competente">
      <p>
        Il contratto è regolato dalla legge italiana. Per le controversie con un Cliente consumatore è competente in
        via esclusiva il foro del luogo di residenza o domicilio elettivo del consumatore. Per le controversie con
        Clienti che non siano consumatori è competente in via esclusiva il Foro di Reggio Calabria.
      </p>
      <p>
        L’eventuale invalidità di una singola clausola non pregiudica la validità delle restanti.
      </p>
    </Sezione>
  </DocumentoLegale>
);

export default CondizioniVendita;
