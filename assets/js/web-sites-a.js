/* ClaQui Browser — sites fictícios (parte A): BuscaJá!, ClaquiMail, BatePapo, Jogolândia e Geocidades. Licença: MIT.
   Todo conteúdo é original e vive dentro do jogo. Texto vindo do usuário é sempre escapado (nunca vira HTML). */
(() => {
'use strict';
const CQ = window.CQ, W = CQ.web, E = W.E, L = W.link, reg = W.register;
const fav = (ch, bg, fg = '#fff') => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" shape-rendering="crispEdges"><rect width="16" height="16" fill="${bg}"/><rect x="1" y="1" width="14" height="14" fill="none" stroke="#0004"/><text x="8" y="12.5" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="${fg}">${ch}</text></svg>`)}`;
W.fav = fav;
const now = () => CQ.clock ? CQ.clock.now() : Date.now();
const today = () => CQ.clock ? CQ.clock.fmtDate() : new Date().toLocaleDateString('pt-BR');
const tok = (t, c) => `<span style="color:${c}">${t}</span>`;
const siteLinkRow = s => `<li class="bj-result"><b>${L(s.host, E(s.title))}</b><br><span class="bj-url">${E(s.host)}</span> — ${E(s.desc)}<br><small>Categoria: ${E(s.cat)}</small></li>`;

// =============== BuscaJá! ===============
const FEATURED = ['www.jogolandia.cqo', 'www.claquimail.cqo'];    // exatamente dois destaques na página inicial
const bjLogo = () => `<div class="bj-logo" aria-label="BuscaJá!"><span style="color:#2a56c6">B</span><span style="color:#d93a2b">u</span><span style="color:#f0a823">s</span><span style="color:#2a56c6">c</span><span style="color:#25a244">a</span><span style="color:#d93a2b">J</span><span style="color:#f0a823">á</span><span style="color:#2a56c6">!</span></div>`;
const bjForm = (q = '', small = false) => `<form class="bj-form ${small ? 'small' : ''}" data-cqo-form="www.buscaja.cqo/busca" role="search"><input type="search" name="q" value="${E(q)}" maxlength="120" aria-label="Pesquisar no BuscaJá!" placeholder="Pesquise qualquer assunto…" autocomplete="off" spellcheck="false"><button type="submit">Buscar</button></form>`;
reg({id: 'buscaja', host: 'www.buscaja.cqo', name: 'BuscaJá!', title: 'BuscaJá! — O buscador da nova era', cat: 'Busca', fav: fav('B', '#2a56c6'),
  desc: 'O buscador oficial da web do ClaQui OS: encontre sites, jogos, receitas de pipoca e muito mais.', keywords: ['busca', 'buscador', 'pesquisa', 'pesquisar', 'procurar', 'diretorio', 'internet', 'catalogo', 'sites'],
  pages: {
    '/': {title: 'BuscaJá! — Página inicial', html: ctx => `<div class="bj-home">${bjLogo()}<p class="bj-slogan">Achou? Foi no BuscaJá!</p>${bjForm()}
      <p class="bj-links">${L('www.buscaja.cqo/internet', 'Diretório de sites')} · ${L('www.buscaja.cqo/ajuda', 'Ajuda')} · ${L('www.buscaja.cqo/sobre', 'Sobre o BuscaJá!')}</p>
      <h2 class="bj-h">Sites em destaque</h2><ol class="bj-list">${FEATURED.map(h => W.byHost.get(h)).filter(Boolean).map(siteLinkRow).join('')}</ol>
      <p class="bj-more">${L('www.buscaja.cqo/internet', 'Mostrar mais', 'bj-btn')}</p>
      <p class="bj-foot">© 2003 BuscaJá! Tecnologia Ltda. (fictícia) • Melhor visualizado no ClaQui Browser em 800×600 • <span class="bj-counter">Visitantes hoje: 000${1000 + (Math.abs(String(ctx.url).length * 37) % 900)}</span></p></div>`},
    '/internet': {title: 'BuscaJá! — Todos os sites', html: ctx => {
      const cat = ctx.params.get('cat') || '', f = W.norm(ctx.params.get('f') || ''); let list = W.publicSites().slice().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      if (cat) list = list.filter(s => s.cat === cat); if (f) list = list.filter(s => W.norm(`${s.name} ${s.desc} ${s.keywords.join(' ')} ${s.cat}`).includes(f));
      return `<div class="bj-dir">${bjLogo()}<h1>Diretório da Internet</h1><p>Todos os sites públicos da web do ClaQui OS (${W.publicSites().length}). Alguns endereços não aparecem aqui; quem procura, acha.</p>
      <form class="bj-form small" data-cqo-form="www.buscaja.cqo/internet" role="search"><input type="search" name="f" value="${E(f)}" maxlength="60" aria-label="Filtrar sites" placeholder="Filtrar o diretório…"><button type="submit">Filtrar</button></form>
      <p class="bj-cats">Categorias: ${L('www.buscaja.cqo/internet', 'Todas', cat ? '' : 'on')} ${W.categories().map(c => L('www.buscaja.cqo/internet?cat=' + encodeURIComponent(c), E(c), c === cat ? 'on' : '')).join(' ')}</p>
      <ol class="bj-list">${list.map(siteLinkRow).join('') || '<li>Nenhum site neste filtro.</li>'}</ol><p>${L('www.buscaja.cqo', '« Voltar ao BuscaJá!')}</p></div>`;}},
    '/busca': {title: 'BuscaJá! — Resultados', index: false, html: ctx => {
      const q = ctx.params.get('q') || '', r = W.search(q);
      return `<div class="bj-dir">${bjLogo()}${bjForm(q, true)}${!q.trim() ? '<p>Digite algo para pesquisar.</p>' : r.results.length
        ? `<p class="bj-count">${r.results.length} resultado(s) para <b>${E(q)}</b></p><ol class="bj-list">${r.results.map(x => `<li class="bj-result"><b>${L(x.url, E(x.title))}</b><br><span class="bj-url">${E(x.url)}</span> — ${E(x.snippet)}</li>`).join('')}</ol>`
        : `<p class="bj-none"><b>Nenhum resultado encontrado</b> para “${E(q)}”.</p><ul><li>Confira se todas as palavras estão escritas corretamente.</li><li>Tente palavras-chave diferentes ou mais gerais.</li><li>Navegue pelo ${L('www.buscaja.cqo/internet', 'Diretório de sites')}.</li></ul>`}</div>`;}},
    '/ajuda': {title: 'BuscaJá! — Ajuda', html: () => `<div class="bj-dir">${bjLogo()}<h1>Ajuda</h1><p><b>Pesquisar:</b> digite o assunto no campo de busca e clique em <i>Buscar</i>. Qualquer palavra funciona.</p><p><b>Abrir um endereço:</b> digite-o na barra de endereços do navegador, por exemplo <code>www.jogolandia.cqo</code>. Endereços que não existem mostram a página de erro 404; já a pesquisa nunca dá erro, apenas diz que não achou nada.</p><p><b>Sites escondidos:</b> alguns endereços não estão no diretório. Dizem que o ${L('www.batepapo.cqo', 'BatePapo')} sabe de coisas.</p><p>${L('www.buscaja.cqo', '« Voltar')}</p></div>`},
    '/sobre': {title: 'BuscaJá! — Sobre', html: () => `<div class="bj-dir">${bjLogo()}<h1>Sobre nós</h1><p>O BuscaJá! nasceu num porão de Milharópolis em 1998 e hoje indexa toda a web do ClaQui OS (que é bem pequena, mas muito bem-organizada). Nosso robô, o <i>BuscaBot 2.0</i>, visita cada site duas vezes por ano ou quando lembra.</p><p>${L('www.buscaja.cqo', '« Voltar')}</p></div>`}
  }});

// =============== ClaquiMail ===============
const MAIL_SEED = [
  {id: 1, from: 'Claquim <claquim@claquimail.cqo>', subj: 'Bem-vindo(a) ao ClaquiMail!', body: 'Olá!\n\nSua caixa de entrada gratuita de 2 MB está pronta. Aqui você recebe cartas, correntes e promoções que ninguém pediu.\n\nAbraços,\nClaquim, assistente do ClaQui OS'},
  {id: 2, from: 'Milhito <milhito@showdomilhozao.cqo>', subj: 'Você foi selecionado(a)!!!', body: 'PARABÉNS! Você é o visitante número 1.000.000 do Show do Milhozão!\n\nPara retirar seu prêmio (um lindo milho de plástico) basta responder esta mensagem. Não é pegadinha. (É um pouquinho pegadinha.)'},
  {id: 3, from: 'BuscaJá! <noreply@buscaja.cqo>', subj: 'Sua conta foi atualizada', body: 'Atualizamos nossos termos de uso. Resumindo: a gente continua achando coisas para você. Visite o diretório em www.buscaja.cqo/internet.'},
  {id: 4, from: 'Tia Zélia <zelia@claquimail.cqo>', subj: 'FWD: FWD: FWD: Corrente do Milho da Sorte', body: 'Repasse esta mensagem para 10 pessoas em 5 minutos e o milho da sorte aparecerá no seu quintal.\n\nQuem quebrou a corrente em 2001 ficou sem pipoca por uma semana. Não arrisque!!!'},
  {id: 5, from: 'Suporte Técnico <suporte@claquimail.cqo>', subj: 'Dica: reinicie o computador', body: 'Para 98% dos problemas, reiniciar resolve.\nPara os outros 2%, reiniciar duas vezes.\n\nSe o problema for na pasta System32, nós não podemos ajudar. Ela é sagrada.'},
  {id: 6, from: 'Sr. Desconhecido <???@segredo.cqo>', subj: '(sem assunto)', body: 'Existe um endereço que não aparece em lugar nenhum.\n\nVocê já olhou o endereço www.segredo.cqo ?\n\nApague esta mensagem depois de ler.'}];
const mailSt = () => { const st = W.siteState('claquimail', {msgs: null, sent: [], next: 100}); if (!st.msgs) { st.msgs = MAIL_SEED.map(m => ({...m, date: today(), read: false, deleted: false})); W.saveSiteState('claquimail', st); } return st; };
const mailShell = (inner, box) => `<div class="cm"><div class="cm-top"><b class="cm-logo">Claqui<span>Mail</span></b><span class="cm-user">claquim.fan@claquimail.cqo</span></div>
  <div class="cm-body"><nav class="cm-side"><p>${L('www.claquimail.cqo/escrever', 'Escrever', 'cm-write')}</p><ul><li>${L('www.claquimail.cqo', 'Caixa de entrada' + (mailSt().msgs.filter(m => !m.read && !m.deleted).length ? ` (${mailSt().msgs.filter(m => !m.read && !m.deleted).length})` : ''), box === 'in' ? 'on' : '')}</li><li>${L('www.claquimail.cqo/enviados', 'Enviados', box === 'sent' ? 'on' : '')}</li><li>${L('www.claquimail.cqo/lixeira', 'Lixeira', box === 'trash' ? 'on' : '')}</li></ul><p class="cm-ad">Anúncio: Compre 1 milho, leve 2 (o 2º é imaginário).</p></nav><section class="cm-main">${inner}</section></div></div>`;
const mailList = (msgs, box) => `<table class="cm-table"><thead><tr><th>De</th><th>Assunto</th><th>Data</th></tr></thead><tbody>${msgs.map(m => `<tr class="${m.read ? '' : 'unread'}"><td>${E(m.from.replace(/<.*>/, ''))}</td><td>${L('www.claquimail.cqo/msg/' + m.id, E(m.subj))}</td><td>${E(m.date)}</td></tr>`).join('') || '<tr><td colspan="3">Nenhuma mensagem.</td></tr>'}</tbody></table>`;
reg({id: 'claquimail', host: 'www.claquimail.cqo', name: 'ClaquiMail', title: 'ClaquiMail — Seu correio na internet', cat: 'Comunicação', fav: fav('M', '#1f7fc4'),
  desc: 'Correio eletrônico gratuito com 2 MB de espaço e mensagens que talvez você queira ler.', keywords: ['email', 'e-mail', 'correio', 'mensagem', 'carta', 'caixa de entrada', 'claqui mail'],
  pages: {
    '/': {title: 'ClaquiMail — Caixa de entrada', html: () => mailShell(`<h2>Caixa de entrada</h2>${mailList(mailSt().msgs.filter(m => !m.deleted), 'in')}`, 'in')},
    '/enviados': {title: 'ClaquiMail — Enviados', html: () => mailShell(`<h2>Enviados</h2>${mailList(mailSt().sent, 'sent')}`, 'sent'), index: false},
    '/lixeira': {title: 'ClaquiMail — Lixeira', html: () => mailShell(`<h2>Lixeira</h2>${mailList(mailSt().msgs.filter(m => m.deleted), 'trash')}`, 'trash'), index: false},
    '/escrever': {title: 'ClaquiMail — Escrever', index: false, html: () => mailShell(`<h2>Nova mensagem</h2><form class="cm-form" data-web-form="send"><label>Para <input name="to" maxlength="80" autocomplete="off" required></label><label>Assunto <input name="subj" maxlength="80" autocomplete="off"></label><label>Mensagem <textarea name="body" rows="7" maxlength="1000"></textarea></label><button type="submit" class="cm-write">Enviar</button><p class="muted">As mensagens ficam só neste computador fictício: ninguém recebe nada.</p></form>`, 'in')}
  },
  route(path) {
    const m = path.match(/^\/msg\/(\d+)$/); if (!m) return null; const id = +m[1], st = mailSt(), msg = st.msgs.find(x => x.id === id) || st.sent.find(x => x.id === id);
    if (!msg) return null;
    return {title: 'ClaquiMail — ' + msg.subj, index: false, html: () => { if (msg.read === false) { msg.read = true; W.saveSiteState('claquimail', st); } return mailShell(`<h2>${E(msg.subj)}</h2><p class="cm-meta"><b>De:</b> ${E(msg.from)}<br><b>Data:</b> ${E(msg.date)}</p><pre class="cm-msg">${E(msg.body)}</pre><p><button type="button" data-web-act="del" data-id="${id}">Excluir</button> ${L('www.claquimail.cqo', '« Voltar')}</p>`, 'in'); }};
  },
  onAction(act, d) {
    const st = mailSt();
    if (act === 'del') { const m = st.msgs.find(x => x.id === +d.id); if (m) { m.deleted = true; W.saveSiteState('claquimail', st); } return {navigate: 'www.claquimail.cqo', toast: 'Mensagem movida para a lixeira.'}; }
    if (act === 'send') { const id = st.next++; st.sent.unshift({id, from: 'Para: ' + String(d.to || '').slice(0, 80), subj: String(d.subj || '(sem assunto)').slice(0, 80), body: String(d.body || '').slice(0, 1000), date: today(), read: true}); W.saveSiteState('claquimail', st); return {navigate: 'www.claquimail.cqo/enviados', toast: 'Mensagem enviada (para lugar nenhum).'}; }
    return null;
  }});

// =============== BatePapo (chat com personagens que respondem) ===============
const ROOMS = {geral: ['Sala Geral', ['Alguém aí? Tô na 56k hoje.', 'Boa noite, galera do milharal!', 'alguém sabe o endereço do Show do Milhozão?', 'tenta o Jogolândia, tem ranking de Desvio CQ', 'vcs viram que a pasta System32 voltou do nada?', 'não mexe na System32 😬', 'tem gente que jura que existe um site secreto…', 'kkkk lá vem a lenda do site secreto de novo'], ['milhozeiro', 'pixel_girl', 'tio_ze', 'BotCQ']],
  jogos: ['Sala Jogos', ['Alguém joga Campo Minado no difícil?', 'bati 35 de nível no Desvio CQ!', 'mentira, Desvio CQ não acaba nunca', 'o Jogo da Velha trapaceia, juro', 'é o modo Ladrão, ele rouba mesmo', 'quem quer uma partida de Pong?', 'só se for sem lag'], ['nerd_2003', 'cobrinha_rei', 'dona_pipoca', 'ladrao_ttt']],
  musica: ['Sala Música', ['Ouvindo MP3 de 128 kbps, qualidade de estúdio.', 'quem tem o disco do Milharal Boys?', 'só no Baixa Tudo, mas cuidado com os anúncios', 'o Reprodutor do ClaQui OS toca tudo', 'tudo que é beep, né', 'beep também é música'], ['dj_milho', 'radinho', 'bluezinha', 'BotCQ']]};
const CHAT_REPLIES = [[/\b(oi|ola|olá|eae|salve)\b/i, 'oi! de onde você fala? (de dentro do navegador, claro)'], [/secret|segred/i, 'psiu… experimenta digitar www.segredo.cqo na barra de endereços. Eu não disse nada.'], [/internet|rede|conex/i, 'quando a rede cai, dizem que o rostinho triste esconde uma surpresa. Só dizem.'], [/milho/i, 'milho é vida 🌽'], [/jogo|jogar/i, 'passa no Jogolândia, tem de tudo!'], [/\?$/, 'boa pergunta! pergunta pro BuscaJá!']];
const chatMount = (root, ctx) => {
  const slug = ctx.path.split('/')[2], room = ROOMS[slug]; const log = root.querySelector('.bp-log'), form = root.querySelector('form'), inp = form.querySelector('input'); let i = 0, n = 0; const timers = [];
  const st = W.siteState('batepapo', {nick: 'visitante' + (100 + Math.floor(Math.random() * 899))});
  const add = (who, txt, me) => { const row = document.createElement('div'); row.className = 'bp-line' + (me ? ' me' : ''); const b = document.createElement('b'); b.textContent = who + ': '; const s = document.createElement('span'); s.textContent = txt; row.append(b, s); log.append(row); while (log.children.length > 60) log.firstChild.remove(); log.scrollTop = log.scrollHeight; };
  const fast = CQ.net ? CQ.net.fast() : false;
  add('Sistema', `Você entrou na ${room[0]} como ${st.nick}.`); const bots = room[2];
  const tick = () => { add(bots[i % bots.length], room[1][i % room[1].length]); i++; timers.push(setTimeout(tick, (fast ? 2600 : 3800) + Math.random() * 2600)); };
  timers.push(setTimeout(tick, 600));
  form.addEventListener('submit', e => { e.preventDefault(); const t = inp.value.trim().slice(0, 200); if (!t) return; add(st.nick, t, true); inp.value = ''; n++; const r = CHAT_REPLIES.find(x => x[0].test(t)); timers.push(setTimeout(() => add(bots[(n + 1) % bots.length], r ? r[1] : ['hm.', 'legal!', 'concordo.', 'e aí, tudo bem?', 'kkk'][n % 5]), 700 + Math.random() * 900)); });
  return () => timers.forEach(clearTimeout);
};
const roomPage = slug => ({title: 'BatePapo — ' + ROOMS[slug][0], index: false, mount: chatMount, html: () => `<div class="bp"><div class="bp-top"><b>Bate<span>Papo</span></b> ${L('www.batepapo.cqo', '« Salas')}</div><h2>${E(ROOMS[slug][0])}</h2><div class="bp-log" role="log" aria-live="polite"></div><form class="bp-form"><input maxlength="200" aria-label="Sua mensagem" placeholder="Digite sua mensagem e pressione Enter" autocomplete="off"><button type="submit">Enviar</button></form><p class="muted">Os outros usuários são robôs do BatePapo. Não digite senhas verdadeiras em lugar nenhum, nem aqui. 🙂</p></div>`});
reg({id: 'batepapo', host: 'www.batepapo.cqo', name: 'BatePapo', title: 'BatePapo — Salas de conversa ao vivo', cat: 'Comunicação', fav: fav('B', '#7b3fa0'),
  desc: 'Salas de bate-papo com milhares de pessoas (quase todas robôs). Entre e converse sobre jogos, música e milho.', keywords: ['chat', 'bate-papo', 'conversa', 'sala', 'amigos', 'mensagens', 'ao vivo'],
  pages: {'/': {title: 'BatePapo — Salas', html: () => `<div class="bp"><div class="bp-top"><b>Bate<span>Papo</span></b> <small>Salas de conversa ao vivo</small></div><h1>Escolha uma sala</h1><ul class="bp-rooms">${Object.entries(ROOMS).map(([k, v]) => `<li>${L('www.batepapo.cqo/sala/' + k, E(v[0]))} <small>(${v[2].length + 3} pessoas online)</small></li>`).join('')}</ul><p class="muted">Regras: seja gentil, não repasse correntes e nunca revele o endereço do site secreto. Mas se alguém perguntar, a gente finge que não sabe.</p></div>`},
    '/sala/geral': roomPage('geral'), '/sala/jogos': roomPage('jogos'), '/sala/musica': roomPage('musica')}});

// =============== Jogolândia ===============
const rec = () => { const r = CQ.store ? CQ.store.read('classiquiz.v1.records', {}) : {}, rn = CQ.store ? CQ.store.read('classiquiz.v1.runner', {}) : {}, dv = CQ.store ? CQ.store.read('classiquiz.v1.desvio', {}) : {}; return {trail: r.trails && r.trails.best || 0, runner: rn.best || 0, desvio: dv.bestLevel || dv.level || dv.best || 0}; };
const GAMES = [['snake', 'Cobrinha', 'Coma, cresça e não encoste em você mesmo.'], ['mines', 'Campo Minado', 'Descubra onde estão as minas. Segurar = bandeira.'], ['ttt', 'Jogo da Velha', 'Cuidado com o modo Ladrão.'], ['pong', 'Pong', 'Arraste a raquete. Primeiro a 7 vence.'], ['desvio', 'Desvio CQ', 'Desvie dos obstáculos. Os níveis não acabam.'], ['solitaire', 'Paciência', 'O clássico das cartas, agora com toque.']];
reg({id: 'jogolandia', host: 'www.jogolandia.cqo', name: 'Jogolândia', title: 'Jogolândia — O maior portal de minijogos', cat: 'Jogos', fav: fav('J', '#25a244'),
  desc: 'Portal de minijogos, notícias do mundo dos games e rankings. Jogue direto dos links!', keywords: ['jogos', 'minijogos', 'games', 'jogar', 'cobrinha', 'campo minado', 'pong', 'desvio', 'paciencia', 'diversao', 'ranking', 'noticias'],
  pages: {
    '/': {title: 'Jogolândia — Início', html: () => `<div class="jl"><div class="jl-head"><h1>JOGOLÂNDIA</h1><marquee-like class="jl-marq">★ NOVO! Paciência agora no ClaQui OS ★ Dica: quando a rede cai, o rostinho triste pode ser clicado ★ Ranking atualizado ★</marquee-like></div>
      <p class="jl-nav">${L('www.jogolandia.cqo', 'Início')} | ${L('www.jogolandia.cqo/jogos', 'Jogar agora')} | ${L('www.jogolandia.cqo/ranking', 'Ranking')} | ${L('www.jogolandia.cqo/noticias', 'Notícias')} | ${L('www.buscaja.cqo', 'BuscaJá!')}</p>
      <div class="jl-grid"><section><h2>Jogos em destaque</h2>${GAMES.slice(0, 3).map(g => `<p><button type="button" class="jl-play" data-open-app="${g[0]}">▶ ${g[1]}</button> ${E(g[2])}</p>`).join('')}<p>${L('www.jogolandia.cqo/jogos', 'Ver todos os jogos »')}</p></section>
      <section><h2>Últimas notícias</h2><ul><li>${L('www.jogolandia.cqo/noticias', 'Cobrinha vira patrimônio do Milharal')}</li><li>${L('www.jogolandia.cqo/noticias', 'Pesquisa: 9 em cada 10 jogadores já perderam para o Ladrão')}</li><li>${L('www.jogolandia.cqo/noticias', 'Desvio CQ ganha níveis infinitos')}</li></ul></section></div>
      <p class="jl-counter">Você é o visitante nº <b>0${(1 + Math.abs(String(now()).length * 71)) % 90000 + 10000}</b> <span class="jl-construction">🚧 página em construção 🚧</span></p></div>`},
    '/jogos': {title: 'Jogolândia — Jogar agora', html: () => `<div class="jl"><div class="jl-head"><h1>JOGAR AGORA</h1></div><p>Clique em um botão e o jogo abre numa janela do ClaQui OS.</p><div class="jl-cards">${GAMES.map(g => `<div class="jl-card"><b>${g[1]}</b><p>${E(g[2])}</p><button type="button" class="jl-play" data-open-app="${g[0]}">▶ Jogar</button></div>`).join('')}</div><p>${L('www.jogolandia.cqo', '« Voltar ao início')}</p></div>`},
    '/ranking': {title: 'Jogolândia — Ranking', html: () => { const r = rec(); return `<div class="jl"><div class="jl-head"><h1>RANKING</h1></div><p>Seus recordes neste computador (os outros jogadores são imaginários):</p><table class="jl-table"><tr><th>Jogo</th><th>Você</th><th>Líder imaginário</th></tr><tr><td>Offline Runner (pontos)</td><td>${r.runner || '—'}</td><td>31.337 (Zé do Dinossauro)</td></tr><tr><td>Desvio CQ (nível)</td><td>${r.desvio || '—'}</td><td>42 (Pixel Girl)</td></tr><tr><td>Trilha Aleatória (melhor questão)</td><td>${r.trail || '—'}</td><td>180 (Tio Zé)</td></tr></table><p>${L('www.jogolandia.cqo', '« Voltar')}</p></div>`; }},
    '/noticias': {title: 'Jogolândia — Notícias', html: () => `<div class="jl"><div class="jl-head"><h1>NOTÍCIAS</h1></div><article><h2>Cobrinha vira patrimônio do Milharal</h2><p>A prefeitura declarou a Cobrinha “patrimônio cultural comestível”. A cobrinha não quis comentar.</p></article><article><h2>Pesquisa: 9 em cada 10 jogadores já perderam para o Ladrão</h2><p>O décimo diz que também perdeu, mas estava distraído.</p></article><article><h2>Desvio CQ ganha níveis infinitos</h2><p>Os desenvolvedores prometem que nunca vai acabar. Os jogadores prometem que vão tentar.</p></article><p>${L('www.jogolandia.cqo', '« Voltar')}</p></div>`}
  }});

// =============== Geocidades (homepages pessoais) ===============
const GEO = {claquim: ['Claquim', 'Oi! Eu sou o Claquim, assistente do ClaQui OS. Esta é a minha página, feita em 1998 no Bloco de Notas.', ['Meus links favoritos: ' + L('www.buscaja.cqo', 'BuscaJá!') + ' e ' + L('www.claquipedia.cqo', 'ClaquiPédia')]],
  milhito: ['Fã-clube do Milhito', 'Aqui é o fã-clube oficial (e único) do apresentador Milhito. Última atualização: quando alguém lembrou.', ['Frase do dia: “Milhão é só um milho muito grande.”']],
  zeca: ['Página do Zeca', 'Bem-vindo à minha página! Gosto de pipoca, de computadores e de dinossauros pixelados.', ['Dica: já tentou ficar sem internet?', L('www.offline.cqo', 'Meu amigo explicou aqui')]]};
const geoPage = id => { const g = GEO[id]; return {title: 'Geocidades — ' + g[0], html: ctx => { const st = W.siteState('geocidades', {n: {}, book: {}}); if (!(ctx && ctx.index)) { st.n[id] = (st.n[id] || 1000) + 1; W.saveSiteState('geocidades', st); } st.n[id] ||= 1000; const book = st.book[id] || [];
  return `<div class="gc"><h1 class="gc-h"><span class="gc-blink">★</span> ${E(g[0])} <span class="gc-blink">★</span></h1><p class="gc-uc">🚧 SITE EM CONSTRUÇÃO 🚧</p><p>${E(g[1])}</p>${g[2].map(x => `<p>${x}</p>`).join('')}<hr><p>Você é o visitante número <b class="gc-count">${st.n[id]}</b></p>
  <h3>Livro de visitas</h3><ul class="gc-book">${book.map(b => `<li><b>${E(b.n)}</b>: ${E(b.m)}</li>`).join('') || '<li>Seja o primeiro a assinar!</li>'}</ul>
  <form class="gc-form" data-web-form="sign" data-user="${id}"><input name="n" maxlength="24" placeholder="Seu nome" required><input name="m" maxlength="100" placeholder="Sua mensagem" required><button type="submit">Assinar</button></form>
  <p>${L('www.geocidades.cqo', '« Todas as páginas')} · <small>Anel da Web: ${L('www.geocidades.cqo/~claquim', 'anterior')} | ${L('www.geocidades.cqo/~milhito', 'próximo')}</small></p></div>`; }}; };
reg({id: 'geocidades', host: 'www.geocidades.cqo', name: 'Geocidades', title: 'Geocidades — Crie sua página grátis!', cat: 'Comunidade', fav: fav('G', '#e0a020', '#222'),
  desc: 'Milhares de páginas pessoais feitas com carinho (e sem CSS). Contadores, livros de visitas e GIFs piscantes.', keywords: ['homepage', 'pagina pessoal', 'livro de visitas', 'contador', 'fa clube', 'anel da web', 'claquim', 'milhito', 'zeca'],
  pages: {'/': {title: 'Geocidades — Início', html: () => `<div class="gc"><h1 class="gc-h"><span class="gc-blink">★</span> GEOCIDADES <span class="gc-blink">★</span></h1><p class="gc-uc">Seu cantinho na web desde 1998</p><p>Escolha uma página para visitar:</p><ul>${Object.entries(GEO).map(([k, v]) => `<li>${L('www.geocidades.cqo/~' + k, E(v[0]))}</li>`).join('')}</ul><p>Quer ter a sua? Basta um Bloco de Notas e muita paciência.</p></div>`},
    '/~claquim': geoPage('claquim'), '/~milhito': geoPage('milhito'), '/~zeca': geoPage('zeca')},
  onAction(act, d) { if (act !== 'sign') return null; const st = W.siteState('geocidades', {n: {}, book: {}}); (st.book[d.user] ||= []).push({n: String(d.n || 'anônimo').slice(0, 24), m: String(d.m || '').slice(0, 100)}); st.book[d.user] = st.book[d.user].slice(-20); W.saveSiteState('geocidades', st); return {refresh: true, toast: 'Obrigado por assinar o livro de visitas!'}; }});
})();
