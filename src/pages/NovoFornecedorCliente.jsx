import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function NovoFornecedorCliente() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);


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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // ========================
  // SALVAR NOVO REGISTRO
  // ========================
  async function salvar() {
    try {

          // ================== VALIDAÇÕES ==================
        if (!form.cpf_cnpj.trim()) {
          alert("CPF ou CNPJ é obrigatório.");
          return;
        }

        if (!form.nome.trim()) {
          alert("Nome da Empresa é obrigatório.");
          return;
        }

        if (!form.telefone) {
          alert("Telefone é obrigatório.");
          return;
        }

        if (!form.whatsapp) {
          alert(" Whatsapp é obrigatório.");
          return;
        }

 

        
      const url = buildWebhookUrl("inserefornecedorcliente");

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: 0,
          empresa_id,
          ...form,
        }),
      });

      const json = await resp.json();

      const sucesso =
        (Array.isArray(json) && json.length > 0) ||
        json?.success === true ||
        (json && json.id > 0);

      if (sucesso) {
        alert("Registro criado com sucesso!");
        navigate("/providers-clients");
        return;
      }

      alert(json?.message || "Erro ao salvar.");
    } catch (e) {
      console.log("ERRO SALVAR:", e);
      alert("Erro ao salvar registro.");
    }
  }

  return (
        <div className="min-h-screen py-6 px-4 bg-bgSoft"> 
       
       <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#061f4aff] text-white mt-1 mb-1" >

        <h1
          className="text-2xl md:text-2xl font-bold p-2 mb-3 text-center"
        style={{ color: THEME.title }}
      >
        ✏️ Novo Fornecedor / Cliente
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
          <label className="label label-required font-bold text-[#1e40af]">Nome</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className="input-premium"
              placeholder="nome"
          />
        </div>

        <div>
          <label className="label label-required font-bold text-[#1e40af]">CPF / CNPJ</label>
          <input
            name="cpf_cnpj"
            value={form.cpf_cnpj}
            onChange={handleChange}
            className="input-premium"
            placeholder="CPF / CNPJ"
          />
        </div>

        <div>
          <label className="font-bold text-[#1e40af]">RG / Inscrição Estadual</label>
          <input
            name="rg_ie"
            value={form.rg_ie}
            onChange={handleChange}
            className="input-premium"
            placeholder="RG / Inscrição Estadual"
         />
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="label label-required font-bold text-[#1e40af]">Telefone</label>
            <input
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              className="input-premium"
              placeholder="Telefone"
            />
          </div>

          <div className="w-1/2">
            <label className="label label-required font-bold text-[#1e40af]">WhatsApp</label>
            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              className="input-premium"
              placeholder="whatsApp"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-[#1e40af]">Email</label>
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
          <div className="w-1/3">
            <label className="font-bold text-[#1e40af]">Bairro</label>
            <input
              name="bairro"
              value={form.bairro}
              onChange={handleChange}
              className="input-premium"
              placeholder="bairro"
            />
          </div>

          <div className="w-1/3">
            <label className="font-bold text-[#1e40af]">Cidade</label>
            <input
              name="cidade"
              value={form.cidade}
              onChange={handleChange}
              className="input-premium"
              placeholder="cidade"
            />
          </div>

          <div className="w-1/3">
            <label className="font-bold text-[#1e40af]">Estado</label>
            <input
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className="input-premium"
               placeholder="estado"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-[#1e40af]">CEP</label>
          <input
            name="cep"
            value={form.cep}
            onChange={handleChange}
            className="input-premium"
            placeholder="14540-000"
          />
        </div>

        <div>
          <label className="font-bold text-[#1e40af]">Observações</label>
          <textarea
            name="obs"
            value={form.obs}
            onChange={handleChange}
            className="input-premium"
            placeholder="observações"
            rows={3}
          />
        </div> 
         

         <div className="flex gap-6 pt-8 pb-8 pl-1">
          <button
            onClick={salvar}
            className="flex-1 bg-[#061f4aff] text-white px-5 py-2 rounded font-semibold"
          >
            Salvar
          </button>
         
           <button
           
            onClick={() => navigate("/providers-clients")}
            className="flex-1 bg-gray-500 text-white px-5 py-2 rounded font-semibold"
          >
            Cancelar
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
