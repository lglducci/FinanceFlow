import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { useRef } from "react";
import { fetchSeguro } from "../utils/apiSafe";
import ModalBase from "../components/ModalBase";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
import FormContaContabilModal from "../components/forms/FormContaContabilModal";
 
export default function LancamentoLivroCaixa() {
  const [contasFiltradasContra, setContasFiltradasContra] = useState([]);
  const [conta, setConta] = useState("");
  const [saldo, setSaldo] = useState(0);
   const empresa_id = localStorage.getItem("empresa_id");
 const [contas, setContas] = useState([]);
 const [contasFiltradas, setContasFiltradas] = useState([]);
  const [linhas, setLinhas] = useState([]); 
  const [indiceSelecionado, setIndiceSelecionado] = useState(-1);
const [contaId, setContaId] = useState(null);
const historicoRef = useRef(null);
const [carregandoSaldo, setCarregandoSaldo] = useState(false); 
const [modalContaAberto, setModalContaAberto] = useState(false);
const [mostrarNovaLinha, setMostrarNovaLinha] = useState(true);
const [indiceContaObs, setIndiceContaObs] = useState(-1);
  function hojeISO() {
  return new Date().toISOString().slice(0,10);
}

 const [nova, setNova] = useState({
  data: hojeLocal(),
  historico: "",
  tipo: "entrada",
  valor: "",
  contra: ""
});


const navigate = useNavigate();

 function adicionarLinha() {

  setMostrarNovaLinha(true);

  const ultimaLinha = linhas[linhas.length - 1];

  if (ultimaLinha && (!ultimaLinha.historico || !ultimaLinha.valor || !ultimaLinha.conta_id)) {
    alert("Preencha a linha anterior antes de adicionar outra.");
    return;
  }

  if (!nova.historico || !nova.valor || !nova.conta_id) {
    alert("Preencha histórico, valor e conta contra.");
    return;
  }

  let valor = parseFloat((nova.valor || "0").replace(",", "."));

  let novoSaldo = saldo;

  if (nova.tipo === "entrada") novoSaldo += valor;
  if (nova.tipo === "saida") novoSaldo -= valor;

  setSaldo(novoSaldo);

  setLinhas(prev => [
    ...prev,
    { ...nova, saldo: novoSaldo }
  ]);

  setNova({
    data: hojeLocal(),
    historico: "",
    tipo: "entrada",
    valor: "",
    contra: "",
    conta_id: null
  });

  historicoRef.current?.focus();
}
 
  async function carregarContas() {
    const r = await fetch(
      buildWebhookUrl("contas_contabeis_lancaveis", { empresa_id })
    );
    const j = await r.json();
    setContas(j || []);
  }
  
  useEffect(() => {
    carregarContas();
  }, [empresa_id]);
  

    function filtrarContas(texto) {

    const t = texto.toLowerCase();

    const filtradas = contas.filter(c =>
        c.nome.toLowerCase().includes(t) ||
        c.codigo.includes(t) ||
        (c.apelido && c.apelido.includes(t))
    );

    setContasFiltradas(filtradas.slice(0,10));
    }


 
 
// Rotina salvar definitiva assim espero
 
async function salvarLancamentos() {

  if (!contaId) {
    alert("Conta observada não selecionada");
    return;
  }
 
  let linhasParaSalvar = [...linhas];

 if (nova.historico || nova.valor) {

 let valor = parseFloat(nova.valor || 0);

  let novoSaldo = saldo;

  if (nova.tipo === "entrada") novoSaldo += valor;
if (nova.tipo === "saida") novoSaldo -= valor;

  linhasParaSalvar.push({
    ...nova,
    saldo: novoSaldo
  });
}

  if (linhasParaSalvar.length === 0) {
    alert("Nenhuma linha para salvar");
    return;
  }

 const lancamentos = linhasParaSalvar.map(l => ({
  data: l.data,
  historico: l.historico,
  valor: parseFloat((l.valor || "0").replace(",", ".")),
  tipo: l.tipo,
  conta_contra: Number(l.conta_id)
}));

  const payload = {
    empresa_id,
    conta_observada: contaId,
    lancamentos: JSON.parse(prepararLancamentosJSONB(lancamentos))
  };

  const url = buildWebhookUrl("lote_lancamentos");

  try {

    await fetchSeguro(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    alert("Lançamentos salvos!");
    setLinhas([]);

setConta("");
setContaId(null);
setSaldo(0);

 setNova({
  data: hojeLocal(),
  historico: "",
  tipo: "entrada",
  valor: "",
  contra: ""
});

historicoRef.current?.focus();

  } catch (err) {

    console.error("ERRO CAPTURADO:", err.message);

    alert(
      err.message ||
      "Erro inesperado ao salvar os lançamentos."
    );

  }
}
  
// fim da rotina salvar  


function prepararLancamentosJSONB(lancamentos) {
  try {

    // se já for array ou objeto
    if (typeof lancamentos === "object") {
      return JSON.stringify(lancamentos);
    }

    // se vier string
    if (typeof lancamentos === "string") {

      let txt = lancamentos.trim();

      // remove aspas externas
      if (
        (txt.startsWith("'") && txt.endsWith("'")) ||
        (txt.startsWith('"') && txt.endsWith('"'))
      ) {
        txt = txt.slice(1, -1);
      }

      // remove escape duplicado
      txt = txt.replace(/\\"/g, '"');

      // tenta converter
      const obj = JSON.parse(txt);

      return JSON.stringify(obj);
    }

    throw new Error("Formato inválido de lancamentos");

  } catch (e) {
    console.error("Erro preparando JSON:", e);
    throw new Error("Lancamentos JSON inválido");
  }
}

 async function carregarSaldoConta(conta_id) {

  if (!conta_id) return;

  try {

    setCarregandoSaldo(true);

    const data = await fetchSeguro(
      buildWebhookUrl("saldoconta"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: empresa_id,
          conta_id: conta_id
        })
      }
    );

    setSaldo(Number(data.data.ff_saldo_conta || 0));

  } catch (err) {

    console.error("Erro ao buscar saldo:", err.message);

    alert(err.message || "Erro ao carregar saldo da conta");

  } finally {

    setCarregandoSaldo(false);

  }
}

function filtrarContasContra(texto) {

  const t = texto.toLowerCase();

  const filtradas = contas.filter(c =>
    c.nome.toLowerCase().includes(t) ||
    c.codigo.includes(t) ||
    (c.apelido && c.apelido.includes(t))
  );

  setContasFiltradasContra(filtradas.slice(0,10));
}

 const valorAtual = parseFloat((nova.valor || "0").replace(",", "."));

let saldoLinhaAtual = saldo;

if (!isNaN(valorAtual)) {
  if (nova.tipo === "entrada") saldoLinhaAtual = saldo + valorAtual;
  if (nova.tipo === "saida") saldoLinhaAtual = saldo - valorAtual;
}

 function removerLinha(index) {

  // excluir linha que já está na lista
  if (index < linhas.length) {

    const novaLista = [...linhas];

    const linhaRemovida = novaLista[index];

    let valor = parseFloat(linhaRemovida.valor || 0);

    if (linhaRemovida.tipo === "entrada") {
      setSaldo(s => s - valor);
    }

    if (linhaRemovida.tipo === "saida") {
      setSaldo(s => s + valor);
    }

    novaLista.splice(index, 1);
    setLinhas(novaLista);

    return;
  }

  // excluir linha nova (a de digitação)
  setNova({
    data: hojeLocal(),
    historico: "",
    tipo: "entrada",
    valor: "",
    contra: "",
    conta_id: null
  });
}



return (
      <div className="flex justify-center mt-10 bg-gray-100 min-h-screen py-10">

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-[1700px]">
        <div className="bg-gray-650 rounded-lg p-8"> 
        <div className="bg-gray-600 border-b rounded-t-xl p-6"> 
       <div className="bg-gray-600 border-b rounded-t-xl p-6">  
        {/* TÍTULO */}
        <h2 className="text-lg font-semibold tracking-wide mb-4 text-gray-50">
          ⚡ Lançamento Contábil Inteligente
        </h2>

        {/* CONTA + SALDO */}
        <div className="grid grid-cols-[1fr_200px] gap-6 items-end">

          {/* CONTA */}
          <div className="flex flex-col gap-1">

            <label className="text-sm font-semibold text-gray-50">
              Conta observada
            </label>

     
      <div className="relative">

                    <input
                    className="w-full border rounded-lg p-2"
                    placeholder="Digite conta (ex: banco, caixa, 1.1...)"
                    value={conta}
                    onChange={(e)=>{
                        const v = e.target.value;
                        setConta(v);
                        filtrarContas(v);
                        setIndiceContaObs(-1);
                    }}
                  

                    onKeyDown={(e)=>{

                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setIndiceContaObs(i =>
                            Math.min(i + 1, contasFiltradas.length - 1)
                          );
                        }

                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setIndiceContaObs(i =>
                            Math.max(i - 1, 0)
                          );
                        }

                        if (e.key === "Enter" && indiceContaObs >= 0) {
                          e.preventDefault();

                          const c = contasFiltradas[indiceContaObs];

                          setConta(c.nome);
                          setContaId(c.id);
                          setContasFiltradas([]);

                          carregarSaldoConta(c.id);
                        }

                      }}
                         />
                    {contasFiltradas.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border rounded shadow max-h-40 overflow-y-auto z-50">

                       {contasFiltradas.map((c,i) => ( 
                        <div
                            key={c.id}
                            className={`p-2 cursor-pointer ${
                                i === indiceContaObs
                                  ? "bg-blue-200"
                                  : "hover:bg-gray-200"
                              }`}
                            onClick={()=>{

                            setConta(c.nome);
                            setContaId(c.id);
                            setContasFiltradas([]);

                            carregarSaldoConta(c.id);
                            }}
                        >
                            {c.codigo} - {c.nome}
                        </div>
                        ))}

                    </div>
                    )}

             </div>

    </div>

    {/* SALDO */}
    <div className="text-right">

      <div className="text-base text-gray-50">
        Saldo atual
      </div>
     <div
  className={`text-lg font-bold ${
    saldo > 0
      ? "text-green-600"
      : saldo < 0
      ? "text-red-400"
      : "text-gray-200"
  }`}
