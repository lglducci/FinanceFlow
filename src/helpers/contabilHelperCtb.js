 export function explicarLancamento(tipo_evento) {

  switch (tipo_evento) {

    // =============================
    // VENDA A PRAZO
    // =============================
    case "venda_prazo":
      return {
        historico: "Venda a prazo",
        lancamentos: [
          {
            tipo: "Receita",
            debito: "Clientes (1.1.2)",
            credito: "Receita (4.x)",
            texto: "Reconhecimento da receita."
          },
          {
            tipo: "Custo (se houver)",
            debito: "Custo (5.x)",
            credito: "—",
            texto: "Caso exista custo vinculado à venda."
          }
        ]
      };

    // =============================
    // VENDA À VISTA
    // =============================
    case "venda_avista":
      return {
        historico: "Venda à vista",
        lancamentos: [
          {
            tipo: "Receita",
            debito: "Banco/Caixa (1.1)",
            credito: "Receita (4.x)",
            texto: "Entrada imediata."
          },
          {
            tipo: "Custo (se houver)",
            debito: "Custo (5.x)",
            credito: "—",
            texto: "Caso exista custo vinculado."
          }
        ]
      };

    // =============================
    // COMPRA A PRAZO (🔥 TODAS OPÇÕES)
    // =============================
    case "compra_prazo":
      return {
        historico: "Compra a prazo (pode assumir várias naturezas)",
        lancamentos: [

          {
            tipo: "Despesa",
            debito: "Despesa (6.x)",
            credito: "Fornecedores (2.1.1)",
            texto: "Ex: aluguel, energia, serviços."
          },

          {
            tipo: "Custo",
            debito: "Custo (5.x)",
            credito: "Fornecedores (2.1.1)",
            texto: "Ex: insumos da operação."
          },

          {
            tipo: "Imobilizado",
            debito: "Imobilizado (1.2)",
            credito: "Fornecedores (2.1.1)",
            texto: "Ex: equipamentos, máquinas."
          },
         
          

        ]
      };

    // =============================
    // COMPRA À VISTA (🔥 TODAS OPÇÕES)
    // =============================
    case "compra_avista":
      return {
        historico: "Compra à vista",
        lancamentos: [

          {
            tipo: "Despesa",
            debito: "Despesa (6.x)",
            credito: "Banco/Caixa (1.1)",
            texto: "Pagamento imediato."
          },

          {
            tipo: "Custo",
            debito: "Custo (5.x)",
            credito: "Banco/Caixa (1.1)",
            texto: "Insumos pagos à vista."
          },

          {
            tipo: "Imobilizado",
            debito: "Imobilizado (1.2)",
            credito: "Banco/Caixa (1.1)",
            texto: "Compra de ativo."
          }

        ]
      };

    // =============================
    // PAGAMENTO FORNECEDOR
    // =============================
    case "pagamento_fornecedor":
      return {
        historico: "Pagamento de fornecedor",
        lancamentos: [
          {
            debito: "Fornecedores (2.1.1)",
            credito: "Banco (1.1)",
            texto: "Liquidação da dívida."
          }
        ]
      };

    // =============================
    // RECEBIMENTO CLIENTE
    // =============================
    case "recebimento_cliente":
      return {
        historico: "Recebimento de cliente",
        lancamentos: [
          {
            debito: "Banco/Caixa (1.1)",
            credito: "Clientes (1.1.2)",
            texto: "Baixa do contas a receber."
          }
        ]
      };

    // =============================
    // TRANSFERÊNCIA
    // =============================
    case "transferencia_bancaria":
      return {
        historico: "Transferência bancária",
        lancamentos: [
          {
            debito: "Banco destino ( 1.1.1.x Bradesco-ag-2330-2 conta 0123-1 ) ",
            credito: "Banco origem ( 1.1.1.y Itau - ag 100 conta 23343-9 )",
            texto: "Movimentação interna."
          }
        ]
      };

    // =============================
    // APORTE
    // =============================
    case "aporte_socio":
      return {
        historico: "Aporte de sócio",
        lancamentos: [
          {
            debito: "Banco (1.1)",
            credito: "Capital Social (3.1.1)",
            texto: "Entrada de capital."
          }
        ]
      };

    // =============================
    // RETIRADA
    // =============================
    case "retirada_socio":
      return {
        historico: "Retirada de sócio",
        lancamentos: [
          {
            debito: "Patrimônio Líquido",
            credito: "Banco (1.1)",
            texto: "Saída de recursos."
          }
        ]
      };

    // =============================
    // IMPOSTO
    // =============================
    case "pagamento_imposto":
      return {
        historico: "Pagamento de imposto",
        lancamentos: [
          {
            debito: "Impostos a pagar",
            credito: "Banco (1.1)",
            texto: "Quitação."
          }
        ]
      };

    // =============================
    // EMPRÉSTIMO
    // =============================
    case "emprestimo_entrada":
      return {
        historico: "Entrada de empréstimo",
        lancamentos: [
          {
            debito: "Banco (1.1)",
            credito: "Empréstimos a pagar",
            texto: "Geração de dívida."
          }
        ]
      };

    case "emprestimo_pagamento":
      return {
        historico: "Pagamento de empréstimo",
        lancamentos: [
          {
            debito: "Empréstimos a pagar",
            credito: "Banco (1.1)",
            texto: "Redução da dívida."
          }
        ]
      };

    // =============================
    // PRÓ-LABORE
    // =============================
    case "pro_labore":
      return {
        historico: "Pagamento de pró-labore",
        lancamentos: [
          {
            debito: "Despesa (6.x)",
            credito: "Banco (1.1)",
            texto: "Remuneração de sócios."
          }
        ]
      };

    // =============================
    // DEPRECIAÇÃO
    // =============================
    case "depreciacao":
      return {
        historico: "Depreciação",
        lancamentos: [
          {
            debito: "Despesa (6.x)",
            credito: "Depreciação acumulada (1.2)",
            texto: "Ajuste contábil sem saída de caixa."
          }
        ]
      };

    // =============================
    // AJUSTE
    // =============================
    case "ajuste_contabil":
      return {
        historico: "Ajuste contábil",
        lancamentos: [
          {
            debito: "Conta a definir",
            credito: "Conta a definir",
            texto: "Ajuste manual."
          }
        ]
      };

    default:
      return null;
  }
}