import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { PageCard } from './PageCard'
import { LockedSlotCard } from './LockedSlotCard'
import { ScandalInterrupt } from './ScandalInterrupt'
import { PrestigeBanner } from './PrestigeBanner'
import { EraBanner } from './EraBanner'
import { AftermathBanner } from './AftermathBanner'
import { CrackdownBanner } from './CrackdownBanner'
import { SplashCard } from './SplashCard'
import { SlopCity } from './SlopCity'

// The single Feed scroll (§10). Two views of the same empire:
//   🏙 City  — Slop City + its dock; the map IS the game (default)
//   ☰ Pages — the classic card list (buy tiers, full stats)
// The city only takes over after the first manual payout has LANDED
// (firstTapDone + lifetimeE > 0) so the minute-0 card tutorial — splash, free
// unit, first Publish — never gets yanked out from under the player. Deriving
// the reveal from state every render also means HARD_RESET falls straight
// back to the tutorial.
export function Feed() {
  const { state } = useStore()
  const hasAnyUnit = state.pages.some((p) => p.units > 0)
  const [viewPref, setViewPref] = useState<'city' | 'pages'>(() => {
    try {
      return localStorage.getItem('slop.city.view') === 'pages' ? 'pages' : 'city'
    } catch {
      return 'city'
    }
  })
  const [pendingFocus, setPendingFocus] = useState<number | null>(null)

  const revealed = state.progression.firstTapDone && state.lifetimeE.gt(0)
  const view: 'city' | 'pages' = revealed ? viewPref : 'pages'

  // The dock's "full details →" handoff: switch view first, THEN fire the
  // focus event — PageCard's listeners attach in child effects, which run
  // before this parent effect, so the event can't be lost.
  useEffect(() => {
    if (pendingFocus == null || view !== 'pages') return
    window.dispatchEvent(new CustomEvent('slop:focus-page', { detail: { pageIdx: pendingFocus } }))
    setPendingFocus(null)
  }, [pendingFocus, view])

  function choose(v: 'city' | 'pages', persist = true) {
    setViewPref(v)
    if (persist) {
      try {
        localStorage.setItem('slop.city.view', v)
      } catch {
        // fine
      }
    }
  }

  // a details visit is a peek, not a preference — never persisted
  function openDetails(pageIdx: number) {
    choose('pages', false)
    setPendingFocus(pageIdx)
  }

  return (
    <main className="max-w-md mx-auto px-3 py-3 space-y-3 pb-24">
      <SplashCard />
      <EraBanner />
      <PrestigeBanner />
      {state.activeScandal && <ScandalInterrupt />}
      <AftermathBanner />
      <CrackdownBanner />

      {revealed && (
        <div className="flex gap-1 bg-zinc-900/70 border border-zinc-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => choose('city')}
            aria-pressed={view === 'city'}
            className={`flex-1 rounded-lg py-1.5 font-semibold ${
              view === 'city' ? 'bg-zinc-700 text-zinc-50' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            🏙 City
          </button>
          <button
            onClick={() => choose('pages')}
            aria-pressed={view === 'pages'}
            className={`flex-1 rounded-lg py-1.5 font-semibold ${
              view === 'pages' ? 'bg-zinc-700 text-zinc-50' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            ☰ Pages
          </button>
        </div>
      )}

      {revealed && view === 'city' ? (
        <SlopCity onOpenDetails={openDetails} />
      ) : (
        <>
          {state.pages.map((_, i) => (
            <PageCard key={i} pageIdx={i} />
          ))}
          {hasAnyUnit && <LockedSlotCard />}
        </>
      )}
    </main>
  )
}
