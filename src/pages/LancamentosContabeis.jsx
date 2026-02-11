import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom"; 
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";

export default function LancamentosContabeis() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || Number(localStorage.getItem("id_empresa")));

  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [conta, setConta] = useState("");
  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState([]);
  const [mostrarZeradas, setMostrarZeradas] = useState(false);
  const [loading, setLoading] = useState(false);
    const btnPadrao =
  "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";

  const listaFiltrada = mostrarZeradas
  ? lista
  : lista.filter(l => !linhaZerada(l));

 async function pesquisar() {
  setLoading(true);

  try {
    const url = buildWebhookUrl("lancamento_contabil", {
      empresa_id,
      data_ini: dataIni,
      data_fim: dataFim,
      filtro: conta
    });

    const resp = await fetch(url);

    // 👇 SE NÃO FOR 200, MOSTRA ERRO REAL
    if (!resp.ok) {
      const erroTexto = await resp.text();
      console.error("ERRO HTTP:", resp.status, erroTexto);
      alert(`Erro HTTP ${resp.status}`);
      return;
    }

    // 👇 LÊ COMO TEXTO PRIMEIRO
    const texto = await resp.text();
    console.log("RETORNO BRUTO:", texto);

    // 👇 SE VIER VAZIO, PARA
    if (!texto) {
      alert("Webhook retornou vazio");
      return;
    }

    // 👇 AGORA SIM PARSEIA
    const json = JSON.parse(texto);

    setLista(Array.isArray(json) ? json : []);

  } catch (e) {
    console.error("ERRO REAL:", e);
    alert("Erro ao carregar lançamentos (ver console)");
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    const hoje = hojeLocal();
    
    setDataIni(hojeMaisDias(-30));
    setDataFim(hoje);
  }, []);


  function linhaZerada(l) {
  return (
    Number(l.saldo_inicial || 0) === 0 &&
    Number(l.debito || 0) === 0 &&
    Number(l.credito || 0) === 0 &&
    Number(l.saldo || 0) === 0  
  );
}
 return (
  <div className="p-4 bg-gray-100 rounded-xl">

    {/* ===== FILTROS ===== */}
    <div className="bg-white rounded-xl shadow border-l-4 border-blue-600 p-4 mb-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">
        📘 Lançamentos Contábeis
      </h2>

      <div className="flex flex-wrap gap-4 items-end">

        <div className="flex flex-col">
          <label className="font-bold text-blue-800 mb-1">Data inicial</label>
          <input
            type="date"
            value={dataIni}
            onChange={(e) => setDataIni(e.target.value)}
            className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-bold text-blue-800 mb-1">Data final</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <div className="flex flex-col flex-1 min-w-[260px]">
          <label className="font-bold text-blue-800 mb-1">Conta</label>
          <input
            type="text"
            value={conta}
            onChange={(e) => setConta(e.target.value)}
            placeholder="Código ou nome da conta"
            className="border rounded-lg px-3 py-2 border-yellow-500"
          />
        </div>

        <button
          onClick={pesquisar}
          className="px-6 h-11 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-700"
        >
          Filtrar
        </button>

        <button
          onClick={() => navigate("/lancamentocontabilrapido")}
          className="px-6 h-11 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600"
        >
          ⚡ Lançamento rápido
        </button>

        <button
          onClick={() => navigate("/lancamento-contabil-manual")}
          className="px-6 h-11 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-600"
        >
          + Implantar saldo
        </button>

        <label className="flex items-center gap-2 ml-4 font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={!mostrarZeradas}
            onChange={() => setMostrarZeradas(!mostrarZeradas)}
          />
          Ocultar contas sem movimento
        </label>
      </div>
    </div>

    {/* ===== TABELA ===== */}
    <div className="bg-white rounded-xl shadow p-4 border border-gray-400">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100 text-blue-800">
          <tr>
            <th className="p-2 text-center">Mês/Ano</th>
            <th className="p-2 text-left">Código</th>
            <th className="p-2 text-left">Conta</th>
            <th className="p-2 text-right">Saldo inicial</th>
            <th className="p-2 text-right">Valor</th>
            <th className="p-2 text-right">Saldo final</th>
          </tr>
        </thead>

        <tbody>
          {!loading && lista.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-6 text-gray-600">
                Nenhum lançamento encontrado.
              </td>
            </tr>
          )}

          {listaFiltrada.map((l, i) => (
            <tr
              key={l.id}
              className={i % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}
            >
              <td className="p-2 text-center font-bold">{l.mes_ano}</td>
              <td className="p-2 font-bold">{l.conta_codigo}</td>
              <td className="p-2 font-bold">{l.conta_nome}</td>

              <td className="p-2 text-right font-bold">
                {Number(l.saldo_inicial).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </td>

              <td
                className={`p-2 text-right font-bold ${
                  Number(l.valor) >= 0 ? "text-green-700" : "text-red-600"
                }`}
              >
                {Number(l.valor).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </td>

              <td
                className={`p-2 text-right font-bold ${
                  Number(l.saldo) >= 0 ? "text-green-700" : "text-red-600"
                }`}
              >
                {Number(l.saldo).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>
);

  
}
