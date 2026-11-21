import type { QuestionItem, QuestionTier } from '../types/game';

interface RawTrivia {
  category: string;
  prompt: string;
  answers: string[];
}

// ---------------------------------------------------------------------------
// GENUINE TRIVIA BANKS CALIBRATED BY DIFFICULTY
// ---------------------------------------------------------------------------

const EASY_TRIVIA: RawTrivia[] = [
  { category: 'Facts', prompt: 'How many days are in a week?', answers: ['7', 'seven'] },
  { category: 'Facts', prompt: 'How many legs does a spider have?', answers: ['8', 'eight'] },
  { category: 'Facts', prompt: 'How many sides does a triangle have?', answers: ['3', 'three'] },
  { category: 'Facts', prompt: 'How many months are in a year?', answers: ['12', 'twelve'] },
  { category: 'Facts', prompt: 'How many continents are on Earth?', answers: ['7', 'seven'] },
  { category: 'Facts', prompt: 'How many minutes are in one hour?', answers: ['60', 'sixty'] },
  { category: 'Facts', prompt: 'How many seconds are in one minute?', answers: ['60', 'sixty'] },
  { category: 'Facts', prompt: 'How many cents are in one US dollar?', answers: ['100'] },
  { category: 'Facts', prompt: 'How many colors are in a standard rainbow?', answers: ['7', 'seven'] },
  { category: 'Facts', prompt: 'How many sides does a stop sign have?', answers: ['8', 'eight'] },
  { category: 'Facts', prompt: 'How many wheels does a standard bicycle have?', answers: ['2', 'two'] },
  { category: 'Facts', prompt: 'How many cards are in a standard deck (no jokers)?', answers: ['52'] },
  { category: 'Facts', prompt: 'How many sides does a standard die have?', answers: ['6', 'six'] },
  { category: 'Facts', prompt: 'Which color is a ripe banana?', answers: ['yellow'] },
  { category: 'Facts', prompt: 'Which fruit is traditionally associated with Isaac Newton?', answers: ['apple'] },
  { category: 'Geography', prompt: 'What is the capital of France?', answers: ['paris'] },
  { category: 'Geography', prompt: 'What is the capital of England?', answers: ['london'] },
  { category: 'Geography', prompt: 'What is the capital of Spain?', answers: ['madrid'] },
  { category: 'Geography', prompt: 'What is the capital of Germany?', answers: ['berlin'] },
  { category: 'Geography', prompt: 'Which country is Rome located in?', answers: ['italy'] },
  { category: 'Geography', prompt: 'Which ocean is on the west coast of the USA?', answers: ['pacific', 'pacific ocean'] },
  { category: 'Geography', prompt: 'Which ocean is on the east coast of the USA?', answers: ['atlantic', 'atlantic ocean'] },
  { category: 'Geography', prompt: 'What is the largest country in North America by area?', answers: ['canada'] },
  { category: 'Geography', prompt: 'In which country is the Eiffel Tower located?', answers: ['france'] },
  { category: 'Geography', prompt: 'Which continent is Egypt mostly in?', answers: ['africa'] },
  { category: 'Science', prompt: 'Which planet is closest to the Sun?', answers: ['mercury'] },
  { category: 'Science', prompt: 'H2O is the chemical formula for what?', answers: ['water'] },
  { category: 'Science', prompt: 'What gas do humans breathe in to survive?', answers: ['oxygen', 'o2'] },
  { category: 'Science', prompt: 'What star gives Earth daylight?', answers: ['sun', 'the sun'] },
  { category: 'Science', prompt: 'Which planet is famous for its prominent rings?', answers: ['saturn'] },
  { category: 'Science', prompt: 'Which planet is known as the Red Planet?', answers: ['mars'] },
  { category: 'Science', prompt: 'What season comes directly after summer?', answers: ['autumn', 'fall'] },
  { category: 'Science', prompt: 'What frozen form of water falls from clouds as flakes?', answers: ['snow'] },
  { category: 'Animals', prompt: 'What is a baby dog called?', answers: ['puppy', 'pup'] },
  { category: 'Animals', prompt: 'What is a baby cat called?', answers: ['kitten', 'kitty'] },
  { category: 'Animals', prompt: 'What is the tallest living land animal?', answers: ['giraffe'] },
  { category: 'Animals', prompt: 'What is the fastest land animal?', answers: ['cheetah'] },
  { category: 'Animals', prompt: 'Which bird cannot fly and lives in Antarctica?', answers: ['penguin'] },
  { category: 'Animals', prompt: 'Which insect makes honey?', answers: ['bee', 'honeybee'] },
  { category: 'Words', prompt: 'What is the opposite of "ancient"?', answers: ['modern', 'new'] },
  { category: 'Words', prompt: 'What is the opposite of "ascend"?', answers: ['descend', 'fall'] },
  { category: 'Words', prompt: 'What is the plural of "mouse" (animal)?', answers: ['mice'] },
  { category: 'Words', prompt: 'What is the plural of "tooth"?', answers: ['teeth'] },
  { category: 'Words', prompt: 'What is the plural of "goose"?', answers: ['geese'] },
  { category: 'Words', prompt: 'What is the opposite of "generous"?', answers: ['selfish', 'stingy', 'greedy'] },
  { category: 'Pop Culture', prompt: 'What is the name of Mario’s brother in Nintendo games?', answers: ['luigi'] },
  { category: 'Pop Culture', prompt: 'What yellow electric Pokémon is Ash’s partner?', answers: ['pikachu'] },
  { category: 'Pop Culture', prompt: 'Which superhero is known as the Dark Knight?', answers: ['batman', 'bruce wayne'] },
  { category: 'Pop Culture', prompt: 'What wizard school does Harry Potter attend?', answers: ['hogwarts'] },
  { category: 'Pop Culture', prompt: 'What color is Sonic the Hedgehog?', answers: ['blue'] },
  { category: 'Sports', prompt: 'How many players are on a standard basketball team on the court?', answers: ['5', 'five'] },
  { category: 'Sports', prompt: 'In soccer, which player is allowed to use their hands inside the box?', answers: ['goalkeeper', 'goalie', 'keeper'] },
  { category: 'Food', prompt: 'What Italian dish consists of dough, tomato sauce, and cheese?', answers: ['pizza'] },
  { category: 'Food', prompt: 'Guacamole is primarily made from which fruit?', answers: ['avocado'] },
  { category: 'Music', prompt: 'How many strings does a standard guitar have?', answers: ['6', 'six'] },
];

