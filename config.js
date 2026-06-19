// AZ Stocks — configuração da planilha Google
// Planilha conectada ao painel AZ Stocks
// Versão v15 — planilha como fonte única + patrimônio consolidado

window.AZ_CONFIG = {
  GOOGLE_SHEET_ID: "1Jfu04erEfI7nfAIW6bhItWt7qYbWsqztsffF3tbv0wE",
  SHEET_NAME: "Dados",
  GOOGLE_SHEET_URL: "https://docs.google.com/spreadsheets/d/1Jfu04erEfI7nfAIW6bhItWt7qYbWsqztsffF3tbv0wE/edit?gid=33218330#gid=33218330",

  // Câmbio USD -> BRL usado só para consolidar o patrimônio total em reais.
  // Não afeta nenhum cálculo por ativo; é apenas a "régua" para somar EUA + Brasil.
  // Atualize quando quiser (basta editar o número e a data).
  USD_BRL: 5.18,
  USD_BRL_DATA: "17/06/2026"
};
