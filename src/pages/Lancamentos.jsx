      import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from '../config/globals';
import ModalBase from "../components/ModalBase";
import FormConta from "../components/forms/FormConta";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
import { Link } from "react-router-dom";
import { fetchSeguro } from "../utils/apiSafe";
import { useRef } from "react";
import { FilePlus } from "lucide-react";
import { Repeat } from "lucide-react";
import { CalendarClock  } from "lucide-react";

import { FileText } from "lucide-react";   // relatório
import { Receipt } from "lucide-react";    // recibo
import { ScrollText } from "lucide-react"; // relatório detalhado
import { Funnel } from "lucide-react";
import NovoLancamentoDrawer from "./NovoLancamento";
import TransferenciaDrawer from "./app/AppTransferencia.jsx";
import { BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import LancamentoContabilRapido from "./LancamentoContabilRapido";
import { ClipboardEdit } from "lucide-react";


export default function Lancamentos() {
  const { t } = useTranslation();
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [total, setTotal] = useState(0);
  const [periodo, setPeriodo] = useState("mes");
  const [modalConta, setModalConta] = useState(false);
  const [qtdVencidos, setQtdVencidos] = useState(0);
  const [qtdRegistros, setQtdRegistros] = useState(0);
  const [selecionados, setSelecionados] = useState([]);
  const [totalEntrada, setTotalEntrada] = useState(0);
  const [totalSaida, setTotalSaida] = useState(0);
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [saldoFinal, setSaldoFinal] = useState(0);
 const [refreshKey, setRefreshKey] = useState(0);
  const contaRef = useRef(null);
 const [drawerNovo, setDrawerNovo] = useState(false);
const [tipoNovo, setTipoNovo] = useState(null);
const [contas, setContas] = useState([]);
const [loading, setLoading] = useState(false);

  const empresa_id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");
  const navigate = useNavigate();
const tipoOperacaoOldRef = useRef("");
  const [contaId, setContaId] = useState("");
  const [dadosConta, setDadosConta] = useState(null);
  const [categoriaId, setCategoriaId] = useState("");
const [fornecedorId, setFornecedorId] = useState("");

const [categorias, setCategorias] = useState([]);
const [fornecedores, setFornecedores] = useState([]);
  const btnPadrao = "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";
const [tipoOperacao, setTipoOperacao] = useState("transacao");
const [busca, setBusca] = useState("");
const [msgEstorno, setMsgEstorno] = useState("");
const [piscarBotaoAcao, setPiscarBotaoAcao] = useState(false);


const [modalFiltro, setModalFiltro] = useState(false);

 
const [filtroTemp, setFiltroTemp] = useState({
  dataIni: "",
  dataFim: "",
  filtroContaId: "",
  busca: "",
  tipoOperacao: "transacao",
});


const [filtroContaId, setFiltroContaId] = useState("");


function chamarAtencaoBotaoAcao() {
  setPiscarBotaoAcao(true);

  setTimeout(() => {
    setPiscarBotaoAcao(false);
  }, 1000);
}

 function formatarDataBR(data) {
  if (!data) return "-";

  // força yyyy-mm-dd
  const [ano, mes, dia] = data.split("T")[0].split("-");

  return `${dia}/${mes}/${ano}`;
}
 

const [mostrarAlerta, setMostrarAlerta] = useState(false);

useEffect(() => {
  const flag = sessionStorage.getItem("mostrar_alerta_lancamento");

  if (flag === "1") {
    setMostrarAlerta(true);
    sessionStorage.removeItem("mostrar_alerta_lancamento");

    setTimeout(() => {
      setMostrarAlerta(false);
    }, 10000); // 20 segundos
  }
}, []);

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

 
    setDataIni(    hojeLocal() );
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


function mostrarMensagemTela(mensagem, tempo = 20000) {
  setMsgEstorno(mensagem);

  setTimeout(() => {
    setMsgEstorno("");
  }, tempo);
}

 async function carregarContas() {
  try {
    const url = buildWebhookUrl("consultasaldo", {
      empresa_id,
      inicio: dataIni || hojeLocal(),
      fim: dataFim || hojeLocal(),
      conta_id: 0,
    });

    const resp = await fetch(url);
    const data = await resp.json();

    const lista = Array.isArray(data) ? data : [];

   setContas(
  lista.map((c) => ({
    id: c.conta_id,
    conta_id: c.conta_id,
    nome: c.conta_nome,
    conta_nome: c.conta_nome,
    banco_nome: c.banco_nome,
    nro_banco: c.nro_banco,
    agencia: c.agencia,
    conta: c.conta,
    saldo: c.saldo_final,
    icone_url: String(c.icone_url || "").trim(),
    cor_hex: c.cor_hex,
  }))
);
  } catch (error) {
    console.error("Erro ao carregar contas:", error);
  }
}


function labelContaDrop(c) {
  const banco = c.nro_banco ? `Banco ${c.nro_banco}` : "";
  const ag = c.agencia ? `Ag : ${c.agencia}` : "";
  const cc = c.conta ? `Cc : ${c.conta}` : "";

  const dados = [ ag, cc].filter(Boolean).join(" • ");
  const saldo = Number(c.saldo || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return dados
    ? `${c.nome} — ${dados}  `
    : `${c.nome}   `;
}
 
useEffect(() => {
  if (contaId) {
    carregarSaldoConta(contaId);
  }
}, [contaId]);

  //useEffect(() => {
   // setPeriodo("mes");
    //aplicarPeriodo("mes");
  //}, []);
 
  async function pesquisar(tipo = "", contaFiltroParam = null) {

  tipo = tipo || "";

      setSelecionados([]);

  // REGRA PARA VENCIDOS
  let dataIniLocal = dataIni;
  let dataFimLocal = dataFim;
  let contaLocal =
  contaFiltroParam !== null
    ? Number(contaFiltroParam) || 0
    : Number(filtroContaId) || 0;
  let categoriaLocal = Number(categoriaId) || 0;
  let fornecedorLocal = Number(fornecedorId) || 0;
  let tipoOperacaoLocal = tipo;
  let vencidoLocal = "";
  let vence_hoje = "";
  let vence_sete_dias = "";
  let origem = "";


  if (tipo === "titulos_pagos") {
  dataIniLocal = "2020-01-01";
  dataFimLocal = hojeLocal();
  contaLocal = 0;
  categoriaLocal = 0;
  fornecedorLocal = 0;
  tipoOperacaoLocal = "transacao";
  vencidoLocal = "";
  origem = "titulos_pagos";
}


 

  if (tipo === "vencidos") {
    dataIniLocal = "2020-01-01";
    dataFimLocal = hojeLocal();
    contaLocal = 0;
    categoriaLocal = 0;
    fornecedorLocal = 0;
    tipoOperacaoLocal = "";
    vencidoLocal = "sim";
    origem ="";
  }

   if (tipo === "vence_hoje") {
    dataIniLocal =  hojeLocal();
    dataFimLocal = hojeLocal();
    contaLocal = 0;
    categoriaLocal = 0;
    fornecedorLocal = 0;
    tipoOperacaoLocal = "";
    vencidoLocal = "";
     vence_hoje = "sim";
     vence_sete_dias = "";
     origem ="";
  }
  if (tipo === "vence_sete_dias") { 
     dataIniLocal = hojeMaisDias(1);
    dataFimLocal = hojeMaisDias(7);
    contaLocal = 0;
    categoriaLocal = 0;
    fornecedorLocal = 0;
    tipoOperacaoLocal = "";
    vencidoLocal = "";
     vence_hoje = "";
       vence_sete_dias = "sim";
     origem ="";
  }

    if (tipo === "transacao") { 
    
    
    categoriaLocal = 0;
    fornecedorLocal = 0;
    tipoOperacaoLocal = "transacao";
    vencidoLocal = "";
     vence_hoje = "";
     vence_sete_dias = "";
     origem ="transacao";
  }

   if (tipo === "estorno") { 
    
    contaLocal = 0;
    categoriaLocal = 0;
    fornecedorLocal = 0;
    tipoOperacaoLocal = "transacao";
    vencidoLocal = "";
     vence_hoje = "";
     vence_sete_dias = "";
     origem ="estorno";
  }

  if (!dataIniLocal || !dataFimLocal) {
    alert(t("lancamentos.informePeriodo", "Informe o período."));
    return;
  }

   if (tipo !== tipoOperacaoOldRef.current) {
    setLista([]);
  }
    tipoOperacaoOldRef.current = tipo;
setCarregando(true);

  await carregar(); 
  
  try {
    const url = buildWebhookUrl("listalancamentos", {
      empresa_id: empresa_id,
      conta_id: contaLocal,
      data_ini: dataIniLocal,
      data_fim: dataFimLocal,
      categoria_id: categoriaLocal,
      fornecedor_id: fornecedorLocal,
      tipo_operacao: tipoOperacaoLocal,
      vencido: vencidoLocal,
      vence_hoje:vence_hoje,
        vence_sete_dias : vence_sete_dias,
        origem:origem 

    });
      const resp = await fetch(url);
      
      const dados = await resp.json();
       
      let soma = 0;
      let somaEntrada = 0;
      let somaSaida = 0;

      const tratados = dados.filter((l) => l && (l.id || l.descricao || l.valor || l.data_movimento || l.vencimento || l.origem)).map((l) => {
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
            // 👇 ADICIONA AQUI
          nome: l.nome || "",
          numero: l.numero || "",
          evento_codigo: l.evento_codigo,
          origem_id:l.origem_id,
          tipo_operacao:l.tipo_operacao,
          vencimento:l.vencimento,
          parcelas:l.parcelas,
          status:l.status,
          origem:l.origem ,
          vencido:l.vencido,
          parcela_total:l.parcela_total,
          forma:l.forma ,
          classificacao:l.classificacao

        };
      });
       //  ✔️ EXATAMENTE AQUI  
       setTotalEntrada(somaEntrada);
      setTotalSaida(somaSaida);

      setLista(tratados);
      setTotal(soma);

        if (tipo === "vencidos") {
     
          setQtdVencidos(tratados.length);
        }

       
      setQtdRegistros(tratados.length);
       
    } catch (e) {
      console.error(e);
      alert(t("lancamentos.erroConsultarLancamentos", "Erro ao consultar lançamentos."));
    }
    setCarregando(false);

    
  }   
   
   function VisaoFinanceira() {
  navigate("/diagnostico-financeiro");
}
  
   function ContaRecorrente() {
    navigate("/conta-recorrente");
  }



   function ReclassifacaoContabil() {
    navigate("/regras-classificacao");
  }


    function ImportarExtrato() {
    navigate("/importacao-bancaria");
  }


  function abrirNovoLancamento() {
    navigate("/new-transaction");
  }

    function abrirNovaReceita() {
    navigate("/registrareceitarapida");
  }

 // function editarLancamento(id) {
 //   navigate("/editar-lancamento", {
  //    state: { id_lancamento: id, empresa_id: empresa_id }
  //  });
 // }

 function editarLancamento(l) {

  if (l.tipo_operacao === "conta_pagar") {
    navigate(`/edit-conta-pagar/${l.id}`);
    return;
  }

  if (l.tipo_operacao === "conta_receber") {
    navigate(`/edit-conta-receber/${l.id}`);
    return;
  }

  if (l.tipo_operacao === "compra_cartao") {
    navigate(`/edit-card-transaction/${l.id}`);
    return;
  }

  if (l.tipo_operacao === "fatura_cartao") {
    navigate(`/edit-card-invoice/${l.id}`);
    return;
  }

  if (l.tipo_operacao === "transacao") {
    navigate("/editar-lancamento", {
      state: { id_lancamento: l.id, empresa_id: empresa_id}
    });
    return;
  }

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
   carregarContas();
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
   if (!confirm(t("lancamentos.confirmarEstorno", "Tem certeza que deseja estornar este lançamento?"))) return;

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
        alert(t("lancamentos.lancamentoEstornadoSucesso", "Lançamento estornado com sucesso!")); 

        

           window.dispatchEvent(new Event("contabil-atualizado"));
        return;
      }

    // Se não entrou no sucesso, então deu erro (provavelmente FK)
    alert(json[0]?.message || t("lancamentos.erroEstornarVinculos", "Erro ao estornar. Verifique vínculos (FK)."));

  } catch (e) {
    console.log("ERRO Estornar:", e);
    alert(t("lancamentos.erroEstornar", "Erro ao estornar."));
  }
}
 useEffect(() => {
  if (refreshKey > 0) {
    pesquisar(tipoOperacao || "");
  }
}, [refreshKey]);


