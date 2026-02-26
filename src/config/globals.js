// globals.js

// Domínio base do webhook
//export const DOMINIO =    'https://webhook.lglducci.com.br/webhook/';
export const DOMINIO = 'https://webhook-homolog.lglducci.com.br/webhook/'     
/**
 * Função helper para gerar URLs completas de webhooks
 * @param {string} path - Caminho do webhook (ex: 'consultasaldo')
 * @param {object} params - Objeto de parâmetros de query (ex: {inicio: '2025-11-01', fim: '2025-11-18'})
 * @returns {string} - URL completa
 */
export function buildWebhookUrl(path, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return `${DOMINIO}${path}${queryString ? '?' + queryString : ''}`;
}



export async function postWebhook(endpoint, payload) {
  const url = buildWebhookUrl(endpoint);

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const texto = await resp.text();

  let json;
  try {
    json = JSON.parse(texto);
  } catch {
    throw new Error("Servidor retornou resposta inválida.");
  }

  const item = Array.isArray(json) ? json[0] : json;

  if (!item) {
    throw new Error("Resposta vazia do servidor.");
  }

  if (item.ok === false) {
    throw new Error(item.message || "Erro na operação.");
  }

  return item.data ?? item;
}
