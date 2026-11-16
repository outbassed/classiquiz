# Manual do ClaQui OS (ClassiQuiz 26nov16)

## Novidades 26nov16 — guia rápido das telas novas

### Versões e compilação
A partir de 26nov16 as versões são **DDmmmAA[.N]**: `26nov16` é a primeira release de 16/11/2026, `26nov16.1` a segunda do mesmo dia, e assim por diante; em outro dia volta a não ter sufixo. A **compilação** (`DDMMAAAA.HHMMSS`) aparece em *Sobre*, *ClaQui Update* e na tela de boot. As datas de publicação/compilação são técnicas e **independentes** do relógio simulado do sistema. As versões antigas (2.0.9 etc.) permanecem no histórico.

### ClaQui Browser
Abra pelo atalho **ClaQui Browser** (canto superior esquerdo da área de trabalho), pelo Start › Internet ou por Mais opções. A barra de endereços aceita `www.buscaja.cqo`, `buscaja.cqo`, `http://…` e variações de maiúsculas; **só existem sites `.cqo`**, que vivem dentro do jogo (nada é acessado na internet real; não há iframes).
- Endereço que não existe → **página 404** com o botão *Voltar ao BuscaJá!*. Nunca redireciona sozinho.
- O campo de **pesquisa do BuscaJá!** procura por nome, descrição, palavras-chave e texto dos sites públicos; sem resultados mostra uma mensagem (não é erro 404). A página inicial mostra **dois destaques** e o botão azul **Mostrar mais** → `www.buscaja.cqo/internet`, o catálogo completo com filtro e categorias.
- Controles: voltar/avançar (Alt+←/→), atualizar/parar (F5/Esc), início, ★ favoritos, 🕘 histórico, Ctrl+L foca o endereço. Favoritos e histórico ficam salvos neste navegador. Em *Configurações de Rede* há “Efeitos rápidos” para desligar a lentidão simulada.
- Sites: BuscaJá!, ClaquiMail (caixa de entrada que guarda lida/excluída/enviadas), BatePapo (salas com robôs), Jogolândia (abre os minijogos e mostra seus recordes), Geocidades (livro de visitas), ClaquiPédia, Tempo Certo (muda com a data do relógio), BaixaTudo, Lojão CQ e Diário do Milharal. Alguns endereços **não estão listados** em lugar nenhum; quem explora acha.

### Rede virtual e Configurações de Rede
O ícone ao lado do relógio abre o painel da **rede do ClaQui OS** (Conectado/Desconectado, Conectar/Desconectar, atalho para as Configurações de Rede). É uma *internet fictícia*: desconectar só faz o navegador exibir a tela cinza de conexão perdida; o jogo, os minijogos e os sites internos continuam funcionando. A escolha persiste ao reiniciar. A **internet real** (ou a falta dela) não liga nem desliga a rede virtual; ela só é usada pelo ClaQui Update.

### Offline Runner (segredo)
Não aparece mais no Start nem em Mais opções. Para jogar: desconecte a rede virtual → abra o ClaQui Browser → toque no rostinho triste. **Celular:** toque na área de jogo para pular, deslize para baixo para abaixar, toque após perder para reiniciar. **PC:** Espaço/↑ pula, ↓ abaixa, P pausa. “⌨ Botões” mostra botões de acessibilidade. Recordes e conquistas (“Sem internet”, “Segredo desconectado”, etc.) são mantidos.

### Data e Hora e o nome do sistema
Clique no relógio (ou Start › Data e Hora). Modo *dispositivo* (padrão) espelha o aparelho; modo *manual* permite escolher dia, mês, ano (1601–9999), hora, minuto e segundo; o relógio continua **andando** a partir do valor escolhido (há opção explícita de congelar). Aba *Fuso horário e formato*: fuso fixo e 12/24 h. O nome visível do sistema usa os dois últimos dígitos do ano: 1999 → **ClaQui 99**, **2000 → ClaQui 2000**, 2003 → ClaQui 03, 2026 → ClaQui 26. Nada disso altera o relógio real do seu aparelho.

