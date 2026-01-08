  import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from '../config/globals';

import { hojeLocal, dataLocal } from "../utils/dataLocal";
 

export default function Lancamentos() {
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [total, setTotal] = useState(0);
  const [periodo, setPeriodo] = useState("mes");

  
const [totalEntrada, setTotalEntrada] = useState(0);
const [totalSaida, setTotalSaida] = useState(0);
const [saldoInicial, setSaldoInicial] = useState(0);
const [saldoFinal, setSaldoFinal] = useState(0);
 
 
const [contas, setContas] = useState([0]);
const [loading, setLoading] = useState(false);

  const empresa_id = localStorage.getItem("empresa_id") || 1;
  const navigate = useNavigate();

  const [contaId, setContaId] = useState("");
  const [dadosConta, setDadosConta] = useState(null);
  const [categoriaId, setCategoriaId] = useState("");
const [fornecedorId, setFornecedorId] = useState("");

const [categorias, setCategorias] = useState([]);
const [fornecedores, setFornecedores] = useState([]);
  const btnPadrao = "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";


 function formatarDataBR(data) {
  if (!data) return "-";

  // força yyyy-mm-dd
  const [ano, mes, dia] = data.split("T")[0].split("-");

  return `${dia}/${mes}/${ano}`;
}


  // ------------------- CARREGAR SALDO DA CONTA -------------------
  async function carregarSaldoConta(id_conta) {
    const hoje = new Date().toISOString().split("T")[0];

    const url = buildWebhookUrl("consultasaldo", {
      inicio: hoje,
      fim: hoje,
      empresa_id,
      conta_id: id_conta,
    });

    const resp = await fetch(url);
    const json = await resp.json();
    setDadosConta(json[0]);
  }
  
  async function Estornar(id) {
   if (!confirm("Tem certeza que deseja estornar este lancamento?")) return;

  try {
    const url = buildWebhookUrl("estornarlancto");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa_id, id }),
    });

    const texto = await resp.text();
    console.log("RETORNO:", texto);

    let json = {};
    try { json = JSON.parse(texto); } catch {}

    // 🔥 TRATAMENTO CORRETO DO SEU FORMATO
   const sucesso =
  Array.isArray(json) &&
  json.length > 0 &&
  (json[0].success === true || json[0].ff_estornar_transacao === "sucesso");


    if (sucesso) {
      alert("Lancamento estornado com sucesso!");

      // remove visualmente da tela ANTES de recarregar do backend
        setLista((prev) => prev.filter((x) => x.id !== id));
      
        // depois recarrega real do webhook
        setTimeout(() => carregarLista(), 150);
     {/*} carregarLista();  // atualiza tabela*/}
           carregarSaldoConta(contaId);  // 🔥 Atualiza dados da conta
          pesquisar();   // <-- AQUI!!!

      return;
    }

    // Se não entrou no sucesso, então deu erro (provavelmente FK)
    alert(json[0]?.message || "Erro ao Estornar. Verifique vínculos (FK).");

  } catch (e) {
    console.log("ERRO Estornar:", e);
    alert("Erro ao estornar.");
  }
}


  function aplicarPeriodo(tipo) {
    const hoje = new Date( hojeLocal() ); 
    let ini, fim;

    if (tipo === "mes") {
      ini = new Date(hoje.getFullYear(), hoje.getMonth()-1, hoje.getDay());
      fim = new Date( hojeLocal() );
    } else if (tipo === "15") {
      ini = new Date( hojeLocal() );
      ini.setDate(hoje.getDate() - 15);
      fim = new Date( hojeLocal() );
    } else if (tipo === "semana") {
      ini = new Date( hojeLocal() );
      ini.setDate(hoje.getDate() - 7);
      fim = new Date( hojeLocal() );
    } else if (tipo === "hoje") {
      ini = new Date( hojeLocal() );
      fim = new Date( hojeLocal() );
    } else {
      setDataIni("");
      setDataFim("");
      return;
    }

    setDataIni(ini.toISOString().substring(0, 10));
    setDataFim(fim.toISOString().substring(0, 10));
  }

  function handlePeriodoChange(tipo) {
    if (periodo === tipo) {
      setPeriodo("");
      setDataIni("");
      setDataFim("");
    } else {
      setPeriodo(tipo);
      aplicarPeriodo(tipo);
    }
  }
   
   
 const carregar = async () => {
  try {
      const idConta = contaId === "" ? 0 : Number(contaId);
    const url = buildWebhookUrl("consultasaldo", { 
      inicio: dataIni,
      fim: dataFim,
      empresa_id:empresa_id,
      conta_id:idConta,
    });

    const resp = await fetch(url, { method: "GET" });

    if (!resp.ok) {
      console.log("ERRO STATUS:", resp.status);
      return;
    }

    const data = await resp.json();

    let ini = 0;
    let fim = 0;

    data.forEach(c => {
      ini += Number(c.saldo_inicial || 0);
      fim += Number(c.saldo_final || 0);
    });

    setSaldoInicial(ini);
    setSaldoFinal(fim);

  } catch (e) {
    console.log("ERRO FETCH:", e);
  }
};

