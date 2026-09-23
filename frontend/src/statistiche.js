/**
 * statistiche.js — avvia Cloudflare Web Analytics (anonimo, senza cookie).
 *
 * Le visite di chi lavora al sito non vanno contate: aprendo una pagina con
 * ?nostat=1 il browser memorizza l'esclusione e il beacon non parte più.
 * Con ?nostat=0 si torna a essere contati.
 */
const TOKEN = '911a27f795e5464cb3c0b3640d94bc52';
const CHIAVE = 'mb-niente-statistiche';

const leggi = (k) => { try { return window.localStorage.getItem(k); } catch (e) { return null; } };
const scrivi = (k, v) => { try { v === null ? window.localStorage.removeItem(k) : window.localStorage.setItem(k, v); } catch (e) { /* niente */ } };

export function avviaStatistiche() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const scelta = new URLSearchParams(window.location.search).get('nostat');
  if (scelta === '1') scrivi(CHIAVE, '1');
  if (scelta === '0') scrivi(CHIAVE, null);

  if (leggi(CHIAVE) === '1') {
    console.info('Statistiche disattivate su questo browser (?nostat=0 per riattivarle).');
    return;
  }

  const s = document.createElement('script');
  s.defer = true;
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', JSON.stringify({ token: TOKEN }));
  document.body.appendChild(s);
}
