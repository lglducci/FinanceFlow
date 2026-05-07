  import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
 
import { Html5QrcodeScanner } from "html5-qrcode";
 


export default function Home() {
 
  
 
 const navigate = useNavigate();

 const [abrirQR, setAbrirQR] = useState(false);
 


   function ir(modo) {
  window.location.href = `https://contabil-flow.lglducci.com.br/app/lancamento?modo=${modo}`;
 //   window.location.href = `http://192.168.1.103:5173/app/lancamento?modo=${modo}`; 
}

const empresa_id =
  localStorage.getItem("empresa_id") ||
  localStorage.getItem("id_empresa");

const [dash, setDash] = useState(null);
const [loadingDash, setLoadingDash] = useState(false);

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

function moeda(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

async function carregarDashboard() {
  try {
    setLoadingDash(true);

    const r = await fetch(
      buildWebhookUrl("dashboard_financeiro", { empresa_id })
    );

    const json = await r.json();
    const payload = json?.[0]?.fn_dashboard_financeiro || null;

    setDash(payload);
  } catch (e) {
    console.error("Erro dashboard mobile:", e);
  } finally {
    setLoadingDash(false);
  }
}

useEffect(() => {
  if (empresa_id) carregarDashboard();
}, [empresa_id]);


function MiniDashboard() {
  return (
    <div
      style={{
        marginBottom: 14,
        borderRadius: 22,
        padding: 14,
        background: "linear-gradient(135deg,#0f172a,#1e3a8a,#0284c7)",
        color: "white",
        boxShadow: "0 12px 28px rgba(15,23,42,0.22)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 800 }}>
            Saldo atual
          </div>
          <div style={{ fontSize: 20, fontWeight: 950 }}>
            {loadingDash ? "..." : moeda(dash?.saldo_atual)}
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboardfinanceiro")}
          style={{
            border: "1px solid rgba(255,255,255,0.35)",
            borderRadius: 999,
            background: "rgba(255,255,255,0.16)",
            color: "white",
            fontWeight: 900,
            padding: "7px 10px",
            fontSize: 11,
          }}
        >
          Mais informações
        </button>
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          fontSize: 11,
          fontWeight: 900,
        }}
      >
        <div>A receber<br />{moeda(dash?.receber_aberto)}</div>
        <div>A pagar<br />{moeda(dash?.pagar_aberto)}</div>
        <div>Cartões<br />{moeda(dash?.faturas_aberto)}</div>
        <div>Projetado 30d<br />{moeda(dash?.saldo_projetado_30_dias)}</div>
      </div>
    </div>
  );
}
 
function parsePix(payload) {
  try {
    let valor = "";
    let descricao = "Pagamento PIX";

    const matchValor = payload.match(/54(\d{2})/);
    if (matchValor) {
      const tamanho = Number(matchValor[1]);
      const inicio = matchValor.index + 4;
      valor = payload.substring(inicio, inicio + tamanho);
    }

    const matchNome = payload.match(/59(\d{2})/);
    if (matchNome) {
      const tamanho = Number(matchNome[1]);
      const inicio = matchNome.index + 4;
      const nome = payload.substring(inicio, inicio + tamanho);
      descricao = `PIX ${nome.trim()}`;
    }

    return {
      modo: "saida",
      forma: "pix",
      valor,
      descricao,
    };
  } catch {
    return null;
  }
}
useEffect(() => {
  if (!abrirQR) return;

  const scanner = new Html5QrcodeScanner(
    "reader",
    {
      fps: 10,
      qrbox: 250,
    },
    false
  );

  scanner.render(
    (decodedText) => {
      scanner.clear().catch(() => {});

      setAbrirQR(false);

      const dados = parsePix(decodedText);
      if (!dados) return;

      const url =
        `https://contabil-flow.lglducci.com.br/app/lancamento` +
        `?modo=${dados.modo}` +
        `&forma=${dados.forma}` +
        `&valor=${dados.valor}` +
        `&descricao=${encodeURIComponent(dados.descricao)}`;

      window.location.href = url;
    },
    () => {}
  );

  return () => {
    scanner.clear().catch(() => {});
  };
}, [abrirQR]);
 

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
              

              <button
            onClick={() => setAbrirQR(true)}
            style={{
              marginTop: 12,
              border: 0,
              borderRadius: 999,
              padding: "10px 16px",
              background: "linear-gradient(135deg,#16a34a,#15803d)",
              color: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            📷 Ler QR Code
          </button>
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
                     navigate("/app/login", { replace: true });
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
            

        <MiniDashboard />
      
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
                icone="🔄"
                titulo="Transferências Bancárias"
                subtitulo="Transferencia entre conta corrente."
                onClick={() => navigate("/app/transferencia")}
            />
 
            
            <BotaoMenu
                icone="⚙️"
                titulo="Configurações"
                subtitulo="Contas , Cartões Fornecedor, Categoria ...."
                onClick={() => navigate("/app/configuracoes")}
            />
 
            
        </div>
      </div>

      {abrirQR && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "#000",
      zIndex: 9999,
      padding: 20,
    }}
  >
    <div id="reader" style={{ background: "#fff", borderRadius: 16 }} />

    <button
      onClick={() => setAbrirQR(false)}
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        background: "#111827",
        color: "#fff",
        border: 0,
        borderRadius: 999,
        padding: "10px 14px",
        fontWeight: "bold",
        zIndex: 10000,
      }}
    >
      Fechar
    </button>
  </div>
)}
 
    </div>
  );
}
