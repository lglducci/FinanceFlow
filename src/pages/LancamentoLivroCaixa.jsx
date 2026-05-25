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
          tipo: l.tipo,
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
 
 function dataBRparaISO(data) {
  const txt = String(data || "").trim();
  const m = txt.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return txt;
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

    const temData = /^\d{2}\/\d{2}\/\d{4}$/.test(data);
    const temValor = valorTexto !== "";

    // nova linha válida
    if (temData && temValor) {
      const valorNumero = parseNumeroBR(valorTexto);
      const contaEncontrada = resolverContaPorCodigo(codigoConta);

      atual = {
        _id: gerarLinhaId(),
        data: dataBRparaISO(data),
        historico: historico,
        tipo: valorNumero >= 0 ? "entrada" : "saida",
        valor: Math.abs(valorNumero).toFixed(2).replace(".", ","),
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
  if (valor == null) return 0;

  let txt = String(valor)
    .trim()
    .toUpperCase();

  const temCredito = /\bC\b$/.test(txt);
  const temDebito = /\bD\b$/.test(txt);

  txt = txt
    .replace(/R\$/g, "")
    .replace(/\s+/g, "")
    .replace(/[CD]$/g, "");

  let negativo = false;

  if (txt.startsWith("-")) {
    negativo = true;
    txt = txt.replace(/^-+/, "");
  }

  txt = txt
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  let numero = Number(txt) || 0;

  if (temDebito || negativo) numero = -Math.abs(numero);
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
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const linhasArray = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
        raw: false,
      });

      texto = linhasArray
        .map((linha) => linha.map((c) => String(c || "").trim()).join("\t"))
        .join("\n");
    } else {
      texto = new TextDecoder("utf-8").decode(buffer);
    }

    const novasLinhas = parseTextoParaLinhas(texto);

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

    const novasClassificadas = await classificarLinhasPorRegras(novasLinhas);

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
    alert("Erro ao importar arquivo.");
  }
}

