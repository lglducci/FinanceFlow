import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Transactions from "../pages/Transactions.jsx";
import Categories from "../pages/Categories.jsx";
import Reports from "../pages/Reports.jsx";
import Settings from "../pages/Settings.jsx";

export default function Layout() {
  const [page, setPage] = useState("dashboard");

  function renderPage() {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "transactions":
        return <Transactions />;
      case "categories":
        return <Categories />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  }

  return (
    <div className="min-h-screen flex bg-bgSoft">
      <Sidebar page={page} setPage={setPage} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">{renderPage()}</main>
      </div>
    </div>
  );
}
