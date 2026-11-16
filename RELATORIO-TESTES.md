# Relatório de testes — release 26nov16

> Ambiente desta entrega: container Linux, Node 22, Chromium 1243 do Playwright (headless, `--no-sandbox`), sem celular físico. Tudo abaixo foi **realmente executado**; o que não foi testado está listado em "Não testado / pendências". Os resultados e as datas de execução estão na descrição do PR.

## Testes de Node (`cd tests && npm run test:node`)
| Suíte | O que cobre |
|---|---|
| `b6`, `legacy-seeds`, `ttt`, `vfs-204`, `calc-205`, `bsod-205`, `desvio-207`, `mouse-206`, `v209` | Regressão herdada: bancos B1–B7, 357 seeds antigas idênticas, 630 seeds B7, Jogo da Velha (Minimax X/O e Ladrão), arquivos virtuais, calculadora, tela azul, Desvio CQ, mouse. (`bsod-205` e `v209` tiveram asserções atualizadas: nome dinâmico do sistema; SW agora faz pré-cache total.) |
| `clock-v26` (novo) | Comparador de versões (legado × data, `.1/.2/.10`, virada de ano), nome do sistema (1998/1999/2000/2001/2003/2026/2050…), relógio manual que anda/congela, ida e volta de fusos, limites e anos bissextos, 12/24 h, persistência, `tools/build.js` (versão do dia, sufixos, fuso de São Paulo, build único) e coerência `version.json` × `asset-manifest.json` × `sw.js`. |
| `runner-v26` (novo) | Pulo ≥ 100 un., aceleração, intervalo entre obstáculos maior que o salto, **mesma partida a 30/45/60/90/120/144/240 Hz**, colisões justas construídas à mão, buffer de pulo, redimensionar sem reiniciar, conquistas sem duplicar, ausência de atalhos do Runner. |
| `solitaire-v26` (novo) | 200 distribuições, regras de movimento, fundações, desfazer, reciclagem do monte, vitória. |
| `web-v26` (novo) | Roteador `.cqo` (variações, 404 sem redirecionar), 2 destaques + “Mostrar mais”, `/internet` com todos os públicos e nenhum secreto, busca (sem 404), XSS, **todos os 171 links internos resolvem**, nenhum recurso externo/script/iframe nas páginas. |

## E2E em Chromium real (`cd tests && npm run test:e2e:v26`)
- **`e2e/12-v26nov16.js`**: tutorial (primeira abertura, pular, reabrir pelo Start/Mais opções/Sobre, “não mostrar novamente”); Data e Hora via interface (1999, 2000, 2003, 2026, 1998, 2050 → nome no Iniciar, Sobre e título; relógio andando; persistência; virada 1999→2000; 12 h; relógio real intacto); rede virtual (ícone ao lado do relógio, painel, desconectar → tela cinza, persistência, rostinho → Runner, reconectar pelas Configurações de Rede); ClaQui Browser (404 + “Voltar ao BuscaJá!”, variações de URL, pesquisa com e sem resultado, XSS, voltar/avançar, favoritos, histórico, abre os 13 sites, formulário do ClaquiMail); **celular 390×844**: Runner ocupa a janela, toque pula, deslizar abaixa, girar para paisagem sem reiniciar, derrota e toque reinicia, Cobrinha/Pong/Desvio CQ/Jogo da Velha/Campo Minado (segurar = bandeira)/Paciência só com toque; touchpad (formatos, limites, posições, gestos, perfis, persistência); layouts em 360 px, tablets retrato/paisagem e desktop 1920; B7 legado (resposta “Copiar” só no menu de contexto).
- **`e2e/13-pwa-offline-update.js`**: instala o SW, confere 1 cache com todos os arquivos do manifesto, remove cache legado `cq-offline-*` sem tocar nos saves; **modo avião** (rede do navegador desligada): reinicia do zero, abre 26 apps, 5 sites, pesquisa, imagens, CSS/JS/dados/ícones/cursores, Runner secreto, ClaQui Update informa a falta de internet real; **atualização real** entre duas releases servidas pelo mesmo servidor (baixa, valida, fica aguardando, pergunta se há minijogo aberto, “Depois” não reinicia, “Atualizar e reiniciar” troca de versão, cache antigo some **depois** da transição, saves/conquistas/recordes/preferências intactos, nova versão funciona offline); **download com arquivo corrompido** é rejeitado, nenhum cache parcial sobra e o cache que funciona permanece.

