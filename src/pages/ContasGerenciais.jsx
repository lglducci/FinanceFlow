import React, { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function ContasGerenciais() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

  const [tipo, setTipo] = useState("");
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("");
  const btnPadrao = "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";
  

  const listaFiltrada = lista.filter((l) =>
  l.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
  l.tipo?.toLowerCase().includes(filtro.toLowerCase()) ||
  l.grupo_contabil?.toLowerCase().includes(filtro.toLowerCase()) ||
  String(l.id).includes(filtro)
);



  async function carregar() {
    setLoading(true);
    try {                                       
      const url = buildWebhookUrl("listacategorias", {
        empresa_id:empresa_id,
        tipo:tipo,
      });
      const r = await fetch(url);
      let data = [];
      try { data = JSON.parse(await r.text()); } catch {}
      if (!Array.isArray(data)) data = [];
      setLista(data);
    } catch (e) {
      console.log("ERRO:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

     
 
  async function excluir(id) {
  if (!confirm("Tem certeza que deseja excluir esta conta?")) return;

  try {
    const url = buildWebhookUrl("excluicontagerencial");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa_id, id }),
    });

    const texto = await resp.text();
    console.log("RETORNO:", texto);

    let json = {};
    try { json = JSON.parse(texto); } catch {}

    // 🔥 TRATAMENTO CORRETO DO SEU FORMATO
    const sucesso =
      Array.isArray(json) &&
      json.length > 0 &&
      json[0].success === true;

    if (sucesso) {
      alert("Conta excluída com sucesso!");

      // remove visualmente da tela ANTES de recarregar do backend
        setLista((prev) => prev.filter((x) => x.id !== id));

        // depois recarrega real do webhook
        setTimeout(() => carregarLista(), 150);
     {/*} carregarLista();  // atualiza tabela*/}
      return;
    }

    // Se não entrou no sucesso, então deu erro (provavelmente FK)
    alert(json[0]?.message || "Erro ao excluir. Verifique vínculos (FK).");

  } catch (e) {
    console.log("ERRO EXCLUIR:", e);
    alert("Erro ao excluir.");
  }
}


 return (
  <div className="p-4 space-y-6">

    {/* HEADER */}
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-xl font-bold text-blue-800">
          Contas Gerenciais
        </h1>
        <p className="text-sm text-gray-500">
          Organize categorias de entrada e saída para controle gerencial.
        </p>
      </div>

      <button
        onClick={() => navigate("/contasgerenciais/novo")}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        + Novo
      </button>
    </div>

    {/* FILTROS */}
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">

        {/* TIPO */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tipo
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
        </div>

        {/* PESQUISA */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Pesquisar
          </label>
          <input
            type="text"
            placeholder="Nome, tipo, grupo contábil ou ID"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={carregar}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {loading ? "Carregando..." : "Pesquisar"}
        </button>
      </div>
    </div>

    {/* TABELA */}
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">Nome</th>
            <th className="px-3 py-2 text-left">Tipo</th>
            <th className="px-3 py-2 text-left">Grupo Contábil</th>
            <th className="px-3 py-2 text-center">Ações</th>
          </tr>
        </thead>

        <tbody>
          {listaFiltrada.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-6 text-gray-500">
                Nenhuma conta encontrada.
              </td>
            </tr>
          )}

          {listaFiltrada.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="px-3 py-2 font-medium">{l.id}</td>
              <td className="px-3 py-2 font-medium">{l.nome}</td>

              <td
                className={`px-3 py-2 font-semibold ${
                  l.tipo === "entrada" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {l.tipo}
              </td>

              <td className="px-3 py-2">{l.grupo_contabil}</td>

              <td className="px-3 py-2 text-center space-x-4">
                <button
                  onClick={() =>
                    navigate("/contasgerenciais/editar", { state: l })
                  }
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Editar
                </button>

                <button
                  onClick={() =>
                    navigate("/mapeamento-contabil/impacto", {
                      state: { id: l.id, empresa_id },
                    })
                  }
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Impacto contábil
                </button>

                <button
                  onClick={() => excluir(l.id)}
                  className="text-red-600 hover:underline font-semibold"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>
);

}
