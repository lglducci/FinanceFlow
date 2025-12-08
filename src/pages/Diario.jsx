import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function Diario() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [lista, setLista] = useState([]);
  const [filtros, setFiltros] = useState({
    data_ini: "",
    data_fim: "",
    modelo: "",
    busca: "",
  });

  async function carregar() {
    const url = buildWebhookUrl("consulta_diario", {
      empresa_id,
      data_ini: filtros.data_ini || "",
      data_fim: filtros.data_fim || "",
      modelo_codigo: filtros.modelo || "",
      busca: filtros.busca || "",
    });

    const r = await fetch(url);
    const dados = await r.json();
    setLista(dados);
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div style={{ width: "100%", padding: 20 }}>

      {/* CABEÇALHO AZUL */}
      <div
        style={{
          background: "#003ba2",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <h2 style={{ color: "white", marginBottom: 10 }}>Diário Contábil</h2>

        {/* FILTROS */}
        <div style={{ background: "white", padding: 15, borderRadius: 10 }}>
          <div style={{ display: "flex", gap: 15, marginBottom: 10 }}>
            <div>
              <label className="text-base font-bold text-[#1e40af]"> Data Inicial </label>
              <input
                type="date"
                className="border rounded-lg px-3 py-2 w-40 mt-1 border-yellow-500"
                value={filtros.data_ini}
                onChange={(e) =>
                  setFiltros({ ...filtros, data_ini: e.target.value })
                    
                }
              />
            </div>

            <div>
              <label className="text-base font-bold text-[#1e40af]"> Data Final </label>
              <input
                type="date"
                className="border rounded-lg px-3 py-2 w-40 mt-1 border-yellow-500"
                value={filtros.data_fim}
                onChange={(e) =>
                  setFiltros({ ...filtros, data_fim: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-base font-bold text-[#1e40af]"> Token - Modelo </label>
              <input
                type="text"
                className="border rounded-lg px-3 py-2 w-40 mt-1 border-yellow-500"
                value={filtros.modelo}
                onChange={(e) =>
                  setFiltros({ ...filtros, modelo: e.target.value })
                }
                placeholder="VENDA_BEBIDA, etc"
              />
            </div>

            <div style={{ flex: 1 }}>
              <label className="text-base font-bold text-[#1e40af]">  Buscar </label>
              <input
                type="text"
                className="border rounded-lg px-3 py-2 w-40 mt-1 border-yellow-500"
                value={filtros.busca}
                onChange={(e) =>
                  setFiltros({ ...filtros, busca: e.target.value })
                }
                placeholder="Histórico / Documento"
                style={{ width: "100%" }}
              />
            </div>

            <button
              style={{
                padding: "8px 20px",
                background: "#003ba2",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                marginTop: 18,
              }}
              onClick={carregar}
            >
              Filtrar
            </button>

            <button
              onClick={() => navigate("/novo-diario")}
              style={{
                padding: "8px 20px",
                background: "green",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                marginTop: 18,
              }}
            >
              + Novo
            </button>

            <button
              onClick={() => alert("IMPORTAR (em construção)")}
              style={{
                padding: "8px 20px",
                background: "#444",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                marginTop: 18,
              }}
            >
              Importar
            </button>
          </div>
        </div>
      </div>

      {/* LISTA */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
          border: "3px solid #003ba2",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#003ba2", color: "white" }}>
              <th>ID</th>
              <th>Data</th>
              <th>Token</th>
              <th>Histórico</th>
              <th>Doc</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {lista.map((l, i) => (
              <tr
                key={l.id}
                style={{
                  background: i % 2 === 0 ? "#f4f4f4" : "#e0e0e0",
                  height: 36,
                }}
              >
                <td>{l.id}</td>
                <td>{l.data_mov}</td>
                <td>{l.modelo_codigo}</td>
                <td>{l.historico}</td>
                <td>{l.doc_ref}</td>
                <td>{Number(l.valor_total).toFixed(2)}</td>
                <td>
                  <button
                    onClick={() =>
                      navigate("/editar-diario", { state: { id: l.id } })
                    }
                    style={{ marginRight: 10 }}
                  >
                    Editar
                  </button>

                  <button style={{ color: "red" }}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
