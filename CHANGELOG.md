# CHANGELOG — ClassiQuiz × ClaQui OS

## 2.0.8 — 15/11/2026 — "Mouse corrigido, Start rolável e Desvio sem fim"
- **Mouse de verdade:** corrigido o erro de caminho relativo que fazia o CSS procurar cursores na pasta errada. URLs agora são absolutas, resolvidas a partir do HTML. Acrescentados 180 PNGs compatíveis com o Chrome, com fallback para os 180 SVGs existentes. Mudanças de esquema, tamanho e papel individual continuam sendo aplicadas sem reiniciar. Incluída área de teste para Normal, Link, Texto e Ocupado nas Configurações.
- **Menu Iniciar:** rolagem vertical restrita à lista de programas, grupos Principal/Jogos/Acessórios/Sistema, todos os aplicativos acessíveis, novos apps incorporados automaticamente; ações Desligar e Reiniciar ficam fixas no rodapé. O Terminal permanece exclusivo do menu Iniciar e não aparece no Ultra.
- **Desvio CQ:** removido o limite de 10 níveis e a vitória artificial; a partida termina por perda de vidas ou decisão do jogador. Pontuação máxima e maior nível salvos. Dificuldade cresce até um teto jogável, evitando obstáculos com velocidade descontrolada em níveis altos. Níveis 25, 50, 100, 256 e 1000 testados por simulação determinística.
- **Conquistas:** a conquista existente `g_desvio_win` agora exige atingir o nível 25 e preserva qualquer desbloqueio anterior; novas metas para 50 e 100. As conquistas já ganhas nunca são removidas.
- **Compatibilidade:** banco B6 (14.941 verificações), 357 seeds antigas, Jogo da Velha, VFS, Calculadora e BSOD passaram nos testes. Teste isolado de CSS em Chromium confirmou aplicação dos cursores em elementos normais e de link; a interface completa não pôde ser aberta pelo navegador automatizado devido a bloqueio de rede local.

## 2.0.7 — 15/11/2026 — "Desktop organizado e Desvio CQ"
- **Desktop:** Favoritas foi substituído por Conquistas; Atualizações foi substituído por Recompensas. Oito atalhos centrais e Ultra separado.
- **Mais opções:** Favoritas, Atualizações, Estatísticas e todos os programas de Outros estão diretamente no mesmo painel, sem pasta intermediária. O Terminal continua só no menu Iniciar.
- **Desvio CQ:** novo arcade original de obstáculos, escudo, lentidão, recorde local e dez níveis; controla-se por teclado ou botões de toque. Substitui Pac-Man CQ. Script, ícone e CSS antigo removidos do projeto.
- **Conquistas:** seis novas metas do Desvio CQ substituem as do jogo excluído. Outras conquistas/saves permanecem; a contagem mostra apenas conquistas atuais.
- **Regressão:** testes Node executados, 357 seeds antigas preservadas. E2E ajustado à nova organização, não executado nesta versão.

## 2.0.6 — 15/11/2026 — "Mouse e arcade"
- **Mouse:** nova guia Mouse nas Configurações. 15 funções de ponteiro configuráveis individualmente (normal, ajuda, trabalhando, ocupado, precisão, texto, escrita manual, indisponível, quatro redimensionamentos, mover, seleção alternativa e link). Quatro esquemas originais: Clássico 95/98, XP, Aero e ClaQui. Tamanhos 24/32/40 px, prévia por tipo, rastro opcional, restauração de padrão e persistência local. Não altera cursor do Windows real. SVGs exclusivos produzidos para este jogo, sem copiar arquivos do Windows.
- **Calculadora:** divisão por zero provoca tela azul fictícia na primeira vez (100%); nas tentativas seguintes há 50% de probabilidade de tela azul e 50% de erro na calculadora, com sorteio independente. A primeira ocorrência continua gravada no armazenamento local.
- **Jogar:** botão Continuar só aparece na seleção dos quatro modos, não na subpágina de tamanho da Trilha Aleatória.
- **Cobrinha:** controle de colisão nas paredes, padrão ligado. Desligado, atravessa bordas e retorna pelo lado oposto. Colisão com o próprio corpo permanece. Preferência salva localmente.
- **Pac-Man CQ:** novo jogo retrô dentro de Outros, labirinto, quatro fantasmas de IA distinta (Blinky/Pinky/Inky/Clyde em funções análogas à mecânica clássica), perseguição/dispersão, superbolinhas, frutas, túneis, 3 vidas, 5 níveis concluíveis, recorde local, pausas, controles teclado e toque; gráficos e labirinto originais.
- **Conquistas:** nove metas novas por Cobrinha e Pac-Man CQ. Restrições existentes (Terminal/Ultra/teste) preservadas.
- **Verificações:** testes de regressão dos bancos B6/B1–B5, sementes antigas, Jogo da Velha, arquivos virtuais, calculadora e novo grafo do labirinto; E2E visual bloqueado pela política de rede local do Chromium no ambiente de testes.

