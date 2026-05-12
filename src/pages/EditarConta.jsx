 import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildWebhookUrl } from '../config/globals.js'; // ✅ Import correto no topo
    
export default function EditarConta() {
  const navigate = useNavigate();
  const { state } = useLocation(); // recebe id e empresa_id
  const empresa_id = state.empresa_id || localStorage.getItem('id_empresa');

  const [loading, setLoading] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  const [form, setForm] = useState({
    id: "",
    empresa_id: "",
    nome: "",
    banco: "",
    tipo: "",
    saldo_inicial: "",
    nro_banco: "",
    agencia: "",
    conta: "",
    conjunta: false,
    juridica: false,
    padrao: false,
  });

 /* 🎨 Tema azul coerente com Login/KDS (fora escuro, dentro mais claro) */
const THEME = {
  pageBg: "#0e2a3a",                 // fundo da página (escuro)
  panelBg: "#1e40af",                // fundos auxiliares (se precisar) panelBg: "#4a88a9ff",   
  panelBorder: "rgba(255,159,67,0.30)",

  cardBg: "#254759",                 // bloco interno mais claro
  cardBorder: "rgba(255,159,67,0.35)",
  cardShadow: "0 6px 20px rgba(0,0,0,0.25)",

  title: "#ff9f43",
  text: "#e8eef2",
  textMuted: "#bac7cf",

  fieldBg: "#1f3b4d",                // inputs (um tom acima do card)
  fieldBorder: "rgba(255,159,67,0.25)",
  focusRing: "#ff9f43",

  btnPrimary: "#ff9f43",
  btnPrimaryText: "#1b1e25",
  btnSecondary: "#ef4444",
  btnSecondaryText: "#ffffff",
};
 

  // 🔵 1) RETRIEVE — BUSCA NO BANCO
  useEffect(() => {
    const id = state.id || state.conta_id || state.id_conta;

    if (!id) {
      alert("ID inválido");
      navigate("/saldos");
      return;
    }

    
    const buscar = async () => {
      try {
         const url = buildWebhookUrl('retrieveontafinanceira', {
                id,
                empresa_id,
              });


        const resp = await fetch(url, { method: "GET" });

        if (!resp.ok) {
          alert("Erro ao buscar dados.");
          return;
        }

         const data = await resp.json();
            const conta = data[0]; // 👈 AQUI É O PULO DO GATO

            if (!conta) {
              alert("Conta não encontrada.");
              return;
            }

            setForm({
              id: conta.id,
              empresa_id: conta.empresa_id,
              nome: conta.nome || "",
              banco: conta.banco || "",
              tipo: conta.tipo || "",
              saldo_inicial: conta.saldo_inicial || "",
              nro_banco: conta.nro_banco || "",
              agencia: conta.agencia || "",
              conta: conta.conta || "",
              conjunta: conta.conjunta || false,
              juridica: conta.juridica || false,
              padrao: conta.padrao || false,
            });

      } catch (e) {
        console.log("ERRO:", e);
        alert("Erro ao carregar conta.");
      } finally {
        setCarregandoDados(false);
      }
    };

    buscar();
  }, [state, navigate]);

  // 🔵 Atualiza estado dos inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🔵 2) UPDATE — POST PRO WEBHOOK
  const salvar = async () => {
    try {
      setLoading(true);

      const payload = {
        body: { ...form },
      };

      console.log("UPDATE ENVIADO:", payload);
 


    const resp = await fetch(buildWebhookUrl('updatecontafinanceira'), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });





      if (!resp.ok) {
        alert("Erro ao atualizar conta.");
        return;
      }

      alert("Conta atualizada com sucesso!");
      navigate(-1);

    } catch (e) {
      console.log(e);
      alert("Erro ao atualizar.");
    } finally {
      setLoading(false);
    }
  };
 

  if (carregandoDados) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-100">
      <div className="text-blue-900 font-black">Carregando dados...</div>
    </div>
  );
}

return (
   <div className="bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-100 px-4 py-5 flex justify-center">
    <div className="w-full max-w-md rounded-[30px] bg-white/95 shadow-2xl border border-white/40 overflow-hidden">

      {/* TOPO */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 px-5 py-5 text-white">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-3xl font-black text-white"
          >
            ←
          </button>

          <h1 className="text-xl font-black text-white">
            Editar Conta
          </h1>

          <div className="w-10" />
        </div>

        <p className="text-center text-blue-100 font-bold mt-4">
          Alteração de conta financeira
        </p>
      </div>

      {/* FORM */}
      <div className="p-5 space-y-4">

        <div>
          <label className="block text-sm font-black text-blue-900 mb-1">
            Nome da Conta
          </label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className="w-full rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-black text-blue-900 mb-1">
              Banco
            </label>
            <input
              name="banco"
              value={form.banco}
              onChange={handleChange}
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-blue-900 mb-1">
              Nº Banco
            </label>
            <input
              name="nro_banco"
              value={form.nro_banco}
              onChange={handleChange}
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-black text-blue-900 mb-1">
              Agência
            </label>
            <input
              name="agencia"
              value={form.agencia}
              onChange={handleChange}
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-blue-900 mb-1">
              Conta
            </label>
            <input
              name="conta"
              value={form.conta}
              onChange={handleChange}
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-black text-blue-900 mb-1">
              Tipo
            </label>
            <input
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-blue-900 mb-1">
              Saldo Inicial
            </label>
            <input
              name="saldo_inicial"
              value={form.saldo_inicial}
              onChange={handleChange}
              className="w-full rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
          <label className="flex items-center gap-3 text-blue-900 font-black">
            <input type="checkbox" name="conjunta" checked={form.conjunta} onChange={handleChange} />
            Conta conjunta
          </label>

          <label className="flex items-center gap-3 text-blue-900 font-black">
            <input type="checkbox" name="juridica" checked={form.juridica} onChange={handleChange} />
            Conta jurídica
          </label>

          <label className="flex items-center gap-3 text-blue-900 font-black">
            <input type="checkbox" name="padrao" checked={form.padrao} onChange={handleChange} />
            Conta padrão
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3">
          <button
            onClick={salvar}
            disabled={loading}
            className="rounded-2xl bg-gradient-to-br from-blue-900 to-cyan-700 text-white py-4 font-black shadow-lg disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="rounded-2xl bg-slate-200 text-slate-700 py-4 font-black"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  </div>
);
}

