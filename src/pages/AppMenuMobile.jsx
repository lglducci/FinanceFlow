   import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
 import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";
 
//import { Html5QrcodeScanner } from "html5-qrcode";
 
 import {
  Html5QrcodeScanner,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

export default function Home() {
 
  
 
 const navigate = useNavigate();

 const [abrirQR, setAbrirQR] = useState(false);
 const [tipoLeitor, setTipoLeitor] = useState(null);

const [alertaContabil, setAlertaContabil] = useState(null);
 
function ir(modo) {
  navigate(`/app/lancamento?modo=${modo}`);
}

const empresa_id =
  localStorage.getItem("empresa_id") ||
  localStorage.getItem("id_empresa");

const [dash, setDash] = useState(null);
const [loadingDash, setLoadingDash] = useState(false);
const [qtdVencidos, setQtdVencidos] = useState(0);


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


function abrirLeitor(tipo) {
  setTipoLeitor(tipo);
  setAbrirQR(true);
}

async function carregarQtdVencidos() {
  try {
    const url = buildWebhookUrl("vencidos", {
      id_empresa: empresa_id,
    });

    const resp = await fetch(url);
    const data = await resp.json();

    const item = Array.isArray(data) ? data[0] : data;
    setQtdVencidos(Number(item?.qtd_vencidos || 0));
  } catch {
    setQtdVencidos(0);
  }
}

useEffect(() => {
  if (empresa_id) carregarQtdVencidos();
}, [empresa_id]);


function BotaoMenu({ icone, titulo, subtitulo, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1px solid rgba(148,163,184,0.25)",
        borderRadius: 14,
        padding: 10,
        minHeight: 36,
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
          onClick={() => navigate("/app/dashboard")}
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


 function tratarCodigoLido(decodedText) {
  const limpo = String(decodedText || "").trim();
  const numeros = limpo.replace(/\D/g, "");

  // PIX
  if (limpo.startsWith("000201") || limpo.includes("BR.GOV.BCB.PIX")) {
    return parsePix(limpo);
  }

  // BOLETO
  if (numeros.length >= 44) {
    return parseBoleto(numeros);
  }

  return null;
}

function parsePix(payload) {
  try {
    let i = 0;
    let valor = "";
    let descricao = "Pagamento PIX";

    while (i < payload.length) {
      const tag = payload.substring(i, i + 2);
      const len = Number(payload.substring(i + 2, i + 4));
      const value = payload.substring(i + 4, i + 4 + len);

      if (tag === "54") valor = value;
      if (tag === "59") descricao = `PIX ${value.trim()}`;

      i = i + 4 + len;
    }

    return {
      modo: "saida",
      forma: "pix",
      valor,
      descricao,
    };
  } catch {
    return {
      modo: "saida",
      forma: "pix",
      valor: "",
      descricao: "Pagamento PIX",
    };
  }
}


useEffect(() => {
  if (!abrirQR) return;

 const configScanner =
  tipoLeitor === "barra"
    ? {
        fps: 15,
        qrbox: { width: 620, height: 280 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.ITF_14,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
        ],
      }
    : {
        fps: 10,
        qrbox: 250,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
      };


 const scanner = new Html5QrcodeScanner(
  "reader",
  configScanner,
  false
);

  scanner.render(
    (decodedText) => {
      scanner.clear().catch(() => {});

      setAbrirQR(false);

      alert(decodedText);
console.log("CODIGO LIDO:", decodedText);

     const dados = tratarCodigoLido(decodedText);
      if (!dados) return;
     navigate(
  `/app/lancamento?modo=${dados.modo}` +
  `&forma=${dados.forma}` +
  `&valor=${dados.valor || ""}` +
  `&vencimento=${dados.vencimento || ""}` +
  `&descricao=${encodeURIComponent(dados.descricao || "")}` +
  `&codigo=${encodeURIComponent(dados.codigo || decodedText)}`
);
    },
    () => {}
  );

  return () => {
    scanner.clear().catch(() => {});
  };
}, [abrirQR]);
 
 async function carregarAlertaContabil() {
  try {
    const empresa_id =
      localStorage.getItem("empresa_id") ||
      localStorage.getItem("id_empresa") ||
      "0";

    const resp = await fetch(
      buildWebhookUrl("ultimo_processamento", { empresa_id })
    );

    const data = await resp.json();
    const item = Array.isArray(data) ? data[0] : data;

    const hoje = hojeLocal();

     

    const ultimoProcessado = item?.ultimo_dia_processado
      ? item.ultimo_dia_processado.slice(0, 10)
      : null;


      const temAlerta =
  item?.data_reprocessar_de ||
  (ultimoProcessado && ultimoProcessado < hoje);

      if (temAlerta) {
  setAlertaContabil(item);
} else {
  setAlertaContabil(null);
} 
  } catch (e) {
    console.log("Erro alerta contábil mobile:", e);
    setAlertaContabil(null);
  }
}

useEffect(() => {
  if (empresa_id) carregarAlertaContabil();
}, [empresa_id]);

useEffect(() => {
  function atualizar() {
    carregarAlertaContabil();
  }

  window.addEventListener("contabil-atualizado", atualizar);

  return () => {
    window.removeEventListener("contabil-atualizado", atualizar);
  };
}, []);

 function parseBoleto(codigo) {
  try {
    const numeros = String(codigo || "").replace(/\D/g, "");

    if (numeros.length < 44) return null;

    // ==============================
    // ARRECADAÇÃO / CONTA DE CONSUMO
    // Ex: Claro, água, luz, telefone
    // ==============================
    if (numeros.startsWith("8")) {
      // Para o código da Claro lido:
      // 848900000000459401622026021917006956002511988

      const valorCentavos = Number(numeros.substring(11, 15));

      const valor =
        valorCentavos > 0
          ? (valorCentavos / 100).toFixed(2)
          : "";

      const venc = numeros.substring(21, 27);

      let vencimento = hojeLocal();

      if (/^\d{6}$/.test(venc)) {
       const ano = "20" + venc.substring(0, 2);
        const mes = venc.substring(2, 4);
        const dia = venc.substring(4, 6);

        vencimento = `${ano}-${mes}-${dia}`;

        vencimento = `${ano}-${mes}-${dia}`;
      }

      return {
        modo: "pagar",
        forma: "aprazo",
        valor,
        vencimento,
        descricao: "Conta de consumo",
        codigo: numeros,
      };
    }

    // ==============================
    // BOLETO BANCÁRIO COMUM
    // ==============================
    const valorStr = numeros.substring(9, 19);
    const valor = (Number(valorStr) / 100).toFixed(2);

    const fator = Number(numeros.substring(5, 9));

    let vencimento = hojeLocal();

    if (fator > 0) {
      const base = new Date(1997, 9, 7);
      base.setDate(base.getDate() + fator);

      vencimento =
        base.getFullYear() +
        "-" +
        String(base.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(base.getDate()).padStart(2, "0");
    }

    return {
      modo: "pagar",
      forma: "aprazo",
      valor,
      vencimento,
      descricao: "Boleto bancário",
      codigo: numeros,
    };
  } catch {
    return null;
  }
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
      <style>
        {`
          @keyframes sinoMexendo {
            0% { transform: rotate(0deg); }
            20% { transform: rotate(-18deg); }
            40% { transform: rotate(18deg); }
            60% { transform: rotate(-12deg); }
            80% { transform: rotate(12deg); }
            100% { transform: rotate(0deg); }
          }
        `}
      </style>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#0f172a" }}>
              💼 FinanceFlow Mobile  
            </h1>
              
              <button onClick={() => abrirLeitor("qrcode")}>
                      📷 Ler QR Code / Pix
                    </button>

                    <button onClick={() => abrirLeitor("barra")}>
                      ▦ Ler Código de Barras
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
                titulo="Receitas"
                subtitulo="A Vista"
                onClick={() => ir("entrada")}
              />

             <BotaoMenu
                icone="📤"
                titulo="Despesas"
                subtitulo=" A Vista"
                onClick={() => ir("saida")} 
              />

              <BotaoMenu
                icone="💰"
                titulo="Receber a Prazo"
              //  subtitulo="Receber "
            onClick={() => ir("receber")} 
             />

             <BotaoMenu
                icone="📆"
                titulo="Despesas a Prazo"
             //   subtitulo="Despesas a Prazo "
            onClick={() => ir("pagar")}
            />
           
           
              
            

             <BotaoMenu
                icone="💳"
                titulo="Compras no Cartão"
                //subtitulo="Criar compras no Cartão "
            onClick={() => ir("compra_cartao")}
            />
             
              <BotaoMenu
                icone="🔄"
                titulo="Transferências Bancárias"
                //subtitulo="Transferencia entre conta corrente."
                onClick={() => navigate("/app/transferencia")}
            />
             
               <BotaoMenu
                icone="📊"
                titulo="Lançamentos "
                //subtitulo=" Contulta  de  Contas , lançamentos e pagamentos ...."
                onClick={() => navigate("/app/lancamentos")}
            />

            <BotaoMenu
                  icone={
                    <span
                      style={{
                        display: "inline-block",
                        animation: qtdVencidos > 0 ? "sinoMexendo 0.8s infinite" : "none",
                      }}
                    >
                      🔔
                    </span>
                  }
                  titulo={qtdVencidos > 0 ? `${qtdVencidos} pendência(s)` : "Sem pendências"}
                  subtitulo={qtdVencidos > 0 ? "Toque para baixar vencidos" : "Tudo em dia"}
                  onClick={() => navigate("/app/titulosvencidos")}
                />
                 <BotaoMenu
                  icone={
                    <span
                      style={{
                        display: "inline-block",
                        animation: alertaContabil ? "sinoMexendo 0.8s infinite" : "none",
                      }}
                    >
                      🔔
                    </span>
                  }
                  titulo={alertaContabil ? "Processar contábil" : "Contábil em dia"}
                  subtitulo={
                    alertaContabil
                      ? "Existem lançamentos não processados"
                      : "Nenhum processamento pendente"
                  }
                  onClick={() => navigate("/app/processar-diario")}
                />

                 <BotaoMenu
                icone="📊"
                titulo="Relatórios"
               // subtitulo="Fluxo, DRE e razão"
                onClick={() => navigate("/app/relatorios")}
              />

            <BotaoMenu
                icone="⚙️"
                titulo="Configurações"
                //subtitulo="Contas , Cartões Fornecedor, Categoria ...."
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
       onClick={() => {
  setAbrirQR(false);
  setTipoLeitor(null);
}}
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
