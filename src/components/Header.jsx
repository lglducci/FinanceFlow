 import { useApp } from "../context/AppContext";
import { buildWebhookUrl } from "../config/globals";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { hojeLocal } from "../utils/dataLocal";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { i18n } = useTranslation();
  const { empresa, usuario, documento, tipo, email, loading, perfil } = useApp();
  const navigate = useNavigate();

  const [alertaContabil, setAlertaContabil] = useState(null);
  const [alertaReclassificacao, setAlertaReclassificacao] = useState(null);
  const [alertaRecorrentes, setAlertaRecorrentes] = useState(null);
  const [alertaTitulosVencidos, setAlertaTitulosVencidos] = useState(null);

  const [alertasAbertos, setAlertasAbertos] = useState(false);
  const ultimaAssinaturaAlertasRef = useRef("");

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

  const alertas = [
    alertaContabil && {
      key: "contabil",
      icon: "⚠️",
      cor: "red",
      titulo: "Lançamentos contábeis pendentes",
      resumo: "Processar",
      descricao: (
        <>
          Existem lançamentos não processados até{" "}
          <span className="font-black text-red-700">
            {formatarDataBR(
              alertaContabil.data_reprocessar_de ||
                alertaContabil.ultimo_dia_processado
            )}
          </span>
          . Os relatórios podem estar incorretos.
        </>
      ),
      botao: "Processar agora",
      onClick: () => navigate("/processar-diario"),
    },

    alertaReclassificacao && {
      key: "reclassificacao",
      icon: "🧭",
      cor: "orange",
      titulo: "Históricos sem classificação contábil",
      resumo: `${alertaReclassificacao.qtd} sem classificação`,
      descricao: (
        <>
          Existem{" "}
          <span className="font-black text-orange-700">
            {alertaReclassificacao.qtd}
          </span>{" "}
          histórico(s) sem classificação.
        </>
      ),
      botao: "Reclassificar",
      onClick: () => navigate("/regras-classificacao?nao_classificados=1"),
    },

    alertaRecorrentes && {
      key: "recorrentes",
      icon: "🔁",
      cor: "blue",
      titulo: "Contas recorrentes pendentes",
      resumo: `${alertaRecorrentes.qtd} recorrente(s)`,
      descricao: (
        <>
          Existem{" "}
          <span className="font-black text-blue-700">
            {alertaRecorrentes.qtd}
          </span>{" "}
          conta(s) recorrente(s) para gerar ou revisar.
        </>
      ),
      botao: "Ver agora",
      onClick: () => navigate("/conta-recorrente"),
    },

    alertaTitulosVencidos && {
      key: "titulos",
      icon: "⏰",
      cor: "red",
      titulo: "Títulos vencidos",
      resumo: `${alertaTitulosVencidos.qtd} vencido(s)`,
      descricao: (
        <>
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
        </>
      ),
      botao: "Ver vencidos",
      onClick: () => navigate("/titulos-vencidos"),
    },
  ].filter(Boolean);

  const assinaturaAlertas = alertas
    .map((a) => `${a.key}:${a.resumo}`)
    .join("|");

  useEffect(() => {
    if (!assinaturaAlertas) {
      setAlertasAbertos(false);
      ultimaAssinaturaAlertasRef.current = "";
      return;
    }

    if (assinaturaAlertas !== ultimaAssinaturaAlertasRef.current) {
      ultimaAssinaturaAlertasRef.current = assinaturaAlertas;
      setAlertasAbertos(true);

      const timer = setTimeout(() => {
        setAlertasAbertos(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [assinaturaAlertas]);

  function classesAlerta(cor) {
    if (cor === "orange") {
      return {
        card: "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50",
        icon: "bg-orange-100",
        title: "text-orange-700",
        button: "bg-orange-500 hover:bg-orange-600",
        chip: "border-orange-300 bg-orange-50 text-orange-700",
      };
    }

    if (cor === "blue") {
      return {
        card: "border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50",
        icon: "bg-blue-100",
        title: "text-blue-700",
        button: "bg-blue-600 hover:bg-blue-700",
        chip: "border-blue-300 bg-blue-50 text-blue-700",
      };
    }

    return {
      card: "border-red-200 bg-gradient-to-r from-red-50 to-orange-50",
      icon: "bg-red-100",
      title: "text-red-700",
      button: "bg-red-600 hover:bg-red-700",
      chip: "border-red-300 bg-red-50 text-red-700",
    };
  }

  if (loading) return null;

  return (
    <>
      {alertas.length > 0 && (
        <div className="border-b border-yellow-500/70 bg-[#061f4a]">
          <div className="flex min-h-[34px] items-center justify-between gap-3 px-4 py-1.5">
            <button
              type="button"
              onClick={() => setAlertasAbertos((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-yellow-500/60 bg-[#08285f] px-4 py-1 text-xs font-black text-yellow-300 hover:bg-[#0b347a]"
              title="Clique para abrir ou recolher os avisos"
            >
              ⚙️ Avisos ({alertas.length})
              <span className="text-yellow-100 font-bold">
                {alertasAbertos ? "— recolher" : "— clique para ver"}
              </span>
            </button>

            <div className="hidden flex-1 items-center justify-center gap-2 xl:flex">
              {alertas.map((a) => {
                const c = classesAlerta(a.cor);

                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setAlertasAbertos(true)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-black ${c.chip}`}
                    title={a.titulo}
                  >
                    {a.icon} {a.resumo}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={carregarStatus}
              className="rounded-full border border-blue-300/40 px-3 py-1 text-[11px] font-bold text-white hover:bg-white/10"
              title="Atualizar avisos"
            >
              Atualizar
            </button>
          </div>

          {alertasAbertos && (
            <div className="grid grid-cols-1 gap-3 px-4 pb-3 md:grid-cols-2 xl:grid-cols-3">
              {alertas.map((a) => {
                const c = classesAlerta(a.cor);

                return (
                  <div
                    key={a.key}
                    className={`rounded-2xl border px-5 py-3 shadow-sm flex items-center justify-between gap-4 ${c.card}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-xl ${c.icon}`}
                      >
                        {a.icon}
                      </div>

                      <div className="text-sm">
                        <div className={`font-black ${c.title}`}>{a.titulo}</div>
                        <div className="font-semibold text-slate-700">
                          {a.descricao}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={a.onClick}
                      className={`shrink-0 rounded-full px-5 py-2 text-sm font-black text-white shadow transition ${c.button}`}
                    >
                      {a.botao}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <header className="h-20 border-b bg-[#061f4a] px-5 flex items-center justify-between">
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

        <div className="text-base text-gray-200">
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
