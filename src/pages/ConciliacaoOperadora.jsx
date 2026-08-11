 import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
    
   import { buildWebhookUrl } from "../config/globals";
import * as XLSX from "xlsx";
 import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
const WEBHOOK_IMPORTAR = "/webhook/importa_venda_getnet";
const WEBHOOK_CONFERIR = "/webhook/confere_consumer_getnet";
const WEBHOOK_PROCESSAR = "/webhook/processa_ajustes_operadora";

function moeda(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dataBR(v) {
  if (!v) return "-";
  const valor = String(v).substring(0, 10);
  const [ano, mes, dia] = valor.split("-");
  if (!ano || !mes || !dia) return String(v);
  return `${dia}/${mes}/${ano}`;
}

function normalizarResposta(data) {
  let r = data;

  if (Array.isArray(r)) {
    if (!r.length) return null;
    r = r[0];
  }

  if (r?.resultado) {
    r = r.resultado;
  }

  const chaveFuncao = r
    ? Object.keys(r).find(
        (k) => k.startsWith("ff_") && r[k] && typeof r[k] === "object"
      )
    : null;

  if (chaveFuncao) {
    r = r[chaveFuncao];
  }

  if (r?.conferencia) {
    return r.conferencia;
  }

  return r;
}

function configSituacao(situacao) {
  switch (situacao) {

    case "PENDENTE":
      return {
        titulo: "Pendente",
        classe:
          "bg-amber-50 text-amber-800 border-amber-300",
        acao: "PROCESSAR",
        selecionavel: true,
      };

    case "REALIZADO":
      return {
        titulo: "Realizado",
        classe:
          "bg-emerald-50 text-emerald-800 border-emerald-300",
        acao: "REALIZADO",
        selecionavel: false,
      };

    case "NAO_PROCESSAVEL":
      return {
        titulo: "Não processável",
        classe:
          "bg-red-50 text-red-800 border-red-300",
        acao: "NENHUMA",
        selecionavel: false,
      };

    default:
      return {
        titulo: situacao || "Revisar",
        classe:
          "bg-slate-100 text-slate-700 border-slate-300",
        acao: "REVISAR",
        selecionavel: false,
      };
  }
}

 
function textoAcao(acao) {
  switch (acao) {
    case "PROCESSAR":
      return "Processar";

    case "REALIZADO":
      return "Processado";

    case "NENHUMA":
      return "Nenhuma ação";

    default:
      return "Revisar";
  }
}



function Card({ titulo, valor, alerta = false }) {
  return (
    <div className={`rounded-lg border bg-white p-3 shadow-sm ${alerta ? "border-red-300" : "border-slate-300"}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{titulo}</div>
      <div className={`mt-1 text-lg font-bold ${alerta ? "text-red-700" : "text-slate-900"}`}>{valor}</div>
    </div>
  );
}

function Filtro({ ativo, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-semibold ${ativo ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
    >
      {children}
    </button>
  );
}


export default function ConciliacaoOperadora() {
  const empresa_id = localStorage.getItem("empresa_id");
  const inputFileRef = useRef(null);
  const [contas, setContas] = useState([]);
  const [contaId, setContaId] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);
  const [resultadoImportacao, setResultadoImportacao] = useState(null);
  const [carregandoConferencia, setCarregandoConferencia] = useState(false);
  
  
   const hoje = hojeLocal();

const [dataInicio, setDataInicio] = useState(hoje);
const [dataFim, setDataFim] = useState(hoje);

  const [filtro, setFiltro] = useState("ACOES");
  const [selecionados, setSelecionados] = useState({});

  const [indiceConta, setIndiceConta] = useState(0);
const [saldo, setSaldo] = useState(0);
const [saldoBase, setSaldoBase] = useState(0);
const [carregandoSaldo, setCarregandoSaldo] = useState(false);
 

/* status da segunda drop de banco agora  */
 
const [contasBanco, setContasBanco] = useState([]);
const [indiceContaBanco, setIndiceContaBanco] = useState(0);
const [contaBancoId, setContaBancoId] = useState("");
const [saldoBanco, setSaldoBanco] = useState(0);

const contaBancoAtual =
  contasBanco?.[indiceContaBanco] || null; 
  




const contaAtual = contas?.[indiceConta] || null;

  const itens = useMemo(() => (Array.isArray(resultado?.itens) ? resultado.itens : []), [resultado]);
  const resumo = resultado?.resumo || {};

 

const itensFiltrados = useMemo(() => {

  if (filtro === "TODOS") {
    return itens;
  }

  if (filtro === "PENDENTES") {
    return itens.filter(
      (x) => x.situacao === "PENDENTE"
    );
  }

  if (filtro === "REALIZADOS") {
    return itens.filter(
      (x) => x.situacao === "REALIZADO"
    );
  }

  if (filtro === "NAO_PROCESSAVEIS") {
    return itens.filter(
      (x) => x.situacao === "NAO_PROCESSAVEL"
    );
  }

  return itens;

}, [itens, filtro]);

  const selecionadosLista = useMemo(() => {
    return itens.filter((item) => {
      const chave = item.operadora_movimento_id || `cf-${item.conciliacao_financeira_id}`;
      return selecionados[chave] === true;
    });
  }, [itens, selecionados]);

  const totalTaxasSelecionadas = useMemo(() => {
    return selecionadosLista.reduce((acc, item) => acc + Number(item?.operadora?.valor_taxa || 0), 0);
  }, [selecionadosLista]);

  function resolveWebhook(path) {
    if (typeof buildWebhookUrl === "function") {
      return buildWebhookUrl(path.replace(/^\/webhook\//, ""));
    }
    return path;
  }


  async function arquivoExcelParaTexto(file) {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  let textoFinal = "";

  for (const nomeAba of workbook.SheetNames) {
    const sheet = workbook.Sheets[nomeAba];

    if (!sheet) continue;

    const range = sheet["!ref"] || "";

    const textoAba = XLSX.utils.sheet_to_csv(
      sheet,
      {
        FS: "\t",
        RS: "\n",
        blankrows: true,
      }
    );

    textoFinal +=
      `### ABA: ${nomeAba}\n` +
      `### RANGE: ${range}\n` +
      textoAba +
      "\n\n";
  }

  return textoFinal.trim();
}

  async function importarArquivo() {
    setErro("");
    if (!contaId) return setErro("Selecione a conta financeira.");
    if (!arquivo) return setErro("Selecione o arquivo Getnet.");

    const arquivo_excel =
  await arquivoExcelParaTexto(arquivo);

    try {
      setCarregando(true);
      setResultadoImportacao(null);

      const formData = new FormData();
      formData.append("empresa_id", String(empresa_id));
      formData.append("conta_id", String(contaId));
      formData.append("arquivo_excel", arquivo_excel);

      const response = await fetch(resolveWebhook(WEBHOOK_IMPORTAR), {
        method: "POST",
        body: formData,
      });

      const texto = await response.text();
      let data;
      try { data = JSON.parse(texto); }
      catch { throw new Error(texto || "Resposta inválida do servidor."); }

      const retorno = normalizarResposta(data);
      if (!response.ok || !retorno?.ok) {
        throw new Error(retorno?.mensagem || "Erro ao importar o arquivo.");
      }

      setResultadoImportacao(retorno);

      // Se a importação devolver o período do arquivo, usamos como sugestão
      // para a conferência, sem obrigar o usuário a manter essas datas.
      const periodo =
        retorno?.diagnostico ||
        retorno?.gravacao ||
        retorno;

      if (periodo?.data_inicio) setDataInicio(periodo.data_inicio);
      if (periodo?.data_fim) setDataFim(periodo.data_fim);
    } catch (e) {
      setErro(e?.message || "Erro ao processar arquivo.");
    } finally {
      setCarregando(false);
    }
  }

  async function conferirPeriodo() {
    setErro("");

    if (!contaId) {
      setErro("Selecione a conta financeira.");
      return;
    }

    if (!dataInicio || !dataFim) {
      setErro("Informe a data inicial e a data final.");
      return;
    }

    if (dataInicio > dataFim) {
      setErro("A data inicial não pode ser maior que a data final.");
      return;
    }

    try {
      setCarregandoConferencia(true);
      setResultado(null);
      setSelecionados({});

      const response = await fetch(resolveWebhook(WEBHOOK_CONFERIR), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          empresa_id: Number(empresa_id),
          conta_id: Number(contaId),
          operadora: "GETNET",
          data_inicio: dataInicio,
          data_fim: dataFim,
        }),
      });

      const texto = await response.text();

      let data;
      try {
        data = JSON.parse(texto);
      } catch {
        throw new Error(texto || "Resposta inválida da conferência.");
      }

      const retorno = normalizarResposta(data);

      if (!response.ok || !retorno?.ok) {
        throw new Error(
          retorno?.mensagem || "Erro ao conferir Consumer x Getnet."
        );
      }

      setResultado(retorno);

      const novosSelecionados = {};

       for (const item of retorno.itens || []) {

  if (!item.acao_necessaria) {
    continue;
  }

  novosSelecionados[
    item.operadora_movimento_id
  ] = true;
}

      setSelecionados(novosSelecionados);
    } catch (e) {
      setErro(e?.message || "Erro ao conferir Consumer x Getnet.");
    } finally {
      setCarregandoConferencia(false);
    }
  }

  function alternarItem(item) {
    const cfg = configSituacao(item.situacao);
    if (!cfg.selecionavel) return;
    const chave = item.operadora_movimento_id || `cf-${item.conciliacao_financeira_id}`;
    setSelecionados((old) => ({ ...old, [chave]: !old[chave] }));
  }

  function selecionarTodosVisiveis() {
    setSelecionados((old) => {
      const novo = { ...old };
      for (const item of itensFiltrados) {
        const cfg = configSituacao(item.situacao);
        if (!cfg.selecionavel) continue;
        const chave = item.operadora_movimento_id || `cf-${item.conciliacao_financeira_id}`;
        novo[chave] = true;
      }
      return novo;
    });
  }

  function limparSelecao() {
    setSelecionados({});
  }

  async function processarSelecionados() {
    if (!selecionadosLista.length) return setErro("Nenhuma ação selecionada.");

    try {
      setErro("");
      setProcessando(true);

      const payload = {
        empresa_id: Number(empresa_id),
        conta_id: Number(contaId),
        itens: selecionadosLista.map((item) => {
          const cfg = configSituacao(item.situacao);
          return {
            acao: cfg.acao,
            situacao: item.situacao,
            conciliacao_financeira_id: item.conciliacao_financeira_id,
            receber_id: item.receber_id,
            operadora_movimento_id: item.operadora_movimento_id,
            data_prevista_pagamento: item?.operadora?.data_prevista_pagamento || null,
            valor_bruto: item?.operadora?.valor_bruto || 0,
            valor_taxa: item?.operadora?.valor_taxa || 0,
            valor_liquido: item?.operadora?.valor_liquido || 0,
          };
        }),
      };

      const response = await fetch(resolveWebhook(WEBHOOK_PROCESSAR), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const texto = await response.text();
      let data;
      try { data = JSON.parse(texto); }
      catch { throw new Error(texto || "Resposta inválida ao processar ações."); }

      const retorno = normalizarResposta(data);
      if (!response.ok || !retorno?.ok) {
        throw new Error(retorno?.mensagem || "Erro ao processar ações selecionadas.");
      }

      setSelecionados({});
      if (retorno?.itens) setResultado(retorno);
    } catch (e) {
      setErro(e?.message || "Erro ao processar ações.");
    } finally {
      setProcessando(false);
    }
  }


  async function carregarSaldoContaBanco(conta_id) {
  if (!conta_id) return;

  try {
    const resp = await fetch(
      buildWebhookUrl("saldoconta"),
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          empresa_id: empresa_id,
          conta_id: conta_id,
        }),
      }
    );

    const data = await resp.json();

    const saldoConta = Number(
      data?.data?.ff_saldo_conta ??
      data?.ff_saldo_conta ??
      0
    );

    setSaldoBanco(saldoConta);

  } catch (err) {
    console.error(
      "Erro saldo conta bancária:",
      err
    );

    setSaldoBanco(0);
  }
}
  
 async function carregarContas() {
  if (!empresa_id) return;

  try {
    const url = buildWebhookUrl("consultasaldo", {
      inicio: hoje,
      fim: hoje,
      empresa_id: empresa_id,
      conta_id: 0,
    });

    const resp = await fetch(url, {
      method: "GET",
    });

    if (!resp.ok) {
      throw new Error(`Erro HTTP ${resp.status}`);
    }

    const data = await resp.json();

    const listaTodas =
      Array.isArray(data) ? data : [];

    const listaCaixa =
      listaTodas.filter(
        (c) =>
          String(c.nro_banco || "") === "000"
      );

    const listaBanco =
      listaTodas.filter(
        (c) =>
          String(c.nro_banco || "") !== "000"
      );

    setContas(listaCaixa);
    setContasBanco(listaBanco);

    // CAIXA
    if (listaCaixa.length > 0) {
      const primeira = listaCaixa[0];

      const id =
        primeira.conta_id ??
        primeira.id;

      setIndiceConta(0);
      setContaId(String(id));

      await carregarSaldoConta(id);
    }

    // BANCO RECEBIMENTO
    if (listaBanco.length > 0) {
      const primeiraBanco =
        listaBanco[0];

      const idBanco =
        primeiraBanco.conta_id ??
        primeiraBanco.id;

      setIndiceContaBanco(0);
      setContaBancoId(String(idBanco));

      await carregarSaldoContaBanco(idBanco);
    }

  } catch (error) {
    console.error(
      "Erro ao carregar contas:",
      error
    );
  }
}

  useEffect(() => {
    carregarContas();
  }, [empresa_id]);

  async function carregarSaldoConta(conta_id) {
    if (!conta_id) return;

    try {
      setCarregandoSaldo(true);

      const resp = await fetch(
        buildWebhookUrl("saldoconta"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            empresa_id: empresa_id,
            conta_id: conta_id,
          }),
        }
      );

      if (!resp.ok) {
        throw new Error(`Erro HTTP ${resp.status}`);
      }

      const data = await resp.json();

      const saldoConta = Number(
        data?.data?.ff_saldo_conta ??
        data?.ff_saldo_conta ??
        0
      );

      setSaldoBase(saldoConta);
      setSaldo(saldoConta);
    } catch (err) {
      console.error("Erro ao buscar saldo:", err);
      setSaldo(0);
      setSaldoBase(0);
    } finally {
      setCarregandoSaldo(false);
    }
  }

  async function selecionarConta(conta) {
  if (!conta) return;

  const id =
    conta.conta_id ??
    conta.id;

  setContaId(String(id));

  await carregarSaldoConta(id);
}

