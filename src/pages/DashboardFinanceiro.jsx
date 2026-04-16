import { useEffect, useMemo, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function moeda(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function numero(v) {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  return Number(v) || 0;
}

function CardTopo({ titulo, valor, subtitulo = "", destaque = "claro" }) {
  const estilos =
    destaque === "escuro"
      ? "bg-gradient-to-r from-sky-800 to-blue-900 text-white"
      : "bg-gradient-to-r from-cyan-600 to-sky-700 text-white";

  return (
    <div className={`rounded-2xl shadow-md p-5 ${estilos}`}>
      <div className="text-sm font-semibold tracking-wide opacity-95">
        {titulo}
      </div>
      <div className="text-3xl font-extrabold mt-2">{moeda(valor)}</div>
      {subtitulo ? (
        <div className="text-xs mt-2 opacity-90">{subtitulo}</div>
      ) : null}
    </div>
  );
}

function BarraSituacao({ titulo, valor, percentual, cor = "bg-sky-500" }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-black">{titulo}</span>
        <span className="text-sm font-bold text-black">{moeda(valor)}</span>
      </div>

      <div className="w-full h-6 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full ${cor} transition-all duration-500`}
          style={{ width: `${Math.max(0, Math.min(100, percentual))}%` }}
        />
      </div>

      <div className="text-xs text-slate-700 mt-1">
        {percentual.toFixed(1)}% do total em aberto
      </div>
    </div>
  );
}

function CardResumo({ titulo, valor }) {
  return (
    <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-4">
      <div className="text-sm font-semibold text-slate-700">{titulo}</div>
      <div className="text-2xl font-extrabold text-black mt-2">
        {moeda(valor)}
      </div>
    </div>
  );
}

function ListaTitulos({ titulo, itens = [], tipo = "receber" }) {
  const corTitulo = tipo === "receber" ? "text-sky-700" : "text-blue-900";

  return (
    <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-5">
      <h3 className={`text-lg font-bold mb-4 ${corTitulo}`}>{titulo}</h3>

      {itens?.length ? (
        <div className="space-y-2">
          {itens.map((item, idx) => (
            <div
              key={item.id ?? idx}
              className="flex items-center justify-between border-b border-slate-100 py-2"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-black truncate">
                  {item.descricao || "Sem descrição"}
                </div>
                <div className="text-xs text-slate-500">
                  {item.vencimento
                    ? new Date(item.vencimento).toLocaleDateString("pt-BR")
                    : ""}
                </div>
              </div>

              <div className="text-sm font-bold text-black ml-4">
                {moeda(item.valor)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-500">Nenhum registro.</div>
      )}
    </div>
  );
}

export default function DashboardFinanceiro() {
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    setLoading(true);
    try {
      const r = await fetch(
        buildWebhookUrl("dashboard_financeiro", { empresa_id })
      );
      const json = await r.json();
      const payload = json?.[0]?.fn_dashboard_financeiro || null;
      setData(payload);
    } catch (e) {
      console.error("Erro dashboard:", e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const receberAberto = numero(data?.receber_aberto);
  const pagarAberto = numero(data?.pagar_aberto);
  const receberVencido = numero(data?.receber_vencido?.valor_total);
  const pagarVencido = numero(data?.pagar_vencido?.valor_total);
  const saldoProjetado = numero(data?.saldo_projetado);
  const saldoProjetado30 = numero(data?.saldo_projetado_30_dias);
  const saldoAtual = numero(data?.saldo_atual);

  const totalAberto = useMemo(() => {
    return receberAberto + pagarAberto;
  }, [receberAberto, pagarAberto]);

  const percReceber =
    totalAberto > 0 ? (receberAberto / totalAberto) * 100 : 0;
  const percPagar = totalAberto > 0 ? (pagarAberto / totalAberto) * 100 : 0;

  const serieReceber = Array.isArray(data?.receita_12m_serie)
    ? data.receita_12m_serie
    : [];

  const seriePagar = Array.isArray(data?.despesa_12m_serie)
    ? data.despesa_12m_serie
    : [];

  if (loading) {
    return <div className="p-6 text-black">Carregando dashboard…</div>;
  }

  if (!data) {
    return (
      <div className="p-6 text-red-600 font-bold">Dashboard sem dados</div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-black">
            Dashboard Financeiro
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Visão geral de aberto, vencidos, projeção e tendência
          </p>
        </div>

        <button
          onClick={carregar}
          className="px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold hover:brightness-110 transition"
        >
          Atualizar
        </button>
      </div>

      {/* TOPO */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <CardTopo
          titulo="Contas a receber em aberto"
          valor={receberAberto}
          subtitulo="Tudo em aberto cadastrado no sistema"
          destaque="claro"
        />

        <CardTopo
          titulo="Contas a pagar em aberto"
          valor={pagarAberto}
          subtitulo="Tudo em aberto cadastrado no sistema"
          destaque="escuro"
        />

        <CardTopo
          titulo="Contas a receber em atraso"
          valor={receberVencido}
          subtitulo="Títulos vencidos e ainda abertos"
          destaque="claro"
        />

        <CardTopo
          titulo="Contas a pagar em atraso"
          valor={pagarVencido}
          subtitulo="Compromissos vencidos e ainda abertos"
          destaque="escuro"
        />
      </div>

      {/* SITUAÇÃO */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6">
        <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-extrabold text-black mb-5">
            Situação no mês atual
          </h2>

          <div className="space-y-5">
            <BarraSituacao
              titulo="Ativo em aberto"
              valor={receberAberto}
              percentual={percReceber}
              cor="bg-cyan-400"
            />

            <BarraSituacao
              titulo="Passivo em aberto"
              valor={pagarAberto}
              percentual={percPagar}
              cor="bg-blue-900"
            />
          </div>

          <div className="mt-8 border-t pt-5">
            <div className="text-sm font-semibold text-slate-600">
              Projeção líquida com base no cadastro atual
            </div>
            <div className="text-3xl font-extrabold text-black mt-2">
              {moeda(saldoProjetado)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <CardResumo titulo="Saldo atual" valor={saldoAtual} />
          <CardResumo titulo="Saldo projetado 30 dias" valor={saldoProjetado30} />
          <CardResumo titulo="Saldo projetado total" valor={saldoProjetado} />
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-5">
          <h3 className="text-lg font-extrabold text-black mb-4">
            Total a receber
          </h3>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={serieReceber}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ano_mes" />
              <YAxis />
              <Tooltip
                formatter={(v) => moeda(v)}
                labelFormatter={(l) => `Período: ${l}`}
              />
              <Line
                type="monotone"
                dataKey="total_recebido"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-5">
          <h3 className="text-lg font-extrabold text-black mb-4">
            Total a pagar
          </h3>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={seriePagar}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ano_mes" />
              <YAxis />
              <Tooltip
                formatter={(v) => moeda(v)}
                labelFormatter={(l) => `Período: ${l}`}
              />
              <Line
                type="monotone"
                dataKey="total_despesa"
                stroke="#1e3a8a"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LISTAS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ListaTitulos
          titulo="Próximos recebimentos"
          itens={data?.proximos_receber || []}
          tipo="receber"
        />

        <ListaTitulos
          titulo="Próximos pagamentos"
          itens={data?.proximos_pagar || []}
          tipo="pagar"
        />
      </div>
    </div>
  );
}