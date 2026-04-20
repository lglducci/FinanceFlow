    import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";
import ReactECharts from "echarts-for-react";

export default function RelatorioFluxoProjetadpGrafico() {
  const navigate = useNavigate();

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [modo, setModo] = useState("MENSAL");
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const fmtMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  function webhookPorModo() {
    if (modo === "DIARIO") return "fluxo_caixa_projetado_diario";
    return "fluxo_caixa_projetado_agrupado";
  }

  function montarPayload() {
    const payload = {
      empresa_id,
      data_ini: dataIni,
      data_fim: dataFim,
    };

    if (modo !== "DIARIO") {
      payload.tipo = modo;
    }

    return payload;
  }

  async function consultar() {
    setLoading(true);
    setErro("");
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
      setErro("Erro ao carregar gráfico de fluxo de caixa.");
    } finally {
      setLoading(false);
    }
  }

  function trocarModo(novoModo) {
  setModo(novoModo);
  setErro("");
}

 const dadosGrafico = useMemo(() => {
  return dados.map((item) => {
    const label =
      modo === "DIARIO"
        ? formatarData(item.data_ref)
        : item.legenda ||
          `${formatarData(item.periodo_ini)} a ${formatarData(item.periodo_fim)}`;

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
        entradas: 0,
        saidas: 0,
        movimento: 0,
      };
    }

    const entradas = dadosGrafico.reduce(
      (acc, item) => acc + Number(item.entrada || 0),
      0
    );

    const saidas = dadosGrafico.reduce(
      (acc, item) => acc + Number(item.saida || 0),
      0
    );

    return {
      saldoInicial: Number(dadosGrafico[0]?.saldo_inicial || 0),
      saldoFinal: Number(
        dadosGrafico[dadosGrafico.length - 1]?.saldo_final || 0
      ),
      entradas,
      saidas,
      movimento: entradas - saidas,
    };
  }, [dadosGrafico]);
 
  const dadosGraficoRender = useMemo(() => {
  if (modo === "DIARIO") {
    return dadosGrafico.filter((item) => {
      return Number(item.entrada || 0) !== 0 || Number(item.saida || 0) !== 0;
    });
  }

  return dadosGrafico;
}, [dadosGrafico, modo]);

  const option = useMemo(() => {
    return {
      backgroundColor: "#0b1020",

      tooltip: {
        trigger: "axis",
        backgroundColor: "#111827",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        textStyle: { color: "#ffffff" },
        formatter: (params) => {
          const linhas = params.map((p) => {
            const valor = fmtMoeda.format(Number(p.value || 0));
            return `${p.marker} ${p.seriesName}: <b>${valor}</b>`;
          });

          return `<div style="font-weight:700;margin-bottom:8px;color:#fff;">${params?.[0]?.axisValue || ""}</div>${linhas.join("<br/>")}`;
        },
      },
 dataZoom: [
  {
    type: "inside",
    xAxisIndex: 0,
    start: 0,
    end: modo === "DIARIO" ? 25 : 100,
  },
  {
    type: "slider",
    xAxisIndex: 0,
    start: 0,
    end: modo === "DIARIO" ? 25 : 100,
    height: 18,
    bottom: 10,
  },
],
      legend: {
        top: 10,
        icon: "roundRect",
        itemWidth: 18,
        itemHeight: 10,
        textStyle: {
          color: "#e5e7eb",
          fontWeight: 700,
          fontSize: 13,
        },
        data: ["Entradas", "Saídas", "Saldo"],
      },

        grid: {
          left: 20,
          right: 20,
          top: 70,
          bottom: 20,
          containLabel: true,
        },
      xAxis: {
        type: "category",
        data: dadosGraficoRender.map((d) => d.label),
        axisLine: { lineStyle: { color: "#475569" } },
        axisTick: { lineStyle: { color: "#475569" } },
       axisLabel: {
        color: "#cbd5e1",
        fontSize: 11,
        interval: 0,
        rotate: modo === "DIARIO" ? 45 : 0,
      },
      },

    yAxis: [
  {
    type: "value",
    name: "Entradas / Saídas",
    axisLine: { lineStyle: { color: "#475569" } },
    axisTick: { lineStyle: { color: "#475569" } },
    splitLine: {
      lineStyle: {
        color: "rgba(255,255,255,0.08)",
        type: "dashed",
      },
    },
    axisLabel: {
      color: "#cbd5e1",
      formatter: (value) => abreviarValor(value),
    },
  },
  {
    type: "value",
    name: "Saldo",
    axisLine: { lineStyle: { color: "#60a5fa" } },
    axisTick: { lineStyle: { color: "#60a5fa" } },
    splitLine: { show: false },
    axisLabel: {
      color: "#93c5fd",
      formatter: (value) => abreviarValor(value),
    },
  },
],

      series: [
        {
          name: "Entradas",
          type: "bar",
            yAxisIndex: 0,
          data: dadosGraficoRender.map((d) => d.entrada),
          barWidth: modo === "DIARIO" ? 22 : 32,
barMaxWidth: modo === "DIARIO" ? 22 : 32,
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#4ade80" },
                { offset: 1, color: "#15803d" },
              ],
            },
            borderRadius: [10, 10, 0, 0],
            shadowBlur: 18,
            shadowColor: "rgba(74,222,128,0.35)",
          },
        },
        {
          name: "Saídas",
          type: "bar",
           yAxisIndex: 0,
          data: dadosGraficoRender.map((d) => d.saida),
          barMaxWidth: 28,
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#fb7185" },
                { offset: 1, color: "#be123c" },
              ],
            },
            borderRadius: [10, 10, 0, 0],
            shadowBlur: 18,
            shadowColor: "rgba(251,113,133,0.35)",
          },
        },
        {
          name: "Saldo",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          data: dadosGraficoRender.map((d) => d.saldo_final),
          symbol: "circle",
          symbolSize: 10,
          lineStyle: {
            width: 5,
            color: "#60a5fa",
            shadowBlur: 12,
            shadowColor: "rgba(96,165,250,0.35)",
          },
          itemStyle: {
            color: "#60a5fa",
            borderColor: "#ffffff",
            borderWidth: 2,
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(96,165,250,0.28)" },
                { offset: 1, color: "rgba(96,165,250,0.03)" },
              ],
            },
          },
        },
      ],

      animationDuration: 1200,
      animationEasing: "cubicOut",
    };
  }, [dadosGraficoRender, fmtMoeda]);

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      <div className="max-w-[1500px] mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm px-6 py-6">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  Fluxo de Caixa Projetado
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Visualização de entradas, saídas e saldo acumulado
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={consultar}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 shadow-sm transition"
                >
                  Consultar
                </button>

                <button
                  onClick={() => navigate("/reports")}
                  className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-5 py-3 transition"
                >
                  Voltar
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-end">
              <CampoData
                label="Data inicial"
                value={dataIni}
                onChange={setDataIni}
              />

              <CampoData
                label="Data final"
                value={dataFim}
                onChange={setDataFim}
              />

              <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold text-slate-600">
                  Agrupamento
                </div>
                <div className="flex flex-wrap gap-2">
                  {["DIARIO", "7D", "15D", "MENSAL"].map((m) => {
                    const ativo = modo === m;
                    return (
                      <button
                        key={m}
                        onClick={() => trocarModo(m)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${
                          ativo
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-300 hover:border-blue-300 hover:text-blue-700"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-8">
            <CardMovimento
              entradas={resumo.entradas}
              saidas={resumo.saidas}
              movimento={resumo.movimento}
              saldoInicial={resumo.saldoInicial}
            />
          </div>

          <div className="xl:col-span-4">
            <CardSaldoFinal valor={resumo.saldoFinal} />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">
                Evolução do caixa
              </h2>
              <p className="text-sm text-slate-500">
                Entradas, saídas e saldo final por período
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <span className="inline-flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                Entradas
              </span>
              <span className="inline-flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                Saídas
              </span>
              <span className="inline-flex items-center gap-2 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                Saldo
              </span>
            </div>
          </div>

          {loading ? (
            <div className="h-[560px] flex items-center justify-center text-blue-600 font-bold">
              Carregando...
            </div>
          ) : erro ? (
            <div className="h-[560px] flex items-center justify-center text-red-600 font-bold">
              {erro}
            </div>
          ) : dadosGrafico.length === 0 ? (
            <div className="h-[560px] flex items-center justify-center text-slate-500 font-semibold">
              Nenhum dado carregado.
            </div>
          ) : (
            <div className="w-full">
               <div
                    style={{
                      width: "100%",
                      height: 560,
                    }}
                  >
                <ReactECharts
                  option={option}
                  style={{ width: "100%", height: "100%" }}
                  notMerge={true}
                  lazyUpdate={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CampoData({ label, value, onChange }) {
  return (
    <div className="flex flex-col min-w-[180px]">
      <label className="text-sm font-semibold text-slate-600 mb-2">
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-700 shadow-sm outline-none focus:border-blue-500"
      />
    </div>
  );
}

function formatarData(d) {
  if (!d) return "";
  const txt = String(d).slice(0, 10);
  const [ano, mes, dia] = txt.split("-");
  return `${dia}/${mes}/${ano}`;
}

function abreviarValor(v) {
  const n = Number(v || 0);
  if (Math.abs(n) >= 1000000) return `R$ ${(n / 1000000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000) return `R$ ${(n / 1000).toFixed(0)}k`;
  return `R$ ${n.toFixed(0)}`;
}

function CardMovimento({ entradas, saidas, movimento, saldoInicial }) {
  const fmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const positivo = Number(movimento) >= 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 h-full">
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Resumo do período
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">
            Movimento financeiro
          </div>
        </div>
        <div
          className={`rounded-3xl shadow-sm p-6 h-full flex flex-col justify-between border overflow-hidden ${
            positivo
              ? "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 border-emerald-400 text-white"
              : "bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 border-rose-400 text-white"
          }`}
        >
          {positivo ? "Resultado positivo" : "Resultado negativo"}
        </div>
      </div>

      <div className="mb-6 rounded-2xl bg-slate-50 border border-slate-200 p-5">
        <div className="text-sm text-slate-500 font-semibold">
          Saldo inicial
        </div>
        <div className="text-4xl font-extrabold text-slate-800 mt-2 tracking-tight">
          {fmt.format(Number(saldoInicial || 0))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniCard
          titulo="Entradas"
          valor={fmt.format(Number(entradas || 0))}
          fundo="bg-gradient-to-br from-rose-500/15 via-red-500/10 to-orange-500/15"
          tituloCor="text-emerald-700"
          valorCor="text-emerald-700"
        />

        <MiniCard
          titulo="Saídas"
          valor={fmt.format(Number(saidas || 0))}
          fundo="bg-gradient-to-br from-rose-500/15 via-red-500/10 to-orange-500/15"
          tituloCor="text-rose-700"
          valorCor="text-rose-700"
        />

        <MiniCard
          titulo="Resultado líquido"
          valor={fmt.format(Number(movimento || 0))}
          fundo={
            positivo
              ? "bg-gradient-to-br from-blue-500/15 via-sky-500/10 to-cyan-500/15"
              : "bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-yellow-500/15"
          }
          tituloCor={positivo ? "text-blue-700" : "text-amber-700"}
          valorCor={positivo ? "text-blue-700" : "text-amber-700"}
        />
      </div>
    </div>
  );
}

function MiniCard({ titulo, valor, fundo, tituloCor, valorCor }) {
  return (
    <div
      className={`rounded-2xl p-5 border border-slate-200/70 shadow-sm backdrop-blur-sm ${fundo}`}
    >
      <div className={`text-sm font-semibold ${tituloCor}`}>{titulo}</div>
      <div className={`text-2xl font-extrabold mt-2 tracking-tight ${valorCor}`}>
        {valor}
      </div>
    </div>
  );
}

function CardSaldoFinal({ valor }) {
  const fmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const positivo = Number(valor) >= 0;

  return (
    <div
      className={`rounded-3xl shadow-sm p-6 h-full flex flex-col justify-between border overflow-hidden ${
        positivo
          ? "bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 border-teal-500 text-white"
          : "bg-gradient-to-br from-rose-600 via-red-600 to-orange-600 border-red-500 text-white"
      }`}
    >
      <div>
        <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
          Fechamento
        </div>
        <div className="text-2xl font-extrabold mt-2">
          Saldo final do período
        </div>
      </div>

      <div className="my-8">
        <div className="text-5xl font-extrabold tracking-tight leading-none">
          {fmt.format(Number(valor || 0))}
        </div>
      </div>

      <div className="text-sm text-white/85">
        Resultado acumulado até a data final selecionada
      </div>
    </div>
  );
}
