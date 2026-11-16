// Conteúdo novo do B6: Show do Milhozão, missões e casos de investigação.
const svgUri = (w, h, bg, fg, lines) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" rx="14" fill="${bg}"/><rect x="10" y="10" width="${w - 20}" height="${h - 20}" rx="10" fill="none" stroke="${fg}" stroke-width="4"/>` +
  lines.map((l, i) => `<text x="${w / 2}" y="${h / 2 + (i - (lines.length - 1) / 2) * 44 + 12}" font-family="Arial,sans-serif" font-size="${l.s || 34}" font-weight="700" text-anchor="middle" fill="${fg}">${l.t}</text>`).join('') + '</svg>');
const T0 = (y, m, d) => new Date(y, m - 1, d, 9, 0).getTime();

// ---------- Show do Milhozão: 10 rodadas x 6 perguntas (dificuldade crescente só dentro do show) ----------
// [tema, enunciado, correta, errada, errada, errada]
const show = [
 [ // 1
  ['curiosidades','Qual é a cor do céu em um dia claro e sem nuvens?','Azul','Verde','Vermelha','Marrom'],
  ['cotidiano','Quantos dias tem uma semana?','Sete','Cinco','Seis','Oito'],
  ['animais','Qual destes animais faz "miau"?','Gato','Cachorro','Vaca','Pato'],
  ['culinária','Qual fruta é amarela e tem formato curvo?','Banana','Maçã','Uva','Melancia'],
  ['cotidiano','Quantas rodas tem uma bicicleta?','Duas','Três','Quatro','Uma'],
  ['português','Qual é o oposto de "quente"?','Frio','Morno','Seco','Alto']],
 [ // 2
  ['ciência','Qual é o satélite natural da Terra?','Lua','Sol','Marte','Vênus'],
  ['cotidiano','Quantos meses tem um ano?','Doze','Dez','Onze','Treze'],
  ['ciência','Qual cor resulta da mistura de azul com amarelo?','Verde','Roxo','Laranja','Marrom'],
  ['ciência','Qual instrumento é usado para medir a temperatura?','Termômetro','Régua','Balança','Cronômetro'],
  ['cotidiano','Quantos dias tem um ano comum?','365','360','366','364'],
  ['matemática','Quanto é 5 mais 7?','12','11','13','10']],
 [ // 3
  ['ciência','Qual é o maior mamífero terrestre?','Elefante-africano','Girafa','Hipopótamo','Rinoceronte'],
  ['geografia','Em qual continente fica o Brasil?','América do Sul','África','Europa','Ásia'],
  ['literatura','Quem criou o Sítio do Picapau Amarelo?','Monteiro Lobato','Ziraldo','Maurício de Sousa','Machado de Assis'],
  ['matemática','Quanto é 9 vezes 6?','54','56','63','48'],
  ['ciência','Qual é o símbolo químico do sódio?','Na','S','So','Sd'],
  ['esportes','Qual esporte é praticado em piscina e tem estilos como crawl e borboleta?','Natação','Atletismo','Judô','Esgrima']],
 [ // 4
  ['geografia','Qual rio é o maior do mundo em volume de água?','Rio Amazonas','Rio Nilo','Rio Mississippi','Rio Yangtzé'],
  ['história','Qual foi o primeiro satélite artificial lançado ao espaço, em 1957?','Sputnik 1','Apollo 11','Voyager 1','Hubble'],
  ['geografia','Quantos estados tem o Brasil, sem contar o Distrito Federal?','26','27','25','28'],
  ['geografia','Qual é a capital da Espanha?','Madri','Barcelona','Sevilha','Valência'],
  ['ciência','Quem formulou a teoria da relatividade?','Albert Einstein','Isaac Newton','Niels Bohr','Max Planck'],
  ['geografia','Qual é a moeda oficial do Japão?','Iene','Yuan','Won','Rúpia']],
 [ // 5
  ['ciência','Qual é o osso mais longo do corpo humano?','Fêmur','Tíbia','Úmero','Fíbula'],
  ['arte','Qual pintor holandês é famoso por ter cortado parte da própria orelha?','Vincent van Gogh','Rembrandt','Johannes Vermeer','Piet Mondrian'],
  ['curiosidades','Qual é o idioma mais falado no mundo como língua nativa?','Mandarim','Inglês','Espanhol','Hindi'],
  ['geografia','Qual é a capital da Turquia?','Ancara','Istambul','Izmir','Antália'],
  ['esportes','Quantos jogadores de cada time ficam em quadra no basquete?','Cinco','Seis','Sete','Quatro'],
  ['ciência','Qual vitamina o corpo produz quando a pele é exposta ao sol?','Vitamina D','Vitamina C','Vitamina A','Vitamina B12']],
 [ // 6
  ['ciência','Qual é o menor planeta do Sistema Solar?','Mercúrio','Marte','Vênus','Netuno'],
  ['literatura','Quem escreveu "Alice no País das Maravilhas"?','Lewis Carroll','Charles Dickens','Oscar Wilde','Mark Twain'],
  ['geografia','Qual é a capital do Peru?','Lima','Cusco','Quito','Bogotá'],
  ['história','Em que ano começou a Primeira Guerra Mundial?','1914','1918','1939','1905'],
  ['geografia','Qual é o maior deserto quente do mundo?','Saara','Gobi','Atacama','Kalahari'],
  ['música','Qual compositor brasileiro escreveu as "Bachianas Brasileiras"?','Heitor Villa-Lobos','Tom Jobim','Carlos Gomes','Chiquinha Gonzaga']],
 [ // 7
  ['ciência','Qual é o elemento químico mais abundante no universo?','Hidrogênio','Hélio','Oxigênio','Carbono'],
  ['história','Qual cidade foi capital do Brasil imediatamente antes de Brasília?','Rio de Janeiro','Salvador','São Paulo','Belo Horizonte'],
  ['história','Qual filósofo grego foi mestre de Alexandre, o Grande?','Aristóteles','Platão','Sócrates','Epicuro'],
  ['ciência','Quantos cromossomos tem uma célula humana comum (não reprodutiva)?','46','23','44','48'],
  ['geografia','Qual é a capital do Egito?','Cairo','Alexandria','Luxor','Gizé'],
  ['literatura','Qual peça de Shakespeare tem como protagonista o príncipe da Dinamarca?','Hamlet','Macbeth','Otelo','Rei Lear']],
 [ // 8
  ['ciência','Qual elemento químico tem número atômico 79?','Ouro','Prata','Platina','Mercúrio'],
  ['história','Em que ano foi proclamada a República no Brasil?','1889','1822','1930','1500'],
  ['geografia','Qual é a capital da Noruega?','Oslo','Estocolmo','Helsinque','Copenhague'],
  ['ciência','Qual organela celular é conhecida como a usina de energia da célula?','Mitocôndria','Ribossomo','Lisossomo','Núcleo'],
  ['música','Quem compôs a Nona Sinfonia, que traz o "Hino à Alegria"?','Ludwig van Beethoven','Wolfgang Amadeus Mozart','Johann Sebastian Bach','Antonio Vivaldi'],
  ['geografia','Qual país tem a maior costa marítima do mundo?','Canadá','Rússia','Austrália','Indonésia']],
 [ // 9
  ['geografia','Qual é a capital da Mongólia?','Ulan Bator','Pequim','Astana','Catmandu'],
  ['literatura','Quem escreveu "Os Lusíadas"?','Luís de Camões','Fernando Pessoa','Eça de Queirós','Gil Vicente'],
  ['geografia','Qual é o ponto mais alto da Terra acima do nível do mar?','Monte Everest','K2','Kilimanjaro','Aconcágua'],
  ['ciência','Qual é o nome da galáxia em que fica o Sistema Solar?','Via Láctea','Andrômeda','Triângulo','Sombrero'],
  ['ciência','Qual lei diz que a toda ação corresponde uma reação de mesma intensidade e sentido oposto?','Terceira Lei de Newton','Primeira Lei de Newton','Lei de Ohm','Lei de Boyle'],
  ['história','Em que ano começou a Revolução Francesa?','1789','1776','1804','1815']],
 [ // 10
  ['geografia','Qual rio atravessa a cidade de Bagdá?','Rio Tigre','Rio Eufrates','Rio Nilo','Rio Jordão'],
  ['ciência','Qual astrônomo formulou as três leis do movimento planetário?','Johannes Kepler','Nicolau Copérnico','Galileu Galilei','Tycho Brahe'],
  ['arte','Quem pintou "As Meninas" (Las Meninas)?','Diego Velázquez','Francisco de Goya','El Greco','Bartolomé Murillo'],
  ['ciência','Qual é o metal alcalino mais leve, de símbolo Li?','Lítio','Sódio','Potássio','Césio'],
  ['geografia','Qual é o menor país do mundo em área?','Vaticano','Mônaco','San Marino','Liechtenstein'],
  ['história','Qual tratado de 1494 dividiu as terras do Novo Mundo entre Portugal e Espanha?','Tratado de Tordesilhas','Tratado de Versalhes','Tratado de Utrecht','Tratado de Madri']]
];

