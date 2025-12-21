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
        faturas: selecionadas,
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
    <div className="p-4">

    <h2 className="text-xl font-bold mb-4"> Pagar Faturas </h2>

    {/* CONTAINER PRINCIPAL */}
    <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-6 border-[10px] border-blue-800 mb-6">

      {/* GRID COM 2 COLUNAS — AQUI FICA TUDO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* ===================== COLUNA 1 ===================== */}
    <div className="bg-white rounded-xl shadow p-5 border w-full">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* CARTÃO */}
            <div>
                <label className="block font-bold mb-2 text-blue-900">Cartão</label>
                <select
                  value={cartao_id}
                  onChange={(e) => setCartaoId(Number(e.target.value))}
                  className="border font-bold p-2 rounded w-full border-yellow-500"
                >
                  <option value={0}>Todos</option>
                  {cartoes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
            </div>

            {/* STATUS */}
            <div>
                <label className="block font-bold mb-2 text-blue-900">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border font-bold p-2 rounded w-full border-yellow-500"
                >
                  <option value="aberta">Aberta</option>
                  <option value="paga">Paga</option>
                  <option value="">Todos</option>
                </select>
            </div>

            {/* MÊS */}
            <div>
                <label className="block font-bold mb-2 text-blue-900">Mês referência</label>
                <input
                  type="month"
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className="border font-bold p-2 rounded w-full border-yellow-500"
                />
            </div>

            {/* CONTA BANCÁRIA */}
            <div>
                <label className="block font-bold mb-2 text-blue-900">Conta bancária</label>
                <select
                  value={conta_id}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setContaId(id);
                    if (id === 0) setDadosConta(null);
                    else carregarSaldoConta(id);
                  }}
                  className="border font-bold p-2 rounded w-full border-yellow-500"
                >
                  <option value={0}>Selecione...</option>
                  {contas.map((ct) => (
                    <option key={ct.id} value={ct.id}>{ct.nome}</option>
                  ))}
                </select>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> 
            {/* BOTÕES */}
            <div className="flex items-end">
                <button
                  onClick={pesquisar}
                  className={`${btnPadrao} bg-blue-600 hover:bg-blue-700`}
                >
                  Pesquisar
                </button>
            </div>

            <div className="flex items-end">
                <button
                  onClick={fecharFaturas}
                    className={`${btnPadrao} bg-green-600 hover:bg-green-700`}
                >
                  Fechar Fatura
                </button>
            </div>
              <div className="flex items-end"> 
              <button
                onClick={() => window.print()}
                 className={`${btnPadrao} bg-gray-700 hover:bg-gray-800`}
              >
                🖨️ Imprimir
              </button> 
            </div>
          </div>
        </div>
    </div>


            {/* ===================== COLUNA 2 ===================== */}
            <div className="bg-white rounded-xl shadow p-5 border w-full">
                {dadosConta && (
                    <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-700 w-full">
                        <h3 className="font-bold text-lg text-blue-700 mb-2">
                            🏦 {dadosConta.conta_nome}
                        </h3>

                        <p><strong>Banco:</strong> {dadosConta.nro_banco ?? "-"}</p>
                        <p><strong>Agência:</strong> {dadosConta.agencia ?? "-"}</p>
                        <p><strong>Conta:</strong> {dadosConta.conta ?? "-"}</p>
                        <p><strong>Conjunta:</strong> {dadosConta.conjunta ? "Sim" : "Não"}</p>
                        <p><strong>Jurídica:</strong> {dadosConta.juridica ? "Sim" : "Não"}</p>

                        <p className="text-green-700 font-bold text-lg mt-3">
                            Saldo final: R$ {Number(dadosConta.saldo_final).toLocaleString("pt-BR")}
                        </p>
                    </div>
                )}
            </div>

          </div>

      {/* ==================== LISTAGEM DAS FATURAS ==================== */}
      <div className="bg-white rounded-xl shadow border p-4">
          <div id="print-area" className="bg-white rounded-xl shadow overflow-x-auto"> 
        <table className="w-full text-base">
          <thead className="bg-blue-200">
            <tr>
              <th className="px-3 py-2 text-center font-bold">Sel</th>
              <th className="px-3 py-2 text-left font-bold">ID</th>
               <th className="px-3 py-2 text-left font-bold">Nome</th>
              <th className="px-3 py-2 text-left font-bold">Bandeira</th>
                 <th className="px-3 py-2 text-left font-bold">Número</th>
               <th className="px-3 py-2 text-left font-bold">Limite</th> 
              <th className="px-3 py-2 text-left font-bold">Dia Fech.</th>
               <th className="px-3 py-2 text-left font-bold">Dia Vencto.</th>
              <th className="px-3 py-2 text-left font-bold">Referência</th>
              <th className="px-3 py-2 text-left font-bold">Valor</th>
              <th className="px-3 py-2 text-left font-bold">Status</th>
            </tr>
          </thead>

          <tbody>
            {lista.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Nenhuma fatura encontrada.
                </td>
              </tr>
            )}

            {lista.map((f, i) => (
              <tr
                key={f.id}
                className={i % 2 === 0 ? "bg-gray-100" : "bg-gray-200"}
              >
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selecionadas.includes(f.id)}
                    onChange={() => toggleSelecionada(f.id)}
                    disabled={f.status === "paga"}
                    className={f.status === "pag" ? "opacity-40 cursor-not-allowed" : ""}
                  />
                </td>

                <td className="px-3 py-2 font-bold">{f.id}</td> 
                 <td className="px-3 py-2 font-bold">{f.nome}</td>
                 <td className="px-3 py-2 font-bold">{f.bandeira}</td>
                 <td className="px-3 py-2 font-bold">{f.numero}</td>
                 <td className="px-3 py-2 font-bold">{f.limite_total}</td> 
                 <td className="px-3 py-2 font-bold">{f.fechamento_dia}</td>
                 <td className="px-3 py-2 font-bold">{f.vencimento_dia}</td>
                <td className="px-3 py-2 font-bold">
                  {new Date(f.mes_referencia).toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </td>
                <td className="px-3 py-2 font-bold">
                  R$ {Number(f.valor_total).toLocaleString("pt-BR")}
                </td>
                <td className="px-3 py-2 font-bold">{f.status}</td>
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
