import { useStore } from '../store'
import { PageCard } from './PageCard'
import { LockedSlotCard } from './LockedSlotCard'

// The single Feed scroll (§10) — page cards + a teaser for the next slot.
export function Feed() {
  const { state } = useStore()
  return (
    <main className="max-w-md mx-auto px-3 py-3 space-y-3 pb-24">
      {state.pages.map((_, i) => (
        <PageCard key={i} pageIdx={i} />
      ))}
      <LockedSlotCard />
      <FreshStartHint show={state.pages.length === 1 && state.pages[0].units === 0} />
    </main>
  )
}

function FreshStartHint({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="text-center text-xs text-zinc-500 italic px-6 py-4">
      Tap a chip to retune. Tap{' '}
      <span className="text-zinc-300 font-mono">Buy ×1 (free)</span> on Comment Spam to print
      your first engagement.
    </div>
  )
}
