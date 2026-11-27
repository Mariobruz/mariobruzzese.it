import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, BadgeCheck, Briefcase, Check, CheckCircle2, ChevronDown, ClipboardCheck, ConciergeBell, Globe, HardHat, Layers, Link2, Clock,
  Info, Laptop, Megaphone, MessageCircle, Presentation, RefreshCw, ScrollText, Search, ShieldCheck, Tag, UserCog, Users, UtensilsCrossed, XCircle,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import IscrizioneCorso from '../components/IscrizioneCorso';
import { scadenzeCorsi } from '../data/modalitaErogazione';
import { faqCorso } from '../data/faqCorsi';
import { WhatsAppFisso, WhatsAppLink, linkWhatsApp } from '../components/WhatsApp';
import { categorie, corsiPubblicabili } from '../data/corsiSicurezza';
import { concludiAcquistoInCorso } from '../googleAds';

const ACCORDO = 'Accordo Stato-Regioni del 17 aprile 2025 (rep. atti n. 59/CSR)';

const VANTAGGI = [
  { icona: Laptop, titolo: 'Quando vuoi tu', testo: 'Corsi asincroni: si seguono da computer, tablet o telefono, negli orari che decidi tu. Nessuna aula, nessuna trasferta.' },
  { icona: BadgeCheck, titolo: 'Attestato valido', testo: "Corsi in convenzione con O.P.N. Italia Lavoro, conformi al D.Lgs. 81/2008 e al nuovo Accordo Stato-Regioni del 17 aprile 2025. L'attestato indica come soggetto formatore O.P.N. Italia Lavoro – CNL – EBAFoS ed è verificabile tramite QR code sul sito opnitalialavoro.it." },
  { icona: Users, titolo: 'Anche per più dipendenti', testo: 'Iscrivi in una volta sola tutti i lavoratori da formare: i dati di ciascuno restano separati e tracciati.' },
];

const PASSI = [
  { titolo: 'Scegli il corso', testo: 'Individua il corso che copre il tuo obbligo formativo e indica quante persone devi iscrivere.' },
  { titolo: 'Inserisci i dati e paghi', testo: 'Indichi i dati per la fattura (privato o azienda) e, per ogni partecipante, nome, cognome, codice fiscale ed email. Poi paghi online in modo sicuro.' },
  { titolo: 'Ricevi le credenziali', testo: 'Entro 24 ore lavorative iscriviamo i partecipanti sulla piattaforma: a ciascuno arriva dalla piattaforma O.P.N. Italia Lavoro (non dal nostro sito) un’email con link di accesso, nome utente e password. Può finire nello spam: controlla anche lì.' },
  { titolo: 'Inizi il corso', testo: 'Al primo accesso il partecipante completa i suoi dati e inizia il corso. Superato il test finale, riceve l’attestato verificabile tramite QR code.' },
];

const DOMANDE = [
  { domanda: 'Come si svolgono i corsi?', risposta: 'In e-learning asincrono: si seguono da computer, tablet o telefono, negli orari che decidi tu, senza aula e senza trasferte. Puoi iscrivere in una volta sola tutti i dipendenti da formare.' },
  { domanda: 'L’attestato ha validità?', risposta: 'Sì. I corsi sono realizzati in convenzione con O.P.N. Italia Lavoro, in conformità al D.Lgs. 81/2008 e all’Accordo Stato-Regioni del 17 aprile 2025. L’attestato indica come soggetto formatore O.P.N. Italia Lavoro – CNL – EBAFoS ed è verificabile tramite QR code sul sito opnitalialavoro.it.' },
  { domanda: 'È previsto un aggiornamento?', risposta: 'Sì: la formazione va aggiornata periodicamente e in catalogo trovi i corsi di aggiornamento per ogni figura. Nella pagina «Durate e scadenze» c’è la periodicità di ciascun corso secondo l’Accordo Stato-Regioni 2025.' },
];

