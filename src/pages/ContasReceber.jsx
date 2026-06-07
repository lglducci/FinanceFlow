    import { useEffect, useState, useRef } from "react";
 import { buildWebhookUrl } from "../config/globals";
 import { useNavigate } from "react-router-dom"; 
 import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
import { Funnel } from "lucide-react";

 
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
const [modalFiltro, setModalFiltro] = useState(false);
const [filtroTemp, setFiltroTemp] = useState({
  dataIni: hojeMaisDias(-3),
  dataFim: hojeMaisDias(15),
  fornecedor_id: 0,
  status: "0",
  somenteVencidas: false,
});

  function formatarDataBR(data) {
  if (!data) return "";
  const d = new Date(data);
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const ano = d.getUTCFullYear();
  return `${dia}-${mes}-${ano}`;
}


function labelContaDrop(c) {
  const nome = c.nome || c.conta_nome || "Conta";
  const ag = c.agencia ? `Ag: ${c.agencia}` : "";
  const cc = c.conta ? `Conta: ${c.conta}` : "";
  const dados = [ag, cc].filter(Boolean).join(" • ");
  return dados ? `${nome} — ${dados}` : nome;
}

function contaSelecionadaAtual() {
  return contas.find((c) => String(c.id ?? c.conta_id) === String(conta_id));
}

const contaAtual = contaSelecionadaAtual();
const corContaAtual = contaAtual?.cor_hex || "#16a34a";

async function selecionarContaBancaria(valor) {
  const id = Number(valor);
  setContaId(id);

  if (id === 0) {
    setDadosConta(null);
    return;
  }

  const url = buildWebhookUrl("consultasaldo", {
    inicio: hojeLocal(),
    fim: hojeLocal(),
    empresa_id,
    conta_id: id,
  });

  const resp = await fetch(url);
  const json = await resp.json();
  setDadosConta(Array.isArray(json) ? json[0] : json);
}

function abrirModalFiltro() {
  setFiltroTemp({
    dataIni,
    dataFim,
    fornecedor_id,
    status,
    somenteVencidas,
  });
  setModalFiltro(true);
}

function aplicarFiltros() {
  setDataIni(filtroTemp.dataIni);
  setDataFim(filtroTemp.dataFim);
  setFornecedorId(Number(filtroTemp.fornecedor_id || 0));
  setStatus(filtroTemp.status || "0");
  setSomenteVencidas(!!filtroTemp.somenteVencidas);
  setModalFiltro(false);

  setTimeout(() => {
    pesquisar();
  }, 50);
}

   const btnPadrao = "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";



 // CARREGA CONTAS BANCÁRIAS
