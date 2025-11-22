import { useState } from "react";

export default function NovoPagarReceber({ setPage, tipoInicial }) {
  // tipoInicial: "pagar" ou "receber"
  const [tipo, setTipo] = useState(tipoInicial || "pagar");
  const id_empresa = Number(localStorage.getItem("id_empresa") || 1);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState(
    new Date().toISOString().slice(0, 10)
  ); // yyyy-mm-dd
  const [categoriaId, setCategoriaId] = useState("");
  const [cliente, setCliente] = useState("");       // só usado em receber
  const [parcelas, setParcelas] = useState(1);      // só usado em pagar

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function handleSalvar(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!descricao || !valor || !vencimento) {
      setErro("Preencha descrição, valor e vencimento.");
      return;
    }

    setSalvando(true);

    try {
      const payload = {
        // sempre envia empresa
        id_empresa,
        empresa_id: id_empresa,

        tipo, // "pagar" ou "receber" — n8n decide se é conta a pagar ou a receber

        descricao,
        valor: Number(String(valor).replace(",", ".")),
        vencimento, // yyyy-mm-dd (backend trata pra date)

        categoria_id: categoriaId || null,

        // campos específicos:
        cliente: tipo === "receber" ? cliente || null : null,
        parcelas: tipo === "pagar" ? Number(parcelas || 1) : null,
      };

      const resp = await fetch(
        "https://n8n.lglducci.com.br/webhook-test/novopagarreceber",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const dados = await resp.json();

      // backend devolve array [ {...} ] tanto pra pagar quanto pra receber
      const titulo = Array.isArray(dados) ? dados[0] : dados;

      if (!titulo || !titulo.id) {
        setErro("Não foi possível confirmar o registro.");
      } else {
        const tipoLabel =
          tipo === "receber" ? "a receber" : "a pagar";

        setSucesso(
          `Título ${tipoLabel} #${titulo.id} salvo com sucesso (R$ ${titulo.valor}).`
        );
      }
    } catch (err) {
      console.error(err);
      setErro("Erro ao salvar título.");
    }

    setSalvando(false);
  }

  function voltar() {
    // volta para a tela de origem
    if (tipo === "receber") {
      setPage("receivables"); // Contas a receber
    } else {
      setPage("payables"); // Contas a pagar
    }
  }

  return (
    <div>
      {/* Título + Voltar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          {tipo === "receber" ? "Nova conta a receber" : "Nova conta a pagar"}
        </h2>

        <button
          onClick={voltar}
          className="px-4 py-2 rounded-lg border text-sm font-semibold"
        >
          Voltar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 max-w-xl">
        <form onSubmit={handleSalvar} className="space-y-4">
          {/* Tipo (travado ou opcional, se quiser deixar trocar) */}
          <div>
            <label className="text-sm font-semibold block mb-1">Tipo</label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="pagar"
                  checked={tipo === "pagar"}
                  onChange={() => setTipo("pagar")}
                />
                Conta a pagar
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="receber"
                  checked={tipo === "receber"}
                  onChange={() => setTipo("receber")}
                />
                Conta a receber
              </label>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-semibold block">Descrição</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff] focus:outline-none focus:ring-2 focus:ring-primary"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex.: 100 reais no posto do carlin"
            />
          </div>

          {/* Valor + Vencimento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff] focus:outline-none focus:ring-2 focus:ring-primary"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold block">Vencimento</label>
              <input
                type="date"
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff] focus:outline-none focus:ring-2 focus:ring-primary"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="text-sm font-semibold block">
              Categoria (ID)
            </label>
            <input
              type="number"
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff] focus:outline-none focus:ring-2 focus:ring-primary"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              placeholder="Ex.: 27"
            />
          </div>

          {/* Só em RECEBER: cliente */}
          {tipo === "receber" && (
            <div>
              <label className="text-sm font-semibold block">Cliente</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff] focus:outline-none focus:ring-2 focus:ring-primary"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>
          )}

          {/* Só em PAGAR: parcelas */}
          {tipo === "pagar" && (
            <div>
              <label className="text-sm font-semibold block">
                Parcelas (se houver)
              </label>
              <input
                type="number"
                min={1}
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-[#f0f6ff] focus:outline-none focus:ring-2 focus:ring-primary"
                value={parcelas}
                onChange={(e) => setParcelas(e.target.value)}
                placeholder="1"
              />
            </div>
          )}

          {erro && (
            <div className="text-red-600 text-sm text-center">{erro}</div>
          )}
          {sucesso && (
            <div className="text-green-600 text-sm text-center">
              {sucesso}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={voltar}
              className="px-4 py-2 rounded-lg border text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primaryDark disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar título"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
