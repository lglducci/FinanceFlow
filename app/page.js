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
      const resp = await fetch(
        "https://webhook.lglducci.com.br/webhook/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await resp.json();

      if (data?.id_empresa) {
        const empresaData = {
          id_empresa: data.id_empresa,
          nome_empresa: data.nome_empresa,
          saudacao: data.saudacao,
        };

        // Guarda no localStorage (igual AdminDelivery)
        if (typeof window !== "undefined") {
          localStorage.setItem("empresa", JSON.stringify(empresaData));
          localStorage.setItem("user_id", data.user_id ?? "");
          localStorage.setItem("email", data.email ?? "");
          localStorage.setItem(
            "tipo_admin",
            (data?.tipo_admin ?? "admin").toString().toLowerCase().trim()
          );
        }

        // Se quiser no futuro: tipo cozinha / dashboard
        const tipo = (data?.tipo_admin ?? "admin")
          .toString()
          .toLowerCase()
          .trim();

        if (tipo === "cozinha") {
          router.push("/Dashboard"); // por enquanto manda pro Dashboard mesmo
        } else {
          router.push("/Dashboard");
        }
      } else {
        alert("Usuário inválido ou empresa não encontrada.");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #153b54 55%, #091219 85%)",
      }}
    >
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
        <h1 className="text-3xl font-bold text-white mb-2 text-center drop-shadow">
          FinanceFlow
        </h1>
        <p className="text-sm text-gray-100/90 mb-8 text-center">
          Organize seu dinheiro. Tudo em um só lugar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-100 mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-100 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-blue-300 to-blue-500 text-gray-900 font-semibold py-2.5 rounded-lg shadow-md hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-xs text-gray-200/80 mt-4 text-center">
          Esqueceu sua senha? Fale com o administrador.
        </p>
      </div>
    </div>
  );
}
