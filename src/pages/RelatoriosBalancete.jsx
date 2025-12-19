 import { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function RelatoriosBalancete() {

  const hoje = new Date().toISOString().slice(0, 10);

  const [empresaId, setEmpresaId] = useState(null);
  const [dataIni, setDataIni] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState([]);
  const navigate = useNavigate();

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


  async function consultar() {
    if (!empresaId) {
      alert("Empresa não carregada");
      return;
    }

    setLoading(true);
    setDados([]);

    try {
      const resp = await fetch(
        buildWebhookUrl("balancete"),
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
    <div className="p-6">

         
      <h1 className="text-2xl font-bold mb-6">📒 Balancete</h1>

      <div className="bg-white rounded-xl p-4 shadow mb-6 flex gap-4 items-end">
        <div>
          <label className="block font-bold text-[#1e40af]"> Data inicial    </label>
          <input
            type="date"
            value={dataIni}
            onChange={(e) => setDataIni(e.target.value)}
            className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <div>
          <label className="block font-bold text-[#1e40af]"> Data final    </label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
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
          className="bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold"
          >
          Voltar 
          </button>

      </div>

       <div id="print-area"> 

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-700 text-white">
            <tr style={{ background: "#002b80", color: "white", height: 40 }}>
              <th className="p-3 text-left">Código</th>
              <th className="p-3 text-left">Conta</th>
              <th className="p-3 text-right">Débito</th>
              <th className="p-3 text-right">Crédito</th>
              <th className="p-3 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((l, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2 font-bold font-size: 16px">{l.codigo}</td>
                <td className="p-2 font-bold font-size: 16px">{l.conta_nome}</td>
                <td className="p-2 text-right font-bold font-size: 16px">{fmt.format(l.total_debito)}</td>
                <td className="p-2 text-right font-bold font-size: 16px">{fmt.format(l.total_credito)}</td>
                <td
                  className={`p-3 text-right font-bold font-size: 16px ${
                    l.saldo < 0 ? "text-red-600" : "text-green-700"
                  }`}
                >
                  {fmt.format(l.saldo)}
                </td>
              </tr>
            ))}

            {!loading && dados.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  Nenhum dado para o período selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {loading && (
          <div className="p-6 text-center text-blue-600 font-bold">
            Carregando...
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
