// main.js - Retrocast
window.emulatorLoaded = false;
const menuItems = document.querySelectorAll(".menu-item");
const sectionTitle = document.getElementById("section-title");
const sectionContent = document.getElementById("section-content");
let achievementsEnabled = localStorage.getItem("ra_enable") !== "false";
let raUser = localStorage.getItem("ra_username") || "";
let raToken = localStorage.getItem("ra_api_key") || "";

// =======================
// Carregar Seções
// =======================
function loadSection(section) {
  sectionTitle.textContent = getSectionTitle(section);
  switch (section) {
    case "consoles":
      sectionContent.innerHTML = `
        <h3>🔌 Selecione um Console</h3>
        <ul class='game-list'>
          <li onclick="loadConsole('nes')">NES – Nintendo Entertainment System</li>
          <li onclick="loadConsole('snes')">SNES – Super Nintendo</li>
          <li onclick="loadConsole('gb')">Game Boy / Color</li>
          <li onclick="loadConsole('gba')">Game Boy Advance</li>
          <li onclick="loadConsole('segaMD')">SEGA Genesis / Mega Drive</li>
          <li onclick="loadConsole('segaGG')">SEGA Game Gear</li>
          <li onclick="loadConsole('n64')">Nintendo 64</li>
          <li onclick="loadConsole('psx')">PlayStation</li>
          <li onclick="loadConsole('atari2600')">Atari 2600</li>
          <li onclick="loadConsole('arcade')">Arcade (MAME)</li>
        </ul>
      `;
      break;

    case "achievements":
      raUser = localStorage.getItem("ra_username") || "";
      raToken = localStorage.getItem("ra_api_key") || "";

      sectionContent.innerHTML = `
        <h3>🎖️ RetroAchievements</h3>
        <form id="ra-login-form">
          <input type="text" id="ra-username" placeholder="Nome de usuário" value="${raUser}" required />
          <input type="password" id="ra-apikey" placeholder="Sua API Key" value="${raToken}" required />
          <button type="submit" onclick="loginToRetroAchievements(); return false;">Entrar</button>
          <button type="button" onclick="logoutFromRetroAchievements()">Sair</button>
        </form>
        <div class="ra-header">
          <div class="ra-user" id="ra-user-info">${raUser ? 'Usuário: ' + raUser : 'Usuário: Não logado'}</div>
          <div class="ra-game" id="ra-game-title">Jogo: Nenhum carregado</div>
        </div>
        <div class="ra-progress" id="ra-game-progress">Progresso: 0/0</div>
        <div class="ra-settings">
          <label><input type="checkbox" id="ra-enable" onclick="toggleAchievementVisibility()" ${achievementsEnabled ? "checked" : ""}> 🎮 Conquistas Ativadas</label>
          <label><input type="checkbox" id="ra-hardcore" onclick="toggleHardcoreMode()" ${localStorage.getItem("ra_hardcore") === "true" ? "checked" : ""}> 🎮 Modo Hardcore</label>
          <label><input type="checkbox" id="ra-sound" onclick="toggleSound()" ${localStorage.getItem("ra_sound") !== "false" ? "checked" : ""}> 🔊 Som</label>
          <label><input type="checkbox" id="ra-screenshot" onclick="toggleScreenshot()" ${localStorage.getItem("ra_screenshot") === "true" ? "checked" : ""}> 📸 Tirar captura ao desbloquear</label>
          <label><input type="checkbox" id="ra-unofficial" onclick="toggleUnofficial()" ${localStorage.getItem("ra_unofficial") === "true" ? "checked" : ""}> 🧪 Mostrar conquistas não oficiais</label>
          <label><input type="checkbox" id="ra-richpresence" onclick="toggleRichPresence()" ${localStorage.getItem("ra_richpresence") === "true" ? "checked" : ""}> 💬 Mostrar Rich Presence</label>
          <button onclick="showAppearanceMenu()">🎛️ Aparência</button>
          <button onclick="simulateUnlock()">🧪 Testar Conquista</button>
        </div>
        <div id="ra-achievements-list">
          <p>🔍 Faça login para carregar as conquistas.</p>
        </div>
      `;
      if (typeof initRetroAchievements === "function") {
        initRetroAchievements();
      }
      break;

    case "profile":
      sectionContent.innerHTML = "<p>ID do usuário: retro_user_123</p><p>Histórico de jogos recentes:</p><ul><li>SUPER MARIO BROS (NES)</li></ul>";
      break;

    case "ranking":
      sectionContent.innerHTML = "<p>Ranking global em desenvolvimento.</p>";
      break;

    case "tournament":
      sectionContent.innerHTML = "<p>Torneios atuais: Em breve!</p>";
      break;

    case "netplay":
      sectionContent.innerHTML = "<p>Jogos online via Netplay: Configuração necessária.</p>";
      break;

    case "saves":
      sectionContent.innerHTML = "<p>Saves salvos localmente aparecerão aqui.</p>";
      break;

    case "voicechat":
      sectionContent.innerHTML = "<button onclick='startVoiceChat()'>🎤 Iniciar Chat de Voz</button>";
      break;
  }
}

function getSectionTitle(section) {
  switch (section) {
    case "consoles": return "🎮 Consoles";
    case "achievements": return "🎖️ Conquistas";
    case "profile": return "👤 Meu Perfil";
    case "ranking": return "🏆 Ranking";
    case "tournament": return "🥊 Torneio";
    case "netplay": return "🕹️ Netplay";
    case "saves": return "💾 Saves";
    case "voicechat": return "🎤 Chat de Voz";
  }
}

