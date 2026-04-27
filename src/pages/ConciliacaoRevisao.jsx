import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function ConciliacaoRevisao() {
  const empresa_id = localStorage.getItem("empresa_id");
  const conta_id = localStorage.getItem("conta_id");

  const [linhas, setLinhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aviso, setAviso] = useState("");
const navigate = useNavigate();
  const [selecionados, setSelecionados] = useState([]);
// const [resultadoExecucao, setResultadoExecucao] = useState(() => {
 //const salvo = localStorage.getItem("resultado_conciliacao");
 // return salvo ? JSON.parse(salvo) : null;
//});

const [resultadoExecucao, setResultadoExecucao] = useState(null);
const [operacoesGeradas, setOperacoesGeradas] = useState([]);
const [mostrarOperacoes, setMostrarOperacoes] = useState(false);
const [loadingOperacoes, setLoadingOperacoes] = useState(false);

 
  async function carregarDados() {
    try {
      setLoading(true);

      const url = buildWebhookUrl("dados_importados", {
        empresa_id,
        conta_id,
      });

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const retorno = await resp.json();   

 const lista =
  Array.isArray(retorno?.[0]?.data)
    ? retorno[0].data
    : Array.isArray(retorno?.data)
      ? retorno.data
      : Array.isArray(retorno?.[0])
        ? retorno[0]
        : Array.isArray(retorno)
          ? retorno
          : [];

setLinhas(lista);


    } catch (e) {
  console.error(e);
  setLinhas([]);
} finally {
  setLoading(false);
}
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function statusClasse(situacao) {
    if (situacao === "ok") {
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    }

    return "bg-red-100 text-red-700 border-red-300";
  }


  function toggleSelecionado(id) {
  setSelecionados((prev) =>
    prev.includes(id)
      ? prev.filter((x) => x !== id)
      : [...prev, id]
  );
}
 
async function aceitarSelecionados(idsParam = null) {
  const idsParaEnviar = Array.isArray(idsParam)
    ? idsParam
    : idsParam
      ? [idsParam]
      : selecionados;

  if (idsParaEnviar.length === 0) {
    alert("Selecione ao menos uma linha.");
    return;
  }

  const idsNumeros = idsParaEnviar.map(Number);

  const url = buildWebhookUrl("aceitar_conciliacao", {
    empresa_id,
    conta_id,
  });

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empresa_id: Number(empresa_id),
      conta_id: Number(conta_id),
      ids: idsNumeros,
    }),
  });

  setLinhas((prev) =>
    prev.map((l) =>
      idsNumeros.includes(Number(l.id))
        ? {
            ...l,
            situacao: "ok",
            mensagem: "Aceito manualmente pelo usuário",
          }
        : l
    )
  );

  setSelecionados([]);
}

 async function executarConciliacao() {
  if (!confirm("Confirma executar a conciliação das linhas marcadas como OK?")) {
    return;
  }

  try {
    const url = buildWebhookUrl("execucao_conciliacao", {
      empresa_id,
      conta_id,
    });

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: Number(empresa_id),
        conta_id: Number(conta_id),
      }),
    });

    const retorno = await resp.json();

    const resultado =
      retorno?.[0]?.data?.[0]?.fn_executar_conciliacao ||
      retorno?.data?.[0]?.fn_executar_conciliacao ||
      retorno?.[0]?.fn_executar_conciliacao ||
      retorno?.fn_executar_conciliacao ||
      retorno;

    if (resultado?.ok === false) {
      alert(resultado.message || "Erro ao executar conciliação.");
      return;
    }

     localStorage.setItem("resultado_conciliacao", JSON.stringify(resultado));

   setResultadoExecucao(resultado);  
   setLinhas([]);
    setSelecionados([]);

  } catch (e) {
    console.error(e);
    alert("Erro ao executar conciliação.");
  }
}

