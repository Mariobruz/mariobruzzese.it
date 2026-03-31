import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Card } from '../components/ui/card';
import { mockData } from '../mock';
import { Button } from '../components/ui/button';
import ContactModal from '../components/ContactModal';
import useSEO from '../hooks/useSEO';

const Services = () => {
  useSEO({
    title: 'Servizi di Formazione Finanziata | MB Consulting',
    description: 'Consulenza fondi interprofessionali, analisi fabbisogni formativi, progettazione piani formativi e gestione completa del processo. Scopri tutti i servizi di MB Consulting.',
    canonical: 'https://www.mariobruzzese.it/servizi'
  });

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const getIcon = (iconName) => {
    const iconMap = {
      'briefcase': LucideIcons.Briefcase,
      'search': LucideIcons.Search,
      'file-text': LucideIcons.FileText,
      'users': LucideIcons.Users,
      'graduation-cap': LucideIcons.GraduationCap,
      'shield-check': LucideIcons.ShieldCheck
    };
    const IconComponent = iconMap[iconName] || LucideIcons.Circle;
    return <IconComponent className="w-8 h-8" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen pt-36 pb-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            I Nostri Servizi
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Offriamo una gamma completa di servizi per gestire la formazione finanziata della tua azienda
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {mockData.services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, rotate: 1 }}
            >
              <Card className="p-8 border-2 hover:border-black transition-all duration-300 hover:shadow-2xl group h-full card-modern relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-gray-100 group-hover:bg-black rounded-xl flex items-center justify-center mb-6 transition-all duration-300 relative z-10"
                >
                  <div className="text-black group-hover:text-white transition-colors duration-300">
                    {getIcon(service.icon)}
                  </div>
                </motion.div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed relative z-10">{service.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Process Overview */}
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          whileInView={{ y: 0, opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white rounded-2xl p-12 shadow-2xl relative overflow-hidden"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Gestione Completa Chiavi in Mano
            </h2>
            <p className="text-lg text-gray-300 text-center mb-10 max-w-3xl mx-auto">
              Non dovrai preoccuparti di nulla. Ci occupiamo di ogni aspetto del processo, dalla prima analisi fino alla rendicontazione finale.
            </p>
            <div className="text-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setIsContactModalOpen(true)}
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transition-all duration-300 btn-modern"
                >
                  Scopri Come Possiamo Aiutarti
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        source="services"
      />
    </div>
  );
};

export default Services;