async function contaAnterior() {
  if (!contas?.length) return;

  const novoIndice =
    indiceConta <= 0
      ? contas.length - 1
      : indiceConta - 1;

  setIndiceConta(novoIndice);

  const conta = contas[novoIndice];

  await selecionarConta(conta);
}

async function proximaConta() {
  if (!contas?.length) return;

  const novoIndice =
    indiceConta >= contas.length - 1
      ? 0
      : indiceConta + 1;

  setIndiceConta(novoIndice);

  const conta = contas[novoIndice];

  await selecionarConta(conta);
}


async function conferirPeriodo() {
  setErro("");

  if (!contaId) {
    setErro("Selecione a conta financeira.");
    return;
  }

  if (!dataInicio || !dataFim) {
    setErro("Informe a data inicial e a data final.");
    return;
  }

  if (dataInicio > dataFim) {
    setErro("A data inicial não pode ser maior que a data final.");
    return;
  }

  try {
    setCarregandoConferencia(true);

    setResultado(null);
    setSelecionados({});

    const response = await fetch(
      buildWebhookUrl("confere_consumer_getnet"),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          empresa_id: Number(empresa_id),
          conta_id: Number(contaId),
          operadora: "GETNET",
          data_inicio: dataInicio,
          data_fim: dataFim,
        }),
      }
    );

    const texto = await response.text();

    let data;

    try {
      data = JSON.parse(texto);
    } catch {
      throw new Error(
        texto ||
          "Resposta inválida da conferência."
      );
    }

    const retorno =
      normalizarResposta(data);

    if (!response.ok || !retorno?.ok) {
      throw new Error(
        retorno?.mensagem ||
          "Erro ao conferir Consumer x Getnet."
      );
    }

    // JSON DA PROC PASSA A ALIMENTAR A TELA
    setResultado(retorno);

    // Marca automaticamente as ações permitidas
    const novosSelecionados = {};

    for (const item of retorno.itens || []) {
      const cfg =
        configSituacao(item.situacao);

      if (!cfg.selecionavel) {
        continue;
      }

      const chave =
        item.operadora_movimento_id ||
        `cf-${item.conciliacao_financeira_id}`;

      novosSelecionados[chave] = true;
    }

    setSelecionados(novosSelecionados);

  } catch (err) {
    console.error(
      "Erro na conferência:",
      err
    );

    setErro(
      err?.message ||
        "Erro ao conferir Consumer x Getnet."
    );

  } finally {
    setCarregandoConferencia(false);
  }
}

 