async function carregarContas() {
  try {
    const url = buildWebhookUrl("listacontas", { empresa_id });
    const resp = await fetch(url);
    const json = await resp.json();
    const lista = Array.isArray(json) ? json : [];

    setContas(lista.map((c) => ({
      ...c,
      id: c.id ?? c.conta_id,
      conta_id: c.conta_id ?? c.id,
      nome: c.nome ?? c.conta_nome,
      conta_nome: c.conta_nome ?? c.nome,
      icone_url: String(c.icone_url || c.icone || c.logo_url || "").trim(),
      cor_hex: c.cor_hex || "#e2e8f0",
    })));
  } catch (e) {
    console.log("ERRO ao carregar contas:", e);
    setContas([]);
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
          className="btn-pill btn-green"
        >
          + Nova conta
        </button>

        <button
          onClick={() => window.print()}
          className="btn-pill btn-gray"
        >
          🖨️ Imprimir
        </button>
      </div>
    </div>

    {/* RESUMOS */}
    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
      

    
  
    </div>

    {/* CONTA + AÇÕES */}
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Conta bancária para receber
            </label>

            {(() => {
              const conta = contaSelecionadaAtual();
              const iconeConta = String(conta?.icone_url || "").trim();
              const corConta = conta?.cor_hex || "#e2e8f0";

              return (
                <div className="flex items-center gap-2">
                  {iconeConta ? (
                    <img
                      src={iconeConta}
                      alt="Banco"
                      className="h-9 w-9 rounded-full border bg-white object-contain"
                      style={{ borderColor: corConta }}
                    />
                  ) : (
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full border text-sm"
                      style={{ backgroundColor: `${corConta}22`, borderColor: corConta }}
                    >
                      🏦
                    </div>
                  )}

                  <select
                    value={conta_id}
                    onChange={(e) => selecionarContaBancaria(e.target.value)}
                    className="min-w-[340px] rounded-lg border px-3 py-2 text-base font-bold text-blue-900"
                  >
                    <option value={0}>Selecione...</option>
                    {contas.map((ct) => (
                      <option key={ct.id ?? ct.conta_id} value={ct.id ?? ct.conta_id}>
                        {labelContaDrop(ct)}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })()}
          </div>
                    
            {dadosConta && (
              <div
                className="rounded-xl border px-4 py-2 text-sm font-black whitespace-nowrap"
                style={{
              borderColor: "#052386" ,
              backgroundColor: corContaAtual  ,
              color: "#052386",
            }}
              >
                Saldo:{" "}
                {Number(dadosConta.saldo_final || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
)}




        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800">
            {dataIni} → {dataFim}
            {somenteVencidas ? " • Vencidas" : ""}
          </div>

          <button
            onClick={abrirModalFiltro}
            className="btn-pill btn-white flex items-center gap-2 whitespace-nowrap"
          >
            <Funnel size={16} />
            Filtros
          </button>

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
            disabled={loading}
            className="btn-pill btn-gray whitespace-nowrap disabled:opacity-60"
          >
            {loading ? "Pesquisando..." : "🔎 Pesquisar"}
          </button>
        </div>
      </div>
    </div>

    {/* TABELA */}
        <div className="max-h-[720px] overflow-y-auto overflow-x-auto"> 
       <table className="w-full text-sm ">
       <thead className="bg-gray-200 text-gray-600 text-black">
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

    {modalFiltro && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-black text-blue-900">Filtros</h3>
            <button
              type="button"
              onClick={() => setModalFiltro(false)}
              className="rounded-full bg-slate-100 px-3 py-1 font-black text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">Data início</label>
              <input
                type="date"
                value={filtroTemp.dataIni}
                disabled={filtroTemp.somenteVencidas}
                onChange={(e) => setFiltroTemp((p) => ({ ...p, dataIni: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 font-semibold disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">Data fim</label>
              <input
                type="date"
                value={filtroTemp.dataFim}
                disabled={filtroTemp.somenteVencidas}
                onChange={(e) => setFiltroTemp((p) => ({ ...p, dataFim: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 font-semibold disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">Status</label>
              <select
                value={filtroTemp.status}
                onChange={(e) => setFiltroTemp((p) => ({ ...p, status: e.target.value }))}
                className="w-full rounded-lg border bg-white px-3 py-2 font-semibold"
              >
                <option value="0">Todos</option>
                <option value="aberto">Aberto</option>
                <option value="recebido">Recebido</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">Fornecedor / Cliente</label>
              <select
                value={filtroTemp.fornecedor_id}
                onChange={(e) => setFiltroTemp((p) => ({ ...p, fornecedor_id: Number(e.target.value) }))}
                className="w-full rounded-lg border bg-white px-3 py-2 font-semibold"
              >
                <option value={0}>Todos</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </div>

            <label className="md:col-span-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700">
              <input
                type="checkbox"
                checked={filtroTemp.somenteVencidas}
                onChange={(e) => setFiltroTemp((p) => ({ ...p, somenteVencidas: e.target.checked }))}
                className="h-4 w-4"
              />
              Somente vencidas
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={() =>
                setFiltroTemp({
                  dataIni: hojeMaisDias(-3),
                  dataFim: hojeMaisDias(15),
                  fornecedor_id: 0,
                  status: "0",
                  somenteVencidas: false,
                })
              }
              className="btn-pill btn-white"
            >
              Limpar
            </button>

            <button
              type="button"
              onClick={aplicarFiltros}
              className="btn-pill btn-dark-blue"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);


}
