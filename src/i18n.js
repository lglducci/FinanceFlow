 import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import dashboardContabilPT from "./locales/pt-BR/dashboardContabil.json";
import dashboardContabilEN from "./locales/en-US/dashboardContabil.json";
import dashboardContabilES from "./locales/es-ES/dashboardContabil.json";

import lancamentosPT from "./locales/pt-BR/lancamentos.json";
import lancamentosEN from "./locales/en-US/lancamentos.json";
import lancamentosES from "./locales/es-ES/lancamentos.json";

import novoLancamentoPT from "./locales/pt-BR/novoLancamento.json";
import novoLancamentoEN from "./locales/en-US/novoLancamento.json";
import novoLancamentoES from "./locales/es-ES/novoLancamento.json";

import contasRecorrentesPT from "./locales/pt-BR/contasRecorrentes.json";
import contasRecorrentesEN from "./locales/en-US/contasRecorrentes.json";
import contasRecorrentesES from "./locales/es-ES/contasRecorrentes.json";

import regrasClassificacaoPT from "./locales/pt-BR/regrasClassificacao.json";
import regrasClassificacaoEN from "./locales/en-US/regrasClassificacao.json";
import regrasClassificacaoES from "./locales/es-ES/regrasClassificacao.json";

import importacaoBancariaPT from "./locales/pt-BR/importacaoBancaria.json";
import importacaoBancariaEN from "./locales/en-US/importacaoBancaria.json";
import importacaoBancariaES from "./locales/es-ES/importacaoBancaria.json";
 
 
const resources = {
  "pt-BR": {
  translation: {
    dashboardContabil: dashboardContabilPT,
    lancamentos: lancamentosPT,
    novoLancamento: novoLancamentoPT,
    contasRecorrentes: contasRecorrentesPT,
    regrasClassificacao: regrasClassificacaoPT,
    importacaoBancaria: importacaoBancariaPT
  },
},
"en-US": {
  translation: {
    dashboardContabil: dashboardContabilEN,
    lancamentos: lancamentosEN,
    novoLancamento: novoLancamentoEN,
    contasRecorrentes: contasRecorrentesEN,
    regrasClassificacao: regrasClassificacaoEN,
    importacaoBancaria: importacaoBancariaEN
  },
},
"es-ES": {
  translation: {
    dashboardContabil: dashboardContabilES,
    lancamentos: lancamentosES,
    novoLancamento: novoLancamentoES,
    contasRecorrentes: contasRecorrentesES,
    regrasClassificacao: regrasClassificacaoES,
    importacaoBancaria: importacaoBancariaES
  },
},
};

const idiomasValidos = ["pt-BR", "en-US", "es-ES"];

const idiomaSalvo = localStorage.getItem("idioma");
const idiomaInicial = idiomasValidos.includes(idiomaSalvo)
  ? idiomaSalvo
  : "pt-BR";

localStorage.setItem("idioma", idiomaInicial);

i18n.use(initReactI18next).init({
  resources,
  lng: idiomaInicial,
  fallbackLng: "pt-BR",
  returnEmptyString: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;