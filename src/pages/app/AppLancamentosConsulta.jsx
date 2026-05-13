import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../../config/globals";
import { hojeLocal, hojeMaisDias } from "../../utils/dataLocal";

export default function AppLancamentosConsulta() {
  const navigate = useNavigate();

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa") ||
    "1";

  const [dataIni, setDataIni] = useState(hojeLocal());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [tipoOperacao, setTipoOperacao] = useState("transacao");
  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const fmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  function formatarDataBR(data) {
    if (!data) return "-";
    const [ano, mes, dia] = data.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function labelTipo(tipo) {
     const labels = {
  transacao: "À vista",
  conta_pagar: "Contas a pagar",
  conta_receber: "Contas a receber",
  cartao_compra: "Compras cartão",
  fatura_cartao: "Faturas",
  vencidos: "Vencidos",
  vence_hoje: "Vence hoje",
  vence_sete_dias: "Vence 7 dias",
  estorno: "Estornados",
  titulos_pagos: "Baixados",
};

    return labels[tipo] || "Consulta";
  }

  async function pesquisar() {
    try {
      setCarregando(true);

      let dataIniLocal = dataIni;
      let dataFimLocal = dataFim;
      let tipoOperacaoLocal = tipoOperacao;
      let vencido = "";
      let vence_hoje = "";
      let vence_sete_dias = "";
      let origem = "";

      if (tipoOperacao === "vencidos") {
        dataIniLocal = "2020-01-01";
        dataFimLocal = hojeLocal();
        tipoOperacaoLocal = "";
        vencido = "sim";
      }

      if (tipoOperacao === "vence_hoje") {
        dataIniLocal = hojeLocal();
        dataFimLocal = hojeLocal();
        tipoOperacaoLocal = "";
        vence_hoje = "sim";
      }

      if (tipoOperacao === "vence_sete_dias") {
        dataIniLocal = hojeMaisDias(1);
        dataFimLocal = hojeMaisDias(7);
        tipoOperacaoLocal = "";
        vence_sete_dias = "sim";
      }

      if (tipoOperacao === "transacao") {
        origem = "transacao";
      }

      if (tipoOperacao === "estorno") {
          tipoOperacaoLocal = "transacao";
          origem = "estorno";
        }

        if (tipoOperacao === "titulos_pagos") {
          dataIniLocal = "2020-01-01";
          dataFimLocal = hojeLocal();
          tipoOperacaoLocal = "transacao";
          origem = "titulos_pagos";
        }

      const url = buildWebhookUrl("listalancamentos", {
        empresa_id,
        conta_id: 0,
        data_ini: dataIniLocal,
        data_fim: dataFimLocal,
        categoria_id: 0,
        fornecedor_id: 0,
        tipo_operacao: tipoOperacaoLocal,
        vencido,
        vence_hoje,
        vence_sete_dias,
        origem,
      });

      const resp = await fetch(url);
      const dados = await resp.json();

      const tratados = Array.isArray(dados)
        ? dados
            .filter((l) => l && (l.id || l.descricao || l.valor))
            .map((l) => ({
              id: l.id,
              descricao: l.descricao || "-",
              tipo: l.tipo === "entrada" ? "Entrada" : "Saída",
              valor_num: Number(l.valor || 0),
              valor: fmt.format(Number(l.valor || 0)),
              data: formatarDataBR(l.data_movimento || l.vencimento),
              categoria: l.categoria_nome || "-",
              conta: l.conta_nome || "-",
              forma: l.forma || "-",
              status: l.status || "-",
              classificacao: l.classificacao || "-",
              origem: l.origem || "-",
              tipo_operacao: l.tipo_operacao || "-",
              vencimento: formatarDataBR(l.vencimento),
            }))
        : [];

      setLista(tratados);
    } catch (e) {
      console.error(e);
      alert("Erro ao consultar lançamentos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    pesquisar();
  }, []);

  const listaFiltrada = lista.filter((l) => {
    if (!busca.trim()) return true;
    const t = busca.toLowerCase();

    return (
      l.descricao.toLowerCase().includes(t) ||
      l.categoria.toLowerCase().includes(t) ||
      l.conta.toLowerCase().includes(t) ||
      l.forma.toLowerCase().includes(t) ||
      l.status.toLowerCase().includes(t)
    );
  });

  const totalEntrada = useMemo(
    () =>
      listaFiltrada
        .filter((l) => l.tipo === "Entrada")
        .reduce((s, l) => s + l.valor_num, 0),
    [listaFiltrada]
  );

  const totalSaida = useMemo(
    () =>
      listaFiltrada
        .filter((l) => l.tipo === "Saída")
        .reduce((s, l) => s + l.valor_num, 0),
    [listaFiltrada]
  );

  const resultado = totalEntrada - totalSaida;

  function valorCor(v) {
    return Number(v || 0) >= 0 ? "#16a34a" : "#ef4444";
  }

  return (
    <div style={tela}>
      <div style={topoCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate("/app/menu")} style={botaoVoltar}>
            ←
          </button>

          <div style={{ fontSize: 23, fontWeight: 900, color: "#1e1b4b" }}>
            Lançamentos
          </div>

          <button onClick={pesquisar} style={botaoAtualizar}>
            ↻
          </button>
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <div style={{ color: "#7c7a90", fontSize: 16, fontWeight: 800 }}>
            Resultado do período
          </div>

          <div style={{ marginTop: 8, color: valorCor(resultado), fontSize: 28, fontWeight: 950 }}>
            {carregando ? "Carregando..." : fmt.format(resultado)}
          </div>

          <div style={{ marginTop: 8, color: "#64748b", fontSize: 13, fontWeight: 800 }}>
            {listaFiltrada.length} registro(s) • {labelTipo(tipoOperacao)}
          </div>
        </div>
      </div>

      <div style={dashboardGrid}>
        <div style={miniCard}>
          <div style={miniLabel}>Entradas</div>
          <div style={{ ...miniValor, color: "#16a34a" }}>{fmt.format(totalEntrada)}</div>
        </div>

        <div style={miniCard}>
          <div style={miniLabel}>Saídas</div>
          <div style={{ ...miniValor, color: "#ef4444" }}>{fmt.format(totalSaida)}</div>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}> 
                <div style={campo}>
                    <label style={label}>Tipo</label>
                    <select value={tipoOperacao} onChange={(e) => setTipoOperacao(e.target.value)} style={input}>
                    <option value="transacao">💰 À vista</option>
                    <option value="conta_pagar"> 📤 A pagar</option>
                    <option value="conta_receber"> 📥 A receber</option>
                    <option value="cartao_compra">💳 Compras cartão</option>
                    <option value="fatura_cartao">💳 Faturas</option>
                    <option value="vencidos">🔴 Vencidos</option>
                    <option value="vence_hoje">⏰ Vencimentos</option>
                    <option value="vence_sete_dias">📅 Vence 7 dias</option>
                    <option value="estorno">🔁 Estornados</option>
                     <option value="titulos_pagos">✅ Baixados</option>
                    </select>
                </div>

                    <div style={campo}>
                        <label style={label}>Busca</label>
                        <input
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar..."
                        style={input}
                        />
                    </div>
              </div>
  <button onClick={pesquisar} style={botaoConsultar}>
    Consultar
  </button>
</div>

      <div style={secaoTitulo}>Registros</div>

      <div style={{ display: "grid", gap: 8 }}>
        {listaFiltrada.map((l) => (
          <div key={`${l.tipo_operacao}-${l.id}`} style={cardLancamento}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ flex: 1 }}>
               <div style={{ fontSize: 14, fontWeight: 900, color: "#1e1b4b" }}>
                  {l.descricao}
                </div>

               <div style={{ marginTop: 4, fontSize: 11, color: "#64748b", fontWeight: 800 }}>
                  {l.data} • {l.categoria}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 950, color: l.tipo === "Entrada" ? "#16a34a" : "#ef4444" }}>
                  {l.valor}
                </div>
                <div style={{ marginTop: 4, fontSize: 11, fontWeight: 900, color: "#64748b" }}>
                  {l.tipo}
                </div>
              </div>
            </div>

            <div style={infoGrid}>
              <span>Conta: <b>{l.conta}</b></span>
              <span>Forma: <b>{l.forma}</b></span>
              <span>Status: <b>{l.status}</b></span>
              <span>Venc.: <b>{l.vencimento}</b></span>
            </div>
          </div>
        ))}

        {!carregando && listaFiltrada.length === 0 && (
          <div style={card}>
            <div style={{ color: "#64748b", fontWeight: 800 }}>
              Nenhum lançamento encontrado.
            </div>
          </div>
        )}
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
  padding: "24px 20px 28px",
  boxShadow: "0 8px 22px rgba(15,23,42,0.12)",
  margin: "-16px -16px 22px",
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

const dashboardGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginBottom: 18,
};

const miniCard = {
  background: "#ffffff",
  borderRadius: 24,
  padding: 16,
  boxShadow: "0 10px 28px rgba(15,23,42,0.10)",
  border: "1px solid rgba(148,163,184,0.25)",
};

const miniLabel = {
  color: "#7c7a90",
  fontSize: 13,
  fontWeight: 800,
};

const miniValor = {
  marginTop: 8,
  fontSize: 17,
  fontWeight: 950,
};

const card = {
  background: "#ffffff",
  borderRadius: 28,
  padding: 18,
  boxShadow: "0 10px 28px rgba(15,23,42,0.12)",
  border: "1px solid rgba(148,163,184,0.25)",
  marginBottom: 18,
};

const campo = {
  marginBottom: 12,
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
  borderRadius: 18,
  padding: "13px 14px",
  fontSize: 14,
  fontWeight: 800,
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

const botaoConsultar = {
  width: "100%",
  border: 0,
  borderRadius: 999,
  padding: "14px 18px",
  background: "linear-gradient(135deg,#14b8a6,#0f766e)",
  color: "#fff",
  fontWeight: 950,
  fontSize: 15,
  marginTop: 4,
};

const secaoTitulo = {
  fontSize: 24,
  color: "#4b5563",
  fontWeight: 900,
  margin: "22px 0 12px",
};

 const cardLancamento = {
  background: "#ffffff",
  borderRadius: 20,
  padding: 12,
  boxShadow: "0 6px 18px rgba(15,23,42,0.10)",
  border: "1px solid rgba(148,163,184,0.22)",
};

const infoGrid = {
  marginTop: 10,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 5,
  fontSize: 11,
  color: "#64748b",
  fontWeight: 700,
};