import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { useRef } from "react";
import { fetchSeguro } from "../utils/apiSafe";
import ModalBase from "../components/ModalBase";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
import FormContaContabilModal from "../components/forms/FormContaContabilModal";
import * as XLSX from "xlsx";
 
export default function LancamentoLivroCaixa() {
  const [contasFiltradasContra, setContasFiltradasContra] = useState([]);
  const [conta, setConta] = useState("");
  const [saldo, setSaldo] = useState(0);
   const empresa_id = localStorage.getItem("empresa_id");
 const [contas, setContas] = useState([]);
 const [contasFiltradas, setContasFiltradas] = useState([]);
  const [linhas, setLinhas] = useState([]); 
  const [indiceSelecionado, setIndiceSelecionado] = useState(-1);
const [contaId, setContaId] = useState(null);
const historicoRef = useRef(null);
const [carregandoSaldo, setCarregandoSaldo] = useState(false); 
const [modalContaAberto, setModalContaAberto] = useState(false);
const [mostrarNovaLinha, setMostrarNovaLinha] = useState(true);
const [indiceContaObs, setIndiceContaObs] = useState(-1);
const [importacao, setImportacao] = useState(0);
const [saldoBase, setSaldoBase] = useState(0); 
const [editandoId, setEditandoId] = useState(null);
 const dataMin = hojeMaisDias(-180);
const [resumoImportacao, setResumoImportacao] = useState(null);
//nova conta modelo inteligente 
const [linhaContaNova, setLinhaContaNova] = useState(null);
const [linhaDropdownAberta, setLinhaDropdownAberta] = useState(null);
const inputOfxRef = useRef(null);
const [abaAtiva, setAbaAtiva] = useState("lancamentos");
 
 const [modoImportacao, setModoImportacao] = useState("contabil");
const modoCartao = modoImportacao === "cartao";

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

function normalizarValor(valor) {
  return parseFloat(String(valor || "0").replace(",", ".")) || 0;
}

function recalcularLinhas(lista, base = saldoBase) {
  let acumulado = Number(base || 0);

  const listaComSaldo = lista.map((l) => {
    const valor = normalizarValor(l.valor);

    if (l.tipo === "entrada") acumulado += valor;
    if (l.tipo === "saida") acumulado -= valor;

    return {
      ...l,
      saldo: acumulado
    };
  });

  setLinhas(listaComSaldo);
  setSaldo(acumulado);

  return listaComSaldo;
}

  function hojeISO() {
  return new Date().toISOString().slice(0,10);
}

 const [nova, setNova] = useState({
  data: hojeLocal(),
  historico: "",
  tipo: "entrada",
  valor: "",
  contra: ""
});

const dataRef = useRef(null);
 
const tipoRef = useRef(null);
const valorRef = useRef(null);
const contraRef = useRef(null);


const navigate = useNavigate();

 function adicionarLinha() {
  // se a linha nova estiver fechada, apenas abre
  if (!mostrarNovaLinha) {
    limparNova();
    setMostrarNovaLinha(true);
    setEditandoId(null);  
    setTimeout(() => {
      dataRef.current?.focus();
    }, 0);

    return;
  }

  // daqui pra baixo = realmente adicionar/salvar a linha digitada
  if (!nova.historico || !nova.valor || !nova.conta_id) {
    alert("Preencha histórico, valor e conta contra.");
    return;
  }

  const linha = {
    ...nova,
    _id: nova._id || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    valor: String(nova.valor).replace(",", "."),
    conta_id: Number(nova.conta_id)
  };

  let lista;

  if (editandoId) {
    lista = linhas.map((l) => (l._id === editandoId ? linha : l));
  } else {
    lista = [...linhas, linha];
  }

  recalcularLinhas(lista);

  limparNova();
  setEditandoId(null);

  setTimeout(() => {
    historicoRef.current?.focus();
  }, 0);
}
  async function carregarContas() {
    const r = await fetch(
      buildWebhookUrl("contas_contabeis_lancaveis", { empresa_id })
    );
    const j = await r.json();
    setContas(j || []);
  }
  
  useEffect(() => {
    carregarContas();
  }, [empresa_id]);
  

    function filtrarContas(texto) {

    const t = texto.toLowerCase();

    const filtradas = contas.filter(c =>
        c.nome.toLowerCase().includes(t) ||
        c.codigo.includes(t) ||
        (c.apelido && c.apelido.includes(t))
    );

    setContasFiltradas(filtradas.slice(0,10));
    }

 
    function editarLinha(id) {
  const linha = linhas.find((l) => l._id === id);
  if (!linha) return;

  setNova({
    data: linha.data || hojeLocal(),
    historico: linha.historico || "",
    tipo: linha.tipo || "entrada",
    valor: String(linha.valor || "").replace(".", ","),
    contra: linha.contra || "",
    conta_id: linha.conta_id || null,
    _id: linha._id
  });

  setEditandoId(id);

  setTimeout(() => {
    historicoRef.current?.focus();
  }, 0);
}
 
 
// Rotina salvar definitiva assim espero
 
async function salvarLancamentos() {
 
  if (editandoId !== null && nova._id === editandoId) {
  alert("Confirme a edição da linha antes de salvar.");
  return;

  const contaIgual = linhasParaSalvar.findIndex(
  (l) => Number(l.conta_id) === Number(contaId)
);

if (contaIgual !== -1) {
  alert(`Linha ${contaIgual + 1}: a conta contra não pode ser igual à conta observada.`);
  return;
}
}

  if (!contaId) {
    alert("Conta observada não selecionada");
    return;
  }
 
  let linhasParaSalvar = [...linhas];

 if (nova.historico || nova.valor) {

 let valor = parseFloat(nova.valor || 0);

  let novoSaldo = saldo;

  if (nova.tipo === "entrada") novoSaldo += valor;
if (nova.tipo === "saida") novoSaldo -= valor;

  linhasParaSalvar.push({
    ...nova,
    saldo: novoSaldo
  });
}

  if (linhasParaSalvar.length === 0) {
    alert("Nenhuma linha para salvar");
    return;
  }

 const lancamentos = linhasParaSalvar.map(l => ({
  data: l.data,
  historico: l.historico,
  valor: parseFloat((l.valor || "0").replace(",", ".")),
  tipo: l.tipo,
  conta_contra: Number(l.conta_id)
}));


 console.log("LANCAMENTOS:", lancamentos);
  const index = lancamentos.findIndex(l =>
  !l.data ||
  !l.historico ||
  !l.valor ||
  l.valor <= 0 ||
  !l.tipo ||
  !l.conta_contra || l.conta_contra <= 0
);

if (index !== -1) {
  alert(`⚠️ Linha ${index + 1} inválida.`);
  return;
}

  const payload = {
    empresa_id,
    conta_observada: contaId,
     importacao,
    lancamentos: JSON.parse(prepararLancamentosJSONB(lancamentos))
  };

  const url = buildWebhookUrl("lote_lancamentos");

  try {

    await fetchSeguro(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    alert("Lançamentos salvos!");
    setLinhas([]);

setConta("");
setContaId(null);
setSaldo(0);

 setNova({
  data: hojeLocal(),
  historico: "",
  tipo: "entrada",
  valor: "",
  contra: ""
});

historicoRef.current?.focus();

  } catch (err) {

    console.error("ERRO CAPTURADO:", err.message);

    alert(
      err.message ||
      "Erro inesperado ao salvar os lançamentos."
    );

  }
}



async function classificarLinhasPorRegras(lista) {
  if (!lista.length) return lista;

  try {
    const resp = await fetch(buildWebhookUrl("classificar_historicos_lote"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
       linhas: lista.map((l) => ({
        _id: l._id,
        historico: l.historico,
        //tipo: modoCartao ? "entrada" : l.tipo,
       tipo: modoCartao ? "entrada" : l.tipo,
        
      })),
      }),
    });

    const json = await resp.json();
    const bruto = Array.isArray(json) ? json[0] : json;

    const resultado =
      bruto?.data?.resultado ||
      bruto?.resultado ||
      bruto?.data?.ff_classificar_historicos_lote ||
      bruto?.ff_classificar_historicos_lote ||
      bruto?.data ||
      bruto;

    const classificadas = resultado?.linhas || [];

    return lista.map((linha) => {
      const achada = classificadas.find((x) => x._id === linha._id);

      if (!achada?.encontrado) return linha;

      return {
        ...linha,
        contra: `${achada.conta_codigo} - ${achada.conta_nome}`,
        conta_id: Number(achada.conta_id),
        regra_id: achada.regra_id,
      };
    });
  } catch (e) {
    console.error("Erro ao classificar linhas:", e);
    return lista;
  }
}




  
// fim da rotina salvar  

