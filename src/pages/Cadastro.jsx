import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";


export default function Cadastro() {
  const navigate = useNavigate();


const [nome, setNome] = useState("");
const [cpf, setCpf] = useState("");
const [email, setEmail] = useState("");
const [senha, setSenha] = useState("");
const [telefone, setTelefone] = useState("");
const [erro, setErro] = useState("");
const [mensagem, setMensagem] = useState("");

 

  async function cadastrar(e) {
  e.preventDefault();
  setErro("");

  if (!nome ||  !email || !senha || !telefone) {
    setErro("Preencha todos os campos.");
    return;
  }

  // 1️⃣ cria usuário
  let { data, error } = await supabase.auth.signUp({
    email,
    password: senha
  });
 
  // 2️⃣ se já existir → login
  if (error && error.message?.includes("already")) {
    const login = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (login.error) {
      setErro("Usuário já existe e a senha está incorreta.");
      return;
    }

    data = login.data;
  } else if (error) {
    setErro(error.message);
    return;
  }

  const userId = data.user.id;

 {/* // 3️⃣ grava no SaaS
  const { error: err } = await supabase
    .schema("saas_vendas")
    .from("usuarios")
    .upsert({
      auth_user_id: userId,
      nome,
      email,
      cpf,
      telefone,
      status: "trial",
      plano: "trial",
      ativo: true,
      trial_inicio: new Date().toISOString(),
      trial_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

  if (err) {
    setErro(err.message);
    return;
  }


  // 4️⃣ inicializa o sistema (public / contábil)
const { data: empresaId, error: erroBootstrap } =
  await supabase.rpc("proc_bootstrap_usuario", {
    p_auth_user_id: userId,
    p_nome_usuario: nome,
    p_email: email
  });

if (erroBootstrap) {
  setErro("Erro ao inicializar o sistema: " + erroBootstrap.message);
  return;
}*/}

   alert("Cadastro realizado com sucesso");
  navigate("/login");
}


function maskTelefone(value) {
  let v = value.replace(/\D/g, "");

  // força +55
  if (!v.startsWith("55")) {
    v = "55" + v;
  }

  // limita tamanho (55 + DDD + 9 dígitos)
  v = v.substring(0, 13);

  v = v.replace(/^(\d{2})(\d)/, "+$1 $2");                 // +55
  v = v.replace(/^(\+\d{2})\s(\d{2})(\d)/, "$1 ($2) $3");  // (DD)
  v = v.replace(/(\d{5})(\d{4})$/, "$1-$2");               // 99999-9999

  return v;
}




  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <form
        onSubmit={cadastrar}
        
        className="bg-white p-8 rounded-xl w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Criar conta</h1>

           <h1 className="text-2xl font-bold text-center">
    Começar teste grátis (7 dias)
  </h1>

                <input
                    placeholder="Seu nome"
                    className="w-full border p-2 rounded"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />

              {/*}  <input
                    placeholder="Seu CPF"
                    className="w-full border p-2 rounded"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                />*/}

                <input
                    placeholder="Seu e-mail"
                    className="w-full border p-2 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Crie uma senha"
                    className="w-full border p-2 rounded"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                />

              <input
                    placeholder="Seu telefone"
                    className="w-full border p-2 rounded"
                    value={telefone}
                    onChange={(e) => setTelefone(maskTelefone(e.target.value))}
                  />


                {erro && <p className="text-red-600 text-sm text-center">{erro}</p>}
                        
                <button className="w-full bg-blue-700 text-white py-2 rounded">
                    Começar agora
                </button>
      </form>
    </div>
  );
}
