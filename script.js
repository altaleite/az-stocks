let ativos = window.CARTEIRA_AZ || [];

const corpoTabela = document.getElementById("corpoTabela");
const filtroPlataforma = document.getElementById("filtroPlataforma");
const filtroSituacao = document.getElementById("filtroSituacao");
const buscaTabela = document.getElementById("buscaTabela");
const botaoAtualizar = document.getElementById("botaoAtualizar");
const ultimaAtualizacao = document.getElementById("ultimaAtualizacao");
const mensagemAtualizacao = document.getElementById("mensagemAtualizacao");

let ordenacaoAtual = { campo: "padrao", direcao: "asc" };

function moedaDoAtivo(ativo) {
  return ativo.pais === "Brasil" ? "BRL" : "USD";
}

function formatarMoedaPorCodigo(valor, currency) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency });
}

function formatarMoeda(valor, ativo) {
  return formatarMoedaPorCodigo(valor, moedaDoAtivo(ativo));
}

function formatarNumero(valor) {
  return Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 5 });
}

function formatarPercentual(valor) {
  return `${Number(valor).toFixed(2).replace(".", ",")}%`;
}

function numero(valor) {
  if (typeof valor === "number") return valor;
  if (valor === null || valor === undefined) return 0;

  const texto = String(valor).trim().replace("R$", "").replace("US$", "").replace(/\s/g, "");

  if (texto.includes(",") && texto.includes(".")) {
    return Number(texto.replace(/\./g, "").replace(",", ".")) || 0;
  }

  if (texto.includes(",")) {
    return Number(texto.replace(",", ".")) || 0;
  }

  return Number(texto) || 0;
}

function valorInvestido(ativo) {
  return numero(ativo.quantidade) * numero(ativo.precoMedio);
}

function valorPosicao(ativo) {
  return numero(ativo.quantidade) * numero(ativo.valorAtual);
}

function resultadoFinanceiro(ativo) {
  return valorPosicao(ativo) - valorInvestido(ativo);
}

function calcularRentabilidade(ativo) {
  return ((numero(ativo.valorAtual) - numero(ativo.precoMedio)) / numero(ativo.precoMedio)) * 100;
}

function definirSituacao(ativo) {
  const r = calcularRentabilidade(ativo);
  if (r <= -30) return { texto: "Atenção", classe: "atencao" };
  if (r <= -numero(ativo.compra)) return { texto: "Comprar", classe: "comprar" };
  if (r >= numero(ativo.venda)) return { texto: "Venda parcial", classe: "vender" };
  return { texto: "Neutra", classe: "neutra" };
}

function enriquecerAtivos(lista) {
  const totalUSD = lista.filter(a => a.pais !== "Brasil").reduce((soma, a) => soma + valorPosicao(a), 0);
  const totalBRL = lista.filter(a => a.pais === "Brasil").reduce((soma, a) => soma + valorPosicao(a), 0);

  return lista.map(ativo => {
    const investido = valorInvestido(ativo);
    const posicao = valorPosicao(ativo);
    const resultado = resultadoFinanceiro(ativo);
    const rentabilidade = calcularRentabilidade(ativo);
    const situacao = definirSituacao(ativo);
    const totalMoeda = ativo.pais === "Brasil" ? totalBRL : totalUSD;
    const peso = totalMoeda > 0 ? (posicao / totalMoeda) * 100 : 0;
    return { ...ativo, investido, posicao, resultado, rentabilidade, situacao, peso };
  });
}

function valorOrdenacao(ativo, campo) {
  const mapa = {
    codigo: ativo.codigo,
    tipo: ativo.tipo,
    plataforma: ativo.plataforma,
    quantidade: ativo.quantidade,
    precoMedio: ativo.precoMedio,
    valorAtual: ativo.valorAtual,
    investido: ativo.investido,
    posicao: ativo.posicao,
    resultado: ativo.resultado,
    rentabilidade: ativo.rentabilidade,
    peso: ativo.peso,
    situacao: ativo.situacao?.texto,
    observacao: ativo.observacao
  };
  return mapa[campo];
}