function gerarLinhaId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function prepararLancamentosJSONB(lancamentos) {
  try {

    // se já for array ou objeto
    if (typeof lancamentos === "object") {
      return JSON.stringify(lancamentos);
    }

    // se vier string
    if (typeof lancamentos === "string") {

      let txt = lancamentos.trim();

      // remove aspas externas
      if (
        (txt.startsWith("'") && txt.endsWith("'")) ||
        (txt.startsWith('"') && txt.endsWith('"'))
      ) {
        txt = txt.slice(1, -1);
      }

      // remove escape duplicado
      txt = txt.replace(/\\"/g, '"');

      // tenta converter
      const obj = JSON.parse(txt);

      return JSON.stringify(obj);
    }

    throw new Error("Formato inválido de lancamentos");

  } catch (e) {
    console.error("Erro preparando JSON:", e);
    throw new Error("Lancamentos JSON inválido");
  }
}

 async function carregarSaldoConta(conta_id) {

  if (!conta_id) return;

  try {

    setCarregandoSaldo(true);

    const data = await fetchSeguro(
      buildWebhookUrl("saldoconta"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: empresa_id,
          conta_id: conta_id
        })
      }
    );

 const saldoConta = Number(data.data.ff_saldo_conta || 0);
setSaldoBase(saldoConta);
setSaldo(saldoConta);
setLinhas([]);
 
limparNova();

  } catch (err) {

    console.error("Erro ao buscar saldo:", err.message);

    alert(err.message || "Erro ao carregar saldo da conta");

  } finally {

    setCarregandoSaldo(false);

  }
}

