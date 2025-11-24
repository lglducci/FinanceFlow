 import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from '../config/globals';

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


 
const [contas, setContas] = useState([]);
const [loading, setLoading] = useState(false);

  const empresa_id = localStorage.getItem("empresa_id") || 1;
  const navigate = useNavigate();

  const [contaId, setContaId] = useState("");





  function aplicarPeriodo(tipo) {
    const hoje = new Date();
    let ini, fim;

    if (tipo === "mes") {
      ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      fim = new Date();
    } else if (tipo === "15") {
      ini = new Date();
      ini.setDate(hoje.getDate() - 15);
      fim = new Date();
    } else if (tipo === "semana") {
      ini = new Date();
      ini.setDate(hoje.getDate() - 7);
      fim = new Date();
    } else if (tipo === "hoje") {
      ini = new Date();
      fim = new Date();
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
    const url = buildWebhookUrl("consultasaldo", { 
      inicio: dataIni,
      fim: dataFim,
      empresa_id:empresa_id,
      conta_id:contaId,
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

// 👉 ADICIONE SÓ ISSO
 useEffect(() => {
  if (dataIni && dataFim) {
    carregar();
  }
}, [dataIni, dataFim, contaId]);



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
    setPeriodo("mes");
    aplicarPeriodo("mes");
  }, []);

  async function pesquisar() {
    if (!dataIni || !dataFim) {
      alert("Informe o período.");
      return;
    }

    setCarregando(true);
    try {
      const url = buildWebhookUrl('listalancamentos', {
        empresa_id: empresa_id,
        conta_id: contaId,
        data_ini: dataIni,
        data_fim: dataFim
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
          data: new Date(l.data_movimento).toLocaleDateString("pt-BR"),
          // *** Origem com primeira maiúscula ***
          origem: l.origem
            ? l.origem.charAt(0).toUpperCase() + l.origem.slice(1)
            : "-",
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Lançamentos</h2> 

      {/* FILTROS */}
      <div className="bg-white p-6 rounded-xl shadow mb-6 flex flex-col gap-6">

        {/* linha 1 - períodos */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold mb-1">Períodos</span>
            <div className="flex gap-4 text-sm flex-wrap">
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
        
        <div className="flex flex-wrap items-end gap-4">
        


            <div className="flex flex-col">
              <label className="text-base font-bold">Data início</label>
              <input
                type="date"
                value={dataIni}
                onChange={(e) => setDataIni(e.target.value)}
                className="border rounded-lg px-3 py-2 w-40 mt-1"
              />
            </div> 

          <div className="flex flex-col">
            <label className="text-base font-bold">Data fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border rounded-lg px-3 py-2 w-40 mt-1"
            />
          </div>


         <div className="flex flex-col">
            <label className="text- base font-bold">Conta</label>

            <select
              value={contaId}
              onChange={(e) => setContaId(e.target.value)}
              className="border rounded-lg px-3 py-2 w-40 mt-1"
            >
              {/* DEFAULT */}
              <option value="" disabled>Selecione</option>

              {/* LISTA DE CONTAS */}
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>




          <button
            onClick={pesquisar}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm w-32 text-center"
          >
            {carregando ? "Carregando..." : "Pesquisar"}
          </button>

          <button
            onClick={abrirNovoLancamento}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm w-32 text-center"
          >
            Novo
          </button>
        </div>
      </div>
  
       <div className="bg-white rounded-xl shadow p-4">
  
          {/* TOTAIS EM 3 COLUNAS */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-5 gap-4">

                     {/* SALDO INICIAL */}
                <div className="bg-white shadow rounded-lg p-4 border-l-4 border-gray-600">
                  <div className="text-sm font-semibold text-gray-600">Saldo Inicial</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {saldoInicial.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                </div>

            {/* ENTRADAS */}
            <div className="bg-white shadow rounded-lg p-4 border-l-4 border-green-600">
              <div className="text-sm font-semibold text-gray-600">Total Entradas</div>
              <div className="text-2xl font-bold text-green-700">
                {totalEntrada.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>

            {/* SAÍDAS */}
            <div className="bg-white shadow rounded-lg p-4 border-l-4 border-red-600">
              <div className="text-sm font-semibold text-gray-600">Total Saídas</div>
              <div className="text-2xl font-bold text-red-700">
                {totalSaida.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div> 

             {/* SALDO FINAL */}
                <div className="bg-white shadow rounded-lg p-4 border-l-4 border-gray-800">
                  <div className="text-sm font-semibold text-gray-600">Saldo Atual</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {saldoFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                </div>

                 {/* RESULTADO LÍQUIDO */}
              <div className={`bg-white shadow rounded-lg p-4 border-l-4
                ${ (totalEntrada - totalSaida) >= 0 ? "border-green-600" : "border-red-600" }
              `}>
                <div className="text-sm font-semibold text-gray-600">Resultado Líquido</div>
                <div className={`text-2xl font-bold 
                  ${ (totalEntrada - totalSaida) >= 0 ? "text-green-700" : "text-red-700" }
                `}>
                  {(totalEntrada - totalSaida).toLocaleString("pt-BR", { 
                    style: "currency", 
                    currency: "BRL" 
                  })}
                </div>
          </div>
           
             

                





          </div> 


  {/* TABELA */}
  <table className="w-full text-sm">
    ...
  </table>

</div> 

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow p-4">
        {lista.length === 0 ? (
          <p className="text-gray-600 text-sm">Nenhum lançamento encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-blue-300 text-base">
                <th className="text-left py-2 px-2 w-10">ID</th>
                <th className="text-left py-2 px-2 w-64">Descrição</th>
                <th className="text-left py-2 px-2 w-32">Categoria</th>
                <th className="text-left py-2 px-2 w-32">Conta</th>
                <th className="text-left py-2 px-2 w-20">Tipo</th>
                <th className="text-left py-2 px-2 w-24">Data</th>
                <th className="text-left py-2 px-2 w-24">Origem</th>

                {/* Valor mais para esquerda */}
                <th className="text-right py-2 px-1 w-20">Valor</th>
              </tr>
            </thead>

            <tbody>
              {lista.map((l, i) => (
                <tr
                  key={l.id}
                  className={i % 2 === 0 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6]"}
                >

                  {/* ID como link */}
                  <td className="py-2 px-2">
                    <button
                      onClick={() => editarLancamento(l.id)}
                      className="text-blue-600 hover:underline font-bold"
                    >
                      {l.id}
                    </button>
                  </td>

                  <td className="px-2 font-semibold truncate max-w-xs">{l.descricao}</td>
                  <td className="px-2">{l.categoria_nome}</td>
                  <td className="px-2">{l.conta_nome}</td> 
                       
                  <td
                    className={
                      "px-2 font-bold " +
                      (l.tipo === "Entrada" ? "text-green-600" : "text-red-600")
                    }
                  >
                    {l.tipo}
                  </td> 
                  <td className="px-2">{l.data}</td>
                  <td className="px-2">{l.origem}</td>
                 
                  <td
                    className={
                      "px-1 text-right font-bold " +
                      (l.tipo === "Entrada" ? "text-green-600" : "text-red-600")
                    }
                  >{l.valor}</td>  

                </tr> 
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
