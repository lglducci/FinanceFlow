export function determinarTipoOperacao(codigoDebito, codigoCredito) {
  if (!codigoDebito || !codigoCredito) return null;

  const deb = codigoDebito.trim();
  const cred = codigoCredito.trim();

  const deb1 = deb.charAt(0);
  const cred1 = cred.charAt(0);

  // 1️⃣ Compra a prazo (Ativo ← Passivo)
  if (deb1 === '1' && cred1 === '2') {
    if (deb.startsWith('1.2')) return 'IM'; // Imobilizado
    return 'CP'; // Conta a pagar
  }

  // 2️⃣ Venda a prazo (Ativo ← Receita)
  if (deb1 === '1' && cred1 === '4') {
    return 'CR';
  }

  // 3️⃣ Transferência (Ativo ↔ Ativo)
  if (deb1 === '1' && cred1 === '1') {
    return 'TR';
  }

  // 4️⃣ Despesa apropriada (Despesa ← Passivo)
  if (deb1 === '6' && cred1 === '2') {
    return 'CP';
  }

  // 5️⃣ Ajuste genérico
  return 'AJ';
}
