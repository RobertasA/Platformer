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
    bramble: { name: 'Mrs Bramble', look: { cre: 'badger', s: 1.5, acc: 'chef' } },
    barnaby: { name: 'Barnaby Bear', look: { cre: 'bear', s: 1.7, acc: 'scarf' } },
    hettie: { name: 'Hettie Hedgehog', look: { cre: 'hedgehog', s: 1.3, acc: 'bowtie' } },
    ogden: { name: 'Ogden', look: { cre: 'ogre', s: 1.8, acc: 'napkin' } },
    rosie: { name: 'Rosie Rabbit', look: { cre: 'bunny', s: 1.5, acc: 'scarf' } },
    tuft: { name: 'Mr Tuft', look: { cre: 'tuft', s: 1.5, acc: 'bowtie' } },
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
        { id: 'pip', k: 'npc', who: 'pip', x: 22.5, row: 12, shop: true, talk: [
          'Hello! I am Pip. This is my toy shop.',
          'You can spend your coins on lovely things. Come and look!',
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
      name: 'Writing Wood', theme: 'woods', music: 'woods', w: 80, h: 15,
      fills: [
        [0, 0, 0, 14, '#'], [79, 0, 79, 14, '#'],
        [0, 12, 79, 14, '#'],
        [68, 9, 70, 9, '='],                 // Sentence Shore leaf
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
        { k: 'flower', x: 3250 }, { k: 'rock', x: 3420 }, { k: 'emoji', x: 3600, icon: '🐚', size: 30 }, { k: 'pine', x: 3700, s: 1.1 },
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
        { id: 'lt-caps', k: 'lesson', x: 37, row: 11, icon: '🏰', col: '#c79bff', title: 'Capital castle', letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', say: 'Capital letters are tall. They start at the top line.' },
        { id: 'lt-digits', k: 'lesson', x: 65, row: 12, icon: '🪺', col: '#ffb36b', title: 'Number nest', letters: '0123456789', say: 'Number letters! Start at the top, and take your time.' },
        { id: 'g-ww-blue3', k: 'gem', col: 'blue', x: 69, row: 8 },
        { id: 'ww-sign2', k: 'sign', x: 70.5, row: 12, text: 'Sentence Shore ✏️' },
        { id: 'ss-1', k: 'lesson', x: 75, row: 12, icon: '✏️', title: 'Sentence stone', sentences: [['I can run.', '🏃'], ['A cat sat.', '🐱'], ['I see a bus.', '🚌'], ['The dog ran.', '🐶'], ['I am six.', '🎂'], ['Mum is up.', '☀️']], say: 'A sentence stone! A sentence starts with a capital letter, has finger spaces, and ends with a full stop.' },
      ],
    },
    /* Hush House (SPEC §7.3): tiptoe to Mum's bed without waking her. hush:true turns on the noise meter.
       creak = noisy floorboards (tile span x0..x1), squeak = toy that squeaks when stepped on,
       check = night-light checkpoint, mdoor = maths door (red puzzle opens it), mum = the goal. */
    house: {
      name: 'Hush House', theme: 'house', music: 'house', w: 64, h: 15, hush: true,
      fills: [
        [0, 0, 0, 14, '#'], [63, 0, 63, 14, '#'],
        [0, 12, 63, 14, '#'],
        [7, 9, 12, 9, '='],                       // kitchen shelf over the creaky boards
        [20, 9, 26, 9, '='],                      // hall shelf
        [35, 10, 37, 10, '='], [38, 8, 41, 8, '='],   // bookcase climb
        [52, 9, 56, 9, '='],                      // bedroom shelf
      ],
      spawn: { x: 3, row: 12 },
      decor: [
        { k: 'fridge', x: 120 }, { k: 'stove', x: 230 }, { k: 'window', x: 330, up: 170, night: true }, { k: 'clock', x: 560 }, { k: 'plant', x: 610 },
        { k: 'picture', x: 780 }, { k: 'grandclock', x: 870 }, { k: 'rug', x: 1000, w: 120, col: '#b77bff' }, { k: 'picture', x: 1300, up: 150 }, { k: 'lamp', x: 1430 },
        { k: 'sofa', x: 1620 }, { k: 'rug', x: 1650, w: 140 }, { k: 'bookshelf', x: 1840 }, { k: 'window', x: 2050, up: 170, night: true }, { k: 'plant', x: 2200 },
        { k: 'wardrobe', x: 2420 }, { k: 'toybox', x: 2560 }, { k: 'window', x: 2700, up: 180, night: true }, { k: 'picture', x: 2930, up: 160 }, { k: 'cobweb', x: 3000 },
      ],
      ents: [
        { id: 'hh-back', k: 'door', x: 1.6, row: 12, icon: '🏡', col: '#8d5a3b', to: 'village', at: { x: 33, row: 12 } },
        { id: 'hh-sign', k: 'sign', x: 5, row: 12, text: 'Shh! Mum is fast asleep. Tiptoe to her bed and tuck her in. Creaky boards are noisy!' },
        { id: 'hh-cp0', k: 'check', x: 3, row: 12 },
        { id: 'hh-creak1', k: 'creak', x0: 8, x1: 11, x: 9.5, row: 12 },
        { id: 'hh-red1', k: 'gem', col: 'red', x: 9.5, row: 9 },
        { id: 'hh-door1', k: 'mdoor', x: 14, row: 12 },
        { id: 'hh-cp1', k: 'check', x: 16, row: 12 },
        { id: 'hh-duck', k: 'squeak', x: 18.5, row: 12, icon: '🐤' },
        { id: 'hh-creak2', k: 'creak', x0: 21, x1: 25, x: 23, row: 12 },
        { id: 'hh-yellow1', k: 'gem', col: 'yellow', x: 23, row: 9 },
        { id: 'hh-teddy', k: 'squeak', x: 28, row: 12, icon: '🐸' },
        { id: 'hh-door2', k: 'mdoor', x: 31, row: 12 },
        { id: 'hh-cp2', k: 'check', x: 33, row: 12 },
        { id: 'hh-creak3', k: 'creak', x0: 42, x1: 46, x: 44, row: 12 },
        { id: 'hh-purple1', k: 'gem', col: 'purple', x: 40, row: 8 },
        { id: 'hh-door3', k: 'mdoor', x: 48, row: 12 },
        { id: 'hh-cp3', k: 'check', x: 50, row: 12 },
        { id: 'hh-creak4', k: 'creak', x0: 52, x1: 56, x: 54, row: 12 },
        { id: 'hh-red2', k: 'gem', col: 'red', x: 54, row: 9 },
        { id: 'hh-mum', k: 'mum', x: 59.5, row: 12 },
      ],
    },

    /* Twiggy Spoon Café (SPEC §7.2d): cust = a customer at a table; ✋ opens an order card (js/cafe.js). */
    cafe: {
      name: 'The Twiggy Spoon Café', theme: 'cafe', music: 'village', w: 56, h: 15,
      fills: [
        [0, 0, 0, 14, '#'], [55, 0, 55, 14, '#'],
        [0, 12, 55, 14, '#'],
        [10, 9, 13, 9, '='],                      // cake shelf over the counter
        [18, 8, 20, 8, '='],                      // high jar shelf
        [27, 10, 28, 10, '='], [30, 8, 32, 8, '='],   // teacup steps
        [45, 9, 48, 9, '='],                      // pantry shelf
      ],
      spawn: { x: 3, row: 12 },
      decor: [
        { k: 'window', x: 150, up: 160, w: 90, h: 110 }, { k: 'menu', x: 290 }, { k: 'counter', x: 530, w: 240 }, { k: 'stove', x: 760 },
        { k: 'plant', x: 860 },
        { k: 'table', x: 14.9 * 48, col: '#fff', cloth: '#ff9ec7', icon: '🍯' }, { k: 'stool', x: 15.9 * 48, col: '#7ed16a' },
        { k: 'window', x: 1000, up: 160, w: 90, h: 110 }, { k: 'picture', x: 1180, up: 170 },
        { k: 'table', x: 23.4 * 48, col: '#fff', cloth: '#7fd8c8', icon: '🍵' }, { k: 'stool', x: 24.3 * 48, col: '#ffd95e' },
        { k: 'clock', x: 1300 }, { k: 'plant', x: 1440 }, { k: 'window', x: 1640, up: 160, w: 90, h: 110 },
        { k: 'table', x: 35.4 * 48, col: '#fff', cloth: '#ffd95e', icon: '🥧' }, { k: 'stool', x: 36.3 * 48, col: '#ff7a6a' },
        { k: 'bookshelf', x: 1900 }, { k: 'plant', x: 2000 }, { k: 'menu', x: 2420 },
        { k: 'table', x: 43.6 * 48, col: '#fff', cloth: '#c9b6ff', icon: '🧁' }, { k: 'stool', x: 44.6 * 48, col: '#4aa8ff' },
        { k: 'window', x: 2530, up: 160, w: 90, h: 110 },
      ],
      ents: [
        { id: 'cf-back', k: 'door', x: 1.6, row: 12, icon: '🏡', col: '#8d5a3b', to: 'village', at: { x: 44.5, row: 12 } },
        { id: 'bramble', k: 'npc', who: 'bramble', x: 6, row: 12, talk: [
          'Welcome to the Twiggy Spoon! I am Mrs Bramble.',
          'Our customers are hungry. Tap a customer to take their order.',
          'Serve all four and you can be a real waiter!',
        ] },
        { id: 'wilf2', k: 'npc', who: 'wilf', x: 9, row: 12, talk: [
          'I carry the plates. You take the orders!',
          'Look at the bubble over a customer. It shows what they need.',
        ] },
        { id: 'cf-blue1', k: 'gem', col: 'blue', x: 11.5, row: 9 },
        { id: 'cf-bear', k: 'cust', who: 'barnaby', kind: 'count', x: 13.6, row: 12 },
        { id: 'cf-red1', k: 'gem', col: 'red', x: 19, row: 8 },
        { id: 'cf-hettie', k: 'cust', who: 'hettie', kind: 'read', x: 22.3, row: 12 },
        { id: 'cf-green1', k: 'gem', col: 'green', x: 31, row: 8 },
        { id: 'cf-hoot', k: 'cust', who: 'hoot', kind: 'money', x: 34.1, row: 12 },
        { id: 'cf-ogden', k: 'cust', who: 'ogden', kind: 'write', x: 42.1, row: 12 },
        { id: 'cf-purple1', k: 'gem', col: 'purple', x: 46.5, row: 9 },
        { id: 'gate-woods', k: 'gate', x: 52, row: 12, to: 'woods', label: 'Whispering Woods', icon: '🌲', needs: { red: 2, blue: 1 } },
      ],
    },
    /* Bugglemead (SPEC §7.2e): bug = a minibeast to look at (js/meadow.js); sorter = Bettina's sorting hoops. */
    meadow: {
      name: 'Bugglemead', theme: 'meadow', music: 'meadow', w: 90, h: 15,
      fills: [
        [0, 0, 0, 14, '#'], [89, 0, 89, 14, '#'],
        [0, 12, 89, 14, '#'],
        [17, 9, 20, 9, '='],                      // leaf over the butterfly flowers
        [27, 10, 29, 10, '='], [31, 8, 33, 8, '='],   // up to the hive
        [44, 10, 47, 10, '='],                    // grasshopper leaf
        [49, 7, 51, 7, '='],                      // high leaf (yellow gem)
        [62, 12, 69, 13, '~'],                    // dragonfly pond
        [64, 9, 67, 9, '='],                      // lily leaf over the pond
        [75, 10, 77, 10, '='], [79, 8, 81, 8, '='],   // last climb (purple gem)
      ],
      spawn: { x: 3, row: 12 },
      decor: [
        { k: 'bigflower', x: 300, h: 170 }, { k: 'bush', x: 450 }, { k: 'flower', x: 700 }, { k: 'bigflower', x: 860, h: 230 }, { k: 'bigflower', x: 980, h: 150 },
        { k: 'flower', x: 1100 }, { k: 'mushroom', x: 1180 }, { k: 'mushroom', x: 1215, s: 0.6, col: '#ffb13c' }, { k: 'hive', x: 1490 }, { k: 'tree', x: 1580 },
        { k: 'rock', x: 1720 }, { k: 'bigflower', x: 1850, h: 200 }, { k: 'bush', x: 2000, v: 1 }, { k: 'flower', x: 2150 }, { k: 'tree', x: 2400, col: '#9be05c' },
        { k: 'bigflower', x: 2560, h: 180 }, { k: 'logpile', x: 2800 }, { k: 'logpile', x: 2850 }, { k: 'mushroom', x: 2920 }, { k: 'bigflower', x: 3420, h: 160 },
        { k: 'flower', x: 3500 }, { k: 'bush', x: 3650 }, { k: 'bigflower', x: 3800, h: 240 }, { k: 'rock', x: 3950, s: 0.8 }, { k: 'tree', x: 4100 },
      ],
      ents: [
        { id: 'bm-back', k: 'door', x: 1.6, row: 12, icon: '🏡', col: '#8d5a3b', to: 'village', at: { x: 55.5, row: 12 } },
        { id: 'bettina2', k: 'npc', who: 'bettina', x: 6, row: 12, lines: 'bettina', talk: [] },
        { id: 'bm-sort', k: 'sorter', x: 9.5, row: 12 },
        { id: 'bug-ladybird', k: 'bug', kind: 'ladybird', x: 14, row: 12, x0: 13, x1: 15.5 },
        { id: 'g-bm-green1', k: 'gem', col: 'green', x: 18.5, row: 9 },
        { id: 'bug-butterfly', k: 'bug', kind: 'butterfly', x: 21, row: 9.5, fly: true },
        { id: 'bug-snail', k: 'bug', kind: 'snail', x: 24, row: 12, x0: 23.5, x1: 25 },
        { id: 'bug-bee', k: 'bug', kind: 'bee', x: 32, row: 6.5, fly: true },
        { id: 'g-bm-red1', k: 'gem', col: 'red', x: 28, row: 10 },
        { id: 'bug-worm', k: 'bug', kind: 'worm', x: 36, row: 12, x0: 35, x1: 37 },
        { id: 'bug-ant', k: 'bug', kind: 'ant', x: 40, row: 12, x0: 39, x1: 42 },
        { id: 'bug-grasshopper', k: 'bug', kind: 'grasshopper', x: 46, row: 10, x0: 44.5, x1: 47 },
        { id: 'g-bm-yellow1', k: 'gem', col: 'yellow', x: 50, row: 7 },
        { id: 'bug-spider', k: 'bug', kind: 'spider', x: 54, row: 12, x0: 53, x1: 55 },
        { id: 'g-bm-green2', k: 'gem', col: 'green', x: 57, row: 12 },
        { id: 'bug-woodlouse', k: 'bug', kind: 'woodlouse', x: 59, row: 12, x0: 58.5, x1: 60 },
        { id: 'bug-dragonfly', k: 'bug', kind: 'dragonfly', x: 66, row: 10.5, fly: true },
        { id: 'g-bm-green3', k: 'gem', col: 'green', x: 72, row: 12 },
        { id: 'g-bm-purple1', k: 'gem', col: 'purple', x: 80, row: 8 },
        { id: 'bm-sign', k: 'sign', x: 83, row: 12, text: 'Teapot Tower is up the hill. Bring two green gems and one purple gem.' },
        { id: 'gate-tower', k: 'gate', x: 86, row: 12, to: 'tower', label: 'Teapot Tower', icon: '🫖', needs: { green: 2, purple: 1 } },
      ],
    },
    /* Teapot Tower (SPEC §7.2g): five floors joined by zig-zag shelf steps. Feet rows: ground 45, F1 37, F2 29, F3 21, balcony 13.
       curio = touch to collect (js/tower.js); shoes/post/case/cabinet = G.TOWER cards. */
    tower: {
      name: 'Teapot Tower', theme: 'tower', music: 'tower', w: 32, h: 48,
      fills: [
        [0, 0, 0, 47, '#'], [31, 0, 31, 47, '#'],
        [0, 45, 31, 47, '#'],                                              // ground floor
        [26, 43, 28, 43, '='], [28, 41, 30, 41, '='], [25, 39, 27, 39, '='],   // stairs up (right)
        [1, 37, 24, 38, '#'],                                              // F1: odd shoes
        [3, 35, 5, 35, '='], [1, 33, 3, 33, '='], [4, 31, 6, 31, '='],         // stairs up (left)
        [7, 29, 30, 30, '#'],                                              // F2: postcards
        [26, 27, 28, 27, '='], [28, 25, 30, 25, '='], [25, 23, 27, 23, '='],   // stairs up (right)
        [1, 21, 24, 22, '#'],                                              // F3: detective case
        [3, 19, 5, 19, '='], [1, 17, 3, 17, '='], [4, 15, 6, 15, '='],         // stairs up (left)
        [7, 13, 30, 14, '#'],                                              // balcony: curio cabinet
      ],
      spawn: { x: 3, row: 45 },
      decor: [
        { k: 'plant', x: 230, row: 45 }, { k: 'grandclock', x: 700, row: 45 }, { k: 'window', x: 1000, row: 42 },
        { k: 'window', x: 300, row: 34 }, { k: 'plant', x: 1050, row: 37 }, { k: 'clock', x: 820, row: 34 },
        { k: 'window', x: 1250, row: 26 }, { k: 'plant', x: 500, row: 29 }, { k: 'stove', x: 1300, row: 29 },
        { k: 'window', x: 330, row: 18 }, { k: 'plant', x: 1000, row: 21 }, { k: 'clock', x: 760, row: 18 },
        { k: 'teapot', x: 1390, row: 13 }, { k: 'plant', x: 600, row: 13 }, { k: 'lamp', x: 1150, row: 13 },
      ],
      ents: [
        { id: 'tw-back', k: 'door', x: 1.6, row: 45, icon: '🐞', col: '#8d5a3b', to: 'meadow', at: { x: 85, row: 12 } },
        { id: 'tuft', k: 'npc', who: 'tuft', x: 7, row: 45, lines: 'tuft', talk: [] },
        { id: 'tw-sign', k: 'sign', x: 11, row: 45, text: 'Teapot Tower. Climb the stairs! Six curios are hidden here.' },
        { id: 'cu-shell', k: 'curio', cid: 'shell', icon: '🐚', x: 17, row: 45 },
        { id: 'g-tw-red1', k: 'gem', col: 'red', x: 29, row: 41 },
        { id: 'cu-key', k: 'curio', cid: 'key', icon: '🗝️', x: 3, row: 37 },
        { id: 'tw-shoes', k: 'shoes', x: 13, row: 37 },
        { id: 'cu-feather', k: 'curio', cid: 'feather', icon: '🪶', x: 2, row: 33 },
        { id: 'cu-compass', k: 'curio', cid: 'compass', icon: '🧭', x: 10, row: 29 },
        { id: 'tw-post', k: 'post', x: 18, row: 29 },
        { id: 'g-tw-blue1', k: 'gem', col: 'blue', x: 28, row: 29 },
        { id: 'cu-marble', k: 'curio', cid: 'marble', icon: '🔮', x: 29, row: 25 },
        { id: 'g-tw-green1', k: 'gem', col: 'green', x: 3, row: 21 },
        { id: 'tw-case', k: 'case', x: 13, row: 21 },
        { id: 'g-tw-yellow1', k: 'gem', col: 'yellow', x: 2, row: 17 },
        { id: 'cu-fossil', k: 'curio', cid: 'fossil', icon: '🦴', x: 10, row: 13 },
        { id: 'tw-cabinet', k: 'cabinet', x: 20, row: 13 },
        { id: 'g-tw-purple1', k: 'gem', col: 'purple', x: 25.5, row: 13 },
      ],
    },
    /* Whispering Woods (SPEC §7.2h): dusk; fireflies (pick), trail signs, campfire story, rafts and a bouncy mushroom. */
    woods: {
      name: 'Whispering Woods', theme: 'woods', music: 'woods', w: 100, h: 15, dark: 0.3,
      fills: [
        [0, 0, 0, 14, '#'], [99, 0, 99, 14, '#'],
        [0, 12, 99, 14, '#'],
        [11, 10, 12, 10, '='], [15, 7, 18, 7, '='],                   // step + tree branch (red gem); mushroom at x14 is the fun way
        [28, 12, 35, 13, '~'],                                        // first stream (raft)
        [44, 10, 47, 10, '='], [49, 8, 52, 8, '='], [54, 6, 56, 6, '='],   // hollow-log steps (blue gem)
        [62, 10, 63, 10, '='], [64, 8, 65, 8, '='], [67, 6, 71, 6, '='],   // up to the high branch (firefly)
        [74, 12, 80, 13, '~'],                                        // second stream (raft)
      ],
      spawn: { x: 3, row: 12 },
      decor: [
        { k: 'bigtree', x: 200 }, { k: 'pine', x: 420, s: 1.6 }, { k: 'bush', x: 520 }, { k: 'bigtree', x: 820 }, { k: 'mushroom', x: 980 }, { k: 'pine', x: 1180, s: 1.3 },
        { k: 'tree', x: 1260, col: '#4f9a55' }, { k: 'rock', x: 1310 }, { k: 'pine', x: 1760, s: 1.8 }, { k: 'logpile', x: 2050 }, { k: 'bigtree', x: 2260 }, { k: 'mushroom', x: 2420, col: '#ffb13c' },
        { k: 'pine', x: 2700, s: 1.4 }, { k: 'bush', x: 2840, v: 1 }, { k: 'bigtree', x: 3250 }, { k: 'pine', x: 3480, s: 1.7 }, { k: 'rock', x: 3520, s: 0.8 }, { k: 'tree', x: 3960, col: '#4f9a55' },
        { k: 'mushroom', x: 4110 }, { k: 'bush', x: 4250 }, { k: 'pine', x: 4380, s: 1.5 }, { k: 'cavemouth', x: 4600 },
      ],
      ents: [
        { id: 'wd-back', k: 'door', x: 1.6, row: 12, icon: '☕', col: '#8d5a3b', to: 'cafe', at: { x: 50, row: 12 } },
        { id: 'rosie', k: 'npc', who: 'rosie', x: 6, row: 12, lines: 'rosie', talk: [] },
        { id: 'wd-sign', k: 'sign', x: 9, row: 12, text: 'Whispering Woods. Jump on the red mushroom to bounce!' },
        { id: 'wd-boing1', k: 'bounce', x: 14, row: 12 },
        { id: 'g-wd-red1', k: 'gem', col: 'red', x: 17, row: 7 },
        { id: 'wd-trail1', k: 'trail', col: 'green', x: 22.5, row: 12 },
        { id: 'wd-raft1', k: 'raft', x: 30, row: 12, x0: 29.6, x1: 34.4, w: 3 },
        { id: 'ff-1', k: 'pick', set: 'fireflies', icon: '✨', name: 'firefly', fly: true, x: 32, row: 10.6 },
        { id: 'wd-story', k: 'story', x: 40, row: 12 },
        { id: 'ff-2', k: 'pick', set: 'fireflies', icon: '✨', name: 'firefly', fly: true, x: 50.5, row: 6.6 },
        { id: 'g-wd-blue1', k: 'gem', col: 'blue', x: 55.5, row: 6 },
        { id: 'wd-trail2', k: 'trail', col: 'yellow', x: 59, row: 12 },
        { id: 'wd-boing2', k: 'bounce', x: 66.5, row: 12 },
        { id: 'ff-3', k: 'pick', set: 'fireflies', icon: '✨', name: 'firefly', fly: true, x: 70, row: 4.6 },
        { id: 'wd-raft2', k: 'raft', x: 76, row: 12, x0: 75.6, x1: 79.4, w: 3 },
        { id: 'ff-4', k: 'pick', set: 'fireflies', icon: '✨', name: 'firefly', fly: true, x: 77, row: 10.6 },
        { id: 'wd-trail3', k: 'trail', col: 'green', x: 84, row: 12 },
        { id: 'ff-5', k: 'pick', set: 'fireflies', icon: '✨', name: 'firefly', fly: true, x: 88.5, row: 11.4 },
        { id: 'wd-sign2', k: 'sign', x: 91.5, row: 12, text: 'Crystal Caves this way. Bring two yellow gems and two green gems.' },
        { id: 'gate-caves', k: 'gate', x: 95, row: 12, to: 'caves', label: 'Crystal Caves', icon: '💎', needs: { yellow: 2, green: 2 } },
      ],
    },
    /* Crystal Caves (SPEC §7.2h): dark (lantern helps); crystal chimes, warm stones (pick) for the dragon egg. */
    caves: {
      name: 'Crystal Caves', theme: 'caves', music: 'caves', w: 90, h: 15, dark: 0.8,
      fills: [
        [0, 0, 0, 14, '#'], [89, 0, 89, 14, '#'], [0, 0, 89, 1, '#'],
        [0, 12, 89, 14, '#'],
        [10, 2, 12, 3, '#'], [26, 2, 29, 4, '#'], [52, 2, 54, 3, '#'], [70, 2, 73, 4, '#'],   // stalactites
        [18, 10, 20, 10, '='], [22, 8, 24, 8, '='],                   // ledges (yellow gem)
        [32, 12, 38, 13, '~'],                                        // underground lake (raft, green gem)
        [43, 6, 46, 6, '='], [47, 10, 48, 10, '='], [49, 8, 50, 8, '='],   // high shelf (warm stone): crystal bounce at x41.5 or the steps
        [58, 11, 58, 11, '#'],                                        // stalagmite to hop
        [62, 10, 63, 10, '='], [65, 8, 67, 8, '='],                   // ledge (warm stone)
      ],
      spawn: { x: 3, row: 12 },
      decor: [
        { k: 'crystal', x: 260 }, { k: 'rock', x: 420, col: '#6d5fa8' }, { k: 'crystal', x: 800, col: '#7fe3ff' }, { k: 'crystal', x: 1180, col: '#ffe066' }, { k: 'rock', x: 1420, col: '#6d5fa8', s: 1.3 },
        { k: 'crystal', x: 1960, col: '#ff7eb6' }, { k: 'crystal', x: 2330 }, { k: 'rock', x: 2500, col: '#6d5fa8' }, { k: 'crystal', x: 2900, col: '#7ed957' }, { k: 'crystal', x: 3300, col: '#b77bff' },
        { k: 'rock', x: 3700, col: '#6d5fa8', s: 0.8 }, { k: 'crystal', x: 3990, col: '#7fe3ff' }, { k: 'crystal', x: 4230, col: '#ffe066' },
      ],
      ents: [
        { id: 'cv-back', k: 'door', x: 1.6, row: 12, icon: '🌲', col: '#6b4a30', to: 'woods', at: { x: 93, row: 12 } },
        { id: 'mole2', k: 'npc', who: 'mole', x: 6, row: 12, lines: 'mole', talk: [] },
        { id: 'cv-sign', k: 'sign', x: 9, row: 12, text: 'Crystal Caves. It is dark! Hold a lantern to see more.' },
        { id: 'cv-chime1', k: 'chime', col: 'blue', x: 14, row: 12 },
        { id: 'g-cv-yellow1', k: 'gem', col: 'yellow', x: 23.5, row: 8 },
        { id: 'em-1', k: 'pick', set: 'embers', icon: '🔥', name: 'warm stone', x: 28, row: 12 },
        { id: 'cv-raft1', k: 'raft', x: 34, row: 12, x0: 33.6, x1: 37.4, w: 3 },
        { id: 'g-cv-green1', k: 'gem', col: 'green', x: 35.5, row: 12.6 },
        { id: 'cv-boing1', k: 'bounce', look: 'crystal', x: 41.5, row: 12 },
        { id: 'em-2', k: 'pick', set: 'embers', icon: '🔥', name: 'warm stone', x: 44.5, row: 6 },
        { id: 'cv-chime2', k: 'chime', col: 'purple', x: 54.5, row: 12 },
        { id: 'g-cv-red1', k: 'gem', col: 'red', x: 60, row: 12 },
        { id: 'em-3', k: 'pick', set: 'embers', icon: '🔥', name: 'warm stone', x: 66, row: 8 },
        { id: 'cv-nest', k: 'nest', x: 73.5, row: 12 },
        { id: 'cv-chime3', k: 'chime', col: 'yellow', x: 79, row: 12 },
        { id: 'cv-sign2', k: 'sign', x: 83, row: 12, text: 'Cloudtop Kingdom is up above. Bring three red, three yellow and two purple gems.' },
        { id: 'gate-clouds', k: 'gate', x: 86, row: 12, to: 'clouds', label: 'Cloudtop Kingdom', icon: '☁️', needs: { red: 3, yellow: 3, purple: 2 } },
      ],
    },
  };
  for (const id in G.AREAS) G.AREAS[id].map = G.buildMap(G.AREAS[id].w, G.AREAS[id].h, G.AREAS[id].fills);
})();
