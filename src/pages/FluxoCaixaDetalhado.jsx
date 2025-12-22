import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { hojeLocal, dataLocal } from "../utils/dataLocal";

export default function FluxoCaixaDetalhado() {
  const navigate = useNavigate();

  const hoje = new Date().toISOString().slice(0, 10);
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [dataIni, setDataIni] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
 
  const fmtData = (d) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "";

  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  async function consultar() {
    setLoading(true);
    setDados([]);

    try {
      const resp = await fetch(
        buildWebhookUrl("gera_fluxo_caixa_detalhado"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id,
            data_ini: dataIni,
            data_fim: dataFim,
          }),
        }
      );

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : []);
    } catch (e) {
      alert("Erro ao carregar fluxo de caixa");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">💰 Fluxo de Caixa – Detalhado</h1>

      {/* FILTROS */}
      <div className="flex gap-4 items-end mb-6">
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
          onClick={() => window.print()}
          className="bg-gray-700 text-white px-4 py-2 rounded font-bold"
        >
          🖨️ Imprimir
        </button>

        <button
          onClick={() => navigate("/reports")}
          className="bg-gray-400 text-white px-4 py-2 rounded font-bold"
        >
          Voltar
        </button>
      </div>

      {/* TABELA */}
      <div id="print-area" className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">Código</th>
              <th className="p-2 text-left">Nome</th>
              <th className="p-2 text-left">Histórico</th>
              <th className="p-2 text-right">Entrada</th>
              <th className="p-2 text-right">Saída</th>
              <th className="p-2 text-right">Saldo</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((l, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{fmtData(l.data_mov)}</td>
                 <td className="p-2 font-bold">{l.conta_codigo}</td>
                 <td className="p-2 font-bold">{l.conta_nome}</td>
                <td className="p-2 font-bold">{l.historico}</td>
                <td className="p-2 text-right text-green-600">
                  {fmt.format(l.entrada)}
                </td>
                <td className="p-2 text-right text-red-600">
                  {fmt.format(l.saida)}
                </td>
                <td
                  className={`p-2 text-right font-bold ${
                    l.saldo >= 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {fmt.format(l.saldo_mov)}
                </td>
              </tr>
            ))}

            {!loading && dados.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  Nenhum movimento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {loading && (
          <div className="p-6 text-center text-blue-600 font-bold">
            Carregando...
          </div>
        )}
      </div>
    </div>
  );
}
