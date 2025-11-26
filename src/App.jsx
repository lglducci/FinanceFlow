 import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./pages/Login";

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
import Visaogeral from './pages/Visaogeral'; //
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
 

// ❌ REMOVE ISSO – NÃO EXISTE
// import ContasPagar from "./pages/ContasPagar";
// import ContasReceber from "./pages/ContasReceber";

// ✅ IMPORTA AS PÁGINAS QUE EXISTEM
import SaldosPorConta from "./pages/SaldosPorConta";
import ConsultaTransacaoCartao from "./pages/ConsultaTransacaoCartao";
 import ExcluirParcelamentoPagar from "./pages/ExcluirParcelamentoPagar.jsx";
 


export default function App() {
  const token = localStorage.getItem("ff_token");

  if (!token) {
    return <Login onLogin={() => window.location.reload()} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex bg-bgSoft">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <Header />

          <main className="p-6">
            
              
 

<Routes>
  {/* Visão Geral */}
  <Route path="/" element={<Visaogeral />} />
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
{/* Contas a receber */}

<Route path="/contas-receber" element={<ContasReceber />} /> 
<Route path="/nova-conta-receber" element={<NovaContaReceber />} />
<Route path="/edit-conta-receber/:id" element={<EditarContaReceber />} />
<Route path="/excluir-parcelamento-pagar" element={<ExcluirParcelamentoPagar />} />
 

</Routes>




            
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
 
