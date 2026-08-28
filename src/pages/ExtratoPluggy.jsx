import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { fetchSeguro } from "../utils/apiSafe";

const dinheiro = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function numero(valor) {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
  if (valor == null || valor === "") return 0;

  const texto = String(valor).trim();
  if (texto.includes(",")) {
    return Number(texto.replace(/\./g, "").replace(",", ".")) || 0;
  }
  return Number(texto) || 0;
}

function dataISO(valor) {
  if (!valor) return "";
  return String(valor).slice(0, 10);
}

function dataBR(valor) {
  const iso = dataISO(valor);
  if (!iso) return "—";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function extrairObjeto(retorno) {
  let atual = retorno;

  for (let i = 0; i < 5; i += 1) {
    if (Array.isArray(atual)) {
      atual = atual[0];
      continue;
    }

    if (atual?.json) {
      atual = atual.json;
      continue;
    }

    if (atual?.data && !atual?.movimentos && !atual?.transacoes && !atual?.results) {
      atual = atual.data;
      continue;
    }

    break;
  }

  return atual || {};
}

function extrairMovimentos(retorno) {
  const objeto = extrairObjeto(retorno);
  const candidatos = [
    objeto.movimentos,
    objeto.transacoes,
    objeto.transactions,
    objeto.results,
    objeto.extrato?.movimentos,
  ];

  return candidatos.find(Array.isArray) || [];
}

function normalizarMovimento(item, indice) {
  let valor = numero(item.valor ?? item.amount);
  const tipoOriginal = String(item.tipo ?? item.type ?? "").toUpperCase();

  // Na conta bancária, débito deve seguir negativo e crédito positivo.
  if (tipoOriginal === "DEBIT") valor = -Math.abs(valor);
  if (tipoOriginal === "CREDIT") valor = Math.abs(valor);

  return {
    _id: item.id || `pluggy_${indice}`,
    data: dataISO(item.data ?? item.date),
    historico:
      item.descricao ??
      item.description ??
      item.descricao_original ??
      item.descriptionRaw ??
      "Movimento bancário",
    tipo: valor < 0 ? "saida" : "entrada",
    valor,
    saldo: numero(item.saldo ?? item.balance),
    status: item.status || null,
    categoria: item.categoria ?? item.category ?? null,
    categoria_id: item.categoria_id ?? item.categoryId ?? null,
    operacao: item.operacao ?? item.operationType ?? null,
    pluggy_transaction_id: item.id || null,
    provider_id: item.provider_id ?? item.providerId ?? null,
    pluggy_account_id: item.account_id ?? item.accountId ?? null,
  };
}

export default function ExtratoPluggy() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const empresaId = state?.empresa_id ?? localStorage.getItem("empresa_id");
  const contaId = state?.conta_id ?? localStorage.getItem("conta_id");
  const contaNome = state?.conta_nome || "Conta bancária";
  const dataInicio = state?.data_inicio;
  const dataFim = state?.data_fim;

  const [movimentos, setMovimentos] = useState([]);
  const [dadosExtrato, setDadosExtrato] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!empresaId || !contaId || !dataInicio || !dataFim) {
      setErro("Empresa, conta ou período não informado.");
      setCarregando(false);
      return;
    }

    buscarExtrato();
    // A busca deve ocorrer uma vez com os parâmetros recebidos pelo modal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function buscarExtrato() {
    setCarregando(true);
    setErro("");

    try {
      const url = buildWebhookUrl("pluggy-get-extrato", {
        empresa_id: empresaId,
        conta_id: contaId,
        data_inicio: dataInicio,
        data_fim: dataFim,
      });

      const retorno = await fetchSeguro(url, { method: "GET" });
      const objeto = extrairObjeto(retorno);

      if (objeto?.ok === false) {
        throw new Error(objeto?.mensagem || objeto?.message || "Não foi possível buscar o extrato.");
      }

      const lista = extrairMovimentos(retorno).map(normalizarMovimento);
      setDadosExtrato(objeto);
      setMovimentos(lista);
    } catch (e) {
      console.error("ERRO AO BUSCAR EXTRATO PLUGGY:", e);
      setErro(e?.message || "Erro ao buscar o extrato bancário.");
    } finally {
      setCarregando(false);
    }
  }

  const resumo = useMemo(() => {
    let entradas = 0;
    let saidas = 0;

    movimentos.forEach((movimento) => {
      if (movimento.valor >= 0) entradas += movimento.valor;
      else saidas += Math.abs(movimento.valor);
    });

    return {
      quantidade: movimentos.length,
      entradas,
      saidas,
      liquido: entradas - saidas,
      saldoFinal:
        movimentos.length > 0
          ? movimentos[movimentos.length - 1].saldo
          : numero(dadosExtrato?.saldo_final ?? dadosExtrato?.saldo),
    };
  }, [movimentos, dadosExtrato]);
 
