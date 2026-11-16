# Inventário de arquivos — ClassiQuiz 26nov16

Gerado por `node tools/gerar-inventario.js`. Arquivos marcados como **imutáveis** (bancos B1–B5) não foram alterados; **GERADO** significa que é saída reprodutível de `tools/`.

## Arquitetura

- **Sem bundler.** O HTML roda diretamente no navegador na edição local, e como PWA na hospedagem HTTPS. O modo web exige internet, exceto a tela offline e seu minijogo.  `index.html` carrega scripts simples (`defer`) numa ordem fixa: `core.js` → `vfs.js` → `wm.js` → bancos `data*.js` → `gen.js` → `data-b6.js` → `campaigns-b6.js` → `gen-b6.js` → `app.js` → `missions.js` → `apps-system/files/tools.js` → `ttt-ai.js` → `apps-games.js` → `system-effects.js` → `main.js`. Tudo compartilha o namespace `window.CQ`.
- **Camadas.** `core.js` (armazenamento, migração, modais, eventos, som) · `vfs.js` (sistema de arquivos virtual no IndexedDB `classiquiz-os`) · `wm.js` (ClaQui OS: janelas, barra de tarefas, menu Iniciar, menu de contexto, boot, energia, tela azul fictícia; cada programa se registra em `CQ.apps[id]`) · `gen.js`/`gen-b6.js` (geradores **puros e determinísticos**) · `app.js` (o jogo) · `missions.js` (motor das missões de programa) · `apps-*.js` (programas).
- **Seeds.** Toda Trilha é função da seed: `CQ1-B7-<perfil>-<posições>-<sufixo>` (Trilha Aleatória nova), com B6 preservado, `CQU2-B6-<perfil>-ALL-<sufixo>` (Ultra v2), `CQC<n>-B6-U-50-CLASSIQUIZ<n>` (campanhas). As seeds antigas `CQ1-B1…B5` e `CQU1-B5` continuam no gerador antigo, idêntico ao da v1.2.2 (bancos B1–B5 imutáveis).
- **Segurança.** O ClaQui OS só toca em arquivos **virtuais**; System32, Desligar e Reiniciar são **simulações**. Sem telemetria, anúncios ou login; a central de atualização consulta somente o arquivo de versão do próprio servidor; as ferramentas do navegador (F12) não são bloqueadas.
- **Armazenamento.** `localStorage` com chaves `classiquiz.v1.*` (`session`, `library`, `preferences`, `achievements`, `system`, `rewards`, `records`, `campaigns`, `meta`, `discoveries`, `calendar`, `player`, `backup.pre-v2`, `ttt`, `calc.divideZeroSeen`) e IndexedDB `classiquiz-os` (arquivos virtuais e fundo de tela importado).

## Migração de dados (v1.2.x → 2.0.0)

- `CQ.migrate()` (em `core.js`) é **idempotente**: se `classiquiz.v1.meta.schema` já for 2 ou mais, não faz nada.
- Na primeira abertura: (1) cria o **backup lógico** `classiquiz.v1.backup.pre-v2` — biblioteca (seed, nome, favorita, recorde, perfil, tamanho, banco), conquistas, preferências e resumo da sessão — **somente se ele ainda não existir**; (2) completa campos novos das conquistas sem remover nada; (3) grava `meta = {schema: 2, …}`.
- Nenhuma chave antiga é apagada ou reescrita; chaves desconhecidas nas preferências são preservadas. Os dados novos (sistema, Fichas, recordes por edição, campanhas, calendário, jogador) vivem em chaves próprias.
- Verificação: `tests/e2e/04-migracao-mobile.js` (dados no formato v1.2.2 → migração → recarregar 3 vezes sem alteração) e `tests/legacy-seeds.test.js` (327 seeds antigas × v1.2.2 original).

## Arquivos

### Raiz

