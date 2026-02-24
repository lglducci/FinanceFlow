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
     // setLista(Array.isArray(j) ? j : []);

     if (Array.isArray(j) && j[0]?.ok) {
        const dados = j[0].data;
        setLista(Array.isArray(dados) ? dados : [dados]);
      } else {
        setLista([]);
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
    pesquisar();

  } catch (e) {
    alert("Erro ao processar título.");
  } finally {
    setLoading(false);
  }
}


   return (
  <div className="p-4 space-y-6">

    {/* HEADER */}
    <div>
      <h1 className="text-xl font-bold text-blue-800">
        Títulos vencidos e a vencer
      </h1>
      <p className="text-sm text-gray-500">
        Controle de contas vencidas e próximas do vencimento.
      </p>
    </div>

    {/* FILTROS */}
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">

        {/* PERÍODO */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Período
          </label>
          <select
            value={modo}
            onChange={(e) => setModo(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="vencidos">Somente vencidos</option>
            <option value="vencer">Vencidos + a vencer</option>
          </select>
        </div>

        {/* DIAS */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Dias
          </label>
          <select
            value={dias}
            disabled={modo === "vencidos"}
            onChange={(e) => setDias(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          >
            <option value={7}>7</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
          </select>
        </div>

        {/* CONTA */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
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
        <button
          onClick={pesquisar}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Atualizar
        </button>
      </div>
    </div>

    {/* CARD CONTA */}
    <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-700">
      <h3 className="font-semibold text-gray-900">
        🏦 {dadosConta.conta_nome}
      </h3>

      <p className="text-sm text-gray-600 mt-1">
        Banco: {dadosConta.nro_banco} • Agência: {dadosConta.agencia} • Conta: {dadosConta.conta}
      </p>

      <p className="mt-3 text-lg font-semibold text-emerald-600">
        Saldo atual:{" "}
        {Number(dadosConta.saldo_final).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>
    </div>

    {/* TABELA */}
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
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
              <td colSpan={8} className="text-center py-6 text-gray-500">
                Nenhum título encontrado.
              </td>
            </tr>
          )}

          {lista.map((l, i) => (
            <tr key={i} className="border-t">
              <td className="px-3 py-2 font-semibold">
                {l.critico ? "⚠ Crítico" : "Normal"}
              </td>

              <td className="px-3 py-2 font-medium">
                {l.evento_codigo}
              </td>

              <td className="px-3 py-2 text-center">
                {new Date(l.vencimento).toLocaleDateString("pt-BR")}
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
