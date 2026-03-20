import { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { hojeLocal } from "../utils/dataLocal";
import ExcelExport from "../utils/ExcelExport";

export default function RelatorioBalancoNivel() {

  const [empresaId, setEmpresaId] = useState(null);
  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [nivel, setNivel] = useState(3);
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");
    if (id) setEmpresaId(Number(id));
  }, []);

  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  async function consultar() {
    if (!empresaId) return alert("Empresa não carregada");

    setLoading(true);

    try {
      const r = await fetch(buildWebhookUrl("balanco_nivel"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: empresaId,
          data_ini: dataIni,
          data_fim: dataFim,
          nivel
        }),
      });

      const json = await r.json();
      setDados(Array.isArray(json) ? json : []);
    } catch {
      alert("Erro ao carregar balanço");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!empresaId) return;
    consultar();
  }, [empresaId, dataIni, dataFim, nivel]);

  function exportarExcel() {
    const dadosExcel = dados.map(l => ({
      Codigo: l.codigo,
      Nome: l.nome,
      Nivel: l.nivel,
      Valor: l.valor
    }));

    ExcelExport.exportar(dadosExcel, "balanco_nivel.xlsx");
  }


   const grupos = {};

dados.forEach(l => {
  const raiz = l.codigo.split(".")[0];

  if (!grupos[raiz]) {
    grupos[raiz] = {
      itens: [],
      total: 0
    };
  }

  grupos[raiz].itens.push(l);

  // 🔥 pega somente o nível raiz
  if (l.codigo === raiz) {
    grupos[raiz].total = Number(l.valor || 0);
  }
});

  return (
    <div className="p-4 bg-gray-100 rounded-xl">

      {/* HEADER */}
      <div className="bg-white rounded-xl shadow border-l-4 border-blue-600 p-4 mb-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">
          📊 Balanço por Nível
        </h2>

        <div className="flex flex-wrap gap-4 items-end">

          <div className="flex flex-col">
            <label className="font-bold text-blue-800 mb-1">Data inicial</label>
            <input
              type="date"
              value={dataIni}
              onChange={(e) => setDataIni(e.target.value)}
              className="border rounded-lg px-3 py-2 border-yellow-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-bold text-blue-800 mb-1">Data final</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border rounded-lg px-3 py-2 border-yellow-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-bold text-blue-800 mb-1">Nível</label>
            <select
              value={nivel}
              onChange={(e) => setNivel(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 border-yellow-500"
            >
              {[1,2,3,4,5,6].map(n => (
                <option key={n} value={n}>Nível {n}</option>
              ))}
            </select>
          </div>

          <button
            onClick={consultar}
             className="btn-pill btn-blue"
          >
            🔎 Consultar
          </button>

          <button
            onClick={() => window.print()}
              className="btn-pill btn-gray"
          >
            🖨️ Imprimir
          </button>

          <button
            onClick={exportarExcel}
            className="btn-pill btn-green"
          >
            📥 Excel
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="btn-pill btn-red"
          >
            ❌ Sair
          </button>

        </div>
      </div>

      {/* TABELA */}
      <div id="print-area" className="bg-white rounded-xl shadow-sm overflow-hidden p-4 border">

        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-blue-800">
            <tr>
              <th className="p-2 text-left">Código</th>
              <th className="p-2 text-left">Nome</th>
              <th className="p-2 text-center">Nível</th>
              <th className="p-2 text-right">Valor</th>
            </tr>
          </thead>
         <tbody>
            {Object.entries(grupos).map(([raiz, grupo], gIndex) => (
                <>
                {/* LINHAS */}
                {grupo.itens.map((l, i) => (
                    <tr key={`${gIndex}-${i}`} className="bg-white">
                    <td className="p-2 font-bold">{l.codigo}</td>
                    <td className="p-2">{l.nome}</td>
                    <td className="p-2 text-center">{l.nivel}</td>
                    <td className="p-2 text-right font-bold">
                        {fmt.format(l.valor)}
                    </td>
                    </tr>
                ))}

                {/* TOTAL DO GRUPO */}
                <tr className="border-t-2 border-gray-400 bg-gray-100">
                    <td colSpan={3} className="p-2 text-right font-bold text-gray-700">
                    Total {raiz}
                    </td>
                    <td className="p-2 text-right font-bold text-black">
                    {fmt.format(grupo.total)}
                    </td>
                </tr>

                {/* SEPARADOR DISCRETO */}
                <tr>
                    <td colSpan={4} className="h-3"></td>
                </tr>
                </>
            ))}

            {!loading && dados.length === 0 && (
                <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                    Nenhum dado encontrado
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
  );
}