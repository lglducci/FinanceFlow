import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal, dataLocal } from "../utils/dataLocal";

export default function LancamentoPartidaDobrada() {
  const navigate = useNavigate();
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [contas, setContas] = useState([]);
  const [debitoId, setDebitoId] = useState("");
  const [creditoId, setCreditoId] = useState("");
  const [valor, setValor] = useState("");
  const [historico, setHistorico] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [datalancto, setData] = useState(hojeLocal());

  /* ================== LOAD CONTAS CONTÁBEIS ================== */
  useEffect(() => {
    async function carregarContas() {
      const url = buildWebhookUrl("contas_contabeis_lancaveis", { empresa_id });
      const r = await fetch(url);
      const j = await r.json();
      setContas(Array.isArray(j) ? j : []);
    }
    carregarContas();
  }, [empresa_id]);

  /* ================== SALVAR ================== */
  async function salvar() {
    if (!debitoId || !creditoId || !valor || !historico) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (debitoId === creditoId) {
      alert("Conta débito deve ser diferente da conta crédito.");
      return;
    }

    
  try {
     
    const resp = await fetch(buildWebhookUrl("lancto_modelo"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
            empresa_id,
            data_lancto:datalancto,     // ou data_mov, conforme seu webhook
            debito_id:debitoId,
            credito_id:creditoId,
            valor:valor,                        // ✅ aqui é o valor
            historico: historico
        }),
    });
        

 

    const text = await resp.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // se seu webhook retorna texto simples
    }

    if (!resp.ok || json?.erro) {
      alert(json?.erro || text || "Erro ao gravar lançamento.");
      return;
    }

    alert("Partida dobrada registrada com sucesso!");
    navigate(-1);
  } catch (e) {
    alert("Erro de comunicação.");
  } finally {
    setSalvando(false);
  }
}


  

  /* ================== UI ================== */
  return (
     
      <div className="p-4 max-w-xl mx-auto">

     <div className="w-full max-w-2xl mx-auto rounded-2xl p-2 shadow-xl bg-[#1e40af]  mt-1 mb-1" >
        
        <div style={{ textAlign: "center", color: "white", marginBottom: 15 }}>
          <h2 className="text-2xl font-bold"> ✏️ Lançamento Contábil – Partida Dobrada</h2>
        </div>

       
        <div className="bg-white p-6 rounded-xl space-y-4">

 

          {/* DÉBITO */}
          <div className="mb-4">
            <label className="label label-required font-bold text-[#1e40af]">
              Conta Contábil – Débito
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
              Conta Contábil – Crédito
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

          {/* VALOR */}
          <div className="mb-4">
            <label className="label label-required font-bold text-[#1e40af]">
              Valor
            </label>
            <input
              type="number"
              step="0.10"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="input-premium" 
              placeholder="00,00"
            />
          </div>

          {/* HISTÓRICO */}
          <div className="mb-6">
            <label className="label label-required font-bold text-[#1e40af]">
              Histórico
            </label>
            <input
              type="text"
              value={historico}
              onChange={(e) => setHistorico(e.target.value)}
              className="input-premium"
            />
          </div>
          
         <div className="space-y-2">
                <label className="label label-required font-bold text-[#1e40af]">
                    Data Lançamento
                </label>
                <input
                    type="date"
                    className="input-premium"
                    value={datalancto}
                    onChange={(e) => setData(e.target.value)}
                />
                </div>


         
          {/* BOTÕES */}
          <div className="flex gap-4">
            <button
              onClick={salvar}
              disabled={salvando}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded font-bold"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-400 text-white px-4 py-3 rounded font-bold"
            >
              Cancelar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
