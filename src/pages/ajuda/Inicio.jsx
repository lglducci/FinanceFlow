import { useNavigate } from "react-router-dom";

export default function AjudaInicio() {
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
        <h1 className="text-2xl font-bold">🚀 Começar</h1>

        <button
          onClick={() => navigate("/ajuda")}
          className="text-sm underline"
        >
          ← Voltar
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-4xl mx-auto p-6 space-y-4">

        {/* PASSO 1 */}
        <Bloco titulo="1️⃣ Registrar movimentações">
          <p>
            Comece registrando tudo que entra e sai da empresa.
          </p>
          <p>
            Entradas = dinheiro que entra (vendas, recebimentos)
          </p>
          <p>
            Saídas = dinheiro que sai (despesas, compras)
          </p>
        </Bloco>

        {/* PASSO 2 */}
        <Bloco titulo="2️⃣ Classificar corretamente">
          <p>
            Cada movimentação precisa ter uma classificação:
          </p>
          <ul className="list-disc ml-5">
            <li>Receita → aumenta lucro</li>
            <li>Despesa → reduz lucro</li>
            <li>Custo → ligado à operação</li>
            <li>Ativo / Passivo → movimentações financeiras</li>
          </ul>
        </Bloco>

        {/* PASSO 3 */}
        <Bloco titulo="3️⃣ Acompanhar resultados">
          <p>
            Após registrar e classificar, o sistema mostra:
          </p>
          <ul className="list-disc ml-5">
            <li>Lucro ou prejuízo</li>
            <li>Total de despesas</li>
            <li>Total de receitas</li>
          </ul>
        </Bloco>

        {/* PASSO 4 */}
        <Bloco titulo="4️⃣ Entender o objetivo">
          <p>
            O sistema não é para controle fiscal.
          </p>
          <p>
            Ele existe para mostrar se sua empresa está saudável.
          </p>
        </Bloco>

      </div>

    </div>
  );
}