// ---------- Missões ----------
// path/file são relativos à pasta do caso (a build converte para o caminho absoluto).
const missions = [
 {id:'m-note-1', d:'easy', text:'Abra o Bloco de Notas, escreva exatamente "ClaQui OS funciona" e salve o arquivo.', mission:{type:'notepad-text', app:'notepad', phrase:'ClaQui OS funciona'}},
 {id:'m-note-2', d:'easy', text:'No Bloco de Notas, escreva "Um clássico que nunca existiu" e salve o arquivo.', mission:{type:'notepad-text', app:'notepad', phrase:'Um clássico que nunca existiu'}},
 {id:'m-note-3', d:'medium', text:'Abra o Bloco de Notas, escreva "Olá Milhito" e salve o texto em qualquer pasta.', mission:{type:'notepad-text', app:'notepad', phrase:'Olá Milhito'}},
 {id:'m-calc-1', d:'easy', text:'Abra a Calculadora e calcule 12 × 12. O resultado precisa aparecer no visor.', mission:{type:'calc-result', app:'calc', target:144}},
 {id:'m-calc-2', d:'medium', text:'Na Calculadora, calcule 250 + 375 e deixe o resultado no visor.', mission:{type:'calc-result', app:'calc', target:625}},
 {id:'m-calc-3', d:'medium', text:'Use a Calculadora para dividir 1000 por 8.', mission:{type:'calc-result', app:'calc', target:125}},
 {id:'m-paint-1', d:'easy', text:'Abra o Paint e use o balde para pintar a forma de vermelho.', mission:{type:'paint-fill', app:'paint', color:'#d33848', shape:'circle', region:{cx:.5, cy:.5, r:.28}, coverage:.85}},
 {id:'m-paint-2', d:'medium', text:'No Paint, preencha o quadrado com a cor azul usando o balde.', mission:{type:'paint-fill', app:'paint', color:'#2c5db8', shape:'rect', region:{cx:.5, cy:.5, r:.24}, coverage:.85}},
 {id:'m-open-note-10', d:'medium', text:'Abra o Bloco de Notas e mantenha-o aberto por 10 segundos. Minimizar pausa a contagem; fechar zera.', mission:{type:'keep-open', app:'notepad', seconds:10}},
 {id:'m-open-calc-10', d:'medium', text:'Mantenha a Calculadora aberta por 10 segundos. Fechar zera; minimizar pausa.', mission:{type:'keep-open', app:'calc', seconds:10}},
 {id:'m-open-paint-20', d:'hard', text:'Mantenha o Paint aberto por 20 segundos. Minimizar pausa; fechar zera.', mission:{type:'keep-open', app:'paint', seconds:20}},
 {id:'m-open-explorer-20', d:'hard', text:'Deixe o Explorador de Arquivos aberto por 20 segundos, sem fechá-lo.', mission:{type:'keep-open', app:'explorer', seconds:20}},
 {id:'m-open-clock-10', d:'medium', text:'Abra o Relógio e deixe-o aberto por 10 segundos.', mission:{type:'keep-open', app:'clock', seconds:10}},
 {id:'m-explore-1', d:'medium', text:'No Explorador de Arquivos, encontre e abra o arquivo "relatorio-final.txt" dentro da pasta do caso. Use a busca se quiser.',
  mission:{type:'explorer-open', app:'explorer', path:'Documentos\\2026\\relatorio-final.txt', puzzle:{folder:'m-explore-1', files:[
   {path:'Documentos\\2025\\notas.txt', text:'Notas de 2025. Nada importante aqui.'}, {path:'Documentos\\2026\\rascunho.txt', text:'Rascunho do relatório.'},
   {path:'Documentos\\2026\\relatorio-final.txt', text:'Relatório final: tudo certo. Missão cumprida!'}, {path:'Fotos\\viagem.txt', text:'Lista de fotos da viagem.'}]}}},
 {id:'m-explore-2', d:'hard', text:'O ClaQui OS possui um arquivo oculto de configuração. No Explorador, encontre e abra "sistema.ini" dentro de Config.',
  mission:{type:'explorer-open', app:'explorer', path:'C:\\ClaQui\\Config\\sistema.ini'}},
 {id:'m-explore-3', d:'medium', text:'Investigue o ClaQui OS: qual é o código da última verificação de manutenção? Procure no registro do sistema, abra o documento e digite o código.',
  mission:{type:'os-file-answer', app:'explorer', path:'C:\\ClaQui\\Registros\\manutencao.log', answer:'CQ-47', accept:['cq47']}},
 {id:'m-trash-1', d:'medium', text:'Abra a Lixeira e restaure o documento "Contrato.txt" para a pasta original.',
  mission:{type:'trash-restore', app:'trash', name:'Contrato.txt', puzzle:{folder:'m-trash-1', files:[], trash:[
   {id:'t1', name:'Contrato.txt', originalPath:'Documentos\\Contrato.txt', text:'Contrato de aluguel.', kind:'text', size:24},
   {id:'t2', name:'Recibo.txt', originalPath:'Documentos\\Recibo.txt', text:'Recibo de pagamento.', kind:'text', size:22}]}}},
 {id:'m-trash-2', d:'medium', text:'Na Lixeira há uma receita apagada. Restaure o arquivo "Receita-de-bolo.txt".',
  mission:{type:'trash-restore', app:'trash', name:'Receita-de-bolo.txt', puzzle:{folder:'m-trash-2', files:[], trash:[
   {id:'t1', name:'Receita-de-bolo.txt', originalPath:'Cozinha\\Receita-de-bolo.txt', text:'Ovos, farinha, açúcar e fermento.', kind:'text', size:34},
   {id:'t2', name:'Lista-de-compras.txt', originalPath:'Cozinha\\Lista-de-compras.txt', text:'Leite, pão, café.', kind:'text', size:18}]}}},
 {id:'m-view-1', d:'easy', text:'Abra o Visualizador, observe a imagem da placa e digite o número da porta.',
  mission:{type:'viewer-answer', app:'viewer', file:'placa.svg', answer:'7', accept:['sete','porta 7'], puzzle:{folder:'m-view-1', files:[
   {path:'placa.svg', kind:'image', src:svgUri(420, 220, '#f4e9a8', '#5a3b00', [{t:'PORTA', s:40}, {t:'7', s:80}])}]}}},
 {id:'m-view-2', d:'medium', text:'Abra o cartaz no Visualizador e responda: até que horas a oficina fica aberta? (apenas o número)',
  mission:{type:'viewer-answer', app:'viewer', file:'cartaz.svg', answer:'18', accept:['18h','18 h','18 horas','as 18'], puzzle:{folder:'m-view-2', files:[
   {path:'cartaz.svg', kind:'image', src:svgUri(520, 240, '#d8ecf7', '#15496b', [{t:'OFICINA DO ZÉ', s:34}, {t:'ABERTO ATÉ 18H', s:30}])}]}}},
 {id:'m-view-3', d:'medium', text:'No Visualizador, abra a imagem da sala e diga qual é a cor citada nela.',
  mission:{type:'viewer-answer', app:'viewer', file:'sala.svg', answer:'azul', accept:['sala azul'], puzzle:{folder:'m-view-3', files:[
   {path:'sala.svg', kind:'image', src:svgUri(420, 220, '#bcd7ff', '#17356b', [{t:'SALA', s:40}, {t:'AZUL', s:64}])}]}}}
];

