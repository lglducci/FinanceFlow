    import { useEffect, useRef, useState } from "react";
 
import { createPortal } from "react-dom";
import { buildWebhookUrl } from "../config/globals";
import QuadroConferenciaRecebiveis from "../components/QuadroConferenciaRecebiveis";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";

import {
  useLocation,
  useNavigate
} from "react-router-dom";

import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const moeda = (v) =>
  Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const inicioMes = () => `${hojeLocal().slice(0, 7)}-01`;
 

export default function ConciliacaoExtratoPdf() {
  const navigate = useNavigate();
  const [ajudaAberta, setAjudaAberta] = useState(false);
  const inputPdfRef = useRef(null);

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [contas, setContas] = useState([]);
  const [indiceConta, setIndiceConta] = useState(0);
  const [inicio, setInicio] = useState(hojeMaisDias(-58));
  const [fim, setFim] = useState(hojeLocal());
 
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const [abaAtiva, setAbaAtiva] = useState("pendencias");
  const [dadosContabeis, setDadosContabeis] = useState([]);
  const [carregandoContabil, setCarregandoContabil] = useState(false);
  const [erroContabil, setErroContabil] = useState("");
  const [quadroAberto, setQuadroAberto] = useState(false);

  const contaAtual = contas[indiceConta] || null;
  const contaId = contaAtual?.conta_id || null;
 

const [executando, setExecutando] = useState(false);
const CHAVE_CONCILIACAO = "ff_conciliacao_extrato_atual";

const [contasContabeis, setContasContabeis] = useState([]);
 
const [avisoReexecutar, setAvisoReexecutar] =
  useState(false);


  const [linhaContaDropdown, setLinhaContaDropdown] =
  useState(null);

const [buscaContaContabil, setBuscaContaContabil] =
  useState("");
 const location = useLocation();



const [modalReclassificarAberto, setModalReclassificarAberto] =
  useState(false);

const [linhaReclassificar, setLinhaReclassificar] =
  useState(null);

const [contaReclassificar, setContaReclassificar] =
  useState(null);

const [buscaReclassificar, setBuscaReclassificar] =
  useState("");


const contasReclassificacaoFiltradas = contasContabeis.filter((conta) => {
  const busca = buscaReclassificar.toLowerCase().trim();

  if (!busca) return true;

  return `${conta.codigo || ""} ${conta.nome || ""}`
    .toLowerCase()
    .includes(busca);
});

function abrirModalReclassificar(item) {
  setLinhaReclassificar(item);
  setContaReclassificar(null);
  setBuscaReclassificar("");
  setModalReclassificarAberto(true);
}
async function confirmarReclassificacao() {
  if (!linhaReclassificar?.lote_id) {
    alert("Lote não identificado.");
    return;
  }

  if (!contaId) {
    alert("Conta financeira não identificada.");
    return;
  }

  if (!contaReclassificar?.id) {
    alert("Selecione a nova conta contábil.");
    return;
  }

  if (
    !window.confirm(
      `Reclassificar para ${contaReclassificar.codigo} - ${contaReclassificar.nome}?`
    )
  ) {
    return;
  }

  const linhaAlvo = linhaReclassificar;
  const novaConta = contaReclassificar;

  try {
    setExecutando(true);
    setErroContabil("");

    const resp = await fetch(
      buildWebhookUrl("reclassifica_contabil"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          empresa_id: Number(empresa_id),
          conta_id: Number(contaId),
          lote_id: Number(linhaAlvo.lote_id),
          conta_alterada_id: Number(novaConta.id),
        }),
      }
    );

    const textoResposta = await resp.text();

    if (!resp.ok) {
      throw new Error(
        textoResposta ||
        `Erro ao reclassificar o lançamento (${resp.status}).`
      );
    }

    const normalizarComparacao = (valor) =>
      String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9]/gi, "")
        .toUpperCase();

    const nomesBanco = [
      contaAtual?.nome,
      contaAtual?.conta_nome,
    ]
      .map(normalizarComparacao)
      .filter(Boolean);

    const codigosBanco = [
      contaAtual?.conta_contabil_codigo,
      contaAtual?.codigo_contabil,
      contaAtual?.contabil_codigo,
      contaAtual?.conta_codigo,
    ]
      .map(normalizarComparacao)
      .filter(Boolean);

    // Como a consulta do Razão está filtrada por conta financeira,
    // a conta bancária é a que se repete nas linhas do período.
    // Isso cobre os casos em que consultasaldo não devolve o código contábil.
    const ocorrenciasPorCodigo = dadosContabeis.reduce((mapa, item) => {
      [item.conta_debito_codigo, item.conta_credito_codigo]
        .map(normalizarComparacao)
        .filter(Boolean)
        .forEach((codigo) => {
          mapa.set(codigo, (mapa.get(codigo) || 0) + 1);
        });

      return mapa;
    }, new Map());

    const codigosPorFrequencia = [...ocorrenciasPorCodigo.entries()]
      .sort((a, b) => b[1] - a[1]);

    if (
      codigosPorFrequencia[0]?.[1] >= 2 &&
      codigosPorFrequencia[0]?.[1] > (codigosPorFrequencia[1]?.[1] || 0)
    ) {
      codigosBanco.push(codigosPorFrequencia[0][0]);
    }

    const correspondeAoBanco = (codigo, nome) => {
      const codigoNormalizado = normalizarComparacao(codigo);
      const nomeNormalizado = normalizarComparacao(nome);

      const codigoConfere =
        codigoNormalizado && codigosBanco.includes(codigoNormalizado);

      const nomeConfere =
        nomeNormalizado &&
        nomesBanco.some(
          (nomeBanco) =>
            nomeBanco === nomeNormalizado ||
            (nomeBanco.length >= 5 && nomeNormalizado.includes(nomeBanco)) ||
            (nomeNormalizado.length >= 5 && nomeBanco.includes(nomeNormalizado))
        );

      return Boolean(codigoConfere || nomeConfere);
    };

    const bancoNoDebito = correspondeAoBanco(
      linhaAlvo.conta_debito_codigo,
      linhaAlvo.conta_debito_nome
    );

    const bancoNoCredito = correspondeAoBanco(
      linhaAlvo.conta_credito_codigo,
      linhaAlvo.conta_credito_nome
    );

    if (bancoNoDebito !== bancoNoCredito) {
      // A conta banco permanece intacta; altera somente a contrapartida.
      setDadosContabeis((atual) =>
        atual.map((item) => {
          if (Number(item.lote_id) !== Number(linhaAlvo.lote_id)) {
            return item;
          }

          if (bancoNoDebito) {
            return {
              ...item,
              conta_credito_codigo: novaConta.codigo,
              conta_credito_nome: novaConta.nome,
            };
          }

          return {
            ...item,
            conta_debito_codigo: novaConta.codigo,
            conta_debito_nome: novaConta.nome,
          };
        })
      );
    } else {
      // Fallback seguro: atualiza somente a grade, sem recarregar a tela.
      await carregarContabilImportacao({
        empresaId: empresa_id,
        contaId,
        dataInicio: inicio,
        dataFim: fim,
      });
    }

    setModalReclassificarAberto(false);
    setLinhaReclassificar(null);
    setContaReclassificar(null);
    setBuscaReclassificar("");

    alert("Reclassificação realizada com sucesso.");
  } catch (err) {
    console.error("Erro ao reclassificar:", err);

    alert(
      err.message ||
      "Erro ao reclassificar o lançamento."
    );
  } finally {
    setExecutando(false);
  }
}

