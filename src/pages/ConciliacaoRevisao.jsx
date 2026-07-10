  import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { fetchSeguro } from "../utils/apiSafe";
import ModalBase from "../components/ModalBase";
import FormContaContabilModal from "../components/forms/FormContaContabilModal";
import PagamentosBaixados from "./PagamentosBaixados";


export default function ConciliacaoRevisao() {
  const empresa_id = localStorage.getItem("empresa_id");
  const conta_id = localStorage.getItem("conta_id");

  const [linhas, setLinhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aviso, setAviso] = useState("");
const navigate = useNavigate();
  const [selecionados, setSelecionados] = useState([]);
 // const [resultadoExecucao, setResultadoExecucao] = useState(() => {
  //const salvo = localStorage.getItem("resultado_conciliacao");
  //return salvo ? JSON.parse(salvo) : null;
 //});
// Reclassificacao de conta contabil
 //const [contas, setContas] = useState([]);
const [contasFiltradas, setContasFiltradas] = useState([]);
const [linhaContaNova, setLinhaContaNova] = useState(null);
const [modalContaAberto, setModalContaAberto] = useState(false);

const [linhaContaDropdown, setLinhaContaDropdown] = useState(null);
const [textoContaBusca, setTextoContaBusca] = useState({});
const [contasFiltradasContabil, setContasFiltradasContabil] = useState([]);

const [modalAjudaAberto, setModalAjudaAberto] = useState(false);

// Reclassificacao de conta contabil
const [contasContabeis, setContasContabeis] = useState([]);


const mensagensPainel = [
  "Analise o extrato  ➜  Classifique com aconta contábil  ➜  1) Selecione  2) Aceite  3) Execute",
  "Filtre registros parecidos e aplique a mesma conta contábil em lote",
  "Revise transferências entre contas antes de executar a conciliação",
  "Use rejeitar apenas quando o lançamento não deve entrar no financeiro",
  "Depois de executar, confira transações geradas e pagamentos baixados",
  "Faça na sequência  ➜  1) Selecionar 2) Aceitar  3) Executar"
];


 const [resultadoExecucao, setResultadoExecucao] = useState(null);
const [operacoesGeradas, setOperacoesGeradas] = useState([]);
const [mostrarOperacoes, setMostrarOperacoes] = useState(false);
const [loadingOperacoes, setLoadingOperacoes] = useState(false);

 
 const [contas, setContas] = useState([]);
const [linhaEditando, setLinhaEditando] = useState(null);
const [contaOrigemId, setContaOrigemId] = useState("");
const [contaDestinoId, setContaDestinoId] = useState("");
 
const [importacaoId, setImportacaoId] = useState(0);
 const [filtroSituacao, setFiltroSituacao] = useState("todos");
 
const [contaLoteSelecionada, setContaLoteSelecionada] = useState(null);


 const linhasFiltradas =
  filtroSituacao === "rejeitado"
    ? linhas.filter((l) => l.situacao === "rejeitado")
    : filtroSituacao === "pendente"
      ? linhas.filter((l) => l.situacao === "pendente")
      : filtroSituacao === "ok"
        ? linhas.filter((l) => l.situacao === "ok")
        : filtroSituacao === "sem_conta"
          ? linhas.filter(
              (l) =>
                l.importar !== false &&
                l.situacao !== "rejeitado" &&
                l.tipo_evento !== "transf_mesma_tit" &&
                !l.conta_id &&
                !l.conta_descricao
            )
          : linhas;


const [modalPagamentosAberto, setModalPagamentosAberto] = useState(false);
const [lotePagamentos, setLotePagamentos] = useState(null);



 
const [textoContaLote, setTextoContaLote] = useState("");
const [contasLoteFiltradas, setContasLoteFiltradas] = useState([]);
const [filtroTexto, setFiltroTexto] = useState("");

const linhasFiltradasComTexto = linhasFiltradas.filter((l) => {
  const texto = filtroTexto.toLowerCase().trim();

  if (!texto) return true;

  return (
    String(l.historico || "").toLowerCase().includes(texto) ||
    String(l.tipo_evento || "").toLowerCase().includes(texto) ||
    String(l.conta_descricao || "").toLowerCase().includes(texto)
  );
});


function filtrarContasLote(texto) {
  const t = String(texto || "").toLowerCase();

  const lista = contasContabeis
    .filter((c) =>
      String(c.codigo || "").toLowerCase().includes(t) ||
      String(c.nome || "").toLowerCase().includes(t) ||
      String(c.apelido || "").toLowerCase().includes(t)
    )
    .slice(0, 12);

  setContasLoteFiltradas(lista);
}

 

  async function carregarDados() {
    try {
      setLoading(true);

      const url = buildWebhookUrl("dados_importados", {
        empresa_id,
        conta_id,
       lote_id:0 
      });

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const retorno = await resp.json();   

 const lista =
  Array.isArray(retorno?.[0]?.data)
    ? retorno[0].data
    : Array.isArray(retorno?.data)
      ? retorno.data
      : Array.isArray(retorno?.[0])
        ? retorno[0]
        : Array.isArray(retorno)
          ? retorno
          : [];

setLinhas(lista);

if (lista.length > 0) {
  setImportacaoId(lista[0].lote_conciliacao_id || 0);
} else {
  setImportacaoId(0);
}


    } catch (e) {
  console.error(e);
  setLinhas([]);
} finally {
  setLoading(false);
}
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function statusClasse(situacao) {
    if (situacao === "ok") {
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    }

    return "bg-red-100 text-red-700 border-red-300";
  }


  function toggleSelecionado(id) {
  setSelecionados((prev) =>
    prev.includes(id)
      ? prev.filter((x) => x !== id)
      : [...prev, id]
  );
}
 
 async function aceitarSelecionados(idsParam = null, rejeitado = 0, tipo_evento = "") {
  const idsParaEnviar = Array.isArray(idsParam)
    ? idsParam
    : idsParam
      ? [idsParam]
      : selecionados.filter((id) => {
          const linha = linhas.find((l) => Number(l.id) === Number(id));
          return linha && linha.situacao === "pendente" && linha.importar !== false;
        });

      

  if (idsParaEnviar.length === 0) {
    alert("Selecione ao menos uma linha.");
    return;
  }

  const idsNumeros = idsParaEnviar.map(Number);

  // AVISO ESPECIAL PARA POSSÍVEL TRANSFERÊNCIA MESMA TITULARIDADE
  if ( rejeitado === 1 &&
    tipo_evento === "transf_mesma_tit"
  ) {
    const confirma = confirm(
      "Este lançamento parece ser uma transferência de mesma titularidade.\n\n" +
      "Confirma que NÃO é transferência de mesma titularidade e deseja aceitar mesmo assim?"
    );

    if (!confirma) return;
  }

  const url = buildWebhookUrl("aceitar_conciliacao", {
    empresa_id,
    conta_id,
  });

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empresa_id: Number(empresa_id),
      conta_id: Number(conta_id),
      ids: idsNumeros,
    }),
  });

  setLinhas((prev) =>
    prev.map((l) =>
      idsNumeros.includes(Number(l.id))
        ? {
            ...l,
            situacao: "ok",
            mensagem: "Aceito manualmente pelo usuário",
          }
        : l
    )
  );

  setSelecionados([]);
  //setMostrarPendentes(false);
