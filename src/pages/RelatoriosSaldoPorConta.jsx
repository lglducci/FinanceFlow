 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { hojeLocal, dataLocal } from "../utils/dataLocal";
export default function RelatoriosSaldoPorConta() {
  const hoje = new Date().toISOString().slice(0, 10);

  const [dados, setDados] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
 const [contaId, setContaId] = useState("");
  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
   const [mostrarZeradas, setMostrarZeradas] = useState(false);

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

     const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const navigate = useNavigate();


  async function consultar() {
    setLoading(true);
    try {
      const resp = await fetch(
        buildWebhookUrl("saldo_conta"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id,
            data_ini: dataIni,
            data_fim: dataFim,
            filtro: contaId
          })
        }
      );

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : []);
    } catch (e) {
      alert("Erro ao carregar saldo por conta");
    } finally {
      setLoading(false);
    }
  }
 
 
  function linhaZerada(c) {
  return (
    Number(c.saldo_inicial || 0) === 0 &&
    Number(c.total_debito || 0) === 0 &&
    Number(c.total_credito || 0) === 0 &&
    Number(c.saldo || 0) === 0  
  );
}


  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow">
      <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-blue-800 mb-2"> 

      <h2 className="text-xl font-bold mb-4">📊 Saldo por Conta</h2>
 
{/* 🔎 FILTROS */}
<div className="bg-white rounded-xl p-4 shadow mb-6">

  {/* LINHA 1 — filtros e botões */}
  <div className="flex flex-wrap gap-4 items-end">
    <div>
      <label className="block font-bold text-[#1e40af]">Data inicial</label>
      <input
        type="date"
        value={dataIni}
        onChange={(e) => setDataIni(e.target.value)}
        className="border rounded-lg px-3 py-2 border-yellow-500"
      />
    </div>

    <div>
      <label className="block font-bold text-[#1e40af]">Data final</label>
      <input
        type="date"
        value={dataFim}
        onChange={(e) => setDataFim(e.target.value)}
        className="border rounded-lg px-3 py-2 border-yellow-500"
      />
    </div>

    <div>
      <label className="block font-bold text-[#1e40af]">Conta (opcional)</label>
      <input
        type="text"
        placeholder="Código ou nome"
        value={contaId}
        onChange={(e) => setContaId(e.target.value)}
        className="border rounded-lg px-3 py-2 border-yellow-500 w-64"
      />
    </div>

    <button
      onClick={consultar}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
    >
      Consultar
    </button>

    <button
      onClick={() => window.print()}
      className="bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold"
    >
      🖨️ Imprimir
    </button>

    <button
      onClick={() => navigate("/reports")}
      className="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold"
    >
      Voltar
    </button>
  </div>

  {/* LINHA 2 — checkbox */}
  <div className="mt-4">
    <label className="flex items-center gap-2 cursor-pointer font-semibold">
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

      {loading && (
        <p className="text-blue-600 font-semibold">Carregando...</p>
      )}

      {/* 📋 TABELA */}
        <div id="print-area" className="bg-white rounded-xl shadow overflow-x-auto"> 
      <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-gray-400 mb-2"> 
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="p-2 text-left">Código</th>
            <th className="p-2 text-left">Conta</th>
                <th className="p-2 text-left">Saldo Inicial</th>
            <th className="p-2 text-right">Débito</th>
            <th className="p-2 text-right">Crédito</th>
            <th className="p-2 text-right">Saldo</th>
          </tr>
        </thead>
        <tbody>
            
          {  dados.filter((c) => mostrarZeradas || !linhaZerada(c)).map((c, idx) => (
            <tr key={idx}   className={idx % 2 === 0 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6]"}>
              
              <td className="p-2 font-bold ">{c.codigo}</td>
              <td className="p-2 font-bold ">{c.nome}</td>
              <td className="p-2 text-right font-bold ">
                
                   {fmt.format(c.saldo_inicial)}
              </td>
              <td className="p-2 text-right font-bold ">
                
                   {fmt.format(c.total_debito)}
              </td>
              <td className="p-2 text-right font-bold ">
                
                   {fmt.format( c.total_credito)}
              </td>
              <td
                className={`p-2 text-right font-bold ${
                  Number(c.saldo) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {fmt.format(c.saldo)}
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
