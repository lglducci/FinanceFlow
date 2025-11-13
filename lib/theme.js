export async function getThemeByEmpresa(id_empresa) {
  // Simulação – depois você puxa do Supabase!
  if (id_empresa === 999) {
    return {
      primaria: "#FF6A00",
      primariaLight: "#FFA000",
      bg: "#ffffff",
      card: "#f7f7f7",
      texto: "#1a1a1a",
      subtexto: "#555",
    };
  }

  // Tema padrão
  return {
    primaria: "#0057FF",
    primariaLight: "#197AFF",
    bg: "#ffffff",
    card: "#f5f7fa",
    texto: "#111",
    subtexto: "#333",
  };
}