>
  {carregandoSaldo
    ? "Carregando..."
    : saldo.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })
  }
</div>

    </div>

  </div>  </div>

</div>
          {/* TABELA */}
             {/* CABEÇALHO */}

                 <div  className="grid grid-cols-[120px_1fr_120px_120px_220px_120px_60px] gap-2 text-sm py-2 border-b border-gray-200 hover:bg-gray-50">
                                   
                <div>Data</div>
                <div>Histórico</div>
                
               <div className="text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      Tipo
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-gray-700">
                      Valor
                    </span>
                  </div>
                <div className="text-center">Contra Conta</div>
                <div className="text-right">Saldo</div>
                <div className="text-center">Ação</div>
                </div>

                {/* LINHAS */}

                  {linhas.map((l, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[120px_1fr_120px_120px_220px_120px_60px] gap-2 text-sm border-b py-1"
                        >
                          <div>{l.data.split("-").reverse().join("/")}</div>

                          <div className="truncate">{l.historico}</div>
                          <div className="text-center">
                                {l.tipo === "entrada" ? (
                                  <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-green-100 text-green-800 font-semibold text-xs">
                                    <span className="w-2 h-2 bg-green-600 rounded-sm"></span>
                                    Entrada
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-red-100 text-red-800 font-semibold text-xs">
                                    <span className="w-2 h-2 bg-red-600 rounded-sm"></span>
                                    Saída
                                  </span>
                                )}
                              </div>
                           <div
                            className={`text-right font-mono font-semibold ${
                              l.tipo === "entrada" ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            {Number((l.valor || "0").replace(",", ".")).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL"
                            })}
                          </div>

                          <div>{l.contra}</div>

                          <div
                            className={`border rounded p-2 text-right font-semibold ${
                            saldo > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                          >
                            {Number(l.saldo || 0).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL"
                            })}
                          </div> 
                          
                           <div className="flex items-center justify-center">
                          <button
                            className="text-red-600 hover:text-red-800 text-lg"
                            onClick={() => removerLinha(i)}
                          >
                            🗑
                          </button>
                        </div>
                        </div>
                      ))}
          {/* NOVA LINHA */}

            {mostrarNovaLinha && (
<div className="grid grid-cols-[120px_1fr_120px_120px_220px_120px_60px] gap-2 mb-4">
         
               <input
                type="date"
                className="border rounded p-2"
                value={nova.data}
                onChange={(e)=>setNova({...nova,data:e.target.value})}
              />

                 <input
                ref={historicoRef}
                className="border rounded p-2"
                placeholder="Histórico"
                value={nova.historico}
                onChange={(e)=>setNova({...nova,historico:e.target.value})}
                />

                 <select
                        className="border rounded p-2"
                        value={nova.tipo}
                        onChange={(e)=>setNova({...nova,tipo:e.target.value})}
                      >
                        <option value="entrada">Entrada</option>
                        <option value="saida">Saída</option>
                      </select>

                    <input
                          className="border rounded p-2 text-right"
                          placeholder="Valor"
                          value={nova.valor}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^\d.,]/g, "");
                            setNova({ ...nova, valor: v });
                          }}
                        />
                   <div className="relative">

                   <input
                    className="border rounded p-2 w-full"
                    placeholder="Contra conta"
                    value={nova.contra}
                    onChange={(e)=>{
                        const v = e.target.value;
                        setNova({...nova,contra:v});
                         filtrarContasContra(v);
                        setIndiceSelecionado(-1);
                    }}
                    onKeyDown={(e)=>{

                        if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setIndiceSelecionado(i =>   
                            Math.min(i + 1, contasFiltradasContra.length - 1)
                        );
                        }

                        if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setIndiceSelecionado(i =>
                            Math.max(i - 1, 0)
                        );
                        }

                        if (e.key === "Enter" && indiceSelecionado >= 0) {
                          e.preventDefault();

                          const c = contasFiltradasContra[indiceSelecionado];

                          setNova({
                            ...nova,
                            contra: c.nome,
                            conta_id: c.id
                          });

                          setContasFiltradasContra([]);
                          setIndiceSelecionado(-1);
                        }
                    }}
                    />
                    {contasFiltradasContra.length > 0 && (
                          <div className="absolute top-full left-0 w-full bg-white border rounded shadow max-h-48 overflow-y-auto z-50">
                            
                            {contasFiltradasContra.map((c, i) => (
                              <div
                                key={c.id}
                                className={`p-2 cursor-pointer ${
                                  i === indiceSelecionado
                                    ? "bg-blue-200"
                                    : "hover:bg-gray-200"
                                }`}
                                onClick={() => {
                                  setNova({ ...nova, contra: c.nome, conta_id: c.id });
                                  setContasFiltradasContra([]);
                                  setIndiceSelecionado(-1);
                                }}
                              >
                                {c.codigo} - {c.nome}
                              </div>
                            ))}

                          </div>
                        )}

                    </div>
                 <input
                  className={`border rounded p-2 text-right font-semibold ${
                    saldo > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                   value={saldoLinhaAtual.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    })}
                  disabled
                />
                 <div className="flex items-center justify-center">
                  <button
                        className="text-gray-400 hover:text-red-600 text-lg"
                        onClick={() => setMostrarNovaLinha(false)}
                      >
                        🗑
                      </button>
                </div>     

                </div>)}

          {/* BOTÕES */}

           <div className="flex justify-end gap-3 mt-4">

         

                <button
                    onClick={adicionarLinha}
                  className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-white
                        bg-gradient-to-b from-gray-500 via-gray-600 to-gray-800
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-95
                        transition-all duration-200
                        inline-flex items-center gap-2
                    ">
                        
                    + Linha
                </button>

                <button
                    onClick={salvarLancamentos}
                
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
                        
                    💾 Salvar
                </button>

                <button
                    onClick={() => navigate(-1)}
                    
                 className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-white
                        bg-gradient-to-b from-gray-500 via-gray-600 to-gray-800
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-95
                        transition-all duration-200
                        inline-flex items-center gap-2
                    ">
                        
                    Voltar Consulta
                </button>
                
                 
                <button
                    onClick={() => setModalContaAberto(true)}
                     className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-white
                        bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-800
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-95
                        transition-all duration-200
                        inline-flex items-center gap-2
                    "> 
                    + Nova Conta
                </button>




                </div>
      
        </div>
      </div>
 
  <ModalBase
  open={modalContaAberto}
  onClose={() => setModalContaAberto(false)}
  title="Nova Conta Contábil"
>
    <FormContaContabilModal
      empresa_id={empresa_id}
      onSuccess={() => {
        setModalContaAberto(false);
        carregarContas();
      }}
      onCancel={() => setModalContaAberto(false)}
    />
  </ModalBase>
 
    </div>
  );
}