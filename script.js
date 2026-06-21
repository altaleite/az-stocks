let ativos = [];
let situacaoSelecionada = "Todas";
let modoEdicao = false;
let editandoId = null;

const STORAGE_KEY = "az_stocks_v18";

const corpoTabela = document.getElementById("corpoTabela");
const filtroPlataforma = document.getElementById("filtroPlataforma");
const filtroTipo = document.getElementById("filtroTipo");
const contadorAtivos = document.getElementById("contadorAtivos");
const botaoLimpar = document.getElementById("limparFiltros");
const ultimaAtualizacao = document.getElementById("ultimaAtualizacao");
const mensagemAtualizacao = document.getElementById("mensagemAtualizacao");
const badgeOrigem = document.getElementById("badgeOrigem");
const cartoesSituacao = Array.from(document.querySelectorAll(".cartao[data-situacao]"));

// Edição
const botaoEditar = document.getElementById("botaoEditar");
const barraEdicao = document.getElementById("barraEdicao");
const botaoAdicionar = document.getElementById("botaoAdicionar");
const botaoExportar = document.getElementById("botaoExportar");
const inputImportar = document.getElementById("inputImportar");
const botaoImportarPlanilha = document.getElementById("botaoImportarPlanilha");

// Modal
const modalAtivo = document.getElementById("modalAtivo");
const tituloForm = document.getElementById("tituloForm");
const formErro = document.getElementById("formErro");
const botaoSalvar = document.getElementById("botaoSalvar");
const botaoCancelar = document.getElementById("botaoCancelar");
const botaoExcluir = document.getElementById("botaoExcluir");
const listaPlataformas = document.getElementById("lista_plataformas");
const F = {
  codigo: document.getElementById("f_codigo"),
  nome: document.getElementById("f_nome"),
  tipo: document.getElementById("f_tipo"),
  plataforma: document.getElementById("f_plataforma"),
  pais: document.getElementById("f_pais"),
  quantidade: document.getElementById("f_quantidade"),
  precoMedio: document.getElementById("f_precoMedio"),
  valorAtual: document.getElementById("f_valorAtual"),
  compra: document.getElementById("f_compra"),
  venda: document.getElementById("f_venda"),
  observacao: document.getElementById("f_observacao")
};

let ordenacaoAtual = { campo: "padrao", direcao: "asc" };

function esc(valor) {
  return String(valor == null ? "" : valor).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function cambioUSDBRL() {
  const c = Number((window.AZ_CONFIG || {}).USD_BRL);
  return c > 0 ? c : 0;
}

function nomeAtivo(a) {
  if (a && typeof a === "object" && a.nome) return a.nome;
  const mapa = window.NOMES_ATIVOS || {};
  const cod = (a && typeof a === "object") ? a.codigo : a;
  return mapa[cod] || "";
}

function moedaDoAtivo(ativo) { return ativo.pais === "Brasil" ? "BRL" : "USD"; }
function formatarMoedaPorCodigo(valor, currency) { return Number(valor).toLocaleString("pt-BR", { style: "currency", currency }); }
function formatarMoeda(valor, ativo) { return formatarMoedaPorCodigo(valor, moedaDoAtivo(ativo)); }
function formatarNumero(valor) { return Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 5 }); }
function formatarPercentual(valor) { return `${Number(valor).toFixed(2).replace(".", ",")}%`; }

function numero(valor) {
  if (typeof valor === "number") return valor;
  if (valor === null || valor === undefined) return 0;
  const texto = String(valor).trim().replace("R$", "").replace("US$", "").replace(/\s/g, "");
  if (texto.includes(",") && texto.includes(".")) return Number(texto.replace(/\./g, "").replace(",", ".")) || 0;
  if (texto.includes(",")) return Number(texto.replace(",", ".")) || 0;
  return Number(texto) || 0;
}

