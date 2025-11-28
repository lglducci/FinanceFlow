import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function EditarReceber() {
  const navigate = useNavigate();
  const { id } = useParams();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

  const [loading, setLoading] = useState(true);
  const [salvando, setSavando] = useState(false);
  const [fornecedores, setFornecedores] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    vencimento: "",
    categoria_id: "",
    fornecedor_id: "",
    parcelas: 1,
    parcela_num: 1,
    status: "aberto",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  //------------------------------------------------------------------
  // CARREGAR FORNECEDORES
  //------------------------------------------------------------------
  async function carregarFornecedores() {
    try {
      const url = buildWebhookUrl("fornecedorcliente", {
        empresa_id,
        tipo: "fornecedor",
      });

      const resp = await fetch(url);
      const texto = await resp.text();
      let json = [];

      try {
        json = JSON.parse(texto);
      } catch {}

      setFornecedores(json);
    } catch (e) {
      console.log("ERRO carregando fornecedores:", e);
    }
  }

  //------------------------------------------------------------------
  // CARREGAR CATEGORIAS
  //------------------------------------------------------------------
  async function carregarCategorias() {
    try {
      const url = buildWebhookUrl("listacategorias", { empresa_id,tipo:'entrada'  });

      const resp = await fetch(url);
      const texto = await resp.text();
      let json = [];

      try {
        json = JSON.parse(texto);
      } catch {}

      setCategorias(json);
    } catch (e) {
      console.log("ERRO categorias:", e);
    }
  }

  //------------------------------------------------------------------
  // RETRIEVE DA CONTA
  //------------------------------------------------------------------
async function carregar() {
  try {
    const url = buildWebhookUrl("conta_receber", { empresa_id, id });

    const resp = await fetch(url);
    const texto = await resp.text();

    let json = {};
    try {
      json = JSON.parse(texto);
    } catch {}

    // 🔥 CORREÇÃO DEFINITIVA: webhook pode retornar ARRAY ou OBJETO
    const dado = Array.isArray(json) ? json[0] : json;

    if (!dado || !dado.id) {
      console.log("DEBUG JSON:", json);
      alert("Conta não encontrada.");
      navigate("/contas-receber");
      return;
    }

    setForm({
      descricao: dado.descricao,
      valor: dado.valor,
      
      vencimento: dado.vencimento ? dado.vencimento.substring(0, 10) : "",
      categoria_id: dado.categoria_id || "",
      fornecedor_id: dado.fornecedor_id || "",
      parcelas: dado.parcelas,
      parcela_num: dado.parcela_num,
      status: dado.status,
    });


    
  } catch (e) {
    console.log("ERRO retrieve:", e);
    alert("Erro ao carregar dados.");
  } finally {
    setLoading(false);
  }
}


  //------------------------------------------------------------------
  // SALVAR
  //------------------------------------------------------------------
  async function salvar() {
    try {
      setSavando(true);

      const url = buildWebhookUrl("salvarcontareceber");

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          id: Number(id),
          descricao: form.descricao,
          valor: Number(form.valor),
          vencimento: form.vencimento,
          categoria_id: Number(form.categoria_id) || null,
          fornecedor_id: Number(form.fornecedor_id) || null,
          status: form.status,
        }),
      });

      const texto = await resp.text();
      let json = {};

      try {
        json = JSON.parse(texto);
      } catch {}

      // === SUCESSO GLOBAL (padronizado) ===
      const sucesso =
        json?.id ||
        json?.success === true ||
        (Array.isArray(json) && json.length > 0);

      if (sucesso) {
        alert("Conta atualizada com sucesso!");
        navigate("/contas-receber");
        return;
      }

      alert(json?.message || "Erro ao salvar.");
    } catch (e) {
      console.log("ERRO SALVAR", e);
      alert("Erro ao salvar.");
    } finally {
      setSavando(false);
    }
  }

  useEffect(() => {
    carregarFornecedores();
    carregarCategorias();
    carregar();
  }, []);

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  //------------------------------------------------------------------
  // LAYOUT
  //------------------------------------------------------------------
  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow border border-blue-300">
      <h2 className="text-xl font-bold mb-4">Editar Conta a Receber</h2>

      <div className="flex flex-col gap-4">

        {/* DESCRIÇÃO */}
        <div>
          <label className="font-semibold text-sm">Descrição</label>
          <input
            name="descricao"
            className="w-full border rounded px-3 py-2"
            value={form.descricao}
            onChange={handleChange}
          />
        </div>

        {/* VALOR */}
        <div>
          <label className="font-semibold text-sm">Valor</label>
          <input
            type="number"
            name="valor"
            className="w-full border rounded px-3 py-2"
            value={form.valor}
            onChange={handleChange}
          />
        </div>

        {/* VENCIMENTO */}
        <div>
          <label className="font-semibold text-sm">Vencimento</label>
          <input
            type="date"
            name="vencimento"
            className="w-full border rounded px-3 py-2"
            value={form.vencimento}
            onChange={handleChange}
          />
        </div>

        {/* CATEGORIA */}
        <div>
          <label className="font-semibold text-sm">Categoria</label>
          <select
            name="categoria_id"
            value={form.categoria_id}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Selecione</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        {/* FORNECEDOR */}
        <div>
          <label className="font-semibold text-sm">Fornecedor</label>
          <select
            name="fornecedor_id"
            value={form.fornecedor_id}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Selecione</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </div>

        {/* STATUS */}
        <div>
          <label className="font-semibold text-sm">Status</label>
          <select
            name="status"
            className="w-full border rounded px-3 py-2"
            value={form.status}
            onChange={handleChange}
          >
            <option value="aberto">Aberto</option>
            <option value="pago">Pago</option>
          </select>
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={salvar}
            disabled={salvando}
            className="bg-blue-600 text-white px-5 py-2 rounded font-semibold"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>

          <button
            onClick={() => navigate("/contas-receber")}
            className="bg-gray-400 text-white px-5 py-2 rounded font-semibold"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}
