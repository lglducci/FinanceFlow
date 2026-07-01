 import React, { useState, useEffect, useMemo } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { hojeLocal } from "../utils/dataLocal";
import ExcelExport from "../utils/ExcelExport";

export default function RelatoriosDRE() {
  const [empresaId, setEmpresaId] = useState(null);
  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [nivel, setNivel] = useState(1);
  const [dadosSintetico, setDadosSintetico] = useState([]);
  const [dadosAnalitico, setDadosAnalitico] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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

    try {
      const [respSintetico, respAnalitico] = await Promise.all([
        fetch(buildWebhookUrl("der"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id: empresaId,
            data_ini: dataIni,
            data_fim: dataFim,
          }),
        }),
        fetch(buildWebhookUrl("dre_analitico"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id: empresaId,
            data_ini: dataIni,
            data_fim: dataFim,
          }),
        }),
      ]);

      const jsonSintetico = await respSintetico.json();
      const jsonAnalitico = await respAnalitico.json();

      setDadosSintetico(Array.isArray(jsonSintetico) ? jsonSintetico : []);
      setDadosAnalitico(Array.isArray(jsonAnalitico) ? jsonAnalitico : []);
    } catch (e) {
      alert("Erro ao carregar DRE");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!empresaId) return;
    consultar();
  }, [empresaId, dataIni, dataFim]);

  const receita = Number(
    dadosSintetico.find((d) => d.grupo === "RECEITA_BRUTA")?.valor_periodo || 0
  );

  const custos = Number(
    dadosSintetico.find((d) => d.grupo === "CUSTOS")?.valor_periodo || 0
  );

  const despesas = Number(
    dadosSintetico.find((d) => d.grupo === "DESPESAS_OPERACIONAIS")?.valor_periodo || 0
  );

  const lucroBruto = receita - custos;
  const resultado = lucroBruto - despesas;
  const margem = receita ? (resultado / receita) * 100 : 0;

  function perc(valor) {
    if (!receita) return "0,00%";
    return `${((Number(valor || 0) / receita) * 100).toFixed(2)}%`;
  }

  const gruposGerenciais = useMemo(() => {
    const mapa = {
      receita: { titulo: "Receitas", total: 0, itens: [] },
      custo_variavel: { titulo: "Custos Variáveis", total: 0, itens: [] },
      custo_fixo: { titulo: "Custos Fixos", total: 0, itens: [] },
      despesa_variavel: { titulo: "Despesas Variáveis", total: 0, itens: [] },
      despesa_fixa: { titulo: "Despesas Fixas", total: 0, itens: [] },
      sem_classificacao: { titulo: "Sem Classificação", total: 0, itens: [] },
    };

    dadosAnalitico.forEach((item) => {
      const chave = item.classificacao_gerencial || "sem_classificacao";
      const grupo = mapa[chave] || mapa.sem_classificacao;

      grupo.total += Number(item.valor || 0);
      grupo.itens.push(item);
    });

    return Object.entries(mapa)
      .map(([chave, g]) => ({ chave, ...g }))
      .filter((g) => g.itens.length > 0 || g.total !== 0);
  }, [dadosAnalitico]);

  function exportarExcel() {
    if (nivel === 1) {
      ExcelExport.exportar(
        [
          { Indicador: "Receita", Valor: receita },
          { Indicador: "Custos", Valor: custos },
          { Indicador: "Lucro Bruto", Valor: lucroBruto },
          { Indicador: "Despesas", Valor: despesas },
          { Indicador: "Resultado", Valor: resultado },
          { Indicador: "Margem %", Valor: margem },
        ],
        "dre_n1.xlsx"
      );
      return;
    }

    ExcelExport.exportar(dadosAnalitico, `dre_n${nivel}.xlsx`);
  }

  function imprimir() {
  window.print();
}


