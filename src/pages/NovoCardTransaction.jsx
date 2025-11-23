import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function NovoCardTransaction() {
  const navigate = useNavigate();

  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [listaCartoes, setListaCartoes] = useState([]);
  const [cartaoSelecionado, setCartaoSelecionado] = useState("");

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    parcelas: 1,
    data_parcela: new Date().toISOString().split("T")[0],
  });

  // --------------------------
  // Carregar lista de cartões
  // --------------------------
  const carregarCartoes = async () => {
    try {
      const url = buildWebhookUrl("cartoes", { id_empresa: empresa_id });
      const resp = await fetch(url);
      const json = await resp.json();
      setListaCartoes(json);
    } catch (error) {
      console.error("Erro ao carregar cartões:", error);
    }
  };

  useEffect(() => {
    carregarCartoes();
  }, []);

  // --------------------------
  // Atualizar campos do form
  // --------------------------
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // --------------------------
  // Salvar transação
  // --------------------------
  const salvar = async () => {
    if (!cartaoSelecionado) {
      alert("Selecione um cartão.");
      return;
    }
    if (!form.descricao.trim()) {
      alert("Digite a descrição.");
      return;
    }
    if (!form.valor || parseFloat(form.valor) <= 0) {
      alert("Valor inválido.");
      return;
    }

    try {
      const url = buildWebhookUrl("novatranscartao");

      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_empresa: empresa_id,
          cartao_nome: cartaoSelecionado,
          descricao: form.descricao,
          valor_total: form.valor,
          parcelas: form.parcelas,
          data_compra: form.data_parcela,
        }),
      });

      alert("Transação registrada com sucesso!");
      navigate(-1);

    } catch (error) {
      console.error(error);
      alert("Erro ao registrar transação.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">

      <h2 className="text-2xl font-bold mb-4">Nova Transação de Cartão</h2>

      {/* Cartão */}
      <label className="block mb-1 text-sm font-semibold">Cartão</label>
      <select
        className="w-full px-3 py-2 rounded bg-gray-200 mb-4"
        value={cartaoSelecionado}
        onChange={(e) => setCartaoSelecionado(e.target.value)}
      >
        <option value="">Selecione...</option>
        {listaCartoes.map((c) => (
          <option key={c.id} value={c.nome}>
            {c.nome} - {c.bandeira}
          </option>
        ))}
      </select>

      {/* Descrição */}
      <label className="block mb-1 text-sm font-semibold">Descrição</label>
      <input
        type="text"
        name="descricao"
        value={form.descricao}
        onChange={handleChange}
        className="w-full px-3 py-2 rounded border mb-4"
      />

      {/* Valor */}
      <label className="block mb-1 text-sm font-semibold">Valor</label>
      <input
        type="number"
        name="valor"
        value={form.valor}
        onChange={handleChange}
        className="w-full px-3 py-2 rounded border mb-4"
      />

      {/* Parcelas */}
      <label className="block mb-1 text-sm font-semibold">Parcelas</label>
      <input
        type="number"
        name="parcelas"
        min="1"
        value={form.parcelas}
        onChange={handleChange}
        className="w-full px-3 py-2 rounded border mb-4"
      />

      {/* Data */}
      <label className="block mb-1 text-sm font-semibold">Data da Compra</label>
      <input
        type="date"
        name="data_parcela"
        value={form.data_parcela}
        onChange={handleChange}
        className="w-full px-3 py-2 rounded border mb-6"
      />

      {/* Botões */}
      <div className="flex justify-between">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-400 text-white rounded"
        >
          Voltar
        </button>

        <button
          onClick={salvar}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
