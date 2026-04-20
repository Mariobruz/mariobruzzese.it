/**
 * SEOHead.jsx — componente riutilizzabile per SEO per-pagina
 * Richiede: npm install react-helmet-async
 */
import { Helmet } from 'react-helmet-async';

const SITE   = 'MB Consulting';
const BASE   = 'https://www.mariobruzzese.it';
const OG_IMG = `${BASE}/og-image.png`;

export default function SEOHead({ title, description, canonical, schema = null, noIndex = false }) {
  const full = title ? `${title} | ${SITE}` : `Fondi Interprofessionali | Consulenza Formazione Finanziata — ${SITE}`;
  return (
    <Helmet>
      <html lang="it" />
      <title>{full}</title>
      <meta name="description"      content={description} />
      <meta name="robots"           content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta property="og:type"        content="website" />
      <meta property="og:locale"      content="it_IT" />
      <meta property="og:site_name"   content={SITE} />
      <meta property="og:title"       content={full} />
      <meta property="og:description" content={description} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image"       content={OG_IMG} />
      {schema && <script type="application/ld+json">{schema}</script>}
    </Helmet>
  );
}
