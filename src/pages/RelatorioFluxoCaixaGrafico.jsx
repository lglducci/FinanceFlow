import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
} from "recharts";

export default function RelatorioFluxoCaixaGrafico() {
  const navigate = useNavigate();

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [modo, setModo] = useState("DIARIO"); // DIARIO | 7D | 15D | MENSAL
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  const fmtMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  function webhookPorModo() {
    if (modo === "DIARIO") return "gera_fluxo_caixa_grafico_diario";
    return "gera_fluxo_caixa_grafico_agrupado";
  }

  function montarPayload() {
    const payload = {
      empresa_id,
      data_ini: dataIni,
      data_fim: dataFim,
    };

    if (modo !== "DIARIO") {
      payload.tipo = modo; // 7D | 15D | MENSAL
    }

    return payload;
  }

  async function consultar() {
    setLoading(true);
    setDados([]);

    try {
      const resp = await fetch(buildWebhookUrl(webhookPorModo()), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(montarPayload()),
      });

      const json = await resp.json();
      const lista = Array.isArray(json) ? json : [json];
      setDados(lista);
    } catch (e) {
      alert("Erro ao carregar gráfico de fluxo de caixa");
    } finally {
      setLoading(false);
    }
  }

  function trocarModo(novoModo) {
    setModo(novoModo);
    setDados([]);
  }

  const dadosGrafico = useMemo(() => {
    return dados.map((item) => {
      const label =
        modo === "DIARIO"
          ? formatarData(item.data_ref)
          : item.legenda || `${formatarData(item.periodo_ini)} a ${formatarData(item.periodo_fim)}`;

      return {
        ...item,
        label,
        entrada: Number(item.entrada || 0),
        saida: Number(item.saida || 0),
        saldo_inicial: Number(item.saldo_inicial || 0),
        saldo_final: Number(item.saldo_final || 0),
      };
    });
  }, [dados, modo]);

  const resumo = useMemo(() => {
    if (!dadosGrafico.length) {
      return {
        saldoInicial: 0,
        saldoFinal: 0,
      };
    }

    return {
      saldoInicial: Number(dadosGrafico[0]?.saldo_inicial || 0),
      saldoFinal: Number(dadosGrafico[dadosGrafico.length - 1]?.saldo_final || 0),
    };
  }, [dadosGrafico]);

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-blue-800 mb-4">
        <h1 className="text-2xl font-bold mb-4">📊 Fluxo de Caixa Realizado Gráfico</h1>

        <div className="flex gap-4 items-end mb-4 flex-wrap">
          <div className="flex flex-col">
            <label className="font-bold text-[#1e40af]">Data inicial</label>
            <input
              type="date"
              value={dataIni}
              onChange={(e) => setDataIni(e.target.value)}
              className="border rounded px-3 py-2 border-yellow-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-bold text-[#1e40af]">Data final</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border rounded px-3 py-2 border-yellow-500"
            />
          </div>

          <button
            onClick={consultar}
            className="bg-blue-600 text-white px-6 py-2 rounded font-bold"
          >
            Consultar
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="bg-gray-500 text-white px-4 py-2 rounded font-bold"
          >
            Voltar
          </button>
        </div>

        <div className="flex gap-6 mt-2 flex-wrap">
          {["DIARIO", "7D", "15D", "MENSAL"].map((m) => (
            <label key={m} className="flex items-center gap-2 font-bold">
              <input
                type="radio"
                name="modo_fluxo_grafico"
                checked={modo === m}
                onChange={() => trocarModo(m)}
              />
              {m}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <CardResumo titulo="Saldo Inicial" valor={resumo.saldoInicial} />
        <CardResumo titulo="Saldo Final" valor={resumo.saldoFinal} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow p-4">
        {loading ? (
          <div className="p-6 text-center text-blue-600 font-bold">Carregando...</div>
        ) : dadosGrafico.length === 0 ? (
          <div className="p-6 text-center text-gray-500 font-semibold">
            Nenhum dado carregado.
          </div>
        ) : (
          <div style={{ width: "100%", height: 460 }}>
             <ResponsiveContainer>
                <ComposedChart
                  data={dadosGrafico}
                  barCategoryGap="28%"
                  margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                  
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#374151", fontSize: 12 }}
                    axisLine={{ stroke: "#9ca3af" }}
                    tickLine={{ stroke: "#9ca3af" }}
                  />

                  <YAxis
                    tick={{ fill: "#374151", fontSize: 12 }}
                    axisLine={{ stroke: "#9ca3af" }}
                    tickLine={{ stroke: "#9ca3af" }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: 10,
                    }}
                    formatter={(value, name) => [
                      fmtMoeda.format(Number(value || 0)),
                      nomeSerie(name),
                    ]}
                  />

                  <Legend formatter={nomeSerie} />

                  <Bar
                    dataKey="entrada"
                    name="entrada"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={22}
                  />

                  <Bar
                    dataKey="saida"
                    name="saida"
                    fill="#dc2626"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={22}
                  />

                  <Line
                    type="monotone"
                    dataKey="saldo_final"
                    name="saldo_final"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function formatarData(d) {
  if (!d) return "";
  const txt = String(d).slice(0, 10);
  const [ano, mes, dia] = txt.split("-");
  return `${dia}/${mes}/${ano}`;
}

function nomeSerie(chave) {
  if (chave === "entrada") return "Entrada";
  if (chave === "saida") return "Saída";
  if (chave === "saldo_final") return "Saldo";
  return chave;
}

function CardResumo({ titulo, valor }) {
  const fmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="bg-gray-100 border-4 border-blue-800 rounded-xl p-4 text-center">
      <div className="text-sm font-bold text-gray-600">{titulo}</div>
      <div className="text-2xl font-bold text-blue-900">
        {fmt.format(Number(valor || 0))}
      </div>
    </div>
  );
}