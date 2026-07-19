         import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { buildWebhookUrl } from "../config/globals";
import { fetchSeguro } from "../utils/apiSafe";

import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function ImportacaoCartaoCredito() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id");

  const [senhaPDF, setSenhaPDF] = useState("");

  const [cartoes, setCartoes] = useState([]);
  const [cartaoId, setCartaoId] = useState("");
  const [linhas, setLinhas] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("lancamentos");
   
  const [dataReferencia, setDataReferencia] = useState("");
const [importacaoId, setImportacaoId] = useState(null);
const [salvando, setSalvando] = useState(false);
const [conciliando, setConciliando] = useState(false);
const [statusEtapa, setStatusEtapa] = useState("importar");
const [tipoArquivo, setTipoArquivo] = useState("");
const [validacaoPDF, setValidacaoPDF] = useState(null);
 
const [contasContabeis, setContasContabeis] = useState([]);
const [contaDropdownLinha, setContaDropdownLinha] = useState(null);
const [contaBuscaLinha, setContaBuscaLinha] = useState({});
const [contasFiltradasLinha, setContasFiltradasLinha] = useState([]);

 const [resultadoConciliacao, setResultadoConciliacao] = useState(null);
const [transacoesFatura, setTransacoesFatura] = useState([]);
const [carregandoTransacoes, setCarregandoTransacoes] = useState(false);
const [carregandoResultado, setCarregandoResultado] = useState(false);

const [linhasSelecionadas, setLinhasSelecionadas] = useState([]);
const [contaLoteTexto, setContaLoteTexto] = useState("");
const [contaLoteId, setContaLoteId] = useState(null);
const [mostrarContasLote, setMostrarContasLote] = useState(false);

//const [filtroStatus, setFiltroStatus] = useState("pendentes");
 
 const [filtroStatus, setFiltroStatus] = useState("todos");

