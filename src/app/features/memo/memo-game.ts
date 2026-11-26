import { Language, LEVELS, MemoLevel } from './memo-levels';
import { TEXT } from './memo-text';

type PowerKind = 'potion' | 'shield' | 'seer' | 'satellite' | 'abracadabra';
type CardKind = 'monster' | 'item' | PowerKind;

export interface Card {
  id: string;
  kind: CardKind;
  name: string;
  icon: string;
  line: string;
  pair?: string;
}

export const MAX_LIVES = 10;
export const DAMAGE = { 1: [1, 2], 2: [1, 3], 3: [2, 3] } as const;

const POWERS: Record<MemoLevel['world'], readonly PowerKind[]> = {
  earth: ['potion', 'seer'],
  space: ['shield', 'satellite'],
  super: ['potion', 'shield', 'seer', 'abracadabra']
};
const POWER_ORDER: readonly CardKind[] = ['potion', 'shield', 'seer', 'satellite', 'abracadabra'];

export function buildDeck(level: MemoLevel, language: Language = 'es'): Card[] {
  const text = TEXT[language];
  const powers: Record<PowerKind, { icon: string; line: string }> = {
    potion: { icon: '⚗️', line: text.potionLine },
    shield: { icon: '🛡️', line: text.shieldLine },
    seer: { icon: '🔮', line: text.seerLine },
    satellite: { icon: '🛰️', line: text.satelliteLine },
    abracadabra: { icon: '🪄', line: text.spellLine }
  };
  return [
    ...level.pairs.flatMap(({ monster, item }, index): Card[] => [
      { id: `m${index}`, kind: 'monster', name: monster.name[language], icon: monster.icon, line: monster.line[language], pair: `p${index}` },
      { id: `i${index}`, kind: 'item', name: item.name[language], icon: item.icon, line: item.line[language], pair: `p${index}` }
    ]),
    ...POWERS[level.world].map(kind => ({ id: kind, kind, name: text[kind], ...powers[kind] }))
  ];
}

export const DECK: readonly Card[] = buildDeck(LEVELS[0]);

export function shuffle(cards: readonly Card[], random = Math.random): Card[] {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export class MemoGame {
  lives = MAX_LIVES;
  pairs = 0;
  attempts = 0;
  readonly removed = new Set<number>();
  readonly pinned = new Set<number>();
  readonly banished = new Set<number>();
  open: number[] = [];
  peeked: number[] = [];
  locked = false;
  message: string;
  lastCard: Card | null = null;
  lastHitCount = 0;
  shieldReady = false;
  blockedHit = false;
  tone: 'neutral' | 'good' | 'hit' = 'neutral';

  readonly targetPairs: number;
  readonly powerCards: readonly Card[];

  constructor(readonly deck = shuffle(DECK), private readonly random = Math.random, private readonly language: Language = 'es',
    readonly damage: readonly [number, number] = DAMAGE[1]) {
    this.targetPairs = deck.filter(card => card.kind === 'monster').length;
    this.powerCards = deck.filter(card => POWER_ORDER.includes(card.kind))
      .sort((a, b) => POWER_ORDER.indexOf(a.kind) - POWER_ORDER.indexOf(b.kind));
    this.message = this.text.start;
  }

  private get text() { return TEXT[this.language]; }
  get won(): boolean { return this.pairs === this.targetPairs; }
  get lost(): boolean { return this.lives === 0; }

  isVisible(index: number): boolean {
    return this.removed.has(index) || this.open.includes(index) || this.peeked.includes(index) || this.pinned.has(index);
  }

  canFlip(index: number): boolean {
    return !!this.deck[index] && !this.locked && !this.won && !this.lost && !this.removed.has(index) && !this.open.includes(index);
  }

  flip(index: number): 'turn' | 'peek' | undefined {
    if (!this.canFlip(index)) return;
    const card = this.deck[index];
    this.lastCard = card;
    this.lastHitCount = 0;
    this.blockedHit = false;
    if (card.kind !== 'monster' && card.kind !== 'item') {
      this.removed.add(index);
      this.tone = 'good';
      if (card.kind === 'potion') {
        this.message = this.text.heal(card.name, this.lives === MAX_LIVES);
        this.lives = MAX_LIVES;
        return;
      }
      if (card.kind === 'shield') {
        this.shieldReady = true;
        this.message = this.text.shieldReady;
        return;
      }
      if (card.kind === 'abracadabra') {
        const monsters = this.deck.flatMap((candidate, i) => (
          candidate.kind === 'monster' && !this.removed.has(i) ? [i] : []
        ));
        const target = monsters[Math.floor(this.random() * monsters.length)];
        if (target === undefined) return;
        const monster = this.deck[target];
        const partner = this.deck.findIndex(candidate => candidate.kind === 'item' && candidate.pair === monster.pair);
        if (partner === -1) return;
        this.banished.add(target);
        this.banished.add(partner);
        this.clearPair([target, partner]);
        this.message = this.text.spell(monster.name);
        return;
      }
      const scan = card.kind === 'satellite';
      const cancelled = scan ? undefined : this.open[0];
      if (!scan) this.open = [];
      const hidden = this.deck.map((candidate, i) => ({ candidate, i }))
        .filter(({ candidate, i }) => !this.isVisible(i) && (scan
          ? candidate.kind === 'monster'
          : i !== cancelled && (candidate.kind === 'monster' || candidate.kind === 'item')))
        .map(({ i }) => i);
      if (!hidden.length) {
        this.message = scan ? this.text.noScan : this.text.noPeek;
        return;
      }
      if (scan) {
        this.peeked = hidden;
        this.message = this.text.scan(hidden.length);
        this.locked = true;
        return 'peek';
      } else {
        const peek = hidden[Math.floor(this.random() * hidden.length)];
        this.pinned.add(peek);
        this.message = this.text.peek(peek + 1, this.deck[peek].name);
      }
      return;
    }

    this.open = [...this.open, index];
    this.tone = 'neutral';
    if (this.open.length === 1) {
      this.message = this.text.pick(card.name);
      return;
    }

    this.attempts++;
    const [first, second] = this.open.map(i => this.deck[i]);
    if (first.kind !== second.kind && first.pair && first.pair === second.pair) {
      this.clearPair(this.open);
      this.message = this.won ? this.text.winMessage : this.text.match;
      this.tone = 'good';
      return;
    }

    const monsters = [first, second].filter(c => c.kind === 'monster').length;
    this.lastHitCount = monsters;
    this.locked = true;
    if (monsters && this.shieldReady) {
      this.shieldReady = false;
      this.blockedHit = true;
      this.tone = 'good';
      this.message = this.text.blocked;
      return 'turn';
    }
    const damage = Math.min(this.lives, monsters ? this.damage[monsters - 1] : 0);
    this.lives -= damage;
    this.tone = monsters ? 'hit' : 'neutral';
    this.message = this.lost ? this.text.loseMessage : monsters ? this.text.hit(monsters, damage) : this.text.noHit;
    return 'turn';
  }

  private clearPair(indices: readonly number[]): void {
    indices.forEach(i => {
      this.removed.add(i);
      this.pinned.delete(i);
    });
    this.open = this.open.filter(i => !indices.includes(i));
    this.pairs++;
  }

  finishReveal(): void {
    if (!this.locked) return;
    if (this.peeked.length) this.peeked = [];
    else this.open = [];
    this.locked = false;
  }
}
