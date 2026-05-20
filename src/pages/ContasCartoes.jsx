  import { useEffect, useMemo, useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { buildWebhookUrl } from "../config/globals";
 import { hojeLocal } from "../utils/dataLocal";
 import { useSearchParams } from "react-router-dom";
 
 export default function AppContasCartoes() {
   const navigate = useNavigate();
  const [searchParams] = useSearchParams();
 const id = searchParams.get("id");
   const empresa_id =
     localStorage.getItem("empresa_id") ||
     localStorage.getItem("id_empresa") ||
     "1";
 
   const hoje = hojeLocal();
 
   const [contas, setContas] = useState([]);
   const [cartoes, setCartoes] = useState([]);
 
   const [abaCartao, setAbaCartao] = useState("cartoes");
 const [faturas, setFaturas] = useState([]);
 
   const [carregando, setCarregando] = useState(true);
 
  const [cartaoHistoricoId, setCartaoHistoricoId] = useState("");
 const [faturasHistorico, setFaturasHistorico] = useState([]);
 const [faturaHistoricoId, setFaturaHistoricoId] = useState("");
 const [comprasFatura, setComprasFatura] = useState([]);
  
 
   const fmt = new Intl.NumberFormat("pt-BR", {
     style: "currency",
     currency: "BRL",
   });
 
   async function carregarFaturas() {
   const url = buildWebhookUrl("listasfaturas", {
     empresa_id,
     id: 0,
     status: "aberta",
     mes_referencia: "",
   });
 
   const resp = await fetch(url);
   const json = await resp.json().catch(() => []);
 
   setFaturas(Array.isArray(json) ? json : []);
 }
 
   async function carregarContas() {
     const url = buildWebhookUrl("consultasaldo", {
       inicio: hoje,
       fim: hoje,
       empresa_id,
       conta_id: 0,
     });
 
     const resp = await fetch(url, { method: "GET" });
     const data = await resp.json();
 
     setContas(Array.isArray(data) ? data : []);
   }
 
   async function carregarCartoes() {
     const url = buildWebhookUrl("cartoes", {
       id_empresa: empresa_id,
     });
 
     const resp = await fetch(url, { method: "GET" });
     const data = await resp.json();
 
     const ativos = Array.isArray(data)
       ? data.filter((c) => c.status === "ativo")
       : [];
 
     setCartoes(ativos);
   }
 
   async function carregarTudo() {
     try {
       setCarregando(true);
       await Promise.all([carregarContas(), carregarCartoes()]);
     } catch (e) {
       console.log("Erro AppContasCartoes:", e);
     } finally {
       setCarregando(false);
     }
   }
 
   useEffect(() => {
     carregarTudo();
   }, []);
 
   const totalContas = useMemo(() => {
     return contas.reduce((soma, c) => soma + Number(c.saldo_final || 0), 0);
   }, [contas]);
 
   const totalLimiteCartoes = useMemo(() => {
     return cartoes.reduce((soma, c) => soma + Number(c.limite_total || 0), 0);
   }, [cartoes]);
 
   function valorCor(valor) {
     return Number(valor || 0) >= 0 ? "#16a34a" : "#ef4444";
   }
 
   const tela = {
     minHeight: "100vh",
     background: "linear-gradient(180deg,#eef5fb,#e8f1fa)",
     padding: 16,
     fontFamily: "Arial, sans-serif",
     boxSizing: "border-box",
   };
 
   const topoCard = {
     borderRadius: "0 0 34px 34px",
     background: "#ffffff",
     padding: "24px 20px 28px",
     boxShadow: "0 8px 22px rgba(15,23,42,0.12)",
     margin: "-16px -16px 28px",
   };
 
   const secaoTitulo = {
     fontSize: 22,
     color: "#4b5563",
     fontWeight: 800,
     margin: "26px 0 12px",
   };
 
   const card = {
     background: "#ffffff",
     borderRadius: 28,
     padding: 20,
     boxShadow: "0 10px 28px rgba(15,23,42,0.12)",
     border: "1px solid rgba(148,163,184,0.25)",
   };
 
 const linhaSemAcao = {
  display: "grid",
  gridTemplateColumns: "34px 1fr",
  gap: 2,
  alignItems: "center",
  padding: "4px 0",
};
 
 const icone = {
  width: 20,
  height: 20,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  background: "#eef2ff",
};
 
   const botaoEditarPequeno = {
   marginTop: 6,
   border: 0,
   borderRadius: 999,
   padding: "5px 12px",
   background: "#e0f2fe",
   color: "#0369a1",
   fontWeight: 900,
   fontSize: 12,
 };
 
 useEffect(() => {
   if (id) {
     carregarCartao(id);
   }
 }, [id]);
 
 
 async function carregarHistoricoFaturas(cartaoId) {
   setCartaoHistoricoId(cartaoId);
   setFaturaHistoricoId("");
   setComprasFatura([]);
 
   const url = buildWebhookUrl("historicofaturas", {
     empresa_id,
     id: cartaoId || 0,
     status: "",
     mes_referencia: "",
   });
 
   const resp = await fetch(url);
   const json = await resp.json().catch(() => []);
 
   setFaturasHistorico(Array.isArray(json) ? json : []);
 }
 
 async function carregarComprasFatura(faturaId) {
   setFaturaHistoricoId(faturaId);
 
   const url = buildWebhookUrl("transacoes_fatura", {
     empresa_id,
     fatura_id: faturaId,
   });
 
   const resp = await fetch(url);
   const json = await resp.json().catch(() => []);
 
   setComprasFatura(Array.isArray(json) ? json : []);
 }
 
   return (
     <div style={tela}>
       <div style={topoCard}>
         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
           <button
             onClick={() => navigate("/app/configuracoes")}
             style={{
               border: 0,
               background: "transparent",
               fontSize: 24,
               fontWeight: 900,
               color: "#1e293b",
             }}
           >
             ←
           </button>
 
           <div style={{ fontSize: 22, fontWeight: 900, color: "#1e1b4b" }}>
             Contas e Cartões
           </div>
 
           <button
             onClick={carregarTudo}
             style={{
               border: 0,
               width: 42,
               height: 42,
               borderRadius: "50%",
               background: "linear-gradient(135deg,#7c3aed,#4c1d95)",
               color: "#fff",
               fontSize: 18,
               fontWeight: 900,
             }}
           >
             ↻
           </button>
         </div>
 
         <div style={{ marginTop: 26, textAlign: "center" }}>
           <div style={{ color: "#7c7a90", fontSize: 18, fontWeight: 800 }}>
             Saldo em contas
           </div>
 
           <div
             style={{
               marginTop: 10,
               color: valorCor(totalContas),
               fontSize: 26,
               fontWeight: 900,
             }}
           >
             {carregando ? "Carregando..." : fmt.format(totalContas)}
           </div>
         </div>
       </div>
       
       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
   <div style={secaoTitulo}>Contas</div>
 
   <button
     onClick={() => navigate("/app/nova-conta")}
     title="Nova conta"
     style={{
       width: 38,
       height: 38,
       borderRadius: "50%",
       border: 0,
       background: "linear-gradient(135deg,#7c3aed,#4c1d95)",
       color: "#fff",
       fontSize: 22,
       lineHeight: "30px",
       fontWeight: 300,
       boxShadow: "0 8px 18px rgba(124,58,237,0.35)",
     }}
   >
     +
   </button>
 </div>
 
       <div style={card}>
         {contas.slice(0, 4).map((c, idx) => (
           <div key={idx} style={linhaSemAcao}>
             <div style={icone}>🏦</div>
 
             <div>
               <div style={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b" }}>
                 {c.conta_nome}
               </div>
               <div style={{ marginTop: 4, fontSize: 13, fontWeight: 900, color: valorCor(c.saldo_final) }}>
                 {fmt.format(Number(c.saldo_final || 0))}
               </div>
               <button
                   onClick={() =>
                     navigate("/app/editar-conta", {
                       state: {
                         ...c,
                         id: c.id ?? c.conta_id ?? c.id_conta,
                         empresa_id: c.empresa_id ?? empresa_id,
                       },
                     })
                   }
                   style={botaoEditarPequeno}
                 >
                   ✏️ Editar
                 </button>
             </div>
 
             
           </div>
         ))}
 
         {contas.length === 0 && (
           <div style={{ color: "#64748b", fontWeight: 700 }}>
             Nenhuma conta encontrada.
           </div>
         )}
 
         <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 10, paddingTop: 18, display: "flex", justifyContent: "space-between" }}>
           <span style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b" }}>Total</span>
           <span style={{ fontSize: 18, fontWeight: 900, color: valorCor(totalContas) }}>
             {fmt.format(totalContas)}
           </span>
         </div>
       </div>
 
       <div style={secaoTitulo}>Cartões de crédito</div>
 
       <div style={card}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
   <button
 
   onClick={() => setAbaCartao("cartoes")}
     style={{
       border: 0,
       borderRadius: 999,
       padding: "10px 18px",
       background: abaCartao === "cartoes" ? "#14b8a6" : "#e5e7eb",
        color: abaCartao === "cartoes" ? "#fff" : "#475569",
       fontWeight: 900,
       fontSize: 12,
     }}
   >
     Cartões ativos
   </button>
 
   <button
 
    onClick={() => {
     setAbaCartao("faturas");
     carregarFaturas();
   }}
  
     style={{
       border: 0,
       borderRadius: 999,
       padding: "10px 18px",
       background: abaCartao === "faturas" ? "#14b8a6" : "#e5e7eb",
         color: abaCartao === "faturas" ? "#fff" : "#475569",
       fontWeight: 900,
       fontSize: 12,
     }}
   >
     Faturas Abertas
   </button>
 
      <button
                   onClick={() => setAbaCartao("historico")}
                   style={{
                     border: 0,
                     borderRadius: 999,
                     padding: "10px 18px",
                     background: abaCartao === "historico" ? "#14b8a6" : "#e5e7eb",
                     color: abaCartao === "historico" ? "#fff" : "#475569",
                     fontWeight: 900,
                     fontSize: 12,
                   }}
                 >
                   🕘 Histórico Faturas
                 </button>
 
 
   <button
     onClick={() => navigate("/app/new-card")}
     title="Novo cartão"
     style={{
       width: 38,
       height: 38,
       borderRadius: "50%",
       border: 0,
       background: "linear-gradient(135deg,#14b8a6,#0f766e)",
       color: "#fff",
       fontSize: 22,
       lineHeight: "30px",
       fontWeight: 300,
       boxShadow: "0 8px 18px rgba(20,184,166,0.35)",
     }}
   >
     +
   </button>
 </div>   
 {abaCartao === "cartoes" && (
   <>
     { cartoes.map((c) => (
       <div key={c.id} style={linhaSemAcao}> 
         
             <div style={{ ...icone, background: "#f8fafc" }}>
               {String(c.bandeira || "").toLowerCase().includes("visa") ? "💳" : "💳"}
             </div>
 
             <div>
               <div style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b" }}>
                 {c.nome}
               </div>
               <div style={{ marginTop: 4, fontSize: 12, color: "#94a3b8", fontWeight: 800 }}>
                 {c.bandeira || "Cartão"} • vence dia {c.vencimento_dia || "-"}
               </div>
               <div style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: "#ef4444" }}>
                 Limite {fmt.format(Number(c.limite_total || 0))}
               </div>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                 <button
                   onClick={() => navigate(`/app/edit-card/${c.id}`)}
                   style={botaoEditarPequeno}
                 >
                   ✏️ Editar
                 </button>
 
                {/*} <button
                   onClick={() =>  navigate(`/app/faturas-cartao?id=${c.id}`)}
                   style={{
                     ...botaoEditarPequeno,
                     background: "#ebebeb",
                     color: "#141414",
                   }}
                 >
                   🕘 Acessar Faturas
                 </button>*/}
 
               
               </div>
             </div>
                </div>
           
     ))}
   </>
 )}
 
 
         {abaCartao === "faturas" && (
           <>
             {faturas.length === 0 && (
               <div style={{ color: "#64748b", fontWeight: 700 }}>
                 Nenhuma fatura aberta encontrada.
               </div>
             )}
 
             {faturas.map((f) => (
               <div key={f.id} style={linhaSemAcao}>
                 <div style={{ ...icone, background: "#fff7ed" }}>💳</div>
 
                 <div>
                   <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b" }}>
                     {f.nome}
                   </div>
 
                   <div style={{ marginTop: 4, fontSize: 12, color: "#94a3b8", fontWeight: 800 }}>
                     {f.bandeira || "Cartão"} • {f.status}
                   </div>
 
                   <div style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: "#ef4444" }}>
                     {fmt.format(Number(f.valor_total || 0))}
                   </div>
 
                {/*}   <button
                     //onClick={() => navigate(`/fatura-transacoes?id=${f.id}&empresa=${empresa_id}`)}
 
                     onClick={() => navigate(`/app/fatura-transacoes?id=${id}&empresa=${empresa_id}`) }
                     style={botaoEditarPequeno}
                   >
                     👁️ Visualizar
                   </button>*/}
 
                 
 
                 </div>
               </div>
             ))}
           </>
         )}
 
 
           {abaCartao === "historico" && (
             <div style={{ display: "grid", gap: 12 }}>
               <select
                 value={cartaoHistoricoId}
                 onChange={(e) => carregarHistoricoFaturas(e.target.value)}
                 style={{
                   width: "100%",
                   border: "1px solid #cbd5e1",
                   borderRadius: 14,
                   padding: "10px 12px",
                   fontWeight: 800,
                 }}
               >
                 <option value="">Escolha o cartão</option>
                 {cartoes.map((c) => (
                   <option key={c.id} value={c.id}>
                     {c.nome}
                   </option>
                 ))}
               </select>
 
               <select
                 value={faturaHistoricoId}
                 onChange={(e) => carregarComprasFatura(e.target.value)}
                 disabled={!cartaoHistoricoId}
                 style={{
                   width: "100%",
                   border: "1px solid #cbd5e1",
                   borderRadius: 14,
                   padding: "10px 12px",
                   fontWeight: 800,
                 }}
               >
                 <option value="">Escolha a fatura</option>
                   {faturasHistorico
                         .filter((f) => f && f.id)
                         .map((f) => {
                           const dataRef = f.mes_referencia
                             ? new Date(f.mes_referencia).toLocaleDateString("pt-BR", {
                                 month: "long",
                                 year: "numeric",
                               })
                             : "";
 
                           const valor =
                             Number(f.valor_total || 0) > 0
                               ? ` - ${fmt.format(Number(f.valor_total || 0))}`
                               : "";
 
                           const status = f.status ? ` - ${f.status}` : "";
 
                           return (
                             <option key={f.id} value={f.id}>
                               {dataRef}{status}{valor}
                             </option>
                           );
                         })}
               </select>
 
               {comprasFatura.map((t) => (
                 <div key={t.id} style={linhaSemAcao}>
                   <div style={{ ...icone, background: "#eef2ff" }}>🧾</div>
 
                   <div>
                     <div style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b" }}>
                       {t.descricao}
                     </div>
 
                     <div style={{ marginTop: 4, fontSize: 12, color: "#64748b", fontWeight: 800 }}>
                       {new Date(t.data_parcela).toLocaleDateString("pt-BR")} • Parcela{" "}
                       {t.parcela_num}/{t.parcela_total}
                     </div>
 
                     <div style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: "#ef4444" }}>
                       {fmt.format(Number(t.valor || 0))}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
 
 
         {cartoes.length === 0 && (
           <div style={{ color: "#64748b", fontWeight: 700 }}>
             Nenhum cartão ativo encontrado.
           </div>
         )}
 
         <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 10, paddingTop: 18, display: "flex", justifyContent: "space-between" }}>
           <span style={{ fontSize: 16, fontWeight: 800, color: "#1e1b4b" }}>Limite total</span>
           <span style={{ fontSize: 16, fontWeight: 900, color: "#1e1b4b" }}>
             {fmt.format(totalLimiteCartoes)}
           </span>
         </div>
       </div>
     </div>
   );
 }