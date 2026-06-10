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
  const isRebuild = state.algorithmUpdatesCompleted > 0

  let msg: string | null = null
  if (isRebuild) {
    // Post-prestige runs: the player knows the loop — never replay the
    // tutorial. One rebuild-framing hint until production restarts, then quiet.
    if (!hasUnit) {
      const mult = 1 + 0.02 * state.slopTokens
      msg = `⚡ Rebuild time. Your ${state.slopTokens} tokens multiply everything ×${mult.toFixed(2)} — this run will be faster.`
    }
  } else if (!hasUnit) {
    msg = '👇 Tap “Buy ×1 (free)” to start your first page.'
  } else if (!hasTapped) {
    msg = '👇 Tap the big Publish button to earn your first dollars.'
  } else if (!hasManager) {
    msg = 'Buy more copies to earn faster. Then hire a Manager so the page posts by itself.'
  } else if (!state.progression.topicChipUnlocked) {
    // edge case — managers always unlock the Topic chip in BUY_MANAGER reducer
    msg = null
  } else if (state.progression.topicChipUnlocked && state.pages.length === 1) {
    msg = '🔥 See "hot now" up top? Tap the Topic chip and pick one that matches — it pays a bonus. Posting the same thing too long wears it out (watch "Freshness").'
  }

  if (!msg) return null

  return (
    <div className="max-w-md mx-auto px-3 mt-3">
      {/* min-height reserves two lines so hint changes don't shift the layout
          under the player's finger mid-tap */}
      <div className="min-h-[3.25rem] flex items-center bg-fuchsia-950/60 border border-fuchsia-800 rounded-xl px-3 py-2 text-xs text-fuchsia-100">
        {msg}
      </div>
    </div>
  )
}
