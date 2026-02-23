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
    <div className="min-h-screen py-6 px-4 bg-bgSoft">
        <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#061f4aff] text-white mt-1 mb-1" >

        <h1
          className="text-2xl md:text-2xl font-bold p-2 mb-3 text-center"
          style={{ color: THEME.title }}
        >
          ✏️ Nova Categoria Gerencial
        </h1>

        

        <div className="bg-gray-100 p-5 rounded-xl shadow flex flex-col gap-4">

          {/* NOME */}
          <label className="label label-required font-bold text-[#1e40af]">Nome</label>
          <input
            className="input-premium"
            value={form.nome}
            placeholder="Ex: Vendas Delivery"
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />

          {/* TIPO */}
          <label className=" label label-required font-bold text-[#1e40af]">Tipo</label>
          <select
            className="input-premium"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>

 
    
          
          {/* BOTÕES */}
          <div className="flex gap-6 pt-8 pb-8 pl-1">

            <button
              onClick={salvar} 
              className="flex-1 bg-[#061f4aff] text-white px-5 py-2 rounded font-bold"
            >
              Salvar
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-500 text-white px-4 py-3 rounded font-bold"
            >
              Cancelar
            </button>

          </div>

        </div>
      </div>

      
           <ModalBase
          open={modalModelo}
          onClose={() => setModalModelo(false)}
          title="Novo Modelo"
        >
          <FormModeloContabil
            empresa_id={empresa_id}
               tipo_operacao=""   // <-- AQUI
            onSuccess={() => {
              setModalModelo(false);
              carregarModelos();
            }} 

            onCancel={() => setModalModelo(false)}
          />
        </ModalBase>
    </div>
  );
}
