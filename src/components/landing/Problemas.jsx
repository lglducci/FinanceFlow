 
import {
  CircleDollarSign,
  CalendarClock,
  FileSpreadsheet,
  TrendingDown,
  Brain,
  AlertTriangle,
} from "lucide-react";

const problemas = [
  {
    icon: CircleDollarSign,
    titulo: "Você sabe se sua empresa realmente deu lucro?",
    texto:
      "Olhar o saldo da conta não significa que sua empresa está lucrando. Muitas empresas faturam bem e mesmo assim operam no prejuízo.",
  },
  {
    icon: CalendarClock,
    titulo: "As contas vencem e você descobre tarde demais?",
    texto:
      "Controle de vencimentos, contas a pagar e receber para você nunca mais ser pego de surpresa.",
  },
  {
    icon: FileSpreadsheet,
    titulo: "Ainda usa planilhas para controlar o financeiro?",
    texto:
      "Planilhas consomem tempo, geram erros e dificultam enxergar a situação real da empresa.",
  },
  {
    icon: TrendingDown,
    titulo: "Seu banco mostra o saldo, mas não mostra o resultado.",
    texto:
      "Extratos bancários informam movimentações. Eles não explicam para onde o dinheiro foi nem quanto sua empresa realmente ganhou.",
  },
  {
    icon: Brain,
    titulo: "Os relatórios contábeis parecem complicados?",
    texto:
      "DRE, Balancete e Razão deixam de ser documentos difíceis e passam a mostrar informações claras para tomada de decisão.",
  },
  {
    icon: AlertTriangle,
    titulo: "Você toma decisões sem informações confiáveis?",
    texto:
      "Sem organização financeira fica difícil investir, contratar, reduzir custos ou crescer com segurança.",
  },
];

export default function Problemas() {
  return (
    <section className="bg-slate-50 py-24">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <span className="inline-block rounded-full bg-red-100 text-red-600 font-bold px-5 py-2">
            A realidade de milhares de empresas
          </span>

          <h2 className="mt-6 text-5xl font-black text-slate-900">

            Parece que estamos descrevendo sua empresa?

          </h2>

          <p className="mt-6 text-xl text-slate-600 max-w-3xl mx-auto leading-8">

            A maioria das pequenas empresas enfrenta exatamente os mesmos
            desafios. O problema não é falta de esforço.
            É falta de informação organizada.

          </p>

        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

          {problemas.map((item, index) => {

            const Icon = item.icon;

            return (

              <div
                key={index}
                className="group rounded-3xl bg-white border border-slate-200 p-8 hover:border-cyan-400 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >

                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6 group-hover:bg-cyan-50 transition">

                  <Icon
                    size={34}
                    className="text-red-500 group-hover:text-cyan-600 transition"
                  />

                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-4 leading-snug">

                  {item.titulo}

                </h3>

                <p className="text-slate-600 leading-8">

                  {item.texto}

                </p>

              </div>

            );

          })}

        </div>

        <div className="mt-20 rounded-[36px] bg-gradient-to-r from-[#071326] via-[#0F172A] to-[#0d4fa8] p-12 text-center shadow-2xl">

          <h3 className="text-4xl font-black text-white">

            O banco informa.

          </h3>

          <h3 className="mt-2 text-5xl font-black text-cyan-300">

            O FinanceFlow organiza.

          </h3>

          <p className="mt-8 text-xl text-slate-300 max-w-4xl mx-auto leading-9">

            Importe seus extratos bancários, cartões de crédito e deixe o
            FinanceFlow organizar automaticamente receitas, despesas,
            fluxo de caixa, DRE, indicadores financeiros e contabilidade.

          </p>

          <a
            href="/cadastro"
            className="inline-flex mt-10 rounded-2xl bg-cyan-400 px-8 py-4 text-lg font-black text-slate-900 hover:scale-105 transition"
          >
            Quero experimentar gratuitamente
          </a>

        </div>

      </div>

    </section>
  );
}