| Arquivo | Tamanho | Descrição |
|---|---|---|
| `.gitignore` | 46 B | — |
| `asset-manifest.json` | 59.7 KB | GERADO por tools/build.js: lista de todos os arquivos do jogo com tamanho e SHA-256 (pré-cache do Service Worker). |
| `AUDITORIA-QUESTOES.csv` | 141.8 KB | Auditoria dos 534 itens do B5: ação (mantida/ajustada/reescrita/removida), motivo e item equivalente no B6. |
| `CHANGELOG.md` | 25.4 KB | Histórico de mudanças, correções e pendências da v2.0.9. |
| `index.html` | 7.3 KB | Página única do ClaQui OS: casca da área de trabalho, barra de tarefas e ordem de carregamento dos scripts. |
| `INICIAR-CLASSIQUIZ.bat` | 1.9 KB | Inicializador para Windows (PowerShell → Python → Node → abre index.html direto). |
| `INVENTARIO-ARQUIVOS.md` | 49.1 KB | Este arquivo (gerado por tools/gerar-inventario.js). |
| `launcher.js` | 1.4 KB | Servidor HTTP local em Node. |
| `launcher.ps1` | 5.2 KB | Servidor HTTP local em PowerShell (porta 8765). |
| `launcher.py` | 1.6 KB | Servidor HTTP local em Python. |
| `LEIA-ME.txt` | 10.6 KB | Como abrir, o que mudou, dados preservados e pendências. |
| `LICENCA-CODIGO.txt` | 1.0 KB | Licença MIT do código. |
| `manifest.webmanifest` | 593 B | Manifest de instalação do PWA. |
| `MANUAL-CLAQUI-OS.md` | 21.1 KB | Manual do sistema e do jogo. |
| `NOVOS-ITENS-B6.csv` | 18.4 KB | Itens criados do zero para o banco B6. |
| `offline.html` | 4.0 KB | Tela global de exceção (instalação incompleta); o Offline Runner agora é segredo do ClaQui Browser. |
| `RELATORIO-TESTES.md` | 27.7 KB | Relatório honesto dos testes executados e não executados. |
| `sw.js` | 4.8 KB | Service Worker: pré-cache de todo o jogo por compilação, validação antes de ativar, limpeza dos caches antigos (linha BUILD carimbada pela ferramenta de build). |
| `vercel.json` | 377 B | Cabeçalhos HTTP: sw.js, version.json e asset-manifest.json nunca ficam em cache. |
| `version.json` | 234 B | Versão de referência para consulta pelo ClaQui Update. |

### assets/js

