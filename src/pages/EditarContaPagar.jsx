import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";

export default function EditarContaPagar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

  const [loading, setLoading] = useState(true);
  const [salvando, setSavando] = useState(false);
  const [fornecedores, setFornecedores] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    vencimento: "",
    categoria_id: "",
    fornecedor_id: "",
    parcelas: 1,
    parcela_num: 1,
    status: "aberto",
    forma_operacao:"FORNECEDOR",
    modelo_codigo:""
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }


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





  //------------------------------------------------------------------
  // CARREGAR FORNECEDORES
  //------------------------------------------------------------------
  async function carregarFornecedores() {
    try {
      const url = buildWebhookUrl("fornecedorcliente", {
        empresa_id,
        tipo: "fornecedor",
      });

      const resp = await fetch(url);
      const texto = await resp.text();
      let json = [];

      try {
        json = JSON.parse(texto);
      } catch {}

      setFornecedores(json);
    } catch (e) {
      console.log("ERRO carregando fornecedores:", e);
    }
  }

  //------------------------------------------------------------------
  // CARREGAR CATEGORIAS
  //------------------------------------------------------------------
  async function carregarCategorias() {
    try {
      const url = buildWebhookUrl("listacategorias", { empresa_id, tipo:'saida' });

      const resp = await fetch(url);
      const texto = await resp.text();
      let json = [];

      try {
        json = JSON.parse(texto);
      } catch {}

      setCategorias(json);
    } catch (e) {
      console.log("ERRO categorias:", e);
    }
  }

  //------------------------------------------------------------------
  // RETRIEVE DA CONTA
  //------------------------------------------------------------------
async function carregar() {
  try {
    const url = buildWebhookUrl("conta_pagar", { empresa_id, id });

    const resp = await fetch(url);
    const texto = await resp.text();

    let json = {};
    try {
      json = JSON.parse(texto);
    } catch {}

    // 🔥 CORREÇÃO DEFINITIVA: webhook pode retornar ARRAY ou OBJETO
    const dado = Array.isArray(json) ? json[0] : json;

    if (!dado || !dado.id) {
      console.log("DEBUG JSON:", json);
      alert("Conta não encontrada.");
      navigate("/contas-pagar");
      return;
    }

    setForm({
      descricao: dado.descricao,
      valor: dado.valor, 
      vencimento: dado.vencimento ? dado.vencimento.substring(0, 10) : "",
      categoria_id: dado.categoria_id || "",
      fornecedor_id: dado.fornecedor_id || "",
      parcelas: dado.parcelas,
      parcela_num: dado.parcela_num,
      status: dado.status,
      doc_ref: dado.doc_ref,
      forma_operacao: dado.forma_operacao,
      modelo_codigo: dado.modelo_codigo,
    });


    
  } catch (e) {
    console.log("ERRO retrieve:", e);
    alert("Erro ao carregar dados.");
  } finally {
    setLoading(false);
  }
}


  //------------------------------------------------------------------
  // SALVAR
  //------------------------------------------------------------------
  async function salvar() {
    try {
      setSavando(true);

      
  const hoje = hojeMaisDias(0);

              // ================== VALIDAÇÕES ==================
          if (!form.descricao.trim()) {
            alert("Descrição é obrigatória.");
            return;
          }

          if (!form.valor || Number(form.valor) <= 0) {
            alert("Informe um valor maior que zero.");
            return;
          }
 

          if (!form.fornecedor_id) {
            alert("Fornecedor é obrigatório.");
            return;
          }

          if (!form.doc_ref.trim()) {
            alert("Documento é obrigatório.");
            return;
          }

          if (!form.parcelas || Number(form.parcelas) < 1) {
            alert("Número de parcelas inválido.");
            return;
          }

          // vencimento já tratado, mas reforçando
          
         // if (form.vencimento <= hoje) {
        //    alert("Vencimento deve ser maior que hoje.");
         //   return;
         // }

      const url = buildWebhookUrl("salvarcontapagar");

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          id: Number(id),
          descricao: form.descricao,
          valor: Number(form.valor),
          vencimento: form.vencimento,
    
          fornecedor_id: Number(form.fornecedor_id) || null,
           forma_pagamento: form.forma_pagamento || null,
          status: form.status ,
          doc_ref: form.doc_ref,
          codigo:form.modelo_codigo,
           classificacao:form.classificacao 
  
        }),
      });

      const texto = await resp.text();
      let json = {};

      try {
        json = JSON.parse(texto);
      } catch {}

      // === SUCESSO GLOBAL (padronizado) ===
      const sucesso =
        json?.id ||
        json?.success === true ||
        (Array.isArray(json) && json.length > 0);

      if (sucesso) {
        alert("Conta atualizada com sucesso!");
        navigate(-1);
        return;
      }

      alert(json?.message || "Erro ao salvar.");
    } catch (e) {
      console.log("ERRO SALVAR", e);
      alert("Erro ao salvar.");
    } finally {
      setSavando(false);
    }
  }

  useEffect(() => {
    carregarFornecedores();
 
    carregar();
  }, []);

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
              Editar Conta a Pagar
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Atualize os dados principais da conta.
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
        <div className="px-6 py-5 space-y-6">

          <section className="space-y-4">
            <h2 className="text-sm font-black text-[#08233d]">
              Dados principais
            </h2>

            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">
                Descrição
              </label>
              <input
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Descrição"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">
                Fornecedor
              </label>
              <select
                name="fornecedor_id"
                value={form.fornecedor_id}
                onChange={handleChange}
                className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="">Selecione</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <div className="border-t border-slate-200" />

          <section className="space-y-4">
            <h2 className="text-sm font-black text-[#08233d]">
              Informações da parcela
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  name="valor"
                  disabled
                  value={form.valor}
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-black text-slate-500 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Vencimento
                </label>
                <input
                  type="date"
                  name="vencimento"
                  disabled
                  min={hojeMaisDias(1)}
                  value={form.vencimento}
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-black text-slate-500 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Parcelas
                </label>
                <input
                  type="number"
                  name="parcelas"
                  disabled
                  value={form.parcelas}
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-black text-slate-500 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  disabled
                  onChange={handleChange}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-black text-slate-500 outline-none cursor-not-allowed"
                >
                  <option value="aberto">Aberto</option>
                  <option value="pago">Pago</option>
                </select>
              </div>
            </div>
          </section>

          <div hidden>
            <input
              name="doc_ref"
              value={form.doc_ref}
              onChange={handleChange}
            />
            <input
              name="modelo_codigo"
              disabled
              value={form.modelo_codigo}
              onChange={handleChange}
            />
          </div>
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
            disabled={salvando}
            className="h-11 px-7 rounded-lg bg-[#082f4f] text-white text-sm font-black shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  </div>
);
  
  //------------------------------------------------------------------
  // LAYOUT
  //------------------------------------------------------------------
 
}
