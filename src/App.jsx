 import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Lancamentos from "./pages/Lancamentos";
import NovoLancamento from "./pages/NovoLancamento";
import Categorias from "./pages/Categorias";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";

export default function App() {
  const token = localStorage.getItem("ff_token");

  if (!token) return <Login onLogin={() => window.location.reload()} />;

  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lancamentos" element={<Lancamentos />} />
            <Route path="/novo-lancamento" element={<NovoLancamento />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
