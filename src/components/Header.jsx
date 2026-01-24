 import { useApp } from "../context/AppContext";

export default function Header() {
  const { empresa, usuario, documento, tipo, loading } = useApp();
  if (loading) return null;

  return (
    <header className="h-24 border-b bg-[#061f4a] px-5 flex items-center justify-between">

      {/* BLOCO ESQUERDO – EMPRESA + USUÁRIO */}
      <div className="flex gap-8">

        {/* EMPRESA */}
        <div>
          <div className="text-xs uppercase text-gray-300 font-semibold">
            Empresa
          </div>

          <div className="text-white font-bold text-lg leading-tight">
            {empresa}
          </div>
           <div className="text-sm text-gray-200 leading-tight">
                {tipo}{" \u00A0"}·{" \u00A0"}CNPJ:{" \u00A0"}{documento}
              </div>


        </div>

        {/* USUÁRIO */}
        <div>
          <div className="text-xs uppercase text-gray-300 font-semibold">
            Usuário
          </div>

          <div className="text-white font-bold leading-tight">
            {usuario}
          </div>

          <div className="text-sm text-gray-200 leading-tight">
            {usuario?.email}
          </div>
        </div>
      </div>

      {/* BLOCO DIREITO – DATA */}
      <div className="text-sm text-gray-200 self-start pt-6">
        {new Date().toLocaleDateString("pt-BR")}
      </div>

    </header>
  );
}
