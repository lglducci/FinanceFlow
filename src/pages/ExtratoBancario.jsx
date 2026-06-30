    import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

function hojeLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function primeiroDiaMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dataBR(data) {
  if (!data) return "-";
  if (String(data).includes("-")) return String(data).split("-").reverse().join("/");
  return data;
}

function normalizarRespostaWebhook(json) {
  const base = Array.isArray(json) ? json[0] : json;

  if (base?.json) return base.json;
  if (base?.data) return base.data;
  if (base?.body) return base.body;
  if (base?.retorno) return base.retorno;

  return base;
}

function montarResumoExtrato(linhas = []) {
  const entradas = linhas.reduce(
    (acc, l) => acc + (String(l.tipo || "").toLowerCase() === "entrada" ? Number(l.valor || 0) : 0),
    0
  );

  const saidas = linhas.reduce(
    (acc, l) => acc + (String(l.tipo || "").toLowerCase() === "saida" ? Number(l.valor || 0) : 0),
    0
  );

  return {
    saldo_inicial: 0,
    qtd_registros: linhas.length,
    entradas,
    saidas,
    saldo_final: entradas - saidas,
    linhas,
  };
}


function extrairExtratoBancario(retorno) {
  let atual = retorno;

  for (let i = 0; i < 10; i++) {
    if (!atual) break;

    if (Array.isArray(atual)) {
      if (atual.length === 0) return montarResumoExtrato([]);

      const primeiro = atual[0];
      const pareceListaDeMovimentos =
        primeiro &&
        typeof primeiro === "object" &&
        ("valor" in primeiro || "descricao" in primeiro || "data_movimento" in primeiro);

      if (pareceListaDeMovimentos) return montarResumoExtrato(atual);

      atual = primeiro;
      continue;
    }

    if (typeof atual !== "object") break;

    if (Array.isArray(atual.linhas)) {
      return {
        ...atual,
        linhas: atual.linhas,
        qtd_registros: atual.qtd_registros ?? atual.linhas.length,
      };
    }

    const chavesPossiveis = [
      "fn_extrato_bancario",
      "json",
      "data",
      "body",
      "retorno",
      "response",
      "result",
      "payload",
    ];

    const chave = chavesPossiveis.find((k) => atual?.[k] !== undefined && atual?.[k] !== null);
    if (chave) {
      atual = atual[chave];
      continue;
    }

    const valorComLinhas = Object.values(atual).find(
      (v) => v && typeof v === "object" && Array.isArray(v.linhas)
    );

    if (valorComLinhas) {
      atual = valorComLinhas;
      continue;
    }

    break;
  }

  return { linhas: [] };
}

