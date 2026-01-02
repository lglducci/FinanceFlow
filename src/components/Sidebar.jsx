 import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);

  const toggle = (m) => setOpen(open === m ? null : m);

  const logout = () => {
    localStorage.removeItem("ff_token");
    window.location.reload();
  };

  return (
    <aside className="w-64 bg-[#172c52ff] text-white flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-blue-800/40">
        <h2 className="text-xl font-bold">Finance-Flow</h2>
        <p className="text-xs text-blue-100">Painel pessoal</p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">

        <MenuItem icon={<IconHome />} label="Visão Geral" onClick={() => navigate("/dashboard")} />

        <MenuGroup
          icon={<IconMoney />}
          label="Transações Financeiras"
          open={open === "financeiro"}
          onClick={() => toggle("financeiro")}
        >
          
          <SubItem icon={<IconDoc />} label="Lançamentos" onClick={() => navigate("/transactions")}   className="!text-blue-300" />
          <SubItem icon={<IconArrowUp />} label="Contas a Pagar" onClick={() => navigate("/contas-pagar")} />
          <SubItem icon={<IconArrowDown />} label="Contas a Receber" onClick={() => navigate("/contas-receber")} />
          <SubItem icon={<IconCard />} label="Faturas" onClick={() => navigate("/faturas-cartao")} />
           <SubItem icon={<IconCardTransaction />} label="Transações Cartão" onClick={() => navigate("/cartao-transacoes")} />  
 
        </MenuGroup>

        <MenuGroup
          icon={<IconBook />}
          label="Contábil"
          open={open === "contabil"}
          onClick={() => toggle("contabil")}
        >
          <SubItem icon={<IconBook />} label="Diário Contábil" onClick={() => navigate("/diario")} />
          <SubItem icon={<IconSettings />} label="Processar e Importar" onClick={() => navigate("/importar-diario")} />
        </MenuGroup>

        <MenuGroup
          icon={<IconFolder />}
          label="Cadastro"
          open={open === "cadastro"}
          onClick={() => toggle("cadastro")}
        >
          <SubItem icon={<IconUsers />} label="Fornecedores / Clientes" onClick={() => navigate("/providers-clients")} />
          <SubItem icon={<IconTag />} label="Categorias Gerenciais" onClick={() => navigate("/contasgerenciais")} />
          <SubItem icon={<IconBank />} label="Contas Financeiras" onClick={() => navigate("/saldos")} />
          <SubItem icon={<IconCard />} label="Cartões" onClick={() => navigate("/cards")} />
          <SubItem icon={<IconFile />} label="Contas Contábeis" onClick={() => navigate("/contascontabeis")} />
          <SubItem icon={<IconMap />} label="Mapeamento Contábil" onClick={() => navigate("/mapeamento-contabil")} />
        </MenuGroup>

        <MenuItem icon={<IconChart />} label="Relatórios" onClick={() => navigate("/reports")} />
        <MenuItem icon={<IconSettings />} label="Configurações" onClick={() => navigate("/settings")} />

      </nav>

      <div className="px-4 py-3 border-t border-blue-800/40">
        <button onClick={logout} className="flex items-center gap-2 text-sm text-red-200 hover:text-red-300">
          <IconLogout /> Sair
        </button>
      </div>
    </aside>
  );
}

/* ====== COMPONENTES ====== */

function MenuItem({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-600/30">
      {icon}{label}
    </button>
  );
}

function MenuGroup({ icon, label, open, onClick, children }) {
  return (
    <div>
      <button onClick={onClick} className="flex justify-between items-center w-full px-3 py-2 rounded-lg hover:bg-blue-600/30">
        <span className="flex items-center gap-3">{icon}{label}</span>
        <span className="text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="ml-6 space-y-1">{children}</div>}
    </div>
  );
}

function SubItem({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 px-3 py-1 text-base text-blue-100 hover:bg-blue-700/30 rounded">
      {icon}{label}
    </button>
  );
}

/* ====== ÍCONES SVG INLINE (NÃO QUEBRAM) ====== */

const base = "w-7 h-7 stroke-current";
const IconHome = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9M4 10v10h16V10" strokeWidth="2"/></svg>);
const IconMoney = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2"/><circle cx="12" cy="12" r="3" strokeWidth="2"/></svg>);
const IconDoc = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6z" strokeWidth="2"/></svg>);
const IconArrowUp = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7-7 7 7" strokeWidth="2"/></svg>);
const IconArrowDown = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7 7 7-7" strokeWidth="2"/></svg>);
const IconCard = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2"/></svg>);
const IconBook = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" strokeWidth="2"/></svg>);
const IconSettings = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" strokeWidth="2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3.4-0.2-.1a1.7 1.7 0 0 0-2 .3l-.1.1-3.4-2-0.1-.2a1.7 1.7 0 0 0-1.9-.3H9l-2-3.4.1-.1a1.7 1.7 0 0 0-.3-2v-.2l2-3.4.2.1a1.7 1.7 0 0 0 2-.3h.2l3.4 2 .1.2a1.7 1.7 0 0 0 1.9.3z" strokeWidth="2"/></svg>);
const IconFolder = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M3 6h6l2 2h10v10H3z" strokeWidth="2"/></svg>);
const IconUsers = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><path d="M2 20c0-4 6-4 7-4s7 0 7 4" strokeWidth="2"/></svg>);
const IconTag = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M20 10l-8 8-8-8V4h6z" strokeWidth="2"/></svg>);
const IconBank = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M3 10h18M5 10v10M9 10v10M15 10v10M19 10v10" strokeWidth="2"/></svg>);
const IconFile = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6z" strokeWidth="2"/></svg>);
const IconMap = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M9 18l-6-3V6l6 3 6-3 6 3v9l-6-3z" strokeWidth="2"/></svg>);
const IconChart = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M4 19V5M10 19V9M16 19V13M22 19H2" strokeWidth="2"/></svg>);
const IconLogout = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M16 17l5-5-5-5M21 12H9M12 19H5V5h7" strokeWidth="2"/></svg>);
const IconCardTransaction = () => (<svg className={base} fill="none" viewBox="0 0 24 24" stroke="currentColor"  strokeWidth="2" >
 {/* Cartão */}
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 9h20" />

    {/* Setas de transação */}
    <path d="M8 13h4" />
    <path d="M10 11l2 2-2 2" />

    <path d="M16 15h-4" />
    <path d="M14 13l-2 2 2 2" />
  </svg>
);
