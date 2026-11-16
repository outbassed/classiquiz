/* ClassiQuiz 1.0 — banco original de perguntas. Licença do código: MIT. */
(() => {
  'use strict';
  // Primeira alternativa é a correta NO BANCO; o gerador embaralha as respostas por seed.
  const raw = `Qual é a capital do Brasil?|Brasília|Rio de Janeiro|São Paulo|Salvador
Qual é a capital do Espírito Santo?|Vitória|Vila Velha|Cariacica|Serra
Qual é a capital da Argentina?|Buenos Aires|Córdoba|Rosário|Mendoza
Qual destes países fica na América do Sul?|Chile|México|Portugal|Canadá
Qual é o maior país da América do Sul em área?|Brasil|Argentina|Peru|Colômbia
Qual é o menor continente em área?|Oceania|Europa|Antártida|África
Qual oceano banha a costa leste do Brasil?|Atlântico|Pacífico|Índico|Ártico
Qual país tem a cidade de Kyoto?|Japão|China|Coreia do Sul|Tailândia
A Torre Eiffel fica em qual cidade?|Paris|Londres|Roma|Madri
Qual país tem formato conhecido por lembrar uma bota?|Itália|Grécia|Croácia|Portugal
Qual é o principal idioma oficial da Argentina?|Espanhol|Português|Francês|Italiano
Em qual continente fica o Egito?|África|Ásia|Europa|Oceania
Qual é a capital do Japão?|Tóquio|Osaka|Quioto|Nagasaki
Qual é a capital de Portugal?|Lisboa|Porto|Coimbra|Braga
Qual é a capital do Ceará?|Fortaleza|Natal|Teresina|Maceió
Qual é a capital de Minas Gerais?|Belo Horizonte|Uberlândia|Ouro Preto|Contagem
O Rio Nilo está associado principalmente a qual continente?|África|Europa|Oceania|América do Norte
Que linha imaginária divide a Terra em hemisférios Norte e Sul?|Equador|Greenwich|Trópico de Câncer|Círculo Polar Ártico
A cidade de Cusco fica em qual país?|Peru|Chile|Bolívia|Equador
Qual estado brasileiro tem Florianópolis como capital?|Santa Catarina|Paraná|Rio Grande do Sul|Sergipe
Qual planeta é conhecido como Planeta Vermelho?|Marte|Vênus|Júpiter|Mercúrio
Qual é o maior planeta do Sistema Solar?|Júpiter|Saturno|Netuno|Urano
Qual planeta está mais próximo do Sol?|Mercúrio|Vênus|Terra|Marte
Qual satélite natural orbita a Terra?|Lua|Europa|Titã|Fobos
Quantas pernas tem uma aranha adulta típica?|8|6|10|12
Quantos corações tem um polvo?|3|1|2|4
Qual mamífero é capaz de voo ativo?|Morcego|Esquilo|Pinguim|Avestruz
Qual gás as plantas absorvem na fotossíntese?|Dióxido de carbono|Oxigênio|Hélio|Neônio
Qual é o símbolo químico da água?|H₂O|CO₂|NaCl|O₂
Qual é o símbolo químico do ouro?|Au|Ag|Fe|Cu
Qual órgão bombeia sangue pelo corpo humano?|Coração|Pulmão|Fígado|Rim
Qual animal passa pela metamorfose de lagarta para adulto?|Borboleta|Joaninha|Gafanhoto|Formiga
O som se propaga no vácuo?|Não|Sim, sempre|Só de noite|Só em altas frequências
Qual é a unidade mais usada para medir corrente elétrica?|Ampere|Volt|Watt|Ohm
A água ferve a aproximadamente quantos graus Celsius ao nível do mar?|100|50|80|120
A fórmula química CO₂ corresponde a quê?|Dióxido de carbono|Monóxido de carbono|Oxigênio|Hidrogênio
Quantos ossos tem geralmente um humano adulto?|206|106|306|406
Qual destas estrelas está mais próxima da Terra?|Sol|Sírius|Betelgeuse|Vega
Que instrumento mede a temperatura?|Termômetro|Barômetro|Bússola|Higrômetro
O que é mais comum nos anéis de Saturno?|Partículas de gelo e rocha|Lava líquida|Árvores|Oxigênio líquido
O sangue dos polvos é tipicamente de que cor?|Azul|Verde|Amarelo|Laranja
Qual parte da célula costuma conter o DNA nos eucariontes?|Núcleo|Ribossomo|Membrana plasmática|Citoplasma apenas
Qual é o metal líquido em temperatura ambiente mais conhecido?|Mercúrio|Ferro|Alumínio|Cobre
Qual animal é um marsupial?|Canguru|Girafa|Leão|Lobo
Como se chama o processo de água passar do líquido para o gasoso?|Evaporação|Condensação|Solidificação|Fusão
Quantos lados tem um triângulo?|3|4|5|6
Quanto é 7 × 8?|56|54|58|64
Quanto é 15 + 27?|42|41|43|44
Quanto é 9²?|81|72|90|99
Quanto é a metade de 150?|75|50|100|65
Quanto é 100 dividido por 4?|25|20|40|50
Quanto é 12 × 12?|144|124|132|148
Qual é o próximo número da sequência 2, 4, 6, 8...?|10|9|11|12
Quanto é 3³?|27|9|18|81
Qual número é primo?|13|15|21|27
Quantos minutos há em 2 horas?|120|100|90|140
Qual é o dobro de 45?|90|80|85|95
Quanto é 5 × (3 + 2)?|25|17|30|20
Qual fração representa metade de um inteiro?|1/2|1/3|2/3|3/4
Qual é a raiz quadrada de 64?|8|6|7|9
Quanto é 0 × 999?|0|999|1|99
Quanto é 1.000 - 375?|625|725|575|675
Um dado comum tem quantas faces?|6|4|8|12
Quantos centímetros há em 1 metro?|100|10|1.000|60
Quantos meses há em um ano?|12|10|11|13
Qual é o primeiro mês do ano?|Janeiro|Fevereiro|Março|Dezembro
Qual dia vem depois de terça-feira?|Quarta-feira|Segunda-feira|Quinta-feira|Sexta-feira
Quantas letras tem a palavra 'casa'?|4|3|5|6
Qual destas palavras é um verbo no infinitivo?|Correr|Rápido|Bonito|Azul
Qual é o plural de 'pão'?|Pães|Pãos|Pãoses|Pões
Qual destes sinais encerra uma pergunta direta?|Interrogação (?)|Vírgula (,)|Dois-pontos (:)|Ponto e vírgula (;)
Qual palavra tem acento agudo?|Café|Casa|Mesa|Bola
Qual destas palavras é um substantivo?|Janela|Correr|Depressa|Muito
O contrário de 'alto' é...|Baixo|Largo|Comprido|Pesado
Qual destes é um pronome pessoal?|Nós|Ontem|Aqui|Muito
Como se escreve corretamente o nome do planeta onde vivemos?|Terra|Tera|Terrah|Térra
Qual é a última letra do alfabeto português atual?|Z|X|Y|W
Quantas vogais básicas há no português?|5|4|6|7
Qual destas palavras indica uma cor?|Roxo|Mesa|Lápis|Janela
Qual destes números é ímpar?|17|12|28|40
Qual sinal representa adição?|+|−|÷|×
Em qual estação do ano as folhas de muitas árvores temperadas caem?|Outono|Verão|Primavera|Inverno
Qual destas opções representa um alimento vegetal?|Cenoura|Leite|Ovo|Queijo
Qual destas bebidas costuma ser feita com grãos torrados?|Café|Suco de uva|Água de coco|Chá de hortelã
Qual destes ingredientes é usado para fazer pão tradicional?|Farinha de trigo|Areia|Sal grosso apenas|Pedra moída
Que utensílio serve para cortar papel?|Tesoura|Garfo|Colher|Pente
Qual objeto costuma indicar o norte magnético?|Bússola|Régua|Termômetro|Cronômetro
Qual destes animais põe ovos?|Galinha|Vaca|Cavalo|Golfinho
Qual objeto serve para apagar uma escrita de lápis?|Borracha|Grampeador|Clips|Marca-texto
Qual órgão é responsável principalmente pela visão?|Olho|Orelha|Nariz|Língua
Qual é o nome da nossa galáxia?|Via Láctea|Andrômeda|Triângulo|Nuvem de Magalhães
Quem pintou a Mona Lisa?|Leonardo da Vinci|Michelangelo|Van Gogh|Picasso
Quem escreveu 'Dom Casmurro'?|Machado de Assis|José de Alencar|Graciliano Ramos|Carlos Drummond
Em que país nasceram os Jogos Olímpicos da Antiguidade?|Grécia|Itália|Egito|França
Em qual século ocorreu a chegada dos portugueses ao Brasil em 1500?|Século XVI|Século XV|Século XVII|Século XVIII
Qual invenção é associada a Gutenberg na Europa?|Imprensa de tipos móveis|Telefone|Rádio|Avião
Qual era a profissão de Santos Dumont ligada à sua fama?|Inventor e aviador|Pintor e escultor|Navegador marítimo|Cineasta
Em que país fica a cidade histórica de Pompeia?|Itália|Espanha|Grécia|Turquia
Quem compôs a Nona Sinfonia, incluindo a 'Ode à Alegria'?|Beethoven|Mozart|Chopin|Vivaldi
Qual civilização construiu Machu Picchu?|Inca|Maia|Asteca|Romana
A Revolução Francesa começou em qual ano?|1789|1689|1889|1799
Qual é o nome do documento promulgado em 1988 que organiza o Estado brasileiro?|Constituição Federal|Código Napoleônico|Carta Magna inglesa|Tratado de Tordesilhas
Quem escreveu 'O Pequeno Príncipe'?|Antoine de Saint-Exupéry|Jules Verne|Victor Hugo|Albert Camus
Qual dessas figuras é conhecida por defender a teoria da relatividade?|Albert Einstein|Isaac Newton|Charles Darwin|Nikola Tesla
Qual destas embarcações é movida principalmente pelo vento?|Veleiro|Submarino nuclear|Lancha a motor|Balsa a diesel
Que monumento fica em Pisa, na Itália?|Torre Inclinada|Big Ben|Arco do Triunfo|Cristo Redentor
Em que ano começou oficialmente a Segunda Guerra Mundial na Europa?|1939|1914|1945|1929
Que acontecimento histórico é associado a 1969?|Primeira chegada humana à Lua|Queda do Muro de Berlim|Primeiro voo dos irmãos Wright|Invenção da imprensa
Qual destas figuras é conhecida pelo trabalho com radioatividade?|Marie Curie|Ada Lovelace|Frida Kahlo|Amelia Earhart
Qual é o sobrenome do cientista Charles ligado à evolução por seleção natural?|Darwin|Newton|Galilei|Mendel
Qual cidade sediou os Jogos Olímpicos de 2016?|Rio de Janeiro|Londres|Tóquio|Pequim
Qual clube revelou Neymar no futebol profissional?|Santos|Palmeiras|Flamengo|Corinthians
Qual país venceu a Copa do Mundo masculina de futebol de 2002?|Brasil|Alemanha|França|Argentina
Qual seleção venceu a Copa do Mundo masculina de 2014?|Alemanha|Brasil|Holanda|Espanha
Qual seleção venceu a Copa do Mundo masculina de 2018?|França|Croácia|Alemanha|Bélgica
Quantos jogadores cada equipe tem em campo no futebol tradicional?|11|10|9|12
Qual cartão costuma indicar expulsão no futebol?|Vermelho|Amarelo|Azul|Verde
Quantos pontos vale uma cesta de lance livre no basquete?|1|2|3|4
Em que esporte se usa uma peteca?|Badminton|Vôlei|Golfe|Rúgbi
Qual é o nome do torneio de tênis disputado em quadras de saibro em Paris?|Roland-Garros|Wimbledon|US Open|Australian Open
Qual destes esportes tem uma rede separando os dois lados da quadra?|Vôlei|Atletismo|Natação|Ciclismo
Qual desses clubes é conhecido como 'Galo'?|Atlético Mineiro|Botafogo|Santos|Grêmio
Qual estádio é tradicionalmente associado ao Flamengo e ao Fluminense no Rio?|Maracanã|Morumbi|Mineirão|Beira-Rio
Quantos tempos principais tem uma partida de futebol tradicional?|2|3|4|5
Qual posição costuma defender o gol no futebol?|Goleiro|Ponta|Volante|Centroavante
Qual jogador brasileiro ficou conhecido como 'Rei do Futebol'?|Pelé|Zico|Ronaldo|Romário
Qual evento esportivo é realizado de quatro em quatro anos, em regra?|Copa do Mundo masculina de futebol|Brasileirão|Copa do Brasil|Campeonato Carioca
Qual esporte é associado a Michael Jordan?|Basquete|Futebol|Tênis|Natação
Qual destes itens é usado no boliche?|Pinos|Raquetes|Luvas de boxe|Bastões de esqui
Em que ano o Instagram foi lançado?|2010|2005|2014|2018
Qual empresa comprou o Instagram em 2012?|Facebook|Google|Microsoft|Amazon
Qual plataforma ficou famosa por vídeos curtos e desafios virais?|TikTok|LinkedIn|Wikipedia|GitHub
Qual plataforma é conhecida principalmente por hospedagem de vídeos?|YouTube|Excel|Photoshop|Word
Qual rede social ficou associada ao passarinho azul por muitos anos?|Twitter|Instagram|Pinterest|Reddit
Qual desses serviços é um navegador de internet?|Mozilla Firefox|Microsoft Excel|Adobe Reader|Bloco de Notas
Qual extensão é comum em imagens com transparência?|.png|.mp3|.txt|.exe
Qual extensão é comum em arquivos de áudio?|.mp3|.png|.html|.zip
O que significa a sigla 'WWW'?|World Wide Web|World Wireless Window|Wide World Windows|Web World Word
Qual tecla costuma atualizar uma página no navegador de PC?|F5|F1|F7|F12
Qual desses é um sistema operacional?|Linux|Google Docs|Spotify|Discord
Qual desses programas é usado para planilhas?|Microsoft Excel|VLC|Paint|Audacity
O que um arquivo .zip geralmente contém?|Arquivos compactados|Apenas áudio ao vivo|Somente uma imagem BMP|Um monitor virtual
Qual é o nome do mascote do Android?|Bugdroid|Tux|Clippy|Sonic
Qual sistema da Microsoft veio depois do Windows 98 e antes do XP, no mercado doméstico?|Windows Me|Windows 7|Windows Vista|Windows 8
O ícone de disquete costuma representar qual ação em programas?|Salvar|Imprimir|Excluir|Atualizar
Qual é o nome da enciclopédia colaborativa online?|Wikipédia|Netflix|Twitch|WhatsApp
Qual é a plataforma de streaming musical conhecida pelas playlists?|Spotify|Paint|Notepad|WinRAR
Qual dessas empresas desenvolveu o navegador Chrome?|Google|Nintendo|Valve|Adobe
Qual ferramenta é tradicionalmente usada para editar páginas HTML em texto?|Editor de código|Calculadora|Antivírus|Reprodutor de DVD
Em qual franquia aparece o personagem Mario?|Super Mario|Sonic the Hedgehog|Minecraft|Halo
Qual personagem do Sonic costuma ser representado por uma raposa de duas caudas?|Tails|Knuckles|Shadow|Eggman
Qual jogo popular usa blocos para construir mundos?|Minecraft|FIFA|Tetris|Pac-Man
Qual personagem come pontos em um labirinto?|Pac-Man|Kirby|Link|Crash
Em qual série de jogos aparece a região de Kanto?|Pokémon|The Sims|God of War|Gran Turismo
Qual série de jogos tem o personagem Kratos?|God of War|Hollow Knight|Portal|Animal Crossing
Qual personagem é um encanador vestido de verde no universo Mario?|Luigi|Wario|Toad|Bowser
Qual personagem aparece como protagonista de The Legend of Zelda em muitos jogos?|Link|Zelda|Ganondorf|Epona
Qual destes jogos é conhecido por montar linhas com peças que caem?|Tetris|Doom|Among Us|Pong
Em qual jogo os jogadores descobrem um impostor em uma nave?|Among Us|The Sims|Forza Horizon|Terraria
Qual personagem de desenho mora em um abacaxi no fundo do mar?|Bob Esponja|Popeye|Pica-Pau|Tom
Qual desenho tem os personagens Homer, Marge, Bart e Lisa?|Os Simpsons|Futurama|South Park|Family Guy
Qual personagem da Disney é um pato conhecido por usar roupa de marinheiro?|Pato Donald|Pateta|Mickey|Tio Patinhas
Quem é o melhor amigo de Shrek na animação original?|Burro|Gato de Botas|Lorde Farquaad|Pinóquio
Qual filme da Pixar apresenta o cowboy Woody e Buzz Lightyear?|Toy Story|Carros|Up|Procurando Nemo
Qual série apresenta a cidade fictícia de Hawkins?|Stranger Things|Breaking Bad|Lost|Dark
Qual instrumento musical tem teclas brancas e pretas?|Piano|Trompete|Tambor|Violino
Qual artista brasileira é conhecida pelo hit 'Envolver'?|Anitta|Ivete Sangalo|Marisa Monte|Gal Costa
Qual destes gêneros musicais é associado a DJs e bailes brasileiros?|Funk carioca|Ópera barroca|Canto gregoriano|Valsa vienense
Qual cantora lançou o álbum '1989'?|Taylor Swift|Adele|Rihanna|Beyoncé
Qual cantor ficou conhecido como 'Rei do Pop'?|Michael Jackson|Elvis Presley|Freddie Mercury|Prince
Qual desses é um instrumento de percussão?|Tambor|Flauta|Clarinete|Violino
Qual destes filmes tem um navio que colide com um iceberg?|Titanic|Avatar|Matrix|Interestelar
Qual desses personagens vive na Fenda do Biquíni?|Lula Molusco|Scooby-Doo|Pernalonga|Goku
A influenciadora brasileira Virgínia é conhecida por qual sobrenome?|Fonseca|Azevedo|Pereira|Almeida
Qual dessas plataformas é usada para publicar fotos e reels?|Instagram|PowerPoint|Winamp|Bloco de Notas
Qual é a cor tradicional do semáforo que significa 'pare'?|Vermelho|Verde|Amarelo|Azul
Qual é o nome do objeto usado para guardar chuva longe da cabeça?|Guarda-chuva|Abajur|Escorredor|Ventilador
Qual desses objetos costuma ter páginas de papel encadernadas?|Livro|Prato|Colher|Sapato
Qual objeto costuma ser usado para escovar os dentes?|Escova de dentes|Pente|Pincel de parede|Régua
Qual das opções é um meio de transporte sobre trilhos?|Trem|Barco|Avião|Helicóptero
Se hoje é sexta-feira, que dia será amanhã?|Sábado|Quinta-feira|Domingo|Segunda-feira
Qual cor resulta da mistura de tinta azul e amarela, em geral?|Verde|Roxo|Laranja|Rosa
Qual destes animais mia?|Gato|Cachorro|Cavalo|Pato
Qual destas comidas é tradicionalmente feita com milho?|Pamonha|Sushi|Croissant|Pizza margherita
Qual é o nome do dispositivo usado para apontar e clicar na tela de um PC?|Mouse|Modem|Roteador|Microfone
Qual desses objetos pode servir para transportar água em pequena quantidade?|Garrafa|Travesseiro|Livro|Caderno
Qual destas cidades fica no Espírito Santo?|Cariacica|Campinas|Niterói|Santos
Qual jogo de tabuleiro utiliza rei, rainha e peões?|Xadrez|Dominó|Banco Imobiliário|Uno
Qual é a estação que vem antes do inverno no hemisfério sul?|Outono|Verão|Primavera|Nenhuma
Quem é conhecido como criador da linguagem Python?|Guido van Rossum|Linus Torvalds|Brendan Eich|Dennis Ritchie
Qual linguagem é usada principalmente para estruturar o conteúdo de páginas web?|HTML|CSS|SQL|Bash
Qual linguagem é usada principalmente para estilizar páginas web?|CSS|HTML|SQL|Python
Qual destes é um formato de documento portátil?|PDF|MP3|PNG|GIF
Qual desses termos descreve a tentativa de enganar alguém para obter senhas?|Phishing|Streaming|Backup|Download
Qual sistema de numeração usa apenas 0 e 1?|Binário|Decimal|Hexadecimal|Romano
Um pendrive é usado principalmente para quê?|Armazenar e transportar dados|Imprimir folhas|Aumentar o brilho da tela|Ligar um ventilador
Qual é a unidade que costuma medir a capacidade de armazenamento digital?|Byte|Metro|Litro|Celsius
Em que tipo de arquivo é comum encontrar código JavaScript?|.js|.mp4|.jpg|.wav
Qual protocolo é usado comumente para acessar páginas web seguras?|HTTPS|FTP simples|SMTP|POP3`;

  const extendedRaw = `Qual destes países tem a capital chamada Montevidéu?|Uruguai|Paraguai|Bolívia|Equador|Chile|Peru
Qual destes animais é um mamífero marinho?|Baleia|Tubarão|Polvo|Água-viva|Atum|Sardinha
Qual destes números é um quadrado perfeito?|121|122|123|124|125|126|127|128
Quem escreveu o romance '1984'?|George Orwell|Aldous Huxley|J. R. R. Tolkien|Ernest Hemingway|Agatha Christie|Arthur Conan Doyle
Qual destas linguagens é executada diretamente pelo navegador para dar interatividade a páginas?|JavaScript|Python|C|Rust|Go|Lua
Qual destas cidades foi fundada na região da atual Turquia e é conhecida como Constantinopla na história?|Istambul|Ankara|Antália|Izmir|Bursa|Konya
Qual desses minerais representa dureza 10 na escala Mohs?|Diamante|Quartzo|Calcita|Topázio|Talco|Gipsita|Fluorita|Apatita
Qual desses pintores criou 'A Noite Estrelada'?|Vincent van Gogh|Claude Monet|Salvador Dalí|Pablo Picasso|Paul Cézanne|Edvard Munch
Qual destes planetas tem o dia mais longo que seu ano, considerando rotação e translação?|Vênus|Marte|Terra|Júpiter|Saturno|Netuno
Qual time venceu a primeira Copa do Mundo masculina, em 1930?|Uruguai|Brasil|Argentina|Itália|Alemanha|França|Espanha|Inglaterra
Qual destes elementos químicos tem número atômico 6?|Carbono|Oxigênio|Nitrogênio|Hidrogênio|Ferro|Enxofre
Qual dessas cidades é a capital da Austrália?|Canberra|Sydney|Melbourne|Perth|Brisbane|Adelaide`;

  const parse = (s,kind) => s.trim().split('\n').map((line,i) => {
    const [text, ...options] = line.split('|');
    if (options.length < 4 || new Set(options).size !== options.length) throw Error('Pergunta inválida: ' + (i+1));
    return {id: `${kind}${String(i+1).padStart(3,'0')}`, kind, text, options, correct:0};
  });
  const questions = parse(raw,'standard');
  const extended = parse(extendedRaw,'extended');

  const tricks = [
    {id:'trick-red', kind:'trick', mode:'click-red', text:'Clique no vermelho'},
    {id:'trick-number', kind:'trick', mode:'click-number', text:'Clique no número desta pergunta.'},
    {id:'trick-dot', kind:'trick', mode:'click-dot', text:'Clique no ponto final.'},
    {id:'trick-cover', kind:'trick', mode:'drag-cover', text:'Encontre a resposta atrás da caixa.'},
    {id:'trick-double', kind:'trick', mode:'double-tap', text:'Toque duas vezes rapidamente no disquete.'},
    {id:'trick-word', kind:'trick', mode:'click-word', text:'Toque na palavra certa.'},
    {id:'trick-window', kind:'trick', mode:'drag-window', text:'Arraste a janela para descobrir a resposta.'},
    {id:'trick-hover', kind:'trick', mode:'hover', text:'Passe o ponteiro sobre o disquete, sem clicar.', needs:'mouse'},
    {id:'trick-right', kind:'trick', mode:'right-click', text:'Use o botão direito no disquete.', needs:'mouse'},
    {id:'trick-hover2', kind:'trick', mode:'hover-target', text:'Passe o mouse na pasta que contém um segredo.', needs:'mouse'},
    {id:'trick-right2', kind:'trick', mode:'right-click-folder', text:'Abra o menu de contexto da pasta.', needs:'mouse'},
    {id:'trick-hold', kind:'trick', mode:'touch-hold', text:'Mantenha o dedo sobre a estrela por um instante.', needs:'touch'}
  ];
  const minigames = [
    {id:'mini-order',kind:'mini',mode:'order',text:'Clique nos números em ordem crescente.'},
    {id:'mini-find',kind:'mini',mode:'find',text:'Encontre a estrela escondida entre os símbolos.'},
    {id:'mini-memory',kind:'mini',mode:'pairs',text:'Encontre os pares iguais.'},
    {id:'mini-count',kind:'mini',mode:'count',text:'Conte os quadrados azuis.'},
    {id:'mini-path',kind:'mini',mode:'path',text:'Faça o caminho 1 → 2 → 3 → 4.'},
    {id:'mini-bug',kind:'mini',mode:'bug',text:'Encontre o inseto diferente.'},
    {id:'mini-color',kind:'mini',mode:'color',text:'Toque somente nas peças verdes.'},
    {id:'mini-arrows',kind:'mini',mode:'arrows',text:'Repita a sequência de setas.'}
  ];

  window.CLASSIQUIZ_DATA_B1 = Object.freeze({questions,extended,tricks,minigames,version:'1.0.0',bankVersion:'B1'});
})();
