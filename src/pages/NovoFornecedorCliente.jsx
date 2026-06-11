import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import FormCategoria from "../components/forms/FormCategoria";
 


export default function NovoFornecedorCliente() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);
  const [modalCategoria, setModalCategoria] = useState(false);
   const [categorias, setCategorias] = useState([])

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
        navigate(-1);
        return;
      }

      alert(json?.message || "Erro ao salvar.");
    } catch (e) {
      console.log("ERRO SALVAR:", e);
      alert("Erro ao salvar registro.");
    }
  }

  
function maskTelefone(value) {
  let v = value.replace(/\D/g, "");

  // força +55
  if (!v.startsWith("55")) {
    v = "55" + v;
  }

  // limita tamanho (55 + DDD + 9 dígitos)
  v = v.substring(0, 13);

  v = v.replace(/^(\d{2})(\d)/, "+$1 $2");                 // +55
  v = v.replace(/^(\+\d{2})\s(\d{2})(\d)/, "$1 ($2) $3");  // (DD)
  v = v.replace(/(\d{5})(\d{4})$/, "$1-$2");               // 99999-9999

  return v;
}
 return (
  <div className="min-h-screen bg-slate-100 px-4 py-6">
    <div className="fixed inset-0 bg-black/55" />

    <div className="relative z-10 w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-[22px] shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* CABEÇALHO */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#08233d]">
              Adicionar Pessoa / Parceiro
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Cadastre fornecedor, cliente ou ambos.
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
        <div className="max-h-[68vh] overflow-y-auto px-6 py-5 space-y-6">

          {/* DADOS PRINCIPAIS */}
          <section className="space-y-4">
            <h2 className="text-sm font-black text-[#08233d]">
              Dados principais
            </h2>

            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">
                Nome *
              </label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Ex: João Silva"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">
                Tipo
              </label>
              <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-700">
                {["fornecedor", "cliente", "ambos"].map((tipo) => (
                  <label key={tipo} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tipo"
                      value={tipo}
                      checked={form.tipo === tipo}
                      onChange={handleChange}
                    />
                    {tipo === "fornecedor"
                      ? "Fornecedor"
                      : tipo === "cliente"
                      ? "Cliente"
                      : "Ambos"}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  CPF / CNPJ *
                </label>
                <input
                  name="cpf_cnpj"
                  value={form.cpf_cnpj}
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Ex: 000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  RG / IE
                </label>
                <input
                  name="rg_ie"
                  value={form.rg_ie}
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="RG / Inscrição Estadual"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Telefone *
                </label>
                <input
                  name="telefone"
                  value={form.telefone}
                  onChange={(e) =>
                    setForm({ ...form, telefone: maskTelefone(e.target.value) })
                  }
                  className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Ex: (11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  WhatsApp *
                </label>
                <input
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={(e) =>
                    setForm({ ...form, whatsapp: maskTelefone(e.target.value) })
                  }
                  className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Ex: (11) 99999-9999"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Ex: joao@email.com"
                />
              </div>
            </div>
          </section>

          <div className="border-t border-slate-200" />

          {/* ENDEREÇO */}
          <section className="space-y-4">
            <h2 className="text-sm font-black text-[#08233d]">
              Endereço
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <input
                name="cep"
                value={form.cep}
                onChange={handleChange}
                className="sm:col-span-3 h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700"
                placeholder="CEP"
              />

              <input
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                className="sm:col-span-9 h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700"
                placeholder="Rua / Endereço"
              />

              <input
                name="bairro"
                value={form.bairro}
                onChange={handleChange}
                className="sm:col-span-4 h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700"
                placeholder="Bairro"
              />

              <input
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
                className="sm:col-span-5 h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700"
                placeholder="Cidade"
              />

              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="sm:col-span-3 h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-bold text-slate-700"
              >
                <option value="">Estado</option>
                {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </section>

          <div className="border-t border-slate-200" />

          {/* OBS */}
          <section className="space-y-3">
            <h2 className="text-sm font-black text-[#08233d]">
              Observações
            </h2>

            <textarea
              name="obs"
              value={form.obs}
              onChange={handleChange}
              className="w-full min-h-[90px] rounded-lg border border-sky-200 bg-sky-50 px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Observações internas"
            />
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

      <FormCategoria
        open={modalCategoria}
        onClose={() => setModalCategoria(false)}
        empresa_id={empresa_id}
        tipo={form.tipo}
        onCategoriaCriada={(nova) => {
          setCategorias((prev) => [nova, ...prev]);
          setForm((prev) => ({
            ...prev,
            categoria_id: nova.id,
          }));
        }}
      />
    </div>
  </div>
);
}
