"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resp = await fetch("https://webhook.lglducci.com.br/webhook/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json();

      if (data?.id_empresa) {
        localStorage.setItem("empresa", JSON.stringify({
          id_empresa: data.id_empresa,
          nome_empresa: data.nome_empresa,
          saudacao: data.saudacao,
        }));

        localStorage.setItem("user_id", data.user_id ?? "");
        localStorage.setItem("email", data.email ?? "");
        localStorage.setItem("tipo_admin", (data.tipo_admin ?? "admin").toLowerCase());

        router.push("/Dashboard");
      } else {
        alert("Usuário inválido.");
      }
    } catch (err) {
      alert("Erro ao conectar com o servidor.");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #153b54 55%, #091219 85%)",
      }}
    >
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
        
        {/* LOGO */}
        <h1 className="text-4xl font-bold text-white mb-2 text-center">
          FinanceFlow
        </h1>
        <p className="text-sm text-gray-200 mb-8 text-center">
          Controle financeiro simples, moderno e inteligente.
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/90 text-gray-900 placeholder-gray-600 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <input
            type="password"
            placeholder="Senha"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/90 text-gray-900 placeholder-gray-600 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <button
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-400 hover:bg-blue-300 font-semibold text-gray-900 transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-xs text-gray-200/70 mt-4 text-center">
          Esqueceu sua senha? Contate o administrador.
        </p>

      </div>
    </div>
  );
}
