 import { useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

 
 


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

         const { data, error } =
            await supabase.auth.signInWithPassword({
              email,
              password: senha
            });

          if (error) {
            setErro("E-mail ou senha inválidos.");
            return;
          }

          
      const url = buildWebhookUrl("login");

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const datalogin = await resp.json();

      if (!resp.ok || data.erro) {
        setErro(datalogin.erro || "Login inválido.");
        return;
      }

      // 🔑 VERIFICA SE O BACKEND EXIGE TROCA DE SENHA
      const precisaTrocarSenha =
        datalogin.trocar_senha === true ||
        datalogin.redefinir_senha === true ||
        datalogin.alterar_senha === true ||
        datalogin.force_reset_password === true;

      if (precisaTrocarSenha) {
        // NÃO grava token
        localStorage.removeItem("ff_token");

        // vai para redefinir senha
        navigate("/redefinir-senha", { replace: true });
        return;
      }

      // ✅ LOGIN NORMAL
      localStorage.setItem("ff_token", datalogin.token || "dummy");
      localStorage.setItem("id_usuario", datalogin.usuario_id);
      localStorage.setItem("id_empresa", datalogin.empresa_id);
       localStorage.setItem("empresa_id", datalogin.empresa_id);
      

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
    //  const resp = await fetch(buildWebhookUrl("esqueci_senha"), {
     //   method: "POST",
     //   headers: { "Content-Type": "application/json" },
     //   body: JSON.stringify({ email }),
    //  });

     // await resp.json();

     const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/redefinir-senha`
        });

        if (error) {
          alert("Erro ao enviar e-mail de recuperação.");
          return;
        }

alert("Enviamos um link de redefinição para seu e-mail.");


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
    <div className="hidden md:flex bg-[#0F172A] text-white items-center justify-center p-12">
   
    <div className="w-2/3 bg-[#0F172A] flex items-center justify-center h-screen">
  <div className="flex flex-col items-center justify-center w-full max-w-[800px] px-10">
   <img
  src="/public/img/logo.png"
  alt="Logo Contábil Flow"
  className="w-full max-w-[600px] mb-10"
/>

   
    <p className="text-2xl text-white text-center leading-relaxed">
      Controle Contábil simples, seguro <br /> e aa profissional.
    </p>
  </div>
</div>

    </div>

    {/* LADO DIREITO – FORMULÁRIO */}
    <div className="flex items-center justify-center bg-[#C1C7D2] px-6">
     <div className="w-full max-w-md bg-[#838FA5] rounded-2xl shadow-xl p-8">

  {/* ✅ LOGO */}
  <img
    src="/public/img/logo.png"
    alt="Logo Contábil Flow"
    className="w-40 mx-auto mb-4"
  />

  <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
    Contábil-Flow
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


