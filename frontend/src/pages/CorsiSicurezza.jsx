import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BadgeCheck, Check, CheckCircle2, Link2, Clock, Laptop, RefreshCw, ScrollText, ShieldCheck, Users, XCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import IscrizioneCorso from '../components/IscrizioneCorso';
import { WhatsAppFisso, WhatsAppLink } from '../components/WhatsApp';
import { Button } from '../components/ui/button';
import { categorie, corsiPubblicabili } from '../data/corsiSicurezza';

const ACCORDO = 'Accordo Stato-Regioni del 17 aprile 2025 (rep. atti n. 59/CSR)';

const VANTAGGI = [
  { icona: Laptop, titolo: 'Quando vuoi tu', testo: 'Corsi asincroni: si seguono da computer, tablet o telefono, negli orari che decidi tu. Nessuna aula, nessuna trasferta.' },
  { icona: BadgeCheck, titolo: 'Attestato valido', testo: "Percorsi progettati ed erogati da EFEI, Organismo Paritetico nazionale, secondo il D.Lgs. 81/2008 e il nuovo Accordo Stato-Regioni del 17 aprile 2025. L'attestato, firmato da EFEI e da A.U.G.E. Università – Dipartimento Salute e Sicurezza sul Lavoro, è valido per il riconoscimento dei CFU secondo i regolamenti AUGE ed è verificabile tramite QR code." },
  { icona: Users, titolo: 'Anche per più dipendenti', testo: 'Iscrivi in una volta sola tutti i lavoratori da formare: i dati di ciascuno restano separati e tracciati.' },
];

const PASSI = [
  { n: '01', titolo: 'Scegli il corso', testo: 'Individua il corso che copre il tuo obbligo formativo e indica quante persone devi iscrivere.' },
  { n: '02', titolo: 'Inserisci i dati e paghi', testo: 'Compili anagrafica dei partecipanti e dati di fatturazione, poi paghi online in modo sicuro.' },
  { n: '03', titolo: 'Confermi l’account', testo: 'Entro 24 ore registriamo i partecipanti sulla piattaforma. A ciascuno arriva un’email per confermare il proprio account: va confermata, è il passaggio senza il quale il corso non può essere abbinato.' },
  { n: '04', titolo: 'Inizi il corso', testo: 'Confermato l’account, abbiniamo il corso acquistato e si può partire. Superato il test finale, l’attestato si scarica dalla piattaforma.' },
];

/** Copia negli appunti l'indirizzo della scheda: comodo per campagne e messaggi. */
function CopiaLink({ url }) {
  const [copiato, setCopiato] = useState(false);
  const copia = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2000);
    } catch (e) {
      window.prompt('Copia il link del corso:', url);
    }
  };
  return (
    <button onClick={copia} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors">
      {copiato ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      {copiato ? 'Link copiato' : 'Copia link del corso'}
    </button>
  );
}

