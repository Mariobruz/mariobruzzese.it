/**
 * visite.js — statistiche di visita del sito per il pannello.
 *
 * Legge i dati di Cloudflare Web Analytics (anonimi, senza cookie) dalla API
 * GraphQL di Cloudflare e li affianca agli ordini del database, così per ogni
 * corso si vede: visite alla scheda → aperture del modulo → ordini → pagati.
 *
 * Serve un token API di Cloudflare con il solo permesso
 * "Account Analytics: Read", salvato come segreto CF_API_TOKEN.
 */
import { catalogo } from './catalogo';

const API = 'https://api.cloudflare.com/client/v4';
const HOST = ['www.mariobruzzese.it', 'mariobruzzese.it'];
const PERIODI = { 1: 1, 7: 7, 30: 30 };
const PAGATI = ['pagato', 'caricato', 'completato'];

let cache = {}; // { giorni: { scade, dati } }
let accountMemorizzato = '';

async function chiamaCloudflare(env, percorso, corpo) {
  const r = await fetch(API + percorso, {
    method: corpo ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${env.CF_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const dati = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (dati.errors && dati.errors[0] && dati.errors[0].message) || `HTTP ${r.status}`;
    throw new Error(msg);
  }
  return dati;
}

async function idAccount(env) {
  if (env.CF_ACCOUNT_ID) return env.CF_ACCOUNT_ID;
  if (accountMemorizzato) return accountMemorizzato;
  const dati = await chiamaCloudflare(env, '/accounts?per_page=5');
  const primo = dati.result && dati.result[0];
  if (!primo) throw new Error('Il token non vede nessun account Cloudflare');
  accountMemorizzato = primo.id;
  return primo.id;
}

const QUERY = `query Visite($account: String!, $filtro: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject!, $filtroCorsi: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject!) {
  viewer { accounts(filter: { accountTag: $account }) {
    totale: rumPageloadEventsAdaptiveGroups(filter: $filtro, limit: 1) { count sum { visits } }
    giorni: rumPageloadEventsAdaptiveGroups(filter: $filtro, limit: 100, orderBy: [date_ASC]) { count sum { visits } dimensions { date } }
    pagine: rumPageloadEventsAdaptiveGroups(filter: $filtro, limit: 15, orderBy: [count_DESC]) { count sum { visits } dimensions { requestPath } }
    provenienze: rumPageloadEventsAdaptiveGroups(filter: $filtro, limit: 10, orderBy: [sum_visits_DESC]) { sum { visits } dimensions { refererHost } }
    dispositivi: rumPageloadEventsAdaptiveGroups(filter: $filtro, limit: 5, orderBy: [sum_visits_DESC]) { sum { visits } dimensions { deviceType } }
    corsi: rumPageloadEventsAdaptiveGroups(filter: $filtroCorsi, limit: 500, orderBy: [count_DESC]) { count sum { visits } dimensions { requestPath } }
  } }
}`;

// "/corsi-sicurezza/x/", "/corsi-sicurezza/x.html" → "/corsi-sicurezza/x"
const normalizza = (p) => (String(p || '/').replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/+$/, '') || '/');

const NOMI_PROVENIENZA = [
  [/(^|\.)google\./, 'Google'], [/(^|\.)bing\.com$/, 'Bing'], [/facebook\.com$|^l\.facebook|^lm\.facebook|^m\.facebook/, 'Facebook'],
  [/instagram\.com$/, 'Instagram'], [/whatsapp/, 'WhatsApp'], [/linkedin\.com$|lnkd\.in$/, 'LinkedIn'],
  [/mariobruzzese\.it$/, 'Dal sito stesso'], [/yahoo\./, 'Yahoo'], [/duckduckgo/, 'DuckDuckGo'], [/chatgpt|openai/, 'ChatGPT'],
];
function nomeProvenienza(host) {
  if (!host) return 'Diretto / app / non indicato';
  const h = host.toLowerCase();
  const trovato = NOMI_PROVENIENZA.find(([re]) => re.test(h));
  return trovato ? trovato[1] : h;
}

async function ordiniDelPeriodo(env, da) {
  const { results = [] } = await env.DB.prepare(
    'SELECT corso_id, stato, totale FROM ordini WHERE creato_il >= ?'
  ).bind(da).all();
  return results;
}

export async function statisticheVisite(env, giorniRichiesti) {
  const giorni = PERIODI[giorniRichiesti] || 7;
  if (!env.CF_API_TOKEN) return { configurato: false, giorni };
  const adesso = Date.now();
  if (cache[giorni] && cache[giorni].scade > adesso) return cache[giorni].dati;

  const a = new Date(adesso);
  const da = new Date(adesso - giorni * 24 * 60 * 60 * 1000);
  const base = [
    { datetime_geq: da.toISOString(), datetime_leq: a.toISOString() },
    { requestHost_in: HOST },
  ];
  const account = await idAccount(env);
  const risposta = await chiamaCloudflare(env, '/graphql', {
    query: QUERY,
    variables: {
      account,
      filtro: { AND: base },
      filtroCorsi: { AND: [...base, { requestPath_like: '/corsi-sicurezza/%' }] },
    },
  });
  if (risposta.errors && risposta.errors.length) throw new Error(risposta.errors[0].message);
  const acc = risposta.data && risposta.data.viewer && risposta.data.viewer.accounts && risposta.data.viewer.accounts[0];
  if (!acc) throw new Error('Nessun dato di Web Analytics per questo account');

  const visite = (r) => (r.sum && r.sum.visits) || 0;
  const tot = acc.totale[0] || { count: 0, sum: { visits: 0 } };

  // pagine: unisco le varianti dello stesso indirizzo
  const unisci = (righe) => {
    const m = new Map();
    for (const r of righe) {
      const p = normalizza(r.dimensions.requestPath);
      const x = m.get(p) || { percorso: p, visualizzazioni: 0, visite: 0 };
      x.visualizzazioni += r.count; x.visite += visite(r);
      m.set(p, x);
    }
    return m;
  };
  const pagine = [...unisci(acc.pagine).values()].sort((x, y) => y.visualizzazioni - x.visualizzazioni).slice(0, 12);

  const provenienze = new Map();
  for (const r of acc.provenienze) {
    const nome = nomeProvenienza(r.dimensions.refererHost);
    provenienze.set(nome, (provenienze.get(nome) || 0) + visite(r));
  }

  // imbuto per corso: scheda → modulo di iscrizione → ordini → pagati
  const perCorso = unisci(acc.corsi);
  const ordini = await ordiniDelPeriodo(env, da.toISOString());
  const corsi = catalogo.map((c) => {
    const scheda = perCorso.get('/corsi-sicurezza/' + c.id) || { visualizzazioni: 0, visite: 0 };
    const modulo = perCorso.get('/corsi-sicurezza/' + c.id + '/iscrizione') || { visualizzazioni: 0, visite: 0 };
    const suoi = ordini.filter((o) => o.corso_id === c.id);
    const pagati = suoi.filter((o) => PAGATI.includes(o.stato));
    return {
      id: c.id, titolo: c.titolo, ore: c.ore,
      scheda: scheda.visite, modulo: modulo.visite, ordini: suoi.length, pagati: pagati.length,
      incassato: pagati.reduce((s, o) => s + (Number(o.totale) || 0), 0),
    };
  }).filter((c) => c.scheda || c.modulo || c.ordini)
    .sort((x, y) => y.pagati - x.pagati || y.ordini - x.ordini || y.scheda - x.scheda);

  const pagatiTot = ordini.filter((o) => PAGATI.includes(o.stato));
  const dati = {
    configurato: true,
    giorni,
    da: da.toISOString(),
    a: a.toISOString(),
    aggiornato: a.toISOString(),
    totale: { visite: visite(tot), visualizzazioni: tot.count || 0 },
    moduloAperto: corsi.reduce((s, c) => s + c.modulo, 0),
    ordini: ordini.length,
    pagati: pagatiTot.length,
    incassato: pagatiTot.reduce((s, o) => s + (Number(o.totale) || 0), 0),
    perGiorno: acc.giorni.map((r) => ({ data: r.dimensions.date, visite: visite(r), visualizzazioni: r.count })),
    pagine,
    provenienze: [...provenienze.entries()].map(([nome, v]) => ({ nome, visite: v })).sort((x, y) => y.visite - x.visite),
    dispositivi: acc.dispositivi.map((r) => ({ tipo: r.dimensions.deviceType || 'altro', visite: visite(r) })),
    corsi,
  };
  cache[giorni] = { scade: adesso + 5 * 60 * 1000, dati };
  return dati;
}

export const _test = { normalizza, nomeProvenienza, azzera: () => { cache = {}; accountMemorizzato = ''; } };
