import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from '../config/globals';

export default function Visaogeral() {
  const navigate = useNavigate();
  const [dados, setDados] = useState([]);
  const [totalReceita, setTotalReceita] = useState(0);
  const [totalDespesa, setTotalDespesa] = useState(0);

  const carregar = async () => {
    try {
      const url = buildWebhookUrl('consultasaldo'); // sem periodo
      const resp = await fetch(url);
      if (!resp.ok) return console.log("Erro status:", resp.status);
      const data = await resp.json();

      // Agrupar por banco
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

      // Total geral
      let totRec = 0, totDesp = 0;
      lista.forEach(l => { totRec += l.receita; totDesp += l.despesa; });

      setTotalReceita(totRec);
      setTotalDespesa(totDesp);
      setDados(lista);
    } catch (e) {
      console.log("Erro fetch:", e);
    }
  };

  useEffect(() => { carregar(); }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Visão Geral</h2>

      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="text-left py-2 px-2">Banco</th>
              <th className="text-right py-2 px-2">Receita</th>
              <th className="text-right py-2 px-2">Despesa</th>
              <th className="text-right py-2 px-2">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((l, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                <td className="py-2 px-2">{l.banco}</td>
                <td className="py-2 px-2 text-right">R$ {l.receita.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
                <td className="py-2 px-2 text-right">R$ {l.despesa.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
                <td className="py-2 px-2 text-right font-bold">R$ {l.saldo.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-semibold bg-gray-200">
              <td className="py-2 px-2">Total</td>
              <td className="py-2 px-2 text-right">R$ {totalReceita.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
              <td className="py-2 px-2 text-right">R$ {totalDespesa.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
              <td className="py-2 px-2 text-right">-</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
