function showAppearanceMenu() {
  const options = `
    <div class="ra-appearance-menu" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #181818; padding: 2rem; border: 1px solid #333; z-index: 99999; text-align: center;">
      <h3>🎛️ Aparência</h3>
      <label><input type="radio" name="theme" value="dark" ${localStorage.getItem("ra_theme") !== "light" ? "checked" : ""}> 🌑 Tema Escuro</label><br>
      <label><input type="radio" name="theme" value="light" ${localStorage.getItem("ra_theme") === "light" ? "checked" : ""}> ☀️ Tema Claro</label><br><br>
      <label><strong>📍 Posição das Notificações:</strong></label><br>
      <label><input type="radio" name="notifyPos" value="pos-top-right" ${localStorage.getItem("ra_notify_pos") === "pos-top-right" || !localStorage.getItem("ra_notify_pos") ? "checked" : ""}> Topo Direita</label><br>
      <label><input type="radio" name="notifyPos" value="pos-bottom-right" ${localStorage.getItem("ra_notify_pos") === "pos-bottom-right" ? "checked" : ""}> Rodapé Direita</label><br>
      <label><input type="radio" name="notifyPos" value="pos-top-left" ${localStorage.getItem("ra_notify_pos") === "pos-top-left" ? "checked" : ""}> Topo Esquerda</label><br>
      <label><input type="radio" name="notifyPos" value="pos-bottom-left" ${localStorage.getItem("ra_notify_pos") === "pos-bottom-left" ? "checked" : ""}> Rodapé Esquerda</label><br>
      <label><input type="radio" name="notifyPos" value="pos-top-center" ${localStorage.getItem("ra_notify_pos") === "pos-top-center" ? "checked" : ""}> Topo Centralizado</label><br>
      <label><input type="radio" name="notifyPos" value="pos-bottom-center" ${localStorage.getItem("ra_notify_pos") === "pos-bottom-center" ? "checked" : ""}> Rodapé Centralizado</label><br><br>
      <button onclick="saveAppearanceSettings()">Salvar</button>
    </div>
  `;
  const existing = document.querySelector(".ra-appearance-menu");
  if (!existing) {
    document.body.insertAdjacentHTML("beforeend", options);
  }
}

function saveAppearanceSettings() {
  const theme = document.querySelector("input[name=theme]:checked").value;
  const notifyPos = document.querySelector("input[name=notifyPos]:checked").value;
  localStorage.setItem("ra_theme", theme);
  localStorage.setItem("ra_notify_pos", notifyPos);
  document.body.classList.toggle("light-mode", theme === "light");
  document.querySelector(".ra-appearance-menu").remove();
  showNotification("info", `Aparência salva.`);
}