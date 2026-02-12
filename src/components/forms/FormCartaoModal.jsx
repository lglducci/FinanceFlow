import { useState } from "react";
import { buildWebhookUrl } from "../../config/globals";

export default function FormCartaoModal({ empresa_id, onSuccess, onCancel }) {

  const [form, setForm] = useState({
    nome: "",
    bandeira: "",
    limite_total: "",
    fechamento_dia: "",
    vencimento_dia: "",
    vencimento: "",
    numero: "",
    nomecartao: "",
    status: "ativo"
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function salvar() {

    if (!form.nome?.trim()) return alert("Informe o nome do cartão.");
    if (!form.numero?.trim()) return alert("Informe o número do cartão.");
    if (!form.nomecartao?.trim()) return alert("Informe o nome impresso no cartão.");

    if (!form.limite_total || Number(form.limite_total) <= 0)
      return alert("Limite inválido.");

    if (!form.fechamento_dia || form.fechamento_dia < 1 || form.fechamento_dia > 31)
      return alert("Fechamento deve ser entre 1 e 31.");

    if (!form.vencimento_dia || form.vencimento_dia < 1 || form.vencimento_dia > 31)
      return alert("Vencimento deve ser entre 1 e 31.");

    if (!/^\d{2}\/\d{2}$/.test(form.vencimento))
      return alert("Vencimento deve estar no formato MM/AA.");

    const resp = await fetch(buildWebhookUrl("novo_cartao"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_empresa: empresa_id,
        ...form,
      }),
    });

    const json = await resp.json();
    const ok = Array.isArray(json) && json[0]?.id;

    if (ok) {
      alert("Cartão criado com sucesso!");
      onSuccess?.();
    } else {
      alert("Erro ao criar cartão.");
    }
  }

  return (
    <div className="p-5 space-y-4"> 

      <input
        name="nome"
        value={form.nome}
        onChange={handleChange}
        className="input-premium"
        placeholder="Nome do cartão"
      />

      <input
        name="numero"
        value={form.numero}
        onChange={handleChange}
        className="input-premium"
        placeholder="Número do cartão"
      />

      <input
        name="nomecartao"
        value={form.nomecartao}
        onChange={handleChange}
        className="input-premium"
        placeholder="Nome impresso no cartão"
      />

      <input
        type="number"
        name="limite_total"
        value={form.limite_total}
        onChange={handleChange}
        className="input-premium"
        placeholder="Limite total"
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          name="fechamento_dia"
          value={form.fechamento_dia}
          onChange={handleChange}
          className="input-premium"
          placeholder="Fechamento"
        />

        <input
          type="number"
          name="vencimento_dia"
          value={form.vencimento_dia}
          onChange={handleChange}
          className="input-premium"
          placeholder="Vencimento"
        />
      </div>

      <input
        name="vencimento"
        value={form.vencimento}
        onChange={handleChange}
        className="input-premium"
        placeholder="MM/AA"
      />

      <div className="flex gap-4 pt-4">
        <button
          onClick={salvar}
          className="flex-1 bg-[#061f4a] text-white py-2 rounded font-bold"
        >
          Salvar
        </button>

        <button
          onClick={onCancel}
          className="flex-1 bg-gray-500 text-white py-2 rounded font-bold"
        >
          Cancelar
        </button>
      </div>

    </div>
  );
}
