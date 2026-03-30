import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { mockData } from '../mock';
import { Button } from '../components/ui/button';
import { MessageCircle, HelpCircle } from 'lucide-react';
import ContactModal from '../components/ContactModal';

const FAQ = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-40" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-6"
          >
            <HelpCircle className="w-16 h-16 text-black mx-auto" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Domande Frequenti
          </h1>
          <p className="text-xl text-gray-600">
            Trova le risposte alle domande più comuni sulla formazione finanziata
          </p>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-4 mb-16">
          {mockData.faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <AccordionItem
                value={`item-${index}`}
                className="border-2 border-gray-200 rounded-lg px-6 hover:border-black transition-all duration-300 hover:shadow-lg bg-white/80 backdrop-blur-sm"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        {/* CTA Section */}
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          whileInView={{ y: 0, opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center bg-gradient-to-br from-gray-50 to-white rounded-2xl p-12 border-2 border-gray-100 shadow-xl"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MessageCircle className="w-16 h-16 text-black mx-auto mb-6" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Hai Altre Domande?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Contattaci per una consulenza gratuita personalizzata
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
        source="faq"
      />
    </div>
  );
};

export default FAQ;