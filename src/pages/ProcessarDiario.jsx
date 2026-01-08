   //import { useState } from "react";
  import { useState, useEffect } from "react";

import { buildWebhookUrl } from "../config/globals";
import { callApi } from "../utils/api";   
import { hojeLocal, dataLocal } from "../utils/dataLocal";


export default function ProcessarDiario() {
  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [arquivo, setArquivo] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [msg, setMsg] = useState("");
  const [showHelp, setShowHelp] = useState(false); // 👈 NOVO
// Datas do processamento
const hoje = new Date().toISOString().substring(0, 10);

const [dataIni, setDataIni] = useState(hojeLocal());
const [dataFim, setDataFim] = useState(hojeLocal());
 
const [loadingDatas, setLoadingDatas] = useState(true);
const [ultimoFechamento, setUltimoFechamento] = useState("15/04/2025"); 
// depois você liga no webhook

 const btnPadrao =
  "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";

     
 

  // ---------------------------------------
  // EXCLUIR LOTE
  
  // ---------------------------------------
  
  // ---------------------------------------
  // FILTRO
  const itensFiltrados = lotes.filter((l) => {
    if (filtro === "ok" && l.status !== "ok") return false;
    if (filtro === "erro" && l.status !== "erro") return false;
    return true;
  });

  const totalLinhas = lotes.length;
  const totalOk = lotes.filter((x) => x.status === "ok").length;
  const totalErro = lotes.filter((x) => x.status === "erro").length;

  const somaOk = lotes
    .filter((x) => x.status === "ok")
    .reduce((s, x) => s + Number(x.valor_total || 0), 0);

  const somaErro = lotes
    .filter((x) => x.status === "erro")
    .reduce((s, x) => s + Number(x.valor_total || 0), 0);

  const estilosBtn = {
    padding: "10px 16px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  };

  // -----------------------------
  // MODAL DE AJUDA (HTML Simples)
  const helpModal = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "70%",
          maxHeight: "80%",
          overflowY: "auto",
          background: "white",
          padding: 20,
          borderRadius: 10,
          border: "3px solid #003ba2",
        }}
      >
         
 
  
        <button
          onClick={() => setShowHelp(false)}
          style={{
            marginTop: 20,
            padding: "10px 18px",
            background: "#003ba2",
            color: "white",
            border: "none",
            borderRadius: 6,
          }}
        >
          Fechar
        </button>
      </div>
    </div>
  );

  function addOneDay(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().substring(0, 10);
}

async function gerarStaging() {
  try {
    setMsg("⏳ Gerando STAGING..."); 

    const data = await callApi(
      buildWebhookUrl("gerar_staging"),
      {
        empresa_id,
        data_ini: dataIni,
        data_fim: dataFim
      }
    );

    setLotes(data); 

    const qtdErros = data.filter(l => l.status === "erro").length;

    if (qtdErros > 0) {
      setMsg(`❌ Existem ${qtdErros} linhas com erro. Corrija antes de continuar.`);
    } else {
      setMsg("✅ STAGING gerado com sucesso. 1º Fase concluida com sucesso. Verifique possiveis erros no relório abaixo.");
      alert("✅ STAGING gerado com sucesso.  1º Fase concluida com sucesso.");
      alert("✅ Verifique possiveis erros no relório abaixo.");
    }

  } catch (e) {
    alert("❌ " + e.message);
  }
}

 

