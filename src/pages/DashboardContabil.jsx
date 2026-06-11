 import { useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
import { useTranslation } from "react-i18next";

export default function DashboardContabil() {
  const { t, i18n } = useTranslation();

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa") ||
    "0";

  const [dataIni, setDataIni] = useState(hojeMaisDias(-30));
  const [dataFim, setDataFim] = useState(hojeLocal());

  const [balanco, setBalanco] = useState([]);
  const [dre, setDre] = useState([]);
  const [historico, setHistorico] = useState([]);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString(i18n.language || "pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function somarGrupo(lista, grupo) {
    return lista
      .filter((l) => l.grupo === grupo)
      .reduce((s, l) => s + Number(l.saldo || 0), 0);
  }

  function diferencaDias(dataIni, dataFim) {
    if (!dataIni || !dataFim) return 0;
    const inicio = new Date(dataIni);
    const fim = new Date(dataFim);
    const diffMs = fim - inicio;
    return Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 0);
  }

  const diasPeriodo = diferencaDias(dataIni, dataFim);

  const totalAtivo = somarGrupo(balanco, "ATIVO");
  const totalPassivo = somarGrupo(balanco, "PASSIVO");
  const totalPL = somarGrupo(balanco, "PATRIMONIO LIQUIDO");

  const resultadoLiquido =
    dre.find((l) => l.grupo === "RESULTADO_LIQUIDO")?.valor_periodo || 0;

  const ativosNegativos = balanco.filter(
    (l) => l.grupo === "ATIVO" && Number(l.saldo) < 0
  );

  const passivosInvertidos = balanco.filter(
    (l) => l.grupo === "PASSIVO" && Number(l.saldo) > 0
  );

  const historicoFormatado = historico.map((h) => ({
    ...h,
    mes_ano: `${String(h.mes).padStart(2, "0")}/${h.ano}`,
  }));

  async function carregar() {
    try {
      setLoading(true);
      setErro("");

      const [respDre, respBalanco, respHistorico] = await Promise.all([
        fetch(buildWebhookUrl("der"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id,
            data_ini: dataIni,
            data_fim: dataFim,
          }),
        }),
        fetch(buildWebhookUrl("balanco"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id,
            data_corte: dataFim,
          }),
        }),
        fetch(buildWebhookUrl("historico_apuracao"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id,
          }),
        }),
      ]);

      const jsonDre = await respDre.json();
      const jsonBalanco = await respBalanco.json();
      const jsonHistorico = await respHistorico.json();

      setDre(Array.isArray(jsonDre) ? jsonDre : []);
      setBalanco(Array.isArray(jsonBalanco) ? jsonBalanco : []);
      setHistorico(Array.isArray(jsonHistorico) ? jsonHistorico : []);
    } catch (e) {
      console.error(e);
      setErro(t("dashboardContabil.erroCarregar"));
    } finally {
      setLoading(false);
    }
  }

  return (
     <div className="p-4 bg-blue-100 min-h-screen">
  <div className="bg-white text-blue-900 rounded-2xl px-5 py-4 mb-5 shadow border border-blue-100">
    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
      
      <div>
        <h1 className="text-2xl font-black leading-tight">
          📊 {t("dashboardContabil.titulo")}
        </h1>

        <div className="text-sm text-blue-700 font-bold mt-1">
          {t("dashboardContabil.periodo", { dias: diasPeriodo })}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label className="text-xs font-black text-slate-600 mb-1">
            Data início
          </label>
          <input
            type="date"
            className="h-10 w-40 rounded-xl border-2 border-blue-200 bg-white px-3 text-sm font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={dataIni}
            onChange={(e) => setDataIni(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-black text-slate-600 mb-1">
            Data fim
          </label>
          <input
            type="date"
            className="h-10 w-40 rounded-xl border-2 border-blue-200 bg-white px-3 text-sm font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>

        <button
          onClick={carregar}
          className="h-10 px-5 rounded-xl font-black text-sm tracking-wide text-white bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800 border border-blue-900 shadow hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-2"
        >
          {t("dashboardContabil.atualizar")}
        </button>
      </div>
    </div>

    {erro && (
      <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-red-700 font-bold text-sm">
        {erro}
      </div>
    )}
  </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <Kpi
          titulo={t("dashboardContabil.ativo")}
          valor={formatarMoeda(totalAtivo)}
          cor="blue"
        />

        <Kpi
          titulo={t("dashboardContabil.passivo")}
          valor={formatarMoeda(totalPassivo)}
          cor="red"
        />

        <Kpi
          titulo={t("dashboardContabil.patrimonioLiquido")}
          valor={formatarMoeda(totalPL)}
          cor="green"
        />

        <Kpi
          titulo={t("dashboardContabil.resultadoLiquido")}
          valor={formatarMoeda(resultadoLiquido)}
          cor="purple"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <AlertaCard
          titulo={t("dashboardContabil.ativosNegativos")}
          valor={ativosNegativos.length}
          detalhe={
            ativosNegativos.length > 0
              ? t("dashboardContabil.verificarSaldos")
              : t("dashboardContabil.nenhumProblema")
          }
          cor={ativosNegativos.length > 0 ? "red" : "green"}
        />

        <AlertaCard
          titulo={t("dashboardContabil.passivosInvertidos")}
          valor={passivosInvertidos.length}
          detalhe={
            passivosInvertidos.length > 0
              ? t("dashboardContabil.verificarPassivos")
              : t("dashboardContabil.nenhumProblema")
          }
          cor={passivosInvertidos.length > 0 ? "red" : "green"}
        />

        <AlertaCard
          titulo={t("dashboardContabil.diferencaAtivo")}
          valor={formatarMoeda(totalAtivo - totalPassivo - totalPL)}
          detalhe={t("dashboardContabil.idealZero")}
          cor={
            Number(totalAtivo - totalPassivo - totalPL) === 0
              ? "green"
              : "yellow"
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <Card titulo={t("dashboardContabil.dre")}>
          {dre.length === 0 ? (
            <p className="text-gray-500">
              {t("dashboardContabil.semDados")}
            </p>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dre}>
                  <XAxis dataKey="grupo" />

                  <YAxis
                    tickFormatter={(v) =>
                      Number(v).toLocaleString(i18n.language || "pt-BR")
                    }
                  />

                  <Tooltip
                    formatter={(v) =>
                      Number(v).toLocaleString(i18n.language || "pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    }
                  />

                  <Bar dataKey="valor_periodo" radius={[4, 4, 0, 0]}>
                    {dre.map((entry, index) => {
                      let cor = "#061f4aff";

                      if (entry.grupo?.includes("RECEITA")) cor = "#16a34a";
                      if (entry.grupo?.includes("CUSTO")) cor = "#dc2626";
                      if (entry.grupo?.includes("DESPESA")) cor = "#f59e0b";
                      if (entry.grupo?.includes("RESULTADO_BRUTO")) cor = "#2563eb";
                      if (entry.grupo?.includes("RESULTADO_OPERACIONAL")) cor = "#0ea5e9";
                      if (entry.grupo?.includes("RESULTADO_LIQUIDO")) cor = "#7c3aed";

                      return <Cell key={index} fill={cor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card titulo={t("dashboardContabil.evolucaoResultado")}>
          {historicoFormatado.length === 0 ? (
            <p className="text-gray-500">
              {t("dashboardContabil.semDados")}
            </p>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicoFormatado}>
                  <XAxis dataKey="mes_ano" />

                  <YAxis
                    tickFormatter={(v) =>
                      Number(v).toLocaleString(i18n.language || "pt-BR", {
                        maximumFractionDigits: 0,
                      })
                    }
                  />

                  <Tooltip
                    formatter={(v) =>
                      Number(v).toLocaleString(i18n.language || "pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="resultado"
                    stroke="#061f4aff"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {loading && (
        <div className="text-center text-blue-700 font-bold">
          {t("dashboardContabil.carregando")}
        </div>
      )}
    </div>
  );
}

function Kpi({ titulo, valor, cor }) {
  const cores = {
    blue: "border-l-8 border-blue-400 bg-blue-50",
    red: "border-l-8 border-red-500 bg-red-50",
    green: "border-l-8 border-green-500 bg-green-50",
    purple: "border-l-8 border-purple-500 bg-purple-50",
  };

  return (
    <div className={`rounded-xl shadow p-4 ${cores[cor] || "bg-white"}`}>
      <p className="text-sm text-gray-600">{titulo}</p>
      <p className="text-2xl font-bold">{valor ?? "0,00"}</p>
    </div>
  );
}

function AlertaCard({ titulo, valor, detalhe, cor }) {
  const cores = {
    red: "border-l-8 border-red-500 bg-red-50 text-red-900",
    green: "border-l-8 border-green-500 bg-green-50 text-green-900",
    yellow: "border-l-8 border-yellow-500 bg-yellow-50 text-yellow-900",
  };

  return (
    <div className={`rounded-xl shadow p-4 ${cores[cor] || "bg-white"}`}>
      <p className="text-sm font-semibold">{titulo}</p>
      <p className="text-2xl font-bold mt-1">{valor}</p>
      <p className="text-sm mt-2">{detalhe}</p>
    </div>
  );
}

function Card({ titulo, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-[#061f4aff]">{titulo}</h2>
      {children}
    </div>
  );
}