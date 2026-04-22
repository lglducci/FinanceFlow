import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal, hojeMaisDias } from "../utils/dataLocal";
 import FormCategoria from "../components/forms/FormCategoria";
import FormFornecedorModal from "../components/forms/FormFornecedorModal"; 
import ModalBase from "../components/ModalBase";
import  FormModeloContabil from "../components/forms/FormModeloContabil";


export default function NovaContaReceber() {
  const navigate = useNavigate();
  const empresa_id = Number(localStorage.getItem("empresa_id") || localStorage.getItem("id_empresa"));
   const [contas, setContas] = useState([]);

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
     data: hojeMaisDias(1),
    vencimento: hojeMaisDias(1),
    categoria_id: "",
    fornecedor_id: "",
    parcelas: 1,
    parcela_num: 1,
    status: "aberto",
    doc_ref:"",
    contabil_id: 0 ,
    modelo_codigo:"",
    classificacao:"receita"
  });

  
const [modalFornecedor, setModalFornecedor] = useState(false);
const [modalCategoria, setModalCategoria] = useState(false);
const [modelos, setModelos] = useState([]);
const [modeloCodigo, setModeloCodigo] = useState("");
const [modalModelo, setModalModelo] = useState(false);
const [aba, setAba] = useState("principal"); 
const [modeloSelecionado, setModeloSelecionado] = useState(null);
 const [linhas, setLinhas] = useState([]);  
  /* 🎨 Tema azul coerente com Login/KDS (fora escuro, dentro mais claro) */
