import { useNavigate } from "react-router-dom";

export default function AjudaOrigemContabil() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">

      {/* VOLTAR */}
      <div className="p-4">
        <button
          onClick={() => navigate("/ajuda/contabil")}
          className="bg-white text-[#0b1f3a] px-3 py-1 rounded font-bold"
        >
          ← Voltar
        </button>
      </div>

      {/* HEADER */}
      <div className="bg-[#0b1f3a] text-white py-8 text-center">
        <h1 className="text-2xl font-bold">
          📜 Origem da Contabilidade
        </h1>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-3xl mx-auto p-6 bg-white mt-6 rounded-xl shadow text-sm text-gray-700 space-y-6">

        {/* INTRO */}
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded">
          A contabilidade surgiu da necessidade de controlar bens, dívidas e resultados de forma organizada.
        </div>

        {/* POR QUE EXISTE */}
        <div>
          <h2 className="font-semibold text-lg mb-2">💡 Por que a contabilidade existe?</h2>
          <p>
            Desde os tempos antigos, as pessoas precisavam saber:
          </p>

          <div className="mt-2">
            ✔ quanto possuíam<br />
            ✔ quanto deviam<br />
            ✔ se estavam tendo lucro ou prejuízo
          </div>

          <p className="mt-2">
            Sem controle, os negócios quebravam ou ficavam desorganizados.
          </p>
        </div>

        {/* HISTÓRIA */}
        <div>
          <h2 className="font-semibold text-lg mb-2">🏛️ Como surgiu?</h2>
          <p>
            Registros contábeis já existiam há milhares de anos, mas eram simples anotações.
          </p>

          <p className="mt-2">
            O grande avanço aconteceu na Itália, durante o crescimento do comércio.
          </p>
        </div>

        {/* PACIOLI */}
        <div>
          <h2 className="font-semibold text-lg mb-2">👨‍🏫 Luca Pacioli</h2>
          <p>
            Em 1494, o matemático Luca Pacioli organizou e documentou o método da contabilidade por partida dobrada.
          </p>

          <div className="bg-gray-50 p-3 rounded mt-2">
            Esse método é usado até hoje no mundo inteiro.
          </div>
        </div>

        {/* PARTIDA DOBRADA */}
        <div>
          <h2 className="font-semibold text-lg mb-2">⚖️ O que é partida dobrada?</h2>
          <p>
            Toda movimentação tem dois lados:
          </p>

          <div className="mt-2">
            ✔ origem do dinheiro<br />
            ✔ destino do dinheiro
          </div>

          <p className="mt-2">
            Isso garante que tudo esteja sempre equilibrado.
          </p>
        </div>

        {/* OBJETIVO */}
        <div>
          <h2 className="font-semibold text-lg mb-2">🎯 Qual o objetivo da contabilidade?</h2>

          <div className="space-y-1">
            <div>✔ controlar o patrimônio</div>
            <div>✔ medir lucro ou prejuízo</div>
            <div>✔ ajudar na tomada de decisão</div>
            <div>✔ atender exigências legais</div>
          </div>
        </div>

        {/* HOJE */}
        <div className="bg-green-50 border border-green-200 text-green-900 p-4 rounded">
          Hoje, a contabilidade continua sendo essencial, mas sistemas modernos automatizam grande parte desse trabalho.
        </div>

      </div>
    </div>
  );
}