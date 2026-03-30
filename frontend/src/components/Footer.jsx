import React from 'react';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';
import { mockData } from '../mock';

const Footer = () => {
  return (
    <footer id="contatti" className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <img
              src="/logo.png"
              alt="MB Consulting"
              className="h-20 w-auto"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              Gestiamo completamente il processo di formazione finanziata tramite fondi interprofessionali.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Navigazione</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="/come-funziona" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Come Funziona
                </a>
              </li>
              <li>
                <a href="/servizi" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Servizi
                </a>
              </li>
              <li>
                <a href="/casi-studio" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Casi Studio
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Servizi</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Consulenza Fondi Interprofessionali</li>
              <li>Analisi Fabbisogni Formativi</li>
              <li>Progettazione Piani Formativi</li>
              <li>Gestione Completa del Processo</li>
              <li>Supporto Amministrativo</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contatti</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <a
                  href={`mailto:${mockData.contact.email}`}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {mockData.contact.email}
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <a
                  href={`tel:${mockData.contact.phone}`}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {mockData.contact.phone}
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">{mockData.contact.address}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Linkedin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <a
                  href="https://www.linkedin.com/in/mario-bruzzese-301360181/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Mario Bruzzese
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} MB Consulting di Mario Bruzzese. Tutti i diritti riservati.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;