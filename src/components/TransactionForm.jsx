import { useState } from "react";

export default function TransactionForm({ onAdd }) {
  const [tipo, setTipo] = useState("despesa");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  function handleSubmit(e) {
    e.preventDefault();
    if (!descricao || !valor) return;
    onAdd({
      tipo,
      descricao,
      categoria,
      valor: parseFloat(valor),
      data,
    });
    setDescricao("");
    setCategoria("");
    setValor("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
    >
      <div>
        <label className="text-xs font-semibold text-gray-600">Tipo</label>
        <select
          className="w-full mt-1 border rounded-lg px-2 py-2 text-sm"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600">Descrição</label>
        <input
          className="w-full mt-1 border rounded-lg px-2 py-2 text-sm"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600">Categoria</label>
        <input
          className="w-full mt-1 border rounded-lg px-2 py-2 text-sm"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600">Valor</label>
        <input
          type="number"
          step="0.01"
          className="w-full mt-1 border rounded-lg px-2 py-2 text-sm"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-600">Data</label>
          <input
            type="date"
            className="w-full mt-1 border rounded-lg px-2 py-2 text-sm"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="mt-5 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primaryDark"
        >
          Adicionar
        </button>
      </div>
    </form>
  );
}