export default function CorsiSicurezza() {
  const [categoriaAttiva, setCategoriaAttiva] = useState('tutte');
  const { corsoId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

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

  // Ogni corso ha il suo indirizzo, da usare nelle campagne:
  //   /corsi-sicurezza/<id>              scheda del corso
  //   /corsi-sicurezza/<id>/iscrizione   direttamente al modulo d'acquisto
  const dettaglio = corsoId ? corsi.find((c) => c.id === corsoId) || null : null;
  const iscrizione = dettaglio && pathname.replace(/\/$/, '').endsWith('/iscrizione') ? dettaglio : null;
  const BASE = '/corsi-sicurezza';
  const setIscrizione = (c) => navigate(c ? `${BASE}/${c.id}/iscrizione` : `${BASE}/${dettaglio.id}`);

  // Corso inesistente o non piu in vendita: torna al catalogo
  useEffect(() => {
    if (corsoId && !dettaglio) navigate(BASE, { replace: true });
  }, [corsoId, dettaglio, navigate]);

  // Su smartphone il pulsante "Iscriviti ora" resta sempre a portata di dito:
  // quando quello principale esce dallo schermo compare una barra fissa in basso.
  const [ctaEl, ctaPrincipale] = useState(null);
  const [ctaVisibile, setCtaVisibile] = useState(true);
  useEffect(() => {
    if (!ctaEl || typeof IntersectionObserver === 'undefined') { setCtaVisibile(true); return undefined; }
    const osservatore = new IntersectionObserver(([voce]) => setCtaVisibile(voce.isIntersecting), { threshold: 0 });
    osservatore.observe(ctaEl);
    return () => osservatore.disconnect();
  }, [ctaEl]);
  const visibili = useMemo(
    () => (categoriaAttiva === 'tutte' ? corsi : corsi.filter((c) => c.categoria === categoriaAttiva)),
    [corsi, categoriaAttiva]
  );

  // Formato "pagina riepilogo" di Google: posizione e indirizzo di ogni scheda corso
  const schema = useMemo(
    () => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Corsi di sicurezza sul lavoro online',
      numberOfItems: corsi.length,
      itemListElement: corsi.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://www.mariobruzzese.it/corsi-sicurezza/${c.id}`,
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
          canonical={`https://www.mariobruzzese.it/corsi-sicurezza/${iscrizione.id}`}
          noIndex
        />
        <IscrizioneCorso corso={iscrizione} onIndietro={() => setIscrizione(null)} />
        <WhatsAppFisso testo={`Ciao, sto compilando l’iscrizione al corso «${iscrizione.titolo}» e ho una domanda.`} />
      </div>
    );
  }

  if (dettaglio) {
    return (
      <div className="min-h-screen pt-28 md:pt-40 pb-28 md:pb-20">
        <SEOHead
          title={dettaglio.seoTitolo}
          description={dettaglio.seoDescrizione}
          canonical={`https://www.mariobruzzese.it/corsi-sicurezza/${dettaglio.id}`}
        />
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between gap-4 mb-8">
            <Link to={BASE} className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
              <ArrowLeft className="w-4 h-4" /> Torna al catalogo
            </Link>
            <CopiaLink url={`https://www.mariobruzzese.it/corsi-sicurezza/${dettaglio.id}`} />
          </div>

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
                <div><dt className="inline font-semibold text-gray-900">Conformità: </dt><dd className="inline">{ACCORDO}</dd></div>
                <div><dt className="inline font-semibold text-gray-900">Modalità: </dt><dd className="inline">e-learning asincrono</dd></div>
              </dl>
              {dettaglio.avviso && <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">{dettaglio.avviso}</p>}
              {dettaglio.lancio && (
                <p className="inline-block text-xs font-semibold uppercase tracking-wide text-white bg-black rounded px-2.5 py-1 mb-2">
                  Prezzo di lancio · fino al 31 ottobre
                </p>
              )}
              <p className="text-3xl font-bold text-gray-900 mb-1">{dettaglio.prezzo}&nbsp;€</p>
              <p className="text-sm text-gray-500 mb-6">a partecipante, IVA compresa</p>
              <div ref={ctaPrincipale}>
                <Button onClick={() => setIscrizione(dettaglio)} size="lg" className="bg-black text-white hover:bg-gray-800 w-full">
                  Iscriviti ora
                </Button>
              </div>
              <div className="mt-3">
                <WhatsAppLink testo={`Ciao, vorrei informazioni sul corso «${dettaglio.titolo}» (${dettaglio.ore} ore): https://www.mariobruzzese.it/corsi-sicurezza/${dettaglio.id}`}>
                  Hai domande? Scrivici su WhatsApp
                </WhatsAppLink>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Programma del corso</h2>
          <p className="text-sm text-gray-500 mb-6">Programma didattico ufficiale dell’ente erogatore.</p>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            {dettaglio.programma.map((riga, i) => (
              <p key={i}>{riga}</p>
            ))}
          </div>

          <div className="mt-10 border-2 border-black rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-bold text-gray-900">{dettaglio.titolo} · {dettaglio.ore} ore</p>
              <p className="text-sm text-gray-600">100% online, attestato con QR code. {dettaglio.prezzo}&nbsp;€ a partecipante.</p>
            </div>
            <Button onClick={() => setIscrizione(dettaglio)} size="lg" className="bg-black text-white hover:bg-gray-800 whitespace-nowrap">
              Iscriviti ora
            </Button>
          </div>

          {dettaglio.correlati.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Altri corsi della stessa area</h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {dettaglio.correlati.map((x) => (
                  <li key={x.id}>
                    <Link
                      to={`${BASE}/${x.id}`}
                      className="flex items-center justify-between gap-4 border-2 border-gray-100 hover:border-black rounded-xl px-4 py-3 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{x.titolo}</span>
                      <span className="text-sm text-gray-500 whitespace-nowrap">{x.ore} ore · {x.prezzo}&nbsp;€</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-12 bg-gray-50 rounded-xl p-6 text-sm text-gray-600">
            Corso erogato da <strong>EFEI — Organismo Paritetico Salute e Sicurezza nei Luoghi di Lavoro</strong>
            tramite l’Unità Operativa codice 2403, in conformità al <strong>D.Lgs. 9 aprile 2008 n. 81</strong> e
            all’<strong>{ACCORDO}</strong>. MB Consulting cura la promozione, l’iscrizione e l’assistenza;
            l’erogazione è di EFEI e di <strong>A.U.G.E. Università – Ateneo delle Professioni, Dipartimento Salute e
            Sicurezza sul Lavoro</strong>, indicati entrambi sull’attestato come soggetti formatori. Superato il test
            finale, l’attestato si scarica dalla piattaforma: è verificabile tramite QR code ed è valido per il
            riconoscimento dei CFU secondo i regolamenti AUGE.
          </div>
        </div>
        {!ctaVisibile && (
          <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-gray-900 leading-tight">{dettaglio.prezzo}&nbsp;€</p>
              <p className="text-xs text-gray-500 truncate">{dettaglio.ore} ore · 100% online</p>
            </div>
            <Button onClick={() => setIscrizione(dettaglio)} className="bg-black text-white hover:bg-gray-800 px-6">
              Iscriviti ora
            </Button>
          </div>
        )}
        <WhatsAppFisso sopraBarra={!ctaVisibile} testo={`Ciao, vorrei informazioni sul corso «${dettaglio.titolo}».`} />
      </div>
    );
  }

  return (
    <>
      <WhatsAppFisso testo="Ciao, vorrei informazioni sui corsi di sicurezza sul lavoro." />
      <SEOHead
        title="Corsi Sicurezza sul Lavoro Online – Accordo Stato-Regioni 2025"
        description="Corsi di sicurezza sul lavoro online, Accordo Stato-Regioni 2025: lavoratori, datore di lavoro, RSPP, RLS, formatori, HACCP. Attestato con QR code, da 25 €."
        canonical="https://www.mariobruzzese.it/corsi-sicurezza"
        schema={schema}
      />

      <div className="min-h-screen pt-40 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-40" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }} className="max-w-3xl mb-16">
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full text-sm font-medium">
                <ShieldCheck className="w-4 h-4" /> Formazione obbligatoria D.Lgs 81/08
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full text-sm font-medium">
                <ScrollText className="w-4 h-4" /> Accordo Stato-Regioni 17 aprile 2025
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Corsi di sicurezza sul lavoro online
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Metti in regola la tua azienda senza fermare il lavoro: {corsi.length} corsi in e-learning asincrono,
              erogati tramite l’Unità Operativa 2403 di EFEI, con attestato scaricabile dalla piattaforma a fine percorso.
            </p>

            <div className="mt-8 border-l-2 border-gray-900 pl-5 text-[15px] text-gray-600 leading-relaxed">
              <p>
                I percorsi sono progettati ed erogati da EFEI in conformità al <strong>D.Lgs. 9 aprile 2008 n. 81</strong>
                {' '}e all’<strong>{ACCORDO}</strong>, pubblicato in Gazzetta Ufficiale n. 119 del 24 maggio 2025.
              </p>
              <p className="mt-2">
                Dal <strong>24 maggio 2026</strong>, concluso il periodo transitorio, l’Accordo disciplina in via
                esclusiva durata e contenuti minimi della formazione: i corsi qui proposti seguono il nuovo impianto.
              </p>
            </div>
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
                  <h3 className="font-bold text-gray-900 mb-2 leading-snug">
                    <Link to={`${BASE}/${corso.id}`} className="hover:underline">{corso.titolo}</Link>
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 flex-1">{corso.destinatari}</p>
                  <p className={`text-xs text-gray-500 ${corso.avviso ? 'mb-2' : 'mb-5'}`}>{corso.normativa} · ASR 17/04/2025</p>
                  {corso.avviso && <p className="text-xs text-amber-800 mb-5">⚠ {corso.avviso}</p>}
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      {corso.lancio && (
                        <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-white bg-black rounded px-2 py-0.5 mb-1.5">
                          Prezzo di lancio · fino al 31 ottobre
                        </span>
                      )}
                      <span className="block text-2xl font-bold text-gray-900 leading-none">{corso.prezzo}&nbsp;€</span>
                      <span className="block text-xs text-gray-500 mt-1">IVA compresa</span>
                    </span>
                    <Button asChild className="bg-black text-white hover:bg-gray-800">
                      <Link to={`${BASE}/${corso.id}`} aria-label={`Dettagli: ${corso.titolo}`}>Dettagli</Link>
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
            e la piattaforma autorizzata EFEI, in conformità al <strong>D.Lgs. 9 aprile 2008 n. 81</strong> e
            all’<strong>{ACCORDO}</strong>, pubblicato in Gazzetta Ufficiale n. 119 del 24 maggio 2025 ed
            efficace senza più regime transitorio dal 24 maggio 2026. MB Consulting di Mario Bruzzese opera come
            mandatario per la promozione e la vendita, in nome proprio e per finalità proprie, e non è un Organismo
            Paritetico: la conformità dei percorsi, l’erogazione e il rilascio dell’attestato competono a EFEI.
            L’attestato è rilasciato al superamento del test finale e indica come soggetti formatori EFEI e
            <strong>A.U.G.E. Università – Ateneo delle Professioni, Dipartimento Salute e Sicurezza sul Lavoro</strong>;
            è verificabile tramite QR code e valido per il riconoscimento dei CFU secondo i regolamenti AUGE.
          </div>
        </div>
      </div>
    </>
  );
}
