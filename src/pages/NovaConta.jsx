 import React, { useState } from "react";

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
    padrao: false
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



  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const salvar = async () => {
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
        },
      };

      console.log("ENVIANDO PRO WEBHOOK:", payload);

      const resp = await fetch(
        "https://webhook.lglducci.com.br/webhook/novacontafinanceira",
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
  <div className="min-h-screen py-10 px-4" style={{ background: THEME.text }}>
   <div className="w-full max-w-3xl mx-auto rounded-2xl p-6 shadow-xl bg-[#1e40af] text-white"> 
    <div
      className="w-full max-w-4xl mx-auto rounded-2xl p-8 shadow-2xl"
      style={{
        background: THEME.panelBg,
        borderColor: THEME.cardBorder,
        boxShadow: THEME.cardShadow,
      }}
    >
      <h1
        className="text-2xl md:text-3xl font-bold mb-8 text-center"
        style={{ color: THEME.title }}
      >
        ✏️ Nova Conta Financeira
      </h1>

      <div className="flex flex-col gap-6">

        {/* Nome */}
        <div>
          <label className="block font-bold mb-1">Nome da Conta</label>
          <input
            name="nome" 
            value={form.nome}
            onChange={handleChange}
             className="input-base w-full h-10"
             placeholder="Nome da sua conta para identificação"
          />
        </div>

        {/* Banco + Número do Banco */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-bold mb-1">Banco</label>
            <input
              name="banco"
              className="input-base w-64 h-10"
              value={form.banco}
              onChange={handleChange}
                 placeholder="Nome do Banco"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Número do Banco</label>
            <input
              name="nro_banco"
                 className="input-base w-64 h-10"
              value={form.nro_banco}
              onChange={handleChange}
                 placeholder="0341"
            />
          </div>
        </div>

        {/* Conta + Agência + Número Conta */}
       
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-bold mb-1">Agência</label>
            <input
              name="agencia"
               className="input-base w-48 h-10"
              value={form.agencia}
              onChange={handleChange}
               placeholder="0001"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Número da Conta</label>
            <input
              name="conta"
               className="input-base w-48 h-10"
              value={form.conta}
              onChange={handleChange}
                placeholder="00458-8"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-bold mb-1">Tipo</label>
            <input
              name="tipo"
                className="input-base w-48 h-10"
              value={form.tipo}
              onChange={handleChange}
              placeholder="Conta Corrente"
            />
          </div>


        </div>

        {/* Tipo + Saldo Inicial */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6"> 
          <div>
            <label className="block font-bold mb-1">Saldo Inicial</label>
            <input
              name="saldo_inicial"
              className="input-base w-72 h-10"
              value={form.saldo_inicial}
              onChange={handleChange}
              placeholder="0,00"
            />
          </div>
        </div></div>

        {/* Checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
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

        {/* Botão */}
        <button
          onClick={salvar}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg mt-6 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
     </div>
      </div>
    </div>
  </div>
);

}
