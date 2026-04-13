 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function RelatorioGerencial() {
  const empresa_id = Number(localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa"));

  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth() + 1);

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(false);
  
  const navigate = useNavigate();

  async function carregar() {
    setLoading(true);
    setErro(false);
    setDados(null);

    try {
      const url = buildWebhookUrl("kpis", {
        empresa_id,
        ano,
        mes,
      });

      const r = await fetch(url);
      if (!r.ok) throw new Error("fetch");

      const json = await r.json();
      if (!Array.isArray(json) || json.length === 0) {
        setErro(true);
        return;
      }

      setDados(json[0]);
    } catch {
      setErro(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div>
      
        <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-blue-800 mb-2"> 
      
      <h1 className="text-2xl font-bold mb-6">Relatório Gerencial Mensal (KPIs Financeiros)</h1>

      {/* FILTROS */}
       <div className="bg-white rounded-xl p-5 shadow mb-6 flex gap-6 items-end">
        
        <div>
          <label  className="block font-bold text-[#1e40af]" > Ano </label>
          <input
            type="number"
            value={ano}
            onChange={e => setAno(Number(e.target.value))}
            
            className="border rounded-xl px-3 py-2 border-yellow-500"
          />
        </div>

        <div>
          <label  className="block font-bold text-[#1e40af]" > Mês    </label>
          <input
            type="number"
            min="1"
            max="12"
            value={mes}
            onChange={e => setMes(Number(e.target.value))}
            className="border rounded-lg px-3  py-2 border-yellow-500"
          />
         </div>

        <button
          onClick={carregar}
          className="bg-blue-600 text-white px-8 py-2 rounded-lg font-semibold"
        >
            Consultar
        </button>


        
        <button
          onClick={() => window.print()}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          🖨️ Imprimir
        </button> 

        
          <button
            onClick={() =>   navigate("/reports") }
            className="bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold"
            >
            Voltar 
          </button>
       </div>
      </div>

      {loading && <div>Carregando...</div>}
      {erro && <div className="text-red-600 font-bold">Erro ao carregar relatório</div>}

      {dados && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 cursor-pointer rounded-xl border-[4px] border-gray-500 bg-gray-100 p-5 shadow hover:shadow-lg transition">
          <Card titulo="Receita Líquida" valor={dados.receita_liquida} moeda />
          <Card titulo="CMV / CSP" valor={dados.cmv_csp} moeda />
          <Card titulo="Margem Contribuição" valor={dados.margem_contribuicao} moeda />
          <Card titulo="Despesa Fixa" valor={dados.despesa_fixa} moeda />
          <Card titulo="Resultado Líquido" valor={dados.resultado_liquido} moeda />
          <Card titulo="EBITDA" valor={dados.ebitda} moeda />
          <Card titulo="Margem EBITDA" valor={dados.margem_ebitda} percentual />
          <Card titulo="Liquidez" valor={dados.liquidez_aprox} />
          <Card titulo="Endividamento" valor={dados.endividamento_aprox} />
        </div>
      )}
    </div>
  );
}

 function Card({ titulo, valor, moeda, percentual }) {
  return (
    <div className="p-4 rounded-xl border bg-gray-200 shadow">
      <div className="text-sm text-gray-500">{titulo}</div>
      <div className="text-xl font-bold text-blue-900">
        {moeda
          ? Number(valor || 0).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : percentual
          ? `${(Number(valor || 0) * 100).toFixed(2)}%`
          : Number(valor || 0).toFixed(2)}
      </div>
    </div>
  );
}