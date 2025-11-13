export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      
      {/* Lado azul (desktop) */}
      <div className="hidden md:flex items-center justify-center bg-[var(--cor-primaria)] text-white">
        <div className="text-center px-10">
          <h1 className="text-4xl font-bold">FinanceFlow</h1>
          <p className="mt-4 text-lg opacity-90">
            Organize seu dinheiro. Veja tudo em um único lugar.
          </p>
        </div>
      </div>

      {/* Card de Login */}
      <div className="flex items-center justify-center p-8 bg-[var(--cor-bg)]">
        <div className="w-full max-w-sm bg-white shadow-lg rounded-xl p-6 border border-gray-200">

          <h2 className="text-2xl font-bold text-[var(--cor-texto)] mb-6">
            Entrar no FinanceFlow
          </h2>

          <input
            type="email"
            placeholder="E-mail"
            className="w-full mb-3 p-3 border rounded-lg"
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full mb-3 p-3 border rounded-lg"
          />

          <button
            className="w-full py-3 bg-[var(--cor-primaria)] hover:bg-[var(--cor-primaria-light)] text-white font-bold rounded-lg"
          >
            Entrar
          </button>

          <p className="text-sm text-center mt-4 text-[var(--cor-subtexto)]">
            Esqueceu sua senha?
          </p>
        </div>
      </div>
    </div>
  );
}
