import { useState } from "react";

export default function Categories() {
  const [nome, setNome] = useState("");
  const [items, setItems] = useState([]);

  function addCategory(e) {
    e.preventDefault();
    if (!nome) return;
    setItems((prev) => [...prev, { id: Date.now(), nome }]);
    setNome("");
  }

  function removeCategory(id) {
    setItems((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Categorias</h2>
      <form
        onSubmit={addCategory}
        className="bg-white rounded-xl shadow p-4 flex gap-3 items-end max-w-md"
      >
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-600">
            Nova categoria
          </label>
          <input
            className="w-full mt-1 border rounded-lg px-2 py-2 text-sm"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primaryDark"
        >
          Adicionar
        </button>
      </form>

      <div className="bg-white rounded-xl shadow p-4 max-w-md">
        {!items.length ? (
          <p className="text-sm text-gray-500">
            Nenhuma categoria cadastrada ainda.
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {items.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between border-b last:border-0 py-1"
              >
                <span>{c.nome}</span>
                <button
                  onClick={() => removeCategory(c.id)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
