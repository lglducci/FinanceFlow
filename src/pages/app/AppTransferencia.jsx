 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../../config/globals";
import { hojeLocal } from "../../utils/dataLocal";

export default function AppTransferencia() {
  const empresa_id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");

  const [contas, setContas] = useState([]);
  const [origemId, setOrigemId] = useState("");
  const [destinoId, setDestinoId] = useState("");
  const [valor, setValor] = useState("");
  const [dataMov, setDataMov] = useState(new Date().toISOString().slice(0, 10));
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);

 

  const url = buildWebhookUrl("consultasaldo", {
  empresa_id,
  inicio: "2021-01-01",
  fim: hojeLocal(),
  conta_id: 0,
});

 async function carregarContas() {
  try {
    const url = buildWebhookUrl("consultasaldo", {
      empresa_id,
      inicio: "2021-01-01",
      fim: hojeLocal(),
      conta_id: 0,
    });

    const resp = await fetch(url);
    const data = await resp.json();

    const lista = Array.isArray(data) ? data : [];

    setContas(
      lista.map((c) => ({
        id: c.conta_id,
        nome: c.conta_nome,
        nro_banco: c.nro_banco,
        agencia: c.agencia,
        conta: c.conta,
        saldo: c.saldo_final,
      }))
    );
  } catch (error) {
    console.error("Erro ao carregar contas:", error);
    setMensagem("Erro ao carregar contas.");
  }
}

useEffect(() => {
  if (empresa_id) carregarContas();
}, [empresa_id]);
  
 
  const contaOrigem = contas.find((c) => String(c.id) === String(origemId));
  const contaDestino = contas.find((c) => String(c.id) === String(destinoId));

  function moeda(v) {
    return Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function valorNumero() {
    return Number(String(valor).replace(/\./g, "").replace(",", "."));
  }

  async function salvar() {
    setMensagem("");

    const v = valorNumero();

    if (!origemId) return setMensagem("Selecione a conta de origem.");
    if (!destinoId) return setMensagem("Selecione a conta de destino.");
    if (String(origemId) === String(destinoId)) return setMensagem("Origem e destino não podem ser iguais.");
    if (!v || v <= 0) return setMensagem("Informe um valor válido.");

    const historico = `Transferência de ${contaOrigem?.nome || "origem"} para ${contaDestino?.nome || "destino"}`;

    try {
      setSalvando(true);

      const resp = await fetch(buildWebhookUrl("transferencia_bancaria"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: Number(empresa_id),
         origem_id: Number(origemId),
          destino_id: Number(destinoId),
          valor: v,
          historico,
          data_mov: dataMov,
        }),
      });

      const data = await resp.json();
            const ret = Array.isArray(data) ? data[0] : data;

            if (!resp.ok || ret?.ok === false || ret?.responseCode >= 400) {
            throw new Error(
                ret?.message ||
                ret?.details?.erro ||
                ret?.data?.financeiro?.erro ||
                ret?.data?.erro ||
                "Erro ao salvar transferência."
            );
            }

      setMensagem("✅ Transferência registrada com sucesso.");
      setValor("");
      await carregarContas();
      setOrigemId("");
      setDestinoId("");
    } catch (e) {
      setMensagem("❌ " + e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={page}>
      <div style={card}>
        <button onClick={() => window.location.href = "/app/menu"} style={backBtn}>
          ← Voltar
        </button>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <div style={{ fontSize: 46 }}>💸</div>
          <h1 style={{ margin: "8px 0 4px", fontSize: 24, fontWeight: 950 }}>
            Transferência
          </h1>
          <p style={{ margin: 0, color: "#64748b", fontWeight: 700 }}>
            Origem ↔ Destino
          </p>
        </div>

        <div style={{ marginTop: 24, display: "grid", gap: 14 }}>
          <div>
            <label style={label}>🏦 Conta origem</label>
            <select value={origemId} onChange={(e) => setOrigemId(e.target.value)} style={input}>
              <option value="">Selecione a origem...</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  🏦 {c.apelido || c.nome} — {moeda(c.saldo)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ textAlign: "center", fontSize: 28, fontWeight: 950, color: "#2563eb" }}>
            ↔
          </div>

          <div>
            <label style={label}>🏦 Conta destino</label>
            <select value={destinoId} onChange={(e) => setDestinoId(e.target.value)} style={input}>
              <option value="">Selecione o destino...</option>
              {contas
                .filter((c) => String(c.id) !== String(origemId))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    🏦 {c.apelido || c.nome} — {moeda(c.saldo)}
                  </option>
                ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={label}>💰 Valor</label>
              <input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" inputMode="decimal" style={input} />
            </div>

            <div>
              <label style={label}>📅 Data</label>
              <input type="date" value={dataMov} onChange={(e) => setDataMov(e.target.value)} style={input} />
            </div>
          </div>

          {origemId && destinoId && origemId !== destinoId && (
            <div style={resumo}>
              {contaOrigem?.nome} ↔ {contaDestino?.nome}
              <br />
              Valor: {moeda(valorNumero())}
            </div>
          )}

          {mensagem && (
            <div style={{
              padding: 12,
              borderRadius: 16,
              fontWeight: 900,
              fontSize: 13,
              background: mensagem.startsWith("✅") ? "#dcfce7" : "#fee2e2",
              color: mensagem.startsWith("✅") ? "#166534" : "#991b1b",
            }}>
              {mensagem}
            </div>
          )}

          <button onClick={salvar} disabled={salvando} style={salvarBtn(salvando)}>
            {salvando ? "Salvando..." : "Confirmar transferência"}
          </button>
        </div>
      </div>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#eef2ff,#dbeafe,#f8fafc)",
  padding: 14,
};

const card = {
  maxWidth: 430,
  margin: "0 auto",
  borderRadius: 28,
  padding: 20,
  background: "linear-gradient(135deg,#ffffff,#eff6ff,#dbeafe)",
  boxShadow: "0 20px 60px rgba(15,23,42,0.25)",
};

const backBtn = {
  border: 0,
  borderRadius: 999,
  padding: "8px 14px",
  fontWeight: 900,
  background: "#fff",
  boxShadow: "0 8px 20px rgba(15,23,42,0.15)",
};

const label = {
  display: "block",
  fontSize: 13,
  fontWeight: 900,
  color: "#334155",
  marginBottom: 6,
};

const input = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 18,
  padding: "13px 14px",
  fontSize: 14,
  fontWeight: 800,
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

const resumo = {
  borderRadius: 20,
  padding: 14,
  background: "linear-gradient(135deg,#dbeafe,#bfdbfe)",
  border: "1px solid #93c5fd",
  color: "#1e3a8a",
  fontWeight: 900,
  fontSize: 13,
};

const salvarBtn = (salvando) => ({
  border: 0,
  borderRadius: 999,
  padding: "15px 18px",
  fontWeight: 950,
  color: "white",
  fontSize: 15,
  background: salvando ? "#94a3b8" : "linear-gradient(135deg,#38bdf8,#2563eb,#1e3a8a)",
  boxShadow: "0 12px 28px rgba(37,99,235,0.35)",
  cursor: salvando ? "not-allowed" : "pointer",
});