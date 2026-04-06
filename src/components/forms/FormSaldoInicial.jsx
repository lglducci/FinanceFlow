import { useState, useEffect } from "react";

export default function FormSaldoInicial({
  aberto,
  form,
  setForm,
  onClose,
  onSalvar
}) {
  const [saldoLocal, setSaldoLocal] = useState("");

  useEffect(() => {
    if (aberto && form) {
      setSaldoLocal(String(form.saldo ?? 0));
    }
  }, [aberto, form]);

  if (!aberto || !form) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[420px] max-w-[95%] p-6 border-2 border-blue-800">
        <h2 className="text-xl font-bold text-blue-900 mb-4">
          {Number(form.saldo || 0) > 0 ? "Alterar Saldo Inicial" : "Incluir Saldo Inicial"}
        </h2>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-[110px_1fr] gap-2 items-center">
            <label className="font-bold text-blue-900">ID</label>
            <div className="border rounded-lg px-3 py-2 bg-gray-100">{form.id}</div>
          </div>

          <div className="grid grid-cols-[110px_1fr] gap-2 items-center">
            <label className="font-bold text-blue-900">Código</label>
            <div className="border rounded-lg px-3 py-2 bg-gray-100">{form.codigo}</div>
          </div>

          <div className="grid grid-cols-[110px_1fr] gap-2 items-center">
            <label className="font-bold text-blue-900">Nome</label>
            <div className="border rounded-lg px-3 py-2 bg-gray-100">{form.nome}</div>
          </div>

          <div className="grid grid-cols-[110px_1fr] gap-2 items-center">
            <label className="font-bold text-blue-900">Tipo</label>
            <div className="border rounded-lg px-3 py-2 bg-gray-100">{form.tipo}</div>
          </div>

          <div className="grid grid-cols-[110px_1fr] gap-2 items-center">
            <label className="font-bold text-blue-900">Saldo Inicial</label>
            <input
              type="number"
              step="0.01"
              value={saldoLocal}
              onChange={(e) => {
                setSaldoLocal(e.target.value);
                setForm({ ...form, saldo: e.target.value });
              }}
              className="border rounded-lg px-3 py-2 border-yellow-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
        

          <button
            onClick={onSalvar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Salvar
          </button>

          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Cancelar
          </button>

        </div>
      </div>
    </div>
  );
}