#!/usr/bin/env node
/**
 * seo-patcher.js — esegui UNA VOLTA con: node seo-patcher.js
 * Modifica automaticamente tutti i file del progetto per il SEO.
 * Esegui dalla cartella frontend/.
 */
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const log  = (msg) => console.log(`\x1b[32m✓\x1b[0m ${msg}`);
const warn = (msg) => console.log(`\x1b[33m⚠\x1b[0m ${msg}`);
const err  = (msg) => console.log(`\x1b[31m✗\x1b[0m ${msg}`);

// ── 1. Installa react-helmet-async ──────────────────────────────────────────
console.log('\n\x1b[1m[1/6] Installazione react-helmet-async...\x1b[0m');
try {
  execSync('npm install react-helmet-async --save --legacy-peer-deps', { cwd: ROOT, stdio: 'inherit' });
  log('react-helmet-async installato');
} catch(e) { err('Installazione fallita: ' + e.message); process.exit(1); }

// ── helper: leggi, modifica, scrivi ────────────────────────────────────────
function patch(filePath, transforms) {
  let src = fs.readFileSync(filePath, 'utf8');
  const original = src;
  for (const [desc, fn] of transforms) {
    src = fn(src);
  }
  if (src !== original) {
    fs.writeFileSync(filePath, src, 'utf8');
    log(`${path.basename(filePath)} aggiornato`);
  } else {
    warn(`${path.basename(filePath)} — nessuna modifica necessaria`);
  }
}

// ── 2. Modifica src/index.js — aggiunge HelmetProvider ─────────────────────
console.log('\n\x1b[1m[2/6] Patch src/index.js...\x1b[0m');
patch(path.join(ROOT, 'src/index.js'), [
  ['add HelmetProvider import', src => {
    if (src.includes('HelmetProvider')) return src;
    return src.replace(
      /import React/,
      "import { HelmetProvider } from 'react-helmet-async';\nimport React"
    );
  }],
  ['wrap App with HelmetProvider', src => {
    if (src.includes('HelmetProvider')) {
      // Already has import, now check if App is wrapped
      if (src.includes('<HelmetProvider>')) return src;
      return src
        .replace(/<App\s*\/>/g, '<HelmetProvider>\n      <App />\n    </HelmetProvider>')
        .replace(/<App\s*\/>/g, '<HelmetProvider>\n      <App />\n    </HelmetProvider>');
    }
    return src;
  }],
]);

// ── 3. Modifica src/index.html ───────────────────────────────────────────────
console.log('\n\x1b[1m[3/6] Patch public/index.html...\x1b[0m');
patch(path.join(ROOT, 'public/index.html'), [
  ['update title', src => src.replace(
    /<title>.*?<\/title>/s,
    '<title>Fondi Interprofessionali | Consulenza Formazione Finanziata — MB Consulting</title>'
  )],
  ['add meta description', src => {
    if (src.includes('name="description"')) {
      return src.replace(
        /<meta\s+name="description"[^>]*>/,
        '<meta name="description" content="Accedi ai fondi interprofessionali e finanzia la formazione aziendale al 100%. MB Consulting gestisce tutto: adesione, piano formativo e rendicontazione. Contattaci." />'
      );
    }
    return src.replace('</title>', '</title>\n    <meta name="description" content="Accedi ai fondi interprofessionali e finanzia la formazione aziendale al 100%. MB Consulting gestisce tutto: adesione, piano formativo e rendicontazione. Contattaci." />');
  }],
  ['add robots', src => {
    if (src.includes('name="robots"')) return src;
    return src.replace('</title>', '</title>\n    <meta name="robots" content="index, follow" />');
  }],
  ['add og:tags', src => {
    if (src.includes('og:type')) return src;
    const og = `
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="it_IT" />
    <meta property="og:site_name" content="MB Consulting" />
    <meta property="og:title" content="Fondi Interprofessionali | MB Consulting" />
    <meta property="og:description" content="Accedi ai fondi interprofessionali e finanzia la formazione aziendale al 100%." />
    <meta property="og:url" content="https://www.mariobruzzese.it/" />
    <meta property="og:image" content="https://www.mariobruzzese.it/og-image.png" />`;
    return src.replace('</head>', og + '\n  </head>');
  }],
  ['add Organization schema', src => {
    if (src.includes('application/ld+json')) return src;
    const schema = `
    <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"ProfessionalService","name":"MB Consulting — Mario Bruzzese","url":"https://www.mariobruzzese.it","logo":"https://www.mariobruzzese.it/logo.png","description":"Consulenza specializzata nell'accesso ai fondi interprofessionali per la formazione aziendale finanziata al 100%.","email":"info@mariobruzzese.it","areaServed":{"@type":"Country","name":"Italy"},"serviceType":"Consulenza Fondi Interprofessionali","knowsAbout":["Fondi Interprofessionali","Formazione Finanziata","Fondimpresa","Fondo For.Te.","Piano Formativo Aziendale","Conto Formazione","0.30% INPS"],"sameAs":["https://www.linkedin.com/in/mariobruzzese"]}
    </script>`;
    return src.replace('</head>', schema + '\n  </head>');
  }],
  ['update noscript', src => src.replace(
    /<noscript>.*?<\/noscript>/s,
    '<noscript>Per utilizzare questo sito abilita JavaScript. MB Consulting offre consulenza sui fondi interprofessionali per la formazione aziendale finanziata al 100%.</noscript>'
  )],
]);

