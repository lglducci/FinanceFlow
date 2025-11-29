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
      navigate("/saldos");

    } catch (e) {
      console.log(e);
      alert("Erro ao atualizar.");
    } finally {
      setLoading(false);
    }
  };

  if (carregandoDados) {
    return <div className="p-6 text-gray-600">Carregando dados...</div>;
  }

  return (
     <div
      className="min-h-screen py-10 px-4"
      style={{ background: THEME.text, color: THEME.text }}
    >
      <div
        className="w-full max-w-4xl mx-auto rounded-2xl p-8 border shadow-2xl"
        style={{
          background: THEME. panelBg,            // << mais claro
          borderColor: THEME.cardBorder,
          boxShadow: THEME.cardShadow,
        }}
      > 
       
       
      <h1
        className="text-2xl md:text-3xl font-bold mb-8 text-center"
        style={{ color: THEME.title }}
      >
        ✏️ Editar Conta
      </h1>
 

      <div className="flex flex-col gap-6">
        <div> 
         <label className="block text-base font-bold mb-1">Nome da Conta</label> 
        <input name="nome" placeholder="Nome da Conta"
          className="input-base w-full h-10"
          value={form.nome}
          onChange={handleChange}
        />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div> 
        <label className="block text-base font-bold mb-1">Banco</label> 
        <input name="banco" placeholder="Banco"
            className="input-base w-64 h-10"
          value={form.banco}
          onChange={handleChange}
        />
        </div>

         <div> 
         <label className="block text-base font-bold mb-1">Número do Banco</label> 
        <input name="nro_banco" placeholder="Número do Banco"
            className="input-base w-64 h-10"
          value={form.nro_banco}
          onChange={handleChange}
        />
        </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div> 
       <label className="block text-base font-bold mb-1">Agência</label> 
        <input name="agencia" placeholder="Agência"
          className="input-base w-48 h-10"
          value={form.agencia}
          onChange={handleChange}
        />
        </div>
        <div>
         <label className="block text-base font-bold mb-1">Número Conta</label> 
        <input name="conta" placeholder="Número da Conta"
         className="input-base w-48 h-10"
          value={form.conta}
          onChange={handleChange}
        />
        </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div>
         <label className="block text-base font-bold mb-1">Tipo</label> 
        <input name="tipo" placeholder="Tipo"
            className="input-base w-48 h-10"
          value={form.tipo}
          onChange={handleChange}
        /> </div>
           <div> 
          

         <label className="block text-base font-bold mb-1">Saldo Inicial</label> 
        <input name="saldo_inicial" placeholder="Saldo inicial"
          className="input-base w-72 h-10"
          value={form.saldo_inicial}
          onChange={handleChange}
        /> </div>
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="conjunta"
            checked={form.conjunta}
            onChange={handleChange}
          />
          Conjunta
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="juridica"
            checked={form.juridica}
            onChange={handleChange}
          />
          Jurídica
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="padrao"
            checked={form.padrao}
            onChange={handleChange}
          />
          Conta padrão?
        </label>

        <button
          onClick={salvar}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </div>
    </div>
  );
}

