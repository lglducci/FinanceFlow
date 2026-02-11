import { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";


export default function RelatoriosDiario() {
  const hoje = new Date().toISOString().slice(0, 10);

  const [empresaId, setEmpresaId] = useState(null);
  const [dataIni, setDataIni] = useState(hojeMaisDias(-1));
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
    const [filtro, setFiltro] = useState("");

  const navigate = useNavigate();
    const btnPadrao =
  "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";


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



  async function consultar() {
    if (!empresaId) return alert("Empresa não carregada");

    setLoading(true);
   // setDados([]);

    try {
      const r = await fetch(buildWebhookUrl("movimento_contabil"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: empresaId,
          data_ini: dataIni,
          data_fim: dataFim,
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

const filtrados = dados.filter(item => {
  if (!filtro) return true;

  const f = filtro.toLowerCase();

  return (
    (item.conta_credito || "").toLowerCase().includes(f) ||
    (item.conta_debito || "").toLowerCase().includes(f) ||
    (item.historico || "").toLowerCase().includes(f) ||
    (item.modelo_codigo || "").toLowerCase().includes(f)
  );
});


 async function Estornar(lote_id) {
  if (!confirm("Tem certeza que deseja estornar este lote de lançamento?")) return;

  try {
    const url = buildWebhookUrl("excluilanctolote");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa_id: empresaId, lote_id}),
    });

    const texto = await resp.text();
    const arr = JSON.parse(texto);

    const resultado = arr?.[0]?.data?.ff_excluir_lancamentos_lote;

    if (!resultado) {
      alert("Resposta inválida do servidor");
      return;
    }

    if (!resultado.success) {
      alert(resultado.message || "Erro ao excluir lote");
      return;
    }

    alert("Lote excluído com sucesso!");

    // ✅ RECARREGA A LISTA COM dataIni / dataFim ATUAIS
    consultar();

  } catch (e) {
    console.error("ERRO Estornar:", e);
    alert("Erro ao estornar.");
  }
}

return (
  <div className="p-4 bg-gray-100 rounded-xl">

    {/* ===== FILTROS ===== */}
    <div className="bg-white rounded-xl shadow border-l-4 border-blue-600 p-4 mb-6">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">
        📘 Lançamentos Contábeis (Detalhes) 
      </h2>

      <div className="flex flex-wrap gap-4 items-end">

        <div className="flex flex-col">
          <label className="font-bold text-blue-800 mb-1">Data inicial</label>
          <input
            type="date"
            value={dataIni}
            onChange={(e) => setDataIni(e.target.value)}
            className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-bold text-blue-800 mb-1">Data final</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <div className="flex flex-col flex-1 min-w-[260px]">
          <label className="font-bold text-blue-800 mb-1">Conta / Histórico</label>
          <input
            type="text"
            placeholder="Conta, histórico ou modelo"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <button
          onClick={consultar}
          className="px-6 h-11 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-700"
        >
          Consultar
        </button>

        <button
          onClick={() => navigate("/lancamentocontabilrapido")}
          className="px-6 h-11 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-600"
        >
          ⚡ Lançamento rápido
        </button>

        <button
          onClick={() => window.print()}
          className="px-6 h-11 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600"
        >
          🖨️ Imprimir
        </button>
      </div>
    </div>

    {/* ===== TABELA ===== */}
    <div className="bg-white rounded-xl shadow p-4 border border-gray-400">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100 text-blue-800">
          <tr>
            <th className="p-2 text-left">Lançamento</th>
            <th className="p-2 text-left">Data</th>
            <th className="p-2 text-left">Histórico</th>
            <th className="p-2 text-left">Débito</th>
            <th className="p-2 text-left">Crédito</th>
            <th className="p-2 text-right">Valor</th>
            <th className="p-2 text-center">Lote</th>
            <th className="p-2 text-center">Ação</th>
          </tr>
        </thead>

        <tbody>
          {filtrados.map((l, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}
            >
              <td className="p-2 font-bold">{l.id}</td>
              <td className="p-2 font-bold">{formatarDataBR(l.data)}</td>
              <td className="p-2 font-bold">{l.historico}</td>
              <td className="p-2 font-bold">{l.conta_debito}</td>
              <td className="p-2 font-bold">{l.conta_credito}</td>
              <td className="p-2 text-right font-bold">
                {fmt.format(l.credito)}
              </td>
              <td className="p-2 text-center font-bold">{l.lote_id}</td>
              <td className="p-2 text-center">
                <button
                  onClick={() => Estornar(l.lote_id)}
                  className="text-blue-700 underline font-bold"
                >
                  Excluir lote
                </button>
              </td>
            </tr>
          ))}

          {!loading && dados.length === 0 && (
            <tr>
              <td colSpan={8} className="py-6 text-center text-gray-500">
                Nenhum lançamento encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {loading && (
        <div className="p-6 text-center text-blue-600 font-semibold">
          Carregando...
        </div>
      )}
    </div>

  </div>
);

   
  
}
