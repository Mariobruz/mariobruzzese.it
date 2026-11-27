import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Building2, Check, ChevronDown, Database, HardHat, Laptop, Loader2, Megaphone, Scale, Send, ShieldCheck,
  User, UtensilsCrossed, Award,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { WhatsAppFisso } from '../components/WhatsApp';

/**
 * Casi studio: la formazione finanziata come leva commerciale per professionisti,
 * studi e agenzie che vendono servizi alle aziende. Esempio ISO 9001 in evidenza,
 * sette casi espandibili e modulo di contatto in fondo con il settore precompilato.
 */
const FORMSPREE_URL = 'https://formspree.io/f/mwvwlyqd';
const MSG_WA = 'Ciao, ho un preventivo da presentare e vorrei capire se posso integrare la formazione finanziata.';

// I due casi storici restano nascosti finché risultati e importi non sono documentati.
const MOSTRA_PROGETTI_REALIZZATI = false;

const CASI = [
  {
    id: 'sicurezza-lavoro', titolo: 'Sicurezza sul lavoro', icona: HardHat, foto: 'sicurezza-lavoro',
    alt: 'Un formatore con due lavoratori con casco e occhiali in un reparto produttivo',
    breve: 'Affianca al DVR e alle procedure operative la formazione dei lavoratori, quando ammessa dal fondo.',
    servizio: 'Lo studio o l’RSPP esterno redige il documento di valutazione dei rischi, aggiorna le procedure operative e affianca il datore di lavoro negli adempimenti.',
    formazione: 'I lavoratori devono conoscere i rischi del proprio reparto e applicare le procedure. La formazione che il fondo ammette può entrare nel piano formativo finanziato, mentre MB Consulting ne cura la progettazione e l’erogazione.',
    vantaggio: 'Il preventivo resta focalizzato sulla consulenza. Se la formazione viene finanziata, l’azienda non la paga a parte e il professionista presenta un’offerta complessiva più leggera.',
  },
  {
    id: 'modello-231', titolo: 'Modello 231', icona: Scale, foto: 'modello-231',
    alt: 'Una consulente che illustra i protocolli a un gruppo di colleghi davanti a un portatile',
    breve: 'Prepara i dipendenti ad applicare i protocolli che il tuo studio ha definito.',
    servizio: 'Lo studio mappa i rischi di reato, redige il Modello di organizzazione, gestione e controllo e i protocolli, e supporta l’organismo di vigilanza.',
    formazione: 'Il Modello funziona solo se le persone conoscono i protocolli e sanno come comportarsi. La formazione sulle procedure può rientrare in un piano finanziato e viene erogata da MB Consulting.',
    vantaggio: 'L’azienda riceve il Modello e la formazione che lo rende efficace, con una spesa complessiva più bassa. Il compenso dello studio per la redazione del Modello non cambia.',
  },
  {
    id: 'siti-web', titolo: 'Siti web ed e-commerce', icona: Laptop, foto: 'siti-web',
    alt: 'Uno sviluppatore che mostra il negozio online a un’addetta, con i prodotti sul tavolo',
    breve: 'Consegna il sito e forma il team che aggiornerà pagine, catalogo e ordini.',
    servizio: 'L’agenzia progetta e realizza il sito o lo shop online: struttura, grafica, catalogo prodotti, pagamenti e spedizioni.',
    formazione: 'Dopo la consegna qualcuno in azienda deve aggiornare le pagine, inserire i prodotti e gestire gli ordini. Questa formazione pratica può rientrare in un piano finanziato.',
    vantaggio: 'Il cliente ottiene un sito che il suo team sa usare da subito e spende meno sul progetto complessivo. L’agenzia mantiene il proprio prezzo per lo sviluppo.',
  },
  {
    id: 'marketing', titolo: 'Marketing e comunicazione', icona: Megaphone, foto: 'marketing',
    alt: 'Un team che lavora sui materiali di una campagna, con fotografie sul tavolo',
    breve: 'Affianca alla strategia la formazione di chi gestirà contenuti, contatti e risultati.',
    servizio: 'L’agenzia definisce la strategia, il piano editoriale e le campagne, e imposta gli strumenti per misurare i risultati.',
    formazione: 'Le persone dell’azienda che curano contenuti, social e contatti commerciali hanno bisogno di competenze per portare avanti il lavoro. La formazione può entrare in un piano finanziato.',
    vantaggio: 'La strategia viene applicata meglio perché il team è preparato, e il cliente sostiene una spesa complessiva inferiore. Il compenso dell’agenzia resta invariato.',
  },
  {
    id: 'gestionali-crm', titolo: 'Software gestionali e CRM', icona: Database, foto: 'gestionali-crm',
    alt: 'Un formatore che mostra al team la schermata di un gestionale',
    breve: 'Configura il software e prepara le persone che lo useranno ogni giorno.',
    servizio: 'Il fornitore o il consulente installa e configura il gestionale o il CRM, importa i dati e adatta i flussi di lavoro all’azienda.',
    formazione: 'Un software nuovo dà risultati solo se gli utenti lo usano bene. La formazione degli utenti può rientrare in un piano finanziato, progettato ed erogato da MB Consulting.',
    vantaggio: 'L’adozione del software è più rapida e il cliente risparmia sulla formazione. Il fornitore mantiene il compenso per licenze e configurazione.',
  },
  {
    id: 'privacy', titolo: 'Privacy e protezione dei dati', icona: ShieldCheck, foto: 'privacy',
    alt: 'Una formatrice che spiega a un gruppo di colleghi come condividere i documenti in sicurezza',
    breve: 'Affianca alle procedure privacy la formazione di chi deve applicarle.',
    servizio: 'Il consulente privacy redige registri, informative, nomine e procedure, e accompagna l’azienda nell’adeguamento al Regolamento europeo.',
    formazione: 'Il personale autorizzato al trattamento dei dati deve essere formato sulle procedure e sulla sicurezza delle informazioni. Questa formazione può rientrare in un piano finanziato.',
    vantaggio: 'L’azienda documenta anche la formazione del personale, con una spesa complessiva più bassa. Il compenso del consulente per l’adeguamento non cambia.',
  },
  {
    id: 'haccp', titolo: 'HACCP e sicurezza alimentare', icona: UtensilsCrossed, foto: 'haccp',
    alt: 'Una formatrice che misura la temperatura di un piatto davanti agli addetti di cucina',
    breve: 'Integra il piano di autocontrollo con la formazione pratica degli addetti.',
    servizio: 'Il tecnologo o il consulente redige il piano di autocontrollo HACCP, imposta schede e registrazioni e verifica le procedure in cucina e in produzione.',
    formazione: 'Gli addetti devono applicare ogni giorno le procedure del piano: temperature, pulizie, tracciabilità. La formazione pratica, quando ammessa dal fondo, può entrare nel piano finanziato.',
    vantaggio: 'Il cliente ottiene un piano applicato davvero e spende meno sul progetto complessivo. Il consulente mantiene il compenso per il piano di autocontrollo.',
  },
];