//setMostrarRejeitados(false);
}

 async function executarConciliacao() {
  if (!confirm("Confirma executar a conciliação das linhas marcadas como OK?")) {
    return;
  }

  try {
    const url = buildWebhookUrl("execucao_conciliacao", {
      empresa_id,
      conta_id,
    });

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: Number(empresa_id),
        conta_id: Number(conta_id),
        importacao_id:importacaoId
      }),
    });

    const retorno = await resp.json();

const bruto = Array.isArray(retorno) ? retorno[0] : retorno;

if (!resp.ok || bruto?.ok === false || Number(bruto?.responseCode || 0) >= 400) {
  throw new Error(
    bruto?.message ||
    bruto?.details ||
    "Erro ao executar conciliação."
  );
}

const resultado =
  bruto?.data?.[0]?.fn_executar_conciliacao ||
  bruto?.data?.fn_executar_conciliacao ||
  bruto?.fn_executar_conciliacao ||
  bruto?.data ||
  bruto;

if (resultado?.ok === false) {
  throw new Error(resultado.message || "Erro ao executar conciliação.");
}

    

   setResultadoExecucao(resultado);  
   setLinhas([]);
    setSelecionados([]);
      await verOperacoesGeradas(resultado.lote_conciliacao_id);

   } catch (e) {
  console.error(e);
  alert(e.message || "Erro ao executar conciliação.");
}
}

function aceitarTodosCheckbox() {
  const pendentes = linhas.filter(
    (l) => l.situacao !== "ok" && l.situacao !== "executado" && l.importar !== false
  );

  if (pendentes.length === 0) {
    setAviso("Não há linhas pendentes para selecionar.");
    setTimeout(() => setAviso(""), 10000);
    return;
  }

  setSelecionados(pendentes.map((l) => l.id));

  setAviso(
    `Atenção: ${pendentes.length} linha(s) pendente(s) foram marcadas. Esta tela serve para revisar possíveis erros antes da conciliação.`
  );

  setTimeout(() => setAviso(""), 10000);
}

 function aceitarTodosCheckbox() {
  if (selecionados.length > 0) {
    setSelecionados([]);
    setAviso("Seleção removida.");
    setTimeout(() => setAviso(""), 10000);
    return;
  }

  const pendentes = linhas.filter(
    (l) =>
      l.situacao !== "ok" &&
      l.situacao !== "executado" &&
      l.importar !== false
  );

  if (pendentes.length === 0) {
    setAviso("Não há linhas pendentes para selecionar.");
    setTimeout(() => setAviso(""), 10000);
    return;
  }

  setSelecionados(pendentes.map((l) => l.id));

  setAviso(
    `Atenção: ${pendentes.length} linha(s) pendente(s) foram marcadas para revisão.`
  );

  setTimeout(() => setAviso(""), 10000);
}
 async function Reverter() {
  if (
    !confirm(
      "Confirma reverter todas as linhas OK ainda não executadas para pendente?\n\nLinhas já executadas não serão alteradas."
    )
  ) {
    return;
  }

  try {
    const url = buildWebhookUrl("reverter_conciliacao", {
      empresa_id,
      conta_id,
    });

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: Number(empresa_id),
        conta_id: Number(conta_id),
      }),
    });

    const data = await resp.json();

    if (data?.ok === false) {
      alert(data.message || "Erro ao reverter.");
      return;
    }

    setLinhas((prev) =>
      prev.map((l) =>
        l.situacao === "ok"
          ? {
              ...l,
              situacao: "pendente",
              mensagem: "Revertido manualmente para revisão",
            }
          : l
      )
    );

    setSelecionados([]);
  } catch (e) {
    console.error(e);
    alert("Erro ao reverter conciliação.");
  }
}

async function rejeitarLinha(id) {
  if (!confirm("Confirma rejeitar esta linha da conciliação?")) return;

  const url = buildWebhookUrl("rejeitar_conciliacao", {
    empresa_id,
    conta_id,
  });

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empresa_id: Number(empresa_id),
      id: Number(id),
    }),
  });

  setLinhas((prev) =>
    prev.map((l) =>
      Number(l.id) === Number(id)
        ? {
            ...l,
            importar: false,
            situacao: "rejeitado",
            mensagem: "Rejeitado manualmente pelo usuário",
          }
        : l
    )
  );
}


function statusClasse(situacao) {
  if (situacao === "ok") {
    return "bg-emerald-100 text-emerald-700 border-emerald-300";
  }

  if (situacao === "executado") {
    return "bg-blue-100 text-blue-700 border-blue-300";
  }

  if (situacao === "rejeitado") {
    return "bg-red-100 text-red-700 border-red-300";
  }

  return "bg-blue-100 text-blue-700 border-blue-300";
}

 const linhasValidasParaExecutar = linhas.filter(
  (l) => l.importar !== false && l.situacao !== "rejeitado"
);

