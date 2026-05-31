 import { useApp } from "../context/AppContext";
import { buildWebhookUrl } from "../config/globals";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";

export default function Header() {
  const { empresa, usuario, documento, tipo, email, loading, perfil } = useApp();
  const [alertaContabil, setAlertaContabil] = useState(null);
  const navigate = useNavigate();
  const [alertaReclassificacao, setAlertaReclassificacao] = useState(null);
   
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

      <header className="h-22 border-b bg-[#061f4a] px-5 flex items-center justify-between">
        <div className="flex gap-8">
          <div>
            <div className="text-xs uppercase text-gray-300 font-semibold">
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
            <div className="text-xs uppercase text-gray-300 font-semibold">
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

        <div className="text-sm text-gray-200 self-start pt-6">
          {new Date().toLocaleDateString("pt-BR")}
        </div>

        <a href="/ajuda" className="text-white underline font-medium">
          🔗 Abrir ajuda
        </a>
      </header>
    </>
  );
}