import React, { useState } from "react";
import { buildWebhookUrl } from "../../config/globals";

export default function FormConta({
  empresa_id,
  onSuccess,
  onCancel
}) {

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    empresa_id: empresa_id,
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
    conta_contabil: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const salvar = async () => {


    const saldoNumerico = Number(
  form.saldo_inicial
    .replace(/\./g, "")
    .replace(",", ".")
);

    if (!form.nome.trim()) {
      alert("Nome obrigatório");
      return;
    }

    if (!form.conta_contabil.startsWith("1.1.1.")) {
  alert("Conta financeira deve estar no grupo 1.1.1 (Disponibilidades). Ex: 1.1.1.01");
  return;
}


    try {
      setLoading(true);

      const resp = await fetch( 
        
        buildWebhookUrl("novacontafinanceira"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: {
              ...form,
              saldo_inicial: saldoNumerico
            }
          })
        }
      );

      const data = await resp.json();

      if (!resp.ok) {
        alert("Erro ao salvar conta");
        return;
      }

      const nova = Array.isArray(data) ? data[0] : data;

      if (onSuccess) {
           
       alert("⚠ Conta criada com cadastro mínimo.");
        onSuccess(nova);
      }

    } catch (err) {
      console.error(err);
      alert("Erro ao salvar conta");
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
  const somenteNumeros = valor.replace(/\D/g, "");
  const numero = (Number(somenteNumeros) / 100).toFixed(2);
  return numero
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const handleSaldoChange = (e) => {
  const formatado = formatarMoeda(e.target.value);
  setForm(prev => ({
    ...prev,
    saldo_inicial: formatado
  }));
};

const regexConta = /^[1-9]\d*(\.[0-9]{1,3}){2,}$/;

  return (
    <div className="flex flex-col gap-4">

      <input
        name="nome"
        placeholder="Nome da Conta"
        className="input-premium"
        value={form.nome}
        onChange={handleChange}
      />

      <input
        name="banco"
        placeholder="Banco"
        className="input-premium"
        value={form.banco}
        onChange={handleChange}
      />

      <select
        name="tipo"
        value={form.tipo}
        onChange={handleChange}
        className="input-premium"
      >
        <option value="">Tipo</option>
        <option value="corrente">Corrente</option>
        <option value="poupanca">Poupança</option>
        <option value="caixa">Caixa</option>
      </select>

     <input
        name="saldo_inicial"
        placeholder="Saldo Inicial"
        className="input-premium"
        value={form.saldo_inicial}
        onChange={handleSaldoChange}
      />

          <div>
            <label className="font-bold text-[#1e40af] flex items-center gap-2">
              Conta Contábil *
              
              <span className="relative group cursor-pointer">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                  ?
                </span>

                <div className="absolute left-6 top-0 z-50 hidden group-hover:block 
                                bg-gray-900 text-white text-xs rounded-lg p-3 w-80 shadow-lg">

                  <strong>Padrão da Conta Contábil</strong>

                  <p className="mt-1">
                    Utilize o formato numérico separado por ponto.
                  </p>

                  <p className="mt-1 text-yellow-300">
                    Exemplo válido: <b>1.1.1</b> ou <b>1.1.1.23</b>
                  </p>

                  <p className="mt-1">
                    • Deve conter no mínimo 3 níveis<br/>
                    • Apenas números<br/>
                    • Separados por ponto
                  </p>

                  <p className="mt-1 text-red-400">
                    Exemplo inválido: 1.111.12.2.33
                  </p>

                </div>
              </span>
            </label>

            <input
              name="conta_contabil"
              placeholder="Ex: (1.1.1.23)"
              className="input-premium"
              value={form.conta_contabil}
              onChange={(e) => {
                const valor = e.target.value.replace(/[^0-9.]/g, "");
                setForm(prev => ({
                  ...prev,
                  conta_contabil: valor
                }));
              }}
            />
          </div>

           


      <div className="flex gap-4 pt-4">
        <button
          onClick={salvar}
          disabled={loading}
          className="flex-1 bg-[#061f4aff] text-white px-4 py-2 rounded-lg"
        >
          {loading ? "Salvando..." : "Salvar Conta"}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            Cancelar
          </button>
        )}
      </div>

    </div>
  );
}
