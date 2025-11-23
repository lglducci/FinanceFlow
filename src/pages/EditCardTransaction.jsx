 import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function EditCardTransaction() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const id_transacao = state?.id_transacao;
  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [form, setForm] = useState({
    descricao: "",
    cartao_nome: "",
    cartao_bandeira: "",
    data_parcela: "",
    valor: "",
    parcela_num: "",
    parcela_total: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id_transacao) return;
    carregar();
  }, []);

  const carregar = async () => {
    try {
      const url = buildWebhookUrl("retrivetranscaocartao", {
        id_transacao,
        id_empresa: empresa_id,
      });

      const resp = await fetch(url);
      const json = await resp.json();

      const dados = json && Array.isArray(json) && json.length > 0 ? json[0] : null;

      if (!dados) {
        alert("Transação não encontrada.");
        return;
      }

      setForm({
        descricao: dados.descricao || "",
        cartao_nome: dados.cartao_nome || "",
        cartao_bandeira: dados.cartao_bandeira || "",
        data_parcela: dados.data_parcela?.substring(0, 10) || "",
        valor: dados.valor || "",
        parcela_num: dados.parcela_num || "",
        parcela_total: dados.parcela_total || "",
      });

    } catch (err) {
      console.error(err);
      alert("Erro ao carregar transação.");
    }
  };

  const salvar = async () => {
    if (!form.descricao.trim()) {
      alert("A descrição não pode estar vazia.");
      return;
    }

    try {
      setLoading(true);
      const url = buildWebhookUrl("updatetranscartao", {});

      await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          id_transacao,
          id_empresa: empresa_id,
          descricao: form.descricao,
        }),
      });

      alert("Descrição atualizada!");
      navigate(-1);

    } catch (err) {
      console.error(err);
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };


  const excluir = async () => {
  if (!window.confirm("Tem certeza que deseja excluir esta transação?")) return;

  try {
    const url = buildWebhookUrl("exclitranscartao");

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_transacao,
        id_empresa: empresa_id
      })
    });

    alert("Transação excluída!");
    navigate(-1);

  } catch (err) {
    console.error(err);
    alert("Erro ao excluir.");
  }
};

    


  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Editar Transação</h2>

      {/* CARTÃO */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-600">Cartão</label>
        <div className="font-semibold">{form.cartao_nome || "-"}</div>
        {form.cartao_bandeira && (
          <div className="text-xs text-gray-500">{form.cartao_bandeira}</div>
        )}
      </div>

      {/* CAMPOS SOMENTE LEITURA */}
      <div className="mb-4">
        <label className="font-semibold block mb-1">Data da Parcela</label>
        <input
          type="text"
          value={form.data_parcela}
          readOnly
          className="border p-2 rounded w-full bg-gray-200 text-gray-600"
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold block mb-1">Valor</label>
        <input
          type="text"
          value={form.valor}
          readOnly
          className="border p-2 rounded w-full bg-gray-200 text-gray-600"
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold block mb-1">Parcela</label>
        <input
          type="text"
          value={`${form.parcela_num}/${form.parcela_total}`}
          readOnly
          className="border p-2 rounded w-full bg-gray-200 text-gray-600"
        />
      </div>

      {/* DESCRIÇÃO — único editável */}
      <div className="mb-6">
        <label className="font-semibold block mb-1">Descrição</label>
        <input
          type="text"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* BOTÕES */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={salvar}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-4 py-3 rounded font-bold"
        >
          Salvar
        </button>

        <button
          onClick={excluir}
          className="flex-1 bg-red-600 text-white px-4 py-3 rounded font-bold"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
