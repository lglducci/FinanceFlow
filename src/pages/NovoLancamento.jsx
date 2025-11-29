 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from '../config/globals';

export default function NovoLancamento() {
  const navigate = useNavigate();   

  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [form, setForm] = useState({
    id: "",
    empresa_id: empresa_id,
    categoria_id: "",
    conta_id: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    descricao: "",
    tipo: "saida",
  });

  const [categorias, setCategorias] = useState([]);
  const [contas, setContas] = useState([]);

  useEffect(() => {
    carregarCategorias();
  }, [form.tipo, empresa_id]);

  useEffect(() => {
    carregarContas();
  }, [empresa_id]);

  async function carregarCategorias() {
    try {
      const url = buildWebhookUrl("listacategorias", { empresa_id, tipo: form.tipo });
      const resp = await fetch(url);
      const data = await resp.json();
      setCategorias(data);
    } catch (error) {}
  }

  async function carregarContas() {
    try {
      const url = buildWebhookUrl("listacontas", { empresa_id });
      const resp = await fetch(url);
      const data = await resp.json();
      setContas(data);
    } catch (error) {}
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    const payload = {
      id_empresa: form.empresa_id,
      tipo: form.tipo,
      conta: form.conta_id,
      categoria: form.categoria_id,
      valor: form.valor,
      descricao: form.descricao,
      data: form.data,
    };

    try {
      const url = buildWebhookUrl("novolancamento");
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        alert("Lançamento salvo!");
        navigate(-1);
      } else {
        alert("Erro ao salvar.");
      }
    } catch (e) {
      alert("Erro de requisição.");
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 bg-bgSoft">

      <div className="w-full max-w-3xl mx-auto rounded-2xl p-6 shadow-xl bg-[#1e40af] text-white">

        {/* TÍTULO IGUAL AO EDITAR */}
        <h1
          className="text-2xl md:text-3xl font-bold mb-6 text-center"
          style={{ color: "#ff9f43" }}
        >
          ✏️ Novo Lançamento
        </h1>

        <div className="flex flex-col space-y-4">

          {/* Tipo */}
          <label className="block text-base font-bold">Tipo</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="input-base w-48 h-10"
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>

          {/* Categoria */}
          <label className="block text-base font-bold">Categoria</label>
          <select
            name="categoria_id"
            value={form.categoria_id}
            onChange={handleChange}
            className="input-base w-72 h-10"
          >
            <option value="">Selecione</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>

          {/* GRID IGUAL AO EDITAR */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-base font-bold">Conta</label>
              <select
                name="conta_id"
                value={form.conta_id}
                onChange={handleChange}
                className="input-base w-64 h-10"
              >
                <option value="">Selecione</option>
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-base font-bold">Valor</label>
              <input
                type="number"
                name="valor"
                value={form.valor}
                onChange={handleChange}
                className="input-base w-52 h-10"
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold">Data</label>
              <input
                type="date"
                name="data"
                value={form.data}
                onChange={handleChange}
                className="input-base w-48 h-10"
              />
            </div>

            <div>
              <label className="block text-base font-bold">Origem</label>
              <input
                type="text"
                name="origem"
                value={form.origem}
                onChange={handleChange}
                className="input-base w-48 h-10"
              />
            </div>
          </div>

          {/* Descrição */}
          <label className="block text-base font-bold">Descrição</label>
          <input
            type="text"
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            className="input-base w-full h-10"
          />

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSalvar}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Salvar
            </button>

            <button
              onClick={() => navigate(-1)}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Voltar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