const [tipoImportacao, setTipoImportacao] =
  useState("normal");


   const quantidadePendentes = linhas.filter(
  (linha) =>
    linhaExigeContaContabil(linha) &&
    !linha.conta_contabil_id
).length;
 
  const botaoBase = `
    px-5 py-2 rounded-full
    font-bold text-sm tracking-wide
    border-2 border-black
    shadow-[0_4px_12px_rgba(0,0,0,0.35)]
    hover:brightness-110 hover:scale-105
    active:scale-95
    transition-all duration-200
    inline-flex items-center gap-2
  `;

  function exportarLayout() {
    const dados = [
      ["Data", "Estabelecimento", "Portador", "Valor", "Parcela"],
      ["02/05/2026", "HETZNER ONLINE GMBH", "LUIS GUSTAVO LANDUCCI", "R$ 3,67", "-"],
      ["02/05/2026", "HETZNER ONLINE GMBH", "LUIS GUSTAVO LANDUCCI", "R$ 104,90", "-"],
      ["07/05/2026", "GERALDO FORTUNATO", "LUIS GUSTAVO LANDUCCI", "R$ 20,00", "-"],
      ["08/05/2026", "ACOUGUE*CARRARA", "LUIS GUSTAVO LANDUCCI", "R$ 23,39", "-"],
      ["20/04/2026", "Pagamentos Validos Normais", "LUIS GUSTAVO LANDUCCI", "R$ -272,44", "-"],
      ["27/04/2026", "MP*MERCADOLIVRE", "LUIS GUSTAVO LANDUCCI", "R$ 10,68", "1 de 7"],
      ["27/07/2025", "ASA*NO CODE START UP N", "LUIS GUSTAVO LANDUCCI", "R$ 157,53", "10 de 12"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(dados);
    ws["!cols"] = [
      { wch: 14 },
      { wch: 34 },
      { wch: 28 },
      { wch: 14 },
      { wch: 14 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Layout Cartao");

    const wbout = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "layout_importacao_cartao.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    carregarCartoes();
    carregarContasContabeis();
  }, []);

  useEffect(() => {
    function fecharDropdownContaCartao(event) {
      const clicouDentro = event.target.closest(
        "[data-dropdown-conta-cartao]"
      );

      if (!clicouDentro) {
        setContaDropdownLinha(null);
        setContasFiltradasLinha([]);
      }
    }

    document.addEventListener("mousedown", fecharDropdownContaCartao);

    return () => {
      document.removeEventListener("mousedown", fecharDropdownContaCartao);
    };
  }, []);

   

    






   async function carregarCartoes() {
  try {
    const resp = await fetch(
      buildWebhookUrl("cartoes", {
        id_empresa: empresa_id,
      })
    );

    const data = await resp.json();

    const lista = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : [];

    setCartoes(lista);

    /*
      Define automaticamente o primeiro cartão.
      Antes ele aparecia na tela, mas cartaoId permanecia vazio.
    */
    if (lista.length > 0) {
      setCartaoId((atual) => {
        const aindaExiste = lista.some(
          (cartao) =>
            String(cartao.id) === String(atual)
        );

        if (atual && aindaExiste) {
          return atual;
        }

        const escolhido =
          lista.find(
            (cartao) =>
              cartao.escolhido === true ||
              cartao.escolhido === "true"
          ) || lista[0];

        return String(escolhido.id);
      });
    } else {
      setCartaoId("");
    }
  } catch (e) {
    console.error("ERRO AO CARREGAR CARTÕES:", e);

    setCartoes([]);
    setCartaoId("");
  }
}



async function atualizaDiaFechamento(diaFechamento) {
  if (!empresa_id || !cartaoId || !diaFechamento) {
    console.log("Não foi possível atualizar o fechamento:", {
      empresa_id,
      cartaoId,
      diaFechamento,
    });

    return;
  }

  try {
    const payload = {
      empresa_id: Number(empresa_id),
      id: Number(cartaoId),
      fechamento_dia: Number(diaFechamento),
    };

    console.log("ATUALIZANDO DIA DE FECHAMENTO:", payload);

    const resp = await fetchSeguro(
      buildWebhookUrl("atualizadiaFechamento"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    console.log("RETORNO ATUALIZA FECHAMENTO:", resp);

    // Atualiza imediatamente o cartão na tela.
    setCartoes((anteriores) =>
      anteriores.map((cartao) =>
        Number(cartao.id) === Number(cartaoId)
          ? {
              ...cartao,
              fechamento_dia: Number(diaFechamento),
            }
          : cartao
      )
    );
  } catch (erro) {
    console.error(
      "ERRO AO ATUALIZAR DIA DE FECHAMENTO:",
      erro
    );

    // Não bloqueia a importação.
  }
}


  function normalizarTexto(txt) {
    return String(txt || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function localizarCampo(headers, opcoes) {
    const normalizados = headers.map((h) => normalizarTexto(h));

    for (const opcao of opcoes) {
      const idx = normalizados.findIndex((h) => h.includes(opcao));
      if (idx >= 0) return headers[idx];
    }

    return null;
  }

  function parseNumeroBR(valor) {
    if (valor == null) return 0;

    return (
      Number(
        String(valor)
          .replace("R$", "")
          .replace(/\s/g, "")
          .replace(/\./g, "")
          .replace(",", ".")
          .replace(/[^\d.-]/g, "")
      ) || 0
    );
  }

  function dataParaISO(valor) {
    if (!valor) return "";

    if (typeof valor === "number") {
      const data = XLSX.SSF.parse_date_code(valor);
      if (!data) return "";
      return `${data.y}-${String(data.m).padStart(2, "0")}-${String(data.d).padStart(2, "0")}`;
    }

    const txt = String(valor).trim();

    const m = txt.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const p1 = Number(m[1]);
      const p2 = Number(m[2]);
      const ano = m[3];

      // Quando o PDF vier como MM/DD/YYYY, exemplo 04/26/2026.
      if (p2 > 12) {
        return `${ano}-${String(p1).padStart(2, "0")}-${String(p2).padStart(2, "0")}`;
      }

      // Padrão brasileiro DD/MM/YYYY.
      return `${ano}-${String(p2).padStart(2, "0")}-${String(p1).padStart(2, "0")}`;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(txt)) return txt;

    return "";
  }

  function interpretarParcela(texto) {
    const txt = String(texto || "").trim();

    if (!txt || txt === "-") {
      return { parcela_texto: null, parcela_atual: null, parcela_total: null };
    }

    let m = txt.match(/^(\d+)\s*de\s*(\d+)$/i);
    if (m) {
      return {
        parcela_texto: txt,
        parcela_atual: Number(m[1]),
        parcela_total: Number(m[2]),
      };
    }

    m = txt.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (m) {
      return {
        parcela_texto: txt,
        parcela_atual: Number(m[1]),
        parcela_total: Number(m[2]),
      };
    }

    return { parcela_texto: txt, parcela_atual: null, parcela_total: null };
  }

  function identificarTipo(estabelecimento, valor) {
    const txt = normalizarTexto(estabelecimento);

    if (valor < 0 && txt.includes("pagamento")) return "pagamento";
    if (valor < 0) return "credito";

    return "compra";
  }



function deveIgnorarLinhaCartao(estabelecimento) {
  const txt = normalizarTexto(estabelecimento);

  return (
    txt.includes("limite de credito") ||
    txt.includes("limite total de credito") ||
    txt.includes("resumo da sua fatura") ||
    txt.includes("resumo de sua fatura") ||
    txt.includes("total da fatura") ||
    txt.includes("encargos da fatura") ||
    txt.includes("aceite n carteira") ||
    txt.includes("nosso numero") ||
    txt.includes("uso do banco") ||
    txt.includes("valor do documento") ||
    txt === "pagamento total"
  );
}

function limparDescricaoCartao(texto) {
  return String(texto || "")
    .replace(/\s+/g, " ")
    .replace(/[-–]?\s*Parcela\s+\d+\s*\/\s*\d+/i, "")
    .trim();
}

function extrairParcelaDescricao(texto) {
  const txt = String(texto || "");

  let m = txt.match(/Parcela\s+(\d+)\s*\/\s*(\d+)/i);
  if (m) {
    return {
      parcela: `${m[1]}/${m[2]}`,
      parcela_atual: Number(m[1]),
      parcela_total: Number(m[2]),
    };
  }

  m = txt.match(/\b(\d+)\s*de\s*(\d+)\b/i);
  if (m) {
    return {
      parcela: `${m[1]}/${m[2]}`,
      parcela_atual: Number(m[1]),
      parcela_total: Number(m[2]),
    };
  }

  return { parcela: null, parcela_atual: null, parcela_total: null };
}

function linhaPareceLancamentoCartao(l) {
  const txt = normalizarTexto(l.estabelecimento);
  const qtdPalavras = txt.split(/\s+/).filter(Boolean).length;

  if (!l.data || !l.estabelecimento || !Number.isFinite(Number(l.valor)) || Number(l.valor) === 0) {
    return false;
  }

  if (deveIgnorarLinhaCartao(l.estabelecimento)) return false;

  // Linha administrativa costuma ser grande demais e cheia de termos bancários.
  if (qtdPalavras > 10 && !txt.includes("*") && !txt.includes("parcela")) {
    return false;
  }

  return true;
}

function valoresQuaseIguais(a, b) {
  return Math.abs(Number(a || 0) - Number(b || 0)) <= 0.05;
}

function extrairTotalFaturaPDF(texto) {
  const txt = String(texto || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const valor = "(-?\\s*(?:R\\$\\s*)?\\d{1,3}(?:\\.\\d{3})*,\\d{2}|-?\\s*(?:R\\$\\s*)?\\d+,\\d{2})";

  const padroes = [
    new RegExp(`saldo\\s+desta\\s+fatura.{0,80}?${valor}`, "i"),
    new RegExp(`${valor}.{0,80}?saldo\\s+desta\\s+fatura`, "i"),
    new RegExp(`total\\s+a\\s+pagar.{0,80}?${valor}`, "i"),
    new RegExp(`${valor}.{0,80}?total\\s+a\\s+pagar`, "i"),
    new RegExp(`pagamento\\s+total.{0,80}?${valor}`, "i"),
    new RegExp(`${valor}.{0,80}?pagamento\\s+total`, "i"),
    new RegExp(`total\\s+despesas\\s*\\/\\s*debitos\\s+no\\s+brasil.{0,80}?${valor}`, "i"),
    new RegExp(`${valor}.{0,80}?total\\s+despesas\\s*\\/\\s*debitos\\s+no\\s+brasil`, "i"),
    new RegExp(`despesas\\s+ate\\s+a\\s+emissao\\s+desta\\s+fatura.{0,80}?${valor}`, "i"),
    new RegExp(`valor\\s+total\\s+devido.{0,80}?${valor}`, "i"),
    new RegExp(`total\\s+(?:da\\s+)?fatura.{0,80}?${valor}`, "i"),
    new RegExp(`valor\\s+total\\s+(?:da\\s+)?fatura.{0,80}?${valor}`, "i"),
    new RegExp(`${valor}.{0,80}?total\\s+(?:da\\s+)?fatura`, "i"),
  ];

  for (const regex of padroes) {
    const m = txt.match(regex);
    if (m) {
      const bruto = m[m.length - 1];
      const n = parseNumeroBR(bruto);
      if (n > 0) return n;
    }
  }

  return null;
}
 

function montarValidacaoPDF({ linhasConvertidas, totalPDF }) {
  function ehPagamentoFatura(linha) {
    const descricao = normalizarTexto(
      linha.estabelecimento ||
      linha.descricao ||
      linha.historico ||
      ""
    );

    /*
      Só considera pagamento quando:
      - o valor é negativo;
      - e a descrição identifica claramente pagamento da fatura.
    */
    return (
      Number(linha.valor || 0) < 0 &&
      (
        descricao.includes("pagamento") ||
        descricao.includes("pagamentos validos normais") ||
        descricao.includes("pagamento recebido") ||
        descricao.includes("pagamento de fatura")
      )
    );
  }

  /*
    Compras/despesas:
    todos os valores positivos.

    Não dependemos de tipo_linha porque o PDF/N8N
    pode classificar estorno de forma diferente.
  */
  const compras = Number(
    linhasConvertidas
      .filter((l) => Number(l.valor || 0) > 0)
      .reduce(
        (soma, l) =>
          soma + Number(l.valor || 0),
        0
      )
      .toFixed(2)
  );

  /*
    Créditos e estornos:
    todo valor negativo que NÃO seja pagamento da fatura.
  */
  const creditosEstornos = Number(
    linhasConvertidas
      .filter(
        (l) =>
          Number(l.valor || 0) < 0 &&
          !ehPagamentoFatura(l)
      )
      .reduce(
        (soma, l) =>
          soma + Math.abs(Number(l.valor || 0)),
        0
      )
      .toFixed(2)
  );

  /*
    Pagamentos:
    negativos com descrição claramente relacionada
    ao pagamento da fatura anterior.
  */
  const pagamentos = Number(
    linhasConvertidas
      .filter(ehPagamentoFatura)
      .reduce(
        (soma, l) =>
          soma + Math.abs(Number(l.valor || 0)),
        0
      )
      .toFixed(2)
  );

  /*
    Total correto:
    soma todos os lançamentos,
    exceto pagamentos da fatura anterior.

    Compra positiva soma.
    Estorno/crédito negativo reduz.
    Pagamento é ignorado.
  */
  const totalImportado = Number(
    linhasConvertidas
      .filter((l) => !ehPagamentoFatura(l))
      .reduce(
        (soma, l) =>
          soma + Number(l.valor || 0),
        0
      )
      .toFixed(2)
  );

  if (totalPDF == null) {
    return {
      origem: "PDF",
      ok: false,
      bloqueiaSalvar: false,

      mensagem:
        `Não localizei com segurança o total da fatura no PDF. ` +
        `Compras: ${formatarMoeda(compras)}. ` +
        `Créditos/estornos: -${formatarMoeda(creditosEstornos)}. ` +
        `Total líquido: ${formatarMoeda(totalImportado)}.`,

      totalPDF: null,
      totalImportado,
      compras,
      creditosEstornos,
      pagamentos,
      diferenca: null,
    };
  }

  const totalFatura = Number(totalPDF);

  const diferenca = Number(
    (totalImportado - totalFatura).toFixed(2)
  );

  const ok = valoresQuaseIguais(
    totalImportado,
    totalFatura
  );

  return {
    origem: "PDF",
    ok,
    bloqueiaSalvar: !ok,

    mensagem: ok
      ? `PDF validado: compras ${formatarMoeda(compras)}, ` +
        `créditos/estornos -${formatarMoeda(creditosEstornos)}, ` +
        `pagamentos ignorados ${formatarMoeda(pagamentos)} e ` +
        `total líquido ${formatarMoeda(totalImportado)}.`
      : `Divergência no PDF: compras ${formatarMoeda(compras)}, ` +
        `créditos/estornos -${formatarMoeda(creditosEstornos)}, ` +
        `pagamentos ignorados ${formatarMoeda(pagamentos)}, ` +
        `total líquido importado ${formatarMoeda(totalImportado)} ` +
        `x total da fatura ${formatarMoeda(totalFatura)}. ` +
        `Diferença ${formatarMoeda(diferenca)}.`,

    totalPDF: totalFatura,
    totalImportado,
    compras,
    creditosEstornos,
    pagamentos,
    diferenca,
  };
}


 function converterPlanilha(json) {
  if (!json.length) return [];

  const headers = Object.keys(json[0]);

  const campoData = localizarCampo(headers, [
    "data compra",
    "data lancamento",
    "data",
    "dt",
  ]);

  const campoDescricao = localizarCampo(headers, [
    "estabelecimento",
    "descricao",
    "historico",
    "lancamento",
    "transacao",
    "merchant",
  ]);

  const campoValor = localizarCampo(headers, [
    "valor",
    "amount",
    "vlr",
    "total",
  ]);

  /*
    Não usar "nome" nem "cartao".
    São genéricos e podem capturar outra coluna.
  */
  const campoPortador = localizarCampo(headers, [
    "nome do portador",
    "portador",
    "nome titular",
    "titular",
  ]);

  const campoParcela = localizarCampo(headers, [
    "numero da parcela",
    "parcela",
    "parcelas",
    "prestacao",
  ]);

  if (
    !campoData ||
    !campoDescricao ||
    !campoValor
  ) {
    alert(
      "Não consegui identificar Data, Descrição/Estabelecimento e Valor."
    );
    return [];
  }

  return json
    .map((row, index) => {
      const data = dataParaISO(
        row[campoData]
      );

      const estabelecimento = String(
        row[campoDescricao] || ""
      ).trim();

      /*
        Mantém o sinal original:
        compra positiva
        pagamento negativo
        estorno/crédito negativo
      */
      const valor = parseNumeroBR(
        row[campoValor]
      );

      const portador = campoPortador
        ? String(
            row[campoPortador] || ""
          ).trim() || null
        : null;

      const parcela = interpretarParcela(
        campoParcela
          ? row[campoParcela]
          : null
      );

      let tipo_linha;

      /*
        1. Pagamento anterior:
        negativo e descrição contendo pagamento.
      */
      if (
        valor < 0 &&
        normalizarTexto(
          estabelecimento
        ).includes("pagamento")
      ) {
        tipo_linha = "pagamento";
      }

      /*
        2. Outro valor negativo:
        crédito ou estorno.
      */
      else if (valor < 0) {
        tipo_linha = "credito";
      }

      /*
        3. Valor positivo com parcela:
        compra parcelada.
      */
      else if (
        parcela.parcela_atual &&
        parcela.parcela_total
      ) {
        tipo_linha = "parcela";
      }

      /*
        4. Compra positiva sem parcela.
      */
      else {
        tipo_linha = "compra";
      }

      return {
        linha: index + 1,
        data,
        estabelecimento,
        portador,
        valor,

        parcela:
          parcela.parcela_texto,

        parcela_atual:
          parcela.parcela_atual,

        parcela_total:
          parcela.parcela_total,

        tipo_linha,

        dados_originais: row,
      };
    })
    .filter((linha) => {
      if (!linha.data) return false;

      if (!linha.estabelecimento) {
        return false;
      }

      if (!Number.isFinite(linha.valor)) {
        return false;
      }

      if (linha.valor === 0) {
        return false;
      }

      if (
        deveIgnorarLinhaCartao(
          linha.estabelecimento
        )
      ) {
        return false;
      }

      /*
        PAGAMENTO:
        não aparece na tela;
        não entra no resumo;
        não é enviado ao webhook;
        não chega à procedure.
      */
      if (
        linha.tipo_linha ===
        "pagamento"
      ) {
        return false;
      }

      /*
        ESTORNO/CRÉDITO:
        permanece na tela com valor negativo;
        será enviado como tipo "credito";
        reduzirá o valor da fatura.
      */
      return true;
    });
}

function conferirCartaoSelecionadoComPDF(dadosPDF, cartao) {
  if (!dadosPDF || !cartao) {
    return { ok: true, mensagem: "" };
  }

  const erros = [];

  // final cartão
  const finalCadastro = String(cartao.numero || "")
    .replace(/\D/g, "")
    .slice(-4);

  if (
    finalCadastro &&
    Array.isArray(dadosPDF.finais) &&
    dadosPDF.finais.length > 0 &&
    !dadosPDF.finais.includes(finalCadastro)
  ) {
    erros.push(
  `Final do cartão: cadastro ${finalCadastro}, PDF ${dadosPDF.finais.join(" ou ")}`
);
  }

  // vencimento
  if (
    Number(cartao.vencimento_dia) &&
    Number(dadosPDF.vencimento_dia) &&
    Number(cartao.vencimento_dia) !==
      Number(dadosPDF.vencimento_dia)
  ) {
    erros.push(
        `Vencimento: cadastro dia ${cartao.vencimento_dia}, PDF dia ${dadosPDF.vencimento_dia}`
    );
  }

  // fechamento
  if (
    Number(cartao.fechamento_dia) &&
    Number(dadosPDF.fechamento_dia) &&
    Number(cartao.fechamento_dia) !==
      Number(dadosPDF.fechamento_dia)
  ) {
   erros.push(
  `Dia de fechamento: cadastro ${cartao.fechamento_dia}, PDF ${dadosPDF.fechamento_dia}`
);
  }

  return {
    ok: erros.length === 0,
    mensagem: erros.join("\n"),
  };
}

 const linhasExibidas = linhas.filter((linha) => {
  if (filtroStatus === "todos") {
    return true;
  }

  if (filtroStatus === "pendentes") {
    return (
      linhaExigeContaContabil(linha) &&
      !linha.conta_contabil_id
    );
  }

  return true;
});
 

 async function importarArquivo(e) {
  try {
    const file = e.target.files?.[0];
    if (!file) return;

    const nome = file.name || "";
    const ext = nome.split(".").pop().toLowerCase();

    if (["xlsx", "xls","csv"].includes(ext)) {
  const confirmou = window.confirm(
    `Tem certeza que este arquivo pertence ao cartão ${cartaoSelecionado?.nome || ""} ` +
    `final ${String(cartaoSelecionado?.numero || "").slice(-4)}?`
  );

  if (!confirmou) {
    e.target.value = "";
    return;
  }
}



    const buffer = await file.arrayBuffer();

    console.log("ARQUIVO SELECIONADO:", { nome, ext, tamanho: file.size });

    setImportacaoId(null);
    setStatusEtapa("importar");
    setTipoArquivo(ext.toUpperCase());
    setValidacaoPDF(null);


      setContaBuscaLinha({});
      setContaDropdownLinha(null);
      setContasFiltradasLinha([]);

    let linhasConvertidas = [];
    let validacao = null;
 
    if (ext === "pdf") {
  const retornoPDF = await importarPDFViaN8N(file, buffer);

  console.log("RETORNO PDF N8N:", retornoPDF);
console.log("LINHAS N8N:", retornoPDF?.linhas);

  if (!retornoPDF?.ok) {
    alert(retornoPDF?.mensagem || "Não consegui importar o PDF.");
    return;
  }



 const fechamentoDiaPDF = Number(
  retornoPDF?.dados_cartao_pdf?.fechamento_dia ||
  retornoPDF?.fechamento_dia ||
  0
);

if (fechamentoDiaPDF) {
  await atualizaDiaFechamento(fechamentoDiaPDF);
}


  const conferencia =
  conferirCartaoSelecionadoComPDF(
    retornoPDF.dados_cartao_pdf,
    cartaoSelecionado
  );

if (!conferencia.ok) {
  const continuar = window.confirm(
    "O PDF parece não pertencer ao cartão selecionado.\n\n" +
    conferencia.mensagem +
    "\n\nDeseja continuar?"
  );

  if (!continuar) {
    e.target.value = "";
    return;
  }
}
 
  linhasConvertidas = Array.isArray(retornoPDF?.linhas)
  ? retornoPDF.linhas
  : [];

setTipoArquivo(retornoPDF.origem || "PDF_N8N");

const referenciaPDF =
  retornoPDF.data_referencia ||
  retornoPDF.mes_referencia ||
  mesReferenciaDaFatura(retornoPDF.vencimento) ||
  mesReferenciaDaFatura(retornoPDF.vencimento_fatura) ||
  mesReferenciaDaFatura(retornoPDF.data_vencimento) ||
  null;

/*
  Procura compras manuais existentes e recupera
  as contas contábeis antes de mostrar na tela.
*/
linhasConvertidas =
  await buscarContasContabeisImportacao(
    linhasConvertidas
  );

processarLinhasImportadas(
  linhasConvertidas,
  retornoPDF.validacao || null,
  referenciaPDF
);

  alert(`${linhasConvertidas.length} lançamentos carregados na tela.`);
  e.target.value = "";
  return;
} else {
      let json = [];

      if (["xlsx", "xls"].includes(ext)) {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        json = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
          raw: false,
        });
      } else {
        const texto = new TextDecoder("utf-8").decode(buffer);

        const linhasTxt = texto
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

        if (!linhasTxt.length) {
          alert("Arquivo vazio ou sem linhas para importar.");
          return;
        }

        const headers = linhasTxt[0].split(";").map((h) => h.trim());

        json = linhasTxt.slice(1).map((linha) => {
          const cols = linha.split(";").map((c) => c.trim());
          const obj = {};

          headers.forEach((h, i) => {
            obj[h] = cols[i] ?? "";
          });

          return obj;
        });
      }

      console.log("JSON LIDO:", json.length);
      console.table(json);

      linhasConvertidas = converterPlanilha(json);
    }

    if (!linhasConvertidas.length) {
      alert("Arquivo lido, mas não consegui identificar lançamentos.");
      return;
    }

    linhasConvertidas =
  await buscarContasContabeisImportacao(
    linhasConvertidas
  );

processarLinhasImportadas(
  linhasConvertidas,
  retornoPDF.validacao || null,
  referenciaPDF
);

    if (validacao?.bloqueiaSalvar) {
      alert(`${linhasConvertidas.length} lançamentos carregados, mas a importação ficou BLOQUEADA: ${validacao.mensagem}`);
    } else {
      alert(`${linhasConvertidas.length} lançamentos carregados na tela.`);
    }

    e.target.value = "";
  } catch (err) {
    console.error("ERRO AO IMPORTAR ARQUIVO:", err);
    alert(err.message || "Erro ao importar arquivo.");
  }
}
  

async function importarPDFViaN8N(file, buffer) {
  const formData = new FormData();

  formData.append("empresa_id", empresa_id);
  formData.append("cartao_id", cartaoId || "");
  formData.append("senha_pdf", senhaPDF || "");

  // Com senha informada, o navegador tenta abrir o PDF.
  if (senhaPDF.trim()) {
    const textoPDF = await lerTextoPDF(buffer);

    if (!textoPDF || textoPDF.trim().length < 50) {
      throw new Error(
        "Não consegui extrair o conteúdo do PDF com a senha informada."
      );
    }

    formData.append("texto_pdf", textoPDF);
  } else {
    // Sem senha, envia o arquivo ao n8n.
    formData.append("arquivo", file);
  }

  const resp = await fetch(
    buildWebhookUrl("importar_fatura_cartao_pdf"),
    {
      method: "POST",
      body: formData,
    }
  );

  const texto = await resp.text();

  console.log("STATUS IMPORTAÇÃO PDF:", resp.status);
  console.log("RETORNO BRUTO IMPORTAÇÃO PDF:", texto);

  if (!texto || !texto.trim()) {
    if (!senhaPDF.trim()) {
      throw new Error(
        "Este PDF pode estar protegido por senha. Informe a senha do PDF e tente novamente."
      );
    }

    throw new Error(
      "O serviço de importação não retornou resposta."
    );
  }

  let json;

  try {
    json = JSON.parse(texto);
  } catch {
    const textoNormalizado = texto.toLowerCase();

    if (
      textoNormalizado.includes("password") ||
      textoNormalizado.includes("senha") ||
      textoNormalizado.includes("encrypted") ||
      textoNormalizado.includes("encript")
    ) {
      throw new Error(
        "Este PDF exige senha. Informe a senha e tente novamente."
      );
    }

    throw new Error(
      `Resposta inválida do serviço de importação: ${texto}`
    );
  }

  if (!resp.ok) {
    const mensagem =
      json?.mensagem ||
      json?.message ||
      json?.erro ||
      json?.error ||
      json?.[0]?.mensagem ||
      json?.[0]?.message;

    throw new Error(
      mensagem ||
      "Erro ao processar o PDF."
    );
  }

  const resultado = Array.isArray(json)
    ? json[0]
    : json;

  if (resultado?.ok === false) {
    const mensagem =
      resultado?.mensagem ||
      resultado?.message ||
      resultado?.erro ||
      resultado?.error;

    throw new Error(
      mensagem ||
      "Não foi possível processar o PDF."
    );
  }

  return resultado;
}


function mesReferenciaDaFatura(data) {
  if (!data) return null;

  const iso = dataParaISO(data) || String(data).slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return null;
  }

  return `${iso.slice(0, 7)}-01`;
}

function processarLinhasImportadas(linhasConvertidas, validacao = null, referenciaFatura = null) {
  const sugestao = referenciaFatura || new Date().toISOString().slice(0, 10);

  setDataReferencia(sugestao || "");

  let totalCompras = 0;
  let totalCreditos = 0;

  linhasConvertidas.forEach((l) => {
    if (l.valor >= 0) totalCompras += l.valor;
    else totalCreditos += Math.abs(l.valor);
  });

  setLinhas(linhasConvertidas);
  setValidacaoPDF(validacao);

  setResumo({
    qtd: linhasConvertidas.length,
    compras: totalCompras,
    creditos: totalCreditos,
    liquido: totalCompras - totalCreditos,
  });
}

 async function salvarImportacao() {
  if (!cartaoId) {
    alert("Selecione o cartão.");
    return;
  }

  if (!linhas.length) {
    alert("Nenhuma linha importada.");
    return;
  }

  const linhasSemConta = linhas.filter(
    (linha) =>
      linhaExigeContaContabil(linha) &&
      !linha.conta_contabil_id
  );

  if (linhasSemConta.length > 0) {
    alert(
      `Existem ${linhasSemConta.length} compra(s) sem conta contábil. ` +
      "Informe todas as contas antes de salvar."
    );
    return;
  }

  if (validacaoPDF?.bloqueiaSalvar) {
    alert(
      validacaoPDF.mensagem ||
      "Importação PDF bloqueada por divergência de total."
    );
    return;
  }

  const ids = linhas.map((l) => {
    const exigeConta = linhaExigeContaContabil(l);

    return {
      data: l.data,
      estabelecimento: l.estabelecimento,
      portador: l.portador,
      valor: l.valor,
      parcela: l.parcela,
      parcela_atual: l.parcela_atual,
      parcela_total: l.parcela_total,
      tipo_linha: l.tipo_linha,

      conta_contabil_id:
        exigeConta && l.conta_contabil_id
          ? Number(l.conta_contabil_id)
          : null,

      conta_contabil_descricao:
        exigeConta
          ? l.conta_contabil_descricao || null
          : null,

      dados_originais: l.dados_originais,
    };
  });

  const payload = {
    empresa_id: Number(empresa_id),
    cartao_id: Number(cartaoId),
    origem: tipoArquivo?.startsWith("PDF")
      ? tipoArquivo
      : "CARTAO",
    ids,
    data_referencia: dataReferencia,
  };

  try {
    setSalvando(true);

    const url = buildWebhookUrl("conciliar_cartao");

    const resp = await fetchSeguro(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const retorno = Array.isArray(resp)
      ? resp[0]
      : resp;

    const novoImportacaoId =
      retorno?.importacao_id ||
      retorno?.id ||
      retorno?.data?.importacao_id ||
      retorno?.retorno?.importacao_id ||
      retorno?.data?.[0]
        ?.ff_importar_cartao_transacoes
        ?.importacao_id;

    if (!novoImportacaoId) {
      console.log("RETORNO SALVAR:", resp);

      throw new Error(
        "Importação salva, mas o webhook não retornou importacao_id."
      );
    }

    console.log(
      "IMPORTACAO_ID STATE:",
      novoImportacaoId
    );

    setImportacaoId(
      Number(novoImportacaoId)
    );

    setStatusEtapa("conciliar");
  } catch (err) {
    alert(
      err.message ||
      "Erro ao salvar importação."
    );
  } finally {
    setSalvando(false);
  }
}




 function limpar() {
  setLinhas([]);
  setResumo(null);
  setImportacaoId(null);
  setDataReferencia("");
  setStatusEtapa("importar");
  setSalvando(false);
  setConciliando(false);
  setTipoArquivo("");
  setValidacaoPDF(null);

  setLinhasSelecionadas([]);
  setContaLoteTexto("");
  setContaLoteId(null);
  setMostrarContasLote(false);

  // Limpa contas da importação anterior
  setContaBuscaLinha({});
  setContaDropdownLinha(null);
  setContasFiltradasLinha([]);

setResultadoConciliacao(null);
setTransacoesFatura([]);
setCarregandoTransacoes(false);

 
setCarregandoResultado(false);


}
 

  async function conciliarImportacao() {
  if (!importacaoId) {
    alert("Salve a importação antes de conciliar.");
    return;
  }

  if (!dataReferencia) {
    alert("Informe a data de referência da fatura.");
    return;
  }

  try {
    setConciliando(true);

    const url = buildWebhookUrl("cartao_conciliar");

    const resp = await fetchSeguro(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: Number(empresa_id),
        importacao_id: Number(importacaoId),
        data_referencia: dataReferencia,
      }),
    });

    console.log("RETORNO CONCILIAR:", resp);

    console.log("ANTES DE CHAMAR resultado_conciliacao");

    const resultado = await carregarResultadoConciliacao();

    if (!resultado) {
      return;
    }

    setStatusEtapa("finalizado");
    alert("Fatura conciliada com sucesso!");
  } catch (err) {
    console.error("ERRO AO CONCILIAR:", err);
    alert(err?.message || "Erro ao conciliar importação.");
  } finally {
    setConciliando(false);
  }
}


function sugerirDataReferencia(linhasConvertidas) {
  const cartao = cartoes.find((c) => String(c.id) === String(cartaoId));
  const fechamentoDia = Number(cartao?.fechamento_dia || 31);

  

  const competencias = linhasConvertidas
    .filter((l) => l.tipo_linha === "compra" && Number(l.valor || 0) > 0 && l.data)
    .map((l) => {
      const parcelaAtual = Number(l.parcela_atual || 1);

      const [ano, mes, dia] = l.data.split("-").map(Number);
      const data = new Date(ano, mes - 1, dia);

      data.setMonth(data.getMonth() + (parcelaAtual - 1));

      let anoRef = data.getFullYear();
      let mesRef = data.getMonth();

      if (data.getDate() > fechamentoDia) {
        mesRef += 1;
      }

      const ref = new Date(anoRef, mesRef, 1);

      return ref.toISOString().slice(0, 10);
    })
    .sort();

  if (!competencias.length) return "";

  return competencias[competencias.length - 1];
}

 
 function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}


const cartaoSelecionado =
  cartoes.find((c) => String(c.id) === String(cartaoId)) || cartoes[0];

function trocarCartao(direcao) {
  if (!cartoes.length) return;

  const indexAtual = cartoes.findIndex(
    (c) => String(c.id) === String(cartaoSelecionado?.id)
  );

  const novoIndex =
    direcao === "proximo"
      ? (indexAtual + 1) % cartoes.length
      : (indexAtual - 1 + cartoes.length) % cartoes.length;

  setCartaoId(String(cartoes[novoIndex].id));
}



async function lerTextoPDF(buffer) {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: buffer,
      password: senhaPDF?.trim() || undefined,
    });

    const pdf = await loadingTask.promise;
    let textoFinal = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const textoPagina = content.items
        .map((item) => item.str)
        .join(" ");

      textoFinal += "\n" + textoPagina;
    }

    return textoFinal;
  } catch (err) {
    console.error("ERRO PDF:", err);

    const msg = String(err?.message || "");
    const code = err?.code;

    if (msg.includes("No password given") || code === 1) {
      throw new Error("Este PDF exige senha. Preencha o campo 'Senha do PDF' e tente importar novamente.");
    }

    if (msg.includes("Incorrect Password") || code === 2) {
      throw new Error("Senha do PDF incorreta. Confira a senha e tente novamente.");
    }

    throw new Error("Não consegui ler o PDF.");
  }
}

