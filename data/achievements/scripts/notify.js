function showNotification(type, message) {
  const existing = document.querySelector(".ra-login-notification, .achievement-notification");
  if (existing) existing.remove();

  const notify = document.createElement("div");
  notify.className = type === "success" || type === "info"
    ? "ra-login-notification"
    : "achievement-notification";
  applyNotificationPosition(notify);
  notify.textContent = message;
  document.body.appendChild(notify);

  setTimeout(() => {
    notify.style.opacity = "0";
    setTimeout(() => notify.remove(), 500);
  }, 3000);
}

function applyNotificationPosition(element) {
  const pos = localStorage.getItem("ra_notify_pos") || "pos-top-right";
  element.classList.add(pos);
}