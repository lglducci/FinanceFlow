import { useEffect, useMemo, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";


export default function ContasRecorrentes() {
  const empresa_id =
    localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");

  const [lista, setLista] = useState([]);
  const [contas, setContas] = useState([]);
  const [modalNovo, setModalNovo] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [fornecedores, setFornecedores] = useState([]);
  const [recorrenteEditando, setRecorrenteEditando] = useState(null);
 const [recorrenciaGerando, setRecorrenciaGerando] = useState(null);

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
      `Valor para gerar ${r.descricao}:`,
      r.valor_padrao || ""
    );

    if (!valor) return;

    const conta_financeira_id =
      r.conta_id || r.conta_financeira_id || r.conta_financeira_padrao_id;

    if (!conta_financeira_id) {
      alert("Essa recorrência não possui conta financeira vinculada.");
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
        valor: form.valor,
      }),
    }); 

    const txt = await resp.text();
    console.log("RETORNO GERAR:", txt);

    alert("Lançamento financeiro gerado.");
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

  useEffect(() => {
    carregar();
    carregarContas();
     carregarFornecedores();
      carregarDashboard();
  }, []);


const mesAtual = dashboard[0] || {};

const totalMensal = Number(mesAtual.total_previsto || 0);

const totalSeisMeses = dashboard.reduce(
  (acc, item) => acc + Number(item.total_previsto || 0),
  0
);

