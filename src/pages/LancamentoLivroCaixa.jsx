import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { useRef } from "react";
import { fetchSeguro } from "../utils/apiSafe";
import ModalBase from "../components/ModalBase";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
import FormContaContabilModal from "../components/forms/FormContaContabilModal";
 
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
 const dataMin = hojeMaisDias(-7);

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
  const txt = String(linha || "").trim();

  // Excel / Google Sheets
  if (txt.includes("\t")) {
    return txt.split("\t").map(v => v.trim());
  }

  // CSV com ;
  if (txt.includes(";")) {
    return txt.split(";").map(v => v.trim());
  }

  // fallback: data + historico + codigo conta + valor
  const m = txt.match(
    /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d+(?:\.\d+)+)\s+(-?[\d.,]+)$/
  );

  if (m) {
    return [m[1], m[2], m[3], m[4]];
  }

  return [];
}

 function parseTextoParaLinhas(texto) {
  const linhasTexto = String(texto || "")
    .replace(/\r/g, "")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  if (!linhasTexto.length) return [];

  const primeira = linhasTexto[0].toLowerCase();
  const temCabecalho =
    primeira.includes("data") &&
    primeira.includes("hist") &&
    primeira.includes("conta");

  const origem = temCabecalho ? linhasTexto.slice(1) : linhasTexto;

  const resultado = [];

  for (let i = 0; i < origem.length; i++) {
    const colunas = extrairColunasLinha(origem[i]);

    // agora o layout certo é: data, historico, conta, valor
    if (colunas.length < 4) continue;

    // se vier lixo extra, ignora depois da 4a coluna
    const [data, historico, codigoConta, valorTexto] = colunas.slice(0, 4);

    const valorNumero = parseNumeroBR(valorTexto);

    if (!data || !historico || !codigoConta || !valorTexto) continue;

    const contaEncontrada = resolverContaPorCodigo(codigoConta);

    resultado.push({
      _id: gerarLinhaId(),
      data: dataBRparaISO(data),
      historico: String(historico).trim(),
      tipo: valorNumero >= 0 ? "entrada" : "saida",
      valor: Math.abs(valorNumero).toFixed(2).replace(".", ","),
      contra: contaEncontrada
        ? `${contaEncontrada.codigo} - ${contaEncontrada.nome}`
        : String(codigoConta).trim(),
      conta_id: contaEncontrada ? Number(contaEncontrada.id) : null
    });
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
  

async function colarLancamentos() {
  try {
    const texto = await navigator.clipboard.readText();

    if (!texto || !texto.trim()) {
      alert("A área de transferência está vazia.");
      return;
    }

    const novasLinhas = parseTextoParaLinhas(texto);

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


return (
      <div className="flex justify-center mt-10 bg-gray-100 min-h-screen py-10">

      <div className="bg-white rounded-2xl border border-gray-300 w-[1300px] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="bg-gray-650 rounded-lg p-8"> 
        <div className="bg-gray-600 border-b rounded-t-xl p-6"> 
       <div className="bg-gray-600 border-b rounded-t-xl p-6">  
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
                    className="w-full border rounded-lg p-2"
                    placeholder="Digite conta (ex: banco, caixa, 1.1...)"
                    value={conta}
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
                    <div className="absolute top-full left-0 w-full bg-white border rounded shadow max-h-40 overflow-y-auto z-50">

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

  </div>  </div>

</div>
          {/* TABELA */}
             {/* CABEÇALHO */}

                 <div  className="grid  grid-cols-[120px_400px_120px_120px_220px_120px_60px]  gap-2 text-sm py-2 border-b border-gray-200 hover:bg-gray-50">
                                   
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
                <div className="text-center">Contra Conta</div>
                <div className="text-right">Saldo</div>
                <div className="text-center">Ação</div>
                </div>

                {/* LINHAS */}

                  {linhas.map((l) => (
                  <div
                    key={l._id}
                    className="grid grid-cols-[120px_400px_120px_120px_220px_120px_90px] gap-2 text-sm border-b py-1"
                  >
                    <div>
                      {String(l.data || "").includes("-")
                        ? l.data.split("-").reverse().join("/")
                        : l.data}
                    </div>

                    <div className="truncate">{l.historico}</div>

                    <div className="text-center">
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

                    <div>{l.contra}</div>

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
                ))}
          {/* NOVA LINHA */}

            {mostrarNovaLinha && (
            <div className="grid grid-cols-[120px_400px_120px_120px_220px_120px_60px] gap-2 mb-4">
         
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
                    {contasFiltradasContra.length > 0 && (
                          <div className="absolute top-full left-0 w-full bg-white border rounded shadow max-h-48 overflow-y-auto z-50">
                            
                            {contasFiltradasContra.map((c, i) => (
                              <div
                                key={c.id}
                                className={`p-2 cursor-pointer ${
                                  i === indiceSelecionado
                                    ? "bg-blue-200"
                                    : "hover:bg-gray-200"
                                }`}
                                onClick={() => {
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

           <div className="flex justify-end gap-3 mt-4">

         
                 <button
                  onClick={adicionarLinha}
                  className={`${botaoBase} text-white bg-gradient-to-b from-slate-500 via-slate-600 to-slate-800`}
                >
                  ➕ Linha
                </button>

                  <button
                      onClick={salvarLancamentos}
                      className={`${botaoBase} text-white bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800`}
                    >
                      💾 Salvar
                    </button>
 
                 <button
                onClick={() => setModalContaAberto(true)}
                className={`${botaoBase} text-white bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-800`}
              >
                ➕ Nova Conta
              </button>

                <button
                onClick={colarLancamentos}
                className={`${botaoBase} text-white bg-gradient-to-b from-cyan-500 via-teal-600 to-teal-800`}
              >
                📋 Colar
              </button>

              <button
                    onClick={limparEdicao}
                    className={`${botaoBase} text-white bg-gradient-to-b from-red-500 via-red-600 to-red-800`}
                  >
                    🗑 Limpar
                  </button>
               


                 <button
                  onClick={() => navigate("/relatorios/diario")}
                  className={`${botaoBase} text-white bg-gradient-to-b from-zinc-500 via-zinc-600 to-zinc-800`}
                >
                  ↩ Sair
                </button>

                </div>
      
        </div>
      </div>
 
  <ModalBase
  open={modalContaAberto}
  onClose={() => setModalContaAberto(false)}
  title="Nova Conta Contábil"
>
    <FormContaContabilModal
      empresa_id={empresa_id}
      onSuccess={() => {
        setModalContaAberto(false);
        carregarContas();
      }}
      onCancel={() => setModalContaAberto(false)}
    />
  </ModalBase>
 
    </div>
  );
}