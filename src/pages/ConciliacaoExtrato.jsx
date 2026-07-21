 import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildWebhookUrl } from "../config/globals";
import { hojeLocal } from "../utils/dataLocal";

import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const moeda = (v) =>
  Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const inicioMes = () => `${hojeLocal().slice(0, 7)}-01`;

function normalizarRetorno(json) {
  const base = Array.isArray(json) ? json[0] : json;

  return (
    base?.fn_concilia_extrato ||
    base?.conciliaextrato ||
    base?.data?.[0]?.fn_concilia_extrato ||
    base?.data?.[0] ||
    base?.data ||
    base ||
    {}
  );
}

export default function ConciliacaoExtratoPdf() {
  const navigate = useNavigate();
  const inputPdfRef = useRef(null);

  const empresa_id =
    localStorage.getItem("empresa_id") ||
    localStorage.getItem("id_empresa");

  const [contas, setContas] = useState([]);
  const [indiceConta, setIndiceConta] = useState(0);
  const [inicio, setInicio] = useState(inicioMes());
  const [fim, setFim] = useState(hojeLocal());
  const [arquivo, setArquivo] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const contaAtual = contas[indiceConta] || null;
  const contaId = contaAtual?.conta_id || null;
const [senhaPDF, setSenhaPDF] = useState("");

const [executando, setExecutando] = useState(false);

const [dataInicio, setDataInicio] = useState(
  `${hojeLocal().slice(0, 7)}-01`
);

const [dataFim, setDataFim] = useState(
  hojeLocal()
);

  async function carregarContas() {
    try {
      setErro("");

      const resp = await fetch(
        buildWebhookUrl("consultasaldo", {
          empresa_id,
          conta_id: 0,
          inicio,
          fim,
        })
      );

      if (!resp.ok) {
        throw new Error(`Erro ao consultar contas (${resp.status}).`);
      }

      const json = await resp.json();
      const base = Array.isArray(json) ? json : json?.data || json?.dados || [];

      setContas(Array.isArray(base) ? base : []);
      setIndiceConta(0);
    } catch (e) {
      setErro(e.message || "Erro ao consultar contas.");
      setContas([]);
    }
  }

  useEffect(() => {
    carregarContas();
  }, [empresa_id, inicio, fim]);

  function navegarConta(direcao) {
    if (!contas.length) return;

    setIndiceConta((atual) => {
      if (direcao === "anterior") {
        return atual === 0 ? contas.length - 1 : atual - 1;
      }

      return atual === contas.length - 1 ? 0 : atual + 1;
    });

    setResultado(null);
  }

  function escolherPdf(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("Selecione um arquivo PDF.");
      e.target.value = "";
      return;
    }

    setArquivo(file);
    setResultado(null);
    setErro("");
  } 


  function extrairResultado(retorno) {
  const bruto = Array.isArray(retorno)
    ? retorno[0]
    : retorno;

  return (
    bruto?.fn_concilia_extrato ||
    bruto?.conciliaextrato ||
    bruto?.data?.[0]?.fn_concilia_extrato ||
    bruto?.data?.[0] ||
    bruto?.data ||
    bruto ||
    {}
  );
}


  async function executarConciliacao() {
  if (!arquivo) {
    alert("Selecione o PDF.");
    return;
  }

  try {
    setExecutando(true);
    setErro("");
    setResultado(null);

    const formData = new FormData();

    formData.append("empresa_id", String(empresa_id));
    formData.append("conta_id", String(contaId));
    formData.append("data_inicio", dataInicio);
    formData.append("data_fim", dataFim);
    formData.append("senha_pdf", senhaPDF || "");

    if (senhaPDF.trim()) {
      const buffer = await arquivo.arrayBuffer();
      const textoPDF = await lerTextoPDF(buffer);

      if (!textoPDF || textoPDF.length < 50) {
        throw new Error(
          "O PDF foi aberto, mas não consegui extrair conteúdo suficiente."
        );
      }

      formData.append("texto_pdf", textoPDF);
    } else {
      formData.append("arquivo", arquivo, arquivo.name);
    }

    const resp = await fetch(
      buildWebhookUrl("conciliacao_extrato"),
      {
        method: "POST",
        body: formData,
      }
    );

    const texto = await resp.text();

    if (!texto.trim()) {
      throw new Error(
        senhaPDF.trim()
          ? "O webhook não retornou resposta."
          : "O PDF pode exigir senha. Informe a senha e tente novamente."
      );
    }

    const json = JSON.parse(texto);
    const dados = extrairResultado(json);

    if (!resp.ok || dados?.ok === false) {
      throw new Error(
        dados?.message ||
        dados?.mensagem ||
        dados?.erro ||
        "Erro ao conciliar o extrato."
      );
    }

    setResultado(dados);
  } catch (err) {
    setErro(err.message || "Erro inesperado.");
  } finally {
    setExecutando(false);
  }
}


  const totalExtrato = Number(
    resultado?.total_extrato ?? resultado?.resumo?.total_extrato ?? 0
  );

  const totalRazao = Number(
    resultado?.total_razao ?? resultado?.resumo?.total_razao ?? 0
  );

  const conciliados = Number(
    resultado?.conciliados ?? resultado?.resumo?.conciliados ?? 0
  );

  const pendencias = Number(
    resultado?.pendencias ?? resultado?.resumo?.pendencias ?? 0
  );

  const diferenca = Number(
    resultado?.diferenca ??
      resultado?.resumo?.diferenca ??
      totalExtrato - totalRazao
  );


  async function lerTextoPDF(buffer) {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: buffer,
      password: senhaPDF?.trim() || undefined,
    });

    const pdf = await loadingTask.promise;
    let textoFinal = "";

    for (let pagina = 1; pagina <= pdf.numPages; pagina++) {
      const page = await pdf.getPage(pagina);
      const content = await page.getTextContent();

      const textoPagina = content.items
        .map((item) => item.str)
        .join(" ");

      textoFinal += `\n${textoPagina}`;
    }

    return textoFinal.trim();
  } catch (err) {
    const mensagem = String(err?.message || "");
    const codigo = err?.code;

    if (
      mensagem.includes("No password given") ||
      codigo === 1
    ) {
      throw new Error(
        "Este PDF exige senha. Informe a senha e tente novamente."
      );
    }

    if (
      mensagem.includes("Incorrect Password") ||
      codigo === 2
    ) {
      throw new Error("Senha do PDF incorreta.");
    }

    throw new Error("Não consegui abrir o PDF.");
  }
}

  return (
    <div className="min-h-screen bg-[#eef7fd] px-2 py-2">
      <div className="mx-auto w-full max-w-[1050px]">
        <div className="rounded-[28px] border border-cyan-100 bg-[#061f4a] p-4 shadow-[0_8px_30px_rgba(15,23,42,0.10)]">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-black text-white">
                📄 Conciliação de Extrato PDF
              </h1>
              <p className="mt-1 text-sm font-semibold text-cyan-100">
                Extrato bancário x razão contábil
              </p>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/20"
            >
              Sair
            </button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-3xl border border-cyan-100 bg-white p-4">
              <div className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
                Conta bancária
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navegarConta("anterior")}
                  className="h-10 w-10 shrink-0 rounded-full border bg-white font-black shadow-sm"
                >
                  ◀
                </button>

                {contaAtual ? (
                  <div
                    className="flex min-h-[105px] flex-1 items-center gap-4 rounded-3xl border px-4 py-3"
                    style={{
                      borderColor: contaAtual.cor_hex || "#bae6fd",
                      boxShadow: `0 8px 20px ${
                        contaAtual.cor_hex || "#0f172a"
                      }22`,
                    }}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-slate-50">
                      {contaAtual.icone_url ? (
                        <img
                          src={contaAtual.icone_url}
                          alt=""
                          className="h-9 w-9 object-contain"
                        />
                      ) : (
                        <span className="text-2xl">🏦</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-black text-slate-800">
                        {contaAtual.nome || contaAtual.conta_nome}
                      </div>

                      <div className="mt-1 text-xs font-bold text-slate-500">
                        Banco {contaAtual.nro_banco || "-"} • Ag.{" "}
                        {contaAtual.agencia || "-"} • Conta{" "}
                        {contaAtual.conta || "-"}
                      </div>

                      <div className="mt-1 text-xs font-bold text-slate-400">
                        Conta {indiceConta + 1} de {contas.length}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400">
                        Saldo
                      </div>
                      <div
                        className={`text-base font-black ${
                          Number(contaAtual.saldo_final || 0) >= 0
                            ? "text-emerald-700"
                            : "text-red-600"
                        }`}
                      >
                        {moeda(contaAtual.saldo_final)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[105px] flex-1 items-center justify-center rounded-3xl border border-dashed bg-slate-50 text-sm font-bold text-slate-400">
                    Nenhuma conta encontrada
                  </div>
                )}

                <button
                  onClick={() => navegarConta("proxima")}
                  className="h-10 w-10 shrink-0 rounded-full border bg-white font-black shadow-sm"
                >
                  ▶
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-100 bg-white p-4">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                Período
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="text-xs font-black text-slate-600">
                  Início
                  <input
                    type="date"
                    value={inicio}
                    onChange={(e) => setInicio(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border px-2 text-sm font-bold"
                  />
                </label>

                <label className="text-xs font-black text-slate-600">
                  Fim
                  <input
                    type="date"
                    value={fim}
                    onChange={(e) => setFim(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border px-2 text-sm font-bold"
                  />
                </label>
              </div>

              <label className="text-xs font-black text-slate-600">
                    Senha do PDF
                    <input
                      type="password"
                      value={senhaPDF}
                      onChange={(e) => setSenhaPDF(e.target.value)}
                      placeholder="Informe somente se o PDF possuir senha"
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700"
                    />
                  </label>

              <button
                onClick={carregarContas}
                className="mt-3 w-full rounded-xl border border-cyan-200 bg-cyan-50 py-2 text-xs font-black text-[#063452] hover:bg-cyan-100"
              >
                ↻ Atualizar saldos
              </button>
            </div>
          </div>

          <div className="mt-3 rounded-3xl border border-cyan-100 bg-white p-4">
            <input
              ref={inputPdfRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={escolherPdf}
              className="hidden"
            />

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Arquivo PDF
                </div>
                <div className="mt-1 truncate text-sm font-black text-slate-700">
                  {arquivo ? arquivo.name : "Nenhum arquivo selecionado"}
                </div>
                <div className="mt-1 text-xs font-bold text-slate-400">
                  {arquivo
                    ? `${(arquivo.size / 1024 / 1024).toFixed(2)} MB`
                    : "Selecione o extrato bancário."}
                </div>
              </div>

              <button
                onClick={() => inputPdfRef.current?.click()}
                className="h-10 shrink-0 rounded-xl border border-cyan-200 bg-cyan-50 px-4 text-sm font-black text-[#063452] hover:bg-cyan-100"
              >
                📥 Selecionar PDF
              </button>
            </div>
          </div>

          {erro && (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              ⛔ {erro}
            </div>
          )}

          {resultado && (
            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <Card titulo="Total extrato" valor={moeda(totalExtrato)} />
              <Card titulo="Total razão" valor={moeda(totalRazao)} />
              <Card titulo="Conciliados" valor={conciliados} ok />
              <Card titulo="Pendências" valor={pendencias} alerta={pendencias > 0} />
              <Card
                titulo="Diferença"
                valor={moeda(diferenca)}
                alerta={Math.abs(diferenca) > 0.009}
                ok={Math.abs(diferenca) <= 0.009}
              />
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => navigate(-1)}
              className="h-11 rounded-xl border bg-white px-5 text-sm font-black text-slate-600"
            >
              Cancelar
            </button>

            <button
              onClick={executarConciliacao}
              disabled={carregando || !arquivo || !contaId}
              className={`h-11 rounded-xl px-6 text-sm font-black text-white ${
                carregando || !arquivo || !contaId
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-[#063452] hover:brightness-110"
              }`}
            >
              {carregando ? "Conciliando..." : "Executar conciliação"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ titulo, valor, alerta = false, ok = false }) {
  return (
    <div
      className={`rounded-2xl border bg-white px-4 py-3 shadow-sm ${
        alerta
          ? "border-red-200"
          : ok
          ? "border-emerald-200"
          : "border-cyan-100"
      }`}
    >
      <div className="text-xs font-black uppercase tracking-wider text-slate-400">
        {titulo}
      </div>
      <div
        className={`mt-1 text-xl font-black ${
          alerta
            ? "text-red-600"
            : ok
            ? "text-emerald-700"
            : "text-[#063452]"
        }`}
      >
        {valor}
      </div>
    </div>
  );
}