const faltamContas = linhasValidasParaExecutar.filter(
  (l) =>
    l.tipo_evento !== "transf_mesma_tit" &&
    !l.conta_id &&
    !l.conta_descricao
);  


const podeExecutar =
  linhasValidasParaExecutar.length > 0 &&
 
  linhas.every((l) =>
    ["ok", "rejeitado", "executado"].includes(l.situacao)
  );



  const pendentes = linhas.filter((l) => l.situacao === "pendente");

const podeAceitar = selecionados.some((id) => {
  const linha = linhas.find((l) => Number(l.id) === Number(id));
  return linha && linha.situacao === "pendente" && linha.importar !== false;
});

 
const verPagamentoBaixados = () => {
  const lote =
    resultadoExecucao?.lote_conciliacao_id ||
    resultadoExecucao?.importacao_id ||
    resultadoExecucao?.lote_id ||
    importacaoId ||
    null;

  setLotePagamentos(lote);
  setModalPagamentosAberto(true);
};


 async function verOperacoesGeradas(importacaoIdParam = null) {
  const importacao_id =
    importacaoIdParam ||
    resultadoExecucao?.lote_conciliacao_id ||
    resultadoExecucao?.importacao_id ||
    resultadoExecucao?.lote_id;

  if (!importacao_id) {
    alert("Lote/importação não encontrado.");
    return;
  }

  try {
    setLoadingOperacoes(true);

    const url = buildWebhookUrl("importacao_bancaria", {
      empresa_id,
      conta_id,
      importacao_id: Number(importacao_id),
    });

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: Number(empresa_id),
        conta_id: Number(conta_id),
        importacao_id: Number(importacao_id),
      }),
    });

    const retorno = await resp.json();

    const lista =
      Array.isArray(retorno?.[0]?.data)
        ? retorno[0].data
        : Array.isArray(retorno?.data)
          ? retorno.data
          : Array.isArray(retorno)
            ? retorno
            : [];

    setOperacoesGeradas(lista);
    setMostrarOperacoes(true);
  } catch (e) {
    console.error(e);
    alert("Erro ao carregar operações geradas.");
  } finally {
    setLoadingOperacoes(false);
  }
}
 
async function excluirImportacao() {
  const ids = operacoesGeradas.map((l) => Number(l.id)).filter(Boolean);
  const importacao_id = resultadoExecucao?.lote_conciliacao_id;

  if (!importacao_id) {
    alert("Importação não encontrada.");
    return;
  }

  if (ids.length === 0) {
    alert("Nenhuma operação encontrada para excluir.");
    return;
  }

  if (!confirm(`Confirma excluir ${ids.length} operação(ões) da importação nº ${importacao_id}?`)) {
    return;
  }

  try {
    const url = buildWebhookUrl("exclui_importacao", {
      empresa_id,
      conta_id,
      importacao_id, // 👈 aqui também
    });

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: Number(empresa_id),
        conta_id: Number(conta_id),
        importacao_id: Number(importacao_id), // 👈 ESSENCIAL
        ids,
      }),
    });

    const data = await resp.json();

    if (data?.ok === false) {
      alert(data.message || "Erro ao excluir importação.");
      return;
    }

    alert("Importação excluída com sucesso.");

    setOperacoesGeradas([]);
    setMostrarOperacoes(false); 
    setResultadoExecucao(null);
    

  } catch (e) {
    console.error(e);
    alert("Erro ao excluir importação.");
  }
}
{/*}
function resolverTransferencia(linha) {
  alert(
    "Esta linha precisa ser tratada como transferência.\n\n" +
    "Aqui vamos abrir uma janela para informar conta origem e conta destino.\n\n" +
    `Histórico: ${linha.historico}\n` +
    `Valor: ${Number(linha.valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })}`
  ); 

}*/}

function resolverTransferencia(linha) {
  setLinhaEditando(linha);
  setContaOrigemId(linha.conta_origem_id || "");
  setContaDestinoId(linha.conta_destino_id || "");
}

  useEffect(() => {
   carregarDados();
  carregarContas();
    carregarContasContabeis(); // plano contábil
}, []);


 

 async function confirmarTransferencia() {
  if (!linhaEditando) return;

  if (!contaOrigemId || !contaDestinoId) {
    alert("Informe conta origem e conta destino.");
    return;
  }

  if (Number(contaOrigemId) === Number(contaDestinoId)) {
    alert("Conta origem e destino não podem ser iguais.");
    return;
  }

  const url = buildWebhookUrl("resolver_transferencia", {
    empresa_id,
    lote_id,
  });

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empresa_id: Number(empresa_id),
      lote_id: Number(lote_id),
      id: Number(linhaEditando.id),
      conciliacao_id: Number(linhaEditando.conciliacao_id),
      conta_origem_id: Number(contaOrigemId),
      conta_destino_id: Number(contaDestinoId),
    }),
  });

  const json = await resp.json();

  const retorno =
    json?.[0]?.data?.[0]?.retorno ||
    json?.data?.[0]?.retorno ||
    json?.retorno ||
    json;

  if (!retorno?.ok) {
    alert(retorno?.message || "Não foi possível resolver a transferência.");

    setLinhas((prev) =>
  prev.map((l) =>
    Number(l.id) === Number(linhaEditando.id)
      ? {
          ...l,
          situacao: "ok",
          status: "resolvido",
          mensagem: retorno?.message || "Transferência resolvida manualmente",
          importar: true,
          conta_origem_id: Number(contaOrigemId),
          conta_destino_id: Number(contaDestinoId),
          conta_id: retorno?.conta_contabil_destino_id || l.conta_id,
          conta_descricao:
            retorno?.conta_contabil_destino_descricao ||
            "Conta contábil definida pela transferência",
        }
      : l
  )
);
  
    setLinhaEditando(null);
    return;
  }

  setLinhas((prev) =>
    prev.map((l) =>
      Number(l.id) === Number(linhaEditando.id)
        ? {
            ...l,
            situacao: "ok",
            status: "resolvido",
            mensagem: retorno?.message || "Transferência resolvida manualmente",
            importar: true,
            conta_origem_id: Number(contaOrigemId),
            conta_destino_id: Number(contaDestinoId),
          }
        : l
    )
  );

  setLinhaEditando(null);
}
const lote_id =
  resultadoExecucao?.lote_conciliacao_id ||
  resultadoExecucao?.importacao_id ||
  resultadoExecucao?.lote_id ||
  linhaEditando?.lote_conciliacao_id ||
  0;



