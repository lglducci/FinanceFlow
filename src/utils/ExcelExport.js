 import * as XLSX from "xlsx";

export default class ExcelExport {
  static exportar(dados, nomeArquivo = "exportacao.xlsx") {
    if (!dados || dados.length === 0) {
      alert("Nenhum dado para exportar");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Dados");
    XLSX.writeFile(wb, nomeArquivo);
  }

  static exportarTemplateContas(contas, nomeArquivo = "template_contas.xlsx") {
    if (!contas || contas.length === 0) {
      alert("Nenhum dado para exportar");
      return;
    }

    const dadosContas = contas.map((c) => ({
      ID: c.id,
      Codigo: String(c.codigo ?? ""),
      Nome: c.nome ?? "",
      Ativo: c.ativo ?? 1
    }));

    const wsContas = XLSX.utils.json_to_sheet(dadosContas);

    const layout = [];
    for (let i = 0; i < 200; i++) {
      layout.push({
        Data: "",
        Historico: "",
        Conta: "",
        Valor: "",
        NomeConta: ""
      });
    }

    const wsLayout = XLSX.utils.json_to_sheet(layout);

    for (let row = 2; row <= 201; row++) {
      wsLayout[`E${row}`] = {
        t: "s",
        f: `IFERROR(VLOOKUP(C${row},Contas!B:C,2,FALSE),"")`
      };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsContas, "Contas");
    XLSX.utils.book_append_sheet(wb, wsLayout, "Layout");

    XLSX.writeFile(wb, nomeArquivo);
  }
}