function valorInvestido(a) { return numero(a.quantidade) * numero(a.precoMedio); }
function valorPosicao(a) { return numero(a.quantidade) * numero(a.valorAtual); }
function resultadoFinanceiro(a) { return valorPosicao(a) - valorInvestido(a); }
function calcularRentabilidade(a) { return ((numero(a.valorAtual) - numero(a.precoMedio)) / numero(a.precoMedio)) * 100; }

function definirSituacao(a) {
  const r = calcularRentabilidade(a);
  if (r <= -30) return { texto: "Atenção", classe: "atencao" };
  if (r <= -numero(a.compra)) return { texto: "Comprar", classe: "comprar" };
  if (r >= numero(a.venda)) return { texto: "Venda parcial", classe: "vender" };
  return { texto: "Neutra", classe: "neutra" };
}

function enriquecerAtivos(lista) {
  const totalUSD = lista.filter(a => a.pais !== "Brasil").reduce((s, a) => s + valorPosicao(a), 0);
  const totalBRL = lista.filter(a => a.pais === "Brasil").reduce((s, a) => s + valorPosicao(a), 0);
  return lista.map(ativo => {
    const investido = valorInvestido(ativo);
    const posicao = valorPosicao(ativo);
    const resultado = resultadoFinanceiro(ativo);
    const rentabilidade = calcularRentabilidade(ativo);
    const situacao = definirSituacao(ativo);
    const totalMoeda = ativo.pais === "Brasil" ? totalBRL : totalUSD;
    const peso = totalMoeda > 0 ? (posicao / totalMoeda) * 100 : 0;
    return { ...ativo, investido, posicao, resultado, rentabilidade, situacao, peso, nome: nomeAtivo(ativo) };
  });
}

function valorOrdenacao(a, campo) {
  const mapa = {
    codigo: a.codigo, nome: a.nome, tipo: a.tipo, plataforma: a.plataforma,
    quantidade: a.quantidade, precoMedio: a.precoMedio, valorAtual: a.valorAtual,
    investido: a.investido, posicao: a.posicao, resultado: a.resultado,
    rentabilidade: a.rentabilidade, peso: a.peso, situacao: a.situacao?.texto, observacao: a.observacao
  };
  return mapa[campo];
}

function compararValores(a, b, campo, direcao) {
  const vA = valorOrdenacao(a, campo), vB = valorOrdenacao(b, campo);
  let r = 0;
  if (typeof vA === "number" || typeof vB === "number") r = numero(vA) - numero(vB);
  else r = String(vA || "").localeCompare(String(vB || ""), "pt-BR", { sensitivity: "base", numeric: true });
  return direcao === "asc" ? r : -r;
}

function ordenarPadrao(a, b) {
  const c = String(a.plataforma || "").localeCompare(String(b.plataforma || ""), "pt-BR", { sensitivity: "base" });
  if (c !== 0) return c;
  return String(a.codigo || "").localeCompare(String(b.codigo || ""), "pt-BR", { sensitivity: "base", numeric: true });
}

function listaBase() {
  return enriquecerAtivos(ativos)
    .filter(a => filtroPlataforma.value === "Todas" || a.plataforma === filtroPlataforma.value)
    .filter(a => filtroTipo.value === "Todos" || a.tipo === filtroTipo.value);
}

function listaParaTabela() {
  const lista = listaBase().filter(a => situacaoSelecionada === "Todas" || a.situacao.texto === situacaoSelecionada);
  if (ordenacaoAtual.campo === "padrao") return lista.sort(ordenarPadrao);
  return lista.sort((a, b) => compararValores(a, b, ordenacaoAtual.campo, ordenacaoAtual.direcao));
}

function atualizarIndicadorOrdenacao() {
  document.querySelectorAll(".ordenar-coluna").forEach(botao => {
    const campo = botao.dataset.sort;
    botao.classList.remove("ativo", "asc", "desc");
    if (campo === ordenacaoAtual.campo) botao.classList.add("ativo", ordenacaoAtual.direcao);
  });
}

