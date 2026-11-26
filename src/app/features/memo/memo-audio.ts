import { MEMO_SOUND_SLOTS, SoundCue } from './memo-sound-slots';

// Frequency in Hz, onset and duration in seconds.
type Note = readonly [pitch: number, at: number, length: number];
const TONES: Record<SoundCue, { wave: OscillatorType; notes: readonly Note[] }> = {
  flip: { wave: 'sine', notes: [[490, 0, .075]] },
  match: { wave: 'sine', notes: [[523, 0, .10], [784, .08, .15]] },
  miss: { wave: 'sine', notes: [[365, 0, .095], [300, .07, .10]] },
  hit: { wave: 'triangle', notes: [[148, 0, .16]] },
  doubleHit: { wave: 'triangle', notes: [[148, 0, .14], [118, .14, .19]] },
  heal: { wave: 'sine', notes: [[440, 0, .13], [587, .09, .13], [880, .18, .23]] },
  seer: { wave: 'sine', notes: [[740, 0, .16], [988, .11, .20]] },
  shield: { wave: 'triangle', notes: [[392, 0, .14], [587, .09, .22]] },
  abracadabra: { wave: 'sine', notes: [[988, 0, .09], [740, .08, .09], [1318, .15, .23]] },
  win: { wave: 'sine', notes: [[523, 0, .13], [659, .10, .13], [784, .20, .14], [1047, .30, .25]] },
  lose: { wave: 'triangle', notes: [[142, 0, .15], [247, .17, .16], [185, .30, .20]] }
};

export class MemoAudio {
  muted = false;
  private context?: AudioContext;
  private output?: GainNode;
  private player?: HTMLAudioElement;
  private playbackId = 0;
  private ready?: Promise<void>;

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) this.stop();
  }

  play(cue: SoundCue): void {
    if (this.muted) return;
    this.stop();
    const playbackId = this.playbackId;
    const fallback = () => this.playTone(cue, playbackId);
    // Unlock the fallback during the user gesture, not after a failed file load.
    this.unlock();
    const source = MEMO_SOUND_SLOTS[cue];
    if (!source || typeof Audio === 'undefined') {
      void fallback();
      return;
    }
    this.player = new Audio(source);
    this.player.volume = .5;
    void this.player.play().catch(fallback);
  }

  stop(): void {
    this.playbackId++;
    this.player?.pause();
    this.player = undefined;
    this.output?.disconnect();
    this.output = undefined;
  }

  dispose(): void {
    this.stop();
    if (this.context) void this.context.close().catch(() => undefined);
  }

  private unlock(): void {
    if (typeof AudioContext === 'undefined') return;
    try {
      const context = this.context ??= new AudioContext();
      this.ready = context.state === 'running' ? undefined : context.resume().catch(() => undefined);
    } catch {
      // Gameplay still works on devices without audio support.
    }
  }

  private async playTone(cue: SoundCue, playbackId: number): Promise<void> {
    try {
      if (this.ready) await this.ready;
      const context = this.context;
      if (this.muted || this.playbackId !== playbackId || context?.state !== 'running') return;
      const output = this.output = context.createGain();
      output.connect(context.destination);
      const time = context.currentTime;
      const { wave, notes } = TONES[cue];
      for (const [pitch, at, length] of notes) {
        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        const start = time + at;
        oscillator.type = wave;
        oscillator.frequency.value = pitch;
        oscillator.connect(envelope);
        envelope.connect(output);
        envelope.gain.setValueAtTime(.001, start);
        envelope.gain.exponentialRampToValueAtTime(.13, start + .012);
        envelope.gain.exponentialRampToValueAtTime(.001, start + length);
        oscillator.start(start);
        oscillator.stop(start + length);
      }
    } catch {
      // Audio can be disabled by the browser; it must never block play.
    }
  }
}
