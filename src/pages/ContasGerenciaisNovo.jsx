 import React, { useState, useEffect } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";
import ModalBase from "../components/ModalBase";
import  FormModeloContabil from "../components/forms/FormModeloContabil";


 
/* 🎨 Tema azul coerente */
const THEME = {
  title: "#ff9f43",
};

export default function ContasGerenciaisNovo() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);
  
const [modeloCodigo, setModeloCodigo] = useState("");
const [modalModelo, setModalModelo] = useState(false);
  /* ===============================
     ESTADO DO FORMULÁRIO
  ================================== */
  const [form, setForm] = useState({
    nome: "",
    tipo: "entrada",
    classificacao: "",
  });

  /* modelos = tokens do diário */
  const [modelos, setModelos] = useState([]);
  const [modeloSelecionado, setModeloSelecionado] = useState(null);
  const [linhas, setLinhas] = useState([]);

  /* ===============================
     CARREGA OS MODELOS DO DIÁRIO
  ================================== */
  async function carregarModelos() {
    try {
      const url = buildWebhookUrl("modelos", { empresa_id });
      const r = await fetch(url);
      const dados = await r.json();
      setModelos(dados);
    } catch (e) {
      console.log("Erro ao carregar modelos:", e);
    }
  }

  /* ===============================
     QUANDO O USUÁRIO ESCOLHE O TOKEN
  ================================== */
 
    

  /* ===============================
     SALVAR NOVA CATEGORIA
  ================================== */
   async function salvar() {
  const url = buildWebhookUrl("novacategoriagerencial");

  if (!form.classificacao || form.classificacao.trim() === "") {
    alert("Classificação é obrigatória.");
    return;
  }

  if (!form.nome || form.nome.trim() === "") {
    alert("Nome é obrigatório.");
    return;
  }

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ empresa_id, ...form }),
  });

  const texto = await resp.text();
  let json = {};

  try {
    json = JSON.parse(texto);
  } catch {}

  if (
    Array.isArray(json) &&
    json.length > 0 &&
    json[0].ff_insere_categoria_gerencial
  ) {
    alert("Categoria criada!");
    navigate(-1);
    return;
  }

  alert("Erro ao salvar");
}

  

  /* ===============================
        TELA
  ================================== */

  
  function getHelperTexto(tipo) {
  switch (tipo) {
    case 'CP':
      return "Conta a Pagar: o crédito deve ser Passivo (2.1.x) e o débito pode ser Estoque, Despesa ou Imobilizado.";
    case 'CR':
      return "Conta a Receber: o débito deve ser Clientes (1.1.x) e o crédito Receita (5.x).";
    case 'CX':
      return "Movimento de Caixa: envolve Banco/Caixa e baixa de Cliente ou Fornecedor.";
    case 'IM':
      return "Imobilizado: débito em 1.2.x (bem durável) e crédito em Fornecedores (2.1.x).";
    default:
      return "Selecione as contas conforme sua estrutura contábil.";
  }
}
 
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

const opcoes = opcoesClassificacao[form.tipo] || [];

  return (
    <div className="min-h-screen py-6 px-4 bg-bgSoft">
        <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#061f4aff] text-white mt-1 mb-1" >

        <h1
          className="text-2xl md:text-2xl font-bold p-2 mb-3 text-center"
          style={{ color: THEME.title }}
        >
          ✏️ Nova Categoria Gerencial
        </h1>

        <div className="bg-gray-100 p-5 rounded-xl shadow flex flex-col gap-4">

          {/* NOME */}
          <label className="label label-required font-bold text-[#1e40af]">Nome</label>
          <input
            className="input-premium"
            value={form.nome}
            placeholder="Ex: Vendas Delivery"
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />

          {/* TIPO */}
          <label className=" label label-required font-bold text-[#1e40af]">Tipo</label>
          <select
            className="input-premium"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>

 
          
                  {/* CLASSIFICAÇÃO CONTÁBIL */}
            <label className="label label-required font-bold text-[#1e40af]">
              Classificação
            </label>

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

              {(opcoesFormaOperacao[form.tipo] || []).map((opc) => (
                <option key={opc} value={opc}>
                  {opc.charAt(0) + opc.slice(1).toLowerCase().replace("_", " ")}
                </option>
              ))}
            </select>

          {/* BOTÕES */}
          <div className="flex gap-6 pt-8 pb-8 pl-1">

            <button
              onClick={salvar} 
              className="flex-1 bg-[#061f4aff] text-white px-5 py-2 rounded font-bold"
            >
              Salvar
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-500 text-white px-4 py-3 rounded font-bold"
            >
              Cancelar
            </button>

          </div>

        </div>
      </div>

      
           <ModalBase
          open={modalModelo}
          onClose={() => setModalModelo(false)}
          title="Novo Modelo"
        >
          <FormModeloContabil
            empresa_id={empresa_id}
               tipo_operacao=""   // <-- AQUI
            onSuccess={() => {
              setModalModelo(false);
              carregarModelos();
            }} 

            onCancel={() => setModalModelo(false)}
          />
        </ModalBase>
    </div>
  );
}
