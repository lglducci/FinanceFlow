import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function EditarCartao() {
  const navigate = useNavigate();
  const { id } = useParams();
  const empresa_id = localStorage.getItem("empresa_id") || 1;

  const [loading, setLoading] = useState(true);
 const [form, setForm] = useState({
  nome: "",
  bandeira: "",
  limite_total: "",
  fechamento_dia: "",
  vencimento_dia: "",
  status: "ativo",
  vencimento: "",
  numero: "",
  NomeCartão: "" 
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


  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
 async function carregar() {
  setLoading(true);

  try {
    const url = buildWebhookUrl("editarcartao") + `?id=${id}&empresa_id=${empresa_id}`;
    console.log("URL:", url);

    const resp = await fetch(url, { method: "GET" });

    const text = await resp.text();
    console.log("RAW:", text);

    let dados;
    try {
      dados = JSON.parse(text);
    } catch {
      dados = [];
    }

    const cartao = Array.isArray(dados) ? dados[0] : dados;

    if (!cartao) {
      alert("Cartão não encontrado.");
      navigate("/cards");
      return;
    }

      setForm({
        nome: cartao.nome || "",
        bandeira: cartao.bandeira || "",
        limite_total: cartao.limite_total || "",
        fechamento_dia: cartao.fechamento_dia || "",
        vencimento_dia: cartao.vencimento_dia || "",
        status: cartao.status || "ativo",

        vencimento: cartao.Vencimento || "",   // CORRIGIDO
        numero: cartao.numero || "",
        NomeCartao: cartao.NomeCartão || ""    // CORRIGIDO
      });



  } catch (e) {
    console.log("ERRO FETCH:", e);
    alert("Erro ao carregar cartão.");
  }

  setLoading(false);
}
 
// 👉 COLOQUE AQUI
useEffect(() => {
  carregar();
}, []);
 

  // =========================
  // SALVAR ALTERAÇÕES
  // =========================
  async function salvar() {
    const url = buildWebhookUrl("salvacartao");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: Number(id),
        empresa_id: Number(empresa_id),
        ...form
      })
    });

    const json = await resp.json();

  // sucesso = webhook retornou um array com objeto OU success === true
const sucesso =
  (Array.isArray(json) && json.length > 0) ||
  json?.success === true;

if (sucesso) {
  alert("Cartão atualizado com sucesso!");
  navigate("/cards");
} else {
  console.log("DEBUG JSON:", json);
  alert("Erro ao atualizar cartão.");
} 
 
  }

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

 return (
     
    <div className="min-h-screen py-6 px-4 bg-bgSoft"> 
      <div className="w-full max-w-3xl mx-auto rounded-2xl p-6 shadow-xl bg-[#1e40af] text-white">  
     
       <h1
        className="text-2xl md:text-3xl font-bold mb-6 text-center"
        style={{ color: THEME.title }}
      >
        ✏️ Editar Cartão
      </h1>

      <div className="bg-gray-100 p-5 rounded-xl shadow flex flex-col gap-4">

        <div>
          <label className="font-bold text-[#1e40af]">Nome</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
              className="input-premium"
          />
        </div>

        <div>
          <label className="font-bold text-[#1e40af]">Bandeira</label>
          <input
            name="bandeira"
            value={form.bandeira}
            onChange={handleChange}
             className="input-premium"
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
            />
          </div>

          <div className="w-1/3">
            <label className="font-bold text-[#1e40af]">vencimento dia</label>
            <input
              type="number"
              name="vencimento_dia"
              value={form.vencimento_dia}
              onChange={handleChange}
               className="input-premium"
            />
          </div>

          <div className="w-1/3">
            <label className="font-bold text-[#1e40af]">Vencimento (MM/AA)</label>
            <input
              name="vencimento"
              value={form.vencimento}
              onChange={handleChange}
              className="input-premium"
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
          />
        </div>

        <div>
          <label className="font-bold text-[#1e40af]">Nome no Cartão</label>
          <input
            name="NomeCartao"
            value={form.NomeCartao}
            onChange={handleChange}
            className="input-premium"
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
            <div className="flex gap-6 pt-8 pb-8 pl-1">
          <button
            onClick={salvar}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded font-semibold"
          >
            Salvar
          </button>

          <button
            onClick={() => navigate("/cards")}
            className="flex-1 bg-gray-400 text-white px-4 py-3 rounded font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