### PWA offline e ClaQui Update
Depois de abrir o jogo uma vez com internet, **o jogo inteiro funciona sem internet** (instale pelo navegador ou use direto). O *ClaQui Update* consulta a internet real, mostra versão e compilação, baixa a novidade em segundo plano com progresso verdadeiro e só reinicia quando você clicar em **Atualizar e reiniciar** (ou escolha **Depois**). Se houver Trilha ou minijogo aberto, ele pede confirmação. Saves, conquistas e preferências nunca são apagados; só os caches antigos de arquivos do aplicativo são removidos depois que a nova versão está ativa.

### Tutorial, minijogos e touchpad
*Start › Ajuda e Tutorial* (também em Mais opções e Sobre) repete o assistente “Primeiros passos”. Minijogos funcionam só com toque: Cobrinha (deslizar), Pong e Desvio CQ (arrastar), Jogo da Velha e Paciência (tocar; Paciência também arrasta), Campo Minado (tocar revela; **segurar** coloca/remove bandeira). Os botões de direção ficam ocultos em telas de toque (ative em *Botões na tela* ou em Configurações › Mouse). O **touchpad virtual** (Configurações › Mouse) tem 6 formatos, tamanho, posição (arraste a barra de título), opacidade, sensibilidade, aceleração, botões integrados ou em barra e perfis salvos.

## Novidades 2.0.9: touchpad, menus e PWA

- **Janelas**: programas principais abrem maximizados; use o controle de restaurar para diminuir uma janela. A barra de tarefas continua disponível.
- **Botão direito**: menus específicos por programa, arquivo ou pergunta. Em novas Trilhas **B7**, a opção correta pode aparecer no menu contextual, e não entre as alternativas. No celular, pressione e segure ou use o botão Direito do touchpad virtual.
- **Jogo da Velha**: escolha o X ou O e a preferência por primeiro lance (Aleatório, Jogador, Máquina). Se a máquina usar o modo Ladrão, o símbolo ilegal corresponde ao dela, e a vitória pode ser contestada.
- **Touchpad**: em Configurações → Mouse marque "Ativar touchpad virtual" num dispositivo de toque. Um dedo move o ponteiro, toque clica, dois dedos rolam, botões realizam clique esquerdo/direito e Segurar habilita arraste. É desativado por padrão.
- **Instalar PWA**: use a versão servida por HTTPS (por exemplo, após publicar na Vercel). O navegador pode oferecer "Instalar app" ou "Adicionar à tela inicial". O ClassiQuiz principal exige internet.
- **Sem conexão**: depois da primeira visita online, uma pequena tela offline passa a estar disponível. Um globo e o ícone cinza triste aparecem; toque em "Tentar novamente" para voltar. Ao clicar no ícone triste, abre o **Offline Runner**, também acessível em Start / Mais opções. Somente a tela e o Runner são armazenados para uso offline.
- **ClaQui Update**: abra pelo Start ou Mais opções. "Procurar atualizações" consulta `version.json`; se houver uma versão nova, a página pergunta antes de recarregar. Esta ferramenta não substitui os arquivos do pacote local de Windows.
- **Conquistas**: "Sem internet" por abrir a tela offline, "Segredo desconectado" por descobrir o Runner offline, e cinco metas de pontuação/obstáculos/tempo para o Runner. Todas usam o armazenamento local do mesmo navegador e origem.

> **UM CLÁSSICO QUE NUNCA EXISTIU.** O ClaQui OS é um sistema operacional **de mentirinha** que roda dentro do navegador. Tudo o que ele "apaga", "desliga" ou "reinicia" é **simulação** sobre arquivos **virtuais**; o seu computador de verdade nunca é tocado.