async function colarLancamentos() {
  try {
    const texto = await navigator.clipboard.readText();

    if (!texto || !texto.trim()) {
      alert("A área de transferência está vazia.");
      return;
    }

    const novasLinhas = parseTextoParaLinhas(texto);

 
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

return (
      <div className="flex justify-center bg-gray-100 min-h-screen  pb-3">

      <div className="bg-white rounded-2xl border border-gray-300 w-[1400px] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="bg-gray-650 rounded-lg p-3"> 
        <div className="bg-gray-600 border-b rounded-t-xl p-4"> 
       <div className="bg-gray-600 border-b rounded-t-xl p-4">  
        {/* TÍTULO */}
        <h2 className="text-lg font-semibold tracking-wide mb-4 text-gray-50">
          ⚡ Lançamento Contábil Inteligente  
        </h2>

        {/* CONTA + SALDO */}
        <div className="grid grid-cols-[1fr_200px] gap-6 items-end">

          {/* CONTA */}
          <div className="flex flex-col gap-1">

            <label className="text-sm font-semibold text-gray-50">
              Conta observada
            </label>

     
      <div className="relative">

                    <input
                    className="w-full border rounded-lg p-1"
                    placeholder="Digite conta (ex: banco, caixa, 1.1...)"
                    value={conta}
                    disabled={linhas.length > 0}
                    onChange={(e)=>{
                        const v = e.target.value;
                        setConta(v);
                        filtrarContas(v);
                        setIndiceContaObs(-1);
                        
                    }}
                   
                  onKeyDown={(e)=>{

                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setIndiceContaObs(i =>
                              Math.min(i + 1, contasFiltradas.length - 1)
                            );
                          }

                          if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setIndiceContaObs(i =>
                              Math.max(i - 1, 0)
                            );
                          }

                          if (e.key === "Enter") {
                            e.preventDefault();

                            // 👉 se está navegando na lista
                            if (indiceContaObs >= 0) {
                              const c = contasFiltradas[indiceContaObs];

                              setConta(c.nome);
                              setContaId(c.id);
                              setContasFiltradas([]);

                              carregarSaldoConta(c.id);
                            }

                            // 👉 independente de ter selecionado ou não → vai pro DATA
                            setTimeout(() => {
                              dataRef.current?.focus();
                            }, 0);
                          }
                        }}
                         />
                         
 
                    {contasFiltradas.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border rounded shadow max-h-30 overflow-y-auto z-50">

                       {contasFiltradas.map((c,i) => ( 
                        <div
                            key={c.id}
                            className={`p-2 cursor-pointer ${
                                i === indiceContaObs
                                  ? "bg-blue-200"
                                  : "hover:bg-gray-200"
                              }`}
                            onClick={()=>{

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

    {/* SALDO */}
    <div className="text-right">

      <div className="text-base text-gray-50">
        Saldo atual
      </div>
     <div
  className={`text-lg font-bold ${
    saldo > 0
      ? "text-green-600"
      : saldo < 0
      ? "text-red-400"
      : "text-gray-200"
  }`}
>
  {carregandoSaldo
    ? "Carregando..."
    : saldo.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })
  }
        </div> 
    </div> 
  </div>  
  </div> 
  </div>

     

          {/* TABELA */}
                   {resumoImportacao && (
                <div className="mt-2 bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded-lg text-base font-bold">
                  ✔ {resumoImportacao.qtd} registros importados | 
                  Entradas: {resumoImportacao.entrada.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} | 
                  Saídas: {resumoImportacao.saida.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
              )}
                 
                <div className="mt-4 max-h-[680px] overflow-y-auto rounded-xl border border-gray-200 bg-white"> 
                
               <div className="sticky top-0 z-20 grid grid-cols-[120px_500px_120px_120px_320px_120px_60px] gap-2 text-sm py-2 border-b border-gray-200 bg-white">     
                <div>Data</div>
                <div>Histórico</div>
                
               <div className="text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      Tipo
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-gray-700">
                      Valor
                    </span>
                  </div>
                <div className="text-left">Contra Conta</div>
                <div className="text-right">Saldo</div>
                <div className="text-center">Ação</div>
                </div>

                {/* LINHAS */}

                  {linhas.map((l) => (
                  <div
                    key={l._id}
                    className="grid grid-cols-[120px_500px_120px_120px_220px_120px_90px] gap-2 text-sm border-b py-1"
                  >
                    <div>
                      {String(l.data || "").includes("-")
                        ? l.data.split("-").reverse().join("/")
                        : l.data}
                    </div>

                    <div className="truncate font-semibold">{l.historico}</div>

                    <div className="text-center font-semibold">
                      {l.tipo === "entrada" ? (
                        <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-green-100 text-green-800 font-semibold text-xs">
                          <span className="w-2 h-2 bg-green-600 rounded-sm"></span>
                          Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-red-100 text-red-800 font-semibold text-xs">
                          <span className="w-2 h-2 bg-red-600 rounded-sm"></span>
                          Saída
                        </span>
                      )}
                    </div>

                    <div
                      className={`text-right font-mono font-semibold ${
                        l.tipo === "entrada" ? "text-green-700" : "text-red-700"
                      }`}
                    >
                       {normalizarValor(l.valor).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL"
                        })}
                    </div>

                    <div className="relative">
                        <input
                          className={`border rounded p-1 w-full text-sm ${
                            !l.conta_id ? "bg-red-50 border-red-400" : "bg-white"
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

                      {/*  {!l.conta_id && (
                          <button
                            type="button"
                            onClick={() => abrirNovaContaParaLinha(l)}
                            className="mt-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                          >
                            ➕ Conta não existe? Cadastrar
                          </button>
                        )}*/}


                        {linhaDropdownAberta === l._id && contasFiltradasContra.length > 0 && (
                          <div className="absolute top-full left-0 w-full bg-white border rounded shadow max-h-64 overflow-y-auto z-[9999]">
                            {contasFiltradasContra.map((c) => (
                              <div
                                key={c.id}
                                className="p-2 cursor-pointer hover:bg-blue-100"
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
                      className={`border rounded p-2 text-right font-semibold ${
                        Number(l.saldo || 0) >= 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {Number(l.saldo || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL"
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
                ))} </div> 
          {/* NOVA LINHA */}
          
            {mostrarNovaLinha && (
         <div className="sticky bottom-0 z-20 grid grid-cols-[120px_500px_120px_120px_320px_120px_60px] gap-2 border-t bg-white p-2">
         
                 <input
                        ref={dataRef}
                        type="date"
                        min={dataMin}
                        className="border rounded p-2"
                        value={nova.data || ""}
                        onChange={(e) => {
                          const valor = e.target.value;

                          if (!valor) {
                            setNova(prev => ({ ...prev, data: "" }));
                            return;
                          }

                          setNova(prev => ({ ...prev, data: valor }));
                        }}
                         onBlur={(e) => {
                            const valor = e.target.value;

                            if (valor && valor < dataMin) {
                              alert(`Não pode ser menor que ${dataMin}`);
                              setNova(prev => ({ ...prev, data: dataMin }));
                            }
                          }}
                        onKeyDown={handleEnter(historicoRef)}
                      />



               
                   <input
                    ref={historicoRef}
                    className="border rounded p-2"
                    placeholder="Histórico"
                    value={nova.historico}
                    onChange={(e)=> setNova(prev => ({ ...prev, historico: e.target.value }))}
                   onKeyDown={handleEnter(tipoRef)} 

                  /> 

                 <select
                         ref={tipoRef}
                        className="border rounded p-2"
                        value={nova.tipo}
                        onChange={(e)=> setNova(prev => ({ ...prev, tipo: e.target.value }))}
                         onKeyDown={handleEnter(valorRef)}
                      >
                        <option value="entrada">Entrada</option>
                        <option value="saida">Saída</option>
                      </select>

                    <input
                             ref={valorRef}
                          className="border rounded p-2 text-right"
                          placeholder="Valor"
                          value={nova.valor}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^\d.,]/g, "");
                             setNova(prev => ({ ...prev, valor: v }));
                          }}
                           onKeyDown={handleEnter(contraRef)}
                        />
                   <div className="relative">

                   <input
                     ref={contraRef}
                    className="border rounded p-2 w-full"
                    placeholder="Contra conta"
                    value={nova.contra}
                    onChange={(e)=>{
                        const v = e.target.value;
                        setLinhaDropdownAberta("nova");
                         setNova(prev => ({ ...prev, contra: v }));
                         filtrarContasContra(v);
                        setIndiceSelecionado(-1);
                    }}
                    onKeyDown={(e) => {

                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setIndiceSelecionado(i =>
                      Math.min(i + 1, contasFiltradasContra.length - 1)
                    );
                  }

                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setIndiceSelecionado(i =>
                      Math.max(i - 1, 0)
                    );
                  }

                  if (e.key === "Enter") {
                    e.preventDefault();

                    // 👉 seleciona item do dropdown
                    if (indiceSelecionado >= 0) {
                      const c = contasFiltradasContra[indiceSelecionado];

                      setNova({
                        ...nova,
                        contra: c.nome,
                        conta_id: c.id
                      });

                      setContasFiltradasContra([]);
                      setIndiceSelecionado(-1);

                      return;
                    }

                    // 👉 AQUI É O QUE VOCÊ QUER
                    adicionarLinha();

                    // 👉 foco volta pro início (data ou histórico)
                    setTimeout(() => {
                      dataRef.current?.focus(); 
                      // ou historicoRef.current?.focus(); (se preferir)
                    }, 0);
                  }
                }}
                    />
                   {linhaDropdownAberta === "nova" && contasFiltradasContra.length > 0 && (
                         
                            <div className="absolute bottom-full left-0 w-full bg-white border rounded shadow max-h-64 overflow-y-auto z-[9999]">
                            {contasFiltradasContra.map((c, i) => (
                              <div
                                key={c.id}
                                className={`p-2 cursor-pointer ${
                                  i === indiceSelecionado
                                    ? "bg-blue-200"
                                    : "hover:bg-gray-200"
                                }`}
                                onClick={() => {
                                  if (Number(c.id) === Number(contaId)) {
                                          alert("A conta contra não pode ser igual à conta observada.");
                                          return;
}
                                   setNova(prev => ({ ...prev, contra: c.nome, conta_id: c.id }));
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
                  className={`border rounded p-2 text-right font-semibold ${
                    saldo > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                   value={saldoLinhaAtual.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL"
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

                </div>)}
          
          {/* BOTÕES */}

            <div className="flex justify-end gap-5 mt-8">

         
                 <button
                  onClick={adicionarLinha} 
                  className="btn-pill btn-black"
                    >
                    ➕ Linha
                </button>

                  <button
                      onClick={salvarLancamentos} 
                      className="btn-pill btn-blue"
                              >
                      💾 Salvar
                  </button>
 
                {/*} <button
                onClick={() => setModalContaAberto(true)}
                 
                className="btn-pill btn-emerald"
                        >
                ➕ Nova Conta
              </button>*/}
 

                <label className="btn-pill btn-green cursor-pointer">
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
                    className="btn-pill btn-red"
                        >
                    🗑 Limpar
                  </button>
               


                 <button
                  onClick={() => navigate("/relatorios/diario")}
                   className="btn-pill btn-black"
                   >
                  ↩ Sair
                </button>

                </div>
      
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