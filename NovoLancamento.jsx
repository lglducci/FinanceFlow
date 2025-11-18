 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
console.log("🔥 CARREGOU A PÁGINA CORRETA");
export default function NovoLancamento() {
  const navigate = useNavigate();

  // 🔥 GARANTE ID_EMPRESA SEM ERRO
  const id_empresa = Number(localStorage.getItem("id_empresa")) || 1;

  const [tipo, setTipo] = useState("saida");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));

  const [contaId, setContaId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [origem, setOrigem] = useState("web");

  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [erroLoad, setErroLoad] = useState("");

  useEffect(() => {
    async function carregar() {
      try {

        const body = JSON.stringify({
          id_empresa,
          empresa_id: id_empresa
        });

        const resp1 = await fetch(
          "https://webhook.lglducci.com.br/webhook/listacontas",
          { method: "POST", headers: { "Content-Type": "application/json" }, body }
        );

        const resp2 = await fetch(
          "https://webhook.lglducci.com.br/webhook/listacategorias",
          { method: "POST", headers: { "Content-Type": "application/json" }, body }
        );

        const contasJson = await resp1.json();
        const categoriasJson = await resp2.json();

        setContas(contasJson || []);
        setCategorias(categoriasJson || []);

      } catch (err) {
        setErroLoad("Erro ao carregar contas/categorias.");
      }
    }

    carregar();
  }, [id_empresa]);

  async function handleSalvar(e) {
    e.preventDefault();

    if (!descricao || !valor || !data || !contaId || !categoriaId) {
      alert("Preencha tudo.");
      return;
    }

    const payload = {
      id_empresa,
      empresa_id: id_empresa,
      tipo,
      descricao,
      valor: Number(valor),
      data_movimento: data,
      conta_id: Number(contaId),
      categoria_id: Number(categoriaId),
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

    await resp.json();

    alert("Lançamento salvo!");
    navigate("/lancamentos");
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Novo lançamento</h2>

      {erroLoad && <div className="text-red-600">{erroLoad}</div>}

      <form onSubmit={handleSalvar} className="space-y-4">

        <div>
          <label>Conta</label>
          <select value={contaId} onChange={(e) => setContaId(e.target.value)}>
            <option value="">Selecione...</option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Categoria</label>
          <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
            <option value="">Selecione...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} ({c.tipo})
              </option>
            ))}
          </select>
        </div>

        <button className="bg-blue-600 text-white px-4 py-2">Salvar</button>
      </form>
    </div>
  );
}
