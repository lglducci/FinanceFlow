 import { useNavigate } from "react-router-dom";

export default function Ajuda() {
  const navigate = useNavigate();

  const Card = ({ titulo, desc, link }) => (
    <div
      onClick={() => navigate(link)}
      className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-lg transition border"
    >
      <h3 className="font-semibold text-lg mb-2 text-[#0f2a4d]">{titulo}</h3>
      <p className="text-sm text-gray-600 mb-3">{desc}</p>
      <span className="text-blue-600 text-sm underline">
        🔗 Ver mais
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="bg-[#0b1f3a] text-white py-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Central de Ajuda</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-5">

        <Card titulo="💰 Entradas e Saídas" desc="Registre o dinheiro" link="/ajuda/financeiro" />
        <Card titulo="📅 Contas Futuras" desc="Controle contas" link="/ajuda/contas" />
        <Card titulo="💳 Cartões" desc="Compras e faturas" link="/ajuda/cartoes" />
        <Card titulo="📊 Relatórios" desc="Veja resultados" link="/ajuda/relatorios" />
        <Card titulo="📘 Contábil" desc="Controle técnico" link="/ajuda/contabil" />
             <Card titulo="📘 Origem Contábil" desc="Controle educacional" link="/ajuda/origem" />
        <Card titulo="🎯 Começar" desc="Aprenda o básico" link="/ajuda/inicio" />

      </div>

      <div className="text-center mb-6">
        <button
          onClick={() => window.dispatchEvent(new Event("abrirChatIA"))}
          className="text-blue-600 underline"
        >
          💬 Falar com assistente
        </button>
      </div>

    </div>
  );
}