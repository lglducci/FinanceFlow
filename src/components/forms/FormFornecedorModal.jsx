 import { useState } from "react";
import { buildWebhookUrl } from "../../config/globals";

export default function FormFornecedorModal({
  empresa_id,
  tipo,
  onSuccess,
  onCancel
}) {

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    
    nome: "",
    cpf_cnpj: "",
    telefone: "",
    whatsapp: ""
  });

  function handleChange(e) {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  async function salvar() {

    if (!form.nome.trim()) return alert("Nome obrigatório.");
    if (!form.cpf_cnpj.trim()) return alert("CPF/CNPJ obrigatório.");
    if (!form.telefone.trim()) return alert("Telefone obrigatório.");
    if (!form.whatsapp.trim()) return alert("WhatsApp obrigatório.");

    try {
      setLoading(true);

      const resp = await fetch(
        buildWebhookUrl("inserefornecedorcliente"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: 0,
            empresa_id,
            tipo,
            ...form
          })
        }
      );

      const json = await resp.json();
      const novo = Array.isArray(json) ? json[0] : json;

      if (!novo?.id) {
        alert("Erro ao salvar.");
        return;
      }

      alert("Cadastro mínimo realizado.");
      onSuccess(novo);

    } catch (e) {
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">

      <input
        name="nome"
        placeholder="Nome"
        className="input-premium"
        value={form.nome}
        onChange={handleChange}
      />

      <input
        name="cpf_cnpj"
        placeholder="CPF / CNPJ"
        className="input-premium"
        value={form.cpf_cnpj}
        onChange={handleChange}
      />

      <input
        name="telefone"
        placeholder="Telefone"
        className="input-premium"
        value={form.telefone}
        onChange={handleChange}
      />

      <input
        name="whatsapp"
        placeholder="WhatsApp"
        className="input-premium"
        value={form.whatsapp}
        onChange={handleChange}
      />

      <div className="flex gap-4 pt-4">
        <button
          onClick={salvar}
          disabled={loading}
          className="flex-1 bg-[#061f4aff] text-white px-4 py-2 rounded-lg"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>

        <button
          onClick={onCancel}
          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg"
        >
          Cancelar
        </button>
      </div>

    </div>
  );
}
