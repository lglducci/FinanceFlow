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
import Visaogeral from './pages/Visaogeral';

// ❌ REMOVE ISSO – NÃO EXISTE
// import ContasPagar from "./pages/ContasPagar";
// import ContasReceber from "./pages/ContasReceber";

// ✅ IMPORTA AS PÁGINAS QUE EXISTEM
import SaldosPorConta from "./pages/SaldosPorConta";
import ConsultaTransacaoCartao from "./pages/ConsultaTransacaoCartao";

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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Lancamentos />} />
              <Route path="/new-transaction" element={<NovoLancamento />} />

              <Route path="/categories" element={<Categories />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />

              {/* ALTERADO */}
              <Route path="/saldos" element={<SaldosPorConta />} />
              <Route path="/cartao-transacoes" element={<ConsultaTransacaoCartao />} />
               <Route path="/nova-conta" element={<NovaConta />} />
              <Route path="/editar-conta" element={<EditarConta />} />
             <Route path="/" element={<Visaogeral />} />
              <Route
                path="/new-payable"
                element={<NovoPagarReceber tipoInicial="pagar" />}
              />
             
              <Route
                path="/new-receivable"
                element={<NovoPagarReceber tipoInicial="receber" />}
              />

                 <Route path="/cards" element={<Cartoes />} />
              
            </Routes>

              



            
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
 
