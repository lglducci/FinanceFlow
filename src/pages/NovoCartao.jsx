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
    nomecartao: "",
    status: "ativo"
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
async function salvar() {
  // 🔎 VALIDAÇÕES
  const {
    nome,
    bandeira,
    limite_total,
    fechamento_dia,
    vencimento_dia,
    vencimento,
    status 
  } = form;

  if (!nome || !nome.trim()) {
    alert("Informe o nome do cartão.");
    return;
  }

  if (!bandeira || !bandeira.trim()) {
    alert("Informe a bandeira do cartão.");
    return;
  }

  const limiteNum = Number(limite_total);
  if (!limite_total || isNaN(limiteNum) || limiteNum <= 0) {
    alert("Informe um limite total válido (> 0).");
    return;
  }

  const fechamentoNum = Number(fechamento_dia);
  if (!fechamento_dia || isNaN(fechamentoNum) || fechamentoNum < 1 || fechamentoNum > 31) {
    alert("Informe um dia de fechamento entre 1 e 31.");
    return;
  }

  const vencimentoNum = Number(vencimento_dia);
  if (!vencimento_dia || isNaN(vencimentoNum) || vencimentoNum < 1 || vencimentoNum > 31) {
    alert("Informe um dia de vencimento entre 1 e 31.");
    return;
  }

  if (!status) {
    alert("Informe o status do cartão.");
    return;
  }

  // vencimento (MM/AA) opcional, mas se preencher, valida formato
  if (vencimento && !/^\d{2}\/\d{2}$/.test(vencimento)) {
    alert("Informe o vencimento no formato MM/AA (ex: 08/29).");
    return;
  }

  const url = buildWebhookUrl("novo_cartao");

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_empresa: empresa_id,
      ...form,
    }),
  });

  const json = await resp.json();

  const ok = Array.isArray(json) && json.length > 0 && json[0].id;

  if (ok) {
    alert("Cartão criado com sucesso!");
    navigate(-1);
  } else {
    console.log("RETORNO INVALIDO:", json);
    alert("Erro ao criar cartão.");
  }
}
return (
  <div className="min-h-screen bg-gradient-to-b from-[#eef5fb] to-[#e8f1fa] px-4 py-5">
    <div className="w-full max-w-lg mx-auto">

      <div className="bg-gradient-to-br from-[#2744b8] to-[#08748f] rounded-t-[28px] shadow-lg px-5 py-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-white/15 text-white px-4 py-2 rounded-full text-sm font-black mb-4"
        >
          ← Voltar
        </button>

        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          💳 Novo Cartão
        </h1>

        <p className="text-blue-100 text-sm font-semibold mt-1">
          Cadastre um cartão para controle financeiro.
        </p>
      </div>

      <div className="bg-white rounded-b-[28px] shadow-xl border border-slate-200 p-4 space-y-4">

        <div className="rounded-3xl bg-slate-50 border border-slate-200 p-4 space-y-3">
          <div className="text-sm font-black text-blue-800">Dados do cartão</div>

          <div>
            <label className="block text-[#0b1744] font-black text-sm mb-1">Nome</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full  h-8 rounded-2xl border border-slate-300 px-3 font-bold text-slate-700"
              placeholder="Ex: Nubank, Itaú, Bradesco"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#0b1744] font-black text-sm mb-1">Bandeira</label>
              <input
                name="bandeira"
                value={form.bandeira}
                onChange={handleChange}
                className="w-full  h-8 rounded-2xl border border-slate-300 px-3 font-bold text-slate-700"
                placeholder="Visa"
              />
            </div>

            <div>
              <label className="block text-[#0b1744] font-black text-sm mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full  h-8 rounded-2xl border border-slate-300 px-3 font-bold text-slate-700"
              >
                <option value="ativo">Ativo</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#0b1744] font-black text-sm mb-1">Limite Total</label>
            <input
              type="number"
              name="limite_total"
              value={form.limite_total}
              onChange={handleChange}
              className="w-full  h-8 rounded-2xl border border-slate-300 px-3 font-bold text-slate-700"
              placeholder="0,00"
            />
          </div>
        </div>

        <div className="rounded-3xl bg-slate-50 border border-slate-200 p-4 space-y-3">
          <div className="text-sm font-black text-blue-800">Datas e vencimento</div>

          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              name="fechamento_dia"
              min="1"
              max="31"
              value={form.fechamento_dia}
              onChange={handleChange}
              className="w-full  h-8 rounded-2xl border border-slate-300 px-3 font-bold text-slate-700"
              placeholder="Fecha"
            />

            <input
              type="number"
              name="vencimento_dia"
              min="1"
              max="31"
              value={form.vencimento_dia}
              onChange={handleChange}
              className="w-full  h-8 rounded-2xl border border-slate-300 px-3 font-bold text-slate-700"
              placeholder="Vence"
            />

            <input
              name="vencimento"
              value={form.vencimento}
              onChange={handleChange}
              className="w-full  h-8 rounded-2xl border border-slate-300 px-3 font-bold text-slate-700"
              placeholder="MM/AA"
            />
          </div>
        </div>

        <div className="rounded-3xl bg-slate-50 border border-slate-200 p-4 space-y-3">
          <div className="text-sm font-black text-blue-800">Identificação - Número e Nome no Cartão</div>

          <input
            name="numero"
            value={form.numero}
            onChange={handleChange}
            className="w-full h-10 rounded-2xl border border-slate-300 px-3 font-bold text-slate-700"
            placeholder="Final ou número do cartão"
          />

          <input
            name="nomecartao"
            value={form.nomecartao}
            onChange={handleChange}
            className="w-full h-10 rounded-2xl border border-slate-300 px-3 font-bold text-slate-700"
            placeholder="Nome impresso no cartão"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={salvar}
            className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white font-black shadow-lg"
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
