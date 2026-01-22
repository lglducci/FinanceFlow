  import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./pages/Login";
import RedefinirSenha from "./pages/RedefinirSenha";


import Dashboard from "./pages/Dashboard";
import Lancamentos from "./pages/Lancamentos";
import NovoLancamento from "./pages/NovoLancamento";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NovoPagarReceber from "./pages/NovoPagarReceber";
import Cartoes from "./pages/Cartoes";
import NovaConta from "./pages/NovaConta";
import EditarConta from "./pages/EditarConta";
import Visaogeral from './pages/Visaogeral'; //a
import EditarLancamento from "./pages/EditarLancamento";
import EditCardTransaction from "./pages/EditCardTransaction";
import NovoCardTransaction from "./pages/NovoCardTransaction";
import NovoCartao from "./pages/NovoCartao";
import EditarCartao from "./pages/EditarCartao";
import FornecedorCliente from "./pages/FornecedorCliente";
import EditarFornecedorCliente from "./pages/EditarFornecedorCliente";
import NovoFornecedorCliente from "./pages/NovoFornecedorCliente";
// Contas a  pagar 
import ContasPagar from "./pages/ContasPagar";
import NovaContaPagar from "./pages/NovaContaPagar";
import EditarContaPagar from "./pages/EditarContaPagar";
// Contas a  receber 
import ContasReceber from "./pages/ContasReceber";
import NovaContaReceber from "./pages/NovaContaReceber";
import EditarContaReceber from "./pages/EditarContaReceber";
import FaturasCartao from "./pages/FaturasCartao";

// ❌ REMOVE ISSO – NÃO EXISTE
// import ContasPagar from "./pages/ContasPagar";
// import ContasReceber from "./pages/ContasReceber";

// ✅ IMPORTA AS PÁGINAS QUE EXISTEM
import SaldosPorConta from "./pages/SaldosPorConta";
import ConsultaTransacaoCartao from "./pages/ConsultaTransacaoCartao";
 import ExcluirParcelamentoPagar from "./pages/ExcluirParcelamentoPagar.jsx";
  import ExcluirParcelamentoReceber from "./pages/ExcluirParcelamentoReceber.jsx";
import ContasGerenciais from "./pages/ContasGerenciais";
import ContasGerenciaisNovo from "./pages/ContasGerenciaisNovo";
import ContasGerenciaisEditar from "./pages/ContasGerenciaisEditar";
import MapeamentoContabil from "./pages/MapeamentoContabil";

import EditaMapeamento from "./pages/EditaMapeamento"; 
import ContasContabeis from "./pages/ContasContabeis";
import NovaContaContabil from "./pages/NovaContaContabil";
import EditarContaContabil from "./pages/EditarContaContabil";
import NovaModeloContabil from "./pages/NovaModeloContabil";

 import Diario from "./pages/Diario";
import NovoDiario from "./pages/NovoDiario";
import EditarDiario from "./pages/EditarDiario";
import ImportarDiario from "./pages/ImportarDiario";
import ProcessarDiario from "./pages/ProcessarDiario";
import RelatoriosBalancete from "./pages/RelatoriosBalancete";

 // App.jsx
import RelatoriosRazao from "./pages/RelatoriosRazao";
import RelatoriosBalanco from "./pages/RelatoriosBalanco";
import RelatoriosDiario from "./pages/RelatoriosDiario";

import RelatoriosDER from "./pages/RelatoriosDER"; 

 
import RelatoriosSaldoPorConta from "./pages/RelatoriosSaldoPorConta";
import  RelatoriosBalancoNiveis from "./pages/RelatoriosBalancoNiveis";
 
 
 import RelatorioGerencial from "./pages/RelatorioGerencial";
import MapContabilImpacto from "./pages/MapContabilImpacto";


//import FluxoCaixaDetalhado from "./pages/FluxoCaixaDetalhado";
//import RelatoriosFluxoCaixaMensal from "./pages/RelatoriosFluxoCaixaMensal";

import RelatorioFluxoCaixa from "./pages/RelatorioFluxoCaixa";

import CompraCartao from "./pages/CompraCartao";
import LancamentosContabeis from "./pages/LancamentosContabeis";
//import LancamentoContabilManual from "./pages/LancamentoContabilManual";
import AlterarSaldo from "./pages/AlterarSaldo";
import TitulosVencidos from "./pages/TitulosVencidos";
import LancamentoPartidaDobrada from "./pages/LancamentoPartidaDobrada";
import LancamentoPartidaDobradaModelo from "./pages/LancamentoPartidaDobradaModelo";
import TributosApuracao from "./pages/TributosApuracao";
import Tributos from "./pages/Tributos";

import ConfiguracaoMeuNegocio from "./pages/ConfiguracaoMeuNegocio";


import CriarModeloMeuNegocio from "./pages/CriarModeloMeuNegocio";
import  RegistroReceitaRapida  from "./pages/RegistroReceitaRapida";                       
import LancamentoContabilRapido  from "./pages/LancamentoContabilRapido"
import DashboardContabil from "./pages/DashboardContabil"

