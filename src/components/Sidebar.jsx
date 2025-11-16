 import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("ff_token");
    window.location.reload();
  }

  const grupos = [
    {
      titulo: "Visão geral",
      itens: [
        { id: "/dashboard", label: "Visão geral" },
      ],
    },

    {
      titulo: "Movimentações",
      itens: [
        { id: "/transactions", label: "Lançamentos" },
      ],
    },

    {
      titulo: "Consultas",
      itens: [
        { id: "/saldos-por-conta", label: "Saldos por conta" },
        { id: "/consulta-cartao", label: "Transações cartão" },
      ],
    },

    {
      titulo: "Cadastros",
      itens: [
        { id: "/cards", label: "Cartões" },
        { id: "/accounts", label: "Contas financeiras" },
        { id: "/categories", label: "Categorias" },
      ],
    },

    {
      titulo: "Configurações",
      itens: [
        { id: "/settings", label: "Configurações" },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#3862b7] shadow-lg flex flex-col">
      <div className="px-6 py-4 border-b border-blue-800/40">
        <h2 className="text-xl font-bold text-white">Finance-Flow</h2>
        <p className="text-xs text-blue-100">Painel pessoal</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4">
        {grupos.map((grupo, idx) => (
          <div key={idx}>
            <p className="text-white/70 text-xs font-bold uppercase mb-1">
              {grupo.titulo}
            </p>

            {grupo.itens.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-[#245f90]"
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
