   //import { useState } from "react";
  import { useState, useEffect } from "react";

import { buildWebhookUrl } from "../config/globals";
import { callApi } from "../utils/api";   
import { hojeLocal, dataLocal } from "../utils/dataLocal";


export default function ProcessarDiario() {
  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [arquivo, setArquivo] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [msg, setMsg] = useState("");
  const [showHelp, setShowHelp] = useState(false); // 👈 NOVO
// Datas do processamento
const hoje = new Date().toISOString().substring(0, 10);

const [dataIni, setDataIni] = useState(hojeLocal());
const [dataFim, setDataFim] = useState(hojeLocal());
 
const [loadingDatas, setLoadingDatas] = useState(true);
const [ultimoFechamento, setUltimoFechamento] = useState("15/04/2025"); 
// depois você liga no webhook

 const btnPadrao =
  "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";

     
 

  // ---------------------------------------
  // EXCLUIR LOTE
  
  // ---------------------------------------
  
  // ---------------------------------------
  // FILTRO
  const itensFiltrados = lotes.filter((l) => {
    if (filtro === "ok" && l.status !== "ok") return false;
    if (filtro === "erro" && l.status !== "erro") return false;
    return true;
  });

  const totalLinhas = lotes.length;
  const totalOk = lotes.filter((x) => x.status === "ok").length;
  const totalErro = lotes.filter((x) => x.status === "erro").length;

  const somaOk = lotes
    .filter((x) => x.status === "ok")
    .reduce((s, x) => s + Number(x.valor_total || 0), 0);

  const somaErro = lotes
    .filter((x) => x.status === "erro")
    .reduce((s, x) => s + Number(x.valor_total || 0), 0);

  const estilosBtn = {
    padding: "10px 16px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  };

  // -----------------------------
  // MODAL DE AJUDA (HTML Simples)
  const helpModal = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "70%",
          maxHeight: "80%",
          overflowY: "auto",
          background: "white",
          padding: 20,
          borderRadius: 10,
          border: "3px solid #003ba2",
        }}
      >
         
 
  
        <button
          onClick={() => setShowHelp(false)}
          style={{
            marginTop: 20,
            padding: "10px 18px",
            background: "#003ba2",
            color: "white",
            border: "none",
            borderRadius: 6,
          }}
        >
          Fechar
        </button>
      </div>
    </div>
  );

  function addOneDay(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().substring(0, 10);
}

async function gerarStaging() {
  try {
    setMsg("⏳ Gerando STAGING..."); 

    const data = await callApi(
      buildWebhookUrl("gerar_staging"),
      {
        empresa_id,
        data_ini: dataIni,
        data_fim: dataFim
      }
    );

    setLotes(data); 

    const qtdErros = data.filter(l => l.status === "erro").length;

    if (qtdErros > 0) {
      setMsg(`❌ Existem ${qtdErros} linhas com erro. Corrija antes de continuar.`);
    } else {
      setMsg("✅ STAGING gerado com sucesso. 1º Fase concluida com sucesso. Verifique possiveis erros no relório abaixo.");
      alert("✅ STAGING gerado com sucesso.  1º Fase concluida com sucesso.");
      alert("✅ Verifique possiveis erros no relório abaixo.");
    }

  } catch (e) {
    alert("❌ " + e.message);
  }
}

 

