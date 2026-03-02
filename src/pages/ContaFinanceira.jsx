 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal, dataLocal } from "../utils/dataLocal";


export default function ContaFinanceira() {
  const navigate = useNavigate();
  //const hoje = new Date().toISOString().split("T")[0];
  const hoje = hojeLocal();

  const [dados, setDados] = useState([]);
  const [inicio, setInicio] = useState(hoje);
  const [fim, setFim] = useState(hoje);
  const [periodo, setPeriodo] = useState("");
   const btnPadrao = "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";
   
   
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
  <div className="p-4 bg-gray-100 rounded-xl">

    {/* ===== FILTROS ===== */}
    <div className="bg-white rounded-xl shadow border-l-4  
    ,0,0,0,0,0,0,0,0 p-4 mb-6">
  <div className="flex items-center justify-between">
    
    {/* TÍTULO */}
    <h2 className="text-xl font-bold text-blue-800">
      🏦 Contas Financeiras
    </h2>

    {/* BOTÕES À DIREITA */}
    <div className="flex gap-4">
      <button
        onClick={carregar}
        className="px-5 h-10 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg"
      >
        Pesquisar
      </button>

      <button
        onClick={novaConta}
         
         className="px-5 py-2 h-10 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
      >
        + Nova conta
      </button>
    </div>

  </div>
</div>


    {/* ===== CARDS DE CONTAS ===== */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-blue-800">
                🏦 {c.conta_nome}
              </h3>

              <button
                onClick={() => editarConta(c)}
                className="text-blue-600 underline font-semibold hover:text-blue-800"
              >
                Editar
              </button>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <p><strong>Banco: </strong> {c.nro_banco ?? "-"}</p>
              <p><strong>Agência: </strong> {c.agencia ?? "-"}</p>
              <p><strong>Conta: </strong> {c.conta ?? "-"}</p>
              {/*<p><strong>Conjunta:</strong> {c.conjunta ? "Sim" : "Não"}</p>
              <p><strong>Jurídica:</strong> {c.juridica ? "Sim" : "Não"}</p>*/}
            </div>

            <div className="border-t my-3"></div>

            <div className="space-y-1 text-base">
             {/*} <p>
                <span className="font-semibold text-gray-700">
                  Saldo inicial:
                </span>{" "}
                R$ {c.saldo_inicial}
              </p>

              <p className="text-green-700 font-semibold">
                Entradas: R$ {c.entradas_periodo}
              </p>

              <p className="text-red-600 font-semibold">
                Saídas: R$ {c.saídas_periodo}
              </p>*/}

              <p
                className={`text-lg font-bold mt-2 ${
                  positivo ? "text-green-700" : "text-red-700"
                }`}
              >
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
