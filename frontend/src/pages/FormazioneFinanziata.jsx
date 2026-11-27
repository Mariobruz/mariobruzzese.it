import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Award, Calculator, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ClipboardCheck, Clock, Cpu,
  GraduationCap, Languages, Laptop, Layers, Leaf, Lightbulb, Lock, Megaphone, MessageSquare, Network, Search, Send,
  Settings, ShieldCheck, Sparkles, TrendingUp, Users, X,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { WhatsAppFisso } from '../components/WhatsApp';
import { CORSI_FINANZIATI, TEMI_FINANZIATI } from '../data/catalogoFinanziato';
import { province } from '../data/province';
import { validaAteco, validaCap, validaEmail, validaPartitaIva, validaTelefono } from '../lib/validazione';

/**
 * Formazione finanziata: catalogo dei corsi che l'azienda aderente al fondo
 * interprofessionale può fare senza pagarli, con richiesta di adesione in due passi
 * (1. scegli i corsi, 2. dati aziendali). Nessun pagamento: i dati vanno al Worker
 * (/prenotazioni) e nel pannello admin.
 */
const ENDPOINT = process.env.REACT_APP_ISCRIZIONI_URL;
const MSG_WA = 'Ciao, vorrei informazioni sui corsi di formazione finanziata per la mia azienda.';

// riquadri delle 4 aree (classi scritte per intero: Tailwind le deve trovare nel codice)
const TILE = {
  generale: { icona: GraduationCap, classe: 'bg-[#dff1e3] hover:bg-[#cfe9d5]' },
  digitale: { icona: Laptop, classe: 'bg-[#dbe8f2] hover:bg-[#c9dcec]' },
  innovazione: { icona: Settings, classe: 'bg-[#fde3d1] hover:bg-[#fbd3b8]' },
  organizzazione: { icona: Users, classe: 'bg-[#e6def4] hover:bg-[#d8cdee]' },
};
const ICONA_AREA = {
  Sicurezza: ShieldCheck, 'Intelligenza artificiale': Sparkles, Marketing: Megaphone, Lingue: Languages,
  'Organizzazione aziendale': Network, 'Amministrazione e contabilità': Calculator, 'Privacy e sicurezza informatica': Lock,
  Qualità: Award, Innovazione: Lightbulb, Sostenibilità: Leaf, 'Abilità personali': Users, 'Economia e imprenditorialità': TrendingUp,
  Informatica: Cpu, Comunicazione: MessageSquare, Scuola: GraduationCap,
};
const AREE = [...new Set(CORSI_FINANZIATI.map((c) => c.area))].sort((a, b) => a.localeCompare(b, 'it'));
const conta = (filtro) => CORSI_FINANZIATI.filter(filtro).length;
const nomeTema = (id) => (TEMI_FINANZIATI.find((t) => t.id === id) || {}).nome || '';
const DURATE = [
  { id: '', nome: 'Tutte le durate', ok: () => true },
  { id: 'brevi', nome: 'Fino a 8 ore', ok: (o) => o <= 8 },
  { id: 'medi', nome: 'Da 9 a 24 ore', ok: (o) => o > 8 && o <= 24 },
  { id: 'lunghi', nome: 'Oltre 24 ore', ok: (o) => o > 24 },
];
const PASSI_COME = [
  { icona: Layers, titolo: 'Scegli i corsi', testo: 'Seleziona i corsi più adatti alle esigenze della tua azienda.' },
  { icona: Send, titolo: 'Invia la richiesta', testo: 'Ci comunichi il tuo piano formativo con un clic.' },
  { icona: Search, titolo: 'Verifichiamo i requisiti', testo: 'Controlliamo l’adesione e la finanziabilità con FonARCom.' },
  { icona: CalendarDays, titolo: 'Avviamo la formazione', testo: 'Organizziamo i corsi e gestiamo tutte le pratiche, fino alla chiusura.' },
];
const DOMANDE = [
  ['Chi può usufruire dei corsi finanziati da FonARCom?', 'Le aziende con dipendenti aderenti a FonARCom. Se la tua azienda non aderisce ancora, ti spieghiamo come fare: l’adesione si comunica all’INPS e non comporta costi aggiuntivi.'],
  ['Quanto costa all’azienda?', 'I corsi sono finanziati dal fondo interprofessionale a cui l’azienda versa già i contributi tramite l’INPS: l’azienda non paga i corsi.'],
  ['Come si costruisce un piano formativo?', 'Scegli i corsi dal catalogo e indica quanti dipendenti partecipano a ciascuno. Dopo la richiesta verifichiamo i requisiti e prepariamo con te il piano: corsi, partecipanti, calendario e modalità.'],
  ['La richiesta è un’iscrizione definitiva?', 'No. È una richiesta di adesione senza impegno: dopo l’invio ti contattiamo per verificare i requisiti e concordare i dettagli.'],
  ['Dove si trova la matricola INPS?', 'È il codice di 10 caratteri dell’azienda presso l’INPS: lo trovi sul cassetto previdenziale o te lo indica il tuo consulente del lavoro. Se non lo hai a portata di mano puoi lasciarlo vuoto.'],
  ['I corsi di sicurezza obbligatoria ci sono?', 'Sì, nella formazione generale trovi anche corsi sulla sicurezza sul lavoro. Se ti serve un corso subito, senza attendere i tempi del piano formativo, puoi acquistarlo online nella sezione Corsi sicurezza.'],
];
const VUOTA = {
  ragioneSociale: '', partitaIva: '', codiceFiscale: '', matricolaInps: '', ateco: '', dipendenti: '', indirizzo: '', cap: '', citta: '', provincia: '',
  referente: '', ruolo: '', email: '', pec: '', telefono: '', fonarcom: '', modalita: 'indifferente', periodo: '', note: '',
};
const campagnaDaUrl = () => {
  if (typeof window === 'undefined') return '';
  const q = new URLSearchParams(window.location.search);
  return (q.get('campagna') || q.get('utm_campaign') || '').replace(/[^\w.-]/g, '').slice(0, 60);
};
const scorri = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