async function importarExtrato() {
  if (salvando) return;

  if (!empresaId) {
    setErro("Empresa não informada.");
    return;
  }

  if (!contaId) {
    setErro("Conta financeira não informada.");
    return;
  }

  if (!Array.isArray(movimentos) || movimentos.length === 0) {
    setErro("Nenhum movimento disponível para importar.");
    return;
  }

  setSalvando(true);
  setErro("");

  try {
    /*
     * 1. Ordenação dos movimentos
     */
    const movimentosOrdenados = [...movimentos].sort(
      (a, b) =>
        new Date(a.data) - new Date(b.data)
    );

    /*
     * 2. Totais do diagnóstico
     */
    const totalCreditos = movimentosOrdenados
      .filter(
        movimento =>
          Number(movimento.valor) > 0
      )
      .reduce(
        (total, movimento) =>
          total + Number(movimento.valor),
        0
      );

    const totalDebitos = Math.abs(
      movimentosOrdenados
        .filter(
          movimento =>
            Number(movimento.valor) < 0
        )
        .reduce(
          (total, movimento) =>
            total + Number(movimento.valor),
          0
        )
    );

    const quantidadeCreditos =
      movimentosOrdenados.filter(
        movimento =>
          Number(movimento.valor) > 0
      ).length;

    const quantidadeDebitos =
      movimentosOrdenados.filter(
        movimento =>
          Number(movimento.valor) < 0
      ).length;

    const movimentacaoLiquida =
      totalCreditos - totalDebitos;

    /*
     * 3. Saldos
     */
    const ultimoMovimento =
      movimentosOrdenados[
        movimentosOrdenados.length - 1
      ];

    const saldoFinal = Number(
      dadosExtrato?.resumo?.saldo_final ??
      ultimoMovimento?.saldo ??
      0
    );

    const saldoInicial = Number(
      dadosExtrato?.resumo?.saldo_anterior ??
      saldoFinal - movimentacaoLiquida
    );

    const saldoCalculado =
      saldoInicial + movimentacaoLiquida;

    const arredondar = valor =>
      Math.round(
        (
          Number(valor) +
          Number.EPSILON
        ) * 100
      ) / 100;

    const diferencaSaldo = arredondar(
      saldoFinal - saldoCalculado
    );

    /*
     * 4. JSON de lançamentos esperado pela
     * fn_importar_extrato
     */
    const lancamentos =
      movimentosOrdenados.map(movimento => {
        const valor =
          Number(movimento.valor);

        return {
          data:
            String(movimento.data).slice(0, 10),
          

            historico:
  limparHistoricoPluggy(
    movimento.historico
  ) || "Movimento bancário",

          valor:
            arredondar(valor),

          tipo:
            valor < 0
              ? "saida"
              : "entrada",

          natureza_financeira:
            null,
           
          natureza_movimento: null,

          tipo_evento:
            null,

          classificacao:
            null,

          /*
           * Identificadores da Pluggy.
           * A procedure atual não possui colunas
           * específicas para eles, mas eles ficam
           * preservados no JSON de origem.
           */
          pluggy_transaction_id:
            movimento.pluggy_transaction_id ??
            movimento.id ??
            null,

          provider_id:
            movimento.provider_id ??
            null,

          pluggy_account_id:
            movimento.pluggy_account_id ??
            movimento.account_id ??
            dadosExtrato?.pluggy?.account_id ??
            null,

          status:
            movimento.status ??
            "POSTED",

          categoria:
            movimento.categoria ??
            null,

          categoria_id:
            movimento.categoria_id ??
            null,

          saldo:
            arredondar(
              movimento.saldo ?? 0
            )
        };
      });

    /*
     * 5. Cabeçalho esperado por
     * p_dados_importacao_pdf
     *
     * O diagnóstico precisa ficar dentro
     * da propriedade "diagnostico".
     */
    const dadosImportacao = {
      banco:
        dadosExtrato?.conta?.banco ??
        contaNome ??
        null,

      data_inicio:
        dataInicio,

      data_fim:
        dataFim,

      quantidade:
        lancamentos.length,

      diagnostico: {
        origem:
          "PLUGGY",

        tipo_layout:
          "PLUGGY_API",

        quantidade_linhas:
          lancamentos.length,

        registros:
          lancamentos.length,

        creditos:
          quantidadeCreditos,

        debitos:
          quantidadeDebitos,

        total_creditos:
          arredondar(totalCreditos),

        total_debitos:
          arredondar(totalDebitos),

        saldo_inicial:
          arredondar(saldoInicial),

        saldo_final:
          arredondar(saldoFinal),

        saldo_calculado:
          arredondar(saldoCalculado),

        diferenca_saldo:
          diferencaSaldo,

        saldo_confere:
          Math.abs(diferencaSaldo) <= 0.01,

        primeiro_movimento:
          movimentosOrdenados[0]?.data ??
          null,

        ultimo_movimento:
          ultimoMovimento?.data ??
          null,

        pluggy: {
          item_id:
            dadosExtrato?.pluggy?.item_id ??
            null,

          account_id:
            dadosExtrato?.pluggy?.account_id ??
            lancamentos[0]?.pluggy_account_id ??
            null,

          atualizado_em:
            dadosExtrato?.pluggy?.atualizado_em ??
            null
        },

        paginacao:
          dadosExtrato?.paginacao ?? {
            next: null
          }
      }
    };

    /*
     * 6. Payload enviado ao webhook importa_extrato
     */
    const payload = {
      empresa_id:
        Number(empresaId),

      conta_observada:
        Number(contaId),

      lancamentos,

      // Envia objeto, não usa JSON.stringify aqui.
      dados_importacao_pdf:
        dadosImportacao
    };

    console.log(
      "PAYLOAD IMPORTAÇÃO PLUGGY:",
      payload
    );

    /*
     * 7. Chamada do mesmo webhook usado pela
     * importação bancária
     */
    const url =
      buildWebhookUrl("importa_extrato");

    const retorno = await fetchSeguro(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body:
        JSON.stringify(payload)
    });

    console.log(
      "RETORNO IMPORTAÇÃO PLUGGY:",
      retorno
    );

    /*
     * 8. Normalização do retorno do n8n
     */
    const bruto =
      Array.isArray(retorno)
        ? retorno[0]
        : retorno;

    const resultado =
      bruto?.fn_importar_extrato_e_conciliar ||
      bruto?.data?.[0]
        ?.fn_importar_extrato_e_conciliar ||
      bruto?.data
        ?.fn_importar_extrato_e_conciliar ||
      bruto?.data?.[0] ||
      bruto?.data ||
      bruto;

    console.log(
      "RESULTADO IMPORTAÇÃO PLUGGY:",
      resultado
    );

    if (!resultado?.ok) {
      throw new Error(
        resultado?.message ||
        resultado?.mensagem ||
        "Erro ao importar e analisar o extrato."
      );
    }

    /*
     * 9. Guarda o resultado para a tela
     * ConciliacaoRevisao
     */
    localStorage.setItem(
      "conta_id",
      String(contaId)
    );

    localStorage.setItem(
      "resultado_analise_conciliacao",
      JSON.stringify(resultado)
    );

    localStorage.setItem(
      "lote_conciliacao_id",
      String(resultado.lote_id || 0)
    );

    /*
     * 10. Abre a revisão já existente
     */
    navigate("/conciliacao-revisao");

  } catch (erroImportacao) {
    console.error(
      "ERRO AO IMPORTAR EXTRATO PLUGGY:",
      erroImportacao
    );

    setErro(
      erroImportacao?.message ||
      "Erro inesperado ao importar o extrato."
    );
  } finally {
    setSalvando(false);
  }
}


