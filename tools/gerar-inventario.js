// Gera INVENTARIO-ARQUIVOS.md (lista e descreve todos os arquivos do projeto). Uso: node tools/gerar-inventario.js
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const D = [
  // raiz
  ['manifest.webmanifest','Manifest de instalação do PWA.'], ['offline.html','Tela global de exceção (instalação incompleta); o Offline Runner agora é segredo do ClaQui Browser.'], ['asset-manifest.json','GERADO por tools/build.js: lista de todos os arquivos do jogo com tamanho e SHA-256 (pré-cache do Service Worker).'], ['sw.js','Service Worker: pré-cache de todo o jogo por compilação, validação antes de ativar, limpeza dos caches antigos (linha BUILD carimbada pela ferramenta de build).'], ['vercel.json','Cabeçalhos HTTP: sw.js, version.json e asset-manifest.json nunca ficam em cache.'], ['tools/build.js','Ferramenta de release: gera versão por data, compilação, version.json, build-info.js, asset-manifest.json e carimba o sw.js.'], ['version.json','Versão de referência para consulta pelo ClaQui Update.'],
  ['index.html', 'Página única do ClaQui OS: casca da área de trabalho, barra de tarefas e ordem de carregamento dos scripts.'],
  ['INICIAR-CLASSIQUIZ.bat', 'Inicializador para Windows (PowerShell → Python → Node → abre index.html direto).'],
  ['launcher.ps1', 'Servidor HTTP local em PowerShell (porta 8765).'], ['launcher.py', 'Servidor HTTP local em Python.'], ['launcher.js', 'Servidor HTTP local em Node.'],
  ['LEIA-ME.txt', 'Como abrir, o que mudou, dados preservados e pendências.'], ['LICENCA-CODIGO.txt', 'Licença MIT do código.'],
  ['MANUAL-CLAQUI-OS.md', 'Manual do sistema e do jogo.'], ['CHANGELOG.md', 'Histórico de mudanças, correções e pendências da v2.0.9.'],
  ['RELATORIO-TESTES.md', 'Relatório honesto dos testes executados e não executados.'], ['INVENTARIO-ARQUIVOS.md', 'Este arquivo (gerado por tools/gerar-inventario.js).'],
  ['AUDITORIA-QUESTOES.csv', 'Auditoria dos 534 itens do B5: ação (mantida/ajustada/reescrita/removida), motivo e item equivalente no B6.'],
  ['NOVOS-ITENS-B6.csv', 'Itens criados do zero para o banco B6.'], ['licencas', 'Avisos de licença herdados.'],
  // scripts
  ['tests/e2e/13-pwa-offline-update.js', 'E2E: PWA offline e atualização entre duas releases.'],
  ['tests/e2e/12-v26nov16.js', 'E2E: tutorial, data/hora, rede, navegador, Runner e minijogos por toque.'],
  ['tests/web-v26.test.js', 'Roteador, busca, XSS e links dos sites.'],
  ['tests/solitaire-v26.test.js', 'Regras da Paciência.'],
  ['tests/runner-v26.test.js', 'Física e justiça do Runner.'],
  ['tests/clock-v26.test.js', 'Versões, relógio, nome do sistema e build.'],
  ['assets/css/web.css', 'Estilos da rede, navegador, sites .cqo, Data e Hora, tutorial, Paciência e touchpad.'],
  ['assets/js/apps-solitaire.js', 'Paciência (Klondike) por toque.'],
  ['assets/js/touch.js', 'Gestos de toque compartilhados pelos minijogos.'],
  ['assets/js/update.js', 'ClaQui Update e registro do Service Worker.'],
  ['assets/js/tutorial.js', 'Assistente Primeiros passos e novidades da release.'],
  ['assets/js/apps-datetime.js', 'Janela Data e Hora.'],
  ['assets/js/apps-browser.js', 'ClaQui Browser: janela, navegação, favoritos, histórico, tela offline e Runner secreto.'],
  ['assets/js/web-sites-b.js', 'Sites fictícios: ClaquiPédia, Tempo Certo, BaixaTudo, Lojão CQ, Diário do Milharal e três secretos.'],
  ['assets/js/web-sites-a.js', 'Sites fictícios: BuscaJá!, ClaquiMail, BatePapo, Jogolândia e Geocidades.'],
  ['assets/js/web-core.js', 'Roteador virtual .cqo, catálogo e busca do BuscaJá!.'],
  ['assets/js/apps-net.js', 'Rede virtual, ícone da bandeja, painel e janela Configurações de Rede.'],
  ['assets/js/build-info.js', 'GERADO: versão e compilação embutidas no cliente.'],
  ['assets/js/clock.js', 'Comparador de versões (semântica legada e por data) e relógio simulado/nome dinâmico do sistema.'],
  ['assets/js/core.js', 'Núcleo: namespace CQ, armazenamento, migração idempotente, modais, barramento de eventos, som.'],
  ['assets/js/vfs.js', 'Sistema de arquivos VIRTUAL (IndexedDB): pastas, arquivos, Lixeira, System32 fictício, pastas de casos (puzzles).'],
  ['assets/js/system-effects.js', 'Efeitos seguros e temporários das exclusões fictícias de pastas do ClaQui OS.'],
  ['assets/js/wm.js', 'ClaQui OS: gerenciador de janelas, barra de tarefas, menu Iniciar, menu de contexto, boot, energia, tela azul fictícia.'],
  ['assets/js/gen.js', 'Geradores PUROS das Trilhas B1–B5 (extraídos sem alteração da v1.2.2) e registro de bancos.'],
  ['assets/js/gen-b7.js','Gerador do B7: pergunta de menu contextual por Trilha, preservando B1-B6.'],
  ['assets/js/gen-b6.js', 'Gerador do banco B6, Ultra v2, campanhas e janelas do Show do Milhozão.'],
  ['assets/js/data.js', 'Dados do banco B4 (imutável).'], ['assets/js/data-b1.js', 'Dados do banco B1 (imutável).'], ['assets/js/data-b2.js', 'Dados do banco B2 (imutável).'], ['assets/js/data-b3.js', 'Dados do banco B3 (imutável).'], ['assets/js/data-b5.js', 'Dados do banco B5 (imutável).'],
  ['assets/js/data-b6.js', 'Banco B6 (GERADO por tools/build-b6.js): perguntas, estendidas, pegadinhas, minijogos, histórias, Show, missões.'],
  ['assets/js/campaigns-b6.js', 'Tabela fixa e curada das campanhas ClassiQuiz 1/2/3 (GERADA por tools/curate-campaigns.js).'],
  ['assets/js/app.js', 'Jogo: estado da partida, renderização das etapas, conquistas, biblioteca, Ultra, Fichas, janelas do jogo.'],
  ['assets/js/missions.js', 'Motor das missões de programa (Bloco de Notas, Calculadora, Paint, Explorador, Lixeira, Visualizador, manter aberto).'],
  ['assets/js/apps-system.js', 'Configurações, Terminal + UAC, Sobre, Atualizações, Estatísticas, Recompensas, pasta Mais opções sem Outros.'],
  ['assets/js/apps-files.js', 'Explorador de Arquivos, Lixeira e Visualizador.'], ['assets/js/apps-tools.js', 'Bloco de Notas, Calculadora, Paint, Calendário, Relógio, Reprodutor.'],
  ['assets/js/ttt-ai.js', 'Motor puro do Jogo da Velha: quatro estratégias, Minimax e geometria da fraude.'],
  ['assets/js/apps-games.js', 'Campo Minado, Jogo da Velha, Cobrinha, Pong.'], ['assets/js/apps-desvio.js', 'Desvio CQ: arcade de obstáculos, bônus, níveis contínuos, recorde e teto de dificuldade.'], ['assets/js/main.js', 'Ponto de entrada: inicia o sistema e o jogo.'],
  ['assets/js/touchpad.js','Touchpad virtual opcional para dispositivos móveis.'],
  ['assets/js/offline-runner.js','Motor original do Offline Runner compartilhado entre app e tela offline.'],
  ['assets/offline-sad.svg','Ícone cinza triste offline do ClassiQuiz.'],
  ['assets/pwa-192.png','Ícone PWA 192 pixels.'], ['assets/pwa-512.png','Ícone PWA 512 pixels.'],
  ['assets/js/mouse.js', 'Ponteiros com caminhos absolutos, PNG/SVG e 15 papéis.'], ['assets/css/mouse.css', 'Cursores do ClaQui OS e área de teste.'],
  ['assets/css/style.css', 'Estilos base e do jogo.'], ['assets/css/os.css', 'Estilos do ClaQui OS (janelas, barra, menus, boot).'], ['assets/css/apps.css', 'Estilos dos programas.'],
  ['assets/classiquiz-animado.gif', 'Marca animada do desktop (v1.2.x).'], ['assets/classiquiz-icon.svg', 'Ícone do ClassiQuiz.'], ['assets/favicon.svg', 'Favicon herdado da v1.2.2.'],
  ['assets/img/claquim.svg', 'Mascote Claquim (assistente do ClaQui OS).'], ['assets/img/milhito.svg', 'Mascote Milhito (apresentador do Show do Milhozão).'],
  // tools
  ['tools/build-b6.js', 'Gera data-b6.js e os CSV de auditoria a partir do B5 + correções + conteúdo novo.'], ['tools/curate-campaigns.js', 'Gera campaigns-b6.js (curadoria das 3 campanhas).'],
  ['tools/loaddata.js', 'Carrega os bancos no Node com um "window" falso.'], ['tools/make-icons.js', 'Gera os ícones e mascotes SVG autorais.'], ['tools/make-wallpapers.js', 'Gera os papéis de parede SVG autorais.'],
  ['tools/gerar-inventario.js', 'Gera este inventário.'], ['tools/b6-fonte', 'Fonte editorial do B6: correções por item (ov-*.js), itens novos (new-std.js) e conteúdo (content.js).'],
  // tests
  ['tests/v209.test.js','Regressão B7, Minimax X/O, conquistas offline e PWA da versão 2.0.9.'],
  ['tests/b6.test.js', 'Teste Node do B6/Ultra v2/campanhas/Show (14 941 verificações; 276 Trilhas e 360 Ultras).'], ['tests/legacy-seeds.test.js', 'Compara 327 seeds antigas com a v1.2.2 original (357 verificações).'],
  ['tests/ttt.test.js', 'Testes Node das probabilidades, geometria da fraude e algoritmo Minimax perfeito.'],
  ['tests/vfs-204.test.js', 'Testes Node de migração, navegação, arquivos ocultos, exclusões e restauração do disco virtual.'],
  ['tests/calc-205.test.js', 'Testa primeira divisão por zero, erro recorrente, operações encadeadas e persistência da Calculadora.'],
  ['tests/desvio-207.test.js', 'Verifica progressão ilimitada até níveis 256/1000 e hierarquia de atalhos.'], ['tests/mouse-206.test.js','Valida caminhos absolutos e 180 PNGs/180 SVGs de cursores.'],
  ['tests/bsod-205.test.js', 'Testa a tela azul por divisão por zero, boot virtual, e preserva a tela azul de System32.'],
  ['tests/fixtures/legacy-seeds.json', 'Assinaturas das Trilhas geradas pela v1.2.2 original.'], ['tests/lib/load.js', 'Carregador de scripts do navegador para os testes Node.'],
  ['tests/e2e/lib.js', 'Utilitários E2E (Playwright + Chrome real).'], ['tests/e2e/server.js', 'Servidor estático local dos testes.'], ['tests/e2e/play.js', 'Resolvedor automático pela interface real de todos os tipos de etapa.'],
  ['tests/e2e/run-all.js', 'Executa todas as suítes E2E (opção --longos).'],
  ['tests/e2e/01-campanhas.js', 'Joga as 3 campanhas inteiras.'], ['tests/e2e/02-sistema.js', 'Área de trabalho, Start, barra, menu de contexto, Configurações, Terminal/UAC, energia.'],
  ['tests/e2e/03-programas.js', 'Programas, jogos, Lixeira, Visualizador e regras de tempo das missões.'], ['tests/e2e/04-migracao-mobile.js', 'Migração de dados antigos, celular/tablet, teclado.'],
  ['tests/e2e/05-trilhas-ultra.js', 'Trilha Aleatória B6, seeds, biblioteca, Ultra 1/2/3 corações.'], ['tests/e2e/06-longos.js', 'Ultra completo e Trilha de 400 (longos).'],
  ['tests/e2e/07-boot-explorador-energia.js', 'Boot, Explorador, System32/tela azul, Desligar/Reiniciar, toque prolongado.'], ['tests/e2e/08-capturas.js', 'Capturas reais de todos os programas + teste de fumaça.'],
  ['tests/e2e/09-papel-de-parede.js', 'Papel de parede: presets, ajustes, importação, persistência.'], ['tests/e2e/11-aceitacao.js', 'Checklist complementar: barra de tarefas, F12 livre, Campo Minado, Paint, F5 de campanha/investigação, Milhonário com erro, resoluções.'], ['tests/package.json', 'Dependência de teste (playwright-core) e scripts npm.'], ['tests/e2e/10-terminal-tentativa.js', 'Terminal × conquistas × elegibilidade da tentativa.'],
  ['tests/capturas', 'Capturas de tela REAIS (Chrome) geradas pelos testes E2E.']
];
const map = new Map(D); const out = []; const skip = new Set(['node_modules', '.git', '__pycache__']);
function walk(dir) { for (const e of fs.readdirSync(dir, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name))) { if (skip.has(e.name)) continue; const p = path.join(dir, e.name), rel = path.relative(ROOT, p).split(path.sep).join('/'); if (e.isDirectory()) { if (rel === 'tests/capturas') { const n = fs.readdirSync(p).length; out.push([rel + '/', '-', `${n} capturas PNG reais (${map.get(rel)})`]); continue; } if (rel === 'tools/b6-fonte') { out.push([rel + '/', '-', map.get(rel)]); continue; } walk(p); } else out.push([rel, fs.statSync(p).size, map.get(rel) || describe(rel)]); } }
function describe(rel) {
  if (/^assets\/cursors\/.*\.png$/.test(rel)) return 'Cursor PNG original para compatibilidade com Chrome.'; if (/^assets\/cursors\/.*\.svg$/.test(rel)) return 'Cursor SVG original (fallback).';
  if (/^assets\/icons\/f-/.test(rel)) return 'Ícone de tipo de arquivo (Explorador).'; if (/^assets\/icons\//.test(rel)) return 'Ícone SVG autoral do programa/menu.'; if (/^assets\/wallpapers\//.test(rel)) return 'Papel de parede SVG autoral.';
  if (/^tools\/b6-fonte\//.test(rel)) return 'Fonte editorial do B6.'; if (/^licencas\//.test(rel)) return 'Aviso de licença.'; return '—';
}
walk(ROOT);
const kb = n => n === '-' ? '-' : n < 1024 ? n + ' B' : (n / 1024).toFixed(1) + ' KB';
const groups = [['Raiz', r => !r.includes('/')], ['assets/js', r => r.startsWith('assets/js/')], ['assets/css e mídia', r => r.startsWith('assets/') && !r.startsWith('assets/js/') && !r.startsWith('assets/icons/') && !r.startsWith('assets/wallpapers/')], ['assets/icons', r => r.startsWith('assets/icons/')], ['assets/wallpapers', r => r.startsWith('assets/wallpapers/')], ['tools', r => r.startsWith('tools/')], ['tests', r => r.startsWith('tests/')], ['licencas', r => r.startsWith('licencas/')]];
const INTRO = [
  '## Arquitetura',
  '',
  '- **Sem bundler.** O HTML roda diretamente no navegador na edição local, e como PWA na hospedagem HTTPS. O modo web exige internet, exceto a tela offline e seu minijogo.  `index.html` carrega scripts simples (`defer`) numa ordem fixa: `core.js` → `vfs.js` → `wm.js` → bancos `data*.js` → `gen.js` → `data-b6.js` → `campaigns-b6.js` → `gen-b6.js` → `app.js` → `missions.js` → `apps-system/files/tools.js` → `ttt-ai.js` → `apps-games.js` → `system-effects.js` → `main.js`. Tudo compartilha o namespace `window.CQ`.',
  '- **Camadas.** `core.js` (armazenamento, migração, modais, eventos, som) · `vfs.js` (sistema de arquivos virtual no IndexedDB `classiquiz-os`) · `wm.js` (ClaQui OS: janelas, barra de tarefas, menu Iniciar, menu de contexto, boot, energia, tela azul fictícia; cada programa se registra em `CQ.apps[id]`) · `gen.js`/`gen-b6.js` (geradores **puros e determinísticos**) · `app.js` (o jogo) · `missions.js` (motor das missões de programa) · `apps-*.js` (programas).',
  '- **Seeds.** Toda Trilha é função da seed: `CQ1-B7-<perfil>-<posições>-<sufixo>` (Trilha Aleatória nova), com B6 preservado, `CQU2-B6-<perfil>-ALL-<sufixo>` (Ultra v2), `CQC<n>-B6-U-50-CLASSIQUIZ<n>` (campanhas). As seeds antigas `CQ1-B1…B5` e `CQU1-B5` continuam no gerador antigo, idêntico ao da v1.2.2 (bancos B1–B5 imutáveis).',
  '- **Segurança.** O ClaQui OS só toca em arquivos **virtuais**; System32, Desligar e Reiniciar são **simulações**. Sem telemetria, anúncios ou login; a central de atualização consulta somente o arquivo de versão do próprio servidor; as ferramentas do navegador (F12) não são bloqueadas.',
  '- **Armazenamento.** `localStorage` com chaves `classiquiz.v1.*` (`session`, `library`, `preferences`, `achievements`, `system`, `rewards`, `records`, `campaigns`, `meta`, `discoveries`, `calendar`, `player`, `backup.pre-v2`, `ttt`, `calc.divideZeroSeen`) e IndexedDB `classiquiz-os` (arquivos virtuais e fundo de tela importado).',
  '',
  '## Migração de dados (v1.2.x → 2.0.0)',
  '',
  '- `CQ.migrate()` (em `core.js`) é **idempotente**: se `classiquiz.v1.meta.schema` já for 2 ou mais, não faz nada.',
  '- Na primeira abertura: (1) cria o **backup lógico** `classiquiz.v1.backup.pre-v2` — biblioteca (seed, nome, favorita, recorde, perfil, tamanho, banco), conquistas, preferências e resumo da sessão — **somente se ele ainda não existir**; (2) completa campos novos das conquistas sem remover nada; (3) grava `meta = {schema: 2, …}`.',
  '- Nenhuma chave antiga é apagada ou reescrita; chaves desconhecidas nas preferências são preservadas. Os dados novos (sistema, Fichas, recordes por edição, campanhas, calendário, jogador) vivem em chaves próprias.',
  '- Verificação: `tests/e2e/04-migracao-mobile.js` (dados no formato v1.2.2 → migração → recarregar 3 vezes sem alteração) e `tests/legacy-seeds.test.js` (327 seeds antigas × v1.2.2 original).',
  ''
].join('\n');
let md = '# Inventário de arquivos — ClassiQuiz 26nov16\n\nGerado por `node tools/gerar-inventario.js`. Arquivos marcados como **imutáveis** (bancos B1–B5) não foram alterados; **GERADO** significa que é saída reprodutível de `tools/`.\n\n' + INTRO + '\n## Arquivos\n\n';
const seen = new Set();
for (const [title, f] of groups) { const rows = out.filter(r => f(r[0]) && !seen.has(r[0])); if (!rows.length) continue; rows.forEach(r => seen.add(r[0])); md += `### ${title}\n\n| Arquivo | Tamanho | Descrição |\n|---|---|---|\n` + rows.map(r => `| \`${r[0]}\` | ${kb(r[1])} | ${r[2]} |`).join('\n') + '\n\n'; }
fs.writeFileSync(path.join(ROOT, 'INVENTARIO-ARQUIVOS.md'), md); console.log('inventário: ' + out.length + ' entradas');
