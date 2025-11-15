 export default function Header() {
  return (
    <header className="h-16 border-b flex items-center justify-between px-6 bg-[#5f5c5d]">
      <div>
        <h1 className="text-lg font-semibold text-white">Finance-Flow</h1>
        <p className="text-xs text-gray-200">
          Acompanhamento rápido das suas finanças.
        </p>
      </div>
      <div className="text-sm text-gray-200">
        {new Date().toLocaleDateString("pt-BR")}
      </div>
    </header>
  );
}
