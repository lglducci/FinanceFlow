 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function ConsultaTransacaoCartao() {
  const navigate = useNavigate();

 

    const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [cartaoId, setCartaoId] = useState("");      // <-- guarda só o ID
  const [referencia, setReferencia] = useState("");
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
    const btnPadrao = "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";
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

  function compra() {
  navigate("/compras-cartao" , {
  state: { from: location.pathname }
});
}
return (
  <div className="p-4 space-y-6">

    {/* HEADER */}
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-xl font-bold text-blue-800">
          Transações do Cartão
        </h1>
        <p className="text-sm text-gray-500">
          Consulte e gerencie transações de cartão de crédito.
        </p>
      </div>
    </div>

    {/* FILTROS */}
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* CARTÃO */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Cartão
          </label>
          <select
            value={cartaoId}
            onChange={(e) => setCartaoId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Selecione...</option>
            {listaCartoes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        {/* MÊS */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Mês de referência
          </label>
          <input
            type="month"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {/* AÇÕES */}
        <div className="flex items-end gap-3">
          <button
            onClick={pesquisar}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {loading ? "Carregando..." : "Pesquisar"}
          </button>

          <button
            onClick={novaTransacao}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            + Nova transação
          </button>

          <button
            onClick={compra}
            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            Compra
          </button>
        </div>
      </div>
    </div>

    {/* RESULTADOS */}
    {dados?.erro && (
      <div className="text-center text-red-600 font-semibold">
        {dados.erro}
      </div>
    )}

    {dados && !dados.erro && dados.fatura && (
      <>
        {/* RESUMO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* FATURA */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Fatura — {dados.cartao}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Mês</p>
                <p className="font-semibold">
                  {new Date(dados.fatura.mes_referencia).toLocaleDateString(
                    "pt-BR",
                    { month: "long", year: "numeric" }
                  )}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-semibold capitalize">
                  {dados.fatura.status}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Total</p>
                <p className="font-semibold text-blue-700">
                  {Number(dados.fatura.valor_total).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* CARTÃO */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Cartão
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <p><strong>Nome:</strong> {cartaoSelecionado?.nome || "-"}</p>
              <p><strong>Bandeira:</strong> {cartaoSelecionado?.bandeira || "-"}</p>
              <p><strong>Limite:</strong>{" "}
                {cartaoSelecionado?.limite_total
                  ? Number(cartaoSelecionado.limite_total).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "-"}
              </p>
              <p><strong>Fechamento:</strong> {cartaoSelecionado?.fechamento_dia ?? "-"}</p>
              <p><strong>Vencimento:</strong> {cartaoSelecionado?.vencimento_dia ?? "-"}</p>
              <p><strong>Número:</strong> {cartaoSelecionado?.numero || "-"}</p>
            </div>
          </div>
        </div>

        {/* TABELA */}
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2 text-left">Descrição</th>
                <th className="px-3 py-2 text-right">Valor</th>
                <th className="px-3 py-2 text-center">Parcela</th>
                <th className="px-3 py-2 text-center">Editar</th>
              </tr>
            </thead>

            <tbody>
              {(!dados.transacoes || dados.transacoes.length === 0) && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              )}

              {dados.transacoes?.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-3 py-2">{t.data_parcela}</td>
                  <td className="px-3 py-2 font-medium">{t.descricao}</td>
                  <td className="px-3 py-2 text-right font-semibold text-blue-700">
                    {Number(t.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {t.parcela_num}/{t.parcela_total}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => editar(t.id)}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}

  </div>
);

 
}
