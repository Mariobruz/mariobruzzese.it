import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Clock, Laptop, MapPin, Sun, Users } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { WhatsAppFisso, WhatsAppLink } from '../components/WhatsApp';
import { corsiPubblicabili } from '../data/corsiSicurezza';

/**
 * Pagina locale: corsi di sicurezza sul lavoro online per le aziende calabresi.
 * Prezzi e corsi vengono dal catalogo vero (niente prezzi scritti a mano).
 */
const MSG_WA = 'Ciao, ho un’azienda in Calabria e vorrei informazioni sui corsi di sicurezza sul lavoro.';
const CANONICAL = 'https://www.mariobruzzese.it/corsi-sicurezza-calabria';

// corsi più richiesti, nell'ordine in cui li mostriamo
const PIU_RICHIESTI = [
  'formazione-generale-specifica-rischio-basso-8h',
  'formazione-generale-lavoratori-4h',
  'aggiornamento-lavoratori-tutti-rischi-6h',
  'datore-di-lavoro-16h',
  'aggiornamento-datore-lavoro-6h',
  'aggiornamento-rspp-datore-lavoro-8h',
  'rls-32h',
  'aggiornamento-rls-fino-50-4h',
];
const TURISMO = [
  'formazione-specifica-rischio-basso-turismo-4h',
  'osa-rischio-elevato-8h',
  'osa-rischio-medio-6h',
  'aggiornamento-osa-4h',
];

const PROVINCE = [
  { nome: 'Catanzaro', comuni: 'Catanzaro, Lamezia Terme, Soverato, Girifalco, Borgia, Sellia Marina' },
  { nome: 'Cosenza', comuni: 'Cosenza, Rende, Corigliano-Rossano, Castrovillari, Paola, Amantea, Scalea' },
  { nome: 'Crotone', comuni: 'Crotone, Isola di Capo Rizzuto, Cirò Marina, Cutro, Petilia Policastro' },
  { nome: 'Reggio Calabria', comuni: 'Reggio Calabria, Gioia Tauro, Palmi, Villa San Giovanni, Siderno, Locri, Taurianova' },
  { nome: 'Vibo Valentia', comuni: 'Vibo Valentia, Tropea, Pizzo, Serra San Bruno, Mileto, Nicotera' },
];

const VANTAGGI = [
  { icona: MapPin, titolo: 'Niente trasferte', testo: 'Da Scalea a Reggio, da Crotone a Tropea: i lavoratori seguono il corso dove si trovano, senza raggiungere un’aula e senza fermare l’attività.' },
  { icona: Clock, titolo: 'Quando vuoi', testo: 'Corsi asincroni, disponibili 24 ore su 24 da computer, tablet o telefono, negli orari che decidi tu.' },
  { icona: BadgeCheck, titolo: 'Attestato verificabile', testo: 'In convenzione con O.P.N. Italia Lavoro: l’attestato indica come soggetto formatore O.P.N. Italia Lavoro – CNL – EBAFoS ed è verificabile tramite QR code.' },
  { icona: Users, titolo: 'Tutti i dipendenti insieme', testo: 'Iscrivi in un solo ordine tutti i lavoratori da formare, anche con corsi diversi per ciascuno.' },
];

const DOMANDE = [
  ['Un corso online vale anche per un’azienda calabrese?', 'Sì. La formazione sulla sicurezza è regolata da norme nazionali, il D.Lgs. 81/2008 e l’Accordo Stato-Regioni del 17 aprile 2025, uguali in tutta Italia. Proponiamo solo i corsi che l’Accordo consente di svolgere in e-learning.'],
  ['Chi rilascia l’attestato?', 'L’attestato indica come soggetto formatore O.P.N. Italia Lavoro – CNL – EBAFoS ed è verificabile tramite QR code sul sito opnitalialavoro.it.'],
  ['Quanto tempo serve per iniziare?', 'Dopo il pagamento, entro 24 ore lavorative iscriviamo i partecipanti sulla piattaforma: ciascuno riceve un’email con link, nome utente e password.'],
  ['Come si paga?', 'Online con carta di credito o di debito, in modo sicuro tramite Stripe. Ricevi la fattura intestata alla tua azienda.'],
  ['Avete una sede in Calabria?', 'Sì: MB Consulting ha sede legale a Reggio Calabria, in Via Aspromonte 16. I corsi però sono interamente online, quindi non serve venire in sede.'],
];

const euro = (n) => `${Number(n).toLocaleString('it-IT')} €`;

function Scheda({ c }) {
  return (
    <Link
      to={`/corsi-sicurezza/${c.id}`}
      className="group flex items-center justify-between gap-4 bg-white border-2 border-gray-100 hover:border-gray-900 rounded-xl px-5 py-4 transition-colors"
    >
      <div>
        <div className="font-semibold text-gray-900">{c.titolo}</div>
        <div className="text-sm text-gray-500">{c.ore} ore · e-learning</div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-bold text-gray-900">{euro(c.prezzo)}</span>
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-gray-900 transition-all" />
      </div>
    </Link>
  );
}

