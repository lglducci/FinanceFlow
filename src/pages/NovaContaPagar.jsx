import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
 import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";



export default function NovaContaPagar() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);
 
 const [form, setForm] = useState({
  descricao: "",
  valor: "",
  vencimento: hojeMaisDias(1), // amanhã (BR)
  categoria_id: "",
  fornecedor_id: "",
  parcelas: 1,
  parcela_num: 1,
  status: "aberto",
  doc_ref: "",
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


  const [fornecedores, setFornecedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [salvando, setSalvando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // =======================================================
  //     CARREGAR FORNECEDORES  (tipo = fornecedor)
  // =======================================================
  async function carregarFornecedores() {
    try {
      const url = buildWebhookUrl("fornecedorcliente", {
        empresa_id,
        tipo: "fornecedor",
      });

      const resp = await fetch(url);
      const txt = await resp.text();

      let lista = [];
      try {
        lista = JSON.parse(txt);
      } catch {}

      setFornecedores(Array.isArray(lista) ? lista : []);
    } catch (e) {
      console.log("ERRO ao carregar fornecedores:", e);
    }
  }

  // =======================================================
  //     CARREGAR CATEGORIAS (já existe webhook em outra janela)
  // =======================================================
  async function carregarCategorias() {
    try {
      const url = buildWebhookUrl("listacategorias", { empresa_id , tipo:'saida'});
      const resp = await fetch(url);
      const txt = await resp.text();

      let lista = [];
      try {
        lista = JSON.parse(txt);
      } catch {}

      setCategorias(Array.isArray(lista) ? lista : []);
    } catch (e) {
      console.log("ERRO ao carregar categorias:", e);
    }
  }

  // =======================================================
  useEffect(() => {
    carregarFornecedores();
    carregarCategorias();
  }, []);

  // =======================================================
  //                  SALVAR NOVA CONTA
  // =======================================================
 async function salvar() {
  try {
    setSalvando(true);

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

if (!form.categoria_id) {
  alert("Categoria é obrigatória.");
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
 
if (form.vencimento <= hoje) {
  alert("Vencimento deve ser maior que hoje.");
  return;
}


    const url = buildWebhookUrl("novacontapagar");
   
   
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        descricao: form.descricao,
        valor: Number(form.valor),
        vencimento: form.vencimento,
        categoria_id: Number(form.categoria_id) || null,
        fornecedor_id: Number(form.fornecedor_id) || null,
        parcelas: Number(form.parcelas),
        parcela_num: Number(form.parcela_num),
        status: form.status,
        doc_ref: form.doc_ref
      })
    });

    const texto = await resp.text();
    let json = {};

    try {
      json = JSON.parse(texto);
    } catch {
      // resposta não era JSON
    }

    // 🚨 ERRO HTTP (400, 500 etc)
    if (!resp.ok) {
      alert(json?.message || texto || "Erro ao salvar conta a pagar.");
      return;
    }

    // ✅ SUCESSO
    alert("Conta a pagar cadastrada com sucesso!");
    navigate("/contas-pagar");

  } catch (e) {
    console.error("ERRO SALVAR:", e);
    alert("Erro de comunicação com o servidor.");
  } finally {
    setSalvando(false);
  }
}


 


  return ( 
         <div className="min-h-screen py-6 px-4 bg-bgSoft"> 
         <div className="w-full max-w-3xl mx-auto rounded-2xl p-6 shadow-xl bg-[#1e40af] text-white">  

        <h1
        className="text-2xl md:text-3xl font-bold mb-6 text-center"
        style={{ color: THEME.title }}
      >
        ✏️ Nova Conta a Pagar
      </h1>

      <div className="bg-gray-100 p-5 rounded-xl shadow flex flex-col gap-4"> 

  
        {/* DESCRIÇÃO 
    <label className="label label-required">Descrição</label>*/}
        <div>
            <div className="w-4/5"> 
          <label   className="label label-required">Descrição</label>
          <input
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            className="input-premium w-64"
            placeholder="descricao"
          />
        </div>
          </div>

          

        {/* CATEGORIA */}
        <div>
            <div className="w-2/3"> 
          <label className="label label-required font-bold text-[#1e40af]">Categoria</label>
          <select
            name="categoria_id"
            value={form.categoria_id}
            onChange={handleChange}
            className="input-premium w-24"
            placeholder="categoria"
          >
            <option value="">Selecione...</option>

            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
         </div>
          
        {/* FORNECEDOR */}
        <div>
          <div className="w-2/3"> 
          <label className=" label label-required font-bold text-[#1e40af]">Fornecedor</label>
          <select
            name="fornecedor_id"
            value={form.fornecedor_id}
            onChange={handleChange}
             className="input-premium w-24"
            placeholder="fornecedor"
          >
            <option value="">Nenhum</option>

            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>
        </div>

 
        {/* VALOR */}
        <div>
           <div className="w-1/2"> 
          <label className="label label-required font-bold text-[#1e40af]">Valor</label>
          <input
            type="number"
            name="valor"
            value={form.valor}
            onChange={handleChange}
            className="input-premium w-64"
            placeholder="00,00"
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
             min={hojeMaisDias(1)}   // 🔒 trava ontem e hoje 
            value={form.vencimento}
            onChange={handleChange}
             className="input-premium w-24"
            placeholder="vencto"
          />
        </div>
         </div>
          
 

         
        {/* PARCELAS */}
        <div>
            
          <div className="w-1/5"> 
          <label className="label label-required font-bold text-[#1e40af]">Parcelas</label>
          <input
            type="number"
            name="parcelas"
            min="1"
            value={form.parcelas}
            onChange={handleChange}
            className="input-premium w-24"
            placeholder="parcelas"
          />
        </div>
         </div>
 

        {/* Numero documento ou nota fiscal  */}
        <div>
          <div className="w-2/3"> 
                  <label className="label label-required font-bold text-[#1e40af]">Documento</label>
                  <input
                  name="doc_ref"
                  value={form.doc_ref}
                  onChange={handleChange}
                  className="input-premium w-64"
                  placeholder="Nro Documento"
                />
            </div> 
         </div> 

        {/* STATUS */}
        <div>
           <div className="w-1/4"> 
          <label className="label label-required font-bold text-[#1e40af]">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input-premium w-24"
            placeholder="status"
          >
            <option value="aberto">Aberto</option>
            <option value="pago">Pago</option>
          </select>
        </div>
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
            onClick={() => navigate("/contas-pagar")}
            className="flex-1 bg-gray-400 text-white px-4 py-3 rounded font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
