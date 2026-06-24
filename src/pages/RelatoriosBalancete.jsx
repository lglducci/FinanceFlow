 import { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { hojeLocal, dataLocal } from "../utils/dataLocal";

export default function RelatoriosBalancete() {

  const hoje = new Date().toISOString().slice(0, 10);

  const [empresaId, setEmpresaId] = useState(null);
  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState([]);
  const [mostrarZeradas, setMostrarZeradas] = useState(false);
  const navigate = useNavigate();

 const fmt = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});


useEffect(() => {
  const id = localStorage.getItem("id_empresa");
  console.log("id_empresa localStorage:", id);

  if (id) {
    setEmpresaId(Number(id));
  }
}, []);


  async function consultar() {
    if (!empresaId) {
      alert("Empresa não carregada");
      return;
    }

    setLoading(true);
    setDados([]);

    try {
      const resp = await fetch(
        buildWebhookUrl("balancete"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id: empresaId,
            data_ini: dataIni,
            data_fim: dataFim,
          }),
        }
      );

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : []);
    } catch (e) {
      alert("Erro ao carregar balancete");
    } finally {
      setLoading(false);
    }
  }

  function linhaZerada(l) {
  return (
    Number(l.saldo_inicial || 0) === 0 &&
    Number(l.total_debito || 0) === 0 &&
    Number(l.total_credito || 0) === 0 &&
    Number(l.saldo || 0) === 0  
  );
}

return (
  <div className="min-h-screen bg-slate-50 p-4 md:p-2">
    <div className="mx-auto max-w-[1600px] space-y-5">
      {/* HEADER / FILTROS */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              📒 Balancete
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Consulte saldos iniciais, débitos, créditos e saldo final por conta.
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                : `${dados.filter((l) => mostrarZeradas || !linhaZerada(l)).length} conta(s)`}
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
              Resultado do Balancete
            </h2>
            <p className="text-sm font-semibold text-slate-500">
              Saldos e movimentações no período selecionado.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-sm">
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
                  Débito
                </th>
                <th className="sticky top-0 px-4 py-3 text-right text-xs font-black uppercase tracking-wide">
                  Crédito
                </th>
                <th className="sticky top-0 px-4 py-3 text-right text-xs font-black uppercase tracking-wide">
                  Saldo final
                </th>
              </tr>
            </thead>

            <tbody>
              {dados
                .filter((l) => mostrarZeradas || !linhaZerada(l))
                .map((l, idx) => {
                  const saldoInicial = Number(l.saldo_inicial || 0);
                  const debito = Number(l.total_debito || 0);
                  const credito = Number(l.total_credito || 0);
                  const saldo = Number(l.saldo || 0);

                  return (
                    <tr
                      key={idx}
                      className={`transition hover:bg-blue-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                      }`}
                    >
                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3 font-black text-slate-700">
                        {l.codigo}
                      </td>

                      <td className="border-b border-slate-100 px-4 py-3 font-bold text-slate-700">
                        <div className="max-w-[620px] truncate" title={l.conta_nome}>
                          {l.conta_nome}
                        </div>
                      </td>

                      <td
                        className={`whitespace-nowrap border-b border-slate-100 px-4 py-3 text-right font-black ${
                          saldoInicial < 0 ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        {fmt.format(saldoInicial)}
                      </td>

                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3 text-right font-black text-blue-700">
                        {fmt.format(debito)}
                      </td>

                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3 text-right font-black text-red-600">
                        {fmt.format(credito)}
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
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8">
                      <div className="text-4xl">📭</div>
                      <div className="mt-3 text-lg font-black text-slate-700">
                        Nenhum dado encontrado
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-500">
                        Selecione o período e clique em Consultar.
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {loading && (
            <div className="border-t border-slate-100 p-6 text-center text-sm font-black text-blue-700">
              Carregando balancete...
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
 
}
