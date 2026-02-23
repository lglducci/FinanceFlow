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
        tipo 
         
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
 

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title="Nova Categoria"
    >
      <div className="flex flex-col gap-4">
       <label className="font-medium">
      Nome  <span className="text-red-500">*</span>
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

                  
                </div>
              

               

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
