import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { mockData } from '../mock';
import { useNavigate } from 'react-router-dom';
import ContactModal from '../components/ContactModal';

const AnimatedCounter = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        const value = typeof end === 'string' ? parseInt(end) : end;
        setCount(Math.floor(progress * value));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{typeof end === 'string' && end.includes('+') ? '+' : ''}{typeof end === 'string' && end.includes('%') ? '%' : ''}</span>;
};

const Home = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, 50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const scrollToContact = () => {
    const footer = document.getElementById('contatti');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Particles for background
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    left: Math.random() * 100,
    delay: Math.random() * 20
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 gradient-mesh">
          <div className="particles">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="particle"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  left: `${particle.left}%`,
                  animationDelay: `${particle.delay}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            style={{ y: y1, opacity }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 backdrop-blur-sm rounded-full mb-8 border border-black/10"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Formazione Finanziata al 100%</span>
            </motion.div>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              <span className="gradient-text">{mockData.hero.title}</span>
            </motion.h1>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed"
            >
              {mockData.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setIsContactModalOpen(true)}
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transition-all duration-300 btn-modern hover-glow relative overflow-hidden group"
                >
                  <span className="relative z-10">{mockData.hero.cta}</span>
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => navigate('/come-funziona')}
                  size="lg"
                  variant="outline"
                  className="border-2 border-black text-black hover:bg-black hover:text-white text-lg px-8 py-6 transition-all duration-300"
                >
                  Scopri Come Funziona
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            style={{ y: y2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-5xl mx-auto"
          >
            {mockData.stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center glass rounded-2xl p-6 card-modern"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="text-4xl md:text-5xl font-bold text-black mb-2"
                >
                  {stat.number.includes('+') || stat.number.includes('%') ? (
                    <AnimatedCounter end={stat.number} />
                  ) : (
                    stat.number
                  )}
                </motion.div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Value Proposition with Stagger Animation */}
      <section className="py-20 px-6 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gray-100 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-100 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Formazione di Qualità a Costo Zero
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Recupera i contributi versati ai fondi interprofessionali e investi nella crescita del tuo team
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Zero Investimento',
                desc: 'La tua azienda versa già contributi ai fondi interprofessionali. Recuperiamo questi fondi per finanziare completamente la formazione.'
              },
              {
                title: 'Gestione Totale',
                desc: 'Non devi preoccuparti di nulla. Gestiamo noi tutto il processo: dalla progettazione alla rendicontazione finale.'
              },
              {
                title: 'Risultati Concreti',
                desc: 'Migliaia di ore di formazione erogate, centinaia di aziende servite in tutta Italia con il 100% di soddisfazione.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <Card className="p-8 border-2 hover:border-black transition-all duration-300 hover:shadow-2xl transform card-3d h-full">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Gradient */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute bottom-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Pronto a Investire nella Tua Azienda Senza Costi?
          </motion.h2>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300 mb-10"
          >
            Richiedi una consulenza gratuita e scopri quanto puoi ottenere dai fondi interprofessionali
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setIsContactModalOpen(true)}
              size="lg"
              className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transition-all duration-300 btn-modern relative overflow-hidden group"
            >
              <span className="relative z-10">Richiedi Consulenza Gratuita</span>
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        source="hero_cta"
      />
    </div>
  );
};

export default Home;