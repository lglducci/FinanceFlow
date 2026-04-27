import React, { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { hojeLocal, dataLocal } from "../utils/dataLocal";
import ExcelExport from "../utils/ExcelExport";
 


export default function RelatoriosDRE() {
  const hoje = new Date().toISOString().slice(0, 10);
 const [empresaId, setEmpresaId] = useState(null);
 const [dataIni, setDataIni] = useState(hojeLocal());
 const [dataFim, setDataFim] = useState(hojeLocal());

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [analitico, setAnalitico] = useState(false);
  const receita = dados.find(d => d.grupo === "RECEITA_BRUTA")?.valor_periodo || 0;
const custos = dados.find(d => d.grupo === "CUSTOS")?.valor_periodo || 0;
const despesas = dados.find(d => d.grupo === "DESPESAS_OPERACIONAIS")?.valor_periodo || 0;

 
 
 


const lucroBruto = receita - custos;
const resultado = lucroBruto - despesas;


function percReceitaTotal(valor) {
  if (!receita) return "0,00%";
  return `${((Number(valor || 0) / receita) * 100).toFixed(2)}%`;
}

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

    const webhook = analitico ? "dre_analitico" : "der";
    if (!empresaId) {
      alert("Empresa não carregada");
      return;
    }

    setLoading(true);
    setMsg("");
    setDados([]);

    try {

      
      const resp = await fetch(buildWebhookUrl(webhook), {
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


 function exportarExcel() {

  const receita = Number(dados.find(d => d.grupo === "RECEITA_BRUTA")?.valor_periodo || 0);
  const custos = Number(dados.find(d => d.grupo === "CUSTOS")?.valor_periodo || 0);
  const despesas = Number(dados.find(d => d.grupo === "DESPESAS_OPERACIONAIS")?.valor_periodo || 0);

  const lucroBruto = receita - custos;
  const resultado = lucroBruto - despesas;

  const linhas = [
    { Grupo: "Receita Bruta", Valor: receita },
    { Grupo: "(-) Custos", Valor: custos },
    { Grupo: "Lucro Bruto", Valor: lucroBruto },
    { Grupo: "Despesas Operacionais", Valor: despesas },
    { Grupo: "Resultado do Período", Valor: resultado }
  ];

  ExcelExport.exportar(linhas, "dre.xlsx");
}

const gruposAnalitico = ["RECEITA", "CUSTO", "DESPESA"];

const dadosAgrupados = gruposAnalitico
  .map((grupo) => {
    const itens = dados.filter((d) => d.grupo === grupo);
    const subtotal = itens.reduce(
      (acc, item) => acc + Number(item.valor || 0),
      0
    );

    return {
      grupo,
      itens,
      subtotal,
    };
  })
  .filter((g) => g.itens.length > 0);

  const nomeGrupo = {
  RECEITA: "Receita",
  CUSTO: "Custo",
  DESPESA: "Despesa",
};

const totalFinalAnalitico = dadosAgrupados.reduce((acc, g) => {
  const subtotal = Number(g.subtotal || 0);

  if (g.grupo === "RECEITA") return acc + subtotal;
  return acc - subtotal; // CUSTO e DESPESA
}, 0);

  return (
    <div className="p-6">
         <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-blue-800 mb-2"> 
      <h1 className="text-2xl font-bold mb-6">
  📊 DRE – Demonstrativo de Resultado{analitico ? " Analítico" : ""}
</h1>

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

        <label className="flex items-center gap-2 font-bold text-[#1e40af]">
        <input
          type="checkbox"
          checked={analitico}
          onChange={(e) => setAnalitico(e.target.checked)}
        />
        Analítico
      </label>

        <button
          onClick={consultar}
            className="btn-pill btn-blue" 
        >
          Consultar
        </button>

        <button
          onClick={() => window.print()}
                 className="btn-pill btn-gray" 
        >
          🖨️ Imprimir
        </button>
         
          <button
             onClick={exportarExcel}
              className="btn-pill btn-green">
          📊 Exportar Excel
          </button>
        
         <button
          onClick={() =>   navigate("/reports") }
             className="btn-pill btn-gray" 
        >   
         ← Voltar
        </button>
      </div>
      </div>

 {/* TABELA */}
      <div id="print-area" className="bg-white rounded-xl shadow overflow-x-auto">
         <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-gray-400 mb-2"> 

 {analitico ? (
  <table className="w-full text-sm">
    <thead className="bg-blue-900 text-white">
      <tr>
        <th className="p-3 text-left">Código</th>
        <th className="p-3 text-left">Conta</th>
         <th className="p-3 text-left">Classificação Gerencia</th> 
        <th className="p-3 text-right">Valor</th>
         <th className="text-right">% sobre grupo</th>
      </tr>
    </thead>
    <tbody>
      {dadosAgrupados.map((g) => (
        <React.Fragment key={g.grupo}>
          <tr className="bg-blue-100">
            <td colSpan={3} className="p-1 font-bold text-blue-900 text-base">
              {g.grupo}
            </td>
          </tr>

          {g.itens.map((l, idx) => (
            <tr
              key={`${g.grupo}-${idx}`}
              className={idx % 2 === 0 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6]"}
            >
              <td className="p-2 font-bold">{l.conta_codigo}</td>
              <td className="p-2">{l.conta_nome}</td>
            <td
                className={`p-2 text-left font-bold ${
                  l.grupo === "RECEITA" ? "text-green-700" : "text-red-600"
                }`}
              >{(l.classificacao_gerencial || "-").replaceAll("_", " ")}</td>
               
              
              <td
                className={`p-2 text-right font-bold ${
                  l.grupo === "RECEITA" ? "text-green-700" : "text-red-600"
                }`}
              >
                {fmt.format(Number(l.valor || 0))}
              </td>

              <td className="text-right font-semibold tabular-nums pr-2">
                  {l.perc_sobre_grupo != null
                    ? `${Number(l.perc_sobre_grupo).toFixed(2)}%`
                    : ""}
                </td>

            </tr>
          ))}

          <tr className="border-t-2 border-gray-500 bg-gray-100">
            <td colSpan={3} className="p-1 text-right font-bold">
              Subtotal {nomeGrupo[g.grupo]}
            </td>
            <td
              className={`p-1 text-right font-bold ${
                g.grupo === "RECEITA" ? "text-green-700" : "text-red-600"
              }`}
            >
              {fmt.format(g.subtotal)}
            </td>
          </tr>
        </React.Fragment>
      ))}

      <tr className="border-t-4 border-black bg-yellow-100">
        <td colSpan={3} className="p-2 text-right font-bold text-lg">
          Resultado do Período
        </td>
        <td
          className={`p-2 text-right font-bold text-lg ${
            totalFinalAnalitico >= 0 ? "text-green-700" : "text-red-600"
          }`}
        >
          {fmt.format(totalFinalAnalitico)}
        </td>
      </tr>
    </tbody>
  </table>
) : (
  // tabela sintética atual
 

      
        <table className="w-full text-sm">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="p-3 text-left">Grupo</th>
              <th className="text-right">% Receita Total</th>
              <th className="p-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
              {/* RECEITA */}
              <tr className="bg-gray-100 font-bold text-lg">
                <td className="p-3">Receita Bruta</td>
                
                <td className="p-3 text-right text-green-700">
                  {fmt.format(receita)}
                </td>

                 <td className="p-3 text-right text-blue-900">
                  {percReceitaTotal(receita)}
                </td>
              </tr>

              {/* CUSTOS */}
              <tr className="bg-gray-100 font-bold text-lg">
                <td className="p-3">(-) Custos</td>
                
                <td className="p-3 text-right text-red-600">
                  {fmt.format(custos)}
                </td>
                 <td className="p-3 text-right text-blue-900">
                  {percReceitaTotal(custos)}
                </td>
              </tr>

              {/* LUCRO BRUTO */}
              <tr className="border-t-4 border-gray-400 font-bold text-lg">
                <td className="p-3">Lucro Bruto</td>
                 
                <td className="p-3 text-right text-green-700">
                  {fmt.format(lucroBruto)}
                </td>
                <td className="p-3 text-right text-blue-900">
                  {percReceitaTotal(lucroBruto)}
                </td>
              </tr>

              {/* DESPESAS */}
              <tr className="bg-gray-100 font-bold text-lg">
                <td className="p-3">Despesas Operacionais</td>
                 
                <td className="p-3 text-right text-red-600">
                  {fmt.format(despesas)}
                </td>

                <td className="p-3 text-right text-blue-900">
                  {percReceitaTotal(despesas)}
                </td>
              </tr>

              {/* RESULTADO FINAL */}
              <tr className="border-t-4 border-black text-xl font-bold">
                <td className="p-3">Resultado do Período</td>
                
                <td className="p-3 text-right text-green-700">
                  {fmt.format(resultado)}
                </td>
                <td className="p-3 text-right text-blue-900">
                  {percReceitaTotal(resultado)}
                </td>

              </tr>
            </tbody>
        </table>
 )}
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
