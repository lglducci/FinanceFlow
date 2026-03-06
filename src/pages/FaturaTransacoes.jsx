 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
 
export default function FaturaTransacoes() {

  const [searchParams] = useSearchParams();

  const empresa_id = searchParams.get("empresa");
  const fatura_id = searchParams.get("id");

  const [lista, setLista] = useState([]);
  
const navigate = useNavigate();
  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {

    const url = buildWebhookUrl("transacoes_fatura", {
      empresa_id,
      fatura_id:fatura_id
    });

    const resp = await fetch(url);
    const json = await resp.json().catch(() => []);

    setLista(json);
  }
 const cartao = lista.length > 0 ? lista[0] : null;
  return (
    <div className="p-6">

        <div className="flex justify-between items-center mb-4">

            <h1 className="text-xl font-bold text-blue-800">
              Transações da Fatura
            </h1>

            <button
              onClick={() => navigate(-1)}
              className="
                px-4 py-2 rounded-lg
                bg-slate-600 text-white text-sm font-semibold
                hover:bg-slate-700 transition
              "
            >
              ← Voltar
            </button>

      </div>
     
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">

        {cartao && (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 shadow-sm">

    <div className="flex justify-between items-center mb-3">

                <div>
                   <h2 className="text-lg font-bold text-blue-800 mt-2">
                      {cartao.nome} • Fatura{" "}
                      {new Date(cartao.mes_referencia).toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric"
                      })}
                    </h2>

                  <div className="text-base text-green-600 font-bold mt-2">
                    Cartão: {cartao.numero}
                  </div>

                  <div className="text-base text-gray-800 font-bold mt-2">
                    Titular: {cartao.nomecartao}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base text-gray-500 font-bold">Limite</div>
                  <div className="text-lg font-bold text-green-700">
                    R$ {Number(cartao.limite_total).toLocaleString("pt-BR")}
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-3 gap-2 text-base text-gray-700">

                <div>
                  <span className="font-semibold">Fechamento:</span> dia {cartao.fechamento_dia}
                </div>

                <div>
                  <span className="font-semibold">Vencimento:</span> dia {cartao.vencimento_dia}
                </div>

                <div>
                  <span className="font-semibold">Fatura:</span> #{cartao.fatura_id}
                </div>

              </div>

            </div>
          )}
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left">Data Parcela</th>
              <th className="px-3 py-2 text-left">Descrição</th>
              <th className="px-3 py-2 text-left">Parcelas</th>
               <th className="px-3 py-2 text-left"> Total de Parcelas</th>
              <th className="px-3 py-2 text-right">Valor</th>
            </tr>
          </thead>

          <tbody>
            {lista.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  Nenhuma transação encontrada
                </td>
              </tr>
            )}

            {lista.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-3 py-2">
                  {new Date(t.data_parcela).toLocaleDateString("pt-BR")}
                </td>

                <td className="px-3 py-2">{t.descricao}</td>

                <td className="px-3 py-2">{t.parcela_num}</td>
                  <td className="px-3 py-2">{t.parcela_total}</td>


                <td className="px-3 py-2 text-right font-semibold">
         
                    R$ {Number(t.valor || 0).toFixed(2)}
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>

    </div>
  );
}