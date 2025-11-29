 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";

export default function ContasPagar() {
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

      const url = buildWebhookUrl("consultarcontapagar", {
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
      alert("Erro ao carregar contas a pagar.");
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
      const url = buildWebhookUrl("exclui_conta_pagar"); // <<< trocar pelo webhook real

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
      
      <h2 className="text-xl font-bold mb-4">Contas a Pagar</h2>
      {/* FILTROS */}
<div className="bg-gray-200 rounded-xl shadow p-5 border border-gray-400 mb-4 w-[1850px]">

  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
    

    {/* PERÍODO */}
    <div className="col-span-1">
      <label className="font-semibold text-base block mb-3">Período</label>
      <div className="flex flex-col gap-1 text-base">
         <label className="flex items-center gap-2 text-[15px] font-bold cursor-pointer">
  <input
    type="radio"
    className="w-4 h-4"
    checked={periodo==="hoje"}
    onChange={()=>setPeriodo("hoje")}
  />
  Hoje
</label>

<label className="flex items-center gap-2 text-[15px] font-bold cursor-pointer">
  <input
    type="radio"
    className="w-4 h-4"
    checked={periodo==="semana"}
    onChange={()=>setPeriodo("semana")}
  />
  Próxima Semana
</label>

<label className="flex items-center gap-2 text-[15px] font-bold cursor-pointer">
  <input
    type="radio"
    className="w-4 h-4"
    checked={periodo==="15"}
    onChange={()=>setPeriodo("15")}
  />
  Próximos 15 dias
</label>

<label className="flex items-center gap-2 text-[15px] font-bold cursor-pointer">
  <input
    type="radio"
    className="w-4 h-4"
    checked={periodo==="mes"}
    onChange={()=>setPeriodo("mes")}
  />
  Próximo Mês
</label>

<label className="flex items-center gap-2 text-[15px] font-bold cursor-pointer">
  <input
    type="radio"
    className="w-4 h-4"
    checked={periodo==="bimestre"}
    onChange={()=>setPeriodo("bimestre")}
  />
  Próximo Bimestre
</label>

<label className="flex items-center gap-2 text-[15px] font-bold cursor-pointer">
  <input
    type="radio"
    className="w-4 h-4"
    checked={periodo==="trimestre"}
    onChange={()=>setPeriodo("trimestre")}
  />
  Próximo Trimestre
</label>

<label className="flex items-center gap-2 text-[15px] font-bold cursor-pointer">
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
 

  <div className="bg-gray-380 rounded-xl shadow p-5 border border-gray-200 mb-8 w-[700px]"> 
  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 items-start w-[550px]">



    {/* DATA INI */}
    <div>
      <label className="font-bold text-base block mb-1">Data início</label>
      <input
        type="date"
        value={dataIni}
        onChange={e => setDataIni(e.target.value)}
        className="border font-bold text-base rounded px-2 py-1 w-38 mb-4"
      />
    </div>
  
    {/* DATA FIM */}
    <div>
      <label className="font-bold text-base block mb-1">Data fim</label>
      <input
        type="date"
        value={dataFim}
        onChange={e => setDataFim(e.target.value)}
        className="border font-bold text-base rounded px-2 py-1 w-38 mb-4"
      />
    </div>
    </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start w-[355px]"> 
    {/* STATUS */}
    <div>
      <label className="font-bold text-base block mb-2">Status</label>
      <select
        value={status}
        onChange={e => setStatus(e.target.value)}
        className="border font-bold rounded px-3 py-2 w-42 mb-4"
      >
        <option value="aberto">Aberto</option>
        <option value="pago">Pago</option>
        <option value="">Todos</option>
      </select>
    </div> 

    {/* FORNECEDOR */}
    <div>
      <label className="font-bold text-base block mb-2">Fornecedor</label>
      <select
        value={fornecedor_id}
        onChange={e => setFornecedorId(Number(e.target.value))}
        className="border font-bold rounded px-3 py-2 w-42 mb-4"
      >
        <option value={0}>Todos</option>
        {fornecedores.map(f => (
          <option key={f.id} value={f.id}>{f.nome}</option>
        ))}
      </select>
    </div>
  </div>
 

  {/* BOTÕES */}
  <div className="flex justify-left gap-2 mt-2">
    <button onClick={pesquisar} className="bg-blue-600 text-white px-5 py-2 rounded font-semibold">
      Pesquisar
    </button>
    <button onClick={() => navigate("/nova-conta-pagar")} className="bg-green-600 text-white px-5 py-2 rounded font-semibold">
      Novo
    </button>
  
   <button
  onClick={() => navigate("/excluir-parcelamento-pagar")}
  className="bg-red-600 text-white px-5 py-2 rounded font-semibold"
>
  Excluir Parcelamento
</button>  
 </div>
    </div>
   </div>

</div>
   <div className="bg-gray-100 rounded-xl shadow p-5 border-l-4 border-red-500 w-64 mb-4">
  <p className="text-base text-gray-600">Total do Período</p>
  <p className="text-2xl font-bold">
    {totalPeriodo.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })}
  </p>
</div> 
      {/* LISTA EM TABELA / EXTRATO */}
      {loading && <p>Carregando...</p>}

      <div className="bg-gray-300 rounded-xl shadow border border-gray-200 overflow-x-auto">
        <table className="w-full text-base">
          <thead className="bg-blue-300">
            <tr>
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
              <tr
                key={c.id}
                className={i % 2 === 0 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6]"}
              >
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
                    onClick={() => navigate(`/edit-conta-pagar/${c.id}`)}
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
