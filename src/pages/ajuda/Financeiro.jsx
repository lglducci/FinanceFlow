
 import { useNavigate } from "react-router-dom";

export default function Financeiro() {

    const navigate = useNavigate();  
  return (
    <div className="min-h-screen bg-gray-100">


     
        <button
          onClick={() => navigate("/ajuda")}
          className="bg-white text-[#0b1f3a] px-3 py-1 rounded font-bold "
        >
          ← Voltar
        </button>

      <div className="bg-[#0b1f3a] text-white py-8 text-center">
        <h1 className="text-2xl font-bold">💰 Entradas e Saídas</h1>
      </div>

      <div className="max-w-3xl mx-auto p-6 bg-white mt-6 rounded-xl shadow">

        <p className="mb-4">
          Aqui você registra o dinheiro que entra e sai do seu negócio.
        </p>

        <div className="mb-4">
          <h2 className="font-semibold mb-2">Exemplo:</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✔ Venda → Entrada</li>
            <li>✔ Pagamento → Saída</li>
          </ul>
        </div>

        <div className="bg-blue-50 p-3 rounded text-sm">
          💡 Se o dinheiro já entrou ou saiu → use esta tela
        </div>

      </div>
    </div>
  );
}