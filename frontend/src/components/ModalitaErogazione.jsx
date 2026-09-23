import React from 'react';
import { colonneModalita, noteModalita, righeModalita } from '../data/modalitaErogazione';

const CAMPI = colonneModalita.filter((c) => c.id !== 'corso');

/**
 * Prospetto delle modalità di erogazione ammesse per ciascun corso.
 * Su schermo largo è una tabella, su smartphone diventa un elenco di schede:
 * sette colonne su un telefono sarebbero illeggibili.
 */
export default function ModalitaErogazione() {
  return (
    <section className="mb-24" aria-labelledby="modalita-erogazione">
      <h2 id="modalita-erogazione" className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
        Come si può svolgere ogni corso
      </h2>
      <p className="text-gray-600 mb-8 max-w-3xl">
        Le modalità ammesse per ciascun percorso: aula, videoconferenza sincrona o e-learning, con il numero massimo
        di partecipanti, il rapporto tra docente e allievi nella parte pratica e il tipo di verifica finale.
      </p>

      {/* schermo largo: tabella */}
      <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {colonneModalita.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  className="text-left font-semibold text-gray-900 px-4 py-3 border-b border-gray-200 align-bottom"
                >
                  {c.testo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {righeModalita.map((riga) => (
              <tr key={riga.corso} className="odd:bg-white even:bg-gray-50/60 align-top">
                <th scope="row" className="text-left font-semibold text-gray-900 px-4 py-3 border-b border-gray-100 max-w-xs">
                  {riga.corso}
                </th>
                {CAMPI.map((c) => (
                  <td key={c.id} className="text-gray-700 px-4 py-3 border-b border-gray-100">
                    {riga[c.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* smartphone: una scheda per corso */}
      <div className="md:hidden space-y-3">
        {righeModalita.map((riga) => (
          <div key={riga.corso} className="border border-gray-200 rounded-xl p-4">
            <p className="font-semibold text-gray-900 mb-3 leading-snug">{riga.corso}</p>
            <dl className="text-sm space-y-1.5">
              {CAMPI.map((c) => (
                <div key={c.id} className="flex gap-3 justify-between items-baseline">
                  <dt className="text-gray-500 shrink-0">{c.breve || c.testo}</dt>
                  <dd className="text-gray-900 text-right">{riga[c.id]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        {noteModalita.map((n) => (
          <p key={n}>{n}</p>
        ))}
      </div>
    </section>
  );
}
