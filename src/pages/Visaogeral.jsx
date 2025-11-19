 import React, { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";

export default function Visaogeral() {
  const hoje = new Date().toISOString().split("T")[0];

  const [dados, setDados] = useState([]);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [totalReceita, setTotalReceita] = useState(0);
  const [totalDespesa, setTotalDespesa] = useState(0);
  const [totalSaldo, setTotalSaldo] = useState(0);

  const carregar = async () => {
    try {
      // caso período vazio, pega últimos 30 dias
      const ini = inicio || new Date(new Date().setDate(new Date().getDate() - 30))
        .toISOString()
        .split("T")[0];
      const fimData = fim || hoje;

      const url = buildWebhookUrl("consultasaldo", { inicio: ini, fim: fimData });

      const resp = await fetch(url);
      if (!resp.ok) {
        console.error("Erro status:", resp.status);
        return;
      }
      const data = await resp.json();
      setDados(data);

      // soma totais
      let receita = 0,
        despesa = 0,
        saldo = 0;
      data.forEach((c) => {
        receita += Number(c.entradas_periodo || 0);
        despesa += Number(c.saídas_periodo || 0);
        saldo += Number(c.saldo_final || 0);
      });
      setTotalReceita(receita);
      setTotalDespesa(despesa);
      setTotalSaldo(saldo);
    } catch (e) {
      console.error("Erro fetch:", e);
    }
  };

  useEffect(() => {
    setPeriodo("mes");
    selecionarPeriodo("mes");
  }, []);

  const selecionarPeriodo = (tipo) => {
    setPeriodo(tipo);
    const d = new Date();
    let ini, fimData;

    fimData = hoje;

    if (tipo === "mes") {
      ini = new Date(d.getFullYear(), d.getMonth(), 1);
    } else if (tipo === "15") {
      ini = new Date();
      ini.setDate(d.getDate() - 15);
    } else if (tipo === "semana") {
      ini = new Date();
      ini.setDate(d.getDate() - 7);
    } else if (tipo === "hoje") {
      ini = d;
    } else {
      ini = new Date(d.getFullYear(), d.getMonth(), 1);
    }

    setInicio(ini.toISOString().split("T")[0]);
    setFim(fimData);

    // carrega dados com novo período
    setTimeout(() => carregar(), 50);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Visão Geral</h2>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded shadow mb-6 border border-blue-300 flex flex-col gap-4">
        <div className="flex gap-6 items-center">
          <span className="font-semibold text-gray-700">Período:</span>
          <label>
            <input
              type="checkbox"
              checked={periodo === "mes"}
              onChange={() => selecionarPeriodo("mes")}
              className="mr-1"
            />
            Mês
          </label>
          <label>
            <input
              type="checkbox"
              checked={periodo === "15"}
              onChange={() => selecionarPeriodo("15")}
              className="mr-1"
            />
            Últimos 15 dias
          </label>
          <label>
            <input
              type="checkbox"
              checked={periodo === "semana"}
              onChange={() => selecionarPeriodo("semana")}
              className="mr-1"
            />
            Semana
          </label>
          <label>
            <input
              type="checkbox"
              checked={periodo === "hoje"}
              onChange={() => selecionarPeriodo("hoje")}
              className="mr-1"
            />
            Hoje
          </label>
        </div>
      </div>

      {/* TABELA */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-200 font-bold">
            <th className="p-2 text-left border">Banco</th>
            <th className="p-2 text-right border text-green-700">Receita</th>
            <th className="p-2 text-right border text-red-600">Despesa</th>
            <th className="p-2 text-right border text-blue-700">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((c, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
              <td className="p-2">{c.conta_nome}</td>
              <td className="p-2 text-right text-green-700">
                {Number(c.entradas_periodo || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </td>
              <td className="p-2 text-right text-red-600">
                {Number(c.saídas_periodo || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </td>
              <td className="p-2 text-right text-blue-700 font-bold">
                {Number(c.saldo_final || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </td>
            </tr>
          ))}

          {/* TOTAL GERAL */}
          <tr className="bg-gray-300 font-bold">
            <td className="p-2">Total</td>
            <td className="p-2 text-right text-green-700">
              {totalReceita.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </td>
            <td className="p-2 text-right text-red-600">
              {totalDespesa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </td>
            <td className="p-2 text-right text-blue-700">
              {totalSaldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
