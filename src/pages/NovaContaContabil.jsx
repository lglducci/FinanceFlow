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
  conta_pai: contexto?.conta_pai_codigo ?? "",
  classificacao: "",
  criar_regra:false,
  texto_regra:"",
  tipo_movimento:""
});
 const classeConta = Number(String(form.codigo || "").trim().split(".")[0]);


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
      conta_pai_id: contaPaiId ?? null,
      classificacao: form.classificacao || "",
      criar_regra:false,
     texto_regra:"",
     tipo_movimento:""
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
  <div className="min-h-screen bg-[#f3f7fb] px-4 py-6">
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
      
      <div className=" bg-gradient-to-r from-[#f8fafc] to-[#e2e8f0] px-6 py-5">
        <h1 className="text-2xl font-black text-black">
          📘 Nova Conta Contábil
        </h1>
        <p className="mt-1 text-sm font-semibold text-blue-700">
          Cadastre uma nova conta no plano contábil
        </p>
      </div>

      <div className="p-6 space-y-5">
        
        <div>
          <label className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-700">
            Código
            <span className="relative group cursor-pointer">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-xs text-white">
                ?
              </span>

              <div className="absolute left-6 top-0 z-50 hidden w-80 rounded-xl bg-slate-900 p-3 text-xs text-white shadow-xl group-hover:block">
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
                  O tipo e a natureza são definidos automaticamente.
                </p>
              </div>
            </span>
          </label>

          <input
            value={form.codigo}
            onChange={(e) => {
              const codigo = e.target.value;
              const regra = tipoContaPorCodigo(codigo);

              setForm((f) => ({
                ...f,
                codigo,
                tipo: regra?.tipo || f.tipo,
                natureza: regra?.natureza || f.natureza,
              }));
            }}
            onBlur={() => {
              const codigo = (form.codigo || "").trim();

              if (!codigo) return;

              if (!codigoValido(codigo)) {
                alert("Código inválido. Use apenas números e pontos (ex: 6.1.1.11).");
                return;
              }

              setForm((f) => ({
                ...f,
                nivel: calcularNivel(codigo),
                pai_codigo: calcularPaiCodigo(codigo),
              }));
            }}
            placeholder="Ex: 6.1.1.01"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-800 outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">Nome</label>
          <input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Nome da conta"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-800 outline-none focus:border-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-bold text-slate-700">Tipo</label>
            <select
              value={form.tipo}
              disabled
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 font-bold text-slate-500"
            >
              <option value="">Selecione...</option>
              <option value="ATIVO">ATIVO</option>
              <option value="PASSIVO">PASSIVO</option>
              <option value="RECEITA">RECEITA</option>
              <option value="DESPESA">DESPESA</option>
              <option value="PL">PATRIMÔNIO LÍQUIDO</option>
              <option value="CUSTO">CUSTO</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">Natureza</label>
            <select
              value={form.natureza}
              disabled
              onChange={(e) => setForm({ ...form, natureza: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 font-bold text-slate-500"
            >
              <option value="">Selecione...</option>
              <option value="D">D – Devedora</option>
              <option value="C">C – Credora</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">Nível</label>
            <input
              type="number"
              value={form.nivel}
              disabled
              onChange={(e) => setForm({ ...form, nivel: e.target.value })}
              placeholder="3"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 font-bold text-slate-500"
            />
          </div>
        </div>

        {[4, 5, 6].includes(classeConta) && (
          <div>
            <label className="text-sm font-bold text-slate-700">
              Classificação Gerencial
            </label>

            <select
              value={form.classificacao || ""}
              onChange={(e) => setForm({ ...form, classificacao: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-800 outline-none focus:border-blue-600"
            >
              <option value="">Selecione...</option>

              {classeConta === 4 && (
                <option value="receita">Receita</option>
              )}

              {classeConta === 5 && (
                <>
                  <option value="custo_variavel">Custo Variável</option>
                  <option value="custo_fixo">Custo Fixo</option>
                </>
              )}

              {classeConta === 6 && (
                <>
                  <option value="despesa_variavel">Despesa Variável</option>
                  <option value="despesa_fixa">Despesa Fixa</option>
                  <option value="nao_operacional">Não Operacional</option>
                </>
              )}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-5 border-t border-slate-200">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl bg-slate-200 px-6 py-3 font-black text-slate-700 hover:bg-slate-300"
          >
            Cancelar
          </button>

          <button
            onClick={salvar}
            className="rounded-xl bg-blue-700 px-7 py-3 font-black text-white shadow hover:bg-blue-800"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  </div>
);

 
}
