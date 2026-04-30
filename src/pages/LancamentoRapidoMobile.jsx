import { useEffect, useState } from "react";
import { hojeLocal } from "../utils/dataLocal";
import { buildWebhookUrl } from "../config/globals";
import { fetchSeguro } from "../utils/apiSafe";

export default function LancamentoRapidoMobile() {
  const [step, setStep] = useState(1);

  const totalSteps = 5;
 const empresa_id = localStorage.getItem("empresa_id") || "1";
  
 const [form, setForm] = useState({
  tipo: "",
  classificacao: "",
  forma: "",
  valor: "",
  descricao: "",
  conta: ""
});

  function next() {
    setStep((s) => s + 1);
  }

  function voltar() {
    setStep((s) => s - 1);
  }

 async function salvar() {
  if (!podeAvancar()) {
    alert("Preencha todos os campos obrigatórios antes de salvar.");
    return;
  }

  const payload = {
    empresa_id,
    tipo: form.tipo,
    valor: form.valor,
    descricao: form.descricao,
    classificacao: form.classificacao,
    data: hojeLocal(),
    forma_pagamento: form.tipo === "saida" ? form.forma : null,
    forma_recebimento: form.tipo === "entrada" ? form.forma : null,
    origem: "WebApp",
    conta: form.conta,
  };

  try {
    await fetchSeguro(buildWebhookUrl("novolancamento"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("Salvo com sucesso!");
    limparFormulario();
  } catch (err) {
    alert(err.message || "Erro ao salvar lançamento.");
  }
}
 
const [contas, setContas] = useState([]);

async function carregarContas() {
  const resp = await fetch(buildWebhookUrl("listacontas", { empresa_id }));
  const data = await resp.json();
  setContas(Array.isArray(data) ? data : []);
}

useEffect(() => {
  carregarContas();
}, []);

 function voltar() {
  setStep(1);
}

function limparFormulario() {
  setForm({
    tipo: "",
    classificacao: "",
    forma: "",
    valor: "",
    descricao: "",
    conta: ""
  });

  setStep(1);
}

function podeAvancar() {
  if (step === 1) return !!form.tipo;
  if (step === 2) return !!form.forma;
  if (step === 3) return Number(form.valor) > 0;
  if (step === 4) return !!form.descricao?.trim();
  if (step === 5) return !!form.conta;

  return true;
}

  return (
    <div className="min-h-screen bg-[#F4F7FB] p-4 max-w-md mx-auto">

      {/* TOPO */}
      <div className="mb-6 text-center">
        <h1 className="text-lg font-bold">Novo Lançamento</h1>
        <p className="text-xs text-gray-500">Passo {step} de {totalSteps}</p>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Entrada ou Saída</h2>

           <button
            onClick={() => {
                setForm({ ...form, tipo: "entrada", classificacao: "receita" });
                next();
            }}
            className="w-full rounded-[26px] bg-white p-5 text-left shadow-sm border border-emerald-100 active:scale-95 transition"
            >
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl">
                ↑
                </div>
                <div>
                <div className="text-lg font-black text-slate-800">Entrada</div>
                <div className="text-xs text-slate-500">Receita recebida</div>
                </div>
            </div>
            </button>

            <button
            onClick={() => {
                setForm({ ...form, tipo: "saida", classificacao: "despesa" });
                next();
            }}
            className="w-full rounded-[26px] bg-white p-5 text-left shadow-sm border border-red-100 active:scale-95 transition"
            >
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-red-500 text-white flex items-center justify-center text-2xl">
                ↓
                </div>
                <div>
                <div className="text-lg font-black text-slate-800">Saída</div>
                <div className="text-xs text-slate-500">Despesa paga</div>
                </div>
            </div>
            </button>
        </div>
      )}

            {/* STEP 2 */}
            {step === 2 && (
                <div className="space-y-3">
                <h2 className="text-sm font-semibold">Forma</h2>

                {[
                    { value: "pix", label: "Pix", icon: "⚡" },
                    { value: "avista", label: "À vista", icon: "💵" },
                    { value: "cartao_debito", label: "Débito", icon: "💳" },
                    ].map((f) => (
                        <button
                        key={f}
                        onClick={() => {
                            setForm({ ...form, forma: f.value });
                            next();
                        }}
                        className="w-full py-4 rounded-2xl bg-white border font-semibold"
                        >
                        <span className="text-xl">{f.icon}</span>
                        <span>{f.label}</span>
                        </button>
                    ))}

                    <button onClick={voltar} className="text-xs text-gray-500 mt-2">
                        voltar
                    </button>
                    </div>
                )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Valor</h2>

         <input
            type="number"
            autoFocus
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            className="w-full rounded-[30px] border-0 bg-white py-6 text-center text-4xl font-black text-slate-800 shadow-sm outline-none focus:ring-4 focus:ring-purple-100"
            placeholder="0,00"
            />

           
        </div>
      )}

   

      {/* STEP 4 */}
      {step === 4 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Descrição</h2>

          <input
            type="text"
            autoFocus
            value={form.descricao}
            onChange={(e) =>
              setForm({ ...form, descricao: e.target.value })
            }
            className="w-full py-4 rounded-2xl border px-3"
            placeholder="Digite..."
          />

           
        </div> 
        
      )}
         {step === 5 && (
             <div className="space-y-2">
                <h2 className="text-xs font-semibold text-slate-500">
                    Conta financeira
                </h2>

                <select
                    value={form.conta}
                    onChange={(e) => setForm({ ...form, conta: e.target.value })}
                    className="
                    w-full rounded-2xl
                    border border-slate-200
                    bg-white
                    px-3 py-2.5
                    text-xs font-medium text-slate-600
                    shadow-sm
                    outline-none
                    focus:ring-2 focus:ring-purple-100
                    "
                >
                    <option value="">Selecione...</option>
                    {contas.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.nome}
                    </option>
                    ))}
                </select>
                </div>
            )}


{step < totalSteps ? (
  <button
    onClick={() => {
      if (!podeAvancar()) {
        alert("Preencha o campo obrigatório antes de continuar.");
        return;
      }

      next();
    }}
    className="mt-8 w-full rounded-[24px] bg-purple-600 py-3 text-sm font-bold text-white shadow-md active:scale-95 transition"
  >
    Próximo
  </button>
) : (
    <button
  onClick={salvar}
   className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white shadow-md active:scale-95 transition"
>
  Salvar
</button>
)}
    </div>
  );
}