function atualizarCartoes(lista) {
  const t = { comprar: 0, vender: 0, atencao: 0, neutra: 0 };
  lista.forEach(a => {
    const s = a.situacao.texto;
    if (s === "Comprar") t.comprar++;
    if (s === "Venda parcial") t.vender++;
    if (s === "Atenção") t.atencao++;
    if (s === "Neutra") t.neutra++;
  });
  document.getElementById("totalComprar").textContent = t.comprar;
  document.getElementById("totalVender").textContent = t.vender;
  document.getElementById("totalAtencao").textContent = t.atencao;
  document.getElementById("totalNeutras").textContent = t.neutra;
}

function atualizarCartoesAtivos() {
  cartoesSituacao.forEach(card => card.setAttribute("aria-pressed", card.dataset.situacao === situacaoSelecionada ? "true" : "false"));
}

function resumoPorPais(lista, brasil) {
  const f = lista.filter(a => brasil ? a.pais === "Brasil" : a.pais !== "Brasil");
  const investido = f.reduce((s, a) => s + valorInvestido(a), 0);
  const atual = f.reduce((s, a) => s + valorPosicao(a), 0);
  const resultado = atual - investido;
  const rentabilidade = investido > 0 ? (resultado / investido) * 100 : 0;
  return { investido, atual, resultado, rentabilidade };
}

function atualizarCampo(id, valor, tipo) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = tipo === "%" ? formatarPercentual(valor) : formatarMoedaPorCodigo(valor, tipo);
  if (id.includes("resultado") || id.includes("rentabilidade")) el.className = valor >= 0 ? "positivo" : "negativo";
}

function atualizarResumoFinanceiro(lista) {
  const eua = resumoPorPais(lista, false);
  const brasil = resumoPorPais(lista, true);
  atualizarCampo("valorInvestidoEUA", eua.investido, "USD");
  atualizarCampo("valorAtualEUA", eua.atual, "USD");
  atualizarCampo("resultadoEUA", eua.resultado, "USD");
  atualizarCampo("rentabilidadeEUA", eua.rentabilidade, "%");
  atualizarCampo("valorInvestidoBrasil", brasil.investido, "BRL");
  atualizarCampo("valorAtualBrasil", brasil.atual, "BRL");
  atualizarCampo("resultadoBrasil", brasil.resultado, "BRL");
  atualizarCampo("rentabilidadeBrasil", brasil.rentabilidade, "%");
  return { eua, brasil };
}

function atualizarHeroConsolidado(eua, brasil) {
  const cambio = cambioUSDBRL();
  const euaEmBRL = eua.atual * cambio;
  const investidoEUAEmBRL = eua.investido * cambio;
  const patrimonio = euaEmBRL + brasil.atual;
  const investidoTotal = investidoEUAEmBRL + brasil.investido;
  const resultado = patrimonio - investidoTotal;
  const rentab = investidoTotal > 0 ? (resultado / investidoTotal) * 100 : 0;

  document.getElementById("patrimonioTotal").textContent = formatarMoedaPorCodigo(patrimonio, "BRL");
  document.getElementById("patrimonioEUA").textContent = formatarMoedaPorCodigo(euaEmBRL, "BRL");
  document.getElementById("patrimonioBrasil").textContent = formatarMoedaPorCodigo(brasil.atual, "BRL");

  const cambioData = (window.AZ_CONFIG || {}).USD_BRL_DATA;
  const cambioTexto = cambio > 0 ? `R$ ${cambio.toFixed(2).replace(".", ",")}` : "—";
  document.getElementById("cambioInfo").textContent = cambio > 0 && cambioData ? `${cambioTexto} · ${cambioData}` : cambioTexto;

  const el = document.getElementById("patrimonioResultado");
  const sinal = resultado >= 0 ? "+" : "";
  el.textContent = `${sinal}${formatarMoedaPorCodigo(resultado, "BRL")}  (${sinal}${formatarPercentual(rentab)})`;
  el.className = `hero-resultado ${resultado >= 0 ? "positivo" : "negativo"}`;
}

