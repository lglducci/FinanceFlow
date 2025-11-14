 "use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const resp = await fetch("https://webhook.lglducci.com.br/webhook/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json();

      if (data?.id_empresa) {
        // salva local
        localStorage.setItem("empresa", JSON.stringify(data));
        localStorage.setItem("user_id", data.user_id ?? "");

        router.push("/dashboard");
      } else {
        alert("Usuário ou senha inválidos.");
      }
    } catch (err) {
      alert("Erro de conexão.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F334D]">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-8">
        
        <h1 className="text-3xl font-bold text-center text-[#0F334D] mb-6">
          FinanceFlow
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Organize seu dinheiro. Tudo em um só lugar.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0F334D]"
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0F334D]"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#0F334D] text-white font-semibold py-3 rounded-lg hover:bg-[#13405F] transition"
          >
            Entrar
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-500">Esqueceu sua senha?</p>
      </div>
    </div>
  );
}
