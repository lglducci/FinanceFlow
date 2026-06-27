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
  }, []);

   



  
    async function carregarCartoes() {
      try {
        const resp = await fetch(buildWebhookUrl("cartoes", { id_empresa: empresa_id }));
        const data = await resp.json();
        setCartoes(Array.isArray(data) ? data : []);
      } catch {
        setCartoes([]);
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
  const totalImportado = Number(
    linhasConvertidas
      .reduce((soma, l) => soma + Math.abs(Number(l.valor || 0)), 0)
      .toFixed(2)
  );

  if (totalPDF == null) {
    return {
      origem: "PDF",
      ok: false,
      bloqueiaSalvar: false,
      mensagem: `Não localizei com segurança o total da fatura no PDF. Total importado: ${formatarMoeda(totalImportado)}.`,
      totalPDF: null,
      totalImportado,
      diferenca: null,
    };
  }

  const diferenca = Number((totalImportado - totalPDF).toFixed(2));
  const ok = valoresQuaseIguais(totalImportado, totalPDF);

  return {
    origem: "PDF",
    ok,
    bloqueiaSalvar: !ok,
    mensagem: ok
      ? "PDF validado: total importado bate com o total da fatura."
      : `Divergência no PDF: total importado ${formatarMoeda(totalImportado)} x total da fatura ${formatarMoeda(totalPDF)}. Diferença ${formatarMoeda(diferenca)}.`,
    totalPDF,
    totalImportado,
    diferenca,
  };
}



  function converterPlanilha(json) {
    if (!json.length) return [];

    const headers = Object.keys(json[0]);

    const campoData = localizarCampo(headers, [
      "data",
      "dt",
      "data compra",
      "data lancamento",
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

    const campoPortador = localizarCampo(headers, [
      "portador",
      "titular",
      "nome",
      "cartao",
    ]);

    const campoParcela = localizarCampo(headers, [
      "parcela",
      "parcelas",
      "prestacao",
    ]);

    if (!campoData || !campoDescricao || !campoValor) {
      alert("Não consegui identificar Data, Descrição/Estabelecimento e Valor.");
      return [];
    }

    return json
      .map((row, index) => {
        const data = dataParaISO(row[campoData]);
        const estabelecimento = String(row[campoDescricao] || "").trim();
        const valor = parseNumeroBR(row[campoValor]);
        const portador = campoPortador ? String(row[campoPortador] || "").trim() : null;

        const parcela = interpretarParcela(campoParcela ? row[campoParcela] : null);
        const tipo_linha = identificarTipo(estabelecimento, valor);

        return {
          linha: index + 1,
          data,
          estabelecimento,
          portador,
          valor,
          parcela: parcela.parcela_texto,
          parcela_atual: parcela.parcela_atual,
          parcela_total: parcela.parcela_total,
          tipo_linha,
          dados_originais: row,
        };
      })
      .filter(
  (l) =>
    l.data &&
    l.estabelecimento &&
    l.valor !== 0 &&
    !deveIgnorarLinhaCartao(l.estabelecimento)
);
  }

 async function importarArquivo(e) {
  try {
    const file = e.target.files?.[0];
    if (!file) return;

    const nome = file.name || "";
    const ext = nome.split(".").pop().toLowerCase();
    const buffer = await file.arrayBuffer();

    console.log("ARQUIVO SELECIONADO:", { nome, ext, tamanho: file.size });

    setImportacaoId(null);
    setStatusEtapa("importar");
    setTipoArquivo(ext.toUpperCase());
    setValidacaoPDF(null);

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

    processarLinhasImportadas(linhasConvertidas, validacao);

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

  // Se tiver senha, o React extrai o texto e manda texto_pdf.
  if (senhaPDF.trim()) {
    const textoPDF = await lerTextoPDF(buffer);

    if (!textoPDF || textoPDF.trim().length < 50) {
      throw new Error("Não consegui extrair texto do PDF com a senha informada.");
    }

    formData.append("texto_pdf", textoPDF);
  } else {
    // Sem senha, manda o arquivo puro para o N8N extrair melhor.
    formData.append("arquivo", file);
  }

  const resp = await fetch(buildWebhookUrl("importar_fatura_cartao_pdf"), {
    method: "POST",
    body: formData,
  });

  const json = await resp.json();
  return Array.isArray(json) ? json[0] : json;
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

    if (validacaoPDF?.bloqueiaSalvar) {
      alert(validacaoPDF.mensagem || "Importação PDF bloqueada por divergência de total.");
      return;
    }

    const ids = linhas.map((l) => ({
      data: l.data,
      estabelecimento: l.estabelecimento,
      portador: l.portador,
      valor: l.valor,
      parcela: l.parcela,
      parcela_atual: l.parcela_atual,
      parcela_total: l.parcela_total,
      tipo_linha: l.tipo_linha,
      dados_originais: l.dados_originais,
    }));

     

    const payload = {
  empresa_id: Number(empresa_id),
  cartao_id: Number(cartaoId),
  origem: tipoArquivo?.startsWith("PDF") ? tipoArquivo : "CARTAO",
  ids,
  data_referencia:dataReferencia
};

    try {
      setSalvando(true);

      const url = buildWebhookUrl("conciliar_cartao");

      const resp = await fetchSeguro(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

         const retorno = Array.isArray(resp) ? resp[0] : resp;

const novoImportacaoId =
  retorno?.importacao_id ||
  retorno?.id ||
  retorno?.data?.importacao_id ||
  retorno?.retorno?.importacao_id ||
  retorno?.data?.[0]?.ff_importar_cartao_transacoes?.importacao_id;

if (!novoImportacaoId) {
  console.log("RETORNO SALVAR:", resp);
  throw new Error("Importação salva, mas o webhook não retornou importacao_id.");
}
console.log("IMPORTACAO_ID STATE:", novoImportacaoId);
setImportacaoId(Number(novoImportacaoId));
setStatusEtapa("conciliar");
    } catch (err) {
      alert(err.message || "Erro ao salvar importação.");
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

    alert("Fatura conciliada com sucesso!");
    console.log("RETORNO CONCILIAR:", resp);

   limpar();
  } catch (err) {
    alert(err.message || "Erro ao conciliar importação.");
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




   return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200 px-4 py-4">
    <div className="mx-auto w-full max-w-[1700px] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">

      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-wide text-white">
              💳 Central de Importação de Cartões
            </h2>
            <p className="text-sm text-sky-100 font-semibold mt-1">
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

        {abaAtiva === "lancamentos" && (
          <div className="mt-5 grid grid-cols-[520px_220px_1fr] gap-4 items-end">
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

                <div className="w-full max-w-[420px] rounded-2xl bg-white border-2 border-cyan-200 px-4 py-3 shadow-lg">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-black text-slate-900">
                        {cartaoSelecionado?.nome || `Cartão ${cartaoSelecionado?.id || ""}`}
                      </div>

                      <div className="text-sm font-bold text-slate-500">
                        Final {String(cartaoSelecionado?.numero || "").slice(-4)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400">
                        Disponível
                      </div>
                      <div className="text-base font-black text-emerald-700">
                        {formatarMoeda(cartaoSelecionado?.limite_disponivel)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl bg-slate-100 px-3 py-2">
                      <div className="text-slate-500 font-bold">Limite</div>
                      <div className="text-slate-900 font-black">
                        {formatarMoeda(cartaoSelecionado?.limite_total)}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-100 px-3 py-2">
                      <div className="text-slate-500 font-bold">Fecha</div>
                      <div className="text-slate-900 font-black">
                        Dia {cartaoSelecionado?.fechamento_dia || "-"}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-100 px-3 py-2">
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

        {abaAtiva === "lancamentos" && resumo && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-sm font-black shadow-sm">
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

        {abaAtiva === "lancamentos" && validacaoPDF && (
          <div
            className={`mb-4 px-4 py-3 rounded-2xl text-sm font-black shadow-sm border ${
              validacaoPDF.ok
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            {validacaoPDF.ok ? "✅" : "⛔"} {validacaoPDF.mensagem}
          </div>
        )}

        {abaAtiva === "lancamentos" && (
          <div className="max-h-[580px] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow">
           <div className="sticky top-0 grid grid-cols-[110px_1.8fr_220px_120px_160px_150px] gap-5 text-sm py-3 px-4 border-b border-slate-200 bg-slate-900 text-white z-10">
              <div className="text-left font-black">Data</div>
              <div className="text-left font-black">Estabelecimento</div>
              <div className="text-left font-black">Portador</div>
              <div className="text-center font-black">Parcela</div>
              <div className="text-right font-black">Valor</div>
              <div className="text-center font-black">Tipo</div>
            </div>

            {linhas.map((l) => (
              <div
                key={l.linha}
                className="grid grid-cols-[110px_1.8fr_220px_120px_160px_150px] gap-5 text-sm border-b border-slate-100 py-2 px-4 hover:bg-sky-50"
              >
                <div className="font-semibold text-slate-700">
                  {String(l.data || "").includes("-")
                    ? l.data.split("-").reverse().join("/")
                    : l.data}
                </div>

                <div className="truncate font-bold text-slate-800">
                  {l.estabelecimento}
                </div>

                <div className="truncate text-slate-500 font-semibold">
                  {l.portador || "-"}
                </div>

                <div className="text-center font-semibold text-slate-600">
                  {l.parcela || "-"}
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
                    className={`px-3 py-1 rounded-full text-xs font-black ${
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
        )}

         {abaAtiva === "lancamentos" && (
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