#!/usr/bin/env node
/**
 * prerender.js — generato dopo `craco build`.
 *
 * Problema risolto: GitHub Pages serve solo file statici. Con una SPA, ogni URL
 * diverso da "/" restituiva HTTP 404 (il redirect in 404.html funziona solo lato
 * browser: Google e le anteprime social vedono un 404 e non indicizzano nulla).
 *
 * Questo script prende build/index.html e ne scrive una copia per ogni rotta, con
 * <title>, meta description, canonical, Open Graph, JSON-LD e contenuto <noscript>
 * specifici della pagina. Scrive sia <slug>.html sia <slug>/index.html, così
 * GitHub Pages risponde 200 sia su /servizi sia su /servizi/.
 *
 * Nessuna dipendenza esterna, nessun browser headless: non può fallire in CI.
 */
const fs = require('fs');
const path = require('path');
const { BASE, OG_IMG, pages } = require('../src/seo/pages');

const BUILD = path.join(__dirname, '..', 'build');
const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);

const shellPath = path.join(BUILD, 'index.html');
if (!fs.existsSync(shellPath)) {
  console.error('✗ build/index.html non trovato: esegui prima `yarn build`.');
  process.exit(1);
}
const shell = fs.readFileSync(shellPath, 'utf8');

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function render(page) {
  const url = page.canonical || (page.slug ? `${BASE}/${page.slug}` : `${BASE}/`);
  let html = shell;

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(page.title)}</title>`);

  // meta description
  html = html.replace(
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${esc(page.description)}"/>`
  );

  // Open Graph
  html = html
    .replace(/<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${esc(page.title)}"/>`)
    .replace(
      /<meta\s+property="og:description"[^>]*>/i,
      `<meta property="og:description" content="${esc(page.description)}"/>`
    )
    .replace(/<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${url}"/>`)
    .replace(/<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${page.image || OG_IMG}"/>`);

  // canonical + twitter card (inseriti prima di </head>)
  html = html.replace(/<link\s+rel="canonical"[^>]*>/gi, '');
  if (page.noindex) html = html.replace(/<meta\s+name="robots"[^>]*>/gi, '');
  const head = [
    `<link rel="canonical" href="${url}"/>`,
    `<meta name="twitter:card" content="summary_large_image"/>`,
    `<meta name="twitter:title" content="${esc(page.title)}"/>`,
    `<meta name="twitter:description" content="${esc(page.description)}"/>`,
    `<meta name="twitter:image" content="${page.image || OG_IMG}"/>`,
    page.noindex ? `<meta name="robots" content="noindex,follow"/>` : '',
  ].join('');
  html = html.replace(/<\/head>/i, `${head}</head>`);

  // JSON-LD: sostituisce tutti i blocchi esistenti con quelli della pagina
  html = html.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');
  const ld = (page.schema || [])
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('');
  html = html.replace(/<\/head>/i, `${ld}</head>`);

  // contenuto <noscript> specifico della pagina
  html = html.replace(
    /<noscript>[\s\S]*?<\/noscript>/i,
    `<noscript><style>.noscript-seo{font-family:sans-serif;max-width:900px;margin:0 auto;padding:2rem;color:#111}.noscript-seo h1{font-size:2rem;margin-bottom:1rem}.noscript-seo h2{font-size:1.4rem;margin-top:2rem;margin-bottom:.5rem}.noscript-seo p,.noscript-seo li{line-height:1.7}.noscript-seo ul,.noscript-seo ol{padding-left:1.5rem}</style><div class="noscript-seo">${page.noscript.trim()}</div></noscript>`
  );

  return html;
}

/**
 * Carica il catalogo corsi (moduli ES del frontend) senza bundler: incolla il
 * file dei programmi al posto dell'import e lo importa come data URL.
 */
async function caricaCorsi() {
  const dir = path.join(__dirname, '..', 'src', 'data');
  const programmi = fs
    .readFileSync(path.join(dir, 'programmiCorsi.js'), 'utf8')
    .replace('export const programmi', 'const programmi');
  const sorgente = fs
    .readFileSync(path.join(dir, 'corsiSicurezza.js'), 'utf8')
    .replace(/^import \{ programmi \} from '\.\/programmiCorsi';$/m, programmi);
  const modulo = await import('data:text/javascript;base64,' + Buffer.from(sorgente).toString('base64'));
  return modulo.corsiPubblicabili();
}

let SCADENZE = {};

async function caricaAteco() {
  const sorgente = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'rischioAteco.js'), 'utf8');
  return import('data:text/javascript;base64,' + Buffer.from(sorgente).toString('base64'));
}

