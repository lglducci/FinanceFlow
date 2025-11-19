 import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function EditarConta() {
  const navigate = useNavigate();
  const { state } = useLocation(); // recebe id e empresa_id

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
        
            import { buildWebhookUrl } from '../config/globals';
           
           const url = buildWebhookUrl('retrieveontafinanceira', {
             id,
             empresa_id: localStorage.getItem('id_empresa'),
           });

       
             const resp = await fetch(url, { method: "GET" });


        if (!resp.ok) {
          alert("Erro ao buscar dados.");
          return;
        }

        const data = await resp.json();

        setForm({
          id: data.id,
          empresa_id: data.empresa_id,
          nome: data.nome,
          banco: data.banco,
          tipo: data.tipo,
          saldo_inicial: data.saldo_inicial,
          nro_banco: data.nro_banco,
          agencia: data.agencia,
          conta: data.conta,
          conjunta: data.conjunta,
          juridica: data.juridica,
          padrao: data.padrao,
        });
      } catch (e) {
        console.log("ERRO:", e);
        alert("Erro ao carregar conta.");
      } finally {
        setCarregandoDados(false);
      }
    };

    buscar();
  }, []);

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
        body: {
          id: form.id,
          empresa_id: form.empresa_id,
          nome: form.nome,
          banco: form.banco,
          tipo: form.tipo,
          saldo_inicial: form.saldo_inicial,
          nro_banco: form.nro_banco,
          agencia: form.agencia,
          conta: form.conta,
          conjunta: form.conjunta,
          juridica: form.juridica,
          padrao: form.padrao,
        },
      };

      console.log("UPDATE ENVIADO:", payload);

      const resp = await fetch(
        "https://webhook.lglducci.com.br/webhook/updatecontafinanceira",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

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
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Editar Conta</h2>

      <div className="flex flex-col gap-4">

        <input name="nome" placeholder="Nome da Conta"
          className="border p-2 rounded"
          value={form.nome}
          onChange={handleChange}
        />

        <input name="banco" placeholder="Banco"
          className="border p-2 rounded"
          value={form.banco}
          onChange={handleChange}
        />

        <input name="tipo" placeholder="Tipo"
          className="border p-2 rounded"
          value={form.tipo}
          onChange={handleChange}
        />

        <input name="saldo_inicial" placeholder="Saldo inicial"
          className="border p-2 rounded"
          value={form.saldo_inicial}
          onChange={handleChange}
        />

        <input name="nro_banco" placeholder="Número do Banco"
          className="border p-2 rounded"
          value={form.nro_banco}
          onChange={handleChange}
        />

        <input name="agencia" placeholder="Agência"
          className="border p-2 rounded"
          value={form.agencia}
          onChange={handleChange}
        />

        <input name="conta" placeholder="Número da Conta"
          className="border p-2 rounded"
          value={form.conta}
          onChange={handleChange}
        />

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
  );
}

