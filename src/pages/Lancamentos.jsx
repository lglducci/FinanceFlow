 
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();

export default function Lancamentos({ setPage }) {
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [lista, setLista] = useState([]);

  const id_empresa = localStorage.getItem("id_empresa") || 1;

  async function pesquisar() {
  if (!dataIni || !dataFim) {
    alert("Informe data inicial e final.");
    return;
  }

  setCarregando(true);

  try {
    const url = `https://webhook.lglducci.com.br/webhook/listalancamentos?id_empresa=${id_empresa}&data_ini=${dataIni}&data_fim=${dataFim}`;
  
    const resp = await fetch(url); // GET simples
    const dados = await resp.json();

    const tratados = dados.map((l) => ({
      id: l.id,
      descricao: l.descricao,
      tipo: l.tipo === "entrada" ? "Entrada" : "Saída",
      categoria_id: l.categoria_id,
      valor: Number(l.valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      data: new Date(l.data_movimento).toLocaleDateString("pt-BR"),
      origem: l.origem || "-",
    }));

    setLista(tratados);
  } catch (e) {
    console.error(e);
    alert("Erro ao consultar lançamentos.");
  }

  setCarregando(false);
}

  function abrirNovoLancamento() {
  navigate("/new-transaction");
}

  

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Lançamentos</h2>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow flex items-end gap-4 mb-6">
        <div>
          <label className="text-sm font-semibold">Data início</label>
          <input
            type="date"
            value={dataIni}
            onChange={(e) => setDataIni(e.target.value)}
            className="border rounded-lg px-3 py-2 w-40"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Data fim</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="border rounded-lg px-3 py-2 w-40"
          />
        </div>

        <button
          onClick={pesquisar}
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold"
        >
          {carregando ? "Carregando..." : "Pesquisar"}
        </button>

        <button
          onClick={abrirNovoLancamento}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Novo lançamento
        </button>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow p-4">
        {lista.length === 0 ? (
          <p className="text-gray-600 text-sm">Nenhum lançamento encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">ID</th>
                <th className="text-left py-2">Descrição</th>
                <th className="text-left py-2">Tipo</th>
                <th className="text-left py-2">Categoria</th>
                <th className="text-left py-2">Valor</th>
                <th className="text-left py-2">Data</th>
                <th className="text-left py-2">Origem</th>
              </tr>
            </thead>

            <tbody>
              {lista.map((l) => (
                <tr key={l.id} className="border-b">
                  <td className="py-2">{l.id}</td>
                  <td>{l.descricao}</td>
                  <td>{l.tipo}</td>
                  <td>{l.categoria_id}</td>
                  <td>{l.valor}</td>
                  <td>{l.data}</td>
                  <td>{l.origem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
