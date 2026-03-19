import { useNavigate } from "react-router-dom";

export default function AjudaCartoes() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">

      {/* VOLTAR */}
      <div className="p-4">
        <button
          onClick={() => navigate("/ajuda")}
          className="bg-white text-[#0b1f3a] px-3 py-1 rounded font-bold"
        >
          ← Voltar
        </button>
      </div>

      {/* HEADER */}
      <div className="bg-[#0b1f3a] text-white py-8 text-center">
        <h1 className="text-2xl font-bold">
          💳 Cartões
        </h1>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-3xl mx-auto p-6 bg-white mt-6 rounded-xl shadow text-sm text-gray-700 space-y-5">

        {/* CONCEITO */}
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded">
          Aqui você controla compras e vendas feitas no cartão.
        </div>

        {/* EXPLICAÇÃO */}
        <div>
          <h2 className="font-semibold text-lg">💡 Como funciona o cartão?</h2>
          <p>
            Quando você usa cartão, o dinheiro não entra ou sai na hora.
            Ele passa por uma fatura.
          </p>
        </div>

        {/* COMPRA */}
        <div>
          <h2 className="font-semibold text-lg">📤 Compra no Cartão</h2>
          <p>
            Quando você compra algo no cartão, vira uma dívida futura.
          </p>

          <div className="mt-2">
            ✔ Compra hoje<br />
            ✔ Vai para fatura<br />
            ✔ Paga depois
          </div>
        </div>

        {/* VENDA */}
        <div>
          <h2 className="font-semibold text-lg">📥 Venda no Cartão</h2>
          <p>
            Quando você vende no cartão, o dinheiro não entra na hora.
          </p>

          <div className="mt-2">
            ✔ Venda realizada<br />
            ✔ Operadora processa<br />
            ✔ Recebe depois
          </div>
        </div>

        {/* FATURA */}
        <div>
          <h2 className="font-semibold text-lg">📅 Fatura</h2>
          <p>
            A fatura é onde ficam todas as compras do cartão até o pagamento.
          </p>
        </div>

        {/* IMPORTANTE */}
        <div className="bg-yellow-100 text-yellow-900 p-3 rounded">
          💡 Cartão NÃO é dinheiro imediato. Ele vira uma movimentação futura.
        </div>

        {/* RESUMO */}
        <div className="bg-green-100 text-green-900 p-3 rounded">
          ✔ Comprou → vai para fatura<br />
          ✔ Vendeu → vai receber depois<br />
          ✔ Pagou fatura → vira financeiro
        </div>

      </div>
    </div>
  );
}
