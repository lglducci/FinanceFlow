 import { useState, useEffect } from "react";
import { explicarLancamento } from "../../helpers/contabilHelperCtb";
 

export default function PartidaDobrada() {

  const [tipoEvento, setTipoEvento] = useState("");
  const [tipoES, setTipoES] = useState("");
  const [classificacao, setClassificacao] = useState("");
  
  const regras = {
    receber: {
      tipoES: ["entrada"],
      classificacao: ["receita"]
    },
    receber_cartao: {
      tipoES: ["entrada"],
      classificacao: ["receita"]
    },
    pagar: {
      tipoES: ["saida"],
      classificacao: ["despesa", "custo", "imobilizado"]
    },
    cartao_compra: {
      tipoES: ["saida"],
      classificacao: ["despesa", "custo", "imobilizado"]
    },
    financeiro: {
      tipoES: ["entrada", "saida"],
      classificacao: ["receita", "despesa", "passivo", "ativo"]
    }
  };
 
  const tipoESOptions = regras[tipoEvento]?.tipoES || [];
  const classOptions = regras[tipoEvento]?.classificacao || [];

  const explicacao = explicarLancamento(tipoEvento, tipoES, classificacao);

  useEffect(() => {
    if (!tipoEvento) return;

    const regra = regras[tipoEvento];

    if (regra?.tipoES?.length === 1) {
      setTipoES(regra.tipoES[0]);
    }

  }, [tipoEvento]);

  function tipoPorClassificacao(classificacao) {
  const mapa = {
    receita: "RECEITA",
    despesa: "DESPESA",
    custo: "CUSTO",
    ativo: "ATIVO",
    passivo: "PASSIVO",
    imobilizado: "ATIVO"
  };

  return mapa[classificacao] || null;
}

function montarExplicacaoAvancada(tipoEvento, tipoES, classificacao) {
  if (!tipoEvento || !tipoES || !classificacao) return null;

  const tipo = tipoPorClassificacao(classificacao);

  if (!tipo) return null;

  const textos = {
    ATIVO: "Representa bens e direitos da empresa (caixa, bancos, estoque).",
    PASSIVO: "Representa obrigações e dívidas.",
    PL: "Representa o patrimônio dos sócios.",
    RECEITA: "Representa ganhos da empresa.",
    CUSTO: "Representa custos da operação.",
    DESPESA: "Representa gastos operacionais."
  };

  let explicacaoMovimento = "";

  // 🔥 lógica de negócio
  if (tipoEvento === "receber") {
    explicacaoMovimento = "Venda a prazo: cliente passa a dever.";
  }

  if (tipoEvento === "pagar") {
    explicacaoMovimento = "Compra a prazo: empresa assume obrigação.";
  }

  if (tipoEvento === "financeiro") {
    explicacaoMovimento = "Movimento interno financeiro.";
  }

  return {
    titulo: "💡 Movimento contábil",
    texto: `
Classificação: ${tipo}

${textos[tipo]}

${explicacaoMovimento}
`
  };
}

const explicacaoAvancada = montarExplicacaoAvancada(
  tipoEvento,
  tipoES,
  classificacao
);

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold text-blue-800">
        📘 Explicador Contábil (Partida Dobrada)
      </h1>

      <div className="grid grid-cols-3 gap-4">

        {/* Tipo operação */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-sm text-gray-700">
            Tipo de operação
          </label>
          <select
            value={tipoEvento}
            onChange={(e) => {
              setTipoEvento(e.target.value);
              setTipoES("");
              setClassificacao("");
            }}
            className="border p-2 rounded w-full"
          >
           

            <option value="">Selecione</option>

            <optgroup label="Vendas">
            <option value="venda_prazo">Venda a prazo</option>
            <option value="venda_avista">Venda à vista</option>
            </optgroup>

            <optgroup label="Compras">
            <option value="compra_prazo">Compra a prazo</option>
            <option value="compra_avista">Compra à vista</option>
            </optgroup>

            <optgroup label="Financeiro">
            <option value="recebimento_cliente">Recebimento de cliente</option>
            <option value="pagamento_fornecedor">Pagamento fornecedor</option>
            <option value="transferencia_bancaria">Transferência bancária</option>
            </optgroup>

            <optgroup label="Sócios">
            <option value="aporte_socio">Aporte de sócio</option>
            <option value="retirada_socio">Retirada de sócio</option>
            </optgroup>

            <optgroup label="Outros">
            <option value="pagamento_imposto">Pagamento de imposto</option>
            <option value="emprestimo_entrada">Empréstimo recebido</option>
            <option value="emprestimo_pagamento">Pagamento de empréstimo</option>
            <option value="pro_labore">Pró-labore</option>
            <option value="depreciacao">Depreciação</option>
            <option value="ajuste_contabil">Ajuste contábil</option>
            </optgroup>
 

          </select>
        </div>

        {/*  
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-sm text-gray-700">
            Tipo de movimento
          </label>
          <select
            value={tipoES}
            onChange={(e) => setTipoES(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">Selecione</option>

            {tipoESOptions.includes("entrada") && (
              <option value="entrada">Entrada</option>
            )}

            {tipoESOptions.includes("saida") && (
              <option value="saida">Saída</option>
            )}
          </select>
        </div> Tipo movimento */}

   

      </div>

     {explicacao?.lancamentos && (
  <div className="bg-blue-50 p-5 rounded-xl border-l-4 border-blue-500 space-y-3">

    <div className="font-bold text-blue-800">
      📘 {explicacao.historico}
    </div>

    {explicacao.lancamentos.map((l, i) => (
      <div key={i} className="bg-white p-3 rounded border">

        {l.tipo && (
          <div className="font-semibold text-gray-700">
            {l.tipo}
          </div>
        )}

        <div><b>Débito:</b> {l.debito}</div>
        <div><b>Crédito:</b> {l.credito}</div>
        <div className="text-gray-600 text-sm">{l.texto}</div>

      </div>
    ))}

  </div>
)}
    

 
    </div>
  );
}