## Suítes E2E antigas (`tests/e2e/01…11`)
Rodei todas **antes** de alterar o código (linha de base): `08-capturas`, `09-papel-de-parede` e `10-terminal-tentativa` passam; `01`–`05`, `07` e `11` **já falhavam na 2.0.9** por roteiros desatualizados (seletores de telas antigas, p. ex. `[data-act="size"]`, caminhos do Explorador). Não foram consertadas nesta entrega (fora do escopo); o resultado depois das mudanças está na descrição do PR.

## Não testado / pendências
- Nenhum aparelho Android/iOS real: o toque foi emulado pelo Chromium (eventos de ponteiro `touch`). Recomenda-se um teste manual no celular (ver descrição do PR).
- Instalação do PWA pelo prompt do navegador e o comportamento do Safari/iOS (limites de cache do iOS) não foram verificados.
- O arrastar de cartas da Paciência no toque foi testado por regras (Node) e por toque simples (E2E); o arrasto com dedo real não foi exercitado.
- A atualização foi testada entre duas releases locais; a verificação contra `https://classiquiz.vercel.app` só pode ser feita depois da publicação autorizada.
- Revisão visual crítica feita por capturas de tela em 360 px, 390 px, tablets e desktop; não foi uma auditoria exaustiva de todas as telas legadas.

---

## Adendo 2.0.9 — 16/11/2026 (ambiente desta entrega)

A documentação histórica abaixo refere-se a outros ambientes e versões, e não deve ser confundida com testes executados nesta entrega.

**Testes de Node efetivamente executados nesta entrega (todos passaram):**

| Comando | Resultado |
|---|---|
| `node tests/b6.test.js` | 14.941 verificações, sem falhas |
| `node tests/legacy-seeds.test.js` | 357 verificações, nenhuma seed antiga alterada |
| `node tests/ttt.test.js` | 2.609 verificações, sem falhas |
| `node tests/vfs-204.test.js` | Passou |
| `node tests/calc-205.test.js` | 21 verificações, sem falhas |
| `node tests/bsod-205.test.js` | Passou |
| `node tests/desvio-207.test.js` | 124 verificações, sem falhas |
| `node tests/mouse-206.test.js` | 385 verificações, sem falhas |
| `node tests/v209.test.js` | 15.804 verificações: 630 Trilhas B7, IA X/O, fraude, conquistas offline, recursos PWA |

**Verificações de estrutura:** JavaScript validado com `node --check`; arquivos do manifest presentes; os ícones possuem assinatura PNG válida; cache offline não inclui os arquivos do ClaQui OS. Testes de lógica não substituem o teste manual de interação, tela de toque ou de conexão real.

**Limitação:** o Chromium automatizado do ambiente bloqueia a navegação para a página local. Portanto **nenhuma validação visual E2E completa da 2.0.9 foi considerada aprovada**. Ainda é necessário testar no navegador do PC e do celular a troca de janela, o touchpad, o layout, a instalação PWA e o fallback offline.

# Relatório de testes — ClassiQuiz 2.0.0 (ClaQui OS)

Este relatório diz **o que foi realmente executado**, com o resultado de cada comando, e o que **não** foi testado. Nenhuma captura de tela é simulada: todas em `tests/capturas/` foram tiradas pelo Chrome real durante as suítes E2E.

## 1. Ambiente

| Item | Valor |
|---|---|
| Sistema | Windows 10 Pro (10.0.19045) |
| Node | v24.21.0 |
| Navegador | Google Chrome 157.0.8103.51 (real, não headless-shell), controlado por `playwright-core` 1.49.0 |
| Servidor | `tests/e2e/server.js` (HTTP local, sem internet; qualquer requisição externa reprova a suíte) |
| Base de comparação | ClassiQuiz v1.2.2 original (extraída antes de qualquer alteração) |

## 2. Como reproduzir

```bash
cd tests
npm install                 # só instala playwright-core (não faz parte do jogo)
node b6.test.js             # banco B6, Trilhas, Ultra, campanhas, Show
node legacy-seeds.test.js   # seeds antigas × v1.2.2
node e2e/run-all.js         # 10 suítes E2E em Chrome real (~13 min; a última execução levou 798 s)
node e2e/run-all.js --longos  # + Ultra completo (~6 min) e Trilha de 400 (~4 min)
```

Variáveis opcionais: `CHROME_PATH` (caminho do Chrome) e `NODE_PATH` (se `playwright-core` foi instalado fora da pasta).

## 3. Resultados (comandos realmente executados)

### 3.1 Testes Node (sem navegador)

| Comando | Resultado |
|---|---|
| `node tests/b6.test.js` | **14 941 verificações, 0 falhas** |
| `node tests/legacy-seeds.test.js` | **357 verificações, 0 diferenças** em relação à v1.2.2 |

