import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Servizi', path: '/servizi' },
    { name: 'Per le aziende', path: '/formazione-finanziata' },
    { name: 'Per i professionisti', path: '/professionisti' },
    { name: 'E-learning 81/08', path: '/corsi-sicurezza' },
    { name: 'FAQ', path: '/faq' }
  ];

  // Voce attiva anche nelle sottopagine (es. le schede dei corsi sotto /corsi-sicurezza/...)
  const attiva = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const scrollToContact = () => {
    const footer = document.getElementById('contatti');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, type: 'spring', damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-[88px] items-center justify-between">
          <Link to="/" aria-label="MB Consulting, vai alla home" className="flex items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f8a6a]">
            <motion.img
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.3 }}
              src={process.env.PUBLIC_URL + "/logo.png"}
              alt="MB Consulting"
              className="h-[72px] w-auto"
            />
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={link.path}
                  aria-current={attiva(link.path) ? 'page' : undefined}
                  className={`relative inline-block py-1 text-[15px] transition-colors duration-200 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f8a6a] focus-visible:ring-offset-4 ${
                    attiva(link.path)
                      ? 'font-bold text-[#0f2742]'
                      : 'font-medium text-[#0f2742]/80 hover:text-[#0f2742]'
                  }`}
                >
                  {link.name}
                  <motion.span
                    className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-[#0f8a6a]"
                    initial={{ width: 0 }}
                    animate={{ width: attiva(link.path) ? '100%' : 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="hidden lg:block"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={scrollToContact}
                className="h-11 rounded-lg bg-[#0f8a6a] px-6 text-[15px] font-bold text-white shadow-md shadow-[#0f8a6a]/25 hover:bg-[#0c7458] hover:shadow-lg transition-all duration-300"
              >
                Contattaci
              </Button>
            </motion.div>
          </motion.div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Chiudi il menu' : 'Apri il menu'}
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden -mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-[#0f2742] hover:bg-[#eef8f2] transition-colors"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="pb-4 border-t border-gray-200 pt-4">
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-current={attiva(link.path) ? 'page' : undefined}
                        className={`block border-l-[3px] py-1 pl-3 text-base transition-colors ${
                          attiva(link.path)
                            ? 'border-[#0f8a6a] font-bold text-[#0f2742]'
                            : 'border-transparent font-medium text-[#0f2742]/80'
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                  <Button
                    onClick={scrollToContact}
                    className="h-11 w-full rounded-lg bg-[#0f8a6a] text-base font-bold text-white shadow-md shadow-[#0f8a6a]/25 hover:bg-[#0c7458]"
                  >
                    Contattaci
                  </Button>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
