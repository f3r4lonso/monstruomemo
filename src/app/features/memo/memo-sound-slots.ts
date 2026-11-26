export type SoundCue = 'flip' | 'match' | 'miss' | 'hit' | 'doubleHit' | 'heal' | 'seer' | 'shield' | 'abracadabra' | 'win' | 'lose';

// Replace null with a local URL such as 'assets/audio/memo/hit.mp3'.
// An empty slot, missing file or unreadable file uses the generated sound.
export const MEMO_SOUND_SLOTS: Readonly<Record<SoundCue, string | null>> = {
  flip: null,
  match: null,
  miss: null,
  hit: null,
  doubleHit: null,
  heal: null,
  seer: null,
  shield: null,
  abracadabra: null,
  win: null,
  lose: null
};
