function loadConsoleMenu() {
  sectionContent.innerHTML = `
    <h3>🔌 Selecione um Console</h3>
    <ul class='game-list'>
      <li onclick="loadConsole('nes')">🎮 NES – Nintendo Entertainment System</li>
      <li onclick="loadConsole('snes')">🎮 SNES – Super Nintendo</li>
      <li onclick="loadConsole('gb')">🎮 Game Boy / Color</li>
      <li onclick="loadConsole('gba')">🎮 Game Boy Advance</li>
      <li onclick="loadConsole('segaMD')">🎮 SEGA Genesis / Mega Drive</li>
      <li onclick="loadConsole('segaGG')">🎮 SEGA Game Gear</li>
      <li onclick="loadConsole('n64')">🎮 Nintendo 64</li>
      <li onclick="loadConsole('psx')">🎮 PlayStation</li>
      <li onclick="loadConsole('atari2600')">🎮 Atari 2600</li>
      <li onclick="loadConsole('arcade')">🎮 Arcade (MAME)</li>
    </ul>
  `;
}