function aceitarTodosCheckbox() {
  const pendentes = linhas.filter(
    (l) => l.situacao !== "ok" && l.situacao !== "executado" && l.importar !== false
  );

  if (pendentes.length === 0) {
    setAviso("Não há linhas pendentes para selecionar.");
    setTimeout(() => setAviso(""), 10000);
    return;
  }

  setSelecionados(pendentes.map((l) => l.id));

  setAviso(
    `Atenção: ${pendentes.length} linha(s) pendente(s) foram marcadas. Esta tela serve para revisar possíveis erros antes da conciliação.`
  );

  setTimeout(() => setAviso(""), 10000);
}

 function aceitarTodosCheckbox() {
  if (selecionados.length > 0) {
    setSelecionados([]);
    setAviso("Seleção removida.");
    setTimeout(() => setAviso(""), 10000);
    return;
  }

  const pendentes = linhas.filter(
    (l) =>
      l.situacao !== "ok" &&
      l.situacao !== "executado" &&
      l.importar !== false
  );

  if (pendentes.length === 0) {
    setAviso("Não há linhas pendentes para selecionar.");
    setTimeout(() => setAviso(""), 10000);
    return;
  }

  setSelecionados(pendentes.map((l) => l.id));

  setAviso(
    `Atenção: ${pendentes.length} linha(s) pendente(s) foram marcadas para revisão.`
  );

  setTimeout(() => setAviso(""), 10000);
}
 async function Reverter() {
  if (
    !confirm(
      "Confirma reverter todas as linhas OK ainda não executadas para pendente?\n\nLinhas já executadas não serão alteradas."
    )
  ) {
    return;
  }

  try {
    const url = buildWebhookUrl("reverter_conciliacao", {
      empresa_id,
      conta_id,
    });

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: Number(empresa_id),
        conta_id: Number(conta_id),
      }),
    });

    const data = await resp.json();

    if (data?.ok === false) {
      alert(data.message || "Erro ao reverter.");
      return;
    }

    setLinhas((prev) =>
      prev.map((l) =>
        l.situacao === "ok"
          ? {
              ...l,
              situacao: "pendente",
              mensagem: "Revertido manualmente para revisão",
            }
          : l
      )
    );

    setSelecionados([]);
  } catch (e) {
    console.error(e);
    alert("Erro ao reverter conciliação.");
  }
}

async function rejeitarLinha(id) {
  if (!confirm("Confirma rejeitar esta linha da conciliação?")) return;

  const url = buildWebhookUrl("rejeitar_conciliacao", {
    empresa_id,
    conta_id,
  });

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empresa_id: Number(empresa_id),
      id: Number(id),
    }),
  });

  setLinhas((prev) =>
    prev.map((l) =>
      Number(l.id) === Number(id)
        ? {
            ...l,
            importar: false,
            situacao: "rejeitado",
            mensagem: "Rejeitado manualmente pelo usuário",
          }
        : l
    )
  );
}


function statusClasse(situacao) {
  if (situacao === "ok") {
    return "bg-emerald-100 text-emerald-700 border-emerald-300";
  }

  if (situacao === "executado") {
    return "bg-blue-100 text-blue-700 border-blue-300";
  }

  if (situacao === "rejeitado") {
    return "bg-red-100 text-red-700 border-red-300";
  }

  return "bg-blue-100 text-blue-700 border-blue-300";
}

