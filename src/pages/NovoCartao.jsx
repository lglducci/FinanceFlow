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
    navigate("/cards");
  } else {
    console.log("RETORNO INVALIDO:", json);
    alert("Erro ao criar cartão.");
  }
}

 return (
  <div className="min-h-screen bg-gradient-to-br from-slate-150 via-blue-150 to-slate-100 px-3 py-4 flex items-start justify-center">
    <div className="w-full max-w-md rounded-[30px] bg-white/95 shadow-2xl border border-white/40 overflow-hidden">

      {/* TOPO */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 px-5 py-5 text-white">
        <button
          onClick={() => navigate("/app/configuracoes")}
          className="mb-3 rounded-full bg-white/15 px-4 py-2 text-sm font-bold hover:bg-white/25"
        >
          ← Voltar
        </button>

        <h1 className="text-2xl font-black">💳 Novo Cartão</h1>
        <p className="text-sm text-blue-100 mt-1">
          Cadastre um cartão para controle financeiro.
        </p>
      </div>

      {/* FORM */}
      <div className="p-5 space-y-3">

        <div>
          <label className="text-xs font-black text-slate-700">Nome</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className="w-full mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Nubank, Itaú, Bradesco"
          />
        </div>

        <div>
          <label className="text-xs font-black text-slate-700">Bandeira</label>
          <input
            name="bandeira"
            value={form.bandeira}
            onChange={handleChange}
            className="w-full mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Visa, Mastercard, Elo..."
          />
        </div>

        <div>
          <label className="text-xs font-black text-slate-700">Limite Total</label>
          <input
            type="number"
            name="limite_total"
            value={form.limite_total}
            onChange={handleChange}
            className="w-full mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0,00"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-black text-slate-700">Fechamento</label>
            <input
              type="number"
              name="fechamento_dia"
              min="1"
              max="31"
              value={form.fechamento_dia}
              onChange={handleChange}
              className="w-full mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dia"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700">Vencimento</label>
            <input
              type="number"
              name="vencimento_dia"
              min="1"
              max="31"
              value={form.vencimento_dia}
              onChange={handleChange}
              className="w-full mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dia"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700">Validade</label>
            <input
              name="vencimento"
              value={form.vencimento}
              onChange={handleChange}
              className="w-full mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="MM/AA"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-black text-slate-700">Número do Cartão</label>
          <input
            name="numero"
            value={form.numero}
            onChange={handleChange}
            className="w-full mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Final ou número do cartão"
          />
        </div>

        <div>
          <label className="text-xs font-black text-slate-700">Nome no Cartão</label>
          <input
            name="nomecartao"
            value={form.nomecartao}
            onChange={handleChange}
            className="w-full mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome impresso no cartão"
          />
        </div>

        <div>
          <label className="text-xs font-black text-slate-700">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ativo">Ativo</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* BOTÕES */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            onClick={salvar}
            className="rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-600 text-white px-4 py-3 font-black shadow-lg active:scale-95"
          >
            Salvar
          </button>

          <button
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
