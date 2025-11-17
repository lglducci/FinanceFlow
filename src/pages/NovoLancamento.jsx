 import { useState, useEffect } from "react";

export default function NovoLancamento({ setPage }) {
  const id_empresa = Number(localStorage.getItem("id_empresa") || 1);

  const [tipo, setTipo] = useState("saida");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));

  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [contaId, setContaId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const [origem, setOrigem] = useState("web");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // ================================
  // 🔥 CARREGA CONTAS E CATEGORIAS
  // ================================
  useEffect(() => {
    async function load() {
      try {
        const r1 = await fetch(
          "https://webhook.lglducci.com.br/webhook/listacontas",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_empresa }),
          }
        );
        const contasLista = await r1.json();
        setContas(contasLista);

        const r2 = await fetch(
          "https://webhook.lglducci.com.br/webhook/listacategorias",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_empresa }),
          }
        );
        const catLista = await r2.json();
        setCategorias(catLista);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  // =========================================
  // 🔥 SALVAR LANÇAMENTO
  // =========================================
  async function handleSalvar(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!descricao || !valor || !data || !contaId || !categoriaId) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    setSalvando(true);

    try {
      const payload = {
        id_empresa,
        empresa_id: id_empresa,
        tipo,
        valor: Number(String(valor).replace(",", ".")),
        descricao,
        data_movimento: data,
        conta_id: Number(contaId),
        categoria_id: Number(categoriaId),
        origem,
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
      const lanc = Array.isArray(dados) ? dados[0] : dados;

      if (!lanc || !lanc.id) {
        setErro("Erro ao salvar lançamento.");
      } else {
        setSucesso(`Lançamento #${lanc.id} salvo com sucesso!`);
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

  // ================================
  // RENDER
  // ================================
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
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff]"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          {/* Valor + Data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff]"
              />
            </div>

            <div>
              <label className="text-sm font-semibold block">Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff]"
              />
            </div>
          </div>

          {/* Conta */}
          <div>
            <label className="text-sm font-semibold block">Conta</label>
            <select
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff]"
              value={contaId}
              onChange={(e) => setContaId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.tipo})
                </option>
              ))}
            </select>
          </div>

          {/* Categoria */}
          <div>
            <label className="text-sm font-semibold block">Categoria</label>
            <select
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff]"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome} ({cat.tipo})
                </option>
              ))}
            </select>
          </div>

          {/* Erros / Sucesso */}
          {erro && <div className="text-red-600 text-sm">{erro}</div>}
          {sucesso && <div className="text-green-600 text-sm">{sucesso}</div>}

          {/* Botões */}
          <div className="flex justify-end gap-3">
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
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm"
            >
              {salvando ? "Salvando..." : "Salvar lançamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
