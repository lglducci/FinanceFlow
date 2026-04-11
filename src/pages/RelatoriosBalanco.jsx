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
    <div className="p-6">
      <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-blue-800 mb-2">
        <h1 className="text-2xl font-bold mb-6">📊 Balanço Patrimonial</h1>

        <div className="bg-white rounded-xl p-4 shadow mb-6 flex gap-4 items-end">
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <div className="flex flex-wrap gap-6 items-center mb-4">
              <label className="flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={ehPatrimonial}
                  onChange={() => marcarTipo("patrimonial")}
                />
                Balanço Patrimonial
              </label>

              <label className="flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={ehComparativo}
                  onChange={() => marcarTipo("comparativo")}
                />
                Balanço Comparativo
              </label>
            </div>

            {!ehComparativo ? (
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Data de corte
                  </label>
                  <input
                    type="date"
                    value={dataCorte}
                    onChange={(e) => setDataCorte(e.target.value)}
                    className="border rounded px-3 py-2"
                  />
                </div>

                <button
                  onClick={consultar}
                  className="px-4 py-2 rounded bg-blue-700 text-white font-semibold"
                >
                  Pesquisar
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Data inicial
                  </label>
                  <input
                    type="date"
                    value={dataIni}
                    onChange={(e) => setDataIni(e.target.value)}
                    className="border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Data final
                  </label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="border rounded px-3 py-2"
                  />
                </div>

                <button
                  onClick={consultar}
                  className="px-4 py-2 rounded bg-blue-700 text-white font-semibold"
                >
                  Pesquisar
                </button>

                <button
                  onClick={() => window.print()}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  🖨️ Imprimir
                </button>

                <button
                  onClick={() => navigate("/reports")}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold"
                >
                  Voltar
                </button>
              </div>
            )}

            {erro && (
              <div className="mt-3 text-red-600 font-medium">{erro}</div>
            )}
          </div>
        </div>
      </div>

      <div id="print-area">
        <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-gray-400 mb-2">
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Código</th>
                  <th className="px-3 py-2 text-left">Conta</th>

                  {ehComparativo ? (
                    <>
                      <th className="px-3 py-2 text-right">Saldo anterior</th>
                      <th className="px-3 py-2 text-right">Saldo atual</th>
                      <th className="px-3 py-2 text-right">Variação</th>
                    </>
                  ) : (
                    <th className="px-3 py-2 text-right">Saldo</th>
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
                      className={destaqueResumo ? "bg-slate-50 font-bold border-t" : "border-t"}
                    >
                      <td className="px-3 py-2">{l.conta_codigo || ""}</td>
                      <td className="px-3 py-2">{l.conta_nome || ""}</td>

                      {ehComparativo ? (
                        <>
                          <td className="px-3 py-2 text-right">
                            {moeda(l.saldo_anterior)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {moeda(l.saldo_atual)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {moeda(l.variacao)}
                          </td>
                        </>
                      ) : (
                        <td className="px-3 py-2 text-right">
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
                      className="px-3 py-6 text-center text-slate-500"
                    >
                      Nenhum dado encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {loading && (
              <div className="p-6 text-center text-blue-600 font-semibold">
                Carregando...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}