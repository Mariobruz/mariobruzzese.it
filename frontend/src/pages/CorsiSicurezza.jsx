import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BadgeCheck, CheckCircle2, Clock, Laptop, RefreshCw, ShieldCheck, Users, XCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import IscrizioneCorso from '../components/IscrizioneCorso';
import { Button } from '../components/ui/button';
import { categorie, corsiPubblicabili } from '../data/corsiSicurezza';

const VANTAGGI = [
  { icona: Laptop, titolo: 'Quando vuoi tu', testo: 'Corsi asincroni: si seguono da computer, tablet o telefono, negli orari che decidi tu. Nessuna aula, nessuna trasferta.' },
  { icona: BadgeCheck, titolo: 'Attestato valido', testo: "Formazione erogata da EFEI, Organismo Paritetico nazionale per la salute e sicurezza sul lavoro. Superato il test finale, l'attestato si scarica direttamente dalla piattaforma." },
  { icona: Users, titolo: 'Anche per più dipendenti', testo: 'Iscrivi in una volta sola tutti i lavoratori da formare: i dati di ciascuno restano separati e tracciati.' },
];

const PASSI = [
  { n: '01', titolo: 'Scegli il corso', testo: 'Individua il corso che copre il tuo obbligo formativo e indica quante persone devi iscrivere.' },
  { n: '02', titolo: 'Inserisci i dati e paghi', testo: 'Compili anagrafica dei partecipanti e dati di fatturazione, poi paghi online in modo sicuro.' },
  { n: '03', titolo: 'Confermi l’account', testo: 'Entro 24 ore registriamo i partecipanti sulla piattaforma. A ciascuno arriva un’email per confermare il proprio account: va confermata, è il passaggio senza il quale il corso non può essere abbinato.' },
  { n: '04', titolo: 'Inizi il corso', testo: 'Confermato l’account, abbiniamo il corso acquistato e si può partire. Superato il test finale, l’attestato si scarica dalla piattaforma.' },
];

