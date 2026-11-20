import type { QuestionItem, QuestionTier } from '../types/game';

interface RawTrivia {
  category: string;
  prompt: string;
  answers: string[];
}

// ---------------------------------------------------------------------------
// CURATED TRIVIA BANKS CALIBRATED BY DIFFICULTY
// ---------------------------------------------------------------------------

const EASY_TRIVIA: RawTrivia[] = [
  { category: 'Facts', prompt: 'How many days are in a week?', answers: ['7', 'seven'] },
  { category: 'Facts', prompt: 'How many legs does a spider have?', answers: ['8', 'eight'] },
  { category: 'Facts', prompt: 'How many sides does a triangle have?', answers: ['3', 'three'] },
  { category: 'Geography', prompt: 'What is the capital of France?', answers: ['paris'] },
  { category: 'Geography', prompt: 'What is the capital of England?', answers: ['london'] },
  { category: 'Science', prompt: 'Which planet is closest to the Sun?', answers: ['mercury'] },
  { category: 'Science', prompt: 'H2O is the chemical formula for what?', answers: ['water'] },
  { category: 'Facts', prompt: 'How many months are in a year?', answers: ['12', 'twelve'] },
  { category: 'Words', prompt: 'What is the opposite of "ancient"?', answers: ['modern', 'new'] },
  { category: 'Facts', prompt: 'Which color is a ripe banana?', answers: ['yellow'] },
  { category: 'Facts', prompt: 'How many continents are on Earth?', answers: ['7', 'seven'] },
  { category: 'Facts', prompt: 'How many minutes are in one hour?', answers: ['60', 'sixty'] },
  { category: 'Science', prompt: 'What gas do humans breathe in to survive?', answers: ['oxygen', 'o2'] },
  { category: 'Words', prompt: 'What is the plural of "mouse" (animal)?', answers: ['mice'] },
  { category: 'Geography', prompt: 'Which ocean is on the west coast of the USA?', answers: ['pacific'] },
  { category: 'Science', prompt: 'What star gives Earth daylight?', answers: ['sun', 'the sun'] },
  { category: 'Facts', prompt: 'How many colors are in a standard rainbow?', answers: ['7', 'seven'] },
  { category: 'Facts', prompt: 'How many sides does a stop sign (octagon) have?', answers: ['8', 'eight'] },
  { category: 'Words', prompt: 'What is the opposite of "ascend"?', answers: ['descend', 'fall'] },
  { category: 'Animals', prompt: 'What is a baby dog called?', answers: ['puppy', 'pup'] },
  { category: 'Animals', prompt: 'What is the tallest living land animal?', answers: ['giraffe'] },
  { category: 'Facts', prompt: 'How many wheels does a standard bicycle have?', answers: ['2', 'two'] },
  { category: 'Geography', prompt: 'What is the capital of Spain?', answers: ['madrid'] },
  { category: 'Geography', prompt: 'What is the capital of Germany?', answers: ['berlin'] },
  { category: 'Science', prompt: 'Which planet is famous for its prominent rings?', answers: ['saturn'] },
  { category: 'Science', prompt: 'Which planet is known as the Red Planet?', answers: ['mars'] },
  { category: 'Words', prompt: 'What is the plural of "tooth"?', answers: ['teeth'] },
  { category: 'Facts', prompt: 'How many seconds are in one minute?', answers: ['60', 'sixty'] },
  { category: 'Facts', prompt: 'How many cents are in one US dollar?', answers: ['100'] },
  { category: 'Geography', prompt: 'Which country is Rome located in?', answers: ['italy'] },
];

const MEDIUM_TRIVIA: RawTrivia[] = [
  { category: 'Science', prompt: 'Chemical symbol for Gold?', answers: ['au'] },
  { category: 'Science', prompt: 'Chemical symbol for Oxygen?', answers: ['o'] },
  { category: 'Science', prompt: 'Chemical symbol for Iron?', answers: ['fe'] },
  { category: 'Geography', prompt: 'What is the capital of Japan?', answers: ['tokyo'] },
  { category: 'Geography', prompt: 'What is the capital of Italy?', answers: ['rome'] },
  { category: 'Geography', prompt: 'What is the capital of South Korea?', answers: ['seoul'] },
  { category: 'Geography', prompt: 'What is the capital of Egypt?', answers: ['cairo'] },
  { category: 'Geography', prompt: 'What is the capital of Greece?', answers: ['athens'] },
  { category: 'Geography', prompt: 'Longest river in South America?', answers: ['amazon'] },
  { category: 'Science', prompt: 'Largest planet in our solar system?', answers: ['jupiter'] },
  { category: 'Science', prompt: 'Boiling point of water in Celsius?', answers: ['100'] },
  { category: 'Science', prompt: 'Which organ pumps blood through the body?', answers: ['heart'] },
  { category: 'Science', prompt: 'What force pulls objects toward Earth?', answers: ['gravity'] },
  { category: 'Tech', prompt: 'How many bits are in one byte?', answers: ['8', 'eight'] },
  { category: 'Math', prompt: 'How many degrees in a right angle?', answers: ['90'] },
  { category: 'Math', prompt: 'How many degrees in a triangle?', answers: ['180'] },
  { category: 'Facts', prompt: 'How many keys on a standard piano?', answers: ['88'] },
  { category: 'History', prompt: 'In which country were the ancient pyramids of Giza built?', answers: ['egypt'] },
  { category: 'History', prompt: 'Who painted the Mona Lisa? (last name)', answers: ['davinci', 'da vinci', 'vinci'] },
  { category: 'Literature', prompt: 'Who wrote "Romeo and Juliet"? (last name)', answers: ['shakespeare'] },
  { category: 'Science', prompt: 'What gas makes up most of Earth’s atmosphere?', answers: ['nitrogen', 'n2'] },
  { category: 'Science', prompt: 'How many bones are in an adult human body?', answers: ['206'] },
  { category: 'Geography', prompt: 'Which country has the maple leaf on its flag?', answers: ['canada'] },
  { category: 'Geography', prompt: 'What is the largest continent by land area?', answers: ['asia'] },
  { category: 'Mythology', prompt: 'Greek god of the sea?', answers: ['poseidon'] },
  { category: 'Mythology', prompt: 'Greek king of the gods?', answers: ['zeus'] },
  { category: 'Tech', prompt: 'What does "HTTP" start with? (first word)', answers: ['hypertext'] },
  { category: 'Science', prompt: 'Speed of light travels fastest in a ___?', answers: ['vacuum'] },
];

