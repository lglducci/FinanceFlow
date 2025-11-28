export default function TransactionsTable({ items, onRemove }) {
  if (!items.length) {
    return (
      <div className="bg-white rounded-xl shadow p-4 text-sm text-gray-500">
        Nenhum lançamento cadastrado ainda.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <th className="px-4 py-2">Data</th>
            <th className="px-4 py-2">Tipo</th>
            <th className="px-4 py-2">Descrição</th>
            <th className="px-4 py-2">Categoria</th>
            <th className="px-4 py-2 text-right">Valor</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="px-4 py-2">{t.data}</td>
              <td className="px-4 py-2 capitalize">
                {t.tipo === "despesa" ? "Despesa" : "Receita"}
              </td>
              <td className="px-4 py-2">{t.descricao}</td>
              <td className="px-4 py-2">{t.categoria}</td>
              <td className="px-4 py-2 text-right">
                R$ {t.valor.toFixed(2).replace(".", ",")}
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => onRemove(t.id)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
