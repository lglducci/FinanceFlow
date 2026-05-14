 import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
import { fetchSeguro } from "../utils/apiSafe";

import ModalBase from "../components/ModalBase";
import FormCategoria from "../components/forms/FormCategoria";
import FormConta from "../components/forms/FormConta";
import FormFornecedorModal from "../components/forms/FormFornecedorModal";
import FormCartaoModal from "../components/forms/FormCartaoModal";
 
function BlocoEtapa({
  id,
  titulo,
    icone = "●",
  resumo,
  aberto,
  onAbrir,
  onFocusCampo,
  children,
  className = "",
}) {
  return (
    <div
      className={`overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-200 to-slate-300  shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-slate-200 ${className}`}
    >
      <div
        onClick={() => {
          onAbrir(id);

          setTimeout(() => {
            onFocusCampo?.();
          }, 80);
        }}
        className="flex w-full items-center justify-between px-5 py-4 text-left cursor-pointer"
      >
        <div>
         <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-base shadow-md">
              {icone}
            </span>
            <span className="text-sm font-bold text-slate-800">{titulo}</span>
          </div>

          {resumo && !aberto && (
            <div className="mt-1 text-sm font-bold text-purple-600">
              {resumo}
            </div>
          )}
        </div>

        <span className="text-lg font-bold text-purple-600">
          {aberto ? "⌃" : "⌄"}
        </span>
      </div>

      {aberto && (
        <div className="border-t border-slate-100 px-2 p-2 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}
export default function LancamentoRapidoDesktop() {

  
 const modoInicial = new URLSearchParams(window.location.search).get("modo") || "";

 const paramsIniciais = new URLSearchParams(window.location.search);
 const vencimentoParamRaw = paramsIniciais.get("vencimento");

const vencimentoParam =
  vencimentoParamRaw && /^\d{4}-\d{2}-\d{2}$/.test(vencimentoParamRaw)
    ? vencimentoParamRaw
    : hojeLocal();



{/*const tipoInicial =
  modoInicial === "entrada" || modoInicial === "receber"
    ? "entrada"
    : "saida";

const formaPagamentoInicial =
  modoInicial === "pagar" ? "aprazo" :
  modoInicial === "saida" ? "avista" :
  "";

const formaRecebimentoInicial =
  modoInicial === "receber" ? "aprazo" :
  modoInicial === "entrada" ? "avista" :
  "";*/}

 const tipoInicial =
  modoInicial === "entrada" || modoInicial === "receber"
    ? "entrada"
    : modoInicial === "saida" || modoInicial === "pagar" || modoInicial === "compra_cartao"
    ? "saida"
    : "";

const formaPagamentoInicial =
  modoInicial === "pagar" ? "aprazo" :
  modoInicial === "saida" ? "avista" :
  modoInicial === "compra_cartao" ? "cartao_credito" :
  "";

const formaRecebimentoInicial =
  modoInicial === "receber" ? "aprazo" :
  modoInicial === "entrada" ? "avista" :
  "";

  const mostrarCategoria = false;
  const navigate = useNavigate();
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa") ||
    "1";
  const classificacaoRef = useRef(null);
  const categoriaRef = useRef(null);
 const [etapaAberta, setEtapaAberta] = useState(
  modoInicial ? "valor" : "tipo"
);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [contas, setContas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [cartoes, setCartoes] = useState([]);

  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalConta, setModalConta] = useState(false);
  const [modalFornecedor, setModalFornecedor] = useState(false);
  const [modalCartao, setModalCartao] = useState(false);
 const tipoRef = useRef(null);
  const [cartaoSelecionado, setCartaoSelecionado] = useState("");
  const valorRef = useRef(null);
    const descricaoRef = useRef(null);
 
    const vencimentoRef = useRef(null);
    const parcelasRef = useRef(null);
    const [idxClassificacao, setIdxClassificacao] = useState(0);
 const contaRef = useRef(null);
  const fornecedorRef = useRef(null);
 const [form, setForm] = useState({
  empresa_id,
  tipo: tipoInicial,
  forma_pagamento: formaPagamentoInicial,
  forma_recebimento: formaRecebimentoInicial,
    valor: "",
    data: hojeLocal(),
    descricao: "",
    classificacao: "",
    categoria_id: "",
    conta_id: "",
    fornecedor_id: "",
    vencimento: vencimentoParam,
    parcelas: 1,
    parcela_num: 1,
    status: "aberto",
    doc_ref: "",
    origem: "WebApp",
  });

 useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  const valorParam = params.get("valor");
  const descricaoParam = params.get("descricao");
  const formaParam = params.get("forma");

  setForm((prev) => ({
    ...prev,
    valor: valorParam
      ? Number(String(valorParam).replace(",", ".")).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : prev.valor,

    descricao: descricaoParam || prev.descricao,

    forma_pagamento:
      prev.tipo === "saida" && formaParam ? formaParam : prev.forma_pagamento,

    forma_recebimento:
      prev.tipo === "entrada" && formaParam ? formaParam : prev.forma_recebimento,
  }));

  if (valorParam || descricaoParam || formaParam) {
    setEtapaAberta("categoria");
  }
}, []);

  const modo = (() => {
    if (form.tipo === "entrada") {
      if (form.forma_recebimento === "cartao_credito") return "receber_cartao";
      if (["boleto", "aprazo"].includes(form.forma_recebimento)) return "receber";
      return "financeiro";
    }

    if (form.tipo === "saida") {
      if (form.forma_pagamento === "cartao_credito") return "cartao_compra";
      if (["aprazo", "boleto"].includes(form.forma_pagamento)) return "pagar";
      return "financeiro";
    }

    return "";
  })();

  const formaSelecionada =
    form.tipo === "entrada" ? form.forma_recebimento : form.forma_pagamento;

  const mostrarContaFinanceira =
    (form.tipo === "entrada" &&
      ["avista", "pix", "cartao_debito"].includes(form.forma_recebimento)) ||
    (form.tipo === "saida" &&
      ["avista", "pix", "cartao_debito"].includes(form.forma_pagamento));

  const mostrarCartao =
    form.tipo === "saida" && form.forma_pagamento === "cartao_credito";

  const ehAPrazo =
    (form.tipo === "entrada" &&
      ["cartao_credito", "boleto", "aprazo"].includes(form.forma_recebimento)) ||
    (form.tipo === "saida" &&
      ["cartao_credito", "aprazo"].includes(form.forma_pagamento));

  const precisaFornecedor =
    modo === "receber" || modo === "pagar" || modo === "receber_cartao";

  const classificacoes = (() => {
    if (modo === "receber" || modo === "receber_cartao") {
      return [{ value: "receita", label: "Receita" }];
    }

    if (modo === "pagar") {
      return [
        { value: "despesa", label: "Despesa" },
        { value: "custo", label: "Custo / Insumo" },
        { value: "imobilizado", label: "Imobilizado" },
        { value: "passivo", label: "Financiamento / Dívida" },
      ];
    }

    if (modo === "cartao_compra") {
      return [
        { value: "despesa", label: "Despesa" },
        { value: "custo", label: "Custo / Insumo" },
        { value: "imobilizado", label: "Imobilizado" },
      ];
    }

    if (form.tipo === "entrada") {
      return [
        { value: "receita", label: "Receita" },
        { value: "passivo", label: "Empréstimo recebido" },
        { value: "ativo", label: "Aporte sócios" },
      ];
    }

    return [
      { value: "despesa", label: "Despesa" },
      { value: "custo", label: "Custo / Insumo" },
      { value: "imobilizado", label: "Imobilizado" },
    ];
  })();

  const formas = [
    { value: "avista", label: "À vista", icon: "💵" },
    { value: "pix", label: "Pix", icon: "⚡" },
    { value: "cartao_debito", label: "Débito", icon: "💳" },
    { value: "cartao_credito", label: "Crédito", icon: "💳" },
    { value: "boleto", label: "Boleto", icon: "📄" },
    { value: "aprazo", label: "A prazo", icon: "📆" },
  ];

  function nomeCategoria() {
    return categorias.find((c) => String(c.id) === String(form.categoria_id))?.nome || "";
  }

  function nomeConta() {
    return contas.find((c) => String(c.id) === String(form.conta_id))?.nome || "";
  }

  function nomeFornecedor() {
    return fornecedores.find((f) => String(f.id) === String(form.fornecedor_id))?.nome || "";
  }

  function irPara(etapa) {
    setEtapaAberta(etapa);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function selecionarTipo(tipo) {
    setForm((prev) => ({
      ...prev,
      tipo,
      forma_pagamento: "",
      forma_recebimento: "",
      classificacao: "",
      categoria_id: "",
      conta_id: "",
      fornecedor_id: "",
    }));

    setCartaoSelecionado("");
    irPara("forma");
  }
 
function selecionarForma(forma) {
  if (form.tipo === "entrada") {
    setForm((prev) => ({
      ...prev,
      forma_recebimento: forma,
      forma_pagamento: "",
      classificacao: "",
    }));
  } else {
    setForm((prev) => ({
      ...prev,
      forma_pagamento: forma,
      forma_recebimento: "",
      classificacao: "",
    }));
  }

  irPara("valor");

  setTimeout(() => {
    valorRef.current?.focus();
  }, 150);
}
  async function carregarCategorias() {
    try {
      const resp = await fetch(
        buildWebhookUrl("listacategorias", { empresa_id, tipo: form.tipo })
      );
      const data = await resp.json();
      setCategorias(Array.isArray(data) ? data : []);
    } catch {
      setCategorias([]);
    }
  }

  async function carregarContas() {
    try {
      const resp = await fetch(buildWebhookUrl("listacontas", { empresa_id }));
      const data = await resp.json();
      setContas(Array.isArray(data) ? data : []);
    } catch {
      setContas([]);
    }
  }

  async function carregarFornecedores() {
    try {
      const resp = await fetch(
        buildWebhookUrl("fornecedorcliente", { empresa_id, tipo: "ambos" })
      );
      const data = await resp.json();
      setFornecedores(Array.isArray(data) ? data : []);
    } catch {
      setFornecedores([]);
    }
  }

  async function carregarCartoes() {
    try {
      const resp = await fetch(buildWebhookUrl("cartoes", { id_empresa: empresa_id }));
      const data = await resp.json();
      setCartoes(Array.isArray(data) ? data : []);
    } catch {
      setCartoes([]);
    }
  }

  useEffect(() => {
    if (empresa_id) {
      carregarContas();
      carregarFornecedores();
      carregarCartoes();
    }
  }, [empresa_id]);

  useEffect(() => {
    if (empresa_id && form.tipo) {
      carregarCategorias();
    }
  }, [empresa_id, form.tipo]);

  function proximaDepoisCategoria() {
    if (mostrarContaFinanceira) return "conta";
    if (mostrarCartao) return "cartao";
    if (precisaFornecedor) return "fornecedor";
    if (ehAPrazo) return "prazo";
    return "revisao";
  }

  

  function validarFormulario() {
    const erros = [];

    if (!form.tipo) erros.push("Escolha entrada ou saída.");
    if (!formaSelecionada) erros.push("Escolha a forma.");
    if (!form.valor || Number(form.valor) <= 0) erros.push("Informe um valor válido.");
    if (!form.descricao?.trim()) erros.push("Informe a descrição.");
   // if (!form.classificacao) erros.push("Escolha a classificação.");
    //if (!form.categoria_id) erros.push("Escolha a categoria.");

    if (mostrarContaFinanceira && !form.conta_id) erros.push("Escolha a conta financeira.");
    if (mostrarCartao && !cartaoSelecionado) erros.push("Escolha o cartão.");
    if (precisaFornecedor && !form.fornecedor_id) erros.push("Escolha fornecedor/cliente.");
    if (ehAPrazo && !form.vencimento) erros.push("Informe o vencimento.");
    if ((ehAPrazo || mostrarCartao) && Number(form.parcelas || 0) < 1) {
      erros.push("Informe parcelas válidas.");

    if (ehAPrazo && form.vencimento < (form.data || hojeLocal())) {
  erros.push("Vencimento não pode ser menor que a data do lançamento.");
}
    }

    return erros;
  }

  function limparFormulario() {
    setForm({
      empresa_id,
      tipo: "",
      forma_pagamento: "",
      forma_recebimento: "",
      valor: "",
      data: hojeLocal(),
      descricao: "",
      classificacao: "",
      categoria_id: "",
      conta_id: "",
      fornecedor_id: "",
      vencimento: hojeMaisDias(1),
      parcelas: 1,
      parcela_num: 1,
      status: "aberto",
      doc_ref: "",
      origem: "WebApp",
    });

    setCartaoSelecionado("");
    setEtapaAberta("tipo");
  }

  async function salvar() {
    const erros = validarFormulario();

    if (erros.length > 0) {
      alert(erros.join("\n"));
      return;
    }

    let endpoint = "";

    if (modo === "financeiro") endpoint = "novolancamento";
    if (modo === "receber" || modo === "receber_cartao") endpoint = "novacontareceber";
    if (modo === "pagar") endpoint = "novacontapagar";
    if (modo === "cartao_compra") endpoint = "novatranscartao";

      const valorNumerico = Number(
  String(form.valor).replace(/\./g, "").replace(",", ".")
);

    const payload = {
      empresa_id,
      tipo: form.tipo,
      categoria_id: form.categoria_id || null,
      conta: form.conta_id || null,
      fornecedor_id: form.fornecedor_id || null,
      cartao_id: cartaoSelecionado || null,
      cartao_nome: cartaoSelecionado || null,
      forma_pagamento: form.forma_pagamento || null,
      forma_recebimento: form.forma_recebimento || null,
      vencimento: form.vencimento || null,
      valor: valorNumerico,
      valor_total: valorNumerico,
      descricao: form.descricao,
      data: form.data,
      data_compra: form.data,
      classificacao: form.tipo === "entrada" ? "receita" : "despesa",
      origem: "WebApp",
      parcelas: Number(form.parcelas || 1),
      parcela_num: 1,
      status: form.status || "aberto",
      doc_ref: form.doc_ref || "",
      modelo_codigo: "",
    };

    try {
      setSalvando(true);

      await fetchSeguro(buildWebhookUrl(endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setMensagem("✅ Lançamento salvo com sucesso.");
      window.dispatchEvent(new Event("contabil-atualizado"));
      limparFormulario();
      setTimeout(() => {
        tipoRef.current?.focus();
        }, 150);

      setTimeout(() => setMensagem(""), 5000);
    } catch (err) {
      alert(err.message || "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
  classificacaoRef.current?.focus();
}, [idxClassificacao]);
 
useEffect(() => {
  tipoRef.current?.focus();
}, []);
 

 
console.log("MODO INICIAL:", modoInicial);
console.log("TIPO INICIAL:", tipoInicial);
console.log("FORMA PAGAMENTO:", formaPagamentoInicial);
console.log("FORMA RECEBIMENTO:", formaRecebimentoInicial);

const podeAvancarSemCategoria = mostrarCategoria ? form.categoria_id : form.descricao;

  return (
    
 // <div className="min-h-screen  bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100 px-3 py-5">
 // <div className="mx-auto w-full max-w-[790px] rounded-[20px] bg-gradient-to-br from-slate-100 via-slate-200 to-blue-250 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.45)]">
       
       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-150 to-blue-100 px-3 py-5">
  <div className="mx-auto w-full max-w-[790px] rounded-[20px] bg-gradient-to-br from-white via-indigo-50 to-blue-100 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
    <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">
              ⚡ Lançamentos  
            </h1>

            <div className="mt-2 inline-flex rounded-full bg-slate-900/40 px-3 py-1 text-[16px] font-medium text-slate-300">
                Dica: use Enter para navegar
                </div>
            <p className="text-xs text-slate-500">
              Fluxo simples, passo a passo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600"
          >
            Voltar
          </button>
        </div>

        {mensagem && (
          <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {mensagem}
          </div>
        )}

       <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
             <BlocoEtapa
                  id="tipo"
                  icone="↕️" titulo="Tipo Movimento"
                  resumo={form.tipo === "entrada" ? "Recebimento" : form.tipo === "saida" ? "Pagamento" : ""}
                  aberto={etapaAberta === "tipo"}
                   onAbrir={() => {
                    if (!form.tipo) setEtapaAberta("tipo");
                  }}
                  >
                  <div className="flex gap-4 justify-center">
                      {!form.tipo && (
                        <>
                          <button
                            type="button"
                            ref={tipoRef}
                            onClick={() => selecionarTipo("entrada")}
                            className="flex flex-col items-center gap-2"
                          >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-3xl shadow-[0_10px_30px_rgba(16,185,129,0.4)] active:scale-90 transition">
                              ↑
                            </div>
                            <span className="text-sm font-bold text-slate-200">Receita</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => selecionarTipo("saida")}
                            className="flex flex-col items-center gap-2"
                          >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white flex items-center justify-center text-3xl shadow-[0_10px_30px_rgba(239,68,68,0.4)] active:scale-90 transition">
                              ↓
                            </div>
                            <span className="text-sm font-bold text-slate-200">Despesa</span>
                          </button>
                        </>
                      )}

                      {form.tipo === "entrada" && (
                        <div className="w-full rounded-full bg-emerald-500/15 border border-emerald-400/40 px-3 py-1 text-center">
                          <span className="text-xs font-black text-emerald-700">Receita</span>
                        </div>
                      )}

                      {form.tipo === "saida" && (
                        <div className="w-full rounded-full bg-red-500/15 border border-red-400/40 px-3 py-1 text-center">
                          <span className="text-xs font-black text-red-700">Despesa</span>
                        </div>
                      )}
                    </div>
          </BlocoEtapa>

          {form.tipo && (
            <BlocoEtapa
              id="forma"
              icone="💳" titulo="Forma"
              resumo={formaSelecionada}
              aberto={etapaAberta === "forma"}
               onAbrir={setEtapaAberta}
            >
              <div className="grid grid-cols-2 gap-2 ">
                {formas.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => selecionarForma(f.value)}
                   className={`
                            flex flex-col items-center justify-center
                            gap-1
                            rounded-2xl
                            px-1 py-1
                            text-xs font-semibold
                            transition-all duration-200
                            active:scale-95
                            border

                            ${formaSelecionada === f.value
                                ? "bg-gradient-to-b from-purple-500 to-purple-600 text-white border-purple-500 shadow-[0_6px_18px_rgba(124,58,237,0.35)] scale-[1.04]"
                                : "bg-white text-slate-800 border-slate-200 hover:bg-purple-50"
                            }
                            `}
                  >
                    <div className="text-lg">{f.icon}</div>
                    {f.label}
                  </button>
                ))}
              </div>
            </BlocoEtapa>
          )}

          {formaSelecionada && (
             <BlocoEtapa
            id="valor"
            icone="💰" titulo="Valor"
            resumo={form.valor ? `R$ ${form.valor}` : ""}
            aberto={etapaAberta === "valor"}
            onAbrir={setEtapaAberta}
             onFocusCampo={() => valorRef.current?.focus()}
            >
             <input
              ref={valorRef}
              type="text"
              inputMode="decimal"
              name="valor"
              value={form.valor}
              onChange={(e) => {
                let valor = e.target.value;

                valor = valor
                  .replace(/\D/g, "")
                  .replace(/^0+/, "");

                if (!valor) valor = "0";

                const numero = (Number(valor) / 100).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });

                setForm((prev) => ({
                  ...prev,
                  valor: numero,
                }));
              }}
              onFocus={() => {
                if (!form.valor) {
                  setForm((prev) => ({ ...prev, valor: "0,00" }));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  if (!form.valor || form.valor === "0,00") return;

                  irPara("descricao");
                  setTimeout(() => descricaoRef.current?.focus(), 150);
                }
              }}
              placeholder="0,00"
              className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-right text-xl font-bold text-slate-800 shadow-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
            />
             
            </BlocoEtapa>
          )}

          {form.valor && (
            <BlocoEtapa id="descricao"  icone="📝" titulo="Descrição"
             resumo={etapaAberta === "descricao" ? "" : form.descricao} 
             aberto={etapaAberta === "descricao"}
              onAbrir={setEtapaAberta}
               onFocusCampo={() => descricaoRef.current?.focus()}>
            
              <input
                  ref={descricaoRef}
                  type="text"
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!form.descricao?.trim()) return;
                     // irPara("categoria");
                     // setTimeout(() => categoriaRef.current?.focus(), 150);

                      irPara(proximaDepoisCategoria());
                      
                    }
                  }}
                  placeholder="Ex: mercado, venda, aluguel..."
                   className="w-full rounded-[10px] border border-slate-200 bg-white px-1 py-1 text-lg font-semibold text-slate-800 shadow-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
 
            </BlocoEtapa>
          )}

        {/*}  {form.descricao && (
        <BlocoEtapa
            id="classificacao"
            titulo="5. Classificação"
            resumo={form.classificacao}
            aberto={etapaAberta === "classificacao"}
            onAbrir={setEtapaAberta}
        >
            <div className="space-y-2">
            {classificacoes.map((c, i) => (
                <button
                key={c.value}
                ref={i === idxClassificacao ? classificacaoRef : null}
                type="button"
                onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setIdxClassificacao((prev) =>
                        Math.min(prev + 1, classificacoes.length - 1)
                    );
                      irPara("categoria");
                                        setTimeout(() => {
                      categoriaRef.current?.focus();
                    }, 150);
                    }

                    if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setIdxClassificacao((prev) => Math.max(prev - 1, 0));
                    }

                    if (e.key === "Enter") {
                    setForm((prev) => ({ ...prev, classificacao: c.value }));
                    irPara("categoria");
                                        setTimeout(() => {
                      categoriaRef.current?.focus();
                    }, 150);
                    }
                }}
                onClick={() => {
                    setForm((prev) => ({ ...prev, classificacao: c.value }));
                    irPara("categoria");

                    setTimeout(() => {
                      categoriaRef.current?.focus();
                    }, 150);
                }}
                className={`w-full rounded-xl border px-3 py-3 text-left text-sm font-bold ${
                    form.classificacao === c.value
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-slate-200 bg-white text-slate-800"
                }`}
                >
                {c.label}
                </button>
            ))}
            </div>
        </BlocoEtapa>
        )}*/}

           {mostrarCategoria && form.descricao && (
               <BlocoEtapa
                id="categoria"
                 icone="🏷️" titulo="Categoria"
                resumo={nomeCategoria()}
                aberto={etapaAberta === "categoria"}
                onAbrir={setEtapaAberta}
                onFocusCampo={() => categoriaRef.current?.focus()}
                >
              <div className="flex gap-2">
                  <select
                        ref={categoriaRef}
                        name="categoria_id"
                        value={form.categoria_id}
                        onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();

                                const categoriaId = e.currentTarget.value;
                                if (!categoriaId) return;

                                setForm((prev) => ({
                                  ...prev,
                                  categoria_id: categoriaId,
                                }));

                                const proxima = proximaDepoisCategoria();
                                setEtapaAberta(proxima);

                                setTimeout(() => {
                                  if (proxima === "conta") contaRef.current?.focus();
                                  if (proxima === "fornecedor") fornecedorRef.current?.focus();
                                  if (proxima === "cartao") cartaoRef.current?.focus();
                                }, 150);
                              }
                            }}
                          onChange={(e) => {
                            if (e.target.value === "__nova__") {
                              setModalCategoria(true);
                              return;
                            }

                            setForm((prev) => ({
                              ...prev,
                              categoria_id: e.target.value,
                            }));
                          }}
                     
                        className="w-full rounded-[22px] border border-slate-200 bg-white px-1 py-1 text-base font-semibold text-slate-800 shadow-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                        >
                  <option value="">Selecione</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                  <option value="__nova__">➕ Nova Categoria</option>
                </select>

               {/*} <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setModalCategoria(true)}
                  className="rounded-xl bg-blue-900 px-3 font-bold text-white"
                >
                  +
                </button>*/}
              </div>
            </BlocoEtapa>
          )} 
          {(mostrarCategoria ? form.categoria_id : form.descricao) && mostrarContaFinanceira && (
          
              <BlocoEtapa
                id="conta"
                icone="🏦" titulo="Conta Financeira"
                resumo={nomeConta()}
                aberto={etapaAberta === "conta"}
                onAbrir={setEtapaAberta}
                onFocusCampo={() => contaRef.current?.focus()}
                >
              <div className="flex gap-2">
                    <select
                        ref={contaRef}
                        value={String(form.conta_id || "")}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                            e.preventDefault();

                            if (!form.conta_id) return;

                            irPara("revisao");
                            }
                        }}
                        onChange={(e) => {
                            if (e.target.value === "__nova__") {
                            setModalConta(true);
                            return;
                            }

                            setForm((prev) => ({
                            ...prev,
                            conta_id: e.target.value,
                            }));
                        }}
                        className="w-full rounded-[22px] border border-slate-200 bg-white px-1 py-1 text-base font-semibold text-slate-800 shadow-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                        >
                  <option value="">Selecione</option>
                  {contas.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.nome}
                    </option>
                  ))}
                  <option value="__nova__">➕ Nova Conta Financeira</option>
                </select>

                
              </div>
            </BlocoEtapa>
          )}

           {podeAvancarSemCategoria && mostrarCartao && (
            <BlocoEtapa id="cartao"
              icone="💳"
            titulo="Cartão" 
             resumo={cartaoSelecionado} 
            aberto={etapaAberta === "cartao"}
             onAbrir={setEtapaAberta}>
                 
              <div className="flex gap-2">
                 <select
                    value={cartaoSelecionado}
                    
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                        e.preventDefault();

                        if (!cartaoSelecionado) return;

                        irPara("prazo");
                        }
                    }}
                    onChange={(e) => {
                        setCartaoSelecionado(e.target.value);
                    }}
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-1 py-1 text-base font-semibold text-slate-800 shadow-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                    >
                  <option value="">Selecione</option>
                  {cartoes.map((c) => (
                    <option key={c.id} value={c.nome}>
                      {c.nome} - {c.bandeira}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setModalCartao(true)}
                  className="rounded-xl bg-blue-900 px-2 font-bold text-white"
                >
                  +
                </button>
              </div>
            </BlocoEtapa>
          )}

          {podeAvancarSemCategoria && precisaFornecedor && !mostrarCartao && (
            <BlocoEtapa
              id="fornecedor"
             icone="👤" titulo="Fornecedor / Cliente"
              resumo={nomeFornecedor()}
              aberto={etapaAberta === "fornecedor"}
              onAbrir={setEtapaAberta}
              onFocusCampo={() => fornecedorRef.current?.focus()}
            >
              <div className="flex gap-2">
                <select
                  ref={fornecedorRef}
                  value={String(form.fornecedor_id || "")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();

                      if (!form.fornecedor_id) return;

                      irPara(ehAPrazo ? "prazo" : "revisao");

                      setTimeout(() => {
                        if (ehAPrazo) vencimentoRef.current?.focus();
                      }, 150);
                    }
                  }}
                  onChange={(e) => {
                    if (e.target.value === "__novo__") {
                      setModalFornecedor(true);
                      return;
                    }

                    setForm((prev) => ({
                      ...prev,
                      fornecedor_id: e.target.value,
                    }));
                  }}
                  className="w-full rounded-[22px] border border-slate-200 bg-white px-1 py-1 text-base font-semibold text-slate-800 shadow-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                >
                  <option value="">Selecione</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={String(f.id)}>
                      {f.nome}
                    </option>
                  ))}
                  <option value="__novo__">➕ Novo Fornecedor / Cliente</option>
                </select>
              </div>
            </BlocoEtapa>
          )}

           {podeAvancarSemCategoria && ehAPrazo && (
            <BlocoEtapa
              id="prazo"
              icone="📅" titulo="Vencimento / Parcelas"
              resumo={`${form.vencimento} | ${form.parcelas} parcela(s)`}
             aberto={etapaAberta === "prazo"}
               onAbrir={setEtapaAberta} 
                   onFocusCampo={() => vencimentoRef.current?.focus()} >
              {!mostrarCartao && (
                <div className="mb-3">
                  <label className="text-xs font-bold text-slate-600">Vencimento</label>
                  <input
                    type="date"
                    name="vencimento"
                    ref={vencimentoRef}
                    value={form.vencimento}
                    min={form.data || hojeLocal()}
                    onChange={(e) => {
                      if (e.target.value < (form.data || hojeLocal())) {
                        alert("Vencimento não pode ser menor que a data do lançamento.");
                        return;
                      }

                      handleChange(e);
                    }}
                    className="w-full rounded-[22px] border border-slate-200 bg-white px-1 py-1 text-base font-semibold text-slate-800 shadow-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-600">Parcelas</label>
                <input
                  type="number"
                  name="parcelas"
                  min="1"
                  value={form.parcelas}
                  onChange={handleChange}
                  className="w-full rounded-[22px] border border-slate-200 bg-white px-1 py-1 text-base font-semibold text-slate-800 shadow-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <button
                type="button"
                onClick={() => irPara("revisao")}
               className="mt-4 w-full rounded-[22px] bg-purple-600 px-1 py-1 text-sm font-black text-white shadow-lg transition-all active:scale-95"
              >
                Continuar
              </button>
            </BlocoEtapa>
          )}

          {(form.conta_id || cartaoSelecionado || form.fornecedor_id || (!mostrarContaFinanceira && !mostrarCartao && !precisaFornecedor && form.categoria_id)) && (
            
            <BlocoEtapa
                id="revisao"
                icone="✅" titulo="Revisão"
                resumo="Conferir e salvar"
                aberto={etapaAberta === "revisao"}
                onAbrir={setEtapaAberta}
              >
                <div className="rounded-2xl bg-slate-800/90 p-3 text-xs text-slate-100 shadow-inner">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    <span className="text-slate-200">Tipo</span>
                    <span className="font-bold text-right">{form.tipo}</span>

                    <span className="text-slate-200">Forma</span>
                    <span className="font-bold text-right">{formaSelecionada}</span>

                    <span className="text-slate-200">Valor</span>
                    <span className="font-black text-right text-emerald-300">R$ {form.valor}</span>

                    <span className="text-slate-200">Descrição</span>
                    <span className="font-bold text-right truncate">{form.descricao}</span>

                  {/*}  <span className="text-slate-200">Categoria</span>
                    <span className="font-bold text-right truncate">{nomeCategoria()}</span>*/}

                    {form.conta_id && (
                      <>
                        <span className="text-slate-200">Conta</span>
                        <span className="font-bold text-right truncate">{nomeConta()}</span>
                      </>
                    )}

                    {cartaoSelecionado && (
                      <>
                        <span className="text-slate-200">Cartão</span>
                        <span className="font-bold text-right truncate">{cartaoSelecionado}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={salvar}
                  disabled={salvando}
                  className="mt-3 w-full rounded-xl bg-emerald-600 py-2 text-sm font-black text-white shadow-md active:scale-95 transition disabled:opacity-60"
                >
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              </BlocoEtapa>


  
          )}
        </div>
      </div>

      <FormCategoria
        open={modalCategoria}
        onClose={() => setModalCategoria(false)}
        empresa_id={empresa_id}
        tipo={form.tipo}
        onCategoriaCriada={async (nova) => {
          setModalCategoria(false);
          await carregarCategorias();
          setForm((prev) => ({ ...prev, categoria_id: nova.id }));
          irPara(proximaDepoisCategoria());
        }}
      />

      <ModalBase open={modalConta} onClose={() => setModalConta(false)} title="Nova Conta Financeira">
        <FormConta
          empresa_id={empresa_id}
          onSuccess={(novaConta) => {
            const conta = Array.isArray(novaConta) ? novaConta[0] : novaConta;
            setContas((prev) => [conta, ...prev]);
            setForm((prev) => ({ ...prev, conta_id: conta.id }));
            setModalConta(false);
            irPara("revisao");
          }}
          onCancel={() => setModalConta(false)}
        />
      </ModalBase>

      <ModalBase open={modalFornecedor} onClose={() => setModalFornecedor(false)} title="Novo Fornecedor / Cliente">
        <FormFornecedorModal
          empresa_id={empresa_id}
          tipo="fornecedor"
          onSuccess={(novo) => {
            setFornecedores((prev) => [novo, ...prev]);
            setForm((prev) => ({ ...prev, fornecedor_id: String(novo.id) }));
            setModalFornecedor(false);
            irPara(ehAPrazo ? "prazo" : "revisao");
          }}
          onCancel={() => setModalFornecedor(false)}
        />
      </ModalBase>

      <ModalBase open={modalCartao} onClose={() => setModalCartao(false)} title="Novo Cartão">
        <FormCartaoModal
          empresa_id={empresa_id}
          onSuccess={() => {
            setModalCartao(false);
            carregarCartoes();
          }}
          onCancel={() => setModalCartao(false)}
        />
      </ModalBase>
    </div>
  );
}