const SETTORI = ['ISO 9001', ...CASI.map((c) => c.titolo), 'Altro'];

const ATTORI = [
  { icona: User, titolo: 'Il professionista', testo: 'Presenti un’offerta più competitiva e hai un argomento in più per acquisire il cliente. Il compenso per il tuo servizio resta invariato.' },
  { icona: Building2, titolo: 'L’azienda', testo: 'Riceve lo stesso servizio e forma il personale. Se ottiene il finanziamento, sostiene una spesa complessiva inferiore.' },
  { icona: null, titolo: 'MB Consulting', testo: 'Verifichiamo se la formazione è finanziabile, gestiamo il piano ed eroghiamo la formazione concordata.' },
];

const PASSI = [
  { titolo: 'Ci presenti il progetto', testo: 'Ci dici quale servizio vuoi proporre, chi è l’azienda cliente e quali persone dovranno essere formate.' },
  { titolo: 'Verifichiamo le possibilità di finanziamento', testo: 'Valutiamo con l’azienda il fondo, lo strumento disponibile e le attività che possono rientrare nel piano.' },
  { titolo: 'Integra la formazione nella tua proposta', testo: 'Tu definisci il preventivo per il tuo servizio. MB Consulting definisce il percorso formativo e, se il piano è approvato, ne gestisce l’erogazione.' },
];

