 import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);

  function toggle(menu) {
    setOpen(open === menu ? null : menu);
  }

  function logout() {
    localStorage.removeItem("ff_token");
    window.location.reload();
  }

  return (
    <aside className="w-64 bg-[#3862b7] shadow-lg flex flex-col text-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-blue-800/40">
        <h2 className="text-xl font-bold">Finance-Flow</h2>
        <p className="text-xs text-blue-100">Painel pessoal</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-2 py-4 space-y-1">

        {/* Visão Geral */}
        <MenuItem label="Visão Geral" onClick={() => navigate("/dashboard")} />

        {/* Financeiro */}
        <MenuGroup
          label="Financeiro"
          open={open === "financeiro"}
          onClick={() => toggle("financeiro")}
        >
          <SubItem label="Lançamentos" onClick={() => navigate("/transactions")} /> 
          <SubItem label="Contas a Pagar" onClick={() => navigate("/contas-pagar")} />
          <SubItem label="Contas a Receber" onClick={() => navigate("/contas-receber")} /> 
          <SubItem label="Faturas" onClick={() => navigate("/faturas-cartao")} />
        </MenuGroup>

        {/* Contábil */}
        <MenuGroup
          label="Contábil"
          open={open === "contabil"}
          onClick={() => toggle("contabil")}
        >
          <SubItem label="Diário Contábil" onClick={() => navigate("/diario")} />
          <SubItem label="Importação e Processamento" onClick={() => navigate("/importar-diario")} /> 
         
        </MenuGroup>

        {/* Cadastros */}

        {/* Contábil */}
        <MenuGroup
          label="Cadastro"
          open={open === "cadastro"}
          onClick={() => toggle("cadastro")}
        > 
        <SubItem label="Fornecedores / Clientes" onClick={() => navigate("/providers-clients")} />
        <SubItem label="Categorias Gerenciais" onClick={() => navigate("/contasgerenciais")} /> 
        <SubItem label="Contas Financeiras" onClick={() => navigate("/saldos")} />
        <SubItem label="Cartões" onClick={() => navigate("/cards")} />
        <SubItem label="Contas Contábeis" onClick={() => navigate("/contascontabeis")} />
          <SubItem label="Mapeamento Contábil" onClick={() => navigate("/mapeamento-contabil")} />
         </MenuGroup>

        <MenuItem label="Relatórios" onClick={() => navigate("/reports")} />
        <MenuItem label="Configurações" onClick={() => navigate("/settings")} />

      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-blue-800/40">
        <button
          onClick={logout}
          className="w-full text-left text-sm text-red-200 hover:text-red-300"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}

/* ---------- Componentes auxiliares ---------- */

function MenuItem({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-lg text-lg hover:bg-blue-600/30"
    >
      {label}
    </button>
  );
}

function MenuGroup({ label, open, onClick, children }) {
  return (
    <div>
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center px-3 py-2 rounded-lg text-lg hover:bg-blue-600/30"
      >
        <span>{label}</span>
        <span className="text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="ml-4 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}

function SubItem({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-1 rounded text-sm text-blue-100 hover:bg-blue-700/30"
    >
      {label}
    </button>
  );
}