// ── 4. Patch pagine JSX ──────────────────────────────────────────────────────
console.log('\n\x1b[1m[4/6] Patch pagine JSX...\x1b[0m');

const pages = [
  {
    file: 'src/pages/Home.jsx',
    title: 'Fondi Interprofessionali | Consulenza Formazione Finanziata',
    desc:  'Accedi ai fondi interprofessionali e finanzia la formazione aziendale al 100%. MB Consulting gestisce tutto: adesione, piano formativo e rendicontazione. Contattaci.',
    canonical: 'https://www.mariobruzzese.it/',
    schema: JSON.stringify({
      "@context":"https://schema.org","@type":"WebPage",
      "name":"Fondi Interprofessionali | MB Consulting",
      "url":"https://www.mariobruzzese.it/",
      "description":"Consulenza fondi interprofessionali per la formazione aziendale finanziata al 100%."
    }),
  },
  {
    file: 'src/pages/Services.jsx',
    title: 'Consulenza Fondi Interprofessionali per Aziende',
    desc:  'Scopri i servizi di MB Consulting per i fondi interprofessionali: scelta del fondo, progettazione del piano formativo, rendicontazione e gestione completa.',
    canonical: 'https://www.mariobruzzese.it/servizi',
  },
  {
    file: 'src/pages/HowItWorks.jsx',
    title: 'Come Funzionano i Fondi Interprofessionali',
    desc:  'Come funzionano i fondi interprofessionali? In 3 passi semplici finanzia la formazione dei dipendenti al 100%. Scopri il metodo MB Consulting.',
    canonical: 'https://www.mariobruzzese.it/come-funziona',
    schema: JSON.stringify({
      "@context":"https://schema.org","@type":"HowTo",
      "name":"Come accedere ai fondi interprofessionali",
      "description":"Guida passo-passo per accedere ai fondi interprofessionali e ottenere formazione aziendale finanziata al 100%.",
      "step":[
        {"@type":"HowToStep","position":1,"name":"Scelta del fondo","text":"Analizziamo la tua azienda e identifichiamo il fondo più adatto."},
        {"@type":"HowToStep","position":2,"name":"Piano formativo","text":"Progettiamo il piano formativo e prepariamo tutta la documentazione."},
        {"@type":"HowToStep","position":3,"name":"Formazione e rendicontazione","text":"Coordiniamo la formazione e gestiamo la rendicontazione finale."}
      ]
    }),
  },
  {
    file: 'src/pages/WhyChooseUs.jsx',
    title: 'Perché Scegliere MB Consulting per i Fondi Interprofessionali',
    desc:  'Esperienza, risultati concreti e zero burocrazia: MB Consulting accompagna le aziende nell\'accesso ai fondi interprofessionali dalla A alla Z. Scopri perché.',
    canonical: 'https://www.mariobruzzese.it/perche-noi',
  },
  {
    file: 'src/pages/CaseStudies.jsx',
    title: 'Casi Studio: Aziende che hanno Ottenuto Formazione Finanziata',
    desc:  'Leggi i casi reali di aziende che hanno ottenuto formazione finanziata grazie ai fondi interprofessionali con MB Consulting. Risultati verificabili.',
    canonical: 'https://www.mariobruzzese.it/casi-studio',
  },
  {
    file: 'src/pages/FAQ.jsx',
    title: 'Domande Frequenti sui Fondi Interprofessionali',
    desc:  'Tutte le risposte sui fondi interprofessionali: cosa sono, come funzionano, come aderire, differenza tra conto formazione e avviso. Guida completa MB Consulting.',
    canonical: 'https://www.mariobruzzese.it/faq',
    schema: JSON.stringify({
      "@context":"https://schema.org","@type":"FAQPage","mainEntity":[
        {"@type":"Question","name":"Cosa sono i fondi interprofessionali?","acceptedAnswer":{"@type":"Answer","text":"I fondi interprofessionali sono organismi paritetici che finanziano la formazione continua dei lavoratori dipendenti. Le aziende vi aderiscono volontariamente destinando lo 0,30% dei contributi INPS al fondo scelto."}},
        {"@type":"Question","name":"Come funzionano i fondi interprofessionali?","acceptedAnswer":{"@type":"Answer","text":"I fondi raccolgono lo 0,30% dei contributi INPS e li mettono a disposizione delle aziende aderenti per finanziare piani formativi tramite Conto Formazione o Avvisi pubblici."}},
        {"@type":"Question","name":"L'adesione ai fondi interprofessionali è gratuita?","acceptedAnswer":{"@type":"Answer","text":"Sì, l'adesione è completamente gratuita. Le risorse provengono dallo 0,30% già versato all'INPS: l'azienda non paga nulla in più."}},
        {"@type":"Question","name":"Qual è la differenza tra Conto Formazione e Avviso?","acceptedAnswer":{"@type":"Answer","text":"Il Conto Formazione è individuale per ogni azienda. L'Avviso è collettivo tramite bandi periodici, ideale per le PMI con quote ridotte."}},
        {"@type":"Question","name":"Quale fondo interprofessionale conviene scegliere?","acceptedAnswer":{"@type":"Answer","text":"Dipende dal settore, CCNL, dimensione aziendale e tipo di formazione. MB Consulting ti guida nella scelta del fondo più adatto."}},
        {"@type":"Question","name":"MB Consulting gestisce tutto il processo?","acceptedAnswer":{"@type":"Answer","text":"Sì. Dalla scelta del fondo alla progettazione del piano formativo fino alla rendicontazione finale: gestiamo tutto noi."}},
        {"@type":"Question","name":"In quanto tempo si ottiene la formazione finanziata?","acceptedAnswer":{"@type":"Answer","text":"In media 2-6 mesi dalla scelta del fondo all'avvio della formazione, a seconda del fondo e della modalità di accesso."}}
      ]
    }),
  },
];

