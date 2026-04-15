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

  const [taxas, setTaxas] = useState({
    taxaBase: 2,
    periodoOrigem: 1,
    periodoDestino: 12,
    taxaNominal: 24,
    capital: 10000,
    descontoTaxa: 2.5,
    descontoPeriodos: 6,
  });

  const [margem, setMargem] = useState({
    vendas: 100000,
    custoVariavel: 40000,
    custoFixo: 30000,
    precoVendaUnitario: 100,
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

  const taxasResultado = useMemo(() => {
    const taxaBase = toNumber(taxas.taxaBase) / 100;
    const periodoOrigem = toNumber(taxas.periodoOrigem);
    const periodoDestino = toNumber(taxas.periodoDestino);
    const taxaEquivalente = periodoOrigem > 0
      ? (Math.pow(1 + taxaBase, periodoDestino / periodoOrigem) - 1)
      : 0;

    const taxaNominal = toNumber(taxas.taxaNominal) / 100;
    const taxaEfetivaAnual = Math.pow(1 + taxaNominal / 12, 12) - 1;

    const capital = toNumber(taxas.capital);
    const descontoTaxa = toNumber(taxas.descontoTaxa) / 100;
    const descontoPeriodos = toNumber(taxas.descontoPeriodos);
    const valorPresente = capital / Math.pow(1 + descontoTaxa, descontoPeriodos);
    const descontoRacional = capital - valorPresente;

    return {
      taxaEquivalente,
      taxaEfetivaAnual,
      valorPresente,
      descontoRacional,
    };
  }, [taxas]);

  const margemResultado = useMemo(() => {
    const vendas = toNumber(margem.vendas);
    const custoVariavel = toNumber(margem.custoVariavel);
    const custoFixo = toNumber(margem.custoFixo);
    const precoVendaUnitario = toNumber(margem.precoVendaUnitario);

    const margemContribuicao = vendas - custoVariavel;
    const margemPercentual = vendas > 0 ? (margemContribuicao / vendas) * 100 : 0;
    const pontoEquilibrio = margemPercentual > 0 ? custoFixo / (margemPercentual / 100) : 0;
    const quantidadePontoEquilibrio = precoVendaUnitario > 0 ? pontoEquilibrio / precoVendaUnitario : 0;
    const lucro = margemContribuicao - custoFixo;
    const indiceSeguranca = vendas > 0 ? ((vendas - pontoEquilibrio) / vendas) * 100 : 0;

    return {
      margemContribuicao,
      margemPercentual,
      pontoEquilibrio,
      quantidadePontoEquilibrio,
      lucro,
      indiceSeguranca,
    };
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
          <AbaBotao ativo={aba === "taxas"} onClick={() => setAba("taxas")}>Taxas</AbaBotao>
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

        {aba === "taxas" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Painel titulo="Conversão de taxas" descricao="Converta uma taxa de um período para outro pela equivalência composta.">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CampoNumero label="Taxa base %" value={taxas.taxaBase} onChange={(v) => setTaxas({ ...taxas, taxaBase: v })} />
                <CampoNumero label="Período de origem" value={taxas.periodoOrigem} onChange={(v) => setTaxas({ ...taxas, periodoOrigem: v })} />
                <CampoNumero label="Período de destino" value={taxas.periodoDestino} onChange={(v) => setTaxas({ ...taxas, periodoDestino: v })} />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <KpiBox titulo="Taxa equivalente" valor={formatarPercentual((taxasResultado.taxaEquivalente || 0) * 100)} />
                <Mensagem texto="Exemplo clássico: 2% ao mês equivalente a aproximadamente 26,82% ao ano." />
              </div>
            </Painel>

            <Painel titulo="Taxa nominal x efetiva" descricao="Transforma uma taxa nominal anual com capitalização mensal em taxa efetiva anual.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CampoNumero label="Taxa nominal anual %" value={taxas.taxaNominal} onChange={(v) => setTaxas({ ...taxas, taxaNominal: v })} />
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">Taxa efetiva anual</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{formatarPercentual((taxasResultado.taxaEfetivaAnual || 0) * 100)}</p>
                </div>
              </div>
            </Painel>

            <Painel titulo="Valor presente e desconto" descricao="Cálculo de desconto racional composto para antecipação de valor futuro.">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CampoNumero label="Valor futuro / nominal" value={taxas.capital} onChange={(v) => setTaxas({ ...taxas, capital: v })} />
                <CampoNumero label="Taxa % por período" value={taxas.descontoTaxa} onChange={(v) => setTaxas({ ...taxas, descontoTaxa: v })} />
                <CampoNumero label="Quantidade de períodos" value={taxas.descontoPeriodos} onChange={(v) => setTaxas({ ...taxas, descontoPeriodos: v })} />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <KpiBox titulo="Valor presente" valor={formatarMoeda(taxasResultado.valorPresente)} />
                <KpiBox titulo="Desconto racional" valor={formatarMoeda(taxasResultado.descontoRacional)} />
              </div>
            </Painel>

            <Painel titulo="Leitura prática" descricao="Resumo rápido para quem não quer ficar preso à fórmula.">
              <div className="space-y-4">
                <Mensagem texto={`A taxa equivalente calculada para o novo prazo é ${formatarPercentual((taxasResultado.taxaEquivalente || 0) * 100)}.`} />
                <Mensagem texto={`Uma taxa nominal de ${formatarPercentual(taxas.taxaNominal)} ao ano gera aproximadamente ${formatarPercentual((taxasResultado.taxaEfetivaAnual || 0) * 100)} de taxa efetiva anual, com capitalização mensal.`} />
                <Mensagem texto={`Ao antecipar ${formatarMoeda(taxas.capital)}, o valor presente estimado é ${formatarMoeda(taxasResultado.valorPresente)}.`} />
              </div>
            </Painel>
          </div>
        )}

        {aba === "gerencial" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Painel titulo="Margem de contribuição e ponto de equilíbrio" descricao="Cálculo prático no modelo gerencial: vendas - custo variável = margem de contribuição.">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <CampoNumero label="Vendas" value={margem.vendas} onChange={(v) => setMargem({ ...margem, vendas: v })} />
                <CampoNumero label="Custo variável" value={margem.custoVariavel} onChange={(v) => setMargem({ ...margem, custoVariavel: v })} />
                <CampoNumero label="Custo fixo" value={margem.custoFixo} onChange={(v) => setMargem({ ...margem, custoFixo: v })} />
                <CampoNumero label="Preço de venda unitário" value={margem.precoVendaUnitario} onChange={(v) => setMargem({ ...margem, precoVendaUnitario: v })} />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <KpiBox titulo="Margem de contribuição" valor={formatarMoeda(margemResultado.margemContribuicao)} />
                <KpiBox titulo="% MC" valor={formatarPercentual(margemResultado.margemPercentual)} />
                <KpiBox titulo="Ponto de equilíbrio" valor={formatarMoeda(margemResultado.pontoEquilibrio)} />
                <KpiBox titulo="PE em quantidade" valor={formatarNumero(margemResultado.quantidadePontoEquilibrio)} />
                <KpiBox titulo="Lucro estimado" valor={formatarMoeda(margemResultado.lucro)} />
                <KpiBox titulo="Margem de segurança" valor={formatarPercentual(margemResultado.indiceSeguranca)} />
              </div>

              <div className="mt-6 space-y-3">
                <LinhaFormula titulo="1. Margem de contribuição" formula={`Vendas (${formatarMoeda(margem.vendas)}) - Custo variável (${formatarMoeda(margem.custoVariavel)})`} resultado={formatarMoeda(margemResultado.margemContribuicao)} />
                <LinhaFormula titulo="2. Percentual da margem de contribuição" formula={`Margem de contribuição (${formatarMoeda(margemResultado.margemContribuicao)}) ÷ Vendas (${formatarMoeda(margem.vendas)})`} resultado={formatarPercentual(margemResultado.margemPercentual)} />
                <LinhaFormula titulo="3. Ponto de equilíbrio" formula={`Custo fixo (${formatarMoeda(margem.custoFixo)}) ÷ % MC (${formatarPercentual(margemResultado.margemPercentual)})`} resultado={formatarMoeda(margemResultado.pontoEquilibrio)} />
                <LinhaFormula titulo="4. PE em quantidade" formula={`Ponto de equilíbrio (${formatarMoeda(margemResultado.pontoEquilibrio)}) ÷ Preço de venda unitário (${formatarMoeda(margem.precoVendaUnitario)})`} resultado={formatarNumero(margemResultado.quantidadePontoEquilibrio)} />
              </div>
            </Painel>

            <Painel titulo="Leitura rápida" descricao="Resumo simples para o empresário.">
              <div className="space-y-4">
                <Mensagem texto={`De cada ${formatarMoeda(100)} vendidos, sobram aproximadamente ${formatarMoeda((margemResultado.margemPercentual / 100) * 100)} para pagar custo fixo e gerar lucro.`} />
                <Mensagem texto={`A empresa precisa faturar cerca de ${formatarMoeda(margemResultado.pontoEquilibrio)} para empatar.`} />
                <Mensagem texto={`No preço unitário informado, o ponto de equilíbrio é de aproximadamente ${formatarNumero(margemResultado.quantidadePontoEquilibrio)} unidades.`} />
                <Mensagem texto={`No cenário informado, o lucro estimado é de ${formatarMoeda(margemResultado.lucro)} e a margem de segurança é de ${formatarPercentual(margemResultado.indiceSeguranca)}.`} />
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

function LinhaFormula({ titulo, formula, resultado }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
      <p className="text-sm font-semibold text-slate-900">{titulo}</p>
      <p className="mt-2 text-slate-600">{formula}</p>
      <p className="mt-2 text-lg font-bold text-slate-900">{resultado}</p>
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

function formatarNumero(valor) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(valor));
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

    if (!Number.isFinite(novaTaxa) || novaTaxa <= -0.999999) {
      return null;
    }

    if (Math.abs(novaTaxa - taxa) < 0.000001) {
      return novaTaxa;
    }

    taxa = novaTaxa;
  }

  return null;
}