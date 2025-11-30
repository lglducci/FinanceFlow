import React, { useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

 /* 🎨 Tema azul coerente com Login/KDS (fora escuro, dentro mais claro) */
const THEME = {
  pageBg: "#0e2a3a",                 // fundo da página (escuro)
  panelBg: "#1e40af",                // fundos auxiliares (se precisar) panelBg: "#4a88a9ff",   
  panelBorder: "rgba(255,159,67,0.30)",

  cardBg: "#254759",                 // bloco interno mais claro
  cardBorder: "rgba(255,159,67,0.35)",
  cardShadow: "0 6px 20px rgba(0,0,0,0.25)",

  title: "#ff9f43",
  text: "#e8eef2",
  textMuted: "#bac7cf",

  fieldBg: "#1f3b4d",                // inputs (um tom acima do card)
  fieldBorder: "rgba(255,159,67,0.25)",
  focusRing: "#ff9f43",

  btnPrimary: "#ff9f43",
  btnPrimaryText: "#1b1e25",
  btnSecondary: "#ef4444",
  btnSecondaryText: "#ffffff",
};

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

     <div className="min-h-screen py-6 px-4 bg-bgSoft"> 
      <div className="w-full max-w-3xl mx-auto rounded-2xl p-6 shadow-xl bg-[#1e40af] text-white"> 
      
        <h1
        className="text-2xl md:text-3xl font-bold mb-6 text-left"
        style={{ color: THEME.title }}
      >
        ✏️ Nova Conta</h1>
       <div className="bg-gray-100 p-5 rounded-xl shadow flex flex-col gap-4">

        <label className="font-bold text-[#1e40af]">Nome</label>
        <input
           className="input-premium"
          value={form.nome}
           placeholder="nome"
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          
        />

        <label className="font-bold text-[#1e40af]">Tipo</label>
        <select
          className="input-premium"
          value={form.tipo} 
          placeholder="tipo"
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
    </div>
  );
}
