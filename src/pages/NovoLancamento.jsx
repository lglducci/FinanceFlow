import { useState } from "react";

export default function NovoLancamento({ setPage }) {
  const id_empresa = Number(localStorage.getItem("id_empresa") || 1);

  const [tipo, setTipo] = useState("saida"); // "entrada" ou "saida"
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
  const [contaId, setContaId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [origem, setOrigem] = useState("web");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function handleSalvar(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!descricao || !valor || !data) {
      setErro("Preencha descrição, valor e data.");
      return;
    }

    setSalvando(true);

    try {
      const payload = {
        // mando os dois nomes pra não ter erro de compatibilidade
        id_empresa,
        empresa_id: id_empresa,
        tipo, // "entrada" ou "saida"
        valor: Number(String(valor).replace(",", ".")),
        descricao,
        data_movimento: data, // backend pode ajustar pra date
        conta_id: contaId || null,
        categoria_id: categoriaId || null,
        origem: origem || "web",
      };

      const resp = await fetch(
        "https://webhook.lglducci.com.br/webhook/novolancamento",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const dados = await resp.json();

      // Esperando algo tipo: [ { id, empresa_id, conta_id, ... } ]
      const lanc = Array.isArray(dados) ? dados[0] : dados;

      if (!lanc || !lanc.id) {
        setErro("Não foi possível confirmar o lançamento.");
      } else {
        setSucesso(
          `Lançamento #${lanc.id} salvo com sucesso (${lanc.tipo} - R$ ${lanc.valor}).`
        );
      }
    } catch (err) {
      console.error(err);
      setErro("Erro ao salvar lançamento.");
    }

    setSalvando(false);
  }

  function voltar() {
    setPage("transactions");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Novo lançamento</h2>

        <button
          onClick={voltar}
          className="px-4 py-2 rounded-lg border text-sm font-semibold"
        >
          Voltar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 max-w-xl">
        <form onSubmit={handleSalvar} className="space-y-4">
          {/* Tipo */}
          <div>
            <label className="text-sm font-semibold block mb-1">Tipo</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value="entrada"
                  checked={tipo === "entrada"}
                  onChange={() => setTipo("entrada")}
                />
                Receita (entrada)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value="saida"
                  checked={tipo === "saida"}
                  onChange={() => setTipo("saida")}
                />
                Despesa (saída)
              </label>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-semibold block">Descrição</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff] focus:outline-none focus:ring-2 focus:ring-primary"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex.: 100 reais no posto do carlin"
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff] focus:outline-none focus:ring-2 focus:ring-primary"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold block">Data</label>
              <input
                type="date"
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff] focus:outline-none focus:ring-2 focus:ring-primary"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
          </div>

          {/* Conta e Categoria (ID por enquanto) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block">Conta (ID)</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff] focus:outline-none focus:ring-2 focus:ring-primary"
                value={contaId}
                onChange={(e) => setContaId(e.target.value)}
                placeholder="Ex.: 1"
              />
            </div>

            <div>
              <label className="text-sm font-semibold block">
                Categoria (ID)
              </label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff] focus:outline-none focus:ring-2 focus:ring-primary"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                placeholder="Ex.: 27"
              />
            </div>
          </div>

          {/* Origem */}
          <div>
            <label className="text-sm font-semibold block">Origem</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff] focus:outline-none focus:ring-2 focus:ring-primary"
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              placeholder='Ex.: "web", "zap"'
            />
          </div>

          {erro && (
            <div className="text-red-600 text-sm text-center">{erro}</div>
          )}
          {sucesso && (
            <div className="text-green-600 text-sm text-center">{sucesso}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={voltar}
              className="px-4 py-2 rounded-lg border text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primaryDark disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar lançamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
