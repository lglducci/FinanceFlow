import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function NovaModeloContabil() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    tipo_automacao:"FINANCEIRO_PADRAO"
  });


 

 async function salvar() {
  try {
    const url = buildWebhookUrl("inseremodelo");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: empresa_id,
        codigo: form.codigo,
        nome: form.nome,
        tipo: form.tipo_automacao,
        dc: ""
      }),
    });

    // ----- TRATAMENTO DO RETORNO (mesmo padrão da Nova Transação) -----
    const texto = await resp.text();
    let json = null;

    try {
      json = JSON.parse(texto);
    } catch (e) {
      console.log("JSON inválido:", texto);
      alert("Erro inesperado no servidor.");
      return;
    }

    // sempre pegar o primeiro item
    const item = Array.isArray(json) ? json[0] : json;

    // se retorno indicar erro
    if (item?.ok === false) {
      alert(item.message || "Erro ao salvar o modelo.");
      return;
    }

    // sucesso
    alert("Modelo criado com sucesso!");
     alert("Configure as contas para este novo modelo em editar mapeameto.");
    navigate("/mapeamento-contabil");

  } catch (e) {
    console.log("ERRO REQUEST:", e);
    alert("Erro de comunicação com o servidor.");
  }
}



  return (
    <div
      style={{
        width: "100%",
        padding: 20,
        display: "flex",
        justifyContent: "center",
        marginTop: 20,
      }}
    >
      <div
        style={{
          width: "420px",
          background: "#003ba2",
          padding: 20,
          borderRadius: 12,
        }}
      >
        {/* TÍTULO */}
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <span
            style={{
              color: "white",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            🧾 Novo Modelo Contábil
          </span>
        </div>

        {/* CONTEÚDO BRANCO */}
        <div
          style={{
            background: "white",
            padding: 20,
            borderRadius: 10,
          }}
        >
          {/* CÓDIGO */}
          <label>Código</label>
          <input
            type="text"
            value={form.codigo}
            onChange={(e) =>
              setForm((f) => ({ ...f, codigo: e.target.value }))
            }
            placeholder="Ex: VENDA01"
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 15,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />

          {/* NOME */}
          <label>Nome</label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) =>
              setForm((f) => ({ ...f, nome: e.target.value }))
            }
            placeholder="Ex: Modelo venda à vista"
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 15,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />

          {/* TIPO */}
          <label>Tipo Automação</label>
          <input
            type="text"
            value={form.tipo_automacao}
              disabled
            onChange={(e) =>
              setForm((f) => ({ ...f, tipo_automacao: e.target.value }))
            }
            placeholder="Ex: ESTORNO_PAGATO OU PAGAMENTO_CONTA"
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 15,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />


          {/* BOTÕES */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            {/* SALVAR */}
            <button
              onClick={salvar}
              style={{
                padding: "10px 20px",
                background: "#003ba2",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: "bold",
                cursor: "pointer",
                width: "48%",
              }}
            >
              Salvar
            </button>

            {/* CANCELAR */}
            <button
              onClick={() => navigate("/mapeamento-contabil")}
              style={{
                padding: "10px 20px",
                background: "rgba(92, 87, 87, 0.82)",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: "bold",
                cursor: "pointer",
                width: "48%",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
