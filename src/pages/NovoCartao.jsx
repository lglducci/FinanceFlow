 import { useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function NovoCartao() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || 1;

  const [form, setForm] = useState({
    nome: "",
    bandeira: "",
    limite_total: "",
    fechamento_dia: "",
    vencimento_dia: "",
    vencimento: "",   // <-- MM/AA
    numero: "",
    NomeCartao: "",
    status: "ativo"
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function salvar() {
    if (!form.nome || !form.bandeira) {
      alert("Preencha nome e bandeira.");
      return;
    }

    const url = buildWebhookUrl("novo_cartao");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_empresa:  empresa_id ,
        ...form
      })
    });

    const json = await resp.json();
 

// CORRETO PARA O RETORNO REAL DO SEU WEBHOOK
const ok = Array.isArray(json) && json.length > 0 && json[0].id;

if (ok) {
  alert("Cartão criado com sucesso!");
  navigate("/cards");
} else {
  console.log("RETORNO INVALIDO:", json);
  alert("Erro ao criar cartão.");
}






  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Novo Cartão</h2>

      <div className="bg-white p-5 rounded-xl shadow flex flex-col gap-4">

        <div>
          <label className="font-semibold text-sm">Nome</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="font-semibold text-sm">Bandeira</label>
          <input
            name="bandeira"
            value={form.bandeira}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="font-semibold text-sm">Limite Total</label>
          <input
            type="number"
            name="limite_total"
            value={form.limite_total}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/3">
            <label className="font-semibold text-sm">Fechamento dia</label>
            <input
              type="number"
              name="fechamento_dia"
              value={form.fechamento_dia}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="w-1/3">
            <label className="font-semibold text-sm">Vencimento dia</label>
            <input
              type="number"
              name="vencimento_dia"
              value={form.vencimento_dia}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="w-1/3">
            <label className="font-semibold text-sm">Vencimento (MM/AA)</label>
            <input
              name="vencimento"
              value={form.vencimento}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-sm">Número do Cartão</label>
          <input
            name="numero"
            value={form.numero}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="font-semibold text-sm">Nome no Cartão</label>
          <input
            name="NomeCartao"
            value={form.NomeCartao}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="font-semibold text-sm">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="ativo">Ativo</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <button
          onClick={salvar}
          className="bg-green-600 text-white px-5 py-2 rounded font-semibold"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
