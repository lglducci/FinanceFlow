 import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* LADO ESQUERDO – MARCA */}
      <div className="hidden md:flex bg-[#0F172A] text-white items-center justify-center p-12">
        <div className="flex flex-col items-center max-w-xl text-center">
          <img
            src="/img/logo.png"
            alt="Logo Contábil Flow"
            className="w-full max-w-md mb-10"
          />

          <h1 className="text-4xl font-bold mb-6">
            Controle Contábil simples, seguro e profissional
          </h1>

          <p className="text-xl opacity-90">
            Tudo o que sua empresa precisa para organizar a contabilidade,
            acompanhar resultados e crescer com segurança.
          </p>
        </div>
      </div>

      {/* LADO DIREITO – AÇÃO */}
      <div className="flex items-center justify-center bg-[#C1C7D2] px-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">

          <img
            src="/img/logo.png"
            alt="Logo Contábil Flow"
            className="w-40 mx-auto mb-6"
          />

          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Contábil Flow
          </h2>

          <p className="text-gray-600 mb-8">
            Experimente gratuitamente por <strong>7 dias</strong>.  
            Sem cartão de crédito.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate("/cadastro")}
              className="w-full bg-[#445777] text-white py-3 rounded-lg text-lg font-semibold hover:opacity-90"
            >
              Criar conta grátis
            </button>

            <button
              onClick={() => navigate("/planos")}
              className="w-full border border-[#445777] text-[#445777] py-3 rounded-lg text-lg font-semibold hover:bg-[#445777] hover:text-white"
            >
              Conhecer planos
            </button>

            <button
              onClick={() => navigate("/login")}
              className="w-full text-gray-600 py-2 hover:underline"
            >
              Já tenho conta
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
