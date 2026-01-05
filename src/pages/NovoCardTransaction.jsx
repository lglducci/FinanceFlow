import { useEffect, useState } from "react";
 
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal, dataLocal } from "../utils/dataLocal";


export default function NovoCardTransaction() {
  const navigate = useNavigate();

  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [listaCartoes, setListaCartoes] = useState([]);
  const [cartaoSelecionado, setCartaoSelecionado] = useState("");
  const [contas, setContas] = useState([]);

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    parcelas: 1,
    data_parcela: hojeLocal(),
  });

  // --------------------------
  // Carregar lista de cartões
  // --------------------------
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

  // --------------------------
  // Atualizar campos do form
  // --------------------------
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // --------------------------
  // Salvar transação
  // --------------------------
  const salvar = async () => {
    if (!cartaoSelecionado) {
      alert("Selecione um cartão.");
      return;
    }
    if (!form.descricao.trim()) {
      alert("Digite a descrição.");
      return;
    }
    if (!form.valor || parseFloat(form.valor) <= 0) {
      alert("Valor inválido.");
      return;
    }

    try {
      const url = buildWebhookUrl("novatranscartao");

      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_empresa: empresa_id,
          cartao_nome: cartaoSelecionado,
          descricao: form.descricao,
          valor_total: form.valor,
          parcelas: form.parcelas,
          data_compra: form.data_parcela,
          contabil_id:form.contabil_id
        }),
      });

      alert("Transação registrada com sucesso!");
      navigate(-1);

    } catch (error) {
      console.error(error);
      alert("Erro ao registrar transação.");
    }
  };


  useEffect(() => {
  async function carregarContas() {
    try {
      const resp = await fetch(
        "https://webhook-homolog.lglducci.com.br/webhook/contascontabilcartao?empresa_id=" +
          empresa_id,
      );

      const data = await resp.json();
      setContas(data);
    } catch (e) {
      console.error("Erro ao carregar contas contábeis", e);
    }
  }

  carregarContas();
}, [form.empresa_id]);


  return (
     <div className="min-h-screen py-8 px-4 bg-bgSoft"> 
      <div className="w-full max-w-4xl mx-auto rounded-xl p-6 shadow-xl bg-[#1e40af] text-blue">  
 
     <h2
          className="text-2xl md:text-3xl font-bold mb-6 text-center"
          style={{ color: "#ff9f43" }}
        >
          ✏️  Nova Transação de Cartão
        </h2>


     <div className="bg-gray-100 flex flex-col  gap-2  space-y-4 px-6"> 
      

      {/* Cartão */}
      <label className="block mb-1 text-base font-bold  text-[#1e40af]">Cartão</label>
      <select
          className= "border font-bold rounded px-2 py-2  w-[280px] mb-2 border-gray-300"
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

       {/* Data */}
      <label className="block mb-1 text-base font-bold  text-[#1e40af]">Data da Compra</label>
      <input
        type="date"
        name="data_parcela"
        value={form.data_parcela}
        onChange={handleChange}
             placeholder="data compra"
          className= "border font-bold rounded px-2 py-2  w-[280px] mb-2  border-gray-300"
      />

      
      {/* Parcelas */}
      <label className="block mb-1 text-base font-bold  text-[#1e40af]">Parcelas</label>
      <input
        type="number"
        name="parcelas"
        min="1"
        value={form.parcelas}
        onChange={handleChange}
          placeholder="parcela"
          className= "border font-bold rounded px-2 py-2  w-[280px] mb-2 border-gray-300"
      />

      {/* Valor */}
      <label className="block mb-1 text-base font-bold  text-[#1e40af]">Valor</label>
      <input
        type="number"
        name="valor"
        value={form.valor}
        onChange={handleChange}
          placeholder="valor"
          className= "border font-bold rounded px-2 py-2  w-[280px] mb-2 border-gray-300"
      />
 

      


      {/* Descrição */}
      <label className="block mb-1 text-base  font-bold  text-[#1e40af]">Descrição</label>
      <input
        type="text"
        name="descricao"
        value={form.descricao}
        onChange={handleChange}
        placeholder="descricao"
          className="border font-bold rounded px-2 py-2 w-42 mb-2 border-gray-300"
      />

          
      
           <div>
            
                <label className="font-bold text-[#1e40af] flex items-center gap-2">
                Conta Contábil *
                <span className="relative group cursor-pointer">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                    ?
                  </span>

                  {/* Tooltip */}
                  <div className="absolute left-6 top-0 z-50 hidden group-hover:block 
                                  bg-gray-900 text-white text-xs rounded-lg p-3 w-80 shadow-lg">
                    <strong>O que é este campo?</strong> 
                      <p className="mt-1">
                        Esta conta define <b>onde a fatura do cartão será registrada na contabilidade</b>.
                      </p> 
                      <p className="mt-1">
                        Normalmente representa o <b>passivo do cartão de crédito</b>
                        (ex: Cartão de Crédito a Pagar).
                      </p> 
                      <p className="mt-1 text-yellow-300">
                        ⚠ O custo ou despesa da compra já foi reconhecido no momento da compra.
                      </p> 
                      <p className="mt-1 text-yellow-300">
                        Aqui você está apenas controlando a <b>dívida do cartão</b>, não o custo.
                      </p>
                  </div>
                </span>
              </label>

            

            <select
              name="contabil_id"
              value={form.contabil_id || ""}
              onChange={handleChange}
              className="input-base w-full h-10"
            >
              <option value="">Selecione a conta contábil…</option>

              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} — {c.nome}
                </option>
              ))}
            </select>
          </div>





      {/* Botões */}

         <div className="flex gap-6 pt-8 pb-8 pl-1">   
        <button
            onClick={salvar}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-bold"
          >
            Salvar
          </button>
    
          <button
             onClick={() => navigate("/cartao-transacoes")}
            className="flex-1 bg-gray-400 text-white px-4 py-3 rounded-lg font-bold"
          >
            Cancelar
        </button>  
      </div> 

      </div>
     </div>
     </div>
  );
}
