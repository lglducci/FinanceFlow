import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";


export default function EditarLancamento() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const id = state?.id_lancamento;
  const id_empresa = state?.empresa_id;

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
 const [modelos, setModelos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [contas, setContas] = useState([]);
  
  const [form, setForm] = useState({
    id: "",
    empresa_id: "",
    descricao: "",
    categoria_id: "",
    conta_id: "",
    valor: "",
    data_movimento: "",
    tipo: "",
    origem: "",
    classificacao:"",
     modelo_codigo: "" , 
     forma_pagamento:"aprazo"
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

  // 🔵 CARREGAR DADOS DO LANÇAMENTO
  useEffect(() => {
    if (!id || !id_empresa) {
      alert("Dados inválidos para edição.");
      navigate("/transactions");
      return;
    }

     const carregar = async () => {
  try {
    const url = buildWebhookUrl("editlancto", {
      id_empresa: id_empresa,
      id: id,
    });

    const dados = (await fetch(url).then(r => r.json()))[0];

    setForm({
      id: dados.id,
      empresa_id: id_empresa,
      descricao: dados.descricao || "",
      categoria_id: dados.categoria_id || "",
      conta_id: dados.conta_id || "",
      valor: dados.valor || "",
      data_movimento: dados.data_movimento?.substring(0, 10) || "",
      tipo: dados.tipo || "",
      origem: dados.origem || "",
      classificacao: dados.classificacao || "",
      modelo_codigo: dados.evento_codigo || ""
    });

     await carregarCategorias();
      await carregarContas();
      await carregarModelos();

  } catch (e) {
    console.error(e);
    alert("Erro ao carregar dados do lançamento.");
    navigate("/transactions");  
  }

  setCarregando(false);
}; 
    carregar();

  }, []);

  // 🔵 Carregar contas
const carregarContas = async () => {
  try {
    const url = buildWebhookUrl("listacontas", { empresa_id: id_empresa });
    const resp = await fetch(url);
    const data = await resp.json();
    setContas(data);
  } catch (e) {
    console.error("Erro contas", e);
  }
};

  // 🔵 Carregar categorias
  const carregarCategorias = async () => {
    try {
      const url = buildWebhookUrl("listacategorias", { empresa_id: id_empresa, tipo :form.tipo  });
      const resp = await fetch(url);
      const data = await resp.json();
      setCategorias(data);
    } catch (e) {
      console.error("Erro categorias", e);
    }
  };

 


  useEffect(() => {
  carregarCategorias();
}, [form.tipo]);   // <-- AGORA FUNCIONA NA TROCA DE TIPO

useEffect(() => {
  carregarContas();
}, []);

 function onChange(e) {
  const { name, value } = e.target;

  // se mudou a classificação, limpa o modelo
  if (name === "classificacao") {
    setForm((ant) => ({
      ...ant,
      classificacao: value,
      modelo_codigo: ""   // limpa modelo antigo
    }));

    carregarModelos(value);
    return;
  }

  setForm((ant) => ({
    ...ant,
    [name]: value
  }));
}
 

// 🔵 SALVAR ALTERAÇÕES
const salvar = async () => {
  // ---- VALIDAÇÕES ----
  const valorNum = Number(form.valor);

  if (!form.categoria_id) {
    alert("Selecione uma categoria.");
    return;
  }

  if (!form.conta_id) {
    alert("Selecione uma conta.");
    return;
  }

  if (!form.valor || isNaN(valorNum) || valorNum <= 0) {
    alert("Informe um valor válido.");
    return;
  }

  if (!form.descricao || !form.descricao.trim()) {
    alert("Informe uma descrição.");
    return;
  }

  if (!form.tipo) {
    alert("Selecione o tipo (entrada ou saída).");
    return;
  }
  // ---------------------

  setSalvando(true);

  try {
    const url = buildWebhookUrl("updatelancto");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const ret = await resp.json();

    alert("Lançamento atualizado com sucesso!");
    navigate("/transactions");
  } catch (e) {
    console.error(e);
    alert("Erro ao atualizar lançamento.");
  }

  setSalvando(false);
};


const classificacoesPorNatureza = {
  entrada: [
    { value: "receita", label: "Receita" }, 
    { value: "passivo", label: "Empréstimo / Financiamento Recebido" }
  ],
  saida: [
    { value: "despesa", label: "Despesa" },
    { value: "custo", label: "Custo de Mercadoria / Insumo" } ,
    { value: "imobilizado", label: "Aquisição de Imobilizado" } 
  ]
};
 



const getClassificacoes = () => {
  if (!form.tipo) return [];
  return classificacoesPorNatureza[form.tipo] || [];
};

 async function carregarModelos(classificacaoParam = form.classificacao) {
  try {
    const url = buildWebhookUrl("modelos",  { empresa_id:id_empresa , tipo_evento:'financeiro' ,sistema:false,  
 classificacao:  classificacaoParam  });

    const resp = await fetch(url);
    const data = await resp.json();

    setModelos(Array.isArray(data) ? data : []);
  } catch (e) {
    console.log("Erro modelos", e);
  }
}

 
 return (
      <div className="min-h-screen py-6 px-4 bg-bgSoft">
        <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#061f4aff]   mt-1 mb-1" > 
      {/* Título */}
        {/* TÍTULO IGUAL AO EDITAR */}
        <h1
          className="text-2xl md:text-3xl font-bold mb-6 text-center"
          style={{ color: "#ff9f43" }}
        >
          ✏️ Editar Lançamento
        </h1>
   

         <div className="bg-gray-100 flex flex-col  gap-2  space-y-6 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
        {/* 1 — Tipo */}
        <div>
          <label   className="label label-required block font-bold text-[#1e40af] mt-4" >Tipo</label>
           <select
              name="tipo"
              
              value={form.tipo}
              disabled
              className="input-premium"
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>

        </div>

        {/* 2 — Categoria */}
        <div>
          <label className="label label-required block font-bold text-[#1e40af]  mt-4" >Categoria</label>
          <select
            name="categoria_id"
            value={form.categoria_id}
            onChange={onChange}
             className="input-premium"
          >
            <option value="">Selecione</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
          </div>

        {/* 3 — Conta + Valor */}
        <div className="grid grid-cols-2 gap-4">
          
          <div>
            <label  className="label label-required block font-bold text-[#1e40af]" >Conta Financeira</label>
            <select
              name="conta_id"
                disabled
              value={form.conta_id}
              onChange={onChange}
               className="input-premium"
            >
              <option value="">Selecione</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label  className="label label-required block font-bold text-[#1e40af]" >Valor</label>
            <input
              type="number"
              name="valor"
                disabled
              value={form.valor}
              onChange={onChange}
              className="input-premium"
            />
          </div>

        </div>

        {/* 4 — Data + Origem */}
        <div className="grid grid-cols-2 gap-4">

          <div>
            <label  className="label label-required block font-bold text-[#1e40af]" >Data</label>
            <input
              type="date"
              name="data_movimento"
              value={form.data_movimento}
              onChange={onChange}
               className="input-premium"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-[#1e40af]">Origem</label>
            <input
              type="text"
              name="origem"
              value={form.origem}
              onChange={onChange}
              disabled
               className="input-premium"
            />
          </div>

        </div> 
          <div> 
          <div>
                <div className="w-4/5">
                  <label className="label label-required">
                    Classificação
                  </label>

                  <select
                    name="classificacao"
                    value={form.classificacao}
                    
                    onChange={onChange}
                    className="input-premium w-64"
                    required
                    disabled={!form.tipo}
                  >
                    <option value="">Selecione...</option>
                    {getClassificacoes().map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
          </div>



        {/* 5 — Descrição */}
        <div>
          <label  className="label label-required block font-bold text-[#1e40af]"  >Descrição</label>
          <input
            type="text"
            name="descricao"
            value={form.descricao}
            onChange={onChange}
             className="input-premium"
          />
        </div>

         <div>
            <label className="label label-required font-bold text-[#1e40af]">
              Modelo
            </label>

            <input
              list="modelos"
              name="modelo_codigo"
              className="input-premium"
              value={form.modelo_codigo || ""}
              onChange={onChange}
              placeholder="Digite ou selecione o modelo"
            />

            <datalist id="modelos">
              {modelos.map((m) => (
                <option key={m.id} value={m.codigo} />
              ))}
            </datalist>
          </div>
        {/* Botões */}
            
          <div className="flex gap-6 pt-8 pb-8 pl-1">

           
          <button
            onClick={salvar}
            className="flex-1 bg-[#061f4aff] text-white px-4 py-2 rounded-lg font-semibold"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>

          <button
            onClick={() => navigate("/transactions")}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Voltar
          </button>
        </div>

      </div>

    </div>
  </div>
);

}
