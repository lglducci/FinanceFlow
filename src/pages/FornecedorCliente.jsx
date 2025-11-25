import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function FornecedorCliente() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

  const [lista, setLista] = useState([]);
  const [tipo, setTipo] = useState("fornecedor"); // fornecedor | cliente | ambos
  const [carregando, setCarregando] = useState(false);

  // =============================
  // CARREGAR LISTA
  // =============================
  async function carregar() {
    try {
      setCarregando(true);

      const url = buildWebhookUrl("fornecedorcliente", {
        empresa_id,
        tipo,
      });

      const resp = await fetch(url, { method: "GET" });

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
      console.error("Erro ao carregar fornecedor/cliente:", e);
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
  if (!confirm("Tem certeza que deseja excluir este fornecedor/cliente?")) return;

  try {
    const url = buildWebhookUrl("excluirfornecedorcliente");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: Number(id),
        empresa_id: Number(empresa_id),
      }),
    });

    const texto = await resp.text();
    let json = {};

    try {
      json = texto ? JSON.parse(texto) : {};
    } catch (e) {
      console.log("Resposta não JSON:", texto);
    }

    // =============================
    // ⚠️ TRATAMENTO DE FK (igual cartão)
    // =============================
    if (
      texto.includes("foreign key") ||
      texto.includes("violates") ||
      texto.toLowerCase().includes("não é possível") ||
      texto.toLowerCase().includes("movimenta") ||
      json?.message?.toLowerCase?.().includes("não é possível excluir")
    ) {
      alert("Não é possível excluir: este registro possui lançamentos/movimentações.");
      return;
    }

    // =============================
    // SUCESSO
    // =============================
    alert(json?.message || "Registro excluído com sucesso!");

    // Remove da tela imediatamente
    setLista(prev => prev.filter(item => item.id !== id));

    // Recarrega via webhook
    carregar();

  } catch (e) {
    console.error("Erro excluir fornecedor/cliente:", e);
    alert("Erro ao excluir registro.");
  }
}





  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Fornecedores / Clientes</h2>

      {/* FILTROS */}
      <div className="bg-white p-5 rounded-xl shadow flex items-end gap-6 mb-6 max-w-[80%]"> 
      
        <div>
          <label className="text-sm font-semibold block mb-1">Tipo</label>
          <select
            className="border rounded-lg px-3 py-2 w-48 text-base"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="fornecedor">Fornecedor</option>
            <option value="cliente">Cliente</option>
            <option value="ambos">Ambos</option>
          </select>
        </div>

        <button
          onClick={carregar}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm"
        >
          {carregando ? "Carregando..." : "Pesquisar"}
        </button>

        <button
          onClick={novo}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
        >
          Novo
        </button>
      </div>

      {/* DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {lista.length === 0 ? (
          <p className="text-gray-600 text-sm col-span-3">
            Nenhum registro encontrado.
          </p>
        ) : (
          lista.map((c, i) => (
                        <div
                key={c.id}
                className="
                  rounded-xl 
                  shadow 
                  p-5 
                  border 
                  border-[#3862b7] 
                  border-l-4
                  bg-[#f5f8ff]
                  max-w-xl
                "
              >

              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-800">
                  {c.nome}
                </h3>

                <button
                  onClick={() => editar(c.id)}
                  className="text-blue-600 text-sm font-semibold"
                >
                  Editar
                </button>
              </div>

              <div className="text-right mt-3">
                <button
                  onClick={() => excluirFornecedorCliente(c.id)}
                  className="text-red-600 text-sm font-semibold hover:underline"
                >
                  Excluir
                </button>
              </div>




              <div className="text-sm text-gray-700 leading-6">
                <p><strong>Tipo:</strong> {c.tipo}</p>

                {c.cpf_cnpj && (
                  <p><strong>CPF/CNPJ:</strong> {c.cpf_cnpj}</p>
                )}

                {c.telefone && (
                  <p><strong>Telefone:</strong> {c.telefone}</p>
                )}

                {c.whatsapp && (
                  <p><strong>WhatsApp:</strong> {c.whatsapp}</p>
                )}

                {c.email && (
                  <p><strong>Email:</strong> {c.email}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