async function consolidarDiario() {
  try {
    setMsg("⏳ Consolidando diário...");
     setLotes([]);
   const data = await callApi(
      buildWebhookUrl("consolidar_diario"),
      { empresa_id }
    );
       
      setLotes(data); 
     setMsg("✅ Diário consolidado.2º Fase concluida com sucesso. ✅ Verifique possiveis erros no relório abaixo.");
     alert("✅ Diário gerado com sucesso.  2º Fase concluida com sucesso.");
      alert("✅ Verifique possiveis erros no relório abaixo.");
  } catch (e) {
    alert("❌ " + e.message);
  }
}

 
async function gerarContabil() {
  try {
    setMsg("⏳ Gerando Contábil...");
    await callApi(
      buildWebhookUrl("gerar_contabil"),
      { empresa_id ,
    data_ini: dataIni,
    data_fim: dataFim }
    );
    setMsg("✅ Contábil gerado com sucesso. 3º Fase concluida. Verifique seus relatórios contábeis.");
    alert("✅ Contábil gerado com sucesso. Verifique seus relatórios contábeis.");
     
    setDataIni(addOneDay(dataFim));
    setDataFim(addOneDay(dataFim));
  } catch (e) {
    alert("❌ " + e.message);
  }
}
 
  
 useEffect(() => {
  async function carregar() {
    try {
      if (!empresa_id) {
        console.error("empresa_id ausente");
        return;
      }

      const url = buildWebhookUrl("ultimo_processamento", { empresa_id });

      const r = await fetch(url);
      const text = await r.text();
      if (!text) return;

      const resp = JSON.parse(text);
      const item = Array.isArray(resp) ? resp[0] : resp;

      if (!item?.ultimo_dia_processado) return;

      const data = item.ultimo_dia_processado.slice(0, 10);

      setUltimoFechamento(data);
      setDataIni(data);
      setDataFim(data);
    } finally {
      setLoadingDatas(false);
    }
  }

  carregar();
}, [empresa_id]);

 
 async function voltadata() {
  try {
    setMsg("⏳ Gerando Contábil...");
    await callApi(
      buildWebhookUrl("voltadata"),
      { empresa_id  }
    );
     carregar();
    setMsg("✅ Contábil gerado com sucesso. Fase 3 concluida");
   
  } catch (e) {
    alert("❌ " + e.message);
  }
}
 

  // ---------------------------------------
  // RENDER
 return (
  <div className="min-h-screen bg-gray-50 p-6">

    {/* HEADER */}
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-800">
        📥 Geração Contábil
      </h2>
      <p className="text-sm text-gray-500">
        1) Pré-Diário → 2) Diário → 3) Geração Contábil
      </p>
    </div>

    {/* CARD PROCESSAMENTO */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">

      <div className="flex flex-col gap-4">

        {ultimoFechamento && (
          <div className="bg-gray-100 text-gray-700 text-sm p-3 rounded-lg">
            Último fechamento contábil: <b>{ultimoFechamento}</b>
          </div>
        )}

        <div className="flex gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              className="input-premium"
              value={dataIni}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Data Final
            </label>
            <input
              type="date"
              className="input-premium"
              value={dataFim}
              max={new Date().toISOString().substring(0, 10)}
              onChange={e => setDataFim(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={gerarStaging}
            className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:opacity-90"
          >
            STAGING (Fase 1)
          </button>

          <button
            onClick={consolidarDiario}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:opacity-90"
          >
            Diário (Fase 2)
          </button>

          <button
            onClick={gerarContabil}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:opacity-90"
          >
            Contábil (Fase Final)
          </button>

          <button
            onClick={voltadata}
            className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:opacity-90"
          >
            Voltar Data
          </button>
        </div>
      </div>
    </div>

    {/* RESUMO */}
    {msg && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 text-sm text-gray-700">
        <div className="font-semibold mb-2">{msg}</div>
        <div className="flex flex-wrap gap-6">
          <span>📄 Total: {totalLinhas}</span>
          <span className="text-green-600">
            ✔ Válidas: {totalOk} (R$ {somaOk.toFixed(2)})
          </span>
          <span className="text-red-500">
            ✖ Erros: {totalErro} (R$ {somaErro.toFixed(2)})
          </span>
        </div>
      </div>
    )}

    {/* TABELA */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 text-left">Data</th>
            <th className="p-3 text-left">Token</th>
            <th className="p-3 text-left">Histórico</th>
            <th className="p-3 text-left">Doc</th>
            <th className="p-3 text-left">Valor</th>
            <th className="p-3 text-left">CNPJ</th>
            <th className="p-3 text-left">Validação</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Lote</th>
          </tr>
        </thead>
        <tbody>
          {itensFiltrados.map((l) => (
            <tr
              key={l.id}
              className={`border-t ${
                l.status === "erro"
                  ? "bg-red-50"
                  : "bg-green-50"
              }`}
            >
              <td className="p-3">{l.data_mov?.substring(0, 10)}</td>
              <td className="p-3">{l.modelo_codigo}</td>
              <td className="p-3">{l.historico}</td>
              <td className="p-3">{l.doc_ref}</td>
              <td className="p-3">{l.valor_total}</td>
              <td className="p-3">{l.cnpj}</td>
              <td className="p-3">{l.validacao}</td>
              <td className="p-3 font-semibold">{l.status}</td>
              <td className="p-3">{l.lote_id}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {itensFiltrados.length === 0 && (
        <div className="p-6 text-center text-gray-400">
          Nenhum registro encontrado.
        </div>
      )}
    </div>

    {showHelp && helpModal}
  </div>
);

}