async function carregarContasContabeis() {
  try {
    const url = buildWebhookUrl(
      "despesa_cmv",
      { empresa_id }
    );

    const resp = await fetch(url);

    if (!resp.ok) {
      throw new Error("Erro ao carregar contas contábeis.");
    }

    const json = await resp.json();

    const base = Array.isArray(json) ? json[0] : json;
    const dados = base?.data || base?.dados || json;

    setContasContabeis(
      Array.isArray(dados) ? dados : []
    );
  } catch (e) {
    console.error("ERRO CONTAS CONTÁBEIS:", e);
    setContasContabeis([]);
  }
}


function filtrarContasDaLinha(texto) {
  const busca = String(texto || "")
    .toLowerCase()
    .trim();

  const lista = contasContabeis
    .filter((c) => {
      const descricao = `${c.codigo || ""} ${c.nome || ""} ${
        c.apelido || ""
      }`.toLowerCase();

      return descricao.includes(busca);
    })
    .slice(0, 15);

  setContasFiltradasLinha(lista);
}

 function selecionarContaContabilLinha(linhaAtual, conta) {
  const chaveLinha = Number(linhaAtual.linha);

  setLinhas((prev) =>
    prev.map((item) =>
      Number(item.linha) === chaveLinha
        ? {
            ...item,
            conta_contabil_id: Number(conta.id),
            conta_contabil_descricao: `${conta.codigo} - ${conta.nome}`,
          }
        : item
    )
  );

  setContaBuscaLinha((prev) => ({
    ...prev,
    [chaveLinha]: `${conta.codigo} - ${conta.nome}`,
  }));

  setContaDropdownLinha(null);
  setContasFiltradasLinha([]);
}

 
async function carregarTransacoesFatura(faturaId) {
  if (!faturaId) {
    throw new Error("Fatura não informada.");
  }

  try {
    setCarregandoTransacoes(true);

    const url = buildWebhookUrl("transacoes_fatura", {
      empresa_id: Number(empresa_id),
      fatura_id: Number(faturaId),
    });

    console.log("CHAMANDO transacoes_fatura:", url);

    const resp = await fetch(url, {
      method: "GET",
    });

    const texto = await resp.text();

    let json;
    try {
      json = JSON.parse(texto);
    } catch {
      throw new Error(
        `Resposta inválida do webhook transacoes_fatura: ${texto}`
      );
    }

    if (!resp.ok) {
      throw new Error(
        json?.message ||
          json?.[0]?.message ||
          `Erro HTTP ${resp.status} ao carregar a fatura.`
      );
    }

    const lista =
      Array.isArray(json?.[0]?.data)
        ? json[0].data
        : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];

    setTransacoesFatura(lista);
    return lista;
  } finally {
    setCarregandoTransacoes(false);
  }
}
 

