 import { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import { hojeLocal, dataLocal } from "../utils/dataLocal";
import ModalBase from "../components/ModalBase";
import FormSaldoInicial from "../components/forms/FormSaldoInicial";

export default function SaldosIniciais() {

  const hoje = new Date().toISOString().slice(0, 10);

  const [empresaId, setEmpresaId] = useState(null);
 
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState([]);
  const [mostrarZeradas, setMostrarZeradas] = useState(true);
  const navigate = useNavigate();
 const [dataIni, setDataIni] = useState(hoje);
const [dataFim, setDataFim] = useState(hoje);
  const [contaId, setContaId] = useState("");
const [modalAberto, setModalAberto] = useState(false);
const [form, setForm] = useState({
  id: null,
  codigo: "",
  nome: "",
  tipo: "",
  saldo: 0
});


 const fmt = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});


useEffect(() => {
  const id = localStorage.getItem("id_empresa");
  console.log("id_empresa localStorage:", id);

  if (id) {
    setEmpresaId(Number(id));
  }
}, []);


  async function consultar() {
    if (!empresaId) {
      alert("Empresa não carregada");
      return;
    }

    setLoading(true);
    setDados([]);

    try {
      const resp = await fetch(
        buildWebhookUrl("saldo_inicial"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id: empresaId ,
            filtro: contaId
            
          }),
        }
      );

      const json = await resp.json();
      setDados(Array.isArray(json) ? json : []);
    } catch (e) {
      alert("Erro ao carregar Saldos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  if ( empresaId && contaId) {
    consultar();
  }
}, [ empresaId, contaId]);

 

  function linhaZerada(l) {
  return (
    
    Number(l.saldo || 0) === 0  
  );
}
 async function salvarSaldo() {
  try {
    const saldoNovo = Number(form.saldo || 0);

    const resp = await fetch(buildWebhookUrl("salva_saldo"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id: empresaId,
        conta_id: form.id,
        saldo: saldoNovo
      }),
    });

    const json = await resp.json();

    if (!resp.ok || json?.ok === false) {
      alert(json?.message || "Erro ao salvar saldo");
      return;
    }

    setDados((antigos) =>
      antigos.map((item) =>
        item.id === form.id
          ? { ...item, saldo: saldoNovo }
          : item
      )
    );

    setModalAberto(false);
    setForm({
      id: null,
      codigo: "",
      nome: "",
      tipo: "",
      saldo: 0
    });

  } catch (e) {
    alert("Erro ao salvar saldo");
  }
}

  return (
  <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6">

    <div className="mx-auto max-w-7xl">

      {/* CABEÇALHO */}
      <div className="mb-4 rounded-2xl bg-[#0f172a] px-5 py-4 shadow-lg text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black">
              📒 Implantação de Saldos Iniciais
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Informe ou ajuste os saldos iniciais das contas contábeis.
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="btn-pill btn-gray"
          >
            ← Voltar
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="mb-4 rounded-2xl bg-white border border-slate-200 shadow p-4">
        <div className="flex flex-col md:flex-row md:items-end gap-3">

          <div className="flex-1">
            <label className="block text-sm font-black text-slate-700 mb-1">
              Conta
            </label>
            <input
              type="text"
              placeholder="Digite código ou nome da conta"
              value={contaId}
              onChange={(e) => setContaId(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-semibold
                         focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-700"
            />
          </div>

          <button
            onClick={consultar}
            className="btn-pill btn-dark-blue"
          >
            🔎 Consultar
          </button>

          <button
            onClick={() => window.print()}
            className="btn-pill btn-dark-gray"
          >
            🖨️ Imprimir
          </button>

          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700 md:pb-2">
            <input
              type="checkbox"
              checked={!mostrarZeradas}
              onChange={() => setMostrarZeradas(!mostrarZeradas)}
              className="h-4 w-4"
            />
            Ocultar zeradas
          </label>

        </div>
      </div>

      {/* ÁREA DE IMPRESSÃO */}
      <div id="print-area">

        <div className="rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden">

          {/* TOPO DA TABELA */}
          <div className="bg-[#1e293b] px-4 py-3 text-white flex items-center justify-between">
            <div>
              <h2 className="font-black text-base">
                Contas para implantação
              </h2>
              <p className="text-xs text-slate-300">
                Total de registros: {dados.length}
              </p>
            </div>

            {loading && (
              <span className="text-sm font-bold text-blue-200">
                Carregando...
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Código</th>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-left">Tipo</th>
                  <th className="p-3 text-right">Saldo Inicial</th>
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>

              <tbody>
                {dados
                  .filter((l) => mostrarZeradas || !linhaZerada(l))
                  .map((l, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-slate-200 hover:bg-blue-50 transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                      }`}
                    >
                      <td className="p-3 font-bold text-slate-700">
                        {l.id}
                      </td>

                      <td className="p-3 font-black text-slate-800">
                        {l.codigo}
                      </td>

                      <td className="p-3 font-semibold text-slate-700">
                        {l.nome}
                      </td>

                      <td className="p-3">
                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-700">
                          {l.tipo}
                        </span>
                      </td>

                      <td
                        className={`p-3 text-right font-black text-base ${
                          Number(l.saldo || 0) < 0
                            ? "text-red-600"
                            : "text-green-700"
                        }`}
                      >
                        {fmt.format(l.saldo)}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setForm({
                              id: l.id,
                              codigo: l.codigo,
                              nome: l.nome,
                              tipo: l.tipo,
                              saldo: Number(l.saldo || 0),
                            });

                            setModalAberto(true);
                          }}
                          className={`rounded-full px-4 py-1.5 text-xs font-black shadow-sm transition
                            ${
                              Number(l.saldo || 0) !== 0
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            }`}
                        >
                          {Number(l.saldo || 0) !== 0 ? "Alterar" : "Incluir"}
                        </button>
                      </td>
                    </tr>
                  ))}

                {!loading && dados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                      Nenhum saldo encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <FormSaldoInicial
        aberto={modalAberto}
        form={form}
        setForm={setForm}
        onClose={() => {
          setModalAberto(false);
          setForm({
            id: null,
            codigo: "",
            nome: "",
            tipo: "",
            saldo: 0,
          });
        }}
        onSalvar={salvarSaldo}
      />

    </div>
  </div>
);
}
