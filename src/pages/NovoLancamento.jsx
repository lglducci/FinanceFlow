 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const URL_NOVO_LANC = "https://webhook.lglducci.com.br/webhook/novolancamento";
const URL_CONTAS = "https://webhook.lglducci.com.br/webhook/listacontas";
const URL_CATEGORIAS = "https://webhook.lglducci.com.br/webhook/listacategorias";

export default function NovoLancamento() {
  const navigate = useNavigate();

  const id_empresa = Number(localStorage.getItem("id_empresa") || 1);

  const [tipo, setTipo] = useState("saida");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [contaId, setContaId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [origem, setOrigem] = useState("web");

  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [erroLoad, setErroLoad] = useState("");

 useEffect(() => {
  async function carregarContasECategorias() {
    try {
      const [respContas, respCats] = await Promise.all([
        fetch("https://webhook.lglducci.com.br/webhook/listacontas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_empresa, empresa_id: id_empresa }),
        }),
        fetch("https://webhook.lglducci.com.br/webhook/listacategorias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_empresa, empresa_id: id_empresa }),
        }),
      ]);

      const contasJson = await respContas.json();
      const categoriasJson = await respCats.json();

      // CORRETO AGORA
      setContas(contasJson);
      setCategorias(categoriasJson);

      setErroLoad("");
    } catch (e) {
      setErroLoad("Erro ao carregar contas/categorias.");
    }
  }

  carregarContasECategorias();
}, [id_empresa]);


  // 🔥 SALVAR LANÇAMENTO
  async function handleSalvar(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!descricao || !valor || !data) {
      setErro("Preencha descrição, valor e data.");
      return;
    }

    if (!contaId || !categoriaId) {
      setErro("Selecione conta e categoria.");
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
        conta_id: Number(contaId),
        categoria_id: Number(categoriaId),
        origem,
      };

      const resp = await fetch(URL_NOVO_LANC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const dados = await resp.json();
      const lanc = Array.isArray(dados) ? dados[0] : dados;

      if (!lanc?.id) {
        setErro("Não foi possível confirmar o lançamento.");
      } else {
        setSucesso(`Lançamento #${lanc.id} salvo com sucesso!`);
      }
    } catch (err) {
      console.error(err);
      setErro("Erro ao salvar lançamento.");
    }

    setSalvando(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Novo lançamento</h2>
        <button onClick={() => navigate("/transactions")} className="px-4 py-2 rounded-lg border text-sm font-semibold">
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
                <input type="radio" value="entrada" checked={tipo === "entrada"} onChange={() => setTipo("entrada")} />
                Receita (entrada)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="saida" checked={tipo === "saida"} onChange={() => setTipo("saida")} />
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

          {/* Valor/Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff]"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold block">Data</label>
              <input
                type="date"
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff]"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
          </div>

          {/* Conta / Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

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
          </div>

          {/* Origem */}
          <div>
            <label className="text-sm font-semibold block">Origem</label>
            <input
              type="text"
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff]"
            />
          </div>

          {erroLoad && <div className="text-red-600 text-sm">{erroLoad}</div>}
          {erro && <div className="text-red-600 text-sm">{erro}</div>}
          {sucesso && <div className="text-green-600 text-sm">{sucesso}</div>}

          <div className="flex justify-end gap-3">
            <button type="submit" disabled={salvando} className="px-4 py-2 rounded-lg bg-primary text-white">
              {salvando ? "Salvando..." : "Salvar lançamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
