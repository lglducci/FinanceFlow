 import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import FormContaContabilModal from "../components/forms/FormContaContabilModal"; 
import ModalBase from "../components/ModalBase";


export default function EditaMapeamento() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const modelo_id = state?.modelo_id;
  const empresa_id = state?.empresa_id;
  const token = state?.token;
  const nome = state?.nome;
    const tipo = state?.tipo;

  const [linhas, setLinhas] = useState([]);
  const [busca, setBusca] = useState(""); // texto digitado
  const [resultadoBusca, setResultadoBusca] = useState([]); // contas retornadas
  const [indexLinha, setIndexLinha] = useState(null); // qual linha está sendo editada
  
 const [modalContaContabil, setModalContaContabil] = useState(false);
  // ================================
  //  CARREGAR LINHAS DO MODELO
  // ================================
  async function carregarDados() {
    try {
      const url = buildWebhookUrl("modelos_linhas", {
        empresa_id,
        modelo_id,
      });

      const resp = await fetch(url);
      const dados = await resp.json();
      setLinhas(dados);
    } catch (e) {
      console.log("ERRO:", e);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // ================================
  //  BUSCAR CONTAS (AUTOCOMPLETE)
  // ================================
 async function buscarContas(linha, texto) {
    if (!texto || texto.length < 2) {
      setResultadoBusca([]);
      return;
    }

    try {
      const url = buildWebhookUrl("buscar_contas", {
        empresa_id,
        nome: texto  
       // dc:  linha.natureza,     // <-- AQUI: usa o D/C da linha (D ou C)
     });

      const resp = await fetch(url);
      const dados = await resp.json();

      setResultadoBusca(dados);
    } catch (e) {
      console.log("ERRO BUSCAR CONTAS:", e);
    }
  }

  // ================================
  //  TROCAR A CONTA NA LINHA
  // ================================
  function aplicarConta(linhaIndex, conta) {
    const novas = [...linhas];
    novas[linhaIndex] = {
      ...novas[linhaIndex],
      conta_id: conta.id,
      codigo: conta.codigo,
      nome: conta.nome,
      tipo: conta.tipo,
      natureza: conta.natureza,
      dc: conta.dc,
    };

    setLinhas(novas);
    setResultadoBusca([]);
    setBusca("");
  }

  // ================================
  //  TELA
  // ================================
   return (
  <div className="p-4 bg-gray-100 border border-blue-900 rounded-xl">

    {/* ===== CABEÇALHO ===== */}
    <div className="bg-white rounded-xl border-l-4 border-blue-700 shadow-sm p-4 mb-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-2">
        Editar Mapeamento Contábil
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Token</p>
          <p className="font-semibold text-gray-800">{token}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Nome</p>
          <p className="font-semibold text-gray-800">{nome}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Tipo</p>
          <p className="font-semibold text-gray-800">{tipo}</p>
        </div>
      </div>
    </div>

    {/* ===== TABELA ===== */}
    <div className="bg-white rounded-xl shadow-sm p-4">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2 text-left">Buscar Conta</th>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Conta Atual</th>
            <th className="p-2 text-left">Código</th>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Tipo</th>
            <th className="p-2 text-left">Natureza</th>
            <th className="p-2 text-center">D/C</th>
          </tr>
        </thead>

        <tbody>
          {linhas.map((l, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="p-2 relative">
                <input
                  type="text"
                  placeholder="Procurar conta…"
                  value={indexLinha === i ? busca : ""}
                  onChange={(e) => {
                    const texto = e.target.value;
                    setBusca(texto);
                    setIndexLinha(i);
                    buscarContas(l, texto);
                  }}
                  className="w-full border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {indexLinha === i && resultadoBusca.length > 0 && (
                  <div className="absolute left-0 top-full mt-1 w-full bg-white border rounded-lg shadow-lg z-50 max-h-48 overflow-auto">
                    {resultadoBusca.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => aplicarConta(i, c)}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        <span className="font-semibold">{c.codigo}</span> — {c.nome}
                      </div>
                    ))}
                  </div>
                )}
              </td>

              <td className="p-2 font-semibold">{l.id}</td>
              <td className="p-2">{l.conta_id}</td>
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

    {/* ===== AÇÕES ===== */}
    <div className="flex gap-4 mt-6">

          <button
            onClick={async () => {
              try {
                const url = buildWebhookUrl("salvar_mapeamento", {
                  empresa_id,
                  modelo_id,
                });

                await fetch(url, {
                  method: "POST",
                  body: JSON.stringify(linhas),
                });

                alert("Mapeamento salvo!");
                navigate("/mapeamento-contabil");
              } catch {
                alert("Erro ao salvar!");
              }
            }}
            className="px-6 py-2 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800"
          >
            Salvar tudo
          </button>

          <button
            onClick={() => navigate("/mapeamento-contabil")}
            className="px-6 py-2 rounded-lg bg-gray-400 text-white font-semibold hover:bg-gray-500"
          >
            Cancelar
          </button>

          <button
            onClick={() => setModalContaContabil(true)}
            className="px-6 py-2 rounded-lg bg-[#061f4a] text-white font-semibold hover:brightness-110"
          >
            ➕ Adicionar Conta
          </button>

        </div>


      <ModalBase
            open={modalContaContabil}
            onClose={() => setModalContaContabil(false)}
            title="Nova Conta Contábil"
          >
            <FormContaContabilModal
                empresa_id={empresa_id}
                onSuccess={() => {
                  setModalContaContabil(false);
                   carregarDados(); // 🔥 REFRESH DO DROPDOWN
                }}
                onCancel={() => setModalContaContabil(false)}
              /> 
        </ModalBase>


  </div>
);

}
