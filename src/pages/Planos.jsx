import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Planos() {
  const [planos, setPlanos] = useState([]);
  const [periodo, setPeriodo] = useState("mensal");

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("planos")
        .select("*")
        .eq("ativo", true)
        .order("valor_mensal");

      if (!error) setPlanos(data || []);
    }

    carregar();
  }, []);

  function calcularValor(plano) {
    const base = plano.valor_mensal;

    if (periodo === "semestral") return base * 6 * 0.9;
    if (periodo === "anual") return base * 12 * 0.8;
    return base;
  }

  function labelPeriodo() {
    if (periodo === "semestral") return " / 6 meses";
    if (periodo === "anual") return " / ano";
    return " / mês";
  }

  return (
    <div className="min-h-screen bg-bgSoft px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-4">
        Escolha seu plano
      </h1>

      <p className="text-center text-gray-600 mb-8">
        Economize escolhendo planos semestrais ou anuais
      </p>

      {/* TOGGLE */}
      <div className="flex justify-center mb-10 gap-2">
        {["mensal", "semestral", "anual"].map(p => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded-lg border ${
              periodo === p
                ? "bg-[#0b2453] text-white"
                : "bg-white"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* PLANOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {planos.map(plano => (
          <div
            key={plano.id}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <h2 className="text-xl font-bold mb-1">{plano.nome}</h2>
            <p className="text-sm text-gray-600 mb-4">
              {plano.descricao}
            </p>

            <div className="text-3xl font-bold text-[#0b2453] mb-2">
              R$ {calcularValor(plano).toFixed(2)}
              <span className="text-sm font-normal text-gray-600">
                {labelPeriodo()}
              </span>
            </div>

            <ul className="text-sm text-gray-700 mb-6 space-y-1">
              <li>✔ Até {plano.limite_empresas} empresas</li>
              <li>✔ Até {plano.limite_usuarios} usuários</li>
              <li>✔ Relatórios completos</li>
            </ul>

            <button
              className="w-full bg-[#0b2453] text-white py-2 rounded-lg"
              onClick={() =>
                alert(
                  `Plano ${plano.nome} - ${periodo}`
                )
              }
            >
              Assinar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
