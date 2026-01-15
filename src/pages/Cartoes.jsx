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
  <div className="p-2">

    {/* Título + Botão */}
    

    {/* FILTROS */}
     
         <div className="bg-white p-5 rounded-xl shadow border border-[8px] border-[#061f4aff] gap-2 mb-10 max-w-[100%]">
    
         <h2 className="text-2xl font-bold mb-2 text-[#061f4aff]">Cartóes</h2>
        
         <div className="flex gap-2 text-base  font-bold  mb-2"> 
      <div>
        <label className="text-base font-bold block mb-1 font-bold text-[#061f4aff]">Status</label>
        <select
          className=   "border font-bold rounded px-4 py-3 w-[380px] mb-2 border-gray-300"
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
        >
          <option value="ativo">Ativos</option>
          <option value="cancelado">Cancelados</option>
          <option value="todos">Todos</option>
        </select>
      </div>
      
         <div className="flex gap-8 pt-8 pb-8 pl-1"> 
           <div> 
            <button
              onClick={carregar}
              className="flex-1 bg-blue-600  w-[200px] text-white px-5 py-3 rounded-lg font-bold "
            >
              {carregando ? "Carregando..." : "Pesquisar"}
            </button>
            </div>
            <div> 
            <button
              onClick={novoCartao}
              className="flex-1  bg-green-600   w-[200px] text-white px-5 py-3 rounded-lg font-bold"
            >
              Novo cartão
            </button> 
          </div>
      </div>
    </div>
    </div>

    {/* DASHBOARD DE CARTÕES */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

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
        <p><strong>Nome no Cartão:</strong> {c.nomecartao || "-"}</p> 
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