function limparHistoricoPluggy(historico) {
  return String(historico || "")
    // Remove complemento de saque: agência, máquina e sequência.
    .replace(/\s*-\s*AG\d+MAQ\S*/gi, "")

    // Remove documento no final.
    .replace(/\s*-\s*DOCTO\s*:\s*\S+/gi, "")

    // Remove complemento do extrato.
    .replace(/\s*-\s*EXTRATOMES(?:\([A-Z]\))?/gi, "")

    // Corrige espaços e separadores restantes.
    .replace(/\s*-\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}


  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <header className="bg-[#0F172A] px-5 py-4 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
                Extrato bancário conectado
              </div>
              <h1 className="mt-1 text-xl font-black">{contaNome}</h1>
              <div className="mt-1 text-sm font-bold text-slate-300">
                {dataBR(dataInicio)} atés {dataBR(dataFim)}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-full border border-slate-500 px-4 py-2 text-sm font-black hover:bg-slate-800"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={buscarExtrato}
                disabled={carregando || salvando}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-black hover:bg-blue-500 disabled:opacity-50"
              >
                {carregando ? "Atualizando..." : "Atualizar"}
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-5">
          {erro && (
            <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-bold text-red-700">
              {erro}
            </div>
          )}

          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Resumo titulo="Movimentos" valor={String(resumo.quantidade)} cor="text-slate-900" />
            <Resumo titulo="Entradas" valor={dinheiro.format(resumo.entradas)} cor="text-emerald-700" />
            <Resumo titulo="Saídas" valor={dinheiro.format(resumo.saidas)} cor="text-red-700" />
            <Resumo
              titulo="Movimentação líquida"
              valor={dinheiro.format(resumo.liquido)}
              cor={resumo.liquido < 0 ? "text-red-700" : "text-blue-700"}
            />
            <Resumo
              titulo="Saldo final informado"
              valor={dinheiro.format(resumo.saldoFinal)}
              cor={resumo.saldoFinal < 0 ? "text-red-700" : "text-emerald-700"}
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="max-h-[58vh] overflow-auto">
              <table className="w-full min-w-[1150px] table-fixed text-xs">
                <thead className="sticky top-0 z-10 bg-[#0F172A] text-left text-white">
                  <tr>
                    <th className="w-[90px] px-3 py-3">Data</th>
                    <th className="px-3 py-3">Histórico</th>
                    <th className="w-[170px] px-3 py-3">Operação</th>
                    <th className="w-[115px] px-3 py-3 text-right">Valor</th>
                    <th className="w-[125px] px-3 py-3 text-right">Saldo</th>
                    <th className="w-[90px] px-3 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentos.map((movimento, indice) => (
                    <tr
                      key={movimento._id}
                      className={indice % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="border-t border-slate-200 px-3 py-2 font-bold">
                        {dataBR(movimento.data)}
                      </td>
                      <td className="border-t border-slate-200 px-3 py-2">
                        <div className="font-extrabold text-slate-800">{movimento.historico}</div>
                        {movimento.categoria && (
                          <div className="mt-0.5 text-[11px] font-semibold text-slate-500">
                            {movimento.categoria}
                          </div>
                        )}
                      </td>

                       <td className="border-t border-slate-200 px-3 py-2 text-[11px] font-bold leading-tight text-slate-600">
                            {String(movimento.operacao || movimento.tipo)
                              .replaceAll("_", " ")}
                          </td>

                      <td
                        className={`border-t border-slate-200 px-3 py-2 text-right font-black ${
                          movimento.valor < 0 ? "text-red-700" : "text-emerald-700"
                        }`}
                      >
                        {dinheiro.format(movimento.valor)}
                      </td>
                      <td
                        className={`border-t border-slate-200 px-3 py-2 text-right font-black ${
                          movimento.saldo < 0 ? "text-red-700" : "text-slate-800"
                        }`}
                      >
                        {dinheiro.format(movimento.saldo)}
                      </td>
                      <td className="border-t border-slate-200 px-3 py-2 text-center">
                        <span className="rounded-full bg-emerald-100 px-2 py-1 font-black text-emerald-800">
                          {movimento.status || "POSTED"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {!carregando && movimentos.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-14 text-center font-bold text-slate-500">
                        Nenhum movimento encontrado no período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <div className="text-xs font-bold text-slate-500">
              Os movimentos só serão gravados quando você clicar em Importar e revisar.
            </div>

            <button
              type="button"
              onClick={importarExtrato}
              disabled={carregando || salvando || movimentos.length === 0}
              className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-black text-white shadow-lg hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando ? "Importando..." : "Importar e revisar"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function Resumo({ titulo, valor, cor }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">{titulo}</div>
      <div className={`mt-1 whitespace-nowrap text-lg font-black ${cor}`}>{valor}</div>
    </div>
  );
}