function normalizarRetorno(json) {
  const base = Array.isArray(json) ? json[0] : json;

  return (
    base?.fn_concilia_extrato ||
    base?.conciliaextrato ||
    base?.data?.[0]?.fn_concilia_extrato ||
    base?.data?.[0] ||
    base?.data ||
    base ||
    {}
  );
}


function normalizarRetornoContabil(json) {
  let linhas = [];

  if (Array.isArray(json)) {
    if (
      json.length === 1 &&
      (
        Array.isArray(json[0]?.data) ||
        Array.isArray(json[0]?.dados) ||
        Array.isArray(json[0]?.resultado)
      )
    ) {
      linhas =
        json[0].data ||
        json[0].dados ||
        json[0].resultado ||
        [];
    } else {
      linhas = json;
    }
  } else if (Array.isArray(json?.data)) {
    linhas = json.data;
  } else if (Array.isArray(json?.dados)) {
    linhas = json.dados;
  } else if (Array.isArray(json?.resultado)) {
    linhas = json.resultado;
  }

  return linhas.map(converterLinhaContabil);
}

useEffect(() => {
  const retorno = location.state;

  if (!retorno?.lancamento_criado) {
    return;
  }

  const conciliacaoId = retorno?.conciliacao_id;
  const origemId = retorno?.origem_id;

  setResultado((resultadoAtual) => {
    if (!resultadoAtual) {
      return resultadoAtual;
    }

    const acoesAtuais = Array.isArray(resultadoAtual.acoes)
      ? resultadoAtual.acoes
      : [];

    const novasAcoes = acoesAtuais.filter((acao) => {
      const mesmaConciliacao =
        conciliacaoId !== null &&
        conciliacaoId !== undefined &&
        Number(acao?.conciliacao_id) ===
          Number(conciliacaoId);

      const mesmaOrigem =
        origemId !== null &&
        origemId !== undefined &&
        String(acao?.origem_id) ===
          String(origemId);

      // Remove somente o registro que acabou de ser criado
      return !(mesmaConciliacao || mesmaOrigem);
    });

    const novoResultado = {
      ...resultadoAtual,
      acoes: novasAcoes,
    };

    /*
      Atualiza também o conteúdo guardado para que,
      se sair e voltar, o lançamento não apareça novamente.
    */
    try {
      const salvo = sessionStorage.getItem(
        CHAVE_CONCILIACAO
      );

      const dadosSalvos = salvo
        ? JSON.parse(salvo)
        : {};

      sessionStorage.setItem(
        CHAVE_CONCILIACAO,
        JSON.stringify({
          ...dadosSalvos,
          resultado: novoResultado,
          inicio,
          fim,
          indiceConta,
          conta_id: contaId,
          senhaPDF,
        })
      );
    } catch (err) {
      console.error(
        "Erro ao atualizar estado da conciliação:",
        err
      );
    }

    return novoResultado;
  });

  /*
    Limpa o state da navegação para o efeito não executar
    novamente em outra renderização.
  */
  navigate(location.pathname, {
    replace: true,
    state: null,
  });
}, [location.state]);

 

 

  async function carregarContas() {
    try {
      setErro("");

      const resp = await fetch(
        buildWebhookUrl("consultasaldo", {
          empresa_id,
          conta_id: 0,
          inicio,
          fim,
        })
      );

      if (!resp.ok) {
        throw new Error(`Erro ao consultar contas (${resp.status}).`);
      }

      const json = await resp.json();
      const base = Array.isArray(json) ? json : json?.data || json?.dados || [];

     const novasContas = Array.isArray(base) ? base : [];

              setContas(novasContas);

              /*
                Mantém a conta que o usuário estava usando.
                Só coloca a primeira conta quando ainda não existe seleção.
              */
              setIndiceConta((indiceAtual) => {
                if (!novasContas.length) {
                  return 0;
                }

                const contaSelecionadaSalva = (() => {
                  try {
                    const salvo = sessionStorage.getItem(
                      CHAVE_CONCILIACAO
                    );

                    const dados = salvo
                      ? JSON.parse(salvo)
                      : null;

                    return Number(dados?.conta_id || 0);
                  } catch {
                    return 0;
                  }
                })();

                if (contaSelecionadaSalva) {
                  const indiceSalvo = novasContas.findIndex(
                    (conta) =>
                      Number(conta?.conta_id) ===
                      contaSelecionadaSalva
                  );

                  if (indiceSalvo >= 0) {
                    return indiceSalvo;
                  }
                }

                if (indiceAtual >= 0 && indiceAtual < novasContas.length) {
                  return indiceAtual;
                }

                return 0;
              });



    } catch (e) {
      setErro(e.message || "Erro ao consultar contas.");
      setContas([]);
    }
  }


  useEffect(() => {
  if (!location.state?.lancamento_criado) {
    return;
  }

  setAvisoReexecutar(true);

  navigate(location.pathname, {
    replace: true,
    state: null,
  });
}, [location.state, location.pathname, navigate]);



  useEffect(() => {
    carregarContas();
  }, [empresa_id, inicio, fim]);

  function navegarConta(direcao) {
    if (!contas.length) return;

    setIndiceConta((atual) => {
      if (direcao === "anterior") {
        return atual === 0 ? contas.length - 1 : atual - 1;
      }

      return atual === contas.length - 1 ? 0 : atual + 1;
    });

    setResultado(null);
    setDadosContabeis([]);
    setErroContabil("");
    setAbaAtiva("pendencias");
  }

 

  function extrairResultado(retorno) {
  const bruto = Array.isArray(retorno)
    ? retorno[0]
    : retorno;

  return (
    bruto?.fn_concilia_extrato ||
    bruto?.conciliaextrato ||
    bruto?.data?.[0]?.fn_concilia_extrato ||
    bruto?.data?.[0] ||
    bruto?.data ||
    bruto ||
    {}
  );
}


 async function carregarContabilImportacao({
  empresaId,
  contaId: contaFinanceiraId,
  dataInicio: dataInicial,
  dataFim: dataFinal,
}) {
  if (!empresaId || !contaFinanceiraId || !dataInicial || !dataFinal) {
    setDadosContabeis([]);
    setErroContabil(
      "Não foi possível identificar empresa, conta ou período para consultar o Razão."
    );
    return [];
  }

  try {
    setCarregandoContabil(true);
    setErroContabil("");

    const resp = await fetch(buildWebhookUrl("contabil_importacao"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: Number(empresaId),
        conta_id: Number(contaFinanceiraId),
        data_inicio: dataInicial,
        data_fim: dataFinal,
      }),
    });

    const texto = await resp.text();

    if (!resp.ok) {
      throw new Error(
        texto || `Erro ao consultar o Razão do período (${resp.status}).`
      );
    }

    let json = [];
    try {
      json = texto ? JSON.parse(texto) : [];
    } catch {
      throw new Error(
        "O webhook contabil_importacao não retornou um JSON válido."
      );
    }

    const linhas = normalizarRetornoContabil(json);
    setDadosContabeis(linhas);
    return linhas;
  } catch (err) {
    console.error("Erro ao carregar Razão do período:", err);
    setDadosContabeis([]);
    setErroContabil(err?.message || "Erro ao consultar o Razão do período.");
    return [];
  } finally {
    setCarregandoContabil(false);
  }
} 


