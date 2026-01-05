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
  if (compra.status_fatura !== "aberta") return;

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
     <div className="bg-gray-100 p-2.5 rounded-xl shadow-xl mb-4 border border-[4px] border-blue-900">

 
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
         <div className="bg-gray-100 p-4 rounded-xl shadow border-[4px] border-gray-500"> 
      <table className="w-full border">
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="text-left py-2 px-2 w-10 text-base">Data</th>
            <th className="text-left py-2 px-2 w-10 text-base">Descrição</th>
             <th className="text-center py-2 px-2 w-10 text-base">Parcelas</th>
            <th className="text-left py-2 px-2 w-10 text-base">Valor</th>
            <th className="text-left py-2 px-2 w-10 text-base">Fatura</th>
            <th className="text-left py-2 px-2 w-10 text-base">Status</th>
            <th className="text-left py-2 px-2 w-10 text-base">Nome</th>
            <th className="text-left py-2 px-2 w-10 text-base">Bandeira</th>
            <th className="text-left py-2 px-2 w-10 text-base">Número</th>
            <th className="text-left py-2 px-2 w-10 text-base">Ações</th>
          </tr>
        </thead>    
            <tbody>
                {lista.length === 0 ? (
                    <tr>
                    <td colSpan={9} className="text-center py-6 text-gray-500 font-semibold">
                        Nenhuma compra encontrada para o período selecionado.
                    </td>
                    </tr>
                ) : (
                    lista.map((c, idx) => (
                    <tr
                        key={c.compra_id}
                        className={`border-b ${idx % 2 === 0 ? "bg-white" : "bg-gray-200"}`}
                    >
                        <td className="text-center py-2 px-2 w-10 font-bold text-base" >{formatarData(c.data_compra)}</td>

                        <td className="px-2 py-1 max-w-[420px] whitespace-nowrap overflow-hidden text-ellipsis font-bold">
                        {c.descricao}
                        </td>  

                        <td className="text-center py-2 px-2 w-10 font-bold text-base">{c.parcelas}</td>

                        <td className="text-center py-2 px-2 w-10 font-bold text-base" >R$ {Number(c.valor_total || 0).toFixed(2)}</td>

                        <td className="text-center py-2 px-2 w-10 font-bold text-base" >{c.mes_referencia}</td>

                        <td className={corStatus(c.status_fatura) } >
                        {c.status_fatura.toUpperCase()}
                        </td>

                        <td className="px-2 py-1 max-w-[420px] whitespace-nowrap overflow-hidden text-ellipsis font-bold" >{c.cartao_nome}</td>
                        <td className="text-center py-2 px-2 w-10 font-bold text-base">{c.cartao_bandeira}</td>
                        <td className="text-center py-2 px-2 w-10 font-bold text-base">{c.cartao_numero}</td>

                        <td>
                         <button
                            disabled={!(c.status_fatura === "aberta" && isHoje(c.data_compra))}
                            onClick={() => excluir(c)}
                            className={`px-3 py-1 rounded ${
                                c.status_fatura === "aberta" && isHoje(c.data_compra)
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            title={
                                c.status_fatura !== "aberta"
                                ? "Compra não pode ser excluída: fatura não está aberta"
                                : !isHoje(c.data_compra)
                                ? "Compra só pode ser excluída no dia da compra"
                                : ""
                            }
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
  );
}
