  import { useEffect, useMemo, useState } from "react";
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
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-3 flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-9 rounded-lg border border-slate-300 px-3 text-xs font-black text-slate-600"
          >
            ← Voltar
          </button>
            <div className="w-[500px] shrink-0">
  <div className="mb-1 text-[10px] font-black uppercase text-slate-500">
    Cartão
  </div>

  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => trocarCartao("anterior")}
      disabled={cartoes.length <= 1}
      className="h-7 w-7 shrink-0 rounded-full border border-cyan-200 bg-green-500 text-xs font-black text-white shadow-sm hover:bg-cyan-50 disabled:opacity-30"
    >
      {"<<"}
    </button>

    <div className="w-full rounded-lg border border-cyan-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-black text-slate-900">
            {cartaoAtual?.nome ||
              cartaoAtual?.descricao ||
              cartaoAtual?.apelido ||
              `Cartão ${cartaoId || "-"}`}
          </div>

          <div className="mt-0.5 text-xs font-bold text-slate-500">
            Final{" "}
            {String(cartaoAtual?.numero || "").slice(-4) || "----"}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() =>
                navigate(`/app/edit-card/${cartaoAtual.id}`)
              }
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
          <div className="text-[10px] font-bold text-slate-400">
            Disponível
          </div>

          <div className="text-sm font-black text-emerald-700">
            {moeda(cartaoAtual?.limite_disponivel)}
          </div>
        </div>
      </div>

       <div className="mt-1 grid grid-cols-3 gap-1 text-[9px]">
        <div className="rounded-md bg-slate-100 px-1.5 py-1">
          <div className="font-bold text-slate-500">
            Limite
          </div>

          <div className="font-black text-slate-900">
            {moeda(cartaoAtual?.limite_total)}
          </div>
        </div>

        <div className="rounded-lg bg-slate-100 px-2 py-1.5">
          <div className="font-bold text-slate-500">
            Fecha
          </div>

          <div className="font-black text-slate-900">
            Dia {cartaoAtual?.fechamento_dia || "-"}
          </div>
        </div>

        <div className="rounded-lg bg-slate-100 px-2 py-1.5">
          <div className="font-bold text-slate-500">
            Vence
          </div>

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
      className="h-7 w-7 shrink-0 rounded-full border border-cyan-200 bg-green-500 text-xs font-black text-white shadow-sm hover:bg-cyan-50 disabled:opacity-30"
    >
      {">>"}
    </button>
  </div>
</div>
          <label className="text-[10px] font-black uppercase text-slate-500">
            Início
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="mt-1 block h-9 rounded-lg border border-slate-300 px-2 text-xs font-bold"
            />
          </label>
          <label className="text-[10px] font-black uppercase text-slate-500">
            Fim
            <input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className="mt-1 block h-9 rounded-lg border border-slate-300 px-2 text-xs font-bold"
            />
          </label>
          <button
            type="button"
            onClick={consultar}
            disabled={carregando || !cartaoId}
            className="h-9 rounded-lg bg-[#063452] px-5 text-xs font-black text-white disabled:opacity-50"
          >
            {carregando ? "Carregando..." : "Consultar"}
          </button>
        </div>

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
                    <th className="w-[235px] px-2 py-2">Conta atual</th>
                  
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
