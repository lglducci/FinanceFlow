 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

import { buildWebhookUrl } from "../config/globals";

function moeda(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function DiagnosticoFinanceiro() {
  const navigate = useNavigate();

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mostrarTopGastos, setMostrarTopGastos] = useState(false);

const [mostrarProjecao, setMostrarProjecao] = useState(false);



  async function carregar() {
    try {
      setLoading(true);

      const resp = await fetch(
        buildWebhookUrl("dashboard_financeiro", { empresa_id })
      );

      const json = await resp.json();
      const retorno = json?.[0]?.fn_dashboard_financeiro || null;

      setDados(retorno);
    } catch (e) {
      console.error(e);
      setDados(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (empresa_id) carregar();
  }, [empresa_id]);

  if (loading) {
    return <div className="p-6 font-black">Carregando diagnóstico...</div>;
  }

  if (!dados) {
    return (
      <div className="p-6 text-red-600 font-black">
        Não foi possível carregar o diagnóstico.
      </div>
    );
  }

  const saldoAtual = Number(dados.saldo_atual || 0);

  const receberAberto = Number(dados.receber_aberto || 0);
  const pagarAberto = Number(dados.pagar_aberto || 0);
  const faturasAberto = Number(dados.faturas_aberto || 0);

  const compromissosAbertos = pagarAberto + faturasAberto;
  const caixaAposCompromissos = saldoAtual - compromissosAbertos;

  const receita30Dias = Number(dados.receita_30_dias || 0);
  const despesa30Dias = Number(dados.despesa_30_dias || 0);
  const resultado30Dias = Number(dados.resultado_30_dias || 0);

  const faltaEmpatar30Dias =
    resultado30Dias < 0 ? Math.abs(resultado30Dias) : 0;

  const topDespesas30Dias = Array.isArray(dados.top_despesas_30_dias)
  ? dados.top_despesas_30_dias
  : [];


const aumentos30Dias = Array.isArray(dados.aumentos_30_dias)
  ? dados.aumentos_30_dias
  : [];

const reducoes30Dias = Array.isArray(dados.reducoes_30_dias)
  ? dados.reducoes_30_dias
  : [];


  const projecaoCaixa30Dias = Array.isArray(dados.projecao_caixa_30_dias)
  ? dados.projecao_caixa_30_dias
  : [];

const menorSaldo30Dias = Number(dados.menor_saldo_30_dias || 0);
const dataMenorSaldo30Dias = dados.data_menor_saldo_30_dias || null;


function dataBR(data) {
  if (!data) return "-";

  const [ano, mes, dia] = String(data).substring(0, 10).split("-");

  if (!ano || !mes || !dia) return "-";

  return `${dia}-${mes}-${ano}`;
}

const top3Gastos = topDespesas30Dias.slice(0, 3);

const totalTop3 = top3Gastos.reduce(
  (acc, item) => acc + Number(item.total || 0),
  0
);

const percentualTop3 =
  despesa30Dias > 0 ? (totalTop3 / despesa30Dias) * 100 : 0;



const maiorAumento = aumentos30Dias?.[0] || null;
const maiorReducao = reducoes30Dias?.[0] || null;

const caixaFicaraNegativo = menorSaldo30Dias < 0;

const resumoDiagnostico = [];

if (caixaFicaraNegativo) {
  resumoDiagnostico.push(
    `O caixa previsto fica negativo em ${dataBR(dataMenorSaldo30Dias)}, chegando a ${moeda(menorSaldo30Dias)}.`
  );
} else {
  resumoDiagnostico.push(
    `O caixa previsto permanece positivo nos próximos 30 dias, com menor saldo de ${moeda(menorSaldo30Dias)}.`
  );
}

if (maiorAumento) {
  resumoDiagnostico.push(
    `O maior aumento de gasto foi em ${maiorAumento.conta_nome}, com variação de ${moeda(maiorAumento.variacao_valor)}.`
  );
}

if (maiorReducao) {
  resumoDiagnostico.push(
    `A maior redução foi em ${maiorReducao.conta_nome}, com queda de ${moeda(Math.abs(Number(maiorReducao.variacao_valor || 0)))}.`
  );
}

if (percentualTop3 >= 70) {
  resumoDiagnostico.push(
    `As 3 maiores contas concentram ${percentualTop3.toFixed(1)}% dos custos/despesas dos últimos 30 dias.`
  );
}




  return (
    <div className="min-h-screen bg-[#f3f7fb] px-1 py-5">
       <div id="print-area" className="w-full max-w-7xl mx-auto space-y-5">

        <div className="bg-white rounded-[28px] border shadow-sm p-1">
          
        <div className="bg-white rounded-[28px] border shadow-sm p-1">
              <div className="flex justify-end items-center gap-3">
                <button onClick={() => navigate(-1)} className="btn-pill">
                  ← Voltar
                </button>

                <button onClick={carregar} className="btn-pill">
                  Atualizar
                </button>

                <button
                  onClick={() => window.print()}
                  className="btn-pill btn-black"
                >
                  🖨️ Imprimir
                </button>
              </div>
            </div>

          <div className="flex items-center gap-3 mt-5">
            <Brain size={34} />
            <div>
              <div className="text-3xl font-black">
                Diagnóstico Financeiro
              </div>
              <div className="text-slate-500">
                Separando caixa atual, compromissos em aberto e resultado realizado.
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card
            icone={<Wallet size={24} />}
            titulo="Saldo atual"
            valor={moeda(saldoAtual)}
            subtitulo="Dinheiro disponível hoje em caixa/bancos."
            cor="text-slate-900"
          />

          <Card
            icone={<CreditCard size={24} />}
            titulo="Compromissos em aberto"
            valor={moeda(compromissosAbertos)}
            subtitulo="A pagar em aberto + faturas abertas."
            cor="text-red-600"
          />

          <Card
            icone={<Wallet size={24} />}
            titulo="Caixa após compromissos"
            valor={moeda(caixaAposCompromissos)}
            subtitulo="Saldo atual menos compromissos em aberto."
            cor={
              caixaAposCompromissos >= 0
                ? "text-green-600"
                : "text-red-600"
            }
          />

          <Card
            icone={
              resultado30Dias >= 0 ? (
                <TrendingUp size={24} />
              ) : (
                <TrendingDown size={24} />
              )
            }
            titulo="Resultado realizado 30 dias"
            valor={moeda(resultado30Dias)}
            subtitulo="Receitas realizadas menos custos/despesas realizados."
            cor={resultado30Dias >= 0 ? "text-green-600" : "text-red-600"}
          />
        </div>

         <div className="bg-white rounded-3xl shadow p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-black text-lg">
                  💸 Top 10 gastos dos últimos 30 dias
                </div>

                <div className="text-xs text-slate-500 font-semibold">
                  Mostra onde os custos/despesas mais pesaram no período.
                </div>
              </div>

              <button
                onClick={() => setMostrarTopGastos(!mostrarTopGastos)}
                className="btn-pill btn-gray"
              >
                {mostrarTopGastos ? "Ocultar" : "Ver detalhes"}
              </button>
            </div>

            {mostrarTopGastos && (
              <div className="mt-4">
                {topDespesas30Dias.length === 0 ? (
                  <div className="text-sm text-slate-500 font-semibold">
                    Nenhum gasto encontrado nos últimos 30 dias.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topDespesas30Dias.map((item, idx) => {
                      const total = Number(item.total || 0);

                      const percentual =
                        despesa30Dias > 0 ? (total / despesa30Dias) * 100 : 0;

                      return (
                        <div
                          key={idx}
                          className="rounded-xl border bg-slate-50 px-3 py-2"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-black text-sm">
                                {item.conta_nome}
                              </div>

                              <div className="text-xs text-slate-500">
                                {item.codigo}
                              </div>
                            </div>

                            <div className="text-red-600 font-black text-sm">
                              {moeda(total)}
                            </div>
                          </div>

                          <div className="mt-2">
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500"
                                style={{
                                  width: `${Math.min(percentual, 100)}%`,
                                }}
                              />
                            </div>

                            <div className="mt-1 text-xs text-slate-500 font-semibold">
                              {percentual.toFixed(1)}% dos custos/despesas
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
      



          <div className="bg-white rounded-3xl shadow p-5">
            <div className="font-black text-lg mb-3">
              🎯 Concentração de gastos
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <MiniCard
                titulo="Top 3 gastos"
                valor={moeda(totalTop3)}
                subtitulo="Soma das 3 maiores contas de gasto."
                cor="text-red-600"
              />

              <MiniCard
                titulo="% sobre o total"
                valor={`${percentualTop3.toFixed(1)}%`}
                subtitulo="Participação das 3 maiores contas."
                cor={percentualTop3 >= 70 ? "text-red-600" : "text-green-600"}
              />

              <MiniCard
                titulo="Risco de concentração"
                valor={percentualTop3 >= 70 ? "Alto" : "Normal"}
                subtitulo="Quanto maior, mais dependente de poucos gastos."
                cor={percentualTop3 >= 70 ? "text-red-600" : "text-green-600"}
              />
            </div>

            <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-200 p-4 text-sm font-semibold text-slate-700">
              {percentualTop3 >= 70 ? (
                <>
                  As 3 maiores contas representam{" "}
                  <b className="text-red-600">{percentualTop3.toFixed(1)}%</b>{" "}
                  dos custos/despesas dos últimos 30 dias. Isso indica forte concentração
                  de gastos.
                </>
              ) : (
                <>
                  As 3 maiores contas representam{" "}
                  <b className="text-green-600">{percentualTop3.toFixed(1)}%</b>{" "}
                  dos custos/despesas dos últimos 30 dias. A concentração está controlada.
                </>
              )}
            </div>
          </div>

 
         
                  <div className="bg-white rounded-3xl shadow p-5">
          <div className="font-black text-lg mb-4">
            🔮 Projeção de caixa dos próximos 30 dias
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <MiniCard
              titulo="Menor saldo previsto"
              valor={moeda(menorSaldo30Dias)}
              subtitulo="Pior ponto previsto considerando contas, faturas e recorrentes."
              cor={menorSaldo30Dias >= 0 ? "text-green-600" : "text-red-600"}
            />

            <MiniCard
              titulo="Data crítica"
              valor={dataBR(dataMenorSaldo30Dias)}
              subtitulo="Data em que o saldo previsto fica menor."
              cor="text-slate-900"
            />

            <MiniCard
              titulo="Risco de caixa"
              valor={menorSaldo30Dias < 0 ? "Atenção" : "Controlado"}
              subtitulo="Não considera vendas futuras à vista."
              cor={menorSaldo30Dias < 0 ? "text-red-600" : "text-green-600"}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-200 p-4 text-sm font-semibold text-slate-700">
            Esta projeção é conservadora: considera contas a pagar, faturas e recorrentes
            previstas para os próximos 30 dias. Receitas à vista futuras não entram na
            projeção, pois ainda não aconteceram.
          </div>


              <div className="mt-4 flex justify-end">
          <button
            onClick={() => setMostrarProjecao(!mostrarProjecao)}
            className="btn-pill btn-gray"
          >
            {mostrarProjecao ? "Ocultar detalhes" : "Ver detalhes"}
          </button>
        </div>


  {mostrarProjecao && projecaoCaixa30Dias.length > 0 && (
    <div className="mt-4 overflow-x-auto">

      <div className="text-xs text-slate-500 font-semibold mb-2">
        Exibindo as próximas {Math.min(projecaoCaixa30Dias.length, 10)} datas com movimento.
      </div>

  
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b">
            <th className="py-2">Data</th>
            <th className="py-2 text-right">Entrada</th>
            <th className="py-2 text-right">Saída</th>
            <th className="py-2 text-right">Saldo previsto</th>
          </tr>
        </thead>

        <tbody>

           
           {projecaoCaixa30Dias.slice(0, 10).map((item, idx) => (
            <tr key={idx} className="border-b last:border-0">
              <td className="py-2 font-semibold">
                {dataBR(item.data_ref)}
              </td>

              <td className="py-2 text-right text-green-600 font-bold">
                {moeda(item.entrada)}
              </td>

              <td className="py-2 text-right text-red-600 font-bold">
                {moeda(item.saida)}
              </td>

              <td
                className={`py-2 text-right font-black ${
                  Number(item.saldo_previsto) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {moeda(item.saldo_previsto)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>


     <div className="bg-white rounded-3xl shadow p-5">
  <div className="font-black text-lg mb-4">
    📈 O que mudou nos gastos?
  </div>

  <div className="grid md:grid-cols-2 gap-4">
    <VariacaoLista
      titulo="Aumentaram"
      itens={aumentos30Dias}
      tipo="alta"
    />

    <VariacaoLista
      titulo="Diminuíram"
      itens={reducoes30Dias}
      tipo="baixa"
    />
  </div>
</div>
          


        <div className="bg-white rounded-3xl shadow p-6">
          <div className="font-black text-xl mb-4">
            🧠 Resultado realizado dos últimos 30 dias
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <MiniCard
              titulo="Receitas realizadas"
              valor={moeda(receita30Dias)}
              subtitulo="Entradas classificadas como receita."
              cor="text-green-600"
            />

            <MiniCard
              titulo="Custos/despesas realizados"
              valor={moeda(despesa30Dias)}
              subtitulo="Saídas realizadas classificadas como custo ou despesa."
              cor="text-red-600"
            />

            <MiniCard
              titulo="Falta para empatar 30 dias"
              valor={moeda(faltaEmpatar30Dias)}
              subtitulo="Valor necessário para zerar o resultado dos últimos 30 dias."
              cor={faltaEmpatar30Dias > 0 ? "text-red-600" : "text-green-600"}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-200 p-4 text-sm font-semibold text-slate-700">
            Nos últimos 30 dias, a empresa teve{" "}
            <b className="text-green-600">{moeda(receita30Dias)}</b>{" "}
            de receitas realizadas e{" "}
            <b className="text-red-600">{moeda(despesa30Dias)}</b>{" "}
            de custos/despesas realizados. O resultado realizado foi{" "}
            <b className={resultado30Dias >= 0 ? "text-green-600" : "text-red-600"}>
              {moeda(resultado30Dias)}
            </b>
            .
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-6">
          <div className="flex items-center gap-2 font-black text-xl mb-4">
            <AlertTriangle />
            Leitura do diagnóstico
          </div>

          <div className="space-y-3 text-sm font-semibold text-slate-700">
            <div>
              Hoje a empresa possui{" "}
              <b>{moeda(saldoAtual)}</b> em caixa/bancos.
            </div>

            <div>
              Existem compromissos em aberto de{" "}
              <b className="text-red-600">{moeda(compromissosAbertos)}</b>.
            </div>

            <div>
              Depois desses compromissos, o caixa estimado fica em{" "}
              <b
                className={
                  caixaAposCompromissos >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {moeda(caixaAposCompromissos)}
              </b>
              .
            </div>

            {resultado30Dias < 0 ? (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
                A operação dos últimos 30 dias ficou negativa em{" "}
                <b className="text-red-600">
                  {moeda(Math.abs(resultado30Dias))}
                </b>
                . Isso significa que, nesse período, os custos/despesas realizados
                foram maiores que as receitas realizadas.
              </div>
            ) : (
              <div className="rounded-2xl bg-green-50 border border-green-200 p-4">
                A operação dos últimos 30 dias ficou positiva em{" "}
                <b className="text-green-600">
                  {moeda(resultado30Dias)}
                </b>
                .
              </div>
            )}


            
          </div>
           

           <div className="bg-white rounded-3xl shadow p-5">
            <div className="font-black text-lg mb-4">
              🧠 Resumo automático do diagnóstico
            </div>

            <div className="space-y-3">
              {resumoDiagnostico.map((texto, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-50 border p-4 text-sm font-semibold text-slate-700"
                >
                  {texto}
                </div>
              ))}
            </div>
            </div>

        </div>

      </div>
    </div>
  );
}

function Card({ icone, titulo, valor, subtitulo, cor }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      {icone}
      <div className="text-xs mt-2 text-slate-500 font-bold uppercase">
        {titulo}
      </div>
      <div className={`text-xl font-black mt-1 ${cor}`}>
        {valor}
      </div>
      <div className="text-xs text-slate-500 mt-2">
        {subtitulo}
      </div>
    </div>
  );
}

function MiniCard({ titulo, valor, subtitulo, cor }) {
  return (
    <div className="rounded-2xl bg-slate-50 border p-4">
      <div className="text-xs font-black text-slate-500 uppercase">
        {titulo}
      </div>
      <div className={`text-2xl font-black mt-2 ${cor}`}>
        {valor}
      </div>
      <div className="text-xs text-slate-500 mt-2">
        {subtitulo}
      </div>
    </div>
  );
}
 function Linha({ label, valor, ajuda, cor = "text-slate-900" }) {
  return (
    <div className="rounded-2xl bg-slate-50 border p-4">
      <div className="text-xs font-black text-slate-500 uppercase">
        {label}
      </div>

      <div className={`text-xl font-black mt-1 ${cor}`}>
        {valor}
      </div>

      <div className="text-xs text-slate-500 mt-1">
        {ajuda}
      </div>
    </div>
  );
}

function VariacaoLista({ titulo, itens, tipo }) {
  const cor = tipo === "alta" ? "text-red-600" : "text-green-600";
  const simbolo = tipo === "alta" ? "▲" : "▼";

  return (
    <div className="rounded-2xl bg-slate-50 border p-4">
      <div className={`font-black mb-3 ${cor}`}>
        {simbolo} {titulo}
      </div>

      {itens.length === 0 ? (
        <div className="text-sm text-slate-500 font-semibold">
          Nenhuma variação relevante encontrada.
        </div>
      ) : (
        <div className="space-y-2">
          {itens.slice(0, 5).map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between gap-3 border-b last:border-0 pb-2"
            >
              <div>
                <div className="text-sm font-black text-slate-700">
                  {item.conta_nome}
                </div>

                <div className="text-xs text-slate-500">
                  Antes {moeda(item.valor_anterior)} → Agora{" "}
                  {moeda(item.valor_atual)}
                </div>
              </div>

              <div className={`text-right font-black ${cor}`}>
                {moeda(item.variacao_valor)}

                <div className="text-xs">
                  {Number(item.variacao_percentual) === 999
                    ? "novo"
                    : `${Number(item.variacao_percentual || 0).toFixed(1)}%`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}