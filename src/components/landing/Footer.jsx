 // src/components/landing/Footer.jsx

import {
  Mail,
  MessageCircle,
  PlayCircle,
  ArrowUpRight,
  Heart,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#071326] text-white">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-5xl font-black leading-tight">
                Comece hoje mesmo.
              </h2>
              <p className="mt-6 text-xl text-slate-300 leading-9 max-w-2xl">
                Descubra como é simples administrar sua empresa utilizando uma plataforma moderna, inteligente e integrada.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <a
                href="/cadastro"
                className="inline-flex items-center gap-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition px-10 py-5 text-xl font-black text-slate-900"
              >
                Criar Conta Gratuitamente
                <ArrowUpRight size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <img src="/logo.png" alt="FinanceFlow" className="h-14 mb-6" />
            <p className="text-slate-400 leading-8">
              Plataforma completa para gestão financeira e contabilidade integrada.
            </p>
          </div>

          <div>
            <h3 className="font-black text-xl mb-6">Sistema</h3>
            <div className="space-y-4">
              <a href="#recursos" className="block text-slate-400 hover:text-cyan-300 transition">Recursos</a>
              <a href="#videos" className="block text-slate-400 hover:text-cyan-300 transition">Vídeos</a>
              <a href="#faq" className="block text-slate-400 hover:text-cyan-300 transition">Perguntas Frequentes</a>
            </div>
          </div>

          <div>
            <h3 className="font-black text-xl mb-6">Contato</h3>
            <div className="space-y-5">
              <a href="mailto:lglducci@hotmail.com.br" className="flex items-center gap-3 text-slate-400 hover:text-cyan-300 transition">
                <Mail size={18} />
                lglducci@hotmail.com.br
              </a>

              <a href="https://wa.me/5516992975836" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-cyan-300 transition">
                <MessageCircle size={18} />
                WhatsApp
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-black text-xl mb-6">Canal</h3>
            <a
              href="https://www.youtube.com/@luis.automacoes"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-xl bg-white/5 hover:bg-red-600 transition px-5 py-4"
            >
              <PlayCircle size={22} />
              YouTube
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} FinanceFlow. Todos os direitos reservados.
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-sm">
            Desenvolvido com
            <Heart size={15} className="text-red-500 fill-red-500" />
            por Luis Gustavo Landucci
          </div>
        </div>
      </div>
    </footer>
  );
}