 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from '../config/globals';
import { hojeLocal, dataLocal } from "../utils/dataLocal";

export default function NovoLancamento() {
  const navigate = useNavigate();   

  const empresa_id = localStorage.getItem("empresa_id") || "1";

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


  return (
         <div className="min-h-screen py-8 px-4 bg-bgSoft"> 
         <div className="w-full max-w-4xl mx-auto rounded-xl p-6 shadow-xl bg-[#1e40af] text-blue">  

        {/* TÍTULO IGUAL AO EDITAR */}
        <h1
          className="text-2xl md:text-3xl font-bold mb-6 text-center"
          style={{ color: "#ff9f43" }}
        >
          ✏️ Novo Lançamento
        </h1>
          

         

        <div className="bg-gray-100 flex flex-col  gap-2  space-y-4 px-6">

          {/* Tipo */}
          <label  className="label label-required font-bold text-[#1e40af]">Tipo</label>
           <div className="w-1/5"> 
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
             placeholder="Tipo"
            className="border font-bold rounded px-2 py-2 w-42 mb-2 border-gray-300"
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
            onChange={handleChange}
               placeholder="Categoria"
              className= "border font-bold rounded px-2 py-2  w-[280px] mb-2 border-gray-300"
          >
            <option value="">Selecione</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
           </div>

          {/* GRID IGUAL AO EDITAR */}
          <div className="grid grid-cols-1 gap-4">

            <div>
              <label  className="label label-required block font-bold text-[#1e40af]">Conta Financeira</label>
              <select
                name="conta_id"
                value={form.conta_id}
                onChange={handleChange}
                    placeholder="Conta Gerencial"
                 className= "border font-bold rounded px-2 py-2  w-[380px]  mb-2 border-gray-300"
              >
                <option value="">Selecione</option>
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
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
                 className= "border font-bold rounded px-2 py-2 w-52 mb-2 border-gray-300"
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
                 className= "border font-bold rounded px-2 py-2 w-52 mb-2 border-gray-300"
              />
            </div>

          {/*}  <div>
              <label className="block text-base font-bold text-[#1e40af]">Origem</label>
              
              <input
                type="text"
                name="origem"
                value={form.origem}
                
                onChange={handleChange}
                 placeholder="conta corrente"
                 className= "border font-bold rounded px-2 py-2 w-72 mb-4  border-gray-300"
              />
            
            </div>*/}
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
             className= "border font-bold rounded px-2 py-2 w-[680px] mb-4 border-gray-300"
          /> 

          {/* Botões */}
          
          <div className="flex gap-6 pt-8 pb-8 pl-1">


            <button
              onClick={handleSalvar}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold"
            >
              Salvar
            </button>

            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-400 text-white px-4 py-3  rounded-lg font-semibold"
            >
              Voltar
            </button>
          </div> 
        </div>

      </div>
    </div>
  );
}
