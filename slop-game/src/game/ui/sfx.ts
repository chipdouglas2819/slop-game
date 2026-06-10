// Synthesized sound effects — Web Audio, no asset files. Every sound is a few
// oscillator notes with quick envelopes, kept short and quiet (game-feel, not
// noise). Browsers block audio until a user gesture, so the context lazily
// resumes on the first pointer/key event.

type SfxName =
  | 'tap' // publish button press
  | 'payout' // coin blip on a completed manual publish
  | 'buy' // unit purchase
  | 'milestone' // 25/50/100… crossing fanfare
  | 'manager' // manager hired chime
  | 'achievement' // achievement unlocked ding
  | 'scandal' // Goes Mainstream stinger
  | 'resolve' // scandal resolved
  | 'prestige' // Algorithm Update sweep
  | 'unlock' // new page slot opened
  | 'kaching' // fake store purchase
  | 'uiOpen' // sheet/modal open tick

const MUTE_KEY = 'slop.sound.muted'

let ctx: AudioContext | null = null
let muted = false
try {
  muted = localStorage.getItem(MUTE_KEY) === '1'
} catch {
  // storage unavailable — default unmuted
}

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

// Wake the context on the first gesture anywhere (autoplay policy).
if (typeof window !== 'undefined') {
  const wake = () => ensureCtx()
  window.addEventListener('pointerdown', wake, { once: true, capture: true })
  window.addEventListener('keydown', wake, { once: true, capture: true })
}

export function isMuted(): boolean {
  return muted
}

export function setMuted(m: boolean): void {
  muted = m
  try {
    localStorage.setItem(MUTE_KEY, m ? '1' : '0')
  } catch {
    // ignore
  }
}

interface Note {
  freq: number
  at: number // seconds from now
  dur: number
  type?: OscillatorType
  gain?: number
  sweepTo?: number // glide the frequency to this over dur
}

function play(notes: Note[]): void {
  if (muted) return
  const c = ensureCtx()
  if (!c || c.state !== 'running') return
  const t0 = c.currentTime
  for (const n of notes) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = n.type ?? 'sine'
    osc.frequency.setValueAtTime(n.freq, t0 + n.at)
    if (n.sweepTo) osc.frequency.exponentialRampToValueAtTime(n.sweepTo, t0 + n.at + n.dur)
    const peak = n.gain ?? 0.08
    g.gain.setValueAtTime(0, t0 + n.at)
    g.gain.linearRampToValueAtTime(peak, t0 + n.at + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.dur)
    osc.connect(g)
    g.connect(c.destination)
    osc.start(t0 + n.at)
    osc.stop(t0 + n.at + n.dur + 0.02)
  }
}

const SOUNDS: Record<SfxName, Note[]> = {
  tap: [{ freq: 660, at: 0, dur: 0.05, type: 'square', gain: 0.04 }],
  payout: [
    { freq: 1318, at: 0, dur: 0.07, gain: 0.06 },
    { freq: 1760, at: 0.06, dur: 0.09, gain: 0.06 },
  ],
  buy: [
    { freq: 330, at: 0, dur: 0.07, type: 'triangle', gain: 0.07 },
    { freq: 440, at: 0.05, dur: 0.08, type: 'triangle', gain: 0.06 },
  ],
  milestone: [
    { freq: 523, at: 0, dur: 0.09, gain: 0.08 },
    { freq: 659, at: 0.08, dur: 0.09, gain: 0.08 },
    { freq: 784, at: 0.16, dur: 0.09, gain: 0.08 },
    { freq: 1047, at: 0.24, dur: 0.22, gain: 0.09 },
  ],
  manager: [
    { freq: 660, at: 0, dur: 0.3, gain: 0.05 },
    { freq: 990, at: 0.02, dur: 0.34, gain: 0.05 },
  ],
  achievement: [
    { freq: 1175, at: 0, dur: 0.09, gain: 0.07 },
    { freq: 1568, at: 0.09, dur: 0.16, gain: 0.07 },
  ],
  scandal: [
    { freq: 311, at: 0, dur: 0.3, type: 'sawtooth', gain: 0.05, sweepTo: 165 },
    { freq: 233, at: 0.16, dur: 0.3, type: 'sawtooth', gain: 0.05, sweepTo: 117 },
  ],
  resolve: [
    { freq: 784, at: 0, dur: 0.08, gain: 0.06 },
    { freq: 988, at: 0.07, dur: 0.12, gain: 0.06 },
  ],
  prestige: [
    { freq: 220, at: 0, dur: 0.5, type: 'sawtooth', gain: 0.05, sweepTo: 1320 },
    { freq: 523, at: 0.4, dur: 0.25, gain: 0.07 },
    { freq: 659, at: 0.42, dur: 0.27, gain: 0.07 },
    { freq: 784, at: 0.44, dur: 0.3, gain: 0.07 },
  ],
  unlock: [
    { freq: 1568, at: 0, dur: 0.07, gain: 0.06 },
    { freq: 2093, at: 0.06, dur: 0.12, gain: 0.06 },
  ],
  kaching: [
    { freq: 1397, at: 0, dur: 0.08, gain: 0.07 },
    { freq: 1760, at: 0.02, dur: 0.1, gain: 0.07 },
    { freq: 2349, at: 0.1, dur: 0.16, gain: 0.06 },
  ],
  uiOpen: [{ freq: 880, at: 0, dur: 0.04, type: 'square', gain: 0.03 }],
}

export function sfx(name: SfxName): void {
  try {
    play(SOUNDS[name])
  } catch {
    // audio is never worth crashing the game over
  }
}
