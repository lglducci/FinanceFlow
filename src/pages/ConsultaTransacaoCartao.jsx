 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function ConsultaTransacaoCartao() {
  const navigate = useNavigate();

  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [cartao, setCartao] = useState("");
  const [referencia, setReferencia] = useState("");
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);

  const [listaCartoes, setListaCartoes] = useState([]);

  useEffect(() => {
    carregarCartoes();
  }, []);

  const carregarCartoes = async () => {
    try {
      const url = buildWebhookUrl("cartoes", { id_empresa: empresa_id });
      const resp = await fetch(url);
      const json = await resp.json();
      setListaCartoes(json);
    } catch (error) {
      console.error("Erro ao carregar cartões:", error);
    }
  };

  const pesquisar = async () => {
    if (!cartao || !referencia) {
      alert("Informe o cartão e o mês de referência.");
      return;
    }

    try {
      setLoading(true);

      const url = buildWebhookUrl("transcaocartao", {
        id_empresa: empresa_id,
        cartao: cartao,
        referencia: referencia + "-01",
      });

      const resp = await fetch(url);
      const json = await resp.json();

      const resultado = json[0]?.ff_transacoes_fatura_cartao;
      setDados(resultado);
    } catch (error) {
      console.error("Erro ao consultar transações:", error);
      alert("Erro ao consultar");
    } finally {
      setLoading(false);
    }
  };

 
const editar = (id_transacao) => {
  navigate("/edit-card-transaction", {
    state: {
      id_transacao,
      empresa_id: localStorage.getItem("empresa_id"),
    },
  });
};


  const novaTransacao = () => {
    navigate("/new-card-transaction");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Transações de Cartão</h2>

      {/* FILTROS */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Cartão</label>
          <select
            className="border px-3 py-2 rounded"
            value={cartao}
            onChange={(e) => setCartao(e.target.value)}
          >
            <option value="">Selecione...</option>
            {listaCartoes?.map((c) => (
              <option key={c.id} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-semibold mb-1">Mês referência</label>
          <input
            type="month"
            className="border px-3 py-2 rounded"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
          />
        </div>

        <button
          onClick={pesquisar}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded h-10 mt-6 md:mt-0"
        >
          {loading ? "Carregando..." : "Pesquisar"}
        </button>

        <button
          onClick={novaTransacao}
          className="bg-green-600 text-white px-5 py-2 rounded h-10 mt-6 md:mt-0"
        >
          Nova Transação
        </button>
      </div>
{/* ======= RESULTADO ======= */}

{/* Caso venha erro */}
{dados?.erro && (
  <div className="text-center text-red-600 font-semibold mt-4">
    {dados.erro}
  </div>
)}

{/* Caso tenha fatura válida */}
{dados && !dados.erro && dados.fatura ? (
  <>
    {/* DASHBOARD */}
    <div className="w-full bg-white p-4 rounded shadow mb-6 max-w-2xl">

      <h2 className="text-lg font-bold text-gray-800 mb-3">
        Cartão: <span className="text-blue-700">{dados.cartao}</span>
      </h2>

      <div className="grid grid-cols-2 gap-4 text-gray-700">
        
        <div className="p-3 bg-gray-100 rounded">
          <span className="font-semibold block text-sm text-gray-600">Mês referência</span>
          <span className="text-lg font-bold">
            {dados.fatura.mes_referencia
              ? new Date(dados.fatura.mes_referencia).toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })
              : "-"}
          </span>
        </div>

        <div className="p-3 bg-gray-100 rounded">
          <span className="font-semibold block text-sm text-gray-600">Status</span>
          <span className="text-lg font-bold capitalize">
            {dados.fatura.status ?? "-"}
          </span>
        </div>

        <div className="p-3 bg-gray-100 rounded">
          <span className="font-semibold block text-sm text-gray-600">Total da Fatura</span>
          <span className="text-lg font-bold text-blue-700">
            {dados.fatura.valor_total != null
              ? Number(dados.fatura.valor_total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              : "R$ 0,00"}
          </span>
        </div>

        <div className="p-3 bg-gray-100 rounded">
          <span className="font-semibold block text-sm text-gray-600">Soma Transações</span>
          <span className="text-lg font-bold text-green-700">
            {dados.fatura.soma_transacoes != null
              ? Number(dados.fatura.soma_transacoes).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              : "R$ 0,00"}
          </span>
        </div>

      </div>
    </div>

    {/* TABELA */}
    <div className="bg-white shadow rounded p-3">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Data</th>
            <th className="p-2 text-left">Descrição</th>
            <th className="p-2 text-right">Valor</th>
            <th className="p-2 text-center">Parcela</th>
            <th className="p-2 text-center">Editar</th>
          </tr>
        </thead>

        <tbody>
          {!dados.transacoes || dados.transacoes.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-4">
                Nenhuma transação encontrada.
              </td>
            </tr>
          ) : (
            dados.transacoes.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-2">{t.data_parcela || "-"}</td>
                <td className="p-2">{t.descricao || "-"}</td>
                <td className="p-2 text-right">
                  {t.valor != null
                    ? Number(t.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : "R$ 0,00"}
                </td>
                <td className="p-2 text-center">
                  {t.parcela_num}/{t.parcela_total}
                </td>
                <td className="p-2 text-center">
                  <button onClick={() => editar(t.id)} className="text-blue-600 underline">
                    Editar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </>
) : null}

{/* Caso não tenha pesquisado ainda */}
{!dados && (
  <div className="text-center text-gray-500 mt-4">
    Nenhum registro encontrado.
  </div>
)}

       
    </div>
  );
}