async function executarTitulos(titulos, conta_id) {
  if (loading) return;

  if (!conta_id || Number(conta_id) === 0) {
    alert(t("lancamentos.selecioneContaBancaria", "Selecione a conta bancária."));
    contaRef.current?.focus();
    return;
  }

  const itens = titulos.map((l) => ({
    origem_tabela:
      l.tipo_operacao === "conta_pagar"
        ? "contas_a_pagar"
        : l.tipo_operacao === "conta_receber"
        ? "contas_a_receber"
        : l.tipo_operacao === "fatura_cartao"
        ? "cartoes_faturas"
        : "",

    origem_id: Number(l.id),
    tipo_operacao: l.tipo_operacao,
  }));

  setLoading(true);

  try {
    const resp = await fetch(buildWebhookUrl("executar_titulos"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: Number(empresa_id),
        conta_id: Number(conta_id),
        itens,
      }),
    });

    const data = await resp.json();

    if (!resp.ok || data?.ok === false) {
      alert(data?.message || t("lancamentos.erroExecutarTitulos", "Erro ao executar títulos."));
      return;
    }
 
    alert(t("lancamentos.processadoSucesso", "Processado com sucesso!"));
    setSelecionados([]);
    window.dispatchEvent(new Event("contabil-atualizado"));
    pesquisar(tipoOperacao || "");
    carregarSaldoConta(conta_id);
    await carregarQtdVencidos();

  } catch (e) {
    alert(t("lancamentos.erroProcessarTitulos", "Erro ao processar títulos."));
  } finally {
    setLoading(false);
  }
}


async function processarTitulo(titulo, conta_id) {
  return executarTitulos([titulo], conta_id);
}

function executarSelecionados() {
  const titulos = listaFiltrada.filter((l) =>
    selecionados.includes(getUid(l))
  );

  executarTitulos(titulos, contaId);
}
 

//useEffect(() => {
// if (dataIni && dataFim) {
 //   pesquisar("transacao");
 // }
//}, [dataIni, dataFim]);

 async function excluirCompra(compra_id) {
  if (!window.confirm(t("lancamentos.confirmarExcluirCompraCartao", "Excluir compra do cartão?"))) return;

  try {

    const data = await fetchSeguro(
      buildWebhookUrl("excluircompras"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: empresa_id,
          compra_id: compra_id
        })
      }
    );

    alert(t("lancamentos.compraExcluidaSucesso", "Compra excluída com sucesso."));
       window.dispatchEvent(new Event("contabil-atualizado"));
    pesquisar(tipoOperacao || ""); // recarrega lista

  } catch (e) {
    alert(t("lancamentos.erroExcluirCompra", "Erro ao excluir compra: ") + e.message);
  }
}

const temTransacao = lista.some(l => l.tipo_operacao === "transacao");

