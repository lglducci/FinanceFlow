 import { useEffect, useRef, useState } from "react";
 
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";

import {
  useLocation,
  useNavigate
} from "react-router-dom";

import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const moeda = (v) =>
  Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const inicioMes = () => `${hojeLocal().slice(0, 7)}-01`;
 

export default function ConciliacaoExtratoPdf() {
  const navigate = useNavigate();
  const inputPdfRef = useRef(null);

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [contas, setContas] = useState([]);
  const [indiceConta, setIndiceConta] = useState(0);
  const [inicio, setInicio] = useState(inicioMes());
  const [fim, setFim] = useState(hojeLocal());
  const [arquivo, setArquivo] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const contaAtual = contas[indiceConta] || null;
  const contaId = contaAtual?.conta_id || null;
const [senhaPDF, setSenhaPDF] = useState("");

const [executando, setExecutando] = useState(false);
const CHAVE_CONCILIACAO = "ff_conciliacao_extrato_atual";

const [contasContabeis, setContasContabeis] = useState([]);
const [dataInicio, setDataInicio] = useState(
  `${hojeLocal().slice(0, 7)}-01`
);

const [avisoReexecutar, setAvisoReexecutar] =
  useState(false);


  const [linhaContaDropdown, setLinhaContaDropdown] =
  useState(null);

const [buscaContaContabil, setBuscaContaContabil] =
  useState("");
 
const location = useLocation();

function normalizarRetorno(json) {
  const base = Array.isArray(json) ? json[0] : json;

  return (
    base?.fn_concilia_extrato ||
    base?.conciliaextrato ||
    base?.data?.[0]?.fn_concilia_extrato ||
    base?.data?.[0] ||
    base?.data ||
    base ||
    {}
  );
}

useEffect(() => {
  const retorno = location.state;

  if (!retorno?.lancamento_criado) {
    return;
  }

  const conciliacaoId = retorno?.conciliacao_id;
  const origemId = retorno?.origem_id;

  setResultado((resultadoAtual) => {
    if (!resultadoAtual) {
      return resultadoAtual;
    }

    const acoesAtuais = Array.isArray(resultadoAtual.acoes)
      ? resultadoAtual.acoes
      : [];

    const novasAcoes = acoesAtuais.filter((acao) => {
      const mesmaConciliacao =
        conciliacaoId !== null &&
        conciliacaoId !== undefined &&
        Number(acao?.conciliacao_id) ===
          Number(conciliacaoId);

      const mesmaOrigem =
        origemId !== null &&
        origemId !== undefined &&
        String(acao?.origem_id) ===
          String(origemId);

      // Remove somente o registro que acabou de ser criado
      return !(mesmaConciliacao || mesmaOrigem);
    });

    const novoResultado = {
      ...resultadoAtual,
      acoes: novasAcoes,
    };

    /*
      Atualiza também o conteúdo guardado para que,
      se sair e voltar, o lançamento não apareça novamente.
    */
    try {
      const salvo = sessionStorage.getItem(
        CHAVE_CONCILIACAO
      );

      const dadosSalvos = salvo
        ? JSON.parse(salvo)
        : {};

      sessionStorage.setItem(
        CHAVE_CONCILIACAO,
        JSON.stringify({
          ...dadosSalvos,
          resultado: novoResultado,
          inicio,
          fim,
          indiceConta,
          conta_id: contaId,
          senhaPDF,
        })
      );
    } catch (err) {
      console.error(
        "Erro ao atualizar estado da conciliação:",
        err
      );
    }

    return novoResultado;
  });

  /*
    Limpa o state da navegação para o efeito não executar
    novamente em outra renderização.
  */
  navigate(location.pathname, {
    replace: true,
    state: null,
  });
}, [location.state]);

 

const [dataFim, setDataFim] = useState(
  hojeLocal()
);

  async function carregarContas() {
    try {
      setErro("");

      const resp = await fetch(
        buildWebhookUrl("consultasaldo", {
          empresa_id,
          conta_id: 0,
          inicio,
          fim,
        })
      );

      if (!resp.ok) {
        throw new Error(`Erro ao consultar contas (${resp.status}).`);
      }

      const json = await resp.json();
      const base = Array.isArray(json) ? json : json?.data || json?.dados || [];

     const novasContas = Array.isArray(base) ? base : [];

              setContas(novasContas);

              /*
                Mantém a conta que o usuário estava usando.
                Só coloca a primeira conta quando ainda não existe seleção.
              */
              setIndiceConta((indiceAtual) => {
                if (!novasContas.length) {
                  return 0;
                }

                const contaSelecionadaSalva = (() => {
                  try {
                    const salvo = sessionStorage.getItem(
                      CHAVE_CONCILIACAO
                    );

                    const dados = salvo
                      ? JSON.parse(salvo)
                      : null;

                    return Number(dados?.conta_id || 0);
                  } catch {
                    return 0;
                  }
                })();

                if (contaSelecionadaSalva) {
                  const indiceSalvo = novasContas.findIndex(
                    (conta) =>
                      Number(conta?.conta_id) ===
                      contaSelecionadaSalva
                  );

                  if (indiceSalvo >= 0) {
                    return indiceSalvo;
                  }
                }

                if (indiceAtual >= 0 && indiceAtual < novasContas.length) {
                  return indiceAtual;
                }

                return 0;
              });



    } catch (e) {
      setErro(e.message || "Erro ao consultar contas.");
      setContas([]);
    }
  }


  useEffect(() => {
  if (!location.state?.lancamento_criado) {
    return;
  }

  setAvisoReexecutar(true);

  navigate(location.pathname, {
    replace: true,
    state: null,
  });
}, [location.state, location.pathname, navigate]);



  useEffect(() => {
    carregarContas();
  }, [empresa_id, inicio, fim]);

  function navegarConta(direcao) {
    if (!contas.length) return;

    setIndiceConta((atual) => {
      if (direcao === "anterior") {
        return atual === 0 ? contas.length - 1 : atual - 1;
      }

      return atual === contas.length - 1 ? 0 : atual + 1;
    });

    setResultado(null);
  }

  function escolherPdf(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("Selecione um arquivo PDF.");
      e.target.value = "";
      return;
    }

    setArquivo(file);
    setResultado(null);
    setErro("");
  } 


  function extrairResultado(retorno) {
  const bruto = Array.isArray(retorno)
    ? retorno[0]
    : retorno;

  return (
    bruto?.fn_concilia_extrato ||
    bruto?.conciliaextrato ||
    bruto?.data?.[0]?.fn_concilia_extrato ||
    bruto?.data?.[0] ||
    bruto?.data ||
    bruto ||
    {}
  );
}


 async function executarConciliacao(textoPdfRecebido = null) {
  /*
    Quando clicar normalmente no botão, existe arquivo.

    Quando voltar do lançamento contábil, o arquivo não existe mais,
    mas temos o texto do PDF guardado no sessionStorage.
  */
  if (!arquivo && !textoPdfRecebido) {
    alert("Selecione o PDF.");
    return;
  }

  if (!contaId) {
    alert("Conta financeira não identificada.");
    return;
  }

  try {
    setExecutando(true);
    setErro("");
    setResultado(null);

    const formData = new FormData();

    formData.append("empresa_id", String(empresa_id));
    formData.append("conta_id", String(contaId));
    formData.append("data_inicio", inicio);
formData.append("data_fim", fim);
    formData.append("senha_pdf", senhaPDF || "");

    /*
      REEXECUÇÃO:

      Se voltou do lançamento rápido, envia o texto que ficou
      guardado no sessionStorage.
    */
    const buffer = await arquivo.arrayBuffer();

const textoPDF = await lerTextoPDF(buffer);

if (!textoPDF || textoPDF.length < 50) {
  throw new Error(
    "O PDF foi aberto, mas não consegui extrair conteúdo suficiente."
  );
}

formData.append("texto_pdf", textoPDF);

    const resp = await fetch(
      buildWebhookUrl("conciliacao_extrato"),
      {
        method: "POST",
        body: formData,
      }
    );

    const texto = await resp.text();

 

    if (!texto.trim()) {
      throw new Error(
        "O webhook da conciliação não retornou resposta."
      );
    }

    const json = JSON.parse(texto);

    console.log("JSON RECEBIDO:", json);

    const dados = Array.isArray(json)
      ? json[0]?.fn_concilia_extrato_pdf_razao
      : json?.fn_concilia_extrato_pdf_razao;

    console.log("OBJETO EXTRAÍDO:", dados);
    console.log("AÇÕES EXTRAÍDAS:", dados?.acoes);

    if (!resp.ok || !dados || dados?.ok === false) {
      throw new Error(
        dados?.message ||
        dados?.mensagem ||
        dados?.erro ||
        "O webhook respondeu, mas não retornou a conciliação."
      );
    }

    setResultado(dados);


setInicio(dados?.data_inicio || inicio);
setFim(dados?.data_fim || fim);

    /*
      Atualiza o resultado guardado.
    */
    try {
      const salvo = sessionStorage.getItem(
        CHAVE_CONCILIACAO
      );

      const anterior = salvo
        ? JSON.parse(salvo)
        : {};

      sessionStorage.setItem(
        CHAVE_CONCILIACAO,
        JSON.stringify({
          ...anterior,
          resultado: dados,
          inicio,
          fim,
          dataInicio,
          dataFim,
          indiceConta,
          conta_id: contaId,
          senhaPDF,
        })
      );
    } catch (storageError) {
      console.error(
        "Erro ao guardar resultado atualizado:",
        storageError
      );
    }
  } catch (err) {
    console.error(
      "Erro na conciliação:",
      err
    );

    setErro(
      err?.message ||
      "Erro inesperado ao executar a conciliação."
    );
  } finally {
    setExecutando(false);
  }
}

