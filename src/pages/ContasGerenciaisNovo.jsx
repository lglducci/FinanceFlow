import React, { useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function ContasGerenciaisNovo() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

  const [form, setForm] = useState({
    nome: "",
    tipo: "entrada",
  });

 async function salvar() {
  const url = buildWebhookUrl("novacategoriagerencial");

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ empresa_id, ...form }),
  });

  const texto = await resp.text();
  let json = {};
  try { json = JSON.parse(texto); } catch {}

  // --- CORREÇÃO: valida retorno em array ---
  if (Array.isArray(json) && json.length > 0 && json[0].id) {
    alert("Conta criada!");
    navigate("/contasgerenciais");
    return;
  }

  alert("Erro ao salvar");
}


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Nova Conta</h1>

      <div className="bg-white p-4 border rounded shadow max-w-md">

        <label>Nome</label>
        <input
          className="border px-3 py-2 rounded w-full mb-3"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />

        <label>Tipo</label>
        <select
          className="border px-3 py-2 rounded w-full mb-4"
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
        >
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>

        <button
          onClick={salvar}
          className="bg-green-600 text-white px-5 py-2 rounded font-bold"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