async function carregarResultadoConciliacao() {
  try {
    setCarregandoResultado(true);

    const payload = {
      empresa_id: Number(empresa_id),
      cartao_id: Number(cartaoId),
      data_referencia: dataReferencia,
    };

    const url = buildWebhookUrl("resultado_conciliacao");

    console.log("CHAMANDO resultado_conciliacao:", url, payload);

    const resp = await fetchSeguro(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("RETORNO resultado_conciliacao:", resp);

    const base = Array.isArray(resp) ? resp[0] : resp;

    const resultado =
      base?.fatura_id
        ? base
        : base?.data?.fatura_id
          ? base.data
          : Array.isArray(base?.data)
            ? base.data[0]
            : base?.data?.[0] || base;

    const faturaId = Number(resultado?.fatura_id || 0);

    if (!faturaId) {
      throw new Error(
        "O webhook resultado_conciliacao não retornou fatura_id."
      );
    }

    const resultadoTela = {
      ...resultado,
      fatura_id: faturaId,
      importacao_id: Number(importacaoId),
    };

    setResultadoConciliacao(resultadoTela);

    await carregarTransacoesFatura(faturaId);

    return resultadoTela;
  } catch (err) {
    console.error("ERRO RESULTADO CONCILIAÇÃO:", err);
    alert(
      err?.message ||
        "A conciliação foi concluída, mas não foi possível carregar o resultado."
    );
    return null;
  } finally {
    setCarregandoResultado(false);
  }
}

function linhaExigeContaContabil(linha) {
  const tipo = String(
    linha?.tipo_linha || ""
  ).toLowerCase();

  const parcelaAtual = Number(
    linha?.parcela_atual || 1
  );

  if (
    tipo === "credito" ||
    tipo === "pagamento"
  ) {
    return false;
  }

  if (tipo === "compra") {
    return true;
  }

  if (
    tipoImportacao === "implantacao" &&
    tipo === "parcela"
  ) {
    return true;
  }

  return (
    tipo === "parcela" &&
    parcelaAtual === 1
  );
}

function selecionarLinhaLote(linha) {
  const id = Number(linha.linha);

  setLinhasSelecionadas((anteriores) =>
    anteriores.includes(id)
      ? anteriores.filter((item) => item !== id)
      : [...anteriores, id]
  );
}

function selecionarTodasLinhas() {
  const permitidas = linhas
    .filter((linha) => linhaExigeContaContabil(linha))
    .map((linha) => Number(linha.linha));

  const todasSelecionadas =
    permitidas.length > 0 &&
    permitidas.every((id) =>
      linhasSelecionadas.includes(id)
    );

  setLinhasSelecionadas(
    todasSelecionadas ? [] : permitidas
  );
}

function selecionarContaLote(conta) {
  setContaLoteId(Number(conta.id));
  setContaLoteTexto(
    `${conta.codigo} - ${conta.nome}`
  );
  setMostrarContasLote(false);
}

function aplicarContaSelecionados() {
  if (!linhasSelecionadas.length) {
    alert("Selecione pelo menos uma compra.");
    return;
  }

  if (!contaLoteId) {
    alert("Selecione a conta contábil.");
    return;
  }

  setLinhas((anteriores) =>
    anteriores.map((linha) =>
      linhasSelecionadas.includes(
        Number(linha.linha)
      ) &&
      linhaExigeContaContabil(linha)
        ? {
            ...linha,
            conta_contabil_id: contaLoteId,
            conta_contabil_descricao:
              contaLoteTexto,
          }
        : linha
    )
  );

  setContaBuscaLinha((anterior) => {
    const novo = { ...anterior };

    linhasSelecionadas.forEach((id) => {
      novo[id] = contaLoteTexto;
    });

    return novo;
  });

  setLinhasSelecionadas([]);
  setContaLoteTexto("");
  setContaLoteId(null);
  setMostrarContasLote(false);
}
 

async function buscarContasContabeisImportacao(linhasImportadas) {
  if (!Array.isArray(linhasImportadas) || linhasImportadas.length === 0) {
    return linhasImportadas;
  }

  try {
    const ids = linhasImportadas.map((linha) => ({
      linha: Number(linha.linha),
      data: linha.data,
      estabelecimento: linha.estabelecimento,
      valor: Number(linha.valor || 0),
      parcela_atual: linha.parcela_atual || null,
      parcela_total: linha.parcela_total || null,
      tipo_linha: linha.tipo_linha,
    }));

    const payload = {
      empresa_id: Number(empresa_id),
      cartao_id: Number(cartaoId),
      fechamento_dia: Number(
        cartaoSelecionado?.fechamento_dia || 20
      ),
      ids,
    };

    console.log("PAYLOAD SUGESTÃO CONTÁBIL:", payload);

    const resp = await fetchSeguro(
      buildWebhookUrl("sugerir_contas_importacao_cartao"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    console.log("RETORNO BRUTO SUGESTÃO CONTÁBIL:", resp);

    /*
      Aceita estes formatos:

      { ok: true, data: [...] }

      { resultado: { ok: true, data: [...] } }

      [{ resultado: { ok: true, data: [...] } }]

      [{ data: { resultado: { ok: true, data: [...] } } }]
    */
    const base = Array.isArray(resp) ? resp[0] : resp;

    const resultado =
      base?.resultado ||
      base?.data?.resultado ||
      base?.data?.[0]?.resultado ||
      base;

    const sugestoes = Array.isArray(resultado?.data)
      ? resultado.data
      : [];

    console.log("SUGESTÕES ENCONTRADAS:", sugestoes);

    const linhasAtualizadas = linhasImportadas.map((linha) => {
      const sugestao = sugestoes.find(
        (item) =>
          Number(item.linha) === Number(linha.linha)
      );

      if (!sugestao?.contabil_id) {
        return linha;
      }

      const contabilId = Number(sugestao.contabil_id);

      const conta = contasContabeis.find(
        (item) => Number(item.id) === contabilId
      );

      const descricaoConta = conta
        ? `${conta.codigo} - ${conta.nome}`
        : `Conta contábil ${contabilId}`;

      return {
        ...linha,
        compra_match_id:
          sugestao.compra_match_id
            ? Number(sugestao.compra_match_id)
            : null,

        conta_contabil_id: contabilId,
        conta_contabil_descricao: descricaoConta,
      };
    });

    /*
      O input da tabela usa primeiro contaBuscaLinha.
      Por isso precisamos atualizar esse estado também.
    */
    setContaBuscaLinha((anterior) => {
      const novo = { ...anterior };

      linhasAtualizadas.forEach((linha) => {
        if (
          linha.conta_contabil_id &&
          linha.conta_contabil_descricao
        ) {
          novo[Number(linha.linha)] =
            linha.conta_contabil_descricao;
        }
      });

      return novo;
    });

    console.log(
      "LINHAS DEPOIS DA SUGESTÃO CONTÁBIL:",
      linhasAtualizadas
    );

    return linhasAtualizadas;
  } catch (erro) {
    console.error(
      "ERRO AO BUSCAR CONTAS CONTÁBEIS:",
      erro
    );

    /*
      A sugestão automática não deve impedir a importação.
      Retorna as linhas originais para o usuário preencher.
    */
    return linhasImportadas;
  }
}

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200 px-4 py-4">
    <div className="mx-auto w-full max-w-[1700px] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">

      <div className="bg-[#061f4a] px-5 py-3">
        <div className="flex items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <h2 className="text-lg font-black tracking-wide text-white">
                💳 Central de Importação de Cartões — RESULTADO ATIVO
              </h2>

              <p className="text-xs text-sky-100 font-semibold">
                Importe faturas por Excel, CSV, TXT ou PDF.
              </p>
            </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAbaAtiva("lancamentos")}
              className={`px-5 py-2 rounded-full font-black text-sm shadow ${
                abaAtiva === "lancamentos"
                  ? "bg-cyan-400 text-slate-950"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              💳 Lançamentos
            </button>

            <button
              type="button"
              onClick={() => setAbaAtiva("layout")}
              className={`px-5 py-2 rounded-full font-black text-sm shadow ${
                abaAtiva === "layout"
                  ? "bg-cyan-400 text-slate-950"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              📄 Layout da Planilha
            </button>
          </div>
        </div>


           {abaAtiva === "lancamentos" &&
  resultadoConciliacao && (
    <div className="mt-5 overflow-hidden rounded-3xl border border-emerald-300 bg-white shadow-xl">
      <div className="flex items-center justify-between gap-4 bg-emerald-700 px-5 py-4 text-white">
        <div>
          <h3 className="text-xl font-black">
            ✅ Fatura conciliada com sucesso
          </h3>

          <p className="mt-1 text-xs font-semibold text-emerald-100">
            Fatura nº {resultadoConciliacao.fatura_id} ·
            Importação nº {resultadoConciliacao.importacao_id}
          </p>
        </div>

        <button
          type="button"
          onClick={limpar}
          className="btn-pill btn-white text-xs"
        >
          Nova importação
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 border-b bg-emerald-50 p-4 md:grid-cols-5">
        <div className="rounded-2xl border bg-white p-3">
          <div className="text-xs font-bold text-slate-500">
            Processadas
          </div>

          <div className="text-xl font-black text-slate-800">
            {resultadoConciliacao.processadas || 0}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-3">
          <div className="text-xs font-bold text-slate-500">
            Criadas
          </div>

          <div className="text-xl font-black text-emerald-700">
            {resultadoConciliacao.compras_criadas ||
              resultadoConciliacao
                .compras_implantacao_criadas ||
              0}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-3">
          <div className="text-xs font-bold text-slate-500">
            Recriadas
          </div>

          <div className="text-xl font-black text-blue-700">
            {resultadoConciliacao.compras_recriadas || 0}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-3">
          <div className="text-xs font-bold text-slate-500">
            Pendentes
          </div>

          <div className="text-xl font-black text-amber-700">
            {resultadoConciliacao
              .pendentes_compras_antigas || 0}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-3">
          <div className="text-xs font-bold text-slate-500">
            Ignoradas
          </div>

          <div className="text-xl font-black text-slate-700">
            {resultadoConciliacao.ignoradas || 0}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-800 px-5 py-3 text-white">
        <div>
          <div className="font-black">
            Lançamentos da fatura
          </div>

          <div className="text-xs font-semibold text-slate-300">
            O que ficou gravado no cartão após a conciliação
          </div>
        </div>

        <div className="text-xs font-black">
          {transacoesFatura.length} registro(s)
        </div>
      </div>



      

      {carregandoTransacoes ? (
        <div className="p-8 text-center font-bold text-slate-500">
          Carregando lançamentos...
        </div>
      ) : transacoesFatura.length === 0 ? (
        <div className="p-8 text-center font-bold text-slate-500">
          Nenhum lançamento encontrado nesta fatura.
        </div>
      ) : (
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-200 text-slate-800">
              <tr>
                <th className="w-[115px] p-3 text-left">
                  Compra
                </th>

                <th className="p-3 text-left">
                  Descrição
                </th>

                <th className="w-[105px] p-3 text-center">
                  Parcela
                </th>

                <th className="w-[120px] p-3 text-center">
                  Data parcela
                </th>

                <th className="w-[110px] p-3 text-center">
                  Referência
                </th>

                <th className="w-[135px] p-3 text-right">
                  Valor
                </th>
              </tr>
            </thead>

            <tbody>
              {transacoesFatura.map((item, index) => (
                <tr
                  key={`${item.fatura_id}-${item.descricao}-${item.parcela_num}-${index}`}
                  className="border-t hover:bg-blue-50"
                >
                  <td className="p-3 font-semibold text-slate-600">
                    {String(item.data_compra || "")
                      .slice(0, 10)
                      .split("-")
                      .reverse()
                      .join("/")}
                  </td>

                  <td className="p-3">
                    <div className="font-bold text-slate-800">
                      {item.descricao}
                    </div>

                    <div className="mt-0.5 text-[11px] font-semibold text-slate-400">
                      {item.nome} · {item.bandeira} · Final{" "}
                      {String(item.numero || "").slice(-4)}
                    </div>
                  </td>

                  <td className="p-3 text-center font-black text-slate-700">
                    {item.parcela_num || 1}/
                    {item.parcela_total || 1}
                  </td>

                  <td className="p-3 text-center font-semibold text-slate-600">
                    {String(item.data_parcela || "")
                      .slice(0, 10)
                      .split("-")
                      .reverse()
                      .join("/")}
                  </td>

                  <td className="p-3 text-center font-semibold text-slate-600">
                    {String(item.mes_referencia || "")
                      .slice(0, 7)
                      .split("-")
                      .reverse()
                      .join("/")}
                  </td>

                  <td className="p-3 text-right font-black text-red-700">
                    {Number(item.valor || 0).toLocaleString(
                      "pt-BR",
                      {
                        style: "currency",
                        currency: "BRL",
                      }
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="sticky bottom-0 bg-slate-900 text-white">
              <tr>
                <td
                  colSpan={5}
                  className="p-3 text-right font-black"
                >
                  Total desta fatura
                </td>

                <td className="p-3 text-right text-base font-black">
                  {transacoesFatura
                    .reduce(
                      (total, item) =>
                        total + Number(item.valor || 0),
                      0
                    )
                    .toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )}
 
        {abaAtiva === "lancamentos" &&   !resultadoConciliacao && (
           <div className="mt-2 grid grid-cols-[620px_420px_1fr] gap-3 items-center">
            <div className="flex flex-col">
              <label className="text-sm font-bold text-white mb-1">
                Cartão
              </label>

              <div className="flex items-center justify-start gap-2">
                <button
                  type="button"
                  onClick={() => trocarCartao("anterior")}
                  className="h-10 w-10 rounded-full bg-cyan-500 text-white text-sm font-black shadow hover:bg-cyan-600"
                >
                  {"<<"}
                </button>

                <div className="w-full max-w-[390px] rounded-xl bg-white border border-cyan-200 px-3 py-2 shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-black text-slate-900">
                          {cartaoSelecionado?.nome ||
                            `Cartão ${cartaoSelecionado?.id || ""}`}
                        </div>

                        <div className="text-sm font-bold text-slate-500">
                          Final{" "}
                          {String(
                            cartaoSelecionado?.numero || ""
                          ).slice(-4)}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={!cartaoSelecionado?.id}
                            onClick={() =>
                              navigate(
                                `/app/edit-card/${cartaoSelecionado.id}`
                              )
                            }
                            className="
                              inline-flex items-center gap-1
                              rounded-lg border border-blue-200
                              bg-blue-50 px-2.5 py-1
                              text-[11px] font-black text-blue-700
                              hover:bg-blue-100
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
                          >
                            ✏️ Editar cartão
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate("/app/new-card")
                            }
                            className="
                              inline-flex items-center gap-1
                              rounded-lg border border-emerald-200
                              bg-emerald-50 px-2.5 py-1
                              text-[11px] font-black text-emerald-700
                              hover:bg-emerald-100
                            "
                          >
                            ＋ Novo cartão
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-400">
                          Disponível
                        </div>

                        <div className="text-base font-black text-emerald-700">
                          {formatarMoeda(
                            cartaoSelecionado?.limite_disponivel
                          )}
                        </div>
                      </div>
                    </div>

                   <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px]">
                    <div  className="rounded-lg bg-slate-100 px-2 py-1.5">
                      <div className="text-slate-500 font-bold">Limite</div>
                      <div className="text-slate-900 font-black">
                        {formatarMoeda(cartaoSelecionado?.limite_total)}
                      </div>
                    </div>

                    <div  className="rounded-lg bg-slate-100 px-2 py-1.5">
                      <div className="text-slate-500 font-bold">Fecha</div>
                      <div className="text-slate-900 font-black">
                        Dia {cartaoSelecionado?.fechamento_dia || "-"}
                      </div>
                    </div>

                    <div  className="rounded-lg bg-slate-100 px-2 py-1.5">
                      <div className="text-slate-500 font-bold">Vence</div>
                      <div className="text-slate-900 font-black">
                        Dia {cartaoSelecionado?.vencimento_dia || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => trocarCartao("proximo")}
                  className="h-10 w-10 rounded-full bg-cyan-500 text-white text-sm font-black shadow hover:bg-cyan-600"
                >
                  {">>"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-white">
                Referência da fatura
              </label>
              <input
                type="date"
                value={dataReferencia}
                onChange={(e) => setDataReferencia(e.target.value)}
                className="h-10 rounded-xl border border-sky-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-300"
              />

              {dataReferencia && (
                <div className="text-xs text-yellow-100 font-bold mt-1">
                  Mês/competência da fatura. A implantação contábil usa a data de hoje.
                </div>
              )}


              <input
              type="password"
              value={senhaPDF}
              onChange={(e) => setSenhaPDF(e.target.value)}
              placeholder="Senha do PDF, se houver"
              className="h-10 rounded-xl border border-sky-200 bg-white px-3 text-sm font-bold text-slate-700"
            />
            </div>

            <div className="text-right justify-self-end">
              <div className="text-sm font-bold text-sky-100">
                Total líquido
              </div>
              <div
                className={`text-2xl font-black ${
                  (resumo?.liquido || 0) >= 0
                    ? "text-green-300"
                    : "text-red-300"
                }`}
              >
                {(resumo?.liquido || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 bg-slate-50">
        {abaAtiva === "layout" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow">
              <h3 className="text-xl font-black text-slate-800 mb-3">
                📄 Layout esperado da planilha de cartão
              </h3>

              <p className="text-sm text-slate-600 mb-4 font-semibold">
                A planilha deve conter as colunas abaixo. O arquivo pode ser Excel, CSV ou TXT separado por ponto e vírgula.
              </p>

              <table className="w-full text-sm border border-slate-200 overflow-hidden rounded-xl">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="p-2 border border-slate-700">Data</th>
                    <th className="p-2 border border-slate-700">Estabelecimento</th>
                    <th className="p-2 border border-slate-700">Portador</th>
                    <th className="p-2 border border-slate-700">Valor</th>
                    <th className="p-2 border border-slate-700">Parcela</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="p-2 border">02/05/2026</td>
                    <td className="p-2 border font-semibold">HETZNER ONLINE GMBH</td>
                    <td className="p-2 border">LUIS GUSTAVO LANDUCCI</td>
                    <td className="p-2 border text-red-700 font-black">R$ 3,67</td>
                    <td className="p-2 border">-</td>
                  </tr>

                  <tr className="bg-slate-50">
                    <td className="p-2 border">20/04/2026</td>
                    <td className="p-2 border font-semibold">Pagamentos Validos Normais</td>
                    <td className="p-2 border">LUIS GUSTAVO LANDUCCI</td>
                    <td className="p-2 border text-green-700 font-black">R$ -272,44</td>
                    <td className="p-2 border">-</td>
                  </tr>

                  <tr>
                    <td className="p-2 border">27/04/2026</td>
                    <td className="p-2 border font-semibold">MP*MERCADOLIVRE</td>
                    <td className="p-2 border">LUIS GUSTAVO LANDUCCI</td>
                    <td className="p-2 border text-red-700 font-black">R$ 10,68</td>
                    <td className="p-2 border">1 de 7</td>
                  </tr>

                  <tr className="bg-slate-50">
                    <td className="p-2 border">27/07/2025</td>
                    <td className="p-2 border font-semibold">ASA*NO CODE START UP N</td>
                    <td className="p-2 border">LUIS GUSTAVO LANDUCCI</td>
                    <td className="p-2 border text-red-700 font-black">R$ 157,53</td>
                    <td className="p-2 border">10 de 12</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 space-y-1 font-semibold">
                <p className="font-black text-slate-900">Regras:</p>
                <p>• Data deve estar no formato DD/MM/AAAA.</p>
                <p>• Estabelecimento é obrigatório.</p>
                <p>• Portador é opcional, mas recomendado.</p>
                <p>• Valor positivo será tratado como compra.</p>
                <p>• Valor negativo será tratado como crédito/pagamento.</p>
                <p>• Parcela pode ser “-”, “1 de 7” ou “1/7”.</p>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={exportarLayout}
                  className="btn-pill btn-dark-blue"
                >
                  📥 Exportar Layout
                </button>
              </div>
            </div>
          )}

          {abaAtiva === "lancamentos" &&
  resumo &&
  !resultadoConciliacao && (
 
           <div className="mb-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">
            ✔ {resumo.qtd} registros importados | Compras:{" "}
            {resumo.compras.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}{" "}
            | Créditos/Pagamentos:{" "}
            {resumo.creditos.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}{" "}
            | Líquido:{" "}
            {resumo.liquido.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        )}

        {abaAtiva === "lancamentos" &&
  validacaoPDF &&
  !resultadoConciliacao && (
          <div
             className={`mb-2 rounded-xl border px-3 py-2 text-xs font-black ${
              validacaoPDF.ok
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            {validacaoPDF.ok ? "✅" : "⛔"} {validacaoPDF.mensagem}
          </div>
        )}

          {abaAtiva === "lancamentos" &&
  linhas.length > 0 &&
  !resultadoConciliacao && (
    <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">

      {/* Filtro */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-slate-500">
          Exibir:
        </span>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="h-9 min-w-[155px] rounded-xl border border-amber-300 bg-amber-50 px-3 text-xs font-black text-amber-800 outline-none focus:ring-2 focus:ring-amber-200"
        >
          <option value="pendentes">
            Pendentes ({quantidadePendentes})
          </option>

          <option value="todos">
            Todos ({linhas.length})
          </option>
        </select>
      </div>

      {/* Conta para selecionados */}
      <div className="flex items-center gap-2">
        <div
          className="relative w-[340px]"
          data-dropdown-conta-cartao
        >
          <input
            type="text"
            value={contaLoteTexto}
            placeholder="Conta contábil para selecionados"
            onFocus={() => setMostrarContasLote(true)}
            onChange={(e) => {
              setContaLoteTexto(e.target.value);
              setContaLoteId(null);
              setMostrarContasLote(true);
            }}
            className="h-9 w-full rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
          />

          {mostrarContasLote &&
            (() => {
              const busca = String(contaLoteTexto || "")
                .toLowerCase()
                .trim();

              const filtradas = contasContabeis
                .filter((conta) => {
                  const descricao =
                    `${conta.codigo || ""} ` +
                    `${conta.nome || ""} ` +
                    `${conta.apelido || ""}`;

                  return (
                    !busca ||
                    descricao.toLowerCase().includes(busca)
                  );
                })
                .slice(0, 15);

              if (!filtradas.length) return null;

              return (
                <div className="absolute right-0 top-full z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                  {filtradas.map((conta) => (
                    <button
                      key={conta.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selecionarContaLote(conta);
                      }}
                      className="block w-full px-3 py-2 text-left text-xs hover:bg-blue-50"
                    >
                      <span className="font-black text-slate-800">
                        {conta.codigo}
                      </span>

                      <span className="text-slate-600">
                        {" - "}
                        {conta.nome}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })()}
        </div>

        <button
          type="button"
          onClick={aplicarContaSelecionados}
          disabled={
            !linhasSelecionadas.length ||
            !contaLoteId
          }
          className="h-9 whitespace-nowrap rounded-xl bg-[#061f4a] px-4 text-xs font-black text-white shadow hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Aplicar ({linhasSelecionadas.length})
        </button>
      </div>
    </div>
  )}

         {abaAtiva === "lancamentos" &&
  !resultadoConciliacao && (
          <div className="max-h-[580px] overflow-y-auto overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow">
            <div className="min-w-[1500px]">
              <div className="sticky top-0 z-10 grid grid-cols-[44px_110px_minmax(280px,1.8fr)_220px_100px_320px_140px_120px] items-center gap-3 border-b border-slate-200 bg-slate-900 px-4 py-3 text-sm text-white">
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={
                      linhas.filter(linhaExigeContaContabil).length > 0 &&
                      linhas
                        .filter(linhaExigeContaContabil)
                        .every((linha) =>
                          linhasSelecionadas.includes(Number(linha.linha))
                        )
                    }
                    onChange={selecionarTodasLinhas}
                    title="Selecionar todas as compras que permitem conta contábil"
                    className="h-4 w-4 cursor-pointer accent-blue-700"
                  />
                </div>
                <div className="text-left font-black">Data</div>
                <div className="text-left font-black">Estabelecimento</div>
                <div className="text-left font-black">Portador</div>
                <div className="text-center font-black">Parcela</div>
                <div className="text-left font-black">Conta contábil</div>
                <div className="text-right font-black">Valor</div>
                <div className="text-center font-black">Tipo</div>
              </div>

              {linhasExibidas.map((l) => (
                <div
                  key={l.linha}
                  className="grid grid-cols-[44px_110px_minmax(280px,1.8fr)_220px_100px_320px_140px_120px] items-center gap-3 border-b border-slate-100 px-4 py-2 text-sm hover:bg-sky-50"
                >
                  <div className="flex justify-center">
                    {linhaExigeContaContabil(l) ? (
                      <input
                        type="checkbox"
                        checked={linhasSelecionadas.includes(Number(l.linha))}
                        onChange={() => selecionarLinhaLote(l)}
                        title="Selecionar esta compra para aplicar conta em lote"
                        className="h-4 w-4 cursor-pointer accent-blue-700"
                      />
                    ) : (
                      <span
                        title="Esta linha não recebe conta contábil nesta etapa"
                        className="text-slate-300"
                      >
                        🔒
                      </span>
                    )}
                  </div>

                  <div className="font-semibold text-slate-700">
                    {String(l.data || "").includes("-")
                      ? l.data.split("-").reverse().join("/")
                      : l.data}
                  </div>

                  <div className="truncate font-bold text-slate-800">
                    {l.estabelecimento}
                  </div>

                  <div className="truncate font-semibold text-slate-500">
                    {l.portador || "-"}
                  </div>

                  <div className="text-center font-semibold text-slate-600">
                    {l.parcela || "-"}
                  </div>

                  <div className="relative min-w-0" data-dropdown-conta-cartao>
                  
                      {linhaExigeContaContabil(l) ? (
                      <>
                        <input
                          type="text"
                          value={
                            contaBuscaLinha[l.linha] ??
                            l.conta_contabil_descricao ??
                            ""
                          }
                          placeholder="Digite código ou nome da conta"
                          onFocus={() => {
                            setContaDropdownLinha(Number(l.linha));
                            filtrarContasDaLinha(
                              contaBuscaLinha[l.linha] ||
                                l.conta_contabil_descricao ||
                                ""
                            );
                          }}
                          onChange={(e) => {
                            const texto = e.target.value;
                            const chaveLinha = Number(l.linha);
                            setContaBuscaLinha((prev) => ({
                              ...prev,
                              [chaveLinha]: texto,
                            }));
                            setLinhas((prev) =>
                              prev.map((item) =>
                                Number(item.linha) === chaveLinha
                                  ? {
                                      ...item,
                                      conta_contabil_id: null,
                                      conta_contabil_descricao: "",
                                    }
                                  : item
                              )
                            );
                            setContaDropdownLinha(chaveLinha);
                            filtrarContasDaLinha(texto);
                          }}
                          className="h-9 w-full rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                        />

                        {Number(contaDropdownLinha) === Number(l.linha) &&
                          contasFiltradasLinha.length > 0 && (
                            <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-full min-w-[380px] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                              {contasFiltradasLinha.map((conta) => (
                                <button
                                  key={conta.id}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    selecionarContaContabilLinha(l, conta);
                                  }}
                                  className="block w-full px-3 py-2 text-left text-xs hover:bg-blue-50"
                                >
                                  <span className="font-black text-slate-800">
                                    {conta.codigo}
                                  </span>
                                  <span className="text-slate-600">
                                    {" - "}{conta.nome}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                      </>
                    ) : (
                      <div
                        title="A conta contábil vem da compra original e é reutilizada nas demais parcelas"
                        className="flex h-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 px-2 text-xs font-semibold text-sky-700"
                      >
                        🔒 Mesma conta da compra
                      </div>
                    )}
                  </div>

                  <div
                    className={`text-right font-mono font-black ${
                      l.valor >= 0 ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    {Number(l.valor || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>

                  <div className="text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        l.tipo_linha === "compra"
                          ? "bg-red-100 text-red-700"
                          : l.tipo_linha === "pagamento"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {l.tipo_linha}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
          
          {abaAtiva === "lancamentos" &&
  !resultadoConciliacao && (
           <div className="mt-5 flex items-center justify-end gap-3 pr-20">
            <label
              className={`btn-pill flex items-center gap-2 ${
                statusEtapa === "importar"
                  ? "btn-dark-black"
                  : "btn-gray opacity-50 pointer-events-none"
              }`}
            >
              📥 1. Importar Arquivo
              <input
                type="file"
                accept=".pdf,.xlsx,.xls,.csv,.txt"
                onChange={importarArquivo}
                disabled={statusEtapa !== "importar"}
                className="hidden"
              />
            </label>

            <button
              onClick={salvarImportacao}
              disabled={salvando || statusEtapa !== "importar" || validacaoPDF?.bloqueiaSalvar}
              className={`btn-pill flex items-center gap-2 ${
                statusEtapa === "importar" && !validacaoPDF?.bloqueiaSalvar
                  ? "btn-dark-blue"
                  : "btn-gray opacity-50"
              }`}
            >
              💾 2. {salvando ? "Salvando..." : "Salvar prévia"}
            </button>

            <button
              onClick={conciliarImportacao}
              disabled={conciliando || statusEtapa !== "conciliar"}
              className={`btn-pill flex items-center gap-2 ${
                statusEtapa === "conciliar"
                  ? "btn-green animate-pulse"
                  : "btn-gray opacity-50"
              }`}
            >
              ✅ 3. {conciliando ? "Conciliando..." : "Conciliar"}
            </button>

            <button
              onClick={limpar}
              className="btn-pill btn-gray flex items-center gap-2"
            >
              🗑 Limpar
            </button>

            <button
              onClick={() => navigate("/contas-cartoes")}
              className="btn-pill btn-dark-blue flex items-center gap-2"
            >
              ↩ Sair
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
}