const THEME = {
  pageBg: "#0e2a3a",                 // fundo da página (escuro)
  panelBg: "#1e40af",                // fundos auxiliares (se precisar) panelBg: "#4a88a9ff",   
  panelBorder: "rgba(255,159,67,0.30)",

  cardBg: "#254759",                 // bloco interno mais claro
  cardBorder: "rgba(255,159,67,0.35)",
  cardShadow: "0 6px 20px rgba(0,0,0,0.25)",

  title: "#ff9f43",
  text: "#e8eef2",
  textMuted: "#bac7cf",

  fieldBg: "#1f3b4d",                // inputs (um tom acima do card)
  fieldBorder: "rgba(255,159,67,0.25)",
  focusRing: "#ff9f43",

  btnPrimary: "#ff9f43",
  btnPrimaryText: "#1b1e25",
  btnSecondary: "#ef4444",
  btnSecondaryText: "#ffffff",
};


  const [fornecedores, setFornecedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [salvando, setSalvando] = useState(false);

  const modo = (() => { 
 
  if (form.forma_recebimento === "cartao_credito")
    return "receber_cartao";

  if (["boleto","aprazo"].includes(form.forma_recebimento))
    return "receber";

  return "financeiro";
 

   
})();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // =======================================================
  //     CARREGAR FORNECEDORES  (tipo = fornecedor)
  // =======================================================
  async function carregarFornecedores() {
    try {
      const url = buildWebhookUrl("fornecedorcliente", {
        empresa_id,
        tipo: "cliente",
      });

      const resp = await fetch(url);
      const txt = await resp.text();

      let lista = [];
      try {
        lista = JSON.parse(txt);
      } catch {}

      setFornecedores(Array.isArray(lista) ? lista : []);
    } catch (e) {
      console.log("ERRO ao carregar fornecedores:", e);
    }
  }

  // =======================================================
  //     CARREGAR CATEGORIAS (já existe webhook em outra janela)
  // =======================================================
  async function carregarCategorias() {
    try {
      const url = buildWebhookUrl("listacategorias", { empresa_id , tipo:'entrada'});
      const resp = await fetch(url);
      const txt = await resp.text();

      let lista = [];
      try {
        lista = JSON.parse(txt);
      } catch {}

      setCategorias(Array.isArray(lista) ? lista : []);
    } catch (e) {
      console.log("ERRO ao carregar categorias:", e);
    }
  }

  // =======================================================
  useEffect(() => {
    carregarFornecedores();
    carregarCategorias();
  }, []);

  // =======================================================
  //                  SALVAR NOVA CONTA
  // =======================================================
   async function salvar() {
  try {
    setSalvando(true);

      const hoje = hojeMaisDias(0);
         
              // ================== VALIDAÇÕES ==================
          if (!form.descricao.trim()) {
            alert("Descrição é obrigatória.");
            return;
          }

          if (!form.valor || Number(form.valor) <= 0) {
            alert("Informe um valor maior que zero.");
            return;
          }

          if (!Number.isFinite(Number(form.categoria_id)) || Number(form.categoria_id) <= 0) {
            alert("Categoria é obrigatória.");
            return;
          }

          if (!form.fornecedor_id) { 
            alert("Fornecedor é obrigatório.");
            return;
          }

          if (!form.doc_ref.trim()) {
            alert("Documento é obrigatório.");
            return;
          }

          if (!form.parcelas || Number(form.parcelas) < 1) {
            alert("Número de parcelas inválido.");
            return;
          }

          // vencimento já tratado, mas reforçando
          
          if (form.vencimento <= hoje) {
            alert("Vencimento deve ser maior que hoje.");
            return;
          }

          
          
    const url = buildWebhookUrl("novacontareceber");
 
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        descricao: form.descricao,
        valor: Number(form.valor),
        data:  form.data,
        vencimento: form.vencimento,
        categoria_id: Number(form.categoria_id) ,
        fornecedor_id: Number(form.fornecedor_id) || null,
        forma_recebimento: form.forma_recebimento || null,
        parcelas: Number(form.parcelas),
        parcela_num: Number(form.parcela_num),
        status: form.status,
        doc_ref: form.doc_ref,
        contabil_id:form.contabil_id,
        codigo:modeloCodigo,
        classificacao:form.classificacao,
        modelo_codigo:modeloCodigo 
      })
    });

    // 👇 AQUI É A CURA DO PROBLEMA
    const json = await resp.json().catch(() => ({}));

    const sucesso =
      (Array.isArray(json) && json.length > 0) ||
      json?.id ||
      json?.success === true;

    if (sucesso) {
      alert("Conta a Receber cadastrada com sucesso!");
      window.dispatchEvent(new Event("contabil-atualizado"));
      navigate("/contas-receber");
      return;
    }

    alert(json?.message || "Erro ao salvar.");
  } catch (e) {
    console.log("ERRO SALVAR:", e);
    alert("Erro ao salvar.");
  } finally {
    setSalvando(false);
  }
}
 
  async function carregarModelos() {
  try {
    const r = await fetch(
      buildWebhookUrl("modelos", { empresa_id, tipo_evento:modo ,sistema:false,  
 classificacao: form.classificacao  })
    );
    const j = await r.json();
    setModelos(Array.isArray(j) ? j : []);
  } catch (e) {
    console.error("Erro ao carregar modelos", e);
    setModelos([]);
  }
}

 useEffect(() => {
  if (form.classificacao) {
    carregarModelos();
  }
}, [empresa_id, modo, form.classificacao]);


