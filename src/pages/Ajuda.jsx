 import { useNavigate } from "react-router-dom";
 import { useState } from "react";
 

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


    function BlocoAjuda({ titulo, children }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="border rounded-xl bg-white shadow-sm">
      <div
        onClick={() => setAberto(!aberto)}
        className="cursor-pointer flex justify-between items-center p-4"
      >
        <span className="font-bold text-blue-800">{titulo}</span>
        <span>{aberto ? "▲" : "▼"}</span>
      </div>

      {aberto && (
        <div className="p-4 border-t text-sm text-gray-700 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}



  return (
    <div className="min-h-screen bg-gray-100">

      <div className="bg-[#0b1f3a] text-white py-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Central de Ajuda</h1>
      </div>

      <BlocoAjuda titulo="📘 O que este sistema é?">

            <p>
            Este sistema é uma plataforma de gestão contábil e gerencial focada em dar
            clareza sobre a saúde financeira da empresa.
            </p>

            <p>
            Ele organiza os dados financeiros em uma estrutura contábil correta,
            permitindo visualizar resultados como lucro, prejuízo, custos e desempenho.
            </p>

            <p>
            É voltado para empresários que querem entender o negócio de forma prática,
            sem depender exclusivamente de relatórios externos.
            </p>
            
            
            </BlocoAjuda>


        <BlocoAjuda titulo="🚫 O que este sistema NÃO é?">

            <p>
            Este sistema não substitui um contador e não realiza apuração fiscal oficial.
            </p>

            <p>
            Ele não calcula automaticamente impostos como ICMS, ISS, PIS/COFINS ou tributos de produto.
            </p>

            <p>
            Também não é um sistema de contabilidade fiscal completo para entrega de obrigações legais.
            </p>

            <p>
            O foco é gestão e análise do negócio, não cumprimento de obrigações fiscais.
            </p>
            <p className="text-base text-red-700 font-bold">
                Este sistema mostra se sua empresa está dando lucro — não calcula imposto.
                </p>

            </BlocoAjuda>
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