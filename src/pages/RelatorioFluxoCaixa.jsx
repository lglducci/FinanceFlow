import { useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { hojeLocal } from "../utils/dataLocal";

export default function RelatorioFluxoCaixa() {
  const navigate = useNavigate();

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modo, setModo] = useState("DETALHADO"); // DETALHADO | MENSAL | CONSOLIDADO

  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const fmtData = (d) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "";

  function webhookPorModo() {
    if (modo === "DETALHADO") return "gera_fluxo_caixa_detalhado";
    if (modo === "MENSAL") return "gera_fluxo_caixa_mensal";
    if (modo === "CONSOLIDADO") return "gera_fluxo_caixa_consolidado";
  }

  async function consultar() {
    setLoading(true);
    setDados([]);

    try {
      const resp = await fetch(buildWebhookUrl(webhookPorModo()), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          data_ini: dataIni,
          data_fim: dataFim,
        }),
      });

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : [json]);
    } catch (e) {
      alert("Erro ao carregar fluxo de caixa");
    } finally {
      setLoading(false);
    }
  }

 let saldo = 0;

const dadosRender = dados.map((l) => {
  if (l.historico === "SALDO INICIAL") {
    saldo = Number(l.saldo_mov);
  } else {
    saldo += Number(l.saldo_mov);
  }

  return {
    ...l,
    saldo_acumulado: saldo,
  };
});


  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-blue-800 mb-2">
        <h1 className="text-2xl font-bold mb-4">💰 Fluxo de Caixa</h1>

        {/* FILTROS */}
        <div className="flex gap-4 items-end mb-4">
          <div className="flex flex-col">
            <label className="font-bold text-[#1e40af]">Data inicial</label>
            <input
              type="date"
              value={dataIni}
              onChange={(e) => setDataIni(e.target.value)}
              className="border rounded px-3 py-2 border-yellow-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-bold text-[#1e40af]">Data final</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border rounded px-3 py-2 border-yellow-500"
            />
          </div>

          <button
            onClick={consultar}
            className="bg-blue-600 text-white px-6 py-2 rounded font-bold"
          >
            Consultar
          </button>

          <button
            onClick={() => window.print()}
            className="bg-gray-700 text-white px-4 py-2 rounded font-bold"
          >
            🖨️ Imprimir
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="bg-gray-400 text-white px-4 py-2 rounded font-bold"
          >
            Voltar
          </button>
        </div>

        {/* MODOS (IGUAL AO RAZÃO) */}
        <div className="flex gap-6 mt-2">
          {["DETALHADO", "MENSAL", "CONSOLIDADO"].map((m) => (
            <label key={m} className="flex items-center gap-2 font-bold">
              <input
                type="checkbox"
                checked={modo === m}
                onChange={() => setModo(m)}
              />
              {m}
            </label>
          ))}
        </div>
      </div>

      {/* ================= RESULTADOS ================= */}

      {/* DETALHADO */}
      {modo === "DETALHADO" && (
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="text-left font-bold"> Data</th>
              <th>Código</th>
              <th  className="text-left font-bold">Nome</th>
              <th  className="text-left font-bold">Histórico</th>
              <th   className="text-right font-bold">Entrada</th>
              <th  className="text-right font-bold">Saída</th>
              <th  className="text-right font-bold">Saldo</th>
            </tr>
          </thead>
          <tbody>
          {dadosRender.map((l, i) => (

              <tr  

                key={l.id}
                  className={i % 2 === 0 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6] border-b"}>
                <td  className="text-left font-bold">{fmtData(l.data_mov)}</td>
                <td  className="text-left font-bold">{l.conta_codigo}</td>
                <td  className="text-left font-bold">{l.conta_nome}</td>
                <td className="text-left font-bold">{l.historico}</td>
                <td className="text-right text-green-600 font-bold">{fmt.format(l.entrada)}</td>
                <td className="text-right text-red-600 font-bold">{fmt.format(l.saida)}</td>
                <td className="text-right font-bold">{fmt.format(l.saldo_acumulado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MENSAL */}
      {modo === "MENSAL" && (
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="text-left text-white">Ano</th>
              <th className="text-left text-white">Mês</th> 
              <th className="text-right text-green-600">Saldo Inicial</th>
              <th className="text-right text-green-600">Entradas</th>
              <th className="text-right text-red-600">Saídas</th>
              <th className="text-right text-white">Saldo Final</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((l, i) => (
              <tr key={i}>
                <td className="text-left text-green-600" >{l.ano}</td>
                <td className="text-left text-green-600">{l.mes}</td>
                <td className="text-right text-green-600">{fmt.format(l.saldo_inicial)}</td>
                <td className="text-right text-green-600">{fmt.format(l.entrada)}</td>
                <td className="text-right text-red-600">{fmt.format(l.saida)}</td>
                <td className="text-right font-bold">{fmt.format(l.saldo_final)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* CONSOLIDADO */}
      {modo === "CONSOLIDADO" && dados[0] && (
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card titulo="Saldo Inicial" valor={dados[0].saldo_inicial} />
          <Card titulo="Entradas" valor={dados[0].entrada} />
          <Card titulo="Saídas" valor={dados[0].saida} />
          <Card titulo="Saldo Final" valor={dados[0].saldo_final} />
        </div>
      )}

      {loading && (
        <div className="p-6 text-center text-blue-600 font-bold">
          Carregando...
        </div>
      )}
    </div>
  );
}

function Card({ titulo, valor }) {
  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="bg-gray-100 border-4 border-blue-800 rounded-xl p-4 text-center">
      <div className="text-sm font-bold text-gray-600">{titulo}</div>
      <div className="text-2xl font-bold text-blue-900">
        R$ {fmt.format(valor || 0)}
      </div>
    </div>
  );
}
