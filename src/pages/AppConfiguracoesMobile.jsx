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

  function Card({ icon, titulo, subtitulo, path, tipo = "app" }) {
  return (
    <button
      onClick={() => abrir(path, tipo)}
      style={{
        border: "1px solid rgba(148,163,184,0.25)",
        borderRadius: 24,
        padding: 12,
        minHeight: 86,
        background: "linear-gradient(135deg,#e2e8f0,#cbd5e1)",
        boxShadow: "0 8px 24px rgba(15,23,42,0.10)",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          style={{
            width: 32,
            height: 32,
            fontSize: 21,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#2563eb,#1e3a8a)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 16px rgba(13,62,168,0.35)",
          }}
        >
          {icon}
        </span>

        <div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#060d1e", lineHeight: 1.15 }}>
            {titulo}
          </div>
          <div style={{ marginTop: 3, fontSize: 12, fontWeight: 800, color: "#113f70" }}>
            {subtitulo}
          </div>
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
          <Card icon="💳" titulo="Cartões e Contas" subtitulo="Cadastro de cartões e conta corrente" path="contas-cartoes" tipo="app"  />
         {/* <Card icon="🏦" titulo="Contas financeiras" subtitulo="Bancos e contas" path="/contas-financeiras" bg="linear-gradient(135deg,#67e8f9,#06b6d4,#0f766e)" />
          <Card icon="🧾" titulo="Faturas" subtitulo="Consultar e pagar" path="/faturas" bg="linear-gradient(135deg,#fdba74,#f97316,#b45309)" />*/}
          <Card icon="🏷️" titulo="Categorias" subtitulo="Receitas e despesas" path="categorias" tipo="app"   />
          <Card icon="👤" titulo="Fornecedores" subtitulo="Clientes e parceiros" path="/fornecedores" tipo="app"   />
           <Card icon="📊" titulo="Processamento" subtitulo="Resumo financeiro" path="processar-diario" tipo="app"  />
  
       

        </div>
      </div>
    </div>
  );
}

 
