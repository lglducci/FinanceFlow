import { useNavigate } from "react-router-dom";

export default function AjudaRelatorios() {
  const navigate = useNavigate();

  const Bloco = ({ titulo, children }) => (
    <div className="bg-white rounded-xl shadow p-5 space-y-2">
      <h2 className="text-lg font-bold text-blue-800">{titulo}</h2>
      <div className="text-sm text-gray-700 space-y-2">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="bg-[#0b1f3a] text-white py-8 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">📊 Relatórios</h1>

        <button
          onClick={() => navigate("/ajuda")}
          className="text-sm underline"
        >
          ← Voltar
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-4xl mx-auto p-6 space-y-4">

        {/* O QUE SÃO */}
        <Bloco titulo="📘 O que são os relatórios?">
          <p>
            Os relatórios mostram o resultado da sua empresa com base nos lançamentos registrados.
          </p>
          <p>
            Eles organizam as informações de forma clara para você entender se está ganhando ou perdendo dinheiro.
          </p>
        </Bloco>

        {/* PRINCIPAIS */}
        <Bloco titulo="📊 Principais relatórios">
          <ul className="list-disc ml-5">
            <li>DRE (Resultado da empresa)</li>
            <li>Entradas e Saídas</li>
            <li>Resumo por período</li>
            <li>Movimento contábil</li>
          </ul>
        </Bloco>

        {/* DRE */}
        <Bloco titulo="💰 DRE (Demonstrativo de Resultado)">
          <p>
            Mostra se sua empresa teve lucro ou prejuízo.
          </p>
          <p>
            Ele considera:
          </p>
          <ul className="list-disc ml-5">
            <li>Receitas</li>
            <li>Custos</li>
            <li>Despesas</li>
          </ul>
        </Bloco>

        {/* IMPORTANTE */}
        <Bloco titulo="⚠️ Importante">
          <p>
            Os relatórios dependem totalmente da forma como você registra os dados.
          </p>
          <p>
            Se classificar errado, o resultado também ficará errado.
          </p>
        </Bloco>

        {/* DICA */}
        <Bloco titulo="💡 Dica prática">
          <p>
            Use os relatórios para tomar decisões, não apenas para visualizar números.
          </p>
          <p>
            Exemplo:
          </p>
          <ul className="list-disc ml-5">
            <li>Despesas altas → cortar custos</li>
            <li>Receita baixa → aumentar vendas</li>
          </ul>
        </Bloco>

      </div>

    </div>
  );
}