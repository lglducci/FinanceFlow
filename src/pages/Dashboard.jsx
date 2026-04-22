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
      <p className="text-2xl font-bold text-gray-700">
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
  const [aba, setAba] = useState("principal"); 
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

      <h2 className="text-3xl font-bold text-gray-800">
        📊 Dashboard Financeiro
      </h2>

     

 {/* RECEITA */}
 {/* ================= SITUAÇÃO ATUAL ================= */}
  
<div className="bg-gray-50 rounded-2xl p-4 space-y-4">
 
  <h3 className="text-base font-bold text-gray-700 uppercase tracking-wide">
    Situação Atual
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> 
  <Card title="Receita do mês" value={data.receita_mes} color="border-l-4 border-emerald-600 bg-white "/>
  <Card title="Receita 6 meses" value={data.receita_6m} color="border-l-4 border-emerald-600 bg-white" />
  <Card title="Receita 12 meses" value={data.receita_12m} color="border-l-4 border-emerald-600 bg-white" />
   <Card title="A receber em aberto" value={data.receber_aberto} color="border-l-4 border-slate-600 bg-white" />

  <Card
    title="A receber vencido"
    value={data.receber_vencido?.valor_total ?? 0}
    color="border-l-4 border-rose-600 bg-white"
  />
</div>
</div>  



  
 {/* ================= COMPROMISSOS ================= */}
<div className="bg-gray-50 rounded-2xl p-4 space-y-4"> 
      <h3 className="text-base font-bold text-gray-700 uppercase tracking-wide">
        Compromissos
      </h3> 
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">  
      <Card
        title="A pagar vencido"
        value={data.pagar_vencido?.valor_total ?? 0}
        color="border-l-4 border-rose-600 bg-white"
      /> 
      <Card title="Cartão em aberto" value={data.faturas_aberto} color="border-l-4 border-amber-600 bg-white" /> 
      <Card title="A pagar em aberto" value={data.pagar_aberto} color="border-l-4 border-amber-600 bg-white" /> 
      <Card title="Resultado 12 Meses" value={data.resultado_12_meses} color="border-l-4 border-emerald-700 bg-white" /> 
      <Card title="Despesas 12 Meses" value={data.despesa_12_meses} color="border-l-4 border-rose-700 bg-white" />
</div>
</div>

 {/* ================= CAIXA & PROJEÇÃO ================= */}
<div className="bg-gray-50 rounded-2xl p-4 space-y-4">

  <h3 className="text-base font-bold text-gray-700 uppercase tracking-wide">
    Caixa & Projeção
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> 
  <Card title="Saldo atual" value={data.saldo_atual} color="border-l-4 border-slate-700 bg-white" />

  <Card
    title="Saldo projetado (30 dias)"
    value={data.saldo_projetado_30_dias}
    color="border-l-4 border-indigo-600 bg-white"
  />

  <Card
    title="Saldo projetado"
    value={data.saldo_projetado}
    color="border-l-4 border-indigo-700 bg-white"
  />
</div>
</div>
 
    </div>
  );
}
