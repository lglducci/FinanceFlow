import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

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
 try {
  const resp = await fetch(url, { method: "POST" });

  const text = await resp.text(); // 🔥 pega qualquer resposta
  console.log("RAW RESPONSE:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    alert("Erro bruto do servidor:\n" + text);
    return;
  }

  const item = Array.isArray(data) ? data[0] : data;

  const msg = item.message || "";
const details = item.details || "";

// 🔥 erro específico de duplicidade
if (msg.includes("duplicate key") || details.includes("already exists")) {
  alert("⚠️ Esta conta já existe.");
  return;
}

// outros erros
if (!item.ok) {
  alert(`Erro: ${msg}`);
  return;
}

  if (!item.ok) {
    alert(`Erro: ${item.message}\n${item.details || ""}`);
    return;
  }

  alert("Conta cadastrada com sucesso!");

} catch (e) {
  console.log("ERRO FETCH:", e);
  alert("Erro real:\n" + e.message);
}

  } catch (e) {
    console.log("ERRO SALVAR:", e);
    alert("Erro ao salvar a conta!");
  }
}

 function tipoContaPorCodigo(codigo) {
  if (!codigo) return null;

  const raiz = codigo.split(".")[0];

  const mapa = {
    "1": { tipo: "ATIVO",    natureza: "D" },
    "2": { tipo: "PASSIVO",  natureza: "C" },
    "3": { tipo: "PL",       natureza: "C" },
    "4": { tipo: "RECEITA",  natureza: "C" },
    "5": { tipo: "CUSTO",    natureza: "D" },
    "6": { tipo: "DESPESA",  natureza: "D" }
  };

  return mapa[raiz] || null;
}



useEffect(() => {
  console.log("FORM ATUAL:", form);
}, [form]);


function calcularNivel(codigo) {
  if (!codigo) return null;

  return codigo
    .split(".")
    .filter(p => p.trim() !== "")
    .length;
}

function codigoValido(codigo) {
  return /^[0-9]+(\.[0-9]+)*$/.test((codigo || "").trim());
}

function calcularPaiCodigo(codigo) {
  if (!codigo) return "";
  return codigo.replace(/\.[^.]+$/, ""); // 6.1.1.11 -> 6.1.1
}


  return (
     <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#061f4aff] text-white mt-1 mb-1" >

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
        <label className="label label-required font-bold text-[#1e40af] flex items-center gap-2">
              Código

              <span className="relative group cursor-pointer">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#445777] text-white text-xs">
                  ?
                </span>

                {/* Tooltip */}
                <div
                  className="
                    absolute left-6 top-0 z-50 hidden group-hover:block
                    bg-gray-900 text-white text-xs rounded-lg p-3 w-80 shadow-lg
                  "
                >
                  <strong>Regra do código contábil</strong>
                  <p className="mt-1">O primeiro número define o tipo da conta:</p>

                  <ul className="mt-2 space-y-1">
                    <li>1 – Ativo (D)</li>
                    <li>2 – Passivo (C)</li>
                    <li>3 – Patrimônio Líquido (C)</li>
                    <li>4 – Receita (C)</li>
                    <li>5 – Custo (D)</li>
                    <li>6 – Despesa (D)</li>
                  </ul>

                  <p className="mt-2 text-yellow-300">
                    ⚠ O tipo e a natureza são definidos automaticamente e não podem ser alterados.
                  </p>
                </div>
              </span>
            </label>

        {/* Código */}
      
        <input
              value={form.codigo}
              className="input-premium"
              onChange={(e) => {
                const codigo = e.target.value;
                const regra = tipoContaPorCodigo(codigo);

                setForm(f => ({
                  ...f,
                  codigo,
                  tipo: regra?.tipo || f.tipo,
                  natureza: regra?.natureza || f.natureza,
                }));
              }}
              onBlur={() => {
                const codigo = (form.codigo || "").trim();

                if (!codigo) return;

                // opcional: valida formato (só números e pontos)
                if (!codigoValido(codigo)) {
                  alert("Código inválido. Use apenas números e pontos (ex: 6.1.1.11).");
                  return;
                }

                setForm(f => ({
                  ...f,
                  nivel: calcularNivel(codigo),
                  // opcional: se você guarda pai por código na UI
                  pai_codigo: calcularPaiCodigo(codigo),
                }));
              }}
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
           disabled
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
          <option value="CUSTO">CUSTO</option>

        </select>

        {/* Natureza */}
        <label className="label label-required font-bold text-[#1e40af]">Natureza</label>
        <select
          value={form.natureza}
           className="input-premium"
             disabled
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
          disabled
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
            className="flex-1  bg-[#061f4aff] text-white px-4 py-3 rounded font-semibold"
        >
          Salvar
        </button>

          <button
            onClick={() => navigate( -1)}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Cancelar
          </button>
     </div>
      </div>
    </div>
  );
}
