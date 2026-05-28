import { useStore } from '../store'

// Tiny floating hint that advances as the player completes each step.
// Single line; fades on dismissal. Designed to never be in the way.
export function Onboarding() {
  const { state } = useStore()
  const p = state.pages[0] // Comment Spam — the always-starter
  if (!p) return null

  const hasUnit = p.units > 0
  const hasTapped = state.progression.firstTapDone
  const hasManager = p.manager

  let msg: string | null = null
  if (!hasUnit) {
    msg = 'Tap “Buy ×1 (free)” to take ownership of your first page.'
  } else if (!hasTapped) {
    msg = 'Tap the big Publish button — print your first engagement.'
  } else if (!hasManager) {
    msg = 'Buy more units, then hire the Account Manager so it runs itself.'
  } else if (!state.progression.topicChipUnlocked) {
    // edge case — managers always unlock the Topic chip in BUY_MANAGER reducer
    msg = null
  } else if (state.progression.topicChipUnlocked && state.pages.length === 1) {
    msg = 'The Algorithm has tags. Match them — and watch the niche burn out.'
  }

  if (!msg) return null

  return (
    <div className="max-w-md mx-auto px-3 mt-3">
      <div className="bg-fuchsia-950/60 border border-fuchsia-800 rounded-xl px-3 py-2 text-xs text-fuchsia-100">
        {msg}
      </div>
    </div>
  )
}