O que `b6.test.js` cobre:
1. **Integridade do banco B6**: IDs únicos; 4+ alternativas sem repetição e com gabarito definido; dificuldade e tema válidos; sem "Opção A", "nenhuma/todas as anteriores" nem emoji; sem texto duplicado (nem entre o Show e o banco normal); nenhuma pergunta com "sem usar as opções"; pegadinhas com alternativas específicas; histórias de 4–7 passos (tijolo com 6); casos com arquivos; todos os tipos de missão (inclusive manter aberto 10 e 20 s); **`addedMonth` original preservado e `revisedMonth` apenas nos itens alterados em relação ao B5** (214 itens: 150 ajustados + 64 reescritos). *Vazamentos sutis de resposta e a correção factual são revisão editorial manual — não são checados automaticamente.*
2. **Trilhas B6**: **276 seeds** (perfis T/M/H × 25, 50, 75, 100, 150, 200, 400 posições; 16 seeds por tamanho, 6 nos de 200+) — sem repetição indevida, histórias completas e contíguas, memória sem apontar para o futuro, pulada/lembrança, distância mínima entre especiais, temas alternados, Show 1→10 só dentro da janela, nenhum só-mouse em T e nenhum só-toque em M.
3. **Ultra B6**: **360 seeds** (**120 por perfil T/M/H**, cada uma um Ultra completo de ~600 posições, gerado com 1 e com 3 corações): tamanho correto, mesma ordem independentemente dos corações, sem repetição, **todos** os itens elegíveis presentes, 1 Show de 10, todas as histórias contíguas, distância ≥ 3, sem Terminal, sem só-mouse no T / só-toque no M, e **120 ordens diferentes** por perfil.
4. **Campanhas 1/2/3**: exatamente 50 etapas, ordem fixa, 100 % híbridas, Show 1..10 contíguo na janela [12,25], 2 missões, 1 história, sem item repetido entre as três.
5. **Show do Milhozão**: pool por rodada (6 itens × 10 níveis) e escolha reproduzível pela seed.

`legacy-seeds.test.js`: 327 seeds das Trilhas B1–B5 e do Ultra v1 (`CQ1-B1…B5`, `CQU1-B5`) geram a **mesma sequência** (assinatura por posição) que a v1.2.2 original.

### 3.2 Testes E2E em Chrome real (Playwright)

Execução final, depois de todas as correções:

| Suíte | Verificações | Resultado |
|---|---:|---|
| `01-campanhas.js` — ClassiQuiz 1, 2 e 3 jogados **inteiros pela interface** (todos os tipos de etapa, Show, missões, Milhonário) | 18 | ok |
| `02-sistema.js` — desktop, Start, taskbar com rolagem, menu de contexto, escalas, Configurações, Terminal/UAC, reset, Reiniciar | 77 | ok |
| `03-programas.js` — Bloco de Notas, Paint, Calculadora, Visualizador, Lixeira, Calendário, Relógio, Reprodutor, jogos, regras de tempo das missões | 41 | ok |
| `04-migracao-mobile.js` — migração de dados antigos (idempotente), celular/tablet, rótulos, toque | 45 | ok |
| `05-trilhas-ultra.js` — Trilha B6, biblioteca, exportar/importar, seeds legadas, Ultra 1/2/3 corações | 41 | ok |
| `07-boot-explorador-energia.js` — boot, Explorador, System32 + tela azul de 10 s, Desligar/Reiniciar, toque prolongado | 32 | ok |
| `08-capturas.js` — abre todos os programas, capturas, fumaça | 33 | ok |
| `09-papel-de-parede.js` — presets, ajustes, importação, prévia, persistência, restaurar | 20 | ok |
| `10-terminal-tentativa.js` — Terminal × conquistas × elegibilidade da tentativa | 11 | ok |
| `11-aceitacao.js` — barra de tarefas, F12 livre, Campo Minado, F5, derrota/retrospectiva, Milhonário com erro, Ultra retomado, 5 resoluções | 114 | ok |
| **Total das 10 suítes** | **432** | **0 falhas** |

Cada suíte também **reprova** se houver erro de console, exceção JS não tratada ou requisição para fora do servidor local.

Suítes longas (`--longos`), executadas à parte:

| Suíte | O que faz | Resultado |
|---|---|---|
| `06-longos.js ultra` | Ultra (1 coração) completo, **629 posições**, jogado pela interface até o fim | ver §3.3 |
| `06-longos.js t400` | Trilha B6 de **400 posições** jogada pela interface até o fim | ver §3.3 |

### 3.3 Suítes longas — resultado
| Comando | Resultado |
|---|---|
| `node tests/e2e/06-longos.js ultra` | Ultra de 1 coração jogado **inteiro pela interface** (629 posições): **12 verificações ok, 0 falhas**, 337 s |
| `node tests/e2e/06-longos.js t400` | Trilha B6 de 400 posições jogada inteira: **3 verificações ok, 0 falhas**, 250 s |

