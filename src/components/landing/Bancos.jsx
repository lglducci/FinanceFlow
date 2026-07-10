 
import {
  Landmark,
  Building2,
  Wallet,
  CreditCard,
  BadgeCheck,
} from "lucide-react";

const bancos = [
  "Santander",
  "Banco do Brasil",
  "Caixa",
  "Itaú",
  "Bradesco",
  "Sicoob",
  "Sicredi",
  "Inter",
  "Nubank",
  "XP",
];

export default function Bancos() {
  return (
    <section className="bg-white py-20">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-14">

          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-100 text-cyan-700 font-bold px-5 py-2">

            <BadgeCheck size={18} />

            Compatível com os principais bancos

          </span>

          <h2 className="mt-6 text-4xl font-black text-slate-900">

            Importe seus extratos em segundos.

          </h2>

          <p className="mt-5 text-xl text-slate-600 max-w-3xl mx-auto leading-8">

            Pare de digitar lançamentos manualmente.
            O FinanceFlow importa seus extratos bancários,
            identifica movimentações e organiza automaticamente
            sua gestão financeira.

          </p>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

          {bancos.map((banco) => (
            <div
              key={banco}
              className="rounded-3xl border border-slate-200 bg-white p-8 hover:border-cyan-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >

              <div className="flex justify-center mb-5">

                {banco === "XP" && (
                  <Wallet
                    size={42}
                    className="text-cyan-600"
                  />
                )}

                {banco === "Nubank" && (
                  <CreditCard
                    size={42}
                    className="text-cyan-600"
                  />
                )}

                {banco !== "XP" &&
                  banco !== "Nubank" && (
                    <Landmark
                      size={42}
                      className="text-cyan-600"
                    />
                  )}

              </div>

              <h3 className="text-center font-bold text-slate-800">

                {banco}

              </h3>

            </div>
          ))}

        </div>

        <div className="mt-20 grid lg:grid-cols-3 gap-8">

          <div className="rounded-3xl bg-slate-50 p-8">

            <Building2
              size={42}
              className="text-cyan-600 mb-5"
            />

            <h3 className="text-xl font-black mb-4">

              Importação Bancária

            </h3>

            <p className="text-slate-600 leading-7">

              Leia automaticamente extratos bancários
              e transforme movimentações em receitas,
              despesas e conciliações.

            </p>

          </div>

          <div className="rounded-3xl bg-slate-50 p-8">

            <CreditCard
              size={42}
              className="text-cyan-600 mb-5"
            />

            <h3 className="text-xl font-black mb-4">

              Cartões de Crédito

            </h3>

            <p className="text-slate-600 leading-7">

              Importe faturas em PDF ou Excel e deixe
              o FinanceFlow organizar automaticamente
              suas compras.

            </p>

          </div>

          <div className="rounded-3xl bg-slate-50 p-8">

            <BadgeCheck
              size={42}
              className="text-cyan-600 mb-5"
            />

            <h3 className="text-xl font-black mb-4">

              Organização Inteligente

            </h3>

            <p className="text-slate-600 leading-7">

              Seu banco apenas informa.
              O FinanceFlow organiza,
              classifica e transforma os dados
              em informação útil para sua empresa.

            </p>

          </div>

        </div>

      </div>

    </section>
  );
}