// =======================
// Consoles e Jogos
// =======================
async function loadConsole(consoleName) {
  sectionTitle.textContent = `🎮 ${consoleName.toUpperCase()} Playlist`;
  try {
    const response = await fetch(`data/${consoleName}.json`);
    if (!response.ok) throw new Error(`Arquivo não encontrado: data/${consoleName}.json`);

    const games = await response.json();
    if (!Array.isArray(games) || games.length === 0) {
      sectionContent.innerHTML = "<p>❌ Nenhum jogo encontrado para este console.</p>";
      return;
    }

    let html = "<ul class='game-list'>";
    for (const game of games) {
      const hasTrophies = await hasAchievementsForGame(game.name);
      const trophyIcon = hasTrophies ? `<img src="data/achievements/icons/trophy.png" width="20" class="trophy-icon" />` : "";
      html += `<li onclick="playGame('${game.name}', '${consoleName}', '${game.url}')">${trophyIcon} ${game.name}</li>`;
    }
    html += "</ul>";
    sectionContent.innerHTML = html;

  } catch (err) {
    console.error("Erro ao carregar playlist:", err);
    sectionContent.innerHTML = "<p>⚠️ Erro ao carregar jogos para este console.</p>";
  }
}

async function hasAchievementsForGame(gameName) {
  if (!raUser || !raToken) return false;
  try {
    const url = `https://retroachievements.org/API/GetGameID.php?g=${encodeURIComponent(gameName)}&z=${raUser}&y=${raToken}`;
    const res = await fetch(url);
    const data = await res.json();
    return data && data.GameID;
  } catch {
    return false;
  }
}

function playGame(gameName, consoleName, romUrl = null) {
  if (!romUrl) {
    alert("❌ URL do jogo não encontrada.");
    return;
  }
  document.querySelector('.menu').style.display = 'none';
  document.querySelector('.content').style.display = 'none';
  document.getElementById('display').style.display = 'flex';

  window.EJS_player = "#game";
  window.EJS_gameName = gameName;
  window.EJS_gameUrl = romUrl;
  window.EJS_core = consoleName;
  window.EJS_pathtodata = "data/";
  window.EJS_startOnLoaded = true;

  function startEmulator() {
    document.getElementById('display').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    EJS_load();

    if (achievementsEnabled && typeof showGameOverlay === "function") {
      showGameOverlay(gameName);
    }

    if (raUser && raToken && typeof detectGameIdFromROM === "function") {
      detectGameIdFromROM(romUrl).catch(err => console.error("Erro ao detectar GameID:", err));
    }
  }

  if (!window.emulatorLoaded) {
    const script = document.createElement('script');
    script.src = "data/loader.js";
    script.onload = () => {
      window.emulatorLoaded = true;
      setTimeout(startEmulator, 2000);
    };
    document.body.appendChild(script);
  } else {
    setTimeout(startEmulator, 2000);
  }
}

// =======================
// RetroAchievements
// =======================
function loginToRetroAchievements() {
  const username = document.getElementById("ra-username").value.trim();
  const apikey = document.getElementById("ra-apikey").value.trim();
  if (username && apikey) {
    localStorage.setItem("ra_username", username);
    localStorage.setItem("ra_api_key", apikey);
    raUser = username;
    raToken = apikey;
    document.getElementById("ra-user-info").textContent = `Usuário: ${raUser}`;
    if (typeof initRetroAchievements === "function") initRetroAchievements();
  } else {
    alert("Por favor, preencha ambos os campos.");
  }
}

function logoutFromRetroAchievements() {
  localStorage.removeItem("ra_username");
  localStorage.removeItem("ra_api_key");
  raUser = "";
  raToken = "";
  document.getElementById("ra-user-info").textContent = "Usuário: Não logado";
  document.getElementById("ra-game-title").textContent = "Jogo: Nenhum carregado";
  document.getElementById("ra-game-progress").textContent = "Progresso: 0/0";
  document.getElementById("ra-achievements-list").innerHTML = "<p>🔍 Faça login para carregar as conquistas.</p>";
  loadSection("achievements");
}

function toggleAchievementVisibility() {
  achievementsEnabled = document.getElementById("ra-enable").checked;
  localStorage.setItem("ra_enable", achievementsEnabled);
}

// =======================
// Navegação
// =======================
menuItems.forEach(item => {
  item.addEventListener("click", () => {
    menuItems.forEach(i => i.classList.remove("selected"));
    item.classList.add("selected");
    loadSection(item.getAttribute("data-section"));
  });
});

let selectedIndex = 0;
function pollGamepad() {
  const items = Array.from(menuItems);
  const gamepads = navigator.getGamepads();
  for (let gp of gamepads) {
    if (!gp) continue;
    if (gp.axes[1] < -0.5) navigateUp(items);
    else if (gp.axes[1] > 0.5) navigateDown(items);
    if (gp.buttons[0].pressed || gp.buttons[9].pressed) {
      items[selectedIndex].click();
    }
  }
  requestAnimationFrame(pollGamepad);
}
function navigateUp(items) {
  items[selectedIndex].classList.remove("selected");
  selectedIndex = Math.max(0, selectedIndex - 1);
  items[selectedIndex].classList.add("selected");
}
function navigateDown(items) {
  items[selectedIndex].classList.remove("selected");
  selectedIndex = Math.min(items.length - 1, selectedIndex + 1);
  items[selectedIndex].classList.add("selected");
}

if ('getGamepads' in navigator) {
  window.addEventListener("gamepadconnected", () => console.log("🎮 Controle conectado."));
  pollGamepad();
}

// Inicializa na aba Consoles
loadSection("consoles");
