import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { mockData } from '../mock';
import { Button } from '../components/ui/button';
import ContactModal from '../components/ContactModal';

const HowItWorks = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const scrollToContact = () => {
    const footer = document.getElementById('contatti');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen pt-36 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Come Funziona
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Un processo semplice e trasparente in 6 step. Ci occupiamo di tutto noi, tu ti concentri sul tuo business.
          </p>
        </motion.div>

        <div className="relative">
          {/* Animated Timeline Line */}
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-black via-gray-400 to-black"
          />

          <div className="space-y-16">
            {mockData.howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ x: index % 2 === 0 ? -100 : 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="flex-1"
                >
                  <Card
                    className={`p-8 border-2 hover:border-black transition-all duration-300 hover:shadow-2xl card-modern relative overflow-hidden group ${
                      index % 2 === 0 ? 'md:text-right' : ''
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div
                      className={`inline-block px-4 py-2 bg-black text-white rounded-lg text-sm font-bold mb-4 relative z-10`}
                    >
                      Step {step.step}
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 relative z-10">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed relative z-10">{step.description}</p>
                  </Card>
                </motion.div>

                {/* Animated Center Circle */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  className="hidden md:flex w-16 h-16 bg-black rounded-full items-center justify-center flex-shrink-0 shadow-2xl z-10 cursor-pointer"
                >
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </motion.div>

                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 text-center bg-gradient-to-br from-gray-50 to-white rounded-2xl p-12 border-2 border-gray-100 shadow-xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Inizia Oggi il Tuo Percorso di Formazione Finanziata
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Contattaci per una consulenza gratuita e scopri come possiamo aiutarti
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setIsContactModalOpen(true)}
              size="lg"
              className="bg-black text-white hover:bg-gray-800 text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transition-all duration-300 btn-modern"
            >
              Richiedi Consulenza Gratuita
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        source="come_funziona"
      />
    </div>
  );
};

export default HowItWorks;