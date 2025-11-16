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
import ContasPagar from "./pages/ContasPagar";
import ContasReceber from "./pages/ContasReceber";

export default function App() {
  const token = localStorage.getItem("ff_token");

  // Se não estiver logado → mostra Login
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

              <Route path="/payables" element={<ContasPagar />} />
              <Route path="/receivables" element={<ContasReceber />} />

              <Route
                path="/new-payable"
                element={<NovoPagarReceber tipoInicial="pagar" />}
              />
              <Route
                path="/new-receivable"
                element={<NovoPagarReceber tipoInicial="receber" />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
