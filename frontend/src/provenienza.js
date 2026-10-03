/**
 * provenienza.js — ricorda da dove è arrivata la visita, per indicarlo nell'ordine.
 *
 * Si salva solo un'etichetta generica ("google_ads", oppure il valore di utm_source),
 * mai l'identificativo del clic (gclid): serve a contare quanti ordini porta la
 * campagna, non a riconoscere la persona. Resta nella scheda del browser
 * (sessionStorage) e sparisce quando la si chiude.
 */
const CHIAVE = 'mb-provenienza';

const sessione = () => {
  try { return typeof window === 'undefined' ? null : window.sessionStorage; } catch (e) { return null; }
};

const pulisci = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 40);

/** Da chiamare all'avvio: legge i parametri dell'indirizzo con cui si è arrivati. */
export function registraProvenienza() {
  if (typeof window === 'undefined') return;
  const p = new URLSearchParams(window.location.search);
  let etichetta = '';
  if (p.get('gclid') || p.get('gbraid') || p.get('wbraid')) {
    etichetta = 'google_ads';
  } else if (p.get('utm_source')) {
    const fonte = pulisci(p.get('utm_source'));
    const mezzo = pulisci(p.get('utm_medium'));
    etichetta = fonte.includes('google') && /cpc|ppc|paid/.test(mezzo) ? 'google_ads' : fonte;
  }
  const s = sessione();
  if (etichetta && s) {
    try { s.setItem(CHIAVE, etichetta); } catch (e) { /* niente */ }
  }
}

/** Etichetta della visita in corso, oppure null. */
export function leggiProvenienza() {
  const s = sessione();
  if (!s) return null;
  try { return s.getItem(CHIAVE) || null; } catch (e) { return null; }
}