## 1. Como abrir
1. Extraia o ZIP inteiro. 2. Dê dois cliques em `INICIAR-CLASSIQUIZ.bat` (usa PowerShell, depois Python, depois Node; por fim abre o `index.html` direto). 3. Mantenha a janela do inicializador aberta enquanto joga.
Sem internet obrigatória, sem login, sem telemetria. Use sempre o **mesmo navegador e o mesmo endereço** (`http://127.0.0.1:8765/`): o progresso fica no `localStorage`/IndexedDB desse endereço.

## 2. Primeira execução e retorno
- **1ª vez**: tela de inicialização com progresso, depois boas-vindas do **Claquim** ("Seu sistema está pronto") e o botão para entrar.
- **Depois**: inicialização curta ("Bem-vindo de volta"). Reiniciar/Desligar (menu Iniciar) usam a mesma volta curta.

## 3. Área de trabalho e Mais opções
| Atalho | O que abre |
|---|---|
| **Jogar** | ClassiQuiz 1, 2 e 3 ou Trilha Aleatória; carregar seed |
| **Continuar** | Retomar partida em andamento |
| **Minhas Trilhas** | Biblioteca de seeds, importar/exportar e favoritar |
| **Conquistas** | Metas e troféus do jogador |
| **Configurações** | Interface, papéis de parede, mouse, som, preferências |
| **Recompensas** | Loja de itens cosméticos e Fichas Classi |
| **Sobre** | Informações sobre o projeto |
| **Mais opções** | Acesso direto a Favoritas, Atualizações, Estatísticas, Explorador e todos os programas |
| **Ultra ClassiQuiz** (isolado à direita) | Desafio Ultra |

**Mais opções** contém Favoritas, Atualizações, Conquistas, Estatísticas, Recompensas, Explorador de Arquivos, Bloco de Notas, Paint, Calculadora, Campo Minado, Jogo da Velha, Cobrinha, **Desvio CQ**, Pong, Calendário, Relógio, Visualizador, Reprodutor e Lixeira. A pasta antiga **Outros** foi removida. O Terminal continua **somente no menu Iniciar**.

## 4. Janelas, barra de tarefas e menu
- Cada programa abre em sua janela (a maioria maximizada); minimize, restaure, maximize e feche pelos botões da barra de título.
- A **barra de tarefas** mostra uma faixa de botões por janela. Com muitas janelas, **só essa faixa rola na horizontal**; Start, ícone e relógio ficam fixos.
- **Menu Iniciar**: todos os programas, **Terminal**, Desligar e Reiniciar. Esc fecha.
- **Menu de contexto do ClaQui OS**: botão direito. **Ctrl + botão direito** abre o menu nativo do navegador. No celular: **toque prolongado (~600 ms)**; mover o dedo cancela.
- Fechar um programa com alterações pede confirmação (Salvar / Não salvar / Cancelar). Desligar e Reiniciar listam documentos não salvos.

## 5. Configurações
- **Exibição**: tamanho da interface **100 / 125 / 150 / 175 %** (em telas estreitas o sistema limita a escala para nada ficar cortado) e "Restaurar padrão".
- **Personalização**: 8 papéis de parede autorais; **Importar imagem…** (PNG/JPG/WebP/GIF até 8 MB) mostra **prévia**; escolha o ajuste (**Preencher, Ajustar, Esticar, Repetir**) e clique **Aplicar**; **Restaurar fundo original** volta ao padrão. O fundo importado fica só no seu navegador. Também: tema, cursor e estilo de ícones (itens extras vêm da Loja).
- **Som e animação**: som liga/desliga, volume, "Reduzir movimento" (segue o sistema por padrão).
- **Conquistas**: mostra se estão ativas ou desativadas e oferece **Resetar conquistas**.

## 6. Explorador de Arquivos e Lixeira (virtuais)
Navegue por `C:\ClaQui\…` e `C:\Windows\…`; crie arquivo/pasta, renomeie, exclua (vai para a Lixeira), busque, mostre ocultos, alterne lista/grade. A **Lixeira** restaura ou exclui definitivamente (do sistema virtual).
**System32 (simulação)**: excluir `C:\Windows\System32` mostra um aviso, depois uma **tela azul fictícia de 10 segundos** e o sistema se **restaura sozinho** (janelas fechadas, pasta de volta). Nada real é alterado. (Conquista secreta "Tela Azul de Mentira".)

