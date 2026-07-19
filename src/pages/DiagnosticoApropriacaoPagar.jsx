 import { useEffect, useMemo, useState } from "react";
 import { useNavigate } from "react-router-dom";
 import {
   ArrowLeft,
   RefreshCw,
   Printer,
   WalletCards,
   CircleDollarSign,
   Landmark,
   Scale,
   CalendarDays,
   CheckCircle2,
   AlertTriangle,
   Clock3,
   Search,
 } from "lucide-react";
 
 import { buildWebhookUrl } from "../config/globals";
 
 function hojeLocal() {
   const agora = new Date();
   const offset = agora.getTimezoneOffset() * 60000;
 
   return new Date(agora.getTime() - offset)
     .toISOString()
     .slice(0, 10);
 }
 
 function primeiroDiaMes() {
   const agora = new Date();
   const data = new Date(agora.getFullYear(), agora.getMonth(), 1);
   const offset = data.getTimezoneOffset() * 60000;
 
   return new Date(data.getTime() - offset)
     .toISOString()
     .slice(0, 10);
 }
 
 function numero(valor) {
   if (valor === null || valor === undefined || valor === "") {
     return 0;
   }
 
   if (typeof valor === "number") {
     return Number.isFinite(valor) ? valor : 0;
   }
 
   let texto = String(valor).trim();
 
   if (texto.includes(",") && texto.includes(".")) {
     texto = texto.replace(/\./g, "").replace(",", ".");
   } else if (texto.includes(",")) {
     texto = texto.replace(",", ".");
   }
 
   const convertido = Number(texto);
 
   return Number.isFinite(convertido) ? convertido : 0;
 }
 
 function moeda(valor) {
   return numero(valor).toLocaleString("pt-BR", {
     style: "currency",
     currency: "BRL",
   });
 }
 
 function dataBR(valor) {
   if (!valor) return "-";
 
   const texto = String(valor).slice(0, 10);
   const [ano, mes, dia] = texto.split("-");
 
   if (!ano || !mes || !dia) return "-";
 
   return `${dia}/${mes}/${ano}`;
 }
 
 function diferencaDias(dataInicial, dataFinal) {
   if (!dataInicial || !dataFinal) return null;
 
   const inicio = new Date(String(dataInicial).slice(0, 10) + "T00:00:00");
   const fim = new Date(String(dataFinal).slice(0, 10) + "T00:00:00");
 
   if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
     return null;
   }
 
   return Math.round((fim - inicio) / 86400000);
 }
 
 function normalizarResposta(json) {
   if (Array.isArray(json)) {
     if (
       json.length === 1 &&
       json[0] &&
       typeof json[0] === "object" &&
       Array.isArray(json[0].data)
     ) {
       return json[0].data;
     }
 
     return json;
   }
 
   if (Array.isArray(json?.data)) return json.data;
   if (Array.isArray(json?.dados)) return json.dados;
   if (Array.isArray(json?.result)) return json.result;
   if (Array.isArray(json?.items)) return json.items;
 
   return [];
 }
 
 function CardResumo({
   titulo,
   valor,
   descricao,
   icon: Icon,
   destaque = "normal",
 }) {
   const classeValor =
     destaque === "positivo"
       ? "text-emerald-600"
       : destaque === "negativo"
       ? "text-red-600"
       : destaque === "azul"
       ? "text-blue-700"
       : "text-slate-900";
 
   return (
     <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_4px_15px_rgba(15,23,42,0.08)]">
       <div className="mb-3 flex items-center justify-between">
         <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
           <Icon size={19} strokeWidth={2.3} />
         </div>
       </div>
 
       <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">
         {titulo}
       </div>
 
       <div className={`mt-1 text-xl font-black ${classeValor}`}>
         {valor}
       </div>
 
       <div className="mt-1 text-[11px] font-medium text-slate-500">
         {descricao}
       </div>
     </div>
   );
 }
 
 export default function DiagnosticoApropriacaoPagar() {
   const navigate = useNavigate();
 
   const empresaId =
     localStorage.getItem("empresa_id") ||
     localStorage.getItem("id_empresa");
 
   const [dataIni, setDataIni] = useState(primeiroDiaMes());
   const [dataFim, setDataFim] = useState(hojeLocal());
 
   const [dados, setDados] = useState([]);
   const [carregando, setCarregando] = useState(false);
   const [erro, setErro] = useState("");
   const [busca, setBusca] = useState("");
 
   const [analiseAberta, setAnaliseAberta] = useState(false);
 
   async function carregar() {
     if (!empresaId) {
       setErro("Empresa não identificada.");
       return;
     }
 
     if (!dataIni || !dataFim) {
       setErro("Informe o período inicial e final.");
       return;
     }
 
     if (dataIni > dataFim) {
       setErro("A data inicial não pode ser maior que a data final.");
       return;
     }
 
     try {
       setCarregando(true);
       setErro("");
 
       const url = buildWebhookUrl("apropriacao_baixa_cp", {
         empresa_id: empresaId,
         data_ini: dataIni,
         data_fim: dataFim,
       });
 
       const resposta = await fetch(url, {
         method: "GET",
         headers: {
           Accept: "application/json",
         },
       });
 
       if (!resposta.ok) {
         throw new Error(
           `Erro ao consultar relatório. HTTP ${resposta.status}`
         );
       }
 
       const json = await resposta.json();
       const lista = normalizarResposta(json);
 
       setDados(
         lista.map((item) => ({
           ...item,
           valor_total: numero(item.valor_total),
         }))
       );
     } catch (error) {
       console.error("Erro apropriacao_baixa_cp:", error);
       setDados([]);
       setErro(error?.message || "Não foi possível carregar o relatório.");
     } finally {
       setCarregando(false);
     }
   }
 
   useEffect(() => {
     carregar();
   }, []);
 
  
  const diagnostico = useMemo(() => {
   const apropriacoesAutomaticas = dados.filter(
     (item) => item.etapa === "APROPRIACAO"
   );
 
   const baixasAutomaticas = dados.filter(
     (item) => item.etapa === "BAIXA"
   );
 
   const naoPagos = dados.filter(
     (item) => item.etapa === "NAO_PAGO"
   );
 
   const apropriacoesManuais = dados.filter(
     (item) => item.etapa === "APROPRIACAO_MANUAL"
   );
 
   const baixasManuais = dados.filter(
     (item) => item.etapa === "BAIXA_MANUAL"
   );
 
   /*
    * CONTAS RECORRENTES
    *
    * São acompanhadas separadamente e nunca entram nos totais
    * de apropriação, baixa ou saldo da conta Fornecedores.
    */
   const recorrentesPagas = dados.filter(
     (item) => item.etapa === "PAGAMENTO_RECORRENTE"
   );
 
   const recorrentesAbertas = dados.filter(
     (item) => item.etapa === "RECORRENTE_EM_ABERTO"
   );
 
   const recorrentesPagasSemContabilizacao = recorrentesPagas.filter(
     (item) => !item.diario_id
   );
 
   const totalRecorrentesPagas = recorrentesPagas.reduce(
     (soma, item) => soma + numero(item.valor_total),
     0
   );
 
   const totalRecorrentesAbertas = recorrentesAbertas.reduce(
     (soma, item) => soma + numero(item.valor_total),
     0
   );
 
   const totalRecorrentesPrevistas =
     totalRecorrentesPagas + totalRecorrentesAbertas;
 
   const totalRecorrentesSemContabilizacao =
     recorrentesPagasSemContabilizacao.reduce(
       (soma, item) => soma + numero(item.valor_total),
       0
     );
 
   const percentualRecorrentesPagas =
     totalRecorrentesPrevistas > 0
       ? (totalRecorrentesPagas / totalRecorrentesPrevistas) * 100
       : 0;
 
   const recorrentesAbertasOrdenadas = [...recorrentesAbertas].sort(
     (a, b) =>
       String(a.vencimento || "").localeCompare(
         String(b.vencimento || "")
       )
   );
 
   const recorrentesPagasOrdenadas = [...recorrentesPagas].sort(
     (a, b) =>
       String(b.data_movimento || "").localeCompare(
         String(a.data_movimento || "")
       )
   );
 
   const totalApropriadoAutomatico =
     apropriacoesAutomaticas.reduce(
       (soma, item) => soma + numero(item.valor_total),
       0
     );
 
   const totalApropriadoManual =
     apropriacoesManuais.reduce(
       (soma, item) => soma + numero(item.valor_total),
       0
     );
 
   const totalBaixadoAutomatico =
     baixasAutomaticas.reduce(
       (soma, item) => soma + numero(item.valor_total),
       0
     );
 
   const totalBaixadoManual =
     baixasManuais.reduce(
       (soma, item) => soma + numero(item.valor_total),
       0
     );
 
   const totalApropriado =
     totalApropriadoAutomatico +
     totalApropriadoManual;
 
   const totalBaixado =
     totalBaixadoAutomatico +
     totalBaixadoManual;
 
   const saldoBruto =
     totalApropriado - totalBaixado;
 
   const saldo = Math.max(0, saldoBruto);
 
   const excessoBaixa = Math.max(
     0,
     totalBaixado - totalApropriado
   );
 
   const saldoAutomatico = Math.max(
     0,
     totalApropriadoAutomatico -
       totalBaixadoAutomatico
   );
 
   const saldoManual =
     totalApropriadoManual -
     totalBaixadoManual;
 
   const percentualBaixado =
     totalApropriado > 0
       ? (totalBaixado / totalApropriado) * 100
       : 0;
 
   /*
    * A contagem de dívidas considera somente as automáticas.
    * Movimento manual não possui pagar_id e não deve ser tratado
    * artificialmente como uma dívida individual.
    */
  
   const automaticos = dados.filter(
   (item) =>
     item.tipo_divida !== "MANUAL" &&
     item.tipo_divida !== "RECORRENTE"
 );
 
   const chaves = new Set(
     automaticos
       .map((item) => item.chave_divida)
       .filter(Boolean)
   );
 
   const chavesPagas = new Set(
     baixasAutomaticas
       .map((item) => item.chave_divida)
       .filter(Boolean)
   );
 
   const chavesPendentes = new Set(
     naoPagos
       .map((item) => item.chave_divida)
       .filter(Boolean)
   );
 
   const diasPagamento = baixasAutomaticas
     .map((item) =>
       diferencaDias(
         item.data_apropriacao,
         item.data_movimento
       )
     )
     .filter(
       (dias) =>
         dias !== null &&
         Number.isFinite(dias) &&
         dias >= 0
     );
 
   const prazoMedio =
     diasPagamento.length > 0
       ? diasPagamento.reduce(
           (soma, dias) => soma + dias,
           0
         ) / diasPagamento.length
       : 0;
 
   /*
    * Pagamentos por conta financeira.
    *
    * Nas baixas de fornecedores:
    * débito  = Fornecedores
    * crédito = Banco/Caixa
    */
   const mapaPagamentos = new Map();
 
   [
     ...baixasAutomaticas,
     ...baixasManuais,
   ].forEach((item) => {
     const conta =
       item.conta_credito ||
       "Conta não identificada";
 
     const atual =
       mapaPagamentos.get(conta) || {
         conta,
         automatico: 0,
         manual: 0,
         total: 0,
       };
 
     const valor = numero(item.valor_total);
 
     if (item.etapa === "BAIXA_MANUAL") {
       atual.manual += valor;
     } else {
       atual.automatico += valor;
     }
 
     atual.total += valor;
 
     mapaPagamentos.set(conta, atual);
   });
 
   const pagamentosPorConta = Array.from(
     mapaPagamentos.values()
   ).sort((a, b) => b.total - a.total);
 
   /*
    * Apropriações por conta de contrapartida.
    *
    * Nas apropriações:
    * débito  = Despesa/Custo/Ativo
    * crédito = Fornecedores
    */
   const mapaApropriacoes = new Map();
 
   [
     ...apropriacoesAutomaticas,
     ...apropriacoesManuais,
   ].forEach((item) => {
     const conta =
       item.conta_debito ||
       "Conta não identificada";
 
     const atual =
       mapaApropriacoes.get(conta) || {
         conta,
         automatico: 0,
         manual: 0,
         total: 0,
       };
 
     const valor = numero(item.valor_total);
 
     if (
       item.etapa === "APROPRIACAO_MANUAL"
     ) {
       atual.manual += valor;
     } else {
       atual.automatico += valor;
     }
 
     atual.total += valor;
 
     mapaApropriacoes.set(conta, atual);
   });
 
   const apropriacoesPorConta = Array.from(
     mapaApropriacoes.values()
   ).sort((a, b) => b.total - a.total);
 
   return {
     totalApropriado,
     totalBaixado,
     saldo,
     saldoBruto,
     excessoBaixa,
     percentualBaixado,
 
     totalApropriadoAutomatico,
     totalApropriadoManual,
     totalBaixadoAutomatico,
     totalBaixadoManual,
 
     saldoAutomatico,
     saldoManual,
 
     quantidadeDividas: chaves.size,
     quantidadePagas: chavesPagas.size,
     quantidadePendentes:
       chavesPendentes.size,
 
     quantidadeApropriacoesManuais:
       apropriacoesManuais.length,
 
     quantidadeBaixasManuais:
       baixasManuais.length,
 
     quantidadeMovimentosManuais:
       apropriacoesManuais.length +
       baixasManuais.length,
 
     prazoMedio,
     pagamentosPorConta,
     apropriacoesPorConta,
 
     quantidadeRecorrentesPrevistas:
       recorrentesPagas.length + recorrentesAbertas.length,
 
     quantidadeRecorrentesPagas:
       recorrentesPagas.length,
 
     quantidadeRecorrentesAbertas:
       recorrentesAbertas.length,
 
     quantidadeRecorrentesSemContabilizacao:
       recorrentesPagasSemContabilizacao.length,
 
     totalRecorrentesPrevistas,
     totalRecorrentesPagas,
     totalRecorrentesAbertas,
     totalRecorrentesSemContabilizacao,
     percentualRecorrentesPagas,
 
     recorrentesAbertasOrdenadas,
     recorrentesPagasOrdenadas,
   };
 }, [dados]);
 
   const linhasFiltradas = useMemo(() => {
     const texto = busca.trim().toLowerCase();
 
     if (!texto) return dados;
 
     return dados.filter((item) => {
       const conteudo = [
         item.chave_divida,
         item.tipo_divida,
         item.pagar_id,
         item.parcela_num,
         item.parcelas,
         item.etapa,
         item.descricao,
         item.conta_debito,
         item.conta_credito,
         item.status_conta,
       ]
         .filter(
           (valor) =>
             valor !== null &&
             valor !== undefined
         )
         .join(" ")
         .toLowerCase();
 
       return conteudo.includes(texto);
     });
   }, [dados, busca]);
 
     function imprimir() {
   window.print();
 }
 
 function classeEtapa(etapa) {
   switch (etapa) {
     case "APROPRIACAO":
       return "border-blue-200 bg-blue-50 text-blue-700";
 
     case "BAIXA":
       return "border-emerald-200 bg-emerald-50 text-emerald-700";
 
     case "NAO_PAGO":
       return "border-red-200 bg-red-50 text-red-700";
 
     case "APROPRIACAO_MANUAL":
       return "border-violet-200 bg-violet-50 text-violet-700";
 
     case "BAIXA_MANUAL":
       return "border-cyan-200 bg-cyan-50 text-cyan-700";
 
     case "PAGAMENTO_RECORRENTE":
       return "border-emerald-200 bg-emerald-50 text-emerald-700";
 
     case "RECORRENTE_EM_ABERTO":
       return "border-amber-200 bg-amber-50 text-amber-700";
 
     default:
       return "border-slate-200 bg-slate-50 text-slate-700";
   }
 }
 
 function textoEtapa(etapa) {
   switch (etapa) {
     case "APROPRIACAO":
       return "Apropriação";
 
     case "BAIXA":
       return "Baixa";
 
     case "NAO_PAGO":
       return "Não pago";
 
     case "APROPRIACAO_MANUAL":
       return "Apropriação manual";
 
     case "BAIXA_MANUAL":
       return "Baixa manual";
 
     case "PAGAMENTO_RECORRENTE":
       return "Recorrente paga";
 
     case "RECORRENTE_EM_ABERTO":
       return "Recorrente em aberto";
 
     default:
       return etapa || "-";
   }
 }
 
 
 function classeConta(item) {
   if (
     item.etapa === "BAIXA" ||
     item.etapa === "BAIXA_MANUAL"
   ) {
     return "border-emerald-200 bg-emerald-50 text-emerald-700";
   }
 
   if (item.etapa === "PAGAMENTO_RECORRENTE") {
     return "border-cyan-200 bg-cyan-50 text-cyan-700";
   }
 
   if (item.etapa === "RECORRENTE_EM_ABERTO") {
     return "border-amber-200 bg-amber-50 text-amber-700";
   }
 
   if (item.etapa === "NAO_PAGO") {
     return "border-red-200 bg-red-50 text-red-700";
   }
 
   if (
     item.etapa === "APROPRIACAO_MANUAL" ||
     item.tipo_divida === "MANUAL"
   ) {
     return "border-violet-200 bg-violet-50 text-violet-700";
   }
 
   return "border-blue-200 bg-blue-50 text-blue-700";
 }
 
 
   return (
     <div className="min-h-screen bg-[#eef7fd] px-3 py-2 print:bg-white">
       <div className="mx-auto w-full max-w-[1480px]">
       <div id="print-area">
         {/* CABEÇALHO */}
         <div className="rounded-[24px] bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#2563eb] px-4 py-4 text-white shadow-lg print:bg-[#172554]">
           <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
             <div className="flex items-center gap-3">
               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                 <Scale size={25} />
               </div>
 
               <div>
                 <h1 className="text-xl font-black sm:text-2xl">
                   Diagnóstico de Contas a Pagar
                 </h1>
 
                 <p className="mt-0.5 text-xs font-semibold text-blue-100">
                   Apropriações, baixas, saldo pendente e rastreabilidade contábil.
                 </p>
               </div>
             </div>
 
             <div className="flex flex-wrap items-center gap-2 print:hidden">
               <button
                 type="button"
                 onClick={() => navigate(-1)}
                 className="flex h-9 items-center gap-1.5 rounded-full bg-white/15 px-4 text-xs font-black transition hover:bg-white/25"
               >
                 <ArrowLeft size={15} />
                 Voltar
               </button>
 
               <button
                 type="button"
                 onClick={carregar}
                 disabled={carregando}
                 className="flex h-9 items-center gap-1.5 rounded-full bg-white/15 px-4 text-xs font-black transition hover:bg-white/25 disabled:opacity-60"
               >
                 <RefreshCw
                   size={15}
                   className={carregando ? "animate-spin" : ""}
                 />
                 Atualizar
               </button>
               
               <button
                   type="button"
                   onClick={() => setAnaliseAberta(true)}
                   className="flex h-9 items-center gap-1.5 rounded-full bg-amber-400 px-4 text-xs font-black text-amber-950 shadow-sm transition hover:bg-amber-300"
                 >
                   <Scale size={15} />
                   Análise
                 </button>
 
               <button
                 type="button"
                 onClick={() => window.print()}
                 className="flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-black text-slate-900 transition hover:bg-blue-50"
               >
                 <Printer size={15} />
                 Imprimir
               </button>
             </div>
           </div>
         </div>
     
         {/* FILTROS */}
         <div className="mt-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm print:hidden">
           <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
             <div>
               <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">
                 Data inicial
               </label>
 
               <input
                 type="date"
                 value={dataIni}
                 onChange={(e) => setDataIni(e.target.value)}
                 className="h-10 rounded-xl border border-blue-100 bg-blue-50/40 px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
               />
             </div>
 
             <div>
               <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">
                 Data final
               </label>
 
               <input
                 type="date"
                 value={dataFim}
                 onChange={(e) => setDataFim(e.target.value)}
                 className="h-10 rounded-xl border border-blue-100 bg-blue-50/40 px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
               />
             </div>
 
             <button
               type="button"
               onClick={carregar}
               disabled={carregando}
               className="h-10 rounded-xl bg-blue-700 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
             >
               Consultar período
             </button>
 
             <div className="relative min-w-0 flex-1">
               <Search
                 size={16}
                 className="absolute left-3 top-3 text-slate-400"
               />
 
               <input
                 type="text"
                 value={busca}
                 onChange={(e) => setBusca(e.target.value)}
                 placeholder="Buscar descrição, conta, etapa ou referência..."
                 className="h-10 w-full rounded-xl border border-blue-100 bg-blue-50/40 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
               />
             </div>
           </div>
         </div>
 
         {erro && (
           <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
             {erro}
           </div>
         )}
 
         {/* CARDS PRINCIPAIS */}
         <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
           <CardResumo
             titulo="Total apropriado"
             valor={moeda(diagnostico.totalApropriado)}
             descricao="Dívidas reconhecidas contabilmente no relatório."
             icon={WalletCards}
             destaque="azul"
           />
 
           <CardResumo
             titulo="Total baixado"
             valor={moeda(diagnostico.totalBaixado)}
             descricao="Pagamentos encontrados e contabilizados."
             icon={CircleDollarSign}
             destaque="positivo"
           />
 
           <CardResumo
             titulo="Saldo não baixado"
             valor={moeda(diagnostico.saldo)}
             descricao="Diferença entre apropriações e pagamentos."
             icon={Landmark}
             destaque={
               diagnostico.saldo > 0 ? "negativo" : "positivo"
             }
           />
 
           <CardResumo
             titulo="Percentual baixado"
             valor={`${diagnostico.percentualBaixado.toLocaleString(
               "pt-BR",
               {
                 minimumFractionDigits: 1,
                 maximumFractionDigits: 1,
               }
             )}%`}
             descricao="Percentual apropriado que já teve baixa."
             icon={CheckCircle2}
             destaque={
               diagnostico.percentualBaixado >= 100
                 ? "positivo"
                 : "azul"
             }
           />
         </div>
 
         {/* DIAGNÓSTICO SECUNDÁRIO */}
         <div className="mt-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
           <div className="mb-3 flex items-center gap-2">
             <CalendarDays size={17} className="text-blue-700" />
 
             <h2 className="text-sm font-black text-slate-900">
               Resumo do período
             </h2>
           </div>
 
           <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
             <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
               <div className="text-[10px] font-black uppercase text-slate-500">
                 Dívidas analisadas
               </div>
 
               <div className="mt-1 text-xl font-black text-slate-900">
                 {diagnostico.quantidadeDividas}
               </div>
             </div>
 
             <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
               <div className="text-[10px] font-black uppercase text-slate-500">
                 Com baixa
               </div>
 
               <div className="mt-1 text-xl font-black text-emerald-700">
                 {diagnostico.quantidadePagas}
               </div>
             </div>
 
             <div className="rounded-xl border border-red-100 bg-red-50/60 p-3">
               <div className="text-[10px] font-black uppercase text-slate-500">
                 Pendentes
               </div>
 
               <div className="mt-1 text-xl font-black text-red-600">
                 {diagnostico.quantidadePendentes}
               </div>
             </div>
 
             <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
               <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500">
                 <Clock3 size={13} />
                 Prazo médio para baixa
               </div>
 
               <div className="mt-1 text-xl font-black text-amber-700">
                 {diagnostico.prazoMedio.toLocaleString("pt-BR", {
                   minimumFractionDigits: 1,
                   maximumFractionDigits: 1,
                 })}{" "}
                 dias
               </div>
             </div>
           </div>
 
           <div
             className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
               diagnostico.saldo > 0
                 ? "border-amber-200 bg-amber-50 text-amber-800"
                 : "border-emerald-200 bg-emerald-50 text-emerald-800"
             }`}
           >
             {diagnostico.saldo > 0 ? (
               <AlertTriangle size={16} className="mt-0.5 shrink-0" />
             ) : (
               <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
             )}
 
             {diagnostico.saldo > 0
               ? `Existem ${moeda(
                   diagnostico.saldo
                 )} apropriados sem baixa identificada neste diagnóstico.`
               : "Todas as apropriações apresentadas possuem baixa correspondente."}
           </div>
         </div>
 
         {/* RELATÓRIO */}
         <div className="mt-3 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
           <div className="flex items-center justify-between border-b border-blue-100 px-4 py-3">
             <div>
               <h2 className="text-sm font-black text-slate-900">
                 Apropriações e baixas
               </h2>
 
               <p className="text-[11px] font-medium text-slate-500">
                 Linha a linha das movimentações encontradas no período de{" "}
                 <span className="font-black text-slate-700">
                     {dataBR(dataIni)}
                 </span>{" "}
                 a{" "}
                 <span className="font-black text-slate-700">
                     {dataBR(dataFim)}
                 </span>
                 .
                 </p>
 
             </div>
 
             <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
               {linhasFiltradas.length} registros
             </div>
           </div>
 
           <div className="overflow-x-auto">
             <table className="min-w-[1450px] w-full border-collapse text-left">
               <thead className="bg-[#172554] text-white">
                 <tr>
                   {/*<th className="px-3 py-3 text-[10px] font-black uppercase">
                     Referência
                   </th>*/}
 
                   <th className="px-3 py-3 text-[10px] font-black uppercase">
                     Descrição
                   </th>
 
                   <th className="px-3 py-3 text-[10px] font-black uppercase">
                     Tipo
                   </th>
 
                   <th className="px-3 py-3 text-[10px] font-black uppercase">
                     Parcela
                   </th>
 
                   <th className="px-3 py-3 text-[10px] font-black uppercase">
                     Etapa
                   </th>
 
                   <th className="px-3 py-3 text-[10px] font-black uppercase">
                     Apropriação
                   </th>
 
                   <th className="px-3 py-3 text-[10px] font-black uppercase">
                     Movimento
                   </th>
 
                   <th className="px-3 py-3 text-[10px] font-black uppercase">
                     Vencimento
                   </th>
 
                   <th className="px-3 py-3 text-[10px] font-black uppercase">
                     Conta débito
                   </th>
 
                   <th className="px-3 py-3 text-[10px] font-black uppercase">
                     Conta crédito
                   </th>
 
                   <th className="px-3 py-3 text-right text-[10px] font-black uppercase">
                     Valor
                   </th>
 
                   <th className="px-3 py-3 text-center text-[10px] font-black uppercase">
                     Status
                   </th>
                 </tr>
               </thead>
 
               <tbody>
                 {carregando ? (
                   <tr>
                     <td
                       colSpan={12}
                       className="px-4 py-14 text-center text-sm font-bold text-slate-500"
                     >
                       Carregando diagnóstico...
                     </td>
                   </tr>
                 ) : linhasFiltradas.length === 0 ? (
                   <tr>
                     <td
                       colSpan={12}
                       className="px-4 py-14 text-center text-sm font-bold text-slate-500"
                     >
                       Nenhum registro encontrado no período.
                     </td>
                   </tr>
                 ) : (
                   linhasFiltradas.map((item, index) => {
                     const parcela =
                       item.parcela_num && item.parcelas
                         ? `${item.parcela_num}/${item.parcelas}`
                         : item.parcelas === "1" ||
                           item.parcelas === 1
                         ? "1/1"
                         : "-";
 
                     return (
                       <tr
                         key={`${item.chave_divida}-${item.etapa}-${item.diario_id || index}`}
                         className={`border-b border-slate-100 ${
                           index % 2 === 0
                             ? "bg-white"
                             : "bg-slate-50/70"
                         } hover:bg-blue-50/70`}
                       >
                       {/*}  <td className="whitespace-nowrap px-3 py-3 text-xs font-black text-blue-700">
                           {item.chave_divida || "-"}
                         </td>*/}
 
                         <td className="max-w-[220px] px-3 py-3 text-xs font-bold text-slate-800">
                           {item.descricao || "-"}
                         </td>
 
                         <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-slate-600">
                            {item.tipo_divida === "PARCELADA"
                               ? "Parcelada"
                               : item.tipo_divida === "SIMPLES"
                               ? "Simples"
                               : item.tipo_divida === "MANUAL"
                               ? "Manual"
                               : item.tipo_divida === "RECORRENTE"
                               ? "Recorrente"
                               : item.tipo_divida || "-"}
                         </td>
 
                         <td className="whitespace-nowrap px-3 py-3 text-xs font-bold text-slate-700">
                           {parcela}
                         </td>
 
                         <td className="whitespace-nowrap px-3 py-3">
                           <span
                             className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${classeEtapa(
                               item.etapa
                             )}`}
                           >
                             {textoEtapa(item.etapa)}
                           </span>
                         </td>
 
                         <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-slate-700">
                           {dataBR(item.data_apropriacao)}
                         </td>
 
                         <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-slate-700">
                           {dataBR(item.data_movimento)}
                         </td>
 
                         <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-slate-700">
                           {dataBR(item.vencimento)}
                         </td>
                          
                           <td className="max-w-[250px] px-3 py-3 text-xs font-semibold text-slate-700">
                             <span
                               className={`inline-flex rounded-md border px-2 py-1 ${classeConta(item)}`}
                             >
                               {item.conta_debito || "-"}
                             </span>
                           </td>
 
                           <td className="max-w-[250px] px-3 py-3 text-xs font-semibold text-slate-700">
                             <span
                               className={`inline-flex rounded-md border px-2 py-1 ${classeConta(item)}`}
                             >
                               {item.conta_credito || "-"}
                             </span>
                           </td>
 
                         <td
                           className={`whitespace-nowrap px-3 py-3 text-right text-xs font-black ${
                             item.etapa === "BAIXA" ||
                             item.etapa === "BAIXA_MANUAL" ||
                             item.etapa === "PAGAMENTO_RECORRENTE"
                               ? "text-emerald-700"
                               : item.etapa === "NAO_PAGO"
                               ? "text-red-600"
                               : item.etapa === "RECORRENTE_EM_ABERTO"
                               ? "text-amber-700"
                               : item.tipo_divida === "MANUAL"
                               ? "text-violet-700"
                               : "text-blue-800"
                           }`}
                         >
                           {moeda(item.valor_total)}
                         </td>
 
                         <td className="whitespace-nowrap px-3 py-3 text-center">
                           {item.status_conta ? (
                             <span
                               className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                                 String(
                                   item.status_conta
                                 ).toLowerCase() === "pago"
                                   ? "bg-emerald-100 text-emerald-700"
                                   : "bg-amber-100 text-amber-700"
                               }`}
                             >
                               {item.status_conta}
                             </span>
                           ) : (
                             <span className="text-xs font-bold text-slate-400">
                               -
                             </span>
                           )}
                         </td>
                       </tr>
                     );
                   })
                 )}
               </tbody>
 
               {linhasFiltradas.length > 0 && (
                 <tfoot>
                   <tr className="border-t-2 border-blue-200 bg-blue-50">
                     <td
                       colSpan={10}
                       className="px-3 py-3 text-right text-xs font-black uppercase text-slate-700"
                     >
                       Total das linhas exibidas
                     </td>
 
                     <td className="px-3 py-3 text-right text-sm font-black text-blue-800">
                       {moeda(
                         linhasFiltradas.reduce(
                           (soma, item) =>
                             soma + numero(item.valor_total),
                           0
                         )
                       )}
                     </td>
 
                     <td />
                   </tr>
                 </tfoot>
               )}
             </table>
           </div>
         </div>
       </div>
       </div>
 
       {analiseAberta && (
   <div
     className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm print:hidden"
     onMouseDown={() => setAnaliseAberta(false)}
   >
     <div
       className="max-h-[94vh] w-full max-w-[1100px] overflow-y-auto rounded-[26px] border border-blue-100 bg-[#f8fcff] shadow-2xl"
       onMouseDown={(e) => e.stopPropagation()}
     >
       {/* CABEÇALHO */}
       <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[26px] bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#2563eb] px-5 py-4 text-white">
         <div>
           <h2 className="text-lg font-black">
             Análise da Conta Fornecedores
           </h2>
 
           <p className="mt-0.5 text-xs font-semibold text-blue-100">
             Diagnóstico sintético de{" "}
             {dataBR(dataIni)} a {dataBR(dataFim)}
           </p>
         </div>
 
         <button
           type="button"
           onClick={() => setAnaliseAberta(false)}
           className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xl font-black transition hover:bg-white/25"
           aria-label="Fechar análise"
         >
           ×
         </button>
       </div>
 
       <div className="space-y-4 p-4 sm:p-5">
         {/* SEMÁFORO */}
         <div
           className={`rounded-2xl border p-4 ${
             diagnostico.excessoBaixa > 0
               ? "border-red-200 bg-red-50"
               : diagnostico.saldo > 0
               ? "border-amber-200 bg-amber-50"
               : diagnostico.quantidadeMovimentosManuais > 0
               ? "border-blue-200 bg-blue-50"
               : "border-emerald-200 bg-emerald-50"
           }`}
         >
           <div className="flex items-start gap-3">
             <div
               className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                 diagnostico.excessoBaixa > 0
                   ? "bg-red-100 text-red-700"
                   : diagnostico.saldo > 0
                   ? "bg-amber-100 text-amber-700"
                   : diagnostico.quantidadeMovimentosManuais > 0
                   ? "bg-blue-100 text-blue-700"
                   : "bg-emerald-100 text-emerald-700"
               }`}
             >
               {diagnostico.saldo > 0 ||
               diagnostico.excessoBaixa > 0 ? (
                 <AlertTriangle size={21} />
               ) : (
                 <CheckCircle2 size={21} />
               )}
             </div>
 
             <div>
               <div className="text-sm font-black text-slate-900">
                 {diagnostico.excessoBaixa > 0
                   ? "Baixas superiores às apropriações"
                   : diagnostico.saldo > 0
                   ? "Existem valores sem baixa identificada"
                   : diagnostico.quantidadeMovimentosManuais > 0
                   ? "Saldo conciliado, mas existem movimentos manuais"
                   : "Movimentação conciliada"}
               </div>
 
               <div className="mt-1 text-xs font-semibold text-slate-600">
                 {diagnostico.excessoBaixa > 0
                   ? `${moeda(
                       diagnostico.excessoBaixa
                     )} foram baixados acima do total apropriado.`
                   : diagnostico.saldo > 0
                   ? `${moeda(
                       diagnostico.saldo
                     )} permanecem sem baixa no período analisado.`
                   : diagnostico.quantidadeMovimentosManuais > 0
                   ? `${diagnostico.quantidadeMovimentosManuais} movimentos manuais foram encontrados e devem ser revisados.`
                   : "Não foram encontradas diferenças ou movimentos manuais no período."}
               </div>
             </div>
           </div>
         </div>
 
 
  
         {/* RESUMO PRINCIPAL */}
         <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
           <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
             <div className="text-[10px] font-black uppercase text-slate-500">
               Total apropriado
             </div>
 
             <div className="mt-1 text-xl font-black text-blue-700">
               {moeda(diagnostico.totalApropriado)}
             </div>
 
             <div className="mt-2 text-[11px] font-semibold text-slate-500">
               Automático:{" "}
               {moeda(
                 diagnostico.totalApropriadoAutomatico
               )}
             </div>
 
             <div className="text-[11px] font-semibold text-amber-700">
               Manual:{" "}
               {moeda(
                 diagnostico.totalApropriadoManual
               )}
             </div>
           </div>
 
           <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
             <div className="text-[10px] font-black uppercase text-slate-500">
               Total baixado
             </div>
 
             <div className="mt-1 text-xl font-black text-emerald-700">
               {moeda(diagnostico.totalBaixado)}
             </div>
 
             <div className="mt-2 text-[11px] font-semibold text-slate-500">
               Automático:{" "}
               {moeda(
                 diagnostico.totalBaixadoAutomatico
               )}
             </div>
 
             <div className="text-[11px] font-semibold text-amber-700">
               Manual:{" "}
               {moeda(
                 diagnostico.totalBaixadoManual
               )}
             </div>
           </div>
 
           <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
             <div className="text-[10px] font-black uppercase text-slate-500">
               Saldo não baixado
             </div>
 
             <div
               className={`mt-1 text-xl font-black ${
                 diagnostico.saldo > 0
                   ? "text-red-600"
                   : "text-emerald-700"
               }`}
             >
               {moeda(diagnostico.saldo)}
             </div>
 
             <div className="mt-2 text-[11px] font-semibold text-slate-500">
               Automático:{" "}
               {moeda(diagnostico.saldoAutomatico)}
             </div>
 
             <div className="text-[11px] font-semibold text-amber-700">
               Manual líquido:{" "}
               {moeda(diagnostico.saldoManual)}
             </div>
           </div>
 
           <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
             <div className="text-[10px] font-black uppercase text-slate-500">
               Percentual baixado
             </div>
 
             <div className="mt-1 text-xl font-black text-amber-700">
               {diagnostico.percentualBaixado.toLocaleString(
                 "pt-BR",
                 {
                   minimumFractionDigits: 1,
                   maximumFractionDigits: 1,
                 }
               )}
               %
             </div>
 
             <div className="mt-2 text-[11px] font-semibold text-slate-500">
               {diagnostico.quantidadeDividas} dívidas automáticas analisadas
             </div>
           </div>
         </div>
 
         {/* CONTAS RECORRENTES — BLOCO SEPARADO */}
         <div className="overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm">
           <div className="border-b border-cyan-100 bg-cyan-50/70 px-4 py-3">
             <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
               <div>
                 <h3 className="text-sm font-black text-slate-900">
                   Contas recorrentes
                 </h3>
 
                 <p className="text-[11px] font-semibold text-slate-500">
                   Acompanhamento separado. Estes valores não compõem
                   apropriações, baixas ou saldo da conta Fornecedores.
                 </p>
               </div>
 
               <span className="w-fit rounded-full border border-cyan-200 bg-white px-3 py-1 text-[10px] font-black uppercase text-cyan-700">
                 Fluxo direto
               </span>
             </div>
           </div>
 
           <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
             <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
               <div className="text-[10px] font-black uppercase text-slate-500">
                 Previstas no período
               </div>
 
               <div className="mt-1 text-xl font-black text-slate-900">
                 {moeda(diagnostico.totalRecorrentesPrevistas)}
               </div>
 
               <div className="mt-1 text-[11px] font-semibold text-slate-500">
                 {diagnostico.quantidadeRecorrentesPrevistas} competências
               </div>
             </div>
 
             <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
               <div className="text-[10px] font-black uppercase text-slate-500">
                 Pagas
               </div>
 
               <div className="mt-1 text-xl font-black text-emerald-700">
                 {moeda(diagnostico.totalRecorrentesPagas)}
               </div>
 
               <div className="mt-1 text-[11px] font-semibold text-emerald-700">
                 {diagnostico.quantidadeRecorrentesPagas} pagamentos
               </div>
             </div>
 
             <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
               <div className="text-[10px] font-black uppercase text-slate-500">
                 Em aberto
               </div>
 
               <div className="mt-1 text-xl font-black text-amber-700">
                 {moeda(diagnostico.totalRecorrentesAbertas)}
               </div>
 
               <div className="mt-1 text-[11px] font-semibold text-amber-700">
                 {diagnostico.quantidadeRecorrentesAbertas} pendências
               </div>
             </div>
 
             <div
               className={`rounded-xl border p-3 ${
                 diagnostico.quantidadeRecorrentesSemContabilizacao > 0
                   ? "border-red-200 bg-red-50/70"
                   : "border-blue-200 bg-blue-50/60"
               }`}
             >
               <div className="text-[10px] font-black uppercase text-slate-500">
                 Pagas sem contabilização
               </div>
 
               <div
                 className={`mt-1 text-xl font-black ${
                   diagnostico.quantidadeRecorrentesSemContabilizacao > 0
                     ? "text-red-600"
                     : "text-blue-700"
                 }`}
               >
                 {moeda(
                   diagnostico.totalRecorrentesSemContabilizacao
                 )}
               </div>
 
               <div
                 className={`mt-1 text-[11px] font-semibold ${
                   diagnostico.quantidadeRecorrentesSemContabilizacao > 0
                     ? "text-red-600"
                     : "text-blue-700"
                 }`}
               >
                 {diagnostico.quantidadeRecorrentesSemContabilizacao} registros
               </div>
             </div>
           </div>
 
           <div className="px-4 pb-4">
             <div className="h-2 overflow-hidden rounded-full bg-slate-100">
               <div
                 className="h-full rounded-full bg-emerald-500 transition-all"
                 style={{
                   width: `${Math.min(
                     100,
                     Math.max(
                       0,
                       diagnostico.percentualRecorrentesPagas
                     )
                   )}%`,
                 }}
               />
             </div>
 
             <div className="mt-1 flex items-center justify-between text-[10px] font-black uppercase text-slate-500">
               <span>Percentual pago</span>
               <span className="text-emerald-700">
                 {diagnostico.percentualRecorrentesPagas.toLocaleString(
                   "pt-BR",
                   {
                     minimumFractionDigits: 1,
                     maximumFractionDigits: 1,
                   }
                 )}
                 %
               </span>
             </div>
           </div>
 
           <div className="grid grid-cols-1 border-t border-cyan-100 lg:grid-cols-2">
             <div className="border-b border-cyan-100 lg:border-b-0 lg:border-r">
               <div className="flex items-center justify-between px-4 py-3">
                 <div>
                   <div className="text-xs font-black text-slate-900">
                     Recorrentes em aberto
                   </div>
 
                   <div className="text-[10px] font-semibold text-slate-500">
                     Ordenadas pelo vencimento.
                   </div>
                 </div>
 
                 <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-700">
                   {diagnostico.quantidadeRecorrentesAbertas}
                 </span>
               </div>
 
               <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
                 {diagnostico.recorrentesAbertasOrdenadas.length === 0 ? (
                   <div className="px-4 py-8 text-center text-xs font-semibold text-slate-400">
                     Nenhuma recorrente em aberto.
                   </div>
                 ) : (
                   diagnostico.recorrentesAbertasOrdenadas.map(
                     (item, index) => (
                       <div
                         key={`rec-aberta-${item.chave_divida || index}`}
                         className="flex items-center justify-between gap-3 px-4 py-3"
                       >
                         <div className="min-w-0">
                           <div className="truncate text-xs font-black text-slate-800">
                             {item.descricao || "Conta recorrente"}
                           </div>
 
                           <div className="mt-0.5 text-[10px] font-semibold text-slate-500">
                             Vencimento {dataBR(item.vencimento)}
                             {item.conta_debito
                               ? ` • ${item.conta_debito}`
                               : ""}
                           </div>
                         </div>
 
                         <div className="whitespace-nowrap text-xs font-black text-amber-700">
                           {moeda(item.valor_total)}
                         </div>
                       </div>
                     )
                   )
                 )}
               </div>
             </div>
 
             <div>
               <div className="flex items-center justify-between px-4 py-3">
                 <div>
                   <div className="text-xs font-black text-slate-900">
                     Recorrentes pagas
                   </div>
 
                   <div className="text-[10px] font-semibold text-slate-500">
                     Pagamentos diretos do período.
                   </div>
                 </div>
 
                 <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                   {diagnostico.quantidadeRecorrentesPagas}
                 </span>
               </div>
 
               <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
                 {diagnostico.recorrentesPagasOrdenadas.length === 0 ? (
                   <div className="px-4 py-8 text-center text-xs font-semibold text-slate-400">
                     Nenhuma recorrente paga.
                   </div>
                 ) : (
                   diagnostico.recorrentesPagasOrdenadas.map(
                     (item, index) => (
                       <div
                         key={`rec-paga-${item.chave_divida || index}`}
                         className="flex items-center justify-between gap-3 px-4 py-3"
                       >
                         <div className="min-w-0">
                           <div className="flex items-center gap-2">
                             <div className="truncate text-xs font-black text-slate-800">
                               {item.descricao || "Conta recorrente"}
                             </div>
 
                             {!item.diario_id && (
                               <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-black uppercase text-red-700">
                                 Sem contabilização
                               </span>
                             )}
                           </div>
 
                           <div className="mt-0.5 text-[10px] font-semibold text-slate-500">
                             Pago em {dataBR(item.data_movimento)}
                             {item.conta_credito
                               ? ` • ${item.conta_credito}`
                               : ""}
                           </div>
                         </div>
 
                         <div className="whitespace-nowrap text-xs font-black text-emerald-700">
                           {moeda(item.valor_total)}
                         </div>
                       </div>
                     )
                   )
                 )}
               </div>
             </div>
           </div>
         </div>
 
         {/* AUTOMÁTICO X MANUAL */}
         <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
           <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
             <h3 className="text-sm font-black text-slate-900">
               Movimentos automáticos
             </h3>
 
             <div className="mt-3 space-y-2 text-xs">
               <div className="flex justify-between border-b border-slate-100 pb-2">
                 <span className="font-semibold text-slate-500">
                   Apropriado
                 </span>
 
                 <span className="font-black text-blue-700">
                   {moeda(
                     diagnostico.totalApropriadoAutomatico
                   )}
                 </span>
               </div>
 
               <div className="flex justify-between border-b border-slate-100 pb-2">
                 <span className="font-semibold text-slate-500">
                   Baixado
                 </span>
 
                 <span className="font-black text-emerald-700">
                   {moeda(
                     diagnostico.totalBaixadoAutomatico
                   )}
                 </span>
               </div>
 
               <div className="flex justify-between">
                 <span className="font-semibold text-slate-500">
                   Saldo
                 </span>
 
                 <span className="font-black text-red-600">
                   {moeda(
                     diagnostico.saldoAutomatico
                   )}
                 </span>
               </div>
             </div>
           </div>
 
           <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
             <h3 className="text-sm font-black text-slate-900">
               Movimentos manuais
             </h3>
 
             <div className="mt-3 space-y-2 text-xs">
               <div className="flex justify-between border-b border-amber-100 pb-2">
                 <span className="font-semibold text-slate-600">
                   Apropriações manuais
                 </span>
 
                 <span className="font-black text-blue-700">
                   {moeda(
                     diagnostico.totalApropriadoManual
                   )}
                 </span>
               </div>
 
               <div className="flex justify-between border-b border-amber-100 pb-2">
                 <span className="font-semibold text-slate-600">
                   Baixas manuais
                 </span>
 
                 <span className="font-black text-emerald-700">
                   {moeda(
                     diagnostico.totalBaixadoManual
                   )}
                 </span>
               </div>
 
               <div className="flex justify-between">
                 <span className="font-semibold text-slate-600">
                   Saldo manual líquido
                 </span>
 
                 <span
                   className={`font-black ${
                     diagnostico.saldoManual > 0
                       ? "text-red-600"
                       : "text-emerald-700"
                   }`}
                 >
                   {moeda(diagnostico.saldoManual)}
                 </span>
               </div>
             </div>
 
             <div className="mt-3 rounded-xl border border-amber-200 bg-white/70 px-3 py-2 text-[11px] font-semibold text-amber-800">
               Os movimentos manuais não possuem vínculo individual
               com uma conta a pagar. O saldo apresentado é líquido.
             </div>
           </div>
         </div>
 
         {/* PAGAMENTOS POR CONTA */}
         <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
           <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
             <div className="border-b border-blue-100 px-4 py-3">
               <h3 className="text-sm font-black text-slate-900">
                 Pagamentos por conta financeira
               </h3>
 
               <p className="text-[11px] font-semibold text-slate-500">
                 Bancos e caixas utilizados nas baixas.
               </p>
             </div>
 
             <div className="divide-y divide-slate-100">
               {diagnostico.pagamentosPorConta.length ===
               0 ? (
                 <div className="px-4 py-8 text-center text-xs font-semibold text-slate-400">
                   Nenhum pagamento encontrado.
                 </div>
               ) : (
                 diagnostico.pagamentosPorConta.map(
                   (item) => (
                     <div
                       key={item.conta}
                       className="flex items-center justify-between gap-3 px-4 py-3"
                     >
                       <div className="min-w-0">
                         <div className="truncate text-xs font-black text-slate-800">
                           {item.conta}
                         </div>
 
                         <div className="mt-0.5 text-[10px] font-semibold text-slate-500">
                           Automático{" "}
                           {moeda(item.automatico)}
                           {" • "}
                           Manual {moeda(item.manual)}
                         </div>
                       </div>
 
                       <div className="whitespace-nowrap text-sm font-black text-emerald-700">
                         {moeda(item.total)}
                       </div>
                     </div>
                   )
                 )
               )}
             </div>
           </div>
 
           {/* APROPRIAÇÕES POR CONTA */}
           <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
             <div className="border-b border-blue-100 px-4 py-3">
               <h3 className="text-sm font-black text-slate-900">
                 Apropriações por conta
               </h3>
 
               <p className="text-[11px] font-semibold text-slate-500">
                 Contas que deram origem às dívidas.
               </p>
             </div>
 
             <div className="divide-y divide-slate-100">
               {diagnostico.apropriacoesPorConta.length ===
               0 ? (
                 <div className="px-4 py-8 text-center text-xs font-semibold text-slate-400">
                   Nenhuma apropriação encontrada.
                 </div>
               ) : (
                 diagnostico.apropriacoesPorConta.map(
                   (item) => (
                     <div
                       key={item.conta}
                       className="flex items-center justify-between gap-3 px-4 py-3"
                     >
                       <div className="min-w-0">
                         <div className="truncate text-xs font-black text-slate-800">
                           {item.conta}
                         </div>
 
                         <div className="mt-0.5 text-[10px] font-semibold text-slate-500">
                           Automático{" "}
                           {moeda(item.automatico)}
                           {" • "}
                           Manual {moeda(item.manual)}
                         </div>
                       </div>
 
                       <div className="whitespace-nowrap text-sm font-black text-blue-700">
                         {moeda(item.total)}
                       </div>
                     </div>
                   )
                 )
               )}
             </div>
           </div>
         </div>
 
         <div className="flex justify-end">
           <button
             type="button"
             onClick={() => setAnaliseAberta(false)}
             className="h-10 rounded-xl bg-slate-900 px-5 text-xs font-black text-white transition hover:bg-slate-700"
           >
             Fechar análise
           </button>
         </div>
       </div>
     </div>
   </div>
 )}
     </div>
   );
 }