{/*} 👉 ADICIONE SÓ ISSO
 useEffect(() => {
  if (dataIni && dataFim) {
    carregar();
    pesquisar();     // lançamentos
  }
}, [dataIni, dataFim, contaId]);*/}



 useEffect(() => {
     

    const carregarContas = async () => {
      try {
        const url = buildWebhookUrl("listacontas", { empresa_id });
        const resp = await fetch(url);
        const data = await resp.json();
        setContas(data);
      } catch (error) {
        console.error("Erro ao carregar contas:", error);
      }
    }; 
    carregarContas();
    
  }, [empresa_id]);
  // ⭐ AQUI EMBAIXO
      useEffect(() => {
        if (contas.length > 0 && !contaId) {
          setContaId(contas[0].id);
        }
      }, [contas]);


      useEffect(() => {
  if (contaId) {
    carregarSaldoConta(contaId);
  }
}, [contaId]);


  useEffect(() => {
    setPeriodo("mes");
    aplicarPeriodo("mes");
  }, []);

  async function pesquisar() {
    if (!dataIni || !dataFim) {
      alert("Informe o período.");
      return;
    }
     await carregar(); // <-- Atualiza SALDO aqui e somente aqui
    setCarregando(true);
    try {
      const url = buildWebhookUrl('listalancamentos', { 
        empresa_id: empresa_id,
          conta_id: Number(contaId) || 0,
        data_ini: dataIni,
        data_fim: dataFim,
        categoria_id: Number(categoriaId) || 0,
        fornecedor_id: Number(fornecedorId) || 0
      });

      const resp = await fetch(url);
      const dados = await resp.json();
      
      let soma = 0;
      let somaEntrada = 0;
      let somaSaida = 0;

      const tratados = dados.map((l) => {
        const valorNum = Number(l.valor || 0);

            if (l.tipo === "entrada") {
              somaEntrada += valorNum;
            } else {
              somaSaida += valorNum;
            }
        soma += Number(l.valor || 0);
        
        
        return {
          id: l.id,
          descricao: l.descricao,
          tipo: l.tipo === "entrada" ? "Entrada" : "Saída",
          categoria_nome: l.categoria_nome || "-",
          conta_nome: l.conta_nome || "-",
          valor: Number(l.valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          // *** AQUI: sempre a data EXATA do banco ***
          data: formatarDataBR(l.data_movimento),
          // *** Origem com primeira maiúscula ***
          origem: l.origem
            ? l.origem.charAt(0).toUpperCase() + l.origem.slice(1)
            : "-",
          evento_codigo: l.evento_codigo
        };
      });
       //  ✔️ EXATAMENTE AQUI  
       setTotalEntrada(somaEntrada);
      setTotalSaida(somaSaida);

      setLista(tratados);
      setTotal(soma);
       
    } catch (e) {
      console.error(e);
      alert("Erro ao consultar lançamentos.");
    }
    setCarregando(false);
  }   

  function abrirNovoLancamento() {
    navigate("/new-transaction");
  }

  function editarLancamento(id) {
    navigate("/editar-lancamento", {
      state: { id_lancamento: id, empresa_id: empresa_id }
    });
  }

  async function carregarFornecedores() {
  try {
    const url = buildWebhookUrl("fornecedorcliente", {
      empresa_id,     tipo: "ambos"
      // SEM tipo → backend retorna todos
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

async function carregarCategorias() {
  try {
    const url = buildWebhookUrl("listacategorias", {
      empresa_id , tipo:''
      // SEM tipo → traz entrada + saída
    });

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

useEffect(() => {
  carregarFornecedores();
  carregarCategorias();
}, [empresa_id]);


  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Lançamentos</h2> 

      {/* FILTROS   */}


      <div className="mb-2 grid grid-cols-1 lg:grid-cols-1 gap-4"> 
      
      <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-blue-800 mb-2"> 
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2">

    {/* COLUNA 1 - FILTROS  
    <div className="bg-gray-100 p-6 rounded-xl shadow border-[1px] border-gray-300">*/}
       <div className="bg-gray-100 rounded-xl shadow p-2 border w-full h-fit">

        {/* linha 1 - períodos */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col">
            <span className="text-base font-bold mb-1 text-[#1e40af]">Períodos</span>

            <div className="flex gap-4 text-base font-bold flex-wrap text-[#1e40af]">
              {["mes", "15", "semana", "hoje"].map((tipo) => (
                <label key={tipo}>
                  <input
                    type="checkbox"
                    checked={periodo === tipo}
                    onChange={() => handlePeriodoChange(tipo)}
                    className="mr-1"
                  />
                  {tipo === "mes"
                    ? "Mês"
                    : tipo === "15"
                    ? "Últimos 15 dias"
                    : tipo === "semana"
                    ? "Semana"
                    : "Hoje"}
                </label>
              ))}
            </div>

          </div>
        </div>

        {/* linha 2 */}
        <div className="bg-gray-100 shadow rounded-lg p-4 border-l-4 border-gray-300 mt-4">

            <div className="flex flex-wrap items-end gap-4">

                <div className="flex flex-col">
                    <label className="font-bold text-base block mb-1 text-[#1e40af]">Data início</label>
                    <input
                      type="date"
                      value={dataIni}
                      onChange={(e) => setDataIni(e.target.value)}
                      className="border rounded-lg px-3 py-2 w-40 mt-1 border-yellow-500"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="font-bold text-base block mb-1 text-[#1e40af]">Data fim</label>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="border rounded-lg px-3 py-2 w-40 mt-1 border-yellow-500"
                    />
                </div>

                <div className="flex flex-col">
                  <label className="font-bold text-base block mb-1 text-[#1e40af]">Conta</label>
                    <select
                      value={contaId}
                      onChange={(e) => setContaId(Number(e.target.value))}
                      className="border rounded-lg px-3 py-2 w-40 mt-1 border-yellow-500"
                    >
                      <option value={0}>Todas</option>
                      {contas.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                </div>


                              {/* CATEGORIA */}
                <div className="flex flex-col">
                  <label className="font-bold text-base block mb-1 text-[#1e40af]">Categoria</label>
                  <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className="border rounded-lg px-3 py-2 w-48 mt-1 border-yellow-500"
                  >
                    <option value="">Todas</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

               



                <button
                  onClick={pesquisar}

                    className= { `${btnPadrao} bg-blue-600 hover:bg-blue-700`}
                  //className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm w-32"
                >
                  {carregando ? "Carregando..." : "Pesquisar"}
                </button>

                <button
                  onClick={abrirNovoLancamento}
                 // className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm w-32"
                    className= { `${btnPadrao} bg-green-600 hover:bg-green-700`}
                >
                  Novo
                </button>
                

                 <button
                  onClick={() => window.print()}
                 // className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold"
                   className= { `${btnPadrao} bg-gray-600 hover:bg-gray-700`}
                >
                 
                  🖨️ Imprimir
                </button>


            </div>
        </div>

    </div>

   

    {/* COLUNA 2 - DADOS DA CONTA */}
    <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-900 h-fit">

        {dadosConta && (
          <>
            <h3 className="font-bold text-lg text-blue-700 mb-2">
              🏦 {dadosConta.conta_nome}
            </h3>

            <p><strong>Banco:</strong> {dadosConta.nro_banco ?? "-"}</p>
            <p><strong>Agência:</strong> {dadosConta.agencia ?? "-"}</p>
            <p><strong>Conta:</strong> {dadosConta.conta ?? "-"}</p>
            <p><strong>Conjunta:</strong> {dadosConta.conjunta ? "Sim" : "Não"}</p>
            <p><strong>Jurídica:</strong> {dadosConta.juridica ? "Sim" : "Não"}</p>

            <p className="text-green-700 font-bold text-lg mt-3">
              Saldo final: R$
              {Number(dadosConta.saldo_final).toLocaleString("pt-BR")}
            </p>
          </>
        )}

    </div>
</div>
</div>
</div>

    <div id="print-area">   
       <div className="bg-white  rounded-xl shadow p-2 h-fit">
  
          {/* TOTAIS EM 3 COLUNAS */} 
 
     <div className="mb-2 grid grid-cols-1 lg:grid-cols-6 gap-4">

  {/* 5 colunas de totais */}
  <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-5 gap-4">

    {/* SALDO INICIAL */}
    <div className="bg-gray-200 shadow rounded-lg p-2 border-l-4 border-gray-600">
      <div className="text-sm font-bold text-gray-600">Saldo Inicial</div>
      <div className="text-2xl font-bold text-gray-800">
        {saldoInicial.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </div>
    </div>

    {/* ENTRADAS */}
    <div className="bg-gray-200 shadow rounded-lg p-2 border-l-4 border-green-600">
      <div className="text-sm font-bold text-gray-600">Total Entradas</div>
      <div className="text-2xl font-bold text-green-700">
        {totalEntrada.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </div>
    </div>

    {/* SAÍDAS */}
    <div className="bg-gray-200 shadow rounded-lg p-2 border-l-4 border-red-600">
      <div className="text-sm font-bold text-gray-600">Total Saídas</div>
      <div className="text-2xl font-bold text-red-700">
        {totalSaida.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </div>
    </div>

      {/* SALDO FINAL */}
      <div className="bg-gray-200 shadow rounded-lg p-2 border-l-4 border-gray-800">
        <div className="text-sm font-bold text-gray-600">Saldo Atual</div>
        <div className="text-2xl font-bold text-gray-900">
          {saldoFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </div>
      </div>

    {/* RESULTADO */}
    <div className={`bg-gray-200 shadow rounded-lg p-2 border-l-4
        ${(totalEntrada - totalSaida) >= 0 ? "border-green-600" : "border-red-600"}
    `}>
      <div className="text-sm font-semibold text-gray-600">Resultado Líquido</div>
      <div className={`text-2xl font-bold 
          ${(totalEntrada - totalSaida) >= 0 ? "text-green-700" : "text-red-700"}
      `}>
        {(totalEntrada - totalSaida).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </div>
    </div>

  </div> 
</div>


  {/* TABELA */} 
  <table className="w-full text-sm">
  
  </table>
</div>

      {/* TABELA  
      
      <div className="bg-white rounded-xl shadow p-4">* 
       <div className="bg-gray-300 p-4 rounded-xl shadow">*/}
           <div className="bg-gray-200 p-4 rounded-xl shadow border-[4px] border-gray-500"> 
        {lista.length === 0 ? (
          <p className="text-gray-600 text-base">Nenhum lançamento encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-blue-900 text-base text-white">
                <th className="text-left py-2 px-2 w-10 text-base">ID</th>
                <th className="text-left py-2 px-2 w-64 text-base">Descrição</th>
                <th className="text-left py-2 px-2 w-32 text-base">Categoria</th>
                <th className="text-left py-2 px-2 w-32 text-base">Conta</th>
                <th className="text-left py-2 px-2 w-20 text-base">Tipo</th>
                <th className="text-left py-2 px-2 w-24 text-base">Data</th>
                <th className="text-left py-2 px-2 w-24 text-base">Origem</th>

                {/* Valor mais para esquerda */}
                <th className="text-right py-2 px-1 w-20 text-base">Valor</th>
                

                 {/* 👉 ADICIONE ESTA LINHA */}
                 <th className="text-center py-2 px-2 w-24 text-base">Ação</th>
   
              </tr>

              
          

            </thead>

           <tbody>
              {lista.map((l, i) => (
                
                <tr
                  key={l.id}
                  className={i % 2 === 0 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6]"}
                >

                  {/* REMOVE COMPLETAMENTE A COLUNA DO ID */}
                <td className="px-3 font-bold ">{l.id}</td>
                  <td className="px-3 font-bold truncate max-w-xs text-base ">{l.descricao}</td>
                  <td className="px-3 font-semibold text-sm ">{l.categoria_nome}</td>
                  <td className="px-3 font-bold text-base">{l.conta_nome}</td>

                  <td
                    className={
                      "px-3 font-bold  text-base" +
                      (l.tipo === "Entrada" ? "text-green-600" : "text-red-600")
                    }
                  >
                    {l.tipo}
                  </td>

                  <td className="px-3 font-bold text-base">{l.data}</td>
                  <td className="px-3 font-bold text-base">{l.origem}</td>

                  <td
                    className={
                      "px-3 text-right font-bold text-base" +
                      (l.tipo === "Entrada" ? "text-green-600" : "text-red-600")
                    }
                  >
                    {l.valor}
                  </td>
 
                  
                  {/* AÇÕES */}
                  <td className="px-3 py-1 text-center space-x-4">

                    {/* EDITAR */}
                    <button
                      onClick={() => editarLancamento(l.id)}
                      className={
                          String(l.origem).trim().toUpperCase() === 'ESTORNO' 
                            ? 'text-gray-400 underline font-bold cursor-not-allowed'
                            : 'text-blue-600 underline font-bold'
                        }
                        disabled={
                                String(l.origem).trim().toUpperCase() === 'ESTORNO' 
                              }

                    >
                      Editar
                    </button>

                    {/* ESTORNAR */}
                    <button  
                      onClick={() => Estornar(l.id)}
                     className={
                        String(l.origem).trim().toUpperCase() === 'ESTORNO' 
                          ? 'text-gray-400 underline font-bold cursor-not-allowed'
                          : 'text-red-600 underline font-bold'
                      }
                         disabled={
                            String(l.origem).trim().toUpperCase() === 'ESTORNO' 
                          }

                    >
                      Estornar
                    </button>
                     

                  </td>
                </tr>
              ))}
            </tbody>

             

             
          </table>
        )}
      </div>
    </div>
     </div>
  );
}