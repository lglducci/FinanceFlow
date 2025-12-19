 import { useNavigate } from "react-router-dom";

export default function Reports() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Fluxo de Caixa",
      desc: "Entradas e saídas no período",
      path: "/relatorios/fluxo-caixa",
    },
    {
      title: "Saldos por Conta",
      desc: "Saldo consolidado por conta financeira",
      path: "/relatorios/saldoporconta",
    },
    {
      title: "Diário Contábil",
      desc: "Lançamentos contábeis do período",
      path: "/relatorios/diario",
    },
    {
      title: "Balancete",
      desc: "Débito e crédito por conta contábil",
      path: "/relatorios/balancete",
    },
    {
      title: "DRE",
      desc: "Resultado do exercício",
      path: "/relatorios/dre",
    },
    {
      title: "Apuração PIS/COFINS",
      desc: "Resumo fiscal por período",
      path: "/relatorios/piscofins",
    },
    {
      title: "Relação Razão",
      desc: " Lançamentos detalhados por conta",
      path: "/relatorios/razao",
    },

     {
      title: "Relação Balanço",
      desc: " Lançamentos detalhados por conta",
      path: "/relatorios/balanco",
    },
      {
      title: "Relação KPIs",
      desc: " Relatório de KPIs",
      path: "/relatorios/kpi",
    },
    
     {
      title: "Relação Balanço Níveis",
      desc: " Balanço por níveis",
      path: "/relatorios/balanco-niveis",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Relatórios</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div
            key={c.title}
            onClick={() => navigate(c.path)}
            className="cursor-pointer rounded-xl border border-blue-400 bg-gray-100 p-5 shadow hover:shadow-lg transition"
          >
            <h2 className="text-lg font-bold text-blue-700">
              {c.title}
            </h2>
            <p className="text- base text-gray-700 mt-2">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
