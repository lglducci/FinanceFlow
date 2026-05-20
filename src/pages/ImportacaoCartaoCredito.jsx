import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { buildWebhookUrl } from "../config/globals";
import { fetchSeguro } from "../utils/apiSafe";

export default function ImportacaoCartaoCredito() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id");

  const [cartoes, setCartoes] = useState([]);
  const [cartaoId, setCartaoId] = useState("");
  const [linhas, setLinhas] = useState([]);
  const [resumo, setResumo] = useState(null);
   
  const [dataReferencia, setDataReferencia] = useState("");
const [importacaoId, setImportacaoId] = useState(null);
const [salvando, setSalvando] = useState(false);
const [conciliando, setConciliando] = useState(false);
const [statusEtapa, setStatusEtapa] = useState("importar");
 
  const botaoBase = `
    px-5 py-2 rounded-full
    font-bold text-sm tracking-wide
    border-2 border-black
    shadow-[0_4px_12px_rgba(0,0,0,0.35)]
    hover:brightness-110 hover:scale-105
    active:scale-95
    transition-all duration-200
    inline-flex items-center gap-2
  `;

  useEffect(() => {
    carregarCartoes();
  }, []);

   



  
    async function carregarCartoes() {
      try {
        const resp = await fetch(buildWebhookUrl("cartoes", { id_empresa: empresa_id }));
        const data = await resp.json();
        setCartoes(Array.isArray(data) ? data : []);
      } catch {
        setCartoes([]);
      }
    }



  function normalizarTexto(txt) {
    return String(txt || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function localizarCampo(headers, opcoes) {
    const normalizados = headers.map((h) => normalizarTexto(h));

    for (const opcao of opcoes) {
      const idx = normalizados.findIndex((h) => h.includes(opcao));
      if (idx >= 0) return headers[idx];
    }

    return null;
  }

  function parseNumeroBR(valor) {
    if (valor == null) return 0;

    return (
      Number(
        String(valor)
          .replace("R$", "")
          .replace(/\s/g, "")
          .replace(/\./g, "")
          .replace(",", ".")
          .replace(/[^\d.-]/g, "")
      ) || 0
    );
  }

  function dataParaISO(valor) {
    if (!valor) return "";

    if (typeof valor === "number") {
      const data = XLSX.SSF.parse_date_code(valor);
      if (!data) return "";
      return `${data.y}-${String(data.m).padStart(2, "0")}-${String(data.d).padStart(2, "0")}`;
    }

    const txt = String(valor).trim();

    const m = txt.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;

    if (/^\d{4}-\d{2}-\d{2}$/.test(txt)) return txt;

    return "";
  }

  function interpretarParcela(texto) {
    const txt = String(texto || "").trim();

    if (!txt || txt === "-") {
      return { parcela_texto: null, parcela_atual: null, parcela_total: null };
    }

    let m = txt.match(/^(\d+)\s*de\s*(\d+)$/i);
    if (m) {
      return {
        parcela_texto: txt,
        parcela_atual: Number(m[1]),
        parcela_total: Number(m[2]),
      };
    }

    m = txt.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (m) {
      return {
        parcela_texto: txt,
        parcela_atual: Number(m[1]),
        parcela_total: Number(m[2]),
      };
    }

    return { parcela_texto: txt, parcela_atual: null, parcela_total: null };
  }

  function identificarTipo(estabelecimento, valor) {
    const txt = normalizarTexto(estabelecimento);

    if (valor < 0 && txt.includes("pagamento")) return "pagamento";
    if (valor < 0) return "credito";

    return "compra";
  }

  function converterPlanilha(json) {
    if (!json.length) return [];

    const headers = Object.keys(json[0]);

    const campoData = localizarCampo(headers, [
      "data",
      "dt",
      "data compra",
      "data lancamento",
    ]);

    const campoDescricao = localizarCampo(headers, [
      "estabelecimento",
      "descricao",
      "historico",
      "lancamento",
      "transacao",
      "merchant",
    ]);

    const campoValor = localizarCampo(headers, [
      "valor",
      "amount",
      "vlr",
      "total",
    ]);

    const campoPortador = localizarCampo(headers, [
      "portador",
      "titular",
      "nome",
      "cartao",
    ]);

    const campoParcela = localizarCampo(headers, [
      "parcela",
      "parcelas",
      "prestacao",
    ]);

    if (!campoData || !campoDescricao || !campoValor) {
      alert("Não consegui identificar Data, Descrição/Estabelecimento e Valor.");
      return [];
    }

    return json
      .map((row, index) => {
        const data = dataParaISO(row[campoData]);
        const estabelecimento = String(row[campoDescricao] || "").trim();
        const valor = parseNumeroBR(row[campoValor]);
        const portador = campoPortador ? String(row[campoPortador] || "").trim() : null;

        const parcela = interpretarParcela(campoParcela ? row[campoParcela] : null);
        const tipo_linha = identificarTipo(estabelecimento, valor);

        return {
          linha: index + 1,
          data,
          estabelecimento,
          portador,
          valor,
          parcela: parcela.parcela_texto,
          parcela_atual: parcela.parcela_atual,
          parcela_total: parcela.parcela_total,
          tipo_linha,
          dados_originais: row,
        };
      })
      .filter((l) => l.data && l.estabelecimento && l.valor !== 0);
  }

  async function importarArquivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const nome = file.name || "";
    const ext = nome.split(".").pop().toLowerCase();

    const buffer = await file.arrayBuffer();

   let json = [];

if (["xlsx", "xls"].includes(ext)) {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  json = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });
} else {
  const texto = new TextDecoder("utf-8").decode(buffer);

  const linhasTxt = texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const headers = linhasTxt[0].split(";").map((h) => h.trim());

  json = linhasTxt.slice(1).map((linha) => {
    const cols = linha.split(";").map((c) => c.trim());
    const obj = {};

    headers.forEach((h, i) => {
      obj[h] = cols[i] ?? "";
    });

    return obj;
  });
}

