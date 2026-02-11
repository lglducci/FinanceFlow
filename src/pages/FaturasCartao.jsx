 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function FaturasCartao() {
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);
  const navigate = useNavigate();
const btnPadrao =
  "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";

  
  const [cartoes, setCartoes] = useState([]);
  const [lista, setLista] = useState([]);
  const [selecionadas, setSelecionadas] = useState([]);

  const [cartao_id, setCartaoId] = useState(0);
  const [status, setStatus] = useState("aberta");
  const [mes, setMes] = useState(new Date().toISOString().substring(0, 7));

  const [contas, setContas] = useState([]);
  const [conta_id, setContaId] = useState(0);
  const [dadosConta, setDadosConta] = useState(null);

  // ------------------- CARREGA CARTÕES -------------------
  async function carregarCartoes() {
    const url = buildWebhookUrl("cartoes", { id_empresa: empresa_id });
    const resp = await fetch(url);
    const json = await resp.json();
    setCartoes(json);
  }

  useEffect(() => {
    carregarCartoes();
  }, []);

  // ------------------- CARREGA CONTAS -------------------
  useEffect(() => {
    async function carregarContas() {
      const url = buildWebhookUrl("listacontas", { empresa_id });
      const resp = await fetch(url);
      const json = await resp.json();
      setContas(json);
    }
    carregarContas();
  }, []);

  // ------------------- PESQUISAR FATURAS -------------------
  async function pesquisar() {
    const url = buildWebhookUrl("listasfaturas", {
      empresa_id,
      id: cartao_id,
      status,
      mes_referencia: mes + "-01",
    });

    const resp = await fetch(url);
    const json = await resp.json().catch(() => []);
    setLista(json);
  }

  // ------------------- CHECKBOX -------------------
  function toggleSelecionada(id) {
    setSelecionadas((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  // ------------------- FECHAR FATURAS -------------------
  async function fecharFaturas() {
    if (selecionadas.length === 0) {
      alert("Selecione pelo menos 1 fatura para fechar.");
      return;
    }

    if (!conta_id || conta_id === 0) {
      alert("Selecione a conta bancária para pagar.");
      return;
    }

    if (!confirm(`Fechar ${selecionadas.length} fatura(s)?`)) return;

    const url = buildWebhookUrl("pagar_faturas");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        contas: selecionadas,
        conta_id,
      }),
    });

    const data = await resp.json();
    alert(data.mensagem || "Fatura(s) fechada(s)!");
    setSelecionadas([]);
    pesquisar();
  }

  // ------------------- CARREGAR SALDO DA CONTA -------------------
  async function carregarSaldoConta(id_conta) {
    const hoje = new Date().toISOString().split("T")[0];

    const url = buildWebhookUrl("consultasaldo", {
      inicio: hoje,
      fim: hoje,
      empresa_id,
      conta_id: id_conta,
    });

    const resp = await fetch(url);
    const json = await resp.json();
    setDadosConta(json[0]);
  }

  // ============================================================
  // ========================= RENDER ============================
  // ============================================================
 return (
  <div className="p-4 space-y-6">

    {/* HEADER */}
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-xl font-bold text-blue-800">Pagar Faturas</h1>
        <p className="text-sm text-gray-500">
          Consulte e feche faturas de cartão de crédito.
        </p>
      </div>
    </div>

    {/* FILTROS + CONTA */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* COLUNA ESQUERDA */}
      <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* CARTÃO */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Cartão
            </label>
            <select
              value={cartao_id}
              onChange={(e) => setCartaoId(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value={0}>Todos</option>
              {cartoes.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="aberta">Aberta</option>
              <option value="paga">Paga</option>
              <option value="">Todas</option>
            </select>
          </div>

          {/* MÊS */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mês de referência
            </label>
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {/* CONTA */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Conta bancária
            </label>
            <select
              value={conta_id}
              onChange={(e) => {
                const id = Number(e.target.value);
                setContaId(id);
                if (id === 0) setDadosConta(null);
                else carregarSaldoConta(id);
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value={0}>Selecione...</option>
              {contas.map(ct => (
                <option key={ct.id} value={ct.id}>{ct.nome}</option>
              ))}
            </select>
          </div>

        </div>

        {/* AÇÕES */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={pesquisar}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Pesquisar
          </button>

          <button
            onClick={fecharFaturas}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Fechar faturas selecionadas
            {selecionadas.length > 0 && (
              <span className="ml-2 rounded-full bg-white/20 px-2 text-xs">
                {selecionadas.length}
              </span>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>

      {/* COLUNA DIREITA – CONTA */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        {dadosConta ? (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🏦 {dadosConta.conta_nome}
            </h3>

            <div className="space-y-1 text-sm text-gray-700">
              <p><strong>Banco:</strong> {dadosConta.nro_banco ?? "-"}</p>
              <p><strong>Agência:</strong> {dadosConta.agencia ?? "-"}</p>
              <p><strong>Conta:</strong> {dadosConta.conta ?? "-"}</p>
            </div>

            <div className="mt-4 text-lg font-bold text-green-700">
              Saldo: R$ {Number(dadosConta.saldo_final).toLocaleString("pt-BR")}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Selecione uma conta bancária para visualizar o saldo.
          </p>
        )}
      </div>
    </div>

    {/* LISTAGEM */}
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-3 py-2 text-center">Sel</th>
            <th className="px-3 py-2 text-left">Cartão</th>
            <th className="px-3 py-2 text-left">Bandeira</th>
            <th className="px-3 py-2 text-left">Referência</th>
            <th className="px-3 py-2 text-right">Valor</th>
            <th className="px-3 py-2 text-center">Status</th>
          </tr>
        </thead>

        <tbody>
          {lista.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-6 text-gray-500">
                Nenhuma fatura encontrada.
              </td>
            </tr>
          )}

          {lista.map((f, i) => (
            <tr key={f.id} className="border-t">
              <td className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selecionadas.includes(f.id)}
                  onChange={() => toggleSelecionada(f.id)}
                  disabled={f.status === "paga"}
                />
              </td>

              <td className="px-3 py-2 font-semibold">{f.nome}</td>
              <td className="px-3 py-2">{f.bandeira}</td>
              <td className="px-3 py-2">
                {new Date(f.mes_referencia).toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </td>
              <td className="px-3 py-2 text-right font-semibold">
                R$ {Number(f.valor_total).toLocaleString("pt-BR")}
              </td>
              <td className="px-3 py-2 text-center">{f.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>
);

}