As duas rodaram com o banco **antes** da última alteração de dados (campo `revisedMonth`, §7); essa alteração só acrescenta um campo informativo e não muda seeds, ordem nem conteúdo jogável (verificado: o arquivo regenerado é idêntico ao anterior depois de remover `revisedMonth`; campanhas e CSVs saíram idênticos byte a byte). Depois dela rodaram de novo os testes Node e as 10 suítes E2E (§3.2).

## 4. Seeds de controle (reproduzíveis)

| Seed | Para quê |
|---|---|
| `CQC1-B6-U-50-CLASSIQUIZ1`, `…CLASSIQUIZ2`, `…CLASSIQUIZ3` | Campanhas fixas (50 posições) |
| `CQ1-B6-M-25-ABC2011` | Trilha B6 de 25 (jogada inteira pela interface) |
| `CQ1-B6-M-100-E2E0001` | Trilha B6 de 100 jogada inteira pela interface (05) |
| `CQ1-B6-M-100-MIL1000…` (a 1ª com Show após a posição 25, achada pelo próprio teste 11) | Erro proposital na rodada 3 do Show (Milhonário **não** concedido) |
| `CQU2-B6-T-ALL-ULTRAT1…120`, `…-M-…-ULTRAM1…120`, `…-H-…-ULTRAH1…120` | 360 Ultras gerados nos testes Node |
| `CQ1-B1-T-25-XYZ789`, `CQ1-B3-M-25-XYZ789`, `CQ1-B5-H-25-XYZ789`, `CQ1-B5-H-25-ZZZ999` | Seeds antigas usadas na migração (idênticas à v1.2.2) |
| `tests/fixtures/legacy-seeds.json` | 327 seeds históricas com a assinatura gerada pela v1.2.2 |

## 5. Capturas reais

`tests/capturas/` — 100 PNG do Chrome real. Principais (nome do arquivo): primeira inicialização `boot-primeira-vez`, `boas-vindas`; desktop `desktop`, `mobile-375-desktop`, `mobile-320-desktop`, `mobile-768-desktop`; `mais-opcoes`, `outros`; Explorador `app-explorador`; Terminal/UAC `uac`, `terminal`; campanha `campanha-1-inicio`, `campanha-1-concluida`; Show do Milhozão `show-milhozao-rodada-1`, `show-milhozao-rodada-7`, `milhozao-com-erro`; missões `missao-notepad-text`, `missao-calc-result`, `missao-manter-aberto`; `tela-azul`, `aviso-system32`; energia `desligar-confirmacao`, `desligar-nao-salvos`, `desligando`; papéis de parede; Ultra; resoluções `resolucao-1920x1080`, `…1366x768`, `…1024x768`, `…360x800`, `…844x390`.

## 6. Mapa da checklist da especificação (seção 20)

Legenda: **[x]** executado e passou · **[~]** coberto só em parte (explicado) · **[ ]** não executado/não implementado.

### A. Boot, desktop e configurações
- [x] Primeira execução com boas-vindas e depois boot curto sem repetir (07).
- [x] Desktop com logo animado ao centro, oito atalhos e Ultra à direita (02 + captura `desktop.png`).
- [x] "ClassiQuiz" no lugar de "Nova Trilha" (desktop, Start, barra) (02/08).
- [x] Mais opções e Outros são pastas; Conquistas dentro de Mais opções (08/11).
- [x] Ícones SVG autorais; nenhum emoji como ícone de programa (verificado em `assets/icons/`, capturas).
- [x] Abrir, maximizar, restaurar, minimizar e fechar (02/11); botão da barra restaura/foca a janela certa (11).
- [x] Barra de tarefas com rolagem horizontal só na faixa central; Start e relógio fixos (02).
- [x] Sem rolagem horizontal acidental da página (02/04/11).
- [x] Escalas 100/125/150/175 sem cortar (02, 04, 11 — 175 % limitado ao espaço disponível em telas estreitas).
- [x] Papel de parede importado/preset/ajustes/restaurar e persistência após recarregar (09). Logo e atalhos permanecem por cima do fundo (captura `fundo-importado`).

