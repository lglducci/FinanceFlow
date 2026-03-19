import { useState } from "react";

export default function AjudaFinanceiro() {
  const [step, setStep] = useState(0);

  const passos = [
    {
      campo: "tipo",
      titulo: "Tipo (Entrada / Saída)",
      texto: "Entrada = dinheiro que entra. Saída = dinheiro que sai."
    },
    {
      campo: "classificacao",
      titulo: "Classificação",
      texto: "Define se é despesa, receita ou transferência. Impacta os relatórios."
    },
    {
      campo: "forma",
      titulo: "Forma de Pagamento",
      texto: "Como foi pago: dinheiro, cartão, PIX."
    },
    {
      campo: "categoria",
      titulo: "Categoria",
      texto: "Organiza o financeiro (ex: alimentação, aluguel)."
    },
    {
      campo: "fim",
      titulo: "Pronto!",
      texto: "Agora é só salvar o lançamento 👍"
    }
  ];

  const atual = passos[step];

  const destaque = (campo) =>
    atual.campo === campo
      ? "border-2 border-blue-500 bg-blue-50"
      : "border";

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h1 className="text-2xl font-bold mb-6 text-[#0f2a4d]">
        💰 Como usar o lançamento financeiro
      </h1>

      <div className="grid md:grid-cols-2 gap-8">

        {/* SIMULAÇÃO */}
        <div className="bg-white rounded-xl shadow p-5 space-y-4">

          <div className={destaque("tipo")}>
            <label>Tipo</label>
            <div className="p-2">Saída</div>
          </div>

          <div className={destaque("categoria")}>
            <label>Categoria</label>
            <div className="p-2">Alimentação</div>
          </div>

          <div className={destaque("forma")}>
            <label>Forma de pagamento</label>
            <div className="p-2">Cartão</div>
          </div>

          <div className="border p-2">
            <label>Valor</label>
            <div>R$ 150,00</div>
          </div>

          <div className="border p-2">
            <label>Data</label>
            <div>18/03/2026</div>
          </div>

          <div className={destaque("classificacao")}>
            <label>Classificação</label>
            <div className="p-2">Despesa</div>
          </div>

          <div className="border p-2">
            <label>Descrição</label>
            <div>Compra de insumos</div>
          </div>

        </div>

        {/* EXPLICAÇÃO */}
        <div className="bg-gray-50 rounded-xl p-5 shadow">

          <h2 className="font-semibold text-lg mb-2">
            {atual.titulo}
          </h2>

          <p className="text-gray-600 mb-6">
            {atual.texto}
          </p>

          <div className="flex justify-between">

            <button
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Voltar
            </button>
            
            {step < passos.length - 1 ? (
                    <button
                        onClick={() => setStep(step + 1)}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Próximo
                    </button>
                    ) : (
                    <button
                        onClick={() => setStep(0)}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                        Recomeçar
                    </button>
                    )}

          </div>

        </div>

      </div>
    </div>
  );
}