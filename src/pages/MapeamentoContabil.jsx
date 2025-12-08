 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function MapeamentoContabil() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [lista, setLista] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [linhas, setLinhas] = useState([]);

  async function carregarModelos() {
    try {
      const url = buildWebhookUrl("modelos", { empresa_id });
      const r = await fetch(url);
      const j = await r.json();
      setLista(j);
    } catch (e) {
      console.log("Erro ao carregar modelos:", e);
    }
  }

 async function visualizar(id_modelo) {
  try {
    const url = buildWebhookUrl("modelos_linhas", {
      empresa_id,
      modelo_id: id_modelo,
    });

    const r = await fetch(url);
    const dados = await r.json();

    // garante que vai encontrar mesmo se id for string/number
    const modeloInfo = lista.find(
      (m) => String(m.id) === String(id_modelo)
    );

    setSelecionado({
      codigo: modeloInfo?.codigo || "",
      nome: modeloInfo?.nome || "",
    });

    setLinhas(dados);

  } catch (e) {
    console.log("Erro ao carregar linhas:", e);
  }
}



 async function Excluir(modelo_id) {
  
  if (!window.confirm("Tem certeza que deseja excluir este modelo?")) {
    return;
  }

  try {
    const url = buildWebhookUrl("excluirmodelo", {
      empresa_id:empresa_id,
      modelo_id,
    });

    const resp = await fetch(url, { method: "POST" });

    const texto = await resp.text();
    let json = null;

    try {
      json = JSON.parse(texto);
    } catch (e) {
      console.log("JSON inválido:", texto);
      alert("Erro inesperado no servidor.");
      return;
    }

    // quando webhook retorna array
    const item = Array.isArray(json) ? json[0] : json;

    // erro controlado pelo backend
    if (item?.ok === false) {
      alert(item.message || "Erro ao excluir.");
      return;
    }

    alert("Modelo excluído com sucesso!");

    // recarrega a lista
    carregarModelos();

  } catch (e) {
    console.log("ERRO REQUEST:", e);
    alert("Erro de comunicação com o servidor.");
  }
}











 function editar(m) {
  const empresa_id = localStorage.getItem("empresa_id") || "1";

  navigate("/edita-mapeamento", {
    state: {
      modelo_id: m.id,
      empresa_id: empresa_id ,
      token: m.codigo,   // <<< VOLTOU O QUE VOCÊ FALOU
      nome: m.nome,     
    }
  });
}




  useEffect(() => {
    carregarModelos();
  }, []);

  return (
    <div style={{ width: "100%", padding: 20 }}>

      {/* ============================================= */}
      {/*   BLOCO SUPERIOR IGUAL À SUA FIGURA           */}
      {/* ============================================= */}
      <div
        style={{
          width: "100%",
          background: "#2246c7ff",      // azul grande — igual da foto
          border: "4px solid #2464d2ff",
          borderRadius: 12,
          padding: 10,
          marginBottom: 30,
        }}
      >
        {/* Faixa amarela token/descrição */}


        
       {/* ============================================= */}
{/*   BLOCO SUPERIOR IGUAL À SUA FIGURA           */}
{/* ============================================= */}
     <div
  style={{
    width: "100%",
    background: "#f7f9ff", // azul MUITO claro (quase branco)
    border: "3px solid #bcd0ff", // borda azul clara
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  }}
>

  {/* QUADRO INTERNO BRANCO COM O BOTÃO */}
  <div
    style={{
      background: "#d7e2f3ff",
      border: "2px solid #1414d2ff",
      padding: 20,
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    {/* INFO TOKEN + MODELO */}
    <div>
      <h3 style={{ margin: 0 ,fontWeight: "bold", background: "##1414d2ff" }}>
        <b>Token:</b> {selecionado?.codigo}
      </h3>

      <h3 style={{ marginTop: 8 , fontWeight: "bold", background: "##1414d2ff" }}>
        <b>Nome do Modelo:</b> {selecionado?.nome}
      </h3>
    </div>

    {/* BOTÃO NOVO MODELO */}
    <button
     
       onClick={() => navigate("/novo-modelo")}
      style={{
        padding: "10px 22px",
        background: "#003ba2",
        color: "white",
        border: "none",
        borderRadius: 8,
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: 15,
        boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
      }}
    >
      + Novo Modelo
    </button>
  </div>

</div>


        {/* TABELA DE LINHAS DENTRO DO BLOCO AZUL */}
        {linhas.length > 0 && (
          <table  className="tabela tabela-mapeamento">
            <thead>
              <tr>
                <th>Conta ID</th>
                <th>Código</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Natureza</th>
                <th>D/C</th>
              </tr>
            </thead>

            <tbody>
              {linhas.map((l, i) => (
                <tr
                  key={i}
                  style={{
                    backgroundColor: i % 2 === 0 ? "#f2f2f2" : "#a59e9eff",       
                  }}
                >
                  <td>{l.conta_id}</td>
                  <td>{l.codigo}</td>
                  <td>{l.nome}</td>
                  <td>{l.tipo}</td>
                  <td>{l.natureza}</td>
                  <td>{l.dc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ============================================= */}
      {/*   PARTE DE BAIXO — LISTA DE MODELOS           */}
      {/* ============================================= */}
      <h2>Mapeamento Contábil</h2>

      <table  className="tabela tabela-mapeamento">
        <thead>
          <tr>
            <th>ID</th>
            <th>Token</th>
            <th>Descrição</th>
            <th>     Ações </th>
          </tr>
        </thead>

        <tbody>
          {lista.map((m, i) => (
            <tr
              key={m.id}
              style={{
                backgroundColor: i % 2 === 0 ? "#f2f2f2" : "#c6c5c4ff",
              }}     
            >
              <td>{m.id}</td>
              <td>{m.codigo}</td>
              <td>{m.nome}</td>

              <td style={{ display: "flex", gap: 12 }}>
               <button
                onClick={() =>
                  navigate("/editar-mapeamento", {
                    state: {
                      modelo_id: m.id,
                      empresa_id: empresa_id,
                      token: m.codigo,
                      nome: m.nome
                    }  
                  })
                }

                  style={{ color: "#1c09c6ff"  }}
              >
                Editar
              </button> 
                <button
                 className="tabela tabela-mapeamento"
                  onClick={() => visualizar(m.id)}
                  style={{ color: "#14953bff" }}
                >
                  Visualizar
                </button>
              
                <button
                 className="tabela tabela-mapeamento"
                  onClick={() => Excluir(m.id)}
                  style={{ color: "#c02525ff" }}
                >
                  Excluir
                </button>


              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
