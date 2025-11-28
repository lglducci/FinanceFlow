 export default function Header() {
  return (
    <header className="h-32 border-b flex items-center justify-between px-8 bg-[#3862b7]">
      <div>
        <h1 className="text-lg font-bold text-white">Finance-Flow</h1>
        <p className="text- base  text-gray-100">
          Acompanhamento rápido das suas finanças.
        </p>
      </div>
      <div className="text-sm text-gray-400">
        {new Date().toLocaleDateString("pt-BR")}
      </div>
    </header>
  );
}