export default function ExtratoBancario() {
  const navigate = useNavigate();

  const empresa_id =
    localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");

  const [aba, setAba] = useState("extrato");
  const [contas, setContas] = useState([]);
  const [indiceConta, setIndiceConta] = useState(0);
  const [dataIni, setDataIni] = useState(primeiroDiaMes());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [busca, setBusca] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [extrato, setExtrato] = useState(null);
  const [razao, setRazao] = useState(null);

  const contaAtual = contas[indiceConta] || null;

  useEffect(() => {
    carregarContas();
  }, []);

  useEffect(() => {
    if (contaAtual?.id || contaAtual?.conta_id) {
      carregarDados();
    }
  }, [indiceConta, contas.length]);

 
 async function carregarContas() {
  try {
    const url = buildWebhookUrl("consultasaldo", {
      inicio: dataIni,
      fim: dataFim,
      empresa_id,
      conta_id: 0,
    });

    const resp = await fetch(url, { method: "GET" });
    const data = await resp.json();

    setContas(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Erro ao carregar contas:", error);
  }
}

  async function carregarDados() {
    if (!contaAtual) return;

    try {
      setLoading(true);
      setErro("");
      setExtrato(null);
 
      await carregarExtrato();
      await carregarRazao();
    } catch (e) {
      console.error("ERRO EXTRATO BANCARIO:", e);
      setErro("Erro ao carregar extrato bancário.");
      setExtrato({ linhas: [] });
    } finally {
      setLoading(false);
    }
  }

  async function carregarExtrato() {
    const conta_id = contaAtual?.conta_id || contaAtual?.id;

    const resp = await fetch(buildWebhookUrl("extrato_bancario"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        conta_id,
        data_ini: dataIni,
        data_fim: dataFim,
      }),
    });

    const texto = await resp.text();

    if (!resp.ok) {
      throw new Error(`Webhook extrato_bancario retornou ${resp.status}: ${texto}`);
    }

    const json = texto ? JSON.parse(texto) : null;
    const dados = extrairExtratoBancario(json);

    setExtrato(dados);
  }

   async function carregarRazao() {
  const respConta = await fetch(buildWebhookUrl("contabil_da_conta_corrente"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empresa_id,
      conta_id: contaAtual.conta_id || contaAtual.id,
    }),
  });

  const retConta = await respConta.json();

  const conta_contabil_id =
    retConta?.[0]?.data?.[0]?.contabil_id ??
    retConta?.data?.[0]?.contabil_id;

  if (!conta_contabil_id) {
    setRazao({ linhas: [] });
    return;
  }

  const resp = await fetch(buildWebhookUrl("razao_por_conta"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empresa_id,
      conta_id: conta_contabil_id,
      data_ini: dataIni,
      data_fim: dataFim,
    }),
  });

  const json = await resp.json();

  const linhas = Array.isArray(json)
    ? json
    : Array.isArray(json?.data)
    ? json.data
    : Array.isArray(json?.linhas)
    ? json.linhas
    : [];

  setRazao({
    linhas,
    qtd_registros: linhas.length,
  });
}

  function contaAnterior() {
    setIndiceConta((i) => Math.max(0, i - 1));
  }

  function proximaConta() {
    setIndiceConta((i) => Math.min(contas.length - 1, i + 1));
  }

  function aplicarPeriodo(dias) {
    const fim = new Date();
    const ini = new Date();
    ini.setDate(fim.getDate() - Number(dias));
    ini.setMinutes(ini.getMinutes() - ini.getTimezoneOffset());
    fim.setMinutes(fim.getMinutes() - fim.getTimezoneOffset());
    setDataIni(ini.toISOString().slice(0, 10));
    setDataFim(fim.toISOString().slice(0, 10));
  }

  const linhasExtrato = useMemo(() => {
    const linhas = Array.isArray(extrato)
      ? extrato
      : Array.isArray(extrato?.linhas)
      ? extrato.linhas
      : [];

    const termo = busca.trim().toLowerCase();
    if (!termo) return linhas;

    return linhas.filter((l) =>
      String(l.descricao || l.historico || "").toLowerCase().includes(termo)
    );
  }, [extrato, busca]);

  const linhasRazao = useMemo(() => {
    const linhas = Array.isArray(razao?.linhas) ? razao.linhas : [];
    const termo = busca.trim().toLowerCase();
    if (!termo) return linhas;
    return linhas.filter((l) => String(l.historico || l.descricao || "").toLowerCase().includes(termo));
  }, [razao, busca]);

  const primeiraLinhaRazao = linhasRazao[0] || {};
  const ultimaLinhaRazao = linhasRazao[linhasRazao.length - 1] || {};

  const entradasRazao = linhasRazao.reduce(
    (acc, l) => acc + (Number(l.valor || 0) > 0 ? Number(l.valor || 0) : 0),
    0
  );

  const saidasRazao = linhasRazao.reduce(
    (acc, l) => acc + (Number(l.valor || 0) < 0 ? Math.abs(Number(l.valor || 0)) : 0),
    0
  );
 

  const resumoBanco = {
  saldoInicial: Number(contaAtual?.saldo_inicial || 0),
  qtd: Number(extrato?.qtd_registros || linhasExtrato.length || 0),
  entradas: Number(contaAtual?.entradas_periodo || 0),
  saidas: Number(
    contaAtual?.saídas_periodo ||
    contaAtual?.saidas_periodo ||
    0
  ),
  saldoFinal: Number(contaAtual?.saldo_final || 0),
};

  const resumoRazao = {
   saldoInicial: Number(extrato?.saldo_inicial || 0),
entradas: Number(extrato?.entradas || 0),
saidas: Number(extrato?.saidas || 0),
saldoFinal: Number(extrato?.saldo_final || 0),
  };

  const diferenca = resumoBanco.saldoFinal - resumoRazao.saldoFinal;
  const diferencaRegistros = resumoBanco.qtd - resumoRazao.qtd;
  const diferencaEntradas = resumoBanco.entradas - resumoRazao.entradas;
  const diferencaSaidas = resumoBanco.saidas - resumoRazao.saidas;

 

  return (
    <div className="min-h-screen bg-[#eef7fd] px-1 py-1">
      <div className="mx-auto w-full max-w-[1720px]">
        <div className="rounded-[28px] bg-[#061f4a] border border-cyan-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-2">
          <div className="mb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white mb-1">
                  🏦 Extrato Bancário
                </h2>
                <div className="text-xs font-bold text-white/70">
                  Consulte movimentações da conta e compare com o razão contábil.
                </div>
              </div>

               <div className="mt-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-sky-200">
                    Saldo Atual
                  </div>

                  <div
                    className={`mt-1 text-lg font-black ${
                      Number(contaAtual?.saldo_final || 0) < 0
                        ? "text-red-400"
                        : "text-emerald-300"
                    }`}
                  >
                    {moeda(contaAtual?.saldo_final || 0)}
                  </div>
                </div>

            </div>

            <div className="mt-5 grid grid-cols-[620px_1fr] gap-8 items-start">
              <div>
                <label className="text-sm font-bold text-white">Conta Bancária</label>

                <div className="mt-2 flex items-center gap-3">
                  <button type="button" onClick={contaAnterior} className="h-10 w-12 rounded-xl border border-white/40 text-white hover:bg-white/10">
                    ◀
                  </button>

                  {contaAtual ? (
                    <div className="w-full max-w-[520px] rounded-3xl border border-yellow-300 bg-white px-5 py-4 flex items-center gap-4 shadow-[0_0_20px_rgba(250,204,21,0.25)]">
                      <div className="h-16 w-16 rounded-2xl border border-yellow-200 bg-yellow-50 flex items-center justify-center overflow-hidden">
                        {contaAtual.icone_url ? (
                          <img src={contaAtual.icone_url} alt={contaAtual.banco_nome || contaAtual.nome} className="h-10 w-10 object-contain" />
                        ) : (
                          <span className="text-3xl">🏦</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-black text-slate-800 truncate">
                          {contaAtual.nome || contaAtual.conta_nome}
                        </div>
                        <div className="mt-1 text-xs font-bold text-slate-400">
                          {contaAtual.banco_nome || "Conta bancária"}
                        </div>
                        <div className="mt-1 text-xs font-bold text-slate-500 truncate">
                          Banco {contaAtual.nro_banco || "-"} • Ag. {contaAtual.agencia || "-"} • Conta {contaAtual.conta || "-"}
                        </div>
                        <div className="mt-1 text-xs font-bold text-slate-500">
                          Conta {indiceConta + 1} de {contas.length}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-400">Saldo</div>
                        <div className={`text-lg font-black ${Number(contaAtual.saldo_final || 0) >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                          {moeda(contaAtual.saldo_final || 0)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-[520px] rounded-3xl border border-dashed border-white/30 px-5 py-8 text-center font-bold text-white/60">
                      Nenhuma conta encontrada
                    </div>
                  )}

                  <button type="button" onClick={proximaConta} className="h-10 w-12 rounded-xl border border-white/40 text-white hover:bg-white/10">
                    ▶
                  </button>
                </div>
              </div>

              <div>
                <div className="text-center text-lg font-bold italic text-white mb-4">Período</div>
                <div className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-3 items-end">
                  <div>
                    <label className="block text-sm font-bold italic text-white mb-1">Data Início</label>
                    <input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} className="h-10 w-full rounded-xl border border-white/30 bg-white/10 px-3 text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold italic text-white mb-1">Data final</label>
                    <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="h-10 w-full rounded-xl border border-white/30 bg-white/10 px-3 text-white outline-none" />
                  </div>
                  <button onClick={() => aplicarPeriodo(7)} className="h-10 px-3 rounded-xl text-white font-black hover:bg-white/10">7 dias</button>
                  <button onClick={() => aplicarPeriodo(15)} className="h-10 px-3 rounded-xl text-white font-black hover:bg-white/10">15 dias</button>
                  <button onClick={() => aplicarPeriodo(30)} className="h-10 px-3 rounded-xl text-white font-black hover:bg-white/10">30 dias</button>
                  <button
                    onClick={async () => {
                      await carregarContas();
                      await carregarDados();
                    }}
                    className="h-10 px-5 rounded-xl bg-white text-[#061f4a] font-black hover:bg-cyan-50"
                  >
                    Pesquisar
                  </button>
                </div>

                <div className="mt-4">
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar histórico, PIX, fornecedor, documento..."
                    className="h-10 w-full rounded-xl border border-white/30 bg-white/10 px-4 text-white placeholder:text-white/50 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {erro && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">{erro}</div>}

        <div className="mt-3 flex gap-2">
          <Aba ativo={aba === "extrato"} onClick={() => setAba("extrato")}>Extrato Bancário</Aba>
          <Aba ativo={aba === "razao"} onClick={() => setAba("razao")}>Razão Contábil</Aba>
          <Aba ativo={aba === "comparacao"} onClick={() => setAba("comparacao")}>Comparação</Aba>
        </div>

        {loading && <div className="mt-4 rounded-xl bg-white p-4 font-bold text-slate-500">Carregando...</div>}

        {!loading && aba === "extrato" && <TabelaExtrato linhas={linhasExtrato} />}
        {!loading && aba === "razao" && <TabelaRazao linhas={linhasRazao} />}
        {!loading && aba === "comparacao" && (
          <Comparacao resumoBanco={resumoBanco} resumoRazao={resumoRazao} diferenca={diferenca} diferencaRegistros={diferencaRegistros} diferencaEntradas={diferencaEntradas} diferencaSaidas={diferencaSaidas} contaAtual={contaAtual} />
        )}
      </div>
    </div>
  );
}

function Aba({ ativo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`h-10 px-5 rounded-xl font-black text-sm shadow-sm transition ${
        ativo ? "bg-[#061f4a] text-white" : "bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function TabelaExtrato({ linhas }) {
  return (
    <div className="mt-3 rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="grid grid-cols-[1fr_130px_160px_110px_130px_160px_130px_130px] gap-2 bg-gray-200 px-4 py-2 text-sm font-black text-slate-700">
        <div>Descrição</div>
        <div>Data Movimento</div>
        <div>Conta</div>
        <div>Tipo</div>
        <div>Origem</div>
        <div>Classificação</div>
        <div>Forma</div>
        <div className="text-right">Valor</div>
      </div>

      <div className="max-h-[560px] overflow-y-auto">
        {linhas.map((l, idx) => (
          <div key={l.id || idx} className="grid grid-cols-[1fr_130px_160px_110px_130px_160px_130px_130px] gap-2 border-b px-4 py-2 text-sm items-center hover:bg-sky-50">
            <div className="font-semibold text-slate-800">{l.descricao || l.historico}</div>
            <div className="font-bold">{dataBR(l.data_movimento || l.data_mov)}</div>
            <div>{l.conta_nome || l.conta || "-"}</div>
            <div className={l.tipo === "entrada" ? "text-emerald-600 font-black" : "text-red-600 font-black"}>{l.tipo || "-"}</div>
            <div><span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">{l.origem || "Financeiro"}</span></div>
            <div className="font-bold">{l.classificacao || "-"}</div>
            <div>{l.forma_pagamento || l.forma || "-"}</div>
            <div className="text-right font-black">{moeda(l.valor)}</div>
          </div>
        ))}

        {linhas.length === 0 && <div className="p-8 text-center font-bold text-slate-400">Nenhum movimento encontrado.</div>}
      </div>
    </div>
  );
}

 function TabelaRazao({ linhas }) {
  function dataBR2(data) {
    if (!data) return "-";
    const d = String(data).split("T")[0];
    const [ano, mes, dia] = d.split("-");
    return `${dia}-${mes}-${ano}`;
  }

  return (
    <div className="mt-3 rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="grid grid-cols-[120px_1fr_220px_140px_140px] gap-2 bg-gray-200 px-4 py-2 text-sm font-black text-slate-700">
        <div>Data</div>
        <div>Histórico</div>
        <div>Conta</div>
        <div className="text-right">Valor</div>
        <div className="text-right">Saldo</div>
      </div>

      <div className="max-h-[560px] overflow-y-auto">
        {linhas.map((l, idx) => (
          <div
            key={l.id || idx}
            className="grid grid-cols-[120px_1fr_220px_140px_140px] gap-2 border-b px-4 py-2 text-sm items-center hover:bg-sky-50"
          >
            <div className="font-bold">{dataBR2(l.data_mov || l.data_lanc || l.data)}</div>
            <div className="font-semibold text-slate-800">{l.historico}</div>
            <div>{l.conta_contrapartida || l.conta_nome || l.conta || "-"}</div>

            <div className={`text-right font-black ${Number(l.valor || 0) < 0 ? "text-red-600" : "text-emerald-700"}`}>
              {moeda(l.valor || 0)}
            </div>

            <div className={`text-right font-black ${Number(l.saldo_final || 0) < 0 ? "text-red-600" : "text-emerald-700"}`}>
              {moeda(l.saldo_final || 0)}
            </div>
          </div>
        ))}

        {linhas.length === 0 && (
          <div className="p-8 text-center font-bold text-slate-400">
            Nenhum lançamento contábil encontrado.
          </div>
        )}
      </div>
    </div>
  );
}

function Comparacao({ resumoBanco, resumoRazao, diferenca, diferencaRegistros, diferencaEntradas, diferencaSaidas, contaAtual }) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <CardComparacao titulo="Banco" itens={[
        ["Saldo inicial", moeda(resumoBanco.saldoInicial)],
        ["Registros", resumoBanco.qtd],
        ["Entradas", moeda(resumoBanco.entradas)],
        ["Saídas", moeda(resumoBanco.saidas)],
        ["Saldo final", moeda(resumoBanco.saldoFinal)],
      ]} />

      <CardComparacao titulo="Razão Contábil" subtitulo={contaAtual?.contabil_codigo || contaAtual?.codigo_contabil || "Conta contábil vinculada"} itens={[
        ["Saldo inicial", moeda(resumoRazao.saldoInicial)],
        ["Registros", resumoRazao.qtd],
        ["Entradas", moeda(resumoRazao.entradas)],
        ["Saídas", moeda(resumoRazao.saidas)],
        ["Saldo final", moeda(resumoRazao.saldoFinal)],
      ]} />

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-sm font-black text-slate-500 uppercase">Diferenças</div>

        <div className="mt-4 space-y-3">
          <LinhaDiferenca label="Registros" valor={diferencaRegistros} tipo="numero" />
          <LinhaDiferenca label="Entradas" valor={diferencaEntradas} />
          <LinhaDiferenca label="Saídas" valor={diferencaSaidas} />
          <LinhaDiferenca label="Saldo final" valor={diferenca} destaque />
        </div>

        <div className="mt-4 text-sm font-bold text-slate-500">
          {Math.abs(diferenca) < 0.01 && Math.abs(diferencaRegistros) === 0
            ? "Banco e razão estão batendo no período."
            : "Existe diferença entre banco e razão no período."}
        </div>
      </div>
    </div>
  );
}

function LinhaDiferenca({ label, valor, tipo = "moeda", destaque = false }) {
  const numero = Number(valor || 0);
  const ok = Math.abs(numero) < 0.01;

  return (
    <div className={`flex justify-between border-b pb-2 ${destaque ? "text-base" : "text-sm"}`}>
      <span className="font-bold text-slate-500">{label}</span>
      <span className={`font-black ${ok ? "text-emerald-700" : "text-red-600"}`}>
        {tipo === "numero" ? numero : moeda(numero)}
      </span>
    </div>
  );
}

function CardComparacao({ titulo, subtitulo, itens }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm font-black text-slate-500 uppercase">{titulo}</div>
      {subtitulo && <div className="mt-1 text-xs font-bold text-slate-400">{subtitulo}</div>}
      <div className="mt-4 space-y-3">
        {itens.map(([label, valor]) => (
          <div key={label} className="flex justify-between border-b pb-2 text-sm">
            <span className="font-bold text-slate-500">{label}</span>
            <span className="font-black text-slate-800">{valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
