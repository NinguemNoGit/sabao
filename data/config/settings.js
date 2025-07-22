// Aqui você pode colocar configurações gerais
localStorage.setItem("theme", "dark");
localStorage.setItem("language", "pt-BR");

// Função para carregar outros menus dinamicamente
async function loadDynamicSection(file, elementId) {
  try {
    const response = await fetch(file);
    const html = await response.text();
    document.getElementById(elementId).innerHTML = html;
  } catch (err) {
    console.error("Erro ao carregar conteúdo:", err);
    document.getElementById(elementId).innerHTML = "<p>❌ Erro ao carregar conteúdo.</p>";
  }
}