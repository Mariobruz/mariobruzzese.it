import React, { useEffect, useState } from 'react';
import { EVENTO_CONSENSO, impostaConsenso, leggiConsenso } from '../googleAds';

/**
 * Banner cookie: compare finché il visitatore non sceglie.
 * Accetta = carichiamo il tag di conversione Google Ads; Rifiuta = nessuno script né cookie di terze parti.
 */
const BannerConsenso = () => {
  const [visibile, setVisibile] = useState(false);

  useEffect(() => {
    const aggiorna = () => setVisibile(leggiConsenso() === null);
    aggiorna();
    window.addEventListener(EVENTO_CONSENSO, aggiorna);
    return () => window.removeEventListener(EVENTO_CONSENSO, aggiorna);
  }, []);

  if (!visibile) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Preferenze cookie"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 bg-white/95 backdrop-blur shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <p className="text-sm text-gray-700 leading-relaxed flex-1">
          Usiamo cookie tecnici e, solo se accetti, il cookie di Google Ads per misurare quali annunci portano
          a un acquisto. Nessuna profilazione pubblicitaria.{' '}
          <a href="/privacy" className="underline hover:text-gray-900">Informativa privacy</a>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => impostaConsenso('no')}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-800 hover:bg-gray-50"
          >
            Rifiuta
          </button>
          <button
            type="button"
            onClick={() => impostaConsenso('si')}
            className="px-4 py-2 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerConsenso;
