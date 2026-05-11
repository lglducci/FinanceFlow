import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../../config/globals";
import { useNavigate } from "react-router-dom";

export default function AppFornecedor() {
  const navigate = useNavigate();
  const empresa_id = Number(
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa") ||
    1
  );

  const [lista, setLista] = useState([]);
  const [tipo, setTipo] = useState("fornecedor");
  const [carregando, setCarregando] = useState(false);
  const [filtro, setFiltro] = useState("");

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
    margin: "-16px -16px 28px",
  };

  const card = {
    background: "#ffffff",
    borderRadius: 28,
    padding: 20,
    boxShadow: "0 10px 28px rgba(15,23,42,0.12)",
    border: "1px solid rgba(148,163,184,0.25)",
  };

  const listaFiltrada = lista.filter((c) =>
    c.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    c.cpf_cnpj?.toLowerCase().includes(filtro.toLowerCase()) ||
    c.telefone?.toLowerCase().includes(filtro.toLowerCase()) ||
    String(c.id).includes(filtro)
  );

  async function carregar() {
    try {
      setCarregando(true);

      const url = buildWebhookUrl("fornecedorcliente", {
        empresa_id,
        tipo,
      });

      const resp = await fetch(url);
      const texto = await resp.text();

      let json = [];
      try {
        json = JSON.parse(texto);
      } catch {
        json = [];
      }

      setLista(Array.isArray(json) ? json : []);
    } catch (e) {
      alert("Erro ao carregar dados.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [tipo]);

  function novo() {
    navigate("/app/fornecedores/novo");
  }

 function editar(id) {
  navigate(`/app/fornecedores/editar/${id}`);
}

  async function excluirFornecedorCliente(id) {
    if (!confirm("Deseja excluir este registro?")) return;

    try {
      const url = buildWebhookUrl("excluirfornecedorcliente");

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, empresa_id }),
      });

      const texto = await resp.text();
      let json = {};

      try {
        json = JSON.parse(texto);
      } catch {}

      if (texto.includes("foreign") || texto.includes("violates")) {
        alert("Não é possível excluir: possui movimentações.");
        return;
      }

      alert(json.message || "Excluído com sucesso!");
      setLista((p) => p.filter((x) => x.id !== id));
    } catch (e) {
      alert("Erro ao excluir.");
    }
  }

  return (
    <div style={tela}>
      <div style={topoCard}>
        <div style={{ position: "relative", textAlign: "center", paddingTop: 4 }}>
          <button
            type="button"
            onClick={() => navigate("/app/configuracoes")}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              border: 0,
              background: "transparent",
              fontSize: 28,
              fontWeight: 900,
              color: "#1e293b",
            }}
          >
            ←
          </button>

          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b" }}>
            👥 Fornecedores
          </h1>

          <p style={{ color: "#64748b", fontSize: 14, fontWeight: 800, marginTop: 8 }}>
            Pesquise fornecedores e clientes da empresa.
          </p>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={{ fontWeight: 900, color: "#0b1744", fontSize: 14 }}>
              Tipo
            </label>

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              style={{
                width: "100%",
                height: 46,
                marginTop: 6,
                borderRadius: 18,
                border: "1px solid #cbd5e1",
                padding: "0 14px",
                fontWeight: 800,
                color: "#334155",
              }}
            >
              <option value="fornecedor">Fornecedor</option>
              <option value="cliente">Cliente</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 900, color: "#0b1744", fontSize: 14 }}>
              Pesquisar
            </label>

            <input
              type="text"
              placeholder="Nome, documento, telefone ou ID"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              style={{
                width: "100%",
                height: 46,
                marginTop: 6,
                borderRadius: 18,
                border: "1px solid #cbd5e1",
                padding: "0 14px",
                fontWeight: 800,
                color: "#334155",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={carregar}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 999,
                border: 0,
                background: "linear-gradient(135deg,#2744b8,#08748f)",
                color: "#fff",
                fontWeight: 900,
                boxShadow: "0 8px 18px rgba(39,68,184,0.25)",
              }}
            >
              {carregando ? "Carregando..." : "Pesquisar"}
            </button>

            <button
              onClick={novo}
              title="Novo fornecedor"
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                border: 0,
                   background: "linear-gradient(135deg,#2744b8,#08748f)",
                color: "#fff",
                fontSize: 28,
                lineHeight: "32px",
                fontWeight: 300,
                boxShadow: "0 8px 18px rgba(2, 4, 127, 0.35)",
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div style={card}>
        {listaFiltrada.length === 0 ? (
          <div style={{ color: "#64748b", fontWeight: 800, textAlign: "center", padding: 12 }}>
            Nenhum registro encontrado.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {listaFiltrada.map((c) => {
              const corTipo =
                c.tipo?.toLowerCase() === "fornecedor"
                  ? "#dc2626"
                  : c.tipo?.toLowerCase() === "cliente"
                  ? "#16a34a"
                  : "#475569";

              return (
                <div
                  key={c.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    borderRadius: 22,
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "#94a3b8" }}>
                        ID {c.id}
                      </div>

                      <div style={{ fontSize: 17, fontWeight: 900, color: "#0b1744", marginTop: 3 }}>
                        {c.nome}
                      </div>

                      <div style={{ fontSize: 13, fontWeight: 900, color: corTipo, marginTop: 3 }}>
                        {c.tipo || "-"}
                      </div>

                      <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginTop: 3 }}>
                        {c.cpf_cnpj || "Sem documento"}
                      </div>

                      <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginTop: 2 }}>
                        {c.telefone || "Sem telefone"}
                      </div>
                    </div>

                    <button
                      onClick={() => excluirFornecedorCliente(c.id)}
                      title="Excluir"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        border: 0,
                        background: "#fee2e2",
                        color: "#dc2626",
                        fontSize: 20,
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <button
                    onClick={() => editar(c.id)}
                    style={{
                        marginTop: 8,
                        height: 30,
                        padding: "0 14px",
                        borderRadius: 999,
                        border: 0,
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        fontSize: 12,
                        fontWeight: 900,
                    }}
                    >
                    Editar
                    </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}