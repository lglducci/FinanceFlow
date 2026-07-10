 import * as XLSX from "xlsx";

export default function ImportadorSicoob({ onTextoPronto }) {
  function limpar(v) {
    return String(v ?? "").trim();
  }

  function temValor(v) {
    const t = limpar(v).replace(/\s/g, "");
    return t && t !== "0" && t !== "0,00" && t !== "0.00";
  }

  function linhaEhData(v) {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(limpar(v));
  }

  function csvParaLinhas(texto) {
    return String(texto || "")
      .replace(/\r/g, "")
      .split("\n")
      .map((l) => l.split(";").map(limpar));
  }

  function tratarLinhas(linhas) {
    const resultado = [];

    for (const row of linhas) {
      const data = limpar(row[0]);
      const historico = limpar(row[1]);
      const valorUnico = limpar(row[2]);
      const credito = limpar(row[3]);
      const debito = limpar(row[4]);
 

      if (!linhaEhData(data)) continue;
      if (!historico) continue;

      let valor = "";

      // Bradesco: Data;Histórico;Docto.;Crédito;Débito;Saldo
      if (temValor(credito)) {
        valor = credito;
      } else if (temValor(debito)) {
        valor = `-${debito}`;
      }

      // Layout simples: Data;Histórico;Valor
      else if (temValor(valorUnico)) {
        valor = valorUnico;
      }

      if (!valor) continue;

      resultado.push({
        data,
        historico,
        valor,
      });
    }

    return resultado;
  }

  async function importarArquivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    let linhas = [];

    if (file.name.toLowerCase().endsWith(".csv")) {
      const texto = await file.text();
      linhas = csvParaLinhas(texto);
    } else {
      const buffer = await file.arrayBuffer();

      const wb = XLSX.read(buffer, {
        type: "array",
        raw: false,
      });

      const ws = wb.Sheets[wb.SheetNames[0]];

      linhas = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        defval: "",
        raw: false,
      });
    }

    const resultado = tratarLinhas(linhas);

    if (!resultado.length) {
      alert("Nenhuma linha válida encontrada no arquivo.");
      e.target.value = "";
      return;
    }

    const textoPronto = resultado
      .map((l) => `${l.data}\t${l.historico}\t${l.valor}`)
      .join("\n");

    onTextoPronto(textoPronto);

    try {
      await navigator.clipboard.writeText(textoPronto);
    } catch {}

    alert(`Arquivo tratado com sucesso.\n\nLinhas finais: ${resultado.length}`);

    e.target.value = "";
  }

  return (
    <label className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm shadow-sm hover:bg-slate-50 transition cursor-pointer">
      📥 Importar Excel
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={importarArquivo}
        className="hidden"
      />
    </label>
  );
}