function atualizarBadgeOrigem() {
  if (!badgeOrigem) return;
  badgeOrigem.textContent = `Salvo neste navegador · ${ativos.length} ${ativos.length === 1 ? "ativo" : "ativos"}`;
  badgeOrigem.className = "badge-origem salvo";
}

function atualizarBotaoLimpar() {
  if (!botaoLimpar) return;
  botaoLimpar.hidden = !(situacaoSelecionada !== "Todas" || filtroPlataforma.value !== "Todas" || filtroTipo.value !== "Todos");
}

function atualizarContador(qtd) {
  if (!contadorAtivos) return;
  const total = ativos.length;
  contadorAtivos.textContent = qtd === total ? `${total} ativos` : `Mostrando ${qtd} de ${total} ativos`;
}

function celulaGrupo(plataforma, qtd, totalPos, moeda) {
  const tr = document.createElement("tr");
  tr.className = "grupo";
  tr.innerHTML = `<td colspan="14"><div class="grupo-conteudo">
    <span class="grupo-nome">${esc(plataforma)}</span>
    <span class="grupo-meta">${qtd} ${qtd === 1 ? "ativo" : "ativos"} · ${formatarMoedaPorCodigo(totalPos, moeda)}</span>
  </div></td>`;
  return tr;
}

function renderizarTabela() {
  const lista = listaParaTabela();
  corpoTabela.innerHTML = "";
  const agrupar = ordenacaoAtual.campo === "padrao";
  let plataformaAtual = null;
  const maxPeso = lista.reduce((m, a) => Math.max(m, a.peso), 0) || 1;

  lista.forEach(a => {
    if (agrupar && a.plataforma !== plataformaAtual) {
      plataformaAtual = a.plataforma;
      const doGrupo = lista.filter(x => x.plataforma === plataformaAtual);
      const totalPos = doGrupo.reduce((s, x) => s + x.posicao, 0);
      const moeda = doGrupo[0].pais === "Brasil" ? "BRL" : "USD";
      corpoTabela.appendChild(celulaGrupo(plataformaAtual, doGrupo.length, totalPos, moeda));
    }
    const tr = document.createElement("tr");
    tr.className = "dado";
    const classeRent = a.rentabilidade >= 0 ? "positiva" : "negativa";
    const classeRes = a.resultado >= 0 ? "positiva" : "negativa";
    const larguraPeso = Math.max(4, (a.peso / maxPeso) * 100);
    const nomeExib = a.nome ? esc(a.nome) : esc(a.codigo);
    const codigoExib = a.nome ? `<span class="ativo-codigo">${esc(a.codigo)}</span>` : "";

    tr.innerHTML = `
      <td class="celula-ativo"><span class="ativo-nome">${nomeExib}</span>${codigoExib}</td>
      <td><span class="tipo-ativo">${esc(a.tipo || "-")}</span></td>
      <td><span class="plataforma">${esc(a.plataforma)}</span></td>
      <td class="num">${formatarNumero(a.quantidade)}</td>
      <td class="num">${formatarMoeda(a.precoMedio, a)}</td>
      <td class="num">${formatarMoeda(a.valorAtual, a)}</td>
      <td class="num">${formatarMoeda(a.investido, a)}</td>
      <td class="num">${formatarMoeda(a.posicao, a)}</td>
      <td class="num rentabilidade ${classeRes}">${formatarMoeda(a.resultado, a)}</td>
      <td class="num rentabilidade ${classeRent}">${formatarPercentual(a.rentabilidade)}</td>
      <td class="num celula-peso"><span class="peso-valor">${formatarPercentual(a.peso)}</span>
        <span class="peso-barra"><span style="width:${larguraPeso.toFixed(1)}%"></span></span></td>
      <td><span class="situacao ${a.situacao.classe}">${esc(a.situacao.texto)}</span></td>
      <td class="observacao-tabela" title="${esc(a.observacao || "")}">${esc(a.observacao || "")}</td>
      <td class="col-acoes">
        <button type="button" class="acao-linha" data-id="${a._id}" data-acao="editar">Editar</button>
        <button type="button" class="acao-linha excluir" data-id="${a._id}" data-acao="excluir">Excluir</button>
      </td>`;
    corpoTabela.appendChild(tr);
  });

  if (!lista.length) {
    const tr = document.createElement("tr");
    tr.className = "sem-dados";
    tr.innerHTML = `<td colspan="14">Nenhum ativo com esses filtros. Use “Limpar filtros” para ver tudo.</td>`;
    corpoTabela.appendChild(tr);
  }

  const base = listaBase();
  atualizarCartoes(base);
  atualizarContador(lista.length);
  const { eua, brasil } = atualizarResumoFinanceiro(ativos);
  atualizarHeroConsolidado(eua, brasil);
  atualizarBadgeOrigem();
  atualizarCartoesAtivos();
  atualizarIndicadorOrdenacao();
  atualizarBotaoLimpar();
}