useEffect(() => {
  // limpa seleção atual
  setModeloCodigo("");
  setModeloSelecionado(null);
  setLinhas([]);

  // limpa dentro do form também
  setForm(prev => ({
    ...prev,
    modelo_codigo: "",
    modelo_id: null
  }));

  // recarrega modelos novos
  if (form.classificacao) {
    carregarModelos();
  }

}, [form.forma_recebimento, form.classificacao]);



  function getHelperTexto(tipo) {
  switch (tipo) {
    case 'CP':
      return "Conta a Pagar: o crédito deve ser Passivo (2.1.x) e o débito pode ser Estoque, Despesa ou Imobilizado.";
    case 'CR':
      return "Conta a Receber: o débito deve ser Clientes (1.1.x) e o crédito Receita (5.x).";
    case 'CX':
      return "Movimento de Caixa: envolve Banco/Caixa e baixa de Cliente ou Fornecedor.";
    case 'IM':
      return "Imobilizado: débito em 1.2.x (bem durável) e crédito em Fornecedores (2.1.x).";
    default:
      return "Selecione as contas conforme sua estrutura contábil.";
  }
}
 

 
  async function carregarDadosLinhas(modeloId) {
  try {
    const url = buildWebhookUrl("modelos_linhas", {
      empresa_id,
      modelo_id: modeloId,
    });

    const resp = await fetch(url);
    const dados = await resp.json();
    setLinhas(Array.isArray(dados) ? dados : []);
  } catch (e) {
    console.log("ERRO:", e);
    setLinhas([]);
  }
}

  return (
 
  <div className="min-h-screen py-6 px-4 bg-bgSoft">
        <div className="w-full max-w-3xl mx-auto rounded-3xl p-2 shadow-xl bg-[#061f4aff]   mt-1 mb-1" >  

        <h1
        className="text-2xl md:text-3xl font-bold mb-6 text-center"
        style={{ color: THEME.title }}
      >
        ✏️ Nova Conta a Receber
      </h1>

      <div className="bg-white p-5 rounded-xl shadow flex flex-col gap-4"> 

      <div className="flex border-b mb-4"> 
          <button
            onClick={() => setAba("principal")}
            className={`px-4 py-2 font-semibold ${
              aba === "principal"
                ? "border-b-2 border-[#ff9f43] text-[#ff9f43]"
                : "text-gray-500"
            }`}
          >
            Principal
          </button>

          <button
            onClick={() => setAba("contabil")}
            className={`px-4 py-2 font-semibold ${
              aba === "contabil"
                ? "border-b-2 border-[#ff9f43] text-[#ff9f43]"
                : "text-gray-500"
            }`}
          >
            Customização Contábil
          </button> 
       </div>

       {aba === "principal" && (
  <>
     
        {/* DESCRIÇÃO */}
        <div>
            <div className="w-4/5"> 
          <label   className="label label-required" >Descrição</label>
          <input
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            className="input-premium w-64"
            placeholder="descricao"
          />
        </div>
          </div>

              <div className="w-2/3"> 
                    <label   className="label label-required">Data</label>
                    <input
                      type="date"
                      min={hojeMaisDias(-7)}
                      name="data"
                      value={form.data}
                      onChange={handleChange}
                      className="input-premium w-24"
                      placeholder="data"
                    />
        </div>
              <div>
                <label className="label label-required font-bold text-[#1e40af]">
                  Forma de Recebimento
                </label>

                <select
                  name="forma_recebimento"
                  value={form.forma_recebimento || ""}
                  onChange={handleChange}
                  className="input-premium w-full"
                >
                  <option value="">Selecione</option>  
                  <option value="cartao_credito">Cartão Crédito</option> 
                    <option value="aprazo">A prazo</option>
                </select>
              </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
        {/* CATEGORIA */}
        <div>
            <div className="w-2/3"> 
          <label   className="label label-required" >Categoria</label>
          
                  <select
                    name="categoria_id"
                    value={form.categoria_id}
                    onChange={(e) => {
                      if (e.target.value === "__nova__") {
                        setModalCategoria(true);
                        return;
                      }
                      handleChange(e);
                    }}
                    className="input-premium"
                  >
                    <option value="">Selecione</option>

                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}

                    <option value="__nova__">
                      ➕ Nova Categoria
                    </option>
                  </select>
        </div>
         </div>
          
        {/* FORNECEDOR */}
        <div>
          <div className="w-2/3"> 
          <label   className="label label-required" >Fornecedor/Cliente</label>
                  <select
                name="fornecedor_id"
                value={String(form.fornecedor_id || "")}
                onChange={(e) => {
                  const v = e.target.value;

                  if (v === "__novo__") {
                    setModalFornecedor(true);
                    return;
                  }

                  setForm(prev => ({ ...prev, fornecedor_id: v }));
                }}
                className="input-premium w-full"
              >
                <option value="">Nenhum</option>

                {fornecedores.map((f) => (
                  <option key={f.id} value={String(f.id)}>
                    {f.nome}
                  </option>
                ))}

                <option value="__novo__">➕ Novo Fornecedor / Cliente</option>
              </select>
        </div>
        </div>
         </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
        {/* VALOR */}
        <div>
           <div className="w-1/2"> 
          <label   className="label label-required" >Valor</label>
          <input
            type="number"
            name="valor"
            value={form.valor}
            onChange={handleChange}
            className="input-premium w-64"
            placeholder="00,00"
          />
        </div>
         </div>
    
        {/* VENCIMENTO */}
        <div>
            <div className="w-2/3"> 
              <label   className="label label-required">Vencimento</label>
              <input
                type="date"
                min={hojeMaisDias(1)}
                name="vencimento"
                value={form.vencimento}
                onChange={handleChange}
                className="input-premium w-24"
                placeholder="vencto"
              />
        </div>
         </div>
         </div>  
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
         
        {/* PARCELAS */}
        <div>
            
          <div className="w-2/5"> 
          <label   className="label label-required">Parcelas</label>
          <input
            type="number"
            name="parcelas"
            min="1"
            value={form.parcelas}
            onChange={handleChange}
            className="input-premium w-24"
            placeholder="parcelas"
          />
        </div>
         </div>
          <div className="w-2/4"> 
          <label   className="label label-required">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input-premium w-24"
            placeholder="status"
          >
            <option value="aberto">Aberto</option>
            <option value="recebido">Recebido</option>
          </select>
        </div>

 
      </div> 

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
        {/* STATUS */}
        <div>
          

        
            {/* Numero documento ou nota fiscal  */}
        <div>
          <div className="w-2/3"> 
                  <label  className="label label-required">Documento</label>
                  <input
                  name="doc_ref"
                  value={form.doc_ref}
                  onChange={handleChange}
                  className="input-premium w-64"
                  placeholder="Nro Documento"
                />
            </div> 
         </div> 
        </div>
            

           {/* cLASSIFICAAO  */}
          
          </div>

           <div >
            <div className="w-4/5">
                  <label className="label label-required">Classificação</label>
                  <select
                  name="classificacao"
                  value={form.classificacao}
                  onChange={handleChange}
                  className="input-premium w-64"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="receita">Receita</option>
                  <option value="ativo">Ativo</option> 
                </select>
            </div>
          </div>
    
                      </>
                      )}

                     {aba === "contabil" && (
                         <div  > 

                            <div className="mt-2 mb-4 text-xs bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-slate-800"> 
                                <div><b>tipo_evento:</b> {modo ?? "null"}</div>
                              <div><b>tipo_es:</b> { "Entrada"}</div>
                              <div><b>classificacao:</b> {form.classificacao ?? "null"}</div>
                            </div>
                    <label className="font-bold text-[#1e40af] flex items-center gap-2">
                        Modelo Contábil  
                        <span className="relative group cursor-pointer">
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                            ?
                          </span>

                          {/* Tooltip */}
                            <div className="absolute left-6 top-0 z-50 hidden group-hover:block 
                                            bg-gray-900 text-white text-xs rounded-lg p-3 w-80 shadow-lg">
                              <strong>O que é este campo?</strong>
                              <p className="mt-1">
                                Este campo define a <b>conta contábil onde será registrado o direito a receber</b>.
                              </p>
                              <p className="mt-1">
                                Normalmente corresponde a contas do <b>Ativo Circulante (1.1.X – Clientes ou Duplicatas a Receber)</b>.
                              </p>
                            </div>

                        </span>
                      </label> 
                        <div className="flex items-center gap-2"> 
                              <input
                                list="tokens"
                                className="input-premium w-full"
                                placeholder="Digite ou selecione o token"
                                value={modeloCodigo}
                               onChange={(e) => {
                                    const valor = e.target.value; 
                                    setModeloCodigo(valor); 
                                    const modeloSelecionado = modelos.find(
                                      (m) => m.codigo === valor
                                    ); 
                                    if (modeloSelecionado) {
                                      setForm(prev => ({
                                        ...prev,
                                        modelo_codigo: valor,
                                        modelo_id: modeloSelecionado.id
                                      })); 
                                      carregarDadosLinhas(modeloSelecionado.id);
                                      setModeloSelecionado(modeloSelecionado);
                                    }
                                  }}                           
                              />

                              <datalist id="tokens">
                                {modelos.map((m) => (
                                  <option key={m.id} value={m.codigo}>
                                    {m.codigo}
                                  </option>
                                ))}
                              </datalist> 
                                  <button
                                  type="button"
                                  onClick={() => {
                                    console.log("CLICOU MODELO");
                                    setModalModelo(true);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center rounded bg-[#061f4a] text-white text-sm"
                                >
                                  ➕  
                                </button>  
                          </div>  

                 
                        {/* ===== TABELA ===== */}
                    <div className="bg-white rounded-xl shadow-sm p-4">
                      <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-100 text-gray-700">
                          <tr> 
                            <th className="p-2 text-left">Código</th>
                            <th className="p-2 text-left">Nome</th>
                            <th className="p-2 text-left">Tipo</th>
                            <th className="p-2 text-left">Natureza</th>
                            <th className="p-2 text-center">D/C</th>
                          </tr>
                        </thead>

                        <tbody> 
                          {Array.isArray(linhas) && linhas.map((l, i) => (
                        
                            <tr
                              key={i}
                              className={i % 2 === 0 ? "bg-gray-300" : "bg-gray-250"}
                            >  
                              <td className="p-2">{l.codigo}</td>
                              <td className="p-2">{l.nome}</td>
                              <td className="p-2">{l.tipo}</td>
                              <td className="p-2">{l.natureza}</td>
                              <td className="p-2 text-center font-bold">{l.dc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div> 
                        
                    </div>
                    )} 
              {/* BOTÕES */}
                  <div className="flex gap-6 pt-8 pb-8 pl-1">
                <button
                  onClick={salvar}
                  disabled={salvando}
                  className="flex-1 bg-[#061f4aff] text-white px-4 py-3 rounded font-semibold"
                >
                  {salvando ? "Salvando..." : "Salvar"}
                </button>

                <button
                  onClick={() => navigate("/contas-receber")}
                  className="flex-1 bg-gray-500 text-white px-4 py-3 rounded font-semibold"
                >
                  Cancelar
                </button>
              </div>
                </div>
            </div>
           <FormCategoria
        open={modalCategoria}
        onClose={() => setModalCategoria(false)}
        empresa_id={empresa_id}
        tipo={'entrada'}
        onCategoriaCriada={(nova) => {
          setCategorias(prev => [nova, ...prev]);
          setForm(prev => ({
            ...prev,
            categoria_id: nova.id
          }));
        }}
      />
        
        <ModalBase
          open={modalFornecedor}
          onClose={() => setModalFornecedor(false)}
          title="Novo Fornecedor / Cliente"
        >
          <FormFornecedorModal
            empresa_id={empresa_id} 
             tipo="cliente"   // 👈 AQUI
            onSuccess={(novo) => {
              setFornecedores(prev => [novo, ...prev]);

              setForm(prev => ({
                ...prev,
                fornecedor_id: String(novo.id)
              }));

              setModalFornecedor(false);
            }}
            onCancel={() => setModalFornecedor(false)}
          />
        </ModalBase>

           <ModalBase
          open={modalModelo}
          onClose={() => setModalModelo(false)}
          title="Novo Modelo"
        >
          <FormModeloContabil
             empresa_id={empresa_id}
              tipo_evento={modo}   // <-- AQUI
              tipo_es="entrada"
              classificacao={form.classificacao}
            onSuccess={() => {
              setModalModelo(false);
              carregarModelos();
            }} 

            onCancel={() => setModalModelo(false)}
          />
        </ModalBase>






    </div>
  );
}
