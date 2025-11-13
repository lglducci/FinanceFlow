export default function Dashboard() {
  return (
    <div className="p-6">

      <h1 className="text-2xl font-semibold mb-6">
        Dashboard Financeiro
      </h1>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <Card titulo="Saldo Atual" valor="R$ 12.540,22" />
        <Card titulo="Próxima Fatura" valor="R$ 1.280,90" />
        <Card titulo="Receitas (mês)" valor="R$ 8.250,00" />
        <Card titulo="Despesas (mês)" valor="R$ 5.430,00" />

      </div>

      {/* Gráfico fake por enquanto */}
      <div className="mt-8 bg-[var(--cor-card)] p-6 rounded-xl">
        <p className="text-lg font-medium">Gráfico Receitas x Despesas</p>
        <div className="mt-4 h-40 bg-gray-200 rounded"></div>
      </div>

    </div>
  );
}

function Card({ titulo, valor }) {
  return (
    <div className="bg-[var(--cor-card)] p-5 rounded-xl border">
      <p className="text-sm text-[var(--cor-subtexto)]">{titulo}</p>
      <p className="text-2xl font-bold mt-1">{valor}</p>
    </div>
  );
}
