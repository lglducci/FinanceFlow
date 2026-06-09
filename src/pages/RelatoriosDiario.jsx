 import { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate,useLocation } from "react-router-dom";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
import ExcelExport from "../utils/ExcelExport";
import ModalBase from "../components/ModalBase";
import { Funnel } from "lucide-react";
import { Trash2 } from "lucide-react";
import { FileSpreadsheet } from "lucide-react";
import { FileUp } from "lucide-react";


export default function RelatoriosDiario() {
  const hoje = new Date().toISOString().slice(0, 10);
    
  const location = useLocation();
  const [empresaId, setEmpresaId] = useState(null);
  const [dataIni, setDataIni] = useState( hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
    const [filtro, setFiltro] = useState("");
const [modalFiltro, setModalFiltro] = useState(false);

  const navigate = useNavigate();
    const btnPadrao =
  "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";


 const [importacoes, setImportacoes] = useState([]);
const [importacaoSelecionada, setImportacaoSelecionada] = useState("");
const [importacaoFiltroAplicado, setImportacaoFiltroAplicado] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");
    if (id) setEmpresaId(Number(id));
  }, []);

  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  {/*const fmtData = (d) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "";*/}

 
function formatarDataBR(data) {
  if (!data) return "";
  const d = new Date(data);
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const ano = d.getUTCFullYear();
  return `${dia}-${mes}-${ano}`;
}


 async function consultar(importacaoIdParam = null) {
  if (!empresaId) return alert("Empresa não carregada");

  const importacaoIdFinal =
    importacaoIdParam !== null
      ? Number(importacaoIdParam) || 0
      : Number(importacaoSelecionada) || 0;

  setLoading(true);

    try {
      const r = await fetch(buildWebhookUrl("movimento_contabil"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: empresaId,
          data_ini: dataIni,
          data_fim: dataFim,
          todos:'T',
          importacao_id: importacaoIdParam  || 0
        }),
      });

      const json = await r.json();
      setDados(Array.isArray(json) ? json : []);
    } catch {
      alert("Erro ao carregar diário contábil");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  if (!empresaId) return;

  consultar();

}, [empresaId, dataIni, dataFim]);

 const filtrados = dados.filter((item) => {
  const f = filtro.toLowerCase();

  return (
    !filtro ||
    (item.conta_credito || "").toLowerCase().includes(f) ||
    (item.conta_debito || "").toLowerCase().includes(f) ||
    (item.historico || "").toLowerCase().includes(f) ||
    (item.modelo_codigo || "").toLowerCase().includes(f) ||
    String(item.lote_id || "").toLowerCase().includes(f) ||
    String(item.id || "").toLowerCase().includes(f)
  );
});




 async function Estornar(lote_id, importacao_id) {
  const loteId = Number(lote_id) || 0;
  const importacaoId = Number(importacao_id) || 0;

  let mensagem = "";

  if (loteId === 0 && importacaoId > 0) {
    mensagem = `ATENÇÃO\n\nVocê está excluindo a IMPORTAÇÃO número ${importacaoId}.\n\nIsso apagará todos os lançamentos vinculados a essa importação.\n\nDeseja continuar?`;
  } else if (loteId > 0 && importacaoId === 0) {
    mensagem = `ATENÇÃO\n\nVocê está excluindo o LOTE número ${loteId}.\n\nIsso apagará somente os lançamentos desse lote.\n\nDeseja continuar?`;
  } else {
    alert("Parâmetros inválidos para exclusão.");
    return;
  }

  if (!confirm(mensagem)) return;

  try {
    const url = buildWebhookUrl("excluilanctolote");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: empresaId,
        lote_id,
        importacao_id
      }),
    });

    const texto = await resp.text();

    console.log("🔎 Resposta bruta:", texto);

    let arr;
    try {
      arr = JSON.parse(texto);
    } catch (err) {
      console.error("❌ Erro ao fazer parse do JSON:", err);
      alert("Servidor retornou algo inválido.");
      return;
    }

    console.log("🔎 JSON parseado:", arr);

    const item = arr?.[0];

    console.log("🔎 Item[0]:", item);

    if (!item?.ok) {
      alert(item?.message || "Erro no servidor");
      return;
    }

    alert(importacaoId > 0 ? "Importação excluída com sucesso!" : "Lote excluído com sucesso!");

    if (importacaoId > 0) {
  setImportacaoSelecionada("");
  setImportacaoFiltroAplicado("");
  await carregarImportacoes();
}

 
      await consultar(importacaoSelecionada || 0);

  } catch (e) {
    console.error("ERRO Estornar:", e);
    alert("Erro ao estornar.");
  }
}

 function exportarExcel() {

  const dadosExcel = filtrados.map(l => ({
    Lancamento: l.id,
    Data: formatarDataBR(l.data),
    Historico: l.historico,
    Debito: l.conta_debito,
    Credito: l.conta_credito,
    Valor: l.credito,
    Lote: l.lote_id
  }));

  ExcelExport.exportar(dadosExcel, "lancamentos_contabeis.xlsx");
}

