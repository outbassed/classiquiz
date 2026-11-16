/* ClaQui OS — assistente "Primeiros passos" (estilo instalação do Windows) e novidades da release. Licença: MIT. */
(() => {
'use strict';
const CQ = window.CQ, E = CQ.E, OS = CQ.os, WM = OS.wm, A = CQ.apps;
const wasFirstRun = !CQ.sys.get('bootCompleted');       // lido antes do boot: só a primeira inicialização abre o tutorial sozinho
const STEPS = [
  {icon: 'assets/img/claquim.svg', title: 'Bem-vindo ao seu novo sistema operacional', html: () => `<p>Parabéns! Você acaba de adquirir (de mentira) o <b data-osname>${E(CQ.clock.osName())}</b>, o sistema operacional que nunca existiu e que, mesmo assim, já vem com <i>três</i> tutoriais.</p><p>Este assistente leva menos de dois minutos. Você pode usar <b>Voltar</b>, <b>Avançar</b> ou <b>Pular</b> a qualquer momento.</p><p class="muted">Tudo aqui é simulação: nenhum arquivo ou configuração real do seu aparelho é alterado.</p>`},
  {icon: 'assets/classiquiz-icon.svg', title: 'A área de trabalho e o menu Iniciar', html: () => `<p>Os ícones no centro da tela abrem os programas principais. O botão <b>Start</b>, no canto inferior esquerdo, lista <b>todos</b> os aplicativos por categoria (a lista rola). Na barra de tarefas aparecem as janelas abertas.</p><p>Ao lado do relógio ficam o ícone de <b>rede</b> e a versão do sistema.</p>`},
  {icon: 'assets/icons/explorador.svg', title: 'Janelas: abrir, fechar, maximizar', html: () => `<p>Cada programa abre numa janela. Os três botões da barra azul <b>minimizam</b>, <b>maximizam/restauram</b> e <b>fecham</b> a janela. Dê dois toques na barra azul para maximizar ou restaurar, e arraste-a (quando não estiver maximizada) para mover.</p><p>No celular, as janelas ocupam a tela inteira para você caber tudo com conforto.</p>`},
  {icon: 'assets/icons/classiquiz.svg', title: 'Trilhas e minijogos', html: () => `<p><b>Jogar</b> começa uma Trilha de perguntas (ClassiQuiz 1, 2, 3 ou Aleatória). <b>Continuar</b> retoma de onde você parou e <b>Minhas Trilhas</b> guarda suas seeds para repetir qualquer trilha.</p><p>Em <b>Mais opções</b> e no Start há minijogos: Campo Minado, Jogo da Velha, Cobrinha, Desvio CQ, Pong e Paciência. Todos funcionam só com toque, arrastando ou deslizando.</p><div class="actions"><button type="button" class="chrome-button" data-act="open-app" data-app="mais">Abrir Mais opções</button></div>`},
  {icon: 'assets/icons/conquistas.svg', title: 'Botão direito e respostas escondidas', html: () => `<p>Algumas perguntas pedem que você <b>use o sistema</b>. Certas respostas <u>não estão entre as alternativas</u>: elas aparecem apenas no <b>menu de contexto</b> (botão direito do mouse, ou <b>toque longo</b> no celular).</p><p>Se uma pergunta parecer impossível, experimente clicar com o botão direito na própria janela, num campo de texto ou na área de trabalho.</p>`},
  {icon: 'assets/icons/navegador.svg', title: 'ClaQui Browser e a rede fictícia', html: () => `<p>O <b>ClaQui Browser</b> navega pela web fictícia do sistema: sites <code>.cqo</code> com cara de 2003. Comece pelo <b>BuscaJá!</b> (<code>www.buscaja.cqo</code>). Endereços que não existem mostram o erro 404; já pesquisar nunca dá erro.</p><p>O ícone de rede, ao lado do relógio, liga e desliga a <b>rede virtual</b>. Sem rede, o navegador mostra a tela cinza de conexão perdida… e dizem que o rostinho triste esconde uma surpresa.</p><div class="actions"><button type="button" class="chrome-button" data-act="open-app" data-app="browser">Abrir o ClaQui Browser</button></div>`},
  {icon: 'assets/icons/data-hora.svg', title: 'Data, hora e o nome do sistema', html: () => `<p>Clique no relógio para abrir <b>Data e Hora</b>. Você pode usar a hora do dispositivo ou definir outra, em qualquer ano. O nome do sistema muda com o ano: 1999 vira “ClaQui 99”, 2000 vira “ClaQui 2000”, 2026 vira “ClaQui 26”.</p><p>Em <b>Configurações</b> você ajusta tamanho da interface, papel de parede, temas, cursores e som.</p><div class="actions"><button type="button" class="chrome-button" data-act="open-app" data-app="datetime">Abrir Data e Hora</button><button type="button" class="chrome-button" data-act="open-app" data-app="settings">Abrir Configurações</button></div>`},
  {icon: 'assets/icons/mais-opcoes.svg', title: 'Touchpad no celular e funcionamento offline', html: () => `<p>No celular você pode ativar um <b>touchpad virtual</b> em <i>Configurações › Mouse</i>: escolha o formato, o tamanho, a posição e a sensibilidade. É totalmente opcional: o toque normal sempre funciona.</p><p>Instalado como app (PWA), o ClassiQuiz inteiro funciona <b>sem internet</b>. Quando houver atualização, o <b>ClaQui Update</b> avisa e nunca reinicia sozinho.</p><p class="muted">Pronto! Você pode rever este tutorial em <i>Start › Ajuda e Tutorial</i>, em Mais opções ou em Sobre.</p>`}
];
const total = STEPS.length;
function draw(w) {
  const i = w.data.step, s = STEPS[i], last = i === total - 1;
  w.body.innerHTML = `<div class="tut"><aside class="tut-side"><img src="${E(s.icon)}" alt=""><ol class="tut-list" aria-label="Etapas">${STEPS.map((x, k) => `<li class="${k === i ? 'on' : k < i ? 'done' : ''}" ${k === i ? 'aria-current="step"' : ''}>${E(x.title)}</li>`).join('')}</ol></aside>
    <section class="tut-main"><p class="tut-step" role="status">Etapa ${i + 1} de ${total}</p><div class="tut-bar" role="progressbar" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${i + 1}"><i style="width:${(i + 1) / total * 100}%"></i></div><h1>${E(s.title)}</h1><div class="tut-body">${s.html()}</div></section>
    <footer class="tut-foot"><label class="check"><input type="checkbox" data-tut="hide" ${CQ.sys.get('tutorialHide') ? 'checked' : ''}> Não mostrar novamente na inicialização</label><div class="tut-btns"><button type="button" class="chrome-button" data-tut="skip">${last ? 'Fechar' : 'Pular'}</button><button type="button" class="chrome-button" data-tut="back" ${i ? '' : 'disabled'}>&lt; Voltar</button><button type="button" class="chrome-button primary" data-tut="next">${last ? 'Concluir' : 'Avançar &gt;'}</button></div></footer></div>`;
  w.setStatus('Primeiros passos', `${i + 1}/${total}`); w.body.scrollTop = 0; w.body.querySelector('[data-tut="next"]')?.focus({preventScroll: true});
}
const finish = () => { CQ.sys.set({tutorialDone: true}); WM.close('tutorial'); };
A.tutorial = {title: 'Ajuda e Tutorial', icon: 'assets/icons/ajuda.svg', bodyClass: 'page', w: 760, h: 600, persistent: true,
  render(w) {
    w.data.step = 0; w.setTitle('Primeiros passos com o ' + CQ.clock.osName()); draw(w);
    w.body.addEventListener('click', e => { const b = e.target.closest('[data-tut]'); if (!b) return; const k = b.dataset.tut;
      if (k === 'next') { if (w.data.step >= total - 1) finish(); else { w.data.step++; draw(w); } } else if (k === 'back') { w.data.step = Math.max(0, w.data.step - 1); draw(w); }
      else if (k === 'skip') finish(); });
    w.body.addEventListener('change', e => { if (e.target.dataset.tut === 'hide') CQ.sys.set({tutorialHide: !!e.target.checked}); });
    w.body.addEventListener('keydown', e => { if (e.key === 'ArrowRight') w.body.querySelector('[data-tut="next"]')?.click(); else if (e.key === 'ArrowLeft') w.body.querySelector('[data-tut="back"]')?.click(); });
  }};
// novidades da release: mini apresentação única, sem obrigar a rever o tutorial
const NEWS = [['ClaQui Browser', 'navegador fictício com sites .cqo e o BuscaJá!'], ['Rede virtual', 'ícone ao lado do relógio; sem rede, o navegador esconde um segredo'], ['PWA offline completo', 'todo o jogo funciona sem internet depois de instalado'], ['Data e Hora', 'o nome do sistema acompanha o ano (ClaQui 26, ClaQui 99…)'], ['Toque em tudo', 'minijogos por gestos, Paciência e touchpad customizável']];
async function showNews() {
  const go = await CQ.ui.modal({title: 'Novidades da versão ' + CQ.VERSION, dismiss: false, body: `<ul class="changes">${NEWS.map(([t, d]) => `<li><b>${E(t)}</b> — ${E(d)}</li>`).join('')}</ul><p class="muted">Compilação ${E(CQ.BUILD)}. Seus saves e conquistas continuam intactos.</p>`, buttons: [{label: 'Fechar', value: false}, {label: 'Ver tutorial', value: true, primary: true}]});
  if (go) OS.open('tutorial');
}
CQ.bus.on('desktop:ready', () => {
  const sys = CQ.sys, hide = sys.get('tutorialHide'), seen = sys.get('seenRelease') === CQ.VERSION;
  if (wasFirstRun && !sys.get('tutorialDone') && !hide) { sys.set({seenRelease: CQ.VERSION}); setTimeout(() => OS.open('tutorial'), 400); }
  else if (!seen && !wasFirstRun) { sys.set({seenRelease: CQ.VERSION}); setTimeout(showNews, 900); }
  else if (!seen) sys.set({seenRelease: CQ.VERSION});
});
})();
