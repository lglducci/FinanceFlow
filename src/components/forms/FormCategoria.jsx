import { useState } from "react";
import ModalBase from "../ModalBase";
import { buildWebhookUrl } from "../../config/globals";

export default function FormCategoria({
  open,
  onClose,
  empresa_id,
  tipo,
  onCategoriaCriada
}) {
  const [form, setForm] = useState({
    nome: "",
   classificacao: "",
  });

  const handleSalvar = async () => {
    if (!form.nome.trim()) {
      alert("Nome obrigatório");
      return;
    }

    try {
      const payload = {
        empresa_id,
        nome: form.nome,
        classificacao: form.classificacao || null,
        tipo,
        meu_negocio: true
      };

      const resp = await fetch(
        buildWebhookUrl("novacategoriagerencial"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await resp.json();
      const nova = Array.isArray(data) ? data[0] : data;

      if (!nova || nova.ok === false) {
        alert(nova?.message || "Erro ao salvar categoria");
        return;
      }
     
      
      // 🔥 devolve para tela pai
      if (onCategoriaCriada) {
        onCategoriaCriada(nova);
      }

      // limpa form
      setForm({
        nome: "",
        classificacao: ""
      });

      onClose();

    } catch (err) {
      console.error(err);
      alert("Erro de comunicação com servidor.");
    }
  };

  const opcoesClassificacao = {
  entrada: ["receita", "ativo"],
  saida: ["despesa", "estoque", "passivo"]
};

  const opcoes = opcoesClassificacao[tipo] || [];

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title="Nova Categoria"
    >
      <div className="flex flex-col gap-4">
       <label className="font-medium">
      Nome da Categoria <span className="text-red-500">*</span>
    </label>

        <input
          type="text"
          
          placeholder="Nome da categoria"
          className="input-premium"
          value={form.nome}
          onChange={(e) =>
            setForm(prev => ({
              ...prev,
              nome: e.target.value
            }))
          }
        />
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="font-medium">
                    Classificação <span className="text-red-500">*</span>
                  </label>

                  <div className="relative group cursor-pointer">
                    <span className="text-sm bg-gray-200 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center">
                          <strong>?</strong>
                        </span>


                    <div className="absolute left-0 mt-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                      Este campo define a natureza contábil da categoria.
                      <br /><br />
                      • Receita → entradas de dinheiro<br />
                      • Despesa → gastos operacionais<br />
                      • Estoque → mercadorias<br />
                      • Ativo → bens e direitos<br />
                      • Passivo → obrigações e dívidas
                      <br /><br />
                      Essa classificação é usada para gerar corretamente os lançamentos contábeis.
                    </div>
                  </div>
                </div>
             
                <select
                    required
                    className="input-premium"
                    value={form.classificacao}
                    onChange={(e) =>
                      setForm({ ...form, classificacao: e.target.value })
                    }
                  >
                    <option value="">Selecione...</option>

                    {opcoes.includes("despesa") && <option value="despesa">Despesa</option>}
                    {opcoes.includes("estoque") && <option value="estoque">Estoque</option>}
                    {opcoes.includes("receita") && <option value="receita">Receita</option>}
                    {opcoes.includes("ativo") && <option value="ativo">Ativo</option>}
                    {opcoes.includes("passivo") && <option value="passivo">Passivo</option>}
                  </select>
              </div>

        <div className="text-sm text-gray-600">
          Tipo: <strong>{tipo === "entrada" ? "Entrada" : "Saída"}</strong>
        </div>

        <button
          className="bg-[#061f4aff] text-white px-4 py-2 rounded-lg font-semibold"
          onClick={handleSalvar}
        >
          Salvar Categoria
        </button>

      </div>
    </ModalBase>
  );
}
