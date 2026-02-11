 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
export default function Cartoes({ setPage }) {
  const id_empresa = Number(localStorage.getItem("id_empresa") || Number(localStorage.getItem("empresa_id")));

  const [lista, setLista] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState("ativo");
  const [carregando, setCarregando] = useState(false);
 const navigate = useNavigate();
 
  async function carregar() {
    setCarregando(true);

    try {
      const url = buildWebhookUrl("cartoes", { id_empresa });

      const resp = await fetch(url, { method: "GET" });
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
  navigate("/new-card");
}

  function editarCartao(id) {
  navigate(`/edit-card/${id}`);
}
 
 async function excluirCartao(id) {
  if (!confirm("Tem certeza que deseja excluir este cartão?")) return;

  try {
    const url = buildWebhookUrl("excluircartoes");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: Number(id),
        id_empresa: Number(id_empresa)
      })
    });

    const texto = await resp.text();
    let json = {};

    try {
      json = texto ? JSON.parse(texto) : {};
    } catch {
      console.log("Resposta não JSON:", texto);
    }

    // ⚠️ Apenas ISSO foi acrescentado:
    if (
      texto.includes("foreign key") ||
      texto.includes("violates") ||
      texto.toLowerCase().includes("fatura") ||
      json?.message?.toLowerCase?.().includes("não é possível excluir")
    ) {
      alert("Não é possível excluir: este cartão possui movimentações/faturas.");
      return;
    }

    // Sucesso normal
    alert(json?.message || "Cartão excluído com sucesso!");

    carregar();  // recarrega a lista corretamente (igual estava antes)

  } catch (e) {
    console.error("Erro excluir cartão:", e);
    alert("Erro ao excluir cartão.");
  }
}

 return (
  <div className="p-4 space-y-6">

    {/* HEADER */}
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-xl font-bold text-blue-800">
          Cartões
        </h1>
        <p className="text-sm text-gray-500">
          Gerencie cartões de crédito e seus limites.
        </p>
      </div>

      <button
        onClick={novoCartao}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        + Novo cartão
      </button>
    </div>

    {/* FILTROS */}
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">

        {/* STATUS */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Status
          </label>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="ativo">Ativos</option>
            <option value="cancelado">Cancelados</option>
            <option value="todos">Todos</option>
          </select>
        </div>

        {/* BOTÃO PESQUISAR */}
        <div className="md:col-span-2">
          <button
            onClick={carregar}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {carregando ? "Carregando..." : "Pesquisar"}
          </button>
        </div>
      </div>
    </div>

    {/* GRID DE CARTÕES */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {lista.length === 0 && (
        <div className="col-span-full text-sm text-gray-500">
          Nenhum cartão encontrado.
        </div>
      )}

      {lista.map((c) => (
        <div
          key={c.id}
          className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${
            c.status === "ativo" ? "border-emerald-600" : "border-red-600"
          }`}
        >
          {/* HEADER CARD */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">
                {c.nome}
              </h3>
              <p className="text-sm text-gray-500">
                {c.bandeira}
              </p>
            </div>

            <button
              onClick={() => editarCartao(c.id)}
              className="text-blue-600 text-sm font-semibold hover:underline"
            >
              Editar
            </button>
          </div>

          {/* DADOS */}
          <div className="space-y-1 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Limite:</span>{" "}
              {Number(c.limite_total).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <p>
              <span className="font-semibold">Fechamento:</span>{" "}
              dia {c.fechamento_dia}
            </p>
            <p>
              <span className="font-semibold">Vencimento:</span>{" "}
              dia {c.vencimento_dia}
            </p>
            <p>
              <span className="font-semibold">Número:</span>{" "}
              {c.numero || "-"}
            </p>
            <p>
              <span className="font-semibold">Nome no cartão:</span>{" "}
              {c.nomecartao || "-"}
            </p>
            <p>
              <span className="font-semibold">Validade:</span>{" "}
              {c.Vencimento || "-"}
            </p>
          </div>

          {/* STATUS */}
          <div
            className={`mt-3 text-sm font-semibold ${
              c.status === "ativo"
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            Status: {c.status}
          </div>

          {/* AÇÕES */}
          <div className="mt-4 text-right">
            <button
              onClick={() => excluirCartao(c.id)}
              className="text-red-600 text-sm font-semibold hover:underline"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>

  </div>
);


  
}
