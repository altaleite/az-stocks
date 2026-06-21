AZ Stocks v19 — Atualizar preços pela planilha

A carteira continua sendo editada e salva no navegador (v18). A novidade é que
a atualização automática de preço VOLTOU, agora usando a planilha só como
tabela de preços.

COMO FUNCIONA
- A planilha precisa ter uma tabela simples com cabeçalho, por exemplo:
    codigo | pais | tipo | valorAtual
  Onde "valorAtual" usa GOOGLEFINANCE para manter a cotação automática, ex.:
    =IFERROR(GOOGLEFINANCE("BVMF:"&A2;"price"); GOOGLEFINANCE(A2;"price"))
- O botão "Atualizar preços" (no topo) lê essa tabela e atualiza SÓ o preço
  atual dos seus ativos, casando pelo código (ignora maiúsculas/minúsculas).
  Não toca em quantidade, preço médio, gatilhos nem observação.
- Código repetido em corretoras diferentes (ex.: SPY na Nomad e na Avenue) recebe
  o mesmo preço — o que é o correto.
- Ao abrir o painel, ele já tenta atualizar os preços sozinho, sem incomodar se
  a planilha estiver fora do ar.
- Se algum ativo do site não tiver código correspondente na planilha, ele
  mantém o preço atual e o painel avisa quais ficaram de fora.

REQUISITOS
- A planilha precisa estar pública ("qualquer pessoa com o link pode ver").
- O painel lê a aba pelo gid configurado em config.js (GOOGLE_SHEET_GID).
  Hoje: gid 33218330. Se você usar outra aba, ajuste lá.
- A coluna de preço é encontrada pelo nome do cabeçalho (valorAtual / preço /
  valor / price). Se não achar pelo nome, usa a última coluna.

LEMBRETE (continua valendo do v18)
- Ativo novo: você cadastra no site (quantidade, preço médio, etc.) e, para ele
  ter preço automático, inclui também o código numa linha nova da planilha.
- A carteira mora no navegador. Use "Exportar backup" de vez em quando.

REMOVIDO
- O antigo "Importar da planilha" saiu, porque a planilha não tem mais a carteira
  completa (só preços).

Subir no GitHub (todos):
  index.html, style.css, script.js, carteira.js, config.js

Abrir:
  https://altaleite.github.io/az-stocks/?v=19
