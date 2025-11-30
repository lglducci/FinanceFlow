 import { useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function NovoCartao() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || 1;


  
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


  const [form, setForm] = useState({
    nome: "",
    bandeira: "",
    limite_total: "",
    fechamento_dia: "",
    vencimento_dia: "",
    vencimento: "",   // <-- MM/AA
    numero: "",
    NomeCartao: "",
    status: "ativo"
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function salvar() {
    if (!form.nome || !form.bandeira) {
      alert("Preencha nome e bandeira.");
      return;
    }

    const url = buildWebhookUrl("novo_cartao");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_empresa:  empresa_id ,
        ...form
      })
    });

    const json = await resp.json();
 

// CORRETO PARA O RETORNO REAL DO SEU WEBHOOK
const ok = Array.isArray(json) && json.length > 0 && json[0].id;

if (ok) {
  alert("Cartão criado com sucesso!");
  navigate("/cards");
} else {
  console.log("RETORNO INVALIDO:", json);
  alert("Erro ao criar cartão.");
}






  }

  return (
     <div className="min-h-screen py-6 px-4 bg-bgSoft"> 
      <div className="w-full max-w-3xl mx-auto rounded-2xl p-6 shadow-xl bg-[#1e40af] text-white"> 
       <h1
        className="text-2xl md:text-3xl font-bold mb-6 text-center"
        style={{ color: THEME.title }}
      >
        ✏️ Novo Cartão
      </h1>


        <div className="bg-gray-100 p-5 rounded-xl shadow flex flex-col gap-4">

        <div>
          <label className="font-bold text-[#1e40af]">Nome</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className="input-premium"
            placeholder="nome"
          />
        </div>

        <div>
          <label  className="font-bold text-[#1e40af]">Bandeira</label>
          <input
            name="bandeira"
            value={form.bandeira}
            onChange={handleChange}
            className="input-premium"
              placeholder="Bandeira"
          />
        </div>

        <div>
          <label className="font-bold text-[#1e40af]">Limite Total</label>
          <input
            type="number"
            name="limite_total"
            value={form.limite_total}
            onChange={handleChange}
            className="input-premium"
               placeholder="0,00"
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/3">
            <label className="font-bold text-[#1e40af]">Fechamento dia</label>
            <input
              type="number"
              name="fechamento_dia"
              value={form.fechamento_dia}
              onChange={handleChange}
               className="input-premium"
                  placeholder="Fechamento dia"
            />
          </div>

          <div className="w-1/3">
            <label className="font-bold text-[#1e40af]">Vencimento dia</label>
            <input
              type="number"
              name="vencimento_dia"
              value={form.vencimento_dia}
              onChange={handleChange}
              className="input-premium"
                 placeholder="Vencto dia"
            />
          </div>

          <div className="w-1/3">
            <label className="font-bold text-[#1e40af]">Vencimento (MM/AA)</label>
            <input
              name="vencimento"
              value={form.vencimento}
              onChange={handleChange}
               className="input-premium"
                  placeholder="Vencto"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-[#1e40af]">Número do Cartão</label>
          <input
            name="numero"
            value={form.numero}
            onChange={handleChange}
             className="input-premium"
                placeholder="numero"
          />
        </div>

        <div>
          <label className="font-bold text-[#1e40af]">Nome no Cartão</label>
          <input
            name="NomeCartao"
            value={form.NomeCartao}
            onChange={handleChange}
             className="input-premium"
                placeholder="Nome do Cartão"
          />
        </div>

        <div>
          <label className="font-bold text-[#1e40af]">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
             className="input-premium"
          >
            <option value="ativo">Ativo</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        
          {/* BOTÕES */}
             <div className="flex gap-6 pt-8 pb-8 pl-1">

              
        <button
          onClick={salvar}
          className="flex-1  bg-green-600 text-white px-4 py-2 rounded font-semibold"
        >
          Salvar
        </button>

          <button
            onClick={() => navigate( "/cards")}
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
