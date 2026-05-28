import { useStore } from '../store'
import { PageCard } from './PageCard'
import { LockedSlotCard } from './LockedSlotCard'

// The single Feed scroll (§10) — page cards + a teaser for the next slot.
// The LockedSlotCard is hidden until the player owns at least one producing
// unit, so screen 0 stays as quiet as possible.
export function Feed() {
  const { state } = useStore()
  const hasAnyUnit = state.pages.some((p) => p.units > 0)
  return (
    <main className="max-w-md mx-auto px-3 py-3 space-y-3 pb-24">
      {state.pages.map((_, i) => (
        <PageCard key={i} pageIdx={i} />
      ))}
      {hasAnyUnit && <LockedSlotCard />}
    </main>
  )
}
