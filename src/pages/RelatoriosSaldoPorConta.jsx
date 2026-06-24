 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { hojeLocal, dataLocal } from "../utils/dataLocal";
export default function RelatoriosSaldoPorConta() {
  const hoje = new Date().toISOString().slice(0, 10);

  const [dados, setDados] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
 const [contaId, setContaId] = useState("");
  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
   const [mostrarZeradas, setMostrarZeradas] = useState(false);

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

     const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const navigate = useNavigate();


  async function consultar() {
    setLoading(true);
    try {
      const resp = await fetch(
        buildWebhookUrl("saldo_conta"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id,
            data_ini: dataIni,
            data_fim: dataFim,
            filtro: contaId
          })
        }
      );

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : []);
    } catch (e) {
      alert("Erro ao carregar saldo por conta");
    } finally {
      setLoading(false);
    }
  }
 
 
  function linhaZerada(c) {
  return (
    Number(c.saldo_inicial || 0) === 0 &&
    Number(c.total_debito || 0) === 0 &&
    Number(c.total_credito || 0) === 0 &&
    Number(c.saldo || 0) === 0  
  );
}
return (
  <div className="min-h-screen bg-slate-50 p-4 md:p-6">
    <div className="mx-auto max-w-[1500px] space-y-5">
      {/* HEADER / FILTROS */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              📊 Saldo por Conta
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Consulte saldos iniciais, movimentações e saldo final por conta.
            </p>
          </div>

          <button
            onClick={() => navigate("/reports")}
            className="btn-pill btn-white flex items-center gap-2"
          >
            ← Voltar
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Data inicial
                </label>
                <input
                  type="date"
                  value={dataIni}
                  onChange={(e) => setDataIni(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Conta opcional
                </label>
                <input
                  type="text"
                  placeholder="Digite código ou nome"
                  value={contaId}
                  onChange={(e) => setContaId(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                onClick={consultar}
                className="btn-pill btn-white flex items-center gap-2"
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

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600">
              <input
                type="checkbox"
                checked={!mostrarZeradas}
                onChange={() => setMostrarZeradas(!mostrarZeradas)}
              />
              Ocultar contas sem movimento
            </label>

            <div className="text-sm font-bold text-slate-500">
              {loading
                ? "Carregando..."
                : `${dados.filter((c) => mostrarZeradas || !linhaZerada(c)).length} conta(s)`}
            </div>
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div
        id="print-area"
        className="rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Resultado por conta
            </h2>
            <p className="text-sm font-semibold text-slate-500">
              Saldos calculados no período selecionado.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="sticky top-0 px-4 py-3 text-left text-xs font-black uppercase tracking-wide">
                  Código
                </th>
                <th className="sticky top-0 px-4 py-3 text-left text-xs font-black uppercase tracking-wide">
                  Conta
                </th>
                <th className="sticky top-0 px-4 py-3 text-right text-xs font-black uppercase tracking-wide">
                  Saldo inicial
                </th>
                <th className="sticky top-0 px-4 py-3 text-right text-xs font-black uppercase tracking-wide">
                  Valor
                </th>
                <th className="sticky top-0 px-4 py-3 text-right text-xs font-black uppercase tracking-wide">
                  Saldo final
                </th>
              </tr>
            </thead>

            <tbody>
              {dados
                .filter((c) => mostrarZeradas || !linhaZerada(c))
                .map((c, idx) => {
                  const saldoInicial = Number(c.saldo_inicial || 0);
                  const valor = Number(c.valor || 0);
                  const saldo = Number(c.saldo || 0);

                  return (
                    <tr
                      key={idx}
                      className={`transition hover:bg-blue-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                      }`}
                    >
                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3 font-black text-slate-700">
                        {c.codigo}
                      </td>

                      <td className="border-b border-slate-100 px-4 py-3 font-bold text-slate-700">
                        <div className="max-w-[560px] truncate" title={c.nome}>
                          {c.nome}
                        </div>
                      </td>

                      <td
                        className={`whitespace-nowrap border-b border-slate-100 px-4 py-3 text-right font-black ${
                          saldoInicial < 0 ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        {fmt.format(saldoInicial)}
                      </td>

                      <td
                        className={`whitespace-nowrap border-b border-slate-100 px-4 py-3 text-right font-black ${
                          valor < 0 ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        {fmt.format(valor)}
                      </td>

                      <td
                        className={`whitespace-nowrap border-b border-slate-100 px-4 py-3 text-right font-black ${
                          saldo < 0 ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        {fmt.format(saldo)}
                      </td>
                    </tr>
                  );
                })}

              {!loading && dados.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8">
                      <div className="text-4xl">📭</div>
                      <div className="mt-3 text-lg font-black text-slate-700">
                        Nenhuma conta encontrada
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-500">
                        Ajuste os filtros e clique em Consultar.
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {loading && (
            <div className="border-t border-slate-100 p-6 text-center text-sm font-black text-blue-700">
              Carregando saldo por conta...
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
 
}
