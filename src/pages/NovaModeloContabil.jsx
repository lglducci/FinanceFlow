import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal, dataLocal } from "../utils/dataLocal";

export default function NovaModeloContabil() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");
  const [contas, setContas] = useState([]);
  const [debitoId, setDebitoId] = useState("");
  const [creditoId, setCreditoId] = useState("");
  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    tipo_automacao:"FINANCEIRO_PADRAO"
  });

  useEffect(() => {
    async function carregarContas() {
      const url = buildWebhookUrl("contas_contabeis_lancaveis", { empresa_id:empresa_id });
      const r = await fetch(url);
      const j = await r.json();
      setContas(Array.isArray(j) ? j : []);
    }
    carregarContas();
  }, [empresa_id]);
 

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
        tipo: 'FINANCEIRO_PADRAO',
        dc: "", 
        credito_id:creditoId ,
        debito_id:debitoId ,
        tipo_operacao:"customizado"
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
   // alert("Modelo criado com sucesso!");
   //  alert("Configure as contas para este novo modelo em editar mapeameto.");
   // navigate(-1);

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
      <div  className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#061f4aff]  mt-1 mb-1" 
       
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
          <label className="block mb-1 text-base font-bold  text-[#1e40af] label label-required">Código</label>
          <input
            type="text"
            value={form.codigo}
               className="input-premium"
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
          <label className="block mb-1 text-base font-bold  text-[#1e40af] label label-required">Nome</label>
          <input
            type="text"
            value={form.nome}
               className="input-premium"
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

          {/* TIPO  
          <label className="block mb-1 text-base font-bold  text-[#1e40af] label label-required">Tipo Automação</label>
          <input
            type="text"
            value={form.tipo_automacao}
               className="input-premium"
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
          /> */}

           {/* DÉBITO */}
          <div className="mb-4">
            <label className="label label-required font-bold text-[#1e40af]">
              Conta Contábil – Débito (Saida)
            </label>
            <select
              value={debitoId}
              onChange={(e) => setDebitoId(e.target.value)}
              className="input-premium"
            >
              <option value="">Selecione</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} - {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* CRÉDITO */}
          <div className="mb-4">
            <label className="label label-required font-bold text-[#1e40af]">
              Conta Contábil – Crédito (Entrada)
            </label>
            <select
              value={creditoId}
              onChange={(e) => setCreditoId(e.target.value)}
              className="input-premium"
            >
              <option value="">Selecione</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} - {c.nome}
                </option>
              ))}
            </select>
          </div>



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
                background: "#061f4aff",
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
              onClick={() => navigate(-1)}
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
