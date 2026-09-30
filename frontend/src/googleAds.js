/**
 * googleAds.js — tag di conversione Google Ads, attivo solo con il consenso del visitatore.
 *
 * Senza consenso non viene caricato alcuno script di Google e non viene scritto alcun cookie.
 * La scelta (accetta/rifiuta) è salvata nel browser; si può cambiare dalla pagina Privacy.
 * Chi ha escluso il proprio browser dalle statistiche (?nostat=1) non genera conversioni.
 */
const ID_ADS = 'AW-860190625';
const CONVERSIONE_ACQUISTO = 'AW-860190625/DJ9VCLulu4odEKHvlZoD';
const CHIAVE_CONSENSO = 'mb-consenso-marketing';
const CHIAVE_NOSTAT = 'mb-niente-statistiche';
const CHIAVE_ACQUISTO = 'mb-acquisto-in-corso';
export const EVENTO_CONSENSO = 'mb-consenso-cambiato';

const leggi = (s, k) => { try { return s.getItem(k); } catch (e) { return null; } };
const scrivi = (s, k, v) => { try { v === null ? s.removeItem(k) : s.setItem(k, v); } catch (e) { /* niente */ } };
const locale = () => (typeof window === 'undefined' ? null : window.localStorage);
const sessione = () => (typeof window === 'undefined' ? null : window.sessionStorage);

/** 'si' | 'no' | null (non ancora scelto) */
export const leggiConsenso = () => (locale() ? leggi(locale(), CHIAVE_CONSENSO) : null);

let caricato = false;
function carica() {
  if (caricato || typeof document === 'undefined') return;
  if (locale() && leggi(locale(), CHIAVE_NOSTAT) === '1') return;
  caricato = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  // Consent Mode v2: si parte da "negato" e si aggiorna subito con la scelta del visitatore.
  window.gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied',
  });
  window.gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted' });
  window.gtag('js', new Date());
  window.gtag('config', ID_ADS);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ID_ADS}`;
  document.head.appendChild(s);
}

/** Da chiamare all'avvio: carica il tag solo se il visitatore ha già accettato. */
export function avviaGoogleAds() {
  if (leggiConsenso() === 'si') carica();
}

export function impostaConsenso(valore) {
  if (!locale()) return;
  scrivi(locale(), CHIAVE_CONSENSO, valore);
  if (valore === 'si') carica();
  else if (caricato && window.gtag) {
    window.gtag('consent', 'update', { ad_storage: 'denied', ad_user_data: 'denied' });
  }
  window.dispatchEvent(new Event(EVENTO_CONSENSO));
}

/** Registra un acquisto (una volta per riferimento ordine). Non fa nulla senza consenso. */
export function tracciaAcquisto({ valore, riferimento }) {
  if (leggiConsenso() !== 'si') return;
  carica();
  if (!caricato || !window.gtag) return;
  window.gtag('event', 'conversion', {
    send_to: CONVERSIONE_ACQUISTO,
    value: Number(valore) || 0,
    currency: 'EUR',
    transaction_id: riferimento || '',
  });
}

/** Pagamento con carta: prima di andare su Stripe ricordiamo importo e riferimento... */
export function ricordaAcquistoInCorso({ valore, riferimento }) {
  if (sessione()) scrivi(sessione(), CHIAVE_ACQUISTO, JSON.stringify({ valore, riferimento }));
}

/** ...e al ritorno con esito positivo registriamo la conversione. */
export function concludiAcquistoInCorso(riferimentoRitorno) {
  if (!sessione()) return;
  const grezzo = leggi(sessione(), CHIAVE_ACQUISTO);
  if (!grezzo) return;
  scrivi(sessione(), CHIAVE_ACQUISTO, null);
  try {
    const { valore, riferimento } = JSON.parse(grezzo);
    tracciaAcquisto({ valore, riferimento: riferimentoRitorno || riferimento });
  } catch (e) { /* niente */ }
}