// ---------- Casos de investigação (histórias de 4 a 6 passos com arquivos reais no Explorador) ----------
// passo: [enunciado, correta, errada, errada, errada, dificuldade]
const cases = [
 {id:'bilhete', title:'O bilhete do professor', theme:'investigação', folder:'bilhete', files:[
   {path:'Recado.txt', text:'Turma do 7º B,\r\n\r\nA prova de Ciências foi adiada de terça-feira para quinta-feira.\r\nTragam lápis e borracha.\r\n\r\nAss.: Profa. Mara'},
   {path:'Presenca.txt', text:'Lista de presença de sexta-feira\r\n\r\nPresentes: Ana, Bruno, Carla\r\nAusentes: Elisa, Davi'},
   {path:'Avisos\\material.txt', hidden:true, text:'A pasta do material perdido é a VERDE.'},
   {path:'Avisos\\leia-me.txt', text:'Alguns arquivos desta pasta estão ocultos.'}],
  steps:[
   ['Use o botão "Abrir pasta do caso" e leia o Recado.txt. Para qual dia a prova de Ciências foi adiada?','Quinta-feira','Terça-feira','Sexta-feira','Segunda-feira','medium'],
   ['Quem assinou o recado?','Profa. Mara','Prof. Davi','Profa. Elisa','Diretor Bruno','medium'],
   ['Segundo Presenca.txt, quantos alunos faltaram na sexta-feira?','Dois','Três','Um','Cinco','medium'],
   ['Quais alunos estavam ausentes?','Elisa e Davi','Ana e Bruno','Bruno e Carla','Carla e Davi','medium'],
   ['Na subpasta Avisos há um arquivo oculto (ative "Mostrar ocultos"). De que cor é a pasta do material perdido?','Verde','Azul','Vermelha','Amarela','hard']]},
 {id:'estoque', title:'O estoque da papelaria', theme:'investigação', folder:'estoque', files:[
   {path:'Estoque.txt', text:'Estoque no início da semana\r\n\r\nLápis: 40\r\nCanetas: 25\r\nCadernos: 12\r\nBorrachas: 30'},
   {path:'Vendas.txt', text:'Vendas da semana\r\n\r\nSegunda: 5 canetas\r\nTerça: 10 lápis\r\nQuarta: 4 cadernos\r\nQuinta: 5 canetas'},
   {path:'Relatorios\\Semana.txt', text:'Reposição de cadernos: prazo de 3 dias.\r\nO produto mais crítico é aquele com menor estoque inicial.'}],
  steps:[
   ['Abra Estoque.txt. Quantos lápis havia no início da semana?','40','25','30','12','medium'],
   ['Em Vendas.txt, quantas canetas foram vendidas ao todo?','10','5','15','25','medium'],
   ['Quantas canetas restaram depois dessas vendas?','15','20','10','25','medium'],
   ['Qual produto tinha o menor estoque no início da semana?','Cadernos','Canetas','Lápis','Borrachas','medium'],
   ['Quantos cadernos restaram depois da venda de quarta-feira?','8','12','4','16','hard'],
   ['Em quantos dias sai a reposição de cadernos, segundo Relatorios\\Semana.txt?','Três','Dois','Cinco','Sete','medium']]},
 {id:'mapa', title:'O mapa do tesouro', theme:'investigação', folder:'mapa', files:[
   {path:'Mapa.txt', text:'Comece na árvore velha.\r\nAnde 10 passos para o norte.\r\nVire à direita e ande 5 passos.\r\nCave sob a pedra azul.'},
   {path:'Legenda.txt', text:'Norte: em direção ao rio.\r\nPedra azul: a única pedra perto do poço.'},
   {path:'Pistas\\Aviso.txt', text:'O tesouro NÃO está embaixo da árvore. Cuidado com o poço!'}],
  steps:[
   ['Leia Mapa.txt. Onde o caminho começa?','Na árvore velha','No poço','No rio','Na pedra azul','medium'],
   ['Quantos passos o mapa manda andar para o norte?','Dez','Cinco','Quinze','Vinte','medium'],
   ['Depois de andar para o norte, para qual lado é preciso virar?','Para a direita','Para a esquerda','Para o sul','Para o leste e para o oeste','medium'],
   ['Quantos passos o caminho tem, somando os dois trechos?','15','10','5','20','medium'],
   ['Segundo o mapa e o aviso, onde é preciso cavar?','Sob a pedra azul','Embaixo da árvore','Dentro do poço','No rio','hard']]},
 {id:'detetive', title:'Os arquivos do detetive', theme:'investigação', folder:'detetive', files:[
   {path:'caso-a.txt', text:'Caso A: o gato sumiu.', size:120, created:T0(2026,9,1), modified:T0(2026,10,1)},
   {path:'caso-b.txt', text:'Caso B: a bicicleta azul.', size:900, created:T0(2026,9,5), modified:T0(2026,10,15)},
   {path:'caso-c.txt', text:'Caso C: o relógio parado.', size:450, created:T0(2026,8,20), modified:T0(2026,9,20)},
   {path:'caso-d.txt', text:'Caso D: o bolo desaparecido.', size:300, created:T0(2026,10,10), modified:T0(2026,10,30)}],
  steps:[
   ['Abra a pasta do caso e use a visualização em lista (Detalhes). Qual arquivo foi modificado por último?','caso-d.txt','caso-a.txt','caso-b.txt','caso-c.txt','medium'],
   ['Qual é o maior arquivo da pasta, em tamanho?','caso-b.txt','caso-a.txt','caso-c.txt','caso-d.txt','medium'],
   ['Qual é o arquivo modificado há mais tempo?','caso-c.txt','caso-a.txt','caso-b.txt','caso-d.txt','medium'],
   ['Quantos arquivos existem na pasta do caso?','Quatro','Três','Cinco','Seis','hard']]}
];
module.exports = {show, missions, cases, svgUri};
