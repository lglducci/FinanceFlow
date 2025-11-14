 export default function Dashboard() {
  return (
    <div className="p-6 space-y-8">

      <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card titulo="Saldo Atual" valor="R$ 12.540,22" />
        <Card titulo="Próxima Fatura" valor="R$ 1.280,90" />
        <Card titulo="Receitas (Mês)" valor="R$ 8.250,00" />
        <Card titulo="Despesas (Mês)" valor="R$ 5.430,00" />
      </div>

      {/* BOTÕES DE AÇÃO */}
      <div className="flex gap-4">
        <ActionButton texto="Nova Despesa" cor="bg-red-500" />
        <ActionButton texto="Nova Receita" cor="bg-green-500" />
        <ActionButton texto="Lançamento Cartão" cor="bg-blue-500" />
      </div>

      {/* LISTAGEM */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-semibold mb-3">Últimos lançamentos</h2>

        <ul className="space-y-2">
          <Item desc="Supermercado" valor="- 230,00" tipo="despesa" />
          <Item desc="Venda Online" valor="+ 480,00" tipo="receita" />
          <Item desc="Energia Elétrica" valor="- 198,00" tipo="despesa" />
        </ul>
      </div>

      {/* GRÁFICO */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-semibold">Gráfico Receitas x Despesas</h2>
        <div className="h-40 mt-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

function Card({ titulo, valor }) {
  return (
    <div className="bg-white p-5 rounded-xl border shadow">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold mt-1">{valor}</p>
    </div>
  );
}

function ActionButton({ texto, cor }) {
  return (
    <button className={`${cor} text-white px-4 py-2 rounded-lg shadow`}>
      {texto}
    </button>
  );
}

function Item({ desc, valor, tipo }) {
  return (
    <li className="flex justify-between border-b pb-1">
      <span>{desc}</span>
      <span className={tipo === "despesa" ? "text-red-600" : "text-green-600"}>
        {valor}
      </span>
    </li>
  );
}
