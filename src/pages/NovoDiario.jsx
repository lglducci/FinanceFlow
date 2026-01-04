import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function NovoDiario() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [form, setForm] = useState({
    data_mov: new Date().toISOString().split("T")[0],
    modelo_codigo: "",
    historico: "",
    doc_ref: "",
    parceiro_id: "",
    data_vencto: "",
    valor_total: "0,00",
    valor_custo: "0,00",
    valor_imposto: "0,00",
    desconto: "0,00",
  });

  const [modelos, setModelos] = useState([]);
  const [modeloSelecionado, setModeloSelecionado] = useState(null);
  const [linhas, setLinhas] = useState([]);
  const [pessoas, setPessoas] = useState([]);


  function capitalizeWords(str) {
  return str
    .toLowerCase()
    .replace(/_/g, " ") // troca underline por espaço
    .replace(/\b\w/g, (l) => l.toUpperCase()); // primeira letra de cada palavra maiúscula
}




  // =============================
  // CARREGA LISTA DE TOKENS
  // =============================
  async function carregarModelos() {
    const url = buildWebhookUrl("modelos", { empresa_id });
    const r = await fetch(url);
    const j = await r.json();
    setModelos(j);
  }

  // =============================
  // CARREGA PARCEIROS
  // =============================
  async function carregarPessoas() {
    const url = buildWebhookUrl("fornecedorcliente", { empresa_id , tipo: "fornecedor"});
    const r = await fetch(url);
    const j = await r.json();
    setPessoas(j);
  }

  // =============================
  // SELECIONA MODELO / MOSTRA LINHAS
  // =============================
  async function selecionarModelo(token) {
    setForm((f) => ({ ...f, modelo_codigo: token }));

    const m = modelos.find((x) => x.codigo === token);
    setModeloSelecionado(m);

    if (!m) return;

    const url = buildWebhookUrl("modelos_linhas", {
      empresa_id,
      modelo_id: m.id,
    });

    const r = await fetch(url);
    const dados = await r.json();
    setLinhas(dados);
  }

  // =============================
  // MÁSCARAS DE VALOR
  // =============================
  function maskValor(v) {
    v = v.replace(/\D/g, "");
    v = (v / 100).toFixed(2) + "";
    v = v.replace(".", ",");
    return v;
  }

  // =============================
  // SALVAR
  // =============================
  async function salvar() {
    try {
      const url = buildWebhookUrl("inserediario");


       if (!form.modelo_codigo) {
          alert(" Modelo Contábil é obrigatório.");
          return;
        }
      

        if (!form.historico.trim()) {
          alert("Historico é obrigatório.");
          return;
        }
        
        
        if (!form.data_mov) {
          alert(" Data de Movimento é obrigatório.");
          return;
        }

          // ================== VALIDAÇÕES ==================
      
            const valor = parseFloat(form.valor_total);

            if (!Number.isFinite(valor) || valor <= 0) {
              alert("Valor inválido.");
              return;
            }


         
        if (!form.doc_ref) {
          alert(" Documento é obrigatório.");
          return;
        } 

        if (! form.parceiro_id) {
          alert("Fornecedor é obrigatório.");
          return;
        }
 
    
        
         
        
        if (!form.data_vencto) {
          alert(" Vencimento é obrigatório.");
          return;
        }


        
          
         

      const payload = {
        empresa_id,
        ...form,
        valor_total: form.valor_total.replace(".", "").replace(",", "."),
        valor_custo: form.valor_custo.replace(".", "").replace(",", "."),
        valor_imposto: form.valor_imposto.replace(".", "").replace(",", "."),
        desconto: form.desconto.replace(".", "").replace(",", "."),
      };

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const texto = await resp.text();
      let json = null;

      try {
        json = JSON.parse(texto);
      } catch {
        alert("Resposta inválida do servidor.");
        return;
      }

      const item = Array.isArray(json) ? json[0] : json;

      if (item?.ok === false) {
        alert(item.message || "Erro ao salvar.");
        return;
      }

      alert("Lançamento salvo!");
      navigate("/diario");

    } catch (e) {
      console.log("ERRO:", e);
      alert("Erro de comunicação.");
    }
  }

  useEffect(() => {
    carregarModelos();
    carregarPessoas();
  }, []);

  // -----------------------------------------------------
  //  TELA
  // -----------------------------------------------------

  return (
    <div style={{ padding: 20, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 600, background: "#003ba2", padding: 20, borderRadius: 12 }}>
        
        <div style={{ textAlign: "center", color: "white", marginBottom: 15 }}>
          <h2>📝 Novo Lançamento  Diário</h2>
        </div>

        <div style={{ background: "white", padding: 20, borderRadius: 10 }}>

          {/* ================= TOKEN ================= */}
          <label  className="label label-required font-bold text-[#1e40af]" >Token do Modelo</label>
          <input
            list="listaTokens" 
            value={form.modelo_codigo}
            className="input-premium"
            onChange={(e) => selecionarModelo(e.target.value)}
            placeholder="Ex: VENDA_BEBIDA"
            style={{ width: "100%", padding: 10, marginBottom: 15 }}
          />
          <datalist id="listaTokens">
            {modelos.map((m) => (
              <option key={m.id} value={m.codigo} />
            ))}
          </datalist>

          {/* ================= BLOCO MODELO ================= */}
          {modeloSelecionado && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  background: "#bfc0c2ff",
                  color: "white",
                  padding: 10,
                  borderRadius: 6,
                }}
              >
                 
                <b className="font-bold text-[#003ba2]"> Nome:</b > {modeloSelecionado.nome}
              </div>

              <table   className="tabela tabela-mapeamento" style={{ width: "100%", borderCollapse: "collapse" }} >
                <thead>
                  <tr style={{ background: "#09090aff" }}>
                    <th className="font-bold text-[#1e40af text-align: left]">ID</th>
                    <th className="font-bold text-[#1e40af text-align: left]">Conta</th>
                    <th className="font-bold text-[#1e40af text-align: left]">Nome</th>
                    <th className="font-bold text-[#1e40af text-align: left]">Tipo</th>
                    <th className="font-bold text-[#1e40af text-align: left]">Natureza</th>
                    <th className="font-bold text-[#1e40af text-align: left]">D/C</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((l, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f7f7f7" : "#ececec" }}>
                      <td className="font-bold text-[#1e40af text-align: left]">{l.conta_id}</td>
                      <td className="font-bold text-[#1e40af text-align: left]">{l.codigo}</td>
                      <td className="font-bold text-[#1e40af text-align: left]">{l.nome}</td>
                      <td className="font-bold text-[#1e40af text-align: left]">{l.tipo}</td>
                      <td className="font-bold text-[#1e40af text-align: left]">{l.natureza}</td>
                      <td className="font-bold text-[#1e40af text-align: left]">{l.dc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          

          {/* ================= CAMPOS DIÁRIO ================= */}
          <label   className="label label-required font-bold text-[#1e40af]" >Histórico</label>
          <input
            value={form.historico}
            className="input-premium"
            onChange={(e) => setForm((f) => ({ ...f, historico: e.target.value }))}
            style={{ width: "100%", padding: 10, marginBottom: 15 }}
          />

          <label   className="label label-required font-bold text-[#1e40af]" >Data Movimento</label>
          <input
            type="date"
            value={form.data_mov}
            className="input-premium"
            onChange={(e) => setForm((f) => ({ ...f, data_mov: e.target.value }))}
            style={{ width: "100%", padding: 10, marginBottom: 15 }}
          />

          <label  className="label label-required font-bold text-[#1e40af]" >Documento</label>
          <input
            value={form.doc_ref}
            className="input-premium"
            onChange={(e) => setForm((f) => ({ ...f, doc_ref: e.target.value }))}
            style={{ width: "100%", padding: 10, marginBottom: 15 }}
          />

          <label  className="label label-required font-bold text-[#1e40af]" > Parceiro</label>
          <select
            value={form.parceiro_id}
            className="input-premium"
            onChange={(e) => setForm((f) => ({ ...f, parceiro_id: e.target.value }))}
            style={{ width: "100%", padding: 10, marginBottom: 15 }}
          >
            <option value="">Selecione...</option>
            {pessoas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          <label   className="label label-required font-bold text-[#1e40af]" > Data Vencimento</label>
          <input
            type="date"
            value={form.data_vencto}
            className="input-premium"
            onChange={(e) => setForm((f) => ({ ...f, data_vencto: e.target.value }))}
            style={{ width: "100%", padding: 10, marginBottom: 15 }}
          />

           {/* VALORES */}
                {["valor_total"].map((campo) => (
                  <div key={campo}>
                    <label  className="label label-required font-bold text-[#1e40af]">
                      {capitalizeWords(campo)}
                    </label>

                    <input
                      value={form[campo]}
                      className="input-premium"
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [campo]: maskValor(e.target.value) }))
                      }
                      style={{ width: "100%", padding: 10, marginBottom: 15 }}
                    />
                  </div>
                ))}


          {/* BOTÕES */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={salvar}
                style={{
              width: "48%",
              background: "#003ba2",
              color: "white",
              padding: 10,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
            }}
            >
              Salvar
            </button>

            <button
              onClick={() => navigate("/diario")}
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
    </div>
  );
}
