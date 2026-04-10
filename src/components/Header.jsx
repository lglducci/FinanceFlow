 import { useApp } from "../context/AppContext";
import { buildWebhookUrl } from "../config/globals";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { empresa, usuario, documento, tipo, email, loading, perfil } = useApp();
  const [alertaContabil, setAlertaContabil] = useState(null);
  const navigate = useNavigate();
   
  const carregarStatus = useCallback(async () => {
    try {
      const empresa_id =
        localStorage.getItem("empresa_id") ||
        localStorage.getItem("id_empresa") ||
        "0";
       
      const resp = await fetch(
        buildWebhookUrl("ultimo_processamento", { empresa_id })
      );

      const data = await resp.json();
      const item = Array.isArray(data) ? data[0] : data;

      const hoje = new Date().toISOString().slice(0, 10);
      const ultimoProcessado = item?.ultimo_dia_processado
      ? item.ultimo_dia_processado.slice(0, 10)
      : null;

    if (perfil === "CONTABIL") {
      setAlertaContabil(null);
      return;
    }

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
        <div className="bg-yellow-300 text-red-800 font-bold text-center py-2 px-4">
          ⚠️ ATENÇÃO: Existem lançamentos não processados até{" "}
          {formatarDataBR(
            alertaContabil.data_reprocessar_de ||
              alertaContabil.ultimo_dia_processado
          )}.
          {" "}Os relatórios podem estar incorretos.

          <button
            onClick={() => navigate("/processar-diario")}
            className="ml-4 underline text-blue-900"
          >
            Processar agora
          </button>
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