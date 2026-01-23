import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

 
 


export default function ApuracaoResultado() {
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth() + 1);

  const [dre, setDre] = useState([]);
  const [resultadoAnterior, setResultadoAnterior] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [status, setStatus] = useState("idle"); 
  // idle | aberto | ja_apurado | pronto
 
  /* ================== LOAD INICIAL ================== */
  useEffect(() => {
    carregarStatus();
    carregarResultadoAnterior();
    carregarHistorico();
  }, [ano, mes]);

   useEffect(() => {
  carregarDre();          // ✅ carrega o DRE ao abrir e ao trocar mês/ano
 // carregarApuracoes?.();  // ✅ se você tiver uma função pra buscar histórico/apurações
}, [ano, mes]);

  async function carregarStatus() {
  const r = await fetch(buildWebhookUrl("status_apuracao"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ empresa_id, ano, mes }),
  });

  const j = await r.json(); 
  setStatus(j?.[0]?.data?.status ?? "INDEFINIDO");
}



  async function carregarResultadoAnterior() {
    const r = await fetch(buildWebhookUrl("ultima_apuracao"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa_id }),
    });

    const j = await r.json(); 

    setResultadoAnterior(Number(j?.[0]?.data?.resultado ?? 0));


  }

  async function carregarHistorico() {
    const r = await fetch(buildWebhookUrl("historico_apuracao"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa_id }),
    });

    const j = await r.json();
    setHistorico(Array.isArray(j) ? j : []);
  }

  async function carregarDre() {
    const dataIni = `${ano}-${String(mes).padStart(2, "0")}-01`;
    const dataFim = new Date(ano, mes, 0).toISOString().slice(0, 10);
  
    const r = await fetch(buildWebhookUrl("der"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id:empresa_id,
        data_ini: dataIni,
        data_fim: dataFim,
      }),
    });

    const j = await r.json();
    setDre(j);
  }

 async function apurar() {
  if (status !== "ABERTO") return;

  try {
    const r = await fetch(buildWebhookUrl("apuracao_resultado"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        ano,
        mes,
        usuario: 1
      }),
    });

    const j = await r.json();

    if (!r.ok || j?.[0]?.ok === false) {
      alert(
        j?.[0]?.message ||
        "Erro ao apurar resultado. Verifique os parâmetros."
      );
      console.error("ERRO APURAÇÃO:", j);
      return; // ⛔ PARA TUDO AQUI
    }

    // ✅ só continua se deu certo
    await carregarStatus();
    await carregarResultadoAnterior();
    await carregarHistorico();
    await carregarDre();

  } catch (err) {
    console.error("ERRO GERAL:", err);
    alert("Erro inesperado ao apurar resultado.");
  }
}


const historicoFormatado = historico.map(h => ({
  ...h,
  mes_ano: `${String(h.mes).padStart(2, "0")}/${h.ano}`
}));



  /* ================== UI ================== */
  return (
    <div className="p-6 bg-blue-100 min-h-screen">

      {/* HEADER */}
      <div className="bg-[#061f4aff] text-white rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold">📌 Apuração de Resultado</h1>

        <div className="flex gap-4 mt-4">
          <input
            type="number"
            className="input-premium w-24"
            value={ano}
            onChange={e => setAno(Number(e.target.value))}
          />

          <input
            type="number"
            className="input-premium w-20"
            value={mes}
            min={1}
            max={12}
            onChange={e => setMes(Number(e.target.value))}
          />

          <button
            disabled={status !== "ABERTO"}
            onClick={apurar}
            className={`px-6 rounded font-bold ${
              status === "ABERTO"
                ? "bg-green-600 text-white"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
          >
            Apurar Resultado
          </button>
        </div>

        <p className="text-sm mt-2 opacity-80">
          Status: <b>{status}</b>
        </p>
      </div>

      {/* RESULTADO ANTERIOR */}
      <div className="bg-white rounded-xl shadow p-6 mb-8 border-l-8 border-green-600">
        <h2 className="font-bold text-lg mb-2">
          Resultado do mês anterior
        </h2>
         <p className="text-2xl font-bold text-green-700">
        {Number(resultadoAnterior).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })}
        </p>

      </div>

      {/* DRE */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="font-bold text-lg mb-4">
          Demonstração do Resultado do Exercício (DRE)
        </h2>

        <ResponsiveContainer width="50%" height={220}>
          <BarChart data={dre}>
            <XAxis dataKey="grupo" />
            <YAxis />
            <Tooltip
              formatter={(v) =>
                Number(v).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              }
            />
            <Bar dataKey="valor_periodo" barSize={60}>
              {dre.map((l, i) => (
                <Cell
                  key={i}
                  fill={
                    l.grupo?.includes("RECEITA") ? "#16a34a" :
                    l.grupo?.includes("CUSTO") ? "#dc2626" :
                    l.grupo?.includes("DESPESA") ? "#f59e0b" :
                    "#2563eb"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    {/* HISTÓRICO */}
<div className="bg-white rounded-xl shadow p-6">
  <h2 className="font-bold text-lg mb-4">
    Evolução do Resultado
  </h2>

  <ResponsiveContainer width="60%" height={220}>
    <BarChart data={historicoFormatado}>
      
      {/* 📅 MÊS/ANO */}
      <XAxis 
        dataKey="mes_ano"
        tick={{ fontSize: 12 }}
      />

      {/* 💰 VALORES */}
      <YAxis
        tickFormatter={(v) =>
          Number(v).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0
          })
        }
      />

      {/* 🧠 TOOLTIP */}
      <Tooltip
        formatter={(value) =>
          Number(value).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
          })
        }
        labelFormatter={(label) => `Competência: ${label}`}
      />

      <Bar
        dataKey="resultado"
        fill="#061f4aff"
        radius={[6, 6, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
</div>


    </div>
  );
}