async function selecionarContaBanco(conta) {
  if (!conta) return;

  const id =
    conta.conta_id ??
    conta.id;

  setContaBancoId(String(id));

  await carregarSaldoContaBanco(id);
}

async function contaBancoAnterior() {
  if (!contasBanco?.length) return;

  const novoIndice =
    indiceContaBanco <= 0
      ? contasBanco.length - 1
      : indiceContaBanco - 1;

  setIndiceContaBanco(novoIndice);

  const conta =
    contasBanco[novoIndice];

  await selecionarContaBanco(conta);
}

async function proximaContaBanco() {
  if (!contasBanco?.length) return;

  const novoIndice =
    indiceContaBanco >= contasBanco.length - 1
      ? 0
      : indiceContaBanco + 1;

  setIndiceContaBanco(novoIndice);

  const conta =
    contasBanco[novoIndice];

  await selecionarContaBanco(conta);
}
 
function nomeFormaPagamento(forma) {
  switch (forma) {
    case "cartao_credito":
      return "Cartão de crédito";

    case "cartao_debito":
      return "Cartão de débito";

    case "pix":
      return "PIX";

    case "dinheiro":
      return "Dinheiro";

    default:
      return forma
        ? String(forma).replaceAll("_", " ")
        : "-";
  }
}


  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-4 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="bg-[#0F172A] px-5 py-4">
            <h1 className="text-lg font-semibold text-white">Conciliação de Operadora</h1>
            <p className="mt-1 text-xs text-slate-300">Importe o arquivo da operadora, confira vendas, taxas e divergências.</p>
          </div>

           <div className="p-4">

  {/* DUAS CONTAS COM O MESMO TAMANHO */}
  <div className="grid gap-6 lg:grid-cols-2 items-start"> 
            <div>
              <div>
            <label className="mb-2 block text-xs font-black text-slate-700">
              Conta Caixa (Empresa)
            </label>

          <div className="flex items-center gap-3 w-full">

            {/* ANTERIOR */}
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
                onClick={() =>
                  selecionarConta(contaAtual)
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" ||
                    e.key === " "
                  ) {
                    e.preventDefault();
                    selecionarConta(contaAtual);
                  }
                }}
                className="
                  flex-1 min-w-0
                  rounded-[22px] border bg-white
                  px-5 py-4
                  flex items-center gap-4
                  transition
                  hover:scale-[1.01]
                  cursor-pointer
                "
                style={{
                  borderColor:
                    contaAtual.cor_hex ||
                    "#bae6fd",

                  boxShadow:
                    String(contaId) ===
                    String(
                      contaAtual.conta_id ??
                        contaAtual.id
                    )
                      ? `0 0 0 2px ${
                          contaAtual.cor_hex ||
                          "#2563eb"
                        }33,
                        0 12px 28px ${
                          contaAtual.cor_hex ||
                          "#2563eb"
                        }33`
                      : `0 8px 20px ${
                          contaAtual.cor_hex ||
                          "#0f172a"
                        }22`,
                }}
              >

                {/* ÍCONE */}
                <div
                  className="
                    h-16 w-16
                    rounded-2xl border
                    flex items-center
                    justify-center
                    overflow-hidden
                    shrink-0
                  "
                  style={{
                    background: `${
                      contaAtual.cor_hex ||
                      "#f8fafc"
                    }12`,

                    borderColor: `${
                      contaAtual.cor_hex ||
                      "#e2e8f0"
                    }55`,
                  }}
                >
                  {contaAtual.icone_url ? (
                    <img
                      src={contaAtual.icone_url}
                      alt={
                        contaAtual.banco_nome ||
                        contaAtual.nome
                      }
                      className="h-10 w-10 object-contain"
                    />
                  ) : (
                    <span className="text-3xl">
                      🏦
                    </span>
                  )}
                </div>

                {/* CONTA */}
                <div className="flex-1 min-w-0 text-left">

                  <div className="text-lg font-black text-slate-800">
                    {contaAtual.nome ||
                      contaAtual.conta_nome}
                  </div>

                  <div className="mt-1 text-xs font-bold text-slate-400">
                    {contaAtual.banco_nome ||
                      contaAtual.banco ||
                      "Conta bancária"}
                  </div>

                  <div className="mt-1 text-xs font-bold text-slate-500">
                    Banco{" "}
                    {contaAtual.nro_banco || "-"}
                    {" • "}
                    Ag.{" "}
                    {contaAtual.agencia || "-"}
                    {" • "}
                    Conta{" "}
                    {contaAtual.conta || "-"}
                  </div>

                  <div className="mt-1 text-xs font-bold text-slate-500">
                    Conta {indiceConta + 1} de{" "}
                    {contas.length}
                  </div>

                </div>

                {/* SALDO */}
                <div className="text-right shrink-0 min-w-[120px]">

                  <div className="text-xs font-bold text-slate-400">
                    Saldo
                  </div>

                  <div
                    className={`text-lg font-black ${
                      Number(saldo || 0) >= 0
                        ? "text-emerald-700"
                        : "text-red-600"
                    }`}
                  >
                    {carregandoSaldo
                      ? "..."
                      : Number(
                          saldo || 0
                        ).toLocaleString(
                          "pt-BR",
                          {
                            style: "currency",
                            currency: "BRL",
                          }
                        )}
                  </div>

                </div>
              </div>
            ) : (


              
              <div
                className="
                  w-full max-w-[520px]
                  rounded-3xl
                  border border-dashed
                  border-slate-300
                  bg-white
                  px-5 py-8
                  text-center
                  font-bold
                  text-slate-400
                "
              >
                Nenhuma conta encontrada
              </div>
            )}

            {/* PRÓXIMA */}
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

            <div className="border-t border-slate-200 px-4 py-4">
  <label className="mb-2 block text-xs font-semibold text-slate-600">
    Arquivo da operadora
  </label>

  <div className="flex items-center gap-3">
    <div className="flex h-10 flex-1 overflow-hidden rounded-lg border border-slate-300 bg-blue-450">
      <button
        type="button"
        onClick={() => inputFileRef.current?.click()}
        className="border-r border-slate-300 bg-slate-750 px-4 text-xs font-semibold text-blue-700 hover:bg-slate-100"
      >
        Escolher arquivo
      </button>

      <div className="flex min-w-0 flex-1 items-center px-3 text-sm text-slate-600">
        <span className="truncate">
          {arquivo?.name || "Nenhum arquivo selecionado"}
        </span>
      </div>

      <input
        ref={inputFileRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) =>
          setArquivo(e.target.files?.[0] || null)
        }
      />
    </div>

    <button
      type="button"
      onClick={importarArquivo}
      disabled={carregando}
      className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {carregando ? "Importando..." : "Importar arquivo"}
    </button>
  </div>