const carregarImportacoes = async () => {
  try {
    const url = buildWebhookUrl("lote_importacao");

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        empresa_id: empresaId
      })
    });

    const data = await resp.json();

    const lista = Array.isArray(data) ? data : (data?.dados || []);
    setImportacoes(lista);
  } catch (err) {
    console.error("Erro ao carregar importações:", err);
    setImportacoes([]);
  }
};

useEffect(() => {
  carregarImportacoes();
}, []);

 const aplicarFiltro = async () => {
  await consultar(importacaoSelecionada || 0);
};

 const limparFiltro = async () => {
  setImportacaoSelecionada("");
  await consultar(0);
};


 useEffect(() => {
  const id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");
  if (id) setEmpresaId(Number(id));
}, []);

useEffect(() => {
  if (empresaId) {
    carregarImportacoes();
  }
}, [empresaId]);
 
 
return (
  <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6">
    <div className="mx-auto max-w-8xl">

      {/* CABEÇALHO */}
      <div className="mb-4 rounded-2xl bg-[#0f172a] px-5 py-4 text-white shadow-lg">
        <h1 className="text-xl md:text-2xl font-black">
          📘 Lançamentos Contábeis
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Consulta detalhada dos lançamentos, lotes e importações.
        </p>
      </div>

      {/* FILTROS */}
        <div className="mb-4 rounded-2xl bg-white border border-slate-200 shadow p-4">

  <div className="flex flex-col gap-4">

    {/* LINHA 1 - FILTRO APLICADO */}
 
     {/* LINHA 2 - BOTÕES */}
    <div className="flex flex-wrap items-center gap-4">

      <div className="text-sm font-black text-slate-700">
        Filtro aplicado:
      </div>

      <div className="mt-1 text-sm font-bold text-blue-800">
        {dataIni && `De ${formatarDataBR(dataIni)}`}
        {dataFim && ` até ${formatarDataBR(dataFim)}`}
        {filtro && ` • ${filtro}`}
        {!dataIni && !dataFim && !filtro && "Nenhum filtro aplicado"}
      </div> 

      <button
        onClick={() => setModalFiltro(true)}
        className="btn-pill btn-blue"
      >
          <Funnel size={16} />  Filtro
      </button>

      <button
        onClick={() => consultar()}
        className="btn-pill btn-white"
      >
        🔎 Pesquisar
      </button>

      <button
        onClick={() => window.print()}
        className="btn-pill btn-gray"
      >
        🖨️ Imprimir
      </button>

      <button
        onClick={exportarExcel}
        className="btn-pill btn-white"
      >
        <FileSpreadsheet size={16} />  Excel
      </button>

      <button
        onClick={() => navigate("/lancamentocontabilrapido")}
        className="btn-pill btn-emerald"
      >
        ⚡ Novo Lançamento
      </button>

      <button
        onClick={() => navigate("/livro-caixa")}
        className="btn-pill btn-white"
      >
        <FileUp size={16} /> Importar
      </button>

    </div>

  </div>
</div>

      {/* FILTRO IMPORTAÇÃO */}
      <div className="mb-4 rounded-2xl bg-white border border-slate-200 shadow p-4">
        <div className="flex flex-col md:flex-row md:items-end gap-3">

          <div className="w-full md:w-72">
            <label className="block text-sm font-black text-slate-700 mb-1">
               Importações
            </label>

            <select
              value={importacaoSelecionada}
              onChange={(e) => setImportacaoSelecionada(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-semibold
                         focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-700"
            >
              <option value="">Todas</option>

              {importacoes.map((imp, i) => (
                <option key={i} value={imp.importacao_id}>
                  {imp.importacao_id}
                </option>
              ))}
            </select>
          </div>

          <button onClick={aplicarFiltro} className="btn-pill btn-dark-blue">
               <Funnel size={16} /> Filtrar importação
          </button>

          <button onClick={limparFiltro} className="btn-pill btn-gray">
            Limpar
          </button>

          <button
            onClick={() => {
              if (!importacaoSelecionada) {
                alert("Selecione uma importação.");
                return;
              }
              Estornar(0, importacaoSelecionada);
            }}
            className="btn-pill btn-red"
          >
            <Trash2 size={16} /> Excluir 
          </button>

        </div>
      </div>

      {/* TABELA */}
      <div
        id="print-area"
        className="rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden"
      >
        <div className="bg-[#1e293b] px-4 py-3 text-white flex items-center justify-between">
          <div>
            <h2 className="font-black text-base">
              Detalhes dos lançamentos
            </h2>
            <p className="text-xs text-slate-300">
              Total de registros: {filtrados.length}
            </p>
          </div>

          {loading && (
            <span className="text-sm font-bold text-blue-200">
              Carregando...
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                <th className="p-3 text-left">Lancto ID</th>
                <th className="p-3 text-left">Data</th>
                <th className="p-3 text-left">Histórico</th>
                <th className="p-3 text-left">Débito</th>
                <th className="p-3 text-left">Crédito</th>
                <th className="p-3 text-right">Valor</th>
                <th className="p-3 text-center">Lote</th>
                <th className="p-3 text-center">Importação</th>
                <th className="p-3 text-center">Ação</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((l, i) => (
                <tr
                  key={i}
                  className={`border-b border-slate-200 hover:bg-blue-50 transition ${
                    i % 2 === 0 ? "bg-white" : "bg-slate-50"
                  }`}
                >
                  <td className="p-3 font-black text-slate-800">
                    {l.id}
                  </td>

                  <td className="p-3 font-bold text-slate-700 whitespace-nowrap">
                    {formatarDataBR(l.data)}
                  </td>

                  <td className="p-3 font-semibold text-slate-700 max-w-[420px] truncate">
                    {l.historico}
                  </td>

                  <td className="p-3 font-bold text-slate-700">
                    {l.conta_debito}
                  </td>

                  <td className="p-3 font-bold text-slate-700">
                    {l.conta_credito}
                  </td>

                  <td className="p-3 text-right font-black text-slate-900 whitespace-nowrap">
                    {fmt.format(l.credito)}
                  </td>

                  <td className="p-3 text-center">
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-700">
                      {l.lote_id}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">
                      {l.importacao_id || "-"}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => Estornar(l.lote_id, 0)}
                        className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-black text-red-700 hover:bg-red-200"
                      >
                        Excluir
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/lanctoctbrapeditar", {
                            state: { id: l.lote_id },
                          });
                        }}
                        className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-black text-blue-700 hover:bg-blue-200"
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && dados.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-bold">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="p-6 text-center text-blue-600 font-black">
            Carregando...
          </div>
        )}
      </div>

    </div>
   <ModalBase
  open={modalFiltro}
  title="Filtro de Lançamentos"
  onClose={() => setModalFiltro(false)}
