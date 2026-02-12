import { useState, useEffect } from "react";
import { buildWebhookUrl } from "../../config/globals"; // ajuste o caminho se necessário


export default function FormModeloContabil({ empresa_id, onSuccess, onCancel }) {
  const [contas, setContas] = useState([]);
  const [debitoId, setDebitoId] = useState("");
  const [creditoId, setCreditoId] = useState("");

  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    tipo_automacao: "FINANCEIRO_PADRAO"
  });

  useEffect(() => {
    async function carregarContas() {
      const url = buildWebhookUrl("contas_contabeis_lancaveis", { empresa_id });
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
          empresa_id,
          codigo: form.codigo,
          nome: form.nome,
          tipo: "FINANCEIRO_PADRAO",
          credito_id: creditoId,
          debito_id: debitoId,
        }),
      });

      const texto = await resp.text();
      let json = null;

      try {
        json = JSON.parse(texto);
      } catch {
        alert("Erro inesperado no servidor.");
        return;
      }

      const item = Array.isArray(json) ? json[0] : json;

      if (item?.ok === false) {
        alert(item.message || "Erro ao salvar o modelo.");
        return;
      }

      alert("Modelo criado com sucesso!");
      onSuccess?.();

    } catch (e) {
      console.log("ERRO REQUEST:", e);
      alert("Erro de comunicação com o servidor.");
    }
  }

  return (
    <div className="p-4 space-y-6">
       

      <input
        type="text"
        className="input-premium"
        placeholder="Código (Token)"
        value={form.codigo}
        onChange={(e) =>
          setForm((f) => ({ ...f, codigo: e.target.value }))
        }
      />
          <div className="text-xs text-gray-600 mb-1 bg-blue-50 p-1 round">
            💡 O token representa o template de reuso da partida dobrada contábil. 
            Exemplo: <b>CMV_MERCADORIA</b>, <b>ESTOQUE</b>, <b>TRANS_CONTA</b>.
            </div>



      <input
        type="text"
        className="input-premium mb-3"
        placeholder="Nome"
        value={form.nome}
        onChange={(e) =>
          setForm((f) => ({ ...f, nome: e.target.value }))
        }
      />

      <select
        value={debitoId}
        onChange={(e) => setDebitoId(e.target.value)}
        className="input-premium mb-3"
      >
        <option value="">Conta Débito</option>
        {contas.map((c) => (
          <option key={c.id} value={c.id}>
            {c.codigo} - {c.nome}
          </option>
        ))}
      </select>

      <select
        value={creditoId}
        onChange={(e) => setCreditoId(e.target.value)}
        className="input-premium mb-4"
      >
        <option value="">Conta Crédito</option>
        {contas.map((c) => (
          <option key={c.id} value={c.id}>
            {c.codigo} - {c.nome}
          </option>
        ))}
      </select>

      <div className="flex gap-3">
        <button
          onClick={salvar}
          className="flex-1 bg-[#061f4a] text-white rounded-lg py-2 font-bold"
        >
          Salvar
        </button>

        <button
          onClick={onCancel}
          className="flex-1 bg-gray-500 text-white rounded-lg py-2 font-bold"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
