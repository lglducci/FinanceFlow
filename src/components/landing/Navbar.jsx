// src/components/landing/Navbar.jsx

import { PlayCircle, LogIn, MessageCircle } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#071326]/80 border-b border-cyan-900/40">
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-6">

        {/* Logo */}
        <div className="flex items-center gap-3 ">
          <img
            src="/logo.png"
            alt="FinanceFlow"
            className="h-11 w-auto"
          />

          <div className="leading-tight">
            <div className="text-white font-black text-xl tracking-wide">
              FinanceFlow
            </div>

            <div className="text-cyan-300 text-xs">
              Gestão Financeira Inteligente
            </div>
          </div>
        </div>

        {/* Menu */}

        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold">

          <a
            href="#recursos"
            className="text-slate-200 hover:text-cyan-300 transition"
          >
            Recursos
          </a>

          <a
            href="#videos"
            className="text-slate-200 hover:text-cyan-300 transition"
          >
            Vídeos
          </a>

          <a
            href="#faq"
            className="text-slate-200 hover:text-cyan-300 transition"
          >
            FAQ
          </a>

          <a
            href="https://www.youtube.com/@luis.automacoes"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-slate-200 hover:text-red-400 transition"
          >
            <PlayCircle size={18} />
            YouTube
          </a>

        </nav>

        {/* Botões */}

        <div className="flex items-center gap-3">

          <a
            href="https://contabil-flow.lglducci.com.br/login"
            className="hidden md:flex items-center gap-2 px-5 py-2 rounded-xl border border-cyan-700 text-cyan-200 hover:bg-cyan-900/40 transition"
          >
            <LogIn size={18} />
            Entrar
          </a>

          <a
            href="https://wa.me/5516992975836"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-2 px-5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition"
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>

          <a
            href="/cadastro"
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black shadow-xl transition"
          >
            Teste Grátis
          </a>

        </div>

      </div>
    </header>
  );
}