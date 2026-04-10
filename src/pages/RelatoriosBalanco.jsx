import { useState, useEffect } from "react";

import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { hojeLocal, dataLocal } from "../utils/dataLocal";
 

export default function RelatoriosBalanco() {
  const hoje = new Date().toISOString().slice(0, 10);

  const [empresaId, setEmpresaId] = useState(null);
  const [dataCorte, setDataCorte] = useState(hojeLocal());
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);


  const empresa_id =
  localStorage.getItem("empresa_id") ||
  localStorage.getItem("id_empresa") ||
  "0";
const [tipoRelatorio, setTipoRelatorio] = useState("analitico"); 
 
const [dataIni, setDataIni] = useState(hojeLocal());
const [dataFim, setDataFim] = useState(hojeLocal());

const [linhas, setLinhas] = useState([]);
const [carregando, setCarregando] = useState(false);
const [erro, setErro] = useState("");

const ehComparativo = tipoRelatorio === "comparativo";
const ehPatrimonial = tipoRelatorio === "patrimonial";
const ehAnalitico = tipoRelatorio === "analitico";

function primeiroDiaMes(data) {
  const d = new Date(data);
  return new Date(d.getFullYear(), d.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}
  

const navigate = useNavigate();

  // Formatter BR
  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Carregar empresaId
  useEffect(() => {
    const id = localStorage.getItem("id_empresa");
    if (id) {
      setEmpresaId(Number(id));
    }
  }, []);

  /*async function consultar() {
    if (!empresaId) {
      alert("Empresa não carregada");
      return;
    }

    setLoading(true);
    setDados([]);

    try {
       
  }*/
 

    async function consultar() {
  try {
    const idEmpresa =
      Number(localStorage.getItem("id_empresa")) ||
      Number(localStorage.getItem("empresa_id")) ||
      0;

    if (!idEmpresa) {
      alert("Empresa não carregada");
      return;
    }

    setCarregando(true);
    setLoading(true);
    setErro("");
    setLinhas([]);

    let webhook = "balanco";
    let payload = {};

    if (tipoRelatorio === "analitico") {
      webhook = "balanco";
      payload = {
        empresa_id: idEmpresa,
        data_corte: dataCorte,
      };
    } else if (tipoRelatorio === "patrimonial") {
      webhook = "balanco_patrimonial";
      payload = {
        empresa_id: idEmpresa,
        data_corte: dataCorte,
      };
    } else if (tipoRelatorio === "comparativo") {
      webhook = "balanco_comparativo";
      payload = {
        empresa_id: idEmpresa,
        data_ini: dataIni,
        data_fim: dataFim,
      };
    }

    const resp = await fetch(buildWebhookUrl(webhook), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await resp.json();
const lista = Array.isArray(json) ? json : [];

const listaFiltrada = lista.filter((l) => {
  const nome = (l.conta_nome || "").toUpperCase().trim();

  if (nome === "TOTAL ATIVO CIRCULANTE") return false;
  if (nome === "TOTAL PASSIVO CIRCULANTE") return false;
  if (nome === "TOTAL PATRIMONIO LIQUIDO") return false;
  if (nome === "TOTAL PASSIVO NAO CIRCULANTE") return false;
   if (nome === "TOTAL PASSIVO NAO CLASSIFICADO") return false;
    if (nome === "TOTAL ATIVO NAO CIRCULANTE") return false;
  return true;
});

 const listaComTotais = inserirTotaisPorGrupo(listaFiltrada, ehComparativo);
setLinhas(listaComTotais);
     
  } catch (e) {
    console.error(e);
    setErro("Erro ao carregar o balanço");
    setLinhas([]);
  } finally {
    setCarregando(false);
    setLoading(false);
  }
}

 

function marcarTipo(tipo) {
  setTipoRelatorio(tipo);
}

function moeda(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}


 useEffect(() => {
  const id = localStorage.getItem("id_empresa") || localStorage.getItem("empresa_id");
  if (id) {
    setEmpresaId(Number(id));
  }
}, []);

useEffect(() => {
  if (empresaId) {
    consultar();
  }
}, [empresaId]);
 
useEffect(() => {
  setLinhas([]);
}, [tipoRelatorio]);

function inserirTotaisPorGrupo(lista, ehComparativo = false) {
  if (!Array.isArray(lista) || lista.length === 0) return [];

  const detalhes = [];
  const finais = [];

  let grupoAtual = null;
  let totalAnterior = 0;
  let totalAtual = 0;
  let totalVariacao = 0;

  function empurrarTotalDoGrupo() {
    if (!grupoAtual) return;

    detalhes.push({
      grupo: grupoAtual,
      subgrupo: null,
      tipo_linha: "TOTAL_GRUPO_FRONT",
      conta_codigo: "",
      conta_nome: `TOTAL ${grupoAtual}`,
      saldo: totalAtual,
      saldo_anterior: totalAnterior,
      saldo_atual: totalAtual,
      variacao: totalVariacao,
    });
  }

  for (const l of lista) {
    const isResumoFinal =
      l.grupo === "RESUMO" ||
      l.tipo_linha === "FECHAMENTO" ||
      l.tipo_linha?.includes("TOTAL");

    if (isResumoFinal) {
      finais.push(l);
      continue;
    }

    if (grupoAtual && l.grupo !== grupoAtual) {
      empurrarTotalDoGrupo();
      totalAnterior = 0;
      totalAtual = 0;
      totalVariacao = 0;
    }

    grupoAtual = l.grupo;
    detalhes.push(l);

    if (ehComparativo) {
      totalAnterior += Number(l.saldo_anterior || 0);
      totalAtual += Number(l.saldo_atual || 0);
      totalVariacao += Number(l.variacao || 0);
    } else {
      totalAtual += Number(l.saldo || 0);
    }
  }

  empurrarTotalDoGrupo();

  return [...detalhes, ...finais];
}

  return (
    <div className="p-6">
        <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-blue-800 mb-2"> 
      <h1 className="text-2xl font-bold mb-6">📊 Balanço Patrimonial</h1>

      {/* FILTROS */}
      <div className="bg-white rounded-xl p-4 shadow mb-6 flex gap-4 items-end">
       <div className="bg-white rounded-xl shadow p-4 mb-4">
  <div className="flex flex-wrap gap-6 items-center mb-4">

    <label className="flex items-center gap-2 font-medium">
      <input
        type="checkbox"
        checked={tipoRelatorio === "analitico"}
        onChange={() => marcarTipo("analitico")}
      />
      Balanço Analítico
    </label>

    <label className="flex items-center gap-2 font-medium">
      <input
        type="checkbox"
        checked={tipoRelatorio === "patrimonial"}
        onChange={() => marcarTipo("patrimonial")}
      />
      Balanço Patrimonial
    </label>

    <label className="flex items-center gap-2 font-medium">
      <input
        type="checkbox"
        checked={tipoRelatorio === "comparativo"}
        onChange={() => marcarTipo("comparativo")}
      />
      Balanço Comparativo
    </label>

  </div>

  {!ehComparativo ? (
    <div className="flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-sm font-medium mb-1">Data de corte</label>
        <input
          type="date"
          value={dataCorte}
          onChange={(e) => setDataCorte(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={consultar}
        className="px-4 py-2 rounded bg-blue-700 text-white font-semibold"
      >
        Pesquisar
      </button>
    </div>
  ) : (
    <div className="flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-sm font-medium mb-1">Data inicial</label>
        <input
          type="date"
          value={dataIni}
          onChange={(e) => setDataIni(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Data final</label>
        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={consultar}
        className="px-4 py-2 rounded bg-blue-700 text-white font-semibold"
      >
        Pesquisar
      </button>

       <button
          onClick={() => window.print()}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          🖨️ Imprimir
        </button>


         <button
          onClick={() =>   navigate("/reports") }
          className="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold"
        >
         Voltar 
        </button>
    </div>
  )}

  {erro && (
    <div className="mt-3 text-red-600 font-medium">
      {erro}
    </div>
  )}
</div>

       

        
        </div>
      </div>

      {/* TABELA */}
        <div id="print-area">  
        <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-gray-400 mb-2"> 
       <div className="bg-white rounded-xl shadow overflow-x-auto">
  <table className="min-w-full text-sm">
    <thead className="bg-slate-100">
      <tr>
        {/*<th className="px-3 py-2 text-left">Grupo</th>
         <th className="px-3 py-2 text-left">Subgrupo</th> 
        <th className="px-3 py-2 text-left">Tipo</th>*/}
        <th className="px-3 py-2 text-left">Código</th>
        <th className="px-3 py-2 text-left">Conta</th>

        {ehComparativo ? (
          <>
            <th className="px-3 py-2 text-right">Saldo anterior</th>
            <th className="px-3 py-2 text-right">Saldo atual</th>
            <th className="px-3 py-2 text-right">Variação</th>
          </>
        ) : (
          <th className="px-3 py-2 text-right">Saldo</th>
        )}
      </tr>
    </thead>

    <tbody>
      {linhas.map((l, i) => {
        const destaqueResumo =
  l.grupo === "RESUMO" ||
  l.tipo_linha?.includes("TOTAL") ||
  l.tipo_linha === "FECHAMENTO" ||
  l.tipo_linha === "TOTAL_GRUPO_FRONT";
        return (
          <tr
            key={i}
            className={destaqueResumo ? "bg-slate-50 font-bold border-t" : "border-t"}
          >
           {/*} <td className="px-3 py-2">{l.grupo || ""}</td>
           {/*} <td className="px-3 py-2">{l.subgrupo || ""}</td> 
            <td className="px-3 py-2">{l.tipo_linha || ""}</td>*/}
            <td className="px-3 py-2">{l.conta_codigo || ""}</td>
            <td className="px-3 py-2">{l.conta_nome || ""}</td>

            {ehComparativo ? (
              <>
                <td className="px-3 py-2 text-right">{moeda(l.saldo_anterior)}</td>
                <td className="px-3 py-2 text-right">{moeda(l.saldo_atual)}</td>
                <td className="px-3 py-2 text-right">{moeda(l.variacao)}</td>
              </>
            ) : (
              <td className="px-3 py-2 text-right">{moeda(l.saldo)}</td>
            )}
          </tr>
        );
      })}

      {!carregando && linhas.length === 0 && (
        <tr>
          <td
            colSpan={ehComparativo ? 8 : 6}
            className="px-3 py-6 text-center text-slate-500"
          >
            Nenhum dado encontrado.
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
      </div>
        </div>
  );
}
