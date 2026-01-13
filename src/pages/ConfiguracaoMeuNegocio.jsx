 import { useState, useEffect, useMemo } from "react";
import { buildWebhookUrl } from "../config/globals";
import { useNavigate } from "react-router-dom";


export default function ConfiguracaoMeuNegocio() {
  const [filtro, setFiltro] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [meuNegocio, setMeuNegocio] = useState([]);
 const [mostrarAjuda, setMostrarAjuda] = useState(false);


  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");
 const navigate = useNavigate();

  const btnPadrao = "w-60 h-12 flex items-center justify-center text-white font-semibold rounded-lg text-base";
  /* ================== LOAD ================== */
  async function carregarTudo() {
    const [rCat, rMeu] = await Promise.all([
      fetch(
        buildWebhookUrl("listameunegocio", {
          empresa_id,
          tipo: "entrada",
          meunegocio: false,
        })
      ),
      fetch(
        buildWebhookUrl("listameunegocio", {
          empresa_id,
          tipo: "entrada",
          meunegocio: true,
        })
      ),
    ]);

    const dadosCat = await rCat.json();
    const dadosMeu = await rMeu.json();

    setCategorias(Array.isArray(dadosCat) ? dadosCat : []);
    setMeuNegocio(Array.isArray(dadosMeu) ? dadosMeu : []);
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  /* ================== AÇÕES ================== */
  async function adicionarAoMeuNegocio(cat) {
    await fetch(buildWebhookUrl("transferir_meu_negocio"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        categoria_id: cat.id,
        meunegocio: true,
      }),
    });

    carregarTudo();
  }

  async function removerDoMeuNegocio(id) {
    await fetch(buildWebhookUrl("transferir_meu_negocio"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa_id,
        categoria_id: id,
        meunegocio: false,
      }),
    });

    carregarTudo();
  }

  /* ================== FILTRO ================== */
  const categoriasFiltradas = useMemo(() => {
    const f = filtro.toLowerCase().trim();
    if (!f) return categorias;
    return categorias.filter(c =>
      (c.nome || "").toLowerCase().includes(f)
    );
  }, [categorias, filtro]);

  /* ================== IDS DO MEU NEGÓCIO ================== */
  const idsMeuNegocio = useMemo(
    () => new Set(meuNegocio.map(m => m.id)),
    [meuNegocio]
  );

  /* ================== UI ================== */
  return (
    <div className="p-6">

      {/* PESQUISA */}
      <div className="bg-[#061f4aff] rounded-xl p-4 border-4 border-blue-900 mb-4">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-white">
               Configuração do Meu Negócio  
                Receitas, classificação gerencial e efeitos contábeis

            </h1>

            <button
              onClick={() => setMostrarAjuda(true)}
              className="text-white text-sm font-semibold flex items-center gap-2 opacity-80 hover:opacity-100"
            >
              ℹ️ Ajuda
            </button>
          </div>


        <div className="flex gap-4 items-end">
          <input
            className="flex-1 border rounded-lg px-4 py-2"
            placeholder="Buscar categoria..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
          />
          
                
            {/* ➕ NOVA CONTA */}
            <button 
               onClick={() =>
                navigate("/nova-conta-contabil", {
                  state: {
                    origem: "receita",
                    tipo: "RECEITA",
                    natureza: "C",
                    nivel: 3,
                    conta_pai_codigo: "5.1"
                  }
                })
              } 

                style={{
                padding: "8px 8px",
                background: "#003ba2",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontWeight: "bold",
                cursor: "pointer",
                }}
                    className=  { `${btnPadrao} bg-blue-600 hover:bg-blue-700 px-4 py-2 `} 
            >
                + Nova Conta Ctb
            </button>

             <button
          
            onClick={() => navigate("/novo-modelo")}
            style={{
              padding: "12px 22px",
              background: "#1414d2ff",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: 15,
              boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
              
            }}
             className= { `${btnPadrao} bg-green-600 hover:bg-green-700 px-4 py-2 `}
          >
            + Novo Modelo (Token)
          </button>
        
            <button
            onClick={() => navigate("/contasgerenciais/novo")}
            //className="bg-green-600 text-white px-5 py-2 rounded font-bold shadow">
                className= { `${btnPadrao} bg-green-600 hover:bg-green-700 px-4 py-2 `}
            >
            + Nova Categoria 
            </button>

             
          
                

          <button
            onClick={carregarTudo}
            className=  { `${btnPadrao} bg-blue-600 hover:bg-blue-700 px-4 py-2 `}  
          >
            Pesquisar
          </button>

          

        </div>
      </div>

      {/* LISTAS */}
      <div className="grid grid-cols-2 gap-6 bg-white p-4 rounded-xl">

        {/* ESQUERDA */}
        <div className="bg-gray-100 rounded-xl p-4 border-4 border-blue-900">
          <h2 className="font-semibold text-lg mb-4">
            Categorias Gerenciais (Entradas)
          </h2>

          <div className="space-y-2">
            {categoriasFiltradas.map(cat => {
              const ja = idsMeuNegocio.has(cat.id);

              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between border rounded-lg px-4 py-2"
                  style={{ backgroundColor: ja ? "#16a34a" : "#eaeaf3" }}
                >
                  <span>{cat.nome}</span>

                  <button
                    disabled={ja}
                    onClick={() => adicionarAoMeuNegocio(cat)}
                    className={`font-bold text-lg ${
                      ja
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-700"
                    }`}
                  >
                    ➡
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* DIREITA */}
        <div className="bg-gray-100 rounded-xl p-4 border-4 border-blue-900">
          <h2 className="font-semibold text-lg mb-4">
            O Meu Negócio
          </h2>

          <div className="space-y-2">
            {meuNegocio.map(cat => (
              <div
                key={cat.id}
                className="flex items-center justify-between border rounded-lg px-4 py-2 bg-white"
              >
                <span>{cat.nome}</span>

                <button
                  onClick={() => removerDoMeuNegocio(cat.id)}
                  className="font-bold text-lg text-blue-700 hover:text-blue-900"
                >
                  ⬅
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

         
     {mostrarAjuda && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div className="bg-white rounded-xl w-full max-w-3xl p-6 shadow-xl">

      <h2 className="text-xl font-semibold mb-4">
        Como funciona a Configuração do Meu Negócio
      </h2>

      <div className="space-y-4 text-sm text-gray-700 leading-relaxed">

        <p>
          Esta tela define <strong>quais categorias realmente fazem parte do seu negócio (Receitas)</strong>.
          As categorias selecionadas aqui serão usadas principalmente no cadastro rápido de receitas
           e servirão como base para lançamentos, relatórios e apurações.

        </p>

        <div>
          <strong>Categorias Gerenciais (Entradas)</strong>
          <ul className="list-disc ml-6 mt-1">
            <li>Lista todas as categorias disponíveis no sistema</li>
            <li>Use a busca para localizar rapidamente</li>
            <li>Clique em ➡️ para adicionar ao seu negócio</li>
          </ul>
        </div>

        <div>
          <strong>O Meu Negócio</strong>
          <ul className="list-disc ml-6 mt-1">
            <li>Mostra apenas as categorias que você utiliza</li>
            <li>Essas categorias impactam lançamentos e relatórios</li>
            <li>Clique em ⬅️ para remover quando necessário</li>
          </ul>
        </div>

        <div>
          <strong>Ações rápidas</strong>
          <ul className="list-disc ml-6 mt-1">
          <li><strong>Nova Conta Ctb</strong> → contas como Receita, CMV e Despesas</li>
          <li><strong>Novo Modelo</strong> → regras automáticas de lançamento</li>
          <li><strong>Nova Categoria</strong> → tipos de receita usados no dia a dia</li>
        </ul>
        </div>

            <p className="text-xs text-gray-500">
              Remover uma categoria não apaga dados históricos.
              A configuração pode ser alterada a qualquer momento.
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setMostrarAjuda(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    )}





    </div>
  );
}
