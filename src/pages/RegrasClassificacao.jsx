  import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { fetchSeguro } from "../utils/apiSafe";

export default function RegrasClassificacao() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || "1";
  const [searchParams] = useSearchParams();

  const hojeLocal = () => {
    const d = new Date();
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  };

  const [dataIni, setDataIni] = useState(searchParams.get("data_ini") || hojeLocal());
  const [dataFim, setDataFim] = useState(searchParams.get("data_fim") || hojeLocal());

  const [lista, setLista] = useState([]);
  const [contas, setContas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [somenteNaoClassificados, setSomenteNaoClassificados] = useState(
    searchParams.get("nao_classificados") === "1"
  );

  const [buscaContaPorLinha, setBuscaContaPorLinha] = useState({});
  const [dropdownContaAberto, setDropdownContaAberto] = useState(null);

  const [carregando, setCarregando] = useState(false);
  const [salvandoChave, setSalvandoChave] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
 


const [modoLote, setModoLote] = useState(false);
const [selecionados, setSelecionados] = useState([]);
const [contaLote, setContaLote] = useState(null);
const [buscaContaLote, setBuscaContaLote] = useState("");
const [dropdownLoteAberto, setDropdownLoteAberto] = useState(false);

  

   async function carregarRegraProcessamento() {
  try {
    if (!empresa_id) {
      console.error("empresa_id ausente");
      return;
    }

    const url = buildWebhookUrl("ultimo_processamento", { empresa_id });

    const r = await fetch(url);
    const text = await r.text();
    if (!text) return;

    const resp = JSON.parse(text);
    const item = Array.isArray(resp) ? resp[0] : resp;

    if (!item?.ultimo_dia_processado) return;

    const data = item.ultimo_dia_processado.slice(0, 10);
     const data_processar_de = item.data_referencia.slice(0, 10);   

    setUltimoFechamento(data);
    SetDataReferencia(data_processar_de);
    setDataIni(data_processar_de);
    setDataFim( hojeLocal());
  } finally {
    setLoadingDatas(false);
  }
}



  useEffect(() => {
    carregarContas();
   
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
  if (contas.length > 0) {
    pesquisar();
  }
}, [contas]);

  async function carregarContas() {
    try {
      const resp = await fetch(
        buildWebhookUrl("contas_contabeis_lancaveis", { empresa_id })
      );
      const data = await resp.json();
      setContas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Erro ao carregar contas contábeis:", e);
      setContas([]);
    }
  }

  function formatarDataBR(data) {
    if (!data) return "-";
    const limpa = String(data).substring(0, 10);
    const partes = limpa.split("-");
    if (partes.length !== 3) return limpa;
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }

  function dataISO(data) {
    if (!data) return "";
    return String(data).substring(0, 10);
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function textoConta(c) {
    return `${c.codigo || ""} - ${c.nome || ""}`.trim();
  }

  function textoContaLinha(l) {
    if (l.conta_codigo || l.conta_nome) {
      return `${l.conta_codigo || ""} - ${l.conta_nome || ""}`.trim();
    }
    if (l.conta_descricao) return l.conta_descricao;
    return "";
  }

  function chaveLinha(l) {
    return `${l.origem || l.tipo_operacao || "movimento"}-${l.origem_id || l.id}-${l.id}`;
  }

  function normalizarLinha(l) {
    const origem = l.origem || l.tipo_operacao || "movimento";
    const origemId = l.origem_id && String(l.origem_id) !== "0" ? l.origem_id : l.id;

    const contabilId = l.contabil_id || l.conta_contabil_id || l.conta_id || "";
    const contaSelecionada = contas.find((c) => Number(c.id) === Number(contabilId));

    return {
      id: l.id,
      empresa_id: l.empresa_id || empresa_id,
      origem,
      origem_id: origemId,
      tipo_operacao: l.tipo_operacao || origem,
      evento_codigo: l.evento_codigo || "",
      descricao: l.descricao || "",
      nome: l.nome || "",
      numero: l.numero || "",
      tipo: l.tipo || "",
      classificacao: l.classificacao || "",
      forma: l.forma || "",
      status: l.status || "",
      data_movimento: l.data_movimento || l.data || "",
      vencimento: l.vencimento || "",
      valor: Number(l.valor || 0),
      parcelas: l.parcelas || "",
      parcela_total: l.parcela_total || "",
      contabil_id: contabilId && String(contabilId) !== "0" ? contabilId : "",
      conta_codigo: l.conta_codigo || l.contabil_codigo || contaSelecionada?.codigo || "",
      conta_nome: l.conta_nome || l.contabil_nome || l.conta_contabil_nome || contaSelecionada?.nome || "",
      data_ultimo_processamento: l.data_ultimo_processamento || l.ultimo_processamento_contabil || "",
      processado_contabil:
        l.processado_contabil === true ||
        l.processado_contabil === "true" ||
        l.processado_contabil === "sim",
    };
  }

  function movimentoBloqueado(l) {
    if (l.processado_contabil) return true;
    const dataMov = dataISO(l.data_movimento);
    const dataUltimo = dataISO(l.data_ultimo_processamento);
    if (!dataMov || !dataUltimo) return false;
    return dataMov <= dataUltimo;
  }

  function descricaoEntidade(l) {
    const origem = String(l.origem || l.tipo_operacao || "").toLowerCase();
    const mapa = {
      conta_receber: "Conta a Receber",
      contas_receber: "Conta a Receber",
      conta_pagar: "Conta a Pagar",
      contas_pagar: "Conta a Pagar",
      transacao: "Lançamento Financeiro",
      lancamento: "Lançamento Financeiro",
      cartao_compra: "Compra Cartão",
      compra_cartao: "Compra Cartão",
      cartoes_transacoes: "Compra Cartão",
      fatura_cartao: "Fatura Cartão",
      cartao_fatura: "Fatura Cartão",
      estorno: "Estorno",
    };
    return mapa[origem] || l.evento_codigo || l.tipo_operacao || l.origem || "-";
  }

  function buscarContasProfundo(texto) {
    const t = String(texto || "").toLowerCase().trim();
    if (!t) return contas.slice(0, 20);

    return contas
      .filter((c) => {
        const alvo = [c.codigo, c.nome, c.apelido, c.tipo, c.natureza, c.classificacao, c.grupo]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return alvo.includes(t);
      })
      .slice(0, 20);
  }

  async function pesquisar() {
    if (!dataIni || !dataFim) {
      alert("Informe o período.");
      return;
    }

    setCarregando(true);
    setDropdownContaAberto(null);

    try {
      const url = buildWebhookUrl("listalancamentos_classificacao", {
        empresa_id,
        data_ini: dataIni,
        data_fim: dataFim,
        origem: "todos",
      });

      const resp = await fetch(url);
      const dados = await resp.json();

      const listaNormalizada = (Array.isArray(dados) ? dados : [])
        .filter((l) => l && (l.id || l.descricao || l.valor || l.data_movimento))
        .map(normalizarLinha);

      setLista(listaNormalizada);
    } catch (e) {
      console.error(e);
      alert("Erro ao consultar lançamentos.");
      setLista([]);
    } finally {
      setCarregando(false);
    }
  }
 
  async function salvarContabil(linha, conta) {
  const chave = chaveLinha(linha);

  if (movimentoBloqueado(linha)) {
    setDropdownContaAberto(null);
    setBuscaContaPorLinha((prev) => ({
      ...prev,
      [chave]: textoContaLinha(linha),
    }));
    setMensagemSucesso("Esse movimento já foi processado contabilmente e não pode ser alterado.");
    setTimeout(() => setMensagemSucesso(""), 6000);
    return;
  }

  try {
    setSalvandoChave(chave);

   const ret = await fetchSeguro(buildWebhookUrl("atualizar_contabil_entidade"), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    empresa_id: Number(empresa_id),
    id: Number(linha.id),
    data_movimento: linha.data_movimento,
    tipo_operacao: linha.tipo_operacao,
    contabil_id: Number(conta.id),
  }),
});

const resultado = Array.isArray(ret)
  ? ret[0]?.ff_reclassificacao_contabil
  : ret?.ff_reclassificacao_contabil || ret;

 if (!resultado?.ok) {
    // Se o banco recusou, fecha o dropdown e volta exatamente para a conta antiga.
    setDropdownContaAberto(null);

    setBuscaContaPorLinha((prev) => ({
      ...prev,
      [chave]: textoContaLinha(linha),
    }));

    setMensagemSucesso(resultado?.erro || "Erro ao salvar conta contábil.");
    setTimeout(() => setMensagemSucesso(""), 6000);
    return;
  }

    setLista((prev) =>
      prev.map((l) =>
        chaveLinha(l) === chave
          ? {
              ...l,
              contabil_id: conta.id,
              conta_codigo: conta.codigo,
              conta_nome: conta.nome,
            }
          : l
      )
    );

    setBuscaContaPorLinha((prev) => ({
      ...prev,
      [chave]: textoConta(conta),
    }));

    setDropdownContaAberto(null);

    setMensagemSucesso(
      `✅ ${descricaoEntidade(linha)} ${linha.id}: ${textoConta(conta)} salva com sucesso.`
    );

    window.dispatchEvent(new Event("contabil-atualizado"));

    setTimeout(() => setMensagemSucesso(""), 4000);
  } catch (e) {
    alert(e.message || "Erro ao salvar conta contábil.");
  } finally {
    setSalvandoChave("");
  }
}

  const filtradas = useMemo(() => {
    const t = filtro.toLowerCase().trim();

    return lista.filter((l) => {
      const textoBusca = [
        l.id,
        l.descricao,
        l.nome,
        l.numero,
        l.origem,
        l.tipo_operacao,
        l.evento_codigo,
        l.classificacao,
        l.forma,
        l.status,
        l.conta_codigo,
        l.conta_nome,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const naoClassificado = !l.contabil_id || String(l.contabil_id) === "0" || !l.conta_nome;
      return textoBusca.includes(t) && (!somenteNaoClassificados || naoClassificado);
    });
  }, [lista, filtro, somenteNaoClassificados]);

  const total = filtradas.reduce((acc, l) => acc + Number(l.valor || 0), 0);

  function alternarSelecionado(chave) {
  setSelecionados((prev) =>
    prev.includes(chave)
      ? prev.filter((x) => x !== chave)
      : [...prev, chave]
  );
}

async function aplicarContaLote() {
  if (!contaLote || selecionados.length === 0) return;

  const linhas = filtradas.filter((l) =>
    selecionados.includes(chaveLinha(l))
  );

  for (const linha of linhas) {
    await salvarContabil(linha, contaLote);
  }

  setSelecionados([]);
}

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-8xl mx-auto bg-white rounded-3xl shadow-xl border p-5">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800">🧾 Classificação Contábil dos Movimentos</h1>
            <p className="text-sm text-slate-500 font-bold">
              Informe a conta contábil diretamente em cada entidade financeira.
            </p>
          </div>

          <div className="max-w-xl rounded-2xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm font-bold text-blue-800">
            Escolheu a conta, salvou automaticamente. Movimentos já processados contabilmente ficam bloqueados.
          </div>

          <button onClick={() => navigate(-1)} className="btn-pill btn-black">↩ Sair</button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1">Data inicial</label>
            <input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} className="border rounded-xl px-3 py-2 font-bold" />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-600 mb-1">Data final</label>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="border rounded-xl px-3 py-2 font-bold" />
          </div>

          <button type="button" onClick={pesquisar} disabled={carregando}   className="btn-pill btn-dark-blue">
            {carregando ? "Pesquisando..." : "Pesquisar"}
          </button>

          <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Pesquisar descrição, entidade, conta..." className="mt-5 w-[380px] border rounded-xl px-4 py-2 font-semibold" />

          <label className="mt-5 flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 cursor-pointer">
            <input type="checkbox" checked={somenteNaoClassificados} onChange={(e) => setSomenteNaoClassificados(e.target.checked)} className="w-4 h-4" />
            Só sem conta
          </label>


        <label className="mt-5 flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800 cursor-pointer">
            <input
              type="checkbox"
              checked={modoLote}
              onChange={(e) => {
                setModoLote(e.target.checked);
                setSelecionados([]);
                setContaLote(null);
                setBuscaContaLote("");
              }}
              className="w-4 h-4"
            />
            Modo lote
          </label>


          {mensagemSucesso && <div className="mt-5 text-green-600 font-bold italic text-sm">{mensagemSucesso}</div>}
        </div>


        {modoLote && (
  <div className="mb-4 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-3">
    <div className="font-black text-blue-900">
      {selecionados.length} selecionado(s)
    </div>

    <div className="relative w-[420px]">
      <input
        value={buscaContaLote}
        onChange={(e) => {
          setBuscaContaLote(e.target.value);
          setDropdownLoteAberto(true);
        }}
        onFocus={() => setDropdownLoteAberto(true)}
        placeholder="Conta para aplicar no lote..."
        className="w-full border rounded-xl px-3 py-2 font-bold"
      />

      {dropdownLoteAberto && (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border bg-white shadow-xl">
          {buscarContasProfundo(buscaContaLote).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setContaLote(c);
                setBuscaContaLote(textoConta(c));
                setDropdownLoteAberto(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm font-semibold hover:bg-blue-50"
            >
              {textoConta(c)}
            </button>
          ))}
        </div>
      )}
    </div>

    <button
      type="button"
      onClick={aplicarContaLote}
      disabled={!contaLote || selecionados.length === 0}
      className="btn-pill btn-green"
    >
      Aplicar nos selecionados
    </button>
  </div>
)}



        <div className="overflow-auto border rounded-2xl pb-52">
          <div className="min-w-[1500px]">
          <div className="grid grid-cols-[50px_80px_150px_110px_110px_1.8fr_120px_120px_110px_130px_2fr] gap-1 bg-slate-200 text-black font-bold text-xs p-2 sticky top-0">
               <div>
                  {modoLote && (
                    <input
                      type="checkbox"
                      checked={
                        filtradas.length > 0 &&
                        filtradas.every((l) => selecionados.includes(chaveLinha(l)))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelecionados(filtradas.map((l) => chaveLinha(l)));
                        } else {
                          setSelecionados([]);
                        }
                      }}
                      className="w-4 h-4"
                      title="Selecionar todos"
                    />
                  )}
                </div>
              <div>ID</div>
              <div>Entidade</div>
              <div>Data</div>
              <div>Vencimento</div>
              <div>Descrição</div>
              <div>Tipo</div>
              <div>Forma</div>
              <div>Parcela</div>
              <div>Valor</div>
              <div>Conta Contábil</div>
            </div>

            {filtradas.map((l) => {
              const chave = chaveLinha(l);
              const bloqueado = movimentoBloqueado(l);
              const textoBuscaConta = buscaContaPorLinha[chave] ?? textoContaLinha(l) ?? "";

              return (
                <div key={chave} className={`grid grid-cols-[50px_80px_150px_110px_110px_1.8fr_120px_120px_110px_130px_2fr] gap-1 p-2 border-b text-xs items-center ${bloqueado ? "bg-slate-100 text-slate-400" : "hover:bg-blue-50"}`}>
                  
                  <div>
                  {modoLote && (
                    <input
                      type="checkbox"
                      checked={selecionados.includes(chave)}
                      onChange={() => alternarSelecionado(chave)}
                      className="w-4 h-4"
                    />
                  )}
                </div>

                  <div className="font-black">{l.id}</div>

                  <div>
                    <div className="font-black text-slate-800">{descricaoEntidade(l)}</div>
                    <div className="text-[10px] text-slate-500 font-bold">{l.evento_codigo || l.tipo_operacao || l.origem}</div>
                  </div>

                  <div className="font-bold">{formatarDataBR(l.data_movimento)}</div>
                  <div className="font-bold">{formatarDataBR(l.vencimento)}</div>

                  <div>
                    <div className="font-black text-slate-800">{l.descricao || "-"}</div>
                    {(l.nome || l.numero || l.status || l.classificacao) && (
                      <div className="text-[10px] text-slate-500 font-bold">
                        {[l.nome, l.numero, l.status, l.classificacao].filter(Boolean).join(" • ")}
                      </div>
                    )}
                  </div>

                  <div className="font-bold">{l.tipo === "entrada" ? "Entrada" : l.tipo === "saida" ? "Saída" : l.tipo || "-"}</div>
                  <div className="font-bold">{l.forma || "-"}</div>
                  <div className="font-bold">{l.parcelas && l.parcela_total ? `${l.parcelas}/${l.parcela_total}` : "-"}</div>

                  <div className={`font-black ${l.tipo === "entrada" ? "text-emerald-700" : "text-red-700"}`}>{formatarMoeda(l.valor)}</div>

                  <div className="relative">
                    <input
                      disabled={bloqueado || salvandoChave === chave}
                      value={textoBuscaConta}
                      onChange={(e) => {
                        const valor = e.target.value;

                        // Só altera o texto digitado.
                        // Não limpa a conta antiga da linha enquanto o banco não confirmar.
                        setBuscaContaPorLinha((prev) => ({ ...prev, [chave]: valor }));
                        setDropdownContaAberto(chave);
                      }}
                      onFocus={() => !bloqueado && setDropdownContaAberto(chave)}
                      placeholder={bloqueado ? "Processado contabilmente" : "Digite: despesa, receita, banco..."}
                      className={`w-full border rounded-lg px-3 py-2 font-semibold ${bloqueado ? "bg-slate-100 cursor-not-allowed" : "bg-white"}`}
                    />

                    {dropdownContaAberto === chave && !bloqueado && (
                      <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border bg-white shadow-xl">
                        {buscarContasProfundo(textoBuscaConta).map((c) => (
                          <button key={c.id} 
                          type="button" 
                           onClick={async () => {
                                await salvarContabil(l, c);
                              }}
                          className="block w-full px-3 py-2 text-left text-sm font-semibold hover:bg-blue-50">
                            {textoConta(c)}
                          </button>
                        ))}

                        {buscarContasProfundo(textoBuscaConta).length === 0 && (
                          <div className="px-3 py-2 text-sm font-bold text-slate-400">Nenhuma conta encontrada</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filtradas.length === 0 && <div className="p-6 text-center text-slate-400 font-black">Nenhum movimento encontrado.</div>}
          </div>
        </div>

        <div className="mt-3 flex justify-between text-sm font-bold text-slate-600">
          <div>Total: {filtradas.length} movimento(s)</div>
          <div>Soma: {formatarMoeda(total)}</div>
        </div>
      </div>
    </div>
  );
}
