import { useStore } from '../store'
import { PAGE_SLOTS, PLATFORMS } from '../engine/data'
import { fmtMoney, fmtNumber } from '../format'

// Teaser for the next locked page. Shows BOTH unlock requirements (cash AND
// lifetime views) with met/unmet ticks, so the button is never a dead end.
export function LockedSlotCard() {
  const { state, dispatch } = useStore()
  const next = PAGE_SLOTS.find((s) => !state.unlockedSlots.includes(s.id))
  if (!next) return null
  const needCash = next.unlock.cash ?? 0
  const needE = next.unlock.lifetimeE ?? 0
  const cashOk = state.money.gte(needCash)
  const eOk = state.lifetimeE.gte(needE)
  const canUnlock = cashOk && eOk

  return (
    <button
      disabled={!canUnlock}
      onClick={() => canUnlock && dispatch({ type: 'UNLOCK_SLOT', slotId: next.id })}
      className={`w-full text-left bg-zinc-900/30 border border-dashed rounded-2xl p-4 ${
        canUnlock
          ? 'border-fuchsia-600 hover:bg-fuchsia-900/20 cursor-pointer animate-pulse'
          : 'border-zinc-800 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg shrink-0 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg">
          {canUnlock ? '✨' : '🔒'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[9px] uppercase tracking-wider text-zinc-500">
            {PLATFORMS[next.platform].name}
          </div>
          <div className="text-zinc-300 font-medium truncate leading-tight">{next.name}</div>
          <div className="text-[11px] mt-1 space-y-0.5">
            <div className={cashOk ? 'text-emerald-400' : 'text-zinc-500'}>
              {cashOk ? '✓' : '•'} {fmtMoney(needCash)} saved
            </div>
            {needE > 0 && (
              <div className={eOk ? 'text-emerald-400' : 'text-zinc-500'}>
                {eOk ? '✓' : '•'} {fmtNumber(needE)} lifetime views
              </div>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] uppercase font-semibold tracking-wider">
            {canUnlock ? <span className="text-fuchsia-300">Open it →</span> : <span className="text-zinc-600">Locked</span>}
          </div>
        </div>
      </div>
    </button>
  )
}
