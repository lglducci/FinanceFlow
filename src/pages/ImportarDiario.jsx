 import { useState } from "react";
import { buildWebhookUrl } from "../config/globals";

export default function ImportarDiario() {
  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [arquivo, setArquivo] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [msg, setMsg] = useState("");
  const [showHelp, setShowHelp] = useState(false); // 👈 NOVO

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

  // ---------------------------------------
  // RENDER
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>📥 Importação Diário</h2>
        <button
          onClick={() => setShowHelp(true)}
          style={{
            ...estilosBtn,
            background: "#ffa500",
            color: "black",
            border: "2px solid #cc7a00",
          }}
        >
          ❔ Ajuda
        </button>
      </div>
            {/* ------------------ TOPO DA IMPORTAÇÃO ------------------ */}
<div
  style={{
    background: "white",
    padding: 20,
    borderRadius: 10,
    border: "4px solid #003ba2",
    marginBottom: 20,
  }}
>
  {/* LINHA SUPERIOR: TÍTULO + AJUDA */}
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <label style={{ fontWeight: "bold", fontSize: 15 }}>Selecionar Arquivo</label>

    <button
      onClick={() => setShowHelp(true)}
      style={{
        padding: "8px 14px",
        borderRadius: 6,
        border: "2px solid #cc7a00",
        background: "#ffc045",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      ❔ Ajuda
    </button>
  </div>

  {/* ÁREA REDUZIDA DE UPLOAD */}
  <div
    style={{
      marginTop: 10,
      padding: 15,
      border: "2px dashed #003ba2",
      borderRadius: 6,
      background: "#f7f9ff",
      textAlign: "center",
      width: "40%",      
    }}
  >
    <input
      type="file"
      accept=".csv,.xlsx,.txt"
      onChange={(e) => setArquivo(e.target.files[0])}
    />

    {arquivo ? (
      <p style={{ marginTop: 10, fontWeight: "bold" }}>
        Arquivo selecionado: {arquivo.name}
      </p>
    ) : (
      <p style={{ marginTop: 10, opacity: 0.7 }}>
        Clique para escolher o arquivo
      </p>
    )}
  </div>

  {/* BOTÕES */}
  <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
    <button
      onClick={enviar}
      style={{ ...estilosBtn, background: "#003ba2", color: "white" }}
    >
      Importar Arquivo
    </button>

    <button
      onClick={excluirLote}
      style={{ ...estilosBtn, background: "#cc0000", color: "white" }}
    >
      Excluir Lote
    </button>

    <button
      onClick={confirmarLote}
      style={{ ...estilosBtn, background: "#0a8e32", color: "white" }}
    >
      Confirmar Lote
    </button>
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
      <span>📄 Total de linhas: {totalLinhas}</span>

      <span style={{ color: "#0a8e32" }}>
        ✔ Válidas: {totalOk} (R$ {somaOk.toFixed(2)})
      </span>

      <span style={{ color: "#cc0000" }}>
        ✖ Com erro: {totalErro} (R$ {somaErro.toFixed(2)})
      </span>

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
