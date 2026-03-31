import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Target, TrendingUp, Users, Shield, Lightbulb } from 'lucide-react';
import { Card } from '../components/ui/card';
import { mockData } from '../mock';
import { Button } from '../components/ui/button';
import ContactModal from '../components/ContactModal';

const WhyChooseUs = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const icons = [Award, Target, TrendingUp, Users, Shield, Lightbulb];

  return (
    <div className="min-h-screen pt-36 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-40" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Perché Scegliere MB Consulting
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Esperienza, competenza e risultati concreti al servizio della tua azienda
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {mockData.whyChooseUs.map((reason, index) => {
            const IconComponent = icons[index];
            return (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                whileInView={{ y: 0, opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 100,
                  delay: index * 0.1
                }}
                whileHover={{ y: -10, scale: 1.03 }}
              >
                <Card className="p-8 border-2 hover:border-black transition-all duration-300 hover:shadow-2xl group h-full card-modern relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />

                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 bg-gray-100 group-hover:bg-black rounded-xl flex items-center justify-center mb-6 transition-all duration-300 relative z-10"
                  >
                    <IconComponent className="w-8 h-8 text-black group-hover:text-white transition-colors duration-300" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 relative z-10">{reason.title}</h3>
                  <p className="text-gray-600 leading-relaxed relative z-10">{reason.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Animated Stats Section */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white rounded-2xl p-12 mb-20 shadow-2xl relative overflow-hidden"
        >
          <motion.div
            animate={{
              x: [-100, 100],
              y: [-100, 100],
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center relative z-10">
            Numeri che Parlano Chiaro
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            {mockData.stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 100,
                  delay: index * 0.1
                }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="text-center cursor-pointer"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center bg-gradient-to-br from-gray-50 to-white rounded-2xl p-12 border-2 border-gray-100 shadow-xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            La Tua Azienda Merita il Meglio
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Unisciti alle centinaia di aziende che hanno scelto MB Consulting per la loro formazione finanziata
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
        source="perche_noi"
      />
    </div>
  );
};

export default WhyChooseUs;