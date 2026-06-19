AZ Stocks v17 — Funções da tabela

Nenhum preço, quantidade, câmbio ou regra de decisão foi alterado.

O que mudou:

1. Saiu o "Buscar na tabela".

2. Coluna "Ativo" com o nome da empresa
   - A antiga coluna "Código" virou "Ativo": o nome da empresa aparece em
     destaque e o código (ticker) fica logo abaixo, menor. O nome lidera.
   - Os nomes ficam num mapa editável no fim do carteira.js (window.NOMES_ATIVOS).
     Se um código não estiver lá, o painel mostra só o código. Edite/corrija à
     vontade — confira se algum nome não bate com o que você espera.

3. Filtro por Tipo (Ação / ETF)
   - Entrou no lugar da busca. Combina com o filtro de Plataforma e com os cards
     de situação.

4. Barra de peso
   - A coluna Peso agora mostra o número e uma barrinha proporcional, pra bater o
     olho e ver as maiores posições. (A barra é relativa ao maior peso da lista
     visível no momento.)

5. Contador + estado vazio
   - No canto dos filtros: "26 ativos" ou "Mostrando X de 26 ativos" quando há
     filtro. Se nenhum ativo bater com os filtros, aparece um aviso amigável no
     lugar da tabela vazia.

Subir no GitHub (todos):
   - index.html
   - style.css
   - script.js
   - carteira.js
   - config.js

Abrir:
   https://altaleite.github.io/az-stocks/?v=17

Próximo passo (Fase 1, ainda não feito):
   - Regra de decisão por desvio da alocação-alvo, em vez de % sobre o preço médio.
     A barra de peso já é um primeiro passo visual nessa direção.
