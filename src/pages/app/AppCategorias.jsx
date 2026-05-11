 import React, { useEffect, useState } from "react";
import { buildWebhookUrl } from "../../config/globals";
import { useNavigate } from "react-router-dom";

export default function AppCategorias() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa") || 1);

  const [tipo, setTipo] = useState("");
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("");

  const listaFiltrada = lista.filter((l) =>
    l.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    l.tipo?.toLowerCase().includes(filtro.toLowerCase()) ||
    l.classificacao?.toLowerCase().includes(filtro.toLowerCase()) ||
    String(l.id).includes(filtro)
  );

  async function carregar() {
    setLoading(true);

    try {
      const url = buildWebhookUrl("listacategorias", {
        empresa_id,
        tipo,
      });

      const r = await fetch(url);
      let data = [];

      try {
        data = JSON.parse(await r.text());
      } catch {}

      setLista(Array.isArray(data) ? data : []);
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
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      const url = buildWebhookUrl("excluicontagerencial");

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresa_id, id }),
      });

      const texto = await resp.text();
      let json = {};

      try {
        json = JSON.parse(texto);
      } catch {}

      const sucesso =
        Array.isArray(json) &&
        json.length > 0 &&
        json[0].success === true;

      if (sucesso) {
        setLista((prev) => prev.filter((x) => x.id !== id));
        return;
      }

      alert(json[0]?.message || "Erro ao excluir. Verifique vínculos.");
    } catch (e) {
      console.log("ERRO EXCLUIR:", e);
      alert("Erro ao excluir.");
    }
  }

   const topoCard = {
    borderRadius: "0 0 34px 34px",
    background: "#ffffff",
    padding: "24px 20px 28px",
    boxShadow: "0 8px 22px rgba(15,23,42,0.12)",
    margin: "-16px -16px 28px",
  };

  
  const tela = {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#eef5fb,#e8f1fa)",
    padding: 16,
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  };

  return (
    
    <div style={tela}> 
     <div style={topoCard}> 
        {/* TOPO */}
         {/* TOPO */}
            <div style={{ position: "relative", textAlign: "center", paddingTop: 4 }}>
              <button
                type="button"
                onClick={() => navigate("/app/configuracoes")}
                className="bg-white/15 text-black px-4 py-2 rounded-full text-sm font-black"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                }}
              >
                ← Voltar
              </button>

              <h1 className="text-2xl font-black text-black flex items-center justify-center gap-2">
                🏷️ Categorias
              </h1>

              <p className="text-blue-900 text-sm font-semibold mt-2">
                Organize categorias de entrada e saída.
              </p>
            </div>
      

        {/* FILTROS */}
        <div className="bg-white rounded-b-[28px] shadow-xl border border-slate-200 p-5 space-y-4">
          <div>
            <label className="block text-[#0b1744] font-black mb-1">
              Tipo
            </label>

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full h-12 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700"
            >
              <option value="">Todos</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>

          <div>
            <label className="block text-[#0b1744] font-black mb-1">
              Pesquisar
            </label>

            <input
              type="text"
              placeholder="Nome, tipo, classificação ou ID"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full h-12 rounded-2xl border border-slate-300 px-4 font-bold text-slate-700"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={carregar}
              className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#2744b8] to-[#08748f] text-white font-black shadow-lg"
            >
              {loading ? "Carregando..." : "Pesquisar"}
            </button>

            <button
              onClick={() => navigate("/app/categorias/novo")}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#4c1d95] text-white text-2xl font-light shadow-lg"
              title="Nova categoria"
            >
              +
            </button>
          </div>
        </div>

        {/* LISTA */}
        <div className="bg-white rounded-[28px] shadow-xl border border-slate-200 p-5 mt-5">
          {listaFiltrada.length === 0 ? (
            <p className="text-sm text-slate-500 font-bold text-center py-4">
              Nenhuma categoria encontrada.
            </p>
          ) : (
            <div className="space-y-3">
              {listaFiltrada.map((l) => (
                <div
                  key={l.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-black text-slate-400">
                        ID {l.id}
                      </div>

                      <div className="text-base font-black text-[#0b1744] mt-1">
                        {l.nome}
                      </div>

                      <div
                        className={`text-sm font-black mt-1 ${
                          l.tipo === "entrada"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {l.tipo || "-"}
                      </div>

                      
                    </div>

                    <button
                      onClick={() => excluir(l.id)}
                      className="w-9 h-9 rounded-full bg-red-100 text-red-600 font-black text-lg"
                      title="Excluir"
                    >
                      ×
                    </button>
                  </div>

                 {/*} <button
                    onClick={() =>
                      navigate("/app/contasgerenciais/editar", { state: l })
                    }
                    className="mt-3 w-full h-10 rounded-full bg-blue-100 text-blue-700 font-black"
                  >
                    Editar
                  </button>*/}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}