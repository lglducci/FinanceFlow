 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from '../config/globals';

export default function NovoLancamento() {
  const navigate = useNavigate();   

  const empresa_id = localStorage.getItem("empresa_id") || "1";

  const [form, setForm] = useState({
    id: "",
    empresa_id: empresa_id,
    categoria_id: "",
    conta_id: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    descricao: "",
    tipo: "saida",
  });

  const [categorias, setCategorias] = useState([]);
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
  carregarCategorias();
}, [form.tipo, empresa_id]);  // <-- AGORA ATUALIZA QUANDO TIPO MUDA

useEffect(() => {
  carregarContas();
}, [empresa_id]);

async function carregarCategorias() {
  try {
    const url = buildWebhookUrl("listacategorias", { 
      empresa_id, 
      tipo: form.tipo 
    });

    const resp = await fetch(url);
    const data = await resp.json();
    setCategorias(data);
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }
}

async function carregarContas() {
  try {
    const url = buildWebhookUrl("listacontas", { empresa_id });
    const resp = await fetch(url);
    const data = await resp.json();
    setContas(data);
  } catch (error) {
    console.error("Erro ao carregar contas:", error);
  }
}


 

 const handleChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};



 const handleSalvar = async () => {
  if (!form.empresa_id) {
    alert("Empresa não carregada.");
    return;
  }

   const payload = {
  id_empresa: form.empresa_id,
  tipo: form.tipo,
  conta: form.conta_id,        // <-- CORRIGIDO
  categoria: form.categoria_id, // <-- CORRIGIDO
  valor: form.valor,
  descricao: form.descricao,
  data: form.data,
};


  try {
    const url = buildWebhookUrl("novolancamento"); // ✅ AQUI estava o erro
    console.log("URL gerada:", url);
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (resp.ok) {
      alert("Lançamento salvo com sucesso!");
      navigate(-1); // Volta para a tela anterior
    } else {
      const erro = await resp.text();
      console.error("❌ Erro ao salvar:", erro);
      alert("Erro ao salvar o lançamento.");
    }
  } catch (e) {
    console.error("❌ Erro na requisição:", e);
    alert("Erro na requisição.");
  }




};
 

  return (

    
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Novo Lançamento</h2>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Tipo</label>
        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Categoria</label>
        <select
          value={form.categoria_id}
          onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">Selecione</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Conta</label>
        <select
          value={form.conta_id}
          onChange={(e) => setForm({ ...form, conta_id: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">Selecione</option>
          {contas.map((conta) => (
            <option key={conta.id} value={conta.id}>
              {conta.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Valor</label>
        <input
          type="number"
          value={form.valor}
          onChange={(e) => setForm({ ...form, valor: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Data</label>
        <input
          type="date"
          value={form.data}
          onChange={(e) => setForm({ ...form, data: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Descrição</label>
        <input
          type="text"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <button
          onClick={handleSalvar}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm w-32 text-center"
        >
          Salvar
        </button>

      
    </div>
  );
}
