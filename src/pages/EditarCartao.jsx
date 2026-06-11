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
  navigate(-1);
} else {
  console.log("DEBUG JSON:", json);
  alert("Erro ao atualizar cartão.");
} 
 
  }

  if (loading) {
    return <div className="p-6">Carregando...</div>;
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
              Editar Cartão
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Atualize os dados do cartão de crédito.
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
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  </div>
);

}
