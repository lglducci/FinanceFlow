import { useEffect, useMemo, useState } from "react";
import { buildWebhookUrl } from "../config/globals";

export default function RelatorioFornecedor() {
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  function moeda(v) {
    return Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function carregar() {
    try {
      setLoading(true);

      const resp = await fetch(
        buildWebhookUrl("rel_fornecedor", { empresa_id })
      );

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : []);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar relatório por fornecedor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (empresa_id) carregar();
  }, [empresa_id]);

  const totais = useMemo(() => {
    return dados.reduce(
      (acc, x) => {
        acc.vencido += Number(x.vencido || 0);
        acc.vence7 += Number(x.vence_7_dias || 0);
        acc.vence15 += Number(x.vence_15_dias || 0);
        acc.vence30 += Number(x.vence_30_dias || 0);
        acc.vence60 += Number(x.vence_60_dias || 0);
        acc.acima60 += Number(x.acima_60_dias || 0);
        acc.total += Number(x.total_aberto || 0);
        acc.qtd += Number(x.qtd_titulos || 0);
        return acc;
      },
      {
        vencido: 0,
        vence7: 0,
        vence15: 0,
        vence30: 0,
        vence60: 0,
        acima60: 0,
        total: 0,
        qtd: 0,
      }
    );
  }, [dados]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Contas a Pagar por Fornecedor
          </h1>
          <p className="text-sm text-slate-500">
            Visão agregada de dívidas por vencimento.
          </p>
        </div>

        <button
          onClick={carregar}
          className="rounded-full bg-blue-700 px-5 py-2 text-sm font-bold text-white shadow"
        >
          {loading ? "Carregando..." : "Atualizar"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card titulo="Total em aberto" valor={moeda(totais.total)} cor="blue" />
        <Card titulo="Vencido" valor={moeda(totais.vencido)} cor="red" />
        <Card titulo="Vence 7 dias" valor={moeda(totais.vence7)} cor="amber" />
        <Card titulo="Qtd. títulos" valor={totais.qtd} cor="slate" />
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow border">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-3 py-3 text-left">Fornecedor</th>
              <th className="px-3 py-3 text-right">Vencido</th>
              <th className="px-3 py-3 text-right">7 dias</th>
              <th className="px-3 py-3 text-right">15 dias</th>
              <th className="px-3 py-3 text-right">30 dias</th>
              <th className="px-3 py-3 text-right">60 dias</th>
              <th className="px-3 py-3 text-right">+60 dias</th>
              <th className="px-3 py-3 text-right">Total</th>
              <th className="px-3 py-3 text-center">Qtd</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((f) => (
              <tr key={f.fornecedor_id} className="border-t hover:bg-blue-50">
                <td className="px-3 py-3 font-bold text-slate-800">
                  {f.fornecedor_nome}
                </td>
                <td className="px-3 py-3 text-right text-red-600 font-bold">
               {Number(f.vencido || 0) > 0
                  ? moeda(f.vencido)
                   : "-"}
                </td>
                       <td className="px-3 py-3 text-right"> {Number(f.vence_7_dias || 0) > 0
                                                  ? moeda(f.vence_7_dias)
                                                  : "-"}</td>
                 
                <td className="px-3 py-3 text-right"> {Number(f.vence_15_dias || 0) > 0
                                                                ? moeda(f.vence_15_dias)
                                                                : "-"}</td>
               <td className="px-3 py-3 text-right">
                        {Number(f.vence_30_dias || 0) > 0
                          ? moeda(f.vence_30_dias)
                          : "-"}
                      </td>
                <td className="px-3 py-3 text-right">{Number(f.vence_60_dias || 0) > 0
                                                                ? moeda(f.vence_60_dias)
                                                                : "-"}</td>
                <td className="px-3 py-3 text-right"> {Number(f.acima_60_dias || 0) > 0
                                                                ? moeda(f.acima_60_dias)
                                                                : "-"}</td>
                <td className="px-3 py-3 text-right font-black text-blue-800">
                  {moeda(f.total_aberto)}
                </td>
                <td className="px-3 py-3 text-center font-bold">
                  {f.qtd_titulos}
                </td>
              </tr>
            ))}

            {dados.length === 0 && !loading && (
              <tr>
                <td colSpan="9" className="px-4 py-6 text-center text-slate-500">
                  Nenhuma conta em aberto encontrada.
                </td>
              </tr>
            )}
          </tbody>

          <tfoot className="bg-slate-100 border-t-2 border-slate-300">
  <tr>
    <td className="px-3 py-3 font-black text-slate-900">
      TOTAL
    </td>

    <td className="px-3 py-3 text-right font-black text-red-700">
      {moeda(totais.vencido)}
    </td>

    <td className="px-3 py-3 text-right font-black">
      {moeda(totais.vence7)}
    </td>

    <td className="px-3 py-3 text-right font-black">
      {moeda(totais.vence15)}
    </td>

    <td className="px-3 py-3 text-right font-black">
      {moeda(totais.vence30)}
    </td>

    <td className="px-3 py-3 text-right font-black">
      {moeda(totais.vence60)}
    </td>

    <td className="px-3 py-3 text-right font-black">
      {moeda(totais.acima60)}
    </td>

    <td className="px-3 py-3 text-right font-black text-blue-800">
      {moeda(totais.total)}
    </td>

    <td className="px-3 py-3 text-center font-black">
      {totais.qtd}
    </td>
  </tr>
</tfoot>
        </table>
      </div>
    </div>
  );
}

function Card({ titulo, valor, cor }) {
  const cores = {
    blue: "border-blue-500 text-blue-800",
    red: "border-red-500 text-red-700",
    amber: "border-amber-500 text-amber-700",
    slate: "border-slate-500 text-slate-700",
  };

  return (
    <div className={`rounded-2xl bg-white p-4 shadow border-l-4 ${cores[cor]}`}>
      <div className="text-sm font-bold text-slate-500">{titulo}</div>
      <div className="mt-2 text-2xl font-black">{valor}</div>
    </div>
  );
}