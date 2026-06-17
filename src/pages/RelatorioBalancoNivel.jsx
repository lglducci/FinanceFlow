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
  <div className="min-h-screen bg-[#eef7fd] px-4 py-5">
    <div className="mx-auto w-full max-w-[1500px]">

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#063452]">
            📊 Balanço por Nível
          </h1>
          <p className="text-sm font-semibold text-slate-500">
            Visualização por níveis contábeis no período selecionado
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={dataIni}
            onChange={(e) => setDataIni(e.target.value)}
            className="h-10 rounded-xl border border-cyan-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm"
          />

          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="h-10 rounded-xl border border-cyan-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm"
          />

          <div className="flex rounded-xl border border-cyan-200 bg-white overflow-hidden shadow-sm">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNivel(n)}
                className={`h-10 px-4 text-sm font-black transition ${
                  nivel === n
                    ? "bg-[#063452] text-white"
                    : "bg-white text-[#063452] hover:bg-cyan-50"
                }`}
              >
                N{n}
              </button>
            ))}
          </div>

          <button onClick={consultar} className="btn-pill btn-blue">
            🔎 Consultar
          </button>

          <button onClick={() => window.print()} className="btn-pill btn-gray">
            🖨️
          </button>

          <button onClick={exportarExcel} className="btn-pill btn-green">
            Excel
          </button>

          <button onClick={() => navigate("/reports")} className="btn-pill btn-white">
            Sair
          </button>
        </div>
      </div>

      <div
        id="print-area"
        className="rounded-3xl border border-cyan-200 bg-white shadow-sm overflow-hidden"
      >
        <div className="max-h-[880px] overflow-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="sticky top-0 z-10 bg-[#e7f5fc] text-[#063452] shadow-sm">
              <tr>
                <th className="w-[140px] px-4 py-3 text-left font-black">
                  Código
                </th>
                <th className="px-4 py-3 text-left font-black">
                  Conta
                </th>
                <th className="w-[90px] px-4 py-3 text-center font-black">
                  Nível
                </th>
                <th className="w-[180px] px-4 py-3 text-right font-black">
                  Valor
                </th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(grupos).map(([raiz, grupo], gIndex) => (
                <>
                  {grupo.itens.map((l, i) => {
                    const valor = Number(l.valor || 0);

                    return (
                      <tr
                        key={`${gIndex}-${i}`}
                        className={`border-b border-cyan-50 hover:bg-cyan-50 ${
                          i === 0 ? "bg-[#f1f9fd]" : "bg-white"
                        }`}
                      >
                        <td className="px-4 py-3 font-black text-[#063452]">
                          {l.codigo}
                        </td>

                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {l.nome}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-[#063452]">
                            N{l.nivel}
                          </span>
                        </td>

                        <td
                          className={`px-4 py-3 text-right font-black ${
                            valor < 0 ? "text-red-600" : "text-slate-800"
                          }`}
                        >
                          {valor < 0 ? "-" : ""}
                          R$ {fmt.format(Math.abs(valor))}
                        </td>
                      </tr>
                    );
                  })}

                  <tr className="bg-[#dcecf7] border-t border-cyan-200">
                    <td colSpan={3} className="px-4 py-3 text-right font-black text-[#063452]">
                      Total da conta {raiz}
                    </td>

                    <td
                      className={`px-4 py-3 text-right font-black ${
                        Number(grupo.total || 0) < 0 ? "text-red-600" : "text-[#063452]"
                      }`}
                    >
                      R$ {fmt.format(Math.abs(Number(grupo.total || 0)))}
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={4} className="h-2 bg-white"></td>
                  </tr>
                </>
              ))}

              {!loading && dados.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center font-bold text-slate-400">
                    Nenhum dado encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="p-6 text-center font-black text-[#063452]">
            Carregando...
          </div>
        )}
      </div>
    </div>
  </div>
);
}