import "@/App.css";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/toaster";
import BannerConsenso from "@/components/BannerConsenso";
import Home from "@/pages/Home";
const Services = lazy(() => import("@/pages/Services"));
const CaseStudies = lazy(() => import("@/pages/CaseStudies"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const ScadenzeCorsi = lazy(() => import("@/pages/ScadenzeCorsi"));
const RischioAteco = lazy(() => import("@/pages/RischioAteco"));
const CorsiSicurezza = lazy(() => import("@/pages/CorsiSicurezza"));
const CondizioniVendita = lazy(() => import("@/pages/CondizioniVendita"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Consulenti = lazy(() => import("@/pages/Consulenti"));
const CorsiCalabria = lazy(() => import("@/pages/CorsiCalabria"));
const FormazioneFinanziata = lazy(() => import("@/pages/FormazioneFinanziata"));

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        {/* Le pagine si caricano solo quando servono: il primo caricamento è più leggero */}
        <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/come-funziona" element={<Navigate to="/servizi" replace />} />
          <Route path="/servizi" element={<Services />} />
          <Route path="/perche-noi" element={<Navigate to="/servizi" replace />} />
          <Route path="/professionisti" element={<CaseStudies />} />
          <Route path="/casi-studio" element={<Navigate to="/professionisti" replace />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/corsi-sicurezza" element={<CorsiSicurezza />} />
          <Route path="/durata-scadenza-corsi-sicurezza" element={<ScadenzeCorsi />} />
          <Route path="/codice-ateco-livello-di-rischio" element={<RischioAteco />} />
          <Route path="/corsi-sicurezza/:corsoId" element={<CorsiSicurezza />} />
          <Route path="/corsi-sicurezza/:corsoId/iscrizione" element={<CorsiSicurezza />} />
          <Route path="/condizioni-vendita" element={<CondizioniVendita />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/consulenti" element={<Consulenti />} />
          <Route path="/corsi-sicurezza-calabria" element={<CorsiCalabria />} />
          <Route path="/formazione-finanziata" element={<FormazioneFinanziata />} />
        </Routes>
        </Suspense>
        <Footer />
        <Toaster />
        <BannerConsenso />
      </BrowserRouter>
    </div>
  );
}

export default App;