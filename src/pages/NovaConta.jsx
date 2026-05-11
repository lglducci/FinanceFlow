 import React, { useState } from "react";
 import { hojeLocal, dataLocal } from "../utils/dataLocal";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function NovaConta() {
  const [form, setForm] = useState({
    empresa_id: localStorage.getItem("id_empresa") || "",
    nome: "",
    banco: "",
    tipo: "",
    saldo_inicial: "",
    nro_banco: "",
    agencia: "",
    conta: "",
    conjunta: false,
    juridica: false,
    padrao: false,
    conta_contabil:""

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

 const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const salvar = async () => {

     if (!form.conta_contabil.startsWith("1.1.1.")) {
      alert("Conta financeira deve estar no grupo 1.1.1 (Disponibilidades). Ex: 1.1.1.01");
      return;
    }
  try {
    setLoading(true);

    const payload = {
      body: {
        empresa_id: form.empresa_id,
        nome: form.nome,
        banco: form.banco,
        tipo: form.tipo,
        saldo_inicial: form.saldo_inicial,
        nro_banco: form.nro_banco,
        agencia: form.agencia,
        conta: form.conta,
        conjunta: form.conjunta,
        juridica: form.juridica,
        padrao: form.padrao,
        conta_contabil: form.conta_contabil,
      },
    };

    console.log("ENVIANDO PRO WEBHOOK:", payload);

    


    const resp = await fetch(
      buildWebhookUrl("novacontafinanceira"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!resp.ok) {
      console.log("ERRO STATUS:", resp.status);
      alert("Erro ao salvar conta.");
      return;
    }

    const data = await resp.json();
    console.log("RESPOSTA SALVAR:", data);

    alert("Conta salva com sucesso!");

    setForm({
      empresa_id: localStorage.getItem("id_empresa") || "",
      nome: "",
      banco: "",
      tipo: "",
      saldo_inicial: "",
      nro_banco: "",
      agencia: "",
      conta: "",
      conjunta: false,
      juridica: false,
      padrao: false,
      conta_contabil: "",
    });
  } catch (e) {
    console.log("ERRO:", e);
    alert("Erro ao salvar conta.");
  } finally {
    setLoading(false);
  }
};



  
  const fieldCls =
    "w-full px-3 py-2 rounded-xl focus:outline-none transition-shadow";
  const fieldStyle = {
    background: THEME.fieldBg,
    color: THEME.text,
    border: `1px solid ${THEME.fieldBorder}`,
    boxShadow: "none",
  };
  const fieldFocus = { boxShadow: `0 0 0 2px ${THEME.focusRing}55` };
return (
   <div className="min-h-screen bg-gradient-to-br from-slate-150 via-blue-150 to-slate-100 px-3 py-4 flex items-start justify-center">
    <div className="w-full max-w-md rounded-[30px] bg-white/95 shadow-2xl border border-white/40 overflow-hidden">

       {/* TOPO */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 px-5 py-5 text-white">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
           className="text-3xl font-black text-white"
          >
            ←
          </button>

          <h1 className="text-xl font-black text-white">
            Nova Conta
          </h1>

          <div className="w-10" />
        </div>

        <p  className="text-center text-blue-100 font-bold mt-4">
          Cadastro de conta financeira
        </p>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-[28px] shadow-xl border border-slate-200 p-5 space-y-4">

        <div>
          <label className="block font-black text-[#1e1b4b] mb-1">
            Nome da Conta
          </label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className="w-full  h-8 rounded-xl border border-slate-300 px-3 font-bold"
            placeholder="Ex: Bradesco, Itaú, Caixa"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-black text-[#1e1b4b] mb-1">
              Banco
            </label>
            <input
              name="banco"
              value={form.banco}
              onChange={handleChange}
              className="w-full  h-8 rounded-xl border border-slate-300 px-3 font-bold"
              placeholder="Banco"
            />
          </div>

          <div>
            <label className="block font-black text-[#1e1b4b] mb-1">
              Nº Banco
            </label>
            <input
              name="nro_banco"
              value={form.nro_banco}
              onChange={handleChange}
              className="w-full  h-8 rounded-xl border border-slate-300 px-3 font-bold"
              placeholder="341"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-black text-[#1e1b4b] mb-1">
              Agência
            </label>
            <input
              name="agencia"
              value={form.agencia}
              onChange={handleChange}
              className="w-full  h-8 rounded-xl border border-slate-300 px-3 font-bold"
              placeholder="0001"
            />
          </div>

          <div>
            <label className="block font-black text-[#1e1b4b] mb-1">
              Conta
            </label>
            <input
              name="conta"
              value={form.conta}
              onChange={handleChange}
              className="w-full  h-8 rounded-xl border border-slate-300 px-3 font-bold"
              placeholder="00458-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-black text-[#1e1b4b] mb-1">
              Tipo
            </label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full  h-8 rounded-xl border border-slate-300 px-3 font-bold text-slate-700"
            >
              <option value="">Selecione...</option>
              <option value="corrente">Corrente</option>
              <option value="poupanca">Poupança</option>
              <option value="carteira">Carteira</option>
              <option value="caixa">Caixa</option>
            </select>
          </div>

          <div>
            <label className="block font-black text-[#1e1b4b] mb-1">
              Saldo Inicial
            </label>
            <input
              type="number"
              name="saldo_inicial"
              value={form.saldo_inicial}
              onChange={handleChange}
              className="w-full  h-8 rounded-xl border border-slate-300 px-3 font-bold"
              placeholder="0,00"
            />
          </div>
        </div>

        <div>
          <label className="block font-black text-[#1e1b4b] mb-1">
            Conta Contábil
          </label>
          <input
            name="conta_contabil"
            value={form.conta_contabil}
            onChange={handleChange}
            className="w-full  h-8 rounded-xl border border-slate-300 px-3 font-bold"
            placeholder="Ex: 1.1.1.23"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 text-sm font-black text-[#1e1b4b]">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="conjunta"
              checked={form.conjunta}
              onChange={handleChange}
            />
            Conjunta
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="juridica"
              checked={form.juridica}
              onChange={handleChange}
            />
            Jurídica
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="padrao"
              checked={form.padrao}
              onChange={handleChange}
            />
            Padrão
          </label>
        </div>

           <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            type="button"
            onClick={salvar}
            disabled={loading}
             className="rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-600 text-white px-4 py-3 font-black shadow-lg active:scale-95"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-2xl bg-slate-200 text-slate-700 px-4 py-3 font-black active:scale-95"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  </div>
);
 

}
