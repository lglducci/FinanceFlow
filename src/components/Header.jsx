export default function Header() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold">Finance-Flow</h1>
        <p className="text-xs text-gray-500">
          Acompanhamento rápido das suas finanças.
        </p>
      </div>
      <div className="text-sm text-gray-500">
        {new Date().toLocaleDateString("pt-BR")}
      </div>
    </header>
  );
}
