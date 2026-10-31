import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { WhatsAppFisso, WhatsAppLink } from '../components/WhatsApp';
import { cercaAteco, cercaAtecoCompleto, divisioni, divisionePerCodice, livelli, noteAteco, sezioni } from '../data/rischioAteco';

const COLORI = {
  basso: 'bg-green-50 text-green-800 border-green-200',
  medio: 'bg-amber-50 text-amber-900 border-amber-200',
  alto: 'bg-red-50 text-red-800 border-red-200',
};

function Esito({ divisione, voce, dati }) {
  const [divCodice, sezione, descrizione, livello] = divisione;
  const l = livelli[livello];
  const codice = voce ? voce[0] : divCodice;
  const titoloDivisione = dati && (dati.codici.find((c) => c[0] === divCodice) || [])[1];
  return (
    <div className={`border-2 rounded-xl p-5 ${COLORI[livello]}`}>
      {voce ? (
        <>
          <p className="text-sm font-semibold uppercase tracking-wide mb-1">
            ATECO 2025 · sezione {voce[2]} — {dati.sezioni[voce[2]]}
          </p>
          <p className="font-bold text-lg mb-1">
            {voce[0]} — {voce[1]}
          </p>
          <p className="text-sm mb-2">
            Divisione {divCodice}: {titoloDivisione || descrizione}
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold uppercase tracking-wide mb-1">
            {codice} · {sezione} — {sezioni[sezione]}
          </p>
          <p className="font-bold text-lg mb-2">{descrizione}</p>
        </>
      )}
      <p className="text-2xl font-bold mb-1">{l.nome}</p>
      <p className="text-sm">
        Formazione dei lavoratori: {l.generale} ore di generale + {l.specifica} ore di specifica,
        <strong> {l.totale} ore in tutto</strong>. Aggiornamento di 6 ore ogni 5 anni.
      </p>
      <div className="mt-4 border-t border-current/20 pt-4 mb-4">
        <p className="text-sm">
          <strong>Hai dipendenti?</strong> Con i fondi interprofessionali la formazione può essere finanziata al 100%:
          non è una spesa in più, usi lo 0,30% che la tua azienda versa già all’INPS. Ci pensiamo noi ad adesione,
          piano formativo e rendicontazione.
        </p>
        <div className="mt-3 flex flex-col sm:flex-row gap-3">
          <WhatsAppLink testo={`Ciao, il mio codice ATECO è ${codice}: vorrei sapere se posso finanziare la formazione dei miei dipendenti con i fondi interprofessionali.`}>
            Chiedi se puoi finanziarlo
          </WhatsAppLink>
          <Link
            to="/servizi"
            className="inline-flex items-center justify-center w-full rounded-md border-2 border-gray-300 bg-white/70 text-gray-900 font-semibold px-4 py-2.5 hover:border-gray-900 transition-colors"
          >
            Come funzionano i fondi
          </Link>
        </div>
      </div>

      <div>
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

function Voce({ voce, onScegli }) {
  const div = divisionePerCodice(voce[0]);
  const liv = div ? div[3] : null;
  return (
    <button
      type="button"
      onClick={() => onScegli(voce[0])}
      className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
    >
      <span className="font-mono font-semibold text-gray-900 w-24 shrink-0">{voce[0]}</span>
      <span className="text-gray-700 flex-1">{voce[1]}</span>
      {liv && <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 whitespace-nowrap ${COLORI[liv]}`}>{livelli[liv].nome}</span>}
    </button>
  );
}

export default function RischioAteco() {
  const [q, setQ] = useState('');
  const [dati, setDati] = useState(null);
  useEffect(() => {
    let attivo = true;
    fetch('/data/ateco-2025.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (attivo && d && Array.isArray(d.codici)) setDati(d); })
      .catch(() => {});
    return () => { attivo = false; };
  }, []);
  const completo = useMemo(() => cercaAtecoCompleto(dati, q), [dati, q]);
  const risultati = useMemo(() => cercaAteco(q), [q]);
  const scegli = (codice) => {
    setQ(codice);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };
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
          basso, 12 per il medio, 16 per l’alto. Scrivi il tuo codice ATECO completo, come compare in visura camerale
          (per esempio 56.11.11), oppure il nome dell’attività: la ricerca usa l’elenco ufficiale ATECO 2025.
        </p>

        <label className="block max-w-xl mb-8">
          <span className="sr-only">Cerca il codice ATECO o il settore</span>
          <span className="relative block">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Es. 56.11.11, oppure: ristorante"
              className="w-full border-2 border-gray-200 focus:border-black outline-none rounded-lg pl-11 pr-4 py-3 text-lg"
            />
          </span>
        </label>

        {q.trim() && completo && (
          <div className="mb-12 space-y-4">
            {completo.codice ? (
              <>
                {completo.vicino && (
                  <p className="text-sm text-gray-600">
                    Il codice {completo.cercato} non esiste nell’elenco ATECO 2025 (potrebbe essere un codice ATECO 2007):
                    ti mostriamo la voce più vicina, {completo.codice[0]}. Il livello di rischio dipende dalle prime due cifre.
                  </p>
                )}
                {divisionePerCodice(completo.codice[0]) && (
                  <Esito divisione={divisionePerCodice(completo.codice[0])} voce={completo.codice} dati={dati} />
                )}
                {completo.figli.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Scegli il codice esatto ({completo.figli.length} sottocategorie):
                    </p>
                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
                      {completo.figli.map((v) => <Voce key={v[0]} voce={v} onScegli={scegli} />)}
                    </div>
                  </div>
                )}
              </>
            ) : completo.testo ? (
              completo.testo.length ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    {completo.totale > completo.testo.length
                      ? `Primi ${completo.testo.length} di ${completo.totale} codici trovati: aggiungi una parola per restringere.`
                      : `${completo.testo.length} codici trovati. Tocca quello giusto.`}
                  </p>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    {completo.testo.map((v) => <Voce key={v[0]} voce={v} onScegli={scegli} />)}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-gray-200 rounded-xl p-5">
                  <p className="font-semibold text-gray-900 mb-1">Nessun codice trovato per «{q}».</p>
                  <p className="text-sm text-gray-600">Prova con il codice della visura (per esempio 43.22.01) o con un’altra parola.</p>
                </div>
              )
            ) : divisionePerCodice(completo.cercato) ? (
              <>
                <p className="text-sm text-gray-600">
                  Il codice {completo.cercato} appartiene alla classificazione ATECO 2007 e non esiste più in ATECO 2025
                  (il commercio di autoveicoli ora è nelle divisioni 46 e 47, la riparazione nella 95). Il livello di rischio
                  resta quello indicato dall’Accordo per la divisione {completo.cercato.slice(0, 2)}.
                </p>
                <Esito divisione={divisionePerCodice(completo.cercato)} />
              </>
            ) : (
              <div className="border-2 border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-1">Codice {q} non trovato.</p>
                <p className="text-sm text-gray-600">Controlla le prime due cifre del codice.</p>
              </div>
            )}
          </div>
        )}

        {q.trim() && !completo && (
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
          <p>Fonte: Allegato IV dell’Accordo Stato-Regioni del 17 aprile 2025 (rep. atti n. 59/CSR), corrispondenze ATECO 2007.
            Codici e descrizioni: classificazione ATECO 2025 (ISTAT). Il livello di rischio si ricava dalla divisione
            (prime due cifre), che ha la stessa numerazione nelle due classificazioni.</p>
          {noteAteco.map((n) => (
            <p key={n}>{n}</p>
          ))}
        </div>

        <div className="border-2 border-black rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900">Devi formare i tuoi lavoratori?</p>
            <p className="text-sm text-gray-600">Corsi online conformi all’Accordo 2025, attestato verificabile tramite QR code.</p>
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
