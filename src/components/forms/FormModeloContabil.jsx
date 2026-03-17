import { useState, useEffect } from "react";
import { buildWebhookUrl } from "../../config/globals"; // ajuste o caminho se necessário
import FormContaContabilModal from "./FormContaContabilModal";
import { determinarTipoOperacao } from "../../utils/determinarTipoOperacao";
import { explicarLancamento } from "../../helpers/contabilHelper";
import { useMemo } from "react";
import AutocompleteInput from "../AutocompleteInput";

export default function FormModeloContabil ({
  empresa_id,
  tipo_evento,   // NOVO
  lado,            // NOVO
   tipo_es ,
  classificacao,
  onSuccess,
  onCancel
}) {
  const [contas, setContas] = useState([]);
  const [debitoId, setDebitoId] = useState("");
  const [creditoId, setCreditoId] = useState("");
const [contasDebito, setContasDebito] = useState([]);
const [contasCredito, setContasCredito] = useState([]);
const tipo = tipo_evento || null;
const [modalContaAberto, setModalContaAberto] = useState(false);
 const [debitoTexto, setDebitoTexto] = useState(""); 
  const [creditoTexto, setCreditoTexto] = useState(""); 

 const [tipoInterno, setTipoInterno] = useState(tipo_evento || null);
 
 const helper = useMemo(() => {
  return explicarLancamento(tipo_evento, tipo_es, classificacao);
}, [tipo_evento, tipo_es, classificacao]);


// Se veio da tela pai (CP, CR etc)
useEffect(() => {
  if (tipo_evento) {
    setTipoInterno(tipo_evento);
  }
}, [tipo_evento]);

// Detecta automático somente se NÃO veio tipo_operacao
useEffect(() => {
  if (tipo_evento) return; // 👈 trava se veio da tela pai
  if (!debitoId || !creditoId) return;

  const contaDebito = [...contasDebito, ...contasCredito]
    .find(c => String(c.id) === String(debitoId));

  const contaCredito = [...contasDebito, ...contasCredito]
    .find(c => String(c.id) === String(creditoId));

  if (!contaDebito || !contaCredito) return;

  const tipo = determinarTipoOperacao(
    contaDebito.codigo,
    contaCredito.codigo
  );

  setTipoInterno(tipo);

}, [debitoId, creditoId, tipo_evento]);



console.log("Tipo detectado:", tipo);

  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    tipo_automacao: "FINANCEIRO_PADRAO",
    tipo_evento:tipo_evento
  });
 
  async function carregarContas() {

    console.log("tipo_evento:", tipo_evento);
    console.log("typeof:", typeof tipo_evento);
    
    console.log("tipo:", tipo);

    if (!tipo || tipo === 'null') {
       

      const url = buildWebhookUrl("contas_contabeis_lancaveis", {
        empresa_id,
        tipo: null,
        lado: null,
        tipo_es:tipo_es  ,
        classificacao:classificacao 
      });

      const r = await fetch(url);
      const j = await r.json();
      setContasDebito(Array.isArray(j) ? j : []);
      setContasCredito(Array.isArray(j) ? j : []);
      return;
    }

    // DÉBITO
    const urlD = buildWebhookUrl("contas_contabeis_lancaveis", {
      
      empresa_id,
      tipo,
      lado: 'D',
      tipo_es:tipo_es  ,
      classificacao:classificacao 
    });
   
    const rD = await fetch(urlD);
    const jD = await rD.json();
    setContasDebito(Array.isArray(jD) ? jD : []);

    // CRÉDITO
    const urlC = buildWebhookUrl("contas_contabeis_lancaveis", {
      empresa_id,
      tipo,
      lado: 'C',
      tipo_es:tipo_es  ,
      classificacao:classificacao 
    });

    const rC = await fetch(urlC);
    const jC = await rC.json();
    setContasCredito(Array.isArray(jC) ? jC : []);
 }

 

useEffect(() => {
  if (empresa_id) carregarContas();
}, [empresa_id, tipo_evento, tipo_es, classificacao]);

  async function salvar() {
    try {
      const url = buildWebhookUrl("inseremodelo");

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          codigo: form.codigo,
          nome: form.nome,
          tipo: "FINANCEIRO_PADRAO",
          credito_id: creditoId,
          debito_id: debitoId,
          tipo_evento: tipoInterno, 
          classificacao   // 👈 ISSO AQUI
        }),
      });

      const texto = await resp.text();
      let json = null;

      try {
        json = JSON.parse(texto);
      } catch {
        alert("Erro inesperado no servidor.");
        return;
      }

      const item = Array.isArray(json) ? json[0] : json;

      if (item?.ok === false) {
        alert(item.message || "Erro ao salvar o modelo.");
        return;
      }

      alert("Modelo criado com sucesso!");
      onSuccess?.();

    } catch (e) {
      console.log("ERRO REQUEST:", e);
      alert("Erro de comunicação com o servidor.");
    }
  }


  function getHelperTexto(tipo) {
  switch (tipo) {
    case 'pagar':
      return "Conta a Pagar: o crédito deve ser Passivo (2.1.x) e o débito pode ser Estoque, Despesa ou Imobilizado.";
    case 'receber':
      return "Conta a Receber: o débito deve ser Clientes (1.1.x) e o crédito Receita (5.x).";
    case 'financeiro':
      return "Movimento de Caixa: envolve Banco/Caixa e baixa de Cliente ou Fornecedor.";
    case 'cartao_compra':
      return "Imobilizado: débito em 1.2.x (bem durável) e crédito em Fornecedores (2.1.x).";
    default:
      return "Selecione as contas conforme sua estrutura contábil.";
  }
}


