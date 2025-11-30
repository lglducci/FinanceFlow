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
        navigate("/providers-clients");
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
      navigate("/providers-clients");
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
     
 

    


    <div className="min-h-screen py-6 px-4 bg-bgSoft"> 
      <div className="w-full max-w-3xl mx-auto rounded-2xl p-6 shadow-xl bg-[#1e40af] text-white">  

        <h1
        className="text-2xl md:text-3xl font-bold mb-6 text-center"
        style={{ color: THEME.title }}
      >
        ✏️ Editar Fornecedor / Cliente
      </h1>

      <div className="bg-white p-5 rounded-xl shadow flex flex-col gap-4">
  

        <div>
          <label className="font-bold text-[#1e40af]">Tipo</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="input-premium"
            placeholder="tipo"
          >
            <option value="fornecedor">Fornecedor</option>
            <option value="cliente">Cliente</option>
            <option value="ambos">Ambos</option>
          </select>
        </div>

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

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="font-bold text-[#1e40af]">CPF/CNPJ</label>
            <input
              name="cpf_cnpj"
              value={form.cpf_cnpj}
              onChange={handleChange}
              className="input-premium"
              placeholder="CPF/CNPJ"
            />
          </div>

          <div className="w-1/2">
            <label className="font-bold text-[#1e40af]">RG / IE</label>
            <input
              name="rg_ie"
              value={form.rg_ie}
              onChange={handleChange}
              className="input-premium"
              placeholder="RG / IE"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="font-bold text-[#1e40af]">Telefone</label>
            <input
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
               className="input-premium"
              placeholder="Telefone"
            />
          </div>

          <div className="w-1/2">
            <label className="font-bold text-[#1e40af]">WhatsApp</label>
            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
               className="input-premium"
              placeholder="whatsapp"
            />
          </div>
        </div>

        <div>
          <label className="ffont-bold text-[#1e40af]">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
             className="input-premium"
              placeholder="email"
          />
        </div>

        <div>
          <label className="font-bold text-[#1e40af]">Endereço</label>
          <input
            name="endereco"
            value={form.endereco}
            onChange={handleChange}
             className="input-premium"
              placeholder="endereço"
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="font-bold text-[#1e40af]">Bairro</label>
            <input
              name="bairro"
              value={form.bairro}
              onChange={handleChange}
               className="input-premium"
              placeholder="bairro"
            />
          </div>

          <div className="w-1/2">
            <label className="font-bold text-[#1e40af]">Cidade</label>
            <input
              name="cidade"
              value={form.cidade}
              onChange={handleChange}
              className="input-premium"
              placeholder="cidade"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-1/3">
            <label className="font-bold text-[#1e40af]">Estado</label>
            <input
              name="estado"
              value={form.estado}
              maxLength={2}
              onChange={handleChange}
              className="input-premium"
              placeholder="estado"
            />
          </div>

          <div className="w-2/3">
            <label className="font-bold text-[#1e40af]">CEP</label>
            <input
              name="cep"
              value={form.cep}
              onChange={handleChange}
               className="input-premium"
              placeholder="cep"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-[#1e40af]">Observações</label>
          <textarea
            name="obs"
            value={form.obs}
            onChange={handleChange}
             className="input-premium"
              placeholder="observações"
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={salvar}
            className="bg-blue-600 text-white px-5 py-2 rounded font-semibold"
          >
            Salvar
          </button>

          <button
            onClick={() => navigate("/fornecedorcliente")}
            className="bg-gray-400 text-white px-5 py-2 rounded font-semibold"
          >
            Cancelar
          </button>
        </div>
          </div>
      </div>
    </div>
  );
}
