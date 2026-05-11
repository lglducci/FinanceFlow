 
import { buildWebhookUrl } from "../config/globals";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


function Card({ title, value, color = "bg-gray-100" }) {
  return (
    <div className={`rounded-xl p-4 shadow ${color}`}>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-700">
        {value?.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }) ?? "—"}
      </p>
    </div>
  );
}

function MiniCard({ titulo, valor, cor, icone }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 24,
        padding: 14,
        boxShadow: "0 8px 22px rgba(15,23,42,0.10)",
        border: "1px solid rgba(148,163,184,0.20)",
      }}
    >
      <div style={{ fontSize: 22 }}>{icone}</div>
      <div style={{ fontSize: 12, fontWeight: 900, color: "#64748b", marginTop: 6 }}>
        {titulo}
      </div>
      <div style={{ fontSize: 17, fontWeight: 950, color: cor, marginTop: 4 }}>
        {moeda(valor)}
      </div>
    </div>
  );
}

function AcaoRapida({ titulo, icone, cor, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: 0,
        borderRadius: 22,
        padding: "12px 8px",
        background: "#fff",
        color: cor,
        fontWeight: 900,
        boxShadow: "0 8px 22px rgba(15,23,42,0.10)",
      }}
    >
      <div style={{ fontSize: 22 }}>{icone}</div>
      <div style={{ fontSize: 12, marginTop: 4 }}>{titulo}</div>
    </button>
  );
}

export default function Dashboard() {
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

    const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState("principal"); 
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

  if (loading) {
    return <div className="p-6">Carregando dashboard…</div>;
  }

  if (!data) {
    return (
      <div className="p-6 text-red-600 font-bold">
        Dashboard sem dados
      </div>
    );
  }


  function ultimos6Meses(lista) {
  if (!Array.isArray(lista)) return [];
  return lista.slice(-6);
}

return (
  <div
    style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#eef5fb,#e8f1fa)",
      padding: 16,
      fontFamily: "Arial, sans-serif",
    }}
  >
    <div
      style={{
        maxWidth: 620,
        margin: "0 auto",
      }}
    >

      {/* TOPO */}
      <div
        style={{
          borderRadius: "0 0 34px 34px",
          background: "linear-gradient(135deg,#0f172a,#1e3a8a,#0284c7)",
          padding: "22px 20px 28px",
          boxShadow: "0 8px 22px rgba(15,23,42,0.18)",
          margin: "-16px -16px 20px",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              border: 0,
              borderRadius: 999,
              padding: "8px 14px",
              background: "rgba(255,255,255,0.14)",
              color: "#fff",
              fontWeight: 900,
            }}
          >
            ← Voltar
          </button>

          <button
            onClick={carregar}
            style={{
              border: 0,
              borderRadius: 999,
              padding: "8px 14px",
              background: "rgba(255,255,255,0.14)",
              color: "#fff",
              fontWeight: 900,
            }}
          >
            ↻ Atualizar
          </button>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 800 }}>
            Dashboard Financeiro
          </div>

          <div style={{ fontSize: 34, fontWeight: 950, marginTop: 4 }}>
            {moeda(saldoAtual)}
          </div>

          <div
            style={{
              marginTop: 8,
              display: "inline-block",
              borderRadius: 999,
              background: "rgba(255,255,255,0.12)",
              padding: "7px 14px",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            Projetado 30 dias: {moeda(saldoProjetado30)}
          </div>
        </div>
      </div>

      {/* RESUMO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <MiniCard
          titulo="A receber"
          valor={receberAberto}
          cor="#16a34a"
          icone="💰"
        />

        <MiniCard
          titulo="A pagar"
          valor={pagarAberto}
          cor="#dc2626"
          icone="📤"
        />

        <MiniCard
          titulo="Cartões"
          valor={faturasAberto}
          cor="#1d4ed8"
          icone="💳"
        />

        <MiniCard
          titulo="Vencidos"
          valor={pagarVencido + receberVencido}
          cor="#ea580c"
          icone="🔔"
        />
      </div>

      {/* GRAFICO */}
      <div
        style={{
          marginTop: 18,
          background: "#fff",
          borderRadius: 28,
          padding: 18,
          boxShadow: "0 10px 28px rgba(15,23,42,0.10)",
          border: "1px solid rgba(148,163,184,0.18)",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: "#0f172a",
            marginBottom: 12,
          }}
        >
          📈 Fluxo últimos 60 dias
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={serieReceber}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ano_mes" />
            <YAxis />
            <Tooltip formatter={(v) => moeda(v)} />

            <Line
              type="monotone"
              dataKey="total_recebido"
              stroke="#16a34a"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PROXIMOS */}
      <div
        style={{
          marginTop: 18,
          background: "#fff",
          borderRadius: 28,
          padding: 18,
          boxShadow: "0 10px 28px rgba(15,23,42,0.10)",
          border: "1px solid rgba(148,163,184,0.18)",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: "#0f172a",
            marginBottom: 14,
          }}
        >
          📆 Próximos vencimentos
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {(data?.proximos_pagar || []).slice(0, 5).map((i, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  {i.descricao}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    fontWeight: 700,
                    marginTop: 2,
                  }}
                >
                  {i.vencimento}
                </div>
              </div>

              <div
                style={{
                  color: "#dc2626",
                  fontWeight: 900,
                  fontSize: 14,
                }}
              >
                {moeda(i.valor)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AÇÕES */}
      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
        }}
      >
        <AcaoRapida
          titulo="Entrada"
          icone="📥"
          cor="#16a34a"
          onClick={() => navigate("/app/lancamento?modo=entrada")}
        />

        <AcaoRapida
          titulo="Saída"
          icone="📤"
          cor="#dc2626"
          onClick={() => navigate("/app/lancamento?modo=saida")}
        />

        <AcaoRapida
          titulo="Transferir"
          icone="🔄"
          cor="#2563eb"
          onClick={() => navigate("/app/transferencia")}
        />
      </div>
    </div>
  </div>
);
 
}
