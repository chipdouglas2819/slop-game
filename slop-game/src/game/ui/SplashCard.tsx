import { useStore } from '../store'

// First-launch identity card — the game introduces itself before the first
// buy, then never again. (The page previously opened on "$0" and a lone card
// with no title anywhere.)
export function SplashCard() {
  const { state } = useStore()
  const brandNew =
    state.algorithmUpdatesCompleted === 0 &&
    !state.progression.firstTapDone &&
    state.pages[0]?.units === 0
  if (!brandNew) return null

  return (
    <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 px-5 py-6 text-center">
      <div className="text-5xl font-black tracking-tight bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
        SLOP
      </div>
      <div className="text-xs text-zinc-400 italic mt-2">
        an idle game where the gameplay is the moral compromise
      </div>
      <div className="text-[11px] text-zinc-600 mt-3 leading-snug">
        <span className="text-zinc-400">slop</span> <em>(n.)</em> — content mindlessly generated
        and thrust upon someone who didn't ask for it.
        <span className="text-zinc-700"> (Simon Willison, 2024)</span>
      </div>
      <div className="text-[11px] text-zinc-500 mt-3">
        You are not making bad art. You are forcing it on people who never asked. 👇
      </div>
    </div>
  )
}
