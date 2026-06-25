  import { useEffect, useMemo, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";
import { useTranslation } from "react-i18next";


function somenteValorVirgula(valor) {
  let txt = String(valor ?? "").replace(/[^0-9,]/g, "");

  const partes = txt.split(",");
  let inteiro = (partes[0] || "").slice(0, 9);
  let centavos = partes.length > 1 ? partes.slice(1).join("").slice(0, 2) : "";

  if (partes.length > 1) return `${inteiro},${centavos}`;
  return inteiro;
}

function bloquearTeclaValor(e) {
  const liberadas = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
  ];

  if (liberadas.includes(e.key) || e.ctrlKey || e.metaKey) return;

  if (e.key === ".") {
    e.preventDefault();
    return;
  }

  if (!/^[0-9,]$/.test(e.key)) {
    e.preventDefault();
    return;
  }

  if (e.key === "," && e.currentTarget.value.includes(",")) {
    e.preventDefault();
  }
}

function parseValorBR(valor) {
  if (valor === null || valor === undefined || valor === "") return null;

  const limpo = somenteValorVirgula(valor);
  if (!limpo) return null;

  const numero = Number(limpo.replace(",", "."));
  if (!Number.isFinite(numero)) return null;

  return Number(numero.toFixed(2));
}

function valorParaTela(valor) {
  if (valor === null || valor === undefined || valor === "") return "";

  const numero = Number(String(valor).replace(",", "."));
  if (!Number.isFinite(numero)) return somenteValorVirgula(valor);

  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  });
}

function mascaraDiaVencimento(valor) {
  const digitos = String(valor ?? "").replace(/\D/g, "").slice(0, 2);
  if (!digitos) return "";

  const numero = Math.min(Math.max(Number(digitos), 1), 30);
  return String(numero);
}



export default function ContasRecorrentes() {
  const { t } = useTranslation();
  const empresa_id =
    localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");

  const [lista, setLista] = useState([]);
  const [contas, setContas] = useState([]);
  const [modalNovo, setModalNovo] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [fornecedores, setFornecedores] = useState([]);
  const [recorrenteEditando, setRecorrenteEditando] = useState(null);
 const [recorrenciaGerando, setRecorrenciaGerando] = useState(null);

 const [contasDespesas, setContasDespesas] = useState([]);

 const [recorrenteHistorico, setRecorrenteHistorico] = useState(null);

 const [dashboard, setDashboard] = useState([]);
 
  const [filtro, setFiltro] = useState({
    descricao: "",
    ativo: "todos" 
  });

  async function carregarFornecedores() {
  const resp = await fetch(buildWebhookUrl("fornecedorcliente", { empresa_id, tipo: "ambos" }));
  const json = await resp.json();
  setFornecedores(Array.isArray(json) ? json : []);
}



async function carregar() {
  setCarregando(true);

  try {
    const resp = await fetch(
      buildWebhookUrl("busca_conta_recorrente", { empresa_id })
    );

    const json = await resp.json();

    const base = Array.isArray(json) ? json[0] : json;
    const dados = base?.data || base?.dados || base?.resultado || json;

    setLista(Array.isArray(dados) ? dados : []);
  } finally {
    setCarregando(false);
  }
}


  async function carregarContas() {
    const resp = await fetch(buildWebhookUrl("listacontas", { empresa_id }));
    const json = await resp.json();
    setContas(Array.isArray(json) ? json : []);
  }
 
  const filtradas = useMemo(() => {
    return lista.filter((r) => {
      const descOk = String(r.descricao || "")
        .toLowerCase()
        .includes(filtro.descricao.toLowerCase());

      const ativoOk =
        filtro.ativo === "todos" ||
        String(r.ativo) === String(filtro.ativo === "ativo");

     const vigenciaOk =
  !filtro.vigencia ||
  String(r.vigencia_inicio || r.data_vigencia || "").slice(0, 10) <=
    filtro.vigencia;

      return descOk && ativoOk ;
    });
  }, [lista, filtro]);

  async function gerarLancamento(r) {
    const valor = prompt(
      `${t("contasRecorrentes.valorParaGerar", "Valor para gerar")} ${r.descricao}:`,
      r.valor_padrao || ""
    );

    if (!valor) return;

    const conta_financeira_id =
      r.conta_id || r.conta_financeira_id || r.conta_financeira_padrao_id;

    if (!conta_financeira_id) {
      alert(t("contasRecorrentes.semContaVinculada", "Essa recorrência não possui conta financeira vinculada."));
      return;
    }

    const resp = await fetch(buildWebhookUrl("gera_lancamento_recorrente"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        empresa_id,
        recorrente_id: recorrencia.id,
        competencia: form.competencia,
        conta_id: form.conta_id,
      valor: parseValorBR(form.valor),
      }),
    }); 

    const txt = await resp.text();
    console.log("RETORNO GERAR:", txt);

    alert(t("contasRecorrentes.lancamentoFinanceiroGerado", "Lançamento financeiro gerado."));
    carregar();
  }

 async function carregarDashboard() {
  const resp = await fetch(
    buildWebhookUrl("dashboard_conta_recorrente", { empresa_id })
  );

  const json = await resp.json();

  const base = Array.isArray(json) ? json[0] : json;
  const dados = base?.data || [];

  setDashboard(Array.isArray(dados) ? dados : []);
}
 


