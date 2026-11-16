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
Qual país abriga a maior parte do deserto do Atacama?|Chile|Argentina|México|Colômbia
Qual país tem a cidade de Kyoto?|Japão|China|Coreia do Sul|Tailândia
Qual é a capital da Nova Zelândia?|Wellington|Auckland|Christchurch|Hamilton
Qual país tem formato conhecido por lembrar uma bota?|Itália|Grécia|Croácia|O país dos sapateiros
Qual é a língua oficial de Moçambique?|Português|Inglês|Francês|Espanhol
Em qual continente fica o Egito?|África|Ásia|Europa|A terra das pirâmides voadoras
Em qual país está localizada a cidade de Toronto?|Canadá|Estados Unidos|Austrália|Irlanda
Qual é a capital de Portugal?|Lisboa|Porto|Coimbra|Braga
Em qual região do Brasil fica o estado de Sergipe?|Nordeste|Norte|Sudeste|Centro-Oeste
Qual destas cidades é a capital de Tocantins?|Palmas|Gurupi|Porto Nacional|Araguaína
Qual rio atravessa a cidade de Londres?|Tâmisa|Sena|Danúbio|Reno
Que linha imaginária divide a Terra em hemisférios Norte e Sul?|Equador|Greenwich|Trópico de Câncer|Círculo Polar Ártico
Em qual país estão as ruínas de Machu Picchu?|Peru|Bolívia|México|Chile
Qual estado brasileiro tem Florianópolis como capital?|Santa Catarina|Paraná|Rio Grande do Sul|Sergipe
Qual planeta é conhecido como Planeta Vermelho?|Marte|Vênus|Júpiter|O planeta do ketchup
Qual é o maior planeta do Sistema Solar?|Júpiter|Saturno|Netuno|Planeta dos Macacos
Qual planeta está mais próximo do Sol?|Mercúrio|Vênus|Terra|Marte
Qual planeta possui os anéis mais conhecidos do Sistema Solar?|Saturno|Netuno|Mercúrio|Marte
Aranhas e escorpiões pertencem a qual grupo de animais?|Aracnídeos|Insetos|Crustáceos|Moluscos
Quantos corações possui um polvo?|Três|Um|Dois|Quatro
Qual mamífero é capaz de voo ativo?|Morcego|Esquilo|Pinguim|Avestruz
Qual gás as plantas absorvem na fotossíntese?|Dióxido de carbono|Oxigênio|Hélio|Neônio
Qual destas substâncias é essencial para a fotossíntese?|Dióxido de carbono|Hélio|Neônio|Hidrogênio
Qual é o gás mais abundante na atmosfera terrestre?|Nitrogênio|Oxigênio|Dióxido de carbono|Hélio
Qual órgão humano produz a bile?|Fígado|Estômago|Pâncreas|Rim
Sapos e salamandras pertencem a qual classe de vertebrados?|Anfíbios|Répteis|Mamíferos|Peixes
Qual é a unidade utilizada para medir a intensidade da corrente elétrica?|Ampere|Volt|Watt|Ohm
Em qual unidade se mede a temperatura no Sistema Internacional?|Kelvin|Celsius|Fahrenheit|Réaumur
Qual unidade costuma ser usada para indicar o nível de intensidade sonora?|Decibel|Hertz|Ampere|Metro
Quantos ossos tem, em geral, o corpo humano adulto?|206|196|216|226
Qual planeta apresenta uma tempestade conhecida como Grande Mancha Vermelha?|Júpiter|Marte|Saturno|Netuno
Qual destas estrelas está mais próxima da Terra?|Sol|Sírius|Estrela cadente|Vega
O que forma a maior parte dos anéis de Saturno?|Gelo e fragmentos de rocha|Lava vulcânica|Nuvens de gás|Poeira de estrela cadente
Qual é a cor do sangue dos polvos?|Azul|Vermelha|Verde|Amarela
O sangue dos polvos é tipicamente de que cor?|Azul|Verde|Amarelo|Laranja
Qual metal é líquido em temperatura ambiente?|Mercúrio|Ferro|Alumínio|Cobre
Qual animal usa uma língua comprida e pegajosa para capturar formigas?|Tamanduá|Golfinho|Cavalo-marinho|Pinguim
Como se chama a passagem direta do estado sólido para o gasoso?|Sublimação|Condensação|Fusão|Evaporação
Qual substância ferve a aproximadamente 100 °C ao nível do mar?|Água|Etanol|Mercúrio|Óleo de cozinha
Quantos lados tem um triângulo?|3|4|5|6
Quanto é 7 × 8?|56|54|58|64
Quanto é 15 + 27?|42|41|43|44
Quanto é 9²?|81|72|90|99
Um tênis de R$ 200 recebe desconto de 25%. Qual será o preço final?|R$ 150|R$ 175|R$ 125|R$ 160
Quanto é três quartos de 80?|60|40|65|75
Quanto é 12 × 12?|144|124|132|148
Qual é o próximo número da sequência 2, 4, 8, 16...?|32|24|30|64
Quanto é 3³?|27|9|18|81
Qual número é primo?|13|15|21|27
Quantos minutos há em 2 horas?|120|100|90|140
Qual é a média aritmética de 4, 6 e 8?|6|5|7|8
Quanto é 2 elevado à quinta potência?|32|16|25|64
Qual é a representação decimal de 3/4?|0,75|0,25|0,50|0,80
Qual é a raiz quadrada de 64?|8|6|7|9
Qual destes números é divisível por 3?|123|124|125|127
Quanto é 1.000 - 375?|625|725|575|675
Um dado comum tem quantas faces?|6|4|8|12
Quantos milímetros existem em um metro?|1.000|100|10.000|10
Quantos dias tem um ano bissexto?|366|365|364|367
Em qual mês o calendário gregoriano pode ter 29 dias?|Fevereiro|Abril|Junho|Novembro
Se hoje é terça-feira, que dia da semana será daqui a dez dias?|Sexta-feira|Quinta-feira|Sábado|Domingo
Qual destas palavras é um palíndromo?|Ovo|Casa|Livro|Cadeira
Qual destas palavras é um verbo no infinitivo?|Correr|Rápido|Bonito|Azul
Qual é o plural correto de cidadão?|Cidadãos|Cidadões|Cidadães|Cidadãoses
Para que serve principalmente o ponto e vírgula em um texto?|Separar partes relacionadas de um período|Indicar uma pergunta|Marcar a fala de um personagem|Indicar uma abreviação
Qual palavra tem acento agudo?|Café|Casa|Mesa|Bola
Qual figura de linguagem aparece em “A cidade acordou irritada”?|Personificação|Comparação|Eufemismo|Antítese
Qual é o autor do poema “No meio do caminho”?|Carlos Drummond de Andrade|Manuel Bandeira|Vinicius de Moraes|Olavo Bilac
Qual destas palavras está corretamente acentuada?|Ônibus|Onibus|Oníbus|Onibús
Qual escritor português criou o heterônimo Alberto Caeiro?|Fernando Pessoa|José Saramago|Eça de Queirós|Luís de Camões
Qual povo construiu as cidades de Chichén Itzá e Tikal?|Maias|Incas|Romanos|Vikings
Qual obra acompanha o retorno de Ulisses para casa depois da Guerra de Troia?|Odisseia|Ilíada|Eneida|Metamorfoses
Qual destas palavras é proparoxítona?|Lâmpada|Café|Papel|Também
Quantos lados tem um octógono?|Oito|Seis|Sete|Nove
Qual é o resultado de 5 × (6 + 2)?|40|32|38|50
Em qual estação do ano as folhas de muitas árvores temperadas caem?|Outono|Verão|Primavera|Inverno
Qual destes materiais costuma ser utilizado para fabricar vidro?|Areia|Algodão|Carvão vegetal|Papelão
Em qual camada da atmosfera fica a chamada camada de ozônio?|Estratosfera|Troposfera|Mesosfera|Exosfera
Qual país é associado à origem do sistema métrico decimal?|França|Japão|Canadá|Egito
Qual cidade era conhecida como Constantinopla?|Istambul|Atenas|Roma|Veneza
Qual objeto costuma indicar o norte magnético?|Bússola|Régua|Termômetro|Cronômetro
Qual molécula transporta a informação genética na maior parte dos seres vivos?|DNA|Glicose|Hemoglobina|Colágeno
Qual cientista formulou as três leis do movimento planetário?|Johannes Kepler|Galileu Galilei|Nicolau Copérnico|Isaac Newton
Qual instrumento é utilizado para medir a pressão atmosférica?|Barômetro|Termômetro|Anemômetro|O dedo molhado no vento
Qual é o nome da galáxia que abriga o Sistema Solar?|Via Láctea|Andrômeda|Triângulo|Galáxia Muito, Muito Distante
Quem pintou a Mona Lisa?|Leonardo da Vinci|Michelangelo|Pablo Picasso|Leonardo DiCaprio
Quem escreveu 'Dom Casmurro'?|Machado de Assis|José de Alencar|Graciliano Ramos|O próprio Bentinho
Em que país nasceram os Jogos Olímpicos da Antiguidade?|Grécia|Itália|Egito|França
Em qual século ocorreu a chegada dos portugueses ao Brasil, no ano de 1500?|Século XV|Século XVI|Século XIV|Século XVII
Qual invenção é associada a Gutenberg na Europa?|Imprensa de tipos móveis|Telefone|Rádio|A impressora que sempre fica sem tinta
Qual tratado encerrou formalmente a guerra entre Alemanha e Aliados após a Primeira Guerra Mundial?|Tratado de Versalhes|Tratado de Tordesilhas|Tratado de Utrecht|Tratado de Paris de 1763
Em que país fica a cidade histórica de Pompeia?|Itália|Espanha|Grécia|Turquia
Quem compôs a Nona Sinfonia, incluindo a 'Ode à Alegria'?|Beethoven|Mozart|Chopin|Vivaldi
Qual civilização construiu Machu Picchu?|Inca|Maia|Asteca|Romana
A Revolução Francesa começou em qual ano?|1789|1689|1889|1799
Quem venceu a eleição presidencial brasileira de 1989?|Fernando Collor|José Sarney|Itamar Franco|Tancredo Neves
Quem escreveu 'O Pequeno Príncipe'?|Antoine de Saint-Exupéry|Jules Verne|Victor Hugo|Albert Camus
Qual dessas figuras é conhecida por defender a teoria da relatividade?|Albert Einstein|Isaac Newton|Charles Darwin|Nikola Tesla
Qual povo é associado à criação da escrita cuneiforme?|Sumérios|Astecas|Incas|Vikings
Qual povo construiu a cidade de Tenochtitlán?|Astecas|Incas|Maias|Romanos
Em que ano começou oficialmente a Segunda Guerra Mundial na Europa?|1939|1914|1945|1929
Qual foi a década da Revolução dos Cravos, em Portugal?|1970|1950|1980|1990
Qual destas figuras é conhecida pelo trabalho com radioatividade?|Marie Curie|Ada Lovelace|Frida Kahlo|O Hulk antes da transformação
Qual cientista formulou, independentemente de Darwin, uma teoria de seleção natural?|Alfred Russel Wallace|Gregor Mendel|Louis Pasteur|Carl Linnaeus
Qual cidade sediou os Jogos Olímpicos de 2016?|Rio de Janeiro|Londres|Tóquio|Pequim
Qual clube revelou Neymar no futebol profissional?|Santos|Palmeiras|Flamengo|Corinthians
Qual país venceu a Copa do Mundo masculina de futebol de 2002?|Brasil|Alemanha|França|Argentina
Qual seleção venceu a Copa do Mundo masculina de 2014?|Alemanha|Brasil|Holanda|Espanha
Qual seleção venceu a Copa do Mundo masculina de 2018?|França|Croácia|Alemanha|A seleção dos comentaristas
Qual seleção surpreendeu ao vencer a Eurocopa de 2004?|Grécia|Portugal|França|Inglaterra
Quem marcou o gol da vitória da Espanha na final da Copa do Mundo de 2010?|Andrés Iniesta|Xavi Hernández|David Villa|Fernando Torres
Qual clube brasileiro venceu a Libertadores da América em 2005?|São Paulo|Santos|Internacional|Grêmio
Qual é a distância oficial de uma maratona?|42,195 km|40 km|41,5 km|45 km
Qual é o nome do torneio de tênis disputado em quadras de saibro em Paris?|Roland-Garros|Wimbledon|US Open|Australian Open
Qual jogador brasileiro ganhou o apelido de “Doutor” e brilhou no Corinthians nos anos 1980?|Sócrates|Zico|Falcão|Rivelino
Qual desses clubes é conhecido como 'Galo'?|Atlético Mineiro|Botafogo|Santos|Grêmio
Qual estádio é tradicionalmente associado ao Flamengo e ao Fluminense no Rio?|Maracanã|Morumbi|Mineirão|Beira-Rio
Em qual esporte os jogadores usam tacos para colocar uma bola em buracos no campo?|Golfe|Beisebol|Hóquei|Críquete
Qual país sediou a Copa do Mundo de futebol de 1954?|Suíça|Suécia|França|Chile
Qual jogador brasileiro ficou conhecido como 'Rei do Futebol'?|Pelé|Zico|Ronaldo|Romário
Qual brasileira conquistou títulos de simples em Wimbledon nos anos 1950 e 1960?|Maria Esther Bueno|Bia Haddad Maia|Teliana Pereira|Luisa Stefani
Qual esporte é associado a Michael Jordan?|Basquete|Futebol|Tênis|Natação
Qual brasileiro foi campeão mundial de Fórmula 1 em 1972 e 1974?|Emerson Fittipaldi|Nelson Piquet|Ayrton Senna|Rubens Barrichello
Em que ano o Instagram foi lançado?|2010|2005|2014|Na época das cavernas digitais
Qual empresa comprou o Instagram em 2012?|Facebook|Google|Microsoft|Amazon
Qual navegador de internet é conhecido pelo símbolo de uma raposa em volta de um globo?|Firefox|Chrome|Safari|Edge
Qual porta é utilizada normalmente pelo HTTPS?|443|80|21|25
Qual rede social ficou associada ao passarinho azul por muitos anos?|Twitter|Instagram|Pinterest|Reddit
Qual linguagem de programação é utilizada para dar interatividade a sites?|JavaScript|Java|Ruby|PHP
Quantos bits existem em um byte?|Oito|Quatro|Seis|Dezesseis
Qual destas siglas está associada à codificação de caracteres na internet?|UTF-8|GPS|HDMI|PDF
O que significa a sigla WWW?|World Wide Web|World Wireless Window|Wide World Windows|Willy Wonka Web
Qual tecla costuma atualizar uma página no navegador de PC?|F5|F1|F7|A tecla do desespero
Qual componente de computador guarda dados mesmo depois de desligado?|SSD|Memória RAM|Cache do processador|Registrador
Qual é a fórmula química da água?|H₂O|CO₂|NaCl|O₂
Qual linguagem é tradicionalmente utilizada em análises numéricas e cálculo científico?|Fortran|COBOL|HTML|CSS
Qual é o nome do mascote do Android?|Bugdroid|Tux|Clippy|O robozinho da faxina
Qual sistema da Microsoft veio depois do Windows 98 e antes do XP, no mercado doméstico?|Windows Me|Windows 7|Windows Vista|Windows 98 e Meio
Qual sistema transforma nomes de domínio em endereços IP?|DNS|SMTP|FTP|IMAP
Qual é o nome da enciclopédia colaborativa online?|Wikipédia|Netflix|Twitch|O grupo do condomínio
Qual é a plataforma de streaming musical conhecida pelas playlists?|Spotify|Paint|Notepad|WinRAR
Qual dessas empresas desenvolveu o navegador Chrome?|Google|Nintendo|Valve|Adobe
Qual ferramenta é tradicionalmente usada para editar páginas HTML em texto?|Editor de código|Calculadora|Antivírus|Reprodutor de DVD
Em qual franquia aparece o personagem Mario?|Super Mario|Sonic the Hedgehog|Minecraft|Halo
Qual personagem do Sonic costuma ser representado por uma raposa de duas caudas?|Tails|Knuckles|Shadow|Eggman
Qual jogo popular usa blocos para construir mundos?|Minecraft|FIFA|Tetris|Pedreiro Simulator 2000
Qual personagem come pontos em um labirinto?|Pac-Man|Kirby|Link|O aspirador de bolinhas
Em qual série de jogos aparece a região de Kanto?|Pokémon|The Sims|God of War|Gran Turismo
Qual série de jogos tem o personagem Kratos?|God of War|Hollow Knight|Portal|Animal Crossing
Qual personagem é um encanador vestido de verde no universo Mario?|Luigi|Wario|Toad|Bowser
Qual personagem aparece como protagonista de The Legend of Zelda em muitos jogos?|Link|Zelda|Ganondorf|Epona
Qual destes jogos é conhecido por montar linhas com peças que caem?|Tetris|Doom|Among Us|Pong
Em qual jogo os jogadores descobrem um impostor em uma nave?|Among Us|The Sims|Forza Horizon|Terraria
Qual personagem de desenho mora em um abacaxi no fundo do mar?|Bob Esponja|Popeye|Pica-Pau|Tom
Qual desenho tem os personagens Homer, Marge, Bart e Lisa?|Os Simpsons|Futurama|South Park|Family Guy
Qual personagem da Disney é um pato conhecido por usar roupa de marinheiro?|Pato Donald|Pateta|Mickey|Tio Patinhas
Qual filme da Pixar apresenta Woody e Buzz Lightyear?|Toy Story|Carros|Up|Procurando Nemo
Qual filme da Pixar apresenta o cowboy Woody e Buzz Lightyear?|Toy Story|Carros|Up|Procurando Nemo
Qual série apresenta a cidade fictícia de Hawkins?|Stranger Things|Breaking Bad|Lost|Dark
Qual cantora brasileira ficou conhecida internacionalmente pelo sucesso “Envolver”?|Anitta|Ivete Sangalo|Marisa Monte|Gal Costa
Qual artista brasileira é conhecida pelo hit 'Envolver'?|Anitta|Ivete Sangalo|Marisa Monte|Gal Costa
Qual destes gêneros musicais é associado a DJs e bailes brasileiros?|Funk carioca|Ópera barroca|Canto gregoriano|Valsa vienense
Qual cantora lançou o álbum '1989'?|Taylor Swift|Adele|Rihanna|Beyoncé
Qual cantor ficou conhecido como 'Rei do Pop'?|Michael Jackson|Elvis Presley|Freddie Mercury|O rei do karaokê da firma
Qual desses é um instrumento de percussão?|Tambor|Flauta|Clarinete|Violino
Qual destes filmes tem um navio que colide com um iceberg?|Titanic|Avatar|Matrix|O Cruzeiro do Frio
Qual desses personagens vive na Fenda do Biquíni?|Lula Molusco|Scooby-Doo|Pernalonga|Goku
Qual destes personagens mora na Fenda do Biquíni?|Lula Molusco|Scooby-Doo|Pernalonga|Goku
A influenciadora brasileira Virgínia é conhecida por qual sobrenome?|Fonseca|Azevedo|Pereira|Almeida
Qual rede social é utilizada principalmente para compartilhar fotos e reels?|Instagram|PowerPoint|Winamp|O grupo da família
Qual é o nome do objeto usado para guardar chuva longe da cabeça?|Guarda-chuva|Abajur|Escorredor|Ventilador
Qual objeto usamos para nos proteger da chuva?|Guarda-chuva|Guarda-roupa|Paraquedas|Ventilador
Qual destes objetos costuma ser utilizado para ler histórias impressas?|Livro|Prato|Colher|Sapato
Qual objeto é usado para escovar os dentes?|Escova de dentes|Pente|Pincel|Régua
Qual meio de transporte se desloca sobre trilhos?|Trem|Barco|Avião|Helicóptero
Qual cor resulta da mistura de tinta azul e amarela, em geral?|Verde|Roxo|Laranja|Rosa
Qual destes animais mia?|Gato|Cachorro|Cavalo|Pato
Qual destes animais é conhecido por miar?|Gato|Cachorro|Cavalo|Pato
Qual é o nome do dispositivo usado para apontar e clicar na tela de um PC?|Mouse|Modem|Roteador|Microfone
Qual dispositivo é usado para controlar o ponteiro do computador?|Mouse|Modem|Roteador|Microfone
Qual destes recipientes é apropriado para transportar água?|Garrafa|Travesseiro|Livro|Caderno
Qual jogo de tabuleiro utiliza rei, rainha e peões?|Xadrez|Dominó|Banco Imobiliário|Uno
Em qual jogo de tabuleiro existem peças chamadas rei e rainha?|Xadrez|Dominó|Banco Imobiliário|Damas
Qual estação do ano vem imediatamente antes do inverno no hemisfério sul?|Outono|Verão|Primavera|Nenhuma
Qual linguagem é usada principalmente para estruturar o conteúdo de páginas web?|HTML|CSS|SQL|Bash
Qual linguagem é usada principalmente para estilizar páginas web?|CSS|HTML|SQL|Python
Qual destes é um formato de documento portátil?|PDF|MP3|PNG|GIF
Qual linguagem é usada para definir a aparência de uma página web?|CSS|HTML|SQL|Python
Qual sistema de numeração usa apenas 0 e 1?|Binário|Decimal|Hexadecimal|Romano
Qual destas extensões é usada em documentos PDF?|.pdf|.mp3|.png|.gif
Como é chamada a fraude que tenta obter senhas por mensagens falsas?|Phishing|Streaming|Backup|Download
Como se chama o sistema que usa apenas os algarismos 0 e 1?|Binário|Decimal|Hexadecimal|Romano
Um pendrive é utilizado principalmente para quê?|Armazenar arquivos|Imprimir documentos|Aumentar o brilho do monitor|Melhorar o sinal do ventilador
Qual série brasileira retrata a rotina da Grande Família Silva?|A Grande Família|Toma Lá, Dá Cá|Tapas & Beijos|Sai de Baixo
Em qual aplicativo é comum compartilhar vídeos curtos na página "Para Você"?|TikTok|Google Maps|Word|Bloco de Notas com filtro
Quem interpretou o personagem Seu Madruga na série Chaves?|Ramón Valdés|Roberto Gómez Bolaños|Carlos Villagrán|Rubén Aguirre
Em qual esporte um jogador pode ser expulso após receber um cartão vermelho?|Futebol|Natação|Atletismo|Ginástica artística
Qual doce brasileiro é tradicionalmente preparado com leite condensado e chocolate?|Brigadeiro|Quindim|Pé de moleque|Boleto com granulado
Qual filme de animação apresenta uma família de super-heróis com uniformes vermelhos?|Os Incríveis|Toy Story|Shrek|Os Aposentados Incríveis
Em qual país surgiu a rede de restaurantes McDonald’s?|Estados Unidos|Canadá|Alemanha|Japão
Qual país venceu a Copa do Mundo masculina de 1994?|Brasil|Itália|Alemanha|Argentina
Em qual plataforma surgiu originalmente o famoso vídeo "Charlie Bit My Finger"?|YouTube|Instagram|Netflix|Spotify
Qual personagem é o protagonista da série de jogos Tomb Raider?|Lara Croft|Ellie Williams|Jill Valentine|Samus Aran
Qual instrumento musical é característico das rodas de samba?|Pandeiro|Gaita de foles|Violino|Harpa
Quem escreveu o romance brasileiro "Capitães da Areia"?|Jorge Amado|Machado de Assis|Clarice Lispector|Lima Barreto
Qual é o nome dado a uma mensagem enviada para muitas pessoas sem solicitação?|Spam|Backup|Cache|Upload
Qual filme apresenta o personagem Darth Vader?|Star Wars|Star Trek|Duna|Avatar
Qual marca criou o console PlayStation?|Sony|Nintendo|Microsoft|A fábrica dos controles perdidos
Qual destes alimentos é usado no preparo de guacamole?|Abacate|Cenoura|Beterraba|Maionese de dinossauro
Qual personagem é conhecido por dizer "Ao infinito e além"?|Buzz Lightyear|Woody|Shrek|Gru
Em qual país ficam as pirâmides de Gizé?|Egito|Grécia|Peru|Índia
Qual evento esportivo é realizado a cada quatro anos e reúne modalidades diversas?|Jogos Olímpicos|Copa Libertadores|Campeonato Brasileiro|Copa Davis
Qual cantora lançou a canção "Rolling in the Deep"?|Adele|Rihanna|Lady Gaga|Katy Perry
Em qual aplicativo as pessoas enviam mensagens por meio de grupos e conversas privadas?|WhatsApp|Paint|Bloco de Notas|Calculadora
Qual parte da bicicleta transmite o movimento dos pedais à roda traseira na maioria dos modelos?|Corrente|Guidão|Campainha|Refletor
Qual filme apresenta um parque habitado por dinossauros recriados geneticamente?|Jurassic Park|King Kong|Jumanji|Godzilla
Qual personagem usa calças quadradas e trabalha no Siri Cascudo?|Bob Esponja|Patrick|Plankton|Lula Molusco
Qual documento brasileiro é conhecido pela sigla CPF?|Cadastro de Pessoas Físicas|Carteira de Previdência Federal|Certidão de Pessoa Física|Cartão de Pagamento Familiar
Qual é a cidade conhecida como a "Cidade Maravilhosa" no Brasil?|Rio de Janeiro|São Paulo|Salvador|Brasília
Qual console da Nintendo ficou conhecido pelo controle que detecta movimentos?|Wii|Game Boy|Nintendo 64|Controle de TV na mão
Em qual filme os protagonistas precisam encontrar o peixe Nemo?|Procurando Nemo|O Espanta Tubarões|Rio|Happy Feet
Qual destes alimentos costuma ser preparado com mandioca ralada?|Biju|Risoto|Macarrão|Croissant
Qual é a capital do estado de Pernambuco?|Recife|Olinda|Caruaru|Petrolina`;

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
Qual dessas cidades é a capital da Austrália?|Canberra|Sydney|Melbourne|Perth|Brisbane|Adelaide
Qual país sediou os Jogos Olímpicos de 2020, realizados em 2021?|Japão|China|Brasil|França|Itália|Estados Unidos
Qual artista é conhecido pela música "Thriller"?|Michael Jackson|Prince|David Bowie|Elton John|Freddie Mercury|Justin Bieber
Qual rede social era famosa pelas comunidades e depoimentos no Brasil dos anos 2000?|Orkut|Twitter|TikTok|Snapchat|Reddit|Pinterest
Qual personagem aparece nos jogos da franquia Resident Evil?|Leon S. Kennedy|Nathan Drake|Kratos|Sonic|Mario|Crash Bandicoot
Qual destas cidades está localizada no Espírito Santo?|Guarapari|Campinas|Niterói|Santos|Paraty|Ribeirão Preto
Qual navegador da Microsoft sucedeu o Internet Explorer?|Microsoft Edge|Firefox|Chrome|Opera|Safari|Brave
Qual cantora brasileira é conhecida pela canção "Festa"?|Ivete Sangalo|Marisa Monte|Anitta|Pittty|Gal Costa|Elis Regina
Qual personagem é o criador do laboratório da série "O Laboratório de Dexter"?|Dexter|Johnny Bravo|Ben 10|Finn|Billy|Timmy Turner
Qual é a unidade usada para medir potência elétrica?|Watt|Volt|Ampere|Ohm|Pascal|Metro
Qual destes times brasileiros tem o apelido de "Galo"?|Atlético Mineiro|Fluminense|Palmeiras|Santos|Cruzeiro|Grêmio
Em qual país se encontra a cidade de Barcelona?|Espanha|Portugal|França|Itália|Alemanha|Bélgica
Qual destes personagens é um gato robótico vindo do futuro?|Doraemon|Pikachu|Garfield|Tom|Gato de Botas|Frajola`;

  const parse = (s,kind) => s.trim().split('\n').map((line,i) => {
    const [text, ...options] = line.split('|');
    if (options.length < 4 || new Set(options).size !== options.length) throw Error('Pergunta inválida: ' + (i+1));
    return {id: `${kind}${String(i+1).padStart(3,'0')}`, kind, text, options, correct:0};
  });
  const questions = parse(raw,'standard');
  const extended = parse(extendedRaw,'extended');

  const tricks = [
    {id:'trick-red',kind:'trick',mode:'click-red',text:'Clique no vermelho.'},
    {id:'trick-number',kind:'trick',mode:'click-number',text:'Clique no número desta pergunta.'},
    {id:'trick-dot',kind:'trick',mode:'click-dot',text:'Clique no ponto final.'},
    {id:'trick-cover',kind:'trick',mode:'drag-cover',text:'Encontre a resposta atrás da caixa.'},
    {id:'trick-double',kind:'trick',mode:'double-tap',text:'Clique duas vezes no disquete.'},
    {id:'trick-word',kind:'trick',mode:'click-word',text:'Clique na palavra certa.'},
    {id:'trick-window',kind:'trick',mode:'drag-window',text:'Mova a janela para encontrar a resposta.'},
    {id:'trick-hover',kind:'trick',mode:'hover',text:'Passe o cursor sobre o disquete sem clicar.',needs:'mouse'},
    {id:'trick-right',kind:'trick',mode:'right-click',text:'Clique com o botão direito no disquete.',needs:'mouse'},
    {id:'trick-hover2',kind:'trick',mode:'hover-target',text:'Encontre a pasta que reage ao cursor.',needs:'mouse'},
    {id:'trick-right2',kind:'trick',mode:'right-click-folder',text:'Abra o menu de contexto da pasta.',needs:'mouse'},
    {id:'trick-hold',kind:'trick',mode:'touch-hold',text:'Mantenha o dedo sobre a estrela por um segundo.',needs:'touch'},
    {id:'trick-cancel',kind:'trick',mode:'confirm-no',text:'Para prosseguir, cancele esta confirmação.'},
    {id:'trick-invisible',kind:'trick',mode:'blank-button',text:'Selecione o botão sem qualquer inscrição.'},
    {id:'trick-fake-popup',kind:'trick',mode:'fake-popup',text:'Feche a janela de aviso para continuar.'},
    {id:'trick-label',kind:'trick',mode:'word-target',text:'Clique na palavra "palavra" desta instrução.',word:'palavra'},
    {id:'trick-tempo',kind:'trick',mode:'word-target',text:'Qual é a palavra "qual" presente neste enunciado?',word:'Qual'},
    {id:'trick-clique',kind:'trick',mode:'word-target',text:'Clique na palavra "clique", não nas alternativas.',word:'Clique'},
    {id:'trick-azul',kind:'trick',mode:'word-target',text:'A resposta é a palavra "azul" desta frase.',word:'azul'},
    {id:'trick-final',kind:'trick',mode:'word-target',text:'Clique na palavra "final" antes de terminar.',word:'final'},
    {id:'trick-empty',kind:'trick',mode:'blank-button',text:'Escolha a alternativa que não apresenta texto.'},
    {id:'trick-x',kind:'trick',mode:'fake-popup',text:'Existe um aviso bloqueando sua resposta. Remova-o.'},
    {id:'trick-stop',kind:'trick',mode:'confirm-no',text:'Escolha a opção que interrompe a operação para prosseguir.'},
    {id:'trick-drag-note',kind:'trick',mode:'drag-cover',text:'O bilhete está cobrindo a informação necessária.'},
    {id:'trick-drag-file',kind:'trick',mode:'drag-window',text:'Afaste a janela sobreposta antes de responder.'},
    {id:'trick-count-hearts',kind:'trick',mode:'count-hearts',text:'Quantos espaços de vida há nesta fase?'},
    {id:'trick-count-hearts2',kind:'trick',mode:'count-hearts',text:'Conte o total de corações exibidos acima, inclusive os vazios.'},
    {id:'trick-number2',kind:'trick',mode:'click-number',text:'A resposta está no número mostrado no cabeçalho.'},
    {id:'trick-right3',kind:'trick',mode:'right-click',text:'Este disquete não responde ao botão esquerdo.',needs:'mouse'},
    {id:'trick-hover3',kind:'trick',mode:'hover',text:'Aproxime o ponteiro do ícone sem pressioná-lo.',needs:'mouse'},
    {id:'trick-color-words',kind:'trick',mode:'color-words',text:'Clique na palavra escrita na cor azul.'},
    {id:'trick-bigger',kind:'trick',mode:'big-button',text:'Escolha o maior botão, não o maior número.'},
    {id:'trick-hold-universal',kind:'trick',mode:'hold-universal',text:'Mantenha o botão pressionado até completar um segundo.'},
    {id:'trick-fourth',kind:'trick',mode:'fourth-word',text:'Clique na quarta palavra desta pergunta.'},
  ];
  const minigames = [
    {id:'mini-order',kind:'mini',mode:'order',text:'Selecione os números em ordem crescente.'},
    {id:'mini-find',kind:'mini',mode:'find',text:'Encontre a estrela diferente.'},
    {id:'mini-memory',kind:'mini',mode:'pairs',text:'Encontre os pares correspondentes.'},
    {id:'mini-count',kind:'mini',mode:'count',text:'Conte os quadrados azuis.'},
    {id:'mini-path',kind:'mini',mode:'path',text:'Siga os números em sequência.'},
    {id:'mini-bug',kind:'mini',mode:'bug',text:'Encontre o inseto diferente.'},
    {id:'mini-color',kind:'mini',mode:'color',text:'Selecione apenas as peças verdes.'},
    {id:'mini-arrows',kind:'mini',mode:'arrows',text:'Memorize e repita a sequência de setas.'},
    {id:'mini-order6',kind:'mini',mode:'order',amount:6,text:'Coloque seis números em ordem crescente.'},
    {id:'mini-order7',kind:'mini',mode:'order',amount:7,text:'Selecione os sete números na ordem correta.'},
    {id:'mini-moon',kind:'mini',mode:'find',targetIcon:'☾',otherIcon:'☽',text:'Encontre a lua crescente invertida.'},
    {id:'mini-flower',kind:'mini',mode:'find',targetIcon:'✿',otherIcon:'❀',text:'Encontre a flor diferente.'},
    {id:'mini-stars',kind:'mini',mode:'find',targetIcon:'✪',otherIcon:'✩',text:'Encontre a estrela preenchida.'},
    {id:'mini-shapes',kind:'mini',mode:'find',targetIcon:'⬢',otherIcon:'⬡',text:'Encontre a figura preenchida.'},
    {id:'mini-pairs2',kind:'mini',mode:'pairs',symbols:['☀','☂','♫','☕'],text:'Encontre os pares de símbolos.'},
    {id:'mini-pairs3',kind:'mini',mode:'pairs',symbols:['♠','♥','♦','♣'],text:'Encontre os pares de cartas.'},
    {id:'mini-count2',kind:'mini',mode:'count',color:'#de5d4c',text:'Quantos quadrados vermelhos aparecem?'},
    {id:'mini-count3',kind:'mini',mode:'count',color:'#349a70',text:'Conte os quadrados verdes.'},
    {id:'mini-count4',kind:'mini',mode:'count',color:'#c4962b',text:'Conte os quadrados amarelos.'},
    {id:'mini-arrows2',kind:'mini',mode:'arrows',amount:5,text:'Memorize cinco setas na ordem apresentada.'},
    {id:'mini-arrows3',kind:'mini',mode:'arrows',amount:6,text:'Repita a sequência de seis setas.'},
    {id:'mini-maze',kind:'mini',mode:'maze',text:'Conduza o quadrado azul até a bandeira.'},
    {id:'mini-maze2',kind:'mini',mode:'maze',text:'Encontre o caminho livre até a saída.'},
    {id:'mini-maze3',kind:'mini',mode:'maze',text:'Atravesse o labirinto sem passar pelos blocos.'},
    {id:'mini-target',kind:'mini',mode:'target',text:'Acerte o alvo em três posições.'},
    {id:'mini-target2',kind:'mini',mode:'target',amount:4,text:'Encontre o alvo em quatro posições.'},
    {id:'mini-target3',kind:'mini',mode:'target',amount:5,text:'Toque no alvo cinco vezes.'},
    {id:'mini-lights',kind:'mini',mode:'lights',text:'Apague todas as luzes do painel.'},
    {id:'mini-lights2',kind:'mini',mode:'lights',text:'Faça todas as luzes ficarem apagadas.'},
    {id:'mini-reaction',kind:'mini',mode:'reaction',text:'Espere o sinal verde e clique no momento certo.'},
    {id:'mini-reaction2',kind:'mini',mode:'reaction',text:'Aguarde a mudança de cor para pressionar.'},
    {id:'mini-color2',kind:'mini',mode:'color',text:'Selecione todas as peças verdes sem tocar nas azuis.'},
  ];

  // Dificuldade interna: invisível ao jogador e sem ordenação crescente.
  const hardIds=new Set(['standard019','standard041','standard076','standard078','standard084','standard089','standard097','standard102','standard110','standard117','standard118','standard121','standard125','standard127','standard129','standard130','standard143','standard144','standard145','standard154','extended004','extended007','extended009','extended011']);
  const mediumIds=new Set(['standard006','standard007','standard008','standard009','standard011','standard017','standard018','standard020','standard024','standard025','standard028','standard030','standard031','standard032','standard033','standard034','standard035','standard039','standard042','standard043','standard044','standard045','standard050','standard051','standard053','standard055','standard057','standard058','standard059','standard061','standard062','standard064','standard067','standard070','standard071','standard072','standard073','standard074','standard075','standard077','standard081','standard083','standard085','standard086','standard087','standard088','standard090','standard092','standard094','standard095','standard096','standard098','standard100','standard101','standard103','standard105','standard106','standard108','standard109','standard111','standard114','standard115','standard116','standard119','standard120','standard124','standard126','standard128','standard131','standard132','standard133','standard135','standard137','standard140','standard141','standard142','standard145','standard151','standard157','standard165','standard169','standard194']);
  for(const q of questions){q.difficulty=hardIds.has(q.id)?'hard':mediumIds.has(q.id)?'medium':'easy';}
  // As novas questões de cultura geral são fáceis ou médias, com algumas mais específicas.
  for(const i of [200,201,202,204,206,208,209,210,211,213,215,216,218,220,222,223,224,225,226,227,228,229])questions[i-1].difficulty='medium';
  for(const i of [203,207,212,214,217,221])questions[i-1].difficulty='hard';
  for(const q of extended)q.difficulty=hardIds.has(q.id)?'hard':['extended001','extended003','extended006','extended008','extended010','extended012','extended017','extended020','extended022'].includes(q.id)?'medium':'easy';
  for(const q of tricks){q.difficulty=['trick-number','trick-red','trick-color-words','trick-bigger','trick-fourth','trick-hover2','trick-right2','trick-count-hearts2'].includes(q.id)?'hard':['trick-cover','trick-double','trick-cancel','trick-stop','trick-invisible','trick-hold-universal'].includes(q.id)?'easy':'medium';}
  for(const q of minigames){q.difficulty=['mini-arrows2','mini-arrows3','mini-maze3','mini-lights','mini-lights2','mini-reaction'].includes(q.id)?'hard':['mini-find','mini-order','mini-count','mini-count2','mini-count3','mini-count4','mini-flower','mini-target'].includes(q.id)?'easy':'medium';}

  // Ajuste editorial: níveis escondidos e equilibrados, sem indicar a dificuldade na interface.
  const upgradeHard=new Set(['standard007','standard009','standard011','standard017','standard025','standard030','standard034','standard039','standard044','standard050','standard067','standard071','standard074','standard077','standard085','standard090','standard095','standard101','standard105','standard108','standard116','standard119','standard133','standard142','extended010']);
  const upgradeEasy=new Set(['standard024','standard031','standard032','standard042','standard053','standard070','standard075','standard086','standard092','standard094','standard111']);
  for(const q of [...questions,...extended,...tricks,...minigames]){
    if(upgradeHard.has(q.id))q.difficulty='hard';
    else if(upgradeEasy.has(q.id))q.difficulty='easy';
  }
  window.CLASSIQUIZ_DATA_B3=Object.freeze({questions,extended,tricks,minigames,version:'1.0.3',bankVersion:'B3'});
})();
