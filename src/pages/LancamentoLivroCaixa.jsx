import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { useRef } from "react";

import ModalBase from "../components/ModalBase";
 
import FormConta from "../components/forms/FormConta";
 
 
export default function LancamentoLivroCaixa() {

  const [conta, setConta] = useState("");
  const [saldo, setSaldo] = useState(8965.32);
   const empresa_id = localStorage.getItem("empresa_id");
 const [contas, setContas] = useState([]);
 const [contasFiltradas, setContasFiltradas] = useState([]);
  const [linhas, setLinhas] = useState([]); 
  const [indiceSelecionado, setIndiceSelecionado] = useState(-1);
const [contaId, setContaId] = useState(null);
const historicoRef = useRef(null);
  const [modalConta, setModalConta] = useState(false);

  const [nova, setNova] = useState({
    data: "11/03/2026",
    historico: "",
    entrada: "",
    saida: "",
    contra: ""
  });
const navigate = useNavigate();
  function adicionarLinha() {

     if (!nova.historico && !nova.entrada && !nova.saida) {
  return;
}

    let valor = parseFloat(nova.entrada || nova.saida || 0);

    let novoSaldo = saldo;

    if (nova.entrada) novoSaldo += valor;
    if (nova.saida) novoSaldo -= valor;

    setSaldo(novoSaldo);

    setLinhas([
      ...linhas,
      { ...nova, saldo: novoSaldo }
    ]);

    setNova({
  data: nova.data,
  historico: "",
  entrada: "",
  saida: "",
  contra: ""
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


    function removerLinha(index) {

  const novaLista = [...linhas];

  const linhaRemovida = novaLista[index];
 

  let valor = parseFloat(nova.entrada || nova.saida);

if (isNaN(valor)) valor = 0;

  if (linhaRemovida.entrada) {
    setSaldo(saldo - valor);
  }

  if (linhaRemovida.saida) {
    setSaldo(saldo + valor);
  }

  novaLista.splice(index, 1);

  setLinhas(novaLista);

}

 async function salvarLancamentos() {

  if (linhas.length === 0) {
    alert("Nenhuma linha para salvar");
    return;
  }

  const lancamentos = linhas.map(l => ({
    data: l.data,
    historico: l.historico,
    valor: parseFloat((l.entrada || l.saida || "0").replace(",", ".")),
    tipo: l.entrada ? "entrada" : "saida",
    conta_contra: Number(l.conta_id)
  }));

  const payload = {
    empresa_id,
    conta_observada: contaId,
    lancamentos
  };

  const r = await fetch(
    buildWebhookUrl("lote_lancamentos"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  );

  await r.json();

  alert("Lançamentos salvos!");
  setLinhas([]);
}
  return (
    <div className="flex justify-center mt-10">

      <div className="bg-blue-900 rounded-xl p-2 w-[1400px]">

        <div className="bg-white rounded-lg p-4">

          <h2 className="text-lg font-bold mb-4">
            ⚡ Lançamento Contábil Inteligente
          </h2>

          {/* CONTA */}
          <label className="text-sm font-semibold">
            Conta observada
          </label>

          <div className="relative mb-4">

                    <input
                    className="w-full border rounded-lg p-2"
                    placeholder="Digite conta (ex: banco, caixa, 1.1...)"
                    value={conta}
                    onChange={(e)=>{
                        const v = e.target.value;
                        setConta(v);
                        filtrarContas(v);
                    }}
                    />

                    {contasFiltradas.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border rounded shadow max-h-40 overflow-y-auto z-50">

                        {contasFiltradas.map(c => (
                        <div
                            key={c.id}
                            className="p-2 hover:bg-gray-200 cursor-pointer"
                            onClick={()=>{

                            setConta(c.nome);
                            setContaId(c.id);

                            setContasFiltradas([]);

                            }}
                        >
                            {c.codigo} - {c.nome}
                        </div>
                        ))}

                    </div>
                    )}

                    </div>
          <div className="text-sm text-gray-600 mb-4">
            Saldo atual: <b>R$ {saldo.toFixed(2)}</b>
          </div>

          {/* TABELA */}
             {/* CABEÇALHO */}

                 <div className="grid grid-cols-[120px_1fr_120px_120px_220px_120px_60px] gap-2 text-sm font-semibold border-b pb-2 mb-2">
                <div>Data</div>
                <div>Histórico</div>
                <div className="text-right">Entrada</div>
                <div className="text-right">Saída</div>
                <div className="text-center">Contra Conta</div>
                <div className="text-right">Saldo</div>
                <div className="text-center">Ação</div>
                </div>

                {/* LINHAS */}

                {linhas.map((l, i) => (
                <div
                    key={i}
                     className="grid grid-cols-[120px_1fr_120px_120px_220px_120px_60px] gap-2 gap-2 text-sm border-b py-1"
                >
                    <div>{l.data}</div>
                    <div>{l.historico}</div>
                    <div className="text-right">{l.entrada}</div>
                    <div className="text-right">{l.saida}</div>
                    <div>{l.contra}</div>
                   <div className="text-right">
                    {Number(l.saldo).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                    })}
                    <div className="text-center"> 

                        </div>
 
                    </div>
                    
                         <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => removerLinha(i)}
                        >
                        🗑
                        </button>
                </div>
                ))}
          {/* NOVA LINHA */}

            <div className="grid grid-cols-[120px_1fr_120px_120px_220px_120px] gap-2 mb-4">

                <input
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

                <input
                className="border rounded p-2 text-right"
                placeholder="Entrada"
                value={nova.entrada}
                onChange={(e)=>setNova({...nova,entrada:e.target.value,saida:""})}
                />

                <input
                className="border rounded p-2 text-right"
                placeholder="Saída"
                value={nova.saida}
                onChange={(e)=>setNova({...nova,saida:e.target.value,entrada:""})}
                />
                <div className="relative">

                   <input
                    className="border rounded p-2 w-full"
                    placeholder="Contra conta"
                    value={nova.contra}
                    onChange={(e)=>{
                        const v = e.target.value;
                        setNova({...nova,contra:v});
                        filtrarContas(v);
                        setIndiceSelecionado(-1);
                    }}
                    onKeyDown={(e)=>{

                        if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setIndiceSelecionado(i =>
                            Math.min(i + 1, contasFiltradas.length - 1)
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

                        const c = contasFiltradas[indiceSelecionado];

                        setNova({
                            ...nova,
                            contra: c.nome,
                            conta_id: c.id
                        });

                        setContasFiltradas([]);
                        setIndiceSelecionado(-1);
                        }

                    }}
                    />
                     {contasFiltradas.map((c, i) => (
                    <div
                        key={c.id}
                        className={`p-2 cursor-pointer 
                        ${i === indiceSelecionado ? "bg-blue-200" : "hover:bg-gray-200"}`}
                        onClick={()=>{
                        setNova({...nova,contra:c.nome,conta_id:c.id});
                        setContasFiltradas([]);
                        setIndiceSelecionado(-1);
                        }}
                    >
                        {c.codigo} - {c.nome}
                    </div>
                    ))}

                    </div>
                 <input
                    className="border rounded p-2 bg-gray-100 text-right"
                    value={saldo.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                    })}
                    disabled
                    />
                    

                </div>

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
                        
                    Voltar
                </button>
                
                 
                <button
                    onClick={() => setModalConta(true)}
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
                  open={modalConta}
                  onClose={() => setModalConta(false)}
                  title="Nova Conta Financeira"
                >
                  <FormConta
                    empresa_id={empresa_id}
                    onSuccess={(novaConta) => {
                          console.log("RETORNO RAW:", novaConta);
                          carregarContas()
                          const conta = Array.isArray(novaConta)
                            ? novaConta[0]
                            : novaConta;
      
                          console.log("CONTA TRATADA:", conta);
      
                          setContas(prev => {
                            console.log("ANTES:", prev);
                            return [conta, ...prev];
                          });
      
                          setForm(prev => ({
                            ...prev,
                            conta_id: conta.id, // SEM String
                          }));
      
                          setModalConta(false);
                        }}
                    onCancel={() => setModalConta(false)}
                  />
                </ModalBase>
      
    </div>
  );
}