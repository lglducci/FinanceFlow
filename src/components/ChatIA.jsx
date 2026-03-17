import { useState,useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ChatIA({ empresaId }) {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
 

  const location = useLocation();
const telaAtual = location.pathname;

  
  async function enviar() {
    if (!input.trim()) return;

    const pergunta = input;

    setMensagens(prev => [...prev, { tipo: "user", texto: pergunta }]);
    setInput("");
    setLoading(true);

    try {
      const r = await fetch("SEU_WEBHOOK_N8N_AQUI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          empresa_id: empresaId,
          pergunta,
          tela: telaAtual
        })
      });

      const json = await r.json();

      setMensagens(prev => [
        ...prev,
        { tipo: "ia", texto: json.resposta || "Erro ao consultar IA" }
      ]);
    } catch {
      setMensagens(prev => [
        ...prev,
        { tipo: "ia", texto: "Erro na comunicação com IA" }
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  function handleEsc(e) {
    if (e.key === "Escape") {
      setAberto(false);
    }
  }

  window.addEventListener("keydown", handleEsc);
  return () => window.removeEventListener("keydown", handleEsc);
}, []);

function getMensagemInicial(tela) {
 
  switch (tela) {
 
    case "/apuracaoresultado":
            return "💰 Posso te ajudar com apuração de resultado.";


    case "/dashboardcontabil":
            return "💰 Posso te ajudar com dashboard contábil.";


     case "/reports":
          return "💰 Posso te ajudar a registrar um lançamento contábil.";


     case "/lancamentocontabilrapido":
          return "💰 Posso te ajudar a registrar um lançamento contábil.";


     case "/livro-caixa":

      return "💰 Posso te ajudar com Livro caixa.";

    case "/processar-diario":
          return "💰 Posso te ajudar Processamento Diário.";

     case "/cartao-transacoes":
       return "💰 Posso te ajudar com transações em Cartão.";

     case "/faturas-cartao":
            return "💰 Posso te ajudar Faturas.";

    case "/new-transaction":
            return "💰 Posso te ajudar a Cadastar um Lançamento Financeiro.";
    case "/mapeamento-contabil":
         return "💰 Posso te ajudar Mapeamento Contábil (token).";

    case "/transactions":
        return "💰 Posso te ajudar com lançamentos.";

    case "/contas-pagar":
      return "💰 Posso te ajudar com contas a pagar.";

    case "/contas-receber":
      return "📥 Posso te ajudar com contas a receber.";

    case "/compras-cartao":
      return "💳 Posso te ajudar com cartões";

    case "/relatorios/diario":
      return "📘 Posso te ajudar com lançamentos contábeis.";

    default:
      return "👋 Posso te ajudar com financeiro, contábil ou cartões.";
  }
}

useEffect(() => {
  setMensagens([
    { tipo: "ia", texto: getMensagemInicial(telaAtual) }
  ]);
}, [telaAtual]);


function enviarRapido(texto) {
  setInput(texto);
  setTimeout(() => enviar(), 100);
}



  return (
    <>
      {/* BOTÃO FLUTUANTE */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setAberto(!aberto)}
            className="btn-pill btn-dark-blue"
        >
          💬
        </button>
      </div>

      {/* POPUP */}
      {aberto && (
        <div className="fixed bottom-24 right-6 w-96 h-[520px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border">

         <div className="p-3 border-b font-semibold   bg-[#061f4a]  text-white rounded-t-xl flex justify-between items-center">
                <span>Consultor FinanceFlow IA</span>

                <button
                    onClick={() => setAberto(false)}
                    className="btn-pill btn-dark-blue"
                >
                    ✕
                </button>
                </div>
          {/* MENSAGENS */}
         <div className="flex-1 overflow-auto p-3 space-y-2">

                {/* 👇 BOTÕES INICIAIS */}
                {mensagens.length === 1 && (
                    <div className="flex flex-wrap gap-2 mb-2">

                    <button onClick={() => enviarRapido("como lançar Contas a Pagar")} className="btn-pill btn-gray">
                        💰 Contas a pagar
                    </button>

                    <button onClick={() => enviarRapido("como registrar recebimento")} className="btn-pill btn-gray">
                        📥 Contas a receber
                    </button>

                    <button onClick={() => enviarRapido("compra no cartão")} className="btn-pill btn-gray">
                        💳 Cartões
                    </button>

                    <button onClick={() => enviarRapido("como lançar despesa")} className="btn-pill btn-gray">
                        📘 Contábil
                    </button>

                    <button onClick={() => enviarRapido("como lançar despesa")} className="btn-pill btn-gray">
                        📘 Lançamento Financeiro
                    </button>


                    </div>
                )}

                {/* 👇 MENSAGENS */}
                {mensagens.map((m, i) => (
                    <div
                    key={i}
                    className={`p-2 rounded-lg max-w-[80%] ${
                        m.tipo === "user"
                        ? "bg-blue-100 self-end ml-auto"
                        : "bg-gray-100"
                    }`}
                    >
                    {m.texto}
                    </div>
                ))}
                </div>

          {/* INPUT */}
          <div className="p-2 border-t flex gap-2">
            <input
              className="flex-1 border rounded p-2 text-sm"
              placeholder="Digite sua dúvida..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
            />
            <button
              onClick={enviar}
              disabled={loading}
             // className="bg-blue-600 text-white px-3 rounded"
              className="btn-pill btn-dark-blue"
            >
              {loading ? "..." : "Enviar"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}