const formaLabel = {
  avista: t("lancamentos.aVista", "À vista"),
  pix: "Pix",
  cartao_debito: t("lancamentos.cartaoDebito", "Cartão Débito"),
  cartao_credito: t("lancamentos.cartaoCredito", "Cartão Crédito"),
  boleto: "Boleto",
  aprazo: t("lancamentos.aPrazo", "A prazo")
};
 
const listaFiltrada = lista.filter((l) => {

  if (
    filtroContaId &&
    String(l.conta_nome || "") !==
      String(
        contas.find(c => String(c.id) === String(filtroContaId))?.nome || ""
      )
  ) {
    return false;
  }

  if (!busca) return true;

  const texto = busca.toLowerCase();

  return (
    (l.descricao || "").toLowerCase().includes(texto) ||
    (l.forma || "").toLowerCase().includes(texto) ||
    (l.tipo || "").toLowerCase().includes(texto) ||
    (l.tipo_evento || "").toLowerCase().includes(texto) ||
    (l.origem || "").toLowerCase().includes(texto) ||
    (l.classificacao || "").toLowerCase().includes(texto) ||
    (l.valor || "").toString().toLowerCase().includes(texto)
  );
});
 
async function carregarQtdVencidos() {
  try {
    if (!empresa_id) {
      setQtdVencidos(0);
      return;
    }

    const url = buildWebhookUrl("vencidos", {
      id_empresa: empresa_id
    });

    const resp = await fetch(url);
    const data = await resp.json();

    const item = Array.isArray(data) ? data[0] : data;
    setQtdVencidos(Number(item?.qtd_vencidos || 0));
  } catch (e) {
    setQtdVencidos(0);
  }
}
 
useEffect(() => {
  setPeriodo("mes");
  aplicarPeriodo("mes");

  if (empresa_id) {
    carregarQtdVencidos();
  }
}, [empresa_id]);


function RelatorioEscolhido(tipo) {
  tipo = (tipo ?? "").trim();

  switch (tipo) {
    case "vencidos":
      return t("lancamentos.vencidos", "Vencidos");

    case "vence_hoje":
      return t("lancamentos.venceHoje", "Vence Hoje");

    case "transacao":
      return t("lancamentos.aVista", "À vista");

    case "conta_pagar":
      return t("lancamentos.contasAPagar", "Contas a Pagar");

    case "conta_receber":
      return t("lancamentos.contasAReceber", "Contas a Receber");

    case "fatura_cartao":
      return t("lancamentos.faturasNoCartao", "Faturas no Cartão");

    case "cartao_compra":
      return t("lancamentos.comprasNoCartao", "Compras no Cartão");

    case "titulos_pagos":
      return t("lancamentos.titulosBaixados", "Títulos Baixados");

    case "vence_sete_dias":
      return t("lancamentos.venceEmSeteDias", "Vence em sete dias.");

    case "estorno":
      return t("lancamentos.operacoesEstornadas", "Operações Estornadas");

    case "todos":
      return t("lancamentos.todos", "Todos");

    default:
      return tipo || t("lancamentos.todos", "Todos");
  }
}

 function getUid(l) {
  return `${l.tipo_operacao || tipoOperacao}:${l.id}`;
}

function toggleSelecionado(l) {
  const uid = getUid(l);

  setSelecionados((prev) =>
    prev.includes(uid)
      ? prev.filter((x) => x !== uid)
      : [...prev, uid]
  );
}

function toggleSelecionarTodos() {
  const ids = listaFiltrada.map((l) => getUid(l));

  const todosMarcados = ids.every((id) => selecionados.includes(id));

  setSelecionados(todosMarcados ? [] : ids);
}

function executarSelecionados() {
  const itens = listaFiltrada.filter((l) =>
    selecionados.includes(getUid(l))
  );

  if (itens.length === 0) {
    alert(t("lancamentos.selecioneAoMenosUmItem", "Selecione ao menos um item."));
    return;
  }

  const temFinanceiroOuPago = itens.some(
    (l) =>
      l.tipo_operacao === "transacao" ||
      tipoOperacao === "titulos_pagos"
  );

  if (temFinanceiroOuPago) {
    estornarSelecionados(itens);
    return;
  }

  executarTitulos(itens, contaId);
}


async function estornarSelecionados(itens) {
  if (!confirm(t("lancamentos.confirmaEstornarQuantidade", "Confirma estornar {{qtd}} lançamento(s)?", { qtd: itens.length }))) return;

  try {
    setLoading(true);

    const ids = itens.map((l) => Number(l.id));

    const resp = await fetch(buildWebhookUrl("estornar_lancamentos_lote"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: Number(empresa_id),
        ids,
      }),
    });

    const data = await resp.json();

    if (!resp.ok || data?.ok === false) {
      alert(data?.message || t("lancamentos.erroEstornarSelecionados", "Erro ao estornar selecionados."));
      return;
    }

    alert(t("lancamentos.estornoRealizadoSucesso", "Estorno realizado com sucesso!"));
 
   mostrarMensagemTela(t("lancamentos.operacaoExcluidaMesmaData", "Operação excluída com sucesso. Quando o estorno é feito no mesmo dia, ele não gera movimentação financeira adicional."), 10000);
           

    setSelecionados([]);
    window.dispatchEvent(new Event("contabil-atualizado"));
    pesquisar(tipoOperacao || "");
  } catch (e) {
    alert(t("lancamentos.erroEstornarSelecionados", "Erro ao estornar selecionados."));
  } finally {
    setLoading(false);
  }
}

 function labelBotaoSelecionados() {
  const qtd = selecionados.length;
  const sufixo = qtd > 0 ? ` (${qtd})` : "";

  switch ((tipoOperacao || "").trim()) {
    case "transacao":
    case "titulos_pagos":
      return `${t("lancamentos.estornarSelecionados", "Estornar Selecionados")}${sufixo}`;

    case "conta_pagar":
      return `${t("lancamentos.pagarSelecao", "Pagar Seleção")}${sufixo}`;

    case "conta_receber":
      return `${t("lancamentos.receberSelecao", "Receber Seleção")}${sufixo}`;

    case "fatura_cartao":
      return `${t("lancamentos.pagarFaturas", "Pagar Faturas")}${sufixo}`;

    case "vencidos":
    case "vence_hoje":
    case "vence_sete_dias":
      return `${t("lancamentos.baixarSelecionados", "Baixar Selecionados")}${sufixo}`;

    default:
      return `${t("lancamentos.baixarSelecionados", "Baixar Selecionados")}${sufixo}`;
  }
}


function corBotaoSelecionado() {
  switch ((tipoOperacao || "").trim()) {
    case "transacao":
      return "btn-yellow";

    case "conta_receber":
      return "btn-emerald";

    case "conta_pagar":
      return "btn-red";

    case "fatura_cartao":
      return "btn-blue";

    case "vence_hoje":
      return "btn-blue";

    case "vencidos":
      return "btn-red";

    case "vence_sete_dias":
      return "btn-gray";

    case "estorno":
      return "btn-red";

    case "titulos_pagos":
      return "btn-purple";

    default:
      return "btn-gray";
  }
}
 

 function permiteSelecao() {
  return tipoOperacao !== "estorno" && tipoOperacao !== "cartao_compra";
}

