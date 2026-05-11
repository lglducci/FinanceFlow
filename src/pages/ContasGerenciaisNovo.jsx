 import React, { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import ModalBase from "../components/ModalBase";
import  FormModeloContabil from "../components/forms/FormModeloContabil";


 
/* 🎨 Tema azul coerente */
const THEME = {
  title: "#ff9f43",
};

export default function ContasGerenciaisNovo() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);
  
const [modeloCodigo, setModeloCodigo] = useState("");
const [modalModelo, setModalModelo] = useState(false);
  /* ===============================
     ESTADO DO FORMULÁRIO
  ================================== */
  const [form, setForm] = useState({
    nome: "",
    tipo: "entrada" 
  });

 
 
    

  /* ===============================
     SALVAR NOVA CATEGORIA
  ================================== */
   async function salvar() {
  const url = buildWebhookUrl("novacategoriagerencial");

 

  if (!form.nome || form.nome.trim() === "") {
    alert("Nome é obrigatório.");
    return;
  }

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ empresa_id, ...form }),
  });

  const texto = await resp.text();
  let json = {};

  try {
    json = JSON.parse(texto);
  } catch {}

  if (
    Array.isArray(json) &&
    json.length > 0 &&
    json[0].ff_insere_categoria_gerencial
  ) {
    alert("Categoria criada!");
    navigate(-1);
    return;
  }

  alert("Erro ao salvar");
}

  

  /* ===============================
        TELA
  ================================== */

   
return (
  <div className="min-h-screen bg-gradient-to-b from-[#eef5fb] to-[#e8f1fa] px-4 py-5">
    <div className="w-full max-w-lg mx-auto">

      {/* TOPO */}
      <div className="bg-gradient-to-br from-[#2744b8] to-[#08748f] rounded-t-[28px] shadow-lg px-5 py-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white/15 text-white px-4 py-2 rounded-full text-sm font-black mb-5"
        >
          ← Voltar
        </button>

        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          🏷️ Nova Categoria
        </h1>

        <p className="text-blue-100 text-sm font-semibold mt-2">
          Cadastre uma categoria gerencial.
        </p>
      </div>

      {/* FORM */}
      <div className="bg-white rounded-b-[28px] shadow-xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className="block text-[#0b1744] font-black mb-1">
            Nome
          </label>

          <input
            className="w-full  h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
            value={form.nome}
            placeholder="Ex: Vendas Delivery"
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[#0b1744] font-black mb-1">
            Tipo
          </label>

          <select
            className="w-full  h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
        </div>

        <div className="flex gap-3 pt-5">
          <button
            type="button"
            onClick={salvar}
            className="flex-1  h-12 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#4c1d95] text-white font-black shadow-lg"
          >
            Salvar
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1  h-12 rounded-full bg-slate-300 text-slate-700 font-black"
          >
            Cancelar
          </button>
        </div>
      </div>

      <ModalBase
        open={modalModelo}
        onClose={() => setModalModelo(false)}
        title="Novo Modelo"
      >
        <FormModeloContabil
          empresa_id={empresa_id}
          tipo_operacao=""
          onSuccess={() => {
            setModalModelo(false);
            carregarModelos();
          }}
          onCancel={() => setModalModelo(false)}
        />
      </ModalBase>
    </div>
  </div>
);

  
}
