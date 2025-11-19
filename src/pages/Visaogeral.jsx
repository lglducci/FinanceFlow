 import React, { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";

export default function Visaogeral() {
  const hoje = new Date().toISOString().split("T")[0];

  const [dados, setDados] = useState([]);
  const [periodo, setPeriodo] = useState("mes");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [totais, setTotais] = useState({ receita: 0, despesa: 0, saldo: 0 });

  const calcularDatas = (tipo) => {
    const d = new Date();
    let ini = new Date();

    if (tipo === "mes") ini = new Date(d.getFullYear(), d.getMonth(), 1);
    else if (tipo === "15") ini.setDate(d.getDate() - 15);
    else if (tipo === "semana") ini.setDate(d.getDate() - 7);
    else if (tipo === "hoje") ini = d;
    else ini.setDate(d.getDate() - 30); // padrão últimos 30 dias

    setInicio(ini.toISOString().split("T")[0]);
    setFim(hoje);
    setPeriodo(tipo);
  };

  const carregar = async () => {
    try {
      const url = buildWebhookUrl("consultasaldo", { inicio, fim });
      const resp = await fetch(url);
      if (!resp.ok) {
        console.error("Erro status:", resp.status);
        return;
      }
      const data = await resp.json();

      // Cálculo do saldo final de cada conta
      const calculado = data.map((c) => {
        const receita = Number(c.entradas_periodo || 0);
        const despesa = Number(c.saídas_periodo || 0);
        const saldoInicial = Number(c.saldo_inicial || 0);
        const saldoFinal = saldoInicial + receita - despesa;

        return {
          banco: c.conta_nome || "Sem Banco",
          saldo_inicial: saldoInicial,
          receita,
          despesa,
          saldo_final: saldoFinal,
        };
      });

      setDados(calculado);

      // Total geral
      const tot = calculado.reduce(
        (acc, c) => ({
          receita: acc.receita + c.receita,
          despesa: acc.despesa + c.despesa,
          saldo: acc.saldo + c.saldo_final,
        }),
        { receita: 0, despesa: 0, saldo: 0 }
      );
      setTotais(tot);
    } catch (e) {
      console.error("Erro fetch:", e);
    }
  };

  useEffect(() => {
    calcularDatas(periodo);
  }, []);

  useEffect(() => {
    if (inicio && fim) carregar();
  }, [inicio, fim]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Visão Geral</h2>

      {/* FILTROS */}
      <div className="mb-4 flex gap-4 items-center">
        {["mes", "15", "semana", "hoje"].map((p) => (
          <button
            key={p}
            onClick={() => calcularDatas(p)}
            className={`px-4 py-2 rounded font-semibold ${
              periodo === p ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {p === "mes"
              ? "Mês"
              : p === "15"
              ? "Últimos 15 dias"
              : p === "semana"
              ? "Semana"
              : "Hoje"}
          </button>
        ))}
      </div>

      {/* TABELA */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-200 font-bold">
            <th className="p-2 text-left border">Banco</th>
            <th className="p-2 text-right border text-blue-700">Saldo Inicial</th>
            <th className="p-2 text-right border text-green-700">Receita</th>
            <th className="p-2 text-right border text-red-600">Despesa</th>
            <th className="p-2 text-right border text-blue-700">Saldo Final</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((c, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
              <td className="p-2">{c.banco}</td>
              <td className="p-2 text-right text-blue-700">
                {c.saldo_inicial.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </td>
              <td className="p-2 text-right text-green-700">
                {c.receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </td>
              <td className="p-2 text-right text-red-600">
                {c.despesa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </td>
              <td className="p-2 text-right text-blue-700 font-bold">
                {c.saldo_final.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </td>
            </tr>
          ))}

          {/* TOTAL GERAL */}
          <tr className="bg-gray-300 font-bold">
            <td className="p-2">Total Geral</td>
            <td className="p-2 text-right text-blue-700">-</td>
            <td className="p-2 text-right text-green-700">
              {totais.receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </td>
            <td className="p-2 text-right text-red-600">
              {totais.despesa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </td>
            <td className="p-2 text-right text-blue-700 font-bold">
              {totais.saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
