async function detectGameIdFromROM(romUrl) {
  const md5 = await calculateROMMD5(romUrl);
  if (!md5) return null;
  const url = `https://retroachievements.org/API/GetGameID.php?m=${md5}&z=${raUser}&y=${raToken}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.GameID) {
      document.getElementById("ra-game-title").textContent = `Jogo: ${data.GameTitle}`;
      document.getElementById("ra-game-progress").textContent = `Progresso: 0/${data.NumAchievements || 0}`;
      return data.GameID;
    }
    return null;
  } catch (err) {
    console.error("Erro ao detectar GameID:", err);
    return null;
  }
}

async function calculateROMMD5(romUrl) {
  try {
    const response = await fetch(romUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("MD5", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const md5 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return md5;
  } catch (err) {
    console.error("Erro ao calcular MD5:", err);
    return null;
  }
}