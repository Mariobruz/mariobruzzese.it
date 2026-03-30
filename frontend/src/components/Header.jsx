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
    { name: 'Home', path: '/' },
    { name: 'Come Funziona', path: '/come-funziona' },
    { name: 'Servizi', path: '/servizi' },
    { name: 'Perché Noi', path: '/perche-noi' },
    { name: 'Casi Studio', path: '/casi-studio' },
    { name: 'FAQ', path: '/faq' }
  ];

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
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-2xl' : 'bg-white shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.img
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.3 }}
              src="/logo.png"
              alt="MB Consulting"
              className="h-20 w-auto"
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
                  className={`text-sm font-medium transition-colors duration-200 relative group ${
                    location.pathname === link.path
                      ? 'text-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {link.name}
                  <motion.span
                    className="absolute -bottom-1 left-0 h-0.5 bg-black"
                    initial={{ width: 0 }}
                    animate={{ width: location.pathname === link.path ? '100%' : 0 }}
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
                className="bg-black text-white hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-2xl btn-modern"
              >
                Contattaci
              </Button>
            </motion.div>
          </motion.div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-black transition-colors"
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
              <div className="mt-4 pb-4 border-t border-gray-200 pt-4">
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
                        className={`text-sm font-medium transition-colors block ${
                          location.pathname === link.path
                            ? 'text-black'
                            : 'text-gray-600'
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                  <Button
                    onClick={scrollToContact}
                    className="bg-black text-white hover:bg-gray-800 w-full"
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
