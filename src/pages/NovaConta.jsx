 import React, { useState } from "react";
 import { hojeLocal, dataLocal } from "../utils/dataLocal";
import { useNavigate } from "react-router-dom";

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
          conta_contabil: form.conta_contabil
        },
      };

      console.log("ENVIANDO PRO WEBHOOK:", payload);

      const resp = await fetch(
        "https://webhook-homolog.lglducci.com.br/webhook/novacontafinanceira",
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
        <div className="min-h-screen py-6 px-4 bg-bgSoft"> 
   
     <div className="w-full max-w-3xl mx-auto rounded-2xl p-4 shadow-xl bg-[#1e40af] text-white mt-4 mb-10">   
      <h1
       
         className="text-2xl md:text-3xl font-bold mb-6 text-center"
        style={{ color: THEME.title }}
      >
        ✏️ Nova Conta Financeira
      </h1>
      <div className="bg-gray-100 p-5 rounded-xl shadow flex flex-col gap-4"> 

        {/* Nome */}
        <div>
          <label className="label label-required block font-bold mb-1 text-[#1e40af]">Nome da Conta</label>
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
            <label className="label label-required block font-bold mb-1 text-[#1e40af]">Banco</label>
            <input
              name="banco"
              className="input-base w-64 h-10"
              value={form.banco}
              onChange={handleChange}
                 placeholder="Nome do Banco"
            />
          </div>

          <div>
            <label className="label label-required block font-bold mb-1 text-[#1e40af]">Número do Banco</label>
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
            <label className=" label label-required block font-bold mb-1 text-[#1e40af]">Agência</label>
            <input
              name="agencia"
               className="input-base w-48 h-10"
              value={form.agencia}
              onChange={handleChange}
               placeholder="0001"
            />
          </div>

          <div>
            <label className="label label-required block font-bold mb-1 text-[#1e40af]">Número da Conta</label>
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
            <label className="label label-required block font-bold mb-1 text-[#1e40af]">Tipo</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="input-base w-48 h-10 border rounded px-2 font-bold text-gray-700"
            >
              <option value="">Selecione...</option>
              <option value="corrente">Corrente</option>
              <option value="poupanca">Poupança</option>
              <option value="carteira">Carteira</option>
              <option value="caixa">Caixa</option>
            </select>
          </div>

        </div>

        {/* Tipo + Saldo Inicial */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6"> 
          <div>
            <label className="label label-required block font-bold mb-1 text-[#1e40af]">Saldo Inicial</label>
            <input
                 type="number"
              name="saldo_inicial"
              className="input-base w-72 h-10"
              value={form.saldo_inicial}
              onChange={handleChange}
              placeholder="0,00"
            />
          </div>
        </div></div>

        {/* Checkboxes */}
        <div className=" label label-required font-bold grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-[#1e40af]">
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
       

        <div>
              <label className="font-bold text-[#1e40af] flex items-center gap-2">
                Conta Contábil *
                <span className="relative group cursor-pointer">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                    ?
                  </span>

                  {/* Tooltip */}
                  <div className="absolute left-6 top-0 z-50 hidden group-hover:block 
                                  bg-gray-900 text-white text-xs rounded-lg p-3 w-80 shadow-lg">
                   
                    <strong>O que é este campo?</strong>

                    <p className="mt-1">
                      Esta conta representa <b>onde o dinheiro realmente entra ou sai</b>.
                    </p>

                    <p className="mt-1">
                      Exemplo: Bradesco, Itaú, Caixa, Dinheiro em Caixa.
                    </p>

                    <p className="mt-1">
                      Cada conta financeira possui uma <b>conta contábil equivalente</b>,
                      que registra o saldo no balanço.
                    </p>

                    <p className="mt-1 text-yellow-300">
                      Exemplo: Bradesco Agência X → Conta contábil <b>1.1.2.23.1</b>
                    </p>

                    <p className="mt-1 text-yellow-300">
                      ⚠ O sistema cuida da ligação entre financeiro e contábil automaticamente.
                    </p>
 
                  </div>
                </span>
              </label>

          <input
            name="conta_contabil" 
            value={form.conta_contabil}
            onChange={handleChange}
             className="input-base w-full h-10"
             placeholder="Nome da sua conta contábil (exemplo) 1.1.23.1"
          />
        </div>
       
       
      

      <div className="flex gap-6 pt-8 pb-8 pl-1">

        {/* Botão */}
        <button
          onClick={salvar}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl text-lg mt-6 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
         <button
            type="button"
            onClick={() => navigate("/saldos")}
            className="flex-1 bg-gray-400 text-white px-6 py-3 rounded-xl text-lg mt-6 disabled:opacity-60"
          >
            Cancelar
          </button>
       </div>
       </div>
      </div>
    </div>
   
);

}