### B. Terminal e conquistas
- [x] Terminal só no Start (02, 10); primeiro clique abre o UAC fictício; foco em **Não**; Não = sem efeitos (02).
- [x] Sim abre e desativa as conquistas e grava o consentimento; aviso nunca mais volta, nem após reset (02).
- [x] Fechar o Terminal mantém as conquistas bloqueadas, também após recarregar (02).
- [x] Reset por **Configurações → Conquistas**: pede confirmação; cancelar mantém; só as conquistas são limpas (02, 10).
- [~] O comando `RESETAR` do Terminal chama o mesmo fluxo (`resetAchievementsFlow`, mesma confirmação), mas **não foi digitado no Terminal em nenhum teste E2E**.
- [x] Reset vale para tentativas futuras; a tentativa tocada continua inelegível (10).
- [x] Ultra: Terminal ausente do Start e não abre, inclusive com Ultra retomado após F5 (05, 11).
- [x] Nenhum enigma/missão exige o Terminal (verificação de dados em `b6.test.js` + 10).
- [~] F12 / Inspecionar: o teste 11 confirma que **não há código** de detecção/bloqueio de DevTools no projeto; não foi automatizado abrir o painel F12 de verdade.

### C. Explorador e utilitários
- [x] Navegar, criar, renomear, buscar, excluir → Lixeira, restaurar, ocultos aparecem ao ativar (07, 03, 11).
- [x] Bloco de Notas: editar, salvar com nome, conferir o conteúdo gravado, fechar com confirmação (Salvar / Não salvar / Cancelar) (03). [~] Edição por toque: campo de texto nativo, sem teste de teclado virtual real.
- [x] Paint: o lápis pinta, a **borracha apaga** (pixel conferido no canvas) e salva como imagem virtual (03, 11).
- [x] Calculadora: 7 × 6 = 42 e divisão por zero sem "Infinity/NaN" na tela (03). [~] Soma e subtração não têm asserção própria pela interface (a missão de calculadora exercita uma conta feita de verdade).
- [x] Campo Minado: primeiro clique seguro, bandeira por botão direito, remover bandeira, **modo bandeira** (toque/clique), **vitória resolvida por lógica pela interface** (conquista "Campo Limpo") e explosão ("Boom!") (03, 11).
- [~] Jogo da Velha, Cobrinha e Pong: abrem, respondem e a Velha chega a um resultado; **vitória em Cobrinha/Pong não foi dirigida até o fim pela interface** (a conquista "Velha de Verdade" e a regra das conquistas foram testadas; os demais jogos têm lógica própria, mas sem E2E de vitória).
- [ ] **Paciência: não implementada.**
- [x] Programas aparecem na barra e reabrem sem perder estado (11).
- [x] Missões: Bloco de Notas, Calculadora, Paint (balde), Explorador, Lixeira, Visualizador e manter aberto 10/20 s (01, 03, 08).
- [x] Manter aberto: fechar zera, minimizar pausa, outro programa não conta, vencer não é necessário (03).

### D. Seeds, banco e campanhas
- [x] B1–B5 intactos; 357 verificações contra a v1.2.2 (legacy-seeds).
- [x] B6 gerado e ativo; IDs únicos e campos válidos (b6.test.js).
- [x] **276 seeds de Trilha** em 7 tamanhos × T/M/H (cobre ≥ 100 por perfil; 400 é o maior tamanho elegível).
- [x] **360 seeds Ultra** (120 por perfil T/M/H); nenhum só-mouse no Ultra T; nenhum só-toque no Ultra M.
- [x] Sem repetição indevida, histórias completas e contíguas (incluindo a dos tijolos), memória só aponta para o passado, pulada não corta bloco e a lembrança vem depois.
- [x] ClassiQuiz 1/2/3 com exatamente 50 etapas, 100 % híbridas, sem repetição entre si (Node + 01/11).
- [x] Campanhas mantêm ordem após F5 e após derrota ("Tentar a mesma Trilha") (11).
- [x] Finalização e conquistas por edição (01). [~] Recordes por edição verificados em estatísticas, sem checagem visual da tela de recordes.
- [x] Trilha Aleatória oferece tamanhos em blocos de 25 (05).

### E. Qualidade de perguntas
- [x] Revisão **item a item** dos 534 itens do B5, com registro em `AUDITORIA-QUESTOES.csv` (534 linhas: 289 mantidas, 150 ajustadas, 64 reescritas, 31 removidas). A revisão editorial é trabalho de curadoria; os testes automáticos verificam as regras objetivas (alternativas, vazamento, duplicatas), não a "boa escrita".
- [x] Sem "Opção A" e sem solução exposta por "sem usar as opções" nos dados ativos (testes Node).
- [x] O resolvedor automático (`play.js`) joga pela interface **todos os tipos de etapa que aparecem** nas campanhas e Trilhas jogadas — inclusive 60 cliques (com a isca "Finalizar agora") e espera de 20 s — e errar custa o coração certo (01, 05, 11). Não há teste dedicado a cada uma das pegadinhas isoladamente.
- [x] Casos com pasta de evidências sobrevivem a F5 (11).
- [x] Histórias de 4–7 etapas contíguas e fora do fim das Trilhas (Node).
- [~] O "duplo toque" do minijogo: o 2º clique de um duplo clique em atalho foi corrigido (ver §7); outros cenários de toque duplo não foram testados em dispositivo real.

