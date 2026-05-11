 import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function EditarFornecedorCliente() {
  const navigate = useNavigate();
  const { id } = useParams();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    tipo: "fornecedor",
    nome: "",
    cpf_cnpj: "",
    rg_ie: "",
    telefone: "",
    whatsapp: "",
    email: "",
    endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    obs: "",
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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // ========================
  // CARREGAR DADOS
  // ========================
  async function carregar() {
    try {
      const url = buildWebhookUrl("editfornecedorcliente", {
        id: Number(id),
        empresa_id,
      });

      const resp = await fetch(url, { method: "GET" });

      const texto = await resp.text();
      let json = [];

      try {
        json = JSON.parse(texto);
      } catch (e) {
        console.log("JSON inválido:", texto);
        json = [];
      }

      const dado = Array.isArray(json) ? json[0] : json;

      if (!dado || !dado.id) {
        alert("Registro não encontrado.");
        navigate(-1);
        return;
      }

      setForm({
        tipo: dado.tipo || "",
        nome: dado.nome || "",
        cpf_cnpj: dado.cpf_cnpj || "",
        rg_ie: dado.rg_ie || "",
        telefone: dado.telefone || "",
        whatsapp: dado.whatsapp || "",
        email: dado.email || "",
        endereco: dado.endereco || "",
        bairro: dado.bairro || "",
        cidade: dado.cidade || "",
        estado: dado.estado || "",
        cep: dado.cep || "",
        obs: dado.obs || "",
      });
    } catch (e) {
      console.log("ERRO:", e);
      alert("Erro ao carregar dados.");
    }

    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  // ========================
  // SALVAR DADOS
  // ========================
  async function salvar() {
    try {
      const url = buildWebhookUrl("salvafornecedor");

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(id),
          empresa_id,
          ...form,
        }),
      });

       const json = await resp.json();

    // ======== REGRA DE SUCESSO — IGUAL DO CARTÃO ========
    const sucesso =
      (Array.isArray(json) && json.length > 0) ||
      json?.success === true ||
      json?.id > 0; // ← muitos webhooks retornam o registro direto

    if (sucesso) {
      alert("Registro atualizado com sucesso!");
      navigate(-1);
      return;
    }

    console.log("DEBUG JSON:", json);
    alert(json?.message || "Erro ao salvar.");

  } catch (e) {
    console.log("ERRO SALVAR:", e);
    alert("Erro ao salvar registro.");
  }
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
          👥 Editar Fornecedor
        </h1>

        <p className="text-blue-100 text-sm font-semibold mt-2">
          Atualize os dados do fornecedor, cliente ou ambos.
        </p>
      </div>

      {/* FORM */}
      <div className="bg-white rounded-b-[28px] shadow-xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className="block text-[#0b1744] font-black mb-1">Tipo</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="w-full   h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="fornecedor">Fornecedor/Cliente</option>
            <option value="cliente">Cliente</option>
            <option value="ambos">Ambos</option>
          </select>
        </div>

        <div>
          <label className="block text-[#0b1744] font-black mb-1">Nome</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className="w-full   h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="nome"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#0b1744] font-black mb-1">CPF/CNPJ</label>
            <input
              name="cpf_cnpj"
              value={form.cpf_cnpj}
              onChange={handleChange}
              className="w-full   h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="CPF/CNPJ"
            />
          </div>

          <div>
            <label className="block text-[#0b1744] font-black mb-1">RG / IE</label>
            <input
              name="rg_ie"
              value={form.rg_ie}
              onChange={handleChange}
              className="w-full   h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="RG / IE"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#0b1744] font-black mb-1">Telefone</label>
            <input
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              className="w-full   h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Telefone"
            />
          </div>

          <div>
            <label className="block text-[#0b1744] font-black mb-1">WhatsApp</label>
            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              className="w-full   h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="whatsapp"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#0b1744] font-black mb-1">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full   h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="email"
          />
        </div>

        <div>
          <label className="block text-[#0b1744] font-black mb-1">Endereço</label>
          <input
            name="endereco"
            value={form.endereco}
            onChange={handleChange}
            className="w-full   h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="endereço"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#0b1744] font-black mb-1">Bairro</label>
            <input
              name="bairro"
              value={form.bairro}
              onChange={handleChange}
              className="w-full   h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="bairro"
            />
          </div>

          <div>
            <label className="block text-[#0b1744] font-black mb-1">Cidade</label>
            <input
              name="cidade"
              value={form.cidade}
              onChange={handleChange}
              className="w-full   h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="cidade"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[#0b1744] font-black mb-1">Estado</label>
             <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full h-8 rounded-2xl border border-slate-300 px-3 font-bold text-slate-700 uppercase"
              >
                <option value="">UF</option>
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP">SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
              </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[#0b1744] font-black mb-1">CEP</label>
            <input
              name="cep"
              value={form.cep}
              onChange={handleChange}
              className="w-full   h-8 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="cep"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#0b1744] font-black mb-1">Observações</label>
          <textarea
            name="obs"
            value={form.obs}
            onChange={handleChange}
            className="w-full min-h-[90px] rounded-2xl border border-slate-300 px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="observações"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={salvar}
            className="flex-1  h-10 rounded-full bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white font-black shadow-lg"
          >
            Salvar
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 h-10 rounded-full bg-slate-300 text-slate-700 font-black"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
);
  
}
