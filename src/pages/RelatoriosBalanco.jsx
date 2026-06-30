 import { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { hojeLocal } from "../utils/dataLocal";

export default function RelatoriosBalanco() {
  const navigate = useNavigate();

  const [empresaId, setEmpresaId] = useState(null);
  const [tipoRelatorio, setTipoRelatorio] = useState("patrimonial");

  const [dataCorte, setDataCorte] = useState(hojeLocal());
  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());

  const [linhas, setLinhas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const ehComparativo = tipoRelatorio === "comparativo";
  const ehPatrimonial = tipoRelatorio === "patrimonial";

  useEffect(() => {
    const id =
      localStorage.getItem("id_empresa") ||
      localStorage.getItem("empresa_id");

    if (id) {
      setEmpresaId(Number(id));
    }
  }, []);

  useEffect(() => {
    if (empresaId) {
      consultar();
    }
  }, [empresaId, tipoRelatorio]);

  function marcarTipo(tipo) {
    setTipoRelatorio(tipo);
    setLinhas([]);
    setErro("");
  }

  function moeda(v) {
    return Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function consultar() {
    try {
      if (!empresaId) {
        alert("Empresa não carregada");
        return;
      }

      setLoading(true);
      setErro("");
      setLinhas([]);

      let webhook = "";
      let payload = {};

      if (ehComparativo) {
        webhook = "balanco_comparativo";
        payload = {
          empresa_id: empresaId,
          data_ini: dataIni,
          data_fim: dataFim,
        };
      } else {
        webhook = "balanco_patrimonial";
        payload = {
          empresa_id: empresaId,
          data_corte: dataCorte,
        };
      }

      const resp = await fetch(buildWebhookUrl(webhook), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await resp.json();
      const lista = Array.isArray(json) ? json : [];

       let listaFinal = lista.filter((l) => {
  const nome = (l.conta_nome || "").toUpperCase().trim();
  const tipo = (l.tipo_linha || "").toUpperCase().trim();

  // remove subtotal de subgrupo, se existir
  if (tipo === "SUBTOTAL_SUBGRUPO") return false;

  // remove esta merda vermelha em qualquer modo
  if (nome === "TOTAL DO ATIVO") return false;

  return true;
});

if (ehPatrimonial) {
  listaFinal = listaFinal.filter((l) => {
    const nome = (l.conta_nome || "").toUpperCase().trim();

    if (nome === "TOTAL DO PASSIVO + PL") return false;
    if (nome === "TOTAL DO PATRIMONIO LIQUIDO") return false;

    return true;
  });
}

      // comparativo fica exatamente como veio do banco
      setLinhas(listaFinal);
    } catch (e) {
      console.error(e);
      setErro("Erro ao carregar o balanço");
      setLinhas([]);
    } finally {
      setLoading(false);
    }
  }
  
return (
  <div className="min-h-screen bg-slate-50 p-4 md:p-6">
    <div className="mx-auto max-w-[1600px] space-y-5">
      {/* HEADER / FILTROS */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              📊 Balanço Patrimonial
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Consulte o balanço patrimonial ou compare saldos entre períodos.
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
          <div className="mb-5 flex flex-wrap gap-2">
            {[
              ["patrimonial", "Balanço Patrimonial"],
              ["comparativo", "Balanço Comparativo"],
            ].map(([value, label]) => (
              <label
                key={value}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-black transition ${
                  tipoRelatorio === value
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={tipoRelatorio === value}
                  onChange={() => marcarTipo(value)}
                  className="hidden"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            {!ehComparativo ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                    Data de corte
                  </label>
                  <input
                    type="date"
                    value={dataCorte}
                    onChange={(e) => setDataCorte(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
            )}

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                onClick={consultar}
                className="btn-pill btn-green flex items-center gap-2"
              >
                🔎 Pesquisar
              </button>

              <button
                onClick={() => window.print()}
                className="btn-pill btn-white flex items-center gap-2"
              >
                🖨️ Imprimir
              </button>
            </div>
          </div>

          {erro && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
              {erro}
            </div>
          )}
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
              {ehComparativo ? "Balanço Comparativo" : "Balanço Patrimonial"}
            </h2>
            <p className="text-sm font-semibold text-slate-500">
              {loading
                ? "Carregando dados..."
                : `${linhas.length} linha(s) encontradas`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
                className={`w-full border-separate border-spacing-0 ${
                  ehComparativo
                    ? "min-w-[860px] text-xs print:min-w-0 print:text-[7px]"
                    : "min-w-[760px] text-sm print:min-w-0 print:text-[8px]"
                }`}
              >
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="sticky top-0 px-2 py-2 text-left text-xs font-black uppercase tracking-wide">
                  Código
                </th>
                <th className="sticky top-0 px-2 py-2 text-left text-xs font-black uppercase tracking-wide">
                  Conta
                </th>

                {ehComparativo ? (
                  <>
                    <th className="sticky top-0 px-2 py-2 text-right text-xs font-black uppercase tracking-wide">
                      Saldo anterior
                    </th>
                    <th className="sticky top-0 px-2 py-2 text-right text-xs font-black uppercase tracking-wide">
                      Saldo atual
                    </th>
                    <th className="sticky top-0 px-2 py-2 text-right text-xs font-black uppercase tracking-wide">
                      Variação
                    </th>
                  </>
                ) : (
                  <th className="sticky top-0 px-2 py-2 text-right text-xs font-black uppercase tracking-wide">
                    Saldo
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {linhas.map((l, i) => {
                const nome = (l.conta_nome || "").toUpperCase().trim();
                const tipo = (l.tipo_linha || "").toUpperCase().trim();

                const destaqueResumo =
                  tipo.includes("TOTAL") ||
                  tipo === "FECHAMENTO" ||
                  nome === "TOTAL ATIVO" ||
                  nome === "TOTAL PASSIVO" ||
                  nome === "DIFERENCA (ATIVO - PASSIVO - PL)";

                return (
                  <tr
                    key={i}
                    className={`transition hover:bg-blue-50 ${
                      destaqueResumo
                        ? "bg-blue-50 font-black text-slate-900"
                        : i % 2 === 0
                        ? "bg-white"
                        : "bg-slate-50"
                    }`}
                  >
                    <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3 font-black text-slate-700">
                      {l.conta_codigo || ""}
                    </td>

                    <td className="border-b border-slate-100 px-4 py-3 font-bold text-slate-700">
                     <div
                            className={`${ehComparativo ? "max-w-[360px]" : "max-w-[680px]"} truncate print:max-w-[260px]`}
                            title={l.conta_nome || ""}
                          >
                        {l.conta_nome || ""}
                      </div>
                    </td>

                    {ehComparativo ? (
                      <>
                        <td
                          className={`whitespace-nowrap border-b border-slate-100 px-4 py-3 text-right font-black ${
                            Number(l.saldo_anterior || 0) < 0
                              ? "text-red-600"
                              : "text-green-700"
                          }`}
                        >
                          {moeda(l.saldo_anterior)}
                        </td>

                        <td
                          className={`whitespace-nowrap border-b border-slate-100 px-4 py-3 text-right font-black ${
                            Number(l.saldo_atual || 0) < 0
                              ? "text-red-600"
                              : "text-green-700"
                          }`}
                        >
                          {moeda(l.saldo_atual)}
                        </td>

                        <td
                          className={`whitespace-nowrap border-b border-slate-100 px-4 py-3 text-right font-black ${
                            Number(l.variacao || 0) < 0
                              ? "text-red-600"
                              : "text-green-700"
                          }`}
                        >
                          {moeda(l.variacao)}
                        </td>
                      </>
                    ) : (
                      <td
                        className={`whitespace-nowrap border-b border-slate-100 px-4 py-3 text-right font-black ${
                          Number(l.saldo || 0) < 0
                            ? "text-red-600"
                            : "text-green-700"
                        }`}
                      >
                        {moeda(l.saldo)}
                      </td>
                    )}
                  </tr>
                );
              })}

              {!loading && linhas.length === 0 && (
                <tr>
                  <td
                    colSpan={ehComparativo ? 5 : 3}
                    className="px-6 py-14 text-center"
                  >
                    <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8">
                      <div className="text-4xl">📭</div>
                      <div className="mt-3 text-lg font-black text-slate-700">
                        Nenhum dado encontrado
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-500">
                        Ajuste o período e clique em Pesquisar.
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {loading && (
            <div className="border-t border-slate-100 p-6 text-center text-sm font-black text-blue-700">
              Carregando balanço...
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
  
}