export type Language = 'es' | 'en';
export type Translation = Readonly<Record<Language, string>>;
const t = (es: string, en: string): Translation => ({ es, en });

interface Face {
  name: Translation;
  icon: string;
  line: Translation;
}
export interface Pair {
  monster: Face;
  item: Face;
  clue: Translation;
}

function pair(monster: [string, string, string], item: [string, string, string],
  monsterLine: Translation, itemLine: Translation, clue: Translation): Pair {
  return {
    monster: { name: t(monster[0], monster[1]), icon: monster[2], line: monsterLine },
    item: { name: t(item[0], item[1]), icon: item[2], line: itemLine },
    clue
  };
}

export const PAIRS: readonly Pair[] = [
  pair(['Vampiro', 'Vampire', '🧛'], ['Estaca encantada', 'Enchanted Stake', '🪵'],
    t('¡Cinco minutitos más!', 'Five more minutes!'), t('¡Hora de dormir!', 'Time for bed!'), t('Su luz manda al vampiro a dormir.', 'Its light sends the vampire to bed.')),
  pair(['Fantasma', 'Ghost', '👻'], ['Cruz luminosa', 'Glowing Cross', '✝️'],
    t('¡Buuu! ¿Dónde está la salida?', 'Boo! Where is the way out?'), t('¡Yo te ilumino el camino!', 'I’ll light the way!'), t('La luz le muestra la salida al fantasma.', 'Its light shows the ghost the way out.')),
  pair(['Hombre lobo', 'Werewolf', '🐺'], ['Bala plateada', 'Silver Bullet', '🌙'],
    t('¡Auuuu! ¡Esa luna me hace aullar!', 'Awooo! That moon makes me howl!'), t('¡Brillo de plata!', 'Silver sparkle!'), t('La plata rompe el hechizo de la luna.', 'Silver breaks the moon’s spell.')),
  pair(['Momia', 'Mummy', '🧻'], ['Tijeras mágicas', 'Magic Scissors', '✂️'],
    t('¡Uy, se me soltó una venda!', 'Oops, my bandage came loose!'), t('¡Clic, clac! ¡Una venda menos!', 'Snip, snap! One less bandage!'), t('Al cortar una venda, la momia se enreda.', 'Snipping a bandage gets the mummy all tangled up.')),
  pair(['Bruja', 'Witch', '🧙'], ['Reloj de arena', 'Hourglass', '⌛'],
    t('¡Abracadabra! ¿Cómo seguía?', 'Abracadabra! What comes next?'), t('¡Tic, tac! Volvamos atrás.', 'Tick, tock! Let’s go back.'), t('El reloj va hacia atrás y deshace el hechizo.', 'The clock goes backward and undoes the spell.')),
  pair(['Esqueleto', 'Skeleton', '💀'], ['Hueso señuelo', 'Bouncy Bone', '🦴'],
    t('¡Clac, clac! ¿Quién vio mi hueso?', 'Clack, clack! Who saw my bone?'), t('¡Boing! ¡A que no me alcanzás!', 'Boing! Bet you can’t catch me!'), t('El esqueleto corre tras el hueso y se desarma como un juguete.', 'The skeleton chases the bone and falls apart like a toy.')),
  pair(['Dragón', 'Dragon', '🐲'], ['Escudo espejo', 'Mirror Shield', '🛡️'],
    t('¡Uf, qué calentito mi aliento!', 'Whew, my breath is hot!'), t('¡Mirá cómo brilla tu reflejo!', 'Look at that shiny reflection!'), t('El escudo refleja el fuego y el dragón se va del susto.', 'The shield reflects the fire, and the surprised dragon flies away.')),
  pair(['Duende', 'Goblin', '👺'], ['Campana', 'Bell', '🔔'],
    t('¿Quién se anima a bailar conmigo?', 'Who wants to dance with me?'), t('¡Tilín, tilín! ¡A bailar!', 'Ding, ding! Let’s dance!'), t('La campana hace bailar al duende.', 'The bell gets the goblin dancing.')),
  pair(['Slime', 'Slime', '🟢'], ['Sal encantada', 'Enchanted Salt', '🧂'],
    t('¡Plop! ¡Me gusta rebotar!', 'Plop! I love to bounce!'), t('¡Una pizquita de magia!', 'A tiny pinch of magic!'), t('La sal convierte al slime en gelatina.', 'The salt turns the slime into jelly.'))
];

