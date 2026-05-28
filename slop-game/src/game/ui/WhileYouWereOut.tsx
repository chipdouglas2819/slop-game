import { useStore } from '../store'
import { fmtMoney, fmtSeconds } from '../format'
import Decimal from 'break_infinity.js'

// The "While You Were Out" celebratory return card (§9, idle-canon Content
// Summary). Phase 1: shows offline duration + cash earned during that window.
export function WhileYouWereOut() {
  const { state, offlineMs, clearOfflineMs } = useStore()
  if (offlineMs < 15_000) return null // not worth a modal for sub-15s gaps

  const seconds = Math.floor(offlineMs / 1000)
  // money grew during the offline tick — we don't have a "before" snapshot in
  // Phase 1, so we show duration + total cash + a flavor line.

  return (
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-sm w-full p-5 space-y-3">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500">
          While you were out — {fmtSeconds(seconds)}
        </div>
        <div className="text-zinc-100 leading-snug">
          Your slop empire kept running. The bots got a little lonelier.
        </div>
        <div className="bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-sm text-zinc-200">
          Treasury: {fmtMoney(state.money instanceof Decimal ? state.money : new Decimal(state.money))}
        </div>
        <button
          onClick={clearOfflineMs}
          className="w-full bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-semibold rounded-lg py-2"
        >
          Get back to work
        </button>
      </div>
    </div>
  )
}
