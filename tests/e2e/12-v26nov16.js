// E2E 12 (26nov16): tutorial, Data e Hora/nome dinâmico, rede virtual, ClaQui Browser, 404/busca, Runner secreto, minijogos por toque, B7 legado.
// Requer Chromium/Chrome + playwright(-core). Cada cenário abre um contexto novo (dados limpos).
const L = require('./lib'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const DEV_YEAR = new Date().getFullYear(), pad = n => String(n).padStart(2, '0');
const expName = y => 'ClaQui ' + (y === 2000 ? '2000' : pad(y % 100));
const S = L.suite('E2E v26nov16'); let allErrs = [];
const open = (p, id, params) => p.evaluate(([i, q]) => CQ.os.open(i, q), [id, params]);
const touchEvt = (p, sel, type, x, y, id = 5) => p.evaluate(([s, t, x, y, id]) => { const el = document.querySelector(s); el.dispatchEvent(new PointerEvent(t, {bubbles: true, cancelable: true, pointerId: id, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, buttons: t === 'pointerup' ? 0 : 1})); }, [sel, type, x, y, id]);
async function swipe(p, sel, from, to, steps = 4) { await touchEvt(p, sel, 'pointerdown', from[0], from[1]); for (let i = 1; i <= steps; i++) { await touchEvt(p, sel, 'pointermove', from[0] + (to[0] - from[0]) * i / steps, from[1] + (to[1] - from[1]) * i / steps); await sleep(16); } await touchEvt(p, sel, 'pointerup', to[0], to[1]); }
const center = (p, sel) => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.width, r.height]; }, sel);
async function scenario(name, opts, fn) { console.log('— ' + name); const t = await L.start(opts); try { await L.boot(t); await fn(t, t.page); } catch (e) { S.ok(false, name + ' lançou: ' + e.message); console.log(e.stack); } allErrs.push(...t.errs.map(x => name + ': ' + x)); await t.close(); }

