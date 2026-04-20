import { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
 
import { useLocation } from "react-router-dom";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
import ExcelExport from "../utils/ExcelExport";


const empresa_id =
  localStorage.getItem("empresa_id") ||
  localStorage.getItem("id_empresa") ||
  "0";


export default function RelatoriosRazao() {
  const hoje = new Date().toISOString().slice(0, 10);

  const [empresaId, setEmpresaId] = useState(null);
  const [dataIni, setDataIni] = useState(hojeMaisDias(-7));
  const [dataFim, setDataFim] = useState(hojeLocal());
  const [contaId, setContaId] = useState("");
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
 const [mostrarZeradas, setMostrarZeradas] = useState(false);
 const [tipo, setTipo] = useState("c"); // r = detalhado (default)
 const [textoConta, setTextoConta] = useState("");
  const [contas, setContas] = useState([]);
  const location = useLocation();
 const navigate = useNavigate();
 
  // formatter BR
  const fmt = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
 
  function formatarData(data) {
  if (!data) return "";

  const d = data.split("T")[0]; // pega só a data
  const [ano, mes, dia] = d.split("-");

  return `${dia}/${mes}/${ano}`;
}
useEffect(() => {
    async function carregarContas() {
      const r = await fetch(
        buildWebhookUrl("contas_contabeis_lancaveis", { empresa_id })
      );
      const j = await r.json();
      setContas(j || []);
    }
    carregarContas();
  }, [empresa_id]);


async function consultarComParams({  webhook, empresa_id, data_ini, data_fim, filtro }) {

  
 if (
  webhook === "razao_por_conta" &&
  (!contaId || contaId === "[]" || isNaN(Number(contaId)))
) {
  alert("Conta inválida.");
  return;
}

  setLoading(true);
  setDados([]);

 


  try {
    const resp = await fetch(buildWebhookUrl(webhook), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        data_ini,
        data_fim,
        conta_id:contaId,
        filtro: filtro || ""  
      }),
    });

    const json = await resp.json();
    setDados(Array.isArray(json) ? json : []);
  } catch (e) {
    alert("Erro ao carregar a razão");
  } finally {
    setLoading(false);
  }
}

 useEffect(() => {
  const emp =
    Number(localStorage.getItem("id_empresa") || localStorage.getItem("empresa_id") || 0);

  if (!emp) return;

  const st = location.state;
  if (!st?.conta) return; // abriu direto / sem drilldown

  // atualiza os campos da tela (opcional)
  setEmpresaId(emp);
  setContaId(st.conta);
  setDataIni(st.dataIni || dataIni);
  setDataFim(st.dataFim || dataFim);

  // ✅ CHAMA O WEBHOOK DIRETO COM OS PARAMS VINDOS DO BALANÇO
  consultarComParams({
    empresa_id: emp,
    data_ini: st.dataIni || dataIni,
    data_fim: st.dataFim || dataFim,
    filtro: st.conta,
    conta_id:st.conta
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [location.state]);

 async function consultar() {
  const emp = Number(empresaId || localStorage.getItem("id_empresa") || localStorage.getItem("empresa_id") || 0);
  if (!emp) return alert("Empresa não carregada");
  let webhook = "razao"; // default

  if (tipo === "d") webhook = "razao_diario";
  if (tipo === "m") webhook = "razao_mensal";
  if (tipo === "c") webhook = "razao_por_conta";

    


  return consultarComParams({
     webhook,
    empresa_id: emp,
    data_ini: dataIni,
    data_fim: dataFim,
    filtro: contaId,
  });
}


function trocarTipo(novoTipo) {
  setTipo(novoTipo);

  // 🔥 LIMPA TUDO
  setDados([]);
  setLoading(false);
  setContaId("");
  // se tiver:
  // setTotais(null);
  // setSelecionado(null);
}

function linhaZerada(l) {
  return (
    Number(l.saldo_inicial || 0) === 0 &&
    Number(l.debito || 0) === 0 &&
    Number(l.credito || 0) === 0 &&
      Number(l.valor || 0) === 0 &&
    Number(l.saldo || 0) === 0  
  );
}

  function handleChange(e) {
    const valorDigitado = e.target.value;
    setTexto(valorDigitado);

    // Busca a conta pelo texto digitado (sem mostrar ID)
    const conta = contas.find(
      (c) =>
        `${c.codigo} - ${c.nome}`.toLowerCase() === valorDigitado.toLowerCase()
    );

    // Se achou, envia o ID real
    if (conta) {
      setContaId(conta.id); // <-- AQUI ENVIA SÓ O ID REAL
    } else {
      setContaId(""); // limpa se não achou
    }
  }

 function exportarExcel() {
 
  const dadosExcel = dados
    .filter((l) => mostrarZeradas || !linhaZerada(l))
    .map((l) => ({
      Data: formatarData(l.data_mov || l.data),
      Conta: l.conta_codigo ? `${l.conta_codigo} - ${l.conta_nome || ""}` : "",
      Contrapartida: l.conta_contrapartida || "",
      Historico: l.historico || "",
      SaldoInicial: Number(l.saldo_inicial ?? 0),
      Debito: Number(l.debito ?? 0),
      Credito: Number(l.credito ?? 0),
      Valor: Number(l.valor ?? 0),
      Saldo: Number(l.saldo_final ?? l.saldo ?? 0),
      Lote: l.lote_id ?? "",
      Lancamento: l.id ?? "",
      MesAno: l.mes_ano ?? "",
    }));

  ExcelExport.exportar(dadosExcel, "razao_contabil.xlsx");
}

  return (
    <div className="p-6">
       <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-blue-800 mb-2"> 
      <h1 className="text-2xl font-bold mb-6">📒 Razão Contábil </h1>

       
        {/* FILTROS */}
        <div className="bg-white rounded-xl p-4 shadow mb-6 space-y-4">

  {/* 🔹 LINHA 1 – filtros principais */}
  <div className="flex flex-wrap gap-4 items-end">
    <div>
      <label className="block font-bold text-[#1e40af]">Data inicial</label>
      <input
        type="date"
        value={dataIni}
        onChange={(e) => setDataIni(e.target.value)}
        className="border rounded-lg px-3 py-2 border-yellow-500"
      />
    </div>

    <div>
      <label className="block font-bold text-[#1e40af]">Data final</label>
      <input
        type="date"
        value={dataFim}
        onChange={(e) => setDataFim(e.target.value)}
        className="border rounded-lg px-3 py-2 border-yellow-500"
      />
    </div>
        
         {tipo === "c" && (
  <div className="space-y-2">
    <label
      htmlFor="conta-especifica"
      className="block font-bold text-[#1e40af]"
    >
      Conta Específica
    </label>

    <input
      id="conta-especifica"
      list="lista-contas"
      placeholder="Código ou nome"
      value={textoConta}
      onChange={(e) => {
        const texto = e.target.value;
        setTextoConta(texto);

        // Quando bater exatamente com alguma opção, seta o id
        const conta = contas.find(
          (c) => `${c.codigo} - ${c.nome}`.toLowerCase() === texto.toLowerCase()
        );
        setContaId(conta?.id || "");
      }}
      className="border rounded-lg px-3 py-2 border-yellow-500 w-64"
    />

    <datalist id="lista-contas">
      {contas.map((conta) => (
        <option
          key={conta.id}
          value={`${conta.codigo} - ${conta.nome}`}
        />
      ))}
    </datalist>
  </div>
)}





      {tipo !== "c" && (  <div>
      <label className="block font-bold text-[#1e40af]">Conta (opcional)</label>
      <input
        type="text"
        placeholder="Código ou nome"
        value={contaId}
        onChange={(e) => setContaId(e.target.value)}
        className="border rounded-lg px-3 py-2 border-yellow-500 w-64"
      />
    </div>)}

    <button
      onClick={consultar}
      className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-white
                        bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-95
                        transition-all duration-200
                        inline-flex items-center gap-2
                      ">
      Consultar
    </button>

    <button
      onClick={() => window.print()}
        className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-white
                        bg-gradient-to-b from-gray-500 via-gray-600 to-green-800
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-95
                        transition-all duration-200
                        inline-flex items-center gap-2
                      ">
   
      🖨️ Imprimir
    </button>

    
        <button
            onClick={exportarExcel}
            className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-white
                        bg-gradient-to-b from-green-500 via-green-600 to-green-800
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-95
                        transition-all duration-200
                        inline-flex items-center gap-2
                      ">
          Exportar Excel
          </button>

    <button
      onClick={() => navigate("/reports")}
      className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-white
                        bg-gradient-to-b from-gray-200 via-gray-400 to-gray-500
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-95
                        transition-all duration-200
                        inline-flex items-center gap-2
                      ">
      Voltar
    </button>
  </div>

  {/* 🔹 LINHA 2 – opções do relatório */}
  <div className="flex flex-wrap gap-6 items-center text-sm">


            <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tipoRelatorio"
              checked={tipo === "c"}
              onChange={() => trocarTipo("c")}
            />
            Razão Conta
          </label> 

            <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tipoRelatorio"
              checked={tipo === "r"}
              onChange={() => trocarTipo("r")}
            />
            Razão detalhado
          </label> 

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tipoRelatorio"
              checked={tipo === "d"}
              onChange={() => trocarTipo("d")}
            />
            Sintético diário
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tipoRelatorio"
              checked={tipo === "m"}
              onChange={() => trocarTipo("m")}
            />
            Sintético mensal
          </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!mostrarZeradas}
            onChange={() => setMostrarZeradas(!mostrarZeradas)}
          />
          Ocultar contas sem movimento
        </label>

      </div>
    
       </div>
 
        </div>
 

       <div id="print-area">
        {/* TABELA */}
         <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-gray-400 mb-2"> 
        <div className="bg-white rounded-xl shadow overflow-x-auto">
 
          <table className="w-full text-sm">

            
           
            <thead className="bg-blue-900 text-white">
              <tr>
               
                {tipo !== "m" && ( <th className="p-3 text-left">Data</th>)}
                 {tipo === "m" && (<th className="p-3 text-left">Mes-Ano</th>)}
                  {![ "c"].includes(tipo) && (<th className="p-3 text-left">Conta</th>)}
                 {tipo === "c" && ( <th className="p-3 text-left">Contrapartida</th>)}
                 {tipo !== "m" && (<th className="p-3 text-left">Histórico</th>)}
                  {tipo !== "c" && (  <th className="p-3 text-right">Saldo Inicial</th> )} 
                {!["r", "c","m"].includes(tipo) && ( <th className="p-3 text-right">Débito</th>)}
                   {!["r","c","m"].includes(tipo) && ( <th className="p-3 text-right">Crédito</th>)}
                  {["r", "c","m"].includes(tipo) && (  <th className="p-3 text-right">Valor</th>)}
                <th className="p-3 text-right">Saldo</th>
 

              </tr>
            </thead>
          <tbody>
            
                {dados.length > 0 && (
                    <tr className="bg-white border-blue-900 text-lg">
                          {["c"].includes(tipo) && (
                            <td
                              colSpan={8}
                              className={`p-2 font-bold bg-yellow-100 border-b text-blue-800 border-[2px] border-blue-800`}
                            > 
                              {dados[0].conta_codigo} – {dados[0].conta_nome}
                              <span className="ml-64 text-blue-800 text-lg font-bold ml-64">
                                Saldo Inicial:&nbsp;
                                <span className={`${dados[0].saldo_inicial < 0 ? "text-red-600" : "text-green-700 text-lg"}`}>
                                  {fmt.format(dados[0].saldo_inicial)}
                                </span>
                              </span>
                            </td>
                          )}
                  </tr>
                )}

            {dados.filter((l) => mostrarZeradas || !linhaZerada(l)).map((l, idx) => (
              <tr
                key={idx}  className={idx % 2 === 0 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6]"}  > 
                          

                 {tipo !== "m" && (<td   className="p-2 font-bold font-size: 16px">{formatarData(l.data_mov)}</td>)} 
                   {tipo === "m" && (<td    className={`p-2 font-bold ${
                            l.historico === "TOTAL DA CONTA"
                              ? "text-green-700 text-lg"
                              : ""
                          }`}
                        >
                      {l.mes_ano}
                    </td>)}

                {!["c"].includes(tipo) && (  <td
                      className={`p-2 font-bold ${
                        l.historico === "TOTAL DA CONTA"
                          ? "text-green-700 text-lg"
                          : ""
                      }`}
                    >
                  {l.conta_codigo} – {l.conta_nome}
                </td>)}
 
                   {tipo === "c" && ( <td
                      className={`p-2 font-bold ${
                        l.historico === "TOTAL DA CONTA"
                          ? "text-green-700 text-lg"
                          : ""
                      }`}
                    >
                  {l.conta_contrapartida}
                </td>)}


                 {/*  <td  className="p-2 font-bold font-size: 16px">{l.historico}</td>´*/}

                     {tipo !== "m" && ( <td
                            className={`p-2 font-bold ${
                              l.historico === "TOTAL DA CONTA"
                                ? "text-green-700 text-lg"
                                : ""
                            }`}
                          >
                            {l.historico}
                          </td>)}
                  
                    

                        {![ "c"].includes(tipo) && ( <td
                        className={`p-3 text-right font-bold ${
                          l.saldo_inicial < 0 ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        { fmt.format(l.saldo_inicial) }
                      </td>)}






                  {!["r", "c","m"].includes(tipo) && (   <td   className="p-2 font-bold text-right font-size: 16px">
                    {fmt.format(l.debito)}
                  </td>)} 

                    {!["r", "c","m"].includes(tipo) && (  <td   className="p-2 font-bold text-right font-size: 16px">
                    {fmt.format(l.credito)}
                  </td>)} 

                   
                   {["r", "c","m"].includes(tipo) && (   <td
                    className={`p-3 text-right font-bold ${
                      l.valor < 0 ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    {fmt.format(l.valor)}
                  </td>)} 



                     {["r", "d","m"].includes(tipo) && (  <td
                    className={`p-3 text-right font-bold ${
                      l.saldo < 0 ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    {fmt.format(l.saldo)}
                  </td> )} 
 
                  

                   {tipo === "c" && ( <td
                    className={`p-3 text-right font-bold ${
                      l.saldo < 0 ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    {fmt.format(l.saldo_final)}
                  </td> )} 
                  
                </tr>

                

                
              ))}

              {!loading && dados.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>

              


              )}
            </tbody>
          </table>

          {loading && (
            <div className="p-6 text-center text-blue-600 font-semibold">
              Carregando...
            </div>
          )}
        </div>
      </div>
       </div>
    </div>
  );
}
