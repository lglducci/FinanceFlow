 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import CardDRE from "../components/CardDRE";
 import {PieChart, BarChart,  Pie, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell , LineChart, Line   } from "recharts";
 import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";

 


export default function DashboardContabil() {
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");
   const [balanco, setBalanco] = useState([]);
  

  const [dataIni, setDataIni] = useState(hojeMaisDias(-30));
  const [dataFim, setDataFim] = useState(hojeLocal());

  const [kpis, setKpis] = useState({});
  const [dre, setDre] = useState([]);

  const [ativoPizza, setAtivoPizza] = useState([]);
  const [passivoPizza, setPassivoPizza] = useState([]);
  const [resultadoMensal, setResultadoMensal] = useState([]);
  const [balancete, setBalancete] = useState([]);
  



  const totalAtivo =  (somarGrupo(balanco, "ATIVO"));
const totalPassivo =  (somarGrupo(balanco, "PASSIVO"));
const patrimonioLiquido =   (  totalAtivo - totalPassivo );

  
  const coresBalanco = {
  ATIVO: "#061f4aff",            // azul
  PASSIVO: "#b91c1c",            // vermelho
  PATRIMONIO_LIQUIDO: "#15803d", // verde
};


const CORES_ATIVO = [
  "#061f4aff",
  "#0f2f6d",
  "#1e40af",
  "#facc15",
  "#9ca3af"
];

  

  function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
 

    async function carregar() {
     
      const r = await fetch(buildWebhookUrl("der"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: empresa_id,
          data_ini: dataIni,
          data_fim: dataFim,
        }),
      });

    const j = await r.json();
    setDre(j);

 // ===== BALANÇO (UMA ÚNICA VEZ) =====
const respBalanco = await fetch(buildWebhookUrl("balanco"), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    empresa_id,
    data_corte: dataFim
  }),
});

const jsonBalanco = await respBalanco.json();
const balancoSeguro = Array.isArray(jsonBalanco) ? jsonBalanco : [];

 setBalanco(balancoSeguro);
setAtivoPizza(agruparAtivoParaPizza(balancoSeguro));
setPassivoPizza(agruparPassivoParaPizza(balancoSeguro));

 
  // RESULTADO MENSAL (12 MESES)
const rMensal = await fetch(buildWebhookUrl("razao_mensal"), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({  empresa_id: empresa_id,
          data_ini: hojeMaisDias(-365),
          data_fim: dataFim, filtro:"" })
});

 
const jMensal = await rMensal.json();

const resultadoMensal = calcularResultadoMensal(
  Array.isArray(jMensal) ? jMensal : []
);

setResultadoMensal(resultadoMensal);

 
   const rBal = await fetch(buildWebhookUrl("balancete"), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({  empresa_id: empresa_id,
          data_ini:dataIni,
          data_fim: dataFim, filtro:"" })
});
    const jBal = await rBal.json();
    setBalancete(Array.isArray(jBal) ? jBal : []);


    // Balancete
    fetch(buildWebhookUrl("balancete", { empresa_id, dataIni, dataFim }))
        .then(r => r.json())
        .then(setBalancete);

}


   

function agruparBalancoPorGrupo(balanco) {
  const mapa = {};

  for (const l of balanco) {
    const grupo = l.grupo;
    const valor = Number(l.saldo || 0);

    if (!mapa[grupo]) {
      mapa[grupo] = 0;
    }
    mapa[grupo] += valor;
  }

  return Object.entries(mapa).map(([grupo, valor]) => ({
    grupo,
    valor,
  }));
}


const dadosBalanco = agruparBalancoPorGrupo(balanco);

function agruparAtivoParaPizza(balanco) {
  const mapa = {};

  for (const l of balanco) {
    if (l.grupo !== "ATIVO") continue;

    const nome = l.conta_nome;
    const valor = Math.abs(Number(l.saldo || 0));

    if (valor === 0) continue;

    if (!mapa[nome]) mapa[nome] = 0;
    mapa[nome] += valor;
  }

  return Object.entries(mapa).map(([label, valor]) => ({
    label,
    valor
  }));
}



function agruparPassivoParaPizza(balanco) {
  const mapa = {};

  for (const l of balanco) {
    if (l.grupo !== "PASSIVO") continue;

    const nome = l.conta_nome;
    const valor = Math.abs(Number(l.saldo || 0));

    if (valor === 0) continue;

    if (!mapa[nome]) mapa[nome] = 0;
    mapa[nome] += valor;
  }

  return Object.entries(mapa).map(([label, valor]) => ({
    label,
    valor
  }));
}