### F. Show do Milhozão
- [x] 10 rodadas consecutivas, dificuldade 1→10 só dentro do show, mesma seed = mesmas perguntas (Node).
- [x] Janela por tamanho; fora do início e do fim; sem sobreposição com histórias (Node).
- [x] Milhonário só com 10/10 sem erro na mesma sequência (01 concede; 11 confirma que com erro **não** concede).
- [x] A única conquista do Show é **Milhonário** (não há conquista por rodada isolada); com erro numa rodada ela não é concedida (11).
- [x] Terminal/Ultra bloqueiam conquistas (02, 05, 10).

### G. System32 e energia
- [x] System32 é só virtual (IndexedDB); o navegador real fica intacto (07).
- [x] Excluir → aviso → tela azul fictícia de **10 s** (medido ≈ 10 s) → restaura a pasta e volta à área de trabalho (07).
- [x] Desligar: confirmação, avisa documentos não salvos, tela de desligando, volta pela inicialização curta; cancelar não mexe em nada (07).
- [x] Reiniciar: simulação de reinício e volta ao desktop (02).
- [x] Desligar não conclui missão artificialmente (03).

### H. Conquistas, estatísticas e recompensas
- [x] Erros e derrotas contados separadamente (11).
- [x] Reset preserva estatísticas/recordes/favoritas e limpa as conquistas (02, 10).
- [x] Ultra com 2 ou 3 corações **não** concede conquistas do Ultra; com 1 coração concede (05).
- [x] Retrospectiva da derrota com números reais da tentativa (11).
- [~] Loja cosmética: abre e lista itens (captura `recompensas-loja`); **a compra de ponta a ponta pela interface não foi automatizada**.

### I. Responsividade, navegador, offline
- [x] 1920×1080, 1366×768, 1280×720, 1024×768 (11, 08).
- [x] 360×800, 390×844 e 320×700; paisagem 800×360 e 844×390 (04/11) — **verificações de layout** (sem rolagem da página, atalhos e alternativas dentro da tela, rótulos inteiros, escala 175 %). **Não** foi jogada uma partida completa em todas essas resoluções.
- [x] Ctrl + botão direito mantém o menu nativo (02).
- [x] Toque prolongado (~600 ms) abre o menu próprio; toque curto não; mover o dedo cancela (07). [ ] **Supressão do menu nativo no toque longo de um celular real** não é verificável no Chrome desktop.
- [x] Recarregar reproduz a mesma tentativa (11) e campanha (11).
- [x] Offline: nenhuma requisição externa em nenhuma suíte (a `lib.js` reprova se houver).
- [x] Sem exceções JS: toda suíte reprova com erro de console.
- [ ] Vazamento de timers/eventos: **sem análise de perfil de memória**; só a ausência de travamentos nas suítes longas.

## 7. Defeitos encontrados nos testes e corrigidos

Defeitos de produto achados pelos testes reais em Chrome e corrigidos (**8**):
1. Foco inicial do UAC caía em **Sim** (o `autofocus` do **Não** era ignorado) → corrigido no modal (`core.js`).
2. A pegadinha "Propriedades" do menu de contexto novo não concluía → o item agora chama a regra do jogo.
3. Papel de parede importado voltava ao padrão após recarregar → reaplicado depois de abrir o banco virtual.
4. Campanhas com perfil H eram marcadas "incompatíveis" em desktop só com mouse → perfil universal **U**.
5. Explorador ignorava a pasta inicial pedida (caso/Lixeira).
6. Lista do Explorador com ícones desalinhados.
7. **Duplo clique** em atalho iniciava uma campanha pelo segundo clique que caía sobre a janela recém-aberta → o segundo clique no mesmo ponto é ignorado.
8. Em 320–375 px, rótulos de atalho eram quebrados no meio da palavra → fonte menor nos contêineres estreitos + teste.

Lacuna de especificação achada na conferência final e corrigida: o B6 preservava o `addedMonth` original mas **não registrava `revisedMonth`** (regra editorial 16) → `tools/build-b6.js` agora grava `revisedMonth: "11/2026"` nos 214 itens ajustados/reescritos, e o teste Node passou a exigir isso.

Defeitos de conteúdo achados pelos testes/auditoria Node: duplicatas entre itens novos do B6/Show e o B5; vazamentos de resposta em `b5-q-017` e `b5-q-043`; alternativa de piada em `b5-q-021`.

