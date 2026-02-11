 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
 
import { hojeLocal, dataLocal } from "../utils/dataLocal";


export default function Diario() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || "1";

     const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

   const btnPadrao =
  "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";

  // 👉 DATA HOJE (usa global se existir, senão fallback local)
  const hoje = hojeLocal();

  const [lista, setLista] = useState([]);

  const [filtros, setFiltros] = useState({
    data_ini: hoje,
    data_fim: hoje,
    modelo: "",
    busca: "",
  });
async function carregar() {
  // 🔥 LIMPA A LISTA ANTES DE BUSCAR
  setLista([]);

  try {
    const url = buildWebhookUrl("consulta_diario", {
      empresa_id,
      data_ini: filtros.data_ini,
      data_fim: filtros.data_fim,
      modelo_codigo: filtros.modelo,
      busca: filtros.busca,
    });

    const r = await fetch(url);
    const dados = await r.json();

    // 🔒 GARANTE ARRAY
    setLista(Array.isArray(dados) ? dados : []);
  } catch (e) {
    console.error("Erro ao carregar diário", e);
    setLista([]); // segurança
  }
}

 

  // 👉 FORMATA DATA DA TABELA (remove horário)
  const formatarData = (d) => {
    if (!d) return "";
    const dt = d.split("T")[0]; // só AAAA-MM-DD
    const [ano, mes, dia] = dt.split("-");
    return `${dia}/${mes}/${ano}`;
  };

 return (
  <div className="p-4 bg-gray-100 rounded-xl">

    {/* ===== CABEÇALHO ===== */}
    <div className="bg-white rounded-xl shadow border-l-4 border-green-700 p-4 mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-800">
          📘 Diário Contábil
        </h2>

        <button
          onClick={() => navigate("/novo-diario")}
          className={`${btnPadrao} bg-green-700 hover:bg-green-800`}
        >
          + Novo
        </button>
      </div>
    </div>

    {/* ===== FILTROS ===== */}
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="flex flex-wrap gap-6 items-end">

        <div className="flex flex-col">
          <label className="font-bold text-gray-700">Data inicial</label>
          <input
            type="date"
            value={filtros.data_ini}
            onChange={(e) =>
              setFiltros({ ...filtros, data_ini: e.target.value })
            }
            className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-bold text-gray-700">Data final</label>
          <input
            type="date"
            value={filtros.data_fim}
            onChange={(e) =>
              setFiltros({ ...filtros, data_fim: e.target.value })
            }
            className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <div className="flex flex-col w-72">
          <label className="font-bold text-gray-700">Token / Modelo</label>
          <input
            type="text"
            value={filtros.modelo}
            onChange={(e) =>
              setFiltros({ ...filtros, modelo: e.target.value })
            }
            placeholder="VENDA_BEBIDA, etc"
            className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <div className="flex flex-col flex-1 min-w-[240px]">
          <label className="font-bold text-gray-700">Buscar</label>
          <input
            type="text"
            value={filtros.busca}
            onChange={(e) =>
              setFiltros({ ...filtros, busca: e.target.value })
            }
            placeholder="Histórico / Documento / Parceiro"
            className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <button
          onClick={carregar}
          className={`${btnPadrao} bg-blue-700 hover:bg-blue-800`}
        >
          Filtrar
        </button>
      </div>
    </div>

    {/* ===== TABELA ===== */}
    <div className="bg-white rounded-xl shadow border border-gray-300 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-150 text-gray-800 font-bold">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Data</th>
            <th className="p-2 text-left">Token</th>
            <th className="p-2 text-left">Histórico</th>
            <th className="p-2 text-left">Documento</th>
            <th className="p-2 text-left">Parceiro</th>
            <th className="p-2 text-right">Valor</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>

        <tbody>
          {lista.map((l, i) => (
            <tr
              key={l.id}
              className={i % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}
            >
              <td className="p-2 font-bold">{l.id}</td>
              <td className="p-2 font-bold">{formatarData(l.data_mov)}</td>
              <td className="p-2 font-bold">{l.modelo_codigo}</td>
              <td className="p-2">{l.historico}</td>
              <td className="p-2">{l.doc_ref}</td>
              <td className="p-2">{l.parceiro}</td>
              <td className="p-2 text-right font-bold">
                {fmt.format(l.valor_total)}
              </td>
              <td className="p-2 text-center">
                <button
                  onClick={() =>
                    navigate("/editar-diario", { state: { id: l.id } })
                  }
                  className="text-blue-700 underline font-bold"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}

          {lista.length === 0 && (
            <tr>
              <td colSpan={8} className="p-6 text-center text-gray-400">
                Nenhum lançamento encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

}
