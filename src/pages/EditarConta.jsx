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
              icone_url:conta.icone_url
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

 

const labelCls = "block text-sm font-semibold text-slate-700 mb-1";
const inputCls =
  "w-full h-11 rounded-xl border border-cyan-100 bg-white px-3 text-slate-800 font-semibold shadow-[0_2px_8px_rgba(15,23,42,0.10)] focus:outline-none focus:ring-2 focus:ring-cyan-200";

  
  const fieldCls =
    "w-full px-3 py-2 rounded-xl focus:outline-none transition-shadow";
  const fieldStyle = {
    background: THEME.fieldBg,
    color: THEME.text,
    border: `1px solid ${THEME.fieldBorder}`,
    boxShadow: "none",
  };
  const fieldFocus = { boxShadow: `0 0 0 2px ${THEME.focusRing}55` };

return (
    <div className="min-h-screen bg-gradient-to-br from-slate-150 via-blue-150 to-slate-100 px-3 py-4 flex items-start justify-center">
     <div className="w-full max-w-[620px] rounded-2xl bg-white shadow-2xl border border-slate-300 overflow-hidden">

       {/* TOPO */}
      <div className="bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-600 px-5 py-5 text-white">

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

         
      </div>

      {/* FORM */}
      <div className="p-5 space-y-4">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-4">
                {form.icone_url && (
                  <img
                    src={form.icone_url}
                    alt={form.banco}
                    className="w-14 h-14 object-contain"
                  />
                )}

                <div>
                  <div className="font-black text-slate-800 text-lg">
                    {form.banco}
                  </div>

                  <div className="text-sm text-slate-500 font-semi-bold">
                    Código: {form.nro_banco}
                  </div>
                </div>
              </div>




        <div>
          <label  className={labelCls}>
            Nome da Conta
          </label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
               <label  className={labelCls}>
              Banco
            </label>
            <input
              name="banco"
              value={form.banco}
              onChange={handleChange}
              className={inputCls}
            />
          </div>

          <div>
              <label  className={labelCls}>
              Nº Banco
            </label>
            <input
              name="nro_banco"
              value={form.nro_banco}
              onChange={handleChange}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
               <label  className={labelCls}>
              Agência
            </label>
            <input
              name="agencia"
              value={form.agencia}
              onChange={handleChange}
              className={inputCls}
            />
          </div>

          <div>
               <label  className={labelCls}>
              Conta
            </label>
            <input
              name="conta"
              value={form.conta}
              onChange={handleChange}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
               <label  className={labelCls}>
              Tipo
            </label>
            <input
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className={inputCls}
            />
          </div>

          <div>
               <label  className={labelCls}>
              Saldo Inicial
            </label>
            <input
              name="saldo_inicial"
              value={form.saldo_inicial}
              onChange={handleChange}
             className={inputCls}
            />
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
            <label  className={labelCls}>
            <input type="checkbox" name="conjunta" checked={form.conjunta} onChange={handleChange} />
            Conta conjunta
          </label>

              <label  className={labelCls}>
            <input type="checkbox" name="juridica" checked={form.juridica} onChange={handleChange} />
            Conta jurídica
          </label>

             <label  className={labelCls}>
            <input type="checkbox" name="padrao" checked={form.padrao} onChange={handleChange} />
            Conta padrão
          </label>
        </div>

        
          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
           <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl bg-cyan-50 border border-cyan-200 text-slate-700 font-bold shadow-sm hover:bg-cyan-100"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={salvar}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#062b49] text-white font-black shadow-sm hover:brightness-110"
          >
            💾 {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  </div>
);
}

