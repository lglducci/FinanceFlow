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
  <div className="p-4 space-y-6">

    {/* HEADER */}
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-xl font-bold text-blue-800">
          Fornecedores / Clientes
        </h1>
        <p className="text-sm text-gray-500">
          Gerencie fornecedores e clientes da empresa.
        </p>
      </div>
      <button
        onClick={novo}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        + Novo
      </button>
    </div>

    {/* FILTROS */}
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">

        {/* TIPO */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tipo
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="fornecedor">Fornecedor</option>
            <option value="cliente">Cliente</option>
            <option value="ambos">Ambos</option>
          </select>
        </div>

        {/* PESQUISA */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Pesquisar
          </label>
          <input
            type="text"
            placeholder="Nome, documento, telefone ou ID"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={carregar}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {carregando ? "Carregando..." : "Pesquisar"}
        </button>
      </div>
    </div>

    {/* TABELA */}
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-3 py-2 text-left">Nome</th>
            <th className="px-3 py-2 text-left">Tipo</th>
            <th className="px-3 py-2 text-left">Documento</th>
            <th className="px-3 py-2 text-left">Telefone</th>
            <th className="px-3 py-2 text-center">Ações</th>
          </tr>
        </thead>

        <tbody>
          {listaFiltrada.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-6 text-gray-500">
                Nenhum registro encontrado.
              </td>
            </tr>
          )}

          {listaFiltrada.map((c, i) => {
            const tipoClasse =
              c.tipo?.toLowerCase() === "fornecedor"
                ? "text-red-600"
                : c.tipo?.toLowerCase() === "cliente"
                ? "text-emerald-600"
                : "text-slate-700";

            return (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2 font-medium">{c.nome}</td>

                <td className={`px-3 py-2 font-semibold ${tipoClasse}`}>
                  {c.tipo}
                </td>

                <td className="px-3 py-2">{c.cpf_cnpj}</td>
                <td className="px-3 py-2">{c.telefone}</td>

                <td className="px-3 py-2 text-center space-x-4">
                  <button
                    onClick={() => editar(c.id)}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => excluirFornecedorCliente(c.id)}
                    className="text-red-600 hover:underline font-semibold"
                  >
                    Excluir
                  </button>
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
