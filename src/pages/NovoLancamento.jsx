 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from '../config/globals';
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
import ModalBase from "../components/ModalBase";
import FormCategoria from "../components/forms/FormCategoria";
import FormConta from "../components/forms/FormConta";
import FormFornecedorModal from "../components/forms/FormFornecedorModal";
import FormCartaoModal from "../components/forms/FormCartaoModal";
import FormModeloContabil from "../components/forms/FormModeloContabil";

export default function NovoLancamento() {
  const navigate = useNavigate();   

  const empresa_id = localStorage.getItem("empresa_id") || "1";
  const [modalCategoria, setModalCategoria] = useState(false);
   const [modalConta, setModalConta] = useState(false);
  const [fornecedores, setFornecedores] = useState([]);
   const [modalModelo, setModalModelo] = useState(false);
    const [linhas, setLinhas] = useState([]);
 
  const [modalFornecedor, setModalFornecedor] = useState(false);


  const [form, setForm] = useState({
    id: "",
    empresa_id: empresa_id,
    categoria_id: "",
    conta_id: "",
    fornecedor_id:"",
    valor: "",
    data:  hojeLocal()  ,
    vencimento: hojeMaisDias(1), // amanhã (BR)
    descricao: "",
    tipo: "saida",
    origem: "Web",
    classificacao:"",
    modelo_codigo:"",
    parcela_num:1,
    parcelas:1
  });

  const [categorias, setCategorias] = useState([]);
  const [contas, setContas] = useState([]);
 
 const [listaCartoes, setListaCartoes] = useState([]);
  const [cartaoSelecionado, setCartaoSelecionado] = useState("");
  const [aba, setAba] = useState("principal"); 
 const [modalCartao, setModalCartao] = useState(false);
 const [modeloCodigo, setModeloCodigo] = useState("");
  const [modelos, setModelos] = useState([]);
  
  const [resultadoBusca, setResultadoBusca] = useState([]); // contas retornadas
  const [modeloSelecionado, setModeloSelecionado] = useState(null);
  async function buscarContas(linha, texto) {
      if (!texto || texto.length < 2) {
        setResultadoBusca([]);
        return;
      }
  
      try {
        const url = buildWebhookUrl("buscar_contas", {
          empresa_id,
          nome: texto  
         // dc:  linha.natureza,     // <-- AQUI: usa o D/C da linha (D ou C)
       });
  
        const resp = await fetch(url);
        const dados = await resp.json();
  
        setResultadoBusca(dados);
      } catch (e) {
        console.log("ERRO BUSCAR CONTAS:", e);
      }
    }
  
 
  async function carregarDadosLinhas(modeloId) {
  try {
    const url = buildWebhookUrl("modelos_linhas", {
      empresa_id,
      modelo_id: modeloId,
    });

    const resp = await fetch(url);
    const dados = await resp.json();
    setLinhas(Array.isArray(dados) ? dados : []);
  } catch (e) {
    console.log("ERRO:", e);
    setLinhas([]);
  }
}

   const carregarCartoes = async () => {
    try {
      const url = buildWebhookUrl("cartoes", { id_empresa: empresa_id });
      const resp = await fetch(url);
      const json = await resp.json();
      setListaCartoes(json);
    } catch (error) {
      console.error("Erro ao carregar cartões:", error);
    }
  };

  useEffect(() => {
    carregarCartoes();
  }, []);

   const validarFormulario = () => {
  const erros = [];

  if (!form.categoria_id || Number(form.categoria_id) <= 0)
    erros.push("Categoria é obrigatória.");

  if (!form.valor || Number(form.valor) <= 0)
    erros.push("Valor inválido.");

  if (!form.descricao?.trim())
    erros.push("Descrição é obrigatória.");

  if (!form.data)
    erros.push("Data é obrigatória.");

  if (!form.classificacao)
    erros.push("Classificação é obrigatória.");

  if (modo === "financeiro") {
    if (!form.conta_id || Number(form.conta_id) <= 0)
      erros.push("Conta financeira é obrigatória.");
  }

  if (modo === "receber" || modo === "pagar") {
    if (!form.vencimento)
      erros.push("Vencimento é obrigatório.");

    if (!form.parcelas || Number(form.parcelas) < 1)
      erros.push("Parcelas inválidas.");
  }

  if (modo === "cartao_compra") {
    if (!cartaoSelecionado)
      erros.push("Selecione um cartão.");

    if (!form.parcelas || Number(form.parcelas) < 1)
      erros.push("Parcelas inválidas.");
  } 
  if (modo === "receber" || modo === "pagar") {
    if (!form.fornecedor_id)
      erros.push("Fornecedor é obrigatório.");
   }

   
  return erros;
};
    async function carregarFornecedores() {
    try {
      const url = buildWebhookUrl("fornecedorcliente", {
        empresa_id,
        tipo: "ambos",
      });

      const resp = await fetch(url);
      const txt = await resp.text();

      let lista = [];
      try {
        lista = JSON.parse(txt);
      } catch { }

      setFornecedores(Array.isArray(lista) ? lista : []);
    } catch (e) {
      console.log("ERRO ao carregar fornecedores:", e);
    }
  }

  useEffect(() => {
      carregarFornecedores();
    carregarCategorias();
  }, [form.tipo, empresa_id]);

  useEffect(() => {
    carregarContas();
  }, [empresa_id]);

  async function carregarCategorias() {
    try {
      const url = buildWebhookUrl("listacategorias", { empresa_id, tipo: form.tipo });
      const resp = await fetch(url);
      const data = await resp.json();
      setCategorias(data);
    } catch (error) {}
  }

  async function carregarContas() {
    try {
      const url = buildWebhookUrl("listacontas", { empresa_id });
      const resp = await fetch(url);
      const data = await resp.json();
      setContas(data);
    } catch (error) {}
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

 
   


const classificacoesPorNatureza = {
  entrada: [
    { value: "receita", label: "Receita" }, 
    { value: "passivo", label: "Empréstimo / Financiamento Recebido" },
     { value: "ativo", label: "Aporte Sócios" }
  ],
  saida: [
    { value: "despesa", label: "Despesa" },
    { value: "custo", label: "Custo de Mercadoria / Insumo" } ,
    { value: "imobilizado", label: "Aquisição de Imobilizado" } 
  ],
  pagar: [
    { value: "despesa", label: "Despesa" },
    { value: "custo", label: "Custo de Mercadoria / Insumo" } ,
    { value: "imobilizado", label: "Aquisição de Imobilizado" } ,
    { value: "passivo", label: "Passivo (Financiamento/Dívida)"}

  ],

  cartao: [
    { value: "despesa", label: "Despesa" },
    { value: "custo", label: "Custo de Mercadoria / Insumo" } ,
    { value: "imobilizado", label: "Aquisição de Imobilizado" }  

  ] ,

  
  cartao_compra: [
    { value: "despesa", label: "Despesa" },
    { value: "custo", label: "Custo de Mercadoria / Insumo" } ,
    { value: "imobilizado", label: "Aquisição de Imobilizado" }  

  ] 
};
 



 const getClassificacoes = () => {

  if (modo === "receber") {
    return [
      { value: "receita", label: "Receita" },
        { value: "ativo", label: "Ativo" }
    ];
  }

  if (modo === "pagar" ) {
    return classificacoesPorNatureza.pagar;
  }

     if ( modo === "cartao") {
    return classificacoesPorNatureza.cartao;
 
  };


   if ( modo === "cartao_compra") {
    return classificacoesPorNatureza.cartao_compra;
 
  };

  if (modo === "financeiro") {
    return classificacoesPorNatureza[form.tipo] || [];
  }

  return [];
};

useEffect(() => {
  setForm((prev) => ({
    ...prev,
    classificacao: ""
  }));
}, [form.natureza]);

const mostrarContaFinanceira =
  (form.tipo === "entrada" &&
   ["avista","pix","cartao_debito"].includes(form.forma_recebimento)) ||

  (form.tipo === "saida" &&
   ["avista","pix","cartao_debito"].includes(form.forma_pagamento));


   const ehAPrazo =
  (form.tipo === "entrada" &&
    ["cartao_credito","boleto","aprazo"].includes(form.forma_recebimento)) ||

  (form.tipo === "saida" &&
    ["cartao_credito","aprazo"].includes(form.forma_pagamento));

    const mostrarCartao =
  form.tipo === "saida" &&
  form.forma_pagamento === "cartao_credito";

  const titulo = (() => {
  if (form.tipo === "entrada") {
    if (["cartao_credito","boleto","aprazo"].includes(form.forma_recebimento))
      return "📄 Nova Conta a Receber";
    return "💰 Novo Lançamento Financeiro";
  }

  if (form.tipo === "saida") {
    if (form.forma_pagamento === "cartao_credito")
      return "💳 Nova Compra no Cartão";
    if (form.forma_pagamento === "aprazo")
      return "📄 Nova Conta a Pagar";
    return "💰 Novo Lançamento Financeiro";
  }

  return "Novo Lançamento";
})();


const modo = (() => {
  if (form.tipo === "entrada") {
    if (["cartao_credito","boleto","aprazo"].includes(form.forma_recebimento))
      return "receber";
    return "financeiro";
  }

  if (form.tipo === "saida") {
    if (form.forma_pagamento === "cartao_credito")
      return "cartao_compra";
    if (form.forma_pagamento === "aprazo")
      return "pagar";
    return "financeiro";
  } 
  return "financeiro";
})();

 
const limparFormulario = () => {
  setForm({
    id: "",
    empresa_id: empresa_id,
    categoria_id: "",
    conta_id: "",
    fornecedor_id: "",
    valor: "",
    data: hojeLocal(),
    vencimento: hojeMaisDias(1),
    descricao: "",
    tipo: form.tipo, // 🔵 mantém o tipo atual
    origem: "Web",
    classificacao: "",
    modelo_codigo: "",
    parcela_num: 1,
    parcelas: 1,
    forma_pagamento: "",
    forma_recebimento: "",
    status: "aberto",
    doc_ref: ""
  });

  // 🔵 limpa personalização contábil
  setModeloCodigo("");
  setModeloSelecionado(null);
  setLinhas([]);

  // 🔵 limpa cartão
  setCartaoSelecionado("");

  // 🔵 volta para aba principal
  setAba("principal");
};

 const handleSalvarGeral = async () => {
 
 const erros = validarFormulario();

      if (erros.length > 0) {
        alert(erros.join("\n"));
        return;
}
  // 🔵 PAYLOAD ÚNICO E COMPLETO
  const payload = {
    empresa_id: form.empresa_id,
    tipo: form.tipo,
    categoria_id: form.categoria_id || null,
    conta: form.conta_id || null,
    fornecedor_id: form.fornecedor_id || null,
    cartao_id: cartaoSelecionado || null,
    forma_pagamento: form.forma_pagamento || null,
    forma_recebimento: form.forma_recebimento || null,
    vencimento: form.vencimento || null,
    valor: form.valor,
    descricao: form.descricao,
    data: form.data,
    classificacao: form.classificacao,
    origem: "WebApp", 
    parcelas: Number(form.parcelas),
    parcela_num: Number(form.parcela_num),
    status: form.status,
    doc_ref: form.doc_ref , 
    cartao_nome: cartaoSelecionado, 
    valor_total: form.valor, 
    data_compra:  form.data  ,
    modelo_codigo:modeloCodigo 
  };

  // 🔵 DECIDE APENAS O ENDPOINT
  let endpoint = "";

  if (modo === "financeiro") {
    endpoint = "novolancamento";
  }

  if (modo === "receber") {
    endpoint = "novacontareceber";
  }

  if (modo === "pagar") {
    endpoint = "novacontapagar";
  }

  if (modo === "cartao_compra") {
    endpoint = "novatranscartao";
  }

 

  const url = buildWebhookUrl(endpoint);
 
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
 
    
    alert("Salvo com sucesso!");
    limparFormulario();
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar.");
  }
};

 
 async function carregarModelos() {
  try {
    const r = await fetch(
      buildWebhookUrl("modelos", { empresa_id, tipo_evento:modo ,sistema:false,  
 classificacao: form.classificacao  })
    );
    const j = await r.json();
    setModelos(Array.isArray(j) ? j : []);
  } catch (e) {
    console.error("Erro ao carregar modelos", e);
    setModelos([]);
  }
}

 useEffect(() => {
  if (form.classificacao) {
    carregarModelos();
  }
}, [empresa_id, modo, form.classificacao]);

  function getHelperTexto(tipo) {
  switch (tipo) {
    case 'pagar':
      return "Conta a Pagar: o crédito deve ser Passivo (2.1.x) e o débito pode ser Estoque, Despesa ou Imobilizado.";
    case 'receber':
      return "Conta a Receber: o débito deve ser Clientes (1.1.x) e o crédito Receita (5.x).";
    case 'financeiro':
      return "Movimento de Caixa: envolve Banco/Caixa e baixa de Cliente ou Fornecedor.";
    case 'Financeiro':
      return "Imobilizado: débito em 1.2.x (bem durável) e crédito em Fornecedores (2.1.x).";
    default:
      return "Selecione as contas conforme sua estrutura contábil.";
  }
}
 
 useEffect(() => {
  // 🔵 limpa modelo contábil sempre que mudar regra de negócio
  setForm(prev => ({
    ...prev,
    modelo_codigo: ""
  }));

  setModeloCodigo("");
  setModeloSelecionado(null);
  setLinhas([]);

}, [
  form.tipo,
  form.forma_pagamento,
  form.forma_recebimento,
  form.classificacao
]);

  return (
          

     
      <div className="min-h-screen py-6 px-4 bg-bgSoft">
        <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#061f4aff]   mt-1 mb-1" >
        {/* TÍTULO IGUAL AO EDITAR */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: "#ff9f43" }}>
            {titulo}
          </h1>
      
 
       <div className="flex border-b mb-4">

  <button
    onClick={() => setAba("principal")}
    className={`px-4 py-2 font-semibold ${
      aba === "principal"
        ? "border-b-2 border-[#ff9f43] text-[#ff9f43]"
        : "text-gray-500"
    }`}
  >
    Principal
  </button>

  <button
    onClick={() => setAba("contabil")}
    className={`px-4 py-2 font-semibold ${
      aba === "contabil"
        ? "border-b-2 border-[#ff9f43] text-[#ff9f43]"
        : "text-gray-500"
    }`}
  >
    Customização Contábil
  </button>

  </div>
        <div className="bg-gray-100 p-5 rounded-xl shadow">

  {aba === "principal" && (
    <div className="flex flex-col gap-4">

          {mostrarCartao && (   <div>      {/* Cartão */}
              <label className="block label label-required">Cartão</label>
                  <div className="flex items-center gap-2"> 
              <select
                    className="input-premium w-[480px]"
                value={cartaoSelecionado}
                onChange={(e) => setCartaoSelecionado(e.target.value)}
                placeholder="Nome do Cartão"
              >
                <option value="">Selecione...</option>
                {listaCartoes.map((c) => (
                  <option key={c.id} value={c.nome}>
                    {c.nome} - {c.bandeira}
                  </option>
                ))}
              </select>
            <div className="relative group"> 
              <button
                onClick={() => setModalCartao(true)}
                  className="px-1 py-1 rounded-lg bg-[#061f4a] text-white font-semibold hover:brightness-110"
              >
                ➕ 
              </button>

                    <div className="
                          absolute left-1/2 -translate-x-1/2 top-10
                          hidden group-hover:block
                          bg-black text-white text-xs
                          px-2 py-1 rounded
                          whitespace-nowrap
                          z-50
                        ">
                        Adicionar novo cartão 
                      </div>
                  </div>
            </div>
            </div>  )}
         <div className="grid grid-cols-2 gap-6">

                  {/* Tipo */}
                  <div>
                    <label className="label label-required font-bold text-[#1e40af]">
                      Tipo
                    </label>

                    <select
                      name="tipo"
                      value={form.tipo}
                      onChange={handleChange}
                      className="input-premium w-full"
                    >
                      <option value="entrada">Entrada</option>
                      <option value="saida">Saída</option>
                    </select>
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="label label-required font-bold text-[#1e40af]">
                      Categoria
                    </label>

                    <select
                      name="categoria_id"
                      value={form.categoria_id}
                      onChange={(e) => {
                        if (e.target.value === "__nova__") {
                          setModalCategoria(true);
                          return;
                        }
                        handleChange(e);
                      }}
                      className="input-premium w-full"
                    >
                      <option value="">Selecione</option>

                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}

                      <option value="__nova__">➕ Nova Categoria</option>
                    </select>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* ENTRADA */}
                  {form.tipo === "entrada" && (
                    <div>
                      <label className="label label-required font-bold text-[#1e40af]">
                        Forma de Recebimento
                      </label>

                      <select
                        name="forma_recebimento"
                        value={form.forma_recebimento || ""}
                        onChange={handleChange}
                        className="input-premium w-full"
                      >
                        <option value="">Selecione</option>
                        <option value="avista">À vista</option>
                        <option value="pix">Pix</option>
                        <option value="cartao_debito">Cartão Débito</option>
                        <option value="cartao_credito">Cartão Crédito</option>
                        <option value="boleto">Boleto</option>
                          <option value="aprazo">A prazo</option>
                      </select>
                    </div>
                  )}

                  {/* SAÍDA */}
                  {form.tipo === "saida" && (
                    <div>
                      <label className="label label-required font-bold text-[#1e40af]">
                        Forma de Pagamento
                      </label>

                      <select
                        name="forma_pagamento"
                        value={form.forma_pagamento || ""}
                        onChange={handleChange}
                        className="input-premium w-full"
                      >
                        <option value="">Selecione</option>
                        <option value="avista">À vista</option>
                        <option value="pix">Pix</option>
                        <option value="cartao_credito">Cartão Crédito</option>
                        <option value="boleto">Boleto</option>
                        <option value="aprazo">A prazo</option>
                      </select>
                    </div>
                  )}

                </div>
                 


          {/* GRID IGUAL AO EDITAR */}
          <div className="grid grid-cols-1 gap-4">

           {mostrarContaFinanceira && ( <div>
              <label  className="label label-required block font-bold text-[#1e40af]">Conta Financeira</label>
                <select
                    name="conta_id"
                    value={String(form.conta_id || "")}
                    onChange={(e) => {
                      if (e.target.value === "__nova__") {
                        setModalConta(true);
                        return;
                      } 
                      setForm(prev => ({
                        ...prev,
                        conta_id: e.target.value
                      }));
                    }}
                    className="input-premium"
                  >
                    <option value="">Selecione</option> 
                    {contas.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.nome}
                      </option>
                    ))} 
                    <option value="__nova__">➕ Nova Conta Financeira</option>
                  </select> 
            </div> )}


            <div>
              <label  className="label label-required block font-bold text-[#1e40af]">Valor</label>
              <input
                type="number"
                name="valor"
                value={form.valor}
                onChange={handleChange}
                  placeholder="00,00"
                   className="input-premium"
              />
            </div>

          </div>
         
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label label-required font-bold block text-[#1e40af]">Data</label>
              <input
                type="date"
                name="data"
                value={form.data}
                onChange={handleChange}
                 className="input-premium"
              />
            </div>

           <div>
                <div className="w-4/5">
                  <label className="label label-required">
                    Classificação
                  </label>

                  <select
                    name="classificacao"
                    value={form.classificacao}
                    onChange={handleChange}
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

          {/* Descrição */}
          <label className="label label-required font-bold text-[#1e40af]">Descrição</label>
         
          <input
            type="text"
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            placeholder="Descricao"
            rows="2"
               className="input-premium"
          /> 

          {/* Numero documento ou nota fiscal  */}
          {ehAPrazo && (    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">  <div>
            {!mostrarCartao && ( <div className="w-2/3">
              <label className="label label-required font-bold text-[#1e40af]">Documento</label>
              <input
                name="doc_ref"
                value={form.doc_ref}
                onChange={handleChange}
                className="input-premium w-64"
                placeholder="Nro Documento"
              />
            </div>)}
          </div> 
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                  {/* FORNECEDOR */}
               {!mostrarCartao && (    <div>
                                          <label className="label label-required font-bold text-[#1e40af]">
                                            Fornecedor
                                          </label>

                                            <select
                                              name="fornecedor_id"
                                              value={String(form.fornecedor_id || "")}
                                              onChange={(e) => {
                                                const v = e.target.value;
                                                if (v === "__novo__") {
                                                  setModalFornecedor(true);
                                                  return;
                                                }
                                                setForm(prev => ({ ...prev, fornecedor_id: v }));
                                              }}
                                              className="input-premium w-full"
                                            >
                                              <option value="">Nenhum</option>

                                              {fornecedores.map((f) => (
                                                <option key={f.id} value={String(f.id)}>
                                                  {f.nome}
                                                </option>
                                              ))}

                                              <option value="__novo__">➕ Novo Fornecedor / Cliente</option>
                                            </select>
                       </div>)}

                  {/* VENCIMENTO */}
                   {!mostrarCartao && (    <div>
                                    <label className="label label-required font-bold text-[#1e40af]">
                                      Vencimento
                                    </label>

                                    <input
                                      type="date"
                                      name="vencimento"
                                      min={hojeMaisDias(1)}
                                      value={form.vencimento}
                                      onChange={handleChange}
                                      className="input-premium w-full"
                                    />
                                  </div>)}

                </div>
          

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
            {/* PARCELAS */}
                <div className="w-2/4">
                  <label className="label label-required font-bold text-[#1e40af]">
                    Parcelas
                  </label>
                  <input
                    type="number"
                    name="parcelas"
                    min="1"
                    value={form.parcelas}
                    onChange={handleChange}
                    className="input-premium w-full"
                    placeholder="parcelas"
                  />
                </div>

          {/* STATUS */}
            {!mostrarCartao && (  <div>
                          <div className="w-2/4">
                            <label className="label label-required font-bold text-[#1e40af]">Status</label>
                            <select
                              name="status"
                              value={form.status}
                              onChange={handleChange}
                              className="input-premium w-full"
                              placeholder="status"
                            >
                              <option value="aberto">Aberto</option>
                              <option value="pago">Pago</option>
                            </select>
                          </div>
                        </div>)}
                          </div>  
                            </div>  )}
                            </div>
                       )}
               {aba === "contabil" && (
                         <div  > 

                            <div className="mt-2 mb-4 text-xs bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-slate-800">
                              <div><b>tipo_evento:</b> {modo ?? "null"}</div>
                            
                              <div><b>tipo_es:</b> {form.tipo ?? "null"}</div>
                              <div><b>classificacao:</b> {form.classificacao ?? "null"}</div>
                            </div>
                    <label className="font-bold text-[#1e40af] flex items-center gap-2">
                        Modelo Contábil  
                        <span className="relative group cursor-pointer">
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                            ?
                          </span>

                          {/* Tooltip */}
                            <div className="absolute left-6 top-0 z-50 hidden group-hover:block 
                                            bg-gray-900 text-white text-xs rounded-lg p-3 w-80 shadow-lg">
                              <strong>O que é este campo?</strong>
                              <p className="mt-1">
                                Este campo define a <b>conta contábil onde será registrado o direito a receber</b>.
                              </p>
                              <p className="mt-1">
                                Normalmente corresponde a contas do <b>Ativo Circulante (1.1.X – Clientes ou Duplicatas a Receber)</b>.
                              </p>
                            </div>

                        </span>
                      </label> 
                        <div className="flex items-center gap-2"> 
                              <input
                                list="tokens"
                                className="input-premium w-full"
                                placeholder="Digite ou selecione o token"
                                value={modeloCodigo}
                               onChange={(e) => {
                                    const valor = e.target.value; 
                                    setModeloCodigo(valor); 
                                    const modeloSelecionado = modelos.find(
                                      (m) => m.codigo === valor
                                    ); 
                                    if (modeloSelecionado) {
                                      setForm(prev => ({
                                        ...prev,
                                        modelo_codigo: valor,
                                        modelo_id: modeloSelecionado.id
                                      })); 
                                      carregarDadosLinhas(modeloSelecionado.id);
                                      setModeloSelecionado(modeloSelecionado);
                                    }
                                  }}                           
                              />

                              <datalist id="tokens">
                                {modelos.map((m) => (
                                  <option key={m.id} value={m.codigo}>
                                    {m.codigo}
                                  </option>
                                ))}
                              </datalist> 
                                  <button
                                  type="button"
                                  onClick={() => {
                                    console.log("CLICOU MODELO");
                                    setModalModelo(true);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center rounded bg-[#061f4a] text-white text-sm"
                                >
                                  ➕  
                                </button>  
                          </div>  

                 
                        {/* ===== TABELA ===== */}
                    <div className="bg-white rounded-xl shadow-sm p-4">
                      <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-100 text-gray-700">
                          <tr> 
                            <th className="p-2 text-left">Código</th>
                            <th className="p-2 text-left">Nome</th>
                            <th className="p-2 text-left">Tipo</th>
                            <th className="p-2 text-left">Natureza</th>
                            <th className="p-2 text-center">D/C</th>
                          </tr>
                        </thead>

                        <tbody> 
                          {Array.isArray(linhas) && linhas.map((l, i) => (
                        
                            <tr
                              key={i}
                              className={i % 2 === 0 ? "bg-gray-300" : "bg-gray-250"}
                            >  
                              <td className="p-2">{l.codigo}</td>
                              <td className="p-2">{l.nome}</td>
                              <td className="p-2">{l.tipo}</td>
                              <td className="p-2">{l.natureza}</td>
                              <td className="p-2 text-center font-bold">{l.dc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div> 
                          <div className="text-xs bg-blue-50 p-2 rounded mb-3 text-gray-700">
                              💡 {getHelperTexto(modo)}
                            </div>  
                    </div>
                    )} 

          <div className="flex gap-6 pt-8 pb-8 pl-1">  
            <button
              type="button"
              onClick={handleSalvarGeral}
              className="flex-1 bg-[#061f4aff] text-white px-4 py-3 rounded-lg font-semibold"
            >
              Salvar
            </button>  
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-500 text-white px-4 py-3  rounded-lg font-semibold"
            >
              Voltar
            </button> 

          </div> 
        </div>

      </div>
      
      <FormCategoria
        open={modalCategoria}
        onClose={() => setModalCategoria(false)} 
        empresa_id={empresa_id}
        tipo={form.tipo}
                  onCategoriaCriada={async (nova) => {
            setModalCategoria(false);
            await carregarCategorias();   // 🔥 recarrega a lista oficial
            setForm(prev => ({
              ...prev,
              categoria_id: nova.id
            }));
          }}
      />

        <ModalBase
            open={modalConta}
            onClose={() => setModalConta(false)}
            title="Nova Conta Financeira"
          >
            <FormConta
              empresa_id={empresa_id}
              onSuccess={(novaConta) => {
                    console.log("RETORNO RAW:", novaConta);
                    carregarContas()
                    const conta = Array.isArray(novaConta)
                      ? novaConta[0]
                      : novaConta;

                    console.log("CONTA TRATADA:", conta);

                    setContas(prev => {
                      console.log("ANTES:", prev);
                      return [conta, ...prev];
                    });

                    setForm(prev => ({
                      ...prev,
                      conta_id: conta.id, // SEM String
                    }));

                    setModalConta(false);
                  }}
              onCancel={() => setModalConta(false)}
            />
          </ModalBase>

     
           <ModalBase
              open={modalFornecedor}
              onClose={() => setModalFornecedor(false)}
              title="Novo Fornecedor / Cliente"
            >
              <FormFornecedorModal
                empresa_id={empresa_id}
                tipo="fornecedor"   // 👈 AQUI
                onSuccess={(novo) => {
                  setFornecedores(prev => [novo, ...prev]);

                  setForm(prev => ({
                    ...prev,
                    fornecedor_id: String(novo.id)
                  }));

                  setModalFornecedor(false);
                }}
                onCancel={() => setModalFornecedor(false)}
              />
            </ModalBase>
          

             <ModalBase
                  open={modalModelo}
                  onClose={() => setModalModelo(false)}
                  title="Novo Modelo"
                >
                  <FormModeloContabil
                    empresa_id={empresa_id}
                    tipo_evento={modo}   // <-- AQUI
                    tipo_es={form.tipo}
                    classificacao={form.classificacao}
                    onSuccess={() => {
                      setModalModelo(false);
                      carregarModelos();
                    }}
          
                    onCancel={() => setModalModelo(false)}
                  />
                </ModalBase>
 
             
                  <ModalBase
                 open={modalCartao}
                 onClose={() => setModalCartao(false)}
                 title="Novo Cartão"
               >
                 <FormCartaoModal
                   empresa_id={empresa_id}
                   onSuccess={() => {
                     setModalCartao(false);
                     // se quiser recarregar lista:
                   carregarCartoes();   // 👈 AQUI ESTÁ O RELOAD
                   }}
                   onCancel={() => setModalCartao(false)}
                 />
               </ModalBase>


    </div>
   
    
  );
}