{/*}
  const totalExtrato = Number(
    resultado?.total_extrato ?? resultado?.resumo?.total_extrato ?? 0
  );

  const totalRazao = Number(
    resultado?.total_razao ?? resultado?.resumo?.total_razao ?? 0
  );

  const conciliados = Number(
    resultado?.conciliados ?? resultado?.resumo?.conciliados ?? 0
  );

  const pendencias = Number(
    resultado?.pendencias ?? resultado?.resumo?.pendencias ?? 0
  );

  const diferenca = Number(
    resultado?.diferenca ??
      resultado?.resumo?.diferenca ??
      totalExtrato - totalRazao
  );*/}

  const acoes = Array.isArray(resultado?.acoes)
  ? resultado.acoes
  : [];

const pendencias = acoes.length;

const totalPdfPendente = acoes
  .filter((item) => item.origem === "P")
  .reduce((total, item) => total + Number(item.valor || 0), 0);

const totalRazaoPendente = acoes
  .filter((item) => item.origem === "R")
  .reduce((total, item) => total + Number(item.valor || 0), 0);

const criarLancamentos = acoes.filter(
  (item) => item.acao === "CRIAR_LANCAMENTO"
).length;

const excluirLotes = acoes.filter(
  (item) => item.acao === "EXCLUIR_LOTE"
).length;

