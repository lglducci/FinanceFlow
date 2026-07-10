 import {
  Landmark,
  FileSpreadsheet,
  BrainCircuit,
  Wallet,
  BarChart3,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const etapas = [
  {
    icon: Landmark,
    titulo: "Banco",
    descricao: "Importe seu extrato bancário.",
  },
  {
    icon: FileSpreadsheet,
    titulo: "Extrato",
    descricao: "O FinanceFlow identifica as movimentações.",
  },
  {
    icon: BrainCircuit,
    titulo: "Inteligência",
    descricao: "Receitas, despesas e cartões são organizados automaticamente.",
  },
  {
    icon: Wallet,
    titulo: "Financeiro",
    descricao: "Contas a pagar, receber e fluxo ficam atualizados.",
  },
  {
    icon: BarChart3,
    titulo: "Contabilidade",
    descricao: "DRE, Balancete e Razão são gerados automaticamente.",
  },
  {
    icon: TrendingUp,
    titulo: "Decisão",
    descricao: "Você entende sua empresa e toma decisões com segurança.",
  },
];

export default function Solucao() {
  return (
    <section className="py-24 bg-white overflow-hidden">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-20">

          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-100 text-cyan-700 font-bold px-5 py-2">

            <CheckCircle2 size={18} />

            Simples. Inteligente. Automático.

          </span>

          <h2 className="mt-6 text-5xl font-black text-slate-900">

            Você importa.

            <br />

            <span className="text-cyan-600">

              O FinanceFlow faz o resto.

            </span>

          </h2>

          <p className="mt-8 text-xl text-slate-600 leading-9 max-w-4xl mx-auto">

            Esqueça lançamentos manuais.
            O FinanceFlow transforma dados bancários
            em informações úteis para administrar sua empresa.

          </p>

        </div>

        {/* Timeline */}

        <div className="hidden lg:flex items-center justify-between gap-2">

          {etapas.map((item, index) => {

            const Icon = item.icon;

            return (
              <>
                <div
                  key={item.titulo}
                  className="flex-1 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-2xl hover:border-cyan-400 hover:-translate-y-2 transition-all duration-300"
                >

                  <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center mx-auto mb-6">

                    <Icon
                      className="text-cyan-600"
                      size={34}
                    />

                  </div>

                  <h3 className="text-center text-2xl font-black text-slate-900 mb-4">

                    {item.titulo}

                  </h3>

                  <p className="text-center text-slate-600 leading-7">

                    {item.descricao}

                  </p>

                </div>

                {index < etapas.length - 1 && (

                  <ArrowRight
                    className="text-cyan-400 flex-shrink-0"
                    size={34}
                  />

                )}

              </>
            );
          })}

        </div>

        {/* Mobile */}

        <div className="lg:hidden space-y-6">

          {etapas.map((item, index) => {

            const Icon = item.icon;

            return (

              <div key={item.titulo}>

                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow">

                  <div className="flex items-center gap-5">

                    <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center">

                      <Icon
                        className="text-cyan-600"
                        size={32}
                      />

                    </div>

                    <div>

                      <h3 className="text-xl font-black">

                        {item.titulo}

                      </h3>

                      <p className="text-slate-600 mt-1">

                        {item.descricao}

                      </p>

                    </div>

                  </div>

                </div>

                {index < etapas.length - 1 && (

                  <div className="flex justify-center py-3">

                    <ArrowRight
                      className="rotate-90 text-cyan-400"
                      size={30}
                    />

                  </div>

                )}

              </div>

            );

          })}

        </div>

        {/* Destaque */}

        <div className="mt-24 rounded-[40px] bg-gradient-to-r from-cyan-500 via-blue-600 to-[#071326] p-12 text-white shadow-2xl">

          <div className="grid lg:grid-cols-2 gap-14 items-center">

            <div>

              <h3 className="text-4xl font-black leading-tight">

                Seu trabalho termina na importação.

              </h3>

              <h4 className="text-cyan-200 text-3xl font-black mt-4">

                O restante é com o FinanceFlow.

              </h4>

              <p className="mt-8 text-lg leading-9 text-slate-100">

                Extratos bancários, cartões de crédito,
                receitas, despesas, fluxo de caixa,
                DRE, indicadores financeiros e contabilidade.

                Tudo organizado automaticamente em poucos segundos.

              </p>

            </div>

            <div className="grid grid-cols-2 gap-5">

              {[
                "Importação Bancária",
                "Importação de Cartões",
                "Fluxo de Caixa",
                "Contas a Pagar",
                "Contas a Receber",
                "Dashboard",
                "DRE",
                "Contabilidade",
              ].map((item) => (

                <div
                  key={item}
                  className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-5"
                >

                  <div className="flex items-center gap-3">

                    <CheckCircle2
                      size={22}
                      className="text-green-300"
                    />

                    <span className="font-semibold">

                      {item}

                    </span>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}