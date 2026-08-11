import { useEffect, useMemo, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { fetchSeguro } from "../utils/apiSafe";
import { hojeLocal } from "../utils/dataLocal";

export default function RelatorioRecebiveis() {
  const empresa_id = localStorage.getItem("empresa_id");

  const hoje = hojeLocal();

  const inicioMes = `${hoje.slice(0, 7)}-01`;

  const [dataInicio, setDataInicio] = useState(inicioMes);
  const [dataFim, setDataFim] = useState(hoje);

  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const [aba, setAba] = useState("PERIODO");

  function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function dataBR(data) {
    if (!data) return "-";

    const [ano, mes, dia] = String(data).slice(0, 10).split("-");

    return `${dia}/${mes}/${ano}`;
  }

  function nomeForma(forma) {
    switch (String(forma || "").toUpperCase()) {
      case "CREDITO":
        return "Cartão de crédito";

      case "DEBITO":
        return "Cartão de débito";

      case "PIX":
        return "PIX";

      case "BANCO":
        return "Recebido no banco";

      default:
        return forma || "-";
    }
  }

  function nomeTipo(tipo) {
    switch (tipo) {
      case "RECEBIVEL_GERADO":
        return "Recebível";

      case "TAXA":
        return "Taxa";

      case "TRANSITORIA":
        return "Em trânsito";

      case "RECEBIDO":
        return "Recebido";

      default:
        return tipo || "-";
    }
  }

  async function consultar() {
    if (!empresa_id) {
      setErro("Empresa não identificada.");
      return;
    }

    if (!dataInicio || !dataFim) {
      setErro("Informe o período.");
      return;
    }

    try {
      setCarregando(true);
      setErro("");

      const retorno = await fetchSeguro(
        buildWebhookUrl("relatorio_recebiveis"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            empresa_id: Number(empresa_id),
            data_inicio: dataInicio,
            data_fim: dataFim,
          }),
        }
      );

      const bruto = Array.isArray(retorno)
        ? retorno[0]
        : retorno;

      const data =
        bruto?.ff_relatorio_recebiveis ||
        bruto?.data?.ff_relatorio_recebiveis ||
        bruto?.data?.[0]?.ff_relatorio_recebiveis ||
        bruto?.data?.[0] ||
        bruto?.data ||
        bruto;

      if (!data?.ok) {
        throw new Error(
          data?.mensagem ||
            "Não foi possível gerar o relatório."
        );
      }

      setResultado(data);
    } catch (err) {
      console.error(err);
      setErro(
        err?.message ||
          "Erro ao consultar relatório de recebíveis."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    consultar();
  }, []);

  const resumo = resultado?.resumo || {};
  const futuros = resultado?.futuros || {};

  const itensPeriodo =
    resultado?.itens_periodo || [];

  const itensFuturos =
    resultado?.itens_futuros || [];

  const itens =
    aba === "FUTUROS"
      ? itensFuturos
      : itensPeriodo;
 

      const totalPeriodo = useMemo(() => {
  return itensPeriodo.reduce((acc, item) => {
    if (
      item.tipo !== "TRANSITORIA" &&
      item.tipo !== "RECEBIDO"
    ) {
      return acc;
    }

    return acc + Number(item.valor_assinado || 0);
  }, 0);
}, [itensPeriodo]);

  function imprimirRelatorio() {
  window.print();
}

  return (
    <div className="min-h-screen bg-[#eef7fd] p-2">

      <div className="mx-auto w-full max-w-[1620px]">

        {/* =========================================================
            CABEÇALHO
        ========================================================= */}

        <div className="
          rounded-[28px]
          bg-[#061f4a]
          border border-cyan-100
          shadow-xl
          p-5
        ">

          <div className="
            flex flex-col
            xl:flex-row
            xl:items-end
            justify-between
            gap-4
          ">
            
            <div>
                
              <h1 className="text-2xl font-black text-white">
                💳 Relatório de Recebíveis
              </h1>

              <p className="mt-1 text-sm font-semibold text-cyan-100">
                Recebíveis, taxas, valores em trânsito e recebimentos bancários.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">

              <div>
                <label className="
                  mb-1 block
                  text-xs font-black
                  text-cyan-100
                ">
                  Data inicial
                </label>

                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) =>
                    setDataInicio(e.target.value)
                  }
                  className="
                    rounded-xl
                    border border-slate-300
                    bg-white
                    px-3 py-2
                    text-sm font-bold
                    text-slate-700
                  "
                />
              </div>

              <div>
                <label className="
                  mb-1 block
                  text-xs font-black
                  text-cyan-100
                ">
                  Data final
                </label>

                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) =>
                    setDataFim(e.target.value)
                  }
                  className="
                    rounded-xl
                    border border-slate-300
                    bg-white
                    px-3 py-2
                    text-sm font-bold
                    text-slate-700
                  "
                />
              </div>

              <button
                type="button"
                onClick={consultar}
                disabled={carregando}
                className="
                  rounded-full
                  bg-cyan-400
                  px-6 py-2.5
                  text-sm font-black
                  text-[#062448]
                  shadow
                  hover:bg-cyan-300
                  disabled:opacity-60
                "
              >
                {carregando
                  ? "Consultando..."
                  : "🔎 Consultar"}
              </button>

              <button
                type="button"
                onClick={imprimirRelatorio}
                className="btn-pill btn-gray"
                >
                🖨️ Imprimir
                </button>

            </div>

          </div>

        </div>


        {erro && (
          <div className="
            mt-3 rounded-2xl
            border border-red-200
            bg-red-50
            px-4 py-3
            font-bold text-red-700
          ">
            {erro}
          </div>
        )}

        <div id="print-area"> 
        {/* =========================================================
            CARDS PRINCIPAIS
        ========================================================= */}

        <div className="
          mt-4
          grid grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-3
        ">

          <Card
            titulo="Recebíveis brutos"
            valor={moeda(resumo.recebiveis_brutos)}
            detalhe="Gerados no período"
            icone="💳"
          />

          <Card
            titulo="Taxas"
            valor={moeda(resumo.taxas)}
            detalhe="Custos das operadoras"
            icone="💸"
            negativo
          />

          <Card
            titulo="Recebíveis líquidos"
            valor={moeda(resumo.recebiveis_liquidos)}
            detalhe="Bruto menos taxas"
            icone="🧾"
          />

          <Card
            titulo="Recebido no banco"
            valor={moeda(resumo.recebido_banco_periodo)}
            detalhe="Créditos efetivamente recebidos"
            icone="🏦"
            positivo
          />

        </div>


        {/* =========================================================
            POSIÇÃO
        ========================================================= */}

        <div className="
          mt-3
          grid grid-cols-1
          lg:grid-cols-3
          gap-3
        ">

          <div className="
            rounded-[22px]
            border border-blue-200
            bg-white
            p-5
            shadow-sm
          ">
            <div className="text-xs font-black uppercase text-slate-400">
              Enviado à transitória
            </div>

            <div className="mt-2 text-2xl font-black text-blue-800">
              {moeda(resumo.enviados_transitoria)}
            </div>

            <div className="mt-1 text-xs font-semibold text-slate-500">
              Valores já direcionados para recebimento.
            </div>
          </div>


          <div className="
            rounded-[22px]
            border border-amber-200
            bg-amber-50
            p-5
            shadow-sm
          ">
            <div className="text-xs font-black uppercase text-amber-700">
              Saldo em trânsito na data final
            </div>

            <div
              className={`mt-2 text-2xl font-black ${
                Number(resumo.saldo_transitoria_data_fim || 0) < 0
                  ? "text-red-700"
                  : "text-amber-800"
              }`}
            >
              {moeda(resumo.saldo_transitoria_data_fim)}
            </div>

            <div className="mt-1 text-xs font-semibold text-amber-800">
              Posição contábil da conta transitória em {dataBR(dataFim)}.
            </div>
          </div>


          {/* CARD MAIS IMPORTANTE */}

          <div className="
            rounded-[22px]
            border-2 border-emerald-300
            bg-emerald-50
            p-5
            shadow-md
          ">

            <div className="
              flex items-start
              justify-between
              gap-3
            ">

              <div>
                <div className="
                  text-xs font-black
                  uppercase
                  text-emerald-700
                ">
                  Recebíveis futuros
                </div>

                <div className="
                  mt-2
                  text-3xl font-black
                  text-emerald-800
                ">
                  {moeda(futuros.total)}
                </div>
              </div>

              <div className="text-3xl">
                📅
              </div>

            </div>

            <div className="
              mt-2
              text-xs font-semibold
              text-emerald-800
            ">
              Valores previstos após {dataBR(dataFim)}
            </div>

            {Number(futuros.quantidade || 0) > 0 && (
              <div className="
                mt-3
                border-t border-emerald-200
                pt-3
                text-xs font-bold
                text-emerald-900
              ">
                {futuros.quantidade} recebimento(s)
                {" • "}
                {dataBR(futuros.primeira_data)}
                {" até "}
                {dataBR(futuros.ultima_data)}
              </div>
            )}

          </div>

        </div>


        {/* =========================================================
            FUTUROS POR FORMA
        ========================================================= */}

        <div className="
          mt-3
          grid grid-cols-1
          md:grid-cols-3
          gap-3
        ">

          <MiniCard
            titulo="Crédito futuro"
            valor={moeda(futuros.credito)}
            icone="💳"
          />

          <MiniCard
            titulo="Débito futuro"
            valor={moeda(futuros.debito)}
            icone="💳"
          />

          <MiniCard
            titulo="PIX futuro"
            valor={moeda(futuros.pix)}
            icone="⚡"
          />

        </div>


        {/* =========================================================
            DETALHAMENTO
        ========================================================= */}

        <div className="
          mt-4
          rounded-[24px]
          border border-slate-200
          bg-white
          shadow-sm
          overflow-hidden
        ">

          <div className="
            flex flex-col
            md:flex-row
            md:items-center
            justify-between
            gap-3
            border-b
            bg-slate-50
            px-5 py-4
          ">

            <div>
              <div className="text-lg font-black text-slate-800">
                Detalhamento dos recebíveis
              </div>

              <div className="text-xs font-semibold text-slate-500">
                Origem contábil dos valores apresentados acima.
              </div>
            </div>


            <div className="
              flex items-center
              rounded-full
              bg-slate-200
              p-1
            ">

              <button
                type="button"
                onClick={() => setAba("PERIODO")}
                className={`rounded-full px-4 py-2 text-xs font-black transition ${
                  aba === "PERIODO"
                    ? "bg-[#063452] text-white shadow"
                    : "text-slate-600"
                }`}
              >
                Movimentos do período
                {" "}
                ({itensPeriodo.length})
              </button>


              <button
                type="button"
                onClick={() => setAba("FUTUROS")}
                className={`rounded-full px-4 py-2 text-xs font-black transition ${
                  aba === "FUTUROS"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-600"
                }`}
              >
                Recebíveis futuros
                {" "}
                ({itensFuturos.length})
              </button>

            </div>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px] text-sm">

              <thead className="bg-[#063452] text-white">

                <tr>
                  <th className="px-4 py-3 text-left">
                    Data
                  </th>

                  <th className="px-4 py-3 text-left">
                    Situação
                  </th>

                  <th className="px-4 py-3 text-left">
                    Forma
                  </th>

                  <th className="px-4 py-3 text-left">
                    Histórico
                  </th>

                  <th className="px-4 py-3 text-left">
                    Modelo
                  </th>

                  <th className="px-4 py-3 text-right">
                    Valor
                  </th>
                </tr>

              </thead>


              <tbody>

                {itens.length === 0 ? (

                  <tr>
                    <td
                      colSpan={6}
                      className="
                        px-4 py-12
                        text-center
                        font-bold
                        text-slate-400
                      "
                    >
                      Nenhum recebível encontrado.
                    </td>
                  </tr>

                ) : (

                  itens.map((item, index) => (

                    <tr
                      key={`${item.lancamento_id}-${index}`}
                      className={`
                        ${
                          index % 2 === 0
                            ? "bg-white"
                            : "bg-slate-50"
                        }
                        hover:bg-cyan-50
                      `}
                    >

                      <td className="
                        whitespace-nowrap
                        border-t
                        px-4 py-3
                        font-semibold
                      ">
                        {dataBR(
                          item.data ||
                          item.data_prevista
                        )}
                      </td>


                      <td className="border-t px-4 py-3">
                        <BadgeTipo tipo={item.tipo} />
                      </td>


                      <td className="
                        border-t
                        px-4 py-3
                        font-bold
                        text-slate-700
                      ">
                        {nomeForma(item.forma)}
                      </td>


                      <td className="
                        border-t
                        px-4 py-3
                        text-slate-700
                      ">
                        {item.historico || "-"}
                      </td>


                      <td className="
                        border-t
                        px-4 py-3
                        text-xs font-bold
                        text-slate-500
                      ">
                        {item.modelo_codigo || "-"}
                      </td>


                      <td className="
                        whitespace-nowrap
                        border-t
                        px-4 py-3
                        text-right
                        font-black
                        text-slate-800
                      ">
                        <td
                            className={`whitespace-nowrap border-t px-4 py-3 text-right font-black ${
                                Number(item.valor_assinado || 0) < 0
                                ? "text-red-600"
                                : item.tipo === "TRANSITORIA"
                                ? "text-emerald-700"
                                : "text-slate-800"
                            }`}
                            >
                            {item.tipo === "TRANSITORIA" || item.tipo === "RECEBIDO"
                                ? moeda(item.valor_assinado)
                                : moeda(item.valor)}
                            </td>
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>


          {aba === "PERIODO" && itensPeriodo.length > 0 && (
            <div className="
              flex justify-end
              border-t
              bg-slate-50
              px-5 py-3
            ">
              <div className="text-right">

                <div className="
                  text-[11px]
                  font-black uppercase
                  text-slate-400
                ">
                  Posição líquida da transitória
                </div>

                <div className="
                  text-lg font-black
                  text-slate-800
                ">
                  {moeda(totalPeriodo)}
                </div>

              </div>
            </div>
          )}

        </div>
       </div>
      </div>
    </div>
  );
}


/* ================================================================
   CARD
================================================================ */

function Card({
  titulo,
  valor,
  detalhe,
  icone,
  positivo,
  negativo,
}) {
  return (
    <div className="
      rounded-[22px]
      border border-slate-200
      bg-white
      p-5
      shadow-sm
    ">

      <div className="
        flex items-start
        justify-between
        gap-3
      ">

        <div>

          <div className="
            text-xs font-black
            uppercase
            text-slate-400
          ">
            {titulo}
          </div>

          <div
            className={`mt-2 text-2xl font-black ${
              positivo
                ? "text-emerald-700"
                : negativo
                ? "text-red-600"
                : "text-slate-800"
            }`}
          >
            {valor}
          </div>

        </div>

        <div className="text-2xl">
          {icone}
        </div>

      </div>

      <div className="
        mt-2
        text-xs font-semibold
        text-slate-500
      ">
        {detalhe}
      </div>

    </div>
  );
}


/* ================================================================
   MINI CARD
================================================================ */

function MiniCard({
  titulo,
  valor,
  icone,
}) {
  return (
    <div className="
      flex items-center
      justify-between
      rounded-[18px]
      border border-slate-200
      bg-white
      px-5 py-4
      shadow-sm
    ">

      <div>
        <div className="
          text-xs font-black
          uppercase
          text-slate-400
        ">
          {titulo}
        </div>

        <div className="
          mt-1
          text-xl font-black
          text-slate-800
        ">
          {valor}
        </div>
      </div>

      <div className="text-2xl">
        {icone}
      </div>

    </div>
  );
}


/* ================================================================
   BADGE
================================================================ */

function BadgeTipo({ tipo }) {
  const configuracao = {
    RECEBIVEL_GERADO: {
      texto: "Recebível",
      classe:
        "bg-blue-100 text-blue-800 border-blue-200",
    },

    TAXA: {
      texto: "Taxa",
      classe:
        "bg-red-100 text-red-700 border-red-200",
    },

    TRANSITORIA: {
      texto: "Em trânsito",
      classe:
        "bg-amber-100 text-amber-800 border-amber-200",
    },

    RECEBIDO: {
      texto: "Recebido",
      classe:
        "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
  };

  const cfg =
    configuracao[tipo] || {
      texto: tipo || "-",
      classe:
        "bg-slate-100 text-slate-700 border-slate-200",
    };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        border
        px-3 py-1
        text-[11px]
        font-black
        ${cfg.classe}
      `}
    >
      {cfg.texto}
    </span>
  );
}