 
 import { useNavigate } from "react-router-dom";

 export default function AjudaContas() {

  
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
        <h1 className="text-2xl font-bold mb-6 text-white">
        📅 Contas a Pagar e Receber
      </h1>
      </div>
       <div className="max-w-3xl mx-auto p-6 bg-white mt-6 rounded-xl shadow"> 

        
      {/* CONCEITO */}
      <div className="bg-purple-50 border border-purple-200 text-purple-900 p-4 rounded mb-6 text-sm">
        Aqui você controla valores que <strong>ainda não foram pagos ou recebidos</strong>.
      </div>

      {/* EXPLICAÇÃO */}
      <div className="space-y-4 text-sm text-gray-700">

        <div>
          <h2 className="font-semibold text-lg">💡 O que são Contas Futuras?</h2>
          <p>
            São valores que vão acontecer no futuro, ou seja, ainda não entrou ou saiu dinheiro.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">📥 Contas a Receber</h2>
          <p>
            São valores que você tem para receber.
          </p>
          <div className="mt-2">
            ✔ Venda no cartão<br/>
            ✔ Cliente que vai pagar depois
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-lg">📤 Contas a Pagar</h2>
          <p>
            São valores que você ainda precisa pagar.
          </p>
          <div className="mt-2">
            ✔ Aluguel<br/>
            ✔ Conta de luz<br/>
            ✔ Fornecedor
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-lg">📅 Data de Vencimento</h2>
          <p>
            É o dia em que o pagamento ou recebimento deve acontecer.
          </p>
        </div>

        <div className="bg-yellow-100 text-yellow-900 p-3 rounded">
          💡 Enquanto não for pago ou recebido, continua aqui nesta tela.
        </div>

        <div>
          <h2 className="font-semibold text-lg">✅ O que é "Dar Baixa"</h2>
          <p>
            Quando o pagamento ou recebimento acontece de verdade.
          </p>

          <div className="mt-2">
            👉 Exemplo:
            <br />
            Você pagou a conta → dar baixa
            <br />
            Você recebeu do cliente → dar baixa
          </div>
        </div>

        <div className="bg-green-100 text-green-900 p-3 rounded">
          ✔ Depois da baixa, o lançamento vai para o financeiro (dinheiro realizado).
        </div>

      </div>

    </div>
    </div>

  );
}