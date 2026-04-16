import { useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";

export default function RelatorioDreGerencial() {
  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [totais, setTotais] = useState(null);
  const [analitico, setAnalitico] = useState([]);
  const [resumo, setResumo] = useState(null);

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa") ||
    "0";

  async function carregarRelatorio() {
    try {
      setLoading(true);
      setErro("");

      const urlTotais = buildWebhookUrl("dre_gerencial_totais", {
        empresa_id,
        data_ini: dataIni,
        data_fim: dataFim,
      });

      const urlAnalitico = buildWebhookUrl("dre_gerencial_analitico", {
        empresa_id,
        data_ini: dataIni,
        data_fim: dataFim,
      });

      const urlResumo = buildWebhookUrl("dre_gerencial_resumo", {
        empresa_id,
        data_ini: dataIni,
        data_fim: dataFim,
      });

      const [respTotais, respAnalitico, respResumo] = await Promise.all([
        fetch(urlTotais),
        fetch(urlAnalitico),
        fetch(urlResumo),
      ]);

      const jsonTotais = await respTotais.json();
      const jsonAnalitico = await respAnalitico.json();
      const jsonResumo = await respResumo.json();

      const itemTotais = Array.isArray(jsonTotais) ? jsonTotais[0] : jsonTotais;
      const itemResumo = Array.isArray(jsonResumo) ? jsonResumo[0] : jsonResumo;
      const listaAnalitico = Array.isArray(jsonAnalitico) ? jsonAnalitico : [];

      setTotais(itemTotais || null);
      setResumo(itemResumo || null);
      setAnalitico(listaAnalitico);
    } catch (e) {
      setErro("Erro ao carregar relatório.");
    } finally {
      setLoading(false);
    }
  }

  const peValor = resumo && resumo.margem_percentual > 0
    ? toNumber(resumo.despesa_fixa || 0) / toNumber(resumo.margem_percentual || 0)
    : 0;

  const ticketMedio = resumo && toNumber(resumo.receita || 0) > 0
    ? toNumber(resumo.receita || 0) / Math.max(1, contarReceitas(analitico))
    : 0;

  const peQtd = ticketMedio > 0 ? peValor / ticketMedio : 0;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-slate-900">DRE Gerencial</h1>

        
          <p className="mt-2 text-slate-600">
            Informe o período e gere a base do cálculo com margem de contribuição, ponto de equilíbrio e resultado.
          </p>
           
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <CampoData label="Data inicial" value={dataIni} onChange={setDataIni} />
            <CampoData label="Data final" value={dataFim} onChange={setDataFim} />

            <button
              onClick={carregarRelatorio}
              disabled={loading}
              className="h-11 rounded-2xl bg-slate-900 text-white font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Gerando..." : "Gerar relatório"}
            </button>

              <button
          onClick={() => window.print()}
             className="h-11 rounded-2xl bg-slate-500 text-white font-semibold hover:opacity-90 disabled:opacity-60"
            >
          🖨️ Imprimir
        </button>
          </div>

          {erro ? <p className="mt-4 text-red-600 font-semibold">{erro}</p> : null}
        </div>
            <div id="print-area" className="bg-white rounded-xl shadow overflow-x-auto"> 
        {totais && resumo && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-900">Base do cálculo</h2>
                <p className="mt-2 text-slate-600">
                  Estes valores são a base do cálculo gerencial no período informado.
                </p>

                <div className="mt-6 space-y-3">
                  <LinhaBase titulo="Receita 4.x" valor={totais.receita_4x} cor="text-emerald-700" />
                  <LinhaBase titulo="5.x Custo Variável" valor={totais.custo_variavel_5x} cor="text-red-600" />
                  <LinhaBase titulo="5.x Custo Fixo" valor={totais.custo_fixo_5x} cor="text-red-600" />
                  <LinhaBase titulo="6.x Despesa Variável" valor={totais.despesa_variavel_6x} cor="text-red-600" />
                  <LinhaBase titulo="6.x Despesa Fixa" valor={totais.despesa_fixa_6x} cor="text-red-600" />
                  <LinhaBase titulo="6.x Não Operacional" valor={totais.nao_operacional_6x} cor="text-amber-700" />
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-slate-700">
                  <p><strong>MC</strong> = Receita 4.x - 5.x Custo Variável - 6.x Despesa Variável</p>
                  <p className="mt-2"><strong>Lucro Operacional</strong> = MC - 5.x Custo Fixo - 6.x Despesa Fixa</p>
                  <p className="mt-2"><strong>Resultado Final</strong> = Lucro Operacional - 6.x Não Operacional</p>
                </div>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-900">Indicadores e fórmulas</h2>
                <p className="mt-2 text-slate-600">
                  Resultado resumido com base na classificação gerencial.
                </p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CardIndicador titulo="Margem de Contribuição" valor={formatarMoeda(resumo.margem_contribuicao)} />
                  <CardIndicador titulo="% Margem de Contribuição" valor={formatarPercentual(toNumber(resumo.margem_percentual) * 100)} />
                  <CardIndicador titulo="Lucro Operacional" valor={formatarMoeda(resumo.lucro_operacional)} />
                  <CardIndicador titulo="Resultado Final" valor={formatarMoeda(resumo.resultado_final)} />
                  <CardIndicador titulo="Ponto de Equilíbrio" valor={formatarMoeda(peValor)} />
                  <CardIndicador titulo="PE em Quantidade" valor={formatarNumero(peQtd)} />
                </div>

                <div className="mt-6 space-y-3">
                  <LinhaFormula titulo="Margem de Contribuição" formula={`${formatarMoeda(totais.receita_4x)} - ${formatarMoeda(totais.custo_variavel_5x)} - ${formatarMoeda(totais.despesa_variavel_6x)}`} resultado={formatarMoeda(resumo.margem_contribuicao)} />
                  <LinhaFormula titulo="% MC" formula={`${formatarMoeda(resumo.margem_contribuicao)} ÷ ${formatarMoeda(totais.receita_4x)}`} resultado={formatarPercentual(toNumber(resumo.margem_percentual) * 100)} />
                  <LinhaFormula titulo="PE" formula={`${formatarMoeda(totais.despesa_fixa_6x)} ÷ ${formatarPercentual(toNumber(resumo.margem_percentual) * 100)}`} resultado={formatarMoeda(peValor)} />
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Analítico</h2>
                  <p className="mt-2 text-slate-600">
                    Use esta visão para revisar contas que entraram em cada classificação e reclassificar se necessário.
                  </p>
                </div>
              </div>

                <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="px-3 py-2">Grupo</th>
                      <th className="px-3 py-2">Classificação</th>
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Conta</th>
                      <th className="px-3 py-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analitico.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="px-3 py-2">{item.grupo}</td>
                        <td className="px-3 py-2">{formatarTexto(item.classificacao_gerencial)}</td>
                        <td className="px-3 py-2">{item.conta_codigo}</td>
                        <td className="px-3 py-2">{item.conta_nome}</td>
                        <td className="px-3 py-2 text-right font-semibold">{formatarMoeda(item.valor)}</td>
                      </tr> 
                    ))}
                  </tbody> 
                </table>
              </div> 
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  );
}

function CampoData({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-11 w-full rounded-2xl border border-slate-300 px-4 outline-none"
      />
    </div>
  );
}

function LinhaBase({ titulo, valor, cor = "text-slate-900" }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
      <span className="text-slate-700">{titulo}</span>
      <span className={`font-bold ${cor}`}>{formatarMoeda(valor)}</span>
    </div>
  );
}

function CardIndicador({ titulo, valor }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{titulo}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{valor}</p>
    </div>
  );
}

function LinhaFormula({ titulo, formula, resultado }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
      <p className="text-sm font-semibold text-slate-900">{titulo}</p>
      <p className="mt-2 text-slate-600">{formula}</p>
      <p className="mt-2 text-lg font-bold text-slate-900">{resultado}</p>
    </div>
  );
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(toNumber(valor));
}

function formatarPercentual(valor) {
  return `${toNumber(valor).toFixed(2)}%`;
}

function formatarNumero(valor) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(valor));
}

function formatarTexto(texto) {
  if (!texto) return "-";

  return String(texto)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function contarReceitas(lista) {
  return lista.filter((item) => item.classificacao_gerencial === "receita").length;
}