function calcularResultadoMensal(razao) {
  const mapa = {};

  for (const l of razao) {
    const mes = l.mes_ano;

    const debito = Number(l.debito || 0);
    const credito = Number(l.credito || 0);

    if (!mapa[mes]) {
      mapa[mes] = 0;
    }

    // REGRA CONTÁBIL:
    // crédito aumenta resultado
    // débito reduz resultado
    mapa[mes] += credito - debito;
  }

  return Object.entries(mapa).map(([mes, resultado]) => ({
    mes,
    resultado
  }));
}


const resultadoDre =  (
  dre.find(l => l.grupo === "RESULTADO_LIQUIDO")?.valor_periodo || 0) ;

function somarGrupo(balanco, grupo) {
  return balanco
    .filter(l => l.grupo === grupo)
    .reduce((s, l) => s + Number(l.saldo || 0), 0);
}


   function diferencaDias(dataIni, dataFim) {
  if (!dataIni || !dataFim) return 0;

  const inicio = new Date(dataIni);
  const fim = new Date(dataFim);

  const diffMs = fim - inicio;
  return Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 0);
}

const diasPeriodo = diferencaDias(dataIni, dataFim);

  
  return (
    <div className="p-6 bg-white min-h-screen">

      {/* HEADER */}
      <div className="bg-[#061f4aff] text-white rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold">📊 Dashboard Contábil</h1>

        
          <div className="text-white font-semibold text-sm px-3 py-2 bg-black/30 rounded-lg">
            Período: {diasPeriodo} dias
          </div>


        <div className="flex gap-4 mt-4">
          <input type="date" className="input-premium"
            value={dataIni} onChange={e => setDataIni(e.target.value)} />
          <input type="date" className="input-premium"
            value={dataFim} onChange={e => setDataFim(e.target.value)} />

         


           <button
            onClick={carregar}
            className="bg-yellow-400 px-6 rounded font-bold text-black"
            >
            Atualizar
            </button>


        </div>

      </div>

      {/* KPIs */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <Kpi titulo="Ativo" valor={formatarMoeda(totalAtivo)} />
              <Kpi titulo="Passivo" valor={formatarMoeda(totalPassivo)} />
              <Kpi titulo="Patrimônio Líquido" valor={formatarMoeda(patrimonioLiquido)} />
              <Kpi titulo="Resultado" valor={formatarMoeda(resultadoDre)} />
            </div>


      {/* PIZZAS */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <Card titulo="Composição do Ativo">
          {/* COMPOSIÇÃO DO ATIVO */}
            <div className="bg-[#9acbdc] rounded-xl shadow p-6 border border-gray-200 mt-6">

              <h2 className="text-xl font-bold mb-4 text-[#061f4aff]">
                Composição do Ativo
              </h2>

            {ativoPizza.length === 0 ? (
              <p className="text-gray-500 text-sm">Sem dados de ativo.</p>
            ) : (
              <div style={{ width: "100%", height: 160 , background: "#cde5ed",}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ativoPizza}
                      dataKey="valor"
                      nameKey="label"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {ativoPizza.map((_, index) => (
                        <Cell
                          key={index}
                          fill={[
                            "#061f4aff",
                            "#1e40af",
                            "#facc15",
                            "#64748b",
                            "#0f172a"
                          ][index % 5]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(v) =>
                        Number(v).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL"
                        })
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </Card>

        <Card titulo="Composição do Passivo">
        
         {/* COMPOSIÇÃO DO ATIVO */}
            {/* COMPOSIÇÃO DO PASSIVO */}
              <div className="bg-[#f32929] rounded-xl shadow p-6 border border-gray-200 mt-6">

                <h2 className="text-xl font-bold mb-4 text-[#061f4aff]">
                  Composição do Passivo
                </h2>

                {passivoPizza.length === 0 ? (
                  <p className="text-gray-500 text-sm">Sem dados de passivo.</p>
                ) : (
                  <div style={{ width: "100%", height: 160 ,background: "#e3a5a5"}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={passivoPizza}
                          dataKey="valor"
                          nameKey="label"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                        >
                          {passivoPizza.map((_, index) => (
                            <Cell
                              key={index}
                              fill={[
                                "#7f1d1d",   // vermelho escuro
                                "#dc2626",   // vermelho
                                "#f59e0b",   // amarelo
                                "#9a3412",   // marrom
                                "#334155"    // cinza
                              ][index % 5]}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(v) =>
                            Number(v).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL"
                            })
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>


        </Card>
      </div>

      {/* DRE  
      <Card titulo="Receitas x Custos x Despesas">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardDRE dre={dre} />
            </div> 
      </Card>*/}


      {/* RESULTADO MENSAL */}
      <Card titulo="Resultado Mensal">
       <div className="bg-white rounded-xl shadow p-6 border border-gray-200 mt-6">
            <h2 className="text-xl font-bold mb-4 text-[#061f4aff]">
              Resultado Mensal (12 meses)
            </h2>

            {resultadoMensal.length === 0 ? (
              <p className="text-gray-500">Sem dados.</p>
            ) : (
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={resultadoMensal}>
                    <XAxis dataKey="mes" />
                    <YAxis
                      tickFormatter={(v) =>
                        Number(v).toLocaleString("pt-BR")
                      }
                    />
                    <Tooltip
                      formatter={(v) =>
                        Number(v).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="resultado"
                      stroke="#061f4aff"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

      </Card>

      {/* BALANCETE */}
      <Card titulo="Balancete Resumido">
       {/* BALANCETE */}
            <div className="bg-white rounded-xl shadow p-6 border-[4px] border-gray-300 mt-6">
              <h2 className="text-xl font-bold mb-4 text-[#061f4aff]">
                Balancete
              </h2>

              {balancete.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Nenhum dado para o período.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-blue-500">
                    <tr>
                      <th className="p-2 text-left">Conta</th>
                      <th className="text-right">Débito</th>
                      <th className="text-right">Crédito</th>
                      <th className="text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balancete.map((l, i) => (
                      <tr
                          key={i}
                          style={{
                            backgroundColor: i % 2 === 0 ? "#f2f2f2" : "rgb(184, 189, 191)",       
                          }}
                        >

                        <td className="p-2 font-semibold">
                          {l.codigo} – {l.conta_nome}
                        </td>
                        <td className="text-right font-semibold">
                          {Number(l.total_debito).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="text-right">
                          {Number(l.total_credito).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className={`text-right font-bold ${
                          Number(l.saldo) < 0 ? "text-red-600" : "text-green-700"
                        }`}>
                          {Number(l.saldo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

      </Card>
           
     
        <Card titulo="Balanço Patrimonial">

                  {dadosBalanco.length === 0 ? (
                    <p className="text-gray-500">Nenhum dado para o período.</p>
                  ) : (
                    <div style={{ width: "100%", height: 180 }}>
                     <ResponsiveContainer width="60%" height={180}>
                      <BarChart data={dadosBalanco}>
                        <XAxis dataKey="grupo" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} width={60} />
                        <Tooltip
                          formatter={(v) =>
                            Number(v).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })
                          }
                        />

                        <Bar dataKey="valor" barSize={86} radius={[6, 6, 0, 0]}>
                          {dadosBalanco.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={coresBalanco[entry.grupo] || "#64748b"}
                            />
                          ))}
                        </Bar>

                      </BarChart>
                    </ResponsiveContainer>

                    </div>
                  )}

                </Card>

            
      
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">

                <h2 className="text-xl font-bold mb-4 text-[#061f4aff]">
                    Demonstração do Resultado (DRE)
                </h2>

                {dre.length === 0 ? (
                    <p className="text-gray-500">Nenhum dado para o período.</p>
                ) : (
                     <ResponsiveContainer width="60%" height={180}>

                    <BarChart data={dre}>
                        <XAxis dataKey="grupo" />
                         <YAxis tickFormatter={(v) => Number(v).toLocaleString("pt-BR")} />
                          <Tooltip
                            formatter={(v) =>
                              Number(v).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })
                            }
                            contentStyle={{
                              fontSize: 12,
                              borderRadius: 6,
                            }}
                          />


                       <Bar  barSize={66}
                       dataKey="valor_periodo" radius={[4, 4, 0, 0]}>
                    {dre.map((entry, index) => {
                        let cor = "#061f4aff";

                        if (entry.grupo?.includes("RECEITA")) cor = "#16a34a";      // verde
                        if (entry.grupo?.includes("CUSTO")) cor = "#dc2626";        // vermelho
                        if (entry.grupo?.includes("DESPESA")) cor = "#f59e0b";     // amarelo
                        if (entry.grupo?.includes("RESULTADO_BRUTO")) cor = "#2563eb";   // azul
                        if (entry.grupo?.includes("RESULTADO_OPERACIONAL")) cor = "#0eb63e";   // azul
                          if (entry.grupo?.includes("RESULTADO_LIQUIDO")) cor = "#dc11c4";   // azul


                        return <Cell key={`cell-${index}`} fill={cor} />;
                      })}
                    </Bar>


                    </BarChart>
                    </ResponsiveContainer>
                )}

            </div>


     

    </div>
  );
}

/* COMPONENTES AUX */
function Kpi({ titulo, valor }) {
  return (
    <div className="border rounded-xl p-4 shadow">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-xl font-bold">{valor ?? "0,00"}</p>
    </div>
  );
}

function Card({ titulo, children }) {
  return (
    <div className="border rounded-xl p-5 shadow">
      <h2 className="font-bold mb-4">{titulo}</h2>
      {children}
    </div>
  );
}
