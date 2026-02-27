 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from '../config/globals';
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
import ModalBase from "../components/ModalBase";
import FormCategoria from "../components/forms/FormCategoria";
import FormConta from "../components/forms/FormConta";
import FormFornecedorModal from "../components/forms/FormFornecedorModal";
import FormCartaoModal from "../components/forms/FormCartaoModal";

export default function NovoLancamento() {
  const navigate = useNavigate();   

  const empresa_id = localStorage.getItem("empresa_id") || "1";
  const [modalCategoria, setModalCategoria] = useState(false);
   const [modalConta, setModalConta] = useState(false);
  const [fornecedores, setFornecedores] = useState([]);
   const [modalModelo, setModalModelo] = useState(false);

 
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
    classificacao:""
  });

  const [categorias, setCategorias] = useState([]);
  const [contas, setContas] = useState([]);

 const [listaCartoes, setListaCartoes] = useState([]);
  const [cartaoSelecionado, setCartaoSelecionado] = useState("");
  
 const [modalCartao, setModalCartao] = useState(false);

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
      } catch { }

      setFornecedores(Array.isArray(lista) ? lista : []);
    } catch (e) {
      console.log("ERRO ao carregar fornecedores:", e);
    }
  }

  useEffect(() => {
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

 const handleSalvar = async () => {
  // VALIDACOES SIMPLES
  if (!form.categoria_id) return alert("Selecione uma categoria.");
  if (!form.conta_id) return alert("Selecione uma conta.");
  if (!form.valor || Number(form.valor) <= 0) return alert("Informe um valor válido.");
  if (!form.descricao.trim()) return alert("Informe uma descrição.");
  if (!form.tipo) return alert("Selecione o tipo.");

 {/*} const payload = {
    id_empresa: form.empresa_id,
    tipo: form.tipo,
    conta: form.conta_id,
    categoria: form.categoria_id,
    valor: form.valor,
    descricao: form.descricao,
    data: form.data,
    origem: "WebApp",
    classificacao:form.classificacao 
  };*/}

  const payload = {
  id_empresa: form.empresa_id,
  tipo: form.tipo,
  categoria_id: form.categoria_id,
  conta: form.conta_id || null,
  fornecedor_id: form.fornecedor_id || null,
  cartao_id: cartaoSelecionado || null,
  forma_pagamento: form.forma_pagamento || null,
  forma_recebimento: form.forma_recebimento || null,
  vencimento: form.vencimento || null,
  valor: form.valor,
  descricao: form.descricao,
  data: form.data,
  origem: "WebApp",
  classificacao: form.classificacao,
};

  
  try {
    const url = buildWebhookUrl("novolancamento"); 

       if (!form.tipo) {
          alert(" Tipo  é obrigatório.");
          return;
        }
       
         const categoria = parseFloat(form.categoria_id); 
        if  (!Number.isFinite(categoria) || categoria <= 0) {
          alert("Categoria é obrigatório.");
          return;
        }
        
            const conta = parseFloat(form.conta_id); 
        if  (!Number.isFinite(conta) || conta <= 0) {
          alert("Conta Financeira é obrigatório.");
          return;
        }
         
        if (!form.data) {
          alert(" Data de Movimento é obrigatório.");
          return;
        }

          // ================== VALIDAÇÕES ==================
        
         
        if (!form.descricao) {
          alert(" Descricao é obrigatório.");
          return;
        } 
       

            if (!form.classificacao ) {
          alert(" Classificação é obrigatória.");
          return;
        } 
 
        

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const texto = await resp.text();
    let json = null;

    try {
      json = JSON.parse(texto);
    } catch (e) {
      console.log("JSON inválido:", texto);
      alert("Erro inesperado no servidor.");
      return;
    }

    // json É UM ARRAY — SEMPRE PEGAMOS O PRIMEIRO ITEM
    const item = Array.isArray(json) ? json[0] : json;

    // SE OK == FALSE, MOSTRA A MENSAGEM DO BACKEND
    if (item?.ok === false) {
      alert(item.message || "Erro ao salvar.");
      return;
    }

    // SE CHEGOU AQUI, DEU CERTO
    alert("Lançamento salvo!");
    navigate(-1);

  } catch (e) {
    console.log("ERRO REQUEST:", e);
    alert("Erro de comunicação com o servidor.");
  }
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
  ]
};
 



const getClassificacoes = () => {
  if (!form.tipo) return [];
  return classificacoesPorNatureza[form.tipo] || [];
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
      return "cartao";
    if (form.forma_pagamento === "aprazo")
      return "pagar";
    return "financeiro";
  }

  return "financeiro";
})();

 const handleSalvarGeral = async () => {
 
 
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
    data_compra:  form.data
   



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

  if (modo === "cartao") {
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
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar.");
  }
};

 

  return (
          
      <div className="min-h-screen py-6 px-4 bg-bgSoft">
        <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#061f4aff]   mt-1 mb-1" >
        {/* TÍTULO IGUAL AO EDITAR */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center" style={{ color: "#ff9f43" }}>
            {titulo}
          </h1>

        <div className="bg-gray-100 p-5 rounded-xl shadow flex flex-col gap-4"> 

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

    </div>

    
  );
}
