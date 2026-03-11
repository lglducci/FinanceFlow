import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import ModalBase from "../components/ModalBase";

import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
import FormContaContabilModal from "../components/forms/FormContaContabilModal"; 
import  FormModeloContabil from "../components/forms/FormModeloContabil"; 

export default function LancamentoContabilRapido() {
  const navigate = useNavigate();
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");
 const [historicoEditado, setHistoricoEditado] = useState(false);

 
 const [modalContaContabil, setModalContaContabil] = useState(false);

 const [modalModelo, setModalModelo] = useState(false);
const [contasContabeis, setContasContabeis] = useState([]);


  /* ================== STATES ================== */
  const [usarModelo, setUsarModelo] = useState(false);

  const [contas, setContas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [linhasModelo, setLinhasModelo] = useState([]);

  const [debitoId, setDebitoId] = useState("");
  const [creditoId, setCreditoId] = useState("");

  const [modeloCodigo, setModeloCodigo] = useState("");
  const [modeloSelecionado, setModeloSelecionado] = useState(null);

  const [valor, setValor] = useState("");
  const [historico, setHistorico] = useState("");
  const [dataLancto, setDataLancto] = useState(hojeLocal());
  const [salvando, setSalvando] = useState(false); 
  
const [debitoConta, setDebitoConta] = useState(null);
const [creditoConta, setCreditoConta] = useState(null);


const [debitoTexto, setDebitoTexto] = useState("");
 
const [creditoTexto, setCreditoTexto] = useState("");
const [vencimento, setVencimento] = useState(hojeMaisDias(1));

const [lembrar, setLembrar] = useState(false);
 const hoje =  hojeMaisDias(1);
 
const [campoOrigemConta, setCampoOrigemConta] = useState(null); 
// "debito" ou "credito"

// 🔥 Helper de consistência (alerta, não bloqueia)
const [helperMsg, setHelperMsg] = useState(null); 
// helperMsg = null ou { titulo: string, mensagem: string }


 

 useEffect(() => {
  if (!empresa_id) return;

  carregarModelos();
}, [empresa_id]);

async function carregarModelos() {
  try {
    const url = buildWebhookUrl("modelos", {
      empresa_id,
      tipo_evento: "",
      sistema: false,
      classificacao: ""
    });

    console.log("URL:", url);

    const r = await fetch(url);

    if (!r.ok) {
      throw new Error(`HTTP ${r.status}`);
    }

    const j = await r.json();

    console.log("RETORNO:", j);

    setModelos(Array.isArray(j) ? j : []);
  } catch (e) {
    console.error("Erro ao carregar modelos:", e);
    setModelos([]);
  }
}
 
 
  /* ================== SELECIONAR MODELO ================== */
  async function selecionarModelo(token) {
    setModeloCodigo(token);

    const m = modelos.find((x) => x.codigo === token);
    setModeloSelecionado(m);
    if (!m) return;

    setHistorico(m.nome); // 🔥 histórico automático

    const r = await fetch(
      buildWebhookUrl("modelos_linhas", {
        empresa_id,
        modelo_id: m.id,
      })
    );
    const j = await r.json();
    setLinhasModelo(j || []);
  


const linhas = j || [];
setLinhasModelo(linhas);

// 🔹 identificar débito e crédito
const linhaDeb = linhas.find(l => l.dc === "D");
const linhaCred = linhas.find(l => l.dc === "C");

const nomeDeb = linhaDeb?.nome;
const nomeCred = linhaCred?.nome;
  
// 🔹 montar histórico automático
const histAuto = montarHistoricoPorNomes(nomeDeb, nomeCred);
 
 if (histAuto) {
  setHistorico(histAuto);
} 

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

 
function montarHistoricoPorNomes(nomeDeb, nomeCred) {
  if (!nomeDeb && !nomeCred) return "";
  if (nomeDeb && !nomeCred) return `Movimento em ${nomeDeb}`;
  if (!nomeDeb && nomeCred) return `Movimento – origem ${nomeCred}`;

  return `Movimento em ${nomeDeb} – origem ${nomeCred}`;
}



  /* ================== RESOLVER D/C ================== */
  function resolverDebitoCredito() {
    if (!usarModelo) {
      return {
        debito_id: Number(debitoId),
        credito_id: Number(creditoId),
      };
    }

    let d = null;
    let c = null;

    for (const l of linhasModelo) {
      if (l.dc === "D") d = l.conta_id;
      if (l.dc === "C") c = l.conta_id;
    }

    if (!d || !c) {
      throw new Error("Modelo inválido (D/C não encontrado).");
    }

    return { debito_id: d, credito_id: c };
  }

  /* ================== SALVAR ================== */
 async function salvar() {
  // 🔎 validações básicas
  if (!valor || Number(valor) <= 0) {
    alert("Valor inválido.");
    return;
  }

  if (!historico) {
    alert("Histórico obrigatório.");
    return;
  }

  let contas;
  try {
    contas = resolverDebitoCredito();
  } catch (e) {
    alert(e.message);
    return;
  }

  if (contas.debito_id === contas.credito_id) {
    alert("Débito e crédito não podem ser iguais.");
    return;
  }

  setSalvando(true);

  try {
    const res = await fetch(buildWebhookUrl("lancto_modelo"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        data_lancto: dataLancto,
        debito_id: contas.debito_id,
        credito_id: contas.credito_id,
        valor: Number(valor),
        historico,
        lembrar,
        vencimento
      }),
    });

    // 🧱 lê sempre como texto (NUNCA quebra)
    const raw = await res.text();

    let json = null;
    try {
      json = raw ? JSON.parse(raw) : null;
    } catch {
      // não é JSON, segue com raw
    }

    // 🔴 erro retornado pelo backend ou HTTP
    if (!res.ok || (json && json.ok === false)) {
      const msg =
        (json && (json.details || json.message)) ||
        raw ||
        `Erro HTTP ${res.status}`;

      alert(msg);
      return; // ⛔ NÃO limpa campos
    }

    // ✅ sucesso: só limpa aqui
    setValor("");
    setCreditoId("");
    setCreditoTexto("");
    setCreditoConta(null);

  } catch (e) {
    // ❌ erro REAL (rede, CORS, URL errada, n8n fora)
    alert("Falha de comunicação com o servidor.");
  } finally {
    setSalvando(false);
  }
}



  function tipoContaPorCodigo(codigo) {
  if (!codigo) return null;

  const raiz = codigo.split(".")[0];

  const mapa = {
    "1": { tipo: "ATIVO",    natureza: "D" },
    "2": { tipo: "PASSIVO",  natureza: "C" },
    "3": { tipo: "PL",       natureza: "C" },
    "4": { tipo: "RECEITA",  natureza: "C" },
    "5": { tipo: "CUSTO",    natureza: "D" },
    "6": { tipo: "DESPESA",  natureza: "D" }
  };

  return mapa[raiz] || null;
}


 function explicacaoConta(codigo) {
  const regra = tipoContaPorCodigo(codigo);
  if (!regra) return null;

  const textos = {
    ATIVO: "(ATIVO). Representa bens e direitos da empresa (caixa, bancos, estoque). Não afeta o DRE.",
    PASSIVO: "(PASSIVO). Representa obrigações e dívidas da empresa. Não afeta o DRE.",
    PL: "(PL). Representa o patrimônio dos sócios e resultados acumulados. Não afeta o DRE.",
    RECEITA: "(RECEITA). Representa ganhos da empresa. Impacta positivamente o resultado.",
    CUSTO: "(CUSTO). Representa custos diretamente ligados à produção/venda. Reduz o resultado DRE.",
    DESPESA: "(DESPESA). Representa gastos operacionais. Reduz o resultado DRE."
  };

  return {
    tipo: regra.tipo,
    natureza: regra.natureza,
    texto: textos[regra.tipo]
  };
}

  function explicacaoContatooltip(codigo) {
  if (!codigo) return null;

  const raiz = codigo.split(".")[0];

  const mapa = {
    "1": "ATIVO → Débito AUMENTA o ativo",
    "2": "PASSIVO → Débito DIMINUI o passivo",
    "3": "PATRIMÔNIO LÍQUIDO → Débito DIMINUI o PL",
    "4": "RECEITA → Débito DIMINUI a receita",
    "5": "CUSTO → Débito AUMENTA o custo",
    "6": "DESPESA → Débito AUMENTA a despesa"
  };

  return mapa[raiz] || "Tipo de conta não identificado";
}



function explicacaoContaCredito(codigo) {
  if (!codigo) return null;

  const raiz = codigo.split(".")[0];

  const mapa = {
    "1": "ATIVO → Crédito DIMINUI o ativo",
    "2": "PASSIVO → Crédito AUMENTA o passivo",
    "3": "PATRIMÔNIO LÍQUIDO → Crédito AUMENTA o PL",
    "4": "RECEITA → Crédito AUMENTA a receita",
    "5": "CUSTO → Crédito DIMINUI o custo",
    "6": "DESPESA → Crédito DIMINUI a despesa"
  };

  return mapa[raiz] || "Tipo de conta não identificado";
}


function getContaById(id) {
  const n = Number(id);
  if (!n) return null;
  return contas.find((c) => Number(c.id) === n) || null;
}

function limparNomeConta(nome) {
  return (nome || "").trim();
}

useEffect(() => {
  // só tenta validar quando os IDs existirem
  const deb = getContaById(debitoId);
  const cred = getContaById(creditoId);

  const msg = avaliarLancamento(deb, cred);
  setHelperMsg(msg);
}, [debitoId, creditoId, contas]);



function montarHistorico(debitoId, creditoId) {
  const deb = getContaById(debitoId);
  const cred = getContaById(creditoId);

  const nomeDeb = limparNomeConta(deb?.nome);
  const nomeCred = limparNomeConta(cred?.nome);

  if (!nomeDeb && !nomeCred) return "";
  if (nomeDeb && !nomeCred) return `Movimento em ${nomeDeb}`;
  if (!nomeDeb && nomeCred) return `Origem ${nomeCred}`;

  return `Movimento em ${nomeDeb} – origem ${nomeCred}`;
}
 
function avaliarLancamento(deb, cred) {
  if (!deb || !cred) return null;

  const regraDeb = tipoContaPorCodigo(deb.codigo);
  const regraCred = tipoContaPorCodigo(cred.codigo);

  if (!regraDeb || !regraCred) return null;

  const d = regraDeb.tipo;
  const c = regraCred.tipo;

  const debNome = `${deb.codigo} - ${deb.nome}`;
  const credNome = `${cred.codigo} - ${cred.nome}`;

  function isEstoque(conta) {
  if (!conta) return false;
  const codigo = conta.codigo || "";
  const nome = (conta.nome || "").toLowerCase();
  return codigo.startsWith("1.2.2") || nome.includes("estoque");
}

  // 1️⃣ ATIVO → PASSIVO
  if (d === "ATIVO" && c === "PASSIVO") {
    return {
      titulo: "⚠️ ATIVO → PASSIVO",
      mensagem:
        `Você está debitando um ATIVO (${debNome}) e creditando um PASSIVO (${credNome}). ` +
        `Isso normalmente representa empréstimo ou financiamento. Confira se esta é a intenção.`
    };
  }

  // 2️⃣ PASSIVO → ATIVO
  if (d === "PASSIVO" && c === "ATIVO") {
    return {
      titulo: "ℹ️ Pagamento de dívida?",
      mensagem:
        `Este lançamento parece pagamento ou baixa de obrigação (${debNome} → ${credNome}). ` +
        `Se não for quitação de dívida, revise.`
    };
  }

  // 3️⃣ DESPESA → DESPESA
  if (d === "DESPESA" && c === "DESPESA") {
    return {
      titulo: "⚠️ Despesa contra despesa",
      mensagem:
        `Normalmente indica reclassificação ou ajuste interno de despesas.`
    };
  }

  // 4️⃣ RECEITA → RECEITA
  if (d === "RECEITA" && c === "RECEITA") {
    return {
      titulo: "⚠️ Receita contra receita",
      mensagem:
        `Este tipo de lançamento é raro e costuma ocorrer apenas em estornos ou ajustes.`
    };
  }

  // 5️⃣ RECEITA → ATIVO
  if (d === "RECEITA" && c === "ATIVO") {
    return {
      titulo: "⚠️ Receita debitada",
      mensagem:
        `Receitas normalmente aumentam no crédito. ` +
        `Verifique se este lançamento não deveria ser invertido.`
    };
  }

  // 6️⃣ ATIVO → RECEITA
  if (d === "ATIVO" && c === "RECEITA") {
    return {
      titulo: "ℹ️ Entrada de receita",
      mensagem:
        `Entrada direta de receita em ativo (caixa/banco). ` +
        `Caso a venda tenha sido a prazo, cartão ou boleto, avalie se deveria passar por clientes ou contas a receber.`
    };
  }

  // 7️⃣ ATIVO → ATIVO
  if (d === "ATIVO" && c === "ATIVO") {
    return {
      titulo: "ℹ️ Transferência interna",
      mensagem:
        `Este lançamento parece uma transferência entre contas do ativo (ex: caixa ↔ banco).`
    };
  }

  // 8️⃣ PASSIVO → PASSIVO
  if (d === "PASSIVO" && c === "PASSIVO") {
    return {
      titulo: "ℹ️ Reclassificação de dívida",
      mensagem:
        `Lançamento entre passivos normalmente indica renegociação ou reclassificação de obrigação.`
    }; 
  }

  
   // 9️⃣ ATIVO → PL
if (d === "ATIVO" && c === "PL") {
  return {
    titulo: "ℹ️ Movimento patrimonial",
    mensagem:
      `Entrada no ativo (${debNome}) com origem no Patrimônio Líquido (${credNome}). ` +
      `Normalmente indica aporte de capital, ajuste de saldo inicial ou correção patrimonial.`
  };
}

// 🔟 CUSTO/DESPESA → ATIVO(ESTOQUE)
if (
  (d === "CUSTO" || d === "DESPESA") &&
  c === "ATIVO" &&
  isEstoque(creditoConta)
) {
  return {
    titulo: "⚠️ Regra — Estoque não é origem",
    mensagem:
      `Você está debitando ${d} (${debNome}) e creditando ESTOQUE (${credNome}). ` +
      `Esse par só faz sentido com um evento real (venda/consumo/perda/ajuste). ` +
      `O estoque não é a origem do custo; ele é apenas a contrapartida. ` +
      `Ajuste o histórico para refletir o evento (ex: "CMV por venda", "consumo", "perda/ajuste de inventário").`
  }; 
  
}

if ((d === "ATIVO" || d === "PASSIVO" || d === "PL") && (c === "CUSTO" || c === "DESPESA")) {
  return {
    titulo: "⚠️ Custo ou despesa no crédito",
    mensagem:
      `Você está creditando uma conta de ${c} (${credNome}), o que é incomum. ` +
      `Custo e despesa normalmente são debitadas, exceto em estornos ou reclassificações. ` +
      `Verifique se há erro de sinal ou inversão de contas.`
  };
}


  return null;
}


/* ================== UI ================== */
  return (
    <div className="max-w-2xl mx-auto p-2">
      
      <div className="min-h-screen py-6 px-4 bg-bgSoft"> 
      
      <div className="bg-[#061f4aff] rounded-xl p-3 mb-4 text-white text-center"> 

   
       
            <h2 className="text-2xl font-bold mb-6 text-center text-white"> 
          ⚡ Lançamento Contábil Rápido</h2>
  

      <div className="bg-white rounded-xl p-6 space-y-4">

        {helperMsg && (
                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-900 rounded-lg p-3 text-sm">
                      <div className="font-bold mb-1">{helperMsg.titulo}</div>
                      <div>{helperMsg.mensagem}</div>
                    </div>
                  )}

        {/* MODO */}
        <label className="flex items-center gap-2 font-bold text-[#1e40af]">
          <input
            type="checkbox"
            checked={usarModelo}
            onChange={(e) => setUsarModelo(e.target.checked)}
          />
          Usar modelo (token)
        </label>

        {/* TOKEN */}
         <div className="flex items-center gap-2"> 
        {usarModelo && (
          <input
            list="tokens"
            className="input-premium"
            placeholder="Token do modelo"
            value={modeloCodigo}
            onChange={(e) => selecionarModelo(e.target.value)}
          />
        )}
        <datalist id="tokens">
          {modelos.map((m) => (
            <option key={m.id} value={m.codigo} />
          ))}
        </datalist>
          {usarModelo && ( 
            
              <div className="relative group"> 
              <button
              type="button"
              onClick={() => {
                console.log("CLICOU MODELO");
                setModalModelo(true);
              }}
               className="w-8 h-8 flex items-center justify-center rounded bg-[#061f4a] text-white text-sm"
            >
              ➕  
            </button> 
            <div className="
                        absolute left-1/2 -translate-x-1/2 top-10
                        hidden group-hover:block
                        bg-black text-white text-xs
                        px-2 py-1 rounded
                        whitespace-nowrap
                        z-50
                      ">
                      Adicionar Modelo
                    </div>
                   
            
             </div>) }  
            </div>

                      {/* ================= BLOCO MODELO (SÓ SE TOKEN) ================= */}
              {usarModelo && modeloSelecionado && (
                <div className="space-y-3">

                  <div className="bg-gray-300 text-[#003ba2] p-3 rounded font-bold">
                    Nome: {modeloSelecionado.nome}
                  </div>

                  <table className="tabela tabela-mapeamento w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-900 text-white">
                        <th>ID</th>
                        <th>Conta</th>
                        <th>Nome</th>
                        <th>Tipo</th>
                        <th>Natureza</th>
                        <th>D/C</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linhasModelo.map((l, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? "bg-gray-100" : "bg-gray-200"}
                        >
                          <td   className="text-[#061f4aff]">{l.conta_id}</td>
                          <td className="text-[#061f4aff]">{l.codigo}</td>
                          <td className="text-[#061f4aff]">{l.nome}</td>
                          <td className="text-[#061f4aff]">{l.tipo}</td>
                          <td className="text-[#061f4aff]">{l.natureza}</td>
                          <td className="font-bold text-[#061f4aff]">{l.dc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>
              )}


        {/* MANUAL */}
        {!usarModelo && (
          <>
          <div className="mb-4">  

              <label className="flex items-center gap-2 text-sm font-bold text-[#061f4aff] mb-1 relative">
                  Entrada (Débito)

                  {debitoId && (
                    <div className="group relative">
                      {/* ÍCONE */}
                      <span
                        className="inline-flex items-center justify-center
                                  w-5 h-5 rounded-full
                                  bg-[#061f4a] text-white
                                  text-xs font-bold cursor-pointer"
                      >
                        ?
                      </span>

                      {/* TOOLTIP */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 top-7
                                  hidden group-hover:block
                                  bg-black text-white text-xs
                                  px-3 py-2 rounded-lg
                                  whitespace-nowrap z-50 shadow-lg"
                      >
                        {explicacaoContatooltip(
                          contas.find(c => c.id == debitoId)?.codigo
                        )}
                      </div>
                    </div>
                  )}
                </label>
 
               
             <div className="flex items-center gap-2"> 
             <input
                list="contasDebito"
                className="input-premium"
                placeholder="Digite código ou nome da conta"
                value={debitoTexto}
                onChange={(e) => {
                  const texto = e.target.value;
                  setDebitoTexto(texto);

                  // 🔍 resolve conta pelo código digitado
                  const conta = contas.find(
                    c => `${c.codigo} - ${c.nome}` === texto
                        || c.codigo === texto
                  );

                  if (conta) {
                    setDebitoId(conta.id);          // ID interno
                    setDebitoConta(conta);          // objeto completo

                    const novoHist = montarHistorico(conta.id, creditoId);
                    if (novoHist) setHistorico(novoHist);
                  }
                }}
              />

              <datalist id="contasDebito">
                {contas.map((c) => (
                  <option
                    key={c.id}
                    value={`${c.codigo} - ${c.nome}`}
                  />
                ))}
              </datalist>  

            <div className="flex items-center gap-2">
              <div className="flex-1">
                {/* seu input + datalist aqui (igual acima) */}
              </div>

              <div className="relative group">
                    <button
                      type="button"
                      onClick={() => {
                        setCampoOrigemConta("debito");
                        setModalContaContabil(true);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded bg-[#061f4a] text-white text-sm"
                    >
                      +
                    </button>

                    <div className="
                        absolute left-1/2 -translate-x-1/2 top-10
                        hidden group-hover:block
                        bg-black text-white text-xs
                        px-2 py-1 rounded
                        whitespace-nowrap
                        z-50
                      ">
                      Adicionar nova conta
                    </div>
                   
                  </div>  
             </div> 
           
            </div>
               {debitoConta && (
              <div className="mt-1 text-xs text-blue-900  bg-yellow-100 p-2 rounded">
                📌 {explicacaoConta(debitoConta.codigo)?.texto}
              </div>
            )}  

            </div>
            
            <div className="mb-4">
             
              <label className="flex items-center gap-2 text-sm font-bold text-[#061f4aff] mb-1 relative">
                    Saida (Crédito)

                    {creditoId && (
                      <div className="group relative">
                        {/* ÍCONE */}
                        <span
                          className="inline-flex items-center justify-center
                                    w-5 h-5 rounded-full
                                    bg-[#061f4a] text-white
                                    text-xs font-bold cursor-pointer"
                        >
                          ?
                        </span>

                        {/* TOOLTIP */}
                        <div
                          className="absolute left-1/2 -translate-x-1/2 top-7
                                    hidden group-hover:block
                                    bg-black text-white text-xs
                                    px-3 py-2 rounded-lg
                                    whitespace-nowrap z-50 shadow-lg"
                        >
                          {explicacaoContaCredito(
                            contas.find(c => c.id == creditoId)?.codigo
                          )}
                        </div>
                      </div>
                    )}
                  </label>
               
             <div className="flex items-center gap-2"> 
              <input
                  list="contasCredito"
                  className="input-premium"
                  placeholder="Digite código ou nome da conta"
                  value={creditoTexto}
                  onChange={(e) => {
                    const texto = e.target.value;
                    setCreditoTexto(texto);

                    // 🔍 resolve conta pelo texto digitado
                    const conta = contas.find(
                      c =>
                        `${c.codigo} - ${c.nome}` === texto ||
                        c.codigo === texto
                    );

                    if (conta) {
                      setCreditoId(conta.id);
                      setCreditoConta(conta);

                      const novoHist = montarHistorico(debitoId, conta.id);
                      if (novoHist) setHistorico(novoHist);
                    }
                  }}
                />

                <datalist id="contasCredito">
                  {contas.map((c) => (
                    <option
                      key={c.id}
                      value={`${c.codigo} - ${c.nome}`}
                    />
                  ))}
                </datalist> 
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => {
                        setCampoOrigemConta("credito");
                        setModalContaContabil(true);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded bg-[#061f4a] text-white text-sm"
                    >
                      +
                    </button>

                    <div className="
                        absolute left-1/2 -translate-x-1/2 top-10
                        hidden group-hover:block
                        bg-black text-white text-xs
                        px-2 py-1 rounded
                        whitespace-nowrap
                        z-50
                      ">
                      Adicionar nova conta
                    </div>
                  </div>

          </div>
             {creditoConta && (
              <div className="mt-1 text-xs text-blue-900 bg-yellow-100 p-2 rounded">
                📌 {explicacaoConta(creditoConta.codigo)?.texto}
              </div>
            )}
          </div>
          </>
        )}
           
        <div className="mb-4">
              <label className="block w-full text-left text-sm font-bold text-[#061f4aff] mb-1">
              Histórico
              </label>

        <input
          className="input-premium"
          placeholder="Histórico"
          value={historico}
          onChange={(e) => {
              setHistorico(e.target.value);
              setHistoricoEditado(true);
            }}
        />
         </div>

          <div className="mb-4">
              <label className="block w-full text-left text-sm font-bold text-[#061f4aff] mb-1">
              Valor
              </label>

        <input
          type="number"
          className="input-premium"
          placeholder="00,00"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
         </div>
 
        <div className="mb-4">
              <label className="block w-full text-left text-sm font-bold text-[#061f4aff] mb-1">
              Data Movimento
              </label>
        <input
          type="date"
          className="input-premium"
          value={dataLancto}
          onChange={(e) => setDataLancto(e.target.value)}
        /> 
         </div>



        {/* LEMBRETE */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="lembrar"
              checked={lembrar}
              onChange={(e) => setLembrar(e.target.checked)}
            />
            <label htmlFor="lembrar" className="text-sm font-semibold text-gray-700">
              Lembrar este lançamento
            </label>
          </div>

       {lembrar && (
            <div className="mb-4">
              <label className="block w-full text-left text-sm font-bold text-[#061f4aff] mb-1">
                Vencimento
              </label>
              <input
                type="date"
                className="input-premium"
                value={vencimento}
                min={hoje}
                onChange={(e) => setVencimento(e.target.value)}
              />
            </div>
          )}

           
        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full bg-[#061f4aff] text-white font-bold py-3 rounded"
        >
          {salvando ? "Salvando..." : "Salvar (Enter)"}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="w-full bg-gray-600 text-white font-bold py-2 rounded"
        >
          Voltar
        </button>

 
      </div>
       </div>
      </div>

      <ModalBase
          open={modalContaContabil}
          onClose={() => setModalContaContabil(false)}
          title="Nova Conta Contábil"
        >
           <FormContaContabilModal
              empresa_id={empresa_id}
              onSuccess={() => {
                setModalContaContabil(false);
                carregarContas(); // 🔥 REFRESH DO DROPDOWN
              }}
              onCancel={() => setModalContaContabil(false)}
            /> 
        </ModalBase>

        <ModalBase
          open={modalModelo}
          onClose={() => setModalModelo(false)}
          title="Novo Modelo"
        >
          <FormModeloContabil
            empresa_id={empresa_id}
            onSuccess={() => {
              setModalModelo(false);
              carregarModelos();
            }} 

            onCancel={() => setModalModelo(false)}
          />
        </ModalBase>

    </div>
  );
}
