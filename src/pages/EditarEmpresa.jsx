 import { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";
import { supabase } from "../supabaseClient";


export default function EditarEmpresa() {
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [form, setForm] = useState({
    nome: "",
    tipo: "PJ",
    documento: ""
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
useEffect(() => {
  async function carregar() {
    try {
      const { data, error } = await supabase
        .from("empresas")
        .select("nome, tipo, documento")
        .eq("id", empresa_id)
        .single();

      if (error) throw error;

      setForm({
        nome: data.nome || "",
        tipo: data.tipo || "PJ",
        documento: data.documento || ""
      });
    } catch (e) {
      setErro("Erro ao carregar dados da empresa.");
      console.error(e);
    }
  }

  if (empresa_id) carregar();
}, [empresa_id]);

   
 async function salvar(e) {
  e.preventDefault();
  setErro("");
  setMsg("");
  setLoading(true);

  try {
    const { error } = await supabase
      .from("empresas")
      .update({
        nome: form.nome,
        tipo: form.tipo,
        documento: form.documento
      })
      .eq("id", empresa_id);

    if (error) throw error;

    setMsg("✅ Dados da empresa atualizados com sucesso.");
    
  } catch (e) {
    setErro("Erro ao salvar dados da empresa.");
    console.error(e);
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-bgSoft flex justify-center px-4 py-8">
      <div className="w-full max-w-2xl">

        {/* CARD AZUL (CONTÊINER) */}
        <div className="bg-[#061f4aff] rounded-xl p-4 shadow-md">

          <h2 className="text-2xl font-bold mb-6 text-white text-center">
            ⚡ Minha Empresa
          </h2>

          {/* CARD BRANCO (FORMULÁRIO) */}
          <div className="bg-white rounded-xl p-6">
            <form onSubmit={salvar} className="space-y-5">

              {/* NOME */}
              <div>
                <label className="block text-sm font-bold text-[#1e40af] mb-1">
                  Nome da empresa
                </label>
                <input
                  className="input-premium w-full"
                  value={form.nome}
                  onChange={e =>
                    setForm(f => ({ ...f, nome: e.target.value }))
                  }
                />
              </div>

              {/* TIPO */}
              <div>
                <label className="block text-sm font-bold text-[#1e40af] mb-1">
                  Tipo
                </label>
                <select
                  className="w-full px-3 py-2 rounded border text-gray-900"
                  value={form.tipo}
                  onChange={e =>
                    setForm(f => ({ ...f, tipo: e.target.value }))
                  }
                >
                  <option value="PF">Pessoa Física</option>
                  <option value="MEI">MEI</option>
                  <option value="ME">ME</option>
                  <option value="LTDA">LTDA</option>
                  <option value="SA">SA</option>
                  <option value="EIRELI">EIRELI</option>
                  <option value="ASSOCIACAO">Associação</option>
                   
               
                </select>
              </div>

              {/* DOCUMENTO */}
              <div>
                <label className="block text-sm font-bold text-[#1e40af] mb-1 font-semibold">
                  Documento (CPF/CNPJ)
                </label>
                <input
                  className="w-full px-3 py-2 rounded border text-gray-900"
                  value={form.documento}
                  onChange={e =>
                    setForm(f => ({ ...f, documento: e.target.value }))
                  }
                />
              </div>

              {/* MENSAGENS */}
              {erro && (
                <p className="text-red-600 text-sm text-center font-semibold">
                  {erro}
                </p>
              )}

              {msg && (
                <p className="text-green-700 text-sm text-center font-semibold">
                  {msg}
                </p>
              )}

              {/* BOTÃO */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0b2453] text-white py-2 rounded-lg font-semibold"
              >
                {loading ? "Salvando..." : "Salvar alterações"}
              </button>
        
            

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
