import { useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { hojeLocal, dataLocal } from "../utils/dataLocal";

export default function RelatoriosFluxoCaixaMensal() {
  const hoje = new Date().toISOString().slice(0,10);
  const navigate = useNavigate();
  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  async function consultar() {
    setLoading(true);
    try {
      const r = await fetch(buildWebhookUrl("gera_fluxo_caixa_mensal"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          data_ini: dataIni,
          data_fim: dataFim,
        }),
      });

      const j = await r.json();
      setDados(Array.isArray(j) ? j : []);
    } catch {
      alert("Erro ao carregar fluxo de caixa mensal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
        <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-blue-800 mb-2"> 
      <h1 className="text-2xl font-bold mb-6">📊 Fluxo de Caixa Mensal</h1>
        
      {/* FILTROS */}
      <div className="flex gap-4 items-end bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col">
          <label className="font-bold text-blue-700">Data início</label>
          <input
            type="date"
            value={dataIni}
            onChange={(e) => setDataIni(e.target.value)}
            className="border px-3 py-2 rounded border-yellow-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-bold text-blue-700">Data fim</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="border px-3 py-2 rounded border-yellow-500"
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

      </div>

      {loading && <p className="font-bold text-blue-600">Carregando...</p>}

      {/* TABELA */}
       <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-gray-400 mb-2"> 
      <table className="w-full border-collapse">
        
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="p-2">Ano</th>
            <th className="p-2">Mês</th>
            <th className="p-2 text-right">Entradas</th>
            <th className="p-2 text-right">Saídas</th>
            <th className="p-2 text-right">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((r, i) => (
            <tr key={i} className="border-b">
              <td className="p-2">{r.ano}</td>
              <td className="p-2">{String(r.mes).padStart(2,"0")}</td>
              <td className="p-2 text-right text-green-700 font-bold">
                {fmt.format(r.entrada)}
              </td>
              <td className="p-2 text-right text-red-600 font-bold">
                {fmt.format(r.saida)}
              </td>
              <td
                className={`p-2 text-right font-bold ${
                  r.saldo >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                {fmt.format(r.saldo)}
              </td>
            </tr>
          ))}

          {!loading && dados.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-gray-500">
                Nenhum dado encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
     </div>
  );
}
