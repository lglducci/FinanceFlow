 
import { useRef, useState } from "react";
import { PluggyConnect } from "react-pluggy-connect";
import { buildWebhookUrl } from "../config/globals";
 

 

export default function ConectarBancoModal({
  onClose,
  onSuccess,
  conta,
  empresaId
}) {


  const [connectToken, setConnectToken] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
const itemSalvandoRef = useRef(null);
 
  async function conectarBanco() {
  try {
    if (!empresaId) {
      throw new Error("Empresa não identificada.");
    }

    if (!conta?.conta_id) {
      throw new Error("Conta financeira não identificada.");
    }

    setCarregando(true);
    setErro("");

   const response = await fetch(
  buildWebhookUrl("pluggy-connect-token"),
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      empresa_id: empresaId,
      conta_id: conta?.conta_id,
    }),
  }
);

      const data = await response.json();

      if (!data.accessToken) {
        throw new Error("AccessToken não retornado.");
      }

      setConnectToken(data.accessToken);

    } catch (err) {
      console.error(err);
      setErro("Não foi possível iniciar a conexão com o banco.");
    } finally {
      setCarregando(false);
    }
  }

  /*function sucessoPluggy(itemData) {
    console.log("PLUGGY CONECTADO:", itemData);

    setConnectToken(null);

    alert("Conta conectada com sucesso!");
  }*/

 async function sucessoPluggy({ item }) {
  const itemId = item?.id;

  if (!itemId) {
    setErro("A Pluggy concluiu a conexão, mas não retornou o Item ID.");
    return;
  }

  // Evita duas chamadas simultâneas para o mesmo item.
  if (itemSalvandoRef.current === itemId) {
    return;
  }

  itemSalvandoRef.current = itemId;

  const conexaoPendente = {
    empresa_id: Number(empresaId),
    conta_id: Number(conta?.conta_id),
    item_id: itemId,
  };

  console.log("CONEXÃO RECEBIDA DA PLUGGY:", conexaoPendente);

  // Guarda antes de chamar o backend.
  localStorage.setItem(
    "pluggy_conexao_pendente",
    JSON.stringify(conexaoPendente)
  );

  try {
    const response = await fetch(
      buildWebhookUrl("pluggy-salvar-conexao"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conexaoPendente),
      }
    );

    const retornoBruto = await response.json();

    // n8n pode responder objeto ou array.
    const primeiro = Array.isArray(retornoBruto)
      ? retornoBruto[0]
      : retornoBruto;

    // Trata também quando o Supabase devolve o JSON
    // dentro do nome da função.
 
    const resultado =
  primeiro?.ff_salvar_conexao_pluggy ??
  primeiro?.resultado ??
  primeiro;

  
    console.log("RETORNO DO SALVAMENTO:", resultado);

    if (!response.ok || resultado?.ok !== true) {
      const erroSalvamento = new Error(
        resultado?.mensagem ||
          "A conexão foi criada, mas não pôde ser validada."
      );

      erroSalvamento.acao = resultado?.acao;
      erroSalvamento.tipo = resultado?.tipo_erro;

      throw erroSalvamento;
    }

    // Só remove quando realmente recebeu ok:true.
    localStorage.removeItem("pluggy_conexao_pendente");

    setConnectToken(null);
    setErro("");

    alert(
      resultado?.mensagem ||
        "Conta conectada e salva com sucesso!"
    );

    // Atualiza a tela de contas.
    onSuccess?.(resultado);

    onClose?.();

  } catch (err) {
    console.error("ERRO AO VALIDAR/SALVAR CONEXÃO:", err);

    setConnectToken(null);

    /*
      Se o n8n já excluiu o item divergente da Pluggy,
      não podemos tentar salvá-lo novamente.
    */
    if (err.acao === "EXCLUIR_ITEM_PLUGGY") {
      localStorage.removeItem("pluggy_conexao_pendente");
    }

    /*
      Se a ação for TENTAR_SALVAR_NOVAMENTE,
      mantém no localStorage.
    */
    setErro(
      err.message ||
        `A conexão foi criada, mas não foi salva. Item ID: ${itemId}`
    );

  } finally {
    itemSalvandoRef.current = null;
  }
}




  return (
    <>
      <div style={styles.overlay}>
        <div style={styles.modal}>
          
          <button
            onClick={onClose}
            style={styles.fechar}
          >
            ×
          </button>

          <h2 style={styles.titulo}>
            Conectar conta bancária
          </h2>

          <p style={styles.texto}>
            Conecte sua conta bancária para importar os movimentos
            automaticamente para o FinanceFlow.
          </p>

          {erro && (
            <div style={styles.erro}>
              {erro}
            </div>
          )}

          <button
            onClick={conectarBanco}
            disabled={carregando}
            style={styles.botao}
          >
            {carregando
              ? "Conectando..."
              : "Conectar banco"}
          </button>

        </div>
      </div>

      {connectToken && (
        <PluggyConnect
          connectToken={connectToken}
          onSuccess={sucessoPluggy}
          onClose={() => setConnectToken(null)}
        />
      )}
    </>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },

  modal: {
    width: "420px",
    background: "#0F172A",
    borderRadius: "12px",
    padding: "28px",
    position: "relative",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
  },

  titulo: {
    margin: "0 0 12px 0",
    color: "#FFFFFF",
    fontSize: "20px",
    fontWeight: "600",
  },

  texto: {
    color: "#CBD5E1",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "22px",
  },

  botao: {
    width: "100%",
    background: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    padding: "11px 16px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  fechar: {
    position: "absolute",
    right: "15px",
    top: "10px",
    background: "transparent",
    border: "none",
    color: "#94A3B8",
    fontSize: "25px",
    cursor: "pointer",
  },

  erro: {
    background: "#7F1D1D",
    color: "#FECACA",
    padding: "9px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    marginBottom: "15px",
  },
};