async function executarConciliacao() {
  if (!contaId) {
    alert("Conta financeira não identificada.");
    return;
  }

  if (!inicio || !fim) {
    alert("Informe a data inicial e a data final.");
    return;
  }

  if (inicio > fim) {
    alert("A data inicial não pode ser maior que a data final.");
    return;
  }

  try {
    setExecutando(true);
    setErro("");
    setErroContabil("");
    setResultado(null);
    setDadosContabeis([]);
    setAbaAtiva("pendencias");

    const resp = await fetch(
      buildWebhookUrl("conciliacao_extrato"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          empresa_id: Number(empresa_id),
          conta_id: Number(contaId),
          data_inicio: inicio,
          data_fim: fim,
        }),
      }
    );

    const texto = await resp.text();

    if (!texto.trim()) {
      throw new Error(
        "O webhook da conciliação não retornou resposta."
      );
    }

    let json;

    try {
      json = JSON.parse(texto);
    } catch {
      throw new Error(
        "O webhook da conciliação não retornou um JSON válido."
      );
    }

    console.log("JSON RECEBIDO:", json);

    const base = Array.isArray(json) ? json[0] : json;

    const dados =
      base?.fn_concilia_extrato_pdf_razao ||
      base?.data?.fn_concilia_extrato_pdf_razao ||
      base?.data?.[0]?.fn_concilia_extrato_pdf_razao ||
      base?.resultado ||
      base?.data ||
      base;

    console.log("OBJETO EXTRAÍDO:", dados);
    console.log("AÇÕES EXTRAÍDAS:", dados?.acoes);

    if (!resp.ok || !dados || dados?.ok === false) {
      throw new Error(
        dados?.message ||
        dados?.mensagem ||
        dados?.erro ||
        "Não foi possível executar a conciliação."
      );
    }

    const periodoInicio = dados?.data_inicio || inicio;
    const periodoFim = dados?.data_fim || fim;

    setResultado(dados);
    setInicio(periodoInicio);
    setFim(periodoFim);

    await carregarContabilImportacao({
      empresaId: empresa_id,
      contaId,
      dataInicio: periodoInicio,
      dataFim: periodoFim,
    });

    try {
      sessionStorage.setItem(
        CHAVE_CONCILIACAO,
        JSON.stringify({
          resultado: dados,
          inicio: periodoInicio,
          fim: periodoFim,
          indiceConta,
          conta_id: contaId,
        })
      );
    } catch (storageError) {
      console.error(
        "Erro ao guardar resultado da conciliação:",
        storageError
      );
    }
  } catch (err) {
    console.error("Erro na conciliação:", err);

    setErro(
      err?.message ||
      "Erro inesperado ao executar a conciliação."
    );
  } finally {
    setExecutando(false);
  }
}

{/*}
  const totalExtrato = Number(
    resultado?.total_extrato ?? resultado?.resumo?.total_extrato ?? 0
  );

  const totalRazao = Number(
    resultado?.total_razao ?? resultado?.resumo?.total_razao ?? 0
  );

  const conciliados = Number(
    resultado?.conciliados ?? resultado?.resumo?.conciliados ?? 0
  );

  const pendencias = Number(
    resultado?.pendencias ?? resultado?.resumo?.pendencias ?? 0
  );

  const diferenca = Number(
    resultado?.diferenca ??
      resultado?.resumo?.diferenca ??
      totalExtrato - totalRazao
  );*/}

  const acoes = Array.isArray(resultado?.acoes)
  ? resultado.acoes
  : [];

const pendencias = acoes.length;

const totalPdfPendente = acoes
  .filter((item) => item.origem === "P")
  .reduce((total, item) => total + Number(item.valor || 0), 0);

const totalRazaoPendente = acoes
  .filter((item) => item.origem === "R")
  .reduce((total, item) => total + Number(item.valor || 0), 0);

const criarLancamentos = acoes.filter(
  (item) => item.acao === "CRIAR_LANCAMENTO"
).length;

const excluirLotes = acoes.filter(
  (item) => item.acao === "EXCLUIR_LOTE"
).length;

const diferencaPendente =
  totalPdfPendente - totalRazaoPendente;


 

async function excluirLote(item) {
  const loteId = Number(item?.lote_id) || 0;

  if (!loteId) {
    alert("Este registro não possui lote para excluir.");
    return;
  }

  const confirmar = window.confirm(
    `ATENÇÃO\n\nVocê está excluindo o LOTE número ${loteId} do Razão.\n\nIsso apagará todos os lançamentos contábeis vinculados a esse lote.\n\nDeseja continuar?`
  );

  if (!confirmar) return;

  try {
    setExecutando(true);
    setErro("");

    const resp = await fetch(
      buildWebhookUrl("excluilanctolote"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          empresa_id: empresa_id,
          lote_id: loteId,
          importacao_id: 0,
        }),
      }
    );

    const texto = await resp.text();

    console.log("Resposta exclusão do lote:", texto);

    if (!texto.trim()) {
      throw new Error("O servidor não retornou resposta.");
    }

    const json = JSON.parse(texto);
    const retorno = Array.isArray(json) ? json[0] : json;
  
 

    if (!resp.ok || retorno?.ok === false) {
      throw new Error(
        retorno?.message ||
          retorno?.mensagem ||
          "Não foi possível excluir o lote."
      );
    }

    alert(`Lote ${loteId} excluído com sucesso!`);

    setDadosContabeis((atual) =>
  atual.filter((registro) => Number(registro.lote_id) !== loteId)
);

    setResultado((atual) => {
      if (!atual) return atual;

      return {
        ...atual,
        acoes: Array.isArray(atual.acoes)
          ? atual.acoes.filter(
              (acao) => Number(acao?.lote_id) !== loteId
            )
          : [],
      };
    });
  } catch (err) {
    console.error("Erro ao excluir lote:", err);
    setErro(err.message || "Erro ao excluir o lote.");
  } finally {
    setExecutando(false);
  }
}
 