function filtrarContasContra(texto) {

  const t = texto.toLowerCase();

  const filtradas = contas.filter(c =>
    c.nome.toLowerCase().includes(t) ||
    c.codigo.includes(t) ||
    (c.apelido && c.apelido.includes(t))
  );

  setContasFiltradasContra(filtradas.slice(0,10));
}

 const valorAtual = parseFloat((nova.valor || "0").replace(",", "."));

let saldoLinhaAtual = saldo;

if (!isNaN(valorAtual)) {
  if (nova.tipo === "entrada") saldoLinhaAtual = saldo + valorAtual;
  if (nova.tipo === "saida") saldoLinhaAtual = saldo - valorAtual;
}

 function removerLinha(id) {
  const novaLista = linhas.filter((l) => l._id !== id);

  if (editandoId === id) {
    setEditandoId(null);
    setNova({
      data: hojeLocal(),
      historico: "",
      tipo: "entrada",
      valor: "",
      contra: "",
      conta_id: null,
      _id: null
    });
  }

  recalcularLinhas(novaLista);
}

 function handleEnter(nextRef) {
  return (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };
}


 function limparNova() {
  setNova({
    data: hojeLocal(),
    historico: "",
    tipo: "entrada",
    valor: "",
    contra: "",
    conta_id: null,
    _id: null
  });
}

function cancelarNovaLinha() {
  limparNova();
  setMostrarNovaLinha(false);
  setEditandoId(null);  
  setContasFiltradasContra([]);
  setIndiceSelecionado(-1);
}
 
{/*}
 function dataBRparaISO(data) {
  const txt = String(data || "").trim();
  const m = txt.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return txt;
}
*/}

function dataImportadaParaISO(valor) {
  const txt = String(valor || "").trim();

  if (!txt) {
    throw new Error(
      "A coluna DATA está vazia. Corrija a planilha e formate a data como DD/MM/AAAA."
    );
  }

  // já veio ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(txt)) return txt;

  const m = txt.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!m) {
    throw new Error(
      `Data inválida encontrada: "${txt}". O Excel está enviando a data em formato incorreto. Formate a coluna DATA como DD/MM/AAAA no Excel ou Google Sheets.`
    );
  }

  let p1 = Number(m[1]);
  let p2 = Number(m[2]);
  const ano = Number(m[3]);

  let dia;
  let mes;

  // DD/MM/YYYY
  if (p1 > 12 && p2 <= 12) {
    dia = p1;
    mes = p2;
  }
  // MM/DD/YYYY
  else if (p2 > 12 && p1 <= 12) {
    mes = p1;
    dia = p2;
  }
  // Ambíguo: 05/11/2026 -> assume padrão brasileiro
  else {
    dia = p1;
    mes = p2;
  }

  const dataTeste = new Date(ano, mes - 1, dia);

  const dataValida =
    dataTeste.getFullYear() === ano &&
    dataTeste.getMonth() === mes - 1 &&
    dataTeste.getDate() === dia;

  if (!dataValida) {
    throw new Error(
      `Data inválida encontrada: "${txt}". Corrija a coluna DATA no Excel para DD/MM/AAAA.`
    );
  }

  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}



function normalizarCodigoConta(txt) {
  return String(txt || "").trim().replace(/\s+/g, "");
}



 function extrairColunasLinha(linha) {
  const txt = String(linha || "");

  if (txt.includes("\t")) {
    return txt.split("\t").map(v => String(v || "").trim());
  }

  if (txt.includes(";")) {
    return txt.split(";").map(v => String(v || "").trim());
  }

  return txt.split(/\s{2,}/).map(v => String(v || "").trim());
}
  

function tipoPorModo(valorOriginal) {
  if (modoCartao) {
    return valorOriginal >= 0 ? "saida" : "entrada";
  }

  return valorOriginal >= 0 ? "entrada" : "saida";
}