const totalFixo = Number(mesAtual.total_fixo || 0);
const totalVariavel = Number(mesAtual.total_variavel || 0);
 

 
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl border p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-slate-800">
            🔁 Contas Recorrentes
          </h2>

       
       {dashboard.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="text-xs font-black text-blue-600 uppercase">
                Mensal atual
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
                Próximos 6 meses
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
                Fixas
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
                Variáveis
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
          ➕ Nova Conta Recorrente
          </button>
        </div>
        
        <div className="grid grid-cols-[1fr_180px] gap-3 mb-5">
          <input
            className="border rounded-xl px-3 py-2 font-bold"
            placeholder="Pesquisar por descrição..."
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
            <option value="todos">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
 
        </div>

        <div className="rounded-xl border overflow-hidden bg-white">
          <div className="grid grid-cols-[1fr_90px_120px_140px_90px_150px_150px] bg-slate-800 text-white text-sm font-black px-3 py-2">
            <div>Descrição</div>
            <div>Dia</div>
            <div>Valor</div>
            <div>Conta</div>
            <div>Status</div>
              <div>Status Geração</div>
            <div className="text-center">Ação</div>
          </div>

          {carregando && (
            <div className="p-4 font-bold text-slate-500">Carregando...</div>
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

                <div>Dia {r.dia_vencimento}</div>

                <div className="font-black">
                  {r.valor_padrao
                    ? Number(r.valor_padrao).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : "Variável"}
                </div>

                <div>{r.conta_nome || r.nome_conta || r.conta_id || "-"}</div>

                <div>
                  {r.ativo ? (
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-black text-xs">
                      Ativo
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-black text-xs">
                      Inativo
                    </span>
                  )}
                </div>
                

                <div>
                      {r.status_mes === "GERADO" ? (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-black text-xs">
                          Gerado
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-black text-xs">
                          Pendente
                        </span>
                      )}
                    </div>

                 <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setRecorrenteEditando(r)}
                    className="rounded-full px-3 py-1 bg-blue-600 text-white font-black text-xs"
                  >
                    Editar
                  </button> 
                   <button
                            onClick={() => setRecorrenciaGerando(r)}
                            disabled={r.status_mes === "GERADO"}
                            className={`rounded-full px-3 py-1 text-white font-black text-xs ${
                              r.status_mes === "GERADO"
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                          >
                            Gerar
                          </button>


                </div>


          
                </div>
            
            ))}
            
         

          {!carregando && filtradas.length === 0 && (
            <div className="p-4 text-slate-500 font-bold">
              Nenhuma conta recorrente encontrada.
            </div>
          )}
        </div>
      </div>

      {recorrenciaGerando && (
  <ModalGerarRecorrencia
    recorrencia={recorrenciaGerando}
    contas={contas}
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

function ModalGerarRecorrencia({ recorrencia, contas, empresa_id, onClose, onSuccess }) {
  const hoje = new Date();

  const competenciaInicial = `${hoje.getFullYear()}-${String(
    hoje.getMonth() + 1
  ).padStart(2, "0")}-01`;

  const [form, setForm] = useState({
    competencia: competenciaInicial,
    data_pagamento: hojeLocal(),
    valor: recorrencia?.valor_padrao || "",
    conta_id: recorrencia?.conta_id || "",
  });

  const vencimento = (() => {
    const [ano, mes] = String(form.competencia).split("-").map(Number);
    const dia = Number(recorrencia?.dia_vencimento || 1);
    const ultimoDia = new Date(ano, mes, 0).getDate();
    const diaFinal = Math.min(dia, ultimoDia);

    return `${ano}-${String(mes).padStart(2, "0")}-${String(diaFinal).padStart(2, "0")}`;
  })();

  async function gerar() {
    if (!form.competencia || !form.valor || !form.conta_id) {
      alert("Informe competência, valor e conta financeira.");
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
        valor: form.valor,
          data_pagamento: form.data_pagamento,
      }),
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
  alert(retorno?.message || "Erro ao gerar conta recorrente.");
  return;
}

alert(retorno?.message || "Conta recorrente gerada.");
onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl border w-[560px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-slate-800">
            💸 Gerar Conta Recorrente
          </h3>

          <button onClick={onClose} className="font-black text-slate-500">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <b>Descrição:</b> {recorrencia?.descricao}
          </div>

          <div>
            <b>Fornecedor:</b>{" "}
            {recorrencia?.fornecedor_nome || recorrencia?.nome_fornecedor || recorrencia?.fornecedor_id || "-"}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold">Competência</label>
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
              <label className="font-bold">Data pagamento</label>
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
              <label className="font-bold">Vencimento</label>
              <input
                className="w-full border rounded-xl px-3 py-2 font-bold bg-gray-100"
                value={vencimento.split("-").reverse().join("/")}
                readOnly
              />
            </div>
          </div>

          <input
            className="w-full border rounded-xl px-3 py-2 font-bold"
            placeholder="Valor"
            value={form.valor}
            onChange={(e) =>
              setForm((p) => ({ ...p, valor: e.target.value }))
            }
          />

          <select
            className="w-full border rounded-xl px-3 py-2 font-bold"
            value={form.conta_id}
            onChange={(e) =>
              setForm((p) => ({ ...p, conta_id: e.target.value }))
            }
          >
            <option value="">Conta financeira</option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="rounded-full px-5 py-2 bg-slate-500 text-white font-black"
          >
            Cancelar
          </button>

          <button
            onClick={gerar}
            className="rounded-full px-5 py-2 bg-emerald-600 text-white font-black"
          >
            Gerar
          </button>
        </div>
      </div>
    </div>
  );
}




function ModalHistoricoRecorrencia({ recorrencia, empresa_id, onClose }) {
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
              📜 Histórico de Pagamentos (últimos seis meses)
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
          <div className="p-4 font-bold text-slate-500">Carregando...</div>
        )}

        {!carregando && linhas.length === 0 && (
          <div className="p-4 rounded-xl bg-slate-50 text-slate-500 font-bold">
            Nenhum pagamento encontrado para esta recorrência.
          </div>
        )}

        {!carregando && linhas.length > 0 && (
          <div className="rounded-xl border overflow-hidden">
             
           <div className="grid grid-cols-[110px_1fr_130px_160px_130px] bg-slate-800 text-white text-sm font-black px-3 py-2">
            <div>Competência</div>
            <div>Descrição</div>
            <div>Data Pagamento</div>
            <div>Conta Corrente</div>
            <div className="text-right">Valor</div>
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
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}






 
 function NovaContaRecorrente({ empresa_id, contas, fornecedores, recorrente, onClose, onSuccess }) {
   const [form, setForm] = useState({
  id: recorrente?.id || null,
  descricao: recorrente?.descricao || "",
  dia_vencimento: recorrente?.dia_vencimento || "",
  tipo_valor: recorrente?.tipo_valor || "VARIAVEL",
  valor_padrao: recorrente?.valor_padrao || "",
  conta_id: recorrente?.conta_id || "",
  ativo: recorrente?.ativo ?? true,
  fornecedor_id: recorrente?.fornecedor_id || "",
});

 

  async function salvar() {
    if (!form.descricao || !form.dia_vencimento || !form.conta_id) {
      alert("Preencha descrição, dia de vencimento e conta financeira.");
      return;
    }

    const webhook = form.id
  ? "atualiza_conta_recorrente"
  : "insere_conta_recorrente";


    const resp = await fetch(buildWebhookUrl(webhook), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresa_id, ...form }),
      });

    const txt = await resp.text();
    console.log("RETORNO INSERE:", txt);

    alert("Conta recorrente cadastrada.");
    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl border w-[560px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-slate-800">
            ➕ Nova Conta Recorrente
          </h3>

          <button onClick={onClose} className="font-black text-slate-500">
            ✕
          </button>
        </div>

        <div className="grid gap-3">
          <input
            className="border rounded-xl px-3 py-2 font-bold"
            placeholder="Descrição: Energia CPFL, Internet, ChatGPT..."
            value={form.descricao}
            onChange={(e) =>
              setForm((p) => ({ ...p, descricao: e.target.value }))
            }
          />
  
          <select
                className="border rounded-xl px-3 py-2 font-bold"
                value={form.fornecedor_id}
                onChange={(e) =>
                    setForm((p) => ({ ...p, fornecedor_id: e.target.value }))
                }
                >
                <option value="">Fornecedor</option>
                {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>
                    {f.nome || f.razao_social || f.apelido || `Fornecedor ${f.id}`}
                    </option>
                ))}
                </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              className="border rounded-xl px-3 py-2 font-bold"
              placeholder="Dia vencimento"
              value={form.dia_vencimento}
              onChange={(e) =>
                setForm((p) => ({ ...p, dia_vencimento: e.target.value }))
              }
            />

            <select
              className="border rounded-xl px-3 py-2 font-bold"
              value={form.tipo_valor}
              onChange={(e) =>
                setForm((p) => ({ ...p, tipo_valor: e.target.value }))
              }
            >
              <option value="VARIAVEL">Valor variável</option>
              <option value="FIXO">Valor fixo</option>
            </select>
          </div>

          <input
            className="border rounded-xl px-3 py-2 font-bold"
            placeholder="Valor padrão"
            value={form.valor_padrao}
            onChange={(e) =>
              setForm((p) => ({ ...p, valor_padrao: e.target.value }))
            }
          />

          <select
            className="border rounded-xl px-3 py-2 font-bold"
            value={form.conta_id}
            onChange={(e) =>
              setForm((p) => ({ ...p, conta_id: e.target.value }))
            }
          >
            <option value="">Conta financeira</option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          
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
              Conta recorrente ativa
            </label>

          <button
            onClick={onClose}
            className="rounded-full px-5 py-2 bg-slate-500 text-white font-black"
          >
            Cancelar
          </button>

          <button
            onClick={salvar}
            className="rounded-full px-5 py-2 bg-blue-700 text-white font-black"
          >
            {form.id ? "Atualizar" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}