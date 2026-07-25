 import { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function ContadorVisitas() {
  const [totalVisitas, setTotalVisitas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const executouRef = useRef(false);

  useEffect(() => {
    if (executouRef.current) return;

    executouRef.current = true;

    async function carregarContador() {
      try {
        const dataHoje = new Intl.DateTimeFormat("sv-SE", {
          timeZone: "America/Sao_Paulo",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());

        const chaveVisita = `financeflow_visita_landing_${dataHoje}`;

        const visitaRegistradaHoje =
          localStorage.getItem(chaveVisita) === "1";

        const nomeFuncao = visitaRegistradaHoje
          ? "obter_total_visitas_landing"
          : "registrar_visita_landing";

        console.log("Chamando função:", nomeFuncao);

        const { data, error } = await supabase.rpc(nomeFuncao);

        console.log("Retorno contador:", { data, error });

        if (error) {
          console.error("Erro no contador:", error);
          setTotalVisitas(0);
          return;
        }

        if (!visitaRegistradaHoje) {
          localStorage.setItem(chaveVisita, "1");
        }

        setTotalVisitas(Number(data || 0));
      } catch (erro) {
        console.error("Erro inesperado no contador:", erro);
        setTotalVisitas(0);
      } finally {
        setCarregando(false);
      }
    }

    carregarContador();
  }, []);

  return (
    <section className="border-t border-slate-200 bg-white py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <svg
            className="h-5 w-5 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>

          <span>
            <strong className="font-bold text-slate-800">
              {carregando
                ? "Carregando..."
                : totalVisitas.toLocaleString("pt-BR")}
            </strong>{" "}
            visitas ao FinanceFlow
          </span>
        </div>
      </div>
    </section>
  );
}