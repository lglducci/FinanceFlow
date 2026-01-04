import { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { hojeLocal, dataLocal } from "../utils/dataLocal";

export default function RelatoriosDRE() {
  const hoje = new Date().toISOString().slice(0, 10);
 const [empresaId, setEmpresaId] = useState(null);
 const [dataIni, setDataIni] = useState(hojeLocal());
 const [dataFim, setDataFim] = useState(hojeLocal());

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // formatter BR
  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const id =
      localStorage.getItem("empresa_id") ||
      localStorage.getItem("id_empresa");

    if (id) setEmpresaId(Number(id));
  }, []);

  async function consultar() {
    if (!empresaId) {
      alert("Empresa não carregada");
      return;
    }

    setLoading(true);
    setMsg("");
    setDados([]);

    try {

      
      const resp = await fetch(buildWebhookUrl("der"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: empresaId,
          data_ini: dataIni,
          data_fim: dataFim,
        }),
      });

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : []);
    } catch (e) {
      alert("Erro ao carregar DRE");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
         <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-blue-800 mb-2"> 
      <h1 className="text-2xl font-bold mb-6">📊 DRE – Demonstrativo de Resultado</h1>

      {/* FILTROS */}
      <div className="bg-white rounded-xl p-4 shadow mb-6 flex gap-4 items-end">
        <div>
          <label className="block font-bold text-[#1e40af]"> Data inicial  </label>
          <input
            type="date"
            value={dataIni}
            onChange={(e) => setDataIni(e.target.value)}
            className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <div>
          <label className="block font-bold text-[#1e40af]"> Data final  </label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="block border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <button
          onClick={consultar}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Consultar
        </button>

        <button
          onClick={() => window.print()}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          🖨️ Imprimir
        </button>

        
         <button
          onClick={() =>   navigate("/reports") }
          className="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold"
        >   
         ← Voltar
        </button>
      </div>
      </div>

      {/* TABELA */}
      <div id="print-area" className="bg-white rounded-xl shadow overflow-x-auto">
         <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-gray-400 mb-2"> 
        <table className="w-full text-sm">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="p-3 text-left">Grupo</th>
              <th className="p-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((l, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-3 font-semibold">
                  {l.grupo.replaceAll("_", " ")}
                </td>
                <td
                  className={`p-3 text-right font-bold ${
                    Number(l.valor_periodo) < 0
                      ? "text-red-600"
                      : "text-green-700"
                  }`}
                >
                  {fmt.format(l.valor_periodo)}
                </td>
              </tr>
            ))}

            {!loading && dados.length === 0 && (
              <tr>
                <td colSpan={2} className="p-6 text-center text-gray-400">
                  Nenhum dado para o período selecionado.
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
  );
}
