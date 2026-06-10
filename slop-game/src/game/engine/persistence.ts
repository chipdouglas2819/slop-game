import Decimal from 'break_infinity.js'
import type { GameState } from './types'
import { initialState } from './state'

const STORAGE_KEY = 'slop.save.v1'

interface Serialized
  extends Omit<
    GameState,
    | 'money'
    | 'engagements'
    | 'lifetimeE'
    | 'progression'
    | 'pages'
    | 'monetization'
    | 'lastPrestigeGain'
    | 'lastEraJumpGain'
    | 'modelWeights'
    | 'eraJumps'
    | 'crackdown'
    | 'lifetimeEAtEraStart'
  > {
  money: string
  engagements: string
  lifetimeE: string
  lifetimeEAtEraStart?: string // optional — added after v1 shipped
  progression?: Partial<GameState['progression']> // optional — fields accrete over versions
  pages?: GameState['pages']
  monetization?: GameState['monetization'] // optional — added after v1 shipped
  lastPrestigeGain?: number | null // optional — added after v1 shipped
  lastEraJumpGain?: number | null // optional — added after v1 shipped
  modelWeights?: number // optional — added after v1 shipped
  eraJumps?: number // optional — added after v1 shipped
  crackdown?: GameState['crackdown'] // optional — added after v1 shipped
  __version: 1
}

function serialize(s: GameState): Serialized {
  return {
    ...s,
    money: s.money.toString(),
    engagements: s.engagements.toString(),
    lifetimeE: s.lifetimeE.toString(),
    lifetimeEAtEraStart: s.lifetimeEAtEraStart.toString(),
    __version: 1,
  }
}

function deserialize(s: Serialized): GameState {
  // Default-fill fields added after the save format was first written. Players
  // mid-session keep their progress; new fields just take their initial values.
  // Progression fields accrete over versions — default each one individually.
  // Old saves: a bought manager implies the Topic chip; veterans already past
  // a teaching beat skip its flag.
  const lp = s.progression ?? {}
  const anyManager = (s.pages ?? []).some((p) => p.manager)
  const progression: GameState['progression'] = {
    topicChipUnlocked: lp.topicChipUnlocked ?? anyManager,
    tacticChipUnlocked: lp.tacticChipUnlocked ?? (s.algorithmUpdatesCompleted ?? 0) > 0,
    modelChipUnlocked: lp.modelChipUnlocked ?? (s.eraJumps ?? 0) > 0,
    firstTapDone: lp.firstTapDone ?? (s.pages ?? []).some((p) => p.units > 0),
    firstManagerBought: lp.firstManagerBought ?? anyManager,
    firstRetuneDone: lp.firstRetuneDone ?? lp.tacticChipUnlocked ?? false,
    firstScandalSeen: lp.firstScandalSeen ?? (s.scandalCooldownUntil ?? 0) > 0,
  }
  const pages = (s.pages ?? []).map((p) => ({
    ...p,
    cycleProgress: p.cycleProgress ?? 0,
  }))
  return {
    ...s,
    pages,
    progression,
    activeScandal: s.activeScandal ?? null,
    firedSignatureScandals: s.firedSignatureScandals ?? [],
    lastScandalResult: null,
    lastPrestigeGain: s.lastPrestigeGain ?? null,
    lastEraJumpGain: s.lastEraJumpGain ?? null,
    scandalCooldownUntil: s.scandalCooldownUntil ?? 0,
    modelWeights: s.modelWeights ?? 0,
    eraJumps: s.eraJumps ?? 0,
    lifetimeEAtEraStart: new Decimal(s.lifetimeEAtEraStart ?? '0'),
    crackdown: s.crackdown ?? null,
    monetization: s.monetization ?? {
      clout: 0,
      permanentMult: 1,
      boostUntilMs: 0,
      boostsToday: 0,
      boostDayStartMs: 0,
      spentRealCentsPretend: 0,
    },
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
