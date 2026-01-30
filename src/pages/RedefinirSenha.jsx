 import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

import { useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";


export default function RedefinirSenha() {
  const navigate = useNavigate();

  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [searchParams] = useSearchParams();
  // const token = searchParams.get("token");


  async function salvarNovaSenha(e) {
    e.preventDefault();
    setErro("");
    setMsg("");

    if (!senha || !confirmar) {
      setErro("Preencha os dois campos.");
      return;
    }

    if (senha !== confirmar) {
      setErro("As senhas não conferem.");
      return;
    }

    try {
      setLoading(true);
      


     {/*} await fetch(buildWebhookUrl("redefinir_senha"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha, token :token }),
      });*/}

      const { error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            setErro("Sessão de redefinição inválida ou expirada.");
            setLoading(false);
            return;
          }

      const { error } = await supabase.auth.updateUser({
              password: senha
            });

            if (error) {
              setErro("Erro ao redefinir senha.");
              setLoading(false);
              return;
            }

     
      setMsg("Senha alterada com sucesso. Redirecionando...");

        // espera um pouco antes de ir para o login
        setTimeout(() => {
        navigate("/login", { replace: true });
        }, 1500);


    } catch (e) {
      setErro("Erro ao redefinir senha.");
    } finally {
      setLoading(false);
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
          Redefinir Senha
        </h1>

        <form onSubmit={salvarNovaSenha} className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Nova senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff] pr-10"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
              >
                {mostrarSenha ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">Confirmar senha</label>
            <div className="relative">
              <input
                type={mostrarConfirmar ? "text" : "password"}
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff] pr-10"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
              >
                {mostrarConfirmar ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {erro && <p className="text-red-600 text-sm text-center">{erro}</p>}
          {msg && (
  <p className="text-green-600 text-sm text-center animate-pulse">
    {msg}
  </p>
)}


          <button
            type="submit"
            disabled={loading}
              className="w-full bg-[#445777] text-white py-2 rounded-lg"
          >
            {loading ? "Salvando..." : "Redefinir senha"}
          </button>
        </form>
      </div>
    </div>
     </div>
  );
}