## 2.0.5 — 15/11/2026 — "Dividir por zero"
- **Calculadora:** tentar `10 ÷ 0`, `0 ÷ 0` ou qualquer outra divisão por zero ativa **uma única vez** a tela azul fictícia `DIVIDE_BY_ZERO` (8 segundos), seguida de inicialização curta do ClaQui OS. O Windows real não é afetado.
- **A partir da segunda tentativa**, a calculadora mostra **"Erro fatal de matemática: não é possível dividir por zero."**, com realce e efeito visual breve, sem tela azul e sem fechar programas.
- O histórico de ocorrência é guardado localmente na chave `classiquiz.v1.calc.divideZeroSeen`, sobrevivendo a fechamentos e F5, sem alterar placares, conquistas ou seeds. O sistema registra o evento `calc:divide-zero` para futuras missões e a primeira tela azul conta para a conquista **"Tela Azul de Mentira"** já existente.
- Detecção também quando o usuário continua a operação com `+`, `−`, `×` ou `÷` sem apertar `=`. Divisões válidas e missões da Calculadora continuam funcionando.
- **System32:** o crash `SYSTEM32_NOT_FOUND` de 10 segundos continua independente, preservado. O progresso do quiz é salvo antes de qualquer tela azul simulada.
- **Testes:** novos `calc-205.test.js` e `bsod-205.test.js`; testes do banco, seeds antigas, IA e arquivos virtuais mantidos. O teste E2E visual em Chromium foi impedido pela política do ambiente e não foi considerado aprovado.

