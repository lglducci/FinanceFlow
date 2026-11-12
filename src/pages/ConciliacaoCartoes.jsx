import React, { useEffect, useMemo, useRef, useState } from 'react';

import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { buildWebhookUrl } from '../config/globals';
import { hojeLocal } from '../utils/dataLocal';

/** Conciliação > Cartões. Webhook POST diagnostico_pagamento_cartoes.
 * A empresa vem das props ou do localStorage. Segue o padrão atual de
 * webhooks do FinanceFlow, sem validação de sessão neste endpoint.
 */
const money = value => value == null ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
const date = value => value ? String(value).slice(0, 10).split('-').reverse().join('/') : '—';
const list = value => Array.isArray(value) ? value : [];
const numeric = value => Number(value || 0);
const labels = {
  SEM_CONCILIACAO_VINCULADA: 'Sem conciliação vinculada',
  CONCILIACAO_SEM_FINANCEIRO_VINCULADO: 'Conciliação sem financeiro',
  FINANCEIRO_SEM_BAIXA_CONTABIL_VINCULADA: 'Financeiro sem baixa contábil vinculada',
  FINANCEIRO_PRESENTE_FATURA_NAO_MARCADA_PAGA: 'Financeiro presente; fatura não baixada',
  FATURA_PAGA_SEM_FINANCEIRO_VINCULADO: 'Fatura paga sem financeiro vinculado',
  VALOR_FINANCEIRO_DIFERENTE_DA_FATURA: 'Financeiro difere da fatura',
  VALOR_CONTABIL_DIFERENTE_DO_FINANCEIRO: 'Contábil difere do financeiro',
  EXISTE_BAIXA_MANUAL_CANDIDATA_CONFERIR_VINCULO: 'Possível baixa manual; conferir vínculo',
  DIRETO_NO_CONTABIL: 'Direto no contábil',
  SISTEMA_VIA_FINANCEIRO: 'Sistema via financeiro',
  ORIGEM_NAO_IDENTIFICADA: 'Origem não identificada',
};
function normalize(raw) {
  let payload = raw;
  for (let i = 0; i < 8; i += 1) {
    if (typeof payload === 'string') { payload = JSON.parse(payload); continue; }
    if (payload?.ok === false || payload?.success === false) throw new Error(payload.mensagem || payload.message || 'Não foi possível consultar o diagnóstico.');
    if (payload && Array.isArray(payload.faturas)) return { ...payload, baixas_contabeis_sem_fatura_toda_empresa: list(payload.baixas_contabeis_sem_fatura_toda_empresa), conflitos_vinculo_conciliacao: list(payload.conflitos_vinculo_conciliacao) };
    if (Array.isArray(payload) && payload.length === 1) { payload = payload[0]; continue; }
    if (payload?.diagnostico !== undefined) { payload = payload.diagnostico; continue; }
    if (payload?.data !== undefined) { payload = payload.data; continue; }
    break;
  }
  throw new Error('Resposta inválida do webhook: a lista de faturas não foi recebida.');
}
function issues(row) {
  const result = list(row.alertas).map(code => labels[code] || code);
  const conciliacoes = list(row.conciliacoes);
  if (conciliacoes.some(c => !['ok', 'executado'].includes(c.status_conciliacao))) result.push('Conciliação pendente ou com erro');
  if (conciliacoes.some(c => c.transacao_id != null && !list(row.transacoes).some(t => String(t.id) === String(c.transacao_id)))) result.push('Transação da conciliação ausente ou com vínculo divergente');
  if (row.valor_fatura == null) result.push('Valor da fatura não informado');
  return [...new Set(result)];
}
function exportCsv(headers, rows, filename) {
  const cell = value => {
    let text = String(value ?? '');
    if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  const csv = '\uFEFF' + [headers, ...rows].map(row => row.map(cell).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const css = `
.ffcc{--border:#dce5f1;--ink:#142f4e;--muted:#60758d;--blue:#2860ed;font-family:Arial,sans-serif;background:#f7f9fc;color:var(--ink);padding:24px;min-height:100%;font-size:13px}.ffcc *{box-sizing:border-box}.ffcc button,.ffcc input,.ffcc select{font:inherit}.ffcc button{cursor:pointer}.ffcc button:disabled{opacity:.5;cursor:default}.ffcc button:focus-visible,.ffcc input:focus-visible,.ffcc select:focus-visible{outline:3px solid #8bb6ff;outline-offset:2px}.ffcc .card{background:white;border:1px solid var(--border);border-radius:20px;box-shadow:0 2px 3px #102d4c06}.ffcc .heading{display:flex;justify-content:space-between;gap:16px;padding:18px;border-bottom:1px solid #edf1f7;align-items:center}.ffcc h1{font-size:21px;margin:0 0 6px;font-weight:750}.ffcc p{margin:0;line-height:1.5}.ffcc .sub{color:var(--muted);font-size:12px}.ffcc .btn{border:1px solid var(--border);border-radius:10px;background:white;color:var(--ink);padding:10px 13px;box-shadow:0 1px 2px #112e4910;white-space:nowrap}.ffcc .primary{background:var(--blue);color:white;border-color:var(--blue)}.ffcc .filters{display:flex;flex-wrap:wrap;gap:10px;padding:18px;align-items:flex-end}.ffcc label.field{display:flex;flex-direction:column;gap:6px;min-width:140px}.ffcc label.field span{font-size:10px;font-weight:700;letter-spacing:.4px;color:var(--muted);text-transform:uppercase}.ffcc input,.ffcc select{height:38px;border:1px solid #cbd8eb;border-radius:10px;background:white;color:var(--ink);padding:8px 10px;max-width:100%}.ffcc .grow{flex:1;min-width:190px}.ffcc .tabs{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;background:#f7f9fc;border:1px solid var(--border);border-radius:13px;padding:10px 12px;margin:0 18px 18px}.ffcc .tablist{display:flex;gap:8px;flex-wrap:wrap}.ffcc .pill{border:1px solid var(--border);background:white;border-radius:25px;padding:9px 14px;color:var(--ink);font-weight:600;font-size:12px}.ffcc .pill.active{background:var(--blue);border-color:var(--blue);color:white}.ffcc .check{display:flex;align-items:center;gap:7px;font-size:12px}.ffcc .check input{width:15px;height:15px}.ffcc .notice{margin-top:14px;padding:12px 14px;border:1px solid #e5d4a4;background:#fffbef;border-radius:10px;color:#795618;line-height:1.6}.ffcc .error{background:#fff3f3;border-color:#efcccc;color:#9a3030}.ffcc .result{margin-top:18px;overflow:hidden;border-radius:11px}.ffcc .resulthead{padding:12px 10px;display:flex;justify-content:space-between;gap:12px;align-items:center}.ffcc h2{font-size:16px;margin:0 0 4px}.ffcc .scroll{overflow:auto}.ffcc table{border-collapse:collapse;width:100%;font-size:12px}.ffcc th{background:#101a2d;color:white;padding:10px;text-align:left;font-size:10px;text-transform:uppercase;white-space:nowrap}.ffcc td{padding:12px 10px;border-bottom:1px solid #edf1f7;vertical-align:top}.ffcc tbody tr:nth-child(even){background:#f8fafc}.ffcc .num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.ffcc .small{font-size:11px;color:var(--muted);margin-top:5px;line-height:1.45}.ffcc .tag{display:inline-block;padding:4px 8px;border-radius:6px;background:#edf3fc;font-size:11px;white-space:nowrap}.ffcc .warn{background:#fff3d7;color:#845e12}.ffcc .ok{background:#eaf5ee;color:#276445}.ffcc .diagnosis{min-width:210px;max-width:300px;line-height:1.6}.ffcc .link{color:#2359c9;border:0;background:transparent;padding:0;text-align:left;font-weight:600;text-decoration:underline;text-underline-offset:3px}.ffcc .empty{padding:45px 20px;text-align:center;color:var(--muted)}.ffcc .foot{padding:12px;font-size:11px;color:var(--muted);line-height:1.6}.ffcc .overlay{position:fixed;inset:0;background:#0c1d3755;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}.ffcc .dialog{width:min(1120px,100%);max-height:90vh;overflow:auto;background:white;border-radius:16px;box-shadow:0 15px 70px #0003}.ffcc .dialogbody{padding:18px}.ffcc .dialog h3{font-size:14px;margin:22px 0 10px}.ffcc .dialog table{min-width:650px}.ffcc .facts{display:flex;gap:20px;flex-wrap:wrap;padding:14px;background:#f7f9fc;border-radius:10px}.ffcc .facts strong{display:block;margin-top:5px}.ffcc details{margin-top:12px}.ffcc summary{cursor:pointer;color:#2359c9}.ffcc pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px;max-height:300px;overflow:auto;background:#f7f9fc;padding:12px}.ffcc .nowrap{white-space:nowrap}
@media(max-width:700px){.ffcc{padding:12px}.ffcc .heading{align-items:flex-start}.ffcc h1{font-size:18px}.ffcc .filters{padding:12px}.ffcc .tabs{margin:0 12px 12px}.ffcc label.field{flex:1;min-width:135px}.ffcc .overlay{padding:8px}}
@media print{body *{visibility:hidden}.ffcc,.ffcc *{visibility:visible}.ffcc{position:absolute;left:0;top:0;width:100%;padding:0;background:white}.ffcc .filters,.ffcc .tabs,.ffcc .heading .btn,.ffcc .no-print,.ffcc .overlay{display:none!important}.ffcc .scroll{overflow:visible}.ffcc table{font-size:8px}.ffcc th,.ffcc td{padding:5px}.ffcc th{color:black;background:#e9eef5}.ffcc .card{box-shadow:none}.ffcc .diagnosis{min-width:100px}.ffcc .result{overflow:visible}.ffcc tr{break-inside:avoid}@page{size:A4 landscape;margin:10mm}}
`;

function Grid({ headers, children }) { return <div className="scroll"><table><thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>; }
function Baixas({ rows }) {
  if (!rows.length) return <p className="sub">Nenhuma baixa encontrada neste grupo.</p>;
  return <Grid headers={['Data', 'Valor', 'Origem', 'Modelo', 'Lançamento / lote', 'Créditos da partida']}>
    {rows.map(b => <tr key={b.lancamento_id}><td>{date(b.data_mov)}</td><td className="num">{money(b.valor)}</td><td>{labels[b.origem_baixa] || b.origem_baixa || 'Não identificada'}</td><td>{b.modelo_codigo || 'Não informado'}</td><td>#{b.lancamento_id}<div className="small">Lote {b.lote_id ?? '—'}</div></td><td>{list(b.contrapartidas_credito).map(c => <div key={c.lancamento_id}>{c.conta} — {c.nome}: {money(c.valor)}</div>)}{!list(b.contrapartidas_credito).length && 'Crédito não localizado'}</td></tr>)}
  </Grid>;
}
function Detalhe({ row, onClose }) {
  const close = useRef(null);
  useEffect(() => {
    const previous = document.activeElement; close.current?.focus();
    function keyboard(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const nodes = Array.from(close.current?.closest('[role="dialog"]')?.querySelectorAll('button, a[href], input, select, textarea, summary, [tabindex="0"]') || []);
        if (e.shiftKey && document.activeElement === nodes[0]) { e.preventDefault(); nodes.at(-1)?.focus(); }
        else if (!e.shiftKey && document.activeElement === nodes.at(-1)) { e.preventDefault(); nodes[0]?.focus(); }
      }
    }
    document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('keydown', keyboard); previous?.focus(); };
  }, [onClose]);
  return <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="dialog" role="dialog" aria-modal="true" aria-label={`Detalhe da fatura ${row.fatura_id}`}>
    <div className="heading"><div><h2>Fatura #{row.fatura_id} — {row.cartao_nome || row.nomecartao || 'Cartão'}</h2><p className="sub">Vencimento {date(row.vencimento)} · Referência {String(row.mes_referencia || '').slice(0, 7)}</p></div><button ref={close} className="btn" onClick={onClose}>Fechar</button></div>
    <div className="dialogbody"><div className="facts"><div>Valor da fatura<strong>{money(row.valor_fatura)}</strong></div><div>Situação registrada<strong>{row.status_fatura || 'Não informada'}</strong></div><div>Data de pagamento informada<strong>{date(row.data_pagamento)}</strong></div><div>Financeiro líquido<strong>{money(row.valor_financeiro_liquido)}</strong></div><div>Contábil vinculado<strong>{money(row.valor_contabil_vinculado)}</strong></div></div>
      {issues(row).length > 0 && <div className="notice">{issues(row).join(' · ')}</div>}
      <h3>Conciliação do pagamento</h3>
      {list(row.conciliacoes).length ? <Grid headers={['ID / data', 'Valor', 'Situação', 'Importar', 'Transação', 'Mensagem']}>
        {row.conciliacoes.map(c => <tr key={c.id}><td>#{c.id}<div className="small">{date(c.data_mov)}</div></td><td className="num">{money(c.valor)}</td><td>{c.status_conciliacao || 'Não informada'}</td><td>{c.importar == null ? 'Não informado' : c.importar ? 'Sim' : 'Não'}</td><td>{c.transacao_id ?? 'Sem vínculo'}</td><td>{c.mensagem_conciliacao || '—'}</td></tr>)}
      </Grid> : <p className="sub">Nenhuma conciliação vinculada.</p>}
      <h3>Transações financeiras</h3>
      {list(row.transacoes).length ? <Grid headers={['ID / data', 'Tipo', 'Valor', 'Origem', 'Fatura', 'Descrição']}>
        {row.transacoes.map(t => <tr key={t.id}><td>#{t.id}<div className="small">{date(t.data_movimento)}</div></td><td>{t.tipo}</td><td className="num">{money(t.valor)}</td><td>{t.origem || 'Não informada'}</td><td>{t.fatura_id ?? 'Sem vínculo direto'}</td><td>{t.descricao}</td></tr>)}
      </Grid> : <p className="sub">Nenhuma transação vinculada.</p>}
      <h3>Baixas contábeis vinculadas</h3><Baixas rows={list(row.baixas_contabeis_vinculadas)} />
      <h3>Possíveis baixas manuais pelo mesmo valor</h3><p className="sub">A igualdade de valor não confirma o vínculo. Os registros abaixo não compõem o total contábil desta fatura.</p><Baixas rows={list(row.possiveis_baixas_manuais_mesmo_valor)} />
      <details><summary>Ver dados do diagnóstico</summary><pre>{JSON.stringify(row, null, 2)}</pre></details>
    </div></div></div>;
}

export default function ConciliacaoCartoes({ empresaId: empresaIdProp, onVoltar } = {}) {
  const navigate = useNavigate();
  const empresaId = empresaIdProp || localStorage.getItem('empresa_id') || localStorage.getItem('id_empresa');
  const voltar = onVoltar || (() => navigate('/diagnostico-financeiro'));
  const [inicio, setInicio] = useState(''); const [fim, setFim] = useState('');
  const [cartao, setCartao] = useState(''); const [situacao, setSituacao] = useState('');
  const [somenteDivergencias, setSomenteDivergencias] = useState(false);
  const [tab, setTab] = useState('faturas'); const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const [consulta, setConsulta] = useState(null); const [detalhe, setDetalhe] = useState(null);
  const requestId = useRef(0);
  const abortRef = useRef(null);
  useEffect(() => { requestId.current += 1; abortRef.current?.abort(); setData(null); setConsulta(null); setDetalhe(null); setError(''); setLoading(false); setCartao(''); }, [empresaId]);
  useEffect(() => () => { requestId.current += 1; abortRef.current?.abort(); }, []);

  async function consultar(e) {
    e.preventDefault(); setError('');
    if (!empresaId) { setError('Selecione uma empresa para consultar.'); return; }
    if (inicio && fim && inicio > fim) { setError('O vencimento inicial deve ser anterior ou igual ao final.'); return; }
    abortRef.current?.abort();
    const controller = new AbortController(); abortRef.current = controller;
    const id = ++requestId.current; setLoading(true); setDetalhe(null);
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch(buildWebhookUrl('diagnostico_pagamento_cartoes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id: empresaId, vencimento_inicial: inicio || null, vencimento_final: fim || null }),
        signal: controller.signal,
      });
      const text = await response.text();
      let raw;
      try { raw = text ? JSON.parse(text) : null; }
      catch { throw new Error(`O webhook não retornou JSON válido (HTTP ${response.status}). Confira se o fluxo está ativo.`); }
      if (!response.ok) throw new Error(raw?.mensagem || raw?.message || `Erro HTTP ${response.status} ao consultar o diagnóstico.`);
      const parsed = normalize(raw);
      if (parsed.empresa_id != null && String(parsed.empresa_id) !== String(empresaId)) throw new Error('O diagnóstico recebido pertence a outra empresa.');
      if (id !== requestId.current) return;
      setData(parsed); setConsulta({ inicio, fim, consultadoEm: hojeLocal() });
    } catch (err) {
      if (id === requestId.current) {
        setError(err.name === 'AbortError' ? 'A consulta excedeu 60 segundos. Tente novamente ou reduza o período.' : err.message || 'Não foi possível consultar o diagnóstico.');
        setData(null); setConsulta(null);
      }
    } finally {
      clearTimeout(timeout);
      if (id === requestId.current) setLoading(false);
    }
  }
  const cartoes = useMemo(() => Array.from(new Map(list(data?.faturas).map(f => [String(f.cartao_id), f.cartao_nome || f.nomecartao || `Cartão ${f.cartao_id}`])).entries()), [data]);
  const rows = useMemo(() => list(data?.faturas).filter(f => (!cartao || String(f.cartao_id) === cartao) && (!situacao || f.status_fatura === situacao) && (!somenteDivergencias || issues(f).length > 0)), [data, cartao, situacao, somenteDivergencias]);
  const baixas = list(data?.baixas_contabeis_sem_fatura_toda_empresa);
  const conflitos = list(data?.conflitos_vinculo_conciliacao);
  const stale = consulta && (consulta.inicio !== inicio || consulta.fim !== fim);
  const periodo = consulta ? `${consulta.inicio ? date(consulta.inicio) : 'Sem limite inicial'} a ${consulta.fim ? date(consulta.fim) : 'sem limite final'}` : '';
  function exportar() {
    if (tab === 'faturas') exportCsv(['Fatura', 'Cartão', 'Vencimento', 'Valor da fatura', 'Situação da fatura', 'Conciliação identificada', 'Conciliação OK/executado', 'Financeiro líquido', 'Contábil sistema', 'Contábil direto vinculado', 'Baixas manuais candidatas (não confirmadas)', 'Diagnóstico'], rows.map(f => [f.fatura_id, f.cartao_nome || f.nomecartao, date(f.vencimento), money(f.valor_fatura), f.status_fatura, money(f.valor_identificado_conciliacao), money(f.valor_conciliacao_ok_executado), money(f.valor_financeiro_liquido), money(f.valor_contabil_sistema), money(f.valor_contabil_direto_vinculado), list(f.possiveis_baixas_manuais_mesmo_valor).map(b => `#${b.lancamento_id}: ${money(b.valor)}`).join(' / '), issues(f).join(' / ') || 'Sem divergências nas verificações atuais']), 'conciliacao-cartoes.csv');
    else exportCsv(['Data', 'Valor', 'Origem', 'Modelo', 'Lançamento', 'Lote', 'Histórico'], baixas.map(b => [date(b.data_mov), money(b.valor), labels[b.origem_baixa] || b.origem_baixa, b.modelo_codigo, b.lancamento_id, b.lote_id, b.historico]), 'baixas-cartoes-sem-fatura.csv');
  }
  return <main className="ffcc"><style>{css}</style><section className="card">
    <header className="heading"><div><h1>Conciliação de pagamento de cartões</h1><p className="sub">Confira faturas, pagamentos na conciliação, financeiro e baixas contábeis.</p></div><button className="btn" onClick={voltar}>← Voltar</button></header>
    <form className="filters" onSubmit={consultar}>
      <label className="field"><span>Vencimento inicial</span><input aria-label="Vencimento inicial" type="date" value={inicio} onChange={e => setInicio(e.target.value)} /></label>
      <label className="field"><span>Vencimento final</span><input aria-label="Vencimento final" type="date" value={fim} onChange={e => setFim(e.target.value)} /></label>
      <label className="field grow"><span>Cartão</span><select value={cartao} onChange={e => setCartao(e.target.value)} disabled={tab !== 'faturas'}><option value="">Todos os cartões</option>{cartoes.map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}</select></label>
      <label className="field"><span>Situação da fatura</span><select value={situacao} onChange={e => setSituacao(e.target.value)} disabled={tab !== 'faturas'}><option value="">Todas</option><option value="aberta">Aberta</option><option value="fechada">Fechada</option><option value="paga">Paga</option></select></label>
      <button className="btn primary" disabled={loading} type="submit">{loading ? 'Consultando…' : 'Consultar'}</button>
      <button className="btn" type="button" disabled={!data || loading || !!stale} onClick={() => window.print()}>Imprimir</button>
      <button className="btn" type="button" disabled={!data || loading || !!stale} onClick={exportar}>Exportar CSV</button>
    </form>
    <div className="tabs"><div className="tablist" role="group" aria-label="Visões do diagnóstico"><button className={`pill ${tab === 'faturas' ? 'active' : ''}`} aria-pressed={tab === 'faturas'} onClick={() => setTab('faturas')}>Por fatura {data ? `(${data.faturas.length})` : ''}</button><button className={`pill ${tab === 'baixas' ? 'active' : ''}`} aria-pressed={tab === 'baixas'} onClick={() => setTab('baixas')}>Baixas sem fatura vinculada {data ? `(${baixas.length})` : ''}</button></div><label className="check"><input type="checkbox" checked={somenteDivergencias} disabled={tab !== 'faturas'} onChange={e => setSomenteDivergencias(e.target.checked)} />Somente divergências</label></div>
  </section>
    {error && <div role="alert" className="notice error">{error}</div>}
    {stale && <div className="notice" role="status">O período foi alterado. Clique em Consultar para atualizar; os resultados abaixo ainda são da consulta anterior.</div>}
    {conflitos.length > 0 && <div className="notice"><strong>{conflitos.length} conflito(s) de vínculo na empresa.</strong> A fatura da conciliação difere da fatura da transação.<details><summary>Ver conflitos</summary>{conflitos.map((c, i) => <p key={i}>Conciliação #{c.conciliacao_id}: fatura #{c.fatura_conciliacao}; transação #{c.transacao_id}: fatura #{c.fatura_transacao}.</p>)}</details></div>}
    <section className="card result" aria-busy={loading}><div className="resulthead"><div><h2>Resultado {data && <span className="sub">— {tab === 'faturas' ? `Vencimentos: ${periodo}` : 'Baixas sem vínculo de toda a empresa'}</span>}</h2><p className="sub" aria-live="polite">{loading ? 'Consultando registros…' : data ? `${tab === 'faturas' ? rows.length : baixas.length} registro(s)` : 'Aguardando consulta'}</p></div></div>
      {!data ? <div className="empty">{loading ? 'Buscando os pagamentos e lançamentos…' : 'Informe o período de vencimento ou deixe as datas vazias para consultar todas as faturas.'}</div> : tab === 'faturas' ? rows.length ? <Grid headers={['Fatura / cartão', 'Vencimento', 'Valor fatura', 'Situação fatura', 'Conciliação', 'Financeiro', 'Contábil sistema', 'Contábil direto', 'Diagnóstico']}>
        {rows.map(f => <tr key={f.fatura_id}><td><button className="link" onClick={() => setDetalhe(f)}>Fatura #{f.fatura_id}</button><div className="small">{f.cartao_nome || f.nomecartao || `Cartão ${f.cartao_id}`}</div></td><td className="nowrap">{date(f.vencimento)}</td><td className="num">{money(f.valor_fatura)}</td><td><span className={`tag ${f.status_fatura === 'paga' ? 'ok' : ''}`}>{f.status_fatura || 'Não informada'}</span><div className="small">{f.data_pagamento ? `Pagamento informado: ${date(f.data_pagamento)}` : ''}</div></td><td className="num">{money(f.valor_identificado_conciliacao)}<div className="small">{numeric(f.quantidade_conciliacoes)} registro(s)</div><div className="small">OK/executado: {money(f.valor_conciliacao_ok_executado)}</div></td><td className="num">{money(f.valor_financeiro_liquido)}<div className="small">{numeric(f.quantidade_transacoes)} transação(ões)</div></td><td className="num">{money(f.valor_contabil_sistema)}</td><td className="num">{money(f.valor_contabil_direto_vinculado)}{list(f.possiveis_baixas_manuais_mesmo_valor).length > 0 && <div className="small"><span className="tag warn">{f.possiveis_baixas_manuais_mesmo_valor.length} possível(is) baixa(s)</span><br/>Vínculo não confirmado</div>}</td><td className="diagnosis">{issues(f).length ? issues(f).map(x => <div key={x}>{x}</div>) : <><span className="tag ok">Sem divergências detectadas</span><div className="small">Nas verificações atuais</div></>}<button className="link no-print" style={{ marginTop: 8 }} onClick={() => setDetalhe(f)}>Ver detalhes</button></td></tr>)}
      </Grid> : <div className="empty">Nenhuma fatura encontrada com os filtros aplicados.</div> : <><div className="foot">Esta aba inclui toda a empresa, independentemente do período de vencimento. Baixas sem vínculo não são atribuídas automaticamente a uma fatura.</div>{baixas.length ? <Baixas rows={baixas} /> : <div className="empty">Nenhuma baixa sem fatura vinculada encontrada.</div>}</>}
      {data && <div className="foot">Consultado em {date(consulta?.consultadoEm)}. Valores contábeis representam os débitos identificados. Diários marcados como estornados são excluídos; estornos separados ainda precisam de tratamento no backend. “Direto no contábil” corresponde à origem CONTABIL. Possíveis baixas manuais não integram o total vinculado.</div>}
    </section>
    {detalhe && createPortal(<div className="ffcc" style={{ padding: 0, minHeight: 0 }}><Detalhe row={detalhe} onClose={() => setDetalhe(null)} /></div>, document.body)}
  </main>;
}
