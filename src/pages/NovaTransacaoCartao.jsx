import { useState } from "react";

export default function NovaTransacaoCartao({ setPage }) {
  const [cartao, setCartao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [parcelas, setParcelas] = useState(1);
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));

  const [msg, setMsg] = useState("");

  async function salvar() {
    setMsg("");

    if (!cartao || !valor || !descricao) {
      setMsg("Preencha os campos obrigatórios.");
      return;
    }

    try {
      const resp = await fetch(
        "https://webhook.lglducci.com.br/webhook/novatransacaocartao",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartao,
            descricao,
            valor: Number(valor),
            parcelas: Number(parcelas),
            data,
            id_empresa: Number(localStorage.getItem("id_empresa") || 1),
          }),
        }
      );

      const json = await resp.json();

      if (json && json.id) {
        setMsg("Transação registrada com sucesso.");
      } else {
        setMsg("Erro ao registrar.");
      }
    } catch {
      setMsg("Erro ao salvar.");
    }
  }

  return (
    <div className="max-w-xl">

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Nova transação de cartão</h2>
        <button
          onClick={() => setPage("card-transactions")}
          className="px-4 py-2 rounded-lg border"
        >
          Voltar
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <div>
          <label className="text-sm font-semibold">Cartão</label>
          <input
            className="w-full border px-3 py-2 rounded-lg"
            value={cartao}
            onChange={(e) => setCartao(e.target.value)}
            placeholder="Ex.: Nubank Roxo"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Descrição</label>
          <input
            className="w-full border px-3 py-2 rounded-lg"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Valor (R$)</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded-lg"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Parcelas</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded-lg"
            min={1}
            value={parcelas}
            onChange={(e) => setParcelas(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Data da compra</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded-lg"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>

        <button
          onClick={salvar}
          className="w-full bg-primary text-white py-2 rounded-lg font-semibold"
        >
          Salvar
        </button>

        {msg && <div className="text-center text-sm mt-2">{msg}</div>}
      </div>

    </div>
  );
}
