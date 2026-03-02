 import { useEffect, useState } from "react";
 
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function ContasContabeis() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");

  const [lista, setLista] = useState([]);
  const [filtro, setFiltro] = useState("");

  async function carregar() {
    try {
      const url = buildWebhookUrl("contascontabeis", {
        empresa_id:empresa_id,
        dc: "",
        id: 0,
      });

      const resp = await fetch(url);
      const dados = await resp.json();
      setLista(dados);
    } catch (e) {
      console.log("ERRO CARREGAR CONTAS:", e);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtradas = lista.filter(
    (c) =>
      c.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
      c.nome.toLowerCase().includes(filtro.toLowerCase())
  );




 async function excluirConta(id) {
  if (!window.confirm("Tem certeza que deseja excluir esta conta?")) return;

  try {
    const url = buildWebhookUrl("contascontabeis_excluir", {
      empresa_id,
      id
    });

    const resp = await fetch(url, { method: "POST" });

    // (Opcional) Checar retorno
    // const r = await resp.json();

    // Atualiza lista
    carregar();

  } catch (e) {
    console.log("ERRO AO EXCLUIR:", e);
    alert("Erro ao excluir conta.");
  }
}

return (
  <div className="p-4 space-y-6">

    {/* HEADER */}
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-xl font-bold text-blue-800">
          Contas Contábeis
        </h1>
        <p className="text-sm text-gray-500">
          Plano de contas utilizado na escrituração contábil.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/nova-conta-contabil")} 
            className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-white
                        bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-800
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-'95'
                        transition-all duration-200
                        inline-flex items-center gap-2
                      ">
          + Nova conta 
        </button>

        <button
          onClick={() => window.print()}
       
            className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-white
                        bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-95
                        transition-all duration-200
                        inline-flex items-center gap-2
                      ">
       
          🖨️ Imprimir
        </button>
      </div>
    </div>

    {/* FILTRO */}
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="max-w-md">
        <label className="block text-sm font-bold text-blue-700 mb-1">
          Buscar por código ou nome
        </label>
        <input
          type="text"
          placeholder="Ex: 1.01.01 ou Caixa"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
    </div>

    {/* TABELA */}
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-blue-800">
          <tr>
            <th className="px-3 py-2 text-left">ID</th>
            <th className="px-3 py-2 text-left">Código</th>
            <th className="px-3 py-2 text-left">Nome</th>
            <th className="px-3 py-2 text-left">Tipo</th>
            <th className="px-3 py-2 text-left">Natureza</th>
            <th className="px-3 py-2 text-left">Nível</th>
            <th className="px-3 py-2 text-left">Origem</th>
            <th className="px-3 py-2 text-center">Ações</th>
          </tr>
        </thead>

        <tbody>
          {filtradas.map((c, i) => (
            <tr
              key={c.id}
              className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
            >
              <td className="px-3 py-2 font-semibold">{c.id}</td>
              <td className="px-3 py-2 font-mono">{c.codigo}</td>
              <td className="px-3 py-2">{c.nome}</td>
              <td className="px-3 py-2">{c.tipo}</td>
              <td className="px-3 py-2">{c.natureza}</td>
              <td className="px-3 py-2">{c.nivel}</td>
              <td className="px-3 py-2">
                {c.sistema ? (
                  <span className="text-xs font-semibold text-slate-500">
                    Sistema
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-blue-600">
                    Usuário
                  </span>
                )}
              </td>

              <td className="px-3 py-2 text-right space-x-4">
                {c.sistema ? (
                  <>
                    <span className="text-slate-400 text-sm cursor-not-allowed">
                      Editar
                    </span>
                    <span className="text-slate-400 text-sm cursor-not-allowed">
                      Excluir
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      onClick={() =>
                        navigate("/editar-conta-contabil", {
                          state: {
                            id: c.id,
                            empresa_id:
                              localStorage.getItem("empresa_id") || "1",
                          },
                        })
                      }
                      className="text-blue-600 text-sm font-semibold cursor-pointer hover:underline"
                    >
                      Editar
                    </span>

                    <span
                      onClick={() => excluirConta(c.id)}
                      className="text-red-600 text-sm font-semibold cursor-pointer hover:underline"
                    >
                      Excluir
                    </span>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtradas.length === 0 && (
        <div className="p-4 text-sm text-gray-500">
          Nenhuma conta contábil encontrada.
        </div>
      )}
    </div>

  </div>
);

 
}