function atualizarData() {
  ultimaAtualizacao.textContent = `Carteira salva neste navegador • ${new Date().toLocaleString("pt-BR")}`;
}

/* ---------- Persistência local ---------- */
function normalizarLista(lista) {
  let maxId = 0;
  lista.forEach(a => { if (a._id && a._id > maxId) maxId = a._id; });
  return lista.map(a => {
    const item = { ...a };
    if (!item._id) item._id = ++maxId;
    if (item.nome === undefined || item.nome === null) item.nome = nomeAtivo(item);
    return item;
  });
}

function salvarLocal() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ativos)); } catch (e) { console.error(e); }
}

function carregarLocal() {
  try {
    const txt = localStorage.getItem(STORAGE_KEY);
    if (!txt) return null;
    const arr = JSON.parse(txt);
    return Array.isArray(arr) && arr.length ? arr : null;
  } catch (e) { return null; }
}

function inicializarDados() {
  const local = carregarLocal();
  if (local) {
    ativos = normalizarLista(local);
  } else {
    ativos = normalizarLista(window.CARTEIRA_AZ || []);
    salvarLocal();
  }
}

function mensagem(texto, tipo) {
  if (!mensagemAtualizacao) return;
  mensagemAtualizacao.textContent = texto;
  mensagemAtualizacao.className = "observacao" + (tipo === "sucesso" ? " mensagem-sucesso" : tipo === "erro" ? " mensagem-erro" : "");
}

/* ---------- Formulário (adicionar / editar) ---------- */
function preencherPlataformasDatalist() {
  if (!listaPlataformas) return;
  const nomes = [...new Set(ativos.map(a => a.plataforma).filter(Boolean))].sort();
  listaPlataformas.innerHTML = nomes.map(n => `<option value="${esc(n)}"></option>`).join("");
}

function abrirFormulario(asset) {
  editandoId = asset ? asset._id : null;
  tituloForm.textContent = asset ? "Editar ativo" : "Adicionar ativo";
  formErro.hidden = true;
  preencherPlataformasDatalist();

  F.codigo.value = asset ? asset.codigo : "";
  F.nome.value = asset ? (asset.nome || "") : "";
  F.tipo.value = asset ? (asset.tipo || "Ação") : "Ação";
  F.plataforma.value = asset ? asset.plataforma : "";
  F.pais.value = asset ? (asset.pais || "EUA") : "EUA";
  F.quantidade.value = asset ? asset.quantidade : "";
  F.precoMedio.value = asset ? asset.precoMedio : "";
  F.valorAtual.value = asset ? asset.valorAtual : "";
  F.compra.value = asset ? asset.compra : "8";
  F.venda.value = asset ? asset.venda : "22.5";
  F.observacao.value = asset ? (asset.observacao || "") : "";

  botaoExcluir.hidden = !asset;
  modalAtivo.hidden = false;
  F.codigo.focus();
}