const mesAtual = dashboard[0] || {};

const totalMensal = Number(mesAtual.total_previsto || 0);

const totalSeisMeses = dashboard.reduce(
  (acc, item) => acc + Number(item.total_previsto || 0),
  0
);

const totalFixo = Number(mesAtual.total_fixo || 0);
const totalVariavel = Number(mesAtual.total_variavel || 0);
 

 async function carregarContasDespesas() {
  const url = buildWebhookUrl("despesa", { empresa_id });
  console.log("URL DESPESA:", url);

  const resp = await fetch(url, {
    method: "GET",
  });

  const txt = await resp.text();
  console.log("RETORNO DESPESA:", txt);

  let json = [];
  try {
    json = JSON.parse(txt);
  } catch {
    json = [];
  }

  const base = Array.isArray(json) ? json[0] : json;
  const dados = base?.data || base?.dados || base?.resultado || json;

  setContasDespesas(Array.isArray(dados) ? dados : []);
}

useEffect(() => {
  carregar();
  carregarContas();
  carregarFornecedores();
  carregarDashboard();
  carregarContasDespesas();
}, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-state-300 rounded-2xl shadow-xl border p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-slate-800">
            🔁 {t("contasRecorrentes.titulo", "Transações Recorrentes")}
          </h2>

       
       {dashboard.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="text-xs font-black text-blue-600 uppercase">
                {t("contasRecorrentes.mensalAtual", "Mensal atual")}
              </div>
              <div className="text-xl font-black text-blue-900">
                {totalMensal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
              <div className="text-xs font-black text-purple-600 uppercase">
                {t("contasRecorrentes.proximosSeisMeses", "Próximos 6 meses")}
              </div>
              <div className="text-xl font-black text-purple-900">
                {totalSeisMeses.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <div className="text-xs font-black text-green-600 uppercase">
                {t("contasRecorrentes.fixas", "Fixas")}
              </div>
              <div className="text-xl font-black text-green-900">
                {totalFixo.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <div className="text-xs font-black text-orange-600 uppercase">
                {t("contasRecorrentes.variaveis", "Variáveis")}
              </div>
              <div className="text-xl font-black text-orange-900">
                {totalVariavel.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            </div>
          </div>
        )}

     
          <button
            onClick={() => setModalNovo(true)}
            className="rounded-full px-5 py-2 bg-blue-700 text-white font-black shadow hover:bg-blue-800"
          > 
          ➕ {t("contasRecorrentes.novaTransacaoRecorrente", "Nova Transação Recorrente")}
          </button>
        </div>
        
        <div className="grid grid-cols-[1fr_180px] gap-3 mb-5">
          <input
            className="border rounded-xl px-3 py-2 font-bold"
            placeholder={t("contasRecorrentes.placeholderPesquisarDescricao", "Pesquisar por descrição...")}
            value={filtro.descricao}
            onChange={(e) =>
              setFiltro((p) => ({ ...p, descricao: e.target.value }))
            }
          />

          <select
            className="border rounded-xl px-3 py-2 font-bold"
            value={filtro.ativo}
            onChange={(e) =>
              setFiltro((p) => ({ ...p, ativo: e.target.value }))
            }
          >
            <option value="todos">{t("contasRecorrentes.todos", "Todos")}</option>
            <option value="ativo">{t("contasRecorrentes.ativos", "Ativos")}</option>
            <option value="inativo">{t("contasRecorrentes.inativos", "Inativos")}</option>
          </select>
 
        </div>

        <div className="rounded-xl border overflow-hidden bg-white">
          <div className="grid grid-cols-[1fr_90px_120px_140px_90px_150px_150px] bg-slate-200 text-black text-sm font-black px-3 py-2">
            <div>{t("contasRecorrentes.descricao", "Descrição")}</div>
            <div>{t("contasRecorrentes.dia", "Dia")}</div>
            <div>{t("contasRecorrentes.valor", "Valor")}</div>
            <div>{t("contasRecorrentes.conta", "Conta")}</div>
            <div>{t("contasRecorrentes.status", "Status")}</div>
              <div>{t("contasRecorrentes.statusGeracao", "Status Geração")}</div>
            <div className="text-center">{t("contasRecorrentes.acao", "Ação")}</div>
          </div>

          {carregando && (
            <div className="p-4 font-bold text-slate-500">{t("contasRecorrentes.carregando", "Carregando...")}</div>
          )}

          {!carregando &&
            filtradas.map((r) => (
               <div
                key={r.id}
                onDoubleClick={() => setRecorrenteHistorico(r)}
                className="grid grid-cols-[1fr_90px_120px_140px_90px_150px_150px] px-3 py-2 border-b text-sm items-center cursor-pointer hover:bg-blue-50"
              >
                <div className="font-bold text-slate-800">
                  {r.descricao}
                </div>

                <div>{t("contasRecorrentes.dia", "Dia")} {r.dia_vencimento}</div>

                <div className="font-black">
                  {r.valor_padrao
                    ? Number(r.valor_padrao).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : t("contasRecorrentes.variavel", "Variável")}
                </div>

                <div>{r.conta_nome || r.nome_conta || r.conta_id || "-"}</div>

                <div>
                  {r.ativo ? (
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-black text-xs">
                      {t("contasRecorrentes.ativo", "Ativo")}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-black text-xs">
                      {t("contasRecorrentes.inativo", "Inativo")}
                    </span>
                  )}
                </div>
                

                <div>
                      {r.status_mes === "GERADO" ? (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-black text-xs">
                          {t("contasRecorrentes.gerado", "Gerado")}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-black text-xs">
                          {t("contasRecorrentes.pendente", "Pendente")}
                        </span>
                      )}
                    </div>

                 <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setRecorrenteEditando(r)}
                    className="rounded-full px-3 py-1 bg-blue-600 text-white font-black text-xs"
                  >
                    {t("contasRecorrentes.editar", "Editar")}
                  </button> 
                   <button
                            onClick={() => setRecorrenciaGerando(r)}
                            disabled={r.status_mes === "GERADO"}
                            className={`rounded-full px-3 py-1 text-white font-black text-xs ${
                              r.status_mes === "GERADO"
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            {t("contasRecorrentes.gerar", "Pagar")}
                          </button>


                </div>


          
                </div>
            
            ))}
            
         

          {!carregando && filtradas.length === 0 && (
            <div className="p-4 text-slate-500 font-bold">
              {t("contasRecorrentes.nenhumaEncontrada", "Nenhuma transação recorrente encontrada.")}
            </div>
          )}
        </div>
      </div>

      {recorrenciaGerando && (
 
 <ModalGerarRecorrencia
  recorrencia={recorrenciaGerando}
  contas={contas}
  contasDespesas={contasDespesas}
  empresa_id={empresa_id}
  onClose={() => setRecorrenciaGerando(null)}
  onSuccess={() => {
    setRecorrenciaGerando(null);
    carregar();
  }}
  />
)}

{recorrenteHistorico && (
  <ModalHistoricoRecorrencia
    recorrencia={recorrenteHistorico}
    empresa_id={empresa_id}
    onClose={() => setRecorrenteHistorico(null)}
  />
)}

       {(modalNovo || recorrenteEditando) && (
      

         <NovaContaRecorrente 
          empresa_id={empresa_id}
          contas={contas}
          contasDespesas={contasDespesas}
          fornecedores={fornecedores}
          recorrente={recorrenteEditando}

          
          onClose={() => {
            setModalNovo(false);
            setRecorrenteEditando(null);
          }}
          onSuccess={() => {
            setModalNovo(false);
            setRecorrenteEditando(null);
            carregar();
          }}
        />






      )}


    


    </div>
  );
}

 function ModalGerarRecorrencia({ recorrencia, contas, contasDespesas, empresa_id, onClose, onSuccess }) {
  const { t } = useTranslation();
  const hoje = new Date();

  const competenciaInicial = `${hoje.getFullYear()}-${String(
    hoje.getMonth() + 1
  ).padStart(2, "0")}-01`;

  function calcularVencimento(competencia) {
    const [ano, mes] = String(competencia).split("-").map(Number);
    const dia = Number(recorrencia?.dia_vencimento || 1);
    const ultimoDia = new Date(ano, mes, 0).getDate();
    const diaFinal = Math.min(dia, ultimoDia);

    return `${ano}-${String(mes).padStart(2, "0")}-${String(diaFinal).padStart(2, "0")}`;
  }

  const contaContabilInicial = (contasDespesas || []).find(
    (c) => String(c.id) === String(recorrencia?.contabil_id)
  );

  const vencimentoInicial = calcularVencimento(competenciaInicial);

  const [form, setForm] = useState({
    competencia: competenciaInicial,
    data_pagamento:
      recorrencia?.data_pagamento ||
      recorrencia?.vencimento ||
      vencimentoInicial,
    valor: valorParaTela(recorrencia?.valor_padrao),
    conta_id: recorrencia?.conta_id || "",
    contabil_id: recorrencia?.contabil_id || "",
    contabil_label:
      recorrencia?.contabil_label ||
      contaContabilInicial?.label ||
      (contaContabilInicial
        ? `${contaContabilInicial.codigo} - ${contaContabilInicial.nome}`
        : ""),
  });

  const vencimento = calcularVencimento(form.competencia);

  async function gerar() {
    const valorFinal = parseValorBR(form.valor);

    if (!form.competencia || valorFinal === null || !form.conta_id || !form.contabil_id) {
      alert(t("contasRecorrentes.informeCamposGerar", "Informe competência, valor, conta financeira e conta contábil."));
      return;
    }

    const payload = {
      empresa_id,
      recorrente_id: recorrencia.id,
      competencia: form.competencia,
      conta_id: form.conta_id,
      contabil_id: form.contabil_id,
      valor: valorFinal,
      data_pagamento: form.data_pagamento,
    };

    console.log("PAYLOAD GERAR RECORRENTE:", payload);

    const resp = await fetch(buildWebhookUrl("gera_lancamento_recorrente"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const txt = await resp.text();
    console.log("RETORNO GERAR:", txt);

    let json = null;
    try {
      json = JSON.parse(txt);
    } catch {
      json = null;
    }

    const retorno = Array.isArray(json) ? json[0] : json;

    if (!resp.ok || retorno?.ok === false) {
      alert(retorno?.message || t("contasRecorrentes.erroGerar", "Erro ao gerar conta recorrente."));
      return;
    }

    alert(retorno?.message || t("contasRecorrentes.contaRecorrenteGerada", "Conta recorrente gerada."));
    onSuccess();
  }

  const despesasFiltradas = (contasDespesas || [])
    .filter((c) => {
      const texto = String(form.contabil_label || "").toLowerCase();
      const label = `${c.codigo || ""} ${c.nome || ""} ${c.label || ""}`.toLowerCase();

      if (!texto || form.contabil_id) return false;

      return label.includes(texto);
    })
    .slice(0, 8);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl border w-[560px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-slate-800">
            💸 {t("contasRecorrentes.gerarTransacaoRecorrente", "Pagar Transação Recorrente")}
          </h3>

          <button type="button" onClick={onClose} className="font-black text-slate-500">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <b>{t("contasRecorrentes.descricao", "Descrição")}:</b> {recorrencia?.descricao}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold">{t("contasRecorrentes.competencia", "Competência")}</label>
              <input
                type="month"
                className="w-full border rounded-xl px-3 py-2 font-bold"
                value={String(form.competencia).slice(0, 7)}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    competencia: `${e.target.value}-01`,
                  }))
                }
              />
            </div>

            <div>
              <label className="font-bold">{t("contasRecorrentes.dataPagamento", "Data pagamento")}</label>
              <input
                type="date"
                className="w-full border rounded-xl px-3 py-2 font-bold"
                value={form.data_pagamento}
                onChange={(e) =>
                  setForm((p) => ({ ...p, data_pagamento: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="font-bold">{t("contasRecorrentes.vencimento", "Vencimento")}</label>
              <input
                className="w-full border rounded-xl px-3 py-2 font-bold bg-gray-100"
                value={vencimento.split("-").reverse().join("/")}
                readOnly
              />
            </div>
          </div>

          <input
            type="text"
            inputMode="decimal"
            maxLength={12}
            className="w-full border rounded-xl px-3 py-2 font-bold"
            placeholder={t("contasRecorrentes.valor", "Valor")}
            value={form.valor}
            onKeyDown={bloquearTeclaValor}
            onPaste={(e) => {
              e.preventDefault();
              const texto = e.clipboardData.getData("text");
              setForm((p) => ({ ...p, valor: somenteValorVirgula(texto) }));
            }}
            onChange={(e) =>
              setForm((p) => ({ ...p, valor: somenteValorVirgula(e.target.value) }))
            }
          />

          <select
            className="w-full border rounded-xl px-3 py-2 font-bold"
            value={form.conta_id}
            onChange={(e) =>
              setForm((p) => ({ ...p, conta_id: e.target.value }))
            }
          >
            <option value="">{t("contasRecorrentes.contaFinanceira", "Conta financeira")}</option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              className="w-full border rounded-xl px-3 py-2 font-bold"
              placeholder={t("contasRecorrentes.placeholderDespesa", "Digite a despesa. Ex: energia")}
              value={form.contabil_label || ""}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  contabil_label: e.target.value,
                  contabil_id: "",
                }))
              }
            />

            {despesasFiltradas.length > 0 && !form.contabil_id && (
              <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border bg-white shadow-lg">
                {despesasFiltradas.map((c) => {
                  const label = c.label || `${c.codigo} - ${c.nome}`;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          contabil_label: label,
                          contabil_id: c.id,
                        }))
                      }
                      className="w-full text-left px-3 py-2 text-sm font-bold hover:bg-blue-50"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2 bg-slate-500 text-white font-black"
          >
            {t("contasRecorrentes.cancelar", "Cancelar")}
          </button>

          <button
            type="button"
            onClick={gerar}
            className="rounded-full px-5 py-2 bg-emerald-600 text-white font-black"
          >
            {t("contasRecorrentes.gerar", "Gerar")}
          </button>
        </div>
      </div>
    </div>
  );
}


function ModalHistoricoRecorrencia({ recorrencia, empresa_id, onClose }) {
  const { t } = useTranslation();
  const [linhas, setLinhas] = useState([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function carregarHistorico() {
      setCarregando(true);

      try {
        const resp = await fetch(
          buildWebhookUrl("historico_conta_recorrente", {
            empresa_id,
            recorrente_id: recorrencia.id,
            limite: 6,
          })
        );

        const json = await resp.json();
        const base = Array.isArray(json) ? json[0] : json;
        const dados = base?.data || base?.dados || base?.resultado || json;

        setLinhas(Array.isArray(dados) ? dados : []);
      } finally {
        setCarregando(false);
      }
    }

    carregarHistorico();
  }, [empresa_id, recorrencia.id]);






  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl border w-[920px] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-black text-slate-800">
              📜 {t("contasRecorrentes.historicoPagamentos", "Histórico de Pagamentos (últimos seis meses)")}
            </h3>
            <p className="text-sm text-slate-500 font-bold">
              {recorrencia.descricao}
            </p>
          </div>

          <button onClick={onClose} className="font-black text-slate-500">
            ✕
          </button>
        </div>

        {carregando && (
          <div className="p-4 font-bold text-slate-500">{t("contasRecorrentes.carregando", "Carregando...")}</div>
        )}

        {!carregando && linhas.length === 0 && (
          <div className="p-4 rounded-xl bg-slate-50 text-slate-500 font-bold">
            {t("contasRecorrentes.nenhumPagamento", "Nenhum pagamento encontrado para esta recorrência.")}
          </div>
        )}

        {!carregando && linhas.length > 0 && (
          <div className="rounded-xl border overflow-hidden">
             
           <div className="grid grid-cols-[110px_1fr_130px_160px_130px] bg-slate-800 text-white text-sm font-black px-3 py-2">
            <div>{t("contasRecorrentes.competencia", "Competência")}</div>
            <div>{t("contasRecorrentes.descricao", "Descrição")}</div>
            <div>{t("contasRecorrentes.dataPagamento", "Data Pagamento")}</div>
            <div>{t("contasRecorrentes.contaCorrente", "Conta Corrente")}</div>
            <div className="text-right">{t("contasRecorrentes.valor", "Valor")}</div>
          </div>
            {linhas.map((h, i) => (
              <div 
              key={h.id || i}
              className="grid grid-cols-[110px_1fr_130px_160px_130px] px-3 py-2 border-b text-sm items-center hover:bg-blue-50"
            >
                <div className="font-bold">
                  {h.competencia
                    ? String(h.competencia).slice(0, 7).split("-").reverse().join("/")
                    : "-"}
                </div>
                   
                <div className="font-semibold">
                    {h.descricao || "-"}
                  </div>
                <div>
                  {h.data_pagamento || h.data
                    ? String(h.data_pagamento || h.data).slice(0, 10).split("-").reverse().join("/")
                    : "-"}
                </div>

                <div>{h.conta_nome || h.nome_conta || h.conta_id || "-"}</div>
 

                <div className="text-right font-black text-emerald-700">
                  {Number(h.valor || h.valor_gerado || 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="rounded-full px-5 py-2 bg-slate-600 text-white font-black"
          >
            {t("contasRecorrentes.fechar", "Fechar")}
          </button>
        </div>
      </div>
    </div>
  );
}





 
  function NovaContaRecorrente({ empresa_id, contas, contasDespesas, fornecedores, recorrente, onClose, onSuccess }) {
  const { t } = useTranslation();

  const contaContabilInicial = (contasDespesas || []).find(
    (c) => String(c.id) === String(recorrente?.contabil_id)
  );

  const [form, setForm] = useState({
    id: recorrente?.id || null,
    descricao: recorrente?.descricao || "",
    dia_vencimento: mascaraDiaVencimento(recorrente?.dia_vencimento || ""),
    tipo_valor: recorrente?.tipo_valor || "VARIAVEL",
    valor_padrao: valorParaTela(recorrente?.valor_padrao),
    conta_id: recorrente?.conta_id || "",
    ativo: recorrente?.ativo ?? true,
    fornecedor_id: recorrente?.fornecedor_id || "",
    contabil_id: recorrente?.contabil_id || "",
    contabil_label:
      recorrente?.contabil_label ||
      contaContabilInicial?.label ||
      (contaContabilInicial
        ? `${contaContabilInicial.codigo} - ${contaContabilInicial.nome}`
        : ""),
  });

  async function salvar() {
    const descricao = String(form.descricao || "").trim();
    const dia = Number(form.dia_vencimento);
    const valorFinal = parseValorBR(form.valor_padrao);

    if (!descricao || !dia || !form.conta_id || !form.contabil_id) {
      alert("Preencha descrição, dia de vencimento, conta financeira e conta contábil.");
      return;
    }

    if (dia < 1 || dia > 30) {
      alert("O dia de vencimento deve estar entre 1 e 30.");
      return;
    }

    if (form.tipo_valor === "FIXO" && (!valorFinal || valorFinal <= 0)) {
      alert("Para valor fixo, informe um valor maior que zero.");
      return;
    }

    const webhook = form.id
      ? "atualiza_conta_recorrente"
      : "insere_conta_recorrente";

    const payload = {
      empresa_id,
      id: form.id || null,
      descricao,
      fornecedor_id: form.fornecedor_id || null,
      conta_id: form.conta_id,
      tipo_valor: form.tipo_valor,
      valor: valorFinal,
      valor_padrao: valorFinal,
      dia_vencimento: dia,
      contabil_id: form.contabil_id,
      ativo: form.ativo,
    };

    console.log("PAYLOAD RECORRENTE:", payload);

    const resp = await fetch(buildWebhookUrl(webhook), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const txt = await resp.text();
    console.log("RETORNO INSERE:", txt);

    let retorno = null;
    try {
      retorno = JSON.parse(txt);
    } catch {
      retorno = null;
    }

    const base = Array.isArray(retorno) ? retorno[0] : retorno;

    if (!resp.ok || base?.ok === false) {
      alert(base?.message || "Erro ao salvar a transação recorrente.");
      return;
    }

    alert(
      base?.message ||
        t("contasRecorrentes.contaRecorrenteCadastrada", "Conta recorrente cadastrada.")
    );
    onSuccess();
  }

  const despesasFiltradas = (contasDespesas || [])
    .filter((c) => {
      const texto = String(form.contabil_label || "").toLowerCase();
      const label = `${c.codigo || ""} ${c.nome || ""} ${c.label || ""}`.toLowerCase();

      if (!texto || form.contabil_id) return false;

      return label.includes(texto);
    })
    .slice(0, 8);

  useEffect(() => {
    if (!form.contabil_id || form.contabil_label || !contasDespesas.length) return;

    const conta = contasDespesas.find(
      (c) => String(c.id) === String(form.contabil_id)
    );

    if (conta) {
      setForm((p) => ({
        ...p,
        contabil_label: conta.label || `${conta.codigo} - ${conta.nome}`,
      }));
    }
  }, [form.contabil_id, form.contabil_label, contasDespesas]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl border w-[560px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-slate-800">
            ➕ {form.id ? t("contasRecorrentes.editar", "Editar") : t("contasRecorrentes.novaTransacaoRecorrente", "Nova Transação Recorrente")}
          </h3>

          <button type="button" onClick={onClose} className="font-black text-slate-500">
            ✕
          </button>
        </div>

        <div className="grid gap-3">
          <input
            className="border rounded-xl px-3 py-2 font-bold"
            placeholder={t("contasRecorrentes.placeholderDescricaoNova", "Descrição: Energia CPFL, Internet, ChatGPT...")}
            value={form.descricao}
            onChange={(e) =>
              setForm((p) => ({ ...p, descricao: e.target.value }))
            }
          />

           <select
            className="w-full max-w-full box-border border rounded-xl px-3 py-2 font-bold"
            value={form.fornecedor_id}
            onChange={(e) =>
              setForm((p) => ({ ...p, fornecedor_id: e.target.value }))
            }
          >
            <option value="" disabled hidden>
              Fornecedor
            </option>

            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome || f.razao_social || f.apelido || `Fornecedor ${f.id}`}
              </option>
            ))}
           </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              className="border rounded-xl px-3 py-2 font-bold"
              placeholder={t("contasRecorrentes.diaVencimento", "Dia vencimento")}
              value={form.dia_vencimento}
              onKeyDown={(e) => {
                const liberadas = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
                if (liberadas.includes(e.key) || e.ctrlKey || e.metaKey) return;
                if (!/^[0-9]$/.test(e.key)) e.preventDefault();
              }}
              onPaste={(e) => {
                e.preventDefault();
                const texto = e.clipboardData.getData("text");
                setForm((p) => ({ ...p, dia_vencimento: mascaraDiaVencimento(texto) }));
              }}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  dia_vencimento: mascaraDiaVencimento(e.target.value),
                }))
              }
            />

            <select
              className="border rounded-xl px-3 py-2 font-bold"
              value={form.tipo_valor}
              onChange={(e) =>
                setForm((p) => ({ ...p, tipo_valor: e.target.value }))
              }
            >
              <option value="VARIAVEL">{t("contasRecorrentes.valorVariavel", "Valor variável")}</option>
              <option value="FIXO">{t("contasRecorrentes.valorFixo", "Valor fixo")}</option>
            </select>
          </div>

          <input
            type="text"
            inputMode="decimal"
            maxLength={12}
            className="border rounded-xl px-3 py-2 font-bold"
            placeholder={t("contasRecorrentes.valorPadrao", "Valor padrão")}
            value={form.valor_padrao}
            onKeyDown={bloquearTeclaValor}
            onPaste={(e) => {
              e.preventDefault();
              const texto = e.clipboardData.getData("text");
              setForm((p) => ({ ...p, valor_padrao: somenteValorVirgula(texto) }));
            }}
            onChange={(e) =>
              setForm((p) => ({ ...p, valor_padrao: somenteValorVirgula(e.target.value) }))
            }
          />
           
           <select
                className="w-full max-w-full box-border border rounded-xl px-3 py-2 font-bold"
                value={form.conta_id}
                onChange={(e) =>
                  setForm((p) => ({ ...p, conta_id: e.target.value }))
                }
              >
                <option value="" disabled hidden>
                  Conta corrente
                </option>

                {contas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>

          <div className="relative">
            <input
              className="border rounded-xl px-3 py-2 font-bold w-full"
              placeholder="Conta contábil. Ex: energia, internet, aluguel..."
              value={form.contabil_label || ""}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  contabil_label: e.target.value,
                  contabil_id: "",
                }))
              }
            />

            {despesasFiltradas.length > 0 && !form.contabil_id && (
              <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border bg-white shadow-lg">
                {despesasFiltradas.map((c) => {
                  const label = c.label || `${c.codigo} - ${c.nome}`;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          contabil_label: label,
                          contabil_id: c.id,
                        }))
                      }
                      className="w-full text-left px-3 py-2 text-sm font-bold hover:bg-blue-50"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <label className="flex items-center gap-2 font-bold text-sm">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) =>
                setForm((p) => ({ ...p, ativo: e.target.checked }))
              }
            />
            {t("contasRecorrentes.contaRecorrenteAtiva", "Conta recorrente ativa")}
          </label>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2 bg-slate-500 text-white font-black"
          >
            {t("contasRecorrentes.cancelar", "Cancelar")}
          </button>

          <button
            type="button"
            onClick={salvar}
            className="rounded-full px-5 py-2 bg-blue-700 text-white font-black"
          >
            {form.id ? t("contasRecorrentes.atualizar", "Atualizar") : t("contasRecorrentes.salvar", "Salvar")}
          </button>
        </div>
      </div>
    </div>
  );
}
