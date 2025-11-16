 import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./pages/Login";

// Páginas
import Dashboard from "./pages/Dashboard";
import Lancamentos from "./pages/Lancamentos";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const token = localStorage.getItem("ff_token");

  if (!token) {
    return <Login onLogin={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen flex bg-bgSoft">
      <Sidebar page={page} setPage={setPage} />

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6">
          {page === "dashboard" && <Dashboard />}
          {page === "transactions" && <Lancamentos setPage={setPage} />}
          {page === "categories" && <Categories />}
          {page === "reports" && <Reports />}
          {page === "settings" && <Settings />}
          {page === "new-transaction" && (
            <div>Em breve: tela de novo lançamento</div>
          )}
        </main>
      </div>
    </div>
  );
}
