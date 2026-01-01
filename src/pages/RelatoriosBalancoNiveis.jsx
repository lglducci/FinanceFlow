 
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal, dataLocal } from "../utils/dataLocal";
import { useState, useEffect } from "react";

export default function RelatoriosBalancoNiveis() {
  const navigate = useNavigate();

  
 
  const empresa_id = localStorage.getItem("empresa_id") ;
 
   const [empresaId, setEmpresaId] = useState(null);

 const [dataIni, setDataIni] = useState(hojelocal());
const [dataFim, setDataFim] = useState(hojelocal());

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);

   
  const grupo_contabil = state?.grupo_contabil;
  const id = state?.id;

  const [modelo, setModelo] = useState(null);
  const [contas, setContas] = useState([]);

  useEffect(() => {
    if (!empresa_id || !grupo_contabil) return;

    carregarImpacto();
  }, [empresa_id, grupo_contabil]);


  // Formatter BR
  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
 

useEffect(() => {
  const id = localStorage.getItem("id_empresa");
  console.log("id_empresa localStorage:", id);

  if (id) {
    setEmpresaId(Number(id));
  }
}, []);


  async function buscar() {
    if (!empresaId) {
      alert("Empresa não carregada");
      return;
    }

    setLoading(true);
    setDados([]);

    try {
      const resp = await fetch(
        buildWebhookUrl("balanco_niveis"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id: empresaId,
            data_ini: dataIni,
            data_fim: dataFim,
          }),
        }
      );

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : []);
    } catch (e) {
      alert("Erro ao carregar balancete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">

      <h2 className="text-xl font-bold mb-4">Balanço Patrimonial</h2>

      {/* FILTROS */}
      <div className="bg-white rounded-xl p-4 shadow mb-6 flex gap-4 items-end">
         <div>
          <label className="block font-bold text-[#1e40af]"> Data inicial  </label>
        <input
          type="date"
          value={dataIni}
          onChange={e => setDataIni(e.target.value)}
            className="block border rounded-lg px-3 py-2 border-yellow-500"
        />
           </div>

        <div>
          <label className="block font-bold text-[#1e40af]"> Data final  </label>
        <input
          type="date"
          value={dataFim}
          onChange={e => setDataFim(e.target.value)}
          className="block border rounded-lg px-3 py-2 border-yellow-500"
        />
        </div>
         {/* BOTÕES FINAL */}
 
        <button
          onClick={buscar}
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold"
        >
          Consultar
        </button>
       
      
        <button
          onClick={() => navigate("/reports")}
          className="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold"
        >
          ← Voltar
        </button>

        <button
          onClick={() => window.print()}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          🖨️ Imprimir
        </button>
     
     </div>
      <div id="print-area">  
      {/* RESULTADO */}
      {loading && <p>Carregando...</p>}

      {dados && (
        <table className="w-full border-collapse">
         <tbody>
            <Linha
                label="Ativo Circulante"
                valor={dados?.find(i => i.grupo === "ATIVO_CIRCULANTE")?.saldo}
            />
            <Linha
                label="Ativo Não Circulante"
                valor={dados?.find(i => i.grupo === "ATIVO_NAO_CIRC")?.saldo}
            />
            <Linha
                label="Passivo Circulante"
                valor={dados?.find(i => i.grupo === "PASSIVO_CIRC")?.saldo}
            />
            </tbody>


        </table>
      )}

       
    </div>
     </div>
  );
}

 function Linha({ label, valor }) {
  const fmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <tr className="border-b">
      <td className="p-2 font-medium">{label}</td>
      <td className="p-2 text-right">
        {fmt.format(Number(valor || 0))}
      </td>
    </tr>
  );
}


function LinhaTotal({ label, valor }) {
  return (
    <tr className="border-t-2 font-bold">
      <td className="p-2">{label}</td>
      <td className="p-2 text-right">
        {Number(valor || 0).toFixed(2)}
      </td>
    </tr>
  );
}