export const SPACE_PAIRS: readonly Pair[] = [
  pair(['Piroide de fuego', 'Fire Pyroid', '🔥'], ['Láser de agua', 'Water Laser', '💧'],
    t('¡Ardo como una fogata!', 'I’m as toasty as a campfire!'), t('¡Chof! ¡Un chorrito!', 'Splash! A little squirt!'), t('El agua apaga el fuego.', 'Water puts out fire.')),
  pair(['Medusa de agua', 'Water Jellyfish', '🪼'], ['Láser de hielo', 'Ice Laser', '❄️'],
    t('¡Glup, glup! ¡Vivo en una burbuja!', 'Glub, glub! I live in a bubble!'), t('¡Brrr! ¡Todo se congela!', 'Brrr! Everything freezes!'), t('El hielo congela la burbuja de agua.', 'Ice freezes the bubble of water.')),
  pair(['Yeti de hielo', 'Ice Yeti', '🧊'], ['Láser de calor', 'Heat Laser', '☀️'],
    t('¡Me encanta el frío!', 'I love the cold!'), t('¡Un rayito calentito!', 'Here comes a warm beam!'), t('El calor derrite la armadura de hielo.', 'Heat melts the ice armor.')),
  pair(['Chispa de rayo', 'Spark Sprite', '⚡'], ['Láser de tierra', 'Earth Laser', '🪨'],
    t('¡Zas! ¡Mirá mis chispas!', 'Zap! Look at my sparks!'), t('¡Al suelo, chispa!', 'Down to the ground, spark!'), t('La tierra se lleva las chispas.', 'The ground takes the sparks away.')),
  pair(['Gólem de roca', 'Rock Golem', '🗿'], ['Láser de viento', 'Wind Laser', '🌬️'],
    t('¡Soy un montón de piedritas!', 'I’m a whole pile of pebbles!'), t('¡Fuuu! ¡Piedritas al aire!', 'Whoosh! Pebbles, up you go!'), t('El viento separa las piedritas del gólem.', 'Wind scatters the golem’s pebbles.')),
  pair(['Remolino de viento', 'Wind Whirl', '🌪️'], ['Láser de gravedad', 'Gravity Laser', '🪐'],
    t('¡Giro, giro y no me mareo!', 'Spin, spin! I never get dizzy!'), t('¡Pies en el piso!', 'Feet on the ground!'), t('La gravedad atrae el remolino al suelo.', 'Gravity pulls the whirl down to the ground.')),
  pair(['Espectro de sombra', 'Shadow Specter', '🌑'], ['Láser de luz', 'Light Laser', '🌟'],
    t('¡Shhh! Me escondo en lo oscuro.', 'Shhh! I hide in the dark.'), t('¡Prendamos la luz!', 'Let’s turn on the light!'), t('La luz hace desaparecer la sombra.', 'Light makes the shadow disappear.')),
  pair(['Lucero de luz', 'Shiny Star', '💡'], ['Láser de sombra', 'Shadow Laser', '🌘'],
    t('¡Brillo más que un farol!', 'I’m brighter than a lantern!'), t('¡Puf! ¡Un eclipse!', 'Poof! An eclipse!'), t('La sombra tapa la luz del lucero.', 'Shadow covers up the star’s light.')),
  pair(['Titán de gravedad', 'Gravity Titan', '🌀'], ['Láser antigravedad', 'Antigravity Laser', '🛸'],
    t('¡Conmigo todo pesa!', 'I make everything heavy!'), t('¡A flotar como un globo!', 'Float up like a balloon!'), t('La antigravedad hace que el titán flote.', 'Antigravity makes the titan float.'))
];

export interface MemoLevel {
  title: Translation;
  world: 'earth' | 'space' | 'super';
  tier: 1 | 2 | 3;
  pairs: readonly Pair[];
  turnMs: number;
  scanMs: number;
}

function withVariant(pairs: readonly Pair[], index: number, name: Translation, icon: string): readonly Pair[] {
  return pairs.map((entry, i) => i === index ? { ...entry, monster: { ...entry.monster, name, icon } } : entry);
}

export const LEVELS: readonly MemoLevel[] = [
  { title: t('La mansión encantada', 'The Haunted Mansion'), world: 'earth', tier: 1, pairs: PAIRS, turnMs: 1700, scanMs: 0 },
  { title: t('La cripta lunar', 'The Moonlit Crypt'), world: 'earth', tier: 2, pairs: withVariant(PAIRS, 3, t('Momia faraona', 'Pharaoh Mummy'), '👑'), turnMs: 1600, scanMs: 0 },
  { title: t('La torre del dragón', 'The Dragon’s Tower'), world: 'earth', tier: 3, pairs: withVariant(PAIRS, 6, t('Dragón guardián', 'Guardian Dragon'), '🐉'), turnMs: 1500, scanMs: 0 },
  { title: t('Órbita de la Tierra', 'Earth Orbit'), world: 'space', tier: 1, pairs: SPACE_PAIRS, turnMs: 1700, scanMs: 5000 },
  { title: t('Cinturón de asteroides', 'Asteroid Belt'), world: 'space', tier: 2, pairs: withVariant(SPACE_PAIRS, 4, t('Gólem de asteroide', 'Asteroid Golem'), '☄️'), turnMs: 1600, scanMs: 4500 },
  { title: t('La nebulosa final', 'The Final Nebula'), world: 'space', tier: 3, pairs: withVariant(SPACE_PAIRS, 8, t('Titán de la nebulosa', 'Nebula Titan'), '🌌'), turnMs: 1500, scanMs: 4000 }
];

export const SUPER_LEVEL: MemoLevel = {
  title: t('Súper Memotest', 'Super Memory Quest'), world: 'super', tier: 3, pairs: [...PAIRS, ...SPACE_PAIRS], turnMs: 1700, scanMs: 0
};
