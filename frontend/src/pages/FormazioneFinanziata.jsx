import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Award, BadgeCheck, Briefcase, Calculator, Check, CheckCircle2, ChevronLeft, ClipboardList, Cpu, GraduationCap,
  Languages, Layers, Leaf, Lightbulb, Lock, Megaphone, MessageSquare, Minus, Monitor, Network, PiggyBank, Plus, Rocket, Search,
  ShieldCheck, Sparkles, TrendingUp, Users, X,
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

// colori e icone dei 4 temi (classi scritte per intero: Tailwind le deve trovare nel codice)
const STILE_TEMA = {
  generale: { icona: ShieldCheck, chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', pieno: 'bg-emerald-600', riga: 'bg-emerald-500', tile: 'from-emerald-50 to-white border-emerald-200 hover:border-emerald-500', ico: 'bg-emerald-600 text-white' },
  digitale: { icona: Monitor, chip: 'bg-violet-50 text-violet-700 border-violet-200', pieno: 'bg-violet-600', riga: 'bg-violet-500', tile: 'from-violet-50 to-white border-violet-200 hover:border-violet-500', ico: 'bg-violet-600 text-white' },
  innovazione: { icona: Lightbulb, chip: 'bg-amber-50 text-amber-700 border-amber-200', pieno: 'bg-amber-500', riga: 'bg-amber-500', tile: 'from-amber-50 to-white border-amber-200 hover:border-amber-500', ico: 'bg-amber-500 text-white' },
  organizzazione: { icona: Network, chip: 'bg-rose-50 text-rose-700 border-rose-200', pieno: 'bg-rose-600', riga: 'bg-rose-500', tile: 'from-rose-50 to-white border-rose-200 hover:border-rose-500', ico: 'bg-rose-600 text-white' },
};
const ICONA_AREA = {
  Sicurezza: ShieldCheck, 'Intelligenza artificiale': Sparkles, Marketing: Megaphone, Lingue: Languages,
  'Organizzazione aziendale': Network, 'Amministrazione e contabilità': Calculator, 'Privacy e sicurezza informatica': Lock,
  Qualità: Award, Innovazione: Lightbulb, Sostenibilità: Leaf, 'Abilità personali': Users, 'Economia e imprenditorialità': TrendingUp,
  Informatica: Cpu, Comunicazione: MessageSquare, Scuola: GraduationCap,
};
const AREE_RAPIDE = ['Sicurezza', 'Intelligenza artificiale', 'Marketing', 'Lingue', 'Privacy e sicurezza informatica', 'Organizzazione aziendale', 'Amministrazione e contabilità', 'Sostenibilità'];
const AREE = [...new Set(CORSI_FINANZIATI.map((c) => c.area))].sort((a, b) => a.localeCompare(b, 'it'));
const conta = (filtro) => CORSI_FINANZIATI.filter(filtro).length;
const DURATE = [
  { id: '', nome: 'Qualsiasi durata', ok: () => true },
  { id: 'brevi', nome: 'Fino a 8 ore', ok: (o) => o <= 8 },
  { id: 'medi', nome: 'Da 9 a 24 ore', ok: (o) => o > 8 && o <= 24 },
  { id: 'lunghi', nome: 'Oltre 24 ore', ok: (o) => o > 24 },
];
const DOMANDE = [
  ['Quanto costa all’azienda?', 'I corsi sono finanziati dal fondo interprofessionale a cui l’azienda versa già i contributi tramite l’INPS: l’azienda non paga i corsi.'],
  ['Chi può richiederli?', 'Le aziende con dipendenti aderenti a Fonarcom. Se la tua azienda non aderisce ancora, ti spieghiamo come fare: l’adesione si comunica all’INPS e non comporta costi aggiuntivi.'],
  ['La richiesta è un’iscrizione definitiva?', 'No. È una richiesta di adesione: dopo l’invio ti contattiamo per verificare i requisiti e concordare corsi, partecipanti e calendario.'],
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

function Campo({ label, nome, valore, onChange, errore, tipo = 'text', placeholder, obbligatorio, larghezza = '', maiuscolo, aiuto }) {
  return (
    <label className={`block ${larghezza}`}>
      <span className="block text-sm font-semibold text-gray-800 mb-1.5">{label}{obbligatorio && <span className="text-rose-500"> *</span>}</span>
      <input
        type={tipo} name={nome} value={valore} placeholder={placeholder}
        onChange={(e) => onChange(nome, maiuscolo ? e.target.value.toUpperCase() : e.target.value)}
        className={`w-full rounded-xl border-2 px-3.5 py-2.5 text-[15px] bg-white outline-none transition-colors ${errore ? 'border-red-400 bg-red-50/40' : 'border-gray-200 focus:border-gray-900'}`}
      />
      {errore ? <span className="block text-sm text-red-600 mt-1">{errore}</span> : aiuto && <span className="block text-xs text-gray-500 mt-1">{aiuto}</span>}
    </label>
  );
}

function Contatore({ valore, onChange, scuro }) {
  const base = scuro ? 'border-white/30 text-white' : 'border-gray-300 text-gray-900';
  return (
    <div className={`inline-flex items-center rounded-lg border ${base} overflow-hidden`}>
      <button type="button" aria-label="Meno partecipanti" onClick={() => onChange(Math.max(1, valore - 1))} className="px-2 py-1 hover:bg-black/10"><Minus className="w-3.5 h-3.5" /></button>
      <input
        type="number" min="1" max="200" value={valore} aria-label="Partecipanti"
        onChange={(e) => onChange(Math.min(200, Math.max(1, parseInt(e.target.value, 10) || 1)))}
        className="w-10 text-center text-sm font-bold bg-transparent outline-none [appearance:textfield]"
      />
      <button type="button" aria-label="Più partecipanti" onClick={() => onChange(Math.min(200, valore + 1))} className="px-2 py-1 hover:bg-black/10"><Plus className="w-3.5 h-3.5" /></button>
    </div>
  );
}

/** Indicatore dei passi in cima alla sezione di lavoro. */
function Passi({ passo }) {
  const voci = ['Scegli i corsi', 'Dati dell’azienda', 'Richiesta inviata'];
  return (
    <ol className="flex items-center gap-2 sm:gap-4 mb-8">
      {voci.map((v, i) => {
        const n = i + 1;
        const fatto = passo > n; const ora = passo === n;
        return (
          <li key={v} className="flex items-center gap-2 sm:gap-4 min-w-0">
            <span className={`flex items-center gap-2 min-w-0 ${ora ? 'text-gray-900' : fatto ? 'text-emerald-700' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${ora ? 'bg-gray-900 text-white' : fatto ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {fatto ? <Check className="w-4 h-4" /> : n}
              </span>
              <span className={`text-sm font-semibold truncate ${ora ? '' : 'hidden sm:inline'}`}>{v}</span>
            </span>
            {n < voci.length && <span className={`h-0.5 w-6 sm:w-12 rounded ${fatto ? 'bg-emerald-600' : 'bg-gray-200'}`} />}
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
  const [pianoAperto, setPianoAperto] = useState(false); // pannello "piano" su telefono

  const filtrati = useMemo(() => {
    const q = cerca.trim().toLowerCase();
    const okDurata = (DURATE.find((d) => d.id === durata) || DURATE[0]).ok;
    return CORSI_FINANZIATI.filter((c) => (!tema || c.tema === tema) && (!area || c.area === area) && okDurata(c.ore)
      && (!q || c.titolo.toLowerCase().includes(q) || c.area.toLowerCase().includes(q)));
  }, [cerca, tema, area, durata]);

  const selezione = CORSI_FINANZIATI.filter((c) => scelti[c.id]);
  const totPartecipanti = selezione.reduce((s, c) => s + scelti[c.id], 0);
  const totOre = selezione.reduce((s, c) => s + c.ore, 0);
  const aggiungi = (id) => setScelti((s) => ({ ...s, [id]: s[id] || 1 }));
  const togli = (id) => setScelti((s) => { const n = { ...s }; delete n[id]; return n; });
  const imposta = (id, n) => setScelti((s) => ({ ...s, [id]: n }));
  const aggiornaAzienda = (k, v) => { setAzienda((a) => ({ ...a, [k]: v })); setErrori((e) => ({ ...e, [k]: undefined })); };
  const filtriAttivi = Boolean(cerca || tema || area || durata);
  const azzera = () => { setCerca(''); setTema(''); setArea(''); setDurata(''); };
  const scegliTema = (id) => { setTema(id); setArea(''); scorri('catalogo'); };
  const scegliArea = (a) => { setArea(a); setTema(''); scorri('catalogo'); };
  const vaiAiDati = () => { if (!selezione.length) return; setPianoAperto(false); setPasso(2); setTimeout(() => scorri('lavoro'), 30); };
  const tornaAlCatalogo = () => { setPasso(1); setTimeout(() => scorri('lavoro'), 30); };

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
      setTimeout(() => scorri('lavoro'), 30);
    } catch (err) {
      setInvio({ stato: 'errore', messaggio: err.message || 'Invio non riuscito: riprova fra poco.' });
    }
  };

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: DOMANDE.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  });

  // ---------------------------------------------------------------- piano formativo (carrello)
  const Piano = ({ compatto }) => (
    <div className="bg-gray-950 text-white rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h3 className="text-lg font-bold flex items-center gap-2"><ClipboardList className="w-5 h-5" /> Il tuo piano formativo</h3>
        {compatto && <button type="button" onClick={() => setPianoAperto(false)} aria-label="Chiudi" className="p-1 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>}
      </div>
      {!selezione.length ? (
        <div className="py-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3"><Plus className="w-5 h-5" /></div>
          <p className="text-sm text-gray-300">Ancora vuoto. Premi <strong>«Aggiungi»</strong> sui corsi che ti interessano.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 my-4 text-center">
            {[[selezione.length, selezione.length === 1 ? 'corso' : 'corsi'], [totPartecipanti, totPartecipanti === 1 ? 'partecipante' : 'partecipanti'], [totOre, 'ore di corso']].map(([n, t]) => (
              <div key={t} className="rounded-xl bg-white/10 py-2"><div className="text-xl font-bold">{n}</div><div className="text-[11px] text-gray-400">{t}</div></div>
            ))}
          </div>
          <ul className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
            {selezione.map((c) => (
              <li key={c.id} className="rounded-xl bg-white/5 p-3">
                <div className="flex gap-2">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${STILE_TEMA[c.tema].pieno}`} />
                  <span className="text-sm leading-snug flex-1">{c.titolo}</span>
                  <button type="button" onClick={() => togli(c.id)} aria-label={`Togli ${c.titolo}`} className="text-gray-500 hover:text-white shrink-0"><X className="w-4 h-4" /></button>
                </div>
                {passo === 1 && (
                  <div className="mt-2 ml-4 flex items-center gap-2 text-xs text-gray-400"><Contatore scuro valore={scelti[c.id]} onChange={(n) => imposta(c.id, n)} /> partecipanti · {c.ore} ore</div>
                )}
                {passo !== 1 && <div className="mt-1 ml-4 text-xs text-gray-400">{scelti[c.id]} {scelti[c.id] === 1 ? 'partecipante' : 'partecipanti'} · {c.ore} ore</div>}
              </li>
            ))}
          </ul>
        </>
      )}
      {passo === 1 && (
        <button type="button" onClick={vaiAiDati} disabled={!selezione.length}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-gray-950 font-bold py-3 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Prosegui con i dati aziendali <ArrowRight className="w-4 h-4" />
        </button>
      )}
      <p className="mt-3 text-[11px] text-gray-500 text-center">Nessun costo per l’azienda · nessun impegno</p>
    </div>
  );

  return (
    <>
      <WhatsAppFisso testo={MSG_WA} sopraBarra={passo === 1 && selezione.length > 0} />
      <SEOHead
        title="Formazione finanziata per le aziende – Catalogo corsi"
        description={`${CORSI_FINANZIATI.length} corsi di formazione finanziata per le aziende aderenti a Fonarcom: sicurezza, digitale, intelligenza artificiale, lingue, organizzazione. Scegli i corsi e richiedili online.`}
        canonical="https://www.mariobruzzese.it/formazione-finanziata"
        schema={schema}
      />

      {/* ------------------------------------------------ apertura */}
      <section className="relative overflow-hidden bg-gray-950 text-white pt-36 pb-20">
        <div className="absolute -top-24 -right-24 w-[32rem] h-[32rem] rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
              <BadgeCheck className="w-4 h-4 text-emerald-400" /> Per le aziende aderenti a Fonarcom
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.05]">
              Forma i tuoi dipendenti.<br /><span className="text-emerald-400">Paga il fondo, non l’azienda.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-xl">
              Scegli dal catalogo i corsi che servono alla tua azienda: sono finanziati dal fondo interprofessionale.
              Noi verifichiamo i requisiti, organizziamo i corsi e gestiamo tutta la parte burocratica.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => scorri('temi')} className="inline-flex items-center gap-2 rounded-xl bg-white text-gray-950 font-bold px-6 py-3.5 hover:bg-gray-100 transition-colors">
                Scegli i corsi <ArrowRight className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => scorri('domande')} className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 font-semibold hover:bg-white/10 transition-colors">
                Come funziona
              </button>
            </div>
          </motion.div>
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.15 }} className="grid grid-cols-2 gap-4">
            {[
              { icona: Layers, n: CORSI_FINANZIATI.length, t: 'corsi tra cui scegliere' },
              { icona: PiggyBank, n: '0 €', t: 'di costo dei corsi per l’azienda' },
              { icona: Rocket, n: '2 minuti', t: 'per inviare la richiesta' },
              { icona: Briefcase, n: 'Tutto noi', t: 'verifiche, piano e rendicontazione' },
            ].map((k) => (
              <div key={k.t} className="rounded-2xl bg-white/[0.06] border border-white/10 p-5 backdrop-blur-sm">
                <k.icona className="w-6 h-6 text-emerald-400 mb-3" />
                <div className="text-2xl md:text-3xl font-bold">{k.n}</div>
                <div className="text-sm text-gray-400 mt-1">{k.t}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="relative bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* ------------------------------------------------ temi */}
          <section id="temi" className="pt-16 scroll-mt-24">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Da dove vuoi partire?</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Scegli un’area</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEMI_FINANZIATI.map((t) => {
                const s = STILE_TEMA[t.id];
                return (
                  <button key={t.id} type="button" onClick={() => scegliTema(t.id)}
                    className={`group text-left rounded-2xl border-2 bg-gradient-to-br ${s.tile} p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${tema === t.id ? 'ring-2 ring-gray-900' : ''}`}>
                    <span className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${s.ico}`}><s.icona className="w-6 h-6" /></span>
                    <span className="block font-bold text-gray-900 text-lg leading-tight">{t.nome}</span>
                    <span className="block text-sm text-gray-600 mt-2 leading-relaxed">{t.descrizione}</span>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                      {conta((c) => c.tema === t.id)} corsi <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 self-center mr-1">Oppure cerca per argomento:</span>
              {AREE_RAPIDE.map((a) => {
                const I = ICONA_AREA[a] || Layers;
                return (
                  <button key={a} type="button" onClick={() => scegliArea(a)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${area === a ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-900'}`}>
                    <I className="w-4 h-4" /> {a} <span className="text-xs opacity-60">{conta((c) => c.area === a)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ------------------------------------------------ catalogo / dati / fatto */}
          <section id="lavoro" className="pt-16 pb-24 scroll-mt-24">
            <Passi passo={passo} />

            {passo === 1 && (
              <div id="catalogo" className="grid lg:grid-cols-[1fr_360px] gap-8 items-start scroll-mt-24">
                <div>
                  <div className="rounded-2xl bg-white border border-gray-200 p-4 mb-5 shadow-sm">
                    <label className="relative block">
                      <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input type="search" value={cerca} onChange={(e) => setCerca(e.target.value)} placeholder="Cerca un corso: inglese, carrelli, intelligenza artificiale, privacy…"
                        aria-label="Cerca un corso" className="w-full rounded-xl bg-gray-50 border-2 border-transparent focus:border-gray-900 focus:bg-white outline-none pl-12 pr-4 py-3 text-[15px]" />
                    </label>
                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                      <select value={tema} onChange={(e) => setTema(e.target.value)} aria-label="Area" className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">
                        <option value="">Tutte le aree</option>
                        {TEMI_FINANZIATI.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                      </select>
                      <select value={area} onChange={(e) => setArea(e.target.value)} aria-label="Argomento" className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">
                        <option value="">Tutti gli argomenti</option>
                        {AREE.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                      <select value={durata} onChange={(e) => setDurata(e.target.value)} aria-label="Durata" className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white">
                        {DURATE.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
                      </select>
                      <span className="ml-auto text-sm text-gray-500" aria-live="polite">
                        <strong className="text-gray-900">{filtrati.length}</strong> {filtrati.length === 1 ? 'corso' : 'corsi'}
                        {filtriAttivi && <button type="button" onClick={azzera} className="ml-2 underline">azzera</button>}
                      </span>
                    </div>
                  </div>

                  <ul className="grid sm:grid-cols-2 gap-4">
                    <AnimatePresence initial={false}>
                      {filtrati.map((c) => {
                        const s = STILE_TEMA[c.tema]; const I = ICONA_AREA[c.area] || Layers; const sel = Boolean(scelti[c.id]);
                        return (
                          <motion.li key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                            className={`relative flex flex-col rounded-2xl bg-white border-2 overflow-hidden transition-all ${sel ? 'border-gray-900 shadow-lg' : 'border-gray-100 hover:border-gray-300 hover:shadow-md'}`}>
                            <span className={`absolute inset-x-0 top-0 h-1 ${s.riga}`} />
                            <div className="p-5 flex-1">
                              <div className="flex items-start gap-3">
                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${s.chip}`}><I className="w-5 h-5" /></span>
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-gray-500">{c.area}</div>
                                  <h3 className="font-semibold text-gray-900 leading-snug mt-0.5">{c.titolo}</h3>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 font-semibold px-2.5 py-1">{c.ore} ore</span>
                                <span className={`inline-flex items-center rounded-full border font-semibold px-2.5 py-1 ${s.chip}`}>{TEMI_FINANZIATI.find((t) => t.id === c.tema).nome}</span>
                              </div>
                            </div>
                            <div className={`px-5 py-3 border-t ${sel ? 'bg-gray-900 border-gray-900' : 'bg-gray-50 border-gray-100'}`}>
                              {sel ? (
                                <div className="flex items-center justify-between gap-2 text-white">
                                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Nel piano</span>
                                  <span className="flex items-center gap-2 text-xs text-gray-300">
                                    <Contatore scuro valore={scelti[c.id]} onChange={(n) => imposta(c.id, n)} />
                                    <button type="button" onClick={() => togli(c.id)} aria-label={`Togli ${c.titolo}`} className="p-1 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                                  </span>
                                </div>
                              ) : (
                                <button type="button" onClick={() => aggiungi(c.id)} className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-white border-2 border-gray-900 py-1.5 text-sm font-bold hover:bg-gray-900 hover:text-white transition-colors">
                                  <Plus className="w-4 h-4" /> Aggiungi al piano
                                </button>
                              )}
                            </div>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                  {!filtrati.length && (
                    <div className="text-center py-16 text-gray-500">
                      Nessun corso con questi filtri. <button type="button" onClick={azzera} className="underline font-semibold text-gray-900">Mostra tutti</button>
                    </div>
                  )}
                </div>
                <aside className="hidden lg:block lg:sticky lg:top-28"><Piano /></aside>
              </div>
            )}

            {passo === 2 && (
              <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
                <form onSubmit={invia} noValidate className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                  <button type="button" onClick={tornaAlCatalogo} className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-4">
                    <ChevronLeft className="w-4 h-4" /> Torna al catalogo
                  </button>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Ultimo passo: i dati dell’azienda</h2>
                  <p className="text-gray-600 mb-8">Ci servono per verificare l’adesione al fondo. Nessun costo e nessun impegno.</p>

                  <fieldset className="mb-8">
                    <legend className="flex items-center gap-2 font-bold text-gray-900 mb-4"><span className="w-7 h-7 rounded-full bg-gray-900 text-white text-sm flex items-center justify-center">1</span> L’azienda</legend>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Campo label="Ragione sociale" nome="ragioneSociale" valore={azienda.ragioneSociale} onChange={aggiornaAzienda} errore={errori.ragioneSociale} obbligatorio larghezza="sm:col-span-2" />
                      <Campo label="Partita IVA" nome="partitaIva" valore={azienda.partitaIva} onChange={aggiornaAzienda} errore={errori.partitaIva} obbligatorio />
                      <Campo label="Codice fiscale" nome="codiceFiscale" valore={azienda.codiceFiscale} onChange={aggiornaAzienda} errore={errori.codiceFiscale} maiuscolo aiuto="Solo se diverso dalla partita IVA" />
                      <div className="sm:col-span-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                        <span className="block text-sm font-semibold text-gray-900 mb-2">L’azienda aderisce a Fonarcom? <span className="text-rose-500">*</span></span>
                        <div className="grid grid-cols-3 gap-2">
                          {[['si', 'Sì'], ['no', 'No'], ['non_so', 'Non lo so']].map(([v, t]) => (
                            <button key={v} type="button" onClick={() => aggiornaAzienda('fonarcom', v)}
                              className={`py-2.5 rounded-lg border-2 text-sm font-bold transition-colors ${azienda.fonarcom === v ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 hover:border-gray-900'}`}>{t}</button>
                          ))}
                        </div>
                        {errori.fonarcom ? <span className="block text-sm text-red-600 mt-2">{errori.fonarcom}</span>
                          : <span className="block text-xs text-gray-600 mt-2">Se non lo sai, nessun problema: lo verifichiamo noi.</span>}
                      </div>
                      <Campo label="Matricola INPS" nome="matricolaInps" valore={azienda.matricolaInps} onChange={aggiornaAzienda} errore={errori.matricolaInps} maiuscolo aiuto="10 caratteri. Facoltativa, ma velocizza la verifica" />
                      <Campo label="Codice ATECO" nome="ateco" valore={azienda.ateco} onChange={aggiornaAzienda} errore={errori.ateco} placeholder="es. 56.30" />
                      <Campo label="Numero di dipendenti" nome="dipendenti" tipo="number" valore={azienda.dipendenti} onChange={aggiornaAzienda} />
                    </div>
                  </fieldset>

                  <fieldset className="mb-8">
                    <legend className="flex items-center gap-2 font-bold text-gray-900 mb-4"><span className="w-7 h-7 rounded-full bg-gray-900 text-white text-sm flex items-center justify-center">2</span> La sede</legend>
                    <div className="grid sm:grid-cols-6 gap-4">
                      <Campo label="Indirizzo" nome="indirizzo" valore={azienda.indirizzo} onChange={aggiornaAzienda} errore={errori.indirizzo} obbligatorio larghezza="sm:col-span-6" />
                      <Campo label="CAP" nome="cap" valore={azienda.cap} onChange={aggiornaAzienda} errore={errori.cap} obbligatorio larghezza="sm:col-span-2" />
                      <Campo label="Città" nome="citta" valore={azienda.citta} onChange={aggiornaAzienda} errore={errori.citta} obbligatorio larghezza="sm:col-span-2" />
                      <label className="block sm:col-span-2">
                        <span className="block text-sm font-semibold text-gray-800 mb-1.5">Provincia <span className="text-rose-500">*</span></span>
                        <select value={azienda.provincia} onChange={(e) => aggiornaAzienda('provincia', e.target.value)}
                          className={`w-full rounded-xl border-2 px-3 py-2.5 bg-white outline-none ${errori.provincia ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}>
                          <option value="">—</option>
                          {province.map((p) => <option key={p.sigla} value={p.sigla}>{p.nome} ({p.sigla})</option>)}
                        </select>
                        {errori.provincia && <span className="block text-sm text-red-600 mt-1">{errori.provincia}</span>}
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="mb-8">
                    <legend className="flex items-center gap-2 font-bold text-gray-900 mb-4"><span className="w-7 h-7 rounded-full bg-gray-900 text-white text-sm flex items-center justify-center">3</span> Chi contattiamo</legend>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Campo label="Nome e cognome" nome="referente" valore={azienda.referente} onChange={aggiornaAzienda} errore={errori.referente} obbligatorio />
                      <Campo label="Ruolo" nome="ruolo" valore={azienda.ruolo} onChange={aggiornaAzienda} placeholder="titolare, HR, amministrazione…" />
                      <Campo label="Email" nome="email" tipo="email" valore={azienda.email} onChange={aggiornaAzienda} errore={errori.email} obbligatorio />
                      <Campo label="Telefono" nome="telefono" tipo="tel" valore={azienda.telefono} onChange={aggiornaAzienda} errore={errori.telefono} obbligatorio />
                      <Campo label="PEC" nome="pec" tipo="email" valore={azienda.pec} onChange={aggiornaAzienda} errore={errori.pec} larghezza="sm:col-span-2" />
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="flex items-center gap-2 font-bold text-gray-900 mb-4"><span className="w-7 h-7 rounded-full bg-gray-900 text-white text-sm flex items-center justify-center">4</span> Preferenze <span className="font-normal text-sm text-gray-500">(facoltative)</span></legend>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-semibold text-gray-800 mb-1.5">Modalità</span>
                        <div className="grid grid-cols-3 gap-2">
                          {[['presenza', 'In presenza'], ['online', 'Online'], ['indifferente', 'Indifferente']].map(([v, t]) => (
                            <button key={v} type="button" onClick={() => aggiornaAzienda('modalita', v)}
                              className={`py-2.5 rounded-lg border-2 text-xs sm:text-sm font-semibold ${azienda.modalita === v ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 hover:border-gray-900'}`}>{t}</button>
                          ))}
                        </div>
                      </div>
                      <Campo label="Periodo preferito" nome="periodo" valore={azienda.periodo} onChange={aggiornaAzienda} placeholder="es. da febbraio, dopo la stagione" />
                      <label className="block sm:col-span-2">
                        <span className="block text-sm font-semibold text-gray-800 mb-1.5">Note</span>
                        <textarea rows="3" value={azienda.note} onChange={(e) => aggiornaAzienda('note', e.target.value)} maxLength={1000}
                          placeholder="Esigenze particolari, sedi, orari…" className="w-full rounded-xl border-2 border-gray-200 focus:border-gray-900 outline-none px-3.5 py-2.5" />
                      </label>
                    </div>
                  </fieldset>

                  <div aria-hidden="true" style={{ position: 'absolute', left: '-5000px', width: 1, height: 1, overflow: 'hidden' }}>
                    <input type="text" name="sito" tabIndex={-1} autoComplete="off" value={trappola} onChange={(e) => setTrappola(e.target.value)} />
                  </div>
                  <label className="flex gap-3 items-start mt-8 text-sm text-gray-600 leading-relaxed">
                    <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-1 w-4 h-4 accent-black" />
                    <span>Ho letto l’<Link to="/privacy" target="_blank" className="underline font-medium text-gray-900">informativa privacy</Link> e acconsento al trattamento dei dati per la gestione della richiesta. <span className="text-rose-500">*</span></span>
                  </label>
                  {invio.stato === 'errore' && <p role="alert" className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{invio.messaggio}</p>}
                  <button type="submit" disabled={invio.stato === 'invio'}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 text-white font-bold py-4 text-lg hover:bg-gray-800 disabled:opacity-60 transition-colors">
                    {invio.stato === 'invio' ? 'Invio in corso…' : <>Invia la richiesta <ArrowRight className="w-5 h-5" /></>}
                  </button>
                </form>
                <aside className="lg:sticky lg:top-28 order-first lg:order-none"><Piano /></aside>
              </div>
            )}

            {passo === 3 && (
              <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-3xl p-10 text-center shadow-sm">
                <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center"><CheckCircle2 className="w-10 h-10" /></div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Richiesta inviata!</h2>
                <p className="text-gray-600 text-lg">Riferimento <strong className="text-gray-900">{invio.riferimento}</strong></p>
                <p className="text-gray-600 mt-4 leading-relaxed">
                  Ti abbiamo mandato un’email di riepilogo. Nei prossimi giorni ti contattiamo per verificare l’adesione al fondo
                  e concordare calendario e partecipanti.
                </p>
                <ul className="mt-6 text-left inline-block text-sm text-gray-700 space-y-1">
                  {selezione.map((c) => <li key={c.id} className="flex gap-2"><Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />{c.titolo} — {scelti[c.id]} part.</li>)}
                </ul>
              </motion.div>
            )}
          </section>

          {/* ------------------------------------------------ domande */}
          <section id="domande" className="pb-24 scroll-mt-24 grid lg:grid-cols-[1fr_1.2fr] gap-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Come funziona</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Quattro passi, al resto pensiamo noi</h2>
              <ol className="space-y-4">
                {[['Scegli i corsi', 'Dal catalogo, con il numero di partecipanti.'], ['Invia la richiesta', 'Pochi dati aziendali, nessun costo.'],
                  ['Verifichiamo e pianifichiamo', 'Controlliamo l’adesione al fondo e prepariamo il piano formativo.'], ['Si parte', 'I dipendenti seguono i corsi, noi curiamo gestione e rendicontazione.']].map(([t, d], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="w-9 h-9 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <div><div className="font-bold text-gray-900">{t}</div><div className="text-gray-600 text-sm">{d}</div></div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="divide-y divide-gray-200 border-y border-gray-200 self-start">
              {DOMANDE.map(([d, r]) => (
                <details key={d} className="group py-5">
                  <summary className="flex justify-between items-center gap-4 cursor-pointer list-none font-semibold text-gray-900">
                    {d}<Plus className="w-5 h-5 shrink-0 transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 text-gray-600 leading-relaxed">{r}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* barra in basso (telefono e tablet) e pannello del piano */}
      {passo === 1 && selezione.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-gray-950 text-white">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setPianoAperto(true)} className="text-left text-sm">
              <span className="font-bold">{selezione.length} {selezione.length === 1 ? 'corso' : 'corsi'} · {totPartecipanti} part.</span>
              <span className="block text-xs text-gray-400 underline">Vedi il piano</span>
            </button>
            <button type="button" onClick={vaiAiDati} className="inline-flex items-center gap-1.5 rounded-xl bg-white text-gray-950 font-bold px-4 py-2.5 text-sm">
              Prosegui <ArrowRight className="w-4 h-4" />
            </button>
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
    </>
  );
}
