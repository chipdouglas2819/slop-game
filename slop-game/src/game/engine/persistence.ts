import Decimal from 'break_infinity.js'
import type { GameState } from './types'
import { initialState } from './state'

const STORAGE_KEY = 'slop.save.v1'

interface Serialized extends Omit<GameState, 'money' | 'engagements' | 'lifetimeE'> {
  money: string
  engagements: string
  lifetimeE: string
  __version: 1
}

function serialize(s: GameState): Serialized {
  return {
    ...s,
    money: s.money.toString(),
    engagements: s.engagements.toString(),
    lifetimeE: s.lifetimeE.toString(),
    __version: 1,
  }
}

function deserialize(s: Serialized): GameState {
  return {
    ...s,
    money: new Decimal(s.money),
    engagements: new Decimal(s.engagements),
    lifetimeE: new Decimal(s.lifetimeE),
  }
}

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(state)))
  } catch (err) {
    // Storage might be unavailable (private browsing, quota). Not fatal.
    console.warn('Save failed:', err)
  }
}

export function loadGame(now: number): { state: GameState; offlineMs: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { state: initialState(now), offlineMs: 0 }
    const parsed = JSON.parse(raw) as Serialized
    if (parsed.__version !== 1) return { state: initialState(now), offlineMs: 0 }
    const state = deserialize(parsed)
    const offlineMs = Math.max(0, now - state.lastTickAt)
    return { state, offlineMs }
  } catch (err) {
    console.warn('Load failed; starting fresh:', err)
    return { state: initialState(now), offlineMs: 0 }
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
