 import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function AlterarSaldo() {
  const { id } = useParams(); // pode ser undefined
  const navigate = useNavigate();
  const { state } = useLocation();

  const empresa_id = Number(
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa")
  );


  const THEME = {
  

  title: "#ff9f43" 
  
};

  const modoNovo = !id;

  const [contas, setContas] = useState([]);
  const [contaId, setContaId] = useState(id ? Number(id) : "");
  const [tipo, setTipo] = useState("entrada");
  const [valor, setValor] = useState("");
  const [historico, setHistorico] = useState("");
  const [loading, setLoading] = useState(false);

  const contaCodigo = state?.conta_codigo || "";
  const contaNome   = state?.conta_nome || "";

  // 🔹 Carrega contas SOMENTE se for modo novo
  useEffect(() => {
    if (!modoNovo) return;

    async function carregarContas() {
      const url = buildWebhookUrl("contas_contabeis_lancaveis", { empresa_id });
      const r = await fetch(url);
      const j = await r.json();
      setContas(Array.isArray(j) ? j : []);
    }

    carregarContas();
  }, [modoNovo]);

  async function salvar() {
    if (!contaId) {
      alert("Selecione a conta.");
      return;
    }

    if (!valor || Number(valor) <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    if (!historico.trim()) {
      alert("Informe o histórico.");
      return;
    }

    const valor_debito  = tipo === "entrada" ? Number(valor) : 0;
    const valor_credito = tipo === "saida"   ? Number(valor) : 0;

    setLoading(true);

    try {
      const url = buildWebhookUrl("lancamento_contabil_manual");

      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          conta_id: Number(contaId),
          valor_debito,
          valor_credito,
          historico
        })
      });

      alert("Lançamento gerado com sucesso!");
      navigate("/lancamentos-contabeis");

    } catch {
      alert("Erro ao salvar lançamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto">

     <div className="w-full max-w-2xl mx-auto rounded-2xl p-2 shadow-xl bg-[#1e40af]  mt-1 mb-1" >

        <h2
          className="text-2xl md:text-2xl font-bold p-2 mb-3 text-center" style={{ color: THEME.title }} >
       ✏️ {modoNovo ? "Lançamento Contábil Manual" : "Alterar Saldo da Conta"}
      </h2>

      <div className="bg-white rounded-xl shadow p-6 border-[3px] border-blue-900 space-y-4">

        {/* CONTA */}
        <div>
          <label className="label label-required font-bold text-[#1e40af]">Conta Contábil</label>

          {modoNovo ? (
            <select
              value={contaId}
              onChange={e => setContaId(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Selecione</option>
              {contas.map(c => (
                <option key={c.id} value={c.id}>
                  {c.codigo} - {c.nome}
                </option>
              ))}
            </select>
          ) : (
            <input
              disabled
              value={`${contaCodigo} - ${contaNome}`}
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          )}
        </div>

        {/* TIPO */}
        <div>
          <label className="label label-required font-bold text-[#1e40af]">Tipo</label>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
        </div>

        {/* VALOR */}
        <div>
          <label className="label label-required font-bold text-[#1e40af]">Valor</label>
          <input
            type="number"
            step="0.10"
            value={valor}
            onChange={e => setValor(e.target.value)}
            className="w-full border px-3 py-2 rounded" 
            placeholder="00,00"
          />
        </div>

        {/* HISTÓRICO */}
        <div>
          <label className="label label-required font-bold text-[#1e40af]">Histórico</label>
          <input
            value={historico}
            onChange={e => setHistorico(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={salvar}
            disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold"
          >
            Salvar
          </button>  

          <button
            onClick={() => navigate(-1)}
             className="flex-1 bg-gray-400 text-white px-4 py-3  rounded-lg font-semibold"
          >
            Cancelar
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
