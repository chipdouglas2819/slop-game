import { useStore } from '../store'
import { PAGE_SLOTS, PLATFORMS } from '../engine/data'
import { fmtMoney } from '../format'

// Shows the next not-yet-unlocked page slot as a teaser card. Unlocks happen
// automatically once the cash threshold is met (the player needn't dispatch).
export function LockedSlotCard() {
  const { state, dispatch } = useStore()
  const next = PAGE_SLOTS.find((s) => !state.unlockedSlots.includes(s.id))
  if (!next) return null
  const need = next.unlock.cash ?? 0
  const canUnlock = state.money.gte(need)

  return (
    <button
      disabled={!canUnlock}
      onClick={() =>
        canUnlock && dispatch({ type: 'UNLOCK_SLOT', slotId: next.id })
      }
      className={`w-full text-left bg-zinc-900/30 border border-dashed rounded-2xl p-4 ${
        canUnlock
          ? 'border-fuchsia-700 hover:bg-fuchsia-900/20 cursor-pointer'
          : 'border-zinc-800 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg shrink-0 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 text-xs font-bold">
          ?
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-zinc-300 font-medium truncate">{next.name}</span>
            <span className="text-[10px] uppercase text-zinc-500 tracking-wider shrink-0">
              {PLATFORMS[next.platform].shortName}
            </span>
          </div>
          <div className="text-xs text-zinc-500 italic mt-0.5">
            {next.flavor ?? 'Locked.'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase text-zinc-500">
            {canUnlock ? 'Acquire' : 'Need'}
          </div>
          <div className="font-mono text-sm text-zinc-200">{fmtMoney(need)}</div>
        </div>
      </div>
    </button>
  )
}
