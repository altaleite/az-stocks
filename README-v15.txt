AZ Stocks v15 — "Organizar a casa"

O que mudou (só arrumação — nenhum dado, preço ou regra de decisão foi alterado):

1. CSS limpo
   - Removidos os blocos v13/v13b/v13c que estavam triplicados e o CSS morto
     de ".quebras-gerenciais" (elemento que nem existe mais no HTML).
   - Arquivo caiu de ~900 para ~620 linhas, sem mudança visual indesejada.
   - Adicionado foco visível de teclado e respeito a "prefers-reduced-motion".

2. Patrimônio total consolidado (novo herói no topo)
   - Soma EUA + Brasil num único número em reais.
   - EUA é convertido em BRL pelo câmbio definido no config.js.
   - Mostra resultado total e rentabilidade total consolidada.

3. Planilha como fonte única + selo de origem
   - Selo no topo indica de onde vieram os dados:
       "Ao vivo · planilha"  (verde)  -> leu do Google Sheets
       "Local · carteira.js" (laranja) -> usou o fallback local
   - Em carteira.js há agora window.CARTEIRA_AZ_SNAPSHOT: preencha com a data
     (ex.: "17/06/2026") e o selo passa a mostrar "Local · snapshot de 17/06/2026".

4. Segurança
   - Os textos da tabela (código, tipo, plataforma, observação) agora são
     escapados antes de irem para a tela.

Câmbio (config.js):
   - USD_BRL: 5.18  (semente em 17/06/2026 — edite quando quiser)
   - USD_BRL_DATA: "17/06/2026"
   - Esse câmbio só é usado para consolidar o total em BRL. Nenhum cálculo por
     ativo depende dele.
   - Dica p/ deixar automático no futuro: numa célula da planilha use
     =GOOGLEFINANCE("CURRENCY:USDBRL") e, numa próxima versão, o painel lê de lá.

Subir no GitHub:
   - index.html
   - style.css
   - script.js
   - carteira.js
   - config.js

Abrir:
   https://altaleite.github.io/az-stocks/?v=15

Próximo passo combinado (Fase 1, ainda não feito):
   - Trocar a regra de decisão de "% sobre o preço médio" para "desvio da
     alocação-alvo" por ativo/região, separando ETF de índice de ação individual.
