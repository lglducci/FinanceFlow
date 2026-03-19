 import { useState } from "react";
import { useNavigate } from "react-router-dom";
 import { planoContas } from "../../data/planoContas";

function Node({ item }) {
  const [open, setOpen] = useState(false);

  const temFilho = item.filhos && item.filhos.length > 0;

  return (
    <div className="ml-2 border-l pl-2">

      <div
        className="cursor-pointer py-1 flex justify-between"
        onClick={() => temFilho && setOpen(!open)}
      >
         <div className="flex flex-col">
            <span className="font-semibold">
                {item.codigo} - {item.nome}
            </span>

            {item.descricao && (
                <span className="text-sm text-gray-500">
                💬 {item.descricao}
                </span>
            )}
            </div>

        {temFilho && <span>{open ? "▲" : "▼"}</span>}
      </div>

      {open && temFilho && (
        <div className="ml-3">
          {item.filhos.map((f, i) => (
            <Node key={i} item={f} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function PlanoContasAccordion() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="p-4">
        <button
          onClick={() => navigate("/ajuda/contabil")}
          className="bg-white text-[#0b1f3a] px-3 py-1 rounded font-bold"
        >
          ← Voltar
        </button>
      </div>

      <div className="bg-[#0b1f3a] text-white py-8 text-center">
        <h1 className="text-2xl font-bold">
          📊 Plano de Contas (Detalhado)
        </h1>
      </div>

      <div className="max-w-4xl mx-auto p-6 bg-white mt-6 rounded-xl shadow">

        {planoContas.map((item, i) => (
          <Node key={i} item={item} />
        ))}

      </div>
    </div>
  );
}