### Calculadora: divisão por zero (2.0.6)
A primeira operação de divisão por zero (`10 ÷ 0`, `0 ÷ 0`, etc.) provoca o **crash fictício DIVIDE_BY_ZERO** por 8 segundos, fecha as janelas virtuais e executa a inicialização breve do ClaQui OS. **Da segunda vez em diante**, o resultado é sorteado: 50% de tela azul simulada e 50% de erro matemático na calculadora, sem reinicializar. Isso também ocorre se, após o `0`, o jogador apertar um operador em vez de `=`. O primeiro erro fica lembrado no armazenamento local, inclusive após F5 e reabertura do jogo. O progresso das Trilhas é preservado; o Windows real não é afetado. A tela azul conta para a conquista secreta já existente "Tela Azul de Mentira".

## 7. Terminal, permissão e conquistas
1. O Terminal **só** existe no **menu Iniciar** (não há atalho, não aparece em Mais opções, e **não abre durante o Ultra**; nenhum enigma, missão ou minigame usa o Terminal como pista, requisito ou caminho de solução).
2. Na **primeira** abertura aparece um **Controle de Conta do ClaQui OS** (fictício). O foco inicial é **Não** (Esc/× também recusam). **Sim** abre o Terminal e grava "aviso já aceito" neste dispositivo: depois disso o aviso **nunca mais volta**, nem após um reset.
3. Com **Sim**, as **conquistas ficam desativadas de forma persistente** (continuam assim após fechar o Terminal e recarregar a página) até você usar **Resetar conquistas**. Abrir o Terminal de novo depois do reset bloqueia as conquistas outra vez (sem repetir o aviso) (Configurações → Conquistas, ou `RESETAR` no Terminal). O reset pede confirmação e **preserva** estatísticas gerais, recordes, favoritas, Trilhas e preferências; apaga as conquistas desbloqueadas.
4. A **tentativa em que o Terminal foi usado continua inelegível** (sem conquistas, Fichas ou recordes) mesmo depois do reset; uma **nova tentativa limpa** volta a valer.
5. Comandos (`HELP`): `STATUS`, `NEXT`, `PREV`, `GOTO n`, `ANSWER`, `HEARTS n`, `FREEZE`, `SOLVE`, `RESETAR`, `EXIT`, `CLS`, `RESTART`, `SOUND`, `DIAG`, `DESKTOP`.
As ferramentas do navegador (F12) continuam livres: o jogo não as bloqueia nem as detecta.

## 8. Modos de jogo
- **ClassiQuiz 1, 2 e 3**: edições oficiais de **50 posições fixas**, híbridas (jogáveis com mouse **ou** toque), sem repetir perguntas entre as três. Cada edição traz história, missões de programa, pegadinhas, minijogos e o Show do Milhozão.
- **Trilha Aleatória** (banco **B6**): 25, 50, 75, 100, 150, 200 ou 400 posições (conforme o dispositivo: mouse, toque ou ambos). A ordem sai de uma **seed** e se repete ao reiniciar. Seeds antigas (B1–B5) continuam idênticas.
- **Ultra ClassiQuiz**: todas as posições elegíveis do seu perfil misturadas por seed, com **1, 2 ou 3 corações desde a questão 1** (sem ganhar corações no caminho). **Só com 1 coração** valem as conquistas do Ultra; com 2 ou 3 o aviso "bloqueadas" aparece antes de começar.
- **Corações**: Trilhas normais recebem corações extras a cada 25 posições; edições oficiais seguem a mesma regra.

### Show do Milhozão
Um bloco **fechado** de **10 rodadas** (apresentado pelo **Milhito**): dificuldade **1 → 10 somente dentro do show**, perguntas fixas pela seed, sem etapas puladas no meio e sem sobreposição com histórias. Começa em janelas por tamanho (50: posições 12–25, 75: 16–46, 100: 21–66, 150: 31–111, 200: 41–151, 400: 81–301); a Trilha de 25 não tem Show. A conquista **Milhonário** exige acertar as **10 rodadas sem nenhum erro**.

