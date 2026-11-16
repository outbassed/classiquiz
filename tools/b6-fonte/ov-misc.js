// Correções de histórias, pegadinhas e minigames do B5 -> B6.  Chave de história: b5-story-<grupo>-<passo>
const T = 'pegadinha';
const trick = {
  'trick-red': {th: T, why: 'Mantida; tema unificado.'},
  'trick-number': {th: T, why: 'Mantida; botões errados numéricos gerados pela posição da questão.'},
  'trick-dot': {th: T, alts: ['Vírgula', 'Ponto e vírgula', 'Dois-pontos', 'Reticências'], why: 'Botões genéricos ("Nenhuma das anteriores") trocados por sinais de pontuação.'},
  'trick-cover': {th: T, why: 'Mantida.'},
  'trick-double': {th: T, why: 'Mantida.'},
  'trick-word': {th: T, alts: ['Errada', 'Duvidosa', 'Falsa', 'Incorreta'], why: 'Botões genéricos trocados por palavras do mesmo campo.'},
  'trick-window': {th: T, why: 'Mantida.'},
  'trick-hover': {th: T, why: 'Mantida (exclusiva de mouse).'},
  'trick-right': {th: T, why: 'Mantida (exclusiva de mouse).'},
  'trick-hover2': {th: T, why: 'Mantida (exclusiva de mouse).'},
  'trick-right2': {th: T, why: 'Mantida (exclusiva de mouse).'},
  'trick-hold': {th: T, why: 'Mantida (exclusiva de toque); tema unificado.'},
  'trick-cancel': {th: T, why: 'Mantida.'},
  'trick-invisible': {th: T, why: 'Mantida.'},
  'trick-fake-popup': {th: T, why: 'Mantida.'},
  'trick-label': {th: T, alts: ['Letra', 'Frase', 'Sílaba', 'Texto'], why: 'Botões genéricos trocados por termos de linguagem.'},
  'trick-tempo': {th: T, alts: ['Quem', 'Quanto', 'Onde', 'Quando'], why: 'Botões genéricos trocados por pronomes interrogativos.'},
  'trick-clique': {th: T, alts: ['Toque', 'Aperte', 'Pressione', 'Selecione'], why: 'Botões genéricos trocados por verbos de ação.'},
  'trick-azul': {th: T, alts: ['Vermelho', 'Verde', 'Amarelo', 'Roxo'], why: 'Botões genéricos trocados por cores.'},
  'trick-final': {th: T, alts: ['Início', 'Meio', 'Começo', 'Parcial'], why: 'Botões genéricos trocados por termos opostos/relacionados.'},
  'trick-empty': {drop: true, why: 'Duplicata de trick-invisible (mesmo mecanismo: botão sem inscrição).'},
  'trick-x': {drop: true, why: 'Duplicata de trick-fake-popup.'},
  'trick-stop': {drop: true, why: 'Duplicata de trick-cancel (mesmo mecanismo de confirmação).'},
  'trick-drag-note': {th: T, why: 'Mantida.'},
  'trick-drag-file': {th: T, why: 'Mantida.'},
  'trick-count-hearts': {th: T, why: 'Mantida.'},
  'trick-count-hearts2': {th: T, why: 'Mantida.'},
  'trick-number2': {th: T, why: 'Mantida; botões numéricos derivados da posição.'},
  'trick-right3': {th: T, why: 'Mantida (exclusiva de mouse).'},
  'trick-hover3': {th: T, why: 'Mantida (exclusiva de mouse).'},
  'trick-color-words': {th: T, why: 'Mantida.'},
  'trick-bigger': {th: T, why: 'Mantida.'},
  'trick-hold-universal': {th: T, why: 'Mantida.'},
  'trick-fourth': {th: T, alts: ['Primeira', 'Segunda', 'Terceira', 'Quinta'], why: 'Botões genéricos trocados por ordinais.'},
  'trick-title-close': {th: T, alts: ['V', 'Y', 'Z', 'U'], why: 'Botões genéricos trocados por letras.'},
  'trick-logo-symbol': {th: T, alts: ['Estrela', 'Coração', 'Raio', 'Nuvem'], why: 'Botões genéricos trocados por símbolos.'},
  'trick-start-button': {th: T, alts: ['Iniciar quiz', 'Começar de novo', 'Reiniciar a partida', 'Ir para o fim'], why: 'Botões genéricos trocados por rótulos plausíveis.'},
  'trick-title-minimize': {th: T, alts: ['Fechar', 'Maximizar', 'Restaurar', 'Ajuda'], why: 'Botões genéricos trocados por comandos de janela.'},
  'trick-title-maximize': {th: T, alts: ['Minimizar', 'Fechar', 'Restaurar', 'Ajuda'], why: 'Botões genéricos trocados por comandos de janela.'},
  'trick-current-version': {th: T, alts: ['Versão 1.0', 'Versão 1.2', 'Versão 3.0', 'Versão beta'], why: 'Botões genéricos trocados por versões.'},
  'trick-word-questao': {drop: true, why: 'Duplicata de trick-label (clicar numa palavra do enunciado).'},
  'trick-letter-last': {drop: true, why: 'Duplicata de trick-title-close (letra depois de W).'},
  'trick-title-close2': {th: T, alts: ['Letra Y', 'Letra Z', 'Letra V', 'Letra W'], why: 'Botões genéricos trocados por letras.'},
  'b5-trick-save': {th: T, why: 'Mantida.'},
  'b5-trick-x': {drop: true, why: 'Duplicata de trick-title-close ("o que vem depois de W").'},
  'b5-trick-context': {th: T, why: 'Mantida (menu de contexto próprio funciona com botão direito e toque longo).'},
  'b5-trick-number': {drop: true, why: 'Enunciado ambíguo ("o único número fora das alternativas") e redundante com trick-number.'},
  'b5-trick-task': {drop: true, why: 'Duplicata de trick-start-button.'},
  'b5-trick-min': {drop: true, why: 'Duplicata de trick-title-minimize.'},
  'b5-trick-plain': {drop: true, why: 'Enunciado ambíguo e redundante com trick-label.'}
};
const mini = {
  'mini-moon': {drop: true, why: 'Glifos ☾/☽ quase indistinguíveis; acessibilidade ruim.'},
  'mini-flower': {drop: true, why: 'Glifos ✿/❀ quase indistinguíveis.'},
  'mini-stars': {targetIcon: '★', otherIcon: '☆', why: 'Glifos trocados por estrela cheia x vazada (contraste claro).'},
  'mini-find-dot': {drop: true, why: 'Glifos ⬥/◆ quase indistinguíveis.'},
  'mini-pairs2': {symbols: ['☀', '☂', '♫', '☎'], why: 'Símbolo ☕ (renderizado como emoji colorido) trocado por ☎.'},
  'mini-pairs-icons': {symbols: ['♞', '☎', '★', '☂'], why: 'Símbolos ♟ e ☕ (emoji) trocados por ♞ e ☎.'},
  'mini-count-yellow': {drop: true, why: 'Duplicata de mini-count4 (contar quadrados amarelos).'},
  'mini-arrows4': {drop: true, why: 'Duplicata de mini-arrows2 (cinco setas).'},
  'mini-target4': {drop: true, why: 'Duplicata de mini-target2 (quatro alvos).'},
  'mini-color3': {drop: true, why: 'Duplicata de mini-color2.'},
  'mini-maze2': {drop: true, why: 'Labirinto idêntico ao mini-maze (mesmo mapa).'},
  'mini-maze4': {drop: true, why: 'Labirinto idêntico ao mini-maze (mesmo mapa).'},
  'mini-lights3': {drop: true, why: 'Duplicata de mini-lights2.'}
};
const S = (g, n, o) => { story[`b5-story-${g}-${n}`] = o; };
const story = {};
S('museu', 3, {o: ['Uma cópia', 'O diamante verdadeiro', 'O cofre inteiro', 'A placa ORIGINAL'], why: 'Alternativa "Uma joia do funcionário" não fazia parte da história.'});
S('hotel', 4, {o: ['Não', 'Sim', 'Levou a mala e deixou a chave', 'Levou metade das coisas'], why: 'Alternativa "Não é possível ter chave" era piada.'});
S('onibus', 5, {o: ['O motorista', 'O primeiro passageiro', 'O cobrador', 'Um fiscal'], why: 'Alternativas "Um cobrador imaginário" e "passageiro número 9" eram piadas.'});
S('gato', 3, {o: ['Não', 'Sim', 'Só pela janela', 'Só de madrugada'], why: 'Alternativa "Virou um cachorro" era piada.'});
S('gato', 5, {o: ['O gato dentro da caixa', 'O dono da casa', 'Um pássaro', 'Ninguém'], why: 'Alternativa "Um peixe" era piada.'});
S('foto', 4, {o: ['Não', 'Sim', 'Voltou para o celular', 'Só depois de reiniciar'], why: 'Alternativa "Ela virou vídeo" era piada.'});
S('foto', 5, {o: ['No computador', 'Na galeria do celular', 'Nos contatos do celular', 'No aplicativo de relógio'], why: 'Alternativas "câmera do vizinho/TV" eram piadas.'});
S('praia', 4, {o: ['O celular', 'Os chinelos', 'A roupa de banho', 'A touca de Duda'], why: 'Alternativa "O cabelo" era piada.'});
S('celular', 3, {o: ['Não', 'Sim', 'Foi para o bolso', 'Foi para a mesa'], why: 'Alternativa "Foi para a cozinha" era sem sentido.'});
S('taxi', 5, {o: ['O casaco', 'A carteira de Joana', 'O guarda-chuva de Paulo', 'O troco'], why: 'Alternativas "A chave da garagem/O banco" eram sem sentido.'});
module.exports = {trick, mini, story};