function descricaoTipo(tipo) {
  switch (tipo) {
    case "pagar":
      return "Conta a Pagar (Passivo)";
    case "receber":
      return "Conta a Receber (Receita)";
    case "financeiro":
      return "Movimento de Caixa / Transferência";
   
    case "receber_cartao":
      return "Receitas no Cartão de Credito";
       case "cartao_compra":
      return "Compra no Cartão de Crédito";
    default:
      return "";
  }
}


  return (
    <div className="p-4 space-y-6">
       

        {/* <div className="text-sm bg-blue-150 p-2 rounded mb-3 text-gray-700 font-semibold">
          💡 {getHelperTexto(tipo_evento)}
        </div> */}

    {/*}    <div className="mt-2 mb-4 text-xs bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-slate-800">
          <div><b>tipo_evento:</b> {tipo_evento ?? "null"}</div> 
          <div><b>tipo_es:</b> {tipo_es ?? "null"}</div>
          <div><b>classificacao:</b> {classificacao ?? "null"}</div>
        </div>*/}
      

      {helper && (
          <div className="mt-2 mb-4 text-sm bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-slate-800 font-semibold">

         {/*} <div><b>Evento:</b> {tipo_evento}</div>
          <div><b>Tipo:</b> {tipo_es}</div>
          <div><b>Classificação:</b> {classificacao}</div>*/}

          <hr className="my-2"/> 
          <div><b>Débito:</b> {helper.debito}</div>
          <div><b>Crédito:</b> {helper.credito}</div> 
          <div className="mt-1 text-slate-600">
          {helper.texto}
          </div>

          </div>
          )}


      <input
        type="text"
        className="input-premium"
        placeholder="Código (Token)"
        value={form.codigo}
        onChange={(e) =>
          setForm((f) => ({ ...f, codigo: e.target.value }))
        }
      />
          <div className="text-xs text-gray-600 mb-1 bg-blue-50 p-1 round">
            💡 O token representa o template de reuso da partida dobrada contábil. 
            Exemplo: <b>CMV_MERCADORIA</b>, <b>ESTOQUE</b>, <b>TRANS_CONTA</b>.
            </div> 
      <input
        type="text"
        className="input-premium mb-3"
        placeholder="Nome"
        value={form.nome}
        onChange={(e) =>
          setForm((f) => ({ ...f, nome: e.target.value }))
        }
      />  

         <label className="flex items-center  text-sm font-bold text-[#061f4aff] relative">
                  Entrada (Débito)  
             </label>

       <AutocompleteInput
            value={debitoTexto}
            options={contasDebito}
            placeholder="Conta Débito"
            onChange={(v) => {
              setDebitoTexto(v);
              setDebitoId(null); // limpa seleção se digitou
            }}
            onSelect={(c) => {
              setDebitoTexto(c.nome);
              setDebitoId(c.id);
            }}
          />

        {/* <button
            type="button"
            onClick={() => setModalContaAberto(true)}
            className="text-green-600 text-sm font-semibold"
          >
            + Nova Conta Contábil
          </button>*/}

          <label className="flex items-center gap-1 text-sm font-bold text-[#061f4aff]   relative">
                    Saida (Crédito)
            </label>
              <AutocompleteInput
          value={creditoTexto}
          options={contasCredito}
          placeholder="Conta Crédito"
          onChange={(v) => {
            setCreditoTexto(v);
            setCreditoId(null); // limpa seleção ao digitar
          }}
          onSelect={(c) => {
            setCreditoTexto(c.nome);
            setCreditoId(c.id);
          }}
        />
         {/* <button
            type="button"
            onClick={() => setModalContaAberto(true)}
            className="text-green-600 text-sm font-semibold"
          >
            + Nova Conta Contábil
          </button>*/}
      

              <input
            type="text"
            className="input-premium mb-3"
            value={descricaoTipo(tipoInterno)}
            readOnly
          />
 

      <div className="flex gap-3">
        <button
          onClick={salvar}
          className="flex-1 bg-[#061f4a] text-white rounded-lg py-2 font-bold"
        >
          Salvar
        </button>

        <button
          onClick={onCancel}
          className="flex-1 bg-gray-500 text-white rounded-lg py-2 font-bold"
        >
          Cancelar
        </button>

        
        <button
            type="button"
            onClick={() => setModalContaAberto(true)}
             className="flex-1 bg-green-700 text-white rounded-lg py-2 font-bold"
          >
            + Nova Conta  
          </button>
          
      </div>

      {modalContaAberto && (
  <FormContaContabilModal
    empresa_id={empresa_id}
    onSuccess={() => {
      setModalContaAberto(false);
      carregarContas(); // recarrega dropdown
    }}
    onCancel={() => setModalContaAberto(false)}
  />
)}
    </div>
  );
}
