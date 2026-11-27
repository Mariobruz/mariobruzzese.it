import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Linkedin } from 'lucide-react';
import { linkWhatsApp } from './WhatsApp';
import { mockData } from '../mock';
import { impostaConsenso } from '../googleAds';

// Stesse voci, nello stesso ordine, del menu in alto (Header.jsx)
const NAVIGAZIONE = [
  { nome: 'Servizi', link: '/servizi' },
  { nome: 'Per le aziende', link: '/formazione-finanziata' },
  { nome: 'Per i professionisti', link: '/professionisti' },
  { nome: 'E-learning 81/08', link: '/corsi-sicurezza' },
  { nome: 'FAQ', link: '/faq' },
];

// Le sei schede della pagina Servizi
const SERVIZI = [
  'Fondi interprofessionali',
  'Analisi dei fabbisogni',
  'Progettazione del piano',
  'Organizzazione ed erogazione dei corsi',
  'Gestione amministrativa',
  'Rendicontazione',
];

const LINK = 'text-[15px] text-gray-300 hover:text-white transition-colors';

function Titolo({ children }) {
  return (
    <>
      <h3 className="text-xl font-bold text-white">{children}</h3>
      <div className="mt-2 mb-5 h-0.5 w-10 rounded bg-[#86efb4]" />
    </>
  );
}

const Footer = () => {
  return (
    <footer id="contatti" className="bg-[#0b1d33] text-white">
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.1fr_1.2fr] gap-10 lg:gap-12">
          <div>
            <Link to="/" aria-label="MB Consulting, torna alla home" className="inline-block rounded-xl bg-white p-2.5">
              <img src={process.env.PUBLIC_URL + '/logo.png'} alt="MB Consulting" className="h-24 w-auto" />
            </Link>
            <p className="mt-5 text-[15px] text-gray-300 leading-relaxed max-w-xs">
              Gestiamo completamente il processo di formazione finanziata tramite fondi interprofessionali.
            </p>
          </div>

          <nav aria-label="Navigazione nel footer">
            <Titolo>Navigazione</Titolo>
            <ul className="space-y-3">
              {NAVIGAZIONE.map((v) => (
                <li key={v.link}><Link to={v.link} className={LINK}>{v.nome}</Link></li>
              ))}
            </ul>
          </nav>

          <div>
            <Titolo>Servizi</Titolo>
            <ul className="space-y-3">
              {SERVIZI.map((s) => (
                <li key={s}><Link to="/servizi" className={LINK}>{s}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <Titolo>Contatti</Titolo>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#86efb4] flex-shrink-0 mt-0.5" />
                <a href={`mailto:${mockData.contact.email}`} className={`${LINK} break-all`}>{mockData.contact.email}</a>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-[#86efb4] flex-shrink-0 mt-0.5" />
                <a href={linkWhatsApp('Ciao, vorrei informazioni su MB Consulting.')} target="_blank" rel="noopener noreferrer" className={LINK}>Scrivici su WhatsApp</a>
              </li>
              <li className="flex items-start gap-3">
                <Linkedin className="w-5 h-5 text-[#86efb4] flex-shrink-0 mt-0.5" />
                <a href="https://www.linkedin.com/in/mario-bruzzese-301360181/" target="_blank" rel="noopener noreferrer" className={LINK}>
                  Mario Bruzzese
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-[15px] text-gray-300 text-center md:text-left">
            © {new Date().getFullYear()} MB Consulting di Mario Bruzzese — P. IVA 03504290796
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link to="/privacy" className={LINK}>Informativa privacy</Link>
            <Link to="/condizioni-vendita" className={LINK}>Condizioni di vendita</Link>
            <button type="button" onClick={() => impostaConsenso(null)} className={LINK}>Preferenze cookie</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
