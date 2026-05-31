 import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";

export default function AppContas() {
  const navigate = useNavigate();

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa") ||
    "1";

  const hoje = hojeLocal();

  const [contas, setContas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const fmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  async function carregarContas() {
    const url = buildWebhookUrl("consultasaldo", {
      inicio: hoje,
      fim: hoje,
      empresa_id,
      conta_id: 0,
    });

    const resp = await fetch(url, { method: "GET" });
    const data = await resp.json();

    setContas(Array.isArray(data) ? data : []);
  }

  async function carregarTudo() {
    try {
      setCarregando(true);
      await carregarContas();
    } catch (e) {
      console.log("Erro AppContas:", e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  const totalContas = useMemo(
    () => contas.reduce((soma, c) => soma + Number(c.saldo_final || 0), 0),
    [contas]
  );

  const totalPositivo = useMemo(
    () =>
      contas.reduce((soma, c) => {
        const v = Number(c.saldo_final || 0);
        return v > 0 ? soma + v : soma;
      }, 0),
    [contas]
  );

  const totalNegativo = useMemo(
    () =>
      contas.reduce((soma, c) => {
        const v = Number(c.saldo_final || 0);
        return v < 0 ? soma + v : soma;
      }, 0),
    [contas]
  );

  function valorCor(valor) {
    return Number(valor || 0) >= 0 ? "#16a34a" : "#ef4444";
  }

  const tela = {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#eef5fb,#e8f1fa)",
    padding: 16,
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  };

  const topoCard = {
    borderRadius: "0 0 34px 34px",
    background: "#ffffff",
    padding: "24px 20px 28px",
    boxShadow: "0 8px 22px rgba(15,23,42,0.12)",
    margin: "-16px -16px 24px",
  };

  const secaoTitulo = {
    fontSize: 22,
    color: "#4b5563",
    fontWeight: 900,
    margin: "24px 0 12px",
  };

  const resumoGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 18,
  };

  const resumoCard = {
    background: "#ffffff",
    borderRadius: 22,
    padding: 16,
    boxShadow: "0 8px 20px rgba(15,23,42,0.10)",
    border: "1px solid rgba(148,163,184,0.25)",
  };

  const card = {
    background: "#ffffff",
    borderRadius: 28,
    padding: 18,
    boxShadow: "0 10px 28px rgba(15,23,42,0.12)",
    border: "1px solid rgba(148,163,184,0.25)",
  };

  const linhaConta = {
    display: "grid",
    gridTemplateColumns: "44px 1fr auto auto",
    gap: 14,
    alignItems: "center",
    padding: "16px 8px",
    borderBottom: "1px solid #e5e7eb",
  };

  const icone = {
    width: 40,
    height: 40,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    background: "#eef2ff",
  };

  const botaoEditar = {
    border: 0,
    borderRadius: 999,
    padding: "8px 14px",
    background: "#e0f2fe",
    color: "#0369a1",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
  };

  return (
    <div style={tela}>
      <div style={topoCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              border: 0,
              background: "transparent",
              fontSize: 24,
              fontWeight: 900,
              color: "#1e293b",
              cursor: "pointer",
            }}
          >
            ←
          </button>

          <div style={{ fontSize: 22, fontWeight: 900, color: "#1e1b4b" }}>
            Contas
          </div>

          <button
            onClick={carregarTudo}
            style={{
              border: 0,
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#7c3aed,#4c1d95)",
              color: "#fff",
              fontSize: 18,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            ↻
          </button>
        </div>

        <div style={{ marginTop: 26, textAlign: "center" }}>
          <div style={{ color: "#7c7a90", fontSize: 18, fontWeight: 800 }}>
            Saldo em contas
          </div>

          <div
            style={{
              marginTop: 10,
              color: valorCor(totalContas),
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            {carregando ? "Carregando..." : fmt.format(totalContas)}
          </div>
        </div>
      </div>

      {totalContas < 0 && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            borderRadius: 18,
            padding: "12px 16px",
            fontWeight: 900,
            marginBottom: 16,
          }}
        >
          ⚠️ Atenção: saldo consolidado negativo.
        </div>
      )}

      <div style={resumoGrid}>
        <div style={resumoCard}>
          <div style={{ color: "#64748b", fontWeight: 900, fontSize: 12 }}>TOTAL</div>
          <div style={{ marginTop: 8, color: valorCor(totalContas), fontWeight: 900, fontSize: 18 }}>
            {fmt.format(totalContas)}
          </div>
        </div>

        <div style={resumoCard}>
          <div style={{ color: "#64748b", fontWeight: 900, fontSize: 12 }}>POSITIVO</div>
          <div style={{ marginTop: 8, color: "#16a34a", fontWeight: 900, fontSize: 18 }}>
            {fmt.format(totalPositivo)}
          </div>
        </div>

        <div style={resumoCard}>
          <div style={{ color: "#64748b", fontWeight: 900, fontSize: 12 }}>NEGATIVO</div>
          <div style={{ marginTop: 8, color: "#ef4444", fontWeight: 900, fontSize: 18 }}>
            {fmt.format(totalNegativo)}
          </div>
        </div>

        <div style={resumoCard}>
          <div style={{ color: "#64748b", fontWeight: 900, fontSize: 12 }}>CONTAS</div>
          <div style={{ marginTop: 8, color: "#1e1b4b", fontWeight: 900, fontSize: 18 }}>
            {contas.length}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={secaoTitulo}>Minhas contas</div>

        <button
          onClick={() => navigate("/app/nova-conta")}
          title="Nova conta"
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: 0,
            background: "linear-gradient(135deg,#7c3aed,#4c1d95)",
            color: "#fff",
            fontSize: 24,
            fontWeight: 300,
            boxShadow: "0 8px 18px rgba(124,58,237,0.35)",
            cursor: "pointer",
          }}
        >
          +
        </button>
      </div>

      <div style={card}>
        {contas.map((c, idx) => (
          <div
            key={idx}
            style={{
              ...linhaConta,
              borderBottom: idx === contas.length - 1 ? "0" : linhaConta.borderBottom,
            }}
          >
            <div style={icone}>🏦</div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#1e1b4b" }}>
                {c.conta_nome}
              </div>
              <div style={{ marginTop: 4, color: "#94a3b8", fontSize: 12, fontWeight: 800 }}>
                Conta bancária
              </div>
            </div>

            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: valorCor(c.saldo_final),
                textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              {fmt.format(Number(c.saldo_final || 0))}
            </div>

            <button
              onClick={() =>
                navigate("/app/editar-conta", {
                  state: {
                    ...c,
                    id: c.id ?? c.conta_id ?? c.id_conta,
                    empresa_id: c.empresa_id ?? empresa_id,
                  },
                })
              }
              style={botaoEditar}
            >
              ✏️ Editar
            </button>
          </div>
        ))}

        {contas.length === 0 && (
          <div style={{ color: "#64748b", fontWeight: 700 }}>
            Nenhuma conta encontrada.
          </div>
        )}
      </div>
    </div>
  );
}