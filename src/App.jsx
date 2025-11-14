import { useEffect, useState } from "react";
import Login from "./pages/Login.jsx";
import Layout from "./components/Layout.jsx";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("ff_token");
    if (token) setLoggedIn(true);
  }, []);

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return <Layout />;
}
