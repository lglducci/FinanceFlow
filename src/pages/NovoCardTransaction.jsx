import { useEffect, useState } from "react";
 
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal, dataLocal } from "../utils/dataLocal";
import ModalBase from "../components/ModalBase";
import FormCartaoModal from "../components/forms/FormCartaoModal";
import { postWebhook } from "../utils/api";

export default function NovoCardTransaction() {
  const navigate = useNavigate();

  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [listaCartoes, setListaCartoes] = useState([]);
  const [cartaoSelecionado, setCartaoSelecionado] = useState("");
  const [contas, setContas] = useState([]);
 const [modalCartao, setModalCartao] = useState(false);
  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    parcelas: 1,
    data_parcela: hojeLocal(),
    classificacao:""
                    

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

    if (!form.classificacao) {
  alert("Selecione a classificação.");
  return;
}

  try {
  await postWebhook("novatranscartao", {
    empresa_id: empresa_id,
    cartao_nome: cartaoSelecionado,
    descricao: form.descricao,
    valor_total: form.valor,
    parcelas: form.parcelas,
    data_compra: form.data_parcela,
    contabil_id: form.contabil_id,
    classificacao: form.classificacao
  });

  alert("Transação registrada com sucesso!");
     window.dispatchEvent(new Event("contabil-atualizado"));
  navigate(-1);

} catch (err) {
  alert(err.message);
}
  };

 useEffect(() => {
  async function carregarContas() {
    try {
      const url = buildWebhookUrl("contascontabilcartao", {
        empresa_id: empresa_id
      });

      const resp = await fetch(url);
      const data = await resp.json();

      setContas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Erro ao carregar contas contábeis", e);
    }
  }

  carregarContas();
}, []); // executa uma vez

 
 

  return (
      <div className="min-h-screen py-6 px-4 bg-bgSoft">
        <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#061f4aff]   mt-1 mb-1" >
     <h2
          className="text-2xl md:text-3xl font-bold mb-6 text-center"
          style={{ color: "#ff9f43" }}
        >
          ✏️  Nova Transação de Cartão
        </h2>


     <div className="bg-gray-100 flex flex-col  gap-2  px-3"> 
      
       
      {/* Cartão */}
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

       {/* Data */}
      <label className="block mb-1 text-base font-bold  text-[#1e40af] label label-required">Data da Compra</label>
      <input
        type="date"
        name="data_parcela"
        value={form.data_parcela}
        onChange={handleChange}
         placeholder="data compra"
           className="input-premium"
      />
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mt-3">

                {/* PARCELAS */}
                <div>
                  <label className="label label-required">
                    Parcelas
                  </label>
                  <input
                    type="number"
                    name="parcelas"
                    min="1"
                    value={form.parcelas}
                    onChange={handleChange}
                    placeholder="Qtd"
                    className="input-premium w-full h-8"
                  />
                </div>

                {/* VALOR */}
                <div>
                  <label className="label label-required">
                    Valor
                  </label>
                  <input
                    type="number"
                    name="valor"
                    value={form.valor}
                    onChange={handleChange}
                    placeholder="0,00"
                    className="input-premium w-full h-8"
                  />
                </div>

                {/* CLASSIFICAÇÃO */}
                <div>
                  <label className="label label-required">
                    Classificação
                  </label>
                  <select
                    name="classificacao"
                    value={form.classificacao}
                    onChange={handleChange}
                    className="input-premium w-full h-8 appearance-none"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="despesa">Despesa</option>
                    <option value="custo">Custo de Mercadoria / Insumo</option>
                    <option value="imobilizado">Aquisição de Imobilizado</option>
                  </select>
                </div>

              </div>
           
           
                       {/* Descrição */}
            <label className="block mb-1 text-base  font-bold  text-[#1e40af] label label-required mt-4 ">Descrição</label>
            <input
              type="text"
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              placeholder="descricao"
              className="input-premium"
              rows={3}
            /> 
             <div className="hidden"> 
                <label className="font-bold text-[#1e40af] flex items-center gap-2 label label-required">
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
            className="flex-1 bg-[#061f4aff] text-white px-4 py-3 rounded-lg font-bold"
          >
            Salvar
          </button>
    
          <button
             onClick={() => navigate("/cartao-transacoes")}
            className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-lg font-bold"
          >
            Cancelar
        </button>  
      </div> 

      </div>
     </div>

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
