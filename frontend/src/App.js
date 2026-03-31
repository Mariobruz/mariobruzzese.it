import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import HowItWorks from "@/pages/HowItWorks";
import Services from "@/pages/Services";
import WhyChooseUs from "@/pages/WhyChooseUs";
import CaseStudies from "@/pages/CaseStudies";
import FAQ from "@/pages/FAQ";

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
        </Routes>
        <Footer />
        <WhatsAppButton />
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;