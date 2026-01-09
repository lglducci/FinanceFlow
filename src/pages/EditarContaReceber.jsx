import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function EditarContaReceber() {
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
    status: "aberta",
    doc_ref:""
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
        tipo: "cliente",
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
      const url = buildWebhookUrl("listacategorias", { empresa_id, tipo:'entrada' });

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
    const url = buildWebhookUrl("conta_receber", { empresa_id, id });

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
      navigate("/contas-receber");
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

      const url = buildWebhookUrl("salvarcontareceber");

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          id: Number(id),
          descricao: form.descricao,
          valor: Number(form.valor),
          vencimento: form.vencimento,
          categoria_id: Number(form.categoria_id) || null,
          fornecedor_id: Number(form.fornecedor_id) || null,
          status: form.status ,
           doc_ref: form.doc_ref
          
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
        navigate("/contas-receber");
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
    carregarCategorias();
    carregar();
  }, []);

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  //------------------------------------------------------------------
  // LAYOUT
  //------------------------------------------------------------------
  return (
 
     <div className="min-h-screen py-6 px-4 bg-bgSoft">
        <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#1e40af]   mt-1 mb-1" >
    
        <h1
        className="text-2xl md:text-3xl font-bold mb-6 text-center"
        style={{ color: THEME.title }}
      >
        ✏️ Editar Conta a Receber
      </h1>

      <div className="bg-white p-5 rounded-xl shadow flex flex-col gap-4"> 

 

        {/* DESCRIÇÃO */}
        <div>
          <label  className="label label-required font-bold text-[#1e40af]" >Descrição</label>
          <input
            name="descricao"
          
            value={form.descricao}
            onChange={handleChange}
            className="input-premium"
            placeholder="descricao "

          />
        </div> 
        
        {/* CATEGORIA */}
        <div>
          <div className="w-2/3"> 
          <label className="label label-required font-bold text-[#1e40af]">Categoria</label>
          <select
            name="categoria_id"
            value={form.categoria_id}
            onChange={handleChange}
             className="input-premium"
            placeholder="categoria"
          >
            <option value="">Selecione</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
         </div>
        {/* FORNECEDOR */}
        <div>
            <div className="w-2/3"> 
          <label  className="label label-required font-bold text-[#1e40af]">Fornecedor</label>
          <select
            name="fornecedor_id"
            value={form.fornecedor_id}
            onChange={handleChange}
             className="input-premium"
            placeholder="fornecedor"
          >
            <option value="">Selecione</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </div>
            </div>

         {/* VALOR */}
        <div>
              <div className="w-1/3"> 
          <label  className="label label-required font-bold text-[#1e40af]" >Valor</label>
          <input
            type="number"
            name="valor" 
            value={form.valor}
            onChange={handleChange}
            className="input-premium"
            placeholder="valor"
          />
        </div>
          </div>

        {/* VENCIMENTO */}
        <div>
            <div className="w-1/3"> 
          <label className="label label-required font-bold text-[#1e40af]">Vencimento</label>
          <input
            type="date"
            name="vencimento"  
            value={form.vencimento}
            onChange={handleChange}
            className="input-premium"
            placeholder="vencimento"
          />
        </div>
            </div>

        {/* STATUS */}
        <div>
            <div className="w-1/3"> 
          <label  className="label label-required font-bold text-[#1e40af]" >Status</label>
          <select
            name="status" 
            value={form.status}
            onChange={handleChange}
            className="input-premium"
            readOnly
            disabled
            placeholder="status"
          >
            <option value="aberto">Aberto</option>
            <option value="recebido">Recebido</option>
          </select>
        </div>
        </div>


        {/* documento */}
        <div>
          <label className="label label-required font-bold text-[#1e40af]">Documento</label>
          <input
            name="doc_ref"
          
            value={form.doc_ref}
            onChange={handleChange}
            className="input-premium"
            placeholder="Nro Documento "

          />
        </div> 
     


        {/* BOTÕES */}
             <div className="flex gap-6 pt-8 pb-8 pl-1">
          <button
            onClick={salvar}
            disabled={salvando}
            className="flex-1  bg-blue-600 text-white px-4 py-3 rounded font-semibold"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>

          <button
            onClick={() => navigate("/contas-receber")}
            className="flex-1  bg-gray-400 text-white px-4 py-3 rounded font-semibold"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
     </div>
  );
}
