(() => {
  const overlayId = "ra-overlay";
  let raUser = localStorage.getItem("ra_username") || "";
  let raToken = localStorage.getItem("ra_api_key") || "";
  let raEnable = localStorage.getItem("ra_enable") !== "false"; // padrão ON
  let raSound = localStorage.getItem("ra_sound") !== "false";
  let currentGameID = null;
  let currentGameMD5 = null;
  let currentAchievements = [];
  let unlockedAchievements = new Set();
  let pollingInterval = null;

  // Cria overlay fixo na tela se não existir
  function createOverlay() {
    if (document.getElementById(overlayId)) return;
    const overlay = document.createElement("div");
    overlay.id = overlayId;
    Object.assign(overlay.style, {
      position: "fixed",
      bottom: "10px",
      right: "10px",
      background: "rgba(0, 0, 0, 0.8)",
      color: "#0ff",
      padding: "12px",
      borderRadius: "8px",
      fontFamily: "monospace",
      fontSize: "14px",
      zIndex: 999999,
      maxWidth: "280px",
      maxHeight: "300px",
      overflowY: "auto",
      display: "none",
      userSelect: "none",
    });
    document.body.appendChild(overlay);
  }

  // Mostra o overlay
  function showOverlay() {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.style.display = raEnable ? "block" : "none";
  }

  // Atualiza conteúdo do overlay com conquistas
  function updateOverlay(gameData, achievements) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    if (!gameData || !achievements) {
      overlay.innerHTML = "<em>Nenhum jogo carregado.</em>";
      return;
    }
    let html = `<strong>${gameData.GameTitle}</strong><br><br>`;
    html += `<div>Conquistas: ${achievements.length}</div>`;
    html += "<hr style='border-color:#0ff66'>";
    achievements.forEach(a => {
      const unlocked = a.DateUnlocked !== "0000-00-00 00:00:00";
      unlockedAchievements.add(unlocked ? a.ID : null);
      html += `<div style="opacity:${unlocked ? 1 : 0.4}; margin-bottom:4px;">${unlocked ? "🏆" : "🔒"} ${a.Title}</div>`;
    });
    overlay.innerHTML = html;
  }

  // Função para tocar som de desbloqueio (pode usar beep simples)
  function playUnlockSound() {
    if (!raSound) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(880, ctx.currentTime); // 880Hz
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.15);
    } catch {
      // Falha no som, ignora
    }
  }

  // Exibe notificação pequena no canto (auto some)
  function showUnlockNotification(title) {
    if (!raEnable) return;
    const notif = document.createElement("div");
    Object.assign(notif.style, {
      position: "fixed",
      bottom: "50px",
      right: "10px",
      background: "#0ff",
      color: "#000",
      padding: "10px",
      borderRadius: "8px",
      fontFamily: "monospace",
      fontWeight: "bold",
      zIndex: 1000000,
      boxShadow: "0 0 10px #0ff",
      userSelect: "none",
    });
    notif.textContent = `🏆 Conquista desbloqueada: ${title}`;
    document.body.appendChild(notif);
    playUnlockSound();
    setTimeout(() => {
      notif.style.opacity = "0";
      setTimeout(() => notif.remove(), 500);
    }, 4000);
  }

  // Busca GameID pelo MD5 do ROM
  async function getGameID(md5) {
    if (!raUser || !raToken || !md5) return null;
    try {
      const url = `https://retroachievements.org/API/GetGameID.php?m=${md5}&z=${raUser}&y=${raToken}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.GameID) return data;
      return null;
    } catch {
      return null;
    }
  }

  // Busca conquistas do jogo para usuário
  async function getGameAchievements(gameID) {
    if (!raUser || !raToken || !gameID) return [];
    try {
      const url = `https://retroachievements.org/API/GetGameAchievements.php?g=${gameID}&z=${raUser}&y=${raToken}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && Array.isArray(data.Achievements)) return data.Achievements;
      return [];
    } catch {
      return [];
    }
  }

  // Atualiza conquistas e detecta novos desbloqueios
  async function updateAchievements() {
    if (!currentGameID) return;
    const achievements = await getGameAchievements(currentGameID.GameID);
    if (!achievements.length) return;

    // Detectar desbloqueios novos
    achievements.forEach(a => {
      if (a.DateUnlocked !== "0000-00-00 00:00:00" && !unlockedAchievements.has(a.ID)) {
        unlockedAchievements.add(a.ID);
        showUnlockNotification(a.Title);
      }
    });

    updateOverlay(currentGameID, achievements);
  }

  // Calcula MD5 do ROM via fetch e crypto API
  async function calculateMD5(romUrl) {
    try {
      const response = await fetch(romUrl);
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("MD5", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const md5 = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      return md5;
    } catch (e) {
      console.error("Erro calculando MD5:", e);
      return null;
    }
  }

  // Inicia o rastreamento do jogo e conquistas após iniciar jogo
  async function initGameTracking(romUrl) {
    if (!raEnable) {
      hideOverlay();
      return;
    }
    currentGameMD5 = await calculateMD5(romUrl);
    if (!currentGameMD5) {
      console.warn("Não foi possível calcular MD5 do ROM.");
      return;
    }
    currentGameID = await getGameID(currentGameMD5);
    if (!currentGameID) {
      console.warn("Jogo não encontrado na API RetroAchievements.");
      return;
    }
    // Busca e mostra conquistas
    const achievements = await getGameAchievements(currentGameID.GameID);
    currentAchievements = achievements;
    unlockedAchievements.clear();
    achievements.forEach(a => {
      if (a.DateUnlocked !== "0000-00-00 00:00:00") unlockedAchievements.add(a.ID);
    });
    createOverlay();
    updateOverlay(currentGameID, currentAchievements);
    showOverlay();

    // Atualiza a cada 10s (pode ajustar)
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(updateAchievements, 10000);
  }

  function hideOverlay() {
    const overlay = document.getElementById(overlayId);
    if (overlay) overlay.style.display = "none";
    if (pollingInterval) clearInterval(pollingInterval);
  }

  // Public API para login/logout e ativar/desativar conquistas
  window.RetroAchievementsAPI = {
    login(username, apikey) {
      raUser = username;
      raToken = apikey;
      localStorage.setItem("ra_username", raUser);
      localStorage.setItem("ra_api_key", raToken);
    },
    logout() {
      raUser = "";
      raToken = "";
      localStorage.removeItem("ra_username");
      localStorage.removeItem("ra_api_key");
      hideOverlay();
    },
    enableAchievements(enable) {
      raEnable = enable;
      localStorage.setItem("ra_enable", enable ? "true" : "false");
      if (!enable) hideOverlay();
    },
    enableSound(enable) {
      raSound = enable;
      localStorage.setItem("ra_sound", enable ? "true" : "false");
    },
    startTracking(romUrl) {
      if (!raUser || !raToken) {
        console.warn("Usuário ou token não definidos. Faça login primeiro.");
        return;
      }
      initGameTracking(romUrl);
    },
    stopTracking() {
      hideOverlay();
    }
  };
})();