for (const page of pages) {
  const filePath = path.join(ROOT, page.file);
  if (!fs.existsSync(filePath)) { warn(`${page.file} non trovato, saltato`); continue; }
  const schemaVar = page.schema
    ? `\nconst _seoSchema${path.basename(page.file, '.jsx')} = ${JSON.stringify(page.schema)};\n`
    : '';
  const seoTag = `<SEOHead
        title="${page.title}"
        description="${page.desc}"
        canonical="${page.canonical}"${page.schema ? `\n        schema={_seoSchema${path.basename(page.file, '.jsx')}}` : ''}
      />`;

  patch(filePath, [
    ['add SEOHead import', src => {
      if (src.includes('SEOHead')) return src;
      const firstImport = src.match(/^import /m);
      if (firstImport) return "import SEOHead from '../components/SEOHead';\n" + src;
      return "import SEOHead from '../components/SEOHead';\n" + src;
    }],
    ['add schema constant', src => {
      if (!page.schema) return src;
      if (src.includes(`_seoSchema${path.basename(page.file, '.jsx')}`)) return src;
      // Insert before the function/export
      return src.replace(/(export default function|const \w+ = \(\))/, schemaVar + '$1');
    }],
    ['inject SEOHead into JSX', src => {
      if (src.includes('<SEOHead')) return src;
      // Find first return ( and inject right after
      return src.replace(
        /return\s*\(\s*(<>|<div|<main|<section)/,
        `return (\n      <>\n      ${seoTag}\n      $1`
      ).replace(
        // Close the fragment if we opened one
        /return\s*\(\s*<>\s*<SEOHead[\s\S]*?\/>\s*(<div|<main|<section)/,
        (m, tag) => {
          // Already handled
          return m;
        }
      );
    }],
  ]);
}

// ── 5. package.json — aggiungi homepage e deploy script ─────────────────────
console.log('\n\x1b[1m[5/6] Patch package.json...\x1b[0m');
const pkgPath = path.join(ROOT, 'package.json');
let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
let pkgChanged = false;
if (!pkg.homepage) {
  pkg.homepage = 'https://www.mariobruzzese.it';
  pkgChanged = true;
}
if (!pkg.scripts.predeploy) {
  pkg.scripts.predeploy = 'npm run build';
  pkgChanged = true;
}
if (!pkg.scripts.deploy) {
  pkg.scripts.deploy = 'gh-pages -d build';
  pkgChanged = true;
}
if (pkgChanged) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
  log('package.json aggiornato');
} else {
  warn('package.json — nessuna modifica necessaria');
}

// ── 6. Installa gh-pages se manca ───────────────────────────────────────────
console.log('\n\x1b[1m[6/6] Verifica gh-pages...\x1b[0m');
if (!pkg.devDependencies?.['gh-pages'] && !pkg.dependencies?.['gh-pages']) {
  try {
    execSync('npm install --save-dev gh-pages --legacy-peer-deps', { cwd: ROOT, stdio: 'inherit' });
    log('gh-pages installato');
  } catch(e) { warn('gh-pages non installato: ' + e.message); }
} else {
  log('gh-pages già presente');
}

console.log('\n\x1b[1m\x1b[32m══════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m\x1b[32m  SEO PATCH COMPLETATO CON SUCCESSO! ✓\x1b[0m');
console.log('\x1b[1m\x1b[32m══════════════════════════════════════════\x1b[0m');
console.log('\nProssimi passi:');
console.log('  1. npm run build');
console.log('  2. npm run deploy');
console.log('  3. Aggiungi il sito a Google Search Console');
console.log('     https://search.google.com/search-console');
console.log('  4. Invia sitemap: sitemap.xml\n');
