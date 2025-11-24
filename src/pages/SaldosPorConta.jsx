 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function SaldosPorConta() {
  const navigate = useNavigate();
  const hoje = new Date().toISOString().split("T")[0];

  const [dados, setDados] = useState([]);
  const [inicio, setInicio] = useState(hoje);
  const [fim, setFim] = useState(hoje);
  const [periodo, setPeriodo] = useState("");

   const carregar = async () => {
  try {
    const empresa_id = localStorage.getItem("id_empresa"); // 🔵 PEGOU!

    const url = buildWebhookUrl("consultasaldo", { 
      inicio, 
      fim, 
      empresa_id ,
      conta_id:0,
    });

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
  const empresa_id = localStorage.getItem('id_empresa'); // ou outro contexto válido

  navigate('/editar-conta', {
    state: {
      ...conta,
      id: conta.id ?? conta.conta_id ?? conta.id_conta,
      empresa_id: conta.empresa_id ?? empresa_id,
    }
  });
};






  const novaConta = () => {
    navigate("/nova-conta");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Saldos por Conta</h2>

      <div className="bg-white p-4 rounded shadow mb-6 border border-blue-300">
        <p className="font-semibold text-gray-700 mb-2">Períodos</p>
        <div className="flex gap-6 mb-4">
          {["mes", "15", "semana", "hoje"].map((tipo) => (
            <label key={tipo} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={periodo === tipo}
                onChange={() => selecionarPeriodo(tipo)}
              />
              {tipo === "15" ? "Últimos 15 dias" : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </label>
          ))}
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Data início</span>
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="border p-2 rounded w-44"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Data fim</span>
            <input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className="border p-2 rounded w-44"
            />
          </div>

          <button onClick={carregar} className="bg-blue-600 text-white px-4 py-2 rounded h-10 mt-5">
            Pesquisar
          </button>

          <button onClick={novaConta} className="bg-green-600 text-white px-4 py-2 rounded h-10 mt-5">
            Nova Conta
          </button>
        </div>
      </div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

  {dados.map((c, idx) => {
    const saldoFinal = Number(c.saldo_final);
    const positivo = saldoFinal >= 0;

    return (
      <div
        key={idx}
        className={`bg-white rounded-xl shadow-lg p-5 border-l-8 
          ${positivo ? "border-green-600" : "border-red-600"} 
          transition-all hover:shadow-xl`}
      >

        {/* Título + Editar */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2">
            🏦 {c.conta_nome}
          </h3>

          <button
            onClick={() => editarConta(c)}
            className="text-blue-600 underline hover:text-blue-800"
          >
            Editar
          </button>
        </div>

        {/* Dados bancários */}
        <div className="text-sm text-gray-600 mb-3">
          <p><strong>Banco:</strong> {c.nro_banco ?? "-"}</p>
          <p><strong>Agência:</strong> {c.agencia ?? "-"}</p>
          <p><strong>Conta:</strong> {c.conta ?? "-"}</p>
          <p><strong>Conjunta:</strong> {c.conjunta ? "Sim" : "Não"}</p>
          <p><strong>Jurídica:</strong> {c.juridica ? "Sim" : "Não"}</p>
        </div>

        <div className="border-t my-3"></div>

        {/* Indicadores financeiros */}
        <div className="space-y-1 text-base">

          <p>
            <span className="font-semibold text-gray-700">Saldo inicial: </span>
            R$ {c.saldo_inicial}
          </p>

          <p className="text-green-700 font-semibold">
            Entradas: R$ {c.entradas_periodo}
          </p>

          <p className="text-red-600 font-semibold">
            Saídas: R$ {c.saídas_periodo}
          </p>

          <p className={`text-lg font-bold mt-2 
            ${positivo ? "text-green-700" : "text-red-700"}`}>
            Saldo final: R$ {c.saldo_final}
          </p>
        </div>

      </div>
    );
  })}

</div>



            
    </div>
  );
}
