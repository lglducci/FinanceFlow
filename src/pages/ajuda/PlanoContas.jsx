import { useNavigate } from "react-router-dom";

export default function PlanoContas() {
  const navigate = useNavigate();

  const Item = ({ codigo, titulo, desc, link }) => (
    <div className="border rounded-lg p-4 hover:shadow cursor-pointer transition">
      <div className="font-bold text-[#0f2a4d] mb-1">
        {codigo} - {titulo}
      </div>
      <div className="text-sm text-gray-600 mb-2">
        {desc}
      </div>
      <div
        onClick={() => navigate(link)}
        className="text-blue-600 text-sm underline"
      >
        🔗 Ver detalhes
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">

      {/* VOLTAR */}
      <div className="p-4">
        <button
          onClick={() => navigate("/ajuda/contabil")}
          className="bg-white text-[#0b1f3a] px-3 py-1 rounded font-bold"
        >
          ← Voltar
        </button>
      </div>

      {/* HEADER */}
      <div className="bg-[#0b1f3a] text-white py-8 text-center">
        <h1 className="text-2xl font-bold">
          📊 Plano de Contas
        </h1>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-4xl mx-auto p-6 bg-white mt-6 rounded-xl shadow text-sm text-gray-700 space-y-6">

        {/* EXPLICAÇÃO */}
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded">
          O plano de contas organiza toda a contabilidade do seu negócio.
          Cada grupo representa um tipo de informação financeira.
        </div>

        {/* LISTA */}
        <div className="grid md:grid-cols-2 gap-4">

          <Item
            codigo="1"
            titulo="Ativo"
            desc="Tudo que a empresa possui (dinheiro, bens, direitos)"
            link="/ajuda/planocontasaccordion"
          />

          <Item
            codigo="2"
            titulo="Passivo"
            desc="Tudo que a empresa deve (dívidas e obrigações)"
              link="/ajuda/planocontasaccordion"
          />

          <Item
            codigo="3"
            titulo="Patrimônio"
            desc="Valor da empresa (capital + lucros acumulados)"
             link="/ajuda/planocontasaccordion"
          />

          <Item
            codigo="4"
            titulo="Receitas"
            desc="Tudo que a empresa ganha"
              link="/ajuda/planocontasaccordion"
          />

          <Item
            codigo="5"
            titulo="Custos"
            desc="Gastos ligados diretamente ao produto/serviço"
             link="/ajuda/planocontasaccordion"
          />

          <Item
            codigo="6"
            titulo="Despesas"
            desc="Gastos para manter o negócio funcionando"
              link="/ajuda/planocontasaccordion"
          />

        </div>

      </div>
    </div>
  );
}