### Histórias e investigações
Sequências de **4 a 7 etapas** consecutivas (por exemplo, a clássica história do tijolo no avião, com 6 perguntas seguidas). As **investigações** montam uma **pasta do caso** com arquivos virtuais somente leitura: use **Abrir pasta do caso** (ou o Explorador em `C:\ClaQui\Arquivos de jogo\Casos\…`) e leia os arquivos para responder.

### Missões de programa
Etapas que pedem uma tarefa real num programa do ClaQui OS:
- **Bloco de Notas**: escreva o texto pedido e **salve**. A comparação **ignora maiúsculas, acentos e espaços repetidos**.
- **Calculadora**: o resultado precisa vir de uma conta feita na calculadora (com ao menos uma operação).
- **Paint**: o desenho abre pronto; preencha a forma com o **balde** na cor pedida (cobertura mínima indicada).
- **Explorador**: encontre e abra o arquivo certo (arquivos ocultos podem estar em *Exibir → Mostrar arquivos ocultos*).
- **Lixeira**: restaure o documento certo.
- **Visualizador**: abra a imagem, observe e responda a informação pedida.
- **Manter aberto 10 s / 20 s**: o relógio só conta com a janela **aberta e visível**; **minimizar pausa**; **fechar zera**; abrir **outro programa não conta**; **vencer o jogo não é necessário**.

### Pegadinhas e minijogos
Mantidos da v1.2.2 (arrastar, encontrar a resposta na interface, esperar 20 s, 60 cliques — atenção à isca "Finalizar agora" —, salvar enganoso etc.).

## 9. Conquistas, estatísticas e Fichas
- **52 conquistas** em 7 grupos (Trilhas, Erros/derrotas, Habilidade e missões, Jogos de Mais opções, Secretas, Ultra, Show). Lista completa no app **Conquistas**.
- **Estatísticas**: acertos, erros, derrotas, vitórias etc. e recordes (Trilha, ClassiQuiz 1/2/3, Ultra por perfil/corações/tamanho). As estatísticas gerais continuam contando mesmo numa tentativa de teste; **recordes, Fichas e conquistas, não**.
- **Fichas Classi** (loja em **Recompensas**): ganhas por acertos, vitórias e conquistas **em tentativas limpas**; compram só itens **cosméticos**.
- As conquistas dos jogos de Mais opções valem fora de partidas, mas **não** durante o Ultra, com o Terminal desativando conquistas, nem em tentativa de teste.

## 10. Dados, backup e migração
- Tudo fica no navegador: `localStorage` (`classiquiz.v1.*`) e IndexedDB (arquivos virtuais, fundo importado).
- Na primeira abertura da v2.0.4 a migração (schema 2) cria o backup lógico `classiquiz.v1.backup.pre-v2` e **não altera** os dados antigos; é segura para repetir.
- **Exportar biblioteca** gera `classiquiz-geracoes.json` (importável em outro navegador; seeds inválidas são ignoradas e campanhas não são guardadas na biblioteca).
- Limpar os dados do site apaga o progresso. Faça backup pela exportação.

## 11. Acessibilidade e dispositivos
Teclado (Tab, Enter, Esc, Delete/F2 no Explorador), foco visível, `aria-live` nos status e nas missões, escala de interface, redução de movimento. Testado em 1280×800, 768×1024 (tablet), 375×812 e 320×568 (celular) sem rolagem horizontal da página.

## 12. Solução de problemas
- **Tela em branco**: abra pelo `INICIAR-CLASSIQUIZ.bat` (não por outro endereço) e use um navegador atual (Chrome/Edge/Firefox recentes).
- **Perdi o progresso**: confira se está no mesmo navegador e endereço; veja `classiquiz.v1.backup.pre-v2` nos dados do site.
- **Conquistas desativadas**: você aceitou o Terminal; use *Configurações → Conquistas → Resetar conquistas*.
- **Fundo importado não aparece**: clique em **Aplicar** depois de importar.

