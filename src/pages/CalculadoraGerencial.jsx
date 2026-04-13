 import { useMemo, useState } from "react";

export default function CalculadoraGerencial() {
  const [aba, setAba] = useState("financeira");

  const [juros, setJuros] = useState({
    capital: 1000,
    taxa: 2,
    periodo: 12,
  });

  const [pmt, setPmt] = useState({
    valorPresente: 10000,
    taxa: 2,
    periodos: 12,
  });

  const [tir, setTir] = useState({
    fluxos: "-10000, 2500, 3000, 3200, 3500",
  });

  const [antecipacao, setAntecipacao] = useState({
    valorDivida: 12000,
    taxaDesconto: 2.5,
    mesesAntecipados: 6,
  });

  const [margem, setMargem] = useState({
    receita: 100000,
    custosVariaveis: 40000,
    despesasFixas: 30000,
  });

  const [dre, setDre] = useState({
    receitaBruta: 100000,
    impostos: 0,
    custos: 40000,
    despesas: 30000,
  });

  const jurosSimples = useMemo(() => {
    const c = toNumber(juros.capital);
    const i = toNumber(juros.taxa) / 100;
    const n = toNumber(juros.periodo);
    const jurosValor = c * i * n;
    const montante = c + jurosValor;
    return { jurosValor, montante };
  }, [juros]);

  const jurosCompostos = useMemo(() => {
    const c = toNumber(juros.capital);
    const i = toNumber(juros.taxa) / 100;
    const n = toNumber(juros.periodo);
    const montante = c * Math.pow(1 + i, n);
    const jurosValor = montante - c;
    return { jurosValor, montante };
  }, [juros]);

  const parcelaMensal = useMemo(() => {
    const pv = toNumber(pmt.valorPresente);
    const i = toNumber(pmt.taxa) / 100;
    const n = toNumber(pmt.periodos);
    if (n <= 0) return 0;
    if (i === 0) return pv / n;
    return (pv * i) / (1 - Math.pow(1 + i, -n));
  }, [pmt]);

  const valorFuturo = useMemo(() => {
    const pv = toNumber(pmt.valorPresente);
    const i = toNumber(pmt.taxa) / 100;
    const n = toNumber(pmt.periodos);
    return pv * Math.pow(1 + i, n);
  }, [pmt]);

  const tirResultado = useMemo(() => {
    const fluxos = String(tir.fluxos || "")
      .split(",")
      .map((v) => toNumber(v.trim()))
      .filter((v) => !Number.isNaN(v));

    if (fluxos.length < 2) {
      return { taxa: null, erro: "Informe pelo menos 2 fluxos de caixa." };
    }

    const temPositivo = fluxos.some((v) => v > 0);
    const temNegativo = fluxos.some((v) => v < 0);

    if (!temPositivo || !temNegativo) {
      return { taxa: null, erro: "A TIR precisa de pelo menos um valor negativo e um positivo." };
    }

    const taxa = calcularTIR(fluxos);
    if (taxa === null) {
      return { taxa: null, erro: "Não foi possível calcular a TIR com esses fluxos." };
    }

    return { taxa, erro: null };
  }, [tir]);

  const antecipacaoResultado = useMemo(() => {
    const valorDivida = toNumber(antecipacao.valorDivida);
    const taxaDesconto = toNumber(antecipacao.taxaDesconto) / 100;
    const mesesAntecipados = toNumber(antecipacao.mesesAntecipados);
    const desconto = valorDivida * taxaDesconto * mesesAntecipados;
    const valorLiquido = valorDivida - desconto;
    return { desconto, valorLiquido };
  }, [antecipacao]);

  const margemResultado = useMemo(() => {
    const receita = toNumber(margem.receita);
    const custosVariaveis = toNumber(margem.custosVariaveis);
    const despesasFixas = toNumber(margem.despesasFixas);
    const margemContribuicao = receita - custosVariaveis;
    const margemPercentual = receita > 0 ? (margemContribuicao / receita) * 100 : 0;
    const pontoEquilibrio = margemPercentual > 0 ? despesasFixas / (margemPercentual / 100) : 0;
    const lucro = margemContribuicao - despesasFixas;
    return { margemContribuicao, margemPercentual, pontoEquilibrio, lucro };
  }, [margem]);

  const dreResultado = useMemo(() => {
    const receitaBruta = toNumber(dre.receitaBruta);
    const impostos = toNumber(dre.impostos);
    const custos = toNumber(dre.custos);
    const despesas = toNumber(dre.despesas);
    const receitaLiquida = receitaBruta - impostos;
    const lucroBruto = receitaLiquida - custos;
    const lucroLiquido = lucroBruto - despesas;
    return { receitaLiquida, lucroBruto, lucroLiquido };
  }, [dre]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Calculadora Gerencial e Financeira</h1>
          <p className="mt-3 text-slate-600 text-base md:text-lg">
            Uma tela prática para calcular juros, parcelas, valor futuro, TIR, margem de contribuição, ponto de equilíbrio e DRE simplificada.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <AbaBotao ativo={aba === "financeira"} onClick={() => setAba("financeira")}>Financeira</AbaBotao>
          <AbaBotao ativo={aba === "gerencial"} onClick={() => setAba("gerencial")}>Gerencial</AbaBotao>
          <AbaBotao ativo={aba === "contabil"} onClick={() => setAba("contabil")}>Contábil</AbaBotao>
        </div>

        {aba === "financeira" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Painel titulo="Juros simples e compostos" descricao="Informe capital, taxa e período.">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CampoNumero label="Capital" value={juros.capital} onChange={(v) => setJuros({ ...juros, capital: v })} />
                <CampoNumero label="Taxa % por período" value={juros.taxa} onChange={(v) => setJuros({ ...juros, taxa: v })} />
                <CampoNumero label="Quantidade de períodos" value={juros.periodo} onChange={(v) => setJuros({ ...juros, periodo: v })} />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResultadoCard titulo="Juros Simples" linhas={[
                  ["Juros", formatarMoeda(jurosSimples.jurosValor)],
                  ["Montante", formatarMoeda(jurosSimples.montante)],
                ]} />
                <ResultadoCard titulo="Juros Compostos" linhas={[
                  ["Juros", formatarMoeda(jurosCompostos.jurosValor)],
                  ["Montante", formatarMoeda(jurosCompostos.montante)],
                ]} />
              </div>
            </Painel>

            <Painel titulo="Parcela mensal e valor futuro" descricao="Baseado em juros compostos.">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CampoNumero label="Valor presente" value={pmt.valorPresente} onChange={(v) => setPmt({ ...pmt, valorPresente: v })} />
                <CampoNumero label="Taxa % por período" value={pmt.taxa} onChange={(v) => setPmt({ ...pmt, taxa: v })} />
                <CampoNumero label="Número de períodos" value={pmt.periodos} onChange={(v) => setPmt({ ...pmt, periodos: v })} />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <KpiBox titulo="Parcela estimada" valor={formatarMoeda(parcelaMensal)} />
                <KpiBox titulo="Valor futuro" valor={formatarMoeda(valorFuturo)} />
              </div>
            </Painel>

            <Painel titulo="Antecipação de dívida" descricao="Simulação simples do desconto aplicado para quitar ou antecipar uma dívida antes do prazo.">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CampoNumero label="Valor da dívida" value={antecipacao.valorDivida} onChange={(v) => setAntecipacao({ ...antecipacao, valorDivida: v })} />
                <CampoNumero label="Taxa de desconto % ao mês" value={antecipacao.taxaDesconto} onChange={(v) => setAntecipacao({ ...antecipacao, taxaDesconto: v })} />
                <CampoNumero label="Meses antecipados" value={antecipacao.mesesAntecipados} onChange={(v) => setAntecipacao({ ...antecipacao, mesesAntecipados: v })} />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <KpiBox titulo="Desconto estimado" valor={formatarMoeda(antecipacaoResultado.desconto)} />
                <KpiBox titulo="Valor líquido para quitação" valor={formatarMoeda(antecipacaoResultado.valorLiquido)} />
              </div>
            </Painel>

            <Painel titulo="TIR" descricao="Digite os fluxos separados por vírgula. Exemplo: -10000, 2500, 3000, 3200, 3500">
              <label className="block text-sm font-medium text-slate-700">Fluxos de caixa</label>
              <textarea
                value={tir.fluxos}
                onChange={(e) => setTir({ ...tir, fluxos: e.target.value })}
                className="mt-2 w-full min-h-[130px] rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
              />

              <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-5">
                <p className="text-sm text-slate-500">Resultado</p>
                {tirResultado.erro ? (
                  <p className="mt-2 text-red-600 font-semibold">{tirResultado.erro}</p>
                ) : (
                  <p className="mt-2 text-3xl font-bold text-slate-900">{formatarPercentual((tirResultado.taxa || 0) * 100)}</p>
                )}
              </div>
            </Painel>
          </div>
        )}

        {aba === "gerencial" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Painel titulo="Margem de contribuição" descricao="Cálculo gerencial para avaliar resultado e ponto de equilíbrio.">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CampoNumero label="Receita" value={margem.receita} onChange={(v) => setMargem({ ...margem, receita: v })} />
                <CampoNumero label="Custos variáveis" value={margem.custosVariaveis} onChange={(v) => setMargem({ ...margem, custosVariaveis: v })} />
                <CampoNumero label="Despesas fixas" value={margem.despesasFixas} onChange={(v) => setMargem({ ...margem, despesasFixas: v })} />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <KpiBox titulo="Margem de contribuição" valor={formatarMoeda(margemResultado.margemContribuicao)} />
                <KpiBox titulo="Margem %" valor={formatarPercentual(margemResultado.margemPercentual)} />
                <KpiBox titulo="Ponto de equilíbrio" valor={formatarMoeda(margemResultado.pontoEquilibrio)} />
                <KpiBox titulo="Lucro estimado" valor={formatarMoeda(margemResultado.lucro)} />
              </div>
            </Painel>

            <Painel titulo="Leitura rápida" descricao="Resumo simples para o empresário.">
              <div className="space-y-4">
                <Mensagem texto={`De cada ${formatarMoeda(100)} vendidos, sobram aproximadamente ${formatarMoeda((margemResultado.margemPercentual / 100) * 100)} para pagar despesas fixas e gerar lucro.`} />
                <Mensagem texto={`A empresa precisa faturar cerca de ${formatarMoeda(margemResultado.pontoEquilibrio)} para empatar.`} />
                <Mensagem texto={`No cenário informado, o lucro estimado é de ${formatarMoeda(margemResultado.lucro)}.`} />
              </div>
            </Painel>
          </div>
        )}

        {aba === "contabil" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Painel titulo="DRE simplificada" descricao="Demonstração resumida do resultado do período.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CampoNumero label="Receita bruta" value={dre.receitaBruta} onChange={(v) => setDre({ ...dre, receitaBruta: v })} />
                <CampoNumero label="Impostos / deduções" value={dre.impostos} onChange={(v) => setDre({ ...dre, impostos: v })} />
                <CampoNumero label="Custos" value={dre.custos} onChange={(v) => setDre({ ...dre, custos: v })} />
                <CampoNumero label="Despesas" value={dre.despesas} onChange={(v) => setDre({ ...dre, despesas: v })} />
              </div>

              <div className="mt-6 space-y-3">
                <LinhaDre label="Receita Bruta" valor={dre.receitaBruta} destaque />
                <LinhaDre label="(-) Impostos / Deduções" valor={dre.impostos} negativo />
                <LinhaDre label="= Receita Líquida" valor={dreResultado.receitaLiquida} destaque />
                <LinhaDre label="(-) Custos" valor={dre.custos} negativo />
                <LinhaDre label="= Lucro Bruto" valor={dreResultado.lucroBruto} destaque />
                <LinhaDre label="(-) Despesas" valor={dre.despesas} negativo />
                <LinhaDre label="= Lucro Líquido" valor={dreResultado.lucroLiquido} destaque forte />
              </div>
            </Painel>

            <Painel titulo="Interpretação" descricao="Resumo contábil gerado com base nos valores informados.">
              <div className="space-y-4">
                <Mensagem texto={`A receita líquida apurada é de ${formatarMoeda(dreResultado.receitaLiquida)}.`} />
                <Mensagem texto={`Após custos, sobra um lucro bruto de ${formatarMoeda(dreResultado.lucroBruto)}.`} />
                <Mensagem texto={`Depois das despesas, o resultado final é ${formatarMoeda(dreResultado.lucroLiquido)}.`} />
              </div>
            </Painel>
          </div>
        )}
      </div>
    </div>
  );
}