function parseTextoParaLinhas(texto) {
  const linhasTexto = String(texto || "")
    .replace(/\r/g, "")
    .split("\n")
    .filter(l => String(l || "").trim() !== "");

  const resultado = [];
  let atual = null;

  for (const linhaOriginal of linhasTexto) {
    const linha = String(linhaOriginal || "");
    const lower = linha.toLowerCase();

    if (lower.includes("data") && lower.includes("hist")) continue;

    const colunas = extrairColunasLinha(linha);

    const data = String(colunas[0] || "").trim();
    const historico = String(colunas[1] || "").trim();
    const codigoConta = String(colunas[2] || "").trim();
    const valorTexto = String(colunas[3] || "").trim();

    const temData = data !== "";

    const temValor = valorTexto !== "";

    // nova linha válida
    if (temData && temValor) {
     const valorOriginal = parseNumeroBR(valorTexto);
const contaEncontrada = resolverContaPorCodigo(codigoConta);

      atual = {
        _id: gerarLinhaId(),
        data: dataImportadaParaISO(data),
        historico: historico,
       tipo: tipoPorModo(valorOriginal),
valor: Math.abs(valorOriginal).toFixed(2).replace(".", ","),
        contra: contaEncontrada
          ? `${contaEncontrada.codigo} - ${contaEncontrada.nome}`
          : codigoConta,
        conta_id: contaEncontrada ? Number(contaEncontrada.id) : null
      };

      resultado.push(atual);
      continue;
    }

    // continuação do histórico quebrado pelo banco
    if (!temData && !temValor && atual) {
      const textoExtra = colunas
        .map(c => String(c || "").trim())
        .filter(Boolean)
        .join(" ");

      if (textoExtra) {
        atual.historico = `${atual.historico} ${textoExtra}`
          .replace(/\s+/g, " ")
          .trim();
      }
    }
  }

  return resultado;
}


function codigoContaChave(txt) {
  return String(txt || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^\d.]/g, "");
}

function resolverContaPorCodigo(codigoImportado) {
  const alvo = codigoContaChave(codigoImportado);
  if (!alvo) return null;

  // 1) tenta exata
  const exata = contas.find(
    (c) => codigoContaChave(c.codigo) === alvo
  );
  if (exata) return exata;

  // 2) tenta por prefixo
  const candidatas = contas.filter((c) =>
    codigoContaChave(c.codigo).startsWith(alvo)
  );

  if (candidatas.length === 1) return candidatas[0];

  // 3) se tiver várias, tenta a menor/mais próxima
  if (candidatas.length > 1) {
    candidatas.sort(
      (a, b) =>
        codigoContaChave(a.codigo).length - codigoContaChave(b.codigo).length
    );
    return candidatas[0];
  }

  return null;
}
 

function parseNumeroBR(valor) {
  if (valor == null || valor === "") return 0;

  if (typeof valor === "number") return valor;

  let txt = String(valor).trim().toUpperCase();

  const temCredito = /\bC\b$/.test(txt);
  const temDebito = /\bD\b$/.test(txt);

  txt = txt
    .replace(/R\$/g, "")
    .replace(/\s+/g, "")
    .replace(/[CD]$/g, "");

  let negativo = txt.startsWith("-") || temDebito;
  txt = txt.replace(/^-+/, "");

  const temVirgula = txt.includes(",");
  const temPonto = txt.includes(".");

  if (temVirgula && temPonto) {
    const ultimaVirgula = txt.lastIndexOf(",");
    const ultimoPonto = txt.lastIndexOf(".");

    if (ultimaVirgula > ultimoPonto) {
      // BR: 1.500,25
      txt = txt.replace(/\./g, "").replace(",", ".");
    } else {
      // US: 1,500.25
      txt = txt.replace(/,/g, "");
    }
  } else if (temVirgula) {
    // BR: 300,25
    txt = txt.replace(",", ".");
  } else if (temPonto) {
    // US decimal: 300.25
    // ou milhar: 1.500
    const partes = txt.split(".");
    const ultima = partes[partes.length - 1];

    if (partes.length > 1 && ultima.length === 3) {
      txt = txt.replace(/\./g, "");
    }
  }

  txt = txt.replace(/[^\d.]/g, "");

  let numero = Number(txt) || 0;

  if (negativo) numero = -Math.abs(numero);
  if (temCredito) numero = Math.abs(numero);

  return numero;
}

async function importarArquivoExcel(e) {
 
     const file = e.target.files?.[0];

  if (!file) return;

  if (!contaId) {
    alert("Informe a conta observada antes de importar.");
    e.target.value = "";
    return;
  }

  try {
    const nome = file.name || "";
    const ext = nome.split(".").pop().toLowerCase();
    const buffer = await file.arrayBuffer();

    let texto = "";

    if (["xlsx", "xls"].includes(ext)) {
    
      const workbook = XLSX.read(buffer, {
  type: "array",
  cellDates: true,
  dateNF: "dd/mm/yyyy",
});

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

       const linhasArray = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
          raw: false,
          dateNF: "dd/mm/yyyy",
        });

      texto = linhasArray
        .map((linha) => linha.map((c) => String(c || "").trim()).join("\t"))
        .join("\n");
    } else {
      texto = new TextDecoder("utf-8").decode(buffer);
    }

     let novasLinhas = parseTextoParaLinhas(texto).map((l) => ({
  ...l,
  tipo: l.tipo,
  valor: Math.abs(parseNumeroBR(l.valor)).toFixed(2).replace(".", ","),
}));

    if (!novasLinhas.length) {
      console.log("ARQUIVO IMPORTADO:", texto);
      alert("Nenhuma linha válida encontrada no arquivo.");
      return;
    }

    let totalEntrada = 0;
    let totalSaida = 0;

    novasLinhas.forEach((l) => {
      const v = Math.abs(parseNumeroBR(l.valor));

      if (l.tipo === "entrada") totalEntrada += v;
      else totalSaida += v;
    });

    setResumoImportacao({
      qtd: novasLinhas.length,
      entrada: totalEntrada,
      saida: totalSaida,
    });

   const novasClassificadas = (await classificarLinhasPorRegras(novasLinhas)).map((l) => ({
  ...l,
   tipo: l.tipo
}));

