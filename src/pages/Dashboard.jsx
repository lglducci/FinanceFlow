 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


function Card({ title, value, color = "bg-gray-100" }) {
  return (
    <div className={`rounded-xl p-4 shadow ${color}`}>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">
        {value?.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }) ?? "—"}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    setLoading(true);
    try {
      const r = await fetch(
        buildWebhookUrl("dashboard_financeiro", { empresa_id })
      );
      const json = await r.json();

      const payload = json?.[0]?.fn_dashboard_financeiro || null;
      setData(payload);
    } catch (e) {
      console.error("Erro dashboard:", e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  if (loading) {
    return <div className="p-6">Carregando dashboard…</div>;
  }

  if (!data) {
    return (
      <div className="p-6 text-red-600 font-bold">
        Dashboard sem dados
      </div>
    );
  }


  function ultimos6Meses(lista) {
  if (!Array.isArray(lista)) return [];
  return lista.slice(-6);
}



  return (
    <div className="p-4 space-y-6">

      <h2 className="text-2xl font-bold text-gray-800">
        📊 Dashboard Financeiro
      </h2>

      {/* RECEITA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Receita do mês" value={data.receita_mes} color="bg-green-100" />
        <Card title="Receita 6 meses" value={data.receita_6m} color="bg-green-100" />
        <Card title="Receita 12 meses" value={data.receita_12m} color="bg-green-100" />
      </div>

      {/* CONTAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="A receber em aberto" value={data.receber_aberto} color="bg-blue-100" />
        <Card title="A receber vencido" value={data.receber_vencido.valor_total} color="bg-red-100" />
        <Card title="A pagar em aberto" value={data.pagar_aberto} color="bg-yellow-100" />
        <Card title="A pagar vencido" value={data.pagar_vencido.valor_total} color="bg-red-100" />
        <Card title="Resultado 12 Meses" value={data.resultado_12_meses} color="bg-green-100" />
         <Card title="Despesas 12 Meses" value={data.despesa_12_meses} color="bg-red-100" />
      </div>

      {/* CAIXA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Saldo atual" value={data.saldo_atual} color="bg-slate-100" />
        <Card title="Saldo projetado (30 dias)" value={data.saldo_projetado} color="bg-indigo-100" />
      </div>

      {/* LISTAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* RECEBER */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-bold mb-3 text-green-700">
            Próximos recebimentos
          </h3>
          {data.proximos_receber?.length ? (
            data.proximos_receber.map(r => (
              <div key={r.id} className="flex justify-between border-b py-2 text-sm">
                <span>{r.descricao}</span>
                <span className="font-bold">
                  {Number(r.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400">Nenhum previsto</p>
          )}
        </div>

        {/* PAGAR */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-bold mb-3 text-red-700">
            Próximos pagamentos
          </h3>
          {data.proximos_pagar?.length ? (
            data.proximos_pagar.map(p => (
              <div key={p.id} className="flex justify-between border-b py-2 text-sm">
                <span>{p.descricao}</span>
                <span className="font-bold">
                  {Number(p.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400">Nenhum previsto</p>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6"> 

        <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">
              📈 Receita – Últimos 6 meses
            </h3>

            <ResponsiveContainer width="100%" height={300}>
                {data?.receita_6m_serie?.length > 0 && (
                  <LineChart
                    width={600}
                    height={300}
                    data={data.receita_6m_serie}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ano_mes" />
                    <YAxis />
                    <Tooltip
                      formatter={(v) =>
                        `R$ ${Number(v).toLocaleString("pt-BR")}`
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="total_recebido"
                      stroke="#2563eb"
                      strokeWidth={3}
                    />
                  </LineChart>
                )}

            </ResponsiveContainer>
          </div>


          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">
              📈 Receita – Últimos 12 meses
            </h3>

            <ResponsiveContainer width="100%" height={300}>
               {data?.receita_12m_serie?.length > 0 && (
                <LineChart width={600} height={300} data={data.receita_12m_serie}>
                  <XAxis dataKey="ano_mes" />
                  <YAxis />
                  <Tooltip
                      formatter={(v) =>
                        `R$ ${Number(v).toLocaleString("pt-BR")}`
                      }
                    />
                  <Line
                    type="monotone"
                    dataKey="total_recebido"
                    stroke="#16a34a"
                    strokeWidth={3}
                  />
                </LineChart>
              )}

            </ResponsiveContainer>
          </div>



           <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">
              📈 Despesa – Últimos 12 meses
            </h3>

            <ResponsiveContainer width="100%" height={300}>
               {data?.despesa_12m_serie?.length > 0 && (
                <LineChart width={600} height={300} data={data.despesa_12m_serie}>
                  <XAxis dataKey="ano_mes" />
                  <YAxis />
                  <Tooltip
                      formatter={(v) =>
                        `R$ ${Number(v).toLocaleString("pt-BR")}`
                      }
                    />
                  <Line
                    type="monotone"
                    dataKey="total_despesa"
                    stroke="#a31616"
                    strokeWidth={3}
                  />
                </LineChart>
              )}

            </ResponsiveContainer>
          </div>


          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">
              📈 Resultado – Últimos 12 meses
            </h3>

            <ResponsiveContainer width="100%" height={300}>
               {data?.resultado_12m_serie?.length > 0 && (
                <LineChart width={600} height={300} data={data.resultado_12m_serie}>
                  <XAxis dataKey="ano_mes" />
                  <YAxis />
                  <Tooltip
                      formatter={(v) =>
                        `R$ ${Number(v).toLocaleString("pt-BR")}`
                      }
                    />
                  <Line
                    type="monotone"
                    dataKey="resultado"
                    stroke="#16a34a"
                    strokeWidth={3}
                  />
                </LineChart>
              )}

            </ResponsiveContainer>
          </div>

            
          

         </div>

      </div>
    </div>
  );
}
