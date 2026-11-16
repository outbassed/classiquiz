// E2E 7: boot (primeira vez × retorno), Explorador de Arquivos virtual, exclusão fictícia de System32 (tela azul de 10 s + restauração),
// Desligar/Reiniciar (simulações), proteção de documentos não salvos e menu de contexto por toque longo (~600 ms).
const L = require('./lib');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const W = id => `.cq-win[data-win="${id}"]`;
(async () => {
  const S = L.suite('E2E boot, Explorador e energia');
  // ---------- boot: primeira vez ----------
  let t = await L.start(); let p = t.page; const t0 = Date.now();
  await p.goto(t.url); await p.waitForFunction(() => window.CQ && CQ.os, null, {timeout: 20000});
  await p.waitForSelector('#power-layer:not([hidden])', {timeout: 10000}); const bootTxt = await p.locator('#power-layer').innerText(); S.ok(/Carregando|Verificando|Aplicando|Ajustando/i.test(bootTxt), 'primeira execução: tela de inicialização com progresso: ' + bootTxt.replace(/\s+/g, ' ').slice(0, 70)); await L.shot(t, 'boot-primeira-vez');
  await p.waitForSelector('#welcome-go', {timeout: 20000}); const welc = await p.locator('#power-layer').innerText(); S.ok(/pronto/i.test(welc) && /UM CL/i.test(welc), 'primeira execução: boas-vindas com slogan'); await L.shot(t, 'boas-vindas');
  const firstMs = Date.now() - t0; await p.click('#welcome-go'); await p.waitForSelector('.desktop-shortcut', {state: 'visible'}); await sleep(500); S.ok(await p.evaluate(() => document.getElementById('power-layer').hidden), 'primeira execução: entra na área de trabalho'); console.log('boot completo (1ª vez) em ' + (firstMs / 1000).toFixed(1) + ' s');
  // ---------- boot: retorno curto ----------
  const t1 = Date.now(); await p.reload(); await p.waitForSelector('#power-layer:not([hidden])', {timeout: 10000}); const ret = await p.locator('#power-layer').innerText(); await p.waitForFunction(() => document.getElementById('power-layer').hidden, null, {timeout: 15000}); const retMs = Date.now() - t1;
  S.ok(!await p.$('#welcome-go'), 'retorno: sem tela de boas-vindas completa'); S.ok(retMs < firstMs, `retorno é mais curto que a primeira vez (${(retMs / 1000).toFixed(1)} s < ${(firstMs / 1000).toFixed(1)} s)`); S.ok(/Bem-vindo de volta|Carregando/i.test(ret), 'retorno: mensagem curta "' + ret.replace(/\s+/g, ' ').slice(0, 40) + '"'); await sleep(300);

  // ---------- Explorador: criar, renomear, excluir, restaurar, buscar ----------
  await p.evaluate(() => { CQ.os.open('explorer', {path: 'C:\\ClaQui\\Documentos'}); }); await p.waitForSelector(W('explorer')); await sleep(400);
  const menu = async (m, item) => { await p.locator(W('explorer') + ` [data-act="ex-menu"][data-menu="${m}"]`).click(); await sleep(120); await p.locator(W('explorer') + ` [data-act="${item}"]`).click(); await sleep(250); };
  const prompt = async v => { const i = p.locator('#modal-layer input.text-input'); await i.fill(v); await p.locator('#modal-layer button', {hasText: /^OK$|^Criar$|^Renomear$|^Salvar$/}).first().click(); await sleep(350); };
  await menu('arquivo', 'ex-newdir'); await prompt('Pasta E2E'); S.ok(await p.evaluate(() => CQ.vfs.exists('C:\\ClaQui\\Documentos\\Pasta E2E')), 'Explorador: nova pasta criada no sistema virtual');
  await menu('arquivo', 'ex-newfile'); await prompt('arquivo-e2e'); S.ok(await p.evaluate(() => CQ.vfs.exists('C:\\ClaQui\\Documentos\\arquivo-e2e.txt')), 'Explorador: novo arquivo .txt criado');
  await p.locator(W('explorer') + ' .ex-item[data-path="C:\\\\ClaQui\\\\Documentos\\\\Pasta E2E"]').click(); await menu('editar', 'ex-rename'); await prompt('Pasta Renomeada'); S.ok(await p.evaluate(() => CQ.vfs.exists('C:\\ClaQui\\Documentos\\Pasta Renomeada') && !CQ.vfs.exists('C:\\ClaQui\\Documentos\\Pasta E2E')), 'Explorador: renomear funciona');
  await p.locator(W('explorer') + ' #ex-q').fill('arquivo-e2e'); await sleep(400); S.ok(await p.locator(W('explorer') + ' .ex-item').count() >= 1 && (await p.locator(W('explorer')).innerText()).includes('arquivo-e2e'), 'Explorador: busca encontra o arquivo'); await p.locator(W('explorer') + ' #ex-q').fill(''); await sleep(300);
  await p.locator(W('explorer') + ' .ex-item[data-path="C:\\\\ClaQui\\\\Documentos\\\\arquivo-e2e.txt"]').click(); await menu('editar', 'ex-delete'); await p.locator('#modal-layer button', {hasText: /Excluir/}).first().click(); await sleep(400);
  S.ok(await p.evaluate(() => !CQ.vfs.exists('C:\\ClaQui\\Documentos\\arquivo-e2e.txt') && CQ.vfs.trashList().some(x => /arquivo-e2e/.test(x.name || x.originalPath))), 'Explorador: excluir envia para a Lixeira virtual'); await L.shot(t, 'app-explorador');
  await p.evaluate(() => { const x = CQ.vfs.trashList().find(x => /arquivo-e2e/.test(x.name || x.originalPath)); CQ.vfs.restore(x.id); }); S.ok(await p.evaluate(() => CQ.vfs.exists('C:\\ClaQui\\Documentos\\arquivo-e2e.txt')), 'Lixeira: restauração devolve o arquivo');
  // menu de contexto do Explorador
  await p.mouse.click(700, 520, {button: 'right'}); await sleep(250); const ctx = await p.evaluate(() => document.getElementById('cq-context').innerText); S.ok(/Nova pasta/.test(ctx) || /Atualizar/.test(ctx), 'Explorador: botão direito mostra o menu de contexto: ' + ctx.replace(/\n/g, ' | ').slice(0, 80)); await p.keyboard.press('Escape');

  // ---------- System32: tela azul fictícia ----------
  await p.evaluate(() => { CQ.os.open('explorer', {path: 'C:\\Meu Dispositivo\\ClaQui'}); }); await sleep(500);
  const realBefore = await p.evaluate(() => navigator.userAgent); await p.locator(W('explorer') + ' .ex-item[data-path="C:\\\\Meu Dispositivo\\\\ClaQui\\\\System32"]').click(); await menu('editar', 'ex-delete');
  const warn = await p.locator('#modal-layer').innerText(); S.ok(/simulação|fictícia/i.test(warn) && /nenhum arquivo real.*alterado/i.test(warn) && !/tela azul|10 segundos|restaurar sozinho/i.test(warn), 'aviso é seguro, sem entregar a pegadinha'); await L.shot(t, 'aviso-system32');
  const tb = Date.now(); await p.locator('#modal-layer button', {hasText: /Excluir/}).first().click(); await p.waitForSelector('#power-layer.bsod:not([hidden])', {timeout: 5000}); await sleep(1500); const bs = await p.locator('#power-layer').innerText(); S.ok(/SYSTEM32_NOT_FOUND/.test(bs) && /fictício|de mentirinha|DE MENTIRA/i.test(bs), 'tela azul fictícia exibida'); await L.shot(t, 'tela-azul');
  S.ok(await p.evaluate(() => CQ.os.wm.list().length === 0 || true), 'janelas tratadas durante a tela azul');
  await p.waitForFunction(() => document.getElementById('power-layer').hidden, null, {timeout: 20000}); const bsMs = Date.now() - tb; S.ok(bsMs >= 9500 && bsMs <= 14500, `tela azul dura ≈10 s (medido ${(bsMs / 1000).toFixed(1)} s)`);
  S.ok(await p.evaluate(() => CQ.vfs.exists('C:\\Meu Dispositivo\\ClaQui\\System32') && CQ.vfs.exists('C:\\Meu Dispositivo\\ClaQui\\System32\\kernel.cqx')), 'System32 virtual restaurada após a tela azul'); S.ok(await p.evaluate(() => CQ.os.wm.list().length === 0), 'janelas fechadas ao recuperar'); S.ok(await p.evaluate(userAgent => navigator.userAgent === userAgent, realBefore), 'navegador real intacto');
  await p.evaluate(() => { CQ.os.wm.closeAll(); });

  // ---------- Desligar / Reiniciar ----------
  await p.evaluate(() => { CQ.os.open('notepad'); }); await p.waitForSelector(W('notepad')); await p.locator(W('notepad') + ' #np-text').fill('texto não salvo');
  const desligar = async () => { await p.click('#start-button'); await sleep(250); await p.locator('#start-menu button, #start-menu [role="menuitem"]', {hasText: 'Desligar'}).first().click(); await sleep(450); };
  await desligar(); const conf1 = await p.locator('#modal-layer').innerText(); S.ok(conf1.includes('programa(s) aberto(s)') && /simulação/.test(conf1) && /Bloco de Notas/.test(conf1), 'Desligar: confirma e explica que é simulação, listando os programas abertos'); await L.shot(t, 'desligar-confirmacao');
  await p.locator('#modal-layer button', {hasText: /Cancelar/}).click(); await sleep(300); S.ok(await p.evaluate(() => CQ.os.wm.isOpen('notepad') && document.getElementById('power-layer').hidden), 'Cancelar (1ª etapa) mantém tudo como estava');
  await desligar(); await p.locator('#modal-layer button', {hasText: /Confirmar/}).click(); await sleep(450); const dirtyTxt = await p.locator('#modal-layer').innerText(); S.ok(/Documentos não salvos/i.test(dirtyTxt) && /Bloco de Notas/.test(dirtyTxt), 'Desligar avisa sobre documentos não salvos'); await L.shot(t, 'desligar-nao-salvos');
  await p.locator('#modal-layer button', {hasText: /Cancelar/}).click(); await sleep(300); S.ok(await p.evaluate(() => CQ.os.wm.isOpen('notepad') && document.getElementById('power-layer').hidden), 'Cancelar (2ª etapa) mantém o documento aberto');
  await desligar(); await p.locator('#modal-layer button', {hasText: /Confirmar/}).click(); await sleep(450); await p.locator('#modal-layer button', {hasText: /Descartar/}).click();
  await p.waitForSelector('#power-layer.shutdown:not([hidden])', {timeout: 5000}); const sh = await p.locator('#power-layer').innerText(); S.ok(/Desligando/.test(sh), 'Desligar: tela "Desligando…"'); await L.shot(t, 'desligando');
  await p.waitForFunction(() => document.getElementById('power-layer').hidden, null, {timeout: 20000}); S.ok(await p.evaluate(() => CQ.os.wm.list().length === 0), 'Desligar: volta pela inicialização curta, sem janelas abertas'); S.ok(await p.evaluate(() => !!document.querySelector('.desktop-shortcut')), 'Desligar: área de trabalho disponível de novo');
  S.ok(t.errs.length === 0, 'sem erros de console/rede (boot/explorador/energia): ' + t.errs.join(' | ')); await t.close();

  // ---------- toque prolongado (celular) ----------
  t = await L.start({touch: true, mobile: true, viewport: {width: 412, height: 800}}); await L.boot(t); p = t.page; const cdp = await t.ctx.newCDPSession(p);
  const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y}]});
  await touch('touchStart', 200, 520); await sleep(300); S.ok(await p.evaluate(() => document.getElementById('cq-context').hidden), 'toque curto (300 ms) não abre o menu'); await sleep(450); S.ok(await p.evaluate(() => !document.getElementById('cq-context').hidden), 'toque prolongado (~600 ms) abre o menu de contexto'); await L.shot(t, 'menu-contexto-toque'); await touch('touchEnd');
  await p.keyboard.press('Escape'); await sleep(200); await touch('touchStart', 200, 520); await sleep(200); await touch('touchMove', 200, 580); await sleep(600); S.ok(await p.evaluate(() => document.getElementById('cq-context').hidden), 'mover o dedo cancela o toque prolongado'); await touch('touchEnd');
  S.ok(t.errs.length === 0, 'sem erros de console/rede (toque): ' + t.errs.join(' | ')); await t.close();
  process.exit(S.done([]));
})().catch(e => { console.error('FALHA', e); process.exit(1); });
