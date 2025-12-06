 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function ConsultaTransacaoCartao() {
  const navigate = useNavigate();

  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [cartaoId, setCartaoId] = useState("");      // <-- guarda só o ID
  const [referencia, setReferencia] = useState("");
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);

  const [listaCartoes, setListaCartoes] = useState([]);

  // =============================
  // 1) CARREGAR CARTÕES
  // =============================
  useEffect(() => {
    carregarCartoes();
    setReferencia(getMesAtual());
  }, []);

  const getMesAtual = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    return `${ano}-${mes}`;
  };

  const carregarCartoes = async () => {
    try {
      const url = buildWebhookUrl("cartoes", { id_empresa: empresa_id });
      const resp = await fetch(url);
      const json = await resp.json();

      setListaCartoes(json);

      // seta o primeiro cartão automaticamente (somente o ID)
      if (json.length > 0) {
        setCartaoId(String(json[0].id));
      }
    } catch (error) {
      console.error("Erro ao carregar cartões:", error);
    }
  };

  // cartão selecionado completo (objeto)
  const cartaoSelecionado = listaCartoes.find(
    (c) => String(c.id) === String(cartaoId)
  );

  // =============================
  // PESQUISAR
  // =============================
  const pesquisar = async () => {
    if (!cartaoId || !referencia) {
      alert("Informe o cartão e o mês de referência.");
      return;
    }

    try {
      setLoading(true);
      setDados(null);

      const url = buildWebhookUrl("transcaocartao", {
        id_empresa: empresa_id,
        id: cartaoId,              // <-- ID correto aqui
        referencia: referencia + "-01",
      });

      const resp = await fetch(url);
      const json = await resp.json();

      setDados(json[0]?.ff_transacoes_fatura_cartao || null);
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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Transações de Cartão</h2>

      {/* FILTROS  */}
      <div className="bg-gray-100 p-2.5 rounded-xl shadow-xl mb-10 border border-[12px] border-blue-800">
        <div className="bg-gray-100 p-2.5 rounded-lg mb-10 flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex flex-col">
            <label className="font-bold mb-1 text-[#1e40af]">Cartão</label>
            <select
              className="border font-bold px-3 py-1.5 rounded w-78 h-10 border-yellow-500"
              value={cartaoId}                      // <-- trabalha com ID
              onChange={(e) => setCartaoId(e.target.value)}
            >
              {listaCartoes.length === 0 ? (
                <option>Carregando...</option>
              ) : (
                <>
                  <option value="">Selecione...</option>
                  {listaCartoes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-bold mb-1 text-[#1e40af]">
              Mês referência
            </label>
            <input
              type="month"
              className="border font-bold px-3 py-1.5 rounded w-52 h-10 border-yellow-500"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={pesquisar}
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded h-10"
            >
              {loading ? "Carregando..." : "Pesquisar"}
            </button>

            <button
              onClick={novaTransacao}
              className="bg-green-600 text-white px-5 py-1.5 rounded h-10"
            >
              Nova Transação
            </button>
          </div>
        </div>
      </div>

      {/* ====================== RESULTADO ====================== */}

      {dados?.erro && (
        <div className="text-center text-red-600 font-semibold mt-4">
          {dados.erro}
        </div>
      )}

      {/* Se tem fatura */}
      {dados && !dados.erro && dados.fatura && (
        <>
          {/* Painel superior */}
          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-gray-600">
            {/* GRID COM 2 COLUNAS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* COLUNA 1 – PAINEL DA FATURA */}
              <div className="bg-white shadow rounded-lg p-4 border-l-4 border-gray-600">
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  Cartão:{" "}
                  <span className="text-blue-700">{dados.cartao}</span>
                </h2>

                <div className="grid grid-cols-2 gap-4 text-gray-700">
                  <div className="p-3 bg-gray-100 rounded">
                    <span className="font-bold block text-sm text-gray-600">
                      Mês referência
                    </span>
                    <span className="text-lg font-bold">
                     {(() => {
                          if (!dados?.fatura?.mes_referencia) return "-";

                          // mes_referencia = "2025-12-01"
                          const [ano, mes] = dados.fatura.mes_referencia.split("-");

                          const dataFormatada = new Date(
                            Number(ano),
                            Number(mes) - 1,
                            1
                          ).toLocaleDateString("pt-BR", {
                            month: "long",
                            year: "numeric",
                          });

                          return dataFormatada;
                        })()}

                    </span>
                  </div>

                  <div className="p-3 bg-gray-100 rounded">
                    <span className="font-semibold block text-sm text-gray-600">
                      Status
                    </span>
                    <span className="text-lg font-bold capitalize">
                      {dados.fatura.status}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-100 rounded">
                    <span className="font-semibold block text-sm text-gray-600">
                      Total da Fatura
                    </span>
                    <span className="text-lg font-bold text-blue-700">
                      {Number(dados.fatura.valor_total).toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        }
                      )}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-100 rounded">
                    <span className="font-semibold block text-sm text-gray-600">
                      Soma Transações
                    </span>
                    <span className="text-lg font-bold text-green-700">
                      {Number(
                        dados.fatura.soma_transacoes
                      ).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* COLUNA 2 – DADOS DO CARTÃO */}
              <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-700">
                <h3 className="font-bold text-lg text-blue-700 mb-2">
                  Informações do Cartão
                </h3>
                <p>
                  <strong>Nome : </strong>
                  {cartaoSelecionado?.nome || "-"}
                </p>
                <p>
                  <strong>Bandeira : </strong>
                  {cartaoSelecionado?.bandeira || "-"}
                </p>
                <p>
                  <strong>Limite :</strong>{" "}
                  {cartaoSelecionado?.limite_total
                    ? Number(
                        cartaoSelecionado.limite_total
                      ).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : "-"}
                </p>

                <p>
                  <strong>Fechamento :</strong>{" "}
                  {cartaoSelecionado?.fechamento_dia ?? "-"}
                </p>
                <p>
                  <strong>Vencimento dia :</strong>{" "}
                  {cartaoSelecionado?.vencimento_dia ?? "-"}
                </p>

                <p>
                  <strong>Número do Cartão :</strong>{" "}
                  {cartaoSelecionado?.numero || "-"}
                </p>
                <p>
                  <strong>Nome no Cartão :</strong>{" "}
                  {cartaoSelecionado?.nomecartao || "-"}
                </p>
                <p>
                  <strong>Vencimento (MM/AA) :</strong>{" "}
                  {cartaoSelecionado?.Vencimento || "-"}
                </p>

                <p
                  className={`font-bold mt-2 ${
                    cartaoSelecionado?.status === "ativo"
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  Status : {cartaoSelecionado?.status || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="bg-gray-300 p-4 rounded-xl shadow">
            <div className="bg-white p-4 rounded-xl shadow">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-300 font-black text-base">
                    <th className="p-2 text-left border">Data</th>
                    <th className="p-2 text-left border">Descrição</th>
                    <th className="p-2 text-right border text-blue-800">
                      Valor
                    </th>
                    <th className="p-2 text-center border">Parcela</th>
                    <th className="p-2 text-center border">Editar</th>
                  </tr>
                </thead>

                <tbody>
                  {/* Nenhuma transação */}
                  {(!dados.transacoes ||
                    dados.transacoes.length === 0) && (
                    <tr>
                      <td colSpan="5" className="text-center p-4">
                        Nenhuma transação encontrada.
                      </td>
                    </tr>
                  )}

                  {/* Linhas */}
                  {dados.transacoes?.map((t, i) => (
                    <tr
                      key={t.id}
                      className={
                        i % 2 === 0 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6]"
                      }
                    >
                      <td className="p-2 border">{t.data_parcela}</td>

                      <td className="p-2 border font-medium">
                        {t.descricao}
                      </td>

                      <td className="p-2 text-right border text-blue-800 font-bold">
                        {Number(t.valor).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>

                      <td className="p-2 text-center border">
                        {t.parcela_num}/{t.parcela_total}
                      </td>

                      <td className="p-2 text-center border">
                        <button
                          onClick={() => editar(t.id)}
                          className="text-blue-600 underline font-semibold"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
