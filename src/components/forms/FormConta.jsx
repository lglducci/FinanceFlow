import React, { useState } from "react";
import { buildWebhookUrl } from "../../config/globals";

export default function FormConta({
  empresa_id,
  onSuccess,
  onCancel
}) {

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    empresa_id: empresa_id,
    nome: "",
    banco: "",
    tipo: "",
    saldo_inicial: "",
    nro_banco: "",
    agencia: "",
    conta: "",
    conjunta: false,
    juridica: false,
    padrao: false,
    conta_contabil: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const salvar = async () => {

    if (!form.nome.trim()) {
      alert("Nome obrigatório");
      return;
    }

    try {
      setLoading(true);

      const resp = await fetch(
        buildWebhookUrl("novacontafinanceira"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: form })
        }
      );

      const data = await resp.json();

      if (!resp.ok) {
        alert("Erro ao salvar conta");
        return;
      }

      const nova = Array.isArray(data) ? data[0] : data;

      if (onSuccess) {
           
       alert("⚠ Conta criada com cadastro mínimo. Complete os dados depois em Cadastros-> Contas Financeiras.");
        onSuccess(nova);
      }

    } catch (err) {
      console.error(err);
      alert("Erro ao salvar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">

      <input
        name="nome"
        placeholder="Nome da Conta"
        className="input-premium"
        value={form.nome}
        onChange={handleChange}
      />

      <input
        name="banco"
        placeholder="Banco"
        className="input-premium"
        value={form.banco}
        onChange={handleChange}
      />

      <select
        name="tipo"
        value={form.tipo}
        onChange={handleChange}
        className="input-premium"
      >
        <option value="">Tipo</option>
        <option value="corrente">Corrente</option>
        <option value="poupanca">Poupança</option>
        <option value="caixa">Caixa</option>
      </select>

      <input
        type="number"
        name="saldo_inicial"
        placeholder="Saldo Inicial"
        className="input-premium"
        value={form.saldo_inicial}
        onChange={handleChange}
      />

      <input
        name="conta_contabil"
        placeholder="Conta Contábil"
        className="input-premium"
        value={form.conta_contabil}
        onChange={handleChange}
      />

      <div className="flex gap-4 pt-4">
        <button
          onClick={salvar}
          disabled={loading}
          className="flex-1 bg-[#061f4aff] text-white px-4 py-2 rounded-lg"
        >
          {loading ? "Salvando..." : "Salvar Conta"}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            Cancelar
          </button>
        )}
      </div>

    </div>
  );
}
