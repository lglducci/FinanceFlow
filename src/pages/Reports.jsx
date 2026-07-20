 import { useNavigate } from "react-router-dom";

 const baseIcon = "w-8 h-8";

const IconCash = ({ className = "text-blue-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M6 9h.01M18 15h.01" />
  </svg>
);

const IconCashFlow = ({ className = "text-blue-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7h14" />
    <path d="m13 3 4 4-4 4" />
    <path d="M21 17H7" />
    <path d="m11 13-4 4 4 4" />
  </svg>
);

const IconChart = ({ className = "text-blue-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="m7 15 4-4 3 2 5-7" />
    <path d="M16 6h3v3" />
  </svg>
);

const IconProjectedChart = ({ className = "text-blue-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="m7 16 3-4 3 2 2-3" />
    <path d="m17 9 2-3" />
    <path d="M16 6h3v3" />
    <path d="M15 11h.01" />
  </svg>
);

const IconAccounts = ({ className = "text-blue-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
    <path d="M7 15h4" />
    <circle cx="17" cy="15" r="1.5" />
  </svg>
);

const IconBalance = ({ className = "text-purple-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3v18" />
    <path d="M5 6h14" />
    <path d="m7 6-4 7h8L7 6Z" />
    <path d="m17 6-4 7h8l-4-7Z" />
    <path d="M8 21h8" />
  </svg>
);

const IconSigma = ({ className = "text-purple-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 4H6l6 8-6 8h12" />
  </svg>
);

const IconLedger = ({ className = "text-purple-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 3v18" />
    <path d="M11 8h6" />
    <path d="M11 12h6" />
    <path d="M11 16h4" />
  </svg>
);

const IconBalanceSheet = ({ className = "text-purple-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M12 4v16" />
    <path d="M6 9h3M6 13h3M6 17h3" />
    <path d="M15 9h3M15 13h3M15 17h3" />
  </svg>
);

const IconKpi = ({ className = "text-emerald-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 18a8 8 0 1 1 16 0" />
    <path d="m12 14 4-4" />
    <circle cx="12" cy="18" r="1" />
  </svg>
);

const IconDoubleEntry = ({ className = "text-purple-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 5h13" />
    <path d="m10 2-3 3 3 3" />
    <path d="M17 19H4" />
    <path d="m14 16 3 3-3 3" />
    <path d="M7 12h10" />
  </svg>
);

const IconLevels = ({ className = "text-purple-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="6" height="4" rx="1" />
    <rect x="9" y="10" width="6" height="4" rx="1" />
    <rect x="15" y="16" width="6" height="4" rx="1" />
    <path d="M6 8v4h3" />
    <path d="M12 14v4h3" />
  </svg>
);

const IconManagementDre = ({ className = "text-emerald-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 20V10" />
    <path d="M10 20V5" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
    <path d="m4 7 5-4 5 5 6-5" />
  </svg>
);

const IconSupplier = ({ className = "text-orange-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 21V8l6-4v17" />
    <path d="M9 21V11l6-3v13" />
    <path d="M15 21v-7l6-3v10" />
    <path d="M6 11h.01M6 15h.01M12 14h.01M18 17h.01" />
  </svg>
);

const IconReceipts = ({ className = "text-orange-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
    <path d="M9 8h6" />
    <path d="M9 12h6" />
    <path d="M9 16h3" />
  </svg>
);

const IconDiagnosis = ({ className = "text-emerald-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
    <path d="M8 12l2 2 4-5" />
  </svg>
);

const IconBankStatement = ({ className = "text-blue-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-5 9 5" />
    <path d="M5 10v7M9 10v7M15 10v7M19 10v7" />
    <path d="M3 20h18" />
    <path d="M2 17h20" />
  </svg>
);

const IconPayableDiagnosis = ({ className = "text-orange-700" }) => (
  <svg
    className={`${baseIcon} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="3" width="12" height="18" rx="2" />
    <path d="M8 8h4M8 12h4M8 16h2" />
    <circle cx="17" cy="16" r="4" />
    <path d="M17 14v2l1.5 1" />
  </svg>
);

export default function Reports() {
  const navigate = useNavigate();

   
  const cards = [
  {
    title: "Fluxo de Caixa Realizado",
    desc: "Entradas e saídas realizadas no período",
    path: "/relatorios/fluxo-caixa",
    icon: <IconCashFlow />,
    iconBox: "bg-blue-100",
  },
  {
    title: "Fluxo de Caixa Realizado — Gráfico",
    desc: "Visualização gráfica do fluxo de caixa realizado",
    path: "/fluxo-caixa-grafico",
    icon: <IconChart />,
    iconBox: "bg-blue-100",
  },
  {
    title: "Fluxo de Caixa Projetado — Gráfico",
    desc: "Projeção gráfica de entradas, saídas e saldo",
    path: "/fluxo-projetado-grafico",
    icon: <IconProjectedChart />,
    iconBox: "bg-blue-100",
  },
  {
    title: "Saldos por Conta",
    desc: "Saldo consolidado por conta financeira",
    path: "/relatorios/saldoporconta",
    icon: <IconAccounts />,
    iconBox: "bg-blue-100",
  },
  {
    title: "Balancete",
    desc: "Débitos, créditos e saldos por conta contábil",
    path: "/relatorios/balancete",
    icon: <IconBalance />,
    iconBox: "bg-purple-100",
  },
  {
    title: "DRE",
    desc: "Demonstração do resultado do exercício",
    path: "/relatorios/dre",
    icon: <IconSigma />,
    iconBox: "bg-purple-100",
  },
  {
    title: "Razão Contábil",
    desc: "Lançamentos detalhados por conta contábil",
    path: "/relatorios/razao",
    icon: <IconLedger />,
    iconBox: "bg-purple-100",
  },
  {
    title: "Balanço Patrimonial",
    desc: "Ativos, passivos e patrimônio líquido",
    path: "/relatorios/balanco",
    icon: <IconBalanceSheet />,
    iconBox: "bg-purple-100",
  },
  {
    title: "Indicadores Gerenciais",
    desc: "Relatório de KPIs financeiros e contábeis",
    path: "/relatorios/gerencial",
    icon: <IconKpi />,
    iconBox: "bg-emerald-100",
  },
  {
    title: "Lançamentos por Partida Dobrada",
    desc: "Detalhamento dos débitos e créditos dos lançamentos",
    path: "/rel-lancto_partida",
    icon: <IconDoubleEntry />,
    iconBox: "bg-purple-100",
  },
  {
    title: "Balanço por Nível",
    desc: "Valores contábeis agrupados por nível de conta",
    path: "/relatorionivel",
    icon: <IconLevels />,
    iconBox: "bg-purple-100",
  },
  {
    title: "DRE Gerencial",
    desc: "DRE com ponto de equilíbrio e análise de margem",
    path: "/reldregerencial",
    icon: <IconManagementDre />,
    iconBox: "bg-emerald-100",
  },
  {
    title: "Endividamento por Fornecedor",
    desc: "Análise dos valores devidos aos fornecedores",
    path: "/rel-fornecedor",
    icon: <IconSupplier />,
    iconBox: "bg-orange-100",
  },
  {
    title: "Recebimentos por Pessoa",
    desc: "Valores recebidos e pendentes por pessoa",
    path: "/relatorio-receber-pessoa",
    icon: <IconReceipts />,
    iconBox: "bg-orange-100",
  },
  {
    title: "Diagnóstico Financeiro",
    desc: "Análise da situação financeira da empresa",
    path: "/diagnostico-financeiro",
    icon: <IconDiagnosis />,
    iconBox: "bg-emerald-100",
  },
  {
    title: "Extrato Bancário",
    desc: "Movimentações detalhadas das contas bancárias",
    path: "/extrato-bancario",
    icon: <IconBankStatement />,
    iconBox: "bg-blue-100",
  },
  {
    title: "Diagnóstico de Contas a Pagar",
    desc: "Diagnóstico de apropriação e baixa das contas a pagar",
    path: "/diagnostico-apropriacao-pagar",
    icon: <IconPayableDiagnosis />,
    iconBox: "bg-orange-100",
  },
];

 

  return (
    <div>
 
      <div className="bg-gray-100 min-h-screen p-6  rounded-xl shadow-lg border-[4px] border-gray-400"> 
      <h1 className="text-2xl font-bold mb-6">Relatórios</h1>
 
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 text-[#1e40af]"> 
        {cards.map((c) => (
         <div
            key={c.title}
            onClick={() => navigate(c.path)}
            className="cursor-pointer rounded-xl border border-blue-900 bg-gray-100 p-5 shadow hover:shadow-lg transition"
          >
            <div className="mb-3 text-[#1e40af]">{c.icon}</div>

            <h2 className="text-lg font-bold text-[#1e40af]">
              {c.title}
            </h2>

            <p className="text-base text-gray-700 mt-2 text-[#1e40af]">
              {c.desc}
            </p>
          </div>

        ))}
      </div></div>
    </div>
  );
}
