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
  nomecartao: "" 
})


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
        nomecartao: cartao.nomecartao || ""    // CORRIGIDO
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
          💳 Editar Cartão
        </h1>

        <p className="text-blue-100 text-sm font-semibold mt-2">
          Atualize os dados do cartão de crédito.
        </p>
      </div>

      {/* FORM */}
      <div className="bg-white rounded-b-[28px] shadow-xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className="block text-[#0b1744] font-black mb-1">Nome</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className="w-full  h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block text-[#0b1744] font-black mb-1">Bandeira</label>
          <input
            name="bandeira"
            value={form.bandeira}
            onChange={handleChange}
            className="w-full  h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block text-[#0b1744] font-black mb-1">Limite Total</label>
          <input
            type="number"
            name="limite_total"
            value={form.limite_total}
            onChange={handleChange}
            className="w-full  h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[#0b1744] font-black mb-1">
              Fechamento
            </label>
            <input
              type="number"
              name="fechamento_dia"
              value={form.fechamento_dia}
              onChange={handleChange}
              className="w-full  h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Dia"
            />
          </div>

          <div>
            <label className="block text-[#0b1744] font-black mb-1">
              Venc. dia
            </label>
            <input
              type="number"
              name="vencimento_dia"
              value={form.vencimento_dia}
              onChange={handleChange}
              className="w-full  h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Dia"
            />
          </div>

          <div>
            <label className="block text-[#0b1744] font-black mb-1">
              MM/AA
            </label>
            <input
              name="vencimento"
              value={form.vencimento}
              onChange={handleChange}
              className="w-full  h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="MM/AA"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#0b1744] font-black mb-1">
            Número do Cartão
          </label>
          <input
            name="numero"
            value={form.numero}
            onChange={handleChange}
            className="w-full  h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block text-[#0b1744] font-black mb-1">
            Nome no Cartão
          </label>
          <input
            name="nomecartao"
            value={form.nomecartao}
            onChange={handleChange}
            className="w-full  h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block text-[#0b1744] font-black mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full  h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="ativo">Ativo</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="flex gap-3 pt-5">
          <button
            type="button"
            onClick={salvar}
            className="flex-1  h-12 rounded-full bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white font-black shadow-lg"
          >
            Salvar
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 h-12 rounded-full bg-slate-300 text-slate-700 font-black"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
