 
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import { buildWebhookUrl } from "../../config/globals";
import { hojeLocal } from "../../utils/dataLocal";

 export default function AppFluxoCaixaProjetado() {
  const navigate = useNavigate();

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa") ||
    "1";

  const [dias, setDias] = useState(7);
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  const fmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

   function dataMaisDias(qtd) {
  const d = new Date(hojeLocal() + "T00:00:00");
  d.setDate(d.getDate() + (qtd - 1));
  return d.toISOString().slice(0, 10);
}

  function formatarData(d) {
    if (!d) return "";
    const [ano, mes, dia] = String(d).slice(0, 10).split("-");
    return `${dia}/${mes}`;
  }

  async function consultar(qtd = dias) {
    try {
      setLoading(true);

      const resp = await fetch( buildWebhookUrl("fluxo_caixa_projetado_diario"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          data_ini: hojeLocal(),
          data_fim: dataMaisDias(qtd),
        }),
      });

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : []);
    } catch {
      alert("Erro ao carregar fluxo de caixa.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    consultar(7);
  }, []);

  function trocarDias(qtd) {
    setDias(qtd);
    consultar(qtd);
  }

  const dadosTratados = useMemo(() => {
    return dados.map((d) => ({
      label: formatarData(d.data_ref),
      entrada: Number(d.entrada || 0),
      saida: Number(d.saida || 0),
      saldo_final: Number(d.saldo_final || 0),
      saldo_inicial: Number(d.saldo_inicial || 0),
    }));
  }, [dados]);

  const resumo = useMemo(() => {
    if (!dadosTratados.length) {
      return { saldoInicial: 0, entradas: 0, saidas: 0, resultado: 0, saldoFinal: 0 };
    }

    const entradas = dadosTratados.reduce((s, d) => s + d.entrada, 0);
    const saidas = dadosTratados.reduce((s, d) => s + d.saida, 0);

    return {
      saldoInicial: dadosTratados[0]?.saldo_inicial || 0,
      entradas,
      saidas,
      resultado: entradas - saidas,
      saldoFinal: dadosTratados[dadosTratados.length - 1]?.saldo_final || 0,
    };
  }, [dadosTratados]);

  const option = {
    grid: { left: 42, right: 12, top: 28, bottom: 32 },
    tooltip: { trigger: "axis" },
    legend: { show: false },
    xAxis: {
      type: "category",
      data: dadosTratados.map((d) => d.label),
      axisLabel: { fontSize: 10 },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        fontSize: 10,
        formatter: (v) => {
          const n = Number(v || 0);
          if (Math.abs(n) >= 1000) return `${Math.round(n / 1000)}k`;
          return n;
        },
      },
    },
    series: [
      {
        name: "Entradas",
        type: "bar",
        data: dadosTratados.map((d) => d.entrada),
      },
      {
        name: "Saídas",
        type: "bar",
        data: dadosTratados.map((d) => d.saida),
      },
      {
        name: "Saldo",
        type: "line",
        smooth: true,
        data: dadosTratados.map((d) => d.saldo_final),
      },
    ],
  };

  return (
    <div style={tela}>
      <div style={topoCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate("/app/relatorios")} style={botaoVoltar}>←</button>

          <div style={{ fontSize: 21, fontWeight: 900, color: "#1e1b4b" }}>
             Fluxo Projetado
          </div>

          <button onClick={() => consultar(dias)} style={botaoAtualizar}>↻</button>
        </div>

        <div style={{ marginTop: 22, textAlign: "center" }}>
          <div style={{ color: "#7c7a90", fontSize: 15, fontWeight: 800 }}>
            Saldo final
          </div>

          <div style={{ marginTop: 8, color: resumo.saldoFinal >= 0 ? "#16a34a" : "#ef4444", fontSize: 27, fontWeight: 950 }}>
            {loading ? "Carregando..." : fmt.format(resumo.saldoFinal)}
          </div>

          <div style={{ marginTop: 6, color: "#64748b", fontSize: 12, fontWeight: 800 }}>
            Próximos {dias} dias
          </div>
        </div>
      </div>

      <div style={botoesDias}>
        {[7, 15, 30].map((d) => (
          <button
            key={d}
            onClick={() => trocarDias(d)}
            style={dias === d ? botaoDiaAtivo : botaoDia}
          >
            {d} dias
          </button>
        ))}
      </div>

      <div style={dashboardGrid}>
        <MiniCard titulo="Entradas" valor={fmt.format(resumo.entradas)} cor="#16a34a" />
        <MiniCard titulo="Saídas" valor={fmt.format(resumo.saidas)} cor="#ef4444" />
        <MiniCard titulo="Resultado" valor={fmt.format(resumo.resultado)} cor={resumo.resultado >= 0 ? "#16a34a" : "#ef4444"} />
        <MiniCard titulo="Saldo inicial" valor={fmt.format(resumo.saldoInicial)} cor="#1e1b4b" />
      </div>

      <div style={card}>
        <div style={{ fontSize: 15, fontWeight: 950, color: "#1e1b4b", marginBottom: 8 }}>
          Gráfico simples
        </div>

        <div style={{ height: 260 }}>
          {dadosTratados.length === 0 && !loading ? (
            <div style={{ color: "#64748b", fontWeight: 800, padding: 20 }}>
              Nenhum dado encontrado.
            </div>
          ) : (
            <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
          )}
        </div>
      </div>

      <div style={secaoTitulo}>Resumo por dia</div>

      <div style={{ display: "grid", gap: 10 }}>
        {dadosTratados.map((d, i) => (
          <div key={i} style={cardLinha}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 950, color: "#1e1b4b" }}>
                {d.label}
              </div>
              <div style={{ marginTop: 4, fontSize: 11, fontWeight: 800, color: "#64748b" }}>
                Entrada {fmt.format(d.entrada)} • Saída {fmt.format(d.saida)}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 950, color: d.saldo_final >= 0 ? "#16a34a" : "#ef4444" }}>
                {fmt.format(d.saldo_final)}
              </div>
              <div style={{ marginTop: 4, fontSize: 11, fontWeight: 800, color: "#64748b" }}>
                saldo
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniCard({ titulo, valor, cor }) {
  return (
    <div style={miniCard}>
      <div style={miniLabel}>{titulo}</div>
      <div style={{ ...miniValor, color: cor }}>{valor}</div>
    </div>
  );
}

