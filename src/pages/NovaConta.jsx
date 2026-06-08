 import React, { useState } from "react";
 import { hojeLocal, dataLocal } from "../utils/dataLocal";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { useLocation } from "react-router-dom";


export default function NovaConta({
  modoDrawer = false,
  dadosIniciais = null,
  onClose,
  onSuccess,
} = {}) {


  const location = useLocation();
const bancoSelecionado = location.state || {};

const state = dadosIniciais || location.state || {};
 
 const [form, setForm] = useState({
  empresa_id: localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa") || "",
  nome: "",
  banco: state.banco_nome || "",
  tipo: "corrente",
  saldo_inicial: "",
  nro_banco: state.banco_codigo || "",
  agencia: state.agencia || "",
  conta: state.conta || "",
  conjunta: false,
  juridica: false,
  padrao: false,
  conta_contabil: "",
  icone_url: state.banco_icone_url || "",
});

React.useEffect(() => {
  if (!dadosIniciais) return;

  setForm((prev) => ({
    ...prev,
    banco: dadosIniciais.banco_nome || "",
    nro_banco: dadosIniciais.banco_codigo || "",
    icone_url: dadosIniciais.banco_icone_url || "",
    agencia: dadosIniciais.agencia || "",
    conta: dadosIniciais.conta || "",
  }));
}, [dadosIniciais]);

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

     if (!form.conta_contabil.startsWith("1.1.")) {
      alert("Conta financeira deve estar no grupo 1.1 (Disponibilidades). Ex: 1.1.01");
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


const labelCls = "block text-sm font-semibold text-slate-700 mb-1";
const inputCls =
  "w-full h-11 rounded-xl border border-cyan-100 bg-white px-3 text-slate-800 font-semibold shadow-[0_2px_8px_rgba(15,23,42,0.10)] focus:outline-none focus:ring-2 focus:ring-cyan-200";

  
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
    <div className={modoDrawer ? "bg-white px-2 py-2" : "min-h-screen bg-slate-100 px-3 py-4 flex items-start justify-center"}>
    <div className={modoDrawer ? "w-full rounded-2xl bg-white border border-slate-200 overflow-hidden" : "w-full max-w-[620px] rounded-2xl bg-white shadow-2xl border border-slate-300 overflow-hidden"}>

       {/* TOPO */}
      
        
        <div className="flex items-center justify-between">
          <button
            type="button"
           onClick={() => {
              if (modoDrawer && typeof onClose === "function") {
                onClose();
                return;
              }
              navigate("/contacorrente");
            }}
           className="text-3xl font-black text-white"
          >
            ←
          </button>

          <h1 className="text-xl font-black text-black">
            Nova Conta
          </h1>

          <div className="w-10" />
        </div>

      
      </div>

      {/* CARD */}
        <div className="bg-white px-6 pb-6 space-y-5">
     
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-4">
                {form.icone_url && (
                  <img
                    src={form.icone_url}
                    alt={form.banco}
                    className="w-14 h-14 object-contain"
                  />
                )}

                <div>
                  <div className="font-black text-slate-800 text-lg">
                    {form.banco}
                  </div>

                  <div className="text-sm text-slate-500 font-semi-bold">
                    Código: {form.nro_banco}
                  </div>
                </div>
              </div>


        <div>
          <label className="block font-black text-[#1e1b4b] mb-1">
            Nome da Conta
          </label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
              className={inputCls}
            placeholder="Ex: Bradesco, Itaú, Caixa"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semi-bold text-[#1e1b4b] mb-1">
              Banco
            </label>
            <input
              value={form.banco}
              disabled
                className={inputCls}
            />
          </div>

          <div>
            <label className="block font-semi-bold text-[#1e1b4b] mb-1">
              Nº Banco
            </label>
            <input
              name="nro_banco"
              value={form.nro_banco}
              onChange={handleChange}
                disabled
                className={inputCls}
              placeholder="341"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semi-bold text-[#1e1b4b] mb-1">
              Agência
            </label>
            <input
              name="agencia"
              value={form.agencia}
              onChange={handleChange}
               className={inputCls}
              placeholder="0001"
            />
          </div>

          <div>
            <label className="block font-semi-bold text-[#1e1b4b] mb-1">
              Conta
            </label>
            <input
              name="conta"
              value={form.conta}
              onChange={handleChange}
                className={inputCls}
              placeholder="00458-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semi-bold text-[#1e1b4b] mb-1">
              Tipo
            </label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
               className={inputCls}
            >
              <option value="">Selecione...</option>
              <option value="corrente">Corrente</option>
              <option value="poupanca">Poupança</option>
              <option value="carteira">Carteira</option>
              <option value="caixa">Caixa</option>
            </select>
          </div>

          <div>
            <label className="block font-semi-bold text-[#1e1b4b] mb-1">
              Saldo Inicial
            </label>
            <input
              type="number"
              name="saldo_inicial"
              value={form.saldo_inicial}
              onChange={handleChange}
                className={inputCls}
              placeholder="0,00"
            />
          </div>
        </div>

        <div>
          <label className="block font-semi-bold text-[#1e1b4b] mb-1">
            Conta Contábil
          </label>
          <input
            name="conta_contabil"
            value={form.conta_contabil}
            onChange={handleChange}
              className={inputCls}
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

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl bg-cyan-50 border border-cyan-200 text-slate-700 font-bold shadow-sm hover:bg-cyan-100"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={salvar}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#062b49] text-white font-black shadow-sm hover:brightness-110"
          >
            💾 {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
   
);
 

}
