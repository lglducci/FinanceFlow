import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { fetchSeguro } from "../utils/apiSafe";

export default function RegrasClassificacao() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id");

  const [regras, setRegras] = useState([]);
  const [contas, setContas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [editando, setEditando] = useState(null);
 const [salvando, setSalvando] = useState(false);

 const [buscaContaPorLinha, setBuscaContaPorLinha] = useState({});
const [dropdownContaAberto, setDropdownContaAberto] = useState(null);
 
  const [somenteNaoClassificados, setSomenteNaoClassificados] = useState(false);
const [mensagemSucesso, setMensagemSucesso] = useState("");


 
  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    await Promise.all([carregarRegras(), carregarContas()]);
  }

  async function carregarRegras() {
    const data = await fetchSeguro(buildWebhookUrl("regras_classificacao_listar"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa_id }),
    });

    const lista = Array.isArray(data) ? data : data?.data || [];
    setRegras(lista);
  }

  async function carregarContas() {
    const resp = await fetch(buildWebhookUrl("contas_contabeis_lancaveis", { empresa_id }));
    const data = await resp.json();
    setContas(Array.isArray(data) ? data : []);
  }

  function alterarCampo(id, campo, valor) {
    setRegras((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [campo]: valor } : r))
    );
  }

  async function salvarRegra(r) {
    if (!r.texto_busca?.trim()) {
      alert("Texto da regra obrigatório.");
      return;
    }

     if (!r.conta_id) {
  alert(`Conta obrigatória na regra ID ${r.id}.`);
  return;
}

    try {
      setSalvando(true);

      await fetchSeguro(buildWebhookUrl("regras_classificacao_atualizar"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: r.id,
          empresa_id,
          texto_busca: r.texto_busca,
          tipo_movimento: r.tipo_movimento || "",
          conta_id: Number(r.conta_id),
          ativo: !!r.ativo,
          prioridade: Number(r.prioridade || 100),
        }),
      });
     
     const contaSalva = contas.find((c) => Number(c.id) === Number(r.conta_id));

        setMensagemSucesso(
          `✅ Conta ${contaSalva?.codigo || ""} ${contaSalva?.nome || ""} salva com sucesso na regra ID ${r.id}`
        );
        
   window.dispatchEvent(new Event("contabil-atualizado"));
        setTimeout(() => setMensagemSucesso(""), 5000);




      await carregarRegras();
    } catch (e) {
      alert(e.message || "Erro ao salvar regra.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirRegra(id) {
    if (!confirm("Excluir esta regra?")) return;

    await fetchSeguro(buildWebhookUrl("regras_classificacao_excluir"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, empresa_id }),
    });

    await carregarRegras();
  }

   const filtradas = regras.filter((r) => {
  const t = filtro.toLowerCase();

  const passouPesquisa =
    String(r.texto_busca || "").toLowerCase().includes(t) ||
    String(r.conta_descricao || "").toLowerCase().includes(t) ||
    String(r.tipo_movimento || "").toLowerCase().includes(t);

  const naoClassificado =
    r.conta_id == null ||
    r.conta_id === "" ||
    String(r.conta_descricao || "").toLowerCase() === "pendente de conta";

  return passouPesquisa && (!somenteNaoClassificados || naoClassificado);
});

function textoConta(c) {
  return `${c.codigo || ""} - ${c.nome || ""}`;
}