Problemas que eram do **teste**, não do produto (corrigidos nos scripts): resolvedor não tratava o avanço automático do `wait20`, isca "Finalizar agora" do `click60`, escapes de regex, janela de Favoritas cobrindo um botão, seletor `#taskbar` (é `.taskbar`).

Uma "melhoria" minha (reexibir o aviso do Terminal após o reset) **contrariava** a especificação e foi desfeita; testes e manual foram corrigidos junto.

## 8. O que NÃO foi testado / limites honestos

- **Só Chrome (desktop).** Não houve Firefox, Safari, Edge nem celular físico; o modo "mobile" é emulação do Chrome (viewport + toque), não hardware.
- **Paciência não existe** (opcional na especificação).
- **Vitória pela interface** em Cobrinha e Pong; compra de item da loja; edição por teclado virtual; comando `RESETAR` digitado no Terminal; soma/subtração da Calculadora com asserção própria — sem E2E dedicado (ver §6).
- **F12/DevTools**: confirmado apenas que o código não detecta nem bloqueia; não abri o painel real automaticamente.
- **Supressão do menu nativo por toque longo** em celular real: não verificável sem dispositivo.
- **Perfil H (híbrido) pela interface**: só pelos testes Node (276 Trilhas e 120 Ultras H); as partidas E2E usaram os perfis M e T/U.
- **Qualidade editorial**: os testes automáticos validam regras objetivas; a correção factual dos itens veio da revisão manual, sem fonte externa consultada nesta execução (sem internet), e pode conter erros. Itens que dependem de fatos atuais foram evitados ou reescritos como atemporais.
- **Quantidade de seeds**: Trilhas 276 e Ultra 360 por Node; pela interface foram jogadas inteiras 3 campanhas, 3 Trilhas e o Ultra de 629 posições.

## Adendo de validação — 2.0.1 (15/11/2026)

**Escopo:** alteração localizada no Jogo da Velha; demais bancos e jogos preservados.

- `node tests/ttt.test.js`: **2.894 verificações**, todas aprovadas. Abrange a chance de 25% dos 4 modos com zero vitórias, exclusão do Ladrão após a primeira vitória, oito prolongamentos externos (horizontal, vertical e diagonal), rejeição de pares não adjacentes, e exploração de árvores de jogadas humanas com 3 desempates diferentes para demonstrar que o modo Difícil não perde.
- `node tests/b6.test.js`: **14.941 verificações**, zero falhas.
- `node tests/legacy-seeds.test.js`: **357 verificações**, zero diferenças nas seeds antigas.
- **Teste visual e funcional via Chromium headless / Playwright Python:** scripts e CSS locais injetados numa página offline em vez de carregar pela URL (o ambiente de validação bloqueava navegações por política). Telas de desktop **1280×800** e celular **390×844**: 9 casas, botão Resetar, cancelamento de Resetar preservando partida, confirmação zerando e iniciando partida nova, sem erros de JavaScript. O modo Ladrão foi forçado exclusivamente no teste, via `Math.random`, para verificar vitória com O fora da grade, linha visível, incremento de placar, conquista secreta, clique na peça ilegal, contestação, devolução do ponto e retomada da partida. Nada disso altera a aleatoriedade normal da entrega.
- **Não executado:** o conjunto completo de suítes E2E de navegador do pacote original (`tests/e2e/run-all.js`), por ausência do `playwright-core` Node no ambiente; o teste visual localizado acima foi executado em Chromium com o Playwright Python disponível.
- **Compatibilidade de placar:** a v2.0.0 não salvava derrotas/empates. A v2.0.1 recupera o total de vitórias anterior pelo contador persistido `achievements.stats.tttWins` quando disponível, e salva o novo placar na chave `classiquiz.v1.ttt`.

## Adendo de validação — 2.0.4 (15/11/2026)

- Testes Node: banco B6 (14.941 verificações), seeds B1–B5 legadas (357 sem diferenças), IA do Jogo da Velha (2.609), VFS 2.0.4 (migração dos caminhos anteriores, pastas, arquivos ocultos, exclusão, recuperação e aviso da System32 sem spoiler).
- Teste em Chromium via injeção dos scripts e CSS no documento: nenhuma exceção JavaScript; árvore exibiu **Meu Dispositivo > Disco Local CQ: > ClaQui** e todas as 10 pastas internas. Conferidos registro de manutenção, caminho legado normalizado e aplicação do efeito Fontes.
- Teste mobile em viewport 390 × 844: a página permaneceu sem rolagem horizontal externa e o Explorador apresentou os 10 diretórios.
- O ambiente bloqueou a navegação direta do Chromium para `http://127.0.0.1`/`file://`, então o teste visual foi feito injetando os scripts/estilos em documento interno, sem carregar as imagens SVG por URL. As suites E2E originais completas **não foram reexecutadas** nesta atualização.


