 import { useNavigate } from "react-router-dom";

 export default function AppConfiguracoesMobile() {
  const navigate = useNavigate();

 function abrir(path, tipo = "app") {
  const base = window.location.origin;

  if (tipo === "app") {
    window.location.href = `${base}/app/${path.replace(/^\/+/, "")}`;
    return;
  }

  if (tipo === "sistema") {
    window.location.href = `${base}/${path.replace(/^\/+/, "")}`;
  }
}

  const card = {
    border: "1px solid rgba(255,255,255,0.45)",
    borderRadius: 26,
    padding: 16,
    minHeight: 108,
    color: "white",
    textAlign: "left",
    fontWeight: 900,
    boxShadow: "0 14px 34px rgba(15,23,42,0.22)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

 function Card({ icon, titulo, subtitulo, path, tipo = "app", bg }) {
  return (
    <button onClick={() => abrir(path, tipo)} style={{ ...card, background: bg }}>
        <div style={{ fontSize: 30 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 16 }}>{titulo}</div>
          <div style={{ marginTop: 4, fontSize: 11, opacity: 0.9 }}>
            {subtitulo}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8fafc,#eef2ff,#dbeafe)", padding: 14 }}>
      <div style={{ maxWidth: 790, minHeight: "92vh", margin: "0 auto", borderRadius: 24, padding: 20, background: "linear-gradient(135deg,#ffffff,#eef2ff,#dbeafe)", boxShadow: "0 20px 60px rgba(15,23,42,0.25)" }}>
        <button  onClick={() => navigate("/app/menu")} style={{ border: 0, borderRadius: 999, padding: "8px 14px", fontWeight: 900 }}>
          ← Voltar
        </button>

        <h1 style={{ fontSize: 24, fontWeight: 900 }}>⚙️ Configurações</h1>
        <p style={{ color: "#64748b" }}>Cadastros e consultas rápidas.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Card icon="💳" titulo="Cartões" subtitulo="Cadastro de cartões" path="contas-cartoes" tipo="app" bg="linear-gradient(135deg,#a78bfa,#7c3aed,#4c1d95)" />
         {/* <Card icon="🏦" titulo="Contas financeiras" subtitulo="Bancos e contas" path="/contas-financeiras" bg="linear-gradient(135deg,#67e8f9,#06b6d4,#0f766e)" />
          <Card icon="🧾" titulo="Faturas" subtitulo="Consultar e pagar" path="/faturas" bg="linear-gradient(135deg,#fdba74,#f97316,#b45309)" />*/}
          <Card icon="🏷️" titulo="Categorias" subtitulo="Receitas e despesas" path="/categorias" tipo="app" bg="linear-gradient(135deg,#86efac,#22c55e,#166534)" />
          <Card icon="👤" titulo="Fornecedores" subtitulo="Clientes e parceiros" path="/fornecedores" tipo="app" bg="linear-gradient(135deg,#cbd5e1,#64748b,#1e293b)" />
           <Card icon="📊" titulo="Processamento" subtitulo="Resumo financeiro" path="processar-diario" tipo="app" bg="linear-gradient(135deg,#93c5fd,#3b82f6,#1d4ed8)" />
  
       

        </div>
      </div>
    </div>
  );
}

 