const diferencaPendente =
  totalPdfPendente - totalRazaoPendente;


  async function lerTextoPDF(buffer) {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: buffer,
      password: senhaPDF?.trim() || undefined,
    });

    const pdf = await loadingTask.promise;
    let textoFinal = "";

    for (let pagina = 1; pagina <= pdf.numPages; pagina++) {
      const page = await pdf.getPage(pagina);
      const content = await page.getTextContent();

      const textoPagina = content.items
        .map((item) => item.str)
        .join(" ");

      textoFinal += `\n${textoPagina}`;
    }

    return textoFinal.trim();
  } catch (err) {
    const mensagem = String(err?.message || "");
    const codigo = err?.code;

    if (
      mensagem.includes("No password given") ||
      codigo === 1
    ) {
      throw new Error(
        "Este PDF exige senha. Informe a senha e tente novamente."
      );
    }

    if (
      mensagem.includes("Incorrect Password") ||
      codigo === 2
    ) {
      throw new Error("Senha do PDF incorreta.");
    }

    throw new Error("Não consegui abrir o PDF.");
  }
}


async function excluirLote(item) {
  const loteId = Number(item?.lote_id) || 0;

  if (!loteId) {
    alert("Este registro não possui lote para excluir.");
    return;
  }

  const confirmar = window.confirm(
    `ATENÇÃO\n\nVocê está excluindo o LOTE número ${loteId} do Razão.\n\nIsso apagará todos os lançamentos contábeis vinculados a esse lote.\n\nDeseja continuar?`
  );

  if (!confirmar) return;

  try {
    setExecutando(true);
    setErro("");

    const resp = await fetch(
      buildWebhookUrl("excluilanctolote"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          empresa_id: empresa_id,
          lote_id: loteId,
          importacao_id: 0,
        }),
      }
    );

    const texto = await resp.text();

    console.log("Resposta exclusão do lote:", texto);

    if (!texto.trim()) {
      throw new Error("O servidor não retornou resposta.");
    }

    const json = JSON.parse(texto);
    const retorno = Array.isArray(json) ? json[0] : json;
  
 

    if (!resp.ok || retorno?.ok === false) {
      throw new Error(
        retorno?.message ||
          retorno?.mensagem ||
          "Não foi possível excluir o lote."
      );
    }

    alert(`Lote ${loteId} excluído com sucesso!`);

    setResultado((atual) => {
      if (!atual) return atual;

      return {
        ...atual,
        acoes: Array.isArray(atual.acoes)
          ? atual.acoes.filter(
              (acao) => Number(acao?.lote_id) !== loteId
            )
          : [],
      };
    });
  } catch (err) {
    console.error("Erro ao excluir lote:", err);
    setErro(err.message || "Erro ao excluir o lote.");
  } finally {
    setExecutando(false);
  }
}
 
