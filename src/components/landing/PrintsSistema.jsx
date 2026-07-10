 
import {
  LayoutDashboard,
  Landmark,
  CreditCard,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const telas = [
  {
    titulo: "Dashboard Financeiro",
    descricao:
      "Visualize receitas, despesas, saldo, fluxo de caixa e indicadores em tempo real.",
    imagem: "/prints/dashboard.png",
    icon: LayoutDashboard,
  },
  {
    titulo: "Importação Bancária",
    descricao:
      "Importe extratos bancários automaticamente e organize centenas de movimentações em segundos.",
    imagem: "/prints/importacao.png",
    icon: Landmark,
  },
  {
    titulo: "Cartões de Crédito",
    descricao:
      "Importe faturas PDF ou Excel e acompanhe compras, parcelas e pagamentos.",
    imagem: "/prints/cartoes.png",
    icon: CreditCard,
  },
  {
    titulo: "DRE e Contabilidade",
    descricao:
      "Veja rapidamente o lucro da empresa com DRE, Balancete, Razão e demais relatórios.",
    imagem: "/prints/dre.png",
    icon: BarChart3,
  },
];

export default function PrintsSistema() {
  return (
    <section className="bg-slate-50 py-28">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-20">

          <span className="inline-block rounded-full bg-cyan-100 text-cyan-700 font-bold px-5 py-2">

            Conheça o sistema

          </span>

          <h2 className="mt-6 text-5xl font-black text-slate-900">

            Um sistema moderno.

            <br />

            Feito para quem precisa decidir rápido.

          </h2>

          <p className="mt-8 text-xl text-slate-600 max-w-4xl mx-auto leading-9">

            O FinanceFlow foi desenvolvido para que você
            encontre qualquer informação em poucos segundos.

            Sem telas complicadas.

            Sem menus intermináveis.

          </p>

        </div>

        <div className="space-y-24">

          {telas.map((item, index) => {

            const Icon = item.icon;

            return (

              <div
                key={item.titulo}
                className={`grid lg:grid-cols-2 gap-16 items-center ${
                  index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >

                <div>

                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-100 mb-8">

                    <Icon
                      className="text-cyan-700"
                      size={34}
                    />

                  </div>

                  <h3 className="text-4xl font-black text-slate-900 leading-tight">

                    {item.titulo}

                  </h3>

                  <p className="mt-8 text-lg leading-9 text-slate-600">

                    {item.descricao}

                  </p>

                  <div className="mt-10">

                    <a
                      href="/cadastro"
                      className="inline-flex items-center gap-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition px-8 py-4 text-slate-900 font-black"
                    >
                      Quero experimentar

                      <ArrowRight size={20} />

                    </a>

                  </div>

                </div>

                <div>

                  <div className="rounded-[34px] overflow-hidden border border-slate-200 shadow-[0_30px_80px_rgba(15,23,42,.15)] bg-white">

                    <img
                      src={item.imagem}
                      alt={item.titulo}
                      className="w-full hover:scale-[1.02] transition duration-500"
                    />

                  </div>

                </div>

              </div>

            );

          })}

        </div>

        <div className="mt-28 rounded-[40px] bg-gradient-to-r from-cyan-500 via-blue-600 to-[#071326] p-16 text-center shadow-2xl">

          <h3 className="text-5xl font-black text-white">

            Pare de controlar.

            <br />

            Comece a administrar.

          </h3>

          <p className="mt-8 text-xl text-slate-100 leading-9 max-w-4xl mx-auto">

            O FinanceFlow organiza automaticamente
            seus dados financeiros para que você
            gaste seu tempo administrando a empresa,
            e não preenchendo planilhas.

          </p>

          <a
             href="/cadastro"
            className="inline-flex mt-12 rounded-2xl bg-white px-10 py-5 text-xl font-black text-cyan-700 hover:scale-105 transition"
          >
            Começar Gratuitamente
          </a>

        </div>

      </div>

    </section>
  );
}