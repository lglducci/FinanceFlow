 import React, { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
 
/* 🎨 Tema azul coerente */
const THEME = {
  title: "#ff9f43",
};

export default function ContasGerenciaisNovo() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);
 
  /* ===============================
     ESTADO DO FORMULÁRIO
  ================================== */
  const [form, setForm] = useState({
    nome: "",
    tipo: "entrada",
    grupo_contabil: "",
  });

  /* modelos = tokens do diário */
  const [modelos, setModelos] = useState([]);
  const [modeloSelecionado, setModeloSelecionado] = useState(null);
  const [linhas, setLinhas] = useState([]);

  /* ===============================
     CARREGA OS MODELOS DO DIÁRIO
  ================================== */
  async function carregarModelos() {
    try {
      const url = buildWebhookUrl("modelos", { empresa_id });
      const r = await fetch(url);
      const dados = await r.json();
      setModelos(dados);
    } catch (e) {
      console.log("Erro ao carregar modelos:", e);
    }
  }

  /* ===============================
     QUANDO O USUÁRIO ESCOLHE O TOKEN
  ================================== */
  async function selecionarGrupo(token) {
    setForm({ ...form, grupo_contabil: token });

    const modelo = modelos.find((m) => m.codigo === token);
    setModeloSelecionado(modelo);

    if (!modelo) {
      setLinhas([]);
      return;
    }

    const url = buildWebhookUrl("modelos_linhas", {
      empresa_id,
      modelo_id: modelo.id,
    });

    const r = await fetch(url);
    const dados = await r.json();
    setLinhas(dados);
  }

  /* ===============================
     SALVAR NOVA CATEGORIA
  ================================== */
  async function salvar() {
    const url = buildWebhookUrl("novacategoriagerencial");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa_id, ...form }),
    });

    const texto = await resp.text();
    let json = {};

    try { json = JSON.parse(texto); } catch {}

    if (Array.isArray(json) && json.length > 0 && json[0].id) {
      alert("Categoria criada!");
      navigate(-1);
      return;
    }

    alert("Erro ao salvar");
  }

  useEffect(() => {
    carregarModelos();
  }, []);

  /* ===============================
        TELA
  ================================== */
  return (
    <div className="min-h-screen py-6 px-4 bg-bgSoft">
        <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#061f4aff] text-white mt-1 mb-1" >

        <h1
          className="text-2xl md:text-2xl font-bold p-2 mb-3 text-center"
          style={{ color: THEME.title }}
        >
          ✏️ Nova Categoria Gerencial
        </h1>

        <div className="bg-gray-100 p-5 rounded-xl shadow flex flex-col gap-4">

          {/* NOME */}
          <label className="label label-required font-bold text-[#1e40af]">Nome</label>
          <input
            className="input-premium"
            value={form.nome}
            placeholder="Ex: Vendas Delivery"
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />

          {/* TIPO */}
          <label className=" label label-required font-bold text-[#1e40af]">Tipo</label>
          <select
            className="input-premium"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>



          

          {/* GRUPO CONTÁBIL (TOKENS DO MODELO) */}
          <label className="label label-required font-bold text-[#1e40af]">Grupo Contábil</label>

          <select
            className="input-premium"
            value={form.grupo_contabil}
            onChange={(e) => selecionarGrupo(e.target.value)}
          >
            <option value="">Selecione o Token...</option>
            {modelos.map((m) => (
              <option key={m.id} value={m.codigo}>
                {m.codigo}
              </option>
            ))}
          </select>

          {/* MOSTRA O MODELO ESCOLHIDO (IGUAL AO DIÁRIO) */}
          {modeloSelecionado && (
            <div style={{ marginTop: 15 }}>
              <div
                style={{
                  background: "#bfc0c2ff",
                  padding: 10,
                  borderRadius: 6,
                  color: "#003ba2",
                  marginBottom: 10,
                }}
              >
                <b>Nome:</b> {modeloSelecionado.nome}
              </div>

              <table
                className="tabela tabela-mapeamento"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr style={{ background: "#002b80", color: "white" }}>
                    <th>ID</th>
                    <th>Conta</th>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Natureza</th>
                    <th>D/C</th>
                  </tr>
                </thead>

                <tbody>
                  {linhas.map((l, i) => (
                    <tr
                      key={i}
                      style={{
                             background: i % 2 === 0 ? "#eee4e4ff" : "#d2d2e8ff",
                      }}
                    >
                      <td style={{ color:  "#003ba2" }} >{l.conta_id}</td>
                      <td style={{ color:  "#003ba2" }}>{l.codigo}</td>
                      <td style={{ color:  "#003ba2" }}>{l.nome}</td>
                      <td style={{ color:  "#003ba2" }}>{l.tipo}</td>
                      <td style={{ color:  "#003ba2" }}>{l.natureza}</td>
                      <td style={{ color:  "#003ba2" }}>{l.dc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* BOTÕES */}
          <div className="flex gap-6 pt-8 pb-8 pl-1">

            <button
              onClick={salvar} 
              className="flex-1 bg-[#061f4aff] text-white px-5 py-2 rounded font-bold"
            >
              Salvar
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-500 text-white px-4 py-3 rounded font-bold"
            >
              Cancelar
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
