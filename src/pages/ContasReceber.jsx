 import { useEffect, useState, useRef } from "react";
 import { buildWebhookUrl } from "../config/globals";
 import { useNavigate } from "react-router-dom"; 
 import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";

 
export default function ContasReceber() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

  const [lista, setLista] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  const [status, setStatus] = useState("0");
  const [fornecedor_id, setFornecedorId] = useState(0);

  const lotesOcultosRef = useRef(new Set());
const idsOcultosRef = useRef(new Set());


   const [contas, setContas] = useState([]);
  const [dadosConta, setDadosConta] = useState(null);
  const [conta_id, setContaId] = useState(0);

  const [saldoConta, setSaldoConta] = useState(0);

  const [periodo, setPeriodo] = useState("hoje");
  const [dataIni, setDataIni] = useState(hojeMaisDias(-3));
  const [dataFim, setDataFim] = useState(hojeMaisDias(15));
  const [loading, setLoading] = useState(false);
 const [totalPeriodo, setTotalPeriodo] = useState(0);
 const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
 const [selecionadas, setSelecionadas] = useState([]);
const [somenteVencidas, setSomenteVencidas] = useState(false);

  function formatarDataBR(data) {
  if (!data) return "";
  const d = new Date(data);
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const ano = d.getUTCFullYear();
  return `${dia}-${mes}-${ano}`;
}

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
 
    

  if (periodo === "hoje") {
    const d = hoje.toISOString().split("T")[0];
    setDataIni(hojeMaisDias(-1));
    setDataFim(hojeMaisDias(7));
  }
}, [periodo]);

 
async function receberSelecionadas() {
  if (selecionadas.length === 0) {
    alert("Selecione ao menos 1 conta.");
    return;
  }

  if (!conta_id || conta_id === 0) {
    alert("Selecione a CONTA BANCÁRIA para receber.");
    return;
  }

  if (!confirm(`Receber ${selecionadas.length} conta(s) usando esta conta bancária?`)) return;

  try {
    const url = buildWebhookUrl("receber_contas");
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

    if (!resp.ok) {
      alert(data.mensagem || "Erro ao receber contas.");
      return;
    }

    alert(data.mensagem || "Contas recebidas com sucesso!");

    setSelecionadas([]);
    pesquisar(); // ✅ recarrega a lista certo

  } catch (err) {
    console.error(err);
    alert("Erro ao receber contas.");
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

      const url = buildWebhookUrl("consultarcontareceber", {
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


      let listaFinal = Array.isArray(json) ? json : [];

        listaFinal = listaFinal.filter((x) => {
          const id = String(x.id);
          const lote = String(x.lote_id || "");

          return (
            !idsOcultosRef.current.has(id) &&
            !lotesOcultosRef.current.has(lote)
          );
        });

        setLista(listaFinal);

        const soma = listaFinal.reduce((acc, item) => acc + Number(item.valor || 0), 0);
        setTotalPeriodo(soma);
 

    } catch (e) {
      console.log("ERRO PESQUISA:", e);
      alert("Erro ao carregar contas a receber.");
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
      const url = buildWebhookUrl("exclui_conta_receber"); // <<< trocar pelo webhook real

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


     useEffect(() => {
    pesquisar();
     
  }, []);


  async function excluirParcelamento(c) {
  if (!confirm("Excluir TODAS as parcelas deste parcelamento?")) return;

  const lote = String(c.lote_id || "");
  const id = String(c.id);

  lotesOcultosRef.current.add(lote);
  idsOcultosRef.current.add(id);

  setLista((prev) =>
    prev.filter((x) =>
      String(x.id) !== id &&
      String(x.lote_id || "") !== lote
    )
  );

  setSelecionadas([]);

  try {
    await fetch(buildWebhookUrl("excluirparcelasreceber"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        lote_id: c.lote_id,
      }),
    });

    alert("Parcelamento excluído com sucesso!");
    window.dispatchEvent(new Event("contabil-atualizado"));
  } catch (e) {
    alert("Erro ao excluir parcelamento.");
  }
}

  //------------------------------------------------------------------

 return (
  <div className="p-4">
    {/* HEADER */}
 <div className="mb-4 flex flex-col gap-3 rounded-xl bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <h2 className="text-xl font-bold text-blue-800">Contas a Receber</h2>
        <p className="text-sm text-slate-500">
          Consulte, selecione e receba contas com poucos cliques.
        </p>
      </div>

      {/* AÇÕES PRINCIPAIS */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate("/nova-conta-receber")}
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
          + Nova conta
        </button>

       
        {/* MENU “MAIS AÇÕES” (simples) */}
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
              className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-white
                        bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-95
                        transition-all duration-200
                        inline-flex items-center gap-2
                      ">
       
            🖨️ Imprimir
          </button>

        {/*}  <button
            onClick={() => navigate("/excluir-parcelamento-receber")} 
              className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-red-700
                        bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-95
                        transition-all duration-200
                        inline-flex items-center gap-2
                      ">
       
            Excluir parcelamento
          </button>*/}
        </div>
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

     <div className="rounded-xl border-l-4 border-blue-600 bg-white p-4">

        <p className="text-xs font-semibold text-slate-500">Status</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {status === "0" ? "Todos" : status}
        </p>
        <p className="text-xs text-slate-500">
          {somenteVencidas ? "Somente vencidas" : "Inclui todas"}
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

    {/* FILTROS + CONTA (layout moderno) */}
 
  <details
    open
    className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
  >
    <summary className="list-none cursor-pointer">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-900">🔎 Filtros</span>
          <span className="text-xs text-slate-500">
            {dataIni || dataFim ? `${dataIni || "--"} → ${dataFim || "--"}` : "sem datas"}
          </span>
        </div>

        <span className="text-xs text-slate-500">
          clique para abrir/fechar
        </span>
      </div>
    </summary>

    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
      <div className="xl:col-span-2">
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          Data início
        </label>
        <input
          type="date"
          value={dataIni}
          disabled={somenteVencidas}
          onChange={(e) => setDataIni(e.target.value)}
          className={`w-full rounded-lg border px-3 py-2 text-sm ${
            somenteVencidas ? "bg-slate-100 text-slate-500" : "bg-white"
          }`}
        />
      </div>

      <div className="xl:col-span-2">
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          Data fim
        </label>
        <input
          type="date"
          value={dataFim}
          disabled={somenteVencidas}
          onChange={(e) => setDataFim(e.target.value)}
          className={`w-full rounded-lg border px-3 py-2 text-sm ${
            somenteVencidas ? "bg-slate-100 text-slate-500" : "bg-white"
          }`}
        />
      </div>

      <div className="xl:col-span-2">
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm font-semibold"
        >
          <option value="0">Todos</option>
          <option value="aberto">Aberto</option>
          <option value="recebido">Recebido</option>
        </select>
      </div>

      <div className="xl:col-span-3">
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          Fornecedor
        </label>
        <select
          value={fornecedor_id}
          onChange={(e) => setFornecedorId(Number(e.target.value))}
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm font-semibold"
        >
          <option value={0}>Todos</option>
          {fornecedores.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="xl:col-span-3">
        <label className="mb-1 block text-xs font-semibold text-slate-600">
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
          {contas.map((ct) => (
            <option key={ct.id} value={ct.id}>
              {ct.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end xl:col-span-4">
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={somenteVencidas}
            onChange={(e) => setSomenteVencidas(e.target.checked)}
          />
          Somente vencidas
        </label>
      </div>

      <div className="flex items-end justify-end gap-3 border-t pt-4 md:col-span-2 xl:col-span-8">
        <button
          onClick={receberSelecionadas}
          className="btn-pill btn-black whitespace-nowrap"
        >
          Receber selecionadas
          {selecionadas.length > 0 && (
            <span className="ml-2 rounded-full bg-white/20 px-2 text-xs">
              {selecionadas.length}
            </span>
          )}
        </button>

        <button
          onClick={pesquisar}
          className="btn-pill btn-yellow whitespace-nowrap"
        >
          🔎 Pesquisar
        </button>
      </div>
    </div>
  </details>
 
    {/* TABELA */}
        <div className="max-h-[720px] overflow-y-auto overflow-x-auto"> 
      <table className="w-full text-base"> 
       <thead className="sticky top-0 z-20 bg-slate-800 text-white"> 
          <tr>
            <th className="px-3 py-3 text-left">Sel.</th>
            <th className="px-3 py-3 text-left">ID</th>
            <th className="px-3 py-3 text-left">Descrição</th>
            <th className="px-3 py-3 text-left">Vencimento</th>
            <th className="px-3 py-3 text-left">Categoria</th>
            <th className="px-3 py-3 text-left">Fornecedor</th>
            <th className="px-3 py-3 text-center">Parcelas</th>
            <th className="px-3 py-3 text-center">Nº</th>
            <th className="px-3 py-3 text-left">Status</th>
            <th className="px-3 py-3 text-right">Valor</th>
            <th className="px-3 py-3 text-right">Ações</th>
          </tr>
        </thead>

        <tbody>
          {lista.length === 0 && !loading && (
            <tr>
              <td colSpan={11} className="px-3 py-6 text-center text-slate-500">
                Nenhuma conta encontrada para o filtro selecionado.
              </td>
            </tr>
          )}

          {lista.map((c) => {
            const recebido = c.status === "recebido";
            const statusClass =
              c.status === "aberto"
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800";

            return (
              <tr key={c.id} className="border-b hover:bg-slate-50">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selecionadas.includes(c.id)}
                    onChange={() => toggleSelecionada(c.id)}
                    disabled={recebido}
                    className="h-4 w-4"
                  />
                </td>

                <td className="px-3 py-3 font-semibold text-slate-900">{c.id}</td>
                <td className="px-3 py-3 font-semibold text-slate-900">{c.descricao}</td>

                <td className="px-3 py-3">
                  {c.vencimento ? new Date(c.vencimento).toLocaleDateString("pt-BR") : ""}
                </td>

                <td className="px-3 py-3">{c.categoria}</td>
                <td className="px-3 py-3">{c.fornecedor}</td>

                <td className="px-3 py-3 text-center">{c.parcelas}</td>
                <td className="px-3 py-3 text-center">{c.parcela_num}</td>

                <td className="px-3 py-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass}`}>
                    {c.status}
                  </span>
                </td>

                <td className="px-3 py-3 text-right font-bold">
                  {Number(c.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>

                <td className="px-3 py-3 text-right">
                  {!recebido && (
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => navigate(`/edit-conta-receber/${c.id}`)}
                        className="text-blue-700 hover:underline font-semibold"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => excluir(c.id)}
                        className="text-red-700 hover:underline font-semibold"
                      >
                        Excluir
                      </button>

                      {Number(c.parcela_num) === 1 &&
                                Number(c.parcelas) > 1 &&
                                c.status === "aberto" &&
                                c.lote_id && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      excluirParcelamento(c);
                                    }}
                                    className="rounded-full bg-red-700 px-3 py-1 text-xs font-black text-white hover:bg-red-800"
                                  >
                                    Excluir lote
                                  </button>
                                )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr className="bg-slate-50">
            <td colSpan={9} className="px-3 py-4 text-right font-semibold text-slate-700">
              Total do período
            </td>
            <td className="px-3 py-4 text-right text-emerald-700 font-extrabold">
              {totalPeriodo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
);


}
