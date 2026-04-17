 import * as XLSX from "xlsx";

export default class ExcelExport {
  static exportarTemplateContas(contas, nomeArquivo = "template_contas.xlsx") {
    if (!contas || contas.length === 0) {
      alert("Nenhum dado para exportar");
      return;
    }

    // ABA 1 - CONTAS
    const dadosContas = contas.map((c) => ({
      ID: c.id,
      Codigo: String(c.codigo ?? ""),
      Nome: c.nome ?? "",
      Ativo: c.ativo ?? 1
    }));

    const wsContas = XLSX.utils.json_to_sheet(dadosContas);

    // ABA 2 - LAYOUT  data historico conta valor saldo nomeconta
     const layout = [];
for (let i = 0; i < 200; i++) {
  layout.push({
    Data: "",
    Historico: "",
    Conta: "",
    Valor: "",
    Saldo: "",
    NomeConta: ""
  });
}

    const wsLayout = XLSX.utils.json_to_sheet(layout);

    // fórmula na coluna F (NomeConta), buscando código digitado na coluna E
   for (let row = 2; row <= 201; row++) {
  wsLayout[`F${row}`] = {
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