## 2.0.4 — 15/11/2026 — "Jogar e Meu Dispositivo"
- Navegação corrigida: **Meu Dispositivo** (nível superior) → **Disco Local CQ:** → **ClaQui** → **System32**; caminhos internos permanecem no disco virtual `C:\`.
- Pastas simuladas **Drivers, Fontes, Temas, Media, Inicialização, Temp, Programas, Registros e Config**, com arquivos fictícios e efeitos temporários ao excluir as pastas internas. As pastas se recuperam automaticamente sem afetar o computador real, progresso ou conquistas.
- Simulações de cursor, fontes, tema, som e atalhos. Exclusão de Inicialização altera apenas o próximo boot fictício; Temp apenas limpa dados virtuais.
- Dois desafios do banco B6 agora aproveitam **Config** (arquivo oculto) e **Registros** (ler documento, descobrir código e responder no quiz). Identificadores e ordem das seeds antigos são preservados.
- A mensagem de exclusão não revela a reação do sistema; a explicação do aviso interno limita-se à simulação e à segurança dos arquivos reais.
- Migração de caminhos do VFS com compatibilidade para o conteúdo das versões 2.0.1–2.0.3.


- Área de trabalho: atalho `ClassiQuiz` renomeado para **Jogar**, sem alterar o nome oficial do jogo.
- Seleção de modos em grade 2×2: **ClassiQuiz Aleatório**, **ClassiQuiz 1**, **2** e **3**. Card aleatório abre seleção de tamanho com botão iniciar no topo; responsivo.
- Jogo da Velha: três modos antes da primeira vitória; após uma vitória, quatro modos com 25% cada, incluindo **Ladrão**. A conquista secreta e o botão Resetar permanecem.
- Explorador: `C:\Meu Dispositivo` acima de `C:\Meu Dispositivo\ClaQui`, com `System32` dentro. Migração dos caminhos persistidos e compatibilidade de seeds antigas.
- Exclusão da System32: confirmação e LEIAME-SISTEMA.txt explicam apenas que os arquivos são fictícios, sem antecipar surpresas. O funcionamento interno é preservado.

## 2.0.1 — 15/11/2026 — "O computador tem quatro modos"

- **Jogo da Velha:** modo sorteado a cada nova partida, oculto para o jogador. Com zero vitórias, chances iguais (25% cada) para Fácil, Médio, Difícil e Ladrão. A partir da primeira vitória registrada, Ladrão deixa de ser sorteado e os três modos tradicionais têm chances iguais (~33,3% cada).
- **Fácil** varia respostas e erra; **Médio** busca vitórias, bloqueios e garfos com pequenas falhas; **Difícil** usa Minimax perfeito e desempates variados.
- **Ladrão:** quando dois O adjacentes permitem uma terceira peça **fora dos limites** e o bot está na vez, pode encerrar falsamente uma partida estendendo linhas horizontais, verticais ou diagonais. A peça ilegal é interativa: clicar nela permite **Contestar resultado**, anulando a vitória fraudulenta e perdendo a vez do computador. Se a partida não oferecer essa configuração, o bot segue jogando normalmente. A chance de **ser sorteado** é 25% por partida com zero vitórias, não uma garantia de roubo.
- **Conquista secreta** “Fui roubado!” por sofrer uma derrota fraudulenta, respeitando os bloqueios de conquistas (Terminal, Ultra, teste). A conquista não é apagada pelo reset de placar.
- **Resetar**, ao lado de “Nova partida”, zera vitórias, derrotas e empates com confirmação, restaura a possibilidade de Ladrão e inicia uma nova partida. **Placar salvo localmente** a partir desta versão; a v2.0.0 guardava em estatísticas apenas as vitórias elegíveis a conquistas, que são recuperadas quando disponíveis; derrotas e empates anteriores não são recuperáveis.
- Sem mudanças nas perguntas, bancos, seeds, campanhas, conquistas antigas ou arquivos virtuais.

## 2.0.0 — 15/11/2026 — "ClaQui OS"

O ClassiQuiz agora é um jogo **dentro do ClaQui OS**, um sistema operacional **fictício** que roda no navegador.
Slogan: **UM CLÁSSICO QUE NUNCA EXISTIU**. Continua 100 % local: sem servidor pago, sem login, sem telemetria, sem anúncios e sem internet obrigatória.

> Regra de segurança do projeto: o ClaQui OS só toca em arquivos **virtuais** (IndexedDB do navegador). System32, Desligar e Reiniciar são **simulações**. As ferramentas do navegador (F12) não são bloqueadas nem detectadas.

### Novo — sistema (ClaQui OS)
- **Área de trabalho**: 8 atalhos (ClassiQuiz, Continuar, Minhas Trilhas, Favoritas, Configurações, Atualizações, Sobre, Mais opções) + **Ultra ClassiQuiz** separado, à direita. Duplo clique em atalho não dispara mais o botão que ficaria sob o cursor da janela recém-aberta.
- **Mais opções** (Conquistas, Estatísticas, Recompensas, Explorador de Arquivos, **Outros**) e **Outros** (Bloco de Notas, Paint, Calculadora, Campo Minado, Jogo da Velha, Cobrinha, Pong, Calendário, Relógio, Visualizador, Reprodutor, Lixeira).
- **Menu Iniciar** com todos os programas, **Terminal (somente aqui)**, Desligar e Reiniciar.
- **Gerenciador de janelas**: várias janelas, minimizar/restaurar/maximizar, foco, barra de tarefas com **rolagem horizontal só na faixa de programas** (Start e relógio ficam fixos).
- **Menu de contexto próprio**: botão direito; **Ctrl + botão direito** abre o menu nativo do navegador; **toque prolongado (~600 ms)** no celular (mover o dedo cancela).
- **Boot**: primeira execução completa (progresso + boas-vindas com Claquim) × retorno curto; Desligar e Reiniciar simulados (com aviso de documentos não salvos).
- **Configurações**: tamanho da interface (100/125/150/175 %, limitado em telas estreitas), papéis de parede (8 presets autorais + importação PNG/JPG/WebP/GIF com **prévia**, ajuste *preencher/ajustar/esticar/repetir* e **restaurar**), som/volume/movimento reduzido, estado das conquistas.
- **Explorador de Arquivos virtual** (criar, renomear, excluir → Lixeira, restaurar, buscar, ocultos, lista/grade). Excluir a pasta fictícia **C:\Windows\System32** mostra uma **tela azul de mentira por 10 s** (relógio monotônico) e restaura tudo sozinho.
- **Terminal com aviso de permissão (UAC fictício)** só na 1ª abertura (depois do 1º Sim nunca volta, nem após o reset): foco inicial em **Não**; **Sim** desativa as conquistas **de forma persistente** até **Resetar conquistas** (confirmado; preserva estatísticas, recordes, favoritas, preferências). A tentativa em que o Terminal foi usado **nunca** vira elegível retroativamente. O Terminal não abre durante o Ultra e nenhum enigma/missão/minigame o usa como pista.
- **28 programas registrados**; ícones SVG autorais (nenhum asset de terceiros), mascotes **Claquim** e **Milhito**.

### Novo — jogo
- **Banco B6** (B1–B5 permanecem imutáveis): **363** perguntas, 30 estendidas, 40 pegadinhas, 35 minijogos, **24 histórias/investigações** (121 passos, 4–7 etapas cada), **21 missões** de programa e **60 itens do Show do Milhozão**. Revisão item a item dos 534 itens do B5 com anti-vazamento de resposta, sem alternativas de piada nem "Opção A" genérica → `AUDITORIA-QUESTOES.csv` (534 linhas: 289 mantidas, 150 ajustadas, 64 reescritas, 31 removidas) e `NOVOS-ITENS-B6.csv`.
- **Trilha Aleatória** agora usa o B6 (25 a 400 posições conforme o perfil de controle). Seeds antigas `CQ1-B1…B5` e `CQU1-B5` continuam gerando **exatamente** as mesmas Trilhas (357 conferidas contra a v1.2.2).
- **Campanhas ClassiQuiz 1, 2 e 3**: exatamente **50 posições fixas e curadas** cada (1 pulada por regra de memória), **híbridas** (sem desafio exclusivo de mouse/toque), sem repetição entre as três; cada uma com sua história, missões, pegadinhas, minijogos, Show do Milhozão e questões de dificuldade crescente. Seeds `CQC1/2/3-B6-U-50-CLASSIQUIZn`. Novo perfil **U** (universal) — sempre compatível.
- **Show do Milhozão** (apresentador **Milhito**): bloco fechado de 10 rodadas com dificuldade 1→10 só dentro do show, seed fixa, janelas de início por tamanho (50:[12,25], 75:[16,46], 100:[21,66], 150:[31,111], 200:[41,151], 400:[81,301]; 25 não tem), sem sobreposição com histórias. Uma única conquista: **Milhonário** (10/10 sem errar).
- **Missões de programa**: Bloco de Notas (texto salvo), Paint (balde), Calculadora (resultado de uma conta feita de verdade), Explorador (achar arquivo), Lixeira (restaurar), Visualizador (informação da imagem) e **manter aberto 10/20 s** — fechar **zera**, minimizar **pausa**, outro programa **não conta**, vencer **não é necessário**.
- **Investigações com pasta do caso** (arquivos virtuais somente leitura montados em `C:\ClaQui\Arquivos de jogo\Casos\…` + botão "Abrir pasta do caso").
- **Ultra v2** (B6, `CQU2-B6-…`): 1/2/3 corações desde a questão 1; só **1 coração** libera as conquistas do Ultra. Ultra v1 (`CQU1-B5-…`) segue abrindo.
- **Fichas Classi** + **Loja cosmética** (papéis de parede, temas, cursores, estilo de ícones — nenhuma vantagem no jogo; só ganham em tentativas limpas).
- **52 conquistas** (eram 42): + Mão na Massa, Funcionário do Mês, Edição de Colecionador, Trilogia Completa, Milhonário, 4 de jogos (Velha de Verdade, Campo Limpo, Cobrinha Faminta, Rei da Quadra) etc.

### Migração e compatibilidade
- Migração **idempotente** de `localStorage` (`classiquiz.v1.*` → schema 2) com **backup lógico** `classiquiz.v1.backup.pre-v2`; biblioteca, favoritas, nomes, recordes, Fichas, conquistas, estatísticas e preferências (inclusive chaves desconhecidas) preservados; recarregar n vezes não altera nada.
- Mantidos: Ultra, perfis T/M/H, exportar/importar biblioteca (agora rejeita seeds inválidas e não guarda campanhas), sessão retomável.

### Corrigido durante os testes reais (Chrome)
- Foco inicial do UAC caía em **Sim** (o `autofocus` do **Não** era ignorado).
- A pegadinha "Propriedades" do menu de contexto não concluía (o novo menu não chamava a regra do jogo).
- Papel de parede **importado** voltava ao padrão após recarregar (aplicado antes de o banco virtual abrir).
- Campanhas com perfil H apareciam "incompatíveis" em desktops só com mouse → perfil universal **U**.
- Explorador ignorava a pasta inicial pedida e a lista tinha ícones desalinhados.
- Duplicatas entre itens novos do B6/Show e o B5; vazamentos de resposta em `b5-q-017`, `b5-q-043`; alternativa de piada em `b5-q-021`.

### Ferramentas e testes
- `tools/` — geração reprodutível do B6 e das campanhas (`build-b6.js`, `curate-campaigns.js`; saída idêntica byte a byte), ícones e papéis de parede.
- `tests/` — 2 suítes Node (14 941 + 357 verificações; 276 seeds de Trilha e **360 seeds de Ultra**) e 10 suítes **E2E em Chrome real** (Playwright, 432 verificações) + 2 suítes longas opcionais (Ultra completo de 629 posições e Trilha de 400) + ~100 capturas reais. Detalhes, comandos e limites em `RELATORIO-TESTES.md`.
- Itens do B6 vindos do B5 mantêm o `addedMonth` original; os 214 ajustados/reescritos recebem `revisedMonth`.

### Pendente / não implementado nesta versão
- **Paciência** (jogo opcional da pasta Outros): **não** implementado.
- O Reprodutor toca 3 trilhas originais sintetizadas pelo próprio navegador (não abre arquivos de áudio do usuário).

## 1.2.2 — 11/2026
Versão anterior (base desta entrega): bancos B1–B5, Ultra, 42 conquistas, desktop retrô.