function AbaBotao({ ativo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 rounded-2xl font-semibold transition-all border ${
        ativo
          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function Painel({ titulo, descricao, children }) {
  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 md:p-8">
      <h2 className="text-2xl font-bold text-slate-900">{titulo}</h2>
      <p className="mt-2 text-slate-600">{descricao}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function CampoNumero({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
      />
    </div>
  );
}

function KpiBox({ titulo, valor }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{titulo}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{valor}</p>
    </div>
  );
}

function ResultadoCard({ titulo, linhas }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
      <p className="text-lg font-bold text-slate-900">{titulo}</p>
      <div className="mt-4 space-y-3">
        {linhas.map(([label, valor]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <span className="text-slate-600">{label}</span>
            <span className="font-semibold text-slate-900">{valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinhaDre({ label, valor, destaque = false, forte = false, negativo = false }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${destaque ? "bg-slate-50" : "bg-white"}`}>
      <span className={`text-sm md:text-base ${forte ? "font-bold text-slate-900" : "text-slate-700"}`}>{label}</span>
      <span className={`font-semibold ${negativo ? "text-red-600" : forte ? "text-emerald-700" : "text-slate-900"}`}>
        {formatarMoeda(toNumber(valor))}
      </span>
    </div>
  );
}

function Mensagem({ texto }) {
  return <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-slate-700">{texto}</div>;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(toNumber(valor));
}

function formatarPercentual(valor) {
  return `${toNumber(valor).toFixed(2)}%`;
}

function calcularTIR(fluxos, guess = 0.1) {
  let taxa = guess;

  for (let tentativa = 0; tentativa < 1000; tentativa++) {
    let npv = 0;
    let derivada = 0;

    for (let t = 0; t < fluxos.length; t++) {
      npv += fluxos[t] / Math.pow(1 + taxa, t);
      derivada += (-t * fluxos[t]) / Math.pow(1 + taxa, t + 1);
    }

    if (Math.abs(npv) < 0.000001) return taxa;
    if (Math.abs(derivada) < 0.000001) return null;

    const novaTaxa = taxa - npv / derivada;
    if (!Number.isFinite(novaTaxa) || novaTaxa <= -0.999999) return null;

    if (Math.abs(novaTaxa - taxa) < 0.000001) return novaTaxa;
    taxa = novaTaxa;
  }

  return null;
}
