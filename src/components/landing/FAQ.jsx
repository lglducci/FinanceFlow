 

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";

const perguntas = [
  {
    pergunta: "O FinanceFlow é apenas um sistema financeiro?",
    resposta:
      "Não. O FinanceFlow une gestão financeira e contabilidade em uma única plataforma. Você controla receitas, despesas, cartões, fluxo de caixa, DRE, balancete, razão e diversos indicadores financeiros.",
  },
  {
    pergunta: "Preciso ser contador para utilizar o sistema?",
    resposta:
      "Não. O sistema foi desenvolvido justamente para empresários que desejam entender melhor sua empresa sem precisar conhecer contabilidade.",
  },
  {
    pergunta: "Posso importar extratos bancários?",
    resposta:
      "Sim. Basta importar o extrato do seu banco e o FinanceFlow organiza automaticamente as movimentações financeiras.",
  },
  {
    pergunta: "O sistema importa cartões de crédito?",
    resposta:
      "Sim. É possível importar faturas em PDF ou Excel e organizar automaticamente todas as compras, parcelas e pagamentos.",
  },
  {
    pergunta: "O FinanceFlow calcula o lucro automaticamente?",
    resposta:
      "Sim. A plataforma gera automaticamente a DRE e diversos indicadores financeiros para que você saiba se sua empresa realmente está dando lucro.",
  },
  {
    pergunta: "Posso controlar contas a pagar e receber?",
    resposta:
      "Sim. Você controla vencimentos, pagamentos, recebimentos, recorrências e ainda acompanha o fluxo de caixa projetado.",
  },
  {
    pergunta: "Funciona para mais de uma empresa?",
    resposta:
      "Sim. O FinanceFlow possui suporte a múltiplas empresas utilizando um único usuário.",
  },
  {
    pergunta: "Os dados ficam seguros?",
    resposta:
      "Sim. Toda a comunicação é criptografada e seus dados ficam armazenados em ambiente seguro na nuvem.",
  },
  {
    pergunta: "Existe fidelidade?",
    resposta:
      "Não. Você pode cancelar quando desejar.",
  },
  {
    pergunta: "Posso testar antes de contratar?",
    resposta:
      "Sim. Você possui um período gratuito para conhecer toda a plataforma sem informar cartão de crédito.",
  },
];

function Item({ pergunta, resposta }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden hover:border-cyan-400 transition">

      <button
        onClick={() => setAberto(!aberto)}
        className="w-full px-8 py-6 flex items-center justify-between text-left"
      >
        <span className="font-black text-xl text-slate-900 pr-6">
          {pergunta}
        </span>

        {aberto ? (
          <ChevronUp className="text-cyan-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="text-cyan-600 flex-shrink-0" />
        )}
      </button>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          aberto ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-8 pb-8 text-slate-600 leading-8 text-lg">
          {resposta}
        </div>
      </div>

    </div>
  );
}

export default function FAQ() {
  return (
    <section
      id="faq"
      className="py-28 bg-white"
    >
      <div className="max-w-5xl mx-auto px-6">

        <div className="text-center mb-18">

          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 text-cyan-700 px-5 py-2 font-bold">

            <HelpCircle size={18} />

            Perguntas Frequentes

          </div>

          <h2 className="mt-6 text-5xl font-black text-slate-900">

            Ainda ficou alguma dúvida?

          </h2>

          <p className="mt-8 text-xl leading-9 text-slate-600 max-w-3xl mx-auto">

            Selecionamos as perguntas mais comuns
            de empresários que estão conhecendo
            o FinanceFlow pela primeira vez.

          </p>

        </div>

        <div className="space-y-5">

          {perguntas.map((item) => (
            <Item
              key={item.pergunta}
              pergunta={item.pergunta}
              resposta={item.resposta}
            />
          ))}

        </div>

        <div className="mt-20 rounded-[40px] bg-gradient-to-r from-[#071326] via-[#0F172A] to-[#0d4fa8] p-14 text-center shadow-2xl">

          <h3 className="text-5xl font-black text-white">

            Pronto para conhecer o FinanceFlow?

          </h3>

          <p className="mt-8 text-xl leading-9 text-slate-300 max-w-3xl mx-auto">

            Crie sua conta gratuitamente e descubra
            como é simples administrar sua empresa
            utilizando uma única plataforma.

          </p>

          <a
           href="/cadastro"
            className="inline-flex mt-10 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition px-10 py-5 text-xl font-black text-slate-900"
          >
            Começar Gratuitamente
          </a>

        </div>

      </div>
    </section>
  );
}