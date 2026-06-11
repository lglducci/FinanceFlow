 import { useEffect, useState } from "react";
 
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import ExcelExport from "../utils/ExcelExport";

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

function exportarTemplateContas() {
  const dados = filtradas.map((c) => ({
    id: c.id,
    codigo: String(c.codigo ?? ""),
    nome: c.nome ?? "",
    ativo: c.ativo ?? 1
  }));

  ExcelExport.exportarTemplateContas(
    dados,
    "template_contas_contabeis.xlsx"
  );
}

const [abertos, setAbertos] = useState({});

const grupos = filtradas
  .filter((c) => Number(c.nivel) === 1)
  .map((pai) => ({
    ...pai,
    filhos: filtradas.filter(
      (f) => f.codigo !== pai.codigo && String(f.codigo).startsWith(String(pai.codigo))
    ),
  }));

function toggleGrupo(id) {
  setAbertos((prev) => ({
    ...prev,
    [id]: !prev[id],
  }));
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
                        bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800
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
            onClick={() => exportarTemplateContas(filtradas)} // ou contas
            
                      className="
                                  px-5 py-2 rounded-full
                                  font-bold text-sm tracking-wide
                                  text-white
                                    bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-800
                                  border-2 border-black
                                  shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                                  hover:brightness-110 hover:scale-105
                                  active:scale-95
                                  transition-all duration-200
                                  inline-flex items-center gap-2
                                ">
            Baixar Excel (Contas + Layout)
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
  <div id="print-area" className="space-y-4">
  {grupos.map((g) => (
    <div
      key={g.id}
      className="
        bg-white rounded-2xl border border-sky-100
        shadow-sm overflow-hidden
      "
    >
      <button
        onClick={() => toggleGrupo(g.id)}
        className="
          w-full flex items-center justify-between
          px-6 py-5 text-left
          hover:bg-slate-50 transition
        "
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-blue-900">
            📁
          </div>

          <div>
            <div className="font-black text-blue-950 text-base">
              {g.codigo} - {g.nome}
            </div>
            <div className="text-xs font-semibold text-blue-700">
              {g.filhos.length} subcontas
            </div>
          </div>
        </div>

        <div className="text-blue-900 text-xl font-black">
          {abertos[g.id] ? "⌃" : "⌄"}
        </div>
      </button>

      {abertos[g.id] && (
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3">
          {g.filhos.map((c, i) => (
            <div
              key={c.id}
              className={`
                grid grid-cols-[90px_1fr_120px_120px_120px]
                gap-3 items-center
                px-3 py-2 rounded-lg text-sm
                ${i % 2 === 0 ? "bg-white" : "bg-slate-100"}
              `}
            >
              <div className="font-mono font-bold text-slate-700">
                {c.codigo}
              </div>

              <div className="font-semibold text-slate-800">
                {c.nome}
              </div>

              <div className="text-slate-500">
                Nível {c.nivel}
              </div>

              <div className="text-slate-500">
                {(c.classificacao_gerencial || "-").replaceAll("_", " ")}
              </div>

              <div className="text-right">
                {c.sistema ? (
                  <span className="text-xs font-bold text-slate-400">
                    Sistema
                  </span>
                ) : (
                  <div className="space-x-3">
                    <span
                      onClick={() =>
                        navigate("/editar-conta-contabil", {
                          state: {
                            id: c.id,
                            empresa_id: localStorage.getItem("empresa_id") || "1",
                          },
                        })
                      }
                      className="text-blue-600 text-xs font-bold cursor-pointer hover:underline"
                    >
                      Editar
                    </span>

                    <span
                      onClick={() => excluirConta(c.id)}
                      className="text-red-600 text-xs font-bold cursor-pointer hover:underline"
                    >
                      Excluir
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ))}

  {grupos.length === 0 && (
    <div className="bg-white rounded-xl p-4 text-sm text-gray-500">
      Nenhuma conta contábil encontrada.
    </div>
  )}
</div>
  </div>
);

 
}
