 import { useState } from "react";
import { buildWebhookUrl } from "../config/globals";

export default function ImportarDiario() {
  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [arquivo, setArquivo] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [msg, setMsg] = useState("");

  // --------------------------------------------------------------------
  // IMPORTAR ARQUIVO
  // --------------------------------------------------------------------
  async function enviar() {
    if (!arquivo) {
      alert("Selecione um arquivo");
      return;
    }

    const formData = new FormData();
    formData.append("file", arquivo);
    formData.append("empresa_id", empresa_id);

    const url = buildWebhookUrl("importar_diario");

    const r = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await r.json();
    setLotes(data);

    setMsg(
      "Importação concluída. Revise as linhas abaixo. Você pode corrigir o arquivo original e importar novamente ou consolidar os registros válidos."
    );
  }

  // --------------------------------------------------------------------
  // EXCLUIR LOTE
  // --------------------------------------------------------------------
 
async function excluirLote() {
  try {
    if (!window.confirm("Deseja realmente excluir o lote pendente?")) return;

    const url = buildWebhookUrl("excluir_lote");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa_id }),
    });

    const texto = await resp.text();
    let json = null;

    // tenta converter para JSON
    try {
      json = JSON.parse(texto);
    } catch (e) {
      console.error("JSON inválido:", texto);
      alert("❌ Erro inesperado no servidor.");
      return;
    }

    const item = Array.isArray(json) ? json[0] : json;

    // 🔥 TRATA ERRO DO SERVIDOR
    if (!resp.ok || item?.ok === false || texto.includes("ERROR")) {
      alert("❌ Falha ao excluir lote:\n\n" + (item?.message || texto));
      return;
    }

    // 🔥 SUCESSO
    alert(item?.message || "✔ Lote excluído com sucesso!");

    // RESET DA TELA
    setLotes([]);
    setArquivo(null);
    setFiltro("todos");
    setMsg("Lote excluído com sucesso.");

  } catch (e) {
    console.error("ERRO:", e);
    alert("❌ Erro de comunicação com o servidor.");
  }
}

 

  // --------------------------------------------------------------------
  // CONFIRMAR LOTE
  // --------------------------------------------------------------------
 async function confirmarLote() {
  try {

     if (!window.confirm("Deseja realmente confirmar  o lote pendente?")) return;
    const url = buildWebhookUrl("confirmar_lote");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa_id }),
    });

    const texto = await resp.text();
    let json = null;

    try {
      json = JSON.parse(texto);   // tenta converter
    } catch {
      console.error("Resposta não é JSON:", texto);
    }

    // 🔥 SE EXISTE ERRO NA RESPOSTA
    if (!resp.ok || json?.error || texto.includes("ERROR")) {
      const msg = json?.message || texto || "Erro ao consolidar lote.";
      alert("❌ Falha ao consolidar lote:\n\n" + msg);
      return;
    }

    // 🔥 SUCESSO
    alert("✔ Lote consolidado com sucesso!");

    // RESET DA TELA
    setLotes([]);
    setArquivo(null);
    setFiltro("todos");
    setMsg("Lote consolidado com sucesso.");

  } catch (e) {
    console.error("ERRO:", e);
    alert("❌ Erro de comunicação com o servidor.");
  }
}


  // --------------------------------------------------------------------
  // FILTRAGEM DOS REGISTROS
  // --------------------------------------------------------------------
  const itensFiltrados = lotes.filter((l) => {
    if (filtro === "ok" && l.status !== "ok") return false;
    if (filtro === "erro" && l.status !== "erro") return false;
    return true;
  });

  // --------------------------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------------------------
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

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>📥 Importação Diário</h2>

      {/* ------------------ UPLOAD ------------------ */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
          border: "4px solid #003ba2",
        }}
      >
        <label style={{ fontWeight: "bold", fontSize: 15 }}>
          Selecionar Arquivo
        </label>

        <div
          style={{
            marginTop: 10,
            padding: 20,
            border: "2px dashed #003ba2",
            borderRadius: 6,
            background: "#f7f9ff",
            textAlign: "center",
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
              Clique para escolher o arquivo do diário
            </p>
          )}
        </div>

        {/* ------------------ BOTÕES ------------------ */}
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
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

        {/* MENSAGEM AO USUÁRIO */}
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

        {/* ------------------ DASHBOARD ------------------ */}
        {lotes.length > 0 && (
          <div
            style={{
              marginTop: 25,
              display: "flex",
              gap: 20,
              fontWeight: "bold",
            }}
          >
            <div>📄 Total de linhas: {totalLinhas}</div>
            <div style={{ color: "#0a8e32" }}>
              ✔ Válidas: {totalOk} (R$ {somaOk.toFixed(2)})
            </div>
            <div style={{ color: "#cc0000" }}>
              ✖ Com erro: {totalErro} (R$ {somaErro.toFixed(2)})
            </div>
          </div>
        )}

        {/* ------------------ FILTROS ------------------ */}
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
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

      {/* ------------------ TABELA ------------------ */}
      <div
        style={{
          marginTop: 30,
          background: "white",
          borderRadius: 10,
          border: "2px solid #003ba2",
          padding: 10,
        }}
      >
        <table className="tabela tabela-mapeamento" style={{ width: "60%", borderCollapse: "collapse" }}
           
        >
          <thead>
            <tr
              style={{
                background: "#002b80",
                color: "white",
                height: 40,
              }}
            >
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
    </div>
  );
}
