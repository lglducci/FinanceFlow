 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function ContasContabeis() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");

  const [lista, setLista] = useState([]);
  const [filtro, setFiltro] = useState("");

  async function carregar() {
    try {
      const url = buildWebhookUrl("contascontabeis", {
        empresa_id:empresa_id,
        dc: "",
        id: 0,
      });

      const resp = await fetch(url);
      const dados = await resp.json();
      setLista(dados);
    } catch (e) {
      console.log("ERRO CARREGAR CONTAS:", e);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtradas = lista.filter(
    (c) =>
      c.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
      c.nome.toLowerCase().includes(filtro.toLowerCase())
  );




 async function excluirConta(id) {
  if (!window.confirm("Tem certeza que deseja excluir esta conta?")) return;

  try {
    const url = buildWebhookUrl("contascontabeis_excluir", {
      empresa_id,
      id
    });

    const resp = await fetch(url, { method: "POST" });

    // (Opcional) Checar retorno
    // const r = await resp.json();

    // Atualiza lista
    carregar();

  } catch (e) {
    console.log("ERRO AO EXCLUIR:", e);
    alert("Erro ao excluir conta.");
  }
}



  return (

   <div className="p-2">

     
    <div
      style={{
         background: "#445777",
        padding: 20,
        width: "100%", 
        margin: "0 auto",
        marginTop: 20,
        borderRadius: 12,
         border: "8px solid #061f4aff",
      }}
    >

      <h1 className="text-2xl font-bold mb-6 text-white">Contas Contábeis</h1>

      {/* 🔵 CARD DO TOPO */}
    <div
  style={{
    
    display: "flex",
    alignItems: "center",
    gap: "10px",   // 👈 CONTROLA O ESPAÇO ENTRE ELES
    marginBottom: 15 
  }}
>
        <h2 style={{ marginBottom: 10, fontWeight: "bold", fontSize: 15  }}  className="tabela tabela-mapeamento text-white" >Plano de Contas</h2>

  {/* 🔍 BUSCA */}
  <input
    placeholder="Buscar por código ou nome..."
    value={filtro}
    onChange={(e) => setFiltro(e.target.value)}
    style={{
      width: "300px",
      padding: "4px",
      border: "1px solid #f9f6f6",
      borderRadius: 8,
    }}
  />    

        {/* ➕ NOVA CONTA */}
        <button
          onClick={() => navigate("/nova-conta-contabil")}
          style={{
            padding: "8px 8px",
            background: "rgb(23, 106, 16)",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          + Nova Conta
        </button>
        <button
          onClick={() => window.print()}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          🖨️ Imprimir
        </button>

      </div>
 </div>

        <div id="print-area"> 

      {/* 🔵 TABELA EM OUTRO CARD */}
      <div
        style={{
          background: "white",
           padding: "8px 8px",
          border: "4px solid #6b7382ff",
           borderRadius: 12,
           marginTop: 20,
          padding: 15,
        }}
      >
        <table
          className="tabela"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "15px",
          }}
        >
          <thead>
              <tr style={{ background: "#002f7a", color: "white", textAlign: "left" }}>
              <th style={{ padding: 8 }}>ID</th>
              <th style={{ padding: 8 }}>Código</th>
              <th style={{ padding: 8 }}>Nome</th>
              <th style={{ padding: 8 }}>Tipo</th>
              <th style={{ padding: 8 }}>Natureza</th>
              <th style={{ padding: 8 }}>Nível</th>
              <th style={{ padding: 8 }}>Sistema</th>
              <th style={{ padding: 8, width: 140 }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtradas.map((c, idx) => (
              <tr
                key={c.id}
                style={{
                  background: idx % 2 === 0 ? "#f7f7f7" : "#adbbc9",
                  height: "38px",
                  fontWeight: "bold",
                }}
              >
                <td style={{ padding: 8 }}>{c.id}</td>
                <td style={{ padding: 8 }}>{c.codigo}</td>
                <td style={{ padding: 8 }}>{c.nome}</td>
                <td style={{ padding: 8 }}>{c.tipo}</td>
                <td style={{ padding: 8 }}>{c.natureza}</td>
                <td style={{ padding: 8 }}>{c.nivel}</td>
                <td style={{ padding: 8 }}>
                    {c.sistema ? "Sistema" : "Usuário"}
                    </td>



                <td style={{ padding: 8 }}>
                   {c.sistema ? (
                            <>
                              <span
                                style={{
                                  marginRight: 15,
                                  color: "#999",
                                  cursor: "not-allowed",
                                  textDecoration: "line-through",
                                }}
                                title="Conta do sistema — não pode ser editada"
                              >
                                Editar
                              </span>

                              <span
                                style={{
                                  color: "#999",
                                  cursor: "not-allowed",
                                  textDecoration: "line-through",
                                }}
                                title="Conta do sistema — não pode ser excluída"
                              >
                                Excluir
                              </span>
                            </>
                          ) : (
                            <>
                              <span
                                onClick={() =>
                                  navigate("/editar-conta-contabil", {
                                    state: {
                                      id: c.id,
                                      empresa_id: localStorage.getItem("empresa_id") || "1",
                                    },
                                  })
                                }
                                style={{
                                  marginRight: 15,
                                  color: "#0056d6",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                  textDecoration: "underline",
                                }}
                              >
                                Editar
                              </span>

                              <span
                                onClick={() => excluirConta(c.id)}
                                style={{
                                  color: "#c62828",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                  textDecoration: "underline",
                                }}
                              >
                                Excluir
                              </span>
                            </>
                          )}


                  </td>

              </tr>
            ))}
          </tbody>
        </table>

        
      
    </div>
    </div>
     </div>
  );
}