function compararValores(a, b, campo, direcao) {
  const valorA = valorOrdenacao(a, campo);
  const valorB = valorOrdenacao(b, campo);
  let resultado = 0;

  if (typeof valorA === "number" || typeof valorB === "number") {
    resultado = numero(valorA) - numero(valorB);
  } else {
    resultado = String(valorA || "").localeCompare(String(valorB || ""), "pt-BR", {
      sensitivity: "base",
      numeric: true
    });
  }

  return direcao === "asc" ? resultado : -resultado;
}

function ordenarPadrao(a, b) {
  const corretora = String(a.plataforma || "").localeCompare(String(b.plataforma || ""), "pt-BR", {
    sensitivity: "base"
  });

  if (corretora !== 0) return corretora;

  return String(a.codigo || "").localeCompare(String(b.codigo || ""), "pt-BR", {
    sensitivity: "base",
    numeric: true
  });
}

function textoBuscaAtivo(ativo) {
  return [ativo.codigo, ativo.tipo, ativo.plataforma, ativo.pais, ativo.situacao?.texto, ativo.observacao]
    .join(" ")
    .toLowerCase();
}

function filtrarAtivos() {
  const termo = (buscaTabela?.value || "").trim().toLowerCase();

  const lista = enriquecerAtivos(ativos)
    .filter(a => filtroPlataforma.value === "Todas" || a.plataforma === filtroPlataforma.value)
    .filter(a => filtroSituacao.value === "Todas" || a.situacao.texto === filtroSituacao.value)
    .filter(a => !termo || textoBuscaAtivo(a).includes(termo));

  if (ordenacaoAtual.campo === "padrao") return lista.sort(ordenarPadrao);

  return lista.sort((a, b) => compararValores(a, b, ordenacaoAtual.campo, ordenacaoAtual.direcao));
}

function atualizarIndicadorOrdenacao() {
  document.querySelectorAll(".ordenar-coluna").forEach(botao => {
    const campo = botao.dataset.sort;
    botao.classList.remove("ativo", "asc", "desc");

    if (campo === ordenacaoAtual.campo) {
      botao.classList.add("ativo", ordenacaoAtual.direcao);
    }
  });
}

