import { useNavigate } from "react-router-dom";

export default function AjudaContabil() {
  const navigate = useNavigate();

  const LinkItem = ({ titulo, link }) => (
    <div
      onClick={() => navigate(link)}
      className="cursor-pointer text-blue-600 underline"
    >
      🔗 {titulo}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100"> 
    
      <div className="bg-[#0b1f3a] text-white py-8 px-6 relative">

      <button
        onClick={() => navigate("/ajuda")}
        className="absolute right-6 top-4  bg-[#0b1f3a]  text-white px-3 py-1 rounded font-bold"
      >
        ← Voltar
      </button>

  <h1 className="text-2xl font-bold text-center">
    📘 Contabilidade
  </h1>

</div>
       
      {/* CONTEÚDO */}
      <div className="max-w-3xl mx-auto p-6 bg-white mt-1 rounded-xl shadow text-sm text-gray-700 space-y-6">
      

        {/* DEFINIÇÃO */}
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded">
          <p className="mb-2">
            A contabilidade é o controle completo do seu negócio, registrando tudo que acontece de forma organizada e padronizada.
          </p>

          <div>
            ✔ o que você tem (ativos)<br />
            ✔ o que você deve (passivos)<br />
            ✔ quanto você ganhou ou perdeu (resultado)
          </div>
        </div>

        {/* DIFERENÇA */}
        <div>
          <h2 className="font-semibold text-lg mb-2">💡 Financeiro x Contábil</h2>

          <div className="bg-gray-50 p-3 rounded">
            <div>✔ Financeiro → dinheiro real (entrou/saiu)</div>
            <div>✔ Contábil → visão completa do negócio</div>
          </div>
        </div>

        {/* PLANO DE CONTAS */}
        <div>
          <h2 className="font-semibold text-lg mb-2">📊 Plano de Contas</h2>

          <div className="space-y-1">
            <div>1 - Ativos (o que você tem)</div>
            <div>2 - Passivos (o que você deve)</div>
            <div>3 - Patrimônio</div>
            <div>4 - Receitas</div>
            <div>5 - Custos</div>
            <div>6 - Despesas</div>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Esses grupos organizam toda a contabilidade do sistema.
          </div>
        </div>

        {/* COMO O SISTEMA FUNCIONA */}
        <div className="bg-green-50 border border-green-200 text-green-900 p-4 rounded">
          <h2 className="font-semibold mb-2">🤖 Como o sistema usa isso</h2>

          <p>
            Você não precisa lançar contabilidade manualmente.
          </p>

          <p className="mt-2">
            O sistema gera automaticamente os lançamentos contábeis com base no financeiro.
          </p>
        </div>

        {/* LINKS */}
        <div>
          <h2 className="font-semibold text-lg mb-2">🔗 Explorar mais</h2>

          <div className="space-y-2">
            <LinkItem titulo="Plano de contas detalhado" link="/ajuda/contabil-plano" />
            <LinkItem titulo="Partida dobrada (como funciona)" link="/ajuda/partida-dobrada" />
            <LinkItem titulo="Relatórios contábeis" link="/ajuda/relatorios" />
          </div>
        </div>

      </div>
    </div>
  );
}