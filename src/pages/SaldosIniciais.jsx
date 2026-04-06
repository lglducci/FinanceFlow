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
    <div className="p-6">

        <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-blue-800 mb-2"> 
      <h1 className="text-2xl font-bold mb-6">📒 Implantação de Saldos Iniciais</h1>

      <div className="bg-white rounded-xl p-4 shadow mb-6 flex gap-4 items-end">
        

       <div>
      <label className="block font-bold text-[#1e40af]">Conta (opcional)</label>
      <input
        type="text"
        placeholder="Código ou nome"
        value={contaId}
        onChange={(e) => setContaId(e.target.value)}
        className="border rounded-lg px-3 py-2 border-yellow-500 w-64"
      />
    </div>

        <button
          onClick={consultar}
      
 
           className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-white
                        bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-'95'
                        transition-all duration-200
                        inline-flex items-center gap-2
                      ">
          Filtrar
        </button>
      
      
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!mostrarZeradas}
            onChange={() => setMostrarZeradas(!mostrarZeradas)}
          />
          Ocultar contas sem movimento
        </label>


        <button
          onClick={() => window.print()}
           className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-white
                        bg-gradient-to-b from-gray-500 via-gray-600 to-gray-800
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-'95'
                        transition-all duration-200
                        inline-flex items-center gap-2
                      ">
          🖨️ Imprimir
        </button> 


          <button
          onClick={() =>   navigate(-1) }
          className="
                        px-5 py-2 rounded-full
                        font-bold text-sm tracking-wide
                        text-white
                        bg-gradient-to-b from-gray-200 via-gray-400 to-gray-600
                        border-2 border-black
                        shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                        hover:brightness-110 hover:scale-105
                        active:scale-'95'
                        transition-all duration-200
                        inline-flex items-center gap-2
                      ">
          Voltar 
          </button>
         </div>
      </div>

       <div id="print-area"> 
       
        <div className="max-w-full mx-auto bg-gray-100 rounded-xl shadow-lg p-5 border-[4px] border-gray-400 mb-2"> 

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-900 text-white">
            <tr style={{ background: "#002b80", color: "white", height: 40 }}>
                 <th className="p-3 text-left">id</th>
              <th className="p-3 text-left">Código</th>
              <th className="p-3 text-left">Nome</th>
                 <th className="p-3 text-left">TIpo</th>
                  <th className="p-3 text-right">Saldo Inicial</th>
                  <th className="p-3 text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
           {/*} {dados.map((l, idx) => (*/}

               { dados.filter((l) => mostrarZeradas || !linhaZerada(l)).map((l, idx) => (
              <tr key={idx}   className={idx % 2 === 0 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6]"}>
               
                <td className="p-2 font-bold font-size: 16px">{l.id}</td>
                  <td className="p-2 font-bold font-size: 16px">{l.codigo}</td>
                    <td className="p-2 font-bold font-size: 16px">{l.nome}</td>
                      <td className="p-2 font-bold font-size: 16px">{l.tipo}</td>
               
                 
                <td
                  className={`p-3 text-right font-bold font-size: 16px ${
                    l.saldo < 0 ? "text-red-600" : "text-green-700"
                  }`}
                >
                  {fmt.format(l.saldo)}
                </td>
                <td className="p-2 text-center">
                    <button
                      onClick={() => {
                        setForm({
                          id: l.id,
                          codigo: l.codigo,
                          nome: l.nome,
                          tipo: l.tipo,
                          saldo: Number(l.saldo || 0)
                        });

                        setModalAberto(true);
                      }}
                      className="text-blue-600 underline font-bold"
                    >
                      {Number(l.saldo || 0) > 0 ? "Alterar" : "Incluir"}
                    </button>
                  </td>
              </tr>
            ))}

            {!loading && dados.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  Nenhum dado para o período selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {loading && (
          <div className="p-6 text-center text-blue-600 font-bold">
            Carregando...
          </div>
        )}
      </div>
    </div>
    </div>

    <FormSaldoInicial
  aberto={modalAberto}
  form={form}
  setForm={setForm}
  onClose={() => {
    setModalAberto(false);
    setForm(null);
  }}
  onSalvar={salvarSaldo}
/>
     </div>
  );
}
