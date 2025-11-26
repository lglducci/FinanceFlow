 import React, { useEffect, useState } from "react";
import { buildWebhookUrl } from "../config/globals";

export default function ExcluirParcelamentoPagar() {

  const empresa_id = Number(localStorage.getItem("empresa_id") || 1);

  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  const [categoria_id, setCategoriaId] = useState(0);
  const [fornecedor_id, setFornecedorId] = useState(0);
  const [loteFiltro, setLoteFiltro] = useState("");

  const [parcelamentos, setParcelamentos] = useState([]);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // 1) CARREGAR CATEGORIAS + FORNECEDORES
  // ============================================================
  async function carregarCombos() {
    try {
      // categorias
      const urlCat = buildWebhookUrl("listacategorias", { empresa_id });
      const r1 = await fetch(urlCat);
      let cat = [];
      try { cat = JSON.parse(await r1.text()); } catch {}
      setCategorias(Array.isArray(cat) ? cat : []);

      // fornecedores
      const urlFor = buildWebhookUrl("fornecedorcliente", {
        empresa_id,
        tipo: "fornecedor",
      });
      const r2 = await fetch(urlFor);
      let forn = [];
      try { forn = JSON.parse(await r2.text()); } catch {}
      setFornecedores(Array.isArray(forn) ? forn : []);

    } catch (e) {
      console.log("ERRO COMBOS:", e);
    }
  }

  useEffect(() => {
    carregarCombos();
  }, []);


  // ============================================================
  // 2) FILTRAR PARCELAMENTOS
  // ============================================================
  async function filtrar() {
    setLoading(true);

    try {
      const url = buildWebhookUrl("conta_pagar_parcelado", {
        empresa_id,
        fornecedor_id: fornecedor_id || 0,
        categoria_id: categoria_id || 0,
        lote_id: loteFiltro.trim() || 0
      });

      const resp = await fetch(url);
      let resultado = [];

      try { resultado = JSON.parse(await resp.text()); } catch {}

      if (!Array.isArray(resultado)) resultado = [];


      try { resultado = JSON.parse(await resp.text()); } catch {}

if (!Array.isArray(resultado)) resultado = [];

// REMOVER RESULTADOS VAZIOS / CORROMPIDOS
resultado = resultado.filter(x =>
  x &&
  x.lote_id && String(x.lote_id).trim() !== "" &&
  x.descricao && String(x.descricao).trim() !== ""
);

setParcelamentos(resultado);


      setParcelamentos(resultado);

    } catch (e) {
      console.log("ERRO FILTRO:", e);
      setParcelamentos([]);
    } finally {
      setLoading(false);
    }
  }


  // ============================================================
  // 3) EXCLUIR PARCELAMENTO
  // ============================================================
 
 async function excluir(lote_id) {
  if (!confirm("Excluir TODAS as parcelas deste lote?")) return;

  try {
    const url = buildWebhookUrl("excluirparcelaspagar");

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresa_id, lote_id }),
    });

    // ======== IMPORTANTE ========
    // ler APENAS UMA vez o retorno
    const texto = await resp.text();
    console.log("RETORNO WEBHOOK:", texto);

    let json = {};
    try { json = JSON.parse(texto); } catch {
      alert("Retorno inválido do servidor.");
      return;
    }

    if (json.success === true) {
      alert("Parcelamento excluído com sucesso!");

      // limpa antes de buscar de novo
      setParcelamentos([]);

      // espera o backend processar (200ms é o suficiente)
      setTimeout(() => {
        filtrar();
      }, 200);

    } else {
      alert(json.message || "Erro ao excluir");
    }

  } catch (e) {
    console.log("ERRO EXCLUIR:", e);
    alert("Erro ao excluir.");
  }
}


  // ============================================================
  // TELA
  // ============================================================
  return (
    <div className="p-6">
      
      <h2 className="text-2xl font-bold mb-5 text-red-700">
        Excluir Parcelamentos
      </h2>

      {/* ====================== FILTROS ====================== */}
      <div className="bg-white border shadow rounded-xl p-4 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Categoria */}
          <div>
            <label className="font-semibold block mb-1">Categoria</label>
            <select
              value={categoria_id}
              onChange={(e) => setCategoriaId(Number(e.target.value))}
              className="border px-3 py-2 rounded w-full"
            >
              <option value={0}>Todas</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* Fornecedor */}
          <div>
            <label className="font-semibold block mb-1">Fornecedor</label>
            <select
              value={fornecedor_id}
              onChange={(e) => setFornecedorId(Number(e.target.value))}
              className="border px-3 py-2 rounded w-full"
            >
              <option value={0}>Todos</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>

          {/* Lote */}
          <div>
            <label className="font-semibold block mb-1">Lote</label>
            <input
              value={loteFiltro}
              onChange={(e) => setLoteFiltro(e.target.value)}
              className="border px-3 py-2 rounded w-full"
              placeholder="Digite o lote (opcional)"
            />
          </div>

        </div>

        <div className="text-right mt-4">
          <button
            onClick={filtrar}
            className="bg-blue-600 text-white px-6 py-2 rounded font-bold"
          >
            Buscar
          </button>
        </div>
      </div>


      {/* ====================== LISTA ====================== */}
      {loading && <p>Carregando…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        {Array.isArray(parcelamentos) && parcelamentos.length > 0 ? (
          
          parcelamentos.map((p) => (
            <div key={p.lote_id} className="bg-white rounded-xl shadow border p-4">

              {/* Fornecedor */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded flex items-center justify-center text-lg">
                  🏦
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {p.fornecedor_nome}
                </div>
              </div>
               
             <div className="text-sm text-gray-800">
              <p><strong>Categoria:</strong> {p.categoria_nome}</p>
            </div>


              
              <hr className="my-2" />

              {/* Dados */}
              <div className="text-sm text-gray-800">

                <p><strong>Descrição:</strong> {p.descricao}</p>

                <p>
                  <strong>Valor total:</strong> R${" "}
                  {Number(p.valor_total || 0).toLocaleString("pt-BR")}
                </p>

                <p><strong>Parcelas:</strong> {Number(p.parcelas || 0)}</p>
                <p><strong>Status:</strong> {p.status}</p>
                <p><strong>Lote ID:</strong> {p.lote_id}</p>

              </div>

              <hr className="my-2" />

              <button
                onClick={() => excluir(p.lote_id)}
                className="bg-red-600 text-white px-6 py-2 mt-3 rounded-full font-bold mx-auto block text-sm shadow"
              >
                Excluir
              </button>

            </div>
          ))

        ) : (
          !loading && (
            <div className="text-gray-600 col-span-full mt-4">
              Nenhum parcelamento encontrado.
            </div>
          )
        )}

      </div>


    </div>
  );
}
