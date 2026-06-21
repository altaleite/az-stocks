AZ Stocks v18 — Edição direta no site (sem planilha)

Agora a carteira é editada no próprio painel e fica salva NESTE NAVEGADOR.
A planilha do Google deixou de ser a fonte do dia a dia.

COMO USAR
- Clique em "Editar carteira" (canto superior direito) para entrar no modo edição.
- "+ Adicionar ativo": abre o formulário (código, nome, tipo, plataforma, país,
  quantidade, preço médio, preço atual, gatilhos de compra/venda, observação).
- Em cada linha, no modo edição, aparecem os botões "Editar" e "Excluir".
- Clique em "Concluir edição" para voltar à visualização normal.

IMPORTANTE — onde os dados ficam
- Tudo é salvo no armazenamento do navegador (localStorage). Isso significa:
  * Funciona offline e é instantâneo.
  * Os dados ficam SÓ neste navegador/aparelho. Em outro computador ou celular,
    ou se você limpar os dados do navegador, a carteira não estará lá.
- Por isso existe o BACKUP (no modo edição):
  * "Exportar backup": baixa um arquivo .json com toda a carteira. Guarde-o.
  * "Importar backup": recarrega a carteira a partir de um arquivo desses
    (use para restaurar ou levar para outro aparelho).

PREÇO AGORA É MANUAL
- Como saímos da planilha, o "Preço atual" é digitado por você no formulário.
- O GOOGLEFINANCE (atualização automática de cotação) só funcionava dentro do
  Google Sheets, então não atualiza mais sozinho.

MIGRAÇÃO (primeira vez)
- Se a sua carteira de verdade está na planilha, entre no modo edição e clique
  em "Importar da planilha": ele puxa os dados atuais do Sheets e passa a usar
  localmente. (A planilha precisa estar pública para isso funcionar.)

SOBRE O carteira.js
- Ele agora serve só de "semente": é usado na PRIMEIRA vez que o painel abre,
  quando ainda não há nada salvo no navegador.
- Depois que você começa a editar no site, o painel usa o que está salvo no
  navegador. Editar o carteira.js depois disso não muda nada (a menos que você
  limpe o armazenamento do navegador).

O câmbio USD/BRL continua no config.js (manual), usado só para o total em reais.

Subir no GitHub (todos):
  index.html, style.css, script.js, carteira.js, config.js

Abrir:
  https://altaleite.github.io/az-stocks/?v=18