async function buscarContaContabil(contaFinanceiraId) {
  if (!contaFinanceiraId) {
    throw new Error("Conta financeira não identificada.");
  }

  // COLOQUE AQUI O NOME EXATO DO SEU WEBHOOK
  const url = buildWebhookUrl("buscar_contabil_conta_financeira", {
    empresa_id,
    conta_id: contaFinanceiraId,
  });

  console.log("🔎 URL BUSCA CONTÁBIL:", url);

  const resp = await fetch(url);
  const texto = await resp.text();

  console.log("🔎 RETORNO BRUTO CONTA CONTÁBIL:", texto);

  if (!resp.ok) {
    throw new Error(
      texto || `Erro ao buscar conta contábil (${resp.status}).`
    );
  }

  let json;

  try {
    json = texto ? JSON.parse(texto) : null;
  } catch {
    throw new Error(
      "O webhook da conta contábil não retornou um JSON válido."
    );
  }

  console.log("🔎 JSON CONTA CONTÁBIL:", json);

  const base = Array.isArray(json) ? json[0] : json;

  const contabilId = Number(
    base?.contabil_id ??
    base?.contabilId ??
    base?.data?.contabil_id ??
    base?.data?.contabilId ??
    base?.data?.[0]?.contabil_id ??
    base?.data?.[0]?.contabilId ??
    base?.dados?.contabil_id ??
    base?.dados?.contabilId ??
    base?.dados?.[0]?.contabil_id ??
    base?.dados?.[0]?.contabilId ??
    base?.resultado?.contabil_id ??
    base?.resultado?.[0]?.contabil_id ??
    0
  );

  if (!contabilId) {
    throw new Error(
      `O webhook respondeu, mas não encontrei o contabil_id. Retorno: ${texto}`
    );
  }

  return contabilId;
}
  

 async function abrirNovoLancamento(item) {
  try {
    setErro("");

    const contabilId = await buscarContaContabil(contaId);

    const valorOriginal = Number(
      item?.valor_sugerido ??
      item?.valor ??
      0
    );

    navigate("/lancamentocontabilrapido", {
      state: {
        origem_tela: "CONCILIACAO_EXTRATO",

        data_movimento:
          item?.data_sugerida ||
          item?.data_mov,

        valor: Math.abs(valorOriginal),
        valor_original: valorOriginal,

        historico: item?.historico || "",
        tipo: item?.tipo || "",

        conciliacao_id:
          item?.conciliacao_id || null,

        origem_id:
          item?.origem_id || null,

        contabil_id: contabilId,

        lado_conta_financeira:
          valorOriginal > 0 ? "D" : "C",

        voltar_para:
          "/conciliacao-extrato",
      },
    });
  } catch (err) {
    console.error("Erro ao abrir lançamento:", err);

    setErro(
      err?.message ||
      "Não foi possível abrir o lançamento."
    );
  }
}

 async function criarLancamento(item) {
  const contraparteId = Number(item.contraparte_id || 0);
 const contaBancoId = await buscarContaContabil(contaId);

  if (!contaBancoId) {
    alert("Selecione a conta bancária.");
    return;
  }

  if (!contraparteId) {
    alert("Selecione a conta contábil da contrapartida.");
    return;
  }

  const entrada = item.tipo === "C";

  const contas = {
    debito_id: entrada ? contaBancoId : contraparteId,
    credito_id: entrada ? contraparteId : contaBancoId,
  };

  const dataLancto =
    item.data_mov ||
    item.data_movimento ||
    item.data_sugerida;

  if (!dataLancto || dataLancto === "null") {
    alert("A pendência não possui uma data válida.");
    return;
  }

  try {
    setExecutando(true);
    setErro("");

    const res = await fetch(buildWebhookUrl("lancto_modelo"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        empresa_id,
        data_lancto: dataLancto,
        debito_id: contas.debito_id,
        credito_id: contas.credito_id,
        valor: Math.abs(Number(item.valor || 0)),
        historico:
          item.historico ||
          item.descricao ||
          "Lançamento criado pela conciliação",
        lembrar: false,

        // Manda uma data válida em vez de null
        vencimento: dataLancto,
      }),
    });

    const json = await res.json();

    const retorno = Array.isArray(json)
      ? json[0]
      : json;

    if (!res.ok || retorno?.ok === false) {
      throw new Error(
        retorno?.message ||
        retorno?.mensagem ||
        "Erro ao criar lançamento contábil."
      );
    }

    // Retira a pendência criada da tela
    setResultado((atual) => ({
      ...atual,
      acoes: Array.isArray(atual?.acoes)
        ? atual.acoes.filter(
            (acao) =>
              Number(acao.conciliacao_id) !==
              Number(item.conciliacao_id)
          )
        : [],
    }));

    setLinhaContaDropdown(null);
  } catch (err) {
    console.error("Erro ao criar lançamento:", err);

    setErro(
      err.message ||
      "Erro ao criar lançamento contábil."
    );
  } finally {
    setExecutando(false);
  }
}

 async function carregarContasContabeis() {
   const r = await fetch(
     buildWebhookUrl("contas_contabeis_lancaveis", { empresa_id })
   );
 
   const j = await r.json();
 
   const base = Array.isArray(j) ? j[0] : j;
   const dados = base?.data || base?.dados || j;
 
   setContasContabeis(Array.isArray(dados) ? dados : []);
 }

 useEffect(() => {
  carregarContasContabeis();
}, [empresa_id]);

