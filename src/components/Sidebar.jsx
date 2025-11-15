 
const items = [
  { id: "dashboard", label: "Visão geral" },
  { id: "transactions", label: "Lançamentos" },
  { id: "categories", label: "Categorias" },
  { id: "reports", label: "Relatórios" },
  { id: "settings", label: "Configurações" }, 
  { id: "settings", label: "teste" },t
  { id: "settings", label: "teste2" },
];

export default function Sidebar({ page, setPage }) {
  function logout() {
    localStorage.removeItem("ff_token");
    window.location.reload();
  }

  return (
 <aside className="w-64 bg-[#1f5f8b] shadow-lg flex flex-col">
  <div className="px-6 py-4 border-b border-blue-800/40">
    <h2 className="text-xl font-bold text-white">Finance-Flow</h2>
    <p className="text-xs text-blue-100">Painel pessoal</p>
  </div>

  <nav className="flex-1 px-2 py-4 space-y-1">
    {items.map((item) => (
      <button
        key={item.id}
        onClick={() => setPage(item.id)}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
          page === item.id
            ? "bg-white text-[#1f5f8b]"
            : "text-white/80 hover:bg-[#245f90]"
        }`}
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
