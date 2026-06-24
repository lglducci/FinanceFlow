import { useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { hojeLocal } from "../utils/dataLocal";

export default function RelatorioFluxoCaixa() {
  const navigate = useNavigate();

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modo, setModo] = useState("DETALHADO"); // DETALHADO | MENSAL | CONSOLIDADO

  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

 const fmtData = (d) => {
  if (!d) return "";
  const txt = String(d).slice(0, 10);
  const [ano, mes, dia] = txt.split("-");
  return `${dia}/${mes}/${ano}`;
};

  function webhookPorModo() {
    if (modo === "DETALHADO") return "gera_fluxo_caixa_detalhado";
    if (modo === "MENSAL") return "gera_fluxo_caixa_mensal";
    if (modo === "CONSOLIDADO") return "gera_fluxo_caixa_consolidado";
  }

  async function consultar() {
    setLoading(true);
    setDados([]);

    try {
      const resp = await fetch(buildWebhookUrl(webhookPorModo()), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          data_ini: dataIni,
          data_fim: dataFim,
        }),
      });

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : [json]);
    } catch (e) {
      alert("Erro ao carregar fluxo de caixa");
    } finally {
      setLoading(false);
    }
  }

 let saldo = 0;

const dadosRender = dados.map((l) => {
  if (l.historico === "SALDO INICIAL") {
    saldo = Number(l.saldo_mov);
  } else {
    saldo += Number(l.saldo_mov);
  }

  return {
    ...l,
    saldo_acumulado: saldo,
  };
});

function trocarModo(novoModo) {
  setModo(novoModo);
  setDados([]);
  setLoading(false);
}
return (
  <div className="min-h-screen bg-slate-50 p-4 md:p-6">
    <div className="mx-auto max-w-[1600px] space-y-5">

      {/* HEADER */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              💰 Fluxo de Caixa Realizado
            </h1>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Fluxo detalhado, mensal ou consolidado das movimentações financeiras.
            </p>
          </div>

          <button
            onClick={() => navigate("/reports")}
            className="btn-pill btn-white flex items-center gap-2"
          >
            ← Voltar
          </button>
        </div>

        {/* FILTROS */}
        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Data inicial
                </label>

                <input
                  type="date"
                  value={dataIni}
                  onChange={(e) => setDataIni(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Data final
                </label>

                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">

              <button
                onClick={consultar}
                className="btn-pill btn-green flex items-center gap-2"
              >
                🔎 Consultar
              </button>

              <button
                onClick={() => window.print()}
                className="btn-pill btn-white flex items-center gap-2"
              >
                🖨️ Imprimir
              </button>

            </div>
          </div>

          {/* MODOS */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">

            {["DETALHADO", "MENSAL", "CONSOLIDADO"].map((m) => (
              <label
                key={m}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-black transition ${
                  modo === m
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={modo === m}
                  onChange={() => trocarModo(m)}
                  className="hidden"
                />
                {m}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* DETALHADO */}
      {modo === "DETALHADO" && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-black text-slate-800">
              Fluxo Detalhado
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">

              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-left">Código</th>
                  <th className="px-4 py-3 text-left">Conta</th>
                  <th className="px-4 py-3 text-left">Histórico</th>
                  <th className="px-4 py-3 text-right">Entrada</th>
                  <th className="px-4 py-3 text-right">Saída</th>
                  <th className="px-4 py-3 text-right">Saldo Acum.</th>
                </tr>
              </thead>

              <tbody>
                {dadosRender.map((l, i) => (
                  <tr
                    key={l.id}
                    className={`hover:bg-blue-50 ${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold">
                      {fmtData(l.data_mov)}
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      {l.conta_codigo}
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      {l.conta_nome}
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      {l.historico}
                    </td>

                    <td className="px-4 py-3 text-right font-black text-green-600">
                      {fmt.format(l.entrada)}
                    </td>

                    <td className="px-4 py-3 text-right font-black text-red-600">
                      {fmt.format(l.saida)}
                    </td>

                    <td className="px-4 py-3 text-right font-black text-slate-700">
                      {fmt.format(l.saldo_acumulado)}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      )}

      {/* MENSAL */}
      {modo === "MENSAL" && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-black text-slate-800">
              Fluxo Mensal
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">

              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-4 py-3 text-left">Ano</th>
                  <th className="px-4 py-3 text-left">Mês</th>
                  <th className="px-4 py-3 text-right">Saldo Inicial</th>
                  <th className="px-4 py-3 text-right">Entradas</th>
                  <th className="px-4 py-3 text-right">Saídas</th>
                  <th className="px-4 py-3 text-right">Saldo Final</th>
                </tr>
              </thead>

              <tbody>
                {dados.map((l, i) => (
                  <tr
                    key={i}
                    className={`hover:bg-blue-50 ${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-bold">{l.ano}</td>

                    <td className="px-4 py-3 font-bold">{l.mes}</td>

                    <td className="px-4 py-3 text-right font-black">
                      {fmt.format(l.saldo_inicial)}
                    </td>

                    <td className="px-4 py-3 text-right font-black text-green-600">
                      {fmt.format(l.entrada)}
                    </td>

                    <td className="px-4 py-3 text-right font-black text-red-600">
                      {fmt.format(l.saida)}
                    </td>

                    <td className="px-4 py-3 text-right font-black">
                      {fmt.format(l.saldo_final)}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      )}

      {/* CONSOLIDADO */}
      {modo === "CONSOLIDADO" && dados[0] && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <Card titulo="Saldo Inicial" valor={dados[0].saldo_inicial} />

          <Card titulo="Entradas" valor={dados[0].entrada} />

          <Card titulo="Saídas" valor={dados[0].saida} />

          <Card titulo="Saldo Final" valor={dados[0].saldo_final} />
        </div>
      )}

      {loading && (
        <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center">
          <div className="text-lg font-black text-blue-700">
            Carregando fluxo de caixa...
          </div>
        </div>
      )}
    </div>
  </div>
);
 
}
