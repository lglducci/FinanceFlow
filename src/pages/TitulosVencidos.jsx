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
       conta_id: Number(conta_id),
       data_pagto:hojeLocal()
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

useEffect(() => {
  pesquisar();
}, []);

 return (
  <div className="min-h-screen bg-[#eef7fd] px-4 py-5">
    <div className="mx-auto w-full max-w-[1500px] space-y-4">

      <div className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#063452]">
              ⏰ Títulos vencidos e a vencer
            </h1>
            <p className="text-sm font-semibold text-slate-500">
              Controle de contas vencidas e próximas do vencimento.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-5 py-3 text-right shadow-sm">
            <p className="text-xs font-black uppercase text-slate-400">
              Conta bancária
            </p>
            <p className="font-black text-slate-800">
              🏦 {dadosConta.conta_nome}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Banco: {dadosConta.nro_banco} • Ag: {dadosConta.agencia} • Conta: {dadosConta.conta}
            </p>
            <p className="mt-1 text-2xl font-black text-emerald-700">
              {Number(dadosConta.saldo_final || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-black text-[#063452] mb-2">
              Período
            </label>

            <div className="flex rounded-xl border border-cyan-200 bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setModo("vencidos")}
                className={`h-10 px-4 text-sm font-black ${
                  modo === "vencidos"
                    ? "bg-red-600 text-white"
                    : "bg-white text-slate-600 hover:bg-red-50"
                }`}
              >
                Vencidos
              </button>

              <button
                type="button"
                onClick={() => setModo("vencer")}
                className={`h-10 px-4 text-sm font-black ${
                  modo === "vencer"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 hover:bg-blue-50"
                }`}
              >
                A vencer
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-[#063452] mb-2">
              Dias
            </label>

            <div className="flex gap-2">
              {[7, 15, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  disabled={modo === "vencidos"}
                  onClick={() => setDias(d)}
                  className={`h-10 px-4 rounded-xl border text-sm font-black transition ${
                    dias === d
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-cyan-200 hover:bg-cyan-50"
                  } disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-[#063452] mb-2">
              Conta bancária
            </label>

            <select
              value={contaId}
              onChange={(e) => setContaId(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-cyan-200 bg-white px-3 text-sm font-bold text-slate-700"
            >
              <option value={0}>Todas</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={pesquisar}
              className="h-10 rounded-xl bg-[#063452] px-5 text-sm font-black text-white shadow hover:brightness-110"
            >
              Atualizar
            </button>

            <button
              onClick={executarSelecionados}
              disabled={selecionados.length === 0}
              className="h-10 rounded-xl bg-slate-200 px-5 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-300 disabled:opacity-50"
            >
              Executar ({selecionados.length})
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-cyan-100 bg-white shadow-sm overflow-hidden">
        <div className="max-h-[680px] overflow-auto">
          <table className="w-full min-w-[1150px] text-sm">
            <thead className="sticky top-0 z-20 bg-[#e7f5fc] text-[#063452] shadow-sm">
              <tr>
                <th className="px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={
                      lista.length > 0 &&
                      lista.every((item) => selecionados.includes(item.uid))
                    }
                    onChange={() => toggleSelecionarTodos(lista)}
                  />
                </th>
                <th className="px-3 py-3 text-left font-black">Status</th>
                <th className="px-3 py-3 text-left font-black">Tipo</th>
                <th className="px-3 py-3 text-center font-black">Vencimento</th>
                <th className="px-3 py-3 text-center font-black">Dias</th>
                <th className="px-3 py-3 text-left font-black">Descrição</th>
                <th className="px-3 py-3 text-left font-black">Parceiro</th>
                <th className="px-3 py-3 text-right font-black">Valor</th>
                <th className="px-3 py-3 text-center font-black">Ação</th>
              </tr>
            </thead>

            <tbody>
              {lista.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center font-bold text-slate-400">
                    {loading ? "Carregando..." : "Nenhum título encontrado."}
                  </td>
                </tr>
              )}

              {lista.map((l) => (
                <tr key={l.uid} className="border-b border-cyan-50 hover:bg-cyan-50">
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selecionados.includes(l.uid)}
                      onChange={() => toggleSelecionado(l.uid)}
                    />
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        l.critico
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {l.critico ? "Crítico" : "Normal"}
                    </span>
                  </td>

                  <td className="px-3 py-3 font-black text-[#063452]">
                    {l.evento_codigo}
                  </td>

                  <td className="px-3 py-3 text-center font-bold">
                    {formatarDataSemFuso(l.vencimento)}
                  </td>

                  <td
                    className={`px-3 py-3 text-center font-black ${
                      l.dias_atraso > 0 ? "text-red-600" : "text-blue-600"
                    }`}
                  >
                    {l.dias_atraso}
                  </td>

                  <td className="px-3 py-3 font-semibold text-slate-700">
                    {l.descricao}
                  </td>

                  <td className="px-3 py-3 text-slate-600">
                    {l.parceiro || "-"}
                  </td>

                  <td className="px-3 py-3 text-right font-black text-slate-800">
                    {Number(l.valor || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>

                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => processarTitulo(l, contaId)}
                      className={`rounded-full px-4 py-1 text-xs font-black text-white ${
                        l.evento_codigo === "RECEBER"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-red-600 hover:bg-red-700"
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

    </div>
  </div>
);

}
