const ativos = window.CARTEIRA_AZ || [];

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
  return valor.toLocaleString("pt-BR", { style: "currency", currency: moedaDoAtivo(ativo) });
}

function formatarNumero(valor) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 5 });
}

function formatarPercentual(valor) {
  return `${valor.toFixed(2).replace(".", ",")}%`;
}

function calcularRentabilidade(ativo) {
  return ((ativo.valorAtual - ativo.precoMedio) / ativo.precoMedio) * 100;
}

function definirSituacao(ativo) {
  const rentabilidade = calcularRentabilidade(ativo);
  if (rentabilidade <= -30) return { texto: "Atenção", classe: "atencao" };
  if (rentabilidade <= -ativo.compra) return { texto: "Comprar", classe: "comprar" };
  if (rentabilidade >= ativo.venda) return { texto: "Venda parcial", classe: "vender" };
  return { texto: "Neutra", classe: "neutra" };
}

function ordemSituacao(texto) {
  return { "Comprar": 1, "Venda parcial": 2, "Atenção": 3, "Neutra": 4 }[texto] || 99;
}

function filtrarAtivos() {
  return ativos
    .map(ativo => ({ ...ativo, situacao: definirSituacao(ativo), rentabilidade: calcularRentabilidade(ativo) }))
    .filter(ativo => filtroPlataforma.value === "Todas" || ativo.plataforma === filtroPlataforma.value)
    .filter(ativo => filtroSituacao.value === "Todas" || ativo.situacao.texto === filtroSituacao.value)
    .sort((a, b) => ordemSituacao(a.situacao.texto) - ordemSituacao(b.situacao.texto));
}

function atualizarCartoes(listaCompleta) {
  const totais = { comprar: 0, vender: 0, atencao: 0, neutra: 0 };

  listaCompleta.forEach(ativo => {
    const situacao = definirSituacao(ativo).texto;
    if (situacao === "Comprar") totais.comprar++;
    if (situacao === "Venda parcial") totais.vender++;
    if (situacao === "Atenção") totais.atencao++;
    if (situacao === "Neutra") totais.neutra++;
  });

  document.getElementById("totalComprar").textContent = totais.comprar;
  document.getElementById("totalVender").textContent = totais.vender;
  document.getElementById("totalAtencao").textContent = totais.atencao;
  document.getElementById("totalNeutras").textContent = totais.neutra;
}

function renderizarTabela() {
  const ativosFiltrados = filtrarAtivos();
  corpoTabela.innerHTML = "";

  ativosFiltrados.forEach(ativo => {
    const linha = document.createElement("tr");
    const classeRentabilidade = ativo.rentabilidade >= 0 ? "positiva" : "negativa";

    linha.innerHTML = `
      <td class="codigo">${ativo.codigo}</td>
      <td><span class="plataforma">${ativo.plataforma}</span></td>
      <td>${formatarNumero(ativo.quantidade)}</td>
      <td>${formatarMoeda(ativo.precoMedio, ativo)}</td>
      <td>${formatarMoeda(ativo.valorAtual, ativo)}</td>
      <td class="rentabilidade ${classeRentabilidade}">${formatarPercentual(ativo.rentabilidade)}</td>
      <td><span class="situacao ${ativo.situacao.classe}">${ativo.situacao.texto}</span></td>
    `;

    corpoTabela.appendChild(linha);
  });

  atualizarCartoes(ativos);
}

function atualizarData() {
  const agora = new Date();
  ultimaAtualizacao.textContent = `Atualizado em ${agora.toLocaleString("pt-BR")}`;
}

function codigoStooq(codigo) {
  return `${codigo.toLowerCase()}.us`;
}

function fetchComTempoLimite(url, tempo = 7000) {
  const controlador = new AbortController();
  const id = setTimeout(() => controlador.abort(), tempo);

  return fetch(url, { signal: controlador.signal })
    .finally(() => clearTimeout(id));
}

async function buscarTexto(urlOriginal) {
  // Tenta primeiro direto. Se falhar, tenta via intermediário.
  try {
    const respostaDireta = await fetchComTempoLimite(urlOriginal, 6000);
    if (respostaDireta.ok) return await respostaDireta.text();
  } catch (e) {
    console.warn("Busca direta falhou, tentando intermediário.");
  }

  const urlProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlOriginal)}`;
  const respostaProxy = await fetchComTempoLimite(urlProxy, 9000);
  if (!respostaProxy.ok) throw new Error("Falha no intermediário.");
  return await respostaProxy.text();
}

async function buscarPrecoEUA(codigo) {
  const urlStooq = `https://stooq.com/q/l/?s=${codigoStooq(codigo)}&f=sd2t2ohlcv&h&e=csv`;
  const texto = await buscarTexto(urlStooq);

  const linhas = texto.trim().split("\n");
  if (linhas.length < 2) throw new Error(`Sem dados para ${codigo}`);

  const campos = linhas[1].split(",");
  const fechamento = Number(campos[6]);

  if (!Number.isFinite(fechamento) || fechamento <= 0) {
    throw new Error(`Preço inválido para ${codigo}`);
  }

  return fechamento;
}

async function atualizarPrecosEUA() {
  botaoAtualizar.disabled = true;
  botaoAtualizar.textContent = "Atualizando...";
  mensagemAtualizacao.textContent = "Buscando preços dos ativos dos EUA...";
  mensagemAtualizacao.className = "observacao";

  const ativosEUA = ativos.filter(ativo => ativo.pais === "EUA");
  let atualizados = 0;
  let falhas = 0;

  for (let i = 0; i < ativosEUA.length; i++) {
    const ativo = ativosEUA[i];
    mensagemAtualizacao.textContent = `Atualizando ${i + 1}/${ativosEUA.length}: ${ativo.codigo}...`;

    try {
      const novoPreco = await buscarPrecoEUA(ativo.codigo);
      ativo.valorAtual = novoPreco;
      atualizados++;
    } catch (erro) {
      console.warn(`Falha em ${ativo.codigo}:`, erro);
      falhas++;
    }

    renderizarTabela();
  }

  atualizarData();

  if (atualizados > 0) {
    mensagemAtualizacao.textContent = `Preços EUA atualizados: ${atualizados}. Falhas: ${falhas}. Brasil permanece manual.`;
    mensagemAtualizacao.className = "observacao mensagem-sucesso";
  } else {
    mensagemAtualizacao.textContent = "Não consegui atualizar os preços EUA. Mantive os valores cadastrados manualmente.";
    mensagemAtualizacao.className = "observacao mensagem-erro";
  }

  botaoAtualizar.disabled = false;
  botaoAtualizar.textContent = "Atualizar preços EUA";
}

filtroPlataforma.addEventListener("change", renderizarTabela);
filtroSituacao.addEventListener("change", renderizarTabela);
botaoAtualizar.addEventListener("click", atualizarPrecosEUA);

renderizarTabela();
atualizarData();
