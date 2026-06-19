// AZ Stocks — carteira editável
// Para atualizar sua carteira, altere os dados abaixo.
// Atenção: use ponto para casas decimais. Exemplo: 487.23

// Data deste snapshot local (preços de fallback). Quando a planilha carrega ao vivo,
// estes valores nem são usados. Atualize a data sempre que editar os preços abaixo.
window.CARTEIRA_AZ_SNAPSHOT = "";

window.CARTEIRA_AZ = [
  { codigo: "MSFT", tipo: "Ação", observacao: "Big tech / longo prazo", plataforma: "Nomad", pais: "EUA", quantidade: 0.4157, precoMedio: 487.23, valorAtual: 390.70, compra: 8, venda: 22.5 },
  { codigo: "AAPL", tipo: "Ação", observacao: "Big tech / longo prazo", plataforma: "Nomad", pais: "EUA", quantidade: 0.7598, precoMedio: 266.51, valorAtual: 291.51, compra: 8, venda: 22.5 },
  { codigo: "UNH", tipo: "Ação", observacao: "Saúde", plataforma: "Nomad", pais: "EUA", quantidade: 0.6036, precoMedio: 331.07, valorAtual: 408.78, compra: 8, venda: 22.5 },
  { codigo: "PG", tipo: "Ação", observacao: "Defensiva", plataforma: "Nomad", pais: "EUA", quantidade: 1.0062, precoMedio: 156.13, valorAtual: 149.73, compra: 8, venda: 22.5 },
  { codigo: "NVO", tipo: "Ação", observacao: "Saúde", plataforma: "Nomad", pais: "EUA", quantidade: 1.5026, precoMedio: 50.12, valorAtual: 44.01, compra: 10, venda: 22.5 },
  { codigo: "TSLA", tipo: "Ação", observacao: "Crescimento / volátil", plataforma: "Nomad", pais: "EUA", quantidade: 0.2842, precoMedio: 444.64, valorAtual: 406.10, compra: 10, venda: 22.5 },
  { codigo: "NFLX", tipo: "Ação", observacao: "Crescimento", plataforma: "Nomad", pais: "EUA", quantidade: 1.1796, precoMedio: 89.04, valorAtual: 80.37, compra: 10, venda: 22.5 },
  { codigo: "SPOT", tipo: "Ação", observacao: "Crescimento", plataforma: "Nomad", pais: "EUA", quantidade: 0.1605, precoMedio: 622.87, valorAtual: 481.71, compra: 10, venda: 22.5 },
  { codigo: "ADBE", tipo: "Ação", observacao: "Revisar tese", plataforma: "Nomad", pais: "EUA", quantidade: 0.5722, precoMedio: 349.55, valorAtual: 204.21, compra: 10, venda: 22.5 },
  { codigo: "BIIB", tipo: "Ação", observacao: "Revisar tese", plataforma: "Nomad", pais: "EUA", quantidade: 0.7448, precoMedio: 268.74, valorAtual: 200.05, compra: 10, venda: 22.5 },
  { codigo: "MSTR", tipo: "Ação", observacao: "Volátil", plataforma: "Nomad", pais: "EUA", quantidade: 0.6602, precoMedio: 318.09, valorAtual: 124.22, compra: 10, venda: 22.5 },
  { codigo: "VEU", tipo: "ETF", observacao: "ETF internacional", plataforma: "Nomad", pais: "EUA", quantidade: 4.70401, precoMedio: 78.62, valorAtual: 83.99, compra: 8, venda: 22.5 },
  { codigo: "SPY", tipo: "ETF", observacao: "ETF principal", plataforma: "Nomad", pais: "EUA", quantidade: 3.5228, precoMedio: 530.26, valorAtual: 742.45, compra: 8, venda: 22.5 },
  { codigo: "IVV", tipo: "ETF", observacao: "ETF principal", plataforma: "Nomad", pais: "EUA", quantidade: 3.95028, precoMedio: 514.61, valorAtual: 745.80, compra: 8, venda: 22.5 },

  { codigo: "META", tipo: "Ação", observacao: "Big tech", plataforma: "Avenue", pais: "EUA", quantidade: 2.16011, precoMedio: 242.93, valorAtual: 566.98, compra: 8, venda: 22.5 },
  { codigo: "SPY", tipo: "ETF", observacao: "ETF principal", plataforma: "Avenue", pais: "EUA", quantidade: 3.71346, precoMedio: 511.40, valorAtual: 741.77, compra: 8, venda: 22.5 },
  { codigo: "IVV", tipo: "ETF", observacao: "ETF principal", plataforma: "Avenue", pais: "EUA", quantidade: 4.09518, precoMedio: 416.86, valorAtual: 745.20, compra: 8, venda: 22.5 },
  { codigo: "RARE", tipo: "Ação", observacao: "Revisar tese", plataforma: "Avenue", pais: "EUA", quantidade: 5.02344, precoMedio: 49.77, valorAtual: 24.35, compra: 10, venda: 22.5 },

  { codigo: "TAEE11", tipo: "Ação", observacao: "Dividendos", plataforma: "Nubank", pais: "Brasil", quantidade: 12, precoMedio: 43.88, valorAtual: 39.69, compra: 8, venda: 22.5 },
  { codigo: "VALE3", tipo: "Ação", observacao: "Commodities", plataforma: "Nubank", pais: "Brasil", quantidade: 52, precoMedio: 80.34, valorAtual: 79.17, compra: 8, venda: 22.5 },
  { codigo: "HYPE3", tipo: "Ação", observacao: "Saúde Brasil", plataforma: "Nubank", pais: "Brasil", quantidade: 71, precoMedio: 24.01, valorAtual: 21.49, compra: 8, venda: 22.5 },
  { codigo: "ITUB4", tipo: "Ação", observacao: "Banco", plataforma: "Nubank", pais: "Brasil", quantidade: 35, precoMedio: 42.22, valorAtual: 40.60, compra: 8, venda: 22.5 },
  { codigo: "VIVA3", tipo: "Ação", observacao: "Varejo", plataforma: "Nubank", pais: "Brasil", quantidade: 16, precoMedio: 31.33, valorAtual: 21.33, compra: 10, venda: 22.5 },
  { codigo: "BIOM3", tipo: "Ação", observacao: "Posição pequena", plataforma: "Nubank", pais: "Brasil", quantidade: 70, precoMedio: 7.04, valorAtual: 6.70, compra: 10, venda: 22.5 },
  { codigo: "BOVA11", tipo: "ETF", observacao: "ETF Brasil", plataforma: "Nubank", pais: "Brasil", quantidade: 6, precoMedio: 161.01, valorAtual: 167.92, compra: 8, venda: 22.5 },

  { codigo: "XLV", tipo: "ETF", observacao: "ETF saúde", plataforma: "Inter", pais: "EUA", quantidade: 0.42011, precoMedio: 155.72, valorAtual: 153.81, compra: 8, venda: 22.5 }
];

// Nomes das empresas/fundos por código. Usado só para exibição na coluna "Ativo".
// Edite à vontade — se um código não estiver aqui, o painel mostra só o código.
window.NOMES_ATIVOS = {
  MSFT: "Microsoft",
  AAPL: "Apple",
  UNH: "UnitedHealth Group",
  PG: "Procter & Gamble",
  NVO: "Novo Nordisk",
  TSLA: "Tesla",
  NFLX: "Netflix",
  SPOT: "Spotify",
  ADBE: "Adobe",
  BIIB: "Biogen",
  MSTR: "Strategy (MicroStrategy)",
  VEU: "Vanguard All-World ex-US",
  SPY: "SPDR S&P 500",
  IVV: "iShares S&P 500",
  META: "Meta Platforms",
  RARE: "Ultragenyx Pharmaceutical",
  XLV: "Health Care SPDR",
  TAEE11: "Taesa",
  VALE3: "Vale",
  HYPE3: "Hypera",
  ITUB4: "Itaú Unibanco",
  VIVA3: "Vivara",
  BIOM3: "Biomm",
  BOVA11: "iShares Ibovespa"
};
