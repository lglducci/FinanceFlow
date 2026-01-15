 
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";


export default function CriarModeloMeuNegocio() {
  const navigate = useNavigate();

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [categoria, setCategoria] = useState("");
  const [codigoModelo, setCodigoModelo] = useState("");
  const [codigoConta, setCodigoConta] = useState("");
  const [nomeConta, setNomeConta] = useState("");
  const [contaDebitoId, setContaDebitoId] = useState("");
   const [contas, setContas] = useState([]);

  /* 🎨 Tema azul coerente com Login/KDS (fora escuro, dentro mais claro) */
const THEME = {
  pageBg: "#0e2a3a",                 // fundo da página (escuro)
  panelBg: "#1e40af",                // fundos auxiliares (se precisar) panelBg: "#4a88a9ff",   
  panelBorder: "rgba(255,159,67,0.30)",

  cardBg: "#254759",                 // bloco interno mais claro
  cardBorder: "rgba(255,159,67,0.35)",
  cardShadow: "0 6px 20px rgba(0,0,0,0.25)",

  title: "#ff9f43",
  text: "#e8eef2",
  textMuted: "#bac7cf",

  fieldBg: "#1f3b4d",                // inputs (um tom acima do card)
  fieldBorder: "rgba(255,159,67,0.25)",
  focusRing: "#ff9f43",

  btnPrimary: "#ff9f43",
  btnPrimaryText: "#1b1e25",
  btnSecondary: "#ef4444",
  btnSecondaryText: "#ffffff",
};


  useEffect(() => {
    async function carregarContas() {
      const url = buildWebhookUrl("contabanco", { empresa_id });
      const r = await fetch(url);
      const j = await r.json();
      setContas(Array.isArray(j) ? j : []);
    }
    carregarContas();
  }, [empresa_id]);


async function Salvar() {
  if (!categoria || !codigoModelo || !contaDebitoId) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  try {
    const resp = await fetch(buildWebhookUrl("criamodelonegocio"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        categoria_nome: categoria,
        token_modelo: codigoModelo,
        conta_debito_id: contaDebitoId
      })
    });

    // 🔴 SEMPRE LER COMO TEXTO
    const texto = await resp.text();

    // ⛔ ERRO HTTP
    if (!resp.ok) {
      let mensagem = "Erro ao salvar.";

      // tenta JSON
      try {
        const json = JSON.parse(texto);

        // casos comuns
        mensagem =
          json?.message ||
          json?.erro ||
          json?.error ||
          (Array.isArray(json) && json[0]?.message) ||
          JSON.stringify(json);
      } catch {
        // se não for JSON, usa texto cru
        mensagem = texto || mensagem;
      }

      alert(mensagem);
      return;
    }

    // ✅ SUCESSO
    alert("Modelo criado com sucesso!");
    navigate(-1);

  } catch (e) {
    console.error("Erro de rede:", e);
    alert("Erro de comunicação com o servidor.");
  }
}



  


  return (
  

        <div className="min-h-screen py-4 px-4 bg-bgSoft">
        <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#061f4aff]   mt-1 mb-1" >  


                    <div className="flex items-center gap-2 mb-3">
                        <h1
                        className="text-2xl md:text-3xl font-bold mb-6 text-center"
                        style={{ color: THEME.title }}
                >
                    ✏️ Novo Modelo – Meu Negócio
                </h1>

 

                    {/* HELP */}
                    <span className="relative group cursor-pointer">
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                        ?
                        </span>

                        <div className="absolute left-6 top-0 z-50 hidden group-hover:block
                                        bg-gray-900 text-white text-xs rounded-lg p-4 w-96 shadow-lg">
                        <strong>O que esta tela faz?</strong>
                        <p className="mt-2">
                            Esta tela cria automaticamente:
                        </p>
                        <ul className="list-disc ml-4 mt-2 space-y-1">
                            <li>Uma categoria gerencial de receita</li>
                            <li>Uma conta contábil de receita</li>
                            <li>Um modelo contábil automático</li>
                        </ul>

                         <p className="mt-2">
                            Toda venda registrada nesta categoria ficará preparada para
                            lançamento contábil quando o processamento contábil for executado.
                            </p>


                        <p className="mt-2 text-yellow-300">
                            ⚠ Você não precisa criar lançamentos manualmente.
                        </p>
                        </div>
                    </span>
                    </div>


      <div className="bg-white p-5 rounded-xl shadow flex flex-col gap-4"> 

        {/* CATEGORIA */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-blue-900 mb-1">
            Nome da Categoria *
          </label>
          <input
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
              className="input-premium w-64"
            placeholder="Ex: Venda de Produtos ou CMV de Venda de produto tal"
          />
        </div>

        {/* TOKEN */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-blue-900 mb-1">
            Token do Modelo *
          </label>
          <input
            value={codigoModelo}
            onChange={e => setCodigoModelo(e.target.value)}
               className="input-premium w-64"
            placeholder="Ex: CMV_BEBIDAS"
          />
        </div>

        {/*   
        <div className="grid grid-cols-2 gap-6 mb-5">
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1">
              Código da Conta *
            </label>
            <input
              value={codigoConta}
              onChange={e => setCodigoConta(e.target.value)}
               className="input-premium w-64"
              placeholder="Ex: 5.1.10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1">
              Nome da Conta *
            </label>
            <input
              value={nomeConta}
              onChange={e => setNomeConta(e.target.value)}
                 className="input-premium w-64"
              placeholder="Ex: Receita de Vendas"
            />
          </div>
        </div>*/}
 
       {/* CONTA DÉBITO (CAIXA / BANCO / CLIENTES) */}
            <div className="mb-8">
            <label className="block text-sm font-semibold text-blue-900 mb-1">
                Conta Débito (Caixa / Banco / Clientes) *
            </label>

            <select
                value={contaDebitoId}
                onChange={(e) => setContaDebitoId(e.target.value)}
                className="input-premium w-96"
            >
                <option value="">Selecione a conta</option>

                {contas.map((c) => (
                <option key={c.id} value={c.id}>
                    {c.codigo} - {c.nome}
                </option>
                ))}
            </select>
            </div>



        {/* BOTÕES */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={Salvar}
            className="flex-1 h-12 bg-[#061f4aff] text-white font-bold rounded-lg"
          >
            Salvar
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex-1 h-12 bg-gray-500 text-white font-semibold rounded-lg"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  </div>
);


}
