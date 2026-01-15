 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";

export default function Tributos() {
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [lista, setLista] = useState([]);
  const [filtro, setFiltro] = useState("");

  async function carregar() {

   
    const url = buildWebhookUrl("tributos", { empresa_id });
    const r = await fetch(url);
    const j = await r.json();
    setLista(Array.isArray(j) ? j : []);
  }

  async function ativar(id, ativo) {
    const resp = await fetch(buildWebhookUrl("ativatributo"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        tributo_id: id,
        ativo
      }),
    });

    if (!resp.ok) {
      alert("Erro ao ativar tributo");
      return;
    }

    carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = lista.filter((t) =>
    `${t.codigo} ${t.nome}`.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="p-2">
       
         
      <div className="bg-white rounded-xl shadow p-8 border-[8px] border-[#061f4aff] mb-2">
       
             <h2 className="text-2xl font-bold mb-4 text-[#061f4aff] mt-2 ">
        🧾 Tributos da Empresa
      </h2>

         <label className="font-bold text-[#061f4aff] mt-2 ">Pesquisa    </label>
         <input
         
          className="border rounded px-3 py-2 w-96 border-yellow-500"
          placeholder="Buscar por código ou nome..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <div className="bg-gray-200 rounded-xl p-4 shadow border-[4px] border-gray-500">
        <table className="w-full text-sm">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th>Código</th>
              <th className="text-left">Nome</th>
              <th className="px-3 py-2 text-left font-bold">Tipo</th>
              <th className="px-3 py-2 text-right font-bold">Alíquota</th>
              <th className="px-3 py-2 text-center font-bold">Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((t, i ) => (
                <tr
      key={i}
      className={i % 2 ? "bg-[#f2f2f2]" : "bg-[#e6e6e6]"}
    >

              
                <td className="font-bold">{t.codigo}</td>
                <td className="px-3 py-2 text-left font-bold">{t.nome}</td>
                <td className="px-3 py-2 text-left font-bold">{t.tipo}</td>
                <td className="px-3 py-2 text-right font-bold">{t.aliquota ? `${t.aliquota}%` : "-"}</td>
                <td className={t.ativo ? "text-green-700 font-bold text-center " : "text-red-600 font-bold text-center "}>
                  {t.ativo ? "ATIVO" : "INATIVO"}
                </td>
                <td>
                  <button
                    onClick={() => ativar(t.id, !t.ativo)}
                    className={`px-4 py-1 rounded font-bold text-white ${
                      t.ativo ? "bg-red-600" : "bg-green-600"
                    }`}
                  >
                    {t.ativo ? "Desativar" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
