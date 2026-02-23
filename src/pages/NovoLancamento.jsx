 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from '../config/globals';
import { hojeLocal, dataLocal } from "../utils/dataLocal";
import ModalBase from "../components/ModalBase";
import FormCategoria from "../components/forms/FormCategoria";
import FormConta from "../components/forms/FormConta";


export default function NovoLancamento() {
  const navigate = useNavigate();   

  const empresa_id = localStorage.getItem("empresa_id") || "1";
  const [modalCategoria, setModalCategoria] = useState(false);
   const [modalConta, setModalConta] = useState(false);
 

 


  const [form, setForm] = useState({
    id: "",
    empresa_id: empresa_id,
    categoria_id: "",
    conta_id: "",
    valor: "",
    data:  hojeLocal()  ,
    descricao: "",
    tipo: "saida",
    origem: "Web",
    classificacao:""
  });

  const [categorias, setCategorias] = useState([]);
  const [contas, setContas] = useState([]);

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

  const payload = {
    id_empresa: form.empresa_id,
    tipo: form.tipo,
    conta: form.conta_id,
    categoria: form.categoria_id,
    valor: form.valor,
    descricao: form.descricao,
    data: form.data,
    origem: "WebApp",
    classificacao:form.classificacao 
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
    { value: "ativo", label: "Aumento de Ativo" },
    { value: "passivo", label: "Aumento de Passivo" }
  ],
  saida: [
    { value: "despesa", label: "Despesa" },
    { value: "estoque", label: "Compra para Estoque" },
    { value: "imobilizado", label: "Aquisição de Imobilizado" },
    { value: "passivo", label: "Redução de Passivo" }
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

  return (
          
      <div className="min-h-screen py-6 px-4 bg-bgSoft">
        <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#061f4aff]   mt-1 mb-1" >
        {/* TÍTULO IGUAL AO EDITAR */}
        <h1
          className="text-2xl md:text-3xl font-bold mb-6 text-center"
          style={{ color: "#ff9f43" }}
        >
          ✏️ Novo Lançamento
        </h1>
           

        <div className="bg-gray-100 p-5 rounded-xl shadow flex flex-col gap-4"> 

          {/* Tipo */}
          <label  className="label label-required font-bold text-[#1e40af]">Tipo</label>
           <div className="w-2/5"> 
          <select
            name="tipo"
            value={form.tipo}
            
            onChange={handleChange}
             placeholder="Tipo"
             className="input-premium"
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          </div>

          {/* Categoria */}
          <label  className="label label-required font-bold text-[#1e40af]" >Categoria</label>
          <div className="w-2/3"> 
           


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
                    className="input-premium"
                  >
                    <option value="">Selecione</option>

                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}

                    <option value="__nova__">
                      ➕ Nova Categoria
                    </option>
                  </select>
 


           </div>

          {/* GRID IGUAL AO EDITAR */}
          <div className="grid grid-cols-1 gap-4">

            <div>
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

            </div>

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

          {/* Botões */}
          
          <div className="flex gap-6 pt-8 pb-8 pl-1"> 

            <button
              type="button"
              onClick={handleSalvar}
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
        onCategoriaCriada={(nova) => {
          setCategorias(prev => [nova, ...prev]);
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

    </div>

    
  );
}
