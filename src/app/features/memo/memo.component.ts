import { Component, OnDestroy } from '@angular/core';
import { MemoAudio } from './memo-audio';
import { buildDeck, Card, DAMAGE, MAX_LIVES, MemoGame, shuffle } from './memo-game';
import { Language, LEVELS, SUPER_LEVEL } from './memo-levels';
import { TEXT } from './memo-text';

const PROGRESS_KEY = 'monstruomemo.completed-levels';
const LANGUAGE_KEY = 'monstruomemo.language';

function restoreProgress(): number {
  try {
    const value = Number(localStorage.getItem(PROGRESS_KEY));
    if (Number.isInteger(value) && value >= 0 && value <= LEVELS.length) return value;
  } catch {
    // The campaign can also be played without browser storage.
  }
  return 0;
}

function restoreLanguage(): Language {
  try { if (localStorage.getItem(LANGUAGE_KEY) === 'en') return 'en'; } catch { /* Use the default. */ }
  return 'es';
}

interface ScreenEffect {
  id: number;
  kind: 'damage' | 'heal' | 'shield';
  amount: number;
}

@Component({
  standalone: true,
  selector: 'app-memo',
  templateUrl: './memo.component.html',
  styleUrls: ['./memo.component.scss', './memo-feedback.scss', './memo-campaign.scss'],
  host: { '[class.space-world]': "level.world === 'space'" }
})
export class MemoComponent implements OnDestroy {
  readonly levels = LEVELS;
  readonly superLevel = SUPER_LEVEL;
  readonly worlds = [
    { id: 'earth', icon: '🌍' },
    { id: 'space', icon: '🪐' }
  ] as const;
  readonly worldMaps = this.worlds.map(world => ({
    ...world,
    missions: LEVELS.map((level, index) => ({ level, index })).filter(({ level }) => level.world === world.id)
  }));
  language = restoreLanguage();
  home = true;
  completedLevels = restoreProgress();
  levelIndex = Math.min(this.completedLevels, this.levels.length - 1);
  game = this.newGame();
  effect: ScreenEffect | null = null;
  readonly audio = new MemoAudio();
  readonly hearts = Array.from({ length: MAX_LIVES }, (_, index) => index);
  private timer?: ReturnType<typeof setTimeout>;
  private effectTimer?: ReturnType<typeof setTimeout>;
  private effectId = 0;

  constructor() { this.setDocumentLanguage(); }

  get text() { return TEXT[this.language]; }
  get level() { return this.isSuper ? this.superLevel : this.levels[this.levelIndex]; }
  get isSuper(): boolean { return this.levelIndex === this.levels.length; }
  get superUnlocked(): boolean { return this.completedLevels >= 3; }
  get lastLevel(): boolean { return this.levelIndex === this.levels.length - 1; }

  powerHelp(kind: Card['kind']): string {
    switch (kind) {
      case 'potion': return this.text.healHelp;
      case 'shield': return this.text.shieldHelp;
      case 'seer': return this.text.seerHelp;
      case 'satellite': return this.text.scanHelp;
      case 'abracadabra': return this.text.spellHelp;
      default: return '';
    }
  }

  chooseLanguage(language: Language): void {
    if (this.language === language) return;
    this.language = language;
    this.setDocumentLanguage();
    try { localStorage.setItem(LANGUAGE_KEY, language); } catch { /* Language still changes. */ }
    this.reset();
  }

  private setDocumentLanguage(): void {
    if (typeof document !== 'undefined') document.documentElement.lang = this.language;
  }

  flip(index: number): void {
    if (!this.game.canFlip(index)) return;
    const { kind } = this.game.deck[index];
    const { lives, pairs } = this.game;
    const reveal = this.game.flip(index);
    if (reveal) {
      this.timer = setTimeout(() => this.game.finishReveal(), reveal === 'peek' ? this.level.scanMs : this.level.turnMs);
    }

    const delta = this.game.lives - lives;
    if (kind === 'potion') {
      this.showEffect('heal', delta);
      this.audio.play('heal');
    } else if (kind === 'seer' || kind === 'satellite') {
      this.audio.play('seer');
    } else if (kind === 'shield' || this.game.blockedHit) {
      if (this.game.blockedHit) this.showEffect('shield', 0);
      this.audio.play('shield');
    } else if (delta < 0) {
      this.showEffect('damage', -delta);
      this.audio.play(this.game.lost ? 'lose' : this.game.lastHitCount === 2 ? 'doubleHit' : 'hit');
    } else if (this.game.pairs > pairs) {
      if (this.game.won) this.saveCompletion();
      this.audio.play(this.game.won ? 'win' : kind === 'abracadabra' ? 'abracadabra' : 'match');
    } else {
      this.audio.play(reveal === 'turn' ? 'miss' : 'flip');
    }
  }

  isUnlocked(index: number): boolean {
    return Number.isInteger(index) && index >= 0 && index < this.levels.length && index <= this.completedLevels;
  }

  selectLevel(index: number): void {
    if (!this.isUnlocked(index) || index === this.levelIndex) return;
    this.levelIndex = index;
    this.reset();
  }

  selectSuper(): void {
    if (!this.superUnlocked || this.isSuper) return;
    this.levelIndex = this.levels.length;
    this.reset();
  }

  advance(): void {
    if (this.game.won && !this.lastLevel && !this.isSuper) this.selectLevel(this.levelIndex + 1);
  }

  reset(): void {
    clearTimeout(this.timer);
    clearTimeout(this.effectTimer);
    this.effect = null;
    this.audio.stop();
    this.game = this.newGame();
  }

  private newGame(): MemoGame {
    return new MemoGame(shuffle(buildDeck(this.level, this.language)), Math.random, this.language, DAMAGE[this.level.tier]);
  }

  private saveCompletion(): void {
    if (this.isSuper || this.levelIndex < this.completedLevels) return;
    this.completedLevels = this.levelIndex + 1;
    try {
      localStorage.setItem(PROGRESS_KEY, String(this.completedLevels));
    } catch {
      // Unlocks still work for the current session.
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    clearTimeout(this.effectTimer);
    this.audio.dispose();
  }

  private showEffect(kind: ScreenEffect['kind'], amount: number): void {
    clearTimeout(this.effectTimer);
    this.effect = { id: ++this.effectId, kind, amount };
    this.effectTimer = setTimeout(() => { this.effect = null; }, 1000);
  }
}
