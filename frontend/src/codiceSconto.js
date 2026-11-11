/**
 * codiceSconto.js — codice sconto arrivato dal link di un consulente.
 *
 * Il link (…/corsi-sicurezza?codice=ROSSI-7K3) compila da solo il campo
 * "Codice sconto" del modulo. Il codice resta solo in memoria finché la pagina
 * è aperta: niente cookie, niente localStorage. All'arrivo si avvisa il server,
 * che conta il click per codice e giorno, senza dati personali.
 */
const ENDPOINT = process.env.REACT_APP_ISCRIZIONI_URL;
let codiceDaLink = '';

export const normalizza = (v) => {
  const c = String(v || '').trim().toUpperCase();
  return /^[A-Z0-9][A-Z0-9-]{2,29}$/.test(c) ? c : '';
};

/** Da chiamare all'avvio dell'app. */
export function registraCodiceDaLink() {
  if (typeof window === 'undefined') return;
  const codice = normalizza(new URLSearchParams(window.location.search).get('codice'));
  if (!codice) return;
  codiceDaLink = codice;
  if (ENDPOINT) {
    fetch(`${ENDPOINT}/codici/${encodeURIComponent(codice)}/click`, { method: 'POST' }).catch(() => {});
  }
}

export const codiceIniziale = () => codiceDaLink;

/** { valido, codice, scontoPct } — il prezzo vero lo ricalcola comunque il server. */
export async function verificaCodice(valore) {
  const codice = normalizza(valore);
  if (!codice || !ENDPOINT) return { valido: false };
  const r = await fetch(`${ENDPOINT}/codici/${encodeURIComponent(codice)}`);
  if (r.status === 429) return { valido: false, troppi: true };
  if (!r.ok) return { valido: false };
  return r.json();
}

/** Stesso calcolo del server: prezzo scontato arrotondato al centesimo. */
export const applicaSconto = (prezzo, pct) => Math.round(Number(prezzo) * (1 - Number(pct || 0) / 100) * 100) / 100;

/** 79 → "79", 79.2 → "79,20" */
export const prezzoTesto = (n) => (Number.isInteger(Number(n))
  ? String(n)
  : Number(n).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
