import SummaryCard from "../components/SummaryCard.jsx";
import { buildWebhookUrl } from '../config/globals';

export default function Dashboard() {
  const saldo = 1250.75;
  const receitas = 3200.0;
  const despesas = 1950.25;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Visão geral</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Saldo atual" value={saldo} highlight />
        <SummaryCard title="Receitas no mês" value={receitas} positive />
        <SummaryCard title="Despesas no mês" value={despesas} negative />
      </div>
    </div>
  );
}
