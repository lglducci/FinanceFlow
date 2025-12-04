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
 
     
     <div className="min-h-screen py-6 px-4 bg-bgSoft"> 
      <div className="w-full max-w-3xl mx-auto rounded-2xl p-6 shadow-xl bg-[#1e40af] text-white"> 
      
        <h1
        className="text-2xl md:text-3xl font-bold mb-6 text-left"
        style={{ color: THEME.title }}
      >
        ✏️ Editar Conta</h1>

       <div className="bg-gray-100 p-5 rounded-xl shadow flex flex-col gap-4"> 

        <label className="font-bold text-[#1e40af]">Nome</label>
        <input
          className="input-premium"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />

          <label className="font-bold text-[#1e40af]">Tipo</label>
        <select
          className="input-premium"
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
        >
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
      
      
       <div className="flex gap-6 pt-8 pb-8 pl-1"> 
        <button
          onClick={salvar}
          className="flex-1 bg-blue-600 text-white px-5 py-2 rounded font-bold"
        >
          Salvar
        </button>  
          <button
            onClick={() => navigate("/contasgerenciais")}
            className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Voltar
          </button>
       </div>
      </div>
      </div>
    </div>
  );
}
