import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";

export default function TitulosVencidos() {
   
  const navigate = useNavigate();
  const empresa_id = localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa");

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modo, setModo] = useState("vencidos"); // vencidos | vencer
  const [dias, setDias] = useState(15);

  const [contaId, setContaId] = useState("");
  const [contas, setContas] = useState([]);
  const [dadosConta, setDadosConta] = useState(null);

  const btnPadrao =
    "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";

  /* ------------------ LOAD CONTAS ------------------ */
  useEffect(() => {
    async function carregarContas() {
      const url = buildWebhookUrl("listacontas", { empresa_id });
      const r = await fetch(url);
      const j = await r.json();
      setContas(Array.isArray(j) ? j : []);
    }
    carregarContas();
  }, [empresa_id]);

  /* ------------------ LOAD SALDO CONTA ------------------ */
  async function carregarSaldoConta(id) {
   
    const hoje = hojeLocal();
    const url = buildWebhookUrl("consultasaldo", {
      empresa_id,
      conta_id: id,
      inicio: hoje,
      fim: hoje,
    });

    const r = await fetch(url);
    const j = await r.json();
    setDadosConta(j?.[0] || null);
  }

  useEffect(() => {
    if (contaId) carregarSaldoConta(contaId);
  }, [contaId]);

  /* ------------------ PESQUISAR ------------------ */
  async function pesquisar() {
    setLoading(true);
    try {
      const url = buildWebhookUrl("titulos_vencidos", {
        empresa_id :empresa_id
      });

      const r = await fetch(url);
      const txt = await r.text();
      const j = txt ? JSON.parse(txt) : [];
      setLista(Array.isArray(j) ? j : []);
    } catch (e) {
      alert("Erro ao carregar títulos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    pesquisar();
  }, []);

  /* ------------------ UI ------------------ */
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-[#1e40af]">
        📅 Títulos Vencidos e a Vencer
      </h2>
       
       <div className="mb-2 grid grid-cols-1 lg:grid-cols-1 gap-4"> 
      
  <div className="bg-gray-100 rounded-xl shadow p-4 border-[4px] border-blue-800
                grid grid-cols-1 lg:grid-cols-4 gap-4">

  <div className="flex items-end gap-6">

    {/* PERÍODO */}
    <div>
      <label className="font-bold text-[#1e40af] block mb-1">Período</label>
      <select
        value={modo}
        onChange={e => setModo(e.target.value)}
        className="border rounded px-3 py-2 w-48 border-yellow-500"
      >
        <option value="vencidos">Somente vencidos</option>
        <option value="vencer">Vencidos + a vencer</option>
      </select>
    </div>

    {/* DIAS — SEMPRE VISÍVEL */}
    <div>
      <label className="font-bold text-[#1e40af] block mb-1">Dias</label>
      <select
        value={dias}
        disabled={modo === "vencidos"}
        onChange={e => setDias(e.target.value)}
        className={`border rounded px-3 py-2 w-24 border-yellow-500
          ${modo === "vencidos" ? "bg-gray-200 cursor-not-allowed" : ""}
        `}
      >
        <option value={7}>7</option>
        <option value={15}>15</option>
        <option value={30}>30</option>
      </select>
    </div>

    {/* CONTA */}
    <div>
      <label className="font-bold text-[#1e40af] block mb-1">Conta</label>
      <select
        value={contaId}
        onChange={(e) => setContaId(Number(e.target.value))}
        className="border rounded px-3 py-2 w-52 border-yellow-500"
      >
        <option value={0}>Todas</option>
        {contas.map((c) => (
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))}
      </select>
    </div>

    {/* BOTÃO */}
    <button
      onClick={pesquisar}
      className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
    >
      Atualizar
    </button>

  </div>
</div>

         
      

        {/* CARD CONTA */}
            <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-900 h-fit">

        {dadosConta && (
          <>
            <h3 className="font-bold text-lg text-blue-700 mb-2">
              🏦 {dadosConta.conta_nome}
            </h3>

            <p><strong>Banco:</strong> {dadosConta.nro_banco ?? "-"}</p>
            <p><strong>Agência:</strong> {dadosConta.agencia ?? "-"}</p>
            <p><strong>Conta:</strong> {dadosConta.conta ?? "-"}</p>
            <p><strong>Conjunta:</strong> {dadosConta.conjunta ? "Sim" : "Não"}</p>
            <p><strong>Jurídica:</strong> {dadosConta.juridica ? "Sim" : "Não"}</p>

            <p className="text-green-700 font-bold text-lg mt-3">
              Saldo final: R$
              {Number(dadosConta.saldo_final).toLocaleString("pt-BR")}
            </p>
          </>
        )}

     
 
         
</div>

      {/* GRID PRINCIPAL */}
   

        {/* TABELA */}
        <div className="lg:col-span-3 bg-gray-200 rounded-xl p-4 shadow border-[4px] border-gray-500">
          <table className="w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-2 py-2">⚠</th>
                <th className="px-2 py-2 text-left">Tipo</th>
                <th className="px-2 py-2">Venc.</th>
                <th className="px-2 py-2">Dias</th>
                <th className="px-2 py-2 text-left">Descrição</th>
                <th className="px-2 py-2 text-left">Parceiro</th>
                <th className="px-2 py-2 text-right">Valor</th>
                <th className="px-2 py-2 text-center">Ação</th>
              </tr>
            </thead>

            <tbody>
              {lista.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-6">
                    Nenhum título encontrado
                  </td>
                </tr>
              )}

              {lista.map((l, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6]"}
                >
                  <td className="text-center text-red-600 font-bold">
                    {l.critico ? "⚠" : ""}
                  </td>
                  <td className="font-bold">{l.origem}</td>
                 <td>{new Date(l.vencimento).toLocaleDateString("pt-BR")}</td>
                   <td className={l.dias_atraso > 0 ? "text-red-600 font-bold" : ""}>
                    {l.dias_atraso}
                    </td>
                  <td className="font-bold">{l.descricao}</td>
                  <td>{l.parceiro || "-"}</td>
                  <td className="text-right font-bold">
                    {Number(l.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="text-center">
                    <button className="text-blue-700 underline font-bold">
                      {l.origem === "RECEBER" ? "Receber" : "Pagar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

       

        </div>
    </div>
  );
}
