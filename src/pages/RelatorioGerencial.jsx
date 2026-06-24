 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function RelatorioGerencial() {
  const empresa_id = Number(localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa"));

  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth() + 1);

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(false);
  
  const navigate = useNavigate();

  async function carregar() {
    setLoading(true);
    setErro(false);
    setDados(null);

    try {
      const url = buildWebhookUrl("kpis", {
        empresa_id,
        ano,
        mes,
      });

      const r = await fetch(url);
      if (!r.ok) throw new Error("fetch");

      const json = await r.json();
      if (!Array.isArray(json) || json.length === 0) {
        setErro(true);
        return;
      }

      setDados(json[0]);
    } catch {
      setErro(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

 return (
  <div className="min-h-screen bg-slate-50 p-4 md:p-6">
    <div className="mx-auto max-w-[1500px] space-y-5">
      {/* HEADER / FILTROS */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              📈 Relatório Gerencial Mensal
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              KPIs financeiros do mês selecionado.
            </p>
          </div>

          <button
            onClick={() => navigate("/reports")}
            className="btn-pill btn-white flex items-center gap-2"
          >
            ← Voltar
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Ano
                </label>
                <input
                  type="number"
                  value={ano}
                  onChange={(e) => setAno(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Mês
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={mes}
                  onChange={(e) => setMes(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                onClick={carregar}
                className="btn-pill btn-green flex items-center gap-2"
              >
                🔎 Consultar
              </button>

              <button
                onClick={() => window.print()}
                className="btn-pill btn-white flex items-center gap-2"
              >
                🖨️ Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="text-lg font-black text-blue-700">
            Carregando relatório gerencial...
          </div>
        </div>
      )}

      {erro && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-black text-red-700 shadow-sm">
          Erro ao carregar relatório
        </div>
      )}

      {dados && (
        <div id="print-area" className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-black text-slate-800">
                Indicadores do período
              </h2>
              <p className="text-sm font-semibold text-slate-500">
                Competência {String(mes).padStart(2, "0")}/{ano}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              <Card titulo="Receita Líquida" valor={dados.receita_liquida} moeda />
              <Card titulo="CMV / CSP" valor={dados.cmv_csp} moeda />
              <Card
                titulo="Margem Contribuição"
                valor={dados.margem_contribuicao}
                moeda
              />
              <Card titulo="Despesa Fixa" valor={dados.despesa_fixa} moeda />
              <Card
                titulo="Resultado Líquido"
                valor={dados.resultado_liquido}
                moeda
              />
              <Card titulo="Liquidez" valor={dados.liquidez_aprox} />
              <Card titulo="Endividamento" valor={dados.endividamento_aprox} />
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}

  function Card({ titulo, valor, moeda, percentual, detalhe }) {
  return (
    <div className="p-4 rounded-xl border bg-gray-200 shadow">
      <div className="text-sm text-gray-500">{titulo}</div>

      <div className="text-xl font-bold text-blue-900">
        {moeda
          ? Number(valor || 0).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : percentual
          ? `${(Number(valor || 0) * 100).toFixed(2)}%`
          : Number(valor || 0).toFixed(2)}
      </div>

      {detalhe && (
        <div className="text-xs text-gray-500 mt-1">{detalhe}</div>
      )}
    </div>
  );
}