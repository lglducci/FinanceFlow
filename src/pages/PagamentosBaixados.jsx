 import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { buildWebhookUrl } from "../config/globals.js";

export default function PagamentosBaixados({
  modoModal = false,
  loteInicialProp = "",
  onClose = null,
} = {}) {
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");
 

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  const moeda = (v) =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const dataBR = (d) => {
    if (!d) return "-";
    const [ano, mes, dia] = String(d).substring(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
  };


  const navigate = useNavigate();
const location = useLocation();
  

 
    const loteInicial =
  loteInicialProp ||
  location.state?.lote_conciliacao_id ||
  "";

const [lote, setLote] = useState(loteInicial);

const mascaraCpfCnpj = (v) => {
  const n = String(v || "").replace(/\D/g, "");

  if (n.length === 14) {
    return n.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }

  if (n.length === 11) {
    return n.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }

  return v || "-";
};


  async function carregar(loteInformado = lote) {
    try {
      setLoading(true);

      const resp = await fetch(buildWebhookUrl("pagamentos_baixados"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id,
          lote_conciliacao_id: loteInformado ? Number(loteInformado) : 0,
        }),
      });

      const json = await resp.json();
      const lista = Array.isArray(json) ? json : json?.data || [];

      setDados(lista);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar pagamentos baixados.");
    } finally {
      setLoading(false);
    }
  }
 
  useEffect(() => {
  carregar(loteInicial);
}, []);

  const resumo = useMemo(() => {
    const total = dados.length;

    const resolvidos = dados.filter((r) =>
      ["RESOLVIDO", "BAIXADO", "OK", "CONCLUIDO"].includes(
        String(r.controle_status || "").toUpperCase()
      )
    ).length;

    const pendentes = dados.filter((r) =>
      ["PENDENTE", "NAO_ENCONTRADO", "NÃO_ENCONTRADO"].includes(
        String(r.controle_status || "").toUpperCase()
      )
    ).length;

    const comPessoa = dados.filter((r) => r.pessoa_id).length;
    const semPessoa = dados.filter((r) => !r.pessoa_id).length;

    const contasPagar = dados.filter((r) => r.conta_pagar_id).length;
    const contasReceber = dados.filter((r) => r.conta_receber_id).length;

    const valorTotal = dados.reduce((acc, r) => acc + Number(r.valor || 0), 0);

    return {
      total,
      resolvidos,
      pendentes,
      comPessoa,
      semPessoa,
      contasPagar,
      contasReceber,
      valorTotal,
    };
  }, [dados]);

  const statusBadge = (status) => {
    const s = String(status || "").toUpperCase();

    if (["RESOLVIDO", "BAIXADO", "OK", "CONCLUIDO"].includes(s)) {
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }

    if (["PENDENTE", "NAO_ENCONTRADO", "NÃO_ENCONTRADO"].includes(s)) {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }

    return "bg-slate-100 text-slate-600 border-slate-200";
  };


 const getStatusPagamento = (status) => {
  const s = String(status || "").toUpperCase();

  if (["RESOLVIDO", "BAIXADO", "OK", "CONCLUIDO"].includes(s)) {
    return {
      titulo: "Baixado",
      descricao: "Conta encontrada e baixada automaticamente.",
      classe: "bg-emerald-100 text-emerald-700 border-emerald-300",
    };
  }

  if (["PENDENTE", "NAO_ENCONTRADO", "NÃO_ENCONTRADO"].includes(s)) {
    return {
      titulo: "Revisar",
      descricao:
        "Nenhuma conta a pagar compatível. Verifique se foi pagamento à vista ou faça o vínculo manual.",
      classe: "bg-amber-100 text-amber-700 border-amber-300",
    };
  }

  return {
    titulo: "Não processado",
    descricao: "Movimentação ainda não analisada.",
    classe: "bg-slate-100 text-slate-700 border-slate-300",
  };
};


  return (
     <div className={modoModal ? "px-2 py-2" : "min-h-screen bg-gradient-to-br from-slate-500 via-blue-350 to-cyan-350 px-3 py-4"}>
      <div className="mx-auto w-full max-w-[1500px]">

        <div className="rounded-[28px] bg-white border border-cyan-100 shadow-[0_8px_30px_rgba(15,23,42,0.10)] overflow-hidden">

          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 px-6 py-5 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black">
                  Pagamentos baixados
                </h1>
                <p className="text-cyan-100 text-sm font-semibold mt-1">
                  Conferência dos títulos encontrados, pendentes e vinculados na conciliação.
                </p>
              </div>

              <div className="flex items-end gap-2">
                <div>
                  <label className="block text-xs font-bold text-cyan-100 mb-1">
                    Nº da importação / lote
                  </label>
                  <input
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    placeholder="Ex: 123"
                    className="h-10 w-44 rounded-xl border border-cyan-200 bg-white px-3 text-slate-800 font-bold outline-none"
                  />
                </div>

                

                <button
                  onClick={() => carregar(lote)}
                  disabled={loading}
                  className="h-10 px-5 rounded-xl bg-orange-400 text-slate-900 font-black shadow hover:brightness-105 disabled:opacity-60"
                >
                  {loading ? "Buscando..." : "Filtrar"}
                </button>

                <button
                  onClick={() => {
                    setLote("");
                    carregar("");
                  }}
                  className="h-10 px-5 rounded-xl bg-white/15 border border-white/25 text-white font-bold hover:bg-white/20"
                >
                  Tudo
                </button>

                 <button
                        type="button"
                        onClick={() => {
                            if (modoModal) {
                              onClose?.();
                            } else {
                              navigate("/importacao-bancaria", { replace: true });
                            }
                          }}
                        className="h-10 px-5 rounded-xl bg-white/15 border border-white/25 text-white font-bold hover:bg-white/20"
                      >
                       {modoModal ? "Fechar" : "← Voltar"}
                      </button>

              </div>
            </div>
          </div>

          <div className="p-5 space-y-5">

            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
              <Card titulo="Lote" valor={lote || dados[0]?.lote_conciliacao_id || "Todos"} cor="blue" />
              <Card titulo="Registros" valor={resumo.total} />
              
               <Card
                    titulo="Baixados automaticamente"
                    valor={resumo.resolvidos}
                    cor="emerald"
                  />

                  <Card
                    titulo="Pendentes de revisão"
                    valor={resumo.pendentes}
                    cor="amber"
                  />
               


            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-auto max-h-[620px]">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-slate-900 text-white z-10">
                    <tr>
                      <Th>ID</Th>
                    
                      <Th>Data</Th>
                      <Th>Histórico</Th>
                      <Th>Pessoa</Th>
                      <Th>CPF/CNPJ</Th>
                      <Th>Valor</Th> 
                      <Th>Status</Th>
                     <Th>RESULTADO DA CONCILIAÇÃO</Th>
                      
                    </tr>
                  </thead>

                  <tbody>
                       {dados.map((r, idx) => {
                        const statusInfo = getStatusPagamento(r.controle_status);

                        return (
                          <tr
                            key={r.controle_id}
                            className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                          >
                        <Td>{r.controle_id}</Td>
                  
                        <Td>{dataBR(r.data_mov)}</Td>
                        <Td>
                           <div className="font-bold text-slate-700 max-w-[620px] truncate">
                            {r.historico}
                          </div>
                          
                        </Td>
                        <Td>
                          {r.pessoa_nome ? (
                             <span className="block max-w-[230px] truncate font-bold text-slate-700">
                              {r.pessoa_nome}
                            </span>
                          ) : (
                            <span className="text-rose-500 font-bold">
                              Não encontrado
                            </span>
                          )}
                        </Td>
                         <Td>{mascaraCpfCnpj(r.pessoa_cpf_cnpj)}</Td>
                        <Td>
                          <span className="font-black text-slate-800">
                            {moeda(r.valor)}
                          </span>
                        </Td>
                       
                         <Td>
                          <span
                            className={`inline-flex px-3 py-1 rounded-full border text-xs font-black ${statusInfo.classe}`}
                          >
                            {statusInfo.titulo}
                          </span>
                        </Td>

                        <Td className="max-w-[320px]">
                          <span className="text-xs font-semibold text-slate-600">
                            {statusInfo.descricao}
                          </span>
                        </Td>
                        
                        
                       </tr>
                              );
                            })}

                    {!loading && dados.length === 0 && (
                      <tr>
                        <td colSpan="13" className="text-center py-10 text-slate-400 font-bold">
                          Nenhum registro encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ titulo, valor, cor = "slate" }) {
  const cores = {
    slate: "from-slate-50 to-slate-100 border-slate-200 text-slate-800",
    emerald: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800",
    amber: "from-amber-50 to-amber-100 border-amber-200 text-amber-800",
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-800",
    rose: "from-rose-50 to-rose-100 border-rose-200 text-rose-800",
    indigo: "from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-800",
    cyan: "from-cyan-50 to-cyan-100 border-cyan-200 text-cyan-800",
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${cores[cor]} p-4 shadow-sm`}>
      <div className="text-xs font-black uppercase opacity-70">
        {titulo}
      </div>
      <div className="text-xl font-black mt-1">
        {valor}
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-3 py-3 text-left text-xs font-black uppercase whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="px-3 py-3 border-b border-slate-100 whitespace-nowrap">
      {children}
    </td>
  );
}