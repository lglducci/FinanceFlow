import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function ContasGerenciaisEditar() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

  const [form, setForm] = useState({
    id: state.id,
    nome: state.nome,
    tipo: state.tipo,
  });

 
async function salvar() {
  const url = buildWebhookUrl("SalvaCatetoria");

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ empresa_id, ...form }),
  });

  const texto = await resp.text();
  let json = {};

  try { json = JSON.parse(texto); } catch {}

  // 🔥 VALIDAÇÃO UNIVERSAL (FUNCIONA PARA OS 2 TIPOS)
  const sucesso =
    (json.success === true) ||                        // caso formato certo
    (Array.isArray(json) && json.length > 0);         // caso backend retorne o registro

  if (sucesso) {
    alert("Conta atualizada!");
    navigate("/contasgerenciais");
    return;
  }

  alert("Erro ao atualizar");
}

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        Editar Conta
      </h1>

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
          className="bg-blue-600 text-white px-5 py-2 rounded font-bold"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