function buscarContasProfundo(texto) {
  const t = String(texto || "").toLowerCase().trim();

  return contas
    .filter((c) => {
      const alvo = [
        c.codigo,
        c.nome,
        c.apelido,
        c.tipo,
        c.natureza,
        c.classificacao,
        c.grupo
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return alvo.includes(t);
    })
    .slice(0, 20);
}

async function aprenderHistoricos() {
  if (!confirm("Buscar novos históricos e criar regras pendentes?")) return;

  try {
    await fetchSeguro(buildWebhookUrl("aprender_historicos"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: Number(empresa_id),
      }),
    });

    alert("Históricos aprendidos com sucesso.");
    await carregarRegras();
  } catch (e) {
    alert(e.message || "Erro ao aprender históricos.");
  }
}
 
  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-8xl mx-auto bg-white rounded-3xl shadow-xl border p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              ⚙️ Regras de Classificação Contábil
            </h1>
            <p className="text-sm text-slate-500 font-bold">
              Históricos automáticos usados no Livro Caixa, Extrato e Cartões
            </p>
          </div>
           
           <div className="mr-4 max-w-xl rounded-2xl bg-blue-150 border border-blue-200 px-4 py-3 text-sm font-bold text-blue-800">
              Esta tela permite configurar regras automáticas de classificação contábil.
              O sistema usa o histórico importado para sugerir ou aplicar contas contábeis nas próximas conciliações.
            </div>
               


          <button
            onClick={aprenderHistoricos}
            className="px-4 py-3 rounded-xl bg-purple-700 text-white text-sm font-black shadow hover:bg-purple-800"
          >
            🧠 Aprender novos históricos
          </button>

          <button onClick={() => navigate(-1)} className="btn-pill btn-black">
            ↩ Sair
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Pesquisar por histórico, conta ou tipo..."
            className="w-[420px] border rounded-xl px-4 py-3 font-semibold"
          /> 
        
         <div className="flex items-center gap-12">
              <label className="flex items-center gap-12 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={somenteNaoClassificados}
                  onChange={(e) => setSomenteNaoClassificados(e.target.checked)}
                  className="w-4 h-4"
                />
                Não classificados
              </label>

              {mensagemSucesso && (
                <div className="text-green-500 font-bold italic text-sm">
                  {mensagemSucesso}
                </div>
              )}
            </div>

        </div>

        <div className="overflow-auto border rounded-2xl">
          <div className="grid grid-cols-[80px_1.6fr_140px_2fr_100px_100px_150px] gap-2 bg-slate-900 text-white font-bold text-sm p-2 sticky top-0">
            <div>ID</div>
            <div>Texto da regra</div>
            <div>Tipo</div>
            <div>Conta</div>
             
            <div>Ativo</div>
            <div>Ações</div>
          </div>

          {filtradas.map((r) => {
          //  const emEdicao = editando === r.id;

            return (
              <div
                key={r.id}
                className="grid grid-cols-[80px_1.6fr_140px_2fr_100px_100px_150px] gap-2 p-2 border-b text-sm items-center hover:bg-slate-50"
              >
                <div className="font-bold">{r.id}</div>

                <input
                  disabled={false}
                  value={r.texto_busca || ""}
                  onChange={(e) => alterarCampo(r.id, "texto_busca", e.target.value)}
                  className="border rounded-lg px-2 py-1 disabled:bg-transparent"
                />

                <select
                  disabled={false}
                  value={r.tipo_movimento || ""}
                  onChange={(e) => alterarCampo(r.id, "tipo_movimento", e.target.value)}
                  className="border rounded-lg px-2 py-1 disabled:bg-transparent"
                >
                  <option value="">Ambos</option>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>

                   <div  className="w-full min-w-[420px] border rounded-lg px-3 py-2 text-sm font-semibold">
                      <input
                         value={
                            buscaContaPorLinha[r.id] ??
                            (r.conta_id ? r.conta_descricao : "")
                          }
                        onChange={(e) => {
                          const valor = e.target.value;

                          setBuscaContaPorLinha((prev) => ({
                            ...prev,
                            [r.id]: valor,
                          }));

                          alterarCampo(r.id, "conta_id", "");
                          setDropdownContaAberto(r.id);
                        }}
                        onFocus={() => setDropdownContaAberto(r.id)}
                        placeholder="Pesquisar conta... Ex: Despesa"
                        className="w-full border rounded-lg px-2 py-1"
                      />

                      {dropdownContaAberto === r.id && (
                        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border bg-white shadow-xl">
                          {buscarContasProfundo(buscaContaPorLinha[r.id] ?? r.conta_descricao ?? "").map((c) => (
                            <button
                              key={c.id}
                              type="button"
                               onClick={async () => {
                                        const regraAtualizada = {
                                          ...r,
                                          conta_id: c.id,
                                          ativo: true,
                                        };

                                        alterarCampo(r.id, "conta_id", c.id);
                                        alterarCampo(r.id, "ativo", true);

                                        setBuscaContaPorLinha((prev) => ({
                                          ...prev,
                                          [r.id]: textoConta(c),
                                        }));

                                        setDropdownContaAberto(null);

                                        await salvarRegra(regraAtualizada);
                                      }} 
                              className="block w-full px-3 py-2 text-left text-sm font-semibold hover:bg-blue-50"
                            >
                              {textoConta(c)}
                            </button>
                          ))}

                          {buscarContasProfundo(buscaContaPorLinha[r.id] ?? r.conta_descricao ?? "").length === 0 && (
                            <div className="px-3 py-2 text-sm font-bold text-slate-400">
                              Nenhuma conta encontrada
                            </div>
                          )}
                        </div>
                      )}
                    </div>

               { /*<input
                  disabled={!emEdicao}
                  type="number"
                  value={r.prioridade || 100}
                  onChange={(e) => alterarCampo(r.id, "prioridade", e.target.value)}
                  className="border rounded-lg px-2 py-1 disabled:bg-transparent"
                />*/}

                <input
                  disabled={false}
                  type="checkbox"
                  checked={!!r.ativo}
                  onChange={(e) => alterarCampo(r.id, "ativo", e.target.checked)}
                  className="w-5 h-5"
                />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Salvar regra"
                          onClick={() => salvarRegra(r)}
                          disabled={salvando}
                          className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center justify-center shadow transition"
                        >
                          ✓
                        </button>

                        <button
                          type="button"
                          title="Excluir regra"
                          onClick={() => excluirRegra(r.id)}
                          className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow transition"
                        >
                          🗑
                        </button>
                      </div>
                
              </div>
            );
          })}
        </div>

        <div className="mt-3 text-sm font-bold text-slate-500">
          Total: {filtradas.length} regra(s)
        </div>
      </div>
    </div>
  );
}