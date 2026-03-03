 export async function fetchSeguro(url, options = {}) {
  const response = await fetch(url, options);

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(`Erro ${response.status}`);
  }

  // 🔵 Se vier array, pega o primeiro objeto
  if (Array.isArray(data) && data.length > 0) {
    data = data[0];
  }

  // ❌ HTTP error
  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.erro ||
      `Erro ${response.status}`
    );
  }

  // ❌ API retornou ok:false
  if (data?.ok === false) {
    throw new Error(data?.message || "Erro interno da aplicação.");
  }

  return data;
}