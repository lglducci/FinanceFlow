     import { useEffect, useMemo, useRef, useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { buildWebhookUrl } from "../config/globals";

 function hojeLocal() {
   const d = new Date();
   d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
   return d.toISOString().slice(0, 10);
 }

 function primeiroDiaMes() {
   const d = new Date();
   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
 }

 function moeda(valor) {
   return Number(valor || 0).toLocaleString("pt-BR", {
     style: "currency",
     currency: "BRL",
   });
 }

 function dataBR(data) {
   if (!data) return "-";

   const texto = String(data);

   // ISO: 2026-06-08T00:00:00.000Z ou 2026-06-08
   if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
     const [ano, mes, dia] = texto.slice(0, 10).split("-");
     return `${dia}/${mes}/${ano}`;
   }

   // Já está em BR
   if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return texto;

   return texto;
 }

 function normalizarRespostaWebhook(json) {
   const base = Array.isArray(json) ? json[0] : json;

   if (base?.json) return base.json;
   if (base?.data) return base.data;
   if (base?.body) return base.body;
   if (base?.retorno) return base.retorno;

   return base;
 }

 function montarResumoExtrato(linhas = []) {
   const entradas = linhas.reduce(
     (acc, l) => acc + (String(l.tipo || "").toLowerCase() === "entrada" ? Math.abs(Number(l.valor || 0)) : 0),
     0
   );

   const saidas = linhas.reduce(
     (acc, l) => acc + (String(l.tipo || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "saida" ? Math.abs(Number(l.valor || 0)) : 0),
     0
   );

   return {
     saldo_inicial: null,
     qtd_registros: linhas.length,
     entradas,
     saidas,
     saldo_final: null,
     linhas,
   };
 }


 function extrairExtratoBancario(retorno) {
   let atual = retorno;

   for (let i = 0; i < 10; i++) {
     if (!atual) break;

     if (Array.isArray(atual)) {
       if (atual.length === 0) return montarResumoExtrato([]);

       const primeiro = atual[0];
       const pareceListaDeMovimentos =
         primeiro &&
         typeof primeiro === "object" &&
         ("valor" in primeiro || "descricao" in primeiro || "data_movimento" in primeiro);

       if (pareceListaDeMovimentos) return montarResumoExtrato(atual);

       atual = primeiro;
       continue;
     }

     if (typeof atual !== "object") break;

     if (Array.isArray(atual.linhas)) {
       return {
         ...atual,
         linhas: atual.linhas,
         qtd_registros: atual.qtd_registros ?? atual.linhas.length,
       };
     }

     const chavesPossiveis = [
       "fn_extrato_bancario",
       "json",
       "data",
       "body",
       "retorno",
       "response",
       "result",
       "payload",
     ];

     const chave = chavesPossiveis.find((k) => atual?.[k] !== undefined && atual?.[k] !== null);
     if (chave) {
       atual = atual[chave];
       continue;
     }

     const valorComLinhas = Object.values(atual).find(
       (v) => v && typeof v === "object" && Array.isArray(v.linhas)
     );

     if (valorComLinhas) {
       atual = valorComLinhas;
       continue;
     }

     break;
   }

   return { linhas: [] };
 }

 export default function ExtratoBancario() {
   const navigate = useNavigate();

   const empresa_id =
     localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");

   const [aba, setAba] = useState("extrato");
   const [contas, setContas] = useState([]);
   const [indiceConta, setIndiceConta] = useState(0);
   const [dataIni, setDataIni] = useState(primeiroDiaMes());
   const [dataFim, setDataFim] = useState(hojeLocal());
   const [busca, setBusca] = useState("");

   const [loading, setLoading] = useState(false);
   const [erro, setErro] = useState("");

   const [extrato, setExtrato] = useState(null);
   const [razao, setRazao] = useState(null);
   const consultaRef = useRef(null);

   const contaAtual = contas[indiceConta] || null;




   useEffect(() => {
     carregarContas();
   }, []);

   // Trocar a conta ou o período apenas limpa a consulta; pesquisar é explícito.
   useEffect(() => {
     consultaRef.current?.abort();
     consultaRef.current = null;
     setExtrato(null);
     setRazao(null);
     setBusca("");
     setErro("");
     setLoading(false);
     return () => consultaRef.current?.abort();
   }, [contaAtual?.conta_id, contaAtual?.id, dataIni, dataFim]);

   async function carregarContas(atualizar = true, signal) {
     const url = buildWebhookUrl("consultasaldo", {
       inicio: dataIni, fim: dataFim, empresa_id, conta_id: 0,
     });
     try {
       const resp = await fetch(url, { method: "GET", signal });
       if (!resp.ok) throw new Error(`Erro ao consultar contas: ${resp.status}`);
       const data = await resp.json();
       const lista = Array.isArray(data) ? data : [];
       if (atualizar) setContas(lista);
       return lista;
     } catch (error) {
       if (!atualizar) throw error;
       console.error("Erro ao carregar contas:", error);
       setErro("Erro ao carregar contas bancárias.");
       return [];
     }
   }

   async function carregarDados() {
     if (!contaAtual || loading) return;
     if (!dataIni || !dataFim || dataIni > dataFim) {
       setErro("Informe um período válido para pesquisar.");
       return;
     }
     consultaRef.current?.abort();
     const controller = new AbortController();
     consultaRef.current = controller;
     const conta_id = contaAtual.conta_id || contaAtual.id;
     setLoading(true);
     setErro("");
     setExtrato(null);
     setRazao(null);
     try {
       const [dadosExtrato, dadosRazao, saldos] = await Promise.all([
         carregarExtrato(controller.signal),
         carregarRazao(controller.signal),
         carregarContas(false, controller.signal),
       ]);
       if (consultaRef.current !== controller || controller.signal.aborted) return;
       const saldoConta = saldos.find(c => String(c.conta_id || c.id) === String(conta_id));
       // Saldos são consultados para o mesmo período; nunca usar o saldo antigo do carrossel.
       setExtrato({ ...dadosExtrato, resumoConta: saldoConta });
       setRazao(dadosRazao);
     } catch (e) {
       if (consultaRef.current !== controller || controller.signal.aborted) return;
       controller.abort();
       console.error("ERRO EXTRATO BANCARIO:", e);
       setErro("Erro ao carregar a consulta. Clique em Pesquisar para tentar novamente.");
     } finally {
       if (consultaRef.current === controller) {
         consultaRef.current = null;
         setLoading(false);
       }
     }
   }

   async function carregarExtrato(signal) {
     const conta_id = contaAtual?.conta_id || contaAtual?.id;
     const resp = await fetch(buildWebhookUrl("extrato_bancario"), {
       method: "POST", signal,
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ empresa_id, conta_id, data_ini: dataIni, data_fim: dataFim }),
     });
     const texto = await resp.text();
     if (!resp.ok) throw new Error(`Webhook extrato_bancario retornou ${resp.status}: ${texto}`);
     return extrairExtratoBancario(texto ? JSON.parse(texto) : null);
   }

   async function carregarRazao(signal) {
     const respConta = await fetch(buildWebhookUrl("contabil_da_conta_corrente"), {
       method: "POST", signal,
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ empresa_id, conta_id: contaAtual.conta_id || contaAtual.id }),
     });
     if (!respConta.ok) throw new Error(`Erro ao consultar vínculo contábil: ${respConta.status}`);
     const retConta = await respConta.json();
     const conta_contabil_id = retConta?.[0]?.data?.[0]?.contabil_id ?? retConta?.data?.[0]?.contabil_id;
     if (!conta_contabil_id) return { linhas: [], qtd_registros: 0, semVinculo: true };
     const resp = await fetch(buildWebhookUrl("razao_por_conta"), {
       method: "POST", signal,
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ empresa_id, conta_id: conta_contabil_id, data_ini: dataIni, data_fim: dataFim }),
     });
     if (!resp.ok) throw new Error(`Erro ao consultar razão: ${resp.status}`);
     const json = await resp.json();
     const base = normalizarRespostaWebhook(json);
     const linhas = Array.isArray(json) ? json : Array.isArray(base) ? base
       : Array.isArray(base?.linhas) ? base.linhas : [];
     return { ...(Array.isArray(base) ? {} : base), linhas, qtd_registros: linhas.length };
   }

   function contaAnterior() {
     setIndiceConta((i) => Math.max(0, i - 1));
   }

   function proximaConta() {
     setIndiceConta((i) => Math.min(contas.length - 1, i + 1));
   }

   function aplicarPeriodo(dias) {
     const fim = new Date();
     const ini = new Date();
     ini.setDate(fim.getDate() - Number(dias));
     ini.setMinutes(ini.getMinutes() - ini.getTimezoneOffset());
     fim.setMinutes(fim.getMinutes() - fim.getTimezoneOffset());
     setDataIni(ini.toISOString().slice(0, 10));
     setDataFim(fim.toISOString().slice(0, 10));
   }

   const linhasExtrato = useMemo(() => {
     const linhas = Array.isArray(extrato)
       ? extrato
       : Array.isArray(extrato?.linhas)
       ? extrato.linhas
       : [];

     const termo = busca.trim().toLowerCase();
     if (!termo) return linhas;

     return linhas.filter((l) =>
       String(l.descricao || l.historico || "").toLowerCase().includes(termo)
     );
   }, [extrato, busca]);

   const linhasRazao = useMemo(() => {
     const linhas = Array.isArray(razao?.linhas) ? razao.linhas : [];
     const termo = busca.trim().toLowerCase();
     if (!termo) return linhas;
     return linhas.filter((l) => String(l.historico || l.descricao || "").toLowerCase().includes(termo));
   }, [razao, busca]);

   // Cards representam o período inteiro; a busca por histórico filtra só a tabela.
   const movimentosRazao = razao?.linhas || [];
   const primeiraLinhaRazao = movimentosRazao[0] || {};
   const ultimaLinhaRazao = movimentosRazao[movimentosRazao.length - 1] || {};
   const entradasRazao = movimentosRazao.reduce((acc, l) => acc + Math.max(Number(l.valor || 0), 0), 0);
   const saidasRazao = movimentosRazao.reduce((acc, l) => acc + Math.max(-Number(l.valor || 0), 0), 0);
   const saldoConta = extrato?.resumoConta;
   const resumoBanco = {
     saldoInicial: saldoConta?.saldo_inicial ?? extrato?.saldo_inicial ?? null,
     qtd: extrato?.qtd_registros ?? extrato?.linhas?.length ?? 0,
     entradas: saldoConta?.entradas_periodo ?? extrato?.entradas ?? 0,
     saidas: saldoConta?.saídas_periodo ?? saldoConta?.saidas_periodo ?? extrato?.saidas ?? 0,
     saldoFinal: saldoConta?.saldo_final ?? extrato?.saldo_final ?? null,
   };
   const saldoInicialRazao = razao?.saldo_inicial ?? primeiraLinhaRazao.saldo_inicial
     ?? (primeiraLinhaRazao.saldo_final != null
       ? Number(primeiraLinhaRazao.saldo_final) - Number(primeiraLinhaRazao.valor || 0) : null);
   const resumoRazao = {
     saldoInicial: saldoInicialRazao,
     qtd: razao?.qtd_registros ?? movimentosRazao.length,
     entradas: entradasRazao,
     saidas: saidasRazao,
     saldoFinal: razao?.saldo_final ?? ultimaLinhaRazao.saldo_final
       ?? (saldoInicialRazao != null ? Number(saldoInicialRazao) + entradasRazao - saidasRazao : null),
   };

   const diferenca = resumoBanco.saldoFinal - resumoRazao.saldoFinal;
   const diferencaRegistros = resumoBanco.qtd - resumoRazao.qtd;
   const diferencaEntradas = resumoBanco.entradas - resumoRazao.entradas;
   const diferencaSaidas = resumoBanco.saidas - resumoRazao.saidas;


   const conciliacaoLinhaLinha = useMemo(() => {
   const usadosRazao = new Set();
   const resultado = [];

   linhasExtrato.forEach((banco, idxBanco) => {
     const valorBanco = Number(banco.valor || 0);

     const idxRazao = linhasRazao.findIndex((razao, idx) => {
       if (usadosRazao.has(idx)) return false;

      const valorRazao = Number(razao.valor || 0);

 return Math.abs(Math.abs(valorBanco) - Math.abs(valorRazao)) < 0.01;
     });

     if (idxRazao >= 0) {
       usadosRazao.add(idxRazao);

       resultado.push({
         id: `ok-${idxBanco}-${idxRazao}`,
         status: "ok",
         banco,
         razao: linhasRazao[idxRazao],
       });
     } else {
       resultado.push({
         id: `banco-${idxBanco}`,
         status: "banco",
         banco,
         razao: null,
       });
     }
   });

   linhasRazao.forEach((razao, idxRazao) => {
     if (!usadosRazao.has(idxRazao)) {
       resultado.push({
         id: `razao-${idxRazao}`,
         status: "razao",
         banco: null,
         razao,
       });
     }
   });

   return resultado;
 }, [linhasExtrato, linhasRazao]);

  const totalConciliacao = conciliacaoLinhaLinha.length;

 const qtdConciliados = conciliacaoLinhaLinha.filter(
   (x) => x.status === "ok"
 ).length;

 const qtdSoBanco = conciliacaoLinhaLinha.filter(
   (x) => x.status === "banco"
 ).length;

 const qtdSoRazao = conciliacaoLinhaLinha.filter(
   (x) => x.status === "razao"
 ).length;

 const percentualConciliado = totalConciliacao
   ? (qtdConciliados * 100) / totalConciliacao
   : 100;

   return (
     <div className="min-h-screen bg-slate-50 px-2 py-2 text-slate-700">
       <div className="mx-auto w-full max-w-[1620px]">
         <div className="rounded-xl border border-slate-200 bg-[#f4f7fb] px-3 py-2 shadow-sm">
           <h2 className="mb-2 text-base font-bold text-slate-800">🏦 Extrato Bancário</h2>
           <div className="flex flex-wrap items-center gap-2">
             <div className="flex min-w-0 w-full items-center gap-1.5 lg:w-auto lg:flex-1 lg:min-w-[320px]">
               <button type="button" onClick={contaAnterior} disabled={indiceConta === 0} aria-label="Conta anterior" className="h-8 w-8 shrink-0 rounded-md border border-slate-300 bg-white text-base font-bold text-slate-600 hover:bg-slate-400 disabled:opacity-80">   ◀</button>
               <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-400 bg-white px-2">
                 {contaAtual ? (
                   <>
                     {contaAtual.icone_url ? <img src={contaAtual.icone_url} alt={contaAtual.banco_nome || contaAtual.nome} className="h-6 w-6 shrink-0 object-contain font-bold" /> : <span className="text-lg">🏦</span>}
                     <div className="flex min-w-0 flex-1 items-center gap-2 font-bold" title={`${contaAtual.nome || contaAtual.conta_nome || ""} • ${contaAtual.banco_nome || ""} • Banco ${contaAtual.nro_banco || "-"} • Ag. ${contaAtual.agencia || "-"} • Conta ${contaAtual.conta || "-"}`}>
                       <span className="shrink-0 max-w-[160px] truncate text-base font-bold text-slate-800">{contaAtual.nome || contaAtual.conta_nome}</span>
                       <span className="min-w-0 truncate text-[13px] text-slate-500">{contaAtual.banco_nome || "Banco"} · Ag. {contaAtual.agencia || "-"} · Conta {contaAtual.conta || "-"}</span>
                     </div>
                     <span className="shrink-0 text-[10px] text-slate-400">{indiceConta + 1}/{contas.length}</span>
                   </>
                 ) : <span className="text-xs text-slate-500">Nenhuma conta encontrada</span>}
               </div>
               <button type="button" onClick={proximaConta} disabled={!contas.length || indiceConta >= contas.length - 1} aria-label="Próxima conta" className="h-8 w-8 shrink-0 rounded-md border border-slate-300 bg-white text-base font-bold text-slate-600 hover:bg-slate-400 disabled:opacity-80">   ▶</button>
             </div>
             <div className="flex flex-wrap items-center gap-1.5">
               <label className="flex items-center gap-1 text-[12px] text-slate-700">
                 De <input type="date" value={dataIni} onChange={e => setDataIni(e.target.value)} className="h-8 w-[120px] rounded-md border border-slate-300 bg-white px-1.5 text-[11px] text-slate-700 outline-none focus:border-slate-500" />
               </label>
               <label className="flex items-center gap-1 text-[12px] text-slate-700">
                 Até <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="h-8 w-[120px] rounded-md border border-slate-300 bg-white px-1.5 text-[11px] text-slate-700 outline-none focus:border-slate-500" />
               </label>
               <div className="flex items-center gap-1">
                 {[7, 15, 30].map(dias => <button key={dias} type="button" onClick={() => aplicarPeriodo(dias)} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-600 hover:bg-slate-100">{dias}d</button>)}
               </div>
               <button type="button" onClick={carregarDados} disabled={loading || !contaAtual} className="h-8 rounded-md bg-[#526b8b] px-3 text-[11px] font-semibold text-white hover:bg-[#425a79] disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Pesquisando..." : "Pesquisar"}</button>
             </div>
           </div>
         </div>

         <div className="mt-2 grid grid-cols-1 gap-1.5 text-base text-base font-bold">
           <ResumoSaldos titulo="Extrato" resumo={resumoBanco} consultado={!!extrato} />
           <ResumoSaldos titulo="Razão" resumo={resumoRazao} consultado={!!razao && !razao.semVinculo} />
         </div>
         {!loading && !extrato && !erro && (
           <div className="mt-3 text-sm text-slate-500">Selecione a conta e o período e clique em Pesquisar.</div>
         )}
         {razao?.semVinculo && <div className="mt-3 text-xs text-slate-500">Esta conta bancária não possui vínculo com uma conta contábil.</div>}

         {erro && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">{erro}</div>}

         <div className="mt-2 flex flex-wrap items-center gap-1.5 text-base font-bold">
           <Aba ativo={aba === "extrato"} onClick={() => setAba("extrato")}>Extrato</Aba>
           <Aba ativo={aba === "razao"} onClick={() => setAba("razao")}>Razão</Aba>
           <input value={busca} onChange={e => setBusca(e.target.value)} aria-label="Buscar histórico" placeholder="Buscar histórico, PIX, fornecedor..." className="ml-auto h-8 w-full sm:w-[300px] rounded-md border border-slate-300 bg-white px-2 text-[11px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-slate-500" />
           {/* Abas temporariamente ocultas:
           <Aba ativo={aba === "comparacao"} onClick={() => setAba("comparacao")}>Comparação</Aba>
          <Aba ativo={aba === "conciliacao"} onClick={() => setAba("conciliacao")}> Conciliação </Aba>
          <Aba ativo={aba === "linha"} onClick={() => setAba("linha")}>  Linha a Linha </Aba>
           */}das

         </div>

         {loading && <div className="mt-4 rounded-xl bg-white p-4 font-medium text-slate-500">Carregando...</div>}

         {!loading && extrato && aba === "extrato" && <TabelaExtrato linhas={linhasExtrato} />}
         {!loading && razao && aba === "razao" && <TabelaRazao linhas={linhasRazao} />}
         {/* Painéis das abas temporariamente ocultas:
         {!loading && aba === "comparacao" && (
           <Comparacao resumoBanco={resumoBanco} resumoRazao={resumoRazao} diferenca={diferenca} diferencaRegistros={diferencaRegistros} diferencaEntradas={diferencaEntradas} diferencaSaidas={diferencaSaidas} contaAtual={contaAtual} />
         )}

         {!loading && aba === "conciliacao" && (
             <Conciliacao
               resumoBanco={resumoBanco}
               resumoRazao={resumoRazao}
               diferenca={diferenca}
               diferencaRegistros={diferencaRegistros}
               diferencaEntradas={diferencaEntradas}
               diferencaSaidas={diferencaSaidas}
             />
           )}


           {!loading && aba === "linha" && (
           <ConciliacaoLinhaLinha
             dados={conciliacaoLinhaLinha}
             total={totalConciliacao}
             conciliados={qtdConciliados}
             soBanco={qtdSoBanco}
             soRazao={qtdSoRazao}
             percentual={percentualConciliado}
           />
         )}
         */}
       </div>
     </div>
   );
 }

 // Ambos os resumos usam a mesma ordem: saldo inicial, entradas, saídas e saldo final.
 function ResumoSaldos({ titulo, resumo, consultado }) {
   const cards = [
     { label: "Saldo inicial", valor: resumo.saldoInicial },
     { label: "Entradas", valor: resumo.entradas },
     { label: "Saídas", valor: resumo.saidas },
     { label: "Saldo final", valor: resumo.saldoFinal },
   ];
   return (
     <section className="flex items-center rounded-lg border border-slate-400 bg-white px-2 py-1.5 font-bol">
       <h3 className="w-14 shrink-0 text-sm font-bold text-slate-800">{titulo}</h3>
       <div className="grid min-w-0 flex-1 grid-cols-2 sm:grid-cols-4 gap-y-1">
         {cards.map(card => (
           <div key={card.label} className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-2 border-l border-slate-200 px-2 sm:px-3">
             <span className="text-[12px] font-bold text-slate-500">{card.label}</span>
             <span className={`text-xs font-bold tabular-nums ${consultado && card.valor != null && Number(card.valor) < 0 ? "text-red-600" : "text-slate-800"}`}>
               {consultado && card.valor != null ? moeda(card.valor) : "—"}
             </span>
           </div>
         ))}
       </div>
     </section>
   );
 }

 function Aba({ ativo, onClick, children }) {
   return (
     <button
       onClick={onClick}
       className={`h-8 px-3 rounded-md border font-semibold text-[11px] transition ${
         ativo ? "bg-[#e8eef6] border-[#bfccdc] text-[#334e70]" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
       }`}
     >
       {children}
     </button>
   );
 }

 function TabelaExtrato({ linhas }) {
   return (
     <div className="mt-2 rounded-xl border border-slate-200 bg-white overflow-hidden">
       <div className="grid grid-cols-[1fr_130px_160px_110px_130px_160px_130px_130px] gap-2 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
         <div>Descrição</div>
         <div>Data Movimento</div>
         <div>Conta</div>
         <div>Tipo</div>
         <div>Origem</div>
         <div>Classificação</div>
         <div>Forma</div>
         <div className="text-right">Valor</div>
       </div>

       <div className="max-h-[560px] overflow-y-auto">
         {linhas.map((l, idx) => (
           <div key={l.id || idx} className="grid grid-cols-[1fr_130px_160px_110px_130px_160px_130px_130px] gap-2 border-b border-slate-100 px-4 py-2 text-xs items-center even:bg-slate-50/70 hover:bg-slate-100/70">
             <div className="font-semibold text-slate-800">{l.descricao || l.historico}</div>
             <div className="font-medium">{dataBR(l.data_movimento || l.data_mov)}</div>
             <div>{l.conta_nome || l.conta || "-"}</div>
             <div className={l.tipo === "entrada" ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>{l.tipo || "-"}</div>
             <div><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">{l.origem || "Financeiro"}</span></div>
             <div className="font-medium">{l.classificacao || "-"}</div>
             <div>{l.forma_pagamento || l.forma || "-"}</div>
             <div className="text-right font-semibold">{moeda(l.valor)}</div>
           </div>
         ))}

         {linhas.length === 0 && <div className="p-8 text-center font-medium text-slate-400">Nenhum movimento encontrado.</div>}
       </div>
     </div>
   );
 }

  function TabelaRazao({ linhas }) {
  function dataBR2(data) {
    if (!data) return "-";

    const d = String(data).split("T")[0];
    const [ano, mes, dia] = d.split("-");

    return `${dia}-${mes}-${ano}`;
  }

  const colunas =
    "grid-cols-[90px_minmax(280px,1fr)_200px_120px_120px_130px]";

  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[1100px]">
          {/* Cabeçalho */}
          <div
            className={`grid ${colunas} gap-2 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700`}
          >
            <div>Data</div>
            <div>Histórico</div>
            <div>Conta</div>
            <div className="text-right">Valor</div>
            <div className="text-right">Saldo</div>
            <div className="text-center" >Origem</div>
          </div>

          {/* Linhas */}
          <div className="max-h-[560px] overflow-y-auto">
            {linhas.map((l, idx) => {
              const origem =
                String(l.origem ?? "").trim() || "-";

              return (
                <div
                  key={l.id || idx}
                  className={`grid ${colunas} gap-2 border-b border-slate-100 px-4 py-2 text-xs items-center even:bg-slate-50/70 hover:bg-slate-100/70`}
                >
                  <div className="font-medium whitespace-nowrap">
                    {dataBR2(l.data_mov || l.data_lanc || l.data)}
                  </div>

                  <div
                    className="font-semibold text-slate-800 truncate"
                    title={l.historico || ""}
                  >
                    {l.historico || "-"}
                  </div>

                  <div
                    className="truncate"
                    title={
                      l.conta_contrapartida ||
                      l.conta_nome ||
                      l.conta ||
                      ""
                    }
                  >
                    {l.conta_contrapartida ||
                      l.conta_nome ||
                      l.conta ||
                      "-"}
                  </div>

                  <div
                    className={`text-right font-semibold ${
                      Number(l.valor || 0) < 0
                        ? "text-red-600"
                        : "text-emerald-700"
                    }`}
                  >
                    {moeda(l.valor || 0)}
                  </div>

                  <div
                    className={`text-right font-semibold ${
                      Number(l.saldo_final || 0) < 0
                        ? "text-red-600"
                        : "text-emerald-700"
                    }`}
                  >
                    {moeda(l.saldo_final || 0)}
                  </div>

                  <div
                    className="truncate text-xs font-semibold text-slate-500  text-center"
                    title={origem}
                  >
                    {origem}
                  </div>
                </div>
              );
            })}

            {linhas.length === 0 && (
              <div className="p-8 text-center font-medium text-slate-400">
                Nenhum lançamento contábil encontrado.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

 function Comparacao({ resumoBanco, resumoRazao, diferenca, diferencaRegistros, diferencaEntradas, diferencaSaidas, contaAtual }) {
   return (
     <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
       <CardComparacao titulo="Banco" itens={[
         ["Saldo inicial", moeda(resumoBanco.saldoInicial)],
         ["Registros", resumoBanco.qtd],
         ["Entradas", moeda(resumoBanco.entradas)],
         ["Saídas", moeda(resumoBanco.saidas)],
         ["Saldo final", moeda(resumoBanco.saldoFinal)],
       ]} />

       <CardComparacao titulo="Razão Contábil" subtitulo={contaAtual?.contabil_codigo || contaAtual?.codigo_contabil || "Conta contábil vinculada"} itens={[
         ["Saldo inicial", moeda(resumoRazao.saldoInicial)],
         ["Registros", resumoRazao.qtd],
         ["Entradas", moeda(resumoRazao.entradas)],
         ["Saídas", moeda(resumoRazao.saidas)],
         ["Saldo final", moeda(resumoRazao.saldoFinal)],
       ]} />

       <div className="rounded-2xl border bg-white p-5 shadow-sm">
         <div className="text-sm font-black text-slate-500 uppercase">Diferenças</div>

         <div className="mt-4 space-y-3">
           <LinhaDiferenca label="Registros" valor={diferencaRegistros} tipo="numero" />
           <LinhaDiferenca label="Entradas" valor={diferencaEntradas} />
           <LinhaDiferenca label="Saídas" valor={diferencaSaidas} />
           <LinhaDiferenca label="Saldo final" valor={diferenca} destaque />
         </div>

         <div className="mt-4 text-sm font-bold text-slate-500">
           {Math.abs(diferenca) < 0.01 && Math.abs(diferencaRegistros) === 0
             ? "Banco e razão estão batendo no período."
             : "Existe diferença entre banco e razão no período."}
         </div>
       </div>
     </div>
   );
 }

 function LinhaDiferenca({ label, valor, tipo = "moeda", destaque = false }) {
   const numero = Number(valor || 0);
   const ok = Math.abs(numero) < 0.01;

   return (
     <div className={`flex justify-between border-b pb-2 ${destaque ? "text-base" : "text-sm"}`}>
       <span className="font-bold text-slate-500">{label}</span>
       <span className={`font-black ${ok ? "text-emerald-700" : "text-red-600"}`}>
         {tipo === "numero" ? numero : moeda(numero)}
       </span>
     </div>
   );
 }


 function ConciliacaoLinhaLinha({
   dados,
   total,
   conciliados,
   soBanco,
   soRazao,
   percentual,
 }) {
   return (
     <div className="mt-3 space-y-4">
       <div className="rounded-3xl border bg-white p-5 shadow-sm">
         <div className="flex items-center justify-between gap-4">
           <div>
             <div className="text-sm font-black uppercase text-slate-500">
               Conciliação Linha a Linha
             </div>
             <div className="mt-1 text-3xl font-black text-[#061f4a]">
               {percentual.toFixed(1)}%
             </div>
             <div className="text-sm font-bold text-slate-500">
               dos movimentos conciliados automaticamente
             </div>
           </div>

           <div className="w-72">
             <div className="h-4 overflow-hidden rounded-full bg-slate-200">
               <div
                 className="h-full rounded-full bg-emerald-500"
                 style={{ width: `${Math.min(100, percentual)}%` }}
               />
             </div>
           </div>
         </div>
       </div>

       <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
         <MiniCard titulo="Total" valor={total} />
         <MiniCard titulo="Conciliados" valor={conciliados} verde />
         <MiniCard titulo="Só no Banco" valor={soBanco} vermelho />
         <MiniCard titulo="Só no Razão" valor={soRazao} vermelho />
       </div>

       <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
         <div className="grid grid-cols-[140px_1fr_1fr] gap-2 bg-gray-200 px-4 py-2 text-sm font-black text-slate-700">
           <div>Status</div>
           <div>Banco</div>
           <div>Razão</div>
         </div>

         <div className="max-h-[620px] overflow-y-auto">
           {dados.map((item) => (
             <div
               key={item.id}
               className="grid grid-cols-[140px_1fr_1fr] gap-2 border-b px-4 py-3 text-sm hover:bg-sky-50"
             >
               <div className="font-black">
                 {item.status === "ok" && (
                   <span className="text-emerald-700">✅ Conciliado</span>
                 )}
                 {item.status === "banco" && (
                   <span className="text-red-600">❌ Só Banco</span>
                 )}
                 {item.status === "razao" && (
                   <span className="text-red-600">❌ Só Razão</span>
                 )}
               </div>

               <MovimentoResumo mov={item.banco} />
               <MovimentoResumo mov={item.razao} />
             </div>
           ))}

           {dados.length === 0 && (
             <div className="p-8 text-center font-bold text-slate-400">
               Nenhum movimento para conciliar.
             </div>
           )}
         </div>
       </div>
     </div>
   );
 }

 function MovimentoResumo({ mov }) {
   if (!mov) {
     return <div className="font-bold text-slate-400">—</div>;
   }

   return (
     <div>
       <div className="font-black text-slate-800">
         {mov.descricao || mov.historico || "Sem histórico"}
       </div>
       <div className="mt-1 text-xs font-bold text-slate-500">
         {dataBR(mov.data_movimento || mov.data_mov || mov.data_lanc || mov.data)}
       </div>
       <div
         className={`mt-1 font-black ${
           Number(mov.valor || 0) < 0 ? "text-red-600" : "text-emerald-700"
         }`}
       >
         {moeda(mov.valor || 0)}
       </div>
     </div>
   );
 }

 function MiniCard({ titulo, valor, verde = false, vermelho = false }) {
   return (
     <div className="rounded-2xl border bg-white p-5 shadow-sm">
       <div className="text-xs font-black uppercase text-slate-400">{titulo}</div>
       <div
         className={`mt-2 text-3xl font-black ${
           verde ? "text-emerald-700" : vermelho ? "text-red-600" : "text-[#061f4a]"
         }`}
       >
         {valor}
       </div>
     </div>
   );
 }

 function Conciliacao({
   resumoBanco,
   resumoRazao,
   diferenca,
   diferencaRegistros,
   diferencaEntradas,
   diferencaSaidas,
 }) {
   const okSaldo = Math.abs(Number(diferenca || 0)) < 0.01;
   const okEntradas = Math.abs(Number(diferencaEntradas || 0)) < 0.01;
   const okSaidas = Math.abs(Number(diferencaSaidas || 0)) < 0.01;
   const okRegistros = Number(diferencaRegistros || 0) === 0;

   const tudoOk = okSaldo && okEntradas && okSaidas && okRegistros;

   return (
     <div className="mt-3 space-y-4">
       <div
         className={`rounded-3xl border p-6 shadow-sm ${
           tudoOk
             ? "bg-emerald-50 border-emerald-200"
             : "bg-red-50 border-red-200"
         }`}
       >
         <div className={`text-2xl font-black ${tudoOk ? "text-emerald-700" : "text-red-700"}`}>
           {tudoOk ? "✅ CONCILIAÇÃO OK" : "🔴 CONCILIAÇÃO COM DIVERGÊNCIAS"}
         </div>

         <div className="mt-2 text-sm font-bold text-slate-600">
           Comparação entre conta corrente e razão contábil no período selecionado.
         </div>
       </div>

       <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
         <CardStatus titulo="Saldo Final" ok={okSaldo} detalhe={moeda(diferenca)} />
         <CardStatus titulo="Entradas" ok={okEntradas} detalhe={moeda(diferencaEntradas)} />
         <CardStatus titulo="Saídas" ok={okSaidas} detalhe={moeda(diferencaSaidas)} />
         <CardStatus titulo="Registros" ok={okRegistros} detalhe={diferencaRegistros} tipo="numero" />
       </div>

       <div className="rounded-2xl border bg-white p-5 shadow-sm">
         <div className="text-sm font-black uppercase text-slate-500">
           Diagnóstico da Conciliação
         </div>

         <div className="mt-4 space-y-3">
           <LinhaDiagnostico ok={okSaldo} texto="Saldo final confere" />
           <LinhaDiagnostico ok={okEntradas} texto="Entradas conferem" />
           <LinhaDiagnostico ok={okSaidas} texto="Saídas conferem" />
           <LinhaDiagnostico ok={okRegistros} texto="Quantidade de registros confere" />
         </div>
       </div>

       <div className="rounded-2xl border bg-white p-5 shadow-sm">
         <div className="text-sm font-black uppercase text-slate-500">
           Possíveis causas
         </div>

         <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
           <Causa texto="Movimento financeiro ainda não contabilizado" />
           <Causa texto="Lançamento contábil sem movimento financeiro" />
           <Causa texto="Diferença de período entre banco e razão" />
           <Causa texto="Estorno ou lançamento duplicado" />
           <Causa texto="Valor divergente entre financeiro e contábil" />
           <Causa texto="Conta contábil vinculada incorretamente" />
         </div>
       </div>
     </div>
   );
 }

 function CardStatus({ titulo, ok, detalhe, tipo = "moeda" }) {
   return (
     <div className="rounded-2xl border bg-white p-5 shadow-sm">
       <div className="text-xs font-black uppercase text-slate-400">{titulo}</div>
       <div className={`mt-2 text-xl font-black ${ok ? "text-emerald-700" : "text-red-600"}`}>
         {ok ? "OK" : "Divergente"}
       </div>
       <div className="mt-1 text-sm font-bold text-slate-500">
         Diferença: {tipo === "numero" ? detalhe : detalhe}
       </div>
     </div>
   );
 }

 function LinhaDiagnostico({ ok, texto }) {
   return (
     <div className="flex items-center justify-between border-b pb-2 text-sm">
       <span className="font-bold text-slate-600">{texto}</span>
       <span className={`font-black ${ok ? "text-emerald-700" : "text-red-600"}`}>
         {ok ? "✔ OK" : "✘ Verificar"}
       </span>
     </div>
   );
 }

 function Causa({ texto }) {
   return (
     <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
       ☐ {texto}
     </div>
   );
 }


 function CardComparacao({ titulo, subtitulo, itens }) {
   return (
     <div className="rounded-2xl border bg-white p-5 shadow-sm">
       <div className="text-sm font-black text-slate-500 uppercase">{titulo}</div>
       {subtitulo && <div className="mt-1 text-xs font-bold text-slate-400">{subtitulo}</div>}
       <div className="mt-4 space-y-3">
         {itens.map(([label, valor]) => (
           <div key={label} className="flex justify-between border-b pb-2 text-sm">
             <span className="font-bold text-slate-500">{label}</span>
             <span className="font-black text-slate-800">{valor}</span>
           </div>
         ))}
       </div>
     </div>
   );
 }
