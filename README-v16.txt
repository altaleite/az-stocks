AZ Stocks v16 — Layout repaginado

Nenhum dado, preço, câmbio ou regra de decisão foi alterado. Só visual e usabilidade.

1. Tipografia financeira
   - Fontes novas: Space Grotesk (títulos e números grandes) + Inter (texto e tabela).
   - Números tabulares (tabular-nums) em todo lugar: as colunas da tabela e os
     valores agora alinham casa com casa.

2. Os 8 mini-cards viraram 2 painéis de região
   - "Estados Unidos" (USD) e "Brasil" (BRL), cada um com Investido, Atual,
     Resultado e Rentabilidade lado a lado. Menos repetição, leitura mais clara.

3. Cards de situação agora filtram a tabela
   - Clique em "Comprar", "Venda parcial", "Atenção" ou "Neutras" para ver só
     aqueles ativos. Clique de novo (ou em "Limpar filtros") para voltar.
   - O dropdown de situação saiu — os cards fazem esse papel agora.
   - Os contadores dos cards acompanham o filtro de plataforma/busca.

4. Tabela mais fácil de escanear
   - Colunas numéricas alinhadas à direita (padrão de planilha financeira).
   - Agrupada por corretora (com contagem e posição total de cada uma) quando
     está na ordenação padrão. Ao clicar para ordenar por uma coluna, o
     agrupamento sai e a ordenação assume.
   - Cabeçalho fixo ao rolar e zebra suave nas linhas.

Observação técnica:
   - As fontes vêm do Google Fonts (precisa de internet). Sem conexão, cai em
     fontes do sistema sem quebrar nada.

Subir no GitHub (todos):
   - index.html
   - style.css
   - script.js
   - carteira.js
   - config.js

Abrir:
   https://altaleite.github.io/az-stocks/?v=16

Próximo passo (Fase 1, ainda não feito):
   - Regra de decisão por desvio da alocação-alvo, em vez de % sobre o preço médio.
