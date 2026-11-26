import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, BadgeCheck, Building2, CheckCircle2, ClipboardList, GraduationCap, Minus, Plus, Search, Trash2, X,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { WhatsAppFisso } from '../components/WhatsApp';
import { CORSI_FINANZIATI, TEMI_FINANZIATI } from '../data/catalogoFinanziato';
import { province } from '../data/province';
import { validaAteco, validaCap, validaEmail, validaPartitaIva, validaTelefono } from '../lib/validazione';

/**
 * Formazione finanziata: catalogo dei corsi che l'azienda aderente al fondo
 * interprofessionale può fare senza pagarli, con richiesta di adesione.
 * Nessun pagamento: i dati vanno al Worker (/prenotazioni) e nel pannello admin.
 */
const ENDPOINT = process.env.REACT_APP_ISCRIZIONI_URL;
const MSG_WA = 'Ciao, vorrei informazioni sui corsi di formazione finanziata per la mia azienda.';
const AREE = [...new Set(CORSI_FINANZIATI.map((c) => c.area))].sort((a, b) => a.localeCompare(b, 'it'));
const DURATE = [
  { id: '', nome: 'Qualsiasi durata', ok: () => true },
  { id: 'brevi', nome: 'Fino a 8 ore', ok: (o) => o <= 8 },
  { id: 'medi', nome: 'Da 9 a 24 ore', ok: (o) => o > 8 && o <= 24 },
  { id: 'lunghi', nome: 'Oltre 24 ore', ok: (o) => o > 24 },
];
const PASSI = [
  { icona: ClipboardList, titolo: 'Scegli i corsi', testo: 'Seleziona dal catalogo i corsi che servono alla tua azienda e indica quanti partecipanti per ciascuno.' },
  { icona: Building2, titolo: 'Invia la richiesta', testo: 'Inserisci i dati aziendali e il referente. Non si paga nulla e la richiesta non ti impegna.' },
  { icona: BadgeCheck, titolo: 'Verifichiamo e pianifichiamo', testo: 'Controlliamo l’adesione al fondo e inseriamo i corsi nel piano formativo, concordando calendario e modalità.' },
  { icona: GraduationCap, titolo: 'Si parte', testo: 'I tuoi dipendenti seguono i corsi: alla gestione e alla rendicontazione pensiamo noi.' },
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
const temaNome = (id) => (TEMI_FINANZIATI.find((t) => t.id === id) || {}).nome || '';
const campagnaDaUrl = () => {
  if (typeof window === 'undefined') return '';
  const q = new URLSearchParams(window.location.search);
  return (q.get('campagna') || q.get('utm_campaign') || '').replace(/[^\w.-]/g, '').slice(0, 60);
};

function Campo({ label, nome, valore, onChange, errore, tipo = 'text', placeholder, obbligatorio, larghezza = '', maiuscolo }) {
  return (
    <label className={`block ${larghezza}`}>
      <span className="block text-sm font-semibold text-gray-800 mb-1.5">{label}{obbligatorio && <span className="text-gray-400"> *</span>}</span>
      <input
        type={tipo}
        name={nome}
        value={valore}
        placeholder={placeholder}
        onChange={(e) => onChange(nome, maiuscolo ? e.target.value.toUpperCase() : e.target.value)}
        className={`w-full rounded-lg border-2 px-3.5 py-2.5 text-[15px] outline-none transition-colors ${errore ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}
      />
      {errore && <span className="block text-sm text-red-600 mt-1">{errore}</span>}
    </label>
  );
}

function Contatore({ valore, onChange }) {
  return (
    <div className="inline-flex items-center rounded-lg border-2 border-gray-900 overflow-hidden">
      <button type="button" aria-label="Meno partecipanti" onClick={() => onChange(Math.max(1, valore - 1))} className="px-2.5 py-1.5 hover:bg-gray-100"><Minus className="w-4 h-4" /></button>
      <input
        type="number" min="1" max="200" value={valore} aria-label="Partecipanti"
        onChange={(e) => onChange(Math.min(200, Math.max(1, parseInt(e.target.value, 10) || 1)))}
        className="w-12 text-center font-semibold outline-none [appearance:textfield]"
      />
      <button type="button" aria-label="Più partecipanti" onClick={() => onChange(Math.min(200, valore + 1))} className="px-2.5 py-1.5 hover:bg-gray-100"><Plus className="w-4 h-4" /></button>
    </div>
  );
}

export default function FormazioneFinanziata() {
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
  const [moduloVisibile, setModuloVisibile] = useState(false);
  // la barra in basso serve solo finché il modulo non è sullo schermo
  useEffect(() => {
    const el = document.getElementById('richiesta');
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const o = new IntersectionObserver(([e]) => setModuloVisibile(e.isIntersecting), { threshold: 0.05 });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  const filtrati = useMemo(() => {
    const q = cerca.trim().toLowerCase();
    const okDurata = (DURATE.find((d) => d.id === durata) || DURATE[0]).ok;
    return CORSI_FINANZIATI.filter((c) => (!tema || c.tema === tema) && (!area || c.area === area) && okDurata(c.ore)
      && (!q || c.titolo.toLowerCase().includes(q) || c.area.toLowerCase().includes(q)));
  }, [cerca, tema, area, durata]);

  const selezione = CORSI_FINANZIATI.filter((c) => scelti[c.id]);
  const totPartecipanti = selezione.reduce((s, c) => s + scelti[c.id], 0);
  const aggiungi = (id) => setScelti((s) => ({ ...s, [id]: s[id] || 1 }));
  const togli = (id) => setScelti((s) => { const n = { ...s }; delete n[id]; return n; });
  const imposta = (id, n) => setScelti((s) => ({ ...s, [id]: n }));
  const aggiornaAzienda = (k, v) => { setAzienda((a) => ({ ...a, [k]: v })); setErrori((e) => ({ ...e, [k]: undefined })); };
  const vaiAlModulo = () => document.getElementById('richiesta')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
    if (!selezione.length) { setInvio({ stato: 'errore', messaggio: 'Scegli almeno un corso dal catalogo.' }); return; }
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
      setTimeout(() => document.getElementById('richiesta')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch (err) {
      setInvio({ stato: 'errore', messaggio: err.message || 'Invio non riuscito: riprova fra poco.' });
    }
  };

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: DOMANDE.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  });

  return (
    <>
      <WhatsAppFisso testo={MSG_WA} sopraBarra={selezione.length > 0 && invio.stato !== 'fatto' && !moduloVisibile} />
      <SEOHead
        title="Formazione finanziata per le aziende – Catalogo corsi"
        description={`${CORSI_FINANZIATI.length} corsi di formazione finanziata per le aziende aderenti a Fonarcom: sicurezza, digitale, intelligenza artificiale, lingue, organizzazione. Scegli i corsi e richiedili online.`}
        canonical="https://www.mariobruzzese.it/formazione-finanziata"
        schema={schema}
      />

      <div className="min-h-screen pt-36 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-40" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full text-sm font-medium mb-6">
              <BadgeCheck className="w-4 h-4" /> Per le aziende aderenti a Fonarcom
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">Formazione finanziata per la tua azienda</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {CORSI_FINANZIATI.length} corsi tra sicurezza, digitale, intelligenza artificiale, lingue e organizzazione, finanziati dal
              fondo interprofessionale: l’azienda non paga i corsi. Scegli quelli che ti servono, indica quante persone vuoi formare
              e invia la richiesta. Al resto pensiamo noi.
            </p>
            <button type="button" onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-black text-white font-semibold px-5 py-3 hover:bg-gray-800 transition-colors">
              Sfoglia il catalogo <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <section className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PASSI.map((p, i) => (
              <div key={p.titolo} className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center"><p.icona className="w-5 h-5" /></span>
                  <span className="text-sm font-semibold text-gray-400">Passo {i + 1}</span>
                </div>
                <h2 className="font-bold text-gray-900 mb-2">{p.titolo}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{p.testo}</p>
              </div>
            ))}
          </section>

          {/* ------------------------------------------------ catalogo */}
          <section id="catalogo" className="mt-20 scroll-mt-28">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Catalogo dei corsi</h2>
            <p className="text-gray-600 mb-6">Clicca «Aggiungi» sui corsi che ti interessano: li ritrovi nella richiesta in fondo alla pagina.</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {[{ id: '', nome: 'Tutti i temi' }, ...TEMI_FINANZIATI].map((t) => (
                <button key={t.id || 'tutti'} type="button" onClick={() => setTema(t.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${tema === t.id ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                  {t.nome}
                </button>
              ))}
            </div>
            <div className="grid md:grid-cols-[1fr_240px_200px] gap-3 mb-6">
              <label className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="search" value={cerca} onChange={(e) => setCerca(e.target.value)} placeholder="Cerca un corso: es. inglese, carrelli, intelligenza artificiale…"
                  aria-label="Cerca un corso" className="w-full rounded-lg border-2 border-gray-200 focus:border-gray-900 outline-none pl-10 pr-3 py-2.5 bg-white" />
              </label>
              <select value={area} onChange={(e) => setArea(e.target.value)} aria-label="Area formativa" className="rounded-lg border-2 border-gray-200 px-3 py-2.5 bg-white">
                <option value="">Tutte le aree formative</option>
                {AREE.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <select value={durata} onChange={(e) => setDurata(e.target.value)} aria-label="Durata" className="rounded-lg border-2 border-gray-200 px-3 py-2.5 bg-white">
                {DURATE.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </select>
            </div>
            <p className="text-sm text-gray-500 mb-4" aria-live="polite">
              {filtrati.length} {filtrati.length === 1 ? 'corso' : 'corsi'}
              {(cerca || tema || area || durata) && (
                <button type="button" onClick={() => { setCerca(''); setTema(''); setArea(''); setDurata(''); }} className="ml-3 underline">azzera i filtri</button>
              )}
            </p>

            <ul className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtrati.map((c) => {
                const sel = Boolean(scelti[c.id]);
                return (
                  <li key={c.id} className={`flex flex-col justify-between rounded-xl border-2 p-5 bg-white transition-colors ${sel ? 'border-gray-900' : 'border-gray-100'}`}>
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{c.area}</span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{c.ore} ore</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 leading-snug">{c.titolo}</h3>
                      <p className="text-xs text-gray-400 mt-1">{temaNome(c.tema)}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      {sel ? (
                        <>
                          <div className="flex items-center gap-2 text-sm text-gray-600"><Contatore valore={scelti[c.id]} onChange={(n) => imposta(c.id, n)} /> partecipanti</div>
                          <button type="button" onClick={() => togli(c.id)} aria-label={`Togli ${c.titolo}`} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <button type="button" onClick={() => aggiungi(c.id)} className="inline-flex items-center gap-1.5 rounded-lg border-2 border-gray-900 px-3.5 py-1.5 text-sm font-semibold hover:bg-gray-900 hover:text-white transition-colors">
                          <Plus className="w-4 h-4" /> Aggiungi
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {!filtrati.length && <p className="text-gray-600 py-10 text-center">Nessun corso con questi filtri.</p>}
          </section>

          {/* ------------------------------------------------ richiesta */}
          <section id="richiesta" className="mt-24 scroll-mt-28 grid lg:grid-cols-[1fr_400px] gap-10 items-start">
            {invio.stato === 'fatto' ? (
              <div className="lg:col-span-2 bg-white border-2 border-gray-100 rounded-2xl p-10 text-center">
                <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center"><CheckCircle2 className="w-8 h-8" /></div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Richiesta inviata</h2>
                <p className="text-gray-600 text-lg max-w-xl mx-auto">
                  Grazie! Il riferimento della tua richiesta è <strong>{invio.riferimento}</strong>. Ti abbiamo mandato un’email di riepilogo
                  e ti contatteremo nei prossimi giorni per verificare l’adesione e concordare i dettagli.
                </p>
              </div>
            ) : (
              <>
                <form onSubmit={invia} noValidate className="bg-white border-2 border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Richiedi i corsi</h2>
                  <p className="text-gray-600 mb-6">Nessun costo e nessun impegno: dopo l’invio ti contattiamo per verificare i requisiti.</p>

                  <h3 className="font-bold text-gray-900 mb-3">Dati dell’azienda</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Campo label="Ragione sociale" nome="ragioneSociale" valore={azienda.ragioneSociale} onChange={aggiornaAzienda} errore={errori.ragioneSociale} obbligatorio larghezza="sm:col-span-2" />
                    <Campo label="Partita IVA" nome="partitaIva" valore={azienda.partitaIva} onChange={aggiornaAzienda} errore={errori.partitaIva} obbligatorio />
                    <Campo label="Codice fiscale (se diverso)" nome="codiceFiscale" valore={azienda.codiceFiscale} onChange={aggiornaAzienda} errore={errori.codiceFiscale} maiuscolo />
                    <Campo label="Matricola INPS" nome="matricolaInps" valore={azienda.matricolaInps} onChange={aggiornaAzienda} errore={errori.matricolaInps} placeholder="10 caratteri" maiuscolo />
                    <Campo label="Codice ATECO" nome="ateco" valore={azienda.ateco} onChange={aggiornaAzienda} errore={errori.ateco} placeholder="es. 47.11" />
                    <Campo label="Numero di dipendenti" nome="dipendenti" tipo="number" valore={azienda.dipendenti} onChange={aggiornaAzienda} />
                    <div>
                      <span className="block text-sm font-semibold text-gray-800 mb-1.5">L’azienda aderisce a Fonarcom? <span className="text-gray-400">*</span></span>
                      <div className="flex flex-wrap gap-2">
                        {[['si', 'Sì'], ['no', 'No'], ['non_so', 'Non lo so']].map(([v, t]) => (
                          <button key={v} type="button" onClick={() => aggiornaAzienda('fonarcom', v)}
                            className={`px-3.5 py-2 rounded-lg border-2 text-sm font-semibold ${azienda.fonarcom === v ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-gray-400'}`}>{t}</button>
                        ))}
                      </div>
                      {errori.fonarcom && <span className="block text-sm text-red-600 mt-1">{errori.fonarcom}</span>}
                    </div>
                    <Campo label="Indirizzo della sede" nome="indirizzo" valore={azienda.indirizzo} onChange={aggiornaAzienda} errore={errori.indirizzo} obbligatorio larghezza="sm:col-span-2" />
                    <Campo label="CAP" nome="cap" valore={azienda.cap} onChange={aggiornaAzienda} errore={errori.cap} obbligatorio />
                    <Campo label="Città" nome="citta" valore={azienda.citta} onChange={aggiornaAzienda} errore={errori.citta} obbligatorio />
                    <label className="block sm:col-span-2">
                      <span className="block text-sm font-semibold text-gray-800 mb-1.5">Provincia <span className="text-gray-400">*</span></span>
                      <select value={azienda.provincia} onChange={(e) => aggiornaAzienda('provincia', e.target.value)}
                        className={`w-full rounded-lg border-2 px-3.5 py-2.5 bg-white outline-none ${errori.provincia ? 'border-red-400' : 'border-gray-200 focus:border-gray-900'}`}>
                        <option value="">— seleziona —</option>
                        {province.map((p) => <option key={p.sigla} value={p.sigla}>{p.nome} ({p.sigla})</option>)}
                      </select>
                      {errori.provincia && <span className="block text-sm text-red-600 mt-1">{errori.provincia}</span>}
                    </label>
                  </div>

                  <h3 className="font-bold text-gray-900 mt-8 mb-3">Referente</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Campo label="Nome e cognome" nome="referente" valore={azienda.referente} onChange={aggiornaAzienda} errore={errori.referente} obbligatorio />
                    <Campo label="Ruolo" nome="ruolo" valore={azienda.ruolo} onChange={aggiornaAzienda} placeholder="es. titolare, HR, amministrazione" />
                    <Campo label="Email" nome="email" tipo="email" valore={azienda.email} onChange={aggiornaAzienda} errore={errori.email} obbligatorio />
                    <Campo label="Telefono" nome="telefono" tipo="tel" valore={azienda.telefono} onChange={aggiornaAzienda} errore={errori.telefono} obbligatorio />
                    <Campo label="PEC" nome="pec" tipo="email" valore={azienda.pec} onChange={aggiornaAzienda} errore={errori.pec} larghezza="sm:col-span-2" />
                  </div>

                  <h3 className="font-bold text-gray-900 mt-8 mb-3">Preferenze</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="block text-sm font-semibold text-gray-800 mb-1.5">Modalità preferita</span>
                      <select value={azienda.modalita} onChange={(e) => aggiornaAzienda('modalita', e.target.value)} className="w-full rounded-lg border-2 border-gray-200 px-3.5 py-2.5 bg-white">
                        <option value="indifferente">Indifferente</option>
                        <option value="presenza">In presenza</option>
                        <option value="online">Online</option>
                      </select>
                    </label>
                    <Campo label="Periodo preferito" nome="periodo" valore={azienda.periodo} onChange={aggiornaAzienda} placeholder="es. da febbraio, dopo la stagione" />
                    <label className="block sm:col-span-2">
                      <span className="block text-sm font-semibold text-gray-800 mb-1.5">Note</span>
                      <textarea rows="3" value={azienda.note} onChange={(e) => aggiornaAzienda('note', e.target.value)} maxLength={1000}
                        className="w-full rounded-lg border-2 border-gray-200 focus:border-gray-900 outline-none px-3.5 py-2.5" />
                    </label>
                  </div>
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-5000px', width: 1, height: 1, overflow: 'hidden' }}>
                    <input type="text" name="sito" tabIndex={-1} autoComplete="off" value={trappola} onChange={(e) => setTrappola(e.target.value)} />
                  </div>
                  <label className="flex gap-3 items-start mt-6 text-sm text-gray-600 leading-relaxed">
                    <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-1 w-4 h-4 accent-black" />
                    <span>Ho letto l’<Link to="/privacy" target="_blank" className="underline font-medium text-gray-900">informativa privacy</Link> e acconsento al trattamento dei dati per la gestione della richiesta. *</span>
                  </label>
                  {invio.stato === 'errore' && <p role="alert" className="mt-4 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{invio.messaggio}</p>}
                  <button type="submit" disabled={invio.stato === 'invio'}
                    className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-black text-white font-semibold py-3.5 hover:bg-gray-800 disabled:opacity-60 transition-colors">
                    {invio.stato === 'invio' ? 'Invio in corso…' : <>Invia la richiesta <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <aside className="bg-gray-900 text-white rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-1">I corsi scelti</h3>
                  <p className="text-sm text-gray-400 mb-4">{selezione.length ? `${selezione.length} ${selezione.length === 1 ? 'corso' : 'corsi'} · ${totPartecipanti} partecipanti in tutto` : 'Nessun corso scelto: aggiungili dal catalogo.'}</p>
                  <ul className="space-y-3">
                    {selezione.map((c) => (
                      <li key={c.id} className="border-t border-white/10 pt-3">
                        <div className="flex justify-between gap-3">
                          <span className="text-sm font-medium leading-snug">{c.titolo}</span>
                          <button type="button" onClick={() => togli(c.id)} aria-label={`Togli ${c.titolo}`} className="text-gray-400 hover:text-white shrink-0"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                          <span className="bg-white text-gray-900 rounded-lg"><Contatore valore={scelti[c.id]} onChange={(n) => imposta(c.id, n)} /></span>
                          partecipanti · {c.ore} ore
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })} className="mt-5 text-sm underline text-gray-300">
                    {selezione.length ? 'Aggiungi altri corsi' : 'Vai al catalogo'}
                  </button>
                </aside>
              </>
            )}
          </section>

          <section className="mt-24 max-w-3xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Domande frequenti</h2>
            <div className="divide-y-2 divide-gray-100 border-y-2 border-gray-100">
              {DOMANDE.map(([d, r]) => (
                <details key={d} className="group py-5">
                  <summary className="flex justify-between items-center gap-4 cursor-pointer list-none font-semibold text-gray-900">
                    {d}<ArrowRight className="w-4 h-4 shrink-0 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-gray-600 leading-relaxed">{r}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>

      {selezione.length > 0 && invio.stato !== 'fatto' && !moduloVisibile && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t-2 border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-3 md:pr-72 flex items-center justify-between gap-4">
            <span className="text-sm text-gray-700"><strong>{selezione.length}</strong> {selezione.length === 1 ? 'corso scelto' : 'corsi scelti'} · <strong>{totPartecipanti}</strong> partecipanti</span>
            <button type="button" onClick={vaiAlModulo} className="inline-flex items-center gap-2 rounded-lg bg-black text-white font-semibold px-4 py-2.5 hover:bg-gray-800">
              Continua con la richiesta <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
