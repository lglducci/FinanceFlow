 import {
  Landmark,
  CreditCard,
  Wallet,
  ArrowLeftRight,
  Receipt,
  CalendarClock,
  BarChart3,
  PieChart,
  BrainCircuit,
  FileSpreadsheet,
  Building2,
  ShieldCheck,
} from "lucide-react";

const recursos = [
  {
    icon: Landmark,
    titulo: "Importação Bancária",
    descricao:
      "Importe extratos bancários em segundos e deixe o FinanceFlow organizar automaticamente suas movimentações.",
  },
  {
    icon: CreditCard,
    titulo: "Cartões de Crédito",
    descricao:
      "Importe faturas PDF ou Excel e transforme compras em lançamentos financeiros e contábeis.",
  },
  {
    icon: Wallet,
    titulo: "Fluxo de Caixa",
    descricao:
      "Visualize entradas, saídas e saldo futuro para tomar decisões com segurança.",
  },
  {
    icon: ArrowLeftRight,
    titulo: "Conciliação Financeira",
    descricao:
      "Concilie rapidamente movimentações bancárias, cartões e lançamentos internos.",
  },
  {
    icon: Receipt,
    titulo: "Contas a Pagar e Receber",
    descricao:
      "Controle vencimentos, pagamentos, recebimentos e recorrências em uma única tela.",
  },
  {
    icon: CalendarClock,
    titulo: "Contas Recorrentes",
    descricao:
      "Nunca mais esqueça um pagamento. O sistema gera automaticamente suas despesas recorrentes.",
  },
  {
    icon: BarChart3,
    titulo: "Dashboard Inteligente",
    descricao:
      "Indicadores financeiros, receitas, despesas, saldo projetado e evolução da empresa.",
  },
  {
    icon: PieChart,
    titulo: "DRE Automática",
    descricao:
      "Descubra rapidamente se sua empresa realmente está dando lucro.",
  },
  {
    icon: BrainCircuit,
    titulo: "Inteligência Artificial",
    descricao:
      "Receba ajuda para interpretar informações financeiras e entender melhor sua empresa.",
  },
  {
    icon: FileSpreadsheet,
    titulo: "Contabilidade Integrada",
    descricao:
      "Balancete, Razão, Diário, Balanço Patrimonial e demais relatórios contábeis.",
  },
  {
    icon: Building2,
    titulo: "Multiempresa",
    descricao:
      "Gerencie diversas empresas utilizando uma única conta com total independência.",
  },
  {
    icon: ShieldCheck,
    titulo: "Segurança",
    descricao:
      "Seus dados protegidos em ambiente seguro com autenticação e armazenamento em nuvem.",
  },
];

export default function Recursos() {
  return (
    <section
      id="recursos"
      className="bg-slate-50 py-24"
    >
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <span className="inline-flex rounded-full bg-cyan-100 text-cyan-700 font-bold px-5 py-2">
            Tudo o que sua empresa precisa
          </span>

          <h2 className="mt-6 text-5xl font-black text-slate-900">

            Muito mais do que um sistema financeiro.

          </h2>

          <p className="mt-6 max-w-4xl mx-auto text-xl leading-9 text-slate-600">

            O FinanceFlow reúne gestão financeira,
            importação bancária,
            cartões,
            indicadores,
            fluxo de caixa
            e contabilidade
            em uma única plataforma.

          </p>

        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

          {recursos.map((item) => {

            const Icon = item.icon;

            return (

              <div
                key={item.titulo}
                className="group rounded-3xl bg-white border border-slate-200 p-8 hover:border-cyan-400 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >

                <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center mb-6 group-hover:bg-cyan-500 transition">

                  <Icon
                    size={34}
                    className="text-cyan-600 group-hover:text-white transition"
                  />

                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-4">

                  {item.titulo}

                </h3>

                <p className="text-slate-600 leading-8">

                  {item.descricao}

                </p>

              </div>

            );

          })}

        </div>

        <div className="mt-20 rounded-[36px] bg-[#071326] overflow-hidden">

          <div className="grid lg:grid-cols-2">

            <div className="p-12">

              <span className="inline-flex rounded-full bg-cyan-500/20 text-cyan-300 font-bold px-5 py-2">

                FinanceFlow

              </span>

              <h3 className="mt-6 text-4xl font-black text-white leading-tight">

                Um único sistema.

                <br />

                Toda a gestão da sua empresa.

              </h3>

              <p className="mt-8 text-lg leading-9 text-slate-300">

                Enquanto outras soluções resolvem apenas uma parte do problema,
                o FinanceFlow conecta banco, financeiro,
                cartões, indicadores,
                contabilidade e inteligência artificial
                em uma única plataforma.

              </p>

              <a
                href="/cadastro"
                className="inline-flex mt-10 rounded-2xl bg-cyan-400 px-8 py-4 font-black text-slate-900 hover:scale-105 transition"
              >
                Começar gratuitamente
              </a>

            </div>

            <div className="bg-gradient-to-br from-cyan-500 via-blue-600 to-[#0F172A] p-12 flex items-center justify-center">

              <div className="grid grid-cols-2 gap-5 w-full">

                {recursos.slice(0,8).map((item) => {

                  const Icon = item.icon;

                  return (

                    <div
                      key={item.titulo}
                      className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-5"
                    >

                      <Icon
                        className="text-cyan-200 mb-3"
                        size={30}
                      />

                      <div className="font-bold text-white">

                        {item.titulo}

                      </div>

                    </div>

                  );

                })}

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}