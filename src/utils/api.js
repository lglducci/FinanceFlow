 // src/utils/api.js

 
import { buildWebhookUrl } from "../config/globals";

export async function callApi(url, payload = null, method = "POST") {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (payload) {
    options.body = JSON.stringify(payload);
  }

  let resp;
  try {
    resp = await fetch(url, options);
  } catch {
    throw new Error("Falha de comunicação com o servidor.");
  }

  let json = {};
  try {
    json = await resp.json();
  } catch {
    throw new Error("Resposta inválida do servidor.");
  }

  // ❌ ERRO FUNCIONAL OU HTTP
  if (!resp.ok || json.success === false) {
    throw new Error(json.message || "Erro inesperado.");
  }

  // ✅ SUCESSO
  return json;
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
    throw new Error("Resposta inválida do servidor.");
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