recalcularLinhas([...linhas, ...novasClassificadas]);

    setImportacao(1);

  
   const semConta = novasClassificadas.filter((l) => !l.conta_id).length;

    if (semConta > 0) {
      alert(
        `Importadas ${novasLinhas.length} linhas. ${semConta} ficaram sem conta contra e precisam de ajuste.`
      );
    }

    e.target.value = "";
  } catch (erro) {
    console.error("Erro ao importar arquivo:", erro);
     alert(erro.message || "Erro ao importar arquivo.");
  }
}

async function colarLancamentos() {
  try {
    const texto = await navigator.clipboard.readText();

    if (!texto || !texto.trim()) {
      alert("A área de transferência está vazia.");
      return;
    }
 
 const novasLinhas = parseTextoParaLinhas(texto).map((l) => ({
  ...l,
  tipo: tipoPorModo(parseNumeroBR(l.valor)),
  valor: Math.abs(parseNumeroBR(l.valor)).toFixed(2).replace(".", ","),
}));


 let totalEntrada = 0;
let totalSaida = 0;

novasLinhas.forEach(l => {
  const v = Math.abs(parseNumeroBR(l.valor));

  if (l.tipo === "entrada") {
    totalEntrada += v;
  } else {
    totalSaida += v;
  }
});

setResumoImportacao({
  qtd: novasLinhas.length,
  entrada: totalEntrada,
  saida: totalSaida
});

    if (!novasLinhas.length) {
      console.log("TEXTO COLADO:", texto);
      alert("Nenhuma linha válida encontrada. Veja o console.");
      return;
    }

    recalcularLinhas([...linhas, ...novasLinhas]);
      setImportacao(1);
    const semConta = novasLinhas.filter(l => !l.conta_id).length;
    if (semConta > 0) {
      alert(
        `Importadas ${novasLinhas.length} linhas. ${semConta} ficaram sem conta contra encontrada e precisam de ajuste antes de salvar.`
      );
    }
  } catch (erro) {
    console.error("Erro ao colar:", erro);
    alert("Não foi possível ler a área de transferência.");
  }
}

function limparEdicao() {
  setLinhas([]);
  setSaldo(saldoBase);
   setImportacao(0);
  setEditandoId(null);
  setMostrarNovaLinha(true);

  setContasFiltradasContra([]);
  setIndiceSelecionado(-1);

  limparNova();

  setTimeout(() => {
    dataRef.current?.focus();
  }, 0);
}

function abrirNovaContaParaLinha(linha) {
  setLinhaContaNova(linha);
  setModalContaAberto(true);
}

 function tipoPorModo(valorNumero) {
  if (modoCartao) {
    return valorNumero >= 0 ? "saida" : "entrada";
  }

  return valorNumero >= 0 ? "entrada" : "saida";
}

function exportarLayout() {
  const dados = [
    ["Data", "Histórico", "Conta", "Valor"],
    ["24/04/2026", "PIX RECEBIDO - OUTRA IF", "1.1.1.01", "251,00 C"],
    ["27/04/2026", "PIX EMITIDO OUTRA IF - CEF", "2.1.1.01", "-6.300,00 D"],
    ["29/04/2026", "DEP.DINHEIRO", "", "500,00 C"],
  ];

  const ws = XLSX.utils.aoa_to_sheet(dados);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Layout");

  XLSX.writeFile(wb, "layout_importacao_lancamentos.xlsx");
}
 
