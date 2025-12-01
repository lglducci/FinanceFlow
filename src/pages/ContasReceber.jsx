 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function ContasReceber() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

  const [lista, setLista] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  const [status, setStatus] = useState("aberto");
  const [fornecedor_id, setFornecedorId] = useState(0);

   const [contas, setContas] = useState([]);
  const [dadosConta, setDadosConta] = useState(null);
  const [conta_id, setContaId] = useState(0);

  const [saldoConta, setSaldoConta] = useState(0);

  const [periodo, setPeriodo] = useState("hoje");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loading, setLoading] = useState(false);
 const [totalPeriodo, setTotalPeriodo] = useState(0);
 const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
 const [selecionadas, setSelecionadas] = useState([]);

 


 // CARREGA CONTAS BANCÁRIAS
async function carregarContas() {
  try {
    const url = buildWebhookUrl("listacontas", { empresa_id });
    const resp = await fetch(url);
    const json = await resp.json();
    setContas(json);
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
  const hoje = new Date();

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

    if (periodo === "bimestre") {
    // Próximos 30 dias
    const ini = new Date();               // hoje
    const fim = new Date();
    fim.setDate(hoje.getDate() + 60);     // hoje + 60 dias

    setDataIni(ini.toISOString().split("T")[0]);
    setDataFim(fim.toISOString().split("T")[0]);
  } 

  if (periodo === "mes") {
    // Próximos 30 dias
    const ini = new Date();               // hoje
    const fim = new Date();
    fim.setDate(hoje.getDate() + 30);     // hoje + 30 dias

    setDataIni(ini.toISOString().split("T")[0]);
    setDataFim(fim.toISOString().split("T")[0]);
  }

  if (periodo === "15") {
    // Próximos 15 dias
    const ini = new Date();
    const fim = new Date();
    fim.setDate(hoje.getDate() + 15);

    setDataIni(ini.toISOString().split("T")[0]);
    setDataFim(fim.toISOString().split("T")[0]);
  }

  if (periodo === "semana") {
    // Próximos 7 dias
    const ini = new Date();
    const fim = new Date();
    fim.setDate(hoje.getDate() + 7);

    setDataIni(ini.toISOString().split("T")[0]);
    setDataFim(fim.toISOString().split("T")[0]);
  }

  if (periodo === "hoje") {
    const d = hoje.toISOString().split("T")[0];
    setDataIni(d);
    setDataFim(d);
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
      });

      const resp = await fetch(url);
      const texto = await resp.text();

      let json = [];
      try {
        json = JSON.parse(texto);
      } catch {}

      setLista(json); 

    // calcular total do período
    const soma = json.reduce((acc, item) => acc + Number(item.valor || 0), 0);
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


  

  //------------------------------------------------------------------

  return (
  <div className="p-4">

    <h2 className="text-xl font-bold mb-4">Contas a Receber</h2>

    {/* CONTAINER PRINCIPAL */}
    <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-6 border-[10px] border-blue-800 mb-6">

      {/* GRID COM 2 COLUNAS — AQUI FICA TUDO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ------------------------- */}
        {/* 🟥 COLUNA 1 — FILTROS     */}
        {/* ------------------------- */}
        <div className="bg-white rounded-xl shadow p-5 border w-full">

          {/* PERÍODO + STATUS + DATA + FORNECEDOR + CONTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* DATA INÍCIO */}
            <div>
              <label className="font-bold text-base block mb-1 text-[#1e40af]">Data início</label>
              <input
                type="date"
                value={dataIni}
                onChange={e => setDataIni(e.target.value)}
                className="border font-bold text-base rounded px-2 py-1 w-full border-yellow-500"
              />
            </div>

            {/* DATA FIM */}
            <div>
              <label className="font-bold text-base block mb-1 text-[#1e40af]">Data fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
                className="border font-bold text-base rounded px-2 py-1 w-full border-yellow-500"
              />
            </div>

            {/* STATUS */}
            <div>
              <label className="font-bold text-base block mb-2 text-[#1e40af]">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="border font-bold rounded px-3 py-2 w-full border-yellow-500"
              >
                <option value="aberto">Aberto</option>
                <option value="recebido">Recebido</option>
                <option value="">Todos</option>
              </select>
            </div>

            {/* FORNECEDOR */}
            <div>
              <label className="font-bold text-base block mb-2 text-[#1e40af]">Fornecedor</label>
              <select
                value={fornecedor_id}
                onChange={e => setFornecedorId(Number(e.target.value))}
                className="border font-bold rounded px-3 py-2 w-full border-yellow-500"
              >
                <option value={0}>Todos</option>
                {fornecedores.map(f => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>

            {/* CONTA BANCÁRIA */}
            <div className="col-span-2">
              <label className="font-bold text-base block mb-2 text-[#1e40af]">Conta bancária</label>
              <select
                value={conta_id}
                onChange={async (e) => {
                  const id = Number(e.target.value);
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
                }}
                className="border font-bold rounded px-3 py-2 w-full border-yellow-500"
              >
                <option value={0}>Selecione...</option>
                {contas.map(ct => (
                  <option key={ct.id} value={ct.id}>
                    {ct.nome}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* BOTÕES */}
          <div className="flex justify-left gap-2 mt-4">
            <button onClick={pesquisar} className="bg-blue-600 text-white px-5 py-2 rounded font-semibold">
              Pesquisar
            </button>

            <button onClick={() => navigate("/nova-conta-receber")} className="bg-green-600 text-white px-5 py-2 rounded font-semibold">
              Novo Conta
            </button>

            <button
              onClick={() => navigate("/excluir-parcelamento-receber")}
              className="bg-red-600 text-white px-5 py-2 rounded font-semibold"
            >
              Excluir Parcelamento
            </button>

            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              onClick={receberSelecionadas}
            >
              Receber Selecionadas
            </button>
          </div>

        </div>

        {/* ------------------------- */}
        {/* 🟦 COLUNA 2 — CARD SALDO */}
        {/* ------------------------- */}
        <div className="bg-white rounded-xl shadow p-5 border w-full flex justify-center items-start">

          {!dadosConta && (
            <p className="text-gray-500 font-bold">Selecione uma conta</p>
          )}

          {dadosConta && (
            <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-700 w-[260px]">
              <h3 className="font-bold text-lg text-blue-700 mb-2">🏦 {dadosConta.conta_nome}</h3>

              <p className="text-sm"><strong>Banco:</strong> {dadosConta.nro_banco ?? "-"}</p>
              <p className="text-sm"><strong>Agência:</strong> {dadosConta.agencia ?? "-"}</p>
              <p className="text-sm"><strong>Conta:</strong> {dadosConta.conta ?? "-"}</p>
              <p className="text-sm"><strong>Conjunta:</strong> {dadosConta.conjunta ? "Sim" : "Não"}</p>
              <p className="text-sm"><strong>Jurídica:</strong> {dadosConta.juridica ? "Sim" : "Não"}</p>

              <p className="text-green-700 font-bold text-lg mt-3">
                Saldo final: R$ {Number(dadosConta.saldo_final).toLocaleString("pt-BR")}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>


    {/* TOTAL PERÍODO */}
    <div className="bg-gray-100 rounded-xl shadow p-5 border-l-4 border-red-500 w-64 mb-4">
      <p className="text-base text-gray-600">Total do Período</p>
      <p className="text-2xl font-bold">
        {totalPeriodo.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}
      </p>
    </div>

    {/* LISTA */}
    {loading && <p>Carregando...</p>}

    <div className="bg-gray-300 rounded-xl shadow border border-gray-200 overflow-x-auto">
      <table className="w-full text-base">
        <thead className="bg-blue-300">
          <tr>
            <th className="px-3 py-2 text-center font-bold w-10">Sel.</th>
            <th className="px-3 py-2 text-left font-bold">ID</th>
            <th className="px-3 py-2 text-left font-bold">Descrição</th>
            <th className="px-3 py-2 text-center font-bold">Vencimento</th>
            <th className="px-3 py-2 text-left font-bold">Categoria</th>
            <th className="px-3 py-2 text-left font-bold">Fornecedor</th>
            <th className="px-3 py-2 text-center font-bold">Parcelas</th>
            <th className="px-3 py-2 text-center font-bold">Nº Parcela</th>
            <th className="px-3 py-2 text-center font-bold">Status</th>
            <th className="px-3 py-2 text-right font-bold">Valor</th>
            <th className="px-3 py-2 text-center font-bold">Ações</th>
          </tr>
        </thead>

        <tbody>
          {lista.length === 0 && !loading && (
            <tr>
              <td colSpan={10} className="px-3 py-4 text-center">
                Nenhuma conta encontrada para o filtro selecionado.
              </td>
            </tr>
          )}

          {lista.map((c, i) => (
            <tr key={c.id} className={i % 2 === 0 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6]"}>

              <td className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selecionadas.includes(c.id)}
                  onChange={() => toggleSelecionada(c.id)}
                />
              </td>

              <td className="px-3 py-2">{c.id}</td>
              <td className="px-3 py-2 font-bold">{c.descricao}</td>
              <td className="px-3 py-2 text-center font-bold">
                {c.vencimento ? new Date(c.vencimento).toLocaleDateString("pt-BR") : ""}
              </td>
              <td className="px-3 py-2 font-bold">{c.categoria}</td>
              <td className="px-3 py-2 font-bold">{c.fornecedor}</td>
              <td className="px-3 py-2 text-center font-bold">{c.parcelas}</td>
              <td className="px-3 py-2 text-center font-bold">{c.parcela_num}</td>
              <td className="px-3 py-2 text-center font-bold">{c.status}</td>
              <td className="px-3 py-2 text-right font-bold">
                {Number(c.valor).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </td>

              <td className="px-3 py-2 text-center">
                <button
                  onClick={() => navigate(`/edit-conta-receber/${c.id}`)}
                  className="text-blue-600 mr-3 underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => excluir(c.id)}
                  className="text-red-600 underline"
                >
                  Excluir
                </button>
              </td>

            </tr>
          ))}

        </tbody>
      </table>
    </div>

  </div>
);

}
