 import { useState } from "react";
import { buildWebhookUrl } from "../../config/globals";
 
 export default function FormContaContabilModal({
  contas = [],
  empresa_id,
  nomeInicial = "",
  historicoRegra = "",
  tipoMovimento = "",
  onSuccess,
  onCancel
}) {
  
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
  codigo: "",
  nome: nomeInicial || "",
  tipo: "",
  natureza: "",
  nivel: "",
  criar_regra: !!nomeInicial, 
  tipo_movimento: tipoMovimento || ""
});

const [buscandoParecida, setBuscandoParecida] = useState(false);
const [regraParecida, setRegraParecida] = useState(null);
const [usarRegraParecida, setUsarRegraParecida] = useState(false);

const [usarContaExistente, setUsarContaExistente] = useState(false);
const [contaSelecionada, setContaSelecionada] = useState(null);
const [textoContaSelecionada, setTextoContaSelecionada] = useState("");
const [contasEncontradas, setContasEncontradas] = useState([]);

  // ===============================
  // REGRAS AUTOMÁTICAS
  // ===============================

  function tipoContaPorCodigo(codigo) {
    if (!codigo) return null;

    const raiz = codigo.split(".")[0];

    const mapa = {
      "1": { tipo: "ATIVO", natureza: "D" },
      "2": { tipo: "PASSIVO", natureza: "C" },
      "3": { tipo: "PL", natureza: "C" },
      "4": { tipo: "RECEITA", natureza: "C" },
      "5": { tipo: "CUSTO", natureza: "D" },
      "6": { tipo: "DESPESA", natureza: "D" }
    };

    return mapa[raiz] || null;
  }

  function calcularNivel(codigo) {
    if (!codigo) return "";
    return codigo.split(".").filter(p => p.trim() !== "").length;
  }

  function codigoValido(codigo) {
    return /^[0-9]+(\.[0-9]+)*$/.test((codigo || "").trim());
  }

  function handleCodigo(e) {
    const codigo = e.target.value;
    const regra = tipoContaPorCodigo(codigo);

    setForm(prev => ({
      ...prev,
      codigo,
      tipo: regra?.tipo || "",
      natureza: regra?.natureza || "",
      nivel: calcularNivel(codigo)
    }));
  }

  function handleChange(e) {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }


  function handleCheck(e) {
  setForm(prev => ({
    ...prev,
    [e.target.name]: e.target.checked
  }));
}


  // ===============================
  // SALVAR
  // ===============================

 function extrairErroWebhook(data, resp) {
  const texto = JSON.stringify(data || {});

  if (texto.includes("regras_classificacao_unique")) {
    const match = texto.match(/Key \(empresa_id, texto_busca, tipo_movimento\)=\(([^,]+), ([^,]+), ([^)]+)\)/);

    const regra = match?.[2] || "este histórico";
    const tipo = match?.[3] || "este movimento";

    return `Já existe uma regra inteligente para "${regra}" no tipo "${tipo}". Use a regra existente ou altere o texto da regra.`;
  }

  if (texto.includes("contas_empresa_codigo_key")) {
    const match = texto.match(/Key \(empresa_id, codigo\)=\(([^,]+), ([^)]+)\)/);
    const codigo = match?.[2] || "informado";

    return `Já existe uma conta com o código ${codigo}. Use outro código ou selecione a conta existente.`;
  }

  if (texto.includes("violates foreign key constraint")) {
    return "Existe uma referência inválida. Verifique se a empresa, conta pai ou conta vinculada existem.";
  }

  if (texto.includes("violates not-null constraint")) {
    return "Faltou preencher um campo obrigatório.";
  }

  if (texto.includes("violates check constraint")) {
    return "Algum valor informado não é permitido. Confira tipo, natureza ou classificação.";
  }

  if (texto.includes("duplicate key")) {
    return "Registro duplicado. Verifique se esta conta ou regra já existe.";
  }

  const bruto = Array.isArray(data) ? data[0] : data;

  if (!resp.ok || bruto?.ok === false || bruto?.responseCode >= 400) {
    return bruto?.message || bruto?.error || "Erro ao salvar conta.";
  }

  return null;
}

function extrairContaCriada(data) {
  const bruto = Array.isArray(data) ? data[0] : data;

  return (
    bruto?.data?.ff_criar_conta_contabil ||
    bruto?.ff_criar_conta_contabil ||
    bruto?.data ||
    bruto
  );
}


