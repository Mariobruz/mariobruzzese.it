import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import HowItWorks from "@/pages/HowItWorks";
import Services from "@/pages/Services";
import WhyChooseUs from "@/pages/WhyChooseUs";
import CaseStudies from "@/pages/CaseStudies";
import FAQ from "@/pages/FAQ";
import ScadenzeCorsi from "./pages/ScadenzeCorsi";
import CorsiSicurezza from "@/pages/CorsiSicurezza";
import CondizioniVendita from "@/pages/CondizioniVendita";
import Privacy from "@/pages/Privacy";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/come-funziona" element={<HowItWorks />} />
          <Route path="/servizi" element={<Services />} />
          <Route path="/perche-noi" element={<WhyChooseUs />} />
          <Route path="/casi-studio" element={<CaseStudies />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/corsi-sicurezza" element={<CorsiSicurezza />} />
          <Route path="/durata-scadenza-corsi-sicurezza" element={<ScadenzeCorsi />} />
          <Route path="/corsi-sicurezza/:corsoId" element={<CorsiSicurezza />} />
          <Route path="/corsi-sicurezza/:corsoId/iscrizione" element={<CorsiSicurezza />} />
          <Route path="/condizioni-vendita" element={<CondizioniVendita />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
        <Footer />
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;