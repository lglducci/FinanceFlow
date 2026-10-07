import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildWebhookUrl } from '../config/globals';
import { hojeLocal } from '../utils/dataLocal';
/*
 * Tela independente, sem bibliotecas de componentes ou estilos externos.
 * Consulta: dadosIniciais (JSON da proc), carregarPossibilidades(parametros)
 * ou urlConsulta (POST JSON). Padrao: buildWebhookUrl("possibilidades_baixa").
 * Carrega ao abrir; filtros alterados so consultam novamente no Pesquisar.
 * Empresa: prop empresaId ou localStorage empresa_id / id_empresa.
 * A consulta inicial usa vencidos/hoje (dias_a_vencer=0); o filtro amplia a busca.
 * contasFinanceiras: [{ id, nome }] para exibir Santander etc. por conta_id.
 * Baixa normal: processarTitulo usa pagar_contas / receber_contas / pagar_faturas.
 * Payload: empresa_id, contas:[origem_id], conta_id, data_pagto:hojeLocal().
 * Recorrentes: a funcao de referencia nao possui esse ramo; usa baixarNormalmente
 * quando fornecida a rotina correta.
 * confirmarAssociacao(payload): deve rejeitar em caso de erro e somente
 * resolver quando o servidor confirmar a baixa. Sem callback, nao faz baixa.
 *
 * <PossibilidadesBaixa empresaId={empresa_id}
 *   carregarPossibilidades={consultarNaApi}
 *   confirmarAssociacao={confirmarNaApi}
 *   contasFinanceiras={contas} />
 *
 * payload de confirmacao: empresa_id, tipo_origem, origem_id,
 * competencia, transacao_id. O servidor deve revalidar tudo.
 */
