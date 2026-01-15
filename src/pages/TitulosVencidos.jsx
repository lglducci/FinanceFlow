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
      setLista(Array.isArray(j) ? j : []);
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
    <div className="p-2">
      

      {/* ===== BLOCO FIXO (NÃO SE MOVE) ===== */}
      <div className="bg-white rounded-xl shadow p-2 border-[10px] border-[#061f4aff] mb-2">

         <h2 className="text-2xl font-bold mb-1 text-[#061f4aff]">
       Títulos Vencidos e a Vencer
      </h2>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 items-stretch">

          {/* FILTROS */}
          <div className="lg:col-span-3 flex flex-wrap items-center gap-2">
            <div>
              <label className="font-bold text-[#061f4aff] block mb-1">Período</label>
              <select
                value={modo}
                onChange={(e) => setModo(e.target.value)}
                className="border rounded px-3 py-2 w-48 border-yellow-500"
              >
                <option value="vencidos">Somente vencidos</option>
                <option value="vencer">Vencidos + a vencer</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#061f4aff] block mb-1">Dias</label>
              <select
                value={dias}
                disabled={modo === "vencidos"}
                onChange={(e) => setDias(Number(e.target.value))}
                className="border rounded px-3 py-2 w-24 border-yellow-500"
              >
                <option value={7}>7</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#061f4aff] block mb-1">Conta</label>
              <select
                value={contaId}
                onChange={(e) => setContaId(Number(e.target.value))}
                className="border rounded px-3 py-2 w-56 border-yellow-500"
              >
                <option value={0}>Todas</option>
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={pesquisar}
              className="h-12 px-8 bg-blue-600 text-white font-bold rounded-lg mt-6"
            >
              Atualizar
            </button>

          </div>

          {/* CARD CONTA — ALTURA FIXA */}
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-900 flex flex-col justify-between min-h-[140px]">
            <div>
              <h3 className="font-bold text-lg text-blue-700 mt-2">
                🏦 {dadosConta.conta_nome}
              </h3>

              <p className="text-sm mt-2 text-gray-700">
                Banco: {dadosConta.nro_banco}    • Agência: {dadosConta.agencia}    • Conta Corrente: {dadosConta.conta}
              </p>
            </div>

            <div className="text-green-700 font-bold text-lg mt-2">
              Saldo final: R$ {Number(dadosConta.saldo_final).toLocaleString("pt-BR")}
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABELA ===== */}
      <div className="bg-gray-100 rounded-xl p-4 shadow border-[2px] border-gray-500  border-spacing-y-2">
     <table className="w-full border-separate border-spacing-y-3">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th>⚠ Status</th>
              <th className="text-left font-bold">Tipo</th>
              <th  className="text-center font-bold">Vencimento.</th>
              <th  className="text-left font-bold">Dias</th>
              <th className="text-left font-bold ">Descrição</th>
              <th className="text-left font-bold">Parceiro</th>
              <th className="text-right font-bold">Valor</th> 
              <th className=" px-5 text-left font-bold">Ação</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((l, i) => (
              <tr key={i} className={i % 2 ?  "bg-[#f2f2f2]" : "bg-[#e6e6e6]"}>
                <td className="px-3 text-center font-bold text-base">{l.critico ? "⚠ crítico" : "normal"}</td>
                <td className="px-3 text-left font-bold text-base ">{l.evento_codigo}</td>
                <td className="px-3 text-center font-bold text-base">{new Date(l.vencimento).toLocaleDateString("pt-BR")}</td>
                <td className={l.dias_atraso > 0 ? "px-3 text-red-600 font-bold text-base" : "px-3 text-blue-600 font-bold text-base"}>
                  {l.dias_atraso}
                </td>
                <td className="px-3 text-left font-bold text-base">{l.descricao}</td>
                <td className="px-3 text-left font-bold text-base">{l.parceiro || "-"}</td>
                <td className="px-3 text-right font-bold text-base">
                  {Number(l.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>

               <button
                  onClick={() => processarTitulo(l, contaId)}
                  className={`px-5 underline font-bold text-right ${
                    l.evento_codigo === "RECEBER"
                      ? "text-blue-700"
                      : "text-red-700"
                  }`}
                >
                  {l.evento_codigo === "RECEBER"
                    ? "Receber"
                    : l.evento_codigo === "PAGAMENTO_FATURA_CARTAO"
                    ? "Pagar Fatura"
                    : "Pagar"}
                </button>

              {/*}  <td className="px-3 text-center text-blue-700 underline font-bold text-base">
                  {l.evento_codigo === "RECEBER" ? "Receber" : "Pagar"}
                </td>*/}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
