 
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Bancos from "../components/landing/Bancos";
import Problemas from "../components/landing/Problemas";
import Solucao from "../components/landing/Solucao";
import VideoPrincipal from "../components/landing/VideoPrincipal";
import Recursos from "../components/landing/Recursos";
import ComoFunciona from "../components/landing/ComoFunciona";
import VideosYoutube from "../components/landing/VideosYoutube";
import PrintsSistema from "../components/landing/PrintsSistema";
import FAQ from "../components/landing/FAQ";
import Footer from "../components/landing/Footer";
import AgendarDemonstracao  from "../components/landing/AgendarDemonstracao";


export default function Landing() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">

      <Navbar />

      <Hero />

      <Bancos />

      <Problemas />

      <Solucao />

      <VideoPrincipal />

      <Recursos />

      <ComoFunciona />

      <AgendarDemonstracao /> {/* segundo botão aqui */}

      <VideosYoutube />

      <PrintsSistema />

      <FAQ />

      <Footer />

    </main>
  );
}