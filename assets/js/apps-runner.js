/* Offline Runner acessível também online via ClaQui OS. MIT. */
(() => {'use strict';const CQ=window.CQ;
CQ.apps.runner={title:'Offline Runner',icon:'assets/offline-sad.svg',bodyClass:'page runner-app',persistent:true,
 render(w){w.setTitle('ClaQui Offline Runner');w.setStatus('Arquivo • sinal perdido • alerta voador','');
  if(w.data.runner)w.data.runner.close();w.body.innerHTML='<div class="runner-host"></div>';
  w.data.runner=CQ_RUNNER.startGame(w.body.querySelector('.runner-host'),{onExit:()=>{w.data.runner=null;CQ.os.wm.close('runner');}});
 },onClose(w){const game=w.data.runner;w.data.runner=null;game?.close(true);},onHide(w){ /* O jogo continua na janela quando minimizado. */ }
};})();
