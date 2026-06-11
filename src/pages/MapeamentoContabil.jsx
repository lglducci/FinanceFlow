 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import FormContaContabilModal from "../components/forms/FormContaContabilModal"; 
import ModalBase from "../components/ModalBase";

export default function MapeamentoContabil() {
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa") ;

  const [lista, setLista] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [linhas, setLinhas] = useState([]);

const [filtro, setFiltro] = useState("");
  const [modalContaContabil, setModalContaContabil] = useState(false);
 
 // const contaGerencialId = state?.conta_gerencial_id;

  async function carregarModelos() {
    try {
      const url = buildWebhookUrl("modelos", {  empresa_id, tipo_evento:""  });
      const r = await fetch(url);
      const j = await r.json();
      setLista(j);
    } catch (e) {
      console.log("Erro ao carregar modelos:", e);
    }
  }

 async function visualizar(id_modelo) {
  try {
    const url = buildWebhookUrl("modelos_linhas", {
      empresa_id,
      modelo_id: id_modelo,
    });

    const r = await fetch(url);
    const dados = await r.json();

    // garante que vai encontrar mesmo se id for string/number
    const modeloInfo = lista.find(
      (m) => String(m.id) === String(id_modelo)
    );

    setSelecionado({
      codigo: modeloInfo?.codigo || "",
      nome: modeloInfo?.nome || "",
      class: modeloInfo?.classificacao || "",
    });

    setLinhas(dados);

  } catch (e) {
    console.log("Erro ao carregar linhas:", e);
  }
}



 async function Excluir(modelo_id) {
  
  if (!window.confirm("Tem certeza que deseja excluir este modelo?")) {
    return;
  }

  try {
    const url = buildWebhookUrl("excluirmodelo", {
      empresa_id:empresa_id,
      modelo_id,
    });

    const resp = await fetch(url, { method: "POST" });

    const texto = await resp.text();
    let json = null;

    try {
      json = JSON.parse(texto);
    } catch (e) {
      console.log("JSON inválido:", texto);
      alert("Erro inesperado no servidor.");
      return;
    }

    // quando webhook retorna array
    const item = Array.isArray(json) ? json[0] : json;

    // erro controlado pelo backend
    if (item?.ok === false) {
      alert(item.message || "Erro ao excluir.");
      return;
    }

    alert("Modelo excluído com sucesso!");

    // recarrega a lista
    carregarModelos();

  } catch (e) {
    console.log("ERRO REQUEST:", e);
    alert("Erro de comunicação com o servidor.");
  }
}



 


 function editar(m) {
  const empresa_id = localStorage.getItem("empresa_id") || "1";

  navigate("/edita-mapeamento", {
    state: {
      modelo_id: m.id,
      empresa_id: empresa_id ,
      token: m.codigo,   // <<< VOLTOU O QUE VOCÊ FALOU
      nome: m.nome,     
    }
  });
}




  useEffect(() => {
    carregarModelos();
  }, []);



  const filtrados = lista.filter((m) =>
  m.codigo?.toLowerCase().includes(filtro.toLowerCase()) ||
  m.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
  m.classificacao?.toLowerCase().includes(filtro.toLowerCase()) ||
  m.tipo_evento?.toLowerCase().includes(filtro.toLowerCase())
);

 return (
  <div className="min-h-screen bg-slate-100 px-4 py-6"> 
  <div className="w-full max-w-[1500px] mx-auto space-y-5">

      {/* CABEÇALHO */}
      <div className="bg-white rounded-[22px] shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-[#08233d]">
              Modelos Contábeis
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Gerencie os modelos prontos de lançamentos contábeis.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/novo-modelo")}
              className="h-10 px-5 rounded-lg bg-[#082f4f] text-white text-sm font-black shadow-md"
            >
              + Novo Modelo
            </button>

            <button
              type="button"
              onClick={() => setModalContaContabil(true)}
              className="h-10 px-5 rounded-lg border border-sky-200 bg-sky-50 text-[#08233d] text-sm font-black"
            >
              + Adicionar Conta
            </button>
          </div>
        </div>

        {/* FILTRO */}
        <div className="px-6 py-4 bg-white">
          <label className="block text-xs font-black text-slate-600 mb-1">
            Buscar modelo
          </label>
          <input
            type="text"
            placeholder="Token, descrição, classificação ou evento..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
      </div>

      {/* DETALHE DO MODELO */}
      {selecionado && linhas.length > 0 && (
        <div className="bg-white rounded-[22px] shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-black text-[#08233d]">
              Estrutura do Modelo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
                <p className="text-xs font-black text-slate-500">Token</p>
                <p className="text-sm font-black text-[#08233d]">
                  {selecionado.codigo}
                </p>
              </div>

              <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
                <p className="text-xs font-black text-slate-500">Modelo</p>
                <p className="text-sm font-black text-[#08233d]">
                  {selecionado.nome}
                </p>
              </div>

              <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
                <p className="text-xs font-black text-slate-500">
                  Classificação
                </p>
                <p className="text-sm font-black text-[#08233d]">
                  {selecionado.class || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-[#082f4f] text-white">
                <tr>
                  <th className="px-3 py-2 text-left">Conta</th>
                  <th className="px-3 py-2 text-left">Código</th>
                  <th className="px-3 py-2 text-left">Nome</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Natureza</th>
                  <th className="px-3 py-2 text-center">D/C</th>
                </tr>
              </thead>

              <tbody>
                {linhas.map((l, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                  >
                    <td className="px-3 py-2 font-bold text-slate-700">
                      {l.conta_id}
                    </td>
                    <td className="px-3 py-2 font-bold text-slate-700">
                      {l.codigo}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-600">
                      {l.nome}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-600">
                      {l.tipo}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-600">
                      {l.natureza}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="inline-flex items-center justify-center min-w-8 h-7 rounded-full bg-sky-50 border border-sky-200 text-[#08233d] font-black">
                        {l.dc}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LISTA DE MODELOS */}
      <div className="bg-white rounded-[32px] shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-[#08233d]">
              Lista de modelos
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {filtrados.length} modelo(s) encontrado(s)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-state-200 text-black">
              <tr>
                <th className="px-3 py-3 text-left">ID</th>
                <th className="px-3 py-3 text-left">Token</th>
                <th className="px-3 py-3 text-left">Descrição</th>
                <th className="px-3 py-3 text-left">Classificação</th>
                <th className="px-3 py-3 text-left">Evento</th>
                <th className="px-3 py-3 text-center">Origem</th>
                <th className="px-3 py-3 text-left">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((m, i) => (
                <tr
                  key={m.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="px-3 py-3 font-black text-slate-700">
                    {m.id}
                  </td>

                  <td className="px-3 py-3">
                    <span className="inline-flex rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-black text-[#08233d]">
                      {m.codigo}
                    </span>
                  </td>

                  <td className="px-3 py-3 font-semibold text-slate-700">
                    {m.nome}
                  </td>

                  <td className="px-3 py-3 font-semibold text-slate-600">
                    {m.classificacao || "-"}
                  </td>

                  <td className="px-3 py-3 font-semibold text-slate-600">
                    {m.tipo_evento || "-"}
                  </td>

                  <td className="px-3 py-3 text-center">
                    {m.sistema ? (
                      <span className="inline-flex rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-black text-red-700">
                        Sistema
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-black text-blue-700">
                        Usuário
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => visualizar(m.id)}
                        className="h-8 px-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-black"
                      >
                        Visualizar
                      </button>

                      {!m.sistema && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              navigate("/editar-mapeamento", {
                                state: {
                                  modelo_id: m.id,
                                  empresa_id,
                                  token: m.codigo,
                                  nome: m.nome,
                                  tipo: m.tipo_automacao,
                                },
                              })
                            }
                            className="h-8 px-3 rounded-lg border border-sky-200 bg-sky-50 text-[#08233d] text-xs font-black"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => Excluir(m.id)}
                            className="h-8 px-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-black"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filtrados.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm font-bold text-slate-400"
                  >
                    Nenhum modelo encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalBase
        open={modalContaContabil}
        onClose={() => setModalContaContabil(false)}
        title="Nova Conta Contábil"
      >
        <FormContaContabilModal
          empresa_id={empresa_id}
          onSuccess={() => {
            setModalContaContabil(false);
          }}
          onCancel={() => setModalContaContabil(false)}
        />
      </ModalBase>
    </div>
  </div>
);

   
}
