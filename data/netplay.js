// data/netplay.js — Módulo de Netplay com suporte a 2 jogadores

let netplay = {
  isHost: false,
  player: 0, // 0 = Player 1, 1 = Player 2
  ws: null,
  listeners: {},
  init: function(isHost, roomId) {
    this.isHost = isHost;
    this.player = isHost ? 0 : 1;

    const url = `wss://retrocast-netplay.retroarchbrasil2019.workers.dev/netplay?room=${roomId}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      if (!isHost) {
        // Enviar mensagem de entrada do Player 2
        this.ws.send(JSON.stringify({ type: "player_joined", id: 1 }));
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "input" && msg.player === 1) {
          // Simular tecla para o Player 2
          this.simulateInput(msg.key, msg.state);
        }
      } catch (e) {}
    };

    // Capturar inputs do Player 2
    document.addEventListener('keydown', (e) => {
      if (this.player === 1) { // Só o Player 2 envia inputs
        this.ws.send(JSON.stringify({
          type: "input",
          player: 1,
          key: e.key,
          state: "press"
        }));
      }
    });

    document.addEventListener('keyup', (e) => {
      if (this.player === 1) {
        this.ws.send(JSON.stringify({
          type: "input",
          player: 1,
          key: e.key,
          state: "release"
        }));
      }
    });
  },

  simulateInput: function(key, state) {
    // Criar evento de teclado simulado
    const event = new KeyboardEvent(state === "press" ? "keydown" : "keyup", {
      key: key,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  }
};

// Exportar para uso global
window.netplay = netplay;