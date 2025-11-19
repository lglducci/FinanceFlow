 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from '../config/globals';

export default function SaldosPorConta() {

  const navigate = useNavigate();
  const hoje = new Date().toISOString().split("T")[0];

  const [dados, setDados] = useState([]);
  const [inicio, setInicio] = useState(hoje);
  const [fim, setFim] = useState(hoje);
  const [periodo, setPeriodo] = useState("");

  const carregar = async () => {
    try {
      
     const url = buildWebhookUrl('consultasaldo', { inicio, fim });
 
     const resp = await fetch(url, { method: "GET" });

      if (!resp.ok) {
        console.log("ERRO STATUS:", resp.status);
        return;
      }

      const data = await resp.json();
      setDados(data);

    } catch (e) {
      console.log("ERRO FETCH:", e);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const selecionarPeriodo = (tipo) => {
    setPeriodo(tipo);

    const d = new Date();

    if (tipo === "mes") {
      const ano = d.getFullYear();
      const mes = String(d.getMonth() + 1).padStart(2, "0");
      setInicio(`${ano}-${mes}-01`);
      setFim(hoje);
    }

    if (tipo === "15") {
      const fimData = hoje;
      const inicioData = new Date();
      inicioData.setDate(inicioData.getDate() - 15);
      setInicio(inicioData.toISOString().split("T")[0]);
      setFim(fimData);
    }

    if (tipo === "semana") {
      const fimData = hoje;
      const inicioData = new Date();
      inicioData.setDate(inicioData.getDate() - 7);
      setInicio(inicioData.toISOString().split("T")[0]);
      setFim(fimData);
    }

    if (tipo === "hoje") {
      setInicio(hoje);
      setFim(hoje);
    }
  };

  const editarConta = (conta) => {
      navigate(`/editar-conta`, { state: conta });
    };



 

  // 🚀 ABRIR NOVA CONTA
  const novaConta = () => {
    navigate("/nova-conta");
  };


  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-4">Saldos por Conta</h2>

      <div className="bg-white p-4 rounded shadow mb-6 border border-blue-300">

        <p className="font-semibold text-gray-700 mb-2">Períodos</p>

        <div className="flex gap-6 mb-4">

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={periodo === "mes"} onChange={() => selecionarPeriodo("mes")} />
            Mês
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={periodo === "15"} onChange={() => selecionarPeriodo("15")} />
            Últimos 15 dias
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={periodo === "semana"} onChange={() => selecionarPeriodo("semana")} />
            Semana
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={periodo === "hoje"} onChange={() => selecionarPeriodo("hoje")} />
            Hoje
          </label>

        </div>

        <div className="flex gap-4">

          <div className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Data início</span>
            <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} className="border p-2 rounded w-44" />
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Data fim</span>
            <input type="date" value={fim} onChange={e => setFim(e.target.value)} className="border p-2 rounded w-44" />
          </div>

          <button onClick={carregar} className="bg-blue-600 text-white px-4 py-2 rounded h-10 mt-5">
            Pesquisar
          </button>

          {/* 🚀 NOVO — BOTÃO NOVA CONTA */}
          <button onClick={novaConta} className="bg-blue-600 text-white px-4 py-2 rounded h-10 mt-5">
            Nova Conta
          </button>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dados.map((c, idx) => (
          <div key={idx} className="border border-blue-300 bg-white rounded-lg p-4 shadow-md shadow-blue-100 hover:shadow-blue-200 transition-all">

            <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-blue-700">{c.conta_nome}</h3>
              
             
             <button onClick={() => editarConta(c)}>
               Editar Conta
             </button>

                          
            
            </div>

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



