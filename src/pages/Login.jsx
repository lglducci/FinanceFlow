 import { useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

 
 


export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    try {
      const url = buildWebhookUrl("login");

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await resp.json();

      if (!resp.ok || data.erro) {
        setErro(data.erro || "Login inválido.");
        return;
      }

      // 🔑 VERIFICA SE O BACKEND EXIGE TROCA DE SENHA
      const precisaTrocarSenha =
        data.trocar_senha === true ||
        data.redefinir_senha === true ||
        data.alterar_senha === true ||
        data.force_reset_password === true;

      if (precisaTrocarSenha) {
        // NÃO grava token
        localStorage.removeItem("ff_token");

        // vai para redefinir senha
        navigate("/redefinir-senha", { replace: true });
        return;
      }

      // ✅ LOGIN NORMAL
      localStorage.setItem("ff_token", data.token || "dummy");
      localStorage.setItem("id_usuario", data.usuario_id);
      localStorage.setItem("id_empresa", data.empresa_id);
       localStorage.setItem("empresa_id", data.empresa_id);
      

      onLogin();
    } catch (err) {
      setErro("Erro ao conectar ao servidor.");
      console.log("LOGIN ERROR:", err);
    }
  }

  async function handleEsqueciSenha() {
    if (!email) {
      alert("Informe seu e-mail para recuperar a senha.");
      return;
    }

    try {
      const resp = await fetch(buildWebhookUrl("esqueci_senha"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      await resp.json();

      alert(
        "Se este e-mail estiver cadastrado, você receberá instruções para redefinir sua senha."
      );
    } catch (e) {
      alert("Erro ao solicitar recuperação de senha.");
    }
  }
 return (
  <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

    {/* LADO ESQUERDO – FUNDO / MARCA */}
    <div className="hidden md:flex bg-[#061f4aff] text-white items-center justify-center p-12">
      <div className="max-w-md">
        <h1 className="text-5xl font-bold mb-4">Finance-Flow</h1>
        <p className="text-lg opacity-90">
          Controle financeiro simples, seguro e profissional.
        </p>
      </div>
    </div>

    {/* LADO DIREITO – FORMULÁRIO */}
    <div className="flex items-center justify-center bg-[#C1C7D2] px-6">
      <div className="w-full max-w-md bg-[#838FA5] rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 text-bg[#445777]">
          Finance-Flow
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm font-semibold">E-mail</label>
            <input
              type="email"
              className="w-full mt-1 px-3 py-2 rounded-lg border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                className="w-full mt-1 px-3 py-2 rounded-lg border pr-10"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {mostrarSenha ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {erro && (
            <div className="text-red-600 text-sm text-center">
              {erro}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#445777] text-white py-2 rounded-lg"
          >
            Entrar
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              className="text-base font-semibold  text-bg[#445777] hover:underline"
              onClick={handleEsqueciSenha}
            >
              Esqueci minha senha
            </button>
          </div>

        </form>
      </div>
    </div>

  </div>
);

}
