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

  const [periodo, setPeriodo] = useState("hoje");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loading, setLoading] = useState(false);
 const [totalPeriodo, setTotalPeriodo] = useState(0);
 const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
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
    <div>
      <h2 className="text-xl font-bold mb-4">Contas a Receber</h2>
      {/* FILTROS */}
<div className="bg-white rounded-xl shadow p-5 border border-[#3862b7] mb-6">

  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

    {/* PERÍODO */}
    <div className="col-span-1">
      <label className="font-semibold text-base block mb-1">Período</label>
      <div className="flex flex-col gap-1 text-sm">
         <label className="flex items-center gap-2 text-[15px] font-semibold cursor-pointer">
  <input
    type="radio"
    className="w-4 h-4"
    checked={periodo==="hoje"}
    onChange={()=>setPeriodo("hoje")}
  />
  Hoje
</label>

<label className="flex items-center gap-2 text-[15px] font-semibold cursor-pointer">
  <input
    type="radio"
    className="w-4 h-4"
    checked={periodo==="semana"}
    onChange={()=>setPeriodo("semana")}
  />
  Próxima Semana
</label>

<label className="flex items-center gap-2 text-[15px] font-semibold cursor-pointer">
  <input
    type="radio"
    className="w-4 h-4"
    checked={periodo==="15"}
    onChange={()=>setPeriodo("15")}
  />
  Próximos 15 dias
</label>

<label className="flex items-center gap-2 text-[15px] font-semibold cursor-pointer">
  <input
    type="radio"
    className="w-4 h-4"
    checked={periodo==="mes"}
    onChange={()=>setPeriodo("mes")}
  />
  Próximo Mês
</label>

<label className="flex items-center gap-2 text-[15px] font-semibold cursor-pointer">
  <input
    type="radio"
    className="w-4 h-4"
    checked={periodo==="bimestre"}
    onChange={()=>setPeriodo("bimestre")}
  />
  Próximo Bimestre
</label>

<label className="flex items-center gap-2 text-[15px] font-semibold cursor-pointer">
  <input
    type="radio"
    className="w-4 h-4"
    checked={periodo==="trimestre"}
    onChange={()=>setPeriodo("trimestre")}
  />
  Próximo Trimestre
</label>

<label className="flex items-center gap-2 text-[15px] font-semibold cursor-pointer">
  <input
    type="radio"
    className="w-4 h-4"
    checked={periodo==="semestre"}
    onChange={()=>setPeriodo("semestre")}
  />
  Próximo Semestre
</label>

      </div>
    </div>

    {/* DATA INI */}
    <div>
      <label className="font-semibold text-sm block mb-1">Data início</label>
      <input
        type="date"
        value={dataIni}
        onChange={e => setDataIni(e.target.value)}
        className="border rounded px-3 py-2 w-full"
      />
    </div>

    {/* DATA FIM */}
    <div>
      <label className="font-semibold text-sm block mb-1">Data fim</label>
      <input
        type="date"
        value={dataFim}
        onChange={e => setDataFim(e.target.value)}
        className="border rounded px-3 py-2 w-full"
      />
    </div>

    {/* STATUS */}
    <div>
      <label className="font-semibold text-sm block mb-1">Status</label>
      <select
        value={status}
        onChange={e => setStatus(e.target.value)}
        className="border rounded px-3 py-2 w-full"
      >
        <option value="aberto">Aberto</option>
        <option value="pago">Pago</option>
        <option value="">Todos</option>
      </select>
    </div>

    {/* FORNECEDOR */}
    <div>
      <label className="font-semibold text-sm block mb-1">Fornecedor</label>
      <select
        value={fornecedor_id}
        onChange={e => setFornecedorId(Number(e.target.value))}
        className="border rounded px-3 py-2 w-full"
      >
        <option value={0}>Todos</option>
        {fornecedores.map(f => (
          <option key={f.id} value={f.id}>{f.nome}</option>
        ))}
      </select>
    </div>

  </div>

  {/* BOTÕES */}
  <div className="flex justify-end gap-4 mt-6">
    <button onClick={pesquisar} className="bg-blue-600 text-white px-5 py-2 rounded font-semibold">
      Pesquisar
    </button>
    <button onClick={() => navigate("/nova-conta-receber")} className="bg-green-600 text-white px-5 py-2 rounded font-semibold">
      Novo
    </button>
  
   <button
  onClick={() => navigate("/excluir-parcelamento-receber")}
  className="bg-red-600 text-white px-5 py-2 rounded font-semibold"
>
  Excluir Parcelamento
</button>

   

 </div>
  

</div>
   <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-500 w-64 mb-4">
  <p className="text-sm text-gray-600">Total do Período</p>
  <p className="text-2xl font-bold">
    {totalPeriodo.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })}
  </p>
</div>


      {/* LISTA EM TABELA / EXTRATO */}
      {loading && <p>Carregando...</p>}

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-200">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Descrição</th> 
              <th className="px-3 py-2 text-center">Vencimento</th>
              <th className="px-3 py-2 text-left">Categoria</th>
              <th className="px-3 py-2 text-left">Fornecedor</th> 
              <th className="px-3 py-2 text-center">Parcelas</th>
              <th className="px-3 py-2 text-center">Nº Parcela</th>
              <th className="px-3 py-2 text-center">Status</th>
              <th className="px-3 py-2 text-right">Valor</th>
              <th className="px-3 py-2 text-center">Ações</th>
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
              <tr
                key={c.id}
                className={i % 2 === 0 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6]"}
              >
                <td className="px-3 py-2">{c.id}</td>
                <td className="px-3 py-2">{c.descricao}</td> 

                <td className="px-3 py-2 text-center">
                {c.vencimento ? new Date(c.vencimento).toLocaleDateString("pt-BR") : ""}
              </td>

                <td className="px-3 py-2">{c.categoria}</td>
                <td className="px-3 py-2">{c.fornecedor}</td> 
                <td className="px-3 py-2 text-center">{c.parcelas}</td>
                <td className="px-3 py-2 text-center">{c.parcela_num}</td>
                <td className="px-3 py-2 text-center">{c.status}</td>
                <td className="px-3 py-2 text-right">
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
