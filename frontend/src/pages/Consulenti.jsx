import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, BadgeCheck, BarChart3, Briefcase, CheckCircle2, Laptop, Link2, LogIn, Percent, ShieldCheck, Users, Wallet,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { WhatsAppFisso, WhatsAppLink } from '../components/WhatsApp';
import { corsiPubblicabili, prezzoCorrente } from '../data/corsiSicurezza';

/**
 * Programma consulenti: presentazione + modulo di registrazione.
 * Il modulo invia i dati al Worker "area-consulenti", che crea il consulente
 * "in attesa di contratto" e gli manda per email il link alla sua area riservata.
 */
const AREA = process.env.REACT_APP_AREA_CONSULENTI_URL || 'https://area-consulenti.mario-bruz.workers.dev';
const MSG_WA = 'Ciao, vorrei informazioni sul programma consulenti di MB Consulting.';

const NUMERI = [
  { valore: '−20%', testo: 'di sconto per i tuoi clienti su tutti i corsi' },
  { valore: '40%', testo: 'dell’incassato a te, su ogni ordine con il tuo codice' },
  { valore: '0 €', testo: 'costi di adesione: nessun canone, nessun minimo' },
];

const PASSI = [
  { icona: BadgeCheck, titolo: 'Ti registri', testo: 'Compili il modulo qui sotto e ricevi subito l’accesso alla tua area riservata.' },
  { icona: Briefcase, titolo: 'Firmiamo l’accordo', testo: 'Ti inviamo l’accordo di collaborazione. Appena è firmato, il tuo codice sconto si attiva.' },
  { icona: Link2, titolo: 'Condividi il codice', testo: 'Lo giri ai tuoi clienti, o mandi il link che lo inserisce da solo nel modulo d’iscrizione.' },
  { icona: Wallet, titolo: 'Ricevi il compenso', testo: 'Per ogni ordine pagato con il tuo codice matura il tuo compenso, visibile in tempo reale.' },
];

const VANTAGGI = [
  { icona: Laptop, titolo: 'Corsi e-learning pronti', testo: 'Lavoratori, datore di lavoro, RSPP, RLS, dirigenti, formatori, HACCP: corsi asincroni, fruibili 24 ore su 24.' },
  { icona: ShieldCheck, titolo: 'Attestati verificabili', testo: 'In convenzione con O.P.N. Italia Lavoro, con attestato verificabile tramite QR code.' },
  { icona: BarChart3, titolo: 'Tutto sotto controllo', testo: 'Nella tua area vedi ordini, partecipanti, compensi maturati e pagamenti ricevuti, e scarichi il CSV.' },
  { icona: Users, titolo: 'Zero gestione per te', testo: 'Iscrizioni, pagamenti, accessi alla piattaforma e assistenza ai partecipanti li seguiamo noi.' },
];

const DOMANDE = [
  ['Chi può aderire?', 'Consulenti del lavoro, commercialisti, RSPP esterni, studi e associazioni che seguono aziende e vogliono offrire ai propri clienti la formazione obbligatoria sulla sicurezza.'],
  ['Come si calcola il compenso?', 'È il 40% di quanto effettivamente incassato per ogni ordine pagato con il tuo codice, cioè sul prezzo già scontato. Gli ordini non pagati non generano compenso.'],
  ['Il cliente paga di più?', 'No: con il tuo codice il cliente ha il 20% di sconto sul prezzo esposto sul sito.'],
  ['Cosa vedo dei miei clienti?', 'Per ogni ordine fatto con il tuo codice: intestatario, contatti, partecipanti, corsi acquistati, importo e stato del tuo compenso.'],
  ['Come entro nella mia area? Serve una password?', 'Non serve nessuna password. Dopo la registrazione ti arriva subito un’email con il pulsante «Entra»: lo apri e sei dentro. Le volte successive vai su questa pagina, clicchi «Accedi alla tua area» e scrivi la tua email: ti mandiamo un nuovo link per entrare. Sullo stesso computer o telefono resti collegato per 30 giorni, quindi di solito ti basta riaprire la pagina. Per sicurezza ogni link vale 15 minuti e si usa una sola volta: se scade, ne chiedi un altro.'],
];

const Campo = ({ etichetta, nome, tipo = 'text', valore, onChange, autoComplete, placeholder, obbligatorio }) => (
  <label className="block">
    <span className="block text-sm font-semibold text-gray-800 mb-1.5">
      {etichetta}{obbligatorio && <span className="text-gray-400"> *</span>}
    </span>
    <input
      type={tipo}
      name={nome}
      value={valore}
      onChange={(e) => onChange(nome, e.target.value)}
      autoComplete={autoComplete}
      placeholder={placeholder}
      className="w-full rounded-lg border-2 border-gray-200 px-3.5 py-2.5 text-[15px] focus:border-gray-900 focus:outline-none transition-colors"
    />
  </label>
);

