 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function MapeamentoContabil() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [lista, setLista] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [linhas, setLinhas] = useState([]);

const [filtro, setFiltro] = useState("");
 
 
 // const contaGerencialId = state?.conta_gerencial_id;

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
      tipo: modeloInfo?.tipo_automacao || "",
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



  const filtrados = lista.filter((m) =>
  m.codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
  m.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
  m.tipo_automacao?.toLowerCase().includes(filtro.toLowerCase())
);

  return (
    <div style={{ width: "100%", padding: 20 }}>
     
          <h2   style={{
        padding: 2,
        width: "55%",
        maxWidth: 1250, 
        marginTop: 10,
      }} className="text-xl font-bold mb-4 text-[#1d1d93ff]"> Modelo Contábil</h2>
    

      {/* ============================================= */}
      {/*   BLOCO SUPERIOR IGUAL À SUA FIGURA           */}
      {/* ============================================= */}
      <div
        style={{
          width: "90%",
          background: "#f7f7f7ff",      // azul grande — igual da foto
          border: "4px solid #1d1d93ff",
          borderRadius: 12,
          padding: 4,
          marginBottom: 16,
        }}
      >
        {/* Faixa amarela token/descrição */}

     
        
       {/* ============================================= */}
{/*   BLOCO SUPERIOR IGUAL À SUA FIGURA           */}
{/* ============================================= */}
     <div
  style={{
    width: "83%",
    background: "#f7f9ff", // azul MUITO claro (quase branco)
    border: "4px solid #eff1f7ff", // borda azul clara
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  }}
>

  {/* QUADRO INTERNO BRANCO COM O BOTÃO */}
  <div
    style={{
      background: "#b7d5f0ff",
      border: "4px solid #1d1d93ff",
      padding: 10,
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

       <h3 style={{ marginTop: 16 , fontWeight: "bold", background: "##1414d2ff" }}>
        <b>Tipo Automação:</b> {selecionado?.tipo}
      </h3>

    </div>

    {/* BOTÃO NOVO MODELO */}
    <button
     
       onClick={() => navigate("/novo-modelo")}
      style={{
        padding: "8px 22px",
        background: "#1414d2ff",
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

              {/* 🔍 FILTRO DE PESQUISA */}
              <div
                className="bg-gray-100 rounded-xl shadow p-6 border-[3px] border-blue-800 mb-4 flex items-center gap-6 w-4/5 ml-4" 

              >
                <label className="font-bold text-[#1414d2ff]">
                  Buscar:
                </label>

                <input
                  type="text"
                  placeholder="Token, descrição ou tipo automação..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="border rounded-xl  px-4 py-2  border-yellow-500 w-[620px]"
                 // className="border rounded-xl px-3 py-2 border-yellow-500"
                />
              </div>


        {/* TABELA DE LINHAS DENTRO DO BLOCO AZUL */}
        {linhas.length > 0 && (
          <table  className="tabela tabela-mapeamento" style={{ width: "100%", borderCollapse: "collapse"  }}> 
            
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
     

      <table   className="tabela tabela-mapeamento border-[4px] border-gray-500"
      
            style={{
            width: "90%",
            borderCollapse: "collapse",
            fontSize: 14,
            alignItems: "left",
          }} >
        <thead>
          <tr>
            <th>ID</th>
            <th>Token</th>
            <th>Descrição</th>
             <th>Tipo Automação</th>
            <th> Ações </th>
            <th> Sistema </th>
          </tr>
        </thead>

        <tbody>
          {filtrados.map((m, i) => (
            <tr
              key={m.id}
              style={{
                backgroundColor: i % 2 === 0 ? "#f2f2f2" : "#c6c5c4ff",
              }}     
            >
              <td>{m.id}</td>
              <td>{m.codigo}</td>
              <td>{m.nome}</td>
               <td>{m.tipo_automacao}</td>
             
                  <td style={{ display: "flex", gap: "28px" }}>
                {/* EDITAR */}
                <button
                  disabled={m.sistema}
                  onClick={() =>
                    !m.sistema &&
                    navigate("/editar-mapeamento", {
                      state: {
                        modelo_id: m.id,
                        empresa_id: empresa_id,
                        token: m.codigo,
                        nome: m.nome,
                        tipo: m.tipo_automacao,
                      },
                    })
                  }
                  style={{
                    color: m.sistema ? "#7d8490ff" : "#1c09c6ff",
                    cursor: m.sistema ? "not-allowed" : "pointer",
                    opacity: m.sistema ? 0.6 : 1,
                  }}
                >
                  Editar
                </button>

                {/* VISUALIZAR (sempre ativo) */}
                <button
                  onClick={() => visualizar(m.id)}
                  style={{ color: "#14953bff", cursor: "pointer" }}
                >
                  Visualizar
                </button>

                {/* EXCLUIR */}
                <button
                  disabled={m.sistema}
                  onClick={() => !m.sistema && Excluir(m.id)}
                  style={{
                    color: m.sistema ? "#7d8490ff" : "#b81111ff",
                    cursor: m.sistema ? "not-allowed" : "pointer",
                    opacity: m.sistema ? 0.6 : 1,
                  }}
                >
                  Excluir
                </button>
              </td>




               <td style={{ padding: 10, fontWeight: "bold", color: m.sistema ? "#f50909ff" : "#0d3488ff" }}>
                      {m.sistema ? "Sistema" : "Usuário"}
                    </td>




            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
