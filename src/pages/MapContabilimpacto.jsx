 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function MapContabilImpacto() {
 
  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [lista, setLista] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [linhas, setLinhas] = useState([]);

const [filtro, setFiltro] = useState("");
  const { state } = useLocation();
   
  const id = state?.id;

  const [modelo, setModelo] = useState(null);
  const [contas, setContas] = useState([]);
 
 
    const navigate = useNavigate();
 
 // const contaGerencialId = state?.conta_gerencial_id;

  async function carregarModelos() {
    try {
      const url = buildWebhookUrl("modelos_gerencial", { empresa_id, gerencial_id: id });
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

  

  useEffect(() => {
    carregarModelos();
   
  }, []);

  useEffect(() => {
  if (lista.length > 0) {
    visualizar(lista[0].id); // 🔥 pega o primeiro modelo automaticamente
  }
}, [lista]);



  const filtrados = lista.filter((m) =>
  m.codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
  m.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
  m.tipo_automacao?.toLowerCase().includes(filtro.toLowerCase())
);

  return (
    <div style={{ width: "100%", padding: 40 }}>

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

       <h3 style={{ marginTop: 16 , fontWeight: "bold", background: "##1414d2ff" }}>
        <b>Tipo Automação:</b> {selecionado?.tipo}
      </h3>

    </div>

    {/* BOTÃO NOVO MODELO */}
     
  </div>

</div>

              {/* 🔍 FILTRO DE PESQUISA */}
              <div
                className="bg-gray-100 rounded-xl shadow p-6 border-[6px] border-blue-800 mb-6 flex items-center gap-6"
              >
                <label className="font-bold text-[#1e40af]">
                     <div
                        style={{
                            marginTop: 20,
                            background: "#ffffff",
                            border: "2px solid #1e40af",
                            borderRadius: 10,
                            padding: 16,
                            fontSize: 14,
                            lineHeight: "1.6",
                            color: "#1f2937",
                        }}
                        >
                        <b>📘 Como este modelo funciona</b>
                        <p style={{ marginTop: 10 }}>
                            Este modelo contábil define como um evento do sistema será registrado na
                            contabilidade.
                        </p>

                        <p>
                            Cada linha abaixo representa uma conta contábil utilizada no lançamento.
                            A contabilidade sempre utiliza o método da <b>partida dobrada</b>.
                        </p>

                        <p>
                            <b>Partida dobrada</b> significa que todo valor lançado gera:
                            <br />• um débito em uma conta
                            <br />• um crédito em outra conta
                        </p>

                        <p>
                            O campo <b>D/C</b> indica se aquela conta será debitada (D) ou creditada (C)
                            quando o lançamento ocorrer.
                        </p>
                        </div>




                </label> 
                
              </div>
          <button
          onClick={() => navigate("/contasgerenciais")}
          className="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold"
        >
          ← Voltar
        </button>

        {/* TABELA DE LINHAS DENTRO DO BLOCO AZUL */}
        {linhas.length > 0 && (
          <table  className="tabela tabela-mapeamento" style={{ width: "100%", borderCollapse: "collapse" }}>
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
          

                <div
            style={{
                marginTop: 20,
                background: "#f9fafb",
                border: "2px dashed #2563eb",
                borderRadius: 10,
                padding: 20,
                fontSize: 14,
                lineHeight: "1.7",
                color: "#111827",
            }}
            >
            <b>🧭 Como o dinheiro percorre o sistema</b>

            <ol style={{ marginTop: 12, paddingLeft: 20 }}>
                <li>Lançamento financeiro pelo usuário</li>
                <li>Classificação por conta gerencial</li>
                <li>Aplicação automática do modelo contábil</li>
                <li>Registro no diário para conferência</li>
                <li>Geração contábil oficial</li>
                <li>Impacto nos relatórios (DRE, KPIs, Balanço)</li>
            </ol>

            <p style={{ marginTop: 10 }}>
                Todo esse processo ocorre automaticamente, sem necessidade de conhecimento
                contábil por parte do usuário.
            </p>
            </div>

      <table  className="tabela tabela-mapeamento" 
      
            style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }} >
        <thead>
          <tr>
            <th>ID</th>
            <th>Token</th>
            <th>Descrição</th>
             <th>Tipo Automação</th>
            <th>  Ações </th>
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
             

              <td style={{ display: "flex", gap: "28px"}}>
               
              
                <button
                 className="tabela tabela-mapeamento"
                  onClick={() => visualizar(m.id)}
                  style={{ color: "#14953bff" , gap: "32px" }}
                >
                  Visualizar
                </button>
          

              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