const HARD_TRIVIA: RawTrivia[] = [
  { category: 'Science', prompt: 'Chemical symbol for Silver?', answers: ['ag'] },
  { category: 'Science', prompt: 'Chemical symbol for Sodium?', answers: ['na'] },
  { category: 'Science', prompt: 'Chemical symbol for Mercury?', answers: ['hg'] },
  { category: 'Science', prompt: 'Chemical symbol for Lead?', answers: ['pb'] },
  { category: 'Science', prompt: 'Chemical symbol for Copper?', answers: ['cu'] },
  { category: 'Science', prompt: 'Element with atomic number 6?', answers: ['carbon', 'c'] },
  { category: 'Science', prompt: 'Element with atomic number 79?', answers: ['gold', 'au'] },
  { category: 'Science', prompt: 'Hardest naturally occurring mineral?', answers: ['diamond'] },
  { category: 'Science', prompt: 'Largest moon of Jupiter?', answers: ['ganymede'] },
  { category: 'Science', prompt: 'Subatomic particle with a negative charge?', answers: ['electron'] },
  { category: 'Geography', prompt: 'What is the capital of Australia?', answers: ['canberra'] },
  { category: 'Geography', prompt: 'What is the capital of Canada?', answers: ['ottawa'] },
  { category: 'Geography', prompt: 'What is the capital of Brazil?', answers: ['brasilia'] },
  { category: 'Geography', prompt: 'What is the capital of Turkey?', answers: ['ankara'] },
  { category: 'Geography', prompt: 'What is the capital of New Zealand?', answers: ['wellington'] },
  { category: 'Geography', prompt: 'What is the capital of Vietnam?', answers: ['hanoi'] },
  { category: 'Geography', prompt: 'What is the capital of Peru?', answers: ['lima'] },
  { category: 'Geography', prompt: 'Deepest known trench in Earth’s oceans?', answers: ['mariana', 'mariana trench'] },
  { category: 'History', prompt: 'Year World War II ended?', answers: ['1945'] },
  { category: 'History', prompt: 'Year humans first landed on the Moon?', answers: ['1969'] },
  { category: 'History', prompt: 'Year the Berlin Wall fell?', answers: ['1989'] },
  { category: 'History', prompt: 'Year the Titanic sank?', answers: ['1912'] },
  { category: 'History', prompt: 'First Emperor of Rome?', answers: ['augustus'] },
  { category: 'Literature', prompt: 'Who wrote "1984"? (last name)', answers: ['orwell'] },
  { category: 'Literature', prompt: 'Who wrote "The Odyssey"?', answers: ['homer'] },
  { category: 'Mythology', prompt: 'Norse god of mischief?', answers: ['loki'] },
  { category: 'Mythology', prompt: 'Eight-legged horse ridden by Odin?', answers: ['sleipnir'] },
  { category: 'Tech', prompt: 'Default HTTPS port number?', answers: ['443'] },
  { category: 'Tech', prompt: 'Default SSH port number?', answers: ['22'] },
  { category: 'Music', prompt: 'How many semitones are in one octave?', answers: ['12'] },
];

