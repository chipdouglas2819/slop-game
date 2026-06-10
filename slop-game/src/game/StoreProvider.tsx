import { useEffect, useReducer, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Decimal from 'break_infinity.js'
import { reduce } from './engine/state'
import { loadGame, saveGame } from './engine/persistence'
import { StoreContext } from './store'

const TICK_INTERVAL_MS = 100 // 10Hz — smooth enough for UI, easy on mobile CPU
const SAVE_INTERVAL_MS = 5000

interface Boot {
  state: ReturnType<typeof loadGame>['state']
  offlineMs: number
  offlineEarned: Decimal
}

// Load + apply the offline catch-up tick SYNCHRONOUSLY at init, so we can
// report exactly what was earned while away (and the first paint is already
// caught up — no flash of stale numbers).
function boot(): Boot {
  const now = Date.now()
  const loaded = loadGame(now)
  if (loaded.offlineMs > 1000) {
    const ticked = reduce(loaded.state, { type: 'TICK', now })
    return {
      state: ticked,
      offlineMs: loaded.offlineMs,
      offlineEarned: ticked.money.minus(loaded.state.money),
    }
  }
  return { state: loaded.state, offlineMs: loaded.offlineMs, offlineEarned: new Decimal(0) }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(boot)
  const [state, dispatch] = useReducer(reduce, initial.state)
  const [offlineMs, setOfflineMs] = useState(initial.offlineMs)

  // Game tick loop — setInterval (not rAF) so it keeps running when the tab
  // is backgrounded or the preview iframe isn't actively repainting.
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK', now: Date.now() }), TICK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  // Save loop — reads the latest state through a ref. Keying these effects on
  // [state] tore the interval down on every 100ms tick, so the periodic save
  // NEVER fired in an active tab (it only ever ran in throttled background
  // tabs); a crash without a pagehide event lost the whole session.
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    const id = setInterval(() => saveGame(stateRef.current), SAVE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  // Save on tab hide / pagehide for mobile reliability
  useEffect(() => {
    const onHide = () => saveGame(stateRef.current)
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onHide)
    }
  }, [])

  return (
    <StoreContext.Provider
      value={{
        state,
        dispatch,
        offlineMs,
        offlineEarned: initial.offlineEarned,
        clearOfflineMs: () => setOfflineMs(0),
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}
