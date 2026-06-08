 import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";
import ModalEscolhaBanco from "../components/ModalEscolhaBanco";
import NovaConta from "./NovaConta";
import TransferenciaDrawer from "./app/AppTransferencia.jsx";

export default function AppContas() {
  const navigate = useNavigate();

  const [modalBancoAberto, setModalBancoAberto] = useState(false);
  const [bancoSelecionado, setBancoSelecionado] = useState(null);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [drawerAtivo, setDrawerAtivo] = useState(null); // null | "menu" | "nova_conta" | "transferencia"
 
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
    return Number(valor || 0) >= 0 ? "#15803d" : "#b91c1c";
  }

  const tela = {
    minHeight: "100vh",
    background: "#f4f6f8",
    padding: 16,
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  };

  const layout = {
    display: "flex",
    gap: 16,
    alignItems: "stretch",
  };

  const mainArea = {
    flex: drawerAberto ? "0 0 calc(100% - 392px)" : "1 1 100%",
    minWidth: 0,
    transition: "all 240ms ease",
  };

  const topoCard = {
    borderRadius: 24,
    background: "#ffffff",
    padding: "18px 20px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
    border: "1px solid #e5e7eb",
    marginBottom: 16,
  };

  const secaoTitulo = {
    fontSize: 18,
    color: "#0f172a",
    fontWeight: 900,
    margin: "14px 0 10px",
  };

  const resumoGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 16,
  };

  const resumoCard = {
    background: "#ffffff",
    borderRadius: 18,
    padding: 14,
    boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
    border: "1px solid #e5e7eb",
  };

  const card = {
    background: "#ffffff",
    borderRadius: 22,
    padding: 10,
    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
    border: "1px solid #e5e7eb",
  };

  const linhaConta = {
    display: "grid",
    gridTemplateColumns: "44px minmax(180px,1fr) auto auto",
    gap: 14,
    alignItems: "center",
    padding: "14px 10px",
    borderBottom: "1px solid #e5e7eb",
  };

  const icone = {
    width: 40,
    height: 40,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
  };

  const botaoEditar = {
    border: "1px solid #cbd5e1",
    borderRadius: 999,
    padding: "7px 12px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
  };

  const botaoPrimario = {
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "1px solid #1e40af",
    background: "#ffffff",
    color: "#1e40af",
    fontSize: 24,
    fontWeight: 700,
    boxShadow: "0 6px 16px rgba(15,23,42,0.10)",
    cursor: "pointer",
  };

  const botaoRefresh = {
    border: "1px solid #cbd5e1",
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#ffffff",
    color: "#334155",
    fontSize: 17,
    fontWeight: 900,
    cursor: "pointer",
  };

  const drawer = {
    width: 376,
    minWidth: 376,
    borderRadius: 24,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 12px 32px rgba(15,23,42,0.12)",
    overflow: "hidden",
    alignSelf: "flex-start",
    position: "sticky",
    top: 16,
    maxHeight: "calc(100vh - 32px)",
  };

  const drawerHeader = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    borderBottom: "1px solid #e5e7eb",
    background: "#f8fafc",
  };

  const drawerBody = {
    padding: 14,
    display: "grid",
    gap: 12,
  };

  const drawerOption = {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    background: "#ffffff",
    padding: 14,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
  };

  return (
    <div style={tela}>
      <div style={layout}>
        <main style={mainArea}>
          <div style={topoCard}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#1e293b",
                  cursor: "pointer",
                }}
              >
                ←
              </button>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>
                  Contas
                </div>
                <div style={{ color: "#64748b", fontSize: 13, fontWeight: 800 }}>
                  Saldos bancários e movimentações entre contas
                </div>
              </div>

              <button onClick={carregarTudo} style={botaoRefresh}>
                ↻
              </button>
            </div>

            <div style={{ marginTop: 18, textAlign: "center" }}>
              <div style={{ color: "#64748b", fontSize: 14, fontWeight: 800 }}>
                Saldo consolidado
              </div>

              <div
                style={{
                  marginTop: 6,
                  color: valorCor(totalContas),
                  fontSize: 28,
                  fontWeight: 950,
                }}
              >
                {carregando ? "Carregando..." : fmt.format(totalContas)}
              </div>
            </div>
          </div>

          {totalContas < 0 && (
            <div
              style={{
                background: "#fff7ed",
                color: "#9a3412",
                border: "1px solid #fed7aa",
                borderRadius: 16,
                padding: "11px 14px",
                fontWeight: 900,
                marginBottom: 14,
              }}
            >
              Atenção: saldo consolidado negativo.
            </div>
          )}

          <div style={resumoGrid}>
            <div style={resumoCard}>
              <div style={{ color: "#64748b", fontWeight: 900, fontSize: 11 }}>TOTAL</div>
              <div style={{ marginTop: 8, color: valorCor(totalContas), fontWeight: 900, fontSize: 17 }}>
                {fmt.format(totalContas)}
              </div>
            </div>

            <div style={resumoCard}>
              <div style={{ color: "#64748b", fontWeight: 900, fontSize: 11 }}>POSITIVO</div>
              <div style={{ marginTop: 8, color: "#15803d", fontWeight: 900, fontSize: 17 }}>
                {fmt.format(totalPositivo)}
              </div>
            </div>

            <div style={resumoCard}>
              <div style={{ color: "#64748b", fontWeight: 900, fontSize: 11 }}>NEGATIVO</div>
              <div style={{ marginTop: 8, color: "#b91c1c", fontWeight: 900, fontSize: 17 }}>
                {fmt.format(totalNegativo)}
              </div>
            </div>

            <div style={resumoCard}>
              <div style={{ color: "#64748b", fontWeight: 900, fontSize: 11 }}>CONTAS</div>
              <div style={{ marginTop: 8, color: "#0f172a", fontWeight: 900, fontSize: 17 }}>
                {contas.length}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={secaoTitulo}>Minhas contas</div>

            <button
              onClick={() => {
                setDrawerAtivo("menu");
                setDrawerAberto(true);
              }}
              title="Ações"
              style={botaoPrimario}
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
                <div style={icone}>
                  {c.icone_url ? (
                    <img
                      src={c.icone_url}
                      alt={c.banco_nome || c.conta_nome}
                      style={{
                        width: 28,
                        height: 28,
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    "🏦"
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#0f172a" }}>
                    {c.conta_nome}
                  </div>
                  <div style={{ marginTop: 4, color: "#64748b", fontSize: 12, fontWeight: 800 }}>
                    {c.nro_banco ? `Banco ${c.nro_banco}` : "Conta bancária"}
                    {c.agencia ? ` • Ag ${c.agencia}` : ""}
                    {c.conta ? ` • Conta ${c.conta}` : ""}
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
                        icone_url: c.icone_url ?? empresa_id,
                      },
                    })
                  }
                  style={botaoEditar}
                >
                  Editar
                </button>
              </div>
            ))}

            {contas.length === 0 && (
              <div style={{ color: "#64748b", fontWeight: 700, padding: 14 }}>
                Nenhuma conta encontrada.
              </div>
            )}
          </div>
        </main>

        {drawerAberto && (
          <aside style={drawer}>
            <div style={drawerHeader}>
              <button
                type="button"
                onClick={() => {
                  if (drawerAtivo && drawerAtivo !== "menu") {
                    setDrawerAtivo("menu");
                    return;
                  }
                  setDrawerAberto(false);
                  setDrawerAtivo(null);
                }}
                style={{
                  border: 0,
                  background: "transparent",
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#1e293b",
                  cursor: "pointer",
                }}
              >
                ←
              </button>

              <div style={{ fontSize: 14, fontWeight: 950, color: "#0f172a" }}>
                {drawerAtivo === "nova_conta" ? "Nova conta" : drawerAtivo === "transferencia" ? "Transferência" : "Ações da conta"}
              </div>

              <button
                type="button"
                onClick={() => {
                  setDrawerAberto(false);
                  setDrawerAtivo(null);
                }}
                style={{
                  border: 0,
                  background: "transparent",
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div style={drawerBody}>
              {drawerAtivo === "menu" && (
                <>
                  <button
                    type="button"
                    style={drawerOption}
                    onClick={() => setModalBancoAberto(true)}
                  >
                    <div style={{ fontSize: 15, fontWeight: 950, color: "#0f172a" }}>
                      Nova conta bancária
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12, fontWeight: 800, color: "#64748b" }}>
                      Cadastre banco, agência, conta e saldo inicial.
                    </div>
                  </button>

                  <button
                    type="button"
                    style={drawerOption}
                    onClick={() => setDrawerAtivo("transferencia")}
                  >
                    <div style={{ fontSize: 15, fontWeight: 950, color: "#0f172a" }}>
                      Transferência bancária
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12, fontWeight: 800, color: "#64748b" }}>
                      Mova valores entre duas contas cadastradas.
                    </div>
                  </button>
                </>
              )}

              {drawerAtivo === "nova_conta" && (
               <NovaConta
                modoDrawer={true}
                dadosIniciais={bancoSelecionado}
                onClick={() => {
                  setModalBancoAberto(true);
                }}
                onClose={() => setDrawerAtivo(null)}
                onSuccess={() => {
                  setDrawerAtivo(null);
                  setBancoSelecionado(null);
                  carregarTudo();
                }}
              />
              )}

              {drawerAtivo === "transferencia" && (
                <TransferenciaDrawer />
              )}
            </div>
          </aside>
        )}
      </div>

    <ModalEscolhaBanco
  open={modalBancoAberto}
  empresa_id={empresa_id}
  onClose={() => setModalBancoAberto(false)}
  onSelect={(banco) => {
    setModalBancoAberto(false);

    setBancoSelecionado({
      banco_codigo: banco.codigo,
      banco_nome: banco.nome,
      banco_icone_url: banco.icone_url,
      banco_cor_hex: banco.cor_hex,
      agencia: "",
      conta: "",
    });

    setDrawerAberto(true);
    setDrawerAtivo("nova_conta");
  }}
/>

    </div>
  );
}