const podeExecutar =
  linhas.length > 0 &&
  linhas.every((l) =>
    ["ok", "rejeitado", "executado"].includes(l.situacao)
  );


  async function verOperacoesGeradas() {
  const importacao_id = resultadoExecucao?.lote_conciliacao_id;

  if (!importacao_id) {
    alert("Lote/importação não encontrado.");
    return;
  }

  try {
    setLoadingOperacoes(true);

    const url = buildWebhookUrl("importacao_bancaria", {
      empresa_id,
      conta_id,
      importacao_id,
    });

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: Number(empresa_id),
        conta_id: Number(conta_id),
        importacao_id: Number(importacao_id),
      }),
    });

    const retorno = await resp.json();

    const lista =
      Array.isArray(retorno?.[0]?.data)
        ? retorno[0].data
        : Array.isArray(retorno?.data)
          ? retorno.data
          : Array.isArray(retorno)
            ? retorno
            : [];

    setOperacoesGeradas(lista);
    setMostrarOperacoes(true);
  } catch (e) {
    console.error(e);
    alert("Erro ao carregar operações geradas.");
  } finally {
    setLoadingOperacoes(false);
  }
}
async function excluirImportacao() {
  const ids = operacoesGeradas.map((l) => Number(l.id)).filter(Boolean);

  if (ids.length === 0) {
    alert("Nenhuma operação encontrada para excluir.");
    return;
  }

  if (!confirm(`Confirma excluir ${ids.length} operação(ões) desta importação?`)) {
    return;
  }

  try {
    const url = buildWebhookUrl("exclui_importacao", {
      empresa_id,
      conta_id,
    });

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: Number(empresa_id),
        conta_id: Number(conta_id),
        ids,
      }),
    });

    const data = await resp.json();

    if (data?.ok === false) {
      alert(data.message || "Erro ao excluir importação.");
      return;
    }

    alert("Importação excluída com sucesso.");

    setOperacoesGeradas([]);
    setMostrarOperacoes(false);
    localStorage.removeItem("resultado_conciliacao");
    setResultadoExecucao(null);
  } catch (e) {
    console.error(e);
    alert("Erro ao excluir importação.");
  }
}


  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">

         {!resultadoExecucao && (  <div className="mb-6 rounded-3xl bg-white p-6 shadow-lg border border-slate-200">
          <h1 className="text-2xl font-black text-slate-800">
            Revisão da Conciliação
          </h1>

          <p className="mt-2 text-slate-600">
            Confira os lançamentos importados. As linhas pendentes podem ser editadas antes da confirmação final.
          </p>



        
          <div className="mt-4 flex gap-3">

           <button
            onClick={aceitarTodosCheckbox}
            className="
              px-5 py-2 rounded-full
              bg-gradient-to-r from-gray-500 to-gray-700
              text-white font-bold text-sm shadow
              hover:brightness-110
            "
          >
            {selecionados.length > 0 ? "❌ Desselecionar todos" : "✅ Selecionar todos"}
          </button>


            <button
              onClick={() => aceitarSelecionados()}
              className="
                px-5 py-2 rounded-full
                bg-gradient-to-r from-emerald-500 to-green-700
                text-white font-bold text-sm shadow
                hover:brightness-110
              "
            >
              ✅ Aceitar selecionados
            </button>
            
             <button
                onClick={executarConciliacao}
                disabled={!podeExecutar}
                className={`
                  px-5 py-2 rounded-full
                  text-white font-bold text-sm shadow
                  hover:brightness-110
                  ${
                    podeExecutar
                      ? "bg-gradient-to-r from-blue-500 to-blue-700"
                      : "bg-gray-300 cursor-not-allowed opacity-60"
                  }
                `}
              >
                🚀 Executar Conciliação
              </button>
            
                 
            
            <button
                  onClick={() => {
                    localStorage.removeItem("resultado_conciliacao");
                    navigate("/importacao-bancaria");
                  }}
                className="
                px-5 py-2 rounded-full
                bg-gradient-to-r from-gray-600 to-gray-900
                text-white font-bold text-sm shadow
                hover:brightness-110
                "
            >
                 ↩ Sair
            </button> 
            
               <button
                    onClick={Reverter}
                    className="
                      px-5 py-2 rounded-full
                      bg-gradient-to-r from-red-500 to-red-700
                      text-white font-bold text-sm shadow
                      hover:brightness-110
                    "
                  >
                    ✅ Reverter tudo 
                  </button>


            </div>
        {podeExecutar && (
            <div className="mt-6 mb-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-emerald-800 font-bold shadow">
              ✅ Todas as linhas foram revisadas. A conciliação já pode ser executada.
            </div>
          )}
                
      {aviso && (
            <div className="mt-6 mb-5 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-800 font-bold shadow">
              {aviso}
            </div>
          )}


        </div>)}

        <div className="rounded-3xl bg-white shadow-lg border border-slate-200 overflow-hidden">

          {resultadoExecucao && (
  <div className="mb-6 rounded-3xl border border-emerald-300 bg-emerald-50 p-6 shadow-lg">
    <h2 className="text-2xl font-black text-emerald-800">
      ✅ Conciliação executada com sucesso
    </h2>

    <p className="mt-2 text-emerald-700 font-semibold">
      Os lançamentos foram processados e não aparecerão mais na revisão.
    </p>

    <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="rounded-2xl bg-white p-4 shadow border">
        <div className="text-xs text-slate-500 font-bold">Lote</div>
        <div className="text-xl font-black text-slate-800">
          {resultadoExecucao.lote_conciliacao_id || "-"}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow border">
        <div className="text-xs text-slate-500 font-bold">Pagas</div>
        <div className="text-xl font-black text-slate-800">
          {resultadoExecucao.pagar || 0}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow border">
        <div className="text-xs text-slate-500 font-bold">Recebidas</div>
        <div className="text-xl font-black text-slate-800">
          {resultadoExecucao.receber || 0}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow border">
        <div className="text-xs text-slate-500 font-bold">Faturas</div>
        <div className="text-xl font-black text-slate-800">
          {resultadoExecucao.faturas || 0}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow border">
        <div className="text-xs text-slate-500 font-bold">Transações</div>
        <div className="text-xl font-black text-slate-800">
          {resultadoExecucao.transacoes || 0}
        </div>
      </div>
    </div>

    <div className="mt-6 flex gap-3">
      <button
        onClick={() => navigate("/importacao-bancaria")}
        className="px-5 py-2 rounded-full bg-slate-800 text-white font-bold shadow hover:brightness-110"
      >
        Nova importação
      </button>

      <button
          onClick={verOperacoesGeradas}
        className="px-5 py-2 rounded-full bg-blue-700 text-white font-bold shadow hover:brightness-110"
      >
        Ver transações geradas
      </button>
  
      <button
        onClick={excluirImportacao}
        className="px-5 py-2 rounded-full bg-red-700 text-white font-bold shadow hover:brightness-110"
      >
        Estornar lote
      </button>
    </div>
  </div>
)}