async function buscarContaContabil(contaFinanceiraId) {
  if (!contaFinanceiraId) {
    throw new Error("Conta financeira não identificada.");
  }

  // COLOQUE AQUI O NOME EXATO DO SEU WEBHOOK
  const url = buildWebhookUrl("buscar_contabil_conta_financeira", {
    empresa_id,
    conta_id: contaFinanceiraId,
  });

  console.log("🔎 URL BUSCA CONTÁBIL:", url);

  const resp = await fetch(url);
  const texto = await resp.text();

  console.log("🔎 RETORNO BRUTO CONTA CONTÁBIL:", texto);

  if (!resp.ok) {
    throw new Error(
      texto || `Erro ao buscar conta contábil (${resp.status}).`
    );
  }

  let json;

  try {
    json = texto ? JSON.parse(texto) : null;
  } catch {
    throw new Error(
      "O webhook da conta contábil não retornou um JSON válido."
    );
  }

  console.log("🔎 JSON CONTA CONTÁBIL:", json);

  const base = Array.isArray(json) ? json[0] : json;

  const contabilId = Number(
    base?.contabil_id ??
    base?.contabilId ??
    base?.data?.contabil_id ??
    base?.data?.contabilId ??
    base?.data?.[0]?.contabil_id ??
    base?.data?.[0]?.contabilId ??
    base?.dados?.contabil_id ??
    base?.dados?.contabilId ??
    base?.dados?.[0]?.contabil_id ??
    base?.dados?.[0]?.contabilId ??
    base?.resultado?.contabil_id ??
    base?.resultado?.[0]?.contabil_id ??
    0
  );

  if (!contabilId) {
    throw new Error(
      `O webhook respondeu, mas não encontrei o contabil_id. Retorno: ${texto}`
    );
  }

  return contabilId;
}
  

 async function abrirNovoLancamento(item) {
  try {
    setErro("");

    const contabilId = await buscarContaContabil(contaId);

    const valorOriginal = Number(
      item?.valor_sugerido ??
      item?.valor ??
      0
    );

    navigate("/lancamentocontabilrapido", {
      state: {
        origem_tela: "CONCILIACAO_EXTRATO",

        data_movimento:
          item?.data_sugerida ||
          item?.data_mov,

        valor: Math.abs(valorOriginal),
        valor_original: valorOriginal,

        historico: item?.historico || "",
        tipo: item?.tipo || "",

        conciliacao_id:
          item?.conciliacao_id || null,

        origem_id:
          item?.origem_id || null,

        contabil_id: contabilId,

        lado_conta_financeira:
          valorOriginal > 0 ? "D" : "C",

        voltar_para:
          "/conciliacao-extrato",
      },
    });
  } catch (err) {
    console.error("Erro ao abrir lançamento:", err);

    setErro(
      err?.message ||
      "Não foi possível abrir o lançamento."
    );
  }
}

 async function criarLancamento(item) {
  const contraparteId = Number(item.contraparte_id || 0);
 const contaBancoId = await buscarContaContabil(contaId);

  if (!contaBancoId) {
    alert("Selecione a conta bancária.");
    return;
  }

  if (!contraparteId) {
    alert("Selecione a conta contábil da contrapartida.");
    return;
  }

  const entrada = item.tipo === "C";

  const contas = {
    debito_id: entrada ? contaBancoId : contraparteId,
    credito_id: entrada ? contraparteId : contaBancoId,
  };

  const dataLancto =
    item.data_mov ||
    item.data_movimento ||
    item.data_sugerida;

  if (!dataLancto || dataLancto === "null") {
    alert("A pendência não possui uma data válida.");
    return;
  }

  try {
    setExecutando(true);
    setErro("");

    const res = await fetch(buildWebhookUrl("lancto_modelo"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        empresa_id,
        data_lancto: dataLancto,
        debito_id: contas.debito_id,
        credito_id: contas.credito_id,
        valor: Math.abs(Number(item.valor || 0)),
        historico:
          item.historico ||
          item.descricao ||
          "Lançamento criado pela conciliação",
        lembrar: false,

        // Manda uma data válida em vez de null
        vencimento: dataLancto,
      }),
    });

    const json = await res.json();

    const retorno = Array.isArray(json)
      ? json[0]
      : json;

    if (!res.ok || retorno?.ok === false) {
      throw new Error(
        retorno?.message ||
        retorno?.mensagem ||
        "Erro ao criar lançamento contábil."
      );
    }

    // Retira a pendência criada da tela
    setResultado((atual) => ({
      ...atual,
      acoes: Array.isArray(atual?.acoes)
        ? atual.acoes.filter(
            (acao) =>
              Number(acao.conciliacao_id) !==
              Number(item.conciliacao_id)
          )
        : [],
    }));

    setLinhaContaDropdown(null);
  } catch (err) {
    console.error("Erro ao criar lançamento:", err);

    setErro(
      err.message ||
      "Erro ao criar lançamento contábil."
    );
  } finally {
    setExecutando(false);
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

 useEffect(() => {
  carregarContasContabeis();
}, [empresa_id]);

const contasFiltradasContabil = Array.isArray(contasContabeis)
  ? contasContabeis.filter((c) =>
      `${c.codigo || ""} ${c.nome || ""}`
        .toLowerCase()
        .includes(buscaContaContabil.toLowerCase())
    )
  : [];

  function selecionarContaContabilLinha(item, conta) {
  setResultado((atual) => {
    if (!atual || !Array.isArray(atual.acoes)) {
      return atual;
    }

    return {
      ...atual,
      acoes: atual.acoes.map((acao) =>
        Number(acao.conciliacao_id) ===
        Number(item.conciliacao_id)
          ? {
              ...acao,
              contraparte_id: conta.id,
              contraparte_codigo: conta.codigo,
              contraparte_nome: conta.nome,
            }
          : acao
      ),
    };
  });

  setLinhaContaDropdown(null);
  setBuscaContaContabil("");
}

 function separarRegistroPostgres(registro) {
  if (typeof registro !== "string") return [];

  const texto = registro.trim();

  const conteudo =
    texto.startsWith("(") && texto.endsWith(")")
      ? texto.slice(1, -1)
      : texto;

  const campos = [];
  let campo = "";
  let entreAspas = false;

  for (let i = 0; i < conteudo.length; i++) {
    const caractere = conteudo[i];

    if (caractere === '"') {
      if (entreAspas && conteudo[i + 1] === '"') {
        campo += '"';
        i++;
      } else {
        entreAspas = !entreAspas;
      }
    } else if (caractere === "," && !entreAspas) {
      campos.push(campo);
      campo = "";
    } else {
      campo += caractere;
    }
  }

  campos.push(campo);

  return campos;
}

function converterLinhaContabil(item) {
   if (!item?.ff_contabil_importacao) {
  return {
    ...item,
    origem:
      item?.origem ??
      item?.origem_registro ??
      null,
  };
}

  const campos = separarRegistroPostgres(
    item.ff_contabil_importacao
  );

  if (campos.length < 10) {
    console.warn(
      "Linha contábil em formato inesperado:",
      item
    );

    return item;
  }

  return {
  data_mov: campos[0] || null,

  transacao_id: campos[1] || null,
  diario_id: campos[2] || null,
  lote_id: campos[3] || null,

  conta_debito_codigo: campos[4] || null,
  conta_debito_nome: campos[5] || null,

  conta_credito_codigo: campos[6] || null,
  conta_credito_nome: campos[7] || null,

  valor: Number(campos[8] || 0),
  historico: campos[9] || null,
  modelo_codigo: campos[10] || null,
  origem: campos[11] || null,
};
}
 function imprimirAbaAtiva() {
  window.print();
}

  return ( 
   <div className="min-h-screen bg-[#eef7fd] px-1 py-2">
      {ajudaAberta && <AjudaConciliacaoExtrato onClose={() => setAjudaAberta(false)} />}
      <div className="mx-auto w-[98%] max-w-[1740px]">
         <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-[#ffffff] shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
           <div className="flex items-center justify-between gap-3 border-b px-5 py-3" style={{ background: "linear-gradient(110deg, #f0f5fc, #f4f8f9)", borderColor: "#d8e2ee", borderLeft: "3px solid #6d8caf" }}> 
              <div>
                <h1 className="text-base font-semibold text-slate-800">
                  📄 Conciliação de Extrato × Razão  
                </h1>

                <p className="mt-0.5 text-xs font-bold text-gray-500">
                  Extrato bancário x razão contábil
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={() => setAjudaAberta(true)} title="Ajuda" aria-label="Ajuda sobre conciliação de extrato e Razão" style={{width:28,height:28,background:'#ffffff',color:'#1d4ed8',border:'1px solid #bacce3'}} className="rounded-full text-sm font-bold">?</button>
                <button type="button" onClick={() => navigate(-1)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Sair</button>
              </div>
            </div>
           <div className="grid gap-2.5 lg:grid-cols-[1.45fr_0.55fr]">
            <div className="min-h-[185px] rounded-2xl border border-cyan-300 bg-white p-5 shadow-sm">
              <div className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
                Conta bancária
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navegarConta("anterior")}
                  className="h-10 w-10 shrink-0 rounded-full border bg-white font-black shadow-sm"
                >
                  ◀
                </button>

                {contaAtual ? (
                  <div
                    className="flex min-h-[105px] flex-1 items-center gap-4 rounded-3xl border px-4 py-3"
                    style={{
                      borderColor: contaAtual.cor_hex || "#bae6fd",
                      boxShadow: `0 8px 20px ${
                        contaAtual.cor_hex || "#0f172a"
                      }22`,
                    }}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-slate-50">
                      {contaAtual.icone_url ? (
                        <img
                          src={contaAtual.icone_url}
                          alt=""
                          className="h-9 w-9 object-contain"
                        />
                      ) : (
                        <span className="text-2xl">🏦</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-black text-slate-800">
                        {contaAtual.nome || contaAtual.conta_nome}
                      </div>

                      <div className="mt-1 text-xs font-bold text-slate-500">
                        Banco {contaAtual.nro_banco || "-"} • Ag.{" "}
                        {contaAtual.agencia || "-"} • Conta{" "}
                        {contaAtual.conta || "-"}
                      </div>

                      <div className="mt-1 text-xs font-bold text-slate-400">
                        Conta {indiceConta + 1} de {contas.length}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400">
                        Saldo
                      </div>
                      <div
                        className={`text-base font-black ${
                          Number(contaAtual.saldo_final || 0) >= 0
                            ? "text-emerald-700"
                            : "text-red-600"
                        }`}
                      >
                        {moeda(contaAtual.saldo_final)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[105px] flex-1 items-center justify-center rounded-3xl border border-dashed bg-slate-50 text-sm font-bold text-slate-400">
                    Nenhuma conta encontrada
                  </div>
                )}

                <button
                  onClick={() => navegarConta("proxima")}
                  className="h-10 w-10 shrink-0 rounded-full border bg-white font-black shadow-sm"
                >
                  ▶
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-300 bg-white p-4">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                Período
              </div>
             
              <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="text-xs font-black text-slate-600">
                    Início

                    <input
                      type="date"
                      value={inicio || ""}
                      onChange={(e) => {
                        setInicio(e.target.value);
                        setResultado(null);
                        setDadosContabeis([]);
                        setErro("");
                        setErroContabil("");
                      }}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-500"
                    />
                  </label>

                  <label className="text-xs font-black text-slate-600">
                    Fim

                    <input
                      type="date"
                      value={fim || ""}
                      onChange={(e) => {
                        setFim(e.target.value);
                        setResultado(null);
                        setDadosContabeis([]);
                        setErro("");
                        setErroContabil("");
                      }}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-500"
                    />
                  </label>
                </div>

          

             {/*} <label className="text-xs font-black text-slate-600">
                    Senha do PDF
                    <input
                      type="password"
                      value={senhaPDF}
                      onChange={(e) => setSenhaPDF(e.target.value)}
                      placeholder="Informe somente se o PDF possuir senha"
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700"
                    />
                  </label>*/}

                
              <button
                onClick={carregarContas}
                className="mt-3 w-full rounded-xl border border-cyan-200 bg-cyan-50 py-2 text-xs font-black text-[#063452] hover:bg-cyan-100"
              >
                ↻ Atualizar saldos
              </button>
              <button type="button" onClick={() => setQuadroAberto(true)}
                disabled={!empresa_id || !contaId || !inicio || !fim}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-100 py-2 text-xs font-black text-slate-700 hover:bg-slate-200 disabled:opacity-50">
                Conferência Getnet × banco
              </button>
            </div>
          </div>

          

            {resultado && (
  <div className="mt-2.5 rounded-2xl border border-blue-300 bg-white px-5 py-4 shadow-sm">
    <div className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
      Resumo da conciliação
    </div>

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <Card
        titulo="Pendências do financeiro"
        valor={moeda(totalPdfPendente)}
        alerta={totalPdfPendente !== 0}
      />

      <Card
        titulo="Pendências do razão"
        valor={moeda(totalRazaoPendente)}
        alerta={totalRazaoPendente !== 0}
      />

      <Card
        titulo="Criar lançamentos"
        valor={criarLancamentos}
        alerta={criarLancamentos > 0}
      />

      <Card
        titulo="Excluir lotes"
        valor={excluirLotes}
        alerta={excluirLotes > 0}
      />

      <Card
        titulo="Total de pendências"
        valor={pendencias}
        alerta={pendencias > 0}
        ok={pendencias === 0}
      />
    </div>
  </div>
)}
          

          {erro && (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              ⛔ {erro}
            </div>
          )}


      
       <div id="print-area">

           {resultado && (
             <div className="mt-3 flex items-center gap-2 border-b border-slate-200">
               <button
                 type="button"
                 onClick={() => setAbaAtiva("pendencias")}
                 className={`rounded-t-xl border border-b-0 px-4 py-2 text-xs font-black transition ${
                   abaAtiva === "pendencias"
                     ? "border-slate-200 bg-white text-[#063452]"
                     : "border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200"
                 }`}
               >
                 Pendências da Conciliação ({pendencias})
               </button>

               <button
                 type="button"
                 onClick={() => setAbaAtiva("razao")}
                 className={`rounded-t-xl border border-b-0 px-4 py-2 text-xs font-black transition ${
                   abaAtiva === "razao"
                     ? "border-slate-200 bg-white text-[#063452]"
                     : "border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200"
                 }`}
               >
                 Razão importado ({dadosContabeis.length})
               </button>

              
                  <div className="ml-auto flex items-center px-3">
                    <button
                      type="button"
                      onClick={imprimirAbaAtiva}
                      className="h-8 rounded-lg border border-slate-300 bg-white px-4 text-xs font-black text-slate-700 hover:bg-slate-100"
                    >
                      🖨 Imprimir
                    </button>
                  </div>



             </div>
           )}

           {resultado && abaAtiva === "pendencias" && (
            <div className="mt-0 rounded-b-2xl rounded-tr-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-3 text-sm font-black text-[#063452]">
                Registros encontrados ({acoes.length})
              </div>

              <div className="overflow-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-[#0F172A] text-left text-white">
                      <th className="px-3 py-3">O que fazer?</th>
                      <th className="px-3 py-3">Tipo</th>
                      <th className="px-3 py-3">Data</th>
                      <th className="px-3 py-3">Histórico</th>
                      <th className="px-3 py-3">Motivo</th>
                      <th className="px-3 py-3">Origem</th>
                      <th className="px-3 py-3">Lote</th>
                      <th className="px-3 py-3">Lançamento</th>
                      <th className="px-3 py-3">
                        Contrapartida
                      </th>
                      <th className="px-3 py-3">Conciliação</th>
                      <th className="px-3 py-3 text-right">Valor</th>
                      <th className="px-3 py-3">Ação</th>
                    </tr>
                  </thead>

                  <tbody>
                    {acoes.map((item, index) => (
                      <tr
                        key={`${item.conciliacao_id || index}-${index}`}
                        className={
                          index % 2 === 0
                            ? "bg-white"
                            : "bg-slate-50"
                        }
                      >
                        <td className="border-b border-slate-100 px-3 py-3">
                          {item.acao === "CRIAR_LANCAMENTO" ? (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                              Criar no Razão
                            </span>
                          ) : item.acao === "EXCLUIR_LOTE" ? (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                              Excluir do Razão
                            </span>
                          ) : (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
                              {item.acao || "-"}
                            </span>
                          )}
                        </td>

                        <td className="border-b border-slate-100 px-3 py-3">
                          {item.tipo === "D" ? (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                              Débito
                            </span>
                          ) : item.tipo === "C" ? (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                              Crédito
                            </span>
                          ) : (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
                              {item.tipo || "-"}
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap border-b border-slate-100 px-3 py-3 font-black">
                          {item.data_mov || "-"}
                        </td>

                        <td className="border-b border-slate-100 px-3 py-3">
                          {item.historico || "-"}
                        </td>
                      

                        <td className="border-b border-slate-100 px-3 py-3">
                          {item.motivo === "NAO_EXISTE_NO_EXTRATO" ? (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                              Inexistente no Extrato
                            </span>
                          ) : item.motivo === "NAO_EXISTE_NO_RAZAO" ? (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                              Inexistente no Razão
                            </span>
                          ) : (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
                              {item.motivo || "-"}
                            </span>
                          )}
                        </td>

                        <td className="border-b border-slate-100 px-3 py-3">
                          {item.origem === "R"
                            ? "Razão"
                            : item.origem === "P"
                            ? "PDF"
                            : item.origem || "-"}
                        </td>

                        <td className="border-b border-slate-100 px-3 py-3 font-black">
                          {item.lote_id ?? "-"}
                        </td>

                        <td className="border-b border-slate-100 px-3 py-3">
                          {item.lancamento_id ?? "-"}
                        </td>
                        
                         <td className="relative border-b border-slate-100 px-3 py-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setLinhaContaDropdown((atual) =>
                                          atual === item.conciliacao_id
                                            ? null
                                            : item.conciliacao_id
                                        );

                                        setBuscaContaContabil("");
                                      }}
                                      className="flex h-9 min-w-[280px] items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left text-xs font-bold text-slate-700 hover:bg-slate-50"
                                    >
                                      <span className="truncate">
                                        {item.contraparte_id
                                          ? `${item.contraparte_codigo} — ${item.contraparte_nome}`
                                          : "Selecione a contrapartida"}
                                      </span>

                                      <span className="ml-2 text-slate-400">▼</span>
                                    </button>

                                    {linhaContaDropdown === item.conciliacao_id && (
                                      <div className="absolute left-3 z-50 mt-1 w-[360px] rounded-xl border border-slate-200 bg-white shadow-xl">
                                        <div className="border-b border-slate-100 p-2">
                                          <input
                                            type="text"
                                            value={buscaContaContabil}
                                            onChange={(e) =>
                                              setBuscaContaContabil(e.target.value)
                                            }
                                            placeholder="Buscar código ou nome..."
                                            autoFocus
                                            className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs font-bold outline-none focus:border-blue-400"
                                          />
                                        </div>

                                        <div className="max-h-64 overflow-y-auto">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setLinhaContaNova(item);
                                              setModalContaAberto(true);
                                              setLinhaContaDropdown(null);
                                            }}
                                            className="w-full px-3 py-2 text-left text-xs font-black text-blue-700 hover:bg-blue-50"
                                          >
                                            ➕ Criar nova conta para este histórico
                                          </button>

                                          {contasFiltradasContabil.map((conta) => (
                                            <button
                                              key={conta.id}
                                              type="button"
                                              onClick={() =>
                                                selecionarContaContabilLinha(
                                                  item,
                                                  conta
                                                )
                                              }
                                              className="block w-full px-3 py-2 text-left text-xs hover:bg-blue-50"
                                            >
                                              <span className="font-black">
                                                {conta.codigo}
                                              </span>
                                              {" — "}
                                              {conta.nome}
                                            </button>
                                          ))}

                                          {contasFiltradasContabil.length === 0 && (
                                            <div className="px-3 py-3 text-xs font-bold text-slate-400">
                                              Nenhuma conta encontrada
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </td>
                                                          <td className="border-b border-slate-100 px-3 py-3">
                          {item.conciliacao_id ?? "-"}
                        </td>

                        <td
                          className={`whitespace-nowrap border-b border-slate-100 px-3 py-3 text-right font-black ${
                            item.tipo === "D"
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {moeda(item.valor)}
                        </td>

            <td className="border-b border-slate-100 px-3 py-3 text-center">
                  {item.acao === "CRIAR_LANCAMENTO" && (
                    <button
                        type="button"
                        onClick={() => criarLancamento(item)}
                        disabled={
                          executando ||
                          !item.contraparte_id
                        }
                        className="whitespace-nowrap rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-black text-emerald-700 disabled:opacity-40"
                      >
                        Criar
                      </button>
                  )}

                  {item.acao === "EXCLUIR_LOTE" && (
                    <button
                      type="button"
                      onClick={() => excluirLote(item)}
                      disabled={executando}
                      className="whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-black text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  )}
                </td>
                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {resultado && abaAtiva === "razao" && (
            <div className="mt-0 rounded-b-2xl rounded-tr-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-[#063452]">
                    Razão equivalente do período
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-slate-400">
                    {inicio || "-"} até {fim || "-"} · Conta financeira {contaId || "-"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    carregarContabilImportacao({
                      empresaId: empresa_id,
                      contaId,
                      dataInicio: inicio,
                      dataFim: fim,
                    })
                  }
                  disabled={carregandoContabil || !contaId || !inicio || !fim}
                  className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-black text-[#063452] hover:bg-cyan-100 disabled:opacity-50"
                >
                  {carregandoContabil ? "Atualizando..." : "↻ Atualizar Razão"}
                </button>
              </div>

              {erroContabil && (
                <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
                  ⛔ {erroContabil}
                </div>
              )}

              {carregandoContabil ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm font-black text-slate-400">
                  Carregando movimentos contábeis...
                </div>
              ) : dadosContabeis.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center">
                  <div className="text-2xl">📚</div>
                  <div className="mt-2 text-sm font-black text-slate-600">
                    Nenhum movimento contábil encontrado no período
                  </div>
                </div>
              ) : (
                <div className="overflow-auto rounded-2xl border border-slate-200">
                 
                     <table className="w-[1700px] table-fixed text-xs">
                    <thead>
                      <tr className="bg-[#0F172A] text-left text-white">
                        <th className="w-[72px] px-1 py-1">Data</th>
                        <th className="w-[220px] px-1 py-1">Histórico</th>
                        <th className="w-[105px] px-1 py-1">Conta Débito</th>
                        <th className="w-[105px] px-1 py-1">Conta Crédito</th>
                        <th className="w-[85px] px-1 py-1">Modelo</th>
                        <th className="w-[55px] px-1 py-1 text-center">Transação</th>
                        <th className="w-[45px] px-1 py-1 text-center">Diário</th>
                        <th className="w-[45px] px-1 py-1 text-center">Lote</th>
                        <th className="w-[80px] px-1 py-1 text-right">Valor</th>
                        <th className="w-[80px] px-1 py-1 text-center">Origem</th>
                        <th className="w-[135px] px-1 py-1 text-center">Ação</th>
                      </tr>
                      </thead>
                    <tbody>
                      {dadosContabeis.map((item, index) => (
                        <tr
                          key={`${item.diario_id || "d"}-${item.transacao_id || "t"}-${index}`}
                          className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                        >
                          <td className="w-[72px] whitespace-nowrap border-b border-slate-100 px-1  font-black">
                              {item.data_mov || "-"}
                            </td>

                            <td
                              title={item.historico || ""}
                              className="w-[220px] truncate border-b border-slate-100 px-1 py-1"
                            >
                              {item.historico || "-"}
                            </td>

                          <td className="border-b border-slate-100 px-2 py-1">
                            <div className="font-black">{item.conta_debito_codigo || "-"}</div>
                            <div className="text-xs text-slate-500">{item.conta_debito_nome || "-"}</div>
                          </td>
                          <td className="border-b border-slate-100 px-2 py-2">
                            <div className="font-black">{item.conta_credito_codigo || "-"}</div>
                            <div className="text-xs text-slate-500">{item.conta_credito_nome || "-"}</div>
                          </td>
                          <td className="border-b border-slate-100 px-2 py-2">
                            {item.modelo_codigo || "-"}
                          </td>
                          <td className="border-b border-slate-100 px-2 py-2 text-center">{item.transacao_id ?? "-"}</td>
                          <td className="border-b border-slate-100 px-2 py-2 text-center">{item.diario_id ?? "-"}</td>
                          <td className="border-b border-slate-100 px-2 py-2 text-center">{item.lote_id ?? "-"}</td>
                          <td className="whitespace-nowrap border-b border-slate-100 px-2 py-2 text-right font-black text-[#063452]">
                            {moeda(item.valor)}
                          </td>
                          <td className="border-b border-slate-100 px-2 py-2">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${
                                item.origem === "MANUAL"
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-blue-200 bg-blue-50 text-blue-700"
                              }`}
                            >
                              {item.origem || "-"}
                            </span> 
                          </td>
                            <td className="border-b border-slate-100 px-2 py-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => excluirLote(item)}
                                  disabled={executando || !item.lote_id}
                                  className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-black text-red-700 hover:bg-red-100 disabled:opacity-40"
                                >
                                  Excluir
                                </button>
                                <button
                                  type="button"
                                  onClick={() => abrirModalReclassificar(item)}
                                  disabled={
                                    executando ||
                                    !item.lote_id ||
                                    String(item.origem || "").toUpperCase() === "MANUAL"
                                  }
                                  title={
                                    String(item.origem || "").toUpperCase() === "MANUAL"
                                      ? "Lançamentos manuais não podem ser reclassificados nesta tela."
                                      : "Reclassificar contrapartida"
                                  }
                                  className={`rounded-md border px-2 py-1 text-[10px] font-black transition ${
                                    String(item.origem || "").toUpperCase() === "MANUAL"
                                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                      : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                  } disabled:opacity-60`}
                                >
                                  Reclassificar
                                </button>
                              </div>
                            </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}



 </div>
 

 
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => navigate(-1)}
              className="h-11 rounded-xl border bg-white px-5 text-sm font-black text-slate-600"
            >
              Cancelar
            </button>
             <button
            type="button"
            onClick={executarConciliacao}
            className="h-11 rounded-xl bg-[#063452] px-6 text-sm font-black text-white hover:brightness-110"
          >
            {executando ? "Conciliando..." : "Executar conciliação"}
          </button>
          </div>

          {modalReclassificarAberto && linhaReclassificar && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <div>
                    <div className="text-base font-black text-[#063452]">
                      Reclassificar contrapartida
                    </div>

                    <div className="mt-1 text-xs font-bold text-slate-400">
                      Lote {linhaReclassificar.lote_id}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setModalReclassificarAberto(false)}
                    className="rounded-lg px-3 py-2 text-sm font-black text-slate-500 hover:bg-slate-100"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 p-5">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs font-black text-slate-500">
                      Lançamento
                    </div>

                    <div className="mt-1 text-sm font-bold text-slate-800">
                      {linhaReclassificar.historico}
                    </div>

                    <div className="mt-2 text-sm font-black text-[#063452]">
                      {moeda(linhaReclassificar.valor)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border p-3">
                      <div className="font-black text-slate-400">Débito atual</div>
                      <div className="mt-1 font-black">
                        {linhaReclassificar.conta_debito_codigo}
                      </div>
                      <div>{linhaReclassificar.conta_debito_nome}</div>
                    </div>

                    <div className="rounded-xl border p-3">
                      <div className="font-black text-slate-400">Crédito atual</div>
                      <div className="mt-1 font-black">
                        {linhaReclassificar.conta_credito_codigo}
                      </div>
                      <div>{linhaReclassificar.conta_credito_nome}</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-600">
                      Nova conta da contrapartida
                    </label>

                    <input
                      type="text"
                      value={buscaReclassificar}
                      onChange={(e) => {
                        setBuscaReclassificar(e.target.value);
                        setContaReclassificar(null);
                      }}
                      placeholder="Digite o código ou nome da conta..."
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none focus:border-blue-400"
                    />

                    <div className="mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-200">
                      {contasReclassificacaoFiltradas.map((conta) => (
                        <button
                          key={conta.id}
                          type="button"
                          onClick={() => {
                            setContaReclassificar(conta);
                            setBuscaReclassificar(
                              `${conta.codigo} - ${conta.nome}`
                            );
                          }}
                          className={`block w-full border-b px-3 py-2 text-left text-xs hover:bg-blue-50 ${
                            Number(contaReclassificar?.id) === Number(conta.id)
                              ? "bg-blue-50 text-blue-700"
                              : ""
                          }`}
                        >
                          <span className="font-black">{conta.codigo}</span>
                          {" - "}
                          {conta.nome}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setModalReclassificarAberto(false)}
                    className="rounded-lg border px-4 py-2 text-xs font-black text-slate-600"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    disabled={!contaReclassificar || executando}
                    onClick={confirmarReclassificacao}
                    className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-black text-white disabled:opacity-40"
                  >
                    Confirmar reclassificação
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {quadroAberto && <QuadroConferenciaRecebiveis
        empresaId={empresa_id}
        contaInicial={contaId}
        contasBanco={contas.filter((conta) => String(conta.nro_banco || "") !== "000")}
        dataInicioInicial={inicio}
        dataFimInicial={fim}
        onClose={() => setQuadroAberto(false)}
      />}
    </div>

  );
}

function Card({ titulo, valor, alerta = false, ok = false }) {
  return (
    <div
      className={`rounded-2xl border bg-white px-4 py-3 shadow-sm ${
        alerta
          ? "border-red-200"
          : ok
          ? "border-emerald-200"
          : "border-cyan-100"
      }`}
    >
      <div className="text-xs font-black uppercase tracking-wider text-slate-400">
        {titulo}
      </div>
      <div
        className={`mt-1 text-xl font-black ${
          alerta
            ? "text-red-600"
            : ok
            ? "text-emerald-700"
            : "text-[#063452]"
        }`}
      >
        {valor}
      </div>
    </div>
  );
}


function AjudaConciliacaoExtrato({ onClose }) {
  const painelRef = useRef(null);
  const fecharRef = useRef(null);
  const etapas = [
  {
    "titulo": "O que esta janela confere",
    "texto": "Compare os movimentos do extrato/financeiro com o Razão contábil de uma conta bancária específica e de um período. A tela mostra diferenças, permite criar registros contábeis faltantes e revisar contrapartidas quando permitido. O quadro Getnet × banco amplia a conferência dos recebíveis e dos repasses da operadora para essa conta."
  },
  {
    "titulo": "Prepare os dados e selecione a conta",
    "texto": "Importe primeiro o extrato bancário na janela de Importação Bancária e conclua a revisão necessária. Aqui a conferência utiliza os dados já registrados. Escolha a conta bancária pelas setas e confira banco, agência e número da conta. O resultado vale para a conta selecionada; não representa todas as contas da empresa."
  },
  {
    "titulo": "Defina o período e execute a conciliação",
    "texto": "Preencha Início e Fim e clique em Executar conciliação. A tela compara os dados disponíveis e carrega o Razão equivalente do período. Ao mudar a conta ou as datas, execute novamente para obter uma conferência atualizada. Atualizar saldos atualiza as informações das contas e não substitui a execução da conciliação."
  },
  {
    "titulo": "Leia o resumo e as pendências",
    "texto": "Na aba Pendências da Conciliação, confira data, histórico, valor, origem, contrapartida e ação proposta. Criar no Razão indica um registro contábil faltante; Excluir do Razão indica um lote para revisar antes de remover. Os valores do resumo são relativos às pendências: uma diferença líquida zero não dispensa conferir os itens, pois valores opostos podem se compensar."
  },
  {
    "titulo": "Crie o lançamento contábil faltante",
    "texto": "Para uma linha com Criar no Razão, confira o movimento e selecione a contrapartida contábil apropriada, pesquisando e escolhendo uma conta da lista. Depois use Criar. A contrapartida define a outra conta do lançamento; verifique se representa a operação real. Não crie novamente um registro que já exista ou apenas para fazer o total coincidir."
  },
  {
    "titulo": "Confira o Razão e reclassifique quando permitido",
    "texto": "Abra Razão importado para consultar os lançamentos equivalentes da conta no período. Confira histórico, contas, valor, diário, lote e origem. Use Reclassificar para escolher outra contrapartida e confirmar o ajuste quando a ação estiver habilitada. Lançamentos de origem MANUAL não podem ser reclassificados nesta tela. Atualizar Razão recarrega a consulta contábil; para recalcular as pendências, execute a conciliação novamente."
  },
  {
    "titulo": "Revise o lote inteiro antes de excluir",
    "texto": "Excluir remove todos os lançamentos contábeis vinculados ao lote indicado, conforme a confirmação exibida. A ação não se limita necessariamente à linha visível. Confira o número do lote, seus vínculos e o motivo da diferença antes de confirmar. Depois da correção, execute novamente a conciliação para verificar o resultado."
  },
  {
    "titulo": "Confira receitas e repasses Getnet nesta conta",
    "texto": "Abra Conferência Getnet × banco para consultar o quadro Getnet × banco × Razão. Ele ajuda a comparar as receitas/movimentos informados pela Getnet, os respectivos repasses recebidos nesta conta bancária e os registros contábeis. Importe também o arquivo da Getnet na Conciliação de Operadora e confira o extrato do banco. Considere taxas, antecipações e datas de repasse: uma venda e seu crédito no banco podem ocorrer em dias diferentes."
  },
  {
    "titulo": "Verifique o resultado final",
    "texto": "Depois de criar, excluir ou reclassificar, use Executar conciliação novamente e confira as duas abas. Leia qualquer aviso de reexecução. Se persistirem diferenças, revise a conta, o período, as importações, as contrapartidas e as datas dos repasses. Use Imprimir na aba desejada para obter a consulta. As ações desta tela ajustam registros no FinanceFlow; não movimentam dinheiro no banco."
  }
];

  useEffect(() => {
    const focoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fecharRef.current?.focus();
    function teclado(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Tab") {
        const botoes = painelRef.current?.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
        );
        if (!botoes?.length) return;
        const primeiro = botoes[0];
        const ultimo = botoes[botoes.length - 1];
        if (event.shiftKey && document.activeElement === primeiro) {
          event.preventDefault(); ultimo.focus();
        } else if (!event.shiftKey && document.activeElement === ultimo) {
          event.preventDefault(); primeiro.focus();
        }
      }
    }
    document.addEventListener("keydown", teclado);
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", teclado);
      if (focoAnterior?.isConnected) focoAnterior.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 p-3 sm:p-5"
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ajuda-conciliacao-extrato-titulo"
        aria-describedby="ajuda-conciliacao-extrato-descricao"
        style={{ width: "min(680px, 100%)", maxWidth: 680, maxHeight: "90vh", backgroundColor: "#ffffff", color: "#1e293b", borderRadius: 20 }}
        className="flex flex-col overflow-hidden shadow-2xl"
      >
        <div style={{ background: "linear-gradient(110deg, #203c86, #0e7490)", color: "#ffffff", padding: "14px 18px" }} className="flex shrink-0 items-start justify-between gap-3">
          <div>
            <h2 id="ajuda-conciliacao-extrato-titulo" style={{ color: "#ffffff", fontSize: 18 }} className="text-xl font-extrabold leading-tight">Como conciliar o extrato com o Razão</h2>
            <p id="ajuda-conciliacao-extrato-descricao" style={{ color: "#ffffff" }} className="mt-1 text-xs font-medium">Confira a conta, corrija pendências e acompanhe os repasses da Getnet.</p>
          </div>
          <button ref={fecharRef} type="button" onClick={onClose} aria-label="Fechar ajuda" style={{ background: "#ffffff", color: "#203c86", border: "1px solid #cbd5e1", width: 30, height: 30, fontSize: 22 }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-lg font-bold hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">×</button>
        </div>
        <div style={{ padding: 16 }} className="space-y-2 overflow-y-auto">
          {etapas.map((etapa, indice) => (
            <div key={etapa.titulo} style={{ background: "#f7f9fc", border: "1px solid #dce5f1", padding: "12px 14px" }} className="flex items-start gap-3 rounded-xl">
              <span aria-hidden="true" style={{ background: "#2251df", color: "#ffffff", width: 32, height: 32 }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2251df] text-base font-bold text-white">{indice + 1}</span>
              <div className="min-w-0">
                <h3 style={{ color: "#1e293b" }} className="text-sm font-bold">{etapa.titulo}</h3>
                <p style={{ color: "#334155", fontSize: 12, lineHeight: 1.5 }} className="mt-1">{etapa.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