function dataBR(data) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}


  return (
    <div className="min-h-screen bg-[#eef7fd] px-4 py-5">
      <div className="mx-auto w-full max-w-[1500px] space-y-4">
        <div className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-[#063452]">
                📊 Entenda seu Negócio
              </h1>
              <p className="text-sm font-semibold text-slate-500">
                DRE gerencial por níveis: visão rápida, grupos e contas analíticas
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-2">
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

              <div className="flex overflow-hidden rounded-xl border border-cyan-200 bg-white shadow-sm">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNivel(n)}
                    className={`h-10 px-5 text-sm font-black ${
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

              <button onClick={exportarExcel} className="btn-pill btn-green">
                Excel
              </button>

              <button
                onClick={imprimir}
                className="btn-pill bg-slate-700 text-white"
              >
                🖨️ Imprimir
              </button>

              <button onClick={() => navigate("/reports")} className="btn-pill btn-white">
                Sair
              </button>
            </div>
          </div>
        </div>

        {nivel === 1 && (
          <>
            <div id="dre-print">

              <div className="mb-4 border-b border-slate-300 pb-3 print:block">
                  <h2 className="text-xl font-black text-[#063452]">
                    DRE Gerencial - N{nivel}
                  </h2>

                  <div className="text-sm font-bold text-slate-600">
                    Período: {dataBR(dataIni)} até {dataBR(dataFim)}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <Card titulo="Receita" valor={receita} cor="text-emerald-700" />
                  <Card titulo="Custos" valor={custos} cor="text-red-600" />
                  <Card titulo="Despesas" valor={despesas} cor="text-red-600" />
                  <Card titulo="Resultado" valor={resultado} cor={resultado >= 0 ? "text-emerald-700" : "text-red-600"} />
                  <Card titulo="Margem" valor={`${margem.toFixed(2)}%`} cor={margem >= 0 ? "text-blue-700" : "text-red-600"} texto />
                </div>

                <div className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-[#e7f5fc] text-[#063452]">
                      <tr>
                        <th className="px-4 py-3 text-left font-black">Indicador</th>
                        <th className="px-4 py-3 text-right font-black">Valor</th>
                        <th className="px-4 py-3 text-right font-black">% Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      <Linha nome="Receita Bruta" valor={receita} percentual={perc(receita)} positivo />
                      <Linha nome="(-) Custos" valor={custos} percentual={perc(custos)} negativo />
                      <Linha nome="Lucro Bruto" valor={lucroBruto} percentual={perc(lucroBruto)} destaque />
                      <Linha nome="(-) Despesas Operacionais" valor={despesas} percentual={perc(despesas)} negativo />
                      <Linha nome="Resultado do Período" valor={resultado} percentual={perc(resultado)} final />
                    </tbody>
                  </table>
                </div>
            </div>
          </>
        )}

        {nivel === 2 && (
           <div id="dre-print">

            <div className="mb-4 border-b border-slate-300 pb-3 print:block">
              <h2 className="text-xl font-black text-[#063452]">
                DRE Gerencial - N{nivel}
              </h2>

              <div className="text-sm font-bold text-slate-600">
               Período: {dataBR(dataIni)} até {dataBR(dataFim)}
              </div>
            </div>
          <div className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-[#e7f5fc] text-[#063452]">
                <tr>
                  <th className="px-4 py-3 text-left font-black">Grupo Gerencial</th>
                  <th className="px-4 py-3 text-right font-black">Valor</th>
                  <th className="px-4 py-3 text-right font-black">% Receita</th>
                </tr>
              </thead>
              <tbody>
                {gruposGerenciais.map((g) => (
                  <tr key={g.chave} className="border-b hover:bg-cyan-50">
                    <td className="px-4 py-3 font-black text-[#063452]">
                      {g.titulo}
                    </td>
                    <td className={`px-4 py-3 text-right font-black ${
                      g.chave === "receita" ? "text-emerald-700" : "text-red-600"
                    }`}>
                      R$ {fmt.format(Math.abs(g.total))}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-600">
                      {perc(g.total)}
                    </td>
                  </tr>
                ))}

                <tr className="bg-[#dcecf7]">
                  <td className="px-4 py-3 text-right font-black text-[#063452]">
                    Resultado
                  </td>
                  <td className={`px-4 py-3 text-right font-black ${
                    resultado >= 0 ? "text-emerald-700" : "text-red-600"
                  }`}>
                    R$ {fmt.format(Math.abs(resultado))}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-[#063452]">
                    {perc(resultado)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
            </div>
        )}

        {nivel === 3 && (
           <div id="dre-print">

            <div className="mb-4 border-b border-slate-300 pb-3 print:block">
                <h2 className="text-xl font-black text-[#063452]">
                  DRE Gerencial - N{nivel}
                </h2>

                <div className="text-sm font-bold text-slate-600">
                    Período: {dataBR(dataIni)} até {dataBR(dataFim)}
                </div>
              </div>
          <div className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
           <div className="max-h-[680px] overflow-auto print:max-h-none print:overflow-visible">
              <table className="w-full min-w-[950px] text-sm print:min-w-0 print:text-[10px]">
                <thead className="sticky top-0 bg-[#e7f5fc] text-[#063452]">
                  <tr>
                    <th className="px-4 py-3 text-left font-black">Código</th>
                    <th className="px-4 py-3 text-left font-black">Conta</th>
                    <th className="px-4 py-3 text-left font-black">Classificação</th>
                    <th className="px-4 py-3 text-right font-black">Valor</th>
                    <th className="px-4 py-3 text-right font-black">% Grupo</th>
                  </tr>
                </thead>
                <tbody>
                  {gruposGerenciais.map((g) => (
                    <React.Fragment key={g.chave}>
                      <tr className="bg-[#dcecf7]">
                        <td colSpan={5} className="px-4 py-3 font-black text-[#063452]">
                          {g.titulo}
                        </td>
                      </tr>

                      {g.itens.map((l, i) => (
                        <tr key={`${g.chave}-${i}`} className="border-b hover:bg-cyan-50">
                          <td className="px-4 py-3 font-black text-[#063452]">
                            {l.conta_codigo}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-700">
                            {l.conta_nome}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-500">
                            {(l.classificacao_gerencial || "-").replaceAll("_", " ")}
                          </td>
                          <td className={`px-4 py-3 text-right font-black ${
                            l.grupo === "RECEITA" ? "text-emerald-700" : "text-red-600"
                          }`}>
                            R$ {fmt.format(Math.abs(Number(l.valor || 0)))}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-600">
                            {l.perc_sobre_grupo != null
                              ? `${Number(l.perc_sobre_grupo).toFixed(2)}%`
                              : ""}
                          </td>
                        </tr>
                      ))}

                      <tr className="bg-slate-100">
                        <td colSpan={3} className="px-4 py-3 text-right font-black">
                          Subtotal {g.titulo}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-[#063452]">
                          R$ {fmt.format(Math.abs(g.total))}
                        </td>
                        <td />
                      </tr>
                    </React.Fragment>
                  ))}

                  <tr className="border-t-2 border-[#063452] bg-[#063452] text-white">
                    <td colSpan={3} className="px-4 py-4 text-right text-lg font-black">
                      Resultado do Período
                    </td>

                    <td className="px-4 py-4 text-right text-lg font-black">
                      R$ {fmt.format(Math.abs(resultado))}
                    </td>

                    <td className="px-4 py-4 text-right text-lg font-black">
                      {perc(resultado)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
           </div>
        )}

        {loading && (
          <div className="rounded-2xl bg-white p-6 text-center font-black text-[#063452] shadow-sm">
            Carregando...
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ titulo, valor, cor, texto = false }) {
  const fmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
      <div className="text-xs font-black uppercase text-slate-400">{titulo}</div>
      <div className={`mt-2 text-2xl font-black ${cor}`}>
        {texto ? valor : fmt.format(Number(valor || 0))}
      </div>
    </div>
  );
}

function Linha({ nome, valor, percentual, positivo, negativo, destaque, final }) {
  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const cor = positivo
    ? "text-emerald-700"
    : negativo
    ? "text-red-600"
    : Number(valor) >= 0
    ? "text-emerald-700"
    : "text-red-600";

  return (
    <tr className={`${final ? "bg-[#dcecf7]" : destaque ? "bg-slate-50" : "border-b"} hover:bg-cyan-50`}>
      <td className={`px-4 py-3 ${final ? "text-lg font-black" : "font-bold"} text-[#063452]`}>
        {nome}
      </td>
      <td className={`px-4 py-3 text-right font-black ${cor}`}>
        R$ {fmt.format(Math.abs(Number(valor || 0)))}
      </td>
      <td className="px-4 py-3 text-right font-black text-slate-600">
        {percentual}
      </td>
    </tr>
  );
}