### Jogo da Velha (v2.0.4)
A cada partida o computador sorteia uma estratégia sem exibi-la. Com zero vitórias são sorteadas apenas Fácil, Médio e Difícil, com chances iguais. Após a primeira vitória do jogador, os quatro modos (inclusive Ladrão) têm 25% de chance cada. O botão **Resetar** (confirmação) apaga somente o placar do Jogo da Velha e reinicia essa escolha. O placar passa a persistir no navegador. Na migração, as vitórias antigas registradas nas conquistas são aproveitadas quando disponíveis; derrotas e empates antigos não estavam salvos.

Uma derrota incomum pode incluir um O colocado **fora do tabuleiro**. Clique nessa peça para contestar o resultado: a vitória do computador é anulada e o computador perde a vez; não pode repetir a fraude na mesma partida. A conquista secreta obtida pela ocorrência permanece mesmo após o reset do placar. O modo Ladrão só é sorteado depois que o placar registra pelo menos uma vitória.

### Navegação do sistema de arquivos (2.0.4)

- **Meu Dispositivo**: tela inicial do Explorador, não é uma pasta do disco.
- **Disco Local CQ:**: unidade virtual. Seu identificador interno é `C:\` para manter as saves e seeds compatíveis.
- **ClaQui**: pasta do sistema operacional fictício. Inclui `System32`, `Drivers`, `Fontes`, `Temas`, `Media`, `Inicialização`, `Temp`, `Programas`, `Registros` e `Config`.
- A exclusão de pastas internas causa apenas simulações temporárias, sem tocar o Windows real; o ClaQui OS se recupera automaticamente.
- Missões existentes agora podem solicitar que você procure um arquivo oculto ou leia uma informação nos registros do sistema.
- Documentos, imagens e arquivos salvos são mantidos na unidade virtual ao atualizar.

## Recursos recentes (2.0.6 a 2.0.7)
- **Mouse:** Configurações → Mouse; quatro esquemas e quinze funções de ponteiro. Tamanho, rastro e personalização individual, apenas dentro do ClaQui OS.
- **Cobrinha:** ativar/desativar colisão com as paredes; quando desativada, a cobra reaparece na borda oposta. Colisão com o próprio corpo continua.
- **Desvio CQ:** Mais opções → Desvio CQ. Arcade original com dez níveis de 20 segundos: desvie dos blocos, colete bônus e alcance o maior recorde. Três vidas e controles por setas/WASD ou botões no celular. Substitui o jogo de labirinto retirado, sem usar assets de Pac-Man.
- **Calculadora:** 1ª divisão por zero sempre provoca tela azul falsa. Da 2ª em diante há 50% de chance de tela azul e 50% de exibir erro matemático.
- **Trilha Aleatória:** o botão Continuar aparece somente na página inicial de escolha dos quatro modos.
- **Conquistas:** novas metas para Cobrinha e Desvio CQ. O Terminal conserva as restrições habituais.
- **Testes:** Node executado com sucesso. A suíte E2E completa da 2.0.7 ainda não foi executada.

## 2.0.8 — Mouse, Iniciar e Desvio CQ
- Em **Configurações → Mouse**, selecione um dos quatro esquemas, tamanho e papel individual. As opções refletem na hora no jogo; a área de teste permite verificar normal, mãozinha, texto e ocupado. Arquivos PNG são a primeira opção, com SVG de fallback. Não altera o ponteiro do Windows fora do navegador.
- O **Menu Iniciar** tem rolagem vertical na lista de todos os programas, por categoria. Desligar e Reiniciar permanecem visíveis no rodapé. No Ultra, Terminal não é exibido.
- **Desvio CQ** avança automaticamente a cada 20 segundos por níveis consecutivos, sem encerrar no 10. O melhor nível e a melhor pontuação ficam salvos; a partida acaba ao perder todas as vidas.
