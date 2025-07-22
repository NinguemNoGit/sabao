function loginToRetroAchievements() {
  const username = document.getElementById("ra-username").value.trim();
  const apikey = document.getElementById("ra-apikey").value.trim();
  if (username && apikey) {
    localStorage.setItem("ra_username", username);
    localStorage.setItem("ra_api_key", apikey);
    raUser = username;
    raToken = apikey;
    document.getElementById("ra-user-info").textContent = `Usuário: ${raUser}`;
    showNotification("success", "Login efetuado com sucesso!");
    initRetroAchievements();
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
  showNotification("info", "Logout realizado.");
}