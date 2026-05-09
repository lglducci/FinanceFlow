import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../../config/globals";
import { hojeLocal } from "../../utils/dataLocal";
import { fetchSeguro } from "../../utils/apiSafe";

export default function AppProcessaContabil() {
  const navigate = useNavigate();
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa") ||
    "1";

  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [ultimoFechamento, setUltimoFechamento] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [dados, setDados] = useState([]);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [processado, setProcessado] = useState(false);

  const fmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  function formatarDataBR(data) {
    if (!data) return "-";
    return String(data).slice(0, 10).split("-").reverse().join("/");
  }

  async function carregarStatus() {
    try {
      const r = await fetch(buildWebhookUrl("ultimo_processamento", { empresa_id }));
      const text = await r.text();
      if (!text) return;

      const resp = JSON.parse(text);
      const item = Array.isArray(resp) ? resp[0] : resp;

      if (item?.ultimo_dia_processado) {
        setUltimoFechamento(item.ultimo_dia_processado.slice(0, 10));
      }

      if (item?.data_referencia) {
        setDataIni(item.data_referencia.slice(0, 10));
      }

      setDataFim(hojeLocal());
    } catch (e) {
      console.log("Erro ao carregar status contábil mobile:", e);
    }
  }

  async function consultarMovimento() {
    const r = await fetch(buildWebhookUrl("movimento_contabil"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        data_ini: dataIni,
        data_fim: dataFim,
        todos: "P",
      }),
    });

    const json = await r.json();
    setDados(Array.isArray(json) ? json : []);
  }

  async function gerarContabil() {
    const confirmar = window.confirm(
      `Gerar contábil de ${formatarDataBR(dataIni)} até ${formatarDataBR(dataFim)}?`
    );

    if (!confirmar) return;

    try {
      setLoading(true);
      setMsg("");
      setMostrarDetalhes(false);
      setProcessado(false);

      const data = await fetchSeguro(buildWebhookUrl("processa_tudo"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          data_ini: dataIni,
          data_fim: dataFim,
        }),
      });

      if (!data?.ok) {
        throw new Error(data?.message || "Erro ao gerar contábil.");
      }

      await consultarMovimento();
      await carregarStatus();

      window.dispatchEvent(new Event("contabil-atualizado"));

      setProcessado(true);
      setMsg("Contábil gerado com sucesso.");
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const totalValor = useMemo(() => {
    return dados.reduce((s, l) => s + Number(l.credito || l.debito || 0), 0);
  }, [dados]);

  const totalLotes = useMemo(() => {
    return new Set(dados.map((l) => l.lote_id).filter(Boolean)).size;
  }, [dados]);

  return (
    <div style={tela}>
      <div style={topoCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate("/app/menu")} style={botaoVoltar}>
            ←
          </button>

          <div style={{ fontSize: 22, fontWeight: 900, color: "#1e1b4b" }}>
            Processar contábil
          </div>

          <button onClick={carregarStatus} style={botaoAtualizar}>
            ↻
          </button>
        </div>

        <div style={{ marginTop: 22, textAlign: "center" }}>
          <div style={{ color: "#7c7a90", fontSize: 15, fontWeight: 800 }}>
            Último fechamento
          </div>

          <div style={{ marginTop: 8, color: "#1e1b4b", fontSize: 24, fontWeight: 950 }}>
            {ultimoFechamento ? formatarDataBR(ultimoFechamento) : "Não localizado"}
          </div>

          <div style={{ marginTop: 6, color: "#64748b", fontSize: 12, fontWeight: 800 }}>
            Gere somente após revisar os lançamentos financeiros
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={campo}>
            <label style={label}>Início</label>
            <input type="date" value={dataIni} disabled style={{ ...input, background: "#f1f5f9" }} />
          </div>

          <div style={campo}>
            <label style={label}>Fim</label>
            <input
              type="date"
              value={dataFim}
              max={hojeLocal()}
              onChange={(e) => setDataFim(e.target.value)}
              style={input}
            />
          </div>
        </div>

        <button onClick={gerarContabil} disabled={loading} style={botaoProcessar(loading)}>
          {loading ? "Processando..." : "Gerar contábil"}
        </button>
      </div>

      {(msg || processado) && (
        <div style={cardResumo}>
          <div style={{ fontSize: 15, fontWeight: 950, color: "#166534" }}>
            ✅ {msg || "Processamento concluído."}
          </div>

          <div style={resumoGrid}>
            <div>
              <div style={miniLabel}>Período</div>
              <div style={miniValor}>
                {formatarDataBR(dataIni)} até {formatarDataBR(dataFim)}
              </div>
            </div>

            <div>
              <div style={miniLabel}>Lançamentos</div>
              <div style={miniValor}>{dados.length}</div>
            </div>

            <div>
              <div style={miniLabel}>Lotes</div>
              <div style={miniValor}>{totalLotes}</div>
            </div>

            <div>
              <div style={miniLabel}>Valor</div>
              <div style={{ ...miniValor, color: "#16a34a" }}>
                {fmt.format(totalValor)}
              </div>
            </div>
          </div>

          {dados.length > 0 && (
            <button
              onClick={() => setMostrarDetalhes((v) => !v)}
              style={botaoDetalhes}
            >
              {mostrarDetalhes ? "Ocultar detalhes" : "Ver detalhes"}
            </button>
          )}
        </div>
      )}

      {mostrarDetalhes && (
        <>
          <div style={secaoTitulo}>Detalhes gerados</div>

          <div style={{ display: "grid", gap: 10 }}>
            {dados.map((l, i) => (
              <div key={`${l.id}-${i}`} style={cardLancamento}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#1e1b4b" }}>
                      #{l.id} • {formatarDataBR(l.data)}
                    </div>

                    <div style={{ marginTop: 4, fontSize: 11, color: "#64748b", fontWeight: 800 }}>
                      {l.historico || "-"}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 950, color: "#16a34a" }}>
                      {fmt.format(Number(l.credito || l.debito || 0))}
                    </div>

                    <div style={{ marginTop: 4, fontSize: 11, fontWeight: 900, color: "#64748b" }}>
                      Lote {l.lote_id || "-"}
                    </div>
                  </div>
                </div>

                <div style={infoGrid}>
                  <span>Débito: <b>{l.conta_debito || "-"}</b></span>
                  <span>Crédito: <b>{l.conta_credito || "-"}</b></span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!processado && !loading && (
        <div style={cardAviso}>
          <b>Atenção:</b> no celular esta tela mostra apenas o resumo. Os detalhes completos continuam melhores no desktop.
        </div>
      )}
    </div>
  );
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
  padding: "24px 20px 26px",
  boxShadow: "0 8px 22px rgba(15,23,42,0.12)",
  margin: "-16px -16px 18px",
};

const botaoVoltar = {
  border: 0,
  background: "transparent",
  fontSize: 28,
  fontWeight: 900,
  color: "#1e293b",
};

const botaoAtualizar = {
  border: 0,
  width: 42,
  height: 42,
  borderRadius: "50%",
  background: "linear-gradient(135deg,#7c3aed,#4c1d95)",
  color: "#fff",
  fontSize: 20,
  fontWeight: 900,
};

const card = {
  background: "#ffffff",
  borderRadius: 24,
  padding: 14,
  boxShadow: "0 10px 28px rgba(15,23,42,0.12)",
  border: "1px solid rgba(148,163,184,0.25)",
  marginBottom: 16,
};

const campo = {
  marginBottom: 10,
};

const label = {
  display: "block",
  fontSize: 13,
  color: "#4b5563",
  fontWeight: 900,
  marginBottom: 6,
};

const input = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 15,
  padding: "10px 12px",
  fontSize: 13,
  fontWeight: 800,
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

const botaoProcessar = (loading) => ({
  width: "100%",
  border: 0,
  borderRadius: 999,
  padding: "13px 16px",
  background: loading
    ? "#94a3b8"
    : "linear-gradient(135deg,#14b8a6,#0f766e)",
  color: "#fff",
  fontWeight: 950,
  fontSize: 14,
  marginTop: 4,
});

const cardResumo = {
  background: "#ffffff",
  borderRadius: 24,
  padding: 16,
  boxShadow: "0 10px 28px rgba(15,23,42,0.12)",
  border: "1px solid rgba(34,197,94,0.35)",
  marginBottom: 16,
};

const resumoGrid = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const miniLabel = {
  color: "#7c7a90",
  fontSize: 12,
  fontWeight: 800,
};

const miniValor = {
  marginTop: 5,
  fontSize: 14,
  fontWeight: 950,
  color: "#1e1b4b",
};

const botaoDetalhes = {
  width: "100%",
  border: 0,
  borderRadius: 999,
  padding: "11px 14px",
  background: "linear-gradient(135deg,#7c3aed,#4c1d95)",
  color: "#fff",
  fontWeight: 950,
  fontSize: 13,
  marginTop: 16,
};

const secaoTitulo = {
  fontSize: 18,
  color: "#4b5563",
  fontWeight: 900,
  margin: "18px 0 10px",
};

const cardLancamento = {
  background: "#ffffff",
  borderRadius: 20,
  padding: 12,
  boxShadow: "0 6px 18px rgba(15,23,42,0.10)",
  border: "1px solid rgba(148,163,184,0.22)",
};

const infoGrid = {
  marginTop: 10,
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 5,
  fontSize: 11,
  color: "#64748b",
  fontWeight: 700,
};

const cardAviso = {
  background: "#fff7ed",
  border: "1px solid #fdba74",
  borderRadius: 22,
  padding: 14,
  color: "#9a3412",
  fontSize: 13,
  fontWeight: 800,
};