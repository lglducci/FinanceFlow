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
        meu_negocio: true,
        forma_operacao:form.forma_operacao
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
  entrada: [
    "receita",
    "ativo",
    "passivo"      // empréstimo recebido
  ],
  saida: [
    "despesa",
    "estoque",
    "imobilizado", // novo
    "passivo",     // criação de dívida
    "baixa_passivo"
  ]
};

  const opcoes = opcoesClassificacao[tipo] || [];

  
const opcoesFormaOperacao = {
  saida: [
    "FORNECEDOR",
    "BANCO",
    "FINANCIAMENTO",
    "CARTAO",
    "FISCAL",
    "SOCIO",
    "OUTROS"
  ],
  entrada: [
    "CLIENTE",
    "BANCO",
    "SOCIO",
    "OUTROS"
  ]
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
                  {opcoes.includes("imobilizado") && <option value="imobilizado">Imobilizado</option>}
                  {opcoes.includes("baixa_passivo") && <option value="baixa_passivo">Baixa de Passivo</option>}
                </select>


                  <label className="label label-required font-bold text-[#1e40af] flex items-center gap-2">
                    Forma Operação *
                    <span className="relative group cursor-pointer">
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                        ?
                      </span>

                      {/* Tooltip */}
                      <div className="absolute left-6 top-0 z-50 hidden group-hover:block 
                                      bg-gray-900 text-white text-xs rounded-lg p-3 w-80 shadow-lg">
                        <strong>O que é este campo?</strong>

                        <p className="mt-1">
                          Define <b>quem está do outro lado da operação</b>.
                        </p>

                        <p className="mt-1">
                          Ele determina qual modelo contábil será utilizado
                          para gerar os lançamentos automaticamente.
                        </p>

                        <p className="mt-1">
                          Exemplo:
                          <br />
                          • FORNECEDOR → dívida comercial
                          <br />
                          • BANCO → empréstimo bancário
                          <br />
                          • FINANCIAMENTO → aquisição de bem durável
                          <br />
                          • CLIENTE → conta a receber
                        </p>

                        <p className="mt-1">
                          ⚠ Escolher corretamente evita lançamentos contábeis incorretos.
                        </p>
                      </div>
                    </span>
                  </label>

                  <select
                      required
                      className="input-premium"
                      value={form.forma_operacao || ""}
                      onChange={(e) =>
                        setForm({ ...form, forma_operacao: e.target.value })
                      }
                    >
                      <option value="">Selecione...</option>

                      {(opcoesFormaOperacao[tipo] || []).map((opc) => (
                        <option key={opc} value={opc}>
                          {opc.charAt(0) + opc.slice(1).toLowerCase().replace("_", " ")}
                        </option>
                      ))}
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