function ModuloRegistrazione() {
  const [dati, setDati] = useState({ nome: '', cognome: '', ragioneSociale: '', pivaCf: '', email: '', telefono: '', pec: '', sito: '' });
  const [privacy, setPrivacy] = useState(false);
  const [stato, setStato] = useState({ invio: false, errore: '', fatto: '' });
  const aggiorna = (k, v) => setDati((d) => ({ ...d, [k]: v }));

  const invia = async (e) => {
    e.preventDefault();
    if (!privacy) { setStato({ invio: false, errore: 'Per registrarti devi accettare l’informativa privacy.', fatto: '' }); return; }
    setStato({ invio: true, errore: '', fatto: '' });
    try {
      const r = await fetch(`${AREA}/api/registrazione`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Area': '1' },
        body: JSON.stringify({ ...dati, privacy: true }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.errore || 'Invio non riuscito: riprova fra poco.');
      setStato({ invio: false, errore: '', fatto: (d.messaggio || '').replace(/^Registrazione ricevuta\.\s*/, '') || 'Ti abbiamo mandato un’email con il link per entrare nella tua area.' });
    } catch (err) {
      setStato({ invio: false, errore: err.message || 'Invio non riuscito: riprova fra poco.', fatto: '' });
    }
  };

  if (stato.fatto) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Registrazione ricevuta</h3>
        <p className="text-gray-600 leading-relaxed">{stato.fatto}</p>
        <p className="text-sm text-gray-500 mt-4">Ti contatteremo a breve per l’accordo di collaborazione.</p>
      </div>
    );
  }

  return (
    <form onSubmit={invia} noValidate>
      <div className="grid sm:grid-cols-2 gap-4">
        <Campo etichetta="Nome" nome="nome" valore={dati.nome} onChange={aggiorna} autoComplete="given-name" obbligatorio />
        <Campo etichetta="Cognome" nome="cognome" valore={dati.cognome} onChange={aggiorna} autoComplete="family-name" obbligatorio />
        <div className="sm:col-span-2">
          <Campo etichetta="Studio / ragione sociale" nome="ragioneSociale" valore={dati.ragioneSociale} onChange={aggiorna} autoComplete="organization" placeholder="Studio Rossi" />
        </div>
        <div className="sm:col-span-2">
          <Campo etichetta="Partita IVA o codice fiscale" nome="pivaCf" valore={dati.pivaCf} onChange={aggiorna} autoComplete="off" obbligatorio />
        </div>
        <div className="sm:col-span-2">
          <Campo etichetta="Email" nome="email" tipo="email" valore={dati.email} onChange={aggiorna} autoComplete="email" placeholder="nome@studio.it" obbligatorio />
        </div>
        <Campo etichetta="Telefono" nome="telefono" tipo="tel" valore={dati.telefono} onChange={aggiorna} autoComplete="tel" obbligatorio />
        <Campo etichetta="PEC" nome="pec" tipo="email" valore={dati.pec} onChange={aggiorna} autoComplete="off" />
      </div>
      {/* campo trappola per i robot: le persone non lo vedono */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-5000px', width: 1, height: 1, overflow: 'hidden' }}>
        <input type="text" name="sito" tabIndex={-1} autoComplete="off" value={dati.sito} onChange={(e) => aggiorna('sito', e.target.value)} />
      </div>
      <label className="flex gap-3 items-start mt-5 text-sm text-gray-600 leading-relaxed">
        <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-1 w-4 h-4 accent-black" />
        <span>
          Ho letto l’<a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline font-medium text-gray-900">informativa privacy</a> e
          acconsento al trattamento dei miei dati per la gestione della collaborazione. *
        </span>
      </label>
      {stato.errore && <p role="alert" className="mt-4 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{stato.errore}</p>}
      <button
        type="submit"
        disabled={stato.invio}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-black text-white font-semibold py-3.5 hover:bg-gray-800 disabled:opacity-60 transition-colors"
      >
        {stato.invio ? 'Invio in corso…' : <>Registrati come consulente <ArrowRight className="w-4 h-4" /></>}
      </button>
      <p className="mt-3 text-xs text-gray-500 text-center">Riceverai subito un’email con il link per entrare nella tua area. Controlla anche lo spam.</p>
    </form>
  );
}

// esempio calcolato sul listino vero: si aggiorna da solo quando cambiano i prezzi
const esempio = (() => {
  const elenco = corsiPubblicabili();
  const c = elenco.find((x) => x.id === 'formazione-generale-specifica-rischio-basso-8h') || elenco[0];
  const pieno = prezzoCorrente(c);
  const scontato = Math.round(pieno * 0.8 * 100) / 100;
  const euro = (n) => `${n.toLocaleString('it-IT', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })} €`;
  return { titolo: c.titolo, pieno: euro(pieno), totPieno: euro(pieno * 5), scontato: euro(scontato), totScontato: euro(scontato * 5), compenso: euro(Math.round(scontato * 5 * 0.4 * 100) / 100) };
})();

export default function Consulenti() {
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Programma consulenti — corsi di sicurezza sul lavoro',
    url: 'https://www.mariobruzzese.it/consulenti',
  });

  return (
    <>
      <WhatsAppFisso testo={MSG_WA} />
      <SEOHead
        title="Programma consulenti – Corsi sicurezza sul lavoro"
        description="Consulente del lavoro, commercialista o RSPP? Offri ai tuoi clienti i corsi di sicurezza online con il 20% di sconto e ricevi il 40% dell’incassato. Registrazione gratuita."
        canonical="https://www.mariobruzzese.it/consulenti"
        schema={schema}
      />

      <div className="min-h-screen pt-36 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-40" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full text-sm font-medium mb-6">
                <Briefcase className="w-4 h-4" /> Programma consulenti
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Offri ai tuoi clienti la formazione sulla sicurezza. Al resto pensiamo noi.
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-10">
                Per consulenti del lavoro, commercialisti e RSPP esterni: un codice personale che dà ai tuoi clienti
                il 20% di sconto sui corsi e-learning e a te il 40% dell’incassato, con un’area riservata per seguire tutto.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mb-10">
                {NUMERI.map((n) => (
                  <div key={n.valore} className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-xl p-5">
                    <div className="text-3xl font-bold text-gray-900">{n.valore}</div>
                    <div className="text-sm text-gray-600 mt-1 leading-snug">{n.testo}</div>
                  </div>
                ))}
              </div>
              <a href={`${AREA}/`} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 underline underline-offset-4">
                <LogIn className="w-4 h-4" /> Sei già registrato? Accedi alla tua area
              </a>
            </motion.div>

            <motion.div
              id="registrazione"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white border-2 border-gray-100 rounded-2xl shadow-xl p-6 md:p-8 relative"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Registrati gratuitamente</h2>
              <p className="text-gray-600 mb-6 text-[15px]">Due minuti, nessun costo. Il codice si attiva dopo l’accordo di collaborazione.</p>
              <ModuloRegistrazione />
            </motion.div>
          </div>

          <section className="mt-24">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">Come funziona</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {PASSI.map((p, i) => (
                <div key={p.titolo} className="relative bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center"><p.icona className="w-5 h-5" /></span>
                    <span className="text-sm font-semibold text-gray-400">Passo {i + 1}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{p.titolo}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.testo}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-24 grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Perché conviene</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                I tuoi clienti hanno comunque l’obbligo di formare datori di lavoro e lavoratori. Tu offri loro un prezzo
                migliore e un servizio completo, senza occuparti di iscrizioni, pagamenti e piattaforme.
              </p>
              <div className="grid sm:grid-cols-2 gap-5">
                {VANTAGGI.map((v) => (
                  <div key={v.titolo}>
                    <v.icona className="w-6 h-6 mb-3" />
                    <h3 className="font-bold text-gray-900 mb-1">{v.titolo}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{v.testo}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900 text-white rounded-2xl p-8">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4"><Percent className="w-4 h-4" /> Esempio</div>
              <p className="text-lg leading-relaxed mb-6">
                Un tuo cliente iscrive 5 lavoratori al corso «{esempio.titolo}».
              </p>
              <dl className="space-y-3 text-[15px]">
                <div className="flex justify-between border-b border-white/10 pb-3"><dt className="text-gray-400">Prezzo esposto</dt><dd>5 × {esempio.pieno} = {esempio.totPieno}</dd></div>
                <div className="flex justify-between border-b border-white/10 pb-3"><dt className="text-gray-400">Il cliente paga con il tuo codice</dt><dd>5 × {esempio.scontato} = {esempio.totScontato}</dd></div>
                <div className="flex justify-between pt-1"><dt className="font-semibold">Il tuo compenso (40%)</dt><dd className="text-2xl font-bold">{esempio.compenso}</dd></div>
              </dl>
            </div>
          </section>

          <section className="mt-24 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Domande frequenti</h2>
            <div className="divide-y-2 divide-gray-100 border-y-2 border-gray-100">
              {DOMANDE.map(([d, r]) => (
                <details key={d} className="group py-5">
                  <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-gray-900">
                    {d}
                    <ArrowRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-gray-600 leading-relaxed">{r}</p>
                </details>
              ))}
            </div>
            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              <a href="#registrazione" className="inline-flex items-center justify-center gap-2 rounded-md bg-black text-white font-semibold px-4 py-2.5 hover:bg-gray-800 transition-colors">
                Registrati ora <ArrowRight className="w-4 h-4" />
              </a>
              <WhatsAppLink testo={MSG_WA}>Hai domande? Scrivici su WhatsApp</WhatsAppLink>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
