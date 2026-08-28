import { useEffect, useState } from "react";
import { hojeLocal } from "../utils/dataLocal";

function primeiroDiaMes() {
  return `${hojeLocal().slice(0, 7)}-01`;
}

export default function ExtratoPeriodoModal({ conta, onClose, onConfirm }) {
  const [dataInicio, setDataInicio] = useState(primeiroDiaMes());
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [erro, setErro] = useState("");

  useEffect(() => {
    function fecharComEsc(evento) {
      if (evento.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", fecharComEsc);
    return () => window.removeEventListener("keydown", fecharComEsc);
  }, [onClose]);

  if (!conta) return null;

  function continuar(evento) {
    evento.preventDefault();
    setErro("");

    if (!dataInicio || !dataFim) {
      setErro("Informe a data inicial e a data final.");
      return;
    }

    if (dataInicio > dataFim) {
      setErro("A data inicial não pode ser maior que a data final.");
      return;
    }

    onConfirm?.({
      data_inicio: dataInicio,
      data_fim: dataFim,
    });
  }

  return (
    <div
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onClose?.();
      }}
      style={fundo}
    >
      <form onSubmit={continuar} style={modal}>
        <div style={cabecalho}>
          <div>
            <div style={rotuloSuperior}>EXTRATO BANCÁRIO</div>
            <div style={titulo}>{conta.conta_nome || "Conta bancária"}</div>
            <div style={subtitulo}>
              {conta.nro_banco ? `Banco ${conta.nro_banco}` : "Conta bancária"}
              {conta.agencia ? ` • Ag ${conta.agencia}` : ""}
              {conta.conta ? ` • Conta ${conta.conta}` : ""}
            </div>
          </div>

          <button type="button" onClick={onClose} aria-label="Fechar" style={fechar}>
            ×
          </button>
        </div>

        <div style={conteudo}>
          <div style={aviso}>
            Informe o período que deseja consultar. O extrato será apenas exibido; nada será importado nesta etapa.
          </div>

          <div style={campos}>
            <label style={label}>
              Data inicial
              <input
                type="date"
                value={dataInicio}
                max={dataFim || undefined}
                onChange={(evento) => setDataInicio(evento.target.value)}
                autoFocus
                style={input}
              />
            </label>

            <label style={label}>
              Data final
              <input
                type="date"
                value={dataFim}
                min={dataInicio || undefined}
                max={hojeLocal()}
                onChange={(evento) => setDataFim(evento.target.value)}
                style={input}
              />
            </label>
          </div>

          {erro && <div style={mensagemErro}>{erro}</div>}
        </div>

        <div style={rodape}>
          <button type="button" onClick={onClose} style={botaoCancelar}>
            Cancelar
          </button>

          <button type="submit" style={botaoContinuar}>
            Ver extrato
          </button>
        </div>
      </form>
    </div>
  );
}

const fundo = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  background: "rgba(15, 23, 42, 0.68)",
  backdropFilter: "blur(3px)",
};

const modal = {
  width: "min(520px, 100%)",
  overflow: "hidden",
  borderRadius: 20,
  background: "#ffffff",
  boxShadow: "0 24px 70px rgba(15, 23, 42, 0.35)",
};

const cabecalho = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  padding: "20px 22px",
  background: "#0F172A",
  color: "#ffffff",
};

const rotuloSuperior = {
  color: "#93c5fd",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: "0.16em",
};

const titulo = { marginTop: 5, fontSize: 20, fontWeight: 900 };
const subtitulo = { marginTop: 5, color: "#cbd5e1", fontSize: 12, fontWeight: 700 };

const fechar = {
  width: 34,
  height: 34,
  border: "1px solid #475569",
  borderRadius: "50%",
  background: "transparent",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: 24,
  lineHeight: 1,
};

const conteudo = { padding: 22 };

const aviso = {
  padding: "11px 13px",
  border: "1px solid #bfdbfe",
  borderRadius: 12,
  background: "#eff6ff",
  color: "#1e3a8a",
  fontSize: 12,
  fontWeight: 700,
  lineHeight: 1.45,
};

const campos = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 14,
  marginTop: 18,
};

const label = {
  display: "flex",
  flexDirection: "column",
  gap: 7,
  color: "#334155",
  fontSize: 12,
  fontWeight: 900,
};

const input = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 11px",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 14,
  fontWeight: 800,
  outline: "none",
};

const mensagemErro = {
  marginTop: 14,
  padding: "9px 11px",
  border: "1px solid #fecaca",
  borderRadius: 10,
  background: "#fef2f2",
  color: "#b91c1c",
  fontSize: 12,
  fontWeight: 800,
};

const rodape = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  padding: "15px 22px",
  borderTop: "1px solid #e2e8f0",
  background: "#f8fafc",
};

const botaoCancelar = {
  border: "1px solid #cbd5e1",
  borderRadius: 999,
  padding: "9px 16px",
  background: "#ffffff",
  color: "#334155",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 900,
};

const botaoContinuar = {
  border: "1px solid #047857",
  borderRadius: 999,
  padding: "9px 18px",
  background: "#059669",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 900,
  boxShadow: "0 5px 14px rgba(5, 150, 105, 0.25)",
};
