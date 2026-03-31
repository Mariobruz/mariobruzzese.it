import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { mockData } from '../mock';
import { Button } from '../components/ui/button';
import ContactModal from '../components/ContactModal';
import useSEO from '../hooks/useSEO';

const CaseStudies = () => {
  useSEO({
    title: 'Casi Studio - Risultati Reali | MB Consulting',
    description: 'Guarda i risultati concreti ottenuti da aziende italiane con la formazione finanziata: fino a €62.000 di formazione ottenuta a costo zero. Casi reali in manifattura, turismo, servizi e retail.',
    canonical: 'https://www.mariobruzzese.it/casi-studio'
  });

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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
            Casi Studio
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Risultati concreti ottenuti dalle aziende che hanno scelto MB Consulting
          </p>
        </motion.div>

        <div className="space-y-12 mb-20">
          {mockData.caseStudies.map((caseStudy, index) => (
            <motion.div
              key={index}
              initial={{ x: index % 2 === 0 ? -100 : 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="p-8 md:p-12 border-2 hover:border-black transition-all duration-500 hover:shadow-2xl card-modern relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%']
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                />

                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.6 }}
                      >
                        <TrendingUp className="w-6 h-6 text-black" />
                      </motion.div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {caseStudy.company}
                      </h3>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                    >
                      <Badge className="mb-6 bg-gray-100 text-black hover:bg-gray-200 border-0">
                        {caseStudy.sector}
                      </Badge>
                    </motion.div>

                    <div className="space-y-4 mb-6">
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                      >
                        <h4 className="font-bold text-gray-900 mb-2">Sfida</h4>
                        <p className="text-gray-600">{caseStudy.challenge}</p>
                      </motion.div>
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                      >
                        <h4 className="font-bold text-gray-900 mb-2">Soluzione</h4>
                        <p className="text-gray-600">{caseStudy.solution}</p>
                      </motion.div>
                    </div>
                  </div>

                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="md:w-80"
                  >
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-100 shadow-lg">
                      <h4 className="font-bold text-gray-900 mb-4 text-lg">Risultati</h4>
                      <ul className="space-y-3">
                        {caseStudy.results.map((result, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ x: 20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.7 + idx * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <motion.div
                              whileHover={{ scale: 1.3, rotate: 360 }}
                              transition={{ duration: 0.3 }}
                            >
                              <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                            </motion.div>
                            <span className="text-gray-700">{result}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          whileInView={{ y: 0, opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white rounded-2xl p-12 shadow-2xl relative overflow-hidden"
        >
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Vuoi Ottenere Risultati come Questi?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Contattaci per scoprire come possiamo aiutare la tua azienda a crescere con la formazione finanziata
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setIsContactModalOpen(true)}
                size="lg"
                className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transition-all duration-300 btn-modern group"
              >
                Richiedi la Tua Consulenza Gratuita
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        source="case_studies"
      />
    </div>
  );
};

export default CaseStudies;