function fecharFormulario() {
  modalAtivo.hidden = true;
  editandoId = null;
}

function salvarFormulario() {
  const dados = {
    codigo: F.codigo.value.trim().toUpperCase(),
    nome: F.nome.value.trim(),
    tipo: F.tipo.value,
    plataforma: F.plataforma.value.trim(),
    pais: F.pais.value,
    quantidade: numero(F.quantidade.value),
    precoMedio: numero(F.precoMedio.value),
    valorAtual: numero(F.valorAtual.value),
    compra: numero(F.compra.value),
    venda: numero(F.venda.value),
    observacao: F.observacao.value.trim()
  };

  if (!dados.codigo || !dados.plataforma || dados.precoMedio <= 0 || dados.valorAtual <= 0) {
    formErro.textContent = "Preencha ao menos Código, Plataforma, Preço médio e Preço atual (maiores que zero).";
    formErro.hidden = false;
    return;
  }

  if (editandoId) {
    const i = ativos.findIndex(a => a._id === editandoId);
    if (i >= 0) ativos[i] = { ...ativos[i], ...dados };
  } else {
    const maxId = ativos.reduce((m, a) => Math.max(m, a._id || 0), 0);
    ativos.push({ _id: maxId + 1, ...dados });
  }

  salvarLocal();
  fecharFormulario();
  renderizarTabela();
  atualizarData();
  mensagem(editandoId ? "Ativo atualizado." : "Ativo adicionado.", "sucesso");
}

function excluirAtivoAtual() {
  if (!editandoId) return;
  const alvo = ativos.find(a => a._id === editandoId);
  const rotulo = alvo ? (alvo.nome || alvo.codigo) : "este ativo";
  if (!confirm(`Remover ${rotulo} da carteira?`)) return;
  ativos = ativos.filter(a => a._id !== editandoId);
  salvarLocal();
  fecharFormulario();
  renderizarTabela();
  atualizarData();
  mensagem("Ativo removido.", "sucesso");
}

/* ---------- Modo edição ---------- */
function alternarEdicao() {
  modoEdicao = !modoEdicao;
  document.body.classList.toggle("modo-edicao", modoEdicao);
  botaoEditar.textContent = modoEdicao ? "Concluir edição" : "Editar carteira";
  if (barraEdicao) barraEdicao.hidden = !modoEdicao;
}