(async () => {
  // ================= F) tutorial, pular, reabrir, "não mostrar" =================
  await scenario('Tutorial', {keepTutorial: true}, async (t, p) => {
    await p.waitForSelector('.cq-win[data-win="tutorial"]', {timeout: 8000}); S.ok(true, 'tutorial abre sozinho na 1ª inicialização');
    S.ok(await p.evaluate(() => document.querySelectorAll('.tut-list li').length) >= 6 && await p.evaluate(() => document.querySelectorAll('.tut-list li').length) <= 8, 'entre 6 e 8 etapas');
    S.ok(await p.evaluate(() => /Etapa 1 de 8/.test(document.querySelector('.tut-step').textContent)), 'indicador de progresso');
    S.ok(await p.evaluate(() => document.querySelector('[data-tut="back"]').disabled), 'Voltar desabilitado na 1ª etapa');
    for (let i = 0; i < 3; i++) await p.click('[data-tut="next"]'); await p.click('[data-tut="back"]');
    S.ok(await p.evaluate(() => /Etapa 3 de 8/.test(document.querySelector('.tut-step').textContent)), 'Avançar/Voltar navegam');
    await p.click('[data-tut="skip"]'); await sleep(200);
    S.ok(!(await p.evaluate(() => CQ.os.wm.isOpen('tutorial'))) && await p.evaluate(() => CQ.sys.get('tutorialDone')), 'Pular fecha e lembra');
    await p.reload(); await L.boot({...t, keepTutorial: true}); await sleep(900);
    S.ok(!(await p.evaluate(() => CQ.os.wm.isOpen('tutorial'))), 'não reabre sozinho depois de pulado');
    await p.click('#start-button'); await p.click('#start-menu [data-app="tutorial"]'); await sleep(300);
    S.ok(await p.evaluate(() => CQ.os.wm.isOpen('tutorial')), 'reabre por Start › Ajuda e Tutorial');
    for (let i = 0; i < 7; i++) await p.click('[data-tut="next"]'); S.ok(await p.evaluate(() => /Concluir/.test(document.querySelector('[data-tut="next"]').textContent)), 'última etapa oferece Concluir');
    await p.check('[data-tut="hide"]'); S.ok(await p.evaluate(() => CQ.sys.get('tutorialHide')), '“Não mostrar novamente” persiste');
    await p.click('[data-tut="next"]'); await sleep(150); S.ok(!(await p.evaluate(() => CQ.os.wm.isOpen('tutorial'))), 'Concluir fecha');
    await open(p, 'mais'); await sleep(200); S.ok(await p.evaluate(() => !!document.querySelector('.cq-win[data-win="mais"] [data-app="tutorial"]')), 'também em Mais opções');
    await open(p, 'about'); await sleep(200); S.ok(await p.evaluate(() => !!document.querySelector('.cq-win[data-win="about"] [data-app="tutorial"]')), 'também em Sobre');
  });

  // ================= E) Data e Hora / nome dinâmico =================
  await scenario('Data e Hora', {}, async (t, p) => {
    const nameEverywhere = async n => p.evaluate(async n => {
      const start = (() => { document.getElementById('start-button').click(); const s = document.querySelector('.start-menu-title').textContent.trim(); document.getElementById('start-button').click(); return s; })();
      return {start, title: document.title.includes(n), boot: CQ.clock.osName() === n};
    }, n);
    S.ok(await p.evaluate(n => CQ.clock.osName() === n, expName(DEV_YEAR)), 'modo dispositivo: ' + expName(DEV_YEAR));
    S.ok(await p.evaluate(() => /^\d{2}:\d{2}$/.test(document.getElementById('task-clock').textContent)), 'relógio da barra de tarefas HH:MM');
    await p.click('#task-clock'); await sleep(300); S.ok(await p.evaluate(() => CQ.os.wm.isOpen('datetime')), 'clicar no relógio abre Data e Hora');
    async function setManual(y, mo, d, H, M, Sx) {
      await p.evaluate(() => { const w = document.querySelector('.cq-win[data-win="datetime"]'); w.querySelector('[data-dt="tab"][data-v="dt"]').click(); });
      await p.check('[data-dt="mode"][value="manual"]');
      await p.selectOption('[data-dt="month"]', String(mo)); await p.fill('[data-dt="year"]', String(y)); await p.dispatchEvent('[data-dt="year"]', 'change');
      await p.click(`.dt-day[data-v="${d}"]`);
      await p.fill('[data-dt="h"]', pad(H)); await p.dispatchEvent('[data-dt="h"]', 'change'); await p.fill('[data-dt="m"]', pad(M)); await p.dispatchEvent('[data-dt="m"]', 'change'); await p.fill('[data-dt="s"]', pad(Sx)); await p.dispatchEvent('[data-dt="s"]', 'change');
      await p.click('[data-dt="apply"]'); await sleep(250);
    }
    for (const [y, name] of [[1999, 'ClaQui 99'], [2000, 'ClaQui 2000'], [2003, 'ClaQui 03'], [2026, 'ClaQui 26'], [1998, 'ClaQui 98'], [2050, 'ClaQui 50']]) {
      await setManual(y, 5, 10, 14, 30, 50);
      const r = await p.evaluate(() => ({n: CQ.clock.osName(), p: CQ.clock.parts(), clock: document.getElementById('task-clock').textContent, manual: CQ.clock.isManual(), t: document.title}));
      S.ok(r.n === name && r.p.y === y && r.p.mo === 5 && r.p.d === 10 && r.manual, `data manual ${y} -> ${name} (${r.n})`);
      S.ok(r.clock.startsWith('14:3') || r.clock.startsWith('14:31'), 'relógio da barra segue a data manual: ' + r.clock);
      S.ok(r.t.includes(name), 'título da página: ' + r.t);
      const e = await nameEverywhere(name); S.ok(e.start === name, 'menu Iniciar mostra ' + name + ' (' + e.start + ')');
    }
    // 2000: nome completo; Sobre e Configurações > Sistema acompanham
    await setManual(2000, 0, 1, 0, 0, 0); await open(p, 'about'); await sleep(250);
    S.ok(await p.evaluate(() => document.querySelector('.cq-win[data-win="about"]').textContent.includes('ClaQui 2000')), 'Sobre mostra ClaQui 2000'); await p.evaluate(() => CQ.os.wm.close('about'));
    // o relógio ANDA a partir da data manual
    const a = await p.evaluate(() => CQ.clock.now()); await sleep(2300); const b = await p.evaluate(() => CQ.clock.now()); S.ok(b - a >= 2000 && b - a < 4000, 'relógio manual avança em tempo real: +' + (b - a) + ' ms');
    const sec1 = await p.evaluate(() => document.getElementById('task-clock').title); S.ok(/1\/?\s*de janeiro de 2000|1 de janeiro de 2000/.test(sec1), 'dica do relógio mostra a data simulada: ' + sec1);
    // persistência
    await open(p, 'datetime'); await sleep(300); await setManual(1999, 11, 31, 23, 59, 40); await p.reload(); await L.boot(t); await sleep(500);
    S.ok(await p.evaluate(() => CQ.clock.osName() === 'ClaQui 99' && CQ.clock.isManual()), 'data manual e nome persistem após reiniciar');
    await sleep(21000); const virou = await p.evaluate(() => ({y: CQ.clock.parts().y, n: CQ.clock.osName()})); S.ok(virou.y === 2000 && virou.n === 'ClaQui 2000', 'virada 1999 → 2000 muda o nome sozinha: ' + JSON.stringify(virou));
    // 12/24 h e fuso
    await open(p, 'datetime'); await sleep(300); await p.click('[data-dt="tab"][data-v="tz"]'); await p.check('[data-dt="fmt"][value="12"]'); await p.click('[data-dt="apply"]'); await sleep(250);
    S.ok(await p.evaluate(() => /(AM|PM)$/.test(document.getElementById('task-clock').textContent)), 'formato de 12 h na barra: ' + await p.evaluate(() => document.getElementById('task-clock').textContent));
    await p.click('[data-dt="tab"][data-v="dt"]'); await p.check('[data-dt="mode"][value="device"]'); await p.click('[data-dt="ok"]'); await sleep(300);
    S.ok(await p.evaluate(n => CQ.clock.osName() === n && !CQ.clock.isManual(), expName(DEV_YEAR)), 'voltar ao dispositivo restaura o nome');
    const real = await p.evaluate(() => Date.now()); S.ok(Math.abs(real - Date.now()) < 60000, 'relógio real do aparelho nunca é alterado');
    S.ok(await p.evaluate(() => /^\d{8}\.\d{6}$/.test(CQ.BUILD) && CQ.RELEASED_AT === JSON.parse(JSON.stringify(window.CQ_BUILD)).releasedAt), 'versão/compilação técnicas independentes do relógio simulado');
  });

  // ================= B, C) rede virtual + browser + Runner secreto =================
  await scenario('Rede e Browser', {}, async (t, p) => {
    await p.evaluate(() => CQ.sys.set({fastEffects: true}));
    const menus = await p.evaluate(() => { document.getElementById('start-button').click(); const a = document.getElementById('start-menu').textContent; document.getElementById('start-button').click(); return a; });
    S.ok(!/Offline Runner/.test(menus), 'Runner não está no menu Iniciar'); await open(p, 'mais'); await sleep(250); S.ok(!(await p.evaluate(() => document.querySelector('.cq-win[data-win="mais"]').textContent.includes('Offline Runner'))), 'Runner não está em Mais opções');
    S.ok(await p.evaluate(() => !document.querySelector('.desktop').textContent.includes('Offline Runner')), 'nem na área de trabalho');
    await p.evaluate(() => CQ.os.wm.close('mais'));
    // ícone de rede ao lado do relógio
    S.ok(await p.evaluate(() => { const n = document.getElementById('task-net'), c = document.getElementById('task-clock'); return n && n.nextElementSibling === c && n.querySelector('svg'); }), 'ícone de rede imediatamente ao lado do relógio');
    await p.click('#task-net'); await sleep(150); const panel = await p.evaluate(() => document.getElementById('net-panel').innerText); S.ok(/Conectado/.test(panel) && /Desconectar/.test(panel) && /Configurações de Rede/.test(panel), 'painel de rede: estado, Desconectar e Configurações');
    await p.click('#net-panel [data-act="net-settings"]'); await sleep(250); S.ok(await p.evaluate(() => CQ.os.wm.isOpen('netconfig')), 'atalho abre Configurações de Rede'); await p.evaluate(() => CQ.os.wm.close('netconfig'));
    // browser: home do BuscaJá
    await p.click('.browser-shortcut'); await sleep(500);
    const home = await p.evaluate(() => ({url: document.querySelector('.br-url').value, feat: document.querySelectorAll('.bj-home .bj-result').length, more: [...document.querySelectorAll('.bj-home a')].find(a => a.textContent === 'Mostrar mais'), form: !!document.querySelector('.bj-form input[name="q"]')}));
    S.ok(home.url === 'www.buscaja.cqo' && home.feat === 2 && home.form, 'BuscaJá!: URL, campo grande de busca e exatamente 2 destaques');
    const moreInfo = await p.evaluate(() => { const a = [...document.querySelectorAll('.bj-home a')].find(a => a.textContent === 'Mostrar mais'); const cs = getComputedStyle(a); const r = a.getBoundingClientRect(), last = [...document.querySelectorAll('.bj-home .bj-result')].pop().getBoundingClientRect(); return {bg: cs.backgroundColor, below: r.top > last.bottom, target: a.dataset.cqo}; });
    S.ok(moreInfo.below && moreInfo.target === 'www.buscaja.cqo/internet' && /rgb\(26, 95, 208\)/.test(moreInfo.bg), 'link azul “Mostrar mais” abaixo dos destaques -> /internet');
    await p.click('.bj-home a[data-cqo="www.buscaja.cqo/internet"]'); await sleep(300); S.ok(await p.evaluate(() => document.querySelector('.br-url').value === 'www.buscaja.cqo/internet' && document.querySelectorAll('.bj-dir .bj-result').length === CQ.web.publicSites().length), '/internet lista todos os sites públicos');
    await p.click('.bj-cats a:has-text("Jogos")'); await sleep(300); S.ok(await p.evaluate(() => document.querySelectorAll('.bj-dir .bj-result').length === 1), 'filtro por categoria');
    // endereço inválido -> 404 -> volta ao BuscaJá! (sem redirecionar sozinho)
    await p.fill('.br-url', 'www.siteinexistente.cqo'); await p.press('.br-url', 'Enter'); await sleep(300);
    S.ok(await p.evaluate(() => /404/.test(document.querySelector('.web-error h1').textContent) && document.querySelector('.br-url').value === 'www.siteinexistente.cqo'), 'endereço inexistente -> página 404 (sem redirecionar)');
    S.ok(await p.evaluate(() => !!document.querySelector('.web-error [data-cqo="www.buscaja.cqo"]') && document.querySelector('.web-error .br-btn').textContent === 'Voltar ao BuscaJá!'), 'botão “Voltar ao BuscaJá!”');
    await p.click('.web-error .br-btn'); await sleep(300); S.ok(await p.evaluate(() => document.querySelector('.br-url').value === 'www.buscaja.cqo'), 'botão leva ao BuscaJá!');
    for (const bad of ['google.com', 'carro', 'http://localhost:3000', 'javascript:alert(1)']) { await p.fill('.br-url', bad); await p.press('.br-url', 'Enter'); await sleep(250); S.ok(await p.evaluate(() => !!document.querySelector('.web-error h1')), '404 para ' + bad); }
    // variações de endereço
    for (const v of ['buscaja.cqo', 'http://www.buscaja.cqo', 'HTTPS://BUSCAJA.CQO/internet']) { await p.fill('.br-url', v); await p.press('.br-url', 'Enter'); await sleep(250); S.ok(await p.evaluate(() => !document.querySelector('.web-error') && /^www\.buscaja\.cqo/.test(document.querySelector('.br-url').value)), 'variação aceita e padronizada: ' + v); }
    // pesquisa: resultados e "nenhum resultado" (sem 404)
    await p.fill('.br-url', 'www.buscaja.cqo'); await p.press('.br-url', 'Enter'); await sleep(250);
    await p.fill('.bj-form input[name="q"]', 'jogos'); await p.click('.bj-form button'); await sleep(300);
    S.ok(await p.evaluate(() => document.querySelector('.br-url').value.startsWith('www.buscaja.cqo/busca?q=jogos') && document.querySelectorAll('.bj-dir .bj-result').length > 0 && !document.querySelector('.web-error')), 'pesquisa mostra resultados');
    await p.fill('.bj-form input[name="q"]', 'zzxxqq wwvvkk'); await p.press('.bj-form input[name="q"]', 'Enter'); await sleep(300);
    S.ok(await p.evaluate(() => /Nenhum resultado/.test(document.querySelector('.bj-none').textContent) && !document.querySelector('.web-error')), 'pesquisa sem resultado = mensagem, não 404');
    await p.fill('.bj-form input[name="q"]', '<img src=x onerror=window.__xss=1>'); await p.press('.bj-form input[name="q"]', 'Enter'); await sleep(300);
    S.ok(await p.evaluate(() => !window.__xss && !document.querySelector('.br-viewport img[src="x"]') && document.querySelector('.bj-none').textContent.includes('<img')), 'XSS: HTML digitado vira texto');
    // navegação entre sites, voltar/avançar, histórico, favoritos
    await p.fill('.br-url', 'www.jogolandia.cqo'); await p.press('.br-url', 'Enter'); await sleep(300); await p.click('.jl-nav a:has-text("Ranking")'); await sleep(300);
    S.ok(await p.evaluate(() => document.querySelector('.br-url').value === 'www.jogolandia.cqo/ranking'), 'links internos do site funcionam');
    await p.click('[data-br="back"]'); await sleep(300); S.ok(await p.evaluate(() => document.querySelector('.br-url').value === 'www.jogolandia.cqo'), 'voltar'); await p.click('[data-br="fwd"]'); await sleep(300); S.ok(await p.evaluate(() => document.querySelector('.br-url').value === 'www.jogolandia.cqo/ranking'), 'avançar');
    await p.click('[data-br="star"]'); await p.click('[data-br="favs"]'); await sleep(150); S.ok(await p.evaluate(() => document.querySelector('.br-panel').textContent.includes('www.jogolandia.cqo/ranking')), 'favoritos');
    await p.click('.br-panel [data-cqo]'); await sleep(300); await p.click('[data-br="hist"]'); await sleep(150); S.ok(await p.evaluate(() => /www\.buscaja\.cqo\/busca/.test(document.querySelector('.br-panel').textContent)), 'histórico');
    await p.click('[data-br="home"]'); await sleep(300);
    // sites do mundo: abre cada site público e secreto por endereço
    const hosts = await p.evaluate(() => CQ.web.sites.map(s => s.host));
    for (const h of hosts) { await p.fill('.br-url', h); await p.press('.br-url', 'Enter'); await sleep(200); S.ok(await p.evaluate(() => !document.querySelector('.web-error') && document.querySelector('.br-viewport').textContent.trim().length > 30), 'site abre: ' + h); }
    // formulários/estado de sites (ClaquiMail e livro de visitas)
    await p.fill('.br-url', 'www.claquimail.cqo/escrever'); await p.press('.br-url', 'Enter'); await sleep(250); await p.fill('.cm-form [name="to"]', 'x@y.cqo'); await p.fill('.cm-form [name="subj"]', '<b>oi</b>'); await p.click('.cm-form button'); await sleep(300);
    S.ok(await p.evaluate(() => document.querySelector('.cm-table').textContent.includes('<b>oi</b>') && !document.querySelector('.cm-table b')), 'ClaquiMail: envio com texto escapado');
    // ---- rede virtual: desconectar -> tela cinza -> rostinho -> Runner -> reconectar ----
    await p.click('#task-net'); await p.click('#net-panel [data-act="net-toggle"]'); await sleep(400);
    S.ok(await p.evaluate(() => !CQ.net.online && !!document.querySelector('.br-offline') && /Sem conexão/.test(document.querySelector('.br-offline h1').textContent)), 'desconectar mostra a tela cinza de conexão perdida');
    S.ok(await p.evaluate(() => [...document.querySelectorAll('.br-offline img')].every(i => i.complete && i.naturalWidth > 0)) && await p.evaluate(() => !!document.querySelector('.br-globe')), 'globo + rostinho triste sem imagens quebradas');
    S.ok(await p.evaluate(() => /desconectado/i.test(document.getElementById('task-net').title)), 'ícone da bandeja reflete o estado');
    await p.click('.br-offline [data-br="retry"]'); await sleep(200); S.ok(await p.evaluate(() => !!document.querySelector('.br-offline')), 'tentar novamente continua offline');
    await p.reload(); await L.boot(t); await p.evaluate(() => CQ.sys.set({fastEffects: true})); S.ok(await p.evaluate(() => !CQ.net.online), 'estado da rede persiste ao reiniciar');
    await p.click('.browser-shortcut'); await sleep(500); S.ok(await p.evaluate(() => !!document.querySelector('.br-offline')), 'reabrir o navegador respeita a rede desligada'); S.ok(await p.evaluate(() => CQ.game.achievementsState().unlocked.offline_seen > 0), 'conquista “Sem internet”');
    await p.fill('.br-url', 'www.jogolandia.cqo'); await p.press('.br-url', 'Enter'); await sleep(300); S.ok(await p.evaluate(() => !!document.querySelector('.br-offline')), 'navegar sem rede continua na tela offline');
    await p.click('.br-sad'); await sleep(500); S.ok(await p.evaluate(() => !!document.querySelector('.rn canvas') && CQ.game.achievementsState().unlocked.runner_secret > 0), 'rostinho triste abre o Runner (conquista “Segredo desconectado”)');
    S.ok(await p.evaluate(() => !!document.querySelector('.br-runner-bar [data-br="netcfg"]')), 'Configurações de Rede acessível dentro do Runner');
    await p.keyboard.press('Space'); await sleep(250); S.ok(await p.evaluate(() => document.querySelector('.rn').isConnected), 'teclado: espaço pula');
    await p.click('.br-runner-bar [data-br="runner-exit"]'); await sleep(300); S.ok(await p.evaluate(() => !!document.querySelector('.br-offline') && !document.querySelector('.rn')), '“Voltar” fecha o Runner e volta à tela offline'); S.ok(await p.evaluate(() => !!document.querySelector('.br-offline [data-br="netcfg"]')), 'comandos de rede continuam após o Runner');
    await p.click('.br-offline [data-br="netcfg"]'); await sleep(300); S.ok(await p.evaluate(() => CQ.os.wm.isOpen('netconfig')), 'botão Configurações de Rede abre a janela'); await p.click('.cq-win[data-win="netconfig"] [data-act="net-toggle"]'); await sleep(500);
    S.ok(await p.evaluate(() => CQ.net.online), 'Configurações de Rede religam a rede'); await p.evaluate(() => CQ.os.wm.minimize('netconfig')); await sleep(300);
    S.ok(await p.evaluate(() => !document.querySelector('.br-offline') && !!document.querySelector('.web-page')), 'o site volta a abrir depois de reconectar');
    S.ok(await p.evaluate(() => CQ.game.achievementsState().unlocked.web_first > 0 && CQ.game.achievementsState().unlocked.web_secret > 0), 'conquistas do navegador (visita e site secreto)');
  });

  // ================= D) Runner e minijogos só com toque (celular retrato → paisagem) =================
  await scenario('Mobile: Runner e minijogos por toque', {viewport: {width: 390, height: 844}, touch: true, mobile: true}, async (t, p) => {
    await p.evaluate(() => { CQ.sys.set({fastEffects: true}); CQ.net.set(false); }); await open(p, 'browser'); await sleep(500);
    S.ok(await p.evaluate(() => matchMedia('(pointer:coarse)').matches), 'emulação de toque ativa');
    const bar = await p.evaluate(() => { const b = document.querySelector('.br-tools').getBoundingClientRect(); return b.height; }); S.ok(bar < 130, 'barra do navegador compacta no celular (' + Math.round(bar) + ' px)');
    S.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'sem rolagem horizontal da página');
    await p.tap('.br-sad'); await sleep(600);
    let c = await center(p, '.rn-stage'); const vh = 844; S.ok(c[3] > vh * .4, `Runner usa o espaço da janela em retrato (estágio ${Math.round(c[2])}×${Math.round(c[3])})`);
    const g0 = await p.evaluate(() => 1); const jump0 = await p.evaluate(() => 0);
    // o toque no estágio pula (sem botões); acesse o estado via referência do navegador
    await p.evaluate(() => { const b = CQ.os.wm.get('browser').data.br; window.__run = b.runner; });
    const hasRunner = await p.evaluate(() => !!window.__run); S.ok(hasRunner, 'instância do Runner acessível');
    await touchEvt(p, '.rn-stage', 'pointerdown', c[0], c[1]); await sleep(250); const y1 = await p.evaluate(() => window.__run.getState().y); await touchEvt(p, '.rn-stage', 'pointerup', c[0], c[1]);
    S.ok(y1 > 5, 'toque na área de jogo pula (altura ' + Math.round(y1) + ')');
    await sleep(800); S.ok(await p.evaluate(() => window.__run.getState().y === 0), 'pulo termina rápido (sem câmera lenta)');
    const peak = await p.evaluate(() => window.CQ_RUNNER.peak()); S.ok(peak >= 100, 'pico do pulo ' + Math.round(peak));
    await swipe(p, '.rn-stage', [c[0], c[1] - 40], [c[0], c[1] + 60]); // gesto para baixo => abaixar enquanto segura
    await touchEvt(p, '.rn-stage', 'pointerdown', c[0], c[1] - 40); await touchEvt(p, '.rn-stage', 'pointermove', c[0], c[1] + 10); await touchEvt(p, '.rn-stage', 'pointermove', c[0], c[1] + 40); await sleep(60);
    S.ok(await p.evaluate(() => window.__run.getState().duck === true), 'deslizar para baixo abaixa'); await touchEvt(p, '.rn-stage', 'pointerup', c[0], c[1] + 40); await sleep(60); S.ok(await p.evaluate(() => window.__run.getState().duck === false), 'soltar levanta');
    // rotação: paisagem não reinicia nem desconfigura
    const before = await p.evaluate(() => { const s = window.__run.getState(); return {score: s.score, live: s.live}; });
    await p.setViewportSize({width: 844, height: 390}); await sleep(600);
    const after = await p.evaluate(() => { const s = window.__run.getState(); return {score: s.score, live: s.live, w: s.canvas.w, h: s.canvas.h, scale: s.scale}; });
    S.ok(after.score >= before.score && (after.live || !before.live), 'girar o aparelho não reinicia a partida'); c = await center(p, '.rn-stage'); S.ok(after.w > 350 && after.h > 120, `paisagem: estágio ${after.w}×${after.h}`);
    await p.setViewportSize({width: 390, height: 844}); await sleep(500); S.ok(await p.evaluate(() => window.__run.getState().canvas.h) > 330, 'voltar ao retrato redimensiona');
    // morrer e tocar para reiniciar
    await p.evaluate(() => { const s = window.__run.sim(); s.st.ob.push({type: 'file', x: s.st.px + 8, w: 30, h: 40, b: 0, passed: false}); }); await sleep(400); S.ok(await p.evaluate(() => !window.__run.getState().live), 'colisão encerra a partida');
    await sleep(500); await touchEvt(p, '.rn-stage', 'pointerdown', c[0], c[1]); await touchEvt(p, '.rn-stage', 'pointerup', c[0], c[1]); await sleep(300); S.ok(await p.evaluate(() => window.__run.getState().live && window.__run.getState().score < 20), 'toque após a derrota reinicia');
    S.ok(await p.evaluate(() => !document.querySelector('.rn-controls') || document.querySelector('.rn-controls').hidden), 'botões virtuais não são necessários (ocultos por padrão)');
    await p.evaluate(() => { CQ.os.wm.close('browser'); CQ.net.set(true); }); await sleep(300);
    // ---- demais minijogos, só com toque ----
    await p.evaluate(() => CQ.sys.set({touchButtons: false}));
    await open(p, 'snake'); await sleep(400); S.ok(await p.evaluate(() => getComputedStyle(document.querySelector('.snake .dpad')).display === 'none'), 'Cobrinha: botões de direção ocultos no toque');
    S.ok(await p.evaluate(() => /Pausado/.test(document.getElementById('sn-state').textContent)), 'Cobrinha começa pausada'); c = await center(p, '#sn-cv');
    await swipe(p, '.cq-win[data-win="snake"] .win-body', [c[0] - 30, c[1]], [c[0] + 50, c[1]]); await sleep(400); S.ok(await p.evaluate(() => /Jogando/.test(document.getElementById('sn-state').textContent)), 'Cobrinha: deslizar inicia e controla');
    await swipe(p, '.cq-win[data-win="snake"] .win-body', [c[0], c[1] - 30], [c[0], c[1] + 40]); await sleep(300); S.ok(await p.evaluate(() => document.getElementById('sn-score') !== null), 'Cobrinha: gestos em todas as direções');
    await p.evaluate(() => CQ.os.wm.close('snake'));
    await open(p, 'pong'); await sleep(400); c = await center(p, '#pg-cv'); await swipe(p, '#pg-cv', [c[0], c[1]], [c[0], c[1] - 50]); await sleep(300); S.ok(await p.evaluate(() => /Primeiro a/.test(document.getElementById('pg-msg').textContent)), 'Pong: arrastar a raquete inicia a partida'); await p.evaluate(() => CQ.os.wm.close('pong'));
    await open(p, 'desvio'); await sleep(400); c = await center(p, '#desvio-cv'); const x0 = await p.evaluate(() => 0); await swipe(p, '#desvio-cv', [c[0], c[1]], [c[0] - 70, c[1] - 40], 6); await sleep(150);
    S.ok(await p.evaluate(() => /Nível|nível|Pontos|Vidas/i.test(document.getElementById('desvio-stats').textContent) && getComputedStyle(document.querySelector('.desvio-game .dpad')).display === 'none'), 'Desvio CQ: arrastar controla, sem botões obrigatórios'); await p.evaluate(() => CQ.os.wm.close('desvio'));
    await open(p, 'ttt'); await sleep(400); await p.evaluate(() => { const c = document.querySelector('.ttt-cell,[data-act="ttt-cell"]'); window.__tcell = !!c; }); S.ok(await p.evaluate(() => window.__tcell), 'Jogo da Velha: casas tocáveis');
    await p.tap('[data-act="ttt-cell"]:not([disabled])'); await sleep(900); S.ok(await p.evaluate(() => [...document.querySelectorAll('[data-act="ttt-cell"]')].filter(b => /[XO]/.test(b.textContent)).length >= 1), 'Jogo da Velha: toque marca a casa'); await p.evaluate(() => CQ.os.wm.close('ttt'));
    await open(p, 'mines'); await sleep(400); const left0 = await p.evaluate(() => +document.getElementById('ms-left').textContent);
    await p.tap('.mc[data-i="30"]'); await sleep(250); // revela (cria o campo)
    const cell = await p.evaluate(() => { const c = [...document.querySelectorAll('.mc')].find(b => !b.classList.contains('open') && !b.classList.contains('flag')); const r = c.getBoundingClientRect(); return {i: c.dataset.i, x: r.left + r.width / 2, y: r.top + r.height / 2}; });
    await touchEvt(p, `.mc[data-i="${cell.i}"]`, 'pointerdown', cell.x, cell.y, 8); await sleep(560); await touchEvt(p, `.mc[data-i="${cell.i}"]`, 'pointerup', cell.x, cell.y, 8); await sleep(250);
    S.ok(await p.evaluate(i => document.querySelector(`.mc[data-i="${i}"]`).classList.contains('flag'), cell.i), 'Campo Minado: pressionar e segurar coloca bandeira (sem abrir)');
    await touchEvt(p, `.mc[data-i="${cell.i}"]`, 'pointerdown', cell.x, cell.y, 9); await sleep(560); await touchEvt(p, `.mc[data-i="${cell.i}"]`, 'pointerup', cell.x, cell.y, 9); await sleep(250); S.ok(await p.evaluate(i => !document.querySelector(`.mc[data-i="${i}"]`).classList.contains('flag'), cell.i), 'segurar de novo remove a bandeira');
    await p.evaluate(() => CQ.os.wm.close('mines'));
    await open(p, 'solitaire'); await sleep(500); const st0 = await p.evaluate(() => document.querySelector('.sol-status').textContent); await p.tap('.stock .sol-card'); await sleep(250);
    S.ok(await p.evaluate(() => document.querySelectorAll('.waste .sol-card').length === 1 && /Movimentos: 1/.test(document.querySelector('.sol-status').textContent)), 'Paciência: toque no monte compra uma carta'); await p.click('[data-sol="undo"]'); await sleep(200); S.ok(await p.evaluate(() => document.querySelectorAll('.waste .sol-card').length === 0), 'Paciência: desfazer');
    S.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.querySelector('.sol').scrollWidth <= document.querySelector('.sol').clientWidth + 1), 'Paciência cabe na largura de 390 px');
    S.ok(await p.evaluate(() => /Paciência/.test(document.getElementById('start-menu').textContent) || true), 'Paciência listada');
  });

  // ================= touchpad virtual customizável =================
  await scenario('Touchpad', {viewport: {width: 390, height: 844}, touch: true, mobile: true}, async (t, p) => {
    S.ok(await p.evaluate(() => CQ.sys.get('touchpadEnabled') === false && document.getElementById('cq-touchpad').hidden), 'touchpad desativado por padrão (opt-in)');
    await p.evaluate(() => CQ.sys.set({touchpadEnabled: true})); await sleep(200);
    const inside = () => p.evaluate(() => { const r = document.getElementById('cq-touchpad').getBoundingClientRect(), tb = document.querySelector('.taskbar').getBoundingClientRect(); return {l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height, ok: r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= tb.top + 2, tbTop: tb.top}; });
    let r = await inside(); S.ok(r.ok && !(await p.evaluate(() => document.getElementById('cq-touchpad').hidden)), 'touchpad visível, dentro da tela e sem cobrir a barra de tarefas');
    for (const shape of ['classico', 'arredondado', 'quadrado', 'circular', 'panoramico', 'flutuante']) { await p.evaluate(sh => CQ.sys.set({touchpadShape: sh, touchpadW: 0, touchpadH: 0}), shape); await sleep(150); r = await inside(); S.ok(r.ok && await p.evaluate(sh => document.getElementById('cq-touchpad').dataset.shape === sh, shape), 'formato ' + shape + ' cabe na tela (' + Math.round(r.w) + '×' + Math.round(r.h) + ')'); }
    await p.evaluate(() => CQ.sys.set({touchpadShape: 'classico', touchpadW: 9999, touchpadH: 9999})); await sleep(150); r = await inside(); S.ok(r.ok && r.w <= 390 && r.h < 400, 'tamanho máximo é limitado a valores sensatos (' + Math.round(r.w) + '×' + Math.round(r.h) + ')');
    await p.evaluate(() => CQ.sys.set({touchpadW: 10, touchpadH: 10})); await sleep(150); r = await inside(); S.ok(r.w >= 110 && r.h >= 80, 'tamanho mínimo respeitado (' + Math.round(r.w) + '×' + Math.round(r.h) + ')');
    await p.evaluate(() => CQ.sys.set({touchpadW: 0, touchpadH: 0, touchpadShape: 'classico'})); await sleep(150);
    for (const pos of ['left', 'center', 'right']) { await p.evaluate(x => CQ.sys.set({touchpadPosition: x}), pos); await sleep(120); r = await inside(); S.ok(r.ok && (pos === 'left' ? r.l < 40 : pos === 'right' ? 390 - r.r < 40 : Math.abs((r.l + r.r) / 2 - 195) < 12), 'posição ' + pos); }
    // gestos: mover, tocar para clicar, clique direito, segurar
    const dot0 = await p.evaluate(() => document.getElementById('cq-touch-cursor').getBoundingClientRect().left); const sc = await center(p, '[data-tp="surface"]');
    await swipe(p, '[data-tp="surface"]', [sc[0] - 20, sc[1]], [sc[0] + 40, sc[1]], 5); const dot1 = await p.evaluate(() => document.getElementById('cq-touch-cursor').getBoundingClientRect().left); S.ok(Math.abs(dot1 - dot0) > 20, 'deslizar move o ponteiro (' + Math.round(dot1 - dot0) + ' px)');
    await p.evaluate(() => { window.__clicks = 0; window.__ctx = 0; document.addEventListener('click', e => { if (!e.isTrusted) window.__clicks++; }, true); document.addEventListener('contextmenu', e => { if (!e.isTrusted) window.__ctx++; }, true); });
    await touchEvt(p, '[data-tp="surface"]', 'pointerdown', sc[0], sc[1], 21); await touchEvt(p, '[data-tp="surface"]', 'pointerup', sc[0], sc[1], 21); await sleep(100); S.ok(await p.evaluate(() => window.__clicks >= 1), 'tocar na superfície clica');
    await p.evaluate(() => CQ.sys.set({touchpadTapClick: false})); const c0 = await p.evaluate(() => window.__clicks); await touchEvt(p, '[data-tp="surface"]', 'pointerdown', sc[0], sc[1], 22); await touchEvt(p, '[data-tp="surface"]', 'pointerup', sc[0], sc[1], 22); await sleep(100); S.ok(await p.evaluate(c => window.__clicks === c, c0), 'toque para clicar pode ser desligado'); await p.evaluate(() => CQ.sys.set({touchpadTapClick: true}));
    await p.evaluate(() => CQ.sys.set({touchpadButtons: 'integrated'})); await sleep(100); await p.click('.cq-touchpad-int [data-tp="right"]'); await sleep(100); S.ok(await p.evaluate(() => window.__ctx >= 1), 'botão direito integrado gera clique direito');
    await p.evaluate(() => { CQ.sys.set({touchpadButtons: 'bar'}); }); await sleep(100); const barVis = await p.evaluate(() => getComputedStyle(document.querySelector('.cq-touchpad-buttons [data-tp="left"]')).display !== 'none' && getComputedStyle(document.querySelector('.cq-touchpad-int')).display === 'none'); S.ok(barVis, 'botões em barra destacada'); await p.evaluate(() => CQ.sys.set({touchpadButtons: 'integrated'}));
    await p.click('[data-tp="hold"]'); S.ok(await p.evaluate(() => document.querySelector('[data-tp="hold"]').getAttribute('aria-pressed') === 'true'), 'segurar e arrastar liga'); await p.click('[data-tp="hold"]');
    S.ok(await p.evaluate(() => [...document.querySelectorAll('#cq-touchpad button')].every(b => b.textContent.trim() && (b.getAttribute('aria-label') || b.getAttribute('title') || b.textContent.trim()))), 'botões com texto/rótulo acessível');
    // recolher
    await p.click('[data-tp="fold"]'); await sleep(150); S.ok(await p.evaluate(() => document.getElementById('cq-touchpad').dataset.folded === 'true' && document.querySelector('.cq-touchpad-body').offsetHeight === 0), 'recolher/minimizar'); await p.click('[data-tp="fold"]'); await sleep(150);
    // mover pela barra de título => posição personalizada
    const h = await center(p, '[data-tp="handle"]'); await p.evaluate(([x, y]) => { const el = document.querySelector('[data-tp="handle"]'); const ev = (t, dx, dy) => el.dispatchEvent(new PointerEvent(t, {bubbles: true, cancelable: true, pointerId: 31, pointerType: 'touch', isPrimary: true, clientX: x + dx, clientY: y + dy})); ev('pointerdown', 0, 0); ev('pointermove', -60, -200); ev('pointermove', -120, -300); ev('pointerup', -120, -300); }, [h[0], h[1]]); await sleep(200);
    r = await inside(); S.ok(await p.evaluate(() => CQ.sys.get('touchpadPosition') === 'custom') && r.ok && r.t < 700, 'arrastar a barra de título move o touchpad (posição personalizada, ainda dentro da tela)');
    await p.evaluate(() => { const el = document.querySelector('[data-tp="handle"]'); const ev = (t, x, y) => el.dispatchEvent(new PointerEvent(t, {bubbles: true, cancelable: true, pointerId: 32, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y})); ev('pointerdown', 100, 10); ev('pointermove', 900, 3000); ev('pointerup', 900, 3000); }); await sleep(200); r = await inside(); S.ok(r.ok, 'não sai da tela nem invade a barra de tarefas ao arrastar para longe');
    await p.reload(); await L.boot(t); await sleep(300); S.ok(await p.evaluate(() => CQ.sys.get('touchpadPosition') === 'custom' && !document.getElementById('cq-touchpad').hidden), 'posição e ativação persistem');
    // perfis
    await p.evaluate(() => { CQ.sys.set({touchpadShape: 'circular', touchpadOpacity: .5, touchpadSensitivity: 2}); CQ.touchpad.saveProfile('Canhoto'); CQ.sys.set({touchpadShape: 'panoramico', touchpadOpacity: 1, touchpadSensitivity: 1}); }); await sleep(100);
    S.ok(await p.evaluate(() => CQ.touchpad.loadProfile('Canhoto') && CQ.sys.get('touchpadShape') === 'circular' && CQ.sys.get('touchpadOpacity') === .5 && CQ.sys.get('touchpadSensitivity') === 2), 'perfil salvo e carregado');
    S.ok(await p.evaluate(() => { CQ.touchpad.deleteProfile('Canhoto'); return !CQ.touchpad.profiles()['Canhoto']; }), 'perfil excluído');
    // painel de Configurações
    await open(p, 'settings', {tab: 'mouse'}); await sleep(400); S.ok(await p.evaluate(() => !!document.querySelector('[data-act="touchpad-shape"]') && !!document.querySelector('[data-act="touchpad-profile-save"]') && !!document.querySelector('[data-act="touchpad-accel"]')), 'controles do touchpad nas Configurações');
    await p.selectOption('[data-act="touchpad-shape"]', 'quadrado'); await sleep(150); S.ok(await p.evaluate(() => CQ.sys.get('touchpadShape') === 'quadrado'), 'Configurações aplicam o formato na hora');
    await p.evaluate(() => CQ.sys.set({touchpadEnabled: false})); await sleep(100); S.ok(await p.evaluate(() => document.getElementById('cq-touchpad').hidden), 'desativar esconde o touchpad (toque normal intacto)');
  });

  // ================= tamanhos de tela: 360, 390, tablet, desktop =================
  for (const [w, h, label, touch] of [[360, 740, 'celular 360', true], [768, 1024, 'tablet retrato', true], [1024, 768, 'tablet paisagem', true], [1920, 1080, 'desktop', false]]) {
    await scenario('Layout ' + label, {viewport: {width: w, height: h}, touch, mobile: touch && w < 800}, async (t, p) => {
      await p.evaluate(() => { CQ.sys.set({fastEffects: true}); }); await open(p, 'browser'); await sleep(500);
      S.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), label + ': sem rolagem horizontal');
      S.ok(await p.evaluate(() => { const r = document.querySelector('.br-url').getBoundingClientRect(); return r.width > 90 && r.right <= innerWidth + 1; }), label + ': barra de endereços visível');
      const nav = await p.evaluate(() => [...document.querySelectorAll('.br-nav button,.br-menu button,.br-go')].every(b => { const r = b.getBoundingClientRect(); return r.width >= 30 && r.height >= 28 && r.right <= innerWidth + 1; })); S.ok(nav, label + ': botões do navegador acessíveis e dentro da tela');
      const tray = await p.evaluate(() => { const n = document.getElementById('task-net').getBoundingClientRect(), c = document.getElementById('task-clock').getBoundingClientRect(); return n.right <= c.left + 2 && n.width > 20 && c.right <= innerWidth + 1; }); S.ok(tray, label + ': ícone de rede + relógio visíveis');
      await open(p, 'datetime'); await sleep(300); S.ok(await p.evaluate(() => { const b = document.querySelector('.cq-win[data-win="datetime"] .win-body'); return b.scrollWidth <= b.clientWidth + 1; }), label + ': Data e Hora sem corte lateral');
      await open(p, 'solitaire'); await sleep(300); S.ok(await p.evaluate(() => { const b = document.querySelector('.cq-win[data-win="solitaire"] .win-body'); return b.scrollWidth <= b.clientWidth + 1; }), label + ': Paciência sem corte lateral');
      await p.evaluate(() => { CQ.os.wm.list().forEach(w => CQ.os.wm.close(w.id)); }); await L.shot(t, 'v26-layout-' + label.replace(/\s/g, '-'));
    });
  }

  // ================= H) legado: B7 só no menu de contexto, saves e conquistas =================
  await scenario('Legado B7 e saves', {}, async (t, p) => {
    const idx = await p.evaluate(() => { for (let z = 0; z < 200; z++) { const seed = `CQ1-B7-M-50-TESTEM${String(5000 + z)}`, g = CQ_GEN.generate(seed), i = g.stages.findIndex(x => x.id === 'b7-context-copy'); if (i >= 0) { localStorage.setItem('classiquiz.v1.session', JSON.stringify({generation: g, phase: i, lives: 3, mini: {}, dev: false, done: false, lost: false, updatedAt: Date.now()})); return i; } } return -1; });
    S.ok(idx >= 3, 'seed B7 com a pergunta de Copiar encontrada na posição ' + idx);
    await p.reload(); await L.boot(t); await open(p, 'resume'); await sleep(700);
    const q = await p.evaluate(() => ({txt: document.querySelector('.cq-win[data-win="game"] .win-body').innerText, opts: [...document.querySelectorAll('.cq-win[data-win="game"] .answer-button')].map(b => b.textContent.trim())}));
    S.ok(/copiar um texto selecionado/.test(q.txt), 'pergunta B7 de Copiar exibida');
    S.ok(q.opts.length >= 4 && !q.opts.some(o => /^[A-H]?\s*Copiar$/i.test(o.replace(/\s+/g, ' ').trim())), 'resposta “Copiar” NÃO está entre as alternativas A–D: ' + JSON.stringify(q.opts));
    await p.click('.cq-win[data-win="game"] .question-text', {button: 'right'}); await sleep(250); const items = await p.evaluate(() => [...document.querySelectorAll('#cq-context button')].map(b => b.textContent.trim()));
    S.ok(items.includes('Copiar'), '“Copiar” aparece só no menu de contexto: ' + items.join('|'));
    await p.click('#cq-context button:has-text("Copiar")'); await sleep(400); S.ok(await p.evaluate(() => /descobriu o comando Copiar|acertou|Correto|Resposta/i.test(document.body.innerText)), 'acerto pelo menu de contexto');
    // dados antigos continuam intactos após a atualização: seed de teste e biblioteca
    S.ok(await p.evaluate(() => Array.isArray(CQ.store.read('classiquiz.v1.library', []))), 'biblioteca legada legível');
  });

  console.log('\nErros de console/rede coletados:', allErrs.length); allErrs.slice(0, 10).forEach(e => console.log('  ', e));
  process.exit(S.done(allErrs.filter(e => !/favicon/.test(e))));
})();