async function excluirPagar(id) {
    if (!confirm(t("lancamentos.confirmarExclusao", "Confirmar exclusão?"))) return;

    try {
      const url = buildWebhookUrl("exclui_conta_pagar"); // <<< trocar pelo webhook real

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, empresa_id }),
      });

      const texto = await resp.text();
      let json = {};

      try {
        json = JSON.parse(texto);
      } catch {}

      if (texto.includes("foreign key") || texto.includes("violates")) {
        alert(t("lancamentos.naoPossivelExcluirVinculos", "Não é possível excluir: esta conta possui vínculos."));
        return;
      }

      alert(json?.message || t("lancamentos.excluidoSucesso", "Excluído com sucesso!"));
 
      pesquisar(tipoOperacao || "");
    } catch (e) {
      console.log("ERRO EXCLUIR:", e);
      alert(t("lancamentos.erroExcluir", "Erro ao excluir"));
    }
  }


  async function excluirReceber(id) {
    if (!confirm(t("lancamentos.confirmarExclusao", "Confirmar exclusão?"))) return;

    try {
      const url = buildWebhookUrl("exclui_conta_receber"); // <<< trocar pelo webhook real

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, empresa_id }),
      });

      const texto = await resp.text();
      let json = {};

      try {
        json = JSON.parse(texto);
      } catch {}

      if (texto.includes("foreign key") || texto.includes("violates")) {
        alert(t("lancamentos.naoPossivelExcluirVinculos", "Não é possível excluir: esta conta possui vínculos."));
        return;
      }

      alert(json?.message || t("lancamentos.excluidoSucesso", "Excluído com sucesso!"));
        pesquisar(tipoOperacao || "");
    } catch (e) {
      console.log("ERRO EXCLUIR:", e);
      alert(t("lancamentos.erroExcluir", "Erro ao excluir"));
    }
  }


function labelBotaoPorTipo(tipo) {
  switch ((tipo || "").trim()) {
    case "transacao":
    case "titulos_pagos":
      return t("lancamentos.estornarSelecionados", "Estornar Selecionados");

    case "conta_pagar":
      return t("lancamentos.pagarSelecao", "Pagar Seleção");

    case "conta_receber":
      return t("lancamentos.receberSelecao", "Receber Seleção");

    case "fatura_cartao":
      return t("lancamentos.pagarFaturas", "Pagar Faturas");

    case "vencidos":
    case "vence_hoje":
    case "vence_sete_dias":
      return t("lancamentos.baixarSelecionados", "Baixar Selecionados");

    default:
      return t("lancamentos.baixarSelecionados", "Baixar Selecionados");
  }
}


function excluir(id, tipo_operacao) {
  if (tipo_operacao === "conta_pagar") {
    return excluirPagar(id);
  }

  if (tipo_operacao === "conta_receber") {
    return excluirReceber(id);
  }

  if (tipo_operacao === "cartao_compra") {
    return excluirCompra(id);
  }
}
 
function escolherFiltro(tipo) {
  const acoes = {
    transacao: {
      limparSelecao: false,
      tempo: 5000,
      msg: mensagensAcaoPorTipo.transacao
    },
    conta_receber: {
      limparSelecao: false,
      tempo: 5000,
      msg: mensagensAcaoPorTipo.conta_receber
    },
    conta_pagar: {
      limparSelecao: false,
      tempo: 5000,
      msg: mensagensAcaoPorTipo.conta_pagar
    },
    cartao_compra: {
      limparSelecao: true,
      tempo: 5000,
      msg: mensagensAcaoPorTipo.cartao_compra
    },
    fatura_cartao: {
      limparSelecao: false,
      tempo: 5000,
      msg: mensagensAcaoPorTipo.fatura_cartao
    },
    vence_hoje: {
      limparSelecao: false,
      tempo: 5000,
      msg: mensagensAcaoPorTipo.vence_hoje
    },
    vencidos: {
      limparSelecao: false,
      tempo: 5000,
      msg: mensagensAcaoPorTipo.vence_hoje
    },
    vence_sete_dias: {
      limparSelecao: false,
      tempo: 5000,
      msg: mensagensAcaoPorTipo.vence_hoje
    },
    estorno: {
      limparSelecao: false,
      tempo: 5000,
      msg: mensagensAcaoPorTipo.estorno
    },
    titulos_pagos: {
      limparSelecao: false,
      tempo: 8000,
      msg: mensagensAcaoPorTipo.vence_hoje
    }
  };

  const cfg = acoes[tipo];

  if (!cfg) return;

  if (cfg.limparSelecao) {
    setSelecionados([]);
  }

  setTipoOperacao(tipo);
  pesquisar(tipo);
  chamarAtencaoBotaoAcao();

  mostrarMensagemTela(
    cfg.msg +
      " " + t("lancamentos.selecioneRegistrosCliqueBotao", "Selecione os registros e clique no botão") + " " +
      labelBotaoPorTipo(tipo) +
      ".",
    cfg.tempo
  );
}

const mensagensAcaoPorTipo = {
  transacao: t("lancamentos.msgAcaoEstorno", "Ação permitida, estorno."),
  conta_receber: t("lancamentos.msgAcaoBaixarRecebimentos", "Ação permitida, baixar recebimentos."),
  conta_pagar: t("lancamentos.msgAcaoBaixarPagamentos", "Ação permitida, baixar pagamentos."),
  cartao_compra: t("lancamentos.msgAcaoExcluirComprasCartao", "Ação permitida, excluir compras no cartão."),
  fatura_cartao: t("lancamentos.msgAcaoPagarFaturasCartao", "Ação permitida, pagar faturas do cartão."),
  vence_hoje: t("lancamentos.msgAcaoBaixarPagamentosRecebimentos", "Ação permitida, baixar pagamentos ou recebimentos."),
  vencidos: t("lancamentos.msgAcaoBaixarPagamentosRecebimentos", "Ação permitida, baixar pagamentos ou recebimentos."),
  vence_sete_dias: t("lancamentos.msgAcaoBaixarPagamentosRecebimentos", "Ação permitida, baixar pagamentos ou recebimentos."),
  estorno: t("lancamentos.msgAcaoEstornarOperacoes", "Ação permitida, estornar operações financeiras."),
  titulos_pagos: t("lancamentos.msgAcaoBaixarPagamentosRecebimentos", "Ação permitida, baixar pagamentos ou recebimentos."),
};

const contaSelecionada = contas.find((c) => {
  const idConta = String(c.conta_id ?? c.id ?? "");
  const idSelecionado = String(contaId ?? "");
  return idConta === idSelecionado;
});

 const iconeConta = String(
  contaSelecionada?.icone_url ||
  contaSelecionada?.icone ||
  contaSelecionada?.url_icone ||
  contaSelecionada?.logo_url ||
  contaSelecionada?.banco_icone_url ||
  ""
).trim();

console.log("contaId:", contaId);
console.log("contaSelecionada:", contaSelecionada);
console.log("iconeConta:", iconeConta);
 

