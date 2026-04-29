 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";

export default function TitulosVencidos() {
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modo, setModo] = useState("vencidos");
  const [dias, setDias] = useState(15);

  const [contaId, setContaId] = useState(0);
  const [contas, setContas] = useState([]);

  const [selecionados, setSelecionados] = useState([]);
  const [dadosConta, setDadosConta] = useState({
    conta_nome: "—",
    nro_banco: "—",
    agencia: "—",
    conta: "—",
    saldo_final: 0,
  });

  /* ================= CONTAS ================= */
  useEffect(() => {
    async function carregarContas() {
      const url = buildWebhookUrl("listacontas", { empresa_id });
      const r = await fetch(url);
      const j = await r.json();
      setContas(Array.isArray(j) ? j : []);
    }
    carregarContas();
  }, [empresa_id]);


  function formatarDataSemFuso(data) {
  if (!data) return "";
  return data.substring(0, 10).split("-").reverse().join("/");
}

  /* ================= SALDO ================= */
  useEffect(() => {
    async function carregarSaldo() {
      if (!contaId) {
        setDadosConta({
          conta_nome: "—",
          nro_banco: "—",
          agencia: "—",
          conta: "—",
          saldo_final: 0,
        });
        return;
      }

      const hoje = hojeLocal();
      const url = buildWebhookUrl("consultasaldo", {
        empresa_id,
        conta_id: contaId,
        inicio: hoje,
        fim: hoje,
      });

      const r = await fetch(url);
      const j = await r.json();
      setDadosConta(j?.[0] || {});
    }

    carregarSaldo();
  }, [contaId, empresa_id]);

  /* ================= PESQUISA ================= */
  async function pesquisar() {
    setLoading(true);
    try {
      const url = buildWebhookUrl("titulos_vencidos", {
        empresa_id,
        modo,
        dias,
        conta_id: contaId || null,
      });

      const r = await fetch(url);
const j = await r.json();

     if (Array.isArray(j) && j[0]?.ok) {
  const dadosBrutos = Array.isArray(j[0].data) ? j[0].data : [j[0].data];

  const dados = dadosBrutos.map((item) => ({
    ...item,
    uid: `${item.origem_tabela}:${item.origem_id}`,
  }));

  setLista(dados);
  setSelecionados([]);
} else {
  setLista([]);
  setSelecionados([]);
}
    } finally {
      setLoading(false);
    }
  }
 
  useEffect(() => {
  if (modo === "vencidos") {
    setDias(0);
  } else if (dias === 0) {
    setDias(15); // valor padrão quando volta para "a vencer"
  }
}, [modo]);

 async function processarTitulo(titulo, conta_id) {
  if (loading) return;

  if (!conta_id || Number(conta_id) === 0) {
    alert("Selecione a conta bancária.");
    return;
  }

  setLoading(true);

  try {
    let webhook = "";

    const payload = {
      empresa_id: Number(empresa_id), 
      contas: [], // 🔥 ARRAY PURO
       conta_id: Number(conta_id)
    };

    if (titulo.evento_codigo === "PAGAR") {
      webhook = "pagar_contas";
      payload.contas = [ Number(titulo.origem_id) ];

    } else if (titulo.evento_codigo === "RECEBER") {
      webhook = "receber_contas";
      payload.contas = [ Number(titulo.origem_id) ];

    } else if (titulo.evento_codigo === "PAGAMENTO_FATURA_CARTAO") {
      webhook = "pagar_faturas";
      payload.contas = [ Number(titulo.origem_id) ];

    } else {
      alert("Tipo de título desconhecido.");
      return;
    }

    const resp = await fetch(buildWebhookUrl(webhook), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    const data = text ? JSON.parse(text) : null;

    if (!resp.ok || data?.erro) {
      alert(text || data?.erro || "Erro");
      return;
    }

    alert("Processado com sucesso!");
     window.dispatchEvent(new Event("contabil-atualizado"));
    pesquisar();

  } catch (e) {
    alert("Erro ao processar título.");
  } finally {
    setLoading(false);
  }
}


function toggleSelecionado(id) {
  setSelecionados((prev) =>
    prev.includes(id)
      ? prev.filter((x) => x !== id)
      : [...prev, id]
  );
}


 function toggleSelecionarTodos(lista) {
  const ids = lista.map((l) => l.uid);

  const todosMarcados = ids.every((id) => selecionados.includes(id));

  setSelecionados(todosMarcados ? [] : ids);
}



function executarSelecionados() {
  console.log("Selecionados:", selecionados);
  alert(`Selecionados: ${selecionados.join(", ")}`);
}



async function executarSelecionados() {
  if (!contaId || Number(contaId) === 0) {
    alert("Selecione uma conta bancária.");
    return;
  }

  const itens = lista
    .filter((l) => selecionados.includes(l.uid))
    .map((l) => ({
      origem_tabela: l.origem_tabela,
      origem_id: Number(l.origem_id),
      evento_codigo: l.evento_codigo,
      tipo_origem: l.tipo_origem,
    }));

  if (itens.length === 0) {
    alert("Selecione ao menos um título.");
    return;
  }

  const payload = {
    empresa_id: Number(empresa_id),
    conta_id: Number(contaId),
    itens,
  };

  const resp = await fetch(buildWebhookUrl("executar_titulos"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await resp.json();

  if (!resp.ok || data?.ok === false) {
    alert(data?.message || "Erro ao executar títulos.");
    return;
  }

  alert("Títulos executados com sucesso!");
  setSelecionados([]);
  pesquisar();
}



   return (
  <div className="p-4 space-y-6">

    {/* HEADER */}
     <div className="bg-white rounded-xl shadow-sm p-2 shadow-lg border border-slate-200">
  <div className="flex items-center justify-between gap-3">

    <div>
        <h1 className="text-2xl font-black text-slate-800">
        Títulos vencidos e a vencer
      </h1>
       <p className="mt-2 text-slate-600">
        Controle de contas vencidas e próximas do vencimento.
      </p>
    </div>

    <div className="
        text-right
        rounded-2xl
        px-5 py-3
        border border-emerald-200
        bg-gradient-to-br from-emerald-150 via-white to-blue-150
        shadow-sm
      ">
         <p className="text-base font-bold text-slate-900">Conta bancária</p>
        <p className="font-bold text-slate-800">
          🏦 {dadosConta.conta_nome}
        </p>

        <p className="text-xs text-slate-500 mt-1">
          Banco: {dadosConta.nro_banco} • Ag: {dadosConta.agencia} • Conta: {dadosConta.conta}
        </p>

        <p className="text-xl font-black text-emerald-700 mt-1">
          {Number(dadosConta.saldo_final).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
      </div>

  </div>

    
  {/* FILTROS */}
<div className="bg-white rounded-xl shadow-sm p-4">
  <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-end">

    {/* PERÍODO */}
        {/* PERÍODO */}
<div>
  <label className="block text-base font-bold text-blue-700 mb-1">
    Período
  </label>

  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => setModo("vencidos")}
      className={`
        px-4 py-2 rounded-xl border text-sm font-bold transition
        ${
          modo === "vencidos"
            ? "bg-red-400 text-white border-red-600 shadow-md"
            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
        }
      `}
    >
      Vencidos
    </button>

    <button
      type="button"
      onClick={() => setModo("vencer")}
      className={`
        px-4 py-2 rounded-xl border text-sm font-bold transition
        ${
          modo === "vencer"
            ? "bg-blue-600 text-white border-blue-700 shadow-md"
            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
        }
      `}
    >
      A vencer
    </button>
  </div>
</div>
     <div>
  <label className="block text-base font-bold text-blue-700 mb-1">
    Dias
  </label>

  <div className="flex gap-2">
    {[7, 15, 30].map((d) => (
      <button
        key={d}
        type="button"
        disabled={modo === "vencidos"}
        onClick={() => setDias(d)}
        className={`
          px-4 py-2 rounded-xl border text-sm font-bold transition
          ${
            dias === d
              ? "bg-blue-600 text-white border-blue-700 shadow-md"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
          }
          disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
        `}
      >
        {d}D
      </button>
    ))}
  </div>
</div>

    {/* CONTA */}
    <div>
      <label className="block text-base font-bold text-blue-700 mb-1">
        Conta bancária
      </label>
      <select
        value={contaId}
        onChange={(e) => setContaId(Number(e.target.value))}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value={0}>Todas</option>
        {contas.map(c => (
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))}
      </select>
    </div>

    {/* AÇÃO */}
    <div className="flex justify-end">
      <button
        onClick={pesquisar}
        className="btn-pill btn-blue"
      >
        Atualizar
      </button>
    </div>
    <div className="mb-1 flex justify-end">
          <button
            onClick={() => executarSelecionados()}
            disabled={selecionados.length === 0}
            className="btn-pill btn-gray"
              >
            Executar selecionados ({selecionados.length})
          </button>
        </div>
  </div>
</div>
</div>
       

    {/* TABELA  
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">*/}
      <div className="max-h-[720px] overflow-y-auto overflow-x-auto"> 
      <table className="w-full text-base"> 
        <thead className="sticky top-0 z-20 bg-slate-800 text-white"> 
          <tr>
             <th className="p-2 text-center">
              <input
                  type="checkbox"
                  checked={
                    lista.length > 0 &&
                    lista.every((item) => selecionados.includes(item.uid))
                  }
                  onChange={() => toggleSelecionarTodos(lista)}
                />
              </th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Tipo</th>
            <th className="px-3 py-2 text-center">Vencimento</th>
            <th className="px-3 py-2 text-center">Dias</th>
            <th className="px-3 py-2 text-left">Descrição</th>
            <th className="px-3 py-2 text-left">Parceiro</th>
            <th className="px-3 py-2 text-right">Valor</th>
            <th className="px-3 py-2 text-center">Ação</th>
          </tr>
        </thead>

        <tbody>
          {lista.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center py-6 text-gray-500">
                Nenhum título encontrado.
              </td>
            </tr>
          )}

          {lista.map((l, i) => (
           <tr key={l.uid} className="border-t">

              <td className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selecionados.includes(l.uid)}
                 onChange={() => toggleSelecionado(l.uid)}
                />
              </td>
              <td className="px-3 py-2 font-semibold">
                {l.critico ? "⚠ Crítico" : "Normal"}
              </td>

              <td className="px-3 py-2 font-medium">
                {l.evento_codigo}
              </td>

              <td className="px-3 py-2 text-center">
                {formatarDataSemFuso(l.vencimento)}
              </td>

              <td
                className={`px-3 py-2 text-center font-semibold ${
                  l.dias_atraso > 0 ? "text-red-600" : "text-blue-600"
                }`}
              >
                {l.dias_atraso}
              </td>

              <td className="px-3 py-2">{l.descricao}</td>
              <td className="px-3 py-2">{l.parceiro || "-"}</td>

              <td className="px-3 py-2 text-right font-semibold">
                {Number(l.valor).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </td>

              <td className="px-3 py-2 text-center">
                <button
                  onClick={() => processarTitulo(l, contaId)}
                  className={`font-semibold underline ${
                    l.evento_codigo === "RECEBER"
                      ? "text-blue-700"
                      : "text-red-700"
                  }`}
                >
                  {l.evento_codigo === "RECEBER"
                    ? "Receber"
                    : l.evento_codigo === "PAGAMENTO_FATURA_CARTAO"
                    ? "Pagar fatura"
                    : "Pagar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>
);

}
