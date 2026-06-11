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
  <div className="min-h-screen bg-slate-100 px-4 py-6">
    <div className="fixed inset-0 bg-black/55" />

    <div className="relative z-10 w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-[22px] shadow-2xl border border-slate-200 overflow-hidden">

        {/* CABEÇALHO */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#08233d]">
              Novo Cartão
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Cadastre um cartão para controle financeiro e faturas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-400 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* CORPO */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-6">

          {/* DADOS DO CARTÃO */}
          <section className="space-y-4">
            <h2 className="text-sm font-black text-[#08233d]">
              Dados do cartão
            </h2>

            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">
                Nome
              </label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Ex: Nubank, Itaú, Bradesco"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Bandeira
                </label>
                <input
                  name="bandeira"
                  value={form.bandeira}
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Visa / Mastercard"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="ativo">Ativo</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">
                Limite Total
              </label>
              <input
                type="number"
                name="limite_total"
                value={form.limite_total}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="0,00"
              />
            </div>
          </section>

          <div className="border-t border-slate-200" />

          {/* FATURA */}
          <section className="space-y-4">
            <h2 className="text-sm font-black text-[#08233d]">
              Dados da fatura
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Dia fechamento
                </label>
                <input
                  type="number"
                  name="fechamento_dia"
                  min="1"
                  max="31"
                  value={form.fechamento_dia}
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Ex: 10"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Dia vencimento
                </label>
                <input
                  type="number"
                  name="vencimento_dia"
                  min="1"
                  max="31"
                  value={form.vencimento_dia}
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Ex: 15"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Validade
                </label>
                <input
                  name="vencimento"
                  value={form.vencimento}
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="MM/AA"
                />
              </div>
            </div>
          </section>

          <div className="border-t border-slate-200" />

          {/* IDENTIFICAÇÃO */}
          <section className="space-y-4">
            <h2 className="text-sm font-black text-[#08233d]">
              Identificação
            </h2>

            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">
                Número / Final do cartão
              </label>
              <input
                name="numero"
                value={form.numero}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Final ou número do cartão"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">
                Nome impresso no cartão
              </label>
              <input
                name="nomecartao"
                value={form.nomecartao}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Nome impresso no cartão"
              />
            </div>
          </section>
        </div>

        {/* RODAPÉ */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-11 px-6 rounded-lg border border-sky-200 bg-sky-50 text-[#08233d] text-sm font-black"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={salvar}
            className="h-11 px-7 rounded-lg bg-[#082f4f] text-white text-sm font-black shadow-md"
          >
            Salvar Cartão
          </button>
        </div>
      </div>
    </div>
  </div>
);
 
 
}
