 
 
 
 import { useMemo } from "react";
import ReactECharts from "echarts-for-react";

export default function RelatorioFluxoProjetadpGrafico() {
  const dadosFixos = [
    { label: "01/04", entrada: 12000, saida: 4500, saldo_final: 7500 },
    { label: "02/04", entrada: 8000, saida: 5200, saldo_final: 10300 },
    { label: "03/04", entrada: 9500, saida: 6100, saldo_final: 13700 },
    { label: "04/04", entrada: 7000, saida: 4800, saldo_final: 15900 },
    { label: "05/04", entrada: 11000, saida: 5400, saldo_final: 21500 },
    { label: "06/04", entrada: 6000, saida: 3500, saldo_final: 24000 },
  ];

  const fmtMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const option = useMemo(() => ({
    backgroundColor: "#0b1020",
    tooltip: {
      trigger: "axis",
      backgroundColor: "#111827",
      borderColor: "#374151",
      borderWidth: 1,
      textStyle: { color: "#ffffff" },
      formatter: (params) => {
        const linhas = params.map((p) => {
          const valor = fmtMoeda.format(Number(p.value || 0));
          return `${p.marker} ${p.seriesName}: <b>${valor}</b>`;
        });

        return `<div style="font-weight:700;margin-bottom:8px;color:#fff;">${params?.[0]?.axisValue || ""}</div>${linhas.join("<br/>")}`;
      },
    },
    legend: {
      top: 10,
      textStyle: { color: "#e5e7eb", fontWeight: 700 },
      data: ["Entradas", "Saídas", "Saldo"],
    },
    grid: {
      left: 20,
      right: 20,
      top: 60,
      bottom: 20,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dadosFixos.map((d) => d.label),
      axisLine: { lineStyle: { color: "#475569" } },
      axisLabel: { color: "#cbd5e1" },
    },
    yAxis: [
      {
        type: "value",
        axisLine: { lineStyle: { color: "#475569" } },
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
        axisLine: { lineStyle: { color: "#60a5fa" } },
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
        data: dadosFixos.map((d) => d.entrada),
        barWidth: 28,
        itemStyle: {
          color: "#22c55e",
          borderRadius: [8, 8, 0, 0],
        },
      },
      {
        name: "Saídas",
        type: "bar",
        yAxisIndex: 0,
        data: dadosFixos.map((d) => d.saida),
        barWidth: 28,
        itemStyle: {
          color: "#f43f5e",
          borderRadius: [8, 8, 0, 0],
        },
      },
      {
        name: "Saldo",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: dadosFixos.map((d) => d.saldo_final),
        symbol: "circle",
        symbolSize: 8,
        lineStyle: {
          width: 4,
          color: "#60a5fa",
        },
        itemStyle: {
          color: "#60a5fa",
          borderColor: "#ffffff",
          borderWidth: 2,
        },
        areaStyle: {
          color: "rgba(96,165,250,0.12)",
        },
      },
    ],
  }), []);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">
          Fluxo de Caixa Projetado
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Exemplo mínimo com dados fixos
        </p>

        <div style={{ width: "100%", height: 480 }}>
          <ReactECharts
            option={option}
            style={{ width: "100%", height: "100%" }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </div>
    </div>
  );
}

function abreviarValor(v) {
  const n = Number(v || 0);
  if (Math.abs(n) >= 1000000) return `R$ ${(n / 1000000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000) return `R$ ${(n / 1000).toFixed(0)}k`;
  return `R$ ${n.toFixed(0)}`;
}