>
  <div className="space-y-4">

    <div>
      <label className="block font-bold text-slate-700 mb-1">
        Data inicial
      </label>
      <input
        type="date"
        value={dataIni}
        onChange={(e) => setDataIni(e.target.value)}
        className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-semibold"
      />
    </div>

    <div>
      <label className="block font-bold text-slate-700 mb-1">
        Data final
      </label>
      <input
        type="date"
        value={dataFim}
        onChange={(e) => setDataFim(e.target.value)}
        className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-semibold"
      />
    </div>

    <div>
      <label className="block font-bold text-slate-700 mb-1">
        Conta / Histórico / Lançamento / Lote
      </label>
      <input
        type="text"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Digite conta, histórico, lançamento ou lote"
        className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-semibold"
      />
    </div>

    <div className="flex justify-end gap-2 pt-3">
      <button
        onClick={() => {
          setFiltro("");
          setDataIni(hojeLocal());
          setDataFim(hojeLocal());
        }}
        className="btn-pill btn-gray"
      >
        Limpar
      </button>

      <button
        onClick={() => {
          setModalFiltro(false);
          consultar();
        }}
        className="btn-pill btn-dark-blue"
      >
        Aplicar
      </button>
    </div>

  </div>
</ModalBase>
  </div>
);
   
  
}