function atualizarCartoes(lista) {
  const t = { comprar:0, vender:0, atencao:0, neutra:0 };

  lista.forEach(a => {
    const s = definirSituacao(a).texto;
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

function resumoPorPais(lista, brasil) {
  const filtrados = lista.filter(a => brasil ? a.pais === "Brasil" : a.pais !== "Brasil");
  const investido = filtrados.reduce((soma, a) => soma + valorInvestido(a), 0);
  const atual = filtrados.reduce((soma, a) => soma + valorPosicao(a), 0);
  const resultado = atual - investido;
  const rentabilidade = investido > 0 ? (resultado / investido) * 100 : 0;
  return { investido, atual, resultado, rentabilidade };
}

function atualizarCampo(id, valor, tipo) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = tipo === "%" ? formatarPercentual(valor) : formatarMoedaPorCodigo(valor, tipo);

  if (id.includes("resultado") || id.includes("rentabilidade")) {
    el.className = valor >= 0 ? "positivo" : "negativo";
  }
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
}

function renderizarTabela() {
  const lista = filtrarAtivos();
  corpoTabela.innerHTML = "";

  lista.forEach(a => {
    const tr = document.createElement("tr");
    const classeRentabilidade = a.rentabilidade >= 0 ? "positiva" : "negativa";
    const classeResultado = a.resultado >= 0 ? "positiva" : "negativa";

    tr.innerHTML = `
      <td class="codigo">${a.codigo}</td>
      <td><span class="tipo-ativo">${a.tipo || "-"}</span></td>
      <td><span class="plataforma">${a.plataforma}</span></td>
      <td>${formatarNumero(a.quantidade)}</td>
      <td>${formatarMoeda(a.precoMedio, a)}</td>
      <td>${formatarMoeda(a.valorAtual, a)}</td>
      <td>${formatarMoeda(a.investido, a)}</td>
      <td>${formatarMoeda(a.posicao, a)}</td>
      <td class="rentabilidade ${classeResultado}">${formatarMoeda(a.resultado, a)}</td>
      <td class="rentabilidade ${classeRentabilidade}">${formatarPercentual(a.rentabilidade)}</td>
      <td>${formatarPercentual(a.peso)}</td>
      <td><span class="situacao ${a.situacao.classe}">${a.situacao.texto}</span></td>
      <td class="observacao-tabela">${a.observacao || ""}</td>`;

    corpoTabela.appendChild(tr);
  });

  atualizarCartoes(ativos);
  atualizarResumoFinanceiro(ativos);
  atualizarIndicadorOrdenacao();
}

function atualizarData() {
  ultimaAtualizacao.textContent = `Atualizado em ${new Date().toLocaleString("pt-BR")}`;
}

function limparRespostaGoogle(texto) {
  return texto.replace(/^.*google\.visualization\.Query\.setResponse\(/s, "").replace(/\);?\s*$/s, "");
}

function valorCelula(celula) {
  if (!celula) return "";
  if (celula.v !== undefined) return celula.v;
  if (celula.f !== undefined) return celula.f;
  return "";
}

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

async function carregarGoogleSheets() {
  const cfg = window.AZ_CONFIG || {};
  if (!cfg.GOOGLE_SHEET_ID) return false;

  const url = `https://docs.google.com/spreadsheets/d/${cfg.GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(cfg.SHEET_NAME || "Dados")}`;
  const resp = await fetch(url);

  if (!resp.ok) throw new Error("Não consegui acessar a planilha.");

  const json = JSON.parse(limparRespostaGoogle(await resp.text()));
  const novos = (json.table.rows || [])
    .map(mapearLinhaGoogle)
    .filter(a => a.codigo && a.plataforma && a.pais && a.tipo && a.precoMedio > 0 && a.valorAtual > 0);

  if (!novos.length) throw new Error("A planilha não retornou ativos válidos.");

  ativos = novos;
  return true;
}

async function atualizarDados() {
  botaoAtualizar.disabled = true;
  botaoAtualizar.textContent = "Atualizando...";
  mensagemAtualizacao.textContent = "Atualizando dados...";
  mensagemAtualizacao.className = "observacao";

  try {
    const ok = await carregarGoogleSheets();
    ordenacaoAtual = { campo: "padrao", direcao: "asc" };
    renderizarTabela();
    atualizarData();

    if (ok) {
      mensagemAtualizacao.textContent = `Dados sincronizados com Google Sheets • ${ativos.length} ativos carregados`;
      mensagemAtualizacao.className = "observacao mensagem-sucesso";
    } else {
      mensagemAtualizacao.textContent = "Google Sheets ainda não configurado. Usando carteira local.";
      mensagemAtualizacao.className = "observacao";
    }
  } catch(e) {
    console.error(e);
    renderizarTabela();
    atualizarData();
    mensagemAtualizacao.textContent = "Não consegui ler o Google Sheets. Mantive a carteira local.";
    mensagemAtualizacao.className = "observacao mensagem-erro";
  }

  botaoAtualizar.disabled = false;
  botaoAtualizar.textContent = "Atualizar dados";
}

document.querySelectorAll(".ordenar-coluna").forEach(botao => {
  botao.addEventListener("click", () => {
    const campo = botao.dataset.sort;

    if (ordenacaoAtual.campo === campo) {
      ordenacaoAtual.direcao = ordenacaoAtual.direcao === "asc" ? "desc" : "asc";
    } else {
      ordenacaoAtual = { campo, direcao: "asc" };
    }

    renderizarTabela();
  });
});

filtroPlataforma.addEventListener("change", renderizarTabela);
filtroSituacao.addEventListener("change", renderizarTabela);
buscaTabela?.addEventListener("input", renderizarTabela);
botaoAtualizar.addEventListener("click", atualizarDados);

renderizarTabela();
atualizarData();
atualizarDados();
