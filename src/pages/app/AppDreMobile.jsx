import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../../config/globals";
import { hojeLocal } from "../../utils/dataLocal";

export default function AppDreMobile() {
  const navigate = useNavigate();

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa") ||
    "1";

  const params = new URLSearchParams(window.location.search);
  const tipo = params.get("tipo") || "sintetico";
  const analitico = tipo === "analitico";

  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  async function consultar() {
    try {
      setLoading(true);
      setDados([]);

      const webhook = analitico ? "dre_analitico" : "der";

      const resp = await fetch(buildWebhookUrl(webhook), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: Number(empresa_id),
          data_ini: dataIni,
          data_fim: dataFim,
        }),
      });

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : []);
    } catch {
      alert("Erro ao carregar DRE.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    consultar();
  }, []);

  const receita = Number(
    dados.find((d) => d.grupo === "RECEITA_BRUTA")?.valor_periodo || 0
  );
  const custos = Number(
    dados.find((d) => d.grupo === "CUSTOS")?.valor_periodo || 0
  );
  const despesas = Number(
    dados.find((d) => d.grupo === "DESPESAS_OPERACIONAIS")?.valor_periodo || 0
  );

  const lucroBruto = receita - custos;
  const resultado = lucroBruto - despesas;

  function percReceitaTotal(valor) {
    if (!receita) return "0,00%";
    return `${((Number(valor || 0) / receita) * 100).toFixed(2)}%`;
  }

  const gruposAnalitico = ["RECEITA", "CUSTO", "DESPESA"];

  const dadosAgrupados = useMemo(() => {
    return gruposAnalitico
      .map((grupo) => {
        const itens = dados.filter((d) => d.grupo === grupo);
        const subtotal = itens.reduce(
          (acc, item) => acc + Number(item.valor || 0),
          0
        );

        return { grupo, itens, subtotal };
      })
      .filter((g) => g.itens.length > 0);
  }, [dados]);

  const totalFinalAnalitico = dadosAgrupados.reduce((acc, g) => {
    if (g.grupo === "RECEITA") return acc + Number(g.subtotal || 0);
    return acc - Number(g.subtotal || 0);
  }, 0);

  const totalFinal = analitico ? totalFinalAnalitico : resultado;

  function nomeGrupo(g) {
    if (g === "RECEITA") return "Receitas";
    if (g === "CUSTO") return "Custos";
    if (g === "DESPESA") return "Despesas";
    return g;
  }

  function corValor(v) {
    return Number(v || 0) >= 0 ? "#16a34a" : "#ef4444";
  }

  return (
    <div style={tela}>
      <div style={topoCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate("/app/relatorios")} style={botaoVoltar}>
            ←
          </button>

          <div style={{ fontSize: 22, fontWeight: 900, color: "#1e1b4b" }}>
            {analitico ? "DRE Analítico" : "DRE Sintético"}
          </div>

          <button onClick={consultar} style={botaoAtualizar}>
            ↻
          </button>
        </div>

        <div style={{ marginTop: 22, textAlign: "center" }}>
          <div style={{ color: "#7c7a90", fontSize: 15, fontWeight: 800 }}>
            Resultado do período
          </div>

          <div style={{ marginTop: 8, color: corValor(totalFinal), fontSize: 28, fontWeight: 950 }}>
            {loading ? "Carregando..." : `R$ ${fmt.format(totalFinal)}`}
          </div>

          <div style={{ marginTop: 6, color: "#64748b", fontSize: 12, fontWeight: 800 }}>
            {dataIni} até {dataFim}
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={campo}>
            <label style={label}>Início</label>
            <input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} style={input} />
          </div>

          <div style={campo}>
            <label style={label}>Fim</label>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={input} />
          </div>
        </div>

        <button onClick={consultar} style={botaoConsultar}>
          Consultar
        </button>
      </div>

      {!analitico ? (
        <div style={{ display: "grid", gap: 10 }}>
          <LinhaSintetica titulo="Receita Bruta" valor={receita} cor="#16a34a" perc={percReceitaTotal(receita)} fmt={fmt} />
          <LinhaSintetica titulo="(-) Custos" valor={custos} cor="#ef4444" perc={percReceitaTotal(custos)} fmt={fmt} />
          <LinhaSintetica titulo="Lucro Bruto" valor={lucroBruto} cor={corValor(lucroBruto)} perc={percReceitaTotal(lucroBruto)} fmt={fmt} destaque />
          <LinhaSintetica titulo="Despesas" valor={despesas} cor="#ef4444" perc={percReceitaTotal(despesas)} fmt={fmt} />
          <LinhaSintetica titulo="Resultado" valor={resultado} cor={corValor(resultado)} perc={percReceitaTotal(resultado)} fmt={fmt} destaqueFinal />
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {dadosAgrupados.map((g) => (
            <div key={g.grupo} style={card}>
              <div style={{ fontSize: 18, fontWeight: 950, color: "#1e1b4b", marginBottom: 10 }}>
                {nomeGrupo(g.grupo)}
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {g.itens.map((l, idx) => (
                  <div key={idx} style={cardLinha}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b" }}>
                        {l.conta_nome}
                      </div>
                      <div style={{ marginTop: 3, fontSize: 11, fontWeight: 800, color: "#64748b" }}>
                        {l.conta_codigo} • {(l.classificacao_gerencial || "-").replaceAll("_", " ")}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 950,
                          color: g.grupo === "RECEITA" ? "#16a34a" : "#ef4444",
                        }}
                      >
                        R$ {fmt.format(Number(l.valor || 0))}
                      </div>
                      <div style={{ marginTop: 3, fontSize: 10, fontWeight: 800, color: "#64748b" }}>
                        {l.perc_sobre_grupo != null
                          ? `${Number(l.perc_sobre_grupo).toFixed(2)}%`
                          : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={subtotal}>
                <span>Subtotal</span>
                <b style={{ color: g.grupo === "RECEITA" ? "#16a34a" : "#ef4444" }}>
                  R$ {fmt.format(g.subtotal)}
                </b>
              </div>
            </div>
          ))}

          <div style={cardResultado}>
            <span>Resultado do período</span>
            <b style={{ color: corValor(totalFinalAnalitico) }}>
              R$ {fmt.format(totalFinalAnalitico)}
            </b>
          </div>
        </div>
      )}
    </div>
  );
}

