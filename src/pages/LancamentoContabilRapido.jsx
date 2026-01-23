import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";

export default function LancamentoContabilRapido() {
  const navigate = useNavigate();
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");
 const [historicoEditado, setHistoricoEditado] = useState(false);

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


  /* ================== LOAD CONTAS ================== */
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

  /* ================== LOAD MODELOS ================== */
  useEffect(() => {
    async function carregarModelos() {
      const r = await fetch(
        buildWebhookUrl("modelos", { empresa_id })
      );
      const j = await r.json();
      setModelos(j || []);
    }
    carregarModelos();
  }, [empresa_id]);

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

    try {
       
      setSalvando(true);

      await fetch(buildWebhookUrl("lancto_modelo"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          data_lancto: dataLancto,
          debito_id: contas.debito_id,
          credito_id: contas.credito_id,
          valor: Number(valor),
          historico,
        }),
      });

      // 🔥 LIMPA SÓ O NECESSÁRIO
      setValor("");
      setCreditoId("");

    } catch {
      alert("Erro ao salvar.");
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


  /* ================== UI ================== */
  return (
    <div className="max-w-2xl mx-auto p-2">
      
      <div className="min-h-screen py-6 px-4 bg-bgSoft"> 
      
      <div className="bg-[#061f4aff] rounded-xl p-3 mb-4 text-white text-center"> 

   
       
            <h2 className="text-2xl font-bold mb-6 text-center text-white"> 
          ⚡ Lançamento Contábil Rápido</h2>
  

      <div className="bg-white rounded-xl p-6 space-y-4">

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
    </div>
  );
}
