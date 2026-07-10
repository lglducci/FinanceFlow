 
import {
  Landmark,
  CreditCard,
  BrainCircuit,
  Wallet,
  BarChart3,
  TrendingUp,
  ArrowDown,
  CheckCircle2,
} from "lucide-react";

const etapas = [
  {
    icon: Landmark,
    titulo: "1. Importe seu Extrato",
    texto:
      "Importe o extrato bancário em poucos segundos. O FinanceFlow identifica automaticamente todas as movimentações.",
  },
  {
    icon: CreditCard,
    titulo: "2. Importe as Faturas",
    texto:
      "Importe PDFs ou planilhas das administradoras de cartão. As compras são organizadas automaticamente.",
  },
  {
    icon: BrainCircuit,
    titulo: "3. O FinanceFlow Organiza",
    texto:
      "Receitas, despesas, cartões, contas a pagar e receber são classificados automaticamente.",
  },
  {
    icon: Wallet,
    titulo: "4. Controle Financeiro",
    texto:
      "Fluxo de caixa, contas recorrentes, conciliação bancária e toda movimentação financeira em um único lugar.",
  },
  {
    icon: BarChart3,
    titulo: "5. Relatórios Inteligentes",
    texto:
      "Dashboard, DRE, Balancete, Razão, indicadores financeiros e contabilidade integrada.",
  },
  {
    icon: TrendingUp,
    titulo: "6. Tome Decisões",
    texto:
      "Agora você entende exatamente para onde o dinheiro foi e quanto sua empresa realmente está lucrando.",
  },
];

export default function ComoFunciona() {
  return (
    <section className="py-28 bg-white">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-20">

          <span className="inline-flex rounded-full bg-cyan-100 text-cyan-700 px-5 py-2 font-bold">

            Como funciona

          </span>

          <h2 className="mt-6 text-5xl font-black text-slate-900">

            Da importação até a decisão.

          </h2>

          <p className="mt-8 text-xl text-slate-600 leading-9 max-w-4xl mx-auto">

            O objetivo do FinanceFlow é simples:
            você não perde tempo digitando informações.
            Você importa os dados.
            O sistema organiza tudo automaticamente.

          </p>

        </div>

        <div className="max-w-5xl mx-auto">

          {etapas.map((etapa, index) => {

            const Icon = etapa.icon;

            return (

              <div key={index}>

                <div className="group flex flex-col md:flex-row gap-8 rounded-[32px] bg-slate-50 border border-slate-200 p-8 hover:border-cyan-400 hover:shadow-2xl transition-all duration-300">

                  <div className="flex-shrink-0">

                    <div className="w-20 h-20 rounded-3xl bg-cyan-500 flex items-center justify-center group-hover:scale-110 transition">

                      <Icon
                        size={38}
                        className="text-white"
                      />

                    </div>

                  </div>

                  <div className="flex-1">

                    <h3 className="text-3xl font-black text-slate-900">

                      {etapa.titulo}

                    </h3>

                    <p className="mt-5 text-lg leading-9 text-slate-600">

                      {etapa.texto}

                    </p>

                  </div>

                </div>

                {index < etapas.length - 1 && (

                  <div className="flex justify-center py-6">

                    <ArrowDown
                      size={34}
                      className="text-cyan-500"
                    />

                  </div>

                )}

              </div>

            );

          })}

        </div>

        <div className="mt-24 rounded-[40px] bg-gradient-to-r from-[#071326] via-[#0F172A] to-[#0d4fa8] p-14 text-center shadow-2xl">

          <div className="inline-flex items-center gap-3 rounded-full bg-cyan-500/20 px-6 py-3">

            <CheckCircle2
              className="text-cyan-300"
              size={24}
            />

            <span className="text-cyan-200 font-bold">

              Tudo em um único sistema

            </span>

          </div>

          <h3 className="mt-8 text-5xl font-black text-white leading-tight">

            Você importa.

            <br />

            <span className="text-cyan-300">

              O FinanceFlow faz o resto.

            </span>

          </h3>

          <p className="mt-10 max-w-4xl mx-auto text-xl leading-9 text-slate-300">

            Enquanto outras soluções mostram apenas números,
            o FinanceFlow transforma informações financeiras
            em conhecimento para que você administre sua empresa
            com muito mais segurança.

          </p>

          <a
             href="/cadastro"
            className="inline-flex mt-12 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition px-10 py-5 text-xl font-black text-slate-900"
          >
            Quero começar gratuitamente
          </a>

        </div>

      </div>

    </section>
  );
}