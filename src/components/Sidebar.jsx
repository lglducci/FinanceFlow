 import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("ff_token");
    window.location.reload();
  }

  const items = [
    { id: "/dashboard", label: "Visão geral" },
    { id: "/lancamentos", label: "Lançamentos" },
    { id: "/categorias", label: "Categorias" },
    { id: "/relatorios", label: "Relatórios" },
    { id: "/configuracoes", label: "Configurações" },
  ];

  return (
    <aside className="w-64 bg-[#3862b7] shadow-lg flex flex-col">
      <div className="px-6 py-4 border-b border-blue-800/40">
        <h2 className="text-xl font-bold text-white">Finance-Flow</h2>
        <p className="text-xs text-blue-100">Painel pessoal</p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-[#245f90]"
          >
            {item.label}
          </button>
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
