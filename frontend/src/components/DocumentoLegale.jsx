import React from 'react';
import { motion } from 'framer-motion';
import SEOHead from './SEOHead';

/**
 * DocumentoLegale.jsx — impaginazione condivisa delle pagine legali
 * (condizioni di vendita, informativa privacy).
 */

export function Sezione({ numero, titolo, children }) {
  return (
    <section className="mb-10 scroll-mt-32" id={`sez-${numero}`}>
      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
        {numero}. {titolo}
      </h2>
      <div className="space-y-3 text-gray-700 leading-relaxed text-[15px]">{children}</div>
    </section>
  );
}

export function Elenco({ voci }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5">
      {voci.map((v, i) => (
        <li key={i}>{v}</li>
      ))}
    </ul>
  );
}

export default function DocumentoLegale({ titolo, sommario, aggiornamento, seo, children }) {
  return (
    <>
      <SEOHead {...seo} />
      <div className="min-h-screen pt-40 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{titolo}</h1>
            {sommario && <p className="text-lg text-gray-600 leading-relaxed">{sommario}</p>}
            {aggiornamento && (
              <p className="text-sm text-gray-500 mt-6">Ultimo aggiornamento: {aggiornamento}</p>
            )}
          </motion.div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-7 md:p-10">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
