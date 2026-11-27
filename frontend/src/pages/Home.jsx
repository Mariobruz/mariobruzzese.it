import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, ClipboardCheck, GraduationCap, HardHat, Search, User } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import ContactModal from '../components/ContactModal';

/**
 * Home: stessa impaginazione delle pagine interne (apertura blu con taglio
 * diagonale, schede chiare, fasce verde chiaro, chiusura blu).
 */
const _seoSchemaHome = "{\"@context\":\"https://schema.org\",\"@type\":\"WebPage\",\"name\":\"Fondi Interprofessionali | MB Consulting\",\"url\":\"https://www.mariobruzzese.it/\",\"description\":\"Consulenza fondi interprofessionali per la formazione aziendale finanziata al 100%.\"}";

const BTN_VERDE = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f8a6a] text-white font-bold hover:bg-[#0c7458] transition-colors';

const SCHEDE = [
  { icona: Building2, titolo: 'Per le aziende', azione: 'Esplora la formazione', link: '/formazione-finanziata' },
  { icona: User, titolo: 'Per i professionisti', azione: 'Scopri la collaborazione', link: '/professionisti' },
  { icona: HardHat, titolo: 'E-learning 81/08', azione: 'Vai al catalogo', link: '/corsi-sicurezza' },
];

const PASSI = [
  { icona: Search, titolo: 'Verifica del fondo' },
  { icona: ClipboardCheck, titolo: 'Progettazione del piano' },
  { icona: GraduationCap, titolo: 'Erogazione e rendicontazione' },
];

const Home = () => {
  const [contattoAperto, setContattoAperto] = useState(false);
  const vaiAPassi = () => document.getElementById('dal-fondo-al-piano')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="bg-white">
      <SEOHead
        title="Fondi Interprofessionali | Consulenza Formazione Finanziata"
        description="Accedi ai fondi interprofessionali e finanzia la formazione aziendale al 100%. MB Consulting gestisce tutto: adesione, piano formativo e rendicontazione. Contattaci."
        canonical="https://www.mariobruzzese.it/"
        schema={_seoSchemaHome}
      />

      {/* ------------------------------------------------ apertura */}
      <section className="pt-[88px]">
        <div className="grid lg:grid-cols-2 bg-[#0f2742] lg:min-h-[580px]">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
            className="px-6 sm:px-12 lg:pl-[max(3rem,calc((100vw-80rem)/2+1.5rem))] py-14 lg:py-16 flex flex-col justify-center text-white">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.05]">Formazione finanziata per le aziende</h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-100 max-w-xl">
              Dalla verifica del fondo alla formazione del personale, seguiamo tutto il piano.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setContattoAperto(true)} className={`${BTN_VERDE} text-lg px-7 py-3.5`}>Verifica le opportunità</button>
              <button type="button" onClick={vaiAPassi}
                className="inline-flex items-center justify-center rounded-lg border-2 border-white/80 px-7 py-3 text-lg font-semibold text-white hover:bg-white hover:text-[#0f2742] transition-colors">
                Come funziona
              </button>
            </div>
          </motion.div>
          <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden lg:[clip-path:polygon(10%_0,100%_0,100%_100%,0_100%)]">
            <picture>
              <source media="(min-width: 1024px)" srcSet="/img/home-hero.webp" />
              <img src="/img/home-hero-m.webp" alt="Un consulente e tre collaboratori pianificano la formazione aziendale davanti a un portatile"
                width="472" height="464" className="absolute inset-0 w-full h-full object-cover" />
            </picture>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ tre schede */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {SCHEDE.map((s) => (
            <Link key={s.titolo} to={s.link}
              className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-[#0f8a6a] hover:shadow-md transition">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#e3f7ec] text-[#0f8a6a]"><s.icona className="w-7 h-7" /></span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{s.titolo}</h2>
                <span className="mt-1 inline-flex items-center gap-1.5 font-bold text-[#0f8a6a] group-hover:text-[#0b5e48]">
                  {s.azione} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ dal fondo al piano */}
      <section id="dal-fondo-al-piano" className="bg-[#eef8f2] py-14 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Dal fondo al piano formativo</h2>
          <div className="mt-2 h-1 w-14 rounded bg-[#0f8a6a]" />
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {PASSI.map((p, i) => (
              <li key={p.titolo} className="relative flex items-center gap-4 md:pr-10">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#d5f0e2] text-[#0f8a6a]"><p.icona className="w-9 h-9" /></span>
                <div>
                  <span className="block text-sm font-bold text-[#0f8a6a]">{i + 1}</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{p.titolo}</h3>
                </div>
                {i < PASSI.length - 1 && <ArrowRight className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 text-[#0f8a6a]" aria-hidden="true" />}
              </li>
            ))}
          </ol>
          <p className="mt-8">
            <Link to="/servizi" className="inline-flex items-center gap-1.5 font-bold text-[#0f8a6a] underline underline-offset-4 hover:text-[#0b5e48]">
              Scopri tutti i servizi <ArrowRight className="w-4 h-4" />
            </Link>
          </p>
        </div>
      </section>

      {/* ------------------------------------------------ formula win-win */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-2">
          <div className="aspect-[3/2] lg:aspect-auto lg:min-h-[320px]">
            <img src="/img/casi-studio/iso-9001.webp" srcSet="/img/casi-studio/iso-9001-720.webp 720w, /img/casi-studio/iso-9001.webp 1200w"
              sizes="(min-width: 1024px) 600px, 100vw" alt="Una responsabile qualità e un capo reparto controllano la documentazione vicino alla linea produttiva"
              width="1200" height="800" loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div className="p-6 sm:p-10 flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-wider text-[#0f8a6a]">La formula win-win</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">Un preventivo più competitivo</h2>
            <p className="mt-4 text-lg text-gray-700 leading-relaxed">
              Il professionista mantiene il suo compenso. L’azienda riceve lo stesso servizio e può spendere meno se il fondo copre la formazione
              del personale. MB Consulting gestisce il piano ed eroga i corsi.
            </p>
            <Link to="/professionisti" className="mt-5 inline-flex w-fit items-center gap-1.5 text-lg font-bold text-[#0f8a6a] hover:text-[#0b5e48]">
              Vedi gli esempi <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ contatto */}
      <section className="bg-[#0f2742] text-white">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <h2 className="text-3xl sm:text-4xl font-bold">Parliamo della formazione per la tua azienda</h2>
          <button type="button" onClick={() => setContattoAperto(true)} className={`${BTN_VERDE} shrink-0 text-lg px-8 py-3.5`}>Contattaci</button>
        </div>
      </section>

      <ContactModal isOpen={contattoAperto} onClose={() => setContattoAperto(false)} source="home" />
    </div>
  );
};

export default Home;
