 import {
  PlayCircle,
  ArrowRight,
  Clock3,
 
  Sparkles,
} from "lucide-react";

export default function VideoPrincipal() {
  return (
    <section
      id="video"
      className="py-28 bg-gradient-to-b from-white to-slate-50"
    >
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <span className="inline-flex items-center gap-2 rounded-full bg-red-100 text-red-600 px-5 py-2 font-bold">

             <PlayCircle size={18} />

            Demonstração do Sistema

          </span>

          <h2 className="mt-6 text-5xl font-black text-slate-900">

            Conheça o FinanceFlow
            <br />

            em menos de 2 minutos.

          </h2>

          <p className="mt-8 text-xl text-slate-600 leading-9 max-w-4xl mx-auto">

            Descubra como milhares de lançamentos podem ser
            organizados automaticamente em poucos segundos.

            Você importa.

            O FinanceFlow faz o restante.

          </p>

        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-center">

          {/* VIDEO */}

          <div className="lg:col-span-3">

            <div className="overflow-hidden rounded-[34px] shadow-2xl border border-slate-200 bg-black">

              <div className="aspect-video">

                <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/tdrAqBighVg"
              title="FinanceFlow"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

              </div>

            </div>

          </div>

          {/* TEXTO */}

          <div className="lg:col-span-2">

            <div className="rounded-[32px] bg-white border border-slate-200 p-10 shadow-xl">

              <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center mb-8">

                <PlayCircle
                  className="text-cyan-600"
                  size={34}
                />

              </div>

              <h3 className="text-3xl font-black text-slate-900 leading-tight">

                Veja o sistema funcionando
                antes mesmo de criar sua conta.

              </h3>

              <p className="mt-8 text-lg leading-8 text-slate-600">

                Neste vídeo você verá como o FinanceFlow
                organiza automaticamente informações
                financeiras, cartões de crédito,
                fluxo de caixa,
                DRE,
                dashboards
                e indicadores da empresa.

              </p>

              <div className="space-y-5 mt-10">

                <div className="flex items-center gap-4">

                  <Sparkles
                    size={22}
                    className="text-cyan-600"
                  />

                  <span className="font-medium text-slate-700">

                    Importação Bancária

                  </span>

                </div>

                <div className="flex items-center gap-4">

                  <Sparkles
                    size={22}
                    className="text-cyan-600"
                  />

                  <span className="font-medium text-slate-700">

                    Cartões de Crédito

                  </span>

                </div>

                <div className="flex items-center gap-4">

                  <Sparkles
                    size={22}
                    className="text-cyan-600"
                  />

                  <span className="font-medium text-slate-700">

                    Fluxo de Caixa

                  </span>

                </div>

                <div className="flex items-center gap-4">

                  <Sparkles
                    size={22}
                    className="text-cyan-600"
                  />

                  <span className="font-medium text-slate-700">

                    DRE Automática

                  </span>

                </div>

                <div className="flex items-center gap-4">

                  <Sparkles
                    size={22}
                    className="text-cyan-600"
                  />

                  <span className="font-medium text-slate-700">

                    Contabilidade Integrada

                  </span>

                </div>

              </div>

              <div className="flex items-center gap-3 mt-10 text-slate-500">

                <Clock3 size={18} />

                <span>

                  Duração aproximada: 2 minutos

                </span>

              </div>

              <a
                href="/cadastro"
                className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition px-8 py-4 font-black text-slate-900"
              >

                Quero testar gratuitamente

                <ArrowRight size={22} />

              </a>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}