{/*}
async function carregarContas() {
  const r = await fetch(buildWebhookUrl("contas_contabeis_lancaveis", { empresa_id }));
  const j = await r.json();
  setContas(Array.isArray(j) ? j : []);
}*/}

  async function carregarContas() {
  const url = buildWebhookUrl("listacontas", { empresa_id });

  const resp = await fetch(url);
  const data = await resp.json();

  setContas(Array.isArray(data) ? data : []); 
  setLinhaEditando(null);
}


async function selecionarContaContabilLinha(l, c) {
  setLinhas((prev) =>
    prev.map((x) =>
      x.id === l.id
        ? {
            ...x,
            conta_id: Number(c.id),
            conta_descricao: `${c.codigo} - ${c.nome}`,
          }
        : x
    )
  );

  setTextoContaBusca((prev) => ({
    ...prev,
    [l.id]: `${c.codigo} - ${c.nome}`,
  }));

  setLinhaContaDropdown(null);
  setContasFiltradasContabil([]);

  await fetchSeguro(buildWebhookUrl("conciliacao_atualizar_conta"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empresa_id,
      id: l.id,
      conta_id: Number(c.id),
    }),
  });
}

function filtrarContasContabeis(texto) {
  const t = String(texto || "").toLowerCase();

 const lista = contasContabeis
    .filter((c) =>
      String(c.codigo || "").toLowerCase().includes(t) ||
      String(c.nome || "").toLowerCase().includes(t) ||
      String(c.apelido || "").toLowerCase().includes(t)
    )
    .slice(0, 12);

  setContasFiltradasContabil(lista);
}

async function criarRegraDaLinha(l) {
  if (!l.conta_id) {
    alert("Escolha uma conta antes de criar a regra.");
    return;
  }

  if (!confirm(`Criar regra para o histórico:\n\n${l.historico}\n\nusando esta conta?`)) {
    return;
  }

  try {
    await fetchSeguro(buildWebhookUrl("criar_regra_classificacao"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        texto_busca: l.historico,
        tipo_movimento: l.tipo || "",
        conta_id: Number(l.conta_id),
      }),
    });

    alert("Regra criada com sucesso.");

    setLinhas((prev) =>
      prev.map((x) =>
        x.id === l.id ? { ...x, regra_criada: true } : x
      )
    );
  } catch (e) {
    alert(e.message || "Erro ao criar regra.");
  }
}


async function carregarContasContabeis() {
  const r = await fetch(
    buildWebhookUrl("contas_contabeis_lancaveis", { empresa_id })
  );

  const j = await r.json();

  const base = Array.isArray(j) ? j[0] : j;
  const dados = base?.data || base?.dados || j;

  setContasContabeis(Array.isArray(dados) ? dados : []);
}


function idsSelecionaveisVisiveis() {
  return linhasFiltradasComTexto
    .filter(
      (l) =>
        l.importar !== false &&
        l.situacao !== "executado" &&
        l.situacao !== "rejeitado" &&
        l.tipo_evento !== "transf_mesma_tit"
    )
    .map((l) => Number(l.id));
}

function toggleTodosSelecionadosVisiveis() {
  const validos = idsSelecionaveisVisiveis();
  const selecionadosNumeros = selecionados.map(Number);

  const todosMarcados =
    validos.length > 0 && validos.every((id) => selecionadosNumeros.includes(id));

  setSelecionados(todosMarcados ? [] : validos);
}



async function aplicarContaEmLote() {
  if (selecionados.length === 0) {
    alert("Selecione ao menos uma linha.");
    return;
  }

  const ids = selecionados.map(Number);

  if (!contaLoteSelecionada) {
    await aceitarSelecionados(ids);
    return;
  }

  await Promise.all(
    ids.map((id) =>
      fetchSeguro(buildWebhookUrl("conciliacao_atualizar_conta"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          id,
          conta_id: Number(contaLoteSelecionada.id),
        }),
      })
    )
  );

  setLinhas((prev) =>
    prev.map((l) =>
      ids.includes(Number(l.id))
        ? {
            ...l,
            conta_id: Number(contaLoteSelecionada.id),
            conta_descricao: `${contaLoteSelecionada.codigo} - ${contaLoteSelecionada.nome}`,
          }
        : l
    )
  );

  await aceitarSelecionados(ids);

  setTextoContaLote("");
  setContaLoteSelecionada(null);
  setContasLoteFiltradas([]);

  setFiltroSituacao("todos");
setFiltroTexto("");
}


