import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../../config/globals";
import { hojeLocal } from "../../utils/dataLocal";

export default function AppTitulosVencidos() {
  const navigate = useNavigate();

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa") ||
    "1";

  const [lista, setLista] = useState([]);
  const [contas, setContas] = useState([]);
  const [contaId, setContaId] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");

  const fmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  function dataBR(data) {
    if (!data) return "-";
    return String(data).substring(0, 10).split("-").reverse().join("/");
  }

  function labelEvento(e) {
    if (e === "RECEBER") return "Receber";
    if (e === "PAGAMENTO_FATURA_CARTAO") return "Fatura";
    return "Pagar";
  }

  function corEvento(e) {
    if (e === "RECEBER") return "#16a34a";
    if (e === "PAGAMENTO_FATURA_CARTAO") return "#7c3aed";
    return "#ef4444";
  }

  async function carregarContas() {
    const r = await fetch(buildWebhookUrl("listacontas", { empresa_id }));
    const j = await r.json();
    setContas(Array.isArray(j) ? j : []);
  }

  async function pesquisar() {
    try {
      setCarregando(true);

      const url = buildWebhookUrl("titulos_vencidos", {
        empresa_id,
        modo: "vencidos",
        dias: 0,
        conta_id: contaId || null,
      });

      const r = await fetch(url);
      const j = await r.json();

      if (Array.isArray(j) && j[0]?.ok) {
        const dadosBrutos = Array.isArray(j[0].data) ? j[0].data : [j[0].data];

        setLista(
          dadosBrutos.map((item) => ({
            ...item,
            uid: `${item.origem_tabela}:${item.origem_id}`,
          }))
        );
      } else {
        setLista([]);
      }
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarContas();
    pesquisar();
  }, []);

  const listaFiltrada = lista.filter((l) => {
    if (!busca.trim()) return true;
    const t = busca.toLowerCase();

    return (
      String(l.descricao || "").toLowerCase().includes(t) ||
      String(l.parceiro || "").toLowerCase().includes(t) ||
      String(l.evento_codigo || "").toLowerCase().includes(t)
    );
  });

  const total = useMemo(() => {
    return listaFiltrada.reduce((s, l) => s + Number(l.valor || 0), 0);
  }, [listaFiltrada]);

  async function baixarTitulo(titulo) {
    if (!contaId || Number(contaId) === 0) {
      alert("Selecione a conta bancária antes de baixar.");
      return;
    }

    const texto = `${labelEvento(titulo.evento_codigo)} este título?\n\n${titulo.descricao || ""}\nValor: ${fmt.format(Number(titulo.valor || 0))}`;

    if (!window.confirm(texto)) return;

    try {
      setCarregando(true);

      const payload = {
        empresa_id: Number(empresa_id),
        conta_id: Number(contaId),
        itens: [
          {
            origem_tabela: titulo.origem_tabela,
            origem_id: Number(titulo.origem_id),
            evento_codigo: titulo.evento_codigo,
            tipo_origem: titulo.tipo_origem,
          },
        ],
      };

      const resp = await fetch(buildWebhookUrl("executar_titulos"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!resp.ok || data?.ok === false) {
        alert(data?.message || "Erro ao baixar título.");
        return;
      }

      alert("Título baixado com sucesso.");
      pesquisar();
    } catch (e) {
      alert("Erro ao baixar título.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={tela}>
      <div style={topoCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate("/app/menu")} style={botaoVoltar}>←</button>

          <div style={{ fontSize: 22, fontWeight: 900, color: "#1e1b4b" }}>
            Títulos vencidos
          </div>

          <button onClick={pesquisar} style={botaoAtualizar}>↻</button>
        </div>

        <div style={{ marginTop: 22, textAlign: "center" }}>
          <div style={{ color: "#7c7a90", fontSize: 15, fontWeight: 800 }}>
            Total vencido
          </div>

          <div style={{ marginTop: 8, color: "#ef4444", fontSize: 26, fontWeight: 950 }}>
            {carregando ? "Carregando..." : fmt.format(total)}
          </div>

          <div style={{ marginTop: 6, color: "#64748b", fontSize: 12, fontWeight: 800 }}>
            {listaFiltrada.length} título(s) vencido(s)
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={campo}>
          <label style={label}>Conta para baixa</label>
          <select value={contaId} onChange={(e) => setContaId(e.target.value)} style={input}>
            <option value="">Selecione uma conta...</option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div style={campo}>
          <label style={label}>Busca</label>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar título..."
            style={input}
          />
        </div>

        <button onClick={pesquisar} style={botaoConsultar}>
          Atualizar vencidos
        </button>
      </div>

      <div style={secaoTitulo}>Toque no card para baixar</div>

      <div style={{ display: "grid", gap: 10 }}>
        {listaFiltrada.map((l) => (
          <button
            key={l.uid}
            onClick={() => baixarTitulo(l)}
            style={cardTitulo}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#1e1b4b" }}>
                  {l.descricao || "-"}
                </div>

                <div style={{ marginTop: 4, fontSize: 11, color: "#64748b", fontWeight: 800 }}>
                  {l.parceiro || "-"} • Venc. {dataBR(l.vencimento)}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 950, color: corEvento(l.evento_codigo) }}>
                  {fmt.format(Number(l.valor || 0))}
                </div>

                <div style={{ marginTop: 4, fontSize: 11, fontWeight: 900, color: corEvento(l.evento_codigo) }}>
                  {labelEvento(l.evento_codigo)}
                </div>
              </div>
            </div>

            <div style={infoGrid}>
              <span>Dias: <b style={{ color: "#ef4444" }}>{l.dias_atraso}</b></span>
              <span>Status: <b>{l.critico ? "Crítico" : "Normal"}</b></span>
            </div>
          </button>
        ))}

        {!carregando && listaFiltrada.length === 0 && (
          <div style={card}>
            <div style={{ color: "#64748b", fontWeight: 800 }}>
              Nenhum título vencido encontrado.
            </div>
          </div>
        )}
      </div>
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

const botaoConsultar = {
  width: "100%",
  border: 0,
  borderRadius: 999,
  padding: "12px 16px",
  background: "linear-gradient(135deg,#14b8a6,#0f766e)",
  color: "#fff",
  fontWeight: 950,
  fontSize: 14,
  marginTop: 2,
};

const secaoTitulo = {
  fontSize: 18,
  color: "#4b5563",
  fontWeight: 900,
  margin: "18px 0 10px",
};

const cardTitulo = {
  width: "100%",
  textAlign: "left",
  background: "#ffffff",
  borderRadius: 20,
  padding: 12,
  boxShadow: "0 6px 18px rgba(15,23,42,0.10)",
  border: "1px solid rgba(148,163,184,0.22)",
  cursor: "pointer",
};

const infoGrid = {
  marginTop: 10,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 5,
  fontSize: 11,
  color: "#64748b",
  fontWeight: 700,
};