const MEDIUM_TRIVIA: RawTrivia[] = [
  { category: 'Science', prompt: 'Chemical symbol for Gold?', answers: ['au'] },
  { category: 'Science', prompt: 'Chemical symbol for Oxygen?', answers: ['o'] },
  { category: 'Science', prompt: 'Chemical symbol for Iron?', answers: ['fe'] },
  { category: 'Science', prompt: 'Largest planet in our solar system?', answers: ['jupiter'] },
  { category: 'Science', prompt: 'Boiling point of water in Celsius at sea level?', answers: ['100'] },
  { category: 'Science', prompt: 'Freezing point of water in Fahrenheit?', answers: ['32'] },
  { category: 'Science', prompt: 'Which organ pumps blood through the human body?', answers: ['heart'] },
  { category: 'Science', prompt: 'What force keeps planets in orbit around the Sun?', answers: ['gravity'] },
  { category: 'Science', prompt: 'What gas makes up about 78% of Earth’s atmosphere?', answers: ['nitrogen', 'n2'] },
  { category: 'Science', prompt: 'How many bones are in an adult human body?', answers: ['206'] },
  { category: 'Science', prompt: 'What pigment makes plant leaves green?', answers: ['chlorophyll'] },
  { category: 'Science', prompt: 'Speed of light travels fastest in a ___?', answers: ['vacuum'] },
  { category: 'Geography', prompt: 'What is the capital of Japan?', answers: ['tokyo'] },
  { category: 'Geography', prompt: 'What is the capital of Italy?', answers: ['rome'] },
  { category: 'Geography', prompt: 'What is the capital of South Korea?', answers: ['seoul'] },
  { category: 'Geography', prompt: 'What is the capital of Egypt?', answers: ['cairo'] },
  { category: 'Geography', prompt: 'What is the capital of Greece?', answers: ['athens'] },
  { category: 'Geography', prompt: 'What is the capital of Mexico?', answers: ['mexico city'] },
  { category: 'Geography', prompt: 'What is the capital of Russia?', answers: ['moscow'] },
  { category: 'Geography', prompt: 'Longest river in South America?', answers: ['amazon', 'amazon river'] },
  { category: 'Geography', prompt: 'Which country has a maple leaf on its national flag?', answers: ['canada'] },
  { category: 'Geography', prompt: 'What is the largest continent by land area?', answers: ['asia'] },
  { category: 'Geography', prompt: 'What is the official language of Brazil?', answers: ['portuguese'] },
  { category: 'Geography', prompt: 'Which US state is known as the Sunshine State?', answers: ['florida'] },
  { category: 'Geography', prompt: 'Which desert is the largest hot desert in the world?', answers: ['sahara', 'the sahara'] },
  { category: 'History', prompt: 'In which country were the ancient pyramids of Giza built?', answers: ['egypt'] },
  { category: 'History', prompt: 'Who painted the Mona Lisa? (last name)', answers: ['davinci', 'da vinci', 'vinci', 'leonardo da vinci'] },
  { category: 'History', prompt: 'Who was the first President of the United States? (last name)', answers: ['washington', 'george washington'] },
  { category: 'History', prompt: 'Which ship sank on its maiden voyage in April 1912?', answers: ['titanic', 'rms titanic'] },
  { category: 'History', prompt: 'Which ancient civilization built Machu Picchu?', answers: ['inca', 'incas', 'incan'] },
  { category: 'History', prompt: 'What wall divided Berlin from 1961 to 1989?', answers: ['berlin wall'] },
  { category: 'Literature', prompt: 'Who wrote "Romeo and Juliet"? (last name)', answers: ['shakespeare', 'william shakespeare'] },
  { category: 'Literature', prompt: 'Who wrote "The Great Gatsby"? (last name)', answers: ['fitzgerald', 'f scott fitzgerald'] },
  { category: 'Literature', prompt: 'What fictional detective lived at 221B Baker Street?', answers: ['sherlock holmes', 'holmes', 'sherlock'] },
  { category: 'Mythology', prompt: 'Greek god of the sea?', answers: ['poseidon'] },
  { category: 'Mythology', prompt: 'Greek king of the gods?', answers: ['zeus'] },
  { category: 'Mythology', prompt: 'Greek god of the underworld?', answers: ['hades'] },
  { category: 'Mythology', prompt: 'Norse god of thunder?', answers: ['thor'] },
  { category: 'Tech', prompt: 'How many bits are in one byte?', answers: ['8', 'eight'] },
  { category: 'Tech', prompt: 'What does "HTTP" start with? (first word)', answers: ['hypertext'] },
  { category: 'Tech', prompt: 'What does "CPU" stand for? (first word)', answers: ['central'] },
  { category: 'Tech', prompt: 'Which company created the Windows operating system?', answers: ['microsoft'] },
  { category: 'Music', prompt: 'How many keys are on a standard full-size piano?', answers: ['88'] },
  { category: 'Music', prompt: 'Which classical composer wrote "Für Elise"? (last name)', answers: ['beethoven'] },
  { category: 'Pop Culture', prompt: 'What is the best-selling video game of all time?', answers: ['minecraft'] },
  { category: 'Pop Culture', prompt: 'What galaxy-spanning franchise features Jedi and Sith?', answers: ['star wars'] },
  { category: 'Pop Culture', prompt: 'Which animated studio made "Toy Story"?', answers: ['pixar'] },
  { category: 'Sports', prompt: 'How many holes are in a standard round of golf?', answers: ['18'] },
  { category: 'Sports', prompt: 'In baseball, how many strikes make an out?', answers: ['3', 'three'] },
  { category: 'Facts', prompt: 'How many degrees are in a right angle?', answers: ['90'] },
  { category: 'Facts', prompt: 'How many degrees do the angles of a triangle add up to?', answers: ['180'] },
  { category: 'Food', prompt: 'What Japanese dish consists of vinegared rice and fish?', answers: ['sushi'] },
  { category: 'Food', prompt: 'Which spice is made from dried crocus flower stigmas?', answers: ['saffron'] },
];

