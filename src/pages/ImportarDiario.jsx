  //import { useState } from "react";
  import { useState, useEffect } from "react";

import { buildWebhookUrl } from "../config/globals";
import { callApi } from "../utils/api";   



export default function ImportarDiario() {
  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [arquivo, setArquivo] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [msg, setMsg] = useState("");
  const [showHelp, setShowHelp] = useState(false); // 👈 NOVO
// Datas do processamento
const hoje = new Date().toISOString().substring(0, 10);

const [dataIni, setDataIni] = useState(hoje);
const [dataFim, setDataFim] = useState(hoje);
 
const [loadingDatas, setLoadingDatas] = useState(true);
const [ultimoFechamento, setUltimoFechamento] = useState("15/04/2025"); 
// depois você liga no webhook

 
     
 
  // ---------------------------------------
  // ENVIO
  async function enviar() {
    if (!arquivo) {
      alert("Selecione um arquivo");
      return;
    }

    const formData = new FormData();
    formData.append("file", arquivo);
    formData.append("empresa_id", empresa_id);

    const url = buildWebhookUrl("importar_diario");

    const r = await fetch(url, { method: "POST", body: formData });
    const data = await r.json();

    setLotes(data);
    setMsg("Importação concluída. Revise as linhas abaixo.");
  }

  // ---------------------------------------
  // EXCLUIR LOTE
  async function excluirLote() {
    try {
      if (!window.confirm("Deseja realmente excluir o lote pendente?")) return;

      const resp = await fetch(buildWebhookUrl("excluir_lote"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresa_id }),
      });

      const texto = await resp.text();
      let json = null;

      try {
        json = JSON.parse(texto);
      } catch {}

      const item = Array.isArray(json) ? json[0] : json;

      if (!resp.ok || item?.ok === false || texto.includes("ERROR")) {
        alert("❌ Falha ao excluir lote:\n\n" + (item?.message || texto));
        return;
      }

      alert(item?.message || "✔ Lote excluído com sucesso!");
      setLotes([]);
      setArquivo(null);
      setFiltro("todos");
      setMsg("Lote excluído com sucesso.");
    } catch {
      alert("❌ Erro de comunicação com o servidor.");
    }
  }

  // ---------------------------------------
  // CONFIRMAR LOTE
  async function confirmarLote() {
    try {
      if (!window.confirm("Deseja realmente confirmar o lote?")) return;

      const resp = await fetch(buildWebhookUrl("confirmar_lote"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresa_id }),
      });

      const texto = await resp.text();
      let json = null;
      try {
        json = JSON.parse(texto);
      } catch {}

      if (!resp.ok || json?.error || texto.includes("ERROR")) {
        alert("❌ Falha ao consolidar lote:\n\n" + (json?.message || texto));
        return;
      }

      alert("✔ Lote consolidado com sucesso!");
      setLotes([]);
      setArquivo(null);
      setFiltro("todos");
      setMsg("Lote consolidado com sucesso.");
    } catch {
      alert("❌ Erro de comunicação com o servidor.");
    }
  }

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
        <h2>📘 Ajuda – Importação do Diário</h2>
        <p style={{ marginTop: 10 }}>
          Aqui estão as regras e estrutura para importar o arquivo do diário.
        </p>

        <h3>📌 Estrutura do Arquivo</h3>
        <pre style={{ background: "#f1f1f1", padding: 10 }}>
        1) empresa_id – inteiro – tamanho 8  
        2) data_mov – data – formato DD/MM/AAAA  
        3) modelo_codigo – texto – identifica o modelo de lançamento  
        4) historico – texto livre  
        5) documento – texto  
        6) valor – número decimal  
        7) cnpj – numérico – válido ou vazio  
        </pre>

        <h3>✔ Critérios de Aceite</h3>
        <ul>
          <li>Linha com data válida</li>
          <li>Modelo existente</li>
          <li>Valor numérico</li>
          <li>CNPJ válido (opcional)</li>
        </ul>

        <h3>❌ Critérios de Rejeição</h3>
        <ul>
          <li>Data inválida</li>
          <li>Modelo inexistente</li>
          <li>Valor zerado ou inválido</li>
        </ul>

        <h3>📄 Exemplo de Linha Válida</h3>
        <pre style={{ background: "#f1f1f1", padding: 10 }}>
1; 12/08/2025; 301; Compra de Mercadoria; NF123; 1290.55; 12345678000199
        </pre>

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
      setMsg("✅ STAGING gerado com sucesso. Fase 1 concluida com sucesso.");
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
    setMsg("✅ Diário consolidado. Fase 2 concluida com sucesso.");
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
    setMsg("✅ Contábil gerado com sucesso. Fase 3 concluida");
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
      setDataFim(hoje);
    } finally {
      setLoadingDatas(false);
    }
  }

  carregar();
}, [empresa_id]);

 


  // ---------------------------------------
  // RENDER
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" ,
            fontSize: 18 , fontWeight: "bold" ,   background: "#eeeff5ff", }}>
        <h2 style={{ display: "flex", justifyContent: "space-between" ,
            fontSize: 22 , fontWeight: "bold" ,   background: "#e4e5eeff"}}
            >📥 Importação Diário/ Pré-Diário / Diário /Geração Contábil</h2>
        
      </div>
            {/* ------------------ TOPO DA IMPORTAÇÃO ------------------ */}
 {/* ===== GRID PRINCIPAL (2x2) ===== */}
<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

  {/* ===== LINHA 1 ===== */}
  <div style={{ display: "flex", gap: 20 }}>

    {/* CONTAINER 1 — UPLOAD */}
    <div style={{
      flex: 1,
      background: "white",
      padding: 20,
      borderRadius: 10,
      border: "4px solid #003ba2"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>Selecionar Arquivo</strong>
        <button onClick={() => setShowHelp(true)}
          style={{ padding: "6px 10px", background: "#ffc045", border: "1px solid #cc7a00" }}>
          ❔ Ajuda
        </button>
      </div>

      <div style={{
        marginTop: 10,
        padding: 15,
        border: "2px dashed #003ba2",
        background: "#f7f9ff",
        textAlign: "center"
      }}>
        <input type="file" onChange={(e) => setArquivo(e.target.files[0])} />
        {arquivo && <div><b>{arquivo.name}</b></div>}
      </div>

      <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
        <button onClick={enviar} style={{ ...estilosBtn, background: "#003ba2", color: "#fff" }}>
          Importar
        </button>
        <button onClick={excluirLote} style={{ ...estilosBtn, background: "#cc0000", color: "#fff" }}>
          Excluir
        </button>
        <button onClick={confirmarLote} style={{ ...estilosBtn, background: "#eae249" }}>
          Confirmar
        </button>
      </div>
    </div>

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
              <th>Linha</th>
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
                <td>{l.linha}</td>
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