| Arquivo | Tamanho | Descrição |
|---|---|---|
| `assets/js/app.js` | 80.3 KB | Jogo: estado da partida, renderização das etapas, conquistas, biblioteca, Ultra, Fichas, janelas do jogo. |
| `assets/js/apps-browser.js` | 18.2 KB | ClaQui Browser: janela, navegação, favoritos, histórico, tela offline e Runner secreto. |
| `assets/js/apps-datetime.js` | 11.5 KB | Janela Data e Hora. |
| `assets/js/apps-desvio.js` | 12.0 KB | Desvio CQ: arcade de obstáculos, bônus, níveis contínuos, recorde e teto de dificuldade. |
| `assets/js/apps-files.js` | 19.0 KB | Explorador de Arquivos, Lixeira e Visualizador. |
| `assets/js/apps-games.js` | 26.2 KB | Campo Minado, Jogo da Velha, Cobrinha, Pong. |
| `assets/js/apps-net.js` | 8.6 KB | Rede virtual, ícone da bandeja, painel e janela Configurações de Rede. |
| `assets/js/apps-solitaire.js` | 11.5 KB | Paciência (Klondike) por toque. |
| `assets/js/apps-system.js` | 37.6 KB | Configurações, Terminal + UAC, Sobre, Atualizações, Estatísticas, Recompensas, pasta Mais opções sem Outros. |
| `assets/js/apps-tools.js` | 26.7 KB | Bloco de Notas, Calculadora, Paint, Calendário, Relógio, Reprodutor. |
| `assets/js/build-info.js` | 147 B | GERADO: versão e compilação embutidas no cliente. |
| `assets/js/campaigns-b6.js` | 2.5 KB | Tabela fixa e curada das campanhas ClassiQuiz 1/2/3 (GERADA por tools/curate-campaigns.js). |
| `assets/js/clock.js` | 8.7 KB | Comparador de versões (semântica legada e por data) e relógio simulado/nome dinâmico do sistema. |
| `assets/js/core.js` | 12.2 KB | Núcleo: namespace CQ, armazenamento, migração idempotente, modais, barramento de eventos, som. |
| `assets/js/data-b1.js` | 20.4 KB | Dados do banco B1 (imutável). |
| `assets/js/data-b2.js` | 26.0 KB | Dados do banco B2 (imutável). |
| `assets/js/data-b3.js` | 35.2 KB | Dados do banco B3 (imutável). |
| `assets/js/data-b5.js` | 48.8 KB | Dados do banco B5 (imutável). |
| `assets/js/data-b6.js` | 191.1 KB | Banco B6 (GERADO por tools/build-b6.js): perguntas, estendidas, pegadinhas, minijogos, histórias, Show, missões. |
| `assets/js/data.js` | 46.3 KB | Dados do banco B4 (imutável). |
| `assets/js/gen-b6.js` | 12.4 KB | Gerador do banco B6, Ultra v2, campanhas e janelas do Show do Milhozão. |
| `assets/js/gen-b7.js` | 1.9 KB | Gerador do B7: pergunta de menu contextual por Trilha, preservando B1-B6. |
| `assets/js/gen.js` | 31.2 KB | Geradores PUROS das Trilhas B1–B5 (extraídos sem alteração da v1.2.2) e registro de bancos. |
| `assets/js/main.js` | 434 B | Ponto de entrada: inicia o sistema e o jogo. |
| `assets/js/missions.js` | 8.6 KB | Motor das missões de programa (Bloco de Notas, Calculadora, Paint, Explorador, Lixeira, Visualizador, manter aberto). |
| `assets/js/mouse.js` | 3.2 KB | Ponteiros com caminhos absolutos, PNG/SVG e 15 papéis. |
| `assets/js/offline-runner.js` | 17.9 KB | Motor original do Offline Runner compartilhado entre app e tela offline. |
| `assets/js/system-effects.js` | 2.0 KB | Efeitos seguros e temporários das exclusões fictícias de pastas do ClaQui OS. |
| `assets/js/touch.js` | 2.5 KB | Gestos de toque compartilhados pelos minijogos. |
| `assets/js/touchpad.js` | 11.7 KB | Touchpad virtual opcional para dispositivos móveis. |
| `assets/js/ttt-ai.js` | 4.6 KB | Motor puro do Jogo da Velha: quatro estratégias, Minimax e geometria da fraude. |
| `assets/js/tutorial.js` | 8.5 KB | Assistente Primeiros passos e novidades da release. |
| `assets/js/update.js` | 12.0 KB | ClaQui Update e registro do Service Worker. |
| `assets/js/vfs.js` | 24.5 KB | Sistema de arquivos VIRTUAL (IndexedDB): pastas, arquivos, Lixeira, System32 fictício, pastas de casos (puzzles). |
| `assets/js/web-core.js` | 6.0 KB | Roteador virtual .cqo, catálogo e busca do BuscaJá!. |
| `assets/js/web-sites-a.js` | 24.4 KB | Sites fictícios: BuscaJá!, ClaquiMail, BatePapo, Jogolândia e Geocidades. |
| `assets/js/web-sites-b.js` | 15.6 KB | Sites fictícios: ClaquiPédia, Tempo Certo, BaixaTudo, Lojão CQ, Diário do Milharal e três secretos. |
| `assets/js/wm.js` | 32.3 KB | ClaQui OS: gerenciador de janelas, barra de tarefas, menu Iniciar, menu de contexto, boot, energia, tela azul fictícia. |

### assets/css e mídia

