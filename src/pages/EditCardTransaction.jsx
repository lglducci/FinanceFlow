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
  // valida descrição
  if (!form.descricao || !form.descricao.trim()) {
    alert("A descrição não pode estar vazia.");
    return;
  }

  // aqui eu assumo que id_transacao e empresa_id existem no escopo
  // se o id da transação estiver dentro do form (ex: form.id), você pode trocar depois
  const payload = {
    id_transacao,          // ou form.id, se for o caso
    id_empresa: empresa_id,
    descricao: form.descricao.trim(),
  };

  // DEBUG: vê no console se está indo algo null já daqui
  console.log("payload updatetranscartao =>", payload);

  try {
    setLoading(true);
    const url = buildWebhookUrl("updatetranscartao");

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",   // sem isso o n8n/supabase não parseia JSON direito
      },
      body: JSON.stringify(payload),
    });

    // se seu webhook devolve JSON
    let data;
    try {
      data = await resp.json();
    } catch {
      data = null;
    }

    if (!resp.ok) {
      console.error("Resposta erro:", data);
      alert("Erro ao salvar (resposta inválida do servidor).");
      return;
    }

    alert("Descrição atualizada!");
    navigate(-1);

  } catch (err) {
    console.error("ERRO salvar updatetranscartao:", err);
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
      <div className="min-h-screen py-8 px-4 bg-bgSoft"> 
      <div className="w-full max-w-4xl mx-auto rounded-xl p-6 shadow-xl bg-[#1e40af] text-blue">  
    
    
     <h2
          className="text-2xl md:text-3xl font-bold mb-6 text-center"
          style={{ color: "#ff9f43" }}
        >
          ✏️  Editar Transação de Cartão
        </h2>

       <div className="bg-gray-100 flex flex-col  gap-2  space-y-4 px-6"> 

      {/* CARTÃO */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-600 text-[#1e40af]">Cartão</label>
        <div className="font-semibold">{form.cartao_nome || "-"}</div>
        {form.cartao_bandeira && (
          <div className="border font-bold rounded px-2 py-2  w-[280px] mb-2 border-gray-300">{form.cartao_bandeira}</div>
        )}
      </div> 

      {/* CAMPOS SOMENTE LEITURA */}
      <div className="mb-4">
        <label className="font-semibold block mb-1 text-[#1e40af]">Data da Parcela</label>
        <input
          type="text"
          value={form.data_parcela}
          readOnly
          className="border p-2 rounded w-[280px] bg-gray-200 w-[280px] text-gray-600 border-gray-300"
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold block mb-1 w-[280px] text-[#1e40af]">Valor</label>
        <input
          type="text"
          value={form.valor}
          readOnly
          className="border p-2 rounded  w-[280px]  bg-gray-200 text-gray-600 border-gray-300"
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold block mb-1  w-[280px] text-[#1e40af]">Parcela</label>
        <input
          type="text"
          value={`${form.parcela_num}/${form.parcela_total}`}
          readOnly
          className="border p-2 rounded w-[280px] bg-gray-200 text-gray-600 border-gray-300"
        />
      </div>

      {/* DESCRIÇÃO — único editável */}
      <div className="mb-6">
        <label className="font-semibold block mb-1 text-[#1e40af]">Descrição</label>
        <input
          type="text"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          className="border p-2 rounded w-[680px] border-gray-300"
        />
      </div>

      {/* BOTÕES */}
       <div className="flex gap-6 pt-8 pb-8 pl-1">   
        <button
          onClick={salvar}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-4 py-3 rounded font-bold"
        >
          Salvar
        </button>

        
          <button
            onClick={() => navigate("/cards")}
            className="flex-1 bg-gray-400 text-white px-5 py-2 rounded font-semibold"
          >
            Cancelar
          </button>
          
      </div>
    </div>
    </div>
      </div>
  );
}
