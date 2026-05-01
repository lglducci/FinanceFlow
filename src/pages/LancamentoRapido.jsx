 import LancamentoRapidoDesktop from "./LancamentoRapidoDesktop";
import LancamentoRapidoMobile from "./LancamentoRapidoMobile";

export default function LancamentoRapido() {
  const isMobile = window.innerWidth < 768;
  // return isMobile ? <LancamentoRapidoDesktop /> : <LancamentoRapidoDesktop />;
  return isMobile ? <LancamentoRapidoMobile /> : <LancamentoRapidoDesktop />;
}