/**
 * sicurezza.js — registro degli eventi sospetti e blocco temporaneo degli IP.
 *
 * Ogni evento (anti-bot fallito, troppe richieste, dati manomessi, firma Stripe
 * non valida, percorsi inesistenti...) finisce in Workers Analytics Engine,
 * dataset "eventi_sicurezza": non consuma letture del database e Cloudflare lo
 * conserva da solo per circa 3 mesi. Il pannello lo legge con l'API SQL.
 *
 * Chi accumula troppi eventi in poco tempo viene bloccato per 24 ore
 * (tabella ip_bloccati del database: una lettura per richiesta, per chiave).
 *
 * Base giuridica: legittimo interesse alla sicurezza del servizio (art. 6.1.f
 * GDPR); conservazione massima 90 giorni. Vedi informativa privacy.
 */

export const DATASET = 'eventi_sicurezza';
const ORE_BLOCCO = 24;

const taglia = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').slice(0, n);

/** Dati di provenienza della richiesta, come li fornisce Cloudflare. */
export function provenienza(richiesta) {
  const cf = richiesta.cf || {};
  return {
    ip: richiesta.headers.get('CF-Connecting-IP') || '',
    paese: cf.country || '',
    citta: cf.city || '',
    asn: cf.asn ? `AS${cf.asn}` : '',
    rete: cf.asOrganization || '',
    ua: richiesta.headers.get('User-Agent') || '',
    origine: richiesta.headers.get('Origin') || richiesta.headers.get('Referer') || '',
  };
}

/**
 * Registra un evento. Non lancia mai eccezioni: la sicurezza non deve
 * rompere il servizio. Restituisce true se l'IP va bloccato.
 */
export async function registraEvento(env, richiesta, tipo, dettaglio = '') {
  const p = provenienza(richiesta);
  const url = new URL(richiesta.url);
  try {
    if (env.EVENTI_SICUREZZA) {
      env.EVENTI_SICUREZZA.writeDataPoint({
        indexes: [taglia(p.ip, 64)],
        blobs: [
          taglia(tipo, 40),                      // blob1 tipo
          taglia(p.ip, 64),                      // blob2 ip
          taglia(p.paese, 4),                    // blob3 paese
          taglia(p.citta, 60),                   // blob4 città
          taglia(p.asn, 16),                     // blob5 ASN
          taglia(p.rete, 100),                   // blob6 rete / provider
          taglia(p.ua, 300),                     // blob7 user agent
          taglia(`${richiesta.method} ${url.pathname}`, 200), // blob8 richiesta
          taglia(p.origine, 200),                // blob9 origine / referer
          taglia(dettaglio, 300),                // blob10 dettaglio
          taglia(url.hostname, 80),              // blob11 servizio
        ],
        doubles: [1],
      });
    }
  } catch (e) {
    console.error('registro sicurezza', e.message);
  }
  console.warn('evento sicurezza', tipo, p.ip, p.paese, dettaglio);

  // troppi eventi dallo stesso IP in un minuto → blocco di 24 ore
  if (!env.LIMITE_SOSPETTI || !p.ip || !env.DB) return false;
  try {
    const { success } = await env.LIMITE_SOSPETTI.limit({ key: p.ip });
    if (success) return false;
    const fino = new Date(Date.now() + ORE_BLOCCO * 3600 * 1000).toISOString();
    await env.DB.prepare(
      `INSERT INTO ip_bloccati (ip, fino_a, motivo, creato_il) VALUES (?, ?, ?, ?)
       ON CONFLICT(ip) DO UPDATE SET fino_a = excluded.fino_a, motivo = excluded.motivo`
    ).bind(p.ip, fino, taglia(tipo, 40), new Date().toISOString()).run();
    if (env.EVENTI_SICUREZZA) {
      env.EVENTI_SICUREZZA.writeDataPoint({
        indexes: [taglia(p.ip, 64)],
        blobs: ['ip_bloccato', taglia(p.ip, 64), taglia(p.paese, 4), taglia(p.citta, 60), taglia(p.asn, 16),
          taglia(p.rete, 100), taglia(p.ua, 300), '', '', `bloccato per ${ORE_BLOCCO} ore dopo: ${tipo}`, taglia(url.hostname, 80)],
        doubles: [1],
      });
    }
    return true;
  } catch (e) {
    // tabella non ancora creata o database non raggiungibile: si registra soltanto
    console.error('blocco IP', e.message);
    return false;
  }
}

/** true se l'IP della richiesta è bloccato in questo momento. */
export async function ipBloccato(env, richiesta) {
  const ip = richiesta.headers.get('CF-Connecting-IP') || '';
  if (!ip || !env.DB) return false;
  try {
    const r = await env.DB.prepare('SELECT fino_a FROM ip_bloccati WHERE ip = ?').bind(ip).first();
    return Boolean(r && r.fino_a > new Date().toISOString());
  } catch (e) {
    return false;
  }
}

// ------------------------------------------------------------ lettura (pannello)

const COLONNE = ['quando', 'tipo', 'ip', 'paese', 'citta', 'asn', 'rete', 'userAgent', 'richiesta', 'origine', 'dettaglio', 'servizio'];

async function sql(env, query) {
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/analytics_engine/sql`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CF_API_TOKEN}` },
    body: query,
  });
  const testo = await r.text();
  if (!r.ok) throw new Error(`Analytics Engine ${r.status}: ${testo.slice(0, 200)}`);
  return JSON.parse(testo);
}

/** Ultimi eventi (massimo 90 giorni). */
export async function elencoEventi(env, giorni = 30, limite = 1000) {
  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) return { configurato: false, eventi: [] };
  const g = Math.min(90, Math.max(1, Number(giorni) || 30));
  const n = Math.min(5000, Math.max(1, Number(limite) || 1000));
  const dati = await sql(env, `SELECT timestamp AS quando, blob1 AS tipo, blob2 AS ip, blob3 AS paese, blob4 AS citta,
    blob5 AS asn, blob6 AS rete, blob7 AS userAgent, blob8 AS richiesta, blob9 AS origine, blob10 AS dettaglio,
    blob11 AS servizio
    FROM ${DATASET} WHERE timestamp > NOW() - INTERVAL '${g}' DAY ORDER BY timestamp DESC LIMIT ${n}`);
  return { configurato: true, giorni: g, eventi: dati.data || [] };
}

export async function elencoBloccati(env) {
  try {
    const { results = [] } = await env.DB.prepare(
      'SELECT ip, fino_a AS finoA, motivo, creato_il AS creatoIl FROM ip_bloccati WHERE fino_a > ? ORDER BY fino_a DESC LIMIT 200'
    ).bind(new Date().toISOString()).all();
    return results;
  } catch (e) {
    return [];
  }
}

export async function sbloccaIp(env, ip) {
  const r = await env.DB.prepare('DELETE FROM ip_bloccati WHERE ip = ?').bind(String(ip || '')).run();
  return Boolean(r.meta && r.meta.changes);
}

/** CSV degli eventi, da allegare a una segnalazione. Orari in UTC. */
export function csvEventi(eventi) {
  const cella = (v) => {
    let s = v == null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const righe = eventi.map((e) => COLONNE.map((c) => cella(e[c])).join(','));
  return '﻿' + [COLONNE.map((c) => (c === 'quando' ? 'quando_utc' : c)).join(','), ...righe].join('\r\n') + '\r\n';
}