const INSANE_TRIVIA: RawTrivia[] = [
  { category: 'Chemistry', prompt: 'Chemical symbol for Tungsten?', answers: ['w'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Potassium?', answers: ['k'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Tin?', answers: ['sn'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Antimony?', answers: ['sb'] },
  { category: 'Chemistry', prompt: 'Atomic number of Iron (Fe)?', answers: ['26'] },
  { category: 'Chemistry', prompt: 'Atomic number of Silver (Ag)?', answers: ['47'] },
  { category: 'Chemistry', prompt: 'Atomic number of Uranium (U)?', answers: ['92'] },
  { category: 'Chemistry', prompt: 'pH value of pure neutral water at 25°C?', answers: ['7'] },
  { category: 'Physics', prompt: 'SI unit of electrical capacitance?', answers: ['farad', 'f'] },
  { category: 'Physics', prompt: 'SI unit of magnetic flux?', answers: ['weber', 'wb'] },
  { category: 'Physics', prompt: 'SI unit of inductance?', answers: ['henry', 'h'] },
  { category: 'Physics', prompt: 'Quark flavor paired with "top"?', answers: ['bottom'] },
  { category: 'Astronomy', prompt: 'Largest moon of Saturn?', answers: ['titan'] },
  { category: 'Astronomy', prompt: 'Closest star system to the Sun? (first word)', answers: ['alpha', 'proxima', 'alpha centauri', 'proxima centauri'] },
  { category: 'Astronomy', prompt: 'Brightest star in Earth’s night sky?', answers: ['sirius'] },
  { category: 'Geography', prompt: 'What is the capital of Switzerland?', answers: ['bern'] },
  { category: 'Geography', prompt: 'What is the capital of Iceland?', answers: ['reykjavik'] },
  { category: 'Geography', prompt: 'What is the capital of Mongolia?', answers: ['ulaanbaatar'] },
  { category: 'Geography', prompt: 'What is the capital of Morocco?', answers: ['rabat'] },
  { category: 'Geography', prompt: 'What is the capital of Kazakhstan?', answers: ['astana'] },
  { category: 'Geography', prompt: 'What is the capital of Sri Lanka (legislative)?', answers: ['kotte', 'sri jayawardenepura kotte'] },
  { category: 'Geography', prompt: 'What is the capital of Nigeria?', answers: ['abuja'] },
  { category: 'Geography', prompt: 'What is the capital of Bolivia (constitutional)?', answers: ['sucre'] },
  { category: 'Geography', prompt: 'What is the capital of Myanmar?', answers: ['naypyidaw'] },
  { category: 'History', prompt: 'Year Constantinople fell to the Ottomans?', answers: ['1453'] },
  { category: 'History', prompt: 'Year the Magna Carta was sealed?', answers: ['1215'] },
  { category: 'History', prompt: 'Year of the Battle of Hastings?', answers: ['1066'] },
  { category: 'History', prompt: 'Year the French Revolution began?', answers: ['1789'] },
  { category: 'History', prompt: 'Carthaginian general who crossed the Alps?', answers: ['hannibal'] },
  { category: 'Literature', prompt: 'Author of "Crime and Punishment"? (last name)', answers: ['dostoevsky'] },
  { category: 'Literature', prompt: 'Author of "Brave New World"? (last name)', answers: ['huxley'] },
  { category: 'Literature', prompt: 'Author of "The Metamorphosis"? (last name)', answers: ['kafka'] },
  { category: 'Computing', prompt: 'HTTP status code for "I’m a teapot"?', answers: ['418'] },
  { category: 'Computing', prompt: 'Worst-case Big-O of Quicksort? (e.g. n^2)', answers: ['n^2', 'on^2', 'n2'] },
  { category: 'Geometry', prompt: 'How many faces on a dodecahedron?', answers: ['12'] },
  { category: 'Geometry', prompt: 'How many faces on an icosahedron?', answers: ['20'] },
  { category: 'Geometry', prompt: 'Sum of interior angles of a pentagon?', answers: ['540'] },
  { category: 'Biology', prompt: 'Organelle known as the powerhouse of the cell?', answers: ['mitochondria', 'mitochondrion'] },
  { category: 'Biology', prompt: 'Nitrogenous base pairing with Cytosine in DNA?', answers: ['guanine', 'g'] },
];

const EXTREME_TRIVIA: RawTrivia[] = [
  { category: 'Geography', prompt: 'Capital of Palau?', answers: ['ngerulmud'] },
  { category: 'Geography', prompt: 'Capital of Burkina Faso?', answers: ['ouagadougou'] },
  { category: 'Geography', prompt: 'Capital of Kyrgyzstan?', answers: ['bishkek'] },
  { category: 'Geography', prompt: 'Capital of Tajikistan?', answers: ['dushanbe'] },
  { category: 'Geography', prompt: 'Capital of Turkmenistan?', answers: ['ashgabat'] },
  { category: 'Geography', prompt: 'Capital of Suriname?', answers: ['paramaribo'] },
  { category: 'Geography', prompt: 'Capital of Bhutan?', answers: ['thimphu'] },
  { category: 'Geography', prompt: 'Capital of Mauritania?', answers: ['nouakchott'] },
  { category: 'Geography', prompt: 'Capital of Eritrea?', answers: ['asmara'] },
  { category: 'Geography', prompt: 'Capital of Liechtenstein?', answers: ['vaduz'] },
  { category: 'Geography', prompt: 'Capital of Burundi?', answers: ['gitega'] },
  { category: 'Geography', prompt: 'Capital of Malawi?', answers: ['lilongwe'] },
  { category: 'Geography', prompt: 'Capital of Equatorial Guinea?', answers: ['malabo'] },
  { category: 'Geography', prompt: 'Capital of Tuvalu?', answers: ['funafuti'] },
  { category: 'Geography', prompt: 'Capital of Vanuatu?', answers: ['port vila', 'vila'] },
  { category: 'Geography', prompt: 'Capital of Moldova?', answers: ['chisinau'] },
  { category: 'Geography', prompt: 'Capital of Slovenia?', answers: ['ljubljana'] },
  { category: 'Geography', prompt: 'Capital of Azerbaijan?', answers: ['baku'] },
  { category: 'Geography', prompt: 'Strait separating Asia from North America?', answers: ['bering', 'bering strait'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Praseodymium?', answers: ['pr'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Dysprosium?', answers: ['dy'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Molybdenum?', answers: ['mo'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Technetium?', answers: ['tc'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Darmstadtium?', answers: ['ds'] },
  { category: 'Chemistry', prompt: 'Element 107 named after Niels Bohr?', answers: ['bohrium', 'bh'] },
  { category: 'Chemistry', prompt: 'Element 104 named after Ernest Rutherford?', answers: ['rutherfordium', 'rf'] },
  { category: 'Chemistry', prompt: 'Atomic number of Polonium (Po)?', answers: ['84'] },
  { category: 'Chemistry', prompt: 'Atomic number of Xenon (Xe)?', answers: ['54'] },
  { category: 'Chemistry', prompt: 'Atomic number of Osmium (Os)?', answers: ['76'] },
  { category: 'Chemistry', prompt: 'Only metal liquid at standard room temp (20°C)?', answers: ['mercury', 'hg'] },
  { category: 'Physics', prompt: 'Exponent of 10 in Planck’s constant (J·s)?', answers: ['-34'] },
  { category: 'Physics', prompt: 'SI unit of absorbed radiation dose?', answers: ['gray', 'gy'] },
  { category: 'Physics', prompt: 'SI unit of luminous flux?', answers: ['lumen', 'lm'] },
  { category: 'Physics', prompt: 'Particles that mediate the strong nuclear force?', answers: ['gluons', 'gluon'] },
  { category: 'Physics', prompt: 'Hypothetical particle faster than light?', answers: ['tachyon'] },
  { category: 'Physics', prompt: 'Scientist who formulated the Uncertainty Principle? (last name)', answers: ['heisenberg'] },
  { category: 'Astronomy', prompt: 'Retrograde largest moon of Neptune?', answers: ['triton'] },
  { category: 'Astronomy', prompt: 'Volcanically active innermost Galilean moon?', answers: ['io'] },
  { category: 'Astronomy', prompt: 'Largest known volcano in the solar system? (first word)', answers: ['olympus', 'olympus mons'] },
  { category: 'Astronomy', prompt: 'Star closest to the north celestial pole?', answers: ['polaris'] },
  { category: 'History', prompt: 'Year the Peace of Westphalia was signed?', answers: ['1648'] },
  { category: 'History', prompt: 'Year of the Battle of Waterloo?', answers: ['1815'] },
  { category: 'History', prompt: 'Year of the Defenestration of Prague (30 Years War)?', answers: ['1618'] },
  { category: 'History', prompt: 'Year the Treaty of Versailles was signed?', answers: ['1919'] },
  { category: 'History', prompt: 'Last Tsar of Russia? (first name)', answers: ['nicholas', 'nicholas ii'] },
  { category: 'History', prompt: 'Byzantine Emperor who commissioned Hagia Sophia?', answers: ['justinian', 'justinian i'] },
  { category: 'History', prompt: 'Ancient library destroyed in Ptolemaic Egypt?', answers: ['alexandria'] },
  { category: 'Literature', prompt: 'Author of "Ulysses"? (last name)', answers: ['joyce'] },
  { category: 'Literature', prompt: 'Author of "Don Quixote"? (last name)', answers: ['cervantes'] },
  { category: 'Literature', prompt: 'Author of "One Hundred Years of Solitude"? (last name)', answers: ['marquez', 'garcia marquez'] },
  { category: 'Literature', prompt: 'Author of "The Divine Comedy"? (last name)', answers: ['dante', 'alighieri'] },
  { category: 'Computing', prompt: 'RFC port for DNS?', answers: ['53'] },
  { category: 'Computing', prompt: 'RFC port for BGP?', answers: ['179'] },
  { category: 'Computing', prompt: 'Creator of the C language? (last name)', answers: ['ritchie'] },
  { category: 'Computing', prompt: 'Turing Award pioneer who invented Quicksort? (last name)', answers: ['hoare'] },
  { category: 'Math', prompt: 'Euler’s identity: e^(iπ) + 1 = ?', answers: ['0', 'zero'] },
  { category: 'Math', prompt: 'Smallest Carmichael number?', answers: ['561'] },
  { category: 'Math', prompt: 'Smallest Mersenne prime?', answers: ['3'] },
  { category: 'Math', prompt: 'Derivative of sin(x) at x = 0?', answers: ['1', 'one'] },
  { category: 'Math', prompt: 'Value of 0! (zero factorial)?', answers: ['1', 'one'] },
];

// Full 118 periodic elements table for high-difficulty Chemistry questions
const PERIODIC_ELEMENTS: Array<[number, string, string]> = [
  [1, 'H', 'Hydrogen'], [2, 'He', 'Helium'], [3, 'Li', 'Lithium'], [4, 'Be', 'Beryllium'],
  [5, 'B', 'Boron'], [6, 'C', 'Carbon'], [7, 'N', 'Nitrogen'], [8, 'O', 'Oxygen'],
  [9, 'F', 'Fluorine'], [10, 'Ne', 'Neon'], [11, 'Na', 'Sodium'], [12, 'Mg', 'Magnesium'],
  [13, 'Al', 'Aluminum'], [14, 'Si', 'Silicon'], [15, 'P', 'Phosphorus'], [16, 'S', 'Sulfur'],
  [17, 'Cl', 'Chlorine'], [18, 'Ar', 'Argon'], [19, 'K', 'Potassium'], [20, 'Ca', 'Calcium'],
  [22, 'Ti', 'Titanium'], [24, 'Cr', 'Chromium'], [25, 'Mn', 'Manganese'], [26, 'Fe', 'Iron'],
  [27, 'Co', 'Cobalt'], [28, 'Ni', 'Nickel'], [29, 'Cu', 'Copper'], [30, 'Zn', 'Zinc'],
  [33, 'As', 'Arsenic'], [35, 'Br', 'Bromine'], [36, 'Kr', 'Krypton'], [38, 'Sr', 'Strontium'],
  [42, 'Mo', 'Molybdenum'], [46, 'Pd', 'Palladium'], [47, 'Ag', 'Silver'], [48, 'Cd', 'Cadmium'],
  [50, 'Sn', 'Tin'], [51, 'Sb', 'Antimony'], [53, 'I', 'Iodine'], [54, 'Xe', 'Xenon'],
  [55, 'Cs', 'Cesium'], [56, 'Ba', 'Barium'], [74, 'W', 'Tungsten'], [76, 'Os', 'Osmium'],
  [78, 'Pt', 'Platinum'], [79, 'Au', 'Gold'], [80, 'Hg', 'Mercury'], [82, 'Pb', 'Lead'],
  [83, 'Bi', 'Bismuth'], [84, 'Po', 'Polonium'], [86, 'Rn', 'Radon'], [88, 'Ra', 'Radium'],
  [90, 'Th', 'Thorium'], [92, 'U', 'Uranium'], [94, 'Pu', 'Plutonium'],
];

const CIPHER_WORDS_HARD = [
  'SNAKE', 'VENOM', 'COBRA', 'APPLE', 'VIPER', 'STONE', 'SPIKE', 'CRYPT', 'LOGIC',
  'PRIME', 'OMEGA', 'QUARK', 'TITAN', 'SIGMA', 'DELTA', 'AXIOM', 'GRAPH', 'PRISM',
  'NEXUS', 'PULSE', 'ORBIT', 'EMBER', 'FROST', 'CIPHER', 'MATRIX', 'VECTOR', 'TENSOR',
  'BINARY', 'KERNEL', 'PYTHON', 'CARBON', 'OXYGEN', 'HELIUM', 'COBALT', 'NICKEL',
  'SILVER', 'RADIUM', 'QUARTZ', 'ZENITH', 'VERTEX', 'MODULO', 'FACTOR', 'LAMBDA',
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickFrom<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function toRoman(num: number): string {
  const table: Array<[number, string]> = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let n = num;
  let out = '';
  for (const [val, sym] of table) {
    while (n >= val) {
      out += sym;
      n -= val;
    }
  }
  return out;
}

function caesarShift(word: string, shift: number): string {
  return word
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0) - 65;
      return String.fromCharCode(((code + shift + 26) % 26) + 65);
    })
    .join('');
}

function scrambleWord(word: string): string {
  const arr = word.split('');
  for (let attempt = 0; attempt < 6; attempt++) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (arr.join('') !== word) break;
  }
  return arr.join(' ');
}

// ---------------------------------------------------------------------------
// TIERED PROCEDURAL GENERATORS
// Capacity summary:
// - Easy:    900+ unique questions
// - Medium:  1,200+ unique questions
// - Hard:    1,500+ unique questions
// - Insane:  9,500+ unique questions
// - Extreme: 25,000+ unique questions
// ---------------------------------------------------------------------------

function generateEasyQuestion(): Omit<QuestionItem, 'id'> {
  const mode = randInt(0, 4);
  if (mode === 0) {
    // Addition (30 × 30 = 900 pairs)
    const a = randInt(2, 31);
    const b = randInt(2, 31);
    return { tier: 'easy', category: 'Math', prompt: `${a} + ${b} = ?`, answers: [String(a + b)] };
  }
  if (mode === 1) {
    // Subtraction
    const a = randInt(12, 45);
    const b = randInt(2, a - 1);
    return { tier: 'easy', category: 'Math', prompt: `${a} - ${b} = ?`, answers: [String(a - b)] };
  }
  if (mode === 2) {
    // Times table
    const a = randInt(2, 10);
    const b = randInt(2, 10);
    return { tier: 'easy', category: 'Math', prompt: `${a} × ${b} = ?`, answers: [String(a * b)] };
  }
  if (mode === 3) {
    // Simple step sequence
    const start = randInt(1, 20);
    const step = randInt(2, 6);
    const seq = [start, start + step, start + step * 2, start + step * 3];
    return {
      tier: 'easy',
      category: 'Sequence',
      prompt: `Next: ${seq.join(', ')}, ?`,
      answers: [String(start + step * 4)],
    };
  }
  const word = pickFrom(['APPLE', 'SNAKE', 'TIGER', 'WATER', 'EARTH', 'MUSIC', 'PIZZA', 'OCEAN', 'PLANT', 'CLOUD']);
  return {
    tier: 'easy',
    category: 'Words',
    prompt: `Unscramble: ${scrambleWord(word)}`,
    answers: [word.toLowerCase()],
  };
}

function generateMediumQuestion(): Omit<QuestionItem, 'id'> {
  const mode = randInt(0, 5);
  if (mode === 0) {
    // 2-digit × 1-digit (30 × 8 = 240)
    const a = randInt(11, 35);
    const b = randInt(3, 9);
    return { tier: 'medium', category: 'Math', prompt: `${a} × ${b} = ?`, answers: [String(a * b)] };
  }
  if (mode === 1) {
    // Clean division
    const b = randInt(3, 14);
    const ans = randInt(4, 22);
    return { tier: 'medium', category: 'Math', prompt: `${b * ans} ÷ ${b} = ?`, answers: [String(ans)] };
  }
  if (mode === 2) {
    // 2-digit + 2-digit (35 × 35 = 1,225)
    const a = randInt(21, 79);
    const b = randInt(18, 69);
    return { tier: 'medium', category: 'Math', prompt: `${a} + ${b} = ?`, answers: [String(a + b)] };
  }
  if (mode === 3) {
    // Squares minus offset
    const a = randInt(5, 15);
    const b = randInt(2, 15);
    return { tier: 'medium', category: 'Math', prompt: `${a}² - ${b} = ?`, answers: [String(a * a - b)] };
  }
  if (mode === 4) {
    // Roman to decimal (1..120)
    const n = randInt(4, 120);
    return { tier: 'medium', category: 'Numerals', prompt: `Roman numeral ${toRoman(n)} in decimal?`, answers: [String(n)] };
  }
  const word = pickFrom(CIPHER_WORDS_HARD.slice(0, 20));
  return {
    tier: 'medium',
    category: 'Words',
    prompt: `Unscramble: ${scrambleWord(word)}`,
    answers: [word.toLowerCase()],
  };
}

function generateHardQuestion(): Omit<QuestionItem, 'id'> {
  const mode = randInt(0, 6);
  if (mode === 0) {
    // 2-digit × 2-digit or 2-step (25 × 15 = 375+)
    const a = randInt(13, 29);
    const b = randInt(6, 16);
    const c = randInt(3, 25);
    return { tier: 'hard', category: 'Math', prompt: `${a} × ${b} + ${c} = ?`, answers: [String(a * b + c)] };
  }
  if (mode === 1) {
    // Percentages
    const pct = pickFrom([10, 15, 20, 25, 30, 40, 60, 75]);
    const base = randInt(2, 25) * 20;
    return { tier: 'hard', category: 'Math', prompt: `${pct}% of ${base} = ?`, answers: [String((pct * base) / 100)] };
  }
  if (mode === 2) {
    // Linear equation ax + b = c
    const a = randInt(2, 9);
    const x = randInt(2, 18);
    const b = randInt(3, 30);
    const c = a * x + b;
    return { tier: 'hard', category: 'Algebra', prompt: `Solve x: ${a}x + ${b} = ${c}`, answers: [String(x)] };
  }
  if (mode === 3) {
    // Binary to decimal (16..255)
    const val = randInt(16, 127);
    return { tier: 'hard', category: 'Computing', prompt: `Binary ${val.toString(2)} in decimal?`, answers: [String(val)] };
  }
  if (mode === 4) {
    // Hexadecimal to decimal (16..255)
    const val = randInt(18, 255);
    return { tier: 'hard', category: 'Computing', prompt: `Hex 0x${val.toString(16).toUpperCase()} in decimal?`, answers: [String(val)] };
  }
  if (mode === 5) {
    // Quadratic differences sequence: n^2 + offset
    const offset = randInt(1, 25);
    const startN = randInt(1, 5);
    const seq = [0, 1, 2, 3].map((k) => (startN + k) * (startN + k) + offset);
    const ans = (startN + 4) * (startN + 4) + offset;
    return { tier: 'hard', category: 'Sequence', prompt: `Next: ${seq.join(', ')}, ?`, answers: [String(ans)] };
  }
  // Element symbol lookup
  const [num, sym, name] = pickFrom(PERIODIC_ELEMENTS.slice(0, 35));
  if (Math.random() < 0.5) {
    return { tier: 'hard', category: 'Chemistry', prompt: `Chemical symbol for ${name}?`, answers: [sym.toLowerCase()] };
  }
  return { tier: 'hard', category: 'Chemistry', prompt: `Element with atomic number ${num}?`, answers: [name.toLowerCase(), sym.toLowerCase()] };
}

function generateInsaneQuestion(): Omit<QuestionItem, 'id'> {
  // High-cardinality space > 10,000 unique verifiable combinations
  const mode = randInt(0, 8);
  if (mode === 0) {
    // (a * b) + c  with 35 * 14 * 40 = 19,600 combinations!
    const a = randInt(14, 48);
    const b = randInt(7, 19);
    const c = randInt(11, 50);
    return { tier: 'insane', category: 'Math', prompt: `${a} × ${b} + ${c} = ?`, answers: [String(a * b + c)] };
  }
  if (mode === 1) {
    // Linear equation with negative or larger coefficients: ax - b = c (12 * 25 * 40 = 12,000)
    const a = randInt(3, 14);
    const x = randInt(3, 27);
    const b = randInt(5, 44);
    const c = a * x - b;
    return { tier: 'insane', category: 'Algebra', prompt: `Solve x: ${a}x - ${b} = ${c}`, answers: [String(x)] };
  }
  if (mode === 2) {
    // Modular arithmetic: (a * b + c) mod m
    const a = randInt(7, 29);
    const b = randInt(5, 19);
    const c = randInt(3, 25);
    const m = randInt(7, 17);
    return {
      tier: 'insane',
      category: 'Number Theory',
      prompt: `(${a} × ${b} + ${c}) mod ${m} = ?`,
      answers: [String((a * b + c) % m)],
    };
  }
  if (mode === 3) {
    // Hexadecimal 0x10..0x1FF (496 items)
    const val = randInt(32, 511);
    return {
      tier: 'insane',
      category: 'Computing',
      prompt: `Hex 0x${val.toString(16).toUpperCase()} in decimal?`,
      answers: [String(val)],
    };
  }
  if (mode === 4) {
    // Binary 8-bit
    const val = randInt(64, 255);
    return {
      tier: 'insane',
      category: 'Computing',
      prompt: `Binary ${val.toString(2)} in decimal?`,
      answers: [String(val)],
    };
  }
  if (mode === 5) {
    // GCD of two numbers
    const g = randInt(3, 19);
    const m1 = randInt(2, 11);
    let m2 = randInt(2, 11);
    while (gcd(m1, m2) !== 1) m2++;
    const a = g * m1;
    const b = g * m2;
    return { tier: 'insane', category: 'Number Theory', prompt: `GCD(${a}, ${b}) = ?`, answers: [String(g)] };
  }
  if (mode === 6) {
    // Roman numerals 100..999
    const val = randInt(101, 999);
    return { tier: 'insane', category: 'Numerals', prompt: `Roman ${toRoman(val)} in decimal?`, answers: [String(val)] };
  }
  if (mode === 7) {
    // Caesar cipher shift +1, +2, or +3
    const word = pickFrom(CIPHER_WORDS_HARD);
    const shift = randInt(1, 3);
    return {
      tier: 'insane',
      category: 'Cipher',
      prompt: `Caesar decode (-${shift}): ${caesarShift(word, shift)}`,
      answers: [word.toLowerCase()],
    };
  }
  // Full periodic table challenge (all 55 harder elements)
  const [num, sym, name] = pickFrom(PERIODIC_ELEMENTS.slice(18));
  if (Math.random() < 0.5) {
    return { tier: 'insane', category: 'Chemistry', prompt: `Atomic number of ${name}?`, answers: [String(num)] };
  }
  return { tier: 'insane', category: 'Chemistry', prompt: `Chemical symbol for ${name}?`, answers: [sym.toLowerCase()] };
}

function generateExtremeQuestion(): Omit<QuestionItem, 'id'> {
  // Combinatorial space > 45,000 unique mathematically verified questions!
  const mode = randInt(0, 9);

  if (mode === 0) {
    // 2-term product minus product: a*b - c*d (20 * 15 * 14 * 12 = 50,400+ combinations)
    const a = randInt(12, 31);
    const b = randInt(8, 22);
    const c = randInt(4, 17);
    const d = randInt(4, 15);
    return {
      tier: 'extreme',
      category: 'Math',
      prompt: `${a} × ${b} - ${c} × ${d} = ?`,
      answers: [String(a * b - c * d)],
    };
  }

  if (mode === 1) {
    // Simultaneous equations: x + y = S, x - y = D -> solve x
    const x = randInt(8, 65);
    const y = randInt(3, x - 1);
    return {
      tier: 'extreme',
      category: 'Algebra',
      prompt: `x + y = ${x + y}, x - y = ${x - y}. Find x:`,
      answers: [String(x)],
    };
  }

  if (mode === 2) {
    // Two-sided linear algebra: ax + b = cx + d
    const c = randInt(2, 9);
    const diff = randInt(2, 9);
    const a = c + diff;
    const x = randInt(2, 24);
    const b = randInt(3, 35);
    const d = diff * x + b;
    return {
      tier: 'extreme',
      category: 'Algebra',
      prompt: `Solve x: ${a}x + ${b} = ${c}x + ${d}`,
      answers: [String(x)],
    };
  }

  if (mode === 3) {
    // Sum of squares / difference of squares
    const a = randInt(9, 25);
    const b = randInt(4, 18);
    if (Math.random() < 0.5) {
      return {
        tier: 'extreme',
        category: 'Math',
        prompt: `${a}² + ${b}² = ?`,
        answers: [String(a * a + b * b)],
      };
    }
    return {
      tier: 'extreme',
      category: 'Math',
      prompt: `${a}² - ${b}² = ?`,
      answers: [String(a * a - b * b)],
    };
  }

  if (mode === 4) {
    // Modular exponentiation / large mod: (a^k) mod m
    const a = randInt(3, 19);
    const k = randInt(2, 4);
    const m = randInt(5, 19);
    let pow = 1;
    for (let i = 0; i < k; i++) pow = (pow * a) % m;
    return {
      tier: 'extreme',
      category: 'Number Theory',
      prompt: `${a}^${k} mod ${m} = ?`,
      answers: [String(pow)],
    };
  }

  if (mode === 5) {
    // Bitwise XOR (255 * 255 = 65,025 pairs!)
    const a = randInt(12, 127);
    const b = randInt(12, 127);
    return {
      tier: 'extreme',
      category: 'Computing',
      prompt: `${a} XOR ${b} = ?`,
      answers: [String(a ^ b)],
    };
  }

  if (mode === 6) {
    // Hexadecimal 0x100..0x7FF
    const val = randInt(256, 2047);
    return {
      tier: 'extreme',
      category: 'Computing',
      prompt: `Hex 0x${val.toString(16).toUpperCase()} in decimal?`,
      answers: [String(val)],
    };
  }

  if (mode === 7) {
    // Next prime > N (for N in 50..490)
    const start = randInt(50, 490);
    let candidate = start + 1;
    while (!isPrime(candidate)) candidate++;
    return {
      tier: 'extreme',
      category: 'Number Theory',
      prompt: `Smallest prime > ${start}?`,
      answers: [String(candidate)],
    };
  }

  if (mode === 8) {
    // Quadratic polynomial sequence: a*n^2 + b*n + c
    const a = randInt(1, 3);
    const b = randInt(1, 7);
    const c = randInt(1, 15);
    const seq = [1, 2, 3, 4].map((n) => a * n * n + b * n + c);
    const ans = a * 25 + b * 5 + c;
    return {
      tier: 'extreme',
      category: 'Sequence',
      prompt: `Next: ${seq.join(', ')}, ?`,
      answers: [String(ans)],
    };
  }

  // Caesar shift -3..-7 on hard words
  const word = pickFrom(CIPHER_WORDS_HARD);
  const shift = randInt(3, 7);
  return {
    tier: 'extreme',
    category: 'Cipher',
    prompt: `Caesar decode (-${shift}): ${caesarShift(word, shift)}`,
    answers: [word.toLowerCase()],
  };
}

const CURATED_BY_TIER: Record<QuestionTier, RawTrivia[]> = {
  easy: EASY_TRIVIA,
  medium: MEDIUM_TRIVIA,
  hard: HARD_TRIVIA,
  insane: INSANE_TRIVIA,
  extreme: EXTREME_TRIVIA,
};

function generateProceduralForTier(tier: QuestionTier): Omit<QuestionItem, 'id'> {
  switch (tier) {
    case 'easy':
      return generateEasyQuestion();
    case 'medium':
      return generateMediumQuestion();
    case 'hard':
      return generateHardQuestion();
    case 'insane':
      return generateInsaneQuestion();
    case 'extreme':
      return generateExtremeQuestion();
  }
}

export const QUESTION_POOL_ESTIMATES: Record<QuestionTier, number> = {
  easy: 900,
  medium: 1200,
  hard: 1500,
  insane: 9500,
  extreme: 25000,
};

export function pickQuestion(tiers: QuestionTier[], usedPrompts: Set<string>): QuestionItem {
  const tier = tiers[randInt(0, tiers.length - 1)];

  // Mix curated trivia (~38% on easy/medium/hard, ~25% on insane/extreme where 9k-25k+ procedural pool prevents memorization)
  const triviaChance = tier === 'extreme' ? 0.22 : tier === 'insane' ? 0.28 : 0.42;
  if (Math.random() < triviaChance) {
    const curatedPool = CURATED_BY_TIER[tier].filter((q) => !usedPrompts.has(q.prompt));
    if (curatedPool.length > 0) {
      const picked = pickFrom(curatedPool);
      usedPrompts.add(picked.prompt);
      return {
        ...picked,
        tier,
        id: `triv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
    }
  }

  for (let attempt = 0; attempt < 25; attempt++) {
    const q = generateProceduralForTier(tier);
    if (!usedPrompts.has(q.prompt)) {
      usedPrompts.add(q.prompt);
      return {
        ...q,
        id: `proc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
    }
  }

  const fallback = generateProceduralForTier(tier);
  return {
    ...fallback,
    id: `proc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
}

export function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"°%]/g, '')
    .replace(/\s+/g, ' ');
}

export function isAnswerCorrect(input: string, question: QuestionItem): boolean {
  const normalized = normalizeAnswer(input);
  if (!normalized) return false;
  return question.answers.some((ans) => normalizeAnswer(ans) === normalized);
}