// titoli in sans-serif pesante, come nel progetto grafico (il resto del sito usa il serif)
const STILE_PAGINA = `
.ff h1,.ff h2,.ff h3,.ff legend{font-family:'Lato',sans-serif;letter-spacing:-0.02em}
.ff input[type=number]::-webkit-inner-spin-button{opacity:1}
`;

function Campo({ label, nome, valore, onChange, errore, tipo = 'text', placeholder, obbligatorio, larghezza = '', maiuscolo, aiuto }) {
  return (
    <label className={`block ${larghezza}`}>
      <span className="block text-sm font-bold text-gray-800 mb-1.5">{label}{obbligatorio && <span className="text-rose-500"> *</span>}</span>
      <input
        type={tipo} name={nome} value={valore} placeholder={placeholder}
        onChange={(e) => onChange(nome, maiuscolo ? e.target.value.toUpperCase() : e.target.value)}
        className={`w-full rounded-lg border-2 px-3.5 py-2.5 text-[15px] bg-white outline-none transition-colors ${errore ? 'border-red-400' : 'border-gray-300 focus:border-[#0f2e2c]'}`}
      />
      {errore ? <span className="block text-sm text-red-600 mt-1">{errore}</span> : aiuto && <span className="block text-xs text-gray-500 mt-1">{aiuto}</span>}
    </label>
  );
}

