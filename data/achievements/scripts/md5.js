// Função para calcular o hash MD5 da ROM
async function calculateMD5(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("MD5", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hashArray;
}