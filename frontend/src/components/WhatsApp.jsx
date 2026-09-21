import React from 'react';
import { MessageCircle } from 'lucide-react';

// Numero WhatsApp di MB Consulting, in formato internazionale senza + e spazi
export const NUMERO_WHATSAPP = '393291747521';

export const linkWhatsApp = (testo) =>
  `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(testo)}`;

/** Pulsante fisso in basso a destra: apre la chat con un messaggio già scritto. */
export function WhatsAppFisso({ testo }) {
  return (
    <a
      href={linkWhatsApp(testo)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Scrivici su WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white shadow-lg px-4 py-3 md:px-5 font-semibold hover:bg-[#1ebe5b] transition-colors"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="hidden sm:inline">Scrivici su WhatsApp</span>
    </a>
  );
}

/** Collegamento in linea, per la scheda del corso. */
export function WhatsAppLink({ testo, children }) {
  return (
    <a
      href={linkWhatsApp(testo)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 w-full rounded-md border-2 border-[#25D366] text-gray-900 font-semibold px-4 py-2.5 hover:bg-[#25D366]/10 transition-colors"
    >
      <MessageCircle className="w-5 h-5 text-[#1ebe5b]" />
      {children}
    </a>
  );
}
