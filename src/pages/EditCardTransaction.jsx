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
    valor: "",
    parcela_num: "",
    parcela_total: "",
    data_parcela: "",
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

    // Corrigido
    const dados = json && Array.isArray(json) && json.length > 0 ? json[0] : null;

    if (!dados) {
      alert("Transação não encontrada.");
      return;
    }

    setForm({
      id: dados.id,
      empresa_id: dados.empresa_id,
      descricao: dados.descricao,
      valor: dados.valor,
      parcela_num: dados.parcela_num,
      parcela_total: dados.parcela_total,
      data_parcela: dados.data_parcela?.split("T")[0],
      fatura_id: dados.fatura_id,
    });

  } catch (err) {
    console.error(err);
    alert("Erro ao carregar transação.");
  }
};


  const salvar = async () => {
    if (!form.descricao || !form.valor) {
      alert("Preencha descrição e valor.");
      return;
    }

    try {
      setLoading(true);

      const url = buildWebhookUrl("updatetranscartao", {});

      const resp = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          id_transacao,
          id_empresa: empresa_id,
          ...form,
        }),
      });

      const resultado = await resp.json();

      alert("Transação atualizada com sucesso!");
      navigate(-1);

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">

      <h2 className="text-2xl font-bold mb-4">Editar Transação</h2>

      <div className="flex flex-col gap-4">

        <div>
          <label className="font-semibold block mb-1">Descrição</label>
          <input
            type="text"
            value={form.descricao}
            onChange={(e) =>
              setForm({ ...form, descricao: e.target.value })
            }
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="font-semibold block mb-1">Valor</label>
          <input
            type="number"
            value={form.valor}
            onChange={(e) =>
              setForm({ ...form, valor: e.target.value })
            }
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="font-semibold block mb-1">Parcela Nº</label>
            <input
              type="number"
              value={form.parcela_num}
              onChange={(e) =>
                setForm({ ...form, parcela_num: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex-1">
            <label className="font-semibold block mb-1">Parcelas Totais</label>
            <input
              type="number"
              value={form.parcela_total}
              onChange={(e) =>
                setForm({ ...form, parcela_total: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold block mb-1">Data da Parcela</label>
          <input
            type="date"
            value={form.data_parcela}
            onChange={(e) =>
              setForm({ ...form, data_parcela: e.target.value })
            }
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          onClick={salvar}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-3 rounded mt-4"
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}