## Adendo 2.0.5 — Calculadora (15/11/2026)
- `node tests/calc-205.test.js`: **17 verificações OK**. Primeira divisão por zero, erro recorrente, `0 ÷ 0`, operação encadeada, divisão válida, estado persistente após reabrir o módulo e emissão de eventos.
- `node tests/bsod-205.test.js`: **PASSOU**. Código `DIVIDE_BY_ZERO` e tempo 8 s, inicialização virtual, preservação do mecanismo separado `SYSTEM32_NOT_FOUND` (10 s) e salvamento da sessão.
- `node tests/b6.test.js`: **14.941 verificações OK**.
- `node tests/legacy-seeds.test.js`: **357 seeds antigas sem diferenças**.
- `node tests/ttt.test.js`: **2.609 verificações OK**.
- `node tests/vfs-204.test.js`: **PASSOU** (migração, árvore, efeitos e recuperação de pastas).
- **E2E visual não executado**: Chromium deste ambiente devolveu `ERR_BLOCKED_BY_ADMINISTRATOR` ao navegar para `127.0.0.1` e `file://`; não se deve apresentar esse teste como aprovado. Os testes de lógica foram executados diretamente com Node.js.


## Adendo de validação — 2.0.6 (15/11/2026)

**Executados:**
- `node tests/b6.test.js`: 14.941 verificações, aprovado.
- `node tests/legacy-seeds.test.js`: 357 verificações, nenhuma divergência de seed, aprovado.
- `node tests/ttt.test.js`: 2.609 verificações, aprovado.
- `node tests/vfs-204.test.js`: migração/estrutura/recuperação dos arquivos virtuais, aprovado.
- `node tests/calc-205.test.js`: 21 verificações com `Math.random` controlado (1º crash obrigatório, crash ou erro nas tentativas seguintes), aprovado.
- `node tests/bsod-205.test.js`: recuperação da tela azul e proteção do VFS, aprovado.
- `node tests/pac-206.test.js`: 1.400 verificações; todas as bolinhas acessíveis no labirinto, movimento sem atravessar paredes, alvos distintos para os quatro fantasmas, aprovado.
- `node tests/mouse-206.test.js`: 203 verificações; 15 papéis, quatro esquemas, 180 SVGs, persistência, tamanho, rastro e restauração, aprovado.
- `node --check assets/js/*.js`: módulos alterados sem erro de sintaxe.

**Limitação:** o Chromium do ambiente bloqueou a navegação para `http://127.0.0.1:8989/` com `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Portanto, não foi possível concluir testes visuais automatizados ou uma partida manual completa no navegador. A lógica e os arquivos foram validados em testes diretos; teste de interface em máquina local ainda recomendado.


## Adendo de validação — 2.0.7 (15/11/2026)

**Executado:** `npm --prefix tests run test:node`: 14.941 verificações do banco B6, 357 seeds antigas sem alterações, 2.609 do Jogo da Velha, 21 da calculadora, 203 do Mouse, testes do sistema de arquivos/tela azul e 33 do Desvio CQ e dos atalhos. Todos aprovados.

**Cobertura nova:** registro dos oito atalhos do desktop; ausência da pasta Outros; novo minijogo, limites de obstáculos, chegada ao nível 10 e contagem das metas. Conquistas existentes fora do minijogo substituído permanecem salvas.

**Não executado:** suíte E2E completa e revisão visual manual em navegador. Os roteiros E2E foram ajustados para a nova hierarquia, mas ainda precisam ser executados numa instalação local que permita o Chromium abrir a página.

## Adendo 2.0.8 — 15/11/2026
- `npm run test:node`: passou, incluindo 14.941 verificações do B6, 357 seeds anteriores, 2.609 verificações do Jogo da Velha, VFS, Calculadora, tela azul, 124 verificações do Desvio CQ/atalhos e 385 verificações de cursores SVG+PNG.
- Avanço determinístico do Desvio CQ até nível 101 sem encerramento artificial e checagens isoladas de passagem pelos níveis 256 e 1000. O melhor nível foi persistido, e os limites de velocidade foram verificados.
- Cursor CSS testado com Chromium via `set_content`: `getComputedStyle(#app).cursor` e `getComputedStyle(button).cursor` exibem as URLs PNG/SVG absolutas corretas. Um teste completo de navegação local do jogo foi impedido pela política de rede do navegador automatizado. Portanto, não há alegação de validação visual ponta a ponta da interface.
- Menu Iniciar verificado por assertivas estruturais: grupos, todos os apps principais, rolagem interna e rodapé fixo.