async function consolidarDiario() {
  try {
    setMsg("⏳ Consolidando diário...");
     setLotes([]);
   const data = await callApi(
      buildWebhookUrl("consolidar_diario"),
      { empresa_id }
    );
       
      setLotes(data); 
     setMsg("✅ Diário consolidado.2º Fase concluida com sucesso. ✅ Verifique possiveis erros no relório abaixo.");
     alert("✅ Diário gerado com sucesso.  2º Fase concluida com sucesso.");
      alert("✅ Verifique possiveis erros no relório abaixo.");
  } catch (e) {
    alert("❌ " + e.message);
  }
}

 
async function gerarContabil() {
  try {
    setMsg("⏳ Gerando Contábil...");
    await callApi(
      buildWebhookUrl("gerar_contabil"),
      { empresa_id ,
    data_ini: dataIni,
    data_fim: dataFim }
    );
    setMsg("✅ Contábil gerado com sucesso. 3º Fase concluida. Verifique seus relatórios contábeis.");
    alert("✅ Contábil gerado com sucesso. Verifique seus relatórios contábeis.");
     
    setDataIni(addOneDay(dataFim));
    setDataFim(addOneDay(dataFim));
  } catch (e) {
    alert("❌ " + e.message);
  }
}
 
  
 useEffect(() => {
  async function carregar() {
    try {
      if (!empresa_id) {
        console.error("empresa_id ausente");
        return;
      }

      const url = buildWebhookUrl("ultimo_processamento", { empresa_id });

      const r = await fetch(url);
      const text = await r.text();
      if (!text) return;

      const resp = JSON.parse(text);
      const item = Array.isArray(resp) ? resp[0] : resp;

      if (!item?.ultimo_dia_processado) return;

      const data = item.ultimo_dia_processado.slice(0, 10);

      setUltimoFechamento(data);
      setDataIni(data);
      setDataFim(data);
    } finally {
      setLoadingDatas(false);
    }
  }

  carregar();
}, [empresa_id]);

 
 async function voltadata() {
  try {
    setMsg("⏳ Gerando Contábil...");
    await callApi(
      buildWebhookUrl("voltadata"),
      { empresa_id  }
    );
     carregar();
    setMsg("✅ Contábil gerado com sucesso. Fase 3 concluida");
   
  } catch (e) {
    alert("❌ " + e.message);
  }
}
 

  // ---------------------------------------
  // RENDER
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" ,
            fontSize: 18 , fontWeight: "bold" ,   background: "#eeeff5ff", }}>
        <h2 style={{ display: "flex", justifyContent: "space-between" ,
            fontSize: 22 , fontWeight: "bold" ,   background: "#e4e5eeff"}}
            >📥 Geração  1) Pré-Diário / 2) Diário / 3) Geração Contábil</h2>
        
      </div>
            {/* ------------------ TOPO DA IMPORTAÇÃO ------------------ */}
 {/* ===== GRID PRINCIPAL (2x2) ===== */}
<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

  {/* ===== LINHA 1 ===== */}
  <div style={{ display: "flex", gap: 20 }}>

    {/* CONTAINER 1 — UPLOAD */}
    

    {/* CONTAINER 3 — PROCESSAMENTO */}

<div style={{
  flex: 1,
  background: "#f5f6fa",
  padding: 20,
  borderRadius: 10,
  border: "4px solid #170fa5ff"
}}>
  <strong>Gerar STAGING / Diário / Contábil</strong>

  {ultimoFechamento && (
    <div style={{
      marginTop: 8,
      padding: 8,
      background: "#eef4ff",
      borderRadius: 6,
      fontWeight: "bold",
      color: "#003ba2"
    }}>
      Último fechamento contábil: {ultimoFechamento}
    </div>
  )}

  <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
    <div>
      <label className="font-bold text-[#1e40af]" >Data Inicial</label><br />
      <input type="date"   className="border rounded-lg px-3 py-2 border-yellow-500"  value={dataIni} disabled />
    </div>

    <div>
      <label className="font-bold text-[#1e40af]">Data Final</label><br />
      <input
        type="date"
          className="border rounded-lg px-3 py-2 border-yellow-500"
        value={dataFim}
        max={new Date().toISOString().substring(0, 10)}
        onChange={e => setDataFim(e.target.value)}
      />
    </div>
  </div>

  <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
    <button
      onClick={gerarStaging}
      style={{ ...estilosBtn, background: "#0a8e32", color: "#fff" , padding: 10}}
    >
      ✔  STAGING (Fase 1)
    </button>

    <button
      onClick={consolidarDiario}
      style={{ ...estilosBtn, background: "#003ba2", color: "#fff" , padding: 10 }}
    >
      ✔  Diário (Fase 2)
    </button>

    <button
      onClick={gerarContabil}
      style={{ ...estilosBtn, background: "#0bd849", color: "#fff" , padding: 10 }}
    >
      ✔ Contábil (Fase Final)
    </button>

    <button
      onClick={voltadata}
      style={{ ...estilosBtn, background: "#cd0707ff", color: "#fff" , padding: 10 }}
    >
      ✔ Voltar Data  
    </button>

  </div>
