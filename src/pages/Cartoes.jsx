import { useEffect, useState } from "react";

export default function Cartoes({ setPage }) {
  const id_empresa = Number(localStorage.getItem("id_empresa") || 1);

  const [lista, setLista] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState("ativo"); // ativo | cancelado | todos
  const [carregando, setCarregando] = useState(false);

  async function carregar() {
    setCarregando(true);

    try {
      const resp = await fetch(
        "https://webhook.lglducci.com.br/webhook/cartoes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_empresa }),
        }
      );

      const dados = await resp.json();

      let filtrados = dados;

      if (statusFiltro === "ativo") {
        filtrados = dados.filter((c) => c.status === "ativo");
      } else if (statusFiltro === "cancelado") {
        filtrados = dados.filter((c) => c.status === "cancelado");
      }

      setLista(filtrados);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar cartões.");
    }

    setCarregando(false);
  }

  function novoCartao() {
    setPage("new-card");
  }

  function editarCartao(id) {
    setPage(`edit-card-${id}`);
  }

  function excluirCartao(id) {
    if (!confirm("Tem certeza que deseja excluir este cartão?")) return;

    alert("Webhook de exclusão ainda não configurado.");
    // depois faremos o webhook delete aqui
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Cartões</h2>

        <button
          onClick={novoCartao}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Novo cartão
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow flex items-end gap-4 mb-6">
        <div>
          <label className="text-sm font-semibold block">Status</label>
          <select
            className="border rounded-lg px-3 py-2 w-40"
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
          >
            <option value="ativo">Ativos</option>
            <option value="cancelado">Cancelados</option>
            <option value="todos">Todos</option>
          </select>
        </div>

        <button
          onClick={carregar}
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold"
        >
          {carregando ? "Carregando..." : "Pesquisar"}
        </button>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow p-4">
        {lista.length === 0 ? (
          <p className="text-gray-600 text-sm">Nenhum cartão encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">ID</th>
                <th className="text-left py-2">Nome</th>
                <th className="text-left py-2">Bandeira</th>
                <th className="text-left py-2">Limite</th>
                <th className="text-left py-2">Fechamento</th>
                <th className="text-left py-2">Vencimento</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Ações</th>
              </tr>
            </thead>

            <tbody>
              {lista.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-2">{c.id}</td>
                  <td>{c.nome}</td>
                  <td>{c.bandeira}</td>
                  <td>
                    {Number(c.limite_total).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td>{c.fechamento_dia}</td>
                  <td>{c.vencimento_dia}</td>
                  <td>{c.status}</td>

                  <td className="flex gap-3">
                    <button
                      onClick={() => editarCartao(c.id)}
                      className="text-blue-600 font-semibold"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => excluirCartao(c.id)}
                      className="text-red-600 font-semibold"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