{mostrarOperacoes && (
  <div className="mb-6 rounded-3xl bg-white border border-slate-200 shadow-lg overflow-hidden">
    <div className="bg-slate-800 text-white px-6 py-4">
      <h2 className="text-xl font-black">Operações geradas</h2>
      <p className="text-sm text-slate-200">
        Lote/importação nº {resultadoExecucao?.lote_conciliacao_id}
      </p>
    </div>

    {loadingOperacoes ? (
      <div className="p-6 text-center font-bold text-slate-500">
        Carregando operações...
      </div>
    ) : operacoesGeradas.length === 0 ? (
      <div className="p-6 text-center font-bold text-slate-500">
        Nenhuma operação encontrada para este lote.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Descrição</th>
              <th className="px-3 py-2 text-center">Data</th>
              <th className="px-3 py-2 text-left">Conta</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Origem</th>
              <th className="px-3 py-2 text-left">Classificação</th>
              <th className="px-3 py-2 text-left">Forma</th>
              <th className="px-3 py-2 text-right">Valor</th>
              <th className="px-3 py-2 text-left">Evento</th>
            </tr>
          </thead>

          <tbody>
            {operacoesGeradas.map((l) => (
              <tr key={l.id} className="border-t hover:bg-blue-50/50">
                <td className="px-3 py-2 font-bold">{l.id}</td>

                <td className="px-3 py-2 whitespace-normal break-words max-w-[260px]">
                  {l.descricao}
                </td>

                <td className="px-3 py-2 font-bold text-center">
                  {String(l.data_movimento || "")
                    .slice(0, 10)
                    .split("-")
                    .reverse()
                    .join("/")}
                </td>

                <td className="px-3 py-2 whitespace-normal break-words max-w-[200px]">
                  {l.conta_nome || "-"}
                </td>

                <td
                  className={`px-3 py-2 font-bold ${
                    l.tipo === "entrada" ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {l.tipo === "entrada" ? "Entrada" : "Saída"}
                </td>

                <td className="px-3 py-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      l.origem === "conta_pagar"
                        ? "bg-red-100 text-red-700"
                        : l.origem === "conta_receber"
                        ? "bg-green-100 text-green-700"
                        : l.origem === "fatura_cartao"
                        ? "bg-purple-100 text-purple-700"
                        : l.origem === "estorno"
                        ? "bg-gray-200 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {l.origem === "conta_pagar"
                      ? "Pagar"
                      : l.origem === "conta_receber"
                      ? "Receber"
                      : l.origem === "fatura_cartao"
                      ? "Fatura"
                      : l.origem === "estorno"
                      ? "Estorno"
                      : "Financeiro"}
                  </span>
                </td>

                <td className="px-3 py-2 font-medium">
                  {l.classificacao || "-"}
                </td>

                <td className="px-3 py-2 font-medium">
                  {l.forma || "-"}
                </td>

                <td className="px-3 py-2 text-right font-black">
                  {Number(l.valor || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>

                <td className="px-3 py-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      l.tipo_operacao === "conta_pagar"
                        ? "bg-red-100 text-red-700"
                        : l.tipo_operacao === "conta_receber"
                        ? "bg-green-100 text-green-700"
                        : l.tipo_operacao === "fatura_cartao"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {l.tipo_operacao === "conta_pagar"
                      ? "A pagar"
                      : l.tipo_operacao === "conta_receber"
                      ? "A receber"
                      : l.tipo_operacao === "fatura_cartao"
                      ? "Fatura cartão"
                      : "Financeiro"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}
  {loading ? (
            <div className="p-10 text-center text-slate-500 font-bold">
              Carregando dados importados...
            </div>
          ) : linhas.length === 0 ? (
            <div className="p-10 text-center text-slate-500 font-bold">
              Nenhum dado encontrado.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-white">
                <tr>
                <th className="p-3 text-center">Sel.</th>
                  <th className="p-3 text-left">Data</th>
                  <th className="p-3 text-left">Histórico</th>
                  <th className="p-3 text-right">Valor</th>
                  <th className="p-3 text-center">Situação</th>
                  <th className="p-3 text-left">Mensagem</th>a
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>

              <tbody>
                {linhas.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-slate-100 hover:bg-blue-50/60"
                  >
                    <td className="p-3 text-center">
                         <input
                          type="checkbox"
                          checked={selecionados.includes(l.id)}
                          onChange={() => toggleSelecionado(l.id)}
                          disabled={l.situacao === "ok" || l.situacao === "executado" || l.situacao === "rejeitado"}
                        />
                        </td>
                   <td className="p-3 font-semibold text-slate-700">
                        {String(l.data_mov || "").slice(0, 10).split("-").reverse().join("/")}
                      </td>

                    <td className="p-3 text-slate-700 font-medium">
                      {l.historico}
                    </td>

                    <td className="p-3 text-right font-black text-slate-800">
                      {Number(l.valor || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusClasse(
                          l.situacao
                        )}`}
                      >
                        {l.situacao === "ok"
                          ? "OK"
                          : l.situacao === "rejeitado"
                            ? "REJEITADO"
                            : l.situacao === "executado"
                              ? "EXECUTADO"
                              : "PENDENTE"}
                      </span>
                    </td>

                    <td className="p-3 text-slate-600">
                      {l.mensagem}
                    </td>

                    <td className="p-3 text-center">
                       <div className="flex justify-center gap-2">
                       <button
                        onClick={() => rejeitarLinha(l.id)}
                        disabled={
                          l.situacao === "ok" ||
                          l.situacao === "executado" ||
                          !["pagar", "receber", "fatura_cartao"].includes(l.tipo_evento)
                        }
                        className="
                          px-4 py-2 rounded-full
                          border border-gray-400
                          bg-rose-50
                          text-gray-700 font-bold text-xs
                          hover:bg-gray-300
                          transition disabled:opacity-40
                        "
                      >
                        Rejeitar
                      </button>

                       <button
                      onClick={() => aceitarSelecionados([l.id])}
                      disabled={
                        l.situacao === "ok" ||
                        l.situacao === "executado" ||
                        l.situacao === "rejeitado"
                      }
                      className="
                        ml-2 px-4 py-2 rounded-full
                        border border-emerald-400
                        bg-emerald-100
                        text-emerald-800 font-bold text-xs
                        hover:bg-emerald-200
                        transition
                        disabled:opacity-75
                        disabled:cursor-not-allowed
                      "
                    >
                      Aceitar
                    </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}


        
        </div>
      </div>
    </div>
  );
}