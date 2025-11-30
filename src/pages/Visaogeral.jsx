 import React, { useEffect, useState } from "react";
import { buildWebhookUrl } from '../config/globals.js'; // import corrigido

export default function Visaogeral() {
  const hoje = new Date().toISOString().split("T")[0];

  const [dados, setDados] = useState([]);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [periodo, setPeriodo] = useState("mes");
  const [totais, setTotais] = useState({ receita: 0, despesa: 0, saldo: 0 });
  const empresa_id = localStorage.getItem("id_empresa");


  const calcularDatas = (tipo) => {
    const d = new Date();
    let ini = new Date();

    if (tipo === "mes") ini = new Date(d.getFullYear(), d.getMonth(), 1);
    else if (tipo === "15") ini.setDate(d.getDate() - 15);
    else if (tipo === "semana") ini.setDate(d.getDate() - 7);
    else if (tipo === "hoje") ini = d;
    else ini.setDate(d.getDate() - 30);

    setInicio(ini.toISOString().split("T")[0]);
    setFim(hoje);
    setPeriodo(tipo);
  };

   const carregar = async () => {
  try {
    const ini = inicio || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0];
    const fimData = fim || hoje;
    const empresa_id = localStorage.getItem("id_empresa"); // ✅ PEGOU DA MEMÓRIA

    const url = buildWebhookUrl("consultasaldo", {
      inicio: ini,
      fim: fimData,
      empresa_id, // ✅ AGORA VAI
    });

    const resp = await fetch(url);
    if (!resp.ok) {
      console.error("Erro status:", resp.status);
      return;
    }

    const data = await resp.json();

    const calculado = data.map((c) => {
      const saldoInicial = Number(c.saldo_inicial || 0);
      const receita = Number(c.entradas_periodo || 0);
      const despesa = Number(c.saídas_periodo || 0);
      const saldoFinal = saldoInicial + receita - despesa;

      return {
        banco: c.conta_nome,
        saldo_inicial: saldoInicial,
        receita,
        despesa,
        saldo_final: saldoFinal,
      };
    });

    setDados(calculado);

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
    <div className="p-2">
      <h2 className="text-3xl font-bold mb-4 text-blue-500">Visão Geral</h2>
 
{/* FILTROS */}
{/*<div className="bg- blue p-6 rounded-xl shadow mb-10 flex flex-col gap-2">*/}

  
         <div className="bg-gray-100 rounded-xl shadow p-5  border-[12px] border-blue-800 mb-10 w-[1850px] flex items-center"> 
 

  <div className="bg-gray-100 p-6 rounded-xl shadow mb-8 flex flex-col gap-2"> 
 
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
    
    <div className="flex flex-col">
      
      <span className="text-base font-bold mb-1 text-[#1e40af]">Períodos</span>
      <div className="flex gap-4 text-base flex-wrap">
        {["mes", "15", "semana", "hoje"].map((tipo) => (
          <button
            key={tipo}
            onClick={() => calcularDatas(tipo)}
            className={`px-4 py-1.5 rounded font-semibold ${
              periodo === tipo
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {tipo === "mes"
              ? "Mês"
              : tipo === "15"
              ? "Últimos 15 dias"
              : tipo === "semana"
              ? "Semana"
              : "Hoje"}
          </button>
        ))}
      </div>
    </div>
  </div>
</div>
</div>



      {/* Tabela  
  
   <table className="w-full text-sm border-collapse">*/}

  <div className="bg-gray-300 p-4 rounded-xl shadow">
  <table className="w-full text-base border-collapse">
  <thead>
    <tr className="bg-blue-300 font-black text-lg">
      <th className="p-2 text-left border">Banco</th>
      <th className="p-2 text-right border text-blue-800">Saldo Inicial</th>
      <th className="p-2 text-right border text-green-900">Receita</th>
      <th className="p-2 text-right border text-red-700">Despesa</th>
      <th className="p-2 text-right border text-blue-700">Saldo Final</th>
    </tr>
  </thead>

  <tbody>
    {dados.map((c, i) => (
      <tr
        key={i}
        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
      >
        <td className="p-2 font-bold">{c.banco}</td>

        <td className="p-2 text-right text-blue-800 font-bold">
          {c.saldo_inicial.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </td>

        <td className="p-2 text-right text-green-800 font-bold">
          {c.receita.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </td>

        <td className="p-2 text-right text-red-700 font-bold">
          {c.despesa.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </td>

        <td className="p-2 text-right text-blue-800 font-bold">
          {c.saldo_final.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </td>
      </tr>
    ))}
  </tbody>

  <tfoot>
    <tr className="bg-blue-300 font-black text-lg">
      <td className="p-2">Total Geral</td>

      <td className="p-2 text-right text-blue-700">-</td>

      <td className="p-2 text-right text-green-700">
        {totais.receita.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </td>

      <td className="p-2 text-right text-red-600">
        {totais.despesa.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </td>

      <td className="p-2 text-right text-blue-700 font-bold">
        {totais.saldo.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </td>
    </tr>
  </tfoot>
</table>
</div>
 
    </div>
  );
}
