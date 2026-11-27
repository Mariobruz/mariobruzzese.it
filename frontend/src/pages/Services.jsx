import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, BarChart3, BookOpen, CalendarDays, FilePenLine, FolderOpen, HardHat, Layers, Search,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import ContactModal from '../components/ContactModal';

/**
 * Servizi: consulenza per la formazione finanziata, dalla verifica del fondo
 * alla rendicontazione. Stessa impaginazione delle pagine Per le aziende,
 * Per i professionisti ed E-learning 81/08.
 */
const BTN_VERDE = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f8a6a] text-white font-bold hover:bg-[#0c7458] transition-colors';

const SERVIZI = [
  { icona: Layers, titolo: 'Fondi interprofessionali', testo: 'Verifichiamo il fondo a cui aderisce la tua azienda e valutiamo gli strumenti disponibili per finanziare la formazione.' },
  { icona: Search, titolo: 'Analisi dei fabbisogni', testo: 'Individuiamo con te le competenze da sviluppare, le persone da coinvolgere e le priorità aziendali.' },
  { icona: FilePenLine, titolo: 'Progettazione del piano', testo: 'Definiamo obiettivi, contenuti, durata e modalità dei corsi in base alle esigenze dell’azienda e ai requisiti dello strumento scelto.' },
  { icona: CalendarDays, titolo: 'Organizzazione ed erogazione dei corsi', testo: 'Concordiamo il calendario, coordiniamo docenti e partecipanti e seguiamo lo svolgimento delle attività formative.' },
  { icona: FolderOpen, titolo: 'Gestione amministrativa', testo: 'Predisponiamo la documentazione richiesta e seguiamo le pratiche del piano, dalla presentazione alla gestione delle attività.' },
  { icona: BarChart3, titolo: 'Rendicontazione', testo: 'Raccogliamo i registri e i documenti previsti e curiamo la rendicontazione finale secondo le procedure del fondo.' },
];

const PASSI = [
  { titolo: 'Verifica iniziale', testo: 'Analizziamo la tua situazione e le opportunità di finanziamento.' },
  { titolo: 'Piano formativo', testo: 'Definiamo insieme obiettivi, contenuti e modalità del percorso.' },
  { titolo: 'Erogazione e chiusura', testo: 'Gestiamo i corsi e completiamo tutte le attività di chiusura.' },
];

const Services = () => {
  const [contattoAperto, setContattoAperto] = useState(false);

  return (
    <div className="bg-white">
      <SEOHead
        title="Consulenza Fondi Interprofessionali per Aziende"
        description="Scopri i servizi di MB Consulting per i fondi interprofessionali: scelta del fondo, progettazione del piano formativo, rendicontazione e gestione completa."
        canonical="https://www.mariobruzzese.it/servizi"
      />

      {/* ------------------------------------------------ apertura */}
      <section className="pt-28">
        <div className="grid lg:grid-cols-2 bg-[#0f2742] lg:min-h-[580px]">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
            className="px-6 sm:px-12 lg:pl-[max(3rem,calc((100vw-80rem)/2+1.5rem))] py-14 lg:py-16 flex flex-col justify-center text-white">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.05]">Formazione finanziata, dalla verifica al piano</h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-100 max-w-xl">
              Affianchiamo la tua azienda nella scelta dei fondi, nella progettazione e nella gestione della formazione.
            </p>
            <div className="mt-8">
              <button type="button" onClick={() => setContattoAperto(true)} className={`${BTN_VERDE} text-lg px-7 py-3.5`}>Verifica le opportunità</button>
            </div>
          </motion.div>
          <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden lg:[clip-path:polygon(10%_0,100%_0,100%_100%,0_100%)]">
            <img src="/img/servizi-hero.webp" alt="Una consulente illustra un piano formativo aziendale a un imprenditore" width="469" height="364"
              className="absolute inset-0 w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ come possiamo aiutarti */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Come possiamo aiutarti</h2>
        <div className="mt-2 h-1 w-14 rounded bg-[#0f8a6a]" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVIZI.map((s) => (
            <div key={s.titolo} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e3f7ec] text-[#0f8a6a]"><s.icona className="w-7 h-7" /></span>
              <h3 className="mt-4 text-2xl font-bold text-gray-900 leading-tight">{s.titolo}</h3>
              <p className="mt-2 text-gray-700 leading-relaxed">{s.testo}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-gray-700">
          Sei un consulente, uno studio o un’agenzia?{' '}
          <Link to="/professionisti" className="inline-flex items-center gap-1.5 font-bold text-[#0f8a6a] underline underline-offset-4 hover:text-[#0b5e48]">
            Scopri la formula per i professionisti <ArrowRight className="w-4 h-4" />
          </Link>
        </p>
      </section>

      {/* ------------------------------------------------ come lavoriamo insieme */}
      <section className="bg-[#eef8f2] py-14">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Come lavoriamo insieme</h2>
          <div className="mt-2 h-1 w-14 rounded bg-[#0f8a6a]" />
          <p className="mt-4 text-lg text-gray-700 max-w-3xl">
            Gestione completa chiavi in mano: non dovrai preoccuparti di nulla. Ci occupiamo di ogni aspetto del processo, dalla prima analisi
            fino alla rendicontazione finale.
          </p>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {PASSI.map((p, i) => (
              <li key={p.titolo} className="relative flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f8a6a] text-white font-bold text-lg">{i + 1}</span>
                <div className="md:pr-8">
                  <h3 className="text-xl font-bold text-gray-900">{p.titolo}</h3>
                  <p className="mt-1 text-gray-700 leading-relaxed">{p.testo}</p>
                </div>
                {i < PASSI.length - 1 && <ArrowRight className="hidden md:block absolute right-0 top-2 w-5 h-5 text-[#0f8a6a]" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------ collegamenti ai servizi */}
      <section className="max-w-6xl mx-auto px-6 py-14 grid gap-5 md:grid-cols-2">
        {[
          { icona: BookOpen, titolo: 'Formazione finanziata', testo: 'Scopri le aree formative e le soluzioni attivabili tramite i fondi interprofessionali.', link: '/formazione-finanziata', azione: 'Esplora il catalogo' },
          { icona: HardHat, titolo: 'Corsi di sicurezza', testo: 'Organizziamo i corsi sulla sicurezza sul lavoro obbligatori per la tua azienda.', link: '/corsi-sicurezza', azione: 'Vedi i corsi' },
        ].map((c) => (
          <Link key={c.titolo} to={c.link} className="group flex gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-[#0f8a6a] hover:shadow-md transition">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e3f7ec] text-[#0f8a6a]"><c.icona className="w-8 h-8" /></span>
            <span>
              <h3 className="text-2xl font-bold text-gray-900">{c.titolo}</h3>
              <span className="mt-1 block text-gray-700">{c.testo}</span>
              <span className="mt-3 inline-flex items-center gap-1.5 font-bold text-[#0f8a6a] underline underline-offset-4 group-hover:text-[#0b5e48]">
                {c.azione} <ArrowRight className="w-4 h-4" />
              </span>
            </span>
          </Link>
        ))}
      </section>

      {/* ------------------------------------------------ chiusura */}
      <section className="bg-[#0f2742] text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Quali competenze vuoi sviluppare in azienda?</h2>
          <button type="button" onClick={() => setContattoAperto(true)} className={`${BTN_VERDE} mt-6 text-lg px-8 py-3.5`}>
            Parliamo del tuo progetto
          </button>
        </div>
      </section>

      <ContactModal isOpen={contattoAperto} onClose={() => setContattoAperto(false)} source="services" />
    </div>
  );
};

export default Services;
