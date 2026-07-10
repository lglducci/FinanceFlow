import {
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  TrendingUp,
  Landmark,
  CreditCard,
  BrainCircuit,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#071326] via-[#0F172A] to-[#0d4fa8]">

      {/* Glow */}
      <div className="absolute -top-52 -left-52 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[180px]" />
      <div className="absolute bottom-[-220px] right-[-220px] h-[550px] w-[550px] rounded-full bg-blue-500/20 blur-[200px]" />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.05]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-36 pb-24">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ESQUERDA */}

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-cyan-300 text-sm font-semibold mb-8">

              <TrendingUp size={18} />

              Plataforma completa para gestão financeira

            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-tight text-white">

              Seu banco informa.

              <br />

              <span className="text-cyan-300">

                O FinanceFlow organiza.

              </span>

            </h1>

            <p className="mt-8 text-xl leading-9 text-slate-300 max-w-xl">

              Importe extratos bancários, cartões de crédito,
              organize receitas, despesas, fluxo de caixa,
              DRE e contabilidade em um único lugar.

            </p>

            <div className="flex flex-wrap gap-4 mt-10">

              <a
                href="/cadastro"
                className="inline-flex items-center gap-3 rounded-2xl bg-cyan-400 px-8 py-4 font-black text-slate-900 hover:scale-105 transition shadow-2xl shadow-cyan-500/30"
              >
                Começar Gratuitamente

                <ArrowRight size={22} />

              </a>

              <a
                href="#video"
                className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur hover:bg-white/10 transition"
              >
                <PlayCircle size={22} />

                Ver Demonstração

              </a>

            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-12">

              <div className="flex items-center gap-3">

                <CheckCircle2
                  className="text-green-400"
                  size={22}
                />

                <span className="text-slate-300">

                  7 dias grátis

                </span>

              </div>

              <div className="flex items-center gap-3">

                <CheckCircle2
                  className="text-green-400"
                  size={22}
                />

                <span className="text-slate-300">

                  Sem cartão

                </span>

              </div>

              <div className="flex items-center gap-3">

                <CheckCircle2
                  className="text-green-400"
                  size={22}
                />

                <span className="text-slate-300">

                  Cancelamento livre

                </span>

              </div>

            </div>

          </div>

          {/* DIREITA */}

          <div className="relative">

            {/* Notebook */}

            <div className="rounded-[34px] border border-cyan-400/20 bg-slate-900/70 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,.45)] overflow-hidden">

              <div className="h-10 bg-slate-800 flex items-center px-5 gap-2">

                <div className="h-3 w-3 rounded-full bg-red-400" />

                <div className="h-3 w-3 rounded-full bg-yellow-400" />

                <div className="h-3 w-3 rounded-full bg-green-400" />

              </div>

              <img
                src="/dashboard.png"
                alt="FinanceFlow"
                className="w-full"
              />

            </div>

            {/* CARD */}

            <div className="absolute -left-10 top-14 w-56 rounded-3xl bg-white shadow-2xl p-5">

              <div className="flex items-center gap-3 mb-3">

                <Landmark
                  className="text-cyan-600"
                  size={28}
                />

                <div>

                  <div className="font-black">

                    Extrato

                  </div>

                  <div className="text-xs text-slate-500">

                    Importado

                  </div>

                </div>

              </div>

              <div className="text-3xl font-black text-cyan-700">

                ✔

              </div>

            </div>

            <div className="absolute -right-8 top-52 w-60 rounded-3xl bg-white shadow-2xl p-5">

              <div className="flex items-center gap-3 mb-3">

                <CreditCard
                  className="text-blue-600"
                  size={28}
                />

                <div>

                  <div className="font-black">

                    Cartões

                  </div>

                  <div className="text-xs text-slate-500">

                    Conciliados

                  </div>

                </div>

              </div>

              <div className="h-2 rounded-full bg-slate-200">

                <div className="h-2 rounded-full w-[82%] bg-cyan-500" />

              </div>

            </div>

            <div className="absolute left-16 -bottom-10 w-64 rounded-3xl bg-white shadow-2xl p-5">

              <div className="flex items-center gap-3 mb-3">

                <BrainCircuit
                  className="text-violet-600"
                  size={28}
                />

                <div>

                  <div className="font-black">

                    IA FinanceFlow

                  </div>

                  <div className="text-xs text-slate-500">

                    Organização automática

                  </div>

                </div>

              </div>

              <p className="text-sm text-slate-600 leading-6">

                Seu banco informa.

                <br />

                O FinanceFlow organiza receitas,
                despesas, cartões, fluxo de caixa,
                DRE e contabilidade.

              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}