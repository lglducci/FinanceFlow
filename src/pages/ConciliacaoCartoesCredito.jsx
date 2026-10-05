   import { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";

const moeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const dataBR = (valor) => {
  const data = String(valor || "").slice(0, 10);
  const [ano, mes, dia] = data.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : "-";
};

const lerResposta = async (resp) => {
  const texto = await resp.text();
  let json = null;
  if (texto.trim()) {
    try {
      json = JSON.parse(texto);
    } catch {
      throw new Error("O webhook não retornou um JSON válido.");
    }
  }
  if (!resp.ok || json?.ok === false) {
    throw new Error(
      json?.message || json?.mensagem || json?.erro || "Erro ao executar a operação."
    );
  }
  return json;
};

const extrairDados = (json) => {
  const raiz = Array.isArray(json)
    ? json
    : json?.data ?? json?.dados ?? json?.resultado ?? json;
  const itens = Array.isArray(raiz) ? raiz : raiz ? [raiz] : [];

  return itens.flatMap((item) => {
    const valor =
      item?.fn_cartoes_compras_reclassificacao ??
      item?.data?.fn_cartoes_compras_reclassificacao ??
      item?.resultado ??
      item;
    return Array.isArray(valor) ? valor : valor ? [valor] : [];
  });
};

export default function ConciliacaoCartoesCredito() {
  const navigate = useNavigate();
  const [ajudaAberta, setAjudaAberta] = useState(false);
  const empresaId = localStorage.getItem("empresa_id");
  const [cartoes, setCartoes] = useState([]);
  const [cartaoId, setCartaoId] = useState("");
  const [inicio, setInicio] = useState(`${hojeLocal().slice(0, 7)}-01`);
  const [fim, setFim] = useState(hojeLocal());
  const [dados, setDados] = useState([]);
  const [contas, setContas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [acao, setAcao] = useState("");
  const [itemModal, setItemModal] = useState(null);
  const [buscaConta, setBuscaConta] = useState("");
  const [contaSelecionada, setContaSelecionada] = useState(null);

  const cartaoAtual = useMemo(
    () => cartoes.find((c) => String(c.id) === String(cartaoId)),
    [cartoes, cartaoId]
  );



function trocarCartao(direcao) {
  if (!cartoes.length) return;

  const indiceAtual = cartoes.findIndex(
    (cartao) => String(cartao.id) === String(cartaoId)
  );

  const indiceBase = indiceAtual >= 0 ? indiceAtual : 0;

  const novoIndice =
    direcao === "anterior"
      ? (indiceBase - 1 + cartoes.length) % cartoes.length
      : (indiceBase + 1) % cartoes.length;

  setCartaoId(String(cartoes[novoIndice].id));
  setDados([]);
  setErro("");
}


  const contasFiltradas = useMemo(() => {
    const termo = buscaConta.toLowerCase().trim();
    return contas
      .filter((c) =>
        `${c.codigo || ""} ${c.nome || c.descricao || ""}`
          .toLowerCase()
          .includes(termo)
      )
      .slice(0, 30);
  }, [contas, buscaConta]);

  useEffect(() => {
    async function carregarBase() {
      try {
        const [respCartoes, respContas] = await Promise.all([
          fetch(buildWebhookUrl("cartoes", { id_empresa: empresaId })),
          fetch(buildWebhookUrl("despesa_cmv", { empresa_id: empresaId })),
        ]);
        const [jsonCartoes, jsonContas] = await Promise.all([
          lerResposta(respCartoes),
          lerResposta(respContas),
        ]);
        const listaCartoes = Array.isArray(jsonCartoes)
          ? jsonCartoes
          : jsonCartoes?.data || jsonCartoes?.dados || [];

        const baseContas = Array.isArray(jsonContas)
  ? jsonContas[0]
  : jsonContas;

const listaContas =
  baseContas?.data ||
  baseContas?.dados ||
  (Array.isArray(jsonContas) ? jsonContas : []);


        setCartoes(listaCartoes);
        setContas(
          listaContas.map((conta) => ({
            ...conta,
            id: conta.id ?? conta.conta_id,
            codigo: conta.codigo ?? conta.conta_codigo,
            nome: conta.nome ?? conta.conta_nome ?? conta.descricao,
          }))
        );
        if (listaCartoes[0]) setCartaoId(String(listaCartoes[0].id));
      } catch (err) {
        setErro(err?.message || "Não foi possível carregar os dados iniciais.");
      }
    }
    if (empresaId) carregarBase();
  }, [empresaId]);

  async function consultar() {
    if (!cartaoId) return setErro("Selecione o cartão.");
    if (!inicio || !fim) return setErro("Informe o período.");
    if (inicio > fim) return setErro("A data inicial não pode ser maior que a final.");
    try {
      setCarregando(true);
      setErro("");
      const resp = await fetch(buildWebhookUrl("conciliacao_cartao_credito"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: Number(empresaId),
          cartao_id: Number(cartaoId),
          data_inicio: inicio,
          data_fim: fim,
        }),
      });
      setDados(extrairDados(await lerResposta(resp)));
    } catch (err) {
      setDados([]);
      setErro(err?.message || "Não foi possível consultar os dados.");
    } finally {
      setCarregando(false);
    }
  }

  function abrirReclassificar(item) {
    if (!item.lote_id) {
      setErro("Este lançamento não possui lote contábil para reclassificação.");
      return;
    }

    setItemModal(item);
    setBuscaConta("");
    setContaSelecionada(null);
  }

  async function reclassificar() {
    if (!itemModal || !contaSelecionada) return;
    try {
      setAcao("reclassificar");
      setErro("");
      const resp = await fetch(buildWebhookUrl("reclassifica_perna_lote"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: Number(empresaId),
          lote_id: Number(itemModal.lote_id),
          tipo: "D",
          nova_conta_id: Number(contaSelecionada.id),
        }),
      });
      await lerResposta(resp);
      setDados((lista) =>
        lista.map((item) =>
          item === itemModal
            ? {
                ...item,
                contabil_id: contaSelecionada.id,
                conta_codigo: contaSelecionada.codigo,
                conta_nome: contaSelecionada.nome || contaSelecionada.descricao,
              }
            : item
        )
      );
      setItemModal(null);
    } catch (err) {
      setErro(err?.message || "Não foi possível reclassificar.");
    } finally {
      setAcao("");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-3 text-slate-800">
      {ajudaAberta && <AjudaReclassificacaoCartao onClose={() => setAjudaAberta(false)} />}
      <div className="mx-auto max-w-[1600px]">
        <section className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5" style={{ background: "linear-gradient(110deg, #f0f5fc, #f4f8f9)", borderColor: "#d8e2ee", borderLeft: "3px solid #6d8caf", color: "#263c55" }}>
            <div>
              <div className="text-sm font-semibold">▣ Conciliação de Cartão de Crédito</div>
              <div className="mt-0.5 text-[11px] font-medium text-slate-600">
                Razão das compras e reclassificação das despesas
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => setAjudaAberta(true)} title="Ajuda" aria-label="Ajuda sobre reclassificação contábil do cartão" style={{width:28,height:28,background:'#ffffff',color:'#1d4ed8',border:'1px solid #bacce3'}} className="rounded-full text-sm font-bold">?</button>
              <button type="button" onClick={() => navigate(-1)} className="h-8 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">← Voltar</button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-3 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-xl border border-cyan-300 bg-white p-3">
              <div className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">
                Cartão
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => trocarCartao("anterior")}
                  disabled={cartoes.length <= 1}
                  className="h-8 w-8 shrink-0 rounded-full border border-slate-200 bg-white text-xs font-black text-blue-700 shadow-sm hover:bg-blue-50 disabled:opacity-30"
                >
                  {"<<"}
                </button>

                <div className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-black text-slate-900">
                        {cartaoAtual?.nome ||
                          cartaoAtual?.descricao ||
                          cartaoAtual?.apelido ||
                          `Cartão ${cartaoId || "-"}`}
                      </div>

                      <div className="mt-0.5 text-xs font-bold text-slate-500">
                        Final {String(cartaoAtual?.numero || "").slice(-4) || "----"}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/app/edit-card/${cartaoAtual.id}`)}
                          disabled={!cartaoAtual?.id}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[9px] font-black text-blue-700 hover:bg-blue-100 disabled:opacity-40"
                        >
                          Editar cartão
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate("/app/new-card")}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700 hover:bg-emerald-100"
                        >
                          + Novo cartão
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] font-bold text-slate-400">Disponível</div>
                      <div className="text-sm font-black text-emerald-700">
                        {moeda(cartaoAtual?.limite_disponivel)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                    <div className="rounded-md bg-slate-100 px-1.5 py-1">
                      <div className="font-bold text-slate-500">Limite</div>
                      <div className="font-black text-slate-900">
                        {moeda(cartaoAtual?.limite_total)}
                      </div>
                    </div>

                    <div className="rounded-md bg-slate-100 px-1.5 py-1">
                      <div className="font-bold text-slate-500">Fecha</div>
                      <div className="font-black text-slate-900">
                        Dia {cartaoAtual?.fechamento_dia || "-"}
                      </div>
                    </div>

                    <div className="rounded-md bg-slate-100 px-1.5 py-1">
                      <div className="font-bold text-slate-500">Vence</div>
                      <div className="font-black text-slate-900">
                        Dia {cartaoAtual?.vencimento_dia || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => trocarCartao("proximo")}
                  disabled={cartoes.length <= 1}
                  className="h-8 w-8 shrink-0 rounded-full border border-slate-200 bg-white text-xs font-black text-blue-700 shadow-sm hover:bg-blue-50 disabled:opacity-30"
                >
                  {">>"}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-cyan-300 bg-white p-3">
              <div className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">
                Período
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="text-[10px] font-black text-slate-600">
                  Início
                  <input
                    type="date"
                    value={inicio}
                    onChange={(e) => setInicio(e.target.value)}
                    className="mt-1 block h-9 w-full rounded-lg border border-slate-300 px-2 text-xs font-bold"
                  />
                </label>

                <label className="text-[10px] font-black text-slate-600">
                  Fim
                  <input
                    type="date"
                    value={fim}
                    onChange={(e) => setFim(e.target.value)}
                    className="mt-1 block h-9 w-full rounded-lg border border-slate-300 px-2 text-xs font-bold"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={consultar}
                disabled={carregando || !cartaoId}
                className="mt-3 h-9 w-full rounded-lg bg-[#063452] px-5 text-xs font-black text-white hover:bg-[#0b4568] disabled:opacity-50"
              >
                {carregando ? "Carregando..." : "Consultar"}
              </button>
            </div>
          </div>
        </section>

        {erro && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700">
            {erro}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <div>
              <div className="text-sm font-black text-[#063452]">Razão das compras do cartão</div>
              <div className="text-[10px] font-bold text-slate-400">
                {inicio} até {fim} · {cartaoAtual?.nome || cartaoAtual?.descricao || `Cartão ${cartaoId || "-"}`}
              </div>
            </div>
            <div className="text-xs font-black text-slate-500">{dados.length} registro(s)</div>
          </div>

          {carregando ? (
            <div className="p-12 text-center text-sm font-black text-slate-400">
              Carregando dados...
            </div>
          ) : dados.length === 0 ? (
            <div className="p-12 text-center text-sm font-black text-slate-400">
              Nenhum dado encontrado no período.
            </div>
          ) : (
            <div className="overflow-auto">

                 <table className="w-[1560px] table-fixed text-sm">
                <thead>
                  <tr className="bg-[#0F172A] text-left text-white">
                    <th className="w-[90px] px-2 py-2">Data</th>
                    <th className="w-[270px] px-2 py-2">Estabelecimento</th>

                    <th className="w-[85px] px-2 py-2 text-center">Parcela</th>
                    <th className="w-[235px] px-2 py-2">Débito</th>

                    <th className="w-[105px] px-2 py-2 text-right">Valor</th>
                        <th className="w-[85px] px-2 py-2 text-center">Lote</th>
                    <th className="w-[105px] px-2 py-2 text-center">Status</th>
                    <th className="w-[155px] px-2 py-2 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((item, index) => (
                    <tr
                      key={item.id || item.compra_match_id || `${item.data_compra}-${index}`}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="border-b border-slate-100 px-2 py-2 font-black">{dataBR(item.data_compra)}</td>
                      <td title={item.estabelecimento || ""} className="truncate border-b border-slate-100 px-2 py-2">
                        {item.estabelecimento || "-"}
                      </td>

                      <td className="border-b border-slate-100 px-2 py-2 text-center">{item.parcela_texto || "-"}</td>
                      <td className="border-b border-slate-100 px-2 py-2">
                        <div className="font-black">{item.conta_codigo || "-"}</div>
                        <div className="truncate text-[10px] text-slate-500">{item.conta_nome || "-"}</div>
                      </td>
                     {/*} <td className="border-b border-slate-100 px-2 py-2 text-center">{item.contabil_id ?? "-"}</td>*/}
                      <td className="border-b border-slate-100 px-2 py-2 text-right font-black text-[#063452]">
                        {moeda(item.valor)}
                      </td>

                       <td className="border-b border-slate-100 px-2 py-2 text-center">{item.lote_id ?? "-"}</td>

                      <td className="border-b border-slate-100 px-2 py-2 text-center">
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[9px] font-black uppercase text-blue-700">
                          {item.status_conciliacao || "-"}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 px-2 py-2 text-center">
                        <div className="flex justify-center gap-1">
                       {/*}   <button
                            type="button"
                            onClick={() => excluir(item)}
                            disabled={!item.lote_id || Boolean(acao)}
                            title={!item.lote_id ? "A procedure precisa retornar lote_id." : "Excluir lote"}
                            className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[9px] font-black text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {acao === `excluir-${item.lote_id}` ? "Excluindo..." : "Excluir"}
                          </button>*/}
                          <button
                            type="button"
                            onClick={() => abrirReclassificar(item)}
                            disabled={!item.lote_id || Boolean(acao)}
                            title={!item.lote_id ? "Lote contábil não encontrado." : "Reclassificar conta de débito"}
                            className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[9px] font-black text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Reclassificar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {itemModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <div className="text-base font-black text-[#063452]">
                  Reclassificar lançamento contábil
                </div>
                <div className="mt-1 text-xs font-bold text-slate-400">
                  Lote {itemModal.lote_id} · somente a conta de débito será alterada
                </div>
              </div>

              <button
                type="button"
                onClick={() => setItemModal(null)}
                disabled={acao === "reclassificar"}
                className="rounded-lg px-3 py-2 text-sm font-black text-slate-500 hover:bg-slate-100 disabled:opacity-40"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Histórico
                </div>
                <div className="mt-1 text-sm font-black text-slate-800">
                  {itemModal.historico || itemModal.estabelecimento || "Compra de cartão"}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>{dataBR(itemModal.data_compra)}</span>
                  <span className="text-base font-black text-[#063452]">
                    {moeda(itemModal.valor)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-wide text-amber-600">
                    Débito atual — será alterado
                  </div>
                  <div className="mt-2 text-sm font-black text-slate-900">
                    {itemModal.conta_codigo || "-"}
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-slate-600">
                    {itemModal.conta_nome || "-"}
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] font-black uppercase tracking-wide text-blue-600">
                      Crédito atual — protegido
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-[8px] font-black uppercase text-blue-700">
                      Não altera
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-black text-slate-900">
                    {itemModal.conta_credito_codigo || "-"}
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-slate-600">
                    {itemModal.conta_credito_nome || "Conta passiva do cartão"}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-600">
                  Nova conta de débito
                </label>
                <input
                  autoFocus
                  value={buscaConta}
                  onChange={(e) => {
                    setBuscaConta(e.target.value);
                    setContaSelecionada(null);
                  }}
                  placeholder="Digite o código ou nome da nova conta..."
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none focus:border-blue-400"
                />

                <div className="mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-200">
                  {contasFiltradas.length === 0 ? (
                    <div className="px-3 py-5 text-center text-xs font-bold text-slate-400">
                      Nenhuma conta encontrada
                    </div>
                  ) : (
                    contasFiltradas.map((conta) => (
                      <button
                        key={conta.id}
                        type="button"
                        onClick={() => {
                          setContaSelecionada(conta);
                          setBuscaConta(`${conta.codigo || ""} - ${conta.nome || ""}`);
                        }}
                        className={`block w-full border-b border-slate-100 px-3 py-2 text-left text-xs hover:bg-blue-50 ${
                          Number(contaSelecionada?.id) === Number(conta.id)
                            ? "bg-blue-50 text-blue-700"
                            : "bg-white"
                        }`}
                      >
                        <span className="font-black">{conta.codigo || "-"}</span>
                        {" - "}
                        {conta.nome || "-"}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setItemModal(null)}
                disabled={acao === "reclassificar"}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-black text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={reclassificar}
                disabled={!contaSelecionada || acao === "reclassificar"}
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-black text-white hover:bg-blue-800 disabled:opacity-40"
              >
                {acao === "reclassificar" ? "Salvando..." : "Confirmar reclassificação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function AjudaReclassificacaoCartao({ onClose }) {
  const painelRef = useRef(null);
  const fecharRef = useRef(null);
  const etapas = [
  {
    "titulo": "Para que serve esta janela",
    "texto": "Apesar do nome Conciliação de Cartão de Crédito, esta tela consulta o Razão das compras de um cartão específico e permite corrigir a classificação contábil das despesas. Você escolhe o cartão e o período, confere cada compra ou parcela e altera sua conta de débito quando necessário."
  },
  {
    "titulo": "Selecione o cartão e consulte o período",
    "texto": "Use << e >> para escolher o cartão e confira o nome e os últimos quatro dígitos. Informe Início e Fim e clique em Consultar. A consulta utiliza os registros já existentes no sistema; importe a fatura na janela de Importação de Cartão quando precisar trazer novas compras. Ao trocar o cartão, a lista é limpa; consulte novamente. Ao alterar as datas, clique em Consultar para atualizar os registros."
  },
  {
    "titulo": "Confira os dados de cada compra",
    "texto": "A lista mostra data, estabelecimento, parcela, conta de débito, valor, lote e status retornado pela consulta. Confira o código e o nome da conta na coluna Débito: ela indica onde a compra foi classificada contabilmente. O status da consulta não comprova, sozinho, o pagamento da fatura. Para corrigir a classificação, use Reclassificar na linha correspondente."
  },
  {
    "titulo": "Entenda despesa e passivo do cartão",
    "texto": "No lançamento de uma compra, o débito registra a despesa ou custo e o crédito registra a obrigação na conta de passivo do cartão. Por exemplo, uma compra de material de limpeza pode ser reclassificada para a conta de despesa adequada, mantendo o valor devido ao cartão. Esta tela permite alterar somente a conta de débito; a conta de crédito/passivo permanece protegida."
  },
  {
    "titulo": "Escolha a nova conta contábil",
    "texto": "Clique em Reclassificar e confira histórico, data, valor e número do lote. O quadro Débito atual mostra a classificação que será alterada; Crédito atual mostra a conta protegida. Em Nova conta de débito, pesquise pelo código ou nome e clique em uma conta da lista. Apenas digitar não confirma a escolha. Se o botão estiver desabilitado por falta de lote, o registro não pode ser reclassificado nesta tela."
  },
  {
    "titulo": "Confirme e confira o resultado",
    "texto": "Após selecionar a conta correta, clique em Confirmar reclassificação e aguarde a gravação. Cancelar fecha o formulário sem aplicar a alteração. A operação é feita sobre a conta de débito do lote indicado; confira esse lote antes de confirmar. Depois, verifique a classificação exibida e use Consultar novamente para conferir o resultado gravado. A reclassificação muda a conta contábil da despesa, sem alterar o valor da compra nem liquidar a fatura."
  },
  {
    "titulo": "Como o passivo é reduzido",
    "texto": "As compras acumulam a obrigação no passivo do cartão. Quando o pagamento da fatura é registrado no sistema, o lançamento correspondente reduz essa obrigação e registra a saída na conta financeira utilizada. Esse pagamento é uma etapa separada, realizada no fluxo apropriado de faturas ou pela importação/conciliação bancária quando identificada. Reclassificar uma despesa aqui não paga a fatura e não altera a conta passiva."
  },
  {
    "titulo": "Se não encontrar a compra ou a conta",
    "texto": "Confira o cartão, as datas da consulta e se a compra/fatura já foi registrada e possui lançamento contábil. A busca de Nova conta de débito apresenta as contas de despesas/custos disponibilizadas pelo sistema. Se houver erro ao salvar, leia a mensagem e consulte novamente antes de tentar outra alteração. Editar cartão altera o cadastro do cartão; não substitui a reclassificação da compra."
  }
];

  useEffect(() => {
    const focoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fecharRef.current?.focus();
    function teclado(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Tab") {
        const botoes = painelRef.current?.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
        );
        if (!botoes?.length) return;
        const primeiro = botoes[0];
        const ultimo = botoes[botoes.length - 1];
        if (event.shiftKey && document.activeElement === primeiro) {
          event.preventDefault(); ultimo.focus();
        } else if (!event.shiftKey && document.activeElement === ultimo) {
          event.preventDefault(); primeiro.focus();
        }
      }
    }
    document.addEventListener("keydown", teclado);
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", teclado);
      if (focoAnterior?.isConnected) focoAnterior.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 p-3 sm:p-5"
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ajuda-reclassificacao-cartao-titulo"
        aria-describedby="ajuda-reclassificacao-cartao-descricao"
        style={{ width: "min(680px, 100%)", maxWidth: 680, maxHeight: "90vh", backgroundColor: "#ffffff", color: "#1e293b", borderRadius: 20 }}
        className="flex flex-col overflow-hidden shadow-2xl"
      >
        <div style={{ background: "linear-gradient(110deg, #203c86, #0e7490)", color: "#ffffff", padding: "14px 18px" }} className="flex shrink-0 items-start justify-between gap-3">
          <div>
            <h2 id="ajuda-reclassificacao-cartao-titulo" style={{ color: "#ffffff", fontSize: 18 }} className="text-xl font-extrabold leading-tight">Como revisar as despesas do cartão</h2>
            <p id="ajuda-reclassificacao-cartao-descricao" style={{ color: "#ffffff" }} className="mt-1 text-xs font-medium">Consulte as compras e ajuste a despesa, mantendo o passivo protegido.</p>
          </div>
          <button ref={fecharRef} type="button" onClick={onClose} aria-label="Fechar ajuda" style={{ background: "#ffffff", color: "#203c86", border: "1px solid #cbd5e1", width: 30, height: 30, fontSize: 22 }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-lg font-bold hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">×</button>
        </div>
        <div style={{ padding: 16 }} className="space-y-2 overflow-y-auto">
          {etapas.map((etapa, indice) => (
            <div key={etapa.titulo} style={{ background: "#f7f9fc", border: "1px solid #dce5f1", padding: "12px 14px" }} className="flex items-start gap-3 rounded-xl">
              <span aria-hidden="true" style={{ background: "#2251df", color: "#ffffff", width: 32, height: 32 }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2251df] text-base font-bold text-white">{indice + 1}</span>
              <div className="min-w-0">
                <h3 style={{ color: "#1e293b" }} className="text-sm font-bold">{etapa.titulo}</h3>
                <p style={{ color: "#334155", fontSize: 12, lineHeight: 1.5 }} className="mt-1">{etapa.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
