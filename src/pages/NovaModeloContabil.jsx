import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal, dataLocal } from "../utils/dataLocal";
import { fetchSeguro } from "../utils/apiSafe";
import AutocompleteInput from "../components/AutocompleteInput";
export default function NovaModeloContabil() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");
  const [contas, setContas] = useState([]);
  const [debitoId, setDebitoId] = useState("");
  const [creditoId, setCreditoId] = useState("");
 const [debitoTexto, setDebitoTexto] = useState(""); 
  const [creditoTexto, setCreditoTexto] = useState(""); 

 


  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    tipo_automacao:"FINANCEIRO_PADRAO",
    tipo_evento:"",
    classificacao:""

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

    const data = await fetchSeguro(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        codigo: form.codigo,
        nome: form.nome,
        tipo: "FINANCEIRO_PADRAO",
        dc: "",
        credito_id: creditoId,
        debito_id: debitoId,
        tipo_operacao: "customizado",
        tipo_evento: form.tipo_evento,
        classificacao: form.classificacao,
      }),
    });

    // 🔵 Se chegou aqui, deu certo
    alert("Modelo criado com sucesso!");
     navigate(-1); // 👈 AQUI

  } catch (error) {
    console.log("ERRO:", error);
    alert(error.message);
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
                  <div className="mb-4">
                    <label className="block mb-1 font-bold text-[#1e40af] label-required">
                      Código
                    </label>
                    <input
                      type="text"
                      value={form.codigo}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, codigo: e.target.value }))
                      }
                      placeholder="Ex: VENDA01"
                      className="input-premium w-full"
                    />
                  </div>

                  {/* NOME */}
                  <div className="mb-4">
                    <label className="block mb-1 font-bold text-[#1e40af] label-required">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={form.nome}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, nome: e.target.value }))
                      }
                      placeholder="Ex: Modelo venda à vista"
                      className="input-premium w-full"
                    />
                  </div>
          
           <div className="flex flex-col gap-4"> 
                  <div className="mb-4">
                        <label className="block mb-1 font-bold text-[#1e40af] label-required">
                          Tipo Evento
                        </label>

                        <select
                          name="tipo_evento"
                          value={form.tipo_evento || ""}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              tipo_evento: e.target.value,
                            }))
                          }
                          className="input-premium w-full"
                          required
                        >
                          <option value="">Selecione...</option>
                          <option value="receber">Receber</option>
                          <option value="receber_cartao">Receber Cartão</option>
                          <option value="pagar">Pagar</option>
                          <option value="financeiro">Financeiro</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="block mb-1 font-bold text-[#1e40af] label-required">
                          Classificação
                        </label>

                        <select
                          name="classificacao"
                          value={form.classificacao || ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              classificacao: e.target.value,
                            }))
                          }
                          className="input-premium w-full"
                          required
                        >
                           <option value="">Selecione...</option>
                              <option value="receita">Receita</option>
                              <option value="custo">Custo</option>
                              <option value="despesa">Despesa</option>
                              <option value="imobilizado">Imobilizado</option>
                              <option value="ativo">Ativo</option>
                              <option value="passivo">Passivo</option>
                        </select>
                      </div>
             
                  {/* DÉBITO */}
                    
                        <div className="mb-4">
                    <label className="label label-required font-bold text-[#1e40af]">
                      Conta Contábil – Débito (Saida)
                    </label>
                     <AutocompleteInput
                        value={debitoTexto}
                        options={contas}
                        placeholder="Selecione"
                        onChange={(v) => {
                          setDebitoTexto(v);
                          setDebitoId(null);
                        }}
                        onSelect={(c) => {
                          setDebitoTexto(`${c.codigo} - ${c.nome}`);
                          setDebitoId(c.id);
                        }}
                      />
                  </div>

                  {/* CRÉDITO */}
                  <div className="mb-4">
                    <label className="label label-required font-bold text-[#1e40af]">
                      Conta Contábil – Crédito (Entrada)
                    </label>
                    <AutocompleteInput
                    value={creditoTexto}
                    options={contas}
                    placeholder="Selecione"
                    onChange={(v) => {
                      setCreditoTexto(v);
                      setCreditoId(null);
                    }}
                    onSelect={(c) => {
                      setCreditoTexto(`${c.codigo} - ${c.nome}`);
                      setCreditoId(c.id);
                    }}
                  />
                  </div>
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
