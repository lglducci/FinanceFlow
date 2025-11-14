import { useState } from "react";
import TransactionForm from "../components/TransactionForm.jsx";
import TransactionsTable from "../components/TransactionsTable.jsx";

export default function Transactions() {
  const [items, setItems] = useState([]);

  function addTransaction(tx) {
    setItems((prev) => [...prev, { id: Date.now(), ...tx }]);
  }

  function removeTransaction(id) {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Lançamentos</h2>
      <TransactionForm onAdd={addTransaction} />
      <TransactionsTable items={items} onRemove={removeTransaction} />
    </div>
  );
}
