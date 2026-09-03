 import { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
 
import { useLocation } from "react-router-dom";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
import ExcelExport from "../utils/ExcelExport";


const empresa_id =
  localStorage.getItem("empresa_id") ||
  localStorage.getItem("id_empresa") ||
  "0";


export default function RelatoriosRazao() {
  const hoje = new Date().toISOString().slice(0, 10);

  const [empresaId, setEmpresaId] = useState(null);
  const [dataIni, setDataIni] = useState(hojeMaisDias(-7));
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [contaId, setContaId] = useState("");
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
 const [mostrarZeradas, setMostrarZeradas] = useState(false);
 const [tipo, setTipo] = useState("c"); // r = detalhado (default)
 const [textoConta, setTextoConta] = useState("");
  const [contas, setContas] = useState([]);
 const [filtroHistorico, setFiltroHistorico] = useState("");

  
  const location = useLocation();
 const navigate = useNavigate();
 


 const normalizarTexto = (texto) =>
  String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const dadosFiltrados = dados.filter((linha) => {
  const passouFiltroZeradas =
    mostrarZeradas || !linhaZerada(linha);

  const passouFiltroHistorico =
    !filtroHistorico.trim() ||
    normalizarTexto(linha.historico).includes(
      normalizarTexto(filtroHistorico)
    );

  return passouFiltroZeradas && passouFiltroHistorico;
});


 const movimentosConta = dadosFiltrados.filter(
  (l) => l.historico !== "TOTAL DA CONTA"
);

const saldoInicialPeriodo =
  tipo === "c" && dados.length > 0
    ? Number(dados[0]?.saldo_inicial || 0)
    : 0;

const entradasPeriodo =
  tipo === "c"
    ? movimentosConta.reduce((total, l) => {
        const valor = Number(l.valor || 0);
        return valor > 0 ? total + valor : total;
      }, 0)
    : 0;

const saidasPeriodo =
  tipo === "c"
    ? movimentosConta.reduce((total, l) => {
        const valor = Number(l.valor || 0);
        return valor < 0 ? total + Math.abs(valor) : total;
      }, 0)
    : 0;

const movimentacaoPeriodo = entradasPeriodo - saidasPeriodo;

 
const saldoFinalPeriodo =
  saldoInicialPeriodo +
  dados
    .filter((l) => l.historico !== "TOTAL DA CONTA")
    .reduce((total, l) => total + Number(l.valor || 0), 0);

  // formatter BR
  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
 
  function formatarData(data) {
  if (!data) return "";

  const d = data.split("T")[0]; // pega só a data
  const [ano, mes, dia] = d.split("-");

  return `${dia}/${mes}/${ano}`;
}
useEffect(() => {
    async function carregarContas() {
      const r = await fetch(
        buildWebhookUrl("contas_contabeis_lancaveis", { empresa_id })
      );
      const j = await r.json();
      setContas(j || []);
    }
    carregarContas();
  }, [empresa_id]);


async function consultarComParams({  webhook, empresa_id, data_ini, data_fim, filtro }) {

  
 if (
  webhook === "razao_por_conta" &&
  (!contaId || contaId === "[]" || isNaN(Number(contaId)))
) {
  alert("Conta inválida.");
  return;
}

  setLoading(true);
  setDados([]); 

  try {
    const resp = await fetch(buildWebhookUrl(webhook), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        data_ini,
        data_fim,
        conta_id:contaId,
        filtro: filtro || ""  
      }),
    });

    const json = await resp.json();
    setDados(Array.isArray(json) ? json : []);
  } catch (e) {
    alert("Erro ao carregar a razão");
  } finally {
    setLoading(false);
  }
}

 useEffect(() => {
  const emp =
    Number(localStorage.getItem("id_empresa") || localStorage.getItem("empresa_id") || 0);

  if (!emp) return;

  const st = location.state;
  if (!st?.conta) return; // abriu direto / sem drilldown

  // atualiza os campos da tela (opcional)
  setEmpresaId(emp);
  setContaId(st.conta);
  setDataIni(st.dataIni || dataIni);
  setDataFim(st.dataFim || dataFim);

  // ✅ CHAMA O WEBHOOK DIRETO COM OS PARAMS VINDOS DO BALANÇO
  consultarComParams({
    empresa_id: emp,
    data_ini: st.dataIni || dataIni,
    data_fim: st.dataFim || dataFim,
    filtro: st.conta,
    conta_id:st.conta
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [location.state]);

 async function consultar() {
  const emp = Number(empresaId || localStorage.getItem("id_empresa") || localStorage.getItem("empresa_id") || 0);
  if (!emp) return alert("Empresa não carregada");
  let webhook = "razao"; // default

  if (tipo === "d") webhook = "razao_diario";
  if (tipo === "m") webhook = "razao_mensal";
  if (tipo === "c") webhook = "razao_por_conta";

    


  return consultarComParams({
     webhook,
    empresa_id: emp,
    data_ini: dataIni,
    data_fim: dataFim,
    filtro: contaId,
  });
}


function trocarTipo(novoTipo) {
  setTipo(novoTipo);

  // 🔥 LIMPA TUDO
  setDados([]);
  setLoading(false);
  setContaId("");
  setFiltroHistorico("");
  // se tiver:
  // setTotais(null);
  // setSelecionado(null);
}

function linhaZerada(l) {
  return (
    Number(l.saldo_inicial || 0) === 0 &&
    Number(l.debito || 0) === 0 &&
    Number(l.credito || 0) === 0 &&
      Number(l.valor || 0) === 0 &&
    Number(l.saldo || 0) === 0  
  );
}

  function handleChange(e) {
    const valorDigitado = e.target.value;
    setTexto(valorDigitado);

    // Busca a conta pelo texto digitado (sem mostrar ID)
    const conta = contas.find(
      (c) =>
        `${c.codigo} - ${c.nome}`.toLowerCase() === valorDigitado.toLowerCase()
    );

    // Se achou, envia o ID real
    if (conta) {
      setContaId(conta.id); // <-- AQUI ENVIA SÓ O ID REAL
    } else {
      setContaId(""); // limpa se não achou
    }
  }

 function exportarExcel() {
 
  const dadosExcel = dadosFiltrados.map((l) => ({
      Data: formatarData(l.data_mov || l.data),
      Conta: l.conta_codigo ? `${l.conta_codigo} - ${l.conta_nome || ""}` : "",
      Contrapartida: l.conta_contrapartida || "",
      Historico: l.historico || "",
      SaldoInicial: Number(l.saldo_inicial ?? 0),
      Debito: Number(l.debito ?? 0),
      Credito: Number(l.credito ?? 0),
      Valor: Number(l.valor ?? 0),
      Saldo: Number(l.saldo_final ?? l.saldo ?? 0),
      Lote: l.lote_id ?? "",
      Lancamento: l.id ?? "",
      MesAno: l.mes_ano ?? "",
    }));

  ExcelExport.exportar(dadosExcel, "razao_contabil.xlsx");
}
return (
  <div className="min-h-screen bg-slate-50 p-4 md:p-6">
    <div className="mx-auto max-w-[1600px] space-y-5">
      {/* HEADER */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              📒 Razão Contábil
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Consulte movimentações, saldos e exporte o relatório contábil.
            </p>
          </div>

          <button
            onClick={() => navigate("/reports")}
            className="btn-pill btn-white flex items-center gap-2"
          >
            ← Voltar
          </button>
        </div>

        {/* FILTROS */}
        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[150px_150px_360px_minmax(240px,1fr)]">
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Data inicial
                </label>
                <input
                  type="date"
                  value={dataIni}
                  onChange={(e) => setDataIni(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Data final
                </label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {tipo === "c" ? (
               <div className="md:col-span-2 xl:col-span-1">
                  <label
                    htmlFor="conta-especifica"
                    className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500"
                  >
                    Conta específica
                  </label>

                  <input
                    id="conta-especifica"
                    list="lista-contas"
                    placeholder="Digite código ou nome da conta"
                    value={textoConta}
                    onChange={(e) => {
                      const texto = e.target.value;
                      setTextoConta(texto);

                      const conta = contas.find(
                        (c) =>
                          `${c.codigo} - ${c.nome}`.toLowerCase() ===
                          texto.toLowerCase()
                      );

                      setContaId(conta?.id || "");
                    }}
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <datalist id="lista-contas">
                    {contas.map((conta) => (
                      <option
                        key={conta.id}
                        value={`${conta.codigo} - ${conta.nome}`}
                      />
                    ))}
                  </datalist>
                </div>
              ) : (
                <div className="md:col-span-2 xl:col-span-1">
                  <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">
                    Conta opcional
                  </label>
                  <input
                    type="text"
                    placeholder="Código ou nome"
                    value={contaId}
                    onChange={(e) => setContaId(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              )}
           
            {tipo !== "m" && (
            <div className="md:col-span-2 xl:col-span-1">
              <label
                htmlFor="filtro-historico"
                className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500"
              >
                Histórico
              </label>

              <div className="relative">
                <input
                  id="filtro-historico"
                  type="text"
                  placeholder="Filtrar histórico..."
                  value={filtroHistorico}
                  onChange={(e) => setFiltroHistorico(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 pr-9 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                {filtroHistorico && (
                  <button
                    type="button"
                    onClick={() => setFiltroHistorico("")}
                    title="Limpar filtro"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400 hover:text-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            
          )}
           </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">


              
              <button onClick={consultar} className="btn-pill btn-white flex items-center gap-2">
                🔎 Consultar
              </button>

              <button onClick={() => window.print()} className="btn-pill btn-white flex items-center gap-2">
                🖨️ Imprimir
              </button>

              <button onClick={exportarExcel} className="btn-pill btn-white flex items-center gap-2">
                📊 Excel
              </button>
            </div>
          </div>

          {/* OPÇÕES */}
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            {[
              ["c", "Razão Conta"],
              ["r", "Razão detalhado"],
              ["d", "Sintético diário"],
              ["m", "Sintético mensal"],
            ].map(([value, label]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition ${
                  tipo === value
                    ? "border-blue-600 bg-blue-600 text-white shadow"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                }`}
              >
                <input
                  type="radio"
                  name="tipoRelatorio"
                  checked={tipo === value}
                  onChange={() => trocarTipo(value)}
                  className="hidden"
                />
                {label}
              </label>
            ))}

            <label className="ml-auto flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600">
              <input
                type="checkbox"
                checked={!mostrarZeradas}
                onChange={() => setMostrarZeradas(!mostrarZeradas)}
              />
              Ocultar contas sem movimento
            </label>
          </div>
        </div>
      </div>

 <div id="print-area" className="space-y-4"> 
      {tipo === "c" && dados.length > 0 && (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">

    {/* SALDO INICIAL */}
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-black uppercase tracking-wide text-slate-500">
        Saldo inicial
      </div>

      <div
        className={`mt-1 text-xl font-black ${
          saldoInicialPeriodo < 0
            ? "text-red-600"
            : "text-slate-800"
        }`}
      >
        {fmt.format(saldoInicialPeriodo)}
      </div>

      <div className="mt-1 text-[11px] font-semibold text-slate-400">
        Saldo real antes de {formatarData(dataIni)}
      </div>
    </div>

    {/* ENTRADAS */}
    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 shadow-sm">
      <div className="text-xs font-black uppercase tracking-wide text-green-700">
        Entradas
      </div>

      <div className="mt-1 text-xl font-black text-green-700">
        {fmt.format(entradasPeriodo)}
      </div>

      <div className="mt-1 text-[11px] font-semibold text-green-600">
         {filtroHistorico ? "No histórico filtrado" : "No período"}
      </div>
    </div>

    {/* SAÍDAS */}
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
      <div className="text-xs font-black uppercase tracking-wide text-red-700">
        Saídas
      </div>

      <div className="mt-1 text-xl font-black text-red-600">
        {fmt.format(saidasPeriodo)}
      </div>

      <div className="mt-1 text-[11px] font-semibold text-red-500">
        No período
      </div>
    </div>

    {/* MOVIMENTAÇÃO */}
    <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm">
      <div className="text-xs font-black uppercase tracking-wide text-blue-700">
        Movimentação do período
      </div>

      <div
        className={`mt-1 text-xl font-black ${
          movimentacaoPeriodo < 0
            ? "text-red-600"
            : "text-blue-700"
        }`}
      >
        {fmt.format(movimentacaoPeriodo)}
      </div>

      <div className="mt-1 text-[11px] font-semibold text-blue-500">
       {filtroHistorico
  ? "Resultado do histórico filtrado"
  : "Entradas − Saídas"}
      </div>
    </div>

    {/* SALDO FINAL */}
    <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 shadow-sm">
      <div className="text-xs font-black uppercase tracking-wide text-slate-600">
        Saldo final
      </div>

      <div
        className={`mt-1 text-xl font-black ${
          saldoFinalPeriodo < 0
            ? "text-red-600"
            : "text-green-700"
        }`}
      >
        {fmt.format(saldoFinalPeriodo)}
      </div>

      <div className="mt-1 text-[11px] font-semibold text-slate-500">
       Saldo real em {formatarData(dataFim)}
      </div>
    </div>

  </div>
)}

      {/* TABELA */}
     <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-2 py-1">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-slate-800">
                Resultado
              </h2>

              <span className="text-sm font-black text-slate-600">
                — Período: {formatarData(dataIni)} a {formatarData(dataFim)}
              </span>
            </div>

            <p className="text-xs font-semibold leading-none text-slate-500">
              {loading
                ? "Carregando dados..."
               : `${dadosFiltrados.length} registro(s)`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          
             <table className="w-full min-w-[980px] print:w-full print:min-w-[980px] border-separate border-spacing-0 text-[15px]">
            <thead>
              <tr className="bg-slate-900 text-white">
                {tipo !== "m" && (
                  <th className="sticky top-0 px-2 py-1.5 text-left text-[13px] font-black uppercase tracking-wide">
                    Data
                  </th>
                )}

                {tipo === "m" && (
                  <th className="sticky top-0 px-2 py-1.5 text-left text-[13px] font-black uppercase tracking-wide">
                    Mês/Ano
                  </th>
                )}

                {tipo !== "c" && (
                  <th className="sticky top-0 px-2 py-1.5 text-left text-[13px] font-black uppercase tracking-wide">
                    Conta
                  </th>
                )}

                {tipo === "c" && (
                  <th className="sticky top-0 px-2 py-1.5 text-left text-[13px] font-black uppercase tracking-wide">
                    Contrapartida
                  </th>
                )}

                {tipo !== "m" && (
                   <th className="sticky top-0 w-[38%] px-2 py-1.5 text-left text-[13px] font-black uppercase tracking-wide">
                    Histórico
                  </th>
                )}

                {tipo !== "c" && (
                  <th className="sticky top-0 px-2 py-1.5 text-right text-[13px] font-black uppercase tracking-wide">
                    Saldo inicial
                  </th>
                )}

                {!["r", "c", "m"].includes(tipo) && (
                  <>
                    <th className="sticky top-0 px-2 py-1.5 text-right text-[13px] font-black uppercase tracking-wide">
                      Débito
                    </th>
                    <th className="sticky top-0 px-2 py-1.5 text-right text-[13px] font-black uppercase tracking-wide">
                      Crédito
                    </th>
                  </>
                )}

                {["r", "c", "m"].includes(tipo) && (
                  <th className="sticky top-0 px-2 py-1.5 text-right text-[13px] font-black uppercase tracking-wide">
                    Valor
                  </th>
                )}

                <th className="sticky top-0 px-2 py-1.5 text-right text-[13px] font-black uppercase tracking-wide">
                  Saldo
                </th>

                
                <th className="sticky top-0 px-2 py-1.5 text-right text-[13px] font-black uppercase tracking-wide">
                  Origem
                </th>
                
              </tr>
            </thead>

            <tbody className="leading-tight">
              

                {dadosFiltrados.map((l, idx) => {
                  const totalConta = l.historico === "TOTAL DA CONTA";

                  return (
                    <tr
                      key={idx}
                      className={`transition hover:bg-blue-50 ${
                        totalConta
                          ? "bg-green-50"
                          : idx % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50"
                      }`}
                    >
                      {tipo !== "m" && (
                        <td className="whitespace-nowrap border-b border-slate-100 px-2 py-1 font-bold text-slate-700">
                          {formatarData(l.data_mov || l.data)}
                        </td>
                      )}

                      {tipo === "m" && (
                        <td
                          className={`whitespace-nowrap border-b border-slate-100 px-2 py-1 font-black ${
                            totalConta ? "text-green-700" : "text-slate-700"
                          }`}
                        >
                          {l.mes_ano}
                        </td>
                      )}

                      {tipo !== "c" && (
                        <td
                          className={`border-b border-slate-100 px-2 py-1 font-bold ${
                            totalConta ? "text-green-700" : "text-slate-700"
                          }`}
                        >
                          <div className="max-w-[360px] truncate">
                            {l.conta_codigo} — {l.conta_nome}
                          </div>
                        </td>
                      )}

                      {tipo === "c" && (
                        <td
                          className={`border-b border-slate-100 px-2 py-1 font-bold ${
                            totalConta ? "text-green-700" : "text-slate-700"
                          }`}
                        >
                          <div className="max-w-[260px] truncate">
                            {l.conta_contrapartida || "-"}
                          </div>
                        </td>
                      )}

                      {tipo !== "m" && (
                        <td
                          className={`border-b border-slate-100 px-2 py-1 font-semibold ${
                            totalConta ? "text-green-700" : "text-slate-600"
                          }`}
                        >
                           <div
                            className="max-w-[420px] print:max-w-none print:whitespace-normal print:break-words"
                            title={l.historico}
                          >
                            {l.historico}
                          </div>
                        </td>
                      )}

                      {tipo !== "c" && (
                        <td
                          className={`whitespace-nowrap border-b border-slate-100 px-2 py-1 text-right font-black ${
                            Number(l.saldo_inicial || 0) < 0
                              ? "text-red-600"
                              : "text-green-700"
                          }`}
                        >
                          {fmt.format(l.saldo_inicial || 0)}
                        </td>
                      )}

                      {!["r", "c", "m"].includes(tipo) && (
                        <>
                          <td className="whitespace-nowrap border-b border-slate-100 px-2 py-1 text-right font-black text-blue-700">
                            {fmt.format(l.debito || 0)}
                          </td>

                          <td className="whitespace-nowrap border-b border-slate-100 px-2 py-1 text-right font-black text-red-600">
                            {fmt.format(l.credito || 0)}
                          </td>
                        </>
                      )}

                      {["r", "c", "m"].includes(tipo) && (
                        <td
                          className={`whitespace-nowrap border-b border-slate-100 px-2 py-1 text-right font-black ${
                            Number(l.valor || 0) < 0
                              ? "text-red-600"
                              : "text-green-700"
                          }`}
                        >
                          {fmt.format(l.valor || 0)}
                        </td>
                      )}

                       <td
                          className={`whitespace-nowrap border-b border-slate-100 px-2 py-1 text-right font-black ${
                            Number(tipo === "c" ? l.saldo_final : l.saldo) < 0
                              ? "text-red-600"
                              : "text-green-700"
                          }`}
                        >
                          {fmt.format(tipo === "c" ? l.saldo_final || 0 : l.saldo || 0)}
                        </td>

                        <td className="whitespace-nowrap border-b border-slate-100 py-1 pl-5 pr-2">
                          {l.origem == null || String(l.origem).trim() === "" ? (
                            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                              Financeiro
                            </span>
                          ) : String(l.origem).toUpperCase() === "CONTABIL" ? (
                            <span className="inline-flex items-center rounded-full border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-bold text-red-700">
                              Manual
                            </span>
                          ) : (
                            <span className="inline-flex max-w-[180px] items-center truncate rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                              {l.origem}
                            </span>
                          )}
                        </td>

                    </tr>
                  );
                })}

              {!loading && dadosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8">
                      <div className="text-4xl">📭</div>
                      <div className="mt-3 text-lg font-black text-slate-700">
                         {dados.length > 0 && filtroHistorico
                            ? "Nenhum histórico encontrado"
                            : "Nenhum lançamento encontrado"}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-500">
                        {dados.length > 0 && filtroHistorico
                        ? "Altere ou limpe o filtro de histórico."
                        : "Ajuste os filtros e clique em Consultar."}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {loading && (
            <div className="border-t border-slate-100 p-6 text-center text-sm font-black text-blue-700">
              Carregando razão contábil...
            </div>
          )}
        </div></div> {/* fim do print-area */}
      </div>
    </div>
  </div>
);
 
}
