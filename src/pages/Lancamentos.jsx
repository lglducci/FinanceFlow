   import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from '../config/globals';
import ModalBase from "../components/ModalBase";
import FormConta from "../components/forms/FormConta";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
 

export default function Lancamentos() {
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [total, setTotal] = useState(0);
  const [periodo, setPeriodo] = useState("mes");
  const [modalConta, setModalConta] = useState(false);
  
const [totalEntrada, setTotalEntrada] = useState(0);
const [totalSaida, setTotalSaida] = useState(0);
const [saldoInicial, setSaldoInicial] = useState(0);
const [saldoFinal, setSaldoFinal] = useState(0);
const [refreshKey, setRefreshKey] = useState(0);
 
 
const [contas, setContas] = useState([]);
const [loading, setLoading] = useState(false);

  const empresa_id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");
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

    setDataIni(  hojeMaisDias(-2));
    setDataFim(  hojeLocal());
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


 async function carregarContas() {
  try {
    const url = buildWebhookUrl("listacontas", { empresa_id });
    const resp = await fetch(url);
    const data = await resp.json();
    setContas(data);
  } catch (error) {
    console.error("Erro ao carregar contas:", error);
  }
}
useEffect(() => {
  carregarContas();
}, [empresa_id]);

 
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
          evento_codigo: l.evento_codigo,
          origem_id:l.origem_id
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

    function abrirNovaReceita() {
    navigate("/registrareceitarapida");
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

function calcularPeriodoDias(inicio, fim) {
  if (!inicio || !fim) return null;

  const d1 = new Date(inicio);
  const d2 = new Date(fim);

  const diffMs = d2.getTime() - d1.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  return diffDias > 0 ? diffDias : null;
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
  const sucesso = json?.[0]?.ok === true;
 
    if (sucesso) {
     //wait carregarSaldoConta(contaId);
        setRefreshKey(prev => prev + 1);
        alert("Lancamento estornado com sucesso!");
        return;
      }

    // Se não entrou no sucesso, então deu erro (provavelmente FK)
    alert(json[0]?.message || "Erro ao Estornar. Verifique vínculos (FK).");

  } catch (e) {
    console.log("ERRO Estornar:", e);
    alert("Erro ao estornar.");
  }
}

 useEffect(() => {
  if (refreshKey > 0) {
    pesquisar();
  }
}, [refreshKey]);

return (
  <div className="p-4 space-y-4">

    {/* HEADER */}
   <div className="flex justify-between items-start">
  <div>
    <h1 className="text-xl font-bold text-blue-800">Transações Financeiras</h1>
    <p className="text-sm text-gray-500">
      Consulte entradas e saídas financeiras com poucos cliques.
    </p>
  </div>

  <div className="flex gap-4 text-sm font-semibold">
         <p className="text-sm text-gray-500 mt-30">
      ℹ️ Transações já estornadas ou estornos não podem ser estornados novamente.
    </p>

   
     <button
      onClick={abrirNovoLancamento}
      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
    >
      + Novo lançamento
    </button>

      <button
      onClick={abrirNovaReceita}
       className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
    >
      💰 Nova receita
     </button>

    <a
      href="#"
      onClick={() => window.print()}
      className="text-gray-600 hover:text-gray-800"
    >
      🖨️ Imprimir
    </a>
  </div>
</div>


    {/* CARDS SUPERIORES */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* TOTAL DO PERÍODO */}
      <div className="bg-white rounded-xl p-4 border-l-4 border-blue-600 shadow-sm">
        <p className="text-sm text-gray-500">Resultado do período</p>
        <p className="text-2xl font-bold text-gray-900">
          {(totalEntrada - totalSaida).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
      </div>
       
       <div className="bg-white rounded-xl p-4 border-l-4 border-orange-400 shadow-sm">
            <p className="text-base text-gray-700">Período</p>

            {dataIni && dataFim ? (
              <p className="font-bold text-gray-800">
                Período de {calcularPeriodoDias(dataIni, dataFim)} dias
              </p>
            ) : (
              <p className="font-bold text-blue-800">
                Não selecionado
              </p>
            )}
          </div>


      {/* CONTA BANCÁRIA */}
      <div className="bg-white rounded-xl p-4 border-l-4 border-green-600 shadow-sm">
        <p className="text-sm text-gray-500">Conta bancária</p>

        {dadosConta ? (
          <>
            <p className="font-semibold text-gray-900">{dadosConta.conta_nome}</p>
            <p className="text-sm text-gray-600">
              Banco: {dadosConta.nro_banco ?? "-"} • Ag: {dadosConta.agencia ?? "-"}
            </p>
            <p className="text-sm font-semibold text-green-700 mt-1">
              Saldo:{" "}
              {Number(dadosConta.saldo_final).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400">Selecione uma conta</p>
        )}
      </div>
    </div>

    {/* FILTROS */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">

        <div>
          <label className="text-sm font-semibold text-gray-700">Data início</label>
          <input
            type="date"
            value={dataIni}
            onChange={(e) => setDataIni(e.target.value)}
            className="block border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Data fim</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="block border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Conta Bancária</label>
          <select
            value={contaId}
            onChange={(e) => {
                if (e.target.value === "__nova__") {
                  setModalConta(true);
                  return;
                }

                setContaId(e.target.value);
              }}
 
            
            className="block border rounded-lg px-3 py-2 text-sm"
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

        
       <button
          onClick={pesquisar}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm "
        >
          Pesquisar
        </button>

        
      </div>
    </div>

    {/* TABELA */}
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      {lista.length === 0 ? (
        <p className="p-4 text-sm text-gray-500">Nenhum lançamento encontrado.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
               <th className="px-3 py-2 text-left">id</th>
              <th className="px-3 py-2 text-left">Descrição</th>
              <th className="px-3 py-2 text-left">Categoria</th>
              <th className="px-3 py-2 text-left">Conta</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Data</th>
              <th className="px-3 py-2 text-right">Valor</th>
               <th className="px-3 py-2 text-right"> Id Estorno</th>
              <th className="px-3 py-2 text-center">Ações</th>
            </tr>
          </thead>

          <tbody>
            {lista.map((l, i) => (
              <tr key={l.id} className="border-t">
                 <td className="px-3 py-2 text-left font-bold">{l.id}</td>
                <td className="px-3 py-2 font-medium">{l.descricao}</td>
                <td className="px-3 py-2">{l.categoria_nome}</td>
                <td className="px-3 py-2">{l.conta_nome}</td>
                <td className={`px-3 py-2 font-semibold ${l.tipo === "Entrada" ? "text-green-600" : "text-red-600"}`}>
                  {l.tipo}
                </td>
                <td className="px-3 py-2">{l.data}</td>
                <td className="px-3 py-2 text-right font-semibold">{l.valor}</td>
                 <td className="px-3 py-2 text-right font-semibold">{l.origem_id}</td>
                <td className="px-3 py-2 text-center space-x-2">
                  <button
                    onClick={() => editarLancamento(l.id)}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Editar
                  </button>
                <button
                  onClick={() => l.origem_id == null && Estornar(l.id)}
                  disabled={l.origem_id != null}
                  title={l.origem_id != null ? "Esta transação já foi estornada." : ""}
                  className={`font-semibold ${
                    l.origem_id == null
                      ? "text-red-600 hover:underline"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
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

                    setContaId(String(conta.id));

                    setModalConta(false);
                  }}
              onCancel={() => setModalConta(false)}
            />
          </ModalBase>

  </div>
);

  
}