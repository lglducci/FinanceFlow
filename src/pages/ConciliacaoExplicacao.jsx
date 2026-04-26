import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const mensagens = [
  "Importamos o extrato bancário com segurança.",
  "Agora o sistema vai analisar cada linha do extrato.",
  "Linhas confiáveis serão marcadas como OK.",
  "Linhas com dúvida ficarão disponíveis para correção manual.",
  "Nenhuma baixa será feita sem passar pelas funções oficiais do sistema.",
  "Agora você pode abrir a revisão da conciliação."
];

export default function ConciliacaoExplicacao() {
  const navigate = useNavigate();
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (indice >= mensagens.length - 1) return;

    const timer = setTimeout(() => {
      setIndice((i) => i + 1);
    }, 2500);

    return () => clearTimeout(timer);
  }, [indice]);

  const terminou = indice === mensagens.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full rounded-3xl bg-white/90 border border-slate-200 shadow-xl p-10 text-center">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
          🔎
        </div>

        <h1 className="text-3xl font-black text-slate-800 mb-8">
          Revisão da Conciliação Bancária
        </h1>

        <div className="min-h-[120px] flex items-center justify-center">
          <p className="text-2xl font-bold text-blue-800 animate-pulse">
            {mensagens[indice]}
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {mensagens.map((_, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full ${
                i <= indice ? "bg-blue-600" : "bg-slate-300"
              }`}
            />
          ))}
        </div>

        {terminou && (
          <div className="mt-10 flex justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
            >
              Voltar
            </button>

            <button
              onClick={() => navigate("/conciliacao-revisao")}
              className="
                px-8 py-3 rounded-full
                font-black text-white
                bg-gradient-to-r from-blue-600 to-indigo-700
                shadow-lg hover:brightness-110 hover:scale-105
                transition
              "
            >
              Abrir revisão
            </button>
          </div>
        )}
      </div>
    </div>
  );
}