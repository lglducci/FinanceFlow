import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function RevisarTransferencias() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const empresa_id = localStorage.getItem("empresa_id");
  const lote_id = params.get("lote_id");

  const [linhas, setLinhas] = useState([]);
  const [loading, setLoading] = useState(false);

 const [contas, setContas] = useState([]);
const [linhaEditando, setLinhaEditando] = useState(null);
const [contaOrigemId, setContaOrigemId] = useState("");
const [contaDestinoId, setContaDestinoId] = useState("");

  async function carregar() {
    if (!lote_id) {
      alert("Lote não informado.");
      return;
    }

    try {
      setLoading(true);

      const url = buildWebhookUrl("revisar_transferencia", {
        empresa_id,
        lote_id,
      });

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: Number(empresa_id),
          lote_id: Number(lote_id),
        }),
      });

      const retorno = await resp.json();

      const lista =
        Array.isArray(retorno?.[0]?.data)
          ? retorno[0].data
          : Array.isArray(retorno?.data)
            ? retorno.data
            : Array.isArray(retorno)
              ? retorno
              : [];

      setLinhas(lista);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar transferências.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);


  async function carregarContas() {
  const url = buildWebhookUrl("listacontas", { empresa_id });

  const resp = await fetch(url);
  const data = await resp.json();

  setContas(Array.isArray(data) ? data : []); 
  setLinhaEditando(null);
}


  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white border shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              🔁 Revisar Transferências
            </h1>
            <p className="text-sm font-semibold text-slate-600">
              Lote: {lote_id} | Total: {linhas.length}
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-full bg-slate-800 text-white font-bold"
          >
            ↩ Voltar
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center font-bold text-slate-500">
            Carregando...
          </div>
        ) : linhas.length === 0 ? (
          <div className="p-10 text-center font-bold text-slate-500">
            Nenhuma transferência encontrada.
          </div>
        ) : (
          <div className="overflow-auto max-h-[700px] rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-white sticky top-0">
                <tr>
                  <th className="p-3 text-left">Data</th>
                  <th className="p-3 text-left">Histórico</th>
                  <th className="p-3 text-right">Valor</th>
                  <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Origem</th>
                      <th className="p-3 text-center">Destino</th>
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>

              <tbody>
                {linhas.map((l) => (
                  <tr key={l.id} className="border-b hover:bg-blue-50">
                    <td className="p-3 font-bold">
                      {String(l.data_mov || "").slice(0, 10).split("-").reverse().join("/")}
                    </td>

                    <td className="p-3 font-semibold text-slate-700">
                      {l.historico}
                    </td>

                    <td className="p-3 text-right font-black">
                      {Number(l.valor || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>

                    <td className="p-3 text-center font-bold">
                      {l.status || "-"}
                    </td>
                     <td className="p-3 text-center font-bold">
                        {contas.find((c) => Number(c.id) === Number(l.conta_origem_id))?.nome || "-"}
                        </td>

                        <td className="p-3 text-center font-bold">
                        {contas.find((c) => Number(c.id) === Number(l.conta_destino_id))?.nome || "-"}
                        </td>
                     <td className="p-3 text-center min-w-[180px]">
                <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                    <button className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs">
                    Não é transf.
                    </button>

                    <button
                    onClick={() => {
                        setLinhaEditando(l);
                        setContaOrigemId(l.conta_origem_id || "");
                        setContaDestinoId(l.conta_destino_id || "");
                    }}
                    className="px-3 py-1 rounded-full bg-purple-700 text-white font-bold text-xs"
                    >
                    Resolver
                    </button>
                </div>
                </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {linhaEditando && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-3xl p-6 w-[520px] shadow-2xl">
      <h2 className="text-xl font-black text-slate-800 mb-4">
        Resolver Transferência
      </h2>

      <div className="mb-3 text-sm font-semibold text-slate-600">
        {linhaEditando.historico}
      </div>

      <div className="mb-3 text-lg font-black text-slate-800">
        {Number(linhaEditando.valor || 0).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </div>

      <label className="block text-sm font-bold mb-1">Conta origem</label>
      <select
        value={contaOrigemId}
        onChange={(e) => setContaOrigemId(e.target.value)}
        className="w-full border rounded-xl px-3 py-2 mb-4"
      >
        <option value="">Selecione</option>
        {contas.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>

      <label className="block text-sm font-bold mb-1">Conta destino</label>
      <select
        value={contaDestinoId}
        onChange={(e) => setContaDestinoId(e.target.value)}
        className="w-full border rounded-xl px-3 py-2 mb-5"
      >
        <option value="">Selecione</option>
        {contas.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setLinhaEditando(null)}
          className="px-5 py-2 rounded-full bg-gray-500 text-white font-bold"
        >
          Cancelar
        </button>

        <button
          onClick={() => confirmarTransferencia()}
          className="px-5 py-2 rounded-full bg-purple-700 text-white font-bold"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}