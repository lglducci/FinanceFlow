 import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function EditarContaContabil() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const id = state?.id;
  const empresa_id = state?.empresa_id;

  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    tipo: "",
    natureza: "",
    nivel: "",
  });

  async function carregar() {
    try {
      const url = buildWebhookUrl("contascontabeis", {
        empresa_id:empresa_id,
        id:id,
        dc: "",
      });

      const resp = await fetch(url);
      const dados = await resp.json();

      if (dados.length > 0) {
        const c = dados[0];
        setForm({
          codigo: c.codigo,
          nome: c.nome,
          tipo: c.tipo,
          natureza: c.natureza,
          nivel: c.nivel,
        });
      }
    } catch (e) {
      console.log("ERRO AO CARREGAR", e);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar() {
    try {
      const url = buildWebhookUrl("atualizar_conta_contabil", {
        id,
        empresa_id,
        ...form,
      });

      await fetch(url, { method: "POST" });
      alert("Conta atualizada!");
      navigate("/contascontabeis");
    } catch (e) {
      alert("Erro ao salvar!");
    }
  }

  return (
     <div
      style={{
        margin: "0 auto",
        marginTop: 40,
        width: "450px",
        background: "#003ba2",
        padding: 20,
        borderRadius: 12,
        color: "white",
      }}
    >
          {/* TÍTULO IGUALZINHO */}
          <h2
             style={{ textAlign: "center", marginBottom: 20 }}>
            ✏️ Editar Conta Contábil
          </h2>
 
        <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
          color: "black",
        }}
      > 
          {/* CAMPOS */}
          <label>Código</label>
          <input
            style={input}
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
          />

          <label>Nome</label>
          <input
            style={input}
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />

          <label>Tipo</label>
          <select
            style={input}
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            <option value="">Selecione...</option>
            <option value="ATIVO">ATIVO</option>
            <option value="PASSIVO">PASSIVO</option>
            <option value="RECEITA">RECEITA</option>
            <option value="DESPESA">DESPESA</option>
            <option value="PL">PL</option>
          </select>

          <label>Natureza</label>
          <select
            style={input}
            value={form.natureza}
            onChange={(e) => setForm({ ...form, natureza: e.target.value })}
          >
            <option value="">Selecione...</option>
            <option value="D">D</option>
            <option value="C">C</option>
          </select>

          <label>Nível</label>
          <input
            style={input}
            value={form.nivel}
            onChange={(e) => setForm({ ...form, nivel: e.target.value })}
          />

          {/* BOTÕES */}
          <div
            style={{
              marginTop: 25,
              display: "flex",
              justifyContent: "space-between",
              gap: 15,
            }}
          >
          
            <button   onClick={salvar} style={{
              width: "48%",
              background: "#003ba2",
              color: "white",
              padding: 10,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
            }}>
              Salvar
            </button>

            <button
            onClick={() => navigate("/contascontabeis")}
            style={{
              width: "48%",
              background: "#b0b0b0",
              color: "black",
              padding: 10,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          </div>
        </div>
      </div>
    
  );
}

const input = {
  width: "100%",
  padding: "8px",
  marginBottom: 12,
  borderRadius: 6,
  border: "1px solid #aaa",
};

const btnSalvar = {
  background: "#005bdf",
  border: "none",
  padding: "10px 28px",
  color: "white",
  fontWeight: "bold",
  borderRadius: 6,
  cursor: "pointer",
};

const btnCancelar = {
  background: "#999",
  border: "none",
  padding: "10px 28px",
  color: "white",
  fontWeight: "bold",
  borderRadius: 6,
  cursor: "pointer",
};