export function normalizarRetorno(valor) {
  let atual = valor;
  for (let i = 0; i < 8; i += 1) {
    if (typeof atual === 'string') { atual = JSON.parse(atual); continue; }
    if (Array.isArray(atual)) {
      if (atual.length !== 1) throw new Error('A consulta deve devolver um objeto com a lista de títulos.');
      atual = atual[0]; continue;
    }
    if (atual && Array.isArray(atual.titulos)) {
      return { ...atual, titulos: atual.titulos.map(t => ({ ...t, possibilidades: Array.isArray(t.possibilidades) ? t.possibilidades : [] })) };
    }
    const proximo = atual && (atual.ff_possibilidades_baixa ?? atual.resultado ?? atual.data);
    if (proximo !== undefined) { atual = proximo; continue; }
    break;
  }
  throw new Error('A resposta não contém a lista titulos retornada pela proc.');
}
const moeda = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v ?? 0));
const dataBR = v => { const p = String(v ?? '').slice(0, 10).split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : '—'; };
const chave = t => t.chave_titulo || [t.tipo_origem, t.origem_id, t.competencia].filter(v => v != null).join(':');
const tipos = { PAGAR: 'Conta a pagar', RECEBER: 'Conta a receber', FATURA_CARTAO: 'Fatura cartão', RECORRENTE: 'Recorrente' };
const criterios = { VINCULO_EXISTENTE: 'Vínculo já existente', DOCUMENTO_E_DATA: 'Documento e data', DOCUMENTO_VALOR_E_DATA: 'Documento, valor e data', FINAL_CARTAO_VALOR_E_DATA: 'Final do cartão, valor e data', VALOR_E_DATA_SEM_IDENTIFICACAO: 'Valor e data · cartão não identificado' };
const erroTexto = e => e?.message || 'Não foi possível concluir a operação.';
export default function PossibilidadesBaixa({
  empresaId, dadosIniciais, carregarPossibilidades, urlConsulta,
  acaoConsulta, confirmarAssociacao, contasFinanceiras = [], onVoltar, autoCarregar = true, baixarNormalmente,
} = {}) {
  const inicial = useMemo(() => dadosIniciais ? normalizarRetorno(dadosIniciais) : null, [dadosIniciais]);
  const [dados, setDados] = useState(inicial);
  const [tituloKey, setTituloKey] = useState(() => inicial?.titulos[0] ? chave(inicial.titulos[0]) : '');
  const [movimentoId, setMovimentoId] = useState(null);
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState('TODOS');
  const [situacao, setSituacao] = useState('TODOS');
  const [filtros, setFiltros] = useState({ dias_a_vencer: 0, dias_antes: 7, dias_depois: 7, tolerancia_valor: 0 });
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [revisao, setRevisao] = useState(false);
  const [baixaAberta, setBaixaAberta] = useState(false);
  const [contaBaixa, setContaBaixa] = useState('');
  const [contasCarregadas, setContasCarregadas] = useState([]);
  const [carregandoContas, setCarregandoContas] = useState(false);
  const [erroContas, setErroContas] = useState('');
  const requisicao = useRef(0);
  const abortRef = useRef(null);
  const tituloRef = useRef(tituloKey);
  const fecharRef = useRef(null);
  const modalRef = useRef(null);
  const empresaSessao = typeof window !== 'undefined'
    ? (window.localStorage.getItem('empresa_id') || window.localStorage.getItem('id_empresa'))
    : null;
  const empresa = empresaId ?? empresaSessao ?? dados?.empresa_id;
  const urlEfetiva = urlConsulta || buildWebhookUrl('possibilidades_baixa');
  const podeConsultar = typeof carregarPossibilidades === 'function' || Boolean(urlEfetiva);
  const podeConfirmar = typeof confirmarAssociacao === 'function';
  useEffect(() => { tituloRef.current = tituloKey; }, [tituloKey]);
  useEffect(() => {
    requisicao.current += 1; abortRef.current?.abort();
    setDados(inicial); setTituloKey(inicial?.titulos[0] ? chave(inicial.titulos[0]) : '');
    setMovimentoId(null); setErro(''); setSucesso(''); setRevisao(false); setBaixaAberta(false); setContaBaixa(''); setContasCarregadas([]); setCarregando(false);
  }, [inicial, empresaId]);
  useEffect(() => () => { requisicao.current += 1; abortRef.current?.abort(); }, []);
  const consultar = useCallback(async () => {
    if (!podeConsultar) return;
    if (!empresa) { setErro('Informe a empresa para pesquisar.'); return; }
    const id = ++requisicao.current;
    abortRef.current?.abort();
    const controller = new AbortController(); abortRef.current = controller;
    setCarregando(true); setErro(''); setSucesso(''); setMovimentoId(null); setRevisao(false); setBaixaAberta(false);
    const parametros = { empresa_id: empresa, ...filtros, tolerancia_valor: Number(filtros.tolerancia_valor), somente_com_possibilidades: false };
    try {
      let resposta;
      if (typeof carregarPossibilidades === 'function') {
        resposta = await carregarPossibilidades(parametros, { signal: controller.signal });
      } else {
        const r = await fetch(urlEfetiva, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
          body: JSON.stringify(acaoConsulta ? { ...parametros, acao: acaoConsulta } : parametros) });
        if (!r.ok) throw new Error(`Falha ao consultar (${r.status}).`);
        resposta = await r.json();
      }
      const novo = normalizarRetorno(resposta);
      if (novo.empresa_id != null && String(novo.empresa_id) !== String(empresa)) throw new Error('A consulta retornou dados de outra empresa.');
      if (id !== requisicao.current) return;
      setDados(novo);
      setTituloKey(novo.titulos.some(t => chave(t) === tituloRef.current) ? tituloRef.current : novo.titulos[0] ? chave(novo.titulos[0]) : '');
    } catch (e) { if (id === requisicao.current && e.name !== 'AbortError') setErro(erroTexto(e)); }
    finally { if (id === requisicao.current) setCarregando(false); }
  }, [podeConsultar, empresa, filtros, carregarPossibilidades, urlEfetiva, acaoConsulta]);
  // Usa a consulta mais recente sem repetir a busca a cada edicao dos filtros.
  const consultarRef = useRef(consultar);
  useEffect(() => { consultarRef.current = consultar; }, [consultar]);
  useEffect(() => {
    if (!autoCarregar || inicial) return;
    if (!empresa) { setErro('Empresa não identificada. Entre novamente no sistema.'); return; }
    consultarRef.current();
  }, [autoCarregar, empresa, inicial]);

  const titulos = dados?.titulos ?? [];
  const visiveis = useMemo(() => titulos.filter(t => {
    const n = t.possibilidades.length;
    return (tipo === 'TODOS' || t.tipo_origem === tipo)
      && (situacao === 'TODOS' || (situacao === 'COM' ? n > 0 : n === 0))
      && `${t.descricao ?? ''} ${t.parceiro ?? ''} ${t.cpf_cnpj ?? ''} ${t.origem_id}`.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR').trim());
  }), [titulos, tipo, situacao, busca]);
  const titulo = visiveis.find(t => chave(t) === tituloKey) ?? null;
  const movimento = titulo?.possibilidades.find(m => String(m.transacao_id) === String(movimentoId)) ?? null;
  const comOpcoes = titulos.filter(t => t.possibilidades.length > 0).length;
  const contasDisponiveis = contasFinanceiras.length ? contasFinanceiras : contasCarregadas;
  const nomesContas = useMemo(() => new Map(contasDisponiveis.map(c => [String(c.id ?? c.conta_id), c.nome || c.conta_nome || c.descricao])), [contasDisponiveis]);
  const contaNome = m => m.conta_nome || m.nome_conta || m.banco_nome || nomesContas.get(String(m.conta_id)) || `Conta financeira #${m.conta_id}`;
  const selecionarTitulo = t => { tituloRef.current = chave(t); setTituloKey(chave(t)); setMovimentoId(null); setSucesso(''); setRevisao(false); setBaixaAberta(false); };
  useEffect(() => {
    if (!revisao && !baixaAberta) return;
    const anterior = document.activeElement;
    fecharRef.current?.focus();
    const tecla = e => {
      if (e.key === 'Escape' && !salvando) { setRevisao(false); setBaixaAberta(false); }
      if (e.key === 'Tab') {
        const lista = [...(modalRef.current?.querySelectorAll('button:not(:disabled), [tabindex="0"]') ?? [])];
        if (!lista.length) { e.preventDefault(); modalRef.current?.focus(); return; }
        if (e.shiftKey && document.activeElement === lista[0]) { e.preventDefault(); lista.at(-1).focus(); }
        else if (!e.shiftKey && document.activeElement === lista.at(-1)) { e.preventDefault(); lista[0].focus(); }
      }
    };
    document.addEventListener('keydown', tecla);
    return () => { document.removeEventListener('keydown', tecla); anterior?.focus?.(); };
  }, [revisao, baixaAberta, salvando]);
  async function abrirBaixaNormal() {
    if (!titulo || salvando || carregando) return;
    setErro(''); setErroContas(''); setContaBaixa(''); setBaixaAberta(true);
    if (contasDisponiveis.length) return;
    const versao = requisicao.current;
    setCarregandoContas(true);
    try {
      const resposta = await fetch(buildWebhookUrl('listacontas', { empresa_id: empresa }));
      if (!resposta.ok) throw new Error('Não foi possível carregar as contas bancárias.');
      const lista = await resposta.json();
      if (!Array.isArray(lista)) throw new Error('A consulta de contas não retornou uma lista.');
      if (versao !== requisicao.current) return;
      setContasCarregadas(lista.map(c => ({ ...c, id: c.conta_id ?? c.id, nome: c.conta_nome || c.nome || c.banco_nome })));
      if (!lista.length) setErroContas('Nenhuma conta financeira disponível.');
    } catch (e) { if (versao === requisicao.current) setErroContas(erroTexto(e)); }
    finally { setCarregandoContas(false); }
  }
  // Mesmo fluxo individual da tela TitulosVencidos: gera o financeiro.
  async function processarTitulo(titulo, conta_id) {
    if (!conta_id || Number(conta_id) <= 0) throw new Error('Selecione a conta bancária.');
    let webhook;
    if (titulo.tipo_origem === 'PAGAR' || titulo.evento_codigo === 'PAGAR') webhook = 'pagar_contas';
    else if (titulo.tipo_origem === 'RECEBER' || titulo.evento_codigo === 'RECEBER') webhook = 'receber_contas';
    else if (titulo.tipo_origem === 'FATURA_CARTAO' || ['PAGAMENTO_FATURA_CARTAO', 'PAGAMENTO_CARTAO'].includes(titulo.evento_codigo)) webhook = 'pagar_faturas';
    else throw new Error('A função processarTitulo enviada ainda não contém a baixa de recorrentes.');
    const payload = { empresa_id: Number(empresa), contas: [Number(titulo.origem_id)],
      conta_id: Number(conta_id), data_pagto: hojeLocal() };
    const resp = await fetch(buildWebhookUrl(webhook), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const texto = await resp.text();
    let retorno;
    try { retorno = texto ? JSON.parse(texto) : null; }
    catch { throw new Error(resp.ok ? 'A baixa retornou uma resposta inválida. Confira o título antes de tentar novamente.' : `Erro ao processar título (${resp.status}).`); }
    const item = Array.isArray(retorno) && retorno.length === 1 ? retorno[0] : retorno;
    if (!resp.ok || item?.erro || item?.ok === false || item?.sucesso === false)
      throw new Error(item?.message || item?.mensagem || item?.erro || `Erro ao processar título (${resp.status}).`);
    return retorno;
  }
  async function confirmarBaixaNormal() {
    if (!titulo || !contaBaixa || salvando) return;
    if (titulo.tipo_origem === 'RECORRENTE' && typeof baixarNormalmente !== 'function') return;
    const versao = requisicao.current;
    const t = titulo;
    setSalvando(true); setErro('');
    try {
      let resposta;
      if (typeof baixarNormalmente === 'function') {
        resposta = await baixarNormalmente({ empresa_id: Number(empresa), conta_id: Number(contaBaixa), tipo_origem: t.tipo_origem,
          origem_tabela: t.origem_tabela, origem_id: t.origem_id, competencia: t.competencia, valor: t.valor });
      } else {
        resposta = await processarTitulo(t, contaBaixa);
      }
      const retorno = Array.isArray(resposta) && resposta.length === 1 ? resposta[0] : resposta;
      if (retorno?.ok === false || retorno?.sucesso === false || retorno?.erro) throw new Error(retorno.message || retorno.mensagem || retorno.erro || 'A baixa não foi confirmada.');
      if (versao !== requisicao.current) return;
      setBaixaAberta(false);
      window.dispatchEvent(new Event('contabil-atualizado'));
      await consultar();
      setSucesso('Baixa normal concluída, com geração do financeiro.');
    } catch (e) { if (versao === requisicao.current) setErro(erroTexto(e)); }
    finally { setSalvando(false); }
  }
  async function confirmar() {
    if (!titulo || !movimento || !podeConfirmar || salvando) return;
    const selecionado = titulo;
    const empresaAtual = empresa;
    const versao = requisicao.current;
    setSalvando(true); setErro('');
    try {
      const resposta = await confirmarAssociacao({ empresa_id: empresaAtual, tipo_origem: titulo.tipo_origem, origem_id: titulo.origem_id,
        competencia: titulo.competencia ?? null, transacao_id: movimento.transacao_id });
      if (resposta?.sucesso === false || resposta?.ok === false || resposta?.erro) throw new Error(resposta.mensagem || resposta.erro || 'O servidor não confirmou a baixa.');
      if (versao !== requisicao.current) return;
      setRevisao(false); setMovimentoId(null);
      if (podeConsultar) await consultar();
      else setDados(prev => prev ? { ...prev, titulos: prev.titulos.filter(t => chave(t) !== chave(selecionado)).map(t => ({ ...t, possibilidades: t.possibilidades.filter(m => String(m.transacao_id) !== String(movimento.transacao_id)) })) } : prev);
      setSucesso('Associação e baixa confirmadas pelo servidor.');
    } catch (e) { if (versao === requisicao.current) setErro(erroTexto(e)); }
    finally { setSalvando(false); }
  }
  return <div className="ffpb">
    <style>{estilos}</style>
    <header className="ffpb-header">
      <div><h1>Conferência de baixas</h1><p>Selecione uma obrigação e confira os movimentos encontrados nas contas financeiras.</p></div>
      {onVoltar && <button type="button" onClick={onVoltar} disabled={salvando}>Voltar</button>}
    </header>
    <form className="ffpb-filtros" onSubmit={e => { e.preventDefault(); consultar(); }}>
      <label>Incluir a vencer<select value={filtros.dias_a_vencer} onChange={e => setFiltros(v => ({ ...v, dias_a_vencer: Number(e.target.value) }))} disabled={salvando}>
        {[0, 7, 15, 30, 60, 90].map(n => <option key={n} value={n}>{n === 0 ? 'Vencidos / hoje' : `Até ${n} dias`}</option>)}</select></label>
      <label>Dias antes<input type="number" min="0" step="1" required value={filtros.dias_antes} disabled={salvando} onChange={e => setFiltros(v => ({ ...v, dias_antes: e.target.value === '' ? '' : Number(e.target.value) }))} /></label>
      <label>Dias depois<input type="number" min="0" step="1" required value={filtros.dias_depois} disabled={salvando} onChange={e => setFiltros(v => ({ ...v, dias_depois: e.target.value === '' ? '' : Number(e.target.value) }))} /></label>
      <label title="Diferença máxima para mais ou para menos. Recorrentes permitem valor variável.">Tolerância de valor (R$)<input type="number" min="0" step="0.01" required value={filtros.tolerancia_valor} disabled={salvando} onChange={e => setFiltros(v => ({ ...v, tolerancia_valor: e.target.value === '' ? '' : Number(e.target.value) }))} style={{ width: 140 }} /></label>
      <button type="submit" className="ffpb-primary" disabled={!podeConsultar || carregando || salvando}>{carregando ? 'Pesquisando…' : 'Pesquisar'}</button>
      <div className="ffpb-resumo"><strong>{titulos.length}</strong> títulos <span>·</span> <strong>{comOpcoes}</strong> com opções <span>·</span> <strong>{titulos.length - comOpcoes}</strong> sem correspondência</div>
    </form>
    {erro && <div className="ffpb-alert ffpb-error" role="alert">{erro}</div>}
    {sucesso && <div className="ffpb-alert ffpb-success" role="status">{sucesso}</div>}
    <main className={`ffpb-paineis ${carregando ? 'ffpb-loading' : ''}`} aria-busy={carregando}>
      <section className="ffpb-painel" aria-label="Títulos em aberto">
        <div className="ffpb-panel-title"><h2>Títulos em aberto</h2><span>{visiveis.length} exibidos</span></div>
        <div className="ffpb-busca">
          <input aria-label="Buscar título ou fornecedor" placeholder="Descrição, fornecedor ou documento…" value={busca} disabled={salvando} onChange={e => { setBusca(e.target.value); setMovimentoId(null); }} />
          <select aria-label="Tipo de título" value={tipo} disabled={salvando} onChange={e => { setTipo(e.target.value); setMovimentoId(null); }}><option value="TODOS">Todos os tipos</option>{Object.entries(tipos).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select aria-label="Correspondências" value={situacao} disabled={salvando} onChange={e => { setSituacao(e.target.value); setMovimentoId(null); }}><option value="TODOS">Todos</option><option value="COM">Com opções</option><option value="SEM">Sem correspondência</option></select>
        </div>
        <div className="ffpb-scroll"><table><thead><tr><th>Obrigação / fornecedor</th><th>Vencimento</th><th className="ffpb-right">Valor</th><th className="ffpb-center">Opções</th></tr></thead>
          <tbody>{visiveis.map(t => <tr key={chave(t)} className={chave(t) === tituloKey ? 'ffpb-selected' : ''} tabIndex={salvando || carregando ? -1 : 0} aria-selected={chave(t) === tituloKey}
            onClick={() => { if (!salvando && !carregando) selecionarTitulo(t); }} onKeyDown={e => { if (!salvando && !carregando && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selecionarTitulo(t); } }}>
            <td><div className="ffpb-row-tags"><span className={`ffpb-chip ffpb-${t.tipo_origem}`}>{tipos[t.tipo_origem] || t.tipo_origem}</span>{t.critico && <span className="ffpb-critical" title={t.critico_msg}>Crítico</span>}</div><strong className="ffpb-descricao">{t.descricao || 'Sem descrição'}</strong><small>{String(t.parceiro ?? '').trim() || `Título #${t.origem_id}`}</small></td>
            <td className="ffpb-nowrap">{dataBR(t.vencimento)}<small className={Number(t.dias_atraso) > 0 ? 'ffpb-red' : ''}>{Number(t.dias_atraso) > 0 ? `${t.dias_atraso} dias em atraso` : Number(t.dias_atraso) < 0 ? `Em ${Math.abs(t.dias_atraso)} dias` : 'Vence hoje'}</small></td>
            <td className="ffpb-right ffpb-nowrap"><strong>{moeda(t.valor)}</strong>{t.tipo_origem === 'RECORRENTE' && <small>Valor previsto</small>}</td>
            <td className="ffpb-center"><span className={`ffpb-count ${t.possibilidades.length ? 'ffpb-count-found' : ''}`}>{t.possibilidades.length}</span></td>
          </tr>)}</tbody></table>
          {!visiveis.length && <div className="ffpb-empty"><strong>{dados ? 'Nenhum título para estes filtros.' : 'Pesquise as obrigações em aberto.'}</strong>{!podeConsultar && !dados && <p>Conecte a consulta da API ou forneça o JSON em dadosIniciais.</p>}</div>}
        </div>
      </section>
      <section className="ffpb-painel ffpb-detalhe" aria-label="Possibilidades do título selecionado">
        <div className="ffpb-panel-title"><h2>Movimentos encontrados</h2><span>{titulo ? `${titulo.possibilidades.length} opções` : 'Selecione um título'}</span></div>
        {!titulo ? <div className="ffpb-empty"><span className="ffpb-empty-symbol">←</span><strong>Clique em um título à esquerda.</strong><p>As possibilidades de pagamento ou recebimento aparecerão aqui.</p></div> : <>
          <div className="ffpb-title-detail"><span className={`ffpb-chip ffpb-${titulo.tipo_origem}`}>{tipos[titulo.tipo_origem]}</span><h3>{titulo.descricao}</h3><p>{String(titulo.parceiro ?? '').trim() || 'Fornecedor não informado'}</p>
            <div className="ffpb-metrics"><div><small>Vencimento</small><strong>{dataBR(titulo.vencimento)}</strong></div><div><small>{titulo.tipo_origem === 'RECORRENTE' ? 'Valor previsto' : 'Valor da obrigação'}</small><strong>{moeda(titulo.valor)}</strong></div>{titulo.competencia && <div><small>Competência</small><strong>{String(titulo.competencia).slice(0, 7).split('-').reverse().join('/')}</strong></div>}</div>
            {titulo.cpf_cnpj && <small>CPF/CNPJ: {titulo.cpf_cnpj}</small>}
          </div>
          <div className="ffpb-opcoes" aria-live="polite">
            {!titulo.possibilidades.length ? <div className="ffpb-empty ffpb-not-found"><span className="ffpb-empty-symbol">⌕</span><strong>{titulo.mensagem || 'Não encontrado em nenhum extrato bancário.'}</strong><p>{titulo.detalhe_busca || 'Nenhum movimento compatível no período e nos critérios pesquisados. Confira se os extratos foram importados.'}</p></div> :
              <fieldset disabled={salvando || carregando}><legend className="ffpb-sr-only">Escolha o movimento correspondente</legend>{titulo.possibilidades.map(m => <label key={m.transacao_id} className={`ffpb-opcao ${String(m.transacao_id) === String(movimentoId) ? 'ffpb-opcao-selected' : ''}`}>
                <input type="radio" name="movimento-baixa" checked={String(m.transacao_id) === String(movimentoId)} onChange={() => setMovimentoId(m.transacao_id)} />
                <div className="ffpb-opcao-content"><div className="ffpb-opcao-top"><strong>{contaNome(m)}</strong><strong className={m.tipo === 'entrada' ? 'ffpb-green' : 'ffpb-red'}>{moeda(m.valor)}</strong></div>
                  <div className="ffpb-opcao-data">{dataBR(m.data_movimento)} · {m.tipo === 'entrada' ? 'Entrada' : 'Saída'} · Transação #{m.transacao_id}</div><p>{m.descricao || 'Sem descrição'}</p>
                  <small>{criterios[m.criterio] || m.criterio || 'Movimento candidato'}</small>
                  {Number(m.diferenca_valor) > 0 && <div className="ffpb-note">Diferença em relação ao título: {moeda(m.diferenca_valor)}{titulo.tipo_origem === 'RECORRENTE' ? ' · recorrência pode variar' : ''}</div>}
                  {m.disputado && <div className="ffpb-note">Este movimento também é candidato para outras obrigações. Confira antes de associar.</div>}
                  {m.criterio === 'VALOR_E_DATA_SEM_IDENTIFICACAO' && <div className="ffpb-note">O cartão não foi identificado neste movimento. Confirme pelo extrato.</div>}
                </div>
              </label>)}</fieldset>}
          </div>
          <footer className="ffpb-footer">
            <p>{movimento ? `Selecionado: ${contaNome(movimento)}, ${dataBR(movimento.data_movimento)}, ${moeda(movimento.valor)}.` : titulo.possibilidades.length ? 'Escolha um movimento para associar ao extrato.' : 'Sem correspondência: confira os extratos antes de fazer uma baixa normal.'}</p>
            <div className="ffpb-acoes">
              <button type="button" className="ffpb-normal-btn" disabled={salvando || carregando} onClick={abrirBaixaNormal}>Baixar normalmente</button>
              <button type="button" className="ffpb-primary" disabled={!movimento || salvando || carregando} onClick={() => setRevisao(true)} title={!movimento ? 'Selecione um movimento encontrado no extrato' : 'Associar o movimento existente'}>Associar ao extrato</button>
            </div>
          </footer>
        </>}
      </section>
    </main>
    {baixaAberta && titulo && <div className="ffpb-overlay" onClick={e => { if (e.target === e.currentTarget && !salvando) setBaixaAberta(false); }}>
      <div className="ffpb-modal" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="ffpb-normal-title" tabIndex={-1}>
        <div className="ffpb-panel-title"><h2 id="ffpb-normal-title">Baixar normalmente</h2><button ref={fecharRef} type="button" aria-label="Fechar baixa normal" disabled={salvando} onClick={() => setBaixaAberta(false)}>×</button></div>
        <div className="ffpb-modal-body"><span className={`ffpb-chip ffpb-${titulo.tipo_origem}`}>{tipos[titulo.tipo_origem]}</span><h3>{titulo.descricao}</h3><p>Vencimento: {dataBR(titulo.vencimento)} · Valor: <strong>{moeda(titulo.valor)}</strong></p>
          <label className="ffpb-conta-label">Conta bancária para a baixa
            <select value={contaBaixa} disabled={carregandoContas || salvando} onChange={e => setContaBaixa(e.target.value)}>
              <option value="">{carregandoContas ? 'Carregando contas…' : 'Selecione a conta corrente'}</option>
              {contasDisponiveis.map(c => <option key={c.id ?? c.conta_id} value={c.id ?? c.conta_id}>{c.nome || c.conta_nome || c.banco_nome || `Conta #${c.id ?? c.conta_id}`}</option>)}
            </select>
          </label>
          <p>Esta opção usa a baixa normal do sistema na conta escolhida. Não associa um movimento do extrato já existente.</p>
          {titulo.possibilidades.length > 0 && <div className="ffpb-alert ffpb-warning">Há movimentos candidatos para este título. Confira as opções para evitar registrar a movimentação novamente.</div>}
          {titulo.tipo_origem === 'RECORRENTE' && typeof baixarNormalmente !== 'function' && <div className="ffpb-alert ffpb-warning">A função processarTitulo enviada não contém a baixa de recorrentes. Falta conectar esse caso à rotina correta.</div>}
          {erroContas && <div className="ffpb-alert ffpb-error" role="alert">{erroContas}</div>}
          {erro && <div className="ffpb-alert ffpb-error" role="alert">{erro}</div>}
        </div>
        <div className="ffpb-modal-actions"><button type="button" disabled={salvando} onClick={() => setBaixaAberta(false)}>Cancelar</button><button type="button" className="ffpb-normal-btn" disabled={!contaBaixa || salvando || carregandoContas || (titulo.tipo_origem === 'RECORRENTE' && typeof baixarNormalmente !== 'function')} onClick={confirmarBaixaNormal}>{salvando ? 'Baixando…' : 'Confirmar baixa normal'}</button></div>
      </div>
    </div>}
    {revisao && titulo && movimento && <div className="ffpb-overlay" onClick={e => { if (e.target === e.currentTarget && !salvando) setRevisao(false); }}>
      <div className="ffpb-modal" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="ffpb-modal-title" tabIndex={-1}>
        <div className="ffpb-panel-title"><h2 id="ffpb-modal-title">Confirmar este movimento?</h2><button ref={fecharRef} type="button" aria-label="Fechar revisão" disabled={salvando} onClick={() => setRevisao(false)}>×</button></div>
        <div className="ffpb-modal-body"><small>OBRIGAÇÃO</small><h3>{titulo.descricao}</h3><p>Vencimento: {dataBR(titulo.vencimento)} · {titulo.tipo_origem === 'RECORRENTE' ? 'Previsão' : 'Valor'}: {moeda(titulo.valor)}</p>
          <div className="ffpb-review-movement"><small>MOVIMENTO ESCOLHIDO</small><h3>{contaNome(movimento)}</h3><p>{dataBR(movimento.data_movimento)} · <strong>{moeda(movimento.valor)}</strong></p><p>{movimento.descricao}</p></div>
          <p>A associação deve baixar esta obrigação usando o movimento já existente, sem criar outra entrada ou saída.</p>
          {movimento.disputado && <div className="ffpb-alert ffpb-warning">Confira com atenção: o movimento aparece como candidato para outras obrigações.</div>}
          {!podeConfirmar && <div className="ffpb-alert ffpb-warning">A seleção está pronta. Para efetivar a baixa, é necessário conectar a confirmação à API.</div>}
          {erro && <div className="ffpb-alert ffpb-error" role="alert">{erro}</div>}
        </div>
        <div className="ffpb-modal-actions"><button type="button" disabled={salvando} onClick={() => setRevisao(false)}>Voltar</button><button type="button" className="ffpb-primary" disabled={!podeConfirmar || salvando} onClick={confirmar}>{salvando ? 'Confirmando…' : 'Confirmar associação e baixa'}</button></div>
      </div>
    </div>}
  </div>;
}
const estilos = `
.ffpb{color:#253348;background:#f5f7fa;padding:14px;font:13px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:1700px;margin:auto}.ffpb *{box-sizing:border-box}.ffpb button,.ffpb input,.ffpb select{font:inherit}.ffpb button{cursor:pointer;border:1px solid #ccd6e2;background:white;color:#334155;border-radius:7px;padding:7px 12px;font-weight:600;white-space:nowrap}.ffpb button:disabled{opacity:.5;cursor:not-allowed}.ffpb button:focus-visible,.ffpb input:focus-visible,.ffpb select:focus-visible,.ffpb tr:focus-visible{outline:2px solid #2563eb;outline-offset:2px}.ffpb .ffpb-primary{background:#345c91;color:white;border-color:#345c91}.ffpb-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:linear-gradient(110deg,#edf3fa,#f2f7f7);border:1px solid #d8e2ee;border-left:3px solid #6d8caf;border-radius:10px}.ffpb h1,.ffpb h2,.ffpb h3,.ffpb p{margin:0}.ffpb h1{font-size:19px;line-height:1.3;color:#263c55}.ffpb-header p{font-size:12px;color:#52647a;margin-top:3px}.ffpb-filtros{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;padding:12px 0}.ffpb-filtros label{display:flex;flex-direction:column;gap:3px;font-size:11px;font-weight:600;color:#52647a}.ffpb input,.ffpb select{border:1px solid #cbd5e1;border-radius:6px;background:white;color:#334155;padding:7px 9px;min-width:0}.ffpb-filtros input{width:82px}.ffpb-resumo{margin-left:auto;align-self:center;color:#617087;font-size:12px}.ffpb-resumo strong{color:#334155}.ffpb-resumo span{margin:0 7px}.ffpb-alert{padding:9px 12px;border-radius:7px;margin:0 0 10px}.ffpb-error{background:#fff1f2;color:#9f1239;border:1px solid #fecdd3}.ffpb-success{background:#ecfdf5;color:#166534;border:1px solid #bbf7d0}.ffpb-warning{background:#fffbeb;color:#854d0e;border:1px solid #fde68a}.ffpb-paineis{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(360px,1fr);gap:12px;align-items:start}.ffpb-loading{opacity:.6;pointer-events:none}.ffpb-painel{background:white;border:1px solid #dce3ec;border-radius:10px;overflow:hidden}.ffpb-panel-title{display:flex;justify-content:space-between;align-items:center;gap:10px;background:#f0f4f8;border-bottom:1px solid #dce3ec;padding:10px 13px}.ffpb h2{font-size:13px;font-weight:700}.ffpb-panel-title span{font-size:11px;color:#617087}.ffpb-busca{display:flex;gap:6px;padding:9px;border-bottom:1px solid #e8edf3;flex-wrap:wrap}.ffpb-busca input{flex:1 1 180px}.ffpb-busca select{font-size:11px;flex:0 1 auto}.ffpb-scroll{overflow:auto;max-height:calc(100vh - 240px);min-height:320px}.ffpb table{border-collapse:separate;border-spacing:0;width:100%;font-size:12px}.ffpb th{position:sticky;top:0;z-index:1;background:#f8fafc;padding:8px 10px;text-align:left;font-size:10px;color:#64748b;border-bottom:1px solid #e2e8f0;white-space:nowrap}.ffpb td{padding:10px;border-bottom:1px solid #edf1f6;vertical-align:middle}.ffpb tbody tr{cursor:pointer}.ffpb tbody tr:nth-child(even){background:#fafbfd}.ffpb tbody tr:hover{background:#f1f6fc}.ffpb tr.ffpb-selected{background:#edf4fc}.ffpb tr.ffpb-selected td:first-child{box-shadow:inset 3px 0 #547bac}.ffpb td small{display:block;font-size:10px;color:#64748b;margin-top:3px}.ffpb .ffpb-right{text-align:right;font-variant-numeric:tabular-nums}.ffpb .ffpb-center{text-align:center}.ffpb-nowrap{white-space:nowrap}.ffpb-row-tags{display:flex;gap:5px;align-items:center;margin-bottom:4px}.ffpb-chip{display:inline-flex;padding:2px 7px;border-radius:12px;font-size:10px;font-weight:650;background:#eef2f6;color:#52647a;white-space:nowrap}.ffpb-PAGAR{background:#fff1f2;color:#be123c}.ffpb-RECEBER{background:#ecfdf5;color:#047857}.ffpb-FATURA_CARTAO{background:#f4f0ff;color:#7546b5}.ffpb-RECORRENTE{background:#fff7e7;color:#a16207}.ffpb-critical{font-size:9px;color:#b45309}.ffpb-descricao{display:block;line-height:1.4;overflow-wrap:anywhere;font-weight:600}.ffpb-count{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:7px;background:#f1f5f9;color:#64748b;font-size:11px;font-weight:700}.ffpb-count-found{background:#eaf5ee;color:#157347}.ffpb .ffpb-green{color:#16834b}.ffpb .ffpb-red{color:#c13d43}.ffpb-title-detail{padding:12px 14px;border-bottom:1px solid #e8edf3;background:#fcfdff}.ffpb-title-detail h3{font-size:14px;margin-top:7px;line-height:1.4}.ffpb-title-detail p{color:#64748b;font-size:11px;margin-top:3px}.ffpb-title-detail>small{color:#64748b;font-size:10px}.ffpb-metrics{display:flex;gap:25px;flex-wrap:wrap;margin:12px 0 6px}.ffpb-metrics small{display:block;font-size:10px;color:#64748b}.ffpb-metrics strong{display:block;font-size:13px;font-variant-numeric:tabular-nums;margin-top:2px}.ffpb-opcoes{padding:10px;max-height:calc(100vh - 405px);overflow:auto;min-height:200px}.ffpb fieldset{border:0;padding:0;margin:0;min-width:0}.ffpb-opcao{display:flex;gap:9px;border:1px solid #dce3ec;border-radius:8px;padding:12px;margin-bottom:9px;cursor:pointer;background:white}.ffpb-opcao:hover{border-color:#90a9c9;background:#fafcfe}.ffpb-opcao-selected{border-color:#6386b3;box-shadow:0 0 0 1px #6386b3;background:#f5f9ff}.ffpb-opcao input{margin-top:3px;accent-color:#345c91;flex-shrink:0}.ffpb-opcao-content{min-width:0;flex:1}.ffpb-opcao-top{display:flex;justify-content:space-between;gap:10px}.ffpb-opcao-top strong:last-child{white-space:nowrap;font-variant-numeric:tabular-nums}.ffpb-opcao-data{font-size:10px;color:#64748b;margin-top:3px}.ffpb-opcao p{font-size:12px;margin:6px 0;overflow-wrap:anywhere}.ffpb-opcao small{font-size:10px;color:#64748b}.ffpb-note{font-size:10px;color:#93631b;background:#fff9ec;padding:6px 8px;border-radius:5px;margin-top:7px}.ffpb-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:8px;color:#52647a;padding:38px 22px;min-height:250px}.ffpb-empty strong{font-size:13px;color:#475569}.ffpb-empty p{font-size:12px;max-width:370px;color:#64748b}.ffpb-empty-symbol{font-size:29px;line-height:1;color:#90a4be}.ffpb-not-found{min-height:190px}.ffpb-footer{display:flex;flex-direction:column;gap:8px;padding:11px 13px;border-top:1px solid #e8edf3;background:#fafbfd}.ffpb-footer p{font-size:11px;color:#52647a}.ffpb-footer button{align-self:flex-end}.ffpb-overlay{position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,.5);display:flex;align-items:center;justify-content:center;padding:16px}.ffpb-modal{width:min(520px,100%);max-height:90vh;overflow:auto;background:white;border-radius:13px;box-shadow:0 15px 50px rgba(15,23,42,.18)}.ffpb-modal .ffpb-panel-title{padding:12px 16px}.ffpb-modal .ffpb-panel-title button{padding:0;width:28px;height:28px;font-size:20px}.ffpb-modal-body{padding:16px}.ffpb-modal-body>small,.ffpb-review-movement>small{font-size:10px;font-weight:700;color:#64748b}.ffpb-modal h3{font-size:14px;margin:4px 0}.ffpb-modal-body p{font-size:12px;color:#52647a;margin:5px 0 10px}.ffpb-review-movement{background:#f5f8fc;border:1px solid #dce3ec;border-radius:8px;padding:12px;margin:14px 0}.ffpb-modal-actions{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid #e8edf3;flex-wrap:wrap}.ffpb-sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}
@media(max-width:1050px){.ffpb-paineis{grid-template-columns:minmax(0,1.1fr) minmax(300px,1fr)}.ffpb td,.ffpb th{padding:8px}.ffpb-resumo{margin-left:0}.ffpb-busca select{flex:1}.ffpb-busca input{flex-basis:100%}}
@media(max-width:760px){.ffpb{padding:8px}.ffpb-paineis{grid-template-columns:1fr}.ffpb-scroll{min-height:180px;max-height:350px}.ffpb-opcoes{max-height:420px}.ffpb-header{padding:11px}.ffpb h1{font-size:17px}.ffpb-resumo{flex-basis:100%}.ffpb-filtros{gap:7px}.ffpb table{min-width:520px}.ffpb-footer button{width:100%}}

/* Leitura mais clara e paineis mais amplos. */
.ffpb{width:100%;max-width:none;padding:16px 20px;font-size:15px;color:#1e293b;background:#f3f6fa}
.ffpb-header{padding:15px 18px;border-color:#c7d6e8;border-left-width:4px}.ffpb h1{font-size:23px;font-weight:700}.ffpb-header p{font-size:14px;color:#40536b}
.ffpb-filtros{padding:14px 0;gap:12px}.ffpb-filtros label{font-size:13px;color:#334155}.ffpb-resumo{font-size:14px;color:#475569}.ffpb-resumo strong{font-size:16px;color:#1e293b}.ffpb input,.ffpb select{font-size:14px;padding:8px 10px;color:#24364c}.ffpb input::placeholder{color:#64748b;opacity:1}.ffpb button{font-size:14px;padding:9px 14px}
.ffpb-paineis{grid-template-columns:minmax(0,1.15fr) minmax(410px,1fr);gap:16px}.ffpb-painel{border-color:#c8d6e6;box-shadow:0 2px 6px #24364c08}.ffpb-panel-title{padding:13px 16px;background:#eaf0f8;border-color:#ccd9e8}.ffpb h2{font-size:16px;color:#263c55}.ffpb-panel-title span{font-size:13px;color:#475569}
.ffpb-scroll{min-height:420px;max-height:calc(100vh - 255px)}.ffpb table{font-size:14px}.ffpb th{font-size:12px;color:#334155;font-weight:700;padding:11px 12px}.ffpb td{padding:13px 12px}.ffpb td small{font-size:12px;color:#52647a}.ffpb-descricao{font-size:14px;color:#24364c}.ffpb-chip{font-size:12px;padding:3px 9px}.ffpb-critical{font-size:11px;font-weight:650}.ffpb-row-tags{gap:7px;margin-bottom:6px}.ffpb-count{width:29px;height:29px;font-size:13px}
.ffpb tr.ffpb-selected{background:#e5effb}.ffpb tr.ffpb-selected td:first-child{box-shadow:inset 4px 0 #345c91}.ffpb tr.ffpb-selected .ffpb-descricao{color:#153d6e;font-weight:750}
.ffpb-busca{padding:11px;gap:8px}.ffpb-busca select{font-size:13px}.ffpb-title-detail{padding:17px 18px;background:#f5f8fc;border-bottom:2px solid #dbe5f1}.ffpb-title-detail h3{font-size:18px;color:#203953;font-weight:700}.ffpb-title-detail p{font-size:13px;color:#475569}.ffpb-title-detail>small{font-size:12px;color:#475569}.ffpb-metrics{gap:28px;margin:15px 0 10px}.ffpb-metrics small{font-size:12px;color:#475569}.ffpb-metrics strong{font-size:17px;color:#1e293b}
.ffpb-opcoes{min-height:230px;max-height:calc(100vh - 460px);padding:13px}.ffpb-opcao{padding:15px;gap:11px;margin-bottom:11px;border-color:#ccd8e7}.ffpb-opcao-top strong{font-size:16px}.ffpb-opcao-data{font-size:12px;color:#475569}.ffpb-opcao p{font-size:14px}.ffpb-opcao small{font-size:12px;color:#475569}.ffpb-note{font-size:12px;padding:8px 10px}.ffpb-empty strong{font-size:16px;color:#334155}.ffpb-empty p{font-size:14px;color:#52647a;max-width:450px}.ffpb-empty-symbol{font-size:36px;color:#58789e}
.ffpb-footer{padding:14px 16px;background:#eef3f9;border-color:#ccd9e8}.ffpb-footer p{font-size:13px;color:#334155}.ffpb-acoes{display:flex;gap:9px;justify-content:flex-end;flex-wrap:wrap}.ffpb .ffpb-normal-btn{background:#e6eef6;border:1px solid #9fb4cb;color:#254565;font-weight:700}.ffpb .ffpb-primary{background:#345c91;font-weight:700}.ffpb-modal{width:min(580px,100%)}.ffpb-modal h3{font-size:18px}.ffpb-modal-body p{font-size:14px;color:#334155}.ffpb-conta-label{display:flex;flex-direction:column;gap:7px;font-size:14px;font-weight:650;color:#334155;margin:20px 0 12px}.ffpb-conta-label select{width:100%}
@media(max-width:1200px){.ffpb-paineis{grid-template-columns:minmax(0,1.1fr) minmax(360px,1fr)}.ffpb td,.ffpb th{padding:10px}.ffpb-metrics{gap:18px}}
@media(max-width:900px){.ffpb-paineis{grid-template-columns:1fr}.ffpb-scroll{min-height:220px;max-height:380px}.ffpb-opcoes{max-height:440px}.ffpb{padding:12px}.ffpb-header p{font-size:13px}.ffpb table{min-width:580px}}
`;
