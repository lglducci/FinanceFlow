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


  
  //------------------------------------------------------------------
  // LAYOUT
  //------------------------------------------------------------------
 return (
  <div className="min-h-screen bg-[#f3f7fb] px-4 py-6">
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
      
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] px-6 py-5">
        <h1 className="text-2xl font-black text-white">
          ✏️ Editar Conta a Pagar
        </h1>
        <p className="text-sm font-semibold text-blue-100 mt-1">
          Atualize os dados principais da conta
        </p>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <label className="text-sm font-bold text-slate-700">Descrição</label>
          <input
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-800 outline-none focus:border-blue-600"
            placeholder="Descrição"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">Fornecedor</label>
          <select
            name="fornecedor_id"
            value={form.fornecedor_id}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-800 outline-none focus:border-blue-600"
          >
            <option value="">Selecione</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-slate-700">Valor</label>
            <input
              type="number"
              name="valor"
              disabled
              value={form.valor}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 font-bold text-slate-500"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">Vencimento</label>
            <input
              type="date"
              name="vencimento"
              disabled
              min={hojeMaisDias(1)}
              value={form.vencimento}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 font-bold text-slate-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-slate-700">Parcelas</label>
            <input
              type="number"
              name="parcelas"
              disabled
              value={form.parcelas}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 font-bold text-slate-500"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">Status</label>
            <select
              name="status"
              value={form.status}
              disabled
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 font-bold text-slate-500"
            >
              <option value="aberto">Aberto</option>
              <option value="pago">Pago</option>
            </select>
          </div>
        </div>

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

        <div className="flex justify-end gap-3 pt-5 border-t border-slate-200">
          <button
            onClick={() => navigate(-1)}
               className="btn-pill btn-white"
          >
            Cancelar
          </button>

          <button
            onClick={salvar}
            disabled={salvando}
             className="btn-pill btn-blue"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
