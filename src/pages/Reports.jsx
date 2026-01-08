 import { useNavigate } from "react-router-dom";

 const baseIcon = "w-10 h-10 stroke-blue-600";

const IconCash = () => (
  <svg className={baseIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconChart = () => (
  <svg className={baseIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M4 19V5M10 19V9M16 19V13M22 19H2" />
  </svg>
);

const IconBook = () => (
  <svg className={baseIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16v16H4z" />
  </svg>
);

const IconBalance = () => (
  <svg className={baseIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v18M5 7h14M7 21h10" />
  </svg>
);

const IconReport = () => (
  <svg className={baseIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M6 2h9l5 5v15H6z" />
  </svg>
);

const IconSigma = () => (
  <svg className={baseIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M18 4H6l6 8-6 8h12" />
  </svg>
);

const IconCashFlow = () => (
  <svg className={baseIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h18" />
    <path d="M7 8l-4 4 4 4" />
    <path d="M17 16l4-4-4-4" />
  </svg>
);
 
const IconDocument = () => (
  <svg className={baseIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M6 2h9l5 5v15H6z" />
    <path d="M9 12h6M9 16h6" />
  </svg>
);

const IconJournal = () => (
  <svg className={baseIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M5 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5z" />
    <path d="M9 3v18" />
    <path d="M12 8h4M12 12h4M12 16h4" />
  </svg>
);

const IconBars = () => (
  <svg className={baseIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="10" width="3" height="10" />
    <rect x="10" y="6" width="3" height="14" />
    <rect x="16" y="3" width="3" height="17" />
  </svg>
);

export default function Reports() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Fluxo de Caixa Consolidado",
      desc: "Entradas e saídas consolidado",
      path: "/relatorios/fluxo-caixa",
       icon: <IconCash />,
    },

    {
      title: "Fluxo de Caixa Detalhado",
      desc: "Entradas e saídas no período",
      path: "/relatorios/fluxo-caixa-detalhado",
       icon: <IconBook />,
    },

    {
      title: "Fluxo de Caixa Mensal",
      desc: "Entradas e saídas mensal",
      path: "/relatorios/fluxo-caixa-mensal",
       icon: <IconChart />,
    },

    {
      title: "Saldos por Conta",
      desc: "Saldo consolidado por conta financeira",
      path: "/relatorios/saldoporconta",
      icon: <IconCashFlow />,
    },
    {
      title: "Lançamentos Contábeis",
      desc: "Lançamentos contábeis do período",
      path: "/relatorios/diario",
       icon: <IconJournal />,
    },
    {
      title: "Balancete",
      desc: "Débito e crédito por conta contábil",
      path: "/relatorios/balancete",
          icon: <IconReport />,
    },
    {
      title: "DRE",
      desc: "Resultado do exercício",
      path: "/relatorios/dre",
        icon: <IconSigma />,
    },
    {
      title: "Apuração PIS/COFINS",
      desc: "Resumo fiscal por período",
      path: "/relatorios/piscofins",
      icon: <IconReport />,
    },
    {
      title: "Relação Razão",
      desc: " Lançamentos detalhados por conta",
      path: "/relatorios/razao",
       icon: <IconDocument />,
    },

     {
      title: "Relação Balanço",
      desc: " Lançamentos detalhados por conta",
      path: "/relatorios/balanco",
        icon: <IconBars />,
    },
      {
      title: "Relação KPIs",
      desc: " Relatório de KPIs",
      path: "/relatorios/gerencial",
        icon: <IconChart />,
    },
 
     {
      title: "Relação Balanço Níveis",
      desc: " Balanço por níveis",
      path: "/relatorios/balanco-niveis",
        icon: <IconBalance />,
    },
  ];

  return (
    <div>
 
      <div className="bg-gray-100 min-h-screen p-6  rounded-xl shadow-lg border-[4px] border-gray-300"> 
      <h1 className="text-2xl font-bold mb-6">Relatórios</h1>
 
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"> 
        {cards.map((c) => (
         <div
            key={c.title}
            onClick={() => navigate(c.path)}
            className="cursor-pointer rounded-xl border border-blue-500 bg-gray-100 p-5 shadow hover:shadow-lg transition"
          >
            <div className="mb-3">{c.icon}</div>

            <h2 className="text-lg font-bold text-blue-700">
              {c.title}
            </h2>

            <p className="text-base text-gray-700 mt-2">
              {c.desc}
            </p>
          </div>

        ))}
      </div></div>
    </div>
  );
}
