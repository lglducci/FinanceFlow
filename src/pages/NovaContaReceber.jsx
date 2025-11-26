import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function NovaContaReceber() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    vencimento:   new Date().toISOString().split("T")[0], // 👈 DEFAULT HOJE,
    categoria_id: "",
    fornecedor_id: "",
    parcelas: 1,
    parcela_num: 1,
    status: "aberto",
  });

  const [fornecedores, setFornecedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [salvando, setSalvando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // =======================================================
  //     CARREGAR FORNECEDORES  (tipo = fornecedor)
  // =======================================================
  async function carregarFornecedores() {
    try {
      const url = buildWebhookUrl("fornecedorcliente", {
        empresa_id,
        tipo: "fornecedor",
      });

      const resp = await fetch(url);
      const txt = await resp.text();

      let lista = [];
      try {
        lista = JSON.parse(txt);
      } catch {}

      setFornecedores(Array.isArray(lista) ? lista : []);
    } catch (e) {
      console.log("ERRO ao carregar fornecedores:", e);
    }
  }

  // =======================================================
  //     CARREGAR CATEGORIAS (já existe webhook em outra janela)
  // =======================================================
  async function carregarCategorias() {
    try {
      const url = buildWebhookUrl("listacategorias", { empresa_id });
      const resp = await fetch(url);
      const txt = await resp.text();

      let lista = [];
      try {
        lista = JSON.parse(txt);
      } catch {}

      setCategorias(Array.isArray(lista) ? lista : []);
    } catch (e) {
      console.log("ERRO ao carregar categorias:", e);
    }
  }

  // =======================================================
  useEffect(() => {
    carregarFornecedores();
    carregarCategorias();
  }, []);

  // =======================================================
  //                  SALVAR NOVA CONTA
  // =======================================================
   async function salvar() {
  try {
    setSalvando(true);

    const url = buildWebhookUrl("novacontareceber");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        descricao: form.descricao,
        valor: Number(form.valor),
        vencimento: form.vencimento,
        categoria_id: Number(form.categoria_id) || null,
        fornecedor_id: Number(form.fornecedor_id) || null,
        parcelas: Number(form.parcelas),
        parcela_num: Number(form.parcela_num),
        status: form.status
      })
    });

    // 👇 AQUI É A CURA DO PROBLEMA
    const json = await resp.json().catch(() => ({}));

    const sucesso =
      (Array.isArray(json) && json.length > 0) ||
      json?.id ||
      json?.success === true;

    if (sucesso) {
      alert("Conta a Receber cadastrada com sucesso!");
      navigate("/contas-receber");
      return;
    }

    alert(json?.message || "Erro ao salvar.");
  } catch (e) {
    console.log("ERRO SALVAR:", e);
    alert("Erro ao salvar.");
  } finally {
    setSalvando(false);
  }
}


  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow border border-blue-300">
      <h2 className="text-xl font-bold mb-4">Nova Conta a Receber</h2>

      <div className="flex flex-col gap-4">

        {/* DESCRIÇÃO */}
        <div>
          <label className="font-semibold text-sm">Descrição</label>
          <input
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* VALOR */}
        <div>
          <label className="font-semibold text-sm">Valor</label>
          <input
            type="number"
            name="valor"
            value={form.valor}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* VENCIMENTO */}
        <div>
          <label className="font-semibold text-sm">Vencimento</label>
          <input
            type="date"
            name="vencimento"
            value={form.vencimento}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
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
            <option value="">Selecione...</option>

            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
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
            <option value="">Nenhum</option>

            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>

        {/* PARCELAS */}
        <div>
          <label className="font-semibold text-sm">Parcelas</label>
          <input
            type="number"
            name="parcelas"
            min="1"
            value={form.parcelas}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* PARCELA ATUAL  
        <div>
          <label className="font-semibold text-sm">Número da Parcela</label>
          <input
            type="number"
            name="parcela_num"
            min="1"
            value={form.parcela_num}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>*/}

        {/* STATUS */}
        <div>
          <label className="font-semibold text-sm">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
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