console.log("JSON LIDO:", json.length);
console.table(json);

const linhasConvertidas = converterPlanilha(json);

const sugestao = sugerirDataReferencia(linhasConvertidas);

if (sugestao) {
  setDataReferencia(sugestao);
} else {
  setDataReferencia("");
  alert("Não consegui sugerir a competência. Informe manualmente.");
}



 

    let totalCompras = 0;
    let totalCreditos = 0;

    linhasConvertidas.forEach((l) => {
      if (l.valor >= 0) totalCompras += l.valor;
      else totalCreditos += Math.abs(l.valor);
    });

    setLinhas(linhasConvertidas);

    setResumo({
      qtd: linhasConvertidas.length,
      compras: totalCompras,
      creditos: totalCreditos,
      liquido: totalCompras - totalCreditos,
    });
  }

  async function salvarImportacao() {
    if (!cartaoId) {
      alert("Selecione o cartão.");
      return;
    }

    if (!linhas.length) {
      alert("Nenhuma linha importada.");
      return;
    }

    const ids = linhas.map((l) => ({
      data: l.data,
      estabelecimento: l.estabelecimento,
      portador: l.portador,
      valor: l.valor,
      parcela: l.parcela,
      parcela_atual: l.parcela_atual,
      parcela_total: l.parcela_total,
      tipo_linha: l.tipo_linha,
      dados_originais: l.dados_originais,
    }));

     

    const payload = {
  empresa_id: Number(empresa_id),
  cartao_id: Number(cartaoId),
  origem: "CARTAO",
  ids,
  data_referencia:dataReferencia
};

    try {
      setSalvando(true);

      const url = buildWebhookUrl("conciliar_cartao");

      const resp = await fetchSeguro(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

         const retorno = Array.isArray(resp) ? resp[0] : resp;

const novoImportacaoId =
  retorno?.importacao_id ||
  retorno?.id ||
  retorno?.data?.importacao_id ||
  retorno?.retorno?.importacao_id ||
  retorno?.data?.[0]?.ff_importar_cartao_transacoes?.importacao_id;

if (!novoImportacaoId) {
  console.log("RETORNO SALVAR:", resp);
  throw new Error("Importação salva, mas o webhook não retornou importacao_id.");
}
console.log("IMPORTACAO_ID STATE:", novoImportacaoId);
setImportacaoId(Number(novoImportacaoId));
setStatusEtapa("conciliar");
    } catch (err) {
      alert(err.message || "Erro ao salvar importação.");
    } finally {
      setSalvando(false);
    }
  }

 function limpar() {
  setLinhas([]);
  setResumo(null);
  setImportacaoId(null);
  setDataReferencia("");
  setStatusEtapa("importar");
  setSalvando(false);
  setConciliando(false);
}

  async function conciliarImportacao() {
  if (!importacaoId) {
    alert("Salve a importação antes de conciliar.");
    return;
  }

  if (!dataReferencia) {
    alert("Informe a data de referência da fatura.");
    return;
  }

  try {
    setConciliando(true);

    const url = buildWebhookUrl("cartao_conciliar");

    const resp = await fetchSeguro(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: Number(empresa_id),
        importacao_id: Number(importacaoId),
        data_referencia: dataReferencia,
      }),
    });

    alert("Fatura conciliada com sucesso!");
    console.log("RETORNO CONCILIAR:", resp);

   limpar();
  } catch (err) {
    alert(err.message || "Erro ao conciliar importação.");
  } finally {
    setConciliando(false);
  }
}

