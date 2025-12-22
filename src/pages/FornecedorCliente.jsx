 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function FornecedorCliente() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

  const [lista, setLista] = useState([]);
  const [tipo, setTipo] = useState("fornecedor");
  const [carregando, setCarregando] = useState(false);
 const [filtro, setFiltro] = useState("");
 const btnPadrao = "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";

 const listaFiltrada = lista.filter((c) =>
  c.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
  c.cpf_cnpj?.toLowerCase().includes(filtro.toLowerCase()) ||   
  c.telefone?.toLowerCase().includes(filtro.toLowerCase()) || 
  String(c.id).includes(filtro)
);


  async function carregar() {
    try {
      setCarregando(true);

      const url = buildWebhookUrl("fornecedorcliente", {
        empresa_id,
        tipo,
      });

      const resp = await fetch(url);
      const texto = await resp.text();

      let json = [];
      try {
        json = JSON.parse(texto);
      } catch {
        json = [];
        console.log("JSON inválido:", texto);
      }

      setLista(Array.isArray(json) ? json : []);
    } catch (e) {
      alert("Erro ao carregar dados.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [tipo]);

  function novo() {
    navigate("/new-provider-client");
  }

  function editar(id) {
    navigate(`/edit-fornecedorcliente/${id}`);
  }

  async function excluirFornecedorCliente(id) {
    if (!confirm("Deseja excluir este registro?")) return;

    try {
      const url = buildWebhookUrl("excluirfornecedorcliente");

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, empresa_id }),
      });

      const texto = await resp.text();
      let json = {};
      try {
        json = JSON.parse(texto);
      } catch {}

      if (texto.includes("foreign") || texto.includes("violates")) {
        alert("Não é possível excluir: possui movimentações.");
        return;
      }

      alert(json.message || "Excluído com sucesso!");

      setLista((p) => p.filter((x) => x.id !== id));
      carregar();
    } catch (e) {
      alert("Erro ao excluir.");
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Fornecedores / Clientes</h2>

      {/* FILTRO */}
       
       <div className="bg-gray-50 p-5 rounded-xl shadow border border flex items-end border-[10px] border-blue-800  gap-6 mb-10 max-w-[100%]"> 
        <div>
          <label className="text-base font-bold block mb-1 text-[#1e40af]">Tipo</label>
          <select
            className="border font-bold rounded-lg px-3 py-2 w-48 text-base border-yellow-500"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >   
            <option value="fornecedor">Fornecedor</option>
            <option value="cliente">Cliente</option> 
             <option value="ambos">Ambos</option>
          </select>
        </div>
       
          <div>
          <label  className="block font-bold text-[#1e40af]" > Pesquisa - Nome ou CNPJ </label>
        <input
            type="text"
            placeholder="Buscar por nome, tipo, grupo..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)} 
             className="border rounded-xl  px-4 py-2  border-yellow-500 w-[620px]"
          />
           </div>
       

        <button
          onClick={carregar}
          className={ `${btnPadrao} bg-blue-600 hover:bg-blue-700`}
                                
        >
          {carregando ? "Carregando..." : "Pesquisar"}
        </button>

        <button
          onClick={novo}
          className={ `${btnPadrao} bg-green-600  hover:green-600`}
        >
          Novo
        </button>
      </div>

      {/* LISTAGEM EM TABELA (FIGURA 2) */}
      <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
        <table className="w-full text-base border-collapse">
          <thead>
            <tr className="bg-blue-300 text-left font-bold text-lg">
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">Tipo</th>
              <th className="p-2 border">Documento</th>
              <th className="p-2 border">Telefone</th>
              <th className="p-2 border text-center">Ações</th>
            </tr>
          </thead>

          <tbody>
             
            {listaFiltrada.map((c, i) => {
              const tipoColor =
                c.tipo?.toLowerCase() === "fornecedor"
                  ? "text-red-700 font-bold"
                  : "text-green-700 font-bold";

              return (
                <tr
                  key={c.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}
                >
                  <td className="p-2 border font-semibold">{c.nome}</td>

                  <td className={`p-2 border ${tipoColor}`}>
                    {c.tipo.charAt(0).toUpperCase() + c.tipo.slice(1)}
                  </td>

                  <td className="p-2 border">{c.cpf_cnpj}</td>

                  <td className="p-2 border">{c.telefone}</td>

                  <td className="p-4 border text-center">
                  <div className="flex justify-center items-center gap-6">
                    <button
                      onClick={() => editar(c.id)}
                      className="text-blue-700 font-bold"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => excluirFornecedorCliente(c.id)}
                      className="text-red-700 font-bold"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
