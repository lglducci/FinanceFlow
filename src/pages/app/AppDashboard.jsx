 import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
 import { buildWebhookUrl } from "../../config/globals";

function moeda(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function numero(v) {
  return Number(v || 0);
}

function diasAte(data) {
  if (!data) return 9999;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const d = new Date(data);
  d.setHours(0, 0, 0, 0);

  return Math.ceil((d - hoje) / (1000 * 60 * 60 * 24));
}

function somaPorPrazo(lista = [], dias) {
  return lista
    .filter((i) => {
      const d = diasAte(i.vencimento);
      return d >= 0 && d <= dias;
    })
    .reduce((s, i) => s + numero(i.valor), 0);
}

function MiniCard({ titulo, valor, icone, cor }) {
  return (
    <div className="bg-white rounded-[24px] p-4 shadow-md border border-slate-200">
      <div className="text-2xl">{icone}</div>
      <div className="text-xs font-black text-slate-500 mt-2">{titulo}</div>
      <div className="text-lg font-black mt-1" style={{ color: cor }}>
        {moeda(valor)}
      </div>
    </div>
  );
}

function PrazoLinha({ label, receber, pagar }) {
  const saldo = receber - pagar;

  return (
    <div className="grid grid-cols-3 gap-2 items-center border-b border-slate-200 py-2 last:border-0">
      <div className="font-black text-slate-700">{label}</div>

      <div className="text-right">
        <div className="text-[11px] font-bold text-slate-400">Receber</div>
        <div className="text-sm font-black text-emerald-600">{moeda(receber)}</div>
      </div>

      <div className="text-right">
        <div className="text-[11px] font-bold text-slate-400">Pagar</div>
        <div className="text-sm font-black text-red-600">{moeda(pagar)}</div>
        <div
          className={`text-[11px] font-black ${
            saldo >= 0 ? "text-emerald-600" : "text-red-600"
          }`}
        >
          Saldo {moeda(saldo)}
        </div>
      </div>
    </div>
  );
}

export default function AppDashboard() {
  const navigate = useNavigate();

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
      setData(json?.[0]?.fn_dashboard_financeiro || null);
    } catch (e) {
      console.error("Erro dashboard:", e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (empresa_id) carregar();
  }, [empresa_id]);

  const saldoAtual = numero(data?.saldo_atual);
  const saldoProjetado30 = numero(data?.saldo_projetado_30_dias);

  const receberAberto = numero(data?.receber_aberto);
  const pagarAberto = numero(data?.pagar_aberto);
  const faturasAberto = numero(data?.faturas_aberto);

  const receberVencido = numero(data?.receber_vencido?.valor_total);
  const pagarVencido = numero(data?.pagar_vencido?.valor_total);

  const proximosReceber = data?.proximos_receber || [];
  const proximosPagar = data?.proximos_pagar || [];

  const prazos = useMemo(() => {
    return {
      r7: somaPorPrazo(proximosReceber, 7),
      p7: somaPorPrazo(proximosPagar, 7),
      r15: somaPorPrazo(proximosReceber, 15),
      p15: somaPorPrazo(proximosPagar, 15),
      r30: somaPorPrazo(proximosReceber, 30),
      p30: somaPorPrazo(proximosPagar, 30),
    };
  }, [data]);

  if (loading) return <div className="p-6 font-black">Carregando...</div>;

  if (!data) {
    return (
      <div className="p-6 font-black text-red-600">
        Dashboard sem dados.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef5fb] to-[#e8f1fa] px-4 py-5">
      <div className="w-full max-w-lg mx-auto">


        <div  className="bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0284c7] rounded-t-[28px] shadow-lg px-5 py-5 mb-0 text-white">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-white/15 px-4 py-2 rounded-full text-sm font-black"
            >
              ← Voltar
            </button>

            <button
              onClick={carregar}
              className="bg-white/15 w-10 h-10 rounded-full text-xl font-black"
            >
              ↻
            </button>
          </div>

          <div className="mt-5">
            <div className="text-sm font-bold text-blue-100">
              Saldo atual
            </div>

            <div className="text-4xl font-black mt-1">
              {moeda(saldoAtual)}
            </div>

            <div className="mt-3 inline-block bg-white/15 rounded-full px-4 py-2 text-sm font-black">
              Projetado 30 dias: {moeda(saldoProjetado30)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MiniCard titulo="A receber aberto" valor={receberAberto} icone="💰" cor="#16a34a" />
          <MiniCard titulo="A pagar aberto" valor={pagarAberto} icone="📤" cor="#dc2626" />
          <MiniCard titulo="Cartões abertos" valor={faturasAberto} icone="💳" cor="#2563eb" />
          <MiniCard titulo="Vencidos" valor={receberVencido + pagarVencido} icone="🔔" cor="#ea580c" />
        </div>

        <div className="bg-white rounded-[28px] shadow-xl border border-slate-200 p-5 mt-5">
          <h2 className="text-lg font-black text-[#0f172a] mb-3">
            📆 Próximos 30 dias
          </h2>

          <PrazoLinha label="7 dias" receber={prazos.r7} pagar={prazos.p7} />
          <PrazoLinha label="15 dias" receber={prazos.r15} pagar={prazos.p15} />
          <PrazoLinha label="30 dias" receber={prazos.r30} pagar={prazos.p30} />
        </div>

        <div className="bg-white rounded-[28px] shadow-xl border border-slate-200 p-5 mt-5">
          <h2 className="text-lg font-black text-[#0f172a] mb-3">
            ⚠️ Atenção
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-red-50 p-4">
              <div className="text-xs font-black text-red-500">
                A pagar vencido
              </div>
              <div className="text-lg font-black text-red-700">
                {moeda(pagarVencido)}
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <div className="text-xs font-black text-emerald-600">
                A receber vencido
              </div>
              <div className="text-lg font-black text-emerald-700">
                {moeda(receberVencido)}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}