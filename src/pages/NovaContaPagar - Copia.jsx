 import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function NovaContaPagar() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

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

  const [fornecedores, setFornecedores] = useState([]); // <<< FALTAVA
  const [salvando, setSalvando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // =======================================================
  //    CARREGAR FORNECEDORES (SÓ TIPO = fornecedor)
  // =======================================================
  async function carregarFornecedores() {
    try {
      const url = buildWebhookUrl("fornecedorcliente", {
        empresa_id,
        tipo: "fornecedor",
      });

      const resp = await fetch(url);
      const texto = await resp.text();

      let lista = [];
      try {
        lista = JSON.parse(texto);
      } catch {}

      setFornecedores(Array.isArray(lista) ? lista : []);
    } catch (e) {
      console.log("ERRO FORNECEDORES:", e);
    }
  }

  useEffect(() => {
    carregarFornecedores(); // <<< AGORA CARREGA
  }, []);

  // =======================================================
  //              SALVAR NOVA CONTA A PAGAR
  // =======================================================
  async function salvar() {
    try {
      setSalvando(true);

      const url = buildWebhookUrl("novacontapagar");

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          status: form.status,
          data_ini: form.vencimento,
          data_fim: form.vencimento,
          fornecedor_id: Number(form.fornecedor_id) || null,
          ...form,
          valor: Number(form.valor),
          categoria_id: Number(form.categoria_id) || null,
        }),
      });

      const texto = await resp.text();
      let json = {};

      try {
        json = JSON.parse(texto);
      } catch {}

      const sucesso =
        (Array.isArray(json) && json.length > 0) ||
        json?.success === true ||
        json?.id;

      if (sucesso) {
        alert("Conta a pagar cadastrada com sucesso!");
        navigate("/contas-pagar");
        return;
      }

      alert(json?.message || "Erro ao salvar.");
    } catch (e) {
      console.log("ERRO SALVAR:", e);
      alert("Erro ao salvar registro.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow border border-blue-300">
      <h2 className="text-xl font-bold mb-4">Nova Conta a Pagar</h2>

      <div className="flex flex-col gap-4">

        <div>
          <label className="font-semibold text-sm">Descrição</label>
          <input
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

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

        {/* ================= DROPDOWN DE FORNECEDOR ================ */}
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

        <div className="flex gap-3 mt-4">
          <button
            onClick={salvar}
            disabled={salvando}
            className="bg-blue-600 text-white px-5 py-2 rounded font-semibold"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>

          <button
            onClick={() => navigate("/contas-pagar")}
            className="bg-gray-400 text-white px-5 py-2 rounded font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
