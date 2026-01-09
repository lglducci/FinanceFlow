import { useState, useEffect } from "react";

import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { hojeLocal, dataLocal } from "../utils/dataLocal";
 

export default function RelatoriosBalanco() {
  const hoje = new Date().toISOString().slice(0, 10);

  const [empresaId, setEmpresaId] = useState(null);
  const [dataCorte, setDataCorte] = useState(hojeLocal());
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);


  const empresa_id =
  localStorage.getItem("empresa_id") ||
  localStorage.getItem("id_empresa") ||
  "0";


function primeiroDiaMes(data) {
  const d = new Date(data);
  return new Date(d.getFullYear(), d.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}
  

const navigate = useNavigate();

  // Formatter BR
  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Carregar empresaId
  useEffect(() => {
    const id = localStorage.getItem("id_empresa");
    if (id) {
      setEmpresaId(Number(id));
    }
  }, []);

  async function consultar() {
    if (!empresaId) {
      alert("Empresa não carregada");
      return;
    }

    setLoading(true);
    setDados([]);

    try {
      const resp = await fetch(buildWebhookUrl("balanco"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: empresaId,
          data_corte: dataCorte,
        }),
      });

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : []);
    } catch (e) {
      alert("Erro ao carregar o balanco");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
        <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-blue-800 mb-2"> 
      <h1 className="text-2xl font-bold mb-6">📊 Balanço Patrimonial</h1>

      {/* FILTROS */}
      <div className="bg-white rounded-xl p-4 shadow mb-6 flex gap-4 items-end">
        <div>
          <label className=" block font-bold text-[#1e40af]">  Data de Corte  </label>
          <input
            type="date"
            value={dataCorte}
            onChange={(e) => setDataCorte(e.target.value)}
            className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <button
          onClick={consultar}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
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
          className="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold"
        >
         Voltar 
        </button>
        </div>
      </div>

      {/* TABELA */}
        <div id="print-area">  
        <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-gray-400 mb-2"> 
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="p-3 text-left">Grupo</th>
              <th className="p-3 text-left">Conta</th>
              <th className="p-3 text-right">Saldo</th>
            </tr>
          </thead>
        <tbody>
                {dados.map((l, idx) => (
                    <tr key={idx}  className={idx % 2 === 0 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6]"}>
                    <td className="p-3">{l.grupo}</td>

                    <td className="p-3">
                    <Link
                        to="/relatorios/razao"
                        state={{
                        conta: l.conta_codigo,
                        dataIni:   primeiroDiaMes(dataCorte), // você decide (exercício / mês)
                        dataFim: dataCorte       // data de corte do balanço
                        }}
                        className="text-blue-600 underline cursor-pointer"
                    >
                        {l.conta_codigo} – {l.conta_nome}
                    </Link>
                    </td>


                    <td className="p-3 text-right">
                        {fmt.format(l.saldo)}
                    </td>
                    </tr>
                ))}
                </tbody>

        </table>

        {loading && (
          <div className="p-6 text-center text-blue-600 font-semibold">
            Carregando...
          </div>
        )}
      </div>
    </div>
      </div>
        </div>
  );
}
