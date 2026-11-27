import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/toaster";
import BannerConsenso from "@/components/BannerConsenso";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import WhyChooseUs from "@/pages/WhyChooseUs";
import CaseStudies from "@/pages/CaseStudies";
import FAQ from "@/pages/FAQ";
import ScadenzeCorsi from "./pages/ScadenzeCorsi";
import RischioAteco from "./pages/RischioAteco";
import CorsiSicurezza from "@/pages/CorsiSicurezza";
import CondizioniVendita from "@/pages/CondizioniVendita";
import Privacy from "@/pages/Privacy";
import Consulenti from "@/pages/Consulenti";
import CorsiCalabria from "@/pages/CorsiCalabria";
import FormazioneFinanziata from "@/pages/FormazioneFinanziata";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/come-funziona" element={<Navigate to="/servizi" replace />} />
          <Route path="/servizi" element={<Services />} />
          <Route path="/perche-noi" element={<WhyChooseUs />} />
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
        <Footer />
        <Toaster />
        <BannerConsenso />
      </BrowserRouter>
    </div>
  );
}

export default App;