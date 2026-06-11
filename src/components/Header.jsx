 import { useApp } from "../context/AppContext";
import { buildWebhookUrl } from "../config/globals";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
 import { useTranslation } from "react-i18next";
 


export default function Header() {

  const { i18n } = useTranslation();
  const { empresa, usuario, documento, tipo, email, loading, perfil } = useApp();
  const [alertaContabil, setAlertaContabil] = useState(null);
  const navigate = useNavigate();
  const [alertaReclassificacao, setAlertaReclassificacao] = useState(null);
  const [alertaRecorrentes, setAlertaRecorrentes] = useState(null);
   
{/*Titulos vencidos  */}

const [alertaTitulosVencidos, setAlertaTitulosVencidos] = useState(null);

 const carregarStatus = useCallback(async () => {
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa") ||
    "0";

  // ALERTA PROCESSAMENTO CONTÁBIL
  try {
    const resp = await fetch(
      buildWebhookUrl("ultimo_processamento", { empresa_id })
    );

    const data = await resp.json();
    const item = Array.isArray(data) ? data[0] : data;

    const hoje = hojeLocal();

    const ultimoProcessado = item?.ultimo_dia_processado
      ? item.ultimo_dia_processado.slice(0, 10)
      : null;

    if (
      item?.data_reprocessar_de ||
      (ultimoProcessado && ultimoProcessado < hoje)
    ) {
      setAlertaContabil(item);
    } else {
      setAlertaContabil(null);
    }
  } catch (err) {
    console.error("Erro ao carregar status contábil:", err);
    setAlertaContabil(null);
  }

  // ALERTA RECLASSIFICAÇÃO
  try {
    const respRegras = await fetch(
      buildWebhookUrl("status_reclassificacao", { empresa_id })
    );

    const dataRegras = await respRegras.json();
    const itemRegras = Array.isArray(dataRegras) ? dataRegras[0] : dataRegras;

    if (Number(itemRegras?.qtd || 0) > 0) {
      setAlertaReclassificacao(itemRegras);
    } else {
      setAlertaReclassificacao(null);
    }
  } catch (err) {
    console.error("Erro ao carregar alerta de reclassificação:", err);
    setAlertaReclassificacao(null);
  }



 // ALERTA TÍTULOS VENCIDOS
try {
  const respTit = await fetch(
    buildWebhookUrl("titulos_vencidos", {
      empresa_id,
      modo: "vencidos",
      dias: 0,
      conta_id: null,
    })
  );

  const dataTit = await respTit.json();

  const base = Array.isArray(dataTit) ? dataTit[0] : dataTit;

  const dados = Array.isArray(base?.data)
    ? base.data
    : base?.data
    ? [base.data]
    : [];

  const dadosValidos = dados.filter((item) => {
    return (
      item &&
      item.origem_id &&
      item.origem_tabela &&
      item.evento_codigo &&
      item.valor !== null &&
      item.valor !== undefined
    );
  });

  if (dadosValidos.length > 0) {
    const total = dadosValidos.reduce(
      (acc, item) => acc + Number(item.valor || 0),
      0
    );

    setAlertaTitulosVencidos({
      qtd: dadosValidos.length,
      total,
    });
  } else {
    setAlertaTitulosVencidos(null);
  }
} catch (err) {
  console.error("Erro ao carregar títulos vencidos:", err);
  setAlertaTitulosVencidos(null);
}


   // ALERTA CONTAS RECORRENTES
 // ALERTA CONTAS RECORRENTES
try {
  const respRec = await fetch(
    buildWebhookUrl("status_contas_recorrentes", { empresa_id })
  );

  const dataRec = await respRec.json();

  const baseRec = Array.isArray(dataRec) ? dataRec[0] : dataRec;
  const itemRec = Array.isArray(baseRec?.data)
    ? baseRec.data[0]
    : baseRec?.data || baseRec;

  if (Number(itemRec?.qtd || 0) > 0) {
    setAlertaRecorrentes(itemRec);
  } else {
    setAlertaRecorrentes(null);
  }
} catch (err) {
  console.error("Erro ao carregar alerta de contas recorrentes:", err);
  setAlertaRecorrentes(null);
}
}, [perfil]);

  useEffect(() => {
    carregarStatus();
  }, [carregarStatus]);

  useEffect(() => {
    function atualizarAlerta() {
      carregarStatus();
    }

    window.addEventListener("contabil-atualizado", atualizarAlerta);

    return () => {
      window.removeEventListener("contabil-atualizado", atualizarAlerta);
    };
  }, [carregarStatus]);

  function formatarDataBR(data) {
    if (!data) return "";
    const [ano, mes, dia] = data.slice(0, 10).split("-");
    return `${dia}-${mes}-${ano}`;
  }

  if (loading) return null;


  
 

  return (
    <>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8  bg-[#061f4a]"> 
      
 {alertaContabil && (
  <div className="px-4 pt-3  bg-[#061f4a]">
    <div className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-yellow-50 px-5 py-3 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-xl">
          ⚠️
        </div>

        <div className="text-sm">
          <div className="font-black text-red-700">
            Lançamentos contábeis pendentes
          </div>
          <div className="font-semibold text-slate-700">
            Existem lançamentos não processados até{" "}
            <span className="font-black text-red-700">
              {formatarDataBR(
                alertaContabil.data_reprocessar_de ||
                  alertaContabil.ultimo_dia_processado
              )}
            </span>
            . Os relatórios podem estar incorretos.
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/processar-diario")}
        className="shrink-0 rounded-full bg-red-600 px-5 py-2 text-sm font-black text-white shadow hover:bg-red-700 transition"
      >
        Processar agora
      </button>
    </div>
  </div>
)}

{alertaReclassificacao && (
  <div className="px-4 pt-3 bg-[#061f4a]">
    <div className="mx-auto max-w-7xl rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-3 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">
          🧭
        </div>

        <div className="text-sm">
          <div className="font-black text-orange-700">
            Históricos sem classificação contábil
          </div>
          <div className="font-semibold text-slate-700">
            Existem{" "}
            <span className="font-black text-orange-700">
              {alertaReclassificacao.qtd}
            </span>{" "}
            histórico(s) sem classificação. Reclassifique para evitar lançamentos em conta genérica.
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/regras-classificacao?nao_classificados=1")}
        className="shrink-0 rounded-full bg-orange-500 px-5 py-2 text-sm font-black text-white shadow hover:bg-orange-600 transition"
      >
        Reclassificar agora
      </button>
    </div>
  </div>
)}

 {alertaRecorrentes && (
  <div className="px-4 pt-3 bg-[#061f4a]">
    <div className="mx-auto max-w-7xl rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-5 py-3 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
          🔁
        </div>

        <div className="text-sm">
          <div className="font-black text-blue-700">
            Contas recorrentes pendentes
          </div>

          <div className="font-semibold text-slate-700">
            Existem{" "}
            <span className="font-black text-blue-700">
              {alertaRecorrentes.qtd}
            </span>{" "}
            conta(s) recorrente(s) para gerar ou revisar.
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/conta-recorrente")}
        className="shrink-0 rounded-full bg-blue-600 px-5 py-2 text-sm font-black text-white shadow hover:bg-blue-700 transition"
      >
        Ver agora
      </button>
    </div>
  </div>
)}

{alertaTitulosVencidos && (
  <div className="px-4 pt-3 bg-[#061f4a]">
    <div className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 px-5 py-3 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-xl">
          ⏰
        </div>

        <div className="text-sm">
          <div className="font-black text-red-700">
            Títulos vencidos
          </div>

          <div className="font-semibold text-slate-700">
            Existem{" "}
            <span className="font-black text-red-700">
              {alertaTitulosVencidos.qtd}
            </span>{" "}
            título(s) vencido(s), totalizando{" "}
            <span className="font-black text-red-700">
              {Number(alertaTitulosVencidos.total || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
            .
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/titulos-vencidos")}
        className="shrink-0 rounded-full bg-red-600 px-5 py-2 text-sm font-black text-white shadow hover:bg-red-700 transition"
      >
        Ver vencidos
      </button>
    </div>
  </div>
)}

</div>

      <header className="h-22 border-b bg-[#061f4a] px-5 flex items-center justify-between">
        <div className="flex gap-8">
          <div>
            <div className="mt-3 text-xs uppercase text-gray-300 font-semibold">
              Empresa
            </div>
            <div className="text-white font-bold text-sm leading-tight">
              {empresa}
            </div>
            <div className="text-xs text-gray-200 leading-tight">
              {tipo}{" \u00A0"}·{" \u00A0"}CNPJ:{" \u00A0"}{documento}
            </div>
            <div className="text-white font-bold text-sm leading-tight">
              Perfil:{" \u00A0"}{perfil}
            </div>
          </div>

          <div>
            <div className=" mt-3 text-xs uppercase text-gray-300 font-semibold">
              Usuário
            </div>
            <div className="text-white font-bold leading-tight">
              {usuario}
            </div>
            <div className="text-sm text-gray-200 leading-tight">
              {email}
            </div>
          </div>
        </div>

        <div className="  mt-3 text-base text-gray-200 self-start pt-6">
          {new Date().toLocaleDateString("pt-BR")}
        </div>
           
           <div className="flex flex-col items-end gap-2">
  <a href="/ajuda" className="text-white underline font-medium">
    🔗 Abrir ajuda
  </a>

 <select
  value={i18n.language || "pt-BR"}
  onChange={(e) => {
    localStorage.setItem("idioma", e.target.value);
    i18n.changeLanguage(e.target.value);
  }}
  className="rounded-lg border border-blue-700 px-3 py-2 text-sm font-bold text-white bg-[#061f4a]"
>
  <option value="pt-BR">🇧🇷 Português</option>
  <option value="en-US">🇺🇸 English</option>
  <option value="es-ES">🇪🇸 Español</option>
</select>
</div>
       
      </header>
    </>
  );
}