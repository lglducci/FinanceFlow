
import { useNavigate } from "react-router-dom";


export default function AjudaLancamentos() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-100">
       <button
          onClick={() => navigate("/transactions")}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-[#0b1f3a] text-white px-3 py-1 rounded font-bold"
        >
          ← Voltar
        </button>
      {/* HEADER */}
      <div className="bg-[#0b1f3a] text-white py-6 text-center">
        <h1 className="text-2xl font-bold">💰 Lançamentos</h1>

        
        <p className="text-sm opacity-80">
          O centro financeiro do sistema
        </p>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-4xl mx-auto p-6 bg-white mt-6 rounded-xl shadow space-y-6 text-gray-700 text-sm leading-relaxed">

        {/* VISÃO GERAL */}
        <div>
          <p className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            A tela de <strong>Lançamentos</strong> é o núcleo do sistema.
            Tudo que acontece financeiramente na empresa passa por aqui.
          </p>

          <p>
            Diferente de sistemas tradicionais que separam tudo em várias telas,
            aqui você trabalha de forma centralizada: entradas, saídas, contas a pagar,
            contas a receber, cartão e movimentações à vista estão unificados.
          </p>

          <p className="font-semibold text-gray-900">
            👉 Você não precisa navegar entre várias telas. Tudo acontece aqui.
          </p>
        </div>

        {/* CONSULTA */}
        <div>
          <h2 className="font-bold text-lg text-[#0b1f3a]">🔎 Consulta e Filtros</h2>

          <p>
            A parte superior da tela permite localizar qualquer movimentação rapidamente.
          </p>

          <ul className="list-disc ml-6">
            <li>Definir período (data inicial e final)</li>
            <li>Filtrar por conta bancária</li>
            <li>Buscar por descrição ou informação do evento</li>
          </ul>

          <p>
            Os botões ajudam a segmentar os dados:
          </p>

          <ul className="list-disc ml-6">
            <li><strong>Todos</strong> → visão completa</li>
            <li><strong>Financeiro</strong> → visão geral</li>
            <li><strong>Contas a Receber</strong></li>
            <li><strong>Contas a Pagar</strong></li>
            <li><strong>Compras Cartão</strong></li>
            <li><strong>Fatura Cartão</strong></li>
            <li><strong>Vencidos</strong></li>
          </ul>

          <p className="bg-yellow-50 p-3 rounded">
            👉 Você navega dentro da própria tela. Não precisa trocar de página.
          </p>
        </div>

        {/* NOVO LANÇAMENTO */}
        <div>
          <h2 className="font-bold text-lg text-[#0b1f3a]">➕ Novo Lançamento</h2>

          <p>
            O botão <strong>Novo Lançamento</strong> abre o formulário principal,
            onde qualquer evento financeiro pode ser registrado.
          </p>

          <p>Você informa:</p>

          <ul className="list-disc ml-6">
            <li>Tipo (entrada ou saída)</li>
            <li>Categoria</li>
            <li>Forma de pagamento</li>
            <li>Valor</li>
            <li>Data</li>
            <li>Descrição</li>
          </ul>

          <p className="font-semibold">
            👉 Tudo em um único formulário simples e direto.
          </p>
        </div>

        {/* CADASTRO INLINE */}
        <div>
          <h2 className="font-bold text-lg text-[#0b1f3a]">⚡ Cadastro sem sair da tela</h2>

          <p>
            Durante o lançamento, você pode criar novos registros sem sair da tela.
          </p>

          <p>
            Nos campos de seleção, existe a opção:
          </p>

          <div className="bg-green-600 text-white inline-block px-3 py-1 rounded">
            + Novo
          </div>

          <p>Com isso você pode cadastrar na hora:</p>

          <ul className="list-disc ml-6">
            <li>Categoria</li>
            <li>Fornecedor</li>
            <li>Conta financeira</li>
            <li>Cartão</li>
            <li>Classificação contábil</li>
          </ul>

          <p className="bg-green-50 p-3 rounded">
            👉 Isso elimina retrabalho e torna o sistema extremamente ágil.
          </p>
        </div>

        {/* BAIXAS */}
        <div>
          <h2 className="font-bold text-lg text-[#0b1f3a]">💳 Pagamentos e Recebimentos</h2>

          <p>
            Na própria listagem você consegue executar ações diretamente:
          </p>

          <ul className="list-disc ml-6">
            <li>Pagar contas</li>
            <li>Receber valores</li>
            <li>Controlar cartão</li>
          </ul>

          <p className="bg-blue-50 p-3 rounded">
            👉 Você resolve tudo sem abrir outras telas.
          </p>
        </div>

        {/* IMPRESSÃO */}
        <div>
          <h2 className="font-bold text-lg text-[#0b1f3a]">🖨️ Impressão</h2>

          <p>
            O botão <strong>Imprimir</strong> gera um relatório com base nos filtros atuais.
          </p>

          <p>
            Pode ser utilizado para:
          </p>

          <ul className="list-disc ml-6">
            <li>Gerar PDF</li>
            <li>Impressão física</li>
          </ul>
        </div>

        {/* CONTABIL */}
        <div>
          <h2 className="font-bold text-lg text-[#0b1f3a]">🧠 Contabilidade Pré Progamada</h2>

          <p>
            Você não precisa entender contabilidade para usar o sistema.
          </p>

          <p>
            Cada lançamento realizado:
          </p>

          <ul className="list-disc ml-6">
            <li>Já está vinculado a contas contábeis</li>
            <li>Já segue regras pré-configuradas</li>
            <li>Já alimenta relatórios automaticamente</li>
          </ul>

          <div className="bg-green-100 p-4 rounded text-center font-semibold text-lg">
            Você registra o financeiro.<br />
            O sistema faz a contabilidade Pré Progamada.
          </div>
        </div>

        {/* RESUMO */}
        <div>
          <h2 className="font-bold text-lg text-[#0b1f3a]">🎯 Resumo</h2>

          <ul className="list-disc ml-6">
            <li>Tudo em uma única tela</li>
            <li>Sem necessidade de navegar entre páginas</li>
            <li>Cadastro rápido integrado</li>
            <li>Controle total do financeiro</li>
            <li>Contabilidade automática</li>
          </ul>
        </div>

      </div>
    </div>
  );
}