import React, { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function ContasGerenciais() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

  const [tipo, setTipo] = useState("");
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);

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
    <div className="p-6">
      <div className="flex justify-between mb-5">
        <h1 className="text-2xl font-bold text-blue-600">Contas Gerenciais</h1>

        
      </div>

      {/* FILTRO */}
      
      <div className="bg-gray-100 rounded-xl shadow p-8  border-[12px] border-blue-800 mb-8 w-[1850px] flex items-center gap-6">
             <label className="font-bold text-[#1e40af]">Descrição</label>
            <select 
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="border px-5 py-2 rounded w-46 border-yellow-500 w-32"
            >
              <option value="">Todos</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>

            <button
              onClick={carregar}
              className="bg-blue-600 text-white px-5 py-2 rounded font-bold w-32"
            >
              Pesquisar
            </button>


             <button
                onClick={() => navigate("/contasgerenciais/novo")}
                className="bg-green-600 text-white px-5 py-2 rounded font-bold shadow"
              >
                Novo
              </button>

          </div>

    

      {loading && <p>Carregando…</p>}

      {/* TABELA */}
       <div className="bg-gray-300 p-8 rounded-xl shadow"> 
      <table className="w-full border">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="p-1 border text-right border">ID</th>
            <th className="p-1 border text-left border">Nome</th>
            <th className="p-1 border text-left border">Tipo</th>
            <th className="p-1 border text-left border">Grupo Contábil</th>
            <th className="p-1 border text-left border">Ações</th>
          </tr>
        </thead>

        <tbody>
          {lista.map((l, i) => (
            <tr
              key={l.id}
              className={i % 2 === 0 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6]"}
            >
              <td className="p-1 border font-bold shadow">{l.id}</td>
              <td className="p-1 border font-bold shadow">{l.nome}</td>
             
                 <td className={"px-1 font-bold " +
                      (l.tipo === "entrada" ? "text-green-600" : "text-red-600")
                    }
                  > {l.tipo}
                  </td>

              <td className="p-1 border font-bold shadow">{l.grupo_contabil}</td>

              <td className="p-1 border flex gap-2">
 
                <td className="px-4 py-1 text-blue-600 underline font-bold cursor-pointer"
                    onClick={() =>
                      navigate("/contasgerenciais/editar", { state: l })
                    }>
                  Editar
                </td>

                <td
                  className="px-4 py-1 text-red-600 underline font-bold cursor-pointer"
                  onClick={() => excluir(l.id)}
                >
                  Excluir
                </td>






               {/*} <button
                  onClick={() =>
                    navigate("/contasgerenciais/editar", { state: l })
                  }
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>

                <button
                  onClick={() => navigate("/contasgerenciais/excluir", { state: l })}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Excluir
                </button>*/}


              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {!loading && lista.length === 0 && (
        <p className="text-gray-600 mt-4">Nenhuma conta encontrada.</p>
      )}
    </div>
  );
}