async function buscarRegraParecida() {
  if (!nomeInicial) {
    alert("Não há histórico para buscar regra parecida.");
    return;
  }

  try {
    setBuscandoParecida(true);

    const resp = await fetch(buildWebhookUrl("buscar_regra_classificacao_parecida"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        texto: historicoRegra || nomeInicial,
        tipo_movimento: form.tipo_movimento || ""
      })
    });

    const data = await resp.json();
    const bruto = Array.isArray(data) ? data[0] : data;

    const item =
      bruto?.data?.resultado ||
      bruto?.resultado ||
      bruto?.data?.ff_buscar_regra_classificacao_parecida ||
      bruto?.ff_buscar_regra_classificacao_parecida ||
      bruto?.data ||
      bruto;


if (!item?.ok) {
  setRegraParecida(null);
  setUsarRegraParecida(false);
  setUsarContaExistente(true);
  return;
}
  
    setRegraParecida(item);
    setUsarRegraParecida(true);
  } catch (e) {
    console.error(e);
    alert("Erro ao buscar regra parecida.");
  } finally {
    setBuscandoParecida(false);
  }
}


function buscarContasExistentes(texto) {
  const t = String(texto || "").toLowerCase();

  const lista = contas
    .filter((c) =>
      String(c.nome || "").toLowerCase().includes(t) ||
      String(c.codigo || "").includes(t) ||
      String(c.apelido || "").toLowerCase().includes(t)
    )
    .slice(0, 10);

  setContasEncontradas(lista);
}