const tela = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#eef5fb,#e8f1fa)",
  padding: 16,
  fontFamily: "Arial, sans-serif",
};

const topoCard = {
  borderRadius: "0 0 34px 34px",
  background: "#ffffff",
  padding: "24px 20px 26px",
  boxShadow: "0 8px 22px rgba(15,23,42,0.12)",
  margin: "-16px -16px 18px",
};

const botaoVoltar = {
  border: 0,
  background: "transparent",
  fontSize: 28,
  fontWeight: 900,
  color: "#1e293b",
};

const botaoAtualizar = {
  border: 0,
  width: 42,
  height: 42,
  borderRadius: "50%",
  background: "linear-gradient(135deg,#7c3aed,#4c1d95)",
  color: "#fff",
  fontSize: 20,
  fontWeight: 900,
};

const botoesDias = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 10,
  marginBottom: 14,
};

const botaoDia = {
  border: "1px solid #cbd5e1",
  borderRadius: 999,
  padding: "10px",
  background: "#fff",
  color: "#475569",
  fontWeight: 900,
};

const botaoDiaAtivo = {
  ...botaoDia,
  background: "linear-gradient(135deg,#2563eb,#1e3a8a)",
  color: "#fff",
};

const dashboardGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginBottom: 14,
};

const miniCard = {
  background: "#ffffff",
  borderRadius: 20,
  padding: 12,
  boxShadow: "0 6px 18px rgba(15,23,42,0.10)",
  border: "1px solid rgba(148,163,184,0.22)",
};

const miniLabel = {
  color: "#7c7a90",
  fontSize: 12,
  fontWeight: 800,
};

const miniValor = {
  marginTop: 6,
  fontSize: 14,
  fontWeight: 950,
};

const card = {
  background: "#ffffff",
  borderRadius: 24,
  padding: 14,
  boxShadow: "0 10px 28px rgba(15,23,42,0.12)",
  border: "1px solid rgba(148,163,184,0.25)",
  marginBottom: 16,
};

const secaoTitulo = {
  fontSize: 18,
  color: "#4b5563",
  fontWeight: 900,
  margin: "18px 0 10px",
};

const cardLinha = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 8,
  background: "#ffffff",
  borderRadius: 20,
  padding: 12,
  boxShadow: "0 6px 18px rgba(15,23,42,0.10)",
  border: "1px solid rgba(148,163,184,0.22)",
};