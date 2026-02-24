 import { useEffect, useState } from "react";
 import { buildWebhookUrl } from "../config/globals";
 import { useNavigate } from "react-router-dom";
 import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
 
 
 


export default function ContasPagar() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);
  const [somenteVencidas, setSomenteVencidas] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  function formatarDataBR(data) {
  if (!data) return "";
  const d = new Date(data);
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const ano = d.getUTCFullYear();
  return `${dia}-${mes}-${ano}`;
}


  const [lista, setLista] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  const [status, setStatus] = useState("0");
  const [fornecedor_id, setFornecedorId] = useState(0);

   const [contas, setContas] = useState([]);
  const [dadosConta, setDadosConta] = useState(null);
  const [conta_id, setContaId] = useState(0);

  const [saldoConta, setSaldoConta] = useState(0);

  const [periodo, setPeriodo] = useState("hoje");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loading, setLoading] = useState(false);
 const [totalPeriodo, setTotalPeriodo] = useState(0);
 const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
 const [selecionadas, setSelecionadas] = useState([]);

  const btnPadrao = "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";


 // CARREGA CONTAS BANCÁRIAS
async function carregarContas() {
  try {
    const url = buildWebhookUrl("listacontas", { empresa_id });
    const resp = await fetch(url);
    const json = await resp.json();
    setContas(json);
  } catch (e) {
    console.log("ERRO ao carregar contas:", e);
  }
}

useEffect(() => {
  carregarContas();
}, []);

  //------------------------------------------------------------------
  // 1) CARREGAR FORNECEDORES
  //------------------------------------------------------------------
  async function carregarFornecedores() {
    try {
      const url = buildWebhookUrl("fornecedorcliente", {
        empresa_id,
        tipo: "fornecedor",
      });

      const resp = await fetch(url);
      const texto = await resp.text();

      let json = [];
      try {
        json = JSON.parse(texto);
      } catch {}

      setFornecedores(json);
    } catch (e) {
      console.log("ERRO FORNECEDORES:", e);
    }
  }

    //------------------------------------------------------------------
// 2) CALCULAR PERÍODO AUTOMÁTICO (APENAS FUTURO)
//------------------------------------------------------------------
useEffect(() => {
   const hoje = new Date(hojeLocal() );
  

     if (periodo === "semestre") {
    // Próximos 180 dias
    const ini = new Date();               // hoje
    const fim = new Date();
    fim.setDate(hoje.getDate() + 180);     // hoje + 180 dias

    setDataIni(ini.toISOString().split("T")[0]);
    setDataFim(fim.toISOString().split("T")[0]);
  }

   if (periodo === "trimestre") {
    // Próximos 90 dias
    const ini = new Date();               // hoje
    const fim = new Date();
    fim.setDate(hoje.getDate() + 90);     // hoje + 90 dias

    setDataIni(ini.toISOString().split("T")[0]);
    setDataFim(fim.toISOString().split("T")[0]);
  }

  
  
 

  if (periodo === "hoje") {
    const d = hoje.toISOString().split("T")[0];
    setDataIni(hojeMaisDias(-1));
    setDataFim(hojeMaisDias(7));
  }
}, [periodo]);

 
async function pagarSelecionadas() {
  if (loading) return; // 🔒 trava dupla execução

  if (selecionadas.length === 0) {
    alert("Selecione ao menos 1 conta.");
    return;
  }

  if (!conta_id || conta_id === 0) {
    alert("Selecione a conta bancária.");
    return;
  }

  setLoading(true); // 🔒 trava aqui

  try {
    const url = buildWebhookUrl("pagar_contas");
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        contas: selecionadas,
        conta_id
      }),
    });

    const data = await resp.json();

    if (data?.erro) {
      alert(data.erro);
      return;
    }

    alert("Contas pagas com sucesso!");
    setSelecionadas([]);
    pesquisar();

  } catch (err) {
    alert("Erro ao pagar contas.");
  } finally {
    setLoading(false); // 🔓 libera
  }
}

 

  function toggleSelecionada(id) {
  setSelecionadas(prev =>
    prev.includes(id)
      ? prev.filter(x => x !== id)
      : [...prev, id]
  );
}

 
  //------------------------------------------------------------------
  // 3) PESQUISAR
  //------------------------------------------------------------------
  async function pesquisar() {
    try {
      setLoading(true);

      const url = buildWebhookUrl("consultarcontapagar", {
        empresa_id,
        status,
        data_ini: dataIni,
        data_fim: dataFim,
        fornecedor_id,
        somente_vencidas:somenteVencidas
      });

      const resp = await fetch(url);
      const texto = await resp.text();

      let json = [];
      try {
        json = JSON.parse(texto);
      } catch {}

      setLista(json); 

    // calcular total do período
    const soma = json.reduce((acc, item) => acc + Number(item.valor || 0), 0);
    setTotalPeriodo(soma);

    } catch (e) {
      console.log("ERRO PESQUISA:", e);
      alert("Erro ao carregar contas a pagar.");
    } finally {
      setLoading(false);
    }
  }

  //------------------------------------------------------------------
  // 4) EXCLUIR CONTA
  //------------------------------------------------------------------
  async function excluir(id) {
    if (!confirm("Confirmar exclusão?")) return;

    try {
      const url = buildWebhookUrl("exclui_conta_pagar"); // <<< trocar pelo webhook real

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, empresa_id }),
      });

      const texto = await resp.text();
      let json = {};

      try {
        json = JSON.parse(texto);
      } catch {}

      if (texto.includes("foreign key") || texto.includes("violates")) {
        alert("Não é possível excluir: esta conta possui vínculos.");
        return;
      }

      alert(json?.message || "Excluído com sucesso!");
      pesquisar();
    } catch (e) {
      console.log("ERRO EXCLUIR:", e);
      alert("Erro ao excluir");
    }
  }

  //------------------------------------------------------------------
  useEffect(() => {
    carregarFornecedores();
     
  }, []);


  

  //------------------------------------------------------------------
