const items = [
  { id: "dashboard", label: "Visão geral" },
  { id: "transactions", label: "Lançamentos" },
  { id: "categories", label: "Categorias" },
  { id: "reports", label: "Relatórios" },
  { id: "settings", label: "Configurações" },
];

export default function Sidebar({ page, setPage }) {
  function logout() {
    localStorage.removeItem("ff_token");
    window.location.reload();
  }

  return (
   
    <aside className="w-64 bg-[#1f5f8b] shadow-lg flex flex-col">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-bold">Finance-Flow</h2>
        <p className="text-xs text-gray-500">Painel pessoal</p>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              page === item.id
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="px-4 py-3 border-t">
        <button
          onClick={logout}
          className="w-full text-left text-sm text-red-600 hover:text-red-700"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
