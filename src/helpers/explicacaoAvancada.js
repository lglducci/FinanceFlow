export function explicarContexto(deb, cred) {
  if (!deb || !cred) return null;

  const d = deb.codigo?.[0];
  const c = cred.codigo?.[0];

  // RECEITA SEM CLIENTE
  if (d === "1" && c === "4") {
    return {
      titulo: "💡 Receita direta no caixa",
      texto:
        "Você está reconhecendo receita direto no caixa/banco. " +
        "Isso é correto para vendas à vista. " +
        "Se for venda a prazo ou cartão, deveria usar Clientes ou Cartões a Receber."
    };
  }

  // DESPESA COM FORNECEDOR (ERRADO)
  if (d === "6" && c === "2") {
    return {
      titulo: "⚠️ Possível erro conceitual",
      texto:
        "Você está registrando despesa contra passivo (fornecedor). " +
        "Isso pode estar correto (compra a prazo), mas atenção: " +
        "a despesa só deve ocorrer no consumo, não na compra."
    };
  }

  // ESTOQUE → CUSTO
  if (d === "5" && c === "1") {
    return {
      titulo: "📦 Baixa de estoque",
      texto:
        "Esse lançamento representa saída de estoque para custo (CMV). " +
        "Normalmente ocorre no momento da venda."
    };
  }

  // ATIVO → ATIVO
  if (d === "1" && c === "1") {
    return {
      titulo: "🔄 Transferência",
      texto:
        "Movimentação interna entre contas do ativo (ex: caixa → banco). " +
        "Não afeta resultado."
    };
  }

  return null;
}