const HARD_TRIVIA: RawTrivia[] = [
  { category: 'Science', prompt: 'Chemical symbol for Silver?', answers: ['ag'] },
  { category: 'Science', prompt: 'Chemical symbol for Sodium?', answers: ['na'] },
  { category: 'Science', prompt: 'Chemical symbol for Mercury?', answers: ['hg'] },
  { category: 'Science', prompt: 'Chemical symbol for Lead?', answers: ['pb'] },
  { category: 'Science', prompt: 'Chemical symbol for Copper?', answers: ['cu'] },
  { category: 'Science', prompt: 'Element with atomic number 79?', answers: ['gold', 'au'] },
  { category: 'Science', prompt: 'Hardest naturally occurring mineral on the Mohs scale?', answers: ['diamond'] },
  { category: 'Science', prompt: 'Largest moon of Jupiter?', answers: ['ganymede'] },
  { category: 'Science', prompt: 'Subatomic particle with a negative electric charge?', answers: ['electron'] },
  { category: 'Science', prompt: 'Which vitamin is primarily produced when skin gets sunlight?', answers: ['d', 'vitamin d'] },
  { category: 'Science', prompt: 'What is the powerhouse organelle of a eukaryotic cell?', answers: ['mitochondria', 'mitochondrion'] },
  { category: 'Science', prompt: 'Which blood type is known as the universal red-cell donor?', answers: ['o negative', 'o-'] },
  { category: 'Geography', prompt: 'What is the capital of Australia?', answers: ['canberra'] },
  { category: 'Geography', prompt: 'What is the capital of Canada?', answers: ['ottawa'] },
  { category: 'Geography', prompt: 'What is the capital of Brazil?', answers: ['brasilia'] },
  { category: 'Geography', prompt: 'What is the capital of Turkey?', answers: ['ankara'] },
  { category: 'Geography', prompt: 'What is the capital of New Zealand?', answers: ['wellington'] },
  { category: 'Geography', prompt: 'What is the capital of Vietnam?', answers: ['hanoi'] },
  { category: 'Geography', prompt: 'What is the capital of Peru?', answers: ['lima'] },
  { category: 'Geography', prompt: 'What is the capital of Kenya?', answers: ['nairobi'] },
  { category: 'Geography', prompt: 'What is the capital of Thailand?', answers: ['bangkok'] },
  { category: 'Geography', prompt: 'Deepest known trench in Earth’s oceans?', answers: ['mariana', 'mariana trench'] },
  { category: 'Geography', prompt: 'Which river flows through Vienna, Budapest, and Belgrade?', answers: ['danube', 'danube river'] },
  { category: 'Geography', prompt: 'Which mountain range separates Europe from Asia?', answers: ['urals', 'ural mountains', 'ural'] },
  { category: 'History', prompt: 'Year World War II ended?', answers: ['1945'] },
  { category: 'History', prompt: 'Year humans first landed on the Moon?', answers: ['1969'] },
  { category: 'History', prompt: 'Year the Berlin Wall fell?', answers: ['1989'] },
  { category: 'History', prompt: 'Year the Titanic sank?', answers: ['1912'] },
  { category: 'History', prompt: 'Year the Declaration of Independence was signed?', answers: ['1776'] },
  { category: 'History', prompt: 'Who was the first Emperor of Rome?', answers: ['augustus', 'octavian'] },
  { category: 'History', prompt: 'Which queen ruled England during the defeat of the Spanish Armada?', answers: ['elizabeth i', 'elizabeth', 'queen elizabeth i'] },
  { category: 'History', prompt: 'Which inventor pioneered alternating current (AC) motors? (last name)', answers: ['tesla', 'nikola tesla'] },
  { category: 'History', prompt: 'Who invented the movable-type printing press in Europe? (last name)', answers: ['gutenberg', 'johannes gutenberg'] },
  { category: 'Literature', prompt: 'Who wrote "1984"? (last name)', answers: ['orwell', 'george orwell'] },
  { category: 'Literature', prompt: 'Who wrote "The Odyssey"?', answers: ['homer'] },
  { category: 'Literature', prompt: 'Who wrote "Pride and Prejudice"? (last name)', answers: ['austen', 'jane austen'] },
  { category: 'Literature', prompt: 'Who wrote "Frankenstein"? (last name)', answers: ['shelley', 'mary shelley'] },
  { category: 'Literature', prompt: 'Who wrote "The Hobbit"? (last name)', answers: ['tolkien', 'jrr tolkien'] },
  { category: 'Mythology', prompt: 'Norse god of mischief?', answers: ['loki'] },
  { category: 'Mythology', prompt: 'Eight-legged horse ridden by Odin?', answers: ['sleipnir'] },
  { category: 'Mythology', prompt: 'Egyptian jackal-headed god of mummification?', answers: ['anubis'] },
  { category: 'Mythology', prompt: 'Greek goddess of wisdom and warfare?', answers: ['athena'] },
  { category: 'Mythology', prompt: 'Three-headed dog guarding the Greek underworld?', answers: ['cerberus'] },
  { category: 'Tech', prompt: 'Default HTTPS port number?', answers: ['443'] },
  { category: 'Tech', prompt: 'Default SSH port number?', answers: ['22'] },
  { category: 'Tech', prompt: 'Default HTTP port number?', answers: ['80'] },
  { category: 'Tech', prompt: 'Who is widely credited as the first computer programmer? (last name)', answers: ['lovelace', 'ada lovelace'] },
  { category: 'Tech', prompt: 'What programming language is named after a Monty Python comedy troupe?', answers: ['python'] },
  { category: 'Music', prompt: 'How many semitones are in one octave?', answers: ['12'] },
  { category: 'Music', prompt: 'Which band released the 1969 album "Abbey Road"?', answers: ['beatles', 'the beatles'] },
  { category: 'Sports', prompt: 'Which country won the first FIFA World Cup in 1930?', answers: ['uruguay'] },
  { category: 'Sports', prompt: 'What is the maximum break possible in standard snooker?', answers: ['147'] },
  { category: 'Pop Culture', prompt: 'In "The Matrix", what color pill reveals the truth?', answers: ['red'] },
  { category: 'Pop Culture', prompt: 'What is the fictional metal in Captain America’s shield?', answers: ['vibranium'] },
];

