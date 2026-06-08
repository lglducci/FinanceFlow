  import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

 const navigate = useNavigate();

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


function dadosBancarios(c) {
  const partes = [];

  if (c.nro_banco) partes.push(`Banco ${c.nro_banco}`);
  if (c.agencia) partes.push(`Ag ${c.agencia}`);
  if (c.conta) partes.push(`Conta ${c.conta}`);

  return partes.length ? partes.join(" • ") : "Dados bancários não informados";
}



  return (
    <div style={page}>
      <div style={card}>
         <button onClick={() => navigate(-1)} style={backBtn}>
          ← 
        </button>

        <div style={{ marginTop: 12 }}>
          <h1 style={{ margin: "4px 0 4px", fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
            Transferência entre contas
          </h1>
          <p style={{ margin: 0, color: "#64748b", fontWeight: 700, fontSize: 13 }}>
            Movimente valores entre contas bancárias da empresa.
          </p>
        </div>

        <div style={{ marginTop: 24, display: "grid", gap: 14 }}>
          <div>
            <label style={label}>Conta origem</label>
             
               <select value={origemId} onChange={(e) => setOrigemId(e.target.value)} style={input}>
                <option value="">Selecione a origem...</option>
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>
                      {c.nome} — {moeda(c.saldo)}
                      {c.agencia || c.conta ? ` — Ag: ${c.agencia || "-"} Cc: ${c.conta || "-"}` : ""}
                    </option>
                ))}
              </select>
               {contaOrigem && (
                <div style={infoContaLinha}>
                  <span style={{ fontWeight: 950 }}>
                    {contaOrigem.nome}
                  </span>

                  <span>
                    {contaOrigem.agencia || contaOrigem.conta
                      ? `Ag: ${contaOrigem.agencia || "-"} • Cc: ${contaOrigem.conta || "-"}`
                      : "Dados não informados"}
                  </span>

                  <span
                    style={{
                      fontWeight: 950,
                      color: Number(contaOrigem.saldo || 0) < 0 ? "#dc2626" : "#16a34a",
                    }}
                  >
                    Saldo: {moeda(contaOrigem.saldo)}
                  </span>
                </div>
              )}
          </div>

          <div style={{ textAlign: "center", fontSize: 20, fontWeight: 900, color: "#64748b" }}>
            ↓
          </div>

          <div>
            <label style={label}>Conta destino</label>
            <select value={destinoId} onChange={(e) => setDestinoId(e.target.value)} style={input}>
              <option value="">Selecione o destino...</option>
              {contas
                .filter((c) => String(c.id) !== String(origemId))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} — {moeda(c.saldo)}
                    {c.agencia || c.conta ? ` — Ag: ${c.agencia || "-"} Cc: ${c.conta || "-"}` : ""}
                  </option>
                ))}
            </select>

            {contaDestino && (
                <div style={infoContaLinha}>
                  <span style={{ fontWeight: 950 }}>
                    {contaDestino.nome}
                  </span>

                  <span>
                    {contaDestino.agencia || contaDestino.conta
                      ? `Ag: ${contaDestino.agencia || "-"} • Cc: ${contaDestino.conta || "-"}`
                      : "Dados não informados"}
                  </span>

                  <span
                    style={{
                      fontWeight: 950,
                      color: Number(contaDestino.saldo || 0) < 0 ? "#dc2626" : "#16a34a",
                    }}
                  >
                    Saldo: {moeda(contaDestino.saldo)}
                  </span>
                </div>
              )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={label}>Valor</label>
              <input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" inputMode="decimal" style={input} />
            </div>

            <div>
              <label style={label}>Data</label>
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
              background: mensagem.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
              color: mensagem.startsWith("✅") ? "#166534" : "#991b1b",
              border: mensagem.startsWith("✅") ? "1px solid #bbf7d0" : "1px solid #fecaca",
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
  minHeight: "100%",
  background: "#f8fafc",
  padding: 10,
};

const card = {
  maxWidth: 460,
  margin: "0 auto",
  borderRadius: 20,
  padding: 18,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 12px 30px rgba(15,23,42,0.10)",
};

const backBtn = {
  border: "1px solid #cbd5e1",
  borderRadius: 999,
  padding: "7px 12px",
  fontWeight: 850,
  background: "#ffffff",
  color: "#334155",
  boxShadow: "none",
};

const label = {
  display: "block",
  fontSize: 12,
  fontWeight: 850,
  color: "#334155",
  marginBottom: 5,
};

const input = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: "10px 12px",
  fontSize: 13,
  fontWeight: 750,
  background: "#ffffff",
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
};

const resumo = {
  borderRadius: 14,
  padding: 12,
  background: "#f1f5f9",
  border: "1px solid #cbd5e1",
  color: "#334155",
  fontWeight: 850,
  fontSize: 12,
};

const infoConta = {
  marginTop: 6,
  fontSize: 12,
  fontWeight: 750,
  color: "#475569",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: "8px 10px",
};

const infoContaLinha = {
  marginTop: 6,
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  fontSize: 11,
  fontWeight: 750,
  color: "#475569",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: "7px 9px",
};

const salvarBtn = (salvando) => ({
  border: 0,
  borderRadius: 12,
  padding: "12px 16px",
  fontWeight: 900,
  color: "white",
  fontSize: 14,
  background: salvando ? "#94a3b8" : "#0f172a",
  boxShadow: "0 8px 18px rgba(15,23,42,0.18)",
  cursor: salvando ? "not-allowed" : "pointer",
});