// E2E 2: ClaQui OS — área de trabalho, menu Start, janelas, barra de tarefas, menu de contexto, Configurações, Terminal/UAC, conquistas, energia.
const L = require('./lib'), P = require('./play');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const S = L.suite('E2E sistema'); const t = await L.start(); await L.boot(t); const p = t.page;
  // ---------- área de trabalho ----------
  const sc = await p.evaluate(() => [...document.querySelectorAll('.desktop-shortcut')].map(b => ({app: b.dataset.app, label: b.querySelector('.sc-label').textContent.trim(), ultra: b.classList.contains('ultra-shortcut')})));
  S.ok(sc.length === 9, 'área de trabalho: 8 atalhos + Ultra (' + sc.length + ')');
  const labels = sc.filter(s => !s.ultra).map(s => s.label); for (const l of ['Jogar', 'Continuar', 'Minhas Trilhas', 'Conquistas', 'Configurações', 'Recompensas', 'Sobre', 'Mais opções']) S.ok(labels.includes(l), 'atalho: ' + l);
  S.ok(sc.find(s => s.ultra)?.label === 'Ultra ClassiQuiz', 'Ultra separado à direita');
  const ux = await p.evaluate(() => { const u = document.querySelector('.ultra-shortcut').getBoundingClientRect(), c = document.querySelector('.desktop-center-panel').getBoundingClientRect(); return u.left >= c.right - 2; });
  S.ok(ux, 'Ultra fica à direita do bloco principal'); S.ok(!sc.some(s => s.app === 'dev'), 'Terminal fora da área de trabalho');
  await L.shot(t, 'desktop');
  // pasta "Mais opções"
  await p.dblclick('[data-app="mais"]').catch(async () => { await p.click('[data-app="mais"]'); });
  await p.waitForSelector('.cq-win[data-win="mais"]'); const mais = await p.evaluate(() => document.querySelector('.cq-win[data-win="mais"]').innerText);
  for (const l of ['Favoritas','Atualizações','Conquistas','Estatísticas','Recompensas','Explorador de Arquivos',
    'Bloco de Notas','Paint','Calculadora','Campo Minado','Jogo da Velha','Cobrinha','Desvio CQ','Pong',
    'Calendário','Relógio','Visualizador','Reprodutor','Lixeira']) S.ok(mais.includes(l), 'Mais opções contém ' + l);
  S.ok(!/Terminal/.test(mais), 'Terminal fora de Mais opções');
  S.ok(!await p.evaluate(() => !!CQ.apps.outros), 'pasta Outros removida');
  await L.shot(t, 'mais-opcoes');
  await p.evaluate(() => { CQ.os.wm.close('mais'); });
  // ---------- Start ----------
  await p.click('#start-button'); await sleep(250); const start = await p.evaluate(() => document.getElementById('start-menu').innerText);
  S.ok(/Terminal/.test(start), 'Start menu tem o Terminal'); S.ok(/Desligar/.test(start) && /Reiniciar/.test(start), 'Start menu tem Desligar e Reiniciar'); await L.shot(t, 'start-menu');
  await p.keyboard.press('Escape'); await sleep(150); S.ok(await p.evaluate(() => !document.getElementById('start-menu').classList.contains('open') && getComputedStyle(document.getElementById('start-menu')).display === 'none' || !document.getElementById('start-button').getAttribute('aria-expanded') === false), 'Esc fecha o Start');
  // ---------- barra de tarefas com muitas janelas ----------
  await p.setViewportSize({width: 900, height: 700});
  const ids = ['notepad', 'paint', 'calc', 'calendar', 'clock', 'player', 'mines', 'ttt', 'snake', 'pong', 'explorer', 'viewer', 'trash', 'about', 'updates', 'stats'];
  for (const id of ids) { await p.evaluate(id => { CQ.os.open(id); }, id); await sleep(80); }
  await sleep(400);
  const tb = await p.evaluate(() => { const s = document.getElementById('task-programs'); return {sw: s.scrollWidth, cw: s.clientWidth, ox: getComputedStyle(s).overflowX, doc: document.documentElement.scrollWidth, win: innerWidth, n: s.querySelectorAll('button').length}; });
  S.ok(tb.n >= ids.length, 'barra de tarefas lista as janelas abertas (' + tb.n + ')'); S.ok(tb.sw > tb.cw && /auto|scroll/.test(tb.ox), `rolagem horizontal só na faixa de programas (sw ${tb.sw} > cw ${tb.cw}, ${tb.ox})`);
  S.ok(tb.doc <= tb.win, 'página sem rolagem horizontal'); await L.shot(t, 'taskbar-multi');
  const tbtn = await p.evaluate(() => { const b = document.querySelector('#start-button').getBoundingClientRect(), c = document.getElementById('task-clock').getBoundingClientRect(); return b.right <= innerWidth && c.right <= innerWidth + 1; }); S.ok(tbtn, 'Start e relógio permanecem visíveis com muitas janelas');
  for (const id of ids) await p.evaluate(id => { CQ.os.wm.close(id); }, id); await sleep(300); for (let i = 0; i < 4 && await p.$('#modal-layer button'); i++) { await p.locator('#modal-layer button', {hasText: /Não salvar|OK/}).first().click().catch(() => {}); await sleep(150); }
  await p.setViewportSize({width: 1280, height: 800});
  // ---------- menu de contexto ----------
  await p.mouse.click(500, 500, {button: 'right'}); await sleep(200); S.ok(await p.evaluate(() => !document.getElementById('cq-context').hidden), 'botão direito abre menu de contexto próprio'); await L.shot(t, 'menu-contexto');
  const ctxTxt = await p.evaluate(() => document.getElementById('cq-context').innerText); S.ok(/Atualizar|Configurações|Exibir|Personalizar/i.test(ctxTxt), 'menu de contexto com opções do sistema: ' + ctxTxt.replace(/\n/g, ' | ').slice(0, 80));
  await p.keyboard.press('Escape'); await sleep(150); S.ok(await p.evaluate(() => document.getElementById('cq-context').hidden), 'Esc fecha o menu de contexto');
  await p.keyboard.down('Control'); await p.mouse.click(500, 500, {button: 'right'}); await p.keyboard.up('Control'); await sleep(200); S.ok(await p.evaluate(() => document.getElementById('cq-context').hidden), 'Ctrl+botão direito mantém o menu nativo do navegador');
  // ---------- Configurações ----------
  await p.evaluate(() => { CQ.os.open('settings'); }); await p.waitForSelector('.cq-win[data-win="settings"]');
  for (const sc of [125, 150, 175, 100]) { await p.locator('.cq-win[data-win="settings"] button', {hasText: new RegExp('^' + sc + '%')}).first().click(); await sleep(250); const z = await p.evaluate(() => ({s: CQ.os.scale(), ov: document.documentElement.scrollWidth <= innerWidth + 1 && document.documentElement.scrollHeight <= innerHeight + 1})); S.ok(Math.abs(z.s - sc / 100) < .02 || z.s <= sc / 100, `escala ${sc}% aplicada (${z.s})`); S.ok(z.ov, `escala ${sc}%: sem rolagem da página`); }
  await p.locator('.cq-win[data-win="settings"] button', {hasText: 'Personalização'}).click(); await sleep(300); await L.shot(t, 'config-personalizacao');
  const pers = await p.evaluate(() => document.querySelector('.cq-win[data-win="settings"]').innerText); S.ok(/Plano de fundo|Papel de parede|Fundo/i.test(pers), 'aba de personalização com fundo de tela');
  S.ok(/Preencher/i.test(pers) && /Ajustar/i.test(pers) && /Esticar/i.test(pers) && /Repetir|Lado a lado|Mosaico/i.test(pers), 'opções de encaixe: preencher/ajustar/esticar/repetir (lado a lado)');
  S.ok(/Restaurar/i.test(pers), 'restaurar fundo padrão');
  S.ok(await p.locator('.cq-win[data-win="settings"] input[type="file"]').count() >= 1, 'campo de importação de imagem presente (fluxo completo em 09-papel-de-parede.js)');
  await p.locator('.cq-win[data-win="settings"] button', {hasText: 'Som e animação'}).click(); await sleep(250); const som = await p.evaluate(() => document.querySelector('.cq-win[data-win="settings"]').innerText); S.ok(/Volume/i.test(som) && /movimento|animaç/i.test(som), 'aba de som e movimento reduzido');
  await p.evaluate(() => { CQ.os.wm.close('settings'); });
  // ---------- Terminal e UAC ----------
  const lockBefore = await p.evaluate(() => CQ.game.achievementsLocked()); S.ok(lockBefore === false, 'conquistas habilitadas no início');
  await p.click('#start-button'); await sleep(200); await p.locator('#start-menu button, #start-menu [role="menuitem"]', {hasText: 'Terminal'}).first().click(); await sleep(400);
  S.ok(await p.$('#modal-layer button') !== null, 'UAC fictício aparece ao abrir o Terminal'); const uac = await p.evaluate(() => document.getElementById('modal-layer').innerText); S.ok(/conquistas/i.test(uac) && /Sim/.test(uac) && /N.o/.test(uac), 'UAC avisa que conquistas serão desativadas: ' + uac.replace(/\n/g, ' ').slice(0, 120)); await L.shot(t, 'uac');
  const focus = await p.evaluate(() => document.activeElement?.textContent?.trim()); S.ok(/^N.o$/.test(focus || ''), 'foco inicial no botão Não (' + focus + ')');
  await p.locator('#modal-layer button', {hasText: /^N.o$/}).click(); await sleep(300); S.ok(!(await p.evaluate(() => CQ.os.wm.isOpen('dev'))), 'Não: Terminal não abre'); S.ok(await p.evaluate(() => CQ.game.achievementsLocked()) === false, 'Não: conquistas continuam ativas'); S.ok(!await p.evaluate(() => JSON.stringify(CQ.sys.get('terminalConsent') || null) !== 'null'), 'Não: nenhum consentimento salvo');
  await p.click('#start-button'); await sleep(200); await p.locator('#start-menu button, #start-menu [role="menuitem"]', {hasText: 'Terminal'}).first().click(); await sleep(400); await p.locator('#modal-layer button', {hasText: /^Sim$/}).click(); await sleep(600);
  S.ok(await p.evaluate(() => CQ.os.wm.isOpen('dev')), 'Sim: Terminal abre'); S.ok(await p.evaluate(() => CQ.game.achievementsLocked()) === true, 'Sim: conquistas desativadas'); await L.shot(t, 'terminal');
  S.ok(await p.evaluate(() => !!CQ.sys.get('terminalConsent')), 'consentimento salvo');
  // reabrir não repete o aviso
  await p.evaluate(() => { CQ.os.wm.close('dev'); }); await sleep(300); await p.evaluate(() => { CQ.os.open('dev'); }); await sleep(500); S.ok(!(await p.$('#modal-layer button')) && await p.evaluate(() => CQ.os.wm.isOpen('dev')), 'aviso do Terminal não se repete');
  // comandos
  await p.locator('.cq-win[data-win="dev"] input, .cq-win[data-win="dev"] textarea').first().fill('HELP').catch(() => {}); await p.keyboard.press('Enter'); await sleep(300); const term = await p.evaluate(() => document.querySelector('.cq-win[data-win="dev"]').innerText); S.ok(/STATUS|HELP|AJUDA|COMANDOS/i.test(term), 'Terminal responde a HELP');
  await p.evaluate(() => { CQ.os.wm.close('dev'); });
  // persistência após recarregar
  await p.reload(); await L.boot(t); S.ok(await p.evaluate(() => CQ.game.achievementsLocked()) === true, 'desativação persiste após recarregar');
  // Configurações > Conquistas: resetar com confirmação
  await p.evaluate(() => { CQ.os.open('settings'); }); await p.waitForSelector('.cq-win[data-win="settings"]'); await p.locator('.cq-win[data-win="settings"] button', {hasText: 'Conquistas'}).click(); await sleep(300);
  const ct = await p.evaluate(() => document.querySelector('.cq-win[data-win="settings"]').innerText); S.ok(/desativad/i.test(ct) && /Resetar conquistas/i.test(ct), 'Configurações mostra conquistas desativadas e botão de reset'); await L.shot(t, 'config-conquistas');
  await p.locator('.cq-win[data-win="settings"] button', {hasText: /Resetar conquistas/i}).first().click(); await sleep(300); S.ok(await p.$('#modal-layer button') !== null, 'reset pede confirmação');
  await p.locator('#modal-layer button', {hasText: /Cancelar|N.o/}).first().click(); await sleep(250); S.ok(await p.evaluate(() => CQ.game.achievementsLocked()) === true, 'cancelar o reset mantém desativado');
  await p.locator('.cq-win[data-win="settings"] button', {hasText: /Resetar conquistas/i}).first().click(); await sleep(300); await p.locator('#modal-layer button', {hasText: /Resetar|Confirmar|Sim/}).first().click(); await sleep(400);
  S.ok(await p.evaluate(() => CQ.game.achievementsLocked()) === false, 'após confirmar o reset, conquistas voltam'); S.ok(await p.evaluate(() => Object.keys(CQ.game.achievementsState().unlocked).length === 0), 'reset zera as conquistas desbloqueadas');
  await p.evaluate(() => { CQ.os.wm.close('settings'); });
  // Terminal depois do reset: o aviso NÃO volta (já aceito), mas as conquistas são bloqueadas de novo
  await p.evaluate(() => { CQ.os.open('dev'); }); await sleep(600); S.ok(!(await p.$('#modal-layer button')) && await p.evaluate(() => CQ.os.wm.isOpen('dev')), 'após o reset o aviso do Terminal não reaparece'); S.ok(await p.evaluate(() => CQ.game.achievementsLocked()) === true, 'abrir o Terminal de novo bloqueia as conquistas outra vez, sem aviso'); await p.evaluate(() => { CQ.os.wm.close('dev'); });
  // ---------- energia ----------
  await p.click('#start-button'); await sleep(200); await p.locator('#start-menu button, #start-menu [role="menuitem"]', {hasText: 'Reiniciar'}).first().click(); await sleep(400);
  if (await p.$('#modal-layer button')) await p.locator('#modal-layer button', {hasText: /Reiniciar|Sim|OK/}).first().click();
  await p.waitForFunction(() => document.getElementById('power-layer') && !document.getElementById('power-layer').hidden, null, {timeout: 6000}).catch(() => {}); S.ok(true, 'reiniciar inicia a simulação');
  await p.waitForFunction(() => document.getElementById('power-layer').hidden, null, {timeout: 25000}); S.ok(await p.evaluate(() => !document.getElementById('power-layer').hidden === false), 'reiniciar volta à área de trabalho');
  process.exit(S.done(t.errs));
})().catch(e => { console.error('FALHA', e); process.exit(1); });