| Arquivo | Tamanho | Descrição |
|---|---|---|
| `assets/classiquiz-animado.gif` | 274.2 KB | Marca animada do desktop (v1.2.x). |
| `assets/classiquiz-icon.svg` | 2.9 KB | Ícone do ClassiQuiz. |
| `assets/css/apps.css` | 31.4 KB | Estilos dos programas. |
| `assets/css/mouse.css` | 5.4 KB | Cursores do ClaQui OS e área de teste. |
| `assets/css/os.css` | 17.4 KB | Estilos do ClaQui OS (janelas, barra, menus, boot). |
| `assets/css/style.css` | 21.4 KB | Estilos base e do jogo. |
| `assets/css/web.css` | 25.9 KB | Estilos da rede, navegador, sites .cqo, Data e Hora, tutorial, Paciência e touchpad. |
| `assets/cursors/aero-busy-24.png` | 971 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-busy-24.svg` | 337 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-busy-32.png` | 1.2 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-busy-32.svg` | 337 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-busy-40.png` | 1.6 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-busy-40.svg` | 337 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-ew-24.png` | 493 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-ew-24.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-ew-32.png` | 630 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-ew-32.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-ew-40.png` | 923 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-ew-40.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-handwriting-24.png` | 755 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-handwriting-24.svg` | 254 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-handwriting-32.png` | 975 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-handwriting-32.svg` | 254 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-handwriting-40.png` | 1.2 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-handwriting-40.svg` | 254 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-help-24.png` | 971 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-help-24.svg` | 385 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-help-32.png` | 1.3 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-help-32.svg` | 385 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-help-40.png` | 1.5 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-help-40.svg` | 385 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-link-24.png` | 889 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-link-24.svg` | 402 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-link-32.png` | 1.0 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-link-32.svg` | 402 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-link-40.png` | 1.4 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-link-40.svg` | 402 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-login-24.png` | 226 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-login-24.svg` | 228 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-login-32.png` | 247 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-login-32.svg` | 228 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-login-40.png` | 287 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-login-40.svg` | 228 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-move-24.png` | 1.1 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-move-24.svg` | 339 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-move-32.png` | 1.3 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-move-32.svg` | 339 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-move-40.png` | 1.7 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-move-40.svg` | 339 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-nesw-24.png` | 755 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-nesw-24.svg` | 268 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-nesw-32.png` | 719 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-nesw-32.svg` | 268 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-nesw-40.png` | 1016 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-nesw-40.svg` | 268 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-normal-24.png` | 713 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-normal-24.svg` | 253 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-normal-32.png` | 863 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-normal-32.svg` | 253 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-normal-40.png` | 1.0 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-normal-40.svg` | 253 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-ns-24.png` | 647 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-ns-24.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-ns-32.png` | 836 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-ns-32.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-ns-40.png` | 993 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-ns-40.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-nwse-24.png` | 819 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-nwse-24.svg` | 269 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-nwse-32.png` | 916 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-nwse-32.svg` | 269 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-nwse-40.png` | 1.2 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-nwse-40.svg` | 269 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-precision-24.png` | 539 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-precision-24.svg` | 267 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-precision-32.png` | 669 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-precision-32.svg` | 267 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-precision-40.png` | 806 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-precision-40.svg` | 267 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-unavailable-24.png` | 1007 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-unavailable-24.svg` | 244 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-unavailable-32.png` | 1.2 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-unavailable-32.svg` | 244 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-unavailable-40.png` | 1.5 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-unavailable-40.svg` | 244 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-up-24.png` | 719 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-up-24.svg` | 243 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-up-32.png` | 889 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-up-32.svg` | 243 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-up-40.png` | 1.1 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-up-40.svg` | 243 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-working-24.png` | 1.0 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-working-24.svg` | 335 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-working-32.png` | 1.3 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-working-32.svg` | 335 B | Cursor SVG original (fallback). |
| `assets/cursors/aero-working-40.png` | 1.7 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/aero-working-40.svg` | 335 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-busy-24.png` | 974 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-busy-24.svg` | 337 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-busy-32.png` | 1.2 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-busy-32.svg` | 337 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-busy-40.png` | 1.6 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-busy-40.svg` | 337 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-ew-24.png` | 480 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-ew-24.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-ew-32.png` | 640 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-ew-32.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-ew-40.png` | 914 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-ew-40.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-handwriting-24.png` | 770 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-handwriting-24.svg` | 254 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-handwriting-32.png` | 946 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-handwriting-32.svg` | 254 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-handwriting-40.png` | 1.1 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-handwriting-40.svg` | 254 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-help-24.png` | 1018 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-help-24.svg` | 385 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-help-32.png` | 1.3 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-help-32.svg` | 385 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-help-40.png` | 1.6 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-help-40.svg` | 385 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-link-24.png` | 894 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-link-24.svg` | 402 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-link-32.png` | 1.0 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-link-32.svg` | 402 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-link-40.png` | 1.4 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-link-40.svg` | 402 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-login-24.png` | 226 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-login-24.svg` | 228 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-login-32.png` | 253 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-login-32.svg` | 228 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-login-40.png` | 284 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-login-40.svg` | 228 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-move-24.png` | 1.1 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-move-24.svg` | 339 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-move-32.png` | 1.3 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-move-32.svg` | 339 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-move-40.png` | 1.7 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-move-40.svg` | 339 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-nesw-24.png` | 725 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-nesw-24.svg` | 268 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-nesw-32.png` | 702 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-nesw-32.svg` | 268 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-nesw-40.png` | 979 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-nesw-40.svg` | 268 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-normal-24.png` | 710 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-normal-24.svg` | 253 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-normal-32.png` | 867 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-normal-32.svg` | 253 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-normal-40.png` | 1.0 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-normal-40.svg` | 253 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-ns-24.png` | 645 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-ns-24.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-ns-32.png` | 825 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-ns-32.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-ns-40.png` | 989 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-ns-40.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-nwse-24.png` | 833 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-nwse-24.svg` | 269 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-nwse-32.png` | 842 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-nwse-32.svg` | 269 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-nwse-40.png` | 1.1 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-nwse-40.svg` | 269 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-precision-24.png` | 542 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-precision-24.svg` | 267 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-precision-32.png` | 687 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-precision-32.svg` | 267 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-precision-40.png` | 808 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-precision-40.svg` | 267 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-unavailable-24.png` | 1004 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-unavailable-24.svg` | 244 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-unavailable-32.png` | 1.2 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-unavailable-32.svg` | 244 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-unavailable-40.png` | 1.5 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-unavailable-40.svg` | 244 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-up-24.png` | 722 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-up-24.svg` | 243 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-up-32.png` | 895 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-up-32.svg` | 243 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-up-40.png` | 1.1 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-up-40.svg` | 243 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-working-24.png` | 1.0 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-working-24.svg` | 335 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-working-32.png` | 1.3 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-working-32.svg` | 335 B | Cursor SVG original (fallback). |
| `assets/cursors/claqui-working-40.png` | 1.7 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/claqui-working-40.svg` | 335 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-busy-24.png` | 730 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-busy-24.svg` | 337 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-busy-32.png` | 918 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-busy-32.svg` | 337 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-busy-40.png` | 1.2 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-busy-40.svg` | 337 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-ew-24.png` | 440 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-ew-24.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-ew-32.png` | 613 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-ew-32.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-ew-40.png` | 784 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-ew-40.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-handwriting-24.png` | 657 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-handwriting-24.svg` | 254 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-handwriting-32.png` | 827 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-handwriting-32.svg` | 254 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-handwriting-40.png` | 1.1 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-handwriting-40.svg` | 254 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-help-24.png` | 814 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-help-24.svg` | 385 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-help-32.png` | 1.0 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-help-32.svg` | 385 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-help-40.png` | 1.4 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-help-40.svg` | 385 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-link-24.png` | 783 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-link-24.svg` | 402 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-link-32.png` | 948 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-link-32.svg` | 402 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-link-40.png` | 1.2 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-link-40.svg` | 402 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-login-24.png` | 229 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-login-24.svg` | 228 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-login-32.png` | 253 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-login-32.svg` | 228 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-login-40.png` | 276 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-login-40.svg` | 228 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-move-24.png` | 830 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-move-24.svg` | 339 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-move-32.png` | 954 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-move-32.svg` | 339 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-move-40.png` | 1.3 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-move-40.svg` | 339 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-nesw-24.png` | 566 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-nesw-24.svg` | 268 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-nesw-32.png` | 463 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-nesw-32.svg` | 268 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-nesw-40.png` | 753 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-nesw-40.svg` | 268 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-normal-24.png` | 595 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-normal-24.svg` | 253 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-normal-32.png` | 707 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-normal-32.svg` | 253 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-normal-40.png` | 1012 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-normal-40.svg` | 253 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-ns-24.png` | 418 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-ns-24.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-ns-32.png` | 549 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-ns-32.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-ns-40.png` | 682 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-ns-40.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-nwse-24.png` | 598 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-nwse-24.svg` | 269 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-nwse-32.png` | 451 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-nwse-32.svg` | 269 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-nwse-40.png` | 760 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-nwse-40.svg` | 269 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-precision-24.png` | 507 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-precision-24.svg` | 267 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-precision-32.png` | 632 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-precision-32.svg` | 267 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-precision-40.png` | 726 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-precision-40.svg` | 267 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-unavailable-24.png` | 751 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-unavailable-24.svg` | 244 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-unavailable-32.png` | 1012 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-unavailable-32.svg` | 244 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-unavailable-40.png` | 1.2 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-unavailable-40.svg` | 244 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-up-24.png` | 587 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-up-24.svg` | 243 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-up-32.png` | 693 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-up-32.svg` | 243 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-up-40.png` | 897 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-up-40.svg` | 243 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-working-24.png` | 870 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-working-24.svg` | 335 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-working-32.png` | 1.1 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-working-32.svg` | 335 B | Cursor SVG original (fallback). |
| `assets/cursors/classico-working-40.png` | 1.6 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/classico-working-40.svg` | 335 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-busy-24.png` | 972 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-busy-24.svg` | 337 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-busy-32.png` | 1.2 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-busy-32.svg` | 337 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-busy-40.png` | 1.5 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-busy-40.svg` | 337 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-ew-24.png` | 492 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-ew-24.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-ew-32.png` | 634 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-ew-32.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-ew-40.png` | 920 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-ew-40.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-handwriting-24.png` | 768 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-handwriting-24.svg` | 254 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-handwriting-32.png` | 961 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-handwriting-32.svg` | 254 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-handwriting-40.png` | 1.1 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-handwriting-40.svg` | 254 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-help-24.png` | 961 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-help-24.svg` | 385 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-help-32.png` | 1.3 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-help-32.svg` | 385 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-help-40.png` | 1.5 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-help-40.svg` | 385 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-link-24.png` | 880 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-link-24.svg` | 402 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-link-32.png` | 1.0 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-link-32.svg` | 402 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-link-40.png` | 1.4 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-link-40.svg` | 402 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-login-24.png` | 222 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-login-24.svg` | 228 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-login-32.png` | 276 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-login-32.svg` | 228 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-login-40.png` | 284 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-login-40.svg` | 228 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-move-24.png` | 1.0 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-move-24.svg` | 339 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-move-32.png` | 1.3 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-move-32.svg` | 339 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-move-40.png` | 1.6 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-move-40.svg` | 339 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-nesw-24.png` | 743 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-nesw-24.svg` | 268 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-nesw-32.png` | 698 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-nesw-32.svg` | 268 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-nesw-40.png` | 984 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-nesw-40.svg` | 268 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-normal-24.png` | 709 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-normal-24.svg` | 253 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-normal-32.png` | 854 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-normal-32.svg` | 253 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-normal-40.png` | 1.0 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-normal-40.svg` | 253 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-ns-24.png` | 612 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-ns-24.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-ns-32.png` | 782 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-ns-32.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-ns-40.png` | 989 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-ns-40.svg` | 260 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-nwse-24.png` | 814 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-nwse-24.svg` | 269 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-nwse-32.png` | 898 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-nwse-32.svg` | 269 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-nwse-40.png` | 1.1 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-nwse-40.svg` | 269 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-precision-24.png` | 538 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-precision-24.svg` | 267 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-precision-32.png` | 688 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-precision-32.svg` | 267 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-precision-40.png` | 788 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-precision-40.svg` | 267 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-unavailable-24.png` | 1010 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-unavailable-24.svg` | 244 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-unavailable-32.png` | 1.2 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-unavailable-32.svg` | 244 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-unavailable-40.png` | 1.4 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-unavailable-40.svg` | 244 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-up-24.png` | 722 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-up-24.svg` | 243 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-up-32.png` | 887 B | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-up-32.svg` | 243 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-up-40.png` | 1.1 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-up-40.svg` | 243 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-working-24.png` | 1.0 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-working-24.svg` | 335 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-working-32.png` | 1.3 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-working-32.svg` | 335 B | Cursor SVG original (fallback). |
| `assets/cursors/xp-working-40.png` | 1.7 KB | Cursor PNG original para compatibilidade com Chrome. |
| `assets/cursors/xp-working-40.svg` | 335 B | Cursor SVG original (fallback). |
| `assets/favicon.svg` | 384 B | Favicon herdado da v1.2.2. |
| `assets/img/claquim.svg` | 1.4 KB | Mascote Claquim (assistente do ClaQui OS). |
| `assets/img/milhito.svg` | 1.4 KB | Mascote Milhito (apresentador do Show do Milhozão). |
| `assets/offline-sad.svg` | 3.0 KB | Ícone cinza triste offline do ClassiQuiz. |
| `assets/pwa-192.png` | 1.4 KB | Ícone PWA 192 pixels. |
| `assets/pwa-512.png` | 3.1 KB | Ícone PWA 512 pixels. |

### assets/icons

| Arquivo | Tamanho | Descrição |
|---|---|---|
| `assets/icons/ajuda.svg` | 875 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/atualizacoes.svg` | 780 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/bloco-de-notas.svg` | 1.0 KB | Ícone SVG autoral do programa/menu. |
| `assets/icons/calculadora.svg` | 1.1 KB | Ícone SVG autoral do programa/menu. |
| `assets/icons/calendario.svg` | 1.2 KB | Ícone SVG autoral do programa/menu. |
| `assets/icons/campo-minado.svg` | 1.1 KB | Ícone SVG autoral do programa/menu. |
| `assets/icons/classiquiz.svg` | 897 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/cobrinha.svg` | 864 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/configuracoes.svg` | 941 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/conquistas.svg` | 1.1 KB | Ícone SVG autoral do programa/menu. |
| `assets/icons/continuar.svg` | 767 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/data-hora.svg` | 960 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/desvio.svg` | 378 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/estatisticas.svg` | 832 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/explorador.svg` | 1.0 KB | Ícone SVG autoral do programa/menu. |
| `assets/icons/f-atalho.svg` | 346 B | Ícone de tipo de arquivo (Explorador). |
| `assets/icons/f-desconhecido.svg` | 388 B | Ícone de tipo de arquivo (Explorador). |
| `assets/icons/f-disco.svg` | 383 B | Ícone de tipo de arquivo (Explorador). |
| `assets/icons/f-img.svg` | 358 B | Ícone de tipo de arquivo (Explorador). |
| `assets/icons/f-pasta-aberta.svg` | 324 B | Ícone de tipo de arquivo (Explorador). |
| `assets/icons/f-pasta-sistema.svg` | 387 B | Ícone de tipo de arquivo (Explorador). |
| `assets/icons/f-pasta.svg` | 341 B | Ícone de tipo de arquivo (Explorador). |
| `assets/icons/f-txt.svg` | 446 B | Ícone de tipo de arquivo (Explorador). |
| `assets/icons/favoritas.svg` | 789 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/jogo-da-velha.svg` | 1.0 KB | Ícone SVG autoral do programa/menu. |
| `assets/icons/lixeira-cheia.svg` | 1.0 KB | Ícone SVG autoral do programa/menu. |
| `assets/icons/lixeira.svg` | 922 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/mais-opcoes.svg` | 894 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/minhas-trilhas.svg` | 958 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/navegador.svg` | 951 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/nova-trilha.svg` | 898 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/outros.svg` | 941 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/paciencia.svg` | 1.1 KB | Ícone SVG autoral do programa/menu. |
| `assets/icons/paint.svg` | 986 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/pong.svg` | 936 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/recompensas.svg` | 814 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/rede-off.svg` | 849 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/rede-on.svg` | 844 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/rede.svg` | 972 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/relogio.svg` | 981 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/reprodutor.svg` | 797 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/segredo.svg` | 748 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/sobre.svg` | 854 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/terminal.svg` | 521 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/ultra.svg` | 854 B | Ícone SVG autoral do programa/menu. |
| `assets/icons/visualizador.svg` | 814 B | Ícone SVG autoral do programa/menu. |

