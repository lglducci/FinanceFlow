import * as XLSX from "xlsx";

export default class ExcelExport {

  static exportar(dados, nomeArquivo = "exportacao.xlsx") {

    if (!dados || dados.length === 0) {
      alert("Nenhum dado para exportar");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(dados);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planilha");

    XLSX.writeFile(wb, nomeArquivo);
  }

}