useEffect(() => {
  function fecharDropdownConta(event) {
    const clicouDentro = event.target.closest("[data-dropdown-conta]");

    if (!clicouDentro) {
      setLinhaContaDropdown(null);
    }
  }

  document.addEventListener("mousedown", fecharDropdownConta);

  return () => {
    document.removeEventListener("mousedown", fecharDropdownConta);
  };
}, []);


 return (
   <div className="min-h-screen bg-slate-100 px-2 -mt-4 pb-2">
    <div className="mx-auto max-w-[1700px]">

      {!resultadoExecucao && (
          <div className="mb-3 rounded-3xl bg-white p-3 shadow-lg border border-slate-200">
           <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-slate-800 whitespace-nowrap">
              Revisão da Conciliação
            </h1>

            <div className="ml-12 text-sm font-bold text-slate-700">
              Total: {linhas.length} | Exibindo: {linhasFiltradas.length} |
              Pendentes: {linhas.filter((l) => l.situacao === "pendente").length} |
              Rejeitados: {linhas.filter((l) => l.situacao === "rejeitado").length} |
              OK: {linhas.filter((l) => l.situacao === "ok").length}
            </div>

            {podeExecutar && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">
                  ✅ Revisado. Pronto para executar.
                </div>
              )}

               <div className="flex-1 min-w-[320px] max-w-[620px] overflow-hidden rounded-xl border border-orange-300 bg-orange-50 px-3 py-2">
                <div className="marquee-single text-sm italic font-semibold text-slate-900">
                  {mensagensPainel.map((m, i) => (
                    <span key={i} className="marquee-msg">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

               <button
                title="Sair para janela de importação."
                onClick={() => {
                  localStorage.removeItem("resultado_conciliacao");
                  navigate("/importacao-bancaria");
                }}
                className="ml-auto btn-pill btn-green text-xs px-4 py-2"
              >
                ← Sair
              </button>
          </div>

          <div className="mt-2 rounded-4xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center gap-2">

              <button
                title="Selecionar todos registros 'PENDENTES' serem aceitos."
                onClick={aceitarTodosCheckbox}
                className="btn-pill btn-white text-xs px-4 py-2"
              >
                {selecionados.length > 0 ? "❌ Desselecionar" : "✅ 1- Selecionar"}
              </button>

              <button
                title="Aceitar registros selecionados para status de ok. Preparação para execução da conciliação."
                onClick={() => aceitarSelecionados()}
                disabled={!podeAceitar}
                className={`btn-pill text-xs px-4 py-2 ${
                  podeAceitar ? "btn-green" : "btn-white opacity-60 cursor-not-allowed"
                }`}
              >
                ✅ 2- Aceitar
              </button>

              <button
                title="Executar a conciliação. Finalizar o processo e realizar os lançamentos financeiros e pagamentos."
                onClick={executarConciliacao}
                disabled={!podeExecutar}
                  className={`btn-pill text-xs px-4 py-2 ${
                  podeExecutar ? "btn-green" : "btn-white opacity-60 cursor-not-allowed"
                }`}
              >
                ✅ 3- Executar
              </button>

              <button
                title="Reverte o status de ok para pendente."
                onClick={Reverter}
                className="btn-pill btn-red text-xs px-4 py-2"
              >
                ↩ Reverter
              </button>

              

              <div className="hidden md:block h-8 w-px bg-slate-300 mx-1" />

              <select
                value={filtroSituacao}
                onChange={(e) => {
                      setFiltroSituacao(e.target.value);

                      setFiltroTexto("");
                      setTextoContaLote("");
                      setContaLoteSelecionada(null);
                      setContasLoteFiltradas([]);
                    }}
                className="h-9 rounded-full border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700"
              >
                <option value="todos">Todos ({linhas.length})</option>
                <option value="pendente">
                  Pendentes ({linhas.filter((l) => l.situacao === "pendente").length})
                </option>
                <option value="rejeitado">
                  Rejeitados ({linhas.filter((l) => l.situacao === "rejeitado").length})
                </option>
                <option value="ok">
                  OK ({linhas.filter((l) => l.situacao === "ok").length})
                </option>
              {/*}  <option value="sem_conta">
                  Sem Plano ({faltamContas.length})
                </option>*/}
              </select>

              <input
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                placeholder="Filtrar histórico..."
                className="h-9 w-[200px] rounded-full border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700"
              />

              <div className="relative">
                <input
                      value={textoContaLote}
                      onFocus={() => filtrarContasLote("")}
                      onChange={(e) => {
                        const texto = e.target.value;
                        setTextoContaLote(texto);
                        setContaLoteSelecionada(null);
                        filtrarContasLote(texto);
                      }}
                      placeholder="Conta opcional em lote..."
                      className="h-9 w-[280px] rounded-full border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-slate-700"
                    />

                {contasLoteFiltradas.length > 0 && (
                  <div className="absolute z-50 mt-2 max-h-72 w-[420px] overflow-y-auto rounded-2xl border bg-white shadow-xl">
                    {contasLoteFiltradas.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setContaLoteSelecionada(c);
                          setTextoContaLote(`${c.codigo} - ${c.nome}`);
                          setContasLoteFiltradas([]);
                        }}
                        className="block w-full px-4 py-2 text-left text-xs hover:bg-blue-50"
                      >
                        <span className="font-black">{c.codigo}</span> — {c.nome}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                  type="button"
                  onClick={aplicarContaEmLote}
                  disabled={!contaLoteSelecionada || selecionados.length === 0}
                  className={`btn-pill text-xs px-4 py-2 ${
                    contaLoteSelecionada && selecionados.length > 0
                      ? "btn-blue"
                      : "btn-white opacity-60 cursor-not-allowed"
                  }`}
                >
                  Aplicar Selecionados ({selecionados.length})
                </button>

                <button
                type="button"
                onClick={() => setModalAjudaAberto(true)}
                className="h-9 w-9 rounded-full bg-blue-600 text-white font-black shadow hover:bg-blue-700"
                title="Ajuda da conciliação"
              >
                ?
              </button>
            </div>
          </div>
 
          {aviso && (
            <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-800 font-bold shadow">
              {aviso}
            </div>
          )}

         {/*} {faltamContas.length > 0 && (
            <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 px-5 py-3 text-red-700 font-bold">
              ⚠️ Faltam {faltamContas.length} lançamento(s) para informar o Plano de Conta.
            </div>
          )}*/}
        </div>
      )}

      <div className="rounded-4xl bg-white shadow-lg border border-slate-200 overflow-hidden">

        {resultadoExecucao && (
          <div className="mb-6 rounded-3xl border border-emerald-300 bg-emerald-50 p-6 shadow-lg">
            <h2 className="text-2xl font-black text-emerald-800">
              ✅ Conciliação executada com sucesso
            </h2>

            <p className="mt-2 text-emerald-700 font-semibold">
              Os lançamentos foram processados e não aparecerão mais na revisão.
            </p>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="rounded-2xl bg-white p-4 shadow border">
                <div className="text-xs text-slate-500 font-bold">Lote</div>
                <div className="text-xl font-black text-slate-800">
                  {resultadoExecucao.lote_conciliacao_id || "-"}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow border">
                <div className="text-xs text-slate-500 font-bold">Pagas</div>
                <div className="text-xl font-black text-slate-800">
                  {resultadoExecucao.pagar || 0}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow border">
                <div className="text-xs text-slate-500 font-bold">Recebidas</div>
                <div className="text-xl font-black text-slate-800">
                  {resultadoExecucao.receber || 0}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow border">
                <div className="text-xs text-slate-500 font-bold">Faturas</div>
                <div className="text-xl font-black text-slate-800">
                  {resultadoExecucao.faturas || 0}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow border">
                <div className="text-xs text-slate-500 font-bold">Transações</div>
                <div className="text-xl font-black text-slate-800">
                  {resultadoExecucao.transacoes || 0}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
             

              <button
                onClick={() => verOperacoesGeradas()}
                className="btn-pill btn-blue"
              >
                Ver transações geradas
              </button>

               <button
                onClick={() => verPagamentoBaixados()}
                className="btn-pill btn-blue"
              >
                Ver Pagamentos Baixados
              </button>

                <button
                onClick={() => navigate("/importacao-bancaria")}
                className="btn-pill btn-white"
              >
                Sair 
              </button>

            </div>
          </div>
        )}
            

        {mostrarOperacoes && (
            <div className="mb-6 rounded-3xl bg-white border border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">Operações geradas</h2>
                  <p className="text-sm text-slate-200">
                    Lote/importação nº {resultadoExecucao?.lote_conciliacao_id}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-300 font-bold">Conta Corrente</div>
                  <div className="text-base font-black">
                    {operacoesGeradas[0]?.conta_nome || "-"}
                  </div>
                </div>
              </div>

              {loadingOperacoes ? (
                <div className="p-6 text-center font-bold text-slate-500">
                  Carregando operações...
                </div>
              ) : operacoesGeradas.length === 0 ? (
                <div className="p-6 text-center font-bold text-slate-500">
                  Nenhuma operação encontrada para este lote.
                </div>
              ) : (
                <div className="max-h-[620px] overflow-y-auto overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-200 text-black z-10">
                      <tr>
                        <th className="px-2 py-2 text-left w-[70px]">ID</th>
                        <th className="px-3 py-2 text-left min-w-[520px]">Histórico</th>
                        <th className="px-3 py-2 text-center w-[110px]">Data</th>
                        <th className="px-2 py-2 text-center w-[80px]">Tipo</th>
                        <th className="px-2 py-2 text-center w-[90px]">Origem</th>
                        <th className="px-2 py-2 text-center w-[110px]">Classe</th>
                        <th className="px-2 py-2 text-center w-[90px]">Forma</th>
                        <th className="px-3 py-2 text-right w-[130px]">Valor</th>
                      </tr>
                    </thead>

                    <tbody>
                      {operacoesGeradas.map((l) => (
                        <tr key={l.id} className="border-t hover:bg-blue-50/50">
                          <td className="px-2 py-2 font-bold text-slate-600">
                            #{l.id}
                          </td>

                          <td className="px-3 py-2 font-semibold text-slate-800 whitespace-normal break-words">
                            {l.descricao}
                          </td>

                          <td className="px-3 py-2 font-bold text-center whitespace-nowrap">
                            {String(l.data_movimento || "")
                              .slice(0, 10)
                              .split("-")
                              .reverse()
                              .join("/")}
                          </td>

                          <td className="px-2 py-2 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-[11px] font-black ${
                                l.tipo === "entrada"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {l.tipo === "entrada" ? "Ent." : "Saída"}
                            </span>
                          </td>

                          <td className="px-2 py-2 text-center text-xs font-bold text-slate-600">
                            {l.origem === "conta_pagar"
                              ? "Pagar"
                              : l.origem === "conta_receber"
                                ? "Receber"
                                : l.origem === "fatura_cartao"
                                  ? "Fatura"
                                  : "Fin."}
                          </td>

                          <td className="px-2 py-2 text-center text-xs font-bold text-slate-600">
                            {l.classificacao || "-"}
                          </td>

                          <td className="px-2 py-2 text-center text-xs font-bold text-slate-600">
                            {l.forma || "-"}
                          </td>

                          <td className="px-3 py-2 text-right font-black whitespace-nowrap">
                            {Number(l.valor || 0).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        {!resultadoExecucao && loading ? (
          <div className="p-10 text-center text-slate-500 font-bold">
            Carregando dados importados...
          </div>
        ) : linhas.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-bold">
            Nenhum dado encontrado.
          </div>
        ) : (
          <div className="max-h-[780px] overflow-y-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-20 bg-slate-800 text-white">
                <tr>

                  <th className="p-3 text-center">
                        <input
                          type="checkbox"
                          title="Selecionar todos para aplicar conta"
                          checked={
                            linhasFiltradasComTexto.filter(
                              (l) =>
                                l.importar !== false &&
                                l.situacao !== "executado" &&
                                l.situacao !== "rejeitado" &&
                                l.tipo_evento !== "transf_mesma_tit"
                            ).length > 0 &&
                            linhasFiltradasComTexto
                              .filter(
                                (l) =>
                                  l.importar !== false &&
                                  l.situacao !== "executado" &&
                                  l.situacao !== "rejeitado" &&
                                  l.tipo_evento !== "transf_mesma_tit"
                              )
                              .every((l) => selecionados.map(Number).includes(Number(l.id)))
                          }
                          onChange={toggleTodosSelecionadosVisiveis}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300"
                        />
                      </th>
                   
                  <th className="p-3 text-left">Data</th>
                   <th className="w-[460px] p-3 text-left">Histórico</th>
                  <th className="p-3 text-right">Valor</th>
                  <th className="p-3 text-center">Situação</th>
                  <th className="p-3 text-left">Plano de Conta</th>
                      <th className="p-3 text-left">Plano de Conta</th>
                  {/*<th className="p-3 text-center">Tipo Evento</th>*/}
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>

              <tbody>
                {linhasFiltradasComTexto.map((l) => {
                  const resolvido = !!l.destino_id;

                  return (
                    <tr
                      key={l.id}
                      className="border-b border-slate-100 hover:bg-blue-50/60"
                    >
                      <td className="p-3 text-center">
                           <input
                          type="checkbox"
                          checked={selecionados.map(Number).includes(Number(l.id))}
                          onChange={() => toggleSelecionado(l.id)}
                          disabled={
                            l.situacao === "executado" ||
                            l.situacao === "rejeitado" ||
                            l.tipo_evento === "transf_mesma_tit"
                          }
                          className="h-4 w-4 cursor-pointer rounded border-slate-300"
                        />
                          </td>

                      <td className="p-3 font-semibold text-slate-700">
                        {String(l.data_mov || "").slice(0, 10).split("-").reverse().join("/")}
                      </td>

                       <td className="p-3 text-slate-700 font-medium truncate">
                        {l.historico}
                      </td>

                      <td className="p-3 text-right font-black text-slate-800">
                        {Number(l.valor || 0).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusClasse(
                            l.situacao
                          )}`}
                        >
                          {l.situacao === "ok"
                            ? "OK"
                            : l.situacao === "rejeitado"
                              ? "REJEITADO"
                              : l.situacao === "executado"
                                ? "EXECUTADO"
                                : "PENDENTE"}
                        </span>
                      </td>

                        <td    data-dropdown-conta
                              className="p-3 relative min-w-[260px]"
                            >
                              <input
                                value={
                                  l.tipo_evento === "transf_mesma_tit"
                                    ? "Conta contábil definida pela transferência"
                                    : textoContaBusca[l.id] ??
                                      l.conta_descricao ??
                                      l.conta_id ??
                                      ""
                                }
                                onFocus={() => {
                                  setLinhaContaDropdown(l.id);
                                  filtrarContasContabeis("");
                                }}
                                onChange={(e) => {
                                  const texto = e.target.value;

                                  setTextoContaBusca((prev) => ({
                                    ...prev,
                                    [l.id]: texto,
                                  }));

                                  setLinhaContaDropdown(l.id);
                                  filtrarContasContabeis(texto);
                                }}
                                placeholder="Digite a conta..."
                                className="w-full rounded-xl border px-3 py-2 text-xs font-bold"
                                disabled={
                                  l.situacao === "executado" ||
                                  l.tipo_evento === "transf_mesma_tit"
                                }
                              />                                       
                                                  



                        {linhaContaDropdown === l.id && (
                          <div className="absolute z-50 mt-1 max-h-64 w-[360px] overflow-y-auto rounded-xl border bg-white shadow-xl">
                            <button
                              type="button"
                              onClick={() => {
                                setLinhaContaNova(l);
                                setModalContaAberto(true);
                                setLinhaContaDropdown(null);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-black text-blue-700 hover:bg-blue-50"
                            >
                              ➕ Criar nova conta para este histórico
                            </button>

                            {contasFiltradasContabil.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => selecionarContaContabilLinha(l, c)}
                                className="block w-full px-3 py-2 text-left text-xs hover:bg-blue-50"
                              >
                                <span className="font-black">{c.codigo}</span> — {c.nome}
                              </button>
                            ))}

                            {contasFiltradasContabil.length === 0 && (
                              <div className="px-3 py-2 text-xs font-bold text-slate-400">
                                Nenhuma conta encontrada
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-slate-700 font-semibold  text-blue-900 truncate">
                        {l.mensagem}
                      </td>
 
                    {/*}  <td className="p-3 text-slate-600 font-semibold">
                        {l.tipo_evento}
                      </td>*/}

                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          {l.tipo_evento !== "transf_mesma_tit" && (
                            <button
                            title="Rejeita o registro da importação."
                            onClick={() => rejeitarLinha(l.id)}
                            disabled={
                              l.situacao === "ok" ||
                              l.situacao === "executado" ||
                              l.situacao === "rejeitado"
                            }
                            className="text-[12px] font-bold text-red-600 hover:text-red-800 disabled:text-slate-300 disabled:cursor-not-allowed"
                          >
                            Rejeitar
                          </button>
                          )}

                          {l.tipo_evento === "transf_mesma_tit" ? (
                            <>
                              <button
                                title="Aceita o registro da forma em que ele veio do arquivo."
                                onClick={() => aceitarSelecionados([l.id], 1, l.tipo_evento)}
                                className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-800 hover:underline"
                              >
                                Aceitar
                              </button>

                              <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                 <button
                                    title={
                                      resolvido
                                        ? "Linha já resolvida como transferência"
                                        : "Resolve esta linha como transferência entre contas"
                                    }
                                    disabled={resolvido}
                                    onClick={() => {
                                      if (resolvido) return;

                                      setLinhaEditando(l);
                                      setContaOrigemId(l.conta_financeira_id || "");
                                      setContaDestinoId(l.destino_id || "");
                                    }}
                                    className={`text-[12px] font-bold ${
                                      resolvido
                                        ? "text-slate-300 cursor-not-allowed"
                                        : "text-purple-600 hover:text-purple-800"
                                    }`}
                                  >
                                    {resolvido ? "Resolvido" : "Resolver"}
                                  </button>
                              </div>
                            </>
                          ) : (
                            <button
                                title={
                                  l.situacao === "ok" || l.situacao === "executado"
                                    ? "Lançamento já aceito"
                                    : "Confirmar este lançamento. Use quando estiver correto"
                                }
                                onClick={() => aceitarSelecionados([l.id], 1, l.tipo_evento)}
                                disabled={l.situacao === "ok" || l.situacao === "executado"}
                                className={`text-[12px] font-semibold underline-offset-2 ${
                                  l.situacao === "ok" || l.situacao === "executado"
                                    ? "text-slate-300 cursor-not-allowed"
                                    : "text-emerald-600 hover:text-emerald-800 hover:underline"
                                }`}
                              >
                                {l.situacao === "ok" || l.situacao === "executado" ? "Aceito" : "Aceitar"}
                              </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

    {linhaEditando && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-6 w-[520px] shadow-2xl">
          <h2 className="text-xl font-black text-slate-800 mb-4">
            Resolver Transferência
          </h2>

          <div className="mb-3 text-sm font-semibold text-slate-600">
            {linhaEditando.historico}
          </div>

          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-bold text-slate-500">
              Valor da transferência
            </div>

            <div
              className={`text-xl font-black ${
                Number(linhaEditando.valor || 0) >= 0
                  ? "text-emerald-700"
                  : "text-red-700"
              }`}
            >
              {Number(linhaEditando.valor || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          </div>

          <label className="block text-sm font-bold mb-1">Conta origem</label>
          <select
            value={contaOrigemId}
            onChange={(e) => setContaOrigemId(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 mb-4"
          >
            <option value="">Selecione</option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <label className="block text-sm font-bold mb-1">Conta destino</label>
          <select
            value={contaDestinoId}
            onChange={(e) => setContaDestinoId(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 mb-5"
          >
            <option value="">Selecione</option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setLinhaEditando(null)}
              className="btn-pill btn-white"
            >
              Cancelar
            </button>

            <button
              onClick={confirmarTransferencia}
              className="btn-pill btn-purple"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    )}

    <ModalBase
      open={modalContaAberto}
      onClose={() => {
        setModalContaAberto(false);
        setLinhaContaNova(null);
      }}
      title="Nova Conta Contábil"
    >
      <FormContaContabilModal
        empresa_id={empresa_id}
        contas={contasContabeis}
        nomeInicial={linhaContaNova?.historico || ""}
        historicoRegra={linhaContaNova?.historico || ""}
        tipoMovimento={linhaContaNova?.tipo || ""}
        onSuccess={(contaCriada) => {
          setModalContaAberto(false);

          if (linhaContaNova && contaCriada?.id) {
            setLinhas((prev) =>
              prev.map((x) =>
                x.id === linhaContaNova.id
                  ? { ...x, conta_id: Number(contaCriada.id) }
                  : x
              )
            );

            fetchSeguro(buildWebhookUrl("conciliacao_atualizar_conta"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                empresa_id,
                id: linhaContaNova.id,
                conta_id: Number(contaCriada.id),
              }),
            });
          }

          setLinhaContaNova(null);
          carregarContasContabeis();
        }}
        onCancel={() => {
          setModalContaAberto(false);
          setLinhaContaNova(null);
        }}
      />
    </ModalBase>

   <style>{`
  .marquee-single {
    position: relative;
    height: 20px;
    overflow: hidden;
    white-space: nowrap;
  }

  .marquee-msg {
    position: absolute;
    left: 100%;
    top: 0;
    opacity: 0;
    white-space: nowrap;
    animation: marqueeMsg 60s linear infinite;
  }

  .marquee-msg:nth-child(1) { animation-delay: 0s; }
  .marquee-msg:nth-child(2) { animation-delay: 10s; }
  .marquee-msg:nth-child(3) { animation-delay: 20s; }
  .marquee-msg:nth-child(4) { animation-delay: 30s; }
  .marquee-msg:nth-child(5) { animation-delay: 40s; }
  .marquee-msg:nth-child(6) { animation-delay: 50s; }

  @keyframes marqueeMsg {
    0%   { transform: translateX(0); opacity: 0; }
    2%   { opacity: 1; }
    12%  { opacity: 1; }
    16%  { transform: translateX(-950px); opacity: 0; }
    100% { transform: translateX(-950px); opacity: 0; }
  }
`}</style>

{modalPagamentosAberto && (
  <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4">
    <div className="w-full max-w-[1500px] max-h-[92vh] overflow-y-auto rounded-[28px] bg-white shadow-2xl">
      <PagamentosBaixados
        modoModal={true}
        loteInicialProp={lotePagamentos}
        onClose={() => setModalPagamentosAberto(false)}
      />
    </div>
  </div>
)}


  {modalAjudaAberto && (
  <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4">
    <div className="w-full max-w-[760px] rounded-[28px] bg-white shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 to-cyan-700 px-6 py-5 text-white flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">
            Como revisar a conciliação
          </h2>

          <p className="text-sm text-cyan-100 font-semibold">
            Siga a ordem abaixo para evitar lançamentos errados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalAjudaAberto(false)}
          aria-label="Fechar ajuda"
          className="h-9 w-9 rounded-full bg-white/15 border border-white/25 font-black hover:bg-white/25"
        >
          ×
        </button>
      </div>

      <div className="p-6 space-y-4">
        {[
          {
            num: "1",
            titulo: "Analise as linhas do extrato",
            texto: "Confira data, histórico, valor e tipo de evento antes de aceitar.",
            video: "https://www.youtube.com/watch?v=2OINCdmffck",
          },
          {
            num: "2",
            titulo: "Classifique as contas",
            texto: "Pesquise pelo histórico e atribua a conta contábil correta.",
            video: "https://youtu.be/Jd1eAf-1Rd4",
          },
          {
            num: "3",
            titulo: "Use filtro e conta em lote",
            texto: "Quando vários registros forem parecidos, filtre e aplique a mesma conta contábil.",
            video: "https://youtu.be/ry2hD-z0mIQ",
          },
          {
            num: "4",
            titulo: "Selecione os registros",
            texto: "Marque os lançamentos que estão corretos para conciliação.",
            video: "https://youtu.be/Jd1eAf-1Rd4",
          },
          {
            num: "5",
            titulo: "Aceite ou rejeite",
            texto: "Aceite o que será conciliado e rejeite o que não deve entrar no financeiro.",
            video: "https://youtu.be/RWCQyqPxbq0",
          },
          {
            num: "6",
            titulo: "Execute a conciliação",
            texto: "Finalize somente quando tudo estiver OK. Depois confira transações geradas e pagamentos baixados.",
            video: "https://youtu.be/bdMmFBjgUHI",
          },

         {
            num: "7",
            titulo: "Utilize o filtro de revisão",
            texto: "Use este filtro para visualizar apenas os registros Pendentes, Rejeitados ou já Revisados (OK). Isso facilita a conferência e evita que algum lançamento fique sem análise.",
            video: "https://youtu.be/4rVUiW9Kh-4",
          },
        ].map((passo) => (
          <div
            key={passo.num}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-blue-700 text-white flex items-center justify-center font-black">
              {passo.num}
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-black text-slate-800">
                {passo.titulo}
              </div>

              <div className="text-sm font-semibold text-slate-600">
                {passo.texto}
              </div>
            </div>

            <a
              href={passo.video}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm text-white font-black shadow hover:bg-red-400 transition-colors"
            >
              <span>Ver vídeo</span>
              <span aria-hidden="true">▶</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

  </div>
);
 

}