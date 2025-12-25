 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function Diario() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || "1";

     const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

   const btnPadrao =
  "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";

  // 👉 DATA HOJE (usa global se existir, senão fallback local)
  const hoje = typeof dataHoje === "function"
    ? dataHoje()
    : new Date().toISOString().split("T")[0];

  const [lista, setLista] = useState([]);

  const [filtros, setFiltros] = useState({
    data_ini: hoje,
    data_fim: hoje,
    modelo: "",
    busca: "",
  });
async function carregar() {
  // 🔥 LIMPA A LISTA ANTES DE BUSCAR
  setLista([]);

  try {
    const url = buildWebhookUrl("consulta_diario", {
      empresa_id,
      data_ini: filtros.data_ini,
      data_fim: filtros.data_fim,
      modelo_codigo: filtros.modelo,
      busca: filtros.busca,
    });

    const r = await fetch(url);
    const dados = await r.json();

    // 🔒 GARANTE ARRAY
    setLista(Array.isArray(dados) ? dados : []);
  } catch (e) {
    console.error("Erro ao carregar diário", e);
    setLista([]); // segurança
  }
}

 

  // 👉 FORMATA DATA DA TABELA (remove horário)
  const formatarData = (d) => {
    if (!d) return "";
    const dt = d.split("T")[0]; // só AAAA-MM-DD
    const [ano, mes, dia] = dt.split("-");
    return `${dia}/${mes}/${ano}`;
  };

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

        {/* CARD BRANCO */}
        <div
          style={{
            background: "white",
            padding: 20,
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* LINHA 1 — DATA INICIAL / FINAL / TOKEN */}
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label className="font-bold text-[#1e40af]">Data Inicial</label>
              <input
                type="date"
                className="border rounded-lg px-3 py-2 border-yellow-500"
                value={filtros.data_ini}
                onChange={(e) =>
                  setFiltros({ ...filtros, data_ini: e.target.value })
                }
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label className="font-bold text-[#1e40af]">Data Final</label>
              <input
                type="date"
                className="border rounded-lg px-3 py-2 border-yellow-500"
                value={filtros.data_fim}
                onChange={(e) =>
                  setFiltros({ ...filtros, data_fim: e.target.value })
                }
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <label className="font-bold text-[#1e40af]">Token / Modelo</label>
              <input
                type="text"
                className="border rounded-lg px-3 py-2 border-yellow-500"
                value={filtros.modelo}
                onChange={(e) =>
                  setFiltros({ ...filtros, modelo: e.target.value })
                }
                placeholder="VENDA_BEBIDA, etc"
              />
            </div>
          </div>

          {/* LINHA 2 — BUSCAR */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: 5 }}>
            <label className="font-bold text-[#1e40af]">Buscar</label>
            <input
              type="text"
              className="border rounded-lg px-3 py-2 border-yellow-500"
              value={filtros.busca}
              onChange={(e) =>
                setFiltros({ ...filtros, busca: e.target.value })
              }
              placeholder="Histórico / Documento / Parceiro"
            />
          </div>

          {/* LINHA 3 — BOTÕES */}
          <div style={{ display: "flex", gap: 15, marginTop: 10 }}>
            <button
             className= { `${btnPadrao} bg-blue-900 hover:bg-blue-700 px-4 py-2 `}
              onClick={carregar}
            >
              Filtrar
            </button>

            <button
              onClick={() => navigate("/novo-diario")}
                className= { `${btnPadrao} bg-green-700 hover:bg-green-700 px-4 py-2 `}
            >
              + Novo
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
        <table className="tabela tabela-mapeamento" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#003ba2", color: "white" }}>
              <th>ID</th>
              <th>Data</th>
              <th>Token</th>
              <th>Histórico</th>
              <th>Doc</th>
              <th>Parceiro</th>
              <th>Valor</th>
             {/*   <th>Parcelado</th>
              <th> Nro Parcela</th>
               <th>Parcela Atual</th>*/}
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
                <td>{formatarData(l.data_mov)}</td>
                <td>{l.modelo_codigo}</td>
                <td>{l.historico}</td>
                <td>{l.doc_ref}</td>
                <td>{l.parceiro}</td>
                <td>{fmt.format(l.valor_total)}</td>
               {/*} <td>{l.parcelado ? "Sim" : "Não"}</td> 
                <td>{l.numero_parcelas}</td>
                   <td>{l.parcela_atual}</td>*/}
                <td style={{ display: "flex", gap: "28px" }} >
                  <button
                    onClick={() => 
                      navigate("/editar-diario", { state: { id: l.id } })
                    }
                    style={{ marginRight: 10 }}
                  >
                    Editar
                  </button>

                  <button style={{ color: "red" }}
                  >Excluir
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