async function caricaModalita() {
  const sorgente = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'modalitaErogazione.js'), 'utf8');
  return import('data:text/javascript;base64,' + Buffer.from(sorgente).toString('base64'));
}

function paginaCorso(c) {
  const url = `${BASE}/corsi-sicurezza/${c.id}`;
  const descr = c.seoDescrizione;
  // tutto il programma, non solo le righe a elenco: è il contenuto più ricco della pagina
  const programma = (c.programma || [])
    .map((r) => (r.startsWith('- ') ? `<li>${esc(r.slice(2))}</li>` : `<p>${esc(r)}</p>`))
    .join('')
    .replace(/((?:<li>.*?<\/li>)+)/g, '<ul>$1</ul>');
  const correlati = (c.correlati || [])
    .map((x) => `<li><a href="${BASE}/corsi-sicurezza/${x.id}">${esc(x.titolo)} — ${x.ore} ore, ${x.prezzo} €</a></li>`)
    .join('');
  return {
    slug: `corsi-sicurezza/${c.id}`,
    title: `${c.seoTitolo} | MB Consulting`,
    description: descr,
    image: `${BASE}${c.immagine}`,
    priority: '0.8',
    changefreq: 'monthly',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: c.titolo,
        description: descr,
        url,
        inLanguage: c.id.endsWith('-eng') ? 'en' : 'it',
        educationalCredentialAwarded: 'Attestato di frequenza con verifica finale',
        image: `${BASE}${c.immagine}`,
        provider: { '@type': 'Organization', name: 'EFEI — Organismo Paritetico Salute e Sicurezza nei Luoghi di Lavoro', sameAs: 'https://www.efeiaulamagna.it' },
        hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: `PT${c.ore}H` },
        offers: {
          '@type': 'Offer', price: c.prezzo, priceCurrency: 'EUR', availability: 'https://schema.org/InStock',
          url, category: 'Paid',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
          { '@type': 'ListItem', position: 2, name: 'Corsi sicurezza', item: `${BASE}/corsi-sicurezza` },
          { '@type': 'ListItem', position: 3, name: c.titolo, item: url },
        ],
      },
    ],
    noscript: `
      <h1>${esc(c.seoTitolo)}</h1>
      <p><strong>Durata:</strong> ${c.ore} ore in e-learning asincrono. <strong>Destinatari:</strong> ${esc(c.destinatari)}. <strong>Riferimento:</strong> ${esc(c.normativa)}.</p>
      <p><strong>Prezzo:</strong> ${c.prezzo} € a partecipante, IVA compresa.</p>
      ${SCADENZE[c.id] ? `<p><strong>Validità dell'attestato:</strong> ${esc(SCADENZE[c.id].validita)}. <a href="${BASE}/durata-scadenza-corsi-sicurezza">Durate e scadenze di tutti i corsi</a></p>` : ''}
      ${c.avviso ? `<p>${esc(c.avviso)}</p>` : ''}
      <p>Corso erogato da EFEI — Organismo Paritetico Salute e Sicurezza nei Luoghi di Lavoro tramite l'Unità Operativa 2403 e A.U.G.E. Università, promosso da MB Consulting. Superato il test finale, l'attestato si scarica dalla piattaforma.</p>
      ${programma ? `<h2>Programma del corso</h2>${programma}` : ''}
      <p><a href="${url}/iscrizione">Iscriviti al corso</a></p>
      ${correlati ? `<h2>Altri corsi della stessa area</h2><ul>${correlati}</ul>` : ''}
      <p><a href="${BASE}/corsi-sicurezza">Tutti i corsi di sicurezza sul lavoro online</a></p>
    `,
  };
}

async function main() {
const corsi = await caricaCorsi();
const { colonneModalita, righeModalita, noteModalita, scadenzeCorsi } = await caricaModalita();
SCADENZE = scadenzeCorsi;
const schede = corsi.map(paginaCorso);

// Catalogo: elenco dei corsi generato dal catalogo vero (niente prezzi scritti a mano).
// Formato "pagina riepilogo" di Google: solo posizione e indirizzo di ogni scheda.
const catalogo = pages.find((p) => p.slug === 'corsi-sicurezza');
if (catalogo) {
  catalogo.schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Corsi di sicurezza sul lavoro online',
      numberOfItems: corsi.length,
      itemListElement: corsi.map((c, i) => ({
        '@type': 'ListItem', position: i + 1, url: `${BASE}/corsi-sicurezza/${c.id}`,
      })),
    },
    ...catalogo.schema.filter((x) => x['@type'] !== 'ItemList'),
  ];
  // collegamenti a tutte le schede anche nella versione senza JavaScript
  catalogo.noscript += `<h2>Tutti i corsi</h2><ul>${corsi
    .map((c) => `<li><a href="${BASE}/corsi-sicurezza/${c.id}">${esc(c.seoTitolo)}</a> — ${c.prezzo} €</li>`)
    .join('')}</ul>`;
}
// Durate e scadenze: il prospetto va anche nell'HTML servito a Google, non solo nella pagina React
const scadenze = pages.find((p) => p.slug === 'durata-scadenza-corsi-sicurezza');
if (scadenze) {
  const intestazioni = colonneModalita.map((c) => `<th>${esc(c.testo)}</th>`).join('');
  const corpo = righeModalita
    .map((r) => `<tr>${colonneModalita.map((c) => `<td>${esc(r[c.id])}</td>`).join('')}</tr>`)
    .join('');
  scadenze.noscript += `<table border="1" cellpadding="6" cellspacing="0"><thead><tr>${intestazioni}</tr></thead><tbody>${corpo}</tbody></table>`;
  scadenze.noscript += `<ul>${noteModalita.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`;
  scadenze.noscript += `<p><a href="${BASE}/corsi-sicurezza">Vedi i corsi di sicurezza sul lavoro online</a></p>`;
}

// Codice ATECO e livello di rischio: anche qui il contenuto deve stare nell'HTML
const { divisioni, livelli, sezioni, noteAteco } = await caricaAteco();
const ateco = pages.find((p) => p.slug === 'codice-ateco-livello-di-rischio');
if (ateco) {
  for (const liv of ['basso', 'medio', 'alto']) {
    const l = livelli[liv];
    const righe = divisioni
      .filter((d) => d[3] === liv)
      .map((d) => `<tr><td>${esc(d[0])}</td><td>${esc(d[2])}</td><td>${esc(d[1])} — ${esc(sezioni[d[1]])}</td></tr>`)
      .join('');
    ateco.noscript += `<h2>${esc(l.nome)} — ${l.totale} ore di formazione (${l.generale} generale + ${l.specifica} specifica)</h2>`;
    ateco.noscript += `<table border="1" cellpadding="6" cellspacing="0"><thead><tr><th>Codice ATECO</th><th>Settore</th><th>Sezione</th></tr></thead><tbody>${righe}</tbody></table>`;
  }
  ateco.noscript += `<ul>${noteAteco.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`;
  ateco.noscript += `<p><a href="${BASE}/corsi-sicurezza">Corsi di sicurezza sul lavoro online</a> — <a href="${BASE}/durata-scadenza-corsi-sicurezza">durata e scadenza di ogni corso</a></p>`;
}

const iscrizioni = schede.map((p) => ({
  ...p, slug: `${p.slug}/iscrizione`, canonical: `${BASE}/${p.slug}`, noindex: true,
  title: `Iscrizione — ${p.title}`,
}));

console.log('\n\x1b[1mPrerender delle rotte\x1b[0m');
for (const page of [...pages, ...schede, ...iscrizioni]) {
  const html = render(page);
  if (!page.slug) {
    fs.writeFileSync(shellPath, html, 'utf8');
    ok('/ → build/index.html');
    continue;
  }
  fs.writeFileSync(path.join(BUILD, `${page.slug}.html`), html, 'utf8');
  fs.mkdirSync(path.join(BUILD, page.slug), { recursive: true });
  fs.writeFileSync(path.join(BUILD, page.slug, 'index.html'), html, 'utf8');
  ok(`/${page.slug} → build/${page.slug}.html + build/${page.slug}/index.html`);
}

// sitemap.xml sempre allineata alle rotte
const today = new Date().toISOString().slice(0, 10);
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  [...pages, ...schede]
    .map(
      (p) =>
        `  <url><loc>${p.slug ? `${BASE}/${p.slug}` : `${BASE}/`}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
    )
    .join('\n') +
  `\n</urlset>\n`;
fs.writeFileSync(path.join(BUILD, 'sitemap.xml'), sitemap, 'utf8');
ok('sitemap.xml rigenerata');

console.log(`\n\x1b[32m✓\x1b[0m Prerender completato: ${pages.length} pagine + ${schede.length} schede corso (+ ${iscrizioni.length} iscrizioni).\n`);
}

main().catch((e) => {
  console.error('✗ Prerender fallito:', e);
  process.exit(1);
});
