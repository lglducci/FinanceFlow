 import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
 
import { buildWebhookUrl } from '../config/globals';

export default function Lancamentos() {
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [total, setTotal] = useState(0);
  const [periodo, setPeriodo] = useState("mes"); // período selecionado

  const id_empresa = localStorage.getItem("id_empresa") || 1;
  const navigate = useNavigate();

  function aplicarPeriodo(tipo) {
    const hoje = new Date();
    let ini, fim;

    if (tipo === "mes") {
      ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      fim = new Date();
    } else if (tipo === "15") {
      ini = new Date();
      ini.setDate(hoje.getDate() - 15);
      fim = new Date();
    } else if (tipo === "semana") {
      ini = new Date();
      ini.setDate(hoje.getDate() - 7);
      fim = new Date();
    } else if (tipo === "hoje") {
      ini = new Date();
      fim = new Date();
    } else {
      setDataIni("");
      setDataFim("");
      return;
    }

    setDataIni(ini.toISOString().substring(0, 10));
    setDataFim(fim.toISOString().substring(0, 10));
  }

  function handlePeriodoChange(tipo) {
    if (periodo === tipo) {
      // desmarca se clicar de novo
      setPeriodo("");
      setDataIni("");
      setDataFim("");
    } else {
      setPeriodo(tipo);
      aplicarPeriodo(tipo);
    }
  }

  useEffect(() => {
    setPeriodo("mes");
    aplicarPeriodo("mes");
  }, []);

  async function pesquisar() {
    if (!dataIni || !dataFim) {
      alert("Informe o período.");
      return;
    }

    setCarregando(true);
    try {
 
     const url = buildWebhookUrl('listalancamentos', {
       id_empresa: id_empresa,
       data_ini: dataIni,
       data_fim: dataFim
     });

     
      const resp = await fetch(url);
      const dados = await resp.json();

      let soma = 0;

      const tratados = dados.map((l) => {
        soma += Number(l.valor || 0);
        return {
          id: l.id,
          descricao: l.descricao,
          tipo: l.tipo === "entrada" ? "Entrada" : "Saída",
          categoria_nome: l.categoria_nome || "-",
          conta_nome: l.conta_nome || "-",
          valor: Number(l.valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          data: new Date(l.data_movimento).toLocaleDateString("pt-BR"),
          origem: l.origem || "-",
        };
      });

      setLista(tratados);
      setTotal(soma);
    } catch (e) {
      console.error(e);
      alert("Erro ao consultar lançamentos.");
    }
    setCarregando(false);
  }

  function abrirNovoLancamento() {
    navigate("/new-transaction");
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Lançamentos</h2>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col gap-4">
        {/* linha 1 – períodos + novo lançamento */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold mb-1">Períodos</span>
            <div className="flex gap-4 text-sm flex-wrap">
              <label>
                <input
                  type="checkbox"
                  checked={periodo === "mes"}
                  onChange={() => handlePeriodoChange("mes")}
                  className="mr-1"
                />
                Mês
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={periodo === "15"}
                  onChange={() => handlePeriodoChange("15")}
                  className="mr-1"
                />
                Últimos 15 dias
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={periodo === "semana"}
                  onChange={() => handlePeriodoChange("semana")}
                  className="mr-1"
                />
                Semana
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={periodo === "hoje"}
                  onChange={() => handlePeriodoChange("hoje")}
                  className="mr-1"
                />
                Hoje
              </label>
            </div>
          </div>

          <button
            onClick={abrirNovoLancamento}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
          >
            Novo lançamento
          </button>
        </div>

        {/* linha 2 – datas + pesquisar */}
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="text-sm font-semibold">Data início</label>
            <input
              type="date"
              value={dataIni}
              onChange={(e) => setDataIni(e.target.value)}
              className="border rounded-lg px-3 py-2 w-40"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Data fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border rounded-lg px-3 py-2 w-40"
            />
          </div>

          <button
            onClick={pesquisar}
            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold"
          >
            {carregando ? "Carregando..." : "Pesquisar"}
          </button>
        </div>
      </div>

      {/* SOMA */}
      <div className="mb-4 text-base font-semibold text-gray-700">
          Total:{" "}
          <span className="text-xl font-bold text-gray-900">
            {total.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>


      {/* TABELA */}
      <div className="bg-white rounded-xl shadow p-4">
        {lista.length === 0 ? (
          <p className="text-gray-600 text-sm">Nenhum lançamento encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="text-left py-2 px-2 w-10">ID</th> 
                <th className="text-left py-2 px-2 w-64">Descrição</th>
                <th className="text-left py-2 px-2 w-32">Categoria</th>
                <th className="text-left py-2 px-2 w-32">Conta</th>
                <th className="text-left py-2 px-2 w-20">Tipo</th>
                <th className="text-left py-2 px-2 w-24">Data</th>
                <th className="text-left py-2 px-2 w-24">Origem</th>
                <th className="text-right py-2 px-2 w-28">Valor</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((l, i) => (
                <tr
                  key={l.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}
                >
                  <td className="py-2 px-2">{l.id}</td>

                   
                  <td className="px-2 font-semibold truncate max-w-xs">{l.descricao}</td>
                  <td className="px-2">{l.categoria_nome}</td>
                  <td className="px-2">{l.conta_nome}</td>
                  <td className="px-2">{l.tipo}</td>
                  <td className="px-2">{l.data}</td>
                  <td className="px-2">{l.origem}</td>
                  <td className="px-2 text-right font-bold">{l.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


