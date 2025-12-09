import { useState } from "react";
import { buildWebhookUrl } from "../config/globals";

export default function ImportarDiario() {
  const empresa_id = localStorage.getItem("empresa_id") || "1";
  const [arquivo, setArquivo] = useState(null);
  const [log, setLog] = useState("");

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

    const texto = await r.text();
    setLog(texto);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>📥 Importar Diário Contábil</h2>

      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
          maxWidth: 500,
        }}
      >
        <label>Arquivo CSV/Excel</label>
        <input
          type="file"
          accept=".csv,.xlsx,.txt"
          onChange={(e) => setArquivo(e.target.files[0])}
          style={{ width: "100%", marginTop: 10, marginBottom: 20 }}
        />

        <button
          onClick={enviar}
          style={{
            background: "#003ba2",
            color: "white",
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Enviar
        </button>
      </div>

      {log && (
        <pre
          style={{
            background: "#222",
            color: "lime",
            padding: 15,
            marginTop: 20,
            borderRadius: 10,
          }}
        >
          {log}
        </pre>
      )}
    </div>
  );
}
