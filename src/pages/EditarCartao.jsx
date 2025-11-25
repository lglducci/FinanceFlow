import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function EditarCartao() {
  const navigate = useNavigate();
  const { id } = useParams();
  const empresa_id = localStorage.getItem("empresa_id") || 1;

  const [loading, setLoading] = useState(true);
 const [form, setForm] = useState({
  nome: "",
  bandeira: "",
  limite_total: "",
  fechamento_dia: "",
  vencimento_dia: "",
  status: "ativo",
  vencimento: "",
  numero: "",
  NomeCartão: "" 
});


  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
 async function carregar() {
  setLoading(true);

  try {
    const url = buildWebhookUrl("editarcartao") + `?id=${id}&empresa_id=${empresa_id}`;
    console.log("URL:", url);

    const resp = await fetch(url, { method: "GET" });

    const text = await resp.text();
    console.log("RAW:", text);

    let dados;
    try {
      dados = JSON.parse(text);
    } catch {
      dados = [];
    }

    const cartao = Array.isArray(dados) ? dados[0] : dados;

    if (!cartao) {
      alert("Cartão não encontrado.");
      navigate("/cards");
      return;
    }

      setForm({
        nome: cartao.nome || "",
        bandeira: cartao.bandeira || "",
        limite_total: cartao.limite_total || "",
        fechamento_dia: cartao.fechamento_dia || "",
        vencimento_dia: cartao.vencimento_dia || "",
        status: cartao.status || "ativo",

        vencimento: cartao.Vencimento || "",   // CORRIGIDO
        numero: cartao.numero || "",
        NomeCartao: cartao.NomeCartão || ""    // CORRIGIDO
      });



  } catch (e) {
    console.log("ERRO FETCH:", e);
    alert("Erro ao carregar cartão.");
  }

  setLoading(false);
}
 
// 👉 COLOQUE AQUI
useEffect(() => {
  carregar();
}, []);
 

  // =========================
  // SALVAR ALTERAÇÕES
  // =========================
  async function salvar() {
    const url = buildWebhookUrl("salvacartao");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: Number(id),
        empresa_id: Number(empresa_id),
        ...form
      })
    });

    const json = await resp.json();

  // sucesso = webhook retornou um array com objeto OU success === true
const sucesso =
  (Array.isArray(json) && json.length > 0) ||
  json?.success === true;

if (sucesso) {
  alert("Cartão atualizado com sucesso!");
  navigate("/cards");
} else {
  console.log("DEBUG JSON:", json);
  alert("Erro ao atualizar cartão.");
} 
 
  }

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

 return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Editar Cartão</h2>

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
            <label className="font-semibold text-sm">vencimento dia</label>
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

        <div className="flex gap-3 mt-4">
          <button
            onClick={salvar}
            className="bg-blue-600 text-white px-5 py-2 rounded font-semibold"
          >
            Salvar
          </button>

          <button
            onClick={() => navigate("/cards")}
            className="bg-gray-400 text-white px-5 py-2 rounded font-semibold"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}
