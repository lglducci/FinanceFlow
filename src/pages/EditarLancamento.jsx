import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function EditarLancamento() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const id = state?.id_lancamento;
  const id_empresa = state?.empresa_id;

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [contas, setContas] = useState([]);

  const [form, setForm] = useState({
    id: "",
    empresa_id: "",
    descricao: "",
    categoria_id: "",
    conta_id: "",
    valor: "",
    data_movimento: "",
    tipo: "",
    origem: "",
  });

  // 🔵 CARREGAR DADOS DO LANÇAMENTO
  useEffect(() => {
    if (!id || !id_empresa) {
      alert("Dados inválidos para edição.");
      navigate("/lancamentos");
      return;
    }

     const carregar = async () => {
  try {
    const url = buildWebhookUrl("editlancto", {
      id_empresa: id_empresa,
      id: id,
    });

    const dados = (await fetch(url).then(r => r.json()))[0];

    setForm({
      id: dados.id,
      empresa_id: id_empresa,
      descricao: dados.descricao || "",
      categoria_id: dados.categoria_id || "",
      conta_id: dados.conta_id || "",
      valor: dados.valor || "",
      data_movimento: dados.data_movimento?.substring(0, 10) || "",
      tipo: dados.tipo || "",
      origem: dados.origem || "",
    });

    await carregarCategorias();
    await carregarContas();

  } catch (e) {
    console.error(e);
    alert("Erro ao carregar dados do lançamento.");
    navigate("/transactions");
    
 
  }

  setCarregando(false);
};


    carregar();
  }, []);

  // 🔵 Carregar categorias
  const carregarCategorias = async () => {
    try {
      const url = buildWebhookUrl("listacategorias", { empresa_id: id_empresa });
      const resp = await fetch(url);
      const data = await resp.json();
      setCategorias(data);
    } catch (e) {
      console.error("Erro categorias", e);
    }
  };

  // 🔵 Carregar contas
  const carregarContas = async () => {
    try {
      const url = buildWebhookUrl("listacontas", { empresa_id: id_empresa });
      const resp = await fetch(url);
      const data = await resp.json();
      setContas(data);
    } catch (e) {
      console.error("Erro contas", e);
    }
  };

  function onChange(e) {
    const { name, value } = e.target;
    setForm((ant) => ({ ...ant, [name]: value }));
  }

  // 🔵 SALVAR ALTERAÇÕES
  const salvar = async () => {
    setSalvando(true);

    try {
      const url = buildWebhookUrl("updatelancto");

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const ret = await resp.json();

      alert("Lançamento atualizado com sucesso!");
      navigate("/transactions");
    } catch (e) {
      console.error(e);
      alert("Erro ao atualizar lançamento.");
    }

    setSalvando(false);
  };

  if (carregando) {
    return <p className="p-4 text-gray-700">Carregando...</p>;
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Editar Lançamento</h2>

      {/* Descrição */}
      <label className="block mb-2 font-semibold text-sm">Descrição</label>
      <input
        type="text"
        name="descricao"
        value={form.descricao}
        onChange={onChange}
        className="border rounded-lg px-3 py-2 w-full mb-4"
      />

      {/* Categoria */}
      <label className="block mb-2 font-semibold text-sm">Categoria</label>
      <select
        name="categoria_id"
        value={form.categoria_id}
        onChange={onChange}
        className="border rounded-lg px-3 py-2 w-full mb-4"
      >
        <option value="">Selecione</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>

      {/* Conta */}
      <label className="block mb-2 font-semibold text-sm">Conta</label>
      <select
        name="conta_id"
        value={form.conta_id}
        onChange={onChange}
        className="border rounded-lg px-3 py-2 w-full mb-4"
      >
        <option value="">Selecione</option>
        {contas.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>

      {/* Valor */}
      <label className="block mb-2 font-semibold text-sm">Valor</label>
      <input
        type="number"
        name="valor"
        value={form.valor}
        onChange={onChange}
        className="border rounded-lg px-3 py-2 w-full mb-4"
      />

      {/* Data */}
      <label className="block mb-2 font-semibold text-sm">Data</label>
      <input
        type="date"
        name="data_movimento"
        value={form.data_movimento}
        onChange={onChange}
        className="border rounded-lg px-3 py-2 w-full mb-4"
      />

      {/* Tipo */}
      <label className="block mb-2 font-semibold text-sm">Tipo</label>
      <select
        name="tipo"
        value={form.tipo}
        onChange={onChange}
        className="border rounded-lg px-3 py-2 w-full mb-4"
      >
        <option value="">Selecione</option>
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </select>

      {/* Origem */}
      <label className="block mb-2 font-semibold text-sm">Origem</label>
      <input
        type="text"
        name="origem"
        value={form.origem}
        onChange={onChange}
        className="border rounded-lg px-3 py-2 w-full mb-6"
      />

      {/* BOTÕES */}
      <div className="flex gap-4">
        <button
          onClick={salvar}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          {salvando ? "Salvando..." : "Salvar"}
        </button>

        <button
          onClick={() => navigate("/lancamentos")}
          className="bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
