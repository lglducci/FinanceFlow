import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal, dataLocal } from "../utils/dataLocal";
import { fetchSeguro } from "../utils/apiSafe";
import AutocompleteInput from "../components/AutocompleteInput";
export default function NovaModeloContabil() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");
  const [contas, setContas] = useState([]);
  const [debitoId, setDebitoId] = useState("");
  const [creditoId, setCreditoId] = useState("");
 const [debitoTexto, setDebitoTexto] = useState(""); 
  const [creditoTexto, setCreditoTexto] = useState(""); 

 


  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    tipo_automacao:"FINANCEIRO_PADRAO",
    tipo_evento:"",
    classificacao:""

  });

  useEffect(() => {
    async function carregarContas() {
      const url = buildWebhookUrl("contas_contabeis_lancaveis", { empresa_id:empresa_id });
      const r = await fetch(url);
      const j = await r.json();
      setContas(Array.isArray(j) ? j : []);
    }
    carregarContas();
  }, [empresa_id]);
 
 async function salvar() {
  try {
    const url = buildWebhookUrl("inseremodelo");

    const data = await fetchSeguro(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        codigo: form.codigo,
        nome: form.nome,
        tipo: "FINANCEIRO_PADRAO",
        dc: "",
        credito_id: creditoId,
        debito_id: debitoId,
        tipo_operacao: "customizado",
        tipo_evento: form.tipo_evento,
        classificacao: form.classificacao,
      }),
    });

    // 🔵 Se chegou aqui, deu certo
    alert("Modelo criado com sucesso!");
     navigate(-1); // 👈 AQUI

  } catch (error) {
    console.log("ERRO:", error);
    alert(error.message);
  }
}

return (
  <div className="min-h-screen bg-slate-100 px-4 py-6">
    <div className="fixed inset-0 bg-black/55" />

    <div className="relative z-10 w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-[22px] shadow-2xl border border-slate-200 overflow-hidden">

        {/* CABEÇALHO */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#08233d]">
              Novo Modelo Contábil
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Configure o modelo padrão de lançamento contábil.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-400 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* CORPO */}
        <div className="max-h-[68vh] overflow-y-auto px-6 py-5 space-y-6">

          {/* IDENTIFICAÇÃO */}
          <section className="space-y-4">
            <h2 className="text-sm font-black text-[#08233d]">
              Identificação
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4">
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={form.codigo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, codigo: e.target.value }))
                  }
                  placeholder="Ex: VENDA01"
                  className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div className="sm:col-span-8">
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nome: e.target.value }))
                  }
                  placeholder="Ex: Modelo venda à vista"
                  className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>
          </section>

          <div className="border-t border-slate-200" />

          {/* REGRA DO MODELO */}
          <section className="space-y-4">
            <h2 className="text-sm font-black text-[#08233d]">
              Regra do modelo
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Tipo de evento
                </label>

                <select
                  name="tipo_evento"
                  value={form.tipo_evento || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      tipo_evento: e.target.value,
                    }))
                  }
                  className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="receber">Receber</option>
                  <option value="receber_cartao">Receber Cartão</option>
                  <option value="pagar">Pagar</option>
                  <option value="financeiro">Financeiro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Classificação
                </label>

                <select
                  name="classificacao"
                  value={form.classificacao || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      classificacao: e.target.value,
                    }))
                  }
                  className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="receita">Receita</option>
                  <option value="custo">Custo</option>
                  <option value="despesa">Despesa</option>
                  <option value="imobilizado">Imobilizado</option>
                  <option value="ativo">Ativo</option>
                  <option value="passivo">Passivo</option>
                </select>
              </div>
            </div>
          </section>

          <div className="border-t border-slate-200" />

          {/* PARTIDA CONTÁBIL */}
          <section className="space-y-4">
            <h2 className="text-sm font-black text-[#08233d]">
              Partida contábil
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Conta Contábil — Débito
                </label>

                <div className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-1">
                  <AutocompleteInput
                    value={debitoTexto}
                    options={contas}
                    placeholder="Selecione a conta de débito"
                    onChange={(v) => {
                      setDebitoTexto(v);
                      setDebitoId(null);
                    }}
                    onSelect={(c) => {
                      setDebitoTexto(`${c.codigo} - ${c.nome}`);
                      setDebitoId(c.id);
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Conta Contábil — Crédito
                </label>

                <div className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-1">
                  <AutocompleteInput
                    value={creditoTexto}
                    options={contas}
                    placeholder="Selecione a conta de crédito"
                    onChange={(v) => {
                      setCreditoTexto(v);
                      setCreditoId(null);
                    }}
                    onSelect={(c) => {
                      setCreditoTexto(`${c.codigo} - ${c.nome}`);
                      setCreditoId(c.id);
                    }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-400">
              Esse modelo será usado para automatizar a classificação contábil
              conforme o tipo de evento e a classificação escolhida.
            </p>
          </section>
        </div>

        {/* RODAPÉ */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-11 px-6 rounded-lg border border-sky-200 bg-sky-50 text-[#08233d] text-sm font-black"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={salvar}
            className="h-11 px-7 rounded-lg bg-[#082f4f] text-white text-sm font-black shadow-md"
          >
            Salvar Modelo
          </button>
        </div>
      </div>
    </div>
  </div>
);
 
}
