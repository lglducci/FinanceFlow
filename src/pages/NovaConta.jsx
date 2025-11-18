 import React, { useState } from "react";

export default function NovaConta() {
  const [form, setForm] = useState({
    empresa_id: localStorage.getItem("id_empresa") || "",
    nome: "",
    banco: "",
    tipo: "",
    saldo_inicial: "",
    nro_banco: "",
    agencia: "",
    conta: "",
    conjunta: false,
    juridica: false,
    padrao: false
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const salvar = async () => {
    try {
      setLoading(true);

      const payload = {
        body: {
          empresa_id: form.empresa_id,
          nome: form.nome,
          banco: form.banco,
          tipo: form.tipo,
          saldo_inicial: form.saldo_inicial,
          nro_banco: form.nro_banco,
          agencia: form.agencia,
          conta: form.conta,
          conjunta: form.conjunta,
          juridica: form.juridica,
          padrao: form.padrao,
        },
      };

      console.log("ENVIANDO PRO WEBHOOK:", payload);

      const resp = await fetch(
        "https://webhook.lglducci.com.br/webhook/novacontafinanceira",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!resp.ok) {
        console.log("ERRO STATUS:", resp.status);
        alert("Erro ao salvar conta.");
        return;
      }

      const data = await resp.json();
      console.log("RESPOSTA SALVAR:", data);

      alert("Conta salva com sucesso!");

      setForm({
        empresa_id: localStorage.getItem("id_empresa") || "",
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
      });
    } catch (e) {
      console.log("ERRO:", e);
      alert("Erro ao salvar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Nova Conta Financeira</h2>

      <div className="flex flex-col gap-4">
        <input
          name="nome"
          placeholder="Nome da Conta"
          className="border p-2 rounded"
          value={form.nome}
          onChange={handleChange}
        />

        <input
          name="banco"
          placeholder="Banco"
          className="border p-2 rounded"
          value={form.banco}
          onChange={handleChange}
        />

        <input
          name="tipo"
          placeholder="Tipo (corrente / poupança / carteira)"
          className="border p-2 rounded"
          value={form.tipo}
          onChange={handleChange}
        />

        <input
          name="saldo_inicial"
          placeholder="Saldo inicial"
          className="border p-2 rounded"
          value={form.saldo_inicial}
          onChange={handleChange}
        />

        <input
          name="nro_banco"
          placeholder="Número do Banco"
          className="border p-2 rounded"
          value={form.nro_banco}
          onChange={handleChange}
        />

        <input
          name="agencia"
          placeholder="Agência"
          className="border p-2 rounded"
          value={form.agencia}
          onChange={handleChange}
        />

        <input
          name="conta"
          placeholder="Número da Conta"
          className="border p-2 rounded"
          value={form.conta}
          onChange={handleChange}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="conjunta"
            checked={form.conjunta}
            onChange={handleChange}
          />
          Conjunta
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="juridica"
            checked={form.juridica}
            onChange={handleChange}
          />
          Jurídica
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="padrao"
            checked={form.padrao}
            onChange={handleChange}
          />
          Conta padrão?
        </label>

        <button
          onClick={salvar}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
