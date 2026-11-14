/* Hazelnut Hollow — world data. Areas are pure data (see SPEC §5).
   Coordinates: tiles are 48px. `row` = the tile row an entity stands on top of (feet y = row*48).
   Map is built from `fill` boxes so it is easy to read and edit: [x0, y0, x1, y1, char] inclusive.
   Chars: '#' solid, '=' one-way platform, '~' water, '.' empty. */
(function () {
  'use strict';
  const G = window.G;

  G.buildMap = function (w, h, fills) {
    const m = []; for (let y = 0; y < h; y++) m.push(new Array(w).fill('.'));
    for (const [x0, y0, x1, y1, ch] of fills) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (m[y] && x >= 0 && x < w) m[y][x] = ch;
    return m.map(r => r.join(''));
  };

  /* characters that can be met (look = how they are drawn; see art.js drawLook) */
  G.PEOPLE = {
    hoot: { name: 'Professor Hoot', look: { cre: 'owl', s: 1.5, acc: 'bowtie' } },
    pip: { name: 'Pip', look: { cre: 'mouse', s: 1.4, acc: 'scarf' } },
    wilf: { name: 'Wilf the Fox', look: { cre: 'fox', s: 1.5, acc: 'napkin' } },
    bettina: { name: 'Bettina Bugbright', look: { av: { skin: '#c98f62', hair: 'afro', hairCol: '#2b2118', body: 'dungarees', col1: '#7ed957', col2: '#ffe066', motif: 'flower', shoes: '#8d5a3b', hat: 'none', back: 'none', held: 'net', face: 'glasses', pet: 'none' } } },
    quill: { name: 'Captain Quill', look: { cre: 'hen', s: 1.4, acc: 'bowtie' } },
    mole: { name: 'Mole', look: { cre: 'mole', s: 1.4, acc: 'hardhat' } },
  };

  G.AREAS = {
    village: {
      name: 'Hazelnut Hollow', theme: 'village', music: 'village', w: 72, h: 15,
      fills: [
        [0, 0, 0, 14, '#'], [71, 0, 71, 14, '#'],
        [0, 12, 71, 14, '#'],
        [38, 12, 41, 13, '~'],               // duck pond
        [11, 10, 13, 10, '='],               // first low ledge (red gem)
        [24, 11, 27, 11, '#'], [26, 10, 27, 10, '#'],   // steps up
        [28, 8, 31, 8, '='],                 // high ledge (blue gem)
        [35, 10, 37, 10, '='],               // ledge by the well (red gem)
        [48, 10, 50, 10, '='], [52, 8, 54, 8, '='], [49, 6, 51, 6, '='],   // tree-house climb (yellow gem)
        [60, 10, 62, 10, '='], [63, 7, 65, 7, '='],    // last climb (blue + purple)
      ],
      spawn: { x: 3, row: 12 },
      decor: [
        { k: 'tree', x: 40 }, { k: 'bush', x: 110, v: 1 }, { k: 'cottage', x: 250, col: '#ffd9ec', roof: '#b77bff', w: 210, label: '👗' },
        { k: 'flower', x: 360 }, { k: 'flower', x: 384 }, { k: 'lamp', x: 470 }, { k: 'tree', x: 690, col: '#7ed16a', s: 1.2 },
        { k: 'cottage', x: 980, col: '#fff1c2', roof: '#ff9f43', w: 260, label: '🧸' },
        { k: 'bunting', x: 840, w: 300, up: 240 }, { k: 'fence', x: 1120, n: 3 }, { k: 'flower', x: 1300 }, { k: 'bush', x: 1420 },
        { k: 'tree', x: 1490, s: 0.9 }, { k: 'lamp', x: 1640 }, { k: 'well', x: 1700 }, { k: 'mushroom', x: 1790 },
        { k: 'emoji', x: 1890, icon: '🦆', size: 34, up: 4 }, { k: 'bigtree', x: 2350 }, { k: 'flower', x: 2010 }, { k: 'bush', x: 2050, col: '#7ed16a', v: 1 },
        { k: 'lamp', x: 2240 }, { k: 'tree', x: 2600, col: '#ff9ec7' }, { k: 'flower', x: 2780 }, { k: 'flower', x: 2805 }, { k: 'bigflower', x: 2700, h: 150 },
        { k: 'mailbox', x: 2930 }, { k: 'pine', x: 3090 }, { k: 'rock', x: 3330 }, { k: 'bush', x: 3380 },
      ],
      ents: [
        { id: 'wardrobe', k: 'door', x: 5.2, row: 12, icon: '👗', col: '#b77bff', act: 'wardrobe', say: 'The dressing-up cottage!' },
        { id: 'hoot', k: 'npc', who: 'hoot', x: 8.5, row: 12, talk: [
          'Hoo-hoo! Welcome to Hazelnut Hollow!',
          'Sparkly gems are hidden all around. Touch one, then solve its puzzle to keep it.',
          'Gems open the big gates to new places. Jump up with the up button. Jump again in the air to go higher!',
        ] },
        { id: 'g-red1', k: 'gem', col: 'red', x: 12, row: 10 },
        { id: 'g-blue1', k: 'gem', col: 'blue', x: 16, row: 12 },
        { id: 'sign1', k: 'sign', x: 16.5, row: 12, text: 'Hazelnut Hollow. Please be kind to ducks.' },
        { id: 'pip', k: 'npc', who: 'pip', x: 22.5, row: 12, talk: [
          'Hello! I am Pip. This is my toy shop.',
          'The playroom door is next to me. Play with toys any time you like!',
        ] },
        { id: 'playdoor', k: 'door', x: 19.6, row: 12, icon: '🧸', col: '#ff9f43', act: 'play' },
        { id: 'g-blue2', k: 'gem', col: 'blue', x: 29.5, row: 8 },
        { id: 'gate-house', k: 'gate', x: 33, row: 12, to: 'house', label: 'Hush House', icon: '🏠', needs: { red: 1 } },
        { id: 'g-red2', k: 'gem', col: 'red', x: 36, row: 10 },
        { id: 'g-green1', k: 'gem', col: 'green', x: 39.5, row: 10.5 },
        { id: 'gate-cafe', k: 'gate', x: 44.5, row: 12, to: 'cafe', label: 'Twiggy Spoon Café', icon: '☕', needs: { blue: 1 } },
        { id: 'wilf', k: 'npc', who: 'wilf', x: 46.5, row: 12, talk: [
          'Good day! I am Wilf. I carry the plates at the Twiggy Spoon Café.',
          'The café is through this gate. It needs one blue gem.',
        ] },
        { id: 'g-yellow1', k: 'gem', col: 'yellow', x: 50, row: 6 },
        { id: 'gate-meadow', k: 'gate', x: 57, row: 12, to: 'meadow', label: 'Bugglemead', icon: '🐞', needs: { green: 1 } },
        { id: 'bettina', k: 'npc', who: 'bettina', x: 59, row: 12, talk: [
          'Hello, bug friend! I am Bettina Bugbright.',
          'Bugglemead is full of beetles, bees and snails. Bring a green gem to open the gate!',
        ] },
        { id: 'g-blue3', k: 'gem', col: 'blue', x: 61, row: 10 },
        { id: 'g-purple1', k: 'gem', col: 'purple', x: 64, row: 7 },
        { id: 'gate-writing', k: 'gate', x: 67, row: 12, to: 'writing', label: 'Writing Wood', icon: '✏️', needs: { blue: 2 } },
        { id: 'quill', k: 'npc', who: 'quill', x: 69.3, row: 12, talk: [
          'Ahoy! Captain Quill here. I love writing letters.',
          'In Writing Wood we practise making letters the right way. Bring two blue gems!',
        ] },
      ],
    },
    writing: {
      name: 'Writing Wood', theme: 'woods', music: 'woods', w: 64, h: 15,
      fills: [
        [0, 0, 0, 14, '#'], [63, 0, 63, 14, '#'],
        [0, 12, 63, 14, '#'],
        [30, 12, 34, 13, '~'],               // ink pond
        [9, 9, 11, 9, '='], [20, 10, 22, 10, '='], [24, 8, 26, 8, '='],
        [36, 11, 38, 11, '#'], [39, 10, 41, 11, '#'],          // mossy bank
        [46, 9, 48, 9, '='], [50, 7, 52, 7, '='], [55, 10, 57, 10, '='],
      ],
      spawn: { x: 3, row: 12 },
      decor: [
        { k: 'pine', x: 60 }, { k: 'mushroom', x: 220 }, { k: 'logpile', x: 330 }, { k: 'flower', x: 520 }, { k: 'pine', x: 760, s: 1.2 },
        { k: 'lamp', x: 900 }, { k: 'rock', x: 1250 }, { k: 'emoji', x: 1530, icon: '🦢', size: 34, up: 2 },
        { k: 'campfire', x: 2470 }, { k: 'tent', x: 2380 }, { k: 'bigtree', x: 1120 }, { k: 'mushroom', x: 2300 }, { k: 'pine', x: 2560 },
        { k: 'bush', x: 2700 }, { k: 'lamp', x: 2860 }, { k: 'pine', x: 3000, s: 0.9 },
      ],
      ents: [
        { id: 'ww-back', k: 'door', x: 1.6, row: 12, icon: '🏡', col: '#8d5a3b', to: 'village', at: { x: 66, row: 12 } },
        { id: 'quill2', k: 'npc', who: 'quill', x: 5, row: 12, talk: [
          'Welcome aboard, writer! This is Writing Wood.',
          'Each letter tree teaches a letter family. Watch the pen, then follow the green dot.',
          'Finish a tree to win a blue gem. Practise again for coins!',
        ] },
        { id: 'lt-curly', k: 'lesson', x: 8, row: 12, icon: '🐛', col: '#9be05c', title: 'Curly caterpillar', letters: 'cadgoqe', say: 'Curly caterpillar letters! Start at the top, and go round like a c.' },
        { id: 'g-ww-blue1', k: 'gem', col: 'blue', x: 10, row: 9 },
        { id: 'lt-ladder', k: 'lesson', x: 15, row: 12, icon: '🪜', col: '#7ed16a', title: 'Long ladder', letters: 'litujy', say: 'Long ladder letters! Start at the top and go straight down.' },
        { id: 'g-ww-purple1', k: 'gem', col: 'purple', x: 25, row: 8 },
        { id: 'lt-robot', k: 'lesson', x: 21.5, row: 12, icon: '🤖', col: '#5fae5a', title: 'One-armed robot', letters: 'rnmhbkp', say: 'One-armed robot letters! Go down, back up, and over.' },
        { id: 'ws-cvc', k: 'lesson', x: 28, row: 12, icon: '🪨', title: 'Word stone', words: [['cat', '🐱'], ['dog', '🐶'], ['sun', '☀️'], ['hat', '🎩'], ['pig', '🐷'], ['bus', '🚌'], ['bed', '🛏️'], ['cup', '☕']], say: 'This is a word stone. Write a word on the lines. Sit each letter on the line!' },
        { id: 'g-ww-green1', k: 'gem', col: 'green', x: 32, row: 12.5 },
        { id: 'lt-zigzag', k: 'lesson', x: 43.5, row: 12, icon: '⚡', col: '#ffd95e', title: 'Zig-zag monster', letters: 'zvwxsf', say: 'Zig-zag monster letters! Sharp, pointy lines. Start at the top.' },
        { id: 'g-ww-blue2', k: 'gem', col: 'blue', x: 51, row: 7 },
        { id: 'g-ww-yellow1', k: 'gem', col: 'yellow', x: 56, row: 10 },
        { id: 'ws-cvc2', k: 'lesson', x: 60, row: 12, icon: '🪨', title: 'Big word stone', words: [['fish', '🐟'], ['shop', '🏪'], ['ship', '🚢'], ['frog', '🐸'], ['duck', '🦆'], ['milk', '🥛'], ['tree', '🌳'], ['star', '⭐']], say: 'A big word stone! These words have four letters. Take your time.' },
      ],
    },
  };
  for (const id in G.AREAS) G.AREAS[id].map = G.buildMap(G.AREAS[id].w, G.AREAS[id].h, G.AREAS[id].fills);
})();