const PROGETTI_REALIZZATI = [
  { titolo: 'Azienda manifatturiera — Lombardia', settore: 'Metalmeccanico', testo: 'Piano formativo su Industria 4.0 e digitalizzazione dei processi produttivi per 25 dipendenti.', risultati: ['45.000 € di formazione finanziata', '150 ore di formazione'] },
  { titolo: 'Struttura ricettiva — Reggio Calabria', settore: 'Turismo e ospitalità', testo: 'Formazione dello staff su accoglienza, inglese professionale e marketing digitale.', risultati: ['35.000 € di finanziamento', '18 operatori formati'] },
];

const scorri = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const btnVerde = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f8a6a] text-white font-bold px-6 py-3 hover:bg-[#0c7458] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f8a6a] transition-colors';

function Foto({ nome, alt, className = '' }) {
  return (
    <img src={`/img/casi-studio/${nome}.webp`} srcSet={`/img/casi-studio/${nome}-720.webp 720w, /img/casi-studio/${nome}.webp 1200w`}
      sizes="(min-width: 1024px) 600px, 100vw" alt={alt} width="1200" height="800" loading="lazy"
      className={`w-full h-full object-cover ${className}`} />
  );
}

function Dettaglio({ caso, onContatto }) {
  return (
    <motion.div id={`dettaglio-${caso.id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25 }} className="overflow-hidden">
      <div className="mt-5 space-y-4 border-t border-gray-100 pt-5 text-gray-700 leading-relaxed">
        <div><h4 className="font-bold text-gray-900 mb-1">Il servizio del professionista</h4><p>{caso.servizio}</p></div>
        <div className="rounded-lg bg-[#e3f7ec] p-4"><h4 className="font-bold text-[#0b5e48] mb-1">La formazione del personale</h4><p>{caso.formazione}</p></div>
        <div><h4 className="font-bold text-gray-900 mb-1">Il vantaggio sul preventivo</h4><p>{caso.vantaggio}</p></div>
        <button type="button" onClick={() => onContatto(caso.titolo)} className={btnVerde}>
          Valuta un progetto simile <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function SchedaCaso({ caso, aperto, onToggle, onContatto, larga }) {
  const Icona = caso.icona;
  return (
    <article className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden ${larga ? 'md:col-span-2' : ''}`}>
      <div className={larga ? 'md:grid md:grid-cols-2' : ''}>
        <div className={`aspect-[3/2] ${larga ? 'md:aspect-auto md:min-h-[320px]' : ''}`}>
          <Foto nome={caso.foto} alt={caso.alt} />
        </div>
        <div className={`p-6 ${larga ? 'md:flex md:flex-col md:justify-center md:p-10' : ''}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e3f7ec] text-[#0f8a6a]"><Icona className="w-5 h-5" /></span>
            <h3 className="text-2xl font-bold text-gray-900 leading-tight">{caso.titolo}</h3>
          </div>
          <p className="mt-3 text-gray-700 leading-relaxed">{caso.breve}</p>
          <button type="button" onClick={onToggle} aria-expanded={aperto} aria-controls={`dettaglio-${caso.id}`}
            className="mt-4 inline-flex items-center gap-2 font-bold text-[#0f8a6a] hover:text-[#0b5e48] rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0f8a6a]">
            {aperto ? 'Chiudi l’esempio' : 'Vedi l’esempio'}
            <ChevronDown className={`w-4 h-4 transition-transform ${aperto ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>{aperto && <Dettaglio caso={caso} onContatto={onContatto} />}</AnimatePresence>
        </div>
      </div>
    </article>
  );
}

function ModuloContatto({ settore, setSettore, campoRef }) {
  const vuoto = { nome: '', email: '', telefono: '', azienda: '', descrizione: '' };
  const [dati, setDati] = useState(vuoto);
  const [trappola, setTrappola] = useState('');
  const [errori, setErrori] = useState({});
  const [stato, setStato] = useState({ fase: 'pronto', messaggio: '' });
  const aggiorna = (k) => (e) => { setDati((d) => ({ ...d, [k]: e.target.value })); if (errori[k]) setErrori((x) => ({ ...x, [k]: '' })); };

  const invia = async (e) => {
    e.preventDefault();
    const err = {};
    if (dati.nome.trim().length < 2) err.nome = 'Inserisci nome e cognome';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dati.email.trim())) err.email = 'Inserisci un indirizzo email valido';
    if (dati.descrizione.trim().length < 10) err.descrizione = 'Descrivi in poche righe il servizio e la formazione da valutare';
    if (dati.descrizione.length > 2000) err.descrizione = 'Massimo 2000 caratteri';
    setErrori(err);
    if (Object.keys(err).length) return;
    if (trappola) { setStato({ fase: 'inviato', messaggio: '' }); return; }
    setStato({ fase: 'invio', messaggio: '' });
    try {
      const r = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: dati.nome.trim(), email: dati.email.trim(), phone: dati.telefono.trim(), company: dati.azienda.trim(),
          settore: settore || 'Non indicato',
          message: `Settore del progetto: ${settore || 'non indicato'}\n\n${dati.descrizione.trim()}`,
          source: 'professionisti', _subject: `Formula win-win — progetto ${settore || 'da valutare'}`,
        }),
      });
      if (!r.ok) throw new Error();
      setStato({ fase: 'inviato', messaggio: '' });
      setDati(vuoto);
    } catch {
      setStato({ fase: 'errore', messaggio: 'Invio non riuscito. Riprova o scrivici su WhatsApp.' });
    }
  };

  if (stato.fase === 'inviato') {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-gray-800" role="status">
        <Check className="mx-auto w-10 h-10 text-[#0f8a6a]" />
        <h3 className="mt-3 text-2xl font-bold text-gray-900">Richiesta inviata</h3>
        <p className="mt-2">Ti rispondiamo entro un giorno lavorativo per una prima valutazione del progetto.</p>
      </div>
    );
  }

  const input = (k) => `mt-1 w-full rounded-lg border-2 ${errori[k] ? 'border-rose-500' : 'border-gray-300'} bg-white px-3 py-2.5 text-gray-900 focus:border-[#0f8a6a] focus:outline-none`;
  return (
    <form onSubmit={invia} noValidate className="rounded-2xl bg-white p-6 sm:p-8 text-gray-800 grid gap-4 sm:grid-cols-2">
      <label className="block sm:col-span-2">
        <span className="text-sm font-bold">Settore del progetto</span>
        <select ref={campoRef} value={settore} onChange={(e) => setSettore(e.target.value)} className={input('settore')}>
          <option value="">Seleziona il settore</option>
          {SETTORI.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-bold">Nome e cognome <span className="text-rose-500">*</span></span>
        <input value={dati.nome} onChange={aggiorna('nome')} autoComplete="name" className={input('nome')} aria-invalid={!!errori.nome} />
        {errori.nome && <span className="text-sm text-rose-600">{errori.nome}</span>}
      </label>
      <label className="block">
        <span className="text-sm font-bold">Studio o agenzia</span>
        <input value={dati.azienda} onChange={aggiorna('azienda')} autoComplete="organization" className={input('azienda')} />
      </label>
      <label className="block">
        <span className="text-sm font-bold">Email <span className="text-rose-500">*</span></span>
        <input type="email" value={dati.email} onChange={aggiorna('email')} autoComplete="email" className={input('email')} aria-invalid={!!errori.email} />
        {errori.email && <span className="text-sm text-rose-600">{errori.email}</span>}
      </label>
      <label className="block">
        <span className="text-sm font-bold">Telefono</span>
        <input type="tel" value={dati.telefono} onChange={aggiorna('telefono')} autoComplete="tel" className={input('telefono')} />
      </label>
      <label className="block sm:col-span-2">
        <span className="text-sm font-bold">Descrivi il servizio e la formazione da valutare <span className="text-rose-500">*</span></span>
        <textarea rows={5} value={dati.descrizione} onChange={aggiorna('descrizione')} className={input('descrizione')} aria-invalid={!!errori.descrizione}
          placeholder="Es. certificazione ISO 9001 per un’azienda di 30 dipendenti; da formare 6 persone su documentazione e non conformità." />
        {errori.descrizione && <span className="text-sm text-rose-600">{errori.descrizione}</span>}
      </label>
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" value={trappola} onChange={(e) => setTrappola(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
      <p className="sm:col-span-2 text-sm text-gray-600">
        Non serve allegare il preventivo per una prima valutazione. Inviando la richiesta dichiari di aver letto l’
        <Link to="/privacy" target="_blank" className="underline font-semibold">informativa privacy</Link>.
      </p>
      {stato.fase === 'errore' && <p className="sm:col-span-2 text-rose-600 font-semibold" role="alert">{stato.messaggio}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={stato.fase === 'invio'} className={`${btnVerde} w-full sm:w-auto text-lg px-8 disabled:opacity-60`}>
          {stato.fase === 'invio' ? <><Loader2 className="w-5 h-5 animate-spin" /> Invio in corso…</> : <><Send className="w-5 h-5" /> Invia la richiesta</>}
        </button>
      </div>
    </form>
  );
}

const CaseStudies = () => {
  const [aperto, setAperto] = useState(null);
  const [settore, setSettore] = useState('');
  const [moduloAperto, setModuloAperto] = useState(false);
  const campoRef = useRef(null);

  const vaiAlContatto = (s) => {
    if (s !== undefined) setSettore(s);
    setModuloAperto(true);
    setTimeout(() => { scorri('contatto'); campoRef.current?.focus({ preventScroll: true }); }, 60);
  };

  const schema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'WebPage', name: 'Per i professionisti — la formula win-win della formazione finanziata',
    url: 'https://www.mariobruzzese.it/professionisti',
  });

  return (
    <div className="bg-white">
      <WhatsAppFisso testo={MSG_WA} />
      <SEOHead
        title="Per i professionisti | La formula win-win della formazione finanziata"
        description="Scopri come integrare la formazione finanziata nei tuoi progetti e rendere più competitivi i preventivi per ISO, sicurezza, Modello 231, siti web e altri servizi."
        canonical="https://www.mariobruzzese.it/professionisti"
        schema={schema}
      />

      {/* ------------------------------------------------ apertura */}
      <section className="pt-28">
        <div className="grid lg:grid-cols-2 bg-[#0f2742] lg:min-h-[460px]">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
            className="px-6 sm:px-12 lg:pl-[max(3rem,calc((100vw-80rem)/2+1.5rem))] py-14 lg:py-16 flex flex-col justify-center text-white">
            <p className="mb-4 inline-flex w-fit items-center rounded-full bg-[#0f8a6a] px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-white">La formula win-win</p>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.05]">Più clienti, senza regalare la formazione</h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-100 max-w-xl">
              Rendi più competitivo il tuo preventivo mantenendo il tuo compenso. Se il fondo copre la formazione del personale, l’azienda ottiene
              lo stesso servizio e spende meno per il progetto complessivo.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <button type="button" onClick={() => vaiAlContatto()} className={`${btnVerde} text-lg px-7 py-3.5`}>Valutiamo un tuo preventivo</button>
              <button type="button" onClick={() => scorri('iso-9001')} className="text-lg font-semibold underline underline-offset-8 decoration-2 hover:text-[#86efb4]">Guarda gli esempi</button>
            </div>
          </motion.div>
          <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden lg:[clip-path:polygon(12%_0,100%_0,100%_100%,0_100%)]">
            <img src="/img/casi-studio/hero-m.webp" alt="Un consulente mostra un preventivo a una imprenditrice su un tablet" width="492" height="377"
              className="absolute inset-0 w-full h-full object-cover object-[30%_center]" />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        {/* ------------------------------------------------ tre schede */}
        <section className="pt-14">
          <p className="text-sm font-bold uppercase tracking-wider text-[#0f8a6a]">La formula win-win</p>
          <h2 className="mt-1 text-3xl sm:text-4xl font-bold text-gray-900">Un vantaggio per tutti e tre</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {ATTORI.map((a, i) => {
              const Icona = a.icona;
              const mb = i === 2;
              return (
                <div key={a.titolo} className={`rounded-2xl border p-6 shadow-sm ${mb ? 'border-[#0f8a6a] bg-[#f1fbf5]' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d5f3e1] text-[#0f8a6a] font-bold">
                      {Icona ? <Icona className="w-6 h-6" /> : 'MB'}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900">{a.titolo}</h3>
                  </div>
                  <p className="mt-3 text-gray-700 leading-relaxed">{a.testo}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------ ISO 9001 */}
        <section id="iso-9001" className="pt-16 scroll-mt-28">
          <div className="rounded-3xl border border-gray-200 bg-white shadow-lg overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="aspect-[3/2] lg:aspect-auto lg:min-h-[340px]">
                <Foto nome="iso-9001" alt="Una responsabile qualità e un capo reparto controllano la documentazione vicino alla linea produttiva" />
              </div>
              <div className="p-6 sm:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-[#0f8a6a] font-bold uppercase tracking-wide text-sm"><Award className="w-5 h-5" /> Caso principale</div>
                <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">ISO 9001 · Un esempio di preventivo</h2>
                <p className="mt-4 text-gray-700 text-lg leading-relaxed">
                  Un consulente prepara l’impresa alla certificazione ISO 9001. L’azienda deve anche formare le persone che gestiranno la documentazione,
                  le non conformità e le azioni correttive. MB Consulting verifica se il fondo può coprire questa formazione, mentre il consulente mantiene
                  il proprio incarico.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-10 border-t border-gray-100">
              {/* mobile: due riquadri a confronto */}
              <div className="grid gap-4 sm:hidden">
                {[
                  { t: 'Spesa senza contributo', f: '2.000 €', tot: '6.000 €', verde: false },
                  { t: 'Spesa con copertura integrale della formazione', f: '0 €', tot: '4.000 €', verde: true },
                ].map((x) => (
                  <div key={x.t} className={`rounded-2xl p-5 ${x.verde ? 'bg-[#c9f2dc] text-[#0b5e48]' : 'border border-gray-200'}`}>
                    <p className="font-bold">{x.t}</p>
                    <dl className="mt-3 space-y-1 text-gray-800">
                      <div className="flex justify-between gap-3"><dt>Consulenza ISO e certificazione</dt><dd className="whitespace-nowrap">4.000 €</dd></div>
                      <div className="flex justify-between gap-3"><dt>Formazione del personale</dt><dd className="whitespace-nowrap font-semibold">{x.f}</dd></div>
                    </dl>
                    <p className="mt-3 text-sm font-semibold">Totale a carico dell’azienda</p>
                    <p className="text-4xl font-bold">{x.tot}</p>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-sm text-gray-600">
                      <th className="py-3 pr-4 font-semibold">Voce</th>
                      <th className="py-3 px-4 font-semibold text-right">Spesa senza contributo</th>
                      <th className="py-3 pl-4 font-semibold text-right text-[#0b5e48]">Spesa con copertura integrale della formazione</th>
                    </tr>
                  </thead>
                  <tbody className="text-lg">
                    <tr className="border-t border-gray-100">
                      <td className="py-3 pr-4">Consulenza ISO e certificazione</td>
                      <td className="py-3 px-4 text-right">4.000 €</td>
                      <td className="py-3 pl-4 text-right">4.000 €</td>
                    </tr>
                    <tr className="border-t border-gray-100 bg-[#f1fbf5]">
                      <td className="py-3 pr-4 pl-2">Formazione del personale</td>
                      <td className="py-3 px-4 text-right">2.000 €</td>
                      <td className="py-3 pl-4 pr-2 text-right font-bold text-[#0b5e48]">0 €</td>
                    </tr>
                    <tr className="border-t-2 border-gray-300">
                      <td className="py-4 pr-4 font-bold">Totale a carico dell’azienda</td>
                      <td className="py-4 px-4 text-right text-2xl font-bold">6.000 €</td>
                      <td className="py-4 pl-4 text-right">
                        <span className="inline-block rounded-xl bg-[#c9f2dc] px-4 py-2 text-3xl font-bold text-[#0b5e48]">4.000 €</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#0f2742] px-4 py-2 text-white font-semibold">
                  <Check className="w-4 h-4 text-[#86efb4]" /> Compenso del professionista invariato
                </span>
                <button type="button" onClick={() => vaiAlContatto('ISO 9001')} className={btnVerde}>Valuta un progetto ISO <ArrowRight className="w-4 h-4" /></button>
              </div>
              <p className="mt-5 text-sm text-gray-500 italic">
                Esempio illustrativo. La copertura dipende dallo strumento disponibile, dall’ammissibilità delle attività e dall’approvazione del piano formativo.
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ altri casi */}
        <section className="pt-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">La stessa formula, altri progetti</h2>
          <p className="mt-2 text-lg text-gray-600">Scopri come integrare la formazione nel servizio che già proponi ai tuoi clienti.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 items-start">
            {CASI.map((c, i) => (
              <SchedaCaso key={c.id} caso={c} larga={i === CASI.length - 1} aperto={aperto === c.id}
                onToggle={() => setAperto(aperto === c.id ? null : c.id)} onContatto={vaiAlContatto} />
            ))}
          </div>
        </section>
      </div>

      {/* ------------------------------------------------ come funziona */}
      <section className="mt-16 bg-[#eef8f2] py-14">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Come funziona la collaborazione</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {PASSI.map((p, i) => (
              <li key={p.titolo} className="rounded-2xl bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f8a6a] text-white font-bold text-lg">{i + 1}</span>
                <h3 className="mt-4 text-xl font-bold text-gray-900">{p.titolo}</h3>
                <p className="mt-2 text-gray-700 leading-relaxed">{p.testo}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {MOSTRA_PROGETTI_REALIZZATI && (
        <section className="max-w-6xl mx-auto px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Progetti realizzati</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {PROGETTI_REALIZZATI.map((p) => (
              <div key={p.titolo} className="rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900">{p.titolo}</h3>
                <p className="text-sm text-gray-500">{p.settore}</p>
                <p className="mt-2 text-gray-700">{p.testo}</p>
                <ul className="mt-3 space-y-1">{p.risultati.map((r) => <li key={r} className="flex gap-2"><Check className="w-5 h-5 text-[#0f8a6a]" />{r}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------ contatto */}
      <section id="contatto" className="bg-[#0f2742] text-white scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold">Hai già un preventivo da presentare?</h2>
              <p className="mt-3 text-lg text-gray-200">
                Raccontaci quale servizio stai proponendo e chi dovrà essere formato. Verifichiamo se puoi integrare la formazione nel progetto e
                ridurre la spesa a carico del cliente.
              </p>
            </div>
            {!moduloAperto && (
              <button type="button" onClick={() => vaiAlContatto()} aria-expanded={moduloAperto} aria-controls="modulo-progetto"
                className="shrink-0 rounded-lg bg-[#c9f2dc] text-[#0f2742] font-bold text-lg px-8 py-3.5 hover:bg-[#b3ecce] transition-colors">
                Parliamo del progetto
              </button>
            )}
          </div>
          <AnimatePresence initial={false}>
            {moduloAperto && (
              <motion.div id="modulo-progetto" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="mt-8"><ModuloContatto settore={settore} setSettore={setSettore} campoRef={campoRef} /></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default CaseStudies;
