import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { callApi } from "../utils/api";
import { useNavigate, useLocation } from "react-router-dom";

 
 

export default function CompraCartao() {
    const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const hoje = new Date().toISOString().substring(0, 10);

  const [dataIni, setDataIni] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);
  const [cartao, setCartao] = useState(null);
  const [mesRef, setMesRef] = useState(null);
  const [lista, setLista] = useState([]);
  const navigate = useNavigate();
const location = useLocation();

const rotaOrigem = location.state?.from || "/dashboard";
 
async function pesquisar() {
  try {
    const data = await callApi(
      buildWebhookUrl("compracartoes"),
      {
        empresa_id,
        data_ini: dataIni,
        data_fim: dataFim
      }
    );

    // ✅ SOLUÇÃO DEFINITIVA
    if (!Array.isArray(data)) {
      setLista([]);
      return;
    }

    const listaLimpa = data.filter(
      item => item && Object.keys(item).length > 0
    );

    setLista(listaLimpa);
  } catch (e) {
    console.error(e);
    setLista([]);
  }
}


 async function excluir(compra) {
 
  

  if (!window.confirm("Excluir compra do cartão?")) return;

  try {
    await callApi(
      buildWebhookUrl("excluircompras"),
      {
        empresa_id: empresa_id,
        compra_id: compra.id
      },
      "POST"
    );

    alert("Compra excluída com sucesso.");
    pesquisar(); // recarrega a lista
  } catch (e) {
    alert("Erro ao excluir compra: " + e.message);
  }
}


  function corStatus(status) {
    if (status === "aberta") return "text-green-600 font-bold";
    if (status === "paga") return "text-black";
    return "text-gray-400";
  }


   function formatarData(data) {
  if (!data) return "";
  return new Date(data).toLocaleDateString("pt-BR");
}

function isHoje(data) {
  if (!data) return false;
  const hoje = new Date().toISOString().substring(0, 10);
  return data.substring(0, 10) === hoje;
}


  return (
    <div className="p-6">
     <h2 className="text-2xl font-bold mb-4">Compras no Cartão</h2>
     <div className="bg-gray-100 p-2.5 rounded-xl shadow-xl mb-4 border border-[2px] border-gray-100">

 
      {/* FILTROS */}
      <div className="bg-white p-4 rounded-lg border mb-6 flex gap-4 items-end">
        <div>
          <label className="font-bold mb-1 block text-[#1e40af]" >Data Inicial</label>
          <input type="date"    className="border font-bold px-3 py-1.5 rounded w-52 h-10 border-yellow-500"
          value={dataIni} onChange={e => setDataIni(e.target.value)} />
        </div>

        <div>
          <label className="font-bold mb-1 block text-[#1e40af]" >Data Final</label>
          <input type="date"     className="border font-bold px-3 py-1.5 rounded w-52 h-10 border-yellow-500"
           value={dataFim} onChange={e => setDataFim(e.target.value)} />
        </div>

        <button
          onClick={pesquisar}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Pesquisar
        </button>

         <button
           onClick={() => navigate(rotaOrigem)}
          className="bg-gray-500 text-white px-6 py-2 rounded"
        >
          Voltar
        </button>

      </div>
        </div>
      {/* TABELA */}
         <div className="bg-gray-100 p-4 rounded-xl shadow border-[2px] border-gray-100"> 
       <div className="overflow-x-auto">
  <table className="min-w-full border border-gray-300 text-sm">

    <thead className="bg-gray-200 text-black">
      <tr>
        <th className="text-left py-3 px-3 w-28">Data</th>
        <th className="text-left py-3 px-3">Descrição</th>
        <th className="text-center py-3 px-3 w-20">Parcelas</th>
        <th className="text-right py-3 px-3 w-32">Valor</th>
               <th className="text-left py-3 px-3">Classificacão</th>
        <th className="text-left py-3 px-3 w-40">Cartão</th>
        <th className="text-center py-3 px-3 w-28">Bandeira</th>
        <th className="text-center py-3 px-3 w-40">Número</th>
        <th className="text-center py-3 px-3 w-24">Ações</th>
      </tr>
    </thead>

    <tbody>
      {lista.length === 0 ? (
        <tr>
          <td colSpan={9} className="text-center py-8 text-gray-500 font-semibold">
            Nenhuma compra encontrada para o período selecionado.
          </td>
        </tr>
      ) : (
        lista.map((c, idx) => (
          <tr
            key={c.compra_id}
            className={`border-t ${
              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
            } hover:bg-blue-50 transition`}
          >
            <td className="px-3 py-2">{formatarData(c.data_compra)}</td>

            <td className="px-3 py-2 max-w-[350px] truncate">
              {c.descricao}
            </td>

            <td className="text-center px-3 py-2">
              {c.parcelas}
            </td>

            <td className="text-right px-3 py-2 font-semibold text-green-700">
              R$ {Number(c.valor_total || 0).toFixed(2)}
            </td>
     
               <td className="px-3 py-2 max-w-[350px] truncate">
              {c.classificacao }
            </td>

            <td className="px-3 py-2 truncate">
              {c.cartao_nome}
            </td>

            <td className="text-center px-3 py-2">
              {c.cartao_bandeira}
            </td>

            <td className="text-center px-3 py-2">
              {c.cartao_numero}
            </td>

            <td className="text-center px-3 py-2">
              <button
                onClick={() => excluir(c)}
                className="px-3 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 transition"
              >
                Excluir
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
   </div>
    </div>
  );
}
