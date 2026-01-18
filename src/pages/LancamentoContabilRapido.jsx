import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";

export default function LancamentoContabilRapido() {
  const navigate = useNavigate();
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  /* ================== STATES ================== */
  const [usarModelo, setUsarModelo] = useState(false);

  const [contas, setContas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [linhasModelo, setLinhasModelo] = useState([]);

  const [debitoId, setDebitoId] = useState("");
  const [creditoId, setCreditoId] = useState("");

  const [modeloCodigo, setModeloCodigo] = useState("");
  const [modeloSelecionado, setModeloSelecionado] = useState(null);

  const [valor, setValor] = useState("");
  const [historico, setHistorico] = useState("");
  const [dataLancto, setDataLancto] = useState(hojeLocal());
  const [salvando, setSalvando] = useState(false);

  /* ================== LOAD CONTAS ================== */
  useEffect(() => {
    async function carregarContas() {
      const r = await fetch(
        buildWebhookUrl("contas_contabeis_lancaveis", { empresa_id })
      );
      const j = await r.json();
      setContas(j || []);
    }
    carregarContas();
  }, [empresa_id]);

  /* ================== LOAD MODELOS ================== */
  useEffect(() => {
    async function carregarModelos() {
      const r = await fetch(
        buildWebhookUrl("modelos", { empresa_id })
      );
      const j = await r.json();
      setModelos(j || []);
    }
    carregarModelos();
  }, [empresa_id]);

  /* ================== SELECIONAR MODELO ================== */
  async function selecionarModelo(token) {
    setModeloCodigo(token);

    const m = modelos.find((x) => x.codigo === token);
    setModeloSelecionado(m);
    if (!m) return;

    setHistorico(m.nome); // 🔥 histórico automático

    const r = await fetch(
      buildWebhookUrl("modelos_linhas", {
        empresa_id,
        modelo_id: m.id,
      })
    );
    const j = await r.json();
    setLinhasModelo(j || []);
  }

  /* ================== RESOLVER D/C ================== */
  function resolverDebitoCredito() {
    if (!usarModelo) {
      return {
        debito_id: Number(debitoId),
        credito_id: Number(creditoId),
      };
    }

    let d = null;
    let c = null;

    for (const l of linhasModelo) {
      if (l.dc === "D") d = l.conta_id;
      if (l.dc === "C") c = l.conta_id;
    }

    if (!d || !c) {
      throw new Error("Modelo inválido (D/C não encontrado).");
    }

    return { debito_id: d, credito_id: c };
  }

  /* ================== SALVAR ================== */
  async function salvar() {
    if (!valor || Number(valor) <= 0) {
      alert("Valor inválido.");
      return;
    }

    if (!historico) {
      alert("Histórico obrigatório.");
      return;
    }

    let contas;
    try {
      contas = resolverDebitoCredito();
    } catch (e) {
      alert(e.message);
      return;
    }

    if (contas.debito_id === contas.credito_id) {
      alert("Débito e crédito não podem ser iguais.");
      return;
    }

    try {
       
      setSalvando(true);

      await fetch(buildWebhookUrl("lancto_modelo"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          data_lancto: dataLancto,
          debito_id: contas.debito_id,
          credito_id: contas.credito_id,
          valor: Number(valor),
          historico,
        }),
      });

      // 🔥 LIMPA SÓ O NECESSÁRIO
      setValor("");
      setCreditoId("");

    } catch {
      alert("Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  /* ================== UI ================== */
  return (
    <div className="max-w-2xl mx-auto p-2">
      
      <div className="min-h-screen py-6 px-4 bg-bgSoft"> 
      
      <div className="bg-[#061f4aff] rounded-xl p-3 mb-4 text-white text-center"> 

   
       
            <h2 className="text-2xl font-bold mb-6 text-center text-white"> 
          ⚡ Lançamento Contábil Rápido</h2>
  

      <div className="bg-white rounded-xl p-6 space-y-4">

        {/* MODO */}
        <label className="flex items-center gap-2 font-bold text-[#1e40af]">
          <input
            type="checkbox"
            checked={usarModelo}
            onChange={(e) => setUsarModelo(e.target.checked)}
          />
          Usar modelo (token)
        </label>

        {/* TOKEN */}
        {usarModelo && (
          <input
            list="tokens"
            className="input-premium"
            placeholder="Token do modelo"
            value={modeloCodigo}
            onChange={(e) => selecionarModelo(e.target.value)}
          />
        )}
        <datalist id="tokens">
          {modelos.map((m) => (
            <option key={m.id} value={m.codigo} />
          ))}
        </datalist>

                      {/* ================= BLOCO MODELO (SÓ SE TOKEN) ================= */}
              {usarModelo && modeloSelecionado && (
                <div className="space-y-3">

                  <div className="bg-gray-300 text-[#003ba2] p-3 rounded font-bold">
                    Nome: {modeloSelecionado.nome}
                  </div>

                  <table className="tabela tabela-mapeamento w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-900 text-white">
                        <th>ID</th>
                        <th>Conta</th>
                        <th>Nome</th>
                        <th>Tipo</th>
                        <th>Natureza</th>
                        <th>D/C</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linhasModelo.map((l, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? "bg-gray-100" : "bg-gray-200"}
                        >
                          <td   className="text-[#061f4aff]">{l.conta_id}</td>
                          <td className="text-[#061f4aff]">{l.codigo}</td>
                          <td className="text-[#061f4aff]">{l.nome}</td>
                          <td className="text-[#061f4aff]">{l.tipo}</td>
                          <td className="text-[#061f4aff]">{l.natureza}</td>
                          <td className="font-bold text-[#061f4aff]">{l.dc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>
              )}


        {/* MANUAL */}
        {!usarModelo && (
          <>
          <div className="mb-4">
              <label className="block w-full text-left text-sm font-bold text-[#061f4aff] mb-1">
                Saida
              </label>
            <select
              className="input-premium"
              value={debitoId}
              onChange={(e) => setDebitoId(e.target.value)}
            >
              <option value="">Débito</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} - {c.nome}
                </option>
              ))}
            </select>

            </div>
            
            <div className="mb-4">
              <label className="block w-full text-left text-sm font-bold text-[#061f4aff] mb-1">
                Entrada
              </label>

            <select
              className="input-premium"
              value={creditoId}
              onChange={(e) => setCreditoId(e.target.value)}
            >
              <option value="">Crédito</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} - {c.nome}
                </option>
              ))}
            </select>
                </div>
          </>
        )}
           
        <div className="mb-4">
              <label className="block w-full text-left text-sm font-bold text-[#061f4aff] mb-1">
              Histórico
              </label>

        <input
          className="input-premium"
          placeholder="Histórico"
          value={historico}
          onChange={(e) => setHistorico(e.target.value)}
        />
         </div>

          <div className="mb-4">
              <label className="block w-full text-left text-sm font-bold text-[#061f4aff] mb-1">
              Valor
              </label>

        <input
          type="number"
          className="input-premium"
          placeholder="00,00"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
         </div>
 
        <div className="mb-4">
              <label className="block w-full text-left text-sm font-bold text-[#061f4aff] mb-1">
              Data Movimento
              </label>
        <input
          type="date"
          className="input-premium"
          value={dataLancto}
          onChange={(e) => setDataLancto(e.target.value)}
        />

         </div>

        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full bg-[#061f4aff] text-white font-bold py-3 rounded"
        >
          {salvando ? "Salvando..." : "Salvar (Enter)"}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="w-full bg-gray-400 text-white font-bold py-2 rounded"
        >
          Voltar
        </button>
      </div>
       </div>
      </div>
    </div>
  );
}
