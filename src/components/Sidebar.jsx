 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [openSub, setOpenSub] = useState(null);

  const toggleSub = (m) => setOpenSub(openSub === m ? null : m);
  const toggle = (m) => setOpen(open === m ? null : m);

  const logout = () => {
    localStorage.removeItem("ff_token");
    localStorage.removeItem("force_reset_password");
    localStorage.removeItem("ff_token");
    window.location.href = "/login";
  };

  async function carregaPerfil() {
    const empresa_id =
      localStorage.getItem("empresa_id") ||
      localStorage.getItem("id_empresa");

    const resp = await fetch(buildWebhookUrl("perfil"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa_id }),
    });

    const json = await resp.json();
    localStorage.setItem("perfil", json.codigo);
    setPerfil(json.codigo || "TOTAL");
  }

  const [sidebarAberta, setSidebarAberta] = useState(() => {
    return localStorage.getItem("sidebarAberta") !== "false";
  });

  function alternarSidebar() {
    setSidebarAberta((prev) => {
      localStorage.setItem("sidebarAberta", String(!prev));
      return !prev;
    });
  }

  useEffect(() => {
    carregaPerfil();
  }, []);

  const MENU_PERMISSOES = {
    visao_geral: ["FINANCEIRO", "TOTAL"],
    dashboard_contabil: ["CONTABIL", "TOTAL"],
    transacoes_financeiras: ["FINANCEIRO", "VENDAS", "TOTAL"],
    diario_contabil: ["CONTABIL", "TOTAL"],
    apuracao_resultado: ["CONTABIL", "TOTAL"],
    cadastro: ["FINANCEIRO", "CONTABIL", "TOTAL"],
    configuracoes: ["TOTAL"],
  };

  function podeVer(menuKey) {
    const permitidos = MENU_PERMISSOES[menuKey] || [];
    return permitidos.includes(perfil);
  }

  function abrirSidebar() {
    setSidebarAberta(true);
  }

  function fecharSidebar() {
    setSidebarAberta(false);
  }

  return (
    <aside
      onMouseEnter={() => setSidebarAberta(true)}
      onMouseLeave={() => setSidebarAberta(false)}
      className={`transition-all duration-100 bg-gradient-to-b from-[#061f4a] via-[#061f4a] to-[#061f4a] text-white flex flex-col h-full border-r-2 border-yellow-200/70 shadow-[10px_0_35px_rgba(15,23,42,0.25)] ${
  sidebarAberta ? "w-72" : "w-20"
}`}
    >
      <div
        className={`
          bg-[#061f4a]
          text-white font-bold shadow-lg border-b border-yellow-500/70
          ${sidebarAberta ? "px-5 py-5" : "px-2 py-4"}
        `}
      >
        <div className={`flex items-center ${sidebarAberta ? "justify-between" : "justify-center"}`}>
          <div className={`flex items-center ${sidebarAberta ? "gap-3" : "justify-center"}`}>
            <div className="h-12 w-12 rounded-2xl bg-white/10 shadow-inner flex items-center justify-center text-white shrink-0 border border-white/15">
             <img
                src="/img/logo-flow-icon.png"
                alt="FinanceFlow"
                className="h-9 w-9 object-contain"
              />
            </div>

            {sidebarAberta && (
              <div>
                <h2 className="text-xl font-black tracking-tight whitespace-nowrap">FinanceFlow</h2>
                <p className="text-xs text-white/75 font-bold whitespace-nowrap">Gestão financeira e contábil</p>
              </div>
            )}
          </div>

          {sidebarAberta && (
            <button
              type="button"
              onClick={alternarSidebar}
              title="Recolher menu"
              className="h-10 w-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-black shadow-inner transition-all"
            >
              «
            </button>
          )}

          {!sidebarAberta && (
            <button
              type="button"
              onClick={alternarSidebar}
              title="Expandir menu"
              className="hidden"
            >
              ☰
            </button>
          )}
        </div>
      </div>

      <nav
         className={`flex-1 py-5 overflow-y-auto text-white text-sm font-bold ${
          sidebarAberta ? "px-4 space-y-2" : "px-2 space-y-4"
        }`}
      >
        {sidebarAberta && <SectionTitle label="Painel" />}
        {podeVer("visao_geral") && (
          <MenuItem compact={!sidebarAberta} icon={<IconHome />} label="Painel Financeiro" onClick={() => navigate("/dashboardfinanceiro")} active />
        )}
        <MenuItem compact={!sidebarAberta} icon={<IconChart />} label="Painel Contábil" onClick={() => navigate("/dashboardcontabil")} />

        {sidebarAberta && <SectionDivider />}
        {sidebarAberta && <SectionTitle label="Financeiro" />}
        {podeVer("visao_geral") && (
          <MenuGroup
            compact={!sidebarAberta}
            icon={<IconWallet />}
            label="Financeiro"
            open={open === "financeiro"}
            onClick={() => toggle("financeiro")}
          >
            <SubItem compact={!sidebarAberta} icon={<IconDoc />} label="Lançamentos" onClick={() => navigate("/transactions")} />

            <NestedButton
              open={openSub === "contas"}
              onClick={() => toggleSub("contas")}
              icon={<IconMoney />}
              label="Contas"
            />

            {openSub === "contas" && (
              <div className="ml-8 space-y-1">
                <SubItem compact={!sidebarAberta} icon={<IconArrowUp />} label="Contas a Pagar" onClick={() => navigate("/contas-pagar")} color="green" />
                <SubItem compact={!sidebarAberta} icon={<IconArrowDown />} label="Contas a Receber" onClick={() => navigate("/contas-receber")} color="green" />
              </div>
            )}

            <SubItem compact={!sidebarAberta} icon={<IconCalendar />} label="Títulos Vencidos" onClick={() => navigate("/titulos-vencidos")} color="red" />

            <NestedButton
              open={openSub === "dinheiro"}
              onClick={() => toggleSub("dinheiro")}
              icon={<IconBank />}
              label="Contas / Bancos"
            />

            {openSub === "dinheiro" && (
              <div className="ml-8 space-y-1">
                <SubItem icon={<IconCardTransaction />} label="Cartões" onClick={() => navigate("/cartoes")} />
                <SubItem icon={<IconBank />} label="Contas Financeiras" onClick={() => navigate("/contacorrente")} /> 
                  <SubItem  icon={<IconDoc />} label="Extrato Bancário" onClick={() => navigate("/extrato-bancario" )} />

              </div>
            )}
          </MenuGroup>
        )}

        {sidebarAberta && <SectionDivider />}
        {sidebarAberta && <SectionTitle label="Importações" />}
        {podeVer("visao_geral") && (
          <MenuGroup
            compact={!sidebarAberta}
            icon={<IconCloud />}
            label="Importações"
            open={open === "importacao"}
            onClick={() => toggle("importacao")}
          >
            <SubItem compact={!sidebarAberta} icon={<IconBook />} label="Livro Caixa" onClick={() => navigate("/livro-caixa")} />
            <SubItem compact={!sidebarAberta} icon={<IconCardTransaction />} label="Faturas de Cartão" onClick={() => navigate("/importacao-cartao")} />
            <SubItem
            compact={!sidebarAberta}
            icon={<IconDoc />}
            label="Extrato Bancário"
            onClick={() => navigate("/importacao-bancaria")}
          />
            
          </MenuGroup>
        )}

        {sidebarAberta && <SectionDivider />}
        {sidebarAberta && <SectionTitle label="Contabilidade" />}
        {(podeVer("diario_contabil") || podeVer("configuracoes")) && (
          <MenuGroup
            compact={!sidebarAberta}
            icon={<IconBuilding />}
            label="Contabilidade"
            open={open === "contabil"}
            onClick={() => toggle("contabil")}
          >
            {podeVer("visao_geral") && (
              <SubItem compact={!sidebarAberta} icon={<IconClipboard />} label="Diário Contábil" onClick={() => navigate("/diario")} />
            )}
            {podeVer("visao_geral") && (
              <SubItem compact={!sidebarAberta} icon={<IconRefresh />} label="Processamento" onClick={() => navigate("/processar-diario")} />
            )}
            <SubItem compact={!sidebarAberta} icon={<IconBook />} label="Lançamentos Contábeis" onClick={() => navigate("/relatorios/diario")} />
            <SubItem compact={!sidebarAberta} icon={<IconBank />} label="Saldos Iniciais" onClick={() => navigate("/saldosiniciais")} />
            <SubItem compact={!sidebarAberta} icon={<IconChart />} label="Apuração de Resultado" onClick={() => navigate("/apuracaoresultado")} />
            <SubItem compact={!sidebarAberta} icon={<IconBell />} label="Lembretes Contábeis" onClick={() => navigate("/lembretecontabil")} />
          </MenuGroup>
        )}

        {sidebarAberta && <SectionDivider />}
        {sidebarAberta && <SectionTitle label="Cadastros" />}
        <MenuGroup
          compact={!sidebarAberta}
          icon={<IconFolder />}
          label="Cadastros"
          open={open === "cadastro"}
          onClick={() => toggle("cadastro")}
        >
          {podeVer("visao_geral") && (
            <SubItem compact={!sidebarAberta} icon={<IconUsers />} label="Fornecedores / Clientes" onClick={() => navigate("/providers-clients")} />
          )}
          <SubItem compact={!sidebarAberta} icon={<IconBook />} label="Plano de Contas" onClick={() => navigate("/contascontabeis")} />
          <SubItem compact={!sidebarAberta} icon={<IconSettings />} label="Modelos Contábeis" onClick={() => navigate("/mapeamento-contabil")} />
        </MenuGroup>

        {sidebarAberta && <SectionDivider />}
        {sidebarAberta && <SectionTitle label="Relatórios" />}
        {podeVer("diario_contabil") && (
          <MenuItem compact={!sidebarAberta} icon={<IconChart />} label="Relatórios" onClick={() => navigate("/reports")} />
        )}

        {sidebarAberta && <SectionDivider />}
        {sidebarAberta && <SectionTitle label="Configurações" />}
        {podeVer("diario_contabil") && (
          <MenuGroup
            compact={!sidebarAberta}
            icon={<IconSettings />}
            label="Configurações"
            open={open === "Configurações"}
            onClick={() => toggle("Configurações")}
          >
            <SubItem compact={!sidebarAberta} icon={<IconBuilding />} label="Minha Empresa" onClick={() => navigate("/editar-empresa")} />
            <SubItem compact={!sidebarAberta} icon={<IconCalculator />} label="Calculadora" onClick={() => navigate("/calculadora")} />
            <SubItem compact={!sidebarAberta} icon={<IconSettings />} label="Escolha do Plano" onClick={() => navigate("/escolhaplano")} />
          </MenuGroup>
        )}
      </nav>

      <div className={`${sidebarAberta ? "px-5" : "px-2"} py-4 border-t border-yellow-500/40 bg-[#061f4a]`}>
        <button
          onClick={logout}
          title="Sair"
          className={`group flex items-center gap-3 text-sm text-red-200 hover:text-white font-extrabold rounded-2xl hover:bg-white hover:shadow-md transition-all ${
            sidebarAberta ? "justify-start px-3 py-3" : "justify-center w-full px-2 py-3"
          }`}
        >
          <span className="h-9 w-9 rounded-xl bg-white/10 text-red-200 flex items-center justify-center shrink-0 border border-red-300/30 group-hover:bg-red-600 group-hover:text-white transition-all">
            <IconLogout />
          </span>
          {sidebarAberta && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}

 function SectionTitle({ label }) {
  return (
    <div className="px-2 pt-2 text-[12px] uppercase tracking-wide font-black text-yellow-300/90">
      {label}
    </div>
  );
}

 function SectionDivider() {
  return <div className="h-px bg-yellow-500/40 mx-2 my-3" />;
}

function MenuItem({ icon, label, onClick, compact = false, active = false }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        group flex items-center rounded-2xl text-sm font-extrabold
        transition-all duration-200
        ${
          active
            ? "bg-white/15 text-white shadow-sm border border-white/15"
            : "text-white/95 hover:bg-white/10 hover:text-white hover:shadow-md"
        }
        ${compact ? "justify-center px-2 py-3 w-full" : "gap-3 px-3 py-3 w-full text-left"}
      `}
    >
      <span
        className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
          active
            ? "bg-blue-600 text-white shadow-md border border-white/20"
            : "bg-white/10 text-white border border-white/20 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30"
        }`}
      >
        {icon}
      </span>
      {!compact && <span className="truncate">{label}</span>}
    </button>
  );
}

