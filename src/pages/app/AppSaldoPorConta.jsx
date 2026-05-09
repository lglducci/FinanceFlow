import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../../config/globals";
import { hojeLocal } from "../../utils/dataLocal";

export default function AppSaldoPorConta() {
  const navigate = useNavigate();

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  const [contaId, setContaId] = useState("");
  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());

  // JÁ COMEÇA OCULTANDO ZERADAS
  const [mostrarZeradas, setMostrarZeradas] = useState(false);

  const fmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  function linhaZerada(c) {
    return (
      Number(c.saldo_inicial || 0) === 0 &&
      Number(c.total_debito || 0) === 0 &&
      Number(c.total_credito || 0) === 0 &&
      Number(c.saldo || 0) === 0
    );
  }

  async function consultar() {
    try {
      setLoading(true);

      const resp = await fetch(
        buildWebhookUrl("saldo_conta"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id,
            data_ini: dataIni,
            data_fim: dataFim,
            filtro: contaId,
          }),
        }
      );

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : []);
    } catch {
      alert("Erro ao carregar saldo por conta.");
    } finally {
      setLoading(false);
    }
  }

  const dadosFiltrados = useMemo(() => {
    return dados.filter(
      (c) => mostrarZeradas || !linhaZerada(c)
    );
  }, [dados, mostrarZeradas]);

  const resumo = useMemo(() => {
    return {
      saldoInicial: dadosFiltrados.reduce(
        (s, c) => s + Number(c.saldo_inicial || 0),
        0
      ),

      saldoFinal: dadosFiltrados.reduce(
        (s, c) => s + Number(c.saldo || 0),
        0
      ),

      valor: dadosFiltrados.reduce(
        (s, c) => s + Number(c.valor || 0),
        0
      ),
    };
  }, [dadosFiltrados]);

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

          <div style={{ fontSize: 21, fontWeight: 900, color: "#1e1b4b" }}>
            Saldos por Conta
          </div>

          <button onClick={consultar} style={botaoAtualizar}>
            ↻
          </button>
        </div>

        <div style={{ marginTop: 22, textAlign: "center" }}>
          <div style={{ color: "#7c7a90", fontSize: 15, fontWeight: 800 }}>
            Saldo consolidado
          </div>

          <div
            style={{
              marginTop: 8,
              color:
                resumo.saldoFinal >= 0
                  ? "#16a34a"
                  : "#ef4444",
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
            {dadosFiltrados.length} conta(s)
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
          <label style={label}>Conta (opcional)</label>

          <input
            type="text"
            value={contaId}
            onChange={(e) => setContaId(e.target.value)}
            placeholder="Código ou nome"
            style={input}
          />
        </div>

        <label style={checkLabel}>
          <input
            type="checkbox"
            checked={!mostrarZeradas}
            onChange={() =>
              setMostrarZeradas(!mostrarZeradas)
            }
          />

          Ocultar contas sem movimento
        </label>

        <button onClick={consultar} style={botaoConsultar}>
          Consultar
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
          valor={fmt.format(resumo.valor)}
          cor={
            resumo.valor >= 0
              ? "#16a34a"
              : "#ef4444"
          }
        />
      </div>

      <div style={secaoTitulo}>Contas</div>

      <div style={{ display: "grid", gap: 10 }}>
        {dadosFiltrados.map((c, i) => (
          <div key={i} style={cardLinha}>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 950,
                  color: "#1e1b4b",
                }}
              >
                {c.codigo}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#475569",
                }}
              >
                {c.nome}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#64748b",
                }}
              >
                Saldo inicial {fmt.format(c.saldo_inicial)}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 950,
                  color:
                    Number(c.valor || 0) >= 0
                      ? "#16a34a"
                      : "#ef4444",
                }}
              >
                {fmt.format(c.valor)}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  fontWeight: 950,
                  color:
                    Number(c.saldo || 0) >= 0
                      ? "#16a34a"
                      : "#ef4444",
                }}
              >
                {fmt.format(c.saldo)}
              </div>
            </div>
          </div>
        ))}

        {!loading && dadosFiltrados.length === 0 && (
          <div style={card}>
            <div
              style={{
                color: "#64748b",
                fontWeight: 800,
              }}
            >
              Nenhuma conta encontrada.
            </div>
          </div>
        )}

        {loading && (
          <div style={card}>
            <div
              style={{
                color: "#2563eb",
                fontWeight: 900,
              }}
            >
              Carregando saldos...
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

      <div style={{ ...miniValor, color: cor }}>
        {valor}
      </div>
    </div>
  );
}

const tela = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#eef5fb,#e8f1fa)",
  padding: 16,
  fontFamily: "Arial, sans-serif",
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

const checkLabel = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 6,
  marginBottom: 14,
  fontSize: 13,
  fontWeight: 800,
  color: "#334155",
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

const cardLinha = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 8,
  background: "#ffffff",
  borderRadius: 20,
  padding: 12,
  boxShadow: "0 6px 18px rgba(15,23,42,0.10)",
  border: "1px solid rgba(148,163,184,0.22)",
};