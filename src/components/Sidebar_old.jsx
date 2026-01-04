 import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("ff_token");
    window.location.reload();
  }

 const menu = [
  {
    grupo: "Financeiro",
    itens: [
      { label: "Lançamentos", path: "/transactions" },
      { label: "Contas Financeiras", path: "/saldos" },
      { label: "Contas a Pagar", path: "/contas-pagar" },
      { label: "Contas a Receber", path: "/contas-receber" },
    ],
  },
  {
    grupo: "Cartões",
    itens: [
      { label: "Cartões", path: "/cards" },
      { label: "Faturas", path: "/faturas-cartao" },
      { label: "Transações Cartão", path: "/cartao-transacoes" },
    ],
  },
  {
    grupo: "Contábil",
    itens: [
      { label: "Diário Contábil", path: "/diario" },
      { label: "Importação Diário", path: "/importar-diario" },
      { label: "Mapeamento Contábil", path: "/mapeamento-contabil" },
      { label: "Contas Contábeis", path: "/contascontabeis" },
    ],
  },
  {
    grupo: "Cadastros",
    itens: [
      { label: "Fornecedores / Clientes", path: "/providers-clients" },
      { label: "Categorias Gerenciais", path: "/contasgerenciais" },
    ],
  },
  {
    grupo: "Relatórios",
    itens: [
      { label: "Relatórios", path: "/reports" },
    ],
  },
];

  return (


    <aside className="w-64 bg-[#3862b7] shadow-lg flex flex-col">
      <div className="px-6 py-4 border-b border-blue-800/40">
        <h2 className="text-xl font-bold text-white">Finance-Flow</h2>
        <p className="text-xs text-blue-100">Painel pessoal</p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-4">
        {menu.map((secao) => (
          <div key={secao.grupo}>
            <div className="px-3 py-1 text-xs font-bold text-blue-200 uppercase">
              {secao.grupo}
            </div>

            {secao.itens.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="
                  w-full text-left px-3 py-2 rounded-lg text-base
                  text-white/80 hover:bg-blue-600/30
                "
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>


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
