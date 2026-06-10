import { useStore } from '../store'
import { PageCard } from './PageCard'
import { LockedSlotCard } from './LockedSlotCard'
import { ScandalInterrupt } from './ScandalInterrupt'
import { PrestigeBanner } from './PrestigeBanner'
import { AftermathBanner } from './AftermathBanner'

// The single Feed scroll (§10) — banners + page cards + the next-slot teaser.
// A scandal interrupt (when armed) pins to the top of the Feed. The
// LockedSlotCard is hidden until the player owns a producing unit, so screen 0
// stays as quiet as possible.
export function Feed() {
  const { state } = useStore()
  const hasAnyUnit = state.pages.some((p) => p.units > 0)
  return (
    <main className="max-w-md mx-auto px-3 py-3 space-y-3 pb-24">
      <PrestigeBanner />
      {state.activeScandal && <ScandalInterrupt />}
      <AftermathBanner />
      {state.pages.map((_, i) => (
        <PageCard key={i} pageIdx={i} />
      ))}
      {hasAnyUnit && <LockedSlotCard />}
    </main>
  )
}
