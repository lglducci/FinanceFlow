import { useEffect, useState } from "react";

const PRECOS = {
  mensal: 49.9,
  semestral: 39.9,
  anual: 29.9
};

export default function Planos() {
  const [periodo, setPeriodo] = useState("mensal");

  function labelPeriodo() {
    if (periodo === "semestral") return " / mês (cobrança semestral)";
    if (periodo === "anual") return " / mês (cobrança anual)";
    return " / mês";
  }

  return (
    <div className="min-h-screen bg-[#0F172A] px-6 py-14 text-white">
      <h1 className="text-3xl font-bold text-center mb-3">
        Planos simples e transparentes
      </h1>

      <p className="text-center text-slate-300 mb-10">
        Teste grátis por 7 dias. Escolha o plano ideal depois.
      </p>

      {/* TOGGLE */}
      <div className="flex justify-center mb-12 gap-2">
        {["mensal", "semestral", "anual"].map(p => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-5 py-2 rounded-lg border text-sm font-semibold ${
              periodo === p
                ? "bg-white text-[#0F172A]"
                : "border-slate-500 text-slate-300"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CARD ÚNICO */}
      <div className="max-w-md mx-auto bg-white text-[#0F172A] rounded-2xl p-8 shadow-xl text-center">
        <h2 className="text-xl font-bold mb-2">
          Contábil Flow
        </h2>

        <div className="text-4xl font-extrabold mb-2">
          R$ {PRECOS[periodo].toFixed(2)}
        </div>

        <div className="text-sm text-gray-500 mb-6">
          {labelPeriodo()}
        </div>

        <ul className="text-sm text-gray-700 mb-8 space-y-2 text-left">
          <li>✔ Lançamentos contábeis completos</li>
          <li>✔ Relatórios e razão analítico</li>
          <li>✔ Controle financeiro integrado</li>
          <li>✔ Suporte direto</li>
        </ul>

        <button
          className="w-full bg-[#0F172A] text-white py-3 rounded-xl font-semibold hover:opacity-90"
          onClick={() => window.location.href = "/cadastro"}
        >
          Começar teste grátis
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Sem cartão de crédito • Cancele quando quiser
        </p>
      </div>
    </div>
  );
}
