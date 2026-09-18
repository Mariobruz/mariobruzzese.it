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
  const url = page.slug ? `${BASE}/${page.slug}` : `${BASE}/`;
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
    .replace(/<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${OG_IMG}"/>`);

  // canonical + twitter card (inseriti prima di </head>)
  html = html.replace(/<link\s+rel="canonical"[^>]*>/gi, '');
  const head = [
    `<link rel="canonical" href="${url}"/>`,
    `<meta name="twitter:card" content="summary_large_image"/>`,
    `<meta name="twitter:title" content="${esc(page.title)}"/>`,
    `<meta name="twitter:description" content="${esc(page.description)}"/>`,
    `<meta name="twitter:image" content="${OG_IMG}"/>`,
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

console.log('\n\x1b[1mPrerender delle rotte\x1b[0m');
for (const page of pages) {
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
  pages
    .map(
      (p) =>
        `  <url><loc>${p.slug ? `${BASE}/${p.slug}` : `${BASE}/`}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
    )
    .join('\n') +
  `\n</urlset>\n`;
fs.writeFileSync(path.join(BUILD, 'sitemap.xml'), sitemap, 'utf8');
ok('sitemap.xml rigenerata');

console.log(`\n\x1b[32m✓\x1b[0m Prerender completato: ${pages.length} rotte.\n`);