const BTN_VERDE = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f8a6a] text-white font-bold hover:bg-[#0c7458] transition-colors';
const LIMITE = 6;
const TITOLO_CATEGORIA = {
  lavoratori: 'Corsi per lavoratori', datore: 'Corsi per il datore di lavoro', dirigenti: 'Corsi per dirigenti', rspp: 'Corsi per RSPP e ASPP',
  rls: 'Corsi per RLS', cantieri: 'Corsi per i cantieri', formatori: 'Corsi per formatori', haccp: 'Corsi HACCP e alimentaristi',
};
const ICONE_CATEGORIA = { lavoratori: Users, datore: Briefcase, dirigenti: UserCog, rspp: ClipboardCheck, rls: Megaphone, cantieri: HardHat, formatori: Presentation, haccp: UtensilsCrossed };
function iconaCorso(c) {
  const t = c.titolo.toLowerCase();
  if (t.includes('inglese')) return Globe;
  if (t.includes('cantieri')) return HardHat;
  if (c.aggiornamento) return RefreshCw;
  if (t.includes('turismo')) return ConciergeBell;
  if (t.includes('uffici')) return Laptop;
  if (t.includes('generale + specifica')) return Layers;
  if (t.includes('specifica')) return ShieldCheck;
  return ICONE_CATEGORIA[c.categoria] || ShieldCheck;
}
const normalizza = (x) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Copia negli appunti l'indirizzo della scheda: comodo per campagne e messaggi. */
function CopiaLink({ url, chiaro = false }) {
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
    <button onClick={copia} className={`inline-flex items-center gap-2 text-sm transition-colors ${chiaro ? 'text-gray-200 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
      {copiato ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      {copiato ? 'Link copiato' : 'Copia link del corso'}
    </button>
  );
}

export default function CorsiSicurezza() {
  const [categoriaAttiva, setCategoriaAttiva] = useState('lavoratori');
  const [cerca, setCerca] = useState('');
  const [tuttiVisibili, setTuttiVisibili] = useState(false);
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

  // Rientro da Stripe con pagamento riuscito: registriamo la conversione Google Ads (se consentita)
  useEffect(() => {
    if (ritorno && ritorno.esito === 'ok') concludiAcquistoInCorso(ritorno.riferimento);
  }, [ritorno]);

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
  const categorieVisibili = useMemo(() => categorie.filter((cat) => corsi.some((c) => c.categoria === cat.id)), [corsi]);
  const categoriaCorrente = categorieVisibili.find((c) => c.id === categoriaAttiva);
  const elenco = useMemo(() => {
    const q = normalizza(cerca.trim());
    if (q) return corsi.filter((c) => normalizza(`${c.titolo} ${c.destinatari} ${c.categoria}`).includes(q));
    return corsi.filter((c) => c.categoria === categoriaAttiva);
  }, [corsi, cerca, categoriaAttiva]);
  const elencoMostrato = cerca || tuttiVisibili ? elenco : elenco.slice(0, LIMITE);

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
                  Entro 24 ore lavorative iscriviamo i partecipanti sulla piattaforma e-learning.
                </p>
                <p className="mb-2">
                  Ogni partecipante riceverà dalla piattaforma O.P.N. Italia Lavoro (non dal nostro sito) un’email con il link di accesso, nome utente e password; al primo
                  accesso completerà i suoi dati e inizierà il corso. <strong>L’email può finire nello spam o nella
                  posta indesiderata: controllate anche lì.</strong>
                </p>
                <p>
                  Superato il test finale si riceve l’attestato, verificabile tramite QR code.
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-600 mb-8">
              Non è stato addebitato nulla. Puoi riprendere l’iscrizione quando vuoi: i dati vanno reinseriti.
            </p>
          )}
          <button type="button" onClick={chiudiRitorno} className={`${BTN_VERDE} px-6 py-3`}>
            Torna ai corsi
          </button>
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
    const scad = scadenzeCorsi[dettaglio.id];
    const IconaDett = iconaCorso(dettaglio);
    const categoriaDett = categorie.find((c) => c.id === dettaglio.categoria);
    return (
      <div className="bg-white pb-28 md:pb-0">
        <SEOHead
          title={dettaglio.seoTitolo}
          description={dettaglio.seoDescrizione}
          canonical={`https://www.mariobruzzese.it/corsi-sicurezza/${dettaglio.id}`}
        />

        {/* ------------------------------------------------ intestazione */}
        <section className="pt-[88px] bg-[#0f2742] text-white">
          <div className="max-w-6xl mx-auto px-6 pt-8 pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <Link to={BASE} className="inline-flex items-center gap-2 text-gray-200 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Torna al catalogo
              </Link>
              <CopiaLink url={`https://www.mariobruzzese.it/corsi-sicurezza/${dettaglio.id}`} chiaro />
            </div>
            <div className="mt-6 flex items-start gap-5">
              <span className="hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#86efb4]"><IconaDett className="w-8 h-8" /></span>
              <div>
                <div className="flex flex-wrap gap-2">
                  {categoriaDett && <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{categoriaDett.nome}</span>}
                  {dettaglio.aggiornamento && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#86efb4] px-3 py-1 text-xs font-bold text-[#0f2742]">
                      <RefreshCw className="w-3 h-3" /> Aggiornamento
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">{dettaglio.titolo}</h1>
                <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-gray-200">
                  <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" /> {dettaglio.ore} ore</span>
                  <span className="inline-flex items-center gap-1.5"><Laptop className="w-4 h-4" /> e-learning asincrono</span>
                  <span className="inline-flex items-center gap-1.5"><BadgeCheck className="w-4 h-4" /> attestato con QR code</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-10 grid gap-10 lg:grid-cols-[1fr_340px] items-start">
          {/* ------------------------------------------------ contenuto */}
          <div className="min-w-0">
            <div className="grid gap-6 md:grid-cols-2">
              <img src={process.env.PUBLIC_URL + dettaglio.immagine} alt={dettaglio.titolo} className="rounded-2xl w-full border border-gray-200" loading="lazy" />
              <dl className="rounded-2xl border border-gray-200 p-5 space-y-3 text-[15px] text-gray-700">
                <div><dt className="font-bold text-gray-900">Durata</dt><dd>{dettaglio.ore} ore</dd></div>
                <div><dt className="font-bold text-gray-900">Destinatari</dt><dd>{dettaglio.destinatari}</dd></div>
                <div><dt className="font-bold text-gray-900">Riferimento</dt><dd>{dettaglio.normativa}</dd></div>
                <div><dt className="font-bold text-gray-900">Conformità</dt><dd>{ACCORDO}</dd></div>
                <div><dt className="font-bold text-gray-900">Modalità</dt><dd>e-learning asincrono</dd></div>
              </dl>
            </div>
            {dettaglio.avviso && <p className="mt-6 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">{dettaglio.avviso}</p>}

            {scad && (
              <div className="mt-8 rounded-2xl bg-[#eef8f2] p-6">
                <h2 className="text-2xl font-bold text-gray-900">Durata e validità dell’attestato</h2>
                <dl className="mt-4 grid sm:grid-cols-2 gap-4 text-[15px]">
                  <div>
                    <dt className="text-gray-600 mb-1">Durata</dt>
                    <dd className="text-gray-900 font-semibold">{scad.durata}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600 mb-1">Validità e aggiornamento</dt>
                    <dd className="text-gray-900 font-semibold">{scad.validita}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm">
                  <Link to="/durata-scadenza-corsi-sicurezza" className="font-semibold text-[#0b5e48] underline hover:text-[#0f8a6a]">
                    Durate e scadenze di tutti i corsi
                  </Link>
                </p>
              </div>
            )}

            {dettaglio.programma.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Programma del corso</h2>
                <div className="mt-2 h-1 w-14 rounded bg-[#0f8a6a]" />
                <p className="mt-3 text-sm text-gray-500">Contenuti minimi previsti dalla normativa.</p>
                <div className="mt-5 space-y-3 text-gray-700 leading-relaxed">
                  {dettaglio.programma.map((riga, i) => (
                    <p key={i}>{riga}</p>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-10 rounded-2xl border-2 border-[#0f8a6a] bg-[#f6fbf8] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900">{dettaglio.titolo} · {dettaglio.ore} ore</p>
                <p className="text-sm text-gray-600">100% online, attestato con QR code. {dettaglio.prezzo}&nbsp;€ a partecipante.</p>
              </div>
              <button type="button" onClick={() => setIscrizione(dettaglio)} className={`${BTN_VERDE} px-6 py-3 whitespace-nowrap`}>
                Iscriviti ora
              </button>
            </div>

            <section className="mt-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Domande frequenti</h2>
              <div className="mt-2 h-1 w-14 rounded bg-[#0f8a6a]" />
              <div className="mt-6 divide-y divide-gray-200 rounded-xl border border-gray-200">
                {faqCorso(dettaglio, scad).map((x) => (
                  <details key={x.d} className="group px-5">
                    <summary className="cursor-pointer list-none flex items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">{x.d}</h3>
                      <ChevronDown className="w-5 h-5 shrink-0 text-gray-700 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <p className="pb-5 text-gray-700 leading-relaxed">{x.r}</p>
                  </details>
                ))}
              </div>
            </section>

            {dettaglio.correlati.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Altri corsi della stessa area</h2>
                <div className="mt-2 h-1 w-14 rounded bg-[#0f8a6a]" />
                <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                  {dettaglio.correlati.map((x) => {
                    const IconaX = iconaCorso({ ...x, categoria: dettaglio.categoria, aggiornamento: /aggiornamento/i.test(x.titolo) });
                    return (
                      <li key={x.id}>
                        <Link to={`${BASE}/${x.id}`}
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:border-[#0f8a6a] transition-colors">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e3f7ec] text-[#0f8a6a]"><IconaX className="w-5 h-5" /></span>
                          <span className="flex-1 font-semibold text-gray-900 leading-snug">{x.titolo}</span>
                          <span className="text-sm text-gray-500 whitespace-nowrap">{x.ore} ore · {x.prezzo}&nbsp;€</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <div className="mt-12 rounded-2xl bg-gray-50 p-6 text-sm text-gray-600 leading-relaxed">
              Soggetto formatore: <strong>O.P.N. Italia Lavoro – CNL – EBAFoS</strong>. Soggetto attuatore:
              {' '}<strong>MB Consulting di Mario Bruzzese</strong>, in convenzione con O.P.N. Italia Lavoro (Convenzione
              {' '}n. CFAL.1866). Corso in e-learning conforme al <strong>D.Lgs. 9 aprile 2008 n. 81</strong> e
              {' '}all’<strong>{ACCORDO}</strong>. Superato il test finale si riceve l’attestato, verificabile tramite
              {' '}QR code sul sito opnitalialavoro.it.
            </div>
          </div>

          {/* ------------------------------------------------ riquadro acquisto */}
          <aside className="lg:sticky lg:top-32 order-first lg:order-none rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            {dettaglio.lancio && (
              <p className="inline-block text-xs font-bold uppercase tracking-wide text-white bg-[#0f8a6a] rounded px-2.5 py-1 mb-2">
                Prezzo di lancio · fino al 31 ottobre
              </p>
            )}
            <p className="text-4xl font-bold text-gray-900">{dettaglio.prezzo}&nbsp;€</p>
            <p className="text-sm text-gray-500">a partecipante, IVA compresa</p>
            <p className="mt-3 flex gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900">
              <Info className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              Corso a pagamento, non coperto dai fondi interprofessionali.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li className="flex gap-2"><Check className="w-4 h-4 mt-0.5 text-[#0f8a6a]" /> {dettaglio.ore} ore in e-learning, quando vuoi</li>
              <li className="flex gap-2"><Check className="w-4 h-4 mt-0.5 text-[#0f8a6a]" /> Credenziali entro 24 ore lavorative</li>
              <li className="flex gap-2"><Check className="w-4 h-4 mt-0.5 text-[#0f8a6a]" /> Attestato verificabile con QR code</li>
            </ul>
            <div ref={ctaPrincipale} className="mt-5">
              <button type="button" onClick={() => setIscrizione(dettaglio)} className={`${BTN_VERDE} w-full text-lg py-3.5`}>
                Iscriviti ora
              </button>
            </div>
            <div className="mt-3">
              <WhatsAppLink testo={`Ciao, vorrei informazioni sul corso «${dettaglio.titolo}» (${dettaglio.ore} ore): https://www.mariobruzzese.it/corsi-sicurezza/${dettaglio.id}`}>
                Hai domande? Scrivici su WhatsApp
              </WhatsAppLink>
            </div>
          </aside>
        </div>

        {/* ------------------------------------------------ aiuto */}
        <section className="bg-[#0f2742] text-white">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold">Non sei sicuro che sia il corso giusto?</h2>
              <p className="mt-2 text-lg text-gray-200">Scrivici: ti aiutiamo a scegliere il percorso adatto a te o ai tuoi dipendenti.</p>
            </div>
            <a href={linkWhatsApp(`Ciao, vorrei capire se il corso «${dettaglio.titolo}» è quello giusto per me.`)} target="_blank" rel="noopener noreferrer"
              className={`${BTN_VERDE} shrink-0 text-lg px-8 py-3.5`}>
              <MessageCircle className="w-5 h-5" /> Chiedi assistenza
            </a>
          </div>
        </section>

        {!ctaVisibile && (
          <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-gray-900 leading-tight">{dettaglio.prezzo}&nbsp;€</p>
              <p className="text-xs text-gray-500 truncate">{dettaglio.ore} ore · 100% online</p>
            </div>
            <button type="button" onClick={() => setIscrizione(dettaglio)} className={`${BTN_VERDE} px-6 py-2.5`}>
              Iscriviti ora
            </button>
          </div>
        )}
        <WhatsAppFisso sopraBarra={!ctaVisibile} testo={`Ciao, vorrei informazioni sul corso «${dettaglio.titolo}».`} />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <WhatsAppFisso testo="Ciao, vorrei informazioni sui corsi di sicurezza sul lavoro." />
      <SEOHead
        title="Corsi Sicurezza sul Lavoro Online – Accordo Stato-Regioni 2025"
        description="Corsi di sicurezza sul lavoro online, Accordo Stato-Regioni 2025: lavoratori, datore di lavoro, RSPP, RLS, formatori, HACCP. Attestato con QR code, da 40 €."
        canonical="https://www.mariobruzzese.it/corsi-sicurezza"
        schema={schema}
      />

      {/* ------------------------------------------------ apertura */}
      <section className="pt-[88px]">
        <div className="grid lg:grid-cols-2 bg-[#0f2742] lg:min-h-[580px]">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
            className="px-6 sm:px-12 lg:pl-[max(3rem,calc((100vw-80rem)/2+1.5rem))] py-14 lg:py-16 flex flex-col justify-center text-white">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#86efb4]" /> Formazione obbligatoria D.Lgs 81/08
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold">
                <ScrollText className="w-4 h-4 text-[#86efb4]" /> Accordo Stato-Regioni 17 aprile 2025
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.05]">Corsi di sicurezza sul lavoro</h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-100">
              Formazione e aggiornamento in e-learning. Metti in regola la tua azienda senza fermare il lavoro: {corsi.length} corsi in e-learning
              asincrono, in convenzione con O.P.N. Italia Lavoro, con attestato verificabile tramite QR code a fine percorso.
            </p>
            <div className="mt-8">
              <button type="button" onClick={() => document.getElementById('trova')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className={`${BTN_VERDE} text-lg px-7 py-3.5`}>Esplora i corsi</button>
            </div>
          </motion.div>
          <div className="relative aspect-[16/9] lg:aspect-auto overflow-hidden lg:[clip-path:polygon(10%_0,100%_0,100%_100%,0_100%)]">
            <img src="/img/corsi-sicurezza-hero.webp" alt="Un formatore spiega la sicurezza sul lavoro a un gruppo di partecipanti" width="482" height="275"
              className="absolute inset-0 w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ avviso: corsi a pagamento */}
      <section className="max-w-6xl mx-auto px-6 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-4">
          <Info className="w-7 h-7 shrink-0 text-amber-700" aria-hidden="true" />
          <p className="flex-1 text-gray-800 leading-relaxed">
            <strong>Corsi a pagamento.</strong> I corsi E-learning 81/08 si acquistano online al prezzo indicato e
            {' '}<strong>non sono coperti dai fondi interprofessionali</strong>.
          </p>
          <Link to="/formazione-finanziata" className="inline-flex shrink-0 items-center gap-1.5 font-bold text-[#0b5e48] underline underline-offset-4 hover:text-[#0f8a6a]">
            Cerchi la formazione finanziata? <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------ ricerca e categorie */}
      <section id="trova" className="mt-8 bg-[#eef8f2] scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Trova il tuo corso</h2>
          <label className="mt-5 relative block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="search" value={cerca} onChange={(e) => setCerca(e.target.value)} aria-label="Cerca un corso"
              placeholder="Cerca un corso (es. formazione generale, RSPP, HACCP…)"
              className="w-full rounded-xl border-2 border-gray-200 bg-white pl-12 pr-4 py-3.5 text-gray-900 focus:border-[#0f8a6a] focus:outline-none" />
          </label>
          <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Categorie di corsi">
            {categorieVisibili.map((cat) => {
              const attiva = !cerca && categoriaAttiva === cat.id;
              return (
                <button key={cat.id} type="button" role="tab" aria-selected={attiva}
                  onClick={() => { setCategoriaAttiva(cat.id); setCerca(''); setTuttiVisibili(false); }}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-bold transition-colors ${attiva ? 'border-[#0f8a6a] bg-[#0f8a6a] text-white' : 'border-gray-200 bg-white text-gray-800 hover:border-[#0f8a6a]'}`}>
                  {cat.nome}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ elenco */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {cerca ? `Risultati per «${cerca}»` : TITOLO_CATEGORIA[categoriaAttiva] || categoriaCorrente?.nome}
        </h2>
        <p className="mt-2 text-gray-600">
          {cerca ? `${elenco.length} ${elenco.length === 1 ? 'corso trovato' : 'corsi trovati'}.` : `${categoriaCorrente?.descrizione || ''}. Percorsi in e-learning conformi al D.Lgs. 81/08 e all’Accordo Stato-Regioni 2025.`}
        </p>
        {elenco.length === 0 && (
          <p className="mt-8 rounded-xl bg-gray-50 p-6 text-gray-700">
            Nessun corso corrisponde alla ricerca. Prova con un’altra parola o <a className="underline font-semibold" href={linkWhatsApp(`Ciao, cerco un corso: ${cerca}`)} target="_blank" rel="noopener noreferrer">scrivici su WhatsApp</a>.
          </p>
        )}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {elencoMostrato.map((corso) => {
            const Icona = iconaCorso(corso);
            return (
              <article key={corso.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-[#0f8a6a]/40 transition">
                <div className="flex gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#e3f7ec] text-[#0f8a6a]"><Icona className="w-7 h-7" /></span>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 leading-snug">
                      <Link to={`${BASE}/${corso.id}`} className="hover:underline">{corso.titolo}</Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">{corso.destinatari}</p>
                    {corso.aggiornamento && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700"><RefreshCw className="w-3 h-3" /> Aggiornamento</span>}
                    {corso.avviso && <p className="mt-2 text-xs text-amber-800">⚠ {corso.avviso}</p>}
                  </div>
                </div>
                <div className="mt-auto pt-5">
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-gray-700"><Clock className="w-4 h-4" /> {corso.ore} ore</span>
                    <span className="inline-flex items-start gap-1.5">
                      <Tag className="w-4 h-4 mt-1 text-gray-700" />
                      <span>
                        {corso.lancio && <span className="block text-[10px] font-bold uppercase tracking-wide text-[#0f8a6a]">Prezzo di lancio · fino al 31 ottobre</span>}
                        <span className="block text-lg font-bold text-gray-900 leading-none">{corso.prezzo}&nbsp;€</span>
                        <span className="block whitespace-nowrap text-[11px] leading-tight text-gray-500">per partecipante<br />IVA inclusa</span>
                      </span>
                    </span>
                    <Link to={`${BASE}/${corso.id}`} aria-label={`Vedi il corso: ${corso.titolo}`}
                      className="ml-auto shrink-0 rounded-lg bg-[#0f8a6a] px-3.5 py-2 text-sm font-bold text-white hover:bg-[#0c7458] transition-colors">
                      Vedi il corso
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!cerca && elenco.length > LIMITE && (
          <div className="mt-8 text-center">
            <button type="button" onClick={() => setTuttiVisibili(!tuttiVisibili)}
              className="inline-flex items-center gap-2 font-bold text-[#0f8a6a] underline underline-offset-4 hover:text-[#0b5e48]">
              {tuttiVisibili ? 'Mostra meno corsi' : `Mostra tutti i ${(TITOLO_CATEGORIA[categoriaAttiva] || 'corsi').replace(/^Corsi /, 'corsi ')} (${elenco.length})`}
              <ArrowRight className={`w-4 h-4 transition-transform ${tuttiVisibili ? '-rotate-90' : ''}`} />
            </button>
          </div>
        )}
      </section>

      {/* ------------------------------------------------ vantaggi e normativa */}
      <section className="max-w-6xl mx-auto px-6 pb-14">
        <div className="grid gap-5 md:grid-cols-3">
          {VANTAGGI.map((v) => (
            <div key={v.titolo} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e3f7ec] text-[#0f8a6a]"><v.icona className="w-6 h-6" /></span>
              <h3 className="mt-4 text-xl font-bold text-gray-900">{v.titolo}</h3>
              <p className="mt-2 text-gray-700 leading-relaxed">{v.testo}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 border-l-4 border-[#0f8a6a] bg-[#f6fbf8] rounded-r-xl px-6 py-5 text-[15px] text-gray-700 leading-relaxed">
          <p>
            I percorsi sono realizzati in convenzione con O.P.N. Italia Lavoro, in conformità al <strong>D.Lgs. 9 aprile 2008 n. 81</strong>
            {' '}e all’<strong>{ACCORDO}</strong>, pubblicato in Gazzetta Ufficiale n. 119 del 24 maggio 2025.
          </p>
          <p className="mt-2">
            Dal <strong>24 maggio 2026</strong>, concluso il periodo transitorio, l’Accordo disciplina in via
            esclusiva durata e contenuti minimi della formazione: i corsi qui proposti seguono il nuovo impianto.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------ come funziona */}
      <section className="bg-[#eef8f2] py-14">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Come funziona l’iscrizione</h2>
          <div className="mt-2 h-1 w-14 rounded bg-[#0f8a6a]" />
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PASSI.map((p, i) => (
              <li key={p.titolo} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f8a6a] text-white font-bold text-lg">{i + 1}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-snug">{p.titolo}</h3>
                  <p className="mt-1 text-gray-700 leading-relaxed">{p.testo}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------ modalità e attestati */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Modalità e attestati</h2>
        <div className="mt-2 h-1 w-14 rounded bg-[#0f8a6a]" />
        <div className="mt-8 divide-y divide-gray-200 rounded-xl border border-gray-200">
          {DOMANDE.map((d) => (
            <details key={d.domanda} className="group px-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-bold text-gray-900 [&::-webkit-details-marker]:hidden">
                {d.domanda}
                <ChevronDown className="w-5 h-5 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="pb-5 text-gray-700 leading-relaxed">{d.risposta}</div>
            </details>
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900">Non sai quale corso ti serve?</h3>
            <p className="mt-2 text-gray-700">
              Dal codice ATECO scopri se la tua attività è a rischio basso, medio o alto e quante ore servono ai
              lavoratori. Nell’altra pagina, durata e scadenza di ogni corso secondo l’Accordo Stato-Regioni 2025.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/codice-ateco-livello-di-rischio" className="rounded-lg border-2 border-[#0f8a6a] px-4 py-2 font-bold text-[#0b5e48] hover:bg-[#e3f7ec]">Il mio codice ATECO</Link>
              <Link to="/durata-scadenza-corsi-sicurezza" className="rounded-lg border-2 border-[#0f8a6a] px-4 py-2 font-bold text-[#0b5e48] hover:bg-[#e3f7ec]">Durate e scadenze</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900">Hai un’azienda in Calabria?</h3>
            <p className="mt-2 text-gray-700">I corsi più richiesti dalle aziende calabresi, dal turismo all’HACCP, in una pagina dedicata.</p>
            <Link to="/corsi-sicurezza-calabria" className="mt-4 inline-flex items-center gap-2 font-bold text-[#0f8a6a] hover:text-[#0b5e48]">Corsi di sicurezza online per le aziende calabresi <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-gray-50 p-6 sm:p-8 text-sm text-gray-600 leading-relaxed">
          I corsi sono erogati in modalità e-learning asincrona in collaborazione tra <strong>O.P.N. Italia Lavoro</strong>
          {' '}(Organismo Paritetico Nazionale), <strong>CNL – Confederazione Nazionale del Lavoro</strong> ed
          {' '}<strong>EBAFoS</strong> (Organismo Paritetico Intersettoriale – Ente Bilaterale Nazionale), in conformità al
          {' '}<strong>D.Lgs. 9 aprile 2008 n. 81</strong> e all’<strong>{ACCORDO}</strong>, pubblicato in Gazzetta
          {' '}Ufficiale n. 119 del 24 maggio 2025 ed efficace senza più regime transitorio dal 24 maggio 2026.
          {' '}<strong>MB Consulting di Mario Bruzzese</strong> è soggetto attuatore in convenzione con O.P.N. Italia
          {' '}Lavoro (Convenzione n. CFAL.1866) e cura iscrizione, tutoraggio e assistenza; non è un Organismo
          {' '}Paritetico. L’attestato è rilasciato al superamento del test finale, indica come soggetto formatore
          {' '}O.P.N. Italia Lavoro – CNL – EBAFoS ed è verificabile tramite QR code sul sito opnitalialavoro.it.
        </div>
      </section>

      {/* ------------------------------------------------ aiuto */}
      <section className="bg-[#0f2742] text-white">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold">Ti serve aiuto a scegliere il corso?</h2>
            <p className="mt-2 text-lg text-gray-200">Ti aiutiamo a trovare il percorso giusto per te o per i tuoi dipendenti.</p>
          </div>
          <a href={linkWhatsApp('Ciao, mi aiutate a scegliere il corso di sicurezza giusto?')} target="_blank" rel="noopener noreferrer"
            className={`${BTN_VERDE} shrink-0 text-lg px-8 py-3.5`}>
            <MessageCircle className="w-5 h-5" /> Chiedi assistenza
          </a>
        </div>
      </section>
    </div>
  );
}
