  
 import { useEffect, useState, useRef } from "react";
 import { buildWebhookUrl } from "../config/globals";
 import { useNavigate } from "react-router-dom";
 import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
 import ModalBase from "../components/ModalBase";
 import { Funnel } from "lucide-react";
 import NovoLancamentoDrawer from "./NovoLancamento";
 
 


export default function ContasPagar() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);
  const [somenteVencidas, setSomenteVencidas] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
 
 const [idsOcultos, setIdsOcultos] = useState([]);
const lotesOcultosRef = useRef(new Set());
const idsOcultosRef = useRef(new Set());

const [drawerNovo, setDrawerNovo] = useState(false);
const [tipoNovo, setTipoNovo] = useState(null);


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
  {/*}
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");*/}

const [dataIni, setDataIni] = useState(hojeMaisDias(-1));
const [dataFim, setDataFim] = useState(hojeMaisDias(7));

  
  const [loading, setLoading] = useState(false);
 const [totalPeriodo, setTotalPeriodo] = useState(0);
 const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
 const [selecionadas, setSelecionadas] = useState([]);
const [modalFiltro, setModalFiltro] = useState(false);
const [filtroTemp, setFiltroTemp] = useState({
  dataIni: hojeMaisDias(-1),
  dataFim: hojeMaisDias(7),
  fornecedor_id: 0,
  status: "0",
  somenteVencidas: false,
});

  const btnPadrao = "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";


 // CARREGA CONTAS BANCÁRIAS
async function carregarContas() {
  try {
    const url = buildWebhookUrl("listacontas", { empresa_id });
    const resp = await fetch(url);
    const json = await resp.json();
    const lista = Array.isArray(json) ? json : [];

    setContas(
      lista.map((c) => ({
        ...c,
        id: c.id ?? c.conta_id,
        conta_id: c.conta_id ?? c.id,
        nome: c.nome ?? c.conta_nome,
        conta_nome: c.conta_nome ?? c.nome,
        icone_url: String(c.icone_url || c.icone || c.url_icone || "").trim(),
        cor_hex: c.cor_hex || c.cor || "#1e40af",
      }))
    );
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
     window.dispatchEvent(new Event("contabil-atualizado"));
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
 async function pesquisar(loteRemover = null, filtrosOverride = null) {
    try {
      setLoading(true);

      const f = filtrosOverride || {};
      const statusBusca = f.status ?? status;
      const dataIniBusca = f.dataIni ?? dataIni;
      const dataFimBusca = f.dataFim ?? dataFim;
      const fornecedorBusca = f.fornecedor_id ?? fornecedor_id;
      const somenteVencidasBusca = f.somenteVencidas ?? somenteVencidas;

      const url = buildWebhookUrl("consultarcontapagar", {
        empresa_id,
        status: statusBusca,
        data_ini: dataIniBusca,
        data_fim: dataFimBusca,
        fornecedor_id: fornecedorBusca,
        somente_vencidas: somenteVencidasBusca,
        _t: Date.now()
      });

      const resp = await fetch(url);
      const texto = await resp.text();

      let json = [];
      try {
        json = JSON.parse(texto);
      } catch {}

   let listaFinal = Array.isArray(json) ? json : [];

if (loteRemover) {
  listaFinal = listaFinal.filter(
    (item) => String(item.lote_id) !== String(loteRemover)
  );
}

listaFinal = listaFinal.filter((x) => {
  const id = String(x.id);
  const lote = String(x.lote_id || "");

  return !idsOcultosRef.current.has(id) &&
         !lotesOcultosRef.current.has(lote);
});

setLista(listaFinal);

const soma = listaFinal.reduce((acc, item) => acc + Number(item.valor || 0), 0);
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
    await fetch(buildWebhookUrl("excluirparcelaspagar"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        lote_id: c.lote_id,
      }),
    });

    alert("Parcelamento excluído com sucesso!");
  } catch (e) {
    alert("Erro ao excluir parcelamento.");
  }
}




function labelContaDrop(c) {
  const ag = c.agencia ? `Ag: ${c.agencia}` : "";
  const cc = c.conta ? `Conta: ${c.conta}` : "";
  const dados = [ag, cc].filter(Boolean).join(" • ");
  return dados ? `${c.nome} — ${dados}` : `${c.nome || "Conta"}`;
}

const contaSelecionada = contas.find((c) =>
  String(c.id ?? c.conta_id) === String(conta_id)
);

const iconeConta = String(contaSelecionada?.icone_url || "").trim();
const corConta = contaSelecionada?.cor_hex || "#1e40af";

