 import { useState } from "react";
import { buildWebhookUrl } from "../../config/globals";

export default function FormContaContabilModal({
  empresa_id,
  onSuccess,
  onCancel
}) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    tipo: "",
    natureza: "",
    nivel: ""
  });

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

  // ===============================
  // SALVAR
  // ===============================

  async function salvar() {
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
        conta_pai_id: contaPaiId ?? null
      });

      const resp = await fetch(url, { method: "POST" });

      if (!resp.ok) {
        throw new Error("Erro HTTP");
      }

      // Fecha modal sem depender de JSON
      onSuccess?.({
        codigo: form.codigo,
        nome: form.nome,
        tipo: form.tipo,
        natureza: form.natureza,
        nivel: form.nivel,
        conta_pai_id: contaPaiId ?? null
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

     

      <label className="font-bold text-[#1e40af]">Código *</label>
      <input
        value={form.codigo}
        onChange={handleCodigo}
        placeholder="1.1.1.01"
        className="input-premium"
      />

      <label className="font-bold text-[#1e40af]">Nome *</label>
      <input
        name="nome"
        value={form.nome}
        onChange={handleChange}
        className="input-premium"
      />


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
