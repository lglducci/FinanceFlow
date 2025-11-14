 "use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const fazerLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://webhook.lglducci.com.br/webhook/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: senha }),
        }
      );

      const data = await response.json();

      if (data?.id_empresa) {
        localStorage.setItem("empresa", JSON.stringify(data));
        window.location.href = "/Dashboard";
      } else {
        alert("E-mail ou senha incorretos.");
      }
    } catch (error) {
      alert("Erro ao conectar ao servidor.");
      console.error(error);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #153b54 55%, #091219 85%)",
      }}
    >
      <form
        onSubmit={fazerLogin}
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-80 border border-white/20"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white drop-shadow">
          FinanceFlow
        </h2>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-white/80 text-gray-800"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-5 p-3 rounded bg-white/80 text-gray-800"
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold py-2 rounded-lg shadow-md hover:opacity-90 transition"
        >
          Entrar
        </button>

        <p className="text-center text-white mt-4 text-sm opacity-80">
          Esqueceu a senha? Contate o administrador.
        </p>
      </form>
    </div>
  );
}
