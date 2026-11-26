import { buildDeck, DAMAGE, DECK, MAX_LIVES, MemoGame, shuffle } from './memo-game';
import { LEVELS, SUPER_LEVEL } from './memo-levels';

describe('Monstruomemo', () => {
  let game: MemoGame;
  beforeEach(() => { game = new MemoGame([...DECK], () => 0); });

  it('deals 20 unique cards: nine pairs and two power-ups', () => {
    const shuffled = shuffle(DECK, () => 0);
    expect(shuffled.length).toBe(20);
    expect(new Set(shuffled.map(card => card.id)).size).toBe(20);
    expect(shuffled.filter(card => card.kind === 'monster').length).toBe(9);
    expect(shuffled.filter(card => card.kind === 'item').length).toBe(9);
    expect(shuffled.filter(card => card.kind === 'seer' || card.kind === 'potion').length).toBe(2);
    expect(shuffled).not.toEqual(DECK);
    expect(game.lives).toBe(MAX_LIVES);
  });

  it('clears a matching monster and item in either order, without damage', () => {
    game.flip(1);
    game.flip(0);
    expect(game.pairs).toBe(1);
    expect(game.lives).toBe(10);
    expect(game.removed.has(0) && game.removed.has(1)).toBeTrue();
    expect(game.canFlip(0)).toBeFalse();
  });

  it('takes two, one or zero lives depending on the monsters in a mismatch', () => {
    game.flip(0);
    expect(game.flip(2)).toBe('turn');
    expect(game.lives).toBe(8);
    game.flip(1);
    expect(game.open).toEqual([0, 2]);
    game.finishReveal();
    expect(game.isVisible(0)).toBeFalse();
    game.flip(0);
    game.flip(3);
    expect(game.lives).toBe(7);
    game.finishReveal();
    game.flip(1);
    game.flip(3);
    expect(game.lives).toBe(7);
    expect(game.pairs).toBe(0);
  });

  it('restores every life once without using the first selection', () => {
    game.lives = 2;
    game.flip(0);
    game.flip(18);
    expect(game.lives).toBe(10);
    expect(game.open).toEqual([0]);
    expect(game.canFlip(18)).toBeFalse();
    game.flip(1);
    expect(game.pairs).toBe(1);
  });

  it('uses the seer to cancel the pending card and keeps one other card visible until matched', () => {
    game.flip(0);
    game.flip(19);
    expect([...game.pinned]).toEqual([1]);
    expect(game.isVisible(1)).toBeTrue();
    expect(game.isVisible(0)).toBeFalse();
    expect(game.lives).toBe(MAX_LIVES);
    expect(game.pairs).toBe(0);
    expect(game.canFlip(1)).toBeTrue();
    expect(game.open).toEqual([]);
    expect(game.canFlip(19)).toBeFalse();
    game.flip(1);
    game.flip(2);
    game.finishReveal();
    expect(game.isVisible(1)).toBeTrue();
    game.flip(1);
    game.flip(0);
    expect(game.pairs).toBe(1);
  });

  it('does not undo a potion played before the seer', () => {
    game.lives = 3;
    game.flip(18);
    game.flip(19);
    expect(game.lives).toBe(MAX_LIVES);
    expect(game.pinned.size).toBe(1);
    expect(game.removed.has(18)).toBeTrue();
  });

  it('wins after finding every pair even if the power-ups were not used', () => {
    for (let index = 0; index < game.targetPairs * 2; index++) game.flip(index);
    expect(game.won).toBeTrue();
    expect(game.lost).toBeFalse();
    expect(game.canFlip(18)).toBeFalse();
  });

  it('ends the game at zero and does not allow a potion after losing', () => {
    game.lives = 1;
    game.flip(0);
    game.flip(2);
    game.finishReveal();
    game.flip(18);
    expect(game.lives).toBe(0);
    expect(game.lost).toBeTrue();
  });

  it('applies the requested single/double damage at each difficulty tier', () => {
    for (const [index, damage] of [[0, [1, 2]], [1, [1, 3]], [2, [2, 3]]] as const) {
      const level = LEVELS[index];
      const play = new MemoGame(buildDeck(level), () => 0, 'es', DAMAGE[level.tier]);
      play.flip(0);
      play.flip(3);
      expect(play.lives).toBe(MAX_LIVES - damage[0]);
      play.finishReveal();
      play.flip(0);
      play.flip(2);
      expect(play.lives).toBe(MAX_LIVES - damage[0] - damage[1]);
    }
  });

  it('scans only hidden space monsters and restores their hidden state without using the first card', () => {
    const space = new MemoGame(buildDeck(LEVELS[3]));
    space.flip(0);
    expect(space.flip(19)).toBe('peek');
    expect(space.peeked).toEqual([2, 4, 6, 8, 10, 12, 14, 16]);
    expect(space.isVisible(1)).toBeFalse();
    space.finishReveal();
    expect(space.open).toEqual([0]);
    expect(space.isVisible(2)).toBeFalse();
  });

  it('deals 20 cards in every level and 40 cards in Super', () => {
    for (const level of LEVELS) {
      const deck = buildDeck(level);
      expect(deck.length).toBe(20);
      expect(deck.filter(card => !card.pair).map(card => card.kind))
        .toEqual(level.world === 'space' ? ['shield', 'satellite'] : ['potion', 'seer']);
    }
    const superDeck = buildDeck(SUPER_LEVEL, 'en');
    expect(superDeck.length).toBe(40);
    expect(superDeck.filter(card => !card.pair).map(card => card.kind)).toEqual(['potion', 'shield', 'seer', 'abracadabra']);
    expect(superDeck.find(card => card.name === 'Vampire')?.line).toBe('Five more minutes!');
  });

  it('blocks a double attack once and does not waste the shield on two items', () => {
    const space = new MemoGame(buildDeck(LEVELS[5]), () => 0, 'es', DAMAGE[3]);
    space.flip(18);
    space.flip(1);
    space.flip(3);
    expect(space.shieldReady).toBeTrue();
    space.finishReveal();
    space.flip(0);
    space.flip(2);
    expect(space.blockedHit).toBeTrue();
    expect(space.shieldReady).toBeFalse();
    expect(space.lives).toBe(10);
    space.finishReveal();
    space.flip(0);
    space.flip(2);
    expect(space.lives).toBe(7);
  });

  it('lets Abracadabra resolve the last pair without damage or a stranded selection', () => {
    const superGame = new MemoGame(buildDeck(SUPER_LEVEL), () => 0);
    for (let i = 0; i < (superGame.targetPairs - 1) * 2; i++) superGame.flip(i);
    superGame.flip(34);
    superGame.flip(39);
    expect(superGame.won).toBeTrue();
    expect(superGame.open).toEqual([]);
    expect(superGame.removed.has(34) && superGame.removed.has(35)).toBeTrue();
    expect(superGame.lives).toBe(10);
  });
});
