import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../../config/globals";
import { hojeLocal, hojeMaisDias } from "../../utils/dataLocal";

export default function AppRazaoConta() {
  const navigate = useNavigate();

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa") ||
    "1";

  const [dataIni, setDataIni] = useState(hojeMaisDias(-7));
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [contas, setContas] = useState([]);
  const [contaId, setContaId] = useState("");
  const [textoConta, setTextoConta] = useState("");
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  const fmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  function formatarData(data) {
    if (!data) return "";
    return String(data)
      .slice(0, 10)
      .split("-")
      .reverse()
      .join("/");
  }

  useEffect(() => {
    carregarContas();
  }, []);

  async function carregarContas() {
    try {
      const r = await fetch(
        buildWebhookUrl("contas_contabeis_lancaveis", {
          empresa_id,
        })
      );

      const j = await r.json();
      setContas(Array.isArray(j) ? j : []);
    } catch {
      alert("Erro ao carregar contas.");
    }
  }

  async function consultar() {
    if (!contaId) {
      alert("Selecione uma conta.");
      return;
    }

    try {
      setLoading(true);
      setDados([]);

      const resp = await fetch(buildWebhookUrl("razao_por_conta"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          data_ini: dataIni,
          data_fim: dataFim,
          conta_id: contaId,
          filtro: contaId,
        }),
      });

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : []);
    } catch {
      alert("Erro ao carregar razão.");
    } finally {
      setLoading(false);
    }
  }

  const resumo = useMemo(() => {
    if (!dados.length) {
      return {
        saldoInicial: 0,
        saldoFinal: 0,
        totalMovimento: 0,
      };
    }

    return {
      saldoInicial: Number(dados[0]?.saldo_inicial || 0),
      saldoFinal: Number(
        dados[dados.length - 1]?.saldo_final || 0
      ),
      totalMovimento: dados.reduce(
        (s, l) => s + Math.abs(Number(l.valor || 0)),
        0
      ),
    };
  }, [dados]);

  return (
    <div style={tela}>
      <div style={topoCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={() => navigate("/app/relatorios")}
            style={botaoVoltar}
          >
            ←
          </button>

          <div style={{ fontSize: 22, fontWeight: 900, color: "#1e1b4b" }}>
            Razão por Conta
          </div>

          <button onClick={consultar} style={botaoAtualizar}>
            ↻
          </button>
        </div>

        <div style={{ marginTop: 22, textAlign: "center" }}>
          <div style={{ color: "#7c7a90", fontSize: 15, fontWeight: 800 }}>
            Saldo final
          </div>

          <div
            style={{
              marginTop: 8,
              color: resumo.saldoFinal >= 0 ? "#16a34a" : "#ef4444",
              fontSize: 28,
              fontWeight: 950,
            }}
          >
            {fmt.format(resumo.saldoFinal)}
          </div>

          <div
            style={{
              marginTop: 6,
              color: "#64748b",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {dados.length} lançamento(s)
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={campo}>
            <label style={label}>Início</label>
            <input
              type="date"
              value={dataIni}
              onChange={(e) => setDataIni(e.target.value)}
              style={input}
            />
          </div>

          <div style={campo}>
            <label style={label}>Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              style={input}
            />
          </div>
        </div>

        <div style={campo}>
          <label style={label}>Conta contábil</label>

          <input
            list="lista-contas-mobile"
            placeholder="Código ou nome"
            value={textoConta}
            onChange={(e) => {
              const texto = e.target.value;
              setTextoConta(texto);

              const conta = contas.find(
                (c) =>
                  `${c.codigo} - ${c.nome}`.toLowerCase() ===
                  texto.toLowerCase()
              );

              setContaId(conta?.id || "");
            }}
            style={input}
          />

          <datalist id="lista-contas-mobile">
            {contas.map((c) => (
              <option
                key={c.id}
                value={`${c.codigo} - ${c.nome}`}
              />
            ))}
          </datalist>
        </div>

        <button onClick={consultar} style={botaoConsultar}>
          Consultar razão
        </button>
      </div>

      <div style={dashboardGrid}>
        <MiniCard
          titulo="Saldo inicial"
          valor={fmt.format(resumo.saldoInicial)}
          cor="#1e1b4b"
        />

        <MiniCard
          titulo="Movimento"
          valor={fmt.format(resumo.totalMovimento)}
          cor="#2563eb"
        />
      </div>

      <div style={secaoTitulo}>Movimentações</div>

      <div style={{ display: "grid", gap: 10 }}>
        {dados.map((l, i) => (
          <div key={i} style={cardLancamento}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 950,
                    color: "#1e1b4b",
                  }}
                >
                  {formatarData(l.data_mov)}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#64748b",
                  }}
                >
                  {l.historico || "-"}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    fontWeight: 900,
                    color: "#475569",
                  }}
                >
                  Contrapartida: {l.conta_contrapartida || "-"}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 950,
                    color:
                      Number(l.valor || 0) >= 0
                        ? "#16a34a"
                        : "#ef4444",
                  }}
                >
                  {fmt.format(Number(l.valor || 0))}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    fontWeight: 900,
                    color:
                      Number(l.saldo_final || 0) >= 0
                        ? "#16a34a"
                        : "#ef4444",
                  }}
                >
                  Saldo {fmt.format(Number(l.saldo_final || 0))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {!loading && dados.length === 0 && (
          <div style={card}>
            <div style={{ color: "#64748b", fontWeight: 800 }}>
              Nenhuma movimentação encontrada.
            </div>
          </div>
        )}

        {loading && (
          <div style={card}>
            <div style={{ color: "#2563eb", fontWeight: 900 }}>
              Carregando razão...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniCard({ titulo, valor, cor }) {
  return (
    <div style={miniCard}>
      <div style={miniLabel}>{titulo}</div>
      <div style={{ ...miniValor, color: cor }}>{valor}</div>
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

const dashboardGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginBottom: 14,
};

const miniCard = {
  background: "#ffffff",
  borderRadius: 20,
  padding: 12,
  boxShadow: "0 6px 18px rgba(15,23,42,0.10)",
  border: "1px solid rgba(148,163,184,0.22)",
};

const miniLabel = {
  color: "#7c7a90",
  fontSize: 12,
  fontWeight: 800,
};

const miniValor = {
  marginTop: 6,
  fontSize: 14,
  fontWeight: 950,
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