function Tendina({ etichetta, valore, onChange, opzioni }) {
  return (
    <label className="relative flex items-center rounded-lg border-2 border-gray-300 bg-white focus-within:border-[#0f2e2c]">
      <span className="pl-3 text-sm font-bold text-gray-900 whitespace-nowrap">{etichetta}:</span>
      <select value={valore} onChange={(e) => onChange(e.target.value)} aria-label={etichetta}
        className="appearance-none bg-transparent pl-1.5 pr-9 py-2.5 text-sm text-gray-700 outline-none w-full cursor-pointer">
        {opzioni.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-3 pointer-events-none" />
    </label>
  );
}

function Passi({ passo }) {
  const voci = ['Scegli i corsi', 'Dati dell’azienda', 'Richiesta inviata'];
  return (
    <ol className="flex items-center gap-3 mb-6">
      {voci.map((v, i) => {
        const n = i + 1; const ora = passo === n; const fatto = passo > n;
        return (
          <li key={v} className={`flex items-center gap-3 ${n < voci.length ? 'flex-1' : ''}`}>
            <span className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold border-2 ${ora || fatto ? 'bg-[#86efb4] border-[#86efb4] text-[#0f2e2c]' : 'border-gray-400 text-gray-500'}`}>
              {fatto ? <Check className="w-5 h-5" /> : n}
            </span>
            <span className={`text-sm sm:text-base whitespace-nowrap ${ora ? 'font-bold text-gray-900' : 'text-gray-600 hidden sm:inline'}`}>{v}</span>
            {n < voci.length && <span className="flex-1 h-px bg-gray-300 min-w-4" />}
          </li>
        );
      })}
    </ol>
  );
}

export default function FormazioneFinanziata() {
  const [passo, setPasso] = useState(1); // 1 catalogo, 2 dati, 3 fatto
  const [cerca, setCerca] = useState('');
  const [tema, setTema] = useState('');
  const [area, setArea] = useState('');
  const [durata, setDurata] = useState('');
  const [scelti, setScelti] = useState({}); // id -> partecipanti
  const [azienda, setAzienda] = useState(VUOTA);
  const [privacy, setPrivacy] = useState(false);
  const [trappola, setTrappola] = useState('');
  const [errori, setErrori] = useState({});
  const [invio, setInvio] = useState({ stato: 'pronto', messaggio: '', riferimento: '' });
  const [pianoAperto, setPianoAperto] = useState(false); // pannello del piano su telefono
  const [mostrati, setMostrati] = useState(20);

  const filtrati = useMemo(() => {
    const q = cerca.trim().toLowerCase();
    const okDurata = (DURATE.find((d) => d.id === durata) || DURATE[0]).ok;
    return CORSI_FINANZIATI.filter((c) => (!tema || c.tema === tema) && (!area || c.area === area) && okDurata(c.ore)
      && (!q || c.titolo.toLowerCase().includes(q) || c.area.toLowerCase().includes(q)));
  }, [cerca, tema, area, durata]);
  useEffect(() => { setMostrati(20); }, [cerca, tema, area, durata]);

  const selezione = CORSI_FINANZIATI.filter((c) => scelti[c.id]);
  const totPartecipanti = selezione.reduce((s, c) => s + scelti[c.id], 0);
  const totOre = selezione.reduce((s, c) => s + c.ore, 0);
  const aggiungi = (id) => setScelti((s) => ({ ...s, [id]: s[id] || 1 }));
  const togli = (id) => setScelti((s) => { const n = { ...s }; delete n[id]; return n; });
  const imposta = (id, n) => setScelti((s) => ({ ...s, [id]: Math.min(200, Math.max(1, n || 1)) }));
  const aggiornaAzienda = (k, v) => { setAzienda((a) => ({ ...a, [k]: v })); setErrori((e) => ({ ...e, [k]: undefined })); };
  const filtriAttivi = Boolean(cerca || tema || area || durata);
  const azzera = () => { setCerca(''); setTema(''); setArea(''); setDurata(''); };
  const scegliTema = (id) => { setTema(id); setArea(''); setPasso(1); scorri('catalogo'); };
  const vaiAiDati = () => { if (!selezione.length) return; setPianoAperto(false); setPasso(2); setTimeout(() => scorri('catalogo'), 30); };
  const tornaAlCatalogo = () => { setPasso(1); setTimeout(() => scorri('catalogo'), 30); };

  useEffect(() => { document.body.style.overflow = pianoAperto ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [pianoAperto]);

  const valida = () => {
    const a = azienda;
    const e = {};
    if (!a.ragioneSociale.trim()) e.ragioneSociale = 'Obbligatoria';
    e.partitaIva = validaPartitaIva(a.partitaIva) || undefined;
    if (a.codiceFiscale && !/^([0-9]{11}|[A-Z0-9]{16})$/.test(a.codiceFiscale.trim())) e.codiceFiscale = 'Codice fiscale non valido';
    if (a.matricolaInps && !/^[0-9A-Z]{10}$/.test(a.matricolaInps.trim())) e.matricolaInps = 'La matricola ha 10 caratteri';
    e.ateco = validaAteco(a.ateco, { facoltativo: true }) || undefined;
    if (!a.indirizzo.trim()) e.indirizzo = 'Obbligatorio';
    e.cap = validaCap(a.cap) || undefined;
    if (!a.citta.trim()) e.citta = 'Obbligatoria';
    if (!a.provincia) e.provincia = 'Seleziona la provincia';
    if (!a.referente.trim()) e.referente = 'Obbligatorio';
    e.email = validaEmail(a.email) || undefined;
    if (a.pec && validaEmail(a.pec)) e.pec = 'PEC non valida';
    e.telefono = validaTelefono(a.telefono) || undefined;
    if (!a.fonarcom) e.fonarcom = 'Rispondi a questa domanda';
    Object.keys(e).forEach((k) => e[k] === undefined && delete e[k]);
    return e;
  };

  const invia = async (ev) => {
    ev.preventDefault();
    const e = valida();
    setErrori(e);
    if (Object.keys(e).length) { setInvio({ stato: 'errore', messaggio: 'Controlla i campi evidenziati in rosso.' }); return; }
    if (!privacy) { setInvio({ stato: 'errore', messaggio: 'Per inviare la richiesta devi accettare l’informativa privacy.' }); return; }
    setInvio({ stato: 'invio', messaggio: '' });
    try {
      const r = await fetch(`${ENDPOINT}/prenotazioni`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          azienda, privacy: true, sito: trappola, campagna: campagnaDaUrl(),
          corsi: selezione.map((c) => ({ id: c.id, partecipanti: scelti[c.id] })),
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.errore || 'Invio non riuscito: riprova fra poco.');
      setInvio({ stato: 'fatto', messaggio: '', riferimento: d.riferimento });
      setPasso(3);
      setTimeout(() => scorri('catalogo'), 30);
    } catch (err) {
      setInvio({ stato: 'errore', messaggio: err.message || 'Invio non riuscito: riprova fra poco.' });
    }
  };

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: DOMANDE.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  });

  // ---------------------------------------------------------------- piano formativo
  const Piano = ({ compatto }) => (
    <div className="bg-[#0f2e2c] text-white rounded-2xl p-6 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-2xl font-black leading-tight">Il tuo piano formativo</h3>
        {compatto && <button type="button" onClick={() => setPianoAperto(false)} aria-label="Chiudi" className="p-1 text-gray-300 hover:text-white"><X className="w-5 h-5" /></button>}
      </div>
      {!selezione.length ? (
        <>
          <ClipboardCheck className="w-10 h-10 text-[#86efb4] mt-5 mb-3" strokeWidth={1.6} />
          <p className="text-sm text-gray-200 leading-relaxed">Seleziona i corsi di tuo interesse per costruire il piano formativo della tua azienda.</p>
        </>
      ) : (
        <>
          <p className="text-[#86efb4] font-bold mt-1">{selezione.length} {selezione.length === 1 ? 'corso selezionato' : 'corsi selezionati'}</p>
          <ul className="mt-3 max-h-[50vh] overflow-y-auto pr-1 divide-y divide-white/15 border-t border-white/15">
            {selezione.map((c) => (
              <li key={c.id} className="py-3">
                <div className="flex justify-between gap-2">
                  <span className="font-bold leading-snug">{c.titolo}</span>
                  {passo === 1 && <button type="button" onClick={() => togli(c.id)} aria-label={`Togli ${c.titolo}`} className="text-gray-400 hover:text-white shrink-0"><X className="w-4 h-4" /></button>}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-300"><Clock className="w-4 h-4" /> {c.ore} ore</div>
                {passo === 1 ? (
                  <label className="mt-2 flex items-center gap-3">
                    <span className="text-sm font-bold">Partecipanti</span>
                    <input type="number" min="1" max="200" value={scelti[c.id]} onChange={(e) => imposta(c.id, parseInt(e.target.value, 10))}
                      className="w-20 rounded-lg bg-white text-gray-900 font-bold px-3 py-1.5 outline-none" />
                  </label>
                ) : <div className="mt-1 text-sm text-gray-300">{scelti[c.id]} {scelti[c.id] === 1 ? 'partecipante' : 'partecipanti'}</div>}
              </li>
            ))}
          </ul>
        </>
      )}
      <dl className="mt-4 text-sm divide-y divide-white/15 border-y border-white/15">
        <div className="flex justify-between py-2"><dt className="text-gray-300">Corsi selezionati</dt><dd className="font-bold">{selezione.length}</dd></div>
        <div className="flex justify-between py-2"><dt className="text-gray-300">Partecipanti</dt><dd className="font-bold">{totPartecipanti}</dd></div>
        <div className="flex justify-between py-2"><dt className="text-gray-300">Durata totale</dt><dd className="font-bold">{totOre} ore</dd></div>
        <div className="flex justify-between items-center py-2"><dt className="text-gray-300">Stato</dt>
          <dd className="text-xs border border-white/40 rounded-full px-2.5 py-0.5">{passo === 3 ? 'Inviato' : 'In definizione'}</dd></div>
      </dl>
      {passo === 1 && (
        <button type="button" onClick={vaiAiDati} disabled={!selezione.length}
          className="mt-5 w-full rounded-xl bg-[#86efb4] text-[#0f2e2c] font-black text-lg py-3.5 hover:bg-[#6ee7a4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {selezione.length ? 'Prosegui con i dati aziendali' : 'Invia la richiesta'}
        </button>
      )}
      <p className="mt-3 text-xs text-gray-400 text-center">Nessun costo per l’azienda · nessun impegno</p>
    </div>
  );

  return (
    <div className="ff bg-[#fbf7f1]">
      <style>{STILE_PAGINA}</style>
      <WhatsAppFisso testo={MSG_WA} sopraBarra={passo === 1 && selezione.length > 0} />
      <SEOHead
        title="Formazione finanziata per le aziende – Catalogo corsi"
        description={`${CORSI_FINANZIATI.length} corsi di formazione finanziata per le aziende aderenti a FonARCom: sicurezza, digitale, intelligenza artificiale, lingue, organizzazione. Scegli i corsi e richiedili online.`}
        canonical="https://www.mariobruzzese.it/formazione-finanziata"
        schema={schema}
      />

      {/* ------------------------------------------------ apertura */}
      <section className="pt-28">
        <div className="grid lg:grid-cols-2 bg-[#0f2e2c] lg:min-h-[480px]">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
            className="px-6 sm:px-12 lg:pl-[max(3rem,calc((100vw-80rem)/2+1.5rem))] py-14 lg:py-16 flex flex-col justify-center text-white">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.02]">
              Formazione per il tuo team.<br /><span className="text-[#86efb4]">Finanziata da FonARCom.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-100">Scegli i corsi. Noi gestiamo il piano e le pratiche.</p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <button type="button" onClick={() => scorri('trova')} className="rounded-lg bg-[#86efb4] text-[#0f2e2c] font-black text-lg px-7 py-3.5 hover:bg-[#6ee7a4] transition-colors">
                Esplora i {CORSI_FINANZIATI.length} corsi
              </button>
              <button type="button" onClick={() => scorri('come-funziona')} className="text-lg font-semibold underline underline-offset-8 decoration-2 hover:text-[#86efb4]">Come funziona</button>
            </div>
          </motion.div>
          <div className="relative min-h-[260px] lg:min-h-0 overflow-hidden lg:[clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)]">
            <img src="/img/formazione-finanziata-team.webp" alt="Un formatore con un gruppo di dipendenti durante un corso in azienda" width="761" height="378"
              className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute right-6 bottom-6 text-right text-white drop-shadow-lg">
              <div className="text-6xl sm:text-7xl font-black leading-none" style={{ fontFamily: 'Lato, sans-serif' }}>0 €</div>
              <div className="text-lg sm:text-xl font-bold">per i corsi finanziati</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        {/* ------------------------------------------------ trova */}
        <section id="trova" className="pt-14 scroll-mt-28">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-950 mb-6">Trova i corsi per la tua azienda</h2>
          <label className="relative block">
            <Search className="w-6 h-6 text-gray-800 absolute left-5 top-1/2 -translate-y-1/2" />
            <input type="search" value={cerca} onChange={(e) => { setCerca(e.target.value); setPasso(1); }} onKeyDown={(e) => e.key === 'Enter' && scorri('catalogo')}
              placeholder="Cerca un corso, ad esempio sicurezza o inglese" aria-label="Cerca un corso"
              className="w-full rounded-lg border-2 border-gray-400 focus:border-[#0f2e2c] bg-white outline-none pl-14 pr-4 py-4 text-lg" />
          </label>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {TEMI_FINANZIATI.map((t) => {
              const s = TILE[t.id];
              return (
                <button key={t.id} type="button" onClick={() => scegliTema(t.id)}
                  className={`text-left rounded-xl p-5 sm:p-7 transition-all hover:-translate-y-0.5 hover:shadow-md ${s.classe} ${tema === t.id ? 'ring-2 ring-[#0f2e2c]' : ''}`}>
                  <s.icona className="w-9 h-9 text-gray-900" strokeWidth={1.6} />
                  <span className="block mt-4 font-black text-gray-900 text-base sm:text-xl leading-tight" style={{ fontFamily: 'Lato, sans-serif' }}>{t.nome}</span>
                  <span className="block mt-3 font-bold text-gray-600">{conta((c) => c.tema === t.id)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------ catalogo / dati / fatto */}
        <section id="catalogo" className="pt-16 pb-20 scroll-mt-28">
          <h2 className="text-4xl sm:text-5xl font-black text-gray-950 mb-6">Catalogo corsi</h2>
          <Passi passo={passo} />

          {passo === 1 && (
            <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
              <div>
                <div className="grid sm:grid-cols-3 gap-3 mb-3">
                  <Tendina etichetta="Area" valore={tema} onChange={setTema} opzioni={[['', 'Tutte le aree'], ...TEMI_FINANZIATI.map((t) => [t.id, t.nome])]} />
                  <Tendina etichetta="Argomento" valore={area} onChange={setArea} opzioni={[['', 'Tutti gli argomenti'], ...AREE.map((a) => [a, a])]} />
                  <Tendina etichetta="Durata" valore={durata} onChange={setDurata} opzioni={DURATE.map((d) => [d.id, d.nome])} />
                </div>
                <p className="text-sm text-gray-600 mb-4" aria-live="polite">
                  <strong className="text-gray-900">{filtrati.length}</strong> {filtrati.length === 1 ? 'corso' : 'corsi'}{cerca && <> per «{cerca}»</>}
                  {filtriAttivi && <button type="button" onClick={azzera} className="ml-3 underline font-semibold text-gray-900">Mostra tutti</button>}
                </p>

                <ul className="space-y-3">
                  {filtrati.slice(0, mostrati).map((c) => {
                    const I = ICONA_AREA[c.area] || Layers; const sel = Boolean(scelti[c.id]);
                    return (
                      <li key={c.id} className={`flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl bg-white border-2 p-4 sm:p-5 transition-colors ${sel ? 'border-[#3fbf7f]' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <span className="w-14 h-14 rounded-xl bg-[#dcf5e6] flex items-center justify-center shrink-0"><I className="w-7 h-7 text-[#0f2e2c]" strokeWidth={1.6} /></span>
                          <div className="min-w-0">
                            <span className="inline-block text-xs font-bold bg-[#dcf5e6] text-[#0f2e2c] rounded px-2 py-0.5 mb-1">{c.area}</span>
                            <h3 className="text-lg font-black text-gray-950 leading-snug">{c.titolo}</h3>
                            <p className="text-sm text-gray-600 mt-0.5">{nomeTema(c.tema)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-5 sm:pl-5 sm:border-l sm:border-gray-200 shrink-0">
                          <span className="flex items-center gap-1.5 font-bold text-gray-800 whitespace-nowrap"><Clock className="w-5 h-5" /> {c.ore} ore</span>
                          {sel ? (
                            <button type="button" onClick={() => togli(c.id)} title="Togli dal piano"
                              className="group rounded-lg bg-[#86efb4] text-[#0f2e2c] font-black px-4 py-2.5 inline-flex items-center gap-2 min-w-[160px] justify-center">
                              <span className="group-hover:hidden inline-flex items-center gap-2">Aggiunto <Check className="w-5 h-5" /></span>
                              <span className="hidden group-hover:inline-flex items-center gap-2">Togli <X className="w-5 h-5" /></span>
                            </button>
                          ) : (
                            <button type="button" onClick={() => aggiungi(c.id)}
                              className="rounded-lg border-2 border-gray-900 bg-white font-black px-4 py-2 min-w-[160px] hover:bg-[#86efb4] hover:border-[#86efb4] transition-colors">
                              + Aggiungi al piano
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {filtrati.length > mostrati && (
                  <button type="button" onClick={() => setMostrati((n) => n + 20)}
                    className="mt-5 w-full rounded-xl border-2 border-gray-900 bg-white font-bold py-3 hover:bg-gray-900 hover:text-white transition-colors">
                    Mostra altri corsi ({filtrati.length - mostrati})
                  </button>
                )}
                {!filtrati.length && (
                  <div className="text-center py-16 text-gray-600 bg-white rounded-xl border-2 border-gray-200">
                    Nessun corso con questi filtri. <button type="button" onClick={azzera} className="underline font-bold text-gray-900">Mostra tutti</button>
                  </div>
                )}
              </div>
              <aside className="hidden lg:block lg:sticky lg:top-28"><Piano /></aside>
            </div>
          )}

          {passo === 2 && (
            <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
              <form onSubmit={invia} noValidate className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8">
                <button type="button" onClick={tornaAlCatalogo} className="inline-flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-gray-900 mb-4">
                  <ChevronLeft className="w-4 h-4" /> Torna al catalogo
                </button>
                <h2 className="text-3xl font-black text-gray-950 mb-1">I dati della tua azienda</h2>
                <p className="text-gray-600 mb-8">Ci servono per verificare l’adesione a FonARCom. Nessun costo e nessun impegno.</p>

                <fieldset className="mb-8">
                  <legend className="text-xl font-black text-gray-950 mb-4">Azienda</legend>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Campo label="Ragione sociale" nome="ragioneSociale" valore={azienda.ragioneSociale} onChange={aggiornaAzienda} errore={errori.ragioneSociale} obbligatorio larghezza="sm:col-span-2" />
                    <Campo label="Partita IVA" nome="partitaIva" valore={azienda.partitaIva} onChange={aggiornaAzienda} errore={errori.partitaIva} obbligatorio />
                    <Campo label="Codice fiscale" nome="codiceFiscale" valore={azienda.codiceFiscale} onChange={aggiornaAzienda} errore={errori.codiceFiscale} maiuscolo aiuto="Solo se diverso dalla partita IVA" />
                    <div className="sm:col-span-2 rounded-xl bg-[#dcf5e6] p-4">
                      <span className="block text-sm font-bold text-gray-900 mb-2">L’azienda aderisce a FonARCom? <span className="text-rose-500">*</span></span>
                      <div className="grid grid-cols-3 gap-2">
                        {[['si', 'Sì'], ['no', 'No'], ['non_so', 'Non lo so']].map(([v, t]) => (
                          <button key={v} type="button" onClick={() => aggiornaAzienda('fonarcom', v)}
                            className={`py-2.5 rounded-lg border-2 text-sm font-black transition-colors ${azienda.fonarcom === v ? 'bg-[#0f2e2c] text-white border-[#0f2e2c]' : 'bg-white border-gray-300 hover:border-[#0f2e2c]'}`}>{t}</button>
                        ))}
                      </div>
                      {errori.fonarcom ? <span className="block text-sm text-red-600 mt-2">{errori.fonarcom}</span>
                        : <span className="block text-xs text-gray-700 mt-2">Se non lo sai, nessun problema: lo verifichiamo noi.</span>}
                    </div>
                    <Campo label="Matricola INPS" nome="matricolaInps" valore={azienda.matricolaInps} onChange={aggiornaAzienda} errore={errori.matricolaInps} maiuscolo aiuto="10 caratteri. Facoltativa, ma velocizza la verifica" />
                    <Campo label="Codice ATECO" nome="ateco" valore={azienda.ateco} onChange={aggiornaAzienda} errore={errori.ateco} placeholder="es. 56.30" />
                    <Campo label="Numero di dipendenti" nome="dipendenti" tipo="number" valore={azienda.dipendenti} onChange={aggiornaAzienda} />
                  </div>
                </fieldset>

                <fieldset className="mb-8">
                  <legend className="text-xl font-black text-gray-950 mb-4">Sede</legend>
                  <div className="grid sm:grid-cols-6 gap-4">
                    <Campo label="Indirizzo" nome="indirizzo" valore={azienda.indirizzo} onChange={aggiornaAzienda} errore={errori.indirizzo} obbligatorio larghezza="sm:col-span-6" />
                    <Campo label="CAP" nome="cap" valore={azienda.cap} onChange={aggiornaAzienda} errore={errori.cap} obbligatorio larghezza="sm:col-span-2" />
                    <Campo label="Città" nome="citta" valore={azienda.citta} onChange={aggiornaAzienda} errore={errori.citta} obbligatorio larghezza="sm:col-span-2" />
                    <label className="block sm:col-span-2">
                      <span className="block text-sm font-bold text-gray-800 mb-1.5">Provincia <span className="text-rose-500">*</span></span>
                      <select value={azienda.provincia} onChange={(e) => aggiornaAzienda('provincia', e.target.value)}
                        className={`w-full rounded-lg border-2 px-3 py-2.5 bg-white outline-none ${errori.provincia ? 'border-red-400' : 'border-gray-300 focus:border-[#0f2e2c]'}`}>
                        <option value="">—</option>
                        {province.map((p) => <option key={p.sigla} value={p.sigla}>{p.nome} ({p.sigla})</option>)}
                      </select>
                      {errori.provincia && <span className="block text-sm text-red-600 mt-1">{errori.provincia}</span>}
                    </label>
                  </div>
                </fieldset>

                <fieldset className="mb-8">
                  <legend className="text-xl font-black text-gray-950 mb-4">Referente</legend>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Campo label="Nome e cognome" nome="referente" valore={azienda.referente} onChange={aggiornaAzienda} errore={errori.referente} obbligatorio />
                    <Campo label="Ruolo" nome="ruolo" valore={azienda.ruolo} onChange={aggiornaAzienda} placeholder="titolare, HR, amministrazione…" />
                    <Campo label="Email" nome="email" tipo="email" valore={azienda.email} onChange={aggiornaAzienda} errore={errori.email} obbligatorio />
                    <Campo label="Telefono" nome="telefono" tipo="tel" valore={azienda.telefono} onChange={aggiornaAzienda} errore={errori.telefono} obbligatorio />
                    <Campo label="PEC" nome="pec" tipo="email" valore={azienda.pec} onChange={aggiornaAzienda} errore={errori.pec} larghezza="sm:col-span-2" />
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-xl font-black text-gray-950 mb-4">Preferenze <span className="text-sm font-normal text-gray-500">(facoltative)</span></legend>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-sm font-bold text-gray-800 mb-1.5">Modalità</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[['presenza', 'In presenza'], ['online', 'Online'], ['indifferente', 'Indifferente']].map(([v, t]) => (
                          <button key={v} type="button" onClick={() => aggiornaAzienda('modalita', v)}
                            className={`py-2.5 rounded-lg border-2 text-xs sm:text-sm font-bold ${azienda.modalita === v ? 'bg-[#0f2e2c] text-white border-[#0f2e2c]' : 'bg-white border-gray-300 hover:border-[#0f2e2c]'}`}>{t}</button>
                        ))}
                      </div>
                    </div>
                    <Campo label="Periodo preferito" nome="periodo" valore={azienda.periodo} onChange={aggiornaAzienda} placeholder="es. da febbraio, dopo la stagione" />
                    <label className="block sm:col-span-2">
                      <span className="block text-sm font-bold text-gray-800 mb-1.5">Note</span>
                      <textarea rows="3" value={azienda.note} onChange={(e) => aggiornaAzienda('note', e.target.value)} maxLength={1000}
                        placeholder="Esigenze particolari, sedi, orari…" className="w-full rounded-lg border-2 border-gray-300 focus:border-[#0f2e2c] outline-none px-3.5 py-2.5" />
                    </label>
                  </div>
                </fieldset>

                <div aria-hidden="true" style={{ position: 'absolute', left: '-5000px', width: 1, height: 1, overflow: 'hidden' }}>
                  <input type="text" name="sito" tabIndex={-1} autoComplete="off" value={trappola} onChange={(e) => setTrappola(e.target.value)} />
                </div>
                <label className="flex gap-3 items-start mt-8 text-sm text-gray-700 leading-relaxed">
                  <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-1 w-4 h-4 accent-[#0f2e2c]" />
                  <span>Ho letto l’<Link to="/privacy" target="_blank" className="underline font-bold text-gray-900">informativa privacy</Link> e acconsento al trattamento dei dati per la gestione della richiesta. <span className="text-rose-500">*</span></span>
                </label>
                {invio.stato === 'errore' && <p role="alert" className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{invio.messaggio}</p>}
                <button type="submit" disabled={invio.stato === 'invio'}
                  className="mt-6 w-full rounded-xl bg-[#86efb4] text-[#0f2e2c] font-black text-lg py-4 hover:bg-[#6ee7a4] disabled:opacity-60 transition-colors">
                  {invio.stato === 'invio' ? 'Invio in corso…' : 'Invia la richiesta'}
                </button>
              </form>
              <aside className="lg:sticky lg:top-28 order-first lg:order-none"><Piano /></aside>
            </div>
          )}

          {passo === 3 && (
            <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-2xl mx-auto bg-[#0f2e2c] text-white rounded-3xl p-10 text-center">
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-[#86efb4] text-[#0f2e2c] flex items-center justify-center"><CheckCircle2 className="w-10 h-10" /></div>
              <h2 className="text-3xl font-black mb-3">Richiesta inviata!</h2>
              <p className="text-lg text-gray-200">Riferimento <strong className="text-[#86efb4]">{invio.riferimento}</strong></p>
              <p className="text-gray-300 mt-4 leading-relaxed">
                Ti abbiamo mandato un’email di riepilogo. Nei prossimi giorni ti contattiamo per verificare l’adesione a FonARCom
                e concordare calendario e partecipanti.
              </p>
              <ul className="mt-6 text-left inline-block text-sm text-gray-200 space-y-1">
                {selezione.map((c) => <li key={c.id} className="flex gap-2"><Check className="w-4 h-4 text-[#86efb4] mt-0.5 shrink-0" />{c.titolo} — {scelti[c.id]} part.</li>)}
              </ul>
            </motion.div>
          )}
        </section>

        {/* ------------------------------------------------ come funziona */}
        <section id="come-funziona" className="scroll-mt-28 rounded-2xl bg-[#d9f5e3] px-6 sm:px-10 py-10">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-950 mb-8">Come funziona</h2>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {PASSI_COME.map((p, i) => (
              <li key={p.titolo} className="relative text-center">
                <span className="mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm"><p.icona className="w-8 h-8 text-gray-900" strokeWidth={1.6} /></span>
                <h3 className="mt-3 text-lg font-black text-gray-950">{p.titolo}</h3>
                <p className="mt-1 text-sm text-gray-700 leading-relaxed max-w-[15rem] mx-auto">{p.testo}</p>
                {i < PASSI_COME.length - 1 && <ArrowRight className="hidden lg:block w-6 h-6 text-gray-800 absolute top-5 -right-5" />}
              </li>
            ))}
          </ol>
        </section>

        {/* ------------------------------------------------ FAQ */}
        <section className="pt-14 pb-24">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 mb-5">
            <h2 className="text-4xl font-black text-gray-950">FAQ</h2>
            <p className="text-gray-700">Le risposte alle domande più frequenti sulla formazione e sui fondi FonARCom.</p>
          </div>
          <div className="space-y-3">
            {DOMANDE.map(([d, r]) => (
              <details key={d} className="group rounded-lg border-2 border-gray-300 bg-white">
                <summary className="flex justify-between items-center gap-4 cursor-pointer list-none font-bold text-gray-950 px-5 py-3.5">
                  {d}<ChevronDown className="w-5 h-5 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-4 text-gray-700 leading-relaxed">{r}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      {/* barra in basso (telefono e tablet) e pannello del piano */}
      {passo === 1 && selezione.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0f2e2c] text-white">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setPianoAperto(true)} className="text-left text-sm">
              <span className="font-bold">{selezione.length} {selezione.length === 1 ? 'corso' : 'corsi'} · {totPartecipanti} part.</span>
              <span className="block text-xs text-[#86efb4] underline">Vedi il piano</span>
            </button>
            <button type="button" onClick={vaiAiDati} className="rounded-lg bg-[#86efb4] text-[#0f2e2c] font-black px-4 py-2.5 text-sm">Prosegui</button>
          </div>
        </div>
      )}
      <AnimatePresence>
        {pianoAperto && (
          <motion.div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPianoAperto(false)}>
            <motion.div className="w-full p-3" initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} onClick={(e) => e.stopPropagation()}>
              <Piano compatto />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
