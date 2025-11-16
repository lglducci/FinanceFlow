import { useState } from "react";

export default function ConsultaTransacaoCartao({ setPage }) {
  const [cartao, setCartao] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [dados, setDados] = useState([]);
  const [erro, setErro] = useState("");

  async function pesquisar() {
    setErro("");
    setDados([]);

    if (!cartao || !inicio || !fim) {
      setErro("Preencha cartão, data início e data fim.");
      return;
    }

    try {
      const resp = await fetch(
        "https://webhook.lglducci.com.br/webhook/transcaocartao",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartao,
            inicio,
            fim,
            id_empresa: Number(localStorage.getItem("id_empresa") || 1),
          }),
        }
      );

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : []);
    } catch (e) {
      setErro("Erro ao consultar.");
    }
  }

  function abrirNovo() {
    setPage("new-card-transaction");
  }

  return (
    <div className="max-w-4xl">

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Transações de Cartão</h2>

        <button
          onClick={abrirNovo}
          className="px-4 py-2 rounded-lg bg-primary text-white font-semibold"
        >
          Nova Transação
        </button>
      </div>

      {/* filtros */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm">Cartão</label>
          <input
            className="w-full px-3 py-2 rounded-lg border"
            value={cartao}
            onChange={(e) => setCartao(e.target.value)}
            placeholder="Ex.: Nubank Roxo"
          />
        </div>

        <div>
          <label className="text-sm">Início</label>
          <input
            type="date"
            className="w-full px-3 py-2 rounded-lg border"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm">Fim</label>
          <input
            type="date"
            className="w-full px-3 py-2 rounded-lg border"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={pesquisar}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold"
          >
            Pesquisar
          </button>
        </div>
      </div>

      {erro && <div className="text-red-600">{erro}</div>}

      {/* tabela */}
      <div className="bg-white p-4 rounded-xl shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Data</th>
              <th className="py-2 text-left">Descrição</th>
              <th className="py-2 text-left">Valor</th>
              <th className="py-2 text-left">Parcela</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="py-2">
                  {t.data_parcela?.slice(0, 10) || ""}
                </td>
                <td className="py-2">{t.descricao}</td>
                <td className="py-2">R$ {t.valor}</td>
                <td className="py-2">
                  {t.parcela_num}/{t.parcela_total}
                </td>
              </tr>
            ))}

            {dados.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
