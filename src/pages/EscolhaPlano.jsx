 import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function EscolhaPlano() {
  const [planos, setPlanos] = useState([]);
  const [periodo, setPeriodo] = useState("Mensal");
  const [podeEscolher, setPodeEscolher] = useState(false); // depois será ligado pelo trial
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      setLoading(true);

      // 1️⃣ buscar perfil CONTABIL (schema correto)
      const { data: perfil, error: errPerfil } = await supabase
        .schema("public")
        .from("perfis")
        .select("id")
        .eq("codigo", "CONTABIL")
        .single();

      if (errPerfil || !perfil) {
        console.error("Perfil CONTABIL não encontrado", errPerfil);
        setLoading(false);
        return;
      }

      // 2️⃣ buscar planos do perfil
      const { data: planosData, error: errPlanos } = await supabase
        .schema("saas_vendas")
        .from("planos")
        .select("*")
        .eq("ativo", true)
        .eq("perfil_id", perfil.id)
        .order("valor_mensal");

      if (errPlanos) {
        console.error("Erro ao buscar planos", errPlanos);
        setPlanos([]);
      } else {
        setPlanos(planosData || []);
      }

      // 3️⃣ depois você liga isso via trial
      setPodeEscolher(false);

      setLoading(false);
    }

    carregar();
  }, []);

  const planosFiltrados = planos.filter(
    (plano) => plano.nome === periodo
  );

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-12">
      <h1 className="text-2xl font-bold text-center mb-2">
        Escolha seu plano
      </h1>

      <p className="text-center text-gray-700 mb-8">
        Os valores abaixo serão liberados após o período de teste.
      </p>

      {/* TOGGLE */}
      <div className="flex justify-center gap-2 mb-10">
        {["Mensal", "Semestral", "Anual"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
              periodo === p
                ? "bg-[#0F172A] text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      {loading ? (
        <p className="text-center text-gray-500">
          Carregando planos...
        </p>
      ) : planosFiltrados.length === 0 ? (
        <p className="text-center text-red-500">
          Nenhum plano disponível para este período.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
          {planosFiltrados.map((plano) => (
            <div
              key={plano.id}
              className="bg-[#0F172A] text-white rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold mb-2">
                Plano {plano.nome}
              </h2>

              <p className="text-sm opacity-80 mb-4">
                {plano.descricao}
              </p>

              <div className="text-3xl font-extrabold mb-1">
                R$ {Number(plano.valor_mensal).toFixed(2)}
              </div>

              <div className="text-xs opacity-70 mb-6">
                cobrança {plano.nome.toLowerCase()}
              </div>

              <ul className="text-sm space-y-1 mb-6">
                <li>✔ Até {plano.limite_empresas} empresas</li>
                <li>✔ Até {plano.limite_usuarios} usuários</li>
                <li>✔ Relatórios completos</li>
              </ul>

              <button
                disabled={!podeEscolher}
                className={`w-full py-2 rounded-xl font-semibold transition ${
                  podeEscolher
                    ? "bg-white text-[#0F172A] hover:opacity-90"
                    : "bg-gray-400 text-gray-700 cursor-not-allowed"
                }`}
              >
                {podeEscolher
                  ? "Escolher este plano"
                  : "Disponível após o teste"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
