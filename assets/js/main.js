/* ClaQui OS — ponto de entrada. Inicia o sistema (boot, migração, desktop). Licença: MIT. */
(() => {
'use strict';
const CQ = window.CQ;
CQ.os.start({
  beforeDesktop: async () => { CQ.game.init(); CQ.os.registerDesktop(); },
  afterDesktop: () => { CQ.bus.emit('desktop:ready', {}); }
}).catch(err => { console.error('[ClaQui OS]', err); const p = document.getElementById('power-layer'); if (p) { p.hidden = true; } });
})();
