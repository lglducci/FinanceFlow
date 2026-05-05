import * as XLSX from "xlsx";

export default function ImportadorSicoob({ onTextoPronto }) {
  async function importarArquivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];

    const linhas = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      defval: "",
    });

    const resultado = [];
    let atual = null;

    for (let i = 1; i < linhas.length; i++) {
      const data = String(linhas[i][0] || "").trim();
      const historico = String(linhas[i][1] || "").trim();
      const valor = String(linhas[i][2] || "").trim();

      if (!data && !historico && !valor) continue;

      // Nova linha válida
      if (data && valor) {
        if (atual) resultado.push(atual);

        atual = {
          data,
          historico,
          valor,
        };
        continue;
      }

      // Continuação do histórico da linha anterior
      if (!data && historico && !valor && atual) {
        atual.historico = `${atual.historico} ${historico}`
          .replace(/\s+/g, " ")
          .trim();
      }
    }

    if (atual) resultado.push(atual);

    const textoPronto = resultado
      .map((l) => `${l.data}\t${l.historico}\t${l.valor}`)
      .join("\n");

    onTextoPronto(textoPronto);

    await navigator.clipboard.writeText(textoPronto);

    alert(
      `Arquivo Sicoob tratado com sucesso.\n\nLinhas finais: ${resultado.length}\nO conteúdo também foi copiado para a área de transferência.`
    );

    e.target.value = "";
  }

  return (
    <label className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold shadow cursor-pointer hover:brightness-110">
      📥 Importar Excel 
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={importarArquivo}
        className="hidden"
      />
    </label>
  );
}