### assets/wallpapers

| Arquivo | Tamanho | Descrição |
|---|---|---|
| `assets/wallpapers/aurora.svg` | 825 B | Papel de parede SVG autoral. |
| `assets/wallpapers/circuito.svg` | 802 B | Papel de parede SVG autoral. |
| `assets/wallpapers/classico.svg` | 1.0 KB | Papel de parede SVG autoral. |
| `assets/wallpapers/grade-verde.svg` | 582 B | Papel de parede SVG autoral. |
| `assets/wallpapers/milharal.svg` | 907 B | Papel de parede SVG autoral. |
| `assets/wallpapers/nuvens.svg` | 637 B | Papel de parede SVG autoral. |
| `assets/wallpapers/por-do-sol.svg` | 649 B | Papel de parede SVG autoral. |
| `assets/wallpapers/vinil.svg` | 659 B | Papel de parede SVG autoral. |

### tools

| Arquivo | Tamanho | Descrição |
|---|---|---|
| `tools/b6-fonte/` | - | Fonte editorial do B6: correções por item (ov-*.js), itens novos (new-std.js) e conteúdo (content.js). |
| `tools/build-b6.js` | 10.9 KB | Gera data-b6.js e os CSV de auditoria a partir do B5 + correções + conteúdo novo. |
| `tools/build.js` | 6.7 KB | Ferramenta de release: gera versão por data, compilação, version.json, build-info.js, asset-manifest.json e carimba o sw.js. |
| `tools/curate-campaigns.js` | 7.1 KB | Gera campaigns-b6.js (curadoria das 3 campanhas). |
| `tools/gerar-inventario.js` | 16.2 KB | Gera este inventário. |
| `tools/loaddata.js` | 576 B | Carrega os bancos no Node com um "window" falso. |
| `tools/make-cursors.py` | 7.9 KB | — |
| `tools/make-icons-v26.js` | 4.2 KB | — |
| `tools/make-icons.js` | 16.3 KB | Gera os ícones e mascotes SVG autorais. |
| `tools/make-wallpapers.js` | 5.4 KB | Gera os papéis de parede SVG autorais. |

