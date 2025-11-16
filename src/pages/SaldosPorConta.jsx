import React, { useEffect, useState } from "react";

export default function SaldosPorConta() {
  const [dados, setDados] = useState([]);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const carregar = async () => {
    const resp = await fetch("https://n8n.lglducci.com.br/webhook-test/consultasaldo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: 1,
        data_ini: inicio,
        data_fim: fim
      })
    });

    const data = await resp.json();
    setDados(data);
  };

  useEffect(() => {
    carregar(); // carrega mês atual ao abrir
  }, []);

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-4">Saldos por Conta</h2>

      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} className="border p-2 rounded" />
        <input type="date" value={fim} onChange={e => setFim(e.target.value)} className="border p-2 rounded" />
        <button onClick={carregar} className="bg-blue-600 text-white px-4 py-2 rounded">
          Pesquisar
        </button>
      </div>

      {/* Lista dinâmica */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {dados.map((c, idx) => (
          <div key={idx} className="border rounded p-4 shadow">

            <h3 className="text-lg font-semibold">{c.conta_nome}</h3>

            <p className="text-sm text-gray-600">Banco: {c.nro_banco ?? "-"}</p>
            <p className="text-sm text-gray-600">Agência: {c.agencia ?? "-"}</p>
            <p className="text-sm text-gray-600">Conta: {c.conta ?? "-"}</p>
            <p className="text-sm text-gray-600">Conjunta: {c.conjunta ? "Sim" : "Não"}</p>
            <p className="text-sm text-gray-600">Jurídica: {c.juridica ? "Sim" : "Não"}</p>

            <hr className="my-2" />

            <p><strong>Saldo inicial:</strong> R$ {c.saldo_inicial}</p>
            <p><strong>Entradas:</strong> R$ {c.entradas_periodo}</p>
            <p><strong>Saídas:</strong> R$ {c.saídas_periodo}</p>
            <p className="text-blue-700 font-bold text-lg mt-2">
              Saldo final: R$ {c.saldo_final}
            </p>

          </div>
        ))}

      </div>
    </div>
  );
}
