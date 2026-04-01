 export function explicarLancamento(tipo_evento, tipo_es, classificacao) {

  if (!tipo_evento) {
    return null;
  }

  classificacao = classificacao?.trim().toLowerCase();
 
  // =============================
  // RECEBER
  // =============================
  if (tipo_evento === "receber") {
    return {
      debito: "Clientes (1.1.2.01)",
      credito: "Receita (4.x)",
      texto: "Registro da venda. O cliente passa a dever para a empresa."
    };
  }

  // =============================
  // RECEBER CARTÃO
  // =============================
  if (tipo_evento === "receber_cartao") {
    return {
      debito: "Cartões a receber (1.1.2.02)",
      credito: "Receita (4.x)",
      texto: "Venda no cartão. A operadora passa a dever para a empresa."
    };
  }
 
  // =============================
  // CONTA A PAGAR
  // =============================

  if (tipo_evento === "pagar") {
      if (tipo_es === "saida") {

        if (classificacao === "despesa") {
          return {
            debito: "Despesa (6.x)",
            credito: "Banco/Caixa (1.1.x)",
            texto: "Fornecedores a Pagar."
          };
        }

        if (classificacao === "custo") {
          return {
            debito: "Custo (5.x)",
            credito: "Banco/Caixa (2.1)",
            texto: "Pagamento de custo."
          };
        }

        if (classificacao === "imobilizado") {
          return {
            debito: "Imobilizado (1.2)",
            credito: "Banco/Caixa (1.1)",
            texto: "Aquisição de ativo pago à vista."
          };
        }

        if (classificacao === "passivo") {
          return { 
            debito: "Passivo (2.2.x)",
            credito: "Banco/Caixa (1.1.x)",
            texto: "Pagamento de passivo."
          };
        }

      }
    }
  // =============================
  // CARTÃO
  // =============================
  if (tipo_evento === "cartao_compra") {

    if (classificacao === "despesa") {
      return {
        debito: "Despesa (6.x)",
        credito: "Cartão a pagar (2.1.3)",
       texto: "Compra no cartão (gera obrigação com a operadora)."
      };
    }

    if (classificacao === "custo") {
      return {
        debito: "Custo (5.x)",
        credito: "Cartão a pagar (2.1.3)",
        texto: "Compra de custo via cartão."
      };
    }

    if (classificacao === "imobilizado") {
      return {
        debito: "Imobilizado (1.2)",
        credito: "Cartão a pagar (2.1.3)",
        texto: "Compra de ativo via cartão."
      };
    }

  }

  // =============================
  // FINANCEIRO
  // =============================
  if (tipo_evento === "financeiro") {

    if (tipo_es === "entrada") {

      if (classificacao === "receita") {
        return {
          debito: "Banco/Caixa (1.1)",
          credito: "Receita (4.x)",
          texto: "Entrada de dinheiro aumenta o ativo e gera receita."
        };
      }

      if (classificacao === "passivo") {
        return {
          debito: "Banco/Caixa (1.1)",
          credito: "Passivo (2.x)",
          texto: "Entrada de dinheiro proveniente de empréstimo."
        };
      }

    }

    if (tipo_es === "saida") {

      if (classificacao === "despesa") {
        return {
          debito: "Despesa (6.x)",
          credito: "Banco/Caixa (1.1)",
          texto: "Pagamento de despesa."
        };
      }

      if (classificacao === "imobilizado") {
        return {
          debito: "Imobilizado (1.2)",
          credito: "Banco/Caixa (1.1)",
          texto: "Aquisição de ativo pago à vista."
        };
      }

        if (classificacao === "custo") {
          return {
            debito: "Custo (5.x)",
            credito: "Banco/Caixa (1.1)",
            texto: "Pagamento de custo."
          };
        }

    }

  }

  return null;
}