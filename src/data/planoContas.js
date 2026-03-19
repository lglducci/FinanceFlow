 export const planoContas = [
  {
    codigo: "1",
    nome: "Ativo",
    descricao: "Representa todos os bens e direitos da empresa.",
    filhos: [
      {
        codigo: "1.1",
        nome: "Ativo Circulante",
        descricao: "Itens que podem ser convertidos em dinheiro no curto prazo (até 12 meses).",
        filhos: [
          {
            codigo: "1.1.1",
            nome: "Caixa",
            descricao: "Dinheiro físico disponível imediatamente na empresa."
          },
          {
            codigo: "1.1.2",
            nome: "Bancos",
            descricao: "Valores disponíveis em contas bancárias da empresa."
          },
          {
            codigo: "1.1.3",
            nome: "Clientes",
            descricao: "Valores a receber de clientes por vendas realizadas a prazo."
          },
          {
            codigo: "1.1.4",
            nome: "Estoques",
            descricao: "Mercadorias ou produtos disponíveis para venda."
          }
        ]
      },
      {
        codigo: "1.2",
        nome: "Ativo Não Circulante",
        descricao: "Bens e direitos de longo prazo, utilizados na operação da empresa.",
        filhos: [
          {
            codigo: "1.2.1",
            nome: "Imobilizado",
            descricao: "Bens utilizados nas atividades da empresa, como máquinas e equipamentos."
          },
          {
            codigo: "1.2.2",
            nome: "Veículos",
            descricao: "Automóveis utilizados nas operações da empresa."
          }
        ]
      }
    ]
  },

  {
    codigo: "2",
    nome: "Passivo",
    descricao: "Representa todas as obrigações e dívidas da empresa.",
    filhos: [
      {
        codigo: "2.1",
        nome: "Passivo Circulante",
        descricao: "Obrigações que devem ser pagas no curto prazo.",
        filhos: [
          {
            codigo: "2.1.1",
            nome: "Fornecedores",
            descricao: "Valores a pagar a fornecedores por compras realizadas."
          },
          {
            codigo: "2.1.2",
            nome: "Obrigações",
            descricao: "Compromissos da empresa como impostos, salários e encargos."
          }
        ]
      }
    ]
  },

  {
    codigo: "4",
    nome: "Receitas",
    descricao: "Entradas de recursos geradas pela atividade da empresa.",
    filhos: [
      {
        codigo: "4.1",
        nome: "Receita Operacional",
        descricao: "Receitas provenientes da atividade principal da empresa.",
        filhos: [
          {
            codigo: "4.1.1",
            nome: "Vendas",
            descricao: "Receita obtida com a venda de produtos."
          },
          {
            codigo: "4.1.2",
            nome: "Serviços",
            descricao: "Receita obtida pela prestação de serviços."
          }
        ]
      }
    ]
  },

  {
    codigo: "5",
    nome: "Custos",
    descricao: "Gastos diretamente relacionados à produção ou venda de produtos/serviços.",
    filhos: [
      {
        codigo: "5.1",
        nome: "Custo da Mercadoria Vendida",
        descricao: "Custos diretamente ligados à geração da receita.",
        filhos: [
          {
            codigo: "5.1.1",
            nome: "Compra de Mercadorias",
            descricao: "Valor gasto na aquisição de produtos para revenda."
          },
          {
            codigo: "5.1.2",
            nome: "Fretes",
            descricao: "Custos com transporte de mercadorias."
          }
        ]
      }
    ]
  },

  {
    codigo: "6",
    nome: "Despesas",
    descricao: "Gastos necessários para manter a empresa funcionando.",
    filhos: [
      {
        codigo: "6.1",
        nome: "Despesas Operacionais",
        descricao: "Despesas relacionadas à administração e operação da empresa.",
        filhos: [
          {
            codigo: "6.1.1",
            nome: "Salários",
            descricao: "Pagamentos realizados aos funcionários."
          },
          {
            codigo: "6.1.2",
            nome: "Aluguel",
            descricao: "Valor pago pelo uso de imóvel."
          },
          {
            codigo: "6.1.3",
            nome: "Energia",
            descricao: "Despesas com consumo de energia elétrica."
          }
        ]
      }
    ]
  }
];