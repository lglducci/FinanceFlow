 import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function EditaMapeamento() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const modelo_id = state?.modelo_id;
  const empresa_id = state?.empresa_id;
  const token = state?.token;
  const nome = state?.nome;
    const tipo = state?.tipo;

  const [linhas, setLinhas] = useState([]);
  const [busca, setBusca] = useState(""); // texto digitado
  const [resultadoBusca, setResultadoBusca] = useState([]); // contas retornadas
  const [indexLinha, setIndexLinha] = useState(null); // qual linha está sendo editada

  // ================================
  //  CARREGAR LINHAS DO MODELO
  // ================================
  async function carregarDados() {
    try {
      const url = buildWebhookUrl("modelos_linhas", {
        empresa_id,
        modelo_id,
      });

      const resp = await fetch(url);
      const dados = await resp.json();
      setLinhas(dados);
    } catch (e) {
      console.log("ERRO:", e);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // ================================
  //  BUSCAR CONTAS (AUTOCOMPLETE)
  // ================================
 async function buscarContas(linha, texto) {
    if (!texto || texto.length < 2) {
      setResultadoBusca([]);
      return;
    }

    try {
      const url = buildWebhookUrl("buscar_contas", {
        empresa_id,
        nome: texto  
       // dc:  linha.natureza,     // <-- AQUI: usa o D/C da linha (D ou C)
     });

      const resp = await fetch(url);
      const dados = await resp.json();

      setResultadoBusca(dados);
    } catch (e) {
      console.log("ERRO BUSCAR CONTAS:", e);
    }
  }

  // ================================
  //  TROCAR A CONTA NA LINHA
  // ================================
  function aplicarConta(linhaIndex, conta) {
    const novas = [...linhas];
    novas[linhaIndex] = {
      ...novas[linhaIndex],
      conta_id: conta.id,
      codigo: conta.codigo,
      nome: conta.nome,
      tipo: conta.tipo,
      natureza: conta.natureza,
      dc: conta.dc,
    };

    setLinhas(novas);
    setResultadoBusca([]);
    setBusca("");
  }

  // ================================
  //  TELA
  // ================================
  return (
    <div style={{ padding: 10,
                  background: "#cdd5dfff",
                    border: "2px solid #061f4aff",
                }}>
      <h2>Editar Mapeamento</h2>

                    {/* CABEÇALHO DO MODELO */}
                 <div
                    style={{
                        background: "#061f4aff",
                        padding: 15,
                        border: "2px solid #f7f1f5ff",
                        borderRadius: 8,
                        marginBottom: 20, 
                    }}
                    >
                    <h3  className="text-1xl font-bold mb-4 text-white" style={{ margin: 0 }}>
                       
                        <b> Token: </b> {token}
                    </h3>

                    <h3 className="text-1xl font-bold mb-4 text-white" style={{ marginTop: 5 }}>
                        <b> Nome:</b> {nome}
                    </h3>

                    
                    <h3 className="text-1xl font-bold mb-4 text-white" style={{ marginTop: 5 }}>
                        <b className="text-1xl font-bold mb-4 text-white" >Tipo:</b> {tipo}
                    </h3>

                    </div>



      <table className="tabela tabela-mapeamento"   style={{
            width: "90%",
            borderCollapse: "collapse",
            fontSize: 14,
          }} >
        <thead>
          <tr>
            <th>Buscar Conta</th>
            <th>ID</th>
            <th>Conta Atual</th> 
            <th>Código</th>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Natureza</th>
            <th>D/C</th>
          </tr>
        </thead>

        <tbody>
          {linhas.map((l, i) => (
            <tr key={i}> 
              {/* CAMPO DE BUSCA */}
              <td>
                <input
                  type="text"
                  placeholder="Procurar conta..."
                  value={indexLinha === i ? busca : ""}
                  onChange={(e) => {
                    const texto = e.target.value;
                    setBusca(texto);
                    setIndexLinha(i);
                    buscarContas(texto);
                     buscarContas(l, texto);   // <-- PASSA A LINHA AQUI  

                  }}
                  style={{ width: "180px" }}
                />

                {/* LISTA DE RESULTADOS */}
                {indexLinha === i && resultadoBusca.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      background: "#fff",
                      border: "1px solid #ccc",
                      width: "180px",
                      zIndex: 9999,
                    }}
                  >
                    {resultadoBusca.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => aplicarConta(i, c)}
                        style={{
                          padding: "6px 10px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <b>{c.codigo}</b> — {c.nome}
                      </div>
                    ))}
                  </div>
                )}
              </td>
            <td>{l.id}</td> 
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
         <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
  <button 
    style={{
      padding: "10px 20px",
       background: "#003ba2",
      color: "white",
      border: "none",
      borderRadius: 8,
      fontWeight: "bold",
      cursor: "pointer",
    }}
    onClick={async () => {
      try {
        const url = buildWebhookUrl("salvar_mapeamento", {
          empresa_id,
          modelo_id,
        });

        await fetch(url, {
          method: "POST",
          body: JSON.stringify(linhas),
        });

        alert("Mapeamento salvo!");
        navigate("/mapeamento-contabil");  // ⭐ AQUI VOLTA PRA TELA
      } catch (e) {
        alert("Erro ao salvar!");
      }
    }}
  >
    Salvar Tudo
  </button>

  <button
    style={{
      padding: "10px 20px",
      background: "#6b6b6b71",
      color: "white",
      border: "none",
      borderRadius: 8,
      fontWeight: "bold",
      cursor: "pointer",
    }}
    onClick={() => navigate("/mapeamento-contabil")}
  >
    Cancelar
  </button>
</div> 

    </div>
  );
}