return (
  <div className="p-4">

    {/* HEADER */}
    <div className="mb-4 flex flex-col gap-3 rounded-xl bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-bold text-blue-800">Contas a Pagar</h2>
        <p className="text-base font-bold text-slate-600">
          Consulte, selecione e pague contas com poucos cliques.
        </p>
      </div>
<div className="flex flex-wrap items-center gap-3">
  {/* AÇÃO PRINCIPAL */}
  <button
    onClick={() => navigate("/nova-conta-pagar")}
    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
  >
    + Nova conta
  </button> 

  {/* AÇÕES SECUNDÁRIAS */}
  <button
    onClick={() => window.print()}
    className="text-sm font-semibold text-slate-600 hover:text-slate-800"
  >
    🖨️ Imprimir
  </button>

  <button
    onClick={() => navigate("/excluir-parcelamento-pagar")}
    className="text-sm font-semibold text-red-600 hover:text-red-700"
  >
    Excluir parcelamento
  </button>
</div>

    </div>

    {/* RESUMOS */}
    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="rounded-xl border-l-4 border-blue-600 bg-white p-4">
        <p className="text-xs font-semibold text-slate-500">Total do período</p>
        <p className="mt-1 text-xl font-bold text-slate-900">
          {totalPeriodo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      </div>

      <div className="rounded-xl border-l-4 border-amber-500 bg-white p-4">
        <p className="text-xs font-semibold text-slate-500">Status</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {status === "0" ? "Todos" : status}
        </p>
        <p className="text-xs text-slate-500">
          {somenteVencidas ? "Somente vencidas" : "Inclui todas"}
        </p>
      </div>

      <div className="rounded-xl border-l-4 border-emerald-600 bg-white p-4">
        <p className="text-base font-bold text-slate-900">Conta bancária</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {dadosConta?.conta_nome ?? "Não selecionada"}
        </p>
        <p className="text-base text-green-500 font-bold">
          {dadosConta
            ? `Saldo: R$ ${Number(dadosConta.saldo_final).toLocaleString("pt-BR")}`
            : "Selecione para ver saldo"}
        </p>
      </div>
    </div>

    {/* FILTROS + CONTA */}
    <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">

      {/* FILTROS */}
<details className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4">
  <summary className="cursor-pointer text-base font-bold text-slate-900">
     <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">🔎 Filtros</span>
              <span className="text-xs text-slate-500">
                {dataIni || dataFim ? `${dataIni || "--"} → ${dataFim || "--"}` : "sem datas"}
              </span>
            </div>
            <span className="text-xs text-slate-500">clique para abrir/fechar</span>
          </div>
  </summary>

  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-7">

    {/* Data Inicial */}
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        Data inicial
      </label>
      <input
        type="date"
        value={dataIni}
        onChange={e => setDataIni(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>

    {/* Data Final */}
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        Data final
      </label>
      <input
        type="date"
        value={dataFim}
        onChange={e => setDataFim(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>

    {/* Status */}
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        Status
      </label>
      <select
        value={status}
        onChange={e => setStatus(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm font-semibold"
      >
        <option value="0">Todos</option>
        <option value="aberto">Aberto</option>
        <option value="pago">Pago</option>
      </select>
    </div>

    {/* Fornecedor */}
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        Fornecedor
      </label>
      <select
        value={fornecedor_id}
        onChange={e => setFornecedorId(Number(e.target.value))}
        className="w-full rounded-lg border px-3 py-2 text-sm font-semibold"
      >
        <option value={0}>Todos</option>
        {fornecedores.map(f => (
          <option key={f.id} value={f.id}>{f.nome}</option>
        ))}
      </select>
    </div>

    {/* Conta Bancária */}
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        Conta bancária
      </label>
      <select
        value={conta_id}
        onChange={async (e) => {
          const id = Number(e.target.value);
          setContaId(id);

          if (id === 0) {
            setDadosConta(null);
            return;
          }

          const empresa = localStorage.getItem("empresa_id") || 1;

          const url = buildWebhookUrl("consultasaldo", {
            inicio: new Date().toISOString().split("T")[0],
            fim: new Date().toISOString().split("T")[0],
            empresa_id: empresa,
            conta_id: id,
          });

          const resp = await fetch(url);
          const json = await resp.json();
          setDadosConta(json[0]);
        }}
        className="w-full rounded-lg border px-3 py-2 text-sm font-semibold"
      >
        <option value={0}>Selecione...</option>
        {contas.map(ct => (
          <option key={ct.id} value={ct.id}>{ct.nome}</option>
        ))}
      </select>
    </div>

    {/* Checkbox */}
    <div className="flex items-center">
      <label className="flex items-center gap-10 text-sm font-semibold">
        <input
          type="checkbox"
          checked={somenteVencidas}
          onChange={e => setSomenteVencidas(e.target.checked)}
        />
        Somente vencidas
      </label>
    </div>

  </div>

  {/* BOTÕES */}
  <div className="mt-6 flex flex-wrap justify-end gap-3 border-t pt-4">
    <button
      onClick={pagarSelecionadas}
      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
    >
      Pagar selecionadas
      {selecionadas.length > 0 && (
        <span className="ml-2 rounded-full bg-white/20 px-2 text-xs">
          {selecionadas.length}
        </span>
      )}
    </button>

    <button
      onClick={pesquisar}
      className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition"
    >
      Pesquisar
    </button>
  </div>
</details>


      {/* CONTA BANCÁRIA */}
       
    </div>

    {/* TABELA */}
    <div className="rounded-xl border border-blue-100 bg-white overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-blue-50 text-blue-900 border-b border-blue-200">
          <tr>
            <th className="px-3 py-3">Sel.</th>
            <th className="px-3 py-3 text-left">ID</th>
            <th className="px-3 py-3 text-left">Descrição</th>
            <th className="px-3 py-3 text-left">Vencimento</th>
            <th className="px-3 py-3 text-left">Fornecedor</th>
            <th className="px-3 py-3 text-right">Valor</th>
            <th className="px-3 py-3 text-left">Status</th>
            <th className="px-3 py-3 text-right">Ações</th>
          </tr>
        </thead>

        <tbody>
          {lista.map(c => {
            const statusClass =
              c.status === "pago"
                ? "bg-emerald-200 text-emerald-900"
                : "bg-amber-200 text-amber-900";

            return (
              <tr key={c.id} className="border-b hover:bg-blue-50">
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selecionadas.includes(c.id)}
                    onChange={() => toggleSelecionada(c.id)}
                    disabled={c.status === "pago"}
                  />
                </td>

                <td className="px-3 py-2 font-semibold">{c.id}</td>
                <td className="px-3 py-2 font-semibold">{c.descricao}</td>
                <td className="px-3 py-2">{formatarDataBR(c.vencimento)}</td>
                <td className="px-3 py-2">{c.fornecedor}</td>

                <td className="px-3 py-2 text-right font-bold">
                  {Number(c.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>

                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass}`}>
                    {c.status}
                  </span>
                </td>

                <td className="px-3 py-2 text-right">
                  {c.status === "aberto" && (
                    <>
                      <button
                        onClick={() => navigate(`/edit-conta-pagar/${c.id}`)}
                        className="mr-3 text-blue-700 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluir(c.id)}
                        className="text-red-700 hover:underline"
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

  </div>
);

   
}
