 import { useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";

export default function DashboardContabil() {
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa") ||
    "0";

  const [dataIni, setDataIni] = useState(hojeMaisDias(-30));
  const [dataFim, setDataFim] = useState(hojeLocal());

  const [balanco, setBalanco] = useState([]);
  const [dre, setDre] = useState([]);
  const [historico, setHistorico] = useState([]);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function somarGrupo(lista, grupo) {
    return lista
      .filter((l) => l.grupo === grupo)
      .reduce((s, l) => s + Number(l.saldo || 0), 0);
  }

  function diferencaDias(dataIni, dataFim) {
    if (!dataIni || !dataFim) return 0;
    const inicio = new Date(dataIni);
    const fim = new Date(dataFim);
    const diffMs = fim - inicio;
    return Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 0);
  }

  const diasPeriodo = diferencaDias(dataIni, dataFim);

  const totalAtivo = somarGrupo(balanco, "ATIVO");
  const totalPassivo = somarGrupo(balanco, "PASSIVO");
  const totalPL = somarGrupo(balanco, "PATRIMONIO LIQUIDO");
  const resultadoLiquido =
    dre.find((l) => l.grupo === "RESULTADO_LIQUIDO")?.valor_periodo || 0;

  const ativosNegativos = balanco.filter(
    (l) => l.grupo === "ATIVO" && Number(l.saldo) < 0
  );

  const passivosInvertidos = balanco.filter(
    (l) => l.grupo === "PASSIVO" && Number(l.saldo) > 0
  );

  const historicoFormatado = historico.map((h) => ({
    ...h,
    mes_ano: `${String(h.mes).padStart(2, "0")}/${h.ano}`,
  }));

  async function carregar() {
    try {
      setLoading(true);
      setErro("");

      const [respDre, respBalanco, respHistorico] = await Promise.all([
        fetch(buildWebhookUrl("der"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id,
            data_ini: dataIni,
            data_fim: dataFim,
          }),
        }),
        fetch(buildWebhookUrl("balanco"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id,
            data_corte: dataFim,
          }),
        }),
        fetch(buildWebhookUrl("historico_apuracao"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id,
          }),
        }),
      ]);

      const jsonDre = await respDre.json();
      const jsonBalanco = await respBalanco.json();
      const jsonHistorico = await respHistorico.json();

      setDre(Array.isArray(jsonDre) ? jsonDre : []);
      setBalanco(Array.isArray(jsonBalanco) ? jsonBalanco : []);
      setHistorico(Array.isArray(jsonHistorico) ? jsonHistorico : []);
    } catch (e) {
      console.error(e);
      setErro("Erro ao carregar dashboard.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-blue-100 min-h-screen">
      <div className="bg-white text-blue-900 rounded-xl p-6 mb-6 shadow">
        <h1 className="text-2xl font-bold">📊 Dashboard Contábil</h1>

        <div className="text-blue-900 font-bold text-base px-3 py-2 rounded-lg mt-2">
          Período: {diasPeriodo} dias
        </div>

        <div className="flex gap-4 mt-4 flex-wrap">
          <input
            type="date"
            className="input-premium"
            value={dataIni}
            onChange={(e) => setDataIni(e.target.value)}
          />
          <input
            type="date"
            className="input-premium"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
          <button
            onClick={carregar}
            className="px-5 py-2 rounded-full font-bold text-sm tracking-wide text-white bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800 border-2 border-black shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-200 inline-flex items-center gap-2"
          >
            Atualizar
          </button>
        </div>

        {erro && (
          <div className="mt-4 text-red-700 font-semibold">{erro}</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Kpi titulo="Ativo" valor={formatarMoeda(totalAtivo)} cor="blue" />
        <Kpi titulo="Passivo" valor={formatarMoeda(totalPassivo)} cor="red" />
        <Kpi titulo="Patrimônio Líquido" valor={formatarMoeda(totalPL)} cor="green" />
        <Kpi titulo="Resultado Líquido" valor={formatarMoeda(resultadoLiquido)} cor="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AlertaCard
          titulo="Ativos negativos"
          valor={ativosNegativos.length}
          detalhe={ativosNegativos.length > 0 ? "Verificar saldos invertidos" : "Nenhum problema"}
          cor={ativosNegativos.length > 0 ? "red" : "green"}
        />
        <AlertaCard
          titulo="Passivos invertidos"
          valor={passivosInvertidos.length}
          detalhe={passivosInvertidos.length > 0 ? "Verificar passivos devedores" : "Nenhum problema"}
          cor={passivosInvertidos.length > 0 ? "red" : "green"}
        />
        <AlertaCard
          titulo="Diferença Ativo - Passivo - PL"
          valor={formatarMoeda(totalAtivo - totalPassivo - totalPL)}
          detalhe="Idealmente deve ser zero"
          cor={Number(totalAtivo - totalPassivo - totalPL) === 0 ? "green" : "yellow"}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <Card titulo="Demonstração do Resultado (DRE)">
          {dre.length === 0 ? (
            <p className="text-gray-500">Sem dados.</p>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dre}>
                  <XAxis dataKey="grupo" />
                  <YAxis tickFormatter={(v) => Number(v).toLocaleString("pt-BR")} />
                  <Tooltip
                    formatter={(v) =>
                      Number(v).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    }
                  />
                  <Bar dataKey="valor_periodo" radius={[4, 4, 0, 0]}>
                    {dre.map((entry, index) => {
                      let cor = "#061f4aff";
                      if (entry.grupo?.includes("RECEITA")) cor = "#16a34a";
                      if (entry.grupo?.includes("CUSTO")) cor = "#dc2626";
                      if (entry.grupo?.includes("DESPESA")) cor = "#f59e0b";
                      if (entry.grupo?.includes("RESULTADO_BRUTO")) cor = "#2563eb";
                      if (entry.grupo?.includes("RESULTADO_OPERACIONAL")) cor = "#0ea5e9";
                      if (entry.grupo?.includes("RESULTADO_LIQUIDO")) cor = "#7c3aed";
                      return <Cell key={index} fill={cor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card titulo="Evolução do Resultado">
          {historicoFormatado.length === 0 ? (
            <p className="text-gray-500">Sem dados.</p>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicoFormatado}>
                  <XAxis dataKey="mes_ano" />
                  <YAxis
                    tickFormatter={(v) =>
                      Number(v).toLocaleString("pt-BR", {
                        maximumFractionDigits: 0,
                      })
                    }
                  />
                  <Tooltip
                    formatter={(v) =>
                      Number(v).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="resultado"
                    stroke="#061f4aff"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {loading && (
        <div className="text-center text-blue-700 font-bold">Carregando...</div>
      )}
    </div>
  );
}

function Kpi({ titulo, valor, cor }) {
  const cores = {
    blue: "border-l-8 border-blue-400 bg-blue-50",
    red: "border-l-8 border-red-500 bg-red-50",
    green: "border-l-8 border-green-500 bg-green-50",
    purple: "border-l-8 border-purple-500 bg-purple-50",
  };

  return (
    <div className={`rounded-xl shadow p-4 ${cores[cor] || "bg-white"}`}>
      <p className="text-sm text-gray-600">{titulo}</p>
      <p className="text-2xl font-bold">{valor ?? "0,00"}</p>
    </div>
  );
}

function AlertaCard({ titulo, valor, detalhe, cor }) {
  const cores = {
    red: "border-l-8 border-red-500 bg-red-50 text-red-900",
    green: "border-l-8 border-green-500 bg-green-50 text-green-900",
    yellow: "border-l-8 border-yellow-500 bg-yellow-50 text-yellow-900",
  };

  return (
    <div className={`rounded-xl shadow p-4 ${cores[cor] || "bg-white"}`}>
      <p className="text-sm font-semibold">{titulo}</p>
      <p className="text-2xl font-bold mt-1">{valor}</p>
      <p className="text-sm mt-2">{detalhe}</p>
    </div>
  );
}

function Card({ titulo, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-[#061f4aff]">{titulo}</h2>
      {children}
    </div>
  );
}