// AZ Stocks — configuração da planilha de preços (Google Sheets)
// A planilha agora é só uma TABELA DE PREÇOS: codigo + valorAtual (GOOGLEFINANCE).
// O painel lê essa tabela e atualiza apenas o preço atual dos seus ativos.

window.AZ_CONFIG = {
  GOOGLE_SHEET_ID: "1Jfu04erEfI7nfAIW6bhItWt7qYbWsqztsffF3tbv0wE",
  GOOGLE_SHEET_GID: "33218330",        // aba exata onde estão os preços
  SHEET_NAME: "Dados",                  // usado como reserva caso o gid falhe
  GOOGLE_SHEET_URL: "https://docs.google.com/spreadsheets/d/1Jfu04erEfI7nfAIW6bhItWt7qYbWsqztsffF3tbv0wE/edit?gid=33218330#gid=33218330",

  // Câmbio USD -> BRL só para consolidar o patrimônio total em reais. Edite quando quiser.
  USD_BRL: 5.18,
  USD_BRL_DATA: "17/06/2026"
};
