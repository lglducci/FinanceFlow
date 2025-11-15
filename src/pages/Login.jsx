import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    localStorage.setItem("ff_token", "dummy-token");
    onLogin();
  }

  return (
   <div className="min-h-screen flex items-center justify-center bg-[#3862b7] px-4"> 
  <div className="w-full max-w-sm bg-[#F0F8FF] rounded-2xl shadow-xl p-8">
    <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
      Finance-Flow
    </h1>
    <p className="text-center text-sm text-gray-500 mb-6">
      Controle de finanças pessoais
    </p>

    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold">E-mail</label>
        <input
          type="email"
          className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff]
            focus:outline-none focus:ring-2 focus:ring-primary"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold">Senha</label>
        <input
          type="password"
          className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff]
            focus:outline-none focus:ring-2 focus:ring-primary"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
      </div>

      {erro && (
        <div className="text-red-600 text-sm text-center">{erro}</div>
      )}

      <button
        type="submit"
        className="w-full bg-primary text-white py-2 rounded-lg font-semibold
          hover:bg-primaryDark transition"
      >
        Entrar
      </button>
    </form>
  </div>
</div>

  );
}
