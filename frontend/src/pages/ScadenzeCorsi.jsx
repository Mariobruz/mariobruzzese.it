import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import ModalitaErogazione from '../components/ModalitaErogazione';
import { WhatsAppFisso } from '../components/WhatsApp';

/**
 * Pagina "Durate e scadenze": risponde alle ricerche del tipo
 * "ogni quanto si rinnova il corso preposti" o "quanto dura il corso RSPP",
 * e da lì porta al catalogo e alle schede dei corsi.
 */
export default function ScadenzeCorsi() {
  return (
    <div className="min-h-screen pt-28 md:pt-40 pb-20">
      <SEOHead
        title="Durata e Scadenza dei Corsi di Sicurezza sul Lavoro — Accordo Stato-Regioni 2025"
        description="Quanto dura ogni corso di sicurezza e ogni quanto va rifatto l’aggiornamento: lavoratori, preposti, dirigenti, datore di lavoro, RSPP, RLS, antincendio, primo soccorso, HACCP."
        canonical="https://www.mariobruzzese.it/durata-scadenza-corsi-sicurezza"
      />
      <div className="max-w-6xl mx-auto px-6">
        <Link to="/corsi-sicurezza" className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Torna al catalogo dei corsi
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Durata e scadenza dei corsi di sicurezza sul lavoro
        </h1>
        <p className="text-gray-600 leading-relaxed max-w-3xl mb-4">
          Quante ore dura ogni corso, quanto vale l’attestato e ogni quanto va rifatto l’aggiornamento. I dati sono
          quelli del quadro sinottico dell’Accordo Stato-Regioni del 17 aprile 2025; per i percorsi che l’Accordo non
          disciplina — antincendio, primo soccorso, ponteggi, funi, segnaletica stradale, lavori elettrici e HACCP —
          vale la norma indicata nella riga corrispondente.
        </p>
        <p className="text-gray-600 leading-relaxed max-w-3xl mb-12">
          Nella stessa tabella trovi anche come si può seguire ciascun corso: aula, videoconferenza sincrona o
          e-learning, con il numero massimo di partecipanti e il tipo di verifica finale.
        </p>

        <ModalitaErogazione senzaTitolo />

        <div className="mt-12 border-2 border-black rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900">Il tuo corso è in scadenza?</p>
            <p className="text-sm text-gray-600">I corsi che eroghiamo online si seguono quando vuoi, con attestato scaricabile dalla piattaforma.</p>
          </div>
          <Link
            to="/corsi-sicurezza"
            className="inline-flex items-center justify-center rounded-md bg-black text-white font-semibold px-6 py-3 hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Vedi i corsi online
          </Link>
        </div>
      </div>
      <WhatsAppFisso testo="Ciao, vorrei sapere quando scade il mio attestato di sicurezza sul lavoro." />
    </div>
  );
}
