 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";

export default function LembretesContabeis() {
  const empresa_id =
    localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataIni, setDataIni] = useState(hojeMaisDias(-15));
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [selecionados, setSelecionados] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const hoje = hojeLocal();

  function normalizarDataISO(data) {
    if (!data) return "";
    return data.slice(0, 10);
  }

 async function pesquisar() {
  setLoading(true);
  try {
    const r = await fetch(buildWebhookUrl("lembrete"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        data_ini: dataIni,
        data_fim: dataFim,
      }),
    });

    const j = await r.json();

    const dados = Array.isArray(j)
      ? j
      : j && typeof j === "object"
      ? [j]
      : [];

    setLista(dados);
    setSelecionados([]);
    setSelectAll(false);
  } catch (e) {
    console.error("Erro lembretes:", e);
    setLista([]);
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  pesquisar();
}, []);


  function toggleSelecionado(id) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleTodos() {
    if (selectAll) {
      setSelecionados([]);
    } else {
      setSelecionados(lista.map((l) => l.id || l.lembrete_id));
    }
    setSelectAll(!selectAll);
  }

  async function baixar(ids) {
    if (!ids.length) return;
    if (!window.confirm("Confirmar baixa dos lembretes selecionados?")) return;

    await fetch(buildWebhookUrl("baixar_lembrete"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa_id, ids }),
    });

    pesquisar();
  }

  return (
    <div className="p-2">
      <div className="max-w-full mx-auto bg-[#ffffff] rounded-xl shadow-lg p-2 border-[2px] border-blue-100 mb-2">
        <h1 className="text-2xl font-bold mb-4 text-blue-800">
          📘 Lembretes de Lançamentos Contábeis
        </h1>

        {/* FILTROS */}
        <div className="bg-gray-100 rounded-xl p-4 shadow mb-4 flex gap-4 items-end">
          <div className="bg-white p-3 rounded-lg flex gap-4 items-end">
            <div className="flex flex-col">
              <label className="font-bold text-blue-800">Data Inicial</label>
              <input
                type="date"
                value={dataIni}
                onChange={(e) => setDataIni(e.target.value)}
                className="border px-3 py-2 rounded"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-bold text-blue-800">Data Final</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="border px-3 py-2 rounded"
              />
            </div>

            <button
              onClick={pesquisar}
              className="bg-blue-900 text-white px-6 py-2 rounded font-bold"
            >
              Filtrar
            </button>

             <div className="mt-4 flex justify-end">
            <button
              disabled={!selecionados.length}
              onClick={() => baixar(selecionados)}
              className="bg-green-800 text-white px-6 py-2 rounded font-bold disabled:opacity-50"
            >
              Baixar selecionados
            </button>
          </div>

            <label className="flex items-center gap-2 font-bold text-blue-800 ml-4">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleTodos}
              />
              Selecionar todos
            </label>

            
          </div>
        </div>

        {/* LISTA */}
        <div className="bg-white p-4 rounded-xl border-[4px] border-gray-100">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-blue-800">
                <th className="p-2 text-center w-10">☑</th>
                 <th className="p-2 text-left">Id</th>
                <th className="p-2 text-left">Descrição</th>
                <th className="p-2 text-center">Vencimento</th>
                <th className="p-2 text-left">Conta Débito</th>
                <th className="p-2 text-left">Conta Crédito</th>
                <th className="p-2 text-right">Valor</th>
                <th className="p-2 text-right">Lote</th>
                <th className="p-2 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((l, i) => {
                const id = l.id || l.lembrete_id;
                const descricao = l.lembrete_descricao || l.titulo || l.obs || "-";
                const data = normalizarDataISO(
                  l.data_vencimento || l.data || l.data_prevista || ""
                );
                const valor = Number(l.valor || l.valor_total || 0);
                const vencido = data && data < hoje;
                
                return (
                
                  <tr
                    key={id}
                     className={i % 2 === 0 ? "bg-gray-150" : "bg-blue-200"}
                  > 
                     <td className="text-left">{id}</td>

                    <td className="text-left">
                      <input
                        type="checkbox"
                        checked={selecionados.includes(id)}
                        onChange={() => toggleSelecionado(id)}
                      />
                    </td>

                    <td className="text-left p-2 font-bold ">
                      {descricao}
                      {vencido && (
                        <span className="ml-2 text-red-600 font-bold">
                          ⚠ vencido
                        </span>
                      )}
                    </td>

                    <td className="text-center font-bold">{data}</td>
                    <td className="text-left p-2 font-bold ">
                      {l.conta_debito} 
                    </td>

                      <td className="text-left p-2 font-bold ">
                      {l.conta_credito} 
                    </td>

                    <td className="text-right font-bold">
                      {valor.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    
                    <td className="text-right font-bold ">{l.lote_id}</td>

                    <td className="text-center font-bold">
                      <button
                        onClick={() => baixar([id])}
                        className="text-blue-800 underline font-bold"
                      >
                        Baixar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          
        </div>
      </div>
    </div>
  );
}
