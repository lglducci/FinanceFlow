 export default function Header() {
  return (
    <header className="h-24 border-b flex items-left justify-between px-10 bg-[#061f4aff]">
      <div>
        <h1 className="text-xl font-bold text-white pt-8">Finance-Flow</h1>
        <p className="text- base  text-gray-100">
          Acompanhamento rápido das suas finanças.
        </p>
      </div>
      <div className="text-base text-white  pt-8">
        {new Date().toLocaleDateString("pt-BR")}
      </div>
    </header>
  );
}
