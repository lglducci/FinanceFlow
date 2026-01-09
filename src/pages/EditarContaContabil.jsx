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
       <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#1e40af] text-white mt-1 mb-1" >

        <h2
          className="text-2xl md:text-2xl font-bold p-2 mb-3 text-center">
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
          <label className="label label-required font-bold text-[#1e40af]">Código</label>
          <input
            style={input}
            value={form.codigo}
             className="input-premium"
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
          />

          <label className="label label-required font-bold text-[#1e40af]">Nome</label>
          <input
            style={input}
            value={form.nome}
             className="input-premium"
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />

          <label className="label label-required font-bold text-[#1e40af]">Tipo</label>
          <select
            style={input}
            value={form.tipo}
             className="input-premium"
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            <option value="">Selecione...</option>
            <option value="ATIVO">ATIVO</option>
            <option value="PASSIVO">PASSIVO</option>
            <option value="RECEITA">RECEITA</option>
            <option value="DESPESA">DESPESA</option>
            <option value="PL">PL</option>
          </select>

          <label className="label label-required font-bold text-[#1e40af]">Natureza</label>
          <select
            style={input}
            value={form.natureza}
             className="input-premium"
            onChange={(e) => setForm({ ...form, natureza: e.target.value })}
          >
            <option value="">Selecione...</option>
            <option value="D">D</option>
            <option value="C">C</option>
          </select>

          <label className="label label-required font-bold text-[#1e40af]">Nível</label>
          <input
            style={input}
            value={form.nivel}
             className="input-premium"
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
