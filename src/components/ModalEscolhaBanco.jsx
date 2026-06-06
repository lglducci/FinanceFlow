import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";

export default function ModalEscolhaBanco({ open, empresa_id, onClose, onSelect }) {
  const [bancos, setBancos] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (!open) return;

    async function carregar() {
      const resp = await fetch(buildWebhookUrl("lista_bancos", { empresa_id }));
      const json = await resp.json();

      const base = Array.isArray(json) ? json[0] : json;
      const dados = base?.data || base?.dados || json;

      setBancos(Array.isArray(dados) ? dados : []);
    }

    carregar();
  }, [open, empresa_id]);

  if (!open) return null;

  const filtrados = bancos.filter((b) =>
    `${b.codigo} ${b.nome}`.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-[560px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-slate-800">
            Selecione seu novo banco
          </h2>

          <button onClick={onClose} className="text-slate-400 text-xl font-black">
            ×
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {filtrados.map((b) => (
            <button
              key={b.codigo}
              type="button"
              onClick={() => onSelect(b)}
              className="h-28 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition flex flex-col items-center justify-center gap-2"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 border"
                style={{ borderColor: b.cor_hex || "#e2e8f0" }}
              >
                {b.icone_url ? (
                 <img
                    src={b.icone_url}
                    alt={b.nome}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                        e.currentTarget.style.display = "none";
                    }}
                    />
                ) : (
                  <span className="font-black text-slate-700">
                    {String(b.nome || "?").slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="text-xs font-black text-slate-700 text-center">
                {b.nome}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="🔍 Buscar outro banco"
            className="w-full rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 font-bold text-sm"
          />
        </div>
      </div>
    </div>
  );
}