 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from '../config/globals';

export default function Visaogeral() {
  const navigate = useNavigate();
  const [dados, setDados] = useState([]);
  const [totalReceita, setTotalReceita] = useState(0);
  const [totalDespesa, setTotalDespesa] = useState(0);
  const [periodo, setPeriodo] = useState("30"); // padrão 30 dias
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

 const [totalGeral, setTotalGeral] = useState(0);


  const calcularDatas = (tipo) => {
    const hoje = new Date();
    let ini = new Date();
    if (tipo === "mes") ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    else if (tipo === "15") ini.setDate(hoje.getDate() - 15);
    else if (tipo === "semana") ini.setDate(hoje.getDate() - 7);
    else if (tipo === "hoje") ini = hoje;
    else ini.setDate(hoje.getDate() - 30); // padrão últimos 30 dias

    setInicio(ini.toISOString().split("T")[0]);
    setFim(hoje.toISOString().split("T")[0]);
  };

  const carregar = async () => {
    try {
      const url = buildWebhookUrl('consultasaldo', { inicio, fim });
      const resp = await fetch(url);
      if (!resp.ok) return console.log("Erro status:", resp.status);
      const data = await resp.json();

      const agrupado = {};
      data.forEach((c) => {
        const banco = c.conta_nome || "Sem Banco";
        if (!agrupado[banco]) agrupado[banco] = { receita: 0, despesa: 0, saldo: 0 };
        agrupado[banco].receita += Number(c.entradas_periodo || 0);
        agrupado[banco].despesa += Number(c.saídas_periodo || 0);
        agrupado[banco].saldo += Number(c.saldo_final || 0);
      });

      const lista = Object.entries(agrupado).map(([banco, valores]) => ({
        banco,
        ...valores
      }));
        // Depois de setar os dados recebidos
            useEffect(() => {
              if (dados.length > 0) {
                const total = dados.reduce((acc, c) => {
                  const saldo = Number(c.saldo_final || 0);
                  return acc + saldo;
                }, 0);
                setTotalGeral(total);
              }
            }, [dados]);


      let totRec = 0, totDesp = 0;
      lista.forEach(l => { totRec += l.receita; totDesp += l.despesa; });

      setTotalReceita(totRec);
      setTotalDespesa(totDesp);
      setDados(lista);
      // Depois de setar os dados recebidos
            useEffect(() => {
              if (dados.length > 0) {
                const total = dados.reduce((acc, c) => {
                  const saldo = Number(c.saldo_final || 0);
                  return acc + saldo;
                }, 0);
                setTotalGeral(total);
              }
            }, [dados]);

    } catch (e) {
      console.log("Erro fetch:", e);
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

      <div className="mb-4 flex gap-4">
        {["mes","15","semana","hoje"].map((p) => (
          <button
            key={p}
            onClick={() => { setPeriodo(p); calcularDatas(p); }}
            className={`px-4 py-2 rounded font-semibold ${periodo===p?"bg-blue-600 text-white":"bg-gray-200 text-gray-700"}`}
          >
            {p==="mes"?"Mês":p==="15"?"Últimos 15 dias":p==="semana"?"Semana":"Hoje"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="text-left py-2 px-2">Banco</th>
              <th className="text-right py-2 px-2 text-green-600">Receita</th>
              <th className="text-right py-2 px-2 text-red-600">Despesa</th>
              <th className="text-right py-2 px-2 text-blue-700">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((l, i) => (
              <tr key={i} className={i%2===0?"bg-white":"bg-gray-100"}>
                <td className="py-2 px-2">{l.banco}</td>
                <td className="py-2 px-2 text-right text-green-600">R$ {l.receita.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
                <td className="py-2 px-2 text-right text-red-600">R$ {l.despesa.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
                <td className="py-2 px-2 text-right font-bold text-blue-700">R$ {l.saldo.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-semibold bg-gray-200">
              <td className="py-2 px-2">Total</td>
              <td className="py-2 px-2 text-right text-green-600">R$ {totalReceita.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
              <td className="py-2 px-2 text-right text-red-600">R$ {totalDespesa.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
              <td className="py-2 px-2 text-right text-blue-700 font-bold">-</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
