import { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
 
import { useLocation } from "react-router-dom";


const empresa_id =
  localStorage.getItem("empresa_id") ||
  localStorage.getItem("id_empresa") ||
  "0";


export default function RelatoriosRazao() {
  const hoje = new Date().toISOString().slice(0, 10);

  const [empresaId, setEmpresaId] = useState(null);
  const [dataIni, setDataIni] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);
  const [contaId, setContaId] = useState("");
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

 
  const location = useLocation();
 const navigate = useNavigate();

  // formatter BR
  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function formatarData(data) {
  if (!data) return "";
  return new Date(data).toLocaleDateString("pt-BR");
}


async function consultarComParams({ empresa_id, data_ini, data_fim, filtro }) {
  setLoading(true);
  setDados([]);

  try {
    const resp = await fetch(buildWebhookUrl("razao"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        data_ini,
        data_fim,
        filtro: filtro || ""
      }),
    });

    const json = await resp.json();
    setDados(Array.isArray(json) ? json : []);
  } catch (e) {
    alert("Erro ao carregar a razão");
  } finally {
    setLoading(false);
  }
}

 useEffect(() => {
  const emp =
    Number(localStorage.getItem("id_empresa") || localStorage.getItem("empresa_id") || 0);

  if (!emp) return;

  const st = location.state;
  if (!st?.conta) return; // abriu direto / sem drilldown

  // atualiza os campos da tela (opcional)
  setEmpresaId(emp);
  setContaId(st.conta);
  setDataIni(st.dataIni || dataIni);
  setDataFim(st.dataFim || dataFim);

  // ✅ CHAMA O WEBHOOK DIRETO COM OS PARAMS VINDOS DO BALANÇO
  consultarComParams({
    empresa_id: emp,
    data_ini: st.dataIni || dataIni,
    data_fim: st.dataFim || dataFim,
    filtro: st.conta,
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [location.state]);

 async function consultar() {
  const emp = Number(empresaId || localStorage.getItem("id_empresa") || localStorage.getItem("empresa_id") || 0);
  if (!emp) return alert("Empresa não carregada");

  return consultarComParams({
    empresa_id: emp,
    data_ini: dataIni,
    data_fim: dataFim,
    filtro: contaId,
  });
}


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📒 Razão Contábil </h1>

       
        {/* FILTROS */}
        <div className="bg-white rounded-xl p-4 shadow mb-6 flex gap-4 items-end">
          <div>
            <label className="block font-bold text-[#1e40af]"> Data inicial </label>
            <input
              type="date"
              value={dataIni}
              onChange={(e) => setDataIni(e.target.value)}
              className="border rounded-lg px-3 py-2 border-yellow-500"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1e40af]"> Data final  </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border rounded-lg px-3 py-2 border-yellow-500"
            />
          </div>

          <div>
            <label className="font-bold text-[#1e40af]"> Conta (opcional)  </label>
            <input
              type="text"
              placeholder="Código ou nome"
              value={contaId}
              onChange={(e) => setContaId(e.target.value)}
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
        {/* TABELA */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-3 text-left">Data</th>
                <th className="p-3 text-left">Conta</th>
                <th className="p-3 text-left">Histórico</th>
                <th className="p-3 text-right">Débito</th>
                <th className="p-3 text-right">Crédito</th>
                <th className="p-3 text-right">Saldo</th>
 

              </tr>
            </thead>
            <tbody>
              {dados.map((l, idx) => (
                <tr key={idx} className="border-b">
                 <td   className="p-2 font-bold font-size: 16px">{formatarData(l.data_mov)}</td>
                  <td  className="p-2 font-bold font-size: 16px">
                    {l.conta_codigo} – {l.conta_nome}
                  </td>
                  <td  className="p-2 font-bold font-size: 16px">{l.historico}</td>
                  <td   className="p-2 font-bold text-right font-size: 16px">
                    {fmt.format(l.debito)}
                  </td>
                  <td   className="p-2 font-bold text-right font-size: 16px">
                    {fmt.format(l.credito)}
                  </td>
                  <td
                    className={`p-3 text-right font-bold ${
                      l.saldo < 0 ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    {fmt.format(l.saldo)}
                  </td> 
                  
                </tr>

                

                
              ))}

              {!loading && dados.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>

              


              )}
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
  );
}
