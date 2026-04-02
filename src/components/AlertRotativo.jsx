 import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AlertRotativo() {

  const perfil = localStorage.getItem("perfil");

  const mensagens = [
    {
      somenteTotal: true,
      texto: (
        <>
          ⚠️ Atualize seus lançamentos de Movimentação Financeira —{" "}
          <Link to="/transactions" className="underline font-bold">
            Clique aqui
          </Link>
        </>
      )
    },
    {
      somenteTotal: false,
      texto: (
        <>
          📊 Veja seus relatórios —{" "}
          <Link to="/reports" className="underline font-bold">
            Abrir Relatórios
          </Link>
        </>
      )
    },
    {
      somenteTotal: true,
      texto: (
        <>
          ⚙️ Processamento contábil disponível —{" "}
          <Link to="/processar-diario" className="underline font-bold">
            Acessar
          </Link>
        </>
      )
    },
    {
      somenteTotal: false,
      texto: (
        <>
          ⚙️ Para lançamentos direto no contábel —{" "}
          <Link to="/relatorios/diario" className="underline font-bold">
            Acessar
          </Link>
        </>
      )
    },
    {
      somenteTotal: true,
      texto: (
        <>
          ⚙️ Para pagar contas em lote —{" "}
          <Link to="/contas-pagar" className="underline font-bold">
            Acessar
          </Link>
        </>
      )
    },
    {
      somenteTotal: true,
      texto: (
        <>
          ⚙️ Para receber contas em lote —{" "}
          <Link to="/contas-receber" className="underline font-bold">
            Acessar
          </Link>
        </>
      )
    },
    {
      somenteTotal: true,
      texto: (
        <>
          ⚙️ Após realizar todos lançamentos financeiros, não esqueça de realizar o Processamento Contábil —{" "}
          <Link to="/processar-diario" className="underline font-bold">
            Acessar
          </Link>
        </>
      )
    },
    {
      somenteTotal: false,
      texto: (
        <>
          ⚙️ Você pode realizar todos seus lançamentos contábeis em Lote (Livro Caixa) —{" "}
          <Link to="/livro-caixa" className="underline font-bold">
            Acessar
          </Link>
        </>
      )
    },
    {
      somenteTotal: false,
      texto: (
        <>
          ⚙️ Para criar uma nova conta contábel —{" "}
          <Link to="/nova-conta-contabil" className="underline font-bold">
            Acessar
          </Link>
        </>
      )
    },
    {
      somenteTotal: false,
      texto: (
        <>
          ⚙️ Para criar um novo (Token) Contábel —{" "}
          <Link to="/novo-modelo" className="underline font-bold">
            Acessar
          </Link>
        </>
      )
    },
    {
      somenteTotal: false,
      texto: (
        <>
          ⚙️ O Modelo ou Token Contábil é um modelo pronto realização de uma partida dobrada (Débito e Crédito).
        </>
      )
    },
    {
      somenteTotal: true,
      texto: (
        <>
          ⚙️ Para operações básicas (movimentações financeiras), o sistema conta com parametrização automatica de geração de lançamentos contábeis.
        </>
      )
    },
    {
      somenteTotal: true,
      texto: (
        <>
          ⚙️ Isso quer dizer, toda movimentação financeira estará preparada para geração do contábil.{" "}
          <Link to="/processar-diario" className="underline font-bold">
            Acessar
          </Link>
        </>
      )
    },
    {
      somenteTotal: false,
      texto: (
        <>
          ⚙️ Acesse o relatório de DRE e confira o seu resultado.{" "}
          <Link to="/relatorios/dre" className="underline font-bold">
            Acessar
          </Link>
        </>
      )
    },
    {
      somenteTotal: false,
      texto: (
        <>
          ⚙️ A qualquer momento utilize uma opção de Menu desejado.
        </>
      )
    },
    {
      somenteTotal: true,
      texto: (
        <>
           ⚙️ Registre suas movimentações financeiras: contas a pagar, receber, cartão, PIX e pagamentos.
          <Link to="/new-transaction" className="underline font-bold">
            Acessar
          </Link>
        </>
      )
    }
    ,
    {
      somenteTotal: true,
      texto: (
        <>
           ⚠️ Após finalizar todos lançamentos do dia, não esqueça de realizar o processamento contábil —{" "}
          <Link to="/processar-diario" className="underline font-bold">
            Acessar
          </Link>
        </>
      )
    }
 ,
    {
      somenteTotal: true,
      texto: (
        <>
           Para registrar uma compra no cartão —{" "}
          <Link to="/new-card-transaction" className="underline font-bold">
            Acessar
          </Link>
        </>
      )
    }
     

 


  ];

  // 🔥 FILTRO AUTOMÁTICO
  const mensagensFiltradas = mensagens.filter((m) => {
    if (m.somenteTotal === true && perfil !== "TOTAL") {
      return false;
    }
    return true;
  });

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (mensagensFiltradas.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % mensagensFiltradas.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [mensagensFiltradas.length]);

  return (
    <div className="w-full bg-[#061f4a] text-yellow-100 text-sm text-center py-2 font-medium border-b border-yellow-300">
      {mensagensFiltradas.length > 0 &&
        mensagensFiltradas[index].texto}
    </div>
  );
}