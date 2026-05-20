import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function DashboardFinanceiroCartao() {
  const navigate = useNavigate();
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa") ||
    "1";

  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);

  function moeda(v) {
    return Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function carregarDashboard() {
    try {
      setCarregando(true);

      const url = buildWebhookUrl("dashboard_financeiro", {
        empresa_id,
      });

      const resp = await fetch(url);
      const json = await resp.json();
    const retorno = Array.isArray(json) ? json[0] : json;

    setDados(
      retorno?.fn_dashboard_financeiro ||
      retorno?.data?.fn_dashboard_financeiro ||
      retorno?.data ||
      retorno ||
      {}
    );
    } catch (e) {
      alert("Erro ao carregar dashboard financeiro.");
      console.log(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDashboard();
  }, []);

  const saldoAtual = Number(dados?.saldo_atual || 0);
  const receberAberto = Number(dados?.receber_aberto || 0);
  const pagarAberto = Number(dados?.pagar_aberto || 0);
  const saldoProjetado30 = Number(dados?.saldo_projetado_30_dias || 0);

  const faturasAberto = Number(dados?.faturas_aberto || 0);
  const faturasVencida = Number(dados?.faturas_vencida || 0);
  const fat7 = Number(dados?.faturas_vencendo_7d || 0);
  const fat15 = Number(dados?.faturas_vencendo_15d || 0);
  const fat30 = Number(dados?.faturas_vencendo_30d || 0);

  const proximasFaturas = dados?.proximas_faturas || [];

  const cardBase =
    "rounded-3xl p-5 shadow-xl border border-white/40 bg-white/90 backdrop-blur";

  const valorClass = (v) =>
    Number(v || 0) >= 0 ? "text-emerald-600" : "text-red-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full bg-white shadow font-black text-slate-700"
          >
            ←
          </button>

          <div className="text-center">
            <h1 className="text-xl md:text-3xl font-black text-slate-800">
              Visão Financeira Rápida
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-bold">
              Caixa, vencimentos e cartões em uma tela
            </p>
          </div>

          <button
            onClick={carregarDashboard}
            className="w-11 h-11 rounded-full bg-indigo-700 text-white shadow font-black"
          >
            ↻
          </button>
        </div>

        {carregando && (
          <div className="bg-white rounded-2xl p-4 text-center font-bold text-slate-600 mb-4">
            Carregando dados...
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className={`${cardBase}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg md:text-2xl font-black text-slate-800">
                  💰 Contas / Caixa
                </h2>
                <p className="text-xs text-slate-500 font-bold">
                  Situação atual e projeção financeira
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MiniCard titulo="Saldo atual" valor={moeda(saldoAtual)} cor={valorClass(saldoAtual)} />
              <MiniCard titulo="A receber" valor={moeda(receberAberto)} cor="text-emerald-600" />
              <MiniCard titulo="A pagar" valor={moeda(pagarAberto)} cor="text-red-600" />
              <MiniCard titulo="Proj. 30 dias" valor={moeda(saldoProjetado30)} cor={valorClass(saldoProjetado30)} />
            </div>

            <div className="mt-5 rounded-2xl bg-slate-900 text-white p-4">
              <div className="text-sm font-bold text-slate-300">
                Resultado previsto
              </div>
              <div className={`text-2xl font-black ${saldoProjetado30 >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                {moeda(saldoProjetado30)}
              </div>
              <div className="text-xs mt-1 text-slate-400">
                Saldo projetado considerando movimentações próximas.
              </div>
            </div>
          </section>

          <section className={`${cardBase}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg md:text-2xl font-black text-slate-800">
                  💳 Cartões
                </h2>
                <p className="text-xs text-slate-500 font-bold">
                  Faturas vencidas e próximas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MiniCard titulo="Vencidas" valor={moeda(faturasVencida)} cor="text-red-600" />
              <MiniCard titulo="7 dias" valor={moeda(fat7)} cor="text-orange-600" />
              <MiniCard titulo="15 dias" valor={moeda(fat15)} cor="text-yellow-600" />
              <MiniCard titulo="30 dias" valor={moeda(fat30)} cor="text-indigo-600" />
            </div>

            <div className="mt-5 rounded-2xl bg-gradient-to-br from-violet-800 to-indigo-900 text-white p-4">
              <div className="text-sm font-bold text-violet-200">
                Total em aberto nos cartões
              </div>
              <div className="text-2xl font-black text-white">
                {moeda(faturasAberto)}
              </div>
            </div>
          </section>
        </div>

        <section className={`${cardBase} mt-5`}>
          <h2 className="text-lg md:text-2xl font-black text-slate-800 mb-3">
            📅 Próximas faturas
          </h2>

          {proximasFaturas.length === 0 ? (
            <div className="text-slate-500 font-bold">
              Nenhuma fatura próxima encontrada.
            </div>
          ) : (
            <div className="grid gap-2">
              {proximasFaturas.map((f) => (
                <div
                  key={f.id}
                  className="grid grid-cols-2 md:grid-cols-5 gap-2 items-center rounded-2xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="font-black text-slate-800">
                    Fatura #{f.id}
                  </div>

                  <div className="text-sm font-bold text-slate-500">
                    Ref: {formatarData(f.mes_referencia)}
                  </div>

                  <div className="text-sm font-bold text-slate-500">
                    Venc: {formatarData(f.vencimento)}
                  </div>

                  <div className="font-black text-red-600 md:text-right">
                    {moeda(f.valor_total)}
                  </div>

                  <div className="text-xs font-black text-center rounded-full bg-emerald-100 text-emerald-700 px-3 py-1">
                    {f.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MiniCard({ titulo, valor, cor }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
      <div className="text-xs font-black text-slate-500">{titulo}</div>
      <div className={`text-base md:text-lg font-black mt-1 ${cor}`}>
        {valor}
      </div>
    </div>
  );
}

function formatarData(data) {
  if (!data) return "-";
  const [ano, mes, dia] = String(data).slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}