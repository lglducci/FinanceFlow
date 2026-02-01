 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";

export default function MinhasAssinaturas() {
  const [lista, setLista] = useState([]);
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");


    function formatarDataBR(data) {
  if (!data) return "";
  const d = new Date(data);
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const ano = d.getUTCFullYear();
  return `${dia}-${mes}-${ano}`;
}


  useEffect(() => {
    async function carregar() {
        
      const r = await fetch(buildWebhookUrl("historico_assinatura"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresa_id })
      });

      const res = await r.json();
      setLista(res || []);
    }

    carregar();
  }, []);

  return (
     <div className="min-h-screen bg-white px-8 py-10 border-2 border-gray-500 rounded-xl shadow-md overflow-hidden">
     

     <div className="absolute top-34 right-12">
      <button
        onClick={() => window.location.href = "/escolhaplano"}
          
        className="text-xl font-bold text-blue-900 hover:underline"
      >
        Sair
      </button>
    </div>



      <h1 className="text-2xl font-bold text-bg-[#0F172A] mb-6">
        Minhas Assinaturas
      </h1>

      <table className="w-full border border-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-[#0F172A] text-white">
          <tr>
            <th className="p-3 text-left    ">Plano</th>
               <th className="p-3 text-left    ">Descricao</th>
            <th className="p-3  text-left font-bold ">Início</th>
            <th className="p-3  text-left font-bold  ">Fim</th>
            <th className="p-3  font-bold text-left ">Status</th>
            <th className="p-3  text-right font-bold  ">Valor</th>
          </tr>
        </thead>

        <tbody>
          {lista.map((a) => (
            <tr
              key={a.id}
              className="odd:bg-white even:bg-gray-300 text-bg-[#0F172A]"
            >
              <td className="p-3 font-bold   ">{a.nome}</td>
                 <td className="p-3 font-bold   ">{a.descricao}</td>
              <td className="p-3  font-bold  ">{formatarDataBR(a.data_inicio)}</td>
              <td className="p-3 font-bold   ">{formatarDataBR(a.data_fim) || "-"}</td>
              <td className="p-3 font-bold text-left">
                {a.status}
              </td>
              <td className="p-3 text-right font-bold ">
                R$ {Number(a.valor_mensal).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
