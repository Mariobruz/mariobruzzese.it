import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { WhatsAppFisso, WhatsAppLink } from '../components/WhatsApp';
import { cercaAteco, divisioni, livelli, noteAteco, sezioni } from '../data/rischioAteco';

const COLORI = {
  basso: 'bg-green-50 text-green-800 border-green-200',
  medio: 'bg-amber-50 text-amber-900 border-amber-200',
  alto: 'bg-red-50 text-red-800 border-red-200',
};

function Esito({ divisione }) {
  const [codice, sezione, descrizione, livello] = divisione;
  const l = livelli[livello];
  return (
    <div className={`border-2 rounded-xl p-5 ${COLORI[livello]}`}>
      <p className="text-sm font-semibold uppercase tracking-wide mb-1">
        {codice} · {sezione} — {sezioni[sezione]}
      </p>
      <p className="font-bold text-lg mb-2">{descrizione}</p>
      <p className="text-2xl font-bold mb-1">{l.nome}</p>
      <p className="text-sm">
        Formazione dei lavoratori: {l.generale} ore di generale + {l.specifica} ore di specifica,
        <strong> {l.totale} ore in tutto</strong>. Aggiornamento di 6 ore ogni 5 anni.
      </p>
      <div className="mt-4">
        {l.corso ? (
          <Link
            to={`/corsi-sicurezza/${l.corso}`}
            className="inline-flex items-center justify-center rounded-md bg-black text-white font-semibold px-5 py-2.5 hover:bg-gray-800 transition-colors"
          >
            Vai al corso da {l.totale} ore
          </Link>
        ) : (
          <WhatsAppLink testo={`Ciao, il mio codice ATECO è ${codice} (${l.nome.toLowerCase()}): vorrei iscrivere dei lavoratori alla formazione da ${l.totale} ore.`}>
            Chiedi il corso da {l.totale} ore su WhatsApp
          </WhatsAppLink>
        )}
      </div>
    </div>
  );
}

export default function RischioAteco() {
  const [q, setQ] = useState('');
  const risultati = useMemo(() => cercaAteco(q), [q]);
  const perLivello = (liv) => divisioni.filter((d) => d[3] === liv);

  return (
    <div className="min-h-screen pt-28 md:pt-40 pb-20">
      <SEOHead
        title="Codice ATECO e Livello di Rischio: Basso, Medio o Alto — Ore di Formazione"
        description="Cerca il tuo codice ATECO e scopri se la tua attività è a rischio basso, medio o alto e quante ore di formazione servono ai lavoratori secondo l’Accordo Stato-Regioni 2025."
        canonical="https://www.mariobruzzese.it/codice-ateco-livello-di-rischio"
      />
      <div className="max-w-5xl mx-auto px-6">
        <Link to="/corsi-sicurezza" className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Torna al catalogo dei corsi
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Codice ATECO e livello di rischio
        </h1>
        <p className="text-gray-600 leading-relaxed max-w-3xl mb-8">
          Il settore dell’azienda stabilisce quante ore di formazione servono ai lavoratori: 8 ore per il rischio
          basso, 12 per il medio, 16 per l’alto. Scrivi il tuo codice ATECO — bastano le prime due cifre — oppure il
          nome del settore.
        </p>

        <label className="block max-w-xl mb-8">
          <span className="sr-only">Cerca il codice ATECO o il settore</span>
          <span className="relative block">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Es. 43.22, oppure: ristorazione"
              className="w-full border-2 border-gray-200 focus:border-black outline-none rounded-lg pl-11 pr-4 py-3 text-lg"
            />
          </span>
        </label>

        {q.trim() && (
          <div className="mb-12 space-y-4">
            {risultati.length ? (
              risultati.map((d) => <Esito key={d[0]} divisione={d} />)
            ) : (
              <div className="border-2 border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-1">Nessun settore trovato per «{q}».</p>
                <p className="text-sm text-gray-600">
                  Prova con le prime due cifre del codice (per esempio 43) o con una parola del settore.
                </p>
              </div>
            )}
          </div>
        )}

        {['basso', 'medio', 'alto'].map((liv) => (
          <section key={liv} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{livelli[liv].nome}</h2>
            <p className="text-gray-600 mb-4">
              {livelli[liv].generale} ore di formazione generale + {livelli[liv].specifica} di specifica:{' '}
              {livelli[liv].totale} ore in tutto.
            </p>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="text-left font-semibold text-gray-900 px-4 py-3 w-24">Codice</th>
                    <th scope="col" className="text-left font-semibold text-gray-900 px-4 py-3">Settore</th>
                    <th scope="col" className="text-left font-semibold text-gray-900 px-4 py-3 solo-largo">Sezione</th>
                  </tr>
                </thead>
                <tbody>
                  {perLivello(liv).map(([codice, sezione, descrizione]) => (
                    <tr key={codice} className="odd:bg-white even:bg-gray-50/60 align-top">
                      <td className="px-4 py-3 font-semibold text-gray-900">{codice}</td>
                      <td className="px-4 py-3 text-gray-700">{descrizione}</td>
                      <td className="px-4 py-3 text-gray-500">{sezione} — {sezioni[sezione]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        <div className="text-sm text-gray-500 space-y-2 mb-12">
          <p>Fonte: Allegato IV dell’Accordo Stato-Regioni del 17 aprile 2025 (rep. atti n. 59/CSR), corrispondenze ATECO 2007.</p>
          {noteAteco.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>

        <div className="border-2 border-black rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900">Devi formare i tuoi lavoratori?</p>
            <p className="text-sm text-gray-600">Corsi online conformi all’Accordo 2025, attestato con QR code scaricabile dalla piattaforma.</p>
          </div>
          <Link
            to="/corsi-sicurezza"
            className="inline-flex items-center justify-center rounded-md bg-black text-white font-semibold px-6 py-3 hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Vedi i corsi
          </Link>
        </div>
      </div>
      <WhatsAppFisso testo="Ciao, vorrei sapere che livello di rischio ha il mio codice ATECO e quale corso serve." />
    </div>
  );
}