/* ---------- Backup ---------- */
function exportarBackup() {
  const blob = new Blob([JSON.stringify(ativos, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `az-stocks-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  mensagem("Backup exportado.", "sucesso");
}

function importarBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const arr = JSON.parse(reader.result);
      if (!Array.isArray(arr) || !arr.length) throw new Error("vazio");
      ativos = normalizarLista(arr);
      salvarLocal();
      renderizarTabela();
      atualizarData();
      mensagem(`Backup importado • ${ativos.length} ativos.`, "sucesso");
    } catch (e) {
      mensagem("Arquivo de backup inválido.", "erro");
    }
  };
  reader.readAsText(file);
}

/* ---------- Importar da planilha (migração opcional) ---------- */
function limparRespostaGoogle(t) { return t.replace(/^.*google\.visualization\.Query\.setResponse\(/s, "").replace(/\);?\s*$/s, ""); }
function valorCelula(c) { if (!c) return ""; if (c.v !== undefined) return c.v; if (c.f !== undefined) return c.f; return ""; }
function mapearLinhaGoogle(linha) {
  const c = linha.c || [];
  return {
    codigo: String(valorCelula(c[0])).trim(),
    plataforma: String(valorCelula(c[1])).trim(),
    pais: String(valorCelula(c[2])).trim(),
    tipo: String(valorCelula(c[3])).trim(),
    quantidade: numero(valorCelula(c[4])),
    precoMedio: numero(valorCelula(c[5])),
    valorAtual: numero(valorCelula(c[6])),
    compra: numero(valorCelula(c[7])),
    venda: numero(valorCelula(c[8])),
    observacao: String(valorCelula(c[9])).trim()
  };
}

async function importarDaPlanilha() {
  const cfg = window.AZ_CONFIG || {};
  if (!cfg.GOOGLE_SHEET_ID) { mensagem("Planilha não configurada.", "erro"); return; }
  if (!confirm("Isso substitui sua carteira local pelos dados atuais da planilha. Continuar?")) return;

  mensagem("Importando da planilha...", "");
  try {
    const url = `https://docs.google.com/spreadsheets/d/${cfg.GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(cfg.SHEET_NAME || "Dados")}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("http");
    const json = JSON.parse(limparRespostaGoogle(await resp.text()));
    const novos = (json.table.rows || []).map(mapearLinhaGoogle)
      .filter(a => a.codigo && a.plataforma && a.pais && a.tipo && a.precoMedio > 0 && a.valorAtual > 0);
    if (!novos.length) throw new Error("vazio");
    ativos = normalizarLista(novos);
    salvarLocal();
    renderizarTabela();
    atualizarData();
    mensagem(`Importado da planilha • ${ativos.length} ativos.`, "sucesso");
  } catch (e) {
    mensagem("Não consegui ler a planilha (verifique se está pública).", "erro");
  }
}

/* ---------- Eventos ---------- */
document.querySelectorAll(".ordenar-coluna").forEach(botao => {
  botao.addEventListener("click", () => {
    const campo = botao.dataset.sort;
    if (ordenacaoAtual.campo === campo) ordenacaoAtual.direcao = ordenacaoAtual.direcao === "asc" ? "desc" : "asc";
    else ordenacaoAtual = { campo, direcao: "asc" };
    renderizarTabela();
  });
});

cartoesSituacao.forEach(card => {
  card.addEventListener("click", () => {
    const s = card.dataset.situacao;
    situacaoSelecionada = (situacaoSelecionada === s) ? "Todas" : s;
    renderizarTabela();
  });
});

corpoTabela.addEventListener("click", e => {
  const botao = e.target.closest(".acao-linha");
  if (!botao) return;
  const id = Number(botao.dataset.id);
  const alvo = ativos.find(a => a._id === id);
  if (!alvo) return;
  if (botao.dataset.acao === "editar") abrirFormulario(alvo);
  else { editandoId = id; excluirAtivoAtual(); }
});

filtroPlataforma.addEventListener("change", renderizarTabela);
filtroTipo.addEventListener("change", renderizarTabela);
botaoLimpar?.addEventListener("click", () => {
  situacaoSelecionada = "Todas";
  filtroPlataforma.value = "Todas";
  filtroTipo.value = "Todos";
  renderizarTabela();
});

botaoEditar?.addEventListener("click", alternarEdicao);
botaoAdicionar?.addEventListener("click", () => abrirFormulario(null));
botaoSalvar?.addEventListener("click", salvarFormulario);
botaoCancelar?.addEventListener("click", fecharFormulario);
botaoExcluir?.addEventListener("click", excluirAtivoAtual);
modalAtivo?.addEventListener("click", e => { if (e.target === modalAtivo) fecharFormulario(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !modalAtivo.hidden) fecharFormulario(); });

botaoExportar?.addEventListener("click", exportarBackup);
inputImportar?.addEventListener("change", e => { if (e.target.files[0]) { importarBackup(e.target.files[0]); e.target.value = ""; } });
botaoImportarPlanilha?.addEventListener("click", importarDaPlanilha);

inicializarDados();
renderizarTabela();
atualizarData();
