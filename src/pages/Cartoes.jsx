 import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function AppContasCartoes() {
  const navigate = useNavigate();

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa") ||
    "1";

  const [cartoes, setCartoes] = useState([]);
  const [abaCartao, setAbaCartao] = useState("cartoes");
  const [faturas, setFaturas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [cartaoHistoricoId, setCartaoHistoricoId] = useState("");
  const [faturasHistorico, setFaturasHistorico] = useState([]);
  const [faturaHistoricoId, setFaturaHistoricoId] = useState("");
  const [comprasFatura, setComprasFatura] = useState([]);

  const fmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  function formatarDataBR(data) {
    if (!data) return "-";
    const s = String(data);
    const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return s;
    const [, ano, mes, dia] = match;
    return `${dia}/${mes}/${ano}`;
  }

  async function carregarFaturas() {
    const url = buildWebhookUrl("listasfaturas", {
      empresa_id,
      id: 0,
      status: "aberta",
      mes_referencia: "",
    });

    const resp = await fetch(url);
    const json = await resp.json().catch(() => []);
    setFaturas(Array.isArray(json) ? json : []);
  }

  async function carregarCartoes() {
    const url = buildWebhookUrl("cartoes", {
      id_empresa: empresa_id,
    });

    const resp = await fetch(url, { method: "GET" });
    const data = await resp.json();

    const ativos = Array.isArray(data)
      ? data.filter((c) => c.status === "ativo")
      : [];

    setCartoes(ativos);
  }

  async function carregarTudo() {
    try {
      setCarregando(true);
      await Promise.all([carregarCartoes(), carregarFaturas()]);
    } catch (e) {
      console.log("Erro AppContasCartoes:", e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarHistoricoFaturas(cartaoId) {
    setCartaoHistoricoId(cartaoId);
    setFaturaHistoricoId("");
    setComprasFatura([]);

    const url = buildWebhookUrl("historicofaturas", {
      empresa_id,
      id: cartaoId || 0,
      status: "",
      mes_referencia: "",
    });

    const resp = await fetch(url);
    const json = await resp.json().catch(() => []);

    setFaturasHistorico(Array.isArray(json) ? json : []);
  }

  async function carregarComprasFatura(faturaId) {
    setFaturaHistoricoId(faturaId);

    const url = buildWebhookUrl("transacoes_fatura", {
      empresa_id,
      fatura_id: faturaId,
    });

    const resp = await fetch(url);
    const json = await resp.json().catch(() => []);

    setComprasFatura(Array.isArray(json) ? json : []);
  }

  function calcularResumoFaturasPorCartao(faturas = []) {
    const mapa = {};

    faturas
      .filter((f) => f.status === "aberta")
      .forEach((f) => {
        const cartaoId = String(f.cartao_id);

        if (!mapa[cartaoId]) {
          mapa[cartaoId] = {
            cartao_id: cartaoId,
            limite_total: Number(f.limite_total || 0),
            em_aberto: 0,
            disponivel: Number(f.limite_total || 0),
          };
        }

        mapa[cartaoId].em_aberto += Number(f.valor_total || 0);
        mapa[cartaoId].disponivel =
          mapa[cartaoId].limite_total - mapa[cartaoId].em_aberto;
      });

    return mapa;
  }

  const resumoPorCartao = useMemo(() => {
    return calcularResumoFaturasPorCartao(faturas);
  }, [faturas]);

  const totalLimiteCartoes = useMemo(() => {
    return cartoes.reduce((soma, c) => soma + Number(c.limite_total || 0), 0);
  }, [cartoes]);

  const resumoTotal = useMemo(() => {
    const emAbertoTotal = Object.values(resumoPorCartao).reduce(
      (soma, c) => soma + Number(c.em_aberto || 0),
      0
    );

    return {
      limiteTotal: totalLimiteCartoes,
      emAbertoTotal,
      disponivelTotal: totalLimiteCartoes - emAbertoTotal,
    };
  }, [resumoPorCartao, totalLimiteCartoes]);

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

  const card = {
    background: "#ffffff",
    borderRadius: 28,
    padding: 20,
    boxShadow: "0 10px 28px rgba(15,23,42,0.12)",
    border: "1px solid rgba(148,163,184,0.25)",
  };

  const linhaCartao = {
    display: "grid",
    gridTemplateColumns: "50px 1fr auto auto",
    gap: 16,
    alignItems: "center",
    padding: "16px 10px",
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

  const botaoAba = (ativa) => ({
    border: 0,
    borderRadius: 999,
    padding: "10px 18px",
    background: ativa ? "linear-gradient(135deg,#14b8a6,#0f766e)" : "#e5e7eb",
    color: ativa ? "#fff" : "#475569",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
  });

  function Resumo({ titulo, valor, cor }) {
    return (
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 16,
          boxShadow: "0 8px 20px rgba(0,0,0,.08)",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 900, color: "#64748b" }}>
          {titulo}
        </div>
        <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900, color: cor }}>
          {valor}
        </div>
      </div>
    );
  }

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
            Cartões
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
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,minmax(0,1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <Resumo titulo="Limite Total" valor={fmt.format(resumoTotal.limiteTotal)} cor="#2563eb" />
        <Resumo titulo="Em Aberto" valor={fmt.format(resumoTotal.emAbertoTotal)} cor="#dc2626" />
        <Resumo titulo="Disponível" valor={fmt.format(resumoTotal.disponivelTotal)} cor="#16a34a" />
        <Resumo titulo="Cartões" valor={cartoes.length} cor="#7c3aed" />
      </div>

      <div style={secaoTitulo}>Cartões de crédito</div>

      <div style={card}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
          <button onClick={() => setAbaCartao("cartoes")} style={botaoAba(abaCartao === "cartoes")}>
            Cartões ativos
          </button>

          <button
            onClick={() => {
              setAbaCartao("faturas");
              carregarFaturas();
            }}
            style={botaoAba(abaCartao === "faturas")}
          >
            Faturas Abertas
          </button>

          <button onClick={() => setAbaCartao("historico")} style={botaoAba(abaCartao === "historico")}>
            🕘 Histórico Faturas
          </button>

          <button
            onClick={() => navigate("/app/new-card")}
            title="Novo cartão"
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: 0,
              background: "linear-gradient(135deg,#14b8a6,#0f766e)",
              color: "#fff",
              fontSize: 22,
              fontWeight: 300,
              boxShadow: "0 8px 18px rgba(20,184,166,0.35)",
              cursor: "pointer",
            }}
          >
            +
          </button>
        </div>

        {abaCartao === "cartoes" && (
          <>
            {cartoes.map((c, idx) => {
              const resumo = resumoPorCartao[String(c.id)] || {
                em_aberto: 0,
                disponivel: Number(c.limite_total || 0),
              };

              return (
                <div
                  key={c.id}
                  style={{
                    ...linhaCartao,
                    borderBottom: idx === cartoes.length - 1 ? "0" : linhaCartao.borderBottom,
                  }}
                >
                  <div style={icone}>💳</div>

                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#1e1b4b" }}>
                      {c.nome}
                    </div>

                    <div style={{ marginTop: 4, color: "#64748b", fontSize: 12, fontWeight: 700 }}>
                      {c.bandeira || "Cartão"} • vence dia {c.vencimento_dia || "-"}
                    </div>
                  </div>

                  <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ color: "#ef4444", fontSize: 14, fontWeight: 900 }}>
                      Limite {fmt.format(Number(c.limite_total || 0))}
                    </div>

                    <div style={{ color: "#117768", fontSize: 14, fontWeight: 900 }}>
                      Aberto {fmt.format(Number(resumo.em_aberto || 0))}
                    </div>

                    <div style={{ color: "#0e2d59",  fontSize: 14, fontWeight: 900 }}>
                      Livre {fmt.format(Number(resumo.disponivel || 0))}
                    </div>
                  </div>

                  <button onClick={() => navigate(`/app/edit-card/${c.id}`)} style={botaoEditar}>
                    ✏️ Editar
                  </button>
                </div>
              );
            })}
          </>
        )}

        {abaCartao === "faturas" && (
          <>
            {faturas.length === 0 && (
              <div style={{ color: "#64748b", fontWeight: 700 }}>
                Nenhuma fatura aberta encontrada.
              </div>
            )}

            {faturas.map((f, idx) => (
              <div
                key={f.id}
                style={{
                  ...linhaCartao,
                  gridTemplateColumns: "50px 1fr auto",
                  borderBottom: idx === faturas.length - 1 ? "0" : linhaCartao.borderBottom,
                }}
              >
                <div style={{ ...icone, background: "#fff7ed" }}>💳</div>

                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#1e1b4b" }}>
                    {f.nome}
                  </div>

                  <div style={{ marginTop: 4, fontSize: 12, color: "#64748b", fontWeight: 800 }}>
                    {f.bandeira || "Cartão"} • {f.status} • vence dia {formatarDataBR(f.vencimento)}
                  </div>
                </div>

                <div style={{ fontSize: 16, fontWeight: 900, color: "#ef4444", whiteSpace: "nowrap" }}>
                  {fmt.format(Number(f.valor_total || 0))}
                </div>
              </div>
            ))}
          </>
        )}

        {abaCartao === "historico" && (
          <div style={{ display: "grid", gap: 12 }}>
            <select
              value={cartaoHistoricoId}
              onChange={(e) => carregarHistoricoFaturas(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #cbd5e1",
                borderRadius: 14,
                padding: "10px 12px",
                fontWeight: 800,
              }}
            >
              <option value="">Escolha o cartão</option>
              {cartoes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>

            <select
              value={faturaHistoricoId}
              onChange={(e) => carregarComprasFatura(e.target.value)}
              disabled={!cartaoHistoricoId}
              style={{
                width: "100%",
                border: "1px solid #cbd5e1",
                borderRadius: 14,
                padding: "10px 12px",
                fontWeight: 800,
              }}
            >
              <option value="">Escolha a fatura</option>

              {faturasHistorico
                .filter((f) => f && f.id)
                .map((f) => {
                  const dataRef = f.mes_referencia
                    ? formatarDataBR(f.mes_referencia)
                    : "";

                  const valor =
                    Number(f.valor_total || 0) > 0
                      ? ` - ${fmt.format(Number(f.valor_total || 0))}`
                      : "";

                  const status = f.status ? ` - ${f.status}` : "";

                  return (
                    <option key={f.id} value={f.id}>
                      {dataRef}
                      {status}
                      {valor}
                    </option>
                  );
                })}
            </select>

            {comprasFatura.map((t, idx) => (
              <div
                key={t.id}
                style={{
                  ...linhaCartao,
                  gridTemplateColumns: "50px 1fr auto",
                  borderBottom: idx === comprasFatura.length - 1 ? "0" : linhaCartao.borderBottom,
                }}
              >
                <div style={{ ...icone, background: "#eef2ff" }}>🧾</div>

                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#1e1b4b" }}>
                    {t.descricao}
                  </div>

                  <div style={{ marginTop: 4, fontSize: 12, color: "#64748b", fontWeight: 800 }}>
                    {formatarDataBR(t.data_parcela)} • Parcela {t.parcela_num}/{t.parcela_total}
                  </div>
                </div>

                <div style={{ fontSize: 16, fontWeight: 900, color: "#ef4444", whiteSpace: "nowrap" }}>
                  {fmt.format(Number(t.valor || 0))}
                </div>
              </div>
            ))}
          </div>
        )}

        {abaCartao === "cartoes" && cartoes.length === 0 && !carregando && (
          <div style={{ color: "#64748b", fontWeight: 700 }}>
            Nenhum cartão ativo encontrado.
          </div>
        )}

        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            marginTop: 10,
            paddingTop: 18,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 800, color: "#1e1b4b" }}>
            {abaCartao === "faturas" ? "Total em aberto" : "Limite total"}
          </span>

          <span style={{ fontSize: 16, fontWeight: 900, color: "#1e1b4b" }}>
            {abaCartao === "faturas"
              ? fmt.format(resumoTotal.emAbertoTotal)
              : fmt.format(totalLimiteCartoes)}
          </span>
        </div>
      </div>
    </div>
  );
}