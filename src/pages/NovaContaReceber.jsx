import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal, dataLocal } from "../utils/dataLocal";


export default function NovaContaReceber() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    vencimento: hojeLocal(),
    categoria_id: "",
    fornecedor_id: "",
    parcelas: 1,
    parcela_num: 1,
    status: "aberto",
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
        tipo: "cliente",
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
      const url = buildWebhookUrl("listacategorias", { empresa_id , tipo:'entrada'});
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

    const url = buildWebhookUrl("novacontareceber");

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
        status: form.status
      })
    });

    // 👇 AQUI É A CURA DO PROBLEMA
    const json = await resp.json().catch(() => ({}));

    const sucesso =
      (Array.isArray(json) && json.length > 0) ||
      json?.id ||
      json?.success === true;

    if (sucesso) {
      alert("Conta a Receber cadastrada com sucesso!");
      navigate("/contas-receber");
      return;
    }

    alert(json?.message || "Erro ao salvar.");
  } catch (e) {
    console.log("ERRO SALVAR:", e);
    alert("Erro ao salvar.");
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
        ✏️ Nova Conta a Receber
      </h1>

      <div className="bg-white p-5 rounded-xl shadow flex flex-col gap-4"> 

 

        {/* DESCRIÇÃO */}
        <div>
            <div className="w-4/5"> 
          <label className="font-bold text-[#1e40af]">Descrição</label>
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
          <label className="font-bold text-[#1e40af]">Categoria</label>
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
          <label className="font-bold text-[#1e40af]">Fornecedor/Cliente</label>
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
          <label className="font-bold text-[#1e40af]">Valor</label>
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
          <label className="font-bold text-[#1e40af]">Vencimento</label>
          <input
            type="date"
            name="vencimento"
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
          <label className="font-bold text-[#1e40af]">Parcelas</label>
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
 

        {/* PARCELA ATUAL  
        <div>
          <label className="font-semibold text-sm">Número da Parcela</label>
          <input
            type="number"
            name="parcela_num"
            min="1"
            value={form.parcela_num}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>*/}

        {/* STATUS */}
        <div>
           <div className="w-1/4"> 
          <label className="font-bold text-[#1e40af]">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input-premium w-24"
            placeholder="status"
          >
            <option value="aberto">Aberto</option>
            <option value="recebido">Recebido</option>
          </select>
        </div>
        </div>
         

        {/* BOTÕES */}
            <div className="flex gap-6 pt-8 pb-8 pl-1">
          <button
            onClick={salvar}
            disabled={salvando}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded font-semibold"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>

          <button
            onClick={() => navigate("/contas-receber")}
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