export default function CorsiSicurezza() {
  const [categoriaAttiva, setCategoriaAttiva] = useState('tutte');
  const [dettaglio, setDettaglio] = useState(null);
  const [iscrizione, setIscrizione] = useState(null);

  // Ritorno dal pagamento con carta: Stripe rimanda qui con ?iscrizione=ok&rif=...
  const [ritorno, setRitorno] = useState(() => {
    if (typeof window === 'undefined') return null;
    const q = new URLSearchParams(window.location.search);
    const esito = q.get('iscrizione');
    if (esito !== 'ok' && esito !== 'annullata') return null;
    return { esito, riferimento: q.get('rif') || '' };
  });

  const chiudiRitorno = () => {
    setRitorno(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const corsi = useMemo(() => corsiPubblicabili(), []);
  const visibili = useMemo(
    () => (categoriaAttiva === 'tutte' ? corsi : corsi.filter((c) => c.categoria === categoriaAttiva)),
    [corsi, categoriaAttiva]
  );

  const schema = useMemo(
    () => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Corsi di sicurezza sul lavoro online',
      numberOfItems: corsi.length,
      itemListElement: corsi.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Course',
          name: c.titolo,
          description: `${c.ore} ore di formazione e-learning. ${c.destinatari}.`,
          provider: { '@type': 'Organization', name: 'EFEI Aula Magna' },
          offers: {
            '@type': 'Offer',
            price: c.prezzo,
            priceCurrency: 'EUR',
            category: 'Corso e-learning',
            availability: 'https://schema.org/InStock',
          },
        },
      })),
    }),
    [corsi]
  );

  if (ritorno) {
    const ok = ritorno.esito === 'ok';
    return (
      <div className="min-h-screen pt-40 pb-20">
        <SEOHead
          title={ok ? 'Iscrizione confermata' : 'Pagamento annullato'}
          description="Esito dell’iscrizione ai corsi di sicurezza sul lavoro."
          canonical="https://www.mariobruzzese.it/corsi-sicurezza"
          noIndex
        />
        <div className="max-w-xl mx-auto px-6 text-center">
          {ok ? (
            <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-6" />
          ) : (
            <XCircle className="w-14 h-14 text-gray-400 mx-auto mb-6" />
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {ok ? 'Iscrizione confermata' : 'Pagamento annullato'}
          </h1>
          {ok ? (
            <>
              <p className="text-gray-600 mb-2">
                Abbiamo ricevuto il pagamento. Il riepilogo è partito verso l’indirizzo email che hai indicato.
              </p>
              {ritorno.riferimento && (
                <p className="text-gray-900 font-semibold mb-6">
                  Riferimento della pratica: {ritorno.riferimento}
                </p>
              )}
              <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-600 text-left mb-8">
                <p className="mb-2">
                  Entro 24 ore lavorative registriamo i partecipanti sulla piattaforma dell’ente.
                </p>
                <p className="mb-2">
                  <strong>Passaggio necessario:</strong> ogni partecipante riceverà un’email per confermare
                  il proprio account. Finché non la conferma, il corso non può essergli abbinato — se non
                  arriva, va controllata anche la posta indesiderata.
                </p>
                <p>
                  Superato il test finale, l’attestato si scarica direttamente dalla piattaforma.
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-600 mb-8">
              Non è stato addebitato nulla. Puoi riprendere l’iscrizione quando vuoi: i dati vanno reinseriti.
            </p>
          )}
          <Button onClick={chiudiRitorno} className="bg-black text-white hover:bg-gray-800">
            Torna ai corsi
          </Button>
        </div>
      </div>
    );
  }

  if (iscrizione) {
    return (
      <div className="min-h-screen pt-40 pb-20">
        <SEOHead
          title={`Iscrizione: ${iscrizione.titolo}`}
          description={`Iscriviti al corso ${iscrizione.titolo}, ${iscrizione.ore} ore in e-learning.`}
          canonical="https://www.mariobruzzese.it/corsi-sicurezza"
          noIndex
        />
        <IscrizioneCorso corso={iscrizione} onIndietro={() => setIscrizione(null)} />
      </div>
    );
  }

  if (dettaglio) {
    return (
      <div className="min-h-screen pt-40 pb-20">
        <SEOHead
          title={dettaglio.titolo}
          description={`${dettaglio.titolo}: ${dettaglio.ore} ore di e-learning asincrono. ${dettaglio.destinatari}. Attestato valido, ${dettaglio.prezzo} € a partecipante.`}
          canonical="https://www.mariobruzzese.it/corsi-sicurezza"
        />
        <div className="max-w-4xl mx-auto px-6">
          <button onClick={() => setDettaglio(null)} className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Torna al catalogo
          </button>

          <div className="grid md:grid-cols-2 gap-10 mb-12">
            <img src={process.env.PUBLIC_URL + dettaglio.immagine} alt={dettaglio.titolo} className="rounded-xl w-full border border-gray-100" loading="lazy" />
            <div>
              {dettaglio.aggiornamento && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full px-3 py-1 mb-4">
                  <RefreshCw className="w-3 h-3" /> Aggiornamento
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{dettaglio.titolo}</h1>
              <dl className="space-y-2 text-sm text-gray-600 mb-6">
                <div><dt className="inline font-semibold text-gray-900">Durata: </dt><dd className="inline">{dettaglio.ore} ore</dd></div>
                <div><dt className="inline font-semibold text-gray-900">Destinatari: </dt><dd className="inline">{dettaglio.destinatari}</dd></div>
                <div><dt className="inline font-semibold text-gray-900">Riferimento: </dt><dd className="inline">{dettaglio.normativa}</dd></div>
                <div><dt className="inline font-semibold text-gray-900">Modalità: </dt><dd className="inline">e-learning asincrono</dd></div>
              </dl>
              <p className="text-3xl font-bold text-gray-900 mb-1">{dettaglio.prezzo}&nbsp;€</p>
              <p className="text-sm text-gray-500 mb-6">a partecipante, IVA compresa</p>
              <Button onClick={() => setIscrizione(dettaglio)} size="lg" className="bg-black text-white hover:bg-gray-800 w-full">
                Iscriviti ora
              </Button>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Programma del corso</h2>
          <p className="text-sm text-gray-500 mb-6">Programma didattico ufficiale dell’ente erogatore.</p>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            {dettaglio.programma.map((riga, i) => (
              <p key={i}>{riga}</p>
            ))}
          </div>

          <div className="mt-12 bg-gray-50 rounded-xl p-6 text-sm text-gray-600">
            Corso erogato da <strong>EFEI — Organismo Paritetico Salute e Sicurezza nei Luoghi di Lavoro</strong>
            tramite l’Unità Operativa codice 2403. MB Consulting cura la promozione, l’iscrizione e l’assistenza;
            progettazione, erogazione e rilascio dell’attestato sono di EFEI. Superato il test finale, l’attestato si
            scarica direttamente dalla piattaforma.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Corsi Sicurezza sul Lavoro Online — E-learning D.Lgs 81/08"
        description="Corsi di sicurezza sul lavoro online in e-learning: lavoratori, dirigenti, RLS, RSPP, formatori, HACCP. Attestato scaricabile dalla piattaforma a fine corso. Da 25 € IVA compresa."
        canonical="https://www.mariobruzzese.it/corsi-sicurezza"
        schema={schema}
      />

      <div className="min-h-screen pt-40 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-40" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }} className="max-w-3xl mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full mb-6 text-sm font-medium">
              <ShieldCheck className="w-4 h-4" /> Formazione obbligatoria D.Lgs 81/08
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Corsi di sicurezza sul lavoro online
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Metti in regola la tua azienda senza fermare il lavoro: {corsi.length} corsi in e-learning asincrono,
              erogati tramite l’Unità Operativa 2403 di EFEI, con attestato scaricabile dalla piattaforma a fine percorso.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {VANTAGGI.map((v, i) => (
              <motion.div
                key={v.titolo}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-xl p-6"
              >
                <v.icona className="w-6 h-6 mb-4" />
                <h2 className="font-bold text-gray-900 mb-2">{v.titolo}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{v.testo}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setCategoriaAttiva('tutte')}
              className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                categoriaAttiva === 'tutte' ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              Tutti i corsi
            </button>
            {categorie.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaAttiva(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                  categoriaAttiva === cat.id ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {cat.nome}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {visibili.map((corso, i) => (
              <motion.article
                key={corso.id}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(i, 5) * 0.05 }}
                className="group bg-white border-2 border-gray-100 rounded-xl overflow-hidden hover:border-black transition-all duration-300 flex flex-col"
              >
                <div className="aspect-[3/2] overflow-hidden">
                  <img src={process.env.PUBLIC_URL + corso.immagine} alt={corso.titolo} className="w-full h-full object-cover object-center" loading="lazy" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {corso.ore} ore</span>
                    {corso.aggiornamento && <span className="inline-flex items-center gap-1"><RefreshCw className="w-3 h-3" /> aggiornamento</span>}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 leading-snug">{corso.titolo}</h3>
                  <p className="text-sm text-gray-600 mb-6 flex-1">{corso.destinatari}</p>
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-2xl font-bold text-gray-900 leading-none">{corso.prezzo}&nbsp;€</span>
                      <span className="block text-xs text-gray-500 mt-1">IVA compresa</span>
                    </span>
                    <Button onClick={() => setDettaglio(corso)} className="bg-black text-white hover:bg-gray-800">
                      Dettagli
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <section className="mb-24">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">Come funziona</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {PASSI.map((p) => (
                <div key={p.n}>
                  <span className="text-5xl font-bold text-gray-200 block mb-3">{p.n}</span>
                  <h3 className="font-bold text-gray-900 mb-2">{p.titolo}</h3>
                  <p className="text-gray-600 leading-relaxed">{p.testo}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-gray-50 rounded-2xl p-8 text-sm text-gray-600 leading-relaxed">
            I corsi sono progettati, autorizzati ed erogati in modalità e-learning asincrona da <strong>EFEI — Organismo
            Paritetico Salute e Sicurezza nei Luoghi di Lavoro</strong> (iscritto al n. 5 del Repertorio degli Organismi
            Paritetici del Ministero del Lavoro e delle Politiche Sociali), tramite la <strong>Unità Operativa codice 2403</strong>
            e la piattaforma autorizzata EFEI. MB Consulting di Mario Bruzzese opera come mandatario per la promozione e la
            vendita, in nome proprio e per finalità proprie, e non è un Organismo Paritetico. L’attestato è generato e
            rilasciato da EFEI al superamento del test finale.
          </div>
        </div>
      </div>
    </>
  );
}