### tests

| Arquivo | Tamanho | Descrição |
|---|---|---|
| `tests/b6.test.js` | 14.2 KB | Teste Node do B6/Ultra v2/campanhas/Show (14 941 verificações; 276 Trilhas e 360 Ultras). |
| `tests/bsod-205.test.js` | 2.5 KB | Testa a tela azul por divisão por zero, boot virtual, e preserva a tela azul de System32. |
| `tests/calc-205.test.js` | 3.7 KB | Testa primeira divisão por zero, erro recorrente, operações encadeadas e persistência da Calculadora. |
| `tests/capturas/` | - | 104 capturas PNG reais (Capturas de tela REAIS (Chrome) geradas pelos testes E2E.) |
| `tests/clock-v26.test.js` | 7.7 KB | Versões, relógio, nome do sistema e build. |
| `tests/desvio-207.test.js` | 4.0 KB | Verifica progressão ilimitada até níveis 256/1000 e hierarquia de atalhos. |
| `tests/e2e/01-campanhas.js` | 1.7 KB | Joga as 3 campanhas inteiras. |
| `tests/e2e/02-sistema.js` | 12.8 KB | Área de trabalho, Start, barra, menu de contexto, Configurações, Terminal/UAC, energia. |
| `tests/e2e/03-programas.js` | 14.4 KB | Programas, jogos, Lixeira, Visualizador e regras de tempo das missões. |
| `tests/e2e/04-migracao-mobile.js` | 9.2 KB | Migração de dados antigos, celular/tablet, teclado. |
| `tests/e2e/05-trilhas-ultra.js` | 9.9 KB | Trilha Aleatória B6, seeds, biblioteca, Ultra 1/2/3 corações. |
| `tests/e2e/06-longos.js` | 2.3 KB | Ultra completo e Trilha de 400 (longos). |
| `tests/e2e/07-boot-explorador-energia.js` | 10.6 KB | Boot, Explorador, System32/tela azul, Desligar/Reiniciar, toque prolongado. |
| `tests/e2e/08-capturas.js` | 3.8 KB | Capturas reais de todos os programas + teste de fumaça. |
| `tests/e2e/09-papel-de-parede.js` | 4.6 KB | Papel de parede: presets, ajustes, importação, persistência. |
| `tests/e2e/10-terminal-tentativa.js` | 4.4 KB | Terminal × conquistas × elegibilidade da tentativa. |
| `tests/e2e/11-aceitacao.js` | 20.9 KB | Checklist complementar: barra de tarefas, F12 livre, Campo Minado, Paint, F5 de campanha/investigação, Milhonário com erro, resoluções. |
| `tests/e2e/12-v26nov16.js` | 33.3 KB | E2E: tutorial, data/hora, rede, navegador, Runner e minijogos por toque. |
| `tests/e2e/13-pwa-offline-update.js` | 15.6 KB | E2E: PWA offline e atualização entre duas releases. |
| `tests/e2e/lib.js` | 3.8 KB | Utilitários E2E (Playwright + Chrome real). |
| `tests/e2e/play.js` | 11.4 KB | Resolvedor automático pela interface real de todos os tipos de etapa. |
| `tests/e2e/run-all.js` | 1.2 KB | Executa todas as suítes E2E (opção --longos). |
| `tests/e2e/server.js` | 1.1 KB | Servidor estático local dos testes. |
| `tests/fixtures/legacy-seeds.json` | 60.6 KB | Assinaturas das Trilhas geradas pela v1.2.2 original. |
| `tests/legacy-seeds.test.js` | 1.5 KB | Compara 327 seeds antigas com a v1.2.2 original (357 verificações). |
| `tests/lib/load.js` | 709 B | Carregador de scripts do navegador para os testes Node. |
| `tests/mouse-206.test.js` | 2.2 KB | Valida caminhos absolutos e 180 PNGs/180 SVGs de cursores. |
| `tests/package.json` | 726 B | Dependência de teste (playwright-core) e scripts npm. |
| `tests/runner-v26.test.js` | 7.7 KB | Física e justiça do Runner. |
| `tests/solitaire-v26.test.js` | 3.4 KB | Regras da Paciência. |
| `tests/ttt.test.js` | 2.7 KB | Testes Node das probabilidades, geometria da fraude e algoritmo Minimax perfeito. |
| `tests/v209.test.js` | 4.8 KB | Regressão B7, Minimax X/O, conquistas offline e PWA da versão 2.0.9. |
| `tests/vfs-204.test.js` | 2.7 KB | Testes Node de migração, navegação, arquivos ocultos, exclusões e restauração do disco virtual. |
| `tests/web-v26.test.js` | 5.4 KB | Roteador, busca, XSS e links dos sites. |

### licencas

| Arquivo | Tamanho | Descrição |
|---|---|---|
| `licencas/Liberation-Mono-OFL.txt` | 5.6 KB | Aviso de licença. |

