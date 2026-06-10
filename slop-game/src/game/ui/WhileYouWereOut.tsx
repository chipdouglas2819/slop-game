import { useStore } from '../store'
import { fmtMoney, fmtSeconds } from '../format'

// The "While You Were Out" return card (§9, idle-canon Content Summary).
// Rules learned in playtest:
//  - only for REAL absences (4+ min) — a tab refresh is not a homecoming
//  - never on top of an active scandal (that's the urgent thing)
//  - lead with what was EARNED while away; don't claim "kept running" when
//    nothing could run (no managers yet)
const MIN_ABSENCE_MS = 4 * 60 * 1000

export function WhileYouWereOut() {
  const { state, offlineMs, offlineEarned, clearOfflineMs } = useStore()
  if (offlineMs < MIN_ABSENCE_MS) return null
  if (state.activeScandal) return null // the scandal interrupt takes priority

  const seconds = Math.floor(offlineMs / 1000)
  const ranOffline = offlineEarned.gt(0)

  return (
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-sm w-full p-5 space-y-3">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500">
          While you were out — {fmtSeconds(seconds)}
        </div>
        {ranOffline ? (
          <>
            <div className="text-zinc-100 leading-snug">
              Your slop empire kept running. The bots got a little lonelier.
            </div>
            <div className="bg-emerald-950/50 border border-emerald-800 rounded-lg px-3 py-2 font-mono text-emerald-300 font-semibold">
              earned while away: +{fmtMoney(offlineEarned)}
            </div>
          </>
        ) : (
          <div className="text-zinc-100 leading-snug">
            Welcome back. Nothing ran while you were gone — hire a Manager and the slop posts
            itself, even while you sleep.
          </div>
        )}
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
