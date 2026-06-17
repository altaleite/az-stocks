let ativos = window.CARTEIRA_AZ || [];

const corpoTabela = document.getElementById("corpoTabela");
const filtroPlataforma = document.getElementById("filtroPlataforma");
const filtroSituacao = document.getElementById("filtroSituacao");
const botaoAtualizar = document.getElementById("botaoAtualizar");
const ultimaAtualizacao = document.getElementById("ultimaAtualizacao");
const mensagemAtualizacao = document.getElementById("mensagemAtualizacao");

function moedaDoAtivo(ativo) { return ativo.pais === "Brasil" ? "BRL" : "USD"; }
function formatarMoeda(valor, ativo) { return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: moedaDoAtivo(ativo) }); }
function formatarNumero(valor) { return Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 5 }); }
function formatarPercentual(valor) { return `${Number(valor).toFixed(2).replace(".", ",")}%`; }

function numero(valor) {
  if (typeof valor === "number") return valor;
  if (valor === null || valor === undefined) return 0;
  const txt = String(valor).replace("R$", "").replace("US$", "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  return Number(txt) || 0;
}

function calcularRentabilidade(ativo) { return ((numero(ativo.valorAtual) - numero(ativo.precoMedio)) / numero(ativo.precoMedio)) * 100; }

function definirSituacao(ativo) {
  const r = calcularRentabilidade(ativo);
  if (r <= -30) return { texto: "Atenção", classe: "atencao" };
  if (r <= -numero(ativo.compra)) return { texto: "Comprar", classe: "comprar" };
  if (r >= numero(ativo.venda)) return { texto: "Venda parcial", classe: "vender" };
  return { texto: "Neutra", classe: "neutra" };
}

function ordemSituacao(texto) { return { "Comprar": 1, "Venda parcial": 2, "Atenção": 3, "Neutra": 4 }[texto] || 99; }

function filtrarAtivos() {
  return ativos
    .map(a => ({ ...a, situacao: definirSituacao(a), rentabilidade: calcularRentabilidade(a) }))
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

function renderizarTabela() {
  const lista = filtrarAtivos();
  corpoTabela.innerHTML = "";
  lista.forEach(a => {
    const tr = document.createElement("tr");
    const classe = a.rentabilidade >= 0 ? "positiva" : "negativa";
    tr.innerHTML = `
      <td class="codigo">${a.codigo}</td>
      <td><span class="plataforma">${a.plataforma}</span></td>
      <td>${formatarNumero(a.quantidade)}</td>
      <td>${formatarMoeda(a.precoMedio, a)}</td>
      <td>${formatarMoeda(a.valorAtual, a)}</td>
      <td class="rentabilidade ${classe}">${formatarPercentual(a.rentabilidade)}</td>
      <td><span class="situacao ${a.situacao.classe}">${a.situacao.texto}</span></td>`;
    corpoTabela.appendChild(tr);
  });
  atualizarCartoes(ativos);
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
    quantidade: numero(valorCelula(c[3])),
    precoMedio: numero(valorCelula(c[4])),
    valorAtual: numero(valorCelula(c[5])),
    compra: numero(valorCelula(c[6])),
    venda: numero(valorCelula(c[7]))
  };
}

async function carregarGoogleSheets() {
  const cfg = window.AZ_CONFIG || {};
  if (!cfg.GOOGLE_SHEET_ID) return false;
  const url = `https://docs.google.com/spreadsheets/d/${cfg.GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(cfg.SHEET_NAME || "Dados")}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Não consegui acessar a planilha.");
  const json = JSON.parse(limparRespostaGoogle(await resp.text()));
  const novos = (json.table.rows || []).map(mapearLinhaGoogle).filter(a => a.codigo && a.plataforma && a.pais && a.precoMedio > 0 && a.valorAtual > 0);
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
    renderizarTabela(); atualizarData();
    if (ok) {
      mensagemAtualizacao.textContent = `Dados atualizados pelo Google Sheets. Ativos carregados: ${ativos.length}.`;
      mensagemAtualizacao.className = "observacao mensagem-sucesso";
    } else {
      mensagemAtualizacao.textContent = "Google Sheets ainda não configurado. Usando carteira local.";
      mensagemAtualizacao.className = "observacao";
    }
  } catch(e) {
    console.error(e);
    renderizarTabela(); atualizarData();
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
