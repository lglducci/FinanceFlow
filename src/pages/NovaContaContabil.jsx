import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { useLocation } from "react-router-dom";

export default function NovaContaContabil() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa") ;
  const location = useLocation();
  const contexto = location.state;

 const [tipo, setTipo] = useState(contexto?.tipo ?? "");
const [natureza, setNatureza] = useState(contexto?.natureza ?? "");
const [nivel, setNivel] = useState(contexto?.nivel ?? "");
const [contaPai, setContaPai] = useState(contexto?.conta_pai_codigo ?? "");
const [nome, setNome] = useState(""); // 👈 sempre vazio


  {/*const [form, setForm] = useState({
    codigo: "",
    nome: "",
    tipo: "",
    natureza: "",
    nivel: "",
  });*/}

  const [form, setForm] = useState({
  codigo: "",
  nome: "",

  // 👇 ESTES VÊM DO CONTEXTO (SE EXISTIR)
  tipo: contexto?.tipo ?? "",
  natureza: contexto?.natureza ?? "",
  nivel: contexto?.nivel ?? "",
  conta_pai: contexto?.conta_pai_codigo ?? ""
});


async function salvar() {
  try {
    // 1️⃣ Resolver hierarquia (descobrir conta pai)
    const rHierarquia = await fetch(
      buildWebhookUrl("resolver_hierarquia_conta"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          codigo: form.codigo
        })
      }
    );

    const hierarquia = await rHierarquia.json();

    const contaPaiId = Array.isArray(hierarquia)
  ? hierarquia[0]?.id
  : hierarquia?.id;

    if (hierarquia.erro) {
      alert(hierarquia.erro);
      return;
    }

    // 2️⃣ Salvar conta já com conta_pai_id resolvido
    const url = buildWebhookUrl("novacontacontabil", {
      empresa_id,
      codigo: form.codigo,
      nome: form.nome,
      tipo: form.tipo,
      natureza: form.natureza,
      nivel: form.nivel,
      conta_pai_id: contaPaiId ?? null
    });

    await fetch(url, { method: "POST" });

    alert("Conta cadastrada com sucesso!");
    navigate(-1);

  } catch (e) {
    console.log("ERRO SALVAR:", e);
    alert("Erro ao salvar a conta!");
  }
}

 



  return (
     <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#1e40af] text-white mt-1 mb-1" >

        <h2
          className="text-2xl md:text-2xl font-bold p-2 mb-3 text-center">
        📘 Nova Conta Contábil
      </h2>

      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
          color: "black",
        }}
      >
        {/* Código */}
        <label className="label label-required font-bold text-[#1e40af]">Código</label>
        <input
          value={form.codigo}
           className="input-premium"
          onChange={(e) => setForm({ ...form, codigo: e.target.value })}
          placeholder="1.1.1.01"
          style={{
            width: "100%",
            padding: 8,
            marginBottom: 12,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        />

        {/* Nome */}
        <label className="label label-required font-bold text-[#1e40af]">Nome</label>
        <input
          value={form.nome}
           className="input-premium"
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          placeholder="Nome da conta"
          style={{
            width: "100%",
            padding: 8,
            marginBottom: 12,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        />
  

  
        {/* Tipo */}
        <label className="label label-required font-bold text-[#1e40af]" >Tipo</label>
        <select
          value={form.tipo}
           className="input-premium"
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          style={{
            width: "100%",
            padding: 8,
            marginBottom: 12,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          <option value="">Selecione...</option>
          <option value="ATIVO">ATIVO</option>
          <option value="PASSIVO">PASSIVO</option>
          <option value="RECEITA">RECEITA</option>
          <option value="DESPESA">DESPESA</option>
          <option value="PL">PATRIMÔNIO LÍQUIDO</option>
        </select>

        {/* Natureza */}
        <label className="label label-required font-bold text-[#1e40af]">Natureza</label>
        <select
          value={form.natureza}
           className="input-premium"
          onChange={(e) => setForm({ ...form, natureza: e.target.value })}
          style={{
            width: "100%",
            padding: 8,
            marginBottom: 12,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          <option value="">Selecione...</option>
          <option value="D">D – Devedora</option>
          <option value="C">C – Credora</option>
        </select>

        {/* Nível */}
        <label className="label label-required font-bold text-[#1e40af]">Nível</label>
        <input
          type="number"
          value={form.nivel}
           className="input-premium"
          onChange={(e) => setForm({ ...form, nivel: e.target.value })}
          placeholder="3"
          style={{
            width: "100%",
            padding: 8,
            marginBottom: 12,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        />

        {/* BOTÕES */}
           {/* BOTÕES */}
             <div className="flex gap-6 pt-8 pb-8 pl-1">

              
        <button
          onClick={salvar}
            className="flex-1  bg-blue-600 text-white px-4 py-3 rounded font-semibold"
        >
          Salvar
        </button>

          <button
            onClick={() => navigate( -1)}
            className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Cancelar
          </button>
     </div>
      </div>
    </div>
  );
}
