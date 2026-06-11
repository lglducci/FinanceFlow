 import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";

export default function EditarContaContabil() {
  const navigate = useNavigate();
  const { state } = useLocation();
 
  const id = state?.id;
  const empresa_id = state?.empresa_id;

   const [form, setForm] = useState({
  codigo: "",
  nome: "",
  tipo: "",
  natureza: "",
  nivel: "",
  classificacao: "",
});
 const classeConta = Number(String(form.codigo || "").trim().split(".")[0]);

  async function carregar() {
    try {
      const url = buildWebhookUrl("contascontabeis", {
        empresa_id:empresa_id,
        id:id,
        dc: "",
      });

      const resp = await fetch(url);
      const dados = await resp.json();

      if (dados.length > 0) {
        const c = dados[0];
       setForm({
        codigo: c.codigo,
        nome: c.nome,
        tipo: c.tipo,
        natureza: c.natureza,
        nivel: c.nivel,
        classificacao: c.classificacao_gerencial || "",
      });
      }
    } catch (e) {
      console.log("ERRO AO CARREGAR", e);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar() {
    try {
      const url = buildWebhookUrl("atualizar_conta_contabil", {
        id,
        empresa_id,
        ...form,
      });

      await fetch(url, { method: "POST" });
      alert("Conta atualizada!");
      navigate("/contascontabeis");
    } catch (e) {
      alert("Erro ao salvar!");
    }
  }

    return (
  <div className="min-h-screen bg-slate-100 px-4 py-6">
    <div className="fixed inset-0 bg-black/55" />

    <div className="relative z-10 w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-[22px] shadow-2xl border border-slate-200 overflow-hidden">

        {/* CABEÇALHO */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#08233d]">
              Editar Conta Contábil
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Atualize os dados cadastrais e a classificação gerencial da conta.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/contascontabeis")}
            className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-400 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* CORPO */}
        <div className="max-h-[68vh] overflow-y-auto px-6 py-5 space-y-6">

          {/* DADOS DA CONTA */}
          <section className="space-y-4">
            <h2 className="text-sm font-black text-[#08233d]">
              Dados da conta
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-4">
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Código
                </label>
                <input
                  value={form.codigo}
                  disabled
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-black text-slate-500 outline-none cursor-not-allowed"
                  placeholder="Código"
                />
              </div>

              <div className="sm:col-span-8">
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Nome
                </label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Nome da conta"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Natureza
                </label>
                <select
                  value={form.natureza}
                  disabled
                  onChange={(e) => setForm({ ...form, natureza: e.target.value })}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-black text-slate-500 outline-none cursor-not-allowed"
                >
                  <option value="">Selecione...</option>
                  <option value="D">Débito</option>
                  <option value="C">Crédito</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Nível
                </label>
                <input
                  value={form.nivel}
                  disabled
                  onChange={(e) => setForm({ ...form, nivel: e.target.value })}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-black text-slate-500 outline-none cursor-not-allowed"
                  placeholder="Nível"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-black text-slate-600 mb-1">
                  Classe
                </label>
                <input
                  value={
                    classeConta === 1
                      ? "Ativo"
                      : classeConta === 2
                      ? "Passivo"
                      : classeConta === 3
                      ? "Patrimônio Líquido"
                      : classeConta === 4
                      ? "Receita"
                      : classeConta === 5
                      ? "Custo"
                      : classeConta === 6
                      ? "Despesa"
                      : ""
                  }
                  disabled
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-black text-slate-500 outline-none cursor-not-allowed"
                  placeholder="Classe"
                />
              </div>
            </div>
          </section>

          {[4, 5, 6].includes(classeConta) && (
            <>
              <div className="border-t border-slate-200" />

              {/* CLASSIFICAÇÃO GERENCIAL */}
              <section className="space-y-4">
                <h2 className="text-sm font-black text-[#08233d]">
                  Classificação gerencial
                </h2>

                <div>
                  <label className="block text-xs font-black text-slate-600 mb-1">
                    Tipo gerencial
                  </label>

                  <select
                    value={form.classificacao || ""}
                    onChange={(e) =>
                      setForm({ ...form, classificacao: e.target.value })
                    }
                    className="w-full h-10 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="">Selecione...</option>

                    {classeConta === 4 && (
                      <option value="receita">Receita</option>
                    )}

                    {classeConta === 5 && (
                      <>
                        <option value="custo_variavel">Custo Variável</option>
                        <option value="custo_fixo">Custo Fixo</option>
                      </>
                    )}

                    {classeConta === 6 && (
                      <>
                        <option value="despesa_variavel">Despesa Variável</option>
                        <option value="despesa_fixa">Despesa Fixa</option>
                        <option value="nao_operacional">Não Operacional</option>
                      </>
                    )}
                  </select>

                  <p className="text-xs font-semibold text-slate-400 mt-2">
                    Essa classificação ajuda o FinanceFlow a montar relatórios
                    gerenciais, DRE e análises por tipo de conta.
                  </p>
                </div>
              </section>
            </>
          )}
        </div>

        {/* RODAPÉ */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/contascontabeis")}
            className="h-11 px-6 rounded-lg border border-sky-200 bg-sky-50 text-[#08233d] text-sm font-black"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={salvar}
            className="h-11 px-7 rounded-lg bg-[#082f4f] text-white text-sm font-black shadow-md"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  </div>
);
}

const input = {
  width: "100%",
  padding: "8px",
  marginBottom: 12,
  borderRadius: 6,
  border: "1px solid #aaa",
};

const btnSalvar = {
  background: "#005bdf",
  border: "none",
  padding: "10px 28px",
  color: "white",
  fontWeight: "bold",
  borderRadius: 6,
  cursor: "pointer",
};

const btnCancelar = {
  background: "#999",
  border: "none",
  padding: "10px 28px",
  color: "white",
  fontWeight: "bold",
  borderRadius: 6,
  cursor: "pointer",
};
