/**
 * indexnow.js — dopo il deploy avvisa Bing (e gli altri motori IndexNow) delle
 * pagine del sito, così ChatGPT/Copilot, che usano l'indice di Bing, le trovano prima.
 * Legge gli indirizzi da build/sitemap.xml. Se qualcosa va storto non blocca il deploy.
 */
const fs = require('fs');
const path = require('path');

const HOST = 'www.mariobruzzese.it';
const KEY = '57d4edbfc3d6ebf008bed1b1f505c18e';

async function main() {
  const file = path.join(__dirname, '..', 'build', 'sitemap.xml');
  const xml = fs.readFileSync(file, 'utf8');
  const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (!urlList.length) { console.log('IndexNow: nessun URL nella sitemap'); return; }
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
  });
  console.log(`IndexNow: inviati ${urlList.length} URL, risposta ${r.status}`);
}

main().catch((e) => console.log('IndexNow non riuscito:', e.message));