export default function CorsiCalabria() {
  const tutti = corsiPubblicabili();
  const scegli = (ids) => ids.map((id) => tutti.find((c) => c.id === id)).filter(Boolean);
  const richiesti = scegli(PIU_RICHIESTI);
  const turismo = scegli(TURISMO);
  const minimo = Math.min(...tutti.map((c) => c.prezzo));

  const schema = JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Corsi di sicurezza sul lavoro online in Calabria',
      serviceType: 'Formazione sicurezza sul lavoro D.Lgs. 81/08 in e-learning',
      url: CANONICAL,
      areaServed: [{ '@type': 'State', name: 'Calabria' }, ...PROVINCE.map((p) => ({ '@type': 'AdministrativeArea', name: `Provincia di ${p.nome}` }))],
      provider: {
        '@type': 'Organization',
        name: 'MB Consulting di Mario Bruzzese',
        url: 'https://www.mariobruzzese.it',
        address: { '@type': 'PostalAddress', streetAddress: 'Via Aspromonte 16', postalCode: '89127', addressLocality: 'Reggio Calabria', addressRegion: 'RC', addressCountry: 'IT' },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: DOMANDE.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ]);

  return (
    <>
      <WhatsAppFisso testo={MSG_WA} />
      <SEOHead
        title="Corsi Sicurezza sul Lavoro Online in Calabria"
        description={`Corsi di sicurezza sul lavoro online per aziende di Catanzaro, Cosenza, Crotone, Reggio Calabria e Vibo Valentia. Attestato con QR code, da ${minimo} €.`}
        canonical={CANONICAL}
        schema={schema}
      />

      <div className="min-h-screen pt-36 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-40" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <nav className="text-sm text-gray-500 mb-6" aria-label="Percorso">
              <Link to="/corsi-sicurezza" className="hover:text-gray-900 underline underline-offset-4">Corsi sicurezza</Link>
              <span className="mx-2">/</span>
              <span>Calabria</span>
            </nav>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" /> Calabria · tutte e 5 le province
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Corsi di sicurezza sul lavoro online in Calabria
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Formazione obbligatoria D.Lgs. 81/08 in e-learning per aziende e lavoratori di Catanzaro, Cosenza, Crotone,
              Reggio Calabria e Vibo Valentia. Corsi conformi all’Accordo Stato-Regioni 2025, attestato verificabile con
              QR code, prezzi da {minimo} € a partecipante.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/corsi-sicurezza" className="inline-flex items-center gap-2 rounded-lg bg-black text-white font-semibold px-5 py-3 hover:bg-gray-800 transition-colors">
                Vedi tutti i corsi <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="w-full sm:w-auto sm:min-w-[260px]"><WhatsAppLink testo={MSG_WA}>Scrivici su WhatsApp</WhatsAppLink></div>
            </div>
          </motion.div>

          <section className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VANTAGGI.map((v) => (
              <div key={v.titolo} className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-xl p-6">
                <v.icona className="w-6 h-6 mb-4" />
                <h2 className="font-bold text-gray-900 mb-2">{v.titolo}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{v.testo}</p>
              </div>
            ))}
          </section>

          <section className="mt-20 grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">I corsi più richiesti</h2>
              <p className="text-gray-600 mb-6">Prezzi a partecipante, IVA compresa. Clicca su un corso per programma, durata e iscrizione.</p>
              <div className="grid gap-3">{richiesti.map((c) => <Scheda key={c.id} c={c} />)}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-2"><Sun className="w-4 h-4" /> Turismo, ristorazione e alimentare</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Stagionali, bar, ristoranti e hotel</h2>
              <p className="text-gray-600 mb-6">
                Per chi assume personale per la stagione estiva: formazione specifica per turismo e ristorazione e corsi HACCP,
                da far seguire online prima dell’inizio del lavoro.
              </p>
              <div className="grid gap-3">{turismo.map((c) => <Scheda key={c.id} c={c} />)}</div>
            </div>
          </section>

          <section className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">In tutte le province calabresi</h2>
            <p className="text-gray-600 mb-8 max-w-3xl">
              I corsi sono interamente online: valgono allo stesso modo per un’impresa del capoluogo e per una piccola attività
              dell’entroterra o della costa.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {PROVINCE.map((p) => (
                <div key={p.nome} className="bg-white/80 border-2 border-gray-100 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-2">Provincia di {p.nome}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.comuni} e tutti gli altri comuni.</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20 grid lg:grid-cols-[1fr_380px] gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Domande frequenti</h2>
              <div className="divide-y-2 divide-gray-100 border-y-2 border-gray-100">
                {DOMANDE.map(([d, r]) => (
                  <details key={d} className="group py-5">
                    <summary className="flex justify-between items-center gap-4 cursor-pointer list-none font-semibold text-gray-900">
                      {d}
                      <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="mt-3 text-gray-600 leading-relaxed">{r}</p>
                  </details>
                ))}
              </div>
            </div>
            <aside className="bg-gray-900 text-white rounded-2xl p-8">
              <Laptop className="w-7 h-7 mb-4" />
              <h2 className="text-2xl font-bold mb-3">Metti in regola la tua azienda</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                Scegli il corso, inserisci i partecipanti e paga online: entro 24 ore lavorative ricevono le credenziali.
              </p>
              <Link to="/corsi-sicurezza" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white text-black font-semibold px-5 py-3 hover:bg-gray-100 transition-colors">
                Scegli il corso <ArrowRight className="w-4 h-4" />
              </Link>
            </aside>
          </section>
        </div>
      </div>
    </>
  );
}
