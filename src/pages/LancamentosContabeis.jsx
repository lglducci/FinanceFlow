import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
 
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";

export default function LancamentosContabeis() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [conta, setConta] = useState("");
  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState([]);
  const [mostrarZeradas, setMostrarZeradas] = useState(false);
  const [loading, setLoading] = useState(false);
    const btnPadrao =
  "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";

  const listaFiltrada = mostrarZeradas
  ? lista
  : lista.filter(l => !linhaZerada(l));

 async function pesquisar() {
  setLoading(true);

  try {
    const url = buildWebhookUrl("lancamento_contabil", {
      empresa_id,
      data_ini: dataIni,
      data_fim: dataFim,
      filtro: conta
    });

    const resp = await fetch(url);

    // 👇 SE NÃO FOR 200, MOSTRA ERRO REAL
    if (!resp.ok) {
      const erroTexto = await resp.text();
      console.error("ERRO HTTP:", resp.status, erroTexto);
      alert(`Erro HTTP ${resp.status}`);
      return;
    }

    // 👇 LÊ COMO TEXTO PRIMEIRO
    const texto = await resp.text();
    console.log("RETORNO BRUTO:", texto);

    // 👇 SE VIER VAZIO, PARA
    if (!texto) {
      alert("Webhook retornou vazio");
      return;
    }

    // 👇 AGORA SIM PARSEIA
    const json = JSON.parse(texto);

    setLista(Array.isArray(json) ? json : []);

  } catch (e) {
    console.error("ERRO REAL:", e);
    alert("Erro ao carregar lançamentos (ver console)");
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    const hoje = hojeLocal();
    
    setDataIni(hojeMaisDias(-30));
    setDataFim(hoje);
  }, []);


  function linhaZerada(l) {
  return (
    Number(l.saldo_inicial || 0) === 0 &&
    Number(l.debito || 0) === 0 &&
    Number(l.credito || 0) === 0 &&
    Number(l.saldo || 0) === 0  
  );
}

  return (
    <div className="p-4">
 

          <div style={{ width: "100%", padding: 20 }}>

      {/* CABEÇALHO AZUL */}
      <div
          style={{
            background: "#061f4aff",
            padding: "4px 4px",   // ⬅️ antes era 20
            borderRadius: 8,       // ⬅️ antes era 12
            marginBottom: 12,      // ⬅️ antes era 20
              border: "6px solid #061f4aff", // 👈 AQUI
          }}
        > 

        
      <h2 className="text-xl font-bold mb-2 text-white">
        Lançamentos Contábeis - Visão Saldo
      </h2>

 
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

            <label className="font-bold block text-blue-800">Data Inicial</label>
            <input
              type="date"
              value={dataIni}
              onChange={e => setDataIni(e.target.value)}
              className="border rounded px-3 py-2 w-70 border-yellow-500"
            />
           </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
            <label className="font-bold  block text-blue-800">Data Final</label>
            <input
              type="date"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              className="border rounded px-3 py-2 w-70 border-yellow-500"
            />
          </div> 

           
            <div style={{ display: "flex", flexDirection: "column", marginTop: 5 }}>
           <label className="font-bold text-[#1e40af]">Conta - Nome </label>
            <input
              type="text"
              value={conta}
              onChange={e => setConta(e.target.value)}
              placeholder="Ativo ou 1.1.1   "
                className="border rounded-lg px-3 py-2 border-yellow-500 w-520"
            />
          </div>
            
             
           
         {/*} <div>
            <label className="font-bold text-blue-800">Buscar</label>
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Histórico / Documento / Parceiro"
              className="border rounded px-3 py-2 w-full border-yellow-500"
            />
          </div>*/}
        </div>

        <div className="flex gap-3">
          <div style={{ display: "flex", gap: 15, marginTop: 10 }}> 
          <button
            onClick={pesquisar}
             className= { `${btnPadrao} bg-blue-900 hover:bg-blue-700 px-4 py-2 `} 
          >
            Filtrar
          </button>
         
      
          <button
            onClick={() => 
                      navigate( "/lancamento-contabil-manual")  
                    }
            className= { `${btnPadrao} bg-green-800 hover:bg-green-400 px-4 py-2 `}
          >
            + Novo Lancto Saldo
          </button>

          <button
            onClick={() => 
                      navigate( "/contabil/lancamento-partida-dobrada")  
                    }
            className= { `${btnPadrao} bg-blue-800 hover:bg-blue-400 px-4 py-2 `}
          >
            + Novo Partida Dobrada
          </button>
           
            <button
            onClick={() => 
                      navigate( "/lancamento-partida-dobrada-modelo")  
                    }
            className= { `${btnPadrao} bg-gray-700 hover:bg-gray-500 px-4 py-2 `}
          >
            + Novo Lancto Modelo
          </button>
           
             <button
            onClick={() => 
                      navigate( "/lancamentocontabilrapido")  
                    }
            className= { `${btnPadrao} bg-gray-700 hover:bg-gray-500 px-4 py-2 `}
          >
            ⚡ Novo Lancto Rapido
          </button>
          
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!mostrarZeradas}
            onChange={() => setMostrarZeradas(!mostrarZeradas)}
          />
          Ocultar contas sem movimento
        </label>

          </div>
        </div>
      </div>
        </div>
        </div>  


       {/* LISTA */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
          border: "4px solid #666667ff",
        }}
      >
        <table className="tabela tabela-mapeamento" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="px-3 py-2 text-center">Mês Ano</th>
              <th className="px-3 py-2 text-left">Codigo Conta</th>
              <th className="px-3 py-2 text-left">Nome da Conta</th>
              <th className="px-3 py-2 text-left">Saldo Inicial</th>
              <th className="px-3 py-2 text-right">Debito</th>
              <th className="px-3 py-2 text-right">Credito</th>
              <th className="px-3 py-2 text-right">Saldo Final</th>
              <th className="px-3 py-2 text-center">Ações</th>
            </tr>
          </thead>    

          <tbody>
            {!loading && lista.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  Nenhum lançamento encontrado.
                </td>
              </tr>
            )}

            {listaFiltrada.map((l, i) => (
                 
  
              <tr
                key={l.id}
                className={i % 2 === 0 ? "bg-gray-100" : "bg-gray-200"}
              >
                
                <td className="px-3 py-2 font-bold  text-center">{l.mes_ano}</td>
                <td className="px-3 py-2 font-bold">{l.conta_codigo}</td>
                <td className="px-3 py-2 font-bold">{l.conta_nome}</td>
                  
                <td className="px-3 py-2 text-right font-bold">
                  {Number(l.saldo_inicial).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  })}
                </td>
               
                 <td className="px-3 py-2 text-right font-bold">
                  {Number(l.debito).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  })}
                </td>

                 <td className="px-3 py-2 text-right font-bold">
                  {Number(l.credito).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  })}
                </td>
                <td className="px-3 py-2 text-right font-bold">
                  {Number(l.saldo).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  })}
                </td>

                <td className="font-bold text-center">
                    {l.analitica == true || l.analitica == 1 ? "Sim" : "Não"}
                  </td>
                <td className="px-3 py-2 text-center">
                 <button
                        onClick={() =>
                          l.analitica &&
                          navigate(`/alterar-saldo/${l.conta_id}`, {
                            state: {
                              conta_codigo: l.conta_codigo,
                              conta_nome: l.conta_nome,
                            },
                          })
                        }
                        disabled={!l.analitica}
                        className={`font-bold underline
                          ${l.analitica
                            ? "text-blue-700 hover:text-blue-900 cursor-pointer"
                            : "text-gray-600 cursor-not-allowed opacity-60"}
                        `}
                      >
                        Alterar Saldo
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
