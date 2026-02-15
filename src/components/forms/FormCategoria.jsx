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
     
       alert("⚠ Categoria criada com cadastro mínimo. Complete os dados depois em Cadastros-> Categorias Gerenciais.");
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

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title="Nova Categoria"
    >
      <div className="flex flex-col gap-4">
      <label> Nome da Categoria </label>
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
        <div className="flex flex-col gap-4">
         <label> Classificação </label>  
       <select
              className="input-premium"
              placeholder="Classificação"
              value={form.classificacao}
              onChange={(e) =>
                setForm({ ...form, classificacao: e.target.value })
              }
            >
              <option value="">Selecione...</option>
              <option value="despesa">Despesa</option>
              <option value="estoque">Estoque</option>
              <option value="receita">Receita</option>
              <option value="ativo">Ativo</option>
              <option value="passivo">Passivo</option>
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
