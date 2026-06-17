let ativos = window.CARTEIRA_AZ || [];

const corpoTabela = document.getElementById("corpoTabela");
const filtroPlataforma = document.getElementById("filtroPlataforma");
const filtroSituacao = document.getElementById("filtroSituacao");
const botaoAtualizar = document.getElementById("botaoAtualizar");
const ultimaAtualizacao = document.getElementById("ultimaAtualizacao");
const mensagemAtualizacao = document.getElementById("mensagemAtualizacao");

function moedaDoAtivo(ativo) {
  return ativo.pais === "Brasil" ? "BRL" : "USD";
}

function formatarMoeda(valor, ativo) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: moedaDoAtivo(ativo)
  });
}

function formatarMoedaResumo(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "USD"
  });
}

function formatarNumero(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 5
  });
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

function ordemSituacao(texto) {
  return {
    "Comprar": 1,
    "Venda parcial": 2,
    "Atenção": 3,
    "Neutra": 4
  }[texto] || 99;
}

function enriquecerAtivos(lista) {
  const totalCarteira = lista.reduce((soma, ativo) => soma + valorPosicao(ativo), 0);

  return lista.map(ativo => {
    const investido = valorInvestido(ativo);
    const posicao = valorPosicao(ativo);
    const resultado = resultadoFinanceiro(ativo);
    const rentabilidade = calcularRentabilidade(ativo);
    const situacao = definirSituacao(ativo);
    const peso = totalCarteira > 0 ? (posicao / totalCarteira) * 100 : 0;

    return {
      ...ativo,
      investido,
      posicao,
      resultado,
      rentabilidade,
      situacao,
      peso
    };
  });
}

function filtrarAtivos() {
  return enriquecerAtivos(ativos)
    .filter(a => filtroPlataforma.value === "Todas" || a.plataforma === filtroPlataforma.value)
    .filter(a => filtroSituacao.value === "Todas" || a.situacao.texto === filtroSituacao.value)
    .sort((a,b) => ordemSituacao(a.situacao.texto) - ordemSituacao(b.situacao.texto));
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

function atualizarResumoFinanceiro(lista) {
  const enriquecidos = enriquecerAtivos(lista);
  const totalInvestido = enriquecidos.reduce((soma, a) => soma + a.investido, 0);
  const totalAtual = enriquecidos.reduce((soma, a) => soma + a.posicao, 0);
  const resultado = totalAtual - totalInvestido;
  const rentabilidade = totalInvestido > 0 ? (resultado / totalInvestido) * 100 : 0;

  const elInvestido = document.getElementById("valorInvestidoTotal");
  const elAtual = document.getElementById("valorAtualTotal");
  const elResultado = document.getElementById("resultadoTotal");
  const elRentabilidade = document.getElementById("rentabilidadeGeral");

  if (!elInvestido || !elAtual || !elResultado || !elRentabilidade) return;

  elInvestido.textContent = formatarMoedaResumo(totalInvestido);
  elAtual.textContent = formatarMoedaResumo(totalAtual);
  elResultado.textContent = formatarMoedaResumo(resultado);
  elRentabilidade.textContent = formatarPercentual(rentabilidade);

  elResultado.className = resultado >= 0 ? "positivo" : "negativo";
  elRentabilidade.className = rentabilidade >= 0 ? "positivo" : "negativo";
}

function renderizarTabela() {
  const lista = filtrarAtivos();
  corpoTabela.innerHTML = "";

  lista.forEach(a => {
    const tr = document.createElement("tr");
    const classeRentabilidade = a.rentabilidade >= 0 ? "positiva" : "negativa";
    const classeResultado = a.resultado >= 0 ? "positiva" : "negativa";
    const tipo = a.tipo || "-";
    const observacao = a.observacao || "";

    tr.innerHTML = `
      <td class="codigo">${a.codigo}</td>
      <td><span class="tipo-ativo">${tipo}</span></td>
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
      <td class="observacao-tabela">${observacao}</td>`;

    corpoTabela.appendChild(tr);
  });

  atualizarCartoes(ativos);
  atualizarResumoFinanceiro(ativos);
}

function atualizarData() {
  ultimaAtualizacao.textContent = `Atualizado em ${new Date().toLocaleString("pt-BR")}`;
}

function limparRespostaGoogle(texto) {
  return texto
    .replace(/^.*google\.visualization\.Query\.setResponse\(/s, "")
    .replace(/\);?\s*$/s, "");
}

function valorCelula(celula) {
  if (!celula) return "";
  if (celula.v !== undefined) return celula.v;
  if (celula.f !== undefined) return celula.f;
  return "";
}

function mapearLinhaGoogle(linha) {
  const c = linha.c || [];

  // Estrutura da aba Dados:
  // codigo | plataforma | pais | tipo | quantidade | precoMedio | valorAtual | compra | venda | observacao
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

filtroPlataforma.addEventListener("change", renderizarTabela);
filtroSituacao.addEventListener("change", renderizarTabela);
botaoAtualizar.addEventListener("click", atualizarDados);

renderizarTabela();
atualizarData();
atualizarDados();
