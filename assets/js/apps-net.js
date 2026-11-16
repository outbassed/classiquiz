/* ClaQui OS — REDE VIRTUAL (a "internet fictícia"), ícone da bandeja, painel rápido e janela Configurações de Rede. Licença: MIT.
   Atenção: isto NÃO é a rede real do aparelho. A rede virtual só decide se o ClaQui Browser enxerga os sites .cqo.
   A internet REAL é usada apenas por ClaQui Update (version.json); sem ela, o sistema, os jogos e os sites internos continuam funcionando. */
(() => {
'use strict';
const CQ = window.CQ, E = CQ.E, OS = CQ.os, WM = OS.wm, A = CQ.apps, $ = id => document.getElementById(id);

// =============== estado ===============
const net = CQ.net = {
  get online() { return CQ.sys.get('netOnline') !== false; },
  connecting: false,
  realOnline: () => (typeof navigator === 'undefined' || navigator.onLine !== false),
  fast: () => !!CQ.sys.get('fastEffects') || OS.reducedMotion(),
  // Atraso simulado (e leve) de carregamento de páginas. Nunca longo: no máximo ~1,3 s (discada ~2,4 s).
  latency() { if (net.fast()) return 40; const dial = !!CQ.sys.get('netDial'); return dial ? 700 + Math.random() * 1700 : 180 + Math.random() * 760; },
  async set(on) {
    on = !!on; if (net.connecting) return; if (on === net.online) { paint(); return; }
    if (on && CQ.sys.get('netDial') && !net.fast()) await dialUp();
    CQ.sys.set({netOnline: on}); paint(); CQ.bus.emit('net:change', {online: on});
    CQ.notify(on ? 'Rede do ClaQui OS: conectado.' : 'Rede do ClaQui OS: desconectado.'); CQ.tone(on ? 740 : 260, 90);
  },
  toggle() { return net.set(!net.online); }
};
async function dialUp() {   // modem 56k de mentirinha: sons curtos + mensagem, sem bloquear a interface
  net.connecting = true; paint();
  const steps = [['Discando…', [1200, 1200]], ['Verificando nome de usuário e senha…', [2100, 980]], ['Registrando seu computador na rede…', [1650, 2250, 1300]], ['Conectado a 56,0 Kbps', [980]]];
  for (const [msg, tones] of steps) { const p = $('net-panel-status'); if (p) p.textContent = msg; tones.forEach((hz, i) => setTimeout(() => CQ.tone(hz, 120, 'sawtooth'), i * 140)); await new Promise(r => setTimeout(r, 520)); }
  net.connecting = false;
}

// =============== bandeja: ícone ao lado do relógio + painel rápido ===============
const trayIcon = on => `<svg viewBox="0 0 20 18" width="22" height="20" aria-hidden="true" shape-rendering="crispEdges"><rect x="2" y="1" width="9" height="7" fill="#2b3a55"/><rect x="3.5" y="2.5" width="6" height="4" fill="${on ? '#8ec7e8' : '#9aa1ad'}"/><rect x="9" y="9" width="9" height="7" fill="#2b3a55"/><rect x="10.5" y="10.5" width="6" height="4" fill="${on ? '#b9f2c1' : '#9aa1ad'}"/><path d="M6 8v4h3" stroke="${on ? '#2f8f5d' : '#6b7280'}" stroke-width="1.4" fill="none"/>${on ? '' : '<path d="M2 17L18 1" stroke="#d33848" stroke-width="2.4"/>'}</svg>`;
function paint() {
  const b = $('task-net'); if (b) { b.innerHTML = trayIcon(net.online); b.setAttribute('aria-label', net.online ? 'Rede do ClaQui OS: conectado' : 'Rede do ClaQui OS: desconectado'); b.title = net.online ? 'Rede do ClaQui OS — conectado' : 'Rede do ClaQui OS — desconectado'; b.classList.toggle('off', !net.online); }
  const p = $('net-panel'); if (p && !p.hidden) renderPanel();
}
function renderPanel() {
  const p = $('net-panel'); if (!p) return; const on = net.online;
  p.innerHTML = `<div class="np-title"><img src="assets/icons/${on ? 'rede-on' : 'rede-off'}.svg" alt=""><b>Rede do ClaQui OS</b></div>
    <p id="net-panel-status" class="np-status" role="status">${net.connecting ? 'Conectando…' : on ? 'Conectado' : 'Desconectado'}</p>
    <p class="muted np-note">${on ? 'Os sites .cqo estão acessíveis no ClaQui Browser.' : 'O ClaQui Browser está sem rede. Os jogos continuam funcionando.'}</p>
    <div class="np-actions"><button type="button" class="chrome-button ${on ? '' : 'primary'}" data-act="net-toggle" ${net.connecting ? 'disabled' : ''}>${on ? 'Desconectar' : 'Conectar'}</button><button type="button" class="chrome-button" data-act="net-settings">Configurações de Rede…</button></div>`;
}
function togglePanel(force) {
  const p = $('net-panel'); if (!p) return; const open = force ?? p.hidden; p.hidden = !open; $('task-net')?.setAttribute('aria-expanded', String(open));
  if (open) { renderPanel(); p.querySelector('button')?.focus({preventScroll: true}); } else p.innerHTML = '';
}
OS.interceptors.push((act, btn) => {
  if (act === 'net-panel') { togglePanel(); return true; }
  if (act === 'net-toggle') { void net.toggle(); return true; }
  if (act === 'net-settings') { togglePanel(false); OS.open('netconfig'); return true; }
  return false;
});
document.addEventListener('click', e => { if (!e.target.closest('#net-panel,#task-net')) togglePanel(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') togglePanel(false); });

// =============== janela: Configurações de Rede ===============
let traffic = {rx: 0, tx: 0};
function netHtml() {
  const on = net.online, real = net.realOnline(), sys = CQ.sys.all();
  return `<div class="setup-simple net-settings"><div class="update-header"><img src="assets/icons/rede.svg" alt=""><div><h1>Configurações de Rede</h1><p class="muted">Conexões de rede do ClaQui OS</p></div></div>
    <fieldset class="net-card"><legend>Conexão local</legend>
      <p class="net-state ${on ? 'on' : 'off'}" role="status"><img src="assets/icons/${on ? 'rede-on' : 'rede-off'}.svg" alt="" width="32" height="32"> <b>${net.connecting ? 'Conectando…' : on ? 'Conectado' : 'Desconectado'}</b></p>
      <p class="muted">Esta é a <b>internet fictícia</b> do ClaQui OS: ela só liga ou desliga o acesso aos sites .cqo no ClaQui Browser. Sua preferência é lembrada ao reiniciar.</p>
      <div class="actions"><button type="button" class="chrome-button ${on ? '' : 'primary'}" data-act="net-toggle" ${net.connecting ? 'disabled' : ''}>${on ? 'Desconectar' : 'Conectar'}</button><button type="button" class="chrome-button" data-act="open-app" data-app="browser">Abrir ClaQui Browser</button></div>
      <p class="net-traffic muted" aria-label="Tráfego fictício">Enviados: <b id="net-tx">${traffic.tx}</b> pacotes • Recebidos: <b id="net-rx">${traffic.rx}</b> pacotes</p></fieldset>
    <fieldset class="net-card"><legend>Opções de navegação</legend>
      <label class="check"><input type="checkbox" data-net-opt="fastEffects" ${sys.fastEffects ? 'checked' : ''}> Efeitos rápidos (sem lentidão simulada nas páginas)</label>
      <label class="check"><input type="checkbox" data-net-opt="netDial" ${sys.netDial ? 'checked' : ''}> Simular conexão discada (sons de modem ao conectar)</label>
      <p class="muted">A lentidão clássica é só uma simulação leve e curta. “Seguir reduzir animações” do sistema também usa carregamento imediato.</p></fieldset>
    <fieldset class="net-card"><legend>Internet real (só para atualizações)</legend>
      <p class="net-state ${real ? 'on' : 'off'}">${real ? 'O aparelho informa estar online.' : 'O aparelho informa estar sem internet.'}</p>
      <p class="muted">Sem internet real, o ClaQui OS, os jogos e os sites .cqo continuam funcionando com os arquivos já instalados. Apenas o ClaQui Update precisa dela.</p>
      <div class="actions"><button type="button" class="chrome-button" data-act="open-app" data-app="updates">ClaQui Update</button></div></fieldset></div>`;
}
A.netconfig = {title: 'Configurações de Rede', icon: 'assets/icons/rede.svg', bodyClass: 'page', persistent: true, w: 620, h: 640,
  render(w) {
    const draw = () => { if (WM.get('netconfig')) { const st = w.body.scrollTop; w.body.innerHTML = netHtml(); w.body.scrollTop = st; w.setStatus(net.online ? 'Rede virtual conectada' : 'Rede virtual desconectada', 'ClaQui OS'); } };
    w.setTitle('Configurações de Rede'); w._draw = draw; draw();
    if (!w._bound) { w._bound = true;
      w.body.addEventListener('change', e => { const k = e.target.dataset.netOpt; if (k) { CQ.sys.set({[k]: !!e.target.checked}); } });
      w._off = [CQ.bus.on('net:change', draw), CQ.bus.on('sys:change', p => { if ('fastEffects' in p || 'netDial' in p) { /* sem redesenho: preserva foco */ } })];
      w._iv = setInterval(() => { if (!net.online || w.minimized) return; traffic.tx += 1 + Math.floor(Math.random() * 3); traffic.rx += 1 + Math.floor(Math.random() * 6); const a = w.body.querySelector('#net-tx'), b = w.body.querySelector('#net-rx'); if (a) a.textContent = traffic.tx; if (b) b.textContent = traffic.rx; }, 900);
      window.addEventListener('online', draw); window.addEventListener('offline', draw);
    }
  },
  onClose(w) { clearInterval(w._iv); (w._off || []).forEach(f => f && f()); if (w._draw) { window.removeEventListener('online', w._draw); window.removeEventListener('offline', w._draw); } }
};
CQ.bus.on('desktop:ready', paint);
paint();
})();
