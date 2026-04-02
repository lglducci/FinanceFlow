import { createContext, useContext, useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [empresa, setEmpresa] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [documento, setDocumento] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [email, setMail] = useState(null);
    const [perfil, setPerfil] = useState(localStorage.getItem("perfil"));
  const [loading, setLoading] = useState(true);
 
  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");
   

  useEffect(() => {
    async function carregarDados() {
      if (!empresa_id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          buildWebhookUrl("dados_sessao"), // 🔥 webhook único
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ empresa_id })
          }
        );
          
        const json = await res.json();

        setEmpresa(json.nome_empresa); // { id, nome }
        setUsuario(json.nome); // { id, nome }
        setDocumento(json.documento); // { id, nome }
        setTipo(json.tipo);
        setMail(json.email);
       
      } catch (e) {
        console.error("Erro ao carregar sessão", e);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [empresa_id]);

  return (
    <AppContext.Provider
      value={{
        empresa,
        usuario,
        documento,
        tipo,
        email,
        loading,
        perfil 
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