async function salvarRegraContaExistente() {
  if (!contaSelecionada?.id) {
    alert("Selecione uma conta existente.");
    return;
  }

  try {
    setLoading(true);

    const resp = await fetch(buildWebhookUrl("criar_regra_classificacao"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        texto_busca: historicoRegra || nomeInicial,
        tipo_movimento: form.tipo_movimento || "",
        conta_id: contaSelecionada.id,
      }),
    });

    const data = await resp.json();

    const erroTratado = extrairErroWebhook(data, resp);
    if (erroTratado) {
      alert("⚠️ " + erroTratado);
      return;
    }

    onSuccess?.({
      id: contaSelecionada.id,
      codigo: contaSelecionada.codigo,
      nome: contaSelecionada.nome,
      criar_regra: true,
      historico_regra: historicoRegra || nomeInicial,
      tipo_movimento: form.tipo_movimento || null,
    });
  } catch (e) {
    console.error(e);
    alert("Erro ao criar regra para conta existente.");
  } finally {
    setLoading(false);
  }
}
async function salvarRegraParecida() {
  if (!regraParecida?.conta_id) {
    alert("Nenhuma conta parecida selecionada.");
    return;
  }

  try {
    setLoading(true);

    const resp = await fetch(buildWebhookUrl("criar_regra_classificacao"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        texto_busca: historicoRegra || nomeInicial,
        tipo_movimento: form.tipo_movimento || "",
        conta_id: regraParecida.conta_id
      })
    });

    const data = await resp.json();
    const texto = JSON.stringify(data || {});

    if (texto.includes("regras_classificacao_unique")) {
      alert("Já existe uma regra para este histórico e tipo de movimento.");
      return;
    }

    onSuccess?.({
      id: regraParecida.conta_id,
      codigo: regraParecida.conta_codigo,
      nome: regraParecida.conta_nome,
      criar_regra: true,
      historico_regra: historicoRegra || nomeInicial,
      tipo_movimento: form.tipo_movimento || null
    });
  } catch (e) {
    console.error(e);
    alert("Erro ao criar regra parecida.");
  } finally {
    setLoading(false);
  }
}


 async function salvar() {

  if (usarContaExistente) {
  await salvarRegraContaExistente();
  return;
}

  if (usarRegraParecida && regraParecida?.conta_id) {
    await salvarRegraParecida();
    return;
  }

  if (!form.codigo.trim())
    return alert("Código obrigatório.");

    if (!codigoValido(form.codigo))
      return alert("Código inválido.");

    if (!form.nome.trim())
      return alert("Nome obrigatório.");

    try {
      setLoading(true);

      // Resolver conta pai
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

      let contaPaiId = null;

      try {
        const hierarquia = await rHierarquia.json();
        contaPaiId = Array.isArray(hierarquia)
          ? hierarquia[0]?.id
          : hierarquia?.id;
      } catch {
        // ignora se vier vazio
      }

      // Salvar conta (não depende de retorno)
      const url = buildWebhookUrl("novacontacontabil", {
        empresa_id,
        codigo: form.codigo,
        nome: form.nome,
        tipo: form.tipo,
        natureza: form.natureza,
        nivel: form.nivel,
        conta_pai_id: contaPaiId ?? null,
        criar_regra: form.criar_regra,
        texto_regra: historicoRegra || nomeInicial || form.nome,
        tipo_movimento: form.tipo_movimento || ""
      });

      const resp = await fetch(url, { method: "POST" });
 
     const data = await resp.json();

const erroTratado = extrairErroWebhook(data, resp);

if (erroTratado) {
  alert("⚠️ " + erroTratado);
  return;
}

const item = extrairContaCriada(data);

onSuccess?.({
  id: item?.id || item?.conta_id || item?.data?.id,
  codigo: form.codigo,
  nome: form.nome,
  tipo: form.tipo,
  natureza: form.natureza,
  nivel: form.nivel,
  conta_pai_id: contaPaiId ?? null,
  criar_regra: form.criar_regra,
  historico_regra: historicoRegra || nomeInicial || form.nome,
  tipo_movimento: form.tipo_movimento || null
});
  


    } catch (e) {
      console.error("ERRO SALVAR:", e);
      alert("Erro ao salvar a conta!");
    } finally {
      setLoading(false);
    }
  }

  // ===============================
  // UI
  // ===============================

  return (
    <div className="flex flex-col gap-4">

     
 

   {!usarContaExistente && (
  <>
    <label className="font-bold text-[#1e40af]">Código *</label>

      <input
        value={form.codigo}
        disabled={usarRegraParecida}
        onChange={handleCodigo}
        placeholder="1.1.1.01"
        className="input-premium"
      />

      <label className="font-bold text-[#1e40af]">Nome *</label>
      <input
        name="nome"
        value={form.nome}
        disabled={usarRegraParecida}
        onChange={handleChange}
        className="input-premium"
      />
     </>
)}

   {nomeInicial && (
  <label className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-800">
    <input
      type="checkbox"
      name="criar_regra"
      checked={form.criar_regra}
      onChange={handleCheck}
    />
    Criar regra inteligente para este histórico
  </label>
)}
{usarContaExistente && (
  <div className="border border-blue-300 bg-blue-50 rounded-xl p-3">
    <div className="font-black text-blue-800 text-sm mb-2">
      Associar a conta existente
    </div>

    <input
      className="input-premium"
      placeholder="Digite código ou nome da conta"
      value={textoContaSelecionada}
      onChange={(e) => {
        const v = e.target.value;
        setTextoContaSelecionada(v);
        setContaSelecionada(null);
        buscarContasExistentes(v);
      }}
    />

    {contasEncontradas.length > 0 && (
      <div className="mt-2 bg-white border rounded-lg max-h-48 overflow-y-auto">
        {contasEncontradas.map((c) => (
          <div
            key={c.id}
            className="p-2 cursor-pointer hover:bg-blue-100 text-sm font-bold"
            onClick={() => {
              setContaSelecionada(c);
              setTextoContaSelecionada(`${c.codigo} - ${c.nome}`);
              setContasEncontradas([]);
            }}
          >
            {c.codigo} - {c.nome}
          </div>
        ))}
      </div>
    )}

    {contaSelecionada && (
      <div className="mt-2 text-sm font-black text-green-700">
        Conta selecionada: {contaSelecionada.codigo} - {contaSelecionada.nome}
      </div>
    )}

    <button
      type="button"
      onClick={() => {
        setUsarContaExistente(false);
        setContaSelecionada(null);
        setTextoContaSelecionada("");
      }}
      className="mt-3 text-xs font-bold text-red-600"
    >
      Criar nova conta em vez disso
    </button>
  </div>
)}
 

{nomeInicial && !usarContaExistente && (
  <button
    type="button"
    onClick={() => setUsarContaExistente(true)}
    className="text-sm font-black text-blue-700 hover:text-blue-900"
  >
    🔗 Associar este histórico a uma conta existente
  </button>
)}

      <div className="flex gap-4 pt-4">
        <button
          onClick={salvar}
          disabled={loading}
          className="flex-1 bg-[#061f4a] text-white px-4 py-2 rounded-lg"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>

        <button
          onClick={onCancel}
          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg"
        >
          Cancelar
        </button>
      </div>

    </div>
  );
}
