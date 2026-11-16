/* ClaQui OS — falhas simuladas provocadas por exclusões de pastas VIRTUAIS.
   Não manipula arquivos do Windows nem configurações do aparelho. */
(() => {
'use strict';
const CQ = window.CQ, timers = new Map();
const names = {
  Drivers: 'drivers', Fontes: 'fontes', Temas: 'temas', Media: 'media',
  'Inicialização': 'inicializacao', Temp: 'temp', Programas: 'programas',
  Registros: 'registros', Config: 'config'
};
const OSFX = CQ.systemEffects = {
  silent: false,
  apply(folder) {
    const name = names[folder]; if (!name) return false;
    if (timers.has(folder)) clearTimeout(timers.get(folder));
    if (folder === 'Media') OSFX.silent = true;
    if (folder === 'Inicialização') {
      CQ.store.write('classiquiz.os.boot-repair', true);
      CQ.notify('A inicialização foi alterada. O ClaQui OS verificará os arquivos no próximo boot.');
    } else if (folder === 'Temp') CQ.notify('Pasta temporária esvaziada. Limpando o cache virtual...');
    else if (folder === 'Programas') CQ.notify('Alguns atalhos não estão respondendo.');
    else if (folder === 'Fontes') CQ.notify('O sistema detectou fontes ausentes.');
    else if (folder === 'Drivers') CQ.notify('O dispositivo apontador está em modo de recuperação.');
    else if (folder === 'Media') CQ.notify('Dispositivo de áudio indisponível.');
    else if (folder === 'Temas') CQ.notify('O tema do ClaQui OS não pôde ser carregado.');
    else CQ.notify('Arquivos virtuais temporariamente indisponíveis.');
    document.documentElement.classList.add('cq-glitch-' + name);
    const ms = folder === 'Temp' ? 1400 : 14000;
    timers.set(folder, setTimeout(() => {
      document.documentElement.classList.remove('cq-glitch-' + name);
      if (folder === 'Media') OSFX.silent = false;
      CQ.vfs.restoreSystemFolder(folder);
      timers.delete(folder);
      if (folder !== 'Temp') CQ.notify('Recuperação automática concluída.');
    }, ms));
    CQ.bus.emit('os:effect', {folder, type: 'start'});
    return true;
  }
};
})();
