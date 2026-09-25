 import { useEffect, useMemo, useState } from "react";
import { buildWebhookUrl } from "../config/globals";

// Criar no n8n um POST /webhook/conferencia_recebiveis_quadro que execute
// contab.ff_conferencia_recebiveis_quadro com os quatro parametros do body.
const WEBHOOK = "conferencia_recebiveis_quadro";
const NOMES = {
  PIX: "PIX",
  CARTAO_DEBITO: "Cartão de débito",
  CARTAO_CREDITO: "Cartão de crédito",
  ANTECIPACAO: "Antecipação",
};
const FILTROS = ["TODOS", "PIX", "CARTAO_DEBITO", "CARTAO_CREDITO", "ANTECIPACAO"];

function moeda(valor) {
  return valor == null ? "—" : Number(valor).toLocaleString("pt-BR", {
    style: "currency", currency: "BRL",
  });
}

function nomeConta(conta) {
  return conta.nome || conta.conta_nome || `Conta ${conta.conta_id ?? conta.id}`;
}

function normalizarLinhas(resposta) {
  let atual = resposta;
  for (let i = 0; i < 6; i += 1) {
    if (Array.isArray(atual)) {
      if (atual.length === 0) return [];
      if (atual.every((linha) => linha && linha.ordem != null && linha.conferencia)) return atual;
      if (atual.length !== 1) break;
      atual = atual[0];
      continue;
    }
    if (!atual || typeof atual !== "object") break;
    if (atual.ok === false || atual.success === false || atual.error) {
      throw new Error(atual.mensagem || atual.message || atual.error?.message || "Erro ao gerar conferência.");
    }
    atual = atual.ff_conferencia_recebiveis_quadro ?? atual.linhas ??
      atual.data ?? atual.resultado ?? atual.body;
  }
  throw new Error("O webhook não retornou as linhas da conferência.");
}

