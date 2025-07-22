function simulateUnlock() {
  const notify = document.createElement("div");
  applyNotificationPosition(notify);
  notify.className = "achievement-notification";
  notify.textContent = "🏆 Nova conquista desbloqueada!";
  document.body.appendChild(notify);
  setTimeout(() => {
    notify.style.opacity = "0";
    setTimeout(() => notify.remove(), 500);
  }, 5000);
}