return (
  <div className="flex h-[calc(100vh-20px)] gap-4 p-4 overflow-hidden">
    <div className={`${drawerNovo ? "w-[65%]" : "w-full"} space-y-4 overflow-y-auto transition-all duration-300`}> 

    {msgEstorno && (
  <div className="mb-4 rounded-xl border border-amber-400 bg-amber-150 px-5 py-3 text-base font-bold text-amber-800 shadow-sm">
    {msgEstorno}
  </div>
)}

    {mostrarAlerta && (
  <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-yellow-100 text-red px-6 py-3 rounded shadow-lg animate-bounce z-50">
    ⚠️ {t("lancamentos.alertaProcessamentoContabil", "Após finalizar todos lançamentos do dia, não esqueça de realizar o processamento contábil")}{" — "}
    <a href="/processar-diario" className="underline font-bold">
      {t("lancamentos.acesseAqui", "Acesse aqui")}
    </a>
  </div>
)}

    {/* HEADER */}
   <div className="flex justify-between items-start">
  
    <h1 className="text-2xl font-bold text-blue-800">{t("lancamentos.titulo", "Transações Financeiras")}</h1>
  <div>

  
   
    
  </div> 
         {/* BOTÃO HELP  
         <div className="flex items-center gap-2 mt-3"> 
            {tipoOperacao !== undefined && tipoOperacao !== null && ( 
            <div className="mt-3 ml-3 flex justify-center">
              <div className="rounded-2xl border border-blue-400 bg-white px-6 py-3 shadow-sm  ">
                <span className="text-base text-slate-600">
                Filtro de:{" "}
                  <span className="font-bold text-blue-700">
                    {RelatorioEscolhido(tipoOperacao)}
                  </span>
                  {" — Encontrados "}
                  <span className="font-bold text-slate-700 text-blue-700">
                    {qtdRegistros}
                  </span>
                  {" registros"}
                      </span>
                  </div> 
              </div> 
            )}      
    </div> */}

  <div className="flex gap-4 text-base font-semibold">
         

    <div className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-800 whitespace-nowrap">
  {RelatorioEscolhido(tipoOperacao || "transacao")} • {dataIni || "--"} até {dataFim || "--"} • Conta:{" "}
  {filtroContaId
    ? contas.find((c) => String(c.id) === String(filtroContaId))?.nome || t("lancamentos.selecionada", "Selecionada")
    : t("lancamentos.todas", "Todas")}{" "}
  • {t("lancamentos.busca", "Busca")}: {busca || t("lancamentos.semBusca", "Sem busca")}
        </div>     
          
            <button
          onClick={() => {
            setFiltroTemp({
          dataIni,
          dataFim,
          filtroContaId,
          busca,
          tipoOperacao,
        });
            setModalFiltro(true);
          }}
            title="Filtro de registros"
          className="btn-pill btn-white flex items-center gap-2"
        >
          <Funnel size={16} />
          {t("lancamentos.filtros", "Filtros")}
        </button> 
 
          
     <button
      onClick={VisaoFinanceira}
      title="Mostra saldo atual, contas abertas, vencidos e projeção dos próximos 30 dias"
      className="btn-pill btn-white"
    >
      <BarChart3 size={17} /> {t("lancamentos.visaoFinanceira", "Visão Financeira")}
</button>

          
     <button
      onClick={ContaRecorrente}
       title="Gerar e revisar contas fixas ou recorrentes, como aluguel, internet e assinaturas"
       className="btn-pill btn-white"
   >
      <Repeat size={16} /> {t("lancamentos.transacoesRecorrentes", "Transações recorrentes")}
    </button>

     <button
      onClick={ReclassifacaoContabil}
       title="Revisar lançamentos sem classificação contábil correta"
       className="btn-pill btn-white"
   >
        <ScrollText size={16} /> {t("lancamentos.reclassificacao", "Reclassificação")} 
    </button>


     
     <button
      onClick={ImportarExtrato}
        title="Importar extrato bancário para conciliação e lançamento automático"
       className="btn-pill btn-white"
   >
        <FilePlus size={16} /> {t("lancamentos.importar", "Importar")} 
    </button>


     <button
      //onClick={abrirNovoLancamento}
       onClick={() => {
        setTipoNovo(null);
        setDrawerNovo(true);
      }}
       className="btn-pill btn-emerald"
                    >
      + {t("lancamentos.novoLancamento", "Novo lançamento")}
    </button>

     {/*} <button
      onClick={abrirNovaReceita}
       className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
    >
      💰 Nova receita
     </button>*/}

    <a
      href="#"
      onClick={() => window.print()}
              className="btn-pill btn-black"
                    >
      🖨️ {t("lancamentos.imprimir", "Imprimir")}
    </a>
  </div>
</div>


    {/* CARDS SUPERIORES */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* TOTAL DO PERÍODO  
      
    
   
 
      {/* CONTA BANCÁRIA  
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
      </div>*/}
    </div>

    {/* FILTROS */}
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-2">

         <div hidden={true}>
          <label className="text-sm font-semibold text-gray-700">{t("lancamentos.dataInicio", "Data início")}</label>
          <input
            type="date"
            value={dataIni}
            visibled = {false}
            max={hojeLocal()}
            onChange={(e) => setDataIni(e.target.value)}
            className="block border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div hidden={true}>
          <label className="text-sm font-semibold text-gray-700">{t("lancamentos.dataFim", "Data fim")}</label>
          <input
            type="date"
            value={dataFim}
            visibled = {false}
           // max={hojeMaisDias(15)}
            onChange={(e) => setDataFim(e.target.value)}
            className="block border rounded-lg px-3 py-2 text-sm"
            />
          </div>

        <div>
           
         

         <div className="flex items-end gap-2">
             <div>
            <label className="text-sm font-semibold text-gray-700">
              {t("lancamentos.contaBancaria", "Conta Bancária")}
            </label>

            {(() => {
              const contaSelecionada = contas.find((c) => {
                const id = c.id ?? c.conta_id;
                return String(id) === String(contaId);
              });

              return (
                <div className="flex items-center gap-2">
                  {iconeConta ? (
            <img
              src={iconeConta}
              alt="Banco"
              className="w-8 h-8 rounded-full object-contain border bg-white"
            />
          ) : (
            <div className="w-8 h-8 rounded-full border bg-gray-100 flex items-center justify-center text-sm">
              🏦
            </div>
          )}

        <select
          value={contaId}
          ref={contaRef}
          onChange={(e) => {
            if (e.target.value === "__nova__") {
              setModalConta(true);
              return;
            }

            setContaId(e.target.value);
          }}
          className="block border rounded-lg px-3 py-2 text-base text-blue-900 font-bold min-w-[320px]"
        >
          <option value="">{t("lancamentos.selecione", "Selecione")}</option>

          {contas.map((c) => {
            const id = c.id ?? c.conta_id;

            return (
              <option key={id} value={String(id)}>
                {labelContaDrop(c)}
              </option>
            );
          })}

          <option value="__nova__">➕ {t("lancamentos.novaContaFinanceira", "Nova Conta Financeira")}</option>
        </select>
      </div>
    );
  })()}
</div>
        {dadosConta && (
            <div className="flex flex-col">
              <label className="text-sm font-bold text-blue-800">
                {t("lancamentos.saldoConta", "Saldo Conta")}
              </label>

              <div className="rounded-lg border-2 border-blue-700 bg-white px-4 py-2 text-sm font-black whitespace-nowrap text-blue-700">
                {Number(dadosConta.saldo_final || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            </div>
          )}
          </div>
  
        </div>
        {/* BUSCA */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700  mt-4">
              {t("lancamentos.busca", "Busca")}
            </label>

            <input
              type="text"
              placeholder={t("lancamentos.placeholderBusca", "🔎 Buscar transação...")}
              value={busca}
              onChange={(e) => setBusca(e.target.value.toLowerCase())}
              className="px-3 py-2 border rounded-lg w-64"
            />
          </div>
         
     

      
                  
                <div className="flex gap-3 text-sm font-semibold"> 
              
                    <select
                      value={tipoOperacao}
                      onChange={(e) => escolherFiltro(e.target.value)}
                      className="px-5 py-3 rounded-full border-2 border-blue-500 bg-white text-sm font-bold text-blue-700 shadow hover:bg-blue-250"
                    >
                      <option value="">{t("lancamentos.escolhaConsulta", "Escolha uma consulta")}</option>
                      <option value="transacao">💰 {t("lancamentos.aVista", "À vista")}</option>
                      <option value="conta_receber">📥 {t("lancamentos.aReceber", "A receber")}</option>
                      <option value="conta_pagar">📤 {t("lancamentos.aPagar", "A pagar")}</option>
                      <option value="cartao_compra">💳 {t("lancamentos.comprasCartao", "Compras cartão")}</option>
                      <option value="fatura_cartao">💳 {t("lancamentos.faturas", "Faturas")}</option>
                      <option value="vence_hoje">⏰ {t("lancamentos.vencimentos", "Vencimentos")}</option>
                      <option value="vencidos">🔴 {t("lancamentos.vencidos", "Vencidos")}</option>
                      <option value="vence_sete_dias">📅 {t("lancamentos.venceSeteDias", "Vence 7 dias")}</option>
                      <option value="estorno">🔁 {t("lancamentos.estornados", "Estornados")}</option>
                      <option value="titulos_pagos">✅ {t("lancamentos.baixados", "Baixados")}</option>
                    </select>

                </div>

                 <button
                  onClick={() => pesquisar(tipoOperacao || "")}
                  className="btn-pill btn-dark-blue"
                >
                  🔎 {t("lancamentos.consultar", "Consultar")}
                </button>

                 <button
                  onClick={executarSelecionados}
                  disabled={!permiteSelecao() || selecionados.length === 0}
                  className={`
                    btn-pill ${corBotaoSelecionado()}
                    disabled:opacity-90 disabled:cursor-not-allowed
                    ${piscarBotaoAcao ? "animate-pulse ring-4 ring-yellow-300 scale-105" : ""}
                  `}
                >
                  {tipoOperacao === "estorno"
                    ? t("lancamentos.somenteConsulta", "Somente consulta")
                    : labelBotaoSelecionados()}
                </button>
            
               
 
                
      </div>
    </div>

    

    {/* TABELA */}
    <div className="bg-gray-650 rounded-xl shadow-sm overflow-x-auto">
      {listaFiltrada.length === 0 ? (
        <p className="p-4 text-sm text-gray-50">{t("lancamentos.nenhumLancamento", "Nenhum lançamento encontrado.")}</p>
      ) : (
        <table className="w-full text-sm ">
          <thead className="bg-gray-200 text-gray-600 text-black">
            <tr>
             {permiteSelecao() && ( <th className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={
                    listaFiltrada.length > 0 &&
                    listaFiltrada.every((l) => selecionados.includes(getUid(l)))
                  }
                  onChange={() => {
                    toggleSelecionarTodos();
                    chamarAtencaoBotaoAcao();
                  }}
                  
                />
              </th> )}
               <th className="px-3 py-2 text-left text-black">id</th>
              <th className="px-3 py-2 text-left text-balck">{t("lancamentos.descricao", "Descrição")}</th>
               <th className="px-3 py-2 text-center  font-bold text-black">{t("lancamentos.dataMovimento", "Data Movimento")}</th> 

              {lista.some(l => l.tipo_operacao === "fatura_cartao") ? (
                <>
                  <th className="px-3 py-2 text-left text-black">{t("lancamentos.nome", "Nome")}</th>
                  <th className="px-3 py-2 text-left text-black">{t("lancamentos.numero", "Número")}</th>
                </>
              ) : (
                <>
                {/*}  <th className="px-3 py-2 text-left text-white">Categoria</th>*/}
                  <th className="px-3 py-2 text-left text-black">{t("lancamentos.conta", "Conta")}</th>
                </>
              )}
              <th className="px-3 py-2 text-left text-black">{t("lancamentos.tipo", "Tipo")}</th> 
                {temTransacao && (
                    <th className="px-3 py-2 text-left text-black">{t("lancamentos.origem", "Origem")}</th>
                  )}

                <th className="px-3 py-2 text-left text-black">{t("lancamentos.classificacao", "Classificação")}</th>
                  <th className="px-3 py-2 text-left text-black">{t("lancamentos.formaPagamento", "Forma Pagamento")}</th>
                
              
                 {!temTransacao && (
               <>   <th className="px-3 py-2 text-left">{t("lancamentos.parcela", "Parcela")}</th>
                  <th className="px-3 py-2 text-left">{t("lancamentos.parcelaTotal", "Parcela Total")}</th> </> )}
                <th className="px-3 py-2 text-left">{t("lancamentos.vencimento", "Vencimento")}</th>
              {!temTransacao && (
               <>     <th className="px-3 py-2 text-left">{t("lancamentos.vencido", "Vencido")}</th>
                 <th className="px-3 py-2 text-left">{t("lancamentos.status", "Status")}</th> </> )}
              <th className="px-3 py-2 text-right">{t("lancamentos.valor", "Valor")}</th>
              {temTransacao && (
                 <>  <th className="px-3 py-2 text-right">{t("lancamentos.estorno", "Estorno")}</th> </> )}
                <th className="px-3 py-2 text-left ">{t("lancamentos.tipoEvento", "Tipo Evento")}</th>
                 <th className="px-3 py-2 text-left ">{t("lancamentos.acao", "Ação")}</th>
              
            </tr>
          </thead>  

          <tbody>

            
            {listaFiltrada.map((l, i) => (

                 <tr
                      key={getUid(l)}
                      onDoubleClick={(e) => {
                        if (e.target.closest("button") || e.target.closest("input")) return;
                        editarLancamento(l);
                      }}
                      title="Clique duas vezes para editar"
                      className="border-t hover:bg-blue-50 cursor-pointer"
                    >
                 {permiteSelecao() && ( <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selecionados.includes(getUid(l))}
                      onChange={() => toggleSelecionado(l)}

                    />
                  </td>)}
                   
                 <td className="px-3 py-2 text-left font-bold">{l.id}</td>
                  <td className="px-3 py-2 whitespace-normal break-words max-w-[200px]"> {l.descricao}</td>
                  <td className="px-3 py-2 font-bold text-center ">{l.data}</td>
                 {l.origem === "fatura_cartao" ? (
                      <>
                        <td className="px-3 py-2">{l.nome || "-"}</td>
                        <td className="px-3 py-2">{l.numero || "-"}</td>
                      </>
                    ) : (
                      <>
                        {/*<td className="px-3 py-2 whitespace-normal break-words max-w-[200px]">
                          {l.categoria_nome}
                        </td>*/}
                          <td className="px-3 py-2 whitespace-normal break-words max-w-[200px]"> {l.conta_nome}</td>
                      </>
                    )}
                <td className={`px-3 py-2 font-semibold ${l.tipo === "Entrada" ? "text-green-600" : "text-red-600"}`}>
                  {l.tipo}
                </td>
                    {temTransacao && (
                <td className="px-3 py-2 text-left">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          l.origem === "conta_pagar"
                            ? "bg-red-100 text-red-700"
                            : l.origem === "conta_receber"
                            ? "bg-green-100 text-green-700"
                            : l.origem === "fatura_cartao"
                            ? "bg-purple-100 text-purple-700"
                            : l.origem === "estorno"
                            ? "bg-gray-200 text-gray-700"
                            : l.origem === "compra_cartao"
                             ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                          
                        }`} 
                      >
                        {l.origem === "conta_pagar"
                          ? t("lancamentos.pagar", "Pagar")
                          : l.origem === "conta_receber"
                          ? t("lancamentos.receber", "Receber")
                          : l.origem === "fatura_cartao"
                          ? t("lancamentos.pagarFatura", "Pagar Fatura")
                          : l.origem === "estorno"
                          ? t("lancamentos.estornoOperacao", "Estorno operação")
                           : l.origem === "compra_cartao"
                           ? t("lancamentos.cartao", "Cartão")
                          : t("lancamentos.financeiro", "Financeiro")}
                      </span>
                    </td> )}

                 <td className="px-3 py-2 font-medium text-center ">{l.classificacao}</td>
                   <td className="px-3 py-2 font-medium text-center">
                        {formaLabel[l.forma] || l.forma}
                      </td>
               
               {!temTransacao && (   
                <td className="px-3 py-2  text-center">
                    {Number(l.parcelas) > 0 ? l.parcelas : "-"}
                  </td>)}

                  {!temTransacao && (     <td className="px-3 py-2 text-center">
                    {Number(l.parcela_total) > 0 ? l.parcela_total : "-"}
                  </td>)}
                   <td className="px-3 py-2 text-center">{formatarDataBR(l.vencimento)}</td>
                       {!temTransacao && (<td className="px-3 py-2 text-left">
                             <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    l.vencido === "sim"
                                      ? "bg-red-100 text-red-700"
                                      : l.vencido === "nao"
                                      ? "bg-green-100 text-green-700" 
                                      : "bg-yellow-100 text-yellow-700"
                                    
                                  }`}
                                >
                                  {l.vencido === "sim"
                                    ? t("lancamentos.sim", "Sim")
                                    : l.vencido === "nao"
                                    ? t("lancamentos.nao", "Não") 
                                    : ""}
                                </span> 
                      </td> )}

                     {!temTransacao && (   <td className="px-3 py-2">
                     <td className="px-3 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            l.status === "paga" || l.status === "recebido"
                              ? "bg-green-100 text-green-700"
                              : l.status === "aberta" || l.status === "aberto"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {l.status || "-"}
                        </span>
                      </td>
                  </td>)}
                <td className="px-3 py-2 text-right font-semibold">{l.valor}</td>
                 {temTransacao && ( <td className="px-3 py-2 text-right font-bold">{l.origem_id}</td>)}
                 <td className="px-3 py-2 text-left">
                   
                     <span
                      className={`px-3 py-1 rounded-full text-xs font-bold  text-center ${
                        l.tipo_operacao === "conta_pagar"
                          ? "bg-red-100 text-red-700"
                          : l.tipo_operacao === "conta_receber"
                          ? "bg-green-100 text-green-700"
                          : l.tipo_operacao === "cartao_compra"
                          ? "bg-blue-100 text-blue-700"
                          : l.tipo_operacao === "fatura_cartao"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {l.tipo_operacao === "conta_pagar"
                        ? t("lancamentos.aPagar", "A pagar")
                        : l.tipo_operacao === "conta_receber"
                        ? t("lancamentos.aReceber", "A receber")
                        : l.tipo_operacao === "cartao_compra"
                        ? t("lancamentos.compraCartao", "Compra cartão")
                        : l.tipo_operacao === "fatura_cartao"
                        ? t("lancamentos.faturaCartao", "Fatura cartão")
                        : t("lancamentos.financeiro", "Financeiro")}
                    </span>
                    </td>
                  
                <td className="px-3 py-2 text-center space-x-2">
                  
                {/*} {l.tipo_operacao === "transacao" && (
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
                  )}*/}

                 
                    {/*{l.tipo_operacao !== "cartao_compra" && l.tipo_operacao !== "transacao" && (
                          <button
                            onClick={() => processarTitulo(l, contaId)}
                            disabled={l.status !== "aberto" && l.status !== "aberta"}
                            className={`font-semibold underline ${
                              l.status !== "aberto" && l.status !== "aberta"
                                ? "text-gray-600 cursor-not-allowed"
                                : l.tipo_operacao === "conta_receber"
                                ?  "bg-blue-100 text-blue-700"
                                :  "bg-red-100 text-red-700"
                            }`}
                          >    
                            {l.tipo_operacao === "conta_receber"
                              ? l.status === "aberto" || l.status === "aberta"
                                ? "Receber"
                                : " Recebido"
                              : l.tipo_operacao === "fatura_cartao"
                              ? l.status === "aberto" || l.status === "aberta"
                                ? "Aberto"
                                : "Fatura paga"
                              : l.status === "aberto" || l.status === "aberta"
                              ? t("lancamentos.pagar", "Pagar")
                              : "Pago"}
                          </button>
                        )}*/}
        

                    {["cartao_compra", "conta_pagar", "conta_receber"].includes(l.tipo_operacao) && (
                      <button
                      onClick={() => {
                        if (
                          (l.tipo_operacao === "conta_pagar" && l.status === "pago") ||
                          (l.tipo_operacao === "conta_receber" && l.status === "recebido")
                        ) return;

                        excluir(l.id,l.tipo_operacao);
                      }}
                      disabled={
                        (l.tipo_operacao === "conta_pagar" && l.status === "pago") ||
                        (l.tipo_operacao === "conta_receber" && l.status === "recebido")
                      }
                      className={
                        (l.tipo_operacao === "conta_pagar" && l.status === "pago") ||
                        (l.tipo_operacao === "conta_receber" && l.status === "recebido")
                          ? "text-gray-400 cursor-not-allowed font-semibold"
                          : "text-red-600 hover:underline font-semibold"
                      }
                    >
                      {t("lancamentos.excluir", "Excluir")}
                    </button>
                  )}


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
            title={t("lancamentos.novaContaFinanceira", "Nova Conta Financeira")}
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


          <ModalBase
            open={modalFiltro}
            onClose={() => setModalFiltro(false)}
            title={t("lancamentos.filtros", "Filtros")}
          >
            <div className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {t("lancamentos.dataInicio", "Data início")}
                </label>
                <input
                  type="date"
                  value={filtroTemp.dataIni}
                  max={hojeLocal()}
                  onChange={(e) =>
                    setFiltroTemp((p) => ({ ...p, dataIni: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("lancamentos.dataFim", "Data fim")}
                  </label>
                  <input
                    type="date"
                    value={filtroTemp.dataFim}
                    onChange={(e) =>
                      setFiltroTemp((p) => ({ ...p, dataFim: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t("lancamentos.contaBancaria", "Conta bancária")}
                  </label>
                  <select
                   value={filtroTemp.filtroContaId}
                    onChange={(e) =>
                       setFiltroTemp((p) => ({ ...p, filtroContaId: e.target.value }))
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">{t("lancamentos.todas", "Todas")}</option>
                    {contas.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {labelContaDrop(c)}
                      </option>
                    ))}
                  </select>
                </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {t("lancamentos.tipoConsulta", "Tipo de consulta")}
                </label>
                <select
                  value={filtroTemp.tipoOperacao}
                  onChange={(e) =>
                    setFiltroTemp((p) => ({ ...p, tipoOperacao: e.target.value }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="transacao">{t("lancamentos.aVista", "À vista")}</option>
                  <option value="conta_receber">{t("lancamentos.aReceber", "A receber")}</option>
                  <option value="conta_pagar">{t("lancamentos.aPagar", "A pagar")}</option>
                  <option value="cartao_compra">{t("lancamentos.comprasCartao", "Compras cartão")}</option>
                  <option value="fatura_cartao">{t("lancamentos.faturas", "Faturas")}</option>
                  <option value="vence_hoje">{t("lancamentos.vencimentosHoje", "Vencimentos hoje")}</option>
                  <option value="vencidos">{t("lancamentos.vencidos", "Vencidos")}</option>
                  <option value="vence_sete_dias">{t("lancamentos.venceSeteDias", "Vence 7 dias")}</option>
                  <option value="estorno">{t("lancamentos.estornados", "Estornados")}</option>
                  <option value="titulos_pagos">{t("lancamentos.baixados", "Baixados")}</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  {t("lancamentos.buscarHistorico", "Buscar no histórico")}
                </label>
                <input
                  type="text"
                  value={filtroTemp.busca}
                  onChange={(e) =>
                    setFiltroTemp((p) => ({ ...p, busca: e.target.value }))
                  }
                  placeholder={t("lancamentos.placeholderHistorico", "Ex: pix, carne, gasolina...")}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

            <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                setFiltroTemp({
                  dataIni: hojeLocal(),
                  dataFim: hojeLocal(),
                  filtroContaId: "",
                  busca: "",
                  tipoOperacao: "transacao",
                });
              }}
              className="btn-pill btn-white"
            >
              {t("lancamentos.limpar", "Limpar")}
            </button>

      <button
        type="button"
        onClick={() => {
            setDataIni(filtroTemp.dataIni);
            setDataFim(filtroTemp.dataFim);
            setFiltroContaId(filtroTemp.filtroContaId);
            setBusca(filtroTemp.busca.toLowerCase());
            setTipoOperacao(filtroTemp.tipoOperacao);

            setModalFiltro(false);

            setTimeout(() => {
              pesquisar(filtroTemp.tipoOperacao, filtroTemp.filtroContaId);
            }, 50);
          }}
        className="btn-pill btn-dark-blue"
      >
        {t("lancamentos.aplicarFiltros", "Aplicar filtros")}
      </button>
    </div>
  </div>
</ModalBase>


    </div>

{drawerNovo && (
  <aside className="w-[42%] min-w-[420px] max-w-[700px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
    <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
      <button
        type="button"
        onClick={() => {
          if (tipoNovo) {
            setTipoNovo(null);
            return;
          }
          setDrawerNovo(false);
        }}
        className="rounded-full px-3 py-1 text-lg font-black text-blue-800 hover:bg-blue-100"
      >
        ←
      </button>

      <span className="text-sm font-black text-blue-900">
        {!tipoNovo ? t("lancamentos.novoLancamento", "Novo lançamento") : tipoNovo.titulo}
      </span>

      <button
        type="button"
        onClick={() => {
          setTipoNovo(null);
          setDrawerNovo(false);
        }}
        className="rounded-full px-3 py-1 text-lg font-black text-slate-500 hover:bg-slate-200"
      >
        ✕
      </button>
    </div>

    <div className="h-[calc(100vh-88px)] overflow-y-auto bg-slate-50 p-3">
      {!tipoNovo && (
        <div className="space-y-3">
          <h2 className="px-2 text-base font-black text-blue-900">
            {t("lancamentos.oQueDesejaRegistrar", "O que deseja registrar?")}
          </h2>

          <div className="rounded-2xl border bg-white p-2 shadow-sm">
            <div className="mb-2 text-sm font-black text-emerald-700">
              📥 {t("lancamentos.recebimento", "Recebimento")}
            </div>

            <div className="space-y-1.5">
              {[
                [t("lancamentos.aVista", "À vista"), "avista", t("lancamentos.recebimentoAVista", "Recebimento à vista")],
                ["Pix", "pix", t("lancamentos.recebimentoViaPix", "Recebimento via Pix")],
                [t("lancamentos.cartaoDebito", "Cartão débito"), "cartao_debito", t("lancamentos.recebimentoCartaoDebito", "Recebimento no cartão de débito")],
                [t("lancamentos.cartaoCredito", "Cartão crédito"), "cartao_credito", t("lancamentos.recebimentoCartaoCredito", "Recebimento no cartão de crédito")],
                [t("lancamentos.aPrazo", "A prazo"), "aprazo", t("lancamentos.contaAReceber", "Conta a receber")],
              ].map(([label, forma, titulo]) => (
                <button
                  key={forma}
                  type="button"
                  onClick={() =>
                    setTipoNovo({
                      titulo,
                      tipo: "entrada",
                      forma_recebimento: forma,
                      classificacao: "receita",
                    })
                  }
                  className="flex w-full items-center justify-between rounded-lg border bg-slate-50 px-3 py-2 text-left hover:bg-emerald-50"
                >
                  <span className="text-sm font-bold text-slate-800">
                    {label}
                  </span>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-emerald-600" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-2 shadow-sm">
            <div className="mb-2 text-sm font-black text-red-700">
              📤 {t("lancamentos.pagamento", "Pagamento")}
            </div>

            <div className="space-y-1.5">
              {[
                [t("lancamentos.aVista", "À vista"), "avista", t("lancamentos.pagamentoAVista", "Pagamento à vista")],
                ["Pix", "pix", t("lancamentos.pagamentoViaPix", "Pagamento via Pix")],
                [t("lancamentos.cartaoDebito", "Cartão débito"), "cartao_debito", t("lancamentos.pagamentoCartaoDebito", "Pagamento no cartão de débito")],
                [t("lancamentos.cartaoCredito", "Cartão crédito"), "cartao_credito", t("lancamentos.pagamentoCartaoCredito", "Pagamento no cartão de crédito")],
                [t("lancamentos.aPrazo", "A prazo"), "aprazo", t("lancamentos.contaAPagar", "Conta a pagar")],
              ].map(([label, forma, titulo]) => (
                <button
                  key={forma}
                  type="button"
                  onClick={() =>
                    setTipoNovo({
                      titulo,
                      tipo: "saida",
                      forma_pagamento: forma,
                      classificacao: "despesa",
                    })
                  }
                  className="flex w-full items-center justify-between rounded-lg border bg-slate-50 px-3 py-2 text-left hover:bg-red-50"
                >
                  <span className="text-sm font-bold text-slate-800">
                    {label}
                  </span>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-red-600" />
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setTipoNovo({
                titulo: t("lancamentos.transferenciaEntreContas", "Transferência entre contas"),
                tipo: "transferencia",
              })
            }
            className="flex w-full items-center justify-between rounded-2xl border bg-white px-4 py-3 text-left shadow-sm hover:bg-blue-50"
          >
            <div>
              <div className="text-sm font-black text-blue-800">
                🔄 {t("lancamentos.transferencia", "Transferência")}
              </div>
              <div className="text-xs font-bold text-slate-500">
                {t("lancamentos.transferenciaDescricao", "Movimentar valor entre contas bancárias")}
              </div>
            </div>

            <span className="h-4 w-4 rounded-full border-2 border-blue-700" />
          </button>


            <button
                  type="button"
                  onClick={() =>
                    setTipoNovo({
                      titulo: "Lançamento Livre",
                      tipo: "livre",
                      livre: true,
                    })
                  }
                  className="flex w-full items-center justify-between rounded-2xl border bg-white px-4 py-3 text-left shadow-sm hover:bg-blue-50"
                >
                  <div>
                    <div className="text-sm font-black text-blue-800">
                      <ClipboardEdit size={18} /> Lançamento Livre
                    </div>
                    <div className="text-xs font-bold text-slate-500">
                      Registre algo que aconteceu, mesmo sem movimentar dinheiro
                    </div>
                  </div>

                  <span className="h-4 w-4 rounded-full border-2 border-blue-700" />
                </button>








        </div>
      )}

      {tipoNovo?.tipo === "transferencia" && (
        <TransferenciaDrawer
          onClose={() => {
            setTipoNovo(null);
            setDrawerNovo(false);
          }}
          onSuccess={() => {
            setDrawerNovo(false);
            setTipoNovo(null);
            pesquisar(tipoOperacao || "");
          }}
        />
      )}

       {tipoNovo && !["transferencia", "livre"].includes(tipoNovo.tipo) && (
        <NovoLancamentoDrawer
          inicial={tipoNovo}
          onBack={() => setTipoNovo(null)}
          onClose={() => {
            setTipoNovo(null);
            setDrawerNovo(false);
          }}
          onSuccess={() => {
            setDrawerNovo(false);
            setTipoNovo(null);
            pesquisar(tipoOperacao || "");
          }}
        /> 
      )}


      {tipoNovo?.tipo === "livre" && (
  <LancamentoContabilRapido
    livre={true}
    drawer={true}
    onClose={() => {
      setTipoNovo(null);
      setDrawerNovo(false);
    }}
    onSuccess={() => {
      setDrawerNovo(false);
      setTipoNovo(null);
      pesquisar(tipoOperacao || "");
    }}
  />
)}
    </div>
  </aside>
)}
    
 
  </div>
);

  
}