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
      alert("Conta obrigatória.");
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

      setEditando(null);
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
    return (
      String(r.texto_busca || "").toLowerCase().includes(t) ||
      String(r.conta_descricao || "").toLowerCase().includes(t) ||
      String(r.tipo_movimento || "").toLowerCase().includes(t)
    );
  });

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

          <button onClick={() => navigate(-1)} className="btn-pill btn-black">
            ↩ Sair
          </button>
        </div>

        <input
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Pesquisar por histórico, conta ou tipo..."
          className="w-full border rounded-xl px-4 py-3 mb-4 font-semibold"
        />

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
            const emEdicao = editando === r.id;

            return (
              <div
                key={r.id}
                className="grid grid-cols-[80px_1.6fr_140px_2fr_100px_100px_150px] gap-2 p-2 border-b text-sm items-center hover:bg-slate-50"
              >
                <div className="font-bold">{r.id}</div>

                <input
                  disabled={!emEdicao}
                  value={r.texto_busca || ""}
                  onChange={(e) => alterarCampo(r.id, "texto_busca", e.target.value)}
                  className="border rounded-lg px-2 py-1 disabled:bg-transparent"
                />

                <select
                  disabled={!emEdicao}
                  value={r.tipo_movimento || ""}
                  onChange={(e) => alterarCampo(r.id, "tipo_movimento", e.target.value)}
                  className="border rounded-lg px-2 py-1 disabled:bg-transparent"
                >
                  <option value="">Ambos</option>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>

                <select
                  disabled={!emEdicao}
                  value={r.conta_id || ""}
                  onChange={(e) => alterarCampo(r.id, "conta_id", e.target.value)}
                  className="border rounded-lg px-2 py-1 disabled:bg-transparent"
                >
                  <option value="">Selecione</option>
                  {contas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo} - {c.nome}
                    </option>
                  ))}
                </select>

               { /*<input
                  disabled={!emEdicao}
                  type="number"
                  value={r.prioridade || 100}
                  onChange={(e) => alterarCampo(r.id, "prioridade", e.target.value)}
                  className="border rounded-lg px-2 py-1 disabled:bg-transparent"
                />*/}

                <input
                  disabled={!emEdicao}
                  type="checkbox"
                  checked={!!r.ativo}
                  onChange={(e) => alterarCampo(r.id, "ativo", e.target.checked)}
                  className="w-5 h-5"
                />

                <div className="flex gap-2">
                  {emEdicao ? (
                    <button
                      onClick={() => salvarRegra(r)}
                      disabled={salvando}
                      className="px-3 py-1 rounded-lg bg-green-600 text-white font-bold"
                    >
                      Salvar
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditando(r.id)}
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold"
                    >
                      Editar
                    </button>
                  )}

                  <button
                    onClick={() => excluirRegra(r.id)}
                    className="px-3 py-1 rounded-lg bg-red-600 text-white font-bold"
                  >
                    Excluir
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