 import { useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";

export default function TributosApuracao() {
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [dataIni, setDataIni] = useState(hojeLocal().slice(0, 7) + "-01");
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);

  async function apurar() {
    setLoading(true);
    try {
      const response = await fetch(
        buildWebhookUrl("apurar_tributos_periodo"),
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

      const dados = await response.json();

      // 👉 AQUI OS DADOS CHEGAM
      setLista(Array.isArray(dados) ? dados : []);
    } catch (e) {
      console.error("Erro ao apurar tributos:", e);
      setLista([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-[#1e40af] mb-4">
        📊 Apuração de Tributos
      </h2>

      {/* FILTROS */}
      <div className="bg-gray-100 rounded-xl shadow p-4 border-[4px] border-blue-800 mb-4 flex gap-4 items-end">
        <div>
          <label className="font-bold text-[#1e40af]">Data Inicial</label>
          <input
            type="date"
            className="input-premium"
            value={dataIni}
            onChange={(e) => setDataIni(e.target.value)}
          />
        </div>

        <div>
          <label className="font-bold text-[#1e40af]">Data Final</label>
          <input
            type="date"
            className="input-premium"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>

        <button
          onClick={apurar}
          className="h-12 px-8 bg-blue-600 text-white font-bold rounded-lg"
          disabled={loading}
        >
          {loading ? "Apurando..." : "Apurar"}
        </button>
      </div>

      {/* TABELA */}
      <div className="bg-gray-100 rounded-xl p-4 shadow border-[2px] border-gray-500">
        <table className="w-full border-separate border-spacing-y-2">
          <thead className="bg-blue-900 text-white text-sm">
  <tr>
    <th className="px-3 py-2 text-left font-semibold">Tributo</th>
    <th className="px-3 py-2 text-right font-semibold">Alíquota</th>
    <th className="px-3 py-2 text-right font-semibold">Base</th>
    <th className="px-3 py-2 text-right font-semibold">Valor</th>
    <th className="px-3 py-2 text-center font-semibold">Período</th>
    <th className="px-3 py-2 text-center font-semibold">Status</th>
  </tr>
</thead>

<tbody className="text-sm">
  {lista.length === 0 && (
    <tr>
      <td colSpan="6" className="text-center py-4 font-semibold">
        Nenhum dado encontrado
      </td>
    </tr>
  )}

  {lista.map((l, i) => (
    <tr
      key={i}
      className={i % 2 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6]"}
    >
      {/* DESCRIÇÃO */}
      <td className="px-3 py-2 text-left font-semibold">
        {l.tributo}
      </td>

      {/* ALÍQUOTA */}
      <td className="px-3 py-2 text-right font-semibold">
        {Number(l.aliquota).toLocaleString("pt-BR")}%
      </td>

      {/* BASE */}
      <td className="px-3 py-2 text-right font-semibold">
        {Number(l.base_calculo).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </td>

      {/* VALOR */}
      <td className="px-3 py-2 text-right font-semibold">
        {Number(l.valor_apurado).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </td>

      {/* PERÍODO */}
      <td className="px-3 py-2 text-center font-semibold">
        {dataIni} a {dataFim}
      </td>

      {/* STATUS */}
      <td className="px-3 py-2 text-center font-semibold">
        {l.status}
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>
    </div>
  );
}
