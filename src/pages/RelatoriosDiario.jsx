import { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { hojeLocal, dataLocal } from "../utils/dataLocal";


export default function RelatoriosDiario() {
  const hoje = new Date().toISOString().slice(0, 10);

  const [empresaId, setEmpresaId] = useState(null);
  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
    const [filtro, setFiltro] = useState("");

  const navigate = useNavigate();
    const btnPadrao =
  "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";


  useEffect(() => {
    const id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");
    if (id) setEmpresaId(Number(id));
  }, []);

  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  {/*const fmtData = (d) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "";*/}

 
function formatarDataBR(data) {
  if (!data) return "";
  const d = new Date(data);
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const ano = d.getUTCFullYear();
  return `${dia}-${mes}-${ano}`;
}



  async function consultar() {
    if (!empresaId) return alert("Empresa não carregada");

    setLoading(true);
   // setDados([]);

    try {
      const r = await fetch(buildWebhookUrl("diario_contabil"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: empresaId,
          data_ini: dataIni,
          data_fim: dataFim,
        }),
      });

      const json = await r.json();
      setDados(Array.isArray(json) ? json : []);
    } catch {
      alert("Erro ao carregar diário contábil");
    } finally {
      setLoading(false);
    }
  }

const filtrados = dados.filter(item => {
  if (!filtro) return true;

  const f = filtro.toLowerCase();

  return (
    (item.conta_codigo || "").toLowerCase().includes(f) ||
    (item.conta_nome || "").toLowerCase().includes(f) ||
    (item.historico || "").toLowerCase().includes(f) ||
    (item.modelo_codigo || "").toLowerCase().includes(f)
  );
});


 async function Estornar(lote_id) {
  if (!confirm("Tem certeza que deseja estornar este lote de lançamento?")) return;

  try {
    const url = buildWebhookUrl("excluilanctolote");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa_id: empresaId, lote_id }),
    });

    const texto = await resp.text();
    const arr = JSON.parse(texto);

    const resultado = arr?.[0]?.data?.ff_excluir_lancamentos_lote;

    if (!resultado) {
      alert("Resposta inválida do servidor");
      return;
    }

    if (!resultado.success) {
      alert(resultado.message || "Erro ao excluir lote");
      return;
    }

    alert("Lote excluído com sucesso!");

    // ✅ RECARREGA A LISTA COM dataIni / dataFim ATUAIS
    consultar();

  } catch (e) {
    console.error("ERRO Estornar:", e);
    alert("Erro ao estornar.");
  }
}


   

  return (
    <div className="p-6">
          <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-blue-800 mb-2">
      <h1 className="text-2xl font-bold mb-6">📘 Lançamentos  Contábeis</h1>

      {/* filtros */}
      <div className="bg-white rounded-xl p-4 shadow mb-6 flex gap-4 items-end">
        <div>
          <label className=" block font-bold text-[#1e40af]">
             Data inicial 
             </label>
          <input
 

            type="date"
            value={dataIni}
            onChange={(e) => setDataIni(e.target.value)}
            className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <div>
          <label className=" block font-bold text-[#1e40af]">
             Data final </label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <div>
          <label className="block font-bold text-blue-700">
            Conta
          </label>
          <input
            type="text"
            placeholder="Código ou nome"
            value={filtro}
            onChange={e => setFiltro(e.target.value)} 
            className="border rounded px-3 py-2 border-yellow-500 w-64"
          />
        </div>


        <button
          onClick={consultar}
          className= { `${btnPadrao}  bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold `}  
        >
          Consultar
        </button>

        <button
          onClick={() => window.print()}
          className=  { `${btnPadrao} bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold `}        
        >
          🖨️ Imprimir
        </button>

          <button
            onClick={() => 
                      navigate( "/lancamentocontabilrapido")  
                    }
                  className= { `${btnPadrao} bg-green-700 hover:bg-green-500 px-4 py-2 `}
                >
                  ⚡ + Lancto Rapido
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
           

      </div>
      </div>
       <div id="print-area"> 
      {/* tabela */}
         <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-gray-400 mb-2"> 
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-900 text-white">
            <tr>
              
              <th className="p-3 text-left">Lançamento</th>
               <th className="p-3 text-left">Data</th> 
              <th className="p-3 text-left">Conta</th>
              <th className="p-3 text-left">Histórico</th>
              <th className="p-3 text-right">Débito</th>
              <th className="p-3 text-right">Crédito</th>
              <th className="p-3 text-center">Lote</th>
               <th className="p-3 text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((l, i) => (
              <tr key={i}   className={i % 2 === 0 ? "bg-100" : "bg-blue-200"} >
                 {/*  <td  className="p-2 font-bold text-left font-size: 16px">{fmtData(l.data_mov)}</td>  */}
                 <td   className="p-2 font-bold text-left font-size: 16px">{l.id}</td>
                 <td  className="p-2 font-bold text-left font-size: 16px">{ formatarDataBR(l.data_mov)}</td>   
                <td    className="p-2 font-bold text-left font-size: 16px">
                  {l.conta_codigo} – {l.conta_nome}
                </td>
                <td  className="p-2 font-bold text-left font-size: 16px left">{l.historico}</td>
                <td  className="p-2 font-bold text-right font-size: 16px text-right">{fmt.format(l.debito)}</td>
                <td   className="p-2 font-bold text-right font-size: 16px text-right">{fmt.format(l.credito)}</td>
                <td   className="p-2 font-bold text-center font-size: 16px">{l.lote}</td>

                
                  {/* AÇÕES */}
                  <td className="px-3 py-1 text-center space-x-4">

             {/* ESTORNAR */}
                    <button  
                     className=  "text-blue-600 underline font-bold"
                         
                      onClick={() => Estornar(l.lote)} 

                    >
                      Exclui Lote
                    </button>
                     
            </td>

              </tr>
            ))}

            {!loading && dados.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  Nenhum lançamento encontrado
                </td>
              </tr>
            )} 
          </tbody>
        </table>
        </div>
        {loading && (
          <div className="p-6 text-center text-blue-600 font-semibold">
            Carregando...
          </div>
        )}
      </div>
    </div>
    </div>
    
  );
}
