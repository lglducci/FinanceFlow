 import * as XLSX from "xlsx";

export default class ExcelExport {
  static exportar(dados, nomeArquivo = "exportacao.xlsx") {
    if (!dados || dados.length === 0) {
      alert("Nenhum dado para exportar");
      return;
    }

    const camposNumericos =
      /valor|saldo|total|margem|percentual|perc/i;

    const dadosFormatados = dados.map((linha) => {
      const novaLinha = {};

      Object.entries(linha).forEach(([campo, valor]) => {
        if (
          camposNumericos.test(campo) &&
          valor !== null &&
          valor !== ""
        ) {
          novaLinha[campo] = Number(valor);
        } else {
          novaLinha[campo] = valor;
        }
      });

      return novaLinha;
    });

    const ws = XLSX.utils.json_to_sheet(dadosFormatados);

    if (ws["!ref"]) {
      const range = XLSX.utils.decode_range(ws["!ref"]);

      for (
        let coluna = range.s.c;
        coluna <= range.e.c;
        coluna++
      ) {
        const cabecalhoRef = XLSX.utils.encode_cell({
          r: 0,
          c: coluna,
        });

        const nomeColuna = String(
          ws[cabecalhoRef]?.v || ""
        );

        if (!camposNumericos.test(nomeColuna)) {
          continue;
        }

        for (
          let linha = 1;
          linha <= range.e.r;
          linha++
        ) {
          const celulaRef = XLSX.utils.encode_cell({
            r: linha,
            c: coluna,
          });

          const celula = ws[celulaRef];

          if (celula && celula.t === "n") {
            celula.z = "#,##0.00";
          }
        }
      }
    }

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Dados");
    XLSX.writeFile(wb, nomeArquivo, {
      cellStyles: true,
    });
  }

  static exportarTemplateContas(
    contas,
    nomeArquivo = "template_contas.xlsx"
  ) {
    if (!contas || contas.length === 0) {
      alert("Nenhum dado para exportar");
      return;
    }

    const dadosContas = contas.map((c) => ({
      ID: c.id,
      Codigo: String(c.codigo ?? ""),
      Nome: c.nome ?? "",
      Ativo: c.ativo ?? 1,
    }));

    const wsContas =
      XLSX.utils.json_to_sheet(dadosContas);

    const layout = [];

    for (let i = 0; i < 200; i++) {
      layout.push({
        Data: "",
        Historico: "",
        Conta: "",
        Valor: null,
        NomeConta: "",
      });
    }

    const wsLayout =
      XLSX.utils.json_to_sheet(layout);

    for (let row = 2; row <= 201; row++) {
      wsLayout[`E${row}`] = {
        t: "s",
        f: `IFERROR(VLOOKUP(C${row},Contas!B:C,2,FALSE),"")`,
      };
    }

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      wsContas,
      "Contas"
    );

    XLSX.utils.book_append_sheet(
      wb,
      wsLayout,
      "Layout"
    );

    XLSX.writeFile(wb, nomeArquivo);
  }
}