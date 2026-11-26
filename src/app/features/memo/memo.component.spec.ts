import { fakeAsync, tick } from '@angular/core/testing';
import { buildDeck, DECK, MemoGame } from './memo-game';
import { MemoComponent } from './memo.component';

describe('Monstruomemo feedback', () => {
  let component: MemoComponent;
  let sound: jasmine.Spy;

  beforeEach(() => {
    spyOn(Storage.prototype, 'getItem').and.returnValue(null);
    spyOn(Storage.prototype, 'setItem');
    component = new MemoComponent();
    component.game = new MemoGame([...DECK], () => 0);
    sound = spyOn(component.audio, 'play');
  });
  afterEach(() => component.ngOnDestroy());

  it('shows a double hit and plays its cue only for a valid mismatch', fakeAsync(() => {
    component.flip(0);
    component.flip(2);
    expect(component.effect).toEqual(jasmine.objectContaining({ kind: 'damage', amount: 2 }));
    expect(sound.calls.allArgs()).toEqual([['flip'], ['doubleHit']]);
    component.flip(1);
    expect(sound).toHaveBeenCalledTimes(2);
    tick(1000);
    expect(component.effect).toBeNull();
    tick(700);
    expect(component.game.locked).toBeFalse();
  }));

  it('shows how many lives the potion restored and clears its effect on reset', fakeAsync(() => {
    component.game.lives = 4;
    component.flip(18);
    expect(component.effect).toEqual(jasmine.objectContaining({ kind: 'heal', amount: 6 }));
    expect(sound).toHaveBeenCalledOnceWith('heal');
    component.reset();
    expect(component.effect).toBeNull();
    tick(1000);
    expect(component.game.lives).toBe(10);
  }));

  it('reports zero healing honestly when lives are already full', fakeAsync(() => {
    component.flip(18);
    expect(component.effect).toEqual(jasmine.objectContaining({ kind: 'heal', amount: 0 }));
    tick(1000);
  }));

  it('does not show a hit or heal when both cards are objects', fakeAsync(() => {
    component.flip(1);
    component.flip(3);
    expect(component.effect).toBeNull();
    expect(sound).toHaveBeenCalledWith('miss');
    tick(1700);
  }));

  it('unlocks the space world and Super only after the third Earth level', () => {
    expect(component.superUnlocked).toBeFalse();
    component.selectLevel(2);
    expect(component.levelIndex).toBe(0);
    for (let level = 0; level < 3; level++) {
      component.game = new MemoGame(buildDeck(component.level));
      for (let card = 0; card < component.game.targetPairs * 2; card++) component.flip(card);
      if (level < 2) {
        expect(component.superUnlocked).toBeFalse();
        component.advance();
      }
    }
    expect(component.superUnlocked).toBeTrue();
    expect(component.isUnlocked(3)).toBeTrue();
    component.selectSuper();
    expect(component.game.deck.length).toBe(40);
  });
});
