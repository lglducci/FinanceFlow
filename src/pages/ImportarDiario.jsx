 import { useState } from "react";
import { buildWebhookUrl } from "../config/globals";
 

export default function ImportarDiario() {
  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [arquivo, setArquivo] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [filtroOk, setFiltroOk] = useState("");
  const [filtroErro, setFiltroErro] = useState("");

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

    const data = await r.json(); // AGORA VAI VIR JSON REAL
    setLotes(data);
  }

 
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
    let json;

    try {
      json = JSON.parse(texto);
    } catch (e) {
      console.error("JSON inválido:", texto);
      alert("Erro inesperado no servidor.");
      return;
    }

    const item = Array.isArray(json) ? json[0] : json;

    if (item?.ok === false) {
      alert(item.message || "Erro ao excluir lote.");
      return;
    }

    alert(item?.message || "Lote excluído!");

    // Atualiza a tabela de lotes se necessário
    if (item?.lotes) setLotes(item.lotes);

  } catch (e) {
    console.error("ERRO AO EXCLUIR LOTE:", e);
    alert("Erro de comunicação com o servidor.");
  }
}


 

  // ----------------------------------------------------------
  // FILTROS
  // ----------------------------------------------------------
  const itensFiltrados = lotes.filter((l) => {
    if (filtroOk && l.status === "concluido" && l.lote_id !== filtroOk)
      return false;

    if (filtroErro && l.status === "erro" && l.lote_id !== filtroErro)
      return false;

    return true;
  });

  return (
    <div style={{ padding: 20 }}>

      <h2 style={{ marginBottom: 20 }}>📥 Importação Diário</h2>

      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
          border: "4px solid #003ba2",
        }}
      >
        <label style={{ fontWeight: "bold", fontSize: 14 }}>
          Arquivo Diário
        </label>

        <input
          type="file"
          accept=".csv,.xlsx,.txt"
          onChange={(e) => setArquivo(e.target.files[0])}
          style={{ width: "100%", marginTop: 10, marginBottom: 20 }}
        />
           <div style={{ display: "flex", justifyContent: "space-between" }}> 
        <button
          onClick={enviar}
          style={{
            background: "#003ba2",
            color: "white",
            padding: "14px 12px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer" ,  gap: "10px"
          }}
        >
          Importar Arquivo
        </button> 

         <button
          onClick={excluirLote}
          style={{
            background: "#ea1814ff",
            color: "white",
            padding: "14px 12px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Excluir Lote
        </button>
        

        <button
          onClick={excluirLote}
          style={{
            background: "#029538ff",
            color: "white",
            padding: "14px 12px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
         Confirma Lote
        </button>
        </div>   




        {/* FILTROS ------------------- */}
        <div
          style={{
            marginTop: 25,
            display: "flex",
            gap: 30,
            alignItems: "center",
          }}
        >
          <div>
            <label style={{ fontWeight: "bold" }}>Filtro Lote Diário (OK)</label>
            <input
              value={filtroOk}
              onChange={(e) => setFiltroOk(e.target.value)}
              style={{
                marginTop: 5,
                width: 180,
                padding: 5,
                border: "2px solid black",
                borderRadius: 3,
              }}
            />
          </div>

          <div>
            <label style={{ fontWeight: "bold" }}>Lotes Rejeitados</label>
            <input
              value={filtroErro}
              onChange={(e) => setFiltroErro(e.target.value)}
              style={{
                marginTop: 5,
                width: 180,
                padding: 5,
                border: "2px solid black",
                borderRadius: 3,
              }}
            />
          </div>
        </div>
      </div>
       

      {/* TABELA ---------------------- */}
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
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}   className="tabela tabela-mapeamento"
        >
          <thead>
            <tr
              style={{
                background: "#002b80",
                color: "white",
                height: 40,
              }}
            >
              <th className="font-bold text-[#1e40af text-align: left]">Linha</th>
              <th className="font-bold text-[#1e40af text-align: left]">Data</th>
              <th className="font-bold text-[#1e40af text-align: left]">Token</th>
              <th className="font-bold text-[#1e40af text-align: left]">Histórico</th>
              <th className="font-bold text-[#1e40af text-align: left]" >Doc</th>
              <th className="font-bold text-[#1e40af text-align: left]">Valor</th>
              <th className="font-bold text-[#1e40af text-align: left]">CNPF</th>
              <th className="font-bold text-[#1e40af text-align: left]">Validação</th>
              <th className="font-bold text-[#1e40af text-align: left]">Status</th>
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
                <td className="font-bold text-[#1e40af text-align: left]">{l.linha}</td>
                <td className="font-bold text-[#1e40af text-align: left]">{l.data_mov?.substring(0, 10)}</td>
                <td className="font-bold text-[#1e40af text-align: left]">{l.lote_id}</td>
                <td className="font-bold text-[#1e40af text-align: left]">{l.historico}</td>
                <td className="font-bold text-[#1e40af text-align: left]">{l.doc_ref}</td> 
                <td className="font-bold text-[#1e40af text-align: left]">{l.valor_total}</td>
                <td className="font-bold text-[#1e40af text-align: left]">{l.cnpj}</td>
                 <td className="font-bold text-[#1e40af text-align: left]">
                        {l.validacao}
                      </td>

                 <td className="font-bold text-[#1e40af text-align: left]">{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {itensFiltrados.length === 0 && (
          <div style={{ padding: 20, color: "#cdc5c5ff", textAlign: "center" }}>
            Nenhum registro encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
