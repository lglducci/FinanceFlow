 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import CardDRE from "../components/CardDRE";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";


export default function DashboardContabil() {
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [dataIni, setDataIni] = useState("20251201");
  const [dataFim, setDataFim] = useState("20260201");

  const [kpis, setKpis] = useState({});
  const [dre, setDre] = useState([]);

  const [ativoPizza, setAtivoPizza] = useState([]);
  const [passivoPizza, setPassivoPizza] = useState([]);
  const [resultadoMensal, setResultadoMensal] = useState([]);
  const [balancete, setBalancete] = useState([]);

    async function carregar() {
    alert("ss");
      const r = await fetch(buildWebhookUrl("der"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: empresa_id,
          data_ini: dataIni,
          data_fim: dataFim,
        }),
      });

    const j = await r.json();
    setDre(j);

    // KPIs / Balanço
    fetch(buildWebhookUrl("balanco", { empresa_id, dataIni, dataFim }))
        .then(r => r.json())
        .then(setKpis);

    // Pizza Ativo
    fetch(buildWebhookUrl("balanco_ativo_pizza", { empresa_id }))
        .then(r => r.json())
        .then(setAtivoPizza);

    // Pizza Passivo
    fetch(buildWebhookUrl("balanco_passivo_pizza", { empresa_id }))
        .then(r => r.json())
        .then(setPassivoPizza);

    // Resultado Mensal
    fetch(buildWebhookUrl("resultado_mensal", { empresa_id }))
        .then(r => r.json())
        .then(setResultadoMensal);

    // Balancete
    fetch(buildWebhookUrl("balancete", { empresa_id, dataIni, dataFim }))
        .then(r => r.json())
        .then(setBalancete);
    }


  
  return (
    <div className="p-6 bg-white min-h-screen">

      {/* HEADER */}
      <div className="bg-[#061f4aff] text-white rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold">📊 Dashboard Contábil</h1>

        <div className="flex gap-4 mt-4">
          <input type="date" className="input-premium"
            value={dataIni} onChange={e => setDataIni(e.target.value)} />
          <input type="date" className="input-premium"
            value={dataFim} onChange={e => setDataFim(e.target.value)} />
          
           <button
            onClick={carregar}
            className="bg-yellow-400 px-6 rounded font-bold text-black"
            >
            Atualizar
            </button>


        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <Kpi titulo="Ativo" valor={kpis.ativo} />
        <Kpi titulo="Passivo" valor={kpis.passivo} />
        <Kpi titulo="Patrimônio Líquido" valor={kpis.pl} />
        <Kpi titulo="Resultado" valor={dre.resultado} />
      </div>

      {/* PIZZAS */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <Card titulo="Composição do Ativo">
          {/* aqui entra gráfico pizza */}
        </Card>

        <Card titulo="Composição do Passivo">
          {/* aqui entra gráfico pizza */}
        </Card>
      </div>

      {/* DRE */}
      <Card titulo="Receitas x Custos x Despesas">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardDRE dre={dre} />
            </div> 
      </Card>


      {/* RESULTADO MENSAL */}
      <Card titulo="Resultado Mensal">
       
      </Card>

      {/* BALANCETE */}
      <Card titulo="Balancete Resumido">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Conta</th>
              <th>Débito</th>
              <th>Crédito</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {balancete.map((l, i) => (
              <tr key={i} className="border-b hover:bg-gray-50 cursor-pointer">
                <td className="p-2">{l.codigo} - {l.nome}</td>
                <td>{l.total_debito}</td>
                <td>{l.total_credito}</td>
                <td className={l.saldo_final < 0 ? "text-red-600" : "text-green-700"}>
                  {l.saldo_final}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>



      
      <div className="bg-white rounded-xl shadow p-6 border border-gray-200">

            <h2 className="text-xl font-bold mb-4 text-[#061f4aff]">
                Demonstração do Resultado (DRE)
            </h2>

            {dre.length === 0 ? (
                <p className="text-gray-500">Nenhum dado para o período.</p>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dre}>
                    <XAxis dataKey="grupo" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                    dataKey="valor_periodo"
                    fill="#061f4aff"
                    radius={[6, 6, 0, 0]}
                    />
                </BarChart>
                </ResponsiveContainer>
            )}

            </div>


     

    </div>
  );
}

/* COMPONENTES AUX */
function Kpi({ titulo, valor }) {
  return (
    <div className="border rounded-xl p-4 shadow">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-xl font-bold">{valor ?? "0,00"}</p>
    </div>
  );
}

function Card({ titulo, children }) {
  return (
    <div className="border rounded-xl p-5 shadow">
      <h2 className="font-bold mb-4">{titulo}</h2>
      {children}
    </div>
  );
}
