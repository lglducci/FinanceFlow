 export default function Header() {
  return (
    <header className="h-24 border-b flex items-center justify-between px-6 bg-[#061f4aff]">
      <div>
          <h1 className="text-lg font-bold text-white leading-tight mt-3">
            Dashboard
          </h1>
         <p className="text-sm text-gray-200 leading-tight">
          Acompanhamento rápido da sua Contabilidade.
        </p>
      </div>
      <div className="text-base text-white  pt-8">
        {new Date().toLocaleDateString("pt-BR")}
      </div>
    </header>
  );
}

 