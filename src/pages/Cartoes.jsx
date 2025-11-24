 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
export default function Cartoes({ setPage }) {
  const id_empresa = Number(localStorage.getItem("id_empresa") || 1);

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


  function excluirCartao(id) {
    if (!confirm("Tem certeza que deseja excluir este cartão?")) return;
    alert("Webhook de exclusão ainda não configurado.");
  }

  useEffect(() => {
    carregar();
  }, []);
return (
  <div className="p-6">

    {/* Título + Botão */}
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Cartões</h2>

       
    </div>

    {/* FILTROS */}
    <div className="bg-white p-5 rounded-xl shadow flex items-end gap-6 mb-6">

      <div>
        <label className="text-base font-semibold block mb-1">Status</label>
        <select
          className="border rounded-lg px-3 py-2 w-44 text-base"
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
        className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm"
      >
        {carregando ? "Carregando..." : "Pesquisar"}
      </button>
      
      <button
        onClick={novoCartao}
        className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
      >
        Novo cartão
      </button>

        

    </div>

    {/* DASHBOARD DE CARTÕES */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {lista.length === 0 ? (
  <p className="text-gray-600 text-sm col-span-3">
    Nenhum cartão encontrado.
  </p>
) : (
  lista.map((c) => (
    <div
      key={c.id}
      className={
        "bg-white rounded-xl shadow p-5 border border-gray-200 " +
        (c.status === "ativo"
          ? "border-l-4 border-green-600"
          : "border-l-4 border-red-600")
      }
    >
      {/* Cabeçalho */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-gray-800">{c.nome}</h3>

        <button
          onClick={() => editarCartao(c.id)}
          className="text-blue-600 text- base font-semibold"
        >
          Editar
        </button>
      </div>

      {/* Conteúdo do cartão */}
      <div className="text- base text-gray-500 leading-6">

        <p><strong>Bandeira:</strong> {c.bandeira}</p>

        <p>
          <strong>Limite:</strong>{" "}
          {Number(c.limite_total).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>

        <p><strong>Fechamento:</strong> {c.fechamento_dia}</p>

        <p><strong>Vencimento dia:</strong> {c.vencimento_dia}</p>

        {/* NOVOS CAMPOS — AGORA CORRETOS */}
        <p><strong>Número do Cartão:</strong> {c.numero || "-"}</p>

        <p><strong>Nome no Cartão:</strong> {c["NomeCartão"] || "-"}</p>

        <p><strong>Vencimento (MM/AA):</strong> {c.Vencimento || "-"}</p>

        {/* Status */}
        <p
          className={`font-bold mt-2 ${
            c.status === "ativo" ? "text-green-700" : "text-red-600"
          }`}
        >
          Status: {c.status}
        </p>
      </div>

      {/* Botão excluir */}
      <div className="mt-4 text-right">
        <button
          onClick={() => excluirCartao(c.id)}
          className="text-red-600 text-sm font-semibold"
        >
          Excluir
        </button>
      </div>
    </div>
  ))
)}
 

    </div>

  </div>
);

  
}
