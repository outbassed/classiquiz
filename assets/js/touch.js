/* ClaQui OS — camada de toque compartilhada pelos minijogos: deslizar (swipe), preferência de botões na tela e utilidades. Licença: MIT. */
(() => {
'use strict';
const CQ = window.CQ, touch = CQ.touch = {};
const coarse = () => matchMedia('(pointer:coarse)').matches;
touch.coarse = coarse;
// Botões de direção na tela são OPCIONAIS no toque: por padrão ficam ocultos em telas de toque (jogo se controla por gestos).
touch.buttonsOn = () => CQ.sys.get('touchButtons') === true;
touch.apply = () => { const a = document.getElementById('app'); if (a) a.dataset.touchbtn = touch.buttonsOn() ? 'on' : 'off'; };
touch.toggleHtml = () => '<button type="button" class="chrome-button tiny tb-toggle" data-touchbtn-toggle aria-pressed="false" title="Mostrar ou ocultar botões de direção na tela">🎮 Botões na tela</button>';
document.addEventListener('click', e => { const b = e.target.closest('[data-touchbtn-toggle]'); if (!b) return; CQ.sys.set({touchButtons: !touch.buttonsOn()}); touch.apply(); document.querySelectorAll('[data-touchbtn-toggle]').forEach(x => x.setAttribute('aria-pressed', String(touch.buttonsOn()))); });
CQ.bus.on('sys:change', p => { if (p && typeof p === 'object' && 'touchButtons' in p) touch.apply(); });
CQ.bus.on('desktop:ready', touch.apply); touch.apply();
// Detecta gestos de deslizar em `el` e chama onDir([dx,dy]) (cardinal). Encadeia vários gestos no mesmo toque. Bloqueia a rolagem da página.
touch.swipe = (el, onDir, {min = 20, onTap = null} = {}) => {
  let g = null; el.style.touchAction = 'none';
  const down = e => { if (e.target.closest('button,input,select,textarea,a,label')) return; g = {id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: false}; try { el.setPointerCapture(e.pointerId); } catch {} };
  const move = e => { if (!g || e.pointerId !== g.id) return; const dx = e.clientX - g.x, dy = e.clientY - g.y; if (Math.max(Math.abs(dx), Math.abs(dy)) < min) return; g.moved = true; onDir(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]); g.x = e.clientX; g.y = e.clientY; e.preventDefault(); };
  const up = e => { if (!g || e.pointerId !== g.id) return; const t = g; g = null; if (!t.moved && onTap && performance.now() - t.t < 400) onTap(e); };
  el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', () => { g = null; });
  return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); };
};
})();
