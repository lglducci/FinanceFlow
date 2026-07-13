     import { useState,useEffect } from "react";
   import { useNavigate } from "react-router-dom";
   import { buildWebhookUrl } from "../config/globals";
   import { useRef } from "react";
   import { fetchSeguro } from "../utils/apiSafe";
   import ModalBase from "../components/ModalBase";
   import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
   import FormContaContabilModal from "../components/forms/FormContaContabilModal";
   import EditarConta from "./EditarConta";
import ImportadorSicoob from "../components/ImportadorSicoob";
   import * as XLSX from "xlsx";
   import { useTranslation } from "react-i18next";
   
   export default function ImportacaoBancaria() {
     const { t } = useTranslation();
    
    const [mensagemImportacao, setMensagemImportacao] = useState(null);
     const [saldo, setSaldo] = useState(0);
      const empresa_id = localStorage.getItem("empresa_id");
    const [contas, setContas] = useState([]);
    const inputOfxRef = useRef(null);
     const hoje = hojeLocal();
     const [linhas, setLinhas] = useState([]); 
    
   const [contaId, setContaId] = useState(null);
   const historicoRef = useRef(null);
   const [carregandoSaldo, setCarregandoSaldo] = useState(false); 
   const [modalContaAberto, setModalContaAberto] = useState(false);
      const [modalEditarContaAberto, setModalEditarContaAberto] = useState(false);
const [mostrarNovaLinha, setMostrarNovaLinha] = useState(true);
    
   const [importacao, setImportacao] = useState(0);
   const [saldoBase, setSaldoBase] = useState(0); 
   const [editandoId, setEditandoId] = useState(null);
    const dataMin = hojeMaisDias(-7);
    const [resumoImportacao, setResumoImportacao] = useState(null);
   const [abaAtiva, setAbaAtiva] = useState("lancamentos");
   const [tipoArquivo, setTipoArquivo] = useState("excel"); 
   const [indiceConta, setIndiceConta] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const contaAtual = contas[indiceConta] || null;
   
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
   
   
   
   function prepararNovaImportacao(tipo) {
     setLinhas([]);
     setResumoImportacao(null);
     setImportacao(0);
     setEditandoId(null);
     limparNova();
   
     setSaldo(saldoBase);
   
     setMensagemImportacao(`${t("importacaoBancaria.importacao", "Importação")} ${tipo} ${t("importacaoBancaria.carregadaLinhasSubstituidas", "carregada. As linhas anteriores foram substituídas.")}`);
   
     setTimeout(() => {
       setMensagemImportacao(null);
     }, 4000);
   }
   
  
   
   function recalcularLinhas(lista, base = saldoBase) {
     let acumulado = Number(base || 0);
   
     const listaComSaldo = lista.map((l) => {
       const valor = normalizarValor(l.valor);
   
        acumulado += valor;
   
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
    
   
   const navigate = useNavigate();
    function adicionarLinha() {
     if (!mostrarNovaLinha) {
       limparNova();
       setMostrarNovaLinha(true);
       setEditandoId(null);
   
       setTimeout(() => {
         dataRef.current?.focus();
       }, 0);
   
       return;
     }
   
     if (!nova.historico || !nova.valor) {
       alert(t("importacaoBancaria.preenchaDataHistoricoValor", "Preencha data, histórico e valor."));
       return;
     }
     const valorNumero = parseNumeroBR(nova.valor);
   
   if (!valorNumero) {
     alert(t("importacaoBancaria.informeValorValido", "Informe um valor válido."));
     return;
   }
   
   const valorFinal =
     nova.tipo === "saida"
       ? -Math.abs(valorNumero)
       : Math.abs(valorNumero);
   
   const linha = {
     ...nova,
     _id: nova._id || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
     valor: valorFinal.toFixed(2).replace(".", ",")
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
     try {
       const url = buildWebhookUrl("consultasaldo", {
         inicio: hoje,
         fim: hoje,
         empresa_id,
         conta_id: 0,
       });
   
       const resp = await fetch(url, { method: "GET" });
       const data = await resp.json();
   
       setContas(Array.isArray(data) ? data : []);
     } catch (error) {
       console.error(t("importacaoBancaria.erroCarregarContas", "Erro ao carregar contas:"), error);
     }
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
       _id: linha._id
     });
   
     setEditandoId(id);
   
     setTimeout(() => {
       historicoRef.current?.focus();
     }, 0);
   }
    
    async function atualizarFornecedoresServico() {
     const url = buildWebhookUrl("atualiza_fornecedor_servico", {
       empresa_id,
     });
   
     return await fetchSeguro(url, {
       method: "GET",
     });
   }
   
   
   
   // Rotina salvar definitiva assim espero
   async function salvarLancamentos(linhasOverride = null) {
     if (salvando) return;
 
     const veioDaImportacaoAutomatica = Array.isArray(linhasOverride);
 
     if (!contaId) {
       alert(t("importacaoBancaria.contaNaoSelecionada", "Conta observada não selecionada"));
       return;
     }
 
     if (!veioDaImportacaoAutomatica && editandoId !== null && nova._id === editandoId) {
       alert(t("importacaoBancaria.confirmeEdicaoAntesSalvar", "Confirme a edição da linha antes de salvar."));
       return;
     }
 
     setSalvando(true);
 
     try {
       localStorage.setItem("conta_id", String(contaId));
 
       let linhasParaSalvar = veioDaImportacaoAutomatica ? [...linhasOverride] : [...linhas];
 
       // Só considera a linha manual em edição quando o usuário clicou no botão Salvar.
       // No OFX automático, salva apenas as linhas importadas do arquivo.
       if (!veioDaImportacaoAutomatica && (nova.historico || nova.valor)) {
         const valor = parseNumeroBR(nova.valor);
 
         if (!nova.data || !nova.historico || !valor || valor <= 0) {
           alert(t("importacaoBancaria.preenchaLinhaEdicao", "Preencha corretamente a linha em edição antes de salvar."));
           return;
         }
 
         let novoSaldo = saldo;
 
         if (nova.tipo === "entrada") novoSaldo += valor;
         if (nova.tipo === "saida") novoSaldo -= valor;
 
         linhasParaSalvar.push({
           ...nova,
           valor: valor.toFixed(2).replace(".", ","),
           saldo: novoSaldo
         });
       }
 
       if (linhasParaSalvar.length === 0) {
         alert(t("importacaoBancaria.nenhumaLinhaSalvar", "Nenhuma linha para salvar"));
         return;
       }
 
       const lancamentos = linhasParaSalvar.map(l => ({
         data: l.data,
         historico: l.historico,
         valor: parseNumeroBR(l.valor),
         tipo: l.tipo
       }));
 
       const index = lancamentos.findIndex(l =>
         !l.data ||
         !l.historico ||
         l.valor === 0
       );
 
       if (index !== -1) {
         alert(`⚠️ ${t("importacaoBancaria.linha", "Linha")} ${index + 1} ${t("importacaoBancaria.invalida", "inválida.")}`);
         return;
       }
 
       const payload = {
         empresa_id,
         conta_observada: contaId,
         lancamentos: JSON.parse(prepararLancamentosJSONB(lancamentos))
       };
 
       const url = buildWebhookUrl("importa_extrato");
 
       await fetchSeguro(url, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload)
       });
 
        await atualizarFornecedoresServico();
 
       setLinhas([]);
       setResumoImportacao(null);
       setImportacao(0);
       setSaldo(0);
       limparNova();
 
       navigate("/conciliacao-revisao");
     } catch (err) {
       console.error("ERRO CAPTURADO:", err.message);
       alert(err.message || t("importacaoBancaria.erroSalvarLancamentos", "Erro inesperado ao salvar os lançamentos."));
     } finally {
       setSalvando(false);
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
   
       throw new Error(t("importacaoBancaria.formatoLancamentosInvalido", "Formato inválido de lancamentos"));
   
     } catch (e) {
       console.error("Erro preparando JSON:", e);
       throw new Error(t("importacaoBancaria.lancamentosJsonInvalido", "Lancamentos JSON inválido"));
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
   
       alert(err.message || t("importacaoBancaria.erroCarregarSaldoConta", "Erro ao carregar saldo da conta"));
   
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
   
  const valorAtual = parseNumeroMoney(nova.valor);
   
   let saldoLinhaAtual = saldo;
   
    if (!isNaN(valorAtual)) {
     const valorComSinal =
       nova.tipo === "saida"
         ? -Math.abs(valorAtual)
         : Math.abs(valorAtual);
   
     saldoLinhaAtual = saldo + valorComSinal;
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
     
   
   
   function parseValorOFX(valor) {
     if (valor == null) return 0;
   
     let txt = String(valor)
       .trim()
       .replace(/\s+/g, "")
       .replace(/R\$/g, "");
   
     // se vier BR: -20,00
     if (txt.includes(",")) {
       txt = txt.replace(/\./g, "").replace(",", ".");
     }
   
     return Number(txt) || 0;
   }
   
   
   
   function dataBRparaISO(data) {
     const txt = String(data || "").trim();
   
     if (!txt) return "";
   
     // ISO: 2026-05-21
     if (/^\d{4}-\d{2}-\d{2}$/.test(txt)) return txt;
   
     // Data BR: 21/05/2026 ou 21/05/26
     const br = txt.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
     if (br) {
       let dia = br[1].padStart(2, "0");
       let mes = br[2].padStart(2, "0");
       let ano = br[3];
   
       if (ano.length === 2) {
         ano = Number(ano) >= 70 ? `19${ano}` : `20${ano}`;
       }
   
       return `${ano}-${mes}-${dia}`;
     }
   
     // Serial Excel: 46163
     if (/^\d{5}$/.test(txt)) {
       const serial = Number(txt);
       const excelEpoch = new Date(Date.UTC(1899, 11, 30));
       excelEpoch.setUTCDate(excelEpoch.getUTCDate() + serial);
   
       return excelEpoch.toISOString().slice(0, 10);
     }
   
     return txt;
   }
   
   function normalizarCodigoConta(txt) {
     return String(txt || "").trim().replace(/\s+/g, "");
   }
   
   function extrairColunasLinha(linha) {
     const txt = String(linha || "").trim();
     if (!txt) return [];
   
     // 1) tenta TAB (Excel / Google Sheets)
     if (txt.includes("\t")) {
       return txt.split("\t").map(v => v.trim());
     }
   
     // 2) tenta ; (csv)
     if (txt.includes(";")) {
       return txt.split(";").map(v => v.trim());
     }
   
     // 3) fallback por regex: data + historico + valor
      const m = txt.match(/^(\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4}))\s+(.+?)\s+(-?[\d.,]+)$/);
     if (m) {
       return [m[1], m[2], m[3]];
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
       primeira.includes("valor");
   
     const origem = temCabecalho ? linhasTexto.slice(1) : linhasTexto;
   
     const resultado = [];
   
     for (let i = 0; i < origem.length; i++) {
       const colunas = extrairColunasLinha(origem[i]);
   
       if (colunas.length < 3) continue;
   
       const [data, historico, valorTexto] = colunas.slice(0, 3);
   
       const valorNumero = parseNumeroBR(valorTexto);
   
       if (!data || !historico || valorTexto === "") continue;
   
      resultado.push({
     _id: gerarLinhaId(),
     data: dataBRparaISO(data),
     historico: String(historico).trim(),
     tipo: valorNumero >= 0 ? "entrada" : "saida",
     valor: valorNumero.toFixed(2).replace(".", ",")
   });
     }
   
     return resultado;
   }
    
   function extrairColunasLinha(linha) {
     const txt = String(linha || "").trim();
     if (!txt) return [];
   
     // 1) tenta TAB (Excel / Google Sheets)
     if (txt.includes("\t")) {
       return txt.split("\t").map(v => v.trim());
     }
   
     // 2) tenta ; (csv)
     if (txt.includes(";")) {
       return txt.split(";").map(v => v.trim());
     }
   
     // 3) fallback por regex: data + historico + valor
     const m = txt.match(/^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?[\d.,]+)$/);
     if (m) {
       return [m[1], m[2], m[3]];
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
       primeira.includes("valor");
   
     const origem = temCabecalho ? linhasTexto.slice(1) : linhasTexto;
   
     const resultado = [];
   
     for (let i = 0; i < origem.length; i++) {
       const colunas = extrairColunasLinha(origem[i]);
   
       if (colunas.length < 3) continue;
   
       const [data, historico, valorTexto] = colunas;
   
       if (!data || !historico || valorTexto === "") continue;
   
       const valorNumero = parseNumeroBR(valorTexto);
   
       resultado.push({
         _id: gerarLinhaId(),
         data: dataBRparaISO(data),
         historico: String(historico).trim(),
         tipo: valorNumero >= 0 ? "entrada" : "saida",
         valor: valorNumero.toFixed(2).replace(".", ",")
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
   
  
   function parseNumeroMoney(valor) {
   if (valor == null) return 0;
 
   let txt = String(valor)
     .trim()
     .toUpperCase()
     .replace(/R\$/g, "")
     .replace(/\s+/g, "");
 
   const temCredito = /\bC\b$/.test(txt);
   const temDebito = /\bD\b$/.test(txt);
 
   txt = txt.replace(/[CD]$/g, "");
 
   let negativo = false;
 
   if (txt.startsWith("-")) {
     negativo = true;
     txt = txt.substring(1);
   }
 
   txt = txt.replace(/[^\d.,]/g, "");
 
   const temVirgula = txt.includes(",");
   const temPonto = txt.includes(".");
 
   if (temVirgula && temPonto) {
 
     // BR -> 1.234,56
     if (txt.lastIndexOf(",") > txt.lastIndexOf(".")) {
       txt = txt.replace(/\./g, "");
       txt = txt.replace(",", ".");
     }
 
     // EUA -> 1,234.56
     else {
       txt = txt.replace(/,/g, "");
     }
 
   } else if (temVirgula) {
 
     // 100,00
     txt = txt.replace(",", ".");
 
   } else if (temPonto) {
 
     const partes = txt.split(".");
     const ultima = partes[partes.length - 1];
 
     // decimal
     if (ultima.length !== 2) {
       txt = txt.replace(/\./g, "");
     }
 
   }
 
   let numero = Number(txt);
 
   if (!Number.isFinite(numero))
     numero = 0;
 
   if (temDebito || negativo)
     numero = -Math.abs(numero);
 
   if (temCredito)
     numero = Math.abs(numero);
 
   return numero;
 }
 
 // Compatibilidade com o restante do código
 const parseNumeroBR = parseNumeroMoney;
 const normalizarValor = parseNumeroMoney;
     
   async function colarLancamentos() {
     try {
       const texto = await navigator.clipboard.readText();
   
       if (!texto || !texto.trim()) {
         alert(t("importacaoBancaria.clipboardVazio", "A área de transferência está vazia."));
         return;
       }
   
       const novasLinhas = parseTextoParaLinhas(texto);
   
       let totalEntrada = 0;
   let totalSaida = 0;
   
   novasLinhas.forEach(l => {
     const v = parseNumeroBR(l.valor);
     if (v >= 0) totalEntrada += v;
     else  totalSaida += Math.abs(v);;
   });
   
   setResumoImportacao({
     qtd: novasLinhas.length,
     entrada: totalEntrada,
     saida: totalSaida
   });
   
    
   
       if (!novasLinhas.length) {
         console.log("TEXTO COLADO:", JSON.stringify(texto));
         alert(t("importacaoBancaria.nenhumaLinhaValidaConsole", "Nenhuma linha válida encontrada. Veja o console."));
         return;
       }
   
       recalcularLinhas([...linhas, ...novasLinhas]);
       setImportacao(1);
     
     } catch (erro) {
       console.error("Erro ao colar:", erro);
       alert(t("importacaoBancaria.erroLerClipboard", "Não foi possível ler a área de transferência."));
     }
   }
    
   
   
    function limparEdicao() {
     setLinhas([]);
     setSaldo(saldoBase);
     setImportacao(0);
     setEditandoId(null);
     setMostrarNovaLinha(true);
   
     limparNova();
   
     setTimeout(() => {
       dataRef.current?.focus();
     }, 0);
   }
   
   function receberTextoImportadorSicoob(textoPronto) {
     const novasLinhas = parseTextoParaLinhas(textoPronto);
     const novasLinhasComTipo = novasLinhas.map((l) => ({
     ...l,
     arquivo_tipo: "EXCEL",
   }));
   
     if (!novasLinhas.length) {
       alert(t("importacaoBancaria.nenhumaLinhaSicoob", "Nenhuma linha válida encontrada no arquivo Sicoob."));
       return;
     }
   
     let totalEntrada = 0;
     let totalSaida = 0;
   
      novasLinhasComTipo.forEach((l) => {
       const v = parseNumeroBR(l.valor);
       if (v >= 0) totalEntrada += v;
       else totalSaida += Math.abs(v);
     });
   
     setResumoImportacao({
       qtd: novasLinhas.length,
       entrada: totalEntrada,
       saida: totalSaida,
     });
   
     recalcularLinhas([...linhas, ...novasLinhasComTipo]);
     setImportacao(1);
   }
   
   function exportarLayoutExtrato() {
     const dados = [
       ["DATA", "HISTÓRICO", "VALOR"],
       ["24/04/2026", "PIX RECEBIDO - OUTRA IF", "251,00 C"],
       ["27/04/2026", "PIX EMITIDO OUTRA IF - CEF", "-6.300,00 D"],
       ["29/04/2026", "DEP.DINHEIRO", "500,00 C"],
     ];
   
     const ws = XLSX.utils.aoa_to_sheet(dados);
     ws["!cols"] = [{ wch: 14 }, { wch: 48 }, { wch: 18 }];
   
     const wb = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, "Layout Extrato");
   
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
     a.download = "layout_importacao_extrato_bancario.xlsx";
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
   
     URL.revokeObjectURL(url);
   }
   
   
   
    
   
   
   
   async function importarOFXArquivo(e) {
     const arquivo = e.target.files?.[0];
     if (!arquivo) return;
   
   
     prepararNovaImportacao("OFX");
   
   
     await importarOFX(arquivo);
   
     e.target.value = "";
   }
   
   
   
   
   function somenteNumeros(v) {
     return String(v || "").replace(/\D/g, "");
   }
   
   function extrairDadosContaOFX(texto) {
     return {
       banco: texto.match(/<BANKID>([^<\n\r]+)/)?.[1]?.trim() || "",
       agencia: texto.match(/<BRANCHID>([^<\n\r]+)/)?.[1]?.trim() || "",
       conta: texto.match(/<ACCTID>([^<\n\r]+)/)?.[1]?.trim() || "",
     };
   }
   
   function validarOFXContaSelecionada(texto) {
     const contaSelecionada = contas.find(
       (c) => String(c.conta_id) === String(contaId)
     );
   
     if (!contaSelecionada) {
       alert(t("importacaoBancaria.selecioneContaAntesOfx", "Selecione uma conta bancária antes de importar o OFX."));
       return false;
     }
   
     const ofx = extrairDadosContaOFX(texto);
   
     const bancoTela = somenteNumeros(contaSelecionada.nro_banco);
     const agenciaTela = somenteNumeros(contaSelecionada.agencia);
     const contaTela = somenteNumeros(contaSelecionada.conta);
   
     const bancoOfx = somenteNumeros(ofx.banco);
     const agenciaOfx = somenteNumeros(ofx.agencia);
     const contaOfx = somenteNumeros(ofx.conta);
   
     if (bancoTela && bancoOfx && bancoTela !== bancoOfx) {
       alert(`${t("importacaoBancaria.ofxBloqueadoBanco", "OFX bloqueado: banco do arquivo")} (${bancoOfx}) ${t("importacaoBancaria.diferenteContaSelecionada", "é diferente da conta selecionada")} (${bancoTela}).`);
       return false;
     }
   
     if (agenciaTela && agenciaOfx && agenciaTela !== agenciaOfx) {
       alert(`${t("importacaoBancaria.ofxBloqueadoAgencia", "OFX bloqueado: agência do arquivo")} (${agenciaOfx}) ${t("importacaoBancaria.diferenteContaSelecionada", "é diferente da conta selecionada")} (${agenciaTela}).`);
       return false;
     }
   const contaTelaSemZero = contaTela.replace(/^0+/, "");
   const contaOfxSemZero = contaOfx.replace(/^0+/, "");
   
   const contaBate =
     !contaTela ||
     !contaOfx ||
     contaTela === contaOfx ||
     contaOfx.endsWith(contaTela) ||
     contaTela.endsWith(contaOfx) ||
     contaTelaSemZero === contaOfxSemZero ||
     contaOfxSemZero.endsWith(contaTelaSemZero) ||
     contaTelaSemZero.endsWith(contaOfxSemZero);
   
     if (bancoOfx === "033") {
     return true;
   }
   
   if (!contaBate) {
     alert(`${t("importacaoBancaria.ofxBloqueadoConta", "OFX bloqueado: conta do arquivo")} (${contaOfx}) ${t("importacaoBancaria.diferenteContaSelecionada", "é diferente da conta selecionada")} (${contaTela}).`);
     return false;
   }
   
     return true;
   }
   
   
   
   async function importarOFX(arquivo) {
     const texto = await arquivo.text();
 
     if (!validarOFXContaSelecionada(texto)) {
       return;
     }
 
     const blocos = texto.split("<STMTTRN>").slice(1);
 
     const novasLinhas = blocos.map((b) => {
       const dataRaw = b.match(/<DTPOSTED>([^<\n\r]+)/)?.[1] || "";
       const valorRaw = b.match(/<TRNAMT>([^<\n\r]+)/)?.[1] || "";
 
       const memo = b.match(/<MEMO>([^<\n\r]+)/)?.[1]?.trim() || "";
       const name = b.match(/<NAME>([^<\n\r]+)/)?.[1]?.trim() || "";
       const checknumRaw = b.match(/<CHECKNUM>([^<\n\r]+)/)?.[1]?.trim() || "";
       const refnumRaw = b.match(/<REFNUM>([^<\n\r]+)/)?.[1]?.trim() || "";
 
       const historicoBase =
         [memo, name].filter(Boolean).join(" - ") ||
         t("importacaoBancaria.lancamentoOfx", "LANÇAMENTO OFX");
 
       const textoHistorico = historicoBase.toUpperCase();
 
       const numeroCheque =
         checknumRaw && checknumRaw !== "0"
           ? checknumRaw
           : refnumRaw && refnumRaw !== "0"
           ? refnumRaw
           : "";
 
       const ehChequeReal =
         textoHistorico.includes("CHEQUE COMPE") ||
         textoHistorico.includes("CHEQUE DEVOLVIDO") ||
         textoHistorico.includes("CHEQUE COMPENSADO");
 
       const ehChequeDevolvido =
         textoHistorico.includes("CHEQUE DEVOLVIDO") ||
         textoHistorico.includes("DEVOLVIDO") ||
         textoHistorico.includes("DEVOLUCAO") ||
         textoHistorico.includes("DEVOLUÇÃO");
 
       let historicoCompleto = historicoBase;
 
       if (ehChequeReal) {
         historicoCompleto = `${ehChequeDevolvido ? "CHEQUE DEVOLVIDO" : "CHEQUE"}${
           numeroCheque ? ` Nº ${numeroCheque}` : ""
         } - ${historicoBase}`;
       }
 
       const valorNumero = parseValorOFX(valorRaw);
 
       return {
         _id: gerarLinhaId(),
         data: `${dataRaw.slice(0, 4)}-${dataRaw.slice(4, 6)}-${dataRaw.slice(6, 8)}`,
         historico: historicoCompleto,
         tipo: valorNumero >= 0 ? "entrada" : "saida",
         valor: valorNumero.toFixed(2).replace(".", ","),
         arquivo_tipo: "OFX",
       };
     });
 
     if (!novasLinhas.length) {
       alert(t("importacaoBancaria.nenhumaMovimentacaoOfx", "Nenhuma movimentação encontrada no OFX."));
       return;
     }
 
     let totalEntrada = 0;
     let totalSaida = 0;
 
     novasLinhas.forEach((l) => {
       const v = parseNumeroMoney(l.valor);
       if (v >= 0) totalEntrada += v;
       else totalSaida += Math.abs(v);
     });
 
     setResumoImportacao({
       qtd: novasLinhas.length,
       entrada: totalEntrada,
       saida: totalSaida,
     });
 
     const linhasComSaldo = recalcularLinhas(novasLinhas, saldoBase);
     setImportacao(1);
 
     // OFX agora é fluxo único:
     // importou certo -> salva automático -> vai para conferência.
     await salvarLancamentos(linhasComSaldo);
   }
  function selecionarConta(c) {
    if (!c) return;
  
    setContaId(c.conta_id);
  
    const saldoCard = Number(c.saldo_final || 0);
    setSaldoBase(saldoCard);
    setSaldo(saldoCard);
    setLinhas([]);
    limparNova();
  }

  function abrirModalEditarConta(e) {
    e?.stopPropagation?.();

    if (!contaAtual) return;

    selecionarConta(contaAtual);
    setModalEditarContaAberto(true);
  }
  
  function contaAnterior() {
    if (!contas.length) return;
  
    const novoIndice =
      indiceConta === 0 ? contas.length - 1 : indiceConta - 1;
  
    setIndiceConta(novoIndice);
    selecionarConta(contas[novoIndice]);
  }
  
  function proximaConta() {
    if (!contas.length) return;
  
    const novoIndice =
      indiceConta === contas.length - 1 ? 0 : indiceConta + 1;
  
    setIndiceConta(novoIndice);
    selecionarConta(contas[novoIndice]);
  }
  
  
  useEffect(() => {
    if (!contas.length) return;
    if (contaId) return;
  
    const primeira = contas[0];
  
    setIndiceConta(0);
    selecionarConta(primeira);
  }, [contas]);
  
  
      return (
     <div className="min-h-screen bg-[#eef7fd] px-1 py-1">
        
          <div className="mx-auto w-full max-w-[1620px]">
         <div className="rounded-[28px]  bg-gradient-to-b from-[#061f4a] via-[#061f4a] to-[#061f4a]  border border-cyan-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-2">
           <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight text-white mb-4">
               📘 Importação Bancária
             </h2>
   
             <div className="flex items-start justify-between mb-4 ">
             <div className="flex gap-3"> 
                 <button
                   type="button"
                   onClick={() => setAbaAtiva("lancamentos")}
                   className={`px-5 py-2 rounded-full font-bold text-sm ${
                     abaAtiva === "lancamentos"
                       ? "bg-blue-600 text-white"
                       : "bg-white text-gray-700"
                   }`}
                 >
                   🧾 {t("importacaoBancaria.lancamentos", "Lançamentos")}
                 </button>
   
                 <button
                   type="button"
                   onClick={() => setAbaAtiva("layout")}
                   className={`px-5 py-2 rounded-full font-bold text-sm ${
                     abaAtiva === "layout"
                       ? "bg-blue-600 text-white"
                       : "bg-gray-100 text-gray-700"
                   }`}
                 >
                   📄 {t("importacaoBancaria.layoutPlanilhaExcel", "Layout da Planilha Excel")}
                 </button>
               </div>
   
             
   
               {abaAtiva === "layout" && (
                 <div className="bg-white rounded-xl p-16 border shadow mb-4">
                   <h3 className="text-xl font-black text-white mb-3">
                     📄 {t("importacaoBancaria.layoutEsperado", "Layout esperado da planilha")}
                   </h3>
   
                   <p className="text-sm text-gray-600 mb-4">
                     {t("importacaoBancaria.descricaoLayout", "A planilha deve conter as colunas abaixo. Use este modelo para importar extratos bancários.")}
                   </p>
   
                   <table className="w-full text-sm border">
                     <thead className="bg-blue-700 text-white">
                       <tr>
                         <th className="p-2 border">{t("importacaoBancaria.dataMaiusculo", "DATA")}</th>
                         <th className="p-2 border">{t("importacaoBancaria.historicoMaiusculo", "HISTÓRICO")}</th>
                         <th className="p-2 border">{t("importacaoBancaria.valorMaiusculo", "VALOR")}</th>
                       </tr>
                     </thead>
   
                     <tbody>
                       <tr>
                         <td className="p-2 border">24/04/2026</td>
                         <td className="p-2 border">PIX RECEBIDO - OUTRA IF</td>
                         <td className="p-2 border text-blue-700 font-bold">251,00 C</td>
                       </tr>
   
                       <tr>
                         <td className="p-2 border">27/04/2026</td>
                         <td className="p-2 border">PIX EMITIDO OUTRA IF - CEF</td>
                         <td className="p-2 border text-red-600 font-bold">-6.300,00 D</td>
                       </tr>
   
                       <tr>
                         <td className="p-2 border">29/04/2026</td>
                         <td className="p-2 border">DEP.DINHEIRO</td>
                         <td className="p-2 border text-blue-700 font-bold">500,00 C</td>
                       </tr>
                     </tbody>
                   </table>
   
                   <div className="mt-4 text-sm text-gray-700 space-y-1">
                     <p><b>{t("importacaoBancaria.regras", "Regras")}:</b></p>
                     <p>• {t("importacaoBancaria.regraData", "Data deve estar no formato DD/MM/AAAA.")}</p>
                     <p>• {t("importacaoBancaria.regraHistorico", "Histórico é obrigatório.")}</p>
                     <p>• {t("importacaoBancaria.regraValorC", "Valor positivo ou com C será tratado como entrada.")}</p>
                     <p>• {t("importacaoBancaria.regraValorD", "Valor negativo ou com D será tratado como saída.")}</p>
                     <p>• {t("importacaoBancaria.regraHistoricoQuebrado", "Se o histórico vier quebrado em várias linhas, prefira organizar em uma única linha antes de importar.")}</p>
                   </div>
   
                   <div className="mt-5 flex justify-end">
                     <button
                       type="button"
                       onClick={exportarLayoutExtrato}
                       className={`${botaoBase} text-white bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800`}
                     >
                       📥 {t("importacaoBancaria.exportarLayout", "Exportar Layout")}
                     </button>
                   </div> 
   
                 </div>
               )}
               
                 <div className="text-right text-white">
                     <div className="text-base text-gray-550">{t("importacaoBancaria.saldoAtual", "Saldo atual")}</div>
   
                     <div
                       className={`text-lg font-black ${
                         saldo > 0
                           ? "text-green-600"
                           : saldo < 0
                           ? "text-red-400"
                           : "text-gray-700"
                       }`}
                     >
                       {carregandoSaldo
                         ? t("importacaoBancaria.carregando", "Carregando...")
                         : saldo.toLocaleString("pt-BR", {
                             style: "currency",
                             currency: "BRL",
                           })}
                     </div>
                   </div>
                </div>
   
               {abaAtiva === "lancamentos" && (
                  <div className="space-y-3">
                   <div className="flex flex-col gap-1">
                     <label className="text-sm font-bold text-white">
                       {t("importacaoBancaria.contaBancaria", "Conta Bancária")}
                     </label>
   
                     <div>
                  
                       <div className="flex items-center justify-start gap-4 pl-0">
                              <button
                                type="button"
                                onClick={contaAnterior}
                                className="btn-pill btn-white flex items-center gap-2"
                              >
                                ◀
                              </button>
  
                              {contaAtual ? (
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => selecionarConta(contaAtual)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      selecionarConta(contaAtual);
                                    }
                                  }}
                                  onDoubleClick={() => {
                                    selecionarConta(contaAtual);

                                    setTimeout(() => {
                                      inputOfxRef.current?.click();
                                    }, 0);
                                  }}
                                  className={`
                                    w-full max-w-[520px] rounded-3xl border bg-white px-5 py-4
                                    flex items-center gap-4 transition hover:scale-[1.01] cursor-pointer
                                  `}
                                  style={{
                                    borderColor: contaAtual.cor_hex || "#bae6fd",
                                    boxShadow:
                                      String(contaId) === String(contaAtual.conta_id)
                                        ? `0 0 0 2px ${contaAtual.cor_hex || "#2563eb"}33, 0 12px 28px ${contaAtual.cor_hex || "#2563eb"}33`
                                        : `0 8px 20px ${contaAtual.cor_hex || "#0f172a"}22`,
                                  }}
                                >
                                  <div
                                    className="h-16 w-16 rounded-2xl border flex items-center justify-center overflow-hidden"
                                    style={{
                                      background: `${contaAtual.cor_hex || "#f8fafc"}12`,
                                      borderColor: `${contaAtual.cor_hex || "#e2e8f0"}55`,
                                    }}
                                  >
                                    {contaAtual.icone_url ? (
                                      <img
                                        src={contaAtual.icone_url}
                                        alt={contaAtual.banco_nome || contaAtual.nome}
                                        className="h-10 w-10 object-contain"
                                      />
                                    ) : (
                                      <span className="text-3xl">🏦</span>
                                    )}
                                  </div>
 
                                
                                  <div className="flex-1 text-left">
                                    <div className="text-lg font-black text-slate-800">
                                      {contaAtual.nome || contaAtual.conta_nome}
                                    </div>
  
                                    <div className="mt-1 text-xs font-bold text-slate-400">
                                      {contaAtual.banco_nome || t("importacaoBancaria.contaBancariaMinusculo", "Conta bancária")}
                                    </div>
 
                                    <div className="mt-1 text-xs font-bold text-slate-500">
                                     Banco {contaAtual.nro_banco || "-"} • Ag. {contaAtual.agencia || "-"} • Conta {contaAtual.conta || "-"}
                                   </div>
  
                                    <div className="mt-1 text-xs font-bold text-slate-500">
                                      Conta {indiceConta + 1} de {contas.length}
                                    </div>
                                  </div>
  
                                  <div className="text-right">
                                    <div className="text-xs font-bold text-slate-400">
                                      Saldo
                                    </div>
  
                                    <div
                                      className={`text-lg font-black ${
                                        Number(contaAtual.saldo_final || 0) >= 0
                                          ? "text-emerald-700"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {Number(contaAtual.saldo_final || 0).toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      })}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={abrirModalEditarConta}
                                      className="mt-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-[#063452] hover:bg-cyan-100"
                                    >
                                      ✏️ Editar conta
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full max-w-[520px] rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center font-bold text-slate-400">
                                  Nenhuma conta encontrada
                                </div>
                              )}
  
                              <button
                                type="button"
                                onClick={proximaConta}
                                className="btn-pill btn-white flex items-center gap-2"
                              >
                                ▶
                              </button>
                            </div>
                     </div>
                   </div>
   
                  
                 </div>
               )}
             </div>
           </div>
   
           {mensagemImportacao && (
     <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-bold text-[#063452]">
       {mensagemImportacao}
     </div>
   )}
   
            {abaAtiva === "lancamentos" && resumoImportacao && (
                 <div className="mt-4 rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-sky-50 px-5 py-4 shadow-sm flex items-center justify-between">
                   <div>
                     <div className="text-sm font-black text-[#063452]">
                       {t("importacaoBancaria.importacaoCarregadaResumo", "Importação carregada")}
                     </div>
   
                     <div className="text-sm text-slate-600 font-semibold">
                       {resumoImportacao.qtd} {t("importacaoBancaria.lancamentosEncontradosRevisao", "lançamento(s) encontrados para revisão.")}
                     </div>
                   </div>
   
                   <div className="flex gap-3 text-sm font-black">
                     <span className="rounded-xl bg-white px-4 py-2 text-emerald-700 shadow-sm">
                       {t("importacaoBancaria.entradas", "Entradas")}:{" "}
                       {resumoImportacao.entrada.toLocaleString("pt-BR", {
                         style: "currency",
                         currency: "BRL",
                       })}
                     </span>
   
                     <span className="rounded-xl bg-white px-4 py-2 text-red-600 shadow-sm">
                       {t("importacaoBancaria.saidas", "Saídas")}:{" "}
                       {resumoImportacao.saida.toLocaleString("pt-BR", {
                         style: "currency",
                         currency: "BRL",
                       })}
                     </span>
                   </div>
                 </div>
               )}
   
           {abaAtiva === "lancamentos" && (
             <>
               <div className="mt-4 h-auto max-h-[420px] overflow-y-auto rounded-xl border border-gray-200 bg-white">
                 <div  className="grid grid-cols-[80px_120px_550px_120px_220px_220px_120px_160px] gap-2 text-sm py-2 border-b border-gray-200 hover:bg-gray-50">
                   <div className="text-left font-bold">{t("importacaoBancaria.arquivo", "Arquivo")}</div>
                   <div className="text-left font-bold">{t("importacaoBancaria.data", "Data")}</div>
                   <div className="text-left font-bold">{t("importacaoBancaria.historico", "Histórico")}</div>
   
                   <div className="text-center">
                     <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                       {t("importacaoBancaria.tipo", "Tipo")}
                     </span>
                   </div>
   
                   <div className="text-right">
                     <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-gray-700">
                       {t("importacaoBancaria.valor", "Valor")}
                     </span>
                   </div>
   
                 
                   <div className="text-right font-bold">{t("importacaoBancaria.saldo", "Saldo")}</div>
                   {/*<div className="text-center font-bold">{t("importacaoBancaria.acao", "Ação")}</div>*/}
                 </div>
   
                 {linhas.map((l) => (
                   <div
                     key={l._id}
                       className="grid grid-cols-[80px_120px_550px_120px_220px_220px_120px_160px] gap-2 text-sm border-b py-1"
                   >
   
   
                      <div>
                           <span className="rounded-full border border-cyan-100 bg-cyan-50 px-2 py-1 text-[11px] font-black text-[#063452]">
                             {l.arquivo_tipo || t("importacaoBancaria.manual", "MANUAL")}
                           </span>
                         </div>
   
                     <div>
                       {String(l.data || "").includes("-")
                         ? l.data.split("-").reverse().join("/")
                         : l.data}
                     </div>
   
                     <div className="truncate">{l.historico}</div>
   
                       <div className="text-center">
                         <span
                           className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${
                             l.tipo === "entrada"
                               ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                               : "bg-red-50 text-red-600 border-red-100"
                           }`}
                         >
                           {l.tipo === "entrada" ? t("importacaoBancaria.entrada", "Entrada") : t("importacaoBancaria.saida", "Saída")}
                         </span>
                       </div>
   
                     <div
                       className={`text-right font-mono font-semibold ${
                         l.tipo === "entrada" ? "text-green-700" : "text-red-700"
                       }`}
                     >
                       {normalizarValor(l.valor).toLocaleString("pt-BR", {
                         style: "currency",
                         currency: "BRL",
                       })}
                     </div> 
   
                     <div
                       className={`border rounded p-2 text-right font-semibold ${
                         Number(l.saldo || 0) >= 0
                           ? "text-green-700"
                           :  "text-red-700"
                       }`}
                     >
                       {Number(l.saldo || 0).toLocaleString("pt-BR", {
                         style: "currency",
                         currency: "BRL",
                       })}
                     </div>
   
                     <div className="flex items-center justify-center gap-2">
                      {/*} <button
                         type="button"
                         className="text-blue-600 hover:text-blue-800 text-lg"
                         onClick={() => editarLinha(l._id)}
                         title={t("importacaoBancaria.editarLinha", "Editar linha")}
                       >
                         ✏️
                       </button>*/}
   
                        <button
                       type="button"
                       className="w-7 h-7 rounded-full text-slate-600 hover:bg-red-150 hover:text-red-500 transition flex items-center justify-center"
                       onClick={() => removerLinha(l._id)}
                       title={t("importacaoBancaria.excluirLinha", "Excluir linha")}
                     >
                       ✕
                     </button> 
                     </div>
                   </div>
                 ))}
   
                 {mostrarNovaLinha && (
                   <div className="grid grid-cols-[120px_430px_120px_140px_140px_60px] gap-2 mb-4">
                     <input
                       ref={dataRef}
                       type="date"
                       min={dataMin}
                       className="border rounded p-2"
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
                           alert(`${t("importacaoBancaria.naoPodeSerMenorQue", "Não pode ser menor que")} ${dataMin}`);
                           setNova((prev) => ({ ...prev, data: dataMin }));
                         }
                       }}
                       onKeyDown={handleEnter(historicoRef)}
                     />
   
                     <input
                       ref={historicoRef}
                       className="border rounded p-2"
                       placeholder={t("importacaoBancaria.historico", "Histórico")}
                       value={nova.historico}
                       onChange={(e) =>
                         setNova((prev) => ({ ...prev, historico: e.target.value }))
                       }
                       onKeyDown={handleEnter(tipoRef)}
                     />
   
                     <input
                       className="border rounded p-2 text-center bg-gray-50"
                       value={nova.tipo === "entrada" ? t("importacaoBancaria.entrada", "Entrada") : t("importacaoBancaria.saida", "Saída")}
                       readOnly
                     />
   
                     <input
                       ref={valorRef}
                       className="border rounded p-2 text-right"
                       placeholder={t("importacaoBancaria.valor", "Valor")}
                       value={nova.valor}
                       onChange={(e) => {
                         const v = e.target.value.replace(/[^\d.,-]/g, "");
                         setNova((prev) => {
                           const numero = parseNumeroBR(v);
   
                           return {
                             ...prev,
                             valor: v,
                             tipo: numero >= 0 ? "entrada" : "saida",
                           };
                         });
                       }}
                     />
   
                     <input
                       className={`border rounded p-2 text-right font-semibold ${
                         saldo > 0
                           ? "bg-green-100 text-green-700"
                           : "bg-red-100 text-red-700"
                       }`}
                       value={saldoLinhaAtual.toLocaleString("pt-BR", {
                         style: "currency",
                         currency: "BRL",
                       })}
                       disabled
                     />
   
                     {/*<div className="flex items-center justify-center">
                       <button
                         className="text-gray-400 hover:text-red-600 text-lg"
                         onClick={cancelarNovaLinha}
                       >
                         🗑
                       </button>
                     </div>*/}
                   </div>
                 )}
               </div>
   
             <div className="mt-5 flex items-center justify-between">
     <div className="flex items-center gap-2">
       <input
         id="inputOfx"
         ref={inputOfxRef}
         type="file"
         accept=".ofx"
         className="hidden"
         onChange={importarOFXArquivo}
       />
      
      <button
           onClick={() => inputOfxRef.current?.click()}
           className="h-10 px-4 rounded-xl border border-cyan-200 bg-cyan-50 text-[#063452] font-bold text-sm shadow-sm hover:bg-cyan-100 transition"
         >
           📥  {t("importacaoBancaria.importarOFX", "Importar OFX")}
         </button>
   
       <ImportadorSicoob onTextoPronto={receberTextoImportadorSicoob} />
     </div>
   
     <div className="flex items-center gap-2 mr-10">
       <button
         onClick={limparEdicao}
         className="h-10 px-4 rounded-xl border border-red-100 bg-red-50 text-red-700 font-bold text-sm shadow-sm hover:bg-red-100 transition"
       >
          {t("importacaoBancaria.limpar", "Limpar")}
       </button>
   
       <button
         onClick={() => navigate("/importacao-bancaria")}
         className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm shadow-sm hover:bg-slate-50 transition"
       >
            {t("importacaoBancaria.sair", "Sair")}
       </button>
   
        <button
         onClick={() => salvarLancamentos()}
         disabled={salvando}
         className={`h-10 px-5 rounded-xl text-white font-black text-sm shadow-sm transition ${
           salvando
             ? "bg-slate-400 cursor-not-allowed"
             : "bg-[#063452] hover:brightness-110"
         }`}
       >
         {salvando ? "Salvando..." : t("importacaoBancaria.salvar", "Salvar")}
       </button>
 
     </div>
   </div>
             </>
           )}
         </div>
    
   
       <ModalBase
         open={modalContaAberto}
         onClose={() => setModalContaAberto(false)}
         title={t("importacaoBancaria.novaContaContabil", "Nova Conta Contábil")}
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

       <ModalBase
         open={modalEditarContaAberto}
         onClose={() => setModalEditarContaAberto(false)}
         title="Editar conta bancária"
       >
         {contaAtual && (
           <EditarConta
             modoModal
             contaId={contaAtual.conta_id}
             empresaId={empresa_id}
             onClose={() => setModalEditarContaAberto(false)}
             onSuccess={() => {
               setModalEditarContaAberto(false);
               carregarContas();
             }}
           />
         )}
       </ModalBase>

     </div>
   );
   }
   