const INSANE_TRIVIA: RawTrivia[] = [
  { category: 'Chemistry', prompt: 'Chemical symbol for Tungsten?', answers: ['w'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Potassium?', answers: ['k'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Tin?', answers: ['sn'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Antimony?', answers: ['sb'] },
  { category: 'Chemistry', prompt: 'Atomic number of Uranium?', answers: ['92'] },
  { category: 'Chemistry', prompt: 'pH value of pure neutral water at 25°C?', answers: ['7'] },
  { category: 'Chemistry', prompt: 'Noble gas with atomic number 18?', answers: ['argon', 'ar'] },
  { category: 'Chemistry', prompt: 'Process of a solid turning directly into a gas?', answers: ['sublimation'] },
  { category: 'Chemistry', prompt: 'Most abundant element in the universe?', answers: ['hydrogen', 'h'] },
  { category: 'Physics', prompt: 'SI unit of electrical capacitance?', answers: ['farad', 'f'] },
  { category: 'Physics', prompt: 'SI unit of magnetic flux?', answers: ['weber', 'wb'] },
  { category: 'Physics', prompt: 'SI unit of electrical inductance?', answers: ['henry', 'h'] },
  { category: 'Physics', prompt: 'SI unit of electrical resistance?', answers: ['ohm'] },
  { category: 'Physics', prompt: 'Quark flavor paired with "top"?', answers: ['bottom', 'truth'] },
  { category: 'Astronomy', prompt: 'Largest moon of Saturn?', answers: ['titan'] },
  { category: 'Astronomy', prompt: 'Closest star system to the Sun? (first word or full)', answers: ['alpha', 'proxima', 'alpha centauri', 'proxima centauri'] },
  { category: 'Astronomy', prompt: 'Brightest star in Earth’s night sky?', answers: ['sirius'] },
  { category: 'Astronomy', prompt: 'Which dwarf planet resides in the asteroid belt between Mars and Jupiter?', answers: ['ceres'] },
  { category: 'Geography', prompt: 'What is the capital of Switzerland?', answers: ['bern'] },
  { category: 'Geography', prompt: 'What is the capital of Iceland?', answers: ['reykjavik'] },
  { category: 'Geography', prompt: 'What is the capital of Mongolia?', answers: ['ulaanbaatar'] },
  { category: 'Geography', prompt: 'What is the capital of Morocco?', answers: ['rabat'] },
  { category: 'Geography', prompt: 'What is the capital of Kazakhstan?', answers: ['astana'] },
  { category: 'Geography', prompt: 'What is the legislative capital of Sri Lanka?', answers: ['kotte', 'sri jayawardenepura kotte'] },
  { category: 'Geography', prompt: 'What is the capital of Nigeria?', answers: ['abuja'] },
  { category: 'Geography', prompt: 'What is the constitutional capital of Bolivia?', answers: ['sucre'] },
  { category: 'Geography', prompt: 'What is the capital of Myanmar?', answers: ['naypyidaw'] },
  { category: 'Geography', prompt: 'What is the capital of Estonia?', answers: ['tallinn'] },
  { category: 'Geography', prompt: 'What is the capital of Latvia?', answers: ['riga'] },
  { category: 'Geography', prompt: 'What is the capital of Lithuania?', answers: ['vilnius'] },
  { category: 'Geography', prompt: 'Which African country is completely surrounded by South Africa?', answers: ['lesotho'] },
  { category: 'History', prompt: 'Year Constantinople fell to the Ottomans?', answers: ['1453'] },
  { category: 'History', prompt: 'Year the Magna Carta was sealed?', answers: ['1215'] },
  { category: 'History', prompt: 'Year of the Battle of Hastings?', answers: ['1066'] },
  { category: 'History', prompt: 'Year the French Revolution began?', answers: ['1789'] },
  { category: 'History', prompt: 'Year the Soviet Union dissolved?', answers: ['1991'] },
  { category: 'History', prompt: 'Carthaginian general who crossed the Alps?', answers: ['hannibal', 'hannibal barca'] },
  { category: 'History', prompt: 'Ancient Greek historian often called the "Father of History"?', answers: ['herodotus'] },
  { category: 'History', prompt: 'Roman statesman assassinated on the Ides of March in 44 BC?', answers: ['julius caesar', 'caesar'] },
  { category: 'Literature', prompt: 'Author of "Crime and Punishment"? (last name)', answers: ['dostoevsky', 'fyodor dostoevsky'] },
  { category: 'Literature', prompt: 'Author of "Brave New World"? (last name)', answers: ['huxley', 'aldous huxley'] },
  { category: 'Literature', prompt: 'Author of "The Metamorphosis"? (last name)', answers: ['kafka', 'franz kafka'] },
  { category: 'Literature', prompt: 'Author of "Moby-Dick"? (last name)', answers: ['melville', 'herman melville'] },
  { category: 'Literature', prompt: 'Author of "Catch-22"? (last name)', answers: ['heller', 'joseph heller'] },
  { category: 'Computing', prompt: 'HTTP status code for "I’m a teapot"?', answers: ['418'] },
  { category: 'Computing', prompt: 'HTTP status code for "Not Found"?', answers: ['404'] },
  { category: 'Computing', prompt: 'Default port for PostgreSQL?', answers: ['5432'] },
  { category: 'Computing', prompt: 'Creator of the Linux kernel? (last name)', answers: ['torvalds', 'linus torvalds'] },
  { category: 'Geometry', prompt: 'How many faces are on a regular dodecahedron?', answers: ['12'] },
  { category: 'Geometry', prompt: 'How many faces are on a regular icosahedron?', answers: ['20'] },
  { category: 'Geometry', prompt: 'Sum of interior angles of a pentagon (degrees)?', answers: ['540'] },
  { category: 'Biology', prompt: 'Nitrogenous base pairing with Cytosine in DNA?', answers: ['guanine', 'g'] },
  { category: 'Biology', prompt: 'Nitrogenous base found in RNA instead of Thymine?', answers: ['uracil', 'u'] },
  { category: 'Music', prompt: 'Italian musical term meaning "gradually getting louder"?', answers: ['crescendo'] },
  { category: 'Art', prompt: 'Dutch artist who painted "The Starry Night"? (last name)', answers: ['van gogh', 'gogh', 'vincent van gogh'] },
  { category: 'Mythology', prompt: 'In Greek myth, who ferried souls across the river Styx?', answers: ['charon'] },
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
  { category: 'Geography', prompt: 'Capital of Madagascar?', answers: ['antananarivo'] },
  { category: 'Geography', prompt: 'Capital of Belize?', answers: ['belmopan'] },
  { category: 'Geography', prompt: 'Capital of Brunei?', answers: ['bandar seri begawan'] },
  { category: 'Geography', prompt: 'Strait separating Asia from North America?', answers: ['bering', 'bering strait'] },
  { category: 'Geography', prompt: 'Strait separating Spain from Morocco?', answers: ['gibraltar', 'strait of gibraltar'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Praseodymium?', answers: ['pr'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Dysprosium?', answers: ['dy'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Molybdenum?', answers: ['mo'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Technetium?', answers: ['tc'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Darmstadtium?', answers: ['ds'] },
  { category: 'Chemistry', prompt: 'Chemical symbol for Promethium?', answers: ['pm'] },
  { category: 'Chemistry', prompt: 'Element 107 named after Niels Bohr?', answers: ['bohrium', 'bh'] },
  { category: 'Chemistry', prompt: 'Element 104 named after Ernest Rutherford?', answers: ['rutherfordium', 'rf'] },
  { category: 'Chemistry', prompt: 'Only metal that is liquid at standard room temp (20°C)?', answers: ['mercury', 'hg'] },
  { category: 'Chemistry', prompt: 'Mineral with hardness 10 on the Mohs scale?', answers: ['diamond'] },
  { category: 'Chemistry', prompt: 'Allotrope of oxygen consisting of three oxygen atoms?', answers: ['ozone', 'o3'] },
  { category: 'Physics', prompt: 'SI unit of absorbed radiation dose?', answers: ['gray', 'gy'] },
  { category: 'Physics', prompt: 'SI unit of luminous flux?', answers: ['lumen', 'lm'] },
  { category: 'Physics', prompt: 'SI unit of magnetic flux density?', answers: ['tesla', 't'] },
  { category: 'Physics', prompt: 'Particles that mediate the strong nuclear force?', answers: ['gluons', 'gluon'] },
  { category: 'Physics', prompt: 'Hypothetical particle that travels faster than light?', answers: ['tachyon', 'tachyons'] },
  { category: 'Physics', prompt: 'Scientist who formulated the Uncertainty Principle? (last name)', answers: ['heisenberg', 'werner heisenberg'] },
  { category: 'Physics', prompt: 'Austrian physicist behind the Exclusion Principle? (last name)', answers: ['pauli', 'wolfgang pauli'] },
  { category: 'Astronomy', prompt: 'Retrograde largest moon of Neptune?', answers: ['triton'] },
  { category: 'Astronomy', prompt: 'Volcanically active innermost Galilean moon of Jupiter?', answers: ['io'] },
  { category: 'Astronomy', prompt: 'Largest known volcano in the solar system?', answers: ['olympus', 'olympus mons'] },
  { category: 'Astronomy', prompt: 'Star closest to Earth’s north celestial pole?', answers: ['polaris'] },
  { category: 'Astronomy', prompt: 'Moon of Uranus named after a character in "The Tempest"?', answers: ['miranda', 'ariel', 'prospero', 'caliban', 'sycorax', 'trinculo', 'stephano', 'setebos', 'francisco', 'ferdinand'] },
  { category: 'History', prompt: 'Year the Peace of Westphalia was signed?', answers: ['1648'] },
  { category: 'History', prompt: 'Year of the Battle of Waterloo?', answers: ['1815'] },
  { category: 'History', prompt: 'Year of the Defenestration of Prague (start of Thirty Years’ War)?', answers: ['1618'] },
  { category: 'History', prompt: 'Year the Treaty of Versailles was signed?', answers: ['1919'] },
  { category: 'History', prompt: 'Last Tsar of Russia? (first name)', answers: ['nicholas', 'nicholas ii'] },
  { category: 'History', prompt: 'Byzantine Emperor who commissioned Hagia Sophia?', answers: ['justinian', 'justinian i'] },
  { category: 'History', prompt: 'Ancient library destroyed in Ptolemaic Egypt?', answers: ['alexandria', 'library of alexandria'] },
  { category: 'History', prompt: 'Persian king defeated at the Battle of Marathon in 490 BC?', answers: ['darius', 'darius i'] },
  { category: 'Literature', prompt: 'Author of "Ulysses"? (last name)', answers: ['joyce', 'james joyce'] },
  { category: 'Literature', prompt: 'Author of "Don Quixote"? (last name)', answers: ['cervantes', 'miguel de cervantes'] },
  { category: 'Literature', prompt: 'Author of "One Hundred Years of Solitude"? (last name)', answers: ['marquez', 'garcia marquez'] },
  { category: 'Literature', prompt: 'Author of "The Divine Comedy"?', answers: ['dante', 'alighieri', 'dante alighieri'] },
  { category: 'Literature', prompt: 'Author of "The Stranger" (L’Étranger)? (last name)', answers: ['camus', 'albert camus'] },
  { category: 'Literature', prompt: 'Author of "Waiting for Godot"? (last name)', answers: ['beckett', 'samuel beckett'] },
  { category: 'Computing', prompt: 'Standard IANA port for DNS?', answers: ['53'] },
  { category: 'Computing', prompt: 'Standard IANA port for BGP?', answers: ['179'] },
  { category: 'Computing', prompt: 'Standard IANA port for SMTP?', answers: ['25'] },
  { category: 'Computing', prompt: 'Creator of the C programming language? (last name)', answers: ['ritchie', 'dennis ritchie'] },
  { category: 'Computing', prompt: 'Turing Award pioneer who invented Quicksort? (last name)', answers: ['hoare', 'tony hoare'] },
  { category: 'Computing', prompt: 'Mathematician behind the shortest-path graph algorithm? (last name)', answers: ['dijkstra', 'edsger dijkstra'] },
  { category: 'Science', prompt: 'Smallest prime number that is also even?', answers: ['2', 'two'] },
  { category: 'Science', prompt: 'Smallest Carmichael number?', answers: ['561'] },
  { category: 'Mythology', prompt: 'In Norse myth, the wolf fated to devour Odin at Ragnarök?', answers: ['fenrir'] },
  { category: 'Mythology', prompt: 'In Greek myth, the muse of astronomy?', answers: ['urania'] },
  { category: 'Music', prompt: 'Interval of an augmented fourth / diminished fifth is also called a ___?', answers: ['tritone'] },
];

// Additional structured factual banks for high variety without repetition

const US_STATE_CAPITALS_EASY: Array<[string, string[]]> = [
  ['Texas', ['austin']],
  ['California', ['sacramento']],
  ['New York', ['albany']],
  ['Florida', ['tallahassee']],
  ['Hawaii', ['honolulu']],
  ['Massachusetts', ['boston']],
  ['Georgia', ['atlanta']],
  ['Arizona', ['phoenix']],
  ['Colorado', ['denver']],
  ['Tennessee', ['nashville']],
];

const US_STATE_CAPITALS_MEDIUM: Array<[string, string[]]> = [
  ['Washington', ['olympia']],
  ['Oregon', ['salem']],
  ['Illinois', ['springfield']],
  ['Ohio', ['columbus']],
  ['Michigan', ['lansing']],
  ['Pennsylvania', ['harrisburg']],
  ['Virginia', ['richmond']],
  ['North Carolina', ['raleigh']],
  ['Nevada', ['carson city']],
  ['Minnesota', ['saint paul', 'st paul']],
  ['Wisconsin', ['madison']],
  ['Louisiana', ['baton rouge']],
];

const US_STATE_CAPITALS_HARD: Array<[string, string[]]> = [
  ['South Dakota', ['pierre']],
  ['North Dakota', ['bismarck']],
  ['Montana', ['helena']],
  ['Vermont', ['montpelier']],
  ['Kentucky', ['frankfort']],
  ['Maine', ['augusta']],
  ['Missouri', ['jefferson city']],
  ['New Hampshire', ['concord']],
  ['Wyoming', ['cheyenne']],
  ['Alaska', ['juneau']],
  ['Maryland', ['annapolis']],
  ['Delaware', ['dover']],
];

const WORLD_CAPITALS_MEDIUM: Array<[string, string[]]> = [
  ['Portugal', ['lisbon']],
  ['Ireland', ['dublin']],
  ['Austria', ['vienna']],
  ['Netherlands', ['amsterdam']],
  ['Belgium', ['brussels']],
  ['Sweden', ['stockholm']],
  ['Norway', ['oslo']],
  ['Denmark', ['copenhagen']],
  ['Poland', ['warsaw']],
  ['Argentina', ['buenos aires']],
  ['India', ['new delhi', 'delhi']],
  ['China', ['beijing']],
];

const WORLD_CAPITALS_HARD: Array<[string, string[]]> = [
  ['Finland', ['helsinki']],
  ['Czechia', ['prague']],
  ['Hungary', ['budapest']],
  ['Romania', ['bucharest']],
  ['Chile', ['santiago']],
  ['Colombia', ['bogota']],
  ['Malaysia', ['kuala lumpur']],
  ['Indonesia', ['jakarta']],
  ['Philippines', ['manila']],
  ['Iran', ['tehran']],
  ['Saudi Arabia', ['riyadh']],
  ['South Africa (executive)', ['pretoria']],
];

const WORLD_CAPITALS_INSANE: Array<[string, string[]]> = [
  ['Croatia', ['zagreb']],
  ['Slovakia', ['bratislava']],
  ['Bulgaria', ['sofia']],
  ['Serbia', ['belgrade']],
  ['Georgia', ['tbilisi']],
  ['Armenia', ['yerevan']],
  ['Uzbekistan', ['tashkent']],
  ['Oman', ['muscat']],
  ['Jordan', ['amman']],
  ['Ethiopia', ['addis ababa']],
  ['Ghana', ['accra']],
  ['Senegal', ['dakar']],
];

const WORLD_CAPITALS_EXTREME: Array<[string, string[]]> = [
  ['Comoros', ['moroni']],
  ['Djibouti', ['djibouti', 'djibouti city']],
  ['Guinea-Bissau', ['bissau']],
  ['Sao Tome and Principe', ['sao tome']],
  ['Andorra', ['andorra la vella']],
  ['San Marino', ['san marino']],
  ['Nauru', ['yaren']],
  ['Kiribati', ['tarawa', 'south tarawa']],
  ['Timor-Leste', ['dili']],
  ['Lesotho', ['maseru']],
  ['Eswatini (administrative)', ['mbabane']],
  ['Botswana', ['gaborone']],
  ['Namibia', ['windhoek']],
  ['Zambia', ['lusaka']],
];

// Periodic table elements for genuine chemistry trivia
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

const CURATED_BY_TIER: Record<QuestionTier, RawTrivia[]> = {
  easy: EASY_TRIVIA,
  medium: MEDIUM_TRIVIA,
  hard: HARD_TRIVIA,
  insane: INSANE_TRIVIA,
  extreme: EXTREME_TRIVIA,
};

function buildExpandedPoolForTier(tier: QuestionTier): RawTrivia[] {
  const pool: RawTrivia[] = [...CURATED_BY_TIER[tier]];

  if (tier === 'easy') {
    for (const [state, answers] of US_STATE_CAPITALS_EASY) {
      pool.push({ category: 'Geography', prompt: `Capital of ${state}?`, answers });
    }
    for (const [num, sym, name] of PERIODIC_ELEMENTS.slice(0, 10)) {
      pool.push({
        category: 'Science',
        prompt: `What chemical element has the symbol "${sym}"?`,
        answers: [name.toLowerCase()],
      });
      if (num <= 8) {
        pool.push({
          category: 'Science',
          prompt: `Chemical symbol for ${name}?`,
          answers: [sym.toLowerCase()],
        });
      }
    }
  } else if (tier === 'medium') {
    for (const [state, answers] of US_STATE_CAPITALS_MEDIUM) {
      pool.push({ category: 'Geography', prompt: `Capital of ${state}?`, answers });
    }
    for (const [country, answers] of WORLD_CAPITALS_MEDIUM) {
      pool.push({ category: 'Geography', prompt: `Capital of ${country}?`, answers });
    }
    for (const [, sym, name] of PERIODIC_ELEMENTS.slice(10, 20)) {
      pool.push({
        category: 'Chemistry',
        prompt: `Chemical symbol for ${name}?`,
        answers: [sym.toLowerCase()],
      });
    }
  } else if (tier === 'hard') {
    for (const [state, answers] of US_STATE_CAPITALS_HARD) {
      pool.push({ category: 'Geography', prompt: `Capital of ${state}?`, answers });
    }
    for (const [country, answers] of WORLD_CAPITALS_HARD) {
      pool.push({ category: 'Geography', prompt: `Capital of ${country}?`, answers });
    }
    for (const [num, sym, name] of PERIODIC_ELEMENTS.slice(0, 30)) {
      pool.push({
        category: 'Chemistry',
        prompt: `Element with atomic number ${num}?`,
        answers: [name.toLowerCase(), sym.toLowerCase()],
      });
    }
  } else if (tier === 'insane') {
    for (const [country, answers] of WORLD_CAPITALS_INSANE) {
      pool.push({ category: 'Geography', prompt: `Capital of ${country}?`, answers });
    }
    for (const [num, sym, name] of PERIODIC_ELEMENTS.slice(18, 34)) {
      pool.push({
        category: 'Chemistry',
        prompt: `Atomic number of ${name}?`,
        answers: [String(num)],
      });
      pool.push({
        category: 'Chemistry',
        prompt: `Chemical symbol for ${name}?`,
        answers: [sym.toLowerCase()],
      });
    }
  } else if (tier === 'extreme') {
    for (const [country, answers] of WORLD_CAPITALS_EXTREME) {
      pool.push({ category: 'Geography', prompt: `Capital of ${country}?`, answers });
    }
    for (const [num, sym, name] of PERIODIC_ELEMENTS.slice(34)) {
      pool.push({
        category: 'Chemistry',
        prompt: `Atomic number of ${name}?`,
        answers: [String(num)],
      });
      pool.push({
        category: 'Chemistry',
        prompt: `Element with atomic number ${num}?`,
        answers: [name.toLowerCase(), sym.toLowerCase()],
      });
    }
  }

  // Deduplicate prompts to guarantee every question in a tier is distinct
  const seen = new Set<string>();
  return pool.filter((item) => {
    if (seen.has(item.prompt)) return false;
    seen.add(item.prompt);
    return true;
  });
}

const EXPANDED_POOLS: Record<QuestionTier, RawTrivia[]> = {
  easy: buildExpandedPoolForTier('easy'),
  medium: buildExpandedPoolForTier('medium'),
  hard: buildExpandedPoolForTier('hard'),
  insane: buildExpandedPoolForTier('insane'),
  extreme: buildExpandedPoolForTier('extreme'),
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickFrom<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export const QUESTION_POOL_ESTIMATES: Record<QuestionTier, number> = {
  easy: EXPANDED_POOLS.easy.length,
  medium: EXPANDED_POOLS.medium.length,
  hard: EXPANDED_POOLS.hard.length,
  insane: EXPANDED_POOLS.insane.length,
  extreme: EXPANDED_POOLS.extreme.length,
};

export function pickQuestion(tiers: QuestionTier[], usedPrompts: Set<string>): QuestionItem {
  const tier = tiers[randInt(0, tiers.length - 1)];
  const fullPool = EXPANDED_POOLS[tier];
  const unused = fullPool.filter((q) => !usedPrompts.has(q.prompt));
  const candidates = unused.length > 0 ? unused : fullPool;
  const picked = pickFrom(candidates);
  usedPrompts.add(picked.prompt);

  return {
    ...picked,
    tier,
    id: `triv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
