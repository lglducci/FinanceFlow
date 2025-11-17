 import { useState, useEffect } from "react";

export default function NovoLancamento({ setPage }) {
  const id_empresa = Number(localStorage.getItem("id_empresa") || 1);

  const [tipo, setTipo] = useState("saida");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));

  // ESTADO NOVO ↓↓↓↓↓
  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [contaId, setContaId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const [origem, setOrigem] = useState("web");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");


  // CARREGA CONTAS E CATEGORIAS NA ENTRADA DA TELA
  useEffect(() => {
    async function carregar() {
      try {
        // CONTAS
        const r1 = await fetch("https://webhook.lglducci.com.br/webhook/listacontas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_empresa })
        });
        const contasJson = await r1.json();
        setContas(contasJson);

        // CATEGORIAS
        const r2 = await fetch("https://webhook.lglducci.com.br/webhook/listacategorias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_empresa })
        });
        const categoriasJson = await r2.json();
        setCategorias(categoriasJson);

      } catch (err) {
        console.log(err);
        setErro("Erro ao carregar contas/categorias.");
      }
    }

    carregar();
  }, [id_empresa]);


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
        id_empresa,
        tipo,
        valor: Number(String(valor).replace(",", ".")),
        descricao,
        data_movimento: data,
        conta_id: contaId || null,
        categoria_id: categoriaId || null,
        origem
      };

      const resp = await fetch(
        "https://webhook.lglducci.com.br/webhook/novolancamento",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const dados = await resp.json();
      const lanc = Array.isArray(dados) ? dados[0] : dados;

      if (!lanc || !lanc.id) {
        setErro("Não foi possível confirmar o lançamento.");
      } else {
        setSucesso(`Lançamento #${lanc.id} salvo com sucesso.`);
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
        <button onClick={voltar} className="px-4 py-2 rounded-lg border text-sm font-semibold">
          Voltar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 max-w-xl">
        <form onSubmit={handleSalvar} className="space-y-4">

          {/* TIPO */}
          <div>
            <label className="text-sm font-semibold block mb-1">Tipo</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="entrada" checked={tipo === "entrada"} onChange={() => setTipo("entrada")} />
                Receita (entrada)
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="saida" checked={tipo === "saida"} onChange={() => setTipo("saida")} />
                Despesa (saída)
              </label>
            </div>
          </div>

          {/* DESCRIÇÃO */}
          <div>
            <label className="text-sm font-semibold block">Descrição</label>
            <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff]" />
          </div>

          {/* VALOR + DATA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block">Valor (R$)</label>
              <input type="number" value={valor} onChange={(e) => setValor(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff]" step="0.01" />
            </div>

            <div>
              <label className="text-sm font-semibold block">Data</label>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff]" />
            </div>
          </div>

          {/* CONTA */}
          <div>
            <label className="text-sm font-semibold block">Conta</label>
            <select value={contaId} onChange={(e) => setContaId(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff]">
              <option value="">Selecione...</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.tipo})
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORIA */}
          <div>
            <label className="text-sm font-semibold block">Categoria</label>
            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff]">
              <option value="">Selecione...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} — {c.tipo}
                </option>
              ))}
            </select>
          </div>

          {erro && <div className="text-red-600 text-center">{erro}</div>}
          {sucesso && <div className="text-green-600 text-center">{sucesso}</div>}

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={voltar} className="px-4 py-2 rounded-lg border">
              Cancelar
            </button>

            <button type="submit" disabled={salvando}
              className="px-4 py-2 rounded-lg bg-primary text-white">
              {salvando ? "Salvando..." : "Salvar lançamento"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