export default function App() {
  const token = localStorage.getItem("ff_token");

  
  if (!token) {
  return (
    <Routes>
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/login" element={<Login onLogin={() => window.location.reload()} />} />
      <Route path="*" element={<Login onLogin={() => window.location.reload()} />} />
    </Routes>
  );
}


  

  return (
    
      <div className="min-h-screen flex bg-bgSoft">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <Header />

          <main className="p-6">
            
              
 

<Routes>
  {/* Visão Geral */}
  <Route path="/" element={<DashboardContabil />} />
  <Route path="/dashboard" element={<Visaogeral />} />

  {/* Outras rotas permanecem */}
  <Route path="/transactions" element={<Lancamentos />} />
  <Route path="/new-transaction" element={<NovoLancamento />} />
  <Route path="/categories" element={<Categories />} />
  <Route path="/reports" element={<Reports />} />
  <Route path="/settings" element={<Settings />} />
  <Route path="/saldos" element={<SaldosPorConta />} />
  <Route path="/cartao-transacoes" element={<ConsultaTransacaoCartao />} />
  <Route path="/nova-conta" element={<NovaConta />} />
  <Route path="/editar-conta" element={<EditarConta />} />
  <Route path="/new-payable" element={<NovoPagarReceber tipoInicial="pagar" />} />
  <Route path="/new-receivable" element={<NovoPagarReceber tipoInicial="receber" />} />
  <Route path="/cards" element={<Cartoes />} />
  <Route path="/editar-lancamento" element={<EditarLancamento />} />
 <Route path="/edit-card-transaction" element={<EditCardTransaction />} />
 <Route path="/new-card-transaction" element={<NovoCardTransaction />} />
 <Route path="/new-card" element={<NovoCartao />} />
 <Route path="/edit-card/:id" element={<EditarCartao />} />
 <Route path="/providers-clients" element={<FornecedorCliente />} />
<Route path="/edit-fornecedorcliente/:id" element={<EditarFornecedorCliente />} />
<Route path="/new-provider-client" element={<NovoFornecedorCliente />} />
<Route path="/contas-pagar" element={<ContasPagar />} /> 
<Route path="/nova-conta-pagar" element={<NovaContaPagar />} />
<Route path="/edit-conta-pagar/:id" element={<EditarContaPagar />} />
<Route path="/contascontabeis" element={<ContasContabeis />} />
{/* Contas a receber */}

<Route path="/contas-receber" element={<ContasReceber />} /> 
<Route path="/nova-conta-receber" element={<NovaContaReceber />} />
<Route path="/edit-conta-receber/:id" element={<EditarContaReceber />} />
<Route path="/excluir-parcelamento-pagar" element={<ExcluirParcelamentoPagar />} />
<Route path="/excluir-parcelamento-receber" element={<ExcluirParcelamentoReceber />} />
 
  
<Route path="/contasgerenciais" element={<ContasGerenciais />} />
<Route path="/contasgerenciais/novo" element={<ContasGerenciaisNovo />} />
<Route path="/contasgerenciais/editar" element={<ContasGerenciaisEditar />} /> 
<Route path="/faturas-cartao" element={<FaturasCartao />} />
<Route path="/mapeamento-contabil" element={<MapeamentoContabil />} />

 <Route path="/editar-mapeamento" element={<EditaMapeamento />} />
 <Route path="/nova-conta-contabil" element={<NovaContaContabil />} />
 <Route path="/editar-conta-contabil" element={<EditarContaContabil />} />
 <Route path="/novo-modelo" element={<NovaModeloContabil />} />
 <Route path="/diario" element={<Diario />} />
  <Route path="/novo-diario" element={<NovoDiario />} />
   <Route path="/editar-diario" element={<EditarDiario />} /> 
    <Route path="/importar-diario" element={<ImportarDiario />} />
   <Route path="/processar-diario" element={<ProcessarDiario />} />
  <Route path="/relatorios/balancete" element={<RelatoriosBalancete />} />
   <Route path="/relatorios/razao" element={<RelatoriosRazao />} />
   <Route path="/relatorios/balanco" element={<RelatoriosBalanco />} /> 
    <Route path="/relatorios/diario" element={<RelatoriosDiario />} />
    <Route path="/relatorios/dre" element={<RelatoriosDER />} />
  
    <Route path="/relatorios/saldoporconta" element={<RelatoriosSaldoPorConta />} />
    <Route path="/relatorios/balanco-niveis" element={<RelatoriosBalancoNiveis />} />
    <Route path="/relatorios/gerencial" element={<RelatorioGerencial />} />
    <Route path="/mapeamento-contabil/impacto" element={<MapContabilImpacto />}/>
    
      <Route path="/relatorios/fluxo-caixa" element={<RelatorioFluxoCaixa />}/>
   
  <Route path="/compras-cartao" element={<CompraCartao />} />
  <Route path="/lancamentos-contabeis" element={<LancamentosContabeis />} />
 {/*} <Route path="/lancamento-contabil-manual" element={<LancamentoContabilManual />} />*/}
  <Route path="/alterar-saldo/:id" element={<AlterarSaldo />} />
  <Route path="/lancamento-contabil-manual" element={<AlterarSaldo />} />
 <Route
  path="/titulos-vencidos"
  element={<TitulosVencidos />}
/>

<Route
  path="/contabil/lancamento-partida-dobrada"
  element={<LancamentoPartidaDobrada />}
/>

<Route
  path="/lancamento-partida-dobrada-modelo"
  element={<LancamentoPartidaDobradaModelo />}
/>

 <Route
  path="/tributos/apuracao"
  element={<TributosApuracao />}
/>


 <Route
  path="/tributos/tributos"
  element={<Tributos />}
/>

 <Route
  path="/meunegocio/meunegocio"
  element={<ConfiguracaoMeuNegocio />}
/>

<Route
  path="/crianegocio/crianegocio"
  element={<CriarModeloMeuNegocio />}
/>

 
<Route
  path="/registrareceitarapida"
  element={<RegistroReceitaRapida />}
/>

 
<Route
  path="/lancamentocontabilrapido"
  element={<LancamentoContabilRapido />}
/> 
<Route
  path="/dashboardcontabil"
  element={<DashboardContabil />}
/>




</Routes>




            
          </main>
        </div>
      </div>
    
  );
}
 