</div>
          </div>
        </div>

        

        {erro && <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{erro}</div>}

        {resultadoImportacao?.ok && (
          <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-emerald-800">
                  ✓ Arquivo Getnet importado com sucesso
                </div>
                <div className="mt-1 text-xs font-semibold text-emerald-700">
                  {resultadoImportacao?.mensagem || "Os dados da operadora foram gravados e já podem ser conferidos."}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-emerald-900">
                {resultadoImportacao?.importacao_id != null && (
                  <span><strong>Importação:</strong> #{resultadoImportacao.importacao_id}</span>
                )}
                {(resultadoImportacao?.diagnostico?.quantidade_movimentos ??
                  resultadoImportacao?.movimentos_gravados) != null && (
                  <span>
                    <strong>Movimentos:</strong>{" "}
                    {resultadoImportacao?.diagnostico?.quantidade_movimentos ??
                      resultadoImportacao?.movimentos_gravados}
                  </span>
                )}
                {resultadoImportacao?.diagnostico?.total_bruto != null && (
                  <span>
                    <strong>Total bruto:</strong>{" "}
                    {moeda(resultadoImportacao.diagnostico.total_bruto)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-sm font-black text-slate-800">
              Conferir Consumer x Getnet
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Informe o período que deseja conferir usando os dados Getnet já importados.
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3 p-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">
                Data inicial
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">
                Data final
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={conferirPeriodo}
              disabled={carregandoConferencia || !contaId || !dataInicio || !dataFim}
              className="h-10 rounded-lg bg-[#0F172A] px-5 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {carregandoConferencia ? "Conferindo..." : "Conferir período"}
            </button>

            <div className="pb-2 text-xs font-semibold text-slate-500">
              Operadora: <strong className="text-slate-700">GETNET</strong>
            </div>
          </div>
        </div>

        {resultado && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs text-slate-600">
              <span><strong>Operadora:</strong> {resultado.operadora || "GETNET"}</span>
              <span><strong>Conta:</strong> {contaAtual?.nome || contaAtual?.conta_nome || contaId}</span>
              <span><strong>Período conferido:</strong> {dataBR(resultado.data_inicio || dataInicio)} a {dataBR(resultado.data_fim || dataFim)}</span>
            </div>
               
               <div className="
  mb-4
  grid grid-cols-2 gap-3
  md:grid-cols-4
  xl:grid-cols-8
">

  <Card
    titulo="Operações"
    valor={resumo.total || 0}
  />

  <Card
    titulo="Pendentes"
    valor={resumo.pendentes || 0}
    alerta={Number(resumo.pendentes || 0) > 0}
  />

  <Card
    titulo="Realizadas"
    valor={resumo.realizados || 0}
  />

  <Card
    titulo="Não processáveis"
    valor={resumo.nao_processaveis || 0}
    alerta={Number(resumo.nao_processaveis || 0) > 0}
  />

  <Card
    titulo="Com taxa"
    valor={resumo.com_taxa || 0}
  />

  <Card
    titulo="Bruto"
    valor={moeda(resumo.total_bruto)}
  />

  <Card
    titulo="Taxas"
    valor={moeda(resumo.total_taxas)}
  />

  <Card
    titulo="Líquido"
    valor={moeda(resumo.total_liquido)}
  />

</div>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white p-3">
              <div className="flex flex-wrap gap-2">
                 <Filtro
  ativo={filtro === "PENDENTES"}
  onClick={() => setFiltro("PENDENTES")}
>
  Pendentes
</Filtro>

<Filtro
  ativo={filtro === "TODOS"}
  onClick={() => setFiltro("TODOS")}
>
  Todas
</Filtro>

<Filtro
  ativo={filtro === "REALIZADOS"}
  onClick={() => setFiltro("REALIZADOS")}
>
  Realizadas
</Filtro>

<Filtro
  ativo={filtro === "NAO_PROCESSAVEIS"}
  onClick={() =>
    setFiltro("NAO_PROCESSAVEIS")
  }
>
  Não processáveis
</Filtro>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={selecionarTodosVisiveis} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Selecionar ações</button>
                <button type="button" onClick={limparSelecao} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Limpar</button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1320px] text-sm">
                  <thead className="bg-[#0F172A] text-white">
                    <tr>
                       
                          <th className="w-10 px-3 py-3 text-center">
                            ✓
                          </th>

                          <th className="px-3 py-3 text-left">
                            Situação
                          </th>

                          <th className="px-3 py-3 text-left">
                            Data
                          </th>

                         
                          <th className="px-3 py-3 text-left">
                            Bandeira
                          </th>

                          <th className="px-3 py-3 text-right">
                            Bruto
                          </th>

                          <th className="px-3 py-3 text-right">
                            Taxa
                          </th>

                          <th className="px-3 py-3 text-right">
                            Líquido
                          </th>

                          <th className="px-3 py-3 text-left">
                            Prev. pagamento
                          </th>

                          <th className="px-3 py-3 text-left">
                            Status operadora
                          </th>

                          <th className="px-3 py-3 text-left">
                            O que será feito
                          </th>

  
 
                    </tr>
                  </thead>
                  <tbody>
                    {itensFiltrados.map((item, index) => {
                      const cfg = configSituacao(item.situacao);
                      const chave = item.operadora_movimento_id || `cf-${item.conciliacao_financeira_id}`;
                      const marcado = selecionados[chave] === true;

                      return (
                        <tr key={`${chave}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="border-t border-slate-200 px-3 py-3 text-center">
                            {cfg.selecionavel ? (
                              <input type="checkbox" checked={marcado} onChange={() => alternarItem(item)} className="h-4 w-4" />
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                         

                           <td className="whitespace-nowrap border-t border-slate-200 px-3 py-3">
                            {dataBR(item.data)}
                          </td>

                          <td className="border-t border-slate-200 px-3 py-3">
                            <div className="font-semibold text-slate-800">
                              {nomeFormaPagamento(
                                    item.forma || item.tipo_movimento
                                  )}
                            </div>

                            <div className="mt-1 text-[11px] text-slate-500">
                              {item.mensagem}
                            </div>

                            {item.autorizacao && (
                              <div className="mt-1 text-[10px] text-slate-400">
                                AUT: {item.autorizacao}
                              </div>
                            )}

                            {item.comprovante_venda && (
                              <div className="mt-1 text-[10px] text-slate-400">
                                Comp.: {item.comprovante_venda}
                              </div>
                            )}
                          </td>

                          <td className="border-t border-slate-200 px-3 py-3">
                            {item.bandeira || "-"}
                          </td>

                          <td className="border-t border-slate-200 px-3 py-3 text-right font-semibold">
                            {moeda(item.valor_bruto)}
                          </td>

                          <td className="border-t border-slate-200 px-3 py-3 text-right font-semibold text-red-700">
                            {Number(item.valor_taxa || 0) > 0
                              ? moeda(item.valor_taxa)
                              : "-"}
                          </td>

                          <td className="border-t border-slate-200 px-3 py-3 text-right font-semibold text-emerald-700">
                            {moeda(item.valor_liquido)}
                          </td>

                          <td className="whitespace-nowrap border-t border-slate-200 px-3 py-3">
                            {dataBR(item.data_prevista_pagamento)}
                          </td>

                          <td className="border-t border-slate-200 px-3 py-3">
                            {item.status_operadora || "-"}
                          </td>

                           

                          <td className="border-t border-slate-200 px-3 py-3">

                                {item.situacao === "PENDENTE" ? (
                                  <div className="space-y-1 text-[11px]">

                                    {item.acoes?.gerar_venda && (
                                      <div>✓ Reconhecer venda</div>
                                    )}

                                    {item.acoes?.gerar_taxa && (
                                      <div>✓ Contabilizar taxa</div>
                                    )}

                                    {item.acoes?.enviar_transitoria && (
                                      <div>✓ Enviar líquido para transitória</div>
                                    )}

                                  </div>
                                ) : (
                                  <span className="font-semibold text-slate-600">
                                    {item.acao}
                                  </span>
                                )}

                              </td>
                        </tr>
                      );
                    })}

                    {!itensFiltrados.length && (
                      <tr><td colSpan={12} className="px-4 py-10 text-center text-sm text-slate-500">Nenhum registro para este filtro.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sticky bottom-3 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white p-4 shadow-lg">
              <div>
                <div className="text-sm font-semibold text-slate-800">{selecionadosLista.length} ação(ões) selecionada(s)</div>
                <div className="mt-1 text-xs text-slate-500">Taxas selecionadas: <strong className="text-red-700">{moeda(totalTaxasSelecionadas)}</strong></div>
              </div>
              <button
                type="button"
                disabled={processando || selecionadosLista.length === 0}
                onClick={processarSelecionados}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >{processando ? "Processando..." : "Processar Selecionados"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}