function MenuGroup({ icon, label, open, onClick, children, compact = false }) {
  return (
    <div>
      <button
        onClick={onClick}
        title={label}
        className={`
          group flex items-center rounded-2xl text-white text-sm font-extrabold w-full
          hover:bg-white/10 hover:text-white hover:shadow-md
          transition-all duration-200
          ${compact ? "justify-center px-2 py-3" : "justify-between px-3 py-3"}
        `}
      >
        <span className={`flex items-center ${compact ? "justify-center" : "gap-3"}`}>
          <span className="h-10 w-10 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30 transition-all">
            {icon}
          </span>
          {!compact && <span className="truncate">{label}</span>}
        </span>

        {!compact && (
          <span className={`text-sm text-white/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            ▾
          </span>
        )}
      </button>

      {!compact && open && (
        <div className="ml-8 mt-1 space-y-1 border-l border-slate-300/70 pl-3">
          {children}
        </div>
      )}
    </div>
  );
}

function NestedButton({ icon, label, open, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between w-full px-3 py-2 rounded-xl text-white/90 text-[13px] font-bold hover:bg-white/10 hover:text-white transition-all duration-200"
    >
      <span className="flex items-center gap-2.5">
        <span className="h-7 w-7 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30 transition-all">
          {icon}
        </span>
        <span>{label}</span>
      </span>
      <span className={`text-xs text-white/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
    </button>
  );
}

function SubItem({ icon, label, onClick, compact = false, color = "blue" }) {
  const colorClass =
    color === "green"
      ? "text-emerald-300 border-emerald-300/30 group-hover:bg-emerald-500/20 group-hover:border-emerald-300/60"
      : color === "red"
      ? "text-red-300 border-red-300/30 group-hover:bg-red-500/20 group-hover:border-red-300/60"
      : "text-white border-white/20 group-hover:bg-white/20 group-hover:border-white/30";

  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        group flex items-center rounded-xl text-white/90 text-[13px] font-bold
        hover:bg-white/10 hover:text-white
        transition-all duration-200
        ${compact ? "justify-center px-2 py-2 w-full" : "gap-2.5 px-3 py-2 w-full text-left"}
      `}
    >
      <span className={`h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border group-hover:text-white transition-all ${colorClass}`}>
        {icon}
      </span>
      {!compact && <span className="truncate">{label}</span>}
    </button>
  );
}

const base = "w-6 h-6 stroke-current";
const smallBase = "w-5 h-5 stroke-current";

const IconLogo = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path d="M5 20V11" strokeWidth="3" strokeLinecap="round" />
    <path d="M12 20V6" strokeWidth="3" strokeLinecap="round" />
    <path d="M19 20V3" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const IconHome = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9M4 10v10h16V10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IconMoney = () => (<svg className={smallBase} fill="none" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2"/><circle cx="12" cy="12" r="3" strokeWidth="2"/></svg>);
const IconWallet = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M4 7h14a3 3 0 0 1 3 3v8H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" strokeWidth="2"/><path d="M16 13h5" strokeWidth="2"/><path d="M6 7V5h11" strokeWidth="2"/></svg>);
const IconDoc = () => (<svg className={smallBase} fill="none" viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6z" strokeWidth="2"/><path d="M9 12h6M9 16h6" strokeWidth="2"/></svg>);
const IconArrowUp = () => (<svg className={smallBase} fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M12 16V8M8 12l4-4 4 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconArrowDown = () => (<svg className={smallBase} fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M12 8v8M8 12l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconCardTransaction = () => (<svg className={smallBase} fill="none" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2"/><path d="M2 9h20M7 15h4" strokeWidth="2"/></svg>);
const IconBook = () => (<svg className={smallBase} fill="none" viewBox="0 0 24 24"><path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 0V4z" strokeWidth="2"/></svg>);
const IconSettings = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" strokeWidth="2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3.4-.2-.1a1.7 1.7 0 0 0-2 .3l-.1.1-3.4-2-.1-.2a1.7 1.7 0 0 0-1.9-.3H9l-2-3.4.1-.1a1.7 1.7 0 0 0-.3-2v-.2l2-3.4.2.1a1.7 1.7 0 0 0 2-.3h.2l3.4 2 .1.2a1.7 1.7 0 0 0 1.9.3z" strokeWidth="2"/></svg>);
const IconFolder = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M3 6h6l2 2h10v10H3z" strokeWidth="2"/></svg>);
const IconUsers = () => (<svg className={smallBase} fill="none" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><path d="M2 20c0-4 6-4 7-4s7 0 7 4" strokeWidth="2"/></svg>);
const IconBank = () => (<svg className={smallBase} fill="none" viewBox="0 0 24 24"><path d="M3 10h18M5 10v10M9 10v10M15 10v10M19 10v10M12 3l9 5H3l9-5z" strokeWidth="2" strokeLinejoin="round"/></svg>);
const IconChart = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M4 19V5M10 19V9M16 19V13M22 19H2" strokeWidth="2" strokeLinecap="round"/></svg>);
const IconLogout = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M16 17l5-5-5-5M21 12H9M12 19H5V5h7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconCloud = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11-1A4 4 0 0 0 7 18z" strokeWidth="2"/><path d="M12 12v7M9 16l3 3 3-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IconRefresh = () => (<svg className={smallBase} fill="none" viewBox="0 0 24 24"><path d="M4 4v6h6M20 20v-6h-6" strokeWidth="2"/><path d="M20 9A8 8 0 0 0 5 5M4 15a8 8 0 0 0 15 4" strokeWidth="2"/></svg>);
const IconBuilding = () => (<svg className={base} fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" strokeWidth="2"/><path d="M7 7h2M7 11h2M7 15h2M11 7h2M11 11h2M11 15h2" strokeWidth="2"/></svg>);
const IconClipboard = () => (<svg className={smallBase} fill="none" viewBox="0 0 24 24"><rect x="6" y="4" width="12" height="16" rx="2" strokeWidth="2"/><path d="M9 4h6M9 10h6M9 14h6" strokeWidth="2"/></svg>);
const IconCalendar = () => (<svg className={smallBase} fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="2"/><path d="M8 3v4M16 3v4M3 10h18" strokeWidth="2"/></svg>);
const IconBell = () => (<svg className={smallBase} fill="none" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" strokeWidth="2"/><path d="M10 21h4" strokeWidth="2" strokeLinecap="round"/></svg>);
const IconCalculator = () => (<svg className={smallBase} fill="none" viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0" strokeWidth="2" strokeLinecap="round"/></svg>);
