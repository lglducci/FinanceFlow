 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from '../config/globals';
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";

export default function RegistroReceitaRapida() {
  const navigate = useNavigate();   


  
  const empresa_id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa") ;

  const [salvando, setSalvando] = useState(false);


   const [form, setForm] = useState({
  empresa_id,
  categoria_id: "",
  conta_id: "",
  valor: "",
  tipo:"entrada", 
  data: hojeLocal(),
  descricao: "",
  forma_pagamento: "PIX", // NOVO
  vencimento: hojeMaisDias(1),         // NOVO 
   parcelas: 1,
   canal:""           // CARTAO | CLIENTE | OPERADORA
});


 const FORMAS_PAGAMENTO = [
  { value: "PIX", label: "PIX / Dinheiro / Débito" },
  { value: "CREDITO", label: "Cartão de Crédito" },
  { value: "FIADO", label: "Fiado / Cliente" },
  { value: "DEBITO", label: "Cartão de Debito" },
   { value: "DINHEIRO", label: "Dinheiro" },
];


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
      const url = buildWebhookUrl("listameunegocio", {  empresa_id,
          tipo: "entrada",
          meunegocio: true, });
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

   if (salvando) return; // 🔒 trava
  setSalvando(true);

  if (!form.categoria_id) return alert("Selecione a categoria.");
  if (!form.valor || Number(form.valor) <= 0) return alert("Informe um valor válido.");
  if (!form.descricao.trim()) return alert("Informe a descrição.");

  const isPrazo =
    form.forma_pagamento === "CREDITO" ||
    form.forma_pagamento === "FIADO";

  try {
    // ================== À VISTA ==================
    if (!isPrazo) {
      if (!form.conta_id) return alert("Selecione a conta financeira.");

      await fetch(buildWebhookUrl("novolancamento"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_empresa:empresa_id,
          conta: form.conta_id,
          categoria: form.categoria_id,
          tipo: "entrada",
          valor: Number(form.valor),
          descricao: form.descricao,
          data: form.data,
          origem: "UI",
          evento_codigo: "RECEBER",
        }),
      });
    }

    // ================== A PRAZO ==================
    if (isPrazo) {
      if (!form.vencimento)
        return alert("Informe o vencimento.");

      await fetch(buildWebhookUrl("novacontareceber"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          descricao: form.descricao,
          valor: Number(form.valor),
          vencimento: form.vencimento,
           parcelas: Number(form.parcelas),
           parcela_num: Number(form.parcela_num),
          categoria_id: form.categoria_id,
          status: "aberto",
          evento_codigo: "RECEBER",
          forma_recebimento: form.forma_pagamento,
          conta: form.conta_id,
          canal:form.canal 
        }),
      });
    } 



    alert("Receita registrada!");
    
     setSalvando(false);
    // 🔄 LIMPA TELA
    setForm({
      empresa_id,
      categoria_id: "",
      conta_id: "",
      valor: "",
      data: hojeLocal(),
      descricao: "",
      forma_pagamento: "PIX",
      vencimento: hojeMaisDias(1),
      parcelas: 1,
       canal:""           // CARTAO | CLIENTE | OPERADORA
    });

  } catch (e) {
    alert("Erro ao salvar.");
  }
};


  return (
          
      <div className="min-h-screen py-6 px-4 bg-bgSoft">
        <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl  bg-[#061f4aff]   mt-1 mb-1" >
        {/* TÍTULO IGUAL AO EDITAR */}
        
           
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center"
            style={{ color: "#ff9f43" }}>
          💰 Registro Rápido de Receita
        </h1>

        <div className="bg-gray-100 p-5 rounded-xl shadow flex flex-col gap-4"> 

        
           {/* Tipo */}
            <label className="label label-required font-bold text-[#1e40af]">
             Receitas (Entrada Meu negócio)
            </label>

            <div className="w-2/5">
              <select
                name="tipo"
                value={form.tipo}
                disabled
                className="input-premium bg-gray-200 text-gray-500 cursor-not-allowed"
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
               className="input-premium"
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
                   className="input-premium"
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

      
          </div>

      
           <label className="label label-required font-bold text-[#1e40af]">
              Forma de Pagamento
            </label>

            <select
              name="forma_pagamento"
              value={form.forma_pagamento}
              onChange={handleChange}
              className="input-premium w-2/5"
            >
              {FORMAS_PAGAMENTO.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
             


          {(form.forma_pagamento === "CREDITO" ||
                form.forma_pagamento === "FIADO") && (
                <div>
                  <label className="label label-required font-bold text-[#1e40af]">
                    Vencimento
                  </label>
                  <input
                    type="date"
                    name="vencimento"
                    value={form.vencimento}
                    onChange={handleChange}
                    className="input-premium w-2/5"
                  />
                </div>
              )}

              {form.forma_pagamento === "CREDITO" && (
                <div className="w-1/5">
                  <label className="label label-required">Parcelas</label>
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
              )}
 


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
              disabled={salvando}
              onClick={handleSalvar}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold
                ${salvando ? "bg-[#061f4aff] cursor-not-allowed" : "bg-blue-600 text-white"}
              `}
            >
              {salvando ? "Salvando..." : "Salvar"}
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
    </div>
  );
}