function sugerirDataReferencia(linhasConvertidas) {
  const cartao = cartoes.find((c) => String(c.id) === String(cartaoId));
  const fechamentoDia = Number(cartao?.fechamento_dia || 31);

  

  const competencias = linhasConvertidas
    .filter((l) => l.tipo_linha === "compra" && Number(l.valor || 0) > 0 && l.data)
    .map((l) => {
      const parcelaAtual = Number(l.parcela_atual || 1);

      const [ano, mes, dia] = l.data.split("-").map(Number);
      const data = new Date(ano, mes - 1, dia);

      data.setMonth(data.getMonth() + (parcelaAtual - 1));

      let anoRef = data.getFullYear();
      let mesRef = data.getMonth();

      if (data.getDate() > fechamentoDia) {
        mesRef += 1;
      }

      const ref = new Date(anoRef, mesRef, 1);

      return ref.toISOString().slice(0, 10);
    })
    .sort();

  if (!competencias.length) return "";

  return competencias[competencias.length - 1];
}

 
 

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen pb-3">
      <div className="bg-white rounded-2xl border border-gray-300 w-[1400px] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="bg-gray-650 rounded-lg p-8">
          <div className="bg-gray-600 border-b rounded-t-xl p-2">
            <h2 className="text-lg font-semibold tracking-wide mb-4 text-gray-50">
              💳 Importação de Transações do Cartão
            </h2>

            <div className="grid grid-cols-[1fr_220px_220px] gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-50">
                  Cartão
                </label>

                <select
                  value={cartaoId}
                  onChange={(e) => setCartaoId(e.target.value)}
                  className="block border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Selecione</option>
                  {cartoes.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.nome || c.descricao || `Cartão ${c.id}`}
                    </option>
                  ))}
                </select>
              </div>

               <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-50">
                  Data referência da fatura
                </label>
                <input
                  type="date"
                  value={dataReferencia}
                  onChange={(e) => setDataReferencia(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                />

                {dataReferencia && (
                  <div className="text-xs text-yellow-100 font-bold mt-1">
                    Competência sugerida automaticamente. Confira antes de conciliar.
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="text-base text-gray-50">Total líquido</div>
                <div
                  className={`text-lg font-bold ${
                    (resumo?.liquido || 0) >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {(resumo?.liquido || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
            </div>
          </div>

          {resumo && (
            <div className="mt-4 bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded-lg text-base font-bold">
              ✔ {resumo.qtd} registros importados | Compras:{" "}
              {resumo.compras.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}{" "}
              | Créditos/Pagamentos:{" "}
              {resumo.creditos.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}{" "}
              | Líquido:{" "}
              {resumo.liquido.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          )}

          <div className="mt-4 max-h-[580px] overflow-y-auto rounded-xl border border-gray-200 bg-white">
            <div className="grid grid-cols-[110px_420px_220px_120px_130px_120px] gap-2 text-sm py-2 border-b border-gray-200 bg-gray-50">
              <div className="text-left font-bold">Data</div>
              <div className="text-left font-bold">Estabelecimento</div>
              <div className="text-left font-bold">Portador</div>
              <div className="text-center font-bold">Parcela</div>
              <div className="text-right font-bold">Valor</div>
              <div className="text-center font-bold">Tipo</div>
            </div>

            {linhas.map((l) => (
              <div
                key={l.linha}
                className="grid grid-cols-[110px_420px_220px_120px_130px_120px] gap-2 text-sm border-b py-1 hover:bg-gray-50"
              >
                <div>
                  {String(l.data || "").includes("-")
                    ? l.data.split("-").reverse().join("/")
                    : l.data}
                </div>

                <div className="truncate font-semibold">{l.estabelecimento}</div>

                <div className="truncate text-gray-600">{l.portador || "-"}</div>

                <div className="text-center">{l.parcela || "-"}</div>

                <div
                  className={`text-right font-mono font-bold ${
                    l.valor >= 0 ? "text-red-700" : "text-green-700"
                  }`}
                >
                  {Number(l.valor || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>

                <div className="text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      l.tipo_linha === "compra"
                        ? "bg-red-100 text-red-700"
                        : l.tipo_linha === "pagamento"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {l.tipo_linha}
                  </span>
                </div>
              </div>
            ))}
          </div>

           <div className="flex justify-end gap-3 mt-4">
              <label
                className={`${botaoBase} text-white bg-gradient-to-b from-cyan-500 via-teal-600 to-teal-800 cursor-pointer ${
                  statusEtapa !== "importar" ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                📥 Importar Excel
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt"
                  onChange={importarArquivo}
                  disabled={statusEtapa !== "importar"}
                  className="hidden"
                />
              </label>

              <button
                onClick={salvarImportacao}
                disabled={salvando || statusEtapa !== "importar"}
                className={`${botaoBase} text-white bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                💾 {salvando ? "Salvando..." : "Salvar prévia"}
              </button>

              <button
                onClick={conciliarImportacao}
                disabled={conciliando || statusEtapa !== "conciliar"}
                className={`${botaoBase} text-white bg-gradient-to-b from-emerald-500 via-green-600 to-green-800 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                ✅ {conciliando ? "Conciliando..." : "Conciliar"}
              </button>

              <button
                onClick={limpar}
                className={`${botaoBase} text-white bg-gradient-to-b from-red-500 via-red-600 to-red-800`}
              >
                🗑 Limpar
              </button>

              <button
                onClick={() => navigate("/contas-cartoes")}
                className={`${botaoBase} text-white bg-gradient-to-b from-zinc-500 via-zinc-600 to-zinc-800`}
              >
                ↩ Sair
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}