</div>
  
  
  {/* INDICADORES */}
  {lotes.length > 0 && (
    <div
      style={{
        marginTop: 20,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: 10,
        background: "#eef4ff",
        borderRadius: 6,
        fontWeight: "bold",
      }}
    >
      

      {/* BOTÕES DE FILTRO */}
      <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
        <button
          onClick={() => setFiltro("ok")}
          style={{ ...estilosBtn, background: "#19d357", color: "white" }}
        >
          ✔ Linhas OK
        </button>

        <button
          onClick={() => setFiltro("erro")}
          style={{ ...estilosBtn, background: "#f64949", color: "white" }}
        >
          ✖ Linhas com Erro
        </button>

        <button
          onClick={() => setFiltro("todos")}
          style={{ ...estilosBtn, background: "#003ba2", color: "white" }}
        >
          Mostrar Todos
        </button>
      </div>
    </div>
  )}
     
  </div>
 
      {msg && (
    <div
      style={{
        marginTop: 15,
        padding: 10,
        background: "#e8f1ff",
        borderRadius: 6,
        color: "#003ba2",
        fontWeight: "bold",
        
      }}
    >
      {msg}
          
       <span style={{   color: "#003ba2", padding: 70 }}
       
        >📄 Total de linhas: {totalLinhas}</span>

      <span style={{ color: "#0a8e32" , padding: 10 }}>
        ✔ Válidas: {totalOk} (R$ {somaOk.toFixed(2)})
      </span>

      <span style={{ color: "#cc0000", padding: 10 }}>
        ✖ Com erro: {totalErro} (R$ {somaErro.toFixed(2)})
      </span>
    </div>
  )}
   
</div>


      {/* tabela */}
      <div
        style={{
          marginTop: 30,
          background: "white",
          borderRadius: 10,
          border: "2px solid #003ba2",
          padding: 10,
        }}
      >
        <table
          className="tabela tabela-mapeamento"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ background: "#002b80", color: "white", height: 40 }}>
              
              <th>Data</th>
              <th>Token</th>
              <th>Histórico</th>
              <th>Doc</th>
              <th>Valor</th>
              <th>CNPJ</th>
              <th>Validação</th>
              <th>Status</th>
              <th>Lote</th>
            </tr>
          </thead>

          <tbody>
            {itensFiltrados.map((l) => (
              <tr
                key={l.id}
                style={{
                  background: l.status === "erro" ? "#f64949ff" : "#19d357ff",
                  borderBottom: "1px solid rgba(187, 187, 204, 1)",
                }}
              >
                
                <td>{l.data_mov?.substring(0, 10)}</td>
                <td>{l.modelo_codigo}</td>
                <td>{l.historico}</td>
                <td>{l.doc_ref}</td>
                <td>{l.valor_total}</td>
                <td>{l.cnpj}</td>
                <td>{l.validacao}</td>
                <td>{l.status}</td>
                <td>{l.lote_id}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {itensFiltrados.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", opacity: 0.5 }}>
            Nenhum registro encontrado.
          </div>
        )}
      </div>

      {/* modal de ajuda */}
      {showHelp && helpModal}
    </div>
  );
}