function LinhaSintetica({ titulo, valor, cor, perc, fmt, destaque, destaqueFinal }) {
  return (
    <div
      style={{
        background: destaqueFinal ? "#fff7ed" : "#ffffff",
        borderRadius: 20,
        padding: 12,
        boxShadow: "0 6px 18px rgba(15,23,42,0.10)",
        border: destaqueFinal ? "1px solid #fdba74" : "1px solid rgba(148,163,184,0.22)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontSize: destaque ? 15 : 14, fontWeight: 950, color: "#1e1b4b" }}>
            {titulo}
          </div>
          <div style={{ marginTop: 4, fontSize: 11, fontWeight: 800, color: "#64748b" }}>
            {perc} da receita
          </div>
        </div>

        <div style={{ fontSize: destaqueFinal ? 17 : 15, fontWeight: 950, color: cor }}>
          R$ {fmt.format(Number(valor || 0))}
        </div>
      </div>
    </div>
  );
}

const tela = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#eef5fb,#e8f1fa)",
  padding: 16,
  fontFamily: "Arial, sans-serif",
  boxSizing: "border-box",
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

const card = {
  background: "#ffffff",
  borderRadius: 24,
  padding: 14,
  boxShadow: "0 10px 28px rgba(15,23,42,0.12)",
  border: "1px solid rgba(148,163,184,0.25)",
  marginBottom: 16,
};

const campo = {
  marginBottom: 10,
};

const label = {
  display: "block",
  fontSize: 13,
  color: "#4b5563",
  fontWeight: 900,
  marginBottom: 6,
};

const input = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 15,
  padding: "10px 12px",
  fontSize: 13,
  fontWeight: 800,
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

const botaoConsultar = {
  width: "100%",
  border: 0,
  borderRadius: 999,
  padding: "12px 16px",
  background: "linear-gradient(135deg,#14b8a6,#0f766e)",
  color: "#fff",
  fontWeight: 950,
  fontSize: 14,
  marginTop: 2,
};

const cardLinha = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 8,
  background: "#f8fafc",
  borderRadius: 16,
  padding: 10,
  border: "1px solid #e2e8f0",
};

const subtotal = {
  marginTop: 12,
  paddingTop: 10,
  borderTop: "1px solid #e5e7eb",
  display: "flex",
  justifyContent: "space-between",
  fontSize: 14,
  fontWeight: 950,
  color: "#1e1b4b",
};

const cardResultado = {
  background: "#fff7ed",
  border: "1px solid #fdba74",
  borderRadius: 22,
  padding: 14,
  display: "flex",
  justifyContent: "space-between",
  fontSize: 15,
  fontWeight: 950,
  color: "#1e1b4b",
};