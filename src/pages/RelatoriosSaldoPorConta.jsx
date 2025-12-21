 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function RelatoriosSaldoPorConta() {
  const hoje = new Date().toISOString().slice(0, 10);

  const [dados, setDados] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);

  const [dataIni, setDataIni] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);

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
            data_fim: dataFim
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
 


  const filtrados = dados.filter(item =>
    item.codigo.includes(filtro) ||
    item.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow">

      <h2 className="text-xl font-bold mb-4">📊 Saldo por Conta</h2>

      {/* 🔎 FILTROS */}
      <div className="flex gap-4 items-end mb-6">
        <div>
          <label  className="block font-bold text-[#1e40af]">
            Data inicial
          </label>
          <input
            type="date"
            value={dataIni}
            onChange={e => setDataIni(e.target.value)}
             className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <div>
          <label className="block font-bold text-blue-700">
            Data final
          </label>
          <input
            type="date"
            value={dataFim}
            onChange={e => setDataFim(e.target.value)} 
             className="border rounded px-3 py-2 border-yellow-500"
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
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
        >
          Consultar
        </button>

        {/* 🖨️ IMPRIMIR */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => window.print()}
          className="bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          🖨️ Imprimir
        </button> 
      </div>

       <button
          onClick={() =>   navigate("/reports") }
          className="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold"
        >   
          Voltar 
        </button>
        

      </div>

      {loading && (
        <p className="text-blue-600 font-semibold">Carregando...</p>
      )}

      {/* 📋 TABELA */}
        <div id="print-area" className="bg-white rounded-xl shadow overflow-x-auto"> 
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="p-2 text-left">Código</th>
            <th className="p-2 text-left">Conta</th>
            <th className="p-2 text-right">Débito</th>
            <th className="p-2 text-right">Crédito</th>
            <th className="p-2 text-right">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((c, i) => (
            <tr key={i} className="border-b">
              <td className="p-2">{c.codigo}</td>
              <td className="p-2">{c.nome}</td>
              <td className="p-2 text-right">
                
                   {fmt.format(c.total_debito)}
              </td>
              <td className="p-2 text-right">
                
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
  );
}