async function selecionarContaBancaria(valor) {
  const id = Number(valor);
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
}

 const listaVisivel = lista.filter(
  (c) => !idsOcultos.includes(Number(c.id))
);


  //------------------------------------------------------------------
 
 return (
  <div className="flex gap-4 p-4">
    <main className={drawerNovo ? "w-[65%] transition-all" : "w-full transition-all"}> 

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
      {/*<button
        onClick={() => navigate("/nova-conta-pagar")}
          className="btn-pill btn-emerald"
                      >
        + Nova conta
      </button> */}

      
     <button
      //onClick={abrirNovoLancamento}
       onClick={() => {
          setTipoNovo(null);
          setDrawerNovo(true);
        }}
              className="btn-pill btn-emerald"
                            >
      + Novo Conta Pagar
    </button>

  {/* AÇÕES SECUNDÁRIAS */}
  <button
    onClick={() => window.print()}
       className="btn-pill btn-gray"
         >
    🖨️ Imprimir
  </button>

{/*}  <button
    onClick={() => navigate("/excluir-parcelamento-pagar")}
     className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-red-700
                        bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300
                        border-2 border-black
                         shadow-[0_5px_0_rgba(0,0,0,0.45),0_8px_18px_rgba(0,0,0,0.25)]
                        hover:brightness-110 hover:scale-105
                         active:scale-95 active:translate-y-[2px]
                        transition-all duration-200
                         inline-flex items-center justify-center gap-2
                      "> 

    Excluir parcelamento
  </button>*/}
</div>

    </div>

    {/* RESUMOS */}
    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
       
       
     

      
    </div>

    {/* CONTA + AÇÕES */}
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Conta bancária
          </label>

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
                className="flex h-9 w-9 items-center justify-center rounded-full border bg-gray-100 text-sm"
                style={{ borderColor: corConta }}
              >
                🏦
              </div>
            )}

            <select
              value={conta_id}
              onChange={(e) => selecionarContaBancaria(e.target.value)}
              className="block min-w-[340px] rounded-lg border px-3 py-2 text-base font-bold text-blue-900"
            >
              <option value={0}>Selecione...</option>
              {contas.map((ct) => {
                const id = ct.id ?? ct.conta_id;
                return (
                  <option key={id} value={id}>
                    {labelContaDrop(ct)}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        
          
        {dadosConta && (
          <div className="rounded-xl border px-4 py-2 text-sm font-black"
            style={{ borderColor: corConta, color: corConta }}>
            Saldo: {Number(dadosConta.saldo_final || 0).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">

           <div className="mt-3 text-xs font-bold text-slate-500">
        Filtros: {dataIni} → {dataFim} • {status === "0" ? "Todos" : status} • {somenteVencidas ? "Somente vencidas" : "Todas"}
      </div>
      
          <button
            onClick={() => {
              setFiltroTemp({
                dataIni,
                dataFim,
                fornecedor_id,
                status,
                somenteVencidas,
              });
              setModalFiltro(true);
            }}
            className="btn-pill btn-white flex items-center gap-2"
          >
            <Funnel size={16} />
            Filtros
          </button>
          
           <button
            onClick={pesquisar}
            disabled={loading}
            className="btn-pill btn-gray whitespace-nowrap disabled:opacity-60"
          >
            {loading ? "Pesquisando..." : "🔎 Pesquisar"}
          </button>


          <button
            onClick={pagarSelecionadas}
            className="btn-pill btn-black whitespace-nowrap"
          >
            Pagar selecionadas
            {selecionadas.length > 0 && (
              <span className="ml-2 rounded-full bg-white/20 px-2 text-xs">
                {selecionadas.length}
              </span>
            )}
          </button>
        </div>
      </div>

      
    </div>

     {/* TABELA */}
     <div className="max-h-[720px] overflow-y-auto overflow-x-auto"> 
       <table className="w-full text-sm ">
       <thead className="bg-gray-200 text-gray-600 text-black">
      <tr>
       <th className="w-[45px] px-2 py-3 text-center">Sel.</th>
      <th className="w-[60px] px-2 py-3 text-left">ID</th>
      <th className="w-[220px] px-3 py-3 text-left">Descrição</th>
      <th className="w-[105px] px-2 py-3 text-left">Venc.</th>
      <th className="w-[180px] px-3 py-3 text-left">Fornecedor</th>
      <th className="w-[55px] px-1 py-3 text-center">Parc.</th>
      <th className="w-[55px] px-1 py-3 text-center">Qtd.</th>
      <th className="w-[120px] px-3 py-3 text-right">Valor</th>
      <th className="w-[90px] px-2 py-3 text-center">Status</th>
       <th className="w-[90px] px-2 py-3 text-center">lote</th>
      <th className="w-[250px] px-3 py-3 text-center">Ações</th>
      </tr>
    </thead>

    <tbody>
      {listaVisivel.map((c) => {
        const statusClass =
          c.status === "pago"
            ? "bg-emerald-200 text-emerald-900"
            : "bg-amber-200 text-amber-900";

        return (
          <tr key={c.id} className="border-b hover:bg-blue-50">
            <td className="px-2 py-2 text-center">
              <input
                type="checkbox"
                checked={selecionadas.includes(c.id)}
                onChange={() => toggleSelecionada(c.id)}
                disabled={c.status === "pago"}
              />
            </td>

            <td className="px-2 py-2 font-semibold">{c.id}</td>

            <td className="truncate px-3 py-2 font-semibold" title={c.descricao}>
              {c.descricao}
            </td>

            <td className="px-2 py-2">
              {formatarDataBR(c.vencimento)}
            </td>

            <td className="truncate px-3 py-2" title={c.fornecedor}>
              {c.fornecedor}
            </td>

            <td className="px-1 py-2 text-center font-bold">
              {c.parcela_num || "-"}
            </td>

            <td className="px-1 py-2 text-center font-bold">
              {c.parcelas || "-"}
            </td>

            <td className="px-3 py-2 text-right font-bold whitespace-nowrap">
              {Number(c.valor).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </td>

            <td className="px-2 py-2 text-center">
              <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass}`}>
                {c.status}
              </span>
            </td>
            <td className="px-2 py-2 text-xs text-slate-500">
                lote: {String(c.lote_id)}
              </td>

            <td className="px-3 py-2">
          {c.status === "aberto" && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => navigate(`/edit-conta-pagar/${c.id}`)}
                className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700 hover:bg-blue-200"
              >
                Editar
              </button>

              <button
                onClick={() => excluir(c.id)}
                className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700 hover:bg-red-200"
              >
                Excluir
              </button>

              {Number(c.parcela_num) === 1 &&
                Number(c.parcelas) > 1 &&
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
  </table>
</div>


    <ModalBase
      open={modalFiltro}
      onClose={() => setModalFiltro(false)}
      title="Filtros"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-700">Data inicial</label>
            <input
              type="date"
              value={filtroTemp.dataIni}
              onChange={(e) => setFiltroTemp((p) => ({ ...p, dataIni: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Data final</label>
            <input
              type="date"
              value={filtroTemp.dataFim}
              onChange={(e) => setFiltroTemp((p) => ({ ...p, dataFim: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Fornecedor</label>
          <select
            value={filtroTemp.fornecedor_id}
            onChange={(e) => setFiltroTemp((p) => ({ ...p, fornecedor_id: Number(e.target.value) }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value={0}>Todos</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Status</label>
          <select
            value={filtroTemp.status}
            onChange={(e) => setFiltroTemp((p) => ({ ...p, status: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="0">Todos</option>
            <option value="aberto">Aberto</option>
            <option value="pago">Pago</option>
          </select>
        </div>

        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={filtroTemp.somenteVencidas}
            onChange={(e) => setFiltroTemp((p) => ({ ...p, somenteVencidas: e.target.checked }))}
          />
          Somente vencidas
        </label>

        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={() => {
              setFiltroTemp({
                dataIni: hojeMaisDias(-1),
                dataFim: hojeMaisDias(7),
                fornecedor_id: 0,
                status: "0",
                somenteVencidas: false,
              });
            }}
            className="btn-pill btn-white"
          >
            Limpar
          </button>

          <button
            type="button"
            onClick={() => {
              setDataIni(filtroTemp.dataIni);
              setDataFim(filtroTemp.dataFim);
              setFornecedorId(Number(filtroTemp.fornecedor_id || 0));
              setStatus(filtroTemp.status || "0");
              setSomenteVencidas(!!filtroTemp.somenteVencidas);
              setModalFiltro(false);

              pesquisar(null, filtroTemp);
            }}
            className="btn-pill btn-dark-blue"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </ModalBase>
{/*coloquei o drawer aqui..  vamos agora ajeitar para o que falta */}
 
</main>
 
 {drawerNovo && (
  <aside className="w-[35%] min-w-[420px] max-w-[560px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
    <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
      <button
        type="button"
        onClick={() => {
          setTipoNovo(null);
          setDrawerNovo(false);
        }}
        className="rounded-full px-3 py-1 text-lg font-black text-blue-800 hover:bg-blue-100"
      >
        ←
      </button>

      <span className="text-sm font-black text-blue-900">
        Conta a pagar
      </span>

      <button
        type="button"
        onClick={() => {
          setTipoNovo(null);
          setDrawerNovo(false);
        }}
        className="rounded-full px-3 py-1 text-lg font-black text-slate-500 hover:bg-slate-200"
      >
        ✕
      </button>
    </div>

    <div className="h-[calc(100vh-88px)] overflow-y-auto bg-slate-50 p-3">
      <NovoLancamentoDrawer
        inicial={{
          titulo: "Conta a pagar",
          tipo: "saida",
          forma_pagamento: "aprazo",
          classificacao: "despesa",
        }}
        onBack={() => {
          setTipoNovo(null);
          setDrawerNovo(false);
        }}
        onClose={() => {
          setTipoNovo(null);
          setDrawerNovo(false);
        }}
        onSuccess={() => {
          setDrawerNovo(false);
          setTipoNovo(null);
          pesquisar();
        }}
      />
    </div>
  </aside>
)}


  </div>
);

   
}
