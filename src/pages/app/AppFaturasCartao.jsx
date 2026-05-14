 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../../config/globals";
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
  const url = buildWebhookUrl("historicofaturas", {
    empresa_id,
    id: 0,
    status: "aberta",
    mes_referencia: "",
  });

  const resp = await fetch(url);
  const json = await resp.json().catch(() => []);

  setLista(Array.isArray(json) ? json : []);
}
  
useEffect(() => {
  pesquisar();
}, []);



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


  function VisualizarFatura(id) {
  navigate(`/app/fatura-transacoes?id=${id}&empresa=${empresa_id}`)
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

        <div className="grid grid-cols-3 gap-2">

         
            
            

          </div>
        {/* AÇÕES */}
        <div className="flex flex-wrap gap-3 pt-2">
     
          <button
            onClick={fecharFaturas}
           className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-white
                        bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-800
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-95
                        transition-all duration-200
                        inline-flex items-center gap-2
                      ">
            Fechar faturas selecionadas
            {selecionadas.length > 0 && (
              <span className="ml-2 rounded-full bg-white/20 px-2 text-xs">
                {selecionadas.length}
              </span>
            )}
          </button>

          <button
            onClick={() => window.print()} 

            className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-white
                        bg-gradient-to-b from-slate-500 via-slate-600 to-slate-800
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-95
                        transition-all duration-200
                        inline-flex items-center gap-2
                      ">
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
     {/* LISTAGEM MOBILE */}
<div className="space-y-3">
  {lista.length === 0 && (
    <div className="rounded-2xl bg-white p-4 text-center text-sm font-bold text-slate-500 shadow">
      Nenhuma fatura encontrada.
    </div>
  )}

  {lista.map((f) => (
    <div
      key={f.id}
      className="rounded-2xl bg-white p-4 shadow border border-slate-200"
    >
      <div className="flex justify-between gap-3">
        <div>
          <div className="text-sm font-black text-slate-900">
            {f.nome}
          </div>

          <div className="mt-1 text-xs font-bold text-slate-500">
            {f.bandeira} • {f.status}
          </div>

          <div className="mt-1 text-xs font-bold text-slate-500">
            Ref.:{" "}
            {new Date(f.mes_referencia).toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        <input
          type="checkbox"
          checked={selecionadas.includes(f.id)}
          onChange={() => toggleSelecionada(f.id)}
          disabled={f.status === "paga"}
          className="mt-1 h-5 w-5"
        />
      </div>

      <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-right">
        <div className="text-xs font-bold text-red-500">
          Valor da fatura
        </div>
        <div className="text-xl font-black text-red-700">
          R$ {Number(f.valor_total || 0).toLocaleString("pt-BR")}
        </div>
      </div>

      <button
        onClick={() => VisualizarFatura(f.id)}
        className="mt-3 w-full rounded-full bg-blue-700 py-2 text-sm font-black text-white shadow"
      >
        👁️ Visualizar compras
      </button>
    </div>
  ))}
</div>
  </div>
);

}