const contasFiltradasContabil = Array.isArray(contasContabeis)
  ? contasContabeis.filter((c) =>
      `${c.codigo || ""} ${c.nome || ""}`
        .toLowerCase()
        .includes(buscaContaContabil.toLowerCase())
    )
  : [];

  function selecionarContaContabilLinha(item, conta) {
  setResultado((atual) => {
    if (!atual || !Array.isArray(atual.acoes)) {
      return atual;
    }

    return {
      ...atual,
      acoes: atual.acoes.map((acao) =>
        Number(acao.conciliacao_id) ===
        Number(item.conciliacao_id)
          ? {
              ...acao,
              contraparte_id: conta.id,
              contraparte_codigo: conta.codigo,
              contraparte_nome: conta.nome,
            }
          : acao
      ),
    };
  });

  setLinhaContaDropdown(null);
  setBuscaContaContabil("");
}

 

  return (
   <div className="min-h-screen bg-[#eef7fd] px-1 py-2">
      <div className="mx-auto w-[98%] max-w-[1540px]">
        <div className="rounded-[28px] border border-cyan-100 bg-[#061f4a] p-4 shadow-[0_8px_30px_rgba(15,23,42,0.10)]">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-black text-white">
                📄 Conciliação de Extrato PDF
              </h1>
              <p className="mt-1 text-sm font-semibold text-cyan-100">
                Extrato bancário x razão contábil
              </p>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/20"
            >
              Sair
            </button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-3xl border border-cyan-100 bg-white p-4">
              <div className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
                Conta bancária
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navegarConta("anterior")}
                  className="h-10 w-10 shrink-0 rounded-full border bg-white font-black shadow-sm"
                >
                  ◀
                </button>

                {contaAtual ? (
                  <div
                    className="flex min-h-[105px] flex-1 items-center gap-4 rounded-3xl border px-4 py-3"
                    style={{
                      borderColor: contaAtual.cor_hex || "#bae6fd",
                      boxShadow: `0 8px 20px ${
                        contaAtual.cor_hex || "#0f172a"
                      }22`,
                    }}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-slate-50">
                      {contaAtual.icone_url ? (
                        <img
                          src={contaAtual.icone_url}
                          alt=""
                          className="h-9 w-9 object-contain"
                        />
                      ) : (
                        <span className="text-2xl">🏦</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-black text-slate-800">
                        {contaAtual.nome || contaAtual.conta_nome}
                      </div>

                      <div className="mt-1 text-xs font-bold text-slate-500">
                        Banco {contaAtual.nro_banco || "-"} • Ag.{" "}
                        {contaAtual.agencia || "-"} • Conta{" "}
                        {contaAtual.conta || "-"}
                      </div>

                      <div className="mt-1 text-xs font-bold text-slate-400">
                        Conta {indiceConta + 1} de {contas.length}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400">
                        Saldo
                      </div>
                      <div
                        className={`text-base font-black ${
                          Number(contaAtual.saldo_final || 0) >= 0
                            ? "text-emerald-700"
                            : "text-red-600"
                        }`}
                      >
                        {moeda(contaAtual.saldo_final)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[105px] flex-1 items-center justify-center rounded-3xl border border-dashed bg-slate-50 text-sm font-bold text-slate-400">
                    Nenhuma conta encontrada
                  </div>
                )}

                <button
                  onClick={() => navegarConta("proxima")}
                  className="h-10 w-10 shrink-0 rounded-full border bg-white font-black shadow-sm"
                >
                  ▶
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-100 bg-white p-4">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                Período
              </div>
             

             <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-xs font-black text-slate-600">
                Início
                <input
                  type="date"
                  value={inicio || ""}
                  disabled
                  title="A data inicial será identificada automaticamente pelo arquivo PDF."
                  className="mt-1 h-9 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-bold text-slate-600"
                />
              </label>

              <label className="text-xs font-black text-slate-600">
                Fim
                <input
                  type="date"
                  value={fim || ""}
                  disabled
                  title="A data final será identificada automaticamente pelo arquivo PDF."
                  className="mt-1 h-9 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-bold text-slate-600"
                />
              </label>
            </div>

            <div className="mt-2 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
              <span className="text-sm">ℹ️</span>

              <p className="text-xs font-bold leading-5 text-orange-700">
                O período não editável. As datas serão identificadas após a execução da conciliação no extrato PDF selecionado.
              </p>
            </div>

             {/*} <label className="text-xs font-black text-slate-600">
                    Senha do PDF
                    <input
                      type="password"
                      value={senhaPDF}
                      onChange={(e) => setSenhaPDF(e.target.value)}
                      placeholder="Informe somente se o PDF possuir senha"
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700"
                    />
                  </label>*/}

              <button
                onClick={carregarContas}
                className="mt-3 w-full rounded-xl border border-cyan-200 bg-cyan-50 py-2 text-xs font-black text-[#063452] hover:bg-cyan-100"
              >
                ↻ Atualizar saldos
              </button>
            </div>
          </div>

          <div className="mt-3 rounded-3xl border border-cyan-100 bg-white p-4">
            <input
              ref={inputPdfRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={escolherPdf}
              className="hidden"
            />

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Arquivo PDF
                </div>
                <div className="mt-1 truncate text-sm font-black text-slate-700">
                  {arquivo ? arquivo.name : "Nenhum arquivo selecionado"}
                </div>
                <div className="mt-1 text-xs font-bold text-slate-400">
                  {arquivo
                    ? `${(arquivo.size / 1024 / 1024).toFixed(2)} MB`
                    : "Selecione o extrato bancário."}
                </div>
              </div>

              <button
                onClick={() => inputPdfRef.current?.click()}
                className="h-10 shrink-0 rounded-xl border border-cyan-200 bg-cyan-50 px-4 text-sm font-black text-[#063452] hover:bg-cyan-100"
              >
                📥 Selecionar PDF
              </button>
            </div>
          </div>

          {erro && (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              ⛔ {erro}
            </div>
          )}


      


           {Array.isArray(resultado?.acoes) && resultado.acoes.length > 0 && (
            <div className="mt-4 rounded-3xl border border-cyan-100 bg-white p-4">
              <div className="mb-3 text-sm font-black text-[#063452]">
                Registros encontrados ({resultado.acoes.length})
              </div>

              <div className="overflow-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-[#0F172A] text-left text-white">
                      <th className="px-3 py-3">O que fazer?</th>
                      <th className="px-3 py-3">Tipo</th>
                      <th className="px-3 py-3">Data</th>
                      <th className="px-3 py-3">Histórico</th>
                      <th className="px-3 py-3">Motivo</th>
                      <th className="px-3 py-3">Origem</th>
                      <th className="px-3 py-3">Lote</th>
                      <th className="px-3 py-3">Lançamento</th>
                      <th className="px-3 py-3">
                        Contrapartida
                      </th>
                      <th className="px-3 py-3">Conciliação</th>
                      <th className="px-3 py-3 text-right">Valor</th>
                      <th className="px-3 py-3">Ação</th>
                    </tr>
                  </thead>

                  <tbody>
                    {resultado.acoes.map((item, index) => (
                      <tr
                        key={`${item.conciliacao_id || index}-${index}`}
                        className={
                          index % 2 === 0
                            ? "bg-white"
                            : "bg-slate-50"
                        }
                      >
                        <td className="border-b border-slate-100 px-3 py-3">
                          {item.acao === "CRIAR_LANCAMENTO" ? (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                              Criar no Razão
                            </span>
                          ) : item.acao === "EXCLUIR_LOTE" ? (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                              Excluir do Razão
                            </span>
                          ) : (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
                              {item.acao || "-"}
                            </span>
                          )}
                        </td>

                        <td className="border-b border-slate-100 px-3 py-3">
                          {item.tipo === "D" ? (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                              Débito
                            </span>
                          ) : item.tipo === "C" ? (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                              Crédito
                            </span>
                          ) : (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
                              {item.tipo || "-"}
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap border-b border-slate-100 px-3 py-3 font-black">
                          {item.data_mov || "-"}
                        </td>

                        <td className="border-b border-slate-100 px-3 py-3">
                          {item.historico || "-"}
                        </td>
                      

                        <td className="border-b border-slate-100 px-3 py-3">
                          {item.motivo === "NAO_EXISTE_NO_EXTRATO" ? (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                              Inexistente no Extrato
                            </span>
                          ) : item.motivo === "NAO_EXISTE_NO_RAZAO" ? (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                              Inexistente no Razão
                            </span>
                          ) : (
                            <span className="inline-flex whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
                              {item.motivo || "-"}
                            </span>
                          )}
                        </td>

                        <td className="border-b border-slate-100 px-3 py-3">
                          {item.origem === "R"
                            ? "Razão"
                            : item.origem === "P"
                            ? "PDF"
                            : item.origem || "-"}
                        </td>

                        <td className="border-b border-slate-100 px-3 py-3 font-black">
                          {item.lote_id ?? "-"}
                        </td>

                        <td className="border-b border-slate-100 px-3 py-3">
                          {item.lancamento_id ?? "-"}
                        </td>
                        
                         <td className="relative border-b border-slate-100 px-3 py-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setLinhaContaDropdown((atual) =>
                                          atual === item.conciliacao_id
                                            ? null
                                            : item.conciliacao_id
                                        );

                                        setBuscaContaContabil("");
                                      }}
                                      className="flex h-9 min-w-[280px] items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left text-xs font-bold text-slate-700 hover:bg-slate-50"
                                    >
                                      <span className="truncate">
                                        {item.contraparte_id
                                          ? `${item.contraparte_codigo} — ${item.contraparte_nome}`
                                          : "Selecione a contrapartida"}
                                      </span>

                                      <span className="ml-2 text-slate-400">▼</span>
                                    </button>

                                    {linhaContaDropdown === item.conciliacao_id && (
                                      <div className="absolute left-3 z-50 mt-1 w-[360px] rounded-xl border border-slate-200 bg-white shadow-xl">
                                        <div className="border-b border-slate-100 p-2">
                                          <input
                                            type="text"
                                            value={buscaContaContabil}
                                            onChange={(e) =>
                                              setBuscaContaContabil(e.target.value)
                                            }
                                            placeholder="Buscar código ou nome..."
                                            autoFocus
                                            className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs font-bold outline-none focus:border-blue-400"
                                          />
                                        </div>

                                        <div className="max-h-64 overflow-y-auto">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setLinhaContaNova(item);
                                              setModalContaAberto(true);
                                              setLinhaContaDropdown(null);
                                            }}
                                            className="w-full px-3 py-2 text-left text-xs font-black text-blue-700 hover:bg-blue-50"
                                          >
                                            ➕ Criar nova conta para este histórico
                                          </button>

                                          {contasFiltradasContabil.map((conta) => (
                                            <button
                                              key={conta.id}
                                              type="button"
                                              onClick={() =>
                                                selecionarContaContabilLinha(
                                                  item,
                                                  conta
                                                )
                                              }
                                              className="block w-full px-3 py-2 text-left text-xs hover:bg-blue-50"
                                            >
                                              <span className="font-black">
                                                {conta.codigo}
                                              </span>
                                              {" — "}
                                              {conta.nome}
                                            </button>
                                          ))}

                                          {contasFiltradasContabil.length === 0 && (
                                            <div className="px-3 py-3 text-xs font-bold text-slate-400">
                                              Nenhuma conta encontrada
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </td>
                                                          <td className="border-b border-slate-100 px-3 py-3">
                          {item.conciliacao_id ?? "-"}
                        </td>

                        <td
                          className={`whitespace-nowrap border-b border-slate-100 px-3 py-3 text-right font-black ${
                            item.tipo === "D"
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {moeda(item.valor)}
                        </td>

            <td className="border-b border-slate-100 px-3 py-3 text-center">
                  {item.acao === "CRIAR_LANCAMENTO" && (
                    <button
                        type="button"
                        onClick={() => criarLancamento(item)}
                        disabled={
                          executando ||
                          !item.contraparte_id
                        }
                        className="whitespace-nowrap rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-black text-emerald-700 disabled:opacity-40"
                      >
                        Criar
                      </button>
                  )}

                  {item.acao === "EXCLUIR_LOTE" && (
                    <button
                      type="button"
                      onClick={() => excluirLote(item)}
                      disabled={executando}
                      className="whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-black text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  )}
                </td>
                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

 

            {resultado && (
              <>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-black text-slate-600">
                      Data inicial do extrato
                    </label>

                    <input
                      type="date"
                      value={resultado?.data_inicio || ""}
                      disabled
                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-bold text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-black text-slate-600">
                      Data final do extrato
                    </label>

                    <input
                      type="date"
                      value={resultado?.data_fim || ""}
                      disabled
                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-bold text-slate-600"
                    />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
                  <Card
                    titulo="Pendências do PDF"
                    valor={moeda(totalPdfPendente)}
                    alerta={totalPdfPendente !== 0}
                  />

                  <Card
                    titulo="Pendências do razão"
                    valor={moeda(totalRazaoPendente)}
                    alerta={totalRazaoPendente !== 0}
                  />

                  <Card
                    titulo="Criar lançamentos"
                    valor={criarLancamentos}
                    alerta={criarLancamentos > 0}
                  />

                  <Card
                    titulo="Excluir lotes"
                    valor={excluirLotes}
                    alerta={excluirLotes > 0}
                  />

                  <Card
                    titulo="Total de pendências"
                    valor={pendencias}
                    alerta={pendencias > 0}
                    ok={pendencias === 0}
                  />
                </div>
              </>
            )}


 
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => navigate(-1)}
              className="h-11 rounded-xl border bg-white px-5 text-sm font-black text-slate-600"
            >
              Cancelar
            </button>
             <button
                type="button"
                onClick={() => executarConciliacao()}
                disabled={executando || !arquivo || !contaId}
                className={`h-11 rounded-xl px-6 text-sm font-black text-white ${
                  executando || !arquivo || !contaId
                    ? "cursor-not-allowed bg-slate-400"
                    : "bg-[#063452] hover:brightness-110"
                }`}
              >
                {executando ? "Conciliando..." : "Executar conciliação"}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ titulo, valor, alerta = false, ok = false }) {
  return (
    <div
      className={`rounded-2xl border bg-white px-4 py-3 shadow-sm ${
        alerta
          ? "border-red-200"
          : ok
          ? "border-emerald-200"
          : "border-cyan-100"
      }`}
    >
      <div className="text-xs font-black uppercase tracking-wider text-slate-400">
        {titulo}
      </div>
      <div
        className={`mt-1 text-xl font-black ${
          alerta
            ? "text-red-600"
            : ok
            ? "text-emerald-700"
            : "text-[#063452]"
        }`}
      >
        {valor}
      </div>
    </div>
  );
}
