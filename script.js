const API_KEY = "212ce14448ac43f8bb2242ef04265699";
const MATRICULA = "448328";
const container = document.getElementById("games-container");
const btnBuscar = document.getElementById("btnBuscar");
const inputBusca = document.getElementById("search");

async function carregarJogos(url) {
  container.innerHTML = "<p>Carregando...</p>";
  const resposta = await fetch(url);
  const dados = await resposta.json();
  container.innerHTML = "";
  dados.results.forEach(jogo => {
    const card = document.createElement("div");
    card.classList.add("game");
    card.innerHTML = `
      <img src="${jogo.background_image}" alt="${jogo.name}">
      <h3>${jogo.name}</h3>
      <p>Nota: ${jogo.rating} | Lançamento: ${jogo.released}</p>
    `;
    card.addEventListener("click", () => mostrarDetalhes(jogo.id));
    container.appendChild(card);
  });
  registrarLog("RAWG", "carregarJogos", `Total ${dados.results.length}`);
}

async function mostrarDetalhes(id) {
  const resposta = await fetch(`https://api.rawg.io/api/games/${id}?key=${API_KEY}`);
  const jogo = await resposta.json();
  container.innerHTML = `
    <div class="detalhes">
      <button id="voltar">Voltar</button>
      <h2>${jogo.name}</h2>
      <img src="${jogo.background_image}" alt="${jogo.name}" style="max-width:400px">
      <p><strong>Lançamento:</strong> ${jogo.released}</p>
      <p><strong>Nota:</strong> ${jogo.rating}</p>
      <p><strong>Gêneros:</strong> ${jogo.genres.map(g => g.name).join(", ")}</p>
      <p>${jogo.description_raw}</p>
    </div>
  `;
  document.getElementById("voltar").addEventListener("click", () => {
    carregarJogos(`https://api.rawg.io/api/games?key=${API_KEY}&page_size=9`);
  });
  registrarLog("RAWG", "mostrarDetalhes", jogo.name);
}

btnBuscar.addEventListener("click", () => {
  const termo = inputBusca.value.trim();
  if (termo) {
    carregarJogos(`https://api.rawg.io/api/games?key=${API_KEY}&search=${termo}`);
  }
});

async function carregarGeneros() {
  const resposta = await fetch(`https://api.rawg.io/api/genres?key=${API_KEY}`);
  const dados = await resposta.json();
  const select = document.getElementById("selectGenero");
  dados.results.forEach(genero => {
    const option = document.createElement("option");
    option.value = genero.slug;
    option.textContent = genero.name;
    select.appendChild(option);
  });
  select.addEventListener("change", () => {
    const valor = select.value;
    if (valor) {
      carregarJogos(`https://api.rawg.io/api/games?key=${API_KEY}&genres=${valor}`);
    } else {
      carregarJogos(`https://api.rawg.io/api/games?key=${API_KEY}&page_size=9`);
    }
  });
}

async function exibirLogs() {
  const area = document.getElementById("areaLogs");
  const url = `https://www.piway.com.br/unoesc/api/logs/${MATRICULA}`;
  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();
    if (!Array.isArray(dados)) {
      area.innerHTML = `<p>${dados}</p>`;
      return;
    }
    area.innerHTML = dados.map(log => `
      <div class="log-item">
        <p><b>${log.api}</b> - ${log.metodo} → ${log.resultado}</p>
        <button onclick="excluirLog(${log.id})"> Excluir</button>
      </div>
    `).join("");
  } catch (erro) {
    area.innerHTML = "<p>Erro ao carregar logs</p>";
  }
}

async function registrarLog(api, metodo, resultado) {
  const url = `https://www.piway.com.br/unoesc/api/inserir/log/${MATRICULA}/${api}/${metodo}/${resultado}`;
  try {
    await fetch(url);
  } catch (erro) {}
}

async function excluirLog(id) {
  const url = `https://www.piway.com.br/unoesc/api/excluir/log/${id}/aluno/${MATRICULA}`;
  try {
    const resposta = await fetch(url);
    const dados = await resposta.text();
    alert(dados);
    exibirLogs();
  } catch (erro) {}
}

carregarJogos(`https://api.rawg.io/api/games?key=${API_KEY}&page_size=9`);
carregarGeneros();
