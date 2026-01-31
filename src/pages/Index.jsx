 import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col">

      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-6">
        <div
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          Contábil Flow
        </div>

        <div className="flex gap-6 items-center">
          <button
            onClick={() => navigate("/planos")}
            className="text-sm font-semibold hover:underline"
          >
            Planos
          </button>

          <button
            onClick={() => navigate("/login")}
            className="text-sm font-semibold hover:underline"
          >
            Entrar
          </button>
        </div>
      </header>

      {/* HERO */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl text-center">

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Controle contábil simples, <br />
            profissional e confiável
          </h1>

          <p className="text-lg text-gray-300 mb-10">
            Gerencie lançamentos, empresas e relatórios contábeis
            com segurança e padrão profissional.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/cadastro")}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-3 rounded-lg font-semibold"
            >
              Começar teste grátis por 7 dias
            </button>

            <button
              onClick={() => navigate("/planos")}
              className="border border-gray-400 px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#0F172A]"
            >
              Ver planos
            </button>

            <button
              onClick={() => navigate("/login")}
              className="border border-gray-400 px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#0F172A]"
            >
              Já tenho conta
            </button>
          </div>

          {/* NOTA */}
          <p className="text-sm text-gray-400 mt-6">
            Teste grátis • Sem cartão • Cancelamento a qualquer momento
          </p>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center text-gray-400 text-sm py-4">
        © {new Date().getFullYear()} Contábil Flow — Todos os direitos reservados
      </footer>

    </div>
  );
}