export default function QuadroConferenciaRecebiveis({
  empresaId, contaInicial, contasBanco, dataInicioInicial, dataFimInicial, onClose,
}) {
  const [contas, setContas] = useState(Array.isArray(contasBanco) ? contasBanco : []);
  const [contaId, setContaId] = useState(String(contaInicial || ""));
  const [dataInicio, setDataInicio] = useState(dataInicioInicial || "");
  const [dataFim, setDataFim] = useState(dataFimInicial || "");
  const [carregandoContas, setCarregandoContas] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [linhas, setLinhas] = useState(null);
  const [filtro, setFiltro] = useState("TODOS");

  useEffect(() => {
    const aoTeclar = (evento) => { if (evento.key === "Escape") onClose(); };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onClose]);

  useEffect(() => {
    if (Array.isArray(contasBanco)) {
      setContas(contasBanco);
      if (!contaId && contasBanco.length) {
        setContaId(String(contaInicial || contasBanco[0].conta_id || contasBanco[0].id));
      }
      return;
    }
    if (!empresaId) return;
    let ativo = true;
    async function carregar() {
      setCarregandoContas(true);
      try {
        const url = buildWebhookUrl("consultasaldo", {
          inicio: dataInicioInicial || dataInicio,
          fim: dataFimInicial || dataFim,
          empresa_id: empresaId,
          conta_id: 0,
        });
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status} ao carregar contas.`);
        const dados = await resposta.json();
        const bancos = (Array.isArray(dados) ? dados : []).filter(
          (conta) => String(conta.nro_banco || "") !== "000"
        );
        if (ativo) {
          setContas(bancos);
          if (!contaId && bancos.length) setContaId(String(bancos[0].conta_id ?? bancos[0].id));
          if (!bancos.length) setErro("Nenhuma conta bancária encontrada para esta empresa.");
        }
      } catch (e) {
        if (ativo) setErro(e?.message || "Não foi possível carregar as contas bancárias.");
      } finally {
        if (ativo) setCarregandoContas(false);
      }
    }
    carregar();
    return () => { ativo = false; };
  }, [empresaId, contasBanco, contaInicial, dataInicioInicial, dataFimInicial]);

  const visiveis = useMemo(() => (linhas || []).filter(
    (linha) => filtro === "TODOS" || linha.modalidade === filtro
  ), [linhas, filtro]);

  async function consultar() {
    if (!Number(empresaId) || !Number(contaId) || !dataInicio || !dataFim) {
      setErro("Informe empresa, conta bancária e as duas datas.");
      return;
    }
    if (dataInicio > dataFim) {
      setErro("A data inicial não pode ser maior que a final.");
      return;
    }
    setCarregando(true);
    setErro("");
    setLinhas(null);
    try {
      const resposta = await fetch(buildWebhookUrl(WEBHOOK), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: Number(empresaId), conta_id: Number(contaId),
          data_inicio: dataInicio, data_fim: dataFim,
        }),
      });
      const corpo = await resposta.text();
      let dados;
      try { dados = JSON.parse(corpo); }
      catch { throw new Error(corpo || "O webhook retornou uma resposta inválida."); }
      if (!resposta.ok) {
        const erroApi = Array.isArray(dados) ? dados[0] : dados;
        throw new Error(erroApi?.mensagem || erroApi?.message || `Erro HTTP ${resposta.status}`);
      }
      setLinhas(normalizarLinhas(dados).sort(
        (a, b) => Number(a.ordem) - Number(b.ordem) || String(a.modalidade).localeCompare(String(b.modalidade))
      ));
    } catch (e) {
      setErro(e?.message || "Não foi possível consultar a conferência.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-2 sm:p-5"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="titulo-conferencia-recebiveis"
        className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-[#eef7fd] shadow-2xl">
        <header className="flex items-start justify-between gap-4 bg-[#0F172A] px-5 py-4 text-white">
          <div>
            <h2 id="titulo-conferencia-recebiveis" className="text-lg font-bold">Conferência Getnet × banco × Razão</h2>
            <p className="mt-1 text-xs text-slate-300">Resumo por modalidade, com diferenças e lotes para conferência.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar conferência"
            className="rounded-lg border border-slate-600 px-3 py-1 text-lg hover:bg-slate-700">×</button>
        </header>

        <div className="overflow-y-auto p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <label className="min-w-[220px] flex-1 text-xs font-bold text-slate-700">Conta bancária
              <select value={contaId} onChange={(e) => { setContaId(e.target.value); setLinhas(null); }}
                disabled={carregandoContas} className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm">
                {!contaId && <option value="">Selecione a conta</option>}
                {contas.map((conta) => <option key={conta.conta_id ?? conta.id}
                  value={conta.conta_id ?? conta.id}>{nomeConta(conta)}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-700">Data inicial
              <input type="date" value={dataInicio} onChange={(e) => { setDataInicio(e.target.value); setLinhas(null); }}
                className="mt-1 block h-10 rounded-lg border border-slate-300 px-3 text-sm" />
            </label>
            <label className="text-xs font-bold text-slate-700">Data final
              <input type="date" value={dataFim} onChange={(e) => { setDataFim(e.target.value); setLinhas(null); }}
                className="mt-1 block h-10 rounded-lg border border-slate-300 px-3 text-sm" />
            </label>
            <button type="button" onClick={consultar} disabled={carregando || !contaId || !dataInicio || !dataFim}
              className="h-10 rounded-lg bg-cyan-500 px-5 text-sm font-bold text-[#0F172A] hover:bg-cyan-400 disabled:opacity-50">
              {carregando ? "Consultando..." : "Consultar"}
            </button>
          </div>

          {erro && <div role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-800">{erro}</div>}
          {linhas && <>
            <div className="mb-3 flex flex-wrap gap-2">
              {FILTROS.map((item) => <button type="button" key={item} onClick={() => setFiltro(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold ${filtro === item
                  ? "border-[#0F172A] bg-[#0F172A] text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
                {item === "TODOS" ? "Todos" : NOMES[item]}
              </button>)}
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[760px] text-xs leading-5 text-slate-700">
                <thead className="bg-[#0F172A] text-[11px] uppercase tracking-wide text-white"><tr>
                  <th className="px-3 py-2 text-left">Modalidade</th>
                  <th className="px-3 py-2 text-left">Conferência</th>
                  <th className="px-3 py-2 text-right">Registros</th>
                  <th className="px-3 py-2 text-right">Valor</th>
                  <th className="px-3 py-2 text-left">Observação / lotes</th>
                </tr></thead>
                <tbody>{visiveis.map((linha, i) => {
                  const alerta = [40, 50, 60, 70, 120].includes(Number(linha.ordem)) && Number(linha.quantidade) > 0;
                  return <tr key={`${linha.ordem}-${linha.modalidade}-${i}`} className={i % 2 ? "bg-slate-50" : "bg-white"}>
                    <td className="whitespace-nowrap border-t border-slate-100 px-3 py-2 font-bold">{NOMES[linha.modalidade] || linha.modalidade}</td>
                    <td className="border-t border-slate-100 px-3 py-2 font-semibold text-slate-800">{linha.conferencia}</td>
                    <td className={`whitespace-nowrap border-t border-slate-100 px-3 py-2 text-right font-bold tabular-nums ${alerta ? "text-amber-700" : "text-slate-700"}`}>
                      {Number(linha.quantidade || 0).toLocaleString("pt-BR")}</td>
                    <td className="whitespace-nowrap border-t border-slate-100 px-3 py-2 text-right font-bold tabular-nums text-slate-700">{moeda(linha.valor)}</td>
                    <td className="border-t border-slate-100 px-3 py-2 text-gray-600 font-bold">
                      {linha.observacao}
                      {Array.isArray(linha.lotes) && linha.lotes.length > 0 && <details className="mt-1">
                        <summary className="cursor-pointer font-bold text-blue-700">Ver {linha.lotes.length} lote(s)</summary>
                        <div className="mt-2 flex max-h-24 flex-wrap gap-1 overflow-y-auto">
                          {linha.lotes.map((lote, idx) => <span key={`${lote}-${idx}`} className="rounded bg-blue-50 px-2 py-1 text-blue-900">#{lote}</span>)}
                        </div>
                      </details>}
                    </td>
                  </tr>;
                })}</tbody>
              </table>
              {!visiveis.length && <p className="p-6 text-center text-sm text-slate-500">Nenhum registro encontrado.</p>}
            </div>
            <p className="mt-3 text-xs text-slate-600">“Extrato importado × Razão” compara transações importadas com lançamentos contábeis; o PDF original não é lido nesta consulta. No cartão, venda, previsão e depósito têm datas diferentes.</p>
          </>}
        </div>
      </section>
    </div>
  );
}
