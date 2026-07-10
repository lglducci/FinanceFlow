 
import {
  PlayCircle,
 
  ExternalLink,
  Clock3,
} from "lucide-react";

const videos = [
  {
    titulo: "Conheça o FinanceFlow",
    tempo: "2 min",
    descricao:
      "Uma visão geral da plataforma e dos principais recursos.",
    thumb: "https://img.youtube.com/vi/IIx3xgZgub8/maxresdefault.jpg",
    link: "https://www.youtube.com/watch?v=tdrAqBighVg",
  },
  {
    titulo: "Importação Bancária",
    tempo: "3 min",
    descricao:
      "Veja como importar extratos bancários automaticamente.",
    thumb: "https://img.youtube.com/vi/IIx3xgZgub8/hqdefault.jpg",
    link: "https://youtu.be/2OINCdmffck",
  },
  {
    titulo: "Importação de Cartões",
    tempo: "4 min",
    descricao:
      "Importe faturas PDF e Excel em poucos segundos.",
    thumb: "https://img.youtube.com/vi/IIx3xgZgub8/hqdefault.jpg",
    link: "https://youtu.be/Vy8F0XCo4Q0",
  },
  {
    titulo: "Fluxo de Caixa",
    tempo: "5 min",
    descricao:
      "Entenda rapidamente a situação financeira da empresa.",
    thumb: "https://img.youtube.com/vi/IIx3xgZgub8/hqdefault.jpg",
    link: "https://youtu.be/nBDtTQe2dyM",
  },
  {
    titulo: "DRE Automática",
    tempo: "3 min",
    descricao:
      "Descubra seu lucro real em poucos cliques.",
    thumb: "https://img.youtube.com/vi/IIx3xgZgub8/hqdefault.jpg",
    link: "https://www.youtube.com/watch?v=nX_Vl8h8JrM",
  },
  {
    titulo: "Diagnostico Inteligente",
    tempo: "4 min",
    descricao:
      "Conheça os indicadores inteligentes do sistema.",
    thumb: "https://img.youtube.com/vi/IIx3xgZgub8/hqdefault.jpg",
    link: "https://youtu.be/MiTxQz8VAG8",
  },
];

export default function VideosYoutube() {
  return (
    <section
      id="videos"
      className="py-24 bg-slate-900"
    >
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 text-red-400 px-5 py-2 font-bold">

            <PlayCircle size={18} />

            Canal Oficial

          </span>

          <h2 className="mt-6 text-5xl font-black text-white">

            Aprenda antes mesmo
            <br />

            de criar sua conta.

          </h2>

          <p className="mt-8 max-w-4xl mx-auto text-xl leading-9 text-slate-300">

            Todos os vídeos são gravados utilizando
            o FinanceFlow em funcionamento.

            Sem apresentações.

            Sem slides.

            Você aprende vendo o sistema real.

          </p>

        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

          {videos.map((video) => (

            <a
              key={video.titulo}
              href={video.link}
              target="_blank"
              rel="noreferrer"
              className="group rounded-[28px] overflow-hidden bg-slate-800 border border-slate-700 hover:border-red-500 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >

              <div className="relative overflow-hidden">

                <img
                  src={video.thumb}
                  alt={video.titulo}
                  className="w-full aspect-video object-cover group-hover:scale-105 transition duration-500"
                />

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />

                <div className="absolute inset-0 flex items-center justify-center">

                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition">

                    <PlayCircle
                      size={46}
                      className="text-red-600"
                    />

                  </div>

                </div>

              </div>

              <div className="p-7">

                <div className="flex items-center justify-between mb-4">

                  <div className="flex items-center gap-2 text-slate-400">

                    <Clock3 size={16} />

                    <span className="text-sm">

                      {video.tempo}

                    </span>

                  </div>

                  <ExternalLink
                    size={18}
                    className="text-slate-500"
                  />

                </div>

                <h3 className="text-2xl font-black text-white leading-snug">

                  {video.titulo}

                </h3>

                <p className="mt-4 text-slate-400 leading-7">

                  {video.descricao}

                </p>

              </div>

            </a>

          ))}

        </div>

        <div className="mt-20 rounded-[36px] bg-gradient-to-r from-red-600 to-red-500 p-12">

          <div className="grid lg:grid-cols-2 gap-10 items-center">

            <div>

              <h3 className="text-4xl font-black text-white">

                Toda semana novos vídeos.

              </h3>

              <p className="mt-6 text-red-100 text-lg leading-8">

                Acompanhe o canal para aprender novos recursos,
                melhorias e dicas para administrar melhor sua empresa.

              </p>

            </div>

            <div className="flex justify-center lg:justify-end">

              <a
                href="https://www.youtube.com/@luis.automacoes"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-4 rounded-2xl bg-white px-10 py-5 text-xl font-black text-red-600 hover:scale-105 transition"
              >

                <PlayCircle size={30} />

                Acessar Canal

              </a>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}