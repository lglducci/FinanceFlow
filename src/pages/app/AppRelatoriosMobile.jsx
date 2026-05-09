import { useNavigate } from "react-router-dom";

export default function AppRelatoriosMobile() {
  const navigate = useNavigate();

  const relatorios = [
    {
      icone: "📈",
      titulo: "Fluxo Realizado",
      subtitulo: "Entradas e saídas realizadas", 
      path: "/app/fluxo-realizado"
    },
    {
      icone: "📊",
      titulo: "Fluxo Projetado",
      subtitulo: "Previsão futura do caixa",
      path: "/app/fluxo-projetado",
 
    },
    {
      icone: "🏦",
      titulo: "Saldos por Conta",
      subtitulo: "Saldo por conta financeira",
      path: "/app/saldo-conta",
    },
     {
            icone: "Σ",
            titulo: "DRE Sintético",
            subtitulo: "Resultado resumido",
            path: "/app/dre?tipo=sintetico",
            },
            {
            icone: "📄",
            titulo: "DRE Analítico",
            subtitulo: "Resultado detalhado",
            path: "/app/dre?tipo=analitico",
            },
    {
      icone: "📘",
      titulo: "Razão por Conta",
      subtitulo: "Movimento contábil por conta",
      path: "/app/razao",
    },
  ];

  function abrir(path) {
    window.location.href = path;
  }

  function BotaoRelatorio({ icone, titulo, subtitulo, onClick }) {
    return (
      <button onClick={onClick} style={botao}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={iconeBox}>{icone}</span>

          <div>
            <div style={tituloStyle}>{titulo}</div>
            <div style={subtituloStyle}>{subtitulo}</div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div style={tela}>
      <div style={container}>
        <div style={topo}>
          <button onClick={() => navigate("/app/menu")} style={voltar}>
            ←
          </button>

          <div>
            <div style={tituloTopo}>Relatórios</div>
            <div style={subtituloTopo}>Consultas rápidas para celular</div>
          </div>

          <button onClick={() => window.location.reload()} style={refresh}>
            ↻
          </button>
        </div>

        <div style={aviso}>
          No celular, deixamos apenas os relatórios mais úteis. Para análises completas, use a versão web.
        </div>

        <div style={grid}>
          {relatorios.map((r) => (
            <BotaoRelatorio
              key={r.titulo}
              icone={r.icone}
              titulo={r.titulo}
              subtitulo={r.subtitulo}
              onClick={() => abrir(r.path)}
            />
          ))}

          <BotaoRelatorio
            icone="💻"
            titulo="Saiba mais"
            subtitulo="Acesse a versão web para relatórios completos"
            onClick={() =>
              alert("Para relatórios completos, acesse o FinanceFlow pelo computador ou navegador web.")
            }
          />
        </div>
      </div>
    </div>
  );
}

const tela = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#f8fafc,#eef2ff,#dbeafe)",
  padding: 14,
  boxSizing: "border-box",
  fontFamily: "Arial, sans-serif",
};

const container = {
  maxWidth: 590,
  margin: "0 auto",
  borderRadius: 24,
  padding: 12,
  background: "linear-gradient(135deg,#ffffff,#eef2ff,#dbeafe)",
  boxShadow: "0 20px 60px rgba(15,23,42,0.22)",
};

const topo = {
  display: "grid",
  gridTemplateColumns: "42px 1fr 42px",
  alignItems: "center",
  gap: 10,
  marginBottom: 14,
};

const voltar = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  border: 0,
  background: "#ffffff",
  color: "#1e293b",
  fontSize: 28,
  fontWeight: 900,
  boxShadow: "0 8px 20px rgba(15,23,42,0.12)",
};

const refresh = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  border: 0,
  background: "linear-gradient(135deg,#7c3aed,#4c1d95)",
  color: "#fff",
  fontSize: 20,
  fontWeight: 900,
};

const tituloTopo = {
  fontSize: 24,
  fontWeight: 950,
  color: "#0f172a",
};

const subtituloTopo = {
  marginTop: 3,
  fontSize: 13,
  fontWeight: 800,
  color: "#64748b",
};

const aviso = {
  marginBottom: 14,
  borderRadius: 22,
  padding: 13,
  background: "linear-gradient(135deg,#0f172a,#1e3a8a,#0284c7)",
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 800,
  boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 14,
};

const botao = {
  border: "1px solid rgba(148,163,184,0.25)",
  borderRadius: 24,
  padding: 12,
  minHeight: 86,
  background: "linear-gradient(135deg,#e2e8f0,#cbd5e1)",
  boxShadow: "0 8px 24px rgba(15,23,42,0.10)",
  textAlign: "left",
  cursor: "pointer",
};

const iconeBox = {
  width: 32,
  height: 32,
  fontSize: 20,
  borderRadius: "50%",
  background: "linear-gradient(135deg,#2563eb,#1e3a8a)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 6px 16px rgba(13,62,168,0.35)",
  fontWeight: 900,
};

const tituloStyle = {
  fontSize: 14,
  fontWeight: 900,
  color: "#060d1e",
  lineHeight: 1.15,
};

const subtituloStyle = {
  marginTop: 3,
  fontSize: 12,
  fontWeight: 800,
  color: "#113f70",
};