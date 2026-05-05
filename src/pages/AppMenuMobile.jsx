 import { useRouter } from "expo-router";

export default function Home() {
 

  if (typeof window !== "undefined") {
    window.location.href = "https://contabil-flow.lglducci.com.br/app/login";
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      Abrindo FinanceFlow...
    </div>
  );
}

  const router = useRouter();

   function ir(modo) {
  window.location.href = `https://contabil-flow.lglducci.com.br/app/lancamento?modo=${modo}`;
}
 const card = {
  border: "1px solid rgba(255,255,255,0.45)",
  borderRadius: 22,
  padding: 10,
  minHeight: 82,
  color: "white",
  textAlign: "left",
  fontWeight: 900,
  boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
  cursor: "pointer",
};


function BotaoMenu({ icone, titulo, subtitulo, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1px solid rgba(148,163,184,0.25)",
        borderRadius: 24,
        padding: 16,
        minHeight: 108,
        background: "linear-gradient(135deg,#e2e8f0,#cbd5e1)",
        boxShadow: "0 8px 24px rgba(15,23,42,0.10)",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
         <span
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#2563eb,#1e3a8a)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              boxShadow: "0 6px 16px rgba(13, 62, 168, 0.35)",
            }}
          >
            {icone}
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
    <div
      style={{
        minHeight: "40vh",
        background: "linear-gradient(135deg,#f8fafc,#eef2ff,#dbeafe)",
        padding: 14,
        boxSizing: "border-box",
        width: "100%",
          overflow: "hidden",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 590,
          minHeight: "54vh",
          margin: "0 auto",
          borderRadius: 24,
          padding: 10,
          background: "linear-gradient(135deg,#ffffff,#eef2ff,#dbeafe)",
          boxShadow: "0 20px 60px rgba(15,23,42,0.25)",
          boxSizing: "border-box",
          width: "100%",
           overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#0f172a" }}>
              💼 FinanceFlow Mobile  
            </h1>

            <div
              style={{
                marginTop: 10,
                display: "inline-block",
                borderRadius: 999,
                background: "rgba(15,23,42,0.45)",
                color: "white",
                padding: "6px 14px",
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              Menu principal
            </div>

            <p style={{ marginTop: 8, color: "#64748b", fontSize: 13 }}>
              Escolha uma operação rápida.
            </p>
          </div>

          <button
            onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    router.replace("/login");
                  }}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: 0,
              background: "#000",
              color: "#fff",
              fontSize: 22,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 14,
          }}
        >
          <BotaoMenu
                icone="📥"
                titulo="Entrada rápida"
                subtitulo="Dinheiro recebido"
                onClick={() => ir("entrada")}
              />

             <BotaoMenu
                icone="📤"
                titulo="Saída rápida"
                subtitulo="Despesa Paga"
                onClick={() => ir("saida")}
              />

             <BotaoMenu
                icone="📆"
                titulo="Contas a Pagar"
                subtitulo="Criar Vencimentos "
            onClick={() => ir("pagar")}
            />
           
           
             <BotaoMenu
                icone="💰"
                titulo="Contas a Receber"
                subtitulo="Criar Recebimentos "
            onClick={() => ir("receber")} 
             />
            

             <BotaoMenu
                icone="💳"
                titulo="Compras no Cartão"
                subtitulo="Criar compras no Cartão "
            onClick={() => ir("compra_cartao")}
            />
            


              <BotaoMenu
                icone="⚙️"
                titulo="Configurações"
                subtitulo="Contas , Cartões Fornecedor, Categoria ...."
            onClick={() => router.push("/configuracoes")}
            />
            
        </div>
      </div>
    </div>
  );
}