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
    grupo_contabil: "",
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
        grupo_contabil: form.grupo_contabil || null,
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
        grupo_contabil: ""
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

        <input
          type="text"
          placeholder="Grupo contábil (opcional)"
          className="input-premium"
          value={form.grupo_contabil}
          onChange={(e) =>
            setForm(prev => ({
              ...prev,
              grupo_contabil: e.target.value
            }))
          }
        />

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