return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200 px-4 py-4">
    <div className="mx-auto w-full max-w-[1700px] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">

      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-wide text-white">
              📘 Lançamento Contábil Inteligente
            </h2>
            <p className="text-sm text-sky-100 font-semibold mt-1">
              Lance, cole ou importe movimentos contábeis com classificação inteligente.
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
              🧾 Lançamentos
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
          <div className="mt-5 grid grid-cols-[1fr_220px_220px] gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-white">
                Conta observada
              </label>

              <div className="relative">
                <input
                  className="h-10 w-full rounded-xl border border-sky-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-300"
                  placeholder="Digite conta (ex: banco, caixa, 1.1...)"
                  value={conta}
                  disabled={linhas.length > 0}
                  onChange={(e) => {
                    const v = e.target.value;
                    setConta(v);
                    filtrarContas(v);
                    setIndiceContaObs(-1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setIndiceContaObs((i) =>
                        Math.min(i + 1, contasFiltradas.length - 1)
                      );
                    }

                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setIndiceContaObs((i) => Math.max(i - 1, 0));
                    }

                    if (e.key === "Enter") {
                      e.preventDefault();

                      if (indiceContaObs >= 0) {
                        const c = contasFiltradas[indiceContaObs];

                        setConta(c.nome);
                        setContaId(c.id);
                        setContasFiltradas([]);

                        carregarSaldoConta(c.id);
                      }

                      setTimeout(() => {
                        dataRef.current?.focus();
                      }, 0);
                    }
                  }}
                />

                {contasFiltradas.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border rounded-xl shadow max-h-60 overflow-y-auto z-50">
                    {contasFiltradas.map((c, i) => (
                      <div
                        key={c.id}
                        className={`p-2 cursor-pointer text-sm font-semibold ${
                          i === indiceContaObs
                            ? "bg-cyan-100 text-slate-900"
                            : "hover:bg-sky-50"
                        }`}
                        onClick={() => {
                          setConta(c.nome);
                          setContaId(c.id);
                          setContasFiltradas([]);
                          carregarSaldoConta(c.id);
                        }}
                      >
                        {c.codigo} - {c.nome}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-white">
                Modo
              </label>

              <select
                value={modoImportacao}
                onChange={(e) => setModoImportacao(e.target.value)}
                disabled={linhas.length > 0}
                className="h-10 rounded-xl border border-sky-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-300"
              >
                <option value="contabil">📘 Contábil normal</option>
                <option value="cartao">💳 Fatura cartão</option>
              </select>
            </div>

            <div className="text-right justify-self-end">
              <div className="text-sm font-bold text-sky-100">
                Saldo atual
              </div>

              <div
                className={`text-2xl font-black ${
                  saldo > 0
                    ? "text-green-300"
                    : saldo < 0
                    ? "text-red-300"
                    : "text-slate-200"
                }`}
              >
                {carregandoSaldo
                  ? "Carregando..."
                  : saldo.toLocaleString("pt-BR", {
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
              📄 Layout esperado da planilha
            </h3>

            <p className="text-sm text-slate-600 mb-4 font-semibold">
              A planilha deve conter as colunas abaixo. Use este modelo para importar
              lançamentos no Livro Caixa / Lançamento Inteligente.
            </p>

            <table className="w-full text-sm border border-slate-200 overflow-hidden rounded-xl">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-2 border border-slate-700">Data</th>
                  <th className="p-2 border border-slate-700">Histórico</th>
                  <th className="p-2 border border-slate-700">Conta</th>
                  <th className="p-2 border border-slate-700">Valor</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="p-2 border">24/04/2026</td>
                  <td className="p-2 border font-semibold">PIX RECEBIDO - OUTRA IF</td>
                  <td className="p-2 border">1.1.1.01</td>
                  <td className="p-2 border text-green-700 font-black">251,00 C</td>
                </tr>

                <tr className="bg-slate-50">
                  <td className="p-2 border">27/04/2026</td>
                  <td className="p-2 border font-semibold">PIX EMITIDO OUTRA IF - CEF</td>
                  <td className="p-2 border">2.1.1.01</td>
                  <td className="p-2 border text-red-700 font-black">-6.300,00 D</td>
                </tr>

                <tr>
                  <td className="p-2 border">29/04/2026</td>
                  <td className="p-2 border font-semibold">DEP.DINHEIRO</td>
                  <td className="p-2 border"></td>
                  <td className="p-2 border text-green-700 font-black">500,00 C</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 space-y-1 font-semibold">
              <p className="font-black text-slate-900">Regras:</p>
              <p>• Data deve estar no formato DD/MM/AAAA.</p>
              <p>• Histórico é obrigatório.</p>
              <p>• Conta pode ser código contábil ou ficar em branco para classificação automática.</p>
              <p>• Valor positivo ou com C será tratado como entrada.</p>
              <p>• Valor negativo ou com D será tratado como saída.</p>
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

        {abaAtiva === "lancamentos" && resumoImportacao && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-sm font-black shadow-sm">
            ✔ {resumoImportacao.qtd} registros importados | Entradas:{" "}
            {resumoImportacao.entrada.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}{" "}
            | Saídas:{" "}
            {resumoImportacao.saida.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        )}

        {abaAtiva === "lancamentos" && (
          <div className="max-h-[680px] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow">
            <div className="sticky top-0 z-20 grid grid-cols-[120px_1.6fr_130px_140px_360px_150px_90px] gap-3 text-sm py-3 px-4 border-b border-slate-200 bg-slate-900 text-white">
              <div className="font-black">Data</div>
              <div className="font-black">Histórico</div>
              <div className="text-center font-black">Tipo</div>
              <div className="text-right font-black">Valor</div>
              <div className="font-black">Contra Conta</div>
              <div className="text-right font-black">Saldo</div>
              <div className="text-center font-black">Ação</div>
            </div>

            {linhas.map((l) => (
              <div
                key={l._id}
                className="grid grid-cols-[120px_1.6fr_130px_140px_360px_150px_90px] gap-3 text-sm border-b border-slate-100 py-2 px-4 hover:bg-sky-50"
              >
                <div className="font-semibold text-slate-700">
                  {String(l.data || "").includes("-")
                    ? l.data.split("-").reverse().join("/")
                    : l.data}
                </div>

                <div className="truncate font-bold text-slate-800">
                  {l.historico}
                </div>

                <div className="text-center">
                  {l.tipo === "entrada" ? (
                    <span className="inline-block min-w-[82px] px-3 py-1 rounded-full bg-green-100 text-green-700 font-black text-xs">
                      Entrada
                    </span>
                  ) : (
                    <span className="inline-block min-w-[82px] px-3 py-1 rounded-full bg-red-100 text-red-700 font-black text-xs">
                      Saída
                    </span>
                  )}
                </div>

                <div
                  className={`text-right font-mono font-black ${
                    l.tipo === "entrada" ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {normalizarValor(l.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>

                <div className="relative">
                  <input
                    className={`h-9 rounded-xl border px-3 w-full text-sm font-semibold outline-none ${
                      !l.conta_id
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-white border-slate-200 text-slate-700"
                    }`}
                    value={l.contra || ""}
                    placeholder="Conta contra"
                    onChange={(e) => {
                      const v = e.target.value;

                      setLinhas((prev) =>
                        prev.map((x) =>
                          x._id === l._id
                            ? {
                                ...x,
                                contra: v,
                                conta_id: null,
                              }
                            : x
                        )
                      );

                      filtrarContasContra(v);
                      setIndiceSelecionado(-1);
                      setEditandoId(l._id);
                    }}
                    onFocus={() => {
                      setLinhaDropdownAberta(l._id);
                      filtrarContasContra(l.contra || "");
                    }}
                  />

                  {linhaDropdownAberta === l._id && contasFiltradasContra.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border rounded-xl shadow max-h-64 overflow-y-auto z-[9999]">
                      {contasFiltradasContra.map((c) => (
                        <div
                          key={c.id}
                          className="p-2 cursor-pointer hover:bg-sky-50 text-sm font-semibold"
                          onClick={() => {
                            const listaAtualizada = linhas.map((x) =>
                              x._id === l._id
                                ? {
                                    ...x,
                                    contra: `${c.codigo} - ${c.nome}`,
                                    conta_id: c.id,
                                  }
                                : x
                            );

                            recalcularLinhas(listaAtualizada);
                            setContasFiltradasContra([]);
                            setLinhaDropdownAberta(null);
                          }}
                        >
                          {c.codigo} - {c.nome}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`rounded-xl px-3 py-2 text-right font-black ${
                    Number(l.saldo || 0) >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {Number(l.saldo || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 text-lg"
                    onClick={() => editarLinha(l._id)}
                    title="Editar linha"
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800 text-lg"
                    onClick={() => removerLinha(l._id)}
                    title="Excluir linha"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}

            {mostrarNovaLinha && (
              <div className="sticky bottom-0 z-20 grid grid-cols-[120px_1.6fr_130px_140px_360px_150px_90px] gap-3 border-t border-slate-200 bg-white p-4 shadow-[0_-8px_20px_rgba(15,23,42,0.08)]">
                <input
                  ref={dataRef}
                  type="date"
                  min={dataMin}
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-300"
                  value={nova.data || ""}
                  onChange={(e) => {
                    const valor = e.target.value;

                    if (!valor) {
                      setNova((prev) => ({ ...prev, data: "" }));
                      return;
                    }

                    setNova((prev) => ({ ...prev, data: valor }));
                  }}
                  onBlur={(e) => {
                    const valor = e.target.value;

                    if (valor && valor < dataMin) {
                      alert(`Não pode ser menor que ${dataMin}`);
                      setNova((prev) => ({ ...prev, data: dataMin }));
                    }
                  }}
                  onKeyDown={handleEnter(historicoRef)}
                />

                <input
                  ref={historicoRef}
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-300"
                  placeholder="Histórico"
                  value={nova.historico}
                  onChange={(e) =>
                    setNova((prev) => ({ ...prev, historico: e.target.value }))
                  }
                  onKeyDown={handleEnter(tipoRef)}
                />

                <select
                  ref={tipoRef}
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-300"
                  value={nova.tipo}
                  onChange={(e) =>
                    setNova((prev) => ({ ...prev, tipo: e.target.value }))
                  }
                  onKeyDown={handleEnter(valorRef)}
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>

                <input
                  ref={valorRef}
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-bold text-right outline-none focus:ring-2 focus:ring-cyan-300"
                  placeholder="Valor"
                  value={nova.valor}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\d.,]/g, "");
                    setNova((prev) => ({ ...prev, valor: v }));
                  }}
                  onKeyDown={handleEnter(contraRef)}
                />

                <div className="relative">
                  <input
                    ref={contraRef}
                    className="h-10 rounded-xl border border-slate-200 px-3 w-full text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-300"
                    placeholder="Contra conta"
                    value={nova.contra}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLinhaDropdownAberta("nova");
                      setNova((prev) => ({ ...prev, contra: v }));
                      filtrarContasContra(v);
                      setIndiceSelecionado(-1);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setIndiceSelecionado((i) =>
                          Math.min(i + 1, contasFiltradasContra.length - 1)
                        );
                      }

                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setIndiceSelecionado((i) => Math.max(i - 1, 0));
                      }

                      if (e.key === "Enter") {
                        e.preventDefault();

                        if (indiceSelecionado >= 0) {
                          const c = contasFiltradasContra[indiceSelecionado];

                          setNova({
                            ...nova,
                            contra: c.nome,
                            conta_id: c.id,
                          });

                          setContasFiltradasContra([]);
                          setIndiceSelecionado(-1);

                          return;
                        }

                        adicionarLinha();

                        setTimeout(() => {
                          dataRef.current?.focus();
                        }, 0);
                      }
                    }}
                  />

                  {linhaDropdownAberta === "nova" && contasFiltradasContra.length > 0 && (
                    <div className="absolute bottom-full left-0 w-full bg-white border rounded-xl shadow max-h-64 overflow-y-auto z-[9999]">
                      {contasFiltradasContra.map((c, i) => (
                        <div
                          key={c.id}
                          className={`p-2 cursor-pointer text-sm font-semibold ${
                            i === indiceSelecionado
                              ? "bg-cyan-100"
                              : "hover:bg-sky-50"
                          }`}
                          onClick={() => {
                            if (Number(c.id) === Number(contaId)) {
                              alert("A conta contra não pode ser igual à conta observada.");
                              return;
                            }

                            setNova((prev) => ({
                              ...prev,
                              contra: c.nome,
                              conta_id: c.id,
                            }));
                            setContasFiltradasContra([]);
                            setIndiceSelecionado(-1);
                          }}
                        >
                          {c.codigo} - {c.nome}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  className={`h-10 rounded-xl border px-3 text-right font-black ${
                    saldo > 0
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-red-100 text-red-700 border-red-200"
                  }`}
                  value={saldoLinhaAtual.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                  disabled
                />

                <div className="flex items-center justify-center">
                  <button
                    className="text-gray-400 hover:text-red-600 text-lg"
                    onClick={cancelarNovaLinha}
                  >
                    🗑
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {abaAtiva === "lancamentos" && (
          <div className="mt-5 flex items-center justify-end gap-3 pr-20">
            <button
              onClick={adicionarLinha}
              className="btn-pill btn-dark-black flex items-center gap-2"
            >
              ➕ Linha
            </button>

            <button
              onClick={salvarLancamentos}
              className="btn-pill btn-dark-blue flex items-center gap-2"
            >
              💾 Salvar
            </button>

            <label className="btn-pill btn-green cursor-pointer flex items-center gap-2">
              📥 Importar Excel
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.txt"
                onChange={importarArquivoExcel}
                className="hidden"
              />
            </label>

            <button
              onClick={limparEdicao}
              className="btn-pill btn-gray flex items-center gap-2"
            >
              🗑 Limpar
            </button>

            <button
              onClick={() => navigate("/relatorios/diario")}
              className="btn-pill btn-dark-blue flex items-center gap-2"
            >
              ↩ Sair
            </button>
          </div>
        )}
      </div>
    </div>

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
        contas={contas}
        nomeInicial={linhaContaNova?.historico || ""}
        historicoRegra={linhaContaNova?.historico || ""}
        tipoMovimento={linhaContaNova?.tipo || ""}
        onSuccess={(contaCriada) => {
          setModalContaAberto(false);

          if (linhaContaNova && contaCriada?.id) {
            const listaAtualizada = linhas.map((x) =>
              x._id === linhaContaNova._id
                ? {
                    ...x,
                    contra: `${contaCriada.codigo} - ${contaCriada.nome}`,
                    conta_id: Number(contaCriada.id),
                  }
                : x
            );

            recalcularLinhas(listaAtualizada);
          }

          setLinhaContaNova(null);
          carregarContas();
        }}
        onCancel={() => {
          setModalContaAberto(false);
          setLinhaContaNova(null);
        }}
      />
    </ModalBase>
  </div>
);
}