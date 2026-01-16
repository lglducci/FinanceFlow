export default function CardDRE({ dre }) {
  if (!Array.isArray(dre) || dre.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow border">
        <h2 className="text-xl font-bold text-[#061f4aff]">
          Demonstração do Resultado
        </h2>
        <p className="text-gray-500 mt-4">Sem dados para o período.</p>
      </div>
    );
  }

  // ordena pelo campo ordem
  const dados = [...dre].sort(
    (a, b) => Number(a.ordem) - Number(b.ordem)
  );

  const formatar = (v) =>
    Number(v).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="bg-white rounded-xl p-6 shadow border">
      <h2 className="text-xl font-bold text-[#061f4aff] mb-4">
        📊 Demonstração do Resultado (DRE)
      </h2>

      <div className="space-y-2">
        {dados.map((l) => {
          const valor = Number(l.valor_periodo);
          const isResultado = l.grupo.includes("RESULTADO");

          return (
            <div
              key={l.grupo}
              className={`flex justify-between items-center px-2 py-1 rounded
                ${isResultado ? "font-bold" : ""}
              `}
            >
              <span className="text-gray-700">
                {l.grupo.replaceAll("_", " ")}
              </span>

              <span
                className={
                  valor < 0
                    ? "text-red-600"
                